import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

test('Phase 3A: LUMI Direct Dock w pełni przeportowany na Vue 3 bez React TSX i bez wykluczeń w tsconfig.json', () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8'));
  assert.ok(!tsconfig.exclude.includes('src/lumi-direct-dock/**'), 'tsconfig.json nie powinien wykluczać src/lumi-direct-dock');
  assert.ok(!tsconfig.include.includes('src/**/*.tsx'), 'tsconfig.json nie powinien wymagać plików TSX');

  assert.ok(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/LumiDirectDock.vue')), 'LumiDirectDock.vue musi istnieć');
  assert.ok(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/example-integration.ts')), 'example-integration.ts musi istnieć');
  assert.ok(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/LumiDirectDock.test.ts')), 'LumiDirectDock.test.ts musi istnieć');
  assert.equal(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/LumiDirectDock.tsx')), false, 'Legacy React TSX powinien być usunięty');
  assert.equal(fs.existsSync(path.join(ROOT, 'src/lumi-direct-dock/src/example-integration.tsx')), false, 'Legacy React example TSX powinien być usunięty');
});

test('Phase 3B: subscribeToAllCommunityProfiles nie wykonuje żadnych zapisów setDoc przy odczycie i poprawnie normalizuje profile w pamięci', () => {
  const source = fs.readFileSync(path.join(ROOT, 'lumina-db.js'), 'utf8');
  const start = source.indexOf('export function subscribeToAllCommunityProfiles(');
  const end = source.indexOf('\nexport function subscribeToFeedPosts(', start);
  assert.ok(start !== -1 && end > start, 'Muszą istnieć granice funkcji subscribeToAllCommunityProfiles');
  const fnSource = source.slice(start, end);

  assert.equal(/\b(?:setDoc|updateDoc|addDoc|deleteDoc)\s*\(/.test(fnSource), false, 'Listener katalogu nie może wywoływać zapisów Firestore podczas odczytu');

  let emitted = null;
  let capturedSnapCb = null;
  const ctx = {
    db: {},
    LUMINA_RESERVED_PROFILE_SLUGS: ['cezaryrgowski', 'wiolettarogowska', 'radiocc'],
    query: (...args) => args,
    collection: (_db, name) => name,
    limit: (n) => n,
    onSnapshot: (_q, cb) => {
      capturedSnapCb = cb;
      return () => {};
    },
    setDoc: () => {
      throw new Error('Zapis setDoc zabroniony przy odczycie katalogu!');
    },
    console
  };

  const fn = vm.runInNewContext(`(${fnSource.replace('export function', 'function')})`, ctx);
  fn((list) => {
    emitted = list;
  });

  capturedSnapCb({
    forEach(cb) {
      cb({ id: 'cezaryrgowski', data: () => ({ slug: 'cezaryrgowski', name: 'Stary', age: 40, city: 'Warszawa' }) });
      cb({ id: 'NHjYeuO4nxM8fIfEJPHmi9rTQV12', data: () => ({ slug: 'u_yciezywymbogiem_4231', name: 'Paweł', age: 40 }) });
      cb({ id: 'u_jan', data: () => ({ slug: 'u_jan', avatar: 'avatar_cezary_official.jpg', photos: ['avatar_cezary_official.jpg'] }) });
    }
  });

  assert.equal(emitted.length, 3);
  assert.equal(emitted[0].age, 51);
  assert.equal(emitted[0].city, 'Ostrowiec Świętokrzyski, Polska');
  assert.equal(emitted[1].name, 'Paweł Murawski');
  assert.equal(emitted[2].avatar, 'lumina_icon.jpg');
});

test('Phase 3B: loadFeedPostsPage obsługuje paginację kursorową startAfter i zlicza hasMore', async () => {
  const source = fs.readFileSync(path.join(ROOT, 'lumina-db.js'), 'utf8');
  assert.match(source, /import\s*\{[\s\S]*\bstartAfter\b[\s\S]*\}\s*from\s*'https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\/firebase-firestore\.js'/);
  assert.match(source, /loadCloudShortsPage/);

  const start = source.indexOf('export async function loadFeedPostsPage(');
  const end = source.indexOf('\nexport async function addPostToCloud(', start);
  assert.ok(start !== -1 && end > start, 'Funkcja loadFeedPostsPage musi istnieć w lumina-db.js');
  const fnSource = source.slice(start, end);

  const capturedQueries = [];
  const fakeDocs = [
    { id: 'p1', data: () => ({ text: 'Post 1' }) },
    { id: 'p2', data: () => ({ text: 'Post 2' }) },
    { id: 'p3', data: () => ({ text: 'Post 3' }) }
  ];
  const ctx = {
    db: {},
    window: {},
    console,
    collection: (_db, name) => ({ collection: name }),
    where: (f, op, v) => ({ where: [f, op, v] }),
    orderBy: (f, dir) => ({ orderBy: [f, dir] }),
    startAfter: (c) => ({ startAfter: c }),
    limit: (n) => ({ limit: n }),
    query: (...constraints) => constraints,
    getDocs: async (q) => {
      capturedQueries.push(q);
      return { docs: fakeDocs };
    }
  };

  const fn = vm.runInNewContext(`(${fnSource.replace('export async function', 'async function')})`, ctx);
  const cursorSentinel = { id: 'cursor_0' };
  const page = await fn({ cursor: cursorSentinel, pageSize: 2, authorSlug: 'cezaryrgowski' });

  assert.equal(page.posts.length, 2);
  assert.equal(page.hasMore, true);
  assert.equal(page.lastDoc.id, 'p2');
  assert.ok(capturedQueries[0].some((c) => c.startAfter === cursorSentinel), 'Zapytanie musi przekazywać startAfter(cursor)');
  assert.ok(capturedQueries[0].some((c) => c.limit === 3), 'Zapytanie powinno pobierać pageSize + 1 dla hasMore');
  assert.equal(ctx.window._luminaFeedCursor.id, 'p2');
  assert.equal(ctx.window._luminaFeedHasMore, true);
});

test('Phase 3B: firestore.indexes.json posiada poprawne indeksy złożone dla feedu, profili i rolek', () => {
  const raw = fs.readFileSync(path.join(ROOT, 'firestore.indexes.json'), 'utf8');
  const parsed = JSON.parse(raw);
  assert.ok(Array.isArray(parsed.indexes), 'indexes musi być tablicą');

  const hasIndex = (group, fieldNames) =>
    parsed.indexes.some(
      (idx) =>
        idx.collectionGroup === group &&
        Array.isArray(idx.fields) &&
        fieldNames.every((f, i) => idx.fields[i]?.fieldPath === f)
    );

  assert.ok(hasIndex('lumina_posts', ['authorSlug', 'createdAtTimestamp']), 'Brak indeksu lumina_posts(authorSlug, createdAtTimestamp)');
  assert.ok(hasIndex('lumina_posts', ['type', 'createdAtTimestamp']), 'Brak indeksu lumina_posts(type, createdAtTimestamp)');
  assert.ok(hasIndex('lumina_profiles', ['profileCompleted', 'updatedAt']), 'Brak indeksu lumina_profiles(profileCompleted, updatedAt)');
  assert.ok(hasIndex('lumina_shorts', ['authorSlug', 'createdAtTimestamp']), 'Brak indeksu lumina_shorts(authorSlug, createdAtTimestamp)');
  assert.ok(hasIndex('lumina_shorts', ['category', 'createdAtTimestamp']), 'Brak indeksu lumina_shorts(category, createdAtTimestamp)');
});

test('Phase 3B: zunifikowany loader rozważań stawia cuda-398c0/reflections jako źródło główne i usuwa duplikat z lumina-tablica', async () => {
  const mod = await import('../js/lumina-db/devotional-feed.js');
  assert.equal(typeof mod.fetchCanonicalDailyReflection, 'function');

  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes('cuda-398c0') && String(url).includes('runQuery')) {
      return {
        ok: true,
        json: async () => [
          {
            document: {
              name: 'projects/cuda-398c0/databases/(default)/documents/reflections/ref_day45_2026-11-14',
              fields: {
                date: { stringValue: '2026-11-14' },
                title: { stringValue: 'Testowe Rozważanie CUDA' },
                teaser: { stringValue: 'Krótki opis' },
                fullText: { stringValue: 'Pełna treść z cuda-398c0' }
              }
            }
          }
        ]
      };
    }
    return {
      ok: true,
      json: async () => [
        {
          date: '2026-11-14',
          contentWeb: 'Rozszerzona wersja WWW z https://polskieradio.cc/akademia'
        }
      ]
    };
  };

  const res = await mod.fetchCanonicalDailyReflection({
    todayStr: '2026-11-14',
    forceRefresh: true,
    fetchImpl: fakeFetch
  });

  assert.ok(calls[0].includes('projects/cuda-398c0'), 'Pierwsze zapytanie musi kierować się do cuda-398c0');
  assert.equal(res.reflectionRecord.title, 'Testowe Rozważanie CUDA');
  assert.equal(res.reflectionRecord._source, 'cuda-398c0/reflections');
  assert.match(res.reflectionRecord.fullTextHtml, /polskieradio\.cc/);

  for (const file of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.ok(!html.includes('TODO: Przepiąć na cuda-398c0'), `${file} nie powinien zawierać przestarzałego TODO`);
    assert.match(html, /devotional-feed\.js/, `${file} powinien używać zunifikowanego devotional-feed.js`);
    assert.match(html, /loadFeedPostsPage/, `${file} powinien podpinać paginację kursorową loadMore`);
  }
});
