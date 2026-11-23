/**
 * CCN Ogłoszenia — wspólne ogłoszenia społeczności (Strażnik, 2026-10-13)
 *
 * Wcześniej formularz „Dodaj ogłoszenie” zapisywał ogłoszenie tylko w przeglądarce autora
 * (localStorage) — nikt inny go nie widział. Teraz ogłoszenie trafia do Firestore (projekt lumina-cc)
 * i widzą je wszyscy odwiedzający.
 *
 * - Kolekcja `user_posts`, pole `kind: 'cc_ogloszenie'`.
 * - Moderacja (@007, 2026-11-23, decyzja L0): ogłoszenie zwykłego członka zapisuje się jako
 *   `status: 'pending'`; publicznie widać tylko `published`. Autor widzi swoje z dopiskiem
 *   „czeka na zatwierdzenie”. Administrator ma licznik i panel „Zatwierdź / Odrzuć”.
 *   Wyróżnienie Patrona (`featured` / `isPatron` / `patronBadge`) nadaje tylko administrator.
 *   To samo wymuszają reguły Firestore (firestore.rules, blok user_posts).
 * - Zdjęcie/wideo nieobowiązkowe (link https).
 * - Logowanie wspólne z LUMINA (ta sama aplikacja Firebase na tej samej domenie).
 * - Linki i obrazy tylko https:// lub ścieżki z tej domeny.
 */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, query, where, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const CONFIG = {
    apiKey: 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
    authDomain: 'lumina-cc.firebaseapp.com',
    projectId: 'lumina-cc',
    storageBucket: 'lumina-cc.firebasestorage.app',
    messagingSenderId: '413985877183',
    appId: '1:413985877183:web:b0c99a686a4fb1b875aa0a'
};
const KIND = 'cc_ogloszenie';
const COLLECTION = 'user_posts';
const ADMINS = ['nazirczarkes@gmail.com', 'radiochristianculture@gmail.com', 'czarekrogowski3@gmail.com',
    'polskieradiocc@gmail.com', 'studiodees7@gmail.com', 'polskiercctv@gmail.com'];
const TYPES = ['oddam', 'pomoge', 'czekolada', 'potrzebuje', 'szukam_fachowca', 'polecam_fachowca', 'sprzedam', 'kupie', 'zamienie', 'szukam'];
const CATEGORIES = ['fachowcy', 'inne', 'podroze', 'nocleg', 'rodzina_dzieci', 'ubrania', 'nieruchomosci', 'motoryzacja',
    'zywnosc', 'praca', 'opieka', 'uslugi', 'sprzet', 'duchowe', 'wydarzenia', 'wspolpraca'];
const STATUS_PENDING = 'pending';
const STATUS_PUBLISHED = 'published';
const STATUS_REJECTED = 'rejected';

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let remoteAds = [];
let pendingForAdmin = [];

function text(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }
function safeUrl(v) {
    const s = text(v, 2000);
    if (!s) return '';
    if (/^\/(?!\/)/.test(s)) return s;
    try { const u = new URL(s); return u.protocol === 'https:' ? u.href : ''; } catch (e) { return ''; }
}
function isMember(u) { return !!(u && !u.isAnonymous); }
function isAdmin(u) { return !!(u && u.emailVerified && ADMINS.includes(String(u.email || '').toLowerCase())); }
function fmtDate(ts) {
    const ms = ts && typeof ts.toMillis === 'function' ? ts.toMillis() : 0;
    return ms ? 'Dodano ' + new Date(ms).toLocaleDateString('pl-PL') : 'Dodano niedawno';
}

