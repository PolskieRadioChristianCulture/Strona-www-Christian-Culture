// GA4: ruch własny (traffic_type) i kluczowe zdarzenia cc-analytics.js — @007, L0 26.10.2026
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { transform, INTERNAL_PARAMS, CONFIG_CALL } from './apply-ga-internal-traffic.mjs';

function internalParams(search, stored = {}, extra = {}) {
  const store = { ...stored };
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
  const ctx = { location: { search }, localStorage, window: { ...extra } };
  // Kopia przez JSON: obiekt z innego kontekstu vm ma inny prototyp
  return { params: JSON.parse(JSON.stringify(vm.runInNewContext(INTERNAL_PARAMS, ctx))), store };
}

test('fragment GA oznacza ruch zespołu, reżyserii i OBS, a widzów nie', () => {
  assert.deepEqual(internalParams('').params, {});
  assert.deepEqual(internalParams('?in_mcr=1').params, { traffic_type: 'internal' });
  assert.deepEqual(internalParams('', {}, { obsstudio: {} }).params, { traffic_type: 'internal' });
  const marked = internalParams('?cc_team=1');
  assert.deepEqual(marked.params, { traffic_type: 'internal' });
  assert.equal(marked.store.cc_team, '1');
  assert.deepEqual(internalParams('', { cc_team: '1' }).params, { traffic_type: 'internal' });
  const unmarked = internalParams('?cc_team=0', { cc_team: '1' });
  assert.deepEqual(unmarked.params, {});
  assert.equal(unmarked.store.cc_team, undefined);
});

test('transform jest powtarzalny i dołącza cc-analytics.js po każdym fragmencie', () => {
  const page = "<script>gtag('js', new Date());\n  gtag('config', 'G-Y4EFTVBPE3');\n</script>\n<p>x</p><script>gtag('config','G-Y4EFTVBPE3');</script>";
  const once = transform(page);
  assert.equal(once.split(CONFIG_CALL).length - 1, 2);
  assert.equal(once.split('/js/cc-analytics.js').length - 1, 2);
  assert.equal(transform(once), once);
  assert.equal(transform('<p>bez GA</p>'), '<p>bez GA</p>');
});

test('wszystkie strony z G-Y4EFTVBPE3 mają nowy fragment (apply --check)', () => {
  execFileSync(process.execPath, ['scripts/apply-ga-internal-traffic.mjs', '--check'], { stdio: 'pipe' });
});

function runAnalytics(pathname, extra = {}) {
  const events = [];
  const listeners = {};
  class HTMLMediaElement { play() { return 'played'; } }
  class HTMLAudioElement extends HTMLMediaElement {}
  const win = {
    gtag: (type, name, params) => events.push({ type, name, params }),
    HTMLMediaElement, HTMLAudioElement
  };
  const ctx = {
    window: win, HTMLMediaElement, HTMLAudioElement, URL, Date,
    location: { pathname, origin: 'https://polskieradio.cc', href: 'https://polskieradio.cc' + pathname },
    navigator: {},
    document: { addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); }, getElementById: () => null },
    ...extra
  };
  vm.runInNewContext(readFileSync('js/cc-analytics.js', 'utf8'), ctx);
  const click = (href, id = '') => {
    const a = { getAttribute: () => href, href, closest: (s) => (s === '[id]' ? (id ? { id } : null) : a) };
    listeners.click.forEach((fn) => fn({ target: { closest: (s) => (s === 'a[href]' ? a : null) } }));
  };
  return { events, ctx, click, HTMLAudioElement, listeners };
}

test('cc-analytics: lekcja, radio (raz na źródło), wsparcie, kontakt', () => {
  const { events, click, HTMLAudioElement } = runAnalytics('/akademia/kurscodzienny/dzien-07');
  assert.deepEqual(events[0].name, 'lesson_view');
  assert.deepEqual({ ...events[0].params, transport_type: undefined }, { course: 'kurscodzienny', lesson: 'dzien-07', transport_type: undefined });

  const radio = new HTMLAudioElement();
  radio.src = 'https://stream.zeno.fm/abc123';
  assert.equal(radio.play(), 'played');
  radio.play();
  const book = new HTMLAudioElement();
  book.src = 'https://polskieradio.cc/audio/rdz-01.mp3';
  book.play();
  assert.deepEqual(events.filter((e) => /_play$/.test(e.name)).map((e) => e.name), ['radio_play', 'audio_play']);

  click('https://patronite.pl/christianculture', 'support');
  click('tel:+48000000000', 'contact-section');
  click('https://www.facebook.com/sharer/sharer.php?u=x');
  click('/news');
  assert.deepEqual(events.slice(-3).map((e) => [e.name, e.params.method || e.params.place]),
    [['donate_click', 'support'], ['contact_click', 'phone'], ['share', 'facebook']]);
});

