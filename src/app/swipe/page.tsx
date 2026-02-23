"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Heart, MapPin, Info, ArrowLeft, RefreshCw, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

export default function SwipeMode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const firestore = useFirestore();

  const swipeQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, 'item_listings'),
      where('status', '==', 'available'),
      limit(20)
    );
  }, [firestore]);

  const { data: items, isLoading } = useCollection(swipeQuery);

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (direction) return; // Prevent double swipes
    setDirection(dir);
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 400);
  }, [direction]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const delta = touchStart - touchEnd;

    if (Math.abs(delta) > 50) { // Threshold for swipe
      if (delta > 0) handleSwipe('left');
      else handleSwipe('right');
    }
    setTouchStart(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const currentItem = items?.[currentIndex];

  if (!items || items.length === 0 || currentIndex >= items.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <PackageOpen className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Вещи закончились!</h2>
        <p className="text-muted-foreground mb-8">Вы просмотрели все доступные варианты или база пока пуста.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setCurrentIndex(0)}>
            Начать сначала
          </Button>
          <Link href="/items">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-background flex flex-col z-40 select-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b bg-white">
        <Link href="/items">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Список
          </Button>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Лента открытий</p>
          <h1 className="text-sm font-medium text-muted-foreground">Свайпайте или используйте стрелки</h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Swipe Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div className="flex items-center gap-4 md:gap-8 w-full max-w-4xl justify-center">
          
          {/* Left Button (Visible on md screens and up) */}
          <Button 
            onClick={() => handleSwipe('left')}
            variant="outline" 
            className="hidden md:flex w-16 h-16 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md p-0 shrink-0"
          >
            <X className="w-8 h-8" />
          </Button>

          {/* Swipe Card */}
          <div 
            className={`relative w-full max-w-[360px] aspect-[3/4.5] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white transition-all duration-400 ease-out cursor-grab active:cursor-grabbing
              ${direction === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : ''}
              ${direction === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}
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
              data-ai-hint="item photo"
            />
            
            {/* Overlays */}
            {direction === 'right' && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-50">
                <div className="border-8 border-emerald-500 text-emerald-500 font-black text-6xl px-8 py-4 rounded-3xl rotate-[-15deg] uppercase">
                  ЛАЙК
                </div>
              </div>
            )}
            {direction === 'left' && (
              <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center z-50">
                <div className="border-8 border-rose-500 text-rose-500 font-black text-6xl px-8 py-4 rounded-3xl rotate-[15deg] uppercase">
                  НЕТ
                </div>
              </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
              <div className="flex items-end justify-between mb-2">
                <div className="flex-1 pr-4">
                  <Badge className="bg-white/20 text-white border-none mb-3 backdrop-blur-md px-3">
                    {currentItem.condition || 'Состояние'}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">{currentItem.title}</h2>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{currentItem.locationName || 'Мир'}</span>
                  </div>
                </div>
                <Link href={`/items/${currentItem.id}?from=swipe`}>
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0">
                    <Info className="w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Button (Visible on md screens and up) */}
          <Button 
            onClick={() => handleSwipe('right')}
            className="hidden md:flex w-16 h-16 rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-all shadow-lg p-0 shrink-0"
          >
            <Heart className="w-8 h-8 fill-current" />
          </Button>
        </div>
      </div>

      {/* Mobile Control buttons (Visible only on small screens) */}
      <div className="md:hidden p-8 flex items-center justify-center gap-6 bg-background">
        <Button 
          onClick={() => handleSwipe('left')}
          variant="outline" 
          className="w-14 h-14 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md p-0"
        >
          <X className="w-6 h-6" />
        </Button>
        <Button 
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-all shadow-lg p-0"
        >
          <Heart className="w-6 h-6 fill-current" />
        </Button>
      </div>
    </div>
  );
}
