import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadWznConfig } from './db.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
const WARSAW_TZ = 'Europe/Warsaw';

// Udokumentowane drobne różnice ortograficzne między UBG-2025 (werset_dnia_365_ubg.json)
// a starszym eksportem rozdziałów data/bible/*.json (wyłącznie ściśle określone pary).
const KNOWN_UBG_EDITION_PAIRS = Object.freeze({
  'PHP:1:6': { v: 'dokończy je', ubg: 'dokończy go' },
  'PRO:10:22': { v: 'ze sobą', ubg: 'z sobą' },
  'ISA:12:2': { v: 'jehowa bóg', ubg: 'jehowabóg' },
  'MAL:3:10': { v: 'spichlerza', ubg: 'szpichlerza' },
});

export function getWarsawDateParts(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: WARSAW_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

export function getWarsawDayOfYear(date = new Date()) {
  const p = getWarsawDateParts(date);
  const rawDay = Math.floor(
    (Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 0)) / 86400000
  );
  // 365 wersetów w katalogu — dzień 366 roku przestępnego bezpiecznie mapujemy na 365.
  return Math.max(1, Math.min(365, rawDay));
}

export function formatPolishReference(rawReference = '') {
  return String(rawReference).replace(/(\d+):(\d+)/g, '$1,$2').trim();
}

