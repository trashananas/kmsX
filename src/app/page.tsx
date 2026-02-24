
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, MapPin, RefreshCw, Layers } from 'lucide-react';
import { useUser } from '@/firebase';

const features = [
  {
    title: "Ищите рядом",
    description: "Находите отличные вещи прямо в вашем районе с помощью kmsX.",
    icon: MapPin,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Быстрый обмен",
    description: "Договаривайтесь об обмене за считанные минуты.",
    icon: RefreshCw,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    title: "Вторая жизнь",
    description: "Дайте вещам вторую жизнь и получите то, что вам нужно бесплатно.",
    icon: Layers,
    color: "bg-orange-100 text-orange-600"
  }
];

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container px-4 text-center z-10">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20 rotate-6">
            <Layers className="text-white w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 tracking-tight">
            Встречайте <span className="text-primary italic">kmsX</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Самый простой и быстрый способ обмениваться вещами с соседями. Безопасно, удобно и абсолютно бесплатно.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/items">
                <Button size="lg" className="px-12 h-16 text-xl rounded-2xl shadow-2xl shadow-primary/30 group">
                  Смотреть вещи
                  <Zap className="ml-2 w-6 h-6 group-hover:scale-125 transition-transform fill-white" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="lg" className="px-12 h-16 text-xl rounded-2xl shadow-2xl shadow-primary/30 group">
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

      {/* Features Grid */}
      <section className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Почему выбирают kmsX?</h2>
          <p className="text-muted-foreground">Мы сделали процесс обмена максимально интуитивным</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] bg-white p-4">
              <CardContent className="pt-8 text-center">
                <div className={`w-16 h-16 rounded-3xl ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container px-4 py-10">
          <div className="bg-primary rounded-[4rem] p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">Присоединяйтесь к kmsX сегодня</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-12 text-lg">
                Начните обмениваться вещами прямо сейчас. Вход занимает меньше минуты.
              </p>
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="px-12 h-16 text-xl rounded-2xl font-bold shadow-2xl">
                  Создать аккаунт
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </section>
      )}
    </div>
  );
}
