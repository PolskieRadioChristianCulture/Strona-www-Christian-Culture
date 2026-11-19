#!/usr/bin/env node
/**
 * GENERATOR I BRAMKA ADEKWATNOŚCI GRAFIK TEMATYCZNYCH SOCIAL MEDIA (EkoCC @777)
 *
 * Standard:
 * - Viral Graphics Director 2.1 (Reguła 3x3x3, separacja marek CC / SDS / CC Women, 100% polskie znaki)
 * - ZERO kiczu AI, ZERO niedopasowanych obrazów zastępczych (art-cbdc przy VOD, portret założycieli na modułach itp.)
 *
 * Eksportuje:
 * - isImageAdequateForItem(imagePathOrRel, item, rootDir)
 * - generateSocialTopicGraphic(item, options)
 * - ensureSocialTopicGraphicSync(item, rootDir)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const LUMINA_MIRROR_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const TEMPLATE_VERSION = 'v1';

function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function hashHex8(str = '') {
  return hashString(str).toString(16).padStart(8, '0').slice(0, 8);
}

function slugify(str = '') {
  const map = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z'
  };
  return String(str)
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'ekocc';
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getNormalizedPathname(rawUrl = '') {
  if (!rawUrl) return '';
  try {
    return new URL(rawUrl, 'https://polskieradio.cc').pathname.toLowerCase();
  } catch {
    return String(rawUrl).toLowerCase();
  }
}

function wrapTextLines(text, maxCharsPerLine = 34, maxLines = 4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    trimmed[maxLines - 1] = trimmed[maxLines - 1].replace(/[,.!?;:\-—]+$/, '') + '…';
    return trimmed;
  }
  return lines;
}

/**
 * Pancerna bramka zgodności treściowej obrazu (@A520 / Viral Director).
 * Zwraca true wyłącznie wtedy, gdy obraz fizycznie istnieje i tematycznie pasuje do wpisu.
 */
