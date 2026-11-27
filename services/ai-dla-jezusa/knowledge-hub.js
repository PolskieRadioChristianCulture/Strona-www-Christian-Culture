// =========================================================================
// AI DLA JEZUSA — CC KNOWLEDGE HUB (ETAP 1)
// Canonical Document Standard • Sola Scriptura • ZERO COST
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

import searchIndexData from '../../data/cc-search-index.json' with { type: 'json' };
import bibleRagData from '../../data/bible-rag-registry.json' with { type: 'json' };
import { resolveMojaBibliaVerses } from './mojabiblia-bridge.js';

const INDEX_FRESHNESS = searchIndexData.generatedAt || searchIndexData.updatedAt || null;
const STOP_TOKENS = new Set([
  'i', 'w', 'z', 'do', 'na', 'o', 'a', 'od', 'dla', 'we', 'ze', 'po',
  'czy', 'jak', 'co', 'to', 'jest', 'sie', 'oraz', 'studium', 'list', 'listu'
]);

/**
 * Normalizacja polskich znaków diakrytycznych i małych liter do porównań
 */
export function normalizeText(str = '') {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}

export function isDocumentPubliclyVisible(doc) {
  if (!doc || typeof doc !== 'object') return false;
  if (doc.visibility !== 'public') return false;
  if (doc.status !== 'published') return false;
  const u = String(doc.canonical_url || '');
  if (/\/(test|admin|mission-control|private|draft|joma)(\/|$)/i.test(u)) return false;
  return true;
}

/**
 * Wykrywanie referencji biblijnych w tekście (np. J 3:16, Rz 8:28, Mt 5:1-12)
 */
