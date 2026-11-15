import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import worker from '../_worker.js';
import { isPublicFile } from './cc-release-files.mjs';
import { support } from '../assets/cc-support/config.js';
import { SUPPORT_LOCALES, registerSupportLocale, getSupportDictionary } from '../assets/cc-support/i18n-support.js';

const designCoreCss = fs.readFileSync(new URL('../css/cc-design-core.css', import.meta.url), 'utf8');
const designCoreJs = fs.readFileSync(new URL('../js/cc-design-core.js', import.meta.url), 'utf8');
const pilotHtml = fs.readFileSync(new URL('../wspieraj-pilot.html', import.meta.url), 'utf8');
const pilotSubIndex = fs.readFileSync(new URL('../test/wspieraj/index.html', import.meta.url), 'utf8');
const prodHtml = fs.readFileSync(new URL('../wspieraj.html', import.meta.url), 'utf8');

test('CC Design Core defines canonical tokens, JOMA-D052 orange CTA, 44px touch target, archetypes and RTL logical properties', () => {
  for (const token of [
    '--cc-gold: #C4A35A',
    '--cc-gold-hover: #D4B578',
    '--cc-gold-light: #E2CC9A',
    '--cc-gold-dark: #A08040',
    '--cc-btn-orange: #FF7A00',
    '--cc-btn-orange-hover: #FF8C33',
    '--cc-btn-orange-active: #E66A00',
    '--cc-touch-min: 44px',
    '[data-cc-archetype="cinematic"]',
    '[data-cc-archetype="editorial"]',
    '[data-cc-archetype="audio"]',
    '[data-cc-archetype="giving"]',
    'prefers-reduced-motion: reduce',
    'margin-inline',
    'padding-inline',
    'border-inline-start',
  ]) {
    assert.ok(designCoreCss.includes(token), `Brak tokenu/reguły w css/cc-design-core.css: ${token}`);
  }
  assert.ok(designCoreJs.includes('ArrowRight') && designCoreJs.includes('ArrowLeft'), 'Brak obsługi strzałek klawiatury w zakładkach');
  assert.ok(designCoreJs.includes('prefers-reduced-motion: reduce'), 'JS Design Core musi respektować prefers-reduced-motion');
});

test('i18n-support covers PL, EN, DE, ES, FR cleanly and supports extensible missionary locales', () => {
  const requiredCodes = ['pl', 'en', 'de', 'es', 'fr'];
  const baseKeys = Object.keys(SUPPORT_LOCALES.pl);

  for (const code of requiredCodes) {
    const entry = SUPPORT_LOCALES[code];
    assert.ok(entry, `Brak języka: ${code}`);
    for (const key of baseKeys) {
      assert.ok(entry[key] !== undefined && entry[key] !== '', `Brak klucza "${key}" dla języka "${code}"`);
    }
  }

  assert.equal(registerSupportLocale('uk', { hero_badge: 'Christian Culture · UA' }), true);
  assert.equal(getSupportDictionary('uk').hero_badge, 'Christian Culture · UA');
  assert.equal(getSupportDictionary('uk').code, 'uk');
  delete SUPPORT_LOCALES.uk;
});

test('Pilot /test/wspieraj preserves 100% of verified payment methods and leaves production wspieraj.html intact', () => {
  assert.equal(pilotHtml, pilotSubIndex, 'wspieraj-pilot.html i test/wspieraj/index.html muszą być identyczne');

  for (const snippet of [
    '537 137 043',
    'Cezary Rogowski',
    '74 2910 0006 2469 8002 1062 8039',
    '48 2910 0006 0000 0000 0527 2629',
    'https://patronite.pl/osobowoscplus',
    'https://revolut.me/christianculture',
    'https://zrzutka.pl/rs4g4v',
    'https://zrzutka.pl/3bbxzn',
    'https://my-store-1009741.creator-spring.com/',
    '+48 507 821 789',
    'assets/cc-support/logo.png',
    'cc-btn-orange',
  ]) {
    assert.ok(pilotHtml.includes(snippet), `Pilotaż musi zachować zweryfikowany element: ${snippet}`);
  }

  assert.equal(support.blik, '537137043');
  assert.equal(support.accounts.length, 2);
  assert.ok(prodHtml.includes('assets/cc-support/support.css'), 'Oryginał wspieraj.html musi pozostać nienaruszony');
});

test('Worker routes /test/wspieraj cleanly with security & noindex headers and release builder allows test/wspieraj/index.html', async () => {
  assert.equal(isPublicFile('wspieraj-pilot.html'), true);
  assert.equal(isPublicFile('test/wspieraj/index.html'), true);
  assert.equal(isPublicFile('css/cc-design-core.css'), true);
  assert.equal(isPublicFile('js/cc-design-core.js'), true);

  let fetchedPath = '';
  const env = {
    ASSETS: {
      fetch: async (request) => {
        fetchedPath = new URL(request.url).pathname;
        return new Response('<!doctype html><title>Pilot</title>', { status: 200 });
      },
    },
  };

  const pilotResp = await worker.fetch(new Request('https://polskieradio.cc/test/wspieraj'), env);
  assert.equal(pilotResp.status, 200);
  assert.equal(fetchedPath, '/wspieraj-pilot.html');
  assert.equal(pilotResp.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(pilotResp.headers.get('X-Content-Type-Options'), 'nosniff');

  const prodResp = await worker.fetch(new Request('https://polskieradio.cc/wspieraj'), env);
  assert.equal(prodResp.status, 200);
  assert.equal(fetchedPath, '/wspieraj.html');
});
