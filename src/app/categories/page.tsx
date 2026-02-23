"use client";

import { 
  Shirt, 
  Smartphone, 
  Book, 
  Home, 
  Gamepad2, 
  Bike, 
  LayoutGrid,
  PackageSearch
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const ICON_MAP: Record<string, any> = {
  'Одежда': Shirt,
  'Электроника': Smartphone,
  'Книги': Book,
  'Мебель': Home,
  'Игрушки': Gamepad2,
  'Спорт': Bike,
};

const COLOR_MAP: Record<string, string> = {
  'Одежда': 'bg-orange-100 text-orange-600',
  'Электроника': 'bg-blue-100 text-blue-600',
  'Книги': 'bg-emerald-100 text-emerald-600',
  'Мебель': 'bg-amber-100 text-amber-600',
  'Игрушки': 'bg-purple-100 text-purple-600',
  'Спорт': 'bg-rose-100 text-rose-600',
};

export default function CategoriesPage() {
  const firestore = useFirestore();
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading } = useCollection(categoriesQuery);

  return (
    <div className="container px-4 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold mb-4">Все категории</h1>
        <p className="text-muted-foreground">Выберите интересующий вас раздел, чтобы найти нужную вещь</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.name] || LayoutGrid;
            const color = COLOR_MAP[cat.name] || 'bg-muted text-muted-foreground';
            return (
              <Link key={cat.id} href={`/items?category=${cat.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed">
          <PackageSearch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Категории не созданы</h2>
          <p className="text-muted-foreground">Похоже, в базе данных еще нет категорий. Добавьте их через консоль Firebase.</p>
        </div>
      )}
    </div>
  );
}