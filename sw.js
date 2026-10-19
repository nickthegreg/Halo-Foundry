// Network first, falling back to the cache, so updates show up right away and the game still opens offline.
const CACHE = 'halo-foundry-v3';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Same-origin files are revalidated with the server so a reload never runs a stale copy.
  const same = new URL(req.url).origin === self.location.origin && req.mode !== 'navigate';
  e.respondWith((same ? fetch(req, { cache: 'no-cache' }) : fetch(req)).then(r => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return r;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined))));
});
