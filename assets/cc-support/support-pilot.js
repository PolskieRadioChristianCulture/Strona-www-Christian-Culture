/**
 * CHRISTIAN CULTURE — WSPIERAJ 2.0 PREMIUM (/test/wspieraj)
 * Moduł wykonawczy: zero zależności zewnętrznych, i18n JSON, Zero-PII GA4,
 * obsługa zakładek WAI-ARIA, kopiowanie rachunków PLN/IBAN/BLIK, konto LUMINA.
 */

import { support } from './config.js?v=20261012_ticker_v6';
import {
  getSupportDictionary,
  loadSupportLocale,
  normalizeSupportLocale,
  SUPPORT_LOCALES
} from './i18n-support.js?v=20261115_wspieraj2';
import {
  applyArchetype,
  copyToClipboard,
  initRevealMotion,
  initTabs
} from '../../js/cc-design-core.js?v=20261115_p1';

const LOCALE_STORAGE_KEY = 'cc.support.locale';
const LEGACY_LANG_KEY = 'cc_support_lang';
const SUGGEST_DISMISS_KEY = 'cc.support.langSuggestDismissed';
const SUPPORT_API = '/api/cc-support';

const ROUTE_LOCALE_MAP = [
  { prefix: '/test/wspieraj/en/support', code: 'en' },
  { prefix: '/test/wspieraj/de/unterstuetzen', code: 'de' },
  { prefix: '/test/wspieraj/es/apoyar', code: 'es' },
  { prefix: '/test/wspieraj/fr/soutenir', code: 'fr' }
];

const ALLOWED_EVENTS = new Set([
  'support_view',
  'support_method_select',
  'support_copy_account',
  'support_external_click',
  'support_nonfinancial_select',
  'support_locale_change'
]);

const FORBIDDEN_PII_KEYS = new Set([
  'account',
  'iban',
  'blik',
  'phone',
  'email',
  'name',
  'displayname',
  'publicname',
  'user',
  'uid',
  'token',
  'amount'
]);

function looksLikePiiValue(rawValue) {
  const val = String(rawValue ?? '');
  if (!val) return false;
  if (val.includes('@')) return true;
  // Blokada ciągów przypominających numer rachunku (IBAN/NRB) lub telefonu (>= 7 cyfr łącznie)
  const digits = val.replace(/\D/g, '');
  if (digits.length >= 7) return true;
  if (/^PL\d{6,}/i.test(val.replace(/\s+/g, ''))) return true;
  return false;
}

export function sanitizeAnalyticsParams(params = {}) {
  const safe = {};
  if (!params || typeof params !== 'object') return safe;
  for (const [key, val] of Object.entries(params)) {
    const cleanKey = String(key || '').trim();
    if (!cleanKey || FORBIDDEN_PII_KEYS.has(cleanKey.toLowerCase())) continue;
    if (val === undefined || val === null) continue;
    if (typeof val === 'boolean' || typeof val === 'number') {
      safe[cleanKey] = val;
      continue;
    }
    const str = String(val).trim().slice(0, 80);
    if (!str || looksLikePiiValue(str)) continue;
    safe[cleanKey] = str;
  }
  return safe;
}

export function trackSupportEvent(eventName, params = {}) {
  if (!ALLOWED_EVENTS.has(eventName)) return null;
  const payload = {
    is_test: true,
    locale: currentLang,
    ...sanitizeAnalyticsParams(params)
  };
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
      window.dataLayer.push({ event: eventName, ...payload });
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
    }
  } catch {
    /* Analityka opcjonalna nigdy nie blokuje UX */
  }
  return payload;
}

let currentLang = 'pl';
let currentDict = getSupportDictionary('pl');
let statusTimer = null;
let currentLuminaAuth = null;
let currentLuminaUser = null;
let currentSession = null;

function announce(message) {
  const box = document.querySelector('#status');
  if (!box) return;
  box.textContent = String(message || '');
  box.classList.add('visible');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    box.classList.remove('visible');
  }, 5000);
}

function getRouteLocale() {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const matched = ROUTE_LOCALE_MAP.find(item => path === item.prefix || path.startsWith(item.prefix + '/'));
  return matched ? matched.code : null;
}

function getQueryLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('lang') || params.get('locale');
    if (candidate && normalizeSupportLocale(candidate)) {
      const normalized = normalizeSupportLocale(candidate);
      return Object.prototype.hasOwnProperty.call(SUPPORT_LOCALES, normalized) ? normalized : null;
    }
  } catch {
    return null;
  }
  return null;
}

function readStoredLocale() {
  try {
    const primary = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (primary) return normalizeSupportLocale(primary);
    const legacy = window.localStorage.getItem(LEGACY_LANG_KEY);
    if (legacy) {
      const norm = normalizeSupportLocale(legacy);
      window.localStorage.setItem(LOCALE_STORAGE_KEY, norm);
      return norm;
    }
  } catch {
    /* Prywatny tryb przeglądania */
  }
  return null;
}

function saveStoredLocale(code) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    /* Pomijamy błąd magazynu */
  }
}

function detectSuggestedBrowserLocale(activeLocale) {
  if (typeof navigator === 'undefined') return null;
  try {
    if (window.sessionStorage.getItem(SUGGEST_DISMISS_KEY) === '1') return null;
  } catch {
    /* Ignoruj */
  }
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  for (const raw of candidates) {
    const base = String(raw || '').toLowerCase().split(/[-_]/)[0];
    if (base && Object.prototype.hasOwnProperty.call(SUPPORT_LOCALES, base) && base !== activeLocale) {
      return base;
    }
  }
  return null;
}

function renderDefaultThanks(dict) {
  const track = document.querySelector('#thanks-track');
  if (!track) return;
  const hasConfirmed = track.querySelector('[data-confirmed="true"]');
  if (hasConfirmed) return;
  track.querySelectorAll('[data-clone]').forEach(el => el.remove());
  const defaults = Array.isArray(dict.thanks_defaults) ? dict.thanks_defaults : [];
  if (!defaults.length) return;
  track.innerHTML = '';
  defaults.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    track.append(li);
  });
  ensureTickerWidth();
}

function applyDictionaryToDom(dict) {
  currentDict = dict;
  currentLang = dict.code || 'pl';

  document.documentElement.lang = currentLang;
  document.documentElement.dir = dict.dir || 'ltr';

  if (dict.title) document.title = dict.title;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta && dict.description) descMeta.setAttribute('content', dict.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && (dict.og_title || dict.title)) ogTitle.setAttribute('content', dict.og_title || dict.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && (dict.og_description || dict.description)) ogDesc.setAttribute('content', dict.og_description || dict.description);
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale && dict.locale) ogLocale.setAttribute('content', dict.locale);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && typeof dict[key] === 'string') {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key && typeof dict[key] === 'string') {
      el.setAttribute('aria-label', dict[key]);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && typeof dict[key] === 'string') {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  document.querySelectorAll('.cc-lang-btn[data-lang]').forEach(btn => {
    const active = btn.dataset.lang === currentLang;
    btn.setAttribute('aria-pressed', String(active));
  });

  renderDefaultThanks(dict);
  updateAuthCopyOnly();
}

async function setLanguage(code, { persist = true, userInitiated = false } = {}) {
  const target = normalizeSupportLocale(code);
  const syncDict = getSupportDictionary(target);
  applyDictionaryToDom(syncDict);

  if (persist) {
    saveStoredLocale(target);
    const suggestBanner = document.querySelector('#lang-suggestion');
    if (suggestBanner) suggestBanner.hidden = true;
  }

  if (userInitiated) {
    trackSupportEvent('support_locale_change', { target_locale: target });
    announce(syncDict.toast_lang_changed || target.toUpperCase());
  }

  // Asynchroniczna synchronizacja z JSON-em z /assets/cc-support/locales/<lang>.json
  const asyncDict = await loadSupportLocale(target);
  if (asyncDict && asyncDict.code === currentLang) {
    applyDictionaryToDom(asyncDict);
  }
}

