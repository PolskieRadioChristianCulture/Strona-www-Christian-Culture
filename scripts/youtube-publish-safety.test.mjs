// Regresja bezpieczeństwa publikacji YouTube (Biblia Audio) — @007, 02.11.2026.
// Incydent: przeglądarka zamykana w trakcie wgrywania 4K → wersje robocze, fałszywe „SUKCES”, duble.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findPublished, uploadStateFromText, waitForUploadComplete, studioDate, scheduleTarget } from './publish_perfect.mjs';
import { studioStatusOf, reconcile } from './yt_reconcile_history.mjs';
import { stateOf } from './yt_repair_biblia_audio.mjs';
import { CHANNELS } from './yt_studio_session.mjs';

const tmpHistory = (published) => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'yt-hist-')), 'h.json');
  fs.writeFileSync(f, JSON.stringify({ version: '1.0', published }));
  return f;
};

test('ochrona przed dublami: ten sam plik na tym samym kanale jest blokowany, martwe wpisy nie', () => {
  const f = tmpHistory([
    { videoFile: 'A_4K.mp4', channel: 'Biblia Audio Christian Culture', channelId: 'UCCq', studioStatus: 'public' },
    { videoFile: 'B_4K.mp4', channel: 'Biblia Audio Christian Culture', channelId: 'UCCq', studioStatus: 'broken' }
  ]);
  assert.ok(findPublished('x/A_4K.mp4', 'UCCq', f, 'Biblia Audio Christian Culture'));
  assert.equal(findPublished('x/A_4K.mp4', 'UCxx', f, 'CC Women'), null);
  assert.equal(findPublished('x/B_4K.mp4', 'UCCq', f, 'Biblia Audio Christian Culture'), null, 'przerwane wgranie nie może blokować naprawy');
});

test('stan przesyłania rozpoznawany z etykiety Studio (PL/EN)', () => {
  for (const [s, e] of [['Przesłano 50%', 'uploading'], ['Przesyłanie: 37%… Pozostało 5 min', 'uploading'], ['Uploading 12%', 'uploading'],
    ['Przesłano 100%', 'done'], ['Przesyłanie zakończone', 'done'], ['Upload complete … Processing', 'done'],
    ['Nie udało się przesłać pliku', 'error'], ['', 'unknown']]) assert.equal(uploadStateFromText(s), e, s);
});

const fakePage = (labels) => {
  let i = 0;
  return {
    locator: () => ({ first: () => ({ innerText: async () => labels[Math.min(i++, labels.length - 1)] }) }),
    waitForTimeout: async () => {}
  };
};

test('publikacja czeka na koniec przesyłania i nie publikuje po limicie', async () => {
  assert.match(await waitForUploadComplete(fakePage(['Przesłano 10%', 'Przesłano 80%', 'Przesyłanie zakończone']), { timeoutMs: 5000, pollMs: 1 }), /zakończone/);
  await assert.rejects(waitForUploadComplete(fakePage(['Przesłano 5%']), { timeoutMs: 30, pollMs: 1 }), /NIE publikuję/);
  await assert.rejects(waitForUploadComplete(fakePage(['Nie udało się przesłać pliku']), { timeoutMs: 1000, pollMs: 1 }), /błąd przesyłania/);
});

test('termin premiery: +2 dni 18:00, kolejny wolny dzień na kanale, format pola Studio', () => {
  const now = new Date('2026-11-02T10:00:00+01:00');
  assert.equal(studioDate(new Date('2026-11-04T12:00:00Z')), '4 lis 2026');
  const empty = { published: [] };
  assert.deepEqual(scheduleTarget({ channelName: 'X', now, history: empty }, 2, '18:00'), { ymd: '2026-11-04', date: '4 lis 2026', time: '18:00' });
  const busy = { published: [{ channel: 'X', videoFile: 'a_4K.mp4', scheduledDate: '2026-11-06' }, { channel: 'X', videoFile: 'a_Shorts_9x16.mp4', scheduledDate: '2026-11-09' }] };
  assert.equal(scheduleTarget({ channelName: 'X', now, history: busy }, 2, '18:00').ymd, '2026-11-07', '4K po ostatniej premierze 4K');
  assert.equal(scheduleTarget({ channelName: 'X', isShorts: true, now, history: busy }, 2, '18:00').ymd, '2026-11-10', 'Shorts liczone osobno');
  assert.equal(scheduleTarget({ now, history: empty }, 0), null, 'CC_YT_SCHEDULE_DAYS=0 → publikacja od razu');
});

