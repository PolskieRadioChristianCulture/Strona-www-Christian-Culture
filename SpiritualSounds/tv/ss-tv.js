/*
 * Spiritual Sounds 24/7 — kanał non-stop z oficjalnej playlisty YouTube (PRODUKCJA) v2
 * @007, 2026-11-18. Dyrektywa Spiritual Sounds §4, §5, §17 + wzorce nadawcze Christian Culture Master.
 *
 * Zasady:
 *  - JEDYNE źródło: playlista autora (SS_PLAYLIST). Żadnej ręcznej listy filmów — nowe nagrania dochodzą same.
 *    Wyjątek: ?v=<id> z karty „Najnowsze” — start od wskazanego nagrania W KONTEKŚCIE tej samej playlisty.
 *  - Kolejny film po zakończeniu, po końcu playlisty start od początku (loop: 1 — YouTube).
 *  - Start wyciszony (przeglądarki blokują autoplay z dźwiękiem) + duży przycisk „Włącz dźwięk”.
 *  - Strażnik zacięć wg wzorca tvw-women-live.html (tvwEnsurePlayer + strażnik postępu):
 *    brak postępu 10 s → wznów, 18 s → następny film, 30 s → przeładuj playlistę, 60 s → przeładuj stronę.
 *    Szanuje pauzę widza i nie przeładowuje karty w tle.
 *  - Uczciwie: „24/7 / NON-STOP”, nigdy „LIVE”. Gdy player nie działa — mówimy to wprost, nic nie udajemy.
 */
