// Testy: Wiadomość z Nieba → czat główny Lumi Mess (07:00 i 19:00, ten sam werset). @007, L0 23.11.2026.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { broadcastDailyToPublicChat, buildChatMessage, chatMessageId, CARD_TEMPLATE } from '../src/chat-broadcast.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const LIVE_CFG = {
  mode: 'PRODUCTION_LIVE',
  productionApprovedByOwner: true,
  killSwitch: false,
  profile: { slug: 'wiadomosci_z_nieba', fullTitle: 'Jezus Chrystus — Wiadomości z nieba', avatarPng: '/images/lumina/wiadomosci-z-nieba-avatar.png', publicUrl: 'https://polskieradio.cc/wiadomosc-z-nieba/' },
};
const VERSE = { text: 'Jest droga, która człowiekowi wydaje się słuszna, lecz końcem jej jest droga do śmierci.', referencePl: 'Księga Przysłów 14,12' };
const DATE = new Date('2026-11-23T07:00:00+01:00');

function fakeClient({ post = { exists: true, data: { text: 'Treść dnia', verseReference: VERSE.referencePl } } } = {}) {
  const chat = new Map();
  return {
    chat,
    async getPost() { return post; },
    async getPublicChatMessage(id) { return chat.has(id) ? { exists: true, data: chat.get(id) } : { exists: false }; },
    async createPublicChatMessage(id, doc) { if (chat.has(id)) throw new Error('ALREADY_EXISTS'); chat.set(id, doc); return { messageId: id }; },
  };
}
const verseFetcher = () => ({ ok: true, verse: VERSE });

test('rano i wieczorem: dwie wiadomości, ten sam werset, karta z szablonem L0', async () => {
  const client = fakeClient();
  const m = await broadcastDailyToPublicChat({ slot: 'morning', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  const e = await broadcastDailyToPublicChat({ slot: 'evening', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  assert.equal(m.status, 'PUBLISHED_CHAT');
  assert.equal(e.status, 'PUBLISHED_CHAT');
  const am = client.chat.get('wzn_chat_2026-11-23_morning');
  const pm = client.chat.get('wzn_chat_2026-11-23_evening');
  assert.equal(am.type, 'wzn_card');
  assert.equal(am.wzn.verseText, pm.wzn.verseText);
  assert.equal(am.wzn.reference, 'Księga Przysłów 14,12');
  assert.equal(am.wzn.template, CARD_TEMPLATE);
  assert.equal(am.dateStr, '07:00');
  assert.equal(pm.dateStr, '19:00');
  assert.match(pm.text, /Wieczorna/);
  assert.ok(am.text.length <= 2000 && pm.text.length <= 2000);
  assert.ok(fs.existsSync(path.join(ROOT, CARD_TEMPLATE)), 'szablon karty istnieje w repo');
});

test('powtórne uruchomienie tej samej pory nie dubluje wiadomości', async () => {
  const client = fakeClient();
  await broadcastDailyToPublicChat({ slot: 'evening', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  const again = await broadcastDailyToPublicChat({ slot: 'evening', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  assert.equal(again.status, 'SKIPPED_DUPLICATE');
  assert.equal(client.chat.size, 1);
});

test('bez wpisu dnia na Tablicy wieczór nic nie publikuje', async () => {
  const client = fakeClient({ post: { exists: false } });
  const res = await broadcastDailyToPublicChat({ slot: 'evening', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  assert.equal(res.status, 'NO_DAILY_POST');
  assert.equal(client.chat.size, 0);
});

test('niezgodny werset (wpis ≠ źródło UBG) blokuje publikację', async () => {
  const client = fakeClient({ post: { exists: true, data: { text: 'x', verseReference: 'Rz 6,23' } } });
  const res = await broadcastDailyToPublicChat({ slot: 'morning', date: DATE, firestoreClient: client, config: LIVE_CFG, verseFetcher });
  assert.equal(res.status, 'VERSE_MISMATCH');
  assert.equal(client.chat.size, 0);
});

test('tryb TEST albo wyłącznik awaryjny: brak publikacji w czacie', async () => {
  const client = fakeClient();
  const t = await broadcastDailyToPublicChat({ slot: 'morning', date: DATE, firestoreClient: client, config: { ...LIVE_CFG, mode: 'TEST_SIMULATION' }, verseFetcher });
  const k = await broadcastDailyToPublicChat({ slot: 'morning', date: DATE, firestoreClient: client, config: { ...LIVE_CFG, killSwitch: true }, verseFetcher });
  assert.equal(t.status, 'NOT_LIVE');
  assert.equal(k.status, 'KILLED');
  assert.equal(client.chat.size, 0);
});

test('długa treść jest przycinana do limitu reguł czatu (2000 znaków)', () => {
  const doc = buildChatMessage({ verse: VERSE, postText: 'a'.repeat(5000), runDate: '2026-11-23', slot: 'morning', config: LIVE_CFG });
  assert.ok(doc.text.length <= 2000);
  assert.throws(() => chatMessageId('2026-11-23', 'noon'));
});

test('okno czatu renderuje kartę WZN z pobieraniem i udostępnianiem', () => {
  const js = fs.readFileSync(path.join(ROOT, 'components', 'cc-global-chat-button.js'), 'utf8');
  assert.match(js, /m\.type === 'wzn_card' && m\.wzn \? renderWznChatCard\(m\)/);
  assert.match(js, /window\.wznChatDownload = async function/);
  assert.match(js, /window\.wznChatShare = async function/);
  assert.match(js, /\/images\/wiadomosc-z-nieba\/szablon-1x1\.jpg/);
});
