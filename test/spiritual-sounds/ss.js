/*
 * Spiritual Sounds — wizytówka v2 (WERSJA TESTOWA), @007 2026-11-18.
 * Żywy hero: wyciszony kanał 24/7 w tle (ta sama pozycja co /tv), karta „Teraz na kanale” z prawdziwym tytułem i postępem,
 * fala światła (canvas), pasek informacyjny, najnowsze nagrania (RSS), „Polecamy”, 3D tilt, liczniki, udostępnianie.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var E = window.SSEco;
  var lang = document.body.getAttribute('data-lang') || 'pl';
  var TV = document.body.getAttribute('data-tv') || '/test/spiritual-sounds/tv/';
  var $ = function (id) { return document.getElementById(id); };
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;

  setTimeout(function () { var h = document.querySelector('.hero'); if (h) h.classList.add('is-ready'); }, 3000);

  // ---------- Nawigacja ----------
  var nav = $('nav'), burger = document.querySelector('.burger');
  addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', scrollY > 30); }, { passive: true });
  if (burger) {
    var setOpen = function (o) { nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); burger.focus(); } });
  }

  // ---------- Pasek informacyjny + Polecamy ----------
  var tick = $('tickRun');
  if (E) {
    E.mountTicker(tick, lang, 'spiritual_sounds_showcase');
    E.mountPromo($('promoStage'), $('promoDots'), $('promoBar'), lang, 'spiritual_sounds_showcase', 9000);
    document.querySelectorAll('[data-promo]').forEach(function (a) {
      if (a.closest('#tickRun') || a.closest('#promoStage')) return;
      a.addEventListener('click', function () { E.ga('promo_click', a.getAttribute('data-promo'), 'spiritual_sounds_showcase'); });
    });
  }

  // ---------- Pojawianie się, liczniki ----------
  function reel(el) {
    var target = el.getAttribute('data-reel'); if (!target || el.dataset.done) return; el.dataset.done = '1';
    el.innerHTML = target.split('').map(function (d) {
      var col = ''; for (var k = 0; k <= 9; k++) col += '<span>' + k + '</span>';
      return '<span data-d="' + d + '">' + col + '</span>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      el.querySelectorAll('[data-d]').forEach(function (c, i) { c.style.transitionDelay = (i * 120) + 'ms'; c.style.transform = 'translateY(-' + (Number(c.getAttribute('data-d')) * 10) + '%)'; });
    }); });
    el.setAttribute('aria-label', target);
  }
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); x.target.querySelectorAll('[data-reel]').forEach(reel); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('is-in'); }); document.querySelectorAll('[data-reel]').forEach(reel); }

  // ---------- 3D tilt + światło za kursorem ----------
  function bindTilt(el) {
    if (!fine || el.dataset.tiltOn) return; el.dataset.tiltOn = '1';
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = 'rotateX(' + ((.5 - y) * 8).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 10).toFixed(2) + 'deg) translateZ(0)';
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }
  document.querySelectorAll('[data-tilt]').forEach(bindTilt);

  // ---------- Najnowsze nagrania (prawdziwe tytuły z kanału) ----------
  var rail = $('rail');
  function renderRail(items) {
    if (!rail) return;
    if (!items.length) {
      rail.innerHTML = '<li style="grid-column:1/-1"><p class="p">' + E.esc(rail.getAttribute('data-err')) +
        ' <a href="https://www.youtube.com/playlist?list=' + E.PLAYLIST + '" target="_blank" rel="noopener" style="color:var(--amber2)">YouTube</a></p></li>';
      return;
    }
    var now = Date.now();
    rail.innerHTML = items.map(function (it) {
      var href = TV + (TV.indexOf('?') > -1 ? '&' : '?') + 'v=' + encodeURIComponent(it.id);
      return '<li><a class="vcard' + (E.isNew(it.published, now) ? ' is-new' : '') + '" data-new="' + E.esc(rail.getAttribute('data-new')) + '" href="' + href + '" data-tilt data-promo="latest">' +
        '<div class="vcard__img"><img src="https://i.ytimg.com/vi/' + encodeURIComponent(it.id) + '/mqdefault.jpg" width="320" height="180" loading="lazy" decoding="async" alt="">' +
        '<span class="vcard__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span></div>' +
        '<div class="vcard__body"><small>' + E.esc(E.fmtDate(it.published, lang)) + '</small><strong>' + E.esc(it.title) + '</strong></div></a></li>';
    }).join('');
    rail.querySelectorAll('[data-tilt]').forEach(bindTilt);
    E.setTicker(tick, 'latest', items[0].title);
  }
  if (E && rail) E.fetchFeed().then(renderRail).catch(function () { renderRail([]); });
  var step = function (d) { if (rail) rail.scrollBy({ left: d * Math.max(260, rail.clientWidth * .8), behavior: 'smooth' }); };
  if ($('railPrev')) $('railPrev').addEventListener('click', function () { step(-1); });
  if ($('railNext')) $('railNext').addEventListener('click', function () { step(1); });

  // ---------- Udostępnianie ----------
  var share = $('shareBtn'), toast = $('toast');
  function say(msg) { toast.textContent = msg; toast.classList.add('on'); setTimeout(function () { toast.classList.remove('on'); }, 2200); }
  if (share) share.addEventListener('click', function () {
    var data = { title: document.title, url: location.href.split('#')[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function () { say(share.getAttribute('data-done')); }); }
    E.ga('share', 'spiritual_sounds', 'spiritual_sounds_showcase');
  });

  // ---------- Fala światła (canvas) — nawiązanie do emblematu Spiritual Sounds ----------
  (function wave() {
    var c = $('heroFx'); if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'), w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), t = 0, visible = true, last = 0;
    var parts = [];
    function size() { var r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = []; var n = Math.round(Math.min(90, w / 14)); for (var i = 0; i < n; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .3, s: Math.random() * .35 + .08, a: Math.random() * .6 + .2 }); }
    size(); addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(c);
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || ts - last < 33) return; last = ts; t += .016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      var cy = h * (w < 900 ? .3 : .52), cx = w < 900 ? w * .5 : w * .72;
      for (var L = 0; L < 4; L++) {
        ctx.beginPath();
        var amp = (h * .05) * (1 + L * .55) * (0.75 + .25 * Math.sin(t * .9 + L));
        for (var x = 0; x <= w; x += 6) {
          var d = (x - cx) / (w * .38), env = Math.exp(-d * d * 1.6);
          var y = cy + Math.sin(x * .018 + t * (1.4 + L * .35) + L * 1.7) * amp * env * Math.cos(x * .004 - t * .5);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, 'rgba(227,168,87,0)'); g.addColorStop(.5, 'rgba(241,201,138,' + (.22 - L * .04) + ')'); g.addColorStop(.8, 'rgba(255,226,176,' + (.32 - L * .06) + ')'); g.addColorStop(1, 'rgba(227,168,87,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.2 + (3 - L) * .5; ctx.stroke();
      }
      // pionowy promień — krzyż światła
      var vg = ctx.createLinearGradient(0, cy - h * .45, 0, cy + h * .45);
      vg.addColorStop(0, 'rgba(255,226,176,0)'); vg.addColorStop(.5, 'rgba(255,226,176,' + (.16 + .06 * Math.sin(t * 1.3)) + ')'); vg.addColorStop(1, 'rgba(255,226,176,0)');
      ctx.fillStyle = vg; ctx.fillRect(cx - 1, cy - h * .45, 2, h * .9);
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * .22);
      rg.addColorStop(0, 'rgba(255,226,176,' + (.18 + .05 * Math.sin(t * 1.1)) + ')'); rg.addColorStop(1, 'rgba(255,226,176,0)');
      ctx.fillStyle = rg; ctx.fillRect(cx - h * .22, cy - h * .22, h * .44, h * .44);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.y -= p.s; p.x += Math.sin(t + i) * .15; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(241,201,138,' + (p.a * (.6 + .4 * Math.sin(t * 2 + i))) + ')'; ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })();

  // ---------- Kanał 24/7 w tle hero (YouTube, wyciszony) + karta „Teraz na kanale” ----------
  var saveData = navigator.connection && navigator.connection.saveData;
  var player = null, seeded = false, muted = true, heroVisible = true, lastId = '';
  var soundBtn = $('onairSound');
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function updateNow() {
    if (!player || !player.getVideoData) return;
    var d = {}; try { d = player.getVideoData() || {}; } catch (e) {}
    if (d.video_id && d.video_id !== lastId) {
      lastId = d.video_id;
      var thumb = 'https://i.ytimg.com/vi/' + encodeURIComponent(d.video_id) + '/hqdefault.jpg';
      $('onairImg').src = 'https://i.ytimg.com/vi/' + encodeURIComponent(d.video_id) + '/mqdefault.jpg';
      $('onairTitle').textContent = d.title || '';
      var href = TV + (TV.indexOf('?') > -1 ? '&' : '?') + 'v=' + encodeURIComponent(d.video_id);
      $('onairLink').href = href;
      if ($('screenImg')) $('screenImg').src = thumb;
      if ($('screenTitle') && d.title) $('screenTitle').textContent = d.title;
      if (d.title) E.setTicker(tick, 'now', d.title);
    }
    try { var cur = player.getCurrentTime(), dur = player.getDuration(); if (dur > 0) { $('onairBar').style.width = (cur / dur * 100).toFixed(2) + '%'; $('onairTime').textContent = fmt(cur) + ' / ' + fmt(dur); } } catch (e) {}
  }
  function setSound(on) {
    muted = !on;
    try { if (muted) player.mute(); else { player.unMute(); player.setVolume(100); player.playVideo(); } } catch (e) {}
    soundBtn.textContent = muted ? soundBtn.getAttribute('data-on') : soundBtn.getAttribute('data-off');
    E.ga(muted ? 'showcase_mute' : 'showcase_unmute', 'hero', 'spiritual_sounds_showcase');
  }
  if (soundBtn) soundBtn.addEventListener('click', function () { if (player) setSound(muted); else location.href = TV; });

  function startPlayer() {
    if (player || !(window.YT && YT.Player)) return;
    player = new YT.Player('heroPlayer', {
      host: 'https://www.youtube-nocookie.com',
      playerVars: { listType: 'playlist', list: E.PLAYLIST, autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0, modestbranding: 1,
        iv_load_policy: 3, cc_load_policy: 0, loop: 1, disablekb: 1, fs: 0, origin: location.origin },
      events: {
        onReady: function () { try { var f = document.querySelector('#heroYt iframe'); f.setAttribute('title', 'Spiritual Sounds 24/7'); f.setAttribute('tabindex', '-1'); } catch (e) {} player.mute(); player.playVideo(); },
        onError: function () { try { player.nextVideo(); } catch (e) {} },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) {
            if (!seeded) { seeded = true; var n = (player.getPlaylist() || []).length, s = E.seedIndex(n, Date.now()); if (n > 1 && s !== player.getPlaylistIndex()) { player.playVideoAt(s); return; } }
            $('heroYt').classList.add('is-on'); updateNow();
          } else if (e.data === YT.PlayerState.ENDED) { try { player.nextVideo(); } catch (er) {} }
        },
      },
    });
  }
  function loadYT() {
    if (saveData) return;
    window.onYouTubeIframeAPIReady = startPlayer;
    var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true; document.head.appendChild(s);
    setTimeout(function () { if (!player && window.YT && YT.loaded) startPlayer(); }, 2000);
  }
  // Ładujemy odtwarzacz po pierwszym wyrenderowaniu strony (LCP bez YouTube).
  if (document.readyState === 'complete') setTimeout(loadYT, 400); else addEventListener('load', function () { setTimeout(loadYT, 400); });
  // Poza ekranem hero — pauza tła (oszczędność), chyba że ktoś słucha z dźwiękiem.
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
    heroVisible = e[0].isIntersecting;
    if (!player || !player.getPlayerState) return;
    try { if (!heroVisible && muted) player.pauseVideo(); else if (heroVisible) player.playVideo(); } catch (er) {}
  }, { threshold: .05 }).observe(document.querySelector('.hero'));
  setInterval(updateNow, 1000);
})();
