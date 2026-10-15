/* nutrition.mcbflow.com service worker · MB Suite v3 template.
   Network-first for the app's own files, cache as the offline fallback. Never touches user data
   (localStorage / IndexedDB are not involved), never intercepts non-GET or cross-origin requests.
   BUMP VERSION ON EVERY RELEASE so old cached files are dropped. */
const VERSION = 'nutrition-v1.8';
const SHELL = ['./', 'index.html', 'manifest.json', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'mb-suite-core.css?v=1.8', 'mb-suite-cutouts.css?v=1.8', 'mb-suite-sidebar.css?v=1.8', 'mb-suite-v3.css?v=1.8', 'mb-suite-topbar.css?v=1.8', 'mb-title.js?v=1.8', 'mb-install.js?v=1.8', 'mb-share.js?v=1.8', 'mb-sync.js?v=1.8', 'vendor/supabase.js', 'app.js?v=1.8', 'privacy.html', 'terms.html', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'foods-db.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nutrition-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // nothing cross-origin is cached
  e.respondWith(
    fetch(req, { cache: 'no-cache' })   // always ask the server, so a new release shows on the next load
      .then(res => { if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