export function isImageAdequateForItem(imagePathOrRel, item = {}, rootDir = DEFAULT_ROOT) {
  if (!imagePathOrRel || typeof imagePathOrRel !== 'string' || !imagePathOrRel.trim()) {
    return false;
  }

  const raw = imagePathOrRel.trim();
  const fullPath = path.isAbsolute(raw) ? raw : path.join(rootDir, raw.replace(/^\/+/, ''));
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const relNorm = (path.isAbsolute(raw) ? path.relative(rootDir, raw) : raw)
    .replace(/\\/g, '/')
    .toLowerCase();

  const title = String(item.title || '');
  const url = String(item.url || '');
  const category = String(item.category || '');
  const type = String(item.type || '');
  const titleLower = title.toLowerCase();
  const urlLower = url.toLowerCase();
  const pathLower = getNormalizedPathname(url);
  const titleAndUrl = `${titleLower} ${urlLower}`;

  // Globalnie zakazane obrazy w polskich postach social media (fałszywe ikony sklepów, pionowe prześwietlone plakaty)
  if (
    relNorm.includes('images/kultura/card-vod.jpg') ||
    relNorm.includes('vod_hity_kina_poster.jpg')
  ) {
    return false;
  }

  // 1. CBDC / Prawo Niedzielne — wyłącznie dla właściwego artykułu CBDC
  if (relNorm.includes('art-cbdc-prawo-niedzielne-apokalipsa-13')) {
    const isCbdcArticle =
      titleAndUrl.includes('cbdc') ||
      titleAndUrl.includes('cyfrowy pieniądz') ||
      titleAndUrl.includes('cyfrowy pieniadz') ||
      titleAndUrl.includes('prawo niedzielne');
    if (!isCbdcArticle) return false;
  }

  // 2. Zdjęcie założycieli — wyłącznie tam, gdzie treść dotyczy Cezarego / Wioletty / założycieli
  if (relNorm.includes('cezary-wioletta-radiocc')) {
    if (!/(cezary|wiolett|rogowsc|założyciel|zalozyciel|o-nas)/i.test(titleAndUrl)) {
      return false;
    }
  }

  // 3. Artykuł o szabacie / niedzieli Bacchiocchiego — wyłącznie dla treści o szabacie / niedzieli
  if (relNorm.includes('art-co-dalej-z-ta-niedziela-szabat-bacchiocchi')) {
    if (!/(niedziel|szabat|bacchiocchi)/i.test(titleAndUrl)) {
      return false;
    }
  }

  // 4. Grafika Rdz 15 Abram — niedozwolona dla ogólnego /mojabiblia bez kontekstu GEN.15 / Abram
  if (relNorm.includes('art-rdz15-abram-gwiazdy')) {
    const isGen15 =
      urlLower.includes('ref=gen.15') ||
      titleAndUrl.includes('rdz 15') ||
      titleAndUrl.includes('rodzaju 15') ||
      titleAndUrl.includes('abram');
    if (pathLower.includes('mojabiblia') && !isGen15) {
      return false;
    }
  }

  // 5. Grafika Dnia 31 — niedozwolona dla ogólnej strony /akademia lub spisu kursu
  if (relNorm.includes('art-z-biblia-za-pan-brat-dzien-31') || relNorm.includes('kc_day_31_')) {
    const isDay31 =
      pathLower.includes('dzien-31') ||
      titleAndUrl.includes('dzień 31') ||
      titleAndUrl.includes('dzien 31') ||
      titleAndUrl.includes('rdz 50') ||
      titleAndUrl.includes('obrócił to w dobro');
    if (!isDay31) return false;
  }

  // 6. Pancerna separacja marek: Kino VOD (CC) / Jonatan Dunkel vs Studio Dobrego Słowa (SDS)
  const isVodItem =
    type.toLowerCase() === 'vod' ||
    pathLower === '/vod' ||
    pathLower.startsWith('/vod/') ||
    titleLower.includes('kino vod') ||
    category.toLowerCase().includes('kino vod');
  const isDunkelItem = titleAndUrl.includes('dunkel');

  if (isVodItem || isDunkelItem) {
    if (
      relNorm.includes('sds') ||
      relNorm.includes('mariusz_sds') ||
      relNorm.includes('studiodobregoslowa') ||
      relNorm.includes('courses/apokalipsa') ||
      relNorm.includes('globalny-reset-premiera-sds') ||
      relNorm.includes('art-cbdc')
    ) {
      return false;
    }
  }

  const isSdsCourseItem =
    pathLower.includes('kursy/apokalipsa') ||
    titleLower.includes('studio dobrego słowa') ||
    category.toLowerCase().includes('studio dobrego słowa');

  if (isSdsCourseItem) {
    if (
      relNorm.includes('vod') ||
      relNorm.includes('card-vod') ||
      relNorm.includes('logo_vod') ||
      relNorm.includes('kino-vod') ||
      relNorm.includes('art-cbdc')
    ) {
      return false;
    }
  }

  return true;
}

