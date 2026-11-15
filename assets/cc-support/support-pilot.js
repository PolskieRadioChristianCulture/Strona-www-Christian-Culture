/**
 * Logika pilotażu /test/wspieraj (EkoCC v2 PREMIUM Design System 2027)
 * Zachowuje 100% niezmienione metody płatności z ./config.js oraz backend /api/cc-support.
 */

import { support } from './config.js?v=20261012_ticker_v6';
import { getSupportDictionary, SUPPORT_LOCALES } from './i18n-support.js?v=20261115_pilot1';
import { copyToClipboard, initTabs, initRevealMotion, applyArchetype } from '/js/cc-design-core.js?v=20261115_pilot1';

applyArchetype('giving', 'dark');

const statusToast = document.querySelector('#status');
let toastTimer;

function announce(message) {
  if (!statusToast) return;
  statusToast.textContent = message;
  statusToast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => statusToast.classList.remove('visible'), 5000);
}

// ── 1. WIELOJĘZYCZNOŚĆ (PL, EN, DE, ES, FR + architektura gotowa na kolejne języki) ──
const LANG_STORAGE_KEY = 'cc_support_lang';
let currentLang = detectInitialLang();
let dict = getSupportDictionary(currentLang);

function detectInitialLang() {
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param && SUPPORT_LOCALES[param.toLowerCase().slice(0, 2)]) {
      return param.toLowerCase().slice(0, 2);
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORT_LOCALES[stored]) return stored;
    const navLang = (navigator.language || 'pl').toLowerCase().slice(0, 2);
    if (SUPPORT_LOCALES[navLang]) return navLang;
  } catch { /* fallback to pl */ }
  return 'pl';
}

function formatMessage(template, vars = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function applyLanguage(langCode, announceChange = false) {
  dict = getSupportDictionary(langCode);
  currentLang = dict.code;

  try {
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  } catch { /* ignore storage errors */ }

  document.documentElement.lang = currentLang;
  document.documentElement.dir = dict.dir || 'ltr';
  document.title = dict.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', dict.description);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (typeof dict[key] === 'string') {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (typeof dict[key] === 'string') {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (typeof dict[key] === 'string') {
      el.setAttribute('aria-label', dict[key]);
    }
  });

  document.querySelectorAll('.cc-lang-btn[data-lang]').forEach(btn => {
    const active = btn.dataset.lang === currentLang;
    btn.setAttribute('aria-pressed', String(active));
  });

  renderDefaultThanksItems();
  updatePauseLabel();

  if (announceChange) {
    announce(dict.toast_lang_changed);
  }
}

document.querySelectorAll('.cc-lang-btn[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.lang && btn.dataset.lang !== currentLang) {
      applyLanguage(btn.dataset.lang, true);
      loadSession();
    }
  });
});

// ── 2. KOPIOWANIE I UDOSTĘPNIANIE (100% DANYCH Z CONFIG.JS) ──
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const key = button.dataset.copy;
    const value =
      key === 'blik'
        ? support.blik
        : key === 'url'
          ? support.canonical
          : support.accounts[Number(key)]?.number || '';
    const ok = await copyToClipboard(value);
    announce(ok ? dict.toast_copied : dict.toast_copy_fail);
  });
});

const shareButton = document.querySelector('[data-share]');
if (shareButton) {
  shareButton.addEventListener('click', async () => {
    const data = {
      title: dict.title,
      text: dict.description,
      url: support.canonical
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const ok = await copyToClipboard(support.canonical);
    announce(ok ? dict.toast_share_copied : `${support.canonical}`);
  });
}

if (support.shop) {
  const shopLink = document.querySelector('#shop-link');
  if (shopLink) {
    shopLink.href = support.shop;
    shopLink.target = '_blank';
    shopLink.rel = 'noopener noreferrer';
  }
}

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ── 3. NAWIGACJA MOBILNA Z OBSŁUGĄ KLAWIATURY (ESC + FOCUS) ──
const menuButton = document.querySelector('#menu-toggle');
const nav = document.querySelector('#navigation');

function closeMenu(restoreFocus = false) {
  if (!menuButton || !nav) return;
  const wasOpen = nav.classList.contains('open');
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
  if (wasOpen && restoreFocus) menuButton.focus();
}

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    nav.classList.toggle('open', expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('header')) closeMenu(false);
  });
}

// ── 4. ZAKŁADKI FILTRUJĄCE METODY WSPARCIA (SHADCN/UI TABS PATTERN) ──
const tabsContainer = document.querySelector('#payment-tabs');
const paymentCards = Array.from(document.querySelectorAll('#payment-grid [data-category]'));

