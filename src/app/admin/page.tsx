
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase, 
  setDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Users, ShieldAlert, Globe, RefreshCw, Trash2, UploadCloud, X, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Загружаем профиль текущего пользователя для проверки роли
  const currentUserRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: currentUserProfile } = useDoc(currentUserRef as any);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || currentUserProfile?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUserProfile?.role === 'admin';

  // Права доступа
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
      return;
    }
    if (!isUserLoading && user && !isAdmin && user.email !== SUPER_ADMIN_EMAIL) {
      router.push('/items');
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Загружаем настройки брендинга
  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding } = useDoc(brandingRef as any);

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

  const handleRoleChange = (targetUserId: string, newRole: string) => {
    if (!isSuperAdmin) {
      toast({ variant: "destructive", title: "Отказ", description: "Только Супер-админ может менять роли." });
      return;
    }
    const targetUserRef = doc(firestore, 'users', targetUserId);
    updateDocumentNonBlocking(targetUserRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Роль обновлена", description: `Установлена роль: ${newRole}` });
  };

  if (isUserLoading || !user || (!isAdmin && user.email !== SUPER_ADMIN_EMAIL)) {
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
          <p className="text-muted-foreground font-medium">Режим {isSuperAdmin ? 'Супер-Администратора' : 'Администратора'} kmsX</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-muted/50 p-1 mb-8">
          <TabsTrigger value="users" className="rounded-xl font-bold uppercase text-xs">Участники</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl font-bold uppercase text-xs">Брендинг</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-muted/50 p-8">
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                Участники kmsX
              </CardTitle>
              <CardDescription>Управление ролями и просмотр базы</CardDescription>
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
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Роль</TableHead>
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
                          <TableCell>
                            {isSuperAdmin ? (
                              <Select defaultValue={u.role || 'user'} onValueChange={(val) => handleRoleChange(u.id, val)}>
                                <SelectTrigger className="w-[150px] h-9 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Участник</SelectItem>
                                  <SelectItem value="admin">Админ</SelectItem>
                                  <SelectItem value="super_admin">Супер-админ</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize">
                                {u.role === 'super_admin' ? 'Супер-админ' : u.role === 'admin' ? 'Админ' : 'Участник'}
                              </Badge>
                            )}
                          </TableCell>
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
        </TabsContent>

        <TabsContent value="branding">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white max-w-2xl mx-auto">
            <CardHeader className="bg-muted/50 p-8">
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                Настройки брендинга
              </CardTitle>
              <CardDescription>Логотип обновится везде: от шапки до иконки вкладки</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  {logoPreview ? (
                    <div className="relative w-48 h-48 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden">
                      <img src={logoPreview} alt="Logo" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UploadCloud className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 border-4 border-dashed border-muted rounded-[3rem] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all bg-muted/20">
                      <UploadCloud className="w-12 h-12" />
                      <span className="text-xs font-bold uppercase">Загрузить</span>
                    </div>
                  )}
                </div>

                <div className="max-w-sm">
                  <p className="text-sm text-muted-foreground font-medium">
                    Нажмите на область выше, чтобы выбрать файл из проводника. 
                    После выбора нажмите кнопку ниже для сохранения.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
