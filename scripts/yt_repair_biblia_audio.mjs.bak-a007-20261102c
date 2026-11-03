// Naprawa publikacji Biblia Audio na YouTube — @007, 02.11.2026.
// Dla każdego odcinka (4K + Shorts) i każdego kanału docelowego sprawdza stan w Studio:
//   publiczny/zaplanowany → nic;  pełna wersja robocza → dokończ (metadane, zarabianie, premiera);
//   brak lub tylko przerwane wgranie → wgraj ponownie (z czekaniem na koniec przesyłania).
// Duble i przerwane wgrania NIE są usuwane (to robi człowiek) — trafiają do listy w raporcie.
// Użycie: node scripts/yt_repair_biblia_audio.mjs            (plan, nic nie zmienia)
//         node scripts/yt_repair_biblia_audio.mjs --wykonaj  (wykonanie)
import fs from 'node:fs';
import path from 'node:path';
import { inventory } from './yt_studio_inventory.mjs';
import { reconcile } from './yt_reconcile_history.mjs';
import { uploadEpisodeToChannel } from './publish_perfect.mjs';

const GENESIS_DIR = 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju';
const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');
const REPORT_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_repair_report.json');
const PRIMARY = ['Biblia Audio Christian Culture', 'Werset Dnia - Chrześcijański Serwis Biblijny'];
const EXECUTE = process.argv.includes('--wykonaj');

export function episodes(dir = GENESIS_DIR) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.endsWith('_Biblia_Audio_CC_4K.mp4')).map(f => {
    const prefix = f.replace('_Biblia_Audio_CC_4K.mp4', '');
    const [, ch, rest] = prefix.match(/^Ksiega_Rodzaju_(\d+)_(.+)$/) || [];
    const shorts = `${prefix}_Biblia_Audio_CC_Shorts_9x16.mp4`;
    const meta4k = `${prefix}_metadata.json`;
    const metaShorts = `${prefix}_Biblia_Audio_CC_Shorts_9x16_meta.json`;
    const title = JSON.parse(fs.readFileSync(path.join(dir, meta4k), 'utf8')).title || '';
    return {
      prefix, chapter: Number(ch), order: Number(ch) * 100 + (parseInt(rest, 10) || 0),
      key: title.split(' (UBG)')[0].trim(), // np. „Księga Rodzaju 1:1-19”
      files: {
        videos: { video: path.join(dir, f), meta: path.join(dir, meta4k) },
        shorts: files.includes(shorts) && files.includes(metaShorts) ? { video: path.join(dir, shorts), meta: path.join(dir, metaShorts) } : null
      }
    };
  }).sort((a, b) => a.order - b.order);
}

// Stan odcinka na kanale na podstawie spisu Studio (dopasowanie po tytule „Księga Rodzaju N:x-y (UBG)”).
export function stateOf(rows, ep, tab) {
  const mine = rows.filter(v => v.tab === tab && v.title.startsWith(`${ep.key} (UBG)`));
  const status = v => {
    const row = `${v.visibility} ${v.rowText}`.toLowerCase();
    if (/anuluj przesyłanie|przesłano \d+%/.test(row)) return 'broken';
    if (/wersja robocza/.test(row)) return 'draft';
    if (/zaplanowan|premiera/.test(row)) return 'scheduled';
    if (/publiczn/.test(v.visibility.toLowerCase())) return 'public';
    return 'other';
  };
  const withStatus = mine.map(v => ({ id: v.id, title: v.title, status: status(v) }));
  const live = withStatus.find(v => v.status === 'public' || v.status === 'scheduled');
  const draft = withStatus.find(v => v.status === 'draft' && v.id);
  const action = live ? 'ok' : draft ? 'complete-draft' : 'upload';
  const keep = live || (action === 'complete-draft' ? draft : null);
  const extras = withStatus.filter(v => v !== keep); // duble / przerwane — do usunięcia przez człowieka
  return { action, keep, extras };
}

export function targetChannels(history, ep) {
  const set = new Set(PRIMARY);
  for (const p of history.published) if (p.videoFile.startsWith(ep.prefix + '_')) set.add(p.channel);
  return [...set];
}

async function main() {
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  const eps = episodes();
  const channels = [...new Set(eps.flatMap(ep => targetChannels(history, ep)))];
  console.log(`Spis Studio: ${channels.join(', ')}`);
  const inv = await inventory(channels);
  reconcile(history, inv);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');

  const rowsBy = Object.fromEntries(inv.filter(c => !c.error).map(c => [c.channel, c.videos || []])); // brak spisu kanału = zablokowany, nigdy „wgraj”
  const plan = [];
  for (const ep of eps) for (const ch of targetChannels(history, ep)) for (const tab of ['videos', 'shorts']) {
    const f = ep.files[tab];
    if (!f) continue;
    if (!rowsBy[ch]) { plan.push({ ep: ep.prefix, key: ep.key, channel: ch, tab, action: 'blocked', reason: 'brak spisu kanału', toDelete: [] }); continue; }
    const s = stateOf(rowsBy[ch], ep, tab);
    plan.push({ ep: ep.prefix, key: ep.key, channel: ch, tab, action: s.action, keepId: s.keep?.id || null, toDelete: s.extras, file: f });
  }
  const count = a => plan.filter(p => p.action === a).length;
  console.log(`PLAN: ok=${count('ok')}, dokończ wersję roboczą=${count('complete-draft')}, wgraj=${count('upload')}, zablokowane=${count('blocked')}`);
  for (const p of plan.filter(p => p.action !== 'ok')) console.log(`  ${p.action.padEnd(14)} ${p.channel} | ${p.key} | ${p.tab}${p.keepId ? ` | ${p.keepId}` : ''}`);

  const results = [];
  if (EXECUTE) {
    // kolejno: rozdziały rosnąco (premiery w kolejności), jeden Playwright naraz
    for (const p of plan.filter(p => p.action === 'complete-draft' || p.action === 'upload')) {
      // Dokończenie wersji roboczej jest bezpieczne do powtórzenia (nic nie wgrywa) — Studio bywa niestabilne, więc do 5 prób.
      const tries = p.action === 'complete-draft' ? 5 : 1;
      for (let a = 1; a <= tries; a++) {
        try {
          const r = await uploadEpisodeToChannel({ videoPath: p.file.video, metaPath: p.file.meta, channelName: p.channel, draftVideoId: p.action === 'complete-draft' ? p.keepId : null });
          results.push({ ...p, file: undefined, result: r.skipped ? 'pominięte (historia)' : 'zaplanowane', videoUrl: r.videoUrl, attempts: a });
          break;
        } catch (e) {
          console.error(`❌ [próba ${a}/${tries}] ${p.channel} | ${p.key} | ${p.tab}: ${e.message.split('\n')[0]}`);
          if (a === tries) results.push({ ...p, file: undefined, result: 'BŁĄD', error: e.message, attempts: a });
        }
      }
    }
  }
  const toDelete = plan.flatMap(p => (p.toDelete || []).map(v => ({ channel: p.channel, tab: p.tab, ...v, studioUrl: v.id ? `https://studio.youtube.com/video/${v.id}/edit` : null })));
  fs.writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), executed: EXECUTE, plan: plan.map(p => ({ ...p, file: undefined })), results, toDelete }, null, 2), 'utf8');
  console.log(`Do usunięcia ręcznie (duble/przerwane): ${toDelete.length}. Raport: ${REPORT_FILE}`);
}

if (process.argv[1] && path.basename(process.argv[1]) === 'yt_repair_biblia_audio.mjs') await main();
