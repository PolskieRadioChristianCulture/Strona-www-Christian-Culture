// @007 2026-11-17 — regresja incydentu „cofnięta /ccwomen”: żadne wydanie ani wdrożenie nie może cofnąć chronionej strony.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTECTED_PAGES, checkProtectedPages, enforceProtectedPages, missingMarkers } from './cc-protected-pages.mjs';
import { checkLive } from './cc-straznik-wersji.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('aktualne drzewo: wszystkie chronione strony mają znaczniki aktualnej wersji', () => {
  for (const page of PROTECTED_PAGES) {
    assert.deepEqual(missingMarkers(page, read(page.file)), [], page.file);
  }
});

test('odtworzenie incydentu 17.11: stara /ccwomen w drzewie i w wydaniu = odmowa wydania', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-protected-'));
  const rel = path.join(tmp, '.pages-release');
  const oldPage = '<!doctype html><title>CC Women TV — Oficjalna wizytówka i telewizja 24/7</title><iframe id="tvIframe"></iframe>';
  for (const dir of [tmp, rel]) {
    fs.mkdirSync(path.join(dir, 'ccwomen'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'ccwomen', 'index.html'), oldPage);
  }
  const pages = PROTECTED_PAGES.filter((p) => p.file === 'ccwomen/index.html');
  const errors = checkProtectedPages({ root: tmp, releaseDir: rel, pages });
  assert.ok(errors.some((e) => /brak znaczników/.test(e)), errors.join('\n'));
  assert.throws(() => enforceProtectedPages({ root: tmp, releaseDir: rel, pages }), /CHRONIONE STRONY/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('aktualna wersja przechodzi; brak strony w wydaniu = odmowa', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-protected-'));
  const rel = path.join(tmp, '.pages-release');
  const pages = PROTECTED_PAGES.filter((p) => p.file === 'ccwomen/index.html');
  fs.mkdirSync(path.join(tmp, 'ccwomen'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'ccwomen', 'index.html'), read('ccwomen/index.html'));
  fs.mkdirSync(rel, { recursive: true });
  assert.ok(checkProtectedPages({ root: tmp, releaseDir: rel, pages }).some((e) => /brak w katalogu wydania/.test(e)));
  fs.mkdirSync(path.join(rel, 'ccwomen'), { recursive: true });
  fs.copyFileSync(path.join(tmp, 'ccwomen', 'index.html'), path.join(rel, 'ccwomen', 'index.html'));
  assert.deepEqual(checkProtectedPages({ root: tmp, releaseDir: rel, pages }), []);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('strażnik wersji wykrywa cofnięcie na żywo (bez sieci — udawana odpowiedź serwera)', async () => {
  const current = Object.fromEntries(PROTECTED_PAGES.map((p) => [p.url, read(p.file)]));
  const fakeFetch = (stale) => async (url) => {
    const base = url.split('?')[0];
    const body = stale && base.includes('ccwomen') ? '<title>CC Women TV — stara wersja</title>' : current[base];
    return { ok: true, status: 200, text: async () => body };
  };
  assert.deepEqual(await checkLive(PROTECTED_PAGES, fakeFetch(false)), []);
  const problems = await checkLive(PROTECTED_PAGES, fakeFetch(true));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /ccwomen.*cofnięta wersja/);
});

test('oba skrypty wdrożeniowe mają bramkę gałęzi i ochronę chronionych stron', () => {
  const build = read('scripts/build-pages-release.mjs');
  const safe = read('scripts/safe_pages_deploy.mjs');
  for (const [name, src] of [['build-pages-release', build], ['safe_pages_deploy', safe]]) {
    assert.match(src, /enforceReleaseBranch\(ROOT\)/, `${name}: brak bramki gałęzi`);
    assert.match(src, /enforceProtectedPages\(\{ root: ROOT, releaseDir: /, `${name}: brak ochrony chronionych stron`);
  }
  assert.doesNotMatch(safe, /polskieradio\.cc\\\\\.pages-release/, 'safe_pages_deploy nie może wdrażać paczki z innego drzewa');
  assert.ok(safe.indexOf('enforceReleaseBranch(ROOT)') < safe.indexOf("execSync('npx.cmd wrangler"), 'bramka przed wdrożeniem');
});
