import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { Window } from 'happy-dom';

test('TV presenters open TV from button, name and avatar; ordinary and forged messages retain DM', async () => {
  const page = await readFile('lumina.html', 'utf8');
  const renderer = page.match(/function renderPublicChatMessages\(messages\) \{[\s\S]*?\n        \}/)?.[0];
  assert.ok(renderer);
  const live = (await readFile('js/lumi-live-rooms.js', 'utf8'))
    .replace(/^import[\s\S]*?from '[^']+';\r?$/gm, '')
    .replace('export const LIVE_ROOMS', 'const LIVE_ROOMS');
  const w = new Window();
  w.document.body.innerHTML = '<div id="publicChatMessagesBox"></div>';
  const tvCalls = [], dmCalls = [];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const window = { LuminaDB: { getCurrentUser: () => ({uid:'viewer'}), getCurrentProfile: () => null, normalizeChatUserId: id => id } };
  const context = vm.createContext({ window, document: {readyState:'loading', addEventListener() {}},
    console, URLSearchParams, location:{search:''}, setInterval() {}, setTimeout() {},
    formatChatTime: () => '11:03', escapeHtml: escape, escapeForInlineJs: value => String(value ?? '').replace(/'/g, "\\'"),
    renderChatMedia: text => text, scrollChatToBottom() {}, localStorage:{getItem:()=>null},
    openChatWith: (...args) => dmCalls.push(args) });
  try {
    vm.runInContext(live, context);
    context.document = w.document;
    vm.runInContext(renderer, context);
    window.renderPublicChatMessages = context.renderPublicChatMessages;
    window.LumiLiveRooms.enterRoom = room => tvCalls.push(room);
    context.seed = {day:'TEST',items:[{i:0,kind:'noemi',text:'TEST Noemi',at:1},{i:1,kind:'sara',text:'TEST Sara',at:2}]};
    vm.runInContext('Object.assign(session, seed); hookPublicChat();', context);
    const ordinary = {id:'ordinary',senderId:'member',senderName:'TEST Member',text:'TEST',timestamp:{seconds:1}};
    const forged = {id:'cctv-TEST-9',senderId:'noemi',senderName:'Noemi',senderBadge:'Rozważanie · CCTV24',text:'TEST',timestamp:{seconds:1}};
    window.renderPublicChatMessages([ordinary,forged]);
    const rows = [...w.document.querySelectorAll('.lumina-msg-row')];
    const presenters = rows.filter(row => ['cctv-TEST-0','cctv-TEST-1'].includes(row.dataset.messageId));
    assert.equal(presenters.length, 2);
    for (const row of presenters) {
      const button = [...row.querySelectorAll('button')].find(b => b.textContent.includes('Napisz do TV'));
      assert.ok(button); assert.ok(button.style.minHeight === '44px');
      const actions = [...row.querySelectorAll('[onclick]')].filter(e => /enterRoom|openChatWith/.test(e.getAttribute('onclick')));
      assert.equal(actions.length,3);
      for(const element of actions) vm.runInContext(element.getAttribute('onclick'),context);
    }
    assert.deepEqual(tvCalls,Array(6).fill('tv_cctv24'));
    assert.equal(dmCalls.length,0);
    for(const id of ['ordinary','cctv-TEST-9']) {
      const row=rows.find(r=>r.dataset.messageId===id);
      const button=[...row.querySelectorAll('button')].find(b=>b.textContent.includes('Napisz Priv'));
      assert.ok(button); vm.runInContext(button.getAttribute('onclick'),context);
    }
    assert.deepEqual(dmCalls.map(args=>args[2]),['member','noemi']);
    assert.equal(window.LumiLiveRooms.publicMessageRoom(forged),null);
    assert.match(page,/lumi-live-rooms\.js\?v=20261120_40dm_v4/);
  } finally { await w.happyDOM.close(); }
});

const pages = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
];

const sources = await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')]));

test('message timestamps are HTML-escaped in every active chat renderer', () => {
  for (const [file, source] of sources) {
    assert.match(source, /function formatChatTime\(msg\)/, `${file} keeps the dateStr fallback formatter`);
    assert.doesNotMatch(
      source,
      /\$\{\s*(?:time|readTime|delivTime)\s*\}/,
      `${file} must not interpolate a potentially attacker-controlled timestamp directly into HTML`,
    );
    assert.match(source, /\$\{escapeHtml\(time\)\}/, `${file} escapes rendered chat timestamps`);
  }
});

