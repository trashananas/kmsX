
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, Heart, MapPin, Info, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SWIPE_ITEMS = [
  { id: '1', title: 'Акустическая гитара', category: 'Музыка', location: 'Москва', image: 'https://picsum.photos/seed/swipe1/800/1200', desc: 'Немного подержанная гитара Yamaha. Идеально для новичков.', user: 'Алексей М.' },
  { id: '2', title: 'Коллекция суккулентов', category: 'Дом', location: 'Санкт-Петербург', image: 'https://picsum.photos/seed/swipe2/800/1200', desc: '5 здоровых суккулентов в керамических горшках. Ищу книги.', user: 'Сара Д.' },
  { id: '3', title: 'Механическая клавиатура', category: 'Электроника', location: 'Новосибирск', image: 'https://picsum.photos/seed/swipe3/800/1200', desc: 'RGB, синие свичи. Громкая и приятная!', user: 'Давид В.' },
  { id: '4', title: 'Винтажная куртка Levi', category: 'Одежда', location: 'Казань', image: 'https://picsum.photos/seed/swipe4/800/1200', desc: 'Размер M. Идеальное винтажное состояние.', user: 'Елена П.' },
];

export default function SwipeMode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 400);
  };

  const currentItem = SWIPE_ITEMS[currentIndex];

  if (currentIndex >= SWIPE_ITEMS.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <RefreshCw className="w-10 h-10 text-primary animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Вещи закончились!</h2>
        <p className="text-muted-foreground mb-8">Вы просмотрели все доступные варианты в вашем районе.</p>
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
    <div className="fixed inset-0 top-16 bg-background flex flex-col z-40">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b bg-white">
        <Link href="/items">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Список
          </Button>
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Лента открытий</p>
          <h1 className="text-sm font-medium text-muted-foreground">Рядом с вами</h1>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white transition-all duration-300
            ${direction === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : ''}
            ${direction === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}
          `}
        >
          <Image 
            src={currentItem.image} 
            alt={currentItem.title} 
            fill 
            className="object-cover"
            priority
          />
          
          {/* Action Overlay Labels */}
          {direction === 'right' && (
            <div className="absolute top-10 left-10 border-4 border-emerald-500 text-emerald-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[-15deg] uppercase z-50">
              ДА!
            </div>
          )}
          {direction === 'left' && (
            <div className="absolute top-10 right-10 border-4 border-rose-500 text-rose-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[15deg] uppercase z-50">
              НЕТ
            </div>
          )}

          {/* Card Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h2 className="text-3xl font-bold mb-1">{currentItem.title}</h2>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{currentItem.location}</span>
                </div>
              </div>
              <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Info className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-white/70 line-clamp-2 mt-4">{currentItem.desc}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-[10px]">
                {currentItem.user.charAt(0)}
              </div>
              <span className="text-xs text-white/60">Добавил(а) {currentItem.user}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-8 flex items-center justify-center gap-8 bg-background">
        <Button 
          onClick={() => handleSwipe('left')}
          variant="outline" 
          className="w-16 h-16 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg p-0"
        >
          <X className="w-8 h-8" />
        </Button>
        <Button 
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-all shadow-xl p-0"
        >
          <Heart className="w-10 h-10 fill-current" />
        </Button>
      </div>
    </div>
  );
}
