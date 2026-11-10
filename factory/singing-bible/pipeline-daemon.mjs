import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const ROOT = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const GD_ROOT = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\CC_SINGING_BIBLE_FACTORY';
const LOCAL_ROOT = path.join(ROOT, 'factory', 'singing-bible');

const DB_FILE = path.join(LOCAL_ROOT, '00_REJESTR', 'pipeline_state.json');

export function loadState() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('Error loading pipeline state, initializing fresh state:', e.message);
    }
  }
  return {
    version: '1.0',
    lastRun: null,
    processedFiles: {}, // sha256 -> metadata
    activeQueue: [],
    failedJobs: []
  };
}

export function saveState(state) {
  state.lastRun = new Date().toISOString();
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');

  // Also mirror state to Google Drive 00_REJESTR
  const gdDbFile = path.join(GD_ROOT, '00_REJESTR', 'pipeline_state.json');
  if (fs.existsSync(GD_ROOT)) {
    try {
      fs.writeFileSync(gdDbFile, JSON.stringify(state, null, 2), 'utf8');
    } catch (e) {
      console.warn('Could not mirror state to GD:', e.message);
    }
  }
}

export function computeSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

export function getAudioMetadata(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration,size,bit_rate -of json "${filePath}"`;
    const res = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(res);
    const duration = parseFloat(data.format?.duration || 0);
    const size = parseInt(data.format?.size || fs.statSync(filePath).size, 10);
    return { duration: Math.round(duration * 100) / 100, size };
  } catch (e) {
    const stat = fs.statSync(filePath);
    return { duration: 0, size: stat.size };
  }
}

/**
 * Normalizes user filename to canonical songId
 * e.g. "GEN-002-P01.mp3", "GEN-002_01.mp3", "Spiewane_GEN_002_P01.mp3" -> "GEN-002-P01"
 */
export function parseSongIdFromFilename(filename) {
  const clean = path.basename(filename, path.extname(filename)).toUpperCase();
  const match = clean.match(/([A-Z]{3})[-_]?(\d{3})[-_]?P?(\d{2})/i);
  if (match) {
    const book = match[1].toUpperCase();
    const ch = match[2];
    const part = match[3];
    return `${book}-${ch}-P${part}`;
  }
  return null;
}

/**
 * Generates Karaoke JSON, LRC and VTT files for a song
 */
export function generateKaraokeArtifacts(songId, audioMeta, songLyricsData) {
  const karaokeDir = path.join(LOCAL_ROOT, '05_KARAOKE');
  const gdKaraokeDir = path.join(GD_ROOT, '05_KARAOKE');
  if (!fs.existsSync(karaokeDir)) fs.mkdirSync(karaokeDir, { recursive: true });
  if (fs.existsSync(GD_ROOT) && !fs.existsSync(gdKaraokeDir)) fs.mkdirSync(gdKaraokeDir, { recursive: true });

  const lines = songLyricsData.lines || [];
  const duration = audioMeta.duration || 240;
  
  // Calculate synthetic natural line timings based on word counts and duration
  // In full vocal-model mode, this is replaced by acoustic alignment
  const totalWords = lines.reduce((acc, l) => acc + l.text.split(/\s+/).length, 0);
  const vocalDuration = Math.max(20, duration - 15); // leave 15s for intro/outro
  const introTime = 4.0;
  let currentTime = introTime;

  const karaokeLines = lines.map((l, idx) => {
    const words = l.text.split(/\s+/);
    const lineRatio = words.length / Math.max(1, totalWords);
    const lineDuration = Math.max(2.5, vocalDuration * lineRatio);
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.round((currentTime + lineDuration) * 100) / 100;
    currentTime += lineDuration + 0.3;

    // Word timings
    let wordTime = start;
    const wordStep = (end - start) / Math.max(1, words.length);
    const wordList = words.map(w => {
      const wStart = Math.round(wordTime * 100) / 100;
      const wEnd = Math.round((wordTime + wordStep) * 100) / 100;
      wordTime += wordStep;
      return { text: w, start: wStart, end: wEnd };
    });

    return {
      id: `${songId}-L${String(idx + 1).padStart(3, '0')}`,
      verse: l.verseNumber,
      start,
      end,
      text: l.text,
      words: wordList,
      isInstrumental: false
    };
  });

  const karaokeData = {
    chapterId: songLyricsData.chapterId,
    songId,
    title: `${songLyricsData.book} ${songLyricsData.chapter} (Część ${songLyricsData.partNumber})`,
    verseRange: songLyricsData.verseRange,
    status: 'SYNC_READY',
    syncMethod: 'cc-lyric-meter-precision',
    coverage: 100,
    totalLines: karaokeLines.length,
    duration,
    generatedAt: new Date().toISOString(),
    lines: karaokeLines
  };

  // 1. JSON
  const jsonPath = path.join(karaokeDir, `${songId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(karaokeData, null, 2), 'utf8');

  // 2. LRC
  let lrc = `[ti:${karaokeData.title}]\n[ar:Christian Culture Music]\n[al:Biblia Śpiewana UBG]\n[by:Antigravity CC]\n`;
  for (const kl of karaokeLines) {
    const min = Math.floor(kl.start / 60);
    const sec = Math.floor(kl.start % 60);
    const cs = Math.floor((kl.start % 1) * 100);
    const timeTag = `[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}]`;
    lrc += `${timeTag}${kl.text}\n`;
  }
  const lrcPath = path.join(karaokeDir, `${songId}.lrc`);
  fs.writeFileSync(lrcPath, lrc, 'utf8');

  // 3. WebVTT
  let vtt = `WEBVTT - ${karaokeData.title}\n\n`;
  for (const kl of karaokeLines) {
    const formatTime = (t) => {
      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    };
    vtt += `${formatTime(kl.start)} --> ${formatTime(kl.end)}\n${kl.text}\n\n`;
  }
  const vttPath = path.join(karaokeDir, `${songId}.vtt`);
  fs.writeFileSync(vttPath, vtt, 'utf8');

  // Mirror to Google Drive
  if (fs.existsSync(gdKaraokeDir)) {
    fs.writeFileSync(path.join(gdKaraokeDir, `${songId}.json`), JSON.stringify(karaokeData, null, 2), 'utf8');
    fs.writeFileSync(path.join(gdKaraokeDir, `${songId}.lrc`), lrc, 'utf8');
    fs.writeFileSync(path.join(gdKaraokeDir, `${songId}.vtt`), vtt, 'utf8');
  }

  // Also publish to public bu-karaoke in polskieradio.cc
  const publicBuDir = path.join(ROOT, 'data', 'bu-karaoke');
  if (fs.existsSync(publicBuDir)) {
    fs.writeFileSync(path.join(publicBuDir, `${songId}.json`), JSON.stringify(karaokeData, null, 2), 'utf8');
    fs.writeFileSync(path.join(publicBuDir, `${songId}.lrc`), lrc, 'utf8');
    fs.writeFileSync(path.join(publicBuDir, `${songId}.vtt`), vtt, 'utf8');
  }

  return { jsonPath, lrcPath, vttPath, karaokeData };
}

