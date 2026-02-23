
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, PlusCircle, Compass, Layers, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Обзор', href: '/items', icon: Compass },
  { label: 'Свайп', href: '/swipe', icon: Zap },
  { label: 'Категории', href: '/categories', icon: Layers },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="text-white w-5 h-5" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">Полочка</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          <Link href="/items/new">
            <Button className="hidden sm:flex gap-2">
              <PlusCircle className="w-4 h-4" />
              Разместить
            </Button>
            <Button size="icon" className="sm:hidden">
              <PlusCircle className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
