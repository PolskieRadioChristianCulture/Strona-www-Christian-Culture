/**
 * Czysta logika domenowa dla aplikacji „Odkryj Biblię — dla katolików” (/test/katolik -> /katolik).
 * Zero zależności zewnętrznych; w pełni testowalna jednostkowo w Node oraz używana bezpośrednio w przeglądarce.
 */

export const PROGRESS_STORAGE_KEY = 'cc_katolik_plan_progress_v1';
export const AUDIO_RESUME_KEY = 'cc_katolik_audio_resume_v1';
export const THEME_STORAGE_KEY = 'cc_katolik_theme_v1';

export const KNOWN_MODULES = new Set([
  '',
  'mapa-biblii',
  'plan-365',
  'biblia-audio',
  'poznaj-jezusa',
  'zbawienie',
  'modlitwa',
  'biblia-a-tradycja',
  'dekalog',
  'jedyny-posrednik',
  'po-smierci',
  'powrot-jezusa',
  'proroctwa',
  'pytania',
  'ai',
  'nadzieja',
  'wiadomosc-z-nieba',
  'o-projekcie',
]);

const PL_DIACRITICS = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
};

/** Normalizacja do wyszukiwania bez polskich znaków i wielkości liter */
export function normalizePolish(input) {
  return String(input || '')
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => PL_DIACRITICS[ch] || ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bezpieczne escapowanie HTML dla dowolnego tekstu */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Walidacja bezpiecznego URL (http/https/ścieżka względna/tel/mailto) */
export function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Dzisiejsza data YYYY-MM-DD w strefie Europe/Warsaw (bez błędów DST) */
export function todayWarsawIso(dateObj = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(dateObj);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // fallback niżej
  }
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Ścisła walidacja daty kalendarzowej YYYY-MM-DD (w tym obsługa 29 lutego w latach przestępnych) */
export function isValidIsoDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Różnica pełnych dni kalendarzowych między dwiema datami YYYY-MM-DD (UTC midnight — odporna na zmianę czasu DST) */
export function diffDaysIso(startIso, endIso) {
  if (!isValidIsoDate(startIso) || !isValidIsoDate(endIso)) return 0;
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const msStart = Date.UTC(sy, sm - 1, sd);
  const msEnd = Date.UTC(ey, em - 1, ed);
  return Math.round((msEnd - msStart) / 86400000);
}

/** Dodanie n dni do daty YYYY-MM-DD (UTC — odporne na DST i 29 lutego) */
export function addDaysIso(startIso, deltaDays) {
  if (!isValidIsoDate(startIso)) return todayWarsawIso();
  const [y, m, d] = startIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + Number(deltaDays || 0)));
  const ny = dt.getUTCFullYear();
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(dt.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

/** Wyliczenie bieżącego dnia planu 1..totalDays dla zadanej daty startu i dzisiaj */
export function computeCurrentPlanDay(startDateIso, todayIso, totalDays = 365) {
  const diff = diffDaysIso(startDateIso, todayIso);
  if (diff < 0) {
    return { dayNumber: 1, isBeforeStart: true, isFinished: false, daysElapsed: diff };
  }
  const rawDay = diff + 1;
  if (rawDay > totalDays) {
    return { dayNumber: totalDays, isBeforeStart: false, isFinished: true, daysElapsed: diff };
  }
  return { dayNumber: rawDay, isBeforeStart: false, isFinished: false, daysElapsed: diff };
}

/** Domyślny obiekt postępu planu */
export function createDefaultProgress(startDateIso = todayWarsawIso()) {
  const safeDate = isValidIsoDate(startDateIso) ? startDateIso : todayWarsawIso();
  return {
    version: 1,
    startDate: safeDate,
    completedDays: [],
    starterCompletedDays: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Walidacja i oczyszczanie importowanego/odczytanego JSON postępu */
export function validateAndSanitizeProgress(raw, fallbackStartDate = todayWarsawIso()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Nieprawidłowy format pliku JSON (oczekiwano obiektu).' };
  }
  if (raw.version !== 1) {
    return { ok: false, error: 'Nieobsługiwana wersja pliku postępu (wymagana wersja 1).' };
  }
  const startDate = typeof raw.startDate === 'string' && isValidIsoDate(raw.startDate)
    ? raw.startDate
    : null;
  if (!startDate) {
    return { ok: false, error: 'Nieprawidłowa data rozpoczęcia planu (wymagany format RRRR-MM-DD).' };
  }
  if (!Array.isArray(raw.completedDays)) {
    return { ok: false, error: 'Brak poprawnej listy ukończonych dni (completedDays).' };
  }
  const cleanDays = Array.from(
    new Set(
      raw.completedDays
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 365)
    )
  ).sort((a, b) => a - b);

  const rawStarter = Array.isArray(raw.starterCompletedDays) ? raw.starterCompletedDays : [];
  const cleanStarter = Array.from(
    new Set(
      rawStarter
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 21)
    )
  ).sort((a, b) => a - b);

  return {
    ok: true,
    progress: {
      version: 1,
      startDate: startDate || fallbackStartDate,
      completedDays: cleanDays,
      starterCompletedDays: cleanStarter,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : new Date().toISOString(),
    },
  };
}

