// =========================================================================
// AI DLA JEZUSA — MOJABIBLIA INTERLINEAR BRIDGE (WORKER-SAFE, ZERO-FS)
// Integruje czat AI bezpośrednio z zasobami https://polskieradio.cc/mojabiblia
// =========================================================================

import booksMetadata from '../../data/bible/bible_books_metadata.json' with { type: 'json' };
import glossPlDict from '../../data/bible/glosy-pl.json' with { type: 'json' };
import { normalizeText } from './knowledge-hub.js';

export const BOOK_ALIASES = {
  rdz: 'GEN', rodzaju: 'GEN', gen: 'GEN', genesis: 'GEN', '1 moj': 'GEN', '1moj': 'GEN',
  wj: 'EXO', wyj: 'EXO', wyjscia: 'EXO', ex: 'EXO', exo: 'EXO', exodus: 'EXO', '2 moj': 'EXO', '2moj': 'EXO',
  kpl: 'LEV', kaplanska: 'LEV', lev: 'LEV',
  lb: 'NUM', liczb: 'NUM', num: 'NUM',
  pwt: 'DEU', powt: 'DEU', powtorzonego: 'DEU', deu: 'DEU',
  joz: 'JOS', jozuego: 'JOS', jos: 'JOS',
  sdz: 'JDG', sedziow: 'JDG', jdg: 'JDG',
  rt: 'RUT', rut: 'RUT',
  '1 sm': '1SA', '1sm': '1SA', '1 sam': '1SA', '1sam': '1SA',
  '2 sm': '2SA', '2sm': '2SA', '2 sam': '2SA', '2sam': '2SA',
  '1 krl': '1KI', '1krl': '1KI', '2 krl': '2KI', '2krl': '2KI',
  '1 krn': '1CH', '1krn': '1CH', '2 krn': '2CH', '2krn': '2CH',
  ezd: 'EZR', ne: 'NEH', est: 'EST',
  hi: 'JOB', hioba: 'JOB', job: 'JOB',
  ps: 'PSA', psalm: 'PSA', psalmy: 'PSA', psalmow: 'PSA', psa: 'PSA',
  prz: 'PRO', przyp: 'PRO', przypowiesci: 'PRO', przyslow: 'PRO', pro: 'PRO',
  koh: 'ECC', koheleta: 'ECC', kazn: 'ECC', ecc: 'ECC',
  pnp: 'SNG', piesn: 'SNG',
  iz: 'ISA', izajasza: 'ISA', isa: 'ISA',
  jr: 'JER', jeremiasza: 'JER', jer: 'JER',
  lm: 'LAM', ez: 'EZK', ezechiela: 'EZK',
  dn: 'DAN', daniela: 'DAN', dan: 'DAN',
  oz: 'HOS', jl: 'JOL', am: 'AMO', ab: 'OBA', jon: 'JON', mi: 'MIC', na: 'NAM', ha: 'HAB', so: 'ZEP', ag: 'HAG', za: 'ZEC', ml: 'MAL',
  mt: 'MAT', mat: 'MAT', mateusza: 'MAT',
  mk: 'MRK', mar: 'MRK', marka: 'MRK', mrk: 'MRK',
  lk: 'LUK', luk: 'LUK', lukasza: 'LUK',
  j: 'JHN', jn: 'JHN', jan: 'JHN', jana: 'JHN', jhn: 'JHN',
  dz: 'ACT', dzieje: 'ACT', dziejow: 'ACT', act: 'ACT',
  rz: 'ROM', rzym: 'ROM', rzymian: 'ROM', rom: 'ROM',
  '1 kor': '1CO', '1kor': '1CO', '1 koryntian': '1CO', '1co': '1CO',
  '2 kor': '2CO', '2kor': '2CO', '2 koryntian': '2CO', '2co': '2CO',
  ga: 'GAL', gal: 'GAL', galacjan: 'GAL',
  ef: 'EPH', efezjan: 'EPH', eph: 'EPH',
  flp: 'PHP', filipian: 'PHP', php: 'PHP',
  kol: 'COL', kolosan: 'COL', col: 'COL',
  '1 tes': '1TH', '1tes': '1TH', '2 tes': '2TH', '2tes': '2TH',
  '1 tm': '1TI', '1tm': '1TI', '1 tym': '1TI', '2 tm': '2TI', '2tm': '2TI', '2 tym': '2TI',
  tt: 'TIT', flm: 'PHM',
  hbr: 'HEB', heb: 'HEB', hebrajczykow: 'HEB',
  jk: 'JAS', jakuba: 'JAS', jas: 'JAS',
  '1 p': '1PE', '1p': '1PE', '1 piotra': '1PE', '1pe': '1PE',
  '2 p': '2PE', '2p': '2PE', '2 piotra': '2PE', '2pe': '2PE',
  '1 j': '1JN', '1j': '1JN', '1 jana': '1JN', '1jn': '1JN',
  '2 j': '2JN', '2j': '2JN', '3 j': '3JN', '3j': '3JN',
  jud: 'JUD', judy: 'JUD',
  obj: 'REV', ap: 'REV', apokalipsa: 'REV', objawienie: 'REV', rev: 'REV'
};

