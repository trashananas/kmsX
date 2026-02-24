
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MessageSquare, ExternalLink, Trash2, ShoppingCart, RefreshCw, CheckCircle2, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReservationsPage() {
  const { user } = userUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'active';
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  // Активные брони из favorites
  const favoritesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'favorites'));
  }, [firestore, user]);

  // История завершенных покупок из chats
  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'chats'),
      where('buyerId', '==', user.uid),
      where('dealStatus', '==', 'completed')
    );
  }, [firestore, user]);

  const { data: allFavorites, isLoading: loadingFavs } = useCollection(favoritesQuery);
  const { data: purchaseHistory, isLoading: loadingHistory } = useCollection(historyQuery);
  
  const reservations = allFavorites?.filter(fav => (fav.reservedCount || 0) > 0) || [];

  const handleCancelReservation = async (res: any) => {
    if (!user) return;
    setIsActionLoading(res.id);
    try {
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

      const favRef = doc(firestore, 'users', user.uid, 'favorites', res.id);
      updateDocumentNonBlocking(favRef, {
        reservedCount: 0,
        updatedAt: new Date().toISOString()
      });

      const chatsRef = collection(firestore, 'chats');
      const chatSnap = await getDocs(query(chatsRef, where('itemId', '==', res.itemId), where('buyerId', '==', user.uid)));
      if (!chatSnap.empty) {
        const chatDoc = chatSnap.docs[0];
        updateDocumentNonBlocking(doc(firestore, 'chats', chatDoc.id), {
          lastMessage: 'Бронирование отменено покупателем',
          updatedAt: new Date().toISOString()
        });
        addDocumentNonBlocking(collection(firestore, 'chats', chatDoc.id, 'messages'), {
          senderId: 'system',
          text: `Покупатель отменил бронирование товара (${res.reservedCount} шт.)`,
          type: 'system',
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Бронь отменена" });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось отменить бронь." });
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
            Мои покупки
          </h1>
          <p className="text-muted-foreground">Управление активными бронями и история ваших покупок</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1 rounded-2xl mb-8">
          <TabsTrigger value="active" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Активные ({reservations.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">История ({purchaseHistory?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loadingFavs ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
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
                            <Badge className="bg-primary/10 text-primary border-none px-3 py-1">
                              В брони: {res.reservedCount} шт.
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                            <Package className="w-4 h-4" />
                            <span>Состояние: {res.condition || 'не указано'}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            onClick={() => router.push(`/chats?itemId=${res.itemId}`)}
                            className="rounded-xl h-12 px-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            <MessageSquare className="w-4 h-4" /> Написать
                          </Button>
                          <Link href={`/items/${res.itemId}`}>
                            <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-primary/20 text-primary">
                              <ExternalLink className="w-4 h-4" /> Просмотреть
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleCancelReservation(res)}
                            disabled={isActionLoading === res.id}
                            className="rounded-xl h-12 px-6 gap-2 text-rose-500 hover:bg-rose-50 ml-auto"
                          >
                            {isActionLoading === res.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Отменить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
              <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Активных броней пока нет</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {loadingHistory ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
            </div>
          ) : purchaseHistory && purchaseHistory.length > 0 ? (
            <div className="grid gap-6">
              {purchaseHistory.map((chat) => (
                <Card key={chat.id} className="rounded-[2.5rem] border-none shadow-sm bg-white grayscale-[0.5] overflow-hidden">
                  <CardContent className="p-0 flex flex-col sm:flex-row items-center">
                    <div className="relative w-full sm:w-32 h-32 shrink-0 m-4 rounded-2xl overflow-hidden shadow-sm">
                      <Image src={chat.itemImage || 'https://picsum.photos/seed/1/400/400'} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{chat.itemTitle}</h3>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary">{chat.price} ₽</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Куплено</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Сделка завершена</span>
                        <span>•</span>
                        <span>Количество: {chat.quantity || 1} шт.</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
              <HistoryIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">История покупок пуста</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