function toAd(id, d) {
    const media = Array.isArray(d.mediaUrls) ? d.mediaUrls.map(safeUrl).filter(Boolean).slice(0, 6) : [];
    return {
        id: 'fs-' + id,
        _docId: id,
        _authorUid: d.authorUid,
        _ms: d.createdAt && typeof d.createdAt.toMillis === 'function' ? d.createdAt.toMillis() : 0,
        title: text(d.title, 140),
        type: TYPES.includes(d.type) ? d.type : 'pomoge',
        category: CATEGORIES.includes(d.category) ? d.category : 'inne',
        priceText: text(d.priceText, 80) || 'Do uzgodnienia',
        description: text(d.description, 4000),
        location: text(d.location, 120) || 'Polska',
        contactName: text(d.contactName, 120),
        contactEmail: text(d.contactEmail, 160) || undefined,
        contactPhone: text(d.contactPhone, 40) || undefined,
        luminaProfileUrl: safeUrl(d.luminaProfileUrl) || undefined,
        imageUrl: safeUrl(d.imageUrl) || undefined,
        mediaUrls: media.length ? media : undefined,
        youtubeUrl: safeUrl(d.youtubeUrl) || undefined,
        date: fmtDate(d.createdAt),
        urgent: !!d.urgent,
        featured: !!(d.featured || d.isPatron),
        isPatron: !!(d.isPatron || d.featured),
        patronBadge: text(d.patronBadge, 80) || ((d.isPatron || d.featured) ? 'Patron & Mecenas CC' : ''),
        isCommunityVerified: false,
        status: d.status === STATUS_PENDING || d.status === STATUS_REJECTED ? d.status : STATUS_PUBLISHED,
        pending: d.status === STATUS_PENDING,
        rejected: d.status === STATUS_REJECTED,
        canDelete: false
    };
}

function withPermissions(list) {
    const admin = isAdmin(currentUser);
    return list.map(a => {
        const canMod = !!(currentUser && (a._authorUid === currentUser.uid || admin)) || (typeof a.id === 'string' && a.id.startsWith('ann-user-'));
        return {
            ...a,
            canDelete: canMod,
            canEdit: canMod,
            canModerate: admin && typeof a.id === 'string' && a.id.startsWith('fs-')
        };
    });
}

// Widoczność: publicznie tylko opublikowane; autor widzi też swoje oczekujące/odrzucone; admin — oczekujące.
function visibleRemote() {
    const uid = currentUser && currentUser.uid;
    const admin = isAdmin(currentUser);
    return remoteAds.filter(a => a.status === STATUS_PUBLISHED || (uid && a._authorUid === uid) || (admin && a.pending));
}

function push() {
    const set = window.__ccOglSetAds;
    if (typeof set !== 'function') return;
    const fresh = withPermissions(visibleRemote());
    set(prev => {
        const others = (prev || []).filter(a => !(a && typeof a.id === 'string' && a.id.startsWith('fs-')));
        const all = [...fresh, ...others];
        const seen = new Set();
        const deduped = [];
        for (const item of all) {
            if (!item || !item.id || seen.has(item.id)) continue;
            seen.add(item.id);
            deduped.push(item);
        }
        return deduped.sort((a, b) => {
            const isFounderA = a.id === 'cc-szukamy-domu-studio' || a.id === 'szukamy-domu-studio' || (a.title && a.title.includes('Szukamy domu dla rodziny'));
            const isFounderB = b.id === 'cc-szukamy-domu-studio' || b.id === 'szukamy-domu-studio' || (b.title && b.title.includes('Szukamy domu dla rodziny'));
            if (isFounderA) return -1;
            if (isFounderB) return 1;
            const fa = (a.featured || a.isPatron) ? 1 : 0;
            const fb = (b.featured || b.isPatron) ? 1 : 0;
            if (fb !== fa) return fb - fa;
            const ua = a.urgent ? 1 : 0;
            const ub = b.urgent ? 1 : 0;
            if (ub !== ua) return ub - ua;
            return (b._ms || 0) - (a._ms || 0);
        });
    });
}

// Każde zapytanie jest zawężone tak, by reguły Firestore mogły je dopuścić
// (publiczne: status == published; autor: authorUid == uid; admin: status == pending).
async function fetchAds(constraints) {
    const snap = await getDocs(query(collection(db, COLLECTION), where('kind', '==', KIND), ...constraints, limit(300)));
    const list = [];
    snap.forEach(s => {
        const d = s.data() || {};
        if (d.status === 'hidden' || !d.title || !d.description) return;
        list.push(toAd(s.id, d));
    });
    return list;
}

