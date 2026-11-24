import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ensureYoutubeSupportFooter } from './publish_perfect.mjs';

const REPO = path.resolve(import.meta.dirname, '..');
const read = rel => fs.readFileSync(path.join(REPO, rel), 'utf8');

test('publiczne strony wsparcia i modal NIE linkują do prywatnego Skarbca cc-skarbiec-misji.web.app', () => {
  for (const rel of ['components/cc-wspieramto-modal.js', 'wspieramto.html', 'wspieramto/index.html']) {
    const content = read(rel);
    assert.equal(content.includes('cc-skarbiec-misji.web.app'), false, `${rel} nie może linkować publicznie do prywatnego Skarbca`);
  }
});

test('modal WspieramTO kieruje PLN 1-Click na Zrzutka.pl (rs4g4v) + Patronite, a zagranicę (GBP/EUR/USD) na Revolut', () => {
  const modal = read('components/cc-wspieramto-modal.js');
  assert.equal(modal.includes('https://zrzutka.pl/rs4g4v'), true);
  assert.equal(modal.includes('https://patronite.pl/osobowoscplus'), true);
  assert.equal(modal.includes('https://revolut.me/christianculture'), true);
  assert.equal(modal.includes("isPln ? 'https://zrzutka.pl/rs4g4v' : 'https://revolut.me/christianculture'"), true);
});

test('TOP 6 stron z realnym ruchem ładują cc-wspieramto-modal.js i mają widoczny wyzwalacz data-cc-wspieramto', () => {
  const top6 = [
    'index.html',
    'player.html',
    'SpiritualSounds/tv/index.html',
    'mojabiblia.html',
    'biblia-audio/index.html',
    'biblia-do-pobrania.html',
  ];
  for (const rel of top6) {
    const html = read(rel);
    assert.equal(html.includes('cc-wspieramto-modal.js'), true, `${rel} musi ładować modal WspieramTO`);
    assert.equal(html.includes('data-cc-wspieramto="true"'), true, `${rel} musi mieć widoczny przycisk wsparcia otwierający modal`);
  }
});

test('js/cc-analytics.js rejestruje /wspieramto oraz /milion-gestow w support_view i DONATE_RE', () => {
  const js = read('js/cc-analytics.js');
  assert.match(js, /wspieraj\|wspieramto\|milion-gestow/);
  assert.match(js, /DONATE_RE\s*=\s*\/.*wspieramto.*milion-gestow/);
});

test('ensureYoutubeSupportFooter dopisuje stopkę wsparcia PL/EN, jest idempotentna i mieści się w limicie 5000 znaków', () => {
  const pl = ensureYoutubeSupportFooter('Rozdział 36 Księgi Rodzaju (UBG).', { lang: 'pl' });
  assert.equal(pl.includes('https://zrzutka.pl/rs4g4v'), true);
  assert.equal(pl.includes('https://patronite.pl/osobowoscplus'), true);
  assert.equal(pl.includes('https://polskieradio.cc/wspieramto'), true);
  assert.equal(ensureYoutubeSupportFooter(pl, { lang: 'pl' }), pl, 'powtórne wywołanie nie może dublować stopki');

  const en = ensureYoutubeSupportFooter('Genesis Chapter 1.', { lang: 'en' });
  assert.equal(en.includes('https://polskieradio.cc/wspieramto'), true);
  assert.equal(en.includes('https://zrzutka.pl/rs4g4v'), true);

  const huge = ensureYoutubeSupportFooter('A'.repeat(6000), { lang: 'pl' });
  assert.ok(huge.length <= 5000);
  assert.equal(huge.includes('https://zrzutka.pl/rs4g4v'), true);
});
