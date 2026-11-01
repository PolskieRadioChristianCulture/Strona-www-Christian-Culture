// topTEN API — testy na prawdziwym SQLite (node:sqlite) z nakładką zgodną z D1.
// Uruchom: node --test scripts/topten-api.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handleTopTenApi, warsawClock, youtubeId, vapidPublicKey } from '../services/topten/topten-service.js';

const SCHEMA = fs.readFileSync(new URL('../migrations/topten/0001_topten.sql', import.meta.url), 'utf8');

function d1() {
  const raw = new DatabaseSync(':memory:');
  raw.exec(SCHEMA);
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => raw.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: raw.prepare(sql).all(...args) }),
    run: async () => { const r = raw.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
  });
  return { raw, prepare: (sql) => stmt(sql) };
}

const USERS = {
  u1: { sub: 'u1', email: 'u1@example.pl', email_verified: true },
  u2: { sub: 'u2', email: 'u2@example.pl', email_verified: true },
  unverified: { sub: 'u3', email: 'u3@example.pl', email_verified: false },
  admin: { sub: 'adm', email: 'nazirczarkes@gmail.com', email_verified: true },
};
const verifyToken = async (t) => USERS[t] || null;

// Środa 04.11.2026, 12:00 Europe/Warsaw → cykl 2026-11-02.
const T0 = Date.parse('2026-11-04T11:00:00Z');
const MIN = 60_000;

function harness() {
  const db = d1();
  let now = T0;
  const pushes = [];
  const fetchImpl = async (url, init) => { pushes.push({ url, init }); return new Response(null, { status: 201 }); };
  let n = 0;
  const call = async (method, path, { token, body, key, ip = '203.0.113.7', env = {} } = {}) => {
    const headers = { 'CF-Connecting-IP': ip };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    if (key !== false && method === 'POST') headers['Idempotency-Key'] = key || `test-key-${++n}`;
    const req = new Request(`https://polskieradio.cc${path}`, { method, headers, body: body ? JSON.stringify(body) : (method === 'GET' ? undefined : '{}') });
    const background = [];
    const ctx = { waitUntil: (p) => background.push(p) };
    const res = await handleTopTenApi(req, { topten_db: db, ...env }, ctx, { verifyToken, fetchImpl, now: () => now });
    await Promise.all(background);
    return { status: res.status, body: await res.json() };
  };
  return { db, call, pushes, setNow: (t) => { now = t; }, getNow: () => now };
}

const nomination = (over = {}) => ({
  artistName: 'Zespół Testowy', trackTitle: 'Pieśń próbna', genre: 'gospel', language: 'polski, Polska',
  bibleRef: 'Ps 23:1', driveUrl: 'https://drive.google.com/file/d/abc/view', youtubeUrl: 'https://youtu.be/hVzNQqF_myg',
  supportLink: 'https://zrzutka.pl/abc', submitterName: 'Jan Próbny', submitterEmail: 'jan@example.pl',
  declareRights: true, declareLicense: true, declareTheology: true, ...over,
});

const TRACK = 'CC-TT-2026-0001';

test('zegar Europe/Warsaw: doba i poniedziałek cyklu, także przy zmianie czasu', () => {
  assert.deepEqual(warsawClock(T0), { localDate: '2026-11-04', weekday: 2, hour: 12, cycleId: '2026-11-02' });
  // Niedziela 23:30 czasu polskiego to jeszcze stary cykl; 00:30 w poniedziałek — nowy.
  assert.equal(warsawClock(Date.parse('2026-11-08T22:30:00Z')).cycleId, '2026-11-02');
  assert.equal(warsawClock(Date.parse('2026-11-08T23:30:00Z')).cycleId, '2026-11-09');
  assert.equal(warsawClock(Date.parse('2026-03-29T22:30:00Z')).localDate, '2026-03-30'); // po przejściu na CEST
});

test('youtubeId rozpoznaje formaty linków i odrzuca obce', () => {
  assert.equal(youtubeId('https://youtu.be/hVzNQqF_myg'), 'hVzNQqF_myg');
  assert.equal(youtubeId('https://www.youtube.com/watch?v=hVzNQqF_myg&t=3'), 'hVzNQqF_myg');
  assert.equal(youtubeId('https://youtube.com/shorts/hVzNQqF_myg'), 'hVzNQqF_myg');
  assert.equal(youtubeId('https://evil.example/watch?v=hVzNQqF_myg'), null);
});

