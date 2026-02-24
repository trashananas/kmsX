
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
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Мягкий фоновый градиент с плавным переходом */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="container px-4 text-center z-10 py-20 animate-in fade-in zoom-in duration-1000">
          <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto mb-12 shadow-2xl rounded-[4rem] overflow-hidden border-8 border-white bg-white">
            <Image 
              src={logoUrl} 
              alt="Клуб логотип" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-black mb-12 tracking-tighter uppercase">
            Встречайте <span className="text-primary italic">kmsX</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {user ? (
              <Link href="/items">
                <Button size="lg" className="px-16 h-20 text-2xl rounded-3xl shadow-2xl shadow-primary/30 group font-black uppercase tracking-tight">
                  Смотреть вещи
                  <Zap className="ml-3 w-8 h-8 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="lg" className="px-16 h-20 text-2xl rounded-3xl shadow-2xl shadow-primary/30 group font-black uppercase tracking-tight">
                  Начать обмен
                  <Zap className="ml-3 w-8 h-8 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container px-4 py-24">
          <div className="bg-primary rounded-[5rem] p-16 md:p-24 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-headline font-black mb-10 uppercase tracking-tighter leading-none">Присоединяйтесь к нашему клубу</h2>
              <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-14 text-xl md:text-2xl font-medium leading-relaxed">
                Начните обмениваться вещами прямо сейчас. Регистрация в kmsX занимает меньше минуты.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="px-20 h-24 text-3xl rounded-[2.5rem] font-black uppercase shadow-2xl tracking-tighter hover:scale-105 transition-transform bg-white text-primary">
                  Создать аккаунт
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </section>
      )}
    </div>
  );
}