function selectTopicProfile(item = {}) {
  const titleLower = String(item.title || '').toLowerCase();
  const urlLower = String(item.url || '').toLowerCase();
  const pathLower = getNormalizedPathname(item.url || '');
  const catLower = String(item.category || '').toLowerCase();
  const combined = `${titleLower} ${urlLower} ${catLower}`;

  // 1. Studio Dobrego Słowa — cykl „Apokalipsa: Księga Nadziei”
  if (pathLower.includes('kursy/apokalipsa') || combined.includes('studio dobrego słowa')) {
    return {
      brand: 'sds',
      bgTop: '#0D0E12',
      bgBottom: '#171115',
      accent: '#B91C1C',
      badge: 'STUDIO DOBREGO SŁOWA • APOKALIPSA: KSIĘGA NADZIEI',
      footer: 'polskieradio.cc/kursy/apokalipsa • studiods.pl',
      icon: 'scroll'
    };
  }

  // 2. CC Women
  if (
    pathLower.includes('/ewa') ||
    pathLower.includes('/ccwomen') ||
    combined.includes('cc women') ||
    combined.includes('cc-women')
  ) {
    return {
      brand: 'ccwomen',
      bgTop: '#160824',
      bgBottom: '#230A36',
      accent: '#FF4FA3',
      badge: 'CC WOMEN • KOBIETA WIARY',
      footer: 'CHRISTIAN CULTURE • polskieradio.cc/ccwomen',
      icon: 'flame'
    };
  }

  // 3. Biblia, MojaBiblia, Modlitwa, Rozważania (złota linia Champagne Gold #C4A35A)
  if (
    pathLower.includes('mojabiblia') ||
    pathLower.includes('modlitwa') ||
    pathLower.includes('/dzj') ||
    pathLower.includes('akademia') ||
    pathLower.includes('biblia') ||
    combined.includes('pismo święte') ||
    combined.includes('słowo boże')
  ) {
    let badge = 'CHRISTIAN CULTURE • PISMO ŚWIĘTE';
    let icon = 'book';
    if (pathLower.includes('mojabiblia')) {
      badge = 'MOJA BIBLIA INTERLINEARNA • UBG';
      icon = 'book';
    } else if (pathLower.includes('modlitwa')) {
      badge = 'MODLITWA • ZJEDNOCZENI ZA POLSKĘ';
      icon = 'flame';
    } else if (pathLower.includes('/dzj')) {
      badge = 'DOBRZE, ŻE JESTEŚ • ROZWAŻANIE DNIA';
      icon = 'flame';
    } else if (pathLower.includes('akademia') || pathLower.includes('kurs')) {
      badge = 'AKADEMIA BIBLIJNA • CHRISTIAN CULTURE';
      icon = 'book';
    }

    return {
      brand: 'cc-gold',
      bgTop: '#0B0F19',
      bgBottom: '#131622',
      accent: '#C4A35A',
      badge,
      footer: buildFooterLabel(urlLower),
      icon
    };
  }

  // 4. Pozostałe moduły, portale CCN, finanse, apologetyka, wideo, sieć (#FF7A00)
  let badge = 'CHRISTIAN CULTURE • EKOSYSTEM';
  let icon = 'shield';
  if (pathLower.includes('finanse') || combined.includes('finanse') || pathLower.includes('biznes')) {
    badge = 'CCN FINANSE & ETYKA • CHRISTIAN CULTURE';
    icon = 'shield';
  } else if (pathLower.includes('apologetyka') || combined.includes('apologetyka')) {
    badge = 'CCN APOLOGETYKA • PISMO ŚWIĘTE';
    icon = 'shield';
  } else if (pathLower.includes('kuchnia')) {
    badge = 'CCN KUCHNIA • TRADYCJA BIBLIJNA';
    icon = 'flame';
  } else if (pathLower.includes('network') || pathLower.includes('radio') || pathLower.includes('widget')) {
    badge = 'CC NETWORK • RADIO I MEDIA 24/7';
    icon = 'waves';
  } else if (pathLower.includes('rolki') || pathLower.includes('tv')) {
    badge = 'WIDEO I TRANSMISJE • CHRISTIAN CULTURE';
    icon = 'camera';
  } else if (pathLower.includes('news') || item.type === 'news') {
    badge = 'CCN NEWS • CHRISTIAN CULTURE';
    icon = 'shield';
  } else if (item.category) {
    badge = `${String(item.category).toUpperCase().slice(0, 34)} • CHRISTIAN CULTURE`;
  }

  return {
    brand: 'cc-orange',
    bgTop: '#0B0F19',
    bgBottom: '#121826',
    accent: '#FF7A00',
    badge,
    footer: buildFooterLabel(urlLower),
    icon
  };
}

