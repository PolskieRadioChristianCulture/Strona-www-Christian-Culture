// Strażnik (@007, L0 24.11.2026): status online/offline w czasie rzeczywistym + rozważania o północy czasu polskiego.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createPresenceChannel } from '../js/lumina-presence-channel.js';

const NOW = 1_800_000_000_000;

function presence(rows) {
  const doc = new EventTarget(); doc.visibilityState = 'visible';
  let receive; const out = [];
  const sub = createPresenceChannel({ document: doc, now: () => NOW,
    listen: cb => { receive = cb; return () => {}; }, setInterval: () => 1, clearInterval: () => {} });
  sub(list => out.push(list.map(m => m.uid)));
  receive({ metadata: { fromCache: false }, forEach: fn => rows.forEach(r => fn({ id: r.uid, metadata: {}, data: () => r })) });
  return out[out.length - 1];
}
const base = { isLoggedIn: true, lastActiveMillis: NOW - 10_000 };

test('closed/hidden tab is offline immediately (no 90 s wait)', () => {
  assert.deepEqual(presence([{ ...base, uid: 'a', sessions: { s1: 0 }, sessionsAt: NOW - 1000 }]), []);
});

test('second device of the same account keeps the user online', () => {
  assert.deepEqual(presence([{ ...base, uid: 'a', sessions: { phone: 0, pc: NOW - 10_000 }, sessionsAt: NOW - 1000 }]), ['a']);
});

test('legacy documents (no sessions) and old cached clients keep the previous 90 s rule', () => {
  assert.deepEqual(presence([{ ...base, uid: 'old' }]), ['old']);
  // stara wersja wysłała „jestem” po ostatnim zapisie znaczników → liczy się czas
  assert.deepEqual(presence([{ ...base, uid: 'mix', sessions: { s1: 0 }, sessionsAt: NOW - 60_000 }]), ['mix']);
  assert.deepEqual(presence([{ isLoggedIn: true, uid: 'gone', lastActiveMillis: NOW - 200_000 }]), []);
});

test('heartbeat writes a per-tab session marker; tab close writes it as 0', async () => {
  const source = fs.readFileSync(new URL('../lumina-db.js', import.meta.url), 'utf8');
  const code = source.slice(source.indexOf('let presenceHeartbeatTimer'), source.indexOf('let sharedPresenceChannel')).replace('export function', 'function');
  const writes = []; const winEvents = {};
  const doc = new EventTarget(); doc.visibilityState = 'visible';
  const context = { db: {}, currentUserState: { uid: 'U1', isAnonymous: false }, currentProfileState: {}, document: doc,
    window: { LuminaDB: {}, location: { pathname: '/lumina' }, addEventListener: (n, fn) => { winEvents[n] = fn; } },
    sessionStorage: { getItem: () => 'tabA', setItem() {} }, Math, Promise, Date: { now: () => NOW },
    doc: () => ({}), serverTimestamp: () => 'server', setDoc: async (_ref, data) => { writes.push(data); },
    setInterval: () => 1, setTimeout: () => 2, clearTimeout() {}, onAuthChange() {} };
  vm.runInNewContext(code + ';startPresenceHeartbeat();', context);
  await Promise.resolve();
  assert.equal(writes.length, 1);
  assert.equal(JSON.stringify(writes[0].sessions), JSON.stringify({ tabA: NOW }));
  assert.equal(writes[0].sessionsAt, NOW);
  winEvents.pagehide();
  await Promise.resolve();
  assert.equal(writes.length, 2);
  assert.equal(JSON.stringify(writes[1].sessions), JSON.stringify({ tabA: 0 }));
});

