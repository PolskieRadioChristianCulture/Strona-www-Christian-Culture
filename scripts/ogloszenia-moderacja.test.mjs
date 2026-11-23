// CCN Ogłoszenia — regresja luki Patrona i moderacji (@007, 2026-11-23).
// Test statyczny (bez emulatora). Pełny test reguł na emulatorze: tests/ogloszenia-rules.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = p => readFile(new URL('../' + p, import.meta.url), 'utf8');

function userPostsBlock(rules) {
  const i = rules.indexOf('match /user_posts/{postId}');
  assert.ok(i > 0, 'brak bloku user_posts');
  return rules.slice(i, rules.indexOf('match /lumina_posts/', i));
}

test('Reguły user_posts: brak publicznego odczytu wszystkiego, create tylko pending i bez Patrona', async () => {
  const rules = await read('firestore.rules');
  const b = userPostsBlock(rules);
  assert.doesNotMatch(b, /allow read: if true/);
  assert.match(b, /resource\.data\.get\('status', ''\) == 'published'/);
  assert.match(b, /request\.resource\.data\.get\('status', ''\) == 'pending' &&\s*userPostNoPatron\(request\.resource\.data\)/);
  assert.match(b, /userPostPatronUnchanged\(\)/);
  assert.doesNotMatch(b, /allow update, delete/);
  assert.match(rules, /function userPostNoPatron\(d\)[\s\S]*?'featured'[\s\S]*?'isPatron'[\s\S]*?'patronBadge'/);
});

test('Store: zwykły członek zapisuje pending, Patron tylko od administratora, zdjęcie nieobowiązkowe', async () => {
  const s = await read('js/cc-ogloszenia-store.js');
  assert.match(s, /status: admin \? STATUS_PUBLISHED : STATUS_PENDING/);
  assert.match(s, /const patron = admin && !!\(ad && \(ad\.featured \|\| ad\.isPatron\)\)/);
  assert.match(s, /featured: patron,\s*isPatron: patron/);
  assert.match(s, /data\.status = STATUS_PENDING/);
  assert.match(s, /where\('status', '==', STATUS_PUBLISHED\)/);
  assert.match(s, /where\('authorUid', '==', u\.uid\)/);
  assert.match(s, /export|window\.CCOgloszeniaStore = \{ publish, update, remove, approve, reject/);
  assert.doesNotMatch(s, /Wymagane jest dodanie co najmniej jednego zdjęcia/);
  assert.doesNotMatch(s, /status: 'published',/);
  assert.match(s, /'wydarzenia', 'wspolpraca'/);
  assert.match(s, /'zamienie', 'szukam'/);
});

test('Strona i bundle: nowy bundle, bez OneSignal, kategorie z banera, moderacja w UI', async () => {
  for (const page of ['ogloszenia.html', 'ogloszenia/index.html']) {
    const h = await read(page);
    assert.doesNotMatch(h, /OneSignalSDK|OneSignal\.init/, page);
    assert.match(h, /\/assets\/ogloszenia-index-cc20261123\.js/, page);
    assert.match(h, /cc-ogloszenia-store\.js\?v=20261123_2/, page);
  }
  const b = await read('assets/ogloszenia-index-cc20261123.js');
  for (const label of ['Kupuj\\u0119', 'Sprzedaj\\u0119', 'Wymieniam', 'Wydarzenia', 'Wsp\\xF3\\u0142praca w misji', 'Czeka na zatwierdzenie', 'Zatwierd\\u017A', 'Opcjonalnie']) {
    assert.ok(b.includes(label), 'brak w bundlu: ' + label);
  }
  assert.ok(!b.includes('Wymagane jest dodanie co najmniej jednego zdj'), 'zdjęcie nadal wymagane');
  assert.ok(b.includes('CCOgloszeniaStore.isAdmin()'), 'checkbox Patrona nie jest ograniczony do admina');
  assert.ok(b.includes('hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#bb142e]'), 'drugi „Dodaj” na telefonie');
});