function normalizeVerseComparisonText(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function verifyAgainstCanonicalChapter({ verseEntry, bibleChaptersDir }) {
  const chNum = String(verseEntry.chapter).padStart(2, '0');
  const chFile = path.join(bibleChaptersDir, `${verseEntry.bookCode}_${chNum}.json`);
  if (!fs.existsSync(chFile)) {
    return {
      ok: false,
      code: 'CANONICAL_CHAPTER_MISSING',
      reason: `Brak pliku rozdziału kanonicznego UBG: ${chFile}`,
      chFile,
    };
  }

  let chData;
  try {
    chData = JSON.parse(fs.readFileSync(chFile, 'utf8'));
  } catch (err) {
    return {
      ok: false,
      code: 'CANONICAL_CHAPTER_CORRUPT',
      reason: `Uszkodzony plik rozdziału UBG (${chFile}): ${err.message}`,
      chFile,
    };
  }

  const versesList = Array.isArray(chData.verses) ? chData.verses : [];
  const verseNums = Array.isArray(verseEntry.verses) ? verseEntry.verses : [];
  if (!verseNums.length) {
    return {
      ok: false,
      code: 'INVALID_VERSE_NUMBERS',
      reason: `Brak numerów wersetów dla dnia ${verseEntry.day}`,
      chFile,
    };
  }

  const extracted = [];
  for (const num of verseNums) {
    const found = versesList.find(item => Number(item.verse) === Number(num));
    if (!found || !found.text || typeof found.text.UBG !== 'string' || !found.text.UBG.trim()) {
      return {
        ok: false,
        code: 'VERSE_NOT_FOUND_IN_CANONICAL_UBG',
        reason: `Brak wersetu ${verseEntry.bookCode} ${verseEntry.chapter}:${num} w kanonicznym UBG`,
        chFile,
      };
    }
    extracted.push(found.text.UBG.trim());
  }

  const canonicalText = extracted.join(' ').replace(/\s+/g, ' ').trim();
  let normSource = normalizeVerseComparisonText(verseEntry.text);
  let normCanonical = normalizeVerseComparisonText(canonicalText);

  const pairKey = `${verseEntry.bookCode}:${verseEntry.chapter}:${verseNums.join(',')}`;
  const knownPair = KNOWN_UBG_EDITION_PAIRS[pairKey];
  if (knownPair) {
    normSource = normSource.replace(knownPair.v, knownPair.ubg);
  }

  if (normSource !== normCanonical) {
    return {
      ok: false,
      code: 'VERSE_INTEGRITY_MISMATCH',
      reason: `Tekst wersetu ${verseEntry.reference} nie zgadza się dosłownie z kanonicznym tekstem UBG (${chFile}).`,
      chFile,
      expectedCanonical: canonicalText,
      actualSource: verseEntry.text,
    };
  }

  const firstNum = Math.min(...verseNums.map(Number));
  const lastNum = Math.max(...verseNums.map(Number));
  const prev = versesList.find(item => Number(item.verse) === firstNum - 1);
  const next = versesList.find(item => Number(item.verse) === lastNum + 1);

  return {
    ok: true,
    canonicalText,
    canonicalChapterFile: chFile,
    localContext: {
      previousVerse: prev ? { verse: prev.verse, text: prev.text?.UBG || '' } : null,
      nextVerse: next ? { verse: next.verse, text: next.text?.UBG || '' } : null,
    },
  };
}

export function fetchVerifiedDailyVerse({
  date = new Date(),
  dayOverride = null,
  rootDir = DEFAULT_REPO_ROOT,
  verseSourcePath = null,
  bibleChaptersDir = null,
  config = null,
} = {}) {
  const cfg = config || loadWznConfig(rootDir);
  const resolvedSource = verseSourcePath || path.resolve(rootDir, cfg.verseSource.path);
  const resolvedBibleDir = bibleChaptersDir || path.resolve(rootDir, cfg.verseSource.bibleChaptersDir);
  const runDate = getWarsawDateParts(date).dateStr;
  const day = dayOverride != null ? Number(dayOverride) : getWarsawDayOfYear(date);

  if (!fs.existsSync(resolvedSource)) {
    return {
      ok: false,
      code: 'SOURCE_UNAVAILABLE',
      reason: `Autorytatywne źródło „Mój Werset Dnia” nie istnieje: ${resolvedSource}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  let rawData;
  try {
    const content = fs.readFileSync(resolvedSource, 'utf8');
    if (!content.trim()) {
      throw new Error('Pusty plik źródłowy');
    }
    rawData = JSON.parse(content);
  } catch (err) {
    return {
      ok: false,
      code: 'SOURCE_UNAVAILABLE',
      reason: `Nie można odczytać autorytatywnego źródła „Mój Werset Dnia”: ${err.message}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  const list = Array.isArray(rawData?.verses) ? rawData.verses : [];
  const entry = list.find(v => Number(v.day) === day);
  if (!entry) {
    return {
      ok: false,
      code: 'SOURCE_DAY_MISSING',
      reason: `Brak wersetu dla dnia roku ${day} w źródle ${resolvedSource}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  const allowedTranslations = cfg.verseSource?.allowedTranslations || ['UBG'];
  const translation = String(entry.translation || '');
  const license = String(entry.license || '');
  const requiredLic = cfg.verseSource?.requiredLicenseSubstring || 'CC BY-ND 4.0';

  if (!allowedTranslations.some(t => translation.includes(t))) {
    return {
      ok: false,
      code: 'UNAPPROVED_TRANSLATION',
      reason: `Nieautoryzowany przekład „${translation}” dla dnia ${day}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  if (!license.includes(requiredLic)) {
    return {
      ok: false,
      code: 'MISSING_LICENSE_VERIFICATION',
      reason: `Brak wymaganej licencji (${requiredLic}) w rekordzie dnia ${day}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  if (!entry.text || !entry.reference || !entry.bookCode || !entry.chapter) {
    return {
      ok: false,
      code: 'INVALID_VERSE_METADATA',
      reason: `Niekompletne metadane wersetu dla dnia ${day}`,
      runDate,
      day,
      alertSupervision: true,
    };
  }

  const canonicalCheck = verifyAgainstCanonicalChapter({
    verseEntry: entry,
    bibleChaptersDir: resolvedBibleDir,
  });
  if (!canonicalCheck.ok) {
    return {
      ok: false,
      code: canonicalCheck.code,
      reason: canonicalCheck.reason,
      runDate,
      day,
      reference: entry.reference,
      alertSupervision: true,
    };
  }

  const verseText = String(entry.text).replace(/\s+/g, ' ').trim();
  const referencePl = formatPolishReference(entry.reference);
  const sha256 = crypto
    .createHash('sha256')
    .update(`${entry.bookCode}|${entry.chapter}|${entry.verses.join(',')}|${verseText}|${translation}`)
    .digest('hex');

  return {
    ok: true,
    runDate,
    verse: {
      day: Number(entry.day),
      book: entry.book,
      bookCode: entry.bookCode,
      chapter: Number(entry.chapter),
      verses: entry.verses.map(Number),
      reference: entry.reference,
      referencePl,
      text: verseText,
      sourceTheme: entry.theme || '',
      translation,
      license,
      canonicalVerified: true,
      sourceFile: resolvedSource,
      canonicalChapterFile: canonicalCheck.canonicalChapterFile,
      localContext: canonicalCheck.localContext,
      sha256,
    },
  };
}
