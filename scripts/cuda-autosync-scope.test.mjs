// @007 2026-11-18 — regresja incydentu: automat „Cuda Każdego Dnia” (run_sync_cuda_daily.js) commitował
// CAŁY indeks wspólnego checkoutu i wypychał cudze przygotowane zmiany pod nazwą „chore(cuda)”
// (3a615286, c4bd3ab0, ef5de9e3). Teraz commit obejmuje wyłącznie pliki Cuda; cudze zmiany zostają w indeksie.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { CUDA_FILES, COMMIT_MSG, commitAndPush, changedCudaFiles } from '../run_sync_cuda_daily.js';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

test('kod: commit tylko z listą plików Cuda; import nie uruchamia procedury', () => {
  const src = fs.readFileSync(new URL('../run_sync_cuda_daily.js', import.meta.url), 'utf8');
  assert.ok(!src.includes("sh('git diff --cached --name-only', dir)"), 'stary błąd: sprawdzanie całego indeksu');
  assert.ok(src.includes("gitIn(dir, ['commit', '-m', COMMIT_MSG, '--', ...files])"), 'commit z jawną listą plików');
  assert.ok(src.includes('if (startedDirectly) main();'), 'import modułu nie uruchamia procedury');
  assert.deepEqual(CUDA_FILES, ['rozwazania_cuda_baza.json', 'cuda_kazdego_dnia_*', 'cuda_kazgo_dnia_current.webp']);
});

test('odtworzenie incydentu 18.11: cudza zmiana w indeksie NIE trafia do commita Cuda', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuda-scope-'));
  try {
    git(dir, 'init', '-q', '-b', 'main');
    git(dir, 'config', 'user.email', 'test@example.invalid');
    git(dir, 'config', 'user.name', 'test');
    git(dir, 'config', 'core.autocrlf', 'false');
    fs.writeFileSync(path.join(dir, 'rozwazania_cuda_baza.json'), '[]');
    fs.writeFileSync(path.join(dir, 'wizytowki.html'), 'v1');
    git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', 'start');

    // Inny agent przygotował (staged) swoją pracę, a automat w tym czasie ma nowe Cuda.
    fs.writeFileSync(path.join(dir, 'wizytowki.html'), 'v2 — praca innego agenta');
    git(dir, 'add', 'wizytowki.html');
    fs.writeFileSync(path.join(dir, 'rozwazania_cuda_baza.json'), '[{"dzien":1}]');
    fs.writeFileSync(path.join(dir, 'cuda_kazdego_dnia_2026-11-18.webp'), 'img');

    assert.equal(commitAndPush(dir, CUDA_FILES, 'test', { push: false }), true);

    const files = git(dir, 'show', '--name-only', '--format=', 'HEAD').split('\n').filter(Boolean).sort();
    assert.deepEqual(files, ['cuda_kazdego_dnia_2026-11-18.webp', 'rozwazania_cuda_baza.json']);
    assert.equal(git(dir, 'log', '-1', '--format=%s'), COMMIT_MSG);
    assert.equal(git(dir, 'diff', '--cached', '--name-only'), 'wizytowki.html', 'cudza zmiana nadal czeka w indeksie');
    assert.equal(git(dir, 'show', 'HEAD:wizytowki.html'), 'v1');
    // brak pliku „cuda_kazgo_dnia_current.webp” (wzorzec bez dopasowania) nie zablokował commita
    assert.deepEqual(changedCudaFiles(dir, CUDA_FILES), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('brak zmian Cuda = brak commita (nawet gdy w indeksie leżą cudze pliki)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuda-scope-'));
  try {
    git(dir, 'init', '-q', '-b', 'main');
    git(dir, 'config', 'user.email', 'test@example.invalid');
    git(dir, 'config', 'user.name', 'test');
    fs.writeFileSync(path.join(dir, 'rozwazania_cuda_baza.json'), '[]');
    fs.writeFileSync(path.join(dir, 'inny.txt'), 'a');
    git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', 'start');
    fs.writeFileSync(path.join(dir, 'inny.txt'), 'b'); git(dir, 'add', 'inny.txt');
    const before = git(dir, 'rev-parse', 'HEAD');
    commitAndPush(dir, CUDA_FILES, 'test', { push: false });
    assert.equal(git(dir, 'rev-parse', 'HEAD'), before);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
