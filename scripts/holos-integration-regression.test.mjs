import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const html = await readFile(new URL('../holos.html', import.meta.url), 'utf8');
const engineCode = await readFile(new URL('../js/holos-2027-engine.js', import.meta.url), 'utf8');

test('all HOLOS inline executable scripts and holos-2027-engine.js retain valid syntax', () => {
  let checked = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/src=|ld\+json/.test(match[1])) continue;
    const result = spawnSync(process.execPath, ['--input-type=' + (match[1].includes('module') ? 'module' : 'commonjs'), '--check'], {
      input: match[2], encoding: 'utf8', windowsHide: true
    });
    assert.equal(result.status, 0, result.stderr);
    checked++;
  }
  assert.ok(checked >= 3);

  const engineCheck = spawnSync(process.execPath, ['--input-type=commonjs', '--check'], {
    input: engineCode, encoding: 'utf8', windowsHide: true
  });
  assert.equal(engineCheck.status, 0, engineCheck.stderr);
});

test('HOLOS exposes accessible, same-tab CC tools with touch targets', () => {
  const nav = html.match(/<nav aria-label="Narzędzia Christian Culture"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  for (const route of ['/akademia#kurscodzienny', '/mojabiblia', '/', '/tablica']) {
    assert.ok(nav.includes(`href="${route}"`));
  }
  assert.equal((nav.match(/min-height:44px/g) || []).length, 4);
  assert.equal((nav.match(/aria-hidden="true"/g) || []).length, 4);
  assert.ok(!nav.includes('target="_blank"'));
});

test('guest/offline HOLOS data never claims cloud synchronization and Firestore sync targets verified non-anon members', () => {
  const start = html.indexOf('    function updateSyncUI()');
  const end = html.indexOf('    /*', start);
  assert.ok(start >= 0 && end > start);
  for (const user of [null, { displayName: 'Test' }]) {
    const label = {};
    vm.runInNewContext(html.slice(start, end) + '\nupdateSyncUI();', {
      getCcUser: () => user,
      document: { getElementById: () => label }
    });
    assert.match(label.innerText, /lokalny/);
    assert.doesNotMatch(label.innerText, /Zsynchronizowano/);
  }
  assert.ok(!html.includes('Dane zapisywane w profilu CC ID'));

  // Cloud sync contract checks
  assert.ok(engineCode.includes('/personal_hub/'), 'Writes to user-isolated personal_hub doc');
  assert.ok(engineCode.includes('user.isAnonymous'), 'Rejects anonymous sessions for cloud sync');
  assert.ok(engineCode.includes("mode: 'synced'") && engineCode.includes('verifiedCloud: true'));
  assert.ok(engineCode.includes("mode: 'error'") && engineCode.includes('verifiedCloud: false'));
});

test('BYOK disclosure matches the existing outbound Gemini request', () => {
  assert.ok(html.includes('generativelanguage.googleapis.com'));
  assert.ok(html.includes('przekazywane do Google Gemini'));
  assert.ok(!html.includes('Nigdy nie opuszcza Twojego urządzenia'));
});

test('HOLOS 2027 challenges, Sabbath Shield, FULL PREMIUM UX, literal UBG verses, and XSS protection are present', () => {
  assert.ok(!html.includes('user-scalable=no'), 'Viewport allows accessible zoom');
  assert.ok(html.includes('id="sekcja-wyzwania-2027"'), 'Contains New Year 2027 Challenges section');
  assert.ok(html.includes('/js/holos-2027-engine.js'), 'Loads HOLOS 2027 engine');
  assert.ok(html.includes('/js/cc-favorites.js'), 'Loads CC Favorites');
  assert.ok(html.includes('/js/cc-eco-bars.js'), 'Loads CC Eco Bars');
  assert.ok(html.includes('#FF7A00'), 'Includes canonical orange CTA color');
  assert.ok(html.includes('escapeHtml'), 'Escapes calendar event HTML in renderCalendarUI');
  assert.ok(!engineCode.includes('.innerHTML'), 'HOLOS 2027 engine builds DOM safely without innerHTML');
  assert.ok(engineCode.includes('sabbathShield'), 'Supports Sabbath Shield');
  assert.ok(html.includes('Ufaj PANU z całego swego serca'), 'Uses literal UBG-2025 Prz 3,5-6');
  assert.ok(engineCode.includes('Biegnę do mety, do nagrody powołania Bożego'), 'Uses literal UBG-2025 Flp 3,13-14');
});
