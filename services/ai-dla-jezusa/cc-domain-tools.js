// =========================================================================
// CHRISTIAN CULTURE — CC CONNECT 2.0 DOMAIN TOOLS
// Sola Scriptura • ZERO COST FIRST • UBG 2025 • Uczciwość danych
// Narzędzia domenowe: Biblia UBG, Głębokie Studium SBA, Kazania, Audio
// =========================================================================

import { BOOK_ALIASES, parseScriptureReference } from './mojabiblia-bridge.js';

let fsModule = null;
let pathModule = null;

async function getFs() {
  if (fsModule) return { fs: fsModule, path: pathModule };
  if (typeof process !== 'undefined' && process?.versions?.node) {
    try {
      fsModule = await import('node:fs');
      pathModule = await import('node:path');
      return { fs: fsModule, path: pathModule };
    } catch (_) {}
  }
  return { fs: null, path: null };
}

// Pamięć podręczna rozdziałów
const ubgChapterCache = new Map();
const MAX_CACHE = 40;

export function resolveBookCode(bookInput = '') {
  const raw = String(bookInput || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const compact = raw.replace(/\s+/g, '');
  if (BOOK_ALIASES[raw]) return BOOK_ALIASES[raw];
  if (BOOK_ALIASES[compact]) return BOOK_ALIASES[compact];
  const upper = raw.toUpperCase();
  if (/^[0-9]?[A-Z]{2,3}$/.test(upper)) return upper;
  return null;
}

export async function loadUbgChapter(bookCode, chapterNum, env = {}, deps = {}) {
  const bCode = resolveBookCode(bookCode);
  const ch = Number(chapterNum);
  if (!bCode || !Number.isFinite(ch) || ch < 1) return null;

  const fileKey = `${bCode}-${String(ch).padStart(3, '0')}.json`;
  if (ubgChapterCache.has(fileKey)) {
    return ubgChapterCache.get(fileKey);
  }

  let data = null;

  // 1. Spróbuj deps.fetchAsset lub env.ASSETS (Cloudflare Worker)
  try {
    if (typeof deps?.fetchAsset === 'function') {
      data = await deps.fetchAsset(`data/bible/ubg-2025/${fileKey}`);
    } else if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const res = await env.ASSETS.fetch(new Request(`https://polskieradio.cc/data/bible/ubg-2025/${fileKey}`));
      if (res && res.ok) data = await res.json();
    }
  } catch (_) {}

  // 2. Spróbuj Node.js fs (Lokalne środowisko testowe / SSR)
  if (!data) {
    const { fs, path } = await getFs();
    if (fs && path) {
      try {
        const cwd = process.cwd();
        const p = path.resolve(cwd, 'data', 'bible', 'ubg-2025', fileKey);
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8');
          data = JSON.parse(content);
        }
      } catch (_) {}
    }
  }

  if (data) {
    if (ubgChapterCache.size >= MAX_CACHE) {
      const oldest = ubgChapterCache.keys().next().value;
      ubgChapterCache.delete(oldest);
    }
    ubgChapterCache.set(fileKey, data);
  }

  return data;
}

/**
 * cc_bible_get_verse
 */
export async function ccBibleGetVerse({ book, chapter, verse, translation = 'UBG' }, env = {}, deps = {}) {
  const bCode = resolveBookCode(book);
  const ch = Number(chapter);
  const vNum = Number(verse);

  if (!bCode || !Number.isFinite(ch) || !Number.isFinite(vNum)) {
    return {
      ok: false,
      error: 'invalid_reference',
      detail: `Nieprawidłowa referencja biblijna: ${book} ${chapter}:${verse}`
    };
  }

  const chapterData = await loadUbgChapter(bCode, ch, env, deps);
  if (!chapterData || !Array.isArray(chapterData.verses)) {
    return {
      ok: false,
      error: 'chapter_not_found',
      detail: `Nie znaleziono rozdziału ${bCode} ${ch} w przekładzie UBG.`
    };
  }

  const verseItem = chapterData.verses.find(v => Number(v.number) === vNum);
  if (!verseItem) {
    return {
      ok: false,
      error: 'verse_not_found',
      detail: `W rozdziale ${chapterData.book || bCode} ${ch} brak wersetu ${vNum} (rozdział ma ${chapterData.verses.length} wersetów).`
    };
  }

  const safeRef = `${chapterData.book || bCode} ${ch}:${vNum}`;
  return {
    ok: true,
    tool: 'cc_bible_get_verse',
    book: chapterData.book || bCode,
    bookCode: bCode,
    chapter: ch,
    verse: vNum,
    text: verseItem.text,
    translation: 'UBG',
    translationFull: 'Uwspółcześniona Biblia Gdańska (2025)',
    copyright: chapterData.copyright,
    sourceUrl: `https://polskieradio.cc/sba?book=${bCode}&chapter=${ch}&verse=${vNum}`,
    deepStudyUrl: `https://polskieradio.cc/sba/studium/?book=${bCode}&chapter=${ch}&verse=${vNum}&translation=UBG`
  };
}

