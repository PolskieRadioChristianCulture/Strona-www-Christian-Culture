// ============================================================================
// CHRISTIAN CULTURE MISSION CALENDAR v1.1 — Frontend Application (/ccMC/app.js)
// Adres: https://polskieradio.cc/ccMC | API: /api/mission-calendar/*
// ============================================================================

import '../js/cc-ramowka.js';

const STATUS_META = {
  todo: { code: 'todo', color: '#2563EB', icon: '○', label: 'Do wykonania' },
  in_progress: { code: 'in_progress', color: '#D97706', icon: '◐', label: 'W trakcie' },
  done: { code: 'done', color: '#15803D', icon: '✓', label: 'Zrealizowane' },
  not_done: { code: 'not_done', color: '#B91C1C', icon: '!', label: 'Niezrealizowane' },
};

const AREA_COLORS = {
  mission: '#a78bfa',
  radio: '#38bdf8',
  media: '#f59e0b',
  social: '#fb7185',
  agents: '#8b5cf6',
  oa: '#C4A35A',
  automation: '#10b981',
  tech: '#60a5fa',
  people: '#f472b6',
  guardian: '#94a3b8',
};

const PRIO_LABELS = { 1: 'P0', 2: 'P1', 3: 'P2', 4: 'P3' };

const CANONICAL_MISSION_ROUTINES = [
  { id: 'rt_dzj_morning', time: '06:00', freq: 'Codziennie', agent: 'Joshua', title: 'Rozważania DZJ & Strony WWW', area: 'mission', desc: 'Publikacja porannego rozważania "Dobrze, że jesteś" (Firebase/WWW) + SMS do Bartka' },
  { id: 'rt_kc_daily', time: '06:30', freq: 'Codziennie', agent: 'Antigravity', title: 'Akademia Biblijna Kurs Codzienny', area: 'mission', desc: 'Publikacja lekcji Kursu Codziennego, aktualizacja 2 przycisków Hero CTA i Clean URLs' },
  { id: 'rt_nazir_whatsapp', time: '07:00', freq: 'Codziennie', agent: 'Joshua', title: 'Grupa Nazira WhatsApp (3 wiadomości)', area: 'social', desc: 'Priorytetowa wysyłka 3 wersji rozważania: Poranna TTS, WWW na cały dzień, Wieczorna SMS' },
  { id: 'rt_wa_am_roundrobin', time: '10:00', freq: 'Codziennie', agent: 'Joshua', title: 'WhatsApp Dystrybucja poranna (FIFO)', area: 'social', desc: 'Wysyłka treści WWW rozważania co godzinę do 2 grup rotacji z zabezpieczeniem daty' },
  { id: 'rt_biblia_audio_mastering', time: '12:00', freq: 'Codziennie', agent: 'CCStudio', title: 'Biblia Audio DAW Mastering (-16 LUFS)', area: 'radio', desc: 'Automatyczny mastering i publikacja odcinków Biblii Audio na polskieradio.cc/biblia-audio' },
  { id: 'rt_sds_video_factory', time: '14:00', freq: 'Codziennie', agent: 'Visual Director', title: 'Fabryka Wideo 4K & Shorts YouTube SDS', area: 'media', desc: 'Reżyseria wizualna, miniatury 16:9, formaty 9:16 i montaż wykładów Apokalipsy' },
  { id: 'rt_wa_pm_roundrobin', time: '16:00', freq: 'Codziennie', agent: 'Joshua', title: 'WhatsApp Dystrybucja popołudniowa (FIFO)', area: 'social', desc: 'Popołudniowa runda dystrybucji rozważań WWW na grupy społeczności chrześcijańskiej' },
  { id: 'rt_sms_evening', time: '19:00', freq: 'Codziennie', agent: 'Joshua / Bartek', title: 'Wieczorna subskrypcja SMS', area: 'social', desc: 'Wieczorna wysyłka osobistej subskrypcji SMS z błogosławieństwem na zakończenie dnia' },
  { id: 'rt_smcc_guard_audit', time: '21:00', freq: 'Codziennie', agent: 'Strażnik SMCC', title: 'Audyt Jakości Kodu Zero-QA & Raport JOMA', area: 'guardian', desc: 'Pancerny audyt 10 reguł, testy regresji, touch targets 44px i aktualizacja pamięci JOMA' },
  { id: 'rt_sabbath_eve', time: 'Pt 17:30', freq: 'Co piątek', agent: 'Antigravity', title: 'Rozpoczęcie Sabatu & Audycja „Bądź Blisko”', area: 'radio', desc: 'Uroczyste powitanie Sabatu, playlista chwały i transmisja audycji modlitewnej' },
  { id: 'rt_sabbath_live', time: 'Sob 10:00', freq: 'Co sobota', agent: 'Joshua', title: 'Nabożeństwo Sabatowe LIVE OBS Studio', area: 'tech', desc: 'Emisja sygnału LIVE stream-scene.html dla retransmisji radiowej i kanałów wideo' },
  { id: 'rt_weekly_briefing', time: 'Pon 09:00', freq: 'Co poniedziałek', agent: 'Noemi @077', title: 'Strategiczna Odprawa Tygodniowa Federacji @777', area: 'oa', desc: 'Koordynacja 21 kolegiów agentów, weryfikacja celów misyjnych i bilans tygodnia' },
];

const state = {
  user: null,
  csrfToken: '',
  bearerToken: '',
  events: [],
  rawEvents: [],
  agents: [],
  audit: [],
  module: 'clock', // 'clock' | 'teraz' | 'calendar' | 'settings'
  view: 'today',
  category: 'all',
  statusFilter: 'all',
  assigneeFilter: 'all',
  searchQuery: '',
  anchorDate: new Date(),
  editingEvent: null,
  nlDraft: null,
  undoAction: null,
  undoTimer: null,
  error: '',
  notice: '',
  mobileSidebarOpen: false,
  theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('cc_mc_theme') : null) || 'dark',
  isConnecting: false,
  terazFilter: false,
  clockCity: '52.2297,21.0122',
  clockShowMore: false,
  clockDrawerOpen: false, // Panel boczny ustawień w prawym górnym rogu
  clockIdleHidden: false, // Wygaszacz po 5 sekundach: ukrywa wszystko poza zegarem i paskiem TERAZ
  clockIdleTimer: null,
  liveSlideIndex: 0, // 0 = Ramówka polskieradio.cc, 1 = Skrót zadania TERAZ (rotacja wygaszacza ekranu)
  liveSlideManualUntil: 0,
  statsScope: 'today', // 'today' (default) | 'all'
  realtimeEngine: true, // Inteligentny Silnik Real-Time: AKTYWNY (Autopilot Misji CC)
  pushSubscribed: true, // Powiadomienia domyślnie włączone (cisza nocna 22:00–06:00)
  gcal: {
    connected: false,
    status: 'disconnected',
    ssoProvider: 'Google SSO LUMINA',
    calendarId: 'cc_mission_dedicated',
    calendarName: 'Christian Culture — Misja',
    syncMode: 'bidirectional',
    calendars: [
      { id: 'cc_mission_dedicated', summary: 'Christian Culture — Misja', dedicated: true },
      { id: 'primary', summary: 'Kalendarz główny Google', primary: true },
    ],
    mappingsCount: 0,
    hasSyncToken: false,
    watchChannel: null,
    lastSyncedAt: null,
    logs: [],
  },
};

export function applyTheme(theme) {
  state.theme = theme === 'light' ? 'light' : 'dark';
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('cc_mc_theme', state.theme);
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.body.setAttribute('data-theme', state.theme);
  }
}
if (typeof document !== 'undefined') {
  applyTheme(state.theme);
}

export const CLOCK_IDLE_HIDE_MS = 5000;

export function isClockIdleHidden() {
  return Boolean(state.clockIdleHidden);
}

export function enterClockIdleMode() {
  if (state.module !== 'clock' || state.clockDrawerOpen) return false;
  state.clockIdleHidden = true;
  if (typeof document !== 'undefined') {
    document.body.classList.add('mc-clock-screensaver-idle');
    const modEl = document.querySelector('.mc-clock-fullscreen');
    if (modEl) modEl.classList.add('is-screensaver-idle');
  }
  return true;
}

export function wakeClockIdleMode({ restartTimer = true } = {}) {
  if (state.clockIdleTimer) {
    clearTimeout(state.clockIdleTimer);
    state.clockIdleTimer = null;
  }
  const wasHidden = Boolean(state.clockIdleHidden);
  state.clockIdleHidden = false;
  if (typeof document !== 'undefined') {
    document.body.classList.remove('mc-clock-screensaver-idle');
    const modEl = document.querySelector('.mc-clock-fullscreen');
    if (modEl) modEl.classList.remove('is-screensaver-idle');
  }
  if (restartTimer && state.module === 'clock' && !state.clockDrawerOpen) {
    scheduleClockIdleTimer();
  }
  return wasHidden;
}

