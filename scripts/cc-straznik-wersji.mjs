#!/usr/bin/env node
// Strażnik wersji produkcji (@007, polecenie L0 17.11.2026: „Nie wolno nikomu cofać wersji”).
//
// Co kilka minut (Harmonogram zadań Windows: CC_A007_StraznikWersji) sprawdza stronę NA ŻYWO.
// Działa niezależnie od tego, kto i jakim skryptem wdrożył — łapie każde cofnięcie chronionej strony.
//   • wszystko aktualne → jedna linia w dzienniku, koniec;
//   • cofnięta wersja → alarm w Skrzynce + (z --restore) ponowne wdrożenie z czystego origin/main
//     przez build-pages-release (bramka gałęzi + chronione strony) — najwyżej raz na 30 min,
//     drugi raz w ciągu 30 min = tylko alarm (żeby nie „przeciągać liny” z innym automatem).
//
// Użycie: node scripts/cc-straznik-wersji.mjs [--restore] [--dry-run]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTECTED_PAGES, missingMarkers } from './cc-protected-pages.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(process.env.CC_STRAZNIK_REPO || path.join(__dirname, '..'));
const RELEASE_TREE = path.resolve(process.env.CC_STRAZNIK_TREE || path.join(REPO, '..', '_cc-straznik-wydanie'));
const STATE_DIR = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'cc-straznik-wersji');
const STATE = path.join(STATE_DIR, 'stan.json');
const LOG = path.join(STATE_DIR, 'dziennik.log');
const SKRZYNKA = process.env.CC_SKRZYNKA_CLI || 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/skrzynka.mjs';
const RESTORE_COOLDOWN_MS = 30 * 60 * 1000;
const args = new Set(process.argv.slice(2));

fs.mkdirSync(STATE_DIR, { recursive: true });
const now = new Date();
const log = (msg) => { const line = `${now.toISOString()} ${msg}`; console.log(line); fs.appendFileSync(LOG, line + '\n'); };
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; } };
const writeState = (s) => fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 15 * 60 * 1000, shell: /\.cmd$/i.test(cmd) });

/** Sprawdza chronione strony na żywo. Zwraca listę problemów. */
export async function checkLive(pages = PROTECTED_PAGES, fetchImpl = fetch) {
  const problems = [];
  for (const page of pages) {
    const url = `${page.url}${page.url.includes('?') ? '&' : '?'}straznik=${Date.now()}`;
    try {
      const res = await fetchImpl(url, { headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'CC-Straznik-Wersji/1.0' }, redirect: 'follow' });
      if (!res.ok) { problems.push(`${page.url}: HTTP ${res.status}`); continue; }
      const missing = missingMarkers(page, await res.text());
      if (missing.length) problems.push(`${page.url}: na żywo brak znaczników aktualnej wersji (${missing.join(', ')}) — cofnięta wersja`);
    } catch (e) {
      problems.push(`${page.url}: brak odpowiedzi (${String(e.message).split('\n')[0]})`);
    }
  }
  return problems;
}

function alarm(temat, tresc) {
  try {
    run(process.execPath, [SKRZYNKA, 'wyslij', '--od', 'claude', '--do', 'wszyscy', '--typ', 'raport', '--wymaga-dowodcy', '--temat', temat, '--tresc', tresc], path.dirname(SKRZYNKA));
    log('ALARM wysłany do Skrzynki');
  } catch (e) { log(`ALARM nie wysłany: ${String(e.message).split('\n')[0]}`); }
}

function restoreFromMain() {
  if (!fs.existsSync(RELEASE_TREE)) {
    run('git', ['fetch', '--quiet', 'origin', 'main'], REPO);
    run('git', ['worktree', 'add', '--detach', RELEASE_TREE, 'origin/main'], REPO);
  }
  run('git', ['fetch', '--quiet', 'origin', 'main'], RELEASE_TREE);
  run('git', ['checkout', '--quiet', '--detach', 'origin/main'], RELEASE_TREE);
  const nm = path.join(RELEASE_TREE, 'node_modules');
  // Bez node_modules (zależności budowania) — tylko dowiązanie; NIGDY nie usuwać drzewa z dowiązaniem (lekcja 01.11).
  if (!fs.existsSync(nm)) run('cmd', ['/c', 'mklink', '/J', nm, path.join(REPO, 'node_modules')], RELEASE_TREE);
  const head = run('git', ['log', '--oneline', '-1'], RELEASE_TREE).trim();
  run(process.execPath, ['scripts/build-pages-release.mjs'], RELEASE_TREE);
  run('npx.cmd', ['wrangler', 'pages', 'deploy', '.pages-release', '--project-name', 'polskieradio', '--branch', 'main', '--commit-dirty=true'], RELEASE_TREE);
  return head;
}

async function main() {
  const problems = await checkLive();
  const state = readState();
  if (!problems.length) {
    log(`OK — ${PROTECTED_PAGES.length} chronione strony aktualne`);
    writeState({ ...state, lastOk: now.toISOString() });
    return 0;
  }
  log(`COFNIĘCIE/BŁĄD: ${problems.join(' | ')}`);
  const lastRestore = state.lastRestore ? Date.parse(state.lastRestore) : 0;
  const canRestore = args.has('--restore') && !args.has('--dry-run') && now.getTime() - lastRestore > RESTORE_COOLDOWN_MS;
  let wynik = 'Bez automatycznego przywrócenia (tryb tylko alarm lub przerwa 30 min po poprzednim przywróceniu).';
  if (canRestore) {
    try {
      const head = restoreFromMain();
      writeState({ ...state, lastRestore: now.toISOString() });
      const after = await checkLive();
      wynik = after.length ? `Przywrócenie z origin/main (${head}) WYKONANE, ale nadal problem: ${after.join(' | ')}` : `PRZYWRÓCONO wersję z origin/main (${head}). Strony znowu aktualne.`;
      log(wynik);
    } catch (e) {
      wynik = `Przywrócenie NIEUDANE: ${String(e.message).split('\n').slice(0, 3).join(' ')}`;
      log(wynik);
    }
  }
  if (!args.has('--dry-run')) {
    alarm('🛑 STRAŻNIK WERSJI: produkcja cofnęła chronioną stronę', [
      `Czas: ${now.toISOString()}. Strażnik wersji produkcji (@007, polecenie L0 17.11.2026: nie wolno cofać wersji).`,
      '', '**Wykryto:**', ...problems.map((p) => `- ${p}`), '', `**Działanie:** ${wynik}`, '',
      'Przyczyna zwykle: wdrożenie z drzewa, które nie zawiera origin/main. Przed każdym wdrożeniem: `git fetch origin && git pull --rebase origin main`, wdrażać tylko przez `node scripts/build-pages-release.mjs` (bramka gałęzi + chronione strony).',
    ].join('\n'));
  }
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code)).catch((e) => { log(`BŁĄD STRAŻNIKA: ${e.message}`); process.exit(2); });
}