/**
 * cc_bible_get_chapter
 */
export async function ccBibleGetChapter({ book, chapter, translation = 'UBG' }, env = {}, deps = {}) {
  const bCode = resolveBookCode(book);
  const ch = Number(chapter);

  if (!bCode || !Number.isFinite(ch)) {
    return { ok: false, error: 'invalid_chapter', detail: 'Podaj poprawną księgę i numer rozdziału.' };
  }

  const chapterData = await loadUbgChapter(bCode, ch, env, deps);
  if (!chapterData) {
    return { ok: false, error: 'not_found', detail: `Nie znaleziono rozdziału ${bCode} ${ch}.` };
  }

  return {
    ok: true,
    tool: 'cc_bible_get_chapter',
    book: chapterData.book,
    bookCode: bCode,
    chapter: ch,
    totalVerses: chapterData.totalVerses || chapterData.verses?.length || 0,
    verses: chapterData.verses.map(v => ({ number: v.number, text: v.text })),
    translation: 'UBG',
    sourceUrl: `https://polskieradio.cc/sba?book=${bCode}&chapter=${ch}`
  };
}

/**
 * cc_bible_get_context
 */
export async function ccBibleGetContext({ book, chapter, verse, scope = 'literary_unit' }, env = {}, deps = {}) {
  const bCode = resolveBookCode(book);
  const ch = Number(chapter);
  const vNum = Number(verse);

  const chapterData = await loadUbgChapter(bCode, ch, env, deps);
  if (!chapterData || !Array.isArray(chapterData.verses)) {
    return { ok: false, error: 'not_found', detail: `Nie znaleziono rozdziału ${bCode} ${ch}.` };
  }

  const vIndex = chapterData.verses.findIndex(v => Number(v.number) === vNum);
  if (vIndex === -1) {
    return { ok: false, error: 'verse_not_found', detail: `Brak wersetu ${vNum}.` };
  }

  // Kontekst bliski (jednostka literacka: 4 wersety przed i 4 po lub cała perykopa)
  const startIdx = Math.max(0, vIndex - 4);
  const endIdx = Math.min(chapterData.verses.length - 1, vIndex + 4);
  const nearVerses = chapterData.verses.slice(startIdx, endIdx + 1).map(v => ({
    number: v.number,
    text: v.text,
    isTarget: v.number === vNum
  }));

  const testamentName = chapterData.testament === 'ot' ? 'Stary Testament' : 'Nowy Testament';

  return {
    ok: true,
    tool: 'cc_bible_get_context',
    book: chapterData.book,
    bookCode: bCode,
    chapter: ch,
    verse: vNum,
    scope,
    nearContext: {
      range: `${chapterData.book} ${ch}:${chapterData.verses[startIdx].number}-${chapterData.verses[endIdx].number}`,
      verses: nearVerses
    },
    wideContext: {
      testament: testamentName,
      chapterSummary: `Rozdział ${ch} księgi ${chapterData.book} zawiera łącznie ${chapterData.verses.length} wersetów.`,
      hermeneuticPrinciple: 'Pismo wyjaśnia Pismo (Scriptura sacra sui ipsius interpres). Badaj intencję natchnionego Autora.'
    },
    deepStudyUrl: `https://polskieradio.cc/sba/studium/?book=${bCode}&chapter=${ch}&verse=${vNum}&translation=UBG`
  };
}

/**
 * cc_sba_deep_study
 */
