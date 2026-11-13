import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { renderLumiDashboard } from './lumi-dashboard.mjs';
import { renderLumiPage } from './lumi-page.mjs';
const source = await readFile('js/lumi-dashboard.js', 'utf8');
const windows = [];
after(async () => { for (const win of windows) await win.happyDOM.close(); });
function fixture(loggedIn = false, commander = false) {
  const win = new Window({ url: 'https://polskieradio.cc/mess', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  windows.push(win); win.document.body.innerHTML = renderLumiDashboard();
  let user = loggedIn ? { uid: commander ? 'cezaryrgowski' : 'fixture-owner', email: commander ? 'nazirczarkes@gmail.com' : 'user@example.com', emailVerified: true } : null;
  const snapshots = [], opens = [], radioStates = [], plays = [], timers = [];
  const people = [
    { id: 'formation-peer', slug: 'formation-peer', name: 'Próba Formacja', desc: 'Studium biblijne', badge: 'Formacja' },
    { id: 'mission-peer', slug: 'mission-peer', name: 'Próba Misja', desc: 'Misja i służba', badge: 'Misja' },
    { id: 'community-peer', slug: 'community-peer', name: 'Próba Społeczność', desc: 'Wspólnota', badge: 'Społeczność' }
  ];
  win.CCGlobalChat = { getMembers: () => people };
  win.isUserCommanderAuthorized = () => Boolean(user && user.email === 'nazirczarkes@gmail.com');
  win.openDirectMessagesModal = preferredTab => { opens.push({ tab: preferredTab, isCommanderModal: true }); };
  win.openFamilyPanel = () => { opens.push({ tab: 'family', isFamilyPanel: true }); };
  win.LuminaDB = {
    getCurrentUser: () => user,
    getFirebaseAuthUser: () => user,
    getCurrentProfile: () => user ? { uid: user.uid, slug: user.uid } : null,
    subscribeToUserChats: (uid, fn) => { const item = { uid, fn, stopped: false }; snapshots.push(item); return () => { item.stopped = true; }; }
  };
  win._luminaUnreadRoomsMap = new Map([['community-peer', 3]]);
  win.CCUnifiedChat = { openCurrent: request => opens.push(request) };
  const stations = ['poland', 'global', 'biblia_audio', 'global_biblia', 'instrumental_worship', 'biblia_spiewana'].map(id => ({ id, name: id }));
  let radio = { stationId: 'poland', playing: false, status: 'Wstrzymano' };
  win.CCChatRadio = {
    stations, prepare: async () => {}, state: () => radio,
    subscribe: fn => { radioStates.push(fn); fn(radio); return () => {}; },
    select: id => { radio = { ...radio, stationId: id }; radioStates.forEach(fn => fn(radio)); },
    pause: () => { radio = { ...radio, playing: false }; radioStates.forEach(fn => fn(radio)); },
    play: () => { plays.push(radio.stationId); radio = { ...radio, playing: true, status: 'Odtwarza' }; radioStates.forEach(fn => fn(radio)); }
  };
  win.CCChatRadioReady = Promise.resolve();
  vm.runInNewContext(source, { window: win, document: win.document, location: win.location, URL, console, setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; } });
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  return { win, people, snapshots, opens, plays, timers, setUser: next => { user = next; win.dispatchEvent(new win.CustomEvent('lumina-auth-state')); } };
}
const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

test('room cards and channels describe their purpose without unverified security promises', () => {
  const f = fixture(true, true);
  const unverified = /szyfrowan|biometryczn|bezpieczn/i;
  const agent = f.win.document.querySelector('[data-commander-card]');
  const family = f.win.document.querySelector('[data-family-card]');
  assert.ok(agent && family);
  assert.doesNotMatch(agent.textContent, unverified);
  assert.doesNotMatch(family.textContent, unverified);
  agent.click();
  family.click();
  assert.equal(f.opens[0].tab, 'commander');
  assert.equal(f.opens[1].tab, 'family');
  f.win.document.querySelector('[data-lumi-category="channels"]').click();
  const channels = f.win.document.getElementById('lumiConversationCards');
  assert.doesNotMatch(channels.textContent, unverified);
  assert.match(channels.textContent, /Pokój Agentów|Planer Omega/);
  assert.doesNotMatch(channels.textContent, /Rogows/);
});

test('delayed commander opening uses the canonical opener once even when it returns undefined', () => {
  const f = fixture(true, true);
  delete f.win.openDirectMessagesModal;
  let opens = 0, switches = 0;
  const publicButton = f.win.document.getElementById('lumiOpen');
  publicButton.disabled = false;
  publicButton.addEventListener('click', () => {
    f.win.openDirectMessagesModal = tab => { assert.equal(tab, 'commander'); opens++; };
    f.win.switchMessengerMainTab = () => { switches++; };
  });
  f.win.document.getElementById('lumiOpenCommander').click();
  const timer = f.timers.find(t => t.delay === 200);
  assert.ok(timer, 'fallback waits for the canonical chat to load');
  timer.callback();
  assert.equal(opens, 1);
  assert.equal(switches, 0, 'opening must not also switch/reinitialise the same room');
});

test('delayed commander opening retains the tab switch when the canonical opener is unavailable', () => {
  const f = fixture(true, true);
  delete f.win.openDirectMessagesModal;
  let switches = 0;
  const publicButton = f.win.document.getElementById('lumiOpen');
  publicButton.disabled = false;
  publicButton.addEventListener('click', () => {
    f.win.switchMessengerMainTab = tab => { assert.equal(tab, 'commander'); switches++; };
  });
  f.win.document.getElementById('lumiOpenCommander').click();
  f.timers.find(t => t.delay === 200).callback();
  assert.equal(switches, 1);
});

test('reference dashboard is rendered by the canonical /mess generator, preserving native chat and installation', async () => {
  const output = renderLumiPage(await readFile('lumina.html', 'utf8'));
  assert.match(output, /lumi-messenger-design\.css\?v=/);
  assert.match(output, /lumi-dashboard\.js\?v=/);
  for (const id of ['directMessagesModal', 'activeChatInput', 'lumiLanding', 'lumiOpen', 'lumiInstallHelp', 'lumiRadioPlay', 'lumiConversationCards']) assert.ok(output.includes(`id="${id}"`), id);
  assert.doesNotMatch(output, /247 osób|12:18 · Dziękuję|data-status="online"/);
});

test('search and category filters operate on actual supplied records rather than reference screenshot text', () => {
  const { win } = fixture();
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 3);
  win.document.querySelector('[data-lumi-category="formation"]').click();
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 1);
  assert.match(win.document.getElementById('lumiConversationCards').textContent, /Próba Formacja/);
  win.document.querySelector('[data-lumi-category="all"]').click();
  const input = win.document.getElementById('lumiDirectorySearch'); input.value = 'Misja'; input.dispatchEvent(new win.Event('input'));
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 1);
  assert.match(win.document.getElementById('lumiConversationCards').textContent, /Próba Misja/);
});

