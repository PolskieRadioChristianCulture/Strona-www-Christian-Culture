import fs from 'node:fs';
import path from 'node:path';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';

const DIR = 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju';
const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');

// Pozostałe 11 pozycji do dokończenia harmonogramu:
const PLAN = [
  // 1. Christian Culture TV
  ['Ksiega_Rodzaju_4_1-26',  'Christian Culture TV',           ['shorts']],
  ['Ksiega_Rodzaju_7_1-24',  'Christian Culture TV',           ['4k', 'shorts']],

  // 2. Polskie Radio CHRISTIAN CULTURE
  ['Ksiega_Rodzaju_5_1-32',  'Polskie Radio CHRISTIAN CULTURE', ['4k', 'shorts']],
  ['Ksiega_Rodzaju_8_1-22',  'Polskie Radio CHRISTIAN CULTURE', ['4k', 'shorts']],

  // 3. Osobowość +
  ['Ksiega_Rodzaju_6_1-22',  'Osobowość +',                    ['4k', 'shorts']],
  ['Ksiega_Rodzaju_10_1-32', 'Osobowość +',                    ['4k', 'shorts']],
];

function isAlreadyPublished(videoFile, channelName) {
  if (!fs.existsSync(HISTORY_FILE)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    return data.published.some(p => p.videoFile === videoFile && p.channel === channelName);
  } catch {
    return false;
  }
}

function findFiles(prefix) {
  const files = fs.readdirSync(DIR);
  const pick = (fn) => { const f = files.find(fn); return f ? path.join(DIR, f) : null; };
  return {
    v4k:    pick(f => f.startsWith(prefix) && f.endsWith('_4K.mp4')),
    shorts: pick(f => f.startsWith(prefix) && f.includes('Shorts') && f.endsWith('.mp4')),
    meta:   pick(f => f.startsWith(prefix) && f.endsWith('_metadata.json'))
  };
}

function shortsMeta(metaPath, shortsPath) {
  let base = {};
  try { base = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
  const out = path.join(path.dirname(shortsPath), `${path.basename(shortsPath, '.mp4')}_meta.json`);
  const title = `${(base.title || path.basename(shortsPath, '.mp4')).replace(/\[4K UHD\]?/g, '').trim()} #Shorts`.slice(0, 100);
  fs.writeFileSync(out, JSON.stringify({
    title,
    description: `${base.description || ''}\n\n#Shorts #BibliaAudio #PismoŚwięte #UBG #Wiara #Bóg #Jezus`,
    tags: ['Shorts', 'Biblia Audio', 'Pismo Święte', 'Słowo Boże', 'UBG', 'Wiara', 'Bóg', 'Jezus']
  }, null, 2), 'utf8');
  return out;
}

const results = [];
let idx = 0;
const total = PLAN.reduce((a, [,,fmts]) => a + fmts.length, 0);

for (const [prefix, channel, formats] of PLAN) {
  const f = findFiles(prefix);
  for (const fmt of formats) {
    idx++;
    console.log(`\n========================================================`);
    console.log(`[${idx}/${total}] ${prefix} → ${channel} (${fmt.toUpperCase()})`);
    console.log(`========================================================`);

    const video = fmt === '4k' ? f.v4k : f.shorts;
    if (!video || !f.meta) {
      console.warn(`  ⚠️ Brak pliku, pomijam.`);
      results.push({ prefix, channel, fmt, status: 'BRAK PLIKU' });
      continue;
    }

    const videoFileName = path.basename(video);
    if (isAlreadyPublished(videoFileName, channel)) {
      console.log(`  ⏩ Film ${videoFileName} na kanale "${channel}" jest już w bazie historii. Pomijam.`);
      results.push({ prefix, channel, fmt, status: 'JUŻ OPUDLIKOWANY' });
      continue;
    }

    const meta = fmt === '4k' ? f.meta : shortsMeta(f.meta, video);
    try {
      const r = await uploadEpisodeToChannel({
        videoPath: video,
        metaPath: meta,
        channelId: 'switcher',
        channelName: channel,
        visibility: 'public'
      });
      results.push({ prefix, channel, fmt, status: 'OK', url: r.videoUrl || '(link w Studio)' });
    } catch (err) {
      console.error(`  ❌ BŁĄD: ${err.message.split('\n')[0]}`);
      results.push({ prefix, channel, fmt, status: 'BŁĄD', error: err.message.split('\n')[0] });
    }

    // Odczekaj 6 sekund na stabilizację sesji
    await new Promise(r => setTimeout(r, 6000));
  }
}

console.log('\n================ PODSUMOWANIE DYSTRYBUCJI ================');
for (const r of results) {
  console.log(`${r.status.padEnd(16)} | ${r.channel.padEnd(34)} | ${r.prefix} | ${r.fmt.toUpperCase().padEnd(6)} | ${r.url || r.error || ''}`);
}

const reportPath = 'data/thematic_distribution_report.json';
fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
console.log(`\n📄 Raport zapisany do: ${reportPath}`);
