
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import MobileFullscreenPrompt from '@/components/MobileFullscreenPrompt';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/' && pathname !== '/auth') {
      router.push('/auth');
    }
  }, [user, isUserLoading, pathname, router]);

  return <>{children}</>;
}

function DynamicBranding() {
  const firestore = useFirestore();
  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding } = useDoc(brandingRef as any);
  
  const logoUrl = branding?.logoUrl || PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '/favicon.ico';

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoUrl;
    }
  }, [logoUrl]);

  return null;
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <title>kmsX | Современный обмен вещами</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background overflow-x-hidden">
        <FirebaseClientProvider>
          <DynamicBranding />
          <AuthGuard>
            <Navbar />
            <div className="pt-24 min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster />
            <MobileFullscreenPrompt />
          </AuthGuard>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
