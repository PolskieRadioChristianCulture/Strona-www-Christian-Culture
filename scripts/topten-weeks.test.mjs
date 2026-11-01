// topTEN — naturalna rywalizacja: tygodnie, pula 30, debiuty, archiwum, snapshoty (spec. §23).
// Uruchom: node --test scripts/topten-weeks.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handleTopTenApi, warsawClock, addDays } from '../services/topten/topten-service.js';
import { weekBounds, sortStandings, planRoster, ensureWeek, finalizeWeek, RETURN_WAIT_WEEKS } from '../services/topten/topten-weeks.js';

const MIGRATIONS = fs.readdirSync(new URL('../migrations/topten/', import.meta.url)).filter(f => f.endsWith('.sql')).sort()
  .map(f => fs.readFileSync(new URL(`../migrations/topten/${f}`, import.meta.url), 'utf8'));

function d1() {
  const raw = new DatabaseSync(':memory:');
  for (const sql of MIGRATIONS) raw.exec(sql);
  const stmt = (sql, args = []) => ({
    sql, args,
    bind: (...a) => stmt(sql, a),
    first: async () => raw.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: raw.prepare(sql).all(...args) }),
    run: async () => { const r = raw.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
  });
  return {
    raw,
    prepare: (sql) => stmt(sql),
    // Jak D1: wszystkie instrukcje w jednej transakcji, bez przeplatania z innymi żądaniami.
    batch: async (stmts) => {
      raw.exec('BEGIN');
      try {
        const out = stmts.map(s => ({ meta: { changes: Number(raw.prepare(s.sql).run(...s.args).changes) } }));
        raw.exec('COMMIT');
        return out;
      } catch (e) { raw.exec('ROLLBACK'); throw e; }
    },
  };
}

const USERS = { admin: { sub: 'adm', email: 'nazirczarkes@gmail.com', email_verified: true } };
for (let i = 0; i < 60; i++) USERS[`u${i}`] = { sub: `u${i}`, email: `u${i}@example.pl`, email_verified: true };
const verifyToken = async (t) => USERS[t] || null;

// Środa 04.11.2026 12:00 Europe/Warsaw → tydzień 2026-11-02.
const T0 = Date.parse('2026-11-04T11:00:00Z');
const WEEK_MS = 7 * 24 * 3600 * 1000;
const W1 = '2026-11-02';

function harness() {
  const db = d1();
  let now = T0;
  let n = 0;
  const call = async (method, path, { token, body } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (method !== 'GET') { headers['Content-Type'] = 'application/json'; headers['Idempotency-Key'] = `k-${++n}-${Math.random().toString(36).slice(2)}`; }
    const req = new Request(`https://polskieradio.cc${path}`, { method, headers, body: method === 'GET' ? undefined : JSON.stringify(body || {}) });
    const background = [];
    const res = await handleTopTenApi(req, { topten_db: db }, { waitUntil: p => background.push(p) }, { verifyToken, fetchImpl: async () => new Response(null, { status: 202 }), now: () => now });
    await Promise.all(background);
    return { status: res.status, body: await res.json() };
  };
  const addTrack = (id, { pool = 'active', queuedAt = null, entry = null, created = '2026-10-01T00:00:00Z' } = {}) =>
    db.raw.prepare(`INSERT INTO topten_tracks (id, title, artist, genre, status, created_at, updated_at, pool_status, queued_at, queue_entry, youtube_id)
      VALUES (?, ?, ?, 'gospel', 'published', ?, ?, ?, ?, ?, 'hVzNQqF_myg')`).run(id, `Utwór ${id}`, `Artysta ${id}`, created, created, pool, queuedAt, entry);
  const enable = async (...names) => {
    for (const name of names.length ? names : ['topten_natural_ranking_v1', 'topten_waiting_room_v1', 'topten_archive_v1']) {
      const r = await call('POST', '/api/topten/admin/flags', { token: 'admin', body: { name, enabled: true, confirm: name } });
      assert.equal(r.status, 200, JSON.stringify(r.body));
    }
  };
  const like = (token, id) => call('POST', `/api/topten/tracks/${id}/like`, { token });
  return { db, call, addTrack, enable, like, setNow: t => { now = t; }, getNow: () => now };
}

