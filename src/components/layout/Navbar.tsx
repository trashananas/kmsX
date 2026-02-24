
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

  const currentUserRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: currentUserProfile } = useDoc(currentUserRef as any);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || currentUserProfile?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUserProfile?.role === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logOut(auth);
    router.push('/auth');
  };

  const logoUrl = branding?.logoUrl || PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '/logo.png';

  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b h-24" />
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b h-24 shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo Section - Pinned Left */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-105 bg-white border">
            <Image 
              src={logoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-headline font-black text-xl sm:text-3xl tracking-tighter text-primary uppercase hidden xs:block">kmsX</span>
        </Link>

        {/* Scrollable Center Section */}
        {user && (
          <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center justify-center sm:justify-end gap-2 sm:gap-4 py-2 px-1">
            <div className="flex items-center gap-2 sm:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] sm:text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide whitespace-nowrap",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span className="hidden xs:inline">{item.label}</span>
                </Link>
              ))}
              <Link 
                href="/favorites"
                className={cn(
                  "flex items-center gap-1.5 text-[10px] sm:text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide whitespace-nowrap",
                  pathname === '/favorites' ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="hidden xs:inline">Лайки</span>
              </Link>
            </div>

            <div className="h-6 w-px bg-muted hidden sm:block" />

            <div className="flex items-center gap-2">
              <Link href="/items/new">
                <Button className="h-9 sm:h-12 gap-2 rounded-lg sm:rounded-xl font-bold uppercase tracking-tight shadow-sm whitespace-nowrap px-3 sm:px-5">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Разместить</span>
                </Button>
              </Link>

              <Link href="/chats">
                <Button variant="ghost" className="rounded-lg sm:rounded-xl bg-accent/10 text-accent-foreground hover:bg-accent/20 font-bold gap-2 h-9 sm:h-12 px-3 sm:px-5 whitespace-nowrap">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Чаты</span>
                </Button>
              </Link>

              <Link href="/reservations?tab=active">
                <Button className="rounded-lg sm:rounded-xl h-9 sm:h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 px-3 sm:px-5 whitespace-nowrap">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Брони</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Profile Section - Pinned Right */}
        <div className="shrink-0 flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full p-0 flex items-center justify-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2 border-none shadow-2xl z-[60]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 py-3 bg-muted/30 rounded-xl mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none uppercase tracking-tight">Мой кабинет</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 font-bold">
                  <Link href="/profile" className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary" /> Настройки профиля
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 font-bold">
                  <Link href="/items?owner=me" className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-primary" /> Мои объявления
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 font-bold">
                  <Link href="/reservations?tab=history" className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-primary" /> Мои покупки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 font-bold">
                  <Link href="/sales" className="flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" /> Мои продажи
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl text-primary font-black uppercase p-3">
                    <Link href="/admin" className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4" /> Админ-панель
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl font-black uppercase p-3">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : pathname !== '/auth' ? (
            <Link href="/auth">
              <Button size="lg" className="rounded-xl px-4 sm:px-8 h-10 sm:h-12 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                Войти
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
