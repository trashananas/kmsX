
"use client";

import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MobileFullscreenPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Проверяем, мобильное ли устройство и не в полноэкранном ли оно уже режиме
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      // Показываем, если мобила и не в standalone режиме (для PWA) и не в фулскрине
      if (mobile && !window.matchMedia('(display-mode: standalone)').matches && !document.fullscreenElement) {
        setIsVisible(true);
      }
    };

    checkMobile();
  }, []);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) { /* IE11 */
      (elem as any).msRequestFullscreen();
    }
    setIsVisible(false);
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-sm animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
          <Maximize2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Полноэкранный режим</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Скрыть строку браузера</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleFullscreen}
            className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-tight bg-primary text-white"
          >
            Ок
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsVisible(false)}
            className="rounded-xl h-10 w-10 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