const id = (i) => `CC-TT-2026-${String(i).padStart(4, '0')}`; // CC-TT-2026-0001 jest w migracji 0001

test('granice tygodnia: niedziela 20:00 – niedziela 20:00 (wyłącznie) Europe/Warsaw, także przy zmianie czasu', () => {
  assert.deepEqual(weekBounds(W1), { start_utc: '2026-11-01T19:00:00.000Z', end_utc: '2026-11-08T19:00:00.000Z' });
  // Tydzień ze zmianą czasu (25.10.2026 o 3:00): start w CEST (18:00 UTC), koniec w CET (19:00 UTC) → 7 dni + 1 h.
  const dst = weekBounds('2026-10-26');
  assert.deepEqual(dst, { start_utc: '2026-10-25T19:00:00.000Z', end_utc: '2026-11-01T19:00:00.000Z' });
  const dstPrev = weekBounds('2026-10-19');
  assert.deepEqual(dstPrev, { start_utc: '2026-10-18T18:00:00.000Z', end_utc: '2026-10-25T19:00:00.000Z' });
  assert.equal(Date.parse(dstPrev.end_utc) - Date.parse(dstPrev.start_utc), WEEK_MS + 3600_000);
  // Wiosna 2027 (28.03 o 2:00): tydzień 21.03 20:00 CET → 28.03 20:00 CEST = 7 dni − 1 h.
  const spring = weekBounds('2027-03-22');
  assert.equal(Date.parse(spring.end_utc) - Date.parse(spring.start_utc), WEEK_MS - 3600_000);
  assert.equal(warsawClock(Date.parse('2026-11-08T18:59:59.999Z')).cycleId, W1, 'niedziela 19:59:59 to jeszcze ten tydzień');
  assert.equal(warsawClock(Date.parse('2026-11-08T19:00:00.000Z')).cycleId, '2026-11-09', 'niedziela 20:00:00 to nowy tydzień');
  // Granica tygodnia pokrywa się z warsawClock dla każdego tygodnia roku (bez dziur i nakładek).
  let w = '2026-01-05';
  for (let i = 0; i < 60; i++) {
    const b = weekBounds(w);
    assert.equal(warsawClock(Date.parse(b.start_utc)).cycleId, w);
    assert.equal(warsawClock(Date.parse(b.end_utc) - 1).cycleId, w);
    assert.equal(weekBounds(addDays(w, 7)).start_utc, b.end_utc);
    w = addDays(w, 7);
  }
});

test('remisy (§6): punkty → unikalni LubięTO → liczba LubięTO → wcześniejszy wynik → id', () => {
  const rows = sortStandings([
    { track_id: 'D', points: 854, unique_like_voters: 1, likes: 1, reached_at: 5 },
    { track_id: 'C', points: 854, unique_like_voters: 1, likes: 1, reached_at: 5 },
    { track_id: 'B', points: 854, unique_like_voters: 1, likes: 1, reached_at: 3 },
    { track_id: 'A', points: 854, unique_like_voters: 2, likes: 1, reached_at: 9 },
    { track_id: 'E', points: 900, unique_like_voters: 0, likes: 0, reached_at: 1 },
  ]);
  assert.deepEqual(rows.map(r => r.track_id), ['E', 'A', 'B', 'C', 'D']);
});

test('flagi domyślnie WYŁĄCZONE: ranking jak dotąd, nowe endpointy niedostępne, włączenie wymaga potwierdzenia redakcji', async () => {
  const h = harness();
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.natural, undefined);
  assert.equal((await h.call('GET', '/api/topten/weeks/current')).status, 404);
  assert.equal((await h.call('POST', '/api/topten/admin/flags', { token: 'u1', body: { name: 'topten_natural_ranking_v1', enabled: true, confirm: 'topten_natural_ranking_v1' } })).status, 403);
  assert.equal((await h.call('POST', '/api/topten/admin/flags', { token: 'admin', body: { name: 'topten_natural_ranking_v1', enabled: true } })).body.error, 'confirm_required');
  await h.enable();
  const n = await h.call('GET', '/api/topten/charts');
  assert.equal(n.body.natural.rulesVersion, 'natural-v1');
  assert.equal(n.body.items[0].entry, 'legacy');
  assert.equal(n.body.natural.noVotesYet, true);
  const audit = h.db.raw.prepare("SELECT action FROM topten_audit_log WHERE action LIKE 'flag.%'").all().map(r => r.action);
  assert.deepEqual(audit, ['flag.on', 'flag.on', 'flag.on']);
});