test('ranking startowy: tylko prawdziwa nominacja, 0 pkt, cykl live', async () => {
  const h = harness();
  const r = await h.call('GET', '/api/topten/charts');
  assert.equal(r.status, 200);
  assert.equal(r.body.cycle.id, '2026-11-02');
  assert.equal(r.body.cycle.status, 'live');
  assert.equal(r.body.items.length, 1);
  assert.equal(r.body.items[0].id, TRACK);
  assert.equal(r.body.items[0].score, 0);
  assert.equal(r.body.items[0].support.length, 2);
});

test('głos wymaga logowania i potwierdzonego e-maila; klient nie wysyła punktów', async () => {
  const h = harness();
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/like`)).status, 401);
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'unverified' })).status, 403);
  const r = await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1', body: { points: 999999 } });
  assert.equal(r.status, 201);
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.items[0].score, 777);
});

test('wyścig: 50 równoległych LubięTO → dokładnie 1 przyjęty (+777)', async () => {
  const h = harness();
  const res = await Promise.all(Array.from({ length: 50 }, () => h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' })));
  assert.equal(res.filter(r => r.status === 201).length, 1);
  assert.ok(res.filter(r => r.status === 429).every(r => r.body.error === 'like_used_today'));
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.items[0].score, 777);
  assert.equal(c.body.items[0].voters, 1);
});

test('wyścig: 50 równoległych PodbijTO → 1 przyjęty; potem max 7/dobę co ≥60 min', async () => {
  const h = harness();
  h.setNow(Date.parse('2026-11-04T05:00:00Z')); // 06:00 czasu polskiego
  const res = await Promise.all(Array.from({ length: 50 }, () => h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' })));
  assert.equal(res.filter(r => r.status === 201).length, 1);
  const cooldown = await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' });
  assert.equal(cooldown.body.error, 'boost_cooldown');
  assert.match(cooldown.body.message, /60 min/);
  h.setNow(h.getNow() + 59 * MIN);
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' })).body.error, 'boost_cooldown');
  for (let i = 2; i <= 7; i++) {
    h.setNow(h.getNow() + 61 * MIN);
    const r = await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' });
    assert.equal(r.status, 201, `boost ${i}`);
    assert.equal(r.body.me.boostsToday, i);
  }
  h.setNow(h.getNow() + 61 * MIN);
  const eighth = await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' });
  assert.equal(eighth.body.error, 'boost_limit');
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.items[0].score, 7 * 77);
  // Limit jest na użytkownika — drugi słuchacz może podbić od razu.
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u2' })).status, 201);
});

test('maks. dzienny wkład jednego słuchacza w utwór = 1316 pkt (777 + 7×77)', async () => {
  const h = harness();
  h.setNow(Date.parse('2026-11-04T05:00:00Z'));
  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' });
  for (let i = 0; i < 12; i++) { await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1' }); h.setNow(h.getNow() + 61 * MIN); }
  const c = await h.call('GET', '/api/topten/charts');
  assert.equal(c.body.items[0].score, 1316);
});

test('idempotencja: ten sam klucz nie dubluje punktów; brak klucza = 400', async () => {
  const h = harness();
  const a = await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1', key: 'same-key-123' });
  const b = await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1', key: 'same-key-123' });
  assert.equal(a.status, 201);
  assert.equal(b.status, 200);
  assert.equal(b.body.replay, true);
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/boost`, { token: 'u1', key: false })).status, 400);
});

test('nowa doba odblokowuje LubięTO; nowy tydzień zeruje punkty i podaje poprzednią pozycję', async () => {
  const h = harness();
  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' });
  h.setNow(T0 + 24 * 60 * MIN);
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' })).status, 201);
  h.setNow(Date.parse('2026-11-09T09:00:00Z')); // poniedziałek — nowy cykl
  const live = await h.call('GET', '/api/topten/charts');
  assert.equal(live.body.cycle.id, '2026-11-09');
  assert.equal(live.body.items[0].score, 0);
  assert.equal(live.body.items[0].prevRank, 1);
  const archive = await h.call('GET', '/api/topten/charts?cycle=2026-11-02');
  assert.equal(archive.body.cycle.status, 'closed');
  assert.equal(archive.body.items[0].score, 1554);
  const cycles = await h.call('GET', '/api/topten/cycles');
  assert.deepEqual(cycles.body.items.map(c => c.id), ['2026-11-09', '2026-11-02']);
});

