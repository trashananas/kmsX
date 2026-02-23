
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import ItemCard from '@/components/items/ItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const favoritesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'favorites'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: favorites, isLoading } = useCollection(favoritesQuery);

  if (!user) {
    return (
      <div className="container px-4 py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Войдите, чтобы увидеть избранное</h2>
        <Link href="/auth">
          <Button>Войти в аккаунт</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-headline font-bold mb-4 flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          Понравившиеся вещи
        </h1>
        <p className="text-muted-foreground">Вещи, которые вы отметили лайком в ленте или каталоге</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(fav => (
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
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-bold mb-2">У вас пока нет лайков</h2>
          <p className="text-muted-foreground mb-8">Свайпайте вправо в ленте открытий, чтобы сохранить интересное!</p>
          <Link href="/swipe">
            <Button className="rounded-xl h-12 px-8">Перейти к свайпам</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
