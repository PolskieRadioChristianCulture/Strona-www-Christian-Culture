import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { isPublicFile } from './cc-release-files.mjs';

const componentSrc = await readFile(new URL('../components/cc-infolinia-nadzieja-modal.js', import.meta.url), 'utf8');
const testPageHtml = await readFile(new URL('../test/infolinia-nadzieja/index.html', import.meta.url), 'utf8');
const pageStandardSrc = await readFile(new URL('../scripts/cc-page-standard.mjs', import.meta.url), 'utf8');

test('cc-infolinia-nadzieja-modal.js parses cleanly and avoids innerHTML', () => {
  const res = spawnSync(process.execPath, ['--input-type=commonjs', '--check'], {
    input: componentSrc,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(res.status, 0, res.stderr);
  assert.ok(!componentSrc.includes('.innerHTML'), 'Component must build DOM safely without innerHTML');
});

test('component contains exact required Christian Culture NADZIEJA message, tagline, CTAs, and medical disclaimer', () => {
  for (const snippet of [
    'Infolinia NADZIEJA',
    'CHRISTIAN CULTURE',
    'Ponadwyznaniowy wolontariat chrześcijański',
    'Drogi Przyjacielu!',
    'inicjatywą społeczną prowadzoną przez chrześcijańskich wolontariuszy',
    'Nasza posługa ma charakter ponadwyznaniowy i nie reprezentuje żadnego konkretnego Kościoła ani związku wyznaniowego.',
    'Z szacunkiem i życzliwością przyjmujemy każdego człowieka',
    'Jesteśmy tutaj, aby Cię wysłuchać, wesprzeć i nieść nadzieję. ❤️',
    'Rozumiem – przejdź do połączenia',
    'Wróć do strony',
    'Ponad podziałami. Blisko człowieka. W duchu Chrystusa.',
    'nie zastępuje profesjonalnej pomocy medycznej, psychologicznej ani służb ratunkowych',
    '112',
    '+48 730 958 583',
    '#FF7A00',
  ]) {
    assert.ok(componentSrc.includes(snippet), `Missing required copy/token: ${snippet}`);
  }
});

test('component implements mandatory confirmation and full WCAG accessibility controls', () => {
  for (const a11y of [
    "setAttribute('role', 'dialog')",
    "setAttribute('aria-modal', 'true')",
    'aria-labelledby',
    'aria-describedby',
    'aria-live',
    'inert',
    'ccInfoliniaAck',
    'proceedBtn.disabled = true',
    "e.key === 'Escape'",
    "e.key === 'Tab'",
  ]) {
    assert.ok(componentSrc.includes(a11y), `Missing accessibility requirement: ${a11y}`);
  }
});

test('test environment page is noindex, allowed in release, and NOT yet wired into global cc-page-standard.mjs', () => {
  assert.match(testPageHtml, /noindex,\s*nofollow/i);
  assert.ok(testPageHtml.includes('/components/cc-infolinia-nadzieja-modal.js'));
  assert.equal(isPublicFile('test/infolinia-nadzieja/index.html'), true);
  assert.equal(isPublicFile('components/cc-infolinia-nadzieja-modal.js'), true);
  assert.equal(pageStandardSrc.includes('cc-infolinia-nadzieja-modal.js'), false, 'Stage 1 test-only deploy must wait for owner approval before global rollout');
});