test('online = green dot on the avatar everywhere; offline = no dot (never red)', () => {
  const chat = fs.readFileSync(new URL('../components/cc-global-chat-button.js', import.meta.url), 'utf8');
  assert.match(chat, /\.cc-presence-wrap\.cc-online::after \{[\s\S]{0,200}background: #22C55E/);
  assert.match(chat, /class="cc-presence-wrap" data-presence="\$\{escapeHtml\(presenceKey\)\}"/);
  assert.match(chat, /ccApplyPresenceDots\(list\);/);
  assert.match(chat, /online teraz/);
  const member = fs.readFileSync(new URL('../js/lumina-member-presence.js', import.meta.url), 'utf8');
  assert.doesNotMatch(member, /#ef6464/);
  assert.match(member, /dot\.hidden = value !== 'online'/);
  for (const f of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    assert.match(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), /class="profile-carousel-online" data-lumina-presence-id="" data-lumina-presence-slug="\$\{p\.slug\}" hidden/, f);
  }
});

function newDayContext(nowMs) {
  const win = new EventTarget();
  const doc = new EventTarget(); doc.visibilityState = 'visible';
  const timers = [];
  Object.assign(win, { document: doc, Intl, Date: class extends Date { static now() { return nowMs.v; } constructor(...a) { super(...(a.length ? a : [nowMs.v])); } },
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {}, Math, CustomEvent });
  win.window = win;
  vm.runInNewContext(fs.readFileSync(new URL('../js/cc-new-day.js', import.meta.url), 'utf8'), win);
  return { win, doc, timers };
}

test('midnight is computed in Polish time, also across DST changes', () => {
  const clock = { v: Date.parse('2026-11-24T22:30:00Z') }; // 23:30 w Warszawie (CET)
  const { win } = newDayContext(clock);
  const ms = win.__ccNewDayInternals.msToWarsawMidnight(clock.v);
  assert.ok(Math.abs(ms - 30 * 60000) < 1500, String(ms));
  const dst = Date.parse('2026-10-24T21:30:00Z'); // 23:30 CEST, w nocy zmiana na czas zimowy
  assert.ok(Math.abs(win.__ccNewDayInternals.msToWarsawMidnight(dst) - 30 * 60000) < 1500);
  assert.equal(win.ccWarsawDate(new Date('2026-11-24T23:30:00Z')), '2026-11-25');
});

test('phone asleep over midnight: returning to the page fires cc:new-day at once', () => {
  const clock = { v: Date.parse('2026-11-24T22:59:00Z') };
  const { win, doc } = newDayContext(clock);
  const got = [];
  win.ccOnNewDay(d => got.push(d.date));
  clock.v = Date.parse('2026-11-24T23:20:00Z'); // 00:20 w Warszawie
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(got, ['2026-11-25']);
});

test('every page loads the midnight clock; reflection modules listen to it', () => {
  for (const f of ['components/cc-support-footer.js', 'js/cc-support-footer.js']) {
    assert.match(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), /\/js\/cc-new-day\.js\?v=/, f);
  }
  for (const f of ['js/lumina-db/devotional-feed.js', 'lumina-tablica.html', 'lumina-tablica-light.html', 'components/cc-global-chat-button.js', 'js/cc-sanctification-path.js', 'dobrzezejestes.js']) {
    assert.match(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'), /addEventListener\('cc:new-day'/, f);
  }
});

test('a fallback (yesterday) reflection is not cached for today, so the next refresh gets the new one', async () => {
  const mod = await import('../js/lumina-db/devotional-feed.js');
  let day = '2026-11-24';
  const fetchImpl = async (url) => ({ ok: true, json: async () => (String(url).includes('firestore')
    ? [] : [{ date: day, title: 'R ' + day, contentWeb: 'Treść ' + day }]) });
  const now = new Date('2026-11-24T23:01:00Z'); // 00:01 25.11 w Warszawie
  const first = await mod.fetchCanonicalDailyReflection({ now, fetchImpl });
  assert.equal(first.todayStr, '2026-11-25');
  assert.equal(first.reflectionRecord.date, '2026-11-24'); // jeszcze wczorajsze
  day = '2026-11-25';
  const second = await mod.fetchCanonicalDailyReflection({ now, fetchImpl });
  assert.equal(second.reflectionRecord.date, '2026-11-25');
});
