// Uzgadnia data/youtube_published_history.json z rzeczywistym stanem YouTube Studio — @007, 02.11.2026.
// Każdy wpis dostaje studioStatus: public | scheduled | draft | broken (przerwane wgranie) | missing | private | unlisted
// oraz studioChannel (kanał, na którym film NAPRAWDĘ jest). Wpisy draft/broken/missing nie blokują ponownego wgrania.
// Użycie: node scripts/yt_reconcile_history.mjs [inventory.json ...]   (bez argumentów — sam robi spis Studio)
import fs from 'node:fs';
import path from 'node:path';

const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');

export function studioStatusOf(v) {
  const row = `${v.visibility} ${v.restrictions} ${v.rowText}`.toLowerCase();
  if (/anuluj przesyłanie|przesłano \d+%|cancel upload/.test(row)) return 'broken';
  if (/wersja robocza|draft/.test(v.visibility.toLowerCase()) || v.draft) return 'draft';
  if (/zaplanowan|scheduled|premiera|premiere/.test(row)) return 'scheduled';
  if (/publiczn|public/.test(v.visibility.toLowerCase())) return 'public';
  if (/niepubliczn|unlisted/.test(v.visibility.toLowerCase())) return 'unlisted';
  if (/prywatn|private/.test(v.visibility.toLowerCase())) return 'private';
  return 'unknown';
}

const idOf = url => ((url || '').match(/(?:youtu\.be\/|shorts\/|v=|video\/)([\w-]{11})/) || [])[1] || null;

export function reconcile(history, inventories) {
  const byId = new Map();
  for (const ch of inventories) for (const v of ch.videos || []) if (v.id) byId.set(v.id, { ...v, channel: ch.channel });
  const checked = new Set(inventories.filter(c => !c.error).map(c => c.channel));
  const summary = {};
  for (const e of history.published) {
    const id = idOf(e.videoUrl);
    const found = id && byId.get(id);
    if (found) {
      e.studioStatus = studioStatusOf(found);
      e.studioChannel = found.channel;
    } else if (checked.has(e.channel)) {
      e.studioStatus = 'missing';
      e.studioChannel = null;
    } else continue;
    e.studioCheckedAt = new Date().toISOString();
    const k = `${e.channel} → ${e.studioStatus}${e.studioChannel && e.studioChannel !== e.channel ? ` (NAPRAWDĘ na: ${e.studioChannel})` : ''}`;
    summary[k] = (summary[k] || 0) + 1;
  }
  return summary;
}

if (process.argv[1] && path.basename(process.argv[1]) === 'yt_reconcile_history.mjs') {
  let inventories;
  if (process.argv.length > 2) inventories = process.argv.slice(2).flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  else inventories = await (await import('./yt_studio_inventory.mjs')).inventory();
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  fs.copyFileSync(HISTORY_FILE, `${HISTORY_FILE}.bak-reconcile-${new Date().toISOString().slice(0, 10)}`);
  const summary = reconcile(history, inventories);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  console.table(summary);
}