function initLanguageBanner(explicitLocale) {
  const banner = document.querySelector('#lang-suggestion');
  const textEl = document.querySelector('#lang-suggestion-text');
  const acceptBtn = document.querySelector('#lang-suggestion-accept');
  const dismissBtn = document.querySelector('#lang-suggestion-dismiss');
  if (!banner || !textEl || !acceptBtn || !dismissBtn || explicitLocale) return;

  const suggestedCode = detectSuggestedBrowserLocale(currentLang);
  if (!suggestedCode) return;

  const suggestedDict = getSupportDictionary(suggestedCode);
  textEl.textContent = suggestedDict.lang_suggest_prompt || '';
  acceptBtn.textContent = suggestedDict.lang_suggest_accept || suggestedCode.toUpperCase();
  dismissBtn.textContent = suggestedDict.lang_suggest_dismiss || 'OK';
  banner.hidden = false;

  acceptBtn.addEventListener('click', () => {
    setLanguage(suggestedCode, { persist: true, userInitiated: true });
    banner.hidden = true;
  });

  dismissBtn.addEventListener('click', () => {
    banner.hidden = true;
    try {
      window.sessionStorage.setItem(SUGGEST_DISMISS_KEY, '1');
    } catch {
      /* Ignoruj */
    }
  });
}

function initNavigation() {
  const menuBtn = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#pilot-nav');
  if (!menuBtn || !nav) return;

  const closeMenu = () => {
    menuBtn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  };

  menuBtn.addEventListener('click', () => {
    const nextState = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(nextState));
    nav.classList.toggle('open', nextState);
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.pilot-header')) closeMenu();
  });
}

function resolveCopyPayload(key) {
  const acc0 = support.accounts?.[0]?.number || '74291000062469800210628039';
  const acc1 = support.accounts?.[1]?.number || '48291000060000000005272629';
  switch (key) {
    case 'blik':
      return { value: support.blik || '537137043', method: 'blik' };
    case 'acc1':
    case '0':
      return { value: acc0, method: 'bank_account_1' };
    case 'iban1':
      return { value: 'PL' + acc0, method: 'bank_iban_1' };
    case 'acc2':
    case '1':
      return { value: acc1, method: 'bank_account_2' };
    case 'iban2':
      return { value: 'PL' + acc1, method: 'bank_iban_2' };
    case 'url':
      return { value: window.location.href, method: 'share_url' };
    default:
      return { value: '', method: 'unknown' };
  }
}

function initCopyAndShare() {
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const key = button.dataset.copy || '';
      const { value, method } = resolveCopyPayload(key);
      if (!value) return;
      const ok = await copyToClipboard(value);
      trackSupportEvent('support_copy_account', { method, success: ok });
      if (button.dataset.nonfinancial) {
        trackSupportEvent('support_nonfinancial_select', { action: button.dataset.nonfinancial });
      }
      announce(ok
        ? (key === 'url' ? currentDict.toast_share_copied : currentDict.toast_copied)
        : currentDict.toast_copy_fail);
    });
  });

  const shareBtn = document.querySelector('[data-share]');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      trackSupportEvent('support_nonfinancial_select', { action: 'share_native' });
      const data = {
        title: currentDict.og_title || currentDict.title,
        text: currentDict.hero_intro,
        url: support.canonical
      };
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (err) {
          if (err?.name === 'AbortError') return;
        }
      }
      const ok = await copyToClipboard(support.canonical);
      announce(ok ? currentDict.toast_share_copied : `${support.canonical}`);
    });
  }

  document.querySelectorAll('[data-outbound]').forEach(link => {
    link.addEventListener('click', () => {
      trackSupportEvent('support_external_click', {
        target: link.dataset.outbound || 'external'
      });
    });
  });

  document.querySelectorAll('[data-nonfinancial]').forEach(el => {
    if (el.hasAttribute('data-copy') || el.hasAttribute('data-share')) return;
    el.addEventListener('click', () => {
      trackSupportEvent('support_nonfinancial_select', {
        action: el.dataset.nonfinancial || 'community'
      });
    });
  });
}

function applyTabFilter(tabId) {
  const panels = document.querySelectorAll('[data-tab-panel]');
  panels.forEach(panel => {
    const match = tabId === 'all' || panel.dataset.tabPanel === tabId;
    panel.hidden = !match;
  });
}