function buildFooterLabel(urlLower = '') {
  try {
    const u = new URL(urlLower || 'https://polskieradio.cc');
    const cleanPath = u.pathname === '/' ? '' : u.pathname.replace(/\/+$/, '');
    const shortUrl = `polskieradio.cc${cleanPath}`;
    return shortUrl.length <= 44
      ? `CHRISTIAN CULTURE • ${shortUrl}`
      : 'CHRISTIAN CULTURE • polskieradio.cc';
  } catch {
    return 'CHRISTIAN CULTURE • polskieradio.cc';
  }
}

function renderTopicIconSvg(icon, accent) {
  switch (icon) {
    case 'scroll':
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#181216" stroke="${accent}" stroke-width="2"/>
        <path d="M16 14 H40 V40 H16 Z" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M21 22 H35 M21 28 H35 M21 34 H30" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    case 'flame':
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#121521" stroke="${accent}" stroke-width="2"/>
        <path d="M28 12 C34 20 39 25 39 33 C39 40 34 44 28 44 C22 44 17 40 17 33 C17 28 20 24 23 20 C24 23 26 24 27 24 C26 19 27 15 28 12 Z" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/>
      </g>`;
    case 'waves':
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#121521" stroke="${accent}" stroke-width="2"/>
        <circle cx="28" cy="28" r="4.5" fill="${accent}"/>
        <path d="M19 21 A12 12 0 0 0 19 35 M37 21 A12 12 0 0 1 37 35 M13 15 A20 20 0 0 0 13 41 M43 15 A20 20 0 0 1 43 41" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
      </g>`;
    case 'camera':
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#121521" stroke="${accent}" stroke-width="2"/>
        <rect x="13" y="18" width="22" height="20" rx="4" fill="none" stroke="${accent}" stroke-width="2.2"/>
        <polygon points="36,24 44,19 44,37 36,32" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/>
      </g>`;
    case 'shield':
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#121521" stroke="${accent}" stroke-width="2"/>
        <path d="M28 12 L42 18 V29 C42 37 36 43 28 46 C20 43 14 37 14 29 V18 Z" fill="none" stroke="${accent}" stroke-width="2.2"/>
        <path d="M28 20 V36 M22 27 H34" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
      </g>`;
    default:
      return `<g transform="translate(88, 92)">
        <rect x="0" y="0" width="56" height="56" rx="14" fill="#121521" stroke="${accent}" stroke-width="2"/>
        <path d="M14 19 C20 17 25 18 28 21 C31 18 36 17 42 19 V39 C36 37 31 38 28 41 C25 38 20 37 14 39 Z" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M28 21 V41" stroke="${accent}" stroke-width="2"/>
      </g>`;
  }
}

function getTargetRelativePath(item = {}) {
  const title = String(item.title || 'Christian Culture');
  const url = String(item.url || '');
  const urlLeaf = url ? url.split('/').filter(Boolean).pop() : '';
  const slug = slugify(urlLeaf || title);
  const hash8 = hashHex8(`${TEMPLATE_VERSION}|${url}|${title}|${item.category || ''}`);
  return `images/social/generated/topic-${slug}-${hash8}.jpg`;
}