(function (root) {
  'use strict';

  var SS_PLAYLIST = 'PLD0gxYiiSZMA';

  // ---------- Czyste funkcje (testowane w scripts/spiritual-sounds.test.mjs) ----------
  /** Pozycja startowa „kanału”: ta sama dla wszystkich w danej godzinie, co godzinę inna. */
  function seedIndex(n, nowMs) {
    if (!(n > 1)) return 0;
    var hour = Math.floor((nowMs || 0) / 3600000);
    return ((hour * 37) % n + n) % n;
  }
  /**
   * API YouTube (getPlaylist) zwraca najwyżej 200 pozycji, choć playlista ma ich więcej (18.11.2026: 312).
   * Taką listę traktujemy jako „uciętą”: nie podajemy jej długości jako liczby nagrań i nie zawijamy jej ręcznie.
   */
  var YT_LIST_CAP = 200;
  function isCapped(n) { return n >= YT_LIST_CAP; }
  /** Indeksy kolejnych k pozycji po bieżącej; zawinięcie na początek tylko dla pełnej (nieuciętej) listy. */
  /** capped: czy lista jest ucięta przez IFrame (domyślnie wg długości); w trybie kolejki zawsze pełna. */
  function upcoming(n, current, k, capped) {
    if (capped === undefined) capped = isCapped(n);
    var out = [];
    if (!(n > 1) || current < 0) return out;
    for (var i = 1; i <= Math.min(k, n - 1); i++) {
      var j = current + i;
      if (j >= n) { if (capped) break; j = j % n; }
      out.push(j);
    }
    return out;
  }
  /** ID nagrania z adresu (?v=) — tylko poprawny format YouTube. */
  function deepLinkId(search) {
    var m = /[?&]v=([\w-]{11})(?:&|$)/.exec(search || '');
    return m ? m[1] : '';
  }
  /**
   * Decyzja strażnika. s = {playing, paused, ended, progressed, idleMs, strikes, userPaused, hidden, sinceBootMs, hasPlayer, everPlayed}
   * Zwraca {action, strikes}. action: none | resume | next | restart-list | reload-page | wait
   */
  function guardDecide(s) {
    if (!s.hasPlayer) return { action: (s.sinceBootMs > 45000 && !s.hidden) ? 'reload-page' : 'wait', strikes: s.strikes };
    if (s.userPaused) return { action: 'none', strikes: 0 };
    if (s.playing && s.progressed) return { action: 'none', strikes: 0 };
    if (s.ended) return { action: 'next', strikes: s.strikes };
    // Przeładowanie strony tylko, gdy kanał już grał (inaczej to blokada autoplay — czekamy na kliknięcie widza).
    if (s.idleMs > 60000 && !s.hidden && s.everPlayed) return { action: 'reload-page', strikes: s.strikes };
    if (s.idleMs > 30000 && s.strikes < 3) return { action: 'restart-list', strikes: 3 };
    if (s.idleMs > 18000 && s.strikes < 2) return { action: 'next', strikes: 2 };
    if (s.idleMs > 10000 && s.strikes < 1) return { action: 'resume', strikes: 1 };
    if (s.paused) return { action: 'resume', strikes: s.strikes };
    return { action: 'none', strikes: s.strikes };
  }
  /** Kolejka z Workera: tylko poprawne ID YouTube, bez powtórzeń, kolejność autora. */
  function sanitizeQueue(items) {
    var seen = {}, out = [];
    (Array.isArray(items) ? items : []).forEach(function (it) {
      var id = it && it.id;
      if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id) || seen[id]) return;
      seen[id] = 1; out.push({ id: id, title: String((it && it.title) || '').slice(0, 200) });
    });
    return out;
  }
  var api = { SS_PLAYLIST: SS_PLAYLIST, seedIndex: seedIndex, upcoming: upcoming, guardDecide: guardDecide, isCapped: isCapped, deepLinkId: deepLinkId, sanitizeQueue: sanitizeQueue };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SSTV = api;
  if (typeof document === 'undefined') return;

  // ---------- Język ----------
  var EN = /[?&]lang=en\b/.test(location.search);
  var LANG = EN ? 'en' : 'pl';
  var T = {
    pl: {
      title: 'Spiritual Sounds 24/7 – Kanał Biblijny | Christian Culture',
      play: 'Odtwarzaj', pause: 'Pauza', unmute: 'Włącz dźwięk', mute: 'Wycisz', next: 'Następne nagranie', share: 'Udostępnij kanał',
      fs: 'Pełny ekran', fsExit: 'Zamknij pełny ekran', count: 'Playlista: {n} nagrań · odtwarzanie w kółko',
      countCapped: 'Cała playlista autora · odtwarzanie w kółko',
      upNext: 'Za chwilę', later: 'Później', thumbAlt: 'Miniatura kolejnego nagrania z playlisty', copied: 'Link skopiowany',
      broken: 'Odtwarzacz YouTube nie odpowiada. Ponawiamy… Możesz też otworzyć playlistę na YouTube.',
      nowFallback: 'Nagranie z playlisty Spiritual Sounds', openOnYt: 'Otwórz na YouTube: ',
      bNow: 'Teraz', bNext: 'Za chwilę', bNextT: 'kolejne nagranie Spiritual Sounds', bLatest: 'Najnowsze', bChannel: 'Kanał',
      bChannelT: 'Psalmy i Słowo Boże w muzyce — non-stop, 24/7', bSupport: 'Wspieram to', bYt: 'YouTube', bYtT: 'Subskrybuj @SpiritualSoundsPsalmy'
    },
    en: {
      title: 'Spiritual Sounds 24/7 – Bible Channel | Christian Culture',
      skip: 'Skip to controls', tickAria: 'Information bar', tickBadge: 'Recommended',
      brandAria: 'Spiritual Sounds — showcase', tagline: 'Psalms & the Word of God', statusAria: 'Channel status',
      langAria: 'Language', air: '24/7 · Non-stop', h1: 'Spiritual Sounds – Bible Channel 24/7', support: 'I support this',
      loading: 'Starting the channel…', soundCta: 'Turn on sound', soundMore: ' / Start the channel', badge: '24/7 · Non-stop',
      l3Now: 'Now', upNext: 'Up next', upNextText: 'Next Spiritual Sounds recording', recommended: 'Recommended',
      controlsAria: 'Channel controls', sideAria: 'Channel panel', nowLabel: 'Now on the channel', nowWaiting: 'Connecting to the playlist…',
      promoHead: '★ Recommended', quickAria: 'Quick links', qAkademia: 'Daily Bible Course', qBiblia: 'Audio Bible',
      patronH: 'This channel is free for everyone', patronP: 'Help the Psalms reach further — I support this',
      ytChannel: 'Open YouTube channel', about: 'About the artist / project',
      latestHead: 'Latest in the playlist', latestNote: 'Click to start the channel from this recording',
      nextHead: 'Next in the playlist', bottomAria: 'Channel bar',
      note: 'This channel plays the official “Psalmy i Słowo Boże w Muzyce” playlist from YouTube on a loop — with the creator’s permission. New recordings added by the creator appear here automatically. It is not a live broadcast but a non-stop channel.',
      play: 'Play', pause: 'Pause', unmute: 'Turn sound on', mute: 'Mute', next: 'Next recording', share: 'Share the channel',
      fs: 'Full screen', fsExit: 'Exit full screen', count: 'Playlist: {n} recordings · playing on a loop',
      countCapped: 'The creator’s entire playlist · playing on a loop',
      later: 'Later', thumbAlt: 'Thumbnail of an upcoming recording from the playlist', copied: 'Link copied',
      broken: 'The YouTube player is not responding. Retrying… You can also open the playlist on YouTube.',
      nowFallback: 'Recording from the Spiritual Sounds playlist', openOnYt: 'Open on YouTube: ',
      bNow: 'Now', bNext: 'Up next', bNextT: 'next Spiritual Sounds recording', bLatest: 'Latest', bChannel: 'Channel',
      bChannelT: 'Psalms and the Word of God in music — non-stop, 24/7', bSupport: 'I support this', bYt: 'YouTube', bYtT: 'Subscribe to @SpiritualSoundsPsalmy'
    }
  };
  var L = EN ? Object.assign({}, T.pl, T.en) : T.pl;
  var $ = function (id) { return document.getElementById(id); };
  var E = root.SSEco;

  function applyLang() {
    document.querySelectorAll('.tv-lang a').forEach(function (a) {
      a.setAttribute('aria-current', (a.dataset.lang === LANG) ? 'true' : 'false');
    });
    if (!EN) return;
    document.documentElement.lang = 'en';
    document.title = L.title;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var k = el.dataset.i18n; if (T.en[k]) el.textContent = T.en[k]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { var k = el.dataset.i18nAria; if (T.en[k]) el.setAttribute('aria-label', T.en[k]); });
    document.querySelectorAll('[data-href-en]').forEach(function (el) { el.setAttribute('href', el.dataset.hrefEn); });
  }

  // ---------- Player ----------
  var DEEP = deepLinkId(location.search);
  var player = null, seeded = !!DEEP, muted = true, userPaused = false, lastNowId = '', everPlayed = false;
  var boot = Date.now(), lastT = -1, lastProgress = Date.now(), strikes = 0;
  var cover, coverMsg, soundBtn, playBtn, muteBtn, nextBtn, fsBtn, stage, bottomRun, topRun;

  /** Najwyżej 3 automatyczne przeładowania na 10 minut (np. YouTube zablokowany przez rozszerzenie) — bez pętli. */
  function safeReload() {
    var key = 'ss247_reloads', now = Date.now(), list = [];
    try { list = JSON.parse(sessionStorage.getItem(key) || '[]').filter(function (x) { return now - x < 600000; }); } catch (e) {}
    if (list.length >= 3) { setCover(true, L.broken); return; }
    list.push(now);
    try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
    location.reload();
  }

  // Tryb kolejki (@007 18.11.2026): gdy /api/spiritual-sounds/playlist zwróci CAŁĄ playlistę autora (YouTube Data API,
  // klucz tylko w sekrecie Cloudflare), gramy z własnej kolejki — wszystkie nagrania, nie tylko 200 widocznych w IFrame.
  // Bez klucza/odpowiedzi: dotychczasowy tryb playlisty YouTube (limit 200). Źródłem nadal jest wyłącznie playlista autora.
  var Q = null, qi = 0, qReady = false;
  function ytState(name) { return (root.YT && YT.PlayerState) ? YT.PlayerState[name] : NaN; }
  function playlist() {
    if (Q) return Q.map(function (x) { return x.id; });
    try { return (player && player.getPlaylist && player.getPlaylist()) || []; } catch (e) { return []; }
  }
  function curIndex() { if (Q) return qi; try { return player.getPlaylistIndex(); } catch (e) { return -1; } }
  function goTo(i) {
    if (Q) { qi = ((i % Q.length) + Q.length) % Q.length; player.loadVideoById(Q[qi].id); return; }
    player.playVideoAt(i);
  }
  function goNext() { if (Q) goTo(qi + 1); else player.nextVideo(); }
  function titleAt(i) { return Q && Q[i] ? Q[i].title : ''; }
  function thumb(id, q) { return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/' + (q || 'mqdefault') + '.jpg'; }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  function setCover(on, msg) {
    if (!cover) return;
    cover.classList.toggle('is-off', !on);
    if (msg) coverMsg.textContent = msg;
  }
  function syncButtons() {
    playBtn.classList.toggle('is-paused', userPaused);
    playBtn.setAttribute('aria-label', userPaused ? L.play : L.pause);
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? L.unmute : L.mute);
    soundBtn.hidden = !muted || !player;
  }
  function applyAudio() {
    if (!player || !player.mute) return;
    try { if (muted) player.mute(); else { player.unMute(); player.setVolume(100); } } catch (e) {}
  }
  function hideCaptions() {
    try {
      if (player.unloadModule) { player.unloadModule('captions'); player.unloadModule('cc'); }
      if (player.setOption) player.setOption('captions', 'track', {});
    } catch (e) {}
  }

  // ---------- Paski (wzorzec Master) ----------
  function mountBottom() {
    var items = [
      { b: L.bNow, live: 'now', t: L.nowFallback },
      { b: L.bNext, live: 'next', t: L.bNextT },
      { b: L.bLatest, live: 'latest', t: '…' },
      { b: L.bChannel, t: L.bChannelT },
      { b: L.bSupport, cc: true, href: '/wspieraj', t: '<strong>polskieradio.cc/wspieraj</strong>' },
      { b: L.bYt, href: 'https://www.youtube.com/@SpiritualSoundsPsalmy', t: L.bYtT },
    ];
    var html = items.map(function (it) {
      var inner = '<b>' + E.esc(it.b) + '</b><span' + (it.live ? ' data-live="' + it.live + '"' : '') + '>' + (it.href ? it.t : E.esc(it.t)) + '</span>';
      var cls = 'tick__item' + (it.cc ? ' is-cc' : '');
      if (!it.href) return '<span class="' + cls + '">' + inner + '</span>';
      return '<a class="' + cls + '" href="' + it.href + '"' + (/^https?:/.test(it.href) ? ' target="_blank" rel="noopener"' : '') + ' data-promo="tv-bottom">' + inner + '</a>';
    }).join('');
    bottomRun.innerHTML = html + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ').replace(/<span class="tick__item/g, '<span aria-hidden="true" class="tick__item');
    bottomRun.style.setProperty('--run', '70s');
  }
  function setLive(key, text) { E.setTicker(bottomRun, key, text); E.setTicker(topRun, key, text); }
  function clock() {
    var d = new Date();
    try {
      $('tv-clock').textContent = d.toLocaleTimeString(EN ? 'en-GB' : 'pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
      $('tv-date').textContent = d.toLocaleDateString(EN ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'short', timeZone: 'Europe/Warsaw' });
    } catch (e) {}
  }

  // ---------- Belki na obrazie ----------
  var l3Timer = null;
  function showNowL3(title) {
    var l3 = $('tv-l3'); $('tv-l3-x').textContent = title;
    l3.classList.add('on'); clearTimeout(l3Timer); l3Timer = setTimeout(function () { l3.classList.remove('on'); }, 10000);
  }
  var promoIdx = 0;
  function promoBelka() {
    if (!E || innerWidth <= 700 || !everPlayed) return;
    var p = E.PROMOS[promoIdx++ % E.PROMOS.length], el = $('tv-promo-l3');
    el.href = p.href; el.setAttribute('data-promo', 'tv-l3-' + p.id);
    $('tv-promo-l3-x').innerHTML = E.esc(EN ? p.hEn : p.h) + ' · <span>' + E.esc(p.u) + '</span>';
    el.classList.add('on'); E.ga('promo_impression', 'tv-l3-' + p.id, 'spiritual_sounds_tv');
    setTimeout(function () { el.classList.remove('on'); }, 14000);
  }

  function nextId() {
    var list = playlist(), n = list.length, c = curIndex(), up = upcoming(n, c, 1, !Q && isCapped(n));
    return up.length ? list[up[0]] : '';
  }

  function updateNow() {
    if (!player || !player.getVideoData) return;
    var d = {}; try { d = player.getVideoData() || {}; } catch (e) {}
    var id = d.video_id || '';
    if (id && id !== lastNowId) {
      lastNowId = id;
      var title = d.title || L.nowFallback;
      $('tv-now-title').textContent = title;
      var link = $('tv-now-link');
      link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '&list=' + SS_PLAYLIST;
      link.setAttribute('aria-label', L.openOnYt + title);
      $('tv-ambient').style.backgroundImage = 'url("' + thumb(id, 'hqdefault') + '")';
      setLive('now', title);
      showNowL3(title);
      var nx = nextId();
      $('tv-next1-img').src = nx ? thumb(nx) : '/SpiritualSounds/img/ss-emblem-360.webp';
      $('tv-upnext-img').src = nx ? thumb(nx) : '/SpiritualSounds/img/ss-emblem-360.webp';
      // W trybie kolejki znamy tytuł następnego nagrania — pokazujemy go zamiast ogólnego opisu.
      var nt = Q ? titleAt((qi + 1) % Q.length) : '';
      document.querySelectorAll('.tv-next1 b, .tv-upnext b').forEach(function (b) { b.textContent = nt || L.bNextT.charAt(0).toUpperCase() + L.bNextT.slice(1); });
      if (nt) setLive('next', nt);
      renderRail();
    }
    try {
      var cur = player.getCurrentTime(), dur = player.getDuration();
      if (dur > 0) {
        $('tv-prog').style.width = (cur / dur * 100).toFixed(2) + '%';
        $('tv-time').textContent = fmt(cur) + ' / ' + fmt(dur);
        var left = dur - cur, up = $('tv-upnext');
        var showUp = left > 0 && left <= 20 && !userPaused;
        up.classList.toggle('on', showUp);
        if (showUp) $('tv-upnext-sec').textContent = Math.ceil(left) + ' s';
      }
    } catch (e) {}
  }

  function renderRail() {
    var list = playlist(), n = list.length, cur = curIndex();
    var rail = $('tv-rail'), count = $('tv-count');
    if (n) count.textContent = (!Q && isCapped(n)) ? L.countCapped : L.count.replace('{n}', String(n));
    if (!rail || !n || cur < 0) return;
    var idx = upcoming(n, cur, 8, !Q && isCapped(n));
    rail.innerHTML = '';
    idx.forEach(function (i, k) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (k === 0 ? L.upNext : L.later) + ' — ' + L.next + ' ' + (k + 1));
      var im = document.createElement('img');
      im.loading = 'lazy'; im.decoding = 'async'; im.width = 320; im.height = 180; im.alt = L.thumbAlt;
      im.src = thumb(list[i]);
      var sp = document.createElement('span'); sp.textContent = k === 0 ? L.upNext : L.later;
      b.appendChild(im); b.appendChild(sp);
      b.addEventListener('click', function () { userPaused = false; try { goTo(i); } catch (e) {} syncButtons(); });
      li.appendChild(b); rail.appendChild(li);
    });
  }

  function renderLatest(items) {
    var ol = $('tv-latest'); if (!ol) return;
    if (!items.length) { ol.closest('.tv-sect').hidden = true; return; }
    ol.innerHTML = items.map(function (it) {
      var href = '?v=' + encodeURIComponent(it.id) + (EN ? '&lang=en' : '');
      return '<li><a href="' + href + '" data-promo="tv-latest"><img src="' + thumb(it.id) + '" width="320" height="180" loading="lazy" decoding="async" alt="">' +
        '<span>' + E.esc(E.fmtDate(it.published, LANG)) + '</span><strong>' + E.esc(it.title) + '</strong></a></li>';
    }).join('');
    setLive('latest', items[0].title);
  }

  function createPlayer() {
    if (player || !qReady || !(root.YT && YT.Player)) return;
    var vars = {
      autoplay: 1, mute: 1, playsinline: 1, controls: 0, rel: 0,
      modestbranding: 1, iv_load_policy: 3, cc_load_policy: 0, disablekb: 1, fs: 0,
      hl: EN ? 'en' : 'pl', origin: location.origin
    };
    if (!Q) { vars.listType = 'playlist'; vars.list = SS_PLAYLIST; vars.loop = 1; }
    var opts = {
      width: 1280, height: 720,
      host: 'https://www.youtube-nocookie.com',
      playerVars: vars,
      events: {
        onReady: function () {
          try { var f = document.querySelector('#tv-stage iframe'); if (f) { f.setAttribute('title', 'Spiritual Sounds 24/7 — YouTube'); f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen'); } } catch (e) {}
          player.mute(); player.playVideo();
          syncButtons();
        },
        onError: function (err) {
          if (root.console) console.warn('SS 24/7: błąd odtwarzacza YouTube', err && err.data);
          try { goNext(); } catch (e) {}
        },
        onStateChange: function (e) {
          if (e.data === ytState('PLAYING')) {
            setCover(false);
            if (!seeded) {
              seeded = true;
              var n = playlist().length;
              var s = seedIndex(n, Date.now());
              if (n > 1 && s !== curIndex()) { player.playVideoAt(s); return; }
            }
            applyAudio(); hideCaptions(); setTimeout(hideCaptions, 1500);
            updateNow();
          } else if (e.data === ytState('ENDED')) {
            // Następne nagranie. Tryb playlisty: po ostatnim YouTube sam wraca na początek (loop: 1).
            // Tryb kolejki: goNext() zawija na początek całej playlisty autora.
            try { goNext(); } catch (er) {}
          }
        }
      }
    };
    if (Q) {
      // Start kanału: wskazane nagranie (?v=) albo pozycja godzinowa z CAŁEJ playlisty.
      var at = DEEP ? Q.map(function (x) { return x.id; }).indexOf(DEEP) : -1;
      qi = at >= 0 ? at : seedIndex(Q.length, Date.now());
      seeded = true;
      opts.videoId = Q[qi].id;
    } else if (DEEP) {
      // Karta „Najnowsze”: start od wskazanego nagrania, dalej ta sama playlista autora.
      opts.videoId = DEEP;
    }
    player = new YT.Player('tv-player', opts);
  }
  /** Pełna playlista z Workera: [{id, title}] — tylko poprawne ID YouTube; przy błędzie pusta lista. */
  function fetchFullQueue() {
    if (!root.fetch) return Promise.resolve([]);
    return fetch('/api/spiritual-sounds/playlist?list=' + SS_PLAYLIST, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return sanitizeQueue(j && j.ok ? j.items : []); })
      .catch(function () { return []; });
  }
  // YouTube wywołuje to po załadowaniu API.
  root.onYouTubeIframeAPIReady = createPlayer;
  // Wzorzec tvwEnsurePlayer: biblioteka bywa gotowa, zanim zostanie wywołane onYouTubeIframeAPIReady.
  function ssEnsurePlayer() { if (!player && root.YT && YT.loaded && typeof YT.Player === 'function') { try { createPlayer(); } catch (e) {} } }

  function guardTick() {
    ssEnsurePlayer();
    var has = !!(player && typeof player.getPlayerState === 'function');
    var st = NaN, t = 0;
    if (has) { try { st = player.getPlayerState(); t = player.getCurrentTime ? player.getCurrentTime() : 0; } catch (e) {} }
    var progressed = (st === ytState('PLAYING') && t !== lastT);
    if (progressed) { lastT = t; lastProgress = Date.now(); everPlayed = true; }
    var r = guardDecide({
      everPlayed: everPlayed,
      hasPlayer: has, playing: st === ytState('PLAYING'), paused: st === ytState('PAUSED'), ended: st === ytState('ENDED'),
      progressed: progressed, idleMs: userPaused ? 0 : Date.now() - lastProgress, strikes: strikes,
      userPaused: userPaused, hidden: document.hidden, sinceBootMs: Date.now() - boot
    });
    strikes = r.strikes;
    if (userPaused) lastProgress = Date.now();
    if (!has && Date.now() - boot > 15000) setCover(true, L.broken);
    try {
      switch (r.action) {
        case 'resume': player.playVideo(); break;
        case 'next': goNext(); break;
        case 'restart-list':
          var n = playlist().length || 50;
          if (Q) goTo(Math.floor(Math.random() * n));
          else player.loadPlaylist({ listType: 'playlist', list: SS_PLAYLIST, index: Math.floor(Math.random() * n) });
          applyAudio(); break;
        case 'reload-page': safeReload(); break;
      }
    } catch (e) {}
  }

  // ---------- Sterowanie ----------
  function togglePlay() {
    if (!player) return;
    userPaused = !userPaused;
    try { if (userPaused) player.pauseVideo(); else player.playVideo(); } catch (e) {}
    syncButtons();
  }
  function setMuted(m) {
    muted = m; applyAudio();
    if (!m) { userPaused = false; try { player.playVideo(); } catch (e) {} }
    syncButtons();
    E.ga(m ? 'tv_mute' : 'tv_unmute', 'spiritual_sounds', 'spiritual_sounds_tv');
  }
  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || stage.classList.contains('is-pseudo-fs'); }
  function toggleFs() {
    if (isFs()) {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      stage.classList.remove('is-pseudo-fs');
    } else if (stage.requestFullscreen) {
      var fallback = function () { if (!document.fullscreenElement) stage.classList.add('is-pseudo-fs'); fsBtn.setAttribute('aria-label', isFs() ? L.fsExit : L.fs); };
      try { stage.requestFullscreen().catch(fallback); } catch (e) { fallback(); }
    } else if (stage.webkitRequestFullscreen) {
      stage.webkitRequestFullscreen();
    } else {
      stage.classList.add('is-pseudo-fs'); // iPhone: pełny kadr w oknie
    }
    setTimeout(function () { fsBtn.setAttribute('aria-label', isFs() ? L.fsExit : L.fs); }, 150);
  }
  function toast(msg) { var t = $('tv-toast'); t.textContent = msg; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function share() {
    var data = { title: document.title, url: location.origin + location.pathname + (EN ? '?lang=en' : '') };
    if (navigator.share) navigator.share(data).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { toast(L.copied); });
    E.ga('share', 'spiritual_sounds_tv', 'spiritual_sounds_tv');
  }

  function init() {
    applyLang();
    cover = $('tv-cover'); coverMsg = $('tv-cover-msg'); soundBtn = $('tv-sound');
    playBtn = $('tv-play'); muteBtn = $('tv-mute'); nextBtn = $('tv-next'); fsBtn = $('tv-fs'); stage = $('tv-stage');
    bottomRun = $('tv-bottom-run'); topRun = $('tv-tick');
    nextBtn.setAttribute('aria-label', L.next); fsBtn.setAttribute('aria-label', L.fs); $('tv-share').setAttribute('aria-label', L.share);
    syncButtons();

    if (E) {
      E.mountTicker(topRun, LANG, 'spiritual_sounds_tv');
      mountBottom();
      E.mountPromo($('tv-promo-stage'), $('tv-promo-dots'), $('tv-promo-bar'), LANG, 'spiritual_sounds_tv', 12000);
      document.querySelectorAll('.tv-q a, .tv-patron, .tv-support').forEach(function (a) {
        a.addEventListener('click', function () { E.ga('promo_click', a.getAttribute('data-promo'), 'spiritual_sounds_tv'); });
      });
      E.fetchFeed().then(renderLatest).catch(function () { renderLatest([]); });
      setTimeout(promoBelka, 90000); setInterval(promoBelka, 240000);
    }
    clock(); setInterval(clock, 15000);

    soundBtn.addEventListener('click', function () { setMuted(false); });
    playBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', function () { setMuted(!muted); });
    nextBtn.addEventListener('click', function () { userPaused = false; try { goNext(); } catch (e) {} syncButtons(); });
    fsBtn.addEventListener('click', toggleFs);
    $('tv-share').addEventListener('click', share);
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      var k = e.key.toLowerCase();
      if (k === 'escape' && stage.classList.contains('is-pseudo-fs')) { stage.classList.remove('is-pseudo-fs'); fsBtn.setAttribute('aria-label', L.fs); }
      if (/BUTTON|A/.test(tag) && (k === ' ' || k === 'enter')) return;
      if (k === 'k' || k === ' ') { e.preventDefault(); togglePlay(); }
      else if (k === 'm') setMuted(!muted);
      else if (k === 'n') nextBtn.click();
      else if (k === 'f') toggleFs();
    });
    document.addEventListener('fullscreenchange', function () { fsBtn.setAttribute('aria-label', isFs() ? L.fsExit : L.fs); });

    // Najpierw próba pobrania CAŁEJ playlisty (maks. 3 s), potem odtwarzacz — w trybie kolejki albo playlisty.
    var markReady = function () { if (qReady) return; qReady = true; ssEnsurePlayer(); };
    setTimeout(markReady, 3000);
    fetchFullQueue().then(function (items) { if (!qReady && items && items.length > 1) Q = items; }).catch(function () {}).then(markReady);

    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = function () { setCover(true, L.broken); };
    document.head.appendChild(s);
    setTimeout(ssEnsurePlayer, 1500);
    setInterval(guardTick, 3000);
    setInterval(updateNow, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
