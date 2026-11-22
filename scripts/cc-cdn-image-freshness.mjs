#!/usr/bin/env node
// Kontrola na żywo (tylko odczyt): czy CDN podaje te same obrazy co repo (@007, L0 22.11.2026).
// Uruchom po każdym wdrożeniu:  node scripts/cc-cdn-image-freshness.mjs [--all] [--out plik.txt]
//  - domyślnie: obrazy używane przez LUMINA / LUMI MESS; --all: wszystkie obrazy z repo.
//  - kod wyjścia 1 = CDN podaje inną (zwykle starszą, cięższą) wersję; lista adresów do
//    Cloudflare → Caching → Custom Purge (paczki po 30) trafia do pliku --out.
// Nie czyści cache sam — czyszczenie produkcji wymaga zgody L0.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isImagePath, luminaSourceFiles, referencedImages } from './cc-image-freshness-guard.mjs';

const ORIGIN = 'https://polskieradio.cc';
const ROOT = process.cwd();
const args = process.argv.slice(2);
const all = args.includes('--all');
const outIdx = args.indexOf('--out');
const outFile = outIdx !== -1 ? args[outIdx + 1] : null;

const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\n').filter(Boolean);
const images = all
  ? tracked.filter((f) => isImagePath(f) && !/^(node_modules|\.pages-release|_|lumi-kids|docs|scripts)\b/.test(f) && !/\s/.test(f))
  : referencedImages(ROOT, luminaSourceFiles(tracked), new Set(tracked));

async function cdnSize(rel) {
  const url = `${ORIGIN}/${rel.split('/').map(encodeURIComponent).join('/')}`;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (res.status !== 200) return { url, status: res.status };
    return { url, status: 200, size: Number(res.headers.get('content-length')), cache: res.headers.get('cf-cache-status') };
  } catch (err) {
    return { url, status: 0, error: String(err.message || err) };
  }
}

const stale = [];
let checked = 0;
const queue = [...images];
await Promise.all(Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const rel = queue.shift();
    const repo = fs.statSync(path.join(ROOT, rel)).size;
    const r = await cdnSize(rel);
    if (r.status !== 200 || !r.size) continue;
    checked += 1;
    if (r.size !== repo) stale.push({ ...r, rel, repo });
  }
}));

stale.sort((a, b) => b.size - a.size);
for (const s of stale) {
  const hint = s.size > s.repo ? 'CDN cięższy — wyczyść' : 'CDN lżejszy — sprawdź z właścicielem, czy repo nie ma regresu';
  console.log(`NIEAKTUALNE ${s.rel}: CDN ${Math.round(s.size / 1024)} KB (${s.cache}) ≠ repo ${Math.round(s.repo / 1024)} KB — ${hint}`);
}
console.log(`Sprawdzono ${checked} obrazów, nieaktualnych na CDN: ${stale.length}.`);
if (outFile && stale.length) {
  fs.writeFileSync(outFile, `${stale.map((s) => s.url).join('\n')}\n`);
  console.log(`Lista do Custom Purge (po 30 adresów na raz): ${outFile}`);
}
process.exitCode = stale.length ? 1 : 0;
