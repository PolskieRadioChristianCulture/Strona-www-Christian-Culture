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

test('Tablica pages load the module before the avatar script and have no eager video src', () => {
  for (const file of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const html = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const lazyAt = html.indexOf('js/cc-lazy-video.js');
    const avatarAt = html.indexOf('lumina-premium-video-avatar.js');
    assert.ok(lazyAt > 0 && lazyAt < avatarAt, file);
    assert.doesNotMatch(html, /<video[^>]*\ssrc="[^"$]*\.mp4/, file);
  }
});
