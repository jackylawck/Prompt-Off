// sw.js - Prompt Offline Service Worker
const CACHE_NAME = 'prompt-off-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './engine.js',
  './rules.js',
  './manifest.json',
  './PromptOfficon-192.png',
  './PromptOfficon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Prompt Offline 快取安裝完成');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