export async function ccSbaDeepStudy({ book, chapter, verse, translation = 'UBG' }, env = {}, deps = {}) {
  const verseRes = await ccBibleGetVerse({ book, chapter, verse, translation }, env, deps);
  const bCode = resolveBookCode(book) || 'PSA';
  const ch = Number(chapter) || 119;
  const vNum = Number(verse) || 18;

  const url = `https://polskieradio.cc/sba/studium/?book=${bCode}&chapter=${ch}&verse=${vNum}&translation=UBG`;

  return {
    ok: true,
    tool: 'cc_sba_deep_study',
    reference: `${verseRes.book || bCode} ${ch}:${vNum}`,
    verseText: verseRes.text || '',
    translation: 'UBG',
    url,
    motto: 'Czytaj w obecności Autora. Gdy nie rozumiesz tekstu, zacznij od modlitwy.',
    prayerGate: {
      title: 'Brama Modlitwy',
      prompt: 'Zatrzymaj się przed Słowem. Poproś Ducha Świętego o otwarcie oczu serca (Ps 119:18).'
    },
    stages: [
      { step: 1, name: 'Czytaj', desc: 'Przeczytaj fragment kilkakrotnie w obecności Autora.' },
      { step: 2, name: 'Odkrywaj (Wielka Szóstka)', desc: 'Zadaj pytania: Kto? Co? Gdzie? Kiedy? Dlaczego? Jak?' },
      { step: 3, name: 'Analizuj', desc: 'Słowa kluczowe, powtórzenia, kontrasty i struktura gramatyczna.' },
      { step: 4, name: 'Badaj kontekst', desc: 'Kontekst bliski (perykopa) oraz szeroki (cała księga i plan zbawienia).' },
      { step: 5, name: 'Zrozum', desc: 'Co ten tekst oznaczał dla pierwszych odbiorców i jaka jest odwieczna prawda Boża?' },
      { step: 6, name: 'Zastosuj', desc: 'Jak ta prawda przemienia moje dzisiejsze myślenie, decyzje i wierność Bogu?' },
      { step: 7, name: 'Twórz', desc: 'Zapisz modlitwę serca, konspekt, pieśń lub mapę myśli.' },
      { step: 8, name: 'Dziel się', desc: 'Zanieś usłyszane Słowo drugiemu człowiekowi w miłości Chrystusa.' }
    ]
  };
}

/**
 * cc_find_sermon
 */
export async function ccFindSermon({ query = '', category = '', limit = 5 }, env = {}, deps = {}) {
  let sermonsData = null;

  try {
    if (typeof deps?.fetchAsset === 'function') {
      sermonsData = await deps.fetchAsset('kazania/data/kazania.json');
    } else if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const res = await env.ASSETS.fetch(new Request('https://polskieradio.cc/kazania/data/kazania.json'));
      if (res && res.ok) sermonsData = await res.json();
    }
  } catch (_) {}

  if (!sermonsData) {
    const { fs, path } = await getFs();
    if (fs && path) {
      try {
        const p = path.resolve(process.cwd(), 'kazania', 'data', 'kazania.json');
        if (fs.existsSync(p)) {
          sermonsData = JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
      } catch (_) {}
    }
  }

  const list = Array.isArray(sermonsData?.sermons) ? sermonsData.sermons : [];
  const qNorm = String(query || '').trim().toLowerCase();
  const catNorm = String(category || '').trim().toLowerCase();

  const filtered = list.filter(s => {
    if (catNorm && !String(s.cat || '').toLowerCase().includes(catNorm)) return false;
    if (!qNorm) return true;
    const hay = `${s.title} ${s.ref} ${s.desc} ${s.series || ''} ${s.cat || ''}`.toLowerCase();
    return hay.includes(qNorm);
  }).slice(0, Math.min(20, Math.max(1, Number(limit) || 5)));

  return {
    ok: true,
    tool: 'cc_find_sermon',
    query,
    count: filtered.length,
    results: filtered.map(s => ({
      id: s.id,
      title: s.title,
      reference: s.ref,
      category: s.cat,
      series: s.series,
      description: s.desc,
      url: `https://polskieradio.cc/kazania?s=${encodeURIComponent(s.id)}`
    }))
  };
}

/**
 * cc_find_audio_bible
 */
export async function ccFindAudioBible({ book = '', chapter = null }, env = {}, deps = {}) {
  let catalog = null;

  try {
    if (typeof deps?.fetchAsset === 'function') {
      catalog = await deps.fetchAsset('biblia-audio/data/catalog.json');
    } else if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const res = await env.ASSETS.fetch(new Request('https://polskieradio.cc/biblia-audio/data/catalog.json'));
      if (res && res.ok) catalog = await res.json();
    }
  } catch (_) {}

  if (!catalog) {
    const { fs, path } = await getFs();
    if (fs && path) {
      try {
        const p = path.resolve(process.cwd(), 'biblia-audio', 'data', 'catalog.json');
        if (fs.existsSync(p)) {
          catalog = JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
      } catch (_) {}
    }
  }

  const list = Array.isArray(catalog) ? catalog : [];
  const bNorm = String(book || '').trim().toLowerCase();
  const chNum = Number(chapter);

  const matched = list.filter(item => {
    if (bNorm) {
      const iBook = String(item.book || '').toLowerCase();
      if (!iBook.includes(bNorm) && !bNorm.includes(iBook)) return false;
    }
    if (Number.isFinite(chNum) && chNum > 0 && Number(item.chapter) !== chNum) {
      return false;
    }
    return true;
  });

  return {
    ok: true,
    tool: 'cc_find_audio_bible',
    count: matched.length,
    results: matched.slice(0, 10).map(m => ({
      id: m.id,
      book: m.book,
      chapter: m.chapter,
      description: m.description,
      audioUrl: m.audioUrl ? `https://polskieradio.cc${m.audioUrl}` : null,
      webUrl: 'https://polskieradio.cc/biblia-audio'
    }))
  };
}