function syncTopicMirrors(outPath, relPath, rootDir = DEFAULT_ROOT) {
  if (!fs.existsSync(outPath)) return;
  for (const base of [path.join(rootDir, '.pages-release'), LUMINA_MIRROR_ROOT]) {
    try {
      if (fs.existsSync(base)) {
        const dest = path.join(base, relPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(outPath, dest);
      }
    } catch (_) {}
  }
}

function registerViralGraphic(rootDir, entry) {
  const regPath = path.join(rootDir, 'data', 'viral_graphics_registry.json');
  try {
    let reg = { version: '2.1', items: [] };
    if (fs.existsSync(regPath)) {
      const parsed = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      if (parsed && Array.isArray(parsed.items)) reg = parsed;
    }
    if (reg.items.some((x) => x.id === entry.id)) return;
    reg.items.unshift(entry);
    if (reg.items.length > 200) reg.items = reg.items.slice(0, 200);
    fs.mkdirSync(path.dirname(regPath), { recursive: true });
    fs.writeFileSync(regPath, JSON.stringify(reg, null, 2), 'utf8');
  } catch (_) {}
}

/**
 * Generuje czystą kartę 1280x720 HD JPG dla dowolnego tematu / modułu / lekcji EkoCC.
 */
export async function generateSocialTopicGraphic(item = {}, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const force = Boolean(options.force);
  const relPath = getTargetRelativePath(item);
  const outPath = path.join(rootDir, relPath);

  if (!force && fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
    syncTopicMirrors(outPath, relPath, rootDir);
    return {
      ok: true,
      cached: true,
      outPath,
      relPath,
      publicUrl: `https://polskieradio.cc/${relPath}`
    };
  }

  const profile = selectTopicProfile(item);
  const cleanTitle = String(item.title || 'Christian Culture')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanLead = String(item.lead || item.description || item.summary || '')
    .replace(/\s+/g, ' ')
    .trim();

  let titleFontSize = 48;
  let titleLineHeight = 62;
  let maxTitleChars = 32;
  if (cleanTitle.length > 90) {
    titleFontSize = 36;
    titleLineHeight = 48;
    maxTitleChars = 44;
  } else if (cleanTitle.length > 58) {
    titleFontSize = 42;
    titleLineHeight = 54;
    maxTitleChars = 38;
  }

  const titleLines = wrapTextLines(cleanTitle, maxTitleChars, 4);
  const titleStartY = 232;
  const titleLastY = titleStartY + (titleLines.length - 1) * titleLineHeight;

  const leadMaxLines = titleLines.length >= 4 ? 1 : 2;
  const leadLines = cleanLead && cleanLead.toLowerCase() !== cleanTitle.toLowerCase()
    ? wrapTextLines(cleanLead, 62, leadMaxLines)
    : [];
  const leadStartY = Math.min(titleLastY + 58, 520);

  const titleSvg = titleLines
    .map((line, i) => {
      const y = titleStartY + i * titleLineHeight;
      return `<text x="88" y="${y}" font-family="Arial, 'Segoe UI', Helvetica, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#FFFFFF">${escapeXml(line)}</text>`;
    })
    .join('\n    ');

  const leadSvg = leadLines
    .map((line, i) => {
      const y = leadStartY + i * 34;
      return `<text x="88" y="${y}" font-family="Arial, 'Segoe UI', Helvetica, sans-serif" font-size="23" font-weight="normal" fill="#CBD5E1">${escapeXml(line)}</text>`;
    })
    .join('\n    ');

  const svg = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${profile.bgTop}"/>
        <stop offset="100%" stop-color="${profile.bgBottom}"/>
      </linearGradient>
      <radialGradient id="accentHalo" cx="84%" cy="20%" r="55%">
        <stop offset="0%" stop-color="${profile.accent}" stop-opacity="0.18"/>
        <stop offset="65%" stop-color="${profile.accent}" stop-opacity="0.03"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="accentRule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${profile.accent}" stop-opacity="0.95"/>
        <stop offset="75%" stop-color="${profile.accent}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${profile.accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Czyste tło (maks. 3 kolory) -->
    <rect x="0" y="0" width="1280" height="720" fill="url(#cardBg)"/>
    <rect x="0" y="0" width="1280" height="720" fill="url(#accentHalo)"/>

    <!-- Cienka subtelna ramka zewnętrzna -->
    <rect x="32" y="28" width="1216" height="664" rx="20" fill="none" stroke="${profile.accent}" stroke-width="1.8" stroke-opacity="0.48"/>
    <rect x="88" y="34" width="180" height="5" rx="2.5" fill="${profile.accent}"/>

    <!-- Ikona tematyczna i górna etykieta marki -->
    ${renderTopicIconSvg(profile.icon, profile.accent)}
    <text x="164" y="127" font-family="Arial, 'Segoe UI', Helvetica, sans-serif" font-size="18" font-weight="bold" fill="${profile.accent}" letter-spacing="2.2">${escapeXml(profile.badge)}</text>
    <line x1="88" y1="168" x2="1192" y2="168" stroke="url(#accentRule)" stroke-width="1.5"/>

    <!-- Główny tytuł tematyczny -->
    ${titleSvg}

    <!-- Dodatkowy opis tematyczny -->
    ${leadSvg}

    <!-- Stopka marki -->
    <line x1="88" y1="612" x2="1192" y2="612" stroke="url(#accentRule)" stroke-width="1.2"/>
    <text x="88" y="652" font-family="Arial, 'Segoe UI', Helvetica, sans-serif" font-size="19" font-weight="bold" fill="#FFFFFF" fill-opacity="0.9" letter-spacing="1.4">${escapeXml(profile.footer)}</text>
  </svg>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92, progressive: true })
    .toFile(outPath);

  syncTopicMirrors(outPath, relPath, rootDir);

  const hash8 = hashHex8(relPath);
  registerViralGraphic(rootDir, {
    id: `social-topic-${slugify(item.url || cleanTitle)}-${hash8}`,
    format: '16:9',
    headline: cleanTitle.slice(0, 80),
    reference: String(item.url || ''),
    motif: profile.badge,
    palette: {
      bg: profile.bgTop,
      text: '#FFFFFF',
      accent: profile.accent
    },
    layout: 'editorial-topic-card',
    emotion: profile.brand === 'sds' ? 'Odkrycie' : 'Prawda',
    file: relPath,
    hash: hash8,
    createdAt: new Date().toISOString()
  });

  return {
    ok: true,
    cached: false,
    outPath,
    relPath,
    publicUrl: `https://polskieradio.cc/${relPath}`
  };
}