test('private preview and unread badge require an authenticated own-room snapshot; logout clears both', () => {
  const f = fixture(true);
  f.snapshots[0].fn([{ id: 'fixture-room', participants: ['fixture-owner', 'community-peer'], users: ['fixture-owner', 'community-peer'], lastSenderId: 'community-peer', lastMessageText: 'PRYWATNY TEKST TESTOWY', lastMessageTimestamp: 1234567890000 }]);
  assert.match(f.win.document.getElementById('lumiConversationCards').textContent, /PRYWATNY TEKST TESTOWY/);
  assert.equal(f.win.document.querySelector('.lumi-card-unread').textContent, '3');
  f.setUser(null);
  assert.ok(f.snapshots[0].stopped);
  assert.doesNotMatch(f.win.document.getElementById('lumiConversationCards').textContent, /PRYWATNY TEKST TESTOWY/);
  assert.equal(f.win.document.querySelector('.lumi-card-unread'), null);
  assert.ok(f.win.document.getElementById('lumiNotificationCount').hidden);
});

test('snapshot arriving after account switch cannot populate another account dashboard', () => {
  const f = fixture(true); const stale = f.snapshots[0].fn;
  f.setUser({ uid: 'fixture-second-owner' });
  stale([{ id: 'old-room', users: ['fixture-owner', 'community-peer'], lastSenderId: 'community-peer', lastMessageText: 'STARY PRYWATNY TEKST' }]);
  assert.doesNotMatch(f.win.document.getElementById('lumiConversationCards').textContent, /STARY PRYWATNY/);
  assert.equal(f.snapshots[1].uid, 'fixture-second-owner');
});

test('untrusted profile and message fields stay text; card opens the real selected peer in canonical chat', () => {
  const f = fixture(true);
  f.people[2].name = '<img src=x onerror=alert(1)>';
  f.win.LumiDashboard.render();
  assert.equal(f.win.document.querySelector('[onerror]'), null);
  const cards = f.win.document.querySelectorAll('.lumi-conversation-card'); cards[2].click();
  assert.equal(f.opens[0].partner, 'community-peer');
  assert.equal(f.opens[0].tab, 'private');
});

