import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCourses, renderCourse, parseCards, parseLessons, searchItem } from './rozwiaz-problem/build.mjs';

test('Rozwiąż problem: każda strona kursu jest zgodna z pakietem (Word, fiszki, kurs.json)', () => {
  for (const c of loadCourses()) {
    const r = renderCourse(c.slug);
    assert.equal(fs.readFileSync(r.outFile, 'utf8').replace(/\r\n/g, '\n'), r.html, `${c.outFile} nieaktualna — node scripts/rozwiaz-problem/build.mjs build ${c.slug}`);
    assert.ok(r.days.length >= 7 && r.days.length <= 21, `${c.slug}: seria zakłada 7–21 lekcji`);
    assert.ok(!/\{\{\w+\}\}/.test(r.html), `${c.slug}: niewypełnione pole szablonu`);
  }
});

test('Rozwiąż problem: Rzuć palenie — 14 lekcji z Worda i 52 fiszki bez resztek LaTeX', () => {
  const r = renderCourse('rzuc-palenie');
  assert.equal(r.days.length, 14);
  assert.equal(r.days[0].title, 'Zacznij od prawdy');
  assert.equal(r.days[0].refs, 'J 8,32; Ps 139,23–24');
  assert.equal(r.cards.length, 52);
  assert.ok(r.cards.every((k) => !/\$|ightarrow/.test(k.q + k.a)));
  assert.match(r.html, /var KEY='rp\.rzuc-palenie\.v1';\n  var DAYS=14;/, 'klucz zapisu postępu uczestników nie może się zmienić');
});

test('Rozwiąż problem: kurs jest w wyszukiwarce CC i w mapie strony', () => {
  const cat = JSON.parse(fs.readFileSync('szukaj/catalog.json', 'utf8'));
  const pages = fs.readFileSync('sitemaps/pages.xml', 'utf8');
  for (const c of loadCourses()) {
    assert.deepEqual(cat.items.find((i) => i.url === c.url), searchItem(c), `${c.slug}: uruchom register`);
    assert.ok(pages.includes(`<loc>https://polskieradio.cc${c.path}</loc>`), `${c.slug}: brak w sitemaps/pages.xml`);
  }
});

test('Rozwiąż problem: parser fiszek i lekcji', () => {
  assert.deepEqual(parseCards('Pytanie?,"A $\\rightarrow$ B"\nDrugie,Odp'), [{ q: 'Pytanie?', a: 'A → B' }, { q: 'Drugie', a: 'Odp' }]);
  const ok = ['Dzień 1. Start', 'MYŚL PRZEWODNIA  •  Myśl', 'Dzisiaj rozumiemy', 'Nauka', 'Zadanie na dziś', 'Zadanie',
    'Biblia w codziennym życiu', 'Teksty do przeczytania w Biblii (x): J 1,1.Kontekst', 'Krótka modlitwa', 'Amen'];
  assert.deepEqual(parseLessons(ok).days[0], { n: 1, title: 'Start', thought: 'Myśl', learn: 'Nauka', task: 'Zadanie', refs: 'J 1,1', context: 'Kontekst', prayer: 'Amen' });
  assert.throws(() => parseLessons(ok.filter((l) => l !== 'Krótka modlitwa')), /Dzień 1: brak części „Krótka modlitwa”/);
});
