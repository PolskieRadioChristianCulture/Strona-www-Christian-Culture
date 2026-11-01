/* topTEN — service worker powiadomień (zakres /topTEN/).
 * Push przychodzi bez treści (VAPID); treść pobieramy z API dla tej subskrypcji. */
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    const sub = await self.registration.pushManager.getSubscription();
    let items = [];
    if (sub) {
      try {
        const res = await fetch('/api/topten/push/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        items = (await res.json()).items || [];
      } catch { items = []; }
    }
    if (!items.length) items = [{ title: 'topTEN Christian Culture', body: 'Zmiana w notowaniu obserwowanego utworu.', url: '/topTEN/' }];
    await Promise.all(items.map((n) => self.registration.showNotification(n.title, {
      body: n.body,
      icon: '/topTEN/assets/topten-logo.png',
      tag: `topten-${n.url}`,
      data: { url: n.url },
    })));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/topTEN/', self.location.origin).toString();
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find((w) => w.url.startsWith(`${self.location.origin}/topTEN/`));
    if (open) { await open.focus(); return open.navigate(url); }
    return clients.openWindow(url);
  })());
});