test('header exposes the six existing stations and controls the same player truthfully', async () => {
  const f = fixture(); await settle();
  const select = f.win.document.getElementById('lumiRadioSelect');
  assert.equal(select.options.length, 6);
  assert.equal(f.win.document.getElementById('lumiRadioPlay').disabled, false);
  select.value = 'biblia_spiewana'; select.dispatchEvent(new f.win.Event('change')); await settle();
  f.win.document.getElementById('lumiRadioPlay').click();
  assert.deepEqual(f.plays, ['biblia_spiewana']);
  assert.equal(f.win.document.querySelector('#lumiRadioPlay .lumi-play-orb').textContent, '■');
  assert.equal(f.win.document.getElementById('lumiRadioPlay').getAttribute('aria-label'), 'Zatrzymaj radio');
  f.win.document.getElementById('lumiRadioPlay').click();
  assert.equal(f.win.document.getElementById('lumiRadioPlay').getAttribute('aria-label'), 'Włącz radio');
});

test('canonical standalone guest chat is visibly open rather than hidden by the page shell', async () => {
  const win = new Window({ url: 'https://polskieradio.cc/mess', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  windows.push(win); win.document.body.className = 'lumi-standalone user-is-guest';
  win.document.body.innerHTML = '<div id="directMessagesModal"></div><div id="chatSettingsModal"></div>';
  const style = win.document.createElement('style'); style.textContent = await readFile('css/lumi-standalone.css', 'utf8'); win.document.head.appendChild(style);
  const context = { window: win, document: win.document, location: win.location, localStorage: win.localStorage, URLSearchParams, console, setTimeout: () => 0, clearTimeout: () => {} };
  win.CCRadioStations = []; win.CCRadioMilion = true; win.CCChatRadio = { stations: [], prepare: async () => {}, subscribe: () => () => {} };
  vm.runInNewContext(await readFile('components/cc-global-chat-button.js', 'utf8'), context);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  vm.runInNewContext(await readFile('js/cc-chat-integration.js', 'utf8'), context);
  win.CCGlobalChat.open('live');
  const overlay = win.document.getElementById('ccGlobalChatOverlay');
  assert.equal(win.getComputedStyle(overlay).display, 'flex');
  assert.equal(win.getComputedStyle(overlay).visibility, 'visible');
});

test('avatar circle geometry and footer line alignment are strictly enforced in CSS', async () => {
  const css = await readFile('css/lumi-messenger-design.css', 'utf8');
  assert.match(css, /\.lumi-icon-button\{[^}]*flex-shrink:0[^}]*aspect-ratio:1\/1[^}]*border-radius:50%/);
  assert.match(css, /\.lumi-account img\{[^}]*aspect-ratio:1\/1[^}]*object-fit:cover[^}]*border-radius:50%/);
  assert.match(css, /\.lumi-conversation-card>img\{[^}]*flex-shrink:0[^}]*aspect-ratio:1\/1[^}]*border-radius:50%/);
  assert.match(css, /\.lumi-dashboard-footer a,\.lumi-dashboard-footer button\{[^}]*min-height:44px[^}]*display:inline-flex[^}]*align-items:center/);
});

