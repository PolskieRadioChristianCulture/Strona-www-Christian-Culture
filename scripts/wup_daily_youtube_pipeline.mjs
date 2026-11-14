/**
 * WHAT'S UP PROF? (Walter Veith & Martin Smith) — codzienny pipeline publikacji YouTube.
 *
 * Źródło MP4: https://downloads.clashofminds.com/wup-mp4/ (50 odcinków w data/wup_episodes_catalog.json)
 * Kanały docelowe (8):
 *  - Personality Plus (EN): angielski tytuł, opis i miniatura EN, język filmu EN, język meta EN.
 *  - 7 głównych kanałów PL: polski tytuł, opis i miniatura PL („Polski lektor automatyczny”),
 *    wideo MP4 w oryginale (język filmu EN pod automatyczny dubbing YT), język meta PL.
 *
 * Harmonogram: 1 odcinek dziennie (sekwencyjnie), premiera +48 godzin (2 dni do przodu) od momentu publikacji.
 * Pamięć masowa: bufor w D:\CC_WUP_Cache (lub fallback tmp_wup_cache) — po wgraniu na wszystkie 8 kanałów plik MP4 jest usuwany.
 *
 * Użycie:
 *   node scripts/wup_daily_youtube_pipeline.mjs [--dry-run] [--status] [--ep N] [--channel "Nazwa"] [--visibility public|unlisted|private] [--hours 48] [--keep-cache]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { CHANNELS, BIBLIA_AUDIO_CHANNELS, PROFILE_DIR } from './yt_studio_session.mjs';
import { uploadEpisodeToChannel, computeOffsetSchedule } from './publish_perfect.mjs';

export const ROOT = path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc');
export const CATALOG_PATH = path.join(ROOT, 'data/wup_episodes_catalog.json');
export const STATE_PATH = path.join(ROOT, 'data/wup_daily_yt_state.json');
export const THUMB_EN = path.join(ROOT, 'scripts/assets/wup/wup_thumb_en.jpg');
export const THUMB_PL = path.join(ROOT, 'scripts/assets/wup/wup_thumb_pl.jpg');

export const EN_CHANNEL = 'Personality Plus';
export const PL_CHANNELS = [...BIBLIA_AUDIO_CHANNELS];
export const TARGET_CHANNELS = [EN_CHANNEL, ...PL_CHANNELS];
export const DEFAULT_SCHEDULE_OFFSET_HOURS = 48;

export function resolveCacheDir() {
  if (process.env.CC_WUP_CACHE_DIR) return path.resolve(process.env.CC_WUP_CACHE_DIR);
  if (fs.existsSync('D:/')) return 'D:\\CC_WUP_Cache';
  return path.join(ROOT, 'tmp_wup_cache');
}

export function loadCatalog(catalogPath = CATALOG_PATH) {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Brak katalogu odcinków WUP: ${catalogPath}`);
  }
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

export function defaultState() {
  return {
    version: '1.0',
    series: "What's Up Prof? — Walter Veith & Martin Smith (Clash of Minds)",
    scheduleOffsetHours: DEFAULT_SCHEDULE_OFFSET_HOURS,
    dailyCron: 'CRON_TZ=Europe/Warsaw 0 15 * * *',
    lastRunAt: null,
    episodes: {}
  };
}

export function loadState(statePath = STATE_PATH) {
  if (!fs.existsSync(statePath)) return defaultState();
  const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return { ...defaultState(), ...parsed, episodes: parsed.episodes || {} };
}

export function saveState(state, statePath = STATE_PATH) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

export function selectNextEpisode(catalog, state, { epSeq = null } = {}) {
  const sorted = [...(catalog?.episodes || [])].sort((a, b) => Number(a.seq) - Number(b.seq));
  if (epSeq != null) {
    const found = sorted.find(e => Number(e.seq) === Number(epSeq));
    if (!found) throw new Error(`Nie znaleziono odcinka WUP nr ${epSeq} w katalogu.`);
    return found;
  }
  return sorted.find(e => !state?.episodes?.[String(e.seq)]?.completed) || null;
}

export function isEpisodeFullyPublished(epRecord, channels = TARGET_CHANNELS) {
  if (!epRecord || !epRecord.channels) return false;
  return channels.every(ch => epRecord.channels[ch]?.status === 'ok');
}

export function buildChannelMetadata(episode, channelName) {
  if (!CHANNELS[channelName]) {
    throw new Error(`Nieznany kanał docelowy: "${channelName}". Dodaj go najpierw do CHANNELS w yt_studio_session.mjs.`);
  }
  const epCode = String(episode.epCode || String(episode.seq).padStart(3, '0'));
  const isEnglishChannel = channelName === EN_CHANNEL;

  if (isEnglishChannel) {
    const title = String(episode.titleEn || `${epCode}. ${episode.topicEn}`).slice(0, 100);
    const description = [
      `What's Up Prof? — Episode ${epCode}: ${episode.topicEn}`,
      'Speakers: Prof. Walter Veith & Martin Smith (Clash of Minds).',
      '',
      'A thoughtful look at world events, religious liberty, and Bible prophecy from a Christian perspective.',
      '',
      'Christian Culture Ecosystem: https://polskieradio.cc',
      'Bible Study & Academy: https://polskieradio.cc/akademia',
      'Interlinear Bible (MojaBiblia): https://polskieradio.cc/mojabiblia',
      `Original Clash of Minds MP4 Archive: https://downloads.clashofminds.com/wup-mp4/`,
      '',
      '#WhatsUpProf #WalterVeith #BibleProphecy #ClashOfMinds #ChristianCulture #PersonalityPlus'
    ].join('\n').slice(0, 5000);

    return {
      title,
      description,
      tags: ['Walter Veith', 'Martin Smith', 'Whats Up Prof', 'Clash of Minds', 'Bible Prophecy', 'Christian Culture', 'Personality Plus'],
      thumbnailPath: THUMB_EN,
      videoLanguage: 'en',
      titleDescriptionLanguage: 'en'
    };
  }

  const title = String(episode.titlePl || `${epCode}. ${episode.topicPl}`).slice(0, 100);
  const description = [
    `What's Up Prof? — Odcinek ${epCode}: ${episode.topicPl}`,
    `Oryginalny temat: ${episode.topicEn}`,
    'Prowadzący: prof. Walter Veith oraz Martin Smith (Clash of Minds).',
    '',
    'Materiał w oryginalnej wersji angielskiej — w ustawieniach odtwarzacza YouTube dostępny jest polski lektor automatyczny (automatyczny dubbing YouTube) oraz polskie napisy.',
    '',
    'Ekosystem Christian Culture:',
    '• Radio i Portal: https://polskieradio.cc',
    '• Akademia Biblijna: https://polskieradio.cc/akademia',
    '• MojaBiblia (kody Stronga i przekłady): https://polskieradio.cc/mojabiblia',
    '• Oryginalne archiwum Clash of Minds: https://downloads.clashofminds.com/wup-mp4/',
    '',
    '#WhatsUpProf #WalterVeith #ProroctwaBiblijne #ChristianCulture #PolskieRadioCC #StudiumBiblii'
  ].join('\n').slice(0, 5000);

  return {
    title,
    description,
    tags: ['Walter Veith', 'Martin Smith', 'Whats Up Prof', 'Proroctwa Biblijne', 'Czasy Ostateczne', 'Christian Culture', 'Polskie Radio CC'],
    thumbnailPath: THUMB_PL,
    videoLanguage: 'en',
    titleDescriptionLanguage: 'pl'
  };
}

export function buildEpisodeFileName(episode) {
  const urlPath = new URL(episode.url).pathname;
  const base = path.basename(urlPath);
  if (base && base.toLowerCase().endsWith('.mp4')) return base;
  return `wup-${String(episode.epCode || episode.seq).padStart(3, '0')}.mp4`;
}

function warsawWallToEpochMs(ymd, time) {
  const approxUtc = Date.parse(`${ymd}T${time}:00Z`);
  if (!Number.isFinite(approxUtc)) return NaN;
  const renderedUtc = Date.parse(
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).format(new Date(approxUtc)).replace(' ', 'T') + 'Z'
  );
  return approxUtc - (renderedUtc - approxUtc);
}

export function resolveScheduleForEpisode(epRecord, offsetHours = DEFAULT_SCHEDULE_OFFSET_HOURS, now = new Date()) {
  // Jeśli wznawiamy częściowo wgrany odcinek i zaplanowany termin jest wciąż >= 2h w przyszłości, zachowaj ten sam slot premiery.
  if (epRecord?.scheduledYmd && epRecord?.scheduledTime) {
    const existingMs = warsawWallToEpochMs(epRecord.scheduledYmd, epRecord.scheduledTime);
    if (Number.isFinite(existingMs) && existingMs - now.getTime() >= 2 * 3600 * 1000) {
      return { ymd: epRecord.scheduledYmd, time: epRecord.scheduledTime };
    }
  }
  const computed = computeOffsetSchedule(offsetHours, now);
  return { ymd: computed.ymd, time: computed.time };
}

function checkProfileNotInUse() {
  if (process.platform !== 'win32') return;
  try {
    const out = execSync(
      'powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"Name=\'chrome.exe\'\\").CommandLine"',
      { encoding: 'utf8', timeout: 8000 }
    );
    if (out && out.toLowerCase().includes('.youtube_browser_profile')) {
      throw new Error(`Profil ${PROFILE_DIR} jest aktualnie używany przez inny proces Chrome/Playwright. Przerywam, aby nie uszkodzić sesji.`);
    }
  } catch (err) {
    if (err.message.includes('aktualnie używany')) throw err;
  }
}

function cleanupOldCompletedCache(cacheDir, catalog, state, currentFileName) {
  if (!fs.existsSync(cacheDir)) return;
  for (const ep of catalog.episodes || []) {
    const fname = buildEpisodeFileName(ep);
    if (fname === currentFileName) continue;
    const rec = state.episodes?.[String(ep.seq)];
    if (rec?.completed) {
      const candidate = path.join(cacheDir, fname);
      if (fs.existsSync(candidate)) {
        fs.unlinkSync(candidate);
        console.log(`🧹 Usunięto z bufora ukończony odcinek: ${fname}`);
      }
    }
  }
}

async function downloadEpisodeMp4(episode, cacheDir) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const fileName = buildEpisodeFileName(episode);
  const targetPath = path.join(cacheDir, fileName);
  const tmpPath = `${targetPath}.part`;

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 20 * 1024 * 1024) {
    const mb = (fs.statSync(targetPath).size / (1024 * 1024)).toFixed(1);
    console.log(`📦 Używam pliku z bufora: ${targetPath} (${mb} MB)`);
    return targetPath;
  }

  console.log(`⬇️  Pobieram WUP ${episode.epCode}: ${episode.url}`);
  const res = await fetch(episode.url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} podczas pobierania ${episode.url}`);
  }
  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  if (ctype.includes('text/html')) {
    throw new Error(`Serwer zwrócił HTML zamiast MP4 (${ctype}) dla ${episode.url}`);
  }
  if (!res.body) {
    throw new Error(`Pusty strumień odpowiedzi dla ${episode.url}`);
  }

  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmpPath));
  const size = fs.statSync(tmpPath).size;
  if (size < 20 * 1024 * 1024) {
    fs.unlinkSync(tmpPath);
    throw new Error(`Pobrany plik jest podejrzanie mały (${size} B) — przerywam.`);
  }
  fs.renameSync(tmpPath, targetPath);
  console.log(`✅ Pobrano: ${targetPath} (${(size / (1024 * 1024)).toFixed(1)} MB)`);
  return targetPath;
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  const opts = {
    dryRun: false,
    status: false,
    keepCache: false,
    epSeq: null,
    channel: null,
    visibility: 'public',
    hours: DEFAULT_SCHEDULE_OFFSET_HOURS
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--status') opts.status = true;
    else if (a === '--keep-cache') opts.keepCache = true;
    else if (a === '--ep' && argv[i + 1]) opts.epSeq = Number(argv[++i]);
    else if (a === '--channel' && argv[i + 1]) opts.channel = argv[++i];
    else if (a === '--visibility' && argv[i + 1]) opts.visibility = argv[++i];
    else if (a === '--hours' && argv[i + 1]) opts.hours = Number(argv[++i]);
  }
  return opts;
}

async function main() {
  const opts = parseCliArgs();
  const catalog = loadCatalog();
  const state = loadState();
  const cacheDir = resolveCacheDir();

  if (opts.status) {
    const total = catalog.episodes.length;
    const completedCount = catalog.episodes.filter(e => state.episodes[String(e.seq)]?.completed).length;
    const next = selectNextEpisode(catalog, state);
    console.log(`📊 WUP Daily YouTube Status: ${completedCount}/${total} odcinków ukończonych na 8 kanałach.`);
    console.log(`   Bufor MP4: ${cacheDir}`);
    console.log(`   Miniatura EN: ${fs.existsSync(THUMB_EN) ? 'OK' : 'BRAK'} (${THUMB_EN})`);
    console.log(`   Miniatura PL: ${fs.existsSync(THUMB_PL) ? 'OK' : 'BRAK'} (${THUMB_PL})`);
    if (next) {
      console.log(`   Następny odcinek: #${next.epCode} (${next.titleEn})`);
    } else {
      console.log('   Wszystkie 50 odcinków opublikowane.');
    }
    return;
  }

  for (const thumb of [THUMB_EN, THUMB_PL]) {
    if (!fs.existsSync(thumb)) {
      throw new Error(`Brak wymaganej miniatury: ${thumb}`);
    }
  }

  const episode = selectNextEpisode(catalog, state, { epSeq: opts.epSeq });
  if (!episode) {
    console.log('🎉 Wszystkie 50 odcinków What\'s Up Prof? zostały już opublikowane na wszystkich kanałach!');
    return;
  }

  const channelsToRun = opts.channel ? [opts.channel] : TARGET_CHANNELS;
  const epKey = String(episode.seq);
  const existingRec = state.episodes[epKey] || {
    seq: episode.seq,
    epCode: episode.epCode,
    completed: false,
    channels: {}
  };

  const schedule = opts.visibility === 'public'
    ? resolveScheduleForEpisode(existingRec, opts.hours)
    : null;

  console.log(`\n🎬 WHAT'S UP PROF? — Odcinek ${episode.epCode} (seq=${episode.seq}/${catalog.episodes.length})`);
  console.log(`   EN: ${episode.titleEn}`);
  console.log(`   PL: ${episode.titlePl}`);
  console.log(`   Źródło: ${episode.url} (${episode.sizeLabel})`);
  console.log(`   Bufor: ${cacheDir}`);
  console.log(`   Widoczność: ${opts.visibility}${schedule ? ` | Premiera +${opts.hours}h: ${schedule.ymd} ${schedule.time} Europe/Warsaw` : ''}`);
  console.log(`   Kanały (${channelsToRun.length}): ${channelsToRun.join(', ')}\n`);

  if (opts.dryRun) {
    for (const ch of channelsToRun) {
      const meta = buildChannelMetadata(episode, ch);
      const alreadyOk = existingRec.channels[ch]?.status === 'ok';
      console.log(`  [DRY-RUN] ${ch}${alreadyOk ? ' (już OK w stanie)' : ''}:`);
      console.log(`    Tytuł (${meta.title.length}/100): ${meta.title}`);
      console.log(`    Miniatura: ${path.basename(meta.thumbnailPath)} (${fs.existsSync(meta.thumbnailPath) ? 'OK' : 'BRAK'})`);
      console.log(`    Język filmu: ${meta.videoLanguage} | Język tytułu/opisu: ${meta.titleDescriptionLanguage}`);
    }
    return;
  }

  checkProfileNotInUse();

  const fileName = buildEpisodeFileName(episode);
  cleanupOldCompletedCache(cacheDir, catalog, state, fileName);
  const videoPath = await downloadEpisodeMp4(episode, cacheDir);

  if (schedule) {
    existingRec.scheduledYmd = schedule.ymd;
    existingRec.scheduledTime = schedule.time;
  }
  state.lastRunAt = new Date().toISOString();
  state.episodes[epKey] = existingRec;
  saveState(state);

  const metaDir = path.join(cacheDir, 'meta');
  fs.mkdirSync(metaDir, { recursive: true });

  for (const ch of channelsToRun) {
    if (existingRec.channels[ch]?.status === 'ok') {
      console.log(`⏭️  Kanał ${ch} już opublikowany dla odc. ${episode.epCode} — pomijam.`);
      continue;
    }

    const chCfg = CHANNELS[ch];
    const meta = buildChannelMetadata(episode, ch);
    const metaPath = path.join(metaDir, `wup_${episode.epCode}_${chCfg.id}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({
      title: meta.title,
      description: meta.description,
      tags: meta.tags
    }, null, 2), 'utf8');

    try {
      const result = await uploadEpisodeToChannel({
        videoPath,
        metaPath,
        channelId: chCfg.id,
        channelName: ch,
        visibility: opts.visibility,
        scheduleYmd: schedule?.ymd,
        scheduleTime: schedule?.time,
        thumbnailPath: meta.thumbnailPath,
        videoLanguage: meta.videoLanguage,
        titleDescriptionLanguage: meta.titleDescriptionLanguage
      });

      existingRec.channels[ch] = {
        status: 'ok',
        channelId: chCfg.id,
        videoUrl: result.videoUrl || '',
        title: meta.title,
        skipped: Boolean(result.skipped),
        publishedAt: new Date().toISOString()
      };
    } catch (err) {
      existingRec.channels[ch] = {
        status: 'error',
        channelId: chCfg.id,
        error: err.message,
        failedAt: new Date().toISOString()
      };
      console.error(`❌ Błąd na kanale ${ch}: ${err.message}`);
    }

    existingRec.completed = isEpisodeFullyPublished(existingRec, TARGET_CHANNELS);
    state.lastRunAt = new Date().toISOString();
    state.episodes[epKey] = existingRec;
    saveState(state);
  }

  existingRec.completed = isEpisodeFullyPublished(existingRec, TARGET_CHANNELS);
  saveState(state);

  const okCount = TARGET_CHANNELS.filter(ch => existingRec.channels[ch]?.status === 'ok').length;
  console.log(`\n📋 Podsumowanie WUP ${episode.epCode}: ${okCount}/${TARGET_CHANNELS.length} kanałów OK (completed=${existingRec.completed}).`);

  if (existingRec.completed && !opts.keepCache && fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
    console.log(`🧹 Usunięto bufor MP4 po pełnej publikacji na 8 kanałach: ${fileName}`);
  }

  if (okCount < channelsToRun.length) {
    process.exitCode = 1;
  }
}

const isEntry = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isEntry) {
  main().catch(err => {
    console.error('💥 Krytyczny błąd pipeline WUP:', err.message);
    process.exit(1);
  });
}
