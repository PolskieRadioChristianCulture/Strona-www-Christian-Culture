import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const REGISTRY_FILE = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/viral_graphics_registry.json';

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) return { version: '2.1', items: [] };
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
}

function saveRegistry(reg) {
  fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(reg, null, 2), 'utf8');
}

export async function composeViralGraphic({
  id,
  motifPath,
  outputPath,
  format = '16:9',
  headlineLines = [], // [{ text: 'ON', accent: false }, { text: 'DOKOŃCZY', accent: true }, { text: 'TO, CO ZACZĄŁ', accent: false }]
  reference = '',
  brand = 'CHRISTIAN CULTURE',
  palette = { bg: '#0D1117', text: '#F8F5EE', accent: '#FF7A00' },
  layout = 'left-overlay', // 'left-overlay' | 'top-safe' | 'center-minimal'
  emotion = 'Nadzieja',
  motifDesc = ''
}) {
  if (!fs.existsSync(motifPath)) throw new Error(`Brak motywu bazowego: ${motifPath}`);
  const imgBuf = fs.readFileSync(motifPath);
  const ext = path.extname(motifPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
  const dataUri = `data:image/${ext};base64,${imgBuf.toString('base64')}`;

  const dims = format === '9:16'
    ? { width: 1080, height: 1920 }
    : format === '1:1'
      ? { width: 1080, height: 1080 }
      : { width: 1920, height: 1080 };

  const headlineHtml = headlineLines.map(line => {
    const color = line.accent ? palette.accent : palette.text;
    return `<div class="line" style="color:${color}">${line.text}</div>`;
  }).join('');

  const isVertical = format === '9:16';

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${dims.width}px;
    height: ${dims.height}px;
    background: ${palette.bg};
    font-family: 'Montserrat', 'Segoe UI', 'Arial Black', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: ${isVertical
      ? `linear-gradient(180deg, ${palette.bg}F0 0%, ${palette.bg}B8 38%, rgba(0,0,0,0.08) 68%, ${palette.bg}D8 100%)`
      : `linear-gradient(90deg, ${palette.bg}F5 0%, ${palette.bg}D6 42%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.22) 100%)`};
  }
  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: ${isVertical ? 'flex-start' : 'center'};
    padding: ${isVertical ? '160px 84px 260px 84px' : '90px 110px'};
  }
  .brand {
    font-size: ${isVertical ? '26px' : '24px'};
    font-weight: 800;
    letter-spacing: 0.22em;
    color: ${palette.text};
    opacity: 0.85;
    margin-bottom: ${isVertical ? '42px' : '32px'};
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-dot {
    width: ${isVertical ? '12px' : '11px'};
    height: ${isVertical ? '12px' : '11px'};
    border-radius: 50%;
    background: ${palette.accent};
    display: inline-block;
  }
  .headline {
    max-width: ${isVertical ? '100%' : '56%'};
    display: flex;
    flex-direction: column;
    gap: ${isVertical ? '10px' : '6px'};
  }
  .line {
    font-size: ${isVertical ? '104px' : '102px'};
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    text-shadow: 0 10px 32px rgba(0,0,0,0.65);
  }
  .ref-pill {
    margin-top: ${isVertical ? '46px' : '38px'};
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    padding: ${isVertical ? '14px 32px' : '12px 28px'};
    border-left: 6px solid ${palette.accent};
    background: rgba(0, 0, 0, 0.45);
    color: ${palette.text};
    font-size: ${isVertical ? '32px' : '28px'};
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <img class="bg-img" src="${dataUri}" alt="" />
  <div class="scrim"></div>
  <div class="content">
    <div class="brand"><span class="brand-dot"></span>${brand}</div>
    <div class="headline">${headlineHtml}</div>
    ${reference ? `<div class="ref-pill">${reference}</div>` : ''}
  </div>
</body>
</html>`;

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: dims, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await page.screenshot({ path: outputPath, type: outputPath.endsWith('.png') ? 'png' : 'jpeg', quality: outputPath.endsWith('.png') ? undefined : 94 });
  } finally {
    await browser.close();
  }

  const outHash = crypto.createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex').slice(0, 16);
  const reg = loadRegistry();
  reg.items.unshift({
    id,
    format,
    headline: headlineLines.map(l => l.text).join(' '),
    reference,
    motif: motifDesc,
    palette,
    layout,
    emotion,
    file: outputPath,
    hash: outHash,
    createdAt: new Date().toISOString()
  });
  if (reg.items.length > 200) reg.items = reg.items.slice(0, 200);
  saveRegistry(reg);
  return outputPath;
}

export async function composeCCWomenCard({
  id,
  motifPath,
  outputPath,
  verseText = 'PAN dokona wszystkiego za mnie. PANIE, twoje miłosierdzie trwa na wieki; nie opuszczaj dzieł twoich rąk.',
  reference = 'Psalm 138:8 (UBG)',
  tagline = 'Dla kobiet takich jak Ty'
}) {
  if (!fs.existsSync(motifPath)) throw new Error(`Brak motywu bazowego: ${motifPath}`);
  const imgBuf = fs.readFileSync(motifPath);
  const ext = path.extname(motifPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
  const dataUri = `data:image/${ext};base64,${imgBuf.toString('base64')}`;

  const dims = { width: 1080, height: 1080 };
  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: #0A040E;
    font-family: 'Montserrat', 'Segoe UI', sans-serif;
    overflow: hidden;
    position: relative;
    color: #FFFFFF;
  }
  .bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: left center;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(10,4,14,0.08) 0%, rgba(18,5,28,0.65) 42%, rgba(14,4,22,0.96) 56%, #0D0314 100%),
                linear-gradient(180deg, rgba(160,20,120,0.18) 0%, transparent 25%, transparent 80%, rgba(160,20,120,0.28) 100%);
  }
  .right-col {
    position: relative;
    z-index: 2;
    margin-left: 470px;
    width: 550px;
    height: 920px;
    padding-top: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .logo-title {
    font-size: 62px;
    font-weight: 900;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #FF4FA3 0%, #C2185B 55%, #8E24AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  }
  .logo-sub {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.34em;
    color: #FFFFFF;
    opacity: 0.85;
    margin-top: 8px;
    margin-bottom: 36px;
  }
  .header {
    font-size: 66px;
    font-weight: 800;
    line-height: 1.05;
    margin-bottom: 18px;
  }
  .header span { color: #FF4FA3; }
  .divider {
    width: 340px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #E91E8C, transparent);
    margin-bottom: 32px;
  }
  .quote-mark {
    font-size: 56px;
    color: #FF4FA3;
    line-height: 0.6;
    font-family: Georgia, serif;
  }
  .verse {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 37px;
    line-height: 1.38;
    color: #F8F5EE;
    margin: 18px 0 22px 0;
  }
  .ref-pill {
    margin-top: 12px;
    padding: 10px 32px;
    border: 2px solid #E91E8C;
    border-radius: 999px;
    font-size: 24px;
    font-weight: 600;
    color: #F8F5EE;
    background: rgba(142, 36, 170, 0.22);
  }
  .tagline {
    margin-top: auto;
    margin-bottom: 18px;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 32px;
    color: #FFFFFF;
    opacity: 0.92;
  }
  .bottom-bar {
    position: absolute;
    bottom: 42px;
    left: 60px;
    right: 60px;
    z-index: 3;
    height: 76px;
    border-radius: 999px;
    background: linear-gradient(90deg, #9C176B 0%, #D81B60 50%, #8E24AA 100%);
    border: 2px solid rgba(255,255,255,0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: #FFFFFF;
    box-shadow: 0 12px 34px rgba(216, 27, 96, 0.45);
  }
</style>
</head>
<body>
  <img class="bg-img" src="${dataUri}" alt="" />
  <div class="scrim"></div>
  <div class="right-col">
    <div class="logo-title">CC Women</div>
    <div class="logo-sub">CHRISTIAN CULTURE</div>
    <div class="header">Werset <span>Dnia</span></div>
    <div class="divider"></div>
    <div class="quote-mark">“</div>
    <div class="verse">${verseText}</div>
    <div class="quote-mark">”</div>
    <div class="ref-pill">${reference}</div>
    <div class="tagline">${tagline} ♥</div>
  </div>
  <div class="bottom-bar">polskieradio.cc/ccwomen</div>
</body>
</html>`;

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: dims, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await page.screenshot({ path: outputPath, type: outputPath.endsWith('.png') ? 'png' : 'jpeg', quality: outputPath.endsWith('.png') ? undefined : 94 });
  } finally {
    await browser.close();
  }

  const outHash = crypto.createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex').slice(0, 16);
  const reg = loadRegistry();
  reg.items.unshift({
    id,
    format: '1:1',
    headline: 'Werset Dnia — ' + reference,
    reference,
    motif: 'Portret CC Women',
    palette: { bg: '#0A040E', text: '#FFFFFF', accent: '#E91E8C' },
    layout: 'cc-women-social-1x1',
    emotion: 'Nadzieja',
    file: outputPath,
    hash: outHash,
    createdAt: new Date().toISOString()
  });
  if (reg.items.length > 200) reg.items = reg.items.slice(0, 200);
  saveRegistry(reg);
  return outputPath;
}
