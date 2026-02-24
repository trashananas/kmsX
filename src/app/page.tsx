
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding } = useDoc(brandingRef as any);

  const logoUrl = branding?.logoUrl || PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '/logo.png';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center overflow-hidden">
        {/* Мягкий фоновый градиент с плавным переходом */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="container px-6 text-center z-10 py-12 animate-in fade-in zoom-in duration-1000">
          <div className="relative w-56 h-56 md:w-80 md:h-80 mx-auto mb-8 md:mb-12 shadow-2xl rounded-[3rem] md:rounded-[4rem] overflow-hidden border-8 border-white bg-white">
            <Image 
              src={logoUrl} 
              alt="Клуб логотип" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black mb-10 md:mb-16 tracking-tighter uppercase">
            Встречайте <span className="text-primary italic">kmsX</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center max-w-xs sm:max-w-none mx-auto">
            {user ? (
              <Link href="/items" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:px-16 h-16 md:h-20 text-xl md:text-2xl rounded-[1.5rem] md:rounded-3xl shadow-2xl shadow-primary/30 group font-black uppercase tracking-tight">
                  Смотреть вещи
                  <Zap className="ml-3 w-6 h-6 md:w-8 md:h-8 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:px-16 h-16 md:h-20 text-xl md:text-2xl rounded-[1.5rem] md:rounded-3xl shadow-2xl shadow-primary/30 group font-black uppercase tracking-tight">
                  Начать обмен
                  <Zap className="ml-3 w-6 h-6 md:w-8 md:h-8 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute -bottom-40 -left-40 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-accent/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -top-40 -right-40 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </section>

      {/* Лишние CTA секции удалены для чистоты мобильного вида */}
    </div>
  );
}
