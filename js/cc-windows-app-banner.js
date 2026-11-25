/*
 * Baner „Zainstaluj na Windows” — aplikacja Wyszukiwarka Christian Culture (@007, L0 25.11.2026).
 * - Tylko Windows na komputerze (bez telefonów i tabletów).
 * - Nigdy w samej aplikacji (aplikacja przedstawia się w dataLayer: cc_app=windows / utm_source=aplikacja-windows).
 * - ✕ chowa baner na 30 dni; po kliknięciu „Zainstaluj” nie pokazuje się przez rok.
 * - Wersja i adres instalatora z /aplikacje/wyszukiwarka-windows/latest.json (ten sam plik co autoaktualizacje).
 */
(function () {
  'use strict';
  var KEY = 'cc_win_app_banner';
  var IN_APP_KEY = 'cc_win_app';
  var PAGE = '/aplikacje/wyszukiwarka-windows/';
  var FALLBACK_EXE = PAGE + 'Wyszukiwarka-CC-Setup-2.3.0.exe';
  var DAY = 86400000;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

  function inApp() {
    try {
      // Aplikacja ma własny profil przeglądarki, więc ten znacznik nie trafia do zwykłego Edge/Chrome.
      var dl = window.dataLayer || [];
      for (var i = 0; i < dl.length; i++) {
        var a = dl[i];
        if (a && a[0] === 'set' && a[1] === 'user_properties' && a[2] && a[2].cc_app === 'windows') { store(IN_APP_KEY, '1'); return true; }
      }
      if (/[?&]utm_source=aplikacja-windows/.test(location.search)) return true;
      return store(IN_APP_KEY) === '1';
    } catch (e) { return false; }
  }

  function isWindowsDesktop() {
    var ua = navigator.userAgent || '';
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var windows = /Windows/i.test(platform) || /Windows NT/i.test(ua);
    var mobile = (navigator.userAgentData && navigator.userAgentData.mobile) || /Mobi|Android|iPhone|iPad/i.test(ua);
    return windows && !mobile && window.innerWidth >= 900;
  }

  function snoozed() {
    var until = Number(store(KEY) || 0);
    return until && Date.now() < until;
  }

  var TEXT = {
    pl: { title: 'Wyszukiwarka CC na Windows', body: 'Otwieraj ją skrótem Ctrl+Shift+Spacja, miej zakładki i tryb Google. Za darmo, 2,4 MB, aktualizuje się sama.',
      install: 'Zainstaluj na Windows', more: 'Więcej', close: 'Zamknij — przypomnij za 30 dni', region: 'Aplikacja na Windows' },
    en: { title: 'CC Search for Windows', body: 'Open it with Ctrl+Shift+Space, keep bookmarks and switch to Google mode. Free, 2.4 MB, updates itself.',
      install: 'Install on Windows', more: 'More', close: 'Close — remind me in 30 days', region: 'Windows app' },
    de: { title: 'CC-Suche für Windows', body: 'Öffnen mit Strg+Umschalt+Leertaste, Lesezeichen und Google-Modus. Kostenlos, 2,4 MB, aktualisiert sich selbst.',
      install: 'Unter Windows installieren', more: 'Mehr', close: 'Schließen — in 30 Tagen erinnern', region: 'Windows-App' }
  };

  function build(exeUrl, version) {
    var lang = (document.documentElement.lang || 'pl').slice(0, 2).toLowerCase();
    var t = TEXT[lang] || TEXT.pl;
    var css = document.createElement('style');
    css.textContent =
      '#ccWinApp{position:fixed;right:24px;bottom:24px;z-index:1000001;width:min(380px,calc(100vw - 48px));box-sizing:border-box;' +
      'display:grid;grid-template-columns:48px 1fr;gap:12px 14px;padding:16px 16px 16px 18px;border-radius:18px;' +
      'background:rgba(11,15,24,.96);border:1px solid rgba(196,163,90,.45);color:#F3E5C8;' +
      'box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 24px rgba(255,122,0,.15);font-family:"Segoe UI",system-ui,sans-serif;' +
      'transform:translateY(12px);transition:transform .35s ease}' +
      '#ccWinApp.cc-on{transform:none}' +
      '#ccWinApp.cc-off{opacity:0;transition:opacity .25s linear}' +
      '#ccWinApp img{width:48px;height:48px;border-radius:12px}' +
      '#ccWinApp h2{margin:0 34px 4px 0;font-size:15.5px;line-height:1.3;color:#C4A35A;font-weight:700}' +
      '#ccWinApp p{margin:0;font-size:13px;line-height:1.45;color:rgba(243,229,200,.82)}' +
      '#ccWinApp .cc-act{grid-column:1/-1;display:flex;gap:10px;align-items:center}' +
      '#ccWinApp a.cc-dl{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;' +
      'border-radius:22px;background:#FF7A00;color:#fff;font-weight:700;font-size:14.5px;text-decoration:none;box-shadow:0 4px 14px rgba(255,122,0,.4)}' +
      '#ccWinApp a.cc-dl:hover{background:#FF8C33}#ccWinApp a.cc-dl:active{background:#E66A00}' +
      '#ccWinApp a.cc-more{display:inline-flex;align-items:center;min-height:44px;padding:0 10px;color:#C4A35A;font-size:13.5px;text-decoration:none}' +
      '#ccWinApp a.cc-more:hover{text-decoration:underline}' +
      '#ccWinApp button.cc-x{position:absolute;top:6px;right:6px;width:44px;height:44px;border:0;border-radius:50%;background:transparent;' +
      'color:rgba(243,229,200,.7);font-size:18px;cursor:pointer}#ccWinApp button.cc-x:hover{background:rgba(255,255,255,.08);color:#fff}' +
      '#ccWinApp a:focus-visible,#ccWinApp button:focus-visible{outline:3px solid #F3E5C8;outline-offset:2px}' +
      '@media (prefers-reduced-motion:reduce){#ccWinApp{transition:none;transform:none}}';
    document.head.appendChild(css);

    var box = document.createElement('aside');
    box.id = 'ccWinApp';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', t.region);
    box.innerHTML =
      '<img src="/app-christian-culture.png" alt="" width="48" height="48">' +
      '<div><h2></h2><p></p></div>' +
      '<div class="cc-act"><a class="cc-dl" download>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>' +
      '<span></span></a><a class="cc-more"></a></div>' +
      '<button type="button" class="cc-x">✕</button>';
    box.querySelector('h2').textContent = t.title;
    box.querySelector('p').textContent = t.body;
    var dl = box.querySelector('a.cc-dl');
    dl.href = exeUrl;
    dl.title = version ? ('v' + version) : '';
    dl.querySelector('span').textContent = t.install;
    var more = box.querySelector('a.cc-more');
    more.href = PAGE;
    more.textContent = t.more;
    var x = box.querySelector('button.cc-x');
    x.setAttribute('aria-label', t.close);
    x.title = t.close;

    function hide(days) {
      store(KEY, String(Date.now() + days * DAY));
      box.classList.add('cc-off');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 300);
    }
    x.addEventListener('click', function () { hide(30); });
    dl.addEventListener('click', function () { hide(365); });
    more.addEventListener('click', function () { store(KEY, String(Date.now() + 7 * DAY)); });

    document.body.appendChild(box);
    // setTimeout zamiast requestAnimationFrame: w ukrytej karcie rAF stoi i baner zostałby niewidoczny.
    void box.offsetWidth;
    setTimeout(function () { box.classList.add('cc-on'); }, 30);
  }

  function start() {
    if (snoozed() || inApp() || !isWindowsDesktop()) return;
    var shown = false;
    function go(url, ver) {
      if (shown || inApp()) return;
      shown = true;
      build(url, ver);
    }
    // Wersja z pliku aktualizacji; gdy go brak — stały link do bieżącego instalatora.
    setTimeout(function () {
      fetch(PAGE + 'latest.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var p = j && j.platforms && j.platforms['windows-x86_64'];
          var ok = p && /^https:\/\/polskieradio\.cc\/aplikacje\/wyszukiwarka-windows\/[\w.-]+\.exe$/.test(p.url);
          go(ok ? new URL(p.url).pathname : FALLBACK_EXE, ok ? j.version : '');
        })
        .catch(function () { go(FALLBACK_EXE, ''); });
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
