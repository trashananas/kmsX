
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
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Users, ShieldAlert, Globe, RefreshCw, Trash2, UploadCloud, Settings2, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SUPER_ADMIN_EMAIL = "kjbdnlf@gmail.com";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const currentUserRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: currentUserProfile } = useDoc(currentUserRef as any);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL || currentUserProfile?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUserProfile?.role === 'admin';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
      return;
    }
    if (!isUserLoading && user && !isAdmin) {
      router.push('/items');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const brandingRef = useMemoFirebase(() => doc(firestore, 'settings', 'branding'), [firestore]);
  const { data: branding } = useDoc(brandingRef as any);

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
      toast({ title: "Брендинг обновлен", description: "Логотип изменен во всем приложении." });
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

  const handleDeleteAllItems = async () => {
    if (!isSuperAdmin) return;
    setIsDeletingAll(true);
    try {
      const itemsRef = collection(firestore, 'item_listings');
      const snapshot = await getDocs(itemsRef);
      snapshot.forEach((itemDoc) => {
        deleteDocumentNonBlocking(doc(firestore, 'item_listings', itemDoc.id));
      });
      toast({ title: "База очищена", description: "Все объявления успешно удалены." });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить объявления." });
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isUserLoading || !user || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-12 mx-auto flex-1 space-y-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-black uppercase tracking-tighter">Панель Управления</h1>
          <p className="text-muted-foreground font-medium">Режим {isSuperAdmin ? 'Супер-Администратора' : 'Администратора'} kmsX</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-muted/50 p-1 mb-8 border">
          <TabsTrigger value="users" className="rounded-xl font-bold uppercase text-xs">Участники</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl font-bold uppercase text-xs">Брендинг</TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl font-bold uppercase text-xs">Система</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 p-8">
              <CardTitle className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                Участники kmsX
              </CardTitle>
              <CardDescription>Управление ролями и просмотр базы пользователей</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUsers ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-8">Участник</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Роль</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest pr-8 text-right">Управление</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers?.map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/5 border-none">
                          <TableCell className="pl-8 py-4">
                            <div className="font-bold">{u.username || 'Без имени'}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </TableCell>
                          <TableCell>
                            {isSuperAdmin ? (
                              <Select defaultValue={u.role || 'user'} onValueChange={(val) => handleRoleChange(u.id, val)}>
                                <SelectTrigger className="w-[160px] h-10 rounded-xl bg-muted/30 border-none font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="user">Участник</SelectItem>
                                  <SelectItem value="admin">Админ</SelectItem>
                                  <SelectItem value="super_admin">Супер-админ</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize px-3 py-1 rounded-lg">
                                {u.role === 'super_admin' ? 'Супер-админ' : u.role === 'admin' ? 'Админ' : 'Участник'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                             <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 rounded-xl h-10 w-10 p-0">
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
            <CardHeader className="bg-muted/30 p-8">
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                Настройки брендинга
              </CardTitle>
              <CardDescription>Логотип обновится во всем приложении мгновенно</CardDescription>
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
                    <div className="relative w-56 h-56 rounded-[3.5rem] border-4 border-white shadow-2xl overflow-hidden">
                      <img src={logoPreview} alt="Logo" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UploadCloud className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-56 h-56 border-4 border-dashed border-muted rounded-[3.5rem] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all bg-muted/20">
                      <UploadCloud className="w-14 h-14" />
                      <span className="text-xs font-bold uppercase tracking-widest">Загрузить логотип</span>
                    </div>
                  )}
                </div>

                <div className="max-w-sm">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Нажмите на область выше, чтобы выбрать файл логотипа. 
                    После выбора нажмите кнопку ниже для сохранения изменений.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSaveBranding} 
                className="w-full h-16 rounded-2xl bg-primary text-xl font-black uppercase tracking-tight shadow-xl shadow-primary/20"
                disabled={isSavingBranding || !logoPreview}
              >
                {isSavingBranding ? "Сохранение..." : "Применить везде"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white max-w-2xl mx-auto">
            <CardHeader className="bg-muted/30 p-8">
              <CardTitle className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-primary" />
                Системные настройки
              </CardTitle>
              <CardDescription>Критические действия с базой данных</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 mb-1">Опасная зона</h4>
                  <p className="text-sm text-rose-700 leading-relaxed">
                    Удаление всех объявлений полностью очистит каталог kmsX. Это действие нельзя отменить.
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full h-16 rounded-2xl text-xl font-black uppercase tracking-tight shadow-xl shadow-destructive/20"
                    disabled={!isSuperAdmin || isDeletingAll}
                  >
                    {isDeletingAll ? "Удаление..." : "Удалить все объявления"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-rose-600">Вы абсолютно уверены?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      Это действие приведет к немедленному и безвозвратному удалению всех объявлений из базы данных. 
                      Пользователи потеряют свои лоты и бронирования.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 gap-4">
                    <AlertDialogCancel className="rounded-xl h-12 px-6 font-bold">Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllItems}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 px-8 font-black uppercase tracking-tight"
                    >
                      Да, удалить всё
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {!isSuperAdmin && (
                <p className="text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  Только супер-администратор может выполнять эти действия
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
