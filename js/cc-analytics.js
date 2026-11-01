/*
 * Kluczowe zdarzenia GA4 ekosystemu Christian Culture — @007, plan zatwierdzony przez L0 26.10.2026
 * (JOMA: raporty/A007_GA4_PLAN_ZDARZEN_I_FILTRA_2026-10-26.md).
 * Ładowany zaraz po fragmencie GA; wszystko łapie sam (kliknięcia, odtwarzanie, udostępnianie),
 * więc odtwarzacze i strony nie muszą nic wołać. Inne skrypty mogą użyć window.ccTrack(nazwa, parametry).
 *
 *  radio_play     start radia na żywo (strumienie zeno.fm i podobne)       — kluczowe
 *  audio_play     start nagrania audio (Biblia, podcast)
 *  lesson_view    otwarcie lekcji Kursu Codziennego / Akademii              — kluczowe
 *  login          udane logowanie do LUMINA (woła lumina-db.js)             — kluczowe
 *  donate_click   klik w Wspieraj / Patronite / wpłatę                       — kluczowe
 *  contact_click  klik w telefon, e-mail, WhatsApp, Messenger                — kluczowe
 *  share          udostępnienie strony
 *  search         zapytanie w wyszukiwarce CC (search_term; pauza 1,5 s, Enter lub wybór wyniku)
 *  select_content klik w wynik wyszukiwarki (content_type=search_result, item_id=ścieżka)
 *  topten_vote    przyjęty głos w topTEN (vote_type=like|boost, item_id=CC-TT-…, rank) — woła topTEN/app.js
 *  topten_follow  obserwowanie utworu topTEN (item_id)                      — woła topTEN/app.js
 *  topten_nomination wysłane zgłoszenie utworu (genre)                       — woła topTEN/nominacje
 *
 * Ruch własny (traffic_type=internal) ustawia sam fragment GA — patrz scripts/apply-ga-internal-traffic.mjs.
 */
