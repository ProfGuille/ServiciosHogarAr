// frontend/public/sw.js
// Service Worker para notificaciones push

const CACHE_NAME = 'servicios-hogar-v1';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Activar inmediatamente el service worker
  self.skipWaiting();
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Tomar control de todas las páginas abiertas
  event.waitUntil(self.clients.claim());
});

// Escuchar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData = {
        title: 'ServiciosHogar',
        body: event.data.text() || 'Nueva notificación',
      };
    }
  } else {
    notificationData = {
      title: 'ServiciosHogar',
      body: 'Nueva notificación',
    };
  }

  const {
    title = 'ServiciosHogar',
    body = 'Nueva notificación',
    icon = '/favicon.ico',
    badge = '/icons/badge.png',
    image,
    data = {},
    actions = [],
    tag = 'default',
    requireInteraction = false
  } = notificationData;

  const notificationOptions = {
    body,
    icon,
    badge,
    image,
    data: {
      ...data,
      timestamp: Date.now(),
      url: data.url || '/'
    },
    actions: actions.slice(0, 2), // Máximo 2 acciones en la mayoría de navegadores
    tag,
    requireInteraction,
    vibrate: [100, 50, 100], // Patrón de vibración
    silent: false,
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();

  let urlToOpen = '/';
  
  if (action) {
    // Manejar acciones específicas
    switch (action) {
      case 'view':
        urlToOpen = data.url || '/';
        break;
      case 'reply':
        urlToOpen = data.conversationUrl || '/messages';
        break;
      case 'dismiss':
        // Solo cerrar la notificación
        return;
      default:
        urlToOpen = data.url || '/';
    }
  } else {
    // Click en el cuerpo de la notificación
    urlToOpen = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar una ventana/tab que ya esté en el dominio
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
          // Navegar a la URL en la ventana existente
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const notification = event.notification;
  const data = notification.data || {};
  
  // Opcional: Enviar analytics sobre notificaciones cerradas
  if (data.trackClose) {
    // Aquí podrías enviar una petición de tracking
  }
});

// Sync para notificaciones offline (opcional)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sincronizar notificaciones offline
      syncOfflineNotifications()
    );
  }
});

async function syncOfflineNotifications() {
  try {
    // Aquí podrías sincronizar notificaciones que se perdieron mientras estaba offline
    console.log('Syncing offline notifications...');
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Cache básico para recursos estáticos (opcional)
self.addEventListener('fetch', (event) => {
  // Solo cachear recursos estáticos básicos
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Función para mostrar notificación personalizada
function showCustomNotification(title, options = {}) {
  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: { timestamp: Date.now() }
  };
  
  return self.registration.showNotification(title, {
    ...defaultOptions,
    ...options
  });
}

// Exportar para uso en el contexto principal (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showCustomNotification };
}