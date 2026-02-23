
"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, UploadCloud, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function NewItemListing() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: '',
    locationName: '',
  });

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'categories');
  }, [firestore, user]);

  const { data: categories } = useCollection(categoriesQuery);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const listingsRef = collection(firestore, 'item_listings');
      const newDoc = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        condition: formData.condition,
        locationName: formData.locationName,
        ownerId: user.uid,
        status: 'available',
        // Используем загруженное фото или заглушку
        imageUrls: [previewImage || `https://picsum.photos/seed/${Math.random()}/600/800`],
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
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewImage ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group">
                  <Image 
                    src={previewImage} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-muted/20"
                >
                  <UploadCloud className="w-8 h-8" />
                  <span className="text-xs font-medium">Загрузить</span>
                </div>
              )}
            </div>
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
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    {!categories?.length && (
                      <SelectItem value="none" disabled>Категории не найдены</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Состояние</Label>
                <Select onValueChange={(val) => setFormData({...formData, condition: val})} required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Состояние" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Новое">Новое</SelectItem>
                    <SelectItem value="Как новое">Как новое</SelectItem>
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
                value={formData.locationName}
                onChange={(e) => setFormData({...formData, locationName: e.target.value})}
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
