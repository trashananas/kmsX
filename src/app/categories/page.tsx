"use client";

import { useState } from 'react';
import { 
  Shirt, 
  Smartphone, 
  Book, 
  Home, 
  Gamepad2, 
  Bike, 
  LayoutGrid,
  PackageSearch,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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

const DEFAULT_CATEGORIES = [
  'Одежда',
  'Электроника',
  'Книги',
  'Мебель',
  'Игрушки',
  'Спорт'
];

export default function CategoriesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading } = useCollection(categoriesQuery);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const categoriesRef = collection(firestore, 'categories');
      addDocumentNonBlocking(categoriesRef, {
        name: newCategoryName.trim(),
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Категория добавлена",
        description: `Категория "${newCategoryName}" успешно создана.`,
      });
      setNewCategoryName('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить категорию.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const seedCategories = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const categoriesRef = collection(firestore, 'categories');
      for (const catName of DEFAULT_CATEGORIES) {
        // Проверяем, нет ли уже такой категории в списке (локально)
        const exists = categories?.some(c => c.name === catName);
        if (!exists) {
          addDocumentNonBlocking(categoriesRef, {
            name: catName,
            createdAt: new Date().toISOString(),
          });
        }
      }
      toast({
        title: "Готово",
        description: "Стандартные категории восстановлены.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось восстановить категории.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container px-4 py-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-headline font-bold mb-4">Все категории</h1>
          <p className="text-muted-foreground">Выберите интересующий вас раздел или добавьте свой</p>
        </div>
        
        <div className="flex gap-3">
          {user && categories && categories.length === 0 && (
            <Button 
              variant="outline" 
              onClick={seedCategories} 
              disabled={isSeeding}
              className="rounded-xl h-12 px-6 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              Вернуть стандартные
            </Button>
          )}

          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-12 px-6 gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-5 h-5" />
                  Своя категория
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle>Новая категория</DialogTitle>
                  <DialogDescription>
                    Введите название для новой категории вещей. Она появится в общем списке.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Название</Label>
                      <Input 
                        id="cat-name" 
                        placeholder="Например, Винил или Растения" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSubmitting}>
                      {isSubmitting ? "Добавление..." : "Добавить"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
          <p className="text-muted-foreground mb-8">Будьте первым, кто создаст структуру нашего обмена!</p>
          {!user ? (
            <Link href="/auth">
              <Button variant="outline">Войти, чтобы добавить</Button>
            </Link>
          ) : (
             <Button variant="outline" onClick={seedCategories} disabled={isSeeding}>
               <RefreshCw className={`mr-2 w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
               Восстановить стандартные
             </Button>
          )}
        </div>
      )}
    </div>
  );
}
