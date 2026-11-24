import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const html = fs.readFileSync(path.join(ROOT, 'test/wspieramto/index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'test/wspieramto/wspieramto-v3.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'test/wspieramto/wspieramto-v3.js'), 'utf8');
const headers = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');

test('WspieramTO v3 preview (/test/wspieramto/) is strictly noindex and whitelisted for safe Pages release', () => {
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,nofollow">/i);
  assert.match(headers, /\/test\/wspieramto\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i);
  assert.match(headers, /\/test\/wspieramto\/\*\r?\n\s+X-Robots-Tag:\s*noindex,\s*nofollow,\s*noarchive/i);
  for (const rel of ['test/wspieramto/index.html', 'test/wspieramto/wspieramto-v3.css', 'test/wspieramto/wspieramto-v3.js']) {
    assert.equal(isPublicFile(rel), true, `${rel} must pass isPublicFile`);
  }
});

test('WspieramTO v3 satisfies CC FULL PREMIUM shell, canonical GA4 tag, Favorites, CCEco bars and EkoCC v2 multi-active features', () => {
  assert.match(html, /<\/script><script src="\/js\/cc-analytics\.js\?v=20261026_1" defer><\/script>/);
  assert.match(html, /class="header-right\b/);
  assert.match(html, /\/js\/cc-favorites\.js/);
  assert.match(html, /\/js\/cc-eco-bars\.js/);
  assert.match(html, /id="tickRun"/);
  assert.match(html, /id="promoStage"/);
  assert.match(html, /id="scrollProgressBar"/);
  assert.match(html, /id="heroParticles"/);
  assert.match(html, /id="heroSpotVideo"/);
  assert.match(html, /border-beam-orbit/);
  assert.match(html, /beam-pulse/);
  assert.match(html, /id="simSlider"/);
  assert.match(html, /bento-grid/);
  assert.match(html, /\/app-christian-culture\.png/);
  assert.doesNotMatch(html, /app-christian-culture\.webp/i);
  assert.doesNotMatch(html, /font-awesome|fontawesome|fa-/i);
  assert.match(css, /--orange:\s*#ff7a00/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
});

test('WspieramTO v3 embeds mastered spot video, new zrzutka.pl/z/ChristianCulture link and zero forbidden leaks', () => {
  assert.match(html, /\/wspieramto\/assets\/wsparcie-zrzutka-web\.mp4/);
  assert.match(html, /\/wspieramto\/assets\/wsparcie-zrzutka-poster\.jpg/);
  assert.match(html, /https:\/\/zrzutka\.pl\/z\/ChristianCulture/);
  assert.match(html, /https:\/\/patronite\.pl\/osobowoscplus/);
  assert.match(html, /https:\/\/revolut\.me\/christianculture/);
  assert.match(js, /https:\/\/zrzutka\.pl\/z\/ChristianCulture/);
  for (const text of [html, css, js]) {
    assert.doesNotMatch(text, /Mission\s+Control/i);
    assert.doesNotMatch(text, /cc-skarbiec-misji\.web\.app/i);
    assert.doesNotMatch(text, /Studio\s+Dobrego\s+Słowa|Studia\s+Dobrego\s+Słowa|\bSDS\b/i);
  }
  for (const rel of [
    'wspieramto/assets/wsparcie-zrzutka-web.mp4',
    'wspieramto/assets/wsparcie-zrzutka-poster.jpg',
    'images/ogloszenia-dom-studio.webp',
    'app-christian-culture.png',
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), true, `Missing asset: ${rel}`);
  }
});
