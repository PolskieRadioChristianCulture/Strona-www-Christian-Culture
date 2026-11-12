import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
];

const sources = await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')]));

test('lumi-standalone.css permits reaction picker and enforces top z-index', async () => {
  const css = await readFile('css/lumi-standalone.css', 'utf8');
  assert.ok(css.includes(':not(.lumina-msg-action-menu)'), 'standalone shell keeps the public message action menu visible');
  assert.match(
    css,
    /:not\(\.lumina-reaction-picker\)/,
    'lumi-standalone.css does not hide .lumina-reaction-picker under body.lumi-standalone',
  );
  assert.match(
    css,
    /\.lumina-reaction-picker\s*\{[\s\S]*?z-index:\s*2147483647\s*!important/i,
    'lumi-standalone.css gives .lumina-reaction-picker maximum stacking z-index',
  );
});

test('lumina-chat-premium.css defines picker, buttons and chip styling', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');
  assert.match(css, /\.lumina-reaction-picker\s*\{/, 'defines .lumina-reaction-picker');
  assert.match(css, /\.lumina-reaction-btn\s*\{/, 'defines .lumina-reaction-btn');
  assert.match(css, /\.lumina-reaction-chip\s*\{/, 'defines .lumina-reaction-chip');
  assert.match(css, /\.lumina-reaction-add-btn\s*\{/, 'defines .lumina-reaction-add-btn');
  assert.match(css, /\.lumina-reaction-picker\.is-open\s*\{/, 'defines .lumina-reaction-picker.is-open animation state');
});

test('every active Lumina chat renderer wires modern reaction handlers and picker', () => {
  for (const [file, source] of sources) {
    assert.match(source, /window\.handleChatReaction\s*=\s*async\s*function/, `${file} defines window.handleChatReaction`);
    assert.match(source, /window\.toggleReactionPicker\s*=\s*function/, `${file} defines window.toggleReactionPicker`);
    assert.match(source, /function buildMessageReactionsHtml\(msg, type, chatId, myId\)/, `${file} defines buildMessageReactionsHtml`);

    // Verify picker accessibility and robustness
    assert.match(source, /picker\.setAttribute\(['"]role['"],\s*['"]dialog['"]\)/, `${file} sets role="dialog" on reaction picker`);
    assert.match(source, /sp\.addEventListener\(['"]pointerdown['"],/, `${file} stops propagation on pointerdown for emoji buttons`);
    assert.match(source, /picker\.classList\.add\(['"]is-open['"]\)/, `${file} triggers is-open animation class on picker`);

    // Verify guest protection in handleChatReaction
    assert.match(source, /Zaloguj się, aby dodawać reakcje na wiadomości!/, `${file} alerts unauthenticated guests to log in`);
  }
});

test('lumina-db.js reaction handlers and listeners operate with id priority', async () => {
  const dbSource = await readFile('lumina-db.js', 'utf8');
  assert.match(dbSource, /export async function toggleDirectMessageReaction\(/, 'lumina-db.js exports toggleDirectMessageReaction');
  assert.match(dbSource, /export async function togglePublicChatMessageReaction\(/, 'lumina-db.js exports togglePublicChatMessageReaction');
  assert.match(dbSource, /msgs\.push\(\{\s*\.\.\.d\.data\(\),\s*id:\s*d\.id\s*\}\)/, 'subscribeToPublicChat preserves Firestore document id over data fields');
});
