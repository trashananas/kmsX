
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Package, User, Banknote, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function SalesHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Запрос всех завершенных сделок, где пользователь — продавец
  const salesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'chats'),
      where('sellerId', '==', user.uid),
      where('dealStatus', '==', 'completed')
    );
  }, [firestore, user]);

  const { data: sales, isLoading } = useCollection(salesQuery);

  if (!user) return null;

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto flex-1">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold mb-2 flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          Мои продажи
        </h1>
        <p className="text-muted-foreground">История всех успешно завершенных сделок в kmsX</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
      ) : sales && sales.length > 0 ? (
        <div className="grid gap-6">
          <div className="space-y-4">
            {sales.map((sale) => (
              <Card key={sale.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    <Image 
                      src={sale.itemImage || 'https://picsum.photos/seed/1/200/200'} 
                      alt="" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold truncate pr-4">{sale.itemTitle}</h3>
                      <span className="text-lg font-black text-primary whitespace-nowrap">{sale.price} ₽</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-4 h-4 text-primary/40" />
                        <span className="font-medium">Кол-во: <span className="text-foreground">{sale.quantity || 1} шт.</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4 text-primary/40" />
                        <span className="font-medium">Покупатель: <span className="text-foreground text-xs">{sale.buyerId}</span></span>
                      </div>
                      {sale.updatedAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs italic">{format(new Date(sale.updatedAt), 'd MMMM yyyy', { locale: ru })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-muted-foreground/20">
          <Banknote className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Продаж пока нет</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">Здесь появится история ваших завершенных сделок, когда покупатели подтвердят получение.</p>
        </div>
      )}
    </div>
  );
}
