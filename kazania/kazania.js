/*
 * Kazania z Pasją — logika portalu FULL PREMIUM EkoCC
 * Źródła prawdziwe: /kazania/data/kazania.json, /data/werset_dnia_365_ubg.json oraz /api/kazania/*
 */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches && !reduced;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function norm(s) {
    return String(s || '')
      .toLocaleLowerCase('pl')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l');
  }

  function ga(name, params) {
    try {
      if (window.gtag) window.gtag('event', name, params || {});
    } catch (e) {}
  }

  var toastTimer = null;
  function showToast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2800);
  }

  // Walidacja linku Google Drive / Docs po stronie klienta (zgodna z /api/kazania/submit)
  function parseDriveUrlClient(rawUrl) {
    var input = String(rawUrl || '').trim();
    if (!input) return { empty: true, valid: false };
    var u;
    try { u = new URL(input); } catch (e) { return { valid: false, error: 'Nieprawidłowy adres URL.' }; }
    if (u.protocol !== 'https:') return { valid: false, error: 'Wymagany adres https:// z Dysku Google lub Docs.' };
    var host = u.hostname.toLowerCase();
    var idRe = /^[A-Za-z0-9_-]{15,80}$/;
    var fid = '';
    if (host === 'drive.google.com') {
      var fm = u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
      if (fm) fid = fm[1];
      else if (u.pathname === '/open' || u.pathname === '/uc') fid = u.searchParams.get('id') || '';
      if (!idRe.test(fid)) return { valid: false, error: 'Nie rozpoznano identyfikatora pliku na drive.google.com.' };
      return { valid: true, provider: 'drive', fileId: fid };
    }
    if (host === 'docs.google.com') {
      var dm = u.pathname.match(/^\/document\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
      if (dm) fid = dm[1];
      if (!idRe.test(fid)) return { valid: false, error: 'Nie rozpoznano identyfikatora dokumentu na docs.google.com.' };
      return { valid: true, provider: 'gdocs', fileId: fid };
    }
    return { valid: false, error: 'Dozwolone są wyłącznie linki z drive.google.com lub docs.google.com.' };
  }

  setTimeout(function () {
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('is-ready');
  }, 3000);

  // ---------- Motyw jasny / ciemny ----------
  var themeBtn = $('themeToggle');
  try {
    if (localStorage.getItem('kzpTheme') === 'light') {
      document.body.classList.add('light');
    }
  } catch (e) {}

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isLight = document.body.classList.toggle('light');
      themeBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      try { localStorage.setItem('kzpTheme', isLight ? 'light' : 'dark'); } catch (e) {}
    });
  }

  // ---------- Nawigacja i menu mobilne ----------
  var nav = $('nav');
  var burger = $('burgerBtn');
  addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('is-scrolled', scrollY > 24);
  }, { passive: true });

  if (nav && burger) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
  }

  // ---------- Canvas hero: złota fala światła (≤30 fps) ----------
  (function initHeroCanvas() {
    var c = $('heroFx');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), t = 0, visible = true, last = 0;
    var parts = [];
    function size() {
      var r = c.getBoundingClientRect();
      w = r.width || innerWidth;
      h = r.height || 520;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = [];
      var count = Math.round(Math.min(72, w / 16));
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.4,
          s: Math.random() * 0.3 + 0.08,
          a: Math.random() * 0.55 + 0.2
        });
      }
    }
    size();
    addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(c);
    }
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || ts - last < (reduced ? 55 : 34)) return;
      last = ts;
      t += reduced ? 0.008 : 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      var cy = h * (w < 900 ? 0.28 : 0.52);
      var cx = w < 900 ? w * 0.5 : w * 0.72;
      for (var L = 0; L < 3; L++) {
        ctx.beginPath();
        var amp = (h * 0.045) * (1 + L * 0.5) * (0.8 + 0.2 * Math.sin(t * 0.9 + L));
        for (var x = 0; x <= w; x += 8) {
          var d = (x - cx) / (w * 0.42);
          var env = Math.exp(-d * d * 1.5);
          var y = cy + Math.sin(x * 0.016 + t * (1.3 + L * 0.3) + L * 1.5) * amp * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        var grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(241, 201, 138, 0)');
        grad.addColorStop(0.5, 'rgba(241, 201, 138, ' + (0.2 - L * 0.04) + ')');
        grad.addColorStop(0.82, 'rgba(255, 122, 0, ' + (0.24 - L * 0.05) + ')');
        grad.addColorStop(1, 'rgba(241, 201, 138, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4 + (2 - L) * 0.45;
        ctx.stroke();
      }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.s;
        p.x += Math.sin(t + i) * 0.14;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(241, 201, 138, ' + (p.a * (0.6 + 0.4 * Math.sin(t * 2 + i))) + ')';
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })();

  // ---------- Ticker informacyjny ----------
  var tickEl = $('tickRun');
  var TICK_ITEMS = [
    { id: 'verse', b: 'Werset dnia (UBG)', t: '2 Tymoteusza 4:2 — Głoś słowo Boże…', href: '/mojabiblia', live: 'verse' },
    { id: 'count', b: 'Biblioteka', t: 'Konspekty kazań biblijnych', href: '#biblioteka', live: 'count' },
    { id: 'wspieraj', cc: true, b: 'WspieramTO', t: 'Wspieraj głoszenie Ewangelii — <strong>polskieradio.cc/wspieramto</strong>', href: '/wspieramto', modal: true },
    { id: 'biblia-audio', b: 'Biblia Audio', t: 'Całe Pismo do słuchania 24/7 — <strong>polskieradio.cc/biblia-audio</strong>', href: '/biblia-audio' },
    { id: 'akademia', b: 'Kurs Codzienny', t: 'Z Biblią za Pan Brat — <strong>polskieradio.cc/akademia</strong>', href: '/akademia/kurscodzienny' },
    { id: 'mojabiblia', b: 'Moja Biblia', t: 'Przekłady UBG, kody Stronga i studium', href: '/mojabiblia' },
    { id: 'patronite', cc: true, b: 'Patronite', t: '<strong>patronite.pl/osobowoscplus</strong>', href: 'https://patronite.pl/osobowoscplus' }
  ];

  function mountTicker() {
    if (!tickEl) return;
    var html = TICK_ITEMS.map(function (it) {
      var inner = '<b>' + esc(it.b) + '</b><span' + (it.live ? ' data-live="' + esc(it.live) + '"' : '') + '>' + it.t + '</span>';
      var cls = 'tick__item' + (it.cc ? ' is-cc' : '');
      var ext = /^https?:/.test(it.href) ? ' target="_blank" rel="noopener"' : '';
      var wt = it.modal ? ' data-cc-wspieramto="true"' : '';
      return '<a class="' + cls + '" href="' + esc(it.href) + '"' + ext + wt + ' data-promo="tick-' + esc(it.id) + '">' + inner + '</a>';
    }).join('');
    tickEl.innerHTML = html + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ');
    tickEl.style.setProperty('--run', '75s');
    tickEl.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-promo]');
      if (a) ga('promo_click', { promo_id: a.getAttribute('data-promo'), placement: 'kazania_ticker' });
    });
  }

  function setTickerLive(key, text) {
    if (!tickEl) return;
    tickEl.querySelectorAll('[data-live="' + key + '"]').forEach(function (el) {
      el.textContent = text;
    });
  }

  mountTicker();

  // ---------- Polecamy ----------
  var PROMOS = [
    { id: 'biblia-audio', href: '/biblia-audio', img: '/assets/promo/promo-biblia-audio-16x9.webp', h: 'Biblia Audio — całe Pismo do słuchania', u: 'polskieradio.cc/biblia-audio' },
    { id: 'akademia', href: '/akademia/kurscodzienny', img: '/assets/promo/promo-kurscodzienny-16x9.webp', h: 'Kurs Codzienny — Z Biblią za Pan Brat', u: 'polskieradio.cc/akademia' },
    { id: 'mojabiblia', href: '/mojabiblia', img: '/assets/promo/promo-mojabiblia-16x9.webp', h: 'Moja Biblia — studium i przekłady', u: 'polskieradio.cc/mojabiblia' },
    { id: 'wspieraj', href: '/wspieraj', img: '/assets/promo/promo-wspieraj-klasyczny.webp', h: 'WspieramTO — Pomóż nieść Słowo dalej', u: 'polskieradio.cc/wspieraj' },
    { id: 'vod', href: '/vod', img: '/assets/promo/promo-vod-16x9.webp', h: 'Kino VOD Christian Culture', u: 'polskieradio.cc/vod' },
    { id: 'lumina', href: '/lumina', img: '/assets/promo/promo-lumina-16x9.webp', h: 'LUMINA & LUMI Messenger', u: 'polskieradio.cc/lumina' }
  ];

  (function mountPromo() {
    var stage = $('promoStage'), dots = $('promoDots'), bar = $('promoBar');
    if (!stage || !dots) return;
    var i = -1, cur = null, timer = null, seen = {}, dur = 9500;
    dots.innerHTML = PROMOS.map(function (p) {
      return '<button type="button" aria-label="' + esc(p.h) + '"></button>';
    }).join('');

    function show(k) {
      i = (k + PROMOS.length) % PROMOS.length;
      var p = PROMOS[i];
      var a = document.createElement('a');
      a.href = p.href;
      a.setAttribute('data-promo', p.id);
      a.className = 'in';
      a.innerHTML = '<img src="' + esc(p.img) + '" alt="' + esc(p.h + ' — ' + p.u) + '" loading="lazy" decoding="async">';
      a.addEventListener('click', function () {
        ga('promo_click', { promo_id: p.id, placement: 'kazania_polecamy' });
      });
      stage.appendChild(a);
      void a.offsetWidth;
      a.className = '';
      if (cur) {
        var old = cur;
        old.className = 'out';
        setTimeout(function () { old.remove(); }, 900);
      }
      cur = a;
      [].forEach.call(dots.children, function (d, j) {
        d.classList.toggle('on', j === i);
        d.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0';
        void bar.offsetWidth;
        bar.style.transition = 'width ' + dur + 'ms linear';
        bar.style.width = '100%';
      }
      if (!seen[p.id]) {
        seen[p.id] = 1;
        ga('promo_impression', { promo_id: p.id, placement: 'kazania_polecamy' });
      }
      clearTimeout(timer);
      timer = setTimeout(function () { show(i + 1); }, dur);
    }

    [].forEach.call(dots.children, function (d, j) {
      d.addEventListener('click', function () { show(j); });
    });
    show(0);
  })();

  // ---------- Reveal & Liczniki bębnowe ----------
  function animateReel(el) {
    var target = el.getAttribute('data-reel');
    if (!target || el.dataset.done === target) return;
    el.dataset.done = target;
    el.innerHTML = target.split('').map(function (d) {
      if (!/^\d$/.test(d)) return '<span><span>' + esc(d) + '</span></span>';
      var col = '';
      for (var k = 0; k <= 9; k++) col += '<span>' + k + '</span>';
      return '<span data-d="' + d + '">' + col + '</span>';
    }).join('');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelectorAll('[data-d]').forEach(function (c, idx) {
          c.style.transitionDelay = (idx * 110) + 'ms';
          c.style.transform = 'translateY(-' + (Number(c.getAttribute('data-d')) * 10) + '%)';
        });
      });
    });
    el.setAttribute('aria-label', target);
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          en.target.querySelectorAll('[data-reel]').forEach(animateReel);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-reel]').forEach(animateReel);
  }

  function bindTilt(el) {
    if (!fine || el.dataset.tiltOn) return;
    el.dataset.tiltOn = '1';
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      el.style.transform = 'rotateX(' + ((0.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 7).toFixed(2) + 'deg) translateZ(0)';
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () {
      el.style.transform = '';
    });
  }

  // ---------- Werset dnia z /data/werset_dnia_365_ubg.json ----------
  (function loadVerseOfDay() {
    var dateEl = $('liveVerseDate'), textEl = $('liveVerseText'), refEl = $('liveVerseRef'), themeEl = $('liveVerseTheme');
    if (dateEl) {
      try {
        dateEl.textContent = new Date().toLocaleDateString('pl-PL', {
          timeZone: 'Europe/Warsaw',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {}
    }
    fetch('/data/werset_dnia_365_ubg.json', { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var list = (data && data.verses) || [];
        if (!list.length) return;
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var day = Math.floor((now - start) / 86400000);
        var item = list[(day - 1 + list.length) % list.length];
        if (!item) return;
        if (textEl) textEl.textContent = '„' + item.text + '”';
        if (refEl) refEl.textContent = item.reference + ' (UBG-2025)';
        if (themeEl) themeEl.textContent = item.theme || '';
        setTickerLive('verse', item.reference + ' — ' + item.text);
      })
      .catch(function () {});
  })();

  // ---------- Stan biblioteki, społeczności, auth i modalu ----------
  var editorialSermons = [];
  var communitySermons = [];
  var categories = [];
  var saved = new Set();
  var onlySaved = false;
  var sourceFilter = 'all';
  var currentSermon = null;
  var authUser = null;
  var viewerIsAdmin = false;
  var luminaAuthRef = null;

  try {
    saved = new Set(JSON.parse(localStorage.getItem('kzpSaved') || '[]'));
  } catch (e) {}

  function allSermons() {
    return communitySermons.concat(editorialSermons);
  }

  function getSermon(id) {
    return allSermons().find(function (s) { return s.id === id; });
  }

  function isNewPublication(dateStr) {
    if (!dateStr) return false;
    var ts = Date.parse(dateStr);
    return Number.isFinite(ts) && (Date.now() - ts) < 7 * 86400000;
  }

  function cardBadge(s) {
    if (s.isCommunity) {
      if (s.status === 'pending') return { text: 'OCZEKUJE NA AKCEPTACJĘ', cls: 'scard__badge scard__badge--pending' };
      if (s.format === 'mp3') return { text: 'MP3 · DYSK GOOGLE', cls: 'scard__badge scard__badge--mp3' };
      if (s.format === 'pdf') return { text: 'PDF · DYSK GOOGLE', cls: 'scard__badge scard__badge--pdf' };
      if (s.format === 'doc') return { text: 'GOOGLE DOCS', cls: 'scard__badge scard__badge--doc' };
      return { text: 'KONSPEKT SPOŁECZNOŚCI', cls: 'scard__badge scard__badge--new' };
    }
    if (isNewPublication(s.publishedDate) && !s.isDemo) {
      return { text: 'NOWE · ' + s.publishedDate, cls: 'scard__badge scard__badge--new' };
    }
    if (s.isDemo) return { text: 'KONSPEKT STARTOWY', cls: 'scard__badge' };
    return { text: 'PEŁNY KONSPEKT (16 PKT)', cls: 'scard__badge' };
  }

  function renderCards() {
    var searchVal = norm(($('search') && $('search').value) || '');
    var catVal = ($('category') && $('category').value) || '';
    var list = allSermons();
    var filtered = list.filter(function (s) {
      if (sourceFilter === 'editorial' && s.isCommunity) return false;
      if (sourceFilter === 'community' && !s.isCommunity) return false;
      if (catVal && s.cat !== catVal) return false;
      if (onlySaved && !saved.has(s.id)) return false;
      var hay = norm([s.title, s.ref, s.cat, s.series, s.desc, s.apply, s.authorName, s.outlineText].concat(s.points || []).join(' '));
      return hay.indexOf(searchVal) !== -1;
    });

    if ($('count')) {
      $('count').textContent = filtered.length + ' materiał(y) · UBG-2025 · Redakcja + Społeczność LUMINA';
    }

    var cardsEl = $('cards');
    if (!cardsEl) return;
    if (!filtered.length) {
      cardsEl.innerHTML = '<p class="p">Brak wyników dla wybranych kryteriów. Spróbuj wyczyścić filtry lub udostępnij własne kazanie!</p>';
      return;
    }

    cardsEl.innerHTML = filtered.map(function (s) {
      var isSaved = saved.has(s.id);
      var badge = cardBadge(s);
      var modControls = '';
      if (s.isCommunity && (viewerIsAdmin || s.isMine)) {
        modControls = '<div class="mod-bar">' +
          (viewerIsAdmin && s.status === 'pending'
            ? '<button type="button" class="act-btn act-btn--cc" data-mod="approve" data-id="' + esc(s.id) + '">Zatwierdź</button>' +
              '<button type="button" class="act-btn" data-mod="reject" data-id="' + esc(s.id) + '">Odrzuć</button>'
            : '') +
          '<button type="button" class="act-btn" data-del="' + esc(s.id) + '">Usuń</button>' +
        '</div>';
      }

      var primaryListenLabel = (s.isCommunity && s.format === 'mp3') ? '▶ Posłuchaj MP3' : '▶ Posłuchaj';
      var pdfBtnLabel = (s.isCommunity && s.driveDownloadUrl) ? 'Pobierz plik' : 'PDF';

      return '<article class="scard" id="k-' + esc(s.id) + '" data-tilt>' +
        '<div class="scard__cover" aria-hidden="true">' +
          '<span class="scard__glyph">✦</span>' +
          '<span class="' + badge.cls + '">' + esc(badge.text) + '</span>' +
        '</div>' +
        '<span class="scard__meta">' + esc(s.cat) + ' · ' + esc(s.series) + '</span>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<div class="scard__ref">' + esc(s.ref || 'Szkic i nauczanie biblijne') + '</div>' +
        (s.isCommunity && s.authorName ? '<div class="scard__author">Autor: ' + esc(s.authorName) + '</div>' : '') +
        '<p class="scard__desc">' + esc(s.desc) + '</p>' +
        '<div class="scard__actions">' +
          '<button type="button" class="act-btn act-btn--cc" data-act="listen" data-id="' + esc(s.id) + '">' + primaryListenLabel + '</button>' +
          '<button type="button" class="act-btn" data-act="read" data-id="' + esc(s.id) + '">Czytaj</button>' +
          '<button type="button" class="act-btn" data-act="pdf" data-id="' + esc(s.id) + '">' + pdfBtnLabel + '</button>' +
          '<button type="button" class="act-btn" data-act="share" data-id="' + esc(s.id) + '">Udostępnij</button>' +
          '<button type="button" class="act-btn" data-cc-wspieramto="true" aria-label="Wesprzyj wspieramTO">♡ WspieramTO</button>' +
          '<button type="button" class="act-btn act-btn--save' + (isSaved ? ' is-saved' : '') + '" data-act="save" data-id="' + esc(s.id) + '" aria-label="' + (isSaved ? 'Usuń z zapisanych' : 'Zapisz kazanie') + '" aria-pressed="' + (isSaved ? 'true' : 'false') + '">' + (isSaved ? '★' : '☆') + '</button>' +
        '</div>' +
        modControls +
      '</article>';
    }).join('');

    cardsEl.querySelectorAll('[data-tilt]').forEach(bindTilt);
  }

  function renderSeries() {
    var seriesEl = $('series');
    if (!seriesEl) return;
    var list = allSermons();
    var names = [];
    list.forEach(function (s) {
      if (s.series && names.indexOf(s.series) === -1) names.push(s.series);
    });
    seriesEl.innerHTML = names.map(function (name) {
      var cnt = list.filter(function (s) { return s.series === name; }).length;
      return '<article class="series-card" data-tilt>' +
        '<div>' +
          '<span class="scard__meta">Seria biblijna</span>' +
          '<h3>' + esc(name) + '</h3>' +
          '<p>' + cnt + ' materiał(y) w bibliotece</p>' +
        '</div>' +
        '<button type="button" class="btn btn--ghost" data-series="' + esc(name) + '">Odkryj serię →</button>' +
      '</article>';
    }).join('');
    seriesEl.querySelectorAll('[data-tilt]').forEach(bindTilt);
  }

  function updateStatsAndTicker() {
    var list = allSermons();
    var seriesSet = new Set(list.map(function (s) { return s.series; }).filter(Boolean));
    if ($('statSermons')) $('statSermons').setAttribute('data-reel', String(list.length));
    if ($('statCats')) $('statCats').setAttribute('data-reel', String(categories.length));
    if ($('statSeries')) $('statSeries').setAttribute('data-reel', String(seriesSet.size));
    document.querySelectorAll('[data-reel]').forEach(animateReel);
    setTickerLive('count', list.length + ' materiałów w bibliotece · ' + categories.length + ' kategorii');
  }

  function openReader(id) {
    var s = getSermon(id);
    if (!s) return;
    currentSermon = s;
    var versesHtml = (s.keyVerses && s.keyVerses.length)
      ? '<div class="verse-box"><strong>Tekst Pisma Świętego (UBG-2025 · ' + esc(s.ref) + '):</strong>' +
          s.keyVerses.map(function (v) {
            return '<p><b>' + esc(v.v) + '.</b> ' + esc(v.text) + '</p>';
          }).join('') +
          '<p><a href="' + esc(s.bookUrl || '/mojabiblia') + '" style="color:var(--cc-hover);font-weight:700">Otwórz cały rozdział w MojaBiblia →</a></p>' +
        '</div>'
      : '';

    var driveEmbed = '';
    if (s.drivePreviewUrl) {
      var linksBar = '<div class="drive-links-bar">' +
        (s.driveDownloadUrl ? '<a class="act-btn act-btn--cc" href="' + esc(s.driveDownloadUrl) + '" target="_blank" rel="noopener noreferrer">Pobierz z Dysku Google</a>' : '') +
        (s.driveUrl ? '<a class="act-btn" href="' + esc(s.driveUrl) + '" target="_blank" rel="noopener noreferrer">Otwórz na Dysku Google →</a>' : '') +
      '</div>';
      if (s.format === 'pdf' || s.format === 'doc' || s.format === 'outline') {
        driveEmbed = linksBar +
          '<iframe class="drive-frame" src="' + esc(s.drivePreviewUrl) + '" title="Podgląd pliku z Dysku Google" sandbox="allow-scripts allow-same-origin allow-popups" referrerpolicy="no-referrer"></iframe>';
      } else {
        driveEmbed = linksBar;
      }
    }

    var bodySections = '';
    if (s.objective) bodySections += '<h2>Cel kazania</h2><p>' + esc(s.objective) + '</p>';
    if (s.historicalContext || s.context) bodySections += '<h2>Kontekst historyczny</h2><p>' + esc(s.historicalContext || s.context) + '</p>';
    if (s.literaryContext) bodySections += '<h2>Kontekst literacki</h2><p>' + esc(s.literaryContext) + '</p>';
    if (s.exegesis) bodySections += '<h2>Egzegeza fragmentu</h2><p>' + esc(s.exegesis) + '</p>';
    if (s.introduction) bodySections += '<h2>Wprowadzenie</h2><p>' + esc(s.introduction) + '</p>';
    bodySections += '<h2>Główna myśl</h2><p>' + esc(s.desc) + '</p>';
    if (s.points && s.points.length) {
      bodySections += '<h2>Punkty kazania</h2><ol>' + s.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>';
    }
    if (s.relatedVerses && s.relatedVerses.length) {
      bodySections += '<h2>Teksty powiązane</h2><p>' + s.relatedVerses.map(esc).join(' · ') + '</p>';
    }
    if (s.illustration) bodySections += '<h2>Ilustracja kaznodziejska</h2><p>' + esc(s.illustration) + '</p>';
    if (s.christocentric) bodySections += '<h2>Przesłanie chrystocentryczne</h2><p>' + esc(s.christocentric) + '</p>';
    if (s.outlineText) bodySections += '<h2>Konspekt autorski</h2><div class="outline-pre">' + esc(s.outlineText) + '</div>';
    if (s.apply) bodySections += '<h2>Zastosowanie praktyczne</h2><p>' + esc(s.apply) + '</p>';
    if (s.callToAction) bodySections += '<h2>Apel końcowy</h2><p>' + esc(s.callToAction) + '</p>';
    if (s.reflectionQuestion) bodySections += '<h2>Pytanie do refleksji</h2><p>' + esc(s.reflectionQuestion) + '</p>';
    if (s.bibliography) bodySections += '<h2>Bibliografia</h2><p>' + esc(s.bibliography) + '</p>';

    $('reading').innerHTML =
      '<span class="scard__meta">' + esc(s.cat) + ' · ' + esc(s.series) + (s.publishedDate ? ' · ' + esc(s.publishedDate) : '') + '</span>' +
      '<h1>' + esc(s.title) + '</h1>' +
      '<p><strong>' + esc(s.ref || 'Nauczanie biblijne') + '</strong>' + (s.authorName ? ' · Autor: ' + esc(s.authorName) : ' · Konspekt homiletyczny (UBG-2025)') + '</p>' +
      (s.pdf ? '<iframe title="Konspekt PDF" src="' + esc(s.pdf) + '"></iframe>' : '') +
      driveEmbed +
      versesHtml +
      bodySections +
      '<p class="p" style="margin-top:24px"><small>Christian Culture · Kazania z Pasją · Tekst biblijny: Uwspółcześniona Biblia Gdańska (UBG-2025).</small></p>';

    var dlg = $('reader');
    if (dlg && typeof dlg.showModal === 'function') {
      dlg.showModal();
    }
    ga('sermon_read', { sermon_id: s.id, sermon_title: s.title });
  }

  function stopPlayback(hideBar) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    var audio = $('audio');
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.hidden = true;
    }
    var driveWrap = $('driveAudioWrap');
    if (driveWrap) {
      driveWrap.innerHTML = '';
      driveWrap.hidden = true;
    }
    if ($('status')) $('status').textContent = 'Zatrzymano';
    if (hideBar && $('kzpPlayer')) {
      $('kzpPlayer').hidden = true;
      document.body.classList.remove('has-player');
    }
  }

  function listenSermon(id) {
    stopPlayback(false);
    var s = getSermon(id);
    if (!s) return;
    currentSermon = s;
    var bar = $('kzpPlayer');
    if (bar) {
      bar.hidden = false;
      document.body.classList.add('has-player');
    }
    if ($('now')) $('now').textContent = '🎧 ' + s.title;
    var audio = $('audio');
    var driveWrap = $('driveAudioWrap');
    var rate = Number(($('rate') && $('rate').value) || 1);

    if (s.isCommunity && s.format === 'mp3' && s.drivePreviewUrl && driveWrap) {
      driveWrap.hidden = false;
      driveWrap.innerHTML =
        '<iframe class="drive-audio-frame" src="' + esc(s.drivePreviewUrl) + '" title="Odtwarzacz MP3 z Dysku Google" allow="autoplay" sandbox="allow-scripts allow-same-origin allow-popups" referrerpolicy="no-referrer"></iframe>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          (s.driveDownloadUrl ? '<a class="act-btn" href="' + esc(s.driveDownloadUrl) + '" target="_blank" rel="noopener noreferrer">Pobierz MP3</a>' : '') +
          (s.driveUrl ? '<a class="act-btn" href="' + esc(s.driveUrl) + '" target="_blank" rel="noopener noreferrer">Otwórz na Dysku Google</a>' : '') +
        '</div>';
      if ($('status')) $('status').textContent = 'Audio z Dysku Google';
    } else if (s.mp3 && audio) {
      audio.hidden = false;
      audio.src = s.mp3;
      audio.playbackRate = rate;
      audio.play().catch(function () {
        if ($('status')) $('status').textContent = 'Kliknij odtwarzanie w pasku';
      });
      if ($('status')) $('status').textContent = 'Nagranie MP3';
    } else if ('speechSynthesis' in window) {
      var verseTexts = (s.keyVerses || []).map(function (v) { return v.text; }).join(' ');
      var utteranceText = [s.title, s.ref, verseTexts, s.desc].concat(s.points || []).concat([s.outlineText || '', s.apply || '']).filter(Boolean).join('. ');
      var u = new SpeechSynthesisUtterance(utteranceText);
      u.lang = 'pl-PL';
      u.rate = rate;
      u.onend = function () { if ($('status')) $('status').textContent = 'Zakończono'; };
      u.onerror = function () { if ($('status')) $('status').textContent = 'Synteza mowy zatrzymana lub niedostępna'; };
      window.speechSynthesis.speak(u);
      if ($('status')) $('status').textContent = 'Synteza mowy urządzenia';
    } else {
      if ($('status')) $('status').textContent = 'Przeglądarka nie obsługuje syntezy mowy';
    }
    ga('sermon_listen', { sermon_id: s.id, mode: (s.drivePreviewUrl || s.mp3) ? 'audio' : 'tts' });
  }

  function shareUrl(url, title, text) {
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        showToast('Skopiowano link do schowka');
      }).catch(function () {
        showToast('Link: ' + url);
      });
    } else {
      showToast('Link: ' + url);
    }
    ga('share', { content_type: 'kazania', item_id: title });
  }

  // ---------- Autoryzacja LUMINA & API Społeczności ----------
  async function getFreshIdToken() {
    if (authUser && typeof authUser.getIdToken === 'function') {
      try { return await authUser.getIdToken(); } catch (e) {}
    }
    if (luminaAuthRef && luminaAuthRef.currentUser && typeof luminaAuthRef.currentUser.getIdToken === 'function') {
      try { return await luminaAuthRef.currentUser.getIdToken(); } catch (e) {}
    }
    return '';
  }

  function syncSubmitAuthUi() {
    var gate = $('submitAuthGate');
    var form = $('submitForm');
    var badge = $('submitUserBadge');
    var authorInput = $('fAuthor');
    var loggedIn = Boolean(authUser && !authUser.isAnonymous);
    if (gate) gate.hidden = loggedIn;
    if (form) form.hidden = !loggedIn;
    if (loggedIn && badge) {
      badge.textContent = 'Zalogowano jako: ' + (authUser.displayName || authUser.email || 'Członek LUMINA');
    }
    if (loggedIn && authorInput && !authorInput.value && authUser.displayName) {
      authorInput.value = authUser.displayName;
    }
  }

  async function loadCommunitySermons() {
    try {
      var token = await getFreshIdToken();
      var headers = token ? { Authorization: 'Bearer ' + token } : {};
      var res = await fetch('/api/kazania/community', { headers: headers, credentials: 'omit' });
      if (!res.ok) return;
      var data = await res.json();
      if (data && data.ok) {
        viewerIsAdmin = Boolean(data.isAdmin);
        communitySermons = Array.isArray(data.items) ? data.items : [];
        updateStatsAndTicker();
        renderCards();
        renderSeries();
      }
    } catch (e) {}
  }

  async function initAuthBridge() {
    try {
      var mod = await import('/lumina-db.js?v=20261013_notifsafe1');
      if (mod && typeof mod.ensureDbReady === 'function') {
        var ready = await mod.ensureDbReady();
        luminaAuthRef = ready && ready.auth ? ready.auth : null;
        if (luminaAuthRef) {
          authUser = luminaAuthRef.currentUser && !luminaAuthRef.currentUser.isAnonymous ? luminaAuthRef.currentUser : null;
          syncSubmitAuthUi();
          loadCommunitySermons();
          if (typeof luminaAuthRef.onAuthStateChanged === 'function') {
            luminaAuthRef.onAuthStateChanged(function (user) {
              authUser = user && !user.isAnonymous ? user : null;
              syncSubmitAuthUi();
              loadCommunitySermons();
            });
          }
        }
      }
    } catch (e) {}
  }

  window.addEventListener('lumina-auth-state', function () {
    if (luminaAuthRef && luminaAuthRef.currentUser) {
      authUser = luminaAuthRef.currentUser.isAnonymous ? null : luminaAuthRef.currentUser;
    }
    syncSubmitAuthUi();
    loadCommunitySermons();
  });

  // ---------- Formularz dodawania kazania z Dysku Google ----------
  function openSubmitModal() {
    syncSubmitAuthUi();
    var fb = $('submitFeedback');
    if (fb) fb.hidden = true;
    var dlg = $('submitModal');
    if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
  }

  if ($('openSubmitBtn')) $('openSubmitBtn').addEventListener('click', openSubmitModal);
  if ($('heroSubmitBtn')) $('heroSubmitBtn').addEventListener('click', openSubmitModal);
  if ($('closeSubmit')) $('closeSubmit').addEventListener('click', function () { $('submitModal').close(); });
  if ($('submitModal')) {
    $('submitModal').addEventListener('click', function (e) {
      if (e.target === $('submitModal')) $('submitModal').close();
    });
  }
  if ($('submitLoginBtn')) {
    $('submitLoginBtn').addEventListener('click', function () {
      if (typeof window.loginWithGoogle === 'function') {
        window.loginWithGoogle();
      } else {
        showToast('Użyj przycisku „Zaloguj z Google” na górnym pasku.');
      }
    });
  }

  document.addEventListener('click', function (e) {
    var fmtBtn = e.target.closest('.fmt-pill[data-fmt]');
    if (!fmtBtn) return;
    var fmt = fmtBtn.getAttribute('data-fmt');
    document.querySelectorAll('.fmt-pill').forEach(function (b) {
      b.classList.toggle('is-selected', b === fmtBtn);
    });
    if ($('fFormat')) $('fFormat').value = fmt;
  });

  if ($('fDriveUrl')) {
    $('fDriveUrl').addEventListener('input', function () {
      var hint = $('driveUrlHint');
      if (!hint) return;
      var parsed = parseDriveUrlClient($('fDriveUrl').value);
      hint.classList.remove('is-ok', 'is-err');
      if (parsed.empty) {
        hint.textContent = 'Włącz na Dysku Google: Udostępnij → Ogólny dostęp: Każda osoba mająca link (Przeglądający).';
      } else if (parsed.valid) {
        hint.classList.add('is-ok');
        hint.textContent = 'Poprawny link (' + (parsed.provider === 'gdocs' ? 'Google Docs' : 'Dysk Google') + ', ID: ' + parsed.fileId.slice(0, 12) + '…).';
      } else {
        hint.classList.add('is-err');
        hint.textContent = parsed.error;
      }
    });
  }

  if ($('submitForm')) {
    $('submitForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var fb = $('submitFeedback');
      var sendBtn = $('submitSendBtn');
      var showErr = function (msg) {
        if (!fb) return;
        fb.hidden = false;
        fb.className = 'submit-feedback is-error';
        fb.textContent = msg;
      };
      var token = await getFreshIdToken();
      if (!token) {
        showErr('Brak aktywnej sesji Google LUMINA. Zaloguj się ponownie.');
        return;
      }
      var format = ($('fFormat') && $('fFormat').value) || 'mp3';
      var driveUrl = ($('fDriveUrl') && $('fDriveUrl').value.trim()) || '';
      var outlineText = ($('fOutline') && $('fOutline').value.trim()) || '';
      if (format !== 'outline' && !driveUrl) {
        showErr('Dla formatu MP3, PDF lub Google Docs wklej publiczny link z Dysku Google.');
        return;
      }
      if (driveUrl) {
        var check = parseDriveUrlClient(driveUrl);
        if (!check.valid) {
          showErr(check.error);
          return;
        }
      }
      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Wysyłanie…'; }
      try {
        var res = await fetch('/api/kazania/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({
            title: $('fTitle').value,
            ref: $('fRef').value,
            cat: $('fCat').value,
            series: $('fSeries').value,
            desc: $('fDesc').value,
            format: format,
            driveUrl: driveUrl,
            outlineText: outlineText,
            apply: $('fApply').value,
            authorName: $('fAuthor').value
          })
        });
        var data = await res.json();
        if (!res.ok || !data.ok) {
          showErr(data.error || 'Nie udało się zapisać kazania.');
          return;
        }
        if (fb) {
          fb.hidden = false;
          fb.className = 'submit-feedback';
          fb.textContent = data.status === 'published'
            ? 'Kazanie opublikowane w bibliotece!'
            : 'Kazanie zapisane! Oczekuje na akceptację administratora (widzisz je na swojej liście).';
        }
        $('fTitle').value = '';
        $('fRef').value = '';
        $('fDriveUrl').value = '';
        $('fDesc').value = '';
        $('fOutline').value = '';
        $('fApply').value = '';
        await loadCommunitySermons();
        ga('sermon_submit', { format: format, status: data.status });
      } catch (err) {
        showErr('Błąd sieci podczas wysyłania.');
      } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Wyślij i udostępnij'; }
      }
    });
  }

  // Obsługa kliknięć kart, tabów, moderacji i usuwania
  document.addEventListener('click', async function (e) {
    var tab = e.target.closest('.tab-pill[data-source]');
    if (tab) {
      sourceFilter = tab.getAttribute('data-source') || 'all';
      document.querySelectorAll('.tab-pill').forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderCards();
      return;
    }

    var modBtn = e.target.closest('[data-mod]');
    if (modBtn) {
      var tok = await getFreshIdToken();
      if (!tok) return;
      var modRes = await fetch('/api/kazania/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
        body: JSON.stringify({ id: modBtn.getAttribute('data-id'), action: modBtn.getAttribute('data-mod') })
      });
      if (modRes.ok) {
        showToast('Zaktualizowano status publikacji');
        loadCommunitySermons();
      }
      return;
    }

    var delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      var delId = delBtn.getAttribute('data-del');
      var delTok = await getFreshIdToken();
      if (!delTok) return;
      var delRes = await fetch('/api/kazania/item/' + encodeURIComponent(delId), {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + delTok }
      });
      if (delRes.ok) {
        showToast('Usunięto kazanie');
        loadCommunitySermons();
      }
      return;
    }

    var btn = e.target.closest('[data-act]');
    if (btn) {
      var act = btn.getAttribute('data-act');
      var id = btn.getAttribute('data-id');
      if (act === 'read') openReader(id);
      else if (act === 'listen') listenSermon(id);
      else if (act === 'pdf') {
        var s = getSermon(id);
        if (s && s.driveDownloadUrl) {
          window.open(s.driveDownloadUrl, '_blank', 'noopener,noreferrer');
        } else if (s && s.pdf) {
          var a = document.createElement('a');
          a.href = s.pdf;
          a.download = '';
          a.click();
        } else {
          openReader(id);
          showToast('Możesz zapisać konspekt jako PDF przez „Drukuj / zapisz PDF”.');
        }
      } else if (act === 'share') {
        var serm = getSermon(id);
        var url = 'https://polskieradio.cc/kazania/#k-' + encodeURIComponent(id);
        shareUrl(url, serm ? serm.title : 'Kazania z Pasją', serm ? serm.ref : '');
      } else if (act === 'save') {
        if (saved.has(id)) saved.delete(id);
        else saved.add(id);
        try { localStorage.setItem('kzpSaved', JSON.stringify(Array.from(saved))); } catch (err) {}
        renderCards();
        showToast(saved.has(id) ? 'Zapisano w bibliotece na tym urządzeniu' : 'Usunięto z zapisanych');
      }
      return;
    }

    var seriesBtn = e.target.closest('[data-series]');
    if (seriesBtn) {
      var sName = seriesBtn.getAttribute('data-series') || '';
      if ($('search')) $('search').value = sName;
      if ($('category')) $('category').value = '';
      onlySaved = false;
      if ($('saved')) {
        $('saved').classList.remove('is-active');
        $('saved').textContent = '☆ Zapisane';
      }
      renderCards();
      var libEl = $('biblioteka');
      if (libEl) libEl.scrollIntoView({ behavior: 'smooth' });
    }
  });

  if ($('search')) $('search').addEventListener('input', renderCards);
  if ($('category')) $('category').addEventListener('change', renderCards);
  if ($('saved')) {
    $('saved').addEventListener('click', function () {
      onlySaved = !onlySaved;
      $('saved').classList.toggle('is-active', onlySaved);
      $('saved').textContent = onlySaved ? '★ Pokaż wszystkie' : '☆ Zapisane';
      renderCards();
    });
  }

  if ($('closeReader')) $('closeReader').addEventListener('click', function () { $('reader').close(); });
  if ($('printReader')) $('printReader').addEventListener('click', function () { window.print(); });
  if ($('readerListenBtn')) {
    $('readerListenBtn').addEventListener('click', function () {
      if (currentSermon) listenSermon(currentSermon.id);
    });
  }
  if ($('reader')) {
    $('reader').addEventListener('click', function (e) {
      if (e.target === $('reader')) $('reader').close();
    });
  }

  if ($('stop')) $('stop').addEventListener('click', function () { stopPlayback(true); });
  if ($('pause')) {
    $('pause').addEventListener('click', function () {
      var audio = $('audio');
      if (currentSermon && currentSermon.mp3 && audio) {
        if (audio.paused) audio.play();
        else audio.pause();
      } else if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        else window.speechSynthesis.pause();
      }
    });
  }
  if ($('rate')) {
    $('rate').addEventListener('change', function () {
      var audio = $('audio');
      if (audio) audio.playbackRate = Number($('rate').value);
      if (currentSermon && !currentSermon.mp3 && !currentSermon.drivePreviewUrl) listenSermon(currentSermon.id);
    });
  }

  if ($('sharePortalBtn')) {
    $('sharePortalBtn').addEventListener('click', function () {
      shareUrl('https://polskieradio.cc/kazania/', 'Kazania z Pasją — Christian Culture', 'Profesjonalne konspekty kazań biblijnych (UBG-2025)');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement && document.activeElement.tagName) !== -1) return;
    if ((e.key === ' ' || e.key.toLowerCase() === 'k') && currentSermon && $('kzpPlayer') && !$('kzpPlayer').hidden) {
      e.preventDefault();
      if ($('pause')) $('pause').click();
    }
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cc-wspieramto]');
    if (!t) return;
    if (typeof window.openWspieramToModal === 'function') {
      e.preventDefault();
      window.openWspieramToModal();
    }
  });

  function initCatalog(data) {
    editorialSermons = (data && data.sermons) || [];
    categories = (data && data.categories) || [];
    ['category', 'fCat'].forEach(function (selId) {
      var sel = $(selId);
      if (!sel) return;
      var minLen = selId === 'category' ? 1 : 0;
      if (sel.options.length <= minLen) {
        categories.forEach(function (c) { sel.add(new Option(c, c)); });
      }
    });
    updateStatsAndTicker();
    renderCards();
    renderSeries();

    if (location.hash && location.hash.indexOf('#k-') === 0) {
      var hashId = location.hash.slice(3);
      var el = document.getElementById('k-' + hashId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  fetch('/kazania/data/kazania.json', { credentials: 'omit' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(initCatalog)
    .catch(function () {
      if ($('count')) $('count').textContent = 'Nie udało się pobrać katalogu kazań. Odśwież stronę lub sprawdź połączenie.';
    });

  initAuthBridge();
  loadCommunitySermons();
})();
