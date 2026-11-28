/**
 * data.js — Moduł danych Biblii UBG, nagrań Biblii Audio i walidacji parametrów URL.
 * Zero fabrykowania wersetów: całość tekstu Pisma pochodzi wyłącznie z /data/bible/szukaj-ubg.json.
 */

export const UBG_URL = '/data/bible/szukaj-ubg.json?v=20261013_1';
export const META_URL = '/data/bible/bible_books_metadata.json';
export const AUDIO_CATALOG_URL = '/biblia-audio/data/catalog.json';
const CACHE_NAME = 'cc-sba-ubg-cache-v1';

const STOP_WORDS = new Set([
  'aby', 'albo', 'ale', 'ani', 'aż', 'bardzo', 'bez', 'bo', 'bowiem', 'by', 'być', 'był', 'była', 'było', 'byli',
  'będzie', 'będą', 'będziesz', 'co', 'czy', 'dla', 'do', 'gdy', 'gdyż', 'gdzie', 'go', 'ich', 'iż', 'jak', 'jako',
  'jeśli', 'jest', 'jesteś', 'jeszcze', 'już', 'kto', 'który', 'która', 'które', 'którzy', 'lecz', 'lub', 'ma', 'mają',
  'mnie', 'mną', 'mój', 'moja', 'moje', 'może', 'mu', 'my', 'na', 'nad', 'nam', 'nami', 'nas', 'nawet', 'nie', 'niech',
  'niego', 'niej', 'nich', 'nim', 'niż', 'no', 'od', 'oraz', 'oto', 'pan', 'pana', 'panie', 'panu', 'po', 'pod', 'ponieważ',
  'przed', 'przez', 'przy', 'sam', 'się', 'sobie', 'sobą', 'są', 'tak', 'także', 'tam', 'też', 'tego', 'tej', 'ten', 'to',
  'tobie', 'tobą', 'tylko', 'tym', 'ty', 'u', 'wam', 'wami', 'was', 'we', 'więc', 'wszyscy', 'wszystko', 'wtedy', 'wy',
  'za', 'zaś', 'ze', 'że', 'żeby', 'z', 'i', 'w', 'o', 'a', 'ku', 'nad', 'pod'
]);

const BOOK_ALIASES = {
  genesis: 'GEN', exodus: 'EXO', leviticus: 'LEV', numbers: 'NUM', deuteronomy: 'DEU',
  psalms: 'PSA', john: 'JHN', proverbs: 'PRO', revelation: 'REV'
};

export function siteUrl(path) {
  const origin = typeof location !== 'undefined' && location.origin && location.origin !== 'null'
    ? location.origin
    : 'https://polskieradio.cc';
  return new URL(path, origin);
}

