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

test('modal WspieramTO kieruje PLN 1-Click na Zrzutka.pl (z/ChristianCulture) + Patronite, a zagranicę (GBP/EUR/USD) na Revolut', () => {
  const modal = read('components/cc-wspieramto-modal.js');
  assert.equal(modal.includes('https://zrzutka.pl/z/ChristianCulture'), true);
  assert.equal(modal.includes('https://patronite.pl/osobowoscplus'), true);
  assert.equal(modal.includes('https://revolut.me/christianculture'), true);
  assert.equal(modal.includes("isPln ? 'https://zrzutka.pl/z/ChristianCulture' : 'https://revolut.me/christianculture'"), true);
});

test('strony /wspieramto osadzają zmasterowany spot wideo 9:16 i nowy adres zrzutka.pl/z/ChristianCulture', () => {
  for (const rel of ['wspieramto/index.html', 'wspieramto.html']) {
    const html = read(rel);
    assert.equal(html.includes('/wspieramto/assets/wsparcie-zrzutka-web.mp4'), true, `${rel} musi osadzać spot wideo`);
    assert.equal(html.includes('/wspieramto/assets/wsparcie-zrzutka-poster.jpg'), true, `${rel} musi mieć poster wideo`);
    assert.equal(html.includes('https://zrzutka.pl/z/ChristianCulture'), true, `${rel} musi używać zrzutka.pl/z/ChristianCulture`);
  }
  assert.equal(fs.existsSync(path.join(REPO, 'wspieramto/assets/wsparcie-zrzutka-web.mp4')), true);
  assert.equal(fs.existsSync(path.join(REPO, 'wspieramto/assets/wsparcie-zrzutka-poster.jpg')), true);
});

test('strona główna ładuje baner wideo wsparcia 1× dziennie z autostartem, dźwiękiem i nowym linkiem zrzutka.pl/z/ChristianCulture', () => {
  const home = read('index.html');
  assert.equal(home.includes('/components/cc-home-video-banner.js'), true);
  const banner = read('components/cc-home-video-banner.js');
  assert.equal(banner.includes('cc_home_video_banner_day'), true);
  assert.equal(banner.includes('/wspieramto/assets/wsparcie-zrzutka-web.mp4'), true);
  assert.equal(banner.includes('https://zrzutka.pl/z/ChristianCulture'), true);
  assert.equal(banner.includes('vid.muted = false'), true);
  assert.equal(banner.includes('top:calc(50% - 16px)'), true);
  assert.equal(banner.includes('id="ccHvbGift"'), true);
  assert.equal(banner.includes('Odbierz prezent za darmo'), true);
  assert.equal(banner.includes('https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc'), true);
  assert.equal(banner.includes('1× dziennie &bull;'), false);
  assert.equal(banner.includes('cc-skarbiec-misji.web.app'), false);
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
  assert.equal(pl.includes('https://zrzutka.pl/z/ChristianCulture'), true);
  assert.equal(pl.includes('https://patronite.pl/osobowoscplus'), true);
  assert.equal(pl.includes('https://polskieradio.cc/wspieramto'), true);
  assert.equal(ensureYoutubeSupportFooter(pl, { lang: 'pl' }), pl, 'powtórne wywołanie nie może dublować stopki');

  const en = ensureYoutubeSupportFooter('Genesis Chapter 1.', { lang: 'en' });
  assert.equal(en.includes('https://polskieradio.cc/wspieramto'), true);
  assert.equal(en.includes('https://zrzutka.pl/z/ChristianCulture'), true);

  const huge = ensureYoutubeSupportFooter('A'.repeat(6000), { lang: 'pl' });
  assert.ok(huge.length <= 5000);
  assert.equal(huge.includes('https://zrzutka.pl/z/ChristianCulture'), true);
});