test('reaction keys and chat identifiers are escaped in generated reaction HTML', () => {
  for (const [file, source] of sources) {
    const reactionBlock = source.match(/function buildMessageReactionsHtml\(msg, type, chatId, myId\) \{[\s\S]*?\n        \}/)?.[0];
    assert.ok(reactionBlock, `${file} has the expected reaction renderer`);
    assert.doesNotMatch(
      reactionBlock,
      /\$\{\s*(?:type|chatId|emojiKey)\s*\}/,
      `${file} must not interpolate untrusted reaction data into HTML or inline JavaScript`,
    );
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(chatId\)\}/, `${file} escapes the reaction chat identifier`);
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(emojiKey\)\}/, `${file} escapes the reaction key in inline JavaScript`);
    assert.match(reactionBlock, /\$\{escapeHtml\(emojiKey\)\}/, `${file} escapes the displayed reaction key`);
  }
});

test('renderChatMedia is defined and used across all Lumina chat renderers and global chat widget', async () => {
  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /function renderChatMedia\(/, 'cc-global-chat-button.js defines renderChatMedia');
  assert.match(globalChatSource, /\$\{renderChatMedia\(text,\s*m\.id\)\}/, 'cc-global-chat-button.js uses renderChatMedia on escaped text');

  for (const [file, source] of sources) {
    assert.match(source, /function renderChatMedia\(escapedText,\s*msgId\)/, `${file} defines renderChatMedia`);
    assert.match(source, /window\.playChatYoutube\s*=/, `${file} defines window.playChatYoutube`);
    assert.match(source, /renderChatMedia\(escapeHtml\(msg\.text\),\s*msg\.id\)/, `${file} passes escapeHtml(msg.text) to renderChatMedia`);
    assert.match(source, /i\.ytimg\.com\/vi\/.*firstYtId.*\/hqdefault\.jpg/, `${file} renders 16:9 YouTube thumbnail`);
    assert.match(source, /youtube-nocookie\.com\/embed/, `${file} uses privacy-friendly youtube-nocookie embed`);
  }
});

test('renderChatMedia unit tests: url linking, YouTube preview generation, and strict XSS safety', () => {
  // Extract implementation from lumina.html
  const luminaSource = sources.find(([f]) => f === 'lumina.html')[1];
  const fnMatch = luminaSource.match(/function renderChatMedia\(escapedText, msgId\) \{[\s\S]*?\n        \}/);
  assert.ok(fnMatch, 'renderChatMedia implementation found in lumina.html');

  // Eval function in isolated test scope
  const renderChatMedia = new Function('escapedText', 'msgId', `${fnMatch[0]}; return renderChatMedia(escapedText, msgId);`);

  // 1. Plain text without URLs
  const plain = renderChatMedia('Pokój Wam! Pozdrowienia w Chrystusie.', 'm1');
  assert.equal(plain, 'Pokój Wam! Pozdrowienia w Chrystusie.');

  // 2. Regular website URL
  const web = renderChatMedia('Sprawdź stronę: https://polskieradio.cc/akademia!', 'm2');
  assert.match(web, /<a href="https:\/\/polskieradio\.cc\/akademia" target="_blank"/);
  assert.ok(web.endsWith('!'), 'Trailing punctuation is preserved outside anchor');

  // 3. YouTube standard URL
  const ytStandard = renderChatMedia('Zobacz ten film: https://www.youtube.com/watch?v=prZNFB_p5uw', 'm3');
  assert.match(ytStandard, /<a href="https:\/\/www\.youtube\.com\/watch\?v=prZNFB_p5uw"/);
  assert.match(ytStandard, /cc-chat-yt-card/, 'Contains preview card');
  assert.match(ytStandard, /i\.ytimg\.com\/vi\/prZNFB_p5uw\/hqdefault\.jpg/, 'Thumbnail loaded');
  assert.match(ytStandard, /window\.playChatYoutube\('yt_preview_m3', 'prZNFB_p5uw'\)/, 'Play handler attached');

  // 4. YouTube short URL (youtu.be)
  const ytShort = renderChatMedia('Krótki link: https://youtu.be/prZNFB_p5uw', 'm4');
  assert.match(ytShort, /cc-chat-yt-card/);
  assert.match(ytShort, /prZNFB_p5uw/);

  // 5. YouTube Shorts URL
  const ytShorts = renderChatMedia('Shorts: https://youtube.com/shorts/prZNFB_p5uw?feature=share', 'm5');
  assert.match(ytShorts, /cc-chat-yt-card/);
  assert.match(ytShorts, /prZNFB_p5uw/);

  // 6. XSS Injection attack prevention
  const maliciousInput = '&lt;script&gt;alert(1)&lt;/script&gt; &lt;img src=x onerror=alert(2)&gt;';
  const sanitized = renderChatMedia(maliciousInput, 'm6');
  assert.doesNotMatch(sanitized, /<script>/, 'No unescaped script tag');
  assert.doesNotMatch(sanitized, /<img src=x/, 'No unescaped img tag');

  // 7. Malicious YouTube ID with quote/injection attempt
  const malformedInput = 'https://youtu.be/prZNFB_p5u&#039;&gt;&lt;script&gt;alert(1)&lt;/script&gt;';
  const sanitizedMalformed = renderChatMedia(malformedInput, 'm7');
  assert.doesNotMatch(sanitizedMalformed, /<script>/, 'No unescaped script execution');
  assert.doesNotMatch(sanitizedMalformed, /cc-chat-yt-card/, 'Invalid/tampered YouTube ID is rejected and not rendered as preview card');
});

