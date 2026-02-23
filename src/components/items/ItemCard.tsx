
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  return (
    <Card className="overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
      <Link href={`/items/${item.id}`} className="block relative aspect-[4/5]">
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
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-black/10 text-white hover:bg-black/20 backdrop-blur-sm">
            <Heart className="w-4 h-4" />
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
        <Button className="w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-all shadow-none">
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}
