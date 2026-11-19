#!/usr/bin/env node
/**
 * LOADER 200 STRON TEMATYCZNYCH CC POMOC (100 PL + 100 EN) DO AUTOMATYCZNEJ PROMOCJI EKOSYSTEMU
 *
 * Wczytuje kanoniczny manifest `cc-pomoc/catalog.json`, pobiera meta description
 * oraz źródłową ilustrację (og:image / cc-pomoc/assets/*.webp) z wygenerowanych plików HTML
 * i układa wszystkie 200 opublikowanych poradników PL/EN w zróżnicowaną rotację
 * (start od /depresja, przeplot przez 12 działów i rozdzielenie bliźniaczych wersji PL/EN).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, ' ')
    .trim();
}

function readTopicHtml(rootDir, route = '') {
  const slug = String(route || '').replace(/^\/+/, '');
  if (!slug) return null;
  const flatPath = path.join(rootDir, `${slug}.html`);
  if (fs.existsSync(flatPath)) {
    return fs.readFileSync(flatPath, 'utf8');
  }
  const indexPath = path.join(rootDir, slug, 'index.html');
  if (fs.existsSync(indexPath)) {
    return fs.readFileSync(indexPath, 'utf8');
  }
  return null;
}

function extractMeta(html = '', topicId = '', rootDir = DEFAULT_ROOT) {
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const lead = descMatch ? decodeHtmlEntities(descMatch[1]) : '';

  let sourceImage = null;
  const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogMatch && ogMatch[1]) {
    const cleanRel = ogMatch[1]
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/[?#].*$/, '')
      .replace(/^\/+/, '');
    if (cleanRel && fs.existsSync(path.join(rootDir, cleanRel))) {
      sourceImage = cleanRel;
    }
  }

  if (!sourceImage && topicId) {
    const fallbackAsset = `cc-pomoc/assets/${topicId}.webp`;
    if (fs.existsSync(path.join(rootDir, fallbackAsset))) {
      sourceImage = fallbackAsset;
    }
  }

  return { lead, sourceImage };
}

function buildSectionInterleavedTopics(catalog = {}) {
  const sections = Array.isArray(catalog.sections) ? catalog.sections : [];
  const queues = sections.map((section) =>
    (Array.isArray(section.items) ? section.items : [])
      .filter((item) => item && item.status === 'published' && item.route?.pl && item.route?.en)
      .map((item) => ({ section, item }))
  );

  const ordered = [];
  let depresjaEntry = null;
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      if (q.length === 0) continue;
      added = true;
      const entry = q.shift();
      if (!depresjaEntry && (entry.item.id === 'depresja' || entry.item.route?.pl === '/depresja')) {
        depresjaEntry = entry;
      } else {
        ordered.push(entry);
      }
    }
  }

  if (depresjaEntry) {
    ordered.unshift(depresjaEntry);
  }
  return ordered;
}

function buildLangEntry(entry, lang, rootDir) {
  const { section, item } = entry;
  const isEn = lang === 'en';
  const route = isEn ? item.route?.en : item.route?.pl;
  if (!route) return null;

  const html = readTopicHtml(rootDir, route);
  if (!html) return null;

  const { lead, sourceImage } = extractMeta(html, item.id, rootDir);
  const rawTitle = (isEn ? item.title?.en : item.title?.pl) || item.id;
  const sectionTitle = (isEn ? section.title?.en : section.title?.pl) || (isEn ? 'Support & First Steps' : 'Wsparcie i Pierwszy Krok');

  return {
    title: isEn ? `CC Help: ${rawTitle}` : `CC Pomoc: ${rawTitle}`,
    rawTitle,
    lead,
    url: `https://polskieradio.cc${route}`,
    image: null,
    sourceImage,
    category: isEn ? 'CC Help' : 'CC Pomoc',
    sectionTitle,
    topicId: item.id,
    lang,
    type: 'help',
    tag: isEn ? '#CCHelp' : '#CCPomoc'
  };
}

/**
 * Zwraca listę do 200 opublikowanych stron tematycznych CC Pomoc (100 PL + 100 EN)
 * w kolejności zapewniającej różnorodność działów i maksymalne rozdzielenie bliźniaczych par PL/EN.
 */
export function loadCcPomocCandidates(rootDir = DEFAULT_ROOT) {
  const catalogPath = path.join(rootDir, 'cc-pomoc', 'catalog.json');
  if (!fs.existsSync(catalogPath)) return [];

  let catalog;
  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch {
    return [];
  }

  const orderedTopics = buildSectionInterleavedTopics(catalog);
  const plItems = [];
  const enItemsRaw = [];

  for (const entry of orderedTopics) {
    const pl = buildLangEntry(entry, 'pl', rootDir);
    const en = buildLangEntry(entry, 'en', rootDir);
    if (pl) plItems.push(pl);
    if (en) enItemsRaw.push(en);
  }

  // Przesuń wersje EN o połowę puli, aby pary PL/EN tego samego tematu dzieliło ok. 50+ pozycji
  const halfShift = Math.floor(enItemsRaw.length / 2);
  const enRotated = enItemsRaw.length > 0
    ? enItemsRaw.map((_, idx) => enItemsRaw[(idx + halfShift) % enItemsRaw.length])
    : [];

  const result = [];
  let enIdx = 0;
  for (let p = 0; p < plItems.length; p += 1) {
    result.push(plItems[p]);
    if (p % 2 === 1 && enIdx < enRotated.length) {
      result.push(enRotated[enIdx]);
      enIdx += 1;
    }
  }
  while (enIdx < enRotated.length) {
    result.push(enRotated[enIdx]);
    enIdx += 1;
  }

  return result;
}

export function getCcPomocUrlSet(rootDir = DEFAULT_ROOT) {
  const items = loadCcPomocCandidates(rootDir);
  return new Set(items.map((item) => item.url.trim().toLowerCase().replace(/\/+$/, '')));
}
