/**
 * APOKALIPSA — JONATAN DUNKEL: codzienny pipeline (odcinki 4–47).
 * Każdego dnia: pobiera kolejny odcinek (MP3 z Dysku Google), montuje go
 * (oficjalne Intro Apokalipsa + tło pod odcinek), tworzy metadane i planuje
 * premierę za 48 h o 20:00 na kanałach: Osobowość +, Polskie Radio CHRISTIAN CULTURE, Christian Culture TV.
 *
 * Harmonogram: odc. N wgrywany dnia 2026-11-08 + N dni, premiera 2026-11-10 + N dni 20:00
 *   (odc. 1–3 opublikowane ręcznie 11.11: premiery 11, 12, 13.11; odc. 4 → wgranie 12.11, premiera 14.11).
 * Idempotentny: uploader pomija pary plik+kanał już obecne w historii; zaległe dni są nadrabiane.
 * NIE mieszać z projektem „Apokalipsa: Księga Nadziei”.
 *
 * Użycie: node scripts/sds_apokalipsa_daily_pipeline.mjs [--dry-run] [--ep N]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const ASSETS = 'C:/Users/czark/Christian_Culture_Projekty/sds_apokalipsa_assets';
const STATE_FILE = path.join(ROOT, 'data/sds_apokalipsa_yt_state.json');
const EPISODES_CATALOG = path.join(ROOT, 'data/sds_apokalipsa_catalog.json');
const WORK = path.join(ASSETS, 'work');
const OUT_DIR = path.join(ASSETS, 'odcinki');
const INTRO = path.join(ASSETS, 'Intro Apokalipsa.mp4');
const BG = path.join(ASSETS, 'tlo_pod_odcinek_apokalipsa.png');
const INTRO_1080 = path.join(WORK, 'intro_1080p.mp4');
const CHANNELS = ['Osobowość +', 'Polskie Radio CHRISTIAN CULTURE', 'Christian Culture TV'];
const ANCHOR_UPLOAD = '2026-11-08'; // odc. N wgrywany ANCHOR + N dni
const FIRST_AUTO_EP = 4;

for (const d of [WORK, OUT_DIR, path.join(ASSETS, 'meta'), path.dirname(STATE_FILE)]) fs.mkdirSync(d, { recursive: true });

export function getEpisodesList() {
  return fs.existsSync(EPISODES_CATALOG) ? JSON.parse(fs.readFileSync(EPISODES_CATALOG, 'utf8')) : [];
}
export function getState() {
  return fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : { lastPublishedEpisode: 3, history: [] };
}
export function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

const warsawToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dayDiff = (a, b) => Math.round((new Date(`${a}T12:00:00Z`) - new Date(`${b}T12:00:00Z`)) / 86400000);
export const uploadDayFor = n => addDays(ANCHOR_UPLOAD, n);
export const premiereDayFor = n => addDays(ANCHOR_UPLOAD, n + 2);

const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
  .replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

function ffmpeg(args, desc) {
  console.log(`[FFmpeg] ${desc}`);
  const r = spawnSync('ffmpeg.exe', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${desc} — FFmpeg kod ${r.status}`);
}

async function download(id, target) {
  if (fs.existsSync(target) && fs.statSync(target).size > 1_000_000) return target;
  for (const url of [`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${id}&confirm=t`]) {
    const res = await fetch(url);
    if (res.ok && !(res.headers.get('content-type') || '').includes('text/html')) {
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      if (fs.statSync(target).size > 1_000_000) return target;
    }
  }
  throw new Error(`Nie pobrano MP3 z Dysku Google (ID ${id})`);
}

export async function renderEpisode(ep) {
  const nn = String(ep.ep).padStart(2, '0');
  const out = path.join(OUT_DIR, `Apokalipsa_Jonatan_Dunkel_Odc_${nn}_${slug(ep.title)}.mp4`);
  if (fs.existsSync(out) && fs.statSync(out).size > 10_000_000) return out;
  const mp3 = await download(ep.id, path.join(WORK, `odc_${nn}.mp3`));
  if (!fs.existsSync(INTRO_1080)) {
    ffmpeg(['-i', INTRO, '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30',
      '-c:v', 'h264_mf', '-b:v', '6M', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', INTRO_1080], 'Normalizacja intro');
  }
  const body = path.join(WORK, `body_${nn}.mp4`);
  ffmpeg(['-loop', '1', '-i', BG, '-i', mp3, '-map', '0:v', '-map', '1:a', '-vf', 'scale=1920:1080,fps=30',
    '-c:v', 'h264_mf', '-b:v', '6M', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', body], `Wykład odc. ${nn}`);
  const list = path.join(WORK, `concat_${nn}.txt`);
  fs.writeFileSync(list, `file '${INTRO_1080.replace(/\\/g, '/')}'\nfile '${body.replace(/\\/g, '/')}'\n`);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], `Składanie odc. ${nn}`);
  fs.rmSync(body, { force: true });
  return out;
}

export function writeMeta(ep) {
  const nn = String(ep.ep).padStart(2, '0');
  const metaPath = path.join(ASSETS, 'meta', `ep_${nn}.json`);
  if (fs.existsSync(metaPath)) return metaPath;
  const meta = {
    ep: ep.ep,
    title: `Apokalipsa — Jonatan Dunkel | Rozdział ${ep.ep}: ${ep.title}`.slice(0, 100),
    description: `Seria wykładów Jonatana Dunkla poświęcona Księdze Apokalipsy.\nRozdział ${ep.ep}: ${ep.title}.\n\n` +
      `Rozdziały:\n00:00 - Czołówka serii: Apokalipsa — Jonatan Dunkel\n00:13 - Wykład: ${ep.title}\n\n` +
      `📌 Radio i Słowo Boże na co dzień: https://polskieradio.cc\n📌 Biblia interlinearna: https://polskieradio.cc/mojabiblia\n` +
      `📌 Akademia Biblijna: https://polskieradio.cc/akademia\n\nNowy rozdział codziennie o 20:00.\n` +
      `#Apokalipsa #JonatanDunkel #Biblia #Proroctwa #ChristianCulture`,
    tags: ['Apokalipsa', 'Jonatan Dunkel', ep.title, 'Proroctwa', 'Biblia', 'Pismo Święte', 'Christian Culture']
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  return metaPath;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const forced = args.includes('--ep') ? Number(args[args.indexOf('--ep') + 1]) : null;
  const catalog = getEpisodesList();
  const today = warsawToday();
  const dueMax = Math.min(dayDiff(today, ANCHOR_UPLOAD), catalog.length);
  const state = getState();
  const done = new Set(state.history.filter(h => h.allChannelsOk).map(h => h.ep));
  const due = forced ? [forced] : catalog.map(e => e.ep).filter(n => n >= FIRST_AUTO_EP && n <= dueMax && !done.has(n));

  console.log(`📅 ${today} | odcinki do publikacji: ${due.length ? due.join(', ') : 'brak'}`);
  if (dry) { due.forEach(n => console.log(`  odc. ${n} → premiera ${premiereDayFor(n)} 20:00`)); return; }
  if (!due.length) return;

  const { uploadEpisodeToChannel } = await import('./publish_perfect.mjs');
  const { CHANNELS: KNOWN } = await import('./yt_studio_session.mjs');

  for (const n of due) {
    const ep = catalog.find(e => e.ep === n);
    if (!ep) throw new Error(`Brak odc. ${n} w katalogu`);
    // Premiera nigdy wcześniej niż za 48 h od wgrania (przy nadrabianiu zaległości przesuwa się w przód)
    const ymd = [premiereDayFor(n), addDays(today, 2)].sort().pop();
    const video = await renderEpisode(ep);
    const metaPath = writeMeta(ep);
    const results = [];
    for (const channelName of CHANNELS) {
      try {
        const r = await uploadEpisodeToChannel({ videoPath: video, metaPath, channelId: KNOWN[channelName].id, channelName,
          visibility: 'public', scheduleYmd: ymd, scheduleTime: '20:00' });
        results.push({ channel: channelName, ok: true, url: r.videoUrl });
      } catch (err) {
        results.push({ channel: channelName, ok: false, error: err.message });
      }
    }
    const allChannelsOk = results.every(r => r.ok);
    state.history.push({ ep: n, title: ep.title, premiere: `${ymd} 20:00`, results, allChannelsOk, at: new Date().toISOString() });
    if (allChannelsOk) state.lastPublishedEpisode = Math.max(state.lastPublishedEpisode || 0, n);
    saveState(state);
    console.log(`${allChannelsOk ? '✅' : '⚠️'} Odc. ${n} → premiera ${ymd} 20:00`);
    if (!allChannelsOk) process.exitCode = 1;
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === 'sds_apokalipsa_daily_pipeline.mjs') {
  main().catch(err => { console.error('❌', err.message); process.exit(1); });
}
