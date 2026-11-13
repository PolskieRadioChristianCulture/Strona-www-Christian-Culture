/**
 * APOKALIPSA — JONATAN DUNKEL: publikacja z premierami na 3 kanałach YouTube.
 * Korzysta ze sprawdzonego uploadera publish_perfect.mjs (bramka przeglądarki, weryfikacja ID kanału,
 * czekanie na pełne przesłanie, potwierdzenie przez YouTube, ochrona przed dublami w historii).
 *
 * Użycie: node scripts/publish_apokalipsa_premiere.mjs [nrOdc ...]   (domyślnie 1 2 3)
 */
import fs from 'node:fs';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';
import { CHANNELS } from './yt_studio_session.mjs';

const ASSETS = 'C:/Users/czark/Christian_Culture_Projekty/sds_apokalipsa_assets';
const TARGET_CHANNELS = ['Osobowość +', 'Polskie Radio CHRISTIAN CULTURE', 'Christian Culture TV'];

const EPISODES = {
  1: { video: 'C:/Users/czark/Desktop/Apokalipsa_Jonatan_Dunkel_Odc_01_Nasze_czasy_w_proroctwach.mp4', ymd: '2026-11-11' },
  2: { video: 'C:/Users/czark/Desktop/Apokalipsa_Jonatan_Dunkel_Odc_02_Kim_jest_Lucyfer.mp4', ymd: '2026-11-12' },
  3: { video: 'C:/Users/czark/Desktop/Apokalipsa_Jonatan_Dunkel_Odc_03_Czemu_Bog_toleruje_zlo.mp4', ymd: '2026-11-13' },
};

const eps = (process.argv.slice(2).map(Number).filter(n => EPISODES[n])).length
  ? process.argv.slice(2).map(Number).filter(n => EPISODES[n]) : [1, 2, 3];

const results = [];
// Kolejność: odcinek po odcinku (najpierw najbliższa premiera na wszystkich kanałach)
for (const n of eps) {
  const ep = EPISODES[n];
  const metaPath = `${ASSETS}/meta/ep_${String(n).padStart(2, '0')}.json`;
  for (const channelName of TARGET_CHANNELS) {
    try {
      const r = await uploadEpisodeToChannel({
        videoPath: ep.video, metaPath,
        channelId: CHANNELS[channelName].id, channelName,
        visibility: 'public', scheduleYmd: ep.ymd, scheduleTime: '20:00'
      });
      results.push({ ep: n, channel: channelName, premiere: `${ep.ymd} 20:00`, ok: true, url: r.videoUrl, skipped: !!r.skipped });
    } catch (err) {
      results.push({ ep: n, channel: channelName, premiere: `${ep.ymd} 20:00`, ok: false, error: err.message });
    }
    fs.writeFileSync(`${ASSETS}/publish_report.json`, JSON.stringify({ updatedAt: new Date().toISOString(), results }, null, 2));
  }
}

console.log('\n📊 RAPORT APOKALIPSA — JONATAN DUNKEL');
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} Odc ${r.ep} | ${r.channel} | ${r.premiere} | ${r.ok ? (r.url || '') : r.error}`);
process.exit(results.every(r => r.ok) ? 0 : 1);
