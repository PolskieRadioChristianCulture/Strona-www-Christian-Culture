import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const files = ['js/cc-radio-catalog.js', 'js/cc-chat-radio.js', 'js/cc-chat-integration.js', 'js/cc-radio-milion.js', 'components/cc-global-chat-button.js'];
const sources = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(file, 'utf8')])));
const windows = [];
after(async () => { for (const window of windows) await window.happyDOM.close(); });
function fixture(path = '/mess') {
  const win = new Window({ url: `https://polskieradio.cc${path}`, settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  windows.push(win);
  const context = vm.createContext({ window: win, document: win.document, location: win.location, localStorage: win.localStorage,
    navigator: win.navigator, HTMLMediaElement: win.HTMLMediaElement, Blob: win.Blob, URLSearchParams, Event: win.Event,
    console, setTimeout: () => 0, clearTimeout: () => {}, fetch: (...args) => win.fetch(...args) });
  const run = file => vm.runInContext(sources[file], context);
  return { win, run };
}
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('one catalogue supplies all seven home stations, with real playlist URLs', async () => {
  const { win, run } = fixture(); run(files[0]);
  assert.deepEqual(Array.from(win.CCRadioStations, s => s.id), ['poland', 'global', 'biblia_audio', 'global_biblia', 'instrumental_worship', 'biblia_spiewana', 'radio_cc_women']);
  for (const station of win.CCRadioStations) if (station.playlistUrl) {
    const playlist = JSON.parse(await readFile(station.playlistUrl.slice(1), 'utf8'));
    assert.ok(playlist.length); assert.ok(playlist.every(track => typeof track.url === 'string'));
  }
  assert.match(await readFile('app.js', 'utf8'), /import '\.\/js\/cc-radio-catalog\.js'/);
});

test('all website chat entrypoints host one persistent /mess frame and preserve room targets', () => {
  const { win, run } = fixture('/lumina');
  // Modules are available without network in this fixture.
  run(files[0]); win.CCRadioMilion = true; run(files[1]); run(files[2]);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  win.openDirectMessagesModal('private');
  const frame = win.document.getElementById('ccUnifiedChatFrame');
  assert.equal(frame.getAttribute('src'), '/mess?embed=1');
  assert.equal(frame.getAttribute('allow'), null);
  const requests = [];
  Object.defineProperty(frame, 'contentWindow', { value: {
    location: { origin: win.location.origin }, CCUnifiedChat: { openCurrent: request => requests.push(request) }
  } });
  win.openChatWith('Synthetic peer', '/test.jpg', 'fixture-peer', 'fixture-message');
  assert.equal(requests.at(-1).partner, 'fixture-peer');
  assert.equal(requests.at(-1).messageId, 'fixture-message');
  win.CCUnifiedChat.close();
  assert.equal(win.document.getElementById('ccUnifiedChatHost').hidden, true);
  win.CCUnifiedChat.open();
  assert.equal(win.document.getElementById('ccUnifiedChatFrame'), frame);
  assert.equal(win.document.querySelectorAll('#ccUnifiedChatFrame').length, 1);
});

test('global chat API routes non-LUMINA pages to the same canonical document', async () => {
  const { win, run } = fixture('/news');
  run(files[0]); win.CCRadioMilion = true; run(files[1]); run(files[2]); run(files[4]);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  win.CCGlobalChat.open('live', 'wiolettarogowska'); await settle();
  assert.equal(win.document.getElementById('ccUnifiedChatFrame').getAttribute('src'), '/mess?embed=1');
  assert.equal(win.document.getElementById('ccGlobalChatOverlay').getAttribute('aria-hidden'), 'true');
});

test('radio controls mount for both guest and native chat, and changing stations keeps the new choice', async () => {
  const { win, run } = fixture();
  win.document.body.innerHTML = '<div id="ccGlobalChatOverlay"><div class="cc-chat-drawer"></div></div><div id="directMessagesModal"><div class="modal-card"></div></div>';
  win.fetch = async () => ({ ok: true, json: async () => [{ url: './audio/test.mp3', duration: 240 }] });
  run(files[0]); win.CCRadioMilion = true; run(files[1]); run(files[2]);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded')); await settle();
  assert.equal(win.document.querySelectorAll('.cc-chat-radio').length, 2);
  const select = win.document.querySelector('.cc-chat-radio select');
  assert.equal(select.options.length, 7);
  select.value = 'biblia_spiewana'; select.dispatchEvent(new win.Event('change')); await settle();
  assert.equal(win.CCChatRadio.state().stationId, 'biblia_spiewana');
  assert.equal(select.value, 'biblia_spiewana');
  assert.equal(win.document.querySelector('.cc-chat-radio button').disabled, false);
});

test('mini radio player mounts on the upper chat header bar between brand and actions, and settings modal contains Otwórz osobno', async () => {
  const { win, run } = fixture();
  win.document.body.innerHTML = `
    <div id="directMessagesModal">
      <div class="modal-card">
        <div class="chat-header-bar">
          <div>
            <div class="brand">LUMI Messenger</div>
            <div class="chat-header-actions"><button id="btnChatSettingsModal">Settings</button></div>
          </div>
        </div>
      </div>
    </div>
    <div id="chatSettingsModal" class="modal-overlay">
      <div class="modal-card">
        <a href="/mess" target="_blank">Otwórz osobno</a>
      </div>
    </div>
  `;
  win.fetch = async () => ({ ok: true, json: async () => [{ url: './audio/test.mp3', duration: 240 }] });
  run(files[0]); win.CCRadioMilion = true; run(files[1]); run(files[2]);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded')); await settle();
  const header = win.document.querySelector('.chat-header-bar');
  const radio = header.querySelector('.cc-chat-radio');
  assert.ok(radio, 'Radio must be mounted inside chat header bar');
  assert.equal(radio.nextElementSibling.className, 'chat-header-actions', 'Radio must sit right before chat header actions');
  assert.equal(radio.querySelector('select').options.length, 7);
  assert.equal(radio.querySelector('button').textContent, 'Słuchaj');
  const settingsLink = win.document.querySelector('#chatSettingsModal a[href="/mess"]');
  assert.ok(settingsLink, 'chatSettingsModal must contain Otwórz osobno link to /mess');
});

test('home radio integration uses the existing audio engine without creating another element', async () => {
  const { win, run } = fixture('/'); const played = [];
  win.CCHomeRadio = { select: id => played.push(id), pause: () => played.push('pause'), state: () => ({ stationId: 'global', playing: true, status: 'Odtwarza' }) };
  run(files[0]); run(files[1]);
  win.CCChatRadio.select('global'); await win.CCChatRadio.play();
  assert.deepEqual(played, ['global']);
  assert.equal(win.document.querySelectorAll('audio').length, 0);
  assert.equal(win.CCChatRadio.state().stationId, 'global');
});

test('six-station playback uses synchronized playlist position and truthful state on failure', async () => {
  const { win, run } = fixture();
  win.fetch = async () => ({ ok: true, json: async () => [{ url: './audio/one.mp3', duration: 240 }, { url: './audio/two.mp3', duration: 240 }] });
  let fail = false;
  win.HTMLMediaElement.prototype.play = function () {
    if (fail) return Promise.reject(new Error('unavailable'));
    this.dispatchEvent(new win.Event('playing')); return Promise.resolve();
  };
  run(files[0]); run(files[1]);
  for (const station of win.CCRadioStations) {
    await win.CCChatRadio.prepare(station.id); win.CCChatRadio.select(station.id); await win.CCChatRadio.play();
    assert.equal(win.CCChatRadio.state().playing, true);
    assert.equal(win.document.querySelectorAll('#ccChatRadioAudio').length, 1);
    assert.ok(win.document.querySelector('audio').src.startsWith('https://'));
  }
  fail = true; await win.CCChatRadio.play();
  assert.equal(win.CCChatRadio.state().playing, false);
  assert.match(win.CCChatRadio.state().status, /Nie udało/);
});

test('all six stations qualify for /milion including MP3; pause, duplicate events and unrelated media add nothing', async () => {
  const { win, run } = fixture(); const reports = [];
  win.navigator.sendBeacon = (url, body) => { reports.push({ url, body }); return true; };
  win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  run(files[3]);
  const unrelated = win.document.createElement('audio'); unrelated.src = 'https://example.com/music.mp3';
  win.document.body.appendChild(unrelated); await unrelated.play(); await settle();
  assert.equal(reports.length, 0);
  const radio = win.document.createElement('audio'); radio.src = 'https://ebible.org/eng-web/mp3/01_01_Matthew.mp3';
  radio.setAttribute('data-cc-radio', 'true'); win.document.body.appendChild(radio);
  await radio.play(); await settle();
  radio.dispatchEvent(new win.Event('play')); radio.dispatchEvent(new win.Event('pause'));
  assert.equal(reports.length, 0, 'an attempted play does not prove audio started');
  radio.dispatchEvent(new win.Event('playing'));
  await radio.play(); await settle();
  assert.equal(reports.length, 1);
  assert.equal(reports[0].url, '/api/milion/count');
  assert.equal(await reports[0].body.text(), '{"type":"radio"}');
});

test('embedded canonical chat does not auto-resume legacy players or play promotional video', async () => {
  const { win } = fixture('/mess?embed=1');
  const context = { window: win, document: win.document, location: win.location, URLSearchParams };
  vm.runInNewContext(await readFile('lumina-radio.js', 'utf8'), context);
  vm.runInNewContext(await readFile('js/lumina-mini-player.js', 'utf8'), context);
  assert.equal(win.LuminaRadio, undefined); assert.equal(win.LuminaMiniPlayer, undefined);
  assert.match(await readFile('js/lumi-standalone.js', 'utf8'), /get\('embed'\) === '1'/);
});

test('/milion keeps its own play-button count while the chat radio still reports', async () => {
  const { win, run } = fixture('/milion'); const reports = [];
  win.navigator.sendBeacon = url => { reports.push(url); return true; };
  win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  run(files[3]);
  const pageRadio = win.document.createElement('audio'); pageRadio.src = 'https://stream.zeno.fm/vz96pvl3pnktv';
  win.document.body.appendChild(pageRadio); await pageRadio.play(); await settle();
  assert.equal(reports.length, 0);
  const chatRadio = win.document.createElement('audio'); chatRadio.src = 'https://stream.zeno.fm/vz96pvl3pnktv';
  chatRadio.setAttribute('data-cc-radio', 'true'); win.document.body.appendChild(chatRadio);
  await chatRadio.play(); await settle();
  assert.equal(reports.length, 0);
  chatRadio.dispatchEvent(new win.Event('playing'));
  assert.equal(reports.length, 1);
});

test('detached radio counts only after playing; rejected starts do not count', async () => {
  const {win, run} = fixture('/player'); const reports = [];
  win.navigator.sendBeacon = url => { reports.push(url); return true; };
  win.HTMLMediaElement.prototype.play = function () { return Promise.reject(new Error('unavailable')); };
  run(files[3]);
  const radio = new win.Audio('https://stream.zeno.fm/test');
  await assert.rejects(radio.play());
  radio.dispatchEvent(new win.Event('play'));
  assert.equal(reports.length, 0);
  radio.dispatchEvent(new win.Event('playing'));
  radio.dispatchEvent(new win.Event('playing'));
  assert.equal(reports.length, 1);
});
