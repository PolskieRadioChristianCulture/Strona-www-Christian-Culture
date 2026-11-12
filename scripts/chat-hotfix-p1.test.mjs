import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const pages = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html'
];

test('P1 Hotfix 1: Emoji reaction picker includes required set and safe event bindings', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');
  assert.match(css, /\.lumina-reaction-picker\s*\{/, 'defines .lumina-reaction-picker');
  assert.match(css, /\.lumina-reaction-btn\s*\{/, 'defines .lumina-reaction-btn');

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    assert.match(html, /['"]❤️['"],\s*['"]👍['"],\s*['"]🙏['"],\s*['"]😂['"],\s*['"]😊['"],\s*['"]✨['"]/, `${page} picker contains required emojis including joy 😂 and prayer 🙏`);
    assert.doesNotMatch(html, /window\.addEventListener\(['"]scroll['"],\s*dismissHandler,\s*true\)/, `${page} does not use aggressive capture scroll listener that dismisses picker on mobile touch`);
    assert.match(html, /window\.handleChatReaction\s*=\s*async\s*function/, `${page} defines window.handleChatReaction`);
  }
});

test('P1 Hotfix 1: lumina-db.js enforces authentication and writes to backend before updating state (no fake reactions)', async () => {
  const dbSource = await readFile('lumina-db.js', 'utf8');
  assert.match(dbSource, /export async function togglePublicChatMessageReaction\(/, 'exports togglePublicChatMessageReaction');
  assert.match(dbSource, /if\s*\(!user\s*\|\|\s*user\.isAnonymous\s*\|\|\s*!user\.uid\)/, 'rejects unauthenticated or anonymous user');
  assert.match(dbSource, /return\s*\{\s*success:\s*false,\s*reason:\s*['"]unauthenticated['"]\s*\}/, 'returns unauthenticated status without faking reactions');

  const method = dbSource.slice(dbSource.indexOf('export async function togglePublicChatMessageReaction'), dbSource.indexOf('export function subscribeToUserChats'));
  assert.ok(method.includes('return await runTransaction(db'));
  assert.ok(method.includes('transaction.get(ref)'));
  assert.ok(method.includes('transaction.update(ref, { reactions })'));
  assert.equal(method.includes('localStorage.setItem'), false, 'the realtime snapshot owns cache updates');
});

test('public chat toggles only the selected member reaction and reports missing or failed saves', async () => {
  const source = await readFile('lumina-db.js', 'utf8');
  const body = source.slice(source.indexOf('export async function togglePublicChatMessageReaction'), source.indexOf('export function subscribeToUserChats')).replace('export ', '');
  const user = { uid: 'member' };
  let existing = { '❤️': [{ id: 'other', name: 'Inny użytkownik' }] };
  let mode = 'ok';
  const context = vm.createContext({
    currentUserState: user, auth: { currentUser: user }, db: {},
    doc: (_db, _collection, id) => id,
    normalizeChatUserId: value => value,
    console: { warn() {} },
    runTransaction: async (_db, operation) => {
      let written;
      const result = await operation({
        get: async () => ({ exists: () => mode !== 'missing', data: () => ({ reactions: existing }) }),
        update: (_ref, data) => { written = data.reactions; },
      });
      if (mode === 'failure') throw new Error('offline');
      if (written) existing = written;
      return result;
    },
  });
  vm.runInContext(body, context);
  const toggle = () => context.togglePublicChatMessageReaction('message1', '❤️', { slug: 'member', name: 'Uczestnik' });
  assert.equal((await toggle()).success, true);
  assert.equal(existing['❤️'].map(entry => entry.id).join(','), 'other,member');
  assert.equal((await toggle()).success, true);
  assert.equal(existing['❤️'].map(entry => entry.id).join(','), 'other');
  mode = 'missing';
  assert.equal((await toggle()).reason, 'not_found');
  mode = 'failure';
  assert.equal((await toggle()).success, false);
  assert.equal(existing['❤️'].map(entry => entry.id).join(','), 'other');
});

test('P1 Hotfix 2: Share button is borderless, transparent and satisfies 44px ergonomics', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');
  assert.match(css, /\.cc-chat-share-btn\s*\{[\s\S]*?background:\s*transparent\s*!important;/, 'share button has transparent background in CSS');
  assert.match(css, /\.cc-chat-share-btn\s*\{[\s\S]*?border:\s*none\s*!important;/, 'share button has no border in CSS');
  assert.match(css, /\.cc-chat-share-btn\s*\{[\s\S]*?min-width:\s*44px\s*!important;[\s\S]*?min-height:\s*44px\s*!important;/, 'share button satisfies 44px ergonomics');

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    assert.doesNotMatch(html, /class="cc-chat-share-btn"[^>]*style="[^"]*background:rgba\(255,255,255,0\.08\)/, `${page} share button does not use dark rectangular container`);
    assert.doesNotMatch(html, /class="cc-chat-share-btn"[^>]*style="[^"]*border:1px solid/, `${page} share button does not use visible border box`);
  }
});

test('P1 Hotfix 3: Quote banner and quote block rendering are wired across surfaces', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');
  assert.match(css, /\.lumina-quote-banner\s*\{/, 'CSS defines .lumina-quote-banner');
  assert.match(css, /\.lumina-quote-block\s*\{/, 'CSS defines .lumina-quote-block');
  assert.match(css, /\.chat-message-highlight\s*\{/, 'CSS defines .chat-message-highlight');

  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    assert.match(html, /id="publicChatQuoteBanner"/, `${page} contains #publicChatQuoteBanner`);
    assert.match(html, /window\.startPublicChatQuote\s*=\s*function/, `${page} defines window.startPublicChatQuote`);
    assert.match(html, /window\.cancelPublicChatQuote\s*=\s*function/, `${page} defines window.cancelPublicChatQuote`);
    assert.match(html, /window\.scrollToChatMessage\s*=\s*function/, `${page} defines window.scrollToChatMessage`);
    assert.match(html, /class="lumina-quote-block"/, `${page} renders .lumina-quote-block in message rows`);
    assert.match(html, /window\.handleChatTouchStart/, `${page} binds touch start for long-press 450ms`);
    assert.match(html, /window\.handleChatContextMenu/, `${page} binds contextmenu for desktop right-click`);
    assert.match(html, /window\.openChatMessageMenu/, `${page} defines message action sheet menu`);
  }
});

test('P1 Hotfix 3: sendPublicChatMessage stores persistent reply metadata in Firestore', async () => {
  const dbSource = await readFile('lumina-db.js', 'utf8');
  assert.match(dbSource, /replyToMessageId:\s*messageObj\.replyToMessageId/, 'sendPublicChatMessage saves replyToMessageId');
  assert.match(dbSource, /replyToSenderName:\s*messageObj\.replyToSenderName/, 'sendPublicChatMessage saves replyToSenderName');
  assert.match(dbSource, /replyToText:\s*\(messageObj\.replyToText/, 'sendPublicChatMessage saves replyToText');
});