initTabs(tabsContainer, selectedCategory => {
  paymentCards.forEach(card => {
    const visible = selectedCategory === 'all' || card.dataset.category === selectedCategory;
    card.hidden = !visible;
  });
});

// ── 5. PASEK PODZIĘKOWAŃ (44x44px + REDUCED MOTION + API) ──
const thanksList = document.querySelector('#thanks-list');
const viewport = document.querySelector('#thanks-viewport');
const pauseButton = document.querySelector('#thanks-pause');

let playing = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let userInteracting = false;
let pauseUntil = 0;
let previousTime = 0;
let scrollAccumulator = 0;

if (viewport) viewport.style.scrollBehavior = 'auto';

function renderDefaultThanksItems() {
  if (!thanksList || !Array.isArray(dict.thanks_defaults)) return;
  const confirmed = Array.from(thanksList.querySelectorAll('[data-confirmed]'));
  thanksList.replaceChildren(...confirmed);
  dict.thanks_defaults.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    thanksList.append(li);
  });
  ensureTickerWidth();
}

function ensureTickerWidth() {
  if (!thanksList || !viewport) return;
  const items = Array.from(thanksList.querySelectorAll('li:not([data-clone])'));
  thanksList.querySelectorAll('[data-clone]').forEach(el => el.remove());
  for (let i = 0; i < 4; i++) {
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      thanksList.append(clone);
    });
  }
  scrollAccumulator = viewport.scrollLeft;
}

function updatePauseLabel() {
  if (!pauseButton) return;
  pauseButton.setAttribute('aria-pressed', String(playing));
  pauseButton.setAttribute('aria-label', playing ? dict.thanks_pause_label : dict.thanks_play_label);
  pauseButton.textContent = playing ? 'Ⅱ' : '▶';
}

function setPlaying(value) {
  playing = value;
  updatePauseLabel();
  if (value && viewport) {
    scrollAccumulator = viewport.scrollLeft;
    pauseUntil = 0;
  }
}

if (pauseButton) {
  pauseButton.addEventListener('click', () => setPlaying(!playing));
}

document.querySelector('#thanks-prev')?.addEventListener('click', () => {
  if (!viewport) return;
  viewport.scrollBy({ left: -260, behavior: 'smooth' });
  pauseUntil = performance.now() + 2000;
  setTimeout(() => { scrollAccumulator = viewport.scrollLeft; }, 320);
});

document.querySelector('#thanks-next')?.addEventListener('click', () => {
  if (!viewport) return;
  viewport.scrollBy({ left: 260, behavior: 'smooth' });
  pauseUntil = performance.now() + 2000;
  setTimeout(() => { scrollAccumulator = viewport.scrollLeft; }, 320);
});

if (viewport) {
  ['pointerdown', 'touchstart', 'wheel'].forEach(type => {
    viewport.addEventListener(type, () => {
      userInteracting = true;
      pauseUntil = performance.now() + 2500;
      scrollAccumulator = viewport.scrollLeft;
    }, { passive: true });
  });
  ['pointerup', 'touchend', 'pointercancel'].forEach(type => {
    window.addEventListener(type, () => {
      if (userInteracting) {
        userInteracting = false;
        pauseUntil = performance.now() + 2000;
        scrollAccumulator = viewport.scrollLeft;
      }
    }, { passive: true });
  });
  viewport.addEventListener('scroll', () => {
    if (userInteracting || !playing) scrollAccumulator = viewport.scrollLeft;
  }, { passive: true });
}

function animateThanks(time) {
  if (!previousTime) previousTime = time;
  const delta = Math.min(time - previousTime, 50);
  previousTime = time;
  if (viewport && playing && !userInteracting && !document.hidden && time > pauseUntil) {
    const maximum = viewport.scrollWidth - viewport.clientWidth;
    if (maximum > 0) {
      if (scrollAccumulator >= maximum - 1) {
        scrollAccumulator = 0;
        viewport.scrollLeft = 0;
        pauseUntil = time + 1200;
      } else {
        scrollAccumulator += delta * 0.045;
        viewport.scrollLeft = scrollAccumulator;
      }
    }
  }
  requestAnimationFrame(animateThanks);
}

// ── 6. API PODZIĘKOWAŃ I KONTO LUMINA (/api/cc-support) ──
const api = '/api/cc-support';
const authStatus = document.querySelector('#auth-status');
const consentForm = document.querySelector('#consent-form');
let session = null;
let currentLuminaAuth = null;
let currentLuminaUser = null;

