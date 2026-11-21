#!/usr/bin/env node
/*
 * Fragment GA4 (G-Y4EFTVBPE3) na wszystkich stronach: ruch własny + kluczowe zdarzenia — @007, L0 26.10.2026.
 * 1. gtag('config', …) dostaje traffic_type=internal, gdy:
 *    - urządzenie zespołu oznaczono wejściem na dowolną stronę z ?cc_team=1 (zdejmuje ?cc_team=0),
 *    - strona działa w reżyserce (?in_mcr=1) albo jako źródło przeglądarkowe OBS (window.obsstudio).
 *    Filtr „Internal Traffic” w GA wyklucza takie dane dopiero po przełączeniu go na „Aktywny”.
 * 2. Zaraz po fragmencie GA dołącza /js/cc-analytics.js (zdarzenia radio_play, lesson_view, donate_click…).
 * Skrypt jest powtarzalny: drugi przebieg niczego nie zmienia. Użycie: node scripts/apply-ga-internal-traffic.mjs [--check]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const GA_ID = 'G-Y4EFTVBPE3';
export const ANALYTICS_SRC = '/js/cc-analytics.js?v=20261026_1';
export const INTERNAL_PARAMS = "(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})()";
export const CONFIG_CALL = `gtag('config','${GA_ID}',${INTERNAL_PARAMS})`;
const ANALYTICS_TAG = `<script src="${ANALYTICS_SRC}" defer></script>`;

// Zamrożone kanały nadawcze i prywatne środowiska testowe — tylko do odczytu
export const FROZEN = new Set(['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html', 'test/analityka/index.html']);

const OLD_CONFIG = new RegExp(`gtag\\(\\s*['"]config['"]\\s*,\\s*['"]${GA_ID}['"]\\s*\\)`, 'g');

export function transform(html) {
  if (!html.includes(GA_ID)) return html;
  let out = html.replace(OLD_CONFIG, CONFIG_CALL);
  // Po każdym fragmencie GA (generatory mają po kilka szablonów w jednym pliku)
  let at = out.indexOf(CONFIG_CALL);
  while (at !== -1) {
    const end = out.indexOf('</script>', at);
    if (end === -1) break;
    const cut = end + '</script>'.length;
    if (!out.startsWith(ANALYTICS_TAG, cut)) out = out.slice(0, cut) + ANALYTICS_TAG + out.slice(cut);
    at = out.indexOf(CONFIG_CALL, cut);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const files = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', '*.html'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
  let changed = 0;
  let missing = 0;
  for (const f of files) {
    let src;
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    if (FROZEN.has(f) || !src.includes(GA_ID)) continue;
    const out = transform(src);
    if (!out.includes(CONFIG_CALL) || !out.includes('/js/cc-analytics.js')) { missing++; console.log('POMINIĘTO (nietypowy fragment):', f); }
    if (out !== src) { changed++; if (!check) writeFileSync(f, out); }
  }
  console.log(JSON.stringify({ files: files.length, changed, missing, mode: check ? 'check' : 'write' }));
  if (check && (changed || missing)) process.exitCode = 1;
}
