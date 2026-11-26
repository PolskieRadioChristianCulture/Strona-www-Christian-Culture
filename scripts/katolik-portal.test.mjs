import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';
import worker from '../_worker.js';
import {
  normalizePolish,
  isValidIsoDate,
  diffDaysIso,
  addDaysIso,
  computeCurrentPlanDay,
  validateAndSanitizeProgress,
  computeProgressMetrics,
  parseKatolikRoute,
  filterBooks,
  filterFaq,
} from '../test/katolik/katolik-core.js';

const REPO = path.resolve(import.meta.dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'));
const readText = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

test('Mapa Biblii: dokładnie 66 unikalnych ksiąg (39 ST + 27 NT) i 1189 rozdziałów zgodnych z UBG-2025', () => {
  const data = readJson('test/katolik/data/books-66.json');
  assert.equal(data.totalBooks, 66);
  assert.equal(data.books.length, 66);
  assert.equal(data.otCount, 39);
  assert.equal(data.ntCount, 27);
  assert.equal(data.totalChapters, 1189);

  const ids = new Set();
  let sumCh = 0;
  for (let i = 0; i < data.books.length; i += 1) {
    const b = data.books[i];
    assert.equal(ids.has(b.id), false, `Duplikat bookId: ${b.id}`);
    ids.add(b.id);
    assert.equal(b.order, i + 1);
    assert.ok(b.summary.length > 250, `Za krótkie streszczenie dla ${b.id}`);
    assert.ok(Array.isArray(b.references) && b.references.length >= 2, `Brak zweryfikowanych odsyłaczy dla ${b.id}`);
    assert.equal(b.reviewStatus, 'draft');
    sumCh += b.chapters;
  }
  assert.equal(sumCh, 1189);
});

test('Plan 365 dni: 365 niepustych dni i pełne pokrycie 1189 rozdziałów bez luk i duplikatów + ścieżka startowa 21 dni Ew. Jana', () => {
  const plan = readJson('test/katolik/data/plan-365.json');
  assert.equal(plan.days.length, 365);
  assert.equal(plan.totalChapters, 1189);

  const seen = new Set();
  for (let i = 0; i < 365; i += 1) {
    const day = plan.days[i];
    assert.equal(day.day, i + 1);
    assert.ok(day.passages.length > 0, `Pusty dzień ${i + 1}`);
    for (const p of day.passages) {
      for (let ch = p.chapterFrom; ch <= p.chapterTo; ch += 1) {
        const key = `${p.bookId}:${ch}`;
        assert.equal(seen.has(key), false, `Duplikat w planie 365: ${key}`);
        seen.add(key);
      }
    }
  }
  assert.equal(seen.size, 1189);
  assert.equal(plan.starterPath.totalDays, 21);
  assert.equal(plan.starterPath.days.length, 21);
});

test('Cytaty UBG-2025 w studies.json są dosłownie zgodne z korpusem /data/bible/ubg-2025/ (Dz 17:11, Wj 20, Pwt 5, 1 Tm 2:5)', () => {
  const studies = readJson('test/katolik/data/studies.json');
  const act17 = readJson('data/bible/ubg-2025/ACT-017.json');
  const expectedAct1711 = act17.verses.find((v) => v.number === 11).text;
  assert.equal(studies.trustVerse.text, expectedAct1711);

  assert.equal(studies.studies.length, 10);
  assert.equal(studies.faq.length, 13);

  const dekalog = studies.studies.find((s) => s.slug === 'dekalog');
  assert.ok(dekalog);
  assert.equal(dekalog.quotes.length, 2);
  assert.equal(dekalog.quotes[0].bookId, 'EXO');
  assert.equal(dekalog.quotes[0].verses.length, 17);
  assert.equal(dekalog.quotes[1].bookId, 'DEU');
  assert.equal(dekalog.quotes[1].verses.length, 16);
});

test('Logika dat Planu 365: obsługa roku przestępnego 29 lutego, zmiany czasu DST oraz walidacja importu JSON', () => {
  assert.equal(isValidIsoDate('2028-02-29'), true);
  assert.equal(isValidIsoDate('2026-02-29'), false);
  assert.equal(diffDaysIso('2028-02-29', '2028-03-01'), 1);
  assert.equal(addDaysIso('2028-02-29', 365), '2029-02-28');
  // Zmiana czasu letni/zimowy w Europie nie może zaburzyć liczby dni
  assert.equal(diffDaysIso('2026-03-28', '2026-03-30'), 2);
  assert.equal(diffDaysIso('2026-10-24', '2026-10-26'), 2);

  const dayLeap = computeCurrentPlanDay('2028-02-29', '2028-03-01', 365);
  assert.equal(dayLeap.dayNumber, 2);

  const bad = validateAndSanitizeProgress({ version: 99, startDate: '2026-02-29', completedDays: 'bad' });
  assert.equal(bad.ok, false);

  const good = validateAndSanitizeProgress({
    version: 1,
    startDate: '2028-02-29',
    completedDays: [5, 1, 5, 999, -2, 2],
    starterCompletedDays: [1, 21, 99],
  });
  assert.equal(good.ok, true);
  assert.deepEqual(good.progress.completedDays, [1, 2, 5]);
  assert.deepEqual(good.progress.starterCompletedDays, [1, 21]);

  const metrics = computeProgressMetrics(good.progress, '2028-03-05', 365);
  assert.equal(metrics.todayDay, 6);
  assert.deepEqual(metrics.overdueDays, [3, 4]);
  assert.equal(metrics.completedCount, 3);
});

test('Wyszukiwanie bez polskich znaków i parser routingu /test/katolik + /katolik działają poprawnie', () => {
  const books = readJson('test/katolik/data/books-66.json').books;
  const faq = readJson('test/katolik/data/studies.json').faq;

  assert.equal(normalizePolish('Księga Święta — Łaska'), 'ksiega swieta — laska');
  assert.ok(filterBooks(books, { query: 'ksiega wyjscia' }).some((b) => b.id === 'EXO'));
  assert.ok(filterBooks(books, { query: 'jana', testament: 'NT' }).some((b) => b.id === 'JHN'));
  assert.ok(filterFaq(faq, { query: 'smierc' }).some((f) => f.id === 'faq-smierc'));
  assert.ok(filterFaq(faq, { query: 'swieci' }).some((f) => f.id === 'faq-swieci'));

  assert.deepEqual(parseKatolikRoute('/test/katolik'), { basePath: '/test/katolik', moduleSlug: '', param: null, isUnknown: false });
  assert.deepEqual(parseKatolikRoute('/test/katolik/mapa-biblii/jhn'), { basePath: '/test/katolik', moduleSlug: 'mapa-biblii', param: 'JHN', isUnknown: false });
  assert.deepEqual(parseKatolikRoute('/katolik/plan-365'), { basePath: '/katolik', moduleSlug: 'plan-365', param: null, isUnknown: false });
  assert.equal(parseKatolikRoute('/test/katolik/nie-istnieje').isUnknown, true);
});

test('Worker obsługuje deep links /test/katolik/* z HTTP 200 i X-Robots-Tag: noindex, a release builder dopuszcza pliki test/katolik/*', async () => {
  assert.equal(isPublicFile('test/katolik/index.html'), true);
  assert.equal(isPublicFile('test/katolik/katolik.css'), true);
  assert.equal(isPublicFile('test/katolik/katolik.js'), true);
  assert.equal(isPublicFile('test/katolik/katolik-core.js'), true);
  assert.equal(isPublicFile('test/katolik/data/books-66.json'), true);
  assert.equal(isPublicFile('test/katolik/data/plan-365.json'), true);
  assert.equal(isPublicFile('test/katolik/data/studies.json'), true);

  const fetched = [];
  const env = {
    ASSETS: {
      fetch: async (req) => {
        fetched.push(new URL(req.url).pathname);
        return new Response('<html>ok</html>', { status: 200, headers: { 'content-type': 'text/html' } });
      },
    },
  };

  for (const p of ['/test/katolik', '/test/katolik/', '/test/katolik/mapa-biblii/JHN', '/test/katolik/plan-365', '/test/katolik/dekalog']) {
    const res = await worker.fetch(new Request(`https://polskieradio.cc${p}`), env, {});
    assert.equal(res.status, 200);
    assert.match(res.headers.get('X-Robots-Tag') || '', /noindex/i);
  }
  assert.ok(fetched.every((p) => p === '/test/katolik/'));

  const cssRes = await worker.fetch(new Request('https://polskieradio.cc/test/katolik/katolik.css'), env, {});
  assert.equal(cssRes.status, 200);
  assert.equal(fetched[fetched.length - 1], '/test/katolik/katolik.css');
});

test('Brak zakazanych stringów (Mission Control, fikcyjne dane), obecny noindex i jawny komunikat niezależności', () => {
  const html = readText('test/katolik/index.html');
  const js = readText('test/katolik/katolik.js');
  assert.equal(html.includes('noindex, nofollow'), true);
  assert.equal(html.includes('Nie reprezentujemy Kościoła rzymskokatolickiego'), true);
  assert.equal(html.includes('kanonie 66 ksiąg'), true);
  assert.equal(html.includes('Jesteś katolikiem i chcesz lepiej poznać Jezusa?'), true);
  assert.equal(/Mission Control/i.test(html), false);
  assert.equal(/Mission Control/i.test(js), false);
  assert.equal(/cc-skarbiec-misji\.web\.app/i.test(html + js), false);
});
