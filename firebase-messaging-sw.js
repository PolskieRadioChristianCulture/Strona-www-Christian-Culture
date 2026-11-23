// ══════════════════════════════════════════════════════════════════════════
// LUMINA FIREBASE CLOUD MESSAGING (Background Web Push for Closed App)
// ══════════════════════════════════════════════════════════════════════════
// Register before Firebase so our deep links also handle SDK-displayed notifications.
self.addEventListener('notificationclick', handleLuminaNotificationClick);
let fcmBackgroundReady = false;

try {
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
    firebase.initializeApp({
        apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
        authDomain: "lumina-cc.firebaseapp.com",
        databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "lumina-cc",
        storageBucket: "lumina-cc.firebasestorage.app",
        messagingSenderId: "413985877183",
        appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
        measurementId: "G-6440T9VBQB"
    });

    const fcmMessaging = firebase.messaging();
    fcmMessaging.onBackgroundMessage((payload) => {
        // SDK 10.12.2 already awaited display for notification payloads.
        // Only data-only messages need our custom display callback.
        if (payload.notification) return;
        const data = payload.data || {};
        const notification = payload.notification || {};
        const type = data.type || 'general';

        const title = notification.title || data.title || 'LUMINA ✨';
        const body = notification.body || data.body || data.text || 'Masz nowe powiadomienie w portalu LUMINA.';
        const origin = (self.location && self.location.origin) ? self.location.origin : 'https://polskieradio.cc';
        const defaultIcon = origin + '/images/push/push-default-192.png'; // L0 23.11.2026: zamiast białego krzyża
        const defaultBadge = origin + '/lumina-push-badge-v4.1.5.svg';
        const icon = type === 'direct_message'
            ? (data.avatar || data.icon || notification.icon || defaultIcon)
            : (notification.icon || data.icon || defaultIcon);
        const image = notification.image || data.image || data.imageUrl || (type === 'tv_schedule' ? (data.icon || data.poster || undefined) : undefined);
        let urlToOpen = data.url || '/lumina';

        let actions = [
            { action: 'open', title: 'Otwórz LUMINA 🕊️' }
        ];

        if (type === 'owner_push_test') {
            actions = [{ action: 'open', title: 'Otwórz lekcję testową' }];
        } else if (type === 'daily_course_lesson') {
            actions = [{ action: 'open', title: 'Czytaj lekcję' }];
        } else if (type === 'devotion' || type === 'ckd') {
            actions = [
                { action: 'read', title: '📖 Czytaj' },
                { action: 'share', title: '🕊️ Udostępnij' }
            ];
        } else if (type === 'new_profile') {
            actions = [
                { action: 'view', title: '👀 Zobacz Profil' },
                { action: 'welcome', title: '🕊️ Powitaj' }
            ];
            if (data.slug) urlToOpen = `./lumina-profile.html?u=${encodeURIComponent(data.slug)}`;
        } else if (type === 'new_post') {
            actions = [
                { action: 'read', title: '📖 Zobacz Wpis' },
                { action: 'like', title: '❤️ Polub' }
            ];
            if (data.postId) urlToOpen = `./lumina-tablica.html?postId=${encodeURIComponent(data.postId)}`;
        } else if (type === 'direct_message' || type === 'direct_message_request' || type === 'mention') {
            actions = [
                { action: 'reply', title: '💬 Odpowiedz' },
                { action: 'open', title: 'Otwórz Czat' }
            ];
            if (data.senderId) urlToOpen = `/lumina?openChat=${encodeURIComponent(data.senderId)}`;
        } else if (type === 'public_chat') {
            actions = [
                { action: 'open', title: '💬 Dołącz do rozmowy' }
            ];
            urlToOpen = '/lumina?openPublicChat=1' + (data.messageId ? '&messageId=' + encodeURIComponent(data.messageId) : '');
        } else if (type === 'daily_mission') {
            actions = [
                { action: 'prayer', title: '🙏 Pomódl się' },
                { action: 'blik', title: '📱 Misyjny BLIK' }
            ];
            urlToOpen = data.url || '/modlitwa';
        } else if (type === 'tv_schedule' || type === 'tv24' || type === 'live') {
            actions = [
                { action: 'watch', title: '📺 Oglądaj w CC TV24' },
                { action: 'program', title: '📋 Ramówka TV' }
            ];
            urlToOpen = data.url || '/master';
        }

        const tag = data.tag || notification.tag || data.notificationId || data.eventId || (type ? `lumina_${type}` : 'lumina_notification');
        const requireInteraction = (type === 'direct_message' || type === 'direct_message_request' || type === 'mention' || type === 'devotion' || type === 'ckd' || type === 'daily_mission');

        const notificationOptions = {
            body: body,
            icon: icon,
            badge: defaultBadge,
            image: image,
            tag: tag,
            renotify: true,
            vibrate: [200, 100, 200],
            requireInteraction: requireInteraction,
            data: {
                ...data,
                url: urlToOpen,
                type: type,
            },
            actions: actions
        };

        return self.registration.showNotification(title, notificationOptions);
    });
    fcmBackgroundReady = true;
} catch(err) {
    console.warn('[SW] Firebase unavailable; native push fallback active.');
}

// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v4.1.4)
// High-performance caching, stale-while-revalidate & offline navigation
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v4.2.6-20261123-chat-target';
const APP_SHELL_ASSETS = [
    './',
    './lumina.html',
    './lumina-tablica.html',
    './lumina-profile.html',
    './manifest-lumina.json',
    './lumina-push-badge-v4.1.5.svg',
    './lumina-badge-monochrome.png',
    './lumina-notif-icon-v2.png',
    './images/push/push-default-192.png',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './icon.png',
    './lumina_icon.jpg',
    './apel_misyjny_cc.webp?v=20260920_blik537137043',
    './apel_misyjny_cc.webp'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
                console.warn('[SW Install] Część zasobów offline pominięta:', err);
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (!request || request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }

    // STRICTLY allow ONLY http: and https: protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // STRICTLY bypass all third-party domains (Firebase, Firestore, Google Analytics, CDNs, Donorbox)
    if (url.origin !== self.location.origin) {
        return;
    }

    // Bypass dynamic streams, audio files, scripts, version checks, playlists and API calls
    if (url.pathname.includes('version.json') || 
        url.pathname.endsWith('.json') ||
        url.pathname.endsWith('app.js') ||
        url.pathname.endsWith('.mp3') || 
        url.pathname.endsWith('.m3u8') || 
        url.pathname.includes('stream') || 
        url.pathname.includes('live') || 
        url.pathname.startsWith('/api/')) {
        return;
    }

    // Allow native browser navigation for HTML pages - eliminates ERR_FAILED black screen flashes on reload
    if (request.mode === 'navigate' || request.destination === 'document') {
        return;
    }

    // Static Assets (Images, Fonts, CSS) -> Stale-While-Revalidate (Instant load from Cache + background update)
    const isStaticAsset = /\.(png|jpg|jpeg|webp|svg|gif|woff2?|ttf|css)(\?.*)?$/i.test(url.pathname);

    if (isStaticAsset) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(request, networkResponse.clone()).catch(() => {});
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }
});

