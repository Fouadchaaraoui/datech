const CACHE_NAME = 'datech-gestion-shell-v1';
const SHELL = [
  '/gestion/',
  '/gestion/index.html',
  '/gestion/styles.css',
  '/gestion/app.js',
  '/gestion/manifest.webmanifest',
  '/gestion/icon.svg',
  '/gestion/icon-192.svg',
  '/gestion/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('datech-gestion-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Keep Supabase and CDN traffic online and outside the shell cache.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/gestion/')) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(async () => (await caches.match(request)) || caches.match('/gestion/')));
});