/**
 * Synchroniczny generator dla skryptów CommonJS/ESM (np. ccn_auto_broadcaster.mjs, publish_facebook_ccn_news.js).
 */
export function ensureSocialTopicGraphicSync(item = {}, rootDir = DEFAULT_ROOT) {
  const relPath = getTargetRelativePath(item);
  const fullPath = path.join(rootDir, relPath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 15000) {
    syncTopicMirrors(fullPath, relPath, rootDir);
    return fullPath;
  }

  try {
    const payload = Buffer.from(JSON.stringify(item), 'utf8').toString('base64');
    execFileSync(process.execPath, [__filename, `--b64=${payload}`, `--root=${rootDir}`], {
      stdio: 'pipe',
      timeout: 20000
    });
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 15000) {
      return fullPath;
    }
  } catch (err) {
    console.warn('[TOPIC-GRAPHIC-WARN] Błąd generowania grafiki tematycznej:', err.message);
  }

  return fs.existsSync(fullPath) ? fullPath : null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    const b64Arg = process.argv.find((a) => a.startsWith('--b64='));
    const rootArg = process.argv.find((a) => a.startsWith('--root='));
    const force = process.argv.includes('--force');
    const rootDir = rootArg ? rootArg.slice('--root='.length) : DEFAULT_ROOT;

    if (!b64Arg) {
      console.log('Użycie: node scripts/generate-social-topic-graphic.mjs --b64=<base64_json> [--root=<dir>] [--force]');
      process.exit(0);
    }

    const jsonStr = Buffer.from(b64Arg.slice('--b64='.length), 'base64').toString('utf8');
    const item = JSON.parse(jsonStr);
    const res = await generateSocialTopicGraphic(item, { rootDir, force });
    console.log(JSON.stringify(res));
  })().catch((err) => {
    console.error('[BŁĄD] generate-social-topic-graphic:', err);
    process.exit(1);
  });
}
