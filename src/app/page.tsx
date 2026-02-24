
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Мягкий фоновый градиент без резких границ */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background pointer-events-none" />
        
        <div className="container px-4 text-center z-10 py-20">
          <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12 shadow-2xl rounded-[3rem] md:rounded-[4rem] overflow-hidden rotate-3 border-4 md:border-8 border-white bg-white">
            <Image 
              src={logoUrl} 
              alt="Клуб логотип" 
              fill 
              className="object-cover"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black mb-6 tracking-tighter uppercase">
            Встречайте <span className="text-primary italic">kmsX</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Клуб многодетных семей Выхино-Жулебино: современный способ обмениваться вещами с соседями. Безопасно, удобно и честно.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/items">
                <Button size="lg" className="px-12 h-16 text-xl rounded-2xl shadow-2xl shadow-primary/30 group font-bold uppercase tracking-tight">
                  Смотреть вещи
                  <Zap className="ml-2 w-6 h-6 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="lg" className="px-12 h-16 text-xl rounded-2xl shadow-2xl shadow-primary/30 group font-bold uppercase tracking-tight">
                  Начать обмен
                  <Zap className="ml-2 w-6 h-6 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container px-4 py-20">
          <div className="bg-primary rounded-[5rem] p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-headline font-black mb-8 uppercase tracking-tighter">Присоединяйтесь к нашему клубу</h2>
              <p className="text-primary-foreground/90 max-w-xl mx-auto mb-12 text-xl font-medium">
                Начните обмениваться вещами прямо сейчас. Регистрация в kmsX занимает меньше минуты.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="px-16 h-20 text-2xl rounded-3xl font-black uppercase shadow-2xl tracking-tighter hover:scale-105 transition-transform">
                  Создать аккаунт
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </section>
      )}
    </div>
  );
}