test('liczebność 0, 1, 9, 10, 11, 29, 30, 31: bez sztucznych pozycji; nadmiar ponad 30 czeka w kolejce', async () => {
  for (const count of [0, 1, 9, 10, 11, 29, 30, 31]) {
    const h = harness();
    h.db.raw.exec("UPDATE topten_tracks SET status = 'hidden'"); // usuń utwór z migracji
    for (let i = 0; i < count; i++) h.addTrack(id(100 + i));
    await h.enable();
    const c = await h.call('GET', '/api/topten/charts');
    assert.equal(c.body.items.length, Math.min(count, 30), `count=${count}`);
    assert.equal(c.body.items.filter(i => i.bucket === 'top10').length, Math.min(count, 10), `top10 count=${count}`);
    assert.equal(c.body.natural.queue.length, Math.max(0, count - 30), `queue count=${count}`);
  }
});

test('debiut zatwierdzony w środę czeka do poniedziałku; głos na niego odrzucony; potem startuje', async () => {
  const h = harness();
  await h.enable();
  await h.call('GET', '/api/topten/charts'); // otwiera tydzień W1
  const nom = await h.call('POST', '/api/topten/nominations', { body: {
    artistName: 'Debiutant', trackTitle: 'Nowa pieśń', genre: 'worship', language: 'polski', bibleRef: 'Ps 96:1',
    driveUrl: 'https://drive.google.com/file/d/x/view', submitterName: 'Jan Próbny', submitterEmail: 'jan@example.pl',
    declareRights: true, declareLicense: true, declareTheology: true } });
  await h.call('POST', `/api/topten/admin/nominations/${nom.body.id}`, { token: 'admin', body: { status: 'published' } });
  const c = await h.call('GET', '/api/topten/charts');
  assert.ok(!c.body.items.some(i => i.id === nom.body.id), 'nie w bieżącej puli');
  assert.equal(c.body.natural.queue[0].id, nom.body.id);
  const v = await h.like('u1', nom.body.id);
  assert.equal(v.status, 409);
  assert.equal(v.body.error, 'not_in_roster');
  h.setNow(T0 + WEEK_MS);
  const next = await h.call('GET', '/api/topten/charts');
  const debut = next.body.items.find(i => i.id === nom.body.id);
  assert.equal(debut.entry, 'debut');
  assert.equal((await h.like('u1', nom.body.id)).status, 201);
});

test('zamknięcie tygodnia: niezmienny snapshot z sumą kontrolną, wyróżnienia, punkty od zera, idempotencja', async () => {
  const h = harness();
  h.addTrack(id(200));
  await h.enable();
  await h.like('u1', id(200)); await h.like('u2', id(200)); await h.like('u1', 'CC-TT-2026-0001');
  h.setNow(T0 + WEEK_MS);
  const c = await h.call('GET', '/api/topten/charts');
  assert.ok(c.body.items.every(i => i.score === 0), 'nowy tydzień od zera');
  assert.equal(c.body.natural.lastOfficial.weekId, W1);
  assert.equal(c.body.natural.lastOfficial.top10[0].id, id(200));
  assert.deepEqual(c.body.natural.lastOfficial.awards.map(a => a.type), ['hit']);
  const week = h.db.raw.prepare('SELECT * FROM topten_weeks WHERE id = ?').get(W1);
  assert.equal(week.status, 'finalized');
  assert.equal(week.snapshot_version, 1);
  assert.match(week.checksum, /^[0-9a-f]{64}$/);
  assert.throws(() => h.db.raw.exec(`UPDATE topten_week_standings SET points = 99999 WHERE week_id = '${W1}'`), /immutable/);
  assert.throws(() => h.db.raw.exec(`DELETE FROM topten_awards`), /immutable/);
  assert.deepEqual(await finalizeWeek(h.db, W1, { nowMs: h.getNow() }), { ok: true, idempotent: true, version: 1 });
  const arch = await h.call('GET', `/api/topten/charts?cycle=${W1}`);
  assert.equal(arch.body.cycle.official, true);
  assert.equal(arch.body.items[0].score, 1554);
  assert.equal(c.body.items.find(i => i.id === id(200)).prevRank, 1);
  assert.equal(c.body.items.find(i => i.id === id(200)).allTimePoints, 1554);
});

