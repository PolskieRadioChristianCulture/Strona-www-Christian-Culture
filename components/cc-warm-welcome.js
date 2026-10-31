/**
 * CC Warm Welcome (CCRE M8)
 * Subtelne, nienachalne powitanie dla gości ekosystemu Christian Culture.
 * Architektura: Vanilla JS, 100% on-device (LocalStorage), ZERO COST, WCAG 2.2 AA.
 */

const STORAGE_KEY = 'cc_warm_welcome_v1';
const DEFAULT_CONFIG = {
  enabled: true,
  delayMs: 10000,           // 10s opóźnienia
  autoHideMs: 0,            // 0 = brak autozamykania (czeka na interakcję)
  cooldownHours: 24,        // 24 godziny przerwy między odsłonami
  badgeText: 'Christian Culture',
  title: 'Pokój temu domowi! ✨',
  message: 'Cieszymy się, że tu jesteś. Zanurz się w Słowie Bożym, słuchowisku Biblia Audio i kojącej muzyce radiowej 24/7.',
  actionLabel: 'Słuchaj Radia LIVE',
  actionUrl: '/player',
  optOutLabel: 'Nie pokazuj więcej'
};

function getSafeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {}
  return null;
}

function readState(storage) {
  if (!storage) {
    return { version: 1, lastShownAt: null, dismissedForever: false, impressionCount: 0, firstSeenAt: Date.now() };
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { version: 1, lastShownAt: null, dismissedForever: false, impressionCount: 0, firstSeenAt: Date.now() };
}

function writeState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function shouldShow(config, state, now) {
  if (!config.enabled) return false;
  if (state.dismissedForever) return false;
  if (state.lastShownAt) {
    const elapsedHours = (now - state.lastShownAt) / (1000 * 60 * 60);
    if (elapsedHours < config.cooldownHours) {
      return false;
    }
  }
  return true;
}

export class WarmWelcomeManager {
  constructor(userConfig = {}) {
    this.config = Object.assign({}, DEFAULT_CONFIG, userConfig);
    this.storage = getSafeStorage();
    this.state = readState(this.storage);
    this.hostElement = null;
    this.cardElement = null;
    this.timerId = null;
    this.autoHideTimer = null;
    this.isRendered = false;
  }

  init() {
    if (typeof window !== 'undefined' && window.CCRE_CONFIG) {
      if (window.CCRE_CONFIG.enabled === false) return this;
      if (window.CCRE_CONFIG.modules && window.CCRE_CONFIG.modules.warmWelcome === false) return this;
    }

    const now = Date.now();
    if (!shouldShow(this.config, this.state, now)) {
      return this;
    }

    if (typeof document === 'undefined') return this;

    this.timerId = setTimeout(() => {
      this.render();
    }, this.config.delayMs);

    return this;
  }

  render() {
    if (this.isRendered || typeof document === 'undefined') return;

    const host = document.createElement('aside');
    host.className = 'cc-warm-welcome-host';
    host.setAttribute('aria-label', 'Powitanie Christian Culture');
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');

    const card = document.createElement('div');
    card.className = 'cc-warm-welcome-card';

    // Nagłówek
    const header = document.createElement('div');
    header.className = 'cc-warm-welcome-header';

    const badge = document.createElement('span');
    badge.className = 'cc-warm-welcome-badge';
    badge.textContent = this.config.badgeText;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cc-warm-welcome-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Zamknij powitanie');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.dismiss());

    header.appendChild(badge);
    header.appendChild(closeBtn);

    // Treść
    const title = document.createElement('h3');
    title.className = 'cc-warm-welcome-title';
    title.textContent = this.config.title;

    const body = document.createElement('p');
    body.className = 'cc-warm-welcome-body';
    body.textContent = this.config.message;

    // Akcje
    const actions = document.createElement('div');
    actions.className = 'cc-warm-welcome-actions';

    const actionBtn = document.createElement('a');
    actionBtn.className = 'cc-ww-btn-primary';
    actionBtn.href = this.config.actionUrl;
    actionBtn.textContent = this.config.actionLabel;
    actionBtn.addEventListener('click', () => {
      this.markShown();
    });

    const optOutBtn = document.createElement('button');
    optOutBtn.className = 'cc-ww-btn-subtle';
    optOutBtn.setAttribute('type', 'button');
    optOutBtn.textContent = this.config.optOutLabel;
    optOutBtn.addEventListener('click', () => this.optOut());

    actions.appendChild(actionBtn);
    actions.appendChild(optOutBtn);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(actions);
    host.appendChild(card);

    // Obsługa ESC
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.dismiss();
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    document.body.appendChild(host);
    this.hostElement = host;
    this.cardElement = card;
    this.isRendered = true;

    requestAnimationFrame(() => {
      card.classList.add('is-visible');
    });

    this.markShown();

    if (this.config.autoHideMs > 0) {
      this.autoHideTimer = setTimeout(() => {
        this.dismiss();
      }, this.config.autoHideMs);
    }
  }

  markShown() {
    this.state.lastShownAt = Date.now();
    this.state.impressionCount = (this.state.impressionCount || 0) + 1;
    writeState(this.storage, this.state);
  }

  dismiss() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    if (this.cardElement) {
      this.cardElement.classList.remove('is-visible');
      setTimeout(() => {
        if (this.hostElement && this.hostElement.parentNode) {
          this.hostElement.parentNode.removeChild(this.hostElement);
        }
        this.hostElement = null;
        this.cardElement = null;
        this.isRendered = false;
      }, 400);
    }
  }

  optOut() {
    this.state.dismissedForever = true;
    this.state.lastShownAt = Date.now();
    writeState(this.storage, this.state);
    this.dismiss();
  }

  getState() {
    return Object.assign({}, this.state);
  }

  reset() {
    this.state = { version: 1, lastShownAt: null, dismissedForever: false, impressionCount: 0, firstSeenAt: Date.now() };
    writeState(this.storage, this.state);
  }
}

const CCWarmWelcome = {
  WarmWelcomeManager,
  create: (cfg) => new WarmWelcomeManager(cfg),
  shouldShow
};

if (typeof globalThis !== 'undefined') {
  globalThis.CCWarmWelcome = CCWarmWelcome;
}

export { shouldShow };
export default CCWarmWelcome;