export function ecosystemUrl(path) {
  const origin = typeof location !== 'undefined' && (location.hostname === 'polskieradio.cc' || location.hostname === 'www.polskieradio.cc' || location.hostname.endsWith('.polskieradio.pages.dev') || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? location.origin
    : 'https://polskieradio.cc';
  return new URL(path, origin);
}

/**
 * Bezpieczne parsowanie parametrów fragmentu z URL.
 * Nigdy nie przenosi i nie odczytuje prywatnych notatek ani modlitw z URL.
 */
export function parseStudyParams(searchStr = '') {
  const qs = typeof searchStr === 'string'
    ? searchStr
    : (typeof location !== 'undefined' ? location.search : '');
  const sp = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  const rawBook = (sp.get('book') || '').trim().toUpperCase();
  const rawCh = (sp.get('ch') || '').trim();
  const rawV = (sp.get('v') || '').trim();
  const rawEnd = (sp.get('end') || rawV).trim();
  const rawTr = (sp.get('translation') || 'UBG').trim().toUpperCase();
  const rawStudyId = (sp.get('study') || '').trim();

  const hasAnyParam = Boolean(rawBook || rawCh || rawV || sp.has('book') || sp.has('ch') || sp.has('v'));
  const ch = /^\d+$/.test(rawCh) ? Number(rawCh) : NaN;
  const v = /^\d+$/.test(rawV) ? Number(rawV) : NaN;
  const end = /^\d+$/.test(rawEnd) ? Number(rawEnd) : v;

  return {
    hasAnyParam,
    book: /^[1-3]?[A-Z]{2,3}$/.test(rawBook) ? rawBook : '',
    ch,
    v,
    end,
    translation: rawTr === 'UBG' ? 'UBG' : rawTr,
    studyId: /^[a-zA-Z0-9_-]{4,80}$/.test(rawStudyId) ? rawStudyId : ''
  };
}

/**
 * Waliduje parametry fragmentu względem załadowanej bazy ksiąg i rozdziałów UBG.
 */
export function validatePassage(bible, params) {
  const defaultFallback = { book: 'JHN', ch: 3, v: 16, end: 16, translation: 'UBG' };
  if (!bible || !bible.booksMap || !bible.chapters) {
    return { ok: false, reason: 'Baza Biblii UBG nie została jeszcze załadowana.', fallback: defaultFallback };
  }
  if (!params || !params.hasAnyParam) {
    return { ok: true, isDefault: true, passage: defaultFallback };
  }
  if (params.translation && params.translation !== 'UBG') {
    return {
      ok: false,
      reason: `Przekład „${params.translation}” nie jest dostępny w lokalnym trybie Głębokiego studium (obsługiwany jest przekład UBG).`,
      fallback: defaultFallback
    };
  }
  if (!params.book || !bible.booksMap.has(params.book)) {
    return {
      ok: false,
      reason: 'Podany kod księgi biblijnej jest nieprawidłowy lub nie istnieje w kanonie UBG.',
      fallback: defaultFallback
    };
  }
  const meta = bible.booksMap.get(params.book);
  if (!Number.isInteger(params.ch) || params.ch < 1 || params.ch > meta.chapters) {
    return {
      ok: false,
      reason: `Rozdział ${Number.isFinite(params.ch) ? params.ch : '?'} nie istnieje w księdze ${meta.namePl} (zakres: 1–${meta.chapters}).`,
      fallback: { book: params.book, ch: 1, v: 1, end: 1, translation: 'UBG' }
    };
  }
  const chapterKey = `${params.book}.${params.ch}`;
  const verses = bible.chapters.get(chapterKey) || [];
  if (!verses.length) {
    return {
      ok: false,
      reason: `Brak wersetów dla ${meta.namePl} ${params.ch}.`,
      fallback: defaultFallback
    };
  }
  const maxVerse = verses[verses.length - 1].number;
  if (!Number.isInteger(params.v) || params.v < 1 || params.v > maxVerse) {
    return {
      ok: false,
      reason: `Werset ${Number.isFinite(params.v) ? params.v : '?'} nie istnieje w ${meta.namePl} ${params.ch} (maks. ${maxVerse}).`,
      fallback: { book: params.book, ch: params.ch, v: 1, end: 1, translation: 'UBG' }
    };
  }
  const vEnd = Number.isInteger(params.end) ? params.end : params.v;
  if (vEnd < params.v || vEnd > maxVerse) {
    return {
      ok: false,
      reason: `Zakres wersetów ${params.v}–${vEnd} wykracza poza rozdział ${meta.namePl} ${params.ch} (1–${maxVerse}).`,
      fallback: { book: params.book, ch: params.ch, v: params.v, end: params.v, translation: 'UBG' }
    };
  }
  return {
    ok: true,
    isDefault: false,
    passage: { book: params.book, ch: params.ch, v: params.v, end: vEnd, translation: 'UBG' }
  };
}

export function buildBibleIndex(indexJson, metadataJson) {
  if (!indexJson || !Array.isArray(indexJson.b) || !Array.isArray(indexJson.r) || !Array.isArray(metadataJson)) {
    throw new Error('Nieprawidłowy format danych Biblii UBG');
  }
  const books = metadataJson.map((entry) => ({
    ...entry,
    namePl: entry.id === 'JHN' ? 'Ewangelia Jana' : entry.namePl
  }));
  const booksMap = new Map(books.map((b) => [b.id, b]));
  const chapters = new Map();
  const byKey = new Map();

  for (const row of indexJson.r) {
    const [bookIdx, chapter, number, text] = row;
    const book = indexJson.b[bookIdx];
    if (!booksMap.has(book) || !Number.isInteger(chapter) || !Number.isInteger(number) || typeof text !== 'string') continue;
    const cleanText = text.trim();
    if (!cleanText) continue;
    const chapterKey = `${book}.${chapter}`;
    const key = `${chapterKey}.${number}`;
    if (byKey.has(key)) continue;
    const meta = booksMap.get(book);
    const verse = {
      book,
      chapter,
      number,
      text: cleanText,
      key,
      name: meta.namePl,
      short: meta.shortPl,
      testament: meta.testament === 'NT' ? 'NT' : 'OT'
    };
    let list = chapters.get(chapterKey);
    if (!list) {
      list = [];
      chapters.set(chapterKey, list);
    }
    list.push(verse);
    byKey.set(key, verse);
  }
  for (const list of chapters.values()) list.sort((a, b) => a.number - b.number);
  return { books, booksMap, chapters, byKey, verses: [...byKey.values()] };
}

async function fetchJsonWithCache(path) {
  const url = siteUrl(path);
  let cache = null;
  if (typeof caches !== 'undefined') {
    try {
      cache = await caches.open(CACHE_NAME);
    } catch {
      cache = null;
    }
  }
  try {
    const res = await fetch(url.href, { signal: AbortSignal.timeout(18000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const clone = res.clone();
    const data = await res.json();
    if (cache) cache.put(url.href, clone).catch(() => {});
    return data;
  } catch (networkErr) {
    if (cache) {
      const cached = await cache.match(url.href);
      if (cached) return cached.json();
    }
    throw networkErr;
  }
}

export async function loadBibleData() {
  try {
    const [indexJson, metadataJson] = await Promise.all([
      fetchJsonWithCache(UBG_URL),
      fetchJsonWithCache(META_URL)
    ]);
    return { ok: true, bible: buildBibleIndex(indexJson, metadataJson) };
  } catch (error) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return {
      ok: false,
      offline,
      error: offline
        ? 'Tryb offline: brak lokalnie zapisanej kopii Biblii UBG. Połącz się z siecią, aby pobrać tekst do pamięci podręcznej.'
        : 'Nie udało się wczytać tekstu Biblii UBG z serwera. Sprawdź połączenie i odśwież stronę.'
    };
  }
}

export async function loadAudioCatalog() {
  try {
    const catalog = await fetchJsonWithCache(AUDIO_CATALOG_URL);
    if (!Array.isArray(catalog)) return new Map();
    const map = new Map();
    for (const item of catalog) {
      if (item.status !== 'published' || !Number.isInteger(item.chapter) || typeof item.book !== 'string') continue;
      const code = BOOK_ALIASES[item.book.toLowerCase()] || item.book.toUpperCase();
      map.set(`${code}.${item.chapter}`, item);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function resolveChapterAudio(recordingsMap, bookId, ch, v = 1) {
  if (!recordingsMap) return null;
  const item = recordingsMap.get(`${bookId}.${ch}`);
  if (!item) return null;
  if (Array.isArray(item.audioParts) && item.audioParts.length) {
    for (const part of item.audioParts) {
      const match = typeof part.verses === 'string' && part.verses.trim().match(/^(\d+)(?:\s*[-–—]\s*(\d+))?$/);
      if (!match) continue;
      const start = Number(match[1]);
      const end = Number(match[2] || match[1]);
      if (v >= start && v <= end && typeof part.url === 'string' && part.url.startsWith('https://')) {
        return { url: part.url, title: `${item.bookTitlePl || bookId} ${ch}:${part.verses}` };
      }
    }
  }
  if (typeof item.audioUrl === 'string' && item.audioUrl.startsWith('https://')) {
    return { url: item.audioUrl, title: `${item.bookTitlePl || bookId} ${ch}` };
  }
  return null;
}

export function formatRef(bible, bookId, ch, vStart, vEnd) {
  const name = bible?.booksMap?.get(bookId)?.namePl || bookId;
  if (!vStart || !vEnd || vStart === vEnd) return `${name} ${ch}:${vStart || 1}`;
  return `${name} ${ch}:${vStart}–${vEnd}`;
}

export function getVerseRange(bible, bookId, ch, vStart, vEnd) {
  if (!bible) return [];
  const chapter = bible.chapters.get(`${bookId}.${ch}`) || [];
  const from = Math.max(1, vStart || 1);
  const to = Math.max(from, vEnd || from);
  return chapter.filter((item) => item.number >= from && item.number <= to);
}

export function computeParagraphRange(chapterVerses, vStart, vEnd) {
  if (!Array.isArray(chapterVerses) || !chapterVerses.length) return { v: vStart, end: vEnd };
  const minV = chapterVerses[0].number;
  const maxV = chapterVerses[chapterVerses.length - 1].number;
  return {
    v: Math.max(minV, vStart - 3),
    end: Math.min(maxV, vEnd + 3)
  };
}

/**
 * Wyszukuje w załadowanym UBG wersety o wspólnych słowach kluczowych (bez zmyślania źródeł).
 */
export function findLexicalParallels(bible, bookId, ch, vStart, vEnd, limit = 8) {
  const targetVerses = getVerseRange(bible, bookId, ch, vStart, vEnd);
  if (!targetVerses.length) return [];
  const joined = targetVerses.map((item) => item.text).join(' ').toLowerCase();
  const words = [...new Set(
    joined
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 5 && !STOP_WORDS.has(w))
  )].slice(0, 6);

  if (!words.length) return [];
  const scored = [];
  for (const verse of bible.verses) {
    if (verse.book === bookId && verse.chapter === ch && verse.number >= vStart && verse.number <= vEnd) continue;
    const lower = verse.text.toLowerCase();
    let hits = 0;
    const matched = [];
    for (const word of words) {
      if (lower.includes(word)) {
        hits += 1;
        matched.push(word);
      }
    }
    if (hits > 0) {
      scored.push({ verse, hits, matched });
    }
  }
  scored.sort((a, b) => b.hits - a.hits || (a.verse.testament === targetVerses[0].testament ? 1 : -1));
  return scored.slice(0, limit);
}

const BOOK_CONTEXT_SUMMARIES = {
  GEN: 'Księga Rodzaju otwiera Pięcioksiąg: opisuje stworzenie świata, upadek, przymierze z Noem i historię patriarchów (Abrahama, Izaaka, Jakuba i Józefa).',
  PSA: 'Księga Psalmów to kanoniczny śpiewnik i modlitewnik Izraela (lamentacje, dziękczynienia, hymny królewskie i mądrościowe). Zwróć uwagę na paralelizmy poetyckie i adresata modlitwy.',
  LUK: 'Ewangelia Łukasza to uporządkowana relacja historyczna skierowana do Teofila, mocno akcentująca działanie Ducha Świętego, modlitwę i troskę Jezusa o wszystkich ludzi.',
  JHN: 'Ewangelia Jana została napisana, „abyście wierzyli, że Jezus jest Chrystusem, Synem Bożym” (J 20:31). Łączy znaki Jezusa z głębokimi mowami o świetle, życiu i prawdzie.',
  PHP: 'List do Filipian napisał apostoł Paweł z więzienia do zboru w Filippi, dziękując za partnerstwo w Ewangelii oraz wzywając do jedności i pokory na wzór Chrystusa.',
  JAS: 'List Jakuba należy do listów powszechnych — koncentruje się na mądrości z góry, próbach wiary i spójności wiary z codziennym życiem.',
  '2TI': 'Drugi list do Tymoteusza to ostatni znany list Pawła przed śmiercią męczeńską — testament wiary wzywający do wierności Słowu Bożemu.'
};

export function getBookContextInfo(bible, bookId) {
  const meta = bible?.booksMap?.get(bookId);
  if (!meta) return null;
  const langLabel = meta.originalLang === 'hebrew'
    ? 'hebrajski (częściowo aramejski)'
    : meta.originalLang === 'greek'
      ? 'grecki (koine)'
      : 'brak danych w lokalnym katalogu';
  return {
    namePl: meta.namePl,
    shortPl: meta.shortPl,
    testamentLabel: meta.testament === 'NT' ? 'Nowy Testament' : 'Stary Testament',
    originalLangLabel: langLabel,
    category: meta.category || 'brak danych',
    chapters: meta.chapters,
    summary: BOOK_CONTEXT_SUMMARIES[bookId] || 'Szczegółowe wprowadzenie historyczno-literackie do tej księgi nie jest jeszcze zapisane w lokalnej bazie aplikacji. Korzystaj z kontekstu rozdziału oraz MojaBiblia / Wyszukiwarki CC.'
  };
}
