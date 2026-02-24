
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PlusCircle, Compass, LayoutGrid, User, LogOut, Heart, MessageSquare, Package, ShoppingBag, History, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, logOut, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

const navItems = [
  { label: 'Обзор', href: '/items', icon: Compass },
  { label: 'Категории', href: '/categories', icon: LayoutGrid },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding } = useDoc(brandingRef as any);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logOut(auth);
    router.push('/auth');
  };

  const logoUrl = branding?.logoUrl || PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '/logo.png';

  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b h-16" />
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-110">
            <Image 
              src={logoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-primary uppercase">kmsX</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Link 
              href="/favorites"
              className={cn(
                "flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide",
                pathname === '/favorites' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Heart className="w-4 h-4" />
              Лайки
            </Link>
            {isSuperAdmin && (
              <Link 
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-bold transition-colors text-rose-600 hover:text-rose-700 uppercase tracking-wide",
                  pathname === '/admin' ? "text-rose-600" : "text-rose-600/70"
                )}
              >
                <ShieldAlert className="w-4 h-4" />
                Админ
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link href="/items/new">
                <Button className="hidden sm:flex gap-2 rounded-xl font-bold uppercase tracking-tight">
                  <PlusCircle className="w-4 h-4" />
                  Разместить
                </Button>
                <Button size="icon" className="sm:hidden rounded-xl">
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/chats">
                  <Button variant="ghost" className="rounded-xl bg-accent/20 text-accent-foreground hover:bg-accent/30 font-bold gap-2 h-10 px-4">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Чаты</span>
                  </Button>
                </Link>

                <Link href="/reservations?tab=active">
                  <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 h-10 px-4">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Брони</span>
                  </Button>
                </Link>
              </div>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-1">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none uppercase">Профиль</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/profile" className="cursor-pointer flex items-center gap-2 font-medium">
                    <User className="w-4 h-4" /> Настройки профиля
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/items?owner=me" className="cursor-pointer flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4" /> Мои объявления
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/reservations?tab=history" className="cursor-pointer flex items-center gap-2 font-medium">
                    <ShoppingBag className="w-4 h-4" /> Мои покупки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/sales" className="cursor-pointer flex items-center gap-2 font-medium">
                    <History className="w-4 h-4" /> Мои продажи
                  </Link>
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl text-rose-600 font-bold">
                    <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Админ-панель
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl font-bold">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : pathname !== '/auth' ? (
            <Link href="/auth">
              <Button size="sm" className="rounded-xl px-5 font-bold uppercase tracking-tight shadow-md">
                Войти
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