export function scheduleClockIdleTimer() {
  if (state.clockIdleTimer) {
    clearTimeout(state.clockIdleTimer);
    state.clockIdleTimer = null;
  }
  if (state.module !== 'clock' || state.clockDrawerOpen) {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mc-clock-screensaver-idle');
    }
    state.clockIdleHidden = false;
    return null;
  }
  state.clockIdleTimer = setTimeout(() => {
    enterClockIdleMode();
  }, CLOCK_IDLE_HIDE_MS);
  return state.clockIdleTimer;
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (state.csrfToken) headers['X-CC-CSRF'] = state.csrfToken;
  if (state.bearerToken) headers['Authorization'] = `Bearer ${state.bearerToken}`;

  const res = await fetch(`/api/mission-calendar${path}`, {
    credentials: 'same-origin',
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Błąd HTTP ${res.status}`);
    err.status = res.status;
    err.serverEvent = data.serverEvent || null;
    throw err;
  }
  return data;
}

function toWarsawInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
  return formatted.replace(' ', 'T');
}

function formatWarsawShort(isoStr) {
  if (!isoStr) return '';
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoStr));
}

function formatWarsawTimeOnly(isoStr) {
  if (!isoStr) return '';
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(isoStr));
}

export function calculateSunset(date, lat = 52.2297, lng = 21.0122) {
  const rad = Math.PI / 180.0;
  const deg = 180.0 / Math.PI;

  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = (date - startOfYear) + ((startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const lngHour = lng / 15.0;
  const t = dayOfYear + ((18.0 - lngHour) / 24.0);

  const M = (0.9856 * t) - 3.289;

  let L = M + (1.916 * Math.sin(M * rad)) + (0.020 * Math.sin(2 * M * rad)) + 282.634;
  L = (L + 360) % 360;

  let RA = deg * Math.atan(0.91764 * Math.tan(L * rad));
  RA = (RA + 360) % 360;

  const Lquadrant = Math.floor(L / 90.0) * 90.0;
  const RAquadrant = Math.floor(RA / 90.0) * 90.0;
  RA = (RA + (Lquadrant - RAquadrant)) / 15.0;

  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));

  const zenith = 90.8333;
  const cosH = (Math.cos(zenith * rad) - (sinDec * Math.sin(lat * rad))) / (cosDec * Math.cos(lat * rad));

  if (cosH < -1) return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  if (cosH > 1) return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);

  const H = (deg * Math.acos(cosH)) / 15.0;
  const T = H + RA - (0.06571 * t) - 6.622;
  let UT = (T - lngHour) % 24;
  if (UT < 0) UT += 24;

  const hours = Math.floor(UT);
  const minutes = Math.floor((UT - hours) * 60);
  const seconds = Math.floor((((UT - hours) * 60) - minutes) * 60);

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds));
}

const BIBLICAL_DAYS = {
  0: { name: 'Dzień Pierwszy (Biblijna Niedziela)', short: 'Dzień I', isSabbath: false },
  1: { name: 'Dzień Drugi (Biblijny Poniedziałek)', short: 'Dzień II', isSabbath: false },
  2: { name: 'Dzień Trzeci (Biblijny Wtorek)', short: 'Dzień III', isSabbath: false },
  3: { name: 'Dzień Czwarty (Biblijna Środa)', short: 'Dzień IV', isSabbath: false },
  4: { name: 'Dzień Piąty (Biblijny Czwartek)', short: 'Dzień V', isSabbath: false },
  5: { name: 'Dzień Przygotowania (Szósty)', short: 'Dzień VI • Przygotowanie', isSabbath: false },
  6: { name: 'SZABAT • Dzień Siódmy Święty', short: 'SZABAT (Dzień VII)', isSabbath: true },
};

export function getBiblicalTimeState(now = new Date(), lat = 52.2297, lng = 21.0122) {
  const todaySunset = calculateSunset(now, lat, lng);
  const tomorrow = new Date(now.getTime() + 86400_000);
  const tomorrowSunset = calculateSunset(tomorrow, lat, lng);

  const isAfterSunset = now >= todaySunset;
  const secularDay = now.getDay();

  const biblicalDayIndex = isAfterSunset ? (secularDay + 1) % 7 : secularDay;
  const isSabbath = biblicalDayIndex === 6;

  let sabbathTargetDate = null;
  let countdownLabel = '';

  if (isSabbath) {
    countdownLabel = 'Koniec Szabatu (zachód słońca) za:';
    if (secularDay === 5) {
      sabbathTargetDate = tomorrowSunset;
    } else {
      sabbathTargetDate = todaySunset;
    }
  } else {
    countdownLabel = 'Rozpoczęcie Szabatu za:';
    let daysUntilFriday = (5 - secularDay + 7) % 7;
    if (daysUntilFriday === 0 && isAfterSunset) {
      daysUntilFriday = 7;
    }
    const nextFriday = new Date(now.getTime() + daysUntilFriday * 86400_000);
    sabbathTargetDate = calculateSunset(nextFriday, lat, lng);
  }

  return {
    todaySunset,
    tomorrowSunset,
    isAfterSunset,
    biblicalDayIndex,
    biblicalDay: BIBLICAL_DAYS[biblicalDayIndex],
    isSabbath,
    sabbathTargetDate,
    countdownLabel,
  };
}

export function formatCountdown(diffMs) {
  if (diffMs < 0) diffMs = 0;
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad2 = (n) => String(n).padStart(2, '0');
  if (days > 0) {
    return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

export function getTickSpatialProps(i, currentSecond) {
  const isFiveMin = i % 5 === 0;
  const isCardinal = i % 15 === 0;
  const baseLength = isCardinal ? 24 : isFiveMin ? 17 : 9;
  const baseWidth = isCardinal ? 3.6 : isFiveMin ? 2.6 : 1.3;
  const baseOpacity = isCardinal ? 1.0 : isFiveMin ? 0.9 : 0.42;

  const diff = (currentSecond - i + 60) % 60;
  if (diff === 0) {
    return {
      stroke: '#FF7A00',
      strokeWidth: (baseWidth + 2.6).toFixed(1),
      opacity: '1',
      filter: 'drop-shadow(0 0 10px #FF7A00) drop-shadow(0 0 4px #FFFFFF)',
      extraOuter: 4,
    };
  }
  if (diff === 1) {
    return {
      stroke: '#FF9838',
      strokeWidth: (baseWidth + 1.5).toFixed(1),
      opacity: '0.95',
      filter: 'drop-shadow(0 0 7px rgba(255, 122, 0, 0.8))',
      extraOuter: 2.5,
    };
  }
  if (diff === 2) {
    return {
      stroke: '#E2CC9A',
      strokeWidth: (baseWidth + 0.8).toFixed(1),
      opacity: '0.85',
      filter: 'drop-shadow(0 0 5px rgba(196, 163, 90, 0.65))',
      extraOuter: 1.2,
    };
  }
  if (diff === 3 || diff === 4) {
    return {
      stroke: '#C4A35A',
      strokeWidth: (baseWidth + 0.3).toFixed(1),
      opacity: '0.72',
      filter: 'none',
      extraOuter: 0.5,
    };
  }
  return {
    stroke: '#FFFFFF',
    strokeWidth: String(baseWidth),
    opacity: String(baseOpacity),
    filter: 'none',
    extraOuter: 0,
    baseLength,
  };
}

export function renderBiblicalClockDialSvg(currentSecond = 0) {
  const TICK_COUNT = 60;
  const CENTER = 250;
  const RADIUS = 226;
  let lines = '';

  for (let i = 0; i < TICK_COUNT; i++) {
    const isFiveMin = i % 5 === 0;
    const isCardinal = i % 15 === 0;
    const length = isCardinal ? 24 : isFiveMin ? 17 : 9;
    const sp = getTickSpatialProps(i, currentSecond);

    const angle = (i * 6) * (Math.PI / 180);
    const x1 = (CENTER + (RADIUS - length) * Math.cos(angle)).toFixed(1);
    const y1 = (CENTER + (RADIUS - length) * Math.sin(angle)).toFixed(1);
    const x2 = (CENTER + (RADIUS + (sp.extraOuter || 0)) * Math.cos(angle)).toFixed(1);
    const y2 = (CENTER + (RADIUS + (sp.extraOuter || 0)) * Math.sin(angle)).toFixed(1);

    const filterAttr = sp.filter && sp.filter !== 'none' ? `style="filter:${sp.filter};"` : '';

    lines += `<line class="mc-clock-tick" id="mcTick_${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${sp.stroke}" stroke-width="${sp.strokeWidth}" opacity="${sp.opacity}" stroke-linecap="round" ${filterAttr} />`;
  }

  const secDeg = (currentSecond % 60) * 6;
  const RIM_R = 241;
  const RIM_CIRC = (2 * Math.PI * RIM_R).toFixed(2);
  const arcLen = (Number(RIM_CIRC) * 0.16).toFixed(2);
  const gapLen = (Number(RIM_CIRC) - Number(arcLen)).toFixed(2);

  return `
    <svg id="mcClockSvg" class="mc-dial-svg" viewBox="0 0 500 500" aria-hidden="true">
      <defs>
        <filter id="mcSpatialRimGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="5.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="mcRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF7A00" stop-opacity="0.98" />
          <stop offset="55%" stop-color="#E2CC9A" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#C4A35A" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <!-- Przestrzenne obrzeże tarczy (3D Bezel Base + Dynamiczna Głębia Sekundowa) -->
      <circle class="mc-dial-rim-track" cx="250" cy="250" r="${RIM_R}" fill="none" stroke="rgba(196, 163, 90, 0.22)" stroke-width="2.5" />
      <circle class="mc-dial-rim-inner-bevel" cx="250" cy="250" r="233" fill="none" stroke="rgba(255, 255, 255, 0.07)" stroke-width="1" />
      <g id="mcClockRimSpotlight" transform="rotate(${secDeg - 90} 250 250)">
        <circle
          id="mcClockRimArc"
          class="mc-dial-rim-arc"
          cx="250"
          cy="250"
          r="${RIM_R}"
          fill="none"
          stroke="url(#mcRimGrad)"
          stroke-width="4.5"
          stroke-linecap="round"
          stroke-dasharray="${arcLen} ${gapLen}"
          stroke-dashoffset="${(Number(arcLen) * 0.85).toFixed(2)}"
          filter="url(#mcSpatialRimGlow)"
        />
        <circle
          id="mcClockRimHeadDot"
          class="mc-dial-rim-head"
          cx="${250 + RIM_R}"
          cy="250"
          r="4.2"
          fill="#FFFFFF"
          stroke="#FF7A00"
          stroke-width="2.5"
          filter="url(#mcSpatialRimGlow)"
        />
      </g>
      <g transform="rotate(-90 250 250)">${lines}</g>
    </svg>
  `;
}

export function updateClockSpatialRimDom(currentSecond = 0) {
  if (typeof document === 'undefined') return;
  const sec = ((currentSecond % 60) + 60) % 60;
  const secDeg = sec * 6;
  const angleRad = ((secDeg - 90) * Math.PI) / 180;
  const rimX = (Math.cos(angleRad) * 14).toFixed(1);
  const rimY = (Math.sin(angleRad) * 14).toFixed(1);

  const dialEl = document.getElementById('mcBiblicalClockHero');
  if (dialEl) {
    dialEl.style.setProperty('--mc-sec-angle', `${secDeg}deg`);
    dialEl.style.setProperty('--mc-rim-x', `${rimX}px`);
    dialEl.style.setProperty('--mc-rim-y', `${rimY}px`);
    dialEl.classList.remove('is-sec-pulse');
    void dialEl.offsetWidth;
    dialEl.classList.add('is-sec-pulse');
  }

  const spotlight = document.getElementById('mcClockRimSpotlight');
  if (spotlight) {
    spotlight.setAttribute('transform', `rotate(${secDeg - 90} 250 250)`);
  }

  const CENTER = 250;
  const RADIUS = 226;
  for (let offset = 0; offset <= 6; offset++) {
    const idx = (sec - offset + 60) % 60;
    const tickEl = document.getElementById('mcTick_' + idx);
    if (!tickEl) continue;
    const isFiveMin = idx % 5 === 0;
    const isCardinal = idx % 15 === 0;
    const length = isCardinal ? 24 : isFiveMin ? 17 : 9;
    const sp = getTickSpatialProps(idx, sec);
    const angle = (idx * 6) * (Math.PI / 180);
    const x2 = (CENTER + (RADIUS + (sp.extraOuter || 0)) * Math.cos(angle)).toFixed(1);
    const y2 = (CENTER + (RADIUS + (sp.extraOuter || 0)) * Math.sin(angle)).toFixed(1);

    tickEl.setAttribute('x2', x2);
    tickEl.setAttribute('y2', y2);
    tickEl.setAttribute('stroke', sp.stroke);
    tickEl.setAttribute('stroke-width', sp.strokeWidth);
    tickEl.setAttribute('opacity', sp.opacity);
    tickEl.style.filter = sp.filter;
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function exchangeTokenAndEnter(authUser) {
  try {
    const idToken = await authUser.getIdToken();
    state.bearerToken = idToken;
    const sessionRes = await apiRequest('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    if (sessionRes && sessionRes.user) {
      state.user = sessionRes.user;
      state.csrfToken = sessionRes.csrfToken || '';
      state.error = '';
      await refreshData();
      render();
      return true;
    }
  } catch (err) {
    console.warn('Session exchange error:', err);
    if (err.status === 403) {
      state.error = 'Brak uprawnień Administratora dla konta: ' + (authUser.email || '');
      render();
    }
  }
  return false;
}

async function tryLuminaBridgeSession() {
  try {
    let authUser = null;
    const luminaDb = await import('/lumina-db.js?v=20261107_l1').catch(() => null);
    if (luminaDb) {
      await luminaDb.ensureDbReady().catch(() => null);
      authUser = await luminaDb.waitForAuthReady(3500).catch(() => null);
      if (!authUser && typeof luminaDb.getCurrentUser === 'function') {
        const u = luminaDb.getCurrentUser();
        if (u && typeof u.getIdToken === 'function') authUser = u;
      }
      if (!authUser && typeof luminaDb.getFirebaseAuthUser === 'function') {
        const u = luminaDb.getFirebaseAuthUser();
        if (u && typeof u.getIdToken === 'function') authUser = u;
      }
    }
    if (!authUser && window.firebase?.auth) {
      const u = window.firebase.auth().currentUser;
      if (u && typeof u.getIdToken === 'function') authUser = u;
    }
    if (!authUser && window.firebaseAuth?.currentUser) {
      const u = window.firebaseAuth.currentUser;
      if (u && typeof u.getIdToken === 'function') authUser = u;
    }

    if (authUser && typeof authUser.getIdToken === 'function') {
      return await exchangeTokenAndEnter(authUser);
    }
  } catch (e) {
    console.warn('Bridge check notice:', e);
  }
  return false;
}

async function loadInitialSession() {
  applyTheme(state.theme);

  try {
    const me = await apiRequest('/me');
    if (me.authenticated && me.user) {
      state.user = me.user;
      state.csrfToken = me.csrfToken || '';
      await refreshData();
      render();
      return;
    }
  } catch (e) {
    if (e.status === 403) state.error = e.message;
  }

  // Jeśli użytkownik był zalogowany w portalu LUMINA, pokaż elegancki stan weryfikacji
  const hasLuminaStorage = !!localStorage.getItem('lumina_current_user') || localStorage.getItem('lumina_user_session') === 'active';
  if (hasLuminaStorage && !state.user) {
    state.isConnecting = true;
    render();
  }

  // Automatyczne rozpoznanie i mostkowanie aktywnej sesji Google LUMINA
  try {
    const luminaDb = await import('/lumina-db.js?v=20261107_v3').catch(() => null);
    if (luminaDb) {
      await luminaDb.ensureDbReady().catch(() => null);
      if (typeof luminaDb.onAuthChange === 'function') {
        luminaDb.onAuthChange(async (user) => {
          if (user && typeof user.getIdToken === 'function' && !state.user) {
            await exchangeTokenAndEnter(user);
          }
        });
      }
      const authUser = await luminaDb.waitForAuthReady(3500).catch(() => null);
      if (authUser && typeof authUser.getIdToken === 'function' && !state.user) {
        const entered = await exchangeTokenAndEnter(authUser);
        if (entered) return;
      }
    }
  } catch (bridgeErr) {
    console.warn('Bridge init note:', bridgeErr);
  }

  state.isConnecting = false;
  render();
}

export function applyRealtimeEngine(events, now = new Date()) {
  const nowMs = now.getTime();
  return events.map((ev) => {
    if (ev.is_override && ev.status) {
      return ev;
    }

    const startMs = Date.parse(ev.starts_at);
    const endMs = ev.ends_at ? Date.parse(ev.ends_at) : (startMs + 1800_000);
    const isCurrentNow = Boolean(startMs <= nowMs && nowMs < endMs);

    let status = ev.status;
    let autoResolved = false;

    if (ev.rrule || ev.occurrence_id || ev.series_id) {
      if (startMs <= nowMs && nowMs < endMs) {
        status = 'in_progress';
        autoResolved = true;
      } else if (nowMs >= endMs) {
        status = 'done';
        autoResolved = true;
      } else {
        status = 'todo';
      }
    } else {
      if (status === 'todo' && startMs <= nowMs && nowMs < endMs) {
        status = 'in_progress';
        autoResolved = true;
      }
    }

    const statusMeta = STATUS_META[status] || STATUS_META.todo;
    const isOverdue = Boolean(!autoResolved && endMs < nowMs && status !== 'done' && status !== 'not_done');

    return {
      ...ev,
      status,
      status_meta: statusMeta,
      is_current_now: isCurrentNow,
      overdue: isOverdue,
      auto_resolved: autoResolved,
    };
  });
}

async function refreshData() {
  try {
    const from = new Date(state.anchorDate.getTime() - 35 * 86400_000).toISOString();
    const to = new Date(state.anchorDate.getTime() + 65 * 86400_000).toISOString();
    const [evRes, agRes, audRes, gcalRes] = await Promise.all([
      apiRequest(`/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&expand=true`),
      apiRequest('/agents').catch(() => ({ agents: [] })),
      apiRequest('/audit').catch(() => ({ audit: [] })),
      apiRequest('/gcal/status').catch(() => null),
    ]);
    state.rawEvents = evRes.events || [];
    state.events = state.realtimeEngine ? applyRealtimeEngine(state.rawEvents, new Date()) : state.rawEvents;
    state.agents = agRes.agents || [];
    state.audit = audRes.audit || [];
    if (gcalRes) {
      state.gcal = { ...state.gcal, ...gcalRes };
    }
  } catch (e) {
    state.error = e.message;
  }
}

function setUndoAction(label, revertFn) {
  if (state.undoTimer) clearTimeout(state.undoTimer);
  state.undoAction = { label, revertFn };
  state.undoTimer = setTimeout(() => {
    state.undoAction = null;
    render();
  }, 10000);
  render();
}

async function moveOrResizeEvent(ev, newStartIso, newEndIso, scopeChoice = null) {
  const prevStart = ev.starts_at;
  const prevEnd = ev.ends_at;
  const targetId = ev.series_id || ev.id;

  // Jeżeli to wystąpienie serii cyklicznej, spytaj czy zmienić tylko to wystąpienie czy całą serię
  if (ev.rrule && ev.occurrence_id && !scopeChoice) {
    const onlySingle = window.confirm(
      'To jest zadanie cykliczne.\nKliknij OK, aby przesunąć TYLKO TO WYSTĄPIENIE.\nKliknij Anuluj, aby przesunąć CAŁĄ SERIĘ.'
    );
    scopeChoice = onlySingle ? 'single' : 'series';
  }

  try {
    if (scopeChoice === 'single' && ev.occurrence_id) {
      await apiRequest(`/events/${encodeURIComponent(targetId)}/occurrences/${encodeURIComponent(ev.occurrence_id)}/override`, {
        method: 'POST',
        body: JSON.stringify({
          original_start: ev.original_start || prevStart,
          starts_at: newStartIso,
          ends_at: newEndIso,
        }),
      });
    } else {
      await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          starts_at: newStartIso,
          ends_at: newEndIso,
          version: ev.version,
        }),
      });
    }
    await refreshData();
    setUndoAction(`Przesunięto „${ev.title}”`, async () => {
      await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          starts_at: prevStart,
          ends_at: prevEnd,
          version: (ev.version || 1) + 1,
        }),
      });
      await refreshData();
      state.undoAction = null;
      render();
    });
  } catch (err) {
    state.error = err.status === 409
      ? `Konflikt edycji (409): zadanie zostało zmienione na serwerze. Przywrócono pozycję.`
      : `Nie udało się zapisać zmiany (${err.message}). Przywrócono pozycję.`;
    await refreshData();
    render();
  }
}

async function enableWebPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Przeglądarka nie obsługuje Web Push.');
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('Nie przyznano zgody na powiadomienia.');
    }
    const reg = await navigator.serviceWorker.register('/ccMC/sw-ccmc.js', { scope: '/ccMC/' });
    const { key } = await apiRequest('/push/public-key');
    const b64 = key.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
    const applicationServerKey = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    await apiRequest('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        ...(sub.toJSON ? sub.toJSON() : sub),
        quiet_hours_start: '22:00',
        quiet_hours_end: '06:00',
      }),
    });
    state.notice = 'Powiadomienia Web Push zostały aktywowane (cisza nocna 22:00–06:00).';
    state.pushSubscribed = true;
    render();
  } catch (err) {
    state.error = err.message;
    render();
  }
}

function getFilteredEvents() {
  const currentList = state.realtimeEngine
    ? (state.rawEvents && state.rawEvents.length ? applyRealtimeEngine(state.rawEvents, new Date()) : applyRealtimeEngine(state.events, new Date()))
    : state.events;
  return currentList.filter((ev) => {
    if (state.category !== 'all' && ev.category !== state.category) return false;
    if (state.statusFilter !== 'all' && ev.status !== state.statusFilter) return false;
    if (state.assigneeFilter !== 'all' && (ev.assigned_to || '') !== state.assigneeFilter) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const hay = `${ev.title} ${ev.description || ''} ${ev.assigned_to || ''} ${ev.project_id || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderEventTileHtml(ev) {
  const st = STATUS_META[ev.status] || STATUS_META.todo;
  const areaColor = AREA_COLORS[ev.category] || '#C4A35A';
  const prio = PRIO_LABELS[ev.priority] || 'P1';
  const keyId = escapeHtml(ev.occurrence_id || ev.id);

  return `
    <article
      class="mc-event-tile"
      draggable="true"
      tabindex="0"
      data-event-key="${keyId}"
      data-event-id="${escapeHtml(ev.id)}"
      style="background:${st.color}; border-left-color:${areaColor};"
      aria-label="${escapeHtml(`${st.label}: ${ev.title}, ${formatWarsawShort(ev.starts_at)}`)}"
    >
      <div class="mc-event-meta">
        <span title="Status: ${escapeHtml(st.label)}">${st.icon} ${escapeHtml(st.label)}</span>
        <span class="mc-prio-badge">${prio}</span>
        ${ev.gcal_synced || ev.source === 'gcal' || ev.gcal_event_id ? '<span class="mc-gcal-badge" title="Zsynchronizowano z Google Calendar (Christian Culture — Misja)">📅 GCal</span>' : ''}
        ${ev.overdue ? '<span class="mc-overdue-badge">PO TERMINIE</span>' : ''}
        ${ev.review_state === 'awaiting_review' ? '<span class="mc-overdue-badge">DO AKCEPTACJI</span>' : ''}
        ${ev.rrule ? '<span title="Zadanie cykliczne">↻</span>' : ''}
      </div>
      <strong>${escapeHtml(ev.title)}</strong>
      <small>${escapeHtml(formatWarsawShort(ev.starts_at))} ${ev.assigned_to ? '· ' + escapeHtml(ev.assigned_to) : ''}</small>
      <div class="mc-event-meta">
        <button type="button" class="mc-tile-action" data-action="edit" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;">Edytuj</button>
        <button type="button" class="mc-tile-action" data-action="shift-plus" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;" title="Przesuń o +30 min">+30m</button>
        <button type="button" class="mc-tile-action" data-action="extend" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;" title="Wydłuż o +30 min">↕ +30m</button>
      </div>
    </article>
  `;
}

export function renderSettingsHtml() {
  const isLight = state.theme === 'light';
  const gcal = state.gcal || {};
  const gcalConnected = Boolean(gcal.connected);
  const gcalMode = gcal.syncMode || 'bidirectional';
  const gcalCalendars = Array.isArray(gcal.calendars) && gcal.calendars.length > 0
    ? gcal.calendars
    : [
        { id: 'cc_mission_dedicated', summary: 'Christian Culture — Misja', dedicated: true },
        { id: 'primary', summary: 'Kalendarz główny Google', primary: true },
      ];
  const gcalLogs = Array.isArray(gcal.logs) ? gcal.logs.slice(0, 8) : [];

  return `
    <div class="mc-settings-panel">
      <!-- Sekcja 1: Integracja Google Calendar (Dwukierunkowa synchronizacja ZERO COST) -->
      <div class="mc-settings-card mc-gcal-settings-card" id="mcSettingsGcalCard">
        <div class="mc-gcal-header-row">
          <div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
              <h3 style="margin:0;">📅 Google Calendar — Synchronizacja Misji (ZERO COST)</h3>
              <span class="mc-gcal-status-pill ${gcalConnected ? 'is-connected' : 'is-disconnected'}" id="mcGcalStatusBadge">
                ${gcalConnected ? '● Połączono z Google Calendar' : '○ Niepołączono'}
              </span>
            </div>
            <p style="margin:0;">Dwukierunkowa synchronizacja <strong>Christian Culture Mission Calendar</strong> z dedykowanym kalendarzem <strong>„Christian Culture — Misja”</strong> przez istniejące <strong>Google SSO LUMINA</strong>.</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            ${
              gcalConnected
                ? `
                  <button type="button" id="btnSyncGcalNow" class="mc-btn-cta" style="background:#FF7A00;color:#fff;">
                    🔄 Synchronizuj teraz
                  </button>
                  <button type="button" id="btnDisconnectGcal" class="mc-quick-btn" style="border-color:#ef4444;color:#fca5a5;">
                    Odłącz Google
                  </button>
                `
                : `
                  <button type="button" id="btnConnectGcal" class="mc-btn-cta" style="background:#FF7A00;color:#fff;">
                    🔗 Połącz Google Calendar (SSO LUMINA)
                  </button>
                `
            }
          </div>
        </div>

        <div class="mc-gcal-grid">
          <!-- Wybór lub utworzenie dedykowanego kalendarza -->
          <div class="mc-gcal-box">
            <label for="mcGcalCalendarSelect" class="mc-gcal-box-label">Dedykowany Kalendarz Google</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;">
              <select id="mcGcalCalendarSelect" class="mc-gcal-select" aria-label="Wybierz kalendarz Google do synchronizacji">
                ${gcalCalendars
                  .map(
                    (c) =>
                      `<option value="${escapeHtml(c.id)}" ${(gcal.calendarId || 'cc_mission_dedicated') === c.id ? 'selected' : ''}>${escapeHtml(c.summary)}${c.dedicated ? ' (Dedykowany)' : ''}</option>`
                  )
                  .join('')}
              </select>
              <button type="button" id="btnEnsureDedicatedGcal" class="mc-btn-gold" title="Utwórz lub wskaż dedykowany kalendarz Christian Culture — Misja">
                ✨ Utwórz / Wskaż „Christian Culture — Misja”
              </button>
            </div>
            <small class="mc-gcal-box-hint">
              Aktywny kalendarz: <strong style="color:var(--mc-gold-light);">${escapeHtml(gcal.calendarName || 'Christian Culture — Misja')}</strong>
              • Zmapowane zadania (ccMC/Vikunja ↔ GCal): <strong>${Number(gcal.mappingsCount || 0)}</strong>
            </small>
          </div>

          <!-- 3 Tryby Synchronizacji -->
          <div class="mc-gcal-box">
            <span class="mc-gcal-box-label">Tryb Synchronizacji (3 warianty)</span>
            <div class="mc-gcal-modes-group" role="group" aria-label="Tryb synchronizacji Google Calendar">
              <button type="button" class="mc-gcal-mode-btn ${gcalMode === 'bidirectional' ? 'is-active' : ''}" data-gcal-sync-mode="bidirectional">
                <strong>⇄ Dwukierunkowy</strong>
                <small>ccMC ⇄ Google Calendar</small>
              </button>
              <button type="button" class="mc-gcal-mode-btn ${gcalMode === 'export_only' ? 'is-active' : ''}" data-gcal-sync-mode="export_only">
                <strong>→ Eksport do Google</strong>
                <small>ccMC → Google Calendar</small>
              </button>
              <button type="button" class="mc-gcal-mode-btn ${gcalMode === 'import_only' ? 'is-active' : ''}" data-gcal-sync-mode="import_only">
                <strong>← Import z Google</strong>
                <small>Google Calendar → ccMC</small>
              </button>
            </div>
          </div>
        </div>

        <!-- Reguły Nadrzędności ccMC, Incremental Sync & Bezpieczeństwo Tokenów -->
        <div class="mc-gcal-meta-strip">
          <div class="mc-gcal-meta-item">
            <span>🔒 <strong>Bezpieczeństwo OAuth:</strong> Tokeny zaszyfrowane AES-GCM po stronie serwera (brak tokenów w przeglądarce)</span>
          </div>
          <div class="mc-gcal-meta-item">
            <span>👑 <strong>Dane nadrzędne ccMC:</strong> Statusy zadań, uprawnienia agentów @777/@OA i wyniki pracy są chronione</span>
          </div>
          <div class="mc-gcal-meta-item">
            <span>📡 <strong>Incremental Sync & Webhook:</strong> ${gcal.hasSyncToken ? `Aktywny syncToken (${escapeHtml(gcal.syncTokenCursor || 'OK')})` : 'Gotowy do synchronizacji przyrostowej'}</span>
            ${gcalConnected ? `<button type="button" id="btnRenewGcalWatch" class="mc-gcal-inline-btn">Odnów kanał Push</button>` : ''}
          </div>
        </div>

        ${
          gcalLogs.length > 0
            ? `
              <div class="mc-gcal-logs-wrap" id="mcGcalLogsList">
                <small class="mc-gcal-box-label" style="display:block;margin-bottom:6px;">Ostatnie operacje synchronizacji Google Calendar:</small>
                <div class="mc-gcal-logs-table">
                  ${gcalLogs
                    .map(
                      (l) => `
                        <div class="mc-gcal-log-row">
                          <span class="mc-gcal-log-dir">${escapeHtml(l.direction)}</span>
                          <strong class="mc-gcal-log-action">${escapeHtml(l.action)}</strong>
                          <span class="mc-gcal-log-meta">${escapeHtml(l.event_id || l.gcal_event_id || l.mode || '')}</span>
                          <time class="mc-gcal-log-time">${escapeHtml(formatWarsawShort(l.created_at))}</time>
                        </div>
                      `
                    )
                    .join('')}
                </div>
              </div>
            `
            : ''
        }
      </div>

      <div class="mc-settings-card">
        <h3>🎨 Wygląd i Tryb Aplikacji (Motyw)</h3>
        <p>Wybierz preferowany tryb graficzny. Ustawienie jest zapisywane w Twojej przeglądarce i stosowane natychmiastowo.</p>
        
        <div class="mc-theme-selector-grid">
          <div class="mc-theme-card ${isLight ? 'is-active' : ''}" id="btnThemeLight" role="button" tabindex="0" aria-label="Wybierz tryb jasny (tło białe)">
            <div class="mc-theme-preview-box mc-theme-preview-light">
              <span>☀️ Tło Białe (#FFFFFF)</span>
            </div>
            <div>
              <strong style="color:var(--mc-text-contrast);display:block;margin-bottom:4px;">Tryb Jasny (Biały)</strong>
              <small style="color:var(--mc-muted);">Czysto białe tło (#FFFFFF), ciemna typografia, pełny kontrast WCAG 2.2 AA.</small>
            </div>
            ${isLight ? '<span style="color:#15803D;font-weight:700;font-size:12px;">✓ Aktywny motyw</span>' : '<button type="button" class="mc-btn-gold" style="width:100%;margin-top:6px;">Ustaw tryb jasny</button>'}
          </div>

          <div class="mc-theme-card ${!isLight ? 'is-active' : ''}" id="btnThemeDark" role="button" tabindex="0" aria-label="Wybierz tryb ciemny (tło czarne)">
            <div class="mc-theme-preview-box mc-theme-preview-dark">
              <span>🌙 Tło Czarne (#000000)</span>
            </div>
            <div>
              <strong style="color:var(--mc-text-contrast);display:block;margin-bottom:4px;">Tryb Ciemny (Czarny)</strong>
              <small style="color:var(--mc-muted);">Czysto czarne tło (#000000), aksamitny minimalizm, Champagne Gold (#C4A35A).</small>
            </div>
            ${!isLight ? '<span style="color:#C4A35A;font-weight:700;font-size:12px;">✓ Aktywny motyw</span>' : '<button type="button" class="mc-btn-gold" style="width:100%;margin-top:6px;">Ustaw tryb ciemny</button>'}
          </div>
        </div>
      </div>

      <div class="mc-settings-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h3>⚡ Zaplanowane Rutyny Misji (/automation)</h3>
            <p>Zarejestrowane w chmurze Cloudflare D1 kanoniczne procesy misyjne Christian Culture @777 / @OA.</p>
          </div>
          <button type="button" id="btnSyncRoutines" class="mc-btn-cta">
            ⚡ Zsynchronizuj Rutyny w Kalendarzu
          </button>
        </div>

        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(16,185,129,0.18);border:1px solid #10b981;color:#10b981;font-weight:700;font-size:13px;width:fit-content;">
          <span>●</span> 12 aktywnych rutyn produkcyjnych (/automation)
        </div>

        <div class="mc-routines-grid">
          ${CANONICAL_MISSION_ROUTINES.map((r) => `
            <div class="mc-routine-row">
              <div class="mc-routine-info">
                <div class="mc-routine-title">
                  <span class="mc-routine-time">${escapeHtml(r.time)}</span>
                  <span>${escapeHtml(r.title)}</span>
                </div>
                <div class="mc-routine-desc">${escapeHtml(r.desc)}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:12px;color:var(--mc-muted);">Agent: <strong>${escapeHtml(r.agent)}</strong></span>
                <span style="font-size:11px;padding:2px 8px;border-radius:6px;background:${AREA_COLORS[r.area] || '#60a5fa'}22;color:${AREA_COLORS[r.area] || '#60a5fa'};font-weight:700;">${escapeHtml(r.area.toUpperCase())}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mc-settings-card" id="mcSettingsPushCard">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h3>🔔 Powiadomienia Web Push & Cisza Nocna</h3>
            <p>Powiadomienia Kalendarza Misji są <strong>domyślnie włączone</strong> dla Administratora. Chronią misję w czasie rzeczywistym i respektują ciszę nocną.</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <button type="button" id="btnSettingsTogglePush" class="mc-btn-cta" style="background:#FF7A00;color:#fff;">
              ${state.pushSubscribed ? '✓ Powiadomienia Aktywne' : '🔔 Włącz Powiadomienia Push'}
            </button>
          </div>
        </div>

        <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;">
          <div style="background:var(--mc-surface-elevated);padding:14px 16px;border-radius:12px;border:1px solid var(--mc-border);">
            <small style="color:var(--mc-muted);display:block;margin-bottom:4px;font-size:12px;">Cisza Nocna CC LIFE</small>
            <strong style="color:#FF7A00;font-size:18px;">22:00 – 06:00</strong>
            <p style="margin:6px 0 0;font-size:12px;color:var(--mc-muted);line-height:1.4;">Wszystkie powiadomienia są automatycznie wstrzymywane w tych godzinach, aby chronić nocny spoczynek.</p>
          </div>

          <div style="background:var(--mc-surface-elevated);padding:14px 16px;border-radius:12px;border:1px solid var(--mc-border);">
            <small style="color:var(--mc-muted);display:block;margin-bottom:4px;font-size:12px;">Status Systemowy</small>
            <strong style="color:#4ade80;font-size:18px;">DOMYŚLNIE WŁĄCZONE</strong>
            <p style="margin:6px 0 0;font-size:12px;color:var(--mc-muted);line-height:1.4;">Nowe zadania, alerty 15m przed rozpoczęciem, zadania w toku TERAZ, akceptacje agentów @777.</p>
          </div>
        </div>

        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button type="button" id="btnTestPush" class="mc-btn-gold">Przetestuj Powiadomienie Push</button>
        </div>
      </div>

      <div class="mc-settings-card">
        <h3>👤 Konto Administratora & Bezpieczeństwo</h3>
        <p>Zalogowano jako: <strong>${escapeHtml(state.user?.email || 'nazirczarkes@gmail.com')}</strong></p>
        <p>Uprawnienia: <strong>Administrator / Właściciel Misji (@777 / @OA)</strong></p>
        <p>Połączenie: <strong>Google SSO LUMINA (Firebase Auth Token Exchange)</strong></p>
      </div>
    </div>
  `;
}

function renderTodayTileHtml(ev, { isNow, isPast, isNext }) {
  const st = STATUS_META[ev.status] || STATUS_META.todo;
  const areaColor = AREA_COLORS[ev.category] || '#C4A35A';
  const prio = PRIO_LABELS[ev.priority] || 'P1';
  const keyId = escapeHtml(ev.occurrence_id || ev.id);

  const startHour = formatWarsawTimeOnly(ev.starts_at);
  const endHour = ev.ends_at ? formatWarsawTimeOnly(ev.ends_at) : '';

  let timePill = '';
  if (isNow) {
    timePill = `<span class="mc-now-live-pill"><span class="mc-pulse-dot"></span>▶ TRWA TERAZ</span>`;
  } else if (isNext) {
    timePill = `<span class="mc-next-pill">⏱️ NASTĘPNE</span>`;
  } else if (isPast) {
    timePill = `<span class="mc-past-pill">Minęło</span>`;
  }

  const extraClass = isNow ? 'is-current-now' : isPast ? 'is-past-task' : isNext ? 'is-next-upcoming' : '';

  return `
    <article
      class="mc-event-tile mc-today-tile ${extraClass}"
      draggable="true"
      tabindex="0"
      data-event-key="${keyId}"
      data-event-id="${escapeHtml(ev.id)}"
      style="background:${st.color}; border-left-color:${areaColor};"
      aria-label="${escapeHtml(`${isNow ? 'TRWA TERAZ: ' : ''}${st.label}: ${ev.title}, ${startHour}`)}"
    >
      <div class="mc-today-tile-header">
        <div class="mc-today-time-range">
          <span class="mc-today-time-digits">${startHour}${endHour ? ' — ' + endHour : ''}</span>
          ${timePill}
        </div>
        <div class="mc-event-meta" style="margin:0;">
          <span title="Status: ${escapeHtml(st.label)}">${st.icon} ${escapeHtml(st.label)}</span>
          <span class="mc-prio-badge">${prio}</span>
          ${ev.gcal_synced || ev.source === 'gcal' || ev.gcal_event_id ? '<span class="mc-gcal-badge" title="Zsynchronizowano z Google Calendar (Christian Culture — Misja)">📅 GCal</span>' : ''}
          ${ev.overdue ? '<span class="mc-overdue-badge">PO TERMINIE</span>' : ''}
          ${ev.review_state === 'awaiting_review' ? '<span class="mc-overdue-badge">DO AKCEPTACJI</span>' : ''}
          ${ev.rrule ? '<span title="Zadanie cykliczne">↻</span>' : ''}
        </div>
      </div>

      <div class="mc-today-tile-body">
        <strong class="mc-today-tile-title">${escapeHtml(ev.title)}</strong>
        ${ev.assigned_to ? `<div class="mc-today-assigned">⚡ Przypisany Agent: <strong>${escapeHtml(ev.assigned_to)}</strong></div>` : ''}
      </div>

      <div class="mc-today-tile-actions">
        ${
          ev.status !== 'done'
            ? `<button type="button" class="mc-tile-action mc-action-done" data-action="quick-done" data-key="${keyId}" style="min-height:36px;font-weight:700;color:#22c55e;">✓ Wykonane</button>`
            : `<button type="button" class="mc-tile-action" data-action="quick-todo" data-key="${keyId}" style="min-height:36px;color:var(--mc-muted);">↺ Cofnij do zrobienia</button>`
        }
        <button type="button" class="mc-tile-action" data-action="edit" data-key="${keyId}" style="min-height:36px;">Edytuj</button>
        <button type="button" class="mc-tile-action" data-action="shift-plus" data-key="${keyId}" style="min-height:36px;" title="Przesuń o +30 min">+30m</button>
        <button type="button" class="mc-tile-action" data-action="extend" data-key="${keyId}" style="min-height:36px;" title="Wydłuż o +30 min">↕ +30m</button>
      </div>
    </article>
  `;
}

function formatWarsawTimeWithSeconds(date = new Date()) {
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function renderTodayHtml(filtered) {
  const now = new Date();
  const nowTs = now.getTime();

  const [lat, lng] = (state.clockCity || '52.2297,21.0122').split(',').map(Number);
  const bState = getBiblicalTimeState(now, lat, lng);

  const todayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const warsawTimeNowStr = formatWarsawTimeWithSeconds(now);

  const warsawDateTitle = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const todayTasks = filtered
    .filter((e) => e.starts_at && e.starts_at.startsWith(todayIsoPrefix))
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));

  let activeNowEvent = null;
  let nextUpcomingEvent = null;
  let dividerInserted = false;

  for (const ev of todayTasks) {
    const startTs = Date.parse(ev.starts_at);
    const endTs = ev.ends_at ? Date.parse(ev.ends_at) : startTs + 3600_000;
    if (startTs <= nowTs && nowTs < endTs && !activeNowEvent) {
      activeNowEvent = ev;
    } else if (startTs > nowTs && !nextUpcomingEvent) {
      nextUpcomingEvent = ev;
    }
  }

  // Jeśli aktywny jest filtr TERAZ wywołany kliknięciem w zegar
  let tasksToShow = todayTasks;
  if (state.terazFilter) {
    const currentTasks = todayTasks.filter((ev) => {
      const startTs = Date.parse(ev.starts_at);
      const endTs = ev.ends_at ? Date.parse(ev.ends_at) : startTs + 3600_000;
      return startTs <= nowTs && nowTs < endTs;
    });
    if (currentTasks.length > 0) {
      tasksToShow = currentTasks;
    } else if (nextUpcomingEvent) {
      tasksToShow = [nextUpcomingEvent];
    }
  }

  const completedTodayCount = todayTasks.filter((e) => e.status === 'done').length;

  return `
    <div class="mc-today-container" role="region" aria-label="Widok zadań na DZIŚ według aktualnej godziny TERAZ">
      <!-- Minimalistyczny Zegar Biblijny Szabatu (Interaktywny: kliknięcie filtruje zadania TERAZ) -->
      <div class="mc-today-hero">
        <div class="mc-today-hero-clock-col mc-clickable-clock" id="mcBiblicalClockHero" role="button" tabindex="0" title="Zegar Biblijny Szabatu" aria-label="Zegar Biblijny Szabatu">
          <div class="mc-dial-wrapper" id="dial-wrapper">
            ${renderBiblicalClockDialSvg(now.getSeconds())}
            <div class="mc-dial-center">
              <div id="digital-time" class="tabular-clock mc-clock-digits">${warsawTimeNowStr}</div>
              <div class="mc-dial-separator">
                <div class="mc-dial-sep-line"></div>
                <div id="center-dot" class="mc-dial-center-dot"></div>
                <div class="mc-dial-sep-line"></div>
              </div>
              <div id="gregorian-date" class="mc-gregorian-date">${warsawDateTitle.charAt(0).toUpperCase() + warsawDateTitle.slice(1)}</div>
              <div class="mc-biblical-status-wrap">
                <div id="biblical-badge" class="mc-biblical-badge ${bState.isSabbath ? 'is-sabbath' : ''}">
                  <span class="mc-pulse-dot" style="background:#FF7A00;"></span>
                  <span id="biblical-day-name">${bState.isSabbath ? 'SZABAT' : bState.biblicalDay.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mc-today-hero-right">
          <div class="mc-sunset-card">
            <span class="mc-sub-label">Zachód Słońca (Dziś)</span>
            <strong class="mc-sunset-digits" id="sunset-today">${formatWarsawTimeOnly(bState.todaySunset)}</strong>
            <small id="sunset-tomorrow-info" style="color:var(--mc-muted);">Jutro: ${formatWarsawTimeOnly(bState.tomorrowSunset)}</small>
          </div>

          <div class="mc-sabbath-card ${bState.isSabbath ? 'is-sabbath' : ''}">
            <span class="mc-sub-label">${bState.countdownLabel}</span>
            <strong class="mc-sabbath-countdown" id="sabbath-countdown">${formatCountdown(bState.sabbathTargetDate - now)}</strong>
            <small style="color:var(--mc-muted);">${bState.isSabbath ? 'Święty Boży Szabat' : 'do piątkowego zachodu'}</small>
          </div>

          <div class="mc-today-stats-group">
            <div class="mc-today-stats-chip">
              <strong>${todayTasks.length}</strong>
              <span>Zadań na dziś</span>
            </div>
            <div class="mc-today-stats-chip">
              <strong style="color:#22c55e;">${completedTodayCount}</strong>
              <span>Ukończone</span>
            </div>
            <div class="mc-today-stats-chip">
              <strong style="color:var(--mc-gold);">${todayTasks.length - completedTodayCount}</strong>
              <span>Pozostałe</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pasek stanu filtra TERAZ (jeśli włączony przez kliknięcie w zegar) -->
      ${
        state.terazFilter
          ? `<div class="mc-teraz-filter-banner" id="mcTerazFilterBanner">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <span class="mc-pulse-dot" style="background:#FF7A00;width:10px;height:10px;"></span>
                <strong>Wyświetlasz zadania trwające TERAZ (${warsawTimeNowStr.slice(0, 5)})</strong>
                <span style="font-size:12px;opacity:0.8;">(aktywowane kliknięciem w zegar)</span>
              </div>
              <button type="button" id="btnClearTerazFilter" class="mc-btn-gold" style="padding:6px 14px;font-size:12px;">Pokaż wszystkie zadania na dziś</button>
            </div>`
          : ''
      }

      <div class="mc-today-timeline">
        ${
          tasksToShow.length === 0
            ? `<div class="mc-empty-today-card">
                <h3>Brak zadań na ten moment</h3>
                <p>${state.terazFilter ? 'Żadne zaplanowane zadanie nie trwa w tej dokładnej minucie.' : 'Nie masz jeszcze żadnych zadań wpisanych na dzisiejszy dzień.'}</p>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                  ${state.terazFilter ? '<button type="button" id="btnClearTerazFilterEmpty" class="mc-btn-gold">Pokaż cały dzień</button>' : ''}
                  <button type="button" class="mc-btn-cta" onclick="document.getElementById('btnNewTask')?.click()">＋ Dodaj zadanie</button>
                  <button type="button" class="mc-btn-gold" onclick="document.getElementById('btnSyncRoutines')?.click()">⚡ Wgraj 12 rutyn Misji CC</button>
                </div>
              </div>`
            : tasksToShow
                .map((ev) => {
                  const startTs = Date.parse(ev.starts_at);
                  const endTs = ev.ends_at ? Date.parse(ev.ends_at) : startTs + 3600_000;
                  const isNow = startTs <= nowTs && nowTs < endTs;
                  const isPast = endTs <= nowTs;
                  const isNext = ev === nextUpcomingEvent;

                  let output = '';
                  if (!dividerInserted && (isNow || startTs > nowTs)) {
                    dividerInserted = true;
                    output += `
                      <div class="mc-now-divider" id="mcNowTimelineDivider">
                        <span class="mc-now-dot"></span>
                        <span class="mc-now-label">⏱️ AKTUALNA GODZINA (TERAZ: ${warsawTimeNowStr.slice(0, 5)})</span>
                        <span class="mc-now-line"></span>
                      </div>
                    `;
                  }

                  output += renderTodayTileHtml(ev, { isNow, isPast, isNext });
                  return output;
                })
                .join('') +
              (!dividerInserted
                ? `
                  <div class="mc-now-divider" id="mcNowTimelineDivider">
                    <span class="mc-now-dot"></span>
                    <span class="mc-now-label">⏱️ AKTUALNA GODZINA (TERAZ: ${warsawTimeNowStr.slice(0, 5)})</span>
                    <span class="mc-now-line"></span>
                  </div>
                  <div class="mc-today-all-done-note">
                    <span>✓ Wszystkie wcześniejsze zadania na dziś zakończone. Kolejne rutyny zaplanowane na jutro.</span>
                  </div>
                `
                : '')
        }
      </div>
    </div>
  `;
}

export function renderBiblicalClockFullHtml() {
  return renderClockModule();
}

export function getCcRamowkaState(now = new Date()) {
  const g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
  if (g.CC_RAMOWKA && typeof g.CC_RAMOWKA.getScheduleState === 'function') {
    return g.CC_RAMOWKA.getScheduleState(now);
  }
  return {
    title: 'ŚPIEWAJMY PANU — CODZIENNE UWIELBIENIE CCTV24',
    desc: 'Całodobowa rotacja uwielbienia i Słowa Bożego',
    url: 'master',
    timeStart: '09:00',
    timeEnd: '10:00',
    next: { time: '10:00', title: 'APOKALIPSA: KSIĘGA NADZIEI' },
    third: { time: '10:55', title: 'Zjednoczeni za Polskę (Pasmo Południowe)' },
  };
}

export function getCurrentTerazSummary(now = new Date()) {
  const nowTs = now.getTime();
  const allEvents = state.realtimeEngine
    ? (state.rawEvents && state.rawEvents.length ? applyRealtimeEngine(state.rawEvents, now) : applyRealtimeEngine(state.events, now))
    : state.events;

  const todayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const todayTasks = (allEvents || [])
    .filter((ev) => (toWarsawInput(ev.starts_at) || '').startsWith(todayIsoPrefix))
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));

  const currentNowEvent = todayTasks.find((ev) => {
    const s = Date.parse(ev.starts_at);
    const e = ev.ends_at ? Date.parse(ev.ends_at) : s + 3600_000;
    return s <= nowTs && nowTs < e && ev.status !== 'done';
  }) || todayTasks.find((ev) => {
    const s = Date.parse(ev.starts_at);
    const e = ev.ends_at ? Date.parse(ev.ends_at) : s + 3600_000;
    return s <= nowTs && nowTs < e;
  });

  const upcomingList = todayTasks.filter((ev) => Date.parse(ev.starts_at) > nowTs);
  const nextUpcomingEvent = upcomingList[0] || null;
  const secondUpcomingEvent = upcomingList[1] || null;

  const gcalCalendarName = state.gcal?.calendarName || 'Christian Culture — Misja';

  if (currentNowEvent) {
    const startHm = (toWarsawInput(currentNowEvent.starts_at) || '').slice(11, 16);
    const endHm = currentNowEvent.ends_at ? (toWarsawInput(currentNowEvent.ends_at) || '').slice(11, 16) : '';
    const timeRange = endHm ? `${startHm}–${endHm}` : startHm;
    const isGcal = Boolean(currentNowEvent.gcal_synced || currentNowEvent.source === 'gcal' || currentNowEvent.gcal_event_id || state.gcal?.connected);
    const agent = currentNowEvent.assigned_to || (currentNowEvent.source === 'gcal' ? '📅 Google Calendar' : '@OA');

    let nextTask = null;
    if (nextUpcomingEvent) {
      const nStart = (toWarsawInput(nextUpcomingEvent.starts_at) || '').slice(11, 16);
      const nEnd = nextUpcomingEvent.ends_at ? (toWarsawInput(nextUpcomingEvent.ends_at) || '').slice(11, 16) : '';
      nextTask = {
        timeRange: nEnd ? `${nStart}–${nEnd}` : nStart,
        title: nextUpcomingEvent.title,
        agent: nextUpcomingEvent.assigned_to || (nextUpcomingEvent.source === 'gcal' ? '📅 GCal' : '@OA'),
        isGcal: Boolean(nextUpcomingEvent.gcal_synced || nextUpcomingEvent.source === 'gcal' || nextUpcomingEvent.gcal_event_id),
      };
    }

    const nextSub = nextTask
      ? `⏭ NASTĘPNE ZADANIE (${nextTask.timeRange}): ${nextTask.title} • ${nextTask.agent}`
      : `⏭ NASTĘPNE ZADANIE: Kolejna rutyna w harmonogramie dnia (${todayTasks.length} zadań)`;

    return {
      mode: 'active',
      badge: isGcal ? 'TERAZ • GOOGLE CALENDAR & MISJA' : 'TERAZ • ZADANIE MISJI',
      timeRange,
      agent,
      title: currentNowEvent.title,
      sub: nextSub,
      isGcal,
      gcalCalendarName,
      nextTask,
    };
  }

  if (nextUpcomingEvent) {
    const startHm = (toWarsawInput(nextUpcomingEvent.starts_at) || '').slice(11, 16);
    const endHm = nextUpcomingEvent.ends_at ? (toWarsawInput(nextUpcomingEvent.ends_at) || '').slice(11, 16) : '';
    const timeRange = endHm ? `${startHm}–${endHm}` : startHm;
    const isGcal = Boolean(nextUpcomingEvent.gcal_synced || nextUpcomingEvent.source === 'gcal' || nextUpcomingEvent.gcal_event_id || state.gcal?.connected);
    const agent = nextUpcomingEvent.assigned_to || (nextUpcomingEvent.source === 'gcal' ? '📅 Google Calendar' : '@OA');

    let nextTask = null;
    if (secondUpcomingEvent) {
      const sStart = (toWarsawInput(secondUpcomingEvent.starts_at) || '').slice(11, 16);
      nextTask = {
        timeRange: sStart,
        title: secondUpcomingEvent.title,
        agent: secondUpcomingEvent.assigned_to || '@OA',
        isGcal: Boolean(secondUpcomingEvent.gcal_synced || secondUpcomingEvent.source === 'gcal'),
      };
    }

    const nextSub = nextTask
      ? `⏭ NASTĘPNE ZADANIE (${nextTask.timeRange}): ${nextTask.title} • ${nextTask.agent}`
      : `Start o ${startHm} • Przypisano: ${agent}`;

    return {
      mode: 'upcoming',
      badge: 'TERAZ • NASTĘPNE ZADANIE',
      timeRange,
      agent,
      title: nextUpcomingEvent.title,
      sub: nextSub,
      isGcal,
      gcalCalendarName,
      nextTask,
    };
  }

  // Kanoniczny harmonogram rutyn misyjnych CC wg godziny warszawskiej (dla wygaszacza ekranu w studiu)
  const warsawHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw',
      hour: '2-digit',
      hour12: false,
    }).format(now)
  );
  const pad2 = (n) => String(n).padStart(2, '0');
  const isGcal = Boolean(state.gcal?.connected);
  if (warsawHour >= 6 && warsawHour < 8) {
    return {
      mode: 'routine',
      badge: 'TERAZ • RUTYNA MISJI',
      timeRange: '06:00–08:00',
      agent: '@A001',
      title: 'Publikacja Rozważań „Dobrze, że jesteś” (Aplikacje + WWW + SMS)',
      sub: '⏭ NASTĘPNE ZADANIE (08:00): Produkcja i Publikacja Biblia Audio V7 (4K + WWW) • @CCS',
      isGcal,
      gcalCalendarName,
      nextTask: { timeRange: '08:00–09:00', title: 'Produkcja i Publikacja Biblia Audio V7 (4K + WWW)', agent: '@CCS' },
    };
  }
  if (warsawHour === 8) {
    return {
      mode: 'routine',
      badge: 'TERAZ • RUTYNA MISJI',
      timeRange: '08:00–09:00',
      agent: '@CCS',
      title: 'Produkcja i Publikacja Odcinka Biblia Audio V7 (4K UHD + WWW)',
      sub: '⏭ NASTĘPNE ZADANIE (09:00): Kurs Codzienny @Akademia & Audyt Strażnika • @A001',
      isGcal,
      gcalCalendarName,
      nextTask: { timeRange: '09:00–10:00', title: 'Kurs Codzienny @Akademia & Audyt Strażnika', agent: '@A001' },
    };
  }
  if (warsawHour === 9) {
    return {
      mode: 'routine',
      badge: 'TERAZ • ZADANIE MISJI',
      timeRange: '09:00–10:00',
      agent: '@A001',
      title: 'Publikacja Lekcji Kursu Codziennego @Akademia & Audyt Strażnika Kodu',
      sub: '⏭ NASTĘPNE ZADANIE (10:00): Dystrybucja Rozważań WWW na grupy WhatsApp (FIFO) • @Joshua',
      isGcal,
      gcalCalendarName,
      nextTask: { timeRange: '10:00–11:00', title: 'Dystrybucja Rozważań WWW na grupy WhatsApp (FIFO)', agent: '@Joshua' },
    };
  }
  if (warsawHour >= 10 && warsawHour < 18) {
    const nextTitle = warsawHour < 17
      ? 'Kolejna tura dystrybucji WhatsApp & monitoring @777'
      : 'Wieczorna sesja wydawnicza i subskrypcja SMS';
    const nextTime = `${pad2(warsawHour + 1)}:00`;
    return {
      mode: 'routine',
      badge: 'TERAZ • DYSTRYBUCJA MISJI',
      timeRange: `${pad2(warsawHour)}:00–${pad2(warsawHour + 1)}:00`,
      agent: '@Joshua',
      title: 'Rotacyjna Dystrybucja Rozważań WWW na grupy WhatsApp (2 grupy FIFO)',
      sub: `⏭ NASTĘPNE ZADANIE (${nextTime}): ${nextTitle} • @777`,
      isGcal,
      gcalCalendarName,
      nextTask: { timeRange: nextTime, title: nextTitle, agent: '@777' },
    };
  }
  if (warsawHour >= 18 && warsawHour < 22) {
    return {
      mode: 'routine',
      badge: 'TERAZ • PASMO WIECZORNE',
      timeRange: '18:00–22:00',
      agent: '@777',
      title: 'Wieczorna Subskrypcja SMS, Przegląd Skrzynki Misji & Raport JOMA',
      sub: '⏭ NASTĘPNE ZADANIE (22:00): Cisza nocna powiadomień Push (22:00–06:00) & Nocne Czuwanie • @SMCC',
      isGcal,
      gcalCalendarName,
      nextTask: { timeRange: '22:00–06:00', title: 'Cisza nocna powiadomień Push & Nocne Czuwanie', agent: '@SMCC' },
    };
  }
  return {
    mode: 'routine',
    badge: 'TERAZ • CZUWANIE NOCNE',
    timeRange: '22:00–06:00',
    agent: '@SMCC',
    title: 'Nocne Czuwanie Systemowe 24/7 & Ochrona Kanałów Nadawczych LIVE',
    sub: '⏭ NASTĘPNE ZADANIE (06:00): Poranna Publikacja Rozważań „Dobrze, że jesteś” • @A001',
    isGcal,
    gcalCalendarName,
    nextTask: { timeRange: '06:00–08:00', title: 'Poranna Publikacja Rozważań „Dobrze, że jesteś”', agent: '@A001' },
  };
}

export function renderLiveScreensaverBox(now = new Date()) {
  const ramowka = getCcRamowkaState(now);
  const teraz = getCurrentTerazSummary(now);
  const activeSlide = state.liveSlideIndex === 1 ? 1 : 0;
  const modeLabel = activeSlide === 0
    ? `RAMÓWKA • ${ramowka.timeStart || '00:00'}–${ramowka.timeEnd || '24:00'}`
    : `ZADANIE • ${teraz.timeRange}`;

  const nextRamowkaStr = ramowka.next
    ? `⏭ NASTĘPNIE ${ramowka.next.time}: ${ramowka.next.title}`
    : (ramowka.desc || 'Polskie Radio Christian Culture — Emisja 24/7');

  const gcalBadgeLabel = `📅 Google Calendar • ${teraz.gcalCalendarName || 'Christian Culture — Misja'}`;

  return `
    <section class="mc-clock-live-box" id="mcClockLiveBox" role="region" aria-live="polite" aria-label="Okienko NA ŻYWO: Ramówka polskieradio.cc, Google Calendar i skrót zadania TERAZ oraz następnego zadania">
      <div class="mc-live-box-header">
        <div class="mc-live-box-brand">
          <span class="mc-broadcast-wave-icon" aria-hidden="true" title="Sygnał nadawczy NA ŻYWO">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
            </svg>
          </span>
          <span class="mc-live-onair-pill">
            <span class="mc-live-onair-dot" aria-hidden="true"></span>
            <span>NA ŻYWO</span>
          </span>
          <span class="mc-live-mode-meta" id="mcLiveBoxModeBadge">${escapeHtml(modeLabel)}</span>
        </div>

        <div class="mc-live-rotator-tabs" role="tablist" aria-label="Przełącz widok w okienku NA ŻYWO">
          <button type="button" class="mc-live-tab-btn ${activeSlide === 0 ? 'is-active' : ''}" data-live-slide-btn="0" role="tab" aria-selected="${activeSlide === 0 ? 'true' : 'false'}" title="Ramówka ze strony głównej polskieradio.cc">
            <span>📡 Ramówka</span>
          </button>
          <button type="button" class="mc-live-tab-btn ${activeSlide === 1 ? 'is-active' : ''}" data-live-slide-btn="1" role="tab" aria-selected="${activeSlide === 1 ? 'true' : 'false'}" title="Skrót aktualnego zadania TERAZ i Google Calendar">
            <span>⏱️ Teraz</span>
          </button>
        </div>
      </div>

      <div class="mc-live-slides-viewport">
        <!-- Slajd 0: Ramówka i tytuł programu ze strony głównej polskieradio.cc -->
        <div class="mc-live-slide ${activeSlide === 0 ? 'is-active' : ''}" id="mcLiveSlideRamowka" data-live-slide="0" role="tabpanel" tabindex="0" title="Kliknij, aby przejść do widoku TERAZ">
          <div class="mc-live-slide-main">
            <span class="mc-live-program-kicker">ANTENA POLSKIERADIO.CC</span>
            <strong class="mc-live-program-title" id="mcLiveRamowkaTitle">${escapeHtml(ramowka.title)}</strong>
            <small class="mc-live-program-sub" id="mcLiveRamowkaSub">${escapeHtml(nextRamowkaStr)}</small>
          </div>
          <span class="mc-live-slide-action" aria-hidden="true">⏱️ →</span>
        </div>

        <!-- Slajd 1: Skrót TERAZ z aktualnego zadania kalendarza / Google Calendar + NASTĘPNE ZADANIE -->
        <div class="mc-live-slide ${activeSlide === 1 ? 'is-active' : ''}" id="mcLiveSlideTeraz" data-live-slide="1" role="tabpanel" tabindex="0" title="Kliknij, aby otworzyć pełny moduł TERAZ">
          <div class="mc-live-slide-main">
            <div class="mc-live-teraz-toprow">
              <span class="mc-live-program-kicker is-teraz-kicker" id="mcLiveTerazKicker">ZADANIE TERAZ • ${escapeHtml(teraz.agent)} (${escapeHtml(teraz.timeRange)})</span>
              <span class="mc-live-gcal-pill" id="mcLiveTerazGcalBadge" title="Synchronizacja z Google Calendar">${escapeHtml(gcalBadgeLabel)}</span>
            </div>
            <strong class="mc-live-program-title" id="mcLiveTerazTitle">${escapeHtml(teraz.title)}</strong>
            <div class="mc-live-next-task-row" id="mcLiveTerazNextBox">
              <small class="mc-live-program-sub is-next-task-sub" id="mcLiveTerazSub">${escapeHtml(teraz.sub)}</small>
            </div>
          </div>
          <span class="mc-live-slide-action" aria-hidden="true">Otwórz →</span>
        </div>
      </div>

      <div class="mc-live-progress-bar" aria-hidden="true">
        <div class="mc-live-progress-fill" id="mcLiveProgressFill"></div>
      </div>
    </section>
  `;
}

export function updateLiveScreensaverDom(now = new Date()) {
  if (typeof document === 'undefined') return;
  const box = document.getElementById('mcClockLiveBox');
  if (!box) return;

  const ramowka = getCcRamowkaState(now);
  const teraz = getCurrentTerazSummary(now);

  // Auto-rotacja co 6 sekund (o ile użytkownik nie przełączył ręcznie w ostatnich 12 s)
  if (Date.now() > (state.liveSlideManualUntil || 0)) {
    const autoIdx = Math.floor(now.getTime() / 6000) % 2;
    if (state.liveSlideIndex !== autoIdx) {
      state.liveSlideIndex = autoIdx;
    }
  }

  const activeSlide = state.liveSlideIndex === 1 ? 1 : 0;
  const modeLabel = activeSlide === 0
    ? `RAMÓWKA • ${ramowka.timeStart || '00:00'}–${ramowka.timeEnd || '24:00'}`
    : `ZADANIE • ${teraz.timeRange}`;

  const modeBadgeEl = document.getElementById('mcLiveBoxModeBadge');
  if (modeBadgeEl && modeBadgeEl.textContent !== modeLabel) {
    modeBadgeEl.textContent = modeLabel;
  }

  const ramowkaTitleEl = document.getElementById('mcLiveRamowkaTitle');
  if (ramowkaTitleEl && ramowkaTitleEl.textContent !== ramowka.title) {
    ramowkaTitleEl.textContent = ramowka.title;
  }

  const nextRamowkaStr = ramowka.next
    ? `⏭ NASTĘPNIE ${ramowka.next.time}: ${ramowka.next.title}`
    : (ramowka.desc || 'Polskie Radio Christian Culture — Emisja 24/7');
  const ramowkaSubEl = document.getElementById('mcLiveRamowkaSub');
  if (ramowkaSubEl && ramowkaSubEl.textContent !== nextRamowkaStr) {
    ramowkaSubEl.textContent = nextRamowkaStr;
  }

  const terazKickerStr = `ZADANIE TERAZ • ${teraz.agent} (${teraz.timeRange})`;
  const terazKickerEl = document.getElementById('mcLiveTerazKicker');
  if (terazKickerEl && terazKickerEl.textContent !== terazKickerStr) {
    terazKickerEl.textContent = terazKickerStr;
  }

  const gcalBadgeEl = document.getElementById('mcLiveTerazGcalBadge');
  const gcalBadgeLabel = `📅 Google Calendar • ${teraz.gcalCalendarName || 'Christian Culture — Misja'}`;
  if (gcalBadgeEl && gcalBadgeEl.textContent !== gcalBadgeLabel) {
    gcalBadgeEl.textContent = gcalBadgeLabel;
  }

  const terazTitleEl = document.getElementById('mcLiveTerazTitle');
  if (terazTitleEl && terazTitleEl.textContent !== teraz.title) {
    terazTitleEl.textContent = teraz.title;
  }

  const terazSubEl = document.getElementById('mcLiveTerazSub');
  if (terazSubEl && terazSubEl.textContent !== teraz.sub) {
    terazSubEl.textContent = teraz.sub;
  }

  const slide0 = document.getElementById('mcLiveSlideRamowka');
  const slide1 = document.getElementById('mcLiveSlideTeraz');
  if (slide0 && slide1) {
    slide0.classList.toggle('is-active', activeSlide === 0);
    slide1.classList.toggle('is-active', activeSlide === 1);
  }

  box.querySelectorAll('[data-live-slide-btn]').forEach((btn) => {
    const idx = Number(btn.getAttribute('data-live-slide-btn'));
    const isAct = idx === activeSlide;
    btn.classList.toggle('is-active', isAct);
    btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
  });
}

export function renderClockModule() {
  const now = new Date();
  const [lat, lng] = (state.clockCity || '52.2297,21.0122').split(',').map(Number);
  const bState = getBiblicalTimeState(now, lat, lng);
  const warsawTimeNowStr = formatWarsawTimeWithSeconds(now);
  const warsawDateTitle = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return `
    <div class="mc-fullscreen-module mc-clock-fullscreen ${state.clockIdleHidden ? 'is-screensaver-idle' : ''}" id="mcClockFullscreenModule" role="region" aria-label="Minimalistyczny Zegar Biblijny">
      <header class="mc-clock-module-topbar">
        <div class="mc-clock-topbar-edge-space" aria-hidden="true"></div>
        <div class="mc-clock-topbar-right">
          <button type="button" id="btnClockMenuToggle" class="mc-btn-clock-menu" aria-expanded="${state.clockDrawerOpen ? 'true' : 'false'}" aria-controls="mcClockSettingsDrawer" aria-label="Menu ustawień zegara" title="Ustawienia i opcje">
            <svg class="mc-menu-vertical-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="6" y1="5" x2="6" y2="19" />
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="18" y1="5" x2="18" y2="19" />
            </svg>
          </button>
        </div>
      </header>

      <main class="mc-clock-module-center">
        <div class="mc-clock-permanent-header" id="mcClockPermanentHeader" aria-label="Christian Culture Live">
          <span class="mc-clock-permanent-dot" aria-hidden="true"></span>
          <span class="mc-clock-permanent-title">CHRISTIAN CULTURE LIVE</span>
        </div>

        <div class="mc-dial-wrapper mc-clickable-clock" id="mcBiblicalClockHero" role="button" tabindex="0" title="Zegar Biblijny Szabatu" aria-label="Tarcza Zegara Biblijnego" style="--mc-sec-angle:${now.getSeconds() * 6}deg;--mc-rim-x:${(Math.cos(((now.getSeconds() * 6 - 90) * Math.PI) / 180) * 14).toFixed(1)}px;--mc-rim-y:${(Math.sin(((now.getSeconds() * 6 - 90) * Math.PI) / 180) * 14).toFixed(1)}px;">
          ${renderBiblicalClockDialSvg(now.getSeconds())}
          <div class="mc-dial-center">
            <div id="digital-time" class="tabular-clock mc-clock-digits">${warsawTimeNowStr}</div>
            <div class="mc-dial-separator">
              <div class="mc-dial-sep-line"></div>
              <div id="center-dot" class="mc-dial-center-dot"></div>
              <div class="mc-dial-sep-line"></div>
            </div>
            <div id="gregorian-date" class="mc-gregorian-date">${warsawDateTitle.charAt(0).toUpperCase() + warsawDateTitle.slice(1)}</div>
            <div class="mc-biblical-status-wrap">
              <div id="biblical-badge" class="mc-biblical-badge ${bState.isSabbath ? 'is-sabbath' : ''}">
                <span class="mc-pulse-dot" style="background:${bState.isSabbath ? '#ef4444' : '#FF7A00'};"></span>
                <span>${bState.isSabbath ? 'SZABAT' : bState.biblicalDay.name}</span>
              </div>
            </div>
          </div>
        </div>

        ${renderLiveScreensaverBox(now)}

        <div class="mc-clock-more-toggle-wrap">
          <button type="button" id="btnClockToggleMore" class="mc-clock-more-btn" aria-expanded="${state.clockShowMore ? 'true' : 'false'}">
            <span>WIĘCEJ</span>
            <span class="mc-more-arrow">${state.clockShowMore ? '▴' : '▾'}</span>
          </button>
        </div>

        ${
          state.clockShowMore
            ? `
          <div class="mc-full-clock-cards animate-fade-in" id="mcClockMoreCards">
            <div class="mc-stat-card">
              <small class="mc-stat-sub">Zachód Słońca (Dziś)</small>
              <strong class="mc-stat-val" style="color:#FF7A00;">${formatWarsawTimeOnly(bState.todaySunset)}</strong>
              <small class="mc-stat-muted">Jutro: ${formatWarsawTimeOnly(bState.tomorrowSunset)}</small>
            </div>

            <div class="mc-stat-card ${bState.isSabbath ? 'is-sabbath' : ''}">
              <small class="mc-stat-sub" style="color:#FF7A00;">${bState.countdownLabel}</small>
              <strong class="mc-stat-val" id="sabbath-countdown">${formatCountdown(bState.sabbathTargetDate - now)}</strong>
              <small class="mc-stat-muted">${bState.isSabbath ? 'Trwa Święty Boży Szabat' : 'do piątkowego zachodu słońca'}</small>
            </div>

            <div class="mc-stat-card">
              <small class="mc-stat-sub">Rachuba Biblijna CC</small>
              <strong class="mc-stat-val-sm">${bState.isAfterSunset ? 'Trwa nowa doba biblijna (po zachodzie)' : 'Przed zachodem słońca'}</strong>
              <small class="mc-stat-muted" style="color:#FF7A00;">Piątek zachód ➔ Sobota zachód</small>
            </div>
          </div>
        `
            : ''
        }
      </main>

      <!-- Panel boczny wysuwany z prawej strony (Ustawienia Zegara) -->
      <div id="mcClockDrawerBackdrop" class="mc-drawer-backdrop ${state.clockDrawerOpen ? 'is-open' : ''}" aria-hidden="${state.clockDrawerOpen ? 'false' : 'true'}"></div>
      <aside id="mcClockSettingsDrawer" class="mc-settings-drawer ${state.clockDrawerOpen ? 'is-open' : ''}" role="dialog" aria-modal="true" aria-label="Menu ustawień" aria-hidden="${state.clockDrawerOpen ? 'false' : 'true'}">
        <div class="mc-drawer-header">
          <div class="mc-drawer-title-wrap">
            <h3 class="mc-drawer-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Ustawienia</span>
            </h3>
          </div>
          <button type="button" id="btnCloseClockDrawer" class="mc-drawer-close-btn" aria-label="Zamknij menu ustawień" title="Zamknij">✕</button>
        </div>
        <div class="mc-drawer-body">
          <div class="mc-drawer-section">
            <label class="mc-drawer-label" for="mcCitySelector">
              <span class="mc-pulse-dot" style="background:#FF7A00;width:8px;height:8px;"></span>
              Lokalizacja astronomiczna
            </label>
            <select id="mcCitySelector" class="mc-city-select mc-drawer-select" aria-label="Wybierz lokalizację">
              <option value="52.2297,21.0122" ${state.clockCity === '52.2297,21.0122' ? 'selected' : ''}>Warszawa (Polska)</option>
              <option value="50.9295,21.3853" ${state.clockCity === '50.9295,21.3853' ? 'selected' : ''}>Ostrowiec Św. (Polska)</option>
              <option value="50.0647,19.9450" ${state.clockCity === '50.0647,19.9450' ? 'selected' : ''}>Kraków</option>
              <option value="54.3520,18.6466" ${state.clockCity === '54.3520,18.6466' ? 'selected' : ''}>Gdańsk</option>
              <option value="51.1079,17.0385" ${state.clockCity === '51.1079,17.0385' ? 'selected' : ''}>Wrocław</option>
              <option value="52.4064,16.9252" ${state.clockCity === '52.4064,16.9252' ? 'selected' : ''}>Poznań</option>
              <option value="31.7683,35.2137" ${state.clockCity === '31.7683,35.2137' ? 'selected' : ''}>Jerozolima (Izrael)</option>
            </select>
          </div>

          <div class="mc-drawer-section">
            <span class="mc-drawer-label">Tryb motywu</span>
            <button type="button" id="btnQuickThemeToggle" class="mc-quick-btn mc-drawer-theme-btn" title="Przełącz motyw jasny/ciemny">
              ${state.theme === 'light' ? '🌙 Przełącz na motyw ciemny' : '☀️ Przełącz na motyw jasny'}
            </button>
          </div>

          <div class="mc-drawer-section mc-drawer-logout-wrap">
            <button type="button" id="btnLogout" class="mc-quick-btn mc-drawer-logout-btn">
              Wyloguj z Mission Control
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function renderBoardContent(filtered) {
  if (state.view === 'settings') {
    return renderSettingsHtml();
  }

  if (state.view === 'clock') {
    return renderBiblicalClockFullHtml();
  }

  if (state.view === 'today') {
    return renderTodayHtml(filtered);
  }

  if (state.view === 'kanban') {
    return `
      <div class="mc-kanban-grid" role="region" aria-label="Tablica Kanban 4 statusów">
        ${Object.values(STATUS_META)
          .map((st) => {
            const colEvents = filtered.filter((e) => e.status === st.code);
            return `
              <div class="mc-day-col" data-drop-status="${st.code}">
                <div class="mc-day-header">
                  <span>${st.icon} ${escapeHtml(st.label)}</span>
                  <span>(${colEvents.length})</span>
                </div>
                ${colEvents.map(renderEventTileHtml).join('') || '<small style="color:var(--mc-muted)">Brak zadań</small>'}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  if (state.view === 'agenda' || state.view === 'day') {
    const sorted = [...filtered].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    return `
      <div style="display:grid;gap:10px;" role="region" aria-label="Widok agendy i osi dnia">
        ${sorted.map(renderEventTileHtml).join('') || '<p style="color:var(--mc-muted)">Brak zaplanowanych zadań w wybranym widoku. Kliknij „＋ Nowe zadanie” lub wpisz polecenie dla Noemi @077 powyżej.</p>'}
      </div>
    `;
  }

  if (state.view === 'agents') {
    return `
      <div style="display:grid;gap:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <h3 style="margin:0;">Orkiestra Agentów @777 / @OA (${state.agents.length})</h3>
          <button type="button" id="btnRegisterAgent" class="mc-btn-gold">＋ Wygeneruj token dla Agenta</button>
        </div>
        <div class="mc-week-grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));">
          ${state.agents
            .map(
              (ag) => `
            <div class="mc-stat-card">
              <strong>${escapeHtml(ag.name)}</strong>
              <span>Zakresy: ${escapeHtml((ag.scopes || []).join(', '))}</span>
              <span>Limit równoległy: ${ag.max_parallel}</span>
            </div>
          `
            )
            .join('') || '<p style="color:var(--mc-muted)">Brak zarejestrowanych tokenów agentowych. Kliknij „Wygeneruj token dla Agenta”.</p>'}
        </div>
        <h3 style="margin:10px 0 0;">Dziennik Audytu (Audit Log)</h3>
        <div style="display:grid;gap:6px;max-height:320px;overflow-y:auto;">
          ${state.audit
            .slice(0, 30)
            .map(
              (a) => `
            <div style="font-size:12px;padding:8px 12px;background:#0b131e;border-radius:8px;border:1px solid rgba(255,255,255,0.07);">
              <strong>${escapeHtml(a.action.toUpperCase())}</strong> · ${escapeHtml(a.actor_type)}:${escapeHtml(a.actor_id)} → ${escapeHtml(a.entity)} (${escapeHtml(a.entity_id)})
              <span style="color:var(--mc-muted);float:right;">${escapeHtml(formatWarsawShort(a.created_at))}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // Widok tygodniowy / miesięczny wg Kanonu Wiary CC (28 Zasad Wiary Kościoła Bożego):
  // 1. Tydzień ZACZYNA SIĘ OD NIEDZIELI (Niedziela = 1. dzień tygodnia).
  // 2. Piątek jest dniem przygotowania do Szabatu — okno wyróżnione na POMARAŃCZOWO.
  // 3. Sobota jest 7. dniem tygodnia (Święty Boży Szabat) — okno wyróżnione na CZERWONO.
  const base = new Date(state.anchorDate);
  const dow = base.getDay(); // 0 = Niedziela (1. dzień), 1 = Poniedziałek, ..., 5 = Piątek, 6 = Sobota (7. dzień)
  const sunday = new Date(base.getTime() - dow * 86400_000);
  sunday.setHours(0, 0, 0, 0);

  const todayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const daysCount = state.view === 'month' ? 14 : 7;
  const cols = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(sunday.getTime() + i * 86400_000);
    const dayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    const dayLabel = new Intl.DateTimeFormat('pl-PL', {
      timeZone: 'Europe/Warsaw',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    }).format(d);

    const dayOfWeek = d.getDay(); // 0 = Niedziela, 5 = Piątek, 6 = Sobota
    let specialClass = '';
    let specialBadge = '';
    if (dayOfWeek === 6) {
      specialClass = 'mc-day-sabbath';
      specialBadge = '<span class="mc-day-tag mc-tag-sabbath" title="Sobota — 7. Dzień Tygodnia, Pamiątka Stworzenia i Święty Boży Szabat">Szabat · 7. Dzień</span>';
    } else if (dayOfWeek === 5) {
      specialClass = 'mc-day-friday-prep';
      specialBadge = '<span class="mc-day-tag mc-tag-friday-prep" title="Piątek — Dzień Przygotowania do Szabatu">Dzień Przygotowania</span>';
    } else if (dayOfWeek === 0) {
      specialClass = 'mc-day-sunday';
      specialBadge = '<span class="mc-day-tag mc-tag-sunday" title="Niedziela — 1. Dzień Tygodnia">1. Dzień</span>';
    }

    const isToday = dayIsoPrefix === todayIsoPrefix;
    const todayClass = isToday ? 'is-today' : '';

    const dayEvents = filtered.filter((ev) => toWarsawInput(ev.starts_at).startsWith(dayIsoPrefix));
    cols.push(`
      <div class="mc-day-col ${specialClass} ${todayClass}" data-drop-date="${dayIsoPrefix}" data-day-of-week="${dayOfWeek}">
        <div class="mc-day-header">
          <div class="mc-day-header-info">
            <span class="mc-day-title">${escapeHtml(dayLabel)}</span>
            ${specialBadge}
            ${isToday ? '<span class="mc-day-today-tag">DZIŚ</span>' : ''}
          </div>
          <button type="button" class="mc-quick-add-day" data-date="${dayIsoPrefix}" style="min-height:32px;min-width:32px;padding:2px 8px;font-size:12px;" aria-label="Dodaj zadanie w dniu ${escapeHtml(dayLabel)}">+</button>
        </div>
        ${dayEvents.map(renderEventTileHtml).join('')}
      </div>
    `);
  }
  return `<div class="mc-week-grid">${cols.join('')}</div>`;
}

function renderModalHtml() {
  const ev = state.editingEvent;
  if (!ev) return '';
  const isEdit = Boolean(ev.id);
  return `
    <div class="mc-modal-backdrop" id="mcModalBackdrop" role="dialog" aria-modal="true" aria-labelledby="mcModalTitle">
      <form class="mc-modal" id="mcEventForm">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2 id="mcModalTitle" style="margin:0;">${isEdit ? 'Edytuj zadanie misji' : 'Nowe zadanie misji'}</h2>
          <button type="button" id="btnCloseModal" aria-label="Zamknij okno">✕</button>
        </div>
        <label>Tytuł zadania *
          <input name="title" required maxlength="200" value="${escapeHtml(ev.title || '')}" placeholder="np. Przygotowanie miniatury Biblia Audio" />
        </label>
        <label>Opis / Kryteria akceptacji / Notatka
          <textarea name="description" rows="3" placeholder="Cel zadania, linki do dokumentacji OA / GitHub...">${escapeHtml(ev.description || '')}</textarea>
        </label>
        <div class="mc-form-row">
          <label>Początek (Europe/Warsaw) *
            <input name="starts_at" type="datetime-local" required value="${escapeHtml(toWarsawInput(ev.starts_at || new Date().toISOString()))}" />
          </label>
          <label>Koniec (Europe/Warsaw)
            <input name="ends_at" type="datetime-local" value="${escapeHtml(toWarsawInput(ev.ends_at))}" />
          </label>
        </div>
        <div class="mc-form-row">
          <label>Status (4 kolory kanoniczne)
            <select name="status" id="mcStatusSelect">
              ${Object.values(STATUS_META)
                .map((s) => `<option value="${s.code}" ${(ev.status || 'todo') === s.code ? 'selected' : ''}>${s.icon} ${escapeHtml(s.label)}</option>`)
                .join('')}
            </select>
          </label>
          <label>Obszar misji
            <select name="category">
              ${Object.keys(AREA_COLORS)
                .map((c) => `<option value="${c}" ${(ev.category || 'mission') === c ? 'selected' : ''}>${c.toUpperCase()}</option>`)
                .join('')}
            </select>
          </label>
        </div>
        <label id="mcNotDoneReasonWrap" style="display:${ev.status === 'not_done' ? 'grid' : 'none'};">
          Powód niezrealizowania (obowiązkowy dla statusu Niezrealizowane !) *
          <input name="not_done_reason" value="${escapeHtml(ev.not_done_reason || '')}" placeholder="Podaj przyczynę niewykonania lub blokady..." />
        </label>
        <div class="mc-form-row">
          <label>Priorytet
            <select name="priority">
              <option value="1" ${Number(ev.priority) === 1 ? 'selected' : ''}>P0 — Krytyczny</option>
              <option value="2" ${Number(ev.priority || 2) === 2 ? 'selected' : ''}>P1 — Wysoki</option>
              <option value="3" ${Number(ev.priority) === 3 ? 'selected' : ''}>P2 — Standardowy</option>
              <option value="4" ${Number(ev.priority) === 4 ? 'selected' : ''}>P3 — Niski</option>
            </select>
          </label>
          <label>Wykonawca (Osoba / Agent @777 / @OA)
            <input name="assigned_to" value="${escapeHtml(ev.assigned_to || '')}" placeholder="np. @077, @OA, @A001, @Codex, @VisualDirector" />
          </label>
        </div>
        <div class="mc-form-row">
          <label>Projekt
            <select name="project_id">
              <option value="general" ${ev.project_id === 'general' ? 'selected' : ''}>Misja Ogólna CC</option>
              <option value="biblia-audio" ${ev.project_id === 'biblia-audio' ? 'selected' : ''}>Produkcja Biblia Audio</option>
              <option value="shorts-factory" ${ev.project_id === 'shorts-factory' ? 'selected' : ''}>Automatyzacja Shorts</option>
              <option value="obs-live" ${ev.project_id === 'obs-live' ? 'selected' : ''}>Emisja OBS Live</option>
            </select>
          </label>
          <label>Powtarzalność (RRULE)
            <select name="rrule">
              <option value="" ${!ev.rrule ? 'selected' : ''}>Jednorazowo (bez powtarzania)</option>
              <option value="FREQ=DAILY" ${ev.rrule === 'FREQ=DAILY' ? 'selected' : ''}>Codziennie</option>
              <option value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" ${ev.rrule === 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' ? 'selected' : ''}>W dni robocze (Pn–Pt)</option>
              <option value="FREQ=WEEKLY" ${ev.rrule === 'FREQ=WEEKLY' ? 'selected' : ''}>Co tydzień</option>
              <option value="FREQ=WEEKLY;INTERVAL=2" ${ev.rrule === 'FREQ=WEEKLY;INTERVAL=2' ? 'selected' : ''}>Co dwa tygodnie</option>
              <option value="FREQ=MONTHLY;BYMONTHDAY=1,15" ${ev.rrule === 'FREQ=MONTHLY;BYMONTHDAY=1,15' ? 'selected' : ''}>Dwa razy w miesiącu (1. i 15. dzień)</option>
              <option value="FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1,3" ${ev.rrule === 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1,3' ? 'selected' : ''}>1. i 3. poniedziałek miesiąca</option>
              <option value="FREQ=MONTHLY" ${ev.rrule === 'FREQ=MONTHLY' ? 'selected' : ''}>Raz w miesiącu</option>
              <option value="FREQ=YEARLY" ${ev.rrule === 'FREQ=YEARLY' ? 'selected' : ''}>Co rok</option>
            </select>
          </label>
        </div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
          <input type="checkbox" name="is_private" style="min-height:20px;min-width:20px;" ${ev.is_private ? 'checked' : ''} />
          <span>Prywatny wpis CC LIFE (ukryj opis przed agentami @777 — widoczna tylko zajętość)</span>
        </label>
        ${
          ev.result_summary
            ? `<div style="padding:12px;background:#0b131e;border:1px solid var(--mc-gold);border-radius:10px;">
                <strong style="color:var(--mc-gold-light)">Rezultat zgłoszony przez agenta (${escapeHtml(ev.assigned_to || '')}):</strong>
                <p style="margin:6px 0 0;font-size:13px;">${escapeHtml(ev.result_summary)}</p>
              </div>`
            : ''
        }
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;margin-top:8px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="submit" class="mc-btn-cta">${isEdit ? 'Zapisz zmiany' : 'Utwórz zadanie'}</button>
            ${
              isEdit
                ? `<button type="button" id="btnRouteOA" class="mc-btn-gold">Zleć przez @OA</button>`
                : ''
            }
            ${
              isEdit && ev.review_state === 'awaiting_review'
                ? `<button type="button" id="btnApproveResult" style="background:#15803D;border-color:#15803D;color:#fff;">✓ Zatwierdź rezultat</button>
                   <button type="button" id="btnRejectResult" style="background:#B91C1C;border-color:#B91C1C;color:#fff;">Odrzuć</button>`
                : ''
            }
          </div>
          ${
            isEdit
              ? `<button type="button" id="btnDeleteEvent" style="border-color:#B91C1C;color:#fca5a5;">Usuń</button>`
              : ''
          }
        </div>
      </form>
    </div>
  `;
}

function attachLoginHandler() {
  const btnLogin = document.getElementById('btnGoogleSignIn');
  if (!btnLogin || btnLogin._hasLoginHandler) return;
  btnLogin._hasLoginHandler = true;
  btnLogin.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    btnLogin.disabled = true;
    const oldHtml = btnLogin.innerHTML;
    btnLogin.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;"><svg class="mc-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>Trwa logowanie…</span>`;
    try {
      const luminaDb = await import('/lumina-db.js?v=20261107_v3');
      const res = await luminaDb.loginWithGoogle();
      if (res && res.isRedirecting) {
        return;
      }
      if (res && res.user && typeof res.user.getIdToken === 'function') {
        const entered = await exchangeTokenAndEnter(res.user);
        if (entered) return;
      }
      const authUser = luminaDb.getCurrentUser?.() || luminaDb.getFirebaseAuthUser?.();
      if (authUser && typeof authUser.getIdToken === 'function') {
        const entered = await exchangeTokenAndEnter(authUser);
        if (entered) return;
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        state.error = 'Błąd logowania Google: ' + (err.message || '');
        render();
      }
    } finally {
      btnLogin.disabled = false;
      if (!state.user) {
        btnLogin.innerHTML = oldHtml;
      }
    }
  };
}

export function renderTerazModule(filtered) {
  const now = new Date();
  const warsawTimeNowStr = formatWarsawTimeWithSeconds(now);
  const nowTs = now.getTime();

  const todayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const todayDateFormatted = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const todayTasks = filtered
    .filter((ev) => toWarsawInput(ev.starts_at).startsWith(todayIsoPrefix))
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));

  const currentNowEvent = todayTasks.find((ev) => {
    const s = Date.parse(ev.starts_at);
    const e = ev.ends_at ? Date.parse(ev.ends_at) : s + 3600_000;
    return s <= nowTs && nowTs < e;
  });

  const nextUpcomingEvent = !currentNowEvent
    ? todayTasks.find((ev) => Date.parse(ev.starts_at) > nowTs)
    : null;

  let dividerInserted = false;

  return `
    <div class="mc-fullscreen-module mc-teraz-fullscreen" role="region" aria-label="Moduł Pełnoekranowy TERAZ">
      <header class="mc-teraz-header">
        <div class="mc-teraz-header-left">
          <button type="button" class="mc-btn-back-clock" id="btnBackToClock" aria-label="Wróć do Zegara">
            ← 🕰️ Wróć do Zegara
          </button>
          <div class="mc-teraz-live-badge">
            <span class="mc-pulse-dot" style="background:#FF7A00;"></span>
            <span class="mc-teraz-live-label">TERAZ NA ŻYWO:</span>
            <span id="mcTerazLiveClock" class="tabular-clock" style="color:#FF7A00;font-weight:700;font-size:16px;">${warsawTimeNowStr}</span>
            <span class="mc-teraz-tz-badge">Europe/Warsaw</span>
          </div>
        </div>

        <div class="mc-teraz-header-right">
          <button type="button" id="btnQuickThemeToggle" class="mc-quick-btn" title="Przełącz motyw">
            ${state.theme === 'light' ? '🌙 Ciemny' : '☀️ Jasny'}
          </button>
          <button type="button" id="btnNewTask" class="mc-btn-cta" style="background:#FF7A00;color:#fff;">＋ Nowe zadanie</button>
        </div>
      </header>

      <main class="mc-teraz-main-content">
        <!-- Hero Card: Trwa w tej chwili lub Następne -->
        <section class="mc-teraz-hero-card">
          ${
            currentNowEvent
              ? `
                <div class="mc-teraz-hero-badge is-active-now">
                  <span class="mc-pulse-dot"></span>
                  <span>▶ TRWA W TEJ CHWILI</span>
                </div>
                <h2 class="mc-teraz-hero-title">${escapeHtml(currentNowEvent.title)}</h2>
                <div class="mc-teraz-hero-meta">
                  <span class="mc-teraz-hero-time">⏱️ ${formatWarsawTimeOnly(currentNowEvent.starts_at)}${currentNowEvent.ends_at ? ' — ' + formatWarsawTimeOnly(currentNowEvent.ends_at) : ''}</span>
                  <span class="mc-teraz-hero-agent">👤 ${escapeHtml(currentNowEvent.assigned_to || '@OA')}</span>
                  <span class="mc-teraz-hero-area" style="background:${(AREA_COLORS[currentNowEvent.category] || '#C4A35A')}22;color:${AREA_COLORS[currentNowEvent.category] || '#C4A35A'};">${escapeHtml((currentNowEvent.category || 'general').toUpperCase())}</span>
                </div>
                ${currentNowEvent.description ? `<p class="mc-teraz-hero-desc">${escapeHtml(currentNowEvent.description)}</p>` : ''}
                <div class="mc-teraz-hero-actions">
                  <button type="button" class="mc-btn-done" data-quick-done="${escapeHtml(currentNowEvent.occurrence_id || currentNowEvent.id)}">✓ Oznacz jako wykonane</button>
                  <button type="button" class="mc-btn-extend" data-quick-extend="${escapeHtml(currentNowEvent.occurrence_id || currentNowEvent.id)}">+30 min</button>
                  <button type="button" class="mc-btn-edit" data-event-key="${escapeHtml(currentNowEvent.occurrence_id || currentNowEvent.id)}">Edytuj</button>
                </div>
              `
              : nextUpcomingEvent
              ? `
                <div class="mc-teraz-hero-badge is-upcoming">
                  <span>⏱️ NASTĘPNE W KOLEJNOŚCI</span>
                </div>
                <h2 class="mc-teraz-hero-title">${escapeHtml(nextUpcomingEvent.title)}</h2>
                <div class="mc-teraz-hero-meta">
                  <span class="mc-teraz-hero-time">Rozpoczęcie o ${formatWarsawTimeOnly(nextUpcomingEvent.starts_at)}</span>
                  <span class="mc-teraz-hero-agent">👤 ${escapeHtml(nextUpcomingEvent.assigned_to || '@OA')}</span>
                  <span class="mc-teraz-hero-area" style="background:${(AREA_COLORS[nextUpcomingEvent.category] || '#C4A35A')}22;color:${AREA_COLORS[nextUpcomingEvent.category] || '#C4A35A'};">${escapeHtml((nextUpcomingEvent.category || 'general').toUpperCase())}</span>
                </div>
                ${nextUpcomingEvent.description ? `<p class="mc-teraz-hero-desc">${escapeHtml(nextUpcomingEvent.description)}</p>` : ''}
                <div class="mc-teraz-hero-actions">
                  <button type="button" class="mc-btn-start-now" data-quick-start="${escapeHtml(nextUpcomingEvent.occurrence_id || nextUpcomingEvent.id)}">▶ Rozpocznij teraz</button>
                  <button type="button" class="mc-btn-edit" data-event-key="${escapeHtml(nextUpcomingEvent.occurrence_id || nextUpcomingEvent.id)}">Edytuj</button>
                </div>
              `
              : `
                <div class="mc-teraz-hero-badge is-empty">
                  <span>✓ PLAN NA DZIŚ ZREALIZOWANY</span>
                </div>
                <h2 class="mc-teraz-hero-title">Brak aktywnych zadań w tej chwili</h2>
                <p class="mc-teraz-hero-desc">Wszystkie zaplanowane na tę porę zadania zostały zakończone lub brak dalszych wpisów na dzisiaj.</p>
                <div class="mc-teraz-hero-actions">
                  <button type="button" id="btnSyncRoutines" class="mc-btn-cta" style="background:#FF7A00;color:#fff;">⚡ Wgraj 12 rutyn Misji CC</button>
                  <button type="button" id="btnNewTask" class="mc-btn-gold">＋ Dodaj nowe zadanie</button>
                </div>
              `
          }
        </section>

        <!-- Chronologiczny harmonogram na dziś z linią TERAZ -->
        <section class="mc-teraz-timeline-section">
          <div class="mc-teraz-timeline-header">
            <h3>Harmonogram dnia: ${todayDateFormatted.charAt(0).toUpperCase() + todayDateFormatted.slice(1)}</h3>
            <span class="mc-teraz-task-count">Liczba zadań: <strong>${todayTasks.length}</strong></span>
          </div>

          <div class="mc-today-stream">
            ${
              todayTasks.length === 0
                ? `<div class="mc-today-empty-state">
                    <p>Brak zaplanowanych zadań na dziś.</p>
                  </div>`
                : todayTasks
                    .map((ev) => {
                      const startTs = Date.parse(ev.starts_at);
                      const endTs = ev.ends_at ? Date.parse(ev.ends_at) : startTs + 3600_000;
                      const isNow = startTs <= nowTs && nowTs < endTs;
                      const isPast = endTs <= nowTs;
                      const isNext = ev === nextUpcomingEvent;

                      let output = '';
                      if (!dividerInserted && (isNow || startTs > nowTs)) {
                        dividerInserted = true;
                        output += `
                          <div class="mc-now-divider" id="mcNowTimelineDivider">
                            <span class="mc-now-dot"></span>
                            <span class="mc-now-label">⏱️ AKTUALNA GODZINA (TERAZ: ${warsawTimeNowStr.slice(0, 5)})</span>
                            <span class="mc-now-line"></span>
                          </div>
                        `;
                      }

                      output += renderTodayTileHtml(ev, { isNow, isPast, isNext });
                      return output;
                    })
                    .join('') +
                  (!dividerInserted
                    ? `
                      <div class="mc-now-divider" id="mcNowTimelineDivider">
                        <span class="mc-now-dot"></span>
                        <span class="mc-now-label">⏱️ AKTUALNA GODZINA (TERAZ: ${warsawTimeNowStr.slice(0, 5)})</span>
                        <span class="mc-now-line"></span>
                      </div>
                      <div class="mc-today-all-done-note">
                        <span>✓ Wszystkie wcześniejsze zadania na dziś zakończone.</span>
                      </div>
                    `
                    : '')
            }
          </div>
        </section>
      </main>
    </div>
  `;
}

export function renderSettingsModule() {
  return `
    <div class="mc-fullscreen-module mc-settings-fullscreen" role="region" aria-label="Ustawienia Kalendarza Misji">
      <header class="mc-settings-module-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <button type="button" class="mc-btn-back-clock" id="btnBackToClock" aria-label="Wróć do Zegara">
            ← 🕰️ Wróć do Zegara
          </button>
          <h2 style="margin:0;font-size:22px;color:var(--mc-text-contrast);">⚙️ Ustawienia Kalendarza Misji</h2>
        </div>
        <button type="button" id="btnLogout" class="mc-quick-btn">Wyloguj</button>
      </header>
      <main style="padding:20px;max-width:960px;margin:0 auto;width:100%;box-sizing:border-box;">
        ${renderSettingsHtml()}
      </main>
    </div>
  `;
}

export function renderCalendarModule(filtered) {
  const allEventsResolved = state.realtimeEngine
    ? (state.rawEvents && state.rawEvents.length ? applyRealtimeEngine(state.rawEvents, new Date()) : applyRealtimeEngine(state.events, new Date()))
    : state.events;

  const todayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const scopedEvents = state.statsScope === 'today'
    ? allEventsResolved.filter((e) => {
        const s = toWarsawInput(e.starts_at) || '';
        const end = toWarsawInput(e.ends_at) || '';
        return s.startsWith(todayIsoPrefix) || end.startsWith(todayIsoPrefix);
      })
    : allEventsResolved;

  const counts = {
    all: scopedEvents.length,
    todo: scopedEvents.filter((e) => e.status === 'todo').length,
    in_progress: scopedEvents.filter((e) => e.status === 'in_progress').length,
    done: scopedEvents.filter((e) => e.status === 'done').length,
    not_done: scopedEvents.filter((e) => e.status === 'not_done').length,
    totalHorizon: allEventsResolved.length,
  };

  const todayCount = allEventsResolved.filter((e) => {
    const s = toWarsawInput(e.starts_at) || '';
    const end = toWarsawInput(e.ends_at) || '';
    return s.startsWith(todayIsoPrefix) || end.startsWith(todayIsoPrefix);
  }).length;

  return `
    <div class="mc-shell">
      <aside class="mc-sidebar ${state.mobileSidebarOpen ? 'is-open-mobile' : ''}" aria-label="Filtry kalendarza misji">
        <div>
          <h2>Kalendarz Misji</h2>
          <small style="color:var(--mc-muted)">${escapeHtml(state.user.email)}</small>
        </div>

        <div class="mc-filter-group">
          <div class="mc-filter-title">Widoki</div>
          ${[
            ['today', '⏱️ Dziś (TERAZ — wg godziny)'],
            ['clock', '🕰️ Zegar Biblijny Szabatu'],
            ['week', '▤ Tydzień (7 dni)'],
            ['month', '▦ Miesiąc / 2 tyg.'],
            ['agenda', '☰ Agenda chronologiczna'],
            ['day', '☀ Oś 15m (cały dzień)'],
            ['kanban', '◫ Kanban (4 statusy)'],
            ['agents', '⚡ Agenci @777 & Audyt'],
            ['settings', '⚙ Ustawienia'],
          ]
            .map(
              ([v, label]) =>
                `<button type="button" class="mc-nav-btn ${state.view === v ? 'is-active' : ''}" data-view="${v}">${label}</button>`
            )
            .join('')}
        </div>

        <div class="mc-filter-group">
          <div class="mc-filter-title">Obszary Misji</div>
          <button type="button" class="mc-nav-btn ${state.category === 'all' ? 'is-active' : ''}" data-category="all">◈ Wszystkie obszary</button>
          ${Object.keys(AREA_COLORS)
            .map(
              (cat) => `
            <button type="button" class="mc-nav-btn ${state.category === cat ? 'is-active' : ''}" data-category="${cat}">
              <span style="color:${AREA_COLORS[cat]}">●</span> ${cat.toUpperCase()}
            </button>
          `
            )
            .join('')}
        </div>

        <div style="margin-top:auto;display:grid;gap:8px;">
          <button type="button" id="btnQuickThemeToggle" class="mc-nav-btn" style="justify-content:center;background:var(--mc-surface-elevated);border:1px solid var(--mc-border);">
            ${state.theme === 'light' ? '🌙 Tryb ciemny (czarny)' : '☀️ Tryb jasny (biały)'}
          </button>
          <button type="button" id="btnLogout">Wyloguj</button>
        </div>
      </aside>

      <main class="mc-main">
        <header class="mc-topbar">
          <div class="mc-topbar-left">
            <button type="button" id="btnToggleMobileMenu" aria-label="Otwórz filtry">☰ Filtry</button>
            <button type="button" id="btnPrevPeriod" aria-label="Poprzedni okres">←</button>
            <button type="button" id="btnToday">Dziś</button>
            <button type="button" id="btnNextPeriod" aria-label="Następny okres">→</button>
            <button type="button" id="btnTopbarClock" class="mc-topbar-clock-btn mc-clickable-clock" title="Kliknij w zegar, aby wyświetlić zadania TERAZ" aria-label="Aktualna godzina, kliknij aby zobaczyć zadania TERAZ">
              <span class="mc-pulse-dot" style="background:#FF7A00;"></span>
              <span id="mcTopbarClockDigits">${formatWarsawTimeWithSeconds(new Date())}</span>
              <span class="mc-teraz-badge-mini">TERAZ</span>
            </button>
            <input
              type="search"
              id="mcSearchInput"
              value="${escapeHtml(state.searchQuery)}"
              placeholder="Szukaj zadania lub agenta..."
              aria-label="Szukaj zadania"
              style="min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--mc-border);background:#0b131e;color:#fff;"
            />
          </div>
          <div class="mc-topbar-right">
            <button type="button" id="btnEnablePush" class="mc-btn-icon-push" title="Powiadomienia Push (Ustawienia)" aria-label="Powiadomienia Push">🔔</button>
            <button type="button" id="btnNewTask" class="mc-btn-cta">＋ Nowe zadanie</button>
          </div>
        </header>

        ${
          state.error
            ? `<div role="alert" style="padding:12px 16px;border-radius:12px;background:#451a1a;border:1px solid #ef4444;color:#fecaca;display:flex;justify-content:space-between;align-items:center;">
                <span>${escapeHtml(state.error)}</span>
                <button type="button" id="btnClearError" style="min-height:36px;">✕</button>
              </div>`
            : ''
        }
        ${
          state.notice
            ? `<div role="status" style="padding:12px 16px;border-radius:12px;background:#143523;border:1px solid #22c55e;color:#bbf7d0;display:flex;justify-content:space-between;align-items:center;">
                <span>${escapeHtml(state.notice)}</span>
                <button type="button" id="btnClearNotice" style="min-height:36px;">✕</button>
              </div>`
            : ''
        }

        <form class="mc-nl-bar" id="mcNlForm" aria-label="Szybkie planowanie zadania w języku naturalnym">
          <input
            type="text"
            name="nlCommand"
            placeholder="np. Dodaj na piątek o 10:00 przygotowanie miniatury, przydziel Visual Director, powtarzaj co tydzień"
            aria-label="Polecenie w języku naturalnym"
          />
          <button type="submit" class="mc-btn-gold">Zaplanuj zadanie</button>
        </form>

        <div class="mc-stats-toolbar">
          <div class="mc-realtime-engine-pill" title="Inteligentny Silnik Real-Time automatycznie zarządza zadaniami według aktualnego czasu">
            <span class="mc-live-pulse-led"></span>
            <span class="mc-engine-status-text"><strong>⚡ Inteligentny Silnik Real-Time:</strong> AKTYWNY (Autopilot Misji CC)</span>
          </div>
          <div class="mc-stats-scope-switcher" role="group" aria-label="Zakres podsumowania zadań">
            <button type="button" class="mc-scope-btn ${state.statsScope === 'today' ? 'is-active' : ''}" data-stats-scope="today">
              📅 DZIŚ (${todayCount})
            </button>
            <button type="button" class="mc-scope-btn ${state.statsScope === 'all' ? 'is-active' : ''}" data-stats-scope="all">
              🌐 Cały horyzont (${allEventsResolved.length})
            </button>
          </div>
        </div>

        <section class="mc-stats" aria-label="Podsumowanie statusów">
          <div class="mc-stat-card"><strong class="mc-stat-num-todo">${counts.todo}</strong><span>○ Do wykonania</span></div>
          <div class="mc-stat-card"><strong class="mc-stat-num-in-progress">${counts.in_progress}</strong><span>◐ W trakcie</span></div>
          <div class="mc-stat-card"><strong class="mc-stat-num-done">${counts.done}</strong><span>✓ Zrealizowane</span></div>
          <div class="mc-stat-card"><strong class="mc-stat-num-not-done">${counts.not_done}</strong><span>! Niezrealizowane</span></div>
        </section>

        <div class="mc-status-legend" role="group" aria-label="Filtruj po statusie">
          <button type="button" class="${state.statusFilter === 'all' ? 'mc-btn-gold' : ''}" data-status-filter="all">Wszystkie (${counts.all})</button>
          <button type="button" class="mc-status-pill mc-status-todo" data-status-filter="todo">○ Do wykonania</button>
          <button type="button" class="mc-status-pill mc-status-in_progress" data-status-filter="in_progress">◐ W trakcie</button>
          <button type="button" class="mc-status-pill mc-status-done" data-status-filter="done">✓ Zrealizowane</button>
          <button type="button" class="mc-status-pill mc-status-not_done" data-status-filter="not_done">! Niezrealizowane</button>
        </div>

        <section class="mc-board">
          ${renderBoardContent(filtered)}
        </section>
      </main>

      <nav class="mc-bottom-nav" aria-label="Nawigacja mobilna kalendarza">
        <button type="button" data-view="day">Dziś</button>
        <button type="button" data-view="week">Kalendarz</button>
        <button type="button" data-view="kanban">Zadania</button>
        <button type="button" data-view="agents">Agenci</button>
        <button type="button" data-view="settings">Ustawienia</button>
      </nav>
    </div>
  `;
}

export function renderModuleDock() {
  return `
    <nav class="mc-module-dock" aria-label="Nawigacja modułowa kalendarza">
      <button type="button" class="mc-dock-btn ${state.module === 'clock' ? 'is-active' : ''}" data-module="clock" aria-label="Moduł Zegar">
        <span class="mc-dock-icon">🕰️</span>
        <span class="mc-dock-label">Zegar</span>
      </button>
      <button type="button" class="mc-dock-btn ${state.module === 'teraz' ? 'is-active' : ''}" data-module="teraz" aria-label="Moduł TERAZ">
        <span class="mc-dock-icon">⏱️</span>
        <span class="mc-dock-label">TERAZ</span>
      </button>
      <button type="button" class="mc-dock-btn ${state.module === 'calendar' ? 'is-active' : ''}" data-module="calendar" aria-label="Moduł Kalendarz">
        <span class="mc-dock-icon">📅</span>
        <span class="mc-dock-label">Kalendarz</span>
      </button>
      <button type="button" class="mc-dock-btn ${state.module === 'settings' ? 'is-active' : ''}" data-module="settings" aria-label="Moduł Ustawienia">
        <span class="mc-dock-icon">⚙️</span>
        <span class="mc-dock-label">Ustawienia</span>
      </button>
    </nav>
  `;
}

export function render() {
  const root = document.getElementById('ccMcApp');
  if (!root) return;

  if (!state.user) {
    if (state.isConnecting) {
      root.innerHTML = `
        <main class="mc-login-screen">
          <div class="mc-login-card">
            <h1 class="mc-login-title">Christian Culture Mission Calendar</h1>
            <div style="display:flex;align-items:center;justify-content:center;gap:12px;color:var(--mc-gold);font-weight:600;font-size:15px;margin:20px 0;">
              <svg class="mc-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
              <span>Weryfikacja aktywnej sesji Google LUMINA…</span>
            </div>
          </div>
        </main>
      `;
      return;
    }

    root.innerHTML = `
      <main class="mc-login-screen">
        <div class="mc-login-card">
          <h1 class="mc-login-title">Christian Culture Mission Calendar</h1>
          ${state.error ? `<div role="alert" style="padding:10px 14px;border-radius:10px;background:#451a1a;border:1px solid #ef4444;color:#fecaca;font-size:13px;width:100%;box-sizing:border-box;">${escapeHtml(state.error)}</div>` : ''}
          <button type="button" id="btnGoogleSignIn" class="mc-btn-login-google" aria-label="Zaloguj przez Google">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="flex-shrink:0;">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            </svg>
            <span>Zaloguj przez Google</span>
          </button>
        </div>
      </main>
    `;
    attachLoginHandler();
    return;
  }

  const filtered = getFilteredEvents();

  // MODEL PEŁNOEKRANOWY MODUŁOWY:
  // Moduł 1 na start: TYLKO ZEGAR (state.module === 'clock')
  // Po kliknięciu w zegar: Moduł pełnoekranowy TERAZ (state.module === 'teraz')
  // Moduł Kalendarz: Pełny widok tygodniowy/miesięczny/kanban (state.module === 'calendar')
  // Moduł Ustawienia: Tryb jasny/ciemny, 12 rutyn misji, powiadomienia push (state.module === 'settings')
  let mainContentHtml = '';
  if (state.module === 'clock') {
    mainContentHtml = renderClockModule();
  } else if (state.module === 'teraz') {
    mainContentHtml = renderTerazModule(filtered);
  } else if (state.module === 'settings') {
    mainContentHtml = renderSettingsModule();
  } else {
    mainContentHtml = renderCalendarModule(filtered);
  }

  root.innerHTML = `
    ${mainContentHtml}
    ${renderModuleDock()}
    ${
      state.undoAction
        ? `<div class="mc-undo-banner" role="status">
            <span>${escapeHtml(state.undoAction.label)}</span>
            <button type="button" id="btnUndoAction" class="mc-btn-gold">Cofnij (Undo)</button>
          </div>`
        : ''
    }
    ${renderModalHtml()}
  `;

  bindEvents();

  if (state.module === 'clock' && !state.clockDrawerOpen) {
    if (!state.clockIdleHidden) {
      scheduleClockIdleTimer();
    } else if (typeof document !== 'undefined') {
      document.body.classList.add('mc-clock-screensaver-idle');
    }
  } else {
    wakeClockIdleMode({ restartTimer: false });
  }

  if (state.module === 'teraz') {
    requestAnimationFrame(() => {
      const targetEl = document.getElementById('mcNowTimelineDivider') || document.querySelector('.mc-event-tile.is-current-now');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function findEventByKey(key) {
  return state.events.find((e) => (e.occurrence_id || e.id) === key || e.id === key);
}

function bindEvents() {
  // Nawigacja doku modułowego
  document.querySelectorAll('.mc-dock-btn[data-module]').forEach((btn) => {
    btn.onclick = () => {
      state.module = btn.getAttribute('data-module');
      render();
    };
  });

  // Powrót do Zegara
  const btnBackClock = document.getElementById('btnBackToClock');
  if (btnBackClock) {
    btnBackClock.onclick = () => {
      state.module = 'clock';
      render();
    };
  }

  // Interakcja z Zegarem (przejście do modułu pełnoekranowego TERAZ)
  const clockHero = document.getElementById('mcBiblicalClockHero');
  if (clockHero) {
    clockHero.onclick = () => {
      state.module = 'teraz';
      render();
    };
  }

  // Przełącznik "WIĘCEJ" pod zegarem
  const btnToggleMore = document.getElementById('btnClockToggleMore');
  if (btnToggleMore) {
    btnToggleMore.onclick = () => {
      state.clockShowMore = !state.clockShowMore;
      render();
    };
  }

  // Obsługa chowanego menu ustawień zegara w prawym górnym rogu
  const btnClockMenuToggle = document.getElementById('btnClockMenuToggle');
  if (btnClockMenuToggle) {
    btnClockMenuToggle.onclick = () => {
      state.clockDrawerOpen = !state.clockDrawerOpen;
      render();
    };
  }

  const btnCloseClockDrawer = document.getElementById('btnCloseClockDrawer');
  if (btnCloseClockDrawer) {
    btnCloseClockDrawer.onclick = () => {
      state.clockDrawerOpen = false;
      render();
    };
  }

  const clockDrawerBackdrop = document.getElementById('mcClockDrawerBackdrop');
  if (clockDrawerBackdrop) {
    clockDrawerBackdrop.onclick = () => {
      state.clockDrawerOpen = false;
      render();
    };
  }

  // Interakcja z rotacyjnym okienkiem "NA ŻYWO" pod zegarem (Ramówka ⇄ Zadanie TERAZ)
  document.querySelectorAll('[data-live-slide-btn]').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute('data-live-slide-btn'));
      state.liveSlideIndex = idx === 1 ? 1 : 0;
      state.liveSlideManualUntil = Date.now() + 12_000;
      updateLiveScreensaverDom(new Date());
    };
  });

  document.querySelectorAll('.mc-live-slide').forEach((slideEl) => {
    slideEl.onclick = () => {
      state.module = 'teraz';
      render();
    };
    slideEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.module = 'teraz';
        render();
      }
    };
  });

  // Szybkie akcje na karcie TERAZ
  document.querySelectorAll('[data-quick-done]').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-quick-done');
      const ev = findEventByKey(key);
      if (!ev) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(ev.id)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'done', version: ev.version }),
        });
        state.notice = `✓ Zadanie "${ev.title}" zostało oznaczone jako wykonane!`;
        await refreshData();
        render();
      } catch (err) {
        state.error = 'Błąd aktualizacji: ' + err.message;
        render();
      }
    };
  });

  document.querySelectorAll('[data-quick-start]').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-quick-start');
      const ev = findEventByKey(key);
      if (!ev) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(ev.id)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress', version: ev.version }),
        });
        state.notice = `▶ Rozpoczęto zadanie: "${ev.title}"!`;
        await refreshData();
        render();
      } catch (err) {
        state.error = 'Błąd aktualizacji: ' + err.message;
        render();
      }
    };
  });

  document.querySelectorAll('[data-quick-extend]').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-quick-extend');
      const ev = findEventByKey(key);
      if (!ev) return;
      try {
        const curEnd = ev.ends_at ? new Date(ev.ends_at) : new Date(Date.parse(ev.starts_at) + 3600_000);
        const newEndIso = new Date(curEnd.getTime() + 30 * 60_000).toISOString();
        await moveOrResizeEvent(ev, ev.starts_at, newEndIso, 'single');
        state.notice = `⏱️ Wydłużono zadanie o +30 min.`;
        await refreshData();
        render();
      } catch (err) {
        state.error = 'Błąd wydłużenia: ' + err.message;
        render();
      }
    };
  });

  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.onclick = () => {
      state.view = btn.getAttribute('data-view');
      state.mobileSidebarOpen = false;
      render();
    };
  });

  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.onclick = () => {
      state.category = btn.getAttribute('data-category');
      state.mobileSidebarOpen = false;
      render();
    };
  });

  document.querySelectorAll('[data-status-filter]').forEach((btn) => {
    btn.onclick = () => {
      state.statusFilter = btn.getAttribute('data-status-filter');
      render();
    };
  });

  document.querySelectorAll('[data-stats-scope]').forEach((btn) => {
    btn.onclick = () => {
      state.statsScope = btn.getAttribute('data-stats-scope');
      render();
    };
  });

  const btnMobile = document.getElementById('btnToggleMobileMenu');
  if (btnMobile) {
    btnMobile.onclick = () => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
      render();
    };
  }

  const btnPrev = document.getElementById('btnPrevPeriod');
  if (btnPrev) {
    btnPrev.onclick = async () => {
      state.anchorDate = new Date(state.anchorDate.getTime() - 7 * 86400_000);
      await refreshData();
      render();
    };
  }
  const btnNext = document.getElementById('btnNextPeriod');
  if (btnNext) {
    btnNext.onclick = async () => {
      state.anchorDate = new Date(state.anchorDate.getTime() + 7 * 86400_000);
      await refreshData();
      render();
    };
  }
  const btnToday = document.getElementById('btnToday');
  if (btnToday) {
    btnToday.onclick = async () => {
      state.anchorDate = new Date();
      state.view = 'today';
      state.terazFilter = false;
      await refreshData();
      render();
    };
  }

  document.querySelectorAll('.mc-clickable-clock').forEach((el) => {
    el.onclick = (e) => {
      e.preventDefault();
      state.module = 'teraz';
      state.view = 'today';
      state.terazFilter = false;
      render();
      requestAnimationFrame(() => {
        const targetEl = document.querySelector('.mc-event-tile.is-current-now') || document.getElementById('mcNowTimelineDivider');
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    };
  });

  const btnClearTeraz = document.getElementById('btnClearTerazFilter');
  if (btnClearTeraz) {
    btnClearTeraz.onclick = () => {
      state.terazFilter = false;
      render();
    };
  }

  const btnClearEmpty = document.getElementById('btnClearTerazFilterEmpty');
  if (btnClearEmpty) {
    btnClearEmpty.onclick = () => {
      state.terazFilter = false;
      render();
    };
  }

  const citySelect = document.getElementById('mcCitySelector');
  if (citySelect) {
    citySelect.onchange = () => {
      state.clockCity = citySelect.value;
      render();
    };
  }

  const searchInput = document.getElementById('mcSearchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.searchQuery = e.target.value;
      render();
    };
  }

  const btnPush = document.getElementById('btnEnablePush');
  if (btnPush) {
    btnPush.onclick = () => {
      state.module = 'settings';
      render();
      requestAnimationFrame(() => {
        const pushCard = document.getElementById('mcSettingsPushCard');
        if (pushCard) pushCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    };
  }

  const btnSettingsTogglePush = document.getElementById('btnSettingsTogglePush');
  if (btnSettingsTogglePush) btnSettingsTogglePush.onclick = enableWebPush;

  const btnNew = document.getElementById('btnNewTask');
  if (btnNew) {
    btnNew.onclick = () => {
      state.editingEvent = {
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 1800_000).toISOString(),
        status: 'todo',
        category: 'mission',
        priority: 2,
        project_id: 'general',
      };
      render();
    };
  }

  document.querySelectorAll('.mc-quick-add-day').forEach((btn) => {
    btn.onclick = () => {
      const datePrefix = btn.getAttribute('data-date');
      state.editingEvent = {
        starts_at: new Date(`${datePrefix}T09:00:00`).toISOString(),
        ends_at: new Date(`${datePrefix}T09:30:00`).toISOString(),
        status: 'todo',
        category: 'mission',
        priority: 2,
      };
      render();
    };
  });

  const btnClearErr = document.getElementById('btnClearError');
  if (btnClearErr) btnClearErr.onclick = () => { state.error = ''; render(); };
  const btnClearNot = document.getElementById('btnClearNotice');
  if (btnClearNot) btnClearNot.onclick = () => { state.notice = ''; render(); };

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.onclick = async () => {
      await apiRequest('/logout', { method: 'POST' });
      state.user = null;
      state.csrfToken = '';
      render();
    };
  }

  const btnUndo = document.getElementById('btnUndoAction');
  if (btnUndo && state.undoAction) {
    btnUndo.onclick = () => state.undoAction.revertFn();
  }

  // Natural Language Command Form
  const nlForm = document.getElementById('mcNlForm');
  if (nlForm) {
    nlForm.onsubmit = async (e) => {
      e.preventDefault();
      const cmd = new FormData(nlForm).get('nlCommand');
      if (!cmd) return;
      try {
        const res = await apiRequest('/nl-command', {
          method: 'POST',
          body: JSON.stringify({ command: cmd, commit: false }),
        });
        state.editingEvent = res.draft;
        state.notice = 'Noemi @077 przygotowała propozycję zadania — sprawdź i zatwierdź zapis.';
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  // Kafelki: edycja, przesunięcie przyciskami (alternatywa dla D&D), drag & drop
  document.querySelectorAll('.mc-tile-action').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-key');
      const action = btn.getAttribute('data-action');
      const ev = findEventByKey(key);
      if (!ev) return;

      if (action === 'edit') {
        state.editingEvent = { ...ev };
        render();
      } else if (action === 'quick-done') {
        try {
          await apiRequest(`/events/${encodeURIComponent(ev.series_id || ev.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'done', version: ev.version }),
          });
          await refreshData();
          render();
        } catch (err) {
          state.error = err.message;
          render();
        }
      } else if (action === 'quick-todo') {
        try {
          await apiRequest(`/events/${encodeURIComponent(ev.series_id || ev.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'todo', version: ev.version }),
          });
          await refreshData();
          render();
        } catch (err) {
          state.error = err.message;
          render();
        }
      } else if (action === 'shift-plus') {
        const newStart = new Date(Date.parse(ev.starts_at) + 1800_000).toISOString();
        const newEnd = ev.ends_at ? new Date(Date.parse(ev.ends_at) + 1800_000).toISOString() : null;
        await moveOrResizeEvent(ev, newStart, newEnd);
      } else if (action === 'extend') {
        const baseEnd = ev.ends_at ? Date.parse(ev.ends_at) : Date.parse(ev.starts_at) + 1800_000;
        const newEnd = new Date(baseEnd + 1800_000).toISOString();
        await moveOrResizeEvent(ev, ev.starts_at, newEnd);
      }
    };
  });

  document.querySelectorAll('.mc-event-tile').forEach((tile) => {
    tile.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', tile.getAttribute('data-event-key'));
    };
  });

  document.querySelectorAll('[data-drop-date]').forEach((col) => {
    col.ondragover = (e) => e.preventDefault();
    col.ondrop = async (e) => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      const ev = findEventByKey(key);
      if (!ev) return;
      const targetDate = col.getAttribute('data-drop-date');
      const localCurrent = toWarsawInput(ev.starts_at);
      const timePart = localCurrent.split('T')[1] || '09:00';
      const durationMs = ev.ends_at ? Date.parse(ev.ends_at) - Date.parse(ev.starts_at) : 1800_000;
      const newStartIso = new Date(`${targetDate}T${timePart}`).toISOString();
      const newEndIso = new Date(Date.parse(newStartIso) + durationMs).toISOString();
      await moveOrResizeEvent(ev, newStartIso, newEndIso);
    };
  });

  document.querySelectorAll('[data-drop-status]').forEach((col) => {
    col.ondragover = (e) => e.preventDefault();
    col.ondrop = async (e) => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      const ev = findEventByKey(key);
      if (!ev) return;
      const targetStatus = col.getAttribute('data-drop-status');
      let reason = ev.not_done_reason || null;
      if (targetStatus === 'not_done' && !reason) {
        reason = window.prompt('Podaj obowiązkowy powód niezrealizowania zadania:');
        if (!reason) return;
      }
      try {
        await apiRequest(`/events/${encodeURIComponent(ev.series_id || ev.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, not_done_reason: reason, version: ev.version }),
        });
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  });

  // Rejestracja tokenu agenta
  const btnRegAgent = document.getElementById('btnRegisterAgent');
  if (btnRegAgent) {
    btnRegAgent.onclick = async () => {
      const name = window.prompt('Podaj identyfikator agenta (np. @077, @OA, @A001, @Codex, @Claude):', '@077');
      if (!name) return;
      try {
        const res = await apiRequest('/agents', {
          method: 'POST',
          body: JSON.stringify({
            name,
            scopes: ['events:read', 'events:claim', 'events:report'],
            capabilities: ['general', 'code', 'media'],
          }),
        });
        state.notice = `Utworzono token dla ${res.agent.name}. Skopiuj go teraz (w bazie zapisano wyłącznie hash SHA-256): ${res.token}`;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  // Modal Formularza
  const statusSelect = document.getElementById('mcStatusSelect');
  const reasonWrap = document.getElementById('mcNotDoneReasonWrap');
  if (statusSelect && reasonWrap) {
    statusSelect.onchange = () => {
      reasonWrap.style.display = statusSelect.value === 'not_done' ? 'grid' : 'none';
    };
  }

  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) btnCloseModal.onclick = () => { state.editingEvent = null; render(); };

  const modalForm = document.getElementById('mcEventForm');
  if (modalForm) {
    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(modalForm);
      const ev = state.editingEvent;
      const payload = {
        title: fd.get('title'),
        description: fd.get('description'),
        starts_at: new Date(fd.get('starts_at')).toISOString(),
        ends_at: fd.get('ends_at') ? new Date(fd.get('ends_at')).toISOString() : null,
        status: fd.get('status'),
        not_done_reason: fd.get('not_done_reason') || null,
        category: fd.get('category'),
        priority: Number(fd.get('priority')),
        assigned_to: fd.get('assigned_to') || null,
        project_id: fd.get('project_id') || 'general',
        rrule: fd.get('rrule') || null,
        is_private: fd.get('is_private') === 'on',
        version: ev.version,
      };
      try {
        const targetId = ev.series_id || ev.id;
        if (targetId) {
          await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
        } else {
          await apiRequest('/events', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnRouteOA = document.getElementById('btnRouteOA');
  if (btnRouteOA && state.editingEvent?.id) {
    btnRouteOA.onclick = async () => {
      try {
        const res = await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/assign`, {
          method: 'POST',
          body: JSON.stringify({ assignee: '@OA' }),
        });
        state.editingEvent = null;
        state.notice = `Zadanie przydzielone przez router @OA do: ${res.event.assigned_to}`;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnApprove = document.getElementById('btnApproveResult');
  if (btnApprove && state.editingEvent?.id) {
    btnApprove.onclick = async () => {
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/approve`, {
          method: 'POST',
        });
        state.editingEvent = null;
        state.notice = 'Rezultat agenta zatwierdzony — status zmieniony na Zrealizowane (✓).';
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnReject = document.getElementById('btnRejectResult');
  if (btnReject && state.editingEvent?.id) {
    btnReject.onclick = async () => {
      const reason = window.prompt('Podaj uwagi do poprawki dla agenta:', 'Wymagane uzupełnienie testów');
      if (!reason) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnDelete = document.getElementById('btnDeleteEvent');
  if (btnDelete && state.editingEvent?.id) {
    btnDelete.onclick = async () => {
      if (!window.confirm('Czy na pewno usunąć to zadanie?')) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}`, {
          method: 'DELETE',
        });
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  // Ustawienia: Zmiana motywu (Biały vs Czarny)
  const btnThemeLight = document.getElementById('btnThemeLight');
  if (btnThemeLight) {
    btnThemeLight.onclick = () => {
      applyTheme('light');
      render();
    };
  }

  const btnThemeDark = document.getElementById('btnThemeDark');
  if (btnThemeDark) {
    btnThemeDark.onclick = () => {
      applyTheme('dark');
      render();
    };
  }

  const btnQuickThemeToggle = document.getElementById('btnQuickThemeToggle');
  if (btnQuickThemeToggle) {
    btnQuickThemeToggle.onclick = () => {
      applyTheme(state.theme === 'light' ? 'dark' : 'light');
      render();
    };
  }

  // Ustawienia: Synchronizacja rutyn misyjnych (/automation)
  const btnSyncRoutines = document.getElementById('btnSyncRoutines');
  if (btnSyncRoutines) {
    btnSyncRoutines.onclick = async () => {
      btnSyncRoutines.disabled = true;
      btnSyncRoutines.textContent = 'Trwa synchronizacja…';
      try {
        const res = await apiRequest('/routines/seed', { method: 'POST' });
        await refreshData();
        state.notice = `Pomyślnie zsynchronizowano ${res.count || 12} zaplanowanych rutyn misyjnych (/automation) w kalendarzu!`;
      } catch (err) {
        state.error = 'Błąd synchronizacji rutyn: ' + err.message;
      } finally {
        render();
      }
    };
  }

  // Ustawienia: Integracja Google Calendar (SSO LUMINA + OAuth Calendar API)
  const btnConnectGcal = document.getElementById('btnConnectGcal');
  if (btnConnectGcal) {
    btnConnectGcal.onclick = async () => {
      btnConnectGcal.disabled = true;
      btnConnectGcal.textContent = 'Autoryzacja Google SSO LUMINA…';
      try {
        const res = await apiRequest('/gcal/connect', {
          method: 'POST',
          body: JSON.stringify({
            calendarName: 'Christian Culture — Misja',
            syncMode: state.gcal?.syncMode || 'bidirectional',
            scopes: [
              'https://www.googleapis.com/auth/calendar.events',
              'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
            ],
          }),
        });
        state.gcal = { ...state.gcal, ...res };
        await refreshData();
        state.notice = `Połączono z Google Calendar („${res.calendarName || 'Christian Culture — Misja'}”) w trybie ${res.syncMode}!`;
      } catch (err) {
        state.error = 'Błąd połączenia Google Calendar: ' + err.message;
      } finally {
        render();
      }
    };
  }

  const btnDisconnectGcal = document.getElementById('btnDisconnectGcal');
  if (btnDisconnectGcal) {
    btnDisconnectGcal.onclick = async () => {
      try {
        await apiRequest('/gcal/disconnect', { method: 'POST', body: JSON.stringify({}) });
        await refreshData();
        state.notice = 'Bezpiecznie odłączono Google Calendar i usunięto zaszyfrowane tokeny serwerowe.';
      } catch (err) {
        state.error = 'Błąd odłączania Google Calendar: ' + err.message;
      }
      render();
    };
  }

  const btnEnsureDedicatedGcal = document.getElementById('btnEnsureDedicatedGcal');
  if (btnEnsureDedicatedGcal) {
    btnEnsureDedicatedGcal.onclick = async () => {
      try {
        if (!state.gcal?.connected) {
          const connected = await apiRequest('/gcal/connect', {
            method: 'POST',
            body: JSON.stringify({
              calendarName: 'Christian Culture — Misja',
              syncMode: state.gcal?.syncMode || 'bidirectional',
            }),
          });
          state.gcal = { ...state.gcal, ...connected };
        } else {
          const res = await apiRequest('/gcal/calendars/ensure', {
            method: 'POST',
            body: JSON.stringify({
              calendarName: 'Christian Culture — Misja',
              syncMode: state.gcal?.syncMode || 'bidirectional',
            }),
          });
          state.gcal = { ...state.gcal, ...res };
        }
        await refreshData();
        state.notice = 'Wskazano dedykowany kalendarz „Christian Culture — Misja”!';
      } catch (err) {
        state.error = 'Błąd wyboru kalendarza: ' + err.message;
      }
      render();
    };
  }

  const gcalCalSelect = document.getElementById('mcGcalCalendarSelect');
  if (gcalCalSelect) {
    gcalCalSelect.onchange = async () => {
      const selectedId = gcalCalSelect.value;
      const selectedText = gcalCalSelect.options[gcalCalSelect.selectedIndex]?.text?.replace(/\s*\(Dedykowany\)$/, '') || 'Christian Culture — Misja';
      state.gcal.calendarId = selectedId;
      state.gcal.calendarName = selectedText;
      if (state.gcal.connected) {
        try {
          const res = await apiRequest('/gcal/settings', {
            method: 'PATCH',
            body: JSON.stringify({ calendarId: selectedId, calendarName: selectedText }),
          });
          state.gcal = { ...state.gcal, ...res };
          state.notice = `Przełączono aktywny kalendarz Google na: ${selectedText}`;
        } catch (err) {
          state.error = err.message;
        }
      }
      render();
    };
  }

  document.querySelectorAll('[data-gcal-sync-mode]').forEach((btn) => {
    btn.onclick = async () => {
      const nextMode = btn.getAttribute('data-gcal-sync-mode');
      state.gcal.syncMode = nextMode;
      if (state.gcal.connected) {
        try {
          const res = await apiRequest('/gcal/settings', {
            method: 'PATCH',
            body: JSON.stringify({ syncMode: nextMode }),
          });
          state.gcal = { ...state.gcal, ...res };
          state.notice = `Zmieniono tryb synchronizacji Google Calendar na: ${nextMode}`;
        } catch (err) {
          state.error = err.message;
        }
      }
      render();
    };
  });

  const btnSyncGcalNow = document.getElementById('btnSyncGcalNow');
  if (btnSyncGcalNow) {
    btnSyncGcalNow.onclick = async () => {
      btnSyncGcalNow.disabled = true;
      btnSyncGcalNow.textContent = 'Synchronizuję…';
      try {
        const res = await apiRequest('/gcal/sync', {
          method: 'POST',
          body: JSON.stringify({ mode: state.gcal?.syncMode || 'bidirectional' }),
        });
        await refreshData();
        state.notice = `Synchronizacja Google Calendar zakończona (eksport: ${res.exported}, import: ${res.imported}, aktualizacje: ${res.updated})!`;
      } catch (err) {
        state.error = 'Błąd synchronizacji Google Calendar: ' + err.message;
      } finally {
        render();
      }
    };
  }

  const btnRenewGcalWatch = document.getElementById('btnRenewGcalWatch');
  if (btnRenewGcalWatch) {
    btnRenewGcalWatch.onclick = async () => {
      try {
        await apiRequest('/gcal/watch/renew', { method: 'POST', body: JSON.stringify({}) });
        await refreshData();
        state.notice = 'Kanał webhooka Push Google Calendar został odnowiony na kolejne 7 dni.';
      } catch (err) {
        state.error = 'Błąd odnawiania kanału Push: ' + err.message;
      }
      render();
    };
  }

  // Ustawienia: Test powiadomienia Push
  const btnTestPush = document.getElementById('btnTestPush');
  if (btnTestPush) {
    btnTestPush.onclick = async () => {
      try {
        const res = await apiRequest('/push/test', { method: 'POST', body: JSON.stringify({}) });
        if (res.suppressedByQuietHours) {
          state.notice = res.message || 'Cisza nocna 22:00–06:00 — powiadomienie wstrzymane.';
        } else {
          state.notice = 'Wysłano testowe powiadomienie Push.';
        }
      } catch (err) {
        state.error = 'Błąd testu Push: ' + err.message;
      }
      render();
    };
  }

  const btnClearError = document.getElementById('btnClearError');
  if (btnClearError) btnClearError.onclick = () => { state.error = ''; render(); };

  const btnClearNotice = document.getElementById('btnClearNotice');
  if (btnClearNotice) btnClearNotice.onclick = () => { state.notice = ''; render(); };
}

if (typeof window !== 'undefined' && document.getElementById('ccMcApp')) {
  if (!window._mcKeyboardEscapeAttached) {
    window._mcKeyboardEscapeAttached = true;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.clockDrawerOpen) {
        state.clockDrawerOpen = false;
        render();
        return;
      }
      if (state.module === 'clock' && state.clockIdleHidden) {
        wakeClockIdleMode({ restartTimer: true });
      }
    });

    // Wygaszacz po 5 sekundach: kliknięcie w dowolnym miejscu na stronie zegara przywraca wszystkie ukryte elementy
    document.addEventListener(
      'click',
      (e) => {
        if (state.module !== 'clock') return;
        if (state.clockIdleHidden) {
          e.stopPropagation();
          e.preventDefault();
          wakeClockIdleMode({ restartTimer: true });
          return;
        }
        if (!state.clockDrawerOpen) {
          scheduleClockIdleTimer();
        }
      },
      true
    );
  }

  if (!window._mcLiveClockInterval) {
    let lastTickSecond = -1;
    let lastMinuteChecked = -1;
    window._mcLiveClockInterval = setInterval(() => {
      const now = new Date();
      const timeStr = formatWarsawTimeWithSeconds(now);

      const topDigits = document.getElementById('mcTopbarClockDigits');
      if (topDigits) topDigits.textContent = timeStr;

      const digTime = document.getElementById('digital-time');
      if (digTime) digTime.textContent = timeStr;

      const liveClock = document.getElementById('mcTodayLiveClock');
      if (liveClock) liveClock.textContent = timeStr;

      const terazClock = document.getElementById('mcTerazLiveClock');
      if (terazClock) terazClock.textContent = timeStr;

      // Animacja przeskakującej sekundy i przestrzennego podświetlenia obrzeża tarczy zegara
      const sec = now.getSeconds();
      if (sec !== lastTickSecond) {
        updateClockSpatialRimDom(sec);
        lastTickSecond = sec;

        // Aktualizacja licznika Szabatu
        const countdownEl = document.getElementById('sabbath-countdown');
        if (countdownEl) {
          const [lat, lng] = (state.clockCity || '52.2297,21.0122').split(',').map(Number);
          const bState = getBiblicalTimeState(now, lat, lng);
          countdownEl.textContent = formatCountdown(bState.sabbathTargetDate - now);
        }

        // Aktualizacja w czasie rzeczywistym i rotacja okienka "NA ŻYWO" (Ramówka ⇄ Zadanie TERAZ)
        updateLiveScreensaverDom(now);

        // Inteligentny Silnik Real-Time: automatyczne odświeżenie przy zmianie minuty
        const curMin = now.getHours() * 60 + now.getMinutes();
        if (curMin !== lastMinuteChecked) {
          lastMinuteChecked = curMin;
          if (state.realtimeEngine && (state.module === 'teraz' || state.module === 'calendar')) {
            render();
          }
        }
      }
    }, 250);
  }
  attachLoginHandler();
  loadInitialSession();
}
