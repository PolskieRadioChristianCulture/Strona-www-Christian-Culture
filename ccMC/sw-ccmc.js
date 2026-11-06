// ============================================================================
// CC Mission Calendar Service Worker (/ccMC/sw-ccmc.js, scope: /ccMC/)
// Izolowany sub-scope /ccMC/ — brak kolizji z głównym Service Workerem portalu
// ============================================================================

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Christian Culture • Kalendarz Misji',
    body: 'Nowe zdarzenie w Kalendarzu Misji.',
    url: '/ccMC',
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    // Zachowaj neutralny komunikat na ekranie blokady
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.ico',
      data: { url: payload.url || '/ccMC' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/ccMC';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes('/ccMC') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});