async function load() {
    const byId = new Map();
    const add = list => list.forEach(a => byId.set(a.id, a));
    try {
        add(await fetchAds([where('status', '==', STATUS_PUBLISHED)]));
    } catch (e) {
        console.warn('[CCN Ogłoszenia] Nie udało się wczytać ogłoszeń społeczności.');
    }
    const u = currentUser;
    if (isMember(u)) {
        try { add(await fetchAds([where('authorUid', '==', u.uid)])); } catch (e) { /* brak własnych */ }
    }
    pendingForAdmin = [];
    if (isAdmin(u)) {
        try {
            pendingForAdmin = await fetchAds([where('status', '==', STATUS_PENDING)]);
            add(pendingForAdmin);
        } catch (e) {
            console.warn('[CCN Ogłoszenia] Nie udało się wczytać ogłoszeń do zatwierdzenia.');
        }
    }
    remoteAds = [...byId.values()].sort((a, b) => b._ms - a._ms);
    push();
    renderAdminBar();
}

async function ensureMember() {
    if (isMember(auth.currentUser)) return auth.currentUser;
    try {
        const res = await signInWithPopup(auth, new GoogleAuthProvider());
        if (isMember(res.user)) return res.user;
    } catch (e) { /* anulowane lub zablokowane okno */ }
    throw new Error('Aby opublikować ogłoszenie, zaloguj się kontem Google (to samo konto co w LUMINA).');
}

async function publish(ad) {
    // Logowanie startuje od razu (ten sam gest kliknięcia), żeby przeglądarka nie zablokowała okna.
    const user = await ensureMember();
    const admin = isAdmin(user);
    // Wyróżnienie Patrona tylko od administratora (reguły Firestore odrzucą je od innych).
    const patron = admin && !!(ad && (ad.featured || ad.isPatron));
    const data = {
        kind: KIND,
        status: admin ? STATUS_PUBLISHED : STATUS_PENDING,
        authorUid: user.uid,
        authorName: text(user.displayName, 120),
        title: text(ad && ad.title, 140),
        type: TYPES.includes(ad && ad.type) ? ad.type : 'pomoge',
        category: CATEGORIES.includes(ad && ad.category) ? ad.category : 'inne',
        priceText: text(ad && ad.priceText, 80),
        description: text(ad && ad.description, 4000),
        location: text(ad && ad.location, 120),
        contactName: text(ad && ad.contactName, 120),
        contactEmail: text(ad && ad.contactEmail, 160),
        contactPhone: text(ad && ad.contactPhone, 40),
        luminaProfileUrl: safeUrl(ad && ad.luminaProfileUrl),
        imageUrl: safeUrl(ad && ad.imageUrl),
        mediaUrls: Array.isArray(ad && ad.mediaUrls) ? ad.mediaUrls.map(safeUrl).filter(Boolean).slice(0, 6) : [],
        youtubeUrl: safeUrl(ad && ad.youtubeUrl),
        featured: patron,
        isPatron: patron,
        patronBadge: patron ? (text(ad && ad.patronBadge, 80) || 'Patron & Mecenas CC') : '',
        createdAt: serverTimestamp()
    };
    if (!data.title || !data.description || !data.contactName) throw new Error('Wypełnij tytuł, opis oraz imię/dane kontaktowe.');
    let ref;
    try {
        ref = await addDoc(collection(db, COLLECTION), data);
    } catch (e) {
        throw new Error('Nie udało się zapisać ogłoszenia. Spróbuj ponownie za chwilę.');
    }
    const ad2 = toAd(ref.id, { ...data, createdAt: { toMillis: () => Date.now() } });
    remoteAds = [ad2, ...remoteAds.filter(a => a.id !== ad2.id)];
    push();
    return withPermissions([ad2])[0];
}

