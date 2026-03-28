const CACHE_NAME = 'offline-dictionary-v2';
const DB_CACHE_NAME = 'offline-dictionary-db-v1';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

const dbUrlsToCache = [
  '/wordnetFull.db'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache)),
      caches.open(DB_CACHE_NAME)
        .then((cache) => cache.addAll(dbUrlsToCache))
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DB_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.endsWith('.db')) {
    event.respondWith(
      caches.open(DB_CACHE_NAME)
        .then((dbCache) => {
          return dbCache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    dbCache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                });
            });
        })
    );
  } else {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request);
        })
    );
  }
});