// ══════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATION RECEIVER (Direct Chat, Profiles, Posts, CKD)
// ══════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = {
            notification: {
                title: 'LUMINA ✨',
                body: event.data ? event.data.text() : 'Masz nowe powiadomienie.'
            }
        };
    }

    const data = payload.data || {};
    const notification = payload.notification || {};
    // FCM's own push listener owns these messages (foreground and background).
    if (payload.from && fcmBackgroundReady) return;
    const type = data.type || 'general';

    const origin = (self.location && self.location.origin) ? self.location.origin : 'https://polskieradio.cc';
    const defaultIcon = origin + '/images/push/push-default-192.png'; // L0 23.11.2026: zamiast białego krzyża
    const defaultBadge = origin + '/lumina-push-badge-v4.1.5.svg';
    const title = notification.title || data.title || 'LUMINA • Społeczność Chrześcijańska';
    const body = notification.body || data.body || 'Otrzymałeś nową wiadomość w portalu LUMINA.';
    const icon = type === 'direct_message'
        ? (data.avatar || data.icon || notification.icon || defaultIcon)
        : (notification.icon || data.icon || defaultIcon);
    const image = notification.image || data.image || data.imageUrl || (type === 'tv_schedule' ? (data.icon || data.poster || undefined) : undefined);
    const url = data.url || '/lumina';

    let actions = [
        { action: 'open', title: 'Otwórz LUMINA 🕊️' }
    ];

    if (type === 'new_profile') {
        actions = [
            { action: 'view', title: '👀 Zobacz Profil' },
            { action: 'welcome', title: '🕊️ Powitaj' }
        ];
    } else if (type === 'new_post') {
        actions = [
            { action: 'read', title: '📖 Zobacz Wpis' },
            { action: 'like', title: '❤️ Polub' }
        ];
    } else if (type === 'daily_mission') {
        actions = [
            { action: 'prayer', title: '🙏 Pomódl się' },
            { action: 'blik', title: '📱 Misyjny BLIK' }
        ];
    } else if (type === 'direct_message' || type === 'direct_message_request' || type === 'mention') {
        actions = [
            { action: 'reply', title: '💬 Odpowiedz' },
            { action: 'open', title: 'Otwórz Czat' }
        ];
    }

    const options = {
        body: body,
        icon: icon,
        badge: defaultBadge,
        image: image,
        data: {
            url: url,
            type: type,
            ...data
        },
        tag: notification.tag || data.tag || `lumina_${type}_${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: (type === 'direct_message' || type === 'direct_message_request' || type === 'mention' || type === 'devotion' || type === 'ckd' || type === 'daily_mission'),
        actions: actions
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CLICK HANDLER — DEEP-LINKING TO PAGES & CHAT
// ══════════════════════════════════════════════════════════════════════════
// LUMI KIDS (Strażnik Claude, 2026-10-18): na urządzeniu oznaczonym przez aplikację LUMI KIDS
// każde powiadomienie otwiera wyłącznie /lumi-kids/app/ — dziecko nie trafia do portalu LUMINA.
function isLumiKidsDevice() {
    try {
        return caches.open('lumi-kids-device').then((c) => c.match('/__lumi-kids-device')).then((r) => !!r).catch(() => false);
    } catch (_) { return Promise.resolve(false); }
}
function openLumiKids() {
    const target = self.location.origin + '/lumi-kids/app/';
    return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
        for (const c of list) {
            if (c.url && c.url.indexOf('/lumi-kids/app') !== -1 && 'focus' in c) return c.focus();
        }
        return clients.openWindow ? clients.openWindow(target) : null;
    });
}
function handleLuminaNotificationClick(event) {
    event.stopImmediatePropagation();
    event.notification.close();
    event.waitUntil(isLumiKidsDevice().then((kids) => {
        if (kids) return openLumiKids();
        const inner = [];
        handleLuminaNotificationClickDefault({
            action: event.action, notification: event.notification,
            stopImmediatePropagation() {}, waitUntil(p) { inner.push(p); }
        });
        return Promise.all(inner);
    }));
}
function handleLuminaNotificationClickDefault(event) {
    const action = event.action;
    const notificationData = event.notification.data || {};
    const fcmPayload = notificationData.FCM_MSG;
    const data = fcmPayload ? { ...fcmPayload.data } : notificationData;
    const postId = data.postId || (data.data && data.data.postId);
    const authorSlug = data.authorSlug || (data.data && data.data.authorSlug);

    const sender = data.senderId || data.senderSlug || data.chatPartnerId || data.openChat || (data.data && (data.data.senderId || data.data.senderSlug || data.data.openChat));
    const msgId = data.messageId || data.msgId || (data.data && (data.data.messageId || data.data.msgId));
    const isPublic = data.type === 'public' || data.type === 'public_chat' || data.openPublicChat || (data.data && data.data.type === 'public')
        || (data.type === 'mention' && (data.roomId || 'public') === 'public'); // @wzmianka z czatu ogólnego → czat ogólny, nie rozmowa prywatna

    if (action === 'revolut' || action === 'support') {
        if (clients.openWindow) {
            event.waitUntil(clients.openWindow('https://revolut.me/christianculture'));
            return;
        }
    }

    let targetUrl = data.url;

    if (action === 'prayer') {
        targetUrl = '/modlitwa';
    } else if (action === 'blik') {
        targetUrl = '/lumina-tablica.html?blik=1#blik';
    } else if (action === 'revolut') {
        targetUrl = 'https://revolut.me/christianculture';
    } else if (action === 'open_appeal' || data.type === 'sunday_appeal') {
        targetUrl = '/lumina-tablica.html?post=post_sunday_mission_appeal#sundayAppeal';
    } else if (action === 'watch') {
        targetUrl = data.url || '/master';
    } else if (action === 'program') {
        targetUrl = '/program';
    } else if (action === 'share' && (data.devotionId || postId)) {
        targetUrl = `/tablica?share=${encodeURIComponent(data.devotionId || postId)}`;
    } else if (action === 'view' && data.slug && !sender) {
        targetUrl = `/lumina/${encodeURIComponent(data.slug)}`;
    } else if (action === 'read' || data.type === 'new_post' || postId) {
        targetUrl = (data.url && data.url.includes('postId=')) 
            ? data.url 
            : `/lumina-tablica.html?postId=${encodeURIComponent(postId || '')}${authorSlug ? '&author=' + encodeURIComponent(authorSlug) : ''}`;
    } else if (isPublic) {
        // @007 (L0 23.11.2026): otwórz czat ogólny od razu przy tej wiadomości (przewinięcie + złota ramka).
        targetUrl = `/lumina?openPublicChat=1` + (msgId ? '&messageId=' + encodeURIComponent(msgId) : '');
    } else if (sender) {
        // Prywatna wiadomość: zawsze kanoniczny LUMI Messenger (/mess) i konkretny pokój rozmowy.
        const senderName = String(data.senderName || '').slice(0, 80);
        targetUrl = `/mess?openChat=${encodeURIComponent(sender)}`
            + (msgId ? '&messageId=' + encodeURIComponent(msgId) : '')
            + (senderName ? '&name=' + encodeURIComponent(senderName) : '')
            + (action === 'reply' ? '&reply=1' : '');
    } else if (!targetUrl) {
        targetUrl = '/lumina';
    }

    // Always ensure absolute URL in our origin
    let fullTargetUrl;
    try {
        const parsed = new URL(targetUrl, self.location.origin);
        fullTargetUrl = parsed.origin === self.location.origin ? parsed.href : self.location.origin + '/lumina';
    } catch (_) {
        fullTargetUrl = self.location.origin + '/lumina';
    }

    const postPayload = {
        type: 'OPEN_LUMINA_CHAT',
        targetUrl: fullTargetUrl,
        chatData: {
            // Czat ogólny: bez nadawcy — inaczej strona otworzyłaby prywatną rozmowę z autorem zamiast czatu ogólnego.
            senderId: isPublic ? '' : sender,
            senderName: data.senderName || '',
            senderAvatar: data.avatar || data.icon || 'lumina_icon.jpg',
            type: isPublic ? 'public' : 'private',
            messageId: msgId,
            reply: action === 'reply'
        }
    };

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windowClients) => {
            // 1. Rozmowa prywatna: użyj otwartego LUMI Messengera (/mess) — bez przeładowania.
            //    Inne karty LUMINA (np. tablica) zostają nietknięte; dla nich otwieramy /mess w nowym oknie.
            const pathOf = (c) => { try { const u = new URL(c.url); return { p: u.pathname.replace(/\/$/, ''), embed: u.searchParams.get('embed') === '1' }; } catch (_) { return { p: '', embed: false }; } };
            if (sender && !isPublic) {
                const mess = windowClients.find((c) => { const x = pathOf(c); return (x.p === '/mess' || x.p === '/mess.html') && !x.embed; });
                if (mess && 'focus' in mess) {
                    try { await mess.focus(); } catch (e) {}
                    mess.postMessage(postPayload);
                    return;
                }
            } else {
                let luminaClient = null;
                for (const client of windowClients) {
                    const x = pathOf(client);
                    if (!x.embed && (x.p === '/lumina' || x.p === '/lumina.html' || x.p === '/mess')) { luminaClient = client; break; }
                }
                if (luminaClient && 'focus' in luminaClient) {
                    try { await luminaClient.focus(); } catch(e) {}
                    luminaClient.postMessage(postPayload);
                    if ('navigate' in luminaClient) {
                        try { await luminaClient.navigate(fullTargetUrl); return; } catch (e) {
                            console.warn('[SW] navigate client failed:', e);
                        }
                    } else {
                        return;
                    }
                }
            }

            // 2. Jeśli nie ma okna Lumina, otwórz nowe okno bezpośrednio z linkiem czatu
            if (clients.openWindow) {
                try {
                    const newWin = await clients.openWindow(fullTargetUrl);
                    // Prywatna rozmowa otwiera się z parametrów adresu; drugi sygnał dublowałby otwarcie.
                    if (newWin && !(sender && !isPublic) && typeof setTimeout !== 'undefined') {
                        setTimeout(() => {
                            try { newWin.postMessage(postPayload); } catch(e) {}
                        }, 1200);
                    }
                    return;
                } catch(e) {
                    console.warn('[SW] openWindow failed:', e);
                }
            }

            // 3. Ostateczny fallback: nawiguj dowolne istniejące okno
            if (windowClients.length > 0) {
                const anyClient = windowClients[0];
                try {
                    await anyClient.focus();
                    if ('navigate' in anyClient) {
                        await anyClient.navigate(fullTargetUrl);
                    }
                } catch(e) {}
            }
        })
    );
}

// ══════════════════════════════════════════════════════════════════════════
// PERIODIC BACKGROUND SYNC (Missionary Devotion Sync at Dawn)
// ══════════════════════════════════════════════════════════════════════════
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'lumina-daily-mission-sync') {
        console.log('[SW] Periodic background mission sync triggered');
        event.waitUntil(
            caches.open('lumina-dynamic-v4.1.4-20260914-delivery-fix').then((cache) => {
                return fetch('./lumina-tablica.html?sync=1', { cache: 'no-cache' })
                    .then((response) => {
                        if (response && response.ok) cache.put('./lumina-tablica.html', response.clone());
                    })
                    .catch((err) => console.log('[SW] Background cache update skipped offline:', err));
            })
        );
    }
});
