// Strażnik (@007, L0 23.11.2026): funkcje Lumi Messenger na poziomie Messengera/WhatsAppa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
