
"use client";

import { 
  Shirt, 
  Smartphone, 
  Book, 
  Home, 
  Gamepad2, 
  Bike, 
  Baby, 
  Paintbrush,
  Camera,
  Music
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const categories = [
  { name: 'Одежда', icon: Shirt, count: 124, color: 'bg-orange-100 text-orange-600' },
  { name: 'Электроника', icon: Smartphone, count: 86, color: 'bg-blue-100 text-blue-600' },
  { name: 'Книги', icon: Book, count: 210, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Мебель', icon: Home, count: 45, color: 'bg-amber-100 text-amber-600' },
  { name: 'Игрушки', icon: Gamepad2, count: 92, color: 'bg-purple-100 text-purple-600' },
  { name: 'Спорт', icon: Bike, count: 34, color: 'bg-rose-100 text-rose-600' },
  { name: 'Детские товары', icon: Baby, count: 78, color: 'bg-sky-100 text-sky-600' },
  { name: 'Хобби', icon: Paintbrush, count: 56, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Фототехника', icon: Camera, count: 23, color: 'bg-slate-100 text-slate-600' },
  { name: 'Инструменты', icon: Music, count: 19, color: 'bg-teal-100 text-teal-600' },
];

export default function CategoriesPage() {
  return (
    <div className="container px-4 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold mb-4">Все категории</h1>
        <p className="text-muted-foreground">Выберите интересующий вас раздел, чтобы найти нужную вещь</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link key={cat.name} href={`/items?category=${encodeURIComponent(cat.name)}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.count} объявлений</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
