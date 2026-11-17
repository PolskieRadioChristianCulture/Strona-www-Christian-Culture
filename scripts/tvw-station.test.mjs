// @007 2026-11-17 — TVW Telewizja Kobiet: ramówka, kanał CC Women, adres /TVW.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('tvw.html');

// Wycinamy z tvw.html samą konfigurację i logikę ramówki (bez DOM) i uruchamiamy ją w piaskownicy.
function loadSchedule() {
    const start = html.indexOf('        // Playlisty kanału YouTube @CCWomen7');
    const end = html.indexOf('        // ── Silnik dwóch ramek');
    assert.ok(start > 0 && end > start, 'nie znaleziono bloku ramówki w tvw.html');
    const code = html.slice(start, end).replace(/window\.TVW = /, 'globalThis.TVW = ');
    const ctx = { window: {}, Math, Date, encodeURIComponent, Object, Number, globalThis: null };
    ctx.globalThis = ctx;
    vm.runInNewContext(code + '\n;globalThis.TVW_PLAYLISTS = TVW_PLAYLISTS; globalThis.TVW_RAMOWKA = TVW_RAMOWKA;', ctx);
    return ctx;
}

test('ramówka pokrywa całą dobę bez dziur i nakładek', () => {
    const { TVW_RAMOWKA } = loadSchedule();
    const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    assert.equal(TVW_RAMOWKA[0].from, '00:00');
    assert.equal(TVW_RAMOWKA[TVW_RAMOWKA.length - 1].to, '24:00');
    for (let i = 1; i < TVW_RAMOWKA.length; i++) assert.equal(TVW_RAMOWKA[i].from, TVW_RAMOWKA[i - 1].to, `przerwa przed ${TVW_RAMOWKA[i].from}`);
    for (const s of TVW_RAMOWKA) assert.ok(toMin(s.to) > toMin(s.from));
});

test('każde pasmo gra playlistę CC Women przez kanał tvw-women-live', () => {
    const { TVW, TVW_PLAYLISTS, TVW_RAMOWKA } = loadSchedule();
    for (const s of TVW_RAMOWKA) {
        assert.ok(TVW_PLAYLISTS[s.ch], `brak playlisty ${s.ch}`);
        assert.match(TVW.channels[s.ch].url, /^tvw-women-live\.html\?playlist=PL[\w-]+&show=/);
    }
    assert.ok(fs.existsSync(path.join(root, 'tvw-women-live.html')));
    assert.ok(!Object.values(TVW_PLAYLISTS).some((p) => /kids/i.test(p.title)), 'treści dla dzieci nie należą do TVW');
});

test('getScheduleState: o każdej pełnej godzinie zwraca istniejący kanał, okno odpoczynku bez publicznego oznaczenia', () => {
    const { TVW } = loadSchedule();
    for (let h = 0; h < 24; h++) {
        const st = TVW.getScheduleState(new Date(2026, 10, 17, h, 30));
        assert.ok(st.channel && st.meta && st.slot, `godz. ${h}`);
    }
    assert.doesNotMatch(html, /szabat|sabat|sabbath/i);
});

test('branding i dostęp: logo TVW, /TVW w _redirects, GA4, wersja osadzona bez pasków', () => {
    for (const f of ['images/tvw/tvw-logo.webp', 'images/tvw/tvw-logo-360.webp', 'images/tvw/tvw-og.jpg']) assert.ok(fs.existsSync(path.join(root, f)), f);
    assert.match(read('_redirects'), /^\/TVW \/tvw 200$/m);
    for (const f of ['tvw.html', 'tvw-women-live.html']) {
        const s = read(f);
        assert.match(s, /G-Y4EFTVBPE3/);
        assert.match(s, /\/js\/cc-analytics\.js/);
        assert.doesNotMatch(s, /Mission Control/i);
    }
    assert.match(html, /html\.tvw-embedded \.tvw-top, html\.tvw-embedded \.tvw-ticker/);
    assert.doesNotMatch(html, /prefers-reduced-motion/, 'L0 ma ograniczony ruch w Windows — animacji nie wyłączamy');
});

test('/test/ccwomen: hero na 100% ekranu, osadzona stacja TVW (tryb telewizora), noindex, logo CC', () => {
    const page = read('test/ccwomen/index.html');
    assert.match(page, /\.hero\{[^}]*min-height:100svh/);
    assert.match(page, /<iframe id="tvwFrame"[^>]+src="\/tvw\?tv=1&amp;muted=1"/);
    assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(page, /\/app-christian-culture\.png/);
    assert.match(html, /\[\?&\]tv=1\b/, 'tvw.html musi obsługiwać tryb ?tv=1');
    for (const f of ['test/ccwomen/hero-ccwomen-1920.webp', 'test/ccwomen/hero-ccwomen-portrait.webp']) {
        assert.ok(fs.statSync(path.join(root, f)).size < 250 * 1024, f);
    }
    assert.doesNotMatch(page, /prefers-reduced-motion/);
});
