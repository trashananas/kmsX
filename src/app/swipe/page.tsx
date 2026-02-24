"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Heart, Info, ArrowLeft, RefreshCw, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';

export default function SwipeMode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const swipeQuery = useMemoFirebase(() => {
    if (!user) return null;
    const baseRef = collection(firestore, 'item_listings');
    return query(
      baseRef, 
      where('status', '==', 'available'),
      where('quantity', '>', 0),
      limit(50)
    );
  }, [firestore, user]);

  const { data: rawItems, isLoading } = useCollection(swipeQuery);
  const items = (rawItems || []).filter(item => !user || item.ownerId !== user.uid);

  const handleLike = useCallback((item: any) => {
    if (!user || !item) return;
    
    const favRef = doc(firestore, 'users', user.uid, 'favorites', item.id);
    setDocumentNonBlocking(favRef, {
      itemId: item.id,
      title: item.title,
      imageUrl: item.imageUrls?.[0] || '',
      condition: item.condition || '',
      locationName: item.locationName || '',
      createdAt: new Date().toISOString()
    }, { merge: true });
  }, [firestore, user]);

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (direction || !items.length || currentIndex >= items.length) return;
    
    const currentItem = items[currentIndex];
    if (dir === 'right' && currentItem) {
      handleLike(currentItem);
    }

    setDirection(dir);
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 400);
  }, [direction, items, currentIndex, handleLike]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const delta = touchStart - touchEnd;

    if (Math.abs(delta) > 50) {
      if (delta > 0) handleSwipe('left');
      else handleSwipe('right');
    }
    setTouchStart(null);
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!items.length || currentIndex >= items.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <PackageOpen className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Лента kmsX пуста!</h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-sm">Вы просмотрели все доступные вещи от других участников.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/items" className="w-full">
            <Button className="h-14 rounded-2xl w-full text-lg font-bold">К списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 top-16 bg-background flex flex-col z-40 select-none">
      <div className="p-4 flex items-center justify-between border-b bg-white shadow-sm">
        <Link href="/items">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Каталог</span>
          </Button>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">kmsX DISCOVER</p>
          <h1 className="text-xs font-medium text-muted-foreground">Листайте или используйте стрелки</h1>
        </div>
        <Link href="/favorites">
          <Button variant="ghost" size="sm" className="gap-2 text-primary rounded-xl">
            <span className="hidden sm:inline">Лайки</span>
            <Heart className="w-4 h-4 fill-primary" />
          </Button>
        </Link>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 md:p-8">
        <div className="flex items-center gap-6 md:gap-12 w-full max-w-5xl justify-center">
          <Button 
            onClick={() => handleSwipe('left')}
            variant="outline" 
            className="hidden md:flex w-20 h-20 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl p-0 shrink-0"
          >
            <X className="w-10 h-10" />
          </Button>

          <div 
            className={`relative w-full max-w-[380px] aspect-[3/4.5] rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)] bg-white transition-all duration-500 ease-out cursor-grab active:cursor-grabbing
              ${direction === 'left' ? '-translate-x-[150%] rotate-[-30deg] opacity-0' : ''}
              ${direction === 'right' ? 'translate-x-[150%] rotate-[30deg] opacity-0' : ''}
            `}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image 
              src={currentItem.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800'} 
              alt={currentItem.title} 
              fill 
              className="object-cover pointer-events-none"
              priority
            />
            
            {direction === 'right' && (
              <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="border-[12px] border-emerald-500 text-emerald-500 font-black text-7xl px-12 py-6 rounded-3xl rotate-[-15deg] uppercase tracking-tighter shadow-2xl">
                  ЛАЙК
                </div>
              </div>
            )}
            {direction === 'left' && (
              <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="border-[12px] border-rose-500 text-rose-500 font-black text-7xl px-12 py-6 rounded-3xl rotate-[15deg] uppercase tracking-tighter shadow-2xl">
                  НЕТ
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-white">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <Badge className="bg-primary text-white border-none mb-4 backdrop-blur-xl px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                    {currentItem.condition || 'Любое состояние'}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-2 leading-[1.1] tracking-tight">{currentItem.title}</h2>
                </div>
                <Link href={`/items/${currentItem.id}?from=swipe`} className="shrink-0">
                  <Button variant="outline" size="icon" className="rounded-full h-14 w-14 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary hover:border-white shadow-lg backdrop-blur-md">
                    <Info className="w-7 h-7" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => handleSwipe('right')}
            className="hidden md:flex w-20 h-20 rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/40 p-0 shrink-0 border-none"
          >
            <Heart className="w-10 h-10 fill-current" />
          </Button>
        </div>
      </div>

      <div className="md:hidden p-10 flex items-center justify-center gap-8 bg-background border-t">
        <Button 
          onClick={() => handleSwipe('left')}
          variant="outline" 
          className="w-16 h-16 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl p-0"
        >
          <X className="w-8 h-8" />
        </Button>
        <Button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/40 p-0"
        >
          <Heart className="w-8 h-8 fill-current" />
        </Button>
      </div>
    </div>
  );
}