// @007 2026-11-18 — Spiritual Sounds × CC (wersja testowa): kontrakt kanału 24/7 i wizytówki PL/EN.
// Dyrektywa §17 (player), §13 (SEO na TEST = noindex), §20 (definicja DONE).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { isPublicFile } from './cc-release-files.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const tvJs = read('SpiritualSounds/tv/ss-tv.js');
// Plik przeglądarkowy (repo ma "type": "module") — wczytujemy w piaskownicy vm jak skrypt klasyczny.
const sandbox = { module: { exports: {} } };
vm.runInNewContext(tvJs, sandbox);
const tv = sandbox.module.exports;
const pages = {
  pl: read('SpiritualSounds/index.html'),
  en: read('SpiritualSounds/en/index.html'),
  tv: read('SpiritualSounds/tv/index.html'),
};

test('playlista autora jest jedynym źródłem (bez ręcznej listy filmów)', () => {
  assert.equal(tv.SS_PLAYLIST, 'PLD0gxYiiSZMA');
  assert.equal((tvJs.match(/PLD0gxYiiSZMA/g) || []).length, 1, 'ID playlisty tylko w jednej stałej');
  assert.doesNotMatch(tvJs, /videoId\s*:|playlist\s*:\s*\[|cuePlaylist\(\s*\[/, 'zakaz statycznej listy filmów');
  // Tryb kolejki (18.11): loadVideoById WYŁĄCZNIE z kolejki Q, a Q WYŁĄCZNIE z odpowiedzi Workera (cała playlista autora).
  assert.deepEqual(tvJs.match(/loadVideoById\([^)]*\)/g), ['loadVideoById(Q[qi].id)']);
  assert.deepEqual(tvJs.match(/\bQ = [^;=]+;/g), ['Q = items;']);
  assert.match(tvJs, /fetch\('\/api\/spiritual-sounds\/playlist\?list=' \+ SS_PLAYLIST/);
  // Tryb playlisty (bez klucza): jak dotąd.
  assert.match(tvJs, /vars\.listType = 'playlist'; vars\.list = SS_PLAYLIST; vars\.loop = 1;/);
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

test('wersja produkcyjna: index,follow, canonical, hreflang pl/en/x-default, OG, GA4', () => {
  for (const [k, html] of Object.entries(pages)) {
    assert.match(html, /<meta name="robots" content="index,follow">/, k);
    assert.match(html, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/SpiritualSounds\//, k);
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

test('trasy produkcyjne i wydanie: pliki trafiają na hosting, adresy działają', () => {
  for (const f of ['SpiritualSounds/index.html', 'SpiritualSounds/en/index.html', 'SpiritualSounds/tv/index.html',
    'SpiritualSounds/tv/ss-tv.js', 'SpiritualSounds/ss.css', 'SpiritualSounds/img/ss-emblem-720.webp']) {
    assert.equal(isPublicFile(f), true, f);
  }
  const redirects = read('_redirects');
  for (const p of ['/SpiritualSounds/', '/SpiritualSounds/en/', '/SpiritualSounds/tv/']) {
    assert.match(redirects, new RegExp(`^${p.replace(/\//g, '\\/')} ${p.replace(/\//g, '\\/')}index\\.html 200`, 'm'));
  }
});

test('wszystkie lokalne zasoby z linków istnieją', () => {
  for (const html of Object.values(pages)) {
    for (const m of html.matchAll(/(?:src|href)="(\/SpiritualSounds\/[^"?#]+\.(?:webp|png|jpg|css|js))/g)) {
      assert.ok(fs.existsSync(new URL(`..${m[1]}`, import.meta.url)), m[1]);
    }
  }
});

// ---------- v2 (18.11.2026, po uwagach L0): wzorce Master, patronat, żywe dane ----------
const ecoJs = read('SpiritualSounds/ss-eco.js');
const ecoBox = { module: { exports: {} } };
vm.runInNewContext(ecoJs, ecoBox);
const eco = ecoBox.module.exports;

test('v2: patronat „Wspieram to” na wszystkich stronach (link /wspieraj) + Patronite na wizytówce', () => {
  assert.match(pages.pl, /href="\/wspieraj"[^>]*>[\s\S]{0,400}?Wspieram to/);
  assert.match(pages.en, /href="\/wspieraj"[^>]*>[\s\S]{0,400}?I support this/);
  assert.match(pages.tv, /class="tv-support" href="\/wspieraj"/);
  assert.match(pages.tv, /class="tv-patron" href="\/wspieraj"/);
  for (const html of [pages.pl, pages.en]) assert.match(html, /https:\/\/patronite\.pl\/osobowoscplus/);
});

test('v2: paski informacyjne i „Polecamy” jak w Master (górny + dolny pasek z zegarem, panel, belki)', () => {
  for (const html of [pages.pl, pages.en]) { assert.match(html, /id="tickRun"/); assert.match(html, /id="promoStage"/); }
  for (const id of ['tv-tick', 'tv-bottom-run', 'tv-clock', 'tv-promo-stage', 'tv-l3', 'tv-upnext', 'tv-promo-l3', 'tv-ambient']) {
    assert.match(pages.tv, new RegExp(`id="${id}"`), id);
  }
  assert.ok(eco.PROMOS.length >= 6, 'promocja ekosystemu');
  assert.ok(eco.PROMOS.some((p) => p.id === 'wspieraj' && p.href === '/wspieraj'));
  assert.ok(eco.PROMOS.some((p) => p.id === 'ccwomen' && p.img && p.img.startsWith('/assets/promo/promo-ccwomen-16x9.webp')));
  assert.equal(isPublicFile('assets/promo/promo-ccwomen-16x9.webp'), true);
  const tk = eco.ticker('pl').map((x) => x.id);
  for (const id of ['now', 'latest', 'wspieraj', 'patronite']) assert.ok(tk.includes(id), id);
  for (const l of ['pl', 'en']) {
    const txt = eco.ticker(l).map((x) => `${x.b} ${x.t}`).join(' ') + eco.PROMOS.map((p) => `${p.h} ${p.hEn} ${p.p} ${p.pEn}`).join(' ');
    assert.doesNotMatch(txt, /\blive\b|na żywo/i, `${l}: bez fałszywego LIVE`);
  }
});

test('v2: ten sam start kanału na wizytówce i w /tv (wspólny seedIndex)', () => {
  for (const n of [2, 50, 200]) for (const h of [0, 5, 23]) {
    const ms = Date.UTC(2026, 10, 18, h);
    assert.equal(eco.seedIndex(n, ms), tv.seedIndex(n, ms));
  }
});

test('v2: ?v= z „Najnowszych” — tylko poprawne ID YouTube, nadal w kontekście playlisty', () => {
  assert.equal(tv.deepLinkId('?v=dFsyIS_vAVY'), 'dFsyIS_vAVY');
  assert.equal(tv.deepLinkId('?lang=en&v=dFsyIS_vAVY'), 'dFsyIS_vAVY');
  assert.equal(tv.deepLinkId('?v=<script>'), '');
  assert.equal(tv.deepLinkId('?v=dFsyIS_vAVYxx'), '');
  assert.match(tvJs, /opts\.videoId = DEEP;/);
});

// ---------- 18.11: pełna playlista (YouTube Data API, klucz tylko w sekrecie Cloudflare) ----------
test('kolejka: tylko poprawne ID YouTube, bez powtórzeń, kolejność autora', () => {
  const q = [...tv.sanitizeQueue([{ id: 'dFsyIS_vAVY', title: 'A' }, { id: 'dFsyIS_vAVY', title: 'dup' }, { id: '<script>' }, { id: 'jjS2__6YEog', title: 'B' }, null])];
  assert.deepEqual(JSON.parse(JSON.stringify(q)), [{ id: 'dFsyIS_vAVY', title: 'A' }, { id: 'jjS2__6YEog', title: 'B' }]);
  assert.deepEqual([...tv.sanitizeQueue('nie-lista')], []);
  // pełna kolejka (312) nie jest „ucięta” — następne pozycje zawijają się na początek
  assert.deepEqual([...tv.upcoming(312, 311, 2, false)], [0, 1]);
  assert.deepEqual([...tv.upcoming(200, 199, 2)], [], 'tryb playlisty (ucięta lista) — bez ręcznego zawijania');
  assert.ok(tvJs.includes('upcoming(n, cur, 8, !Q && isCapped(n))'), 'w trybie kolejki lista nie jest „ucięta”');
});

test('endpoint pełnej playlisty: bez klucza 503, z kluczem cała lista stronami, klucz nigdy w odpowiedzi', async () => {
  const feed = await import('../services/spiritual-sounds/feed-service.js');
  const req = (q = '') => new Request(`https://x/api/spiritual-sounds/playlist${q}`);
  const noKey = await feed.handleSpiritualSoundsPlaylist(req(), {}, null, async () => { throw new Error('bez klucza nie wolno pytać API'); });
  assert.equal(noKey.status, 503);
  assert.equal((await noKey.json()).reason, 'brak-klucza');
  const bad = await feed.handleSpiritualSoundsPlaylist(req('?list=PLobca'), { YT_API_KEY: 'k' }, null, async () => { throw new Error('x'); });
  assert.equal(bad.status, 400);

  const SECRET = 'TEST-KLUCZ-XYZ';
  const calls = [];
  const page = (ids, next) => ({ ok: true, json: async () => ({ nextPageToken: next, items: ids.map((id, i) => ({ snippet: { title: id === 'deleted0000' ? 'Deleted video' : `Psalm ${id}`, resourceId: { videoId: id }, videoOwnerChannelId: 'UCaSBnRGUiiE-ySLlHacGpeQ' }, status: { privacyStatus: 'public' } })) }) });
  const fake = async (u) => {
    calls.push(u);
    assert.ok(u.startsWith('https://www.googleapis.com/youtube/v3/playlistItems?'));
    return new URL(u).searchParams.get('pageToken') ? page(['jjS2__6YEog', 'deleted0000'], '') : page(['dFsyIS_vAVY', 'A5ARrYwA9-4'], 'P2');
  };
  const ok = await feed.handleSpiritualSoundsPlaylist(req(), { YT_API_KEY: SECRET }, null, fake);
  const text = await ok.text();
  assert.equal(ok.status, 200);
  assert.equal(calls.length, 2, 'dwie strony');
  const body = JSON.parse(text);
  assert.deepEqual(body.items.map((x) => x.id), ['dFsyIS_vAVY', 'A5ARrYwA9-4', 'jjS2__6YEog'], 'bez usuniętych, kolejność autora');
  assert.equal(body.total, 3);
  assert.ok(!text.includes(SECRET), 'klucz nie może trafić do odpowiedzi');

  const failing = await feed.handleSpiritualSoundsPlaylist(req(), { YT_API_KEY: SECRET }, null, async () => ({ ok: false, status: 403, json: async () => ({}) }));
  const ftext = await failing.text();
  assert.equal(failing.status, 502);
  assert.ok(!ftext.includes(SECRET), 'klucz nie może trafić do komunikatu błędu');
  assert.match(read('_worker.js'), /url\.pathname === '\/api\/spiritual-sounds\/playlist'\) \{\s*return handleSpiritualSoundsPlaylist\(request, env, ctx\);/);
});

test('klucz YouTube nie jest nigdzie zapisany w repozytorium (tylko sekret YT_API_KEY)', () => {
  for (const f of ['services/spiritual-sounds/feed-service.js', 'SpiritualSounds/tv/ss-tv.js', '_worker.js', 'wrangler.toml']) {
    let src = ''; try { src = read(f); } catch { continue; }
    assert.doesNotMatch(src, /AIza[0-9A-Za-z_-]{20,}/, `klucz Google w pliku ${f}`);
  }
});

test('v2: endpoint najnowszych nagrań — tylko playlisty Spiritual Sounds, parsowanie RSS', async () => {
  const feed = await import('../services/spiritual-sounds/feed-service.js');
  const xml = '<feed><yt:channelId>UCaSBnRGUiiE-ySLlHacGpeQ</yt:channelId><title>Psalmy &amp; Słowo</title>'
    + '<entry><yt:videoId>dFsyIS_vAVY</yt:videoId><title>Psalm 19 &quot;śpiewany&quot;</title><published>2026-11-10T17:30:14+00:00</published></entry></feed>';
  const p = feed.parseYouTubeFeed(xml);
  assert.equal(p.items.length, 1);
  assert.equal(p.items[0].title, 'Psalm 19 "śpiewany"');
  const bad = await feed.handleSpiritualSoundsFeed(new Request('https://x/api/spiritual-sounds/feed?list=PLinny'), null, async () => { throw new Error('nie wolno pobierać'); });
  assert.equal(bad.status, 400);
  const ok = await feed.handleSpiritualSoundsFeed(new Request('https://x/api/spiritual-sounds/feed'), null, async () => new Response(xml));
  const body = await ok.json();
  assert.equal(ok.status, 200);
  assert.equal(body.items[0].id, 'dFsyIS_vAVY');
  const foreign = await feed.handleSpiritualSoundsFeed(new Request('https://x/api/spiritual-sounds/feed'), null, async () => new Response(xml.replace('UCaSBnRGUiiE-ySLlHacGpeQ', 'UCinnykanal')));
  assert.equal(foreign.status, 502, 'cudzy kanał odrzucony');
  assert.match(read('_worker.js'), /url\.pathname === '\/api\/spiritual-sounds\/feed'/);
});

test('v2: wizytówka PL/EN wygenerowana z jednego źródła (scripts/spiritual-sounds/buduj.mjs)', () => {
  for (const html of [pages.pl, pages.en]) assert.match(html, /WYGENEROWANE: scripts\/spiritual-sounds\/buduj\.mjs/);
  assert.equal(isPublicFile('test/spiritual-sounds/ss-eco.js'), true);
  assert.equal(isPublicFile('scripts/spiritual-sounds/buduj.mjs'), false);
});
