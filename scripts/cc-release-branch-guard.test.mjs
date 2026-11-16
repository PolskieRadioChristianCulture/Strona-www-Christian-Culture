import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { decide, enforceReleaseBranch } from './cc-release-branch-guard.mjs';

test('bramka gałęzi: decyzje dla wszystkich stanów', () => {
  assert.equal(decide({ branch: 'feat/cc-design-system-2027-pilot', containsMain: true }).action, 'refuse');
  assert.equal(decide({ branch: 'main', containsMain: true }).action, 'ok');
  assert.equal(decide({ branch: '', containsMain: true }).action, 'ok');
  assert.equal(decide({ branch: '', containsMain: false }).action, 'refuse');
  assert.equal(decide({ branch: 'main', containsMain: false, mainContainsHead: true }).action, 'fast-forward');
  assert.equal(decide({ branch: 'main', containsMain: false, mainContainsHead: false }).action, 'rebase');
});

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-guard-'));
  const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const origin = path.join(dir, 'origin.git'); const a = path.join(dir, 'a'); const b = path.join(dir, 'b');
  g(dir, 'init', '--quiet', '--bare', '-b', 'main', origin);
  g(dir, 'clone', '--quiet', origin, a);
  for (const r of [a]) { g(r, 'config', 'user.email', 'test@example.invalid'); g(r, 'config', 'user.name', 'test'); }
  fs.writeFileSync(path.join(a, 'f.txt'), '1'); g(a, 'add', '.'); g(a, 'commit', '--quiet', '-m', 'c1'); g(a, 'push', '--quiet', 'origin', 'main');
  g(dir, 'clone', '--quiet', origin, b);
  g(b, 'config', 'user.email', 'test@example.invalid'); g(b, 'config', 'user.name', 'test');
  return { dir, a, b, g };
}
const quiet = () => {};

test('bramka gałęzi: odtworzenie incydentu 16.11 — wydanie z gałęzi pilota jest zablokowane', () => {
  const { a, g } = sandbox();
  g(a, 'checkout', '--quiet', '-b', 'feat/cc-design-system-2027-pilot');
  assert.throws(() => enforceReleaseBranch(a, {}, quiet), /BRAMKA GAŁĘZI: gałąź „feat\/cc-design-system-2027-pilot”/);
  // Awaryjne wyłączenie tylko świadomie.
  assert.equal(enforceReleaseBranch(a, { CC_RELEASE_BRANCH_GUARD: 'off' }, quiet).action, 'skipped');
});

test('bramka gałęzi: main w tyle za origin/main jest dociągany (fast-forward), a nie wdrażany po staremu', () => {
  const { a, b, g } = sandbox();
  fs.writeFileSync(path.join(b, 'poprawka.txt'), 'fix'); g(b, 'add', '.'); g(b, 'commit', '--quiet', '-m', 'fix'); g(b, 'push', '--quiet', 'origin', 'main');
  assert.equal(enforceReleaseBranch(a, {}, quiet).action, 'fast-forward');
  assert.ok(fs.existsSync(path.join(a, 'poprawka.txt')), 'poprawka z origin/main jest w wydaniu');
});

test('bramka gałęzi: niewysłany commit automatu jest przenoszony na origin/main (rebase), poprawki zostają', () => {
  const { a, b, g } = sandbox();
  fs.writeFileSync(path.join(b, 'poprawka.txt'), 'fix'); g(b, 'add', '.'); g(b, 'commit', '--quiet', '-m', 'fix'); g(b, 'push', '--quiet', 'origin', 'main');
  fs.writeFileSync(path.join(a, 'publikacja.txt'), 'dzien 47'); g(a, 'add', '.'); g(a, 'commit', '--quiet', '-m', 'publikacja');
  assert.equal(enforceReleaseBranch(a, {}, quiet).action, 'rebase');
  assert.ok(fs.existsSync(path.join(a, 'poprawka.txt')) && fs.existsSync(path.join(a, 'publikacja.txt')));
});

test('bramka gałęzi: konflikt przy przenoszeniu = STOP, repo wraca do stanu sprzed próby', () => {
  const { a, b, g } = sandbox();
  fs.writeFileSync(path.join(b, 'f.txt'), 'z poprawki'); g(b, 'commit', '--quiet', '-am', 'fix'); g(b, 'push', '--quiet', 'origin', 'main');
  fs.writeFileSync(path.join(a, 'f.txt'), 'z automatu'); g(a, 'commit', '--quiet', '-am', 'auto');
  assert.throws(() => enforceReleaseBranch(a, {}, quiet), /konflikt/);
  assert.equal(fs.readFileSync(path.join(a, 'f.txt'), 'utf8'), 'z automatu');
  assert.equal(g(a, 'status', '--porcelain'), '');
});

test('build-pages-release uruchamia bramkę gałęzi przed budową', () => {
  const src = fs.readFileSync(new URL('./build-pages-release.mjs', import.meta.url), 'utf8');
  assert.match(src, /import \{ enforceReleaseBranch \} from '\.\/cc-release-branch-guard\.mjs'/);
  assert.ok(src.indexOf('enforceReleaseBranch(ROOT)') < src.indexOf('sprawdzPliki(ROOT'), 'bramka przed resztą budowy');
});