test('wyścig na starcie tygodnia: 20 równoległych zapytań → jedna pula, jedno zamknięcie', async () => {
  const h = harness();
  for (let i = 0; i < 12; i++) h.addTrack(id(300 + i));
  await h.enable();
  await h.call('GET', '/api/topten/charts');
  h.setNow(T0 + WEEK_MS);
  const res = await Promise.all(Array.from({ length: 20 }, () => h.call('GET', '/api/topten/charts')));
  assert.ok(res.every(r => r.status === 200));
  assert.equal(h.db.raw.prepare("SELECT COUNT(*) AS n FROM topten_week_roster WHERE week_id = '2026-11-09'").get().n, 13);
  assert.equal(h.db.raw.prepare(`SELECT COUNT(DISTINCT version) AS n FROM topten_week_standings WHERE week_id = '${W1}'`).get().n, 1);
  assert.equal(h.db.raw.prepare("SELECT COUNT(*) AS n FROM topten_audit_log WHERE action = 'week.opened'").get().n, 2);
});

async function fullPoolWithLeader(h, weeks) {
  h.db.raw.exec("UPDATE topten_tracks SET status = 'hidden'");
  for (let i = 0; i < 30; i++) h.addTrack(id(400 + i));
  await h.enable();
  for (let w = 0; w < weeks; w++) {
    // Lider zawsze ma najwięcej głosów; reszta po jednym głosie malejąco wg numeru.
    for (let u = 0; u < 5; u++) await h.like(`u${u}`, id(400));
    for (let i = 1; i < 30; i++) if (i < 25) await h.like(`u${10 + (i % 40)}`, id(400 + i));
    h.setNow(h.getNow() + WEEK_MS);
    await h.call('GET', '/api/topten/charts');
  }
}

test('brak rotacji przymusowej: lider po 6 tygodniach wciąż na 1. miejscu', async () => {
  const h = harness();
  await fullPoolWithLeader(h, 6);
  const ranks = h.db.raw.prepare(`SELECT week_id, rank FROM topten_week_standings WHERE track_id = '${id(400)}' ORDER BY week_id`).all();
  assert.equal(ranks.length, 6);
  assert.ok(ranks.every(r => r.rank === 1));
});

test('pełna pula 30 + 3 debiuty: wymiana tylko miejsc 28–30, nigdy TOP 10; maks. 3 na tydzień; archiwum z karencją 4 tygodni', async () => {
  const h = harness();
  await fullPoolWithLeader(h, 1); // tydzień W1 zamknięty, W2 otwarty z pełną pulą 30
  const W2 = addDays(W1, 7);
  for (let q = 0; q < 4; q++) h.addTrack(id(500 + q), { pool: 'queued', queuedAt: `2026-11-1${q}T10:00:00Z`, entry: 'debut' });
  const plan = await planRoster(h.db, W2, addDays(W2, 7));
  assert.equal(plan.entrants.length, 3, 'maksymalnie 3 debiuty');
  assert.deepEqual(plan.entrants.map(e => e.track_id), [id(500), id(501), id(502)], 'FIFO');
  const prev = h.db.raw.prepare(`SELECT track_id, rank FROM topten_week_standings WHERE week_id = '${W1}'`).all();
  const rankOf = new Map(prev.map(r => [r.track_id, r.rank]));
  // Pula W2 = pula W1 (bez głosów w W2 kolejność wg remisów); sprawdzamy, że wypadają 3 najniższe pozycje W2, nie TOP 10.
  h.setNow(h.getNow() + WEEK_MS);
  await h.call('GET', '/api/topten/charts');
  const w2 = h.db.raw.prepare(`SELECT track_id, rank FROM topten_week_standings WHERE week_id = '${W2}' ORDER BY rank`).all();
  const displaced = h.db.raw.prepare("SELECT track_id, archived_at_week, eligible_from_week FROM topten_song_archive ORDER BY track_id").all();
  assert.equal(displaced.length, 3);
  assert.deepEqual(displaced.map(d => w2.find(r => r.track_id === d.track_id).rank).sort((a, b) => a - b), [28, 29, 30]);
  assert.ok(displaced.every(d => d.archived_at_week === W2 && d.eligible_from_week === addDays(W2, 7 + 7 * RETURN_WAIT_WEEKS)));
  assert.equal(h.db.raw.prepare(`SELECT COUNT(*) AS n FROM topten_week_roster WHERE week_id = '${addDays(W2, 7)}'`).get().n, 30);
  assert.equal(h.db.raw.prepare(`SELECT pool_status FROM topten_tracks WHERE id = '${id(503)}'`).get().pool_status, 'queued', '4. debiut czeka');
  assert.ok(rankOf.size === 30);
  // Archiwalny utwór nie przyjmuje głosów.
  assert.equal((await h.like('u1', displaced[0].track_id)).status, 409);
});

