/*
 * Spiritual Sounds 24/7 — kanał non-stop z oficjalnej playlisty YouTube (WERSJA TESTOWA)
 * @007, 2026-11-18. Dyrektywa Spiritual Sounds §4, §5, §17.
 *
 * Zasady:
 *  - JEDYNE źródło: playlista autora (SS_PLAYLIST). Żadnej ręcznej listy filmów — nowe nagrania dochodzą same.
 *  - Kolejny film po zakończeniu, po końcu playlisty start od początku (loop).
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
  function upcoming(n, current, k) {
    var out = [];
    if (!(n > 1) || current < 0) return out;
    for (var i = 1; i <= Math.min(k, n - 1); i++) {
      var j = current + i;
      if (j >= n) { if (isCapped(n)) break; j = j % n; }
      out.push(j);
    }
    return out;
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
  var api = { SS_PLAYLIST: SS_PLAYLIST, seedIndex: seedIndex, upcoming: upcoming, guardDecide: guardDecide, isCapped: isCapped };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SSTV = api;
  if (typeof document === 'undefined') return;

  // ---------- Język ----------
  var EN = /[?&]lang=en\b/.test(location.search);
  var T = {
    pl: {
      title: 'Spiritual Sounds 24/7 – Kanał Biblijny | Christian Culture',
      play: 'Odtwarzaj', pause: 'Pauza', unmute: 'Włącz dźwięk', mute: 'Wycisz', next: 'Następne nagranie',
      fs: 'Pełny ekran', fsExit: 'Zamknij pełny ekran', count: 'Playlista: {n} nagrań · odtwarzanie w kółko',
      countCapped: 'Cała playlista autora · odtwarzanie w kółko',
      upNext: 'Za chwilę', later: 'Później', thumbAlt: 'Miniatura kolejnego nagrania z playlisty',
      broken: 'Odtwarzacz YouTube nie odpowiada. Ponawiamy… Możesz też otworzyć playlistę na YouTube.',
      nowFallback: 'Nagranie z playlisty Spiritual Sounds', openOnYt: 'Otwórz na YouTube: '
    },
    en: {
      title: 'Spiritual Sounds 24/7 – Bible Channel | Christian Culture',
      skip: 'Skip to controls', testbar: 'Test version — this channel is not yet published or indexed.',
      brandAria: 'Spiritual Sounds — showcase', tagline: 'Psalms & the Word of God', statusAria: 'Channel status',
      langAria: 'Language', air: '24/7 · Non-stop', h1: 'Spiritual Sounds – Bible Channel 24/7',
      loading: 'Starting the channel…', soundCta: 'Turn on sound', soundMore: ' / Start the channel', badge: '24/7 · Non-stop',
      controlsAria: 'Channel controls', nowLabel: 'Now on the channel', nowWaiting: 'Connecting to the playlist…',
      ytChannel: 'Open YouTube channel', about: 'About the artist / project', nextHead: 'Next in the playlist',
      note: 'This channel plays the official “Psalmy i Słowo Boże w Muzyce” playlist from YouTube on a loop — with the creator’s permission. New recordings added by the creator appear here automatically. It is not a live broadcast but a non-stop channel.',
      play: 'Play', pause: 'Pause', unmute: 'Turn sound on', mute: 'Mute', next: 'Next recording',
      fs: 'Full screen', fsExit: 'Exit full screen', count: 'Playlist: {n} recordings · playing on a loop',
      countCapped: 'The creator’s entire playlist · playing on a loop',
      upNext: 'Up next', later: 'Later', thumbAlt: 'Thumbnail of an upcoming recording from the playlist',
      broken: 'The YouTube player is not responding. Retrying… You can also open the playlist on YouTube.',
      nowFallback: 'Recording from the Spiritual Sounds playlist', openOnYt: 'Open on YouTube: '
    }
  };
  var L = EN ? T.en : T.pl;
  var $ = function (id) { return document.getElementById(id); };

  function applyLang() {
    document.querySelectorAll('.tv-lang a').forEach(function (a) {
      a.setAttribute('aria-current', (a.dataset.lang === (EN ? 'en' : 'pl')) ? 'true' : 'false');
    });
    if (!EN) return;
    document.documentElement.lang = 'en';
    document.title = L.title;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { var k = el.dataset.i18n; if (L[k]) el.textContent = L[k]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { var k = el.dataset.i18nAria; if (L[k]) el.setAttribute('aria-label', L[k]); });
    document.querySelectorAll('[data-href-en]').forEach(function (el) { el.setAttribute('href', el.dataset.hrefEn); });
  }

  // ---------- Player ----------
  var player = null, seeded = false, muted = true, userPaused = false, lastNowId = '', everPlayed = false;

  /** Najwyżej 3 automatyczne przeładowania na 10 minut (np. YouTube zablokowany przez rozszerzenie) — bez pętli. */
  function safeReload() {
    var key = 'ss247_reloads', now = Date.now(), list = [];
    try { list = JSON.parse(sessionStorage.getItem(key) || '[]').filter(function (x) { return now - x < 600000; }); } catch (e) {}
    if (list.length >= 3) { setCover(true, L.broken); return; }
    list.push(now);
    try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
    location.reload();
  }
  var boot = Date.now(), lastT = -1, lastProgress = Date.now(), strikes = 0;
  var cover, coverMsg, soundBtn, playBtn, muteBtn, nextBtn, fsBtn, stage;

  function ytState(name) { return (root.YT && YT.PlayerState) ? YT.PlayerState[name] : NaN; }
  function playlist() { try { return (player && player.getPlaylist && player.getPlaylist()) || []; } catch (e) { return []; } }
  function curIndex() { try { return player.getPlaylistIndex(); } catch (e) { return -1; } }

  function setCover(on, msg) {
    if (!cover) return;
    cover.classList.toggle('is-off', !on);
    if (msg) coverMsg.textContent = msg;
  }
  function syncButtons() {
    var paused = userPaused;
    playBtn.classList.toggle('is-paused', paused);
    playBtn.setAttribute('aria-label', paused ? L.play : L.pause);
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? L.unmute : L.mute);
    soundBtn.hidden = !muted;
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

  function updateNow() {
    if (!player || !player.getVideoData) return;
    var d = {}; try { d = player.getVideoData() || {}; } catch (e) {}
    var id = d.video_id || '';
    if (!id || id === lastNowId) return;
    lastNowId = id;
    var title = d.title || L.nowFallback;
    $('tv-now-title').textContent = title;
    var link = $('tv-now-link');
    link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '&list=' + SS_PLAYLIST;
    link.setAttribute('aria-label', L.openOnYt + title);
    var img = $('tv-now-img');
    img.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/mqdefault.jpg';
    renderRail();
  }

  function renderRail() {
    var list = playlist(), n = list.length, cur = curIndex();
    var rail = $('tv-rail'), count = $('tv-count');
    if (n) count.textContent = isCapped(n) ? L.countCapped : L.count.replace('{n}', String(n));
    if (!rail || !n || cur < 0) return;
    var idx = upcoming(n, cur, 6);
    rail.innerHTML = '';
    idx.forEach(function (i, k) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (k === 0 ? L.upNext : L.later) + ' — ' + (L.next) + ' ' + (k + 1));
      var im = document.createElement('img');
      im.loading = 'lazy'; im.decoding = 'async'; im.width = 320; im.height = 180; im.alt = L.thumbAlt;
      im.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(list[i]) + '/mqdefault.jpg';
      var sp = document.createElement('span'); sp.textContent = k === 0 ? L.upNext : L.later;
      b.appendChild(im); b.appendChild(sp);
      b.addEventListener('click', function () { userPaused = false; try { player.playVideoAt(i); } catch (e) {} syncButtons(); });
      li.appendChild(b); rail.appendChild(li);
    });
  }

  function createPlayer() {
    if (player || !(root.YT && YT.Player)) return;
    player = new YT.Player('tv-player', {
      width: 1280, height: 720,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        listType: 'playlist', list: SS_PLAYLIST, autoplay: 1, mute: 1, playsinline: 1, controls: 0, rel: 0,
        modestbranding: 1, iv_load_policy: 3, cc_load_policy: 0, loop: 1, disablekb: 1, fs: 0,
        hl: EN ? 'en' : 'pl', origin: location.origin
      },
      events: {
        onReady: function () {
          try { var f = document.querySelector('#tv-stage iframe'); if (f) { f.setAttribute('title', 'Spiritual Sounds 24/7 — YouTube'); f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen'); } } catch (e) {}
          player.mute(); player.playVideo();
          soundBtn.hidden = false;
        },
        onError: function (err) {
          if (root.console) console.warn('SS 24/7: błąd odtwarzacza YouTube', err && err.data);
          try { player.nextVideo(); } catch (e) {}
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
            // Następne nagranie. Po ostatnim YouTube sam wraca na początek (loop: 1) — także dla pozycji ponad 200,
            // których nie widać w getPlaylist(); dlatego nie zawijamy ręcznie do 0.
            try { player.nextVideo(); } catch (er) {}
          }
        }
      }
    });
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
        case 'next': player.nextVideo(); break;
        case 'restart-list':
          var n = playlist().length || 50;
          player.loadPlaylist({ listType: 'playlist', list: SS_PLAYLIST, index: Math.floor(Math.random() * n) });
          applyAudio(); break;
        case 'reload-page': safeReload(); break;
      }
    } catch (e) {}
    if (progressed) updateNow();
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

  function init() {
    applyLang();
    cover = $('tv-cover'); coverMsg = $('tv-cover-msg'); soundBtn = $('tv-sound');
    playBtn = $('tv-play'); muteBtn = $('tv-mute'); nextBtn = $('tv-next'); fsBtn = $('tv-fs'); stage = $('tv-stage');
    nextBtn.setAttribute('aria-label', L.next); fsBtn.setAttribute('aria-label', L.fs);
    syncButtons(); soundBtn.hidden = true;

    soundBtn.addEventListener('click', function () { setMuted(false); });
    playBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', function () { setMuted(!muted); });
    nextBtn.addEventListener('click', function () { userPaused = false; try { player.nextVideo(); } catch (e) {} syncButtons(); });
    fsBtn.addEventListener('click', toggleFs);
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

    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = function () { setCover(true, L.broken); };
    document.head.appendChild(s);
    setTimeout(ssEnsurePlayer, 1500);
    setInterval(guardTick, 3000);
    setInterval(updateNow, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
