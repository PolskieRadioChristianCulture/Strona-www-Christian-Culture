// @007 2026-11-15 — strażnik strony „Pomogę, bo mogę” w 5 językach.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JEZYKI, wczytaj, strona, plikWyniku } from './buduj.mjs';

const wszystkie = Object.fromEntries(JEZYKI.map((j) => [j, wczytaj(j)]));
const klucze = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? klucze(v, `${p}${k}.`) : [`${p}${k}${Array.isArray(v) ? `[${v.length}]` : ''}`])).sort();
const teksty = (o) => Object.values(o).flatMap((v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? teksty(v) : []));

test('wszystkie języki mają identyczny zestaw kluczy i żadnej pustej wartości', () => {
  const wzor = klucze(wszystkie.pl);
  for (const j of JEZYKI) {
    assert.deepEqual(klucze(wszystkie[j]), wzor, `${j}: inne klucze niż pl`);
    assert.ok(teksty(wszystkie[j]).every((t) => t.trim()), `${j}: pusta wartość`);
  }
});

test('obce wersje bez polskich resztek (poza nazwami własnymi i danymi przelewu)', () => {
  const dozwolone = /Rozwój Christian Culture|Dar misyjny|Wsparcie Christian Culture|Zrzutka\.pl|Złoty|złoty|Polskie Radio S\.A\./g;
  for (const j of JEZYKI.filter((x) => x !== 'pl')) {
    const html = strona(j, wszystkie).replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script>[\s\S]*?<\/script>/g, '');
    const widoczny = html.replace(/<[^>]+>/g, ' ').replace(dozwolone, '');
    const polskie = widoczny.match(/\S*[ąćęłńśźżĄĆĘŁŃŚŹŻ]\S*/g) || [];
    const bezNazw = polskie.filter((w) => !/^(Polski|ES|FR|DE|EN|PL)$/.test(w));
    assert.deepEqual(bezNazw.filter((w) => !['Polski'].includes(w)), [], `${j}: polskie słowa w treści`);
  }
});

test('dane płatności identyczne w każdym języku', () => {
  const MUSI = ['537 137 043', '74 2910 0006 2469 8002 1062 8039', '48 2910 0006 0000 0000 0527 2629', 'https://patronite.pl/osobowoscplus', 'https://revolut.me/christianculture', 'https://zrzutka.pl/z/ChristianCulture', 'https://zrzutka.pl/3bbxzn', 'Cezary Rogowski'];
  for (const j of JEZYKI) {
    const html = strona(j, wszystkie);
    for (const m of MUSI) assert.ok(html.includes(m), `${j}: brak ${m}`);
    assert.ok(!html.includes('patronite.pl/christian-culture'), `${j}: stary profil Patronite`);
    assert.equal((html.match(/hreflang="/g) || []).length >= 11, true, `${j}: brak hreflang`);
    assert.match(html, new RegExp(`<html lang="${j}">`));
    assert.match(html, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/pomogebomoge(\/[a-z]{2})?" \/>/);
  }
});

test('pliki na stronie = wynik generatora (zmiany tylko przez locales i szablon)', () => {
  const lf = (s) => s.replace(/\r\n/g, '\n'); // Git na Windows może zapisać CRLF — porównujemy treść, nie końce linii
  for (const j of JEZYKI) assert.equal(lf(fs.readFileSync(plikWyniku(j), 'utf8')), lf(strona(j, wszystkie)), `${plikWyniku(j)} różni się od generatora`);
});

test('nigdy głos systemowy, zawsze oficjalne logo CC (PNG)', () => {
  for (const j of JEZYKI) {
    const html = strona(j, wszystkie);
    assert.doesNotMatch(html, /speechSynthesis/);
    assert.match(html, /src="\/app-christian-culture\.png"/);
  }
});
