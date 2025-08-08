// frontend/src/components/pwa/PWAUpdateNotification.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleServiceWorkerUpdate = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (registration) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nueva versión disponible
                    setWaitingWorker(newWorker);
                    setShowUpdate(true);
                  }
                });
              }
            });

            // Verificar si ya hay un worker esperando
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setShowUpdate(true);
            }
          }
        } catch (error) {
          console.error('Error checking for service worker updates:', error);
        }
      }
    };

    handleServiceWorkerUpdate();

    // Escuchar mensajes del service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setShowUpdate(true);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Escuchar cuando el nuevo service worker tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      // Fallback: recargar la página
      window.location.reload();
    }
    
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    
    // No mostrar nuevamente en esta sesión
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // No mostrar si fue descartado en esta sesión
  if (!showUpdate || sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border border-green-200 bg-green-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-green-900">
                Actualización disponible
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Nueva versión de ServiciosHogar está lista. Actualiza para obtener las últimas mejoras.
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-green-600"
                >
                  Después
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 h-auto text-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para manejar actualizaciones PWA
export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (registration) {
            // Verificar actualizaciones cada 5 minutos
            setInterval(() => {
              registration.update();
            }, 5 * 60 * 1000);

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                  }
                });
              }
            });

            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setUpdateAvailable(true);
            }
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }
    };

    checkForUpdates();
  }, []);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  return {
    updateAvailable,
    updateApp
  };
}