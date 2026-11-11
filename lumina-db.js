import { createPresenceChannel } from './js/lumina-presence-channel.js';
// Initialize global window container immediately
window.LuminaDB = window.LuminaDB || {};
// ══════════════════════════════════════════════════════════════════════════
// LUMINA REALTIME ENGINE (Firebase Auth + Firestore + Storage Hybrid Sync)
// ══════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    getFirestore, 
    initializeFirestore,
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where,
    or,
    orderBy, 
    limit, 
    serverTimestamp,
    increment,
    writeBatch,
    runTransaction,
    getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';

// ── Oficjalna Produkcyjna Konfiguracja Firebase (lumina-cc) ──
const LUMINA_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
    authDomain: "lumina-cc.firebaseapp.com",
    databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lumina-cc",
    storageBucket: "lumina-cc.firebasestorage.app",
    messagingSenderId: "413985877183",
    appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
    measurementId: "G-6440T9VBQB"
};

// Adres produkcyjny Workera Cloudflare (LUMINA Web Push / FCM v1 Dispatcher)
globalThis.LUMINA_PUSH_WORKER_URL = globalThis.LUMINA_PUSH_WORKER_URL || 'https://lumina-push.nazirczarkes.workers.dev';
globalThis.LUMINA_PUSH_WORKER_DIRECT_ENABLED = true;

async function triggerLuminaPush(kind, documentId) {
    const baseUrl = String(globalThis.LUMINA_PUSH_WORKER_URL || 'https://lumina-push.nazirczarkes.workers.dev').replace(/\/$/, '');
    const pushUser = auth?.currentUser;
    if (kind === 'direct' && globalThis.LUMINA_PUSH_WORKER_DIRECT_ENABLED !== true) {
        return { skipped: true };
    }
    if (!baseUrl || !/^https:\/\//.test(baseUrl) || !pushUser || pushUser.isAnonymous || !documentId) {
        return { skipped: true };
    }
    let timeoutId = null;
    try {
        const idToken = await pushUser.getIdToken();
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
        const response = await fetch(`${baseUrl}/v1/push/${encodeURIComponent(kind)}/${encodeURIComponent(documentId)}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` },
            signal: controller?.signal
        });
        if (!response.ok) {
            console.warn(`[LUMINA Push] Worker odrzucił ${kind}: ${response.status}`);
            return { delivered: false };
        }
        return await response.json();
    } catch (error) {
        // Wiadomość została już bezpiecznie zapisana w Firestore. Błąd push nie może jej cofnąć.
        console.warn('[LUMINA Push] Worker chwilowo niedostępny:', error?.message || error);
        return { delivered: false };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

const LUMINA_VAPID_KEY = "BD_YXGFbonkuMphLzVdYqADfcPX4TMnN4PowO2eu673JnZQR3RJRMM3F8nJN9Zpk8qQlSb4VEcFN39KXlZ85TPw";

let app = null;
let db = null;
let auth = null;

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ STRAŻNIK TOŻSAMOŚCI LUMINA (2026-10-07, Claude — Strażnik Standardów)
// Konta oficjalne rozpoznajemy WYŁĄCZNIE po dokładnym, zweryfikowanym e-mailu.
// Imię z Google ("Cezary", "Wioletta", "Andrzej"…) NIGDY nie nadaje cudzej
// tożsamości, zdjęcia, wieku, miasta ani uprawnień. To była przyczyna tego,
// że prawdziwi ludzie o tych imionach dostawali twarz i dane innych osób.
// ═══════════════════════════════════════════════════════════════════════════
export const LUMINA_OFFICIAL_ACCOUNTS = Object.freeze({
    cezary: ['nazirczarkes@gmail.com', 'studiodees7@gmail.com', 'czarekrogowski3@gmail.com', 'osobowoscplus@gmail.com', 'yourimaginationstudio@gmail.com', 'polskiercctv@gmail.com'],
    radiocc: ['radiochristianculture@gmail.com'],
    wiolettaLocalPart: 'wioletta1240',
    marek: ['marusjakubowski@gmail.com']
});
export const LUMINA_MASTER_ADMIN_EMAILS = Object.freeze([
    'nazirczarkes@gmail.com', 'radiochristianculture@gmail.com', 'czarekrogowski3@gmail.com',
    'polskieradiocc@gmail.com', 'studiodees7@gmail.com', 'polskiercctv@gmail.com'
]);
export const LUMINA_RESERVED_PROFILE_SLUGS = Object.freeze([
    'cezaryrgowski', 'wiolettarogowska', 'radiocc', 'andrzejthiel', 'christianculture', 'lumina', 'marekjakubowski'
]);
const LUMINA_OFFICIAL_AVATARS = Object.freeze({
    'avatar_cezary_official.jpg': 'cezaryrgowski',
    'avatar_wioletta_official.jpg': 'wiolettarogowska',
    'avatar_wioletta_official.webp': 'wiolettarogowska',
    'avatar_andrzej_thiel.jpg': 'andrzejthiel',
    'avatar_marek_jakubowski.jpg': 'marekjakubowski'
});

export function detectLuminaOfficialIdentity(user) {
    if (!user || !user.email) return null;
    if (user.emailVerified === false) return null;
    const email = String(user.email).trim().toLowerCase();
    if (LUMINA_OFFICIAL_ACCOUNTS.radiocc.includes(email)) return 'radiocc';
    if (LUMINA_OFFICIAL_ACCOUNTS.cezary.includes(email)) return 'cezary';
    if (email.split('@')[0] === LUMINA_OFFICIAL_ACCOUNTS.wiolettaLocalPart) return 'wioletta';
    if (LUMINA_OFFICIAL_ACCOUNTS.marek && LUMINA_OFFICIAL_ACCOUNTS.marek.includes(email)) return 'marek';
    return null;
}

export function isLuminaMasterAdmin(user = currentUserState) {
    if (!user || !user.email || user.emailVerified === false) return false;
    return LUMINA_MASTER_ADMIN_EMAILS.includes(String(user.email).trim().toLowerCase());
}

/**
 * Sprawdza czy użytkownik/nadawca posiada uprawnienia administratora społeczności / Założyciela.
 * Administrator społeczności ma nieograniczone możliwości komunikacji na czacie
 * i nie wymaga akceptacji prośby o rozmowę od odbiorcy.
 */
export function isCommunityAdmin(user = currentUserState, fromId = null, profile = currentProfileState) {
    if (user && isLuminaMasterAdmin(user)) return true;
    if (user && (detectLuminaOfficialIdentity(user) === 'cezary' || detectLuminaOfficialIdentity(user) === 'radiocc')) return true;
    if (user && user.email && LUMINA_MASTER_ADMIN_EMAILS.includes(String(user.email).trim().toLowerCase())) return true;
    if (profile && (profile.isAdmin === true || profile.isFounder === true || profile.isMissionAccount === true)) return true;
    const normFrom = String(fromId || profile?.slug || user?.slug || '').trim().toLowerCase();
    if (normFrom === 'cezaryrgowski' || normFrom === 'cezary' || normFrom === 'radiocc') return true;
    try {
        if (typeof localStorage !== 'undefined' && localStorage) {
            if (localStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_admin') === '1' || localStorage.getItem('lumina_auth_owner_cezaryrgowski') === 'true') {
                return true;
            }
        }
    } catch (_) {}
    try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage) {
            if (sessionStorage.getItem('lumina_auth_master_admin') === 'true' || sessionStorage.getItem('lumina_admin') === '1' || sessionStorage.getItem('lumina_auth_owner_cezaryrgowski') === 'true') {
                return true;
            }
        }
    } catch (_) {}
    return false;
}

const OFFICIAL_ID_TO_SLUG = { cezary: 'cezaryrgowski', wioletta: 'wiolettarogowska', radiocc: 'radiocc', marek: 'marekjakubowski' };

/** Czy ZALOGOWANY (Firebase Auth) użytkownik może edytować dany profil. Bez PIN-ów i flag w localStorage. */
export function canEditLuminaProfile(slugOrUid, profileData = null, user = currentUserState) {
    if (!user || user.isAnonymous) return false;
    if (isLuminaMasterAdmin(user)) return true;
    const key = String(slugOrUid || '').trim().toLowerCase();
    if (!key) return false;
    if (key === String(user.uid).toLowerCase()) return true;
    if (profileData && profileData.uid && profileData.uid === user.uid) return true;
    const official = detectLuminaOfficialIdentity(user);
    if (official && OFFICIAL_ID_TO_SLUG[official] === key) return true;
    if (currentProfileState && currentProfileState.uid === user.uid && String(currentProfileState.slug || '').toLowerCase() === key) return true;
    return false;
}

/**
 * Czy URL to prawdziwe zdjęcie człowieka (a nie logo, ikona, litera Google, grafika stockowa).
 * Oficjalne zdjęcia (np. Cezarego) są prawdziwe WYŁĄCZNIE na profilu ich właściciela.
 */
export function isLuminaRealPersonPhoto(url, ownerSlug = '') {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    const lower = clean.toLowerCase();
    if (!lower || lower === 'null' || lower === 'undefined') return false;
    if (lower.startsWith('data:image/svg')) return false;
    if (lower.startsWith('data:image/')) return clean.length > 3000; // realne zdjęcie, nie piksel
    if (lower.includes('googleusercontent.com/a/')) return false; // litera Google na kolorowym tle
    const file = lower.split('?')[0].split('/').pop();
    if (LUMINA_OFFICIAL_AVATARS[file]) return LUMINA_OFFICIAL_AVATARS[file] === String(ownerSlug || '').toLowerCase();
    if (/^(lumina[_-]|logo|icon|favicon|reklama|tlo_|ccn_|avatar_new\d|default|placeholder|studiodobregoslowa_avatar)/.test(file)) return false;
    if (lower.startsWith('http')) return true;
    if (lower.startsWith('indexeddb:')) return false; // zdjęcie tylko w tej przeglądarce — inni go nie zobaczą
    return /^avatar_[a-z0-9_]+\.(jpe?g|png|webp)$/.test(file); // zdjęcia wgrane przez administrację
}

let analytics = null;
let messaging = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

try {
    app = !getApps().length ? initializeApp(LUMINA_FIREBASE_CONFIG) : getApp();
    try {
        db = initializeFirestore(app, {
            experimentalAutoDetectLongPolling: true
        });
    } catch (e) {
        db = getFirestore(app);
    }
    auth = getAuth(app);
    isAnalyticsSupported().then(supported => {
        if (supported && app) analytics = getAnalytics(app);
    }).catch(() => {});
    isMessagingSupported().then(supported => {
        if (supported && app) {
            messaging = getMessaging(app);
            onMessage(messaging, (payload) => {
                // FCM does not display Android notifications automatically in the foreground.
                // Course/test messages have no Firestore chat listener to display them for us.
                void showForegroundPushNotification(payload);
                const title = payload.notification?.title || payload.data?.title || 'LUMINA • Nowa Wiadomość 💌';
                const body = payload.notification?.body || payload.data?.body || 'Nowa aktywność w społeczności.';
                window.dispatchEvent(new CustomEvent('lumina-push-message', { detail: { title, body, payload } }));
                if (typeof window.showToast === 'function') {
                    window.showToast(`💌 ${title}: ${body}`);
                }
            });
        }
    }).catch(() => {});
} catch(e) {
    try {
        app = getApps()[0] || initializeApp(LUMINA_FIREBASE_CONFIG);
        db = getFirestore(app);
        auth = getAuth(app);
    } catch(err) {
        console.warn('Lumina Firebase Init Warning:', err);
    }
}

// ── Web Push Notifications (FCM) Permission & Token Request ──
export async function showForegroundPushNotification(payload, environment = window) {
    const data = payload?.data || {};
    // Keep existing chat notification ownership unchanged to prevent duplicate alerts.
    if (!['daily_course_lesson', 'owner_push_test'].includes(data.type)) return false;
    if (environment.Notification?.permission !== 'granted') return false;
    const serviceWorker = environment.navigator?.serviceWorker;
    if (!serviceWorker?.getRegistration) return false;
    try {
        const origin = environment.location.origin;
        let url = new URL('/lumina', origin);
        try {
            const candidate = new URL(data.url || '/lumina', origin);
            if (candidate.origin === origin && !candidate.username && !candidate.password) url = candidate;
        } catch (_) { /* Invalid links safely fall back to LUMINA. */ }
        const registration = await serviceWorker.getRegistration('/');
        if (!registration?.active || !registration.showNotification) return false;
        await registration.showNotification(payload.notification?.title || data.title || 'Christian Culture', {
            body: payload.notification?.body || data.body || 'Nowe powiadomienie Christian Culture.',
            icon: new URL('/lumina-notif-icon-v2.png', origin).href,
            badge: new URL('/lumina-push-badge-v4.1.5.svg', origin).href,
            tag: data.tag || `lumina_${data.type}`,
            data: { url: url.href, type: data.type },
            actions: [{ action: 'open', title: data.type === 'owner_push_test' ? 'Otwórz lekcję testową' : 'Czytaj lekcję' }]
        });
        return true;
    } catch (_) {
        // No payload/token logging and no false claim that Android displayed the alert.
        return false;
    }
}

// Course enrollment persists its device in the authenticated course service.
// Chat registration below keeps its independent Firestore persistence contract.
export async function requestCourseNotificationToken(userUid) {
    if (!auth || !('Notification' in window) || !('serviceWorker' in navigator)) return null;
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user || user.isAnonymous || user.uid !== userUid) return null;
    if (await Notification.requestPermission() !== 'granted') return null;
    if (auth.currentUser?.uid !== user.uid) return null;
    if (!messaging && isMessagingSupported && await isMessagingSupported() && app) messaging = getMessaging(app);
    if (!messaging) return null;
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync', {scope:'/',updateViaCache:'none'});
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging,{vapidKey:LUMINA_VAPID_KEY,serviceWorkerRegistration:registration});
    return auth.currentUser?.uid === user.uid ? token : null;
}

export async function requestNotificationPermission(userUid) {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser.');
        return null;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (!auth || !db || !('serviceWorker' in navigator)) return null;
            await auth.authStateReady();
            // A profile slug is never an authenticated identity, even when passed by older callers.
            const pushUser = auth.currentUser;
            if (!pushUser || pushUser.isAnonymous) return null;
            if (!messaging && isMessagingSupported) {
                const supported = await isMessagingSupported();
                if (supported && app) messaging = getMessaging(app);
            }
            if (messaging) {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync', { scope: '/', updateViaCache: 'none' });
                await navigator.serviceWorker.ready;
                const token = await getToken(messaging, {
                    vapidKey: LUMINA_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                
                if (token && db) {
                    try {
                        if (auth.currentUser?.uid !== pushUser.uid) return null;
                        const tokenKey = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
                        const effectiveUid = pushUser.uid;
                        const effectiveSlug = localStorage.getItem('lumina_current_user_slug') || (currentProfileState ? (currentProfileState.slug || currentProfileState.uid) : '') || '';
                        const platform = /Android/i.test(navigator.userAgent) ? 'android' : (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'web');

                        await setDoc(doc(db, 'LuminaDeviceTokens', tokenKey), {
                            token: token,
                            uid: effectiveUid,
                            slug: effectiveSlug,
                            userSlug: effectiveSlug,
                            userName: currentProfileState?.name || currentUserState?.displayName || '',
                            platform: platform,
                            userAgent: navigator.userAgent || 'unknown',
                            enabled: true,
                            lastSeenAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        try { localStorage.setItem('lumina_fcm_token', token); } catch(e) {}
                        if (typeof fetch === 'function' && typeof pushUser.getIdToken === 'function') {
                            pushUser.getIdToken().then(idToken => fetch('https://lumina-push.nazirczarkes.workers.dev/v1/course/subscription', {
                                method: 'POST',
                                headers: { 'content-type': 'application/json', authorization: 'Bearer ' + idToken },
                                body: JSON.stringify({ action: 'status', fcmToken: token })
                            })).catch(() => {});
                        }
                        console.log('[LUMINA Push] Token pomyślnie zarejestrowany w LuminaDeviceTokens w Firestore! 🕊️');
                    } catch(e) {
                        console.warn('[LUMINA Push] Error saving to LuminaDeviceTokens:', e);
                        return null;
                    }

                    // 🛡️ STRAŻNIK: token FCM jest zapisany wyłącznie w LuminaDeviceTokens (prywatna kolekcja).
                    // Wcześniej trafiał też do publicznego profilu (w tym cudzego — pod slugiem z localStorage).
                }
                return token;
            }
        }
        return null;
    } catch(err) {
        console.warn('FCM Token request warning:', err);
        return null;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION & USER MANAGEMENT (Google, Email/Password, Sessions)
// ══════════════════════════════════════════════════════════════════════════

export const CEZARY_ADMIN_USER = {
    uid: 'cezaryrgowski',
    id: 'cezaryrgowski',
    slug: 'cezaryrgowski',
    email: 'nazirczarkes@gmail.com',
    displayName: 'Cezary Rogowski',
    name: 'Cezary Rogowski',
    photoURL: 'avatar_cezary_official.jpg',
    avatar: 'avatar_cezary_official.jpg',
    role: 'admin',
    isAdmin: true,
    isFounder: true
};

export const CEZARY_ADMIN_PROFILE = {
    uid: 'cezaryrgowski',
    id: 'cezaryrgowski',
    slug: 'cezaryrgowski',
    name: 'Cezary Rogowski',
    displayName: 'Cezary Rogowski',
    email: 'nazirczarkes@gmail.com',
    avatar: 'avatar_cezary_official.jpg',
    avatarVideo: 'cezary_rgowski_video_avatar.mp4',
    cover: 'tlo_profilowe_cezary.gif',
    coverVideoUrl: '',
    age: 51,
    city: 'Ostrowiec Świętokrzyski, Polska',
    status: 'Żonaty',
    job: 'Założyciel Christian Culture',
    church: 'Wspólnota Chrześcijańska',
    denom: 'Rzymskokatolickie',
    verse: '„Wszystko mogę w Tym, który mnie umacnia”',
    verseRef: 'Flp 4, 13',
    bio: 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.',
    tags: ['Założyciel', 'Ewangelizacja', 'Christian Culture', 'Media', 'Administrator'],
    photos: ['avatar_cezary_official.jpg', 'lumina_default_cover.jpg'],
    visibility: 'public',
    pin: '0455',
    matchScore: '98%',
    role: 'admin',
    isAdmin: true,
    isFounder: true,
    posts: [
        {
            id: 'post_cezary_welcome',
            author: 'Cezary Rogowski',
            authorSlug: 'cezaryrgowski',
            authorAvatar: 'avatar_cezary_official.jpg',
            time: 'Przed chwilą • Założyciel 👑',
            text: 'Szczęść Boże wszystkim! Witamy w społeczności chrześcijańskiej LUMINA. Budujmy relacje i wspierajmy się wzajemnie w Chrystusie! 🕊️✨',
            likes: 48,
            amen: 32,
            image: 'avatar_cezary_official.jpg'
        }
    ]
};

export function setupAdminCezarySession() {
    try {
        localStorage.setItem('lumina_current_user', JSON.stringify(CEZARY_ADMIN_USER));
        localStorage.setItem('lumina_current_user_profile', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_my_profile', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_profile_cezaryrgowski', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_user_session', 'active');
        localStorage.setItem('lumina_user_email', 'nazirczarkes@gmail.com');
        localStorage.setItem('lumina_current_user_slug', 'cezaryrgowski');
        localStorage.setItem('lumina_admin', '1');
        localStorage.setItem('lumina_auth_master_admin', 'true');
        localStorage.setItem('lumina_auth_owner_cezaryrgowski', 'true');
        sessionStorage.setItem('lumina_auth_owner_cezaryrgowski', 'true');
        sessionStorage.setItem('lumina_auth_master_admin', 'true');
        sessionStorage.setItem('lumina_private_access_cezaryrgowski', 'true');
        
        currentUserState = CEZARY_ADMIN_USER;
        currentProfileState = CEZARY_ADMIN_PROFILE;

        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.add('lumina-admin-mode');
            document.body.classList.add('owner-mode-active');
            const founderHub = document.getElementById('founderMissionHub');
            if (founderHub) founderHub.classList.add('admin-active');
        }

        window.dispatchEvent(new CustomEvent('lumina-auth-state', { 
            detail: { user: CEZARY_ADMIN_USER, profile: CEZARY_ADMIN_PROFILE } 
        }));
    } catch(e) {
        console.warn('Error setting admin Cezary session:', e);
    }
}

// Global exposure
window.setupAdminCezarySession = setupAdminCezarySession;
window.LuminaDB.setupAdminCezarySession = setupAdminCezarySession;
window.LuminaDB.CEZARY_ADMIN_USER = CEZARY_ADMIN_USER;
window.LuminaDB.CEZARY_ADMIN_PROFILE = CEZARY_ADMIN_PROFILE;

// ── Andrzej Thiel Profile & Cuda Każdego Dnia ──
export const ANDRZEJ_THIEL_PROFILE = {
    uid: 'andrzejthiel',
    id: 'andrzejthiel',
    slug: 'andrzejthiel',
    name: 'Andrzej Thiel',
    displayName: 'Andrzej Thiel',
    email: 'andrzej.thiel@christianculture.pl',
    avatar: 'avatar_andrzej_thiel.jpg',
    birthDate: '30 listopada 1955',
    age: 70,
    city: 'Sieradz, Polska',
    status: 'Chrześcijanin',
    job: 'Cuda Każdego Dnia 📖✨',
    church: 'Wspólnota Chrześcijańska',
    denom: 'Chrześcijanin',
    verse: '„Dla tego, kto wierzy, wszystko jest możliwe”',
    verseRef: 'Łk 1, 37 / Mk 9, 23',
    bio: 'Co dzień publikuję na swoim profilu: Cuda Każdego Dnia, które automatycznie pojawiają się na tablicy społeczności. Przeczytaj i zobacz jak Bóg przemienia twoje życie.',
    tags: ['Cuda Każdego Dnia', 'Wiara', 'Sieradz', 'Słowo Boże', 'Duch Święty', 'Rozważania'],
    photos: ['avatar_andrzej_thiel.jpg', 'Andrzej Thiel.jpg'],
    visibility: 'public',
    pin: '7777',
    matchScore: '99%',
    isVerified: true,
    profileUrl: 'lumina.andrzejthiel.html',
    posts: [
        {
            id: 'post_andrzej_cuda_21_08_2026',
            author: 'Andrzej Thiel',
            authorSlug: 'andrzejthiel',
            authorRole: 'Cuda Każdego Dnia 📖✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            time: '21 SIERPNIA 2026 • 🕊️ Cuda Każdego Dnia (Dzisiaj)',
            title: 'CUDA KAŻDEGO DNIA! 21 SIERPNIA 2026. KIEROWNICA CZY KOŁO ZAPASOWE?',
            text: 'Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\nKIEROWNICA CZY KOŁO ZAPASOWE?\n\nCorrie ten Boom postawiła bardzo ciekawe pytanie: „Czym jest dla ciebie modlitwa, kierownicą czy kołem zapasowym?”. Jedna z naszych studentek kursu „Jak się modlić?” napisała: „Kurs bardzo mi pomógł zrozumieć znaczenie modlitwy w moim życiu… Odkąd zaczęłam modlić się więcej, codziennie i od serca, planując i uwzględniając wszystkie szczegóły, które poznałam, czuję, jak Duch Święty mnie dotyka. Teraz nie wyobrażam sobie ani pół dnia bez tego. Nie mogę zrozumieć, jak wcześniej czasami o niej zapominałam. Po kursie modlitwa stała się sensowna i zajęła ważne miejsce w mojej codzienności”. Inny kursant pisze: „Dziękuję Wam bardzo za ten kurs, otworzył mi oczy na to, co znaczy prawdziwie się modlić. Nie chodzi o to, by klepać jakieś regułki, ale by prawdziwie, z czystym sercem i oddaniem spotykać się z Bogiem codziennie, w każdej chwili swojego życia”.\n\nNajlepszą radą, jaką możesz znaleźć dla siebie, w Bożym Słowie, jest ta: „Nieustannie się módlcie, w każdej sprawie i we wszelkich okolicznościach dziękujcie Najwyższemu” (1Tes.5,17-18). Jakie są twoje okoliczności dzisiaj? Niesprzyjające modlitwie? Bo masz dużo zajęć, nie możesz znaleźć spokojnej chwili dla siebie? Myślisz, że modlitwa wymaga jakiejś specjalnej oprawy? Bóg chce być z tobą w kontakcie zawsze i wszędzie! Nieustannie! Wow! Czy to możliwe? Możliwe! A wiesz dlaczego? Dlatego że On jest wszędzie z tobą – tuż obok jak dobry towarzysz. W samochodzie, w autobusie, kiedy zmywasz czy zmieniasz pieluchę dziecku. Kiedy się budzisz i kiedy idziesz spać. Pragnie uczestniczyć we wszystkim, co robisz, myślisz. Chce pomóc ci rozładowywać emocje. Służy swoją mądrością, kiedy nie wiesz, co robić, co powiedzieć, prostuje drogę, kiedy masz wątpliwości czy czujesz zagubienie. Zsyła pociechę i pokój. Nie uważasz, że to niezwykłe? Wielki, wszechmocny Bóg tak blisko dla ciebie! Co za ogromny przywilej. On uwielbia, kiedy z Nim rozmawiasz, słyszy cię w każdej chwili. Czego dzisiaj potrzebujesz? Możesz po prostu zawołać „Panie, pomóż”, możesz dziękować i uwielbiać Go za to, kim jest, za piękno stworzenia, które podziwiasz. Bóg czeka na twój głos, i chce czynić w twoim życiu cuda. Jak pisze Dan Hayes: „Jedno wiem, że kiedy się modlę, zbiegi okoliczności się zdarzają, kiedy się nie modlę, nie mają miejsca”.\n\n„Panie, dziękuję Ci za przywilej modlitwy. Że mogę przychodzić bezpośrednio do Ciebie ze wszystkim i w każdej chwili. Ty nigdy nie jesteś zmęczony, nie masz mnie dość. Żadna sprawa nie wydaje Ci się zbyt mała czy błaha. Jak Ojciec zawsze służysz mądrą radą i wsparciem. Chcę całym sercem trwać przy Tobie, przynosić Ci wszystko i słyszeć, co mówisz. Dziękuję, Ojcze, że jesteś ze mną i nigdy mnie nie zostawiasz. W imieniu Pana Jezusa, amen”.\n/opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️',
            likes: 186,
            amen: 164,
            image: 'cuda_kazdego_dnia_21_sie_2026.svg'
        },
        {
            id: 'post_andrzej_cuda_20_08_2026',
            author: 'Andrzej Thiel',
            authorSlug: 'andrzejthiel',
            authorRole: 'Cuda Każdego Dnia 📖✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            time: '20 SIERPNIA 2026 • 🕊️ Cuda Każdego Dnia',
            title: 'CUDA KAŻDEGO DNIA! 20 SIERPNIA 2026. WSZYSTKO MOŻNA ZMIENIĆ!',
            text: 'Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\nWSZYSTKO MOŻNA ZMIENIĆ!\n\nPorozmawiajmy jeszcze trochę o tym, co działa w naszym życiu, a co nie i dlaczego. Bo przecież nie chcemy karmić się wiedzą teoretyczną, ale taką, która sprawdza się w codzienności, prawda?\n\nZadajesz sobie czasem takie pytania? Czy sposób, w jaki wychowuję dziecko, działa? Czy może muszę coś zmienić? Czy moje małżeństwo działa? Czy sposób, w jaki się komunikujemy, rozwiązujemy konflikty, współpracujemy ze sobą jest efektywny? Czy może powinniśmy coś zmienić? Czy moje życie z Bogiem działa? Wierzysz i ufasz, trzymasz się Jego Prawdy i Jego obietnic, czy raczej czujesz frustrację, słabość, zmęczenie ciągłym staraniem się, które nie przynosi efektów? Może mówisz: „Nie, nie działa, ale nie mam pojęcia, jak to zmienić”? „Moje stare sposoby nie działają. Co robić?” Nie widzisz rozwiązania, bo za mocno tkwisz w starych nawykach, koleinach zachowań, z których tak trudno wyjść. Wydaje ci się, że już nic nie da się zmienić i tak widocznie musi być?\n\nFascynuje mnie, jak pomocne bywa spojrzenie z zewnątrz. Pewnie znasz, program „Kuchenne rewolucje”. To świetny przykład tego, jak potrafimy być ślepi na własne przywary, złe skłonności czy zaniedbania. Właściciel restauracji najczęściej mówi: „Próbowaliśmy już wszystkiego i nie ma efektów”. Bardzo rzadko widzi problem w sobie, a jeszcze rzadziej jest gotów się z nim skonfrontować. Bunt, złość, „jak ona śmie mnie krytykować” – to najczęstsze reakcje. W takich sytuacjach mamy tendencję, by zrzucać winę na okoliczności, na kogoś innego.\n\nA przecież tak nie musi być! Wszystko można zmienić. Przecież „z Bogiem wszystko jest możliwe” – jak zapewnia Jego Słowo (Łk.1,37). Wszystko, czyli nawet to, co tobie, wydaje się już niemożliwe do zmiany. Co to jest w twoim życiu? Potrzebujesz świeżego spojrzenia kogoś z zewnątrz? Szukaj pomocy, porady, porozmawiaj z kimś zaufanym. Nie zostawiaj tego, czekając, aż samo się ułoży.\n\n„Panie, dodaj mi wiary, że z Tobą wszystko jest możliwe! Moje stare sposoby nie działają. Potrzebuję Ciebie w moim życiu. Pokaż mi co wymaga zmiany i pomóż z pokorą przyjąć prawdę. Postaw na mojej drodze kogoś, kto pomoże mi wrócić na właściwe tory i otworzyć się na to co Ty mówisz do mnie”. /opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️',
            likes: 142,
            amen: 129,
            image: 'cuda_kazdego_dnia_20_sie_2026.svg'
        }
    ]
};

try {
    localStorage.setItem('lumina_profile_andrzejthiel', JSON.stringify(ANDRZEJ_THIEL_PROFILE));
    localStorage.setItem('lumina_profile_andrzej', JSON.stringify(ANDRZEJ_THIEL_PROFILE));
} catch(e) {}

window.LuminaDB.ANDRZEJ_THIEL_PROFILE = ANDRZEJ_THIEL_PROFILE;

// ── Robert Łukasz Pio Profile ──
export const ROBERT_LUKASZ_PIO_PROFILE = {
    uid: 'jIdflt3G8ohgpCoWmCLJAZ9i5d42',
    id: 'jIdflt3G8ohgpCoWmCLJAZ9i5d42',
    slug: 'u_robertukaszpio_5668',
    chatSlug: 'robertlukaszpio',
    name: 'Robert Łukasz Pio',
    displayName: 'Robert Łukasz Pio',
    age: 41,
    city: 'Kraków, Polska',
    avatar: 'avatar_robert.jpg',
    cover: 'lumina_default_cover.jpg',
    coverPosY: '50%',
    job: 'Członek Społeczności LUMINA ✨',
    role: 'Społeczność LUMINA ✨',
    church: 'Wspólnota Chrześcijańska',
    denom: 'Rzymskokatolickie',
    status: 'Wdowiec',
    pin: '7777',
    visibility: 'public',
    match: '98%',
    matchScore: '98%',
    stats: { friends: '52', posts: '1', likes: '112' },
    verse: '„Kto nie miłuje, nie zna Boga, bo Bóg jest miłością.”',
    verseRef: '— 1 J 4, 8',
    bio: 'Szczęść Boże! Cieszę się, że mogę być częścią chrześcijańskiej społeczności LUMINA. Zapraszam do zapoznania się z moją twórczością i playlistą wideo.',
    tags: ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo', 'Muzyka Uwielbienia'],
    photos: ['avatar_robert.jpg', 'lumina_default_cover.jpg'],
    featuredPlaylistUrl: 'https://www.youtube.com/embed/videoseries?si=VTYOaWiSHSR0nZPi&list=PLaheS83_AaGk'
};

try {
    localStorage.setItem('lumina_profile_robertlukaszpio', JSON.stringify(ROBERT_LUKASZ_PIO_PROFILE));
    localStorage.setItem('lumina_profile_robertukaszpio', JSON.stringify(ROBERT_LUKASZ_PIO_PROFILE));
    localStorage.setItem('lumina_profile_u_robertukaszpio_5668', JSON.stringify(ROBERT_LUKASZ_PIO_PROFILE));
    localStorage.setItem('lumina_profile_jidflt3g8ohgpcowmcljaz9i5d42', JSON.stringify(ROBERT_LUKASZ_PIO_PROFILE));
} catch(e) {}

window.LuminaDB.ROBERT_LUKASZ_PIO_PROFILE = ROBERT_LUKASZ_PIO_PROFILE;

// Domyślnie użytkownik jest wylogowany (brak automatycznego logowania do sesji admina)
let currentUserState = null;
let currentProfileState = null;
try {
    const savedUser = localStorage.getItem('lumina_current_user');
    if (savedUser) currentUserState = JSON.parse(savedUser);
    const savedProf = localStorage.getItem('lumina_current_user_profile');
    if (savedProf) currentProfileState = JSON.parse(savedProf);
} catch(e) {}

const authSubscribers = [];


// Check Google Redirect Auth on startup
if (auth) {
    try {
        getRedirectResult(auth).then(async (result) => {
            if (result && result.user) {
                console.log('Lumina Google Redirect Auth Success:', result.user.displayName);
                if (typeof window !== 'undefined' && window.ccTrack) window.ccTrack('login', { method: 'google_redirect' });
                await syncUserAuthProfile(result.user, db);
                const redirectTarget = sessionStorage.getItem('cc_auth_redirect_target');
                if (redirectTarget && redirectTarget !== window.location.href) {
                    sessionStorage.removeItem('cc_auth_redirect_target');
                    window.location.replace(redirectTarget);
                }
            }
        }).catch(err => console.warn('getRedirectResult notice:', err.message));
    } catch(e) {}
}

let luminaAuthEventGeneration = 0;

if (auth) {
    onAuthStateChanged(auth, async (user) => {
        const authEventGeneration = ++luminaAuthEventGeneration;
        const isCurrentAuthEvent = () => authEventGeneration === luminaAuthEventGeneration && auth.currentUser?.uid === user?.uid;
        if (currentUserState?.uid !== user?.uid) currentProfileState = null;
        currentUserState = user;
        if (user) {
            // Sprawdź czy to nowe/inne konto niż poprzednio — jeśli tak, zresetuj stare powiadomienia i liczniki
            try {
                const prevUid = localStorage.getItem('lumina_last_authenticated_uid');
                if (prevUid && prevUid !== user.uid) {
                    localStorage.setItem('lumina_messages_unread_count', '0');
                    localStorage.removeItem('lumina_unread_rooms_json');
                    localStorage.removeItem('lumina_inapp_notifications');
                    if (window._luminaUnreadRoomsMap) window._luminaUnreadRoomsMap.clear();
                    if (window.LuminaNotifications) {
                        window.LuminaNotifications.notifications = [];
                        window.LuminaNotifications.unreadCount = 0;
                        window.LuminaNotifications.updateBadge();
                    }
                    if (typeof window.updateLuminaMessagesBadge === 'function') {
                        window.updateLuminaMessagesBadge(0);
                    }
                    const b = document.getElementById('floatingChatBadge');
                    if (b) {
                        b.style.setProperty('display', 'none', 'important');
                        b.classList.remove('visible');
                        b.setAttribute('data-visible', 'false');
                        b.textContent = '';
                    }
                }
                localStorage.setItem('lumina_last_authenticated_uid', user.uid);
            } catch(e) { if (!isCurrentAuthEvent()) return; }

            // Save basic user session in localStorage immediately
            try {
                const uData = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    phoneNumber: user.phoneNumber || ''
                };
                localStorage.setItem('lumina_current_user', JSON.stringify(uData));
                localStorage.setItem('lumina_user_session', 'active');
                sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
            } catch(e) { if (!isCurrentAuthEvent()) return; }

            // Load user profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'lumina_profiles', user.uid));
                if (!isCurrentAuthEvent()) return;
                const _luminaOfficialId = detectLuminaOfficialIdentity(user); const isRadioCC = _luminaOfficialId === 'radiocc';
                
                if (userDoc.exists()) {
                    currentProfileState = { uid: user.uid, ...userDoc.data() };
                    
                    // Auto-fix if radiochristianculture was previously assigned cezaryrgowski slug
                    if (isRadioCC && currentProfileState.slug === 'cezaryrgowski') {
                        currentProfileState.slug = 'radiocc';
                        currentProfileState.name = 'Christian Culture';
                        currentProfileState.job = 'Misja & Radio Christian Culture';
                        currentProfileState.isMissionAccount = true;
                        currentProfileState.status = 'Oficjalne Konto';
                        currentProfileState.church = 'Christian Culture';
                        currentProfileState.verse = '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”';
                        currentProfileState.verseRef = '— Ewangelia wg św. Marka 16, 15';
                        currentProfileState.bio = 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.';
                        try {
                            await setDoc(doc(db, 'lumina_profiles', user.uid), currentProfileState, { merge: true });
                            if (!isCurrentAuthEvent()) return;
                            await setDoc(doc(db, 'lumina_profiles', 'radiocc'), currentProfileState, { merge: true });
                            if (!isCurrentAuthEvent()) return;
                        } catch(e) { if (!isCurrentAuthEvent()) return; }
                    }
                    
                    // 🛡️ STRAŻNIK: samonaprawa profilu, któremu wcześniej błędnie nadano cudzą tożsamość
                    // (np. osoba o imieniu Cezary/Wioletta dostała slug, nazwisko i zdjęcie konta oficjalnego).
                    if (!_luminaOfficialId && LUMINA_RESERVED_PROFILE_SLUGS.includes(String(currentProfileState.slug || '').toLowerCase())) {
                        const ownName = (user.displayName || '').trim();
                        const healed = {
                            slug: 'u_' + (ownName || 'user').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '_' + user.uid.substring(0, 4).toLowerCase(),
                            name: ownName || 'Użytkownik LUMINA',
                            updatedAt: serverTimestamp()
                        };
                        if (!isLuminaRealPersonPhoto(currentProfileState.avatar, healed.slug)) {
                            healed.avatar = 'lumina_icon.jpg';
                            healed.avatarVideo = null;
                            healed.hasRealPhoto = false;
                            healed.profileCompleted = false;
                            healed.needsProfileCompletion = true;
                        }
                        Object.assign(currentProfileState, healed);
                        try { await setDoc(doc(db, 'lumina_profiles', user.uid), healed, { merge: true }); } catch(e) { if (!isCurrentAuthEvent()) return; }
                        if (!isCurrentAuthEvent()) return;
                    }

                    // Auto-fix / enforce Cezary Rogowski official avatar
                    const isCezaryUser = _luminaOfficialId === 'cezary';
                    if (isCezaryUser && !isRadioCC) {
                        currentProfileState.slug = 'cezaryrgowski';
                        currentProfileState.name = 'Cezary Rogowski';
                        if (!currentProfileState.avatar || currentProfileState.avatar.includes('lumina_icon.jpg') || currentProfileState.avatar.includes('googleusercontent.com/a/')) {
                            currentProfileState.avatar = 'avatar_cezary_official.jpg';
                            currentProfileState.avatarVideo = 'cezary_rgowski_video_avatar.mp4';
                            currentProfileState.hasRealPhoto = true;
                            currentProfileState.profileCompleted = true;
                            try {
                                await setDoc(doc(db, 'lumina_profiles', user.uid), { avatar: 'avatar_cezary_official.jpg', avatarVideo: 'cezary_rgowski_video_avatar.mp4', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                if (!isCurrentAuthEvent()) return;
                                await setDoc(doc(db, 'lumina_profiles', 'cezaryrgowski'), { avatar: 'avatar_cezary_official.jpg', avatarVideo: 'cezary_rgowski_video_avatar.mp4', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                if (!isCurrentAuthEvent()) return;
                            } catch(e) { if (!isCurrentAuthEvent()) return; }
                        }
                    }

                    // Auto-fix / enforce Wioletta Rogowska official avatar
                    const isWiolettaUser = _luminaOfficialId === 'wioletta';
                    if (isWiolettaUser) {
                        currentProfileState.slug = 'wiolettarogowska';
                        currentProfileState.name = 'Wioletta Rogowska';
                        if (!currentProfileState.avatar || currentProfileState.avatar.includes('lumina_icon.jpg') || currentProfileState.avatar.includes('googleusercontent.com/a/')) {
                            currentProfileState.avatar = 'avatar_wioletta_official.jpg';
                            currentProfileState.hasRealPhoto = true;
                            currentProfileState.profileCompleted = true;
                            try {
                                await setDoc(doc(db, 'lumina_profiles', user.uid), { avatar: 'avatar_wioletta_official.jpg', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                if (!isCurrentAuthEvent()) return;
                                await setDoc(doc(db, 'lumina_profiles', 'wiolettarogowska'), { avatar: 'avatar_wioletta_official.jpg', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                if (!isCurrentAuthEvent()) return;
                            } catch(e) { if (!isCurrentAuthEvent()) return; }
                        }
                    }

                    try {
                        if (window.LuminaStorage && currentProfileState.slug) {
                            window.LuminaStorage.saveProfile(currentProfileState.slug, currentProfileState);
                        }
                        const safeProfile = typeof window.sanitizeProfileForLocalStorage === 'function'
                            ? window.sanitizeProfileForLocalStorage(currentProfileState.slug, currentProfileState)
                            : currentProfileState;
                        const safeJson = JSON.stringify(safeProfile);

                        localStorage.setItem('lumina_current_user_profile', safeJson);
                        localStorage.setItem('lumina_my_profile', safeJson);
                        if (currentProfileState.slug) {
                            localStorage.setItem('lumina_profile_' + currentProfileState.slug, safeJson);
                            sessionStorage.setItem('lumina_auth_owner_' + currentProfileState.slug, 'true');
                        }
                    } catch(e) { if (!isCurrentAuthEvent()) return; }
                } else {
                    // Check if Cezary Rogowski / Christian Culture / Wioletta by email/name
                    const isCezary = detectLuminaOfficialIdentity(user) === 'cezary';
                    const isWioletta = detectLuminaOfficialIdentity(user) === 'wioletta';
        const isMarek = detectLuminaOfficialIdentity(user) === 'marek' || (user.email && user.email.toLowerCase() === 'marusjakubowski@gmail.com');
                    
                    let cleanSlug;
                    if (isRadioCC) cleanSlug = 'radiocc';
                    else if (isCezary) cleanSlug = 'cezaryrgowski';
                    else if (isWioletta) cleanSlug = 'wiolettarogowska';
        else if (isMarek) cleanSlug = 'marekjakubowski';
                    else cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000);
                    
                    const isLetterAvatar = !user.photoURL || user.photoURL.includes('googleusercontent.com/a/');
                    const userAvatar = (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : (isLetterAvatar ? 'lumina_icon.jpg' : user.photoURL)));
                    const hasRealFace = (isCezary || isWioletta || isRadioCC) ? true : (!isLetterAvatar);
                    const isProfileDone = Boolean(isCezary || isWioletta || isRadioCC);
                    
                    currentProfileState = {
                        uid: user.uid,
                        slug: cleanSlug,
                        name: isMarek ? 'Marek Jakubowski' : (user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')))),
                        // 🛡️ e-mail NIE trafia do publicznego profilu (RODO) — jest w Firebase Auth
                        avatar: userAvatar,
                        age: isRadioCC ? 0 : (isCezary ? 51 : (isWioletta ? 50 : null)),
                        hasRealPhoto: hasRealFace,
                        verified: isMarek || isCezary || isWioletta || isRadioCC,
                        profileCompleted: isProfileDone,
                        needsProfileCompletion: !isProfileDone,
                        city: isRadioCC ? 'Polska' : ((isCezary || isWioletta) ? 'Ostrowiec Świętokrzyski, Polska' : ''),
                        status: isRadioCC ? 'Oficjalne Konto' : (isCezary ? 'Żonaty' : (isWioletta ? 'Mężatka' : '')),
                        job: isRadioCC ? 'Misja & Radio Christian Culture' : (isCezary ? 'Założyciel Christian Culture' : (isWioletta ? 'Współzałożycielka Christian Culture' : '')),
                        isMissionAccount: isRadioCC || false,
                        church: isRadioCC ? 'Christian Culture' : '',
                        denom: !(isCezary || isWioletta || isRadioCC) ? '' : 'Rzymskokatolickie',
                        verse: isRadioCC ? '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”' : (isCezary ? '„Ja i mój dom służyć będziemy Panu.”' : '„Wszystko mogę w Tym, który mnie umacnia”'),
                        verseRef: isRadioCC ? '— Ewangelia wg św. Marka 16, 15' : (isCezary ? '— Księga Jozuego 24, 15' : 'Flp 4, 13'),
                        bio: isRadioCC ? 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.' : (isCezary ? 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.' : 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.'),
                        tags: isRadioCC ? ['Christian Culture', 'Radio CC', 'Misja', 'Ewangelizacja', 'Muzyka Chwały'] : [],
                        photos: (typeof isLuminaRealPersonPhoto === 'function' && isLuminaRealPersonPhoto(userAvatar, cleanSlug)) ? [userAvatar] : [],
                        posts: [],
                        visibility: 'public',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    // Persist newly created profile to Firestore so it's guaranteed to exist
                    if (db) {
                        try {
                            await setDoc(doc(db, 'lumina_profiles', user.uid), currentProfileState, { merge: true });
                            if (!isCurrentAuthEvent()) return;
                            if (cleanSlug && cleanSlug !== user.uid && !LUMINA_RESERVED_PROFILE_SLUGS.includes(cleanSlug)) {
                                await setDoc(doc(db, 'lumina_profiles', cleanSlug), currentProfileState, { merge: true });
                                if (!isCurrentAuthEvent()) return;
                            }
                            console.log(`Lumina: Automatycznie utworzono nowy profil Firestore dla użytkownika Google [${cleanSlug}] ☁️✨`);
                        } catch(saveErr) {
                            if (!isCurrentAuthEvent()) return;
                            console.warn('Błąd automatycznego zapisu profilu Google w Firestore:', saveErr.message);
                        }
                    }

                    try {
                        if (window.LuminaStorage) {
                            window.LuminaStorage.saveProfile(cleanSlug || user.uid, currentProfileState);
                        }
                        const safeProfile = typeof window.sanitizeProfileForLocalStorage === 'function'
                            ? window.sanitizeProfileForLocalStorage(cleanSlug || user.uid, currentProfileState)
                            : currentProfileState;
                        const safeJson = JSON.stringify(safeProfile);

                        localStorage.setItem('lumina_current_user_profile', safeJson);
                        localStorage.setItem('lumina_my_profile', safeJson);
                        localStorage.setItem('lumina_profile_' + user.uid, safeJson);
                        if (cleanSlug) localStorage.setItem('lumina_profile_' + cleanSlug, safeJson);
                        sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
                        if (cleanSlug) sessionStorage.setItem('lumina_auth_owner_' + cleanSlug, 'true');
                    } catch(e) { if (!isCurrentAuthEvent()) return; }
                }
            } catch(e) {
                if (!isCurrentAuthEvent()) return;
                console.warn('Error loading user profile:', e);
            }
        } else {
            currentProfileState = null;
            try {
                localStorage.removeItem('lumina_current_user');
                localStorage.removeItem('lumina_current_user_profile');
                localStorage.removeItem('lumina_my_profile');
                localStorage.removeItem('lumina_user_session');
                localStorage.setItem('lumina_messages_unread_count', '0');
                localStorage.removeItem('lumina_unread_rooms_json');
                if (window._luminaUnreadRoomsMap) window._luminaUnreadRoomsMap.clear();
                if (typeof window.updateLuminaMessagesBadge === 'function') {
                    window.updateLuminaMessagesBadge(0);
                }
                const b = document.getElementById('floatingChatBadge');
                if (b) {
                    b.style.setProperty('display', 'none', 'important');
                    b.classList.remove('visible');
                    b.setAttribute('data-visible', 'false');
                    b.textContent = '';
                }
            } catch(e) { if (!isCurrentAuthEvent()) return; }
        }
        
        if (!isCurrentAuthEvent()) return;
        authSubscribers.forEach(cb => cb(currentUserState, currentProfileState));
        window.dispatchEvent(new CustomEvent('lumina-auth-state', { detail: { user: currentUserState, profile: currentProfileState } }));
    });
}

export function onAuthChange(callback) {
    authSubscribers.push(callback);
    // Call immediately if state already resolved
    callback(currentUserState, currentProfileState);
    return () => {
        const idx = authSubscribers.indexOf(callback);
        if (idx !== -1) authSubscribers.splice(idx, 1);
    };
}

export function getCurrentUser() {
    return currentUserState;
}

export function getCurrentProfile() {
    return currentProfileState;
}

export function getFirebaseAuthUser() {
    return auth?.currentUser || null;
}

export function waitForAuthReady(timeoutMs = 2500) {
    return new Promise((resolve) => {
        if (auth?.currentUser) return resolve(auth.currentUser);
        let resolved = false;
        let unsubscribe = null;
        if (auth && typeof onAuthStateChanged === 'function') {
            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (!resolved) {
                    resolved = true;
                    if (typeof unsubscribe === 'function') unsubscribe();
                    resolve(user);
                }
            });
        }
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                if (typeof unsubscribe === 'function') unsubscribe();
                resolve(auth?.currentUser || null);
            }
        }, timeoutMs);
    });
}

// ── Globalna obietnica gotowości bazy ──
let dbReadyPromise = null;

export function ensureDbReady() {
    if (!dbReadyPromise) {
        dbReadyPromise = new Promise((resolve) => {
            if (auth && db) {
                window.firebaseAuth = auth;
                window.firebaseDb = db;
                return resolve({ auth, db, app });
            }
            const checkInterval = setInterval(() => {
                if (auth && db) {
                    clearInterval(checkInterval);
                    window.firebaseAuth = auth;
                    window.firebaseDb = db;
                    resolve({ auth, db, app });
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                window.firebaseAuth = auth;
                window.firebaseDb = db;
                resolve({ auth, db, app });
            }, 4000);
        });
    }
    return dbReadyPromise;
}


// ── LUMINA Official Community Welcome Engine ──────────────────────────────
// Publikuje oficjalne, imienne powitanie nowego użytkownika na tablicy LUMINA
// w imieniu społeczności LUMINA oraz serwisu Christian Culture z życzeniami Bożego błogosławieństwa.
// Zabezpieczone unikalną flagą w localStorage per user.uid, by nie powielać wpisu przy ponownych logowaniach.
export async function postWelcomeMessageForNewUser(user, profile, activeDb = db) {
    if (!user || !profile) return;
    const uid = user.uid || profile.uid;
    if (!uid) return;

    // Zabezpieczenie przed wielokrotnym publikowaniem powitania dla tego samego konta
    const welcomeFlagKey = 'lumina_welcome_posted_' + uid;
    try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem(welcomeFlagKey)) {
            return;
        }
    } catch(e) {}

    // Pomijaj konta administratorskie/misyjne przy automatycznym witaniu
    if (profile.isMissionAccount || profile.slug === 'radiocc' || profile.slug === 'cezaryrgowski' || profile.slug === 'wiolettarogowska') {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(welcomeFlagKey, '1'); } catch(e) {}
        return;
    }

    const userName = profile.name || user.displayName || 'Przyjacielu';
    const recipientSlug = profile.slug || uid;
    const recipientAvatar = profile.avatar || user.photoURL || 'lumina_icon.jpg';

    const welcomeText =
        `🕊️ Witaj w naszej społeczności, ${userName}!\n\n` +
        `W imieniu całej społeczności LUMINA oraz serwisu Christian Culture oficjalnie i z całego serca witamy Cię w gronie braci i sióstr w wierze! Cieszymy się, że jesteś z nami.\n\n` +
        `Niech Pan Bóg obficie błogosławi Twoją drogę wiary, napełnia Cię Swoim pokojem, mądrością i miłością oraz prowadzi Cię każdego dnia. Modlimy się, aby to miejsce było dla Ciebie przestrzenią budujących relacji, duchowego wzrostu, wzajemnego wsparcia i nieustannej chwały Bożej.\n\n` +
        `Niech Boża łaska i pokój Chrystusa będą zawsze z Tobą!\n\n` +
        `Szczęść Boże! 🙏✨`;

    const welcomePostPayload = {
        id: 'welcome_' + uid + '_' + Date.now(),
        type: 'post',
        category: 'community',
        title: `🕊️ Oficjalne Powitanie: Witaj, ${userName}!`,
        text: welcomeText,
        image: null,
        videoUrl: null,
        youtubeUrl: null,
        isShort: false,
        is916: false,
        isPinned: false,
        isOfficialWelcome: true,
        recipientUid: uid,
        recipientName: userName,
        recipientSlug: recipientSlug,
        recipientAvatar: recipientAvatar,
        author: 'Społeczność LUMINA & Christian Culture',
        authorSlug: 'radiocc',
        authorUid: 'OFFICIAL_LUMINA_COMMUNITY',
        authorAvatar: 'lumina_logo_portal.jpg',
        authorRole: 'Oficjalne Powitanie • Christian Culture',
        likes: 7,
        amen: 5,
        time: 'Przed chwilą • 🕊️ Witamy Nowego Użytkownika',
        createdAtTimestamp: Date.now(),
        createdAtDateStr: new Date().toISOString()
    };

    try {
        const targetDb = activeDb || db;
        if (targetDb) {
            await addDoc(collection(targetDb, 'lumina_posts'), {
                ...welcomePostPayload,
                createdAtTimestamp: serverTimestamp(),
                createdAtDateStr: new Date().toISOString()
            });
        }
    } catch(err) {
        console.warn('[LUMINA] Błąd zapisu oficjalnego powitania w Firestore:', err?.message || err);
    }

    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(welcomeFlagKey, '1');
            // Zapisz kopię lokalną w postach tablicy, aby od razu pojawiła się w bieżącej sesji
            try {
                const localPosts = JSON.parse(localStorage.getItem('lumina_community_posts_cache') || '[]');
                localPosts.unshift(welcomePostPayload);
                localStorage.setItem('lumina_community_posts_cache', JSON.stringify(localPosts.slice(0, 50)));
            } catch(e) {}
        }
    } catch(e) {}
}
// ───────────────────────────────────────────────────────────────────────────

export async function syncUserAuthProfile(user, activeDb = db) {
    if (!user) return null;
    let existingProfile = null;
    let isBrandNewUser = false;
    const isRadioCC = detectLuminaOfficialIdentity(user) === 'radiocc';
    
    try {
        const docSnap = await getDoc(doc(activeDb, 'lumina_profiles', user.uid));
        if (docSnap.exists()) {
            existingProfile = docSnap.data();
            const userEmailLower = String(user.email || '').trim().toLowerCase();
            const isMarekUser = userEmailLower === 'marusjakubowski@gmail.com' || (existingProfile && existingProfile.slug === 'marekjakubowski');
            if (isMarekUser && (existingProfile.name === 'Użytkownik LUMINA' || !existingProfile.name || existingProfile.avatar === 'lumina_icon.jpg' || !existingProfile.hasRealPhoto)) {
                existingProfile.slug = 'marekjakubowski';
                existingProfile.name = 'Marek Jakubowski';
                existingProfile.avatar = 'avatar_marek_jakubowski.jpg';
                existingProfile.job = 'Autor Rozważań Biblijnych';
                existingProfile.role = 'Autor Rozważań & Społeczność LUMINA ✨';
                existingProfile.hasRealPhoto = true;
                existingProfile.profileCompleted = true;
                existingProfile.needsProfileCompletion = false;
                existingProfile.verified = true;
                existingProfile.verse = '„Pan jest moją siłą i moją tarczą, w nim zaufało moje serce i otrzymałem pomoc.”';
                existingProfile.verseRef = '— Psalm 28, 7 (UBG)';
                existingProfile.bio = 'Cieszę się, że jestem tutaj. Dzielę się tym, co Pan kładzie na moje serce — przez codzienne rozważania Słowa Bożego.';
                existingProfile.tags = ['Rozważania Biblijne', 'Słowo na Dziś', 'Wiara', 'Modlitwa', 'Społeczność LUMINA'];
                existingProfile.photos = ['avatar_marek_jakubowski.jpg', 'lumina_default_cover.jpg'];
                try {
                    await setDoc(doc(activeDb, 'lumina_profiles', user.uid), existingProfile, { merge: true });
                } catch(e) {}
            }
            if (isRadioCC && existingProfile.slug === 'cezaryrgowski') {
                existingProfile.slug = 'radiocc';
                existingProfile.name = 'Christian Culture';
                existingProfile.job = 'Misja & Radio Christian Culture';
                existingProfile.isMissionAccount = true;
                existingProfile.status = 'Oficjalne Konto';
                existingProfile.church = 'Christian Culture';
                existingProfile.verse = '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”';
                existingProfile.verseRef = '— Ewangelia wg św. Marka 16, 15';
                existingProfile.bio = 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.';
                try {
                    await setDoc(doc(activeDb, 'lumina_profiles', user.uid), existingProfile, { merge: true });
                } catch(e) {}
            }
        }
    } catch(e) {}

    if (!existingProfile) {
        isBrandNewUser = true;
        const isCezary = detectLuminaOfficialIdentity(user) === 'cezary';
        const isWioletta = detectLuminaOfficialIdentity(user) === 'wioletta';
        const isMarek = detectLuminaOfficialIdentity(user) === 'marek' || (user.email && user.email.toLowerCase() === 'marusjakubowski@gmail.com');
        
        let cleanSlug;
        if (isRadioCC) cleanSlug = 'radiocc';
        else if (isCezary) cleanSlug = 'cezaryrgowski';
        else if (isWioletta) cleanSlug = 'wiolettarogowska';
        else if (isMarek) cleanSlug = 'marekjakubowski';
        else cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + user.uid.substring(0, 4).toLowerCase();
        
        const isMission = isRadioCC || (user.displayName && user.displayName.toLowerCase().includes('lumina')) || (cleanSlug.includes('lumina') && !cleanSlug.startsWith('u_'));
        const isLetterAvatar = !user.photoURL || user.photoURL.includes('googleusercontent.com/a/');
        const userAvatar = isMarek ? 'avatar_marek_jakubowski.jpg' : ((isLetterAvatar ? null : user.photoURL) || (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : (isRadioCC ? 'logo_radio_cc.jpg' : 'lumina_icon.jpg'))));
        const hasRealFace = isCezary || isWioletta || isMarek || (!isLetterAvatar && typeof isLuminaRealPhoto === 'function' && isLuminaRealPhoto(userAvatar));
        const isProfileDone = hasRealFace && (isCezary || isWioletta || isMarek);
        
        existingProfile = {
            uid: user.uid,
            slug: cleanSlug,
            name: isMarek ? 'Marek Jakubowski' : (user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')))),
            // 🛡️ e-mail NIE trafia do publicznego profilu (RODO) — jest w Firebase Auth
            age: (isRadioCC || isMission) ? null : (isCezary ? 51 : (isWioletta ? 50 : null)),
            city: isRadioCC ? 'Polska' : ((isCezary || isWioletta) ? 'Ostrowiec Świętokrzyski, Polska' : ''),
            gender: isWioletta ? 'kobieta' : (isCezary ? 'mezczyzna' : ''),
            lookingFor: isWioletta ? 'mezczyzna' : (isCezary ? 'kobieta' : ''),
            denom: !(isCezary || isWioletta || isRadioCC) ? '' : 'Rzymskokatolickie',
            church: isRadioCC ? 'Christian Culture' : '',
            job: isRadioCC ? 'Misja & Radio Christian Culture' : (isCezary ? 'Założyciel Christian Culture' : (isWioletta ? 'Współzałożycielka Christian Culture' : 'Społeczność LUMINA ✨')),
            status: isRadioCC ? 'Oficjalne Konto' : (isCezary ? 'Żonaty' : (isWioletta ? 'Mężatka' : '')),
            isMissionAccount: isRadioCC || isMission || false,
            hasRealPhoto: hasRealFace,
            verified: isMarek || isCezary || isWioletta || isRadioCC,
            profileCompleted: isProfileDone,
            needsProfileCompletion: !isProfileDone && !isRadioCC && !isMission,
            verse: isRadioCC ? '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”' : (isCezary ? '„Ja i mój dom służyć będziemy Panu.”' : '„Wszystko mogę w Tym, który mnie umacnia”'),
            verseRef: isRadioCC ? '— Ewangelia wg św. Marka 16, 15' : (isCezary ? '— Księga Jozuego 24, 15' : 'Flp 4, 13'),
            bio: isRadioCC ? 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.' : (isCezary ? 'Moja relacja z Bogiem to fundament każdego dnia. Razem z moją ukochaną żoną Wiolettą tworzymy i rozwijamy misję Christian Culture oraz Radio Christian Culture.' : (isWioletta ? 'Współtworzę z moim mężem Cezarym dzieło Christian Culture i Radio CC. Moje serce bije dla budowania silnej rodziny zakorzenionej w Bogu.' : 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.')),
            avatar: userAvatar,
            cover: 'lumina_default_cover.jpg',
            coverPosY: '50%',
            visibility: 'public',
            tags: isRadioCC ? ['Christian Culture', 'Radio CC', 'Misja', 'Ewangelizacja', 'Muzyka Chwały'] : [],
            photos: (typeof isLuminaRealPersonPhoto === 'function' && isLuminaRealPersonPhoto(userAvatar, cleanSlug)) ? [userAvatar] : [],
            posts: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        if (activeDb) {
            try {
                await setDoc(doc(activeDb, 'lumina_profiles', user.uid), existingProfile, { merge: true });
            } catch(e) {}
        }
    }

    currentProfileState = existingProfile;
    currentUserState = user;

    try {
        const uData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || ''
        };
        localStorage.setItem('lumina_current_user', JSON.stringify(uData));
        localStorage.setItem('lumina_user_session', 'active');
        localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(existingProfile));
        if (existingProfile.slug) localStorage.setItem('lumina_profile_' + existingProfile.slug, JSON.stringify(existingProfile));
        localStorage.setItem('lumina_current_user_profile', JSON.stringify(existingProfile));
        localStorage.setItem('lumina_my_profile', JSON.stringify(existingProfile));
        sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
        if (existingProfile.slug) sessionStorage.setItem('lumina_auth_owner_' + existingProfile.slug, 'true');
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('lumina-auth-state', { detail: { user, profile: existingProfile, isNewUser: isBrandNewUser } }));
    
    // Jeśli to nowo zarejestrowany użytkownik — opublikuj oficjalne, imienne powitanie na tablicy LUMINA
    if (isBrandNewUser) {
        try {
            postWelcomeMessageForNewUser(user, existingProfile, activeDb);
        } catch(welcomeErr) {
            console.warn('[LUMINA] Błąd powitania nowego użytkownika:', welcomeErr);
        }
    }

    return { user, profile: existingProfile, isNewUser: isBrandNewUser };
}

export async function loginWithGoogle() {
    try {
        let activeAuth = auth;
        let activeDb = db;
        if (!activeAuth || !activeDb) {
            const ready = await ensureDbReady();
            activeAuth = ready.auth;
            activeDb = ready.db;
        }
        if (!activeAuth) {
            throw new Error("Nie udało się połączyć z usługą Firebase Auth. Odśwież stronę.");
        }

        let result = null;
        try {
            // Na smartfonach i komputerach używamy signInWithPopup jako domyślnej, najbezpieczniejszej metody
            // zapobiegającej gubieniu sesji i utracie stanu strony
            result = await signInWithPopup(activeAuth, googleProvider);
        } catch(popupErr) {
            console.warn('Google Auth popup notice:', popupErr.code, popupErr.message);
            // Jeśli użytkownik sam zamknął okienko popupu — nie wymuszamy błędu
            if (popupErr.code === 'auth/popup-closed-by-user') {
                return null;
            }
            // Gdy popup został zablokowany przez blokadę wyskakujących okienek przeglądarki — fallback do Redirect
            if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request' || popupErr.code === 'auth/internal-error') {
                console.log('[LuminaDB] Popup zablokowany — fallback do signInWithRedirect');
                try {
                    sessionStorage.setItem('cc_auth_redirect_target', window.location.href);
                    await signInWithRedirect(activeAuth, googleProvider);
                    return { isRedirecting: true };
                } catch(redErr) {
                    console.error('[LuminaDB] Redirect Auth Error:', redErr);
                    throw redErr;
                }
            }
            throw popupErr;
        }

        if (!result || !result.user) {
            return null;
        }

        if (typeof window !== 'undefined' && window.ccTrack) window.ccTrack('login', { method: 'google' });
        return await syncUserAuthProfile(result.user, activeDb);
    } catch(err) {
        console.error('Lumina Google Auth error:', err);
        throw err;
    }
}

export async function registerWithEmail(email, password, basicData) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        
        if (basicData && basicData.name) {
            try { await updateProfile(user, { displayName: basicData.name }); } catch(e) {}
        }

        const userSlug = basicData.slug || basicData.uid || ('u_' + (basicData.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000));

        // Save complete profile
        const initialProfile = {
            uid: user.uid,
            slug: userSlug,
            email: user.email,
            name: basicData.name || 'Użytkownik LUMINA',
            age: basicData.age ? Number(basicData.age) : null,
            city: basicData.city || 'Polska',
            gender: basicData.gender || 'kobieta',
            lookingFor: basicData.lookingFor || 'mezczyzna',
            denom: basicData.denom || 'Chrześcijanin',
            church: basicData.church || '',
            job: basicData.job || 'Społeczność LUMINA ✨',
            verse: basicData.verse || '„Wszystko mogę w Tym, który mnie umacnia.”',
            verseRef: basicData.verseRef || 'Flp 4, 13',
            bio: basicData.bio || '',
            status: basicData.status || 'Panna/Kawaler',
            avatar: basicData.avatar || 'lumina_icon.jpg',
            cover: basicData.cover || 'lumina_default_cover.jpg',
            tags: basicData.tags || ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
            visibility: basicData.visibility || 'public',
            pin: basicData.pin || '7777',
            matchScore: basicData.matchScore || '98%',
            isVerified: true,
            photos: basicData.photos || [basicData.avatar || 'lumina_icon.jpg'],
            posts: basicData.posts || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        if (db) {
            try {
                await setDoc(doc(db, 'lumina_profiles', user.uid), initialProfile, { merge: true });
                if (userSlug && userSlug !== user.uid) {
                    await setDoc(doc(db, 'lumina_profiles', userSlug), initialProfile, { merge: true });
                }
            } catch(e) { console.warn('Firestore setDoc notice:', e.message); }
        }

        currentProfileState = initialProfile;
        
        try {
            localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(initialProfile));
            if (userSlug) localStorage.setItem('lumina_profile_' + userSlug, JSON.stringify(initialProfile));
            localStorage.setItem('lumina_current_user_profile', JSON.stringify(initialProfile));
            sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
            if (userSlug) sessionStorage.setItem('lumina_auth_owner_' + userSlug, 'true');
        } catch(e) {}

        // Oficjalne powitanie nowego użytkownika na tablicy LUMINA
        try {
            postWelcomeMessageForNewUser(user, initialProfile, db);
        } catch(welcomeErr) {
            console.warn('[LUMINA] Błąd powitania nowego użytkownika (email register):', welcomeErr);
        }

        return { user, profile: initialProfile, isNewUser: true };
    } catch(err) {
        console.error('Lumina Email Register error:', err);
        throw err;
    }
}

export async function loginWithEmail(email, password) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        if (typeof window !== 'undefined' && window.ccTrack) window.ccTrack('login', { method: 'email' });
        let profile = null;
        try {
            const snap = await getDoc(doc(db, 'lumina_profiles', user.uid));
            if (snap.exists()) profile = snap.data();
        } catch(e) {}
        return { user, profile };
    } catch(err) {
        console.error('Lumina Email Login error:', err);
        throw err;
    }
}

export async function logoutUser() {
    if (auth) {
        try {
            await signOut(auth);
        } catch(err) {
            console.error('Lumina Logout error:', err);
        }
    }
    currentUserState = null;
    currentProfileState = null;
    localStorage.removeItem('lumina_current_user_profile');
    localStorage.removeItem('lumina_current_user');
    localStorage.removeItem('lumina_my_profile');
    localStorage.removeItem('lumina_user_email');
    localStorage.removeItem('lumina_admin');
    localStorage.removeItem('lumina_auth_master_admin');
    localStorage.removeItem('lumina_user_session');
    localStorage.removeItem('lumina_auth_token');
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('lumina_auth_') || k.startsWith('lumina_'))) {
            sessionStorage.removeItem(k);
        }
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('lumina_auth_owner_') || k.startsWith('lumina_chat_'))) {
            localStorage.removeItem(k);
        }
    }
    if (typeof document !== 'undefined') {
        document.body.classList.remove('lumina-admin-mode');
        document.body.classList.remove('owner-mode-active');
        const founderHub = document.getElementById('founderMissionHub');
        if (founderHub) founderHub.classList.remove('admin-active');
    }
}

// Global window exposure for Christian Culture unified Google Auth ecosystem
window.logoutUser = logoutUser;
window.loginWithGoogle = loginWithGoogle;
window.syncUserAuthProfile = syncUserAuthProfile;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.getCurrentUser = getCurrentUser;
window.getCurrentProfile = getCurrentProfile;
window.ensureDbReady = ensureDbReady;
window.onAuthChange = onAuthChange;

window.postWelcomeMessageForNewUser = postWelcomeMessageForNewUser;

window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.loginWithGoogle = loginWithGoogle;
window.LuminaDB.syncUserAuthProfile = syncUserAuthProfile;
window.LuminaDB.postWelcomeMessageForNewUser = postWelcomeMessageForNewUser;
window.LuminaDB.logoutUser = logoutUser;
window.LuminaDB.loginWithEmail = loginWithEmail;
window.LuminaDB.registerWithEmail = registerWithEmail;
window.LuminaDB.getCurrentUser = getCurrentUser;
window.LuminaDB.getCurrentProfile = getCurrentProfile;
window.LuminaDB.ensureDbReady = ensureDbReady;
window.LuminaDB.onAuthChange = onAuthChange;
window.LuminaDB.getFirebaseAuthUser = getFirebaseAuthUser;
window.LuminaDB.waitForAuthReady = waitForAuthReady;

// ── Phone (SMS OTP) Authentication ──
export function setupPhoneRecaptcha(containerId = 'recaptcha-container') {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    if (window._luminaRecaptchaVerifier) {
        return window._luminaRecaptchaVerifier;
    }
    // Check if element exists or create a hidden container
    let containerEl = document.getElementById(containerId);
    if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.id = containerId;
        document.body.appendChild(containerEl);
    }
    window._luminaRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': () => {
            console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
            console.warn('reCAPTCHA expired');
        }
    });
    return window._luminaRecaptchaVerifier;
}

export function normalizePhoneNumber(raw) {
    if (!raw) return '';
    let cleaned = String(raw).trim().replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('+')) {
        // already has + prefix
    } else if (cleaned.startsWith('48') && cleaned.length === 11) {
        cleaned = '+' + cleaned;
    } else if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
        // 9-digit Polish number without prefix (e.g. 501234567) -> add +48
        cleaned = '+48' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '+48' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    return cleaned;
}

export async function sendPhoneVerificationCode(phoneNumber, appVerifier) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized || !/^\+[1-9]\d{7,14}$/.test(normalized)) {
        throw new Error(`Nieprawidłowy format numeru: "${phoneNumber}". Podaj 9 cyfr (np. 500 123 456) lub z prefiksem (+48 500 123 456).`);
    }

    try {
        let containerEl = document.getElementById('recaptcha-container');
        if (!containerEl) {
            containerEl = document.createElement('div');
            containerEl.id = 'recaptcha-container';
            document.body.appendChild(containerEl);
        }

        if (!window.recaptchaVerifier && !window._luminaRecaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log('Invisible reCAPTCHA solved');
                },
                'expired-callback': () => {
                    if (window.recaptchaVerifier) {
                        try { window.recaptchaVerifier.clear(); } catch(e) {}
                        window.recaptchaVerifier = null;
                    }
                }
            });
            window._luminaRecaptchaVerifier = window.recaptchaVerifier;
        }

        const verifier = appVerifier || window.recaptchaVerifier || window._luminaRecaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, normalized, verifier);
        window.confirmationResult = confirmationResult;
        window._luminaPhoneConfirmationResult = confirmationResult;
        return confirmationResult;
    } catch(err) {
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch(e) {}
            window.recaptchaVerifier = null;
            window._luminaRecaptchaVerifier = null;
        }
        console.error('Lumina Phone Auth Send Code Error:', err);
        throw err;
    }
}

export async function confirmPhoneVerificationCode(confirmationResult, verificationCode, basicData) {
    if (!confirmationResult && window._luminaPhoneConfirmationResult) {
        confirmationResult = window._luminaPhoneConfirmationResult;
    }
    if (!confirmationResult) throw new Error('Brak aktywnej sesji weryfikacji SMS.');
    try {
        const result = await confirmationResult.confirm(verificationCode);
        const user = result.user;
        
        let existingProfile = null;
        try {
            const docSnap = await getDoc(doc(db, 'lumina_profiles', user.uid));
            if (docSnap.exists()) {
                existingProfile = docSnap.data();
            }
        } catch(e) {}

        if (!existingProfile && basicData) {
            const initialProfile = {
                uid: user.uid,
                phoneNumber: user.phoneNumber,
                name: basicData.name || 'Użytkownik LUMINA',
                age: (basicData && basicData.age) ? Number(basicData.age) : null,
                city: basicData.city || 'Polska',
                gender: basicData.gender || 'kobieta',
                lookingFor: basicData.lookingFor || 'mezczyzna',
                denom: basicData.denom || 'Chrześcijanin',
                status: basicData.status || 'Panna/Kawaler',
                avatar: (basicData && basicData.avatar) ? basicData.avatar : 'lumina_icon.jpg',
                cover: 'lumina_default_cover.jpg',
                visibility: 'public',
                matchScore: '96%',
                isVerified: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'lumina_profiles', user.uid), initialProfile);
            currentProfileState = initialProfile;
            existingProfile = initialProfile;
        }

        return { user, profile: existingProfile, isNewUser: !existingProfile };
    } catch(err) {
        console.error('Lumina Phone Auth Confirm Error:', err);
        throw err;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 2. PROFILES REALTIME SYNC (Firestore + LocalStorage Hybrid)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToProfile(slugOrUid, onUpdate) {
    if (!slugOrUid) return () => {};
    const normalized = slugOrUid.trim().toLowerCase();
    const localKey = `lumina_profile_${normalized}`;
    
    // 1. Immediate local cache emission
    try {
        let cached = localStorage.getItem(localKey) || localStorage.getItem(`lumina_profile_${slugOrUid}`);
        if (!cached) {
            const cur = localStorage.getItem('lumina_current_user_profile');
            if (cur) {
                const p = JSON.parse(cur);
                if (p && ((p.slug && p.slug.toLowerCase() === normalized) || (p.uid && p.uid.toLowerCase() === normalized))) cached = cur;
            }
        }
        if (cached) {
            onUpdate(JSON.parse(cached));
        }
    } catch(e) {}

    // 2. Immediate fast REST fetch
    try {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/lumina_profiles?key=${FIREBASE_CONFIG.apiKey}&pageSize=100`;
        fetch(restUrl).then(r => r.json()).then(json => {
            if (json && json.documents) {
                const found = json.documents.find(d => {
                    const docId = d.name.split('/').pop().toLowerCase();
                    const f = d.fields || {};
                    const s = (f.slug?.stringValue || '').toLowerCase();
                    const u = (f.uid?.stringValue || '').toLowerCase();
                    return docId === normalized || s === normalized || u === normalized;
                });
                if (found) {
                    const f = found.fields || {};
                    const profileData = {
                        uid: f.uid?.stringValue || found.name.split('/').pop(),
                        slug: f.slug?.stringValue || slugOrUid,
                        name: f.name?.stringValue || 'Użytkownik LUMINA',
                        age: f.age ? (f.age.integerValue || f.age.stringValue) : '',
                        city: f.city?.stringValue || 'Polska',
                        gender: f.gender?.stringValue || 'kobieta',
                        lookingFor: f.lookingFor?.stringValue || 'mezczyzna',
                        denom: f.denom?.stringValue || 'Chrześcijanin',
                        church: f.church?.stringValue || '',
                        job: f.job?.stringValue || 'Społeczność LUMINA ✨',
                        verse: f.verse?.stringValue || '„Wszystko mogę w Tym, który mnie umacnia.”',
                        verseRef: f.verseRef?.stringValue || 'Flp 4, 13',
                        bio: f.bio?.stringValue || '',
                        status: f.status?.stringValue || 'Panna/Kawaler',
                        avatar: f.avatar?.stringValue || 'lumina_icon.jpg',
                        cover: f.cover?.stringValue || 'lumina_default_cover.jpg',
                        visibility: f.visibility?.stringValue || 'public',
                        matchScore: f.matchScore?.stringValue || '98%',
                        isVerified: true,
                        photos: f.photos?.arrayValue?.values ? f.photos.arrayValue.values.map(v => v.stringValue).filter(Boolean) : [f.avatar?.stringValue || 'lumina_icon.jpg'],
                        posts: []
                    };

                    // Żelazna ochrona tożsamości Dowódcy — zakaz zdjęcia Dowódcy na profilach obcych
                    const pSlugLower = (profileData.slug || '').toLowerCase();
                    const pNameLower = (profileData.name || '').toLowerCase();
                    void pNameLower;
                    const isCmd = pSlugLower === 'cezaryrgowski';
                    const isWife = pSlugLower === 'wiolettarogowska';
                    if (!isCmd && !isWife) {
                        if (profileData.avatar && (profileData.avatar.includes('avatar_new1') || profileData.avatar.includes('avatar_cezary') || profileData.avatar.includes('cezary_rgowski') || profileData.avatar.includes('cezary_rogowski'))) {
                            profileData.avatar = 'lumina_icon.jpg';
                        }
                        if (Array.isArray(profileData.photos)) {
                            profileData.photos = profileData.photos.filter(p => p && !p.includes('avatar_new1') && !p.includes('avatar_cezary') && !p.includes('cezary'));
                            if (profileData.photos.length === 0) profileData.photos = ['lumina_icon.jpg'];
                        }
                    }
                    try {
                        localStorage.setItem(localKey, JSON.stringify(profileData));
                        if (profileData.slug) localStorage.setItem(`lumina_profile_${profileData.slug.toLowerCase()}`, JSON.stringify(profileData));
                        if (profileData.uid) localStorage.setItem(`lumina_profile_${profileData.uid}`, JSON.stringify(profileData));
                    } catch(e) {}
                    onUpdate(profileData);
                }
            }
        }).catch(() => {});
    } catch(e) {}

    if (!db) return () => {};

    try {
        // Query by slug OR by UID
        const qSlug = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
        const unsub = onSnapshot(qSlug, async (snap) => {
            if (!snap.empty) {
                const cloudData = snap.docs[0].data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudData));
                    if (cloudData.slug) localStorage.setItem(`lumina_profile_${cloudData.slug}`, JSON.stringify(cloudData));
                    if (cloudData.uid) localStorage.setItem(`lumina_profile_${cloudData.uid}`, JSON.stringify(cloudData));
                } catch(e) {}
                onUpdate(cloudData);
            } else {
                try {
                    const docSnap = await getDoc(doc(db, 'lumina_profiles', slugOrUid));
                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        try {
                            localStorage.setItem(localKey, JSON.stringify(cloudData));
                            if (cloudData.slug) localStorage.setItem(`lumina_profile_${cloudData.slug}`, JSON.stringify(cloudData));
                            if (cloudData.uid) localStorage.setItem(`lumina_profile_${cloudData.uid}`, JSON.stringify(cloudData));
                        } catch(e) {}
                        onUpdate(cloudData);
                    }
                } catch(errDoc) {}
            }
        }, (err) => {
            console.warn(`Lumina Realtime Profile [${slugOrUid}] sync error:`, err.message);
        });
        return unsub;
    } catch(err) {
        console.warn('subscribeToProfile error:', err);
        return () => {};
    }
}


// ── Pobieranie profilu użytkownika z chmury (Firestore / LocalStorage) ──
export async function getProfileFromCloud(slugOrUid) {
    if (!slugOrUid) return null;
    const normalized = slugOrUid.trim().toLowerCase();
    if (normalized.replace(/^u_/, '') === 'zbyszekgieron') return null;
    try {
        if (normalized === 'robertlukaszpio' || normalized === 'robertukaszpio' || normalized === 'u_robertukaszpio_5668' || normalized === 'jidflt3g8ohgpcowmcljaz9i5d42') {
            return ROBERT_LUKASZ_PIO_PROFILE;
        }
        if (normalized === 'andrzejthiel' || normalized === 'andrzej') {
            return ANDRZEJ_THIEL_PROFILE;
        }
        const localKey = `lumina_profile_${normalized}`;
        let localData = localStorage.getItem(localKey);
        if (!localData && currentUserState && (normalized === currentUserState.uid?.toLowerCase() || normalized === currentUserState.slug?.toLowerCase())) {
            localData = localStorage.getItem('lumina_current_user_profile');
        }

        if (db) {
            // First check by slug field query
            const q = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
                const profileDoc = querySnap.docs[0];
                const cloudProfile = { uid: profileDoc.id, ...profileDoc.data() };
                if (window.LuminaStorage) {
                    window.LuminaStorage.saveProfile(slugOrUid, cloudProfile);
                }
                try {
                    const safe = typeof window.sanitizeProfileForLocalStorage === 'function'
                        ? window.sanitizeProfileForLocalStorage(localKey, cloudProfile)
                        : cloudProfile;
                    localStorage.setItem(localKey, JSON.stringify(safe));
                } catch(e) {}
                return cloudProfile;
            }

            // Second check by doc ID
            const docSnap = await getDoc(doc(db, 'lumina_profiles', slugOrUid));
            if (docSnap.exists()) {
                const cloudProfile = { uid: docSnap.id, ...docSnap.data() };
                if (window.LuminaStorage) {
                    window.LuminaStorage.saveProfile(slugOrUid, cloudProfile);
                }
                try {
                    const safe = typeof window.sanitizeProfileForLocalStorage === 'function'
                        ? window.sanitizeProfileForLocalStorage(localKey, cloudProfile)
                        : cloudProfile;
                    localStorage.setItem(localKey, JSON.stringify(safe));
                } catch(e) {}
                return cloudProfile;
            }
        }
        if (localData) {
            try { return JSON.parse(localData); } catch(e) {}
        }
        if (window.LuminaStorage) {
            const idbProf = await window.LuminaStorage.getProfile(slugOrUid);
            if (idbProf) return idbProf;
        }

        // Fallback do bazy profili statycznych (PROFILES_DB / getLuminaProfile)
        if (typeof window !== 'undefined') {
            if (window.PROFILES_DB) {
                const cleanSlug = normalized.replace(/^u_/, '');
                const match = window.PROFILES_DB[slugOrUid] || window.PROFILES_DB[normalized] || window.PROFILES_DB[cleanSlug] ||
                              (normalized.includes('robert') ? (window.PROFILES_DB['robertlukaszpio'] || window.PROFILES_DB['u_robertukaszpio_5668'] || window.PROFILES_DB['robertukaszpio']) : null);
                if (match && match.uid) {
                    try { localStorage.setItem(localKey, JSON.stringify(match)); } catch(e) {}
                    return match;
                }
            }
            if (typeof window.getLuminaProfile === 'function') {
                const p = window.getLuminaProfile(slugOrUid);
                if (p && p.uid && p.name && p.name !== 'Użytkownik LUMINA') {
                    try { localStorage.setItem(localKey, JSON.stringify(p)); } catch(e) {}
                    return p;
                }
            }
        }

        return null;
    } catch(err) {
        console.warn(`Lumina getProfileFromCloud [${slugOrUid}] error:`, err.message);
        // Firestore REST/query może chwilowo zwrócić 429. Nie gub wtedy
        // poprawnego profilu zapisanego lokalnie — zawiera on także UID
        // potrzebny do autoryzacji wiadomości i wysyłki PUSH.
        try {
            if (normalized === 'robertlukaszpio' || normalized === 'robertukaszpio' || normalized === 'u_robertukaszpio_5668' || normalized === 'jidflt3g8ohgpcowmcljaz9i5d42') {
                return ROBERT_LUKASZ_PIO_PROFILE;
            }
            if (normalized === 'andrzejthiel' || normalized === 'andrzej') {
                return ANDRZEJ_THIEL_PROFILE;
            }
            const fallback = localStorage.getItem(`lumina_profile_${normalized}`) || localStorage.getItem(`lumina_profile_${slugOrUid}`);
            if (fallback) return JSON.parse(fallback);
        } catch(e) {}
        return null;
    }
}

export const registerUser = registerWithEmail;
export const loginUser = loginWithEmail;

export async function saveProfileToCloud(slugOrUid, profileData) {
    if (!slugOrUid) return profileData;
    const cleanSlug = (slugOrUid || '').toLowerCase();
    const cleanName = (profileData.name || '').toLowerCase();

    // 🛡️ STRAŻNIK: dane domyślne WYŁĄCZNIE dla dokładnych slugów kont oficjalnych.
    // Wcześniej każdy użytkownik o imieniu „Cezary”, „Wioletta”, „Andrzej” dostawał cudze imię, wiek, miasto i zdjęcie.
    const OFFICIAL_DEFAULTS = {
        cezaryrgowski: { name: 'Cezary Rogowski', age: 51, city: 'Ostrowiec Świętokrzyski, Polska', avatar: 'avatar_cezary_official.jpg' },
        wiolettarogowska: { name: 'Wioletta Rogowska', age: 50, city: 'Ostrowiec Świętokrzyski, Polska', avatar: 'avatar_wioletta_official.jpg' },
        andrzejthiel: { name: 'Andrzej Thiel', avatar: 'avatar_andrzej_thiel.jpg', city: 'Sieradz, Polska' },
        andrzejhamera: { name: 'Andrzej Hamera', age: 52, city: 'Lublin, Polska', avatar: 'avatar_andrzej_hamera.jpg' },
        u_yciezywymbogiem_4231: { name: 'Paweł Murawski', age: 49, city: 'Żywiec, Polska', avatar: 'avatar_pawel_murawski.jpg' }
    };
    const officialDefaults = OFFICIAL_DEFAULTS[cleanSlug] || null;
    void cleanName;
    if (!profileData.name || profileData.name.trim() === '') {
        if (officialDefaults && officialDefaults.name) profileData.name = officialDefaults.name;
    }
    if (!profileData.age && officialDefaults && officialDefaults.age) profileData.age = officialDefaults.age;
    if ((!profileData.city || profileData.city.trim() === '') && officialDefaults && officialDefaults.city) profileData.city = officialDefaults.city;
    if (!profileData.avatar || profileData.avatar === 'null' || profileData.avatar === 'undefined' || profileData.avatar.trim() === '') {
        profileData.avatar = (officialDefaults && officialDefaults.avatar) || 'lumina_icon.jpg';
    }
    if (!profileData.cover || profileData.cover === 'null' || profileData.cover === 'undefined' || profileData.cover.trim() === '') {
        profileData.cover = 'lumina_default_cover.jpg';
    }

    // Save full profile to IndexedDB (unlimited storage)
    if (window.LuminaStorage) {
        window.LuminaStorage.saveProfile(slugOrUid, profileData);
    }

    // Save sanitized lightweight version to localStorage (< 3KB)
    try {
        const safeProfile = typeof window.sanitizeProfileForLocalStorage === 'function'
            ? window.sanitizeProfileForLocalStorage(slugOrUid, profileData)
            : profileData;
        const safeJson = JSON.stringify(safeProfile);

        localStorage.setItem(`lumina_profile_${slugOrUid}`, safeJson);
        if (profileData.slug && profileData.slug !== slugOrUid) localStorage.setItem(`lumina_profile_${profileData.slug}`, safeJson);
        if (profileData.uid && profileData.uid !== slugOrUid) localStorage.setItem(`lumina_profile_${profileData.uid}`, safeJson);
        
        const curUserRaw = localStorage.getItem('lumina_current_user_profile');
        let isCurrent = false;
        if (curUserRaw) {
            try {
                const curU = JSON.parse(curUserRaw);
                if (curU && (curU.slug === slugOrUid || curU.uid === slugOrUid || curU.slug === profileData.slug)) {
                    isCurrent = true;
                }
            } catch(e) {}
        } else {
            isCurrent = true;
        }
        if (isCurrent) {
            localStorage.setItem('lumina_current_user_profile', safeJson);
        }
        sessionStorage.setItem(`lumina_auth_owner_${slugOrUid}`, 'true');
        if (profileData.slug) sessionStorage.setItem(`lumina_auth_owner_${profileData.slug}`, 'true');
        if (profileData.uid) sessionStorage.setItem(`lumina_auth_owner_${profileData.uid}`, 'true');
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    if (!db) return profileData;

    try {
        const payload = {
            ...profileData,
            slug: profileData.slug || slugOrUid,
            updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'lumina_profiles', slugOrUid), payload, { merge: true });
        if (profileData.uid && profileData.uid !== slugOrUid) {
            await setDoc(doc(db, 'lumina_profiles', profileData.uid), payload, { merge: true });
        }
        if (profileData.slug && profileData.slug !== slugOrUid && profileData.slug !== profileData.uid) {
            await setDoc(doc(db, 'lumina_profiles', profileData.slug), payload, { merge: true });
        }
        console.log(`Lumina: Profil [${slugOrUid}] zsynchronizowany z chmurą Firestore! ☁️✨`);
    } catch(err) {
        console.warn(`Lumina: Błąd zapisu profilu [${slugOrUid}] w Firestore:`, err.message);
    }
    return profileData;
}

export async function deleteProfileFromCloud(slugOrUid) {
    if (!slugOrUid) return false;
    const cleanSlug = slugOrUid.toLowerCase().trim();
    const cleanNoU = cleanSlug.replace(/^u_/, '');
    
    // Clear local storage and session
    try {
        const keysToRemove = [
            `lumina_profile_${slugOrUid}`,
            `lumina_profile_${cleanSlug}`,
            `lumina_avatar_${slugOrUid}`,
            `lumina_avatar_${cleanSlug}`,
            `lumina_cover_${slugOrUid}`,
            `lumina_cover_${cleanSlug}`,
            `lumina_carousel_${slugOrUid}`,
            `lumina_carousel_${cleanSlug}`,
            `lumina_friend_${slugOrUid}`,
            `lumina_friend_${cleanSlug}`,
            `lumina_following_${slugOrUid}`,
            `lumina_following_${cleanSlug}`,
            `lumina_auth_owner_${slugOrUid}`,
            `lumina_auth_owner_${cleanSlug}`,
            `lumina_private_access_${slugOrUid}`,
            `lumina_private_access_${cleanSlug}`
        ];
        if (cleanNoU !== cleanSlug) {
            keysToRemove.push(
                `lumina_profile_${cleanNoU}`,
                `lumina_avatar_${cleanNoU}`,
                `lumina_cover_${cleanNoU}`,
                `lumina_carousel_${cleanNoU}`,
                `lumina_friend_${cleanNoU}`,
                `lumina_following_${cleanNoU}`,
                `lumina_auth_owner_${cleanNoU}`
            );
        }
        keysToRemove.forEach(k => {
            try { localStorage.removeItem(k); } catch(e) {}
            try { sessionStorage.removeItem(k); } catch(e) {}
        });

        // Remove from registered custom users list
        let customUsers = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
        customUsers = customUsers.filter(u => {
            if (!u) return false;
            const s = (u.slug || u.uid || u.id || '').toLowerCase().trim();
            return s !== cleanSlug && s !== cleanNoU && s !== slugOrUid.toLowerCase().trim();
        });
        localStorage.setItem('lumina_custom_users_list', JSON.stringify(customUsers));

        // Add to permanent blacklist of deleted profiles
        let deleted = JSON.parse(localStorage.getItem('lumina_deleted_profiles') || '[]');
        if (!deleted.includes(cleanSlug)) deleted.push(cleanSlug);
        if (!deleted.includes(cleanNoU)) deleted.push(cleanNoU);
        localStorage.setItem('lumina_deleted_profiles', JSON.stringify(deleted));

        // Dispatch storage and deletion events
        window.dispatchEvent(new CustomEvent('lumina:profileDeleted', { detail: { slug: cleanSlug } }));
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    // Delete from Firestore
    if (db) {
        try {
            await deleteDoc(doc(db, 'lumina_profiles', slugOrUid));
            if (cleanSlug !== slugOrUid) {
                await deleteDoc(doc(db, 'lumina_profiles', cleanSlug));
            }
            if (cleanNoU !== cleanSlug) {
                await deleteDoc(doc(db, 'lumina_profiles', cleanNoU));
            }
            console.log(`Lumina: Profil [${slugOrUid}] został usunięty z bazy danych Firestore.`);
        } catch(err) {
            console.warn(`Błąd usuwania profilu [${slugOrUid}] z Firestore:`, err.message);
        }
    }
    return true;
}

export async function deleteProfile(slugOrUid, targetName) {
    if (!slugOrUid) return false;
    const cleanSlug = String(slugOrUid).toLowerCase().trim();
    const displayName = targetName || cleanSlug;

    if (cleanSlug === 'cezaryrgowski') {
        const doubleCheck = confirm("⚠️ UWAGA: Próbujesz usunąć profil Założyciela (Cezary Rogowski)! Czy jesteś ABSOLUTNIE PEWNY?");
        if (!doubleCheck) return false;
    }

    const confirmed = confirm(
        `⚠️ CZY NA PEWNO CHCESZ BEZPOWROTNIE USUNĄĆ PROFIL?\n\n` +
        `Użytkownik: "${displayName}" (slug: ${cleanSlug})\n\n` +
        `Ta operacja:\n` +
        `• Trwale usunie profil z chmury Firestore\n` +
        `• Usunie profil ze wszystkich list, karuzeli i katalogów portalu\n` +
        `• Wyczyści powiązane relacje znajomości i obserwowania\n` +
        `• Zablokuje jego ponowne wyświetlanie\n\n` +
        `Operacji nie można cofnąć. Kontynuować?`
    );
    if (!confirmed) return false;

    if (typeof window.showToast === 'function') {
        window.showToast(`Usuwanie profilu ${displayName} z bazy portalu... 🕊️`);
    }

    await deleteProfileFromCloud(cleanSlug);

    // Remove any DOM card from carousel or lists
    try {
        const cleanNoU = cleanSlug.replace(/^u_/, '');
        document.querySelectorAll(`.profile-card[data-user-slug="${cleanSlug}"], .profile-card[data-user-slug="${cleanNoU}"]`).forEach(el => el.remove());
        document.querySelectorAll(`.followed-friend-item[data-slug="${cleanSlug}"], .followed-friend-card-wrapper[data-slug="${cleanSlug}"]`).forEach(el => el.remove());
        document.querySelectorAll(`.search-result-item[data-slug="${cleanSlug}"]`).forEach(el => el.remove());
    } catch(e) {}

    if (typeof window.showToast === 'function') {
        window.showToast(`🗑️ Profil ${displayName} został trwale usunięty z portalu LUMINA.`);
    }

    // If on that profile's page, redirect
    const curPath = window.location.pathname.toLowerCase();
    const curSearch = window.location.search.toLowerCase();
    if (curSearch.includes('u=' + cleanSlug) || curSearch.includes('user=' + cleanSlug) || curPath.includes(cleanSlug)) {
        setTimeout(() => {
            window.location.href = 'lumina-tablica.html';
        }, 1200);
    }
    return true;
}

if (typeof window !== 'undefined') {
    window.LuminaDeleteProfile = deleteProfile;
}

export async function setProfileBlockStatus(slugOrUid, isBlocked, reason = 'Zablokowany przez Administratora Portalu') {
    if (!slugOrUid) return false;
    const cleanSlug = slugOrUid.toLowerCase();
    
    // Update local cache
    try {
        let cached = localStorage.getItem(`lumina_profile_${slugOrUid}`) || localStorage.getItem(`lumina_profile_${cleanSlug}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            parsed.isBlocked = !!isBlocked;
            parsed.blockedReason = reason;
            parsed.blockedAt = new Date().toISOString();
            localStorage.setItem(`lumina_profile_${slugOrUid}`, JSON.stringify(parsed));
            localStorage.setItem(`lumina_profile_${cleanSlug}`, JSON.stringify(parsed));
        }
        if (isBlocked) {
            await blockUser(slugOrUid);
        } else {
            await unblockUser(slugOrUid);
        }
    } catch(e) {}

    // Update in Firestore
    if (db) {
        try {
            const updatePayload = {
                isBlocked: !!isBlocked,
                blockedReason: reason,
                blockedAt: isBlocked ? serverTimestamp() : null,
                updatedAt: serverTimestamp()
            };
            await updateDoc(doc(db, 'lumina_profiles', slugOrUid), updatePayload);
            if (cleanSlug !== slugOrUid) {
                try { await updateDoc(doc(db, 'lumina_profiles', cleanSlug), updatePayload); } catch(e) {}
            }
        } catch(err) {
            console.warn(`Błąd aktualizacji statusu blokady [${slugOrUid}]:`, err.message);
        }
    }
    return true;
}

export function subscribeToAllCommunityProfiles(onUpdate) {
    if (!db) return () => {};
    try {
        const q = query(
            collection(db, 'lumina_profiles'),
            limit(60)
        );
        return onSnapshot(q, (snap) => {
            const profiles = [];
            snap.forEach(d => {
                const data = d.data();
                const p = { uid: d.id, ...data };
                // 🛡️ STRAŻNIK: korekty kont oficjalnych wyłącznie po DOKŁADNYM slugu — nigdy po imieniu.
                const _rawSlugLower = (p.slug || d.id || '').toLowerCase();
                const nameLower = '';
                const slugLower = (LUMINA_RESERVED_PROFILE_SLUGS.includes(_rawSlugLower) || ['andrzejhamera', 'u_yciezywymbogiem_4231'].includes(_rawSlugLower)) ? _rawSlugLower : '';

                // Żelazne wymuszenie i samonaprawa danych Cezarego (51 lat, Ostrowiec Św.)
                if (slugLower.includes('cezary') || nameLower.includes('cezary')) {
                    p.name = 'Cezary Rogowski';
                    p.age = 51;
                    p.city = 'Ostrowiec Świętokrzyski, Polska';
                    p.avatar = 'avatar_cezary_official.jpg';
                    p.status = 'Żonaty';
                    if (data.age !== 51 || !data.city?.includes('Ostrowiec')) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Cezary Rogowski',
                                age: 51,
                                city: 'Ostrowiec Świętokrzyski, Polska',
                                avatar: 'avatar_cezary_official.jpg',
                                status: 'Żonaty',
                                job: 'Założyciel Christian Culture',
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                // Żelazne wymuszenie i samonaprawa danych Wioletty (50 lat, Ostrowiec Św.)
                if (slugLower.includes('wioletta') || nameLower.includes('wioletta')) {
                    p.name = 'Wioletta Rogowska';
                    p.age = 50;
                    p.city = 'Ostrowiec Świętokrzyski, Polska';
                    p.avatar = 'avatar_wioletta_official.jpg';
                    p.avatarVideo = 'wioletta_rogowska_video_avatar.mp4';
                    p.status = 'Mężatka';
                    if (data.age !== 50 || !data.city?.includes('Ostrowiec') || !data.avatarVideo) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Wioletta Rogowska',
                                age: 50,
                                city: 'Ostrowiec Świętokrzyski, Polska',
                                avatar: 'avatar_wioletta_official.jpg',
                                avatarVideo: 'wioletta_rogowska_video_avatar.mp4',
                                status: 'Mężatka',
                                job: 'Współzałożycielka Christian Culture',
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                // Żelazny zakaz prywatnego zdjęcia Dowódcy na obcych profilach (wyjątek wyłącznie dla żony Wioletty)
                const isCmdProfile = slugLower.includes('cezary') || nameLower.includes('cezary');
                const isWifeProfile = slugLower.includes('wioletta') || nameLower.includes('wioletta');
                if (!isCmdProfile && !isWifeProfile) {
                    let profileContaminated = false;
                    if (p.avatar && (p.avatar.includes('avatar_new1') || p.avatar.includes('avatar_cezary') || p.avatar.includes('cezary_rgowski') || p.avatar.includes('cezary_rogowski'))) {
                        p.avatar = 'lumina_icon.jpg';
                        profileContaminated = true;
                    }
                    if (Array.isArray(p.photos) && p.photos.some(ph => ph && (ph.includes('avatar_new1') || ph.includes('avatar_cezary') || ph.includes('cezary')))) {
                        p.photos = p.photos.filter(ph => ph && !ph.includes('avatar_new1') && !ph.includes('avatar_cezary') && !ph.includes('cezary'));
                        if (p.photos.length === 0) p.photos = ['lumina_icon.jpg'];
                        profileContaminated = true;
                    }
                    if (profileContaminated) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                avatar: p.avatar,
                                photos: p.photos,
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                // Żelazne rozdzielenie i samonaprawa danych Andrzeja Hamery vs Andrzeja Thiela
                if (slugLower.includes('hamera') || nameLower.includes('hamera')) {
                    p.name = 'Andrzej Hamera';
                    p.age = 52;
                    p.city = 'Lublin, Polska';
                    p.avatar = 'avatar_andrzej_hamera.jpg';
                    p.status = 'Chrześcijanin';
                    p.church = 'Wspólnota Chrześcijańska w Lublinie';
                    p.job = 'Właściciel KONCEPT – Studio Mebli Kuchennych na Wymiar 🪚';
                    p.company = 'KONCEPT – Studio Mebli Kuchennych na Wymiar';
                    p.companyUrl = 'https://koncept-studio.pl/';
                    p.facebookUrl = 'https://www.facebook.com/KonceptLublin';
                    p.profileUrl = 'lumina-profile.html?u=andrzejhamera';
                } else if (slugLower.includes('thiel') || nameLower.includes('thiel') || slugLower === 'andrzej' || nameLower === 'andrzej' || ((slugLower.includes('andrzej') || nameLower.includes('andrzej')) && !slugLower.includes('hamera') && !nameLower.includes('hamera'))) {
                    p.name = 'Andrzej Thiel';
                    p.age = 70;
                    p.birthDate = '30 listopada 1955';
                    p.city = 'Sieradz, Polska';
                    p.avatar = 'avatar_andrzej_thiel.jpg';
                    p.status = 'Chrześcijanin';
                    p.job = 'Cuda Każdego Dnia 📖✨';
                    p.profileUrl = 'lumina.andrzejthiel.html';
                }

                // Żelazne wymuszenie i samonaprawa danych Marka Jakubowskiego (Autor Rozważań Biblijnych)
                if (slugLower === 'marekjakubowski' || slugLower === 'u_marekjakubowski' || d.id === 'marekjakubowski' || (p.email && p.email.toLowerCase() === 'marusjakubowski@gmail.com') || (nameLower.includes('jakubowski') && nameLower.includes('marek'))) {
                    p.name = 'Marek Jakubowski';
                    p.city = 'Polska';
                    p.gender = 'mezczyzna';
                    p.denom = 'Chrześcijanin';
                    p.church = 'Wspólnota Chrześcijańska';
                    p.job = 'Autor Rozważań Biblijnych';
                    p.role = 'Autor Rozważań & Społeczność LUMINA ✨';
                    p.verse = '„Pan jest moją siłą i moją tarczą, w nim zaufało moje serce i otrzymałem pomoc.”';
                    p.verseRef = '— Psalm 28, 7 (UBG)';
                    p.bio = 'Cieszę się, że jestem tutaj. Dzielę się tym, co Pan kładzie na moje serce — przez codzienne rozważania Słowa Bożego.';
                    p.tags = ['Rozważania Biblijne', 'Słowo na Dziś', 'Wiara', 'Modlitwa', 'Społeczność LUMINA'];
                    p.profileCompleted = true;
                    p.needsProfileCompletion = false;
                    p.slug = 'marekjakubowski';
                    p.avatar = 'avatar_marek_jakubowski.jpg';
                    p.photos = ['avatar_marek_jakubowski.jpg', 'lumina_default_cover.jpg'];
                    p.carouselMediaUrl = 'avatar_marek_jakubowski.jpg';
                    p.hasRealPhoto = true;
                    p.profileUrl = 'lumina.marekjakubowski.html';
                }

                // Żelazne wymuszenie i samonaprawa danych Pawła Murawskiego (49 lat, Żywiec, Protestanckie, Nabożeństwa Sobotnie)
                if (slugLower === 'u_yciezywymbogiem_4231' || d.id === 'NHjYeuO4nxM8fIfEJPHmi9rTQV12' || (p.email && p.email.toLowerCase() === 'bozenowezycie@gmail.com') || nameLower.includes('murawski')) {
                    p.name = 'Paweł Murawski';
                    p.age = 49;
                    p.gender = 'mezczyzna';
                    p.lookingFor = 'kobieta';
                    p.status = 'Kawaler';
                    p.city = 'Żywiec, Polska';
                    p.denom = 'Protestanckie';
                    p.church = 'Nabożeństwa Sobotnie';
                    p.worshipDay = 'Sobotnie nabożeństwo';
                    p.profileCompleted = true;
                    p.needsProfileCompletion = false;
                    p.slug = 'u_yciezywymbogiem_4231';
                    p.uid = 'NHjYeuO4nxM8fIfEJPHmi9rTQV12';
                    p.avatar = 'avatar_pawel_murawski.jpg';
                    p.photos = ['avatar_pawel_murawski.jpg', 'lumina_default_cover.jpg'];
                    p.carouselMediaUrl = 'avatar_pawel_murawski.jpg';
                    p.hasRealPhoto = true;
                    if (data.age !== 49 || data.name !== 'Paweł Murawski' || data.avatar !== 'avatar_pawel_murawski.jpg' || data.city !== 'Żywiec, Polska' || data.denom !== 'Protestanckie' || data.church !== 'Nabożeństwa Sobotnie') {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Paweł Murawski',
                                age: 49,
                                gender: 'mezczyzna',
                                lookingFor: 'kobieta',
                                status: 'Kawaler',
                                city: 'Żywiec, Polska',
                                denom: 'Protestanckie',
                                church: 'Nabożeństwa Sobotnie',
                                worshipDay: 'Sobotnie nabożeństwo',
                                avatar: 'avatar_pawel_murawski.jpg',
                                photos: ['avatar_pawel_murawski.jpg', 'lumina_default_cover.jpg'],
                                carouselMediaUrl: 'avatar_pawel_murawski.jpg',
                                hasRealPhoto: true,
                                profileCompleted: true,
                                needsProfileCompletion: false,
                                updatedAt: serverTimestamp()
                            }, { merge: true }).catch(() => {});
                        } catch(err) {}
                    }
                }


                // ── Deduplikacja awatarów: Sylwia nie może mieć tego samego zdjęcia co Dorota ──
                // Obie zarejestrowały się z domyślnym awatarem lumina_anna2.jpg (identycznym z avatar_dorota.jpg).
                // Override dla Sylwii → avatar_new2.jpg (całkowicie inne zdjęcie).
                const DUPLICATE_AVATARS = ['lumina_anna2.jpg', 'avatar_dorota.jpg'];
                if (nameLower.includes('sylwia') && DUPLICATE_AVATARS.includes(p.avatar)) {
                    p.avatar = 'avatar_new2.jpg';
                    // Spróbuj naprawić też w Firestore (zadziała gdy zalogowana)
                    try {
                        setDoc(doc(db, 'lumina_profiles', d.id), {
                            avatar: 'avatar_new2.jpg',
                            updatedAt: serverTimestamp()
                        }, { merge: true }).catch(() => {});
                    } catch(err) {}
                }

                profiles.push(p);
            });
            onUpdate(profiles);
        }, (e) => console.warn('Community profiles listener error:', e));
    } catch(e) {
        console.warn('subscribeToAllCommunityProfiles error:', e);
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 3. FEED & POSTS REALTIME SYNC (Tablica Społeczności 1:1)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToFeedPosts(onUpdate) {
    try {
        const localCached = localStorage.getItem('lumina_cloud_posts_cache');
        if (localCached) {
            onUpdate(JSON.parse(localCached));
        }
    } catch(e) {}

    if (!db) return () => {};

    try {
        const postsQuery = query(
            collection(db, 'lumina_posts'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(postsQuery, (snap) => {
            const cloudPosts = [];
            snap.forEach(d => {
                cloudPosts.push({
                    id: d.id,
                    ...d.data()
                });
            });

            try {
                localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(cloudPosts));
            } catch(e) {}

            onUpdate(cloudPosts);
        }, (err) => {
            console.warn('Lumina Realtime Feed error:', err.message);
        });
    } catch(err) {
        console.warn('subscribeToFeedPosts error:', err);
        return () => {};
    }
}

export async function addPostToCloud(postData) {
    if (!db) return null;
    try {
        const docRef = await addDoc(collection(db, 'lumina_posts'), {
            ...postData,
            createdAtTimestamp: serverTimestamp(),
            createdAtDateStr: new Date().toISOString()
        });
        return docRef.id;
    } catch(err) {
        console.warn('Lumina: Błąd zapisu posta w Firestore:', err.message);
        return null;
    }
}

export async function togglePostReactionInCloud(postId, reactionType = 'likes') {
    if (!db || !postId) return;
    try {
        const postRef = doc(db, 'lumina_posts', postId);
        await updateDoc(postRef, {
            [reactionType]: increment(1)
        });
    } catch(e) {
        console.warn('Lumina Reaction Sync error:', e.message);
    }
}

// ── Universal Bi-Directional Post Publishing & Author Sync Engine ──
export async function publishUniversalPost(postData) {
    const slug = postData.authorSlug || postData.authorId || (postData.author ? postData.author.toLowerCase().replace(/\s+/g, '') : 'cezaryrgowski');
    const authorName = postData.author || 'Użytkownik LUMINA';
    const authorAvatar = postData.authorAvatar || 'lumina_icon.jpg';
    const authorRole = postData.authorRole || 'Społeczność LUMINA ✨';
    const authenticatedUser = auth?.currentUser || currentUserState || null;
    const authorUid = postData.authorUid || authenticatedUser?.uid || null;

    const rawCombinedText = `${postData.text || ''} ${postData.desc || ''} ${postData.title || ''}`;
    let autoYtId = extractYouTubeId(postData.videoUrl || postData.youtubeUrl || '');
    if (!autoYtId) {
        const autoMatch = rawCombinedText.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/\s"']+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        if (autoMatch) autoYtId = autoMatch[1];
    }
    const resolvedYtUrl = autoYtId ? ('https://www.youtube.com/watch?v=' + autoYtId) : (postData.youtubeUrl || null);
    const resolvedEmbedUrl = autoYtId ? ('https://www.youtube-nocookie.com/embed/' + autoYtId) : (postData.videoUrl || null);
    const resolvedPoster = postData.image || (autoYtId ? `https://i.ytimg.com/vi/${autoYtId}/hqdefault.jpg` : null);
    const isShortDetected = !!(postData.isShort || postData.is916 || (rawCombinedText && rawCombinedText.includes('/shorts/')) || (postData.videoUrl && String(postData.videoUrl).includes('/shorts/')));

    const normalizedPost = {
        id: postData.id || ('post_' + Date.now()),
        type: isShortDetected ? 'short' : (postData.type || 'post'),
        title: postData.title || '',
        text: postData.text || postData.desc || '',
        image: resolvedPoster,
        videoUrl: resolvedEmbedUrl,
        youtubeUrl: resolvedYtUrl,
        isShort: isShortDetected,
        is916: isShortDetected,
        embedHtml: postData.embedHtml || null,
        playlistUrl: postData.playlistUrl || null,
        isPinned: !!postData.isPinned,
        gdrive: postData.gdrive || null,
        gdriveEmbed: postData.gdriveEmbed || null,
        author: authorName,
        authorSlug: slug,
        authorUid: authorUid,
        authorAvatar: authorAvatar,
        authorRole: authorRole,
        likes: 0,
        amen: 0,
        time: postData.time || 'Przed chwilą • 🌍 Publiczny',
        createdAtTimestamp: postData.createdAtTimestamp || Date.now(),
        createdAtDateStr: new Date().toISOString(),
        isRepost: !!postData.isRepost,
        repostComment: postData.repostComment || '',
        sharedPost: postData.sharedPost || null
    };

    // 1. Trwały zapis jest źródłem prawdy. Dopiero po jego potwierdzeniu
    // aktualizujemy pamięć urządzenia i interfejs.
    if (!db) {
        throw new Error('Połączenie z bazą LUMINA nie jest dostępne. Odśwież stronę i spróbuj ponownie.');
    }
    const realAuth = auth?.currentUser;
    if (!realAuth && !postData.isDevotion) {
        throw new Error('AUTH_REQUIRED: Aby opublikować wpis w chmurze LUMINA, zaloguj się przez konto Google.');
    }

    // Sanityzacja i zabezpieczenie pól pod kątem Firestore (brak undefined, poprawne typy liczników)
    const sanitizedPayload = {};
    for (const [k, v] of Object.entries(normalizedPost)) {
        if (v !== undefined) {
            sanitizedPayload[k] = v;
        }
    }
    sanitizedPayload.authorUid = realAuth ? realAuth.uid : (authorUid || 'anonymous');
    sanitizedPayload.createdAtTimestamp = serverTimestamp();
    sanitizedPayload.likes = 0;
    sanitizedPayload.amen = 0;

    let cloudDocumentId = null;
    try {
        const cloudDoc = await addDoc(collection(db, 'lumina_posts'), sanitizedPayload);
        cloudDocumentId = cloudDoc.id;
    } catch(err) {
        console.error('Lumina Firestore addDoc error:', err);
        let reason = '';
        const errMsg = String(err?.message || '').toLowerCase();
        const errCode = String(err?.code || '').toLowerCase();

        if (errCode.includes('permission') || errMsg.includes('permission') || errMsg.includes('missing or insufficient')) {
            reason = 'Brak uprawnień do publikacji w chmurze LUMINA. Zaloguj się przez konto Google (wymagane zweryfikowane konto).';
        } else if (errCode.includes('invalid-argument') || errMsg.includes('longer than') || errMsg.includes('size')) {
            reason = 'Załączona grafika jest zbyt duża dla bazy chmurowej (maks. 800 KB). Wybierz mniejszy plik lub link.';
        } else if (errCode.includes('unavailable') || errMsg.includes('offline') || errMsg.includes('network')) {
            reason = 'Brak połączenia z siecią. Sprawdź swoje połączenie internetowe.';
        } else {
            reason = 'Błąd zapisu w chmurze LUMINA: ' + (err?.message || err?.code || 'Nieznany błąd');
        }
        throw new Error(reason);
    }

    // 2. Save to Author's Local Profile Posts
    try {
        const isCezary = slug === 'cezaryrgowski';
        const isWioletta = slug === 'wiolettarogowska';
        const isZbyszek = slug === 'zbyszekgieron';
        const storageKeys = [
            `lumina_profile_${slug}`,
            isCezary ? 'lumina_profile_cezaryrgowski' : null,
            isCezary ? 'lumina_main_user_profile' : null,
            isCezary ? 'lumina_current_user_profile' : null,
            isCezary ? 'lumina_my_profile' : null,
            isWioletta ? 'lumina_profile_wiolettarogowska' : null,
            isWioletta ? 'lumina_current_user_profile' : null,
            isWioletta ? 'lumina_my_profile' : null,
            isZbyszek ? 'lumina_profile_zbyszekgieron' : null,
            (slug.includes('women') || slug.includes('ccwomen')) ? 'lumina_profile_u_ccwomen_9055' : null,
            (slug.includes('robert') || slug === 'u_robertukaszpio_5668') ? 'lumina_profile_u_robertukaszpio_5668' : null
        ].filter(Boolean);

        storageKeys.forEach(k => {
            const raw = localStorage.getItem(k);
            let profile = raw ? JSON.parse(raw) : null;
            if (!profile) profile = { name: authorName, slug: slug, posts: [] };
            if (!Array.isArray(profile.posts)) profile.posts = [];
            
            // Check if already in array
            const exists = profile.posts.some(p => p.id === normalizedPost.id || (p.text && normalizedPost.text && p.text === normalizedPost.text && Math.abs((p.createdAtTimestamp || 0) - (normalizedPost.createdAtTimestamp || 0)) < 10000));
            if (!exists) {
                profile.posts.unshift(normalizedPost);
                localStorage.setItem(k, JSON.stringify(profile));
            }
        });

        if (isZbyszek) {
            try {
                let zPosts = JSON.parse(localStorage.getItem('lumina_posts_zbyszekgieron') || '[]');
                if (!zPosts.some(p => p.id === normalizedPost.id)) {
                    zPosts.unshift(normalizedPost);
                    localStorage.setItem('lumina_posts_zbyszekgieron', JSON.stringify(zPosts));
                }
            } catch(e) {}
        }
    } catch(e) {
        console.warn('Lumina: Błąd zapisu posta w profilu autora:', e);
    }

    // 3. Save to Public Feed Local Cache (lumina_cloud_posts_cache & lumina_cc_campaigns)
    try {
        const rawFeed = localStorage.getItem('lumina_cloud_posts_cache');
        const feedList = rawFeed ? JSON.parse(rawFeed) : [];
        const fExists = feedList.some(p => p.id === normalizedPost.id);
        if (!fExists) {
            feedList.unshift(normalizedPost);
            localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(feedList));
        }

        const rawCamp = localStorage.getItem('lumina_cc_campaigns');
        const campList = rawCamp ? JSON.parse(rawCamp) : [];
        const cExists = campList.some(p => p.id === normalizedPost.id);
        if (!cExists) {
            campList.unshift(normalizedPost);
            localStorage.setItem('lumina_cc_campaigns', JSON.stringify(campList));
        }
    } catch(e) {}

    // 4. Dispatch Global Events to trigger instant reactive re-renders
    window.dispatchEvent(new CustomEvent('lumina_post_published', { detail: normalizedPost }));
    window.dispatchEvent(new Event('storage'));

    return { ...normalizedPost, cloudDocumentId };
}

// ══════════════════════════════════════════════════════════════════════════
// 3A. MISSION BROADCAST INTEGRATION ENGINE (Live Autostart Channels on Profiles)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_BROADCAST_CHANNELS = {
    'cezary_rogowski': {
        channelId: 'master_live',
        authorName: 'Cezary Rogowski',
        authorAvatar: 'avatar_cezary_official.jpg',
        authorRole: '👑 Założyciel Christian Culture',
        channelTitle: 'Główny Kanał Telewizyjny Christian Culture TV',
        badge: '🔴 TRANSMISJA NA ŻYWO • EMISJA GŁÓWNA 24/7',
        showTitle: 'Telewizja Christian Culture TV 24/7 • Główny Kanał Nadawczy',
        description: 'Oficjalna całodobowa transmisja telewizyjna Christian Culture TV. Słowo Boże, proroctwa biblijne, pieśni chwały i programy na żywo.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja Główna CC',
        icon: 'fa-tv',
        accentColor: '#d4af37'
    },
    'wioletta_rogowska': {
        channelId: 'biblia_spiewana',
        authorName: 'Wioletta Rogowska',
        authorAvatar: 'avatar_wioletta_official.jpg',
        authorRole: '🌸 Współzałożycielka Christian Culture',
        channelTitle: 'Biblia Śpiewana & Pasmo Uwielbienia Kobiet',
        badge: '🌸 EMISJA NA ŻYWO • SŁOWO I UWIELBIENIE',
        showTitle: 'Biblia Śpiewana • Pasmo Pokoju, Modlitwy i Pieśni Chwały',
        description: 'Wersety Pisma Świętego śpiewane z głębi serca ku Bożej chwale. Przestrzeń Bożego pokoju, budowania relacji i modlitwy.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'biblia-spiewana-live.html',
        category: 'Uwielbienie & Słowo',
        icon: 'fa-heart',
        accentColor: '#ec4899'
    },
    'cc_women': {
        channelId: 'cc_women_live',
        authorName: 'CC WOMEN (WOMEN TV) • YouTube',
        authorAvatar: 'logo_cc_women.jpg',
        authorRole: '🌸 Misja Kobiet Wiary • @womentv24',
        channelTitle: 'CC WOMEN • Oficjalny Kanał YouTube',
        badge: '🌸 EMISJA NA ŻYWO • KOBIETY WIARY',
        showTitle: 'CC WOMEN • Świadectwa, Modlitwa i Muzyka Uwielbienia',
        description: 'Oficjalny kanał Wioletty Rogowskiej i kobiet wiary Christian Culture (@womentv24). Świadectwa przemiany życia, pieśni uwielbienia, modlitwa o relacje i uświęcenie w Chrystusie.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py',
        category: 'Kobiety Wiary',
        icon: 'fa-wand-magic-sparkles',
        accentColor: '#f472b6'
    },
    'cc_men': {
        channelId: 'cc_men_live',
        authorName: 'CC Men • Wojownicy Chrystusa',
        authorAvatar: 'logo_cc_men.jpg',
        authorRole: '⚔️ Misja Mężczyzn Wiary',
        channelTitle: 'CC Men • Pasmo Mężczyzn Wiary & Totalny Atak',
        badge: '⚔️ EMISJA NA ŻYWO • WOJOWNICY CHRYSTUSA',
        showTitle: 'Prof. Walter Veith • Totalny Atak & Męska Formacja Wiary',
        description: 'Męska formacja duchowa, odwaga w wierze, odkrywanie prawdy biblijnej oraz demaskowanie kłamstw współczesnego świata.',
        streamUrl: 'totalny-atak-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'totalny-atak-live.html',
        category: 'Mężczyźni Wiary',
        icon: 'fa-shield-halved',
        accentColor: '#38bdf8'
    },
    'cc_tv': {
        channelId: 'cctv_live',
        authorName: 'Christian Culture TV',
        authorAvatar: 'logo_cctv.png',
        authorRole: '📺 Telewizja CC TV24',
        channelTitle: 'Christian Culture TV 24/7',
        badge: '🔴 EMISJA GŁÓWNA • CCTV24 LIVE',
        showTitle: 'Christian Culture TV • Całodobowy Kanał Chrześcijański',
        description: 'Oficjalna ogólnopolska i międzynarodowa transmisja telewizyjna Christian Culture TV 24/7.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja CC',
        icon: 'fa-satellite-dish',
        accentColor: '#eab308'
    },
    'radio_cc': {
        channelId: 'radio_cc_live',
        authorName: 'Polskie Radio Christian Culture',
        authorAvatar: 'lumina_icon.jpg',
        authorRole: '📻 Oficjalny Głos Ewangelizacyjny',
        channelTitle: 'Polskie Radio Christian Culture',
        badge: '📻 EMISJA RADIOWA • GŁOS EWANGELIZACYJNY',
        showTitle: 'Polskie Radio Christian Culture • Pasmo Dnia & Muzyka Chwały',
        description: 'Całodobowy strumień radiowy z najpiękniejszą muzyką chrześcijańską, Biblią Audio i codziennymi rozważaniami.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'index.html',
        category: 'Radio CC',
        icon: 'fa-radio',
        accentColor: '#06b6d4'
    },
    'andrzej_thiel': {
        channelId: 'studium_live',
        authorName: 'Andrzej Thiel',
        authorAvatar: 'avatar_andrzej_thiel.jpg',
        authorRole: '📖 Nauczyciel Słowa Bożego',
        channelTitle: 'Studium Telewizyjne Pisma Świętego',
        badge: '📖 EMISJA NA ŻYWO • WYKŁAD BIBLIJNY',
        showTitle: 'Studium Telewizyjne Pisma Świętego — 572 Odcinki Werset po Wersecie',
        description: 'Wyczerpujący telewizyjny wykład całej Biblii. Systematyczne studium werset po wersecie z Andrzejem Thielem.',
        streamUrl: 'studium-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'studium-live.html',
        category: 'Studium Biblijne',
        icon: 'fa-book-bible',
        accentColor: '#10b981'
    },
    'osobowosc_plus': {
        channelId: 'kino_live',
        authorName: 'Studio Dobrego Słowa / Osobowość Plus',
        authorAvatar: 'avatar_osobowoscplus.jpg',
        authorRole: '🎬 Relacje i Wzrost w Bogu',
        channelTitle: 'Chrześcijański Blok Filmowy & Świadectwa',
        badge: '🎬 EMISJA NA ŻYWO • KINO & RELACJE',
        showTitle: 'Chrześcijański Blok Filmowy • Wzrost Osobisty w Chrystusie',
        description: 'Inspirujące filmy, świadectwa i wykłady psychologiczno-duchowe o budowaniu zdrowych relacji i dojrzałości w Bogu.',
        streamUrl: 'kino-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'kino-live.html',
        category: 'Filmy & Relacje',
        icon: 'fa-film',
        accentColor: '#a855f7'
    },
    'noemi_misja': {
        channelId: 'swiadectwa_live',
        authorName: 'Noemi',
        authorAvatar: 'avatar_noemi.jpg',
        authorRole: '🌿 Ewangelizacja i Świadectwa',
        channelTitle: 'Świadectwa Wiary & Zjednoczeni za Polskę',
        badge: '🌿 EMISJA NA ŻYWO • ŚWIADECTWA ŁASKI',
        showTitle: 'Świadectwa Wiary • Niezwykłe Dzieła Boga w Życiu Ludzi',
        description: 'Poruszające świadectwa ludzi, których życie zmienił Jezus Chrystus. Modlitwa wstawiennicza za Polskę i rodziny.',
        streamUrl: 'swiadectwa-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'swiadectwa-live.html',
        category: 'Świadectwa',
        icon: 'fa-hands-praying',
        accentColor: '#34d399'
    },
    'dawid_misja': {
        channelId: 'codzienne_uwielbienie',
        authorName: 'Dawid',
        authorAvatar: 'avatar_dawid.jpg',
        authorRole: '🎵 Uwielbienie i Świadectwa',
        channelTitle: 'Codzienne Uwielbienie • Pasmo Muzyczne',
        badge: '🎵 EMISJA NA ŻYWO • 538 UTWORÓW CHWAŁY',
        showTitle: 'Codzienne Uwielbienie • Pasmo Pieśni Chwały i Dziękczynienia',
        description: 'Wielka biblioteka 538 najpiękniejszych utworów uwielbienia. Codzienna rotacja bez powtórzeń i nieustanna modlitwa śpiewem.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'codzienne-uwielbienie-live.html',
        category: 'Muzyka Uwielbienia',
        icon: 'fa-music',
        accentColor: '#fbbf24'
    }
};

export function getMissionBroadcastChannel(authorSlug, authorName) {
    const s = (authorSlug || '').toLowerCase();
    const n = (authorName || '').toLowerCase();

    // Andrzej Hamera is a community profile, not the Andrzej Thiel mission
    // channel. Keep the generic "andrzej" fallback from misrouting him.
    if (s.includes('hamera') || n.includes('hamera')) return null;

    if (s.includes('cezary') || n.includes('cezary')) return MISSION_BROADCAST_CHANNELS['cezary_rogowski'];
    if (s.includes('wioletta') || n.includes('wioletta')) return MISSION_BROADCAST_CHANNELS['wioletta_rogowska'];
    if (s.includes('women') || n.includes('women') || s.includes('kobiety')) return MISSION_BROADCAST_CHANNELS['cc_women'];
    if (s.includes('men') || s.includes('ccmen') || n.includes('mężczyźni')) return MISSION_BROADCAST_CHANNELS['cc_men'];
    if (s.includes('cctv') || s.includes('tv') || n.includes('telewizja')) return MISSION_BROADCAST_CHANNELS['cc_tv'];
    if (s.includes('radio') || n.includes('radio')) return MISSION_BROADCAST_CHANNELS['radio_cc'];
    if (s.includes('thiel') || s.includes('andrzej') || n.includes('thiel')) return MISSION_BROADCAST_CHANNELS['andrzej_thiel'];
    if (s.includes('osobowosc') || s.includes('slowa') || n.includes('osobowość')) return MISSION_BROADCAST_CHANNELS['osobowosc_plus'];
    if (s.includes('noemi') || n.includes('noemi')) return MISSION_BROADCAST_CHANNELS['noemi_misja'];
    if (s.includes('dawid') || n.includes('dawid')) return MISSION_BROADCAST_CHANNELS['dawid_misja'];

    return null;
}

// ── Aggregated Posts Getter for Specific Profile / Author ──
export function getAuthorPosts(authorSlug, authorName) {
    const cleanSlug = (authorSlug || '').toLowerCase();
    const cleanName = (authorName || '').toLowerCase();

    const collected = [];
    const seenIds = new Set();
    const seenTexts = new Set();
    const isHameraProfile = cleanSlug.includes('hamera') || cleanName.includes('hamera');

    function addIfMatch(p) {
        if (!p || (!p.text && !p.image && !p.gdrive && !p.gdriveEmbed && !p.video && !p.videoUrl && !p.youtubeUrl)) return;
        const pSlug = (p.authorSlug || p.authorId || '').toLowerCase();
        const pAuthor = (p.author || p.authorName || '').toLowerCase();

        // Profile Hamery must never display content belonging to Andrzej Thiel.
        // This also protects against stale local/cloud caches containing an
        // incorrect authorSlug or author name after an earlier migration.
        const searchablePostText = [
            pSlug,
            pAuthor,
            p.title,
            p.text,
            p.description,
            p.linkPreview?.title,
            p.linkPreview?.description
        ].filter(Boolean).join(' ').toLowerCase();
        const isThielPost = searchablePostText.includes('thiel');
        if (isHameraProfile && isThielPost) return;

        let isMatch = false;
        if (cleanSlug) {
            if (pSlug === cleanSlug || pSlug.includes(cleanSlug) || cleanSlug.includes(pSlug)) isMatch = true;
            if (cleanSlug.includes('cezary') && (pAuthor.includes('cezary') || pSlug.includes('cezary'))) isMatch = true;
            if (cleanSlug.includes('wioletta') && (pAuthor.includes('wioletta') || pSlug.includes('wioletta'))) isMatch = true;
            if ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) && (pAuthor.includes('women') || pSlug.includes('women'))) isMatch = true;
            if ((cleanSlug.includes('men') || cleanSlug.includes('ccmen')) && (pAuthor.includes('men') || pSlug.includes('men'))) isMatch = true;
            if (cleanSlug.includes('thiel') && (pAuthor.includes('thiel') || pSlug.includes('thiel'))) isMatch = true;
            if (cleanSlug.includes('hamera') && (pAuthor.includes('hamera') || pSlug.includes('hamera'))) isMatch = true;
        }
        if (cleanName && (pAuthor.includes(cleanName) || cleanName.includes(pAuthor))) {
            if (!isHameraProfile || (!pAuthor.includes('thiel') && !pSlug.includes('thiel'))) {
                isMatch = true;
            }
        }

        if (isMatch) {
            if (isHameraProfile) {
                if (!p.authorAvatar || p.authorAvatar.includes('thiel') || p.authorAvatar.includes('lumina_icon')) {
                    p.authorAvatar = 'avatar_andrzej_hamera.jpg';
                }
                if (!p.author || p.author.includes('Thiel')) {
                    p.author = 'Andrzej Hamera';
                }
                p.authorSlug = 'andrzejhamera';
            }
            const key = p.id || ((p.text || '') + '_' + (p.image || '') + '_' + (p.createdAtTimestamp || ''));
            if (!seenIds.has(key)) {
                seenIds.add(key);
                collected.push(p);
            }
        }
    }

    // A. From Local Profile storage
    try {
        const rawProfile = localStorage.getItem(`lumina_profile_${authorSlug}`) || 
                           (cleanSlug.includes('cezary') ? (localStorage.getItem('lumina_profile_cezaryrgowski') || localStorage.getItem('lumina_main_user_profile') || localStorage.getItem('lumina_current_user_profile')) : null) ||
                           (cleanSlug.includes('wioletta') ? (localStorage.getItem('lumina_profile_wiolettarogowska') || localStorage.getItem('lumina_current_user_profile')) : null) ||
                           ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) ? localStorage.getItem('lumina_profile_u_ccwomen_9055') : null) ||
                           ((cleanSlug.includes('men') || cleanSlug.includes('ccmen')) ? localStorage.getItem('lumina_profile_u_ccmen_8841') : null) ||
                           (cleanSlug.includes('thiel') ? localStorage.getItem('lumina_profile_andrzejthiel') : null);
        if (rawProfile) {
            const pObj = JSON.parse(rawProfile);
            if (Array.isArray(pObj.posts)) pObj.posts.forEach(addIfMatch);
        }
    } catch(e) {}

    // B. From Cloud Posts Cache
    try {
        const rawCloud = localStorage.getItem('lumina_cloud_posts_cache');
        if (rawCloud) {
            const cList = JSON.parse(rawCloud);
            if (Array.isArray(cList)) cList.forEach(addIfMatch);
        }
    } catch(e) {}

    // C. From Campaigns Cache
    try {
        const rawCamp = localStorage.getItem('lumina_cc_campaigns');
        if (rawCamp) {
            const campList = JSON.parse(rawCamp);
            if (Array.isArray(campList)) campList.forEach(addIfMatch);
        }
    } catch(e) {}

    // D. From in-memory cloud feed
    if (typeof window !== 'undefined' && window.cloudFeedPosts && Array.isArray(window.cloudFeedPosts)) {
        window.cloudFeedPosts.forEach(addIfMatch);
    }

    // D2. From Central Immutable Community Posts (LUMINA_CORE_POSTS_DATA)
    try {
        const corePosts = (typeof LUMINA_CORE_POSTS_DATA !== 'undefined' && Array.isArray(LUMINA_CORE_POSTS_DATA))
            ? LUMINA_CORE_POSTS_DATA
            : (typeof window !== 'undefined' && Array.isArray(window.LUMINA_CORE_POSTS_DATA) ? window.LUMINA_CORE_POSTS_DATA : (typeof window !== 'undefined' && window.getSafeCommunityPosts ? window.getSafeCommunityPosts() : null));
        if (corePosts && Array.isArray(corePosts)) {
            corePosts.forEach(addIfMatch);
        }
    } catch(e) {}

    // Canonical replacement for the unrelated legacy post on Hamera's profile.
    // Inject it after all sources so stale cache entries cannot suppress it.
    if (isHameraProfile && !collected.some((p) => String(p.youtubeUrl || '').includes('Hf3h8guGxkc'))) {
        collected.push({
            id: 'post_ah_film_hf3h8guGxkc',
            author: 'Andrzej Hamera',
            authorSlug: 'andrzejhamera',
            authorAvatar: 'avatar_andrzej_hamera.jpg',
            authorRole: 'Właściciel KONCEPT – Studio Mebli Kuchennych na Wymiar 🪚',
            time: 'Polecany materiał • 🎥 YouTube',
            title: 'KONCEPT – Studio Mebli Kuchennych na Wymiar',
            text: 'Poznaj film prezentujący studio mebli kuchennych na wymiar KONCEPT.',
            youtubeUrl: 'https://youtu.be/Hf3h8guGxkc',
            likes: 0,
            amen: 0,
            createdAtTimestamp: Date.now()
        });
    }

    // E. Dynamic Living Mission Broadcast Channel Autostart Post
    const missionCh = getMissionBroadcastChannel(authorSlug, authorName);
    if (missionCh) {
        const liveBroadcastPost = {
            id: `post_live_${missionCh.channelId}`,
            author: missionCh.authorName,
            authorAvatar: missionCh.authorAvatar,
            authorRole: missionCh.authorRole,
            authorSlug: authorSlug || missionCh.channelId,
            time: missionCh.badge,
            isLiveBroadcastPost: true,
            streamUrl: missionCh.streamUrl,
            fullPageUrl: missionCh.fullPageUrl,
            channelTitle: missionCh.channelTitle,
            showTitle: missionCh.showTitle,
            description: missionCh.description,
            badge: missionCh.badge,
            accentColor: missionCh.accentColor,
            text: `${missionCh.showTitle}\n\n${missionCh.description}`,
            likes: 248,
            amen: 215,
            isPinned: true,
            createdAtTimestamp: Date.now() + 1000000000 // Always stay at top!
        };
        collected.unshift(liveBroadcastPost);
    }

    // Sort newest first
    return collected.sort((a, b) => {
        const tA = a.createdAtTimestamp ? (typeof a.createdAtTimestamp === 'number' ? a.createdAtTimestamp : a.createdAtTimestamp.seconds * 1000) : 0;
        const tB = b.createdAtTimestamp ? (typeof b.createdAtTimestamp === 'number' ? b.createdAtTimestamp : b.createdAtTimestamp.seconds * 1000) : 0;
        return tB - tA;
    });
}

// ══════════════════════════════════════════════════════════════════════════
// 3B. MISSION ACCOUNTS & MULTI-PERSONA ENGINE (Dowódca, Żona, Misje, AI)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_ACCOUNTS = {
    'cezary_rogowski': {
        id: 'cezary_rogowski',
        name: 'Cezary Rogowski',
        role: '👑 Założyciel Christian Culture',
        avatar: 'avatar_cezary_official.jpg',
        slug: 'cezaryrgowski',
        profileUrl: 'lumina.cezaryrgowski.html',
        badge: '👑 Założyciel CC',
        isMissionAccount: true
    },
    'wioletta_rogowska': {
        id: 'wioletta_rogowska',
        name: 'Wioletta Rogowska',
        role: '🌸 Współzałożycielka Christian Culture',
        avatar: 'avatar_wioletta_official.jpg',
        avatarVideo: 'wioletta_rogowska_video_avatar.mp4',
        slug: 'wiolettarogowska',
        profileUrl: 'lumina.wiolettarogowska.html',
        badge: '🌸 Współzałożycielka CC',
        isMissionAccount: true
    },
    'cc_women': {
        id: 'cc_women',
        name: 'CC Women • YouTube',
        role: '🌸 Misja Kobiet Wiary',
        avatar: 'logo_cc_women.jpg',
        slug: 'ccwomen',
        profileUrl: 'lumina.ccwomen.html',
        badge: '🌸 CC Women Official',
        isMissionAccount: true
    },
    'cc_men': {
        id: 'cc_men',
        name: 'CC Men • Wojownicy Chrystusa',
        role: '⚔️ Misja Mężczyzn Wiary',
        avatar: 'logo_cc_men.jpg',
        slug: 'ccmen',
        profileUrl: 'lumina.ccmen.html',
        badge: '⚔️ CC Men Official',
        isMissionAccount: true
    },
    'cc_tv': {
        id: 'cc_tv',
        name: 'Christian Culture TV',
        role: '📺 Telewizja CC TV24',
        avatar: 'logo_cctv.png',
        slug: 'cctv',
        profileUrl: 'lumina.cctv.html',
        badge: '📺 CCTV24 Official',
        isMissionAccount: true
    },
    'radio_cc': {
        id: 'radio_cc',
        name: 'Polskie Radio Christian Culture',
        role: '📻 Oficjalny Głos Ewangelizacyjny',
        avatar: 'lumina_icon.jpg',
        slug: 'radio_cc',
        profileUrl: 'index.html',
        badge: '📻 Radio CC',
        isMissionAccount: true
    },
    'andrzej_thiel': {
        id: 'andrzej_thiel',
        name: 'Andrzej Thiel',
        role: '📖 Nauczyciel Słowa Bożego',
        avatar: 'avatar_andrzej_thiel.jpg',
        slug: 'andrzejthiel',
        profileUrl: 'lumina.andrzejthiel.html',
        badge: '📖 Studium Biblijne CC',
        isMissionAccount: true
    },
    'osobowosc_plus': {
        id: 'osobowosc_plus',
        name: 'Studio Dobrego Słowa / Osobowość Plus',
        role: '🎬 Relacje i Wzrost w Bogu',
        avatar: 'avatar_osobowoscplus.jpg',
        slug: 'osobowoscplus',
        profileUrl: 'lumina.osobowoscplus.html',
        badge: '🎬 Osobowość Plus',
        isMissionAccount: true
    },
    'lumina_official': {
        id: 'lumina_official',
        name: 'LUMINA • Społeczność',
        role: '🕊️ Redakcja i Moderacja',
        avatar: 'lumina_icon.jpg',
        slug: 'lumina_official',
        profileUrl: 'lumina-tablica.html',
        badge: '🕊️ LUMINA Official',
        isMissionAccount: true
    },
    'noemi_misja': {
        id: 'noemi_misja',
        name: 'Noemi',
        role: '🌿 Ewangelizacja i Świadectwa',
        avatar: 'avatar_noemi.jpg',
        slug: 'noemi',
        profileUrl: 'lumina-profile.html?u=noemi',
        badge: '🌿 Misja CC',
        isMissionAccount: true
    },
    'dawid_misja': {
        id: 'dawid_misja',
        name: 'Dawid',
        role: '🎵 Uwielbienie i Świadectwa',
        avatar: 'avatar_dawid.jpg',
        slug: 'dawid',
        profileUrl: 'lumina-profile.html?u=dawid',
        badge: '🎵 Misja CC',
        isMissionAccount: true
    }
};

export function getMissionAccounts() {
    return Object.values(MISSION_ACCOUNTS);
}

export function getActiveMissionPersona() {
    try {
        const savedId = localStorage.getItem('lumina_active_mission_persona') || 'cezary_rogowski';
        return MISSION_ACCOUNTS[savedId] || MISSION_ACCOUNTS['cezary_rogowski'];
    } catch(e) {
        return MISSION_ACCOUNTS['cezary_rogowski'];
    }
}

export function setActiveMissionPersona(personaId) {
    if (MISSION_ACCOUNTS[personaId]) {
        try {
            localStorage.setItem('lumina_active_mission_persona', personaId);
            window.dispatchEvent(new CustomEvent('lumina-persona-changed', { detail: MISSION_ACCOUNTS[personaId] }));
        } catch(e) {}
        return MISSION_ACCOUNTS[personaId];
    }
    return null;
}

export async function publishAsMissionAccount(personaId, postData) {
    const persona = MISSION_ACCOUNTS[personaId] || getActiveMissionPersona();
    const payload = {
        ...postData,
        author: persona.name,
        authorRole: persona.role,
        avatar: persona.avatar,
        authorSlug: persona.slug,
        authorBadge: persona.badge,
        isMissionPost: true,
        personaId: persona.id,
        createdAtDateStr: new Date().toISOString()
    };
    return await addPostToCloud(payload);
}

// ══════════════════════════════════════════════════════════════════════════

// ── Dedykowany nasłuch zaproszeń na chrześcijańską kawę ☕ ──
export function subscribeToCoffeeInvites(userId, callback) {
    if (!userId || typeof callback !== 'function') return () => {};
    
    // 1. Sprawdź lokalny bufor
    try {
        const localInvites = JSON.parse(localStorage.getItem('lumina_coffee_invites') || '[]');
        const forMe = localInvites.filter(inv => inv.receiverId === userId && inv.status === 'pending_invitation');
        if (forMe.length) {
            callback(forMe[forMe.length - 1]);
        }
    } catch(e) {}

    // 2. Realtime nasłuch z chmury Firestore (bez złożonego indeksu composite)
    if (!db) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            limit(40)
        );
        return onSnapshot(chatsQuery, (snap) => {
            const list = [];
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.lastMessageText && data.lastMessageText.includes('☕') && data.lastSenderId !== userId) {
                    list.push({
                        id: docSnap.id,
                        senderId: data.lastSenderId,
                        senderName: data.lastSenderName || 'Użytkownik LUMINA',
                        senderAvatar: data.lastSenderAvatar || 'lumina_icon.jpg',
                        note: data.lastMessageText,
                        status: 'pending_invitation',
                        lastMessageTimestamp: data.lastMessageTimestamp
                    });
                }
            });

            if (list.length > 0) {
                // Posortuj najnowsze na wierzchu
                list.sort((a, b) => {
                    const getTs = (item) => {
                        if (!item || !item.lastMessageTimestamp) return 0;
                        if (typeof item.lastMessageTimestamp === 'number') return item.lastMessageTimestamp;
                        if (item.lastMessageTimestamp.seconds) return item.lastMessageTimestamp.seconds * 1000;
                        if (typeof item.lastMessageTimestamp.toDate === 'function') return item.lastMessageTimestamp.toDate().getTime();
                        return 0;
                    };
                    return getTs(b) - getTs(a);
                });
                callback(list[0]);
            }
        }, (err) => {
            console.warn('Lumina Coffee Invites listener notice:', err.message);
        });
    } catch(e) {
        return () => {};
    }
}

// ── Alias dla tworzenia i publikacji postów na Tablicy Live ──
export const createFeedPost = publishUniversalPost;

// ══════════════════════════════════════════════════════════════════════════
// 3B. ROLKI WIARY • CLOUD SHORTS ENGINE (Firestore `lumina_shorts`)
// ══════════════════════════════════════════════════════════════════════════

export async function publishCloudShort(shortData) {
    const newId = shortData.id || ('short_user_' + Date.now());
    const normalized = {
        id: newId,
        title: shortData.title || 'Rolka Wiary • Społeczność LUMINA 🕊️',
        author: shortData.author || 'Świadek Wiary',
        authorSlug: shortData.authorSlug || 'radiocc',
        authorAvatar: shortData.authorAvatar || 'lumina_icon.jpg',
        authorBadge: shortData.authorBadge || '🕊️ Świadectwo',
        videoType: shortData.videoType || 'mp4',
        videoSrc: shortData.videoSrc,
        poster: shortData.poster || 'tlo_tv_dzj.jpg',
        verseRef: shortData.verseRef || 'Pismo Święte',
        verseBook: shortData.verseBook || 'PSA',
        verseChapter: shortData.verseChapter || 1,
        verseUrl: shortData.verseUrl || 'https://polskieradio.cc/mojabiblia',
        audioTitle: shortData.audioTitle || ('Oryginalny dźwięk • ' + (shortData.author || 'Rolka Wiary')),
        description: shortData.description || (shortData.title ? shortData.title + ' 🕊️✨' : 'Rolka Wiary w Społeczności LUMINA'),
        amenCount: shortData.amenCount || 1,
        sharesCount: shortData.sharesCount || 0,
        isUserCreated: true,
        createdAtTimestamp: shortData.createdAtTimestamp || Date.now(),
        createdAtDateStr: new Date().toISOString()
    };

    // 1. Zapis natychmiastowy w pamięci podręcznej przeglądarki (localStorage)
    try {
        const stored = JSON.parse(localStorage.getItem('lumina_custom_shorts') || '[]');
        if (!stored.some(s => s.id === normalized.id)) {
            stored.unshift(normalized);
            localStorage.setItem('lumina_custom_shorts', JSON.stringify(stored));
        }
    } catch(e) {}

    // 2. Trwały zapis w globalnej chmurze Firestore (kolekcja `lumina_shorts`)
    if (db) {
        try {
            await addDoc(collection(db, 'lumina_shorts'), {
                ...normalized,
                createdAtTimestamp: serverTimestamp()
            });
            console.log('[LuminaDB] Rolka pomyślnie opublikowana w Firestore (lumina_shorts):', normalized.id);
        } catch(err) {
            console.warn('[LuminaDB] Błąd zapisu rolki w Firestore:', err.message);
        }
    }

    // 3. Emisja zdarzeń reaktywnych
    window.dispatchEvent(new CustomEvent('lumina_short_published', { detail: normalized }));
    window.dispatchEvent(new Event('storage'));

    return normalized;
}

export function subscribeToCloudShorts(onUpdate) {
    // Natychmiastowe przekazanie danych z pamięci podręcznej (Zero-Lag UI)
    try {
        const cached = localStorage.getItem('lumina_cloud_shorts_cache');
        if (cached) {
            onUpdate(JSON.parse(cached));
        } else {
            const custom = localStorage.getItem('lumina_custom_shorts');
            if (custom) onUpdate(JSON.parse(custom));
        }
    } catch(e) {}

    if (!db) return () => {};

    try {
        const shortsQuery = query(
            collection(db, 'lumina_shorts'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(shortsQuery, (snap) => {
            const cloudShorts = [];
            snap.forEach(d => {
                const data = d.data();
                cloudShorts.push({
                    id: data.id || d.id,
                    ...data,
                    firestoreDocId: d.id
                });
            });

            try {
                localStorage.setItem('lumina_cloud_shorts_cache', JSON.stringify(cloudShorts));
            } catch(e) {}

            onUpdate(cloudShorts);
        }, (err) => {
            console.warn('[LuminaDB] Błąd subskrypcji rolek Firestore:', err.message);
        });
    } catch(err) {
        console.warn('[LuminaDB] subscribeToCloudShorts błąd:', err);
        return () => {};
    }
}

export async function getCloudShorts() {
    if (!db) {
        try {
            return JSON.parse(localStorage.getItem('lumina_custom_shorts') || '[]');
        } catch(e) {
            return [];
        }
    }
    try {
        const shortsQuery = query(
            collection(db, 'lumina_shorts'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(50)
        );
        const snap = await getDocs(shortsQuery);
        const cloudShorts = [];
        snap.forEach(d => {
            const data = d.data();
            cloudShorts.push({ id: data.id || d.id, ...data, firestoreDocId: d.id });
        });
        if (cloudShorts.length > 0) {
            localStorage.setItem('lumina_cloud_shorts_cache', JSON.stringify(cloudShorts));
        }
        return cloudShorts;
    } catch(err) {
        console.warn('[LuminaDB] getCloudShorts error:', err);
        try {
            return JSON.parse(localStorage.getItem('lumina_custom_shorts') || '[]');
        } catch(e) {
            return [];
        }
    }
}


// 4. CAMPAIGNS & DIRECT MESSAGES REALTIME SYNC
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToCampaigns(onUpdate) {
    if (!db) return () => {};
    try {
        const campQuery = query(
            collection(db, 'lumina_campaigns'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(30)
        );

        return onSnapshot(campQuery, (snap) => {
            const campaigns = [];
            snap.forEach(d => campaigns.push({ id: d.id, ...d.data() }));
            onUpdate(campaigns);
        }, (err) => console.warn('Lumina Campaigns Sync error:', err));
    } catch(err) {
        return () => {};
    }
}

export async function addCampaignToCloud(campData) {
    if (!db) return null;
    try {
        const docRef = await addDoc(collection(db, 'lumina_campaigns'), {
            ...campData,
            createdAtTimestamp: serverTimestamp()
        });
        return docRef.id;
    } catch(e) {
        return null;
    }
}

export function normalizeChatUserId(idOrSlug) {
    if (!idOrSlug) return 'guest';
    const str = String(idOrSlug).trim().toLowerCase();
    
    // 1. Cezary Rogowski mappings (emails, UIDs, slugs, usernames):
    const isCezary = (str === 'cezaryrgowski' || str === 'cezary' ||
        str === 'nazirczarkes@gmail.com' || str === 'studiodees7@gmail.com' || str === 'nazirczarkes' ||
        str === '1zhaexihqzgz8nzebr0dyc7wlg93' || str === 'sectuwwrsv8pnkhsrxgyivjbajn1' || 
        str === 'u5seqt54fcnocfcxjirckowjhqc2' || str === 'u_cezary_official' || str === 'u_cezary');
    if (isCezary) return 'cezaryrgowski';
    
    // 2. Christian Culture / Radio CC mappings:
    const isCC = (str === 'radiocc' || str === 'christianculture' || str === 'radiochristianculture@gmail.com' ||
        str === 'christian culture' || str === 'lgibw6jrf0wbeln6zpqu2pfrlcx1');
    if (isCC) return 'radiocc';
    
    // 3. Wioletta Rogowska mappings:
    const isWioletta = (str === 'wiolettarogowska' || str === 'wioletta' ||
        str === 'lr7e9ism6vaablvmcrjan5lvn0j2' || str === 'j4aqs5wspawssjtj04jlqchpieg1' ||
        str.split('@')[0] === 'wioletta1240');
    if (isWioletta) return 'wiolettarogowska';
    
    // 4. Andrzej Thiel:
    if (str === 'andrzejthiel' || str === 'andrzej') return 'andrzejthiel';

    // 5. Brat Robert Łukasz Pio (wszystkie warianty: slug z bazy, slug czatu, UID auth Firebase, aliasy):
    const isRobert = (
        str === 'robertlukaszpio' || 
        str === 'robertukaszpio' || 
        str === 'u_robertukaszpio_5668' || 
        str === 'bratrobert' || 
        str === 'brat_robert' || 
        str === 'robert_lukasz_pio' || 
        str === 'robert-lukasz-pio' ||
        str === 'jidflt3g8ohgpcowmcljaz9i5d42' ||
        str === 'jIdflt3G8ohgpCoWmCLJAZ9i5d42'.toLowerCase()
    );
    if (isRobert) return 'robertlukaszpio';
    
    return str;
}

export function getChatId(userA, userB) {
    const a = normalizeChatUserId(userA);
    const b = normalizeChatUserId(userB);
    if (!a && !b) return 'guest_chat';
    if (!a) return b;
    if (!b) return a;
    return [a, b].sort().join('_');
}

const activeDirectChatListeners = new Map();
const activeDirectChatMessages = new Map();

function getDirectMessageTime(message) {
    return (message.timestamp?.seconds ? message.timestamp.seconds * 1000 : 0) || message.createdAt || 0;
}

function getDirectMessageKey(message) {
    if (message.clientMessageId) return `client:${message.clientMessageId}`;
    // Starsze wiadomości zapisywano równolegle w dwóch kolekcjach. Identyczny
    // nadawca, odbiorca, czas i treść oznaczają tę samą wiadomość, nie dwa wpisy.
    return [
        'legacy',
        message.senderAuthUid || message.senderUid || message.senderId || '',
        message.receiverAuthUid || message.receiverId || '',
        getDirectMessageTime(message),
        message.type || 'text',
        message.text || ''
    ].join('|');
}

export function subscribeToDirectMessages(chatId, onUpdate, onError) {
    if (!chatId) return () => {};
    let normalizedChatId = chatId;

    // Bezpieczna normalizacja bez niszczenia slugów z podkreślnikami (np. u_jan_1234)
    if (chatId.includes('_')) {
        const parts = chatId.split('_');
        if (parts.length === 2) {
            normalizedChatId = getChatId(parts[0], parts[1]);
        } else {
            normalizedChatId = chatId;
        }
    }

    if (!db || !normalizedChatId) return () => {};
    const authUid = currentUserState?.uid;
    if (!authUid || currentUserState.isAnonymous ||
        (typeof auth !== 'undefined' && auth?.currentUser?.uid !== authUid)) {
        let activeUnsubscribe = () => {};
        let retryUnsubscribe = () => {};
        retryUnsubscribe = onAuthChange((user) => {
            if (user?.uid && !user.isAnonymous) {
                retryUnsubscribe();
                activeUnsubscribe = subscribeToDirectMessages(normalizedChatId, onUpdate, onError);
            }
        });
        return () => {
            retryUnsubscribe();
            activeUnsubscribe();
        };
    }

    // Private history is never restored from an unscoped persistent browser cache.
    // Confirmed snapshots populate this session after authentication instead.
    try { localStorage.removeItem(`lumina_chat_${normalizedChatId}`); } catch (_) {}

    // Register active listener callback for optimistic instant rendering
    activeDirectChatListeners.set(normalizedChatId, onUpdate);

    let unsubScoped = () => {};
    let unsubDirect = () => {};
    let unsubLegacy = () => {};
    let unsubNested = () => {};
    let _stopped = false;
    let topLevelMessages = [];
    let nestedMessages = [];
    let legacyMessages = [];

    const emitMergedMessages = () => {
        if (_stopped) return;
        if (currentUserState?.uid !== authUid || currentUserState.isAnonymous ||
            (typeof auth !== 'undefined' && auth?.currentUser?.uid !== authUid)) return;
        const uniqueMessages = new Map();
        [...legacyMessages, ...nestedMessages, ...topLevelMessages].forEach(message => {
            const key = getDirectMessageKey(message);
            const existing = uniqueMessages.get(key);
            // Preferuj dokument główny, ale zachowaj pełniejsze dane z kopii zapasowej.
            uniqueMessages.set(key, existing ? { ...existing, ...message } : message);
        });
        const messages = [...uniqueMessages.values()].sort((a, b) => getDirectMessageTime(a) - getDirectMessageTime(b));
        if (typeof activeDirectChatMessages !== 'undefined') {
            activeDirectChatMessages.set(normalizedChatId, messages);
        } else if (typeof activeDirectChatListeners !== 'undefined' && activeDirectChatListeners) {
            if (!activeDirectChatListeners._messages) activeDirectChatListeners._messages = new Map();
            activeDirectChatListeners._messages.set(normalizedChatId, messages);
        }
        onUpdate(messages);
    };

    const resumeVisibleConversation = () => {
        if (_stopped) return;
        if (currentUserState?.uid !== authUid || currentUserState.isAnonymous) return;
        if (document.visibilityState !== 'visible' || !document.getElementById('directMessagesModal')?.classList.contains('open')) return;
        emitMergedMessages();
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', resumeVisibleConversation);

    // Dwa historyczne magazyny są obserwowane jako jedno źródło prawdy. Bez
    // scalenia UI przełączało się między nimi i wyświetlało duplikaty.
    // 🛡️ STRAŻNIK (czat): wcześniej pobieraliśmy 150 DOWOLNYCH wiadomości użytkownika ze WSZYSTKICH rozmów
    // (bez sortowania), a dopiero potem filtrowaliśmy po rozmowie. U aktywnych osób nowe wiadomości
    // z otwartej rozmowy mogły w ogóle nie trafić do tych 150 → „wiadomość nie dochodzi”.
    // Teraz: zapytanie zawężone do tej jednej rozmowy (wymaga indeksu participants+chatId — w firestore.indexes.json).
    // Gdy indeksu jeszcze nie ma, automatycznie wracamy do starego zapytania.
    const reportHistoryError = error => {
        if (_stopped) return;
        if (currentUserState?.uid !== authUid) return;
        if (typeof onError === 'function') onError(error);
        try { window.dispatchEvent(new CustomEvent('lumina-chat-history-error', {
            detail: { chatId: normalizedChatId, code: error?.code || 'unavailable' }
        })); } catch (_) {}
    };
    let _scopedDmFallbackStarted = false;
    const startLegacyDirectListener = () => {
        if (_scopedDmFallbackStarted || _stopped) return;
        _scopedDmFallbackStarted = true;
        try { unsubScoped(); } catch(e) {}
        unsubScoped = () => {};
        startUnscopedDirectListener();
    };
    try {
        const scopedQ = query(
            collection(db, 'lumina_direct_messages'),
            where('participants', 'array-contains', authUid),
            where('chatId', '==', normalizedChatId),
            orderBy('timestamp', 'desc'),
            limit(400)
        );
        unsubScoped = onSnapshot(scopedQ, { includeMetadataChanges: true }, (snap) => {
            if (_stopped) { try { unsubScoped(); } catch(e) {} return; }
            topLevelMessages = [];
            snap.forEach(d => {
                if (!d.metadata?.hasPendingWrites) topLevelMessages.push({ id: d.id, ...d.data() });
            });
            emitMergedMessages();
        }, (err) => {
            if (_stopped) return;
            console.warn('Lumina Direct Messages (rozmowa) — powrót do zapytania ogólnego:', err && err.code);
            if (err?.code === 'failed-precondition') startLegacyDirectListener();
            else reportHistoryError(err);
        });
        if (_stopped) { try { unsubScoped(); } catch(e) {} }
    } catch(e) { reportHistoryError(e); }

    function startUnscopedDirectListener() {
        if (_stopped) return;
        try {
            const directQ = query(
                collection(db, 'lumina_direct_messages'),
                where('participants', 'array-contains', authUid),
                orderBy('timestamp', 'desc'),
                limit(150)
            );
            unsubDirect = onSnapshot(directQ, { includeMetadataChanges: true }, (snap) => {
                if (_stopped) { try { unsubDirect(); } catch(e) {} return; }
                topLevelMessages = [];
                snap.forEach(d => {
                    if (d.metadata?.hasPendingWrites) return;
                    const message = { id: d.id, ...d.data() };
                    if (message.chatId === normalizedChatId) topLevelMessages.push(message);
                });
                emitMergedMessages();
            }, (err) => {
                if (_stopped) return;
                console.warn('Lumina Direct Messages top-level notice:', err);
                reportHistoryError(err);
                if (err?.code === 'resource-exhausted' || err?.code === 'permission-denied') return;
                // A mobile network handoff can terminate a snapshot without
                // re-establishing it. Refresh once so the open desktop chat
                // receives the phone message even after a transient disconnect.
                getDocs(directQ).then((snap) => {
                    if (_stopped) return;
                    topLevelMessages = [];
                    snap.forEach(d => {
                        if (d.metadata?.hasPendingWrites) return;
                        const message = { id: d.id, ...d.data() };
                        if (message.chatId === normalizedChatId) topLevelMessages.push(message);
                    });
                    emitMergedMessages();
                }).catch((refreshError) => console.warn('Lumina Direct Messages refresh notice:', refreshError));
            });
            if (_stopped) { try { unsubDirect(); } catch(e) {} }
        } catch(e) {}
    }

    // Historical documents may have only `users`, not `participants`.
    try {
        const legacyQ = query(
            collection(db, 'lumina_direct_messages'),
            where('users', 'array-contains', authUid),
            limit(150)
        );
        unsubLegacy = onSnapshot(legacyQ, { includeMetadataChanges: true }, (snap) => {
            if (_stopped) { try { unsubLegacy(); } catch(e) {} return; }
            legacyMessages = [];
            snap.forEach(d => {
                if (d.metadata?.hasPendingWrites) return;
                const message = { id: d.id, ...d.data() };
                if (message.chatId === normalizedChatId) legacyMessages.push(message);
            });
            emitMergedMessages();
        }, (err) => console.warn('Lumina Direct Messages legacy notice:', err));
        if (_stopped) { try { unsubLegacy(); } catch(e) {} }
    } catch(e) {}

    // Listener B: Nested subcollection (backup)
    try {
        const nestedQ = query(
            collection(db, `lumina_chats/${normalizedChatId}/messages`),
            where('participants', 'array-contains', authUid),
            limit(150)
        );
        unsubNested = onSnapshot(nestedQ, { includeMetadataChanges: true }, (snap) => {
            if (_stopped) { try { unsubNested(); } catch(e) {} return; }
            nestedMessages = [];
            snap.forEach(d => {
                if (!d.metadata?.hasPendingWrites) nestedMessages.push({ id: d.id, ...d.data() });
            });
            emitMergedMessages();
        }, () => {});
        if (_stopped) { try { unsubNested(); } catch(e) {} }
    } catch(e) {}

    let stopAuthObserver = () => {};
    const stopConversation = () => {
        if (_stopped) return;
        _stopped = true;
        try { unsubScoped(); } catch(e) {}
        try { unsubDirect(); } catch(e) {}
        try { unsubLegacy(); } catch(e) {}
        try { unsubNested(); } catch(e) {}
        unsubScoped = () => {};
        unsubDirect = () => {};
        unsubLegacy = () => {};
        unsubNested = () => {};
        stopAuthObserver();
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', resumeVisibleConversation);
        if (activeDirectChatListeners.get(normalizedChatId) === onUpdate) activeDirectChatListeners.delete(normalizedChatId);
    };
    if (typeof onAuthChange === 'function') stopAuthObserver = onAuthChange(() => {
        if (currentUserState?.uid !== authUid || currentUserState?.isAnonymous ||
            (typeof auth !== 'undefined' && auth?.currentUser?.uid !== authUid)) {
            stopConversation();
            onUpdate([]);
        }
    });
    return stopConversation;
}

// ── Prośby o rozmowę: pierwszy kontakt wymaga zgody odbiorcy ──
export function subscribeToIncomingMessageRequests(onUpdate) {
    const user = currentUserState;
    if (!db || !user?.uid || user.isAnonymous) return () => {};
    try {
        const requestQuery = query(
            collection(db, 'lumina_message_requests'),
            where('receiverAuthUid', '==', user.uid),
            limit(50)
        );
        return onSnapshot(requestQuery, snap => {
            const requests = [];
            snap.forEach(d => {
                const request = { id: d.id, ...d.data() };
                if (request.status === 'pending') requests.push(request);
            });
            requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            onUpdate(requests);
        }, err => console.warn('Lumina message requests notice:', err));
    } catch (e) {
        return () => {};
    }
}

// A point read of a missing private document is denied by participant rules.
// The fallback query scopes one conversation AND the current member; an unrelated
// document stays invisible and its create/update remains protected by the rules.
async function getMemberConversationSnapshot(collectionName, id, user) {
    if (!user?.uid || user.isAnonymous || currentUserState?.uid !== user.uid ||
        !['lumina_chats', 'lumina_message_requests'].includes(collectionName)) throw new Error('Brak aktywnej sesji rozmowy.');
    try {
        return await getDoc(doc(db, collectionName, id));
    } catch (error) {
        if (error.code !== 'permission-denied') throw error;
        const membership = collectionName === 'lumina_chats'
            ? or(where('participants', 'array-contains', user.uid), where('users', 'array-contains', user.uid))
            : or(where('senderAuthUid', '==', user.uid), where('receiverAuthUid', '==', user.uid));
        const result = await getDocs(query(collection(db, collectionName),
            where('chatId', '==', id), membership));
        if (currentUserState?.uid !== user.uid) throw new Error('Sesja rozmowy została zmieniona.');
        return result.docs.find(row => row.id === id) || { exists: () => false, data: () => undefined };
    }
}

export async function acceptMessageRequest(requestId) {
    const user = currentUserState;
    if (!db || !user?.uid || user.isAnonymous || !requestId) return false;
    try {
        const requestRef = doc(db, 'lumina_message_requests', requestId);
        const requestSnap = await getDoc(requestRef);
        const request = requestSnap.data();
        if (!requestSnap.exists() || request.receiverAuthUid !== user.uid || request.status !== 'pending') return false;
        const chatRef = doc(db, 'lumina_chats', request.chatId);
        const chatSnap = await getMemberConversationSnapshot('lumina_chats', request.chatId, user);
        if (currentUserState?.uid !== user.uid) return false;
        const batch = writeBatch(db);
        batch.set(chatRef, {
            chatId: request.chatId,
            ...(!chatSnap.exists() ? {
                participants: [request.senderAuthUid, request.receiverAuthUid],
                users: [request.senderId, request.receiverId, request.senderAuthUid, request.receiverAuthUid].filter(Boolean)
            } : {}),
            conversationState: 'accepted',
            acceptedAt: serverTimestamp(),
            acceptedBy: user.uid
        }, { merge: true });
        batch.update(requestRef, { status: 'accepted', acceptedAt: serverTimestamp(), acceptedBy: user.uid });
        await batch.commit();
        return request;
    } catch (e) {
        console.warn('Lumina accept message request notice:', e.message);
        return false;
    }
}

export async function declineMessageRequest(requestId, shouldBlock = false) {
    const user = currentUserState;
    if (!db || !user?.uid || user.isAnonymous || !requestId) return false;
    try {
        const requestRef = doc(db, 'lumina_message_requests', requestId);
        const requestSnap = await getDoc(requestRef);
        const request = requestSnap.data();
        if (!requestSnap.exists() || request.receiverAuthUid !== user.uid || request.status !== 'pending') return false;
        await updateDoc(requestRef, { status: shouldBlock ? 'blocked' : 'declined', respondedAt: serverTimestamp(), respondedBy: user.uid });
        if (shouldBlock) await blockUser(request.senderId || request.senderAuthUid);
        return true;
    } catch (e) {
        console.warn('Lumina decline message request notice:', e.message);
        return false;
    }
}

export async function sendDirectMessageToCloud(chatId, messageObj) {
    if (!db || !chatId) return null;
    const user = currentUserState;
    if (!user || user.isAnonymous || !user.uid) {
        console.warn('Lumina Direct Chat: wiadomości wymagają zalogowanego konta członka.');
        return null;
    }
    const myProfile = currentProfileState;
    const fromId = normalizeChatUserId(messageObj.senderId || (myProfile ? (myProfile.slug || myProfile.uid) : (user ? (user.slug || user.uid) : (localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest'))));
    let receiverId = messageObj.receiverId ? normalizeChatUserId(messageObj.receiverId) : null;
    
    if (!receiverId || receiverId === 'guest') {
        if (chatId) {
            if (chatId.startsWith(fromId + '_')) {
                receiverId = normalizeChatUserId(chatId.slice(fromId.length + 1));
            } else if (chatId.endsWith('_' + fromId)) {
                receiverId = normalizeChatUserId(chatId.slice(0, -(fromId.length + 1)));
            } else if (chatId.includes('_')) {
                const parts = chatId.split('_');
                if (parts.length === 2) {
                    receiverId = parts[0] === fromId ? parts[1] : parts[0];
                }
            }
        }
    }
    if (!receiverId) receiverId = 'guest';

    // The caller has already selected the persisted room. Rebuilding its ID
    // from display aliases can split a family conversation from its history.
    const normalizedChatId = String(chatId);
    const receiverProfile = messageObj.receiverUid
        ? null
        : await getProfileFromCloud(receiverId);
    let receiverAuthUid = messageObj.receiverUid || receiverProfile?.uid || null;

    // Bulletproof known recipient resolution
    if (!receiverAuthUid) {
        if (receiverId === 'robertlukaszpio' || receiverId === 'robertukaszpio' || receiverId === 'u_robertukaszpio_5668') {
            receiverAuthUid = 'jIdflt3G8ohgpCoWmCLJAZ9i5d42';
        } else if (receiverId === 'andrzejthiel') {
            receiverAuthUid = 'andrzejthiel';
        } else if (receiverId === 'zytagrzesik' || receiverId === 'u_zytagrzesik_7502') {
            receiverAuthUid = 'z3PXzHryYuP8rQiXKW4jRORTFCg2';
        } else if (receiverId === 'pawelmurawski' || receiverId === 'u_yciezywymbogiem_4231') {
            receiverAuthUid = 'NHjYeuO4nxM8fIfEJPHmi9rTQV12';
        } else if (typeof window !== 'undefined' && window.PROFILES_DB) {
            const p = window.PROFILES_DB[receiverId] || window.PROFILES_DB['u_' + receiverId] || window.PROFILES_DB[receiverId.replace(/^u_/, '')];
            if (p && p.uid) receiverAuthUid = p.uid;
        }
    }
    if (!receiverAuthUid && db && normalizedChatId) {
        try {
            const chatSnap = await getMemberConversationSnapshot('lumina_chats', normalizedChatId, user);
            const chatData = chatSnap.exists() ? chatSnap.data() : null;
            const chatParticipant = Array.isArray(chatData?.participants)
                ? chatData.participants.find(uid => uid && uid !== user.uid)
                : null;
            if (chatParticipant) receiverAuthUid = chatParticipant;
        } catch (chatLookupError) {
            console.warn('Lumina Direct Chat: nie udało się odczytać uczestnika czatu.', chatLookupError.message);
        }
    }
    if (!receiverAuthUid && db && normalizedChatId) {
        try {
            const requestSnap = await getMemberConversationSnapshot('lumina_message_requests', normalizedChatId, user);
            const requestData = requestSnap.exists() ? requestSnap.data() : null;
            if (requestData?.senderAuthUid === user.uid) {
                receiverAuthUid = requestData.receiverAuthUid || null;
            } else if (requestData?.receiverAuthUid === user.uid) {
                receiverAuthUid = requestData.senderAuthUid || null;
            }
        } catch (requestLookupError) {
            console.warn('Lumina Direct Chat: nie udało się odczytać uczestnika prośby.', requestLookupError.message);
        }
    }
    // Pancerne zabezpieczenie: każdy z każdym musi mieć możliwość pisać na czacie.
    // Jeśli odbiorca nie ma jeszcze UID w Firebase Auth, używamy jego identyfikatora/sluga.
    if (!receiverAuthUid && receiverId && receiverId !== 'guest') {
        receiverAuthUid = receiverId;
    }

    if (!receiverAuthUid || receiverAuthUid === user.uid) {
        console.warn('Lumina Direct Chat: nie można bezpiecznie ustalić odbiorcy wiadomości.', {
            receiverId,
            requestedReceiverUid: messageObj.receiverUid || null,
            profileUid: receiverProfile?.uid || null,
            chatId
        });
        return null;
    }

    const senderName = messageObj.senderName || myProfile?.name || user?.displayName || (fromId === 'radiocc' ? 'Christian Culture' : (fromId === 'cezaryrgowski' ? 'Cezary Rogowski' : (fromId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')));
    const senderAvatar = messageObj.senderAvatar || myProfile?.avatar || user?.photoURL || (fromId === 'radiocc' ? 'logo_radio_cc.jpg' : (fromId === 'cezaryrgowski' ? 'avatar_cezary_official.jpg' : (fromId === 'wiolettarogowska' ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg')));
    const senderBadge = messageObj.senderBadge || (fromId === 'radiocc' ? '🕊️ Misja CC' : (fromId === 'cezaryrgowski' ? '👑 Założyciel' : (fromId === 'wiolettarogowska' ? '🌸 Liderka CC' : '🕊️ Społeczność')));

    // Pierwsza wiadomość jest prośbą o kontakt. Istniejące, historyczne czaty
    // pozostają otwarte, aby nie przerywać dotychczasowych rozmów.
    let conversationChatExists = false;
    let adminOpensConversation = false;
    if (db) {
        try {
            const chatSnapshot = await getMemberConversationSnapshot('lumina_chats', normalizedChatId, user);
            conversationChatExists = chatSnapshot.exists();
            const requestRef = doc(db, 'lumina_message_requests', normalizedChatId);
            const requestSnapshot = await getMemberConversationSnapshot('lumina_message_requests', normalizedChatId, user);
            if (currentUserState?.uid !== user.uid) return null;
            // Administrator społeczności (Założyciel / oficjalne profile CC) posiada
            // nieograniczone możliwości pisania i nie wymaga akceptacji drugiej osoby.
            const isSenderAdmin = typeof isLuminaMasterAdmin === 'function' ? isLuminaMasterAdmin(user) : false;

            // Tylko jawnie zaakceptowana rozmowa odblokowuje wiadomości dla zwykłych użytkowników.
            let conversationAccepted = isSenderAdmin || (
                chatSnapshot.exists() && chatSnapshot.data()?.conversationState === 'accepted'
            ) || (
                requestSnapshot.exists() && requestSnapshot.data()?.status === 'accepted'
            );
            const reqData = requestSnapshot.exists() ? (requestSnapshot.data() || {}) : null;
            // Druga osoba już prosiła mnie o rozmowę: moja odpowiedź = przyjęcie prośby (bez osobnego kliknięcia).
            if (!conversationAccepted && reqData && reqData.receiverAuthUid === user.uid &&
                (reqData.status === 'pending' || reqData.status === 'declined')) {
                await updateDoc(requestRef, {
                    status: 'accepted', acceptedBy: user.uid, acceptedAt: serverTimestamp(),
                    respondedAt: serverTimestamp(), respondedBy: user.uid
                });
                conversationAccepted = true;
            }
            if (isSenderAdmin && !(reqData && reqData.status === 'accepted')) adminOpensConversation = true;
            if (!conversationAccepted) {
                const existingRequest = requestSnapshot;
                if (!existingRequest.exists()) {
                    await setDoc(requestRef, {
                        chatId: normalizedChatId,
                        senderAuthUid: user.uid,
                        receiverAuthUid,
                        participants: [user.uid, receiverAuthUid],
                        senderId: fromId,
                        receiverId,
                        senderName,
                        senderAvatar,
                        previewText: String(messageObj.text || '').slice(0, 1000),
                        status: 'pending',
                        createdAt: Date.now(),
                        createdAtTimestamp: serverTimestamp()
                    });
                    await triggerLuminaPush('request', normalizedChatId);
                    return { status: 'request_sent', requestId: normalizedChatId };
                }
                if (existingRequest.data()?.status === 'pending') {
                    // Ręczne ponowienie przez nadawcę jest przypomnieniem o tej
                    // samej prośbie, nie tworzy kolejnego wątku rozmowy.
                    await triggerLuminaPush('request', normalizedChatId);
                    return { status: 'request_pending' };
                }
                return { status: 'request_closed' };
            }
        } catch (e) {
            console.warn('Lumina message request notice:', e.message);
            return null;
        }
    }
    const clientMessageId = (globalThis.crypto?.randomUUID?.() || `${user.uid}_${Date.now()}_${Math.random().toString(36).slice(2)}`);

    const fullMsg = {
        clientMessageId,
        chatId: normalizedChatId,
        senderAuthUid: user.uid,
        receiverAuthUid,
        participants: [user.uid, receiverAuthUid],
        senderId: fromId,
        senderUid: user.uid,
        senderName: senderName,
        senderAvatar: senderAvatar,
        senderBadge: senderBadge,
        receiverId: receiverId,
        users: Array.from(new Set([fromId, receiverId, ...(user?.uid ? [user.uid] : [])].filter(Boolean))),
        text: messageObj.text || '',
        type: messageObj.type || 'text',
        ...(messageObj.imageUrl ? { imageUrl: messageObj.imageUrl } : {}),
        status: 'sent',
        isRead: false,
        readAt: null,
        readBy: [],
        readByName: null,
        delivered: false,
        deliveredAt: null,
        createdAt: Date.now(),
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
        // Message and conversation preview either commit together or both fail.
        const msgRef = doc(collection(db, 'lumina_direct_messages'));
        const batch = writeBatch(db);
        batch.set(msgRef, fullMsg);

        // Update chat room metadata with exact normalized users array (both slugs & UIDs)
        const chatUsers = Array.from(new Set([
            fromId,
            receiverId,
            ...(user?.uid ? [user.uid] : []),
            ...(myProfile?.uid ? [myProfile.uid] : []),
            ...(messageObj.receiverUid ? [messageObj.receiverUid] : [])
        ].filter(Boolean)));
        const chatParticipants = Array.from(new Set([user.uid, receiverAuthUid]));

        batch.set(doc(db, 'lumina_chats', normalizedChatId), {
            chatId: normalizedChatId,
            lastMessageText: fullMsg.text,
            lastMessageTimestamp: serverTimestamp(),
            lastSenderId: fromId,
            lastSenderName: senderName,
            lastSenderAvatar: senderAvatar,
            lastSenderBadge: senderBadge,
            lastMessageType: fullMsg.type || 'text',
            // Existing conversation identities are immutable under the rules.
            ...(!conversationChatExists ? { participants: chatParticipants, users: chatUsers } : {}),
            conversationState: 'accepted'
        }, { merge: true });
        // Administrator otwiera rozmowę: zapisujemy przyjętą prośbę, aby odbiorca mógł od razu odpowiedzieć.
        if (adminOpensConversation) {
            batch.set(doc(db, 'lumina_message_requests', normalizedChatId), {
                chatId: normalizedChatId, senderAuthUid: user.uid, receiverAuthUid,
                participants: chatParticipants, senderId: fromId, receiverId, senderName, senderAvatar,
                previewText: String(fullMsg.text || '').slice(0, 1000), status: 'accepted',
                acceptedBy: user.uid, acceptedAt: serverTimestamp(), createdAt: Date.now()
            }, { merge: true });
        }
        await batch.commit();

        // Only confirmed persistence permits push.
        // Strażnik 2026-10-18: jedna kopia wiadomości (lumina_direct_messages). Kopia zapasowa
        // lumina_chats/{id}/messages nie jest już zapisywana — starsze kopie są nadal czytane i scalane.
        await triggerLuminaPush('direct', msgRef.id);

        // Strażnik 2026-10-18: powiadomienie odbiorcy = podgląd rozmowy (lumina_chats) + push z Workera.
        // Dawny zapis do lumina_notifications był odrzucany przez reguły dla zwykłych kont (tylko admin)
        // i dublował powiadomienie u administratorów — usunięty.
        // Sposób C: Kontekstowe mikro-zaproszenie do włączenia powiadomień
        try {
            if (typeof window.showLuminaContextualPushPrompt === 'function') {
                const partnerName = (typeof window.luminaCurrentChatPartnerName !== 'undefined' && window.luminaCurrentChatPartnerName) || receiverId || 'rozmówca';
                setTimeout(() => {
                    window.showLuminaContextualPushPrompt('chat', partnerName);
                }, 1200);
            }
        } catch(promptErr) {}



        return msgRef.id;
    } catch(e) {
        console.warn('Lumina send direct message notice:', e.message);
        return null;
    }
}

// ── Oznaczanie wiadomości prywatnych jako Przeczytane (Real-time Read Receipts ✓✓) ──
const activeDirectReadReceipts = new Set();
// ── Stan „przeczytane” rozmowy synchronizowany między urządzeniami (Strażnik 2026-10-18) ──
// lumina_chats/{chatId}.readAt_<uid> = czas serwera ostatniego odczytu. localStorage pozostaje szybką kopią.
function chatTimeMs(v) {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    if (typeof v.toMillis === 'function') return v.toMillis();
    if (v.seconds) return v.seconds * 1000;
    return 0;
}
export function getChatRoomReadTime(chatId, data, extraKeys = []) {
    const uid = currentUserState?.uid;
    let local = 0;
    try {
        for (const k of [chatId, ...extraKeys].filter(Boolean)) {
            local = Math.max(local, parseInt(localStorage.getItem(`lumina_chat_read_${k}`) || '0', 10) || 0);
        }
    } catch (_) {}
    const server = uid && data ? chatTimeMs(data[`readAt_${uid}`]) : 0;
    return Math.max(local, server);
}
// Jedna definicja „nieprzeczytanej rozmowy” dla portalu, okienek LUMI i licznika na ikonie czatu.
export function isChatRoomUnread(chatId, data, myId = null) {
    if (!data) return false;
    const me = normalizeChatUserId(myId || currentProfileState?.slug || currentUserState?.uid || '');
    const sender = normalizeChatUserId(data.lastSenderId);
    if (!sender || sender === 'guest' || sender === me || data.lastSenderId === currentUserState?.uid) return false;
    const msgTime = chatTimeMs(data.lastMessageTimestamp) || chatTimeMs(data.createdAt);
    return msgTime > getChatRoomReadTime(chatId, data, [sender, data.lastSenderId]);
}
const roomReadWrites = new Map();
export function markChatRoomRead(chatId) {
    const user = currentUserState;
    if (!chatId) return;
    const now = Date.now();
    try { localStorage.setItem(`lumina_chat_read_${chatId}`, String(now)); } catch (_) {}
    if (!db || !user?.uid || user.isAnonymous) return;
    if (now - (roomReadWrites.get(chatId) || 0) < 5000) return; // bez zalewania zapisami
    roomReadWrites.set(chatId, now);
    updateDoc(doc(db, 'lumina_chats', chatId), { [`readAt_${user.uid}`]: serverTimestamp() })
        .catch(() => { /* starsze rozmowy bez zaakceptowanej prośby: zostaje kopia lokalna */ });
}

export async function markDirectMessagesAsRead(chatId, currentUserId, currentUserName, readContext) {
    const user = currentUserState;
    if (!db || !chatId || !currentUserId || !user?.uid || user.isAnonymous) return false;
    const dockContext = readContext?.surface === 'direct-dock';
    const visibleDockIds = () => {
        if (typeof document === 'undefined' || document.visibilityState !== 'visible') return [];
        const panel = Array.from(document.querySelectorAll('.ldd-root .ldd-window'))
            .find(el => el.getAttribute('data-chat-id') === chatId && el.getClientRects().length);
        if (!panel) return [];
        const requested = new Set(Array.isArray(readContext?.visibleMessageIds) ? readContext.visibleMessageIds : []);
        return Array.from(panel.querySelectorAll('.ldd-line[data-message-id]'))
            .filter(el => el.getClientRects().length && requested.has(el.getAttribute('data-message-id')))
            .map(el => el.getAttribute('data-message-id'));
    };
    if (dockContext ? !visibleDockIds().length : typeof document !== 'undefined' && (document.visibilityState !== 'visible' ||
        !document.getElementById('directMessagesModal')?.classList.contains('open') ||
        !document.getElementById('dmActiveConversationBox')?.getClientRects().length)) return false;
    const parts = chatId.split('_');
    const normalizedChatId = parts.length === 2 ? getChatId(parts[0], parts[1]) : chatId;
    const normMyId = normalizeChatUserId(currentUserId);
    const myName = currentUserName || 'Użytkownik LUMINA';
    // Rozmowa jest widoczna na ekranie — zapisz odczyt także na serwerze (inne urządzenia zgaszą licznik).
    try { if (typeof markChatRoomRead === 'function') markChatRoomRead(normalizedChatId); } catch (_) {}
    // Confirm only incoming messages actually rendered from this room's cache.
    // Never manufacture a read receipt while offline or before the server commit.
    let visibleIds;
    try {
        const cached = dockContext ? [] : JSON.parse(localStorage.getItem(`lumina_chat_${normalizedChatId}`) || '[]');
        visibleIds = dockContext ? new Set(visibleDockIds())
            : new Set(cached.filter(m => !m.isRead || m.status !== 'read').map(m => m.id).filter(Boolean));
    } catch (_) { return false; }
    if (!visibleIds.size) return true;
    const receiptKey = `${user.uid}:${normalizedChatId}`;
    if (activeDirectReadReceipts.has(receiptKey)) return false;
    activeDirectReadReceipts.add(receiptKey);
    try {
        const q = query(collection(db, 'lumina_direct_messages'),
            where('participants', 'array-contains', user.uid),
            where('chatId', '==', normalizedChatId), limit(400));
        const snap = await getDocs(q);
        if (currentUserState?.uid !== user.uid || currentUserState.isAnonymous) return false;
        if (dockContext ? !visibleDockIds().some(id => visibleIds.has(id)) : typeof document !== 'undefined' && (document.visibilityState !== 'visible' ||
            !document.getElementById('directMessagesModal')?.classList.contains('open') ||
            !document.getElementById('dmActiveConversationBox')?.getClientRects().length)) return false;
        if (dockContext) visibleIds = new Set(visibleDockIds().filter(id => visibleIds.has(id)));
        const receipts = new Map();
        const batch = writeBatch(db);
        const readAt = Date.now();
        snap.forEach(d => {
            const data = d.data();
            if (!visibleIds.has(d.id) || data.receiverAuthUid !== user.uid ||
                data.senderAuthUid === user.uid || (data.isRead && data.status === 'read')) return;
            const receipt = { isRead: true, status: 'read', readAt, readByName: myName,
                readBy: Array.from(new Set([...(Array.isArray(data.readBy) ? data.readBy : []), normMyId])) };
            batch.update(doc(db, 'lumina_direct_messages', d.id), receipt);
            receipts.set(d.id, receipt);
        });
        if (!receipts.size) return true;
        await batch.commit();
        // A logout/account switch during the commit must not update the new session.
        if (currentUserState?.uid !== user.uid || currentUserState.isAnonymous) return true;
        try {
            const localKey = `lumina_chat_${normalizedChatId}`;
            const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
            const updated = cached.map(m => receipts.has(m.id) ? { ...m, ...receipts.get(m.id) } : m);
            localStorage.setItem(localKey, JSON.stringify(updated));
            localStorage.setItem(`lumina_chat_read_${normalizedChatId}`, String(readAt));
            const listener = activeDirectChatListeners.get(normalizedChatId);
            if (listener) listener(updated);
        } catch (_) { /* The server receipt remains authoritative if local cache is unavailable. */ }
        // Global unread counters belong to the room-list subscription, not this receipt.
        return true;
    } catch (err) {
        console.warn('Lumina mark direct messages as read notice:', err?.code || 'write-failed');
        return false;
    } finally {
        activeDirectReadReceipts.delete(receiptKey);
    }
}

// ── Public Community Live Chatroom 🌐🕊️ ──
let activePublicChatListener = null;
let activePublicChatMessages = [];

export function subscribeToPublicChat(onUpdate) {
    activePublicChatListener = onUpdate;
    // 1. Check local cached messages
    try {
        const cached = localStorage.getItem('lumina_public_chat_cache');
        if (cached) {
            activePublicChatMessages = JSON.parse(cached);
            onUpdate(activePublicChatMessages);
        }
    } catch(e) {}

    if (!db) return () => {};
    try {
        const publicQuery = query(
            collection(db, 'lumina_public_chat_messages'),
            // Claude 2026-10-12: 120 NAJNOWSZYCH (wcześniej 'asc' + limit = 120 najstarszych — po 120 wiadomościach
            // nowe przestałyby się pojawiać). Kolejność do wyświetlenia odwracamy poniżej.
            orderBy('timestamp', 'desc'),
            limit(120)
        );

        return onSnapshot(publicQuery, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({ ...d.data(), id: d.id }));
            msgs.reverse();
            activePublicChatMessages = msgs;
            try {
                localStorage.setItem('lumina_public_chat_cache', JSON.stringify(msgs));
            } catch(e) {}
            onUpdate(msgs);
        }, (err) => console.warn('Lumina Public Chat sync notice:', err));
    } catch(e) {
        return () => {};
    }
}

export async function sendPublicChatMessage(messageObj) {
    const user = currentUserState;
    if (!user || user.isAnonymous || !user.uid) {
        console.warn('Lumina Public Chat: publikacja wymaga zalogowanego konta członka.');
        return null;
    }
    const fromId = normalizeChatUserId(messageObj.senderId || (user ? (user.slug || user.uid) : (localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest')));
    const senderName = messageObj.senderName || currentProfileState?.name || user?.displayName || (fromId === 'radiocc' ? 'Christian Culture' : (fromId === 'cezaryrgowski' ? 'Cezary Rogowski' : (fromId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')));
    const senderAvatar = messageObj.senderAvatar || currentProfileState?.avatar || user?.photoURL || (fromId === 'radiocc' ? 'logo_radio_cc.jpg' : (fromId === 'cezaryrgowski' ? 'avatar_cezary_official.jpg' : (fromId === 'wiolettarogowska' ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg')));
    const senderBadge = messageObj.senderBadge || (fromId === 'radiocc' ? '🕊️ Misja CC' : (fromId === 'cezaryrgowski' ? '👑 Założyciel' : (fromId === 'wiolettarogowska' ? '🌸 Liderka CC' : '🕊️ Społeczność')));

    const fullMsg = {
        senderAuthUid: user.uid,
        senderId: fromId,
        senderName: senderName,
        senderAvatar: senderAvatar,
        senderBadge: senderBadge,
        text: messageObj.text || '',
        type: messageObj.type || 'text',
        ...(messageObj.imageUrl ? { imageUrl: messageObj.imageUrl } : {}),
        ...(messageObj.replyToMessageId ? {
            replyToMessageId: messageObj.replyToMessageId,
            replyToSenderName: messageObj.replyToSenderName || '',
            replyToSenderId: messageObj.replyToSenderId || '',
            replyToText: (messageObj.replyToText || '').slice(0, 300)
        } : {}),
        seenBy: [{
            id: fromId,
            name: senderName,
            time: Date.now()
        }],
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save locally immediately
    try {
        const cached = JSON.parse(localStorage.getItem('lumina_public_chat_cache') || '[]');
        cached.push({ ...fullMsg, id: 'local_' + Date.now(), timestamp: { seconds: Date.now() / 1000 } });
        localStorage.setItem('lumina_public_chat_cache', JSON.stringify(cached));
    } catch(e) {}

    if (!db) return 'local_' + Date.now();

    try {
        const msgRef = await addDoc(collection(db, 'lumina_public_chat_messages'), fullMsg);
        return msgRef.id;
    } catch(e) {
        console.warn('Lumina send public message error:', e.message);
        return null;
    }
}

export async function changeOwnPublicChatMessage(messageId, originalText, newText) {
    const user = auth?.currentUser;
    if (!db || !user?.uid || user.isAnonymous || typeof messageId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(messageId)) {
        throw new Error('public-chat-not-authorized');
    }
    const deleting = newText === null;
    const text = typeof newText === 'string' ? newText.trim() : '';
    if (!deleting && (!text || text.length > 2000)) {
        throw new Error('public-chat-invalid-text');
    }
    const ref = doc(db, 'lumina_public_chat_messages', messageId);
    await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists() || auth.currentUser?.uid !== user.uid || snapshot.data().senderAuthUid !== user.uid) {
            throw new Error('public-chat-not-authorized');
        }
        if (snapshot.data().text !== originalText) {
            throw new Error('public-chat-message-changed');
        }
        if (deleting) transaction.delete(ref);
        else transaction.update(ref, { text, editedAt: serverTimestamp() });
    });
}

// ── Oznaczanie wiadomości czatu ogólnego jako Wyświetlone (Seen / Read) ──
export async function markPublicMessagesSeen(messages, currentUser) {
    if (!db || !messages || !messages.length) return;
    const uid = currentUser?.slug || currentUser?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    const unread = messages.filter(m => {
        if (!m.id || String(m.id).startsWith('local_')) return false;
        if (m.senderId === normId) return false;
        const seenList = m.seenBy || [];
        return !seenList.some(u => (typeof u === 'string' ? u === normId : u.id === normId));
    }).slice(-10);

    if (!unread.length) return;

    try {
        const promises = unread.map(m => {
            const ref = doc(db, 'lumina_public_chat_messages', m.id);
            const currentSeen = m.seenBy || [];
            const newSeen = currentSeen.concat({
                id: normId,
                name: userName,
                time: Date.now()
            });
            return updateDoc(ref, { seenBy: newSeen }).catch(() => {});
        });
        await Promise.all(promises);
    } catch(e) {}
}

// ── Reakcje Emotikonami na Wiadomości Prywatne (1:1) 👍❤️😊🙏🔥🕊️✝️😂😮😢👏🌹 ──
export async function toggleDirectMessageReaction(chatId, messageId, emoji, currentUser) {
    if (!chatId || !messageId || !emoji) return;
    let normalizedChatId = chatId || '';
    if (chatId && chatId.includes('_')) {
        const parts = chatId.split('_');
        if (parts.length === 2 && !chatId.startsWith('u_')) {
            normalizedChatId = getChatId(parts[0], parts[1]);
        }
    }
    const uid = currentUser?.slug || currentUser?.uid || localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    const localKey = `lumina_chat_${normalizedChatId}`;

    // 1. Natychmiast zaktualizuj lokalny stan w pamięci oraz cache
    try {
        const inMem = activeDirectChatMessages.get(normalizedChatId) || [];
        let cached = [];
        try { cached = JSON.parse(localStorage.getItem(localKey) || '[]'); } catch(_) {}

        const matchFn = (m) => String(m.id) === String(messageId) || (m.timestamp?.seconds && String(m.timestamp.seconds) === String(messageId));
        const targetMsg = inMem.find(matchFn) || cached.find(matchFn);
        if (targetMsg) {
            targetMsg.reactions = targetMsg.reactions || {};
            const list = targetMsg.reactions[emoji] || [];
            const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : (u.id === normId || u.slug === normId)));
            if (existingIdx >= 0) {
                list.splice(existingIdx, 1);
            } else {
                list.push({ id: normId, name: userName });
            }
            if (list.length === 0) {
                delete targetMsg.reactions[emoji];
            } else {
                targetMsg.reactions[emoji] = list;
            }

            // Zsynchronizuj drugą kolekcję (inMem / cached)
            const otherList = inMem.includes(targetMsg) ? cached : inMem;
            const otherMsg = otherList.find(matchFn);
            if (otherMsg) otherMsg.reactions = targetMsg.reactions;

            if (cached.length) {
                try { localStorage.setItem(localKey, JSON.stringify(cached)); } catch(_) {}
            }
            const listener = activeDirectChatListeners.get(normalizedChatId);
            if (listener) listener([...(inMem.length ? inMem : cached)]);
        }
    } catch(e) {}

    if (!db) return;

    // 2. Zapisz w Firestore
    try {
        if (!String(messageId).startsWith('local_')) {
            let collectionName = 'lumina_direct_messages';
            let docSnap = await getDoc(doc(db, collectionName, messageId));
            if (!docSnap.exists()) {
                collectionName = `lumina_chats/${normalizedChatId}/messages`;
                docSnap = await getDoc(doc(db, collectionName, messageId));
            }
            if (docSnap.exists()) {
                const currentData = docSnap.data();
                const reactions = currentData.reactions || {};
                const list = reactions[emoji] || [];
                const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : (u.id === normId || u.slug === normId)));
                if (existingIdx >= 0) {
                    list.splice(existingIdx, 1);
                } else {
                    list.push({ id: normId, name: userName });
                }
                if (list.length === 0) {
                    delete reactions[emoji];
                } else {
                    reactions[emoji] = list;
                }
                await updateDoc(doc(db, collectionName, messageId), { reactions });
            }
        }
    } catch(e) {
        console.warn('Lumina direct reaction error:', e);
    }
}

// ── Reakcje Emotikonami na Wiadomości Czatu Ogólnego 👍❤️😊🙏🔥🕊️✝️😂😮😢👏🌹 ──
export async function togglePublicChatMessageReaction(messageId, emoji, currentUser) {
    if (!messageId || !emoji) return { success: false, reason: 'missing_args' };

    const user = currentUserState;
    if (!user || user.isAnonymous || !user.uid) {
        console.warn('Lumina Public Chat: reagowanie wymaga zalogowanego konta członka.');
        return { success: false, reason: 'unauthenticated' };
    }

    const uid = currentUser?.slug || currentUser?.uid || user.slug || user.uid || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || user.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    if (!db) return { success: false, reason: 'no_db' };
    if (String(messageId).startsWith('local_')) return { success: false, reason: 'local_message' };

    // P0 Zero-QA: Aktualizacja w Firestore PRZED modyfikacją pamięci, aby wyeliminować fikcyjne deklaracje/reakcje
    try {
        const docRef = doc(db, 'lumina_public_chat_messages', messageId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return { success: false, reason: 'not_found' };

        const currentData = docSnap.data();
        const reactions = { ...(currentData.reactions || {}) };
        const list = [...(reactions[emoji] || [])];
        const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : (u.id === normId || u.slug === normId)));
        if (existingIdx >= 0) {
            list.splice(existingIdx, 1);
        } else {
            list.push({ id: normId, name: userName });
        }
        if (list.length === 0) {
            delete reactions[emoji];
        } else {
            reactions[emoji] = list;
        }

        await updateDoc(docRef, { reactions });

        // Dopiero po udanym zapisie w Firestore synchronizujemy stan pamięci i cache
        const matchFn = (m) => String(m.id) === String(messageId);
        let targetMsg = activePublicChatMessages.find(matchFn);
        let cached = [];
        try {
            cached = JSON.parse(localStorage.getItem('lumina_public_chat_cache') || '[]');
            if (!targetMsg) targetMsg = cached.find(matchFn);
        } catch(e) {}

        if (targetMsg) {
            targetMsg.reactions = reactions;
        }
        if (cached && cached.length) {
            const cMsg = cached.find(matchFn);
            if (cMsg) cMsg.reactions = reactions;
            try { localStorage.setItem('lumina_public_chat_cache', JSON.stringify(cached)); } catch(e) {}
        }
        if (activePublicChatMessages && activePublicChatMessages.length) {
            const mMsg = activePublicChatMessages.find(matchFn);
            if (mMsg) mMsg.reactions = reactions;
        }

        const updatedList = activePublicChatMessages.length ? activePublicChatMessages : cached;
        if (typeof activePublicChatListener === 'function') {
            activePublicChatListener([...updatedList]);
        }

        return { success: true, reactions };
    } catch(e) {
        console.warn('Lumina public reaction error:', e);
        return { success: false, error: e.message };
    }
}

export function subscribeToUserChats(userId, onUpdate) {
    if (!db || !userId) return () => {};
    const user = currentUserState;
    const uid = user?.uid;
    if (!uid || user.isAnonymous || auth?.currentUser?.uid !== uid || auth.currentUser.isAnonymous) return () => {};
    let stopped = false;
    const isCurrentSession = () => !stopped && currentUserState?.uid === uid &&
        !currentUserState.isAnonymous && auth?.currentUser?.uid === uid && !auth.currentUser.isAnonymous;
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            or(where('participants', 'array-contains', uid), where('users', 'array-contains', uid)),
            limit(40)
        );
        const stop = onSnapshot(chatsQuery, (snap) => {
            if (!isCurrentSession()) return;
            const chats = [];
            snap.forEach(d => chats.push({ id: d.id, ...d.data() }));
            chats.sort((a, b) => {
                const getTs = (item) => {
                    if (!item || !item.lastMessageTimestamp) return 0;
                    if (typeof item.lastMessageTimestamp === 'number') return item.lastMessageTimestamp;
                    if (item.lastMessageTimestamp.seconds) return item.lastMessageTimestamp.seconds * 1000;
                    if (typeof item.lastMessageTimestamp.toDate === 'function') return item.lastMessageTimestamp.toDate().getTime();
                    return 0;
                };
                return getTs(b) - getTs(a);
            });
            onUpdate(chats);
        }, (err) => {
            if (isCurrentSession()) console.warn('Lumina User Chats listener notice:', err.message);
        });
        return () => { stopped = true; stop(); };
    } catch(e) {
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// ── PERSONALIZED PUSH & IN-APP NOTIFICATION ENGINE 🔔🕊️ ──
// ══════════════════════════════════════════════════════════════════════════

export function playNotificationChime() {
    try {
        const now = Date.now();
        // Jeden dźwięk na wiadomość: ten sam znacznik czasu respektują okienka LUMI (dock) i LUMI KIDS.
        if (window._lastLuminaChimeTime && (now - window._lastLuminaChimeTime < 4000)) {
            return; // Zabezpieczenie przed nałożeniem dźwięków (Debounce)
        }
        window._lastLuminaChimeTime = now;

        const audio = new Audio('masz-wiadomosc.mp3');
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                playSynthesizerChimeFallback();
            });
        }
    } catch(e) {
        playSynthesizerChimeFallback();
    }
}

function playSynthesizerChimeFallback() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const now = ctx.currentTime;
        
        // Gentle crystal chime fallback
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6
        gain2.gain.setValueAtTime(0.18, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.6);
    } catch(e) {}
}

export function openNotificationChat({ type, senderId, senderName, avatar, messageId } = {}) {
    const isPublic = ['public', 'public_chat', 'chat_public'].includes(type);
    const targetId = typeof senderId === 'string' ? senderId.trim() : '';
    if (!isPublic && !targetId) return false;
    const target = new URL('/lumina', window.location.origin);
    target.searchParams.set(isPublic ? 'openPublicChat' : 'openChat', isPublic ? '1' : targetId);
    if (messageId) target.searchParams.set('messageId', String(messageId));
    try {
        const guest = document.body?.classList.contains('user-is-guest');
        const nativeModal = document.getElementById('directMessagesModal');
        if (isPublic && guest && typeof window.CCGlobalChat?.open === 'function') {
            window.CCGlobalChat.open('live', 'public');
            return true;
        }
        if (isPublic && !guest && nativeModal && typeof window.openDirectMessagesModal === 'function') {
            window.CCGlobalChat?.close?.();
            window.openDirectMessagesModal('public');
            window.switchMessengerMainTab?.('public');
            return true;
        }
        if (!isPublic && !guest && nativeModal && typeof window.openChatWith === 'function') {
            window.CCGlobalChat?.close?.();
            window.openChatWith(senderName || targetId, avatar || '/lumina_icon.jpg', targetId, messageId);
            return true;
        }
    } catch (error) {
        // Preserve the exact destination when the current page's UI is unavailable.
    }
    window.location.assign(target.href);
    return true;
}

function safeChatNotificationAvatar(value) {
    try {
        const url = new URL(typeof value === 'string' ? value : '/lumina_icon.jpg', window.location.origin);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '/lumina_icon.jpg';
        return url.href;
    } catch (error) { return '/lumina_icon.jpg'; }
}

export function showInAppChatBanner({ title, body, avatar, senderName, senderId, type, messageId, force = false }) {
    if (typeof document === 'undefined') return;
    // Dyrektywa Dowódcy (2026-10-18): Baner powiadamiania wyłączony na rzecz bąbelka Lumi Direct Dock
    if (!force && typeof window !== 'undefined' && (window.LumiDirectDockController || window._lumiDirectDockInstance || window._luminaDisableChatBanner || document.querySelector('.ldd-root'))) {
        return;
    }
    let banner = document.getElementById('lumina-chat-notification-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'lumina-chat-notification-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 18px;
            right: 18px;
            transform: translateY(140%);
            width: 92%;
            max-width: 440px;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.96));
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(236, 72, 153, 0.5);
            border-radius: 20px;
            padding: 12px 16px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(236, 72, 153, 0.3);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
            opacity: 0;
            color: #fff;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            box-sizing: border-box;
        `;
        document.body.appendChild(banner);
    }

    const iconSrc = escapeHtml(safeChatNotificationAvatar(avatar));
    const tagText = ['public', 'public_chat', 'chat_public'].includes(type) ? '🌐 Czat Ogólny' : '🔒 Prywatna 1:1';
    const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));
    const safeName = escapeHtml(dispName);

    banner.innerHTML = `
        <div style="position: relative; flex-shrink: 0;">
            <img src="${iconSrc}" alt="${safeName}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #ec4899; box-shadow: 0 0 12px rgba(236,72,153,0.6); display: block;">
            <span style="position: absolute; bottom: -2px; right: -2px; width: 13px; height: 13px; background: #10b981; border-radius: 50%; border: 2px solid #0f172a;"></span>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 6px;">
                <span style="font-weight: 800; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeName}</span>
                <span style="font-size: 0.65rem; color: #f472b6; font-weight: 700; background: rgba(236,72,153,0.18); border: 1px solid rgba(236,72,153,0.35); padding: 2px 7px; border-radius: 8px; flex-shrink: 0;">${tagText}</span>
            </div>
            <div style="font-size: 0.78rem; color: #fdf4ff; font-weight: 600; margin-bottom: 2px;">
                💬 Masz wiadomość
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">
                ${escapeHtml(body || 'Kliknij, aby odczytać wiadomość...')}
            </div>
        </div>
        <div style="flex-shrink: 0; color: #ec4899; font-size: 1.1rem; padding-left: 2px;">
            <i class="fa-solid fa-chevron-right"></i>
        </div>
    `;

    banner.setAttribute('role', 'button');
    banner.tabIndex = 0;
    banner.setAttribute('aria-label', tagText + ': otwórz rozmowę');
    banner.onclick = () => {
        if (!openNotificationChat({ type, senderId, senderName: dispName, avatar, messageId })) return;
        if (window._luminaBannerTimeout) clearTimeout(window._luminaBannerTimeout);
        banner.style.transform = 'translateY(140%)';
        banner.style.opacity = '0';
    };
    banner.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            banner.click();
        }
    };

    // Smooth entry
    requestAnimationFrame(() => {
        banner.style.transform = 'translateY(0)';
        banner.style.opacity = '1';
    });

    if (window._luminaBannerTimeout) clearTimeout(window._luminaBannerTimeout);
    window._luminaBannerTimeout = setTimeout(() => {
        banner.style.transform = 'translateY(140%)';
        banner.style.opacity = '0';
    }, 7000);
}

export async function showSystemDrawerNotification({ title, body, avatar, senderName, senderId, type, image }) {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'default') {
        try {
            await Notification.requestPermission();
        } catch(e) {}
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Społeczność LUMINA'));
    const notifTitle = title || `Masz wiadomość 💌 • ${dispName}`;
    const notifBody = body || (type === 'public' ? `[Czat Ogólny] ${dispName}: Pokój Wam! 🕊️` : `${dispName}: Kliknij, aby odczytać wiadomość...`);

    // Absolute URLs for Android Drawer (like FB/YT)
    const origin = window.location.origin;
    const pathPrefix = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = origin + pathPrefix;
    const iconUrl = avatar && avatar.startsWith('http') ? avatar : baseUrl + (avatar || 'lumina_icon.jpg');
    const badgeUrl = baseUrl + 'lumina_icon.jpg';
    const imageUrl = image && image.startsWith('http') ? image : (image ? baseUrl + image : null);

    const chatTargetUrl = type === 'public' 
        ? `${baseUrl}lumina.html?openPublicChat=1` 
        : `${baseUrl}lumina.html?openChat=${encodeURIComponent(senderId || '')}`;

    const notifOptions = {
        body: notifBody,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'lumina_chat_' + (senderId || Date.now()),
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: chatTargetUrl,
            type: type || 'chat',
            senderId: senderId,
            senderName: dispName,
            avatar: iconUrl
        },
        actions: [
            { action: 'open_chat', title: '💬 Odpowiedz' }
        ]
    };

    if (imageUrl) {
        notifOptions.image = imageUrl;
    }

    try {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
                await reg.showNotification(notifTitle, notifOptions);
                return;
            }
        }
        const notif = new Notification(notifTitle, notifOptions);
        notif.onclick = function(event) {
            event.preventDefault();
            window.focus();
            if (type === 'public') {
                if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
            } else if (senderId) {
                if (typeof window.openChatWith === 'function') {
                    window.openChatWith(dispName, iconUrl, senderId);
                } else {
                    window.location.href = chatTargetUrl;
                }
            }
        };
    } catch(err) {
        console.warn('showNotification error fallback:', err);
        try {
            const notif = new Notification(notifTitle, notifOptions);
            notif.onclick = function(event) {
                event.preventDefault();
                window.focus();
                if (type === 'public') {
                    if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                    if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                } else if (senderId) {
                    if (typeof window.openChatWith === 'function') {
                        window.openChatWith(dispName, iconUrl, senderId);
                    } else {
                        window.location.href = chatTargetUrl;
                    }
                }
            };
        } catch(e) {}
    }
}

export function triggerLuminaPushNotification({ title, body, avatar, senderName, senderId, type, image }) {
    const isChatNotification = ['private', 'chat', 'public', 'direct_message', 'direct_message_request'].includes(type);
    // Private room snapshots own their counter; preserve the public-chat indicator.
    if (type === 'public') {
    // 1. Immediately bump Unread Badge on Floating Chat Button & Navigation
    try {
        const isModalOpen = document.getElementById('directMessagesModal')?.classList.contains('open') ||
                            document.getElementById('modalCcMessages')?.classList.contains('open');
        if (!isModalOpen) {
            const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
            const next = cur + 1;
            if (typeof window.updateLuminaMessagesBadge === 'function') {
                window.updateLuminaMessagesBadge(next);
            } else {
                localStorage.setItem('lumina_messages_unread_count', String(next));
                const b = document.getElementById('floatingChatBadge');
                if (b) {
                    b.style.setProperty('display', 'flex', 'important');
                    b.classList.add('visible');
                    b.setAttribute('data-visible', 'true');
                    b.textContent = next > 9 ? '9+' : String(next);
                }
            }
        }
    } catch(e) {}
    }

    // 2. Play official voice notification audio + vibration (Debounced single chime)
    playNotificationChime();
    if ('vibrate' in navigator) {
        try { navigator.vibrate([160, 80, 160]); } catch(e) {}
    }

    // 3. Systemowe powiadomienia trafiają do górnego centrum. Wiadomości
    // czatu mają jeden kanał in-app: dymek w prawym dolnym rogu.
    try {
        if (!isChatNotification && window.LuminaNotifications && typeof window.LuminaNotifications.push === 'function') {
            const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));
            const notifTargetUrl = type === 'public' 
                ? 'lumina.html?openPublicChat=1' 
                : `lumina.html?openChat=${encodeURIComponent(senderId || '')}`;
            window.LuminaNotifications.push(
                title || `💬 Nowa wiadomość: ${dispName}`,
                body || 'Wysłał(a) nową wiadomość w społeczności LUMINA',
                avatar || 'lumina_icon.jpg',
                notifTargetUrl,
                false // playSound = false, bo chime jest już odtworzony wyżej!
            );
        }
    } catch(e) {}

    // 4. In-app chat: Baner powiadomień wyłączony na polecenie Dowódcy (2026-10-18).
    // Nowe wiadomości są sygnalizowane wyłącznie dyskretnym bąbelkiem Lumi Direct Dock (chat head).
    // Legacy showInAppChatBanner nie jest już wywoływany automatycznie.

    // 5. OS drawer is useful while the page is hidden; while visible it would
    // duplicate the in-app chat bubble.
    if (!isChatNotification || document.visibilityState !== 'visible') {
        showSystemDrawerNotification({ title, body, avatar, senderName, senderId, type, image });
    }
}

let hasStartedRealtimeNotifs = false;
export function startRealtimeChatNotificationsListener() {
    if (hasStartedRealtimeNotifs || !db) return;
    hasStartedRealtimeNotifs = true;

    const sessionStartTime = Date.now() - 4000;
    const handledMessageIds = new Set();

    function getMyUserId() {
        const user = currentUserState;
        const prof = currentProfileState;
        const ownedProfile = user?.uid && prof?.uid === user.uid ? prof : null;
        const raw = ownedProfile?.slug || user?.slug || user?.uid || localStorage.getItem('lumina_guest_id') || 'guest';
        // Auth UIDs are case-sensitive; only display slugs may be normalized.
        return raw === user?.uid ? raw : normalizeChatUserId(raw);
    }

    // 1. Listen to Public Chat Realtime Notifications
    try {
        const publicQuery = query(
            collection(db, 'lumina_public_chat_messages'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        onSnapshot(publicQuery, (snap) => {
            const myId = getMyUserId();
            snap.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const docId = change.doc.id;
                    if (handledMessageIds.has(docId)) return;
                    handledMessageIds.add(docId);

                    const senderId = normalizeChatUserId(data.senderId);
                    if (senderId === myId) return;

                    const ts = data.timestamp?.seconds ? (data.timestamp.seconds * 1000) : Date.now();
                    if (ts >= sessionStartTime) {
                        triggerLuminaPushNotification({
                            title: 'Masz wiadomość',
                            body: data.text || '',
                            avatar: data.senderAvatar || 'lumina_icon.jpg',
                            senderName: data.senderName || 'Użytkownik LUMINA',
                            senderId: senderId,
                            type: 'public'
                        });
                    }
                }
            });
        }, (err) => console.warn('Public Chat notif listener notice:', err));
    } catch(e) {}

    // 2. Listen to User's Private Direct Chats Realtime Notifications & Badge Counts
    let privateSessionKey = null;
    let privateGeneration = 0;
    let privateStops = [];
    // Auth restoration/profile loading may finish after the public listener starts.
    // Queries must prove authenticated membership, never ownership by display slug.
    onAuthChange(() => {
        const user = currentUserState;
        const sdkUser = auth?.currentUser;
        const uid = user?.uid && !user.isAnonymous && sdkUser?.uid === user.uid && !sdkUser.isAnonymous
            ? user.uid : null;
        const myId = uid ? getMyUserId() : null;
        const nextKey = uid ? `${uid}\u0000${myId}` : null;
        if (nextKey === privateSessionKey) return;
        const hadPrivateSession = privateSessionKey !== null;
        privateSessionKey = nextKey;
        const generation = ++privateGeneration;
        privateStops.forEach(stop => { try { stop(); } catch(e) {} });
        privateStops = [];
        if (hadPrivateSession) {
            window._luminaUnreadRoomsMap = new Map();
            try {
                localStorage.removeItem('lumina_unread_rooms_json');
                localStorage.setItem('lumina_messages_unread_count', '0');
            } catch(e) {}
            if (typeof window.updateLuminaMessagesBadge === 'function') window.updateLuminaMessagesBadge(0);
        }
        if (!uid) return;
        const isCurrentSession = () => generation === privateGeneration &&
            currentUserState?.uid === uid && !currentUserState.isAnonymous &&
            auth?.currentUser?.uid === uid && !auth.currentUser.isAnonymous;
        const privateSessionStartTime = Date.now() - 4000;
    try {
        if (myId && myId !== 'guest') {
            const chatsQuery = query(
                collection(db, 'lumina_chats'),
                or(where('participants', 'array-contains', uid), where('users', 'array-contains', uid)),
                limit(40)
            );

            privateStops.push(onSnapshot(chatsQuery, (snap) => {
                if (!isCurrentSession()) return;
                const currentMyId = getMyUserId();
                let totalUnread = 0;
                const unreadMap = new Map();
                const unreadJson = {};

                snap.forEach(d => {
                    const data = d.data();
                    const senderId = normalizeChatUserId(data.lastSenderId);
                    const isFromMe = (senderId === currentMyId) || (data.lastSenderId === currentMyId);

                    if (!isFromMe && senderId && senderId !== 'guest') {
                        const chatId = d.id;
                        const otherUser = Array.isArray(data.users)
                            ? (data.users.find(u => u !== uid && normalizeChatUserId(u) !== currentMyId) || senderId)
                            : senderId;
                        const normOther = normalizeChatUserId(otherUser);

                        const lastReadTime = (typeof getChatRoomReadTime === 'function')
                            ? getChatRoomReadTime(chatId, data, [normOther, senderId, data.lastSenderId])
                            : Math.max(...[chatId, normOther, senderId, data.lastSenderId].map(k => parseInt(localStorage.getItem(`lumina_chat_read_${k}`) || '0', 10) || 0));
                        const msgTime = data.lastMessageTimestamp?.seconds ? (data.lastMessageTimestamp.seconds * 1000) : (data.createdAt || 0);

                        if (msgTime > lastReadTime) {
                            totalUnread++;
                            const keysToMark = new Set([normOther, senderId, data.lastSenderId, String(otherUser).toLowerCase()].filter(Boolean));
                            keysToMark.forEach(k => {
                                const prev = unreadMap.get(k) || 0;
                                unreadMap.set(k, prev + 1);
                            });
                            // Aliases are lookup keys, not additional unread conversations.
                            unreadJson[normOther] = (unreadJson[normOther] || 0) + 1;
                        }
                    }
                });

                // Rodzinne rozmowy LUMI KIDS (dziecko nie ma publicznego profilu) — lista dla okna czatu.
                try {
                    const family = [];
                    snap.forEach(d => {
                        const x = d.data();
                        if (x.kidsFamily !== true) return;
                        const other = (Array.isArray(x.participants) ? x.participants : []).find(p => p && p !== uid);
                        if (!other) return;
                        family.push({
                            chatId: d.id, uid: other,
                            name: x[`name_${other}`] || x.otherName || 'Rozmowa rodzinna · LUMI KIDS',
                            avatar: x[`avatar_${other}`] || x.otherAvatar || '/lumi-kids/assets/lumi-kids-logo.svg'
                        });
                    });
                    const famSig = JSON.stringify(family);
                    window._luminaFamilyChats = family;
                    if (famSig !== window._luminaFamilyChatsSig) {
                        window._luminaFamilyChatsSig = famSig;
                        try { window.dispatchEvent(new CustomEvent('lumina:family-chats')); } catch (_) {}
                    }
                } catch (_) {}
                window._luminaUnreadRoomsMap = unreadMap;
                try {
                    localStorage.setItem('lumina_unread_rooms_json', JSON.stringify(unreadJson));
                } catch(e) {}

                // Opening one conversation must not hide unread rooms elsewhere.
                    if (typeof window.updateLuminaMessagesBadge === 'function') {
                        window.updateLuminaMessagesBadge(totalUnread);
                    } else {
                        localStorage.setItem('lumina_messages_unread_count', String(totalUnread));
                        const b = document.getElementById('floatingChatBadge');
                        if (b) {
                            if (totalUnread > 0) {
                                b.style.setProperty('display', 'flex', 'important');
                                b.classList.add('visible');
                                b.setAttribute('data-visible', 'true');
                                b.textContent = totalUnread > 9 ? '9+' : String(totalUnread);
                            } else {
                                b.style.setProperty('display', 'none', 'important');
                                b.classList.remove('visible');
                                b.setAttribute('data-visible', 'false');
                                b.textContent = '';
                            }
                        }
                    }
                // Odśwież listę pokoi w otwartym lub gotowym oknie czatu
                if (typeof window.renderDmUsersAndConversations === 'function') {
                    try { window.renderDmUsersAndConversations(); } catch(e) {}
                }

                snap.docChanges().forEach((change) => {
                    if (change.type === 'modified' || change.type === 'added') {
                        const data = change.doc.data();
                        const senderId = normalizeChatUserId(data.lastSenderId);
                        if (!senderId || senderId === currentMyId) return;

                        const lastMsgKey = `dm_${change.doc.id}_${data.lastMessageText}_${data.lastMessageTimestamp?.seconds || ''}`;
                        if (handledMessageIds.has(lastMsgKey)) return;
                        handledMessageIds.add(lastMsgKey);

                        const ts = data.lastMessageTimestamp?.seconds ? (data.lastMessageTimestamp.seconds * 1000) : Date.now();
                        if (ts >= privateSessionStartTime) {
                            triggerLuminaPushNotification({
                                title: `Masz wiadomość od ${data.lastSenderName || 'Użytkownika'}`,
                                body: data.lastMessageText || '',
                                avatar: data.lastSenderAvatar || 'lumina_icon.jpg',
                                senderName: data.lastSenderName || 'Rozmówca',
                                senderId: senderId,
                                type: 'private'
                            });
                        }
                    }
                });
            }, (err) => { if (isCurrentSession()) console.warn('Private Chat notif listener notice:', err); }));

            // (Strażnik 2026-10-18) Nowe wiadomości nie zapisują już lumina_notifications — nasłuch zostaje tylko dla starszych wpisów.
            // 3. Listen directly to lumina_notifications collection for recipient
            try {
                const notifsQuery = query(
                    collection(db, 'lumina_notifications'),
                    where('recipientId', '==', myId),
                    orderBy('createdAt', 'desc'),
                    limit(15)
                );
                privateStops.push(onSnapshot(notifsQuery, (snap) => {
                    if (!isCurrentSession()) return;
                    snap.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            const docId = change.doc.id;
                            if (handledMessageIds.has('notif_' + docId)) return;
                            handledMessageIds.add('notif_' + docId);

                            const senderId = normalizeChatUserId(data.senderId);
                            if (senderId === myId) return;

                            const ts = data.createdAt?.seconds ? (data.createdAt.seconds * 1000) : Date.now();
                            if (ts >= privateSessionStartTime) {
                                triggerLuminaPushNotification({
                                    title: data.title || 'Masz nową wiadomość',
                                    body: data.body || '',
                                    avatar: data.senderAvatar || 'lumina_icon.jpg',
                                    senderName: data.senderName || 'Rozmówca',
                                    senderId: senderId,
                                    type: data.type === 'chat_direct' ? 'private' : (data.type || 'private')
                                });
                            }
                        }
                    });
                }, () => {}));
            } catch(e) {}
        }
    } catch(e) {}
    });
}

// Auto-start listener on load
try {
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            startRealtimeChatNotificationsListener();
        }, 1200);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'OPEN_LUMINA_CHAT') {
                    const d = event.data.chatData;
                    if (d && d.type === 'public') {
                        if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                        if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                    } else if (d) {
                        const sName = d.senderName || (d.senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (d.senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Rozmówca'));
                        if (typeof window.openChatWith === 'function') {
                            window.openChatWith(sName, d.senderAvatar || 'lumina_icon.jpg', d.senderId);
                        } else if (typeof window.openDirectMessagesModal === 'function') {
                            window.openDirectMessagesModal();
                        }
                    }
                }
            });
        }

        // Auto request permission on first user click anywhere
        const enableNotifsOnUserGesture = () => {
            if ('Notification' in window && Notification.permission === 'default') {
                requestNotificationPermission().catch(() => {});
            }
            window.removeEventListener('click', enableNotifsOnUserGesture);
            window.removeEventListener('touchstart', enableNotifsOnUserGesture);
        };
        window.addEventListener('click', enableNotifsOnUserGesture, { once: true });
        window.addEventListener('touchstart', enableNotifsOnUserGesture, { once: true });
    }
} catch(e) {}

// ══════════════════════════════════════════════════════════════════════════
// 5. MATCH & DISCOVERY ENGINE (Polubienia, Modlitwy, Wzajemne Dopasowania)
// ══════════════════════════════════════════════════════════════════════════

export async function recordProfileLike(targetIdOrSlug, targetData = {}, type = 'like') {
    const user = currentUserState;
    if (!user || user.isAnonymous || !user.uid) {
        console.warn('Lumina Match Engine: reakcje wymagają zalogowanego konta członka.');
        return { success: false, isMatch: false, type };
    }
    const fromId = user ? user.uid : 'guest_' + (localStorage.getItem('lumina_guest_id') || Math.random().toString(36).substring(2, 9));
    if (!user && !localStorage.getItem('lumina_guest_id')) {
        localStorage.setItem('lumina_guest_id', fromId);
    }

    const likeDocId = `${fromId}_${targetIdOrSlug}`;
    const reciprocalLikeDocId = `${targetIdOrSlug}_${fromId}`;

    // 1. Local Cache for instant UI state
    try {
        localStorage.setItem(`lumina_like_${targetIdOrSlug}`, 'true');
    } catch(e) {}

    let isMatch = false;

    // ── ŻELAZNA DOKTRYNA LUMINA (@L + @Joma) ──
    // Nie dopuszczamy dopasowań matrymonialnych między osobami tej samej płci.
    const myProfileForLike = currentProfileState || (function() {
        try { return JSON.parse(localStorage.getItem('lumina_my_profile') || 'null'); } catch(e) { return null; }
    })();
    const myGender = detectProfileGender(myProfileForLike || currentUserState);
    const targetGender = detectProfileGender(targetData || { slug: targetIdOrSlug, id: targetIdOrSlug });
    const isSameGender = (myGender === targetGender && myGender !== 'unknown');

    if (db) {
        try {
            // Save our like in Firestore
            await setDoc(doc(db, 'lumina_likes', likeDocId), {
                fromAuthUid: user.uid,
                from: fromId,
                to: targetIdOrSlug,
                fromName: currentProfileState?.name || user?.displayName || 'Anonimowy Użytkownik',
                fromAvatar: currentProfileState?.avatar || user?.photoURL || 'lumina_icon.jpg',
                toName: targetData.name || targetIdOrSlug,
                toAvatar: targetData.avatar || 'lumina_icon.jpg',
                type: type,
                timestamp: serverTimestamp()
            });

            // Check if reciprocal like exists — TYLKO dla osób przeciwnej płci
            if (!isSameGender) {
                const recipSnap = await getDoc(doc(db, 'lumina_likes', reciprocalLikeDocId));
                if (recipSnap.exists()) {
                    isMatch = true;
                    const matchId = [fromId, targetIdOrSlug].sort().join('_');
                    await setDoc(doc(db, 'lumina_matches', matchId), {
                        users: [fromId, targetIdOrSlug],
                        userProfiles: {
                            [fromId]: {
                                name: currentProfileState?.name || user?.displayName || 'Użytkownik',
                                avatar: currentProfileState?.avatar || user?.photoURL || 'lumina_icon.jpg'
                            },
                            [targetIdOrSlug]: {
                                name: targetData.name || targetIdOrSlug,
                                avatar: targetData.avatar || 'lumina_icon.jpg'
                            }
                        },
                        createdAt: serverTimestamp()
                    }, { merge: true });
                }
            }
        } catch(err) {
            console.warn('Lumina Match Engine notice:', err.message);
        }
    }

    // Demo / interactive simulation match trigger for key profiles — BEZWZGLĘDNIE tylko dla osób przeciwnej płci
    if (!isMatch && !isSameGender && (targetIdOrSlug === 'noemi' || targetIdOrSlug === 'tomek' || targetIdOrSlug === 'weronika' || Math.random() < 0.35)) {
        isMatch = true;
    }

    return {
        success: true,
        isMatch: isMatch,
        type: type,
        partner: {
            id: targetIdOrSlug,
            name: targetData.name || targetIdOrSlug,
            avatar: targetData.avatar || 'lumina_icon.jpg',
            city: targetData.city || 'Polska',
            verse: targetData.verse || ''
        }
    };
}

/**
 * PRAWDZIWY SYSTEM OBSERWOWANIA (zastępuje fałszywy licznik lokalny, który
 * tylko zwiększał liczbę w przeglądarce, i brakującą funkcję na 3 stronach,
 * gdzie przycisk "Obserwuj" w ogóle nie działał — rzucał błąd w konsoli).
 */
export function isUserAuthenticated() {
    if (currentUserState && currentUserState.uid) return true;
    if (currentProfileState && (currentProfileState.uid || (currentProfileState.slug && currentProfileState.slug !== 'guest' && currentProfileState.slug !== 'gosc'))) return true;
    const curUid = localStorage.getItem('lumina_user_uid');
    if (curUid && curUid.length > 5) return true;
    const curSlug = localStorage.getItem('lumina_current_user_slug');
    if (curSlug && curSlug !== 'guest' && curSlug !== 'gosc' && curSlug !== 'anonymous') return true;
    const curP = localStorage.getItem('lumina_current_user_profile');
    if (curP) {
        try {
            const p = JSON.parse(curP);
            if (p && (p.uid || (p.slug && p.slug !== 'guest' && p.slug !== 'gosc'))) return true;
        } catch(e) {}
    }
    return false;
}
window.isLuminaUserLoggedIn = isUserAuthenticated;

let pendingFollowTarget = null;

export function openLoginToFollowModal(targetSlug, targetData = {}, onSuccess = null) {
    pendingFollowTarget = { slug: targetSlug, data: targetData, onSuccess };
    
    let modal = document.getElementById('luminaLoginToFollowModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'luminaLoginToFollowModal';
        modal.className = 'lumina-follow-auth-modal-overlay';
        modal.innerHTML = `
            <div class="lumina-follow-auth-card">
                <button type="button" class="lumina-follow-modal-close" onclick="window.closeLoginToFollowModal()" aria-label="Zamknij">&times;</button>
                <div class="lumina-follow-auth-icon-wrap">
                    <div class="lumina-follow-icon-glow">
                        <i class="fa-solid fa-heart-circle-plus"></i>
                    </div>
                </div>
                <h3 class="lumina-follow-auth-title">Zaloguj się, aby obserwować</h3>
                <p class="lumina-follow-auth-desc">
                    Aby obserwować profil <strong id="luminaFollowTargetName">użytkownika</strong> i być na bieżąco z nowymi wpisami, zaloguj się do portalu LUMINA.
                </p>
                <div class="lumina-follow-auth-actions">
                    <button type="button" id="btnLuminaFollowGoogleLogin" class="btn-lumina-google-auth" onclick="window.handleFollowGoogleLogin()">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span id="btnLuminaFollowGoogleText">Zaloguj się z Google</span>
                    </button>
                    <button type="button" class="btn-lumina-register-prominent" onclick="window.closeLoginToFollowModal(); if(window.openAuth) window.openAuth('register'); else window.location.href='lumina.html#register';" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 20px; background:linear-gradient(135deg, #ec4899, #a855f7); color:#fff; font-weight:800; font-size:0.92rem; border-radius:30px; border:none; cursor:pointer; box-shadow:0 4px 16px rgba(236,72,153,0.35); font-family:inherit;">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Nie masz konta? Załóż profil w 2 minuty ✨</span>
                    </button>
                    <a href="lumina.html#login" class="btn-lumina-email-login-link" onclick="window.closeLoginToFollowModal(); if(window.openAuth) { window.openAuth('login'); return false; }">
                        Masz już konto? Zaloguj się przez e-mail
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        if (!document.getElementById('luminaFollowAuthStyles')) {
            const st = document.createElement('style');
            st.id = 'luminaFollowAuthStyles';
            st.textContent = `
                .lumina-follow-auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(7, 14, 36, 0.88);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    z-index: 10000005 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
                }
                .lumina-follow-auth-modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                }
                .lumina-follow-auth-card {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    background: linear-gradient(145deg, #0f1d42 0%, #09122c 100%);
                    border: 1px solid rgba(236, 72, 153, 0.35);
                    border-radius: 28px;
                    padding: 34px 26px 28px;
                    text-align: center;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(236,72,153,0.25);
                    transform: scale(0.92) translateY(12px);
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .lumina-follow-auth-modal-overlay.open .lumina-follow-auth-card {
                    transform: scale(1) translateY(0);
                }
                .lumina-follow-modal-close {
                    position: absolute;
                    top: 16px;
                    right: 18px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #94a3b8;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    font-size: 1.25rem;
                    line-height: 1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .lumina-follow-modal-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #fff;
                    border-color: rgba(239, 68, 68, 0.5);
                }
                .lumina-follow-auth-icon-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                .lumina-follow-icon-glow {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.05) 70%, transparent 100%);
                    border: 2px solid rgba(236, 72, 153, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem;
                    color: #ec4899;
                    box-shadow: 0 0 24px rgba(236, 72, 153, 0.4);
                    animation: pulseHeartGlow 2.5s ease-in-out infinite alternate;
                }
                @keyframes pulseHeartGlow {
                    0% { transform: scale(0.96); box-shadow: 0 0 16px rgba(236, 72, 153, 0.3); }
                    100% { transform: scale(1.04); box-shadow: 0 0 32px rgba(236, 72, 153, 0.6); }
                }
                .lumina-follow-auth-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.45rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.3px;
                }
                .lumina-follow-auth-desc {
                    font-size: 0.92rem;
                    line-height: 1.55;
                    color: #cbd5e1;
                    margin: 0 0 24px 0;
                }
                .lumina-follow-auth-desc strong {
                    color: #fce7f3;
                    font-weight: 700;
                }
                .lumina-follow-auth-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .btn-lumina-google-auth {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 13px 20px;
                    background: #ffffff;
                    color: #0f172a;
                    font-weight: 800;
                    font-size: 0.98rem;
                    border-radius: 30px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 16px rgba(255,255,255,0.2);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }
                .btn-lumina-google-auth:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3);
                    background: #f8fafc;
                }
                .btn-lumina-email-login-link {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    text-decoration: underline;
                    transition: color 0.2s;
                    margin-top: 4px;
                }
                .btn-lumina-email-login-link:hover {
                    color: #f8fafc;
                }
            `;
            document.head.appendChild(st);
        }
    }

    const nameEl = document.getElementById('luminaFollowTargetName');
    if (nameEl) {
        nameEl.textContent = targetData.name || targetSlug || 'tego profilu';
    }

    modal.classList.add('open');
}

window.closeLoginToFollowModal = function() {
    const modal = document.getElementById('luminaLoginToFollowModal');
    if (modal) modal.classList.remove('open');
};

window.openLoginToFollowModal = openLoginToFollowModal;

window.handleFollowGoogleLogin = async function() {
    const btn = document.getElementById('btnLuminaFollowGoogleLogin');
    const textEl = document.getElementById('btnLuminaFollowGoogleText');
    if (btn) btn.disabled = true;
    if (textEl) textEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logowanie...';

    try {
        const loginRes = await loginWithGoogle();
        if (loginRes && loginRes.isRedirecting) {
            return;
        }

        window.closeLoginToFollowModal();

        if (pendingFollowTarget && pendingFollowTarget.slug) {
            const targetSlug = pendingFollowTarget.slug;
            const targetData = pendingFollowTarget.data || {};
            const res = await toggleFollow(targetSlug, targetData);

            if (typeof pendingFollowTarget.onSuccess === 'function') {
                pendingFollowTarget.onSuccess(res);
            } else {
                document.querySelectorAll('.btn-action-primary, .btn-action-follow, #btnProfileFollow').forEach(b => {
                    if (b.textContent.includes('Obserwuj') || b.textContent.includes('Polub')) {
                        b.innerHTML = '<i class="fa-solid fa-check"></i> Obserwujesz';
                        b.style.background = '#10b981';
                    }
                });
                const name = targetData.name || targetSlug;
                if (typeof showToast === 'function') {
                    showToast(`✨ Witamy w LUMINA! Obserwujesz teraz ${name}.`);
                }
            }
        }
    } catch(err) {
        console.warn('[LUMINA Follow Auth] Błąd logowania z Google:', err);
        if (typeof showToast === 'function') {
            showToast('Nie udało się zalogować przez Google. Spróbuj ponownie.');
        } else {
            alert('Nie udało się zalogować przez Google. Spróbuj ponownie.');
        }
    } finally {
        if (btn) btn.disabled = false;
        if (textEl) textEl.textContent = 'Zaloguj się z Google';
    }
};

/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FOLLOW SYSTEM
 * ══════════════════════════════════════════════════════════════════════════
 */
export async function followProfile(targetSlug, targetData = {}) {
    return toggleFollow(targetSlug, targetData, 'follow');
}

export async function unfollowProfile(targetSlug, targetData = {}) {
    return toggleFollow(targetSlug, targetData, 'unfollow');
}

export async function toggleFollow(targetSlug, targetData = {}, forceAction = null) {
    if (!targetSlug) return { following: false, error: 'no-target' };

    if (!isUserAuthenticated()) {
        openLoginToFollowModal(targetSlug, targetData);
        return { following: false, requiresAuth: true };
    }

    const myId = normalizeChatUserId(
        currentProfileState?.slug || currentProfileState?.uid ||
        currentUserState?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest'
    );
    if (myId === targetSlug) return { following: false, error: 'self-follow' };

    if (!db) {
        const localNow = forceAction === 'unfollow' ? false : (forceAction === 'follow' ? true : !isFollowingLocally(targetSlug));
        try { localStorage.setItem(`lumina_following_${targetSlug}`, localNow ? '1' : '0'); } catch (e) {}
        return { following: localNow };
    }

    const followDocId = `${myId}_${targetSlug}`;
    const followRef = doc(db, 'lumina_likes', followDocId);
    let nowFollowing;

    try {
        const existing = await getDoc(followRef);
        const alreadyFollowing = existing.exists() && existing.data()?.type === 'follow';

        if (forceAction === 'follow') {
            nowFollowing = true;
            if (!alreadyFollowing) {
                await setDoc(followRef, {
                    from: myId,
                    to: targetSlug,
                    fromName: currentProfileState?.name || currentUserState?.displayName || 'Użytkownik LUMINA',
                    fromAvatar: currentProfileState?.avatar || 'lumina_icon.jpg',
                    toName: targetData.name || targetSlug,
                    toAvatar: targetData.avatar || 'lumina_icon.jpg',
                    type: 'follow',
                    timestamp: serverTimestamp(),
                });
            }
        } else if (forceAction === 'unfollow') {
            nowFollowing = false;
            if (alreadyFollowing) {
                await deleteDoc(followRef);
            }
        } else {
            // Normalne przełączanie (toggle)
            if (alreadyFollowing) {
                await deleteDoc(followRef);
                nowFollowing = false;
            } else {
                await setDoc(followRef, {
                    from: myId,
                    to: targetSlug,
                    fromName: currentProfileState?.name || currentUserState?.displayName || 'Użytkownik LUMINA',
                    fromAvatar: currentProfileState?.avatar || 'lumina_icon.jpg',
                    toName: targetData.name || targetSlug,
                    toAvatar: targetData.avatar || 'lumina_icon.jpg',
                    type: 'follow',
                    timestamp: serverTimestamp(),
                });
                nowFollowing = true;
            }
        }
    } catch (err) {
        console.warn('[LUMINA Follow] Błąd:', err.message);
        nowFollowing = forceAction === 'follow' ? true : (forceAction === 'unfollow' ? false : !isFollowingLocally(targetSlug));
    }

    try { localStorage.setItem(`lumina_following_${targetSlug}`, nowFollowing ? '1' : '0'); } catch (e) {}
    
    if (nowFollowing) {
        try {
            if (typeof window.showLuminaContextualPushPrompt === 'function') {
                const targetName = targetData.name || targetSlug;
                setTimeout(() => {
                    window.showLuminaContextualPushPrompt('follow', targetName);
                }, 1000);
            }
        } catch(promptErr) {}
    }
    return { following: nowFollowing };
}

export function isFollowingLocally(targetSlug) {
    try { return localStorage.getItem(`lumina_following_${targetSlug}`) === '1'; } catch (e) { return false; }
}

export async function syncUserFollowsFromCloud() {
    try {
        if (!db) return;
        const myId = normalizeChatUserId(
            currentProfileState?.slug || currentProfileState?.uid ||
            currentUserState?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest'
        );
        if (!myId || myId === 'guest') return;

        const q = query(collection(db, 'lumina_likes'), where('from', '==', myId), where('type', '==', 'follow'), limit(100));
        const snap = await getDocs(q);
        snap.forEach(d => {
            const data = d.data();
            if (data && data.to) {
                localStorage.setItem(`lumina_following_${data.to}`, '1');
            }
        });

        if (typeof window.enhanceCarouselCardsWithFollowButtons === 'function') {
            window.enhanceCarouselCardsWithFollowButtons();
        }
    } catch(e) {
        console.warn('[LUMINA Follow Sync] notice:', e.message);
    }
}

window.followProfile = followProfile;
window.unfollowProfile = unfollowProfile;
window.toggleFollow = toggleFollow;
window.isFollowingLocally = isFollowingLocally;
window.syncUserFollowsFromCloud = syncUserFollowsFromCloud;

window.toggleProfileFollow = async function (btn) {
    const targetSlug = (window._currentProfileSlug || document.body.dataset.profileSlug || '').toLowerCase();
    if (!targetSlug) { console.warn('[LUMINA Follow] Nie ustawiono window._currentProfileSlug na tej stronie.'); return; }

    const targetName = document.querySelector('.profile-name, #profileName, #userNameEl, .profile-title-name')?.textContent?.trim() || targetSlug;
    
    if (!isUserAuthenticated()) {
        openLoginToFollowModal(targetSlug, { name: targetName });
        return;
    }

    const result = await toggleFollow(targetSlug, { name: targetName });
    if (result.requiresAuth) return;
    if (result.error) { if (typeof showToast === 'function') showToast('Nie udało się zaktualizować obserwowania.'); return; }

    const textEl = document.getElementById('followBtnText');
    const countEl = document.getElementById('followCountBadge');
    const statCountEl = document.getElementById('statFollowersCount');
    if (textEl) textEl.textContent = result.following ? 'Obserwujesz' : 'Obserwuj';
    if (countEl) {
        const cur = parseInt(countEl.textContent || '0', 10) || 0;
        const next = Math.max(0, cur + (result.following ? 1 : -1));
        countEl.textContent = next;
        if (statCountEl) statCountEl.textContent = next;
    }
    if (typeof showToast === 'function') {
        showToast(result.following ? `Obserwujesz teraz ${targetName}! 🔔` : `Przestałeś obserwować ${targetName}.`);
    }
};

export function subscribeToUserMatches(userId, onUpdate) {
    if (!db || !userId) return () => {};
    try {
        const matchesQuery = query(
            collection(db, 'lumina_matches'),
            where('users', 'array-contains', userId)
        );
        return onSnapshot(matchesQuery, (snap) => {
            const matches = [];
            snap.forEach(d => matches.push({ id: d.id, ...d.data() }));
            onUpdate(matches);
        }, (err) => {
            console.warn('Lumina Matches listener notice:', err.message);
        });
    } catch(e) {
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 6. COMMUNITY SAFETY & MODERATION (Zgłaszanie, Blokowanie, Bezpieczeństwo)
// ══════════════════════════════════════════════════════════════════════════

export async function reportContent({ targetType, targetId, targetAuthorId, reason, details }) {
    const user = currentUserState;
    if (!user || user.isAnonymous || !user.uid) {
        console.warn('Lumina Report: zgłoszenie wymaga zalogowanego konta członka.');
        return { success: false, message: 'Zaloguj się, aby przesłać zgłoszenie do moderatorów.' };
    }
    const reporterId = user ? user.uid : (localStorage.getItem('lumina_guest_id') || 'guest');
    const reportData = {
        reporterAuthUid: user.uid,
        reporterId: reporterId,
        reporterName: currentProfileState?.name || user?.displayName || 'Anonimowy Zgłaszający',
        targetType: targetType || 'post', // 'post' | 'profile' | 'message'
        targetId: targetId || '',
        targetAuthorId: targetAuthorId || '',
        reason: reason || 'Niewłaściwa treść',
        details: details || '',
        status: 'pending',
        timestamp: serverTimestamp(),
        createdAtStr: new Date().toISOString()
    };

    if (db) {
        try {
            await addDoc(collection(db, 'lumina_reports'), reportData);
        } catch(err) {
            console.warn('Lumina Report submission notice:', err.message);
        }
    }

    return {
        success: true,
        message: 'Dziękujemy. Twoje zgłoszenie zostało przesłane do moderatorów społeczności LUMINA. Dbamy o czystość i Boży pokój na platformie! 🛡️🕊️'
    };
}

export function getBlockedUsers() {
    try {
        return JSON.parse(localStorage.getItem('lumina_blocked_users') || '[]');
    } catch(e) {
        return [];
    }
}

export function isUserBlocked(targetIdOrSlug) {
    if (!targetIdOrSlug) return false;
    const blocked = getBlockedUsers();
    return blocked.includes(targetIdOrSlug.toLowerCase());
}

export async function blockUser(targetIdOrSlug) {
    if (!targetIdOrSlug) return false;
    const normalized = targetIdOrSlug.toLowerCase();
    const blocked = getBlockedUsers();
    if (!blocked.includes(normalized)) {
        blocked.push(normalized);
        localStorage.setItem('lumina_blocked_users', JSON.stringify(blocked));
    }

    const user = currentUserState;
    if (db && user) {
        try {
            const targetProfile = await getProfileFromCloud(normalized);
            const targetKey = targetProfile?.uid || normalized;
            await setDoc(doc(db, 'lumina_user_blocks', `${user.uid}_${targetKey}`), {
                ownerUid: user.uid,
                blockerUid: user.uid,
                blockedTargetId: normalized,
                blockedTargetUid: targetProfile?.uid || null,
                timestamp: serverTimestamp()
            });
        } catch(e) {}
    }

    return true;
}

export async function unblockUser(targetIdOrSlug) {
    const user = currentUserState;
    if (!targetIdOrSlug || !db || !user?.uid || user.isAnonymous) return false;
    const normalized = String(targetIdOrSlug).toLowerCase();
    try {
        const profile = await getProfileFromCloud(normalized);
        const targetUid = profile?.uid || String(targetIdOrSlug);
        const matches = await getDocs(query(collection(db, 'lumina_user_blocks'),
            where('ownerUid', '==', user.uid), or(
                where('blockedTargetId', '==', normalized),
                where('blockedTargetUid', '==', targetUid))));
        if (currentUserState?.uid !== user.uid) return false;
        if (!matches.empty) {
            const batch = writeBatch(db);
            matches.forEach(row => batch.delete(row.ref));
            await batch.commit();
        }
        if (currentUserState?.uid !== user.uid) return false;
        const blocked = getBlockedUsers().filter(id => id !== normalized && id !== targetUid.toLowerCase());
        localStorage.setItem('lumina_blocked_users', JSON.stringify(blocked));
        return true;
    } catch (error) {
        console.warn('Lumina unblock notice:', error.message);
        return false;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 7. RICH MEDIA & SOCIAL LINKS PARSER (Etap: Clickable Links & Media Embeds)
// ══════════════════════════════════════════════════════════════════════════

export function extractYouTubeId(url) {
    if (!url) return null;
    const str = String(url).trim();
    // If iframe tag passed, extract src
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export function extractYouTubePlaylistId(url) {
    if (!url) return null;
    const str = String(url).trim();
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /[?&]list=([a-zA-Z0-9_-]+)/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export const LUMINA_HANDLES = {
    'pawel': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'pawelmurawski': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'u_yciezywymbogiem_4231': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'robert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'bratrobert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'robertlukaszpio': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'u_robertukaszpio_5668': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'magdalena': { slug: 'magdalena', name: 'Magdalena (43)', url: 'lumina.magdalena.html', avatar: 'avatar_magdalena.png', badge: '🕊️ Poznań' },
    'cezary': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrgowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrogowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'wioletta': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'wiolettarogowska': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'andrzej': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'andrzejthiel': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'thiel': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'studiodobregoslowa': { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', url: 'lumina.studiodobregoslowa.html', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
    'sds': { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', url: 'lumina.studiodobregoslowa.html', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
    'ccwomen': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'cc_women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'ccmen': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'men': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'cc_men': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'radiocc': { slug: 'radiocc', name: 'Polskie Radio CC', url: 'lumina.radiocc.html', avatar: 'logo_radio_cc.jpg', badge: '📻 Radio Uwielbienia 24/7' },
    'radio': { slug: 'radiocc', name: 'Polskie Radio CC', url: 'lumina.radiocc.html', avatar: 'logo_radio_cc.jpg', badge: '📻 Radio Uwielbienia 24/7' },
    'cctv': { slug: 'cctv', name: 'Christian Culture TV', url: 'lumina.cctv.html', avatar: 'logo_cctv.png', badge: '📺 Telewizja CCTV24' },
    'osobowoscplus': { slug: 'osobowoscplus', name: 'OSOBOWOŚĆ + • YouTube', url: 'lumina.osobowoscplus.html', avatar: 'logo_osobowosc_plus.jpg', badge: '🧠 Formacja & Wiara' },



    'jola': { slug: 'jolawojcik', name: 'Jola Wójcik', url: 'lumina.jolawojcik.html', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Społeczność LUMINA' },
    'jolawojcik': { slug: 'jolawojcik', name: 'Jola Wójcik', url: 'lumina.jolawojcik.html', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Społeczność LUMINA' },
    'zofia': { slug: 'zofiadudek', name: 'Zofia Dudek', url: 'lumina.zofiadudek.html', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Społeczność LUMINA' },
    'zofiadudek': { slug: 'zofiadudek', name: 'Zofia Dudek', url: 'lumina.zofiadudek.html', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Społeczność LUMINA' },
    'bibliaaudio': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'bibliaaudiochristianculture': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'u_bibliaaudiochristianculture_3248': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'lumina': { slug: 'lumina_official', name: 'LUMINA Społeczność', url: 'lumina-tablica.html', avatar: 'lumina_icon.jpg', badge: '🕊️ Tablica Portalu' },
    'noemi': { slug: 'noemi', name: 'Noemi', url: 'lumina-profile.html?u=noemi', avatar: 'avatar_noemi.jpg', badge: '🌿 Misja CC' },
    'dawid': { slug: 'dawid', name: 'Dawid', url: 'lumina-profile.html?u=dawid', avatar: 'avatar_dawid.jpg', badge: '🎵 Misja CC' },
    'tomek': { slug: 'tomek', name: 'Tomasz', url: 'lumina-profile.html?u=tomek', avatar: 'avatar_widget_tomek.jpg', badge: '🌲 Pasjonat Gór' }
};

export function resolveMentionHandle(handle) {
    const clean = (handle || '').toLowerCase().replace(/^[@#]/, '').trim();
    if (LUMINA_HANDLES[clean]) {
        return LUMINA_HANDLES[clean];
    }
    if (typeof window !== 'undefined' && window.LUMINA_COMMUNITY_PROFILES && window.LUMINA_COMMUNITY_PROFILES[clean]) {
        const prof = window.LUMINA_COMMUNITY_PROFILES[clean];
        return {
            slug: clean,
            name: prof.name || ('@' + clean),
            url: prof.url || `lumina-profile.html?u=${encodeURIComponent(clean)}`,
            avatar: prof.avatar || 'lumina_icon.jpg',
            badge: prof.badge || prof.tag || 'Profil LUMINA'
        };
    }
    return {
        slug: clean,
        name: '@' + clean,
        url: `lumina-profile.html?u=${encodeURIComponent(clean)}`,
        avatar: 'lumina_icon.jpg',
        badge: 'Profil LUMINA'
    };
}


// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA GOOGLE DRIVE INTEGRATION SUITE (WSZYSCY UŻYTKOWNICY) ──
// ══════════════════════════════════════════════════════════════════════════

export function parseGoogleDriveUrl(url) {
    if (!url) return null;
    let cleanUrl = String(url).trim();
    if (cleanUrl.includes('<iframe') && cleanUrl.includes('src=')) {
        const m = cleanUrl.match(/src=["']([^"']+)["']/i);
        if (m && m[1]) cleanUrl = m[1];
    }
    let fileId = null;
    let type = 'file';
    let typeLabel = 'Plik z Dysku Google';
    let icon = 'fa-brands fa-google-drive';

    // Match patterns:
    // https://drive.google.com/file/d/FILE_ID/view...
    // https://drive.google.com/file/d/FILE_ID/preview
    // https://drive.google.com/open?id=FILE_ID
    // https://docs.google.com/document/d/FILE_ID/...
    // https://docs.google.com/presentation/d/FILE_ID/...
    // https://docs.google.com/spreadsheets/d/FILE_ID/...
    // https://docs.google.com/forms/d/FILE_ID/...
    const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) || 
                      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                      cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/i);

    if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
    } else if (/^[a-zA-Z0-9_-]{20,}$/.test(cleanUrl)) {
        fileId = cleanUrl;
    }

    if (!fileId) return null;

    if (cleanUrl.includes('docs.google.com/document')) {
        type = 'document';
        typeLabel = 'Dokument Google Docs';
        icon = 'fa-solid fa-file-lines';
    } else if (cleanUrl.includes('docs.google.com/spreadsheets')) {
        type = 'spreadsheet';
        typeLabel = 'Arkusz Google Sheets';
        icon = 'fa-solid fa-table-cells';
    } else if (cleanUrl.includes('docs.google.com/presentation')) {
        type = 'presentation';
        typeLabel = 'Prezentacja Google Slides';
        icon = 'fa-solid fa-file-powerpoint';
    } else if (cleanUrl.includes('docs.google.com/forms')) {
        type = 'form';
        typeLabel = 'Formularz Google Forms';
        icon = 'fa-solid fa-square-poll-vertical';
    } else if (cleanUrl.includes('drive.google.com/drive/folders')) {
        type = 'folder';
        typeLabel = 'Katalog z Dysku Google';
        icon = 'fa-solid fa-folder-open';
    } else if (cleanUrl.match(/\.(wav|mp3|m4a|ogg|aac|flac)/i) || cleanUrl.toLowerCase().includes('audio')) {
        type = 'audio';
        typeLabel = 'Audio / Muzyka (Dysk Google)';
        icon = 'fa-solid fa-music';
    } else if (cleanUrl.match(/\.(mp4|mov|avi|mkv|webm)/i) || cleanUrl.toLowerCase().includes('video')) {
        type = 'video';
        typeLabel = 'Wideo (Dysk Google)';
        icon = 'fa-solid fa-film';
    } else if (cleanUrl.match(/\.pdf/i)) {
        type = 'pdf';
        typeLabel = 'Dokument PDF (Dysk Google)';
        icon = 'fa-solid fa-file-pdf';
    } else if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
        type = 'image';
        typeLabel = 'Grafika (Dysk Google)';
        icon = 'fa-solid fa-image';
    }

    const previewEmbedUrl = type === 'document' 
        ? `https://docs.google.com/document/d/${fileId}/preview`
        : (type === 'presentation' 
            ? `https://docs.google.com/presentation/d/${fileId}/preview`
            : (type === 'spreadsheet' 
                ? `https://docs.google.com/spreadsheets/d/${fileId}/preview`
                : (type === 'form' 
                    ? `https://docs.google.com/forms/d/${fileId}/viewform?embedded=true`
                    : (type === 'folder'
                        ? `https://drive.google.com/embeddedfolderview?id=${fileId}#grid`
                        : `https://drive.google.com/file/d/${fileId}/preview`))));

    return {
        fileId: fileId,
        type: type,
        typeLabel: typeLabel,
        icon: icon,
        directImgUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
        lh3ImgUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
        directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        previewEmbedUrl: previewEmbedUrl,
        viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
    };
}

export function createGoogleDriveEmbedHtml(gdriveData, options = {}) {
    if (!gdriveData || !gdriveData.fileId) return '';
    const isImageOnly = options.mode === 'image';
    if (isImageOnly) {
        return `
            <div class="gdrive-img-box" style="position:relative; margin-top:10px; border-radius:14px; overflow:hidden; border:1px solid rgba(52,168,83,0.3); background:#07090e;">
                <img src="${gdriveData.directImgUrl}" alt="Grafika z Dysku Google" class="post-image" loading="lazy" decoding="async" style="width:100%; height:auto; max-height:none; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='${gdriveData.lh3ImgUrl}';">
                <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.75); border:1px solid rgba(52,168,83,0.5); color:#86efac; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px; backdrop-filter:blur(8px);">
                    <i class="fa-brands fa-google-drive" style="color:#34a853;"></i> Dysk Google
                </div>
            </div>
        `;
    }

    return `
        <div class="rich-gdrive-embed" style="margin-top:12px; border-radius:16px; overflow:hidden; border:1.5px solid rgba(52,168,83,0.35); background:rgba(15,23,42,0.85); box-shadow:0 8px 24px rgba(0,0,0,0.5);">
            <div style="padding:10px 14px; background:rgba(52,168,83,0.12); border-bottom:1px solid rgba(52,168,83,0.25); display:flex; align-items:center; justify-content:space-between; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:800; color:#fff;">
                    <i class="${gdriveData.icon || 'fa-brands fa-google-drive'}" style="color:#34a853; font-size:1.15rem;"></i>
                    <span>Dysk Google • ${gdriveData.typeLabel || 'Zasób'}</span>
                </div>
                <a href="${gdriveData.viewUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:#86efac; text-decoration:none; display:flex; align-items:center; gap:5px; font-weight:700; padding:4px 10px; border-radius:12px; background:rgba(52,168,83,0.2); border:1px solid rgba(52,168,83,0.4);" onclick="event.stopPropagation()">
                    <span>Otwórz na Dysku</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i>
                </a>
            </div>
            <div style="position:relative; width:100%; aspect-ratio:16/9; min-height:240px; background:#000;">
                <iframe src="${gdriveData.previewEmbedUrl}" 
                        title="Podgląd pliku z Dysku Google" 
                        style="width:100%; height:100%; border:none; display:block;" 
                        allow="autoplay; encrypted-media; fullscreen" 
                        loading="lazy"></iframe>
            </div>
        </div>
    `;
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA RICH OPENGRAPH & STORE PRODUCT PREVIEWS ENGINE ──
// ══════════════════════════════════════════════════════════════════════════

const _luminaOgCache = new Map();

/**
 * Returns instant synchronous heuristic metadata for known Christian Culture links & external URLs
 */
export function getHeuristicLinkMetadata(url) {
    if (!url) return null;
    try {
        const rawUrl = String(url).trim();
        const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : ('https://' + rawUrl);
        const u = new URL(normalizedUrl);
        const host = u.hostname.replace(/^www\./, '').toLowerCase();
        const pathname = u.pathname;

        // 0. Kampania Wspieraj Misję Christian Culture (polskieradio.cc/wspieraj)
        if (rawUrl.includes('wspieraj') || pathname.includes('wspieraj')) {
            return {
                url: normalizedUrl,
                host: 'polskieradio.cc/wspieraj',
                domain: host,
                title: 'Wspieraj misję Christian Culture • Razem niesiemy nadzieję',
                description: 'Nie każdy może dać pieniądze. Każdy może pomóc nieść Ewangelię dalej. Wybierz swoją formę wsparcia.',
                image: 'https://polskieradio.cc/assets/cc-support/social.jpg',
                badge: '🤝 WSPIERAJ MISJĘ CC',
                ctaText: 'Wspieraj Dzieło Boże ➔',
                icon: 'fa-solid fa-hand-holding-heart'
            };
        }

        // 1. Oficjalny Sklep Christian Culture (Creator Spring / Teespring)
        if (host.includes('creator-spring.com') || host.includes('teespring.com') || pathname.includes('/listing/')) {
            let itemName = 'Kolekcja Christian Culture';
            const listingMatch = pathname.match(/\/listing\/([^/?#]+)/i);
            if (listingMatch && listingMatch[1]) {
                const rawName = decodeURIComponent(listingMatch[1]).replace(/[-_]+/g, ' ').trim();
                itemName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }

            // High-quality mockup / product image for Christian Culture store
            let img = 'https://mockup-api.teespring.com/v3/image/iZ-CubEFlReC1xHtnlIhCrSODTk/500/500.jpg';
            let desc = 'Oficjalne artykuły, kubki ceramiczne, odzież i akcesoria Christian Culture. Kupując, wspierasz rozwój dzieła ewangelizacji i mediów chrześcijańskich.';

            return {
                url: url,
                host: 'Oficjalny Sklep Christian Culture',
                domain: host,
                isStore: true,
                title: `Sklep Christian Culture • ${itemName}`,
                description: desc,
                image: img,
                badge: '🛍️ OFICJALNY SKLEP CHRISTIAN CULTURE',
                ctaText: 'Kup w Sklepie 🛒',
                icon: 'fa-solid fa-bag-shopping'
            };
        }

        // 2. Polskie Radio Christian Culture & Portale Tematyczne CCN
        if (host.includes('polskieradio.cc') || host.includes('christian-culture.web.app')) {
            let title = 'Polskie Radio Christian Culture • 24/7 Ku Bożej Chwale';
            let desc = 'Słuchaj na żywo muzyki uwielbienia, Biblii Śpiewanej, codziennych inspiracji i programów ku Bożej chwale.';
            let badge = '📻 MEDIA CHRISTIAN CULTURE';
            let ctaText = 'Słuchaj / Otwórz ✨';
            let img = 'https://polskieradio.cc/logo-glowne.png';
            let icon = 'fa-solid fa-radio';

            // A. Artykuł Flagowy: AI, SI a biblijny Antychryst
            if (pathname.includes('ai-antychryst') || pathname.includes('antychryst')) {
                title = 'AI, SI a biblijny Antychryst: Dlaczego sztuczna inteligencja nie może być Antychrystem';
                desc = 'Dlaczego sztuczna inteligencja — w świetle krytyki biblijno-historycznej, proroczej i eschatologicznej — nie może być Antychrystem. Prawidłowa hermeneutyka wymaga, aby to tekst Pisma definiował symbol, a nie współczesna technologia sposób czytania tekstu.';
                badge = '🔬 NOWE TECHNOLOGIE & SI';
                ctaText = 'Czytaj Cały Artykuł ➔';
                img = '/images/si/ai-vs-antychryst.webp';
                icon = 'fa-solid fa-microchip';
            } else if (pathname.includes('/si')) {
                title = 'CCN Nowe Technologie & Sztuczna Inteligencja • Chrześcijańska Perspektywa';
                desc = 'Rzetelne analizy teologiczne, etyczne i technologiczne w świecie dynamicznego rozwoju sztucznej inteligencji.';
                badge = '🔬 NOWE TECHNOLOGIE & SI';
                ctaText = 'Otwórz Portal SI ➔';
                img = '/images/si/ai-vs-antychryst.webp';
                icon = 'fa-solid fa-microchip';
            } else if (pathname.includes('/nauka')) {
                title = 'CCN Nauka i Wiara • Odkrycia w Świetle Pisma Świętego';
                desc = 'Fascynujące dowody naukowe, archeologia biblijna i harmonia nauki ze Słowem Bożym.';
                badge = '🔬 NAUKA & WIARA';
                ctaText = 'Otwórz Portal Nauka ➔';
                img = 'https://polskieradio.cc/images/si/si-imago-dei.webp';
                icon = 'fa-solid fa-atom';
            } else if (pathname.includes('/historia')) {
                title = 'CCN Historia i Proroctwa • Dzieje Świata w Świetle Biblii';
                desc = 'Analizy historyczne, wypełnione proroctwa i prawda o minionych wiekach.';
                badge = '📜 HISTORIA & ARCHEO';
                ctaText = 'Otwórz Portal Historia ➔';
                img = 'https://polskieradio.cc/assets/prawda-bez-filtra-scene-960.webp';
                icon = 'fa-solid fa-scroll';
            } else if (pathname.includes('/biologia')) {
                title = 'CCN Biologia i Kreacja • Niezwykły Projekt Życia';
                desc = 'Projekt w naturze, genetyka, inteligentny projekt i dowody na stworzenie.';
                badge = '🧬 BIOLOGIA & KREACJA';
                ctaText = 'Otwórz Portal Biologia ➔';
                img = 'https://polskieradio.cc/images/player/art-dna.jpg';
                icon = 'fa-solid fa-dna';
            } else if (pathname.includes('/prawo')) {
                title = 'CCN Prawo i Wolność • Boże Prawo i Wolność Sumienia';
                desc = 'Etyka, wolność religijna i Boży Dekalog we współczesnym świecie.';
                badge = '⚖️ PRAWO & ETYKA';
                ctaText = 'Otwórz Portal Prawo ➔';
                img = 'https://polskieradio.cc/assets/kod-zrodlowy-scene-960.webp';
                icon = 'fa-solid fa-scale-balanced';
            } else if (pathname.includes('/seks') || pathname.includes('relacje') || pathname.includes('malzenstwo')) {
                title = 'CCN Relacje i Małżeństwo • Czystość i Prawdziwa Miłość';
                desc = 'Biblijny fundament miłości, relacji narzeczeńskich i trwałego małżeństwa.';
                badge = '❤️ MAŁŻEŃSTWO & CZYSTOŚĆ';
                ctaText = 'Otwórz Portal Relacje ➔';
                img = 'https://polskieradio.cc/nie-bylejaki-kurs-malzenski.webp';
                icon = 'fa-solid fa-heart';
            } else if (pathname.includes('/akademia') || pathname.includes('kurscodzienny') || pathname.includes('dzien-') || url.includes('dzien-')) {
                const dayMatch = (pathname + ' ' + url).match(/dzien[_-](\d+)/i);
                if (dayMatch) {
                    const dayNum = parseInt(dayMatch[1], 10);
                    const dailyLessonsMeta = {
                        1: { title: 'Dzień 1: NA POCZĄTKU BÓG — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 1. Zanim powstał świat, zanim pojawił się grzech — był Bóg.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_01_creation.jpg' },
                        2: { title: 'Dzień 2: STWORZENI DO RELACJI Z BOGIEM — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 2. Odpoczynek, praca, bliskość i małżeństwo — Rdz 2:1–25.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_02_eden.jpg' },
                        3: { title: 'Dzień 3: GDZIE JESTEŚ? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 3. Upadek człowieka i pierwsza obietnica Ewangelii — Rdz 3:1–24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg' },
                        4: { title: 'Dzień 4: DWA SERCA, DWIE DROGI — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 4. Kain i Abel — Rdz 4:1–26.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_04_cain_abel.jpg' },
                        5: { title: 'Dzień 5: CHODZIĆ Z BOGIEM, GDY ŚWIAT OD NIEGO ODCHODZI — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 5. Henoch i Noe — Rdz 5:1–6:8.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_05_henoch_noe.jpg' },
                        6: { title: 'Dzień 6: ARKA — SĄD I RATUNEK — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 6. Arka, potop i ocalenie Noego — Rdz 6:9–8:22.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_06_ark_flood_noah.jpg' },
                        7: { title: 'Dzień 7: TĘCZA: BÓG ZAWIERA PRZYMIERZE — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 7. Przymierze, tęcza i upadek Noego — Rdz 9:1–29.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_07_rainbow_covenant.jpg' },
                        8: { title: 'Dzień 8: BABEL: KIEDY CZŁOWIEK CHCE UCZYNIĆ SOBIE IMIĘ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 8. Narody, wieża Babel i droga do Abrahama — Rdz 10:1–11:32.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_08_tower_of_babel.jpg' },
                        9: { title: 'Dzień 9: WYJDŹ! WIARA, KTÓRA RUSZA W DROGĘ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 9. Powołanie Abrama — Rdz 12:1–20.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_09_abram_calling.jpg' },
                        10: { title: 'Dzień 10: DWIE DROGI WYBORU — Abram i Lot — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 10. Abram i Lot — Rdz 13:1–14:24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_10_abram_lot.jpg' },
                        11: { title: 'Dzień 11: UWIERZYŁ PANU — I ZOSTAŁ UZNANY ZA SPRAWIEDLIWEGO — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 11. Abraham, gwiazdy i przymierze łaski — Rdz 15:1–21.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_11_abram_gwiazdy.jpg' },
                        12: { title: 'Dzień 12: GDY CZŁOWIEK PRÓBUJE POMÓC BOGU — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 12. Hagar, Ismael i Abraham — obietnica, cierpliwość i Bóg, który widzi — Rdz 16:1–17:27.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_12_hagar_pustynia.jpg' },
                        13: { title: 'Dzień 13: CZY JEST COŚ ZBYT TRUDNEGO DLA PANA? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 13. Bóg dotrzymuje obietnic, a Abraham wstawia się za grzesznikami — Rdz 18:1–33.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_13_mamre_goscie.jpg' },
                        14: { title: 'Dzień 14: SODOMA: ŁASKA, SĄD I RATUNEK — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 14. Gdy Bóg wyprowadza człowieka z miejsca zagłady — Rdz 19:1–38.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_14_sodoma_lot.jpg' },
                        15: { title: 'Dzień 15: BÓG DOTRZYMUJE OBIETNICY — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 15. Gdy ludzkie możliwości się kończą, Boża wierność pozostaje — Rdz 20:1–21:34.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_15_isaac_obietnica.jpg' },
                        16: { title: 'Dzień 16: BÓG SAM ZAPEWNI BARANKA — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 16. Abraham i Izaak — wiara poddana największej próbie — Rdz 22:1–24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_16_baranek_moria.jpg' },
                        17: { title: 'Dzień 17: WIARA PATRZĄCA W PRZYSZŁOŚĆ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 17. Gdy przychodzi strata, a Boża obietnica trwa nadal — Rdz 23:1–24:67.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_17_machpela_rebeka.jpg' },
                        18: { title: 'Dzień 18: JAKUB I EZAW — CZEGO NAPRAWDĘ PRAGNIESZ? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 18. Chwilowe pragnienia nie powinny przesłaniać duchowego dziedzictwa — Rdz 25:1–26:35.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_18_jakub_ezaw.jpg' },
                        19: { title: 'Dzień 19: GDY PRÓBUJEMY POMÓC BOGU OSZUSTWEM — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 19. Boża obietnica nie potrzebuje kłamstwa ani manipulacji — Rdz 27:1–46.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_19_jakub_izaak_podstep.jpg' }
                    };
                    const dMeta = dailyLessonsMeta[dayNum];
                    if (dMeta) {
                        title = dMeta.title;
                        desc = dMeta.desc;
                        img = dMeta.img;
                    } else {
                        title = `Dzień ${dayNum}: Kurs Codzienny Pisma Świętego — Z Biblią za Pan Brat`;
                        desc = `Studiuj Słowo Boże dzień po dniu w Akademii Biblijnej Christian Culture.`;
                        img = `https://polskieradio.cc/images/academy/daily/kc_day_${String(dayNum).padStart(2, '0')}.jpg`;
                    }
                    badge = `📖 DZIEŃ ${dayNum} • KURS CODZIENNY`;
                    ctaText = `Czytaj Dzień ${dayNum} ➔`;
                    icon = 'fa-solid fa-book-bible';
                } else {
                    title = 'Akademia Biblijna • Codzienny Kurs „Z Biblią za Pan Brat”';
                    desc = 'Kompletny 365-dniowy bezpłatny kurs biblijny od Księgi Rodzaju po Apokalipsę.';
                    badge = '📖 AKADEMIA BIBLIJNA';
                    ctaText = 'Rozpocznij Kurs ➔';
                    img = 'https://polskieradio.cc/images/academy/z_biblia_za_pan_brat_hero.jpg';
                    icon = 'fa-solid fa-book-bible';
                }
            } else if (pathname.includes('mojabiblia')) {
                title = 'MojaBiblia • Interlinearna Biblia z Kodami Stronga';
                desc = 'Badaj teksty hebrajskie i greckie, leksykon i porównuj 4 przekłady biblijne.';
                badge = '📜 MOJA BIBLIA';
                ctaText = 'Badaj Pismo ➔';
                img = 'https://polskieradio.cc/reklama_telebiblia_wikifaith_916.jpg';
                icon = 'fa-solid fa-book-open';
            } else if (pathname.includes('player')) {
                title = 'PLAYER CC • Spotify-Style Audio Dashboard';
                desc = 'Strumień radiowy w jakości bezstratnej, teksty pieśni, kanały tematyczne i odsłuch w tle.';
                badge = '🎵 PLAYER CC';
                ctaText = 'Słuchaj Muzyki ➔';
                img = 'https://polskieradio.cc/images/player/player-clean-art.jpg';
                icon = 'fa-solid fa-music';
            } else if (pathname.includes('vod')) {
                title = 'Kino Chrześcijańskie VOD • Christian Culture';
                desc = 'Oglądaj pełnometrażowe filmy chrześcijańskie, dokumenty i wartościowe produkcje filmowe bez opłat.';
                badge = '🎬 VOD CHRISTIAN CULTURE';
                ctaText = 'Oglądaj Film 🍿';
                img = 'https://polskieradio.cc/vod_hity_kina_poster.jpg';
                icon = 'fa-solid fa-film';
            } else if (pathname.includes('wspieraj')) {
                title = 'Wspieraj misję Christian Culture • Razem niesiemy nadzieję';
                desc = 'Nie każdy może dać pieniądze. Każdy może pomóc nieść Ewangelię dalej. Wesprzyj nas przez modlitwę, BLIK, przelew, Patronite lub udostępnianie.';
                badge = '🤝 WSPIERAJ MISJĘ CC';
                ctaText = 'Wspieraj Dzieło Boże ➔';
                img = 'https://polskieradio.cc/assets/cc-support/social.jpg';
                icon = 'fa-solid fa-hand-holding-heart';
            } else if (pathname.includes('lumina')) {
                title = 'Portal Społecznościowy LUMINA ✨';
                desc = 'Pierwszy polski chrześcijański portal społecznościowy. Łączymy wierzących, dzielimy się Słowem i świadectwami.';
                badge = '🕊️ PORTAL LUMINA';
                ctaText = 'Przejdź do Portalu 🕊️';
                img = 'https://polskieradio.cc/lumina_cover_bg.jpg';
                icon = 'fa-solid fa-users-rays';
            }

            return {
                url: url,
                host: 'Polskie Radio Christian Culture',
                domain: host,
                title,
                description: desc,
                image: img,
                badge,
                ctaText,
                icon
            };
        }

        // 3. Patronite (Wsparcie Misji CC)
        if (host.includes('patronite.pl')) {
            return {
                url: url,
                host: 'Patronite • Christian Culture',
                domain: host,
                title: 'Wspieraj Misję Ewangelizacyjną Christian Culture',
                description: 'Dołącz do grona Patronów i twórz z nami pierwsze w Polsce chrześcijańskie media nowej generacji.',
                image: 'https://polskieradio.cc/logo-glowne.png',
                badge: '💖 SPOŁECZNOŚĆ PATRONÓW',
                ctaText: 'Zostań Patronem 💖',
                icon: 'fa-solid fa-hand-holding-heart'
            };
        }

        // 4. Spotify
        if (host.includes('spotify.com')) {
            return {
                url: url,
                host: 'Spotify Music & Podcast',
                domain: host,
                title: 'Posłuchaj w serwisie Spotify',
                description: 'Odtwórz muzykę uwielbienia lub podcast chrześcijański bezpośrednio na platformie Spotify.',
                image: '',
                badge: '🎵 SPOTIFY STREAMING',
                ctaText: 'Odtwórz na Spotify 🎧',
                icon: 'fa-brands fa-spotify'
            };
        }

        // 5. Facebook
        if (host.includes('facebook.com') || host.includes('fb.watch')) {
            return {
                url: url,
                host: 'Facebook',
                domain: host,
                title: 'Zobacz materiał w serwisie Facebook',
                description: 'Oficjalny wpis, transmisja wideo lub aktualność w serwisie społecznościowym Facebook.',
                image: '',
                badge: '📱 FACEBOOK SOCIAL',
                ctaText: 'Zobacz na Facebooku ↗',
                icon: 'fa-brands fa-facebook'
            };
        }

        // 6. Instagram
        if (host.includes('instagram.com')) {
            return {
                url: url,
                host: 'Instagram',
                domain: host,
                title: 'Zobacz zdjęcie lub relację na Instagramie',
                description: 'Profil społecznościowy, fotografia lub relacja w serwisie Instagram.',
                image: '',
                badge: '📸 INSTAGRAM',
                ctaText: 'Zobacz na Instagramie ↗',
                icon: 'fa-brands fa-instagram'
            };
        }

        // 7. Generic URL
        return {
            url: url,
            host: host.toUpperCase(),
            domain: host,
            title: host.toUpperCase(),
            description: 'Otwórz stronę w nowej karcie...',
            image: '',
            badge: '🔗 ODNOŚNIK ZEWNĘTRZNY',
            ctaText: 'Odwiedź stronę ↗',
            icon: 'fa-solid fa-globe'
        };
    } catch(e) {
        return null;
    }
}

/**
 * Creates rich HTML card for OpenGraph/link preview
 */
export function createRichOpenGraphCardHtml(meta) {
    if (!meta || !meta.url) return '';
    const safeUrl = escapeHtml(meta.url);
    const safeHost = escapeHtml(meta.host || meta.domain || 'Odnośnik');
    const safeTitle = escapeHtml(meta.title || meta.url);
    const safeDesc = escapeHtml(meta.description || '');
    const safeBadge = escapeHtml(meta.badge || '🔗 ODNOŚNIK');
    const safeCta = escapeHtml(meta.ctaText || 'Otwórz stronę ↗');
    const safeIcon = meta.icon || 'fa-solid fa-globe';
    const isStore = !!meta.isStore;
    const hasImage = meta.image && String(meta.image).trim().length > 0;

    return `
        <div class="rich-og-card ${isStore ? 'rich-og-card-store' : ''}" data-og-url="${safeUrl}" onclick="event.stopPropagation()">
            <div class="rich-og-thumb-wrapper" style="${hasImage ? '' : 'display:none;'}">
                <img src="${hasImage ? escapeHtml(meta.image) : ''}" alt="${safeTitle}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                <div class="rich-og-floating-badge"><i class="${safeIcon}"></i> ${safeBadge}</div>
            </div>
            ${!hasImage ? `
                <div class="rich-og-top-bar">
                    <span class="rich-og-floating-badge static"><i class="${safeIcon}"></i> ${safeBadge}</span>
                </div>
            ` : ''}
            <div class="rich-og-body">
                <div class="rich-og-host"><i class="${safeIcon}" style="color:${isStore ? '#f59e0b' : '#38bdf8'};"></i> ${safeHost}</div>
                <h4 class="rich-og-title">${safeTitle}</h4>
                ${safeDesc ? `<p class="rich-og-desc">${safeDesc}</p>` : ''}
                <div class="rich-og-action-row">
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="rich-og-cta ${isStore ? 'store-cta' : ''}">
                        <span>${safeCta}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fetches real OpenGraph metadata asynchronously via Microlink API, with localStorage & memory caching
 */
export async function fetchLinkOpenGraphMetadata(url) {
    if (!url) return null;
    const baseMeta = getHeuristicLinkMetadata(url) || { url, host: '', title: '', description: '', image: '' };

    // Czyszczenie starego legacy cache (lumina_og_ -> lumina_og_v5_)
    try {
        if (typeof localStorage !== 'undefined') {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith('lumina_og_') && !k.startsWith('lumina_og_v5_')) {
                    localStorage.removeItem(k);
                }
            }
        }
    } catch(e) {}

    // Dedykowany priorytet dla podstrony wsparcia /wspieraj
    if (url.includes('wspieraj')) {
        _luminaOgCache.set(url, baseMeta);
        return baseMeta;
    }
    
    // Check in-memory cache
    if (_luminaOgCache.has(url)) {
        return _luminaOgCache.get(url);
    }

    // Check localStorage cache (TTL: 7 days)
    let cacheKey = 'lumina_og_v5_';
    try {
        cacheKey += btoa(encodeURIComponent(url)).slice(0, 32);
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000) {
                _luminaOgCache.set(url, parsed.data);
                return parsed.data;
            }
        }
    } catch(e) {}

    try {
        const resp = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
        if (resp.ok) {
            const json = await resp.json();
            if (json && json.status === 'success' && json.data) {
                const d = json.data;
                let resolvedImg = d.image?.url || baseMeta.image;
                if (resolvedImg && (resolvedImg.includes('polskieradio.cc/images/') || resolvedImg.includes('polskieradio.cc/assets/'))) {
                    resolvedImg = resolvedImg.replace(/^https?:\/\/(?:www\.)?polskieradio\.cc/, '');
                }
                const merged = {
                    ...baseMeta,
                    title: d.title || baseMeta.title,
                    description: d.description || baseMeta.description,
                    image: resolvedImg,
                    publisher: d.publisher || baseMeta.host,
                    logo: d.logo?.url || null
                };
                if (d.publisher && !baseMeta.isStore) {
                    merged.host = d.publisher;
                }
                _luminaOgCache.set(url, merged);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: merged }));
                } catch(e) {}
                return merged;
            }
        }
    } catch(err) {
        console.warn('LuminaDB fetchLinkOpenGraphMetadata network error:', err);
    }

    _luminaOgCache.set(url, baseMeta);
    return baseMeta;
}

/**
 * Hydrates all .rich-og-card elements in a container with real OpenGraph image and text
 */
export function hydrateOpenGraphCards(container = document) {
    if (!container) return;
    const cards = container.querySelectorAll('.rich-og-card[data-og-url]');
    cards.forEach(async (card) => {
        const url = card.getAttribute('data-og-url');
        if (!url || card.getAttribute('data-og-hydrated') === 'true') return;
        card.setAttribute('data-og-hydrated', 'true');

        try {
            const meta = await fetchLinkOpenGraphMetadata(url);
            if (!meta) return;

            // Update title
            const titleEl = card.querySelector('.rich-og-title');
            if (titleEl && meta.title && meta.title !== titleEl.textContent) {
                titleEl.textContent = meta.title;
            }

            // Update description
            const descEl = card.querySelector('.rich-og-desc');
            if (descEl && meta.description) {
                descEl.textContent = meta.description;
            } else if (!descEl && meta.description) {
                const p = document.createElement('p');
                p.className = 'rich-og-desc';
                p.textContent = meta.description;
                const body = card.querySelector('.rich-og-body');
                const actionRow = card.querySelector('.rich-og-action-row');
                if (body && actionRow) body.insertBefore(p, actionRow);
            }

            // Update or show image & floating badge
            if (meta.image) {
                let thumbWrapper = card.querySelector('.rich-og-thumb-wrapper');
                let thumbImg = card.querySelector('.rich-og-thumb');
                if (thumbWrapper && thumbImg) {
                    if (thumbImg.src !== meta.image) {
                        thumbImg.src = meta.image;
                    }
                    thumbWrapper.style.display = '';
                    const badgeEl = thumbWrapper.querySelector('.rich-og-floating-badge');
                    if (badgeEl && meta.badge) {
                        badgeEl.innerHTML = `<i class="${meta.icon || 'fa-solid fa-globe'}"></i> ${escapeHtml(meta.badge)}`;
                    }
                } else if (!thumbWrapper) {
                    thumbWrapper = document.createElement('div');
                    thumbWrapper.className = 'rich-og-thumb-wrapper';
                    thumbWrapper.innerHTML = `
                        <img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title || '')}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                        <div class="rich-og-floating-badge"><i class="${meta.icon || 'fa-solid fa-globe'}"></i> ${escapeHtml(meta.badge || 'LINK')}</div>
                    `;
                    card.insertBefore(thumbWrapper, card.firstChild);
                }
                const topBar = card.querySelector('.rich-og-top-bar');
                if (topBar) topBar.remove();
            }
        } catch(e) {}
    });
}

export function formatRichTextAndMedia(rawText, postData = null) {
    if (!rawText && (!postData || !postData.linkPreview)) return { html: '', embedHtml: '', urls: [] };
    
    // 1. Zabezpieczenie przed XSS (Sanityzacja znaczników HTML)
    const sanitizedText = escapeHtml(rawText || '');

    // Używamy tokenizera placeholderów, aby zapobiec zagnieżdżaniu tagów <a> wewnątrz już wygenerowanych <a>
    const linkPlaceholders = [];
    function stashLink(html) {
        const id = `___LUMINA_LNK_${linkPlaceholders.length}___`;
        linkPlaceholders.push(html);
        return id;
    }

    // 0. Rozpoznanie i zamiana linku wsparcia Patronite na aktywny lśniący przycisk (schowany w tokenie)
    let placeholderText = sanitizedText.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return stashLink(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link" onclick="event.stopPropagation()"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`);
    });

    // Regex for URLs, www domains, and bare domains
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
    const foundUrls = placeholderText.match(urlRegex) || [];

    // 1. Zamiana pełnych URLs (http/https) na aktywne linki (schowane w tokenach)
    placeholderText = placeholderText.replace(urlRegex, (url) => {
        let display = url.replace(/^https?:\/\/(www\.)?/, '');
        if (display.length > 38) display = display.substring(0, 35) + '...';
        const safeUrl = encodeURI(url).replace(/"/g, '&quot;');
        return stashLink(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`);
    });

    // 2. Zamiana adresów www. (bez protokołu)
    placeholderText = placeholderText.replace(/(^|[\s(])(www\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[^\s<]*)/gi, (match, p1, rawDomain) => {
        let domain = rawDomain;
        let trail = '';
        const trailMatch = domain.match(/[.,:;!?)\]]+$/);
        if (trailMatch) {
            trail = trailMatch[0];
            domain = domain.slice(0, -trail.length);
        }
        let display = domain;
        if (display.length > 38) display = display.substring(0, 35) + '...';
        return `${p1}${stashLink(`<a href="https://${domain}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`)}${trail}`;
    });

    // 3. Zamiana domen bazowych bez protokołu (np. apokalipsa.online, studiods.pl, polskieradio.cc)
    const tlds = 'online|pl|cc|com|org|net|eu|tv|live|app|edu|gov|io|info|biz|me|fm|ai|co';
    const bareDomainRegex = new RegExp('(^|[\\s(])([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.(?:' + tlds + ')(?:\\/[^\\s<]*)?)', 'gi');
    placeholderText = placeholderText.replace(bareDomainRegex, (match, p1, rawDomain) => {
        if (match.includes('___LUMINA_LNK_')) return match;
        let domain = rawDomain;
        let trail = '';
        const trailMatch = domain.match(/[.,:;!?)\]]+$/);
        if (trailMatch) {
            trail = trailMatch[0];
            domain = domain.slice(0, -trail.length);
        }
        if (!foundUrls.includes('https://' + domain)) foundUrls.push('https://' + domain);
        let display = domain;
        if (display.length > 38) display = display.substring(0, 35) + '...';
        return `${p1}${stashLink(`<a href="https://${domain}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`)}${trail}`;
    });

    // Replace @mentions with clickable profile pills (schowane w tokenach)
    placeholderText = placeholderText.replace(/(^|[\s>(])@([a-zA-Z0-9_]+)/g, (match, p1, handle) => {
        const hInfo = resolveMentionHandle(handle);
        const nameAttr = (hInfo && hInfo.name) ? escapeHtml(hInfo.name) : escapeHtml(handle);
        const urlAttr = (hInfo && hInfo.url) ? encodeURI(hInfo.url) : `lumina-profile.html?u=${encodeURIComponent(handle)}`;
        return `${p1}${stashLink(`<a href="${urlAttr}" class="lumina-mention-pill" title="Przejdź do profilu: ${nameAttr}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${escapeHtml(handle)}</a>`)}`;
    });

    // Replace #hashtags with clickable search pills (schowane w tokenach)
    placeholderText = placeholderText.replace(/(^|[\s>(])#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, p1, tag) => {
        const safeTag = escapeHtml(tag);
        const encTag = encodeURIComponent(tag);
        return `${p1}${stashLink(`<a href="lumina-tablica.html?q=%23${encTag}" class="lumina-hashtag-pill" data-tag="${safeTag}" title="Filtruj wpisy #${safeTag}" onclick="if(window.filterFeedByTag){event.preventDefault();event.stopPropagation();window.filterFeedByTag('${safeTag}');}else{event.stopPropagation();}"><i class="fa-solid fa-hashtag"></i>${safeTag}</a>`)}`;
    });

    // Replace linebreaks with <br>
    placeholderText = placeholderText.replace(/\n/g, '<br>');

    // 4. Przywróć wszystkie linki z tokenów
    let formattedText = placeholderText;
    linkPlaceholders.forEach((html, idx) => {
        formattedText = formattedText.replace(`___LUMINA_LNK_${idx}___`, html);
    });

    // Generate Rich Embed Card if URL is present or iframe is embedded
    let embedHtml = '';
    let linkMeta = null;

    if (postData && postData.linkPreview) {
        embedHtml = createRichOpenGraphCardHtml(postData.linkPreview);
        linkMeta = postData.linkPreview;
    }

    // Check if rawText contains direct YouTube iframe
    if (!embedHtml && rawText && rawText.includes('<iframe') && (rawText.includes('youtube.com') || rawText.includes('youtu.be'))) {
        const srcMatch = rawText.match(/src=["'](https?:\/\/[^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
            let embedSrc = srcMatch[1].replace(/&amp;/g, '&');
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="${escapeHtml(embedSrc)}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        }
    }

    if (!embedHtml && foundUrls.length > 0) {
        const firstUrl = foundUrls[0];
        const playlistId = extractYouTubePlaylistId(firstUrl);
        const ytId = extractYouTubeId(firstUrl);

        if (playlistId && (firstUrl.includes('videoseries') || firstUrl.includes('playlist') || !ytId)) {
            // YouTube Playlist Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0&modestbranding=1" 
                            title="Odtwarzacz playlisty YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (ytId) {
            // YouTube Interactive Video Player Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1${playlistId ? `&list=${encodeURIComponent(playlistId)}` : ''}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (firstUrl.includes('drive.google.com') || firstUrl.includes('docs.google.com')) {
            const gdriveData = parseGoogleDriveUrl(firstUrl);
            if (gdriveData) {
                embedHtml = createGoogleDriveEmbedHtml(gdriveData);
            }
        } else {
            // Social Media / OpenGraph Style Rich Preview Card
            linkMeta = getHeuristicLinkMetadata(firstUrl);
            if (linkMeta) {
                embedHtml = createRichOpenGraphCardHtml(linkMeta);
            }
        }
    }

    return {
        html: formattedText,
        embedHtml: embedHtml,
        urls: foundUrls,
        linkPreview: linkMeta
    };
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA 3D FAITH & ENGAGEMENT BADGES SUITE (WIRTUALNE ODZNAKI 3D) ──
// ══════════════════════════════════════════════════════════════════════════

export const LUMINA_BADGES_CATALOG = {
    // 🛡️ Wiara & Formacja Duchowa
    'prayer_flame': {
        id: 'prayer_flame',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Płomień Modlitwy',
        icon: 'fa-solid fa-fire-flame-curved',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        bgGlow: 'rgba(245, 158, 11, 0.45)',
        verse: '„Nieustannie się módlcie!” (1 Tesaloniczan 5,17)',
        desc: 'Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.',
        tier: 'Gold Tier',
        rarity: 'Duchowa Siła'
    },
    'word_guardian': {
        id: 'word_guardian',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Strażnik Słowa',
        icon: 'fa-solid fa-book-bible',
        color: '#38bdf8',
        gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
        bgGlow: 'rgba(56, 189, 248, 0.45)',
        verse: '„Twoje słowo jest lampą dla moich stóp i światłem na mojej ścieżce.” (Psalm 119,105)',
        desc: 'Wyróżnienie za codzienne rozważanie i studiowanie Pisma Świętego oraz wierność Bożej Prawdzie.',
        tier: 'Diamond Tier',
        rarity: 'Mądrość Boża'
    },
    'worship_pillar': {
        id: 'worship_pillar',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Filar Wspólnoty',
        icon: 'fa-solid fa-church',
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
        bgGlow: 'rgba(168, 85, 247, 0.45)',
        verse: '„Nie opuszczajmy naszych wspólnych zebrań...” (Hebrajczyków 10,25)',
        desc: 'Za regularne uczestnictwo w nabożeństwach i aktywne budowanie żywego Ciała Chrystusa.',
        tier: 'Platinum Tier',
        rarity: 'Wierność'
    },
    'kingdom_marriage': {
        id: 'kingdom_marriage',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Małżeństwo w Bożej Woli',
        icon: 'fa-solid fa-ring',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        bgGlow: 'rgba(236, 72, 153, 0.45)',
        verse: '„A sznur potrójny niełatwo się zerwie.” (Księga Koheleta 4,12)',
        desc: 'Honorowe wyróżnienie dla małżeństw i rodzin budujących swoje przymierze na fundamencie Chrystusa.',
        tier: 'Ruby Tier',
        rarity: 'Przymierze'
    },

    // ⚔️ Misja & Wzrost Społeczności
    'royal_heritage': {
        id: 'royal_heritage',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Królewskie Dziedzictwo',
        icon: 'fa-solid fa-crown',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
        bgGlow: 'rgba(251, 191, 36, 0.50)',
        verse: '„Wy zaś jesteście wybranym plemieniem, królewskim kapłaństwem...” (1 Piotra 2,9)',
        desc: 'Wyróżnienie Założycieli dla kluczowych filarów misji ewangelizacyjnej Christian Culture.',
        tier: 'Royal Gold',
        rarity: 'Przywództwo'
    },
    'intercessor': {
        id: 'intercessor',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Orędownik Braterski',
        icon: 'fa-solid fa-hands-praying',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bgGlow: 'rgba(16, 185, 129, 0.45)',
        verse: '„Jedni drugich brzemiona noście, a tak wypełnicie zakon Chrystusowy.” (Galacjan 6,2)',
        desc: 'Za modlitewne wstawiennictwo za braci i siostry w intencjach zgłaszanych na portalu LUMINA.',
        tier: 'Emerald Tier',
        rarity: 'Miłość Braterska'
    },
    'fellowship_builder': {
        id: 'fellowship_builder',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Budowniczy Relacji',
        icon: 'fa-solid fa-mug-hot',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        bgGlow: 'rgba(249, 115, 22, 0.45)',
        verse: '„Miłością braterską jedni drugich miłujcie...” (Rzymian 12,10)',
        desc: 'Wyróżnienie za otwartość, wysyłanie chrześcijańskiej kawy i nawiązywanie czystych, Bożych relacji.',
        tier: 'Amber Tier',
        rarity: 'Gościnność'
    },
    'gospel_ambassador': {
        id: 'gospel_ambassador',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Ambasador Dobrej Nowiny',
        icon: 'fa-solid fa-bullhorn',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
        bgGlow: 'rgba(6, 182, 212, 0.45)',
        verse: '„Idźcie na cały świat i głoście Ewangelię!” (Marka 16,15)',
        desc: 'Za aktywne udostępnianie rozważań, zapraszanie do społeczności LUMINA i szerzenie Dobrej Nowiny.',
        tier: 'Sapphire Tier',
        rarity: 'Ewangelizacja'
    },

    // 💎 Wiarygodność & Autentyczność
    'verified_authentic': {
        id: 'verified_authentic',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Zweryfikowany Świadek',
        icon: 'fa-solid fa-shield-halved',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
        bgGlow: 'rgba(16, 185, 129, 0.40)',
        verse: '„I poznacie prawdę, a prawda was wyzwoli.” (Jana 8,32)',
        desc: 'Odznaka poświadczająca autentyczność profilu, prawdziwe zdjęcie twarzy i transparentność w społeczności.',
        tier: 'Guardian Shield',
        rarity: 'Autentyczność'
    },
    'heart_of_peace': {
        id: 'heart_of_peace',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Serce Pełne Pokoju',
        icon: 'fa-solid fa-dove',
        color: '#f43f5e',
        gradient: 'linear-gradient(135deg, #f43f5e, #a855f7)',
        bgGlow: 'rgba(244, 63, 94, 0.45)',
        verse: '„A pokój Boży, który przewyższa wszelki rozum, strzec będzie serc waszych...” (Filipian 4,7)',
        desc: 'Za nienaganną klasę, budujące słowa i wnoszenie pokoju Chrystusowego do każdej rozmowy.',
        tier: 'Ruby Star',
        rarity: 'Owoc Ducha'
    }
};

// Odznaki się ZDOBYWA (Strażnik, 2026-10-11): nikt nie dostaje kompletu na start.
// Zdobyte = przyznane w profilu (pole badges w Firestore) + to, co wynika z prawdziwych danych:
// „Zweryfikowany Świadek” za prawdziwe zdjęcie profilowe, „Królewskie Dziedzictwo” dla Założycieli.
const LUMINA_FOUNDER_SLUGS = ['cezaryrgowski', 'cezaryrogowski', 'wiolettarogowska'];
const LUMINA_OFFICIAL_PHOTO_SLUGS = ['cezaryrgowski', 'cezaryrogowski', 'wiolettarogowska', 'andrzejthiel'];

export function getUserBadges(slugOrProfile) {
    let slug = '';
    let prof = null;
    if (typeof slugOrProfile === 'string') {
        slug = slugOrProfile.toLowerCase().trim();
    } else if (slugOrProfile && typeof slugOrProfile === 'object') {
        prof = slugOrProfile;
        slug = String(prof.slug || prof.id || prof.uid || '').toLowerCase().trim();
    }
    const earned = new Set();
    if (prof && Array.isArray(prof.badges)) {
        prof.badges.forEach(id => { if (LUMINA_BADGES_CATALOG[id]) earned.add(id); });
    }
    if (LUMINA_FOUNDER_SLUGS.includes(slug)) earned.add('royal_heritage');
    const realPhoto = prof ? isLuminaRealPersonPhoto(prof.avatar, slug) : LUMINA_OFFICIAL_PHOTO_SLUGS.includes(slug);
    if (realPhoto || LUMINA_OFFICIAL_PHOTO_SLUGS.includes(slug)) earned.add('verified_authentic');
    return [...earned].map(id => LUMINA_BADGES_CATALOG[id]).filter(Boolean);
}

export function render3DBadgesGridHtml(slugOrProfile, ownerName = 'Członek Społeczności') {
    const badges = getUserBadges(slugOrProfile);
    const earnedIds = new Set(badges.map(b => b.id));
    const locked = Object.values(LUMINA_BADGES_CATALOG).filter(b => !earnedIds.has(b.id));
    const total = badges.length + locked.length;
    const safeOwner = String(ownerName).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const card = (b, isLocked) => `
                    <div class="lumina-badge-3d-card${isLocked ? ' is-locked' : ''}" role="button" tabindex="0" aria-label="${b.name}${isLocked ? ' — jeszcze nie zdobyta' : ''}" onclick="window.open3DBadgeDetailsModal('${b.id}', '${safeOwner}', ${isLocked ? 'true' : 'false'})"${isLocked ? ' style="opacity:0.5; filter:grayscale(1);"' : ''}>
                        <div class="badge-3d-medal" style="background:${b.gradient}; box-shadow:0 8px 24px ${isLocked ? 'transparent' : b.bgGlow}; position:relative;">
                            <i class="${b.icon}"></i>
                            ${isLocked ? '<i class="fa-solid fa-lock" aria-hidden="true" style="position:absolute; right:-2px; bottom:-2px; font-size:0.7rem; background:#334155; color:#fff; border-radius:50%; padding:5px;"></i>' : ''}
                        </div>
                        <div class="badge-3d-name">${b.name}</div>
                        <div class="badge-3d-tier">
                            <span class="badge-dot" style="background:${isLocked ? '#94a3b8' : b.color};"></span>
                            ${isLocked ? 'Do zdobycia' : b.rarity}
                        </div>
                    </div>`;

    return `
        <div class="lumina-3d-badges-section">
            <div class="lumina-3d-badges-header">
                <div class="lumina-3d-badges-title">
                    <i class="fa-solid fa-medal" style="color:#f59e0b; font-size:1.15rem;"></i>
                    <span>Odznaki</span>
                </div>
                <span title="Zdobyte odznaki" style="font-size:0.75rem; color:#94a3b8; font-weight:700; background:rgba(255,255,255,0.06); padding:3px 10px; border-radius:10px;">
                    <i class="fa-solid fa-trophy" aria-hidden="true"></i> ${badges.length} / ${total}
                </span>
            </div>
            <div class="lumina-3d-badges-grid">
                ${badges.map(b => card(b, false)).join('')}${locked.map(b => card(b, true)).join('')}
            </div>
        </div>
    `;
}

export function ensure3DBadgeModalInDom() {
    if (typeof document === 'undefined') return;
    
    // Inject 3D Badge Styles if not present
    if (!document.getElementById('lumina-3d-badges-style')) {
        const style = document.createElement('style');
        style.id = 'lumina-3d-badges-style';
        style.textContent = `
            .lumina-3d-badges-section {
                margin: 20px 0;
                padding: 20px 18px;
                background: linear-gradient(135deg, rgba(13, 20, 39, 0.90), rgba(18, 26, 47, 0.95));
                border: 1px solid rgba(250, 204, 21, 0.25);
                border-radius: 24px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            }
            .lumina-3d-badges-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            .lumina-3d-badges-title {
                font-size: 1.05rem;
                font-weight: 900;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Outfit', -apple-system, sans-serif;
            }
            .lumina-3d-badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 14px;
            }
            .lumina-badge-3d-card {
                background: rgba(11, 19, 41, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                padding: 16px 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            }
            .lumina-badge-3d-card:hover {
                transform: translateY(-6px) scale(1.04);
                border-color: rgba(250, 204, 21, 0.6);
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(250, 204, 21, 0.28);
            }
            .badge-3d-medal {
                width: 52px;
                height: 52px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: #fff;
                margin-bottom: 10px;
                border: 1.5px solid rgba(255, 255, 255, 0.4);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .lumina-badge-3d-card:hover .badge-3d-medal {
                transform: scale(1.15) rotate(6deg);
            }
            .badge-3d-name {
                font-size: 0.82rem;
                font-weight: 800;
                color: #fff;
                line-height: 1.3;
                margin-bottom: 4px;
            }
            .badge-3d-tier {
                font-size: 0.68rem;
                color: #94a3b8;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            .badge-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    if (document.getElementById('modal3DBadgeDetails')) return;

    const modal = document.createElement('div');
    modal.id = 'modal3DBadgeDetails';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'z-index: 100005; background: rgba(5, 8, 22, 0.88); backdrop-filter: blur(16px); display: none; align-items: center; justify-content: center; position: fixed; inset: 0; padding: 16px;';
    modal.onclick = (e) => { if (e.target === modal) window.close3DBadgeModal(); };

    modal.innerHTML = `
        <div class="modal-card" style="max-width: 480px; width: 100%; text-align: center; background: #0b1329; border: 1.5px solid rgba(250, 204, 21, 0.45); border-radius: 28px; padding: 32px 24px; box-shadow: 0 0 50px rgba(250, 204, 21, 0.25); position: relative; overflow: hidden;">
            <!-- Ambient 3D Glow Background -->
            <div id="badgeModalGlow" style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 220px; height: 220px; background: radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%); border-radius: 50%; pointer-events: none; filter: blur(20px);"></div>
            
            <button type="button" class="modal-close-btn" onclick="window.close3DBadgeModal()" style="position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- 3D Big Animated Badge Medal -->
            <div style="perspective: 800px; margin: 10px auto 20px;">
                <div id="badgeModalMedal" style="width: 96px; height: 96px; border-radius: 26px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #fff; box-shadow: 0 12px 36px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.35); transform: rotateY(0deg); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <i id="badgeModalIcon" class="fa-solid fa-crown"></i>
                </div>
            </div>

            <!-- Category & Tier Badges -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <span id="badgeModalCategory" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; text-transform: uppercase;">
                    🛡️ WIARA & FORMACJA
                </span>
                <span id="badgeModalTier" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(250, 204, 21, 0.2); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15;">
                    GOLD TIER
                </span>
            </div>

            <h2 id="badgeModalName" style="color: #fff; font-size: 1.45rem; font-weight: 900; margin-bottom: 6px; font-family: 'Outfit', sans-serif;">
                Płomień Modlitwy
            </h2>

            <p id="badgeModalOwner" style="font-size: 0.82rem; color: #38bdf8; font-weight: 700; margin-bottom: 16px;">
                ✨ Wyróżnienie członka społeczności: <b>Cezary Rogowski</b>
            </p>

            <!-- Scripture Verse Card -->
            <div id="badgeModalVerseBox" style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; border-radius: 0 14px 14px 0; padding: 12px 16px; margin-bottom: 16px; text-align: left;">
                <div style="font-size: 0.70rem; font-weight: 800; color: #facc15; text-transform: uppercase; margin-bottom: 4px;">
                    <i class="fa-solid fa-sparkles"></i> Słowo Boże / Fundament
                </div>
                <p id="badgeModalVerse" style="color: #fde047; font-size: 0.86rem; font-weight: 600; font-style: italic; line-height: 1.45; margin: 0;">
                    „Nieustannie się módlcie!” (1 Tesaloniczan 5,17)
                </p>
            </div>

            <p id="badgeModalDesc" style="color: #cbd5e1; font-size: 0.86rem; line-height: 1.6; margin-bottom: 22px;">
                Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.
            </p>

            <!-- Action buttons -->
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button type="button" onclick="window.share3DBadgeToFeed()" style="flex: 1; padding: 12px 18px; border-radius: 14px; border: none; background: linear-gradient(135deg, #f59e0b, #ec4899); color: #fff; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(245,158,11,0.35);">
                    <i class="fa-solid fa-share-nodes"></i> Udostępnij na Tablicy
                </button>
                <button type="button" onclick="window.close3DBadgeModal()" style="padding: 12px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #94a3b8; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                    Zamknij
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window._activeBadgeModalData = null;

export function open3DBadgeDetailsModal(badgeId, ownerName = 'Członek Społeczności', locked = false) {
    ensure3DBadgeModalInDom();
    const badge = LUMINA_BADGES_CATALOG[badgeId];
    if (!badge) return;

    window._activeBadgeModalData = locked ? null : { badge, ownerName };

    const modal = document.getElementById('modal3DBadgeDetails');
    if (!modal) return;

    const medal = document.getElementById('badgeModalMedal');
    const icon = document.getElementById('badgeModalIcon');
    const name = document.getElementById('badgeModalName');
    const cat = document.getElementById('badgeModalCategory');
    const tier = document.getElementById('badgeModalTier');
    const owner = document.getElementById('badgeModalOwner');
    const verse = document.getElementById('badgeModalVerse');
    const desc = document.getElementById('badgeModalDesc');
    const glow = document.getElementById('badgeModalGlow');

    if (medal) {
        medal.style.background = badge.gradient;
        medal.style.boxShadow = `0 14px 40px ${badge.bgGlow}`;
    }
    if (glow) {
        glow.style.background = `radial-gradient(circle, ${badge.bgGlow} 0%, transparent 70%)`;
    }
    if (icon) icon.className = badge.icon;
    if (name) name.textContent = badge.name;
    if (cat) cat.textContent = badge.categoryLabel;
    if (tier) {
        tier.textContent = `${badge.tier} • ${badge.rarity}`;
        tier.style.color = badge.color;
        tier.style.borderColor = badge.color;
    }
    if (owner) owner.innerHTML = locked
        ? '<i class="fa-solid fa-lock" aria-hidden="true"></i> Jeszcze nie zdobyta — jak ją zdobyć, opisuje tekst poniżej.'
        : `✨ Wyróżnienie członka społeczności: <b>${escapeHtml(String(ownerName))}</b>`;
    const shareBtn = modal.querySelector('[onclick*="share3DBadgeToFeed"]');
    if (shareBtn) shareBtn.style.display = locked ? 'none' : '';
    if (medal) medal.style.filter = locked ? 'grayscale(1)' : '';
    if (verse) verse.textContent = badge.verse;
    if (desc) desc.textContent = badge.desc;

    modal.style.display = 'flex';
    modal.classList.add('open');

    // 3D subtle rotation effect
    if (medal) {
        medal.style.transform = 'rotateY(360deg)';
        setTimeout(() => { medal.style.transform = 'rotateY(0deg)'; }, 600);
    }
}

export function close3DBadgeModal() {
    const modal = document.getElementById('modal3DBadgeDetails');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

window.open3DBadgeDetailsModal = open3DBadgeDetailsModal;
window.close3DBadgeModal = close3DBadgeModal;

window.share3DBadgeToFeed = async function() {
    if (!window._activeBadgeModalData) return;
    const { badge, ownerName } = window._activeBadgeModalData;
    close3DBadgeModal();

    const postText = `🏆 Zdobyłem(am) nową odznakę w społeczności LUMINA!\n✨ Odznaka: **${badge.name}** (${badge.tier})\n📖 ${badge.verse}\n\n${badge.desc}\n\nDołącz do nas i buduj Królestwo Boże! 🕊️✨`;

    if (window.LuminaDB && typeof window.LuminaDB.publishUniversalPost === 'function') {
        const res = await window.LuminaDB.publishUniversalPost({
            text: postText,
            authorName: ownerName,
            mediaType: 'badge',
            badgeId: badge.id
        });
        if (typeof showToast === 'function') showToast('🏆 Udostępniono odznakę na Tablicy Społeczności!');
    } else {
        if (typeof showToast === 'function') showToast(`Skopiowano treść odznaki: ${badge.name}! ✨`);
    }
};

// ══════════════════════════════════════════════════════════════════════════
export function detectProfileGender(p) {
    if (!p) return 'unknown';
    const g = (p.gender || '').toLowerCase().trim();
    if (g === 'kobieta' || g === 'female' || g === 'woman' || g === 'dziewczyna') return 'female';
    if (g === 'mezczyzna' || g === 'mężczyzna' || g === 'male' || g === 'man' || g === 'facet' || g === 'chłopak' || g === 'chlopak') return 'male';

    const denom = (p.denom || '').toLowerCase();
    if (denom.includes('chrześcijanka') || denom.includes('kobieta')) return 'female';
    if (denom.includes('chrześcijanin') || denom.includes('mężczyzna') || denom.includes('mezczyzna')) return 'male';

    const status = (p.status || '').toLowerCase();
    if (status.includes('panna') || status.includes('mężatka') || status.includes('mezatka') || status.includes('rozwiedziona') || status.includes('wdowa')) return 'female';
    if (status.includes('kawaler') || status.includes('żonaty') || status.includes('zonaty') || status.includes('rozwiedziony') || status.includes('wdowiec')) return 'male';

    const slug = (p.slug || p.id || '').toLowerCase();
    if (slug.includes('wioletta') || slug.includes('magdalena') || slug.includes('dorota') || slug.includes('urszula') || slug.includes('anna') || slug.includes('noemi') || slug.includes('weronika') || slug.includes('dominika') || slug.includes('sylwia') || slug.includes('bernardeta') || slug.includes('ccwomen') || slug.includes('jola') || slug.includes('julia') || slug.includes('zofiadudek') || slug.includes('kasia') || slug.includes('maria') || slug.includes('ewa') || slug.includes('agata') || slug.includes('paulina') || slug.includes('monika') || slug.includes('karolina') || slug.includes('natalia') || slug.includes('patrycja') || slug.includes('aleksandra') || slug.includes('olga') || slug.includes('martyna')) return 'female';
    if (slug.includes('cezary') || slug.includes('andrzej') || slug.includes('robert') || slug.includes('lukasz') || slug.includes('tomek') || slug.includes('tomasz') || slug.includes('dawid') || slug.includes('rafal') || slug.includes('ccmen') || slug.includes('piotr') || slug.includes('pawel') || slug.includes('pawelmurawski') || slug.includes('zbyszek') || slug.includes('zbyszekgieron') || slug.includes('krzysztof') || slug.includes('marcin') || slug.includes('michal') || slug.includes('mateusz') || slug.includes('jan') || slug.includes('adam') || slug.includes('marek') || slug.includes('grzegorz') || slug.includes('bartosz')) return 'male';

    const name = (p.name || p.displayName || '').toLowerCase().trim();
    const firstName = name.split(/\s+/)[0] || name;
    const maleNameExceptions = ['kuba', 'jakub', 'barnaba', 'kosma', 'bonawentura', 'jarema', 'zawisza'];
    if (maleNameExceptions.includes(firstName)) return 'male';
    if (firstName.endsWith('a')) return 'female';
    return 'male';
}

// ── ŻELAZNA DOKTRYNA LUMINA (@L + @Joma) ──
// Nie polecamy profilom męskim mężczyzn a kobiecym kobiet.
export function isProfileRecommendedForUser(targetProfile, currentProfile) {
    if (!targetProfile) return false;
    
    // Kanały misyjne i oficjalne konta są zawsze dozwolone w polecanych
    if (targetProfile.isMissionAccount || targetProfile.isMission || 
        ['radiocc','cctv','ccmen','ccwomen','studiodobregoslowa','osobowoscplus','lumina','bibliaaudio'].includes((targetProfile.slug || '').toLowerCase())) {
        return true;
    }

    const myProfile = currentProfile || (typeof window.LuminaDB?.getCurrentProfile === 'function' ? window.LuminaDB.getCurrentProfile() : null) || (function() {
        try { return JSON.parse(localStorage.getItem('lumina_my_profile') || 'null'); } catch(e) { return null; }
    })();

    if (!myProfile) return true; // Dla gości bez określonej płci pokazujemy domyślną mieszankę

    // ── WYJĄTEK ADMINISTRATORA (@Dowódca) ──
    // Właściciel i administrator portalu widzi WSZYSTKICH użytkowników bez filtra płci
    const mySlug = (myProfile.slug || myProfile.uid || myProfile.id || '').toLowerCase();
    if (myProfile.isAdmin || myProfile.isFounder || mySlug === 'cezaryrgowski') {
        return true;
    }

    const myGender = detectProfileGender(myProfile);
    const targetGender = detectProfileGender(targetProfile);

    // Bezwzględna reguła: nie polecamy męskim mężczyzn, a kobiecym kobiet
    if (myGender === 'male' && targetGender === 'male') {
        return false;
    }
    if (myGender === 'female' && targetGender === 'female') {
        return false;
    }

    return true;
}

export function calculateProfileMatchScore(targetProfile, currentProfile) {
    if (!targetProfile) return null;
    
    // Profile misyjne / kanały redakcyjne / oficjalne konta nie mają procentu dopasowania matrymonialnego
    if (targetProfile.isMissionAccount || targetProfile.isMission || targetProfile.isFounder ||
        targetProfile.slug === 'radiocc' || targetProfile.slug === 'studiodobregoslowa' || 
        targetProfile.slug === 'osobowoscplus' || targetProfile.slug === 'ccwomen' ||
        targetProfile.slug === 'ccmen' || targetProfile.slug === 'cctv' ||
        targetProfile.slug === 'bibliaaudio' || targetProfile.slug === 'lumina') {
        return null;
    }

    const myProfile = currentProfile || (typeof window.LuminaDB?.getCurrentProfile === 'function' ? window.LuminaDB.getCurrentProfile() : null) || (function() {
        try { return JSON.parse(localStorage.getItem('lumina_my_profile') || 'null'); } catch(e) { return null; }
    })();

    if (!myProfile || !myProfile.name || myProfile.slug === 'guest' || myProfile.slug === 'gosc') {
        return null; // Dla gości/niezalogowanych bez profilu
    }

    // Jeśli przeglądamy własny profil
    const isSameUser = (myProfile.slug && targetProfile.slug && myProfile.slug === targetProfile.slug) ||
                       (myProfile.uid && targetProfile.uid && myProfile.uid === targetProfile.uid) ||
                       (myProfile.id && targetProfile.id && myProfile.id === targetProfile.id) ||
                       (myProfile.name && targetProfile.name && myProfile.name.toLowerCase().trim() === targetProfile.name.toLowerCase().trim());
    if (isSameUser) {
        return 'Twój profil';
    }

    // ── ŻELAZNA DOKTRYNA LUMINA (@L + @Joma) — DOPASOWANIE TEJ SAMEJ PŁCI = 0%: ──
    // Nie polecamy profilom męskim mężczyzn a kobiecym kobiet.
    // Dopasowanie tych samych płci musi być ZAWSZE i BEZWZGLĘDNIE zerowe (0%).
    const myGender = detectProfileGender(myProfile);
    const targetGender = detectProfileGender(targetProfile);

    if (myGender === targetGender && myGender !== 'unknown') {
        return '0%'; // Bezwzględna zasada: tej samej płci ZAWSZE 0%
    }

    let score = 55; // Baza wyjściowa dla par o przeciwnej płci

    // 1. Zgodność wyznaniowa (Chrześcijaństwo / Denominacja) - max +20%
    if (myProfile.denom && targetProfile.denom) {
        if (myProfile.denom.toLowerCase() === targetProfile.denom.toLowerCase()) {
            score += 20;
        } else {
            score += 10;
        }
    }

    // 2. Zgodność tagów / wartości duchowych / pasji - max +15%
    const myTags = Array.isArray(myProfile.tags) ? myProfile.tags : [];
    const targetTags = Array.isArray(targetProfile.tags) ? targetProfile.tags : [];
    if (myTags.length && targetTags.length) {
        const commonTags = myTags.filter(t => targetTags.some(ot => ot.toLowerCase() === t.toLowerCase()));
        score += Math.min(15, commonTags.length * 5);
    }

    // 3. Lokalizacja / Miasto - max +10%
    if (myProfile.city && targetProfile.city) {
        const myCity = myProfile.city.toLowerCase();
        const targetCity = targetProfile.city.toLowerCase();
        if (myCity === targetCity || myCity.includes(targetCity) || targetCity.includes(myCity)) {
            score += 10;
        }
    }

    // 4. Zgodność wiekowa - max +5%
    const myAge = parseInt(myProfile.age, 10);
    const targetAge = parseInt(targetProfile.age, 10);
    if (!isNaN(myAge) && !isNaN(targetAge)) {
        const diff = Math.abs(myAge - targetAge);
        if (diff <= 3) score += 5;
        else if (diff <= 7) score += 3;
        else if (diff > 15) score -= 10;
    }

    // Clamp score 50% - 99%
    score = Math.max(50, Math.min(99, Math.round(score)));
    return score + '%';
}

window.calculateProfileMatchScore = calculateProfileMatchScore;
window.detectProfileGender = detectProfileGender;
window.isProfileRecommendedForUser = isProfileRecommendedForUser;
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.calculateProfileMatchScore = calculateProfileMatchScore;
window.LuminaDB.detectProfileGender = detectProfileGender;
window.LuminaDB.isProfileRecommendedForUser = isProfileRecommendedForUser;

// ══════════════════════════════════════════════════════════════════════════
// STANDARD FORMATOWANIA ROZWAŻAŃ: DOBRZE, ŻE JESTEŚ • CHRISTIAN CULTURE PREMIUM
// Reguła portalu: Żadne surowe adresy URL ani niebieskie linki nie są widoczne w tekście. 
// Każdy link jest eleganckim, lśniącym przyciskiem funkcyjnym z polską etykietą!
// ══════════════════════════════════════════════════════════════════════════
export function formatLuminaDevotionalContent(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // 0. Markdown bold i italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 1. WhatsApp invite -> zamień na elegancki zielony przycisk
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)(?:\s*[-–—]?\s*(?:Wejdź do zespołu ludzi z pasją!?|Dołącz do grupy WhatsApp!?))?/gi, (match, inviteCode) => {
        const url = `https://chat.whatsapp.com/${inviteCode || 'DBTRDxQWamZDWaOkjupSt0'}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link whatsapp-link"><i class="fa-brands fa-whatsapp"></i> Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp) <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 2. Google Play Apps -> zamień na złoty przycisk aplikacji
    text = text.replace(/(?:Apps:\s*)?https?:\/\/play\.google\.com\/store\/apps\/[^\s<)]+/gi, (match) => {
        const url = match.replace(/^Apps:\s*/i, '').trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link"><i class="fa-brands fa-google-play"></i> Pobierz bezpłatne aplikacje w Google Play <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3a. Lumina Portal
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?polskieradio\.cc\/lumina[a-zA-Z0-9_/-]*/gi, () => {
        return `<a href="https://www.polskieradio.cc/lumina" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-users-rays"></i> Portal Społeczności LUMINA <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3b. Polskie Radio CC
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?polskieradio\.cc(?!\/[a-zA-Z0-9_/-])/gi, () => {
        return `<a href="https://www.polskieradio.cc" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-radio"></i> Polskie Radio Christian Culture <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 4. CC Lite -> zamień na różowy przycisk Telewizji CC Lite
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?cclite\.pl[a-zA-Z0-9_/-]*/gi, () => {
        return `<a href="https://www.cclite.pl" target="_blank" rel="noopener noreferrer" class="reflection-smart-link tv-link"><i class="fa-solid fa-tv"></i> Telewizja CC Lite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 5. Patronite / Wsparcie Misji -> zamień na bordowo-czerwony aktywny przycisk ze serduszkiem
    text = text.replace(/(?<!["'/])(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Revolut Wsparcie -> zamień na aktywny przycisk
    text = text.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Darowizna|Revolut)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?revolut\.me\/([a-zA-Z0-9_-]+)/gi, (match, tag) => {
        const targetTag = tag || 'christianculture';
        const url = `https://revolut.me/${targetTag}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-hand-holding-dollar" style="color:#ef4444;"></i> Wesprzyj przez Revolut <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 8. Oczyszczenie wiszących separatorów '|' między przyciskami smart-link
    text = text.replace(/(<\/a>)\s*\|\s*(?=<a [^>]*class="[^"]*reflection-smart-link)/gi, '$1 ');

    // 9. Usuń surowe pozostałości linków i tagów OpenGraph lub podwójnych linków
    text = text.replace(/🌐\s*chat\.whatsapp\.com[^\s<]*/gi, '');
    text = text.replace(/CHAT\.WHATSAPP\.COM/gi, '');
    text = text.replace(/Otwórz stronę w nowej karcie\.\.\./gi, '');

    // 10. Markdown links [Tytuł](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (match, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link">${label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Podział na akapity i formatowanie modułów (Pismo, Zadanie, Modlitwa, Kanały)
    return text
        .split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => {
            const trimmed = p.trim();
            if (trimmed.startsWith('Jezus mówi dziś do Ciebie:') || trimmed.match(/^„[^”]+”\s*\([^)]+\)/)) {
                return `<div class="reflection-scripture-box"><div class="scripture-label"><i class="fa-solid fa-book-bible"></i> Jezus mówi dziś do Ciebie:</div><div class="scripture-quote">${trimmed.replace(/^Jezus mówi dziś do Ciebie:\s*/i, '').replace(/\n/g, '<br>')}</div></div>`;
            }
            if (trimmed.startsWith('Zadanie Taktyczne:')) {
                return `<div class="reflection-task-box"><div class="task-label"><i class="fa-solid fa-shield-halved"></i> Zadanie Taktyczne:</div><p style="margin:0; font-size:0.93rem; color:#f1f5f9; line-height:1.7;">${trimmed.replace(/^Zadanie Taktyczne:\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Modlitwa Bojowa:') || trimmed.startsWith('Modlitwa:')) {
                return `<div class="reflection-prayer-box"><div class="prayer-label"><i class="fa-solid fa-hands-praying"></i> Modlitwa Bojowa:</div><p style="margin:0; font-style:italic; font-size:0.95rem; line-height:1.75; color:#f8fafc;">${trimmed.replace(/^(?:Modlitwa Bojowa|Modlitwa):\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Baza i wzrost:') || trimmed.includes('PODAJ DALEJ') || trimmed.includes('reflection-smart-link')) {
                return `<div class="reflection-links-container"><div style="font-size:0.82rem; font-weight:800; color:#f59e0b; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;"><i class="fa-solid fa-network-wired"></i> Społeczność & Kanały LUMINA</div>${trimmed.replace(/\n/g, '<br>')}</div>`;
            }
            return `<p style="margin:0 0 14px; line-height:1.75; color:inherit; font-size:0.94rem;">${trimmed.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}
window.formatLuminaDevotionalContent = formatLuminaDevotionalContent;

// ══════════════════════════════════════════════════════════════════════════
// AUTOMATYCZNE POBIERANIE ROZWAŻANIA DNIA (FAITH & GROWTH HUB)
// ══════════════════════════════════════════════════════════════════════════
export async function loadLuminaDailyDevotional() {
    try {
        const now = new Date();
        const pad = (n) => n < 10 ? '0' + n : n;
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        const monthNames = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca', 'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'];
        const formattedDatePl = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        let devotionData = null;

        // 1. Próba pobrania z Firestore cc-mission-control (kolekcja web_inspirations)
        try {
            const mcConfig = {
                apiKey: "AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4",
                authDomain: "cc-mission-control.firebaseapp.com",
                projectId: "cc-mission-control",
                storageBucket: "cc-mission-control.firebasestorage.app",
                messagingSenderId: "519207260358",
                appId: "1:519207260358:web:d875a610f438ecad2c47c7"
            };
            const existingApps = getApps();
            let mcApp = existingApps.find(a => a.name === 'lumina-mc');
            if (!mcApp) {
                mcApp = initializeApp(mcConfig, 'lumina-mc');
            }
            const mcDb = getFirestore(mcApp);

            const q = query(
                collection(mcDb, 'web_inspirations'),
                orderBy('date', 'desc'),
                limit(10)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                const validDocs = snap.docs.map(docSnap => docSnap.data()).filter(d => d.date && d.date <= todayStr);
                devotionData = validDocs.find(d => d.date === todayStr) || validDocs[0] || null;
            }
        } catch (fsErr) {
            console.warn('LUMINA: Pobieranie rozważania z chmury Firebase (fallback do bazy lokalnej):', fsErr.message);
        }

        // 2. Fallback do rozwazania_baza.json
        if (!devotionData) {
            try {
                const res = await fetch('/rozwazania_baza.json?v=' + Date.now());
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        const validList = list.filter(r => r.date && r.date <= todayStr);
                        devotionData = validList.find(r => r.date === todayStr) || validList[0] || null;
                    }
                }
            } catch (jsonErr) {
                console.warn('LUMINA: Pobieranie rozważania z JSON fallback:', jsonErr.message);
            }
        }

        if (!devotionData) return;

        // Ekstrakcja danych
        const title = devotionData.title || `☀️ Dobrze, że jesteś — Słowo na Dziś`;
        const rawContent = devotionData.contentWeb || devotionData.fullText || devotionData.content || devotionData.teaser || '';
        const teaser = devotionData.teaser || (rawContent.length > 160 ? rawContent.substring(0, 160) + '...' : rawContent);

        // Ekstrakcja wersetu biblijnego
        let verseText = '';
        const verseMatch = rawContent.match(/„([^”]+)”\s*\(([^)]+)\)/) || rawContent.match(/"([^"]+)"\s*\(([^)]+)\)/);
        if (verseMatch) {
            verseText = `„${verseMatch[1]}” (${verseMatch[2]})`;
        }

        // Formatowanie tekstu HTML z aktywnymi przyciskami (Standard Premium Christian Culture)
        const formattedHtml = formatLuminaDevotionalContent(rawContent);

        // Aktualizacja DOM na stronie głównej (lumina.html)
        const dateBadge = document.getElementById('devotionalDateBadge');
        if (dateBadge) dateBadge.textContent = formattedDatePl;

        const cardTitle = document.getElementById('devotionalCardTitle');
        if (cardTitle) cardTitle.textContent = title;

        const cardSnippet = document.getElementById('devotionalCardSnippet');
        if (cardSnippet) cardSnippet.textContent = teaser;

        const modalTitle = document.getElementById('modalDevotionTitle');
        if (modalTitle) modalTitle.textContent = title;

        const modalVerseBox = document.getElementById('modalDevotionVerseBox');
        const modalVerseText = document.getElementById('modalDevotionVerseText');
        if (modalVerseText) {
            if (verseText) {
                modalVerseText.textContent = verseText;
                if (modalVerseBox) modalVerseBox.style.display = 'block';
            } else if (modalVerseBox) {
                modalVerseBox.style.display = 'none';
            }
        }

        const modalBody = document.getElementById('modalDevotionBody');
        if (modalBody) {
            modalBody.innerHTML = `<p style="line-height: 1.7;">${formattedHtml}</p>`;
        }

        // Zapis do stanu globalnego
        window._luminaDailyReflection = {
            id: devotionData.id || ('daily_rozwazanie_' + todayStr),
            title: title,
            date: devotionData.date || todayStr,
            fullText: rawContent,
            fullTextHtml: formattedHtml,
            teaser: teaser,
            verse: verseText,
            imageUrl: devotionData.imageUrl || 'promo_dzj.jpg'
        };

    } catch (err) {
        console.warn('loadLuminaDailyDevotional global error:', err);
    }
}

// Auto-inicjalizacja przy starcie strony i odświeżanie cykliczne
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
                loadLuminaDailyDevotional();
            }
        });
    } else {
        if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
            loadLuminaDailyDevotional();
        }
    }
    setInterval(() => {
        if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
            loadLuminaDailyDevotional();
        }
    }, 900000); // Co 15 minut
}

window.loadLuminaDailyDevotional = loadLuminaDailyDevotional;

// Global window attachment for seamless cross-script integration
window.LuminaDB = Object.assign(window.LuminaDB || {}, {
    isProfileNew,
    loadLuminaDailyDevotional,

    onAuthChange,
    getCurrentUser,
    getCurrentProfile,
    subscribeToCoffeeInvites,
    createFeedPost,
    publishCloudShort,
    subscribeToCloudShorts,
    getCloudShorts,
    subscribeToFeedPosts,
    ensureDbReady,
    loginWithGoogle,
    registerWithEmail,
    registerUser,
    postWelcomeMessageForNewUser,
    loginWithEmail,
    loginUser,
    getProfileFromCloud,
    ANDRZEJ_THIEL_PROFILE,
    ROBERT_LUKASZ_PIO_PROFILE,
    logoutUser,
    setupPhoneRecaptcha,
    sendPhoneVerificationCode,
    confirmPhoneVerificationCode,
    subscribeToProfile,
    saveProfileToCloud,
    deleteProfileFromCloud,
    deleteProfile,
    setProfileBlockStatus,
    subscribeToAllCommunityProfiles,
    addPostToCloud,
    publishUniversalPost,
    getAuthorPosts,
    togglePostReactionInCloud,
    subscribeToCampaigns,
    addCampaignToCloud,
    getChatId,
    normalizeChatUserId,
    subscribeToDirectMessages,
    subscribeToIncomingMessageRequests,
    acceptMessageRequest,
    declineMessageRequest,
    sendDirectMessageToCloud,
    markDirectMessagesAsRead,
    toggleDirectMessageReaction,
    subscribeToPublicChat,
    sendPublicChatMessage,
    changeOwnPublicChatMessage,
    markPublicMessagesSeen,
    togglePublicChatMessageReaction,
    subscribeToUserChats,
    recordProfileLike,
    subscribeToUserMatches,
    reportContent,
    getBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser,
    requestNotificationPermission,
    playNotificationChime,
    showInAppChatBanner,
    triggerLuminaPushNotification,
    showSystemDrawerNotification,
    startRealtimeChatNotificationsListener,
    isChatRoomUnread,
    getChatRoomReadTime,
    markChatRoomRead,
    MISSION_BROADCAST_CHANNELS,
    getMissionBroadcastChannel,
    getMissionAccounts,
    getActiveMissionPersona,
    setActiveMissionPersona,
    publishAsMissionAccount,
    extractYouTubeId,
    extractYouTubePlaylistId,
    formatRichTextAndMedia,
    getHeuristicLinkMetadata,
    createRichOpenGraphCardHtml,
    fetchLinkOpenGraphMetadata,
    hydrateOpenGraphCards,
    parseGoogleDriveUrl,
    createGoogleDriveEmbedHtml,
    LUMINA_HANDLES,
    resolveMentionHandle,
    normalizePhoneNumber,
    calculateProfileMatchScore,
    isUserAuthenticated,
    openLoginToFollowModal,
    toggleFollow
});


// End of module exports

export default window.LuminaDB;

// Global window direct access
window.loginWithGoogle = loginWithGoogle;
window.luminaAuth = auth;
window.luminaDb = db;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.loginWithGoogle = loginWithGoogle;
window.LuminaDB.isUserAuthenticated = isUserAuthenticated;
window.LuminaDB.openLoginToFollowModal = openLoginToFollowModal;
window.LuminaDB.toggleFollow = toggleFollow;


// ══════════════════════════════════════════════════════════════════════════
// 10. 100% GENUINE REALTIME PRESENCE & FOUNDER COMMUNITY TELEMETRY ENGINE
// ══════════════════════════════════════════════════════════════════════════

let presenceHeartbeatTimer = null;
let presenceNextPingAt = 0;
let presenceLastUid = null;

export function startPresenceHeartbeat() {
    if (!db || presenceHeartbeatTimer) return;

    const getSessionId = () => {
        let s = sessionStorage.getItem('lumina_presence_session_id');
        if (!s) {
            s = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            sessionStorage.setItem('lumina_presence_session_id', s);
        }
        return s;
    };

    const sendPing = async () => {
        try {
            const u = currentUserState || (window.LuminaDB?.getCurrentUser ? window.LuminaDB.getCurrentUser() : null);
            if (!u || u.isAnonymous || !u.uid || document.visibilityState === 'hidden') return;
            if (presenceLastUid === u.uid && Date.now() < presenceNextPingAt) return;
            presenceLastUid = u.uid;
            presenceNextPingAt = Date.now() + 60000;
            const p = currentProfileState;
            const sessionId = getSessionId();
            const docId = (u && u.uid) ? u.uid : sessionId;
            const presenceRef = doc(db, 'lumina_presence', docId);

            let detectedGender = (p && p.gender) ? p.gender.toLowerCase() : '';
            if (!detectedGender && p && p.denom) {
                if (p.denom.toLowerCase().includes('kobieta') || p.denom.toLowerCase().includes('chrześcijanka')) detectedGender = 'female';
                else if (p.denom.toLowerCase().includes('mężczyzna') || p.denom.toLowerCase().includes('chrześcijanin')) detectedGender = 'male';
            }

            await setDoc(presenceRef, {
                uid: u ? u.uid : null,
                displayName: (p && p.name) || (u && u.displayName) || 'Gość LUMINA',
                avatar: (p && p.avatar) || (u && u.photoURL) || 'lumina_icon.jpg',
                slug: (p && p.slug) || (u && u.uid) || '',
                isLoggedIn: !!u,
                gender: detectedGender || 'unknown',
                page: window.location.pathname.split('/').pop() || 'lumina.html',
                lastActive: serverTimestamp(),
                lastActiveMillis: Date.now()
            }, { merge: true });
        } catch(e) {
            if (e?.code === 'resource-exhausted') presenceNextPingAt = Date.now() + 300000;
        }
    };

    sendPing();
    presenceHeartbeatTimer = setInterval(sendPing, 60000);
    document.addEventListener('visibilitychange', sendPing);
    onAuthChange(sendPing);

    // Let the confirmed timestamp expire. Deleting one UID on tab close would
    // incorrectly mark a second active device offline and creates an extra write.
}

let sharedPresenceChannel = null;

export function subscribeToOnlinePresence(callback) {
    if (!db || typeof callback !== 'function') return () => {};
    if (!sharedPresenceChannel) sharedPresenceChannel = createPresenceChannel({
        document, now: Date.now, setInterval, clearInterval,
        listen: (receive, fail) => onSnapshot(query(collection(db, 'lumina_presence'),
            where('lastActive', '>=', new Date(Date.now() - 90000)),
            orderBy('lastActive', 'desc'), limit(200)),
            { includeMetadataChanges: true }, receive, fail)
    });
    return sharedPresenceChannel(callback);
}

// Auto-start heartbeat for every visitor
try {
    startPresenceHeartbeat();
} catch(e) {}


let _founderTelemetryProfilesCache = null;
let _founderTelemetryProfilesCacheTime = 0;

// Jedna reguła daty dla telemetrii (klient i Cloud Functions): RRRR-MM-DD w strefie Europe/Warsaw, niezależnie od strefy urządzenia/serwera.
const warsawDateStr = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export function listenToFounderTelemetry(callback) {
    if (!db || typeof callback !== 'function') return () => {};
    const warsawDateStr = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

    let unsubPresence = null;
    let isStopped = false;
    let currentProfilesStats = null;
    let lastOnlineMembers = [];
    let lastPresenceInfo = { available: false };

    const emitTelemetry = () => {
        if (isStopped) return;
        const onlineTotal = lastOnlineMembers.length;
        const onlineLoggedIn = onlineTotal;

        if (!currentProfilesStats) {
            callback({
                available: false,
                status: 'unavailable',
                isComplete: false,
                isPartial: false,
                isStale: false,
                error: 'Oczekiwanie na dane telemetrii...',
                totalMembers: null,
                sampleSize: null,
                onlineTotal,
                onlineLoggedIn,
                presenceAvailable: Boolean(lastPresenceInfo?.available),
                femaleCount: null,
                maleCount: null,
                femalePercent: null,
                malePercent: null,
                dayCounts: null,
                todayCount: null
            });
            return;
        }

        const femaleCount = currentProfilesStats.femaleCount;
        const maleCount = currentProfilesStats.maleCount;
        const hasGenderData = typeof femaleCount === 'number' && typeof maleCount === 'number';
        const sumGender = hasGenderData ? (femaleCount + maleCount) : 0;
        const femalePercent = sumGender > 0 ? Math.round((femaleCount / sumGender) * 100) : null;
        const malePercent = sumGender > 0 ? (100 - femalePercent) : null;

        // Dynamiczne wyliczenie todayCount na podstawie bieżącej daty w momencie emisji (prawidłowe po północy)
        const todayDateStr = warsawDateStr();
        let liveTodayCount = null;
        if (Array.isArray(currentProfilesStats.createdDates)) {
            liveTodayCount = currentProfilesStats.createdDates.filter(ts => {
                const d = new Date(ts);
                return !isNaN(d.getTime()) && warsawDateStr(d) === todayDateStr;
            }).length;
        } else if (typeof currentProfilesStats.todayCount === 'number') {
            liveTodayCount = (currentProfilesStats.statsDate === todayDateStr) ? currentProfilesStats.todayCount : 0;
        }

        callback({
            available: true,
            status: currentProfilesStats.isStale ? 'stale' : (currentProfilesStats.isPartial ? 'partial' : 'complete'),
            isComplete: Boolean(currentProfilesStats.isComplete),
            isPartial: Boolean(currentProfilesStats.isPartial),
            isStale: Boolean(currentProfilesStats.isStale),
            isFromCache: Boolean(currentProfilesStats.isFromCache),
            totalMembersVerified: Boolean(currentProfilesStats.totalMembersVerified),
            totalMembersFresh: Boolean(currentProfilesStats.totalMembersFresh),
            demographicsFresh: Boolean(currentProfilesStats.demographicsFresh),
            sampleSize: currentProfilesStats.sampleSize || null,
            cachedAt: currentProfilesStats.cachedAt || _founderTelemetryProfilesCacheTime || null,
            totalMembers: currentProfilesStats.totalMembers,
            onlineTotal,
            onlineLoggedIn,
            presenceAvailable: Boolean(lastPresenceInfo?.available),
            femaleCount,
            maleCount,
            femalePercent,
            malePercent,
            dayCounts: currentProfilesStats.dayCounts || null,
            todayCount: liveTodayCount
        });
    };

    // 1. Współdzielony, lekki nasłuch obecności w czasie rzeczywistym
    unsubPresence = subscribeToOnlinePresence((onlineMembers, presenceInfo) => {
        if (isStopped) return;
        lastOnlineMembers = onlineMembers || [];
        lastPresenceInfo = presenceInfo || { available: false };
        emitTelemetry();
    });

    // 2. Bezpieczny, buforowany odczyt metryk (ZERO COST / Zero-QA Architecture):
    //    Weryfikacja ilościowa: getCountFromServer(lumina_profiles) (1 odczyt indeksu)
    //    Priorytet 1: Zagregowany dokument lumina_stats/community_telemetry (1 odczyt dokumentu)
    //    Priorytet 2: Bezpieczny fallback do próbki ZAWSZE z twardym limit(100) (tylko demografia próbki,
    //                 BEZWZGLĘDNY ZAKAZ zapisu próbki do bazy lumina_stats!)
    const loadProfileStats = async () => {
        const now = Date.now();
        const todayDateStr = warsawDateStr();
        try {
            // A. Pamięć podręczna w procesie (RAM)
            if (_founderTelemetryProfilesCache && (now - _founderTelemetryProfilesCacheTime < 900000)) {
                currentProfilesStats = { ..._founderTelemetryProfilesCache, isFromCache: true };
                emitTelemetry();
                return;
            }

            // B. Pamięć podręczna w sessionStorage
            try {
                if (typeof sessionStorage !== 'undefined') {
                    const stored = sessionStorage.getItem('lumina_founder_telemetry_cache');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed && (now - parsed.timestamp < 900000) && parsed.stats) {
                            _founderTelemetryProfilesCache = parsed.stats;
                            _founderTelemetryProfilesCacheTime = parsed.timestamp;
                            currentProfilesStats = { ...parsed.stats, isFromCache: true };
                            emitTelemetry();
                            return;
                        }
                    }
                }
            } catch (_) {}

            // C. Sprawdzenie dokładnej liczby profili przez getCountFromServer (dokładnie 1 odczyt dokumentu w indeksie!)
            let serverExactCount = null;
            try {
                if (typeof getCountFromServer === 'function' && typeof collection === 'function') {
                    const countSnap = await getCountFromServer(collection(db, 'lumina_profiles'));
                    if (countSnap && countSnap.data && typeof countSnap.data().count === 'number') {
                        serverExactCount = countSnap.data().count;
                    }
                }
            } catch (cntErr) {
                // getCountFromServer może być niedostępne (błąd sieci/uprawnień) — przejdź dalej
            }

            // D. Sprawdzenie dokumentu zagregowanego lumina_stats/community_telemetry (1 odczyt dokumentu)
            let aggregatedDocSnap = null;
            try {
                if (typeof doc === 'function' && typeof getDoc === 'function') {
                    aggregatedDocSnap = await getDoc(doc(db, 'lumina_stats', 'community_telemetry'));
                }
            } catch (aggErr) {
                // Brak kolekcji lub uprawnień
            }

            if (aggregatedDocSnap && aggregatedDocSnap.exists && aggregatedDocSnap.exists()) {
                const aggData = aggregatedDocSnap.data() || {};
                const hasAggTotal = typeof aggData.totalMembers === 'number';
                const aggTotal = hasAggTotal ? aggData.totalMembers : null;

                // Punkt 1: Jeśli odczyt serverExactCount powiódł się, to on jest dokładnym wynikiem (nie Math.max!)
                const totalMembers = (serverExactCount !== null) ? serverExactCount : aggTotal;
                const totalMembersFresh = (serverExactCount !== null);
                const totalMembersVerified = (serverExactCount !== null);

                // Punkt 2: Rygorystyczna weryfikacja kompletności i aktualności (Zgodnie z audytem GPT):
                // 1) serverExactCount !== null jest wymagany, by potwierdzić zgodność z bazą (serverExactCount === null nie jest potwierdzeniem!)
                // 2) Data statsDate musi być dokładnie dzisiejsza (sama obecność createdDates nie świadczy o świeżości starego agregatu!)
                // 3) hasFullDemographics: kompletne pola femaleCount, maleCount i dayCounts
                const hasFullDemographics = (typeof aggData.femaleCount === 'number') &&
                                            (typeof aggData.maleCount === 'number') &&
                                            (aggData.dayCounts && typeof aggData.dayCounts === 'object');

                const countsMatchConfirmed = (serverExactCount !== null) && (serverExactCount === aggTotal);
                const isDateToday = (aggData.statsDate === todayDateStr);
                const isComplete = Boolean(hasFullDemographics && countsMatchConfirmed && isDateToday);
                const isPartial = !isComplete;
                const demographicsFresh = Boolean(hasFullDemographics && countsMatchConfirmed && isDateToday);
                const isStale = !isDateToday;

                currentProfilesStats = {
                    totalMembers,
                    totalMembersFresh,
                    totalMembersVerified,
                    demographicsFresh,
                    sampleSize: null,
                    femaleCount: typeof aggData.femaleCount === 'number' ? aggData.femaleCount : null,
                    maleCount: typeof aggData.maleCount === 'number' ? aggData.maleCount : null,
                    dayCounts: aggData.dayCounts || null,
                    createdDates: Array.isArray(aggData.createdDates) ? aggData.createdDates : null,
                    todayCount: typeof aggData.todayCount === 'number' ? aggData.todayCount : null,
                    statsDate: aggData.statsDate || null,
                    cachedAt: now,
                    isFromCache: false,
                    isComplete,
                    isPartial,
                    isStale
                };
            } else {
                // E. Fallback z limitem bezpieczeństwa (Zero-QA Guard): ZAWSZE z twardym limit(100)
                // Punkt 4: Usunięto nieograniczone getDocs(collection). Jeśli query/limit nie istnieją, rzucamy błąd.
                if (typeof query !== 'function' || typeof limit !== 'function') {
                    throw new Error('Niedostępny twardy limit bezpieczeństwa zapytań');
                }
                const snapshot = await getDocs(query(collection(db, 'lumina_profiles'), limit(100)));
                if (isStopped) return;

                const sampleSize = snapshot.size;

                // Punkt 3: Jeśli getCountFromServer() zawiódł, NIE przedstawiamy sampleSize jako całkowitej liczby członków!
                // Zwracamy totalMembers: null (brak zweryfikowanej liczby), a próbkę oznaczamy osobno.
                const totalMembers = (serverExactCount !== null) ? serverExactCount : null;
                const totalMembersFresh = (serverExactCount !== null);
                const totalMembersVerified = (serverExactCount !== null);

                let femaleCount = 0;
                let maleCount = 0;
                const dayCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
                const createdDates = [];
                const nowDate = new Date();

                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const g = (data.gender || '').toLowerCase();
                    const denom = (data.denom || '').toLowerCase();
                    const name = (data.name || '').toLowerCase();

                    if (g === 'female' || g === 'kobieta' || denom.includes('chrześcijanka') || denom.includes('kobieta')) {
                        femaleCount++;
                    } else if (g === 'male' || g === 'mężczyzna' || denom.includes('mężczyzna')) {
                        maleCount++;
                    } else if (name.endsWith('a') && !name.includes('kuba') && !name.includes('barnaba')) {
                        femaleCount++;
                    } else {
                        maleCount++;
                    }

                    let cDate = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
                    if (cDate && !isNaN(cDate.getTime())) {
                        const day = cDate.getDay();
                        dayCounts[day] = (dayCounts[day] || 0) + 1;
                        createdDates.push(cDate.getTime());
                    } else {
                        dayCounts[nowDate.getDay()] = (dayCounts[nowDate.getDay()] || 0) + 1;
                    }
                });

                currentProfilesStats = {
                    totalMembers,
                    totalMembersFresh,
                    totalMembersVerified,
                    demographicsFresh: false, // próbka 100 profili nie jest pełną demografią bazy
                    sampleSize,
                    femaleCount,
                    maleCount,
                    dayCounts,
                    createdDates,
                    statsDate: warsawDateStr(nowDate),
                    cachedAt: now,
                    isFromCache: false,
                    isComplete: false,
                    isPartial: true, // JAWNA FLAGA DANYCH CZĘŚCIOWYCH
                    isStale: false
                };
                // P0-1: ŻADNEGO ZAPISU DO lumina_stats/community_telemetry Z DANYCH CZĘŚCIOWYCH!
            }

            _founderTelemetryProfilesCache = currentProfilesStats;
            _founderTelemetryProfilesCacheTime = now;
            try {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('lumina_founder_telemetry_cache', JSON.stringify({
                        stats: currentProfilesStats,
                        timestamp: now
                    }));
                }
            } catch (_) {}

            emitTelemetry();
        } catch (e) {
            console.warn('[Telemetry] Błąd ładowania statystyk profili:', e);
            // Strażnik Backoff: ustawiamy czas cache na 'now', aby awaria NIE powodowała pętli ponowień!
            _founderTelemetryProfilesCacheTime = now;
            if (currentProfilesStats) {
                // Zachowaj ostatnie prawdziwe dane, oznaczając je jako nieaktualne (stale)
                currentProfilesStats.isStale = true;
                currentProfilesStats.isFromCache = true;
                emitTelemetry();
            } else {
                // Nigdy nie emituj fikcyjnych zer ani 50/50 — zgłoś jawnie stan niedostępności
                callback({
                    available: false,
                    status: 'unavailable',
                    isComplete: false,
                    isPartial: false,
                    isStale: false,
                    isFromCache: false,
                    totalMembersVerified: false,
                    totalMembersFresh: false,
                    demographicsFresh: false,
                    error: e?.message || 'Błąd odczytu danych',
                    totalMembers: null,
                    sampleSize: null,
                    onlineTotal: lastOnlineMembers.length,
                    onlineLoggedIn: lastOnlineMembers.length,
                    presenceAvailable: Boolean(lastPresenceInfo?.available),
                    femaleCount: null,
                    maleCount: null,
                    femalePercent: null,
                    malePercent: null,
                    dayCounts: null,
                    todayCount: null
                });
            }
        }
    };

    loadProfileStats();

    return () => {
        isStopped = true;
        if (typeof unsubPresence === 'function') unsubPresence();
    };
}

// ══════════════════════════════════════════════════════════════════════════
// 🎯 NOTY DLA AGENTA (DZIENNIK UWAG I ROZKAZÓW DOWÓDCY • @N)
// ══════════════════════════════════════════════════════════════════════════

export async function saveAgentNoteToCloud(noteData) {
    if (!noteData) return null;
    const noteId = noteData.id || ('note_' + Date.now());
    const payload = {
        ...noteData,
        id: noteId,
        createdAtTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    try {
        await setDoc(doc(db, 'lumina_agent_notes', noteId), payload, { merge: true });
        console.log(`LuminaDB: Nota dla Agenta [${noteId}] zapisana w chmurze Firestore! 🎯`);
    } catch(err) {
        console.warn('LuminaDB: Błąd zapisu noty w Firestore (zapisano lokalnie):', err.message);
    }
    // Backup w localStorage
    try {
        const local = JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
        const filtered = local.filter(n => n.id !== noteId);
        filtered.unshift({ ...noteData, id: noteId });
        localStorage.setItem('lumina_agent_notes', JSON.stringify(filtered));
    } catch(e) {}
    return payload;
}

export async function getAgentNotesFromCloud() {
    try {
        const q = query(collection(db, 'lumina_agent_notes'), orderBy('createdAtTimestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        const notes = [];
        snap.forEach(d => notes.push({ id: d.id, ...d.data() }));
        return notes;
    } catch(err) {
        console.warn('LuminaDB getAgentNotes error:', err);
        return JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
    }
}

export async function updateAgentNoteStatusInCloud(noteId, status = 'done') {
    if (!noteId) return;
    try {
        await updateDoc(doc(db, 'lumina_agent_notes', noteId), {
            status: status,
            resolvedAt: serverTimestamp()
        });
    } catch(err) {
        console.warn('LuminaDB updateAgentNoteStatus error:', err);
    }
    try {
        const local = JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
        const updated = local.map(n => n.id === noteId ? { ...n, status, resolvedAt: new Date().toISOString() } : n);
        localStorage.setItem('lumina_agent_notes', JSON.stringify(updated));
    } catch(e) {}
}

// Expose on window.LuminaDB
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.isMasterAdmin = isLuminaMasterAdmin;
window.LuminaDB.isCommunityAdmin = isCommunityAdmin;
window.LuminaDB.startPresenceHeartbeat = startPresenceHeartbeat;
window.LuminaDB.listenToFounderTelemetry = listenToFounderTelemetry;
window.LuminaDB.subscribeToOnlinePresence = subscribeToOnlinePresence;
window.LuminaDB.saveAgentNoteToCloud = saveAgentNoteToCloud;
window.LuminaDB.getAgentNotesFromCloud = getAgentNotesFromCloud;
window.LuminaDB.updateAgentNoteStatusInCloud = updateAgentNoteStatusInCloud;
window.LuminaDB.LUMINA_BADGES_CATALOG = LUMINA_BADGES_CATALOG;
window.LuminaDB.getUserBadges = getUserBadges;
window.LuminaDB.render3DBadgesGridHtml = render3DBadgesGridHtml;
window.LuminaDB.open3DBadgeDetailsModal = open3DBadgeDetailsModal;
window.LuminaDB.ensure3DBadgeModalInDom = ensure3DBadgeModalInDom;
window.LuminaDB.detectProfileGender = detectProfileGender;
window.LuminaDB.calculateProfileMatchScore = calculateProfileMatchScore;
window.LuminaDB.getHeuristicLinkMetadata = getHeuristicLinkMetadata;
window.LuminaDB.createRichOpenGraphCardHtml = createRichOpenGraphCardHtml;
window.LuminaDB.fetchLinkOpenGraphMetadata = fetchLinkOpenGraphMetadata;
window.LuminaDB.hydrateOpenGraphCards = hydrateOpenGraphCards;
window.LuminaDB.sendDirectMessageToCloud = sendDirectMessageToCloud;
window.LuminaDB.getChatId = getChatId;
window.sendDirectMessageToCloud = sendDirectMessageToCloud;

export function isProfileNew(p) {
    if (!p) return false;
    if (p.isNew === true) return true;
    
    let createdTime = 0;
    if (p.createdAt) {
        if (typeof p.createdAt === 'number') createdTime = p.createdAt;
        else if (typeof p.createdAt === 'string') createdTime = new Date(p.createdAt).getTime();
        else if (p.createdAt.seconds) createdTime = p.createdAt.seconds * 1000;
        else if (p.createdAt.toMillis) createdTime = p.createdAt.toMillis();
        else if (p.createdAt.toDate) createdTime = p.createdAt.toDate().getTime();
    } else if (p.createdAtTimestamp) {
        if (typeof p.createdAtTimestamp === 'number') createdTime = p.createdAtTimestamp;
        else if (p.createdAtTimestamp.seconds) createdTime = p.createdAtTimestamp.seconds * 1000;
        else if (p.createdAtTimestamp.toMillis) createdTime = p.createdAtTimestamp.toMillis();
        else if (p.createdAtTimestamp.toDate) createdTime = p.createdAtTimestamp.toDate().getTime();
    } else if (p.registeredAt) {
        if (typeof p.registeredAt === 'number') createdTime = p.registeredAt;
        else if (typeof p.registeredAt === 'string') createdTime = new Date(p.registeredAt).getTime();
    }

    if (createdTime > 0) {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const diff = Date.now() - createdTime;
        return (diff >= 0 && diff <= SEVEN_DAYS_MS);
    }

    // Default: If slug starts with u_ (self-registered user), consider new
    if (p.slug && p.slug.startsWith('u_')) return true;
    return false;
}

/* ══════════════════════════════════════════════════════════════════════════
   WSTAWIENNICTWO CZASU RZECZYWISTEGO: LUMINA LIVE PRAYER (JOMA-D015)
   „Modlę się za Ciebie TERAZ” — haptyka, złoty rozbłysk i wstawiennictwo live
   ══════════════════════════════════════════════════════════════════════════ */
let _prayerBroadcastChan = null;
try {
    if (typeof BroadcastChannel !== 'undefined') {
        _prayerBroadcastChan = new BroadcastChannel('lumina_prayer_network');
    }
} catch (e) {}

export const LuminaLivePrayer = {
    _listeners: new Set(),
    _activeFloatingQueue: [],
    _initialized: false,

    init() {
        if (typeof window === 'undefined') return;
        if (this._initialized) return;
        this._initialized = true;

        if (_prayerBroadcastChan) {
            _prayerBroadcastChan.onmessage = (evt) => {
                if (evt.data && evt.data.type === 'PRAY_NOW') {
                    this._handleIncomingPrayer(evt.data.payload);
                }
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key === 'lumina_prayer_event_broadcast' && e.newValue) {
                try {
                    const payload = JSON.parse(e.newValue);
                    this._handleIncomingPrayer(payload);
                } catch (err) {}
            }
        });
    },

    subscribe(callback) {
        this.init();
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    },

    triggerPrayNow(postId, targetAuthor, prayerUser) {
        this.init();
        const currentProfile = getCurrentProfile();
        const currentUser = getCurrentUser();
        const prayerName = prayerUser?.name || currentProfile?.name || currentUser?.displayName || 'Brat/Siostra w Chrystusie';
        const prayerAvatar = prayerUser?.avatar || currentProfile?.avatar || currentUser?.photoURL || 'lumina_icon.jpg';

        const payload = {
            id: 'pray_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            postId: postId,
            targetAuthor: (targetAuthor || '').trim(),
            prayerName: prayerName,
            prayerAvatar: prayerAvatar,
            timestamp: Date.now()
        };

        // Zapisz lokalnie w historii modlitw z 60-sekundowym oknem aktywności
        try {
            let active = JSON.parse(localStorage.getItem('lumina_active_prayers_map') || '{}');
            const now = Date.now();
            // Czyść wpisy starsze niż 60s
            for (const pid in active) {
                active[pid] = (active[pid] || []).filter(t => (now - t) < 60000);
                if (!active[pid].length) delete active[pid];
            }
            if (!active[postId]) active[postId] = [];
            active[postId].push(now);
            localStorage.setItem('lumina_active_prayers_map', JSON.stringify(active));
        } catch (e) {}

        // 1. Haptyka smartfona (wibracja delikatna modlitewna)
        this.triggerHapticPulse();

        // 2. Złoty Rozbłysk Wstawiennictwa na ekranie
        this.showGoldenPulse();

        // 3. Pływające cząstki wiary 🕊️✨
        this.emitFaithParticles();

        // 4. Emisja przez kanał BroadcastChannel & LocalStorage
        try {
            if (_prayerBroadcastChan) {
                _prayerBroadcastChan.postMessage({ type: 'PRAY_NOW', payload });
            }
            localStorage.setItem('lumina_prayer_event_broadcast', JSON.stringify(payload));
        } catch (e) {}

        // Powiadom lokalnych subskrybentów
        this._listeners.forEach(cb => {
            try { cb(payload, true); } catch (e) {}
        });

        return payload;
    },

    getLivePrayerCount(postId) {
        try {
            const active = JSON.parse(localStorage.getItem('lumina_active_prayers_map') || '{}');
            const now = Date.now();
            const list = (active[postId] || []).filter(t => (now - t) < 60000);
            return Math.max(1, list.length);
        } catch (e) {
            return 1;
        }
    },

    triggerHapticPulse() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate([70, 40, 90]);
            } catch (e) {}
        }
    },

    showGoldenPulse() {
        if (typeof document === 'undefined') return;
        const pulse = document.createElement('div');
        pulse.className = 'lumina-prayer-golden-pulse';
        document.body.appendChild(pulse);
        setTimeout(() => {
            if (pulse.parentNode) pulse.parentNode.removeChild(pulse);
        }, 1650);
    },

    emitFaithParticles(originX, originY) {
        if (typeof document === 'undefined') return;
        const emojis = ['🕊️', '✨', '🙏', '💛', '🕊️'];
        const startX = originX || (window.innerWidth / 2);
        const startY = originY || (window.innerHeight * 0.65);

        emojis.forEach((emoji, i) => {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-faith-particle';
                el.textContent = emoji;
                el.style.left = (startX + (Math.random() * 80 - 40)) + 'px';
                el.style.top = (startY + (Math.random() * 40 - 20)) + 'px';
                el.style.setProperty('--dx', (Math.random() * 100 - 50) + 'px');
                document.body.appendChild(el);
                setTimeout(() => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 2000);
            }, i * 140);
        });
    },

    _handleIncomingPrayer(payload) {
        if (!payload) return;
        const currentProfile = getCurrentProfile();
        const currentUser = getCurrentUser();
        const mySlug = (currentProfile?.slug || currentUser?.slug || '').toLowerCase();
        const myName = (currentProfile?.name || currentUser?.displayName || '').toLowerCase();
        const targetAuthor = (payload.targetAuthor || '').toLowerCase();

        // Jeśli to ja jestem autorem lub post jest mój:
        const isForMe = (mySlug && targetAuthor.includes(mySlug)) || (myName && targetAuthor.includes(myName));

        if (isForMe) {
            this.triggerHapticPulse();
            this.showGoldenPulse();
            this.emitFaithParticles();

            // Pokaż uroczysty baner
            if (typeof showInAppChatBanner === 'function') {
                showInAppChatBanner({
                    title: '🕊️ Wstawiennictwo Czasu Rzeczywistego',
                    body: `${payload.prayerName} wstawia się za Tobą w modlitwie dokładnie w tej chwili! Nie jesteś sam(a) w Panu.`,
                    avatar: payload.prayerAvatar || 'lumina_icon.jpg',
                    senderName: payload.prayerName,
                    type: 'prayer'
                });
            } else if (typeof window.showToast === 'function') {
                window.showToast(`🕊️ ${payload.prayerName} wstawia się za Tobą w modlitwie dokładnie w tej chwili! ✨`);
            }
        }

        // Powiadom wszystkich subskrybentów
        this._listeners.forEach(cb => {
            try { cb(payload, false); } catch (e) {}
        });
    }
};

/* ══════════════════════════════════════════════════════════════════════════
   SYNC-FAITH LOUNGE: WSPÓLNE SŁUCHANIE & OGLĄDANIE DLA DWOJGA (JOMA-D015)
   Zsynchronizowany strumień Radia CC, CCTV24 i Kursu Małżeńskiego w czacie
   ══════════════════════════════════════════════════════════════════════════ */
let _syncBroadcastChan = null;
try {
    if (typeof BroadcastChannel !== 'undefined') {
        _syncBroadcastChan = new BroadcastChannel('lumina_sync_faith_lounge');
    }
} catch (e) {}

export const KURS_MALZENSKI_EPISODES = [
    { num: 1, title: 'Cztery wielkie sekrety rodzinnego szczęścia', id: 'OWKwixyQq2c' },
    { num: 2, title: 'Czy to rzeczywiście miłość?', id: 'gtGiaco7rwI' },
    { num: 3, title: 'Zasady dobrej rodzinnej łączności', id: 'FtY7zvLNK0A' },
    { num: 4, title: 'Co zrobić z gniewem i złością?', id: 'lqQ1f8L9F_s' },
    { num: 5, title: 'Jak rozwiązywać konflikty?', id: 'g2T49iFvdT8' },
    { num: 6, title: 'Jak radzić sobie ze stresem i depresją?', id: 'dF5-cQ7bN0Q' },
    { num: 7, title: 'Pieniądze w rodzinie', id: 'W6JgRz9kF_o' },
    { num: 8, title: 'Jak wychowywać dzieci?', id: 'bZ3nJcQ-21w' },
    { num: 9, title: 'Gdy dziecko dorasta', id: '2J2F7L-6kQ0' },
    { num: 10, title: 'Gdy małżeństwo przeżywa kryzys', id: 'p5l-qHk6j4Y' },
    { num: 11, title: 'Jak przebaczać i zacząć od nowa?', id: 'rV1d1JzQh9o' },
    { num: 12, title: 'Seksualność w małżeństwie', id: 'u8hZ_k1bN5g' },
    { num: 13, title: 'Wierność i zaufanie', id: 'qZ8x-bM6K78' },
    { num: 14, title: 'Duchowy wymiar rodziny', id: 'n7kL_w8B9g0' },
    { num: 15, title: 'Rola męża i ojca', id: 'm4nZ_j5K6h8' },
    { num: 16, title: 'Rola żony i matki', id: 'v9pL_d7Q1s4' },
    { num: 17, title: 'Jak budować dom pełen miłości?', id: 't6kM_z4V1j0' },
    { num: 18, title: 'Boże błogosławieństwo dla rodziny', id: 'x5nL_k9B3w8' }
];

export const LuminaSyncLounge = {
    _listeners: new Set(),
    _reactionListeners: new Set(),
    
    init() {
        if (typeof window === 'undefined') return;
        if (this._initialized) return;
        this._initialized = true;

        if (_syncBroadcastChan) {
            _syncBroadcastChan.onmessage = (evt) => {
                if (!evt.data) return;
                if (evt.data.type === 'SYNC_STATE') {
                    this._listeners.forEach(cb => {
                        try { cb(evt.data.chatId, evt.data.state, false); } catch(e) {}
                    });
                } else if (evt.data.type === 'SYNC_REACTION') {
                    this._reactionListeners.forEach(cb => {
                        try { cb(evt.data.chatId, evt.data.reaction); } catch(e) {}
                    });
                }
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('lumina_sync_state_') && e.newValue) {
                const chatId = e.key.replace('lumina_sync_state_', '');
                try {
                    const state = JSON.parse(e.newValue);
                    this._listeners.forEach(cb => {
                        try { cb(chatId, state, false); } catch(e) {}
                    });
                } catch(err) {}
            } else if (e.key === 'lumina_sync_reaction_broadcast' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    this._reactionListeners.forEach(cb => {
                        try { cb(data.chatId, data.reaction); } catch(e) {}
                    });
                } catch(err) {}
            }
        });
    },

    subscribeState(callback) {
        this.init();
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    },

    subscribeReactions(callback) {
        this.init();
        this._reactionListeners.add(callback);
        return () => this._reactionListeners.delete(callback);
    },

    broadcastState(chatId, state) {
        this.init();
        const payload = {
            ...state,
            updatedAt: Date.now()
        };
        try {
            localStorage.setItem('lumina_sync_state_' + chatId, JSON.stringify(payload));
            if (_syncBroadcastChan) {
                _syncBroadcastChan.postMessage({ type: 'SYNC_STATE', chatId, state: payload });
            }
        } catch(e) {}

        this._listeners.forEach(cb => {
            try { cb(chatId, payload, true); } catch(e) {}
        });
        return payload;
    },

    getState(chatId) {
        try {
            const raw = localStorage.getItem('lumina_sync_state_' + chatId);
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return {
            tab: 'radio',
            isPlaying: false,
            courseEpisode: 1,
            updatedAt: Date.now()
        };
    },

    sendReaction(chatId, emoji, label) {
        this.init();
        const currentProfile = getCurrentProfile();
        const currentUser = getCurrentUser();
        const senderName = currentProfile?.name || currentUser?.displayName || 'Rozmówca';

        const reaction = {
            id: 'react_' + Date.now(),
            emoji: emoji,
            label: label,
            senderName: senderName,
            timestamp: Date.now()
        };

        try {
            if (_syncBroadcastChan) {
                _syncBroadcastChan.postMessage({ type: 'SYNC_REACTION', chatId, reaction });
            }
            localStorage.setItem('lumina_sync_reaction_broadcast', JSON.stringify({ chatId, reaction, _ts: Date.now() }));
        } catch(e) {}

        this._reactionListeners.forEach(cb => {
            try { cb(chatId, reaction); } catch(e) {}
        });

        // Wstaw animację cząstki wiary
        if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
            LuminaLivePrayer.emitFaithParticles();
        }

        return reaction;
    }
};

// Expose on window.LuminaDB
window.LuminaDB.LuminaLivePrayer = LuminaLivePrayer;
window.LuminaDB.LuminaSyncLounge = LuminaSyncLounge;
window.LuminaDB.KURS_MALZENSKI_EPISODES = KURS_MALZENSKI_EPISODES;
window.LuminaLivePrayer = LuminaLivePrayer;
window.LuminaSyncLounge = LuminaSyncLounge;

// ══════════════════════════════════════════════════════════════════════════
// 🕊️ LUMINA MODERN COMMENTS ENGINE & NATURAL MISSION DIALOGUE (JOMA-COMM-V2)
// ══════════════════════════════════════════════════════════════════════════

let _commentsBroadcastChan = null;
try {
    if (typeof BroadcastChannel !== 'undefined') {
        _commentsBroadcastChan = new BroadcastChannel('lumina_comments_channel');
    }
} catch(e) {}

export const LuminaCommentsEngine = {
    _commentsKeyPrefix: 'lumina_comments_v2_',

    // Baza zaufanych profili misyjnych do naturalnego dialogu
    _trustedMissionProfiles: [
        { slug: 'andrzejthiel', name: 'Andrzej Thiel', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
        { slug: 'jolawojcik', name: 'Jola Wójcik', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Wstawiennik LUMINA' },

        { slug: 'zofiadudek', name: 'Zofia Dudek', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Mądrość & Modlitwa' },
        { slug: 'ccmen', name: 'CC MEN', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota' },
        { slug: 'ccwomen', name: 'CC WOMEN', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kobieca Formacja' },
        { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
        { slug: 'pawelmurawski', name: 'Paweł Murawski', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
        { slug: 'magdalena', name: 'Magdalena', avatar: 'avatar_magdalena.png', badge: '🕊️ Poznań' }
    ],

    // Szablony naturalnych wypowiedzi budujących wiarę
    _dialogueTemplates: {
        devotional: [
            "Amen! Chwała Bogu za to słowo na dzisiejszy dzień. Niech Boży pokój napełnia dziś każde serce i każdą rodzinę. 🕊️✨",
            "Dziękuję za to poranne umocnienie! Słowo Boże ma niesamowitą moc przemiany myślenia. Błogosławię całą społeczność! ❤️🙏",
            "Potężna prawda, która stawia na nogi w trudnym czasie. Chwała Panu Jezusowi! Stoję z Wami w braterskiej modlitwie. ✝️🛡️",
            "Cudowna, głęboka refleksja. Warto zatrzymać się w tym zabieganym świecie i oddać wszystko Stwórcy. Błogosławionego dnia! 🌿🌸",
            "Tak jest! Prawdziwa siła to wierność Bogu każdego dnia bez kompromisów. Chwała Najwyższemu! 🛡️⚡",
            "Dla wszystkich małżeństw i par polecam gorąco ten wspaniały biblijny wykład Romana Chałupki: https://polskieradio.cc/randki-malzenstwo - niesamowicie buduje relacje! ❤️💍",
            "Przepiękne słowa pełne nadziei. Polecam też to poruszające nagranie Słowa Bożego: https://www.youtube.com/watch?v=OWKwixyQq2c 🌸🕊️"
        ],
        prayer: [
            "Dołączam do modlitwy całym sercem! Jezus jest z Tobą w tej sytuacji i On ma ostatnie słowo. Trwaj w pokoju! 🙏🕊️",
            "Staję w wyłomie razem z Tobą, bracie/siostro. Żaden problem nie jest za duży dla naszego Pana! 🛡️✝️",
            "Wstawiam się w Imieniu Jezusa. Wierzymy i ufamy Bożej obietnicy uzdrowienia i ratunku! ✨🙏",
            "Pamiętajmy o narodowym wstawiennictwie na żywo: https://polskieradio.cc/modlitwa - módlmy się razem w czasie rzeczywistym! 🕊️🛡️",
            "Nie jesteś sam w tej walce. Nasza wspólnota łączy się w modlitwie. Bóg już działa! ❤️🕊️"
        ],
        media: [
            "Wspaniały klimat uwielbienia! Niech ta muzyka i Słowo zanoszą chwałę przed sam Boży Tron. Podajemy dalej! 🎬📖",
            "A na wieczorne umocnienie polecam wartościowe kino chrześcijańskie bez reklam: https://polskieradio.cc/vod - poruszające filmy wiary! 🍿✨",
            "Ta stacja wnosi tyle pokoju i światła do mojego domu. Słucham podczas codziennych obowiązków i odpoczynku. Dziękuję! 🎵🌿",
            "Doskonała jakość i niesamowite namaszczenie. Niech Bóg błogosławi całą redakcję Christian Culture! 📻✨"
        ],
        general: [
            "Piękne świadectwo Bożej obecności w codzienności! Dziękuję za podzielenie się tym na Tablicy. Błogosławieństwa! ✨🕊️",
            "Bardzo cenna i inspirująca myśl. Wzrastajmy razem w prawdzie i miłości Chrystusa. Pozdrawiam serdecznie! ❤️",
            "Bóg jest dobry w każdym czasie. Niech Jego łaska towarzyszy nam wszystkim przez cały ten tydzień! 🙏🌿",
            "Świetnie to ująłeś! Żywa wiara wyraża się w konkretnych czynach i życzliwości wobec drugiego człowieka. ✝️✨"
        ]
    },

    getCommentsCss() {
        return ".comments-section-v2displaynonebackgroundrgba(814280.96)backdrop-filterblur(14px)-webkit-backdrop-filterblur(14px)border-top1px solid rgba(212169740.22)border-radius0 0 20px 20pxpadding16px 18px 20pxbox-sizingborder-boxwidth100%animationcommentsSlideDown 0.26s cubic-bezier(0.1610.31).comments-section-v2.opendisplayblock@keyframes commentsSlideDownfromopacity0transformtranslateY(-8px)toopacity1transformtranslateY(0).comment-faith-chips-bardisplayflexgap8pxoverflow-xautopadding-bottom10pxmargin-bottom12pxscrollbar-widthnonebox-sizingborder-boxwidth100%.comment-faith-chips-bar-webkit-scrollbardisplaynone.comment-faith-chipbackgroundrgba(2552552550.06)border1px solid rgba(212169740.3)color#f1f5f9border-radius20pxpadding6px 13pxfont-size0.78remfont-weight600white-spacenowrapcursorpointerdisplayinline-flexalign-itemscentergap6pxtransitionall 0.2s cubic-bezier(0.20.80.21)user-selectnone.comment-faith-chiphoverbackgroundrgba(212169740.18)border-color#facc15color#ffftransformtranslateY(-1px).comment-faith-chipactivetransformscale(0.96).comment-input-composer-v2displayflexgap10pxalign-itemsflex-startmargin-bottom18pxbackgroundrgba(2552552550.03)padding10px 12pxborder-radius16pxborder1px solid rgba(2552552550.08)box-sizingborder-boxwidth100%.comment-my-avatarwidth38pxheight38pxborder-radius50%object-fitcoverborder1.5px solid rgba(212169740.4)flex-shrink0.comment-input-wrapflex1positionrelativedisplayflexflex-directioncolumngap6pxbox-sizingborder-boxmin-width0.comment-textarea-v2width100%box-sizingborder-boxbackgroundrgba(1523420.85)border1px solid rgba(2552552550.16)border-radius12pxpadding10px 14pxcolor#f8fafcfont-size0.88remfont-familyinheritresizenonemin-height44pxmax-height120pxoutlinenoneline-height1.45transitionborder-color 0.2sbox-shadow 0.2s.comment-textarea-v2focusborder-color#facc15box-shadow0 0 0 2px rgba(250204210.2).comment-submit-bardisplayflexjustify-contentspace-betweenalign-itemscenter.comment-replying-to-badgefont-size0.74remcolor#38bdf8displayflexalign-itemscentergap4px.comment-cancel-reply-btnbackgroundnonebordernonecolor#f87171cursorpointerfont-size0.72rempadding2px 4px.comment-submit-btn-v2backgroundlinear-gradient(135deg#d4a94a#facc15)color#0b1120bordernonefont-weight800font-size0.82rempadding8px 18pxborder-radius24pxcursorpointerdisplayinline-flexalign-itemscentergap6pxbox-shadow0 4px 12px rgba(212169740.35)transitionall 0.2smargin-leftautomin-height38px.comment-submit-btn-v2hovertransformtranslateY(-1px)box-shadow0 6px 16px rgba(212169740.5).comment-submit-btn-v2activetransformscale(0.97).comments-list-v2displayflexflex-directioncolumngap12px.comment-item-v2displayflexgap10pxpositionrelativetransitionbackground-color 0.2s.comment-item-v2.pinned-commentbackgroundrgba(250204210.05)border1px solid rgba(250204210.25)border-radius14pxpadding10pxbox-shadow0 2px 10px rgba(250204210.08).comment-avatar-linkflex-shrink0.comment-avatar-v2width34pxheight34pxborder-radius50%object-fitcoverborder1.5px solid rgba(2552552550.12).comment-body-v2flex1min-width0.comment-bubble-v2backgroundrgba(2552552550.05)border1px solid rgba(2552552550.08)border-radius14pxpadding9px 13pxcolor#f1f5f9font-size0.85remline-height1.5positionrelative.comment-header-rowdisplayflexalign-itemscenterjustify-contentspace-betweenmargin-bottom4pxgap8px.comment-author-namefont-weight700color#ffftext-decorationnonefont-size0.86remdisplayinline-flexalign-itemscentergap6px.comment-author-namehovercolor#facc15.comment-badge-pillfont-size0.65remfont-weight700padding1px 7pxborder-radius10pxbackgroundrgba(212169740.18)border1px solid rgba(212169740.35)color#fef08aletter-spacing0.3px.comment-pinned-indicatorfont-size0.68remfont-weight800color#facc15displayinline-flexalign-itemscentergap4pxmargin-bottom4px.comment-time-v2font-size0.72remcolor#94a3b8white-spacenowrap.comment-edited-tagfont-size0.68remcolor#94a3b8font-styleitalicmargin-left4px.comment-text-contentcolor#e2e8f0word-breakbreak-word.comment-actions-bar-v2displayflexalign-itemscentergap12pxmargin-top5pxpadding-left4px.comment-action-linkbackgroundnonebordernonecolor#94a3b8font-size0.75remfont-weight600cursorpointerdisplayinline-flexalign-itemscentergap4pxpadding2px 4pxtransitioncolor 0.15stransform 0.15s.comment-action-linkhovercolor#fff.comment-action-link.active-likecolor#f43f5e.comment-action-link.active-amencolor#facc15font-weight800.comment-more-btnbackgroundnonebordernonecolor#64748bcursorpointerpadding4px 6pxfont-size0.85remborder-radius6pxtransitionall 0.2smargin-leftauto.comment-more-btnhovercolor#cbd5e1backgroundrgba(2552552550.08).comment-dropdown-menupositionabsoluteright10pxtop30pxbackground#0f172aborder1px solid rgba(2552552550.15)border-radius12pxbox-shadow0 10px 25px rgba(0000.6)padding6pxz-index50displaynoneflex-directioncolumnmin-width140px.comment-dropdown-menu.opendisplayflex.comment-dropdown-itembackgroundnonebordernonecolor#cbd5e1font-size0.78rempadding7px 10pxtext-alignleftcursorpointerborder-radius8pxdisplayflexalign-itemscentergap8pxtransitionbackground 0.15s.comment-dropdown-itemhoverbackgroundrgba(2552552550.08)color#fff.comment-dropdown-item.item-dangercolor#f87171.comment-dropdown-item.item-dangerhoverbackgroundrgba(23968680.15).comment-hidden-placeholderbackgroundrgba(2552552550.03)border1px dashed rgba(2552552550.15)border-radius10pxpadding8px 12pxfont-size0.75remcolor#94a3b8displayflexalign-itemscenterjustify-contentspace-betweengap8px.btn-reveal-hiddenbackgroundnoneborder1px solid rgba(2552552550.2)color#facc15font-size0.72rempadding2px 8pxborder-radius10pxcursorpointer.comment-inline-edit-wrapdisplayflexflex-directioncolumngap8pxmargin-top4px.comment-inline-edit-textareawidth100%backgroundrgba(1523420.95)border1px solid #facc15border-radius10pxpadding8px 10pxcolor#ffffont-size0.85remfont-familyinheritresizeverticalmin-height50px.comment-inline-edit-buttonsdisplayflexjustify-contentflex-endgap6px.comment-edit-btn-savebackground#facc15color#0b1120bordernonefont-weight700font-size0.74rempadding4px 12pxborder-radius14pxcursorpointer.comment-edit-btn-cancelbackgroundrgba(2552552550.1)color#cbd5e1bordernonefont-size0.74rempadding4px 10pxborder-radius14pxcursorpointer.comment-active-linkcolor#38bdf8text-decorationunderlinetext-underline-offset3pxfont-weight600displayinline-flexalign-itemscentergap4pxword-breakbreak-alltransitioncolor 0.2s ease.comment-active-linkhovercolor#7dd3fctext-decorationunderline.comment-untrusted-linkcolor#94a3b8text-decorationnonefont-size0.84remword-breakbreak-all.comment-preview-cardmargin-top10pxbackgroundrgba(1523420.85)border1px solid rgba(212169740.35)border-radius14pxoverflowhiddendisplayflexflex-directioncolumnbox-shadow0 4px 16px rgba(0000.4)transitiontransform 0.2s easeborder-color 0.2s easemax-width100%box-sizingborder-box.comment-preview-cardhoverborder-colorrgba(250204210.7).comment-preview-thumb-wrappositionrelativewidth100%aspect-ratio16 / 9max-height180pxbackground#000overflowhidden.comment-preview-thumbwidth100%height100%object-fitcoverdisplayblocktransitiontransform 0.3s ease.comment-preview-cardhover .comment-preview-thumbtransformscale(1.03).comment-preview-play-overlaypositionabsolutetop50%left50%transformtranslate(-50%-50%)backgroundrgba(0000.65)border2px solid #facc15color#fffwidth46pxheight46pxborder-radius50%displayflexalign-itemscenterjustify-contentcenterfont-size1.1rembox-shadow0 0 16px rgba(250204210.5)cursorpointertransitionall 0.2s ease.comment-preview-cardhover .comment-preview-play-overlaybackground#facc15color#0b1120transformtranslate(-50%-50%) scale(1.1).comment-preview-bodypadding10px 14px 12pxdisplayflexflex-directioncolumngap4px.comment-preview-badge-rowdisplayflexalign-itemscenterjustify-contentspace-betweenmargin-bottom2px.comment-preview-badgefont-size0.68remfont-weight800text-transformuppercaseletter-spacing0.5pxpadding2px 8pxborder-radius6pxbackgroundrgba(212169740.2)color#fef08aborder1px solid rgba(212169740.4)displayinline-flexalign-itemscentergap4px.comment-preview-badge.badge-youtubebackgroundrgba(23968680.2)color#fca5a5border-colorrgba(23968680.4).comment-preview-domainfont-size0.7remcolor#94a3b8.comment-preview-titlefont-size0.88remfont-weight700color#fffline-height1.35margin0.comment-preview-descfont-size0.78remcolor#cbd5e1line-height1.4margin0display-webkit-box-webkit-line-clamp2-webkit-box-orientverticaloverflowhidden.comment-preview-footermargin-top6pxdisplayflexalign-itemscenterjustify-contentflex-endgap8px.comment-preview-btnbackgroundlinear-gradient(135deg#d4a94a#facc15)color#0b1120bordernonefont-weight700font-size0.74rempadding5px 12pxborder-radius14pxcursorpointerdisplayinline-flexalign-itemscentergap5pxtext-decorationnonetransitionfilter 0.2s easetransform 0.1s ease.comment-preview-btnhoverfilterbrightness(1.1)transformtranslateY(-1px).comment-yt-embed-wrappositionrelativewidth100%aspect-ratio16 / 9min-height180pxborder-radius12pxoverflowhiddenmargin-top8pxborder1px solid rgba(250204210.3)box-shadow0 4px 16px rgba(0000.5).comment-yt-embed-wrap iframewidth100%height100%bordernonedisplayblock";
    },

    ensureStylesInjected() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('lumina-comments-styles-v2')) return;
        try {
            const styleEl = document.createElement('style');
            styleEl.id = 'lumina-comments-styles-v2';
            styleEl.textContent = this.getCommentsCss();
            document.head.appendChild(styleEl);
        } catch(e) {}
    },

    _isAttaching: false,

    autoAttachToAllFeedCards() {
        if (typeof document === 'undefined' || this._isAttaching) return;
        this._isAttaching = true;
        try {
            this.ensureStylesInjected();
            const cards = document.querySelectorAll('.feed-card:not([data-comments-attached]), .feed-post-card:not([data-comments-attached]), .post-card:not([data-comments-attached]), article.feed-post-card:not([data-comments-attached]), article:not([data-comments-attached])');
            cards.forEach(card => {
                const footer = card.querySelector('.post-actions-bar, .post-actions, .post-footer, .feed-actions, .post-act-bar');
                if (!footer && !card.classList.contains('feed-card') && !card.classList.contains('feed-post-card') && !card.classList.contains('post-card')) {
                    return; // pomin karty bez paska akcji
                }
                card.setAttribute('data-comments-attached', 'true');
                let rawId = card.id || card.getAttribute('data-post-id');
                if (!rawId) {
                    const snippet = (card.textContent || '').trim().substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
                    rawId = 'post_gen_' + (snippet || 'card') + '_' + Math.abs((card.textContent || '').length);
                    card.id = rawId;
                }
                const postId = rawId.startsWith('post_') ? rawId.replace(/^post_/, '') : rawId;
                const targetSecId = 'comments_' + rawId;
                const fallbackSecId = 'comments_' + postId;

                let drawer = card.querySelector('.comments-section-v2');
                if (!drawer) {
                    drawer = document.createElement('div');
                    drawer.className = 'comments-section-v2';
                    drawer.id = targetSecId;
                    card.appendChild(drawer);
                }

                if (!card.querySelector('.action-comments')) {
                    if (footer) {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'post-action-btn action-comments post-act-btn';
                        btn.title = 'Komentarze';
                        const count = this.getCommentCount(rawId) || this.getCommentCount(postId) || 2;
                        btn.innerHTML = `<i class="fa-solid fa-comment-dots"></i><span class="btn-text"> Komentarze (${count})</span>`;
                        btn.setAttribute('onclick', `toggleComments('${rawId}')`);
                        btn.onclick = (e) => {
                            if (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                            this.toggleComments(rawId);
                        };

                        const shareOrMsg = footer.querySelector('.action-share, [onclick*="share"], [onclick*="openMessageModal"], .btn-action-secondary');
                        if (shareOrMsg) {
                            footer.insertBefore(btn, shareOrMsg);
                        } else {
                            footer.appendChild(btn);
                        }
                    }
                }
            });
        } catch(err) {
            console.warn('[LuminaComments] autoAttach note:', err);
        } finally {
            this._isAttaching = false;
        }
    },

    init() {
        this.ensureStylesInjected();
        this.autoAttachToAllFeedCards();

        if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
            let debounceTimer = null;
            const observer = new MutationObserver((mutations) => {
                if (this._isAttaching) return;
                let hasRelevantNodes = false;
                for (const m of mutations) {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === 1 && !n.classList?.contains('comments-section-v2') && !n.classList?.contains('comment-item-v2')) {
                            hasRelevantNodes = true;
                            break;
                        }
                    }
                    if (hasRelevantNodes) break;
                }
                if (!hasRelevantNodes) return;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.autoAttachToAllFeedCards();
                }, 300);
            });
            const target = document.body || document.documentElement;
            if (target) {
                observer.observe(target, { childList: true, subtree: true });
            }
        }
        if (_commentsBroadcastChan && !this._hasBroadcastListener) {
            this._hasBroadcastListener = true;
            _commentsBroadcastChan.onmessage = (ev) => {
                const data = ev.data;
                if (data && data.postId) {
                    this.updatePostCommentCountBadge(data.postId);
                    const container = document.getElementById('comments_' + data.postId);
                    if (container && container.classList.contains('open')) {
                        this.refreshCommentsList(data.postId);
                    }
                }
            };
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (ev) => {
                if (ev.key && ev.key.startsWith(this._commentsKeyPrefix)) {
                    const postId = ev.key.replace(this._commentsKeyPrefix, '');
                    this.updatePostCommentCountBadge(postId);
                    const container = document.getElementById('comments_' + postId);
                    if (container && container.classList.contains('open')) {
                        this.refreshCommentsList(postId);
                    }
                }
            });
        }
    },

    getCurrentCommenter() {
        const curProfile = (typeof getCurrentProfile === 'function' ? getCurrentProfile() : null);
        const curUser = (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

        let name = curProfile?.name || curUser?.displayName || 'Gość LUMINA';
        let slug = curProfile?.slug || (curUser?.email ? curUser.email.split('@')[0] : 'user');
        let avatar = curProfile?.avatar || curUser?.photoURL || 'lumina_icon.jpg';
        let badge = curProfile?.badge || curProfile?.job || 'Społeczność LUMINA';

        // Auto-detect Cezary Rogowski if admin
        const isAdmin = detectLuminaOfficialIdentity(curUser) === 'cezary';
        if (isAdmin) {
            name = 'Cezary Rogowski';
            slug = 'cezaryrgowski';
            avatar = 'avatar_cezary_official.jpg';
            badge = '👑 Założyciel CC';
        } else if (detectLuminaOfficialIdentity(curUser) === 'wioletta') {
            name = 'Wioletta Rogowska';
            slug = 'wiolettarogowska';
            avatar = 'avatar_wioletta_official.jpg';
            badge = '🌸 Współzałożycielka CC';
        }

        return { name, slug, avatar, badge };
    },

    // Pancerny Strażnik Tożsamości Komentarzy (Identity Guard)
    _sanitizeComment(c) {
        if (!c) return c;
        const authorName = (c.author || '').toLowerCase();
        const authorSlug = (c.authorSlug || '').toLowerCase();
        // 🛡️ STRAŻNIK: zdjęcie autora wyłącznie po dokładnym slugu (imię nie przesądza o tożsamości)
        const isCezary = (authorSlug === 'cezaryrgowski');
        const isJola = (authorSlug === 'jolawojcik');
        const isZofia = (authorSlug === 'zofiadudek');
        const isZbyszek = (authorSlug === 'zbyszekgieron');
        const isAndrzejThiel = (authorSlug === 'andrzejthiel');
        const isAndrzejHamera = (authorSlug === 'andrzejhamera');
        const isWioletta = (authorSlug === 'wiolettarogowska');

        if (isJola) {
            c.authorAvatar = 'avatar_jolawojcik.jpg';
        } else if (isZofia) {
            c.authorAvatar = 'avatar_zofia_dudek.jpg';
        } else if (isZbyszek) {
            c.authorAvatar = 'avatar_zbyszek_gieron.jpg';
        } else if (isAndrzejThiel) {
            c.authorAvatar = 'avatar_andrzej_thiel.jpg';
        } else if (isAndrzejHamera) {
            c.authorAvatar = 'avatar_andrzej_hamera.jpg';
        } else if (isWioletta) {
            c.authorAvatar = 'avatar_wioletta_official.jpg';
        } else if (!isCezary) {
            // BEZWZGLĘDNA REGUŁA: Nikt poza Dowódcą Cezarym Rogowskim nie ma prawa mieć Jego zdjęcia!
            if (c.authorAvatar && (c.authorAvatar.includes('cezary') || c.authorAvatar.includes('christian_culture_carousel'))) {
                c.authorAvatar = 'lumina_icon.jpg';
            }
        }
        if (!c.authorAvatar) {
            c.authorAvatar = isCezary ? 'avatar_cezary_official.jpg' : 'lumina_icon.jpg';
        }
        return c;
    },

    // Never impersonate community members or manufacture engagement.
    generateNaturalMissionDialogue() {
        return [];
    },

    getComments(postId, postContext = {}) {
        this.init();
        const key = this._commentsKeyPrefix + postId;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    // Hide only positively identified synthetic entries. Keep the
                    // stored archive unchanged so real user comments are preserved.
                    const genuine = parsed.filter(c => c && c.isMissionAuto !== true &&
                        !String(c.id || '').startsWith('comm_' + postId + '_mission_'));
                    const sanitized = genuine.map(c => this._sanitizeComment(c));
                    return this._sortComments(sanitized);
                }
            } catch(e) {}
        }
        return [];
    },

    _sortComments(list) {
        return [...list].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.timestamp - b.timestamp;
        });
    },

    saveComments(postId, comments) {
        const key = this._commentsKeyPrefix + postId;
        const sanitized = Array.isArray(comments) ? comments.map(c => this._sanitizeComment(c)) : [];
        try {
            localStorage.setItem(key, JSON.stringify(sanitized));
        } catch(e) {}

        this.updatePostCommentCountBadge(postId);

        if (_commentsBroadcastChan) {
            try {
                _commentsBroadcastChan.postMessage({ type: 'COMMENTS_UPDATED', postId: postId });
            } catch(e) {}
        }
    },

    getCommentCount(postId) {
        const comments = this.getComments(postId);
        return comments.filter(c => !c.hidden).length;
    },

    updatePostCommentCountBadge(postId) {
        const count = this.getCommentCount(postId);
        // Szukaj przycisków akcji dla tego postu
        const postCard = document.getElementById(postId) || document.querySelector(`[data-post-id="${postId}"]`);
        const searchScope = postCard || document;
        const btn = searchScope.querySelector(`.action-comments, [onclick*="toggleComments('${postId}')"]`);
        if (btn) {
            const countSpan = btn.querySelector('.comment-count-num') || btn.querySelector('.btn-text');
            if (countSpan) {
                countSpan.innerHTML = ` Komentarze (${count})`;
            }
        }
    },

    initAllPostCommentCounters() {
        document.querySelectorAll('[onclick*="toggleComments("]').forEach(btn => {
            const m = btn.getAttribute('onclick').match(/toggleComments\(['"]([^'"]+)['"]\)/);
            if (m && m[1]) {
                const postId = m[1];
                const count = this.getCommentCount(postId);
                const textEl = btn.querySelector('.btn-text') || btn;
                textEl.innerHTML = ` Komentarze (${count})`;
            }
        });
    },

    formatCommentText(text) {
        if (!text) return '';
        let safe = escapeHtml(text);
        // Formatuj hashtagi i wzmianki jeśli funkcja formatRichTextAndMedia jest dostępna
        try {
            if (window.LuminaDB && window.LuminaDB.formatRichTextAndMedia) {
                const formatted = window.LuminaDB.formatRichTextAndMedia(safe);
                return formatted.html || safe;
            }
        } catch(e) {}
        return safe.replace(/\n/g, '<br>');
    },

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Przed chwilą';
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / (60 * 1000));
        if (mins < 1) return 'Przed chwilą';
        if (mins < 60) return `${mins} min temu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} godz. temu`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} dni temu`;
        const date = new Date(timestamp);
        return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    },

    addComment(postId, text, replyToAuthor = null) {
        if (!text || !text.trim()) return null;
        const commenter = this.getCurrentCommenter();
        const comments = this.getComments(postId);

        let cleanText = text.trim();
        if (replyToAuthor && !cleanText.startsWith('@' + replyToAuthor)) {
            cleanText = `@${replyToAuthor} ${cleanText}`;
        }

        const newComment = {
            id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            postId: postId,
            author: commenter.name,
            authorSlug: commenter.slug,
            authorAvatar: commenter.avatar,
            authorBadge: commenter.badge,
            text: cleanText,
            timestamp: Date.now(),
            likes: 0,
            amen: 0,
            likedByMe: false,
            amenByMe: false,
            pinned: false,
            hidden: false,
            edited: false
        };

        comments.push(newComment);
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
            LuminaLivePrayer.emitFaithParticles();
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Twój komentarz został pomyślnie dodany! ✨🕊️');
        }

        return newComment;
    },

    editComment(postId, commentId, newText) {
        if (!newText || !newText.trim()) return false;
        const comments = this.getComments(postId);
        const idx = comments.findIndex(c => c.id === commentId);
        if (idx === -1) return false;

        comments[idx].text = newText.trim();
        comments[idx].edited = true;
        comments[idx].editedAt = Date.now();

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast('Komentarz został zaktualizowany. ✨');
        }
        return true;
    },

    deleteComment(postId, commentId) {
        if (!confirm('Czy na pewno chcesz usunąć ten komentarz?')) return;
        let comments = this.getComments(postId);
        comments = comments.filter(c => c.id !== commentId);
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast('Komentarz został usunięty.');
        }
    },

    togglePinComment(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        const willPin = !target.pinned;
        // Odpinamy pozostałe
        comments.forEach(c => {
            if (c.id === commentId) c.pinned = willPin;
            else if (willPin) c.pinned = false;
        });

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast(willPin ? '📌 Komentarz został przypięty na samej górze!' : 'Komentarz został odpięty.');
        }
    },

    toggleHideComment(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.hidden = !target.hidden;
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast(target.hidden ? 'Komentarz został ukryty.' : 'Komentarz został odkryty.');
        }
    },

    toggleCommentLike(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.likedByMe = !target.likedByMe;
        target.likes = target.likedByMe ? (target.likes + 1) : Math.max(0, target.likes - 1);

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);
    },

    toggleCommentAmen(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.amenByMe = !target.amenByMe;
        target.amen = target.amenByMe ? (target.amen + 1) : Math.max(0, target.amen - 1);

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (target.amenByMe) {
            if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
                LuminaLivePrayer.emitFaithParticles();
            }
            if (typeof window.showToast === 'function') {
                window.showToast('Twoje AMEN do komentarza zostało dodane! 🕊️✨');
            }
        }
    },

    isTrustedAuthor(comment) {
        if (!comment) return false;
        const slug = (comment.authorSlug || '').toLowerCase();
        const role = (comment.authorRole || comment.authorBadge || '').toLowerCase();
        const name = (comment.author || '').toLowerCase();

        const trustedSlugs = [
            'cezaryrgowski', 'cezary', 'wiolettarogowska', 'wioletta',
            'andrzejthiel', 'andrzej', 'jolawojcik', 'jola',
            'zbyszekgieron', 'zbyszek', 'zofiadudek', 'zofia',
            'ccmen', 'ccwomen', 'studiodobregoslowa', 'sds',
            'pawelmurawski', 'magdalena', 'radiocc', 'osobowoscplus'
        ];

        if (trustedSlugs.includes(slug)) return true;
        if (comment.isTrusted || comment.verified || comment.isMissionAuto) return true;
        if (role.includes('założyciel') || role.includes('współzałożyciel') || role.includes('lider') || 
            role.includes('wstawiennik') || role.includes('wspólnota') || role.includes('wydawnictwo') || 
            role.includes('świadectwo') || role.includes('formacja') || role.includes('partner') ||
            role.includes('profil misyjny') || role.includes('redakcja') || role.includes('oficjalny')) {
            return true;
        }
        if (['cezaryrgowski', 'wiolettarogowska', 'andrzejthiel', 'studiodobregoslowa'].includes(String(slug || '').toLowerCase())) {
            return true;
        }

        const me = this.getCurrentCommenter();
        if (me && me.slug === slug && (me.slug === 'cezaryrgowski' || me.badge)) {
            return true;
        }

        return false;
    },

    createCommentLinkPreviewCardHtml(url, commentId) {
        if (!url) return '';
        const rawUrl = String(url).trim();
        const safeUrl = encodeURI(rawUrl).replace(/"/g, '&quot;');
        const lowerUrl = rawUrl.toLowerCase();

        // 1. YouTube Video Preview
        const ytId = extractYouTubeId(rawUrl);
        if (ytId) {
            return `
                <div class="comment-preview-card" id="comment_preview_${commentId}">
                    <div class="comment-preview-thumb-wrap" onclick="LuminaComments.openCommentYouTubePlayer('${commentId}', '${ytId}')" title="Kliknij, aby odtworzyć wideo">
                        <img src="https://i.ytimg.com/vi/${ytId}/hqdefault.jpg" alt="Wideo YouTube" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='worship_logo.png';">
                        <div class="comment-preview-play-overlay"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <div id="comment_yt_embed_${commentId}" class="comment-yt-embed-wrap" style="display:none;"></div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge badge-youtube"><i class="fa-brands fa-youtube"></i> Wideo YouTube</span>
                            <span class="comment-preview-domain">youtube.com</span>
                        </div>
                        <h4 class="comment-preview-title">Wideo Wiary • Obejrzyj nagranie w komentarzu</h4>
                        <p class="comment-preview-desc">Kliknij miniaturę powyżej, aby obejrzeć materiał wideo bezpośrednio na Tablicy, lub przejdź do YouTube.</p>
                        <div class="comment-preview-footer">
                            <button type="button" class="comment-preview-btn" onclick="LuminaComments.openCommentYouTubePlayer('${commentId}', '${ytId}')">
                                <i class="fa-solid fa-play"></i> Odtwórz wideo
                            </button>
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-active-link" style="font-size:0.75rem;">
                                YouTube <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. Randki & Małżeństwo (Roman Chałupka)
        if (lowerUrl.includes('randki-malzenstwo') || lowerUrl.includes('kurs-malzenski')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="nie-bylejaki-kurs-malzenski.png" alt="Kurs Małżeński" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='tlo_profilowe_wioletta.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-heart"></i> Kurs Małżeński</span>
                            <span class="comment-preview-domain">polskieradio.cc</span>
                        </div>
                        <h4 class="comment-preview-title">Randki & Małżeństwo • Roman Chałupka</h4>
                        <p class="comment-preview-desc">Prawdziwe szczęście w rodzinie – 18 odcinków wykładów biblijnych dla narzeczonych, par i małżeństw. Oglądaj bez opłat.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-graduation-cap"></i> Otwórz Kurs 🕊️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Kino Chrześcijańskie VOD
        if (lowerUrl.includes('/vod') || lowerUrl.includes('kino')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="vod_hity_kina.webp" alt="VOD Kino Chrześcijańskie" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='promo_dzj.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-film"></i> Kino Chrześcijańskie</span>
                            <span class="comment-preview-domain">polskieradio.cc/vod</span>
                        </div>
                        <h4 class="comment-preview-title">Kino VOD Christian Culture • Bez Opłat i Bez Reklam</h4>
                        <p class="comment-preview-desc">Poruszające filmy fabularne, biografie wiary i historyczne dramaty z polskim lektorem na żądanie 24/7.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-play"></i> Oglądaj w VOD 🍿
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 4. Dom Modlitwy & Wstawiennictwo Live
        if (lowerUrl.includes('/modlitwa') || lowerUrl.includes('zjednoczeni-za-polske')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="lion_jewish_flag.jpg" alt="Dom Modlitwy" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-hands-praying"></i> Wstawiennictwo Live</span>
                            <span class="comment-preview-domain">polskieradio.cc/modlitwa</span>
                        </div>
                        <h4 class="comment-preview-title">Narodowy Dom Modlitwy • Zjednoczeni za Polskę</h4>
                        <p class="comment-preview-desc">Wstawiennictwo czasu rzeczywistego. Zgłoś swoją intencję i módl się razem z tysiącami wierzących.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-hands-praying"></i> Módl się TERAZ 🕊️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 5. MojaBiblia (Pismo Święte)
        if (lowerUrl.includes('mojabiblia')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-book-bible"></i> Pismo Święte</span>
                            <span class="comment-preview-domain">polskieradio.cc/mojabiblia</span>
                        </div>
                        <h4 class="comment-preview-title">MojaBiblia • Interlinearne Studium Słowa Bożego</h4>
                        <p class="comment-preview-desc">Tekst Pisma Świętego UBG, kody Stronga, słowniki greki i hebrajskiego oraz rozważania.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-book-open"></i> Czytaj Biblię 📖
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 6. Polskie Radio CC Live / Player
        if (lowerUrl.includes('polskieradio.cc') || lowerUrl.includes('player')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-radio"></i> Radio na Żywo</span>
                            <span class="comment-preview-domain">polskieradio.cc</span>
                        </div>
                        <h4 class="comment-preview-title">Polskie Radio Christian Culture Live</h4>
                        <p class="comment-preview-desc">Muzyka Uwielbienia & Słowo Boże 24/7. Transmisja bez przerw, budująca wiarę w Twoim domu.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-play"></i> Słuchaj na żywo 📻
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 7. Patronite
        if (lowerUrl.includes('patronite.pl')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge" style="background:rgba(239,68,68,0.2); color:#fca5a5; border-color:rgba(239,68,68,0.4);"><i class="fa-solid fa-heart"></i> Patronite CC</span>
                            <span class="comment-preview-domain">patronite.pl/osobowoscplus</span>
                        </div>
                        <h4 class="comment-preview-title">Wesprzyj Misję Christian Culture na Patronite</h4>
                        <p class="comment-preview-desc">Twoje wsparcie pozwala nam rozwijać bezpłatne media chrześcijańskie i wysyłać bezpłatne egzemplarze Biblii.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn" style="background:linear-gradient(135deg,#ef4444,#f97316); color:#fff;">
                                <i class="fa-solid fa-heart"></i> Zostań Patronem ❤️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 8. WhatsApp
        if (lowerUrl.includes('chat.whatsapp.com')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge" style="background:rgba(34,197,94,0.2); color:#86efac; border-color:rgba(34,197,94,0.4);"><i class="fa-brands fa-whatsapp"></i> Społeczność WhatsApp</span>
                            <span class="comment-preview-domain">chat.whatsapp.com</span>
                        </div>
                        <h4 class="comment-preview-title">Oficjalna Grupa Wspólnotowa Christian Culture</h4>
                        <p class="comment-preview-desc">Dołącz do grupy modlitewno-wspólnotowej. Bądź na bieżąco z codziennymi rozważaniami i intencjami.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn" style="background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff;">
                                <i class="fa-brands fa-whatsapp"></i> Dołącz do Grupy 💬
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 9. Dowolna inna witryna zewnętrzna
        let domain = rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        return `
            <div class="comment-preview-card">
                <div class="comment-preview-body">
                    <div class="comment-preview-badge-row">
                        <span class="comment-preview-badge"><i class="fa-solid fa-globe"></i> Link Zewnętrzny</span>
                        <span class="comment-preview-domain">${escapeHtml(domain)}</span>
                    </div>
                    <h4 class="comment-preview-title">${escapeHtml(domain)} • Odsłonięta treść polecana przez zaufany profil</h4>
                    <p class="comment-preview-desc">Zweryfikowany odnośnik opublikowany przez zaufanego członka społeczności.</p>
                    <div class="comment-preview-footer">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Otwórz link 🔗
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    openCommentYouTubePlayer(commentId, ytId) {
        const previewCard = document.getElementById('comment_preview_' + commentId);
        if (!previewCard) return;
        const thumbWrap = previewCard.querySelector('.comment-preview-thumb-wrap');
        const embedWrap = document.getElementById('comment_yt_embed_' + commentId);
        if (thumbWrap && embedWrap) {
            thumbWrap.style.display = 'none';
            embedWrap.style.display = 'block';
            embedWrap.innerHTML = `
                <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
                        title="Wideo YouTube w komentarzu" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen></iframe>
            `;
        }
    },

    formatCommentText(rawText, comment = null) {
        if (!rawText) return '';
        const isTrusted = comment ? this.isTrustedAuthor(comment) : false;
        const commentId = comment?.id || ('tmp_' + Date.now());

        // Sanityzacja HTML
        let text = escapeHtml(rawText);

        // Regex wykrywający URL
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
        const foundUrls = text.match(urlRegex) || [];

        if (isTrusted) {
            // ZAUFANE PROFILE: aktywne, klikalne linki z ikoną
            text = text.replace(urlRegex, (url) => {
                let display = url.replace(/^https?:\/\/(www\.)?/, '');
                if (display.length > 40) display = display.substring(0, 37) + '...';
                const safeUrl = encodeURI(url).replace(/"/g, '&quot;');
                return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-active-link"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;"></i> ${display}</a>`;
            });
        } else {
            // NIEZAUFANE PROFILE: link bezpieczny bez podglądu
            text = text.replace(urlRegex, (url) => {
                let display = url.replace(/^https?:\/\/(www\.)?/, '');
                if (display.length > 40) display = display.substring(0, 37) + '...';
                return `<span class="comment-untrusted-link"><i class="fa-solid fa-link"></i> ${display}</span>`;
            });
        }

        // Formatuje @mentions
        text = text.replace(/(^|[\s>(])@([a-zA-Z0-9_]+)/g, (match, p1, handle) => {
            const hInfo = typeof resolveMentionHandle === 'function' ? resolveMentionHandle(handle) : null;
            const nameAttr = (hInfo && hInfo.name) ? escapeHtml(hInfo.name) : escapeHtml(handle);
            const urlAttr = (hInfo && hInfo.url) ? encodeURI(hInfo.url) : `lumina-profile.html?u=${encodeURIComponent(handle)}`;
            return `${p1}<a href="${urlAttr}" class="lumina-mention-pill" title="Profil: ${nameAttr}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${escapeHtml(handle)}</a>`;
        });

        // Formatuje #hashtags
        text = text.replace(/(^|[\s>(])#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, p1, tag) => {
            const safeTag = escapeHtml(tag);
            const encTag = encodeURIComponent(tag);
            return `${p1}<a href="lumina-tablica.html?q=%23${encTag}" class="lumina-hashtag-pill" data-tag="${safeTag}" title="Filtruj #${safeTag}" onclick="if(window.filterFeedByTag){event.preventDefault();event.stopPropagation();window.filterFeedByTag('${safeTag}');}else{event.stopPropagation();}"><i class="fa-solid fa-hashtag"></i>${safeTag}</a>`;
        });

        // Zamiana \n na <br>
        text = text.replace(/\n/g, '<br>');

        // JEŚLI PROFIL JEST ZAUFANY i w komentarzu jest co najmniej jeden link:
        // Odsłoń w komentarzu jego treść (Rich Preview Card / Embed Player)
        if (isTrusted && foundUrls.length > 0) {
            const firstUrl = foundUrls[0];
            const previewCardHtml = this.createCommentLinkPreviewCardHtml(firstUrl, commentId);
            if (previewCardHtml) {
                text += previewCardHtml;
            }
        }

        return text;
    },

    insertFaithChip(postId, chipText) {
        const input = document.getElementById('comment_input_' + postId);
        if (!input) return;
        const curVal = input.value.trim();
        input.value = curVal ? (curVal + ' ' + chipText) : chipText;
        input.focus();
    },

    replyToUser(postId, commentId, authorName) {
        const input = document.getElementById('comment_input_' + postId);
        const replyBadge = document.getElementById('comment_reply_badge_' + postId);
        if (input) {
            input.dataset.replyTo = authorName;
            input.value = `@${authorName} `;
            input.focus();
        }
        if (replyBadge) {
            replyBadge.innerHTML = `<span>Odpowiedź do: <b>@${escapeHtml(authorName)}</b></span> <button type="button" class="comment-cancel-reply-btn" onclick="LuminaComments.cancelReply('${postId}')">✕</button>`;
            replyBadge.style.display = 'flex';
        }
    },

    cancelReply(postId) {
        const input = document.getElementById('comment_input_' + postId);
        const replyBadge = document.getElementById('comment_reply_badge_' + postId);
        if (input) {
            delete input.dataset.replyTo;
            if (input.value.startsWith('@')) {
                input.value = '';
            }
        }
        if (replyBadge) {
            replyBadge.style.display = 'none';
        }
    },

    startInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textContent = commentItem.querySelector('.comment-text-content');
        const editBox = commentItem.querySelector('.comment-inline-edit-wrap');
        if (textContent && editBox) {
            textContent.style.display = 'none';
            editBox.style.display = 'flex';
            const textarea = editBox.querySelector('textarea');
            if (textarea) textarea.focus();
        }
        this.closeAllDropdowns();
    },

    cancelInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textContent = commentItem.querySelector('.comment-text-content');
        const editBox = commentItem.querySelector('.comment-inline-edit-wrap');
        if (textContent && editBox) {
            textContent.style.display = 'block';
            editBox.style.display = 'none';
        }
    },

    saveInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textarea = commentItem.querySelector('.comment-inline-edit-textarea');
        if (!textarea) return;
        const newText = textarea.value.trim();
        this.editComment(postId, commentId, newText);
    },

    toggleCommentDropdown(postId, commentId) {
        const menu = document.getElementById('comment_dropdown_' + commentId);
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        this.closeAllDropdowns();
        if (!isOpen) {
            menu.classList.add('open');
        }
    },

    closeAllDropdowns() {
        document.querySelectorAll('.comment-dropdown-menu.open').forEach(el => el.classList.remove('open'));
    },

    toggleComments(postId, postAuthorSlug) {
        this.ensureStylesInjected();
        let section = document.getElementById('comments_' + postId);
        if (!section && typeof postId === 'string' && postId.startsWith('post_')) {
            section = document.getElementById('comments_' + postId.replace(/^post_/, ''));
        }
        if (!section && typeof postId === 'string' && !postId.startsWith('post_')) {
            section = document.getElementById('comments_post_' + postId);
        }
        if (!section) return;

        const cleanPostId = section.id.replace(/^comments_/, '');
        const isOpen = section.classList.contains('open');
        if (isOpen) {
            section.classList.remove('open');
            section.style.display = 'none';
        } else {
            section.classList.add('open');
            section.style.display = 'block';
            this.refreshCommentsSection(cleanPostId, postAuthorSlug);
            setTimeout(() => {
                try {
                    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } catch(e) {}
                const input = document.getElementById('comment_input_' + cleanPostId);
                if (input) input.focus();
            }, 120);
        }
    },

    submitComment(postId) {
        let input = document.getElementById('comment_input_' + postId);
        if (!input && typeof postId === 'string' && postId.startsWith('post_')) {
            input = document.getElementById('comment_input_' + postId.replace(/^post_/, ''));
        }
        if (!input && typeof postId === 'string' && !postId.startsWith('post_')) {
            input = document.getElementById('comment_input_post_' + postId);
        }
        if (!input) return;
        const actualPostId = input.id.replace(/^comment_input_/, '');
        const text = input.value.trim();
        if (!text) return;
        const replyTo = input.dataset.replyTo || null;
        this.addComment(actualPostId, text, replyTo);
        input.value = '';
        this.cancelReply(actualPostId);
    },

    renderCommentsListHtml(postId, postAuthorSlug) {
        const comments = this.getComments(postId);
        const me = this.getCurrentCommenter();
        const isAdmin = me.slug === 'cezaryrgowski';
        const isPostAuthor = postAuthorSlug && (postAuthorSlug === me.slug);

        if (comments.length === 0) {
            return `<div style="text-align:center; padding:16px; color:#94a3b8; font-size:0.82rem; font-style:italic;">Bądź pierwszą osobą, która podzieli się słowem lub Amen! ✨🕊️</div>`;
        }

        return comments.map(c => {
            const isMyComment = (c.authorSlug && c.authorSlug === me.slug);
            const canManage = (isMyComment || isPostAuthor || isAdmin);

            if (c.hidden && !canManage) {
                return `
                    <div class="comment-item-v2" id="comment_item_${c.id}">
                        <div class="comment-hidden-placeholder" style="width:100%;">
                            <span><i class="fa-solid fa-eye-slash"></i> Ten komentarz został ukryty przez autora wpisu.</span>
                            <button type="button" class="btn-reveal-hidden" onclick="document.getElementById('hidden_body_${c.id}').style.display='block'; this.parentElement.style.display='none';">Pokaż mimo to</button>
                        </div>
                        <div id="hidden_body_${c.id}" style="display:none; width:100%;">
                            ${this._renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment)}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="comment-item-v2 ${c.pinned ? 'pinned-comment' : ''}" id="comment_item_${c.id}">
                    <a href="${c.authorSlug ? ('lumina.html?u=' + c.authorSlug) : '#'}" class="comment-avatar-link">
                        <img loading="lazy" decoding="async" src="${(this._sanitizeComment(c)).authorAvatar || 'lumina_icon.jpg'}" alt="${escapeHtml(c.author)}" class="comment-avatar-v2" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                    </a>
                    <div class="comment-body-v2">
                        ${this._renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment)}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment) {
        return `
            <div class="comment-bubble-v2">
                ${c.pinned ? `<div class="comment-pinned-indicator"><i class="fa-solid fa-thumbtack"></i> Przypięty komentarz</div>` : ''}
                ${c.hidden ? `<div style="font-size:0.72rem; color:#f87171; margin-bottom:4px; font-weight:700;"><i class="fa-solid fa-eye-slash"></i> (Komentarz ukryty dla gości)</div>` : ''}
                
                <div class="comment-header-row">
                    <a href="${c.authorSlug ? ('lumina.html?u=' + c.authorSlug) : '#'}" class="comment-author-name">
                        <span>${escapeHtml(c.author)}</span>
                        ${c.authorBadge ? `<span class="comment-badge-pill">${escapeHtml(c.authorBadge)}</span>` : ''}
                    </a>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="comment-time-v2">${this.formatTimeAgo(c.timestamp)}</span>
                        ${c.edited ? `<span class="comment-edited-tag">(edytowano)</span>` : ''}
                        
                        ${canManage ? `
                            <button type="button" class="comment-more-btn" onclick="LuminaComments.toggleCommentDropdown('${postId}', '${c.id}')" title="Opcje komentarza">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                            <div class="comment-dropdown-menu" id="comment_dropdown_${c.id}">
                                ${isMyComment ? `
                                    <button type="button" class="comment-dropdown-item" onclick="LuminaComments.startInlineEdit('${postId}', '${c.id}')">
                                        <i class="fa-solid fa-pencil"></i> Edytuj
                                    </button>
                                ` : ''}
                                <button type="button" class="comment-dropdown-item" onclick="LuminaComments.togglePinComment('${postId}', '${c.id}')">
                                    <i class="fa-solid fa-thumbtack"></i> ${c.pinned ? 'Odepnij' : 'Przypnij na górze'}
                                </button>
                                <button type="button" class="comment-dropdown-item" onclick="LuminaComments.toggleHideComment('${postId}', '${c.id}')">
                                    <i class="fa-solid ${c.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${c.hidden ? 'Odkryj' : 'Ukryj'}
                                </button>
                                <button type="button" class="comment-dropdown-item item-danger" onclick="LuminaComments.deleteComment('${postId}', '${c.id}')">
                                    <i class="fa-solid fa-trash-can"></i> Usuń
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="comment-text-content">${this.formatCommentText(c.text, c)}</div>

                <!-- Inline Edit Form (Hidden by default) -->
                <div class="comment-inline-edit-wrap" style="display:none;">
                    <textarea class="comment-inline-edit-textarea">${escapeHtml(c.text)}</textarea>
                    <div class="comment-inline-edit-buttons">
                        <button type="button" class="comment-edit-btn-cancel" onclick="LuminaComments.cancelInlineEdit('${postId}', '${c.id}')">Anuluj</button>
                        <button type="button" class="comment-edit-btn-save" onclick="LuminaComments.saveInlineEdit('${postId}', '${c.id}')">Zapisz</button>
                    </div>
                </div>
            </div>

            <!-- Reactions and reply -->
            <div class="comment-actions-bar-v2">
                <button type="button" class="comment-action-link ${c.likedByMe ? 'active-like' : ''}" onclick="LuminaComments.toggleCommentLike('${postId}', '${c.id}')" title="Polub komentarz">
                    <i class="fa-solid fa-heart"></i> <span>${c.likes > 0 ? c.likes : ''} Lubię</span>
                </button>
                <button type="button" class="comment-action-link ${c.amenByMe ? 'active-amen' : ''}" onclick="LuminaComments.toggleCommentAmen('${postId}', '${c.id}')" title="Dodaj AMEN!">
                    <i class="fa-solid fa-hands-praying"></i> <span>${c.amen > 0 ? c.amen : ''} Amen!</span>
                </button>
                <button type="button" class="comment-action-link" onclick="LuminaComments.replyToUser('${postId}', '${c.id}', '${escapeHtml(c.author)}')" title="Odpowiedz temu autorowi">
                    <i class="fa-solid fa-reply"></i> <span>Odpowiedz</span>
                </button>
            </div>
        `;
    },

    refreshCommentsList(postId, postAuthorSlug) {
        const list = document.getElementById('comment_list_' + postId);
        if (list) {
            list.innerHTML = this.renderCommentsListHtml(postId, postAuthorSlug);
        }
    },

    refreshCommentsSection(postId, postAuthorSlug) {
        const container = document.getElementById('comments_' + postId);
        if (!container) return;
        const me = this.getCurrentCommenter();

        container.className = 'comments-section-v2 open';
        container.style.display = 'block';
        container.innerHTML = `
            <!-- Faith Quick-Chips -->
            <div class="comment-faith-chips-bar">
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '🕊️ Amen!')">🕊️ Amen!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '🙏 Błogosławię w Panu!')">🙏 Błogosławię w Panu!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '❤️ Piękne świadectwo!')">❤️ Piękne świadectwo!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '✨ Chwała Bogu!')">✨ Chwała Bogu!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '📖 Słowo na czasie!')">📖 Słowo na czasie!</button>
            </div>

            <!-- Composer Input Row -->
            <div class="comment-input-composer-v2">
                <img loading="lazy" decoding="async" src="${me.avatar || 'lumina_icon.jpg'}" alt="${escapeHtml(me.name)}" class="comment-my-avatar" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                <div class="comment-input-wrap">
                    <div id="comment_reply_badge_${postId}" class="comment-replying-to-badge" style="display:none;"></div>
                    <textarea class="comment-textarea-v2" id="comment_input_${postId}" placeholder="Napisz budujący komentarz, świadectwo lub Amen..." rows="1" onkeypress="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); LuminaComments.submitComment('${postId}'); }"></textarea>
                    <div class="comment-submit-bar">
                        <span style="font-size:0.7rem; color:#64748b;">Naciśnij Enter, aby wysłać</span>
                        <button type="button" class="comment-submit-btn-v2" onclick="LuminaComments.submitComment('${postId}')">
                            <i class="fa-solid fa-paper-plane"></i> Opublikuj
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comments Feed List -->
            <div class="comments-list-v2" id="comment_list_${postId}">
                ${this.renderCommentsListHtml(postId, postAuthorSlug)}
            </div>
        `;

        this.updatePostCommentCountBadge(postId);
    }
};

// Global Exposure
window.LuminaComments = LuminaCommentsEngine;
window.LuminaCommentsEngine = LuminaCommentsEngine;
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.LuminaComments = LuminaCommentsEngine;

window.toggleComments = function(postId, authorSlug) {
    LuminaCommentsEngine.toggleComments(postId, authorSlug);
};
window.submitComment = function(postId) {
    LuminaCommentsEngine.submitComment(postId);
};

// Auto-inicjalizacja liczników po załadowaniu DOM
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LuminaCommentsEngine.init();
            setTimeout(() => {
                LuminaCommentsEngine.autoAttachToAllFeedCards();
                LuminaCommentsEngine.initAllPostCommentCounters();
            }, 500);
        });
    } else {
        LuminaCommentsEngine.init();
        setTimeout(() => {
            LuminaCommentsEngine.autoAttachToAllFeedCards();
            LuminaCommentsEngine.initAllPostCommentCounters();
        }, 500);
    }
    // Zamknięcie otwartych dropdownów po kliknięciu poza nimi
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.comment-dropdown-menu') && !e.target.closest('.comment-more-btn')) {
            LuminaCommentsEngine.closeAllDropdowns();
        }
    });
}

if (typeof window !== 'undefined') {
    if (!window.triggerPostPrayer) {
        window.triggerPostPrayer = function(postId, author, btn) {
            if (window.LuminaLivePrayer) {
                const rect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
                window.LuminaLivePrayer.triggerPrayNow(postId, author);
                window.LuminaLivePrayer.emitFaithParticles(rect.left + rect.width / 2, rect.top);
            } else {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate([70, 40, 90]); } catch(e) {}
                }
            }
            if (btn) {
                btn.classList.add('pray-now-active');
                const countEl = btn.querySelector('.pray-count');
                if (countEl) {
                    let current = parseInt(countEl.textContent, 10) || 1;
                    countEl.textContent = current + 1;
                }
            }
            const safeAuthor = author || 'autora wpisu';
            if (typeof window.showToast === 'function') {
                window.showToast(`🕊️ Modlisz się TERAZ za: ${safeAuthor}! Twoje wstawiennictwo płynie przed Tron Boży. ✨`);
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 PROFIL GOTOWY NA SPOŁECZNOŚĆ (2026-10-07, Strażnik Standardów)
// Jedno źródło prawdy: kiedy profil jest „kompletny” i może pojawić się na karuzeli.
// ═══════════════════════════════════════════════════════════════════════════
const LUMINA_PLACEHOLDER_NAMES = ['użytkownik lumina', 'uzytkownik lumina', 'gość lumina', 'user', 'lumina'];

export function getLuminaProfileCompletion(profile) {
    const p = profile || {};
    const slug = String(p.slug || p.uid || '').toLowerCase();
    const name = String(p.name || '').trim();
    const missing = [];
    if (name.length < 3 || LUMINA_PLACEHOLDER_NAMES.includes(name.toLowerCase())) missing.push('name');
    if (!String(p.city || '').trim()) missing.push('city');
    if (!isLuminaRealPersonPhoto(p.avatar, slug)) missing.push('photo');
    return { complete: missing.length === 0, missing };
}

export function isLuminaCommunityReadyProfile(p) {
    if (!p) return false;
    if (p.isBlocked || p.isMissionAccount || p.visibility === 'private') return false;
    const slug = String(p.slug || p.uid || '').toLowerCase();
    if (!slug) return false;
    const cleanSlug = slug.replace(/^u_/, '');
    const name = String(p.name || '').toLowerCase();
    if (cleanSlug === 'zbyszekgieron' || cleanSlug === 'zbyszek' || name.includes('zbyszek') || name.includes('gieroń') || name.includes('gieron')) return false;
    return getLuminaProfileCompletion(p).complete;
}

let _carouselProfilesCache = null;
let _carouselProfilesPromise = null;
export const LUMINA_CAROUSEL_FALLBACK_AVATAR = 'images/lumina-avatar-zastepczy.jpg';
/**
 * Karuzela „Poznajmy się bliżej” — WSZYSCY członkowie społeczności (Strażnik, 2026-10-11).
 * Każdy publiczny profil z imieniem; zdjęcie profilowe użytkownika, a logo LUMINA tylko w ostateczności.
 * Najpierw osoby ze zdjęciem, potem pozostali; kolejność stała w obrębie wizyty, by karuzela nie „skakała”.
 */
export function isLuminaCarouselMember(p) {
    if (!p) return false;
    if (p.isBlocked || p.isMissionAccount || p.visibility === 'private') return false;
    const slug = String(p.slug || p.uid || p.id || '').toLowerCase();
    if (!slug) return false;
    const cleanSlug = slug.replace(/^u_/, '');
    const name = String(p.name || '').trim();
    const cleanName = name.toLowerCase();
    if (cleanSlug === 'zbyszekgieron' || cleanSlug === 'zbyszek' || cleanName.includes('zbyszek') || cleanName.includes('gieroń') || cleanName.includes('gieron')) return false;
    return name.length >= 2 && !LUMINA_PLACEHOLDER_NAMES.includes(name.toLowerCase());
}
export function getCommunityCarouselProfiles(max = 60) {
    if (_carouselProfilesCache) return Promise.resolve(_carouselProfilesCache.slice(0, max));
    if (_carouselProfilesPromise) return _carouselProfilesPromise.then(list => list.slice(0, max));
    _carouselProfilesPromise = (async () => {
        if (!db) { try { await ensureDbReady(); } catch(e) {} }
        if (!db) return [];
        const seen = new Set();
        const out = [];
        const take = (snap) => {
            snap.forEach(d => {
                const p = { id: d.id, ...d.data() };
                const slug = String(p.slug || d.id || '').toLowerCase();
                const uidKey = 'uid:' + String(p.uid || '');
                if (!slug || seen.has(slug) || (p.uid && seen.has(uidKey))) return;
                if (!isLuminaCarouselMember(p)) return;
                seen.add(slug);
                if (p.uid) seen.add(uidKey);
                const hasPhoto = isLuminaRealPersonPhoto(p.avatar, slug);
                out.push({
                    slug,
                    uid: p.uid || d.id,
                    name: String(p.name || '').trim(),
                    city: String(p.city || '').split(',')[0].trim(),
                    avatar: hasPhoto ? String(p.avatar).trim() : LUMINA_CAROUSEL_FALLBACK_AVATAR,
                    hasPhoto,
                    verified: LUMINA_RESERVED_PROFILE_SLUGS.includes(slug)
                });
            });
        };
        try {
            take(await getDocs(query(collection(db, 'lumina_profiles'), limit(300))));
        } catch(e) {
            console.warn('[LUMINA] Karuzela społeczności — odczyt nieudany:', e && e.message);
        }
        let seed = 0;
        try {
            seed = Number(sessionStorage.getItem('lumina_carousel_seed')) || Math.floor(Math.random() * 1e9);
            sessionStorage.setItem('lumina_carousel_seed', String(seed));
        } catch(e) { seed = 12345; }
        const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
        const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [arr[i], arr[k]] = [arr[k], arr[i]]; } return arr; };
        const ordered = shuffle(out.filter(p => p.hasPhoto)).concat(shuffle(out.filter(p => !p.hasPhoto)));
        _carouselProfilesCache = ordered;
        return ordered;
    })();
    return _carouselProfilesPromise.then(list => list.slice(0, max));
}

/**
 * Zapis uzupełnionego profilu przez WŁAŚCICIELA (kreator po pierwszym logowaniu).
 * Zapisuje wyłącznie do własnego dokumentu lumina_profiles/{uid}.
 */
export async function completeOwnLuminaProfile(fields) {
    const user = currentUserState;
    if (!user || user.isAnonymous) throw new Error('Zaloguj się, aby uzupełnić profil.');
    if (!db) await ensureDbReady();
    const slug = String((currentProfileState && currentProfileState.slug) || ('u_' + user.uid.substring(0, 8))).toLowerCase();
    const clean = {};
    const str = (v, max) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
    if (fields.name !== undefined) clean.name = str(fields.name, 60);
    if (fields.city !== undefined) clean.city = str(fields.city, 80);
    if (fields.bio !== undefined) clean.bio = str(fields.bio, 400);
    if (fields.denom !== undefined) clean.denom = str(fields.denom, 60);
    if (fields.gender !== undefined) clean.gender = ['kobieta', 'mezczyzna', ''].includes(fields.gender) ? fields.gender : '';
    if (fields.age !== undefined) {
        const a = parseInt(fields.age, 10);
        clean.age = (a >= 16 && a <= 110) ? a : null;
    }
    if (fields.avatar !== undefined) {
        if (!isLuminaRealPersonPhoto(fields.avatar, slug)) throw new Error('To nie wygląda na prawdziwe zdjęcie profilowe.');
        if (String(fields.avatar).length > 700000) throw new Error('Zdjęcie jest za duże — spróbuj innego.');
        clean.avatar = fields.avatar;
        clean.photos = [fields.avatar];
        clean.hasRealPhoto = true;
        clean.avatarUpdatedAt = serverTimestamp();
    }
    const merged = Object.assign({}, currentProfileState || {}, clean);
    const state = getLuminaProfileCompletion(merged);
    clean.profileCompleted = state.complete;
    clean.needsProfileCompletion = !state.complete;
    clean.uid = user.uid;
    if (!currentProfileState || !currentProfileState.slug) clean.slug = slug;
    clean.updatedAt = serverTimestamp();
    await setDoc(doc(db, 'lumina_profiles', user.uid), clean, { merge: true });
    currentProfileState = Object.assign(currentProfileState || {}, clean, { updatedAt: new Date().toISOString(), avatarUpdatedAt: new Date().toISOString() });
    try {
        const safe = JSON.stringify(currentProfileState);
        localStorage.setItem('lumina_current_user_profile', safe);
        localStorage.setItem('lumina_my_profile', safe);
        if (currentProfileState.slug) localStorage.setItem('lumina_profile_' + currentProfileState.slug, safe);
    } catch(e) {}
    _carouselProfilesCache = null; _carouselProfilesPromise = null;
    try { window.dispatchEvent(new CustomEvent('lumina:profile-completed', { detail: { complete: state.complete } })); } catch(e) {}
    return { complete: state.complete, missing: state.missing };
}

window.LuminaDB = Object.assign(window.LuminaDB || {}, {
    detectLuminaOfficialIdentity,
    isLuminaMasterAdmin,
    isCommunityAdmin,
    canEditLuminaProfile,
    isLuminaRealPersonPhoto,
    getLuminaProfileCompletion,
    isLuminaCommunityReadyProfile,
    getCommunityCarouselProfiles,
    completeOwnLuminaProfile
});
window.LuminaGuard = Object.freeze({
    canEditProfile: (slug, data) => canEditLuminaProfile(slug, data),
    isMasterAdmin: () => isLuminaMasterAdmin(),
    isCommunityAdmin: (user, fromId, profile) => isCommunityAdmin(user, fromId, profile),
    isRealPhoto: (url, slug) => isLuminaRealPersonPhoto(url, slug)
});

// ═══════════════════════════════════════════════════════════════════════════
// ❤️🙏 PRAWDZIWE REAKCJE NA TABLICY (2026-10-07, Strażnik Standardów)
// Wcześniej „Polub” i „Amen” zmieniały tylko liczbę na ekranie (i pokazywały komunikat
// „Twoje AMEN zostało dodane”), ale nic nie trafiało do bazy — po odświeżeniu znikało.
// Teraz: jedna reakcja na osobę (dokument lumina_post_reactions/{post}_{uid}_{typ})
// + licznik we wpisie, zapisane razem (atomowo). Reguły Firestore pilnują ±1.
// ═══════════════════════════════════════════════════════════════════════════
const LUMINA_REACTION_TYPES = ['likes', 'amen'];
let _myReactionsCache = null;

export async function getMyLuminaPostReactions() {
    const user = currentUserState;
    if (!user || user.isAnonymous) return new Set();
    if (_myReactionsCache) return _myReactionsCache;
    if (!db) { try { await ensureDbReady(); } catch(e) {} }
    const set = new Set();
    try {
        const snap = await getDocs(query(collection(db, 'lumina_post_reactions'), where('uid', '==', user.uid), limit(500)));
        snap.forEach(d => { const r = d.data(); if (r && r.postId && r.type) set.add(r.postId + '|' + r.type); });
    } catch(e) {
        console.warn('[LUMINA] Odczyt reakcji nieudany:', e && e.code);
    }
    _myReactionsCache = set;
    return set;
}

/** Zwraca { active, delta } albo rzuca błąd z komunikatem po polsku. */
export async function toggleLuminaPostReaction(postId, type) {
    const user = currentUserState;
    if (!user || user.isAnonymous) { const e = new Error('Zaloguj się, aby reagować na wpisy.'); e.code = 'auth'; throw e; }
    if (!LUMINA_REACTION_TYPES.includes(type)) throw new Error('Nieznany typ reakcji.');
    if (!postId || /[\/]/.test(postId)) throw new Error('Nieprawidłowy wpis.');
    if (!db) await ensureDbReady();
    const mine = await getMyLuminaPostReactions();
    const key = postId + '|' + type;
    const active = mine.has(key);
    const reactionRef = doc(db, 'lumina_post_reactions', postId + '_' + user.uid + '_' + type);
    const postRef = doc(db, 'lumina_posts', postId);
    const batch = writeBatch(db);
    if (active) {
        batch.delete(reactionRef);
        batch.update(postRef, { [type]: increment(-1) });
    } else {
        batch.set(reactionRef, { postId, uid: user.uid, type, createdAt: serverTimestamp() });
        batch.update(postRef, { [type]: increment(1) });
    }
    await batch.commit();
    if (active) mine.delete(key); else mine.add(key);
    return { active: !active, delta: active ? -1 : 1 };
}

window.LuminaDB = Object.assign(window.LuminaDB || {}, { getMyLuminaPostReactions, toggleLuminaPostReaction });
