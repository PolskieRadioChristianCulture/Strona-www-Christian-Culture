/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCFavorites (Ulubione CC)
 * Plik: /js/cc-favorites.js
 * 
 * Uniwersalna wtyczka „Dodaj stronę do ulubionych” w całym ekosystemie CC:
 * - Działa na wszystkich podstronach polskieradio.cc.
 * - Bezpieczna synchronizacja w czasie rzeczywistym z Firebase Firestore
 *   (/users/{userId}/favorites/{favId}) dla użytkowników LUMINA.
 * - Płynny fallback do LocalStorage dla sesji offline i gości, z automatyczną
 *   migracją po zalogowaniu (bez utraty danych i bez duplikatów).
 * - Spójna estetyka Imperial Gold & Obsidian, min. 44px cel dotyku, ZERO COST,
 *   brak kolizji z odtwarzaczami, czatem i przyciskiem powrotu na górę.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window.CCFavoritesInitialized) return;
  window.CCFavoritesInitialized = true;

  const STORAGE_KEY = 'cc_user_favorites';
  const HISTORY_KEY = 'cc_user_visit_history';
  const HISTORY_SETTINGS_KEY = 'cc_history_settings';

  let localFavorites = [];
  let firestoreDb = null;
  let authInstance = null;
  let currentUser = null;
  let listeners = [];
  let isSyncing = false;

  // 1. Pomocnicze funkcje bezpieczeństwa i kodowania
  function safeEscape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateFavId(url) {
    const clean = (url || window.location.pathname)
      .toLowerCase()
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/\/index\.html$/i, '')
      .replace(/\.html$/i, '')
      .replace(/^\/+|\/+$/g, '') || 'home';
    return clean.replace(/[^a-z0-9_-]/g, '_');
  }

  function getPageMeta() {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.pathname;
    let title = document.title || 'Strona Christian Culture';
    title = title.split('—')[0].split('|')[0].split('·')[0].trim();

    // Wykrywanie kategorii strony
    const path = window.location.pathname.toLowerCase();
    let category = 'Portal & Społeczność';
    let icon = '🌟';

    if (path.includes('biblia') || path.includes('werset') || path.includes('czuwanie')) {
      category = 'Słowo Boże & Modlitwa';
      icon = '📖';
    } else if (path.includes('akademia') || path.includes('kurs')) {
      category = 'Akademia & Kursy';
      icon = '🎓';
    } else if (path.includes('radio') || path.includes('player') || path.includes('muzyka') || path.includes('uwielbienie')) {
      category = 'Muzyka & Radio';
      icon = '🎵';
    } else if (path.includes('vod') || path.includes('kino') || path.includes('film')) {
      category = 'Kino VOD & Wideo';
      icon = '🎬';
    } else if (path.includes('news') || path.includes('nauka') || path.includes('historia')) {
      category = 'Wiedza & Publicystyka';
      icon = '📰';
    }

    return {
      id: generateFavId(canonical),
      url: window.location.pathname + (window.location.search || ''),
      title: title || 'Christian Culture',
      category: category,
      icon: icon,
      addedAt: new Date().toISOString()
    };
  }

  // 2. Ładowanie i zapisywanie lokalne (LocalStorage)
  function loadLocalFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      localFavorites = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(localFavorites)) localFavorites = [];
    } catch (e) {
      localFavorites = [];
    }
    return localFavorites;
  }

  function saveLocalFavorites(favs) {
    localFavorites = favs;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    } catch (e) {}
    notifyListeners();
  }

  function notifyListeners() {
    listeners.forEach(cb => {
      try { cb([...localFavorites]); } catch (e) {}
    });
    updateButtonUI();
  }

  // 3. Integracja z Firestore
  async function resolveFirebase() {
    if (firestoreDb && currentUser) return { db: firestoreDb, user: currentUser };

    // A. Próba z LuminaDB
    if (window.LuminaDB?.ensureDbReady) {
      try {
        const ready = await window.LuminaDB.ensureDbReady();
        firestoreDb = ready.db || window.firebaseDb;
        authInstance = ready.auth || window.firebaseAuth;
      } catch (e) {}
    }

    // B. Globalne obiekty Firebase
    if (!firestoreDb && window.firebaseDb) firestoreDb = window.firebaseDb;
    if (!authInstance && window.firebaseAuth) authInstance = window.firebaseAuth;

    // C. Odczyt bieżącego użytkownika
    if (authInstance?.currentUser) {
      currentUser = authInstance.currentUser;
    } else if (window.LuminaDB?.getCurrentUser) {
      const u = window.LuminaDB.getCurrentUser();
      if (u?.uid) currentUser = u;
    }

    return { db: firestoreDb, user: currentUser };
  }

  async function syncFromFirestore() {
    const { db, user } = await resolveFirebase();
    if (!db || !user?.uid || isSyncing) return;
    isSyncing = true;

    try {
      // Dynamiczny import lub globalne metody Firestore
      let docsList = [];
      if (window.firebaseFirestoreSDK?.getDocs) {
        const colRef = window.firebaseFirestoreSDK.collection(db, `users/${user.uid}/favorites`);
        const snap = await window.firebaseFirestoreSDK.getDocs(colRef);
        snap.forEach(d => docsList.push(d.data()));
      } else if (window.getDocs && window.collection) {
        const colRef = window.collection(db, `users/${user.uid}/favorites`);
        const snap = await window.getDocs(colRef);
        snap.forEach(d => docsList.push(d.data()));
      } else {
        // Fallback REST / Document API
        const token = user.getIdToken ? await user.getIdToken() : null;
        if (token) {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${user.uid}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.documents) {
              docsList = json.documents.map(d => {
                const f = d.fields || {};
                return {
                  id: f.id?.stringValue || '',
                  url: f.url?.stringValue || '',
                  title: f.title?.stringValue || '',
                  category: f.category?.stringValue || '',
                  icon: f.icon?.stringValue || '🌟',
                  addedAt: f.addedAt?.stringValue || ''
                };
              });
            }
          }
        }
      }

      if (docsList.length > 0) {
        // Połącz z lokalnymi, bez duplikatów
        const map = new Map();
        localFavorites.forEach(f => map.set(f.id, f));
        docsList.forEach(f => map.set(f.id, f));
        saveLocalFavorites(Array.from(map.values()));
      } else if (localFavorites.length > 0) {
        // Wypchnij lokalne do Firestore (migracja początkowa)
        for (const fav of localFavorites) {
          await writeFavoriteToFirestore(user.uid, fav);
        }
      }
    } catch (err) {
      console.warn('[CCFavorites] Synchronizacja chmurowa odłożona:', err?.message || err);
    } finally {
      isSyncing = false;
    }
  }

  async function writeFavoriteToFirestore(uid, fav) {
    const { db, user } = await resolveFirebase();
    if (!db || !uid) return;

    try {
      if (window.firebaseFirestoreSDK?.setDoc) {
        const docRef = window.firebaseFirestoreSDK.doc(db, `users/${uid}/favorites`, fav.id);
        await window.firebaseFirestoreSDK.setDoc(docRef, fav, { merge: true });
      } else if (window.setDoc && window.doc) {
        const docRef = window.doc(db, `users/${uid}/favorites`, fav.id);
        await window.setDoc(docRef, fav, { merge: true });
      } else {
        // REST
        const token = user?.getIdToken ? await user.getIdToken() : null;
        if (token) {
          await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${uid}/favorites/${fav.id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                id: { stringValue: fav.id },
                url: { stringValue: fav.url },
                title: { stringValue: fav.title },
                category: { stringValue: fav.category },
                icon: { stringValue: fav.icon },
                addedAt: { stringValue: fav.addedAt }
              }
            })
          });
        }
      }
    } catch (e) {
      console.warn('[CCFavorites] Zapis do Firestore odłożony:', e?.message || e);
    }
  }

  async function deleteFavoriteFromFirestore(uid, favId) {
    const { db, user } = await resolveFirebase();
    if (!db || !uid) return;

    try {
      if (window.firebaseFirestoreSDK?.deleteDoc) {
        const docRef = window.firebaseFirestoreSDK.doc(db, `users/${uid}/favorites`, favId);
        await window.firebaseFirestoreSDK.deleteDoc(docRef);
      } else if (window.deleteDoc && window.doc) {
        const docRef = window.doc(db, `users/${uid}/favorites`, favId);
        await window.deleteDoc(docRef);
      } else {
        const token = user?.getIdToken ? await user.getIdToken() : null;
        if (token) {
          await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${uid}/favorites/${favId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
    } catch (e) {
      console.warn('[CCFavorites] Usunięcie z Firestore odłożone:', e?.message || e);
    }
  }

  // 4. API Publiczne Ulubionych
  async function isFavorite(url) {
    const targetId = generateFavId(url || window.location.pathname);
    return localFavorites.some(f => f.id === targetId);
  }

  async function addFavorite(item) {
    const fav = item || getPageMeta();
    fav.id = fav.id || generateFavId(fav.url);
    fav.addedAt = fav.addedAt || new Date().toISOString();

    const existingIndex = localFavorites.findIndex(f => f.id === fav.id);
    if (existingIndex >= 0) {
      localFavorites[existingIndex] = fav;
    } else {
      localFavorites.unshift(fav);
    }
    saveLocalFavorites([...localFavorites]);

    const { user } = await resolveFirebase();
    if (user?.uid) {
      await writeFavoriteToFirestore(user.uid, fav);
    }
    showToast(`⭐ Dodano do Ulubionych: "${fav.title}"`, true);
    return fav;
  }

  async function removeFavorite(urlOrId) {
    const targetId = generateFavId(urlOrId);
    const removed = localFavorites.find(f => f.id === targetId);
    const updated = localFavorites.filter(f => f.id !== targetId);
    saveLocalFavorites(updated);

    const { user } = await resolveFirebase();
    if (user?.uid) {
      await deleteFavoriteFromFirestore(user.uid, targetId);
    }
    if (removed) {
      showToast(`Usunięto z Ulubionych: "${removed.title}"`, false);
    }
    return targetId;
  }

  async function toggleFavorite(item) {
    const fav = item || getPageMeta();
    const isFav = await isFavorite(fav.url);
    if (isFav) {
      await removeFavorite(fav.url);
      return false;
    } else {
      await addFavorite(fav);
      return true;
    }
  }

  function getFavorites() {
    return [...localFavorites];
  }

  function onFavoritesChange(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
      callback([...localFavorites]);
    }
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }

  // 5. Opcjonalna Historia Odwiedzin (za zgodą)
  function recordPageVisit() {
    try {
      const settings = JSON.parse(localStorage.getItem(HISTORY_SETTINGS_KEY) || '{"enabled":true}');
      if (!settings.enabled) return;

      const path = window.location.pathname;
      if (path.includes('admin') || path.includes('embed') || path.includes('live')) return;

      let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const currentMeta = getPageMeta();

      // Usuń duplikat bieżącej strony i wstaw na początek
      history = history.filter(h => h.id !== currentMeta.id);
      history.unshift({
        id: currentMeta.id,
        url: currentMeta.url,
        title: currentMeta.title,
        category: currentMeta.category,
        icon: currentMeta.icon,
        visitedAt: new Date().toISOString()
      });

      // Zachowaj maks. 12 ostatnich stron
      if (history.length > 12) history = history.slice(0, 12);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  function getVisitHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function clearVisitHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
  }

  function setHistoryEnabled(enabled) {
    try {
      localStorage.setItem(HISTORY_SETTINGS_KEY, JSON.stringify({ enabled: Boolean(enabled) }));
      if (!enabled) clearVisitHistory();
    } catch (e) {}
  }

  function isHistoryEnabled() {
    try {
      const settings = JSON.parse(localStorage.getItem(HISTORY_SETTINGS_KEY) || '{"enabled":true}');
      return Boolean(settings.enabled);
    } catch (e) {
      return true;
    }
  }

  // 6. Toast & Komunikat UI
  function showToast(text, isAdded) {
    let toast = document.getElementById('ccFavToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ccFavToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 84px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(15, 20, 30, 0.95);
        color: #f1f5f9;
        border: 1px solid rgba(196, 163, 90, 0.45);
        padding: 10px 18px;
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(196, 163, 90, 0.25);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.88rem;
        font-weight: 600;
        z-index: 9999999;
        opacity: 0;
        pointer-events: auto;
        transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }

    let innerHtml = `<span>${safeEscape(text)}</span>`;
    if (isAdded) {
      innerHtml += `<a href="/moje-centrum" style="color:#ffd978; text-decoration:underline; font-weight:700; margin-left:4px; font-size:0.82rem;">Moje Centrum &rarr;</a>`;
    }
    toast.innerHTML = innerHtml;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  // 7. Wstrzykiwanie Przycisków i Stylów UI
  function ensureStyles() {
    if (document.getElementById('cc-fav-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-fav-styles';
    style.textContent = `
      .cc-fav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 44px;
        min-height: 44px;
        padding: 6px 12px;
        border-radius: 12px;
        border: 1px solid rgba(196, 163, 90, 0.35);
        background: rgba(255, 255, 255, 0.05);
        color: #d1d5db;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        touch-action: manipulation;
        box-sizing: border-box;
      }
      .cc-fav-btn:hover {
        background: rgba(196, 163, 90, 0.15);
        border-color: rgba(196, 163, 90, 0.6);
        color: #f1f5f9;
      }
      .cc-fav-btn.is-active {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.25), rgba(217, 119, 6, 0.2));
        border-color: #c4a35a;
        color: #ffd978;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.3);
      }
      .cc-fav-btn svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cc-fav-btn.is-active svg {
        fill: #c4a35a;
        stroke: #c4a35a;
        transform: scale(1.1);
      }

      /* ── Gwiazdka w Górnej Belce (Top Bar Star) ── */
      .cc-topbar-fav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        border-radius: 12px;
        border: 1px solid rgba(196, 163, 90, 0.35);
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        touch-action: manipulation;
        box-sizing: border-box;
        flex-shrink: 0;
        margin: 0 4px;
      }
      .cc-topbar-fav-btn:hover {
        background: rgba(196, 163, 90, 0.18);
        border-color: rgba(196, 163, 90, 0.7);
        color: #ffd978;
        transform: translateY(-1px);
      }
      .cc-topbar-fav-btn.is-active {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.28), rgba(217, 119, 6, 0.22));
        border-color: #c4a35a;
        color: #ffd978;
        box-shadow: 0 0 16px rgba(196, 163, 90, 0.38);
      }
      .cc-topbar-fav-btn svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), fill 0.2s ease, stroke 0.2s ease;
      }
      .cc-topbar-fav-btn:hover svg {
        stroke: #c4a35a;
        transform: scale(1.12);
      }
      .cc-topbar-fav-btn.is-active svg {
        fill: #c4a35a;
        stroke: #c4a35a;
        transform: scale(1.12);
        animation: ccStarPulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes ccStarPulse {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.35); }
        100% { transform: scale(1.12); }
      }

      /* Pływająca belka dla stron bez dedykowanego kontenera nawigacji */
      .cc-floating-topbar-wrap {
        position: fixed;
        top: max(14px, env(safe-area-inset-top));
        right: max(16px, env(safe-area-inset-right));
        z-index: 99998;
        display: flex;
        align-items: center;
        pointer-events: auto;
      }

      /* Motyw Jasny */
      [data-theme="light"] .cc-fav-btn,
      [data-lumina-theme="light"] .cc-fav-btn {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #475569;
      }
      [data-theme="light"] .cc-fav-btn:hover,
      [data-lumina-theme="light"] .cc-fav-btn:hover {
        background: #f8fafc;
        border-color: #c4a35a;
        color: #0f172a;
      }
      [data-theme="light"] .cc-fav-btn.is-active,
      [data-lumina-theme="light"] .cc-fav-btn.is-active {
        background: #fef3c7;
        border-color: #d97706;
        color: #92400e;
      }
      [data-theme="light"] .cc-topbar-fav-btn,
      [data-lumina-theme="light"] .cc-topbar-fav-btn {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(196, 163, 90, 0.4);
        color: #64748b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }
      [data-theme="light"] .cc-topbar-fav-btn:hover,
      [data-lumina-theme="light"] .cc-topbar-fav-btn:hover {
        background: #fefce8;
        border-color: #c4a35a;
        color: #b45309;
      }
      [data-theme="light"] .cc-topbar-fav-btn.is-active,
      [data-lumina-theme="light"] .cc-topbar-fav-btn.is-active {
        background: #fef3c7;
        border-color: #d97706;
        color: #b45309;
        box-shadow: 0 0 14px rgba(217, 119, 6, 0.25);
      }

      /* Integracja z paskiem szybkiej nawigacji CC GO (.quick) */
      .quick .cc-topbar-fav-btn {
        width: 76px;
        min-width: 76px;
        height: auto;
        min-height: auto;
        padding: 0;
        margin: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        font: inherit;
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--ink, #fff);
        line-height: inherit;
      }
      .quick .cc-topbar-fav-btn span {
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--ink, #fff);
        line-height: 1.2;
      }
      .quick .cc-topbar-fav-btn .ic,
      .quick .cc-topbar-fav-btn svg.ic {
        width: 52px;
        height: 52px;
        min-width: 52px;
        min-height: 52px;
        padding: 14px;
        border-radius: 18px;
        background: var(--surface, #083a46);
        border: 1px solid var(--line, rgba(24, 228, 242, 0.18));
        color: var(--ink, #fff);
        box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.12));
        stroke-width: 1.9;
        box-sizing: border-box;
        transition: background 0.2s, border-color 0.2s, color 0.2s, fill 0.2s;
      }
      .quick .cc-topbar-fav-btn:hover,
      [data-theme="light"] .quick .cc-topbar-fav-btn:hover,
      [data-lumina-theme="light"] .quick .cc-topbar-fav-btn:hover {
        background: transparent;
        border-color: transparent;
        transform: none;
        color: var(--ink, #fff);
      }
      .quick .cc-topbar-fav-btn:hover .ic,
      .quick .cc-topbar-fav-btn:hover svg.ic {
        background: var(--yellow, #ffd23f);
        border-color: var(--yellow, #ffd23f);
        color: #0b1a24;
        transform: none;
      }
      .quick .cc-topbar-fav-btn.is-active,
      [data-theme="light"] .quick .cc-topbar-fav-btn.is-active,
      [data-lumina-theme="light"] .quick .cc-topbar-fav-btn.is-active {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
      }
      .quick .cc-topbar-fav-btn.is-active .ic,
      .quick .cc-topbar-fav-btn.is-active svg.ic {
        background: var(--surface, #083a46);
        border-color: var(--yellow, #ffd23f);
        color: var(--yellow, #ffd23f);
        fill: currentColor;
        box-shadow: none;
        animation: none;
      }
      .quick .cc-topbar-fav-btn.is-active:hover .ic,
      .quick .cc-topbar-fav-btn.is-active:hover svg.ic {
        background: var(--yellow, #ffd23f);
        border-color: var(--yellow, #ffd23f);
        color: #0b1a24;
        fill: #0b1a24;
      }
    `;
    document.head.appendChild(style);
  }

  function updateButtonUI() {
    const isFav = localFavorites.some(f => f.id === generateFavId(window.location.pathname));
    document.querySelectorAll('[data-cc-favorite-toggle]').forEach(btn => {
      if (isFav) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Strona jest w Twoich Ulubionych (kliknij, aby usunąć)');
        const textSpan = btn.querySelector('.cc-fav-text');
        if (textSpan) textSpan.textContent = 'W Ulubionych';
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Dodaj tę stronę do Ulubionych');
        const textSpan = btn.querySelector('.cc-fav-text');
        if (textSpan) textSpan.textContent = 'Dodaj do ulubionych';
      }
    });
  }

  // 8. Wstrzykiwanie Gwiazdki w Górnej Belce (Top Bar Integration)
  function injectTopBarFavoriteButton() {
    if (document.getElementById('ccTopBarFavBtn')) return;
    const path = window.location.pathname.toLowerCase();
    // Bezpieczeństwo kanałów transmisyjnych LIVE i narzędzi operatorskich
    if (/(?:live|stream|obs|embed|admin|cctv24)/i.test(path)) return;

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.id = 'ccTopBarFavBtn';
    favBtn.className = 'cc-topbar-fav-btn cc-fav-btn';
    favBtn.setAttribute('data-cc-favorite-toggle', 'true');
    favBtn.setAttribute('aria-label', 'Dodaj tę stronę do Ulubionych');
    favBtn.setAttribute('title', 'Dodaj tę stronę do Ulubionych');
    favBtn.innerHTML = `
      <svg class="cc-fav-star-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;

    const candidates = [
      '.hub-nav-actions',                       // Moje Centrum CC (/moje-centrum)
      '.lumina-nav-actions',                     // Portal LUMINA, Tablica, Profile (/lumina, /tablica, /lumina-profile)
      '.site-header .nav-right',                 // Biblijne Uwielbienie (/BiblijneUwielbienie)
      '.nav-right',                              // Ogólne belki nav-right
      '#quickActionsMenu',                       // Strona Główna Radia CC (index.html)
      '.header-right',                           // Nagłówek Radia CC
      '.top-nav .nav-links',                     // Wyszukiwarka /szukaj
      'header .nav-links',                       // Ogólne nagłówki
      'header .nav-actions',                     // Ogólne akcje nagłówka
      'header nav',                              // Ogólna nawigacja w headerze
      'nav .nav-right',
      'nav'
    ];

    let mounted = false;
    for (const selector of candidates) {
      const container = document.querySelector(selector);
      if (container) {
        if (selector === '.hub-nav-actions') {
          favBtn.classList.add('hub-btn-icon');
          container.insertBefore(favBtn, container.firstChild);
        } else if (selector === '.site-header .nav-right') {
          favBtn.classList.add('nav-icon-btn');
          container.insertBefore(favBtn, container.firstChild);
        } else if (selector === '#quickActionsMenu' || selector === '.header-right') {
          container.insertBefore(favBtn, container.firstChild);
        } else if (selector === '.lumina-nav-actions') {
          container.insertBefore(favBtn, container.firstChild);
        } else if (selector === '.top-nav .nav-links') {
          const themeBtn = container.querySelector('#themeToggleBtn') || container.querySelector('.theme-toggle-btn');
          if (themeBtn) {
            container.insertBefore(favBtn, themeBtn);
          } else {
            container.appendChild(favBtn);
          }
        } else {
          if (container.classList.contains('quick') || selector === 'nav') {
            favBtn.innerHTML = `
              <svg class="ic cc-fav-star-icon" viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Ulubione</span>
            `;
          }
          container.appendChild(favBtn);
        }
        mounted = true;
        break;
      }
    }

    // Fallback dla stron bez dedykowanego kontenera w górnej belce (np. SPA werset-dnia)
    if (!mounted && document.body) {
      let wrap = document.getElementById('ccFloatingTopBarWrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'ccFloatingTopBarWrap';
        wrap.className = 'cc-floating-topbar-wrap';
        document.body.appendChild(wrap);
      }
      wrap.appendChild(favBtn);
    }
  }

  function wirePageElements() {
    ensureStyles();
    injectTopBarFavoriteButton();

    // Rejestracja kliknięć we wszystkie przyciski [data-cc-favorite-toggle]
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cc-favorite-toggle]');
      if (btn) {
        e.preventDefault();
        toggleFavorite();
      }
    });

    // Wstępna synchronizacja
    loadLocalFavorites();
    recordPageVisit();
    updateButtonUI();

    // Nasłuchiwanie stanu logowania
    if (window.LuminaDB?.onAuthChange) {
      window.LuminaDB.onAuthChange((u) => {
        currentUser = u;
        if (u) syncFromFirestore();
      });
    } else {
      setTimeout(() => {
        resolveFirebase().then(() => syncFromFirestore());
      }, 1000);
    }

    // Druga próba wstrzyknięcia dla stron renderujących nagłówek asynchronicznie (np. SPA)
    setTimeout(() => {
      injectTopBarFavoriteButton();
      updateButtonUI();
    }, 600);
  }

  // 9. Eksport do przestrzeni globalnej
  window.CCFavorites = {
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavorites,
    onFavoritesChange,
    getVisitHistory,
    clearVisitHistory,
    setHistoryEnabled,
    isHistoryEnabled,
    recordVisit: recordPageVisit,
    getPageMeta,
    syncFromFirestore,
    injectTopBarButton: injectTopBarFavoriteButton
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wirePageElements);
  } else {
    wirePageElements();
  }

})();

