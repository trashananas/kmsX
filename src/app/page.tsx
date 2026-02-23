
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Zap, MapPin, RefreshCw } from 'lucide-react';

const features = [
  {
    title: "Ищите рядом",
    description: "Находите отличные вещи прямо в вашем районе с помощью поиска по геолокации.",
    icon: MapPin,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Свайпайте и находите",
    description: "Открывайте для себя вещи в удобном формате. Свайп вправо, если вещь понравилась!",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    title: "Обмен без отходов",
    description: "Дайте вещам вторую жизнь и получите то, что вам нужно, не тратя денег.",
    icon: RefreshCw,
    color: "bg-emerald-100 text-emerald-600"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container px-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight">
            Обменивайтесь вещами <br />
            <span className="text-primary">просто и с доверием.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Присоединяйтесь к сообществу «Полочка». Меняйте одежду, электронику, книги и многое другое без лишних хлопот с продажей.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/items">
              <Button size="lg" className="px-10 h-14 text-lg">
                Смотреть вещи
              </Button>
            </Link>
            <Link href="/swipe">
              <Button size="lg" variant="outline" className="px-10 h-14 text-lg gap-2">
                <Zap className="w-5 h-5 fill-accent text-accent" />
                Режим свайпа
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </section>

      {/* Features Grid */}
      <section className="container px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-8 text-center">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20 border-y">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-headline font-bold mb-6">Простой обмен в 3 шага</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-lg">Разместите свои вещи</h4>
                    <p className="text-muted-foreground">Сделайте фото, добавьте описание и выберите категорию.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-lg">Найдите нужное</h4>
                    <p className="text-muted-foreground">Просматривайте объявления рядом или свайпайте в ленте открытий.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-lg">Встретьтесь и обменяйтесь</h4>
                    <p className="text-muted-foreground">Спишитесь с владельцем и договоритесь о безопасной встрече.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 relative aspect-square max-w-md w-full">
              <Image 
                src="https://picsum.photos/seed/polochka1/800/800"
                alt="Neighborhood Exchange"
                fill
                className="rounded-3xl object-cover shadow-2xl"
                data-ai-hint="neighborhood sharing"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20">
        <div className="bg-primary rounded-[3rem] p-12 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">Готовы избавиться от лишнего и найти новое?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg">
            Присоединяйтесь к тысячам соседей, которые уже обмениваются на «Полочке».
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="px-10 h-14 text-lg">
              Начать прямо сейчас
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
