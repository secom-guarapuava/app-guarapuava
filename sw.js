/* Firebase Cloud Messaging — background push do protótipo PWA.
   Mantido no mesmo service worker do app para não conflitar com o PWA/offline. */
try {
  importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyDWubN_x02rkf6I-pcrjpn5_RxVBwERXDk",
    authDomain: "guarapuava-digital.firebaseapp.com",
    projectId: "guarapuava-digital",
    storageBucket: "guarapuava-digital.firebasestorage.app",
    messagingSenderId: "63340791037",
    appId: "1:63340791037:web:0996e4a52e3e81ea022a94",
    measurementId: "G-M3WS14TQK6"
  });

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notification = payload && payload.notification ? payload.notification : {};
    const data = payload && payload.data ? payload.data : {};
    const link = (payload && payload.fcmOptions && payload.fcmOptions.link) || data.link || './index.html';
    const title = notification.title || data.title || 'Guarapuava Digital';
    const options = {
      body: notification.body || data.body || 'Nova notificação da Prefeitura.',
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: { url: link }
    };
    self.registration.showNotification(title, options);
  });
} catch (err) {
  // O cache/offline do PWA continua funcionando mesmo se o Firebase não carregar.
  console.warn('[SW][FCM]', err);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

/* Guarapuava Digital — Service Worker
   Cache-first do app shell para funcionar offline e permitir instalação (PWA).
   Para forçar atualização, suba o número da versão abaixo. */
const VERSION = 'guarapuava-digital-v2';
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