async function readJson(url, options = {}) {
  const headers = { ...options.headers };
  if (options.method && options.method !== 'GET' && session?.csrfToken && !headers['X-CC-CSRF']) {
    headers['X-CC-CSRF'] = session.csrfToken;
  }
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers });
  if (!response.ok) throw new Error('Service unavailable');
  return response.json();
}

async function refreshThanks() {
  if (!thanksList) return;
  try {
    const data = await readJson(api + '/thanks');
    if (!Array.isArray(data.items)) return;
    thanksList.querySelectorAll('[data-confirmed]').forEach(el => el.remove());
    for (const item of data.items.slice(0, 50)) {
      if (typeof item.text !== 'string' || !item.text.trim()) continue;
      const li = document.createElement('li');
      li.dataset.confirmed = 'true';
      li.textContent = item.text.slice(0, 220);
      thanksList.prepend(li);
    }
    ensureTickerWidth();
  } catch { /* Zachowaj domyślne zbiorcze podziękowania */ }
}

async function getLuminaAuth() {
  if (currentLuminaAuth) return currentLuminaAuth;
  try {
    const mod = await import('/lumina-db.js?v=cc_auth_v12');
    const { auth } = await mod.ensureDbReady();
    await auth.authStateReady();
    currentLuminaAuth = auth;
    return auth;
  } catch {
    return null;
  }
}

async function loadSession() {
  if (!authStatus || !consentForm) return;
  try {
    const auth = await getLuminaAuth();
    currentLuminaUser = auth?.currentUser || null;

    if (!currentLuminaUser) {
      session = null;
      authStatus.replaceChildren();
      const span = document.createElement('span');
      span.textContent = dict.auth_logged_out + ' ';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cc-btn';
      btn.id = 'auth-status-login';
      btn.style.marginTop = '8px';
      btn.textContent = dict.auth_login_btn;
      btn.addEventListener('click', () => {
        if (typeof window.ccLoginWithGoogle === 'function') {
          window.ccLoginWithGoogle('/test/wspieraj');
        } else {
          window.location.href = 'https://polskieradio.cc/lumina?next=%2Ftest%2Fwspieraj';
        }
      });
      authStatus.append(span, btn);
      consentForm.hidden = true;
      return;
    }

    const displayName = currentLuminaUser.displayName || currentLuminaUser.email || 'LUMINA User';
    let token = '';
    try {
      token = await currentLuminaUser.getIdToken();
    } catch { /* ignore token read error */ }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      session = await readJson(api + '/session', { headers });
      authStatus.textContent = formatMessage(dict.auth_logged_in, { name: displayName });
      consentForm.hidden = false;
      document.querySelector('#public-name').value = session.publicName || '';
      document.querySelector('#public-consent').checked = session.consent === true;
      document.querySelector('#anonymous-consent').checked = session.anonymousConsent === true;
    } catch {
      authStatus.textContent = formatMessage(dict.auth_service_unavailable, { name: displayName });
      consentForm.hidden = true;
    }
  } catch {
    authStatus.textContent = dict.auth_checking;
  }
}

if (consentForm) {
  consentForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = consentForm.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      if (!currentLuminaUser) {
        announce(dict.toast_login_required);
        return;
      }
      const token = await currentLuminaUser.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      if (session?.csrfToken) headers['X-CC-CSRF'] = session.csrfToken;
      await readJson(api + '/consent', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          consent: document.querySelector('#public-consent').checked,
          anonymousConsent: document.querySelector('#anonymous-consent').checked,
          publicName: document.querySelector('#public-name').value.trim()
        })
      });
      announce(dict.toast_consent_saved);
      await refreshThanks();
    } catch {
      announce(dict.toast_consent_fail);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

for (const [own, other] of [['public-consent', 'anonymous-consent'], ['anonymous-consent', 'public-consent']]) {
  const el = document.querySelector('#' + own);
  if (el) {
    el.addEventListener('change', event => {
      if (event.target.checked) {
        const otherEl = document.querySelector('#' + other);
        if (otherEl) otherEl.checked = false;
      }
    });
  }
}

window.addEventListener('lumina-auth-state', () => loadSession());
window.addEventListener('storage', e => {
  if (e.key === 'lumina_current_user' || e.key === 'lumina_user_session') loadSession();
});
getLuminaAuth().then(auth => {
  if (auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged(() => loadSession());
  }
});

// Start systemu pilotażowego
applyLanguage(currentLang, false);
setPlaying(playing);
requestAnimationFrame(animateThanks);
initRevealMotion();
loadSession();
refreshThanks();
setInterval(() => { if (!document.hidden) refreshThanks(); }, 60000);
