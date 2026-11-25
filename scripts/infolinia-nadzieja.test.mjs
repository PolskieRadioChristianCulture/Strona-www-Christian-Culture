import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { isPublicFile } from './cc-release-files.mjs';
import { applyPageStandard, INFOLINIA_NADZIEJA_SCRIPT } from './cc-page-standard.mjs';

const componentSrc = await readFile(new URL('../components/cc-infolinia-nadzieja-modal.js', import.meta.url), 'utf8');
const publicPageHtml = await readFile(new URL('../infolinia-nadzieja/index.html', import.meta.url), 'utf8');

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

test('applyPageStandard injects and pins Infolinia NADZIEJA script globally without touching frozen channels', () => {
  const baseHtml = '<html><head><title>Test</title></head><body><h1>Test</h1></body></html>';
  const standardized = applyPageStandard('index.html', baseHtml);
  assert.ok(standardized.includes(INFOLINIA_NADZIEJA_SCRIPT), 'Missing global INFOLINIA_NADZIEJA_SCRIPT on index.html');
  assert.equal(applyPageStandard('index.html', standardized), standardized, 'applyPageStandard must remain idempotent');

  const withOldVersion = '<html><head></head><body><script defer src="/components/cc-infolinia-nadzieja-modal.js?v=old"></script></body></html>';
  const refreshed = applyPageStandard('o-nas.html', withOldVersion);
  assert.equal((refreshed.match(/cc-infolinia-nadzieja-modal\.js/g) || []).length, 1, 'Script tag must not be duplicated');
  assert.ok(refreshed.includes(INFOLINIA_NADZIEJA_SCRIPT), 'Version tag should refresh cleanly');

  const frozenHtml = '<html><head></head><body><p>Live</p></body></html>';
  for (const frozen of ['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html', 'zapolske-live.html', 'the-journal/index.html']) {
    assert.equal(applyPageStandard(frozen, frozenHtml), frozenHtml, `Frozen/exempt page altered: ${frozen}`);
  }
});

test('public canonical page /infolinia-nadzieja/ meets CC release standards and temporary test preview is removed', () => {
  assert.match(publicPageHtml, /<meta\s+name="robots"\s+content="index,\s*follow"/i);
  assert.ok(publicPageHtml.includes('https://polskieradio.cc/infolinia-nadzieja/'));
  assert.ok(publicPageHtml.includes('Ponad podziałami. Blisko człowieka. W duchu Chrystusa.'));
  assert.ok(publicPageHtml.includes('#FF7A00'));
  assert.ok(publicPageHtml.includes('tel:112'));
  assert.ok(publicPageHtml.includes('/components/cc-infolinia-nadzieja-modal.js?v=20261125_in3'));
  assert.ok(publicPageHtml.includes('3HBUoJDujVY'));
  assert.ok(publicPageHtml.includes('VideoObject'));
  assert.ok(publicPageHtml.includes('infoliniaPageVideoPlay'));
  assert.equal(isPublicFile('infolinia-nadzieja/index.html'), true);
  assert.equal(isPublicFile('components/cc-infolinia-nadzieja-modal.js'), true);
  assert.equal(isPublicFile('test/infolinia-nadzieja/index.html'), false);
  assert.equal(fs.existsSync(new URL('../test/infolinia-nadzieja/index.html', import.meta.url)), false, 'Temporary test preview must be cleaned up');
});

test('YouTube video 3HBUoJDujVY is embedded cleanly in the shared modal and resets on close', () => {
  for (const token of [
    '3HBUoJDujVY',
    'youtube-nocookie.com/embed/3HBUoJDujVY',
    'ccInfoliniaVideoTrigger',
    'resetModalVideo',
  ]) {
    assert.ok(componentSrc.includes(token), `Missing video token in modal: ${token}`);
  }
});
