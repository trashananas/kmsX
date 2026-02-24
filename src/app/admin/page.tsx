
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase, 
  setDocumentNonBlocking 
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Users, Image as ImageIcon, ShieldAlert, Globe, RefreshCw, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const [logoUrl, setLogoUrl] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Права доступа
  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== SUPER_ADMIN_EMAIL)) {
      router.push('/items');
    }
  }, [user, isUserLoading, router]);

  // Загружаем настройки брендинга
  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding, isLoading: loadingBranding } = useDoc(brandingRef as any);

  // Загружаем всех пользователей
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: loadingUsers } = useCollection(usersQuery);

  useEffect(() => {
    if (branding) {
      setLogoUrl(branding.logoUrl || '');
    }
  }, [branding]);

  const handleSaveBranding = () => {
    if (!brandingRef) return;
    setIsSavingBranding(true);
    try {
      setDocumentNonBlocking(brandingRef as any, {
        logoUrl: logoUrl.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      }, { merge: true });
      toast({ title: "Брендинг обновлен", description: "Логотип и иконка изменены для всех пользователей." });
    } catch (e) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить настройки." });
    } finally {
      setIsSavingBranding(false);
    }
  };

  if (isUserLoading || !user || user.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-12 mx-auto flex-1 space-y-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-black uppercase tracking-tighter">Панель Управления</h1>
          <p className="text-muted-foreground font-medium">Режим Супер-Администратора kmsX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Брендинг и Настройки */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/50 p-8">
            <CardTitle className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              Внешний вид
            </CardTitle>
            <CardDescription>Управление логотипом и иконкой приложения</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label>URL Логотипа</Label>
              <div className="flex flex-col gap-4">
                <Input 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="h-12 rounded-xl"
                />
                {logoUrl && (
                  <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-muted overflow-hidden bg-muted/20 flex items-center justify-center">
                    <img src={logoUrl} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">
                Это изображение будет на главной, в меню и во вкладке браузера.
              </p>
            </div>
            <Button 
              onClick={handleSaveBranding} 
              className="w-full h-14 rounded-2xl bg-primary font-bold uppercase tracking-tight"
              disabled={isSavingBranding}
            >
              {isSavingBranding ? "Сохранение..." : "Применить везде"}
            </Button>
          </CardContent>
        </Card>

        {/* Список пользователей */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/50 p-8">
            <CardTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              Участники kmsX
            </CardTitle>
            <CardDescription>Все зарегистрированные пользователи в базе</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-8">Имя / Email</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">UID</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest">Телефон</TableHead>
                      <TableHead className="font-bold uppercase text-[10px] tracking-widest pr-8 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/20">
                        <TableCell className="pl-8 py-4">
                          <div className="font-bold">{u.username || 'Без имени'}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] opacity-50">{u.id}</TableCell>
                        <TableCell className="text-sm">{u.phone || '-'}</TableCell>
                        <TableCell className="pr-8 text-right">
                           <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 rounded-lg">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
