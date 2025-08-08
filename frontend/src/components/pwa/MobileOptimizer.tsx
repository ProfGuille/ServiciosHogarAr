// frontend/src/components/pwa/MobileOptimizer.tsx
import React, { useEffect } from 'react';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export function MobileOptimizer({ children }: MobileOptimizerProps) {
  useEffect(() => {
    // Prevenir zoom en inputs en iOS
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Manejar double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Optimizar scroll en iOS
    const optimizeScroll = () => {
      document.body.style.webkitOverflowScrolling = 'touch';
    };

    // Configurar viewport para PWA
    const setupViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }

      // Detectar si es PWA instalada
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      
      if (isStandalone || isInWebAppiOS) {
        // Viewport para PWA standalone
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      } else {
        // Viewport para navegador web
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      }
    };

    // Configurar CSS custom properties para safe areas (notch)
    const setupSafeAreas = () => {
      const root = document.documentElement;
      
      // Variables CSS para safe areas
      root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
      root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
      root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
      root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    };

    // Configurar meta tags para iOS
    const setupiOSMeta = () => {
      // Status bar style
      let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
      if (!statusBarMeta) {
        statusBarMeta = document.createElement('meta');
        statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
        statusBarMeta.content = 'black-translucent';
        document.head.appendChild(statusBarMeta);
      }

      // Disable auto phone number detection
      let formatDetectionMeta = document.querySelector('meta[name="format-detection"]') as HTMLMetaElement;
      if (!formatDetectionMeta) {
        formatDetectionMeta = document.createElement('meta');
        formatDetectionMeta.name = 'format-detection';
        formatDetectionMeta.content = 'telephone=no';
        document.head.appendChild(formatDetectionMeta);
      }
    };

    // Configurar estilos CSS globales para móvil
    const setupMobileStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Optimizaciones móviles globales */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* Scroll suave en iOS */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Safe areas para notch */
        .safe-top {
          padding-top: var(--safe-area-inset-top);
        }
        
        .safe-bottom {
          padding-bottom: var(--safe-area-inset-bottom);
        }
        
        .safe-left {
          padding-left: var(--safe-area-inset-left);
        }
        
        .safe-right {
          padding-right: var(--safe-area-inset-right);
        }
        
        /* PWA standalone styles */
        @media (display-mode: standalone) {
          body {
            padding-top: var(--safe-area-inset-top);
            padding-bottom: var(--safe-area-inset-bottom);
          }
        }
        
        /* Mejores botones táctiles */
        button, .button, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        /* Optimizar rendimiento */
        .optimized-scroll {
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        /* Pull-to-refresh customizado */
        .disable-pull-refresh {
          overscroll-behavior-y: contain;
        }
      `;
      
      document.head.appendChild(style);
    };

    // Manejar cambios de orientación
    const handleOrientationChange = () => {
      // Delay para asegurar que las dimensiones se actualicen
      setTimeout(() => {
        // Recalcular viewport height para móviles
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Disparar evento personalizado para components que necesiten reajustarse
        window.dispatchEvent(new CustomEvent('orientationchange-optimized'));
      }, 100);
    };

    // Ejecutar configuraciones
    setupViewport();
    setupSafeAreas();
    setupiOSMeta();
    setupMobileStyles();
    optimizeScroll();
    handleOrientationChange();

    // Event listeners
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Aplicar clase de optimización a body
    document.body.classList.add('mobile-optimized', 'disable-pull-refresh');

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      document.body.classList.remove('mobile-optimized', 'disable-pull-refresh');
    };
  }, []);

  return <>{children}</>;
}

// Hook para detectar características móviles
export function useMobileDetection() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState(false);
  const [isPWA, setIsPWA] = React.useState(false);
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isInWebAppiOS);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    checkTouch();
    checkPWA();
    checkOrientation();

    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  return {
    isMobile,
    isTouch,
    isPWA,
    orientation
  };
}

// Hook para gestos táctiles
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 100
) {
  const [startX, setStartX] = React.useState(0);
  const [startY, setStartY] = React.useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = startX - endX;
    const diffY = startY - endY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }

    setStartX(0);
    setStartY(0);
  };

  React.useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startX, startY, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
}