const TRIVIAL_STRONGS = new Set([
  'G3588', 'G2532', 'G1161', 'G3756', 'G1510', 'G0846', 'G1722', 'G1519',
  'G3778', 'G3739', 'G3754', 'G1063', 'G0235', 'G4314', 'G1537', 'G0575',
  'H0853', 'H0834', 'H0413', 'H5921', 'H3588', 'H3808'
]);

const chapterCache = new Map();
const MAX_CACHED_CHAPTERS = 24;

function getBookMeta(bookId) {
  const list = Array.isArray(booksMetadata) ? booksMetadata : [];
  return list.find((b) => b.id === bookId) || null;
}

export function buildMojaBibliaUrl(bookId, chapter, verse, mode = 'interlinear') {
  const params = new URLSearchParams({
    book: String(bookId || 'MAT'),
    chapter: String(Number(chapter) || 1),
    mode: mode === 'reader' ? 'reader' : 'interlinear'
  });
  if (Number(verse) > 0) params.set('verse', String(Number(verse)));
  return `https://polskieradio.cc/mojabiblia?${params.toString()}`;
}

export function parseScriptureReference(raw = '') {
  const cleaned = normalizeText(raw).replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^([1-3]?\s*[a-z]+)\s+(\d{1,3})\s*[:,.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/i);
  if (!match) return null;
  const rawBook = match[1].replace(/\s+/g, ' ').trim();
  const compactBook = rawBook.replace(/\s+/g, '');
  const bookId = BOOK_ALIASES[rawBook] || BOOK_ALIASES[compactBook] || rawBook.toUpperCase();
  const meta = getBookMeta(bookId);
  if (!meta) return null;
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (!Number.isFinite(chapter) || chapter < 1 || chapter > (meta.chapters || 150)) return null;
  if (!Number.isFinite(verse) || verse < 1) return null;
  return {
    bookId: meta.id,
    bookName: meta.namePl,
    shortPl: meta.shortPl,
    chapter,
    verse,
    shortRef: `${meta.shortPl} ${chapter},${verse}`,
    reference: `${meta.namePl} ${chapter},${verse}`
  };
}

export function extractAllScriptureRefs(text = '') {
  const pattern = /\b([1-3]?\s?[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{1,12})\s+(\d{1,3})\s*[:,]\s*(\d{1,3})(?:\s*[-–]\s*\d{1,3})?\b/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = pattern.exec(String(text || ''))) !== null) {
    const parsed = parseScriptureReference(`${m[1]} ${m[2]},${m[3]}`);
    if (parsed && !seen.has(parsed.shortRef)) {
      seen.add(parsed.shortRef);
      out.push(parsed.shortRef);
    }
  }
  return out;
}