/** Obliczanie metryk postępu planu (procent, zaległe dni bez zawstydzania, najbliższy nieukończony dzień) */
export function computeProgressMetrics(progress, todayIso = todayWarsawIso(), totalDays = 365) {
  const completedSet = new Set(progress?.completedDays || []);
  const { dayNumber, isBeforeStart, isFinished } = computeCurrentPlanDay(progress?.startDate || todayIso, todayIso, totalDays);
  const completedCount = completedSet.size;
  const percent = Math.round((completedCount / totalDays) * 1000) / 10;

  const overdueDays = [];
  if (!isBeforeStart) {
    const checkUntil = isFinished ? totalDays : dayNumber - 1;
    for (let d = 1; d <= checkUntil; d += 1) {
      if (!completedSet.has(d)) overdueDays.push(d);
    }
  }

  let nextUnreadDay = null;
  for (let d = dayNumber; d <= totalDays; d += 1) {
    if (!completedSet.has(d)) {
      nextUnreadDay = d;
      break;
    }
  }
  if (nextUnreadDay === null) {
    for (let d = 1; d < dayNumber; d += 1) {
      if (!completedSet.has(d)) {
        nextUnreadDay = d;
        break;
      }
    }
  }

  return {
    todayDay: dayNumber,
    isBeforeStart,
    isFinished,
    completedCount,
    totalDays,
    percent,
    overdueDays,
    nextUnreadDay,
  };
}

/** Bezpieczny parser ścieżki obsługujący prefiks testowy /test/katolik oraz przyszły produkcyjny /katolik */
export function parseKatolikRoute(pathname) {
  const clean = String(pathname || '/test/katolik').split('?')[0].split('#')[0];
  let basePath = '/test/katolik';
  let rest = '';

  if (clean === '/test/katolik' || clean.startsWith('/test/katolik/')) {
    basePath = '/test/katolik';
    rest = clean.slice('/test/katolik'.length);
  } else if (clean === '/katolik' || clean.startsWith('/katolik/')) {
    basePath = '/katolik';
    rest = clean.slice('/katolik'.length);
  } else {
    rest = clean;
  }

  const segments = rest
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));

  if (segments.length === 0 || segments[0] === 'index.html') {
    return { basePath, moduleSlug: '', param: null, isUnknown: false };
  }

  const moduleSlug = segments[0].toLowerCase();
  const param = segments[1] ? segments[1].toUpperCase() : null;

  if (!KNOWN_MODULES.has(moduleSlug)) {
    return { basePath, moduleSlug, param, isUnknown: true };
  }

  return { basePath, moduleSlug, param, isUnknown: false };
}

/** Filtrowanie 66 ksiąg Biblii (testament, gatunek, temat, wyszukiwanie bez polskich znaków) */
export function filterBooks(books, { query = '', testament = 'ALL', genre = 'ALL', theme = 'ALL' } = {}) {
  const q = normalizePolish(query);
  return (books || []).filter((b) => {
    if (testament !== 'ALL' && b.testament !== testament) return false;
    if (genre !== 'ALL' && b.genre !== genre) return false;
    if (theme !== 'ALL' && !(b.themes || []).includes(theme)) return false;
    if (!q) return true;
    const haystack = normalizePolish([
      b.name,
      b.id,
      ...(b.aliases || []),
      b.genre,
      b.era,
      b.teaser,
      ...(b.themes || []),
    ].join(' '));
    return haystack.includes(q);
  });
}

/** Filtrowanie FAQ (kategoria + wyszukiwanie pełnotekstowe bez polskich znaków) */
export function filterFaq(faqList, { query = '', category = 'ALL' } = {}) {
  const q = normalizePolish(query);
  return (faqList || []).filter((item) => {
    if (category !== 'ALL' && item.category !== category) return false;
    if (!q) return true;
    const haystack = normalizePolish([
      item.question,
      item.answer,
      item.category,
      ...(item.refs || []).map((r) => `${r.label} ${r.text}`),
    ].join(' '));
    return haystack.includes(q);
  });
}
