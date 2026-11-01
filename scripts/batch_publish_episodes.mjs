import fs from 'node:fs';
import path from 'node:path';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';

const GENESIS_DIR = 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju';

const PRIMARY_CHANNELS = [
  {
    id: 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
    name: 'Biblia Audio Christian Culture'
  },
  {
    id: 'UCyOvW5DuDLVq5XWFyijgtbw',
    name: 'Werset Dnia - Chrześcijański Serwis Biblijny'
  }
];

export async function publishSingleEpisode({ video4kFile, shortsFile, metaFile, targetChannels = PRIMARY_CHANNELS }) {
  console.log(`\n========================================================`);
  console.log(`🚀 START PUBLIKACJI ROZDZIAŁU: ${path.basename(video4kFile)}`);
  console.log(`========================================================\n`);

  for (const ch of targetChannels) {
    console.log(`\n>>> [KANAŁ: ${ch.name}] <<<`);

    // 1. Publikacja pełnego filmu 4K
    console.log(`\n--- 1. Publikacja 16:9 4K UHD ---`);
    await uploadEpisodeToChannel({
      videoPath: video4kFile,
      metaPath: metaFile,
      channelId: ch.id,
      channelName: ch.name,
      visibility: 'public'
    });

    // Odczekaj 5 sekund
    await new Promise(r => setTimeout(r, 5000));

    // 2. Publikacja pionowego Shorts 9:16
    if (shortsFile && fs.existsSync(shortsFile)) {
      console.log(`\n--- 2. Publikacja 9:16 Shorts ---`);
      // Tworzymy tymczasowe metadane dla Shorts
      let baseMeta = {};
      try { baseMeta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch {}
      const shortsMetaPath = path.join(path.dirname(shortsFile), `${path.basename(shortsFile, '.mp4')}_meta.json`);
      const shortsMeta = {
        title: `${(baseMeta.title || path.basename(shortsFile, '.mp4')).replace(/\[4K UHD\]/g, '').trim()} #Shorts`.slice(0, 100),
        description: `${baseMeta.description || ''}\n\n#Shorts #BibliaAudio #PismoŚwięte #UBG #Wiara #Bóg #Jezus`,
        tags: ['Shorts', 'Biblia Audio', 'Pismo Święte', 'Słowo Boże', 'UBG', 'Wiara', 'Bóg', 'Jezus']
      };
      fs.writeFileSync(shortsMetaPath, JSON.stringify(shortsMeta, null, 2), 'utf8');

      await uploadEpisodeToChannel({
        videoPath: shortsFile,
        metaPath: shortsMetaPath,
        channelId: ch.id,
        channelName: ch.name,
        visibility: 'public'
      });

      // Odczekaj 5 sekund
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n✅ ROZDZIAŁ ${path.basename(video4kFile)} OPUDLIKOWANY NA WSZYSTKICH KANAŁACH DOCELOWYCH!\n`);
}

// Obsługa z CLI
if (process.argv[1] && process.argv[1].endsWith('batch_publish_episodes.mjs')) {
  const chapterPrefix = process.argv[2]; // np. "Ksiega_Rodzaju_1_20-31" lub "Ksiega_Rodzaju_2"
  if (!chapterPrefix) {
    console.log('Użycie: node scripts/batch_publish_episodes.mjs <prefix_pliku>');
    console.log('Przykład: node scripts/batch_publish_episodes.mjs Ksiega_Rodzaju_1_20-31_2_1-3');
    process.exit(1);
  }

  const files = fs.readdirSync(GENESIS_DIR);
  const video4k = files.find(f => f.startsWith(chapterPrefix) && f.endsWith('_4K.mp4'));
  const shorts = files.find(f => f.startsWith(chapterPrefix) && f.includes('Shorts') && f.endsWith('.mp4'));
  const meta = files.find(f => f.startsWith(chapterPrefix) && f.endsWith('_metadata.json'));

  if (!video4k || !meta) {
    console.error(`Nie znaleziono kompletu plików dla prefixu "${chapterPrefix}" w ${GENESIS_DIR}`);
    process.exit(1);
  }

  publishSingleEpisode({
    video4kFile: path.join(GENESIS_DIR, video4k),
    shortsFile: shorts ? path.join(GENESIS_DIR, shorts) : null,
    metaFile: path.join(GENESIS_DIR, meta)
  }).catch(err => {
    console.error('Błąd publikacji seryjnej:', err);
    process.exit(1);
  });
}
