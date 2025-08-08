import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isLoading: boolean;
  swStatus: 'installing' | 'installed' | 'updating' | 'error' | null;
  notificationsSupported: boolean;
  notificationsPermission: NotificationPermission;
  updateAvailable: boolean;
  installApp: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  updateServiceWorker: () => void;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  shareContent: (data: ShareData) => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [swStatus, setSwStatus] = useState<'installing' | 'installed' | 'updating' | 'error' | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>('default');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const notificationsSupported = 'Notification' in window;
  const isInstallable = !!deferredPrompt || /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Initialize PWA state
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Check if app is installed
        checkInstallationStatus();
        
        // Initialize notifications permission
        if (notificationsSupported) {
          setNotificationsPermission(Notification.permission);
        }

        // Register service worker
        await registerServiceWorker();

        // Set up event listeners
        setupEventListeners();

      } catch (error) {
        console.error('PWA initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanupEventListeners();
    };
  }, []);

  const checkInstallationStatus = () => {
    // Check if running in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
    // Check for iOS standalone mode
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check for Android installed PWA
    if (document.referrer.includes('android-app://')) {
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      setSwStatus('installing');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setSwRegistration(registration);
      setSwStatus('installed');

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        setSwStatus('updating');
        
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed, update available');
              setUpdateAvailable(true);
              setSwStatus('installed');
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(event.data.available);
        }
      });

      // Check for existing waiting service worker
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setSwStatus('error');
    }
  };

  const setupEventListeners = () => {
    // Install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('Install prompt available');
    };

    // App installed event
    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Network status events
    const handleOnline = () => {
      console.log('App came online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('App went offline');
      setIsOnline(false);
    };

    // Visibility change (for refreshing when app becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden && swRegistration) {
        swRegistration.update();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store cleanup function
    window.pwaCleanup = () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const cleanupEventListeners = () => {
    if (window.pwaCleanup) {
      window.pwaCleanup();
      delete window.pwaCleanup;
    }
  };

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Install prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      
      return outcome;
    } catch (error) {
      console.error('Install prompt error:', error);
      throw error;
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!notificationsSupported) {
      throw new Error('Notifications not supported');
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);
      
      if (permission === 'granted' && swRegistration) {
        // Subscribe to push notifications
        try {
          await subscribeToPushNotifications(swRegistration);
        } catch (error) {
          console.error('Push subscription failed:', error);
        }
      }
      
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      throw error;
    }
  }, [notificationsSupported, swRegistration]);

  const subscribeToPushNotifications = async (registration: ServiceWorkerRegistration) => {
    try {
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return existingSubscription;
      }

      // Subscribe to push notifications
      // Note: In production, you'll need to generate proper VAPID keys
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
        'BNxOiKjFwAZ7xURy8SvtBNhSKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log('Push notification subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    }
  };

  const updateServiceWorker = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      
      // Reload the page to use the new service worker
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [swRegistration]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!notificationsSupported) {
      throw new Error('Notifications not supported');
    }

    if (notificationsPermission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      // Use service worker notification if available (for better reliability)
      if (swRegistration) {
        await swRegistration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge.png',
          ...options,
        });
      } else {
        // Fallback to direct notification
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options,
        });
      }
    } catch (error) {
      console.error('Show notification error:', error);
      throw error;
    }
  }, [notificationsSupported, notificationsPermission, swRegistration]);

  const shareContent = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Web Share API error:', error);
        throw error;
      }
    } else {
      // Fallback to clipboard API
      if (navigator.clipboard && data.url) {
        try {
          await navigator.clipboard.writeText(data.url);
          console.log('URL copied to clipboard');
        } catch (error) {
          console.error('Clipboard API error:', error);
          throw error;
        }
      } else {
        throw new Error('Sharing not supported');
      }
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isLoading,
    swStatus,
    notificationsSupported,
    notificationsPermission,
    updateAvailable,
    installApp,
    requestNotificationPermission,
    updateServiceWorker,
    showNotification,
    shareContent,
  };
}

// Extend window object for cleanup function
declare global {
  interface Window {
    pwaCleanup?: () => void;
  }
}