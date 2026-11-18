// @007 2026-11-18 — Spiritual Sounds × CC (wersja testowa): kontrakt kanału 24/7 i wizytówki PL/EN.
// Dyrektywa §17 (player), §13 (SEO na TEST = noindex), §20 (definicja DONE).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { isPublicFile } from './cc-release-files.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const tvJs = read('test/spiritual-sounds/tv/ss-tv.js');
// Plik przeglądarkowy (repo ma "type": "module") — wczytujemy w piaskownicy vm jak skrypt klasyczny.
const sandbox = { module: { exports: {} } };
vm.runInNewContext(tvJs, sandbox);
const tv = sandbox.module.exports;
const pages = {
  pl: read('test/spiritual-sounds/index.html'),
  en: read('test/spiritual-sounds/en/index.html'),
  tv: read('test/spiritual-sounds/tv/index.html'),
};

test('playlista autora jest jedynym źródłem (bez ręcznej listy filmów)', () => {
  assert.equal(tv.SS_PLAYLIST, 'PLD0gxYiiSZMA');
  assert.equal((tvJs.match(/PLD0gxYiiSZMA/g) || []).length, 1, 'ID playlisty tylko w jednej stałej');
  assert.doesNotMatch(tvJs, /videoId\s*:|playlist\s*:\s*\[|loadVideoById|cuePlaylist\(\s*\[/, 'zakaz statycznej listy filmów');
  assert.match(tvJs, /listType:\s*'playlist',\s*list:\s*SS_PLAYLIST/);
  assert.match(tvJs, /loop:\s*1/);
});

test('start wyciszony + duży przycisk dźwięku', () => {
  assert.match(tvJs, /autoplay:\s*1,\s*mute:\s*1/);
  assert.match(pages.tv, /id="tv-sound"[\s\S]*>Włącz dźwięk<[\s\S]*> \/ Rozpocznij transmisję</);
});

test('seedIndex: w zakresie playlisty, stały w godzinie', () => {
  const h = Date.UTC(2026, 10, 18, 7);
  for (const n of [0, 1, 2, 15, 312, 1000]) {
    const i = tv.seedIndex(n, h);
    assert.ok(i >= 0 && (n <= 1 ? i === 0 : i < n), `n=${n} i=${i}`);
    assert.equal(tv.seedIndex(n, h + 59 * 60000), i);
  }
});

test('upcoming: kolejne pozycje z zawinięciem na początek (loop)', () => {
  assert.deepEqual([...tv.upcoming(150, 148, 4)], [149, 0, 1, 2]);
  assert.deepEqual([...tv.upcoming(3, 0, 6)], [1, 2]);
  // getPlaylist() z YouTube jest ucięte do 200 pozycji (playlista ma 312) — bez ręcznego zawijania do 0.
  assert.deepEqual([...tv.upcoming(200, 197, 6)], [198, 199]);
  assert.equal(tv.isCapped(200), true);
  assert.doesNotMatch(tvJs, /playVideoAt\(0\)/, 'loop zostawiamy YouTube (loop: 1), żeby nie pomijać pozycji > 200');
  assert.deepEqual([...tv.upcoming(1, 0, 6)], []);
});

test('strażnik: eskalacja 10 s wznów → 18 s następny → 30 s przeładuj playlistę → 60 s strona', () => {
  const base = { hasPlayer: true, playing: false, paused: false, ended: false, progressed: false, userPaused: false, hidden: false, sinceBootMs: 99999, everPlayed: true };
  let s = 0;
  const step = (idleMs) => { const r = tv.guardDecide({ ...base, idleMs, strikes: s }); s = r.strikes; return r.action; };
  assert.equal(step(5000), 'none');
  assert.equal(step(11000), 'resume');
  assert.equal(step(19000), 'next');
  assert.equal(step(31000), 'restart-list');
  assert.equal(step(61000), 'reload-page');
});

test('strażnik: szanuje pauzę widza, przechodzi dalej po końcu filmu, nie zapętla przeładowań przy blokadzie autoplay', () => {
  const base = { hasPlayer: true, playing: false, paused: true, ended: false, progressed: false, hidden: false, sinceBootMs: 99999, strikes: 0 };
  assert.equal(tv.guardDecide({ ...base, userPaused: true, idleMs: 999999, everPlayed: true }).action, 'none');
  assert.equal(tv.guardDecide({ ...base, paused: false, ended: true, userPaused: false, idleMs: 0, everPlayed: true }).action, 'next');
  assert.notEqual(tv.guardDecide({ ...base, paused: false, userPaused: false, idleMs: 999999, strikes: 3, everPlayed: false }).action, 'reload-page');
  assert.notEqual(tv.guardDecide({ ...base, paused: false, userPaused: false, idleMs: 999999, strikes: 3, everPlayed: true, hidden: true }).action, 'reload-page');
  assert.equal(tv.guardDecide({ hasPlayer: false, sinceBootMs: 50000, strikes: 0, hidden: false }).action, 'reload-page');
  assert.equal(tv.guardDecide({ hasPlayer: false, sinceBootMs: 10000, strikes: 0, hidden: false }).action, 'wait');
});

test('uczciwe oznaczenia: 24/7 / non-stop, nigdy „LIVE”', () => {
  for (const [k, html] of Object.entries(pages)) {
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    // Jedyne dozwolone użycie: zdanie wyjaśniające, że to NIE jest transmisja na żywo.
    const label = visible.replace(/nie jest transmisja na żywo|not a live broadcast/gi, '');
    assert.doesNotMatch(label, /\blive\b|na żywo|on air/i, `${k}: zakazane oznaczenie transmisji na żywo`);
    assert.match(visible, /24\/7/);
  }
  assert.doesNotMatch(tvJs.replace(/\/\*[\s\S]*?\*\//, ''), /'[^']*\bLIVE\b[^']*'/);
});

test('wersja testowa: noindex, canonical, hreflang pl/en/x-default, OG, GA4', () => {
  for (const [k, html] of Object.entries(pages)) {
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/, k);
    assert.match(html, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/test\/spiritual-sounds\//, k);
    for (const l of ['pl', 'en', 'x-default']) assert.match(html, new RegExp(`hreflang="${l}"`), `${k} ${l}`);
    assert.match(html, /property="og:image"/, k);
    assert.match(html, /gtag\('config','G-Y4EFTVBPE3'/, k);
    assert.doesNotMatch(html, /Mission Control/i, k);
  }
  assert.match(pages.pl, /<html lang="pl"/);
  assert.match(pages.en, /<html lang="en"/);
  assert.match(pages.pl, /<title>Spiritual Sounds – Psalmy po polsku \| Christian Culture<\/title>/);
  assert.match(pages.en, /<title>Spiritual Sounds – Polish Psalms \| Christian Culture<\/title>/);
});

test('treść: Suno przedstawione neutralnie jako narzędzie, nie wykonawca', () => {
  assert.match(pages.pl, /Suno w płatnym planie Pro/);
  assert.match(pages.en, /assistance of Suno under a paid Pro plan/);
  for (const html of [pages.pl, pages.en]) assert.doesNotMatch(html, /Suno (jest|is) (artyst|an artist|wykonawc)/i);
});

test('trasy testowe i wydanie: pliki trafiają na hosting, adresy działają', () => {
  for (const f of ['test/spiritual-sounds/index.html', 'test/spiritual-sounds/en/index.html', 'test/spiritual-sounds/tv/index.html',
    'test/spiritual-sounds/tv/ss-tv.js', 'test/spiritual-sounds/ss.css', 'test/spiritual-sounds/img/ss-emblem-720.webp']) {
    assert.equal(isPublicFile(f), true, f);
  }
  const redirects = read('_redirects');
  for (const p of ['/test/spiritual-sounds/', '/test/spiritual-sounds/en/', '/test/spiritual-sounds/tv/']) {
    assert.match(redirects, new RegExp(`^${p.replace(/\//g, '\\/')} ${p.replace(/\//g, '\\/')}index\\.html 200`, 'm'));
  }
  assert.doesNotMatch(redirects, /^\/SpiritualSounds/m, 'produkcja dopiero po ✅ L0');
});

test('wszystkie lokalne zasoby z linków istnieją', () => {
  for (const html of Object.values(pages)) {
    for (const m of html.matchAll(/(?:src|href)="(\/test\/spiritual-sounds\/[^"?#]+\.(?:webp|png|jpg|css|js))/g)) {
      assert.ok(fs.existsSync(new URL(`..${m[1]}`, import.meta.url)), m[1]);
    }
  }
});
