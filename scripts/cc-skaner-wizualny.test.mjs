import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MOJIBAKE_RE, fingerprint, toMarkdown, DEFAULT_PAGES } from './cc-skaner-wizualny.mjs';

test('CC Skaner: wykrywa krzaczki z prawdziwych usterek (×, ·, polskie litery), przepuszcza poprawny tekst', () => {
  for (const bad of ['Ă—', 'L0 Â· AUTORYZACJA', 'Ä… Ä™', 'Ĺ‚adowanie', 'Zrzut â€™', 'znak �']) assert.match(bad, MOJIBAKE_RE, bad);
  for (const ok of ['×', 'Zażółć gęślą jaźń · § ©', 'Ăłbęłe? nie: Ółtarz', 'Akceptuję', '—']) {
    if (ok.startsWith('Ăł')) continue; // „Ăł” to krzaczek „ó” — świadomie wykrywany
    assert.doesNotMatch(ok, MOJIBAKE_RE, ok);
  }
});

test('CC Skaner: odcisk usterki jest stały i zależy od strony, widoku, typu i klucza', () => {
  const f = { path: '/lumina', widok: 'telefon', typ: 'krzaczki', klucz: 'button|Ă—' };
  assert.equal(fingerprint(f), fingerprint({ ...f }));
  assert.notEqual(fingerprint(f), fingerprint({ ...f, widok: 'komputer' }));
  assert.match(fingerprint(f), /^[0-9a-f]{12}$/);
});

test('CC Skaner: raport Markdown grupuje usterki i mówi „brak usterek”, gdy czysto', () => {
  const meta = { base: 'https://polskieradio.cc', czas: 'T', strony: 1, widoki: 'telefon' };
  assert.match(toMarkdown([], meta), /Brak usterek/);
  const md = toMarkdown([{ id: 'abc', typ: 'kolizja', path: '/', widok: 'telefon', opis: '#a zasłonięty przez #b' }], meta);
  assert.match(md, /Kolizje przycisków \(1\)/);
  assert.match(md, /#a zasłonięty przez #b/);
});

test('CC Skaner: lista stron obejmuje kluczowe portale, workflow działa bez komputera L0 i tylko czyta kod', () => {
  for (const p of ['/', '/lumina', '/mojabiblia', '/wspieraj', '/biblia-audio/']) assert.ok(DEFAULT_PAGES.includes(p), p);
  const wf = fs.readFileSync(new URL('../.github/workflows/cc-skaner-wizualny.yml', import.meta.url), 'utf8');
  assert.match(wf, /schedule:/);
  assert.match(wf, /contents: read/);
  assert.doesNotMatch(wf, /contents: write|wrangler|pages deploy/);
});
