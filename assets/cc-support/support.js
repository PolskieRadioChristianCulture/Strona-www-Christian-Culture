import { support } from './config.js?v=20261012_ticker_v6';

const status = document.querySelector('#status');
let timer;
function announce(message) {
  status.textContent = message;
  status.classList.add('visible');
  clearTimeout(timer);
  timer = setTimeout(() => status.classList.remove('visible'), 5000);
}

async function copy(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(value); return true; } catch { /* fallback */ }
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;top:0;left:-9999px';
  const previous = document.activeElement;
  document.body.append(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* manual copy remains available */ }
  field.remove();
  previous?.focus();
  return copied;
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const key = button.dataset.copy;
    const value = button.dataset.copyText || (key === 'blik' ? support.blik : key === 'url' ? support.canonical : (support.accounts[Number(key)] ? support.accounts[Number(key)].number : key));
    announce(await copy(value) ? 'Skopiowano do schowka.' : 'Nie udało się skopiować. Zaznacz widoczny numer i skopiuj go ręcznie.');
  });
});

document.querySelector('[data-share]').addEventListener('click', async () => {
  const data = { title: 'Razem niesiemy nadzieję dalej — Christian Culture', text: 'Pomóż nieść Ewangelię dalej. Wybierz swoją formę wsparcia Christian Culture.', url: support.canonical };
  if (navigator.share) {
    try { await navigator.share(data); return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  announce(await copy(support.canonical) ? 'Link skopiowany. Możesz wkleić go w wiadomości.' : 'Udostępnij adres: ' + support.canonical);
});

const menuButton = document.querySelector('#menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('open', expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });

if (support.shop) {
  const link = document.querySelector('#shop-link');
  if (link) {
    link.href = support.shop;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Odwiedź sklep CC →';
  }
}
document.querySelector('#year').textContent = new Date().getFullYear();

// No names, payments or counts are fabricated. Public API returns confirmed,
// consented acknowledgments only. Generic collective thanks remain available.
const thanksList = document.querySelector('#thanks-list');
const viewport = document.querySelector('#thanks-viewport');
const pauseButton = document.querySelector('#thanks-pause');
if (viewport) {
  viewport.style.scrollBehavior = 'auto';
}

let playing = true;
let userInteracting = false;
let pauseUntil = 0;
let previousTime = 0;
let scrollAccumulator = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Duplikuj elementy listy żeby scrollWidth > clientWidth (ticker infinite scroll)
function ensureTickerWidth() {
  const items = Array.from(thanksList.querySelectorAll('li:not([data-clone])'));
  // Usuń stare klony
  thanksList.querySelectorAll('[data-clone]').forEach(el => el.remove());
  // Dodaj 4 kopie żeby lista była bezwzględnie dłuższa niż viewport na każdym ekranie
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
ensureTickerWidth();

function setPlaying(value) {
  playing = value;
  pauseButton.setAttribute('aria-pressed', String(value));
  pauseButton.setAttribute('aria-label', value ? 'Zatrzymaj przewijanie' : 'Włącz automatyczne przewijanie');
  pauseButton.textContent = value ? 'Ⅱ' : '▶';
  if (value) {
    scrollAccumulator = viewport.scrollLeft;
    pauseUntil = 0;
  }
}
pauseButton.addEventListener('click', () => setPlaying(!playing));

// Strzałki nawigacyjne: przewiń i wstrzymaj na 2s, ale nie wyłączaj trwale autoodtwarzania
document.querySelector('#thanks-prev').addEventListener('click', () => {
  viewport.scrollBy({ left: -300, behavior: 'smooth' });
  pauseUntil = performance.now() + 2000;
  setTimeout(() => { scrollAccumulator = viewport.scrollLeft; }, 320);
});
document.querySelector('#thanks-next').addEventListener('click', () => {
  viewport.scrollBy({ left: 300, behavior: 'smooth' });
  pauseUntil = performance.now() + 2000;
  setTimeout(() => { scrollAccumulator = viewport.scrollLeft; }, 320);
});

// Dotyk i interakcja użytkownika: chwilowe wstrzymanie zamiast trwałego wyłączenia
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
  if (userInteracting || !playing) {
    scrollAccumulator = viewport.scrollLeft;
  }
}, { passive: true });

function animateThanks(time) {
  if (!previousTime) previousTime = time;
  const delta = Math.min(time - previousTime, 50);
  previousTime = time;

  if (playing && !userInteracting && !document.hidden && time > pauseUntil) {
    const maximum = viewport.scrollWidth - viewport.clientWidth;
    if (maximum > 0) {
      if (scrollAccumulator >= maximum - 1) {
        scrollAccumulator = 0;
        viewport.scrollLeft = 0;
        pauseUntil = time + 1200;
      } else {
        scrollAccumulator += delta * 0.05;
        viewport.scrollLeft = scrollAccumulator;
      }
    }
  }
  requestAnimationFrame(animateThanks);
}

// Startuj automatyczne przewijanie domyślnie
setPlaying(true);
requestAnimationFrame(animateThanks);

async function readJson(url, options = {}) {
  const headers = { ...options.headers };
  if (options.method && options.method !== 'GET' && session?.csrfToken && !headers['X-CC-CSRF']) {
    headers['X-CC-CSRF'] = session.csrfToken;
  }
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers });
  if (!response.ok) throw new Error('Service unavailable');
  return response.json();
}

const authStatus = document.querySelector('#auth-status');
const consentForm = document.querySelector('#consent-form');
const loginLink = document.querySelector('#login-link');
const api = '/api/cc-support';
let session = null;
let currentLuminaAuth = null;
let currentLuminaUser = null;

