/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC POLONIA & GLOBAL HUB — ZEWER DLA POLONII ŚWIATOWEJ I ODBIORCY EN
 * Dyrektywa L0: 29.10.2026 — Dostosowanie do odbiorcy EN i Polonii na świecie
 * ══════════════════════════════════════════════════════════════════════════
 * - Zegar 4 głównych stref Polonii: Warszawa, Londyn, Nowy Jork, Chicago
 * - Elegancki, dostępny przełącznik języka PL | EN (WCAG 2.2 AA, min. 44px)
 * - Bezpieczna analityka GA4: rejestracja obecności ośrodków Polonii
 * - Płynne tłumaczenie kluczowych elementów interfejsu (in-place i18n)
 * ══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cc_user_lang_choice';
  var COOKIE_NAME = 'cc_lang_pref';

  // 1. ZEGAR CZASU ŚWIATOWEGO POLONII
  var DIASPORA_HUBS = [
    { id: 'waw', name: 'Warszawa', flag: '🇵🇱', tz: 'Europe/Warsaw', label: 'Polska' },
    { id: 'lon', name: 'Londyn', flag: '🇬🇧', tz: 'Europe/London', label: 'UK & Irlandia' },
    { id: 'nyc', name: 'Nowy Jork', flag: '🇺🇸', tz: 'America/New_York', label: 'USA Wschód' },
    { id: 'chi', name: 'Chicago', flag: '🇺🇸', tz: 'America/Chicago', label: 'USA Midwest' }
  ];

  function formatTime(tz) {
    try {
      return new Intl.DateTimeFormat('pl-PL', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
    } catch (_) {
      return '--:--:--';
    }
  }

  function initPoloniaClocks() {
    // Dyrektywa Dowódcy: Zegar Polonii został usunięty, aby nie zasłaniał transmisji wideo na polskieradio.cc
    try {
      var containers = document.querySelectorAll('[data-cc-polonia-clock], .cc-polonia-clock-wrap');
      containers.forEach(function (el) { el.remove(); });
    } catch (_) {}
  }

  // 2. LOGIKA JĘZYKA (PL | EN)
  function getCurrentLang() {
    try {
      var choice = localStorage.getItem(STORAGE_KEY);
      if (choice === 'en' || choice === 'pl') return choice;
      if (localStorage.getItem('lumina_lang') === 'en') return 'en';
    } catch (_) {}
    return 'pl';
  }

  function setLanguage(lang) {
    if (lang !== 'pl' && lang !== 'en') return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem('lumina_lang', lang);
      if (lang === 'en') {
        sessionStorage.setItem('lumina_explicit_en', '1');
        document.cookie = COOKIE_NAME + '=en; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'googtrans=/pl/en; path=/;';
      } else {
        sessionStorage.removeItem('lumina_explicit_en');
        document.cookie = COOKIE_NAME + '=pl; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'googtrans=/pl/pl; path=/;';
      }
    } catch (_) {}

    document.documentElement.lang = lang;

    if (window.ccTrackPolonia) {
      window.ccTrackPolonia('language_switch', { to_lang: lang });
    }

    applyTranslations(lang);
    updateSwitcherButtons(lang);
  }

  // Słownik tłumaczeń dla 3 kluczowych stron
  var DICTIONARY = {
    // index.html
    'main_listen_live': { pl: 'SŁUCHAJ NA ŻYWO', en: 'LISTEN LIVE' },
    'main_live_badge': { pl: 'TERAZ:', en: 'NOW:' },
    'main_next_badge': { pl: 'NASTĘPNIE', en: 'NEXT' },
    'main_menu_title': { pl: 'Centrum nawigacyjne chrześcijańskiego radia, telewizji, mediów i usług', en: 'Navigation center for Christian radio, TV, media & ministry' },
    'main_channels_btn': { pl: 'Wszystkie Kanały Radiowe', en: 'All Radio Channels' },
    'main_search_ph': { pl: 'Czego szukasz w ekosystemie Christian Culture?', en: 'Search Christian Culture ecosystem...' },
    'main_diaspora_welcome': { pl: 'Pozdrawiamy Polonię na całym świecie', en: 'Welcoming our global Polish diaspora & international friends' },
    
    // master-live.html
    'master_unmute': { pl: 'KLIKNIJ W DOWOLNYM MIEJSCU, ABY WŁĄCZYĆ DŹWIĘK TRANSMISJI NA ŻYWO', en: 'CLICK ANYWHERE TO UNMUTE 24/7 LIVE BROADCAST' },
    'master_live_badge': { pl: 'NA ŻYWO', en: 'LIVE' },
    'master_now_broadcasting': { pl: 'TERAZ W EMISJI', en: 'ON AIR NOW' },
    'master_bible_singing': { pl: 'BIBLIA ŚPIEWANA & WORSHIP 24/7', en: 'SINGING BIBLE & WORSHIP 24/7' },
    'master_bible_sub': { pl: 'Całodobowa transmisja Słowa Bożego i pieśni chwały', en: '24/7 broadcast of God\'s Word and songs of praise' },
    'master_dekalog_title': { pl: 'Boży Dekalog', en: 'The Ten Commandments' },
    
    // player.html
    'player_hero_title': { pl: 'Biblia czytana <span class="gold-gradient-text">24 godziny</span> na dobę, 7 dni w tygodniu.', en: 'Scripture proclaimed <span class="gold-gradient-text">24 hours</span> a day, 7 days a week.' },
    'player_hero_subtitle': { pl: 'Doświadczaj żywego Słowa Bożego bez przerw, w doskonałej jakości studyjnej lektora.', en: 'Experience the living Word of God continuously in pristine studio voiceover quality.' },
    'player_play': { pl: 'Odtwarzaj', en: 'Play' },
    'player_pause': { pl: 'Pauza', en: 'Pause' },
    'player_stations_title': { pl: 'Stacje Radiowe & Strumienie na Żywo', en: 'Radio Stations & Live Streams' },
    'player_stations_sub': { pl: 'Radio na żywo i playlisty', en: 'Live radio & playlists' },
    'player_verse_title': { pl: 'Słowo Dnia', en: 'Word of the Day' },
    'player_open_bible': { pl: 'Otwórz w Biblii', en: 'Open in Scripture' }
  };

  function applyTranslations(lang) {
    var isEn = lang === 'en';

    // 1. Elementy z atrybutem data-cc-i18n
    document.querySelectorAll('[data-cc-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-cc-i18n');
      if (DICTIONARY[key]) {
        el.innerHTML = DICTIONARY[key][isEn ? 'en' : 'pl'];
      }
    });

    // 2. Elementy z bezpośrednim data-cc-i18n-en i data-cc-i18n-pl
    document.querySelectorAll('[data-cc-i18n-en]').forEach(function (el) {
      if (!el.hasAttribute('data-cc-i18n-pl')) {
        el.setAttribute('data-cc-i18n-pl', el.innerHTML);
      }
      el.innerHTML = isEn ? el.getAttribute('data-cc-i18n-en') : el.getAttribute('data-cc-i18n-pl');
    });

    // 3. Specjalne dopasowania per strona
    // Strona master-live.html: banner unmute
    var unmuteBanner = document.querySelector('#masterUnmuteBanner span');
    if (unmuteBanner) {
      unmuteBanner.textContent = isEn
        ? 'CLICK ANYWHERE TO UNMUTE 24/7 LIVE BROADCAST'
        : 'KLIKNIJ W DOWOLNYM MIEJSCU, ABY WŁĄCZYĆ DŹWIĘK TRANSMISJI NA ŻYWO';
    }

    // Strona player.html: hero badge & play button
    var heroSub = document.getElementById('hero-subtitle');
    if (heroSub && !heroSub.hasAttribute('data-cc-i18n-pl')) {
      heroSub.setAttribute('data-cc-i18n-pl', heroSub.innerHTML);
      heroSub.setAttribute('data-cc-i18n-en', 'Experience the living Word of God continuously in pristine studio voiceover quality.');
    }
    if (heroSub) {
      heroSub.innerHTML = isEn ? heroSub.getAttribute('data-cc-i18n-en') : heroSub.getAttribute('data-cc-i18n-pl');
    }

    var heroTitle = document.getElementById('hero-title');
    if (heroTitle && !heroTitle.hasAttribute('data-cc-i18n-pl')) {
      heroTitle.setAttribute('data-cc-i18n-pl', heroTitle.innerHTML);
      heroTitle.setAttribute('data-cc-i18n-en', 'Scripture proclaimed <span class="gold-gradient-text">24 hours</span> a day, 7 days a week.');
    }
    if (heroTitle) {
      heroTitle.innerHTML = isEn ? heroTitle.getAttribute('data-cc-i18n-en') : heroTitle.getAttribute('data-cc-i18n-pl');
    }

    var heroPlayLabel = document.getElementById('hero-play-label');
    if (heroPlayLabel) {
      var isPlaying = heroPlayLabel.textContent === 'Pauza' || heroPlayLabel.textContent === 'Pause';
      heroPlayLabel.textContent = isPlaying ? (isEn ? 'Pause' : 'Pauza') : (isEn ? 'Play' : 'Odtwarzaj');
    }

    // Odświeżenie zegarów po zmianie języka
    var poloniaLabels = document.querySelectorAll('.cc-polonia-clock-wrap > span:first-child');
    poloniaLabels.forEach(function (lbl) {
      lbl.innerHTML = '<i class="fa-solid fa-earth-americas" style="font-size:12px;"></i> ' + (isEn ? 'Global Polonia Clock:' : 'Czas Polonii:');
    });
  }

  function updateSwitcherButtons(lang) {
    document.querySelectorAll('.cc-lang-pill-btn').forEach(function (btn) {
      var target = btn.getAttribute('data-lang');
      if (target === lang) {
        btn.style.background = '#d4af37';
        btn.style.color = '#0a0a0f';
        btn.style.fontWeight = '800';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#cbd5e1';
        btn.style.fontWeight = '500';
      }
    });
  }

  function renderLanguageSwitchers() {
    var targets = document.querySelectorAll('[data-cc-lang-switcher]');
    var current = getCurrentLang();

    targets.forEach(function (target) {
      target.innerHTML = [
        '<div class="cc-lang-toggle" role="group" aria-label="Wybór języka / Language selection" style="display:inline-flex;align-items:center;background:rgba(18,18,26,0.85);border:1px solid rgba(212,175,55,0.3);border-radius:22px;padding:2px;gap:2px;">',
        '<button type="button" class="cc-lang-pill-btn" data-lang="pl" aria-label="Język Polski" style="min-width:44px;min-height:36px;padding:4px 10px;border-radius:18px;border:none;font-size:11px;cursor:pointer;transition:all 0.2s;' + (current === 'pl' ? 'background:#d4af37;color:#0a0a0f;font-weight:800;' : 'background:transparent;color:#cbd5e1;font-weight:500;') + '">PL</button>',
        '<button type="button" class="cc-lang-pill-btn" data-lang="en" aria-label="English Language" style="min-width:44px;min-height:36px;padding:4px 10px;border-radius:18px;border:none;font-size:11px;cursor:pointer;transition:all 0.2s;' + (current === 'en' ? 'background:#d4af37;color:#0a0a0f;font-weight:800;' : 'background:transparent;color:#cbd5e1;font-weight:500;') + '">EN</button>',
        '</div>'
      ].join('');

      target.querySelectorAll('.cc-lang-pill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var lang = this.getAttribute('data-lang');
          setLanguage(lang);
        });
      });
    });
  }

  // 3. AUTO-START I ANALITYKA POLONII
  function boot() {
  // Auto-load Universal Multilingual TTS Reader
  if (!document.getElementById('ccUniversalTtsScript') && !window.CCUniversalTTS && typeof document !== 'undefined') {
    var ttsScript = document.createElement('script');
    ttsScript.id = 'ccUniversalTtsScript';
    ttsScript.src = '/js/cc-universal-tts.js?v=20261029_1';
    document.head.appendChild(ttsScript);
  }

    initPoloniaClocks();
    renderLanguageSwitchers();

    var current = getCurrentLang();
    if (current === 'en') {
      applyTranslations('en');
    }

    // Rejestracja obecności Polonii (raz na sesję)
    try {
      if (!sessionStorage.getItem('cc_polonia_tracked')) {
        sessionStorage.setItem('cc_polonia_tracked', '1');
        if (window.ccTrackPolonia) {
          window.ccTrackPolonia('session_start', { lang: current });
        }
      }
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.ccSetLanguage = setLanguage;
  window.ccGetCurrentLang = getCurrentLang;
})();
