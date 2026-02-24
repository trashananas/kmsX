
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser, initiateEmailSignIn, initiateEmailSignUp, initiatePasswordReset } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/items');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await initiateEmailSignIn(auth, email.trim(), password);
      toast({ title: "Вход выполнен", description: "Добро пожаловать в kmsX!" });
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
      toast({ title: "Аккаунт создан", description: "Теперь вы — часть kmsX!" });
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

  const handleResetPassword = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Ошибка", description: "Введите email для сброса пароля." });
      return;
    }
    setLoading(true);
    try {
      await initiatePasswordReset(auth, email.trim());
      toast({ title: "Письмо отправлено", description: "Проверьте почту для сброса пароля." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось отправить письмо. Проверьте адрес." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 rotate-3">
            <Layers className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-headline mb-2 tracking-tight">Добро пожаловать в kmsX</h1>
          <p className="text-muted-foreground">Лучший способ меняться вещами</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-muted/50 p-1 mb-6 border">
            <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-medium">Вход</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-medium">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-2xl">Войти</CardTitle>
                <CardDescription>Введите данные для доступа к kmsX.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 p-10">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Пароль</Label>
                      <button 
                        type="button" 
                        onClick={handleResetPassword}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-14 rounded-2xl group shadow-lg shadow-primary/20 text-lg font-bold" disabled={loading}>
                    {loading ? "Загрузка..." : (
                      <>
                        Войти
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-2xl">Новый аккаунт</CardTitle>
                <CardDescription>Станьте частью сообщества kmsX.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 p-10">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Ваше имя" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none" 
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
                        placeholder="email@example.com" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none" 
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
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 text-lg font-bold" disabled={loading}>
                    {loading ? "Создание..." : "Зарегистрироваться"}
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
