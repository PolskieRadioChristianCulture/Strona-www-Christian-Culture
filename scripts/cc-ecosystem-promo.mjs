#!/usr/bin/env node
/**
 * LOADER WSZYSTKICH CZYSTYCH PUBLICZNYCH STRON EKOSYSTEMU POLSKIERADIO.CC
 *
 * Skanuje publiczne, kanoniczne i indeksowane strony HTML całego ekosystemu
 * (wszystkie portale CCN, Świadectwa Wiary, Biblioteka CC, Christian Culture Global,
 * CC Music, Pomogę Bo Mogę, Bądź Blisko, kursy i moduły), z bezwzględnym
 * wykluczeniem:
 *   - prywatnych profili LUMINA (`lumina.*`, `lumina-profile`, itd. — L0 18.11.2026),
 *   - dokumentów prawnych/prywatności, stron 404, kopii roboczych, testów i mockupów,
 *   - przekierowań (`meta refresh`, `window.location.replace`) i stron `noindex`,
 *   - scen transmisyjnych OBS / kanałów LIVE (`*-live*`, `stream-scene*`, `cctv24-worship*`),
 *   - duplikatów (`art-*`, lustrzanych `/kursy/kurscodzienny/*`, `/akademia/apokalipsa/*`),
 *   - prywatnych paneli (`ccmc`, `kalendarz`, Mission Control).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');

export const ECOSYSTEM_SKIP_DIRS = new Set([
  'node_modules', '.git', '.pages-release', '.wrangler', '.vscode', '.github', '.agents',
  'scripts', 'tests', 'data', 'js', 'css', 'images', 'img', 'assets', 'audio', 'media',
  'video', 'fonts', 'icons', 'components', 'functions', 'workers', 'templates', 'scratch',
  'mockups', 'dist', 'build', 'temp', 'tmp', 'backup', 'backups', 'archive', 'cc-pomoc',
  'en', 'szukaj', 'portals', 'kolejka-publikacji', 'prototypes', 'temp_packages', 'docs',
  'biblioteka-audio', 'cloudflare-worker'
]);

export const ECOSYSTEM_SKIP_ROOT_SLUGS = new Set([
  '404', 'index', 'indeks', 'dist', 'scratch', 'mockups', 'live_check', 'ccre-preview',
  'cctv24-worship.backup-20261008', 'privacy', 'lumina-login', 'lumina-profile',
  'content-registry', 'go', 'admin', 'panel', 'login', 'auth', 'test', 'pilot',
  'koncept-studio',
  // Sceny OBS / kanały transmisyjne LIVE
  'snadaniowa-live', 'snadaniowa-live-worship', 'cctv24-worship', 'cctv24-worship-live',
  'stream-scene', 'stream-scene-vertical', 'master-live', 'dzj-vertical-live', 'zapolske-live',
  'biblia-spiewana-live', 'biblia-spiewana-vertical', 'apokalipsa-ksiega-nadziei-live',
  'apokalipsa-ksiega-nadziei-live-YT', 'apokalipsa-live', 'ambient-sleep-live',
  'codzienne-uwielbienie-live', 'nocne-czuwanie-live', 'randki-malzenstwo-live',
  'spiewajmy-panu-live', 'studium-live', 'swiadectwa-live', 'totalny-atak-live',
  'tv-epafraz-live', 'tvw-women-live', 'wieczor-ze-slowem-bozym-live',
  // Panele kalendarza / polityki / aliasy i przekierowania
  'ccmc', 'ccMC', 'cc-life', 'kalendarz', 'polityka-redakcyjna', 'general-safety', 'lumina-safety',
  'lumina-tablica-light', 'darowizna', 'wesprzyj', 'patron', 'patronat', 'surwiwal',
  'aktualnosci', 'szukaj', 'skin', 'BądźBlisko', 'wizytowka'
]);

const GENERIC_LOGO_IMAGES = new Set([
  'ccn-logo-square.png',
  'icon.png',
  'logo_cctv.png',
  'logo.png',
  'images/logo.png',
  'app-christian-culture.png'
]);

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPageTitle(raw = '') {
  return decodeHtmlEntities(raw)
    .replace(/\s*[|–—•-]\s*(Christian Culture Global|Christian Culture Network|Christian Culture|Polskie\s*Radio\s*CC|LUMINA Bible Academy|CCN News|CC Music)\s*$/i, '')
    .replace(/\s*[|–—]\s*Świadectwa Wiary\s*$/i, ' — Świadectwa Wiary')
    .trim();
}

function normalizeUrlKey(rawUrl = '') {
  try {
    const u = new URL(rawUrl, 'https://polskieradio.cc');
    u.hash = '';
    const p = u.pathname.replace(/\/+$/, '').replace(/\.html$/i, '') || '';
    return `${u.origin}${p}${u.search}`.toLowerCase();
  } catch {
    return String(rawUrl || '').trim().toLowerCase().replace(/\/+$/, '').replace(/\.html$/i, '');
  }
}

function isRasterLocalImage(relPath = '', rootDir = DEFAULT_ROOT) {
  const cleanRel = String(relPath || '').split(/[?#]/)[0].replace(/^\/+/, '');
  if (!cleanRel) return false;
  if (!/\.(jpe?g|png|webp)$/i.test(cleanRel)) return false;
  if (GENERIC_LOGO_IMAGES.has(cleanRel.toLowerCase())) return false;
  return fs.existsSync(path.join(rootDir, cleanRel));
}

function classifyEcosystemPage(url, title, metaDesc) {
  const u = new URL(url);
  const p = u.pathname.toLowerCase();
  const isEn =
    p.startsWith('/global/') ||
    p.endsWith('/en') ||
    p.includes('/news/en/') ||
    p.endsWith('/pomogebomoge/en') ||
    p.endsWith('/badz-blisko/en');

  if (p.startsWith('/swiadectwa/')) {
    return { type: 'news', category: 'Świadectwa Wiary', tag: '#SwiadectwaWiary', lang: 'pl' };
  }
  if (p === '/biblioteka' || p.startsWith('/biblioteka/')) {
    return { type: 'book', category: 'Biblioteka CC', tag: '#BibliotekaCC', lang: 'pl' };
  }
  if (p.startsWith('/wioletta/pardon-czy-to-milosc')) {
    return { type: 'book', category: 'Książki', tag: '#WiolettaRogowska', lang: 'pl' };
  }
  if (p === '/moja-ksiazka') {
    return { type: 'book', category: 'Książki', tag: '#KsiazkiCC', lang: 'pl' };
  }
  if (p.startsWith('/global/articles/')) {
    return { type: 'news', category: 'Christian Culture Global', tag: '#ChristianCultureGlobal', lang: 'en' };
  }
  if (p === '/help') {
    return {
      type: 'help',
      category: 'CC Pomoc',
      sectionTitle: 'Katalog 200 Poradników',
      tag: '#CCPomoc',
      lang: 'pl'
    };
  }
  if (p === '/pomogebomoge' || p.startsWith('/pomogebomoge/')) {
    const langMatch = p.match(/^\/pomogebomoge\/([a-z]{2})$/);
    return {
      type: 'module',
      category: 'Pomogę Bo Mogę',
      tag: '#PomogeBoMoge',
      lang: langMatch ? langMatch[1] : 'pl'
    };
  }
  if (p.startsWith('/badz-blisko/')) {
    const langMatch = p.match(/^\/badz-blisko\/([a-z]{2})$/);
    return {
      type: 'module',
      category: 'Słowo Boże',
      tag: '#BadzBlisko',
      lang: langMatch ? langMatch[1] : 'pl'
    };
  }
  if (
    p.startsWith('/music/') ||
    p.startsWith('/spiritualsounds') ||
    p.startsWith('/welch') ||
    p.startsWith('/arkoffire') ||
    p === '/audioteka' ||
    p === '/biblijne-uwielbienie' ||
    p === '/karaoke-studio' ||
    p === '/live-worship' ||
    p === '/mojeradio' ||
    p === '/radiostyle' ||
    p === '/vibe' ||
    p === '/stacje'
  ) {
    return {
      type: 'music',
      category: 'Muzyka i Radio CC',
      tag: p.includes('arkoffire') ? '#ArkOfFire' : (p.includes('spiritualsounds') ? '#SpiritualSounds' : '#CCMusic'),
      lang: isEn ? 'en' : 'pl'
    };
  }
  if (p === '/kursy' || p.startsWith('/kursy/') || p === '/akademia/kurscodzienny') {
    return { type: 'course', category: 'Kursy Biblijne CC', tag: '#AkademiaBiblijna', lang: 'pl' };
  }
  if (
    p === '/si' ||
    p.startsWith('/si/') ||
    p.startsWith('/technologie/') ||
    p.startsWith('/historia/') ||
    p.startsWith('/nauka/') ||
    p.startsWith('/prawo/') ||
    p.startsWith('/biblia/') ||
    p.startsWith('/spoleczenstwo/') ||
    p.startsWith('/wiadomosci/') ||
    p.startsWith('/news/') ||
    p === '/motywacja' ||
    p === '/survival' ||
    p === '/raport'
  ) {
    const seg = p.split('/').filter(Boolean)[0] || 'news';
    const tagMap = {
      si: '#CCNTechnologie',
      technologie: '#CCNTechnologie',
      historia: '#CCNHistoria',
      nauka: '#CCNNauka',
      prawo: '#CCNPrawo',
      biblia: '#Biblia',
      spoleczenstwo: '#CCNSpołeczeństwo',
      wiadomosci: '#CCNNews',
      motywacja: '#eMMotywacja',
      survival: '#SurvivalCC',
      raport: '#RaportMisji'
    };
    return {
      type: 'news',
      category: `CCN ${seg.toUpperCase()}`,
      tag: tagMap[seg] || '#CCNNews',
      lang: isEn ? 'en' : 'pl'
    };
  }

  return {
    type: 'module',
    category: 'Ekosystem CC',
    tag: '#EkosystemCC',
    lang: isEn ? 'en' : 'pl',
    leadFallback: metaDesc || title
  };
}

function inspectHtmlPage(fullPath, relDir, filename, rootDir) {
  let raw;
  try {
    raw = fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
  if (raw.length < 1200) return null;
  if (/<meta[^>]+http-equiv=["']?refresh["']?/i.test(raw)) return null;
  if (/<meta[^>]+name=["']?robots["']?[^>]+noindex/i.test(raw)) return null;
  if (/window\.location\.replace\s*\(/i.test(raw) && raw.length < 4000) return null;

  const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : '';
  if (!rawTitle || /mission control|panel dow[oó]dcy|404|przekierowanie/i.test(rawTitle)) return null;

  const slug = filename.replace(/\.html$/i, '');
  const urlPath = slug === 'index' ? (relDir ? `/${relDir}` : '/') : (relDir ? `/${relDir}/${slug}` : `/${slug}`);
  const canMatch = raw.match(/<link[^>]+rel=["']?canonical["']?[^>]+href=["']([^"']+)["']/i);
  let url = `https://polskieradio.cc${urlPath}`;
  if (canMatch && /^https:\/\/polskieradio\.cc(?:\/|$)/i.test(canMatch[1].trim())) {
    url = canMatch[1].trim().replace(/\/+$/, '').replace(/\.html$/i, '') || 'https://polskieradio.cc';
  }
  url = url.replace(/\/+$/, '') || 'https://polskieradio.cc';

  // Skip legacy duplicate mirrors & test articles
  if (/\/(kursy\/kurscodzienny|akademia\/apokalipsa)\//i.test(url)) return null;
  if (/\/art-/i.test(url)) return null;
  if (/\/test-/i.test(url)) return null;
  if (/(^|\/)(privacy|regulamin|polityka-prywatnosci)(\/|$)/i.test(urlPath)) return null;

  const descMatch =
    raw.match(/<meta[^>]+name=["']?description["']?[^>]+content=["']([^"']+)["']/i) ||
    raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']?description["']?/i);
  const lead = descMatch ? decodeHtmlEntities(descMatch[1]) : '';

  const ogMatch =
    raw.match(/<meta[^>]+property=["']?og:image["']?[^>]+content=["']([^"']+)["']/i) ||
    raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']?og:image["']?/i);
  let localImage = null;
  if (ogMatch && ogMatch[1]) {
    const rawOg = ogMatch[1].trim();
    if (!/^https?:\/\//i.test(rawOg) || /^https?:\/\/polskieradio\.cc\//i.test(rawOg)) {
      const relImg = rawOg.replace(/^https?:\/\/polskieradio\.cc\/?/i, '').split(/[?#]/)[0].replace(/^\/+/, '');
      if (isRasterLocalImage(relImg, rootDir)) {
        localImage = relImg;
      }
    }
  }

  const title = cleanPageTitle(rawTitle) || rawTitle;
  const meta = classifyEcosystemPage(url, title, lead);

  return {
    title,
    lead: lead || title,
    url,
    canonicalKey: normalizeUrlKey(url),
    image: localImage,
    category: meta.category,
    sectionTitle: meta.sectionTitle || undefined,
    type: meta.type,
    tag: meta.tag,
    lang: meta.lang
  };
}

/**
 * Skanuje wszystkie czyste, publiczne i kanoniczne strony ekosystemu polskieradio.cc,
 * zwracając pozycje przeplatane równomiernie między działami (świeckie/tematyczne portale,
 * Świadectwa Wiary, Biblioteka CC, Global, CC Music, Pomogę Bo Mogę, itd.).
 */