// Przycisk "Zaloguj się" wywołuje window.ccLoginWithGoogle('/wspieraj')
if (loginLink) {
  loginLink.addEventListener('click', (event) => {
    if (!currentLuminaUser) {
      event.preventDefault();
      if (typeof window.ccLoginWithGoogle === 'function') {
        window.ccLoginWithGoogle('/wspieraj');
      } else {
        window.location.href = 'https://polskieradio.cc/lumina?next=%2Fwspieraj';
      }
    }
  });
}

async function refreshThanks() {
  try {
    const data = await readJson(api + '/thanks');
    if (!Array.isArray(data.items)) return;
    thanksList.querySelectorAll('[data-confirmed]').forEach(item => item.remove());
    for (const item of data.items.slice(0, 50)) {
      if (typeof item.text !== 'string' || !item.text.trim()) continue;
      const li = document.createElement('li');
      li.dataset.confirmed = 'true';
      li.textContent = item.text.slice(0, 220);
      thanksList.prepend(li);
    }
    ensureTickerWidth();
  } catch { /* No placeholder supporters, no fake recent payments. */ }
}

async function getLuminaAuth() {
  if (currentLuminaAuth) return currentLuminaAuth;
  try {
    const mod = await import('/lumina-db.js?v=cc_auth_v12');
    const { auth } = await mod.ensureDbReady();
    await auth.authStateReady();
    currentLuminaAuth = auth;
    return auth;
  } catch (err) {
    console.warn('LuminaDB auth import:', err);
    return null;
  }
}

async function loadSession() {
  try {
    const auth = await getLuminaAuth();
    currentLuminaUser = auth?.currentUser || null;

    if (!currentLuminaUser) {
      session = null;
      if (loginLink) {
        loginLink.textContent = 'Zaloguj się';
        loginLink.href = 'https://polskieradio.cc/lumina?next=%2Fwspieraj';
      }
      authStatus.innerHTML = 'Zaloguj się w LUMINA, aby zarządzać zgodą na podziękowania. <button type="button" class="btn small" id="auth-status-login" style="margin-top:8px;display:inline-block;">Zaloguj się przez Google</button>';
      const inlineLoginBtn = document.querySelector('#auth-status-login');
      if (inlineLoginBtn) {
        inlineLoginBtn.addEventListener('click', () => {
          if (typeof window.ccLoginWithGoogle === 'function') {
            window.ccLoginWithGoogle('/wspieraj');
          } else {
            window.location.href = 'https://polskieradio.cc/lumina?next=%2Fwspieraj';
          }
        });
      }
      consentForm.hidden = true;
      return;
    }

    // Stan konta LUMINA: ZALOGOWANY
    const displayName = currentLuminaUser.displayName || currentLuminaUser.email || 'Użytkownik LUMINA';
    if (loginLink) {
      loginLink.textContent = 'Moje podziękowania';
      loginLink.href = '#moje-podziekowania';
    }

    let token = '';
    try {
      token = await currentLuminaUser.getIdToken();
    } catch (e) {
      console.warn('getIdToken:', e);
    }

    // Zapytanie do bazy podziękowań z tokenem Bearer
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      session = await readJson(api + '/session', { headers });
      authStatus.textContent = `Jesteś zalogowany (${displayName}). Możesz wybrać publiczną nazwę i zarządzać zgodą.`;
      consentForm.hidden = false;
      document.querySelector('#public-name').value = session.publicName || '';
      document.querySelector('#public-consent').checked = session.consent === true;
      document.querySelector('#anonymous-consent').checked = session.anonymousConsent === true;
    } catch (dbErr) {
      // ROZDZIELENIE STANU LOGOWANIA OD DOSTĘPNOŚCI BAZY:
      // Błąd bazy NIE MOŻE oznaczać, że konto LUMINA jest wylogowane!
      authStatus.textContent = `Jesteś zalogowany w LUMINA jako ${displayName}. Usługa preferencji podziękowań jest chwilowo niedostępna.`;
      consentForm.hidden = true;
    }
  } catch (err) {
    console.error('Błąd sesji:', err);
    authStatus.textContent = 'Sprawdzanie stanu konta LUMINA…';
  }
}

consentForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = consentForm.querySelector('button');
  button.disabled = true;
  try {
    if (!currentLuminaUser) {
      announce('Zaloguj się w LUMINA przed zapisaniem ustawień.');
      return;
    }
    const token = await currentLuminaUser.getIdToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    if (session?.csrfToken) {
      headers['X-CC-CSRF'] = session.csrfToken;
    }
    await readJson(api + '/consent', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        consent: document.querySelector('#public-consent').checked,
        anonymousConsent: document.querySelector('#anonymous-consent').checked,
        publicName: document.querySelector('#public-name').value.trim()
      })
    });
    announce('Zapisano ustawienia podziękowań.');
    if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportFormSubmit === 'function') {
      window.CCAnalyticsMC.trackSupportFormSubmit('thanks_consent');
    }
    await refreshThanks();
  } catch {
    announce('Nie zapisano ustawień. Spróbuj ponownie za chwilę.');
  } finally {
    button.disabled = false;
  }
});

// Nasłuchiwanie zdarzeń stanu autoryzacji
window.addEventListener('lumina-auth-state', () => {
  loadSession();
});

window.addEventListener('storage', (e) => {
  if (e.key === 'lumina_current_user' || e.key === 'lumina_user_session') {
    loadSession();
  }
});

getLuminaAuth().then(auth => {
  if (auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged(() => {
      loadSession();
    });
  }
});

loadSession();
refreshThanks();
setInterval(() => { if (!document.hidden) refreshThanks(); }, 60000);

for (const [own, other] of [['public-consent','anonymous-consent'],['anonymous-consent','public-consent']]) {
  document.querySelector('#' + own).addEventListener('change', event => { if (event.target.checked) document.querySelector('#' + other).checked = false; });
}

