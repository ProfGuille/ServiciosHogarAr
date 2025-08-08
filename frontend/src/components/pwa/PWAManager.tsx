import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAManager() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swStatus, setSwStatus] = useState<'installing' | 'installed' | 'updating' | 'error' | null>(null);
  const [notificationsPermission, setNotificationsPermission] = useState(Notification.permission);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      
      // For iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({
        title: "App Instalada",
        description: "ServiciosHogar se ha instalado correctamente en tu dispositivo.",
      });
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        setSwStatus('installing');
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSwRegistration(registration);
        setSwStatus('installed');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          setSwStatus('updating');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setSwStatus('installed');
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            setUpdateAvailable(event.data.available);
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setSwStatus('error');
      }
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS, show manual installation instructions
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast({
          title: "Instalar App",
          description: "Toca el botón 'Compartir' y luego 'Agregar a pantalla de inicio'",
        });
        return;
      }
      
      toast({
        title: "Ya instalada",
        description: "La app ya está instalada o tu navegador no soporta instalación.",
        variant: "default",
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta notificaciones.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás notificaciones sobre tus servicios.",
        });
        
        // Subscribe to push notifications if service worker is available
        if (swRegistration) {
          await subscribeToPushNotifications();
        }
      } else {
        toast({
          title: "Notificaciones desactivadas",
          description: "Puedes activarlas desde la configuración del navegador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!swRegistration) return;

    try {
      // Generate VAPID key (in production, get this from your server)
      const vapidPublicKey = 'BNxOiKjFwAZ7xURy8SvtBNhSKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to your server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const getStatusIcon = () => {
    switch (swStatus) {
      case 'installing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'installed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'updating':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (swStatus) {
      case 'installing':
        return 'Instalando...';
      case 'installed':
        return 'Instalado';
      case 'updating':
        return 'Actualizando...';
      case 'error':
        return 'Error';
      default:
        return 'No disponible';
    }
  };

  return (
    <div className="space-y-4">
      {/* PWA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>App Móvil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Installation Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isInstalled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Download className="h-5 w-5 text-blue-500" />
              )}
              <div>
                <p className="font-medium">
                  {isInstalled ? 'App Instalada' : 'Instalar App'}
                </p>
                <p className="text-sm text-gray-600">
                  {isInstalled 
                    ? 'La app está instalada en tu dispositivo'
                    : 'Instala para acceso rápido y funciones offline'
                  }
                </p>
              </div>
            </div>
            {!isInstalled && (deferredPrompt || /iPad|iPhone|iPod/.test(navigator.userAgent)) && (
              <Button onClick={handleInstall} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
            )}
          </div>

          {/* Service Worker Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Service Worker</p>
                <p className="text-sm text-gray-600">{getStatusText()}</p>
              </div>
            </div>
            {updateAvailable && (
              <Button onClick={handleUpdate} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            )}
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {isOnline ? 'En línea' : 'Sin conexión'}
                </p>
                <p className="text-sm text-gray-600">
                  {isOnline 
                    ? 'Conectado a internet'
                    : 'Modo offline - funcionalidad limitada'
                  }
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Conectado' : 'Offline'}
            </Badge>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className={`h-5 w-5 ${
                notificationsPermission === 'granted' 
                  ? 'text-green-500' 
                  : notificationsPermission === 'denied'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`} />
              <div>
                <p className="font-medium">Notificaciones</p>
                <p className="text-sm text-gray-600">
                  {notificationsPermission === 'granted' 
                    ? 'Activadas'
                    : notificationsPermission === 'denied'
                    ? 'Bloqueadas'
                    : 'No configuradas'
                  }
                </p>
              </div>
            </div>
            {notificationsPermission !== 'granted' && (
              <Button onClick={handleNotificationPermission} size="sm" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Activar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Funciones de la App</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <WifiOff className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Modo Offline</p>
                <p className="text-sm text-gray-600">Funciona sin internet</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Bell className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Notificaciones Push</p>
                <p className="text-sm text-gray-600">Alertas instantáneas</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Instalación Nativa</p>
                <p className="text-sm text-gray-600">Como app nativa</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Actualizaciones Auto</p>
                <p className="text-sm text-gray-600">Siempre actualizada</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Installable:</strong> {deferredPrompt ? 'Yes' : 'No'}</p>
              <p><strong>Installed:</strong> {isInstalled ? 'Yes' : 'No'}</p>
              <p><strong>SW Status:</strong> {swStatus || 'Unknown'}</p>
              <p><strong>Notifications:</strong> {notificationsPermission}</p>
              <p><strong>Online:</strong> {isOnline ? 'Yes' : 'No'}</p>
              <p><strong>Update Available:</strong> {updateAvailable ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}