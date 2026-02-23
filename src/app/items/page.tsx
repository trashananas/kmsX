"use client";

import { useState } from 'react';
import { Search, Filter, MapPin, PackageOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/items/ItemCard';
import CategoryFilter from '@/components/items/CategoryFilter';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const firestore = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const showOnlyMine = searchParams.get('owner') === 'me';

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

  const filteredItems = items?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Поиск вещей..." 
              className="pl-10 h-12 bg-muted/30 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 h-12 bg-muted/30 rounded-xl text-sm font-medium border border-transparent hover:border-primary/20 transition-all cursor-pointer">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Весь мир</span>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-lg font-bold mb-4 px-2">Категории</h2>
              <CategoryFilter 
                selectedId={selectedCategoryId} 
                onSelect={setSelectedCategoryId} 
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-headline">
                {showOnlyMine ? 'Мои вещи' : (selectedCategoryId === 'all' ? 'Все вещи' : 'Результаты')}
                {!isLoading && <span className="text-muted-foreground font-normal text-sm ml-2">({filteredItems.length})</span>}
              </h1>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <ItemCard key={item.id} item={{
                    id: item.id,
                    title: item.title,
                    category: item.categoryId,
                    location: item.locationName || 'Не указано',
                    distance: 'Рядом',
                    image: item.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/600',
                    condition: item.condition
                  }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-dashed">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PackageOpen className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">Здесь пока пусто</h3>
                <p className="text-muted-foreground">
                  {showOnlyMine ? "У вас еще нет объявлений." : "Будьте первым, кто разместит объявление в этой категории!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
