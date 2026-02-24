
"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import ItemCard from '@/components/items/ItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, PackageOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Страница избранного пользователя.
 * Реализована сортировка: товары в наличии идут первыми, кончившиеся — в конце.
 */
export default function FavoritesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [sortedFavorites, setSortedFavorites] = useState<any[]>([]);
  const [isSorting, setIsSorting] = useState(false);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'favorites'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: favorites, isLoading } = useCollection(favoritesQuery);

  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setSortedFavorites([]);
      return;
    }

    const sortFavorites = async () => {
      setIsSorting(true);
      try {
        // Для каждого избранного получаем актуальное состояние из основной коллекции товаров
        const favoritesWithStatus = await Promise.all(
          favorites.map(async (fav) => {
            const itemRef = doc(firestore, 'item_listings', fav.itemId);
            const itemSnap = await getDoc(itemRef);
            const itemData = itemSnap.data();
            
            // Если товара нет в БД, считаем его "кончившимся"
            const quantity = itemData ? (typeof itemData.quantity === 'number' ? itemData.quantity : 1) : 0;
            return { ...fav, isSoldOut: quantity <= 0 };
          })
        );

        // Сортировка: в наличии (false) выше, чем кончившиеся (true)
        const sorted = [...favoritesWithStatus].sort((a, b) => {
          if (a.isSoldOut === b.isSoldOut) return 0;
          return a.isSoldOut ? 1 : -1;
        });

        setSortedFavorites(sorted);
      } catch (err) {
        console.error("kmsX: Ошибка при сортировке избранного", err);
        // В случае ошибки показываем как есть
        setSortedFavorites(favorites);
      } finally {
        setIsSorting(false);
      }
    };

    sortFavorites();
  }, [favorites, firestore]);

  if (!user) {
    return (
      <div className="container px-4 py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Войдите, чтобы увидеть избранное</h2>
        <Link href="/auth">
          <Button className="rounded-xl h-12 px-8">Войти в аккаунт</Button>
        </Link>
      </div>
    );
  }

  // Если сортировка еще идет и нет данных, показываем исходный список или скелетоны
  const displayFavorites = sortedFavorites.length > 0 ? sortedFavorites : (favorites || []);

  return (
    <div className="container px-4 py-12 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Понравившиеся вещи
          </h1>
          <p className="text-muted-foreground">Вещи, которые вы сохранили для будущего обмена</p>
        </div>
        {(isLoading || isSorting) && (
          <div className="flex items-center gap-2 text-primary/50 font-bold text-[10px] uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Проверка наличия
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />
          ))}
        </div>
      ) : displayFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayFavorites.map(fav => (
            <ItemCard key={fav.id} item={{
              id: fav.itemId,
              title: fav.title,
              category: 'Избранное',
              location: fav.locationName || 'Не указано',
              distance: 'Сохранено',
              image: fav.imageUrl || 'https://picsum.photos/seed/placeholder/600/600',
              condition: fav.condition || 'Не указано'
            }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-muted-foreground/20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-bold mb-2">У вас пока нет лайков</h2>
          <p className="text-muted-foreground mb-8">Ищите интересные предложения в каталоге!</p>
          <Link href="/items">
            <Button className="rounded-xl h-12 px-8 font-bold uppercase tracking-tight">Перейти в каталог</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
