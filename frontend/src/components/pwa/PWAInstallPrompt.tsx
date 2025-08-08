import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  X, 
  Smartphone, 
  Zap,
  Wifi,
  Bell,
  Share2,
  CheckCircle
} from 'lucide-react';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'card' | 'button' | 'floating';
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
  autoShow?: boolean;
}

export function PWAInstallPrompt({ 
  variant = 'banner',
  className = '',
  onInstall,
  onDismiss,
  autoShow = true 
}: PWAInstallPromptProps) {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    notificationsPermission,
    requestNotificationPermission
  } = usePWA();

  useEffect(() => {
    if (autoShow && isInstallable && !isInstalled && !dismissed) {
      // Show prompt after a short delay to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, isInstallable, isInstalled, dismissed]);

  useEffect(() => {
    // Hide prompt if app gets installed
    if (isInstalled) {
      setShowPrompt(false);
    }
  }, [isInstalled]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowPrompt(false);
      onInstall?.();
      
      toast({
        title: "App instalada",
        description: "ServiciosHogar se instaló correctamente en tu dispositivo.",
      });
    } catch (error) {
      console.error('Installation failed:', error);
      
      // For iOS, show manual instructions
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast({
          title: "Instalar en iOS",
          description: "Toca el botón 'Compartir' (⎋) y luego 'Agregar a pantalla de inicio'",
        });
      } else {
        toast({
          title: "Error de instalación",
          description: "No se pudo instalar la app. Tu navegador puede no soportar esta función.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    onDismiss?.();
    
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-dismissed', JSON.stringify({
      timestamp: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }));
  };

  const handleNotifications = async () => {
    try {
      await requestNotificationPermission();
      toast({
        title: "Notificaciones activadas",
        description: "Recibirás notificaciones sobre tus servicios.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron activar las notificaciones.",
        variant: "destructive",
      });
    }
  };

  // Don't show if app is already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  // Check if dismissed and still within dismissal period
  if (dismissed || !showPrompt) {
    const dismissedData = localStorage.getItem('pwa-dismissed');
    if (dismissedData) {
      try {
        const { expires } = JSON.parse(dismissedData);
        if (Date.now() < expires) {
          return null;
        }
      } catch (error) {
        // Invalid data, continue to show prompt
      }
    }
  }

  // Button variant - just the install button
  if (variant === 'button') {
    return (
      <Button onClick={handleInstall} className={className}>
        <Download className="h-4 w-4 mr-2" />
        Instalar App
      </Button>
    );
  }

  // Floating variant - fixed position button
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="shadow-lg border-0 bg-blue-600 text-white">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6" />
              <div className="flex-1">
                <p className="text-sm font-medium">Instalar App</p>
                <p className="text-xs opacity-90">Acceso rápido</p>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="secondary" onClick={handleInstall}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Banner variant - full width notification bar
  if (variant === 'banner') {
    return (
      <div className={`sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">
                  Instala ServiciosHogar en tu dispositivo
                </p>
                <p className="text-xs opacity-90">
                  Acceso rápido y funciones offline
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleInstall}
                className="text-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant - full feature card
  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Instala ServiciosHogar
              </h3>
              <p className="text-sm text-gray-600">
                Obtén la mejor experiencia con nuestra app
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="h-4 w-4 text-green-500" />
            <span>Carga rápida</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Wifi className="h-4 w-4 text-blue-500" />
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Bell className="h-4 w-4 text-orange-500" />
            <span>Notificaciones</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Share2 className="h-4 w-4 text-purple-500" />
            <span>Fácil compartir</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </Button>
          
          {notificationsPermission !== 'granted' && (
            <Button variant="outline" onClick={handleNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </Button>
          )}
        </div>

        {/* Network status */}
        <div className="mt-3 flex items-center justify-center">
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Sin conexión
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
      window.removeEventListener('appinstalled', handleAppInstalled);