async function update(id, updatedAd) {
    if (typeof id === 'string' && id.startsWith('ann-user-')) {
        try {
            const stored = JSON.parse(localStorage.getItem('cc_community_announcements') || '[]');
            const idx = stored.findIndex(a => a.id === id);
            if (idx !== -1) {
                stored[idx] = { ...stored[idx], ...updatedAd, id };
                localStorage.setItem('cc_community_announcements', JSON.stringify(stored));
            }
        } catch (e) { console.warn(e); }
        if (typeof window.__ccOglSetAds === 'function') {
            window.__ccOglSetAds(prev => prev.map(a => a.id === id ? { ...a, ...updatedAd, id, canDelete: true, canEdit: true } : a));
        }
        return { ...updatedAd, id, canDelete: true, canEdit: true };
    }

    const user = await ensureMember();
    const existing = remoteAds.find(a => a.id === id);
    if (!existing) throw new Error('Nie znaleziono ogłoszenia do edycji.');
    const admin = isAdmin(user);
    if (!admin && existing._authorUid !== user.uid) {
        throw new Error('Tylko autor lub administrator może edytować to ogłoszenie.');
    }

    const data = {
        title: text(updatedAd && updatedAd.title, 140),
        type: TYPES.includes(updatedAd && updatedAd.type) ? updatedAd.type : existing.type,
        category: CATEGORIES.includes(updatedAd && updatedAd.category) ? updatedAd.category : existing.category,
        priceText: text(updatedAd && updatedAd.priceText, 80),
        description: text(updatedAd && updatedAd.description, 4000),
        location: text(updatedAd && updatedAd.location, 120),
        contactName: text(updatedAd && updatedAd.contactName, 120),
        contactEmail: text(updatedAd && updatedAd.contactEmail, 160) || null,
        contactPhone: text(updatedAd && updatedAd.contactPhone, 40) || null,
        luminaProfileUrl: safeUrl(updatedAd && updatedAd.luminaProfileUrl) || null,
        imageUrl: safeUrl(updatedAd && updatedAd.imageUrl) || null,
        mediaUrls: Array.isArray(updatedAd && updatedAd.mediaUrls) ? updatedAd.mediaUrls.map(safeUrl).filter(Boolean).slice(0, 6) : [],
        youtubeUrl: safeUrl(updatedAd && updatedAd.youtubeUrl) || null,
        updatedAt: serverTimestamp()
    };
    if (admin) {
        // Tylko administrator zmienia wyróżnienie Patrona; status zostaje bez zmian.
        const patron = !!(updatedAd && (updatedAd.featured || updatedAd.isPatron));
        data.featured = patron;
        data.isPatron = patron;
        data.patronBadge = patron ? (text(updatedAd && updatedAd.patronBadge, 80) || existing.patronBadge || 'Patron & Mecenas CC') : '';
    } else {
        // Edycja autora wraca do moderacji (pola Patrona nietknięte — reguły tego pilnują).
        data.status = STATUS_PENDING;
    }

    if (!data.title || !data.description || !data.contactName) {
        throw new Error('Wypełnij tytuł, opis oraz imię/dane kontaktowe.');
    }

    try {
        await updateDoc(doc(db, COLLECTION, existing._docId), data);
    } catch (e) {
        throw new Error('Nie udało się zapisać zmian. Spróbuj ponownie za chwilę.');
    }

    const updated = toAd(existing._docId, {
        ...existing,
        ...data,
        _authorUid: existing._authorUid,
        createdAt: { toMillis: () => existing._ms }
    });

    remoteAds = remoteAds.map(a => a.id === id ? updated : a);
    push();
    return withPermissions([updated])[0];
}

async function remove(id) {
    const ad = remoteAds.find(a => a.id === id);
    if (!ad) return;
    if (!window.confirm('Usunąć to ogłoszenie? Tej operacji nie można cofnąć.')) return;
    try {
        await deleteDoc(doc(db, COLLECTION, ad._docId));
        remoteAds = remoteAds.filter(a => a.id !== id);
        location.reload();
    } catch (e) {
        window.alert('Nie udało się usunąć ogłoszenia. Usunąć może tylko autor lub administrator.');
    }
}

// ── Moderacja (tylko administrator) ─────────────────────────────────────────
async function setStatus(id, status) {
    if (!isAdmin(auth.currentUser)) throw new Error('Zatwierdzać może tylko administrator.');
    const ad = remoteAds.find(a => a.id === id);
    if (!ad) throw new Error('Nie znaleziono ogłoszenia.');
    await updateDoc(doc(db, COLLECTION, ad._docId), { status, moderatedAt: serverTimestamp(), moderatedBy: auth.currentUser.uid });
    await load();
    return true;
}
const approve = id => setStatus(id, STATUS_PUBLISHED);
const reject = id => setStatus(id, STATUS_REJECTED);

const TYPE_LABELS = { oddam: 'Oddam za darmo', pomoge: 'Pomogę bo mogę', czekolada: 'Przyjmę za czekoladę', potrzebuje: 'Potrzebuję wsparcia',
    szukam_fachowca: 'Szukam fachowca', polecam_fachowca: 'Polecam fachowca', sprzedam: 'Sprzedaję', kupie: 'Kupuję', zamienie: 'Wymieniam', szukam: 'Szukam' };