(function () {
  'use strict';
  if (window.ccTrack) return;

  function ccTrack(name, params) {
    try {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, Object.assign({ transport_type: 'beacon' }, params || {}));
    } catch (_) {}
  }
  window.ccTrack = ccTrack;

  // Detekcja osrodka Polonii na podstawie strefy czasowej urzadzenia (zero danych osobowych)
  function ccGetPoloniaHub() {
    try {
      var tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
      if (!tz) return 'UNKNOWN';
      if (/Warsaw|Poland/i.test(tz)) return 'PL_KRAJ';
      if (/New_York|Detroit|Indiana|Kentucky|Toronto|Montreal/i.test(tz)) return 'POLONIA_US_EAST';
      if (/Chicago|Menominee|Winnipeg/i.test(tz)) return 'POLONIA_US_CHICAGO';
      if (/Denver|Phoenix|Edmonton/i.test(tz)) return 'POLONIA_US_MOUNTAIN';
      if (/Los_Angeles|Vancouver|Tijuana/i.test(tz)) return 'POLONIA_US_WEST';
      if (/London|Dublin|Belfast/i.test(tz)) return 'POLONIA_UK_IRELAND';
      if (/Berlin|Paris|Rome|Madrid|Amsterdam|Brussels|Vienna|Stockholm|Oslo/i.test(tz)) return 'POLONIA_EUROPE_ZACH';
      return tz.replace(/[^a-zA-Z0-9_\-\/]/g, '_').slice(0, 40);
    } catch (_) {
      return 'UNKNOWN';
    }
  }
  window.ccGetPoloniaHub = ccGetPoloniaHub;

  function ccTrackPolonia(action, extra) {
    var hub = ccGetPoloniaHub();
    var tz = '';
    try { tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''; } catch (_) {}
    ccTrack('polonia_engagement', Object.assign({
      polonia_hub: hub,
      user_tz: tz || 'unknown',
      action: action || 'interaction'
    }, extra || {}));
  }
  window.ccTrackPolonia = ccTrackPolonia;

  const path = location.pathname;

  // Lekcja: /akademia/<kurs>/dzien-01, /kursy/<kurs>/lekcja-3 (z .html lub /index.html)
  const lesson = path.match(/^\/(?:akademia|kursy)\/([a-z0-9-]+)\/((?:dzien|lekcja)-\d+)/i);
  if (lesson) ccTrack('lesson_view', { course: lesson[1], lesson: lesson[2] });

  // Radio i nagrania: każde odtworzenie <audio> (także niewstawionych do strony), raz na źródło w ciągu 30 min
  const LIVE = /zeno\.fm|icecast|shoutcast|radio\.co|\/stream|\.m3u8/i;
  const seen = {};
  const nativePlay = window.HTMLMediaElement && HTMLMediaElement.prototype.play;
  if (nativePlay) {
    HTMLMediaElement.prototype.play = function () {
      try {
        if (this instanceof HTMLAudioElement && !this.muted) {
          const src = this.currentSrc || this.src || '';
          const now = Date.now();
          if (src && !(seen[src] > now - 30 * 60 * 1000)) {
            seen[src] = now;
            let host = '';
            try { host = new URL(src, location.href).hostname; } catch (_) {}
            const live = LIVE.test(src) || this.duration === Infinity;
            ccTrack(live ? 'radio_play' : 'audio_play', { stream_host: host, stream: src.split('?')[0].slice(-80) });
          }
        }
      } catch (_) {}
      return nativePlay.apply(this, arguments);
    };
  }

  // Udostępnianie przez systemowe okno
  if (navigator.share) {
    const nativeShare = navigator.share.bind(navigator);
    navigator.share = function (data) {
      return nativeShare(data).then((r) => {
        ccTrack('share', { method: 'system', content_url: (data && data.url) || location.href });
        return r;
      });
    };
  }

  const DONATE = /\/wspieraj\b|patronite\.pl|paypal\.(com|me)|zrzutka\.pl|buycoffee\.to|buymeacoffee\.com|tipply\.pl|suppi\.pl/i;
  const SHARE = /facebook\.com\/sharer|twitter\.com\/intent|x\.com\/intent|wa\.me\/\?text|api\.whatsapp\.com\/send\?text|linkedin\.com\/share|t\.me\/share/i;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const place = a.closest('[id]') ? a.closest('[id]').id : '';
    if (SHARE.test(href)) {
      ccTrack('share', { method: (href.match(/facebook|twitter|x\.com|whatsapp|wa\.me|linkedin|t\.me/i) || ['link'])[0].toLowerCase() });
    } else if (DONATE.test(href)) {
      ccTrack('donate_click', { link_url: a.href, place });
    } else if (/^(tel:|mailto:)|wa\.me\/\d|api\.whatsapp\.com\/send\?phone|m\.me\/|messenger\.com\/t\//i.test(href)) {
      const method = /^tel:/i.test(href) ? 'phone' : /^mailto:/i.test(href) ? 'email' : /whatsapp|wa\.me/i.test(href) ? 'whatsapp' : 'messenger';
      ccTrack('contact_click', { method, place });
    }
  }, true);

  // Wyszukiwarka CC: pauza w pisaniu (1,5 s), Enter albo wybór wyniku — raz na zapytanie.
  // Zapytań wyglądających na e-mail lub numer telefonu nie wysyłamy (zero danych osobowych w GA).
  let lastQuery = '';
  let searchTimer = 0;
  function trackSearch() {
    clearTimeout(searchTimer);
    const input = document.getElementById('ccOmniInput');
    const q = input ? input.value.trim().replace(/\s+/g, ' ') : '';
    if (q.length < 2 || q === lastQuery || /@|\d[\d\s-]{6,}\d/.test(q)) return;
    lastQuery = q;
    ccTrack('search', { search_term: q.slice(0, 100) });
  }
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'ccOmniInput') {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(trackSearch, 1500);
    }
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'ccOmniInput') trackSearch();
  }, true);
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('#ccOmniBody a');
    if (!a) return;
    trackSearch();
    let item = '';
    try { const u = new URL(a.href, location.href); item = u.origin === location.origin ? u.pathname : u.hostname; } catch (_) {}
    ccTrack('select_content', { content_type: 'search_result', item_id: item.slice(0, 100) });
  }, true);
})();