test('pula 25 + 3 debiuty: tylko wolne miejsca, nikt nie wypada', async () => {
  const h = harness();
  h.db.raw.exec("UPDATE topten_tracks SET status = 'hidden'");
  for (let i = 0; i < 25; i++) h.addTrack(id(600 + i));
  await h.enable();
  await h.call('GET', '/api/topten/charts');
  for (let q = 0; q < 3; q++) h.addTrack(id(650 + q), { pool: 'queued', queuedAt: `2026-11-0${3 + q}T10:00:00Z`, entry: 'debut' });
  h.setNow(T0 + WEEK_MS);
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.items.length, 28);
  assert.equal(h.db.raw.prepare('SELECT COUNT(*) AS n FROM topten_song_archive').get().n, 0);
});

test('powrót z archiwum: dopiero po 4 pełnych zamkniętych tygodniach, ze znacznikiem „return”, bez duplikatu utworu', async () => {
  const h = harness();
  await fullPoolWithLeader(h, 1);
  for (let q = 0; q < 3; q++) h.addTrack(id(700 + q), { pool: 'queued', queuedAt: `2026-11-1${q}T10:00:00Z`, entry: 'debut' });
  h.setNow(h.getNow() + WEEK_MS); await h.call('GET', '/api/topten/charts'); // W3: 3 utwory zarchiwizowane
  const out = h.db.raw.prepare('SELECT track_id, eligible_from_week FROM topten_song_archive ORDER BY track_id LIMIT 1').get();
  const r = await h.call('POST', `/api/topten/admin/songs/${out.track_id}/return`, { token: 'admin' });
  assert.equal(r.body.eligibleFromWeek, out.eligible_from_week);
  // Przez kolejne tygodnie przed terminem utwór nie wraca.
  while (warsawClock(h.getNow() + WEEK_MS).cycleId < out.eligible_from_week) {
    h.setNow(h.getNow() + WEEK_MS);
    await h.call('GET', '/api/topten/charts');
    assert.equal(h.db.raw.prepare(`SELECT pool_status FROM topten_tracks WHERE id = '${out.track_id}'`).get().pool_status, 'queued');
  }
  h.setNow(h.getNow() + WEEK_MS);
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.cycle.id, out.eligible_from_week);
  assert.equal(c.body.items.find(i => i.id === out.track_id)?.entry, 'return');
  assert.equal(h.db.raw.prepare(`SELECT COUNT(*) AS n FROM topten_tracks WHERE id = '${out.track_id}'`).get().n, 1);
});

test('wstrzymanie prawne: głos zablokowany (423), wideo ukryte, ślad audytu; zwolnienie przywraca', async () => {
  const h = harness();
  await h.enable();
  await h.call('GET', '/api/topten/charts');
  assert.equal((await h.call('POST', '/api/topten/admin/songs/CC-TT-2026-0001/rights-hold', { token: 'admin', body: { hold: true } })).body.error, 'reason_required');
  await h.call('POST', '/api/topten/admin/songs/CC-TT-2026-0001/rights-hold', { token: 'admin', body: { hold: true, reason: 'Zgłoszenie praw autorskich — weryfikacja' } });
  assert.equal((await h.like('u1', 'CC-TT-2026-0001')).status, 423);
  const c = await h.call('GET', '/api/topten/charts');
  const t = c.body.items.find(i => i.id === 'CC-TT-2026-0001');
  assert.equal(t.suspended, true);
  assert.equal(t.youtubeId, null);
  await h.call('POST', '/api/topten/admin/songs/CC-TT-2026-0001/rights-hold', { token: 'admin', body: { hold: false } });
  assert.equal((await h.like('u1', 'CC-TT-2026-0001')).status, 201);
  const audit = h.db.raw.prepare("SELECT action FROM topten_audit_log WHERE action LIKE 'song.rights%'").all().map(r => r.action);
  assert.deepEqual(audit, ['song.rights_hold', 'song.rights_release']);
});

