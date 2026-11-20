#!/usr/bin/env node
/**
 * Generator oficjalnych panoramicznych banerów artykułów CCN NEWS (3:1, 1536x512).
 *
 * Wzorzec: images/brand/ccn-news-templates/ccn-news-article-banner-3x1-template.jpg
 * - Lewa strefa (~58%): tematyczna ilustracja/zdjęcie z płynnym przejściem w prawo
 * - Lewy górny róg: skośna biała wstęga z oficjalnym logo CCN NEWS i czerwoną linią
 * - Prawa strefa (~42%): studyjne tło z siatką punktów, granatowy nagłówek (#0F1B33),
 *   skośna czerwona wstęga wyróżnienia (#9E0B1C), dolny akcent między liniami (— ... —)
 *   oraz podwójna czerwona fala w prawym dolnym rogu.
 * - ZAKAZ napisu „Link w komentarzu” na grafikach artykułów WWW.
 *
 * Eksportuje:
 * - generateCcnArticleBanner(options)
 * - splitTitleIntoBroadcastLines(title, options)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const LUMINA_MIRROR_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const BANNER_WIDTH = 1536;
const BANNER_HEIGHT = 512;
const PHOTO_ZONE_WIDTH = 960;

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeBannerText(text = '') {
  return String(text || '')
    .replace(/link w komentarzu/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapIntoLines(words, maxChars) {
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if ((cur + ' ' + w).length <= maxChars) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function splitTitleIntoBroadcastLines(rawTitle = '', options = {}) {
  const cleanTitle = sanitizeBannerText(rawTitle || 'Wiadomości CCN News');
  if (options.topLine && options.highlightLine) {
    return {
      topLine: sanitizeBannerText(options.topLine),
      highlightLine: sanitizeBannerText(options.highlightLine),
      thirdLine: sanitizeBannerText(options.thirdLine || ''),
      accentLine: sanitizeBannerText(options.accentLine || options.kicker || 'CCN NEWS'),
    };
  }

  // Jeśli tytuł zawiera zdanie główne i pytanie po kropce/dwukropku/myślniku, oddziel akcent
  let mainPart = cleanTitle;
  let accentPart = sanitizeBannerText(options.accentLine || options.kicker || '');

  const sentenceBreak = cleanTitle.match(/^(.+?[.!?:])\s+([^.!?:]{6,34}[?!]?)$/);
  if (!accentPart && sentenceBreak && sentenceBreak[1].length >= 16) {
    mainPart = sentenceBreak[1].replace(/[.:]+$/, '').trim();
    accentPart = sentenceBreak[2].trim();
  } else if (!accentPart) {
    accentPart = 'ANALIZA CCN NEWS';
  }

  const words = mainPart.split(/\s+/).filter(Boolean);
  let wrapped = wrapIntoLines(words, 23);
  if (wrapped.length === 1) {
    return {
      topLine: 'CCN NEWS',
      highlightLine: wrapped[0],
      thirdLine: '',
      accentLine: accentPart.slice(0, 32),
    };
  }
  if (wrapped.length === 2) {
    return {
      topLine: wrapped[0],
      highlightLine: wrapped[1],
      thirdLine: '',
      accentLine: accentPart.slice(0, 32),
    };
  }

  // Połącz ogon w 3. linię jeśli linii wyszło więcej niż 3
  if (wrapped.length > 3) {
    wrapped = wrapIntoLines(words, 27);
  }
  const topLine = wrapped[0];
  const highlightLine = wrapped[1];
  const thirdLine = wrapped.slice(2).join(' ').slice(0, 30);

  return {
    topLine,
    highlightLine,
    thirdLine,
    accentLine: accentPart.slice(0, 32),
  };
}

function resolvePhotoPath(sourceImagePath, rootDir) {
  if (!sourceImagePath) return null;
  const cleaned = String(sourceImagePath).replace(/^\/+/, '').split('?')[0];
  const abs = path.isAbsolute(cleaned) ? cleaned : path.join(rootDir, cleaned);
  if (fs.existsSync(abs) && fs.statSync(abs).size > 4000) {
    return abs;
  }
  return null;
}

function buildStudioRightOverlaySvg(layout, width, height) {
  const cx = Math.round(width * 0.775); // ~1190px w 1536px szerokości
  const { topLine, highlightLine, thirdLine, accentLine } = layout;

  const hasThird = Boolean(thirdLine);
  const topFontSize = topLine.length > 22 ? 42 : 48;
  const hiFontSize = highlightLine.length > 24 ? 42 : 48;
  const thirdFontSize = thirdLine.length > 24 ? 40 : 46;
  const accentFontSize = accentLine.length > 26 ? 32 : 36;

  const topY = hasThird ? 140 : 170;
  const ribbonTopY = hasThird ? 168 : 200;
  const ribbonHeight = 76;
  const ribbonTextY = ribbonTopY + 54;
  const thirdY = ribbonTopY + ribbonHeight + 56;
  const accentY = hasThird ? thirdY + 62 : ribbonTopY + ribbonHeight + 76;

  // Szerokość wstęgi pod napis wyróżnienia
  const approxRibbonW = Math.min(590, Math.max(320, highlightLine.length * (hiFontSize * 0.56) + 70));
  const rxLeft = Math.round(cx - approxRibbonW / 2);
  const rxRight = Math.round(cx + approxRibbonW / 2);
  const slant = 16;

  const ribbonPolygon = `${rxLeft + slant},${ribbonTopY} ${rxRight + slant},${ribbonTopY} ${rxRight - slant},${ribbonTopY + ribbonHeight} ${rxLeft - slant},${ribbonTopY + ribbonHeight}`;

  const accentHalf = Math.min(285, Math.max(120, accentLine.length * (accentFontSize * 0.28) + 22));
  const lineGap = 16;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="studioFade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="46%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="61%" stop-color="#F7F8FA" stop-opacity="0.96"/>
        <stop offset="67%" stop-color="#F4F6F9" stop-opacity="1"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1"/>
      </linearGradient>
      <pattern id="dotMatrix" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.2" fill="#94A3B8" fill-opacity="0.22"/>
      </pattern>
      <linearGradient id="crimsonBand" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8B0B1B"/>
        <stop offset="50%" stop-color="#AD1124"/>
        <stop offset="100%" stop-color="#7D0917"/>
      </linearGradient>
    </defs>

    <!-- Przejście z fotografii na studyjne tło redakcyjne -->
    <rect width="${width}" height="${height}" fill="url(#studioFade)"/>

    <!-- Subtelna siatka punktów nad prawym panelem -->
    <rect x="${Math.round(width * 0.57)}" y="0" width="${Math.round(width * 0.43)}" height="${Math.round(height * 0.65)}" fill="url(#dotMatrix)"/>

    <!-- Lewy górny skośny narożnik na logo CCN NEWS -->
    <polygon points="0,152 222,132 204,174 0,192" fill="#9E0B1C" fill-opacity="0.95"/>
    <polygon points="0,0 264,0 214,162 0,174" fill="#FFFFFF"/>

    <!-- Podwójna czerwona fala broadcast w prawym dolnym rogu -->
    <path d="M ${Math.round(width * 0.63)},${height} Q ${Math.round(width * 0.84)},${height - 26} ${width},${height - 150} L ${width},${height} Z" fill="#8C0D1C"/>
    <path d="M ${Math.round(width * 0.67)},${height} Q ${Math.round(width * 0.86)},${height - 16} ${width},${height - 118} L ${width},${height - 134} Q ${Math.round(width * 0.85)},${height - 32} ${Math.round(width * 0.65)},${height} Z" fill="#DC1E32"/>

    <!-- Górna linia nagłówka -->
    <text x="${cx}" y="${topY}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="${topFontSize}" font-weight="900" font-style="italic" fill="#0F1B33">${escapeXml(topLine)}</text>

    <!-- Skośna czerwona wstęga z wyróżnioną frazą -->
    <polygon points="${ribbonPolygon}" fill="url(#crimsonBand)"/>
    <text x="${cx}" y="${ribbonTextY}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="${hiFontSize}" font-weight="900" font-style="italic" fill="#FFFFFF">${escapeXml(highlightLine)}</text>

    ${hasThird ? `<text x="${cx}" y="${thirdY}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="${thirdFontSize}" font-weight="900" font-style="italic" fill="#0F1B33">${escapeXml(thirdLine)}</text>` : ''}

    <!-- Dolny akcent pomiędzy cienkimi liniami -->
    <line x1="${Math.max(Math.round(width * 0.59), cx - 295)}" y1="${accentY - 11}" x2="${cx - accentHalf - lineGap}" y2="${accentY - 11}" stroke="#9E0B1C" stroke-width="2.5" stroke-opacity="0.72"/>
    <text x="${cx}" y="${accentY}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="${accentFontSize}" font-weight="800" font-style="italic" fill="#9E0B1C">${escapeXml(accentLine)}</text>
    <line x1="${cx + accentHalf + lineGap}" y1="${accentY - 11}" x2="${width - 28}" y2="${accentY - 11}" stroke="#9E0B1C" stroke-width="2.5" stroke-opacity="0.72"/>
  </svg>`;
}

export async function generateCcnArticleBanner(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const width = Number(options.width) || BANNER_WIDTH;
  const height = Number(options.height) || BANNER_HEIGHT;
  const outputRel = options.outputRel || `images/news/art-${Date.now()}.jpg`;
  const outPath = path.isAbsolute(options.outputPath || '')
    ? options.outputPath
    : path.join(rootDir, outputRel);

  const photoAbs = resolvePhotoPath(options.sourceImagePath, rootDir);
  let leftPhotoBuf;
  if (photoAbs) {
    leftPhotoBuf = await sharp(photoAbs)
      .resize(Math.round(width * 0.64), height, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 93 })
      .toBuffer();
  } else {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width * 0.64)}" height="${height}">
      <defs>
        <linearGradient id="fbPhoto" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="60%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#450A0A"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#fbPhoto)"/>
    </svg>`;
    leftPhotoBuf = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
  }

  const layout = splitTitleIntoBroadcastLines(options.title, options);
  const overlaySvg = buildStudioRightOverlaySvg(layout, width, height);

  const composites = [
    { input: leftPhotoBuf, top: 0, left: 0 },
    { input: Buffer.from(overlaySvg), top: 0, left: 0 },
  ];

  const logoPath = path.join(rootDir, 'images/brand/ccn-news-templates/ccn-news-logo-square.jpg');
  if (fs.existsSync(logoPath)) {
    const logoSize = Math.round(height * 0.255); // ~130x130 w 512px wysokości
    const logoBuf = await sharp(logoPath).resize(logoSize, logoSize, { fit: 'contain' }).png().toBuffer();
    composites.push({ input: logoBuf, top: 14, left: 26 });
  }

  const baseCanvasSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#FFFFFF"/></svg>`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(baseCanvasSvg))
    .composite(composites)
    .jpeg({ quality: 93, progressive: true })
    .toFile(outPath);

  if (!options.skipMirror && !path.isAbsolute(options.outputPath || '')) {
    const mirrorTargets = [path.join(LUMINA_MIRROR_ROOT, outputRel)];
    const pagesDir = path.join(rootDir, '.pages-release');
    if (fs.existsSync(pagesDir)) {
      mirrorTargets.push(path.join(pagesDir, outputRel));
    }
    for (const dst of mirrorTargets) {
      try {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(outPath, dst);
      } catch {
        // non-fatal mirror copy
      }
    }
  }

  return {
    ok: true,
    width,
    height,
    outPath,
    outputRel,
    layout,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    const b64Arg = process.argv.find((a) => a.startsWith('--b64='));
    if (!b64Arg) {
      console.log('Użycie: node scripts/generate-ccn-article-banner.mjs --b64=<base64_json>');
      process.exit(0);
    }
    const opts = JSON.parse(Buffer.from(b64Arg.slice('--b64='.length), 'base64').toString('utf8'));
    const res = await generateCcnArticleBanner(opts);
    console.log(JSON.stringify(res));
  })().catch((err) => {
    console.error('[BŁĄD] generate-ccn-article-banner:', err);
    process.exit(1);
  });
}
