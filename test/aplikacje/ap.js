/*
 * Christian Culture — Centrum Aplikacji Android & Web/PWA (FULL PREMIUM)
 * Zywotny canvas, interaktywny smartfon w Hero zasilany realnym JSON (/rozwazania_baza.json),
 * liczniki bębnowe, 3D tilt + światło za kursorem, filtrowanie i wyszukiwarka katalogu,
 * 3-zakładkowy przewodnik instalacji, „Polecamy” Master, bezpieczna animacja Hero.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');

  var E = window.ApEco;
  var lang = document.body.getAttribute('data-lang') || 'pl';
  var isEn = lang === 'en';
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced;

  // ---------- Hero: zabezpieczenie pełnej widoczności ----------
  var heroEl = document.querySelector('.hero');
  if (heroEl) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroEl.classList.add('is-ready'); });
    });
    setTimeout(function () { heroEl.classList.add('is-ready'); }, 3000);
  }

  // ---------- Pasek podglądu testowego ----------
  var testBar = $('testBar');
  var testClose = $('testDismiss');
  try {
    if (testBar && sessionStorage.getItem('cc_apps_testbar_hidden') === '1') {
      testBar.hidden = true;
    }
  } catch (e) {}
  if (testBar && testClose) {
    testClose.addEventListener('click', function () {
      testBar.hidden = true;
      try { sessionStorage.setItem('cc_apps_testbar_hidden', '1'); } catch (e) {}
    });
  }

  // ---------- Nawigacja + Szuflada mobilna ----------
  var nav = $('nav');
  var burger = $('menuToggle');
  if (nav) {
    addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', scrollY > 24); }, { passive: true });
  }
  if (nav && burger) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
  }

  // ---------- Ekosystem: Ticker + ★ Polecamy ----------
  if (E) {
    E.mountTicker($('tickRun'), lang, 'aplikacje_hub');
    E.mountPromo($('promoStage'), $('promoDots'), $('promoBar'), lang, 'aplikacje_hub', 9000);
    document.querySelectorAll('[data-promo]').forEach(function (a) {
      if (a.closest('#tickRun') || a.closest('#promoStage')) return;
      a.addEventListener('click', function () { E.ga('promo_click', a.getAttribute('data-promo'), 'aplikacje_hub'); });
    });
  }

  // ---------- Toast i Udostępnianie / Kopiowanie ----------
  var toast = $('toast');
  var toastTimer = null;
  function say(msg) {
    if (!toast || !msg) return;
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 2400);
  }

  var shareBtn = $('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href.split('#')[0] };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(data.url).then(function () {
          say(shareBtn.getAttribute('data-done') || 'OK');
        }).catch(function () {});
      }
      if (E) E.ga('share', 'aplikacje_hub', 'aplikacje_hub');
    });
  }

  var copyHubBtn = $('copyHubBtn');
  if (copyHubBtn) {
    copyHubBtn.addEventListener('click', function () {
      var url = copyHubBtn.getAttribute('data-copy') || 'https://cclite.pl/';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          say(copyHubBtn.getAttribute('data-done') || url);
        }).catch(function () { say(url); });
      } else {
        say(url);
      }
      if (E) E.ga('copy_pwa_link', url, 'aplikacje_hub');
    });
  }

  // ---------- Natywna podpowiedź PWA (jeśli przeglądarka ją wspiera) ----------
  var deferredInstall = null;
  var pwaInstallBtn = $('pwaInstallBtn');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    if (pwaInstallBtn) pwaInstallBtn.hidden = false;
  });
  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', function () {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function () {
        deferredInstall = null;
        pwaInstallBtn.hidden = true;
      }).catch(function () {});
    });
  }

  // ---------- Liczniki bębnowe i Reveal ----------
  function reel(el) {
    var target = el.getAttribute('data-reel');
    if (!target || el.dataset.done === target) return;
    el.dataset.done = target;
    el.innerHTML = String(target).split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var col = '';
      for (var k = 0; k <= 9; k++) col += '<span>' + k + '</span>';
      return '<span data-d="' + ch + '">' + col + '</span>';
    }).join('');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelectorAll('[data-d]').forEach(function (c, i) {
          c.style.transitionDelay = (i * 110) + 'ms';
          c.style.transform = 'translateY(-' + (Number(c.getAttribute('data-d')) * 10) + '%)';
        });
      });
    });
    el.setAttribute('aria-label', target);
  }

  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  function revealPassed() {
    var limit = (window.innerHeight || 800) * 1.08;
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.classList.contains('is-in')) continue;
      if (el.getBoundingClientRect().top <= limit) {
        el.classList.add('is-in');
        el.querySelectorAll('[data-reel]').forEach(reel);
      }
    }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          entry.target.querySelectorAll('[data-reel]').forEach(reel);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
    var scrollRaf = 0;
    addEventListener('scroll', function () {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () { scrollRaf = 0; revealPassed(); });
    }, { passive: true });
    addEventListener('hashchange', function () { setTimeout(revealPassed, 120); });
    setTimeout(revealPassed, 300);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-reel]').forEach(reel);
  }

  // ---------- 3D tilt + światło za kursorem (wyłącznie na fine pointer + bez reduced motion) ----------
  function bindTilt(el) {
    if (!fine || el.dataset.tiltOn) return;
    el.dataset.tiltOn = '1';
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      el.style.transform = 'rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 9).toFixed(2) + 'deg) translateZ(0)';
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }
  document.querySelectorAll('[data-tilt]').forEach(bindTilt);

  // ---------- Interaktywny Smartfon w Hero + Prawdziwe Dane z /rozwazania_baza.json ----------
  var screensRaw = $('deviceScreensData');
  var SCREENS = [];
  try { SCREENS = screensRaw ? JSON.parse(screensRaw.textContent || '[]') : []; } catch (e) {}
  var screenIndex = 0;
  var userInteractedStage = false;
  var stageTabs = document.querySelectorAll('.stage-tab[data-screen]');

  function applyScreen(idx) {
    if (!SCREENS.length) return;
    screenIndex = ((idx % SCREENS.length) + SCREENS.length) % SCREENS.length;
    var s = SCREENS[screenIndex];
    if ($('stageBadge')) $('stageBadge').textContent = s.badge;
    if ($('stageVer')) $('stageVer').textContent = s.metaRight;
    if ($('stageImg')) {
      $('stageImg').src = s.img;
      $('stageImg').alt = s.title;
    }
    if ($('stageTag')) $('stageTag').textContent = s.tag;
    if ($('stageTitle')) $('stageTitle').textContent = s.title;
    if ($('stageDesc')) $('stageDesc').textContent = s.desc;
    if ($('stageLiveLabel')) $('stageLiveLabel').textContent = s.liveLabel;
    if ($('stageLiveVal')) $('stageLiveVal').textContent = s.liveVal;
    if ($('stagePrimary')) {
      $('stagePrimary').href = s.href;
      $('stagePrimary').textContent = s.cta;
      if (s.ext) {
        $('stagePrimary').setAttribute('target', '_blank');
        $('stagePrimary').setAttribute('rel', 'noopener');
      } else {
        $('stagePrimary').removeAttribute('target');
        $('stagePrimary').removeAttribute('rel');
      }
    }
    stageTabs.forEach(function (btn, j) {
      btn.setAttribute('aria-selected', j === screenIndex ? 'true' : 'false');
    });
  }

  stageTabs.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      userInteractedStage = true;
      applyScreen(idx);
      if (E) E.ga('hero_device_tab', btn.getAttribute('data-screen'), 'aplikacje_hub');
    });
  });

  if (SCREENS.length > 1) {
    setInterval(function () {
      if (!userInteractedStage && !document.hidden) applyScreen(screenIndex + 1);
    }, 6500);
  }

  // Żywe dane z /rozwazania_baza.json (prawdziwy dzisiejszy dzień i liczba rozważań)
  if (typeof fetch === 'function') {
    fetch('/rozwazania_baza.json', { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (arr) {
        if (!Array.isArray(arr) || !arr.length) return;
        var today = arr[0];
        var statEl = $('statReflections');
        if (statEl) {
          statEl.setAttribute('data-reel', String(arr.length));
          if (statEl.closest('.is-in')) reel(statEl);
          else statEl.textContent = String(arr.length);
        }
        var dayLabel = today.day ? (isEn ? 'Day ' + today.day : 'Dzień ' + today.day) : '';
        var readingLabel = today.reading || '';
        var pillEl = $('dzjLivePill');
        if (pillEl && dayLabel) {
          pillEl.textContent = readingLabel ? dayLabel + ' · ' + readingLabel : dayLabel;
        }
        var dzjIdx = SCREENS.findIndex(function (x) { return x.id === 'dzj'; });
        if (dzjIdx >= 0) {
          var cleanTitle = String(today.title || '').replace(/^[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF\s✦☀]+/, '').trim();
          SCREENS[dzjIdx].liveLabel = dayLabel || SCREENS[dzjIdx].liveLabel;
          if (cleanTitle) SCREENS[dzjIdx].liveVal = cleanTitle;
          if (readingLabel) SCREENS[dzjIdx].tag = readingLabel;
          if (today.imageUrl && /^\//.test(today.imageUrl)) SCREENS[dzjIdx].img = today.imageUrl;
          if (screenIndex === dzjIdx) applyScreen(dzjIdx);
        }
        if ($('heroDayChip') && dayLabel) {
          $('heroDayChip').textContent = readingLabel ? dayLabel + ' · ' + readingLabel : dayLabel;
        }
      })
      .catch(function () {});
  }

  // ---------- Katalog: Filtrowanie + Wyszukiwarka bez ogonków ----------
  var grid = $('appGrid');
  var filterBtns = document.querySelectorAll('.fpill[data-cat]');
  var searchInput = $('appSearch');
  var countEl = $('catalogCount');
  var emptyBox = $('emptyBox');
  var resetBtn = $('catalogReset');
  var cards = grid ? [].slice.call(grid.querySelectorAll('.acard')) : [];
  var activeCat = 'all';

  function norm(s) {
    try {
      return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    } catch (e) {
      return String(s || '').toLowerCase();
    }
  }

  function applyFilter() {
    if (!grid) return;
    var q = norm(searchInput ? searchInput.value.trim() : '');
    var visible = 0;
    var isFiltered = activeCat !== 'all' || q.length > 0;
    grid.classList.toggle('is-filtered', isFiltered);

    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
      var matchCat = activeCat === 'all' || cats.indexOf(activeCat) !== -1;
      var hay = norm(card.getAttribute('data-keys') || card.textContent);
      var matchQ = !q || hay.indexOf(q) !== -1;
      var show = matchCat && matchQ;
      card.hidden = !show;
      if (show) visible++;
    });

    if (countEl) {
      var tpl = countEl.getAttribute('data-tpl') || '{n} / {total}';
      countEl.textContent = tpl.replace('{n}', visible).replace('{total}', cards.length);
    }
    if (emptyBox) emptyBox.hidden = visible > 0;
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCat = btn.getAttribute('data-cat') || 'all';
      filterBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      applyFilter();
      if (E) E.ga('catalog_filter', activeCat, 'aplikacje_hub');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      activeCat = 'all';
      if (searchInput) searchInput.value = '';
      filterBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-cat') === 'all' ? 'true' : 'false');
      });
      applyFilter();
      if (searchInput) searchInput.focus();
    });
  }

  // ---------- 3-zakładkowy Przewodnik Instalacji ----------
  var itabs = document.querySelectorAll('.itab[data-tab]');
  var ipanels = document.querySelectorAll('.ipanel[data-panel]');
  itabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      itabs.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      ipanels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== target; });
      if (E) E.ga('install_tab', target, 'aplikacje_hub');
    });
  });

  // ---------- Żywe światło orbitalne na canvasie (max 30fps, pauza poza ekranem) ----------
  (function canvasOrbit() {
    var c = $('apCanvas');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), t = 0, visible = true, last = 0;
    var pts = [];
    var minStep = reduced ? 70 : 34;

    function resize() {
      var r = c.getBoundingClientRect();
      w = r.width || innerWidth;
      h = r.height || 620;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      var count = Math.round(Math.min(72, Math.max(24, w / 18)));
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.4,
          s: Math.random() * 0.28 + 0.08,
          a: Math.random() * 0.5 + 0.18
        });
      }
    }

    resize();
    addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(c);
    }

    function frame(ts) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || ts - last < minStep) return;
      last = ts;
      t += reduced ? 0.008 : 0.015;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      var cx = w < 960 ? w * 0.5 : w * 0.74;
      var cy = w < 960 ? h * 0.62 : h * 0.48;

      for (var band = 0; band < 3; band++) {
        ctx.beginPath();
        var amp = (h * 0.045) * (1 + band * 0.5);
        for (var x = 0; x <= w; x += 8) {
          var d = (x - cx) / Math.max(260, w * 0.42);
          var env = Math.exp(-d * d * 1.4);
          var y = cy + Math.sin(x * 0.014 + t * (1.1 + band * 0.3) + band * 1.6) * amp * env;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(255,122,0,0)');
        grad.addColorStop(0.52, 'rgba(196,163,90,' + (0.20 - band * 0.04) + ')');
        grad.addColorStop(0.78, 'rgba(255,122,0,' + (0.26 - band * 0.05) + ')');
        grad.addColorStop(1, 'rgba(255,122,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + (2 - band) * 0.45;
        ctx.stroke();
      }

      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.s;
        p.x += Math.sin(t + i) * 0.12;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = (i % 4 === 0 ? 'rgba(255,140,51,' : 'rgba(230,206,149,') + (p.a * (0.6 + 0.4 * Math.sin(t * 1.8 + i))) + ')';
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })();
})();