async function fetchChapterJson(fileKey, env = {}, deps = {}) {
  if (chapterCache.has(fileKey)) {
    return chapterCache.get(fileKey);
  }
  let parsed = null;
  try {
    if (typeof deps?.fetchAsset === 'function') {
      parsed = await deps.fetchAsset(`data/bible/${fileKey}`);
    } else if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const res = await env.ASSETS.fetch(new Request(`https://polskieradio.cc/data/bible/${fileKey}`));
      if (res && res.ok) parsed = await res.json();
    }
  } catch {
    parsed = null;
  }
  if (parsed) {
    if (chapterCache.size >= MAX_CACHED_CHAPTERS) {
      const oldestKey = chapterCache.keys().next().value;
      chapterCache.delete(oldestKey);
    }
    chapterCache.set(fileKey, parsed);
  }
  return parsed;
}

function normalizeInterlinearWord(w) {
  if (!w || typeof w !== 'object') return null;
  const strong = String(w.strong || '').trim();
  const paddedStrong = /^[GH]\d{1,3}$/.test(strong)
    ? strong[0] + strong.slice(1).padStart(4, '0')
    : strong;
  const dict = glossPlDict && typeof glossPlDict === 'object' ? glossPlDict : {};
  const glossPl = String(dict[paddedStrong] || dict[strong] || w.gloss || '').trim();
  return {
    original: String(w.original || '').trim(),
    translit: String(w.translit || '').trim(),
    strong: paddedStrong || strong,
    morph: String(w.morph || '').trim(),
    glossPl,
    lemma: String(w.lemma || '').trim()
  };
}

export async function resolveMojaBibliaVerses(refs = [], env = {}, deps = {}) {
  const uniqueRefs = [];
  const seenKeys = new Set();
  for (const r of Array.isArray(refs) ? refs : []) {
    const parsed = typeof r === 'string' ? parseScriptureReference(r) : null;
    if (!parsed) continue;
    const key = `${parsed.bookId}_${parsed.chapter}_${parsed.verse}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    uniqueRefs.push(parsed);
    if (uniqueRefs.length >= 3) break;
  }

  const resolved = [];
  for (const ref of uniqueRefs) {
    const fileKey = `${ref.bookId}_${String(ref.chapter).padStart(2, '0')}.json`;
    const chapterData = await fetchChapterJson(fileKey, env, deps);
    const versesList = Array.isArray(chapterData?.verses) ? chapterData.verses : [];
    const verseObj = versesList.find((v) => Number(v?.verse) === ref.verse);
    if (!verseObj) continue;

    const ubgText = String(verseObj?.text?.UBG || verseObj?.text?.BW || verseObj?.text?.BG || '').trim();
    const rawWords = Array.isArray(verseObj?.interlinear) ? verseObj.interlinear : [];
    const allWords = rawWords.map(normalizeInterlinearWord).filter(Boolean);
    const seenStrongs = new Set();
    const keyWords = [];
    for (const w of allWords) {
      if (!w.original || !w.strong) continue;
      if (TRIVIAL_STRONGS.has(w.strong) || seenStrongs.has(w.strong)) continue;
      seenStrongs.add(w.strong);
      keyWords.push({
        original: w.original,
        translit: w.translit,
        strong: w.strong,
        glossPl: w.glossPl
      });
      if (keyWords.length >= 8) break;
    }

    resolved.push({
      reference: ref.reference,
      shortRef: ref.shortRef,
      bookId: ref.bookId,
      chapter: ref.chapter,
      verse: ref.verse,
      originalLang: chapterData?.originalLang || (getBookMeta(ref.bookId)?.originalLang) || '',
      ubg: ubgText,
      allWords,
      keyWords,
      readerUrl: buildMojaBibliaUrl(ref.bookId, ref.chapter, ref.verse, 'reader'),
      interlinearUrl: buildMojaBibliaUrl(ref.bookId, ref.chapter, ref.verse, 'interlinear')
    });
  }
  return resolved;
}
