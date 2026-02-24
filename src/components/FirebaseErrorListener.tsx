'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Компонент-слушатель глобальных ошибок Firebase.
 * Вместо того чтобы ломать приложение (throw), он показывает дружелюбное уведомление.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Логируем для отладки в консоль (но не ломаем UI)
      console.warn('kmsX: Ошибка доступа к данным', error.request);
      
      // Показываем пользователю красивый тост
      toast({
        variant: "destructive",
        title: "Ой! Что-то пошло не так",
        description: "У нас возникла заминка с доступом к данным. Мы уже работаем над этим!",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // Этот компонент ничего не рендерит
  return null;
}
