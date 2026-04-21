const CACHE_NAME = 'servicioshogar-v3';
const STATIC_ASSETS = ['/', '/icon-192.png', '/icon-512.png', '/manifest.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(new Request(e.request, { redirect: 'follow' })).catch(() => caches.match('/').then(r => r || fetch('/')))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || new Response('', { status: 408 })))
  );
});