test('new conversation button uses feather quill icon and radio dropdown uses elegant svg chevron', async () => {
  const markup = renderLumiDashboard();
  // Feather quill pen icon in new conversation button and separated words
  assert.match(markup, /id="lumiNewConversation"[^>]*aria-label="Nowa rozmowa"/);
  assert.match(markup, /M20\.24 12\.24a6 6 0 0 0-8\.49-8\.49L5 10\.5V19h8\.5z/);
  assert.match(markup, /<span>Nowa rozmowa<\/span>/);
  assert.doesNotMatch(markup, /Nowarozmowa|Nowa<br>rozmowa/);
  // Radio dropdown uses SVG chevronDown and never raw unicode caret character
  assert.match(markup, /id="lumiRadioMenu"[^>]*><svg[^>]*><path d="m6 9 6 6 6-6"/);
  assert.doesNotMatch(markup, /id="lumiRadioMenu"[^>]*>⌄/);

  const css = await readFile('css/lumi-messenger-design.css', 'utf8');
  // Desktop button label whitespace
  assert.match(css, /\.lumi-new-conversation span\{white-space:nowrap\}/);
  // Dropdown rotation and styling
  assert.match(css, /\.lumi-radio-pill button:last-child\[aria-expanded=true\] svg\{transform:rotate\(180deg\)\}/);
  // Mobile clean circular FAB without overflowing text
  assert.match(css, /\.lumi-new-conversation\{[^}]*width:58px;height:58px;min-width:58px;min-height:58px;border-radius:50%[^}]*\}/);
  assert.match(css, /\.lumi-new-conversation span\{display:none!important\}/);
  // Search input has no rectangular outline and delegates focus styling to rounded pill container
  assert.doesNotMatch(css, /\.lumi-dashboard input:focus-visible/);
  assert.match(css, /\.lumi-search-field:focus-within\{border-color:#f2a3ff/);
  assert.match(css, /\.lumi-search-field input:focus,\.lumi-search-field input:focus-visible\{outline:none!important;box-shadow:none!important\}/);
  // Radio select removes the native right-side arrow completely
  assert.match(css, /\.lumi-radio-panel select\{appearance:none;-webkit-appearance:none;-moz-appearance:none/);
  assert.match(css, /\.cc-chat-radio select\{[^}]*appearance:none!important/);
});

test('Commander Nazir sees VIP Agent Room card, #1 channel entry, and quick-launch button leading to canonical room', () => {
  // 1. Regular user fixture
  const regular = fixture(true, false);
  assert.equal(regular.win.document.querySelector('[data-commander-card]'), null);
  assert.ok(regular.win.document.getElementById('lumiOpenCommander').hidden);
  regular.win.document.querySelector('[data-lumi-category="channels"]').click();
  assert.doesNotMatch(regular.win.document.getElementById('lumiConversationCards').textContent, /Pokój Agentów/);

  // 2. Commander fixture
  const cmd = fixture(true, true);
  const card = cmd.win.document.querySelector('[data-commander-card]');
  assert.ok(card, 'VIP Commander card must be present');
  assert.match(card.textContent, /Pokój Agentów CC/);
  assert.match(card.textContent, /VIP L0/);
  assert.match(card.textContent, /Dyspozycje i odpowiedzi agentów CC/);

  // Quick-launch heading button
  const quickBtn = cmd.win.document.getElementById('lumiOpenCommander');
  assert.equal(quickBtn.hidden, false);
  quickBtn.click();
  assert.equal(cmd.opens[0].tab, 'commander');

  // Card click opens commander modal
  cmd.opens.length = 0;
  card.click();
  assert.equal(cmd.opens[0].tab, 'commander');

  // Channels view has commander room as #1 channel
  cmd.win.document.querySelector('[data-lumi-category="channels"]').click();
  const firstChannel = cmd.win.document.querySelector('.lumi-channel-card');
  assert.ok(firstChannel);
  assert.match(firstChannel.textContent, /Pokój Agentów & Planer Omega/);
  cmd.opens.length = 0;
  firstChannel.click();
  assert.equal(cmd.opens[0].tab, 'commander');
});





test('family room entries use generic private labels', () => {
  // 1. Regular non-Rogowscy user
  const regular = fixture(true, false);
  assert.equal(regular.win.document.querySelector('[data-family-card]'), null);
  assert.ok(regular.win.document.getElementById('lumiOpenFamily').hidden);
  regular.win.document.querySelector('[data-lumi-category="channels"]').click();
  assert.doesNotMatch(regular.win.document.getElementById('lumiConversationCards').textContent, /Rogowscy/);

  // 2. Rogowscy / Commander user
  const cmd = fixture(true, true);
  const card = cmd.win.document.querySelector('[data-family-card]');
  assert.ok(card, 'Family room card must be present');
  assert.match(card.textContent, /Pokój rodzinny/);
  assert.doesNotMatch(card.textContent, /Rogows/);

  // Quick-launch heading button
  const quickBtn = cmd.win.document.getElementById('lumiOpenFamily');
  assert.equal(quickBtn.hidden, false);
  assert.doesNotMatch(quickBtn.textContent, /Rogows/);
  quickBtn.click();
  assert.equal(cmd.opens[0].tab, 'family');

  // Card click opens family panel
  cmd.opens.length = 0;
  card.click();
  assert.equal(cmd.opens[0].tab, 'family');

  // Channels view includes Rogowscy family room
  cmd.win.document.querySelector('[data-lumi-category="channels"]').click();
  const familyChannel = [...cmd.win.document.querySelectorAll('.lumi-channel-card')].find(c => c.textContent.includes('Pokój rodzinny'));
  assert.ok(familyChannel, 'Family channel must exist');
  assert.match(familyChannel.textContent, /Pokój rodzinny/);
  cmd.opens.length = 0;
  familyChannel.click();
  assert.equal(cmd.opens[0].tab, 'family');
});
