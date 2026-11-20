#!/usr/bin/env node
/**
 * Generator kwadratowych kart 1:1 (1080x1080) dla strony CCN NEWS na Facebooku.
 *
 * Odtwarza dokładnie oficjalny wzór redakcyjny CCN NEWS:
 * - Górna strefa (1080x635): ilustracja tematyczna z miękkim przejściem u dołu do bieli
 * - Lewy górny róg: oficjalne logo CCN NEWS Christian Culture (ccn-news-logo-square.jpg)
 * - Dolna strefa (#FFFFFF): pogrubiony wyśrodkowany tytuł w kolorze #7A0B24
 * - Cienka bordowa linia pozioma + podpis „Link w komentarzu” (#111111)
 *
 * Eksportuje:
 * - getCcnFbSquareRelativePath(item)
 * - generateCcnFbSquareCard(item, options)
 * - ensureCcnFbSquareCardSync(item, rootDir)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { isImageAdequateForItem } from './generate-social-topic-graphic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const LUMINA_MIRROR_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const CARD_SIZE = 1080;
const PHOTO_HEIGHT = 635;
const BURGUNDY = '#7A0B24';
const CTA_TEXT = 'Link w komentarzu';

function hashHex8(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0).toString(16).padStart(8, '0').slice(0, 8);
}

function slugify(str = '') {
  const map = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
  };
  return (
    String(str)
      .split('')
      .map((ch) => map[ch] || ch)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 110) || 'ccn-news'
  );
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapLines(text, maxCharsPerLine, maxLines = 4) {
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
    const clamped = lines.slice(0, maxLines);
    clamped[maxLines - 1] = clamped[maxLines - 1].replace(/[,.!?;:\-—]+$/, '') + '…';
    return { lines: clamped, truncated: true };
  }
  return { lines, truncated: false };
}

function chooseTitleLayout(rawTitle) {
  const cleanTitle = String(rawTitle || 'CCN News — Christian Culture Network').trim();
  const candidates = [
    { maxChars: 22, fontSize: 54, lineHeight: 66 },
    { maxChars: 25, fontSize: 48, lineHeight: 59 },
    { maxChars: 28, fontSize: 43, lineHeight: 53 },
    { maxChars: 31, fontSize: 39, lineHeight: 48 },
    { maxChars: 34, fontSize: 36, lineHeight: 44 },
  ];

  for (const preset of candidates) {
    const wrapped = wrapLines(cleanTitle, preset.maxChars, 4);
    if (!wrapped.truncated) {
      return { ...preset, lines: wrapped.lines };
    }
  }
  const fallback = candidates[candidates.length - 1];
  return { ...fallback, lines: wrapLines(cleanTitle, fallback.maxChars, 4).lines };
}

function resolveSlugKey(item = {}) {
  if (item.slug) return slugify(item.slug);
  if (item.url) {
    try {
      const p = new URL(item.url, 'https://polskieradio.cc').pathname.replace(/^\/+|\/+$/g, '');
      if (p) return slugify(p.replace(/\//g, '-'));
    } catch {
      // fall through to title/hash
    }
  }
  return `${slugify(item.title || 'ccn')}-${hashHex8(item.title || '')}`;
}

export function getCcnFbSquareRelativePath(item = {}) {
  const slugKey = resolveSlugKey(item);
  return `images/social/ccn-fb/fb-${slugKey}.jpg`;
}

function resolveCandidatePhotoPath(item = {}, rootDir = DEFAULT_ROOT) {
  const rawCandidates = [
    item.sourceImagePath,
    item.imagePath,
    item.imageUrl,
    item.image,
  ].filter(Boolean);

  for (const candidate of rawCandidates) {
    let rel = String(candidate).trim();
    if (/^https?:\/\/(www\.)?polskieradio\.cc\//i.test(rel)) {
      rel = rel.replace(/^https?:\/\/(www\.)?polskieradio\.cc\//i, '');
    } else if (/^https?:\/\//i.test(rel)) {
      continue;
    }
    rel = rel.replace(/^\/+/, '').split('?')[0];
    if (!/\.(jpe?g|png|webp)$/i.test(rel)) continue;

    const abs = path.isAbsolute(rel) ? rel : path.join(rootDir, rel);
    if (!fs.existsSync(abs) || fs.statSync(abs).size < 4000) continue;
    if (!isImageAdequateForItem(rel, item, rootDir)) continue;
    return abs;
  }

  return null;
}

function syncCardToMirrors(outPath, relPath, rootDir = DEFAULT_ROOT) {
  if (!fs.existsSync(outPath)) return;
  const destinations = [path.join(LUMINA_MIRROR_ROOT, relPath)];
  const pagesDir = path.join(rootDir, '.pages-release');
  if (fs.existsSync(pagesDir)) {
    destinations.push(path.join(pagesDir, relPath));
  }
  for (const dst of destinations) {
    try {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(outPath, dst);
    } catch {
      // non-fatal mirror copy
    }
  }
}

async function buildTopPhotoBuffer(sourcePhotoPath, item, rootDir) {
  let baseBuffer;
  if (sourcePhotoPath) {
    baseBuffer = await sharp(sourcePhotoPath)
      .resize(CARD_SIZE, PHOTO_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 92 })
      .toBuffer();
  } else {
    const portalLabel = escapeXml(
      String(item.portalLabel || item.categoryLabel || 'CCN NEWS • CHRISTIAN CULTURE').toUpperCase()
    );
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE}" height="${PHOTO_HEIGHT}" viewBox="0 0 ${CARD_SIZE} ${PHOTO_HEIGHT}">
      <defs>
        <linearGradient id="newsBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="55%" stop-color="#1F2937"/>
          <stop offset="100%" stop-color="#4A0B18"/>
        </linearGradient>
        <pattern id="newsGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${CARD_SIZE}" height="${PHOTO_HEIGHT}" fill="url(#newsBg)"/>
      <rect width="${CARD_SIZE}" height="${PHOTO_HEIGHT}" fill="url(#newsGrid)"/>
      <circle cx="880" cy="180" r="240" fill="#7A0B24" fill-opacity="0.28"/>
      <text x="540" y="340" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="4" fill="#F9FAFB" fill-opacity="0.92">${portalLabel}</text>
      <text x="540" y="396" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="500" letter-spacing="2" fill="#E5E7EB" fill-opacity="0.72">POLSKIERADIO.CC</text>
    </svg>`;
    baseBuffer = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
  }

  // Smooth bottom transition from photo to solid #FFFFFF
  const fadeOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE}" height="${PHOTO_HEIGHT}">
    <defs>
      <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="86%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="${CARD_SIZE}" height="${PHOTO_HEIGHT}" fill="url(#bottomFade)"/>
  </svg>`;

  const overlays = [{ input: Buffer.from(fadeOverlaySvg), top: 0, left: 0 }];

  const logoPath = path.join(rootDir, 'images/brand/ccn-news-templates/ccn-news-logo-square.jpg');
  if (fs.existsSync(logoPath)) {
    const logoTile = await sharp(logoPath)
      .resize(154, 154, { fit: 'cover' })
      .png()
      .toBuffer();

    const shadowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="168" height="168">
      <rect x="4" y="6" width="156" height="156" rx="2" fill="#000000" fill-opacity="0.20"/>
    </svg>`;
    overlays.push({ input: Buffer.from(shadowSvg), top: 34, left: 34 });
    overlays.push({ input: logoTile, top: 36, left: 36 });
  }

  return sharp(baseBuffer).composite(overlays).png().toBuffer();
}

export async function generateCcnFbSquareCard(item = {}, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const force = Boolean(options.force);
  const relPath = getCcnFbSquareRelativePath(item);
  const outPath = path.join(rootDir, relPath);

  if (!force && fs.existsSync(outPath) && fs.statSync(outPath).size > 20000) {
    syncCardToMirrors(outPath, relPath, rootDir);
    return { ok: true, cached: true, outPath, relPath };
  }

  const sourcePhotoPath = resolveCandidatePhotoPath(item, rootDir);
  const topPhotoBuf = await buildTopPhotoBuffer(sourcePhotoPath, item, rootDir);

  const layout = chooseTitleLayout(item.title);
  const totalBlockHeight = (layout.lines.length - 1) * layout.lineHeight;
  const centerY = 808;
  const firstBaseline = Math.round(centerY - totalBlockHeight / 2 + layout.fontSize * 0.34);

  const titleLinesSvg = layout.lines
    .map(
      (line, idx) =>
        `<text x="540" y="${firstBaseline + idx * layout.lineHeight}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="${layout.fontSize}" font-weight="800" fill="${BURGUNDY}">${escapeXml(line)}</text>`
    )
    .join('\n    ');

  const bottomCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE}" height="${CARD_SIZE}" viewBox="0 0 ${CARD_SIZE} ${CARD_SIZE}">
    <rect width="${CARD_SIZE}" height="${CARD_SIZE}" fill="#FFFFFF"/>
    ${titleLinesSvg}
    <rect x="40" y="986" width="1000" height="4" rx="2" fill="${BURGUNDY}"/>
    <text x="540" y="1044" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="600" fill="#111111">${CTA_TEXT}</text>
  </svg>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(bottomCardSvg))
    .composite([{ input: topPhotoBuf, top: 0, left: 0 }])
    .jpeg({ quality: 92, progressive: true })
    .toFile(outPath);

  syncCardToMirrors(outPath, relPath, rootDir);

  return {
    ok: true,
    cached: false,
    outPath,
    relPath,
    usedSourcePhoto: sourcePhotoPath ? path.relative(rootDir, sourcePhotoPath) : null,
  };
}

export function ensureCcnFbSquareCardSync(item = {}, rootDir = DEFAULT_ROOT) {
  const relPath = getCcnFbSquareRelativePath(item);
  const fullPath = path.join(rootDir, relPath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 20000) {
    syncCardToMirrors(fullPath, relPath, rootDir);
    return fullPath;
  }

  try {
    const payload = Buffer.from(JSON.stringify(item), 'utf8').toString('base64');
    execFileSync(process.execPath, [__filename, `--b64=${payload}`, `--root=${rootDir}`], {
      stdio: 'pipe',
      timeout: 25000,
    });
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 20000) {
      return fullPath;
    }
  } catch (err) {
    console.warn('[CCN-FB-CARD-WARN] Błąd generowania karty 1:1:', err.message);
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
      console.log('Użycie: node scripts/generate-ccn-fb-square-card.mjs --b64=<base64_json> [--root=<dir>] [--force]');
      process.exit(0);
    }

    const item = JSON.parse(Buffer.from(b64Arg.slice('--b64='.length), 'base64').toString('utf8'));
    const res = await generateCcnFbSquareCard(item, { rootDir, force });
    console.log(JSON.stringify(res));
  })().catch((err) => {
    console.error('[BŁĄD] generate-ccn-fb-square-card:', err);
    process.exit(1);
  });
}
