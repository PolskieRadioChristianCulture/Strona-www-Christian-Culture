#!/usr/bin/env node
/**
 * publish_daily_short_all_channels.mjs
 * =============================================================================
 * Koordynator publikacji 1 Shortsa dziennie (Werset Dnia UBG) na wszystkich kanałach:
 *   1. YouTube Shorts (Playwright Studio Publisher)
 *   2. Facebook Reels / Strony (Radio Christian Culture, App, profil)
 *
 * Wywoływany automatycznie zaraz po emisji odcinka Biblii Audio.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SHORTS_DIR = path.resolve('C:/Users/czark/Desktop/Biblia Audio CC — Gotowe do Emisji/Shorts');
const YT_PUBLISHER = path.join(__dirname, 'publish_to_youtube_playwright.mjs');
const FB_PUBLISHER = path.join(__dirname, 'publish_facebook_short.cjs');

function getLatestShort() {
  if (!fs.existsSync(SHORTS_DIR)) {
    throw new Error(`Katalog Shorts nie istnieje: ${SHORTS_DIR}`);
  }
  const files = fs.readdirSync(SHORTS_DIR).filter(f => f.startsWith('Short_Day_') && f.endsWith('.mp4'));
  if (files.length === 0) {
    throw new Error(`Brak wyrenderowanych plików Short_Day_*.mp4 w ${SHORTS_DIR}`);
  }
  files.sort();
  const latestMp4 = path.join(SHORTS_DIR, files[files.length - 1]);
  const metaTxt = latestMp4.replace('.mp4', '_metadata.txt');
  return { mp4: latestMp4, meta: fs.existsSync(metaTxt) ? metaTxt : null };
}

async function main() {
  const args = process.argv.slice(2);
  let targetMp4 = null;
  let targetMeta = null;
  let dryRun = args.includes('--dry-run');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) targetMp4 = path.resolve(args[i + 1]);
    if (args[i] === '--meta' && args[i + 1]) targetMeta = path.resolve(args[i + 1]);
  }

  if (!targetMp4) {
    const latest = getLatestShort();
    targetMp4 = latest.mp4;
    targetMeta = latest.meta;
  }

  console.log(`==================================================================`);
  console.log(`🚀 [Omnichannel Shorts Publisher] Start publikacji Shortsa Dnia`);
  console.log(`🎬 Plik wideo: ${path.basename(targetMp4)}`);
  console.log(`📝 Metadane: ${targetMeta ? path.basename(targetMeta) : 'BRAK'}`);
  console.log(`==================================================================\n`);

  if (dryRun) {
    console.log(`[DRY-RUN] Tryb testowy. Pomiędzy wykonaniem publikacji.`);
    process.exit(0);
  }

  // 1. Publikacja Facebook
  if (fs.existsSync(FB_PUBLISHER)) {
    console.log(`\n--- [1/2] Publikacja na Facebooku (Reels / Strony CC) ---`);
    try {
      const fbArgs = [FB_PUBLISHER, '--video', targetMp4];
      if (targetMeta) fbArgs.push('--meta', targetMeta);
      execFileSync('node', fbArgs, { stdio: 'inherit' });
      console.log(`✅ [FB] Publikacja zakończona sukcesem.`);
    } catch (err) {
      console.error(`❌ [FB] Błąd publikacji Facebook:`, err.message);
    }
  }

  // 2. Publikacja YouTube Shorts
  if (fs.existsSync(YT_PUBLISHER)) {
    console.log(`\n--- [2/2] Publikacja na YouTube Shorts ---`);
    try {
      const ytArgs = [YT_PUBLISHER, '--video', targetMp4];
      if (targetMeta) ytArgs.push('--meta', targetMeta);
      ytArgs.push('--visibility', 'public');
      execFileSync('node', ytArgs, { stdio: 'inherit' });
      console.log(`✅ [YouTube] Publikacja Shorts zakończona sukcesem.`);
    } catch (err) {
      console.error(`❌ [YouTube] Błąd publikacji YouTube Shorts:`, err.message);
    }
  }

  console.log(`\n🎉 [Omnichannel Shorts Publisher] Cały proces zakończony!`);
}

main().catch(err => {
  console.error("Błąd krytyczny:", err);
  process.exit(1);
});
