/* Strictly scoped to /go/ — no caching of other Christian Culture services. */
const CACHE = 'ccgo-shell-v2.2.0';
const SHELL = ['/go/','/go/index.html','/go/styles.css?v=2.2.0','/go/app.js?v=2.2.0','/go/config.js','/go/catalog.json','/go/assets/icon.svg','/go/assets/social-card.svg','/go/assets/fonts/montserrat-latin-wght-normal.woff2','/go/assets/fonts/montserrat-latin-ext-wght-normal.woff2'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ccgo-shell-')&&k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith('/go/')) return;
  if(req.mode === 'navigate') { event.respondWith(fetch(req).catch(()=>caches.match('/go/'))); return; }
  if(url.pathname.endsWith('/catalog.json') || url.pathname.endsWith('/config.js')) { event.respondWith(fetch(req).then(response=> { if(response.ok){const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(req,copy));} return response; }).catch(()=>caches.match(req))); return; }
  event.respondWith(caches.match(req).then(cached=>cached || fetch(req)));
});
