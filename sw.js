/* Guarapuava Digital — Service Worker
   Cache-first do app shell para funcionar offline e permitir instalação (PWA).
   Para forçar atualização, suba o número da versão abaixo. */
const VERSION = 'guarapuava-digital-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './brasao.png',
  './brasao-icon.png',
  './brasao-guarapuava.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Só tratamos GET de mesma origem; links oficiais externos passam direto pela rede.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Navegação: tenta a rede, cai para o cache (index.html) quando offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Demais recursos: cache primeiro, com atualização em segundo plano.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
