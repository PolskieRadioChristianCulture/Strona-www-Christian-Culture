// Strażnik lekcji KC (@007, 2026-11-03): testy na prawdziwych danych — wadliwe wersje z historii git
// i wszystkie obecne lekcje w repo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sprawdzLekcje, sprawdzPliki, plikiLekcji } from './kurs-codzienny/straznik-lekcji.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const zGita = (rev, plik) => execFileSync('git', ['show', `${rev}:${plik}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });

test('Dzień 34 opublikowany 02.11 (908ac76b) z resztkami Dnia 33 jest zablokowany', () => {
  const bledy = sprawdzLekcje(zGita('908ac76b', 'akademia/kurscodzienny/dzien-34.html'), 34).join('\n');
  for (const oczekiwany of ['podtytuł pod nagłówkiem: Wj 2', 'opis obrazu (alt): Dzień 33', 'podpis „Czytanie:”: Wj 2', 'nagłówek Stronga: Wj 2',
    'zadanie „Przeczytaj cały fragment”: Wj 2', 'zadanie „Po przeczytaniu”: Wj 2', 'plakietka „Dzień N z 2009”: Dzień 33',
    'przycisk „Oznacz Dzień N”: Dzień 33', 'link udostępniania prowadzi do dzien-33', 'odwołania do Dnia 33']) {
    assert.ok(bledy.includes(oczekiwany), `brak błędu „${oczekiwany}” w:\n${bledy}`);
  }
});

test('Dzień 8 sprzed poprawki (f1bace36) — werset i obraz z Dnia 7 są zablokowane', () => {
  const bledy = sprawdzLekcje(zGita('f1bace36', 'akademia/kurscodzienny/dzien-08.html'), 8).join('\n');
  assert.match(bledy, /podpis wersetu do zapamiętania: rozdział 9 poza czytaniem dnia \(Rdz 10–11\)/);
  assert.match(bledy, /„udostępnij werset” wskazuje dzien-07/);
  assert.match(bledy, /opis obrazu \(alt\): Dzień 7 zamiast 8/);
});

test('Dzień 22 sprzed poprawki (f1bace36) — udostępnianie prowadzi do Dnia 21', () => {
  const bledy = sprawdzLekcje(zGita('f1bace36', 'akademia/kurscodzienny/dzien-22.html'), 22).join('\n');
  assert.match(bledy, /link udostępniania prowadzi do dzien-21/);
});

test('Wszystkie obecne lekcje w repo (4 kopie każdego dnia) są spójne', () => {
  const pliki = plikiLekcji(ROOT);
  assert.ok(pliki.length >= 4 * 34, `za mało plików lekcji: ${pliki.length}`);
  assert.deepEqual(sprawdzPliki(ROOT, pliki), []);
});
