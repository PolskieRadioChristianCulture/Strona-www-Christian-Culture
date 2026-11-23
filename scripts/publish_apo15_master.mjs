import fs from 'node:fs';
import path from 'node:path';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';

const VIDEO_PATH = 'C:\\Users\\czark\\Desktop\\Apo 15 - Wstep do plag (Odc. 33) 4K Web.mp4';
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

async function main() {
  console.log('================================================================');
  console.log(' Rozpoczęcie publikacji Odc. 33 (Apo 15) na 5 kanałach YouTube');
  console.log(' Plik wideo:', VIDEO_PATH);
  console.log(' Rozmiar:', (fs.statSync(VIDEO_PATH).size / (1024 * 1024 * 1024)).toFixed(2), 'GB');
  console.log('================================================================\n');

  process.env.CC_YT_SCHEDULE_DAYS = process.env.CC_YT_SCHEDULE_DAYS || '0'; // Domyślnie publikacja od razu (public)
  const results = [];

  const startIndex = process.argv[2] != null ? parseInt(process.argv[2], 10) : 0;
  const endIndex = process.argv[3] != null ? parseInt(process.argv[3], 10) : (process.argv[2] != null ? startIndex + 1 : PACKAGES.length);
  const toProcess = PACKAGES.slice(startIndex, endIndex);

  for (let i = 0; i < toProcess.length; i++) {
    const pkg = toProcess[i];
    const metaPath = path.join(META_DIR, pkg.metaFile);
    console.log(`\n>>> [${i + 1}/${toProcess.length}] Rozpoczynam upload na kanał: ${pkg.channelName}...`);
    try {
      const res = await uploadEpisodeToChannel({
        videoPath: VIDEO_PATH,
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
      // Nie przerywamy całej pętli — próbujemy kolejne kanały
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

main().catch(err => {
  console.error('Błąd krytyczny:', err);
  process.exit(1);
});
