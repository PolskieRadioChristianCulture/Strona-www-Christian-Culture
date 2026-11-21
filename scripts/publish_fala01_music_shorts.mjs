import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';
import { CHANNELS } from './yt_studio_session.mjs';

const FALA_ROOT = 'D:\\Wydania_Muzyczne_CC_2027\\Fala_01_Monochromatyczna';
const DISTROKID_LOG = path.join(FALA_ROOT, 'distrokid_published_log.json');
const REPORT_PATH = path.join(FALA_ROOT, 'shorts_youtube_campaign_report.json');

export const TARGET_CHANNELS = [
  'Polskie Radio CHRISTIAN CULTURE',
  'Christian Culture TV',
  'Worship LIVE CC',
  'Christian Culture Praise & Worship',
  'CC MUSIC',
  'CC Shorts'
];

export const ALBUM_CAMPAIGN = [
  {
    num: '01',
    folder: '01 - Głos Mojego Serca (Psalm 19,14)',
    mp4: 'CC_01_Glos_Mojego_Serca_Shorts_9x16.mp4',
    title: 'Głos Mojego Serca (Psalm 19,14) — Białe Skrzydła | Nowy Album Christian Culture #Shorts',
    quote: '„Niech będą Ci miłe słowa moich ust i rozmyślanie mego serca.” (Psalm 19,14)',
    featuredTrack: '01. Białe Skrzydła - Czerwone Serca',
    scheduleYmd: null,
    scheduleTime: null,
    extraTags: 'Psalm 19, Głos Mojego Serca, Białe Skrzydła'
  },
  {
    num: '02',
    folder: '02 - Pieśń Wolności',
    mp4: 'CC_02_Piesn_Wolnosci_Shorts_9x16.mp4',
    title: 'Pieśń Wolności — Uwolnij Mnie | Nowy Album Christian Culture #Shorts',
    quote: 'Pieśni o wolności w Chrystusie, wytrwałości i zwycięstwie wiary.',
    featuredTrack: '01. Uwolnij mnie',
    scheduleYmd: '2026-11-22',
    scheduleTime: '12:00',
    extraTags: 'Pieśń Wolności, Uwolnij mnie, Wolność w Chrystusie'
  },
  {
    num: '03',
    folder: '03 - Szept Światła (Psalm 27,1)',
    mp4: 'CC_03_Szept_Swiatla_Shorts_9x16.mp4',
    title: 'Szept Światła (Psalm 27,1) — Światło w ciemności | Christian Culture #Shorts',
    quote: '„Pan jest moją światłością i moim zbawieniem, kogóż będę się bać?” (Psalm 27,1 UBG)',
    featuredTrack: '01. Światło w ciemności',
    scheduleYmd: '2026-11-23',
    scheduleTime: '12:00',
    extraTags: 'Psalm 27, Szept Światła, Światło w ciemności'
  },
  {
    num: '04',
    folder: '04 - Oczy Pełne Nadziei (Psalm 121)',
    mp4: 'CC_04_Oczy_Pelne_Nadziei_Shorts_9x16.mp4',
    title: 'Oczy Pełne Nadziei (Psalm 121) — Miłość, Wiara, Nadzieja | Christian Culture #Shorts',
    quote: '„Oczy moje podnoszę ku górom, skąd przyjdzie mi pomoc.” (Psalm 121,1 UBG)',
    featuredTrack: '01. Miłość, Wiara, Nadzieja',
    scheduleYmd: '2026-11-24',
    scheduleTime: '12:00',
    extraTags: 'Psalm 121, Oczy Pełne Nadziei, Miłość Wiara Nadzieja'
  },
  {
    num: '05',
    folder: '05 - Światło w Oczach (Psalm 119,105)',
    mp4: 'CC_05_Swiatlo_w_Oczach_Shorts_9x16.mp4',
    title: 'Światło w Oczach (Psalm 119,105) — Powiedz Tylko Słowo | Christian Culture #Shorts',
    quote: '„Twoje słowo jest pochodnią dla moich nóg i światłością na mojej ścieżce.” (Psalm 119,105 UBG)',
    featuredTrack: '01. Powiedz Tylko Słowo',
    scheduleYmd: '2026-11-25',
    scheduleTime: '12:00',
    extraTags: 'Psalm 119, Światło w Oczach, Powiedz Tylko Słowo'
  },
  {
    num: '06',
    folder: '06 - Nadzieja Nie Gaśnie',
    mp4: 'CC_06_Nadzieja_Nie_Gasnie_Shorts_9x16.mp4',
    title: 'Nadzieja Nie Gaśnie — Nie Lękaj Się | Nowy Album Christian Culture #Shorts',
    quote: 'Pieśni pokoju, odwagi i niezłomnej nadziei w Bogu.',
    featuredTrack: '01. Nie Lękaj Się',
    scheduleYmd: '2026-11-26',
    scheduleTime: '12:00',
    extraTags: 'Nadzieja Nie Gaśnie, Nie Lękaj Się, Chrześcijańska Nadzieja'
  },
  {
    num: '07',
    folder: '07 - Uwielbienie w Ciszy Serca',
    mp4: 'CC_07_Uwielbienie_w_Ciszy_Serca_Shorts_9x16.mp4',
    title: 'Uwielbienie w Ciszy Serca — Odbierz Chwałę z Mojego Życia | Christian Culture #Shorts',
    quote: 'Chwila ciszy, modlitwy i głębokiego uwielbienia Pana.',
    featuredTrack: '01. Odbierz Chwałę z Mojego Życia',
    scheduleYmd: '2026-11-27',
    scheduleTime: '12:00',
    extraTags: 'Uwielbienie w Ciszy Serca, Odbierz Chwałę, Adoracja'
  }
];

