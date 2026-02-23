
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, UploadCloud, ChevronLeft } from 'lucide-react';
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

export default function NewItemListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setOpen(false);
      toast({
        title: "Вещь успешно добавлена!",
        description: "Ваше объявление теперь видно людям в вашем районе.",
      });
      router.push('/items');
    }, 1500);
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
          {/* Photo Upload Area */}
          <div className="space-y-2">
            <Label>Фотографии</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-muted/20">
                <UploadCloud className="w-8 h-8" />
                <span className="text-xs font-medium">Добавить фото</span>
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-bold">Добавьте хотя бы одно фото вещи.</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" placeholder="например, Механическая клавиатура" required className="h-12 rounded-xl" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothes">Одежда</SelectItem>
                    <SelectItem value="electronics">Электроника</SelectItem>
                    <SelectItem value="books">Книги</SelectItem>
                    <SelectItem value="furniture">Мебель</SelectItem>
                    <SelectItem value="toys">Игрушки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Состояние</Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Состояние" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Абсолютно новая</SelectItem>
                    <SelectItem value="likenew">Как новая</SelectItem>
                    <SelectItem value="good">Хорошее</SelectItem>
                    <SelectItem value="fair">Среднее</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea 
              id="description" 
              placeholder="Опишите вещь, её особенности и то, что вы ищете взамен..." 
              className="min-h-[120px] rounded-xl resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место встречи</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
              <Input id="location" placeholder="Район или город" className="pl-10 h-12 rounded-xl" required />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? "Размещение..." : "Опубликовать"}
          </Button>
        </form>
      </div>
    </div>
  );
}