function el(tag, attrs, children) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'style') n.style.cssText = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v); });
    (children || []).forEach(c => n.append(c));
    return n;
}

function closeAdminPanel() { const p = document.getElementById('ccOglAdminPanel'); if (p) p.remove(); }

function openAdminPanel() {
    closeAdminPanel();
    const btnStyle = 'min-height:44px;padding:8px 14px;border-radius:10px;font:700 14px system-ui;cursor:pointer;border:0';
    const rows = pendingForAdmin.length ? pendingForAdmin.map(a => {
        const status = el('p', { style: 'margin:6px 0 0;font:13px system-ui;color:#52525b' });
        const act = (fn, okText) => async () => {
            status.textContent = 'Zapisuję…';
            try { await fn(a.id); status.textContent = okText; openAdminPanel(); } catch (e) { status.textContent = 'Nie udało się. Spróbuj ponownie.'; }
        };
        return el('div', { style: 'border:1px solid #e4e4e7;border-radius:12px;padding:12px;margin:0 0 10px;background:#fff' }, [
            el('div', { style: 'font:700 15px system-ui;color:#18181b' }, [a.title]),
            el('div', { style: 'font:12px system-ui;color:#71717a;margin:2px 0 6px' }, [(TYPE_LABELS[a.type] || a.type) + ' • ' + a.category + ' • ' + a.location + ' • ' + a.contactName]),
            el('div', { style: 'font:13px/1.45 system-ui;color:#3f3f46;white-space:pre-wrap;max-height:9em;overflow:auto' }, [a.description]),
            el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' }, [
                el('button', { type: 'button', style: btnStyle + ';background:#15803d;color:#fff', onclick: act(approve, 'Zatwierdzone.') }, ['✅ Zatwierdź']),
                el('button', { type: 'button', style: btnStyle + ';background:#fff;color:#b91c1c;border:1px solid #fecaca', onclick: act(reject, 'Odrzucone.') }, ['❌ Odrzuć'])
            ]),
            status
        ]);
    }) : [el('p', { style: 'font:14px system-ui;color:#52525b' }, ['Brak ogłoszeń do zatwierdzenia.'])];
    const panel = el('div', { id: 'ccOglAdminPanel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ogłoszenia do zatwierdzenia',
        style: 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto',
        onclick: e => { if (e.target.id === 'ccOglAdminPanel') closeAdminPanel(); } }, [
        el('div', { style: 'background:#f4f4f5;border-radius:16px;max-width:640px;width:100%;padding:16px;margin:24px 0' }, [
            el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px' }, [
                el('h2', { style: 'margin:0;font:800 18px system-ui;color:#18181b' }, ['Do zatwierdzenia (' + pendingForAdmin.length + ')']),
                el('button', { type: 'button', 'aria-label': 'Zamknij', style: btnStyle + ';background:#fff;color:#18181b;border:1px solid #d4d4d8', onclick: closeAdminPanel }, ['Zamknij'])
            ]),
            ...rows
        ])
    ]);
    document.body.append(panel);
}

// Licznik dla administratora (bez kosztów: liczy przy wejściu na stronę).
function renderAdminBar() {
    let bar = document.getElementById('ccOglAdminBar');
    if (!isAdmin(currentUser)) { if (bar) bar.remove(); closeAdminPanel(); return; }
    if (!bar) {
        bar = el('button', { id: 'ccOglAdminBar', type: 'button', onclick: openAdminPanel,
            style: 'position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482000;min-height:44px;padding:10px 16px;border-radius:999px;border:0;font:800 14px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer' });
        document.body.append(bar);
    }
    const n = pendingForAdmin.length;
    bar.textContent = '🛎️ Do zatwierdzenia: ' + n;
    bar.style.background = n ? '#bb142e' : '#3f3f46';
    bar.style.color = '#fff';
}

window.CCOgloszeniaStore = { publish, update, remove, approve, reject, reload: load, isAdmin: () => isAdmin(currentUser) };
window.addEventListener('cc-ogloszenia-ready', push);
// onAuthStateChanged wywołuje się też raz na starcie (gość = null), więc to jedyne wczytanie.
onAuthStateChanged(auth, u => { currentUser = u; push(); load(); });
