
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Если загрузка завершена, пользователя нет, и это не главная или страница входа - редирект на регистрацию
    if (!isUserLoading && !user && pathname !== '/' && pathname !== '/auth') {
      router.push('/auth');
    }
  }, [user, isUserLoading, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>kmsX | Современный обмен вещами</title>
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <AuthGuard>
            <Navbar />
            <div className="pt-16 min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster />
          </AuthGuard>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