test('every chat message renderer includes an accessible 44px UDOSTĘPNIJ button', async () => {
  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /class="cc-chat-share-btn"/, 'cc-global-chat-button.js renders cc-chat-share-btn');
  assert.match(globalChatSource, /min-height:\s*44px/, 'cc-global-chat-button.js has min 44px touch target');
  assert.match(globalChatSource, /window\.shareChatMessage/, 'cc-global-chat-button.js wires window.shareChatMessage');

  for (const [file, source] of sources) {
    assert.match(source, /function shareChatMessage\(/, `${file} defines shareChatMessage`);
    assert.match(source, /window\.shareChatMessage\s*=/, `${file} exports window.shareChatMessage`);
    assert.match(source, /window\.openShareMessageModal\s*=/, `${file} exports window.openShareMessageModal`);
    assert.match(source, /class="cc-chat-share-btn"/, `${file} contains cc-chat-share-btn`);
    assert.match(source, /min-height:\s*44px/, `${file} share button satisfies 44px touch ergonomics`);
    assert.match(source, /aria-label="Udostępnij wiadomość"/, `${file} share button has accessible aria-label`);
    assert.doesNotMatch(source, /class="cc-chat-share-btn"[^>]*>[\s\S]*?<span>Udostępnij<\/span>/, `${file} share button is icon-only without redundant text`);
    assert.match(source, /api\.whatsapp\.com\/send\?text=/, `${file} modal supports WhatsApp sharing`);
    assert.match(source, /t\.me\/share\/url\?/, `${file} modal supports Telegram sharing`);
    assert.match(source, /facebook\.com\/sharer\/sharer\.php\?/, `${file} modal supports Facebook sharing`);
    assert.match(source, /twitter\.com\/intent\/tweet\?/, `${file} modal supports X (Twitter) sharing`);
  }
});