test('uzgodnienie historii: przerwane, robocze, zaplanowane, brak, film na innym kanale', () => {
  const row = (id, visibility, rowText = '') => ({ id, visibility, restrictions: '', rowText, draft: /wersja robocza/i.test(visibility) });
  assert.equal(studioStatusOf(row('a', 'Oczekujący', 'Przesłano 50% Wkrótce nastąpi weryfikacja Oczekujący Anuluj przesyłanie')), 'broken');
  assert.equal(studioStatusOf(row('b', 'Wersja robocza')), 'draft');
  assert.equal(studioStatusOf(row('c', 'Publiczny')), 'public');
  const history = { published: [
    { videoUrl: 'https://youtu.be/aaaaaaaaaaa', channel: 'Christian Culture TV' },
    { videoUrl: 'https://studio.youtube.com', channel: 'CC Women' }
  ] };
  reconcile(history, [
    { channel: 'Osobowość +', videos: [row('aaaaaaaaaaa', 'Wersja robocza')] },
    { channel: 'Christian Culture TV', videos: [] }, { channel: 'CC Women', videos: [] }
  ]);
  assert.equal(history.published[0].studioStatus, 'draft');
  assert.equal(history.published[0].studioChannel, 'Osobowość +');
  assert.equal(history.published[1].studioStatus, 'missing');
});

test('plan naprawy: publiczny = ok, pełna wersja robocza = dokończ, przerwane = wgraj ponownie + do usunięcia', () => {
  const ep = { key: 'Księga Rodzaju 7:1-24' };
  const r = (id, visibility, rowText, tab = 'videos') => ({ id, tab, title: 'Księga Rodzaju 7:1-24 (UBG) • Potop', visibility, rowText });
  assert.equal(stateOf([r('p', 'Publiczny', ''), r('d', 'Wersja robocza', 'Wersja robocza')], ep, 'videos').action, 'ok');
  const s = stateOf([r('d1', 'Wersja robocza', 'Wersja robocza'), r('d2', 'Wersja robocza', 'Wersja robocza'), r('b', 'Oczekujący', 'Przesłano 40% Anuluj przesyłanie')], ep, 'videos');
  assert.equal(s.action, 'complete-draft');
  assert.equal(s.keep.id, 'd1');
  assert.deepEqual(s.extras.map(v => v.id), ['d2', 'b']);
  assert.equal(stateOf([r('b', 'Oczekujący', 'Przesłano 40% Anuluj przesyłanie')], ep, 'videos').action, 'upload');
  assert.equal(stateOf([r('s', 'Publiczny', '', 'shorts')], ep, 'videos').action, 'upload', 'Shorts nie liczą się jako 4K');
});

test('mapa kanałów: Osobowość + ≠ Christian Culture TV, kanały menedżerskie przez Osobowość +', () => {
  assert.equal(CHANNELS['Osobowość +'].id, 'UCHmPxDM2zzlUAf5ZvlotPLw');
  assert.notEqual(CHANNELS['Christian Culture TV'].id, 'UCHmPxDM2zzlUAf5ZvlotPLw');
  for (const n of ['Biblia Audio Christian Culture', 'Werset Dnia - Chrześcijański Serwis Biblijny', 'Polskie Radio CHRISTIAN CULTURE']) assert.equal(CHANNELS[n].via, '@osobowośćPLUS');
});
