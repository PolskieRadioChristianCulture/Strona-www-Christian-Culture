import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapWords(text, maxCharsPerLine, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const head = lines.slice(0, maxLines - 1);
    const tail = lines.slice(maxLines - 1).join(' ');
    return [...head, tail.slice(0, maxCharsPerLine + 2).trim()];
  }
  return lines;
}

export function loadSeriesTemplate(seriesType, repoRoot = DEFAULT_REPO_ROOT) {
  const tplPath = path.join(repoRoot, 'patronite', 'templates', seriesType, 'template.json');
  if (!fs.existsSync(tplPath)) {
    throw new Error(`Nieznany szablon graficzny serii: ${seriesType}`);
  }
  return JSON.parse(fs.readFileSync(tplPath, 'utf8'));
}

export async function renderPatroniteGraphic({
  repoRoot = DEFAULT_REPO_ROOT,
  seriesType,
  headline,
  accentHeadline = '',
  subtitle,
  photoRelPath,
  closingSlogan,
  outputPath,
  format = 'landscape', // 'landscape' (1068x630) | 'square' (1080x1080)
  channel = 'patronite', // 'patronite' | 'zrzutka'
}) {
  const tpl = loadSeriesTemplate(seriesType, repoRoot);
  const isSquare = format === 'square';
  const isZrzutka = channel === 'zrzutka';
  const W = isSquare ? 1080 : 1068;
  const H = isSquare ? 1080 : 630;
  const { navy, accent, white } = tpl.palette;

  const chosenRelPhoto = photoRelPath && tpl.approvedPhotos.includes(photoRelPath)
    ? photoRelPath
    : tpl.defaultPhoto;
  const photoAbsPath = path.resolve(repoRoot, chosenRelPhoto);
  if (!fs.existsSync(photoAbsPath)) {
    throw new Error(`Brak zatwierdzonej fotografii tla: ${chosenRelPhoto}`);
  }

  const lockupPath = path.join(
    repoRoot,
    'patronite',
    'templates',
    'assets',
    isZrzutka ? 'brand-header-lockup-zrzutka.png' : 'brand-header-lockup.png',
  );
  const lockupMetaPath = path.join(
    repoRoot,
    'patronite',
    'templates',
    'assets',
    isZrzutka ? 'brand-lockup-zrzutka-meta.json' : 'brand-lockup-meta.json',
  );
  if (!fs.existsSync(lockupPath) || !fs.existsSync(lockupMetaPath)) {
    throw new Error(
      isZrzutka
        ? 'Brak oficjalnego lockupu CHRISTIAN CULTURE | ZRZUTKA.PL.'
        : 'Brak oficjalnego lockupu CHRISTIAN CULTURE | PATRONITE.',
    );
  }
  const lockupExpected = JSON.parse(fs.readFileSync(lockupMetaPath, 'utf8'));
  const targetLogoHeight = isSquare ? 72 : 56;
  const targetLogoWidth = Math.round(targetLogoHeight * lockupExpected.aspectRatio);
  const logoBuffer = await sharp(lockupPath)
    .resize(targetLogoWidth, targetLogoHeight, { fit: 'fill' })
    .png()
    .toBuffer();

  // Base background photo scaled cleanly to target dimensions
  const baseBuffer = await sharp(photoAbsPath)
    .resize(W, H, { fit: 'cover', position: isSquare ? 'center' : 'attention' })
    .toBuffer();

  // Headline layout inside strict safe zone
  const safe = isSquare ? tpl.safeZoneSquare : tpl.safeZoneLandscape;
  const mainLines = wrapWords(String(headline || '').toUpperCase(), isSquare ? 20 : 16, 2);
  const accentLine = String(accentHeadline || '').trim().toUpperCase();
  const allHeadlineLines = accentLine ? [...mainLines, { text: accentLine, accent: true }] : mainLines.map((t, i) => ({
    text: t,
    accent: i === mainLines.length - 1,
  }));
  const normalizedLines = allHeadlineLines.map(item => (typeof item === 'string' ? { text: item, accent: false } : item));
  const subtitleLines = wrapWords(String(subtitle || ''), isSquare ? 42 : 38, 2);

  const badgeX = safe.x;
  const badgeY = safe.y + (isSquare ? 18 : 6);
  const badgeText = String(tpl.seriesLabel || 'DZIENNIK MISJI').toUpperCase();
  const badgeFontSize = isSquare ? 22 : 19;
  const badgeWidth = Math.min(safe.maxWidth, Math.round(badgeText.length * badgeFontSize * 0.66 + 44));
  const badgeHeight = isSquare ? 44 : 38;

  const fontSizeMain = isSquare ? 68 : 50;
  const lineHeight = isSquare ? 76 : 56;
  const headlineStartY = badgeY + badgeHeight + (isSquare ? 68 : 54);
  const accentRowIndex = normalizedLines.findIndex(l => l.accent);
  const lastHeadlineY = headlineStartY + (normalizedLines.length - 1) * lineHeight;
  const swooshY = lastHeadlineY + (isSquare ? 22 : 16);
  const subtitleStartY = swooshY + (isSquare ? 42 : 34);
  const subtitleFontSize = isSquare ? 29 : 22;
  const subtitleLineHeight = isSquare ? 37 : 28;
  const renderedMaxBottomY = subtitleStartY + (subtitleLines.length - 1) * subtitleLineHeight + 10;

  if (renderedMaxBottomY > safe.maxBottomY) {
    throw new Error(`Tekst przekroczyl dolna granice bezpiecznej strefy (${renderedMaxBottomY} > ${safe.maxBottomY}).`);
  }

  // Wave geometry (matches approved "DOBRO, KTORE TWORZYMY RAZEM" template)
  const topCurvePath = isSquare
    ? `M0,0 L${W},0 L${W},122 Q780,148 520,132 Q250,116 0,142 Z`
    : `M0,0 L${W},0 L${W},84 Q780,104 510,94 Q240,84 0,100 Z`;
  const topAccentStroke = isSquare
    ? `M0,142 Q250,116 520,132 Q780,148 ${W},122`
    : `M0,100 Q240,84 510,94 Q780,104 ${W},84`;

  const botWaveTop = isSquare ? 934 : 526;
  const botWavePath = isSquare
    ? `M0,${botWaveTop + 18} Q280,${botWaveTop - 8} 560,${botWaveTop + 12} Q830,${botWaveTop + 28} ${W},${botWaveTop - 6} L${W},${H} L0,${H} Z`
    : `M0,${botWaveTop + 14} Q290,${botWaveTop - 8} 560,${botWaveTop + 8} Q820,${botWaveTop + 22} ${W},${botWaveTop - 6} L${W},${H} L0,${H} Z`;
  const botAccentStroke = isSquare
    ? `M0,${botWaveTop + 18} Q280,${botWaveTop - 8} 560,${botWaveTop + 12} Q830,${botWaveTop + 28} ${W},${botWaveTop - 6}`
    : `M0,${botWaveTop + 14} Q290,${botWaveTop - 8} 560,${botWaveTop + 8} Q820,${botWaveTop + 22} ${W},${botWaveTop - 6}`;

  const footerText = String(closingSlogan || tpl.closingSlogan).toUpperCase();
  const footerFontSize = isSquare ? 26 : 22;
  const footerUrlSize = isSquare ? 31 : 25;
  const footerY = isSquare ? 1020 : 592;
  const globeX = isSquare ? 68 : 66;
  const globeY = footerY - (isSquare ? 10 : 8);
  const dividerX = isSquare ? 444 : 422;
  const sloganX = isSquare ? 482 : 458;

  const swooshWidth = accentRowIndex >= 0
    ? Math.min(safe.maxWidth - 20, Math.max(180, Math.round(normalizedLines[accentRowIndex].text.length * fontSizeMain * 0.56)))
    : 240;

  const sloganWidthApprox = Math.min(W - sloganX - 50, Math.round(footerText.length * footerFontSize * 0.54));

  const overlaySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="scrimGrad" x1="0%" y1="45%" x2="92%" y2="45%">
      <stop offset="0%" stop-color="${navy}" stop-opacity="0.93"/>
      <stop offset="48%" stop-color="${navy}" stop-opacity="0.78"/>
      <stop offset="78%" stop-color="${navy}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0.14"/>
    </linearGradient>
    <linearGradient id="bottomVignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="55%" stop-color="${navy}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0.48"/>
    </linearGradient>
  </defs>

  <!-- Kierunkowy podklad czytelności w strefie lewej i centralnej -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#scrimGrad)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bottomVignette)"/>

  <!-- GORA: Biala wstega na oficjalne logo -->
  <path d="${topCurvePath}" fill="${white}"/>
  <path d="${topAccentStroke}" fill="none" stroke="${accent}" stroke-width="${isSquare ? 7 : 5.5}"/>

  <!-- SRODEK: Kapsułka serii + Naglowek + Swoosh + Podtytul -->
  <rect x="${badgeX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="${accent}"/>
  <text x="${badgeX + badgeWidth / 2}" y="${badgeY + Math.round(badgeHeight * 0.68)}" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif" font-size="${badgeFontSize}" font-weight="800" letter-spacing="1.2" fill="${white}">
    ${escapeXml(badgeText)}
  </text>

  ${normalizedLines.map((line, idx) => `
  <text x="${safe.x}" y="${headlineStartY + idx * lineHeight}"
        font-family="Segoe UI, Arial, sans-serif" font-size="${fontSizeMain}" font-weight="900" letter-spacing="-0.6"
        fill="${line.accent ? accent : white}">${escapeXml(line.text)}</text>`).join('')}

  <path d="M${safe.x + 2},${swooshY} Q${safe.x + Math.round(swooshWidth * 0.45)},${swooshY - 9} ${safe.x + swooshWidth},${swooshY + 3}"
        fill="none" stroke="${accent}" stroke-width="${isSquare ? 5 : 4}" stroke-linecap="round"/>

  ${subtitleLines.map((line, idx) => `
  <text x="${safe.x}" y="${subtitleStartY + idx * subtitleLineHeight}"
        font-family="Segoe UI, Arial, sans-serif" font-size="${subtitleFontSize}" font-weight="600" font-style="italic"
        fill="${white}" fill-opacity="0.96">${escapeXml(line)}</text>`).join('')}

  <!-- DOL: Granatowa wstega z adresem polskieradio.cc i zamknieciem serii -->
  <path d="${botWavePath}" fill="${navy}"/>
  <path d="${botAccentStroke}" fill="none" stroke="${accent}" stroke-width="${isSquare ? 7 : 5.5}"/>

  <!-- Ikona globu (SVG vector) -->
  <g transform="translate(${globeX}, ${globeY - 14})" stroke="${white}" stroke-width="2" fill="none">
    <circle cx="15" cy="15" r="14"/>
    <ellipse cx="15" cy="15" rx="6.5" ry="14"/>
    <line x1="1" y1="15" x2="29" y2="15"/>
    <path d="M4.5,8 Q15,11 25.5,8"/>
    <path d="M4.5,22 Q15,19 25.5,22"/>
  </g>
  <text x="${globeX + 42}" y="${footerY}" font-family="Segoe UI, Arial, sans-serif" font-size="${footerUrlSize}" font-weight="600" fill="${white}">
    ${escapeXml(tpl.footerUrl)}
  </text>

  <line x1="${dividerX}" y1="${footerY - 26}" x2="${dividerX}" y2="${footerY + 12}" stroke="${accent}" stroke-width="2.5"/>

  <text x="${sloganX}" y="${footerY - 2}" font-family="Segoe UI, Arial, sans-serif" font-size="${footerFontSize}" font-weight="800" font-style="italic" letter-spacing="0.4" fill="${white}">
    ${escapeXml(footerText)}
  </text>
  <path d="M${sloganX + 20},${footerY + 10} Q${sloganX + Math.round(sloganWidthApprox * 0.6)},${footerY + 4} ${sloganX + sloganWidthApprox},${footerY + 14}"
        fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
</svg>`.trim();

  const logoTop = isSquare ? 28 : 16;
  const logoLeft = Math.round((W - targetLogoWidth) / 2);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(baseBuffer)
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: logoBuffer, top: logoTop, left: logoLeft },
    ])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);

  const outMeta = await sharp(outputPath).metadata();
  const stat = fs.statSync(outputPath);

  return {
    outputPath,
    channel: isZrzutka ? 'zrzutka' : 'patronite',
    format,
    seriesType,
    width: outMeta.width,
    height: outMeta.height,
    channels: outMeta.channels,
    fileSizeBytes: stat.size,
    photoRelPath: chosenRelPhoto,
    logoExpectedAspectRatio: lockupExpected.aspectRatio,
    logoRenderedAspectRatio: Number((targetLogoWidth / targetLogoHeight).toFixed(4)),
    headlineLines: normalizedLines.map(l => l.text),
    subtitleLines,
    safeZoneBounds: { ...safe, renderedMaxBottomY },
  };
}