test('głosy wstrzymane: wynik wstępny (bez FINAL), nowy tydzień i tak startuje; korekta tylko z uzasadnieniem i jako nowa wersja', async () => {
  const h = harness();
  h.addTrack(id(800));
  await h.enable();
  await h.like('u1', id(800)); await h.like('u2', 'CC-TT-2026-0001');
  const ev = h.db.raw.prepare(`SELECT id FROM topten_events WHERE track_id = '${id(800)}'`).get();
  await h.call('POST', `/api/topten/admin/events/${ev.id}`, { token: 'admin', body: { reviewStatus: 'held' } });
  h.setNow(T0 + WEEK_MS);
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.cycle.id, '2026-11-09');
  assert.equal(c.body.natural.lastOfficial, null, 'brak oficjalnego wyniku przed weryfikacją');
  assert.equal(h.db.raw.prepare(`SELECT status FROM topten_weeks WHERE id = '${W1}'`).get().status, 'closing');
  await h.call('POST', `/api/topten/admin/events/${ev.id}`, { token: 'admin', body: { reviewStatus: 'void' } });
  const fin = await h.call('POST', `/api/topten/admin/weeks/${W1}/finalize`, { token: 'admin', body: {} });
  assert.equal(fin.body.version, 1);
  assert.equal((await h.call('POST', `/api/topten/admin/weeks/${W1}/finalize`, { token: 'admin', body: { correction: true } })).body.error, 'reason_required');
  const cor = await h.call('POST', `/api/topten/admin/weeks/${W1}/finalize`, { token: 'admin', body: { correction: true, reason: 'Korekta po ponownej weryfikacji głosów' } });
  assert.equal(cor.body.version, 2);
  assert.equal(h.db.raw.prepare(`SELECT COUNT(DISTINCT version) AS n FROM topten_week_standings WHERE week_id = '${W1}'`).get().n, 2, 'stara wersja zachowana');
  assert.equal(h.db.raw.prepare(`SELECT status FROM topten_weeks WHERE id = '${W1}'`).get().status, 'corrected');
  assert.equal((await h.call('POST', `/api/topten/admin/weeks/2026-11-09/finalize`, { token: 'admin', body: {} })).body.error, 'week_not_ended');
});

test('Poczekalnia: 11. miejsce może awansować w trakcie tygodnia; widok bez Poczekalni pokazuje tylko TOP 10', async () => {
  const h = harness();
  h.db.raw.exec("UPDATE topten_tracks SET status = 'hidden'");
  for (let i = 0; i < 12; i++) h.addTrack(id(900 + i));
  await h.enable('topten_natural_ranking_v1');
  const c0 = await h.call('GET', '/api/topten/charts');
  assert.equal(c0.body.items.length, 10, 'bez flagi Poczekalni tylko TOP 10');
  await h.enable('topten_waiting_room_v1');
  const before = await h.call('GET', '/api/topten/charts');
  const eleventh = before.body.items.find(i => i.rank === 11);
  assert.equal(eleventh.bucket, 'waiting');
  for (let u = 0; u < 3; u++) await h.like(`u${u}`, eleventh.id);
  const after = await h.call('GET', '/api/topten/charts');
  assert.equal(after.body.items.find(i => i.id === eleventh.id).rank, 1);
  assert.equal(after.body.items.find(i => i.id === eleventh.id).bucket, 'top10');
});

