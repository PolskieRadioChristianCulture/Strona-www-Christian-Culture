// @007 2026-11-18 — Wizytówki CC premium v2 (TEST): katalog z artystami + nabór.
// Zasady L0 18.11.2026: prywatnych profili LUMINA nie promujemy; martwe linki usuwamy; standard SKILL_CC_FULL_PREMIUM_WWW.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { isPublicFile } from './cc-release-files.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const data = JSON.parse(read('data/wizytowki-katalog.json'));
const katalog = read('test/wizytowki/index.html');
const nabor = read('test/wizytowka/index.html');

// Prywatne profile osób w LUMINA — zakaz promowania (L0 18.11.2026).
const PRIVATE = ['/mariusz', '/jolawojcik', '/andrzejthiel', '/pawelmurawski', '/zofiadudek', '/magdalena', '/wiolettarogowska',
  '/lumina.magdalena', '/lumina.mariusz', '/lumina.jolawojcik', '/lumina.andrzejthiel', '/lumina.pawelmurawski', '/lumina.zofiadudek', '/lumina.wiolettarogowska'];

test('zasada L0: brak prywatnych profili LUMINA i martwych adresów w danych i na stronach', () => {
  const hrefs = data.karty.map((k) => k.href);
  for (const p of PRIVATE) {
    assert.ok(!hrefs.includes(p), `prywatny profil w danych: ${p}`);
    for (const html of [katalog, nabor]) assert.ok(!html.includes(`href="${p}"`), `prywatny profil na stronie: ${p}`);
  }
  for (const dead of ['/studiodobregoslowa', '/radiocc', '/magdalena']) assert.ok(!hrefs.includes(dead), `martwy link: ${dead}`);
  assert.ok(!data.kategorie.some((c) => c.id === 'lumina'), 'brak kategorii „Profile LUMINA”');
});

test('dane: unikalne id, istniejące obrazy, poprawne kategorie', () => {
  const ids = new Set(); const catIds = new Set(data.kategorie.map((c) => c.id));
  for (const k of data.karty) {
    assert.ok(!ids.has(k.id), `duplikat ${k.id}`); ids.add(k.id);
    assert.ok(k.href.startsWith('/'), k.href);
    assert.ok(k.cats.length && k.cats.every((c) => catIds.has(c)), `kategorie ${k.id}`);
    assert.ok(k.title && k.desc && k.eyebrow, `treść ${k.id}`);
    const img = k.img.split('?')[0].replace(/^\//, '');
    assert.ok(fs.existsSync(new URL(`../${img}`, import.meta.url)), `brak obrazu ${k.img}`);
  }
});

test('artyści i zespoły: Welch, Ark of Fire, Spiritual Sounds, JJ Beauvais w katalogu i na naborze', () => {
  const art = data.karty.filter((k) => k.cats.includes('artysci')).map((k) => k.href);
  for (const h of ['/Welch', '/ArkOfFire', '/SpiritualSounds/', '/Global/articles/jj-beauvais-two-songs-of-hope/']) {
    assert.ok(art.includes(h), h);
    assert.match(katalog, new RegExp(`class="acard" href="${h.replace(/\//g, '\\/')}"`));
    assert.match(nabor, new RegExp(`class="acard" href="${h.replace(/\//g, '\\/')}"`));
  }
});

test('katalog: każda karta w swojej kategorii głównej, licznik = liczba kart, filtry i wyszukiwarka', () => {
  const primaries = [...katalog.matchAll(/data-card data-primary="1"/g)].length;
  assert.equal(primaries, data.karty.length);
  assert.match(katalog, new RegExp(`Wszystkie <b>${data.karty.length}</b>`));
  assert.match(katalog, /id="q" type="search"/);
  for (const c of data.kategorie) assert.match(katalog, new RegExp(`data-f="${c.id}"`));
});

test('standard CC premium: noindex, GA4, gwiazdka w .header-right, Wspieram to, ticker, Polecamy, patronat', () => {
  for (const html of [katalog, nabor]) {
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(html, /gtag\('config','G-Y4EFTVBPE3'/);
    assert.match(html, /<div class="header-right nav__actions">/);
    assert.match(html, /js\/cc-favorites\.js/);
    assert.match(html, /class="support-btn" href="\/wspieraj"/);
    assert.match(html, /id="tickRun"/);
    assert.match(html, /id="promoStage"/);
    assert.match(html, /patronite\.pl\/osobowoscplus/);
    assert.match(html, /\/app-christian-culture\.png/);
    assert.doesNotMatch(html, /app-christian-culture\.webp|Mission Control/i);
    assert.match(html, /WYGENEROWANE: scripts\/wizytowki\/buduj\.mjs/);
  }
});

test('nabór: repertuar radia identyczny jak na /wizytówka, kreator i WhatsApp', () => {
  const prodStations = vm.runInNewContext(read('wizytowka/index.html').match(/var STATIONS = (\[[\s\S]*?\]);/)[1]);
  const json = JSON.parse(nabor.match(/<script type="application\/json" id="wzData">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(json.stations, JSON.parse(JSON.stringify(prodStations)));
  assert.equal(json.whatsapp, data.whatsapp);
  for (const id of ['cName', 'cField', 'cDesc', 'cWa', 'cCopy', 'pUrl', 'deckPlay', 'vFacade']) assert.match(nabor, new RegExp(`id="${id}"`), id);
});

test('generator jest źródłem prawdy (ponowne zbudowanie nie zmienia plików)', () => {
  const before = [katalog, nabor];
  execFileSync(process.execPath, [new URL('./wizytowki/buduj.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], { stdio: 'ignore' });
  assert.equal(read('test/wizytowki/index.html'), before[0]);
  assert.equal(read('test/wizytowka/index.html'), before[1]);
});

test('wydanie i trasy testowe', () => {
  for (const f of ['test/wizytowki/index.html', 'test/wizytowka/index.html', 'test/wizytowki/wz.css', 'test/wizytowki/wz.js', 'test/wizytowki/img/master-640.webp', 'js/cc-eco-bars.js']) assert.equal(isPublicFile(f), true, f);
  const r = read('_redirects');
  assert.match(r, /^\/test\/wizytowki\/ \/test\/wizytowki\/index\.html 200/m);
  assert.match(r, /^\/test\/wizytowka\/ \/test\/wizytowka\/index\.html 200/m);
});
