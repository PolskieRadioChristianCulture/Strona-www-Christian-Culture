import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('wszystkie pliki /kazania/ trafiają do publicznego wydania', () => {
  for (const rel of [
    'kazania/index.html',
    'kazania/kazania.css',
    'kazania/kazania.js',
    'kazania/data/kazania.json',
    'kazania/img/kazania-og-1200x630.jpg',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `Brak pliku: ${rel}`);
    assert.equal(isPublicFile(rel), true, `Plik odrzucony przez isPublicFile: ${rel}`);
  }
});

test('kazania/img/kazania-og-1200x630.jpg jest poprawnym i lekkim JPEG', () => {
  const buf = fs.readFileSync(path.join(ROOT, 'kazania/img/kazania-og-1200x630.jpg'));
  assert.equal(buf[0], 0xff);
  assert.equal(buf[1], 0xd8);
  assert.ok(buf.length > 5000 && buf.length < 200 * 1024, `Nieoczekiwany rozmiar OG JPEG: ${buf.length} B`);
});

test('kazania/index.html spełnia standard FULL PREMIUM EkoCC, SEO i GA4', () => {
  const html = read('kazania/index.html');
  assert.match(html, /<meta\s+name="robots"\s+content="index,\s*follow">/i);
  assert.doesNotMatch(html, /noindex/i);
  assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/polskieradio\.cc\/kazania\/">/i);
  assert.match(html, /hreflang="pl"/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(html, /property="og:image"[^>]*kazania-og-1200x630\.jpg/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.ok(html.includes('G-Y4EFTVBPE3'), 'Brak GA4 G-Y4EFTVBPE3');
  assert.ok(html.includes('class="header-right'), 'Brak kontraktu .header-right dla cc-favorites.js');
  assert.ok(html.includes('data-cc-wspieramto'), 'Brak wyzwalacza WspieramTO');
  assert.ok(html.includes('data-cc-search'), 'Brak wyzwalacza wyszukiwarki @w');
  assert.ok(html.includes('id="tickRun"'), 'Brak paska informacyjnego tickRun');
  assert.ok(html.includes('id="promoStage"'), 'Brak karuzeli Polecamy');
  assert.ok(html.includes('id="heroFx"'), 'Brak żywego canvasu heroFx');
  assert.ok(html.includes('/app-christian-culture.png'), 'Brak poprawnego logo app-christian-culture.png');
  assert.doesNotMatch(html, /app-christian-culture\.webp/i, 'Zakaz uszkodzonego .webp logo');
  assert.doesNotMatch(html, /Mission Control/i, 'Zakaz nazwy Mission Control na stronie publicznej');
  assert.doesNotMatch(html, /font-awesome|fontawesome/i, 'Zakaz ciężkiego Font Awesome');
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(visible, /\bLIVE\b|NA ŻYWO/i, 'Brak transmisji live — zakaz fałszywej plakietki LIVE');
});

test('kazania.css zachowuje kolor #FF7A00, zabezpieczenie .hero.is-ready i ruch przy reduced-motion', () => {
  const css = read('kazania/kazania.css');
  assert.ok(css.includes('#FF7A00'), 'Brak koloru CC Orange #FF7A00');
  assert.ok(css.includes('.hero.is-ready'), 'Brak zabezpieczenia .hero.is-ready');
  const rmMatch = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(rmMatch, 'Brak reguły @media (prefers-reduced-motion: reduce)');
  assert.doesNotMatch(rmMatch[1], /animation\s*:\s*none/i, 'Zakaz wyłączania animacji (animation: none) w reduced-motion');
});

test('kazania.json zawiera 4 konspekty, 12 kategorii i dosłowne wersety UBG-2025', () => {
  const catalog = JSON.parse(read('kazania/data/kazania.json'));
  assert.equal(catalog.categories.length, 12);
  assert.equal(catalog.sermons.length, 4);

  const tim = JSON.parse(read('data/bible/ubg-2025/2TI-004.json'));
  const tim2 = tim.verses.find((v) => v.number === 2);
  assert.equal(catalog.motto.text, tim2.text, 'Motto 2 Tym 4:2 musi być dosłownym cytatem UBG-2025');

  for (const s of catalog.sermons) {
    assert.ok(s.chapterId, `Brak chapterId w ${s.id}`);
    const ch = JSON.parse(read(`data/bible/ubg-2025/${s.chapterId}.json`));
    assert.ok(Array.isArray(s.keyVerses) && s.keyVerses.length >= 2, `Brak keyVerses w ${s.id}`);
    for (const kv of s.keyVerses) {
      const refVerse = ch.verses.find((v) => v.number === kv.v);
      assert.ok(refVerse, `Brak wersetu ${s.chapterId}:${kv.v}`);
      assert.equal(kv.text, refVerse.text, `Niezgodność UBG-2025 w ${s.chapterId}:${kv.v}`);
    }
  }
});

test('trasy _redirects, @w, @m i SEO odkrywają /kazania/', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /^\/kazania\s+\/kazania\/index\.html\s+200$/m);
  assert.match(redirects, /^\/kazania\/\s+\/kazania\/index\.html\s+200$/m);

  for (const f of ['szukaj/catalog.json', 'data/cc-search-index.json']) {
    const data = JSON.parse(read(f));
    assert.ok((data.items || []).some((i) => i.url === 'https://polskieradio.cc/kazania/'), `${f}: brak wpisu /kazania/`);
  }

  const mapRaw = read('data/ecosystem-map.json');
  assert.doesNotMatch(mapRaw, /Mission Control/i);
  const map = JSON.parse(mapRaw);
  assert.ok(map.nodes.some((n) => n.id === 'kazania-z-pasja' && n.url === 'https://polskieradio.cc/kazania/'));

  assert.ok(read('sitemaps/pages.xml').includes('<loc>https://polskieradio.cc/kazania/</loc>'));
  assert.ok(read('llms.txt').includes('https://polskieradio.cc/kazania/'));
});
