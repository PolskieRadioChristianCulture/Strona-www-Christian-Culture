// Katalog /wizytówki — od 18.11.2026 (✅ L0) wersja premium v2 z jednego źródła data/wizytowki-katalog.json
// (generator scripts/wizytowki/buduj.mjs). Zasada L0: prywatnych profili LUMINA nie promujemy, martwe linki usuwamy.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const data = JSON.parse(read('data', 'wizytowki-katalog.json'));

test('wizytowki/index.html and wizytowki.html exist, match, and follow EkoCC premium standard', () => {
  const indexHtml = read('wizytowki', 'index.html');
  assert.equal(indexHtml, read('wizytowki.html'), 'wizytowki/index.html and wizytowki.html must stay synchronized');
  assert.match(indexHtml, /<title>Wizytówki Christian Culture — artyści, twórcy, kanały i służby \| Katalog<\/title>/);
  assert.match(indexHtml, /<meta name="robots" content="index,follow">/);
  assert.match(indexHtml, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/wizytowki">/);
  assert.match(indexHtml, /js\/cc-edge-plus\.js/, 'shared EkoCC edge menu (+)');
  assert.match(indexHtml, /id="wizytowkiSearch"/, 'Must include instant search input');
  assert.ok(!/Mission Control/i.test(indexHtml), 'Must never mention Mission Control');
  assert.ok(!/zbyszekgieron/i.test(indexHtml), 'Must never include withdrawn profile zbyszekgieron');
});

test('wizytowki/index.html renders every verified calling card once in its primary category, with local images', () => {
  const html = read('wizytowki', 'index.html');
  const primary = [...html.matchAll(/<a class="card" href="([^"]+)" data-card data-primary="1"[\s\S]*?<img src="([^"]+)"/g)];
  assert.equal(primary.length, data.karty.length, 'każda karta raz w kategorii głównej');
  for (const [, , img] of primary) {
    assert.ok(fs.existsSync(path.join(ROOT, img.split('?')[0].replace(/^\//, ''))), `Card image must exist on disk: ${img}`);
  }
  const counts = {};
  for (const k of data.karty) counts[k.cats[0]] = (counts[k.cats[0]] || 0) + 1;
  assert.deepEqual(counts, { artysci: 4, kaciki: 6, kanaly: 6, ksiazki: 4, sluzby: 6 });
  for (const priv of ['/mariusz', '/jolawojcik', '/andrzejthiel', '/pawelmurawski', '/zofiadudek', '/magdalena', '/wiolettarogowska', '/studiodobregoslowa', '/radiocc']) {
    assert.ok(!html.includes(`href="${priv}"`), `L0: bez prywatnych profili i martwych linków (${priv})`);
  }
});

test('_worker.js and _redirects route /wizytówki and /wizytowki cleanly', () => {
  const worker = read('_worker.js');
  assert.match(worker, /wizytówki\|wizytowki/, '_worker.js must handle /wizytówki and /wizytowki');
  assert.match(worker, /targetUrl\.pathname = '\/wizytowki\/'/, '_worker.js must rewrite to /wizytowki/');
  const redirects = read('_redirects');
  assert.match(redirects, /^\/wizytowki \/wizytowki\/index\.html 200$/m);
  assert.match(redirects, /^\/wizytówki \/wizytowki\/index\.html 200$/m);
  assert.match(redirects, /^\/wizyt%C3%B3wki \/wizytowki\/index\.html 200$/m);
  assert.match(redirects, /^\/test\/wizytowki\/ \/wizytowki 301$/m, 'dawny adres testowy prowadzi do produkcji');
});

test('wizytowka/index.html links to /wizytówki and search index includes /wizytowki', () => {
  const wizytowkaHtml = read('wizytowka', 'index.html');
  assert.match(wizytowkaHtml, /href="\/wizytówki"/, 'Main calling card must link to /wizytówki');
  const searchIndex = JSON.parse(read('data', 'cc-search-index.json'));
  const catalogIndex = JSON.parse(read('szukaj', 'catalog.json'));
  assert.deepEqual(searchIndex, catalogIndex, 'data/cc-search-index.json and szukaj/catalog.json must match');
  assert.ok(searchIndex.items.some((item) => item.url === 'https://polskieradio.cc/wizytowki'), 'Search index must include https://polskieradio.cc/wizytowki');
});
