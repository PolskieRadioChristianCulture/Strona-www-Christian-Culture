/* CC Lazy Video (@007, L0 23.11.2026 — „Szybkość Tablicy”).
 * Wideo pobiera się i gra dopiero, gdy jest blisko ekranu; poza ekranem pauzuje.
 * Znacznik:  <video data-lazy-src="plik.mp4" preload="none" autoplay muted loop playsinline poster="...">
 *        albo <source data-lazy-src="plik.mp4" type="video/mp4"> wewnątrz <video>.
 * API: window.ccLazyVideo.observe(videoEl) — dla wideo tworzonych w JS.
 * Save-Data: nie startuje samo, ładuje dopiero po dotknięciu (plakat zostaje).
 * Uwaga: nie wyłączamy ruchu przy prefers-reduced-motion (L0 16.11.2026 — jego system to zgłasza).
 */
(function () {
  'use strict';
  if (window.ccLazyVideo) return;

  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var seen = typeof WeakSet === 'function' ? new WeakSet() : null;

  function hydrate(video) {
    var changed = false;
    var own = video.getAttribute('data-lazy-src');
    if (own) {
      video.removeAttribute('data-lazy-src');
      video.setAttribute('src', own);
      changed = true;
    }
    var sources = video.querySelectorAll('source[data-lazy-src]');
    for (var i = 0; i < sources.length; i++) {
      sources[i].setAttribute('src', sources[i].getAttribute('data-lazy-src'));
      sources[i].removeAttribute('data-lazy-src');
      changed = true;
    }
    if (changed) {
      if (video.getAttribute('preload') === 'none') video.setAttribute('preload', 'metadata');
      try { video.load(); } catch (e) {}
    }
    return changed;
  }

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // js/lumina-media-economy.js zdejmuje atrybut autoplay i zostawia data-lumina-autoplay="1" — honorujemy oba.
  function wantsAutoplay(video) {
    return video.hasAttribute('autoplay') || video.autoplay === true || video.getAttribute('data-lumina-autoplay') === '1';
  }

  function onScreen(video) {
    var r = video.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (window.innerHeight || 800) &&
      r.right > 0 && r.left < (window.innerWidth || 400);
  }

  function playIfAllowed(video) {
    if (!wantsAutoplay(video) || document.hidden) return;
    if (!video.__ccUserStarted && saveData) return;
    // „Ogranicz ruch”: tylko filmy prowadzone przez lumina-media-economy (one i tak tego pilnują);
    // wideo z kanału i reklama VOD grały dotąd mimo tego ustawienia — bez zmian (L0 16.11.2026).
    if (!video.__ccUserStarted && reduceMotion && video.getAttribute('data-lumina-autoplay') === '1') return;
    if (!video.__ccUserStarted && !onScreen(video)) return; // wczytane z wyprzedzeniem — zagra, gdy wejdzie na ekran
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  var io = null;      // wczytywanie z wyprzedzeniem (300 px przed ekranem)
  var playIo = null;  // odtwarzanie/pauza (min. 35% na ekranie)
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var video = entries[i].target;
        if (entries[i].isIntersecting && (!saveData || video.__ccUserStarted)) {
          hydrate(video);
          playIfAllowed(video);
        }
      }
    }, { rootMargin: '300px 0px', threshold: 0 });
    playIo = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var video = entries[i].target;
        if (entries[i].isIntersecting && entries[i].intersectionRatio >= 0.35) {
          if (!video.hasAttribute('data-lazy-src')) playIfAllowed(video);
        } else if (!video.paused && wantsAutoplay(video)) {
          video.pause();
        }
      }
    }, { threshold: [0, 0.35] });
  }

  function onUserStart(e) {
    var video = e.currentTarget;
    if (video.__ccUserStarted) return;
    video.__ccUserStarted = true;
    hydrate(video);
    playIfAllowed(video);
  }

  function observe(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    if (seen) { if (seen.has(video)) return; seen.add(video); }
    else { if (video.__ccLazySeen) return; video.__ccLazySeen = true; }
    var lazy = video.hasAttribute('data-lazy-src') || !!video.querySelector('source[data-lazy-src]');
    if (!lazy && !wantsAutoplay(video)) return; // zwykłe wideo z kontrolkami — bez zmian
    if (saveData && lazy) video.addEventListener('click', onUserStart);
    if (io) { io.observe(video); playIo.observe(video); }
    else { hydrate(video); playIfAllowed(video); }
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.tagName === 'VIDEO') observe(root);
    var list = root.querySelectorAll('video');
    for (var i = 0; i < list.length; i++) observe(list[i]);
  }

  window.ccLazyVideo = { observe: observe, scan: scan, hydrate: hydrate };

  function start() {
    scan(document);
    if ('MutationObserver' in window) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) if (added[j].nodeType === 1) scan(added[j]);
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    document.addEventListener('visibilitychange', function () {
      var list = document.querySelectorAll('video');
      if (!document.hidden) {
        // po powrocie do karty: ponowna ocena widoczności (IO wywoła callback od nowa)
        if (playIo) for (var k = 0; k < list.length; k++) if (wantsAutoplay(list[k])) { playIo.unobserve(list[k]); playIo.observe(list[k]); }
        return;
      }
      for (var i = 0; i < list.length; i++) if (wantsAutoplay(list[i]) && !list[i].paused) list[i].pause();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
