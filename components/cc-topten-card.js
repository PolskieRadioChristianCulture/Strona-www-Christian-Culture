/*
 * #TOPTEN — karta informacyjna na muzycznych stronach EkoCC (spec. naturalnej rywalizacji §25).
 * Wpinana centralnie przez scripts/cc-page-standard.mjs (tylko strony z listy TOPTEN_CARD_PAGES).
 * Zwykły blok w treści strony: nie pływa i nie zasłania odtwarzaczy. Miejsce można wskazać elementem
 * <div data-cc-topten-card></div>; bez niego karta trafia przed stopkę albo na koniec treści.
 * Dane: /api/topten/charts (ten sam ranking co https://polskieradio.cc/topTEN/, cache serwera 10 s).
 * @007 • 2026-11-01
 */
(function () {
  'use strict';
  if (window.__ccToptenCard) return;
  window.__ccToptenCard = true;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pts = function (n) { return Number(n || 0).toLocaleString('pl-PL'); };

  var CSS = '' +
    '.cc-topten-card{box-sizing:border-box;max-width:960px;margin:28px auto;padding:20px clamp(16px,3vw,26px);border-radius:16px;background:#0b0b0b;color:#fff;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.45;position:relative;z-index:0}' +
    '.cc-topten-card *{box-sizing:border-box}' +
    '.cc-topten-card__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;margin-bottom:10px}' +
    '.cc-topten-card__brand{display:inline-flex;align-items:center;min-height:44px;font-weight:900;font-size:26px;letter-spacing:-1px;color:#fff;text-decoration:none}' +
    '.cc-topten-card__brand span{color:#FF7A00}' +
    '.cc-topten-card__tag{color:#FF8C33;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}' +
    '.cc-topten-card p{margin:0 0 10px;color:#d6d6d6;font-size:14px}' +
    '.cc-topten-card ol{margin:8px 0 14px;padding-left:28px;list-style:decimal outside}' +
    '.cc-topten-card li{display:list-item;margin:4px 0;font-size:15px}' +
    '.cc-topten-card li::marker{color:#FF7A00;font-weight:900}' +
    '.cc-topten-card li strong{color:#fff}' +
    '.cc-topten-card li small{color:#bdbdbd}' +
    '.cc-topten-card__actions{display:flex;flex-wrap:wrap;gap:10px}' +
    '.cc-topten-card__actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border-radius:10px;font-weight:800;text-decoration:none;font-size:15px}' +
    '.cc-topten-card__primary{background:#FF7A00;color:#111}' +
    '.cc-topten-card__primary:hover{background:#FF8C33}' +
    '.cc-topten-card__primary:active{background:#E66A00}' +
    '.cc-topten-card__ghost{border:2px solid #fff;color:#fff;background:transparent}' +
    '.cc-topten-card__ghost:hover{background:#fff;color:#111}' +
    '@media (max-width:520px){.cc-topten-card{margin:20px 12px}.cc-topten-card__actions a{flex:1 1 100%}}';

  function render(el, data) {
    var items = (data && data.items) || [];
    var nat = data && data.natural;
    var top = items.slice(0, 3);
    var fresh = nat && nat.noVotesYet;
    var list = top.length
      ? '<ol>' + top.map(function (t) {
          return '<li' + (fresh ? '' : ' value="' + t.rank + '"') + '><strong>' + esc(t.title) + '</strong> — ' + esc(t.artist) +
            (fresh ? '' : ' <small>· ' + pts(t.score) + ' pkt</small>') + '</li>';
        }).join('') + '</ol>'
      : '';
    var lead = fresh
      ? 'Nowe notowanie: każdy zaczyna od zera! Notowanie zamyka się w każdą niedzielę o 20:00.'
      : top.length
        ? 'Tak głosują teraz słuchacze — notowanie zamyka się w każdą niedzielę o 20:00.'
        : 'Słuchaj, głosuj i nominuj chrześcijańskie teledyski — notowanie zamyka się w każdą niedzielę o 20:00.';
    el.innerHTML =
      '<div class="cc-topten-card__head">' +
        '<a class="cc-topten-card__brand" href="/topTEN/" aria-label="topTEN — Chrześcijańska Lista Przebojów">top<span>TEN</span></a>' +
        '<span class="cc-topten-card__tag">Chrześcijańska Lista Przebojów</span>' +
      '</div>' +
      '<p>' + lead + '</p>' + list +
      '<div class="cc-topten-card__actions">' +
        '<a class="cc-topten-card__primary" href="/topTEN/">Słuchaj | Głosuj | Nominuj →</a>' +
        '<a class="cc-topten-card__ghost" href="/topTEN/nominacje/">Zgłoś teledysk</a>' +
        '<a class="cc-topten-card__ghost" href="/topTEN/regulamin/">Zasady</a>' +
      '</div>';
  }

  // Widoczna stopka strony — bez stopek ukrytych paneli, okien i elementów wysuwanych.
  function pageFooter() {
    var all = document.querySelectorAll('footer');
    for (var i = all.length - 1; i >= 0; i--) {
      var f = all[i];
      if (f.closest('dialog,[role="dialog"],[aria-hidden="true"],[hidden],[aria-modal="true"]')) continue;
      var cs = getComputedStyle(f);
      if (cs.display === 'none' || cs.visibility === 'hidden' || f.getClientRects().length === 0) continue;
      var hiddenAncestor = false;
      for (var p = f.parentElement; p && p !== document.body; p = p.parentElement) {
        var ps = getComputedStyle(p);
        if (ps.visibility === 'hidden' || ps.display === 'none' || ps.position === 'fixed') { hiddenAncestor = true; break; }
      }
      if (!hiddenAncestor) return f;
    }
    return null;
  }

  // Strona-aplikacja (pełny ekran bez przewijania, np. odtwarzacz): karta mogłaby zasłonić odtwarzacz — nie wstawiamy.
  function isAppLikePage() {
    var b = getComputedStyle(document.body), h = getComputedStyle(document.documentElement);
    return b.overflow === 'hidden' || b.overflowY === 'hidden' || h.overflow === 'hidden' || h.overflowY === 'hidden';
  }

  function mount() {
    if (document.querySelector('.cc-topten-card')) return;
    var slot = document.querySelector('[data-cc-topten-card]');
    if (!slot && isAppLikePage()) return;
    var footer = slot ? null : pageFooter();
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var el = slot || document.createElement('section');
    el.classList.add('cc-topten-card');
    el.setAttribute('aria-label', 'topTEN — Chrześcijańska Lista Przebojów');
    if (!el.isConnected) {
      // Przed widoczną stopką strony; bez niej — na końcu przewijanej treści (pod elementami przypiętymi do ekranu).
      if (footer) footer.parentNode.insertBefore(el, footer);
      else document.body.appendChild(el);
    }
    render(el, null);
    fetch('/api/topten/charts', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(el, d); })
      .catch(function () { /* karta zostaje z ogólnym zaproszeniem */ });
  }

  function later() {
    if ('requestIdleCallback' in window) window.requestIdleCallback(mount, { timeout: 4000 });
    else setTimeout(mount, 1500);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
})();
