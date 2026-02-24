
"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { MapPin, Phone, Wallet, Building2, User, Info } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [firestore, user?.uid]);
  
  const { data: profile, isLoading } = useDoc(userRef as any);

  const [formData, setFormData] = useState({
    username: '',
    address: '',
    floor: '',
    apartment: '',
    intercom: '',
    addressComment: '',
    phone: '',
    bank: '',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (profile && !isInitialized) {
      setFormData({
        username: profile.username || '',
        address: profile.address || '',
        floor: profile.floor || '',
        apartment: profile.apartment || '',
        intercom: profile.intercom || '',
        addressComment: profile.addressComment || '',
        phone: profile.phone || '',
        bank: profile.bank || '',
      });
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const handleSave = () => {
    if (!userRef) return;
    setDocumentNonBlocking(userRef as any, {
      ...formData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Профиль обновлен", description: "Ваши данные для чатов успешно сохранены." });
  };

  if (isLoading && !isInitialized) return <div className="container p-8">Загрузка...</div>;

  return (
    <div className="container max-w-2xl px-4 py-12 mx-auto">
      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden">
        <CardHeader className="p-10 bg-primary/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">Настройки профиля</CardTitle>
              <CardDescription>Заполните данные для авто-сообщений в чатах</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <div className="space-y-2">
            <Label>Имя пользователя</Label>
            <Input 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              placeholder="Как вас называть?"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Телефон для связи</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="pl-10 h-12 rounded-xl"
                  placeholder="+7 (999) ..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Банк для оплаты</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={formData.bank} 
                  onChange={e => setFormData({...formData, bank: e.target.value})}
                  className="pl-10 h-12 rounded-xl"
                  placeholder="Сбер, Тинькофф..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed">
            <h3 className="font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Адрес передачи вещей
            </h3>
            <div className="space-y-2">
              <Label>Улица и дом</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Этаж</Label>
                <Input value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Кв.</Label>
                <Input value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Домофон</Label>
                <Input value={formData.intercom} onChange={e => setFormData({...formData, intercom: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Комментарий (код калитки, как найти и т.д.)</Label>
              <div className="relative">
                <Info className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={formData.addressComment} 
                  onChange={e => setFormData({...formData, addressComment: e.target.value})}
                  className="pl-10 h-12 rounded-xl"
                  placeholder="Напр: калитка 1234, за углом налево..."
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
            Сохранить изменения
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
