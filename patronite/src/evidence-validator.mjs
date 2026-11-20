import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export const EVIDENCE_STATUS = Object.freeze({
  ZREALIZOWANE: 'ZREALIZOWANE',
  W_TRAKCIE: 'W TRAKCIE',
  PLANOWANE: 'PLANOWANE',
  NIEPOTWIERDZONE: 'NIEPOTWIERDZONE',
});

export const BOOK_CODE_TO_FULL_NAMES = {
  GEN: ['Księga Rodzaju'],
  EXO: ['Księga Wyjścia'],
  LEV: ['Księga Kapłańska'],
  NUM: ['Księga Liczb'],
  DEU: ['Księga Powtórzonego Prawa'],
  JOS: ['Księga Jozuego'],
  JDG: ['Księga Sędziów'],
  RUT: ['Księga Rut'],
  '1SA': ['1 Księga Samuela'],
  '2SA': ['2 Księga Samuela'],
  '1KI': ['1 Księga Królewska'],
  '2KI': ['2 Księga Królewska'],
  '1CH': ['1 Księga Kronik'],
  '2CH': ['2 Księga Kronik'],
  EZR: ['Księga Ezdrasza'],
  NEH: ['Księga Nehemiasza'],
  EST: ['Księga Estery'],
  JOB: ['Księga Hioba'],
  PSA: ['Księga Psalmów', 'Psalm'],
  PRO: ['Przypowieści Salomona', 'Księga Przysłów'],
  ECC: ['Księga Kaznodziei', 'Księga Koheleta'],
  SNG: ['Pieśń nad Pieśniami'],
  ISA: ['Księga Izajasza'],
  JER: ['Księga Jeremiasza'],
  LAM: ['Lamentacje Jeremiasza'],
  EZK: ['Księga Ezechiela'],
  DAN: ['Księga Daniela'],
  HOS: ['Księga Ozeasza'],
  JOL: ['Księga Joela'],
  AMO: ['Księga Amosa'],
  OBA: ['Księga Abdiasza'],
  JON: ['Księga Jonasza'],
  MIC: ['Księga Micheasza'],
  NAM: ['Księga Nahuma'],
  HAB: ['Księga Habakuka'],
  ZEP: ['Księga Sofoniasza'],
  HAG: ['Księga Aggeusza'],
  ZEC: ['Księga Zachariasza'],
  MAL: ['Księga Malachiasza'],
  MAT: ['Ewangelia Mateusza'],
  MRK: ['Ewangelia Marka'],
  LUK: ['Ewangelia Łukasza'],
  JHN: ['Ewangelia Jana'],
  ACT: ['Dzieje Apostolskie'],
  ROM: ['List do Rzymian'],
  '1CO': ['1 List do Koryntian'],
  '2CO': ['2 List do Koryntian'],
  GAL: ['List do Galacjan'],
  EPH: ['List do Efezjan'],
  PHP: ['List do Filipian'],
  COL: ['List do Kolosan'],
  '1TH': ['1 List do Tesaloniczan'],
  '2TH': ['2 List do Tesaloniczan'],
  '1TI': ['1 List do Tymoteusza'],
  '2TI': ['2 List do Tymoteusza'],
  TIT: ['List do Tytusa'],
  PHM: ['List do Filemona'],
  HEB: ['List do Hebrajczyków'],
  JAS: ['List Jakuba'],
  '1PE': ['1 List Piotra'],
  '2PE': ['2 List Piotra'],
  '1JN': ['1 List Jana'],
  '2JN': ['2 List Jana'],
  '3JN': ['3 List Jana'],
  JUD: ['List Judy'],
  REV: ['Apokalipsa św. Jana', 'Objawienie św. Jana'],
};

const ALL_FULL_BOOK_NAMES = new Set(
  Object.values(BOOK_CODE_TO_FULL_NAMES).flat().map(s => s.toLowerCase()),
);

let cachedUbgIndex = null;

export function loadUbgBibleIndex(repoRoot = DEFAULT_REPO_ROOT) {
  if (cachedUbgIndex) return cachedUbgIndex;
  const ubgPath = path.join(repoRoot, 'data', 'bible', 'szukaj-ubg.json');
  const raw = JSON.parse(fs.readFileSync(ubgPath, 'utf8'));
  const map = new Map();
  for (const [bookIdx, chapter, verse, text] of raw.r) {
    const code = raw.b[bookIdx];
    map.set(`${code}:${chapter}:${verse}`, text);
  }
  cachedUbgIndex = map;
  return map;
}

