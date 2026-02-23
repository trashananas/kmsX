"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, UploadCloud, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function NewItemListing() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    itemCondition: '',
    address: '',
  });

  if (!user) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Пожалуйста, войдите, чтобы разместить объявление</h2>
        <Link href="/auth">
          <Button>Войти в аккаунт</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const listingsRef = collection(firestore, 'listings');
      const newDoc = {
        ...formData,
        userId: user.uid,
        status: 'active',
        imageUrls: [`https://picsum.photos/seed/${Math.random()}/600/800`], // Placeholder image
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        latitude: 0,
        longitude: 0,
      };

      addDocumentNonBlocking(listingsRef, newDoc);
      
      toast({
        title: "Успех!",
        description: "Ваше объявление опубликовано.",
      });
      router.push('/items');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить объявление.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <Link href="/items" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Назад к списку
      </Link>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold mb-2">Новое объявление</h1>
          <p className="text-muted-foreground">Чем вы хотите поделиться сегодня?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Фотографии</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-muted/20">
                <UploadCloud className="w-8 h-8" />
                <span className="text-xs font-medium">Загрузить</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-bold">Пока используется случайное фото для примера.</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input 
                id="title" 
                placeholder="Например, Гитара или Книга" 
                required 
                className="h-12 rounded-xl"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select onValueChange={(val) => setFormData({...formData, categoryId: val})} required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Одежда">Одежда</SelectItem>
                    <SelectItem value="Электроника">Электроника</SelectItem>
                    <SelectItem value="Книги">Книги</SelectItem>
                    <SelectItem value="Мебель">Мебель</SelectItem>
                    <SelectItem value="Игрушки">Игрушки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Состояние</Label>
                <Select onValueChange={(val) => setFormData({...formData, itemCondition: val})} required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Состояние" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Новое">Абсолютно новая</SelectItem>
                    <SelectItem value="Как новое">Как новая</SelectItem>
                    <SelectItem value="Хорошее">Хорошее</SelectItem>
                    <SelectItem value="Среднее">Среднее</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea 
              id="description" 
              placeholder="Опишите вещь..." 
              className="min-h-[120px] rounded-xl resize-none"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место встречи</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
              <Input 
                id="location" 
                placeholder="Город или район" 
                className="pl-10 h-12 rounded-xl" 
                required 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? "Публикация..." : "Опубликовать"}
          </Button>
        </form>
      </div>
    </div>
  );
}
