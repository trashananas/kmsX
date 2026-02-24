
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, PackageOpen, RefreshCw, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemCard from '@/components/items/ItemCard';
import CategoryFilter from '@/components/items/CategoryFilter';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const MOCK_ITEMS_DATA = [
  { title: "Куртка Columbia", categoryName: "Одежда", condition: "Хорошее", description: "Теплая куртка для зимы. Состояние отличное.", price: 0 },
  { title: "Canon EOS 5D", categoryName: "Электроника", condition: "Как новое", description: "Профессиональная камера. Пробег небольшой.", price: 50000 },
  { title: "Война и мир", categoryName: "Книги", condition: "Хорошее", description: "Все тома в одном издании.", price: 0 },
  { title: "Кресло IKEA", categoryName: "Мебель", condition: "Среднее", description: "Удобное кресло, есть небольшие потертости.", price: 1500 },
  { title: "LEGO Star Wars", categoryName: "Игрушки", condition: "Новое", description: "Запечатанная коробка.", price: 8000 },
  { title: "Горный велосипед", categoryName: "Спорт", condition: "Хорошее", description: "21 скорость, дисковые тормоза.", price: 12000 },
  { title: "iPhone 12", categoryName: "Электроника", condition: "Как новое", description: "Без сколов и царапин.", price: 35000 },
  { title: "Свитер шерстяной", categoryName: "Одежда", condition: "Хорошее", description: "Очень теплый, ручная вязка.", price: 0 },
  { title: "Гитара акустическая", categoryName: "Электроника", condition: "Хорошее", description: "Звучит отлично, новые струны.", price: 5000 },
  { title: "Набор посуды", categoryName: "Мебель", condition: "Новое", description: "Комплект на 6 персон.", price: 0 },
];

function BrowseItemsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeMineTab, setActiveMineTab] = useState('active'); // 'active' | 'archive'
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const showOnlyMine = searchParams.get('owner') === 'me';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const itemsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const baseRef = collection(firestore, 'item_listings');
    let q = query(baseRef);

    if (showOnlyMine) {
      q = query(baseRef, where('ownerId', '==', user.uid));
      if (selectedCategoryId !== 'all' && selectedCategoryId !== 'archive') {
        q = query(q, where('categoryId', '==', selectedCategoryId));
      }
    } else if (selectedCategoryId === 'archive') {
      q = query(baseRef, where('quantity', '==', 0));
    } else {
      q = query(baseRef, where('status', '==', 'available'));
      if (selectedCategoryId !== 'all') {
        q = query(q, where('categoryId', '==', selectedCategoryId));
      }
      if (showOnlyFree) {
        q = query(q, where('price', '==', 0));
      }
    }
    
    return q;
  }, [firestore, selectedCategoryId, showOnlyMine, showOnlyFree, user]);

  const { data: items, isLoading } = useCollection(itemsQuery);
  
  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'categories');
  }, [firestore, user]);
  
  const { data: categories } = useCollection(categoriesQuery);

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (showOnlyMine) {
      const qty = item.quantity ?? 1;
      if (activeMineTab === 'active') return qty > 0;
      if (activeMineTab === 'archive') return qty <= 0;
    }
    
    if (!showOnlyMine && selectedCategoryId !== 'archive') {
      const qty = item.quantity ?? 1;
      if (qty <= 0) return false;
    }

    return true;
  }) || [];

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    if (id === 'archive' && showOnlyMine) {
      router.push('/items');
    }
  };

  const seedMockItems = async () => {
    if (!user || !categories || categories.length === 0) {
      toast({
        variant: "destructive",
        title: "Сначала создайте категории",
        description: "Перейдите в раздел категорий и нажмите «Восстановить стандартные».",
      });
      return;
    }

    setIsSeeding(true);
    try {
      const listingsRef = collection(firestore, 'item_listings');
      
      for (const mock of MOCK_ITEMS_DATA) {
        const category = categories.find(c => c.name === mock.categoryName) || categories[0];
        
        addDocumentNonBlocking(listingsRef, {
          title: mock.title,
          description: mock.description,
          categoryId: category.id,
          condition: mock.condition,
          price: mock.price,
          bank: mock.price > 0 ? "Сбер" : "",
          quantity: Math.random() > 0.2 ? 1 : 0,
          ownerId: user.uid,
          status: 'available',
          imageUrls: [`https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/600/800`],
          locationName: "Москва",
          latitude: 55.7558,
          longitude: 37.6173,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast({
        title: "kmsX: Данные добавлены",
        description: "10 объявлений успешно созданы для теста.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить тестовые данные.",
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
    <div className="container px-4 py-8 max-w-7xl mx-auto flex-1">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2rem] shadow-sm border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Что ищем в kmsX?" 
              className="pl-11 h-12 bg-muted/30 border-none rounded-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-4 h-12 bg-muted/30 rounded-2xl border border-transparent">
            <Switch 
              id="free-mode" 
              checked={showOnlyFree} 
              onCheckedChange={setShowOnlyFree}
            />
            <Label htmlFor="free-mode" className="text-sm font-medium whitespace-nowrap cursor-pointer">Бесплатно</Label>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-6 px-2">Разделы</h2>
              <CategoryFilter 
                selectedId={selectedCategoryId} 
                onSelect={handleCategorySelect} 
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold font-headline tracking-tight">
                {showOnlyMine ? (
                   activeMineTab === 'active' ? 'Мои вещи' : 'Мой архив'
                ) : (
                   selectedCategoryId === 'all' ? 'Все вещи' : 
                   selectedCategoryId === 'archive' ? 'Архив kmsX' : 'Результаты'
                )}
                {showOnlyFree && !showOnlyMine && <span className="text-accent ml-2 text-lg">(Бесплатно)</span>}
                {!isLoading && <span className="text-muted-foreground font-normal text-lg ml-3">({filteredItems.length})</span>}
              </h1>
              {filteredItems.length === 0 && !isLoading && !showOnlyMine && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={seedMockItems} 
                  disabled={isSeeding}
                  className="rounded-xl gap-2 border-primary/20 text-primary"
                >
                  <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                  Тестовые данные
                </Button>
              )}
            </div>

            {showOnlyMine && (
              <Tabs value={activeMineTab} onValueChange={setActiveMineTab} className="mb-8 w-full sm:w-fit">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="active" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                    В продаже
                  </TabsTrigger>
                  <TabsTrigger value="archive" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                    Архив (0 шт.)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredItems.map(item => (
                  <ItemCard key={item.id} item={{
                    id: item.id,
                    title: item.title,
                    category: categories?.find(c => c.id === item.categoryId)?.name || 'Разное',
                    location: item.locationName || 'Не указано',
                    distance: item.price > 0 ? `${item.price} ₽` : 'Бесплатно',
                    image: item.imageUrls?.[0] || 'https://picsum.photos/seed/1/600/600',
                    condition: item.condition,
                    quantity: item.quantity
                  }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  {selectedCategoryId === 'archive' ? <Archive className="w-12 h-12 text-muted-foreground/30" /> : <PackageOpen className="w-12 h-12 text-muted-foreground/30" />}
                </div>
                <h3 className="text-2xl font-bold mb-3">Ничего не найдено</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  {selectedCategoryId === 'archive' ? "В архиве kmsX пока пусто." : "Будьте первым, кто предложит вещь в этом разделе!"}
                </p>
                {!showOnlyMine && selectedCategoryId !== 'archive' && (
                  <Button variant="outline" onClick={seedMockItems} disabled={isSeeding} className="rounded-2xl h-12 px-8">
                    <RefreshCw className={`mr-2 w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                    Добавить 10 тестовых объявлений
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowseItems() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>}>
      <BrowseItemsContent />
    </Suspense>
  );
}
