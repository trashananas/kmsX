
"use client";

import { cn } from '@/lib/utils';
import { 
  Shirt, 
  Smartphone, 
  Book, 
  Home, 
  Gamepad2, 
  Bike, 
  LayoutGrid 
} from 'lucide-react';

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Clothes', icon: Shirt },
  { name: 'Electronics', icon: Smartphone },
  { name: 'Books', icon: Book },
  { name: 'Furniture', icon: Home },
  { name: 'Toys', icon: Gamepad2 },
  { name: 'Sporting Goods', icon: Bike },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (name: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full",
            selected === cat.name 
              ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1" 
              : "bg-white text-muted-foreground hover:bg-muted/50 border border-transparent"
          )}
        >
          <cat.icon className={cn("w-4 h-4", selected === cat.name ? "text-white" : "text-primary")} />
          {cat.name}
        </button>
      ))}
    </div>
  );
}
