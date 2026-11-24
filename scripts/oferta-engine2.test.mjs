import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const HTML_PATH = path.join(ROOT, 'test/oferta/index.html');
const CSS_PATH = path.join(ROOT, 'test/oferta/oferta.css');
const JS_PATH = path.join(ROOT, 'test/oferta/oferta.js');
const HEADERS_PATH = path.join(ROOT, '_headers');

const html = fs.readFileSync(HTML_PATH, 'utf8');
const css = fs.readFileSync(CSS_PATH, 'utf8');
const js = fs.readFileSync(JS_PATH, 'utf8');
const headers = fs.readFileSync(HEADERS_PATH, 'utf8');

test('Engine 2 preview (/test/oferta/) is strictly noindex and whitelisted for safe Pages release', () => {
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,nofollow">/i);
  assert.match(headers, /\/test\/oferta\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i);
  assert.match(headers, /\/test\/oferta\/\*\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i);
  for (const rel of ['test/oferta/index.html', 'test/oferta/oferta.css', 'test/oferta/oferta.js']) {
    assert.equal(isPublicFile(rel), true, `${rel} must pass isPublicFile`);
  }
});

test('Engine 2 preview satisfies CC FULL PREMIUM ecosystem shell, GA4, Favorites, Ticker, Polecamy and Orange CTA', () => {
  assert.match(html, /G-Y4EFTVBPE3/);
  assert.match(html, /cc_team/);
  assert.match(html, /\/js\/cc-analytics\.js/);
  assert.match(html, /class="header-right\b/);
  assert.match(html, /\/js\/cc-favorites\.js/);
  assert.match(html, /Wspieram to/);
  assert.match(html, /data-cc-wspieramto="true"/);
  assert.match(html, /\/components\/cc-wspieramto-modal\.js/);
  assert.match(html, /id="tickRun"/);
  assert.match(html, /id="promoStage"/);
  assert.match(html, /\/js\/cc-eco-bars\.js/);
  assert.match(html, /\/app-christian-culture\.png/);
  assert.doesNotMatch(html, /app-christian-culture\.webp/i);
  assert.doesNotMatch(html, /font-awesome|fontawesome|fa-/i);
  assert.match(css, /--orange:\s*#ff7a00/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
});

test('Engine 2 contains honest commercial pricing (299 zł / 490 zł), live catalog hooks and 1-Click order channels', () => {
  assert.match(html, /299 zł/);
  assert.match(html, /490 zł/);
  assert.match(html, /od 1 200 zł/);
  assert.match(html, /https:\/\/wa\.me\/48537137043/);
  assert.match(html, /mailto:radiochristianculture@gmail\.com/);
  assert.match(html, /https:\/\/zrzutka\.pl\/rs4g4v/);
  assert.match(html, /https:\/\/patronite\.pl\/osobowoscplus/);
  assert.match(js, /\/biblia-audio\/data\/catalog\.json/);
  assert.match(js, /\/data\/wizytowki-katalog\.json/);
  assert.match(js, /\/data\/cc-channels\.json/);
  assert.match(js, /CCEco\.mountTicker/);
  assert.match(js, /CCEco\.mountPromo/);
});

test('Engine 2 has zero forbidden internal leaks and all referenced local visual assets exist on disk', () => {
  for (const text of [html, css, js]) {
    assert.doesNotMatch(text, /Mission\s+Control/i);
    assert.doesNotMatch(text, /cc-skarbiec-misji\.web\.app/i);
  }
  const localAssets = [
    'app-christian-culture.png',
    'images/ogloszenia-dom-studio.webp',
    'wizytowka/img/og-wizytowka.jpg',
    'wizytowka/img/karta-zaneta.webp',
    'SpiritualSounds/img/ss-og-1200x630.jpg',
    'Welch/assets/gerald-welch-contemporary-portrait-1000.webp',
    'biblia-audio/assets/hero-biblia-audio.jpg',
    'biblia-audio/data/catalog.json',
    'data/wizytowki-katalog.json',
    'data/cc-channels.json',
  ];
  for (const rel of localAssets) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), true, `Missing local asset: ${rel}`);
  }
});