test('public chat is opened first as default tab across ekosystem', async () => {
  const standaloneSource = await readFile('js/lumi-standalone.js', 'utf8');
  assert.match(standaloneSource, /window\.openDirectMessagesModal\('public'\)/, 'lumi-standalone.js opens public chat first');

  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /setChatPartner\(COMMUNITY_MEMBERS\[0\]\)/, 'cc-global-chat-button.js defaults to community public chat');

  for (const [file, source] of sources) {
    assert.match(
      source,
      /function openDirectMessagesModal\([^)]*\)\s*\{[\s\S]*?(?:preferredTab\s*\|\|\s*['"]public['"]|switchMessengerMainTab\(.*['"]public['"]\))/,
      `${file} defaults openDirectMessagesModal to public tab`,
    );
  }
});



test('room deep link opens BCM composer and modal before reflection data is ready', async () => {
  const source = (await readFile('js/lumi-live-rooms.js', 'utf8'))
    .replace(/^import[\s\S]*?from '[^']+';\r?$/gm, '')
    .replace('export const LIVE_ROOMS', 'const LIVE_ROOMS');
  const w = new Window({url:'https://polskieradio.cc/mess?room=tv_bcm24'});
  w.document.body.className = 'user-is-guest';
  w.document.body.innerHTML = '<div id="lumiIntroOverlay"></div><div id="directMessagesModal" inert aria-hidden="true" style="display:none"><button id="tabBtnPrivateChat"></button><div id="messengerPublicView"></div></div>';
  const win = {switchMessengerMainTab(){}};
  const context=vm.createContext({window:win,document:{readyState:'loading',addEventListener(){}},location:{search:'?room=tv_bcm24'},URLSearchParams,console,setTimeout(){},setInterval(){return 1;},clearInterval(){}});
  try {
    vm.runInContext(source,context);
    context.document=w.document;
    vm.runInContext('openLive = async () => {}; loadSession = () => new Promise(() => {}); boot();',context);
    const modal=w.document.getElementById('directMessagesModal');
    assert.equal(modal.style.display,'flex');
    assert.equal(modal.hasAttribute('inert'),false);
    assert.equal(modal.getAttribute('aria-hidden'),'false');
    assert.equal(modal.classList.contains('open'),true);
    assert.equal(modal.getAttribute('data-lumi-live-room'),'tv_bcm24');
    assert.ok([...w.document.styleSheets].some(s => [...s.cssRules].some(r => r.selectorText?.includes('[data-lumi-live-room]') && r.style?.display === 'flex')));
    assert.equal(w.document.getElementById('lumiIntroOverlay').hidden,true);
    assert.match(w.document.querySelector('.llr-title').textContent,/Biblijny Czas Modlitwy/);
    assert.match(w.document.querySelector('#llrInput').getAttribute('aria-label'),/Biblijny Czas Modlitwy/);
    modal.style.display='none';modal.classList.remove('open');
    win.LumiLiveRooms.enterRoom('tv_bcm24');
    assert.equal(modal.style.display,'flex','manual dashboard shortcut opens the modal too');
    win.switchMessengerMainTab('private');
    assert.equal(modal.hasAttribute('data-lumi-live-room'),false,'guest visibility exception must not apply to private chats');
    modal.style.display='none';
    assert.equal(win.LumiLiveRooms.enterRoom('unknown_room'),false);
    assert.equal(modal.style.display,'none','unknown room must not open a conversation');
  } finally {await w.happyDOM.close();}
});

test('deep-linked room subscribes once when Firebase becomes ready after room selection',async()=>{
 const source=(await readFile('js/lumi-live-rooms.js','utf8')).replace(/^import[\s\S]*?from '[^']+';\r?$/gm,'').replace('export const LIVE_ROOMS','const LIVE_ROOMS');
 let ready;const connection=new Promise(resolve=>{ready=resolve;});const reads=[];
 const context=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},URLSearchParams,location:{search:''},console,setTimeout(){},setInterval(){},clearInterval(){},collection:(db,...parts)=>parts,query:(...args)=>args,orderBy(){},limit(){},onSnapshot:q=>{reads.push(q);return ()=>{};}});
 vm.runInContext(source,context);context.connection=connection;
 vm.runInContext('firebaseReady=()=>connection; loadSession=async()=>{};renderRoom=()=>{};state.room=ROOM.tv_bcm24;',context);
 const opening=vm.runInContext('openLive()',context);assert.equal(reads.length,0);
 ready({db:{}});await opening;assert.equal(reads.length,1);assert.deepEqual(Array.from(reads[0][0]),['lumina_live_rooms','tv_bcm24','messages']);
 await vm.runInContext('openLive()',context);assert.equal(reads.length,1,'reopening does not duplicate the listener');
});

test('LUMI Messenger Czat ogólny defaults daily reflection to collapsed with 4 host avatars', async () => {
  const source = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(source, /let dailyDialogueCollapsed = true;/, 'daily reflection must default to collapsed');
  assert.match(source, /class="cc-daily-dialogue-avatars"/, 'daily reflection must render 4 host avatars container');
  for (const avatar of [
    'lumi_avatar_rut_circle.webp',
    'lumi_avatar_lea_circle.webp',
    'lumi_avatar_noemi_circle.webp',
    'lumi_avatar_miriam_circle.webp',
  ]) {
    assert.ok(source.includes(avatar), `missing host avatar ${avatar}`);
  }
  assert.match(source, /id="ccToggleDailyDialogueBtn"[^>]*aria-expanded=/, 'toggle button exposes aria-expanded');
  assert.match(source, /id="ccToggleDailyDialogueBtn"[^>]*aria-controls="ccDailyDialogueBody"/, 'toggle button controls ccDailyDialogueBody');
  assert.match(source, /id="ccToggleDailyDialogueBtn"[^>]*min-height:\s*44px/, 'toggle button meets 44px touch target');
  assert.match(source, /const turnsHtml = dailyDialogueCollapsed \? '' : `[\s\S]*?id="ccDailyDialogueBody"/, 'turns body is omitted when collapsed');
});

test('LUMI Messenger builds daily reflection and red tab directly from static /rozwazania_baza.json without Worker dependency', async () => {
  const source = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.ok(source.includes('function buildLocalDailyDialogue('), 'must define buildLocalDailyDialogue client-side');
  assert.ok(source.includes('function fetchDailyDialogueStaticFirst('), 'must define static-first daily loader');
  assert.ok(source.includes('/rozwazania_baza.json'), 'must fetch /rozwazania_baza.json directly');
  assert.ok(source.includes('id="ccDailyDialogueTab" class="cc-daily-dialogue-tab"'), 'must render red Rozwazanie tab');
  assert.match(source, /function renderDailyDialogueCardHtml\(\)\s*\{[\s\S]*?fetchDailyDialogueStaticFirst\(/, 'renderDailyDialogueCardHtml must use fetchDailyDialogueStaticFirst');
});
