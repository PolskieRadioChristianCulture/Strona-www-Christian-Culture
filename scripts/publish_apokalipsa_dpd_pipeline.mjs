/**
 * ============================================================================
 * APOKALIPSA DZIEŃ PO DNIU — PIPELINE PUBLIKACJI YOUTUBE (7 KANAŁÓW)
 * 365 codziennych rozważań z Księgi Apokalipsy (Amazing Facts & nadzieja.fm)
 * Licencja: Creative Commons BY-NC-ND 4.0 PL
 * ============================================================================
 *
 * Użycie:
 *   node scripts/publish_apokalipsa_dpd_pipeline.mjs [--ep 1] [--visibility public]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';
import { CHANNELS, BIBLIA_AUDIO_CHANNELS } from './yt_studio_session.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DRIVE_ROOT = 'H:\\Mój dysk\\Apokalipsa Dzień po Dniu';
const CATALOG_PATH = path.join(DRIVE_ROOT, 'LICENCJA_I_KATALOG_365.json');
const THUMBS_DIR = path.join(DRIVE_ROOT, 'Okladki_Kanalow_YT');
const VIDEOS_DIR = path.join(DRIVE_ROOT, 'Odcinki_Wideo_YT');
const STATE_PATH = path.join(ROOT, 'data', 'apokalipsa_dpd_yt_state.json');

const CHANNEL_DEFS = [
  {
    name: 'Biblia Audio Christian Culture',
    thumb: '01_Biblia_Audio_CC_1920x1080.jpg',
    videoFile: '001_Biblia_Audio_CC.mp4',
    titleSuffix: '| Biblia Audio CC',
    hook: 'Codzienna lektura i objaśnienie werset po wersecie'
  },
  {
    name: 'Werset Dnia - Chrześcijański Serwis Biblijny',
    thumb: '02_Werset_Dnia_1920x1080.jpg',
    videoFile: '001_Werset_Dnia.mp4',
    titleSuffix: '| Werset Dnia',
    hook: 'Krótkie rozważanie i Słowo Boże na dziś'
  },
  {
    name: 'Christian Culture TV',
    thumb: '03_Christian_Culture_TV_1920x1080.jpg',
    videoFile: '001_Christian_Culture_TV.mp4',
    titleSuffix: '| Christian Culture TV',
    hook: 'Telewizyjne studium proroctw biblijnych'
  },
  {
    name: 'Polskie Radio CHRISTIAN CULTURE',
    thumb: '04_Polskie_Radio_CC_1920x1080.jpg',
    videoFile: '001_Polskie_Radio_CC.mp4',
    titleSuffix: '| Polskie Radio CC',
    hook: 'Radiowy komentarz biblijny i refleksja dnia'
  },
  {
    name: 'Osobowość +',
    thumb: '05_Osobowosc_Plus_1920x1080.jpg',
    videoFile: '001_Osobowosc_Plus.mp4',
    titleSuffix: '| Osobowość +',
    hook: 'Duchowy rozwój, proroctwa i przetrwanie w czasach ostatecznych'
  },
  {
    name: 'CC Men',
    thumb: '06_CC_Men_1920x1080.jpg',
    videoFile: '001_CC_Men.mp4',
    titleSuffix: '| CC Men',
    hook: 'Męska odwaga, prawda i walka duchowa w świetle Apokalipsy'
  },
  {
    name: 'CC Women',
    thumb: '07_CC_Women_1920x1080.jpg',
    videoFile: '001_CC_Women.mp4',
    titleSuffix: '| CC Women',
    hook: 'Pokój serca, nadzieja i Boża opieka w dniach ostatecznych'
  }
];

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch {}
  }
  return {
    version: '1.0',
    series: 'Apokalipsa Dzień po Dniu (365 Odcinków)',
    license: 'CC BY-NC-ND 4.0 PL',
    episodes: {}
  };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

export async function publishEpisode(epNum = 1, { visibility = 'public', scheduleYmd = null, scheduleTime = null, channelsFilter = null } = {}) {
  const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const ep = cat.episodes.find(e => e.epNum === epNum);
  if (!ep) throw new Error(`Nie znaleziono odcinka #${epNum} w katalogu!`);

  const state = loadState();
  const epKey = String(epNum);
  if (!state.episodes[epKey]) {
    state.episodes[epKey] = {
      epNum,
      title: ep.title,
      channels: {}
    };
  }

  const epDir = path.join(VIDEOS_DIR, String(epNum).padStart(3, '0'));
  const metaDir = path.join(DRIVE_ROOT, 'Meta_YT', String(epNum).padStart(3, '0'));
  fs.mkdirSync(metaDir, { recursive: true });

  if (!scheduleYmd && visibility === 'public') {
    process.env.CC_YT_SCHEDULE_DAYS = '0';
  }

  console.log(`\n========================================================`);
  console.log(`📢 ROZPOCZYNAM PUBLIKACJĘ: Odcinek ${epNum} — ${ep.title}`);
  console.log(`   Widoczność: ${visibility}${scheduleYmd ? ` (Premiera: ${scheduleYmd} ${scheduleTime || '18:00'})` : ' (OD ZARAZ / PUBLICZNY)'}`);
  console.log(`========================================================\n`);

  for (const chDef of CHANNEL_DEFS) {
    const chName = chDef.name;
    if (Array.isArray(channelsFilter) && channelsFilter.length > 0 && !channelsFilter.includes(chName)) {
      continue;
    }
    const chCfg = CHANNELS[chName];
    if (!chCfg) {
      console.warn(`⚠️ Pomijam nieznany kanał: ${chName}`);
      continue;
    }

    if (state.episodes[epKey]?.channels?.[chName]?.status === 'ok') {
      console.log(`⏭️  Kanał "${chName}" jest już opublikowany dla odcinka ${epNum} — pomijam.`);
      continue;
    }

    // Dopasowanie tytułu
    // Maks. 100 znaków w tytule YouTube
    const cleanTitle = ep.title.replace(/\s*#\d+$/, '');
    let ytTitle = `${cleanTitle} ${chDef.titleSuffix}`.trim();
    if (ytTitle.length > 100) {
      ytTitle = ytTitle.slice(0, 100);
    }

    // Dedykowany opis
    const desc = [
      `${ytTitle}`,
      `${chDef.hook}`,
      '',
      `Zajrzyj do starożytnej księgi Apokalipsy! Seria 365 krótkich rozważań pomaga wyjaśnić każdy werset z jej 22 rozdziałów. Audiobook obejmuje wszystkie główne tematy i zagadnienia tekstu w możliwie praktyczny sposób.`,
      '',
      `📌 Prawa autorskie i licencja:`,
      `© 2022 Amazing Facts International. All rights reserved.`,
      `© 2025 nadzieja.fm.`,
      `Licencja: Creative Commons Uznanie autorstwa – Użycie niekomercyjne – Bez utworów zależnych 4.0 Polska (CC BY-NC-ND 4.0 PL)`,
      `https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.pl`,
      '',
      `🌐 Ekosystem Christian Culture:`,
      `• Radio i Portal: https://polskieradio.cc`,
      `• MojaBiblia (przekłady i interlinia): https://polskieradio.cc/mojabiblia`,
      `• Akademia Biblijna: https://polskieradio.cc/akademia`,
      '',
      `#Apokalipsa #ApokalipsaDzienPoDniu #Biblia #PismoSwiete #Proroctwa #JezusChrystus #ChristianCulture #Wiara`
    ].join('\n').slice(0, 5000);

    const tags = [
      'Apokalipsa',
      'Apokalipsa Dzień po Dniu',
      'Biblia',
      'Pismo Święte',
      'Proroctwa',
      'Jezus Chrystus',
      'Koniec Świata',
      'Christian Culture',
      'Rozważania',
      'Audiobook',
      chName
    ];

    const metaPath = path.join(metaDir, `meta_${chCfg.id}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({
      title: ytTitle,
      description: desc,
      tags
    }, null, 2), 'utf8');

    // Plik wideo dedykowany dla tego kanału
    const videoFile = chDef.videoFile.replace(/^001/, String(epNum).padStart(3, '0'));
    const videoPath = path.join(epDir, videoFile);
    const thumbPath = path.join(THUMBS_DIR, chDef.thumb);

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Brak renderu wideo dla kanału ${chName}: ${videoPath}`);
    }

    try {
      const existingDraftId = state.episodes[epKey]?.channels?.[chName]?.draftVideoId || null;
      console.log(`\n>>> [${chName}] ${existingDraftId ? `Dokańczam wersję roboczą (${existingDraftId}) i publikuję...` : 'Przesyłanie wideo i publikacja...'}`);
      const uploadOpts = {
        videoPath,
        metaPath,
        channelId: chCfg.id,
        channelName: chName,
        visibility,
        draftVideoId: existingDraftId,
        thumbnailPath: thumbPath,
        videoLanguage: 'pl',
        titleDescriptionLanguage: 'pl'
      };
      if (scheduleYmd) {
        uploadOpts.scheduleYmd = scheduleYmd;
        uploadOpts.scheduleTime = scheduleTime || '18:00';
      }
      const res = await uploadEpisodeToChannel(uploadOpts);

      state.episodes[epKey].channels[chName] = {
        status: 'ok',
        channelId: chCfg.id,
        videoUrl: res.videoUrl || (existingDraftId ? `https://youtu.be/${existingDraftId}` : ''),
        publishedAt: new Date().toISOString()
      };
      saveState(state);
      console.log(`✅ [${chName}] Sukces: ${state.episodes[epKey].channels[chName].videoUrl || 'Opublikowano'}`);
    } catch (err) {
      console.error(`❌ [${chName}] Błąd publikacji:`, err.message);
      const prevDraft = state.episodes[epKey]?.channels?.[chName]?.draftVideoId || null;
      state.episodes[epKey].channels[chName] = {
        status: 'error',
        channelId: chCfg.id,
        ...(prevDraft ? { draftVideoId: prevDraft } : {}),
        error: err.message,
        failedAt: new Date().toISOString()
      };
      saveState(state);
    }
  }

  console.log(`\n🎉 Zakończono publikację odcinka ${epNum} dla wszystkich kanałów!`);
  return state.episodes[epKey];
}

// Jeśli uruchomiono bezpośrednio z CLI
if (process.argv[1] && process.argv[1].includes('publish_apokalipsa_dpd_pipeline')) {
  const args = process.argv.slice(2);
  let ep = 1;
  let vis = 'public';
  let scheduleYmd = null;
  let scheduleTime = null;
  let channelsFilter = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ep' && args[i + 1]) ep = Number(args[++i]);
    if (args[i] === '--visibility' && args[i + 1]) vis = args[++i];
    if (args[i] === '--schedule-ymd' && args[i + 1]) scheduleYmd = args[++i];
    if (args[i] === '--schedule-time' && args[i + 1]) scheduleTime = args[++i];
    if (args[i] === '--channels' && args[i + 1]) {
      channelsFilter = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  publishEpisode(ep, { visibility: vis, scheduleYmd, scheduleTime, channelsFilter })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
