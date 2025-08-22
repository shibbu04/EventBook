const CACHE_NAME = `event-booking-v${Date.now()}`;
const STATIC_CACHE = 'event-booking-static-v1';
const DYNAMIC_CACHE = 'event-booking-dynamic-v1';

// Essential files to cache on install
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html' // We'll create this as a fallback
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching essential files');
        return cache.addAll(urlsToCache.filter(url => url !== '/offline.html')); // Skip offline.html if it doesn't exist
      })
      .then(() => {
        console.log('Service Worker installed');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache essential files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement network-first strategy with proper fallbacks
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - always try network first
  if (request.url.includes('/api/') || request.url.includes('localhost:5000')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, clone and cache the response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.log('Network failed for API, trying cache:', error);
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets and pages - cache first, with network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          // But also update the cache in the background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, response.clone());
                });
              }
            })
            .catch(() => {
              // Ignore network errors for background updates
            });
          
          return cachedResponse;
        }
        
        // No cached response, try network
        return fetch(request)
          .then((response) => {
            // If successful, cache it
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch((error) => {
            console.log('Network failed, no cache available:', error);
            
            // For navigation requests, return the root page
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // For other requests, return a network error
            throw error;
          });
      })
  );
});
