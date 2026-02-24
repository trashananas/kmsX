
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  Trash2
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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

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
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'categories');
  }, [firestore, user]);
  
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
        title: "kmsX: Категория добавлена",
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

  const handleDeleteCategory = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSuperAdmin) return;
    
    const catRef = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(catRef);
    toast({ title: "Раздел удален" });
  };

  const seedCategories = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const categoriesRef = collection(firestore, 'categories');
      for (const catName of DEFAULT_CATEGORIES) {
        const exists = categories?.some(c => c.name === catName);
        if (!exists) {
          addDocumentNonBlocking(categoriesRef, {
            name: catName,
            createdAt: new Date().toISOString(),
          });
        }
      }
      toast({
        title: "kmsX: Категории готовы",
        description: "Стандартная структура разделов восстановлена.",
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

  if (isUserLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 max-w-5xl mx-auto flex-1">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-headline font-bold mb-4 tracking-tight">Разделы kmsX</h1>
          <p className="text-muted-foreground text-lg">Выберите нужную категорию или создайте свою</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 gap-3 shadow-xl shadow-primary/20 text-lg">
                <Plus className="w-6 h-6" />
                Своя категория
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl">Новая категория</DialogTitle>
                <DialogDescription>
                  Введите название для нового раздела kmsX.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory}>
                <div className="grid gap-6 py-6">
                  <div className="space-y-3">
                    <Label htmlFor="cat-name">Название</Label>
                    <Input 
                      id="cat-name" 
                      placeholder="Например, Антиквариат или Растения" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                      className="h-14 rounded-2xl bg-muted/30 border-none text-lg px-6"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold" disabled={isSubmitting}>
                    {isSubmitting ? "Добавление..." : "Добавить раздел"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {(isSuperAdmin || (categories && categories.length === 0)) && (
            <Button 
              variant="outline" 
              onClick={seedCategories} 
              disabled={isSeeding}
              className="rounded-2xl h-14 px-8 gap-3"
            >
              <RefreshCw className={`w-5 h-5 ${isSeeding ? 'animate-spin' : ''}`} />
              Стандартные
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-56 rounded-[2.5rem]" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.name] || LayoutGrid;
            const color = COLOR_MAP[cat.name] || 'bg-muted text-muted-foreground';
            return (
              <div key={cat.id} className="relative group">
                <Link href={`/items?category=${cat.id}`}>
                  <Card className="border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer h-full rounded-[2.5rem] bg-white overflow-hidden">
                    <CardContent className="p-10 flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-[1.5rem] ${color} flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-sm`}>
                        <Icon className="w-10 h-10" />
                      </div>
                      <h3 className="font-bold text-xl mb-1">{cat.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
                {isSuperAdmin && (
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteCategory(e, cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-muted-foreground/20">
          <PackageSearch className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Категории не созданы</h2>
          <p className="text-muted-foreground mb-10 max-w-sm mx-auto">kmsX еще пуст. Начните с восстановления стандартных разделов.</p>
          <Button variant="outline" onClick={seedCategories} disabled={isSeeding} className="rounded-2xl h-14 px-10 text-lg">
            <RefreshCw className={`mr-3 w-5 h-5 ${isSeeding ? 'animate-spin' : ''}`} />
            Восстановить стандартные
          </Button>
        </div>
      )}
    </div>
  );
}