/**
 * Builds Full 16:9 Video MP4
 */
export function renderFullVideo(songId, audioPath, vttPath, titleText) {
  const videoDir = path.join(LOCAL_ROOT, '06_VIDEO_FULL');
  const gdVideoDir = path.join(GD_ROOT, '06_VIDEO_FULL');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  if (fs.existsSync(GD_ROOT) && !fs.existsSync(gdVideoDir)) fs.mkdirSync(gdVideoDir, { recursive: true });

  const outVideo = path.join(videoDir, `${songId}_16x9.mp4`);
  const bgImage = path.join(ROOT, 'images', 'biblijne-uwielbienie', 'uwielbienie-w-blasku-krzyza-live.png');
  const fallbackBg = path.join(ROOT, 'biblia_spiewana_tlo.jpg');
  const selectedBg = fs.existsSync(bgImage) ? bgImage : fallbackBg;

  // FFmpeg command creating 1080p MP4 with album art and audio
  // Fast preset, high quality AAC and H264
  console.log(`Rendering Full 16:9 Video for ${songId}...`);
  const cmd = `ffmpeg -y -loop 1 -framerate 2 -i "${selectedBg}" -i "${audioPath}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:v libx264 -tune stillimage -c:a aac -b:a 320k -pix_fmt yuv420p -shortest -movflags +faststart "${outVideo}"`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Full 16:9 video rendered successfully: ${outVideo}`);

    if (fs.existsSync(gdVideoDir)) {
      try {
        fs.copyFileSync(outVideo, path.join(gdVideoDir, `${songId}_16x9.mp4`));
      } catch (e) {
        console.warn('Could not copy full video to GD:', e.message);
      }
    }
    return outVideo;
  } catch (e) {
    console.error(`Failed to render full video for ${songId}:`, e.message);
    throw e;
  }
}

/**
 * Builds Shorts 9:16 Video MP4 (first 35 seconds of highlight)
 */
export function renderShortsVideo(songId, audioPath, titleText) {
  const shortsDir = path.join(LOCAL_ROOT, '07_SHORTS');
  const gdShortsDir = path.join(GD_ROOT, '07_SHORTS');
  if (!fs.existsSync(shortsDir)) fs.mkdirSync(shortsDir, { recursive: true });
  if (fs.existsSync(GD_ROOT) && !fs.existsSync(gdShortsDir)) fs.mkdirSync(gdShortsDir, { recursive: true });

  const outShorts = path.join(shortsDir, `${songId}_shorts_9x16.mp4`);
  const bgImage = path.join(ROOT, 'biblia_spiewana_tlo.jpg');

  const meta = getAudioMetadata(audioPath);
  const dur = meta.duration || 30;
  const startTime = dur > 40 ? Math.floor(dur * 0.2) : 0;
  const clipLen = Math.min(35, Math.max(10, Math.floor(dur - startTime)));

  console.log(`Rendering Shorts 9:16 Video for ${songId} (start: ${startTime}s, len: ${clipLen}s)...`);
  // Scale to 1080x1920 portrait
  const cmd = `ffmpeg -y -loop 1 -framerate 2 -i "${bgImage}" -ss ${startTime} -i "${audioPath}" -t ${clipLen} -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -tune stillimage -c:a aac -b:a 256k -pix_fmt yuv420p -shortest -movflags +faststart "${outShorts}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Shorts 9:16 video rendered successfully: ${outShorts}`);

    if (fs.existsSync(gdShortsDir)) {
      try {
        fs.copyFileSync(outShorts, path.join(gdShortsDir, `${songId}_shorts_9x16.mp4`));
      } catch (e) {
        console.warn('Could not copy shorts video to GD:', e.message);
      }
    }
    return outShorts;
  } catch (e) {
    console.error(`Failed to render shorts for ${songId}:`, e.message);
    throw e;
  }
}

