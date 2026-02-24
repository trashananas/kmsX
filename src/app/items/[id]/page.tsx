
"use client";

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  MapPin, 
  Tag, 
  User, 
  Trash2, 
  MessageCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Package,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useDoc, 
  useFirestore, 
  useUser, 
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  useMemoFirebase
} from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const [reserveCount, setReserveCount] = useState(1);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const itemRef = useMemoFirebase(() => doc(firestore, 'item_listings', id), [firestore, id]);
  const { data: item, isLoading } = useDoc(itemRef as any);

  const categoryRef = useMemoFirebase(() => 
    item?.categoryId ? doc(firestore, 'categories', item.categoryId) : null
  , [firestore, item?.categoryId]);
  const { data: category } = useDoc(categoryRef as any);

  const availableQuantity = item 
    ? (typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1) 
    : 0;

  const getOrCreateChat = async () => {
    if (!user || !item) return;
    setIsChatLoading(true);
    try {
      const chatsRef = collection(firestore, 'chats');
      const q = query(chatsRef, where('itemId', '==', item.id), where('buyerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      let chatId;
      if (snapshot.empty) {
        const newChat = await addDocumentNonBlocking(chatsRef, {
          itemId: item.id,
          itemTitle: item.title,
          itemImage: item.imageUrls?.[0] || '',
          buyerId: user.uid,
          sellerId: item.ownerId,
          status: 'active',
          dealStatus: 'pending',
          lastMessage: '',
          updatedAt: new Date().toISOString()
        });
        chatId = (newChat as any).id;
      } else {
        chatId = snapshot.docs[0].id;
      }
      router.push(`/chats/${chatId}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось открыть чат." });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDelete = () => {
    if (!item || !user || item.ownerId !== user.uid) return;
    deleteDocumentNonBlocking(itemRef as any);
    toast({ title: "Объявление удалено" });
    router.push('/items');
  };

  const handleReserve = async () => {
    if (!item || !user || reserveCount <= 0 || reserveCount > availableQuantity) return;

    updateDocumentNonBlocking(itemRef as any, {
      quantity: availableQuantity - reserveCount,
      updatedAt: new Date().toISOString()
    });

    const favRef = doc(firestore, 'users', user.uid, 'favorites', item.id);
    setDocumentNonBlocking(favRef, {
      itemId: item.id,
      title: item.title,
      imageUrl: item.imageUrls?.[0] || '',
      condition: item.condition || '',
      locationName: item.locationName || '',
      reservedCount: (item.reservedCount || 0) + reserveCount,
      createdAt: new Date().toISOString()
    }, { merge: true });

    // Инициализация чата с системным сообщением
    const chatsRef = collection(firestore, 'chats');
    const newChatRef = await addDocumentNonBlocking(chatsRef, {
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.imageUrls?.[0] || '',
      buyerId: user.uid,
      sellerId: item.ownerId,
      status: 'active',
      dealStatus: 'pending',
      lastMessage: `Забронировано: ${reserveCount} шт.`,
      updatedAt: new Date().toISOString()
    });

    const msgCol = collection(firestore, 'chats', (newChatRef as any).id, 'messages');
    addDocumentNonBlocking(msgCol, {
      senderId: 'system',
      text: `${user.email} хочет приобрести товар: ${item.title} (${reserveCount} шт.)`,
      type: 'system',
      createdAt: new Date().toISOString()
    });

    toast({ title: "Забронировано!", description: "Чат с продавцом создан." });
    setIsReserveOpen(false);
    router.push(`/chats/${(newChatRef as any).id}`);
  };

  if (isLoading) return <div className="container p-8">Загрузка...</div>;
  if (!item) return <div className="container p-8">Товар не найден</div>;

  const isOwner = user && item.ownerId === user.uid;
  const isSoldOut = availableQuantity <= 0;

  return (
    <div className="container px-4 py-8 max-w-5xl mx-auto">
      <Link href="/items" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group w-fit">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Назад к списку
      </Link>

      <div className={`flex flex-col md:flex-row gap-12 bg-white p-8 rounded-[2.5rem] shadow-sm border ${isSoldOut ? 'border-destructive/50' : ''}`}>
        <div className="w-full md:w-1/2">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg">
            <Image src={item.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800'} alt={item.title} fill className="object-cover" priority />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className="bg-white/90 text-primary border-none px-4 py-1.5 shadow-sm font-bold backdrop-blur-md">{item.condition}</Badge>
              {isSoldOut && <Badge variant="destructive" className="px-4 py-1.5 shadow-sm font-bold uppercase animate-pulse">Кончился</Badge>}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1">{category?.name || 'Разное'}</Badge>
            </div>
            <h1 className="text-4xl font-headline font-bold mb-2 leading-tight">{item.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">{item.price > 0 ? `${item.price} ₽` : 'Бесплатно'}</span>
              <Badge variant="outline" className="rounded-lg gap-1.5 border-muted-foreground/20 text-muted-foreground">
                <Package className="w-3.5 h-3.5" /> В наличии: {availableQuantity} шт.
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{item.locationName}</div>
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{item.createdAt && format(new Date(item.createdAt), 'd MMMM yyyy', { locale: ru })}</div>
            </div>
          </div>

          <div className="p-6 bg-muted/30 rounded-2xl border border-dashed mb-10">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Описание</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="mt-auto flex gap-4">
            {isOwner ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 h-14 rounded-xl text-lg font-bold shadow-lg shadow-destructive/20">Удалить</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                    <AlertDialogDescription>Это действие необратимо.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" disabled={isSoldOut}>
                    {isSoldOut ? 'Закончился' : 'Забронировать'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <DialogHeader><DialogTitle>Бронирование</DialogTitle></DialogHeader>
                  <div className="py-6">
                    <Label>Количество</Label>
                    <Input type="number" min="1" max={availableQuantity} value={reserveCount} onChange={(e) => setReserveCount(parseInt(e.target.value))} className="h-12 rounded-xl mt-2" />
                  </div>
                  <DialogFooter><Button onClick={handleReserve} className="w-full h-14 rounded-xl font-bold">Подтвердить и начать чат</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {!isOwner && (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-xl border-2"
                onClick={getOrCreateChat}
                disabled={isChatLoading}
              >
                <MessageCircle className={`w-6 h-6 ${isChatLoading ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
