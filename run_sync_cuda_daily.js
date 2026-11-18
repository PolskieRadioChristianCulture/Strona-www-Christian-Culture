import { execSync, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zasady bezpieczeństwa wdrożenia (@007, 26.10.2026, po incydencie 05:15: wdrożenie nieaktualnego
// katalogu roboczego cofnęło produkcję do 25.10):
// 1. przed commitem lokalny main dogania origin/main (pull --rebase --autostash);
// 2. bez udanego push do origin NIE MA wdrożenia;
// 3. wdrażamy wyłącznie czysty pakiet z plików śledzonych (scripts/build-pages-release.mjs),
//    nigdy katalogu roboczego („wrangler pages deploy .”), i tylko gdy HEAD == origin/main.
// 4. (@007, 18.11.2026, incydent: automat wciągał do „chore(cuda)” przygotowane zmiany innych agentów —
//    3a615286, c4bd3ab0, ef5de9e3) ustalamy listę faktycznie zmienionych plików Cuda (`git status -- <wzorce>`),
//    dodajemy je po nazwach i commitujemy tylko je (`git commit -- <pliki>`); cudzy indeks zostaje nietknięty.
//    (`git add` z kilkoma wzorcami przerywa się w całości, gdy któryś nie pasuje — dlatego najpierw lista.)
export const CUDA_FILES = ['rozwazania_cuda_baza.json', 'cuda_kazdego_dnia_*', 'cuda_kazgo_dnia_current.webp'];
export const COMMIT_MSG = 'chore(cuda): auto-sync Cuda Kazdego Dnia';

const gitIn = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });

/** Zmienione pliki pasujące do wzorców (zmodyfikowane, nowe, usunięte; z `force` także ignorowane). */
export function changedCudaFiles(dir, patterns, { force = false } = {}) {
  const args = ['status', '--porcelain=v1', '-z', '-uall'];
  if (force) args.push('--ignored=matching');
  const out = gitIn(dir, [...args, '--', ...patterns]);
  const files = new Set();
  const parts = out.split('\0').filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const code = parts[i].slice(0, 2), file = parts[i].slice(3);
    if (code[0] === 'R' || code[0] === 'C') i++; // następny element to stara nazwa
    if (code === '!!' && !force) continue;
    files.add(file);
  }
  return [...files].sort();
}

/** Commit WYŁĄCZNIE wskazanych plików Cuda. Zwraca listę zatwierdzonych plików (pustą, gdy nic się nie zmieniło). */
export function commitCudaOnly(dir, patterns, { force = false } = {}) {
  const files = changedCudaFiles(dir, patterns, { force });
  if (!files.length) return [];
  gitIn(dir, ['add', '-A', ...(force ? ['-f'] : []), '--', ...files]);
  gitIn(dir, ['commit', '-m', COMMIT_MSG, '--', ...files]);
  return files;
}

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  try {
    fs.appendFileSync(path.join(__dirname, 'run_sync_cuda_daily.log'), line, 'utf8');
  } catch (e) {}
}

const sh = (cmd, cwd = __dirname) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }).toString().trim();

// Commit plików Cuda i push do origin; zwraca true tylko gdy origin/main zawiera commit.
// push:false = tylko commit (używane w teście regresji na tymczasowym repozytorium).
export function commitAndPush(dir, paths, name, { force = false, push = true } = {}) {
  if (sh('git branch --show-current', dir) !== 'main') {
    log(`⛔ ${name}: katalog nie jest na gałęzi main — pomijam commit i push.`);
    return false;
  }
  if (push) sh('git fetch origin', dir);
  const committed = commitCudaOnly(dir, paths, { force });
  if (committed.length) log(`📝 ${name}: commit tylko plików Cuda (${committed.length}): ${committed.slice(0, 5).join(', ')}${committed.length > 5 ? '…' : ''}`);
  if (!push) return true;
  try {
    sh('git pull --rebase --autostash origin main', dir);
  } catch (e) {
    try { sh('git rebase --abort', dir); } catch (_) {}
    throw e;
  }
  sh('git push origin HEAD:main', dir);
  sh('git fetch origin', dir);
  const pushed = sh('git rev-parse HEAD', dir) === sh('git rev-parse origin/main', dir);
  log(pushed ? `✅ ${name}: pchnięto do origin/main.` : `⛔ ${name}: HEAD różni się od origin/main po push.`);
  return pushed;
}