export function loadEcosystemPublicPages(rootDir = DEFAULT_ROOT) {
  if (!rootDir || !fs.existsSync(rootDir)) return [];

  const byCanonical = new Map();

  function walk(dir, relDir = '') {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!relDir && (ECOSYSTEM_SKIP_DIRS.has(entry.name) || ECOSYSTEM_SKIP_ROOT_SLUGS.has(entry.name))) continue;
        if (
          entry.name.startsWith('.') ||
          /^(node_modules|assets|images|audio|video|css|js|data|fonts|icons|templates|backups?)$/i.test(entry.name)
        ) {
          continue;
        }
        walk(path.join(dir, entry.name), relDir ? `${relDir}/${entry.name}` : entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        if (entry.name.startsWith('_')) continue;
        const slug = entry.name.replace(/\.html$/i, '');
        if (!relDir && (ECOSYSTEM_SKIP_ROOT_SLUGS.has(slug) || slug.startsWith('lumina.'))) {
          continue;
        }
        if (/backup|mockup|template|panel|regulamin|privacy|login|admin|embed|widget|preview|404|redirect|demo/i.test(`${relDir}/${slug}`)) {
          continue;
        }

        const item = inspectHtmlPage(path.join(dir, entry.name), relDir, entry.name, rootDir);
        if (!item) continue;
        const topSeg = new URL(item.url).pathname.replace(/^\/+/, '').split('/')[0];
        if (topSeg && ECOSYSTEM_SKIP_ROOT_SLUGS.has(topSeg)) continue;
        if (!byCanonical.has(item.canonicalKey)) {
          byCanonical.set(item.canonicalKey, item);
        }
      }
    }
  }

  walk(rootDir);

  // Przeplatanka wg sekcji najwyższego poziomu, żeby żaden dział nie zdominował kolejki
  const buckets = new Map();
  for (const item of byCanonical.values()) {
    const pathname = new URL(item.url).pathname.replace(/^\/+/, '');
    const seg = (pathname.split('/')[0] || '_root').toLowerCase();
    if (!buckets.has(seg)) buckets.set(seg, []);
    buckets.get(seg).push(item);
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => a.url.localeCompare(b.url, 'pl'));
  }

  const queues = [...buckets.values()];
  const interleaved = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      if (q.length === 0) continue;
      added = true;
      const entry = q.shift();
      delete entry.canonicalKey;
      interleaved.push(entry);
    }
  }

  return interleaved;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const items = loadEcosystemPublicPages(DEFAULT_ROOT);
  const counts = {};
  for (const it of items) {
    counts[it.type] = (counts[it.type] || 0) + 1;
  }
  console.log(`Loaded ${items.length} canonical public pages:`, counts);
}