function readDistrokidLog() {
  if (!fs.existsSync(DISTROKID_LOG)) return {};
  try {
    const raw = fs.readFileSync(DISTROKID_LOG, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function listAlbumTracks(albumDir) {
  return fs.readdirSync(albumDir)
    .filter(f => /^\d{2}\s-.*\.(mp3|wav)$/i.test(f))
    .sort()
    .map(f => f.replace(/\.(mp3|wav)$/i, '').replace(/^(\d{2})\s*-\s*/, '$1. '));
}

function buildAlbumMeta(album) {
  const albumDir = path.join(FALA_ROOT, album.folder);
  const shortsDir = path.join(albumDir, 'Shorts_9x16');
  const videoPath = path.join(shortsDir, album.mp4);
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Brak pliku wideo Shorts: ${videoPath}`);
  }

  const distrokid = readDistrokidLog();
  const dkEntry = distrokid[album.folder] || null;
  const hyperfollow = dkEntry?.hyperfollow || null;

  const tracks = listAlbumTracks(albumDir);
  const displayName = album.folder.replace(/^\d{2}\s*-\s*/, '');

  const lines = [
    `${displayName} — Zapowiedź Pełnego Albumu Muzycznego | Christian Culture`,
    '',
    album.quote,
    '',
    `Prezentowany fragment (refren): ${album.featuredTrack}`,
    '',
    'Pełna lista utworów albumu (10 utworów):',
    ...tracks,
    '',
    hyperfollow
      ? `Słuchaj albumu na Spotify, Apple Music i platformach streamingowych:\n${hyperfollow}`
      : 'Słuchaj naszych albumów na Spotify, YouTube Music oraz na platformach streamingowych.',
    '',
    'Radio Christian Culture 24/7 i cały katalog muzyczny:',
    'https://polskieradio.cc',
    'https://polskieradio.cc/player',
    '',
    '#Shorts #ChristianCulture #MuzykaChrześcijańska #Uwielbienie #Spotify #NowyAlbum'
  ];

  const tagsBase = 'Christian Culture, Muzyka Chrześcijańska, Uwielbienie, Spotify, Nowy Album, Shorts, Pieśni Chwały';
  const tags = `${album.extraTags}, ${tagsBase}`.slice(0, 280);

  const metaObj = {
    title: album.title.slice(0, 100),
    description: lines.join('\n').slice(0, 4900),
    tags,
    videoLanguage: 'pl',
    titleDescriptionLanguage: 'pl'
  };

  const metaPath = path.join(shortsDir, 'meta_shorts_yt.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaObj, null, 2), 'utf8');
  return { videoPath, metaPath, metaObj };
}

function checkProfileActiveLocks() {
  try {
    const out = execFileSync(
      'powershell',
      ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'chrome.exe' -or $_.Name -eq 'node.exe') -and $_.CommandLine -match 'youtube_browser_profile' } | Select-Object ProcessId, Name, CommandLine | ConvertTo-Json -Compress"],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }
    ).trim();
    if (!out || out === 'null') return [];
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function waitIfProfileBusy(maxWaitMs = 35 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const locks = checkProfileActiveLocks();
    if (locks.length === 0) return;
    console.log(`[WAIT] Profil .youtube_browser_profile zajęty przez PID ${locks.map(l => l.ProcessId).join(', ')}. Czekam 15s...`);
    await new Promise(r => setTimeout(r, 15000));
  }
  const remaining = checkProfileActiveLocks();
  if (remaining.length > 0) {
    throw new Error(`Profil .youtube_browser_profile zablokowany > 35 min (PID: ${remaining.map(l => l.ProcessId).join(', ')}).`);
  }
}

function saveReport(report) {
  report.updatedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
}

async function runSlot(album, channelName, report) {
  const ch = CHANNELS[channelName];
  if (!ch) throw new Error(`Nieznany kanał w yt_studio_session.mjs: ${channelName}`);

  const { videoPath, metaPath } = buildAlbumMeta(album);

  const prevDays = process.env.CC_YT_SCHEDULE_DAYS;
  if (!album.scheduleYmd) {
    process.env.CC_YT_SCHEDULE_DAYS = '0';
  } else {
    delete process.env.CC_YT_SCHEDULE_DAYS;
  }

  try {
    const res = await uploadEpisodeToChannel({
      videoPath,
      metaPath,
      channelId: ch.id || undefined,
      channelName,
      visibility: 'public',
      scheduleYmd: album.scheduleYmd || undefined,
      scheduleTime: album.scheduleTime || undefined,
      videoLanguage: 'pl',
      titleDescriptionLanguage: 'pl'
    });

    const entry = {
      album: album.num,
      folder: album.folder,
      channel: channelName,
      handle: ch.handle,
      schedule: album.scheduleYmd ? `${album.scheduleYmd} ${album.scheduleTime}` : 'PUBLIC_NOW',
      status: res?.skipped ? 'skipped_already_published' : 'success',
      videoUrl: res?.videoUrl || null,
      at: new Date().toISOString()
    };
    const idx = report.results.findIndex(r => r.album === entry.album && r.channel === entry.channel);
    if (idx >= 0) {
      if (!(res?.skipped && report.results[idx].status === 'success')) {
        report.results[idx] = entry;
      }
    } else {
      report.results.push(entry);
    }
    saveReport(report);
    return { ok: true, entry };
  } catch (err) {
    const entry = {
      album: album.num,
      folder: album.folder,
      channel: channelName,
      handle: ch.handle,
      schedule: album.scheduleYmd ? `${album.scheduleYmd} ${album.scheduleTime}` : 'PUBLIC_NOW',
      status: 'error',
      error: err?.message || String(err),
      at: new Date().toISOString()
    };
    const idx = report.results.findIndex(r => r.album === entry.album && r.channel === entry.channel);
    if (idx >= 0) {
      if (report.results[idx].status !== 'success') report.results[idx] = entry;
    } else {
      report.results.push(entry);
    }
    saveReport(report);
    return { ok: false, entry, error: err };
  } finally {
    if (prevDays !== undefined) process.env.CC_YT_SCHEDULE_DAYS = prevDays;
    else delete process.env.CC_YT_SCHEDULE_DAYS;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const albumFilter = args.find((_, i, arr) => arr[i - 1] === '--album') || null;
  const albumsFilter = args.find((_, i, arr) => arr[i - 1] === '--albums') || null;
  const channelFilter = args.find((_, i, arr) => arr[i - 1] === '--channel') || null;
  const prepOnly = args.includes('--prep-only');

  const albumSet = albumsFilter ? new Set(albumsFilter.split(',').map(s => s.trim())) : null;
  const albums = albumSet
    ? ALBUM_CAMPAIGN.filter(a => albumSet.has(a.num))
    : albumFilter
      ? ALBUM_CAMPAIGN.filter(a => a.num === albumFilter)
      : ALBUM_CAMPAIGN;
  const channels = channelFilter ? TARGET_CHANNELS.filter(c => c === channelFilter) : TARGET_CHANNELS;

  if (albums.length === 0) throw new Error(`Nie znaleziono albumu dla --album=${albumFilter}`);
  if (channels.length === 0) throw new Error(`Nie znaleziono kanału dla --channel=${channelFilter}`);

  for (const album of albums) {
    buildAlbumMeta(album);
  }
  console.log(`Przygotowano metadane meta_shorts_yt.json dla ${albums.length} albumów.`);
  if (prepOnly) return;

  await waitIfProfileBusy();

  const report = fs.existsSync(REPORT_PATH)
    ? JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
    : { campaign: 'Fala_01_Monochromatyczna_Shorts_9x16', startedAt: new Date().toISOString(), results: [] };
  if (!Array.isArray(report.results)) report.results = [];

  const failedQueue = [];

  for (const album of albums) {
    for (const channelName of channels) {
      await waitIfProfileBusy();
      const outcome = await runSlot(album, channelName, report);
      if (!outcome.ok) {
        failedQueue.push({ album, channelName });
      }
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  // Jednorazowe ponowienie nieudanych pozycji
  if (failedQueue.length > 0) {
    console.log(`\n=== Ponowna próba (${failedQueue.length} nieudanych slotów) ===`);
    for (const { album, channelName } of failedQueue) {
      await waitIfProfileBusy();
      await runSlot(album, channelName, report);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const okCount = report.results.filter(r => r.status === 'success' || r.status === 'skipped_already_published').length;
  const errCount = report.results.filter(r => r.status === 'error').length;
  console.log(`\n=== KONIEC KAMPANII SHORTS FALA 01: sukces/pominięto=${okCount}, błędów=${errCount} ===`);
  console.log(`Pełny raport: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error('Krytyczny błąd publikacji Fala 01 Shorts:', err);
  process.exit(1);
});
