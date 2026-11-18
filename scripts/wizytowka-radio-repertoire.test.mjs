// Repertuar radia na /wizytówka — od 18.11.2026 (✅ L0) strona premium v2 z generatora scripts/wizytowki/buduj.mjs,
// radio w wizytowki/wz.js (CCChatRadio + YouTube). Test zachowuje dawny kontrakt: 11 stacji, zatwierdzone źródła
// playlist z pobierz/catalog.json, kanały natywne przez kanoniczny katalog, wybór bez autoodtwarzania, żadnego „na żywo” dla YouTube.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const html = await readFile('wizytowka/index.html', 'utf8');
const wzJs = await readFile('wizytowki/wz.js', 'utf8');
const catalog = JSON.parse(await readFile('pobierz/catalog.json', 'utf8'));
const data = JSON.parse(html.match(/<script type="application\/json" id="wzData">([\s\S]*?)<\/script>/)[1]);
const stations = data.stations;

test('both wizytowka routes keep the same repertoire and approved CC playlist sources', async () => {
  assert.equal(await readFile('wizytowka.html', 'utf8'), html);
  assert.equal(stations.length, 11);
  assert.equal(stations.filter((s) => s.live).length, 3);
  assert.equal(html.match(/class="station"/g).length, 11, 'każda stacja ma przycisk');
  for (const [index, id] of [[6, 'bcm-playlist'], [2, 'apokalipsa-playlist']]) {
    const source = catalog.find((item) => item.id === id);
    assert.equal(source.status, 'approved');
    assert.equal(source.visibility, 'public');
    assert.equal(new URL(source.external).searchParams.get('list'), stations[index].yt);
  }
});

test('requested native channels resolve through the canonical catalogue and real audio queues', async () => {
  const scope = { window: {} };
  vm.runInNewContext(await readFile('js/cc-radio-catalog.js', 'utf8'), scope);
  const native = stations.filter((s) => s.nativeId);
  assert.equal(native.length, 6);
  assert.deepEqual(Array.from(native, (s) => s.nativeId), ['poland', 'biblia_audio', 'global', 'instrumental_worship', 'biblia_spiewana', 'global_biblia']);
  for (const choice of native) {
    const source = scope.window.CCRadioStations.find((s) => s.id === choice.nativeId);
    assert.ok(source?.streamUrl);
    if (!choice.live) {
      const queue = JSON.parse(await readFile(source.playlistUrl.slice(1), 'utf8'));
      assert.ok(queue.length > 1);
      for (const track of queue) {
        const url = new URL(track.url, 'https://polskieradio.cc/');
        assert.ok(url.protocol === 'https:');
        if (url.hostname === 'polskieradio.cc') assert.ok((await readFile(decodeURIComponent(url.pathname.slice(1)))).length > 0);
      }
    }
  }
  assert.match(html, /cc-radio-catalog\.js/);
  assert.match(html, /cc-chat-radio\.js/);
  assert.doesNotMatch(wzJs, /new Audio/);
});

test('new recordings are selectable without autoplay, load the real playlist, and never claim LIVE', async () => {
  const page = html.replace(/<script\b(?![^>]*application\/json)[\s\S]*?<\/script>/g, '');
  const win = new Window({ url: 'https://polskieradio.cc/wizytowka', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  try {
    win.document.write(page);
    const lists = [];
    let options;
    win.fetch = async () => ({ ok: true, json: async () => ({ success: true, source: 'd1', count: 1 }) });
    win.YT = { Player: function (_id, opts) { options = opts; lists.push(opts.playerVars.list); this.loadPlaylist = (v) => lists.push(v.list); this.pauseVideo = () => {}; } };
    win.eval(wzJs);
    const st = win.document.querySelectorAll('.station');
    assert.equal(lists.length, 0, 'samo wejście na stronę niczego nie odtwarza');
    for (const [iteration, index] of [[0, 6], [1, 2]]) {
      st[index].click();
      assert.equal(st[index].getAttribute('aria-pressed'), 'true');
      assert.equal(win.document.getElementById('deckNow').textContent, stations[index].name);
      assert.equal(lists.length, iteration + 1);
      const want = new URL(catalog.find((s) => s.id === (index === 6 ? 'bcm-playlist' : 'apokalipsa-playlist')).external).searchParams.get('list');
      assert.equal(lists.at(-1), want);
      options.events.onStateChange({ data: 1 });
      assert.match(win.document.getElementById('deckStatus').textContent, /Nagrania YouTube:/);
      assert.doesNotMatch(win.document.getElementById('deckStatus').textContent, /na żywo/i);
    }
  } finally { await win.happyDOM.close(); }
});
