#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { dailyCourseManifest } from './daily-course-manifest.mjs';
import { applyPageStandard } from './cc-page-standard.mjs';
import { renderLumiPage } from './lumi-page.mjs';
import { scanReleaseForSecrets } from './cc-release-secret-scan.mjs';
import { isPublicFile } from './cc-release-files.mjs';
import { sprawdzPliki, plikiLekcji } from './kurs-codzienny/straznik-lekcji.mjs';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, '.pages-release');
const REQUIRED_FILES = [
  'data/ccn-article-routes.js', '_headers', '_redirects', '_worker.js', 'lib/bu-voting-worker.js', 'firebase-messaging-sw.js', 'index.html',
  'semantic-index.html', 'lumina.html', 'lumina-tablica.html', 'manifest-lumina.json', 'robots.txt',
  'js/cc-back-to-top.js', 'js/cc-edge-plus.js', 'components/cc-omni-search.js', 'js/cc-favorites.js',
];
const trackedChanges = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
  cwd: ROOT,
  encoding: 'utf8',
  windowsHide: true,
}).trim();
if (trackedChanges) {
  throw new Error('Wydanie przerwane: pliki kontrolowane przez Git nie są czyste. Najpierw zatwierdź albo wycofaj zmiany.');
}

// Strażnik lekcji KC (@007, 2026-11-03): żadne wydanie z lekcją zawierającą resztki innego dnia.
const niespojneLekcje = sprawdzPliki(ROOT, plikiLekcji(ROOT));
if (niespojneLekcje.length) {
  throw new Error(`Wydanie przerwane — STRAŻNIK LEKCJI KC:\n${niespojneLekcje.map(({ plik, bledy }) => `${plik}: ${bledy.join('; ')}`).join('\n')}`);
}

const resolvedOutput = path.resolve(OUTPUT);
if (path.dirname(resolvedOutput) !== path.resolve(ROOT) || path.basename(resolvedOutput) !== '.pages-release') {
  throw new Error('Nieprawidłowy katalog wydania.');
}
fs.rmSync(resolvedOutput, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
fs.mkdirSync(resolvedOutput, { recursive: true });

const tracked = execFileSync('git', ['ls-files', '-z'], {
  cwd: ROOT,
  encoding: 'utf8',
  windowsHide: true,
  maxBuffer: 32 * 1024 * 1024,
}).split('\0').filter(Boolean);

let copied = 0;
for (const relativePath of tracked) {
  if (!isPublicFile(relativePath)) continue;
  const source = path.resolve(ROOT, relativePath);
  const destination = path.resolve(resolvedOutput, relativePath);
  if (!destination.startsWith(`${resolvedOutput}${path.sep}`)) {
    throw new Error(`Próba wyjścia poza katalog wydania: ${relativePath}`);
  }
  const sourceStat = fs.lstatSync(source);
  if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) {
    throw new Error(`Niedozwolony typ pliku: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (relativePath.toLowerCase().endsWith('.html')) {
    const original = fs.readFileSync(source, 'utf8');
    const standardized = applyPageStandard(relativePath, original);
    if (standardized === original) fs.copyFileSync(source, destination);
    else fs.writeFileSync(destination, standardized);
  } else {
    fs.copyFileSync(source, destination);
  }
  copied++;
}

// Prywatny raport Kalendarza Google (ccMC): poza publicznym repo (.gitignore), ale potrzebny w wydaniu.
// Na stronie publicznie zablokowany w _worker.js (BLOCKED_FILES) — czyta go tylko API po zalogowaniu.
const PRIVATE_RUNTIME_FILES = ['ccMC/gcalendar-live-report.json'];
for (const relativePath of PRIVATE_RUNTIME_FILES) {
  const source = path.resolve(ROOT, relativePath);
  if (!fs.existsSync(source) || !fs.lstatSync(source).isFile()) continue;
  const destination = path.resolve(resolvedOutput, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

// One chat implementation, two entry experiences. Never copy/maintain a fork.
fs.writeFileSync(path.join(resolvedOutput, 'mess.html'), renderLumiPage(fs.readFileSync(path.join(resolvedOutput, 'lumina.html'), 'utf8')));

for (const required of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(resolvedOutput, required))) {
    throw new Error(`Wydanie przerwane: brakuje ${required}.`);
  }
}

const courseManifest = dailyCourseManifest(tracked,file=>fs.readFileSync(path.join(ROOT,file),'utf8'));
fs.mkdirSync(path.join(resolvedOutput,'data'),{recursive:true});
fs.writeFileSync(path.join(resolvedOutput,'data','daily-course-push.json'),JSON.stringify(courseManifest));
scanReleaseForSecrets(resolvedOutput);

console.log(JSON.stringify({ output: resolvedOutput, copied, source: 'tracked-clean-worktree' }, null, 2));
