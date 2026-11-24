/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CC ANALYTICS MISSION CONTROL 1.0 — UNIFIED ANALYTICS STANDARD (STAGE B & C3)
 * ═══════════════════════════════════════════════════════════════════════════
 * Kanoniczny moduł pomiarowy ekosystemu Christian Culture (polskieradio.cc).
 * Wersja: 2.0.0 (2026-11-21) — 100% kompatybilny wstecz z window.ccTrack,
 * window.ccGetPoloniaHub, window.ccTrackPolonia oraz testami ga-internal-traffic.
 *
 * Kluczowe zabezpieczenia:
 * 1. Zgodność z RODO / Consent Mode v2 (respektowanie odmowy zgody i ga-disable).
 * 2. Sanityzacja PII (blokada wysyłania e-maili, telefonów, tokenów, prywatnych notatek i modlitw).
 * 3. Oznaczanie ruchu technicznego / testowego / OBS (traffic_type = 'internal' | 'technical_monitor').
 * 4. Prawdziwe progi odtwarzania mediów (radio_listen_60s/300s, tv_watch_60s/300s) oparte na
 *    faktycznym postępie czasu odtwarzacza (!paused && !ended && currentTime > lastTime),
 *    nigdy na ślepym zegarze przeglądarki.
 * 5. Blokada fikcyjnych ukończeń (audio_complete / video_complete) dla strumieni 24/7 LIVE.
 * 6. Blokada fałszywych konwersji wsparcia (donate_click != donation_complete; zero kwot i danych darczyńców).
 */
