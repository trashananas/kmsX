
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, PackageOpen, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/items/ItemCard';
import CategoryFilter from '@/components/items/CategoryFilter';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const MOCK_ITEMS_DATA = [
  { title: "Куртка Columbia", categoryName: "Одежда", condition: "Хорошее", description: "Теплая куртка для зимы. Состояние отличное." },
  { title: "Canon EOS 5D", categoryName: "Электроника", condition: "Как новое", description: "Профессиональная камера. Пробег небольшой." },
  { title: "Война и мир", categoryName: "Книги", condition: "Хорошее", description: "Все тома в одном издании." },
  { title: "Кресло IKEA", categoryName: "Мебель", condition: "Среднее", description: "Удобное кресло, есть небольшие потертости." },
  { title: "LEGO Star Wars", categoryName: "Игрушки", condition: "Новое", description: "Запечатанная коробка." },
  { title: "Горный велосипед", categoryName: "Спорт", condition: "Хорошее", description: "21 скорость, дисковые тормоза." },
  { title: "iPhone 12", categoryName: "Электроника", condition: "Как новое", description: "Без сколов и царапин." },
  { title: "Свитер шерстяной", categoryName: "Одежда", condition: "Хорошее", description: "Очень теплый, ручная вязка." },
  { title: "Гитара акустическая", categoryName: "Электроника", condition: "Хорошее", description: "Звучит отлично, новые струны." },
  { title: "Набор посуды", categoryName: "Мебель", condition: "Новое", description: "Комплект на 6 персон." },
];

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [isSeeding, setIsSeeding] = useState(false);
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
    const baseRef = collection(firestore, 'item_listings');
    let q = query(baseRef);

    if (showOnlyMine && user) {
      q = query(baseRef, where('ownerId', '==', user.uid));
    } else {
      q = query(baseRef, where('status', '==', 'available'));
      if (selectedCategoryId !== 'all') {
        q = query(q, where('categoryId', '==', selectedCategoryId));
      }
    }
    
    return q;
  }, [firestore, selectedCategoryId, showOnlyMine, user?.uid]);

  const { data: items, isLoading } = useCollection(itemsQuery);
  
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories } = useCollection(categoriesQuery);

  const filteredItems = items?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
          ownerId: user.uid,
          status: 'available',
          imageUrls: [`https://picsum.photos/seed/${Math.random()}/600/800`],
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
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-5 h-12 bg-muted/30 rounded-2xl text-sm font-medium border border-transparent hover:border-primary/20 transition-all cursor-pointer">
              <MapPin className="w-4 h-4 text-primary" />
              <span>По всей стране</span>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-6 px-2">Категории</h2>
              <CategoryFilter 
                selectedId={selectedCategoryId} 
                onSelect={setSelectedCategoryId} 
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold font-headline tracking-tight">
                {showOnlyMine ? 'Мои вещи' : (selectedCategoryId === 'all' ? 'Все вещи' : 'Результаты')}
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
                    distance: 'Рядом',
                    image: item.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/600',
                    condition: item.condition
                  }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <PackageOpen className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Здесь пока тихо</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  {showOnlyMine ? "Вы еще ничего не выставили на kmsX." : "Будьте первым, кто предложит вещь в kmsX!"}
                </p>
                {!showOnlyMine && (
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