function deployCleanRelease() {
  const head = sh('git rev-parse HEAD');
  if (head !== sh('git rev-parse origin/main')) {
    log('⛔ Deploy pominięty: lokalny HEAD nie jest równy origin/main.');
    return;
  }
  if (sh('git status --porcelain --untracked-files=no')) {
    log('⛔ Deploy pominięty: w katalogu są niezatwierdzone zmiany plików śledzonych (pakiet nie byłby czysty). Zmiana Cuda jest w origin/main i wejdzie z najbliższym wdrożeniem.');
    return;
  }
  const out = path.join(__dirname, '.pages-release');
  try {
    log('☁️ Buduję czysty pakiet i wdrażam na Cloudflare Pages...');
    sh('node scripts/build-pages-release.mjs');
    const deploy = `npx.cmd --yes wrangler pages deploy .pages-release --project-name polskieradio --branch main --commit-hash ${head}`;
    if (process.env.CC_CUDA_DRY_RUN === '1') { log(`[próba] ${deploy}`); return; } // test bez wdrożenia
    sh(deploy);
    log(`✅ Cloudflare Pages wdrożone (${head.slice(0, 8)}).`);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function main() {
  log("🚀 Rozpoczynam automatyczną procedurę synchronizacji Cuda Każdego Dnia...");
  try {
    const { syncCudaDaily } = await import('./sync_cuda_kazdego_dnia.js');
    const res = await syncCudaDaily();
    log(`Wynik synchronizacji: published=${res?.published}, success=${res?.success}`);

    // Sprawdź stan git w polskieradio.cc
    const gitStatus = sh('git status --porcelain');
    const hasCudaChanges = /cuda_kazdego_dnia|cuda_kazgo_dnia|rozwazania_cuda_baza\.json/i.test(gitStatus);

    if (hasCudaChanges || (res && res.published > 0)) {
      log("📦 Wykryto zmiany w Cuda Każdego Dnia — rozpoczynam wersjonowanie i deploy...");

      let pushed = false;
      try {
        pushed = commitAndPush(__dirname, CUDA_FILES, 'polskieradio.cc');
        if (pushed) {
          try {
            sh('git push lumina-repo HEAD:main');
            log("✅ Pchnięto zmiany polskieradio.cc do lumina-repo/main.");
          } catch (lrErr) {
            log(`⚠️ lumina-repo push: ${lrErr.message}`);
          }
        }
      } catch (gitErr) {
        log(`⚠️ Błąd git commit/push polskieradio.cc: ${gitErr.message}`);
      }

      if (pushed) {
        try {
          deployCleanRelease();
        } catch (cfErr) {
          log(`⚠️ Błąd Cloudflare Pages deploy: ${cfErr.message}`);
        }
      } else {
        log('⛔ Deploy pominięty: zmiany nie trafiły do origin/main.');
      }

      // Sync repo Christian-Culture-Web-App
      const ccWebAppDir = path.resolve(__dirname, '..', 'Christian-Culture-Web-App');
      if (fs.existsSync(ccWebAppDir)) {
        try {
          const status = sh('git status --porcelain', ccWebAppDir);
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            commitAndPush(ccWebAppDir, ['public/rozwazania_cuda_baza.json', 'public/cuda_kazdego_dnia_*'], 'Christian-Culture-Web-App', { force: true });
          }
        } catch (e) {
          log(`⚠️ Błąd sync Christian-Culture-Web-App: ${e.message}`);
        }
      }

      // Sync repo cclite.pl
      const ccliteDir = path.resolve(__dirname, '..', 'cclite.pl');
      if (fs.existsSync(ccliteDir)) {
        try {
          const status = sh('git status --porcelain', ccliteDir);
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            commitAndPush(ccliteDir, ['public/rozwazania_cuda_baza.json'], 'cclite.pl', { force: true });
          }
        } catch (e) {
          log(`⚠️ Błąd sync cclite.pl: ${e.message}`);
        }
      }

    } else {
      log("ℹ️ Brak nowych zmian w Cuda Każdego Dnia, git push i deploy pominięty.");
    }
  } catch (err) {
    process.exitCode = 1;
    log(`❌ Błąd krytyczny procedury: ${err.message}`);
  }
  log("🏁 Zakończono automatyczną procedurę synchronizacji Cuda Każdego Dnia.");
}

// Procedura startuje tylko przy bezpośrednim uruchomieniu (import w teście jej nie odpala).
const startedDirectly = !!process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === __filename.toLowerCase();
if (startedDirectly) main();
