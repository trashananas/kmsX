
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, ArrowRight, Package, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChatsListPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Запрос чатов, где пользователь — покупатель
  const buyerChatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'chats'), where('buyerId', '==', user.uid));
  }, [firestore, user]);

  // Запрос чатов, где пользователь — продавец
  const sellerChatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'chats'), where('sellerId', '==', user.uid));
  }, [firestore, user]);

  const { data: buyerChats, isLoading: loadingBuyer } = useCollection(buyerChatsQuery);
  const { data: sellerChats, isLoading: loadingSeller } = useCollection(sellerChatsQuery);

  const isLoading = loadingBuyer || loadingSeller;

  // Объединяем и сортируем на клиенте по времени последнего обновления
  const allChats = [...(buyerChats || []), ...(sellerChats || [])].sort((a, b) => {
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  const activeChats = allChats.filter(c => c.status !== 'archived');
  const archivedChats = allChats.filter(c => c.status === 'archived');

  if (!user) return null;

  return (
    <div className="container max-w-4xl px-4 py-12 mx-auto flex-1">
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-bold mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          Мои сообщения
        </h1>
        <p className="text-muted-foreground">Обсуждение обмена и покупок в kmsX</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-20" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1 rounded-2xl mb-8">
            <TabsTrigger value="active" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Активные ({activeChats.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Архив ({archivedChats.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ChatList chats={activeChats} currentUserId={user.uid} />
          </TabsContent>
          <TabsContent value="archived">
            <ChatList chats={archivedChats} currentUserId={user.uid} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ChatList({ chats, currentUserId }: { chats: any[], currentUserId: string }) {
  if (chats.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-muted-foreground/20 animate-in fade-in duration-500">
        <Package className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">В этом разделе пока пусто</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chats.map(chat => (
        <Link key={chat.id} href={`/chats/${chat.id}`}>
          <Card className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white active:scale-[0.98]">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-muted">
                <img 
                  src={chat.itemImage || `https://picsum.photos/seed/${chat.id}/200/200`} 
                  alt="" 
                  className="object-cover w-full h-full" 
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg truncate pr-4 group-hover:text-primary transition-colors">{chat.itemTitle}</h3>
                  {chat.updatedAt && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-wider whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: ru })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] rounded-md px-1.5 py-0 border-none font-bold uppercase",
                    chat.sellerId === currentUserId ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {chat.sellerId === currentUserId ? 'Продажа' : 'Покупка'}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-1 italic opacity-70">
                    {chat.lastMessage || 'Начните диалог...'}
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <ArrowRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// Вспомогательная функция для классов
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
