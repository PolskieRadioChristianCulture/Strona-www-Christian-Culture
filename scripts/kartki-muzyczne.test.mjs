import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const HTML = readText('kartki/index.html');
const CSS = readText('kartki/kartki.css');
const JS = readText('kartki/kartki.js');
const REDIRECTS = readText('_redirects');

const REQUIRED_ASSETS = [
  'kartki/assets/hero-urodziny-cc.webp',
  'kartki/assets/card-urodziny.webp',
  'kartki/assets/card-dobrze.webp',
  'kartki/assets/card-nowy-rok.webp',
  'kartki/assets/promo-kartki-1x1.webp',
  'kartki/assets/dobrze-ze-jestes.mp3',
  'kartki/assets/nowy-rok.mp3'
];

test('Produkcja /kartki/ ma index,follow, canonical /kartki/ i przekierowanie 301 z /test/kartki/', () => {
  assert.match(HTML, /<meta\s+name="robots"\s+content="index,follow"\s*>/i);
  assert.ok(HTML.includes('href="https://polskieradio.cc/kartki/"'), 'Brak kanonicznego URL /kartki/');
  assert.match(REDIRECTS, /^\/kartki\s+\/kartki\/index\.html\s+200$/m);
  assert.match(REDIRECTS, /^\/kartki\/\s+\/kartki\/index\.html\s+200$/m);
  assert.match(REDIRECTS, /^\/test\/kartki\s+\/kartki\/\s+301$/m);
  assert.match(REDIRECTS, /^\/test\/kartki\/\s+\/kartki\/\s+301$/m);
});

test('Allowlist release zawiera caly katalog kartki/ i wszystkie pliki multimedialne istnieja', () => {
  const publicFiles = [
    'kartki/index.html',
    'kartki/kartki.css',
    'kartki/kartki.js',
    ...REQUIRED_ASSETS
  ];
  for (const rel of publicFiles) {
    assert.equal(isPublicFile(rel), true, `${rel} musi byc publiczne w isPublicFile`);
    assert.equal(fs.existsSync(path.join(ROOT, rel)), true, `Brak pliku: ${rel}`);
    assert.ok(fs.statSync(path.join(ROOT, rel)).size > 1024, `Plik zbyt maly / pusty: ${rel}`);
  }
});

test('Standard CC FULL PREMIUM: GA4, logo PNG, zero Font Awesome, pomarancz #FF7A00, ticker, header-right, CSS Polecamy', () => {
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
  assert.ok(HTML.includes('/js/cc-eco-bars.js?v=20261125_promo1'), 'Brak cc-eco-bars.js?v=20261125_promo1');
  assert.ok(HTML.includes('/components/cc-omni-search.js'), 'Brak cc-omni-search.js');
  assert.ok(HTML.includes('/components/cc-global-chat-button.js'), 'Brak cc-global-chat-button.js');
  assert.ok(HTML.includes('/components/cc-support-footer.js'), 'Brak cc-support-footer.js');

  assert.ok(HTML.includes('id="tickRun"'), 'Brak paska CCEco ticker');
  assert.ok(HTML.includes('E-Kartki CC · 24/7'), 'Brak etykiety tickera');
  assert.equal(/>\s*LIVE\s*</i.test(HTML), false, 'Zakazane falszywe LIVE');
  assert.ok(HTML.includes('id="promoStage"') && HTML.includes('id="promoDots"') && HTML.includes('id="promoBar"'), 'Brak sekcji Polecamy CCEco');
  assert.ok(HTML.includes('id="heroParticles"'), 'Brak animowanego tla heroParticles');

  assert.ok(CSS.includes('.promo-stage > a img'), 'Brak reguly CSS .promo-stage > a img dla grafik Polecamy');
  assert.ok(CSS.includes('[hidden] { display: none !important; }'), 'Brak jawnego ukrywania [hidden]');
  assert.ok(CSS.includes('#ff7a00') || CSS.includes('#FF7A00'), 'Brak kanonicznego pomaranczu CTA #FF7A00');
  assert.ok(CSS.includes('@media (prefers-reduced-motion: reduce)'), 'Brak obslugi prefers-reduced-motion');
  assert.ok(CSS.includes('max-width: 440px') && CSS.includes('.support-txt'), 'Brak mobilnego przycisku serca <= 440px');
});