test('publiczne API bez danych osobowych i bez linków Google Drive', async () => {
  const h = harness();
  await h.enable();
  const nom = await h.call('POST', '/api/topten/nominations', { body: {
    artistName: 'Ktoś', trackTitle: 'Coś', genre: 'pop', language: 'polski', bibleRef: 'J 3:16',
    driveUrl: 'https://drive.google.com/file/d/SEKRETNY_PLIK/view', submitterName: 'Jan Próbny', submitterEmail: 'tajny@example.pl',
    declareRights: true, declareLicense: true, declareTheology: true } });
  await h.call('POST', `/api/topten/admin/nominations/${nom.body.id}`, { token: 'admin', body: { status: 'published' } });
  await h.like('u1', 'CC-TT-2026-0001');
  h.setNow(T0 + WEEK_MS);
  await h.call('GET', '/api/topten/charts'); // otwarcie nowego tygodnia i zamknięcie poprzedniego
  const outputs = await Promise.all(['/api/topten/charts', '/api/topten/weeks/current', `/api/topten/weeks/${W1}/standings`, `/api/topten/weeks/${W1}/awards`,
    '/api/topten/debuts/queue', '/api/topten/archive', '/api/topten/songs/CC-TT-2026-0001/history', `/api/topten/charts?cycle=${W1}`].map(p => h.call('GET', p)));
  for (const o of outputs) {
    assert.equal(o.status, 200);
    const s = JSON.stringify(o.body);
    assert.ok(!s.includes('SEKRETNY_PLIK') && !s.includes('drive.google') && !s.includes('tajny@') && !s.includes('"u1"') && !s.includes('ip_hash'), s.slice(0, 200));
  }
  const hist = outputs[6].body;
  assert.equal(hist.allTimePoints, 777);
  assert.equal(hist.bestRank, 1);
});

test('liczniki inkrementalne = dziennik zdarzeń (losowe głosy, wstrzymania, unieważnienia, przywrócenia)', async () => {
  const h = harness();
  for (let i = 0; i < 4; i++) h.addTrack(id(1000 + i));
  const tracks = ['CC-TT-2026-0001', id(1000), id(1001), id(1002), id(1003)];
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let step = 0; step < 400; step++) {
    h.setNow(T0 + step * 37 * 60_000); // ~37 min kroku → różne doby i tygodnie
    const u = `u${rnd(12)}`, t = tracks[rnd(tracks.length)];
    await h.call('POST', `/api/topten/tracks/${t}/${rnd(3) === 0 ? 'like' : 'boost'}`, { token: u });
    if (step % 25 === 0) {
      const ev = h.db.raw.prepare('SELECT id FROM topten_events ORDER BY id DESC LIMIT 1').get();
      if (ev) await h.call('POST', `/api/topten/admin/events/${ev.id}`, { token: 'admin', body: { reviewStatus: ['held', 'void', 'ok'][rnd(3)] } });
    }
  }
  const truth = h.db.raw.prepare(`SELECT cycle_id, track_id, SUM(points) AS points, SUM(action = 'like') AS likes, SUM(action = 'boost') AS boosts,
      COUNT(DISTINCT user_id) AS voters, COUNT(DISTINCT CASE WHEN action = 'like' THEN user_id END) AS unique_like_voters, MAX(created_at) AS last_at
    FROM topten_events WHERE review_status = 'ok' GROUP BY cycle_id, track_id ORDER BY cycle_id, track_id`).all();
  const totals = h.db.raw.prepare(`SELECT cycle_id, track_id, points, likes, boosts, voters, unique_like_voters, last_at
    FROM topten_week_totals WHERE points > 0 OR likes > 0 OR boosts > 0 ORDER BY cycle_id, track_id`).all();
  assert.ok(truth.length > 5, 'test obejmuje kilka tygodni i utworów');
  assert.deepEqual(totals.map(r => ({ ...r })), truth.map(r => ({ ...r })));
  // Rekoncyliacja z panelu odtwarza identyczny stan.
  const wk = truth[0].cycle_id;
  h.db.raw.exec(`UPDATE topten_week_totals SET points = 0 WHERE cycle_id = '${wk}'`);
  await h.call('POST', `/api/topten/admin/totals/${wk}/rebuild`, { token: 'admin' });
  assert.deepEqual(h.db.raw.prepare(`SELECT points FROM topten_week_totals WHERE cycle_id = '${wk}' ORDER BY track_id`).all().map(r => r.points),
    truth.filter(r => r.cycle_id === wk).map(r => r.points));
});