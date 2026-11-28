/*
 * Kazania z Pasją — logika portalu FULL PREMIUM EkoCC
 * Źródła prawdziwe: /kazania/data/kazania.json oraz /data/werset_dnia_365_ubg.json
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
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  // Zabezpieczenie widoczności hero po 3 s
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

  // ---------- Polecamy (rotacja ekosystemu z GA4) ----------
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

  // ---------- Stan biblioteki, odtwarzacz i czytnik ----------
  var sermons = [];
  var categories = [];
  var saved = new Set();
  var onlySaved = false;
  var currentSermon = null;

  try {
    saved = new Set(JSON.parse(localStorage.getItem('kzpSaved') || '[]'));
  } catch (e) {}

  function getSermon(id) {
    return sermons.find(function (s) { return s.id === id; });
  }

  function renderCards() {
    var searchVal = norm(($('search') && $('search').value) || '');
    var catVal = ($('category') && $('category').value) || '';
    var filtered = sermons.filter(function (s) {
      if (catVal && s.cat !== catVal) return false;
      if (onlySaved && !saved.has(s.id)) return false;
      var hay = norm([s.title, s.ref, s.cat, s.series, s.desc, s.apply].concat(s.points || []).join(' '));
      return hay.indexOf(searchVal) !== -1;
    });

    if ($('count')) {
      $('count').textContent = filtered.length + ' materiał(y) · UBG-2025 · przykładowa biblioteka startowa';
    }

    var cardsEl = $('cards');
    if (!cardsEl) return;
    if (!filtered.length) {
      cardsEl.innerHTML = '<p class="p">Brak wyników dla wybranych kryteriów. Spróbuj wyczyścić filtry.</p>';
      return;
    }

    cardsEl.innerHTML = filtered.map(function (s) {
      var isSaved = saved.has(s.id);
      return '<article class="scard" id="k-' + esc(s.id) + '" data-tilt>' +
        '<div class="scard__cover" aria-hidden="true">' +
          '<span class="scard__glyph">✦</span>' +
          '<span class="scard__badge">' + (s.isDemo ? 'KONSPEKT STARTOWY' : 'PEŁNE OPRACOWANIE') + '</span>' +
        '</div>' +
        '<span class="scard__meta">' + esc(s.cat) + ' · ' + esc(s.series) + '</span>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<div class="scard__ref">' + esc(s.ref) + '</div>' +
        '<p class="scard__desc">' + esc(s.desc) + '</p>' +
        '<div class="scard__actions">' +
          '<button type="button" class="act-btn act-btn--cc" data-act="listen" data-id="' + esc(s.id) + '">▶ Posłuchaj</button>' +
          '<button type="button" class="act-btn" data-act="read" data-id="' + esc(s.id) + '">Czytaj</button>' +
          '<button type="button" class="act-btn" data-act="pdf" data-id="' + esc(s.id) + '">PDF</button>' +
          '<button type="button" class="act-btn" data-act="share" data-id="' + esc(s.id) + '">Udostępnij</button>' +
          '<button type="button" class="act-btn" data-cc-wspieramto="true" aria-label="Wesprzyj wspieramTO">♡ WspieramTO</button>' +
          '<button type="button" class="act-btn act-btn--save' + (isSaved ? ' is-saved' : '') + '" data-act="save" data-id="' + esc(s.id) + '" aria-label="' + (isSaved ? 'Usuń z zapisanych' : 'Zapisz kazanie') + '" aria-pressed="' + (isSaved ? 'true' : 'false') + '">' + (isSaved ? '★' : '☆') + '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    cardsEl.querySelectorAll('[data-tilt]').forEach(bindTilt);
  }

  function renderSeries() {
    var seriesEl = $('series');
    if (!seriesEl) return;
    var names = [];
    sermons.forEach(function (s) {
      if (s.series && names.indexOf(s.series) === -1) names.push(s.series);
    });
    seriesEl.innerHTML = names.map(function (name) {
      var cnt = sermons.filter(function (s) { return s.series === name; }).length;
      return '<article class="series-card" data-tilt>' +
        '<div>' +
          '<span class="scard__meta">Seria biblijna</span>' +
          '<h3>' + esc(name) + '</h3>' +
          '<p>' + cnt + ' konspekt(y) w bibliotece startowej</p>' +
        '</div>' +
        '<button type="button" class="btn btn--ghost" data-series="' + esc(name) + '">Odkryj serię →</button>' +
      '</article>';
    }).join('');
    seriesEl.querySelectorAll('[data-tilt]').forEach(bindTilt);
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

    $('reading').innerHTML =
      '<span class="scard__meta">' + esc(s.cat) + ' · ' + esc(s.series) + '</span>' +
      '<h1>' + esc(s.title) + '</h1>' +
      '<p><strong>' + esc(s.ref) + '</strong> · Konspekt homiletyczny (UBG-2025)</p>' +
      (s.pdf ? '<iframe title="Konspekt PDF" src="' + esc(s.pdf) + '"></iframe>' : '') +
      versesHtml +
      (s.objective ? '<h2>Cel kazania</h2><p>' + esc(s.objective) + '</p>' : '') +
      (s.context ? '<h2>Kontekst fragmentu</h2><p>' + esc(s.context) + '</p>' : '') +
      '<h2>Główna myśl</h2><p>' + esc(s.desc) + '</p>' +
      '<h2>Punkty kazania</h2><ol>' + (s.points || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>' +
      (s.christocentric ? '<h2>Przesłanie chrystocentryczne</h2><p>' + esc(s.christocentric) + '</p>' : '') +
      '<h2>Zastosowanie praktyczne</h2><p>' + esc(s.apply) + '</p>' +
      '<h2>Pytanie do refleksji</h2><p>' + esc(s.reflectionQuestion || 'Jak ten fragment prowadzi mnie do głębszego zaufania Chrystusowi?') + '</p>' +
      '<p class="p"><small>Źródło biblijne: Uwspółcześniona Biblia Gdańska (UBG-2025), ' + esc(s.ref) + '. Materiał startowy do dalszego rozwinięcia w głoszeniu.</small></p>';

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
    var rate = Number(($('rate') && $('rate').value) || 1);
    if (s.mp3 && audio) {
      audio.hidden = false;
      audio.src = s.mp3;
      audio.playbackRate = rate;
      audio.play().catch(function () {
        if ($('status')) $('status').textContent = 'Kliknij odtwarzanie w pasku';
      });
      if ($('status')) $('status').textContent = 'Nagranie MP3';
    } else if ('speechSynthesis' in window) {
      var verseTexts = (s.keyVerses || []).map(function (v) { return v.text; }).join(' ');
      var utteranceText = [s.title, s.ref, verseTexts, s.desc].concat(s.points || []).concat([s.apply]).join('. ');
      var u = new SpeechSynthesisUtterance(utteranceText);
      u.lang = 'pl-PL';
      u.rate = rate;
      u.onend = function () { if ($('status')) $('status').textContent = 'Zakończono'; };
      u.onerror = function () { if ($('status')) $('status').textContent = 'Synteza mowy zatrzymana lub niedostępna'; };
      window.speechSynthesis.speak(u);
      if ($('status')) $('status').textContent = 'Synteza mowy urządzenia (demo)';
    } else {
      if ($('status')) $('status').textContent = 'Przeglądarka nie obsługuje syntezy mowy';
    }
    ga('sermon_listen', { sermon_id: s.id, mode: s.mp3 ? 'mp3' : 'tts' });
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

  // Obsługa zdarzeń kart i serii
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (btn) {
      var act = btn.getAttribute('data-act');
      var id = btn.getAttribute('data-id');
      if (act === 'read') openReader(id);
      else if (act === 'listen') listenSermon(id);
      else if (act === 'pdf') {
        var s = getSermon(id);
        if (s && s.pdf) {
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
      if (currentSermon && !currentSermon.mp3) listenSermon(currentSermon.id);
    });
  }

  if ($('sharePortalBtn')) {
    $('sharePortalBtn').addEventListener('click', function () {
      shareUrl('https://polskieradio.cc/kazania/', 'Kazania z Pasją — Christian Culture', 'Profesjonalne konspekty kazań biblijnych (UBG-2025)');
    });
  }

  // Skróty klawiszowe odtwarzacza
  document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement && document.activeElement.tagName) !== -1) return;
    if ((e.key === ' ' || e.key.toLowerCase() === 'k') && currentSermon && $('kzpPlayer') && !$('kzpPlayer').hidden) {
      e.preventDefault();
      if ($('pause')) $('pause').click();
    }
  });

  // Fallback kliknięcia w WspieramTO zanim cc-wspieramto-modal.js skończy defer
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cc-wspieramto]');
    if (!t) return;
    if (typeof window.openWspieramToModal === 'function') {
      e.preventDefault();
      window.openWspieramToModal();
    }
  });

  // ---------- Załadowanie katalogu /kazania/data/kazania.json ----------
  function initCatalog(data) {
    sermons = (data && data.sermons) || [];
    categories = (data && data.categories) || [];
    var catSelect = $('category');
    if (catSelect && catSelect.options.length <= 1) {
      categories.forEach(function (c) {
        catSelect.add(new Option(c, c));
      });
    }
    var seriesSet = new Set(sermons.map(function (s) { return s.series; }).filter(Boolean));
    if ($('statSermons')) $('statSermons').setAttribute('data-reel', String(sermons.length));
    if ($('statCats')) $('statCats').setAttribute('data-reel', String(categories.length));
    if ($('statSeries')) $('statSeries').setAttribute('data-reel', String(seriesSet.size));
    document.querySelectorAll('[data-reel]').forEach(animateReel);

    setTickerLive('count', sermons.length + ' konspekty startowe · ' + categories.length + ' kategorii tematycznych');
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
})();
