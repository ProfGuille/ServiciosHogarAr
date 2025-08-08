// frontend/public/sw.js
// Service Worker para PWA ServiciosHogar
// Version 1.0 - Advanced PWA features

const CACHE_NAME = 'servicios-hogar-v1.0';
const RUNTIME_CACHE = 'servicios-hogar-runtime';
const STATIC_CACHE = 'servicios-hogar-static';
const API_CACHE = 'servicios-hogar-api';
const IMAGE_CACHE = 'servicios-hogar-images';

// Recursos para cache inicial
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  'stale-while-revalidate': async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    return cachedResponse || fetchPromise;
  },
  
  'network-first': async (request, cacheName, timeout = 3000) => {
    const cache = await caches.open(cacheName);
    
    try {
      const networkResponse = await Promise.race([
        fetch(request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
      
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },
  
  'cache-first': async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }
};

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Pre-caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('servicios-hogar-') && 
                cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE &&
                cacheName !== STATIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim()
    ])
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  try {
    // API requests - Network first con cache fallback
    if (url.pathname.startsWith('/api/')) {
      return await CACHE_STRATEGIES['network-first'](request, API_CACHE);
    }
    
    // Imágenes - Cache first
    if (request.destination === 'image') {
      return await CACHE_STRATEGIES['cache-first'](request, IMAGE_CACHE);
    }
    
    // CSS, JS - Stale while revalidate
    if (request.destination === 'style' || 
        request.destination === 'script' ||
        url.pathname.includes('.css') ||
        url.pathname.includes('.js')) {
      return await CACHE_STRATEGIES['stale-while-revalidate'](request, STATIC_CACHE);
    }
    
    // Páginas HTML - Network first
    if (request.destination === 'document' || 
        request.headers.get('accept')?.includes('text/html')) {
      try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Fallback to cache or offline page
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Show offline page
        return caches.match('/offline.html');
      }
    }
    
    // Otros recursos - Network first
    return await fetch(request);
    
  } catch (error) {
    console.error('Request failed:', error);
    
    // Fallback para requests fallidos
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

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
    icon = '/icons/icon-192x192.png',
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
    actions: actions.slice(0, 2),
    tag,
    requireInteraction,
    vibrate: [100, 50, 100],
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
    switch (action) {
      case 'view':
        urlToOpen = data.url || '/';
        break;
      case 'reply':
        urlToOpen = data.conversationUrl || '/messages';
        break;
      case 'dismiss':
        return;
      default:
        urlToOpen = data.url || '/';
    }
  } else {
    urlToOpen = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar una ventana/tab que ya esté en el dominio
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
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

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar datos pendientes
    console.log('Performing background sync...');
    
    // Aquí puedes sincronizar datos offline
    // Por ejemplo, enviar mensajes pendientes, subir imágenes, etc.
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Periodically clean old cache entries
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCacheEntries());
  }
});

async function cleanOldCacheEntries() {
  const cacheNames = [RUNTIME_CACHE, API_CACHE, IMAGE_CACHE];
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseTime = new Date(dateHeader).getTime();
          if (now - responseTime > maxAge) {
            await cache.delete(request);
            console.log('Deleted old cache entry:', request.url);
          }
        }
      }
    }
  }
}

// Update check
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.ports[0].postMessage({
      type: 'UPDATE_AVAILABLE',
      available: false // Implementar lógica de actualización
    });
  }
});

console.log('Service Worker loaded successfully - Version 1.0');