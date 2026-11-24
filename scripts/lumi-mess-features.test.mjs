// Strażnik (@007, L0 23.11.2026): funkcje Lumi Messenger na poziomie Messengera/WhatsAppa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const chat = readFileSync(new URL('../components/cc-global-chat-button.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../firebase-messaging-sw.js', import.meta.url), 'utf8');

function extract(name) {
  const start = chat.indexOf(`function ${name}(`);
  assert.ok(start > 0, name);
  const end = chat.indexOf('\n  }', start) + 4;
  return new Function(`${chat.slice(start, end)}; return ${name};`)();
}

test('chat loads the LUMINA database on pages that do not include it (live chat everywhere)', () => {
  assert.match(chat, /const CC_LUMINA_DB_URL = '\/lumina-db\.js\?v=20261013_notifsafe1'/);
  assert.match(chat, /window\.ccEnsureLuminaDb = function/);
  assert.match(chat, /throw new Error\('lumina-db-unavailable'\)/);
});

test('unread divider, day separators, typing, reactions, message menu and onboarding are wired', () => {
  for (const marker of ['ccUnreadSep', 'cc-chat-day-sep', 'ccTypingIndicator', 'ccRenderReactions', 'window.ccOpenMsgMenu', 'reportContent', 'blockUser', 'changeOwnPublicChatMessage', 'ccLumiMaybeShowOnboarding']) {
    assert.ok(chat.includes(marker), marker);
  }
});

test('only safe image/audio sources are rendered (no SVG, no javascript:)', () => {
  const img = extract('ccSafeImg');
  const audio = extract('ccSafeAudio');
  assert.equal(img('data:image/jpeg;base64,AAAA'), true);
  assert.equal(img('data:image/png;base64,AAAA'), true);
  assert.equal(img('data:image/svg+xml;base64,AAAA'), false);
  assert.equal(img('javascript:alert(1)'), false);
  assert.equal(img('data:image/jpeg;base64,AA"onerror="x'), false);
  assert.equal(audio('data:audio/webm;base64,AAAA'), true);
  assert.equal(audio('data:audio/webm;codecs=opus;base64,AAAA'), true);
  assert.equal(audio('data:text/html;base64,AAAA'), false);
});

test('app icon badge is updated by the service worker and cleared when the chat is read', () => {
  assert.match(sw, /function ccUpdateAppBadge\(\)/);
  assert.match(sw, /showNotification\(title, notificationOptions\)\.then\(ccUpdateAppBadge\)/);
  assert.match(chat, /function ccClearChatBadge\(\)/);
});

test('quiet hours are configurable in chat settings', () => {
  assert.match(chat, /id="ccQuietToggle"/);
  assert.match(chat, /setPushQuietHours/);
});

test('public chat reaction falls back to zero-read FieldPath update when quota is exhausted and returns errors when update fails', async () => {
  const dbSrc = readFileSync(new URL('../lumina-db.js', import.meta.url), 'utf8');
  const fnSrc = dbSrc
    .slice(dbSrc.indexOf('export async function togglePublicChatMessageReaction'), dbSrc.indexOf('export function subscribeToUserChats'))
    .replace('export ', '');
  const user = { uid: 'uid_czarek' };
  const msg = { id: 'msg_quota', reactions: { '👍': [{ id: 'inna', name: 'Anna' }] } };
  let updates = [];
  let failWrite = false;

  class FakeFieldPath {
    constructor(...segments) {
      this.segments = segments;
    }
  }

  const context = vm.createContext({
    currentUserState: user,
    currentProfileState: { slug: 'cezaryrgowski', name: 'Cezary Rogowski' },
    activePublicChatMessages: [msg],
    auth: { currentUser: user },
    db: {},
    doc: (_db, _col, id) => id,
    normalizeChatUserId: v => String(v || '').trim().toLowerCase().replace(/^u_/, ''),
    FieldPath: FakeFieldPath,
    arrayUnion: (...items) => ({ op: 'arrayUnion', items }),
    arrayRemove: (...items) => ({ op: 'arrayRemove', items }),
    updateDoc: async (ref, fieldPath, op) => {
      if (failWrite) throw Object.assign(new Error('Quota exceeded.'), { code: 'resource-exhausted' });
      updates.push({ ref, segments: fieldPath.segments, op });
    },
    runTransaction: async () => {
      throw Object.assign(new Error('Quota exceeded.'), { code: 'resource-exhausted' });
    },
    console: { warn() {} }
  });
  vm.runInContext(fnSrc, context);

  // Add reaction without any Firestore read
  const addRes = await context.togglePublicChatMessageReaction('msg_quota', '🙏', { uid: 'uid_czarek', name: 'Cezary Rogowski' });
  assert.equal(addRes.success, true);
  assert.equal(addRes.fallback, 'zero_read_update');
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0])), {
    ref: 'msg_quota',
    segments: ['reactions', '🙏'],
    op: { op: 'arrayUnion', items: [{ id: 'cezaryrgowski', name: 'Cezary Rogowski' }] }
  });
  assert.equal(msg.reactions['🙏'].length, 1);

  // Toggle same reaction off via arrayRemove
  const remRes = await context.togglePublicChatMessageReaction('msg_quota', '🙏', { uid: 'uid_czarek', name: 'Cezary Rogowski' });
  assert.equal(remRes.success, true);
  assert.equal(remRes.fallback, 'zero_read_update');
  assert.equal(updates[1].op.op, 'arrayRemove');
  assert.equal(msg.reactions['🙏'], undefined);

  // When write fails too, do not fake reaction
  failWrite = true;
  const errRes = await context.togglePublicChatMessageReaction('msg_quota', '❤️', { uid: 'uid_czarek', name: 'Cezary Rogowski' });
  assert.equal(errRes.success, false);
  assert.equal(errRes.reason, 'resource-exhausted');
  assert.equal(msg.reactions['❤️'], undefined);
});

test('Lumi Messenger ccReact waits for DB/auth, uses profile slug, locks double clicks, closes pickers, and handles failures', () => {
  assert.match(chat, /const ccReactBusy = new Set\(\);/);
  const block = chat.slice(chat.indexOf('window.ccToggleReactPicker = function'), chat.indexOf('function ccSheet(html)'));
  assert.match(block, /querySelectorAll\('#ccChatMessagesList \.cc-react-picker\.is-open'\)/);
  assert.match(block, /window\.ccEnsureLuminaDb\(\)/);
  assert.match(block, /waitForAuthReady\(2500\)/);
  assert.match(block, /getCurrentProfile\(\)/);
  assert.match(block, /ccReactBusy\.has\(msgId\)/);
  assert.match(block, /ccReactBusy\.delete\(msgId\)/);
  assert.match(block, /if \(res && res\.success\) \{[\s\S]*?target\.reactions = res\.reactions;[\s\S]*?renderChatMessages\(\);/);
  assert.match(block, /ccSheetMessage\('Nie zapisano reakcji'/);
});