function initPaymentSection() {
  const tabList = document.querySelector('#payment-tabs');
  if (!tabList) return;

  initTabs(tabList, tabId => {
    applyTabFilter(tabId);
    trackSupportEvent('support_method_select', { method: tabId });
  });

  document.querySelectorAll('[data-select-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wanted = btn.dataset.selectTab || 'all';
      const targetTab = tabList.querySelector(`[data-tab="${wanted}"]`);
      if (targetTab) {
        targetTab.click();
      } else {
        applyTabFilter(wanted);
      }
      const panel = document.querySelector('#panel-wsparcia');
      if (panel && typeof panel.scrollIntoView === 'function') {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
}

function drawQrFallback(ctx, size) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#07121D';
  ctx.fillRect(14, 14, 44, 44);
  ctx.fillRect(size - 58, 14, 44, 44);
  ctx.fillRect(14, size - 58, 44, 44);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(22, 22, 28, 28);
  ctx.fillRect(size - 50, 22, 28, 28);
  ctx.fillRect(22, size - 50, 28, 28);
  ctx.fillStyle = '#07121D';
  ctx.fillRect(30, 30, 12, 12);
  ctx.fillRect(size - 42, 30, 12, 12);
  ctx.fillRect(30, size - 42, 12, 12);
}

function initQrCodeBox() {
  const toggleBtn = document.querySelector('[data-qr-btn]');
  const qrBox = document.querySelector('[data-qr-box]');
  const canvas = document.querySelector('[data-qr-canvas]');
  const downloadBtn = document.querySelector('[data-qr-download]');
  if (!toggleBtn || !qrBox || !canvas) return;

  let loaded = false;
  const ensureQrDrawn = () => {
    if (loaded) return;
    loaded = true;
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => drawQrFallback(ctx, canvas.width);
    img.src = '/assets/cc-support/support-qr.png';
  };

  toggleBtn.addEventListener('click', () => {
    const isHidden = qrBox.hidden;
    qrBox.hidden = !isHidden;
    toggleBtn.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) {
      ensureQrDrawn();
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      ensureQrDrawn();
      const link = document.createElement('a');
      link.download = 'christian-culture-wsparcie-qr.png';
      try {
        link.href = canvas.toDataURL('image/png');
      } catch {
        link.href = '/assets/cc-support/support-qr.png';
      }
      link.click();
    });
  }
}

/* ── Ticker podziękowań (Zero-Regression, WCAG pause & arrows) ── */
let tickerPlaying = true;
let tickerInteracting = false;
let tickerPauseUntil = 0;
let tickerPrevTime = 0;
let tickerAccumulator = 0;

function ensureTickerWidth() {
  const track = document.querySelector('#thanks-track');
  const viewport = document.querySelector('.pilot-thanks-viewport');
  if (!track || !viewport) return;
  const items = Array.from(track.querySelectorAll('li:not([data-clone])'));
  track.querySelectorAll('[data-clone]').forEach(el => el.remove());
  if (!items.length) return;
  for (let i = 0; i < 4; i++) {
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      track.append(clone);
    });
  }
  tickerAccumulator = viewport.scrollLeft;
}

