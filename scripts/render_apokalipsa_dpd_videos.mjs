/**
 * ============================================================================
 * APOKALIPSA DZIEŃ PO DNIU — RENDERER WIDEO 16:9 DLA 7 KANAŁÓW YOUTUBE
 * Generuje 7 plików MP4 (H.264 stillimage + AAC 192k) dla wybranego odcinka.
 *
 * Użycie:
 *   node scripts/render_apokalipsa_dpd_videos.mjs --ep 2
 *   node scripts/render_apokalipsa_dpd_videos.mjs --from 2 --to 7
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DRIVE_ROOT = 'H:\\Mój dysk\\Apokalipsa Dzień po Dniu';
const CATALOG_PATH = path.join(DRIVE_ROOT, 'LICENCJA_I_KATALOG_365.json');
const THUMBS_DIR = path.join(DRIVE_ROOT, 'Okladki_Kanalow_YT');
const VIDEOS_DIR = path.join(DRIVE_ROOT, 'Odcinki_Wideo_YT');

const FFMPEG_CANDIDATES = [
  'C:\\Users\\czark\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe',
  'ffmpeg'
];

function resolveFfmpeg() {
  for (const c of FFMPEG_CANDIDATES) {
    if (c === 'ffmpeg' || fs.existsSync(c)) return c;
  }
  return 'ffmpeg';
}

const CHANNEL_THUMBS = [
  { slug: 'Biblia_Audio_CC', thumb: '01_Biblia_Audio_CC_1920x1080.jpg' },
  { slug: 'Werset_Dnia', thumb: '02_Werset_Dnia_1920x1080.jpg' },
  { slug: 'Christian_Culture_TV', thumb: '03_Christian_Culture_TV_1920x1080.jpg' },
  { slug: 'Polskie_Radio_CC', thumb: '04_Polskie_Radio_CC_1920x1080.jpg' },
  { slug: 'Osobowosc_Plus', thumb: '05_Osobowosc_Plus_1920x1080.jpg' },
  { slug: 'CC_Men', thumb: '06_CC_Men_1920x1080.jpg' },
  { slug: 'CC_Women', thumb: '07_CC_Women_1920x1080.jpg' }
];

export function renderEpisodeVideos(epNum, { overwrite = false } = {}) {
  const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const ep = cat.episodes.find(e => e.epNum === epNum);
  if (!ep) throw new Error(`Brak odcinka #${epNum} w katalogu!`);

  const nnn = String(epNum).padStart(3, '0');
  const mp3Path = path.join(DRIVE_ROOT, ep.relativePath);
  if (!fs.existsSync(mp3Path)) throw new Error(`Brak pliku MP3: ${mp3Path}`);

  const outDir = path.join(VIDEOS_DIR, nnn);
  fs.mkdirSync(outDir, { recursive: true });

  const ffmpeg = resolveFfmpeg();
  const created = [];

  console.log(`\n🎬 Renderowanie 7 plików MP4 dla Odcinka ${nnn}: ${ep.title}`);
  for (const ch of CHANNEL_THUMBS) {
    const thumbPath = path.join(THUMBS_DIR, ch.thumb);
    if (!fs.existsSync(thumbPath)) throw new Error(`Brak okładki: ${thumbPath}`);
    const outPath = path.join(outDir, `${nnn}_${ch.slug}.mp4`);

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000 && !overwrite) {
      console.log(`  ⏭️  Istnieje: ${path.basename(outPath)}`);
      created.push(outPath);
      continue;
    }

    execFileSync(ffmpeg, [
      '-y',
      '-loop', '1',
      '-framerate', '2',
      '-i', thumbPath,
      '-i', mp3Path,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-preset', 'ultrafast',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outPath
    ], { stdio: 'ignore' });

    const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
    console.log(`  ✅ ${path.basename(outPath)} (${sizeMb} MB)`);
    created.push(outPath);
  }

  return created;
}

if (process.argv[1] && process.argv[1].includes('render_apokalipsa_dpd_videos')) {
  const args = process.argv.slice(2);
  let from = 2;
  let to = 2;
  let overwrite = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ep' && args[i + 1]) { from = to = Number(args[++i]); }
    if (args[i] === '--from' && args[i + 1]) { from = Number(args[++i]); }
    if (args[i] === '--to' && args[i + 1]) { to = Number(args[++i]); }
    if (args[i] === '--overwrite') overwrite = true;
  }
  for (let ep = from; ep <= to; ep++) {
    renderEpisodeVideos(ep, { overwrite });
  }
  console.log('\n🎉 Renderowanie zakończone.');
}
