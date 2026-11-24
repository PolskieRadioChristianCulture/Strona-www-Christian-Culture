/*
 * Wizytówki Christian Culture — styl /ccwomen/ Ultra Premium w palecie CC Orange/Gold.
 * Wspólne: pasek i „Polecamy” (js/cc-eco-bars.js), pasek postępu (#progress), reveal, bębenki cyfr, 3D tilt, wstęgi światła (canvas), udostępnianie.
 * Katalog: wyszukiwarka + filtry kategorii. Nabór: kreator zgłoszenia, radio (CCChatRadio + YouTube), wideo na kliknięcie.
 */
(function () {
  'use strict';
  var root = document.documentElement; root.classList.remove('no-js');
  var $ = function (id) { return document.getElementById(id); };
  var E = window.CCEco;
  var DATA = {}; try { DATA = JSON.parse($('wzData').textContent); } catch (e) {}
  var PAGE = document.body.getAttribute('data-page');
  var PLACE = PAGE === 'katalog' ? 'wizytowki_katalog' : 'wizytowka_nabor';
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  function track(name, params) { try { if (window.gtag) gtag('event', name, Object.assign({ placement: PLACE }, params || {})); } catch (e) {} }

  setTimeout(function () { var h = document.querySelector('.hero'); if (h) h.classList.add('is-ready'); }, 3000);

  // Nawigacja i pasek postępu przewijania (#progress)
  var nav = $('nav'), prog = $('progress'), burger = document.querySelector('.burger');
  function onScroll() {
    var y = window.scrollY || 0, h = document.documentElement.scrollHeight - (window.innerHeight || 0);
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (burger && nav) {
    var setOpen = function (o) { nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); burger.focus(); } });
  }

  // Pasek + Polecamy
  if (E) {
    E.mountTicker($('tickRun'), DATA.ticker || [], PLACE);
    E.mountPromo($('promoStage'), $('promoDots'), $('promoBar'), 'pl', PLACE, 9000);
  }
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track('wizytowki_click', { target: a.getAttribute('data-track') }); });
  });

  // Reveal + bębenki cyfr (wzorzec /ccwomen/: rzędy <i> w .reel__track, bez konfliktu <span>)
  function reel(el) {
    var target = el.getAttribute('data-reel');
    if (target === null || target === '' || el.dataset.done) return;
    el.dataset.done = '1';
    el.innerHTML = target.split('').map(function (d) {
      var col = '';
      for (var k = 0; k <= 9; k++) col += '<i>' + k + '</i>';
      return '<span class="reel__col"><span class="reel__track" data-d="' + d + '">' + col + '</span></span>';
    }).join('');
    el.setAttribute('aria-label', target);
    var tracks = el.querySelectorAll('.reel__track');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          tracks.forEach(function (c, i) {
            c.style.transitionDuration = (1.55 + i * 0.32) + 's';
            c.style.transform = 'translateY(-' + Number(c.getAttribute('data-d')) + 'em)';
          });
        });
      });
    } else {
      tracks.forEach(function (c) {
        c.style.transform = 'translateY(-' + Number(c.getAttribute('data-d')) + 'em)';
      });
    }
  }
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) {
          x.target.classList.add('is-in');
          x.target.querySelectorAll('[data-reel]').forEach(reel);
          io.unobserve(x.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rev.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      rev.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 900) * 1.15) {
          el.classList.add('is-in');
          el.querySelectorAll('[data-reel]').forEach(reel);
        }
      });
    }, 2500);
  } else {
    rev.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-reel]').forEach(reel);
  }

  // 3D tilt + światło
  function bindTilt(el) {
    if (!fine || el.dataset.tiltOn) return; el.dataset.tiltOn = '1';
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = 'rotateX(' + ((.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 9).toFixed(2) + 'deg)';
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }
  document.querySelectorAll('[data-tilt]').forEach(bindTilt);

  // Wstęgi światła (wzorzec /ccwomen/) + delikatne iskry (canvas) w tle hero
  (function fx() {
    var c = $('heroFx'); if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'); if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), t = 0, vis = true, last = 0, parts = [];
    var ribbons = [
      { a: .48, f: 1.15, s: .55, hue: 'rgba(255,122,0,', y: .78, amp: .065 },
      { a: .34, f: 1.75, s: .40, hue: 'rgba(255,168,76,', y: .86, amp: .048 },
      { a: .26, f: .90, s: .72, hue: 'rgba(242,196,109,', y: .92, amp: .038 }
    ];
    function size() {
      var r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = [];
      var n = Math.round(Math.min(84, Math.max(24, w / 14)));
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.7 + .35, s: Math.random() * .42 + .12, a: Math.random() * .52 + .22, hue: Math.random() < .68 ? 28 : 42 });
    }
    size(); addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(c);
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!vis || document.hidden || ts - last < 33 || !w || !h) return;
      last = ts; t += .016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      var cx = w < 960 ? w * .5 : w * .72, cy = w < 960 ? 150 : h * .48;
      for (var k = 0; k < 6; k++) {
        var ang = t * .07 + k * 1.05, len = Math.max(w, h) * .85;
        var g = ctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        g.addColorStop(0, 'rgba(255,140,51,' + (.055 + .022 * Math.sin(t + k)) + ')');
        g.addColorStop(1, 'rgba(255,140,51,0)');
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang - .045) * len, cy + Math.sin(ang - .045) * len); ctx.lineTo(cx + Math.cos(ang + .045) * len, cy + Math.sin(ang + .045) * len); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      }
      ctx.lineWidth = 2;
      for (var r = 0; r < ribbons.length; r++) {
        var b = ribbons[r];
        var grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, b.hue + '0)'); grad.addColorStop(.36, b.hue + b.a + ')'); grad.addColorStop(1, b.hue + '0)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        for (var x = 0; x <= w; x += 12) {
          var y = h * b.y + Math.sin(x / w * Math.PI * 2 * b.f + t * b.s) * h * b.amp + Math.sin(x / 140 + t * b.s * .6) * 5;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.y -= p.s; p.x += Math.sin(t * 1.2 + i) * .22;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,64%,' + (p.a * (.55 + .45 * Math.sin(t * 2 + i))) + ')';
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })();

  // Udostępnianie
  var toast = $('toast');
  function say(m) { if (!toast) return; toast.textContent = m; toast.classList.add('on'); setTimeout(function () { toast.classList.remove('on'); }, 2200); }
  function copy(text) { if (navigator.clipboard) return navigator.clipboard.writeText(text); var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); return Promise.resolve(); }
  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = location.origin + location.pathname;
      if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
      else copy(url).then(function () { say('Link skopiowany'); });
      track('share', { target: PAGE });
    });
  });

  // ---------- KATALOG: wyszukiwarka i filtry ----------
  if (PAGE === 'katalog') {
    var q = $('wizytowkiSearch'), fbtns = document.querySelectorAll('.fbtn'), cards = document.querySelectorAll('[data-card]'), cats = document.querySelectorAll('.cat'), empty = $('empty'), active = 'all';
    var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l'); };
    function apply() {
      var term = norm(q.value.trim()), shown = 0;
      cards.forEach(function (c) {
        var okCat = active === 'all' || (' ' + c.getAttribute('data-cats') + ' ').indexOf(' ' + active + ' ') > -1;
        var okQ = !term || norm(c.getAttribute('data-kw')).indexOf(term) > -1;
        var inCat = c.closest('.cat'), catId = inCat && inCat.getAttribute('data-cat');
        // W widoku „wszystkie” każda karta tylko w swojej kategorii głównej; w filtrze — także w dodatkowych.
        var primary = c.getAttribute('data-primary') === '1';
        var on = okCat && okQ && (active === 'all' ? primary : catId === active);
        c.hidden = !on; if (on) shown++;
      });
      cats.forEach(function (s) { s.hidden = !s.querySelector('[data-card]:not([hidden])'); });
      empty.hidden = shown > 0;
      $('qCount').textContent = shown;
    }
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        active = b.getAttribute('data-f'); fbtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply(); track('wizytowki_filter', { target: active });
        var t = document.querySelector('#katalog'); if (t && window.scrollY > t.offsetTop) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
    var qt = null;
    q.addEventListener('input', function () { apply(); clearTimeout(qt); qt = setTimeout(function () { if (q.value.trim()) track('wizytowki_search', { target: q.value.trim().slice(0, 40) }); }, 900); });
    var hash = (location.hash || '').replace('#', '');
    var pre = document.querySelector('.fbtn[data-f="' + hash + '"]'); if (pre) pre.click(); else apply();
  }

  // ---------- NABÓR: kreator zgłoszenia ----------
  if (PAGE === 'nabor') {
    var f = { name: $('cName'), field: $('cField'), desc: $('cDesc') };
    var pv = { url: $('pUrl'), field: $('pField'), name: $('pName'), desc: $('pDesc') };
    var slug = function (s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').replace(/[^A-Za-z0-9]+/g, '').slice(0, 28) || 'TwojaMisja'; };
    function msg() {
      return 'Szczęść Boże! Zgłaszam wizytówkę do Christian Culture.\n\nNazwa: ' + (f.name.value.trim() || '—') + '\nDziedzina: ' + f.field.value + '\nO mnie / o misji: ' + (f.desc.value.trim() || '—') + '\nProponowany adres: polskieradio.cc/' + slug(f.name.value) + '\n\nRazem możemy więcej. Ku chwale Boga i dla dobra ludzi!';
    }
    function paint() {
      pv.url.textContent = 'polskieradio.cc/' + slug(f.name.value);
      pv.field.textContent = f.field.value;
      pv.name.textContent = f.name.value.trim() || 'Twoja Misja w Christian Culture';
      pv.desc.textContent = f.desc.value.trim() || 'Tworzę chrześcijańską muzykę, dzielę się świadectwem wiary i chcę służyć swoimi talentami ku chwale Boga i dla dobra ludzi.';
    }
    [f.name, f.field, f.desc].forEach(function (el) { el.addEventListener('input', paint); });
    paint();
    $('cWa').addEventListener('click', function () { copy(msg()).then(function () { say('Zgłoszenie skopiowane — wklej je na grupie'); }); window.open(DATA.whatsapp, '_blank', 'noopener'); track('wizytowka_zgloszenie', { target: 'whatsapp' }); });
    $('cCopy').addEventListener('click', function () { copy(msg()).then(function () { say('Tekst skopiowany'); }); track('wizytowka_zgloszenie', { target: 'kopiuj' }); });

    // Radio — te same stacje co na /wizytówka (repertuar CC), odtwarzanie przez CCChatRadio lub YouTube
    var ST = DATA.stations || [], idx = 0, deck = $('deck'), now = $('deckNow'), status = $('deckStatus'), ytWrap = $('ytWrap'), ytPlayer = null, req = 0, playing = false;
    var radio = function () { return window.CCChatRadio; };
    var stBtns = document.querySelectorAll('.station');
    function paintSt() { stBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); }); now.textContent = ST[idx] ? ST[idx].name : ''; }
    function setPlaying(p) { playing = p; deck.classList.toggle('is-playing', p); $('deckPlay').textContent = p ? 'Pauza' : 'Słuchaj tutaj'; }
    function stopAll() { req++; try { if (radio()) radio().pause(); } catch (e) {} try { if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); } catch (e) {} setPlaying(false); }
    function play() {
      var st = ST[idx]; if (!st) return; stopAll(); var my = req; track('wizytowka_radio_play', { target: st.short });
      if (st.nativeId) {
        ytWrap.hidden = true;
        if (!radio()) { status.textContent = 'Odtwarzacz audio jest niedostępny — otwórz pełny odtwarzacz.'; return; }
        status.textContent = 'Łączę z: ' + st.name + '…';
        radio().prepare(st.nativeId).then(function () { if (my !== req) return; radio().select(st.nativeId); return radio().play(); })
          .then(function () { if (my === req) { setPlaying(true); status.textContent = 'Gra: ' + st.name; } })
          .catch(function () { if (my === req) status.textContent = 'Nie udało się wczytać nagrań. Spróbuj ponownie.'; });
        return;
      }
      ytWrap.hidden = false; status.textContent = 'Playlista YouTube: ' + st.name;
      var start = function () {
        if (ytPlayer && ytPlayer.loadPlaylist) { ytPlayer.loadPlaylist({ listType: 'playlist', list: st.yt }); setPlaying(true); return; }
        ytPlayer = new YT.Player('ytBox', { host: 'https://www.youtube-nocookie.com', playerVars: { listType: 'playlist', list: st.yt, autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
          events: { onReady: function () { setPlaying(true); },
            onStateChange: function (e) { if (e.data === 1) { status.textContent = 'Nagrania YouTube: ' + ST[idx].name; if (window.wzCountYouTube) window.wzCountYouTube(); } } } });
      };
      if (window.YT && YT.Player) start();
      else { window.onYouTubeIframeAPIReady = start; var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s); }
    }
    // Licznik „Celujemy w Pierwszy Milion” (te same zasady co /milion i dawna /wizytówka):
    // strumienie na żywo liczy /js/cc-radio-milion.js; odsłuch playlisty YouTube zgłaszamy raz na wizytę.
    var ytCounted = false;
    function loadCount() {
      fetch('/api/milion/count', { cache: 'no-store' }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (x) {
          var d = x.d;
          if (!x.ok || d.success !== true || d.source !== 'd1' || !Number.isSafeInteger(d.count) || d.count < 0) throw new Error('counter');
          var txt = d.count.toLocaleString('pl-PL');
          document.querySelectorAll('[data-count]').forEach(function (n) { n.textContent = txt; });
        }).catch(function () {});
    }
    function countYouTube() {
      if (ytCounted) return; ytCounted = true;
      var body = JSON.stringify({ type: 'radio' });
      try {
        if (!(navigator.sendBeacon && navigator.sendBeacon('/api/milion/count', new Blob([body], { type: 'text/plain' })))) {
          fetch('/api/milion/count', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function () {});
        }
      } catch (e) {}
      setTimeout(loadCount, 1500);
    }
    loadCount();
    window.wzCountYouTube = countYouTube;
    stBtns.forEach(function (b, i) { b.addEventListener('click', function () { idx = i; paintSt(); play(); }); });
    $('deckPlay').addEventListener('click', function () { if (playing) stopAll(); else play(); });
    paintSt();

    // Wideo „Dobrze, że jesteś” — wczytanie po kliknięciu
    var vf = $('vFacade');
    if (vf) vf.addEventListener('click', function () {
      var id = vf.getAttribute('data-id'), box = document.createElement('div');
      box.className = 'yt-wrap'; box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Dobrze, że jesteś — Christian Culture" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      vf.replaceWith(box); track('wizytowka_video', { target: id });
    });
  }
})();
