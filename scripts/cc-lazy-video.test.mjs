// Strażnik (@007, L0 23.11.2026 „Szybkość Tablicy”): wideo pobiera się dopiero przy ekranie.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/cc-lazy-video.js', import.meta.url), 'utf8');

function fixture({ saveData = false, reduced = false, onScreen = true, eco = false } = {}) {
  const observers = [];
  const attrs = { 'data-lazy-src': 'a.mp4?v=1', autoplay: '', preload: 'none' };
  if (eco) { delete attrs.autoplay; attrs['data-lumina-autoplay'] = '1'; }
  const video = {
    tagName: 'VIDEO', paused: true, plays: 0, loads: 0, pauses: 0, listeners: {},
    getAttribute: k => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = String(v); },
    removeAttribute: k => { delete attrs[k]; },
    hasAttribute: k => k in attrs,
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => onScreen ? { width: 100, height: 100, top: 10, bottom: 110, left: 0, right: 100 } : { width: 100, height: 100, top: 2000, bottom: 2100, left: 0, right: 100 },
    load() { this.loads++; }, play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.pauses++; this.paused = true; },
    addEventListener(n, fn) { this.listeners[n] = fn; }
  };
  const doc = { readyState: 'complete', hidden: false, documentElement: {},
    querySelectorAll: () => [video], addEventListener() {} };
  const win = {
    innerHeight: 800, innerWidth: 400,
    matchMedia: () => ({ matches: reduced }),
    IntersectionObserver: class { constructor(fn, opts) { this.fn = fn; this.opts = opts; observers.push(this); } observe() {} unobserve() {} }
  };
  Object.assign(win, { window: win, document: doc, navigator: { connection: { saveData } }, WeakSet });
  vm.runInNewContext(source, win);
  const [loadIo, playIo] = observers;
  return { video, attrs, win,
    near() { loadIo.fn([{ target: video, isIntersecting: true }]); },
    visible(on = true) { playIo.fn([{ target: video, isIntersecting: on, intersectionRatio: on ? 0.8 : 0 }]); } };
}

test('nothing is downloaded before the video approaches the screen', () => {
  const f = fixture();
  assert.equal(f.attrs.src, undefined);
  assert.equal(f.video.loads, 0);
  assert.equal(f.video.plays, 0);
  assert.ok(f.win.ccLazyVideo && typeof f.win.ccLazyVideo.observe === 'function');
});

test('near the screen: src is set, loaded and played when on screen; paused when it leaves', () => {
  const f = fixture();
  f.near();
  assert.equal(f.attrs.src, 'a.mp4?v=1');
  assert.equal(f.attrs['data-lazy-src'], undefined);
  assert.equal(f.video.loads, 1);
  assert.equal(f.video.plays, 1);
  f.visible(false); assert.equal(f.video.pauses, 1);
  f.visible(true); assert.equal(f.video.plays, 2);
});

test('preloaded below the fold does not play until visible', () => {
  const f = fixture({ onScreen: false });
  f.near();
  assert.equal(f.video.loads, 1);
  assert.equal(f.video.plays, 0);
});

test('Save-Data: no download until the user taps', () => {
  const f = fixture({ saveData: true });
  f.near();
  assert.equal(f.attrs.src, undefined);
  f.video.listeners.click({ currentTarget: f.video });
  assert.equal(f.attrs.src, 'a.mp4?v=1');
  assert.equal(f.video.plays, 1);
});

test('reduced motion: media-economy videos stay still, feed videos keep previous behaviour', () => {
  const eco = fixture({ reduced: true, eco: true });
  eco.near(); assert.equal(eco.video.loads, 1); assert.equal(eco.video.plays, 0);
  const feed = fixture({ reduced: true });
  feed.near(); assert.equal(feed.video.plays, 1);
});

test('lazy iframe (live TV embed) gets its src only near the screen', () => {
  const observers = [];
  const attrs = { 'data-lazy-src': 'master-live.html?muted=1' };
  const frame = { tagName: 'IFRAME', getAttribute: k => (k in attrs ? attrs[k] : null), setAttribute: (k, v) => { attrs[k] = v; },
    removeAttribute: k => { delete attrs[k]; }, hasAttribute: k => k in attrs, querySelectorAll: () => [] };
  const win = { innerHeight: 800, innerWidth: 400, matchMedia: () => ({ matches: false }),
    IntersectionObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} unobserve() {} } };
  Object.assign(win, { window: win, navigator: {}, WeakSet,
    document: { readyState: 'complete', hidden: false, documentElement: {}, querySelectorAll: () => [frame], addEventListener() {} } });
  vm.runInNewContext(source, win);
  assert.equal(attrs.src, undefined);
  observers[0].fn([{ target: frame, isIntersecting: true }]);
  assert.equal(attrs.src, 'master-live.html?muted=1');
});

test('Tablica: Donorbox/Stripe loads only when the support window opens; live TV embed is lazy', () => {
  for (const file of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const html = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /<script[^>]*src="https:\/\/donorbox\.org\/widgets\.js"/, file);
    assert.match(html, /window\.__ccDonorboxLoaded/, file);
    assert.match(html, /<iframe data-lazy-src="master-live\.html/, file);
  }
});

test('closed chat window does not render its content, chat images are lazy', () => {
  const chat = fs.readFileSync(new URL('../components/cc-global-chat-button.js', import.meta.url), 'utf8');
  assert.match(chat, /\.cc-chat-drawer-overlay:not\(\.is-open\) \.cc-chat-drawer \{\s*content-visibility: hidden !important;/);
  assert.doesNotMatch(chat, /<img (?![^>]*\bloading=)/);
  // „eager” tylko dla zawsze widocznych: przycisk czatu (FAB) i dymek zaczepki — nigdy w oknie czatu
  const eager = chat.split('\n').filter(l => /loading="eager"/.test(l));
  assert.ok(eager.every(l => /cc-chat-fab-img|cc-chat-teaser-avatar/.test(l)), eager.join('\n'));
});

test('Tablica pages load the module before the avatar script and have no eager video src', () => {
  for (const file of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const html = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const lazyAt = html.indexOf('js/cc-lazy-video.js');
    const avatarAt = html.indexOf('lumina-premium-video-avatar.js');
    assert.ok(lazyAt > 0 && lazyAt < avatarAt, file);
    assert.doesNotMatch(html, /<video[^>]*\ssrc="[^"$]*\.mp4/, file);
  }
});
