// Service Worker Minimalista para PWA
const CACHE_NAME = 'entregas-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through padrão para evitar bloqueios de API
  return;
});

// Listener para Notificações Web Push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nova Entrega', body: 'Você tem uma nova atualização.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
  );
});
