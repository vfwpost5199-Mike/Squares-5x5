const CACHE = 'squares-5x5-v2';
const PRECACHE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (e.request.method !== 'GET' || url.includes('script.google.com')) return;

  if (e.request.mode === 'navigate' || url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return r;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))),
    );
    return;
  }

  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});