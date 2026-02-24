
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-110 bg-white border">
            <Image 
              src={logoUrl} 
              alt="Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-headline font-black text-3xl tracking-tighter text-primary uppercase">kmsX</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-8">
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
            {isAdmin && (
              <Link 
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-bold transition-colors text-primary hover:text-primary/80 uppercase tracking-wide",
                  pathname === '/admin' ? "text-primary" : "text-primary/70"
                )}
              >
                <ShieldAlert className="w-4 h-4" />
                Админ
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link href="/items/new">
                <Button className="hidden sm:flex h-12 gap-2 rounded-xl font-bold uppercase tracking-tight shadow-md">
                  <PlusCircle className="w-4 h-4" />
                  Разместить
                </Button>
                <Button size="icon" className="sm:hidden h-12 w-12 rounded-xl">
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/chats">
                  <Button variant="ghost" className="rounded-xl bg-accent/20 text-accent-foreground hover:bg-accent/30 font-bold gap-2 h-12 px-5">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Чаты</span>
                  </Button>
                </Link>

                <Link href="/reservations?tab=active">
                  <Button className="rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 px-5">
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
                <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 ml-1">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2 border-none shadow-2xl" align="end" forceMount>
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
              <Button size="lg" className="rounded-xl px-8 h-12 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                Войти
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