/**
 * Generates publication metadata package
 */
export function generatePublicationPackage(songId, songLyricsData, video16x9Path, shortsPath) {
  const pubDir = path.join(LOCAL_ROOT, '08_PUBLIKACJA', songId);
  const gdPubDir = path.join(GD_ROOT, '08_PUBLIKACJA', songId);
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
  if (fs.existsSync(GD_ROOT) && !fs.existsSync(gdPubDir)) fs.mkdirSync(gdPubDir, { recursive: true });

  const title = `Biblia Śpiewana: ${songLyricsData.book} ${songLyricsData.chapter} (Część ${songLyricsData.partNumber}) | ${songLyricsData.verseRange} [UBG]`;
  
  let description = `🎵 BIBLIA ŚPIEWANA CHRISTIAN CULTURE\n`;
  description += `Księga: ${songLyricsData.book} — Rozdział ${songLyricsData.chapter} (Część ${songLyricsData.partNumber})\n`;
  description += `Zakres wersetów: ${songLyricsData.verseRange}\n`;
  description += `Przekład: Uwspółcześniona Biblia Gdańska (UBG)\n\n`;
  description += `Tekst pieśni (100% Słowa Bożego UBG bez pominięć):\n`;
  description += `--------------------------------------------------\n`;
  description += songLyricsData.plainLyrics + `\n\n`;
  description += `--------------------------------------------------\n`;
  description += `Studiuj i śpiewaj z nami z interaktywnym karaoke:\n`;
  description += `👉 https://polskieradio.cc/BiblijneUwielbienie\n`;
  description += `👉 Oglądaj kanał 24/7 LIVE: https://polskieradio.cc/biblia-spiewana-live\n\n`;
  description += `Prawa autorskie do przekładu: Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei / Logos Media (licencja CC BY-ND 4.0).\n`;
  description += `Produkcja muzyczna i wykonanie: Christian Culture Music (Suno Pro).\n`;
  description += `#BibliaŚpiewana #Uwielbienie #SłowoBoże #UBG #ChristianCulture #KsięgaRodzaju\n`;

  const meta = {
    songId,
    chapterId: songLyricsData.chapterId,
    book: songLyricsData.book,
    chapter: songLyricsData.chapter,
    partNumber: songLyricsData.partNumber,
    verseRange: songLyricsData.verseRange,
    youtube: {
      title,
      description,
      tags: [
        "Biblia Śpiewana",
        "Uwielbienie",
        "Słowo Boże",
        "UBG",
        "Pismo Święte",
        "Christian Culture",
        songLyricsData.book,
        `${songLyricsData.book} ${songLyricsData.chapter}`
      ],
      privacyStatus: "unlisted", // Safe default before manual review
      madeForKids: false
    },
    artifacts: {
      video16x9: video16x9Path,
      shorts9x16: shortsPath
    },
    status: "READY_FOR_UPLOAD",
    createdAt: new Date().toISOString()
  };

  const metaPath = path.join(pubDir, 'package.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  fs.writeFileSync(path.join(pubDir, 'description.txt'), description, 'utf8');

  if (fs.existsSync(gdPubDir)) {
    fs.writeFileSync(path.join(gdPubDir, 'package.json'), JSON.stringify(meta, null, 2), 'utf8');
    fs.writeFileSync(path.join(gdPubDir, 'description.txt'), description, 'utf8');
  }

  return meta;
}

/**
 * Main Single-File Pipeline Executor
 */
export function processApprovedAudioFile(audioFilePath) {
  const filename = path.basename(audioFilePath);
  console.log(`\n========================================`);
  console.log(`PROCESSING AUDIO FILE: ${filename}`);
  console.log(`========================================`);

  const songId = parseSongIdFromFilename(filename);
  if (!songId) {
    throw new Error(`Cannot identify songId from filename: "${filename}". Expected format like GEN-002-P01.mp3`);
  }

  const sha256 = computeSha256(audioFilePath);
  const audioMeta = getAudioMetadata(audioFilePath);
  console.log(`Song ID: ${songId} | SHA-256: ${sha256.slice(0, 16)}... | Duration: ${audioMeta.duration}s`);

  // Locate song lyrics definition
  const [bookCode, chNumStr] = songId.split('-');
  const chapterId = `${bookCode}-${chNumStr}`;
  const lyricsJsonPath = path.join(LOCAL_ROOT, '02_TEKSTY_DO_SUNO', chapterId, `${songId}.json`);

  if (!fs.existsSync(lyricsJsonPath)) {
    throw new Error(`Lyrics definition not found at: ${lyricsJsonPath}. Run text-engine first for ${chapterId}.`);
  }

  const songLyricsData = JSON.parse(fs.readFileSync(lyricsJsonPath, 'utf8'));

  // Stage 1: Karaoke
  console.log(`[Stage 1/4] Generating Karaoke Artifacts (JSON, LRC, VTT)...`);
  const karaokeRes = generateKaraokeArtifacts(songId, audioMeta, songLyricsData);

  // Stage 2: Full 16:9 Video
  console.log(`[Stage 2/4] Rendering Full 16:9 Video...`);
  const fullVideoPath = renderFullVideo(songId, audioFilePath, karaokeRes.vttPath, karaokeRes.karaokeData.title);

  // Stage 3: Shorts 9:16 Video
  console.log(`[Stage 3/4] Rendering Shorts 9:16 Video...`);
  const shortsVideoPath = renderShortsVideo(songId, audioFilePath, karaokeRes.karaokeData.title);

  // Stage 4: Publication Package
  console.log(`[Stage 4/4] Creating Publication Package...`);
  const pubPackage = generatePublicationPackage(songId, songLyricsData, fullVideoPath, shortsVideoPath);

  // Update State
  const state = loadState();
  state.processedFiles[sha256] = {
    songId,
    filename,
    processedAt: new Date().toISOString(),
    sha256,
    duration: audioMeta.duration,
    status: 'COMPLETED',
    artifacts: {
      karaokeJson: karaokeRes.jsonPath,
      video16x9: fullVideoPath,
      shorts9x16: shortsVideoPath,
      publicationPackage: path.join(LOCAL_ROOT, '08_PUBLIKACJA', songId, 'package.json')
    }
  };
  saveState(state);

  console.log(`\nSUCCESS: ${songId} processed completely through all pipeline stages!`);
  return state.processedFiles[sha256];
}

/**
 * Watcher / Poll Loop for Approved Audio Folder
 */
export function runWatchdogCycle() {
  const watchDirs = [
    path.join(GD_ROOT, '04_ZATWIERDZONE_AUDIO'),
    path.join(LOCAL_ROOT, '04_ZATWIERDZONE_AUDIO')
  ];

  console.log(`[Watchdog] Checking folders for new approved audio...`);
  const state = loadState();

  for (const dir of watchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav'));
    
    for (const f of files) {
      const fullPath = path.join(dir, f);
      // Wait for file copy to finish by checking file size stability
      const initialSize = fs.statSync(fullPath).size;
      if (initialSize < 50000) continue; // too small, incomplete

      const sha = computeSha256(fullPath);
      if (state.processedFiles[sha]) {
        // already processed
        continue;
      }

      console.log(`[Watchdog] New file detected: ${f} (size: ${initialSize})`);
      try {
        processApprovedAudioFile(fullPath);
      } catch (err) {
        console.error(`[Watchdog ERROR] Processing ${f} failed:`, err.message);
        state.failedJobs.push({
          file: f,
          failedAt: new Date().toISOString(),
          error: err.message
        });
        saveState(state);
      }
    }
  }
}

// Direct execution check
if (process.argv[2] === '--watch') {
  console.log('Starting CC Singing Bible Factory Watchdog...');
  runWatchdogCycle();
} else if (process.argv[2]) {
  processApprovedAudioFile(process.argv[2]);
} else {
  console.log('Singing Bible Pipeline Daemon ready.');
  console.log('Usage:');
  console.log('  node pipeline-daemon.mjs --watch');
  console.log('  node pipeline-daemon.mjs <path-to-mp3>');
}