test('nominacja: walidacja, numer CC-TT, status mailowy, limit dzienny, honeypot', async () => {
  const h = harness();
  const bad = await h.call('POST', '/api/topten/nominations', { body: nomination({ driveUrl: 'http://example.com/x', declareRights: false, supportLink: 'https://evil.example/pay' }) });
  assert.equal(bad.status, 422);
  assert.ok(bad.body.fields.driveUrl && bad.body.fields.declareRights && bad.body.fields.supportLink);
  const ok = await h.call('POST', '/api/topten/nominations', { body: nomination() });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.id, 'CC-TT-2026-0002');
  const row = h.db.raw.prepare('SELECT status, mail_status, mail_attempts FROM topten_nominations WHERE id = ?').get(ok.body.id);
  assert.equal(row.status, 'submitted');
  assert.equal(row.mail_status, 'failed'); // brak sekretów Gmail w teście → do ponowienia z panelu
  assert.equal(row.mail_attempts, 1);
  for (let i = 0; i < 4; i++) assert.equal((await h.call('POST', '/api/topten/nominations', { body: nomination() })).status, 201);
  assert.equal((await h.call('POST', '/api/topten/nominations', { body: nomination() })).status, 429);
  assert.equal((await h.call('POST', '/api/topten/nominations', { body: nomination(), ip: '198.51.100.1' })).status, 201);
  assert.equal((await h.call('POST', '/api/topten/nominations', { body: nomination({ website: 'x' }), ip: '198.51.100.2' })).status, 400);
  // Utwór nie trafia na listę bez decyzji redakcji.
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items.length, 1);
});

test('moderacja: tylko redakcja; publikacja dodaje utwór, takedown go usuwa; log audytu nienaruszalny', async () => {
  const h = harness();
  const { body: { id } } = await h.call('POST', '/api/topten/nominations', { body: nomination() });
  assert.equal((await h.call('GET', '/api/topten/admin/nominations', { token: 'u1' })).status, 403);
  const list = await h.call('GET', '/api/topten/admin/nominations', { token: 'admin' });
  assert.equal(list.body.items[0].id, id);
  assert.equal(list.body.items[0].ip_hash, undefined);
  const pub = await h.call('POST', `/api/topten/admin/nominations/${id}`, { token: 'admin', body: { status: 'published', note: 'OK redakcja',
    track: { support: [{ method: 'Zrzutka', value: 'zrzutka.pl/abc', url: 'https://zrzutka.pl/abc' }, { method: 'Zły', value: 'x', url: 'https://evil.example' }] } } });
  assert.equal(pub.status, 200);
  const c = await h.call('GET', '/api/topten/charts');
  const t = c.body.items.find(i => i.id === id);
  assert.equal(t.youtubeId, 'hVzNQqF_myg');
  assert.deepEqual(t.support.map(s => s.method), ['Zrzutka']);
  await h.call('POST', `/api/topten/admin/nominations/${id}`, { token: 'admin', body: { status: 'takedown' } });
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items.some(i => i.id === id), false);
  const audit = h.db.raw.prepare('SELECT action FROM topten_audit_log ORDER BY id').all().map(r => r.action);
  assert.deepEqual(audit, ['nomination.submitted', 'nomination.published', 'nomination.takedown']);
  assert.throws(() => h.db.raw.exec('UPDATE topten_audit_log SET actor = 1'), /append-only/);
  assert.throws(() => h.db.raw.exec('DELETE FROM topten_audit_log'), /append-only/);
  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' });
  assert.throws(() => h.db.raw.exec('DELETE FROM topten_events'), /append-only/);
});

