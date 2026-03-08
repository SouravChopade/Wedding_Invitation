const CACHE_NAME = 'wedding-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // If you keep the audio file, caching it helps offline launch
  './assets/music/soft-shehnai.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Network-first for HTML, cache-first for other assets
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, copy));
        return resp;
      }).catch(() => caches.match(request).then(r => r || caches.match('./')))
    );
  } else {
    e.respondWith(
      caches.match(request).then(r => r || fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, copy));
        return resp;
      }))
    );
  }
});