(function () {
  'use strict';
  if (window.ccTrack && window.CCAnalyticsMC) return;

  var GA_MAIN_ID = 'G-Y4EFTVBPE3';
  var CONSENT_KEYS = [
    'lumina_cookie_consent',
    'cc-search-analytics-consent-v1',
    'cc-40dm-analytics-consent',
    'cc-journal-analytics-consent',
    'cc_analytics_consent'
  ];

  // ── 0. SANITYZACJA BŁĘDNYCH PARAMETRÓW UTM (np. utm_source=chatgpt.com) Z LINKÓW MARKDOWN — ETAP C2) ──
  function normalizeCampaignQueryInUrl() {
    try {
      if (typeof location === 'undefined' || !location.search || typeof history === 'undefined' || !history.replaceState) return false;
      var u = new URL(location.href);
      var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      var changed = false;
      for (var i = 0; i < utmKeys.length; i++) {
        var k = utmKeys[i];
        if (u.searchParams.has(k)) {
          var rawVal = u.searchParams.get(k) || '';
          var cleanVal = rawVal.replace(/[)\]>.,;]+$/g, '').trim();
          if (cleanVal !== rawVal) {
            u.searchParams.set(k, cleanVal);
            changed = true;
          }
        }
      }
      // Jeśli utm_source to chatgpt.com (po oczyszczeniu), a brak utm_medium, ustawiamy ai-assistant, aby nie wpadało do Unassigned
      if (u.searchParams.get('utm_source') === 'chatgpt.com' && !u.searchParams.get('utm_medium')) {
        u.searchParams.set('utm_medium', 'ai-assistant');
        changed = true;
      }
      if (changed) {
        history.replaceState(null, '', u.pathname + u.search + u.hash);
        return true;
      }
    } catch (_) {}
    return false;
  }
  normalizeCampaignQueryInUrl();

  // ── 1. DETEKCJA ZGODY I RUCHU TECHNICZNEGO (STAGE A3 & C3) ──
  function getConsentState() {
    try {
      if (window['ga-disable-' + GA_MAIN_ID] === true) return 'denied';
      for (var i = 0; i < CONSENT_KEYS.length; i++) {
        var val = localStorage.getItem(CONSENT_KEYS[i]);
        if (val === 'denied' || val === 'rejected' || val === 'false') return 'denied';
        if (val === 'granted' || val === 'accepted' || val === 'true') return 'granted';
      }
    } catch (_) {}
    return 'default';
  }

  function detectTrafficType() {
    try {
      var s = (typeof location !== 'undefined' && location.search) ? location.search : '';
      var h = (typeof location !== 'undefined' && location.hostname) ? location.hostname : '';
      if (/[?&]cc_team=1/.test(s)) {
        try { localStorage.setItem('cc_team', '1'); } catch (_) {}
      }
      if (/[?&]cc_team=0/.test(s)) {
        try { localStorage.removeItem('cc_team'); } catch (_) {}
      }
      var isTeam = false;
      try { isTeam = localStorage.getItem('cc_team') === '1'; } catch (_) {}
      if (isTeam || /[?&]in_mcr=1/.test(s) || (typeof window !== 'undefined' && window.obsstudio)) {
        return 'internal';
      }
      if (
        (typeof navigator !== 'undefined' && navigator.webdriver === true) ||
        /^(localhost|127\.0\.0\.1|0\.0\.0\.0|.*\.test)$/i.test(h) ||
        /HeadlessChrome|Playwright|Puppeteer|PhantomJS|Lighthouse/i.test((typeof navigator !== 'undefined' && navigator.userAgent) || '')
      ) {
        return 'technical_monitor';
      }
    } catch (_) {}
    return null;
  }

  // ── 2. SANITYZACJA DANYCH OSOBOWYCH I PRYWATNYCH (STAGE B3, B5, C3) ──
  var PII_EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  var PII_PHONE_RE = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
  var SENSITIVE_PARAM_KEYS = /^(email|e-mail|phone|tel|telephone|password|token|id_token|access_token|auth|secret|pesel|iban|account_number|card|amount|kwota|donation_amount|donor_name|full_name|prayer_text|note_text|message_text|private_note)$/i;

  function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    try {
      var u = new URL(rawUrl, (typeof location !== 'undefined' && location.href) ? location.href : 'https://polskieradio.cc');
      var sensitiveQueryKeys = ['token', 'id_token', 'access_token', 'email', 'phone', 'tel', 'name', 'password', 'key', 'secret', 'code'];
      for (var i = 0; i < sensitiveQueryKeys.length; i++) {
        if (u.searchParams.has(sensitiveQueryKeys[i])) {
          u.searchParams.set(sensitiveQueryKeys[i], '[REDACTED]');
        }
      }
      return (u.origin === 'https://polskieradio.cc' ? (u.pathname + u.search) : (u.origin + u.pathname)).slice(0, 160);
    } catch (_) {
      return String(rawUrl).split('?')[0].slice(0, 120);
    }
  }

  function sanitizeParams(rawParams) {
    if (!rawParams || typeof rawParams !== 'object') return {};
    var clean = {};
    var keys = Object.keys(rawParams);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (SENSITIVE_PARAM_KEYS.test(k)) continue;
      var v = rawParams[k];
      if (v === undefined || v === null) continue;
      if (typeof v === 'string') {
        if (PII_EMAIL_RE.test(v)) {
          PII_EMAIL_RE.lastIndex = 0;
          v = v.replace(PII_EMAIL_RE, '[EMAIL_REDACTED]');
        }
        if (k !== 'item_id' && k !== 'stream' && k !== 'course' && k !== 'lesson' && PII_PHONE_RE.test(v)) {
          PII_PHONE_RE.lastIndex = 0;
          v = v.replace(PII_PHONE_RE, '[PHONE_REDACTED]');
        }
        clean[k] = v.slice(0, 160);
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        clean[k] = v;
      }
    }
    return clean;
  }

  // ── 3. GŁÓWNA FUNKCJA WYSYŁAJĄCA ZDARZENIA (ccTrack) ──
  var eventLog = [];
  function ccTrack(name, params) {
    try {
      if (!name || typeof name !== 'string') return false;
      if (getConsentState() === 'denied') return false;

      // Blokada fałszywego donation_complete bez flagi verified_payment === true
      if (name === 'donation_complete') {
        if (!params || params.verified_payment !== true) return false;
      }

      var cleanParams = sanitizeParams(params || {});
      if (name === 'donation_complete') {
        delete cleanParams.verified_payment;
      }

      var trafficType = detectTrafficType();
      if (trafficType && !cleanParams.traffic_type) {
        cleanParams.traffic_type = trafficType;
      }

      var payload = Object.assign({ transport_type: 'beacon' }, cleanParams);
      eventLog.push({ name: name, params: payload, ts: Date.now() });
      if (eventLog.length > 200) eventLog.shift();

      if (typeof window.gtag !== 'function') return false;
      window.gtag('event', name, payload);
      return true;
    } catch (_) {
      return false;
    }
  }
  window.ccTrack = ccTrack;

  // ── 4. DETEKCJA OŚRODKA POLONII (100% KOMPATYBILNOŚCI WSTECZNEJ) ──
  function ccGetPoloniaHub() {
    try {
      var tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
      if (!tz) return 'UNKNOWN';
      if (/Warsaw|Poland/i.test(tz)) return 'PL_KRAJ';
      if (/New_York|Detroit|Indiana|Kentucky|Toronto|Montreal/i.test(tz)) return 'POLONIA_US_EAST';
      if (/Chicago|Menominee|Winnipeg/i.test(tz)) return 'POLONIA_US_CHICAGO';
      if (/Denver|Phoenix|Edmonton/i.test(tz)) return 'POLONIA_US_MOUNTAIN';
      if (/Los_Angeles|Vancouver|Tijuana/i.test(tz)) return 'POLONIA_US_WEST';
      if (/London|Dublin|Belfast/i.test(tz)) return 'POLONIA_UK_IRELAND';
      if (/Berlin|Paris|Rome|Madrid|Amsterdam|Brussels|Vienna|Stockholm|Oslo/i.test(tz)) return 'POLONIA_EUROPE_ZACH';
      return tz.replace(/[^a-zA-Z0-9_\-\/]/g, '_').slice(0, 40);
    } catch (_) {
      return 'UNKNOWN';
    }
  }
  window.ccGetPoloniaHub = ccGetPoloniaHub;

  function ccTrackPolonia(action, extra) {
    var hub = ccGetPoloniaHub();
    var tz = '';
    try { tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''; } catch (_) {}
    ccTrack('polonia_engagement', Object.assign({
      polonia_hub: hub,
      user_tz: tz || 'unknown',
      action: action || 'interaction'
    }, extra || {}));
  }
  window.ccTrackPolonia = ccTrackPolonia;

  var path = (typeof location !== 'undefined' && location.pathname) ? location.pathname : '/';

  // ── 5. ETAP B4: AKADEMIA I KURSY (course_open, lesson_view, lesson_start, lesson_complete, course_progress) ──
  var lessonMatch = path.match(/^\/(?:akademia|kursy)\/([a-z0-9-]+)\/((?:dzien|lekcja)-\d+)/i);
  var courseMatch = !lessonMatch && path.match(/^\/(?:akademia|kursy)(?:\/([a-z0-9-]+))?\/?$/i);
  var lessonState = {
    course: lessonMatch ? lessonMatch[1].toLowerCase() : null,
    lesson: lessonMatch ? lessonMatch[2].toLowerCase() : null,
    started: false,
    completed: false,
    maxScrollPct: 0,
    engagedSeconds: 0
  };

  if (lessonMatch) {
    ccTrack('lesson_view', { course: lessonMatch[1], lesson: lessonMatch[2] });
  } else if (courseMatch && courseMatch[1]) {
    ccTrack('course_open', { course: courseMatch[1].toLowerCase() });
  }

  function markLessonStart(trigger) {
    if (!lessonState.course || !lessonState.lesson || lessonState.started) return;
    lessonState.started = true;
    ccTrack('lesson_start', {
      course: lessonState.course,
      lesson: lessonState.lesson,
      trigger: trigger || 'interaction'
    });
  }

  function markLessonComplete(trigger, progressPct) {
    if (!lessonState.course || !lessonState.lesson || lessonState.completed) return;
    if (!lessonState.started) markLessonStart(trigger || 'completion');
    lessonState.completed = true;
    ccTrack('lesson_complete', {
      course: lessonState.course,
      lesson: lessonState.lesson,
      trigger: trigger || 'scroll_and_time'
    });
    if (typeof progressPct === 'number' && progressPct >= 0 && progressPct <= 100) {
      ccTrack('course_progress', {
        course: lessonState.course,
        lesson: lessonState.lesson,
        progress_percent: Math.round(progressPct)
      });
    }
  }

  // ── 6. ETAP B1 & B2: RADIO, AUDIO I TELEWIZJA LIVE (WERYFIKACJA STANU ODTWARZACZA) ──
  var LIVE_STREAM_RE = /zeno\.fm|icecast|shoutcast|radio\.co|\/stream|\.m3u8|live/i;
  var BIBLE_AUDIO_RE = /biblia-audio|\/audio\/(?:gen|exo|lev|num|deu|jos|jdg|rut|1sa|2sa|1ki|2ki|1ch|2ch|ezr|neh|est|job|psa|pro|ecc|sng|isa|jer|lam|ezk|dan|hos|jol|amo|oba|jon|mic|nam|hab|zep|hag|zec|mal|mat|mrk|luk|jhn|act|rom|1co|2co|gal|eph|php|col|1th|2th|1ti|2ti|tit|phm|heb|jas|1pe|2pe|1jn|2jn|3jn|jud|rev|rdz|wj|kpl|lb|pwt|joz|sdz|1sm|2sm|1krl|2krl|1krn|2krn|ezd|ne|hi|ps|prz|kzn|pnp|iz|jr|lm|ez|dn|oz|jl|am|ab|jon|mi|na|ha|so|ag|za|ml|mt|mk|lk|j|dz|rz|1kor|2kor|ga|ef|flp|kol|1tes|2tes|1tm|2tm|tt|flm|hbr|jk|1p|2p|1j|2j|3j|jud|ap)[-_]?\d+/i;

  var seenPlay = {};
  var mediaWatchers = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var lastUserGestureTs = 0;

  function recordUserGesture() {
    lastUserGestureTs = Date.now();
  }

  function isLiveMediaElement(el, src) {
    if (!el) return false;
    var s = src || el.currentSrc || el.src || '';
    if (el.duration === Infinity || Number.isNaN(el.duration)) {
      if (LIVE_STREAM_RE.test(s) || /-live\b/i.test(path)) return true;
    }
    return LIVE_STREAM_RE.test(s) || (el.dataset && el.dataset.live === 'true');
  }

  function classifyMedia(el, src) {
    var s = src || (el && (el.currentSrc || el.src)) || '';
    var isVideo = (typeof HTMLVideoElement !== 'undefined' && el instanceof HTMLVideoElement) || (el && el.tagName === 'VIDEO');
    var isLive = isLiveMediaElement(el, s);
    var isBible = !isVideo && (BIBLE_AUDIO_RE.test(s) || /^\/biblia-audio|^\/mojabiblia/i.test(path) || (el && el.dataset && el.dataset.contentType === 'bible'));
    var host = '';
    try { host = new URL(s, (typeof location !== 'undefined' && location.href) ? location.href : 'https://polskieradio.cc').hostname; } catch (_) {}
    var streamClean = s.split('?')[0].slice(-80);
    var initiationType = (Date.now() - lastUserGestureTs <= 5000) ? 'user' : 'auto';
    return {
      isVideo: isVideo,
      isLive: isLive,
      isBible: isBible,
      host: host,
      stream: streamClean,
      initiationType: initiationType
    };
  }

  // Rejestracja skumulowanego, rzeczywistego czasu odtwarzania (postęp currentTime lub aktywne granie)
  function createMediaSessionState(el) {
    var info = classifyMedia(el);
    return {
      AccumulatedSec: 0,
      lastMediaTime: typeof el.currentTime === 'number' ? el.currentTime : 0,
      lastWallTime: Date.now(),
      sent60s: false,
      sent300s: false,
      sentComplete: false,
      isPlaying: false,
      info: info
    };
  }

  function tickMediaProgress(el, state) {
    if (!el || !state) return;
    if (el.paused || el.ended || el.muted) {
      state.isPlaying = false;
      return;
    }
    var now = Date.now();
    var curTime = typeof el.currentTime === 'number' ? el.currentTime : 0;
    var deltaMedia = curTime - state.lastMediaTime;
    var deltaWall = (now - state.lastWallTime) / 1000;

    state.lastMediaTime = curTime;
    state.lastWallTime = now;

    // Naliczamy czas wyłącznie wtedy, gdy media faktycznie postępują (deltaMedia > 0)
    // lub dla strumienia live z zablokowanym currentTime gdy readyState >= 2 i upłynął rzeczywisty czas
    var step = 0;
    if (deltaMedia > 0 && deltaMedia < 30) {
      step = deltaMedia;
    } else if (state.info.isLive && el.readyState >= 2 && deltaWall > 0 && deltaWall < 30) {
      step = deltaWall;
    }

    if (step <= 0) return;
    state.AccumulatedSec += step;

    var baseParams = {
      stream_host: state.info.host,
      stream: state.info.stream,
      initiation_type: state.info.initiationType
    };

    if (!state.sent60s && state.AccumulatedSec >= 60) {
      state.sent60s = true;
      ccTrack(state.info.isVideo ? 'tv_watch_60s' : 'radio_listen_60s', baseParams);
    }
    if (!state.sent300s && state.AccumulatedSec >= 300) {
      state.sent300s = true;
      ccTrack(state.info.isVideo ? 'tv_watch_300s' : 'radio_listen_300s', baseParams);
    }
  }

  function attachMediaListeners(el) {
    if (!el || typeof el.addEventListener !== 'function') return;
    if (mediaWatchers && mediaWatchers.has(el)) return;
    var state = createMediaSessionState(el);
    if (mediaWatchers) mediaWatchers.set(el, state);

    el.addEventListener('playing', function () {
      state.info = classifyMedia(el);
      state.isPlaying = true;
      state.lastMediaTime = typeof el.currentTime === 'number' ? el.currentTime : 0;
      state.lastWallTime = Date.now();
    });

    el.addEventListener('timeupdate', function () {
      tickMediaProgress(el, state);
    });

    el.addEventListener('pause', function () {
      tickMediaProgress(el, state);
      state.isPlaying = false;
      if (el.ended) return;
      var info = state.info || classifyMedia(el);
      if (!info.isVideo) {
        ccTrack('radio_pause', {
          stream_host: info.host,
          stream: info.stream,
          listened_seconds: Math.round(state.AccumulatedSec)
        });
      }
    });

    el.addEventListener('emptied', function () {
      if (state.AccumulatedSec > 1) {
        var info = state.info || classifyMedia(el);
        if (!info.isVideo) {
          ccTrack('radio_stop', {
            stream_host: info.host,
            stream: info.stream,
            listened_seconds: Math.round(state.AccumulatedSec)
          });
        }
      }
    });

    el.addEventListener('ended', function () {
      tickMediaProgress(el, state);
      state.isPlaying = false;
      var info = state.info || classifyMedia(el);
      // Zakaz wysyłania *_complete dla emisji całodobowej LIVE
      if (info.isLive || el.duration === Infinity || !(el.duration > 0)) return;
      if (state.sentComplete) return;
      state.sentComplete = true;

      if (info.isVideo) {
        ccTrack('video_complete', {
          stream_host: info.host,
          stream: info.stream,
          duration_seconds: Math.round(el.duration || state.AccumulatedSec)
        });
      } else {
        ccTrack('audio_complete', {
          stream_host: info.host,
          stream: info.stream,
          duration_seconds: Math.round(el.duration || state.AccumulatedSec)
        });
        if (info.isBible) {
          ccTrack('bible_audio_complete', {
            book_code: (el.dataset && el.dataset.bookCode) || 'UNKNOWN',
            chapter_number: Number((el.dataset && el.dataset.chapterNumber) || 1),
            translation: (el.dataset && el.dataset.translation) || 'UBG',
            content_type: 'audio_bible',
            player_type: 'html5_audio'
          });
        }
      }
    });

    el.addEventListener('error', function () {
      var info = state.info || classifyMedia(el);
      var errCode = (el.error && el.error.code) ? Number(el.error.code) : 0;
      ccTrack(info.isVideo ? 'video_error' : 'audio_error', {
        stream_host: info.host,
        stream: info.stream,
        error_code: errCode
      });
    });
  }

  var nativePlay = window.HTMLMediaElement && HTMLMediaElement.prototype.play;
  if (nativePlay) {
    HTMLMediaElement.prototype.play = function () {
      try {
        attachMediaListeners(this);
        var isAudio = (typeof HTMLAudioElement !== 'undefined' && this instanceof HTMLAudioElement) || this.tagName === 'AUDIO';
        var isVideo = (typeof HTMLVideoElement !== 'undefined' && this instanceof HTMLVideoElement) || this.tagName === 'VIDEO';
        if ((isAudio || isVideo) && !this.muted) {
          var src = this.currentSrc || this.src || '';
          var now = Date.now();
          if (src && !(seenPlay[src] > now - 30 * 60 * 1000)) {
            seenPlay[src] = now;
            var info = classifyMedia(this, src);
            if (isAudio) {
              // Zachowanie 100% kompatybilności z istniejącymi testami dla radio_play i audio_play
              ccTrack(info.isLive ? 'radio_play' : 'audio_play', {
                stream_host: info.host,
                stream: info.stream
              });
              if (info.isBible && !info.isLive) {
                ccTrack('bible_audio_start', {
                  book_code: (this.dataset && this.dataset.bookCode) || 'UNKNOWN',
                  chapter_number: Number((this.dataset && this.dataset.chapterNumber) || 1),
                  translation: (this.dataset && this.dataset.translation) || 'UBG',
                  content_type: 'audio_bible',
                  player_type: 'html5_audio'
                });
              }
            } else if (isVideo) {
              ccTrack('video_start', {
                stream_host: info.host,
                stream: info.stream,
                content_type: info.isLive ? 'live_tv' : 'vod',
                initiation_type: info.initiationType
              });
            }
          }
        }
      } catch (_) {}
      return nativePlay.apply(this, arguments);
    };
  }

  // ── 7. UDOSTĘPNIANIE, WSPIERANIE MISJI I KONTAKT (STAGE B5) ──
  if (typeof navigator !== 'undefined' && navigator.share) {
    var nativeShare = navigator.share.bind(navigator);
    navigator.share = function (data) {
      return nativeShare(data).then(function (r) {
        ccTrack('share', { method: 'system', content_url: sanitizeUrl((data && data.url) || location.href) });
        return r;
      });
    };
  }

  if (/^\/(wspieraj|wspieramto|milion-gestow|milion|pomogebomoge|darowizna|patron|mecenas)\b/i.test(path)) {
    ccTrack('support_view', { page_path: path });
  }

  var DONATE_RE = /\/(wspieraj|wspieramto|milion-gestow)\b|patronite\.pl|paypal\.(com|me)|zrzutka\.pl|revolut\.me|buycoffee\.to|buymeacoffee\.com|tipply\.pl|suppi\.pl/i;
  var SHARE_RE = /facebook\.com\/sharer|twitter\.com\/intent|x\.com\/intent|wa\.me\/\?text|api\.whatsapp\.com\/send\?text|linkedin\.com\/share|t\.me\/share/i;

  document.addEventListener('click', function (e) {
    recordUserGesture();
    if (lessonState.course && !lessonState.started) {
      markLessonStart('click');
    }

    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    // Przycisk ukończenia lekcji / przejścia do następnej lekcji
    var completeBtn = target.closest('[data-lesson-complete], #kcCompleteLessonBtn, .lesson-complete-btn');
    if (completeBtn && lessonState.course) {
      markLessonComplete('button_click', 100);
    }

    // Kopiowanie numeru konta bankowego na stronach wsparcia
    var copyBtn = target.closest('[data-support-copy-account], [data-copy-iban], [data-copy-account], .copy-iban-btn, #copyAccountBtn');
    if (copyBtn) {
      ccTrack('support_copy_account', {
        currency: (copyBtn.dataset && copyBtn.dataset.currency) || 'PLN',
        place: copyBtn.id || 'support_section'
      });
    }

    // Wybór metody wsparcia
    var methodBtn = target.closest('[data-support-method]');
    if (methodBtn && methodBtn.dataset && methodBtn.dataset.supportMethod) {
      ccTrack('support_method_select', {
        method: String(methodBtn.dataset.supportMethod).toLowerCase().slice(0, 40)
      });
    }

    // Zmiana kanału TV LIVE
    var channelBtn = target.closest('[data-tv-channel], [data-channel-id]');
    if (channelBtn && channelBtn.dataset) {
      var chId = channelBtn.dataset.tvChannel || channelBtn.dataset.channelId;
      if (chId) {
        ccTrack('tv_channel_change', {
          channel_id: String(chId).slice(0, 50),
          initiation_type: 'user'
        });
      }
    }

    var a = target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var place = a.closest('[id]') ? a.closest('[id]').id : '';
    if (SHARE_RE.test(href)) {
      ccTrack('share', { method: (href.match(/facebook|twitter|x\.com|whatsapp|wa\.me|linkedin|t\.me/i) || ['link'])[0].toLowerCase() });
    } else if (DONATE_RE.test(href)) {
      ccTrack('donate_click', { link_url: a.href, place: place });
    } else if (/^(tel:|mailto:)|wa\.me\/\d|api\.whatsapp\.com\/send\?phone|m\.me\/|messenger\.com\/t\//i.test(href)) {
      var method = /^tel:/i.test(href) ? 'phone' : /^mailto:/i.test(href) ? 'email' : /whatsapp|wa\.me/i.test(href) ? 'whatsapp' : 'messenger';
      ccTrack('contact_click', { method: method, place: place });
    }
  }, true);

  // ── 8. WYSZUKIWARKA CC (@w) (STAGE A2 & C3) ──
  var lastQuery = '';
  var searchTimer = 0;
  function trackSearch() {
    clearTimeout(searchTimer);
    var input = document.getElementById('ccOmniInput');
    var q = input ? input.value.trim().replace(/\s+/g, ' ') : '';
    if (q.length < 2 || q === lastQuery || /@|\d[\d\s-]{6,}\d/.test(q)) return;
    lastQuery = q;
    ccTrack('search', { search_term: q.slice(0, 100) });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'ccOmniInput') {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(trackSearch, 1500);
    }
  }, true);
  document.addEventListener('keydown', function (e) {
    recordUserGesture();
    if (e.key === 'Enter' && e.target && e.target.id === 'ccOmniInput') trackSearch();
  }, true);
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('#ccOmniBody a');
    if (!a) return;
    trackSearch();
    var item = '';
    try {
      var u = new URL(a.href, location.href);
      item = u.origin === location.origin ? u.pathname : u.hostname;
    } catch (_) {}
    ccTrack('select_content', { content_type: 'search_result', item_id: item.slice(0, 100) });
  }, true);

  // ── 9. SCROLL & ENGAGEMENT DLA LEKCJI AKADEMII (STAGE B4) ──
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && lessonState.course) {
    window.addEventListener('scroll', function () {
      try {
        var docEl = document.documentElement || document.body;
        if (!docEl) return;
        var scrollTop = window.scrollY || docEl.scrollTop || 0;
        var maxScroll = Math.max(1, (docEl.scrollHeight || 1) - (window.innerHeight || 1));
        var pct = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
        if (pct >= 15 && !lessonState.started) {
          markLessonStart('scroll_15pct');
        }
        if (pct > lessonState.maxScrollPct) {
          lessonState.maxScrollPct = pct;
        }
        if (lessonState.maxScrollPct >= 80 && lessonState.engagedSeconds >= 30 && !lessonState.completed) {
          markLessonComplete('scroll_80pct_and_30s', 100);
        }
      } catch (_) {}
    }, { passive: true });

    if (typeof setInterval === 'function') {
      var lessonTimer = setInterval(function () {
        try {
          if (lessonState.completed) {
            clearInterval(lessonTimer);
            return;
          }
          if (typeof document !== 'undefined' && document.hidden) return;
          lessonState.engagedSeconds += 1;
          if (lessonState.maxScrollPct >= 80 && lessonState.engagedSeconds >= 30 && !lessonState.completed) {
            markLessonComplete('scroll_80pct_and_30s', 100);
            clearInterval(lessonTimer);
          }
        } catch (_) {}
      }, 1000);
      if (lessonTimer && typeof lessonTimer.unref === 'function') lessonTimer.unref();
    }
  }

  // ── 10. PUBLICZNE API MODUŁU CC ANALYTICS MISSION CONTROL (STAGE B1–B5) ──
  window.CCAnalyticsMC = {
    version: '2.0.0',
    getEventLog: function () { return eventLog.slice(); },
    clearEventLog: function () { eventLog.length = 0; },
    getConsentState: getConsentState,
    detectTrafficType: detectTrafficType,
    sanitizeParams: sanitizeParams,
    sanitizeUrl: sanitizeUrl,

    // B1. Radio i audio
    trackRadioPlay: function (params) { return ccTrack('radio_play', params); },
    trackRadioPause: function (params) { return ccTrack('radio_pause', params); },
    trackRadioStop: function (params) { return ccTrack('radio_stop', params); },
    trackRadioMilestone: function (seconds, isActivelyPlaying, params) {
      if (!isActivelyPlaying) return false;
      if (seconds === 60) return ccTrack('radio_listen_60s', params);
      if (seconds === 300) return ccTrack('radio_listen_300s', params);
      return false;
    },
    trackAudioComplete: function (params) {
      if (params && (params.is_live === true || params.duration === Infinity)) return false;
      return ccTrack('audio_complete', params);
    },
    trackAudioError: function (params) { return ccTrack('audio_error', params); },

    // B2. Telewizja LIVE i Wideo
    trackVideoStart: function (params) { return ccTrack('video_start', params); },
    trackVideoProgress: function (params) { return ccTrack('video_progress', params); },
    trackVideoComplete: function (params) {
      if (params && (params.is_live === true || params.content_type === 'live_tv' || params.duration === Infinity)) {
        return false;
      }
      return ccTrack('video_complete', params);
    },
    trackTvWatchMilestone: function (seconds, isActivelyWatching, params) {
      if (!isActivelyWatching) return false;
      if (seconds === 60) return ccTrack('tv_watch_60s', params);
      if (seconds === 300) return ccTrack('tv_watch_300s', params);
      return false;
    },
    trackTvChannelChange: function (channelId, prevChannelId, initiationType) {
      return ccTrack('tv_channel_change', {
        channel_id: String(channelId || '').slice(0, 50),
        previous_channel_id: String(prevChannelId || '').slice(0, 50),
        initiation_type: initiationType || 'user'
      });
    },
    trackVideoError: function (params) { return ccTrack('video_error', params); },

    // B3. Biblia Audio i MojaBiblia
    trackBibleChapterOpen: function (params) {
      return ccTrack('bible_chapter_open', {
        book_code: (params && params.book_code) || 'GEN',
        chapter_number: Number((params && params.chapter_number) || 1),
        translation: (params && params.translation) || 'UBG',
        content_type: (params && params.content_type) || 'text_chapter',
        player_type: (params && params.player_type) || 'reader'
      });
    },
    trackBibleAudioStart: function (params) {
      return ccTrack('bible_audio_start', {
        book_code: (params && params.book_code) || 'GEN',
        chapter_number: Number((params && params.chapter_number) || 1),
        translation: (params && params.translation) || 'UBG',
        content_type: (params && params.content_type) || 'audio_bible',
        player_type: (params && params.player_type) || 'audio_player'
      });
    },
    trackBibleAudioComplete: function (params) {
      if (params && params.is_live === true) return false;
      return ccTrack('bible_audio_complete', {
        book_code: (params && params.book_code) || 'GEN',
        chapter_number: Number((params && params.chapter_number) || 1),
        translation: (params && params.translation) || 'UBG',
        content_type: (params && params.content_type) || 'audio_bible',
        player_type: (params && params.player_type) || 'audio_player'
      });
    },
    trackBibleTranslationSelect: function (params) {
      return ccTrack('bible_translation_select', {
        book_code: (params && params.book_code) || 'GEN',
        chapter_number: Number((params && params.chapter_number) || 1),
        translation: (params && params.translation) || 'UBG',
        content_type: 'translation_switch',
        player_type: (params && params.player_type) || 'reader'
      });
    },
    trackBibleSearch: function (query, params) {
      var q = String(query || '').trim().replace(/\s+/g, ' ');
      if (q.length < 2 || PII_EMAIL_RE.test(q) || PII_PHONE_RE.test(q)) {
        PII_EMAIL_RE.lastIndex = 0;
        PII_PHONE_RE.lastIndex = 0;
        return false;
      }
      return ccTrack('bible_search', {
        search_term: q.slice(0, 80),
        translation: (params && params.translation) || 'UBG',
        content_type: 'bible_query',
        player_type: (params && params.player_type) || 'reader'
      });
    },
    trackBibleBookmarkAdd: function (params) {
      // Nigdy nie wysyłamy treści prywatnej notatki lub modlitwy
      return ccTrack('bible_bookmark_add', {
        book_code: (params && params.book_code) || 'GEN',
        chapter_number: Number((params && params.chapter_number) || 1),
        translation: (params && params.translation) || 'UBG',
        content_type: (params && params.content_type) || 'bookmark',
        player_type: (params && params.player_type) || 'reader'
      });
    },

    // B4. Akademia i kursy
    trackCourseOpen: function (courseId, params) {
      return ccTrack('course_open', Object.assign({ course: String(courseId || '').slice(0, 60) }, params || {}));
    },
    trackLessonStart: function (courseId, lessonId, trigger) {
      lessonState.course = String(courseId || lessonState.course || '').slice(0, 60);
      lessonState.lesson = String(lessonId || lessonState.lesson || '').slice(0, 60);
      markLessonStart(trigger || 'api');
      return lessonState.started;
    },
    trackLessonComplete: function (courseId, lessonId, conditionMet, progressPct) {
      if (!conditionMet) return false;
      lessonState.course = String(courseId || lessonState.course || '').slice(0, 60);
      lessonState.lesson = String(lessonId || lessonState.lesson || '').slice(0, 60);
      markLessonComplete('verified_condition', progressPct);
      return lessonState.completed;
    },
    trackCourseProgress: function (courseId, lessonId, progressPct) {
      if (typeof progressPct !== 'number' || progressPct < 0 || progressPct > 100) return false;
      return ccTrack('course_progress', {
        course: String(courseId || '').slice(0, 60),
        lesson: String(lessonId || '').slice(0, 60),
        progress_percent: Math.round(progressPct)
      });
    },

    // B5. Wspieranie misji
    trackSupportView: function (params) { return ccTrack('support_view', params); },
    trackSupportMethodSelect: function (method) {
      return ccTrack('support_method_select', { method: String(method || '').toLowerCase().slice(0, 40) });
    },
    trackDonateClick: function (params) { return ccTrack('donate_click', params); },
    trackSupportCopyAccount: function (currency, place) {
      return ccTrack('support_copy_account', { currency: currency || 'PLN', place: place || 'support_page' });
    },
    trackSupportFormSubmit: function (formType) {
      return ccTrack('support_form_submit', { form_type: String(formType || 'declaration').slice(0, 40) });
    },
    trackDonationComplete: function (verifiedConfirmation) {
      if (!verifiedConfirmation || verifiedConfirmation.verified !== true) return false;
      return ccTrack('donation_complete', {
        verified_payment: true,
        method: String(verifiedConfirmation.method || 'online').slice(0, 40)
      });
    },

    // Wewnętrzny pomocnik do symulacji kroku czasu zaangażowania w testach
    _advanceLessonEngagement: function (seconds, scrollPct) {
      if (typeof seconds === 'number' && seconds > 0) lessonState.engagedSeconds += seconds;
      if (typeof scrollPct === 'number' && scrollPct > lessonState.maxScrollPct) {
        lessonState.maxScrollPct = scrollPct;
      }
      if (lessonState.maxScrollPct >= 15 && !lessonState.started) {
        markLessonStart('scroll_15pct');
      }
      if (lessonState.maxScrollPct >= 80 && lessonState.engagedSeconds >= 30 && !lessonState.completed) {
        markLessonComplete('scroll_80pct_and_30s', 100);
      }
    },
    _attachMediaListeners: attachMediaListeners,
    _tickMediaProgress: tickMediaProgress,
    _getMediaState: function (el) { return mediaWatchers ? mediaWatchers.get(el) : null; }
  };
})();