test('cc-analytics: zwykła strona nie wysyła lesson_view, brak gtag nie psuje strony', () => {
  const { events } = runAnalytics('/news');
  assert.equal(events.length, 0);
  const { ctx } = runAnalytics('/akademia/apokalipsa/lekcja-03');
  delete ctx.window.gtag;
  assert.doesNotThrow(() => ctx.window.ccTrack('login', {}));
});

test('cc-analytics: wyszukiwarka wysyła search po pauzie, bez powtórek i bez danych osobowych', () => {
  const input = { id: 'ccOmniInput', value: '' };
  let pending = null;
  const { events, ctx, listeners } = runAnalytics('/wyszukiwarka', {
    setTimeout: (fn) => { pending = fn; return 1; },
    clearTimeout: () => { pending = null; }
  });
  ctx.document.getElementById = (id) => (id === 'ccOmniInput' ? input : null);
  const type = (v) => { input.value = v; listeners.input.forEach((fn) => fn({ target: input })); };
  const enter = () => listeners.keydown.forEach((fn) => fn({ key: 'Enter', target: input }));
  const searches = () => events.filter((e) => e.name === 'search').map((e) => e.params.search_term);

  type('j'); type('je'); type('jezus');
  assert.equal(searches().length, 0, 'nic przed końcem pauzy');
  pending();
  type('jezus  '); pending(); enter();
  type('a'); pending();
  type('jan@example.com'); pending();
  type('tel 600 123 456'); pending();
  type('Apokalipsa'); enter();
  assert.deepEqual(searches(), ['jezus', 'Apokalipsa']);

  const a = { href: 'https://polskieradio.cc/player?q=x' };
  listeners.click.forEach((fn) => fn({ target: { closest: (s) => (s === '#ccOmniBody a' ? a : null) } }));
  const sel = events.filter((e) => e.name === 'select_content');
  assert.deepEqual(sel.map((e) => [e.params.content_type, e.params.item_id]), [['search_result', '/player']]);
});

test('/wyszukiwarka ma kanoniczny fragment GA i cc-analytics.js', () => {
  for (const f of ['wyszukiwarka/index.html', 'wyszukiwarka.html']) {
    const html = readFileSync(f, 'utf8');
    assert.ok(html.includes(CONFIG_CALL), f);
    assert.ok(html.indexOf('/js/cc-analytics.js') < html.indexOf('/components/cc-omni-search.js'), f);
  }
});

test('404 przekierowuje na adres bezwzględny (koniec pętli w podfolderach)', () => {
  const html = readFileSync('404.html', 'utf8');
  assert.match(html, /window\.location\.href = '\/';/);
  assert.doesNotMatch(html, /location\.href = 'index\.html'/);
});

test('cc-analytics ignoruje puste/przerwane audio_error i odtwarzacze czyszczą src przez removeAttribute', () => {
  const { events, HTMLAudioElement } = runAnalytics('/player');
  const el = new HTMLAudioElement();
  el.listeners = {};
  el.addEventListener = (t, fn) => { (el.listeners[t] = el.listeners[t] || []).push(fn); };
  el.getAttribute = (name) => (name === 'src' ? el._srcAttr || null : null);
  el.querySelector = () => null;
  el.dataset = {};
  el._srcAttr = 'https://stream.zeno.fm/imo45hqnshyuv';
  el.src = 'https://stream.zeno.fm/imo45hqnshyuv';
  el.play();

  // 1) MEDIA_ERR_ABORTED (code 1) -> ignorowany
  el.error = { code: 1 };
  el.listeners.error.forEach(fn => fn());
  assert.equal(events.filter(e => e.name === 'audio_error').length, 0);

  // 2) Wyczyszczone src przez removeAttribute('src') -> ignorowany
  el._srcAttr = null;
  el.error = { code: 4 };
  el.listeners.error.forEach(fn => fn());
  assert.equal(events.filter(e => e.name === 'audio_error').length, 0);

  // 3) Realny błąd przy ustawionym src (np. code 2) -> raportowany
  el._srcAttr = 'https://stream.zeno.fm/imo45hqnshyuv';
  el.error = { code: 2 };
  el.listeners.error.forEach(fn => fn());
  const errs = events.filter(e => e.name === 'audio_error');
  assert.equal(errs.length, 1);
  assert.equal(errs[0].params.error_code, 2);

  const appSrc = readFileSync('app.js', 'utf8');
  const playerHtml = readFileSync('player.html', 'utf8');
  assert.match(appSrc, /audio\.removeAttribute\("src"\)/);
  assert.doesNotMatch(appSrc, /audio\.src\s*=\s*["']["']/);
  assert.match(playerHtml, /nativeAudio\.removeAttribute\('src'\)/);
  assert.doesNotMatch(playerHtml, /nativeAudio\.src\s*=\s*''/);
});