function normalizeBibleText(str) {
  return String(str || '')
    .replace(/[„”"«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveFullBookToCode(bookName) {
  const lower = String(bookName || '').trim().toLowerCase();
  if (!lower || !ALL_FULL_BOOK_NAMES.has(lower)) return null;
  for (const [code, names] of Object.entries(BOOK_CODE_TO_FULL_NAMES)) {
    if (names.some(n => n.toLowerCase() === lower)) return code;
  }
  return null;
}

export function verifyBibleQuote({ book, bookCode, chapter, verse, text }, repoRoot = DEFAULT_REPO_ROOT) {
  if (!book || !ALL_FULL_BOOK_NAMES.has(String(book).trim().toLowerCase())) {
    return { valid: false, code: 'ABBREVIATED_OR_UNKNOWN_BOOK', reason: `Wymagana pełna nazwa księgi biblijnej, otrzymano: „${book || ''}”` };
  }
  const resolvedCode = bookCode || resolveFullBookToCode(book);
  if (!resolvedCode) {
    return { valid: false, code: 'UNKNOWN_BOOK_CODE', reason: `Nie można rozpoznać kodu księgi dla „${book}”.` };
  }
  const index = loadUbgBibleIndex(repoRoot);
  const canonicalText = index.get(`${resolvedCode}:${Number(chapter)}:${Number(verse)}`);
  if (!canonicalText) {
    return { valid: false, code: 'VERSE_NOT_FOUND', reason: `Brak wersetu ${resolvedCode} ${chapter}:${verse} w bazie UBG-2025.` };
  }
  const normExpected = normalizeBibleText(canonicalText);
  const normGiven = normalizeBibleText(text);
  if (!normGiven || normExpected !== normGiven) {
    return {
      valid: false,
      code: 'VERSE_TEXT_MISMATCH',
      reason: `Cytat nie zgadza się dosłownie z tekstem UBG-2025 dla ${book} ${chapter}:${verse}.`,
      canonicalText,
    };
  }
  return { valid: true, code: 'VERIFIED_UBG', bookCode: resolvedCode, canonicalText };
}

/**
 * Klasyfikuje element dowodowy.
 * Zgodnie z sekcją 4: plan, zadanie, commit ani zapowiedź nie mogą być uznane za ZREALIZOWANE.
 */
export function classifyEvidenceItem(item, repoRoot = DEFAULT_REPO_ROOT) {
  if (!item || !item.sourceName || !item.verifiedDate) {
    return { status: EVIDENCE_STATUS.NIEPOTWIERDZONE, allowedAsCompletedFact: false, reason: 'Brak źródła lub daty weryfikacji.' };
  }
  if (item.unconfirmed || item.statusOverride === EVIDENCE_STATUS.NIEPOTWIERDZONE) {
    return { status: EVIDENCE_STATUS.NIEPOTWIERDZONE, allowedAsCompletedFact: false, reason: 'Informacja niepotwierdzona — zakaz publikacji.' };
  }
  if (item.isPlanOnly) {
    return { status: EVIDENCE_STATUS.PLANOWANE, allowedAsCompletedFact: false, reason: 'Plan/zapowiedź nie jest dowodem ukończenia.' };
  }
  if (item.isCommitOnly) {
    return { status: EVIDENCE_STATUS.W_TRAKCIE, allowedAsCompletedFact: false, reason: 'Sam commit Git nie stanowi dowodu zakończonego projektu publicznego.' };
  }
  if (item.scripture) {
    const bibleRes = verifyBibleQuote(item.scripture, repoRoot);
    if (!bibleRes.valid) {
      return { status: EVIDENCE_STATUS.NIEPOTWIERDZONE, allowedAsCompletedFact: false, reason: bibleRes.reason, bibleError: bibleRes.code };
    }
  }
  if (item.hasLiveArtifact && item.artifactPath) {
    const abs = path.resolve(repoRoot, item.artifactPath);
    if (!fs.existsSync(abs)) {
      return { status: EVIDENCE_STATUS.NIEPOTWIERDZONE, allowedAsCompletedFact: false, reason: `Brak pliku artefaktu: ${item.artifactPath}` };
    }
    if (item.seriesPreference && item.seriesPreference.includes('behind-the-scenes') && item.isWorkInProgress) {
      return { status: EVIDENCE_STATUS.W_TRAKCIE, allowedAsCompletedFact: false, reason: 'Praca w toku.' };
    }
    return { status: EVIDENCE_STATUS.ZREALIZOWANE, allowedAsCompletedFact: true, reason: 'Zweryfikowany publiczny artefakt w repozytorium polskieradio.cc.' };
  }
  if (item.nextWorkFact || item.inProgress) {
    return { status: EVIDENCE_STATUS.W_TRAKCIE, allowedAsCompletedFact: false, reason: 'Udokumentowany postęp prac.' };
  }
  return { status: EVIDENCE_STATUS.NIEPOTWIERDZONE, allowedAsCompletedFact: false, reason: 'Brak zweryfikowanego artefaktu.' };
}

export function validateCollectedSnapshot(snapshot, repoRoot = DEFAULT_REPO_ROOT) {
  const validated = [];
  for (const item of snapshot?.items || []) {
    const classification = classifyEvidenceItem(item, repoRoot);
    validated.push({
      ...item,
      classification,
      evidenceStatus: classification.status,
    });
  }
  return {
    validatedAt: new Date().toISOString(),
    items: validated,
    completedFacts: validated.filter(i => i.evidenceStatus === EVIDENCE_STATUS.ZREALIZOWANE),
    inProgressFacts: validated.filter(i => i.evidenceStatus === EVIDENCE_STATUS.W_TRAKCIE),
    blockedFacts: validated.filter(i => i.evidenceStatus === EVIDENCE_STATUS.NIEPOTWIERDZONE),
  };
}