test('moderacja zdarzeń: wstrzymany głos nie liczy się do punktów', async () => {
  const h = harness();
  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' });
  const ev = await h.call('GET', '/api/topten/admin/events', { token: 'admin' });
  await h.call('POST', `/api/topten/admin/events/${ev.body.items[0].id}`, { token: 'admin', body: { reviewStatus: 'held' } });
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items[0].score, 0);
});

test('obserwowanie: awans o ≥3 miejsca tworzy powiadomienie, push VAPID bez treści, SW odbiera treść', async () => {
  const h = harness();
  const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', keys.privateKey);
  const env = { TOPTEN_VAPID_JWK: JSON.stringify(jwk) };
  // 3 dodatkowe utwory z głosami — nasz utwór na 4. miejscu.
  for (let i = 0; i < 3; i++) {
    const { body: { id } } = await h.call('POST', '/api/topten/nominations', { body: nomination({ trackTitle: `Utwór ${i}` }), ip: `198.51.100.${i}` });
    await h.call('POST', `/api/topten/admin/nominations/${id}`, { token: 'admin', body: { status: 'published' } });
    await h.call('POST', `/api/topten/tracks/${id}/boost`, { token: 'u2' });
  }
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items.find(i => i.id === TRACK).rank, 4);
  assert.equal((await h.call('POST', `/api/topten/tracks/${TRACK}/follow`, { token: 'u1' })).status, 200);
  const endpoint = 'https://fcm.googleapis.com/fcm/send/abc123';
  assert.equal((await h.call('POST', '/api/topten/push/subscribe', { token: 'u1', body: { endpoint: 'https://evil.example/x' } })).status, 400);
  assert.equal((await h.call('POST', '/api/topten/push/subscribe', { token: 'u1', body: { endpoint } })).status, 200);
  const key = await h.call('GET', '/api/topten/push/key', { env });
  assert.equal(key.body.publicKey, vapidPublicKey(jwk));

  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1', env });
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items.find(i => i.id === TRACK).rank, 1);
  const push = h.pushes.find(p => p.url === endpoint);
  assert.ok(push, 'wysłano push');
  assert.match(push.init.headers.Authorization, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]{87}$/);
  const pending = await h.call('POST', '/api/topten/push/pending', { body: { endpoint } });
  assert.equal(pending.body.items.length, 1);
  assert.match(pending.body.items[0].body, /awansuje o 3 m\./);
  assert.equal((await h.call('POST', '/api/topten/push/pending', { body: { endpoint } })).body.items.length, 0);
  const me = await h.call('GET', '/api/topten/me', { token: 'u1' });
  assert.equal(me.body.tracks[TRACK].following, true);
  assert.equal(me.body.tracks[TRACK].likedToday, true);
});

test('cisza nocna: brak powiadomień 22:00–7:00', async () => {
  const h = harness();
  h.setNow(Date.parse('2026-11-04T22:30:00Z')); // 23:30 PL
  for (let i = 0; i < 3; i++) {
    const { body: { id } } = await h.call('POST', '/api/topten/nominations', { body: nomination({ trackTitle: `N ${i}` }), ip: `198.51.100.${i}` });
    await h.call('POST', `/api/topten/admin/nominations/${id}`, { token: 'admin', body: { status: 'published' } });
    await h.call('POST', `/api/topten/tracks/${id}/boost`, { token: 'u2' });
  }
  await h.call('POST', `/api/topten/tracks/${TRACK}/follow`, { token: 'u1' });
  await h.call('POST', `/api/topten/tracks/${TRACK}/like`, { token: 'u1' });
  assert.equal((await h.call('GET', '/api/topten/charts')).body.items.find(i => i.id === TRACK).rank, 1);
  assert.equal(h.db.raw.prepare('SELECT COUNT(*) AS n FROM topten_notifications').get().n, 0);
  assert.equal(h.db.raw.prepare('SELECT last_rank FROM topten_follows').get().last_rank, 1); // ruch odnotowany mimo ciszy
});

test('POST bez application/json jest odrzucany (ochrona CSRF formularzy)', async () => {
  const h = harness();
  const req = new Request('https://polskieradio.cc/api/topten/nominations', { method: 'POST', body: 'a=b', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const res = await handleTopTenApi(req, { topten_db: h.db }, null, { verifyToken });
  assert.equal(res.status, 415);
});
