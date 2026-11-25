import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const HTML = readText('test/kartki/index.html');
const CSS = readText('test/kartki/kartki.css');
const JS = readText('test/kartki/kartki.js');
const HEADERS = readText('_headers');

const REQUIRED_ASSETS = [
  'test/kartki/assets/card-urodziny.webp',
  'test/kartki/assets/card-dobrze.webp',
  'test/kartki/assets/card-nowy-rok.webp',
  'test/kartki/assets/dobrze-ze-jestes.mp3',
  'test/kartki/assets/nowy-rok.mp3'
];

test('Podglad /test/kartki/ posiada noindex,nofollow w HTML i X-Robots-Tag w _headers', () => {
  assert.match(HTML, /<meta\s+name="robots"\s+content="noindex,nofollow"\s*>/i);
  assert.match(HEADERS, /^\/test\/kartki\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/m);
  assert.match(HEADERS, /^\/test\/kartki\/\*\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/m);
});

test('Allowlist release zawiera caly katalog test/kartki/ i wszystkie 5 plikow multimedialnych istnieja', () => {
  const publicFiles = [
    'test/kartki/index.html',
    'test/kartki/kartki.css',
    'test/kartki/kartki.js',
    ...REQUIRED_ASSETS
  ];
  for (const rel of publicFiles) {
    assert.equal(isPublicFile(rel), true, `${rel} musi byc publiczne w isPublicFile`);
    assert.equal(fs.existsSync(path.join(ROOT, rel)), true, `Brak pliku: ${rel}`);
    assert.ok(fs.statSync(path.join(ROOT, rel)).size > 1024, `Plik zbyt maly / pusty: ${rel}`);
  }
});

test('Standard CC FULL PREMIUM: GA4, logo PNG, zero Font Awesome, pomarancz #FF7A00, ticker, header-right, mobile edge', () => {
  assert.ok(HTML.includes('G-Y4EFTVBPE3'), 'Brak GA4 ID');
  assert.ok(HTML.includes('/js/cc-analytics.js?v=20261026_1'), 'Brak cc-analytics.js');
  assert.ok(HTML.includes('/app-christian-culture.png'), 'Brak logo PNG');
  assert.equal(HTML.includes('app-christian-culture.webp'), false, 'Zakazane .webp logo');
  assert.equal(/font-awesome|fontawesome|fa-solid|fa-brands/i.test(HTML + CSS + JS), false, 'Zakazany Font Awesome');

  assert.ok(HTML.includes('class="header-right nav__actions"'), 'Brak .header-right dla gwiazdy ulubionych');
  assert.ok(HTML.includes('/js/cc-favorites.js'), 'Brak cc-favorites.js');
  assert.ok(HTML.includes('/js/cc-mobile-edge.js'), 'Brak cc-mobile-edge.js');
  assert.ok(HTML.includes('/js/cc-edge-plus.js'), 'Brak cc-edge-plus.js');
  assert.ok(HTML.includes('/js/cc-back-to-top.js'), 'Brak cc-back-to-top.js');
  assert.ok(HTML.includes('/js/cc-eco-bars.js'), 'Brak cc-eco-bars.js');
  assert.ok(HTML.includes('/components/cc-omni-search.js'), 'Brak cc-omni-search.js');
  assert.ok(HTML.includes('/components/cc-global-chat-button.js'), 'Brak cc-global-chat-button.js');
  assert.ok(HTML.includes('/components/cc-support-footer.js'), 'Brak cc-support-footer.js');

  assert.ok(HTML.includes('id="tickRun"'), 'Brak paska CCEco ticker');
  assert.ok(HTML.includes('E-Kartki CC · 24/7'), 'Brak etykiety tickera');
  assert.equal(/>\s*LIVE\s*</i.test(HTML), false, 'Zakazane falszywe LIVE');
  assert.ok(HTML.includes('id="promoStage"') && HTML.includes('id="promoDots"') && HTML.includes('id="promoBar"'), 'Brak sekcji Polecamy CCEco');
  assert.ok(HTML.includes('id="heroParticles"'), 'Brak animowanego tla heroParticles');

  assert.ok(CSS.includes('#ff7a00') || CSS.includes('#FF7A00'), 'Brak kanonicznego pomaranczu CTA #FF7A00');
  assert.ok(CSS.includes('@media (prefers-reduced-motion: reduce)'), 'Brak obslugi prefers-reduced-motion');
  assert.ok(CSS.includes('max-width: 440px') && CSS.includes('.support-txt'), 'Brak mobilnego przycisku serca <= 440px');
});

test('Zakazane zwroty (Mission Control, SDS, cc-skarbiec-misji) nie wystepuja w plikach publicznych', () => {
  const combined = `${HTML}\n${CSS}\n${JS}`;
  for (const forbidden of [/Mission\s+Control/i, /cc-skarbiec-misji/i, /\bSDS\b/]) {
    assert.equal(forbidden.test(combined), false, `Wykryto zakazany token ${forbidden}`);
  }
});

test('3 okazje muzyczne, osadzenie YouTube YSg_C27JYsI oraz doslowne wersety UBG', () => {
  assert.ok(JS.includes("BIRTHDAY_YT_ID = 'YSg_C27JYsI'"), 'Brak ID piosenki urodzinowej YSg_C27JYsI');
  assert.ok(JS.includes('https://www.youtube-nocookie.com/embed/'), 'Brak youtube-nocookie embed');
  assert.ok(JS.includes('/test/kartki/assets/dobrze-ze-jestes.mp3'));
  assert.ok(JS.includes('/test/kartki/assets/nowy-rok.mp3'));

  // Doslowne cytaty UBG (Lb 6,24-26; Flp 1,3-4; Jr 29,11)
  assert.ok(JS.includes('Niech ci błogosławi Pan i niech cię strzeże; Niech Pan rozjaśni nad tobą swoje oblicze i niech ci będzie łaskawy; Niech Pan zwróci ku tobie swoje oblicze i niech da ci pokój.'));
  assert.ok(JS.includes('Dziękuję memu Bogu, ilekroć was wspominam; Zawsze w każdej mojej modlitwie prosząc z radością za was wszystkich;'));
  assert.ok(JS.includes('Gdyż ja znam myśli, które mam o was, mówi Pan: myśli o pokoju, a nie o utrapieniu, aby zapewnić wam koniec, jakiego oczekujecie.'));

  // XSS-safe rendering: brak innerHTML dla pol uzytkownika
  assert.equal(/\.innerHTML\s*=/.test(JS), false, 'kartki.js nie powinien uzywac innerHTML');
});
