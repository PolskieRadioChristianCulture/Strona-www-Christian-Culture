// @007 2026-11-18 — Wizytówki CC premium v2 (PRODUKCJA po ✅ L0): katalog z artystami + nabór.
// Zasady L0 18.11.2026: prywatnych profili LUMINA nie promujemy; martwe linki usuwamy; twarzy i logotypów nie ucinamy;
// ogonki liter nie mogą być obcięte; standard SKILL_CC_FULL_PREMIUM_WWW.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isPublicFile } from './cc-release-files.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const data = JSON.parse(read('data/wizytowki-katalog.json'));
const katalog = read('wizytowki/index.html');
const nabor = read('wizytowka/index.html');

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
  assert.match(katalog, /id="wizytowkiSearch" type="search"/);
  for (const c of data.kategorie) assert.match(katalog, new RegExp(`data-f="${c.id}"`));
});

test('standard CC premium (produkcja): index, GA4, gwiazdka w .header-right, Wspieram to, ticker, Polecamy, patronat', () => {
  for (const html of [katalog, nabor]) {
    assert.match(html, /<meta name="robots" content="index,follow">/);
    assert.doesNotMatch(html, /\/test\/wizytowk/);
    assert.match(html, /\/wizytowki\/wz\.(css|js)\?v=/);
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

test('nabór: radio 11 stacji, kreator, WhatsApp, licznik Pierwszy Milion', () => {
  const json = JSON.parse(nabor.match(/<script type="application\/json" id="wzData">([\s\S]*?)<\/script>/)[1]);
  assert.equal(json.stations.length, 11);
  assert.equal(json.whatsapp, data.whatsapp);
  for (const id of ['cName', 'cField', 'cDesc', 'cWa', 'cCopy', 'pUrl', 'deckPlay', 'vFacade']) assert.match(nabor, new RegExp(`id="${id}"`), id);
  assert.match(nabor, /<strong data-count>/);
  assert.match(read('wizytowki/wz.js'), /\/api\/milion\/count/);
});

test('generator jest źródłem prawdy (ponowne zbudowanie nie zmienia plików), obie kopie zsynchronizowane', () => {
  const before = [katalog, nabor];
  assert.equal(read('wizytowki.html'), katalog);
  assert.equal(read('wizytowka.html'), nabor);
  execFileSync(process.execPath, [new URL('./wizytowki/buduj.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], { stdio: 'ignore' });
  assert.equal(read('wizytowki/index.html'), before[0]);
  assert.equal(read('wizytowka/index.html'), before[1]);
});

test('wydanie, trasy, kadrowanie zdjęć i ogonki liter (L0 18.11)', () => {
  for (const f of ['wizytowki/index.html', 'wizytowka/index.html', 'wizytowki/wz.css', 'wizytowki/wz.js', 'wizytowki/img/master-640.webp', 'js/cc-eco-bars.js']) assert.equal(isPublicFile(f), true, f);
  const r = read('_redirects');
  assert.match(r, /^\/test\/wizytowki\/ \/wizytowki 301/m);
  assert.match(r, /^\/test\/wizytowka\/ \/wizytowka 301/m);
  for (const id of ['welch', 'cezary', 'zaneta', 'ewa', 'coaching', 'herbatka', 'heatfix', 'wioletta', 'jjbeauvais']) assert.ok(data.karty.find((k) => k.id === id).pos, `punkt kadru: ${id}`);
  for (const id of ['arkoffire', 'p-ccwomen', 'yis', 'p-osobowosc']) assert.equal(data.karty.find((k) => k.id === id).fit, 'contain', id);
  assert.match(katalog, /object-position:50% 22%/);
  const css = read('wizytowki/wz.css');
  assert.match(css, /\.hero h1 \.l\{display:block;overflow:hidden;padding:0 \.08em \.24em 0/, 'zapas na ogonki liter (maska)');
  assert.match(css, /\.hero h1 \.l>span\{padding-bottom:\.2em;margin-bottom:-\.2em/, 'zapas na ogonki liter (gradient)');
  assert.match(css, /\.ring__logo\{position:absolute;z-index:5;left:50%;top:0/, 'logo nad karuzelą');
});
