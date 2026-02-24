
"use client";

import { use, useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  ChevronLeft, 
  Package, 
  MoreVertical, 
  MapPin, 
  Wallet, 
  Phone, 
  CheckCircle2,
  AlertCircle,
  Banknote,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChatDetailPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messageText, setMessageText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  const chatRef = useMemoFirebase(() => doc(firestore, 'chats', chatId), [firestore, chatId]);
  const { data: chat } = useDoc(chatRef as any);

  const messagesQuery = useMemoFirebase(() => 
    query(collection(firestore, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
  , [firestore, chatId]);
  const { data: messages } = useCollection(messagesQuery);

  const sellerRef = useMemoFirebase(() => chat ? doc(firestore, 'users', chat.sellerId) : null, [firestore, chat?.sellerId]);
  const { data: sellerProfile } = useDoc(sellerRef as any);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string, type: string = 'text', extra = {}) => {
    if (!user || !text.trim()) return;
    const msgCol = collection(firestore, 'chats', chatId, 'messages');
    addDocumentNonBlocking(msgCol, {
      senderId: user.uid,
      text: text,
      type: type,
      createdAt: new Date().toISOString(),
      ...extra
    });
    updateDocumentNonBlocking(chatRef as any, {
      lastMessage: type === 'text' ? text : 'Системное сообщение',
      updatedAt: new Date().toISOString()
    });
    setMessageText('');
  };

  const handleOfferPrice = () => {
    const price = parseFloat(offerPrice);
    if (isNaN(price)) return;
    sendMessage(`Предложена цена: ${price} ₽`, 'offer', { offerPrice: price, offerStatus: 'pending' });
    setIsOfferDialogOpen(false);
    setOfferPrice('');
  };

  const handleAcceptOffer = (msg: any) => {
    const msgRef = doc(firestore, 'chats', chatId, 'messages', msg.id);
    updateDocumentNonBlocking(msgRef, { offerStatus: 'accepted' });
    sendMessage(`Продавец принял предложение цены: ${msg.offerPrice} ₽`, 'system');
  };

  const handleDeclineOffer = (msg: any) => {
    const msgRef = doc(firestore, 'chats', chatId, 'messages', msg.id);
    updateDocumentNonBlocking(msgRef, { offerStatus: 'declined' });
    sendMessage(`Продавец отклонил предложение цены`, 'system');
  };

  const sendLocationInfo = () => {
    if (!sellerProfile) return;
    const infoText = `Адрес: ${sellerProfile.address || 'не указан'}, Эт: ${sellerProfile.floor || '-'}, Кв: ${sellerProfile.apartment || '-'}, Код: ${sellerProfile.intercom || '-'}, Тел: ${sellerProfile.phone || '-'}, Банк: ${sellerProfile.bank || '-'}`;
    sendMessage(infoText, 'info', { 
      infoData: {
        address: sellerProfile.address,
        floor: sellerProfile.floor,
        apartment: sellerProfile.apartment,
        intercom: sellerProfile.intercom,
        addressComment: sellerProfile.addressComment,
        phone: sellerProfile.phone,
        bank: sellerProfile.bank
      } 
    });
  };

  const markAsDelivered = () => {
    updateDocumentNonBlocking(chatRef as any, { dealStatus: 'delivered', updatedAt: new Date().toISOString() });
    sendMessage('Продавец отметил товар как переданный. Покупатель, пожалуйста, подтвердите получение.', 'system');
  };

  const confirmReceipt = () => {
    updateDocumentNonBlocking(chatRef as any, { 
      dealStatus: 'completed', 
      status: 'archived', 
      updatedAt: new Date().toISOString() 
    });
    sendMessage('Сделка завершена! Товар получен покупателем.', 'system');
    toast({ title: "Сделка завершена!", description: "Товар перенесен в ваши покупки." });
  };

  if (!chat || !user) return null;

  const isSeller = user.uid === chat.sellerId;
  const isBuyer = user.uid === chat.buyerId;

  return (
    <div className="fixed inset-0 top-16 bg-background flex flex-col z-40">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center gap-4 shadow-sm shrink-0">
        <Link href="/chats">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border">
          <img src={chat.itemImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate leading-tight">{chat.itemTitle}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] py-0 px-1 rounded-md bg-muted/50 border-none">
              {isSeller ? 'Продажа' : 'Покупка'}
            </Badge>
            {chat.dealStatus === 'delivered' && <span className="text-[10px] text-emerald-600 font-bold uppercase animate-pulse">Ожидает подтверждения</span>}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56">
            {isSeller && (
              <>
                <DropdownMenuItem onClick={sendLocationInfo} className="rounded-xl p-3 gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Прислать мои контакты
                </DropdownMenuItem>
                <DropdownMenuItem onClick={markAsDelivered} className="rounded-xl p-3 gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Я передал вещь
                </DropdownMenuItem>
              </>
            )}
            {isBuyer && chat.dealStatus === 'delivered' && (
              <DropdownMenuItem onClick={confirmReceipt} className="rounded-xl p-3 gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Я получил вещь
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages list */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20"
      >
        {messages?.map((msg) => {
          const isOwn = msg.senderId === user.uid;
          
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-muted text-muted-foreground text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === 'offer') {
            return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className="max-w-[85%] bg-white p-5 rounded-[2rem] shadow-sm border-2 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Предложение цены</span>
                  </div>
                  <p className="text-2xl font-black text-primary mb-4">{msg.offerPrice} ₽</p>
                  
                  {msg.offerStatus === 'pending' && isSeller && !isOwn && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAcceptOffer(msg)} className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600">Да</Button>
                      <Button onClick={() => handleDeclineOffer(msg)} variant="outline" className="flex-1 h-10 rounded-xl border-rose-200 text-rose-500">Нет</Button>
                    </div>
                  )}
                  {msg.offerStatus !== 'pending' && (
                    <Badge className={cn(
                      "w-full justify-center h-8 rounded-lg font-bold",
                      msg.offerStatus === 'accepted' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}>
                      {msg.offerStatus === 'accepted' ? 'Принято' : 'Отклонено'}
                    </Badge>
                  )}
                </div>
              </div>
            );
          }

          if (msg.type === 'info') {
             return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className="max-w-[85%] bg-primary text-white p-6 rounded-[2.5rem] shadow-xl shadow-primary/20">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6" />
                    <span className="font-bold text-lg">Данные для встречи</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="opacity-70">Адрес:</span>
                      <span className="font-bold">{msg.infoData?.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="opacity-70">Этаж/Кв:</span>
                      <span className="font-bold">{msg.infoData?.floor} эт, кв {msg.infoData?.apartment}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="opacity-70">Домофон:</span>
                      <span className="font-bold">{msg.infoData?.intercom}</span>
                    </div>
                    {msg.infoData?.addressComment && (
                      <div className="p-3 bg-white/10 rounded-xl flex gap-2 border border-white/10">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-xs italic">{msg.infoData.addressComment}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="opacity-70">Телефон:</span>
                      <span className="font-bold">{msg.infoData?.phone}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="opacity-70">Оплата на:</span>
                      <span className="font-bold uppercase">{msg.infoData?.bank}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-5 py-3 rounded-[1.5rem] text-sm shadow-sm",
                isOwn ? "bg-primary text-white rounded-br-none" : "bg-white text-foreground rounded-bl-none"
              )}>
                {msg.text}
                <div className={cn("text-[9px] mt-1 text-right", isOwn ? "text-white/70" : "text-muted-foreground")}>
                  {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t shrink-0 flex flex-col gap-3">
        {isBuyer && chat.dealStatus === 'pending' && (
          <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-10 rounded-xl border-dashed border-primary/40 text-primary gap-2 font-bold">
                <Banknote className="w-4 h-4" />
                Предложить свою цену
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Ваше предложение</DialogTitle>
                <DialogDescription>Продавец увидит вашу цену в чате и сможет согласиться или отказать.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Новая цена (₽)</Label>
                <Input 
                  type="number" 
                  value={offerPrice} 
                  onChange={e => setOfferPrice(e.target.value)}
                  className="h-12 rounded-xl mt-2"
                  placeholder="Введите сумму"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleOfferPrice} className="w-full h-12 rounded-xl">Отправить предложение</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex items-center gap-2">
          <Input 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(messageText)}
            placeholder="Напишите сообщение..." 
            className="flex-1 h-12 rounded-2xl bg-muted/30 border-none px-6"
          />
          <Button 
            onClick={() => sendMessage(messageText)}
            className="h-12 w-12 rounded-2xl p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
