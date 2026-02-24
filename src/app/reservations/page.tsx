
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MessageCircle, ExternalLink, Trash2, ShoppingCart, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ReservationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const reservationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'favorites')
    );
  }, [firestore, user]);

  const { data: allFavorites, isLoading } = useCollection(reservationsQuery);
  
  // Фильтруем только те, где reservedCount > 0 (аналог корзины)
  const reservations = allFavorites?.filter(fav => (fav.reservedCount || 0) > 0) || [];

  const handleCancelReservation = async (res: any) => {
    if (!user) return;
    setIsActionLoading(res.id);
    try {
      // 1. Возвращаем количество товару
      const itemRef = doc(firestore, 'item_listings', res.itemId);
      const snapshot = await getDocs(query(collection(firestore, 'item_listings'), where('__name__', '==', res.itemId)));
      if (!snapshot.empty) {
        const itemData = snapshot.docs[0].data();
        const currentQty = itemData.quantity || 0;
        updateDocumentNonBlocking(itemRef, {
          quantity: currentQty + (res.reservedCount || 1),
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Удаляем бронь из избранного/корзины (или обнуляем счетчик)
      const favRef = doc(firestore, 'users', user.uid, 'favorites', res.id);
      updateDocumentNonBlocking(favRef, {
        reservedCount: 0,
        updatedAt: new Date().toISOString()
      });

      // 3. Отправляем системное сообщение в чат
      const chatsRef = collection(firestore, 'chats');
      const chatSnap = await getDocs(query(chatsRef, where('itemId', '==', res.itemId), where('buyerId', '==', user.uid)));
      if (!chatSnap.empty) {
        const chatDoc = chatSnap.docs[0];
        const messagesRef = collection(firestore, 'chats', chatDoc.id, 'messages');
        updateDocumentNonBlocking(doc(firestore, 'chats', chatDoc.id), {
          lastMessage: 'Бронирование отменено покупателем',
          updatedAt: new Date().toISOString()
        });
        addDocumentNonBlocking(messagesRef, {
          senderId: 'system',
          text: `Покупатель отменил бронирование товара (${res.reservedCount} шт.)`,
          type: 'system',
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Бронь отменена", description: "Товар снова доступен для других." });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось отменить бронь." });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleGoToChat = async (res: any) => {
    if (!user) return;
    setIsActionLoading(res.id + '_chat');
    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(chatsRef, where('itemId', '==', res.itemId), where('buyerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        router.push(`/chats/${snapshot.docs[0].id}`);
      } else {
        toast({ title: "Чат не найден", description: "Попробуйте зайти через страницу товара." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось найти чат." });
    } finally {
      setIsActionLoading(null);
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto flex-1">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            Мои брони
          </h1>
          <p className="text-muted-foreground">Вещи, которые вы зарезервировали для покупки</p>
        </div>
        <Link href="/items">
          <Button variant="outline" className="rounded-xl">В каталог</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      ) : reservations.length > 0 ? (
        <div className="grid gap-6">
          {reservations.map((res) => (
            <Card key={res.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-48 shrink-0">
                    <Image 
                      src={res.imageUrl || 'https://picsum.photos/seed/1/400/400'} 
                      alt={res.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold truncate pr-4">{res.title}</h3>
                        <Badge className="bg-emerald-100 text-emerald-600 border-none px-3 py-1">
                          Забронировано: {res.reservedCount} шт.
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                        <Package className="w-4 h-4" />
                        <span>Состояние: {res.condition || 'не указано'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => handleGoToChat(res)}
                        disabled={isActionLoading === res.id + '_chat'}
                        className="rounded-xl h-12 px-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {isActionLoading === res.id + '_chat' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                        Написать
                      </Button>
                      <Link href={`/items/${res.itemId}`}>
                        <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-primary/20 text-primary">
                          <ExternalLink className="w-4 h-4" />
                          Просмотреть
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleCancelReservation(res)}
                        disabled={isActionLoading === res.id}
                        className="rounded-xl h-12 px-6 gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 ml-auto"
                      >
                        {isActionLoading === res.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Отменить бронь
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed">
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Броней пока нет</h2>
          <p className="text-muted-foreground mb-10 max-w-sm mx-auto">Ваша корзина пуста. Найдите что-нибудь интересное в каталоге kmsX!</p>
          <Link href="/items">
            <Button size="lg" className="rounded-2xl h-14 px-10 text-lg font-bold">Перейти к обзору</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