export function extractScriptureRefs(text = '') {
  const pattern = /\b([1-3]?\s?[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{1,8})\s+(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)\b/gi;
  const matches = [];
  let m;
  while ((m = pattern.exec(text)) !== null) {
    matches.push(m[0].trim());
  }
  return [...new Set(matches)];
}

/**
 * Konwersja obiektu surowego z indeksu do kontraktu CanonicalDocument (Sekcja 5 specyfikacji)
 */
export function toCanonicalDocument(raw, index = 0, seenIds = null) {
  const title = String(raw.title || raw.name || '').trim();
  const rawUrl = String(raw.url || raw.href || '').trim();
  const canonicalUrl = rawUrl.startsWith('http') ? rawUrl : `https://polskieradio.cc${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  const description = [
    raw.description || raw.desc || raw.snippet,
    raw.contentSnippet,
    raw.scripture
  ]
    .filter((v) => typeof v === 'string' && v.trim())
    .join(' · ')
    .trim();
  const category = String(raw.category || raw.section || 'ogólne').trim();
  const tags = Array.isArray(raw.tags) ? raw.tags.map(t => String(t).trim()) : [];
  
  // Identyfikator deterministyczny: cc:{typ}:{slug} (unikalny przy powtórzonych URL np. /dzj)
  const slug = canonicalUrl
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '') || `item-${index}`;
  const docType = determineDocType(canonicalUrl, category);
  let docId = `cc:${docType}:${slug}`;
  if (seenIds) {
    if (seenIds.has(docId)) {
      docId = `${docId}-${simpleHash(`${title}|${raw.published_at || index}`).slice(0, 6)}`;
    }
    seenIds.add(docId);
  }

  const scriptureRefs = extractScriptureRefs(`${title} ${description}`);
  const hasBibliaAudio =
    docType === 'scripture' ||
    docType === 'audio' ||
    scriptureRefs.length > 0 ||
    /biblia|list do|psalm|ewangel/i.test(`${title} ${description}`);
  const visibility = typeof raw.visibility === 'string' && raw.visibility.trim()
    ? raw.visibility.trim().toLowerCase()
    : 'public';
  const status = typeof raw.status === 'string' && raw.status.trim()
    ? raw.status.trim().toLowerCase()
    : 'published';

  return {
    id: docId,
    version: 1,
    type: docType,
    title,
    language: 'pl',
    canonical_url: canonicalUrl,
    source_system: determineSourceSystem(canonicalUrl, category),
    published_at: raw.published_at || INDEX_FRESHNESS,
    updated_at: raw.updated_at || raw.published_at || INDEX_FRESHNESS,
    indexed_at: INDEX_FRESHNESS,
    status,
    visibility,
    license: 'owned-or-authorized',
    attribution: 'Christian Culture',
    scripture_refs: scriptureRefs,
    biblia_audio_url: raw.biblia_audio_url || (hasBibliaAudio ? 'https://polskieradio.cc/biblia-audio' : undefined),
    tags,
    category,
    featured: !!raw.featured,
    checksum: `sha256:${simpleHash(`${title}|${canonicalUrl}|${description}`)}`,
    text: description
  };
}

function determineDocType(url, category) {
  const u = url.toLowerCase();
  const c = category.toLowerCase();
  if (u.includes('mojabiblia') || c.includes('biblia') || c.includes('pismo')) return 'scripture';
  if (u.includes('akademia') || u.includes('kurscodzienny') || c.includes('kurs') || c.includes('nauka')) return 'course';
  if (u.includes('news') || u.includes('/art') || c.includes('wiadomości') || c.includes('publicystyka')) return 'article';
  if (u.includes('player') || u.includes('audio') || u.includes('podcast') || c.includes('radio') || c.includes('muzyka')) return 'audio';
  if (u.includes('vod') || u.includes('wideo') || u.includes('film') || c.includes('film')) return 'video';
  if (u.includes('cclite') || u.includes('lumina') || c.includes('aplikacja') || c.includes('społeczność')) return 'app';
  return 'page';
}

function determineSourceSystem(url, category) {
  const u = url.toLowerCase();
  if (u.includes('/news') || u.includes('ccn')) return 'ccn';
  if (u.includes('akademia')) return 'akademia';
  if (u.includes('mojabiblia')) return 'mojabiblia';
  if (u.includes('player')) return 'player';
  if (u.includes('lumina')) return 'lumina';
  if (u.includes('vod')) return 'vod';
  if (u.includes('cclite.pl')) return 'cclite';
  return 'ekocc';
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Pamięciowy rejestr kanoniczny (Lazy-initialized)
 */
let canonicalDocumentsCache = null;
let customDocumentsOverride = null;

export function setCanonicalDocumentsForTest(docsOrNull) {
  customDocumentsOverride = Array.isArray(docsOrNull)
    ? docsOrNull.map((item, idx) => (item?.id ? item : toCanonicalDocument(item, idx)))
    : null;
  if (!docsOrNull) canonicalDocumentsCache = null;
}

export function getCanonicalDocuments() {
  if (customDocumentsOverride) return customDocumentsOverride;
  if (canonicalDocumentsCache) return canonicalDocumentsCache;
  const items = Array.isArray(searchIndexData) ? searchIndexData : (searchIndexData.items || []);
  const seenIds = new Set();
  canonicalDocumentsCache = items
    .filter(item => item && (item.title || item.name))
    .map((item, idx) => toCanonicalDocument(item, idx, seenIds));
  return canonicalDocumentsCache;
}

/**
 * Wyszukiwanie kanoniczne (BM25-like scoring + dopasowanie słów kluczowych)
 * BEZ WYWOŁYWANIA MODELI GENERATYWNYCH (ZERO COST)
 */
export function searchKnowledgeHub(query = '', options = {}) {
  const docs = getCanonicalDocuments();
  const qNorm = normalizeText(query);
  const typeFilter = options.type ? String(options.type).toLowerCase() : null;
  const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
  const offset = Math.max(0, parseInt(options.cursor, 10) || 0);

  if (!qNorm) {
    // Puste zapytanie: zwróć materiały wyróżnione (featured)
    const featuredDocs = docs
      .filter(d => isDocumentPubliclyVisible(d) && (!typeFilter || d.type === typeFilter))
      .filter(d => d.featured)
      .slice(offset, offset + limit);
    return {
      query: '',
      total: featuredDocs.length,
      results: featuredDocs.map(formatSearchResult),
      next_cursor: null,
      index_freshness: INDEX_FRESHNESS
    };
  }

  const queryTokens = qNorm.split(/\s+/).filter(Boolean);
  const meaningfulTokens = queryTokens.filter(t => t.length >= 2 && !STOP_TOKENS.has(t));
  const requiredTokens = meaningfulTokens.length ? meaningfulTokens : queryTokens;

  const scored = [];
  for (const doc of docs) {
    if (!isDocumentPubliclyVisible(doc)) continue;
    if (typeFilter && doc.type !== typeFilter) continue;

    const titleNorm = normalizeText(doc.title);
    const descNorm = normalizeText(doc.text);
    const urlNorm = normalizeText(doc.canonical_url);
    const tagsNorm = (doc.tags || []).map(t => normalizeText(t));
    const scriptureNorm = (doc.scripture_refs || []).map(r => normalizeText(r));

    let score = 0;

    // 1. Dokładne dopasowanie frazy w tytule / opisie
    if (titleNorm.includes(qNorm)) score += 120;
    if (descNorm.includes(qNorm)) score += 45;

    // 2. Dopasowanie referencji biblijnej (np. J 3:16)
    for (const ref of scriptureNorm) {
      if (ref.includes(qNorm) || qNorm.includes(ref)) {
        score += 80;
      }
    }

    // 3. Dopasowanie tokenów merytorycznych (bez szumu polskich spójników)
    let matchedRequired = 0;
    for (const tok of requiredTokens) {
      let hit = false;
      if (titleNorm.includes(tok)) { score += 35; hit = true; }
      if (tagsNorm.some(t => t.includes(tok))) { score += 20; hit = true; }
      if (urlNorm.includes(tok)) { score += 15; hit = true; }
      if (descNorm.includes(tok)) { score += 10; hit = true; }
      if (hit) matchedRequired++;
    }

    // Wymóg dopasowania przeważającej części słów merytorycznych (dla 1 słowa — 100%)
    if (score > 0 && matchedRequired >= Math.ceil(requiredTokens.length * 0.7)) {
      if (doc.featured) score += 10;
      scored.push({ doc, score });
    }
  }

  // Sortowanie: najwyższy wynik punktowy
  scored.sort((a, b) => b.score - a.score);

  const paginated = scored.slice(offset, offset + limit);
  const nextCursor = offset + limit < scored.length ? String(offset + limit) : null;

  return {
    query,
    total: scored.length,
    results: paginated.map(item => formatSearchResult(item.doc, item.score)),
    next_cursor: nextCursor,
    index_freshness: INDEX_FRESHNESS
  };
}

function formatSearchResult(doc, score = 0) {
  return {
    document_id: doc.id,
    type: doc.type,
    title: doc.title,
    url: doc.canonical_url,
    snippet: doc.text.length > 240 ? `${doc.text.slice(0, 237)}...` : doc.text,
    source_type: doc.source_system,
    language: doc.language,
    scripture_refs: doc.scripture_refs,
    biblia_audio_url: doc.biblia_audio_url,
    license: doc.license,
    attribution: doc.attribution,
    published_at: doc.published_at,
    last_verified_at: doc.updated_at,
    relevance_score: score > 0 ? score : undefined
  };
}

/**
 * Pobranie pojedynczego dokumentu (kontrola widoczności przy każdym odczycie)
 */
export function getDocumentById(id) {
  const docs = getCanonicalDocuments();
  return docs.find(d => d.id === id && isDocumentPubliclyVisible(d)) || null;
}

/**
 * Pobranie katalogu tematów
 */
export function getTopicsCatalog(lang = 'pl') {
  const docs = getCanonicalDocuments();
  const categoryCounts = {};
  for (const doc of docs) {
    if (!isDocumentPubliclyVisible(doc)) continue;
    const cat = doc.category || 'Ogólne';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Wyszukiwanie licencjonowanego fragmentu Pisma Świętego (UBG)
 */
export function findScripture(reference = '', translation = 'UBG') {
  const normRef = normalizeText(reference);
  const items = bibleRagData.items || [];
  
  if (!normRef) return null;

  // 1. Dopasowanie po dokładnych wersetach (np. J 3:16)
  for (const item of items) {
    if (item.verses && item.verses.some(v => normalizeText(v).includes(normRef) || normRef.includes(normalizeText(v)))) {
      return {
        reference: item.verses.join(', '),
        translation: item.author || 'Uwspółcześniona Biblia Gdańska (UBG)',
        license: item.license || 'UBG_AUTHORIZED',
        topic: item.topic || 'Biblia',
        text: item.text,
        canonical_url: item.url || 'https://polskieradio.cc/mojabiblia'
      };
    }
  }

  // 2. Dopasowanie po tytule
  for (const item of items) {
    if (normalizeText(item.title).includes(normRef)) {
      return {
        reference: (item.verses && item.verses.join(', ')) || item.title,
        translation: item.author || 'Uwspółcześniona Biblia Gdańska (UBG)',
        license: item.license || 'UBG_AUTHORIZED',
        topic: item.topic || 'Biblia',
        text: item.text,
        canonical_url: item.url || 'https://polskieradio.cc/mojabiblia'
      };
    }
  }

  return null;
}

/**
 * Asynchroniczne wyszukiwanie wersetu z automatycznym wsparciem MojaBiblia UBG
 */
export async function findScriptureWithBridge(reference = '', translation = 'UBG', env = {}, deps = {}) {
  const direct = findScripture(reference, translation);
  if (direct) {
    return {
      ...direct,
      biblia_audio_url: 'https://polskieradio.cc/biblia-audio'
    };
  }
  const cleanRef = String(reference || '').trim();
  if (!cleanRef) return null;
  const resolved = await resolveMojaBibliaVerses([cleanRef], env, deps);
  const first = resolved?.[0];
  if (!first || !first.ubg) return null;
  return {
    reference: first.reference,
    short_ref: first.shortRef,
    translation: 'Uwspółcześniona Biblia Gdańska (UBG)',
    license: 'UBG_AUTHORIZED',
    topic: 'Pismo Święte',
    text: first.ubg,
    canonical_url: first.interlinearUrl || first.readerUrl || 'https://polskieradio.cc/mojabiblia',
    biblia_audio_url: 'https://polskieradio.cc/biblia-audio'
  };
}

/**
 * Oficjalna polityka źródeł i zasad redakcyjnych (Sola Scriptura & Zero QA)
 */
export function getSourcePolicy() {
  return {
    doctrine: "Sola Scriptura",
    canonical_bible_translation: "Uwspółcześniona Biblia Gdańska (UBG)",
    support_tool: "MojaBiblia CC (polskieradio.cc/mojabiblia)",
    principles: [
      "Pismo Święte jest ostatecznym autorytetem wiary i życia.",
      "Kategoryczny zakaz fabrykowania wersetów, autorów, dat i cytatów.",
      "Ścisłe rozróżnienie literalnego tekstu Pisma od komentarzy, tradycji i publicystyki.",
      "Kategoryczny zakaz podszywania się pod Jezusa Chrystusa lub udawania głosu Boga.",
      "Standard ZERO COST — publiczne wyszukiwanie i serwer MCP działają bezpłatnie, bez opłat modelowych po stronie misji.",
      "Prawo autorskie i licencje: teksty cytowane są wyłącznie zgodnie z licencją UBG i prawami autorskimi Christian Culture."
    ],
    version: "1.0.0",
    published_by: "Christian Culture / EkoCC"
  };
}
