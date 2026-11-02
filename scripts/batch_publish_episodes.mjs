import fs from 'node:fs';
import path from 'node:path';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';
import { BIBLIA_AUDIO_CHANNELS } from './yt_studio_session.mjs';

const GENESIS_DIR = 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju';

// Decyzja L0 02.11.2026: komplet (4K + Shorts) na WSZYSTKICH 7 kanałach, codziennie zaraz po produkcji.
// Bieżący odcinek ma własną porę premiery (20:00), więc nie czeka w kolejce za zaległościami (18:00).
const DAILY_SLOT = process.env.CC_YT_DAILY_TIME || '20:00';

export async function publishSingleEpisode({ video4kFile, shortsFile, metaFile, targetChannels = BIBLIA_AUDIO_CHANNELS, scheduleTime = DAILY_SLOT }) {
  console.log(`\n========================================================`);
  console.log(`🚀 START PUBLIKACJI ROZDZIAŁU: ${path.basename(video4kFile)} → ${targetChannels.length} kanałów, premiera ${scheduleTime}`);
  console.log(`========================================================\n`);

  // Metadane Shorts: gotowy plik z produkcji, a gdy go brak — wyprowadzone z metadanych 4K.
  let shortsMetaPath = null;
  if (shortsFile && fs.existsSync(shortsFile)) {
    shortsMetaPath = path.join(path.dirname(shortsFile), `${path.basename(shortsFile, '.mp4')}_meta.json`);
    if (!fs.existsSync(shortsMetaPath)) {
      let baseMeta = {};
      try { baseMeta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch {}
      fs.writeFileSync(shortsMetaPath, JSON.stringify({
        title: `${(baseMeta.title || path.basename(shortsFile, '.mp4')).replace(/\[4K UHD\]/g, '').trim()} #Shorts`.slice(0, 100),
        description: `${baseMeta.description || ''}\n\n#Shorts #BibliaAudio #PismoŚwięte #UBG #Wiara #Bóg #Jezus`,
        tags: ['Shorts', 'Biblia Audio', 'Pismo Święte', 'Słowo Boże', 'UBG', 'Wiara', 'Bóg', 'Jezus']
      }, null, 2), 'utf8');
    }
  }

  const results = [];
  for (const channelName of targetChannels) {
    console.log(`\n>>> [KANAŁ: ${channelName}] <<<`);
    const jobs = [{ kind: '4K', videoPath: video4kFile, metaPath: metaFile }];
    if (shortsMetaPath) jobs.push({ kind: 'Shorts', videoPath: shortsFile, metaPath: shortsMetaPath });
    for (const job of jobs) {
      // Błąd jednego kanału nie zatrzymuje pozostałych; ponowne uruchomienie pomija to, co już jest w historii.
      try {
        const r = await uploadEpisodeToChannel({ videoPath: job.videoPath, metaPath: job.metaPath, channelName, visibility: 'public', scheduleTime });
        results.push({ channel: channelName, kind: job.kind, result: r.skipped ? 'pominięte (już jest)' : 'zaplanowane', url: r.videoUrl });
      } catch (e) {
        results.push({ channel: channelName, kind: job.kind, result: 'BŁĄD', error: e.message.split('\n')[0] });
        console.error(`❌ ${channelName} | ${job.kind}: ${e.message.split('\n')[0]}`);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('\n=== PODSUMOWANIE ===');
  for (const r of results) console.log(`${r.result.padEnd(22)} ${r.channel} | ${r.kind}${r.url ? ` | ${r.url}` : ''}${r.error ? ` | ${r.error}` : ''}`);
  const failed = results.filter(r => r.result === 'BŁĄD').length;
  console.log(failed ? `\n⚠️ ${failed} pozycji z błędem — uruchom ponownie ten sam prefiks (gotowe zostaną pominięte), potem: node scripts/yt_repair_biblia_audio.mjs` : `\n✅ Rozdział zaplanowany na wszystkich ${targetChannels.length} kanałach.`);
  return { results, failed };
}

// Obsługa z CLI
if (process.argv[1] && path.basename(process.argv[1]) === 'batch_publish_episodes.mjs') {
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
  }).then(({ failed }) => process.exit(failed ? 1 : 0)).catch(err => {
    console.error('Błąd publikacji seryjnej:', err);
    process.exit(1);
  });
}
