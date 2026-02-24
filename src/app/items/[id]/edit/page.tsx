
"use client";

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, ChevronLeft, X, Wallet, Package, Banknote } from 'lucide-react';
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
import { useFirestore, useUser, useDoc, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function EditItemListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const itemRef = useMemoFirebase(() => doc(firestore, 'item_listings', id), [firestore, id]);
  const { data: item, isLoading: isItemLoading } = useDoc(itemRef as any);

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: '',
    price: '',
    bank: '',
    quantity: '1',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        categoryId: item.categoryId || '',
        condition: item.condition || '',
        price: item.price?.toString() || '',
        bank: item.bank || '',
        quantity: item.quantity?.toString() || '1',
      });
      if (item.imageUrls?.[0]) {
        setPreviewImage(item.imageUrls[0]);
      }
    }
  }, [item]);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'categories');
  }, [firestore, user]);

  const { data: categories } = useCollection(categoriesQuery);

  if (!user) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Пожалуйста, войдите</h2>
        <Link href="/auth">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  if (item && item.ownerId !== user.uid) {
    return (
      <div className="container px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">У вас нет прав для редактирования этого объявления</h2>
        <Link href="/items">
          <Button>В каталог</Button>
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
      updateDocumentNonBlocking(itemRef as any, {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        condition: formData.condition,
        price: formData.price ? parseFloat(formData.price) : 0,
        bank: formData.bank || '',
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
        imageUrls: previewImage ? [previewImage] : item?.imageUrls,
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Обновлено!",
        description: "Изменения сохранены.",
      });
      router.push(`/items/${id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить изменения.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isItemLoading) return <div className="container p-20 text-center">Загрузка...</div>;

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <Link href={`/items/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Назад к товару
      </Link>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold mb-2">Редактирование</h1>
          <p className="text-muted-foreground">Обновите информацию о вашем лоте</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Фотография</Label>
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
                required 
                className="h-12 rounded-xl"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={formData.categoryId} onValueChange={(val) => setFormData({...formData, categoryId: val})} required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Состояние</Label>
                <Select value={formData.condition} onValueChange={(val) => setFormData({...formData, condition: val})} required>
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

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="price" 
                    type="number" 
                    className="pl-10 h-12 rounded-xl"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Банк</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="bank" 
                    className="pl-10 h-12 rounded-xl"
                    value={formData.bank}
                    onChange={(e) => setFormData({...formData, bank: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="quantity" 
                    type="number" 
                    className="pl-10 h-12 rounded-xl"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea 
              id="description" 
              className="min-h-[120px] rounded-xl resize-none"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 font-bold" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </form>
      </div>
    </div>
  );
}
