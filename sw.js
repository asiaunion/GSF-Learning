// Service Worker — 알림 전송 및 오프라인 캐싱 지원
const CACHE = 'gsf-learning-v1';
const PRECACHE = ['/', '/index.html', '/app.js', '/style.css', '/images/joseph_anime.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// 메인 스레드에서 알림 요청을 받아 표시
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, e.data.options);
  }
});

// 알림 클릭 시 앱 포커스 또는 열기
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
