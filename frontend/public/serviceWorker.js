// ElectroNetScan Service Worker
const CACHE_NAME = 'electronet-scan-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/manifest.json'
  // Os arquivos CSS e JS são gerados dinamicamente pelo webpack com hashes
  // Não podemos listar arquivos específicos aqui
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        // Cache only the known static assets
        return cache.addAll(STATIC_ASSETS)
          .catch(error => {
            console.error('Failed to cache some assets:', error);
            // Continue even if some assets fail to cache
            return Promise.resolve();
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Network-first strategy for API calls - com proteção contra loop
const apiStrategy = async (request) => {
  // Não armazenar em cache requisições POST para evitar loops
  if (request.method === 'POST') {
    try {
      return await fetch(request);
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      return new Response(JSON.stringify({ success: false, error: 'Erro de rede' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Para requisições GET, usar estratégia network-first com cache
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone the response before using it to avoid consuming it
    const responseToCache = networkResponse.clone();
    
    // Cache the response for future use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, responseToCache);
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('No network or cache response available');
  }
};

// Cache-first strategy for static assets
const cacheFirstStrategy = async (request) => {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error in cache-first strategy:', error);
    // Return a fallback response or rethrow
    return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
};

// Fetch event - handle different strategies based on request type
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // API calls use network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(request));
    return;
  }
  
  // Static assets use cache-first strategy
  event.respondWith(cacheFirstStrategy(request));
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New network activity detected',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ElectroNetScan Alert',
      options
    )
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
