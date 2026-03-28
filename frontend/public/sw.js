const CACHE_NAME = 'quantum-project-cache-v1';

// Only truly immutable assets are precached.
// Auth-sensitive routes such as '/' are intentionally excluded —
// they must always be resolved from the network to respect the current session.
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/fallback/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(console.error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigation / document requests: network-first, offline.html as fallback.
  // This ensures auth-dependent redirects always reflect the live session state.
  if (event.request.mode === 'navigate' || (event.request.headers.get('Accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/fallback/offline.html').then(
          (fallback) => fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        )
      )
    );
    return;
  }

  // All other GET requests (static assets, API, etc.): cache-first.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return new Response('', { status: 408, statusText: 'Request timeout.' });
      });
    })
  );
});

// Push notification — Phase 7 implementation
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Quantum Project',
      body: event.data.text(),
      url: '/session',
    };
  }

  const { title, body, icon, badge, url } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/badge-72.png',
      data: { url: url || '/session' },
      vibrate: [100, 50, 100],
      requireInteraction: false,
    })
  );
});

// Notification click — navigate to session
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/session';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

