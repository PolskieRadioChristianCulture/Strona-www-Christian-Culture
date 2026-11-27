/* ==========================================================================
   Scrolluj Biblię (/sba) — Neighboring App Context Bridge
   Propagates SBA visual identity (?skin=sba), verse return link, and pre-fills
   search queries into /wyszukiwarka when launched from /sba.
   ========================================================================== */
(function () {
  'use strict';

  function safeSessionGet(key) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }
  function safeSessionSet(key, val) {
    try { sessionStorage.setItem(key, val); } catch {}
  }
  function safeSessionRemove(key) {
    try { sessionStorage.removeItem(key); } catch {}
  }

  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  const skinParam = (params.get('skin') || '').trim().toLowerCase();
  const sourceParam = (params.get('source') || '').trim().toLowerCase();
  const refParam = (params.get('ref') || '').trim();
  const qParam = (params.get('q') || '').trim();

  if (skinParam === 'off') {
    safeSessionRemove('cc_sba_skin');
    safeSessionRemove('cc_sba_ref');
    return;
  }

  const isSba =
    skinParam === 'sba' ||
    sourceParam === 'sba' ||
    safeSessionGet('cc_sba_skin') === '1';

  if (!isSba) return;

  safeSessionSet('cc_sba_skin', '1');
  if (refParam) safeSessionSet('cc_sba_ref', refParam);

  const root = document.documentElement;
  root.setAttribute('data-cc-skin', 'sba');

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', '#0d0d0f');

  if (!document.querySelector('link[href*="/sba/sba-shell-theme.css"]')) {
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = '/sba/sba-shell-theme.css?v=1';
    document.head.appendChild(linkEl);
  }

  const NEIGHBOR_RE = /^\/(?:mojabiblia|wyszukiwarka|szukaj|biblia-audio|ai(?:\/aplikacja)?)(?:\/|\.html)?$/i;

  function hydrateWyszukiwarkaQuery() {
    if (!/^\/wyszukiwarka(?:\/|\.html)?$/i.test(window.location.pathname) || !qParam) return;

    const fallbackInput = document.getElementById('ccw-q');
    if (fallbackInput && fallbackInput.value !== qParam) {
      fallbackInput.value = qParam;
    }

    let attempts = 0;
    const syncOmni = () => {
      attempts += 1;
      const omniInput = document.getElementById('ccOmniInput');
      const overlay = document.getElementById('ccOmniOverlay');
      if (window.CCOmniSearch && typeof window.CCOmniSearch.open === 'function') {
        const isOpen = overlay?.classList.contains('cc-open');
        if (!isOpen || (omniInput && omniInput.value !== qParam)) {
          window.CCOmniSearch.open(qParam);
        }
        const liveInput = document.getElementById('ccOmniInput');
        if (liveInput && liveInput.value !== qParam) {
          liveInput.value = qParam;
          liveInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (liveInput && liveInput.value === qParam && overlay?.classList.contains('cc-open')) {
          return true;
        }
      }
      return attempts >= 20;
    };

    if (!syncOmni()) {
      const timer = setInterval(() => {
        if (syncOmni()) clearInterval(timer);
      }, 150);
    }
  }

  function mountReturnPill() {
    if (window.self !== window.top) return;
    if (/^\/sba(?:\/|\.html)?$/i.test(window.location.pathname)) return;
    if (document.getElementById('sbaReturnPill')) return;

    const activeRef = refParam || safeSessionGet('cc_sba_ref') || '';
    const pill = document.createElement('a');
    pill.id = 'sbaReturnPill';
    pill.className = 'sba-return-pill';
    if (/^\/ai(?:\/aplikacja)?(?:\/|\.html)?$/i.test(window.location.pathname)) {
      pill.classList.add('sba-return-pill--top');
    }
    pill.href = '/sba' + (activeRef ? '#werset=' + encodeURIComponent(activeRef) : '');
    pill.textContent = '← Scrolluj Biblię';
    pill.setAttribute('aria-label', 'Wróć do aplikacji Scrolluj Biblię');
    document.body.appendChild(pill);
  }

  function wireNeighborLinks() {
    document.addEventListener('click', (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor) return;
      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || anchor.id === 'sbaReturnPill') return;
      try {
        const target = new URL(anchor.href, window.location.href);
        if (target.origin !== window.location.origin) return;
        if (!NEIGHBOR_RE.test(target.pathname)) return;
        if (!target.searchParams.has('skin')) target.searchParams.set('skin', 'sba');
        if (!target.searchParams.has('source')) target.searchParams.set('source', 'sba');
        const activeRef = refParam || safeSessionGet('cc_sba_ref');
        if (activeRef && !target.searchParams.has('ref')) target.searchParams.set('ref', activeRef);
        anchor.href = target.toString();
      } catch {
        /* ignore invalid links */
      }
    }, true);
  }

  function onReady() {
    hydrateWyszukiwarkaQuery();
    mountReturnPill();
    wireNeighborLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
