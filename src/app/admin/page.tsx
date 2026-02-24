
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Users, ShieldAlert, Globe, RefreshCw, Trash2, UploadCloud, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
    if (branding?.logoUrl) {
      setLogoPreview(branding.logoUrl);
    }
  }, [branding]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    if (!brandingRef || !logoPreview) return;
    setIsSavingBranding(true);
    try {
      setDocumentNonBlocking(brandingRef as any, {
        logoUrl: logoPreview,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      }, { merge: true });
      toast({ title: "Брендинг обновлен", description: "Логотип и иконка изменены во всем приложении." });
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
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-muted/50 p-8">
            <CardTitle className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              Брендинг
            </CardTitle>
            <CardDescription>Загрузите новый логотип из проводника</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Логотип приложения</Label>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />

              <div className="flex flex-col items-center gap-6">
                {logoPreview ? (
                  <div className="relative w-40 h-40 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden group">
                    <img src={logoPreview} alt="Logo Preview" className="object-cover w-full h-full" />
                    <button 
                      onClick={() => setLogoPreview(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-4 border-dashed border-muted rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-muted/20"
                  >
                    <UploadCloud className="w-10 h-10" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Выбрать файл</span>
                  </div>
                )}
                
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold leading-relaxed px-4">
                  Это изображение обновит логотип в меню, на главной и иконку вкладки для всех.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSaveBranding} 
              className="w-full h-14 rounded-2xl bg-primary font-bold uppercase tracking-tight shadow-lg shadow-primary/20"
              disabled={isSavingBranding || !logoPreview}
            >
              {isSavingBranding ? "Сохранение..." : "Применить везде"}
            </Button>
          </CardContent>
        </Card>

        {/* Список пользователей */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
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
