/**
 * ============================================================================
 * WIADOMOŚĆ Z NIEBA — AUTOMATYCZNY GENERATOR KARTY 1:1 (1080×1080 JPG)
 * Odwzorowuje 1:1 oficjalny projekt z /wiadomosc-z-nieba/wiadomosc.js
 * na szablonie L0 (/images/wiadomosc-z-nieba/szablon-1x1.jpg) z wersetem UBG-2025.
 *
 * Użycie:
 *   node scripts/generate_wiadomosc_z_nieba_card.mjs              (dzisiejsza data)
 *   node scripts/generate_wiadomosc_z_nieba_card.mjs --date 2026-11-26
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DATA_PATH = path.join(ROOT, 'wiadomosc-z-nieba', 'data.json');
const TEMPLATE_PATH = path.join(ROOT, 'images', 'wiadomosc-z-nieba', 'szablon-1x1.jpg');
const OUT_DIR = path.join(ROOT, 'images', 'social', 'yt-community');

function todayWarsaw() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
}

export async function generateWiadomoscZNiebaCard(targetDate = null, { outPath = null } = {}) {
  const ymd = targetDate || todayWarsaw();
  if (!fs.existsSync(DATA_PATH)) throw new Error(`Brak pliku danych: ${DATA_PATH}`);
  if (!fs.existsSync(TEMPLATE_PATH)) throw new Error(`Brak szablonu 1:1: ${TEMPLATE_PATH}`);

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const day = (data.tenDays || []).find((d) => d.runDate === ymd);
  if (!day || !day.verse) {
    throw new Error(`Nie znaleziono wpisu Wiadomość z Nieba dla daty ${ymd} w wiadomosc-z-nieba/data.json`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const finalOut = outPath || path.join(OUT_DIR, `wiadomosc_z_nieba_${ymd}.jpg`);
  const tplBase64 = fs.readFileSync(TEMPLATE_PATH).toString('base64');

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
    await page.setContent(`<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@500;600&display=swap" rel="stylesheet" />
  <style>html,body{margin:0;padding:0;background:#000;overflow:hidden;}</style>
</head>
<body>
  <canvas id="c" width="1080" height="1080"></canvas>
</body>
</html>`, { waitUntil: 'networkidle' });

    const jpgBase64 = await page.evaluate(async ({ tplBase64, verseTextRaw, referencePl }) => {
      await document.fonts.ready;
      await Promise.all([
        document.fonts.load('italic 600 48px "Cormorant Garamond"'),
        document.fonts.load('600 28px "Cinzel"'),
        document.fonts.load('500 20px "Inter"'),
      ]).catch(() => {});

      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = 'data:image/jpeg;base64,' + tplBase64;
      });

      function wrapLines(ctx, text, maxWidth) {
        const words = text.split(/\s+/);
        const lines = [];
        let line = '';
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = w;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        return lines;
      }

      const S = 1080;
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, S, S);

      const x = S * 0.45;
      const w = S * 0.50;
      const top = S * 0.23;
      const bottom = S * 0.83;
      const verseText = `„${verseTextRaw}”`;

      let size = 50;
      let lines = [];
      let lh = 64;
      for (; size >= 26; size -= 2) {
        ctx.font = `italic 600 ${size}px "Cormorant Garamond", Georgia, serif`;
        lines = wrapLines(ctx, verseText, w);
        lh = size * 1.28;
        if (lines.length * lh + 160 <= bottom - top) break;
      }

      const blockH = 60 + lines.length * lh + 30 + 70;
      let y = top + Math.max(0, (bottom - top - blockH) / 2);

      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ff3b3b';
      ctx.font = '600 22px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '5px';
      ctx.fillText('MASZ NOWĄ WIADOMOŚĆ', x, y);
      ctx.letterSpacing = '0px';

      const grad = ctx.createLinearGradient(x, 0, x + 100, 0);
      grad.addColorStop(0, '#ff3b3b');
      grad.addColorStop(1, 'rgba(255,59,59,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y + 40, 100, 4);

      y += 60;
      ctx.font = `italic 600 ${size}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,.8)';
      ctx.shadowBlur = 12;
      for (const l of lines) {
        ctx.fillText(l, x, y);
        y += lh;
      }

      ctx.shadowBlur = 0;
      y += 30;
      ctx.fillStyle = '#d9d9de';
      ctx.font = '600 28px "Cinzel", Georgia, serif';
      ctx.fillText(referencePl, x, y);

      ctx.fillStyle = '#9a9aa3';
      ctx.font = '500 20px "Inter", system-ui, sans-serif';
      ctx.fillText('Biblia UBG-2025', x, y + 40);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
      return dataUrl.split(',')[1];
    }, {
      tplBase64,
      verseTextRaw: day.verse.text,
      referencePl: day.verse.referencePl || day.verse.reference
    });

    fs.writeFileSync(finalOut, Buffer.from(jpgBase64, 'base64'));
    console.log(`✅ Wygenerowano kartę 1:1 Wiadomość z Nieba (${ymd}): ${finalOut}`);
    return {
      ok: true,
      date: ymd,
      path: finalOut,
      reference: day.verse.referencePl || day.verse.reference,
      text: day.verse.text
    };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].includes('generate_wiadomosc_z_nieba_card')) {
  const args = process.argv.slice(2);
  let targetDate = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) targetDate = args[++i];
  }
  generateWiadomoscZNiebaCard(targetDate)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Błąd generowania karty:', err.message);
      process.exit(1);
    });
}
