"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await initiateEmailSignIn(auth, email.trim(), password);
      toast({ title: "Вход выполнен", description: "Добро пожаловать обратно!" });
      router.push('/items');
    } catch (err: any) {
      let message = "Не удалось войти. Проверьте данные.";
      if (err.code === 'auth/invalid-email') message = "Некорректный адрес почты.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') message = "Неверный логин или пароль.";
      
      toast({ variant: "destructive", title: "Ошибка", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await initiateEmailSignUp(auth, email.trim(), password);
      toast({ title: "Аккаунт создан", description: "Теперь вы можете размещать объявления." });
      router.push('/items');
    } catch (err: any) {
      let message = "Ошибка при регистрации.";
      if (err.code === 'auth/invalid-email') message = "Некорректный адрес почты.";
      if (err.code === 'auth/email-already-in-use') message = "Этот email уже занят.";
      if (err.code === 'auth/weak-password') message = "Слишком простой пароль (минимум 6 символов).";
      
      toast({ variant: "destructive", title: "Ошибка", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Layers className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-headline">Добро пожаловать в Полочку</h1>
          <p className="text-muted-foreground">Любимый сервис обмена вещами</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted p-1 mb-6">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Вход</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-xl">Войти</CardTitle>
                <CardDescription>Введите данные для доступа к вашему аккаунту.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 p-8">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Пароль</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button type="submit" className="w-full h-12 rounded-xl group" disabled={loading}>
                    {loading ? "Вход..." : (
                      <>
                        Войти
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-xl">Создать аккаунт</CardTitle>
                <CardDescription>Присоединяйтесь к сообществу сегодня.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 p-8">
                  <div className="space-y-2">
                    <Label htmlFor="name">Полное имя</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Иван Иванов" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="reg-password" 
                        type="password" 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button type="submit" className="w-full h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                    {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
