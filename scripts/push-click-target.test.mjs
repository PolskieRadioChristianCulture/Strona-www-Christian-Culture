// Strażnik (@007, L0 23.11.2026): kliknięcie powiadomienia z Czatu Ogólnego otwiera czat ogólny
// dokładnie przy tej wiadomości — nigdy prywatnej rozmowy z autorem.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sw = readFileSync(new URL('../firebase-messaging-sw.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../lumina.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/lumina-chat-premium.css', import.meta.url), 'utf8');

const start = sw.indexOf('function handleLuminaNotificationClickDefault');
const end = sw.indexOf('\n}\n', start) + 2;
assert.ok(start > 0 && end > start);

function clickHandler() {
  const opened = [];
  const posted = [];
  const ctx = {
    self: { location: { origin: 'https://polskieradio.cc' } },
    clients: { matchAll: async () => [], openWindow: async (u) => { opened.push(u); return { postMessage: (m) => posted.push(m) }; } },
    setTimeout: (f) => f(), URL, console,
  };
  const fn = new Function(...Object.keys(ctx), `${sw.slice(start, end)};return handleLuminaNotificationClickDefault;`)(...Object.values(ctx));
  return async (data, action = '') => {
    opened.length = 0; posted.length = 0;
    let p; fn({ action, notification: { data }, waitUntil: (x) => { p = x; } });
    await p;
    return { url: opened[0], chatData: posted[0] && posted[0].chatData };
  };
}

test('public chat push opens the general chat at that message, without the sender', async () => {
  const r = await clickHandler()({ type: 'public_chat', senderId: 'wiolettarogowska', messageId: 'abc123' });
  assert.equal(r.url, 'https://polskieradio.cc/lumina?openPublicChat=1&messageId=abc123');
  assert.equal(r.chatData.type, 'public');
  assert.equal(r.chatData.senderId, '');
});

test('@mention from the general chat also opens the general chat, not a private room', async () => {
  const r = await clickHandler()({ type: 'mention', senderId: 'wiolettarogowska', roomId: 'public', messageId: 'm77' });
  assert.equal(r.url, 'https://polskieradio.cc/lumina?openPublicChat=1&messageId=m77');
  assert.equal(r.chatData.senderId, '');
});

test('private message push still opens the private room in /mess', async () => {
  const r = await clickHandler()({ type: 'direct_message', senderId: 'wiolettarogowska', messageId: 'd1' });
  assert.match(r.url, /^https:\/\/polskieradio\.cc\/mess\?openChat=wiolettarogowska&messageId=d1/);
});

test('page focuses the target message with a persistent gold frame (works with reduced motion)', () => {
  assert.match(page, /window\.luminaOpenPublicChatAt = function\(msgId\)/);
  assert.match(page, /chatData\.type === 'public'[\s\S]{0,120}luminaOpenPublicChatAt/);
  assert.match(page, /classList\.add\('chat-message-highlight', 'chat-message-target'\)/);
  assert.match(css, /\.chat-message-target\s*\{[^}]*outline:\s*3px solid/);
});