test('Wszystkie slajdy w CCEco.PROMOS posiadaja realna grafike promo na dysku (> 5 KB) w allowliscie', () => {
  const ecoBox = { module: { exports: {} } };
  vm.runInNewContext(readText('js/cc-eco-bars.js'), ecoBox);
  const eco = ecoBox.module.exports;
  assert.ok(Array.isArray(eco.PROMOS) && eco.PROMOS.length >= 10);
  assert.ok(eco.PROMOS.some((p) => p.id === 'kartki' && p.href === '/kartki/'), 'PROMOS musi zawierac kartki');
  for (const item of eco.PROMOS) {
    assert.ok(item.img && item.img.startsWith('/assets/promo/'), `Brak grafiki promo dla pozycji ${item.id}`);
    const cleanRel = item.img.split('?')[0].replace(/^\/+/, '');
    assert.equal(isPublicFile(cleanRel), true, `${cleanRel} musi byc publiczne w isPublicFile`);
    const abs = path.join(ROOT, cleanRel);
    assert.equal(fs.existsSync(abs), true, `Brak pliku grafiki ${cleanRel} (dla ${item.id})`);
    assert.ok(fs.statSync(abs).size > 5000, `Grafika ${cleanRel} zbyt mala`);
  }
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
  assert.ok(JS.includes('/kartki/assets/dobrze-ze-jestes.mp3'));
  assert.ok(JS.includes('/kartki/assets/nowy-rok.mp3'));

  assert.ok(JS.includes('Niech ci błogosławi Pan i niech cię strzeże; Niech Pan rozjaśni nad tobą swoje oblicze i niech ci będzie łaskawy; Niech Pan zwróci ku tobie swoje oblicze i niech da ci pokój.'));
  assert.ok(JS.includes('Dziękuję memu Bogu, ilekroć was wspominam; Zawsze w każdej mojej modlitwie prosząc z radością za was wszystkich;'));
  assert.ok(JS.includes('Gdyż ja znam myśli, które mam o was, mówi Pan: myśli o pokoju, a nie o utrapieniu, aby zapewnić wam koniec, jakiego oczekujecie.'));

  assert.equal(/\.innerHTML\s*=/.test(JS), false, 'kartki.js nie powinien uzywac innerHTML');
});

test('Wyszukiwarka @w oraz SEO dla botow AI (llms.txt, llms-full.txt, sitemap, FAQPage JSON-LD) zawieraja /kartki/', () => {
  const searchIdx = JSON.parse(readText('data/cc-search-index.json'));
  const catalog = JSON.parse(readText('szukaj/catalog.json'));
  assert.ok(searchIdx.items.some((it) => it && it.url === 'https://polskieradio.cc/kartki/'), 'Brak /kartki/ w data/cc-search-index.json');
  assert.ok(catalog.items.some((it) => it && it.url === 'https://polskieradio.cc/kartki/'), 'Brak /kartki/ w szukaj/catalog.json');
  assert.ok(readText('llms.txt').includes('https://polskieradio.cc/kartki/'), 'Brak /kartki/ w llms.txt');
  assert.ok(readText('llms-full.txt').includes('https://polskieradio.cc/kartki/'), 'Brak /kartki/ w llms-full.txt');
  assert.ok(readText('sitemaps/pages.xml').includes('https://polskieradio.cc/kartki/'), 'Brak /kartki/ w sitemaps/pages.xml');

  const ldMatch = HTML.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'Brak bloku JSON-LD');
  const parsed = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(parsed['@graph']), 'JSON-LD powinien miec @graph');
  assert.ok(parsed['@graph'].some((n) => n['@type'] === 'WebApplication'));
  assert.ok(parsed['@graph'].some((n) => n['@type'] === 'FAQPage'));
});
