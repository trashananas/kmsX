
"use client";

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  MapPin, 
  Tag, 
  User, 
  Trash2, 
  MessageCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Package,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useDoc, 
  useFirestore, 
  useUser, 
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
  useMemoFirebase
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const [reserveCount, setReserveCount] = useState(1);
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  const from = searchParams.get('from');
  const backLink = from === 'swipe' ? '/swipe' : '/items';
  const backLabel = from === 'swipe' ? 'Назад к свайпам' : 'Назад к списку';

  const itemRef = useMemoFirebase(() => doc(firestore, 'item_listings', id), [firestore, id]);
  const { data: item, isLoading } = useDoc(itemRef);

  const categoryRef = useMemoFirebase(() => 
    item?.categoryId ? doc(firestore, 'categories', item.categoryId) : null
  , [firestore, item?.categoryId]);
  const { data: category } = useDoc(categoryRef);

  const availableQuantity = item 
    ? (typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1) 
    : 0;

  const handleDelete = () => {
    if (!item || !user || item.ownerId !== user.uid) return;
    
    deleteDocumentNonBlocking(itemRef as any);
    toast({
      title: "Объявление удалено",
      description: "Вещь больше не отображается в поиске kmsX.",
    });
    router.push('/items');
  };

  const handleReserve = () => {
    if (!item || !user || reserveCount <= 0 || reserveCount > availableQuantity) {
      toast({
        variant: "destructive",
        title: "Ошибка бронирования",
        description: `Вы не можете забронировать более ${availableQuantity} шт.`,
      });
      return;
    }

    const newQuantity = availableQuantity - reserveCount;
    
    updateDocumentNonBlocking(itemRef as any, {
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    });

    const favRef = doc(firestore, 'users', user.uid, 'favorites', item.id);
    setDocumentNonBlocking(favRef, {
      itemId: item.id,
      title: item.title,
      imageUrl: item.imageUrls?.[0] || '',
      condition: item.condition || '',
      locationName: item.locationName || '',
      reservedCount: (item.reservedCount || 0) + reserveCount,
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: "Забронировано!",
      description: `Вы забронировали ${reserveCount} шт. Вы можете найти их во вкладке «Лайки».`,
    });
    setIsReserveOpen(false);
    setReserveCount(1);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/2 aspect-[4/5] rounded-[2rem]" />
          <div className="flex-1 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Объявление не найдено</h1>
        <Link href="/items">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user && item.ownerId === user.uid;
  const isSoldOut = availableQuantity <= 0;
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), 'd MMMM yyyy', { locale: ru }) 
    : 'Недавно';

  return (
    <div className="container px-4 py-8 max-w-5xl mx-auto">
      <Link href={backLink} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group w-fit">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {backLabel}
      </Link>

      <div className={`flex flex-col md:flex-row gap-12 bg-white p-8 rounded-[2.5rem] shadow-sm border ${isSoldOut ? 'border-destructive/50' : ''}`}>
        <div className="w-full md:w-1/2">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg">
            <Image 
              src={item.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/600/800'} 
              alt={item.title} 
              fill 
              className={`object-cover ${isSoldOut ? 'grayscale' : ''}`}
              priority
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className="bg-white/90 text-primary hover:bg-white border-none px-4 py-1.5 shadow-sm text-sm font-bold backdrop-blur-md">
                {item.condition}
              </Badge>
              {isSoldOut && (
                <Badge variant="destructive" className="px-4 py-1.5 shadow-sm text-sm font-bold uppercase tracking-wider animate-pulse">
                  Кончился
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1">
                {category?.name || 'Разное'}
              </Badge>
              {!isSoldOut && (
                <Badge className="bg-emerald-100 text-emerald-600 border-none px-3 py-1">
                  Свободно
                </Badge>
              )}
            </div>
            <h1 className={`text-4xl font-headline font-bold mb-2 leading-tight ${isSoldOut ? 'text-muted-foreground line-through' : ''}`}>
              {item.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className={`text-3xl font-bold ${isSoldOut ? 'text-muted-foreground' : 'text-primary'}`}>
                {item.price > 0 ? `${item.price} ₽` : 'Бесплатно'}
              </span>
              <Badge variant="outline" className={`rounded-lg gap-1.5 border-muted-foreground/20 text-muted-foreground ${isSoldOut ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}`}>
                <Package className="w-3.5 h-3.5" />
                {isSoldOut ? 'Нет в наличии' : `В наличии: ${availableQuantity} шт.`}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {item.locationName}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                Добавлено {formattedDate}
              </div>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="p-6 bg-muted/30 rounded-2xl border border-dashed">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Описание
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
              
              {item.bank && (
                <div className="mt-6 pt-6 border-t border-dashed flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Банк для оплаты</p>
                    <p className="font-bold">{item.bank}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-2xl bg-white shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Владелец kmsX</p>
                <p className="text-xs text-muted-foreground">На связи для обмена</p>
              </div>
              <div className="ml-auto">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            {isOwner ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-14 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-destructive/20"
                  >
                    <Trash2 className="w-5 h-5" />
                    Удалить вещь
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <AlertDialogTitle className="text-xl">Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Это действие нельзя будет отменить. Ваше объявление «{item.title}» будет удалено из kmsX навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel className="rounded-xl h-12 border-2">Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="rounded-xl h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                    >
                      Да, удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className={`flex-1 h-14 rounded-xl text-lg font-bold gap-2 shadow-lg ${isSoldOut ? 'bg-muted text-muted-foreground' : 'shadow-primary/20'}`}
                    disabled={isSoldOut}
                  >
                    {isSoldOut ? (
                      'Уже закончилось'
                    ) : (
                      <>
                        <CalendarCheck className="w-5 h-5" />
                        Забронировать
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Бронирование</DialogTitle>
                    <DialogDescription>
                      Сколько единиц товара «{item.title}» вы хотите забронировать? (В наличии: {availableQuantity})
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <Label htmlFor="reserve-count">Количество (макс. {availableQuantity})</Label>
                    <Input 
                      id="reserve-count"
                      type="number"
                      min="1"
                      max={availableQuantity}
                      value={reserveCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setReserveCount(val);
                      }}
                      className="h-12 rounded-xl mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReserve} className="w-full h-14 rounded-xl text-lg font-bold">
                      Подтвердить бронь
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl border-2">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
