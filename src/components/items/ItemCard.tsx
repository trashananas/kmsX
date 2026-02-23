
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Item {
  id: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  image: string;
  condition: string;
}

export default function ItemCard({ item }: { item: Item }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const favRef = useMemoFirebase(() => {
    if (!user || !item.id) return null;
    return doc(firestore, 'users', user.uid, 'favorites', item.id);
  }, [firestore, user, item.id]);

  const { data: favorite } = useDoc(favRef);
  const isLiked = !!favorite;

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Нужна авторизация",
        description: "Войдите, чтобы добавлять вещи в избранное.",
      });
      return;
    }

    if (!favRef) return;

    if (isLiked) {
      deleteDocumentNonBlocking(favRef);
    } else {
      setDocumentNonBlocking(favRef, {
        itemId: item.id,
        title: item.title,
        imageUrl: item.image,
        condition: item.condition,
        locationName: item.location,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  return (
    <Card className="overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
      <Link href={`/items/${item.id}`} className="block relative aspect-[4/5] overflow-hidden">
        <Image 
          src={item.image} 
          alt={item.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-white/90 text-primary backdrop-blur-sm border-none shadow-sm hover:bg-white">
            {item.condition}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLike}
            className={cn(
              "w-8 h-8 rounded-full transition-all backdrop-blur-sm",
              isLiked ? "bg-primary text-white" : "bg-black/10 text-white hover:bg-black/20"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <Badge className="bg-black/50 text-white backdrop-blur-md border-none text-[10px] font-bold uppercase tracking-wider py-1 px-3">
            {item.category}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <CardContent className="p-4">
        <Link href={`/items/${item.id}`}>
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
        </Link>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{item.location}</span>
          <span className="mx-1">•</span>
          <span>{item.distance}</span>
        </div>
        <Link href={`/items/${item.id}`}>
          <Button className="w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-all shadow-none">
            Подробнее
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
