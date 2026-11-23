/**
 * ============================================================================
 * APOKALIPSA DZIEŃ PO DNIU — CODZIENNY ORKIESTRATOR (YT 7 KANAŁÓW + SPOTIFY)
 * Data startu: 2026-11-23 = Odcinek 001 (365 odcinków, 1 dziennie)
 *
 * Użycie:
 *   node scripts/daily_apokalipsa_dpd.mjs              (automatycznie wylicza dzisiejszy odcinek)
 *   node scripts/daily_apokalipsa_dpd.mjs --ep 2       (konkretny numer odcinka)
 *   node scripts/daily_apokalipsa_dpd.mjs --ep 2 --skip-spotify
 * ============================================================================
 */

import { renderEpisodeVideos } from './render_apokalipsa_dpd_videos.mjs';
import { publishEpisode } from './publish_apokalipsa_dpd_pipeline.mjs';
import { publishApokalipsaEpisodeToSpotify } from './publish_spotify_apokalipsa_dpd.mjs';

const START_YMD = '2026-11-23';

function computeTodayEpisodeNum() {
  const todayYmd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
  const start = new Date(`${START_YMD}T00:00:00Z`);
  const today = new Date(`${todayYmd}T00:00:00Z`);
  const diffDays = Math.floor((today - start) / (24 * 3600 * 1000));
  const ep = diffDays + 1;
  if (ep < 1 || ep > 365) {
    throw new Error(`Wyznaczony numer odcinka (${ep}) dla daty ${todayYmd} jest poza zakresem 1..365.`);
  }
  return { ep, todayYmd };
}

async function main() {
  const args = process.argv.slice(2);
  let epNum = null;
  const skipSpotify = args.includes('--skip-spotify');
  const skipYoutube = args.includes('--skip-youtube');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ep' && args[i + 1]) epNum = Number(args[++i]);
  }

  if (!epNum) {
    const calc = computeTodayEpisodeNum();
    epNum = calc.ep;
    console.log(`📅 Data (Europe/Warsaw): ${calc.todayYmd} -> Odcinek #${epNum}`);
  } else {
    console.log(`🎯 Wybrany ręcznie Odcinek #${epNum}`);
  }

  // 1. Render 7 plików MP4 (jeśli jeszcze nie istnieją)
  if (!skipYoutube) {
    renderEpisodeVideos(epNum);
  }

  // 2. Publikacja na 7 kanałach YouTube (public od zaraz)
  if (!skipYoutube) {
    await publishEpisode(epNum, { visibility: 'public' });
  }

  // 3. Publikacja na Spotify
  if (!skipSpotify) {
    try {
      await publishApokalipsaEpisodeToSpotify(epNum);
    } catch (err) {
      console.error(`⚠️ Spotify dla Odcinka #${epNum} wymaga uwagi: ${err.message}`);
    }
  }

  console.log(`\n✅ Zakończono dzienny cykl dla Odcinka #${epNum}.`);
}

main().catch(err => {
  console.error('❌ Błąd dziennego cyklu:', err.message);
  process.exit(1);
});
