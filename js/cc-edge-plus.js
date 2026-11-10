/* CC public-page standard: CC-EDGE-PLUS-001. No account, storage, network or analytics access. */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CCEdgePlus = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  // Słownik tłumaczeń dostępnościowych
  const i18nLabels = {
    pl: {
      open: 'Otwórz panel Christian Culture',
      close: 'Zamknij panel Christian Culture',
      tooltip: 'Panel Christian Culture'
    },
    en: {
      open: 'Open Christian Culture panel',
      close: 'Close Christian Culture panel',
      tooltip: 'Christian Culture panel'
    },
    de: {
      open: 'Christian Culture Panel öffnen',
      close: 'Christian Culture Panel schließen',
      tooltip: 'Christian Culture Panel'
    }
  };

  function getLocale() {
    if (typeof window === 'undefined') return 'pl';
    if (window.CCPageI18n?.locale) return window.CCPageI18n.locale;
    if (window.EkoCCI18n && typeof window.EkoCCI18n.getLocale === 'function') {
      return window.EkoCCI18n.getLocale();
    }
    const htmlLang = (document.documentElement && document.documentElement.lang) || 'pl';
    return htmlLang.slice(0, 2).toLowerCase();
  }

  function getLabel(key) {
    const loc = getLocale();
    return i18nLabels[loc]?.[key] || i18nLabels.pl[key] || i18nLabels.pl.open;
  }

  // Domyślna konfiguracja komponentu
  const DEFAULT_OPTIONS = {
    threshold: 300,
    mobileLeft: 16,
    mobileBottom: 20,
    desktopLeft: 24,
    desktopBottom: 24,
    dialogId: 'cc-mobile-edge-dialog',
    buttonId: 'ccEdgePlusBtn'
  };

  let config = Object.assign({}, DEFAULT_OPTIONS);
  let buttonEl = null;
  let tooltipEl = null;
  let styleEl = null;
  let isMounted = false;
  let isPendingFrame = false;
  let previousFocusEl = null;
  let scrollListenerAttached = false;

  // Sprawdzenie wykluczeń stron (OBS, transmisje na żywo, ekrany operatorskie, herbatka)
  function isExcludedPage() {
    if (typeof location === 'undefined') return false;
    const path = (location.pathname || '').toLowerCase();
    if (/^\/(?:mess|herbatka)(?:\.html|\/|$)/i.test(path)) return true;
    if (/(?:live|stream|obs|embed|admin|mission\.control|pilot|cctv24|bcm24|lumi-kids\/app|ccmc)/i.test(path)) return true;
    if (document.body?.dataset.ccEdgeDisabled === 'true' || document.documentElement.dataset.ccEdgeDisabled === 'true') return true;
    return false;
  }

  // Sprawdzenie otwartych okien modalnych lub trybu pełnoekranowego
  function isModalOrFullscreenActive() {
    if (typeof document === 'undefined') return false;
    if (document.fullscreenElement) return true;
    const openModals = document.querySelectorAll('dialog[open]:not(#' + config.dialogId + '), [aria-modal="true"]:not([hidden]):not(#' + config.dialogId + ')');
    for (let i = 0; i < openModals.length; i++) {
      const modal = openModals[i];
      const rect = modal.getBoundingClientRect();
      const style = window.getComputedStyle(modal);
      if (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') {
        return true;
      }
    }
    return false;
  }

  // Wstrzyknięcie dedykowanego arkusza stylów CC-EDGE-PLUS-001 & CC-EDGE-001..003
  function injectStyles() {
    if (document.getElementById('cc-edge-plus-styles')) return;
    styleEl = document.createElement('style');
    styleEl.id = 'cc-edge-plus-styles';
    const nonceMeta = document.querySelector('meta[name="cc-csp-nonce"]');
    if (nonceMeta && nonceMeta.content) styleEl.nonce = nonceMeta.content;

    styleEl.textContent = `
      :root {
        --cc-floating-bottom: max(16px, env(safe-area-inset-bottom, 16px));
        --cc-floating-size: 48px;
      }
      @media (min-width: 768px) {
        :root {
          --cc-floating-bottom: 24px;
        }
      }
      body:has(.mobile-nav, .lumina-nav-bottom, [data-floating-bottom-bar]) {
        --cc-floating-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
      }
      @media (min-width: 900px) {
        body:has(.mobile-nav) {
          --cc-floating-bottom: 24px;
        }
      }

      #ccEdgePlusBtn {
        position: fixed !important;
        z-index: 990 !important;
        left: max(${config.mobileLeft}px, env(safe-area-inset-left, ${config.mobileLeft}px)) !important;
        bottom: var(--cc-floating-bottom, max(${config.mobileBottom}px, env(safe-area-inset-bottom, ${config.mobileBottom}px))) !important;
        right: auto !important;
        top: auto !important;
        width: var(--cc-floating-size, 48px) !important;
        height: var(--cc-floating-size, 48px) !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 50% !important;
        border: 1px solid #b08a3c !important;
        background: #ffffff !important;
        color: #63470e !important;
        box-shadow: 0 3px 14px rgba(0, 0, 0, 0.15) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        margin: 0 !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(12px) scale(0.92);
        transition: opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
                    visibility 200ms cubic-bezier(0.16, 1, 0.3, 1),
                    bottom 200ms cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 150ms ease,
                    background-color 150ms ease,
                    box-shadow 150ms ease !important;
      }

      @media (min-width: 768px) {
        #ccEdgePlusBtn {
          left: ${config.desktopLeft}px !important;
        }
      }

      #ccEdgePlusBtn.is-visible {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(0) scale(1) !important;
      }

      #ccEdgePlusBtn:hover {
        border-color: #8c6a28 !important;
        color: #3b2a08 !important;
        background: #fdfaf3 !important;
        box-shadow: 0 5px 18px rgba(0, 0, 0, 0.2) !important;
        transform: translateY(0) scale(1.06) !important;
      }

      #ccEdgePlusBtn:active {
        transform: translateY(0) scale(0.96) !important;
      }

      #ccEdgePlusBtn:focus-visible {
        outline: 3px solid #2563eb !important;
        outline-offset: 3px !important;
      }

      /* Motyw ciemny — dopasowanie do ciemnych stron */
      html[data-theme="dark"] #ccEdgePlusBtn,
      html[data-lumina-theme="dark"] #ccEdgePlusBtn,
      html.dark #ccEdgePlusBtn,
      body.dark #ccEdgePlusBtn,
      body[data-theme="dark"] #ccEdgePlusBtn,
      body.theme-lumina-dark #ccEdgePlusBtn {
        background: #171923 !important;
        color: #ffe2a1 !important;
        border: 1px solid #b08a3c !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), 0 0 10px rgba(196, 163, 90, 0.2) !important;
      }

      html[data-theme="dark"] #ccEdgePlusBtn:hover,
      html[data-lumina-theme="dark"] #ccEdgePlusBtn:hover,
      html.dark #ccEdgePlusBtn:hover,
      body.dark #ccEdgePlusBtn:hover,
      body[data-theme="dark"] #ccEdgePlusBtn:hover,
      body.theme-lumina-dark #ccEdgePlusBtn:hover {
        background: #1f2333 !important;
        color: #ffffff !important;
        border-color: #d4b578 !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 14px rgba(196, 163, 90, 0.35) !important;
      }

      /* Poszanowanie preferencji zredukowanego ruchu */
      @media (prefers-reduced-motion: reduce) {
        #ccEdgePlusBtn {
          transition: none !important;
          transform: none !important;
        }
        #ccEdgePlusBtn:hover {
          transform: none !important;
        }
        #ccEdgePlusBtn:active {
          transform: none !important;
        }
      }

      /* Tooltip podpowiedzi desktopowej */
      .cc-edge-plus-tooltip {
        position: fixed;
        z-index: 991;
        left: calc(${config.desktopLeft}px + 56px);
        bottom: calc(var(--cc-floating-bottom, ${config.desktopBottom}px) + 10px);
        background: rgba(15, 18, 26, 0.94);
        color: #f5eedf;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid rgba(196, 163, 90, 0.4);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transform: translateX(-6px);
        transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
        white-space: nowrap;
      }

      @media (max-width: 767px) {
        .cc-edge-plus-tooltip { display: none !important; }
      }

      #ccEdgePlusBtn:hover + .cc-edge-plus-tooltip,
      #ccEdgePlusBtn:focus-visible + .cc-edge-plus-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
      }
    `;

    document.head.appendChild(styleEl);
  }

  // Pobranie lub utworzenie elementu przycisku
  function createButton() {
    let btn = document.getElementById(config.buttonId);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = config.buttonId;
      btn.type = 'button';
      btn.setAttribute('data-cc-edge-plus', '');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-controls', config.dialogId);
      btn.setAttribute('aria-expanded', 'false');

      // SVG Ikona "+"
      btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
      `;

      document.body.appendChild(btn);
    }

    applyI18nLabels(btn);

    // Desktopowy Tooltip
    let tooltip = document.querySelector('.cc-edge-plus-tooltip');
    if (!tooltip && typeof document !== 'undefined') {
      tooltip = document.createElement('div');
      tooltip.className = 'cc-edge-plus-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.id = 'ccEdgePlusTooltip';
      tooltip.textContent = getLabel('tooltip');
      btn.after(tooltip);
      tooltipEl = tooltip;
    }

    btn.addEventListener('click', onButtonClick);

    return btn;
  }

  // Aktualizacja etykiet i18n
  function applyI18nLabels(btn = buttonEl) {
    if (!btn) return;
    const label = getLabel('open');
    btn.setAttribute('aria-label', label);
    btn.title = label;
    if (tooltipEl) {
      tooltipEl.textContent = getLabel('tooltip');
    }
  }

  // Otwarcie istniejącego panelu krawędziowego Christian Culture
  function openPanel() {
    const dialog = document.getElementById(config.dialogId);
    previousFocusEl = document.activeElement;

    // 1. Sprawdź czy dialog istnieje
    if (dialog && typeof dialog.showModal === 'function') {
      if (!dialog.open) {
        // Spróbuj użyć istniejącego triggera, aby zachować pełną logikę CCMobileEdge
        const existingTrigger = document.querySelector('.cc-mobile-edge-trigger, #topNavMenuBtn, #ccOmniEdgeBtn, #menuToggleBtn');
        if (existingTrigger && existingTrigger !== buttonEl && typeof existingTrigger.click === 'function') {
          existingTrigger.click();
        } else {
          dialog.showModal();
          document.body.style.overflow = 'hidden';
        }
      }
    } else {
      // 2. Jeśli dialog jeszcze się nie zainicjował, kliknij w menu / burger
      const burger = document.querySelector('.cc-mobile-edge-trigger, #topNavMenuBtn, #ccOmniEdgeBtn, .btn-burger, #menuToggleBtn, #hamburgerBtn');
      if (burger && typeof burger.click === 'function') {
        burger.click();
      }
    }

    if (buttonEl) {
      buttonEl.setAttribute('aria-expanded', 'true');
    }
  }

  // Zamknięcie panelu krawędziowego
  function closePanel() {
    const dialog = document.getElementById(config.dialogId);
    if (dialog && dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
    if (buttonEl) {
      buttonEl.setAttribute('aria-expanded', 'false');
    }
    if (previousFocusEl && previousFocusEl.isConnected && typeof previousFocusEl.focus === 'function') {
      previousFocusEl.focus({ preventScroll: true });
    }
  }

  // Przełączenie panelu
  function togglePanel() {
    const dialog = document.getElementById(config.dialogId);
    if (dialog && dialog.open) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // Obsługa kliknięcia przycisku "+"
  function onButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    openPanel();
  }

  // Wspólny mechanizm pozycjonowania dolnych przycisków (Dyrektywa CC-EDGE-002..003)
  function updateFloatingBottom() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const height = window.innerHeight;
    let bottom = window.innerWidth >= 768 ? 24 : 16;

    // 1. Sprawdzenie stałego paska nawigacji na dole (np. CC GO .mobile-nav)
    const navEl = document.querySelector('.mobile-nav, .lumina-nav-bottom, [data-floating-bottom-bar]');
    if (navEl) {
      const cs = window.getComputedStyle(navEl);
      if (cs.display !== 'none' && cs.visibility !== 'hidden') {
        const rect = navEl.getBoundingClientRect();
        if (rect.height > 0 && rect.top < height) {
          bottom = Math.max(bottom, Math.round(height - rect.top + 12));
        }
      }
    }

    // 2. Obsługa LUMINA Action Base
    const luminaTheme = document.querySelector('#luminaThemeSwitchBtn');
    if (luminaTheme) {
      const luminaBase = window.getComputedStyle(document.body).getPropertyValue('--cc-lumina-action-base');
      if (luminaBase && luminaBase.trim()) {
        const baseTrimmed = luminaBase.trim();
        if (document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
          document.documentElement.style.setProperty('--cc-floating-bottom', baseTrimmed);
        }
        if (document.body && document.body.style && typeof document.body.style.setProperty === 'function') {
          document.body.style.setProperty('--cc-floating-bottom', baseTrimmed);
        }
        if (buttonEl) {
          buttonEl.style.setProperty('bottom', baseTrimmed, 'important');
        }
        return baseTrimmed;
      }
    }

    // 3. Dynamiczne próbkowanie przeszkód po lewej i prawej stronie
    if (document.elementsFromPoint) {
      const w = window.innerWidth;
      const testPoints = [[24, height - 20], [Math.round(w / 2), height - 20], [w - 24, height - 20]];
      testPoints.forEach(([x, y]) => {
        if (x < 0 || y < 0) return;
        document.elementsFromPoint(x, y).forEach(el => {
          if (el.id === 'ccEdgePlusBtn' || el.id === 'backToTopBtn' || el.classList?.contains('cc-edge-plus-tooltip')) return;
          const pos = window.getComputedStyle(el).position;
          if (pos === 'fixed' || pos === 'sticky') {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && r.top > height * 0.35 && r.bottom >= height - 30) {
              bottom = Math.max(bottom, Math.round(height - r.top + 12));
            }
          }
        });
      });
    }

    if (bottom + 48 > height * 0.65) bottom = 16;
    const finalVal = `max(${bottom}px, env(safe-area-inset-bottom))`;
    if (document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
      document.documentElement.style.setProperty('--cc-floating-bottom', finalVal);
    }
    if (document.body && document.body.style && typeof document.body.style.setProperty === 'function') {
      document.body.style.setProperty('--cc-floating-bottom', finalVal);
    }
    if (buttonEl) {
      buttonEl.style.setProperty('bottom', finalVal, 'important');
    }
    return finalVal;
  }

  // Obliczenie widoczności i pozycji przycisku
  function update() {
    isPendingFrame = false;
    if (!buttonEl) return;

    if (isExcludedPage() || isModalOrFullscreenActive()) {
      buttonEl.classList.remove('is-visible');
      return;
    }

    updateFloatingBottom();

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    const dialog = document.getElementById(config.dialogId);
    const isDialogOpen = dialog && dialog.open;

    // Przycisk widoczny po przekroczeniu progu lub gdy dialog jest otwarty
    const shouldBeVisible = scrollY >= config.threshold || isDialogOpen;

    if (shouldBeVisible) {
      buttonEl.classList.add('is-visible');
    } else {
      buttonEl.classList.remove('is-visible');
    }

    // Synchronizacja stanu aria-expanded
    buttonEl.setAttribute('aria-expanded', isDialogOpen ? 'true' : 'false');
  }

  function scheduleUpdate() {
    if (!isPendingFrame) {
      isPendingFrame = true;
      window.requestAnimationFrame(update);
    }
  }

  // Inicjalizacja komponentu
  function init(options) {
    if (isMounted) return window.CCEdgePlus;
    if (typeof document === 'undefined' || !document.body) return null;

    if (options && typeof options === 'object') {
      config = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    if (isExcludedPage()) return null;

    injectStyles();
    buttonEl = createButton();
    isMounted = true;

    if (!scrollListenerAttached) {
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate, { passive: true });
      document.addEventListener('fullscreenchange', scheduleUpdate);
      document.addEventListener('ekocc:locale-changed', () => applyI18nLabels());
      window.addEventListener('ekocc:locale-changed', () => applyI18nLabels());

      // Obserwacja otwarcia/zamknięcia dialogu panelu krawędziowego
      const attachDialogObserver = () => {
        const dialog = document.getElementById(config.dialogId);
        if (dialog) {
          dialog.addEventListener('close', () => {
            scheduleUpdate();
            if (previousFocusEl && previousFocusEl.isConnected && typeof previousFocusEl.focus === 'function') {
              previousFocusEl.focus({ preventScroll: true });
            }
          });
          dialog.addEventListener('cancel', () => scheduleUpdate());
          return true;
        }
        return false;
      };

      if (!attachDialogObserver()) {
        const observer = new MutationObserver(() => {
          if (attachDialogObserver()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }

      scrollListenerAttached = true;
    }

    scheduleUpdate();
    return window.CCEdgePlus;
  }

  // Zniszczenie instancji (do testów jednostkowych)
  function destroy() {
    if (buttonEl && buttonEl.parentNode) {
      buttonEl.removeEventListener('click', onButtonClick);
      buttonEl.parentNode.removeChild(buttonEl);
    }
    if (tooltipEl && tooltipEl.parentNode) {
      tooltipEl.parentNode.removeChild(tooltipEl);
    }
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
    document.removeEventListener('fullscreenchange', scheduleUpdate);
    buttonEl = null;
    tooltipEl = null;
    styleEl = null;
    isMounted = false;
    scrollListenerAttached = false;
    isPendingFrame = false;
  }

  // Auto-inicjalizacja po załadowaniu DOM
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init(), { once: true });
    } else {
      init();
    }
  }

  return {
    init,
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
    show: () => { if (buttonEl) buttonEl.classList.add('is-visible'); },
    hide: () => { if (buttonEl) buttonEl.classList.remove('is-visible'); },
    update: scheduleUpdate,
    destroy,
    getButton: () => buttonEl,
    get threshold() { return config.threshold; },
    set threshold(val) { config.threshold = Number(val) || 300; scheduleUpdate(); }
  };
});