function initThanksTicker() {
  const track = document.querySelector('#thanks-track');
  const viewport = document.querySelector('.pilot-thanks-viewport');
  const toggleBtn = document.querySelector('#thanks-toggle');
  const prevBtn = document.querySelector('#thanks-prev');
  const nextBtn = document.querySelector('#thanks-next');
  if (!track || !viewport) return;

  viewport.style.scrollBehavior = 'auto';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (reduced?.matches) {
    tickerPlaying = false;
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.textContent = '▶';
    }
  }

  ensureTickerWidth();

  const pauseBriefly = (ms = 4000) => {
    tickerPauseUntil = performance.now() + ms;
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      tickerPlaying = !tickerPlaying;
      toggleBtn.setAttribute('aria-pressed', String(!tickerPlaying));
      toggleBtn.textContent = tickerPlaying ? '❚❚' : '▶';
      toggleBtn.setAttribute(
        'aria-label',
        tickerPlaying ? currentDict.thanks_pause_label : currentDict.thanks_play_label
      );
      if (tickerPlaying) {
        tickerAccumulator = viewport.scrollLeft;
        tickerPauseUntil = 0;
      }
    });
  }

  const nudge = dir => {
    pauseBriefly(5000);
    const next = Math.max(0, viewport.scrollLeft + dir * 220);
    viewport.scrollLeft = next;
    tickerAccumulator = next;
  };

  prevBtn?.addEventListener('click', () => nudge(-1));
  nextBtn?.addEventListener('click', () => nudge(1));

  viewport.addEventListener('pointerdown', () => { tickerInteracting = true; pauseBriefly(5000); });
  window.addEventListener('pointerup', () => { tickerInteracting = false; });
  viewport.addEventListener('mouseenter', () => { tickerInteracting = true; });
  viewport.addEventListener('mouseleave', () => { tickerInteracting = false; });
  viewport.addEventListener('focusin', () => { tickerInteracting = true; });
  viewport.addEventListener('focusout', () => { tickerInteracting = false; });

  const step = now => {
    if (!tickerPrevTime) tickerPrevTime = now;
    const dt = Math.min(48, now - tickerPrevTime);
    tickerPrevTime = now;

    if (tickerPlaying && !tickerInteracting && now >= tickerPauseUntil && !document.hidden) {
      const half = Math.max(0, track.scrollWidth / 5);
      if (half > 0) {
        tickerAccumulator += (dt / 1000) * 34;
        if (tickerAccumulator >= half) tickerAccumulator -= half;
        viewport.scrollLeft = tickerAccumulator;
      }
    } else {
      tickerAccumulator = viewport.scrollLeft;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

async function refreshConfirmedThanks() {
  try {
    const res = await fetch(`${SUPPORT_API}/thanks`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const data = await res.json();
    const track = document.querySelector('#thanks-track');
    if (!track || !Array.isArray(data?.items) || !data.items.length) return;
    track.querySelectorAll('[data-confirmed="true"]').forEach(el => el.remove());
    for (const item of data.items.slice(0, 50)) {
      if (typeof item?.text !== 'string' || !item.text.trim()) continue;
      const li = document.createElement('li');
      li.dataset.confirmed = 'true';
      li.textContent = item.text.trim().slice(0, 220);
      track.prepend(li);
    }
    ensureTickerWidth();
  } catch {
    /* Zbiorcze podziękowania pozostają aktywne offline i bez bazy */
  }
}

/* ── Konto LUMINA i wycofalna zgoda bez PII finansowego ── */
function updateAuthCopyOnly() {
  const statusText = document.querySelector('#auth-status-text');
  if (!statusText) return;
  if (!currentLuminaUser) {
    statusText.textContent = currentDict.auth_logged_out || '';
    return;
  }
  const userName = currentLuminaUser.displayName || currentLuminaUser.email || 'LUMINA';
  if (currentSession) {
    statusText.textContent = (currentDict.auth_logged_in || '').replace('{name}', userName);
  } else {
    statusText.textContent = (currentDict.auth_service_unavailable || '').replace('{name}', userName);
  }
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

function triggerGoogleLogin() {
  const nextUrl = encodeURIComponent(window.location.pathname || '/test/wspieraj');
  if (typeof window.ccLoginWithGoogle === 'function') {
    window.ccLoginWithGoogle(window.location.pathname || '/test/wspieraj');
  } else {
    window.location.href = `/lumina?next=${nextUrl}`;
  }
}

async function loadLuminaSession() {
  const statusText = document.querySelector('#auth-status-text');
  const loginBtn = document.querySelector('#auth-login-btn');
  const consentForm = document.querySelector('#consent-form');
  const navAuth = document.querySelector('#cc-auth-nav-container');
  if (!statusText || !loginBtn || !consentForm) return;

  try {
    const auth = await getLuminaAuth();
    currentLuminaUser = auth?.currentUser || null;

    if (!currentLuminaUser) {
      currentSession = null;
      loginBtn.hidden = false;
      consentForm.hidden = true;
      updateAuthCopyOnly();
      if (navAuth) {
        navAuth.innerHTML = `<button type="button" class="cc-btn cc-btn-ghost" id="nav-login-btn">${currentDict.auth_login_btn || 'Zaloguj'}</button>`;
        navAuth.querySelector('#nav-login-btn')?.addEventListener('click', triggerGoogleLogin);
      }
      return;
    }

    loginBtn.hidden = true;
    const displayName = currentLuminaUser.displayName || currentLuminaUser.email || 'LUMINA';
    if (navAuth) {
      navAuth.innerHTML = `<a href="#moje-podziekowania" class="cc-btn cc-btn-secondary">${displayName.split(' ')[0]}</a>`;
    }

    let token = '';
    try {
      token = await currentLuminaUser.getIdToken();
    } catch {
      token = '';
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${SUPPORT_API}/session`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentSession = await res.json();
      consentForm.hidden = false;

      const nameInput = document.querySelector('#consent-name');
      const publicChk = document.querySelector('#consent-public');
      const anonChk = document.querySelector('#consent-anonymous');
      if (nameInput) nameInput.value = currentSession.publicName || '';
      if (publicChk) publicChk.checked = currentSession.consent === true;
      if (anonChk) anonChk.checked = currentSession.anonymousConsent === true;
      updateAuthCopyOnly();
    } catch {
      currentSession = null;
      consentForm.hidden = true;
      updateAuthCopyOnly();
    }
  } catch {
    currentSession = null;
    loginBtn.hidden = false;
    consentForm.hidden = true;
    updateAuthCopyOnly();
  }
}

function initConsentForm() {
  const loginBtn = document.querySelector('#auth-login-btn');
  const form = document.querySelector('#consent-form');
  const submitBtn = document.querySelector('#consent-submit');
  const publicChk = document.querySelector('#consent-public');
  const anonChk = document.querySelector('#consent-anonymous');

  loginBtn?.addEventListener('click', triggerGoogleLogin);

  publicChk?.addEventListener('change', () => {
    if (publicChk.checked && anonChk) anonChk.checked = false;
  });
  anonChk?.addEventListener('change', () => {
    if (anonChk.checked && publicChk) publicChk.checked = false;
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentLuminaUser) {
      announce(currentDict.toast_login_required);
      return;
    }
    if (submitBtn) submitBtn.disabled = true;
    try {
      const token = await currentLuminaUser.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      if (currentSession?.csrfToken) {
        headers['X-CC-CSRF'] = currentSession.csrfToken;
      }
      const res = await fetch(`${SUPPORT_API}/consent`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          consent: Boolean(publicChk?.checked),
          anonymousConsent: Boolean(anonChk?.checked),
          publicName: (document.querySelector('#consent-name')?.value || '').trim().slice(0, 60)
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      announce(currentDict.toast_consent_saved);
      await refreshConfirmedThanks();
    } catch {
      announce(currentDict.toast_consent_fail);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function bootstrap() {
  applyArchetype('giving', 'dark');

  const routeLocale = getRouteLocale();
  const queryLocale = getQueryLocale();
  const storedLocale = readStoredLocale();
  const initialLocale = routeLocale || queryLocale || storedLocale || 'pl';
  const hasExplicitLocale = Boolean(routeLocale || queryLocale || storedLocale);

  setLanguage(initialLocale, { persist: Boolean(routeLocale || queryLocale), userInitiated: false });
  initLanguageBanner(hasExplicitLocale ? initialLocale : null);

  document.querySelectorAll('.cc-lang-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang, { persist: true, userInitiated: true });
    });
  });

  initNavigation();
  initThanksTicker();
  initPaymentSection();
  initQrCodeBox();
  initCopyAndShare();
  initConsentForm();
  initRevealMotion(document);

  trackSupportEvent('support_view', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '/test/wspieraj'
  });

  refreshConfirmedThanks();
  loadLuminaSession();

  window.addEventListener('lumina-auth-state', loadLuminaSession);
  window.addEventListener('storage', event => {
    if (event.key === 'lumina_current_user' || event.key === 'lumina_user_session') {
      loadLuminaSession();
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
}
