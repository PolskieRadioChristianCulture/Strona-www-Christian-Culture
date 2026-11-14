#!/usr/bin/env node
/**
 * Bezpieczne wdrożenie Cloudflare Pages (.pages-release) z bramką integralności Zero-QA.
 * 1. Buduje pełny katalog .pages-release z plików śledzonych przez Git (z applyPageStandard, renderLumiPage, dailyCourseManifest i scanReleaseForSecrets).
 * 2. Blokuje wdrożenie, jeśli paczka ma mniej niż 7000 plików lub brakuje kluczowych stron nadawczych.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dailyCourseManifest } from './daily-course-manifest.mjs';
import { applyPageStandard } from './cc-page-standard.mjs';
import { renderLumiPage } from './lumi-page.mjs';
import { scanReleaseForSecrets } from './cc-release-secret-scan.mjs';
import { isPublicFile } from './cc-release-files.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PARENT = path.resolve(ROOT, '..');
const RELEASE_DIR = path.join(ROOT, '.pages-release');

const CRITICAL_FILES = [
  'data/ccn-article-routes.js',
  '_headers',
  '_redirects',
  '_worker.js',
  'lib/bu-voting-worker.js',
  'firebase-messaging-sw.js',
  'index.html',
  'master-live.html',
  'nadawaj.html',
  'biblia-spiewana-live.html',
  'spiewajmy-panu-live.html',
  'zapolske-live.html',
  'semantic-index.html',
  'lumina.html',
  'lumina-tablica.html',
  'manifest-lumina.json',
  'robots.txt',
  'js/cc-back-to-top.js',
  'js/cc-edge-plus.js',
  'components/cc-omni-search.js',
  'js/cc-favorites.js'
];

console.log('📦 Budowanie pełnego wydania w .pages-release...');
fs.rmSync(RELEASE_DIR, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
fs.mkdirSync(RELEASE_DIR, { recursive: true });

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
  if (!fs.existsSync(source)) continue;
  const destination = path.resolve(RELEASE_DIR, relativePath);
  if (!destination.startsWith(`${RELEASE_DIR}${path.sep}`)) {
    throw new Error(`Próba wyjścia poza katalog wydania: ${relativePath}`);
  }
  const sourceStat = fs.lstatSync(source);
  if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) continue;
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

const PRIVATE_RUNTIME_FILES = ['ccMC/gcalendar-live-report.json'];
for (const relativePath of PRIVATE_RUNTIME_FILES) {
  const source = path.resolve(ROOT, relativePath);
  if (!fs.existsSync(source) || !fs.lstatSync(source).isFile()) continue;
  const destination = path.resolve(RELEASE_DIR, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.writeFileSync(path.join(RELEASE_DIR, 'mess.html'), renderLumiPage(fs.readFileSync(path.join(RELEASE_DIR, 'lumina.html'), 'utf8')));

const courseManifest = dailyCourseManifest(tracked, file => fs.readFileSync(path.join(ROOT, file), 'utf8'));
fs.mkdirSync(path.join(RELEASE_DIR, 'data'), { recursive: true });
fs.writeFileSync(path.join(RELEASE_DIR, 'data', 'daily-course-push.json'), JSON.stringify(courseManifest));

scanReleaseForSecrets(RELEASE_DIR);

if (copied < 7000) {
  console.error(`❌ BLOKADA WDROŻENIA: katalog .pages-release zawiera tylko ${copied} plików (wymagane >= 7000).`);
  process.exit(1);
}

for (const rel of CRITICAL_FILES) {
  const full = path.join(RELEASE_DIR, rel);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
    console.error(`❌ BLOKADA WDROŻENIA: brak wymaganego pliku krytycznego w .pages-release: ${rel}`);
    process.exit(1);
  }
}

console.log(`✅ Bramka integralności zaliczona (${copied} plików w .pages-release, wszystkie pliki krytyczne obecne).`);
execSync('npx.cmd wrangler pages deploy "polskieradio.cc\\.pages-release" --project-name polskieradio --branch main --commit-dirty=true', {
  cwd: PARENT,
  stdio: 'inherit'
});
