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
  assert.equal(home.includes('cc-top-support-label'), true);
  assert.doesNotMatch(home, /class="cc-top-support-btn"[^>]*padding:0 14px/);
  assert.match(home, /@media\s*\(max-width:\s*768px\)[\s\S]*?#mainHeader\s+\.cc-top-support-btn[\s\S]*?border-radius:\s*50%/);
  assert.match(home, /#mainHeader\s+\.cc-top-support-btn\s+\.cc-top-support-label\s*\{\s*display:\s*none;/);
  assert.match(home, /@media\s*\(max-width:\s*420px\)[\s\S]*?#mainHeader\s+\.header-container[\s\S]*?padding:\s*0\s+4px\s*!important;/);
  const banner = read('components/cc-home-video-banner.js');
  assert.equal(banner.includes('cc_home_video_banner_day'), true);
  assert.equal(banner.includes('/wspieramto/assets/wsparcie-zrzutka-web.mp4'), true);
  assert.equal(banner.includes('https://zrzutka.pl/z/ChristianCulture'), true);
  assert.equal(banner.includes('vid.muted = false'), true);
  assert.equal(banner.includes('top:calc(50% - 16px)'), true);
  assert.equal(banner.includes('box-sizing:border-box'), true);
  assert.equal(banner.includes('padding:7px 12px'), true);
  assert.equal(banner.includes('cc-hvb-cta-sub'), true);
  assert.equal(banner.includes('id="ccHvbGift"'), true);
  assert.equal(banner.includes('Odbierz prezent za darmo'), true);
  assert.equal(banner.includes('href="/wspieramto#prezent"'), true);
  assert.equal(banner.includes('home_video_banner_show'), true);
  assert.equal(banner.includes('home_video_banner_unmute'), true);
  assert.equal(banner.includes('home_video_banner_cta_click'), true);
  assert.equal(banner.includes('home_video_banner_gift_click'), true);
  assert.equal(banner.includes('home_video_banner_close'), true);
  assert.equal(banner.includes('1× dziennie &bull;'), false);
  assert.equal(banner.includes('cc-skarbiec-misji.web.app'), false);
});

test('sekcja /wspieramto#prezent udostępnia darmowy album bez rejestracji, a GA4 nie nadpisuje źródła sesji parametrem source', () => {
  for (const rel of ['wspieramto/index.html', 'wspieramto.html']) {
    const html = read(rel);
    assert.equal(html.includes('id="prezent"'), true, `${rel} musi zawierać sekcję #prezent`);
    assert.equal(html.includes('https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc'), true, `${rel} musi linkować do darmowego prezentu`);
  }
  const modal = read('components/cc-wspieramto-modal.js');
  assert.equal(modal.includes("support_source: 'wspieramto_modal'"), true);
  assert.doesNotMatch(modal, /\bsource:\s*['"]wspieramto_modal['"]/, 'zarezerwowane pole source psuje atrybucję GA4');

  const analytics = read('js/cc-analytics.js');
  assert.equal(analytics.includes("k === 'source'"), true, 'sanitizeParams musi chronić GA4 przed polem source');

  for (const rel of ['wspieraj.html', 'pomogebomoge.html', 'biblijne-uwielbienie.html', 'milion.html', 'milion/index.html']) {
    const html = read(rel);
    assert.equal(html.includes('https://zrzutka.pl/z/ChristianCulture'), true, `${rel} musi kierować na nowy link zrzutka.pl/z/ChristianCulture`);
    assert.equal(html.includes('https://zrzutka.pl/rs4g4v'), false, `${rel} nie może zawierać starego linku rs4g4v`);
  }

  const vod = read('vod.html');
  assert.equal(vod.includes('<title>Filmy VOD za darmo z lektorem PL (Całe Filmy HD) | Kino CC</title>'), true);
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

test('/vod posiada bogate Schema.org (12+ filmów z ?film=, FAQPage z 6 pytaniami, BreadcrumbList), modal WspieramTO oraz pełną telemetrię GA4 VOD', () => {
  const vod = read('vod.html');
  assert.equal(vod.includes('/components/cc-wspieramto-modal.js'), true, 'vod.html musi ładować modal 1-Click WspieramTO');

  const ldMatch = vod.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'vod.html musi zawierać JSON-LD');
  const schema = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(schema['@graph']), '@graph musi być tablicą');

  const breadcrumb = schema['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
  assert.ok(breadcrumb && Array.isArray(breadcrumb.itemListElement) && breadcrumb.itemListElement.length >= 2, 'wymagany BreadcrumbList');

  const faq = schema['@graph'].find((n) => n['@type'] === 'FAQPage');
  assert.ok(faq && Array.isArray(faq.mainEntity) && faq.mainEntity.length === 6, 'FAQPage musi mieć dokładnie 6 pytań Q&A');

  const movieList = schema['@graph'].find((n) => n['@type'] === 'ItemList');
  assert.ok(movieList && Array.isArray(movieList.itemListElement) && movieList.itemListElement.length >= 12, 'ItemList musi mieć min. 12 filmów');
  const movieUrls = new Set();
  for (const li of movieList.itemListElement) {
    assert.ok(li.item && li.item['@type'] === 'Movie');
    assert.match(li.item.url, /^https:\/\/polskieradio\.cc\/vod\?film=[a-z0-9-]+$/);
    assert.match(li.item.image, /^https:\/\//);
    assert.ok(li.item.director && li.item.director.name);
    movieUrls.add(li.item.url);
  }
  assert.equal(movieUrls.size, movieList.itemListElement.length, 'każdy film w ItemList musi mieć unikalny URL ?film=');

  for (const ev of ['vod_movie_select', 'vod_preroll_skip', 'vod_play', 'vod_detail_view', 'vod_share']) {
    assert.equal(vod.includes(`'${ev}'`), true, `vod.html musi raportować zdarzenie GA4 ${ev}`);
  }
  assert.equal(vod.includes('m.description || m.desc'), true, 'shareMovieToLumina musi korzystać z pola description z vod-db.js');
  assert.equal(vod.includes('m.thumbnail || m.cover'), true, 'shareMovieToLumina musi korzystać z pola thumbnail z vod-db.js');
});

test('modal Infolinii NADZIEJA raportuje pełny lejek GA4 przez ccTrack/gtag bez parametru source', () => {
  const modal = read('components/cc-infolinia-nadzieja-modal.js');
  for (const ev of ['infolinia_modal_open', 'infolinia_video_play', 'infolinia_phone_copy', 'infolinia_nadzieja_confirmed', 'infolinia_modal_dismiss']) {
    assert.equal(modal.includes(`'${ev}'`), true, `cc-infolinia-nadzieja-modal.js musi raportować ${ev}`);
  }
  assert.equal(modal.includes('window.ccTrack'), true, 'lejki powinny preferować window.ccTrack');
  assert.doesNotMatch(modal, /\bsource\s*:/, 'nie wolno przekazywać zarezerwowanego klucza source do GA4');
});
