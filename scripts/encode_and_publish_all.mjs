import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';

const SOURCE_VIDEO = 'C:\\Users\\czark\\Desktop\\Apo 15 - Wstep do plag (Odc. 33).mp4';
const TARGET_VIDEO = 'C:\\Users\\czark\\Desktop\\Apo 15 - Wstep do plag (Odc. 33) 4K Web.mp4';
const META_DIR = 'C:\\Users\\czark\\Desktop\\Publikacja_Apo15_5_Kanalow';

const PACKAGES = [
  {
    channelName: 'Christian Culture TV',
    channelId: 'UCG5Y4dwJi5436Gu6QH3nNUQ',
    metaFile: 'meta_1_cctv.json'
  },
  {
    channelName: 'Polskie Radio CHRISTIAN CULTURE',
    channelId: 'UCNnCdsJ-K6FXulZzXZHWkjQ',
    metaFile: 'meta_2_prcc.json'
  },
  {
    channelName: 'Biblia Audio Christian Culture',
    channelId: 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
    metaFile: 'meta_3_biblia_audio.json'
  },
  {
    channelName: 'Werset Dnia - Chrześcijański Serwis Biblijny',
    channelId: 'UCyOvW5DuDLVq5XWFyijgtbw',
    metaFile: 'meta_4_werset_dnia.json'
  },
  {
    channelName: 'CC Men',
    channelId: 'UCUpuq9JS7jitIcm9iBn0jnA',
    metaFile: 'meta_5_cc_men.json'
  }
];

function checkVideoValid(videoPath) {
  if (!fs.existsSync(videoPath)) return false;
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`, { encoding: 'utf8' }).trim();
    const dur = parseFloat(out);
    return !isNaN(dur) && dur > 2500;
  } catch {
    return false;
  }
}

async function encodeVideo() {
  if (checkVideoValid(TARGET_VIDEO)) {
    console.log(`✅ Zoptymalizowany plik 4K Web już istnieje i jest poprawny (${(fs.statSync(TARGET_VIDEO).size / (1024*1024*1024)).toFixed(2)} GB). Pomijam kodowanie.`);
    return;
  }

  console.log('================================================================');
  console.log(' KROK 1/2: Sprzętowe kodowanie 4K Web Master (MediaFoundation)');
  console.log(' Źródło:', SOURCE_VIDEO);
  console.log(' Cel:', TARGET_VIDEO);
  console.log('================================================================\n');

  if (fs.existsSync(TARGET_VIDEO)) {
    try { fs.unlinkSync(TARGET_VIDEO); } catch {}
  }

  const args = [
    '-y',
    '-hwaccel', 'd3d11va',
    '-i', SOURCE_VIDEO,
    '-c:v', 'h264_mf',
    '-b:v', '11M',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    TARGET_VIDEO
  ];

  await new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    proc.stderr.on('data', data => {
      const line = data.toString();
      const match = line.match(/time=(\d\d:\d\d:\d\d\.\d\d).*?speed=([0-9.]+x)/);
      if (match) {
        process.stdout.write(`\r  -> Kodowanie w toku: ${match[1]} / 00:42:56 (prędkość: ${match[2]})   `);
      }
    });

    proc.on('close', code => {
      console.log('\n');
      if (code === 0 && checkVideoValid(TARGET_VIDEO)) {
        console.log(`✅ Kodowanie 4K Web zakończone sukcesem! Rozmiar: ${(fs.statSync(TARGET_VIDEO).size / (1024*1024*1024)).toFixed(2)} GB.`);
        resolve();
      } else {
        reject(new Error(`FFmpeg zakończył się kodem błędu ${code} lub plik wynikowy jest nieprawidłowy.`));
      }
    });

    proc.on('error', reject);
  });
}

async function publishAll() {
  console.log('================================================================');
  console.log(' KROK 2/2: Sekwencyjna publikacja na 5 kanałach YouTube');
  console.log(' Plik wideo:', TARGET_VIDEO);
  console.log('================================================================\n');

  process.env.CC_YT_SCHEDULE_DAYS = process.env.CC_YT_SCHEDULE_DAYS || '0';
  process.env.CC_YT_UPLOAD_TIMEOUT_MS = process.env.CC_YT_UPLOAD_TIMEOUT_MS || String(120 * 60 * 1000);

  const results = [];

  for (let i = 0; i < PACKAGES.length; i++) {
    const pkg = PACKAGES[i];
    const metaPath = path.join(META_DIR, pkg.metaFile);
    console.log(`\n----------------------------------------------------------------`);
    console.log(`>>> [${i + 1}/${PACKAGES.length}] Publikacja na kanale: ${pkg.channelName}...`);
    console.log(`----------------------------------------------------------------`);
    try {
      const res = await uploadEpisodeToChannel({
        videoPath: TARGET_VIDEO,
        metaPath,
        channelId: pkg.channelId,
        channelName: pkg.channelName,
        visibility: 'public'
      });
      console.log(`✅ [${pkg.channelName}] SUKCES: ${res.videoUrl || 'Opublikowano'}`);
      results.push({ channel: pkg.channelName, success: true, url: res.videoUrl, title: res.title });
    } catch (err) {
      console.error(`❌ [${pkg.channelName}] BŁĄD: ${err.message}`);
      results.push({ channel: pkg.channelName, success: false, error: err.message });
    }
  }

  console.log('\n================================================================');
  console.log(' PODSUMOWANIE PUBLIKACJI APO 15 (ODC. 33):');
  console.log('================================================================');
  for (const r of results) {
    if (r.success) {
      console.log(`• ${r.channel}: ✅ ${r.url || 'Opublikowano'} — "${r.title}"`);
    } else {
      console.log(`• ${r.channel}: ❌ BŁĄD (${r.error})`);
    }
  }

  fs.writeFileSync(
    path.join(META_DIR, 'raport_publikacji.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    'utf8'
  );
}

async function main() {
  await encodeVideo();
  await publishAll();
}

main().catch(err => {
  console.error('\n❌ BŁĄD KRYTYCZNY:', err.message);
  process.exit(1);
});
