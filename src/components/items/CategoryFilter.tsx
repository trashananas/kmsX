
"use client";

import { cn } from '@/lib/utils';
import { 
  Shirt, 
  Smartphone, 
  Book, 
  Home, 
  Gamepad2, 
  Bike, 
  LayoutGrid,
  Archive
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface CategoryFilterProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  'Одежда': Shirt,
  'Электроника': Smartphone,
  'Книги': Book,
  'Мебель': Home,
  'Игрушки': Gamepad2,
  'Спорт': Bike,
};

export default function CategoryFilter({ selectedId, onSelect }: CategoryFilterProps) {
  const firestore = useFirestore();
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories } = useCollection(categoriesQuery);

  return (
    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
          selectedId === 'all' 
            ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1" 
            : "bg-white text-muted-foreground hover:bg-muted/50 border border-transparent"
        )}
      >
        <LayoutGrid className={cn("w-4 h-4", selectedId === 'all' ? "text-white" : "text-primary")} />
        Все
      </button>

      {categories?.map((cat) => {
        const Icon = ICON_MAP[cat.name] || LayoutGrid;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
              selectedId === cat.id 
                ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1" 
                : "bg-white text-muted-foreground hover:bg-muted/50 border border-transparent"
            )}
          >
            <Icon className={cn("w-4 h-4", selectedId === cat.id ? "text-white" : "text-primary")} />
            {cat.name}
          </button>
        );
      })}

      <div className="h-px bg-muted-foreground/10 my-4 lg:my-6 hidden lg:block" />

      <button
        onClick={() => onSelect('archive')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
          selectedId === 'archive' 
            ? "bg-muted text-foreground font-bold border-2 border-primary/20" 
            : "bg-white text-muted-foreground hover:bg-muted/50 border border-transparent"
        )}
      >
        <Archive className={cn("w-4 h-4", selectedId === 'archive' ? "text-primary" : "text-muted-foreground")} />
        Архив (продано)
      </button>
    </div>
  );
}
