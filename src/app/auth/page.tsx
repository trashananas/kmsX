
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Ghost, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, useUser, initiateEmailSignIn, initiateEmailSignUp, initiatePasswordReset, initiateAnonymousSignIn } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
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
      // Firebase запоминает пользователя по умолчанию (Local Persistence).
      // Здесь мы просто отображаем галочку для UI/UX.
      await initiateEmailSignIn(auth, email.trim(), password);
      toast({ title: "Вход выполнен", description: "Рады видеть вас снова в kmsX!" });
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
      toast({ title: "Аккаунт создан", description: "Добро пожаловать в наше сообщество!" });
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

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await initiateAnonymousSignIn(auth);
      toast({ title: "Вход как гость", description: "Временный доступ в kmsX активирован." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось войти как гость." });
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
          <h1 className="text-4xl font-black font-headline mb-2 tracking-tighter uppercase">Вход в kmsX</h1>
          <p className="text-muted-foreground font-medium italic">Клуб многодетных семей Выхино-Жулебино</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-muted/50 p-1 mb-6 border">
            <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold uppercase text-xs tracking-wider">Вход</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold uppercase text-xs tracking-wider">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-2xl font-bold">Войти</CardTitle>
                <CardDescription>Введите данные для доступа к вашему аккаунту.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 p-10">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none font-medium" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" name="password" className="font-bold">Пароль</Label>
                      <button 
                        type="button" 
                        onClick={handleResetPassword}
                        className="text-xs text-primary hover:underline font-bold"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10 h-12 rounded-xl bg-muted/20 border-none" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      className="rounded-md border-primary/20"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs font-bold text-muted-foreground cursor-pointer uppercase tracking-tight"
                    >
                      Запомнить меня на этом устройстве
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0 flex flex-col gap-4">
                  <Button type="submit" className="w-full h-14 rounded-2xl group shadow-lg shadow-primary/20 text-lg font-black uppercase tracking-tight" disabled={loading}>
                    {loading ? "Загрузка..." : (
                      <>
                        Войти
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  <div className="relative w-full py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Или</span></div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGuestLogin}
                    className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-tight gap-3"
                    disabled={loading}
                  >
                    <Ghost className="w-5 h-5" />
                    Войти как гость
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-2xl font-bold">Новый аккаунт</CardTitle>
                <CardDescription>Станьте частью нашего сообщества.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 p-10">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Имя</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Ваше имя" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none font-medium" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="font-bold">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="email@example.com" 
                        className="pl-10 h-12 rounded-xl bg-muted/20 border-none font-medium" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" name="reg-password" className="font-bold">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="reg-password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10 h-12 rounded-xl bg-muted/20 border-none" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 text-lg font-black uppercase tracking-tight" disabled={loading}>
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
