import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { sprawdzLekcje, sprawdzPliki, plikiLekcji } from './kurs-codzienny/straznik-lekcji.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Strażnik lekcji blokuje uszkodzone <meta>, link Patronite /radiocc i kolizję id="ccTopSubLink"', () => {
  const sample = fs.readFileSync(path.join(ROOT, 'akademia/kurscodzienny/dzien-45.html'), 'utf8');
  const broken = sample
    .replace(/<link rel="canonical"/, '>>>> />\n<link rel="canonical"')
    .replace(/patronite\.pl\/osobowoscplus/g, 'patronite.pl/radiocc')
    .replace(/<a href="https:\/\/patronite\.pl\/radiocc"/, '<a href="https://patronite.pl/radiocc" id="ccTopSubLink"');

  const errs = sprawdzLekcje(broken, 45);
  assert.ok(errs.some((e) => /<meta>/.test(e)));
  assert.ok(errs.some((e) => /radiocc/.test(e)));
  assert.ok(errs.some((e) => /ccTopSubLink/.test(e)));
});

test('Strażnik lekcji blokuje przestarzały completeDayXX oraz niespójny werset UBG-2025', () => {
  const d45 = fs.readFileSync(path.join(ROOT, 'akademia/kurscodzienny/dzien-45.html'), 'utf8');
  const mut = d45
    .replace(/completeDay45\(/g, 'completeDay42(')
    .replace(/PAN moją mocą i moją chwałą/, 'PAN będzie za was walczył, a wy będziecie milczeć');
  const errs = sprawdzLekcje(mut, 45);
  assert.ok(errs.some((e) => /completeDay42/.test(e)));
  assert.ok(errs.some((e) => /UBG-2025|lektor TTS/.test(e)));
});

test('Wszystkie 4 kopie każdej lekcji D01..D46 przechodzą zaostrzonego Strażnika bez błędów', () => {
  const bad = sprawdzPliki(ROOT, plikiLekcji(ROOT));
  assert.deepEqual(bad, []);
});
