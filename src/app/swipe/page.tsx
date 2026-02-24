
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  Heart, 
  MessageCircle, 
  ShoppingCart, 
  Info, 
  ArrowLeft, 
  RefreshCw, 
  PackageOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser, 
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { collection, query, where, limit, doc, getDocs } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function XTokMode() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reserveCount, setReserveCount] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const tokQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'item_listings'), 
      where('status', '==', 'available'),
      where('quantity', '>', 0),
      limit(20)
    );
  }, [firestore, user]);

  const { data: rawItems, isLoading } = useCollection(tokQuery);
  const items = (rawItems || []).filter(item => !user || item.ownerId !== user.uid);

  const handleLike = useCallback((item: any) => {
    if (!user || !item) return;
    const favRef = doc(firestore, 'users', user.uid, 'favorites', item.id);
    setDocumentNonBlocking(favRef, {
      itemId: item.id,
      title: item.title,
      imageUrl: item.imageUrls?.[0] || '',
      condition: item.condition || '',
      createdAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Добавлено в лайки", duration: 1000 });
  }, [firestore, user]);

  const handleDoubleTap = (item: any) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleLike(item);
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
    setLastTap(now);
  };

  const handleReserve = async () => {
    if (!selectedItem || !user || reserveCount <= 0) return;
    
    const itemRef = doc(firestore, 'item_listings', selectedItem.id);
    updateDocumentNonBlocking(itemRef, {
      quantity: selectedItem.quantity - reserveCount,
      updatedAt: new Date().toISOString()
    });

    const chatsRef = collection(firestore, 'chats');
    const newChat = await addDocumentNonBlocking(chatsRef, {
      itemId: selectedItem.id,
      itemTitle: selectedItem.title,
      itemImage: selectedItem.imageUrls?.[0] || '',
      price: selectedItem.price || 0,
      quantity: reserveCount,
      buyerId: user.uid,
      sellerId: selectedItem.ownerId,
      status: 'active',
      dealStatus: 'pending',
      lastMessage: `Забронировано: ${reserveCount} шт.`,
      updatedAt: new Date().toISOString()
    });

    addDocumentNonBlocking(collection(firestore, 'chats', (newChat as any).id, 'messages'), {
      senderId: 'system',
      text: `Пользователь забронировал товар: ${selectedItem.title} (${reserveCount} шт.)`,
      type: 'system',
      createdAt: new Date().toISOString()
    });

    toast({ title: "Забронировано!" });
    setIsReserveOpen(false);
    router.push(`/chats/${(newChat as any).id}`);
  };

  const openChat = async (item: any) => {
    if (!user) return;
    const chatsRef = collection(firestore, 'chats');
    const q = query(chatsRef, where('itemId', '==', item.id), where('buyerId', '==', user.uid));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      router.push(`/chats/${snap.docs[0].id}`);
    } else {
      const newChat = await addDocumentNonBlocking(chatsRef, {
        itemId: item.id,
        itemTitle: item.title,
        itemImage: item.imageUrls?.[0] || '',
        price: item.price || 0,
        buyerId: user.uid,
        sellerId: item.ownerId,
        status: 'active',
        dealStatus: 'pending',
        lastMessage: '',
        updatedAt: new Date().toISOString()
      });
      router.push(`/chats/${(newChat as any).id}`);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <PackageOpen className="w-20 h-20 text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Лента пуста</h2>
        <p className="text-muted-foreground mb-8">Заходите позже, когда появятся новые вещи!</p>
        <Link href="/items">
          <Button className="rounded-2xl h-14 px-10 text-lg">В каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {/* Header Back Button */}
      <div className="fixed top-6 left-6 z-[60]">
        <Link href="/items">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 w-12 h-12">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {items.map((item) => (
        <div 
          key={item.id} 
          className="h-screen w-full relative snap-start flex items-center justify-center overflow-hidden"
          onClick={() => handleDoubleTap(item)}
        >
          {/* Background Image */}
          <Image 
            src={item.imageUrls?.[0] || 'https://picsum.photos/seed/1/600/800'} 
            alt={item.title} 
            fill 
            className="object-cover"
            priority
          />
          
          {/* Heart Animation for Double Tap */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <Heart className="w-32 h-32 text-white fill-white animate-ping opacity-70" />
            </div>
          )}

          {/* Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Info Overlay (Bottom Left) */}
          <div className="absolute bottom-10 left-6 right-20 text-white z-40">
            <Badge className="bg-primary/80 border-none mb-3 px-3 py-1 font-bold">
              {item.condition}
            </Badge>
            <h2 className="text-3xl font-black mb-2 drop-shadow-lg tracking-tight leading-none uppercase italic">
              {item.title}
            </h2>
            <p className="text-sm text-white/70 line-clamp-3 max-w-[80%] leading-relaxed">
              {item.description}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-black text-accent">{item.price > 0 ? `${item.price} ₽` : 'Бесплатно'}</span>
              <span className="text-xs opacity-50 font-bold uppercase tracking-widest">В наличии: {item.quantity}</span>
            </div>
          </div>

          {/* Action Panel (Right Side) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-50">
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={(e) => { e.stopPropagation(); handleLike(item); }}
                className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 hover:scale-110 active:scale-90 transition-all text-white p-0"
              >
                <Heart className="w-7 h-7" />
              </Button>
              <span className="text-[10px] font-bold text-white uppercase opacity-70">Лайк</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setIsReserveOpen(true); }}
                className="w-14 h-14 rounded-full bg-accent/90 backdrop-blur-xl hover:scale-110 active:scale-90 transition-all text-accent-foreground p-0 shadow-lg shadow-accent/20"
              >
                <ShoppingCart className="w-7 h-7" />
              </Button>
              <span className="text-[10px] font-bold text-white uppercase opacity-70">Бронь</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={(e) => { e.stopPropagation(); openChat(item); }}
                className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 hover:scale-110 active:scale-90 transition-all text-white p-0"
              >
                <MessageCircle className="w-7 h-7" />
              </Button>
              <span className="text-[10px] font-bold text-white uppercase opacity-70">Чат</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Link href={`/items/${item.id}`} onClick={(e) => e.stopPropagation()}>
                <Button className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 hover:scale-110 active:scale-90 transition-all text-white p-0">
                  <Info className="w-7 h-7" />
                </Button>
              </Link>
              <span className="text-[10px] font-bold text-white uppercase opacity-70">Инфо</span>
            </div>
          </div>
        </div>
      ))}

      {/* Reservation Dialog */}
      <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase">Бронирование</DialogTitle>
            <DialogDescription>Укажите количество для покупки. Мы сразу создадим чат с продавцом.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Сколько штук?</Label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl h-12 w-12"
                  onClick={() => setReserveCount(Math.max(1, reserveCount - 1))}
                >
                  <ChevronDown />
                </Button>
                <Input 
                  type="number" 
                  value={reserveCount} 
                  onChange={(e) => setReserveCount(parseInt(e.target.value))}
                  className="text-center text-xl font-bold h-12 rounded-xl"
                  min="1"
                  max={selectedItem?.quantity}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl h-12 w-12"
                  onClick={() => setReserveCount(Math.min(selectedItem?.quantity || 1, reserveCount + 1))}
                >
                  <ChevronUp />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleReserve} className="w-full h-14 rounded-2xl text-lg font-bold uppercase italic tracking-tighter">
              Подтвердить бронь
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
