import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';
const source = fs.readFileSync(new URL('../js/cc-mobile-video-loading.js', import.meta.url), 'utf8');
for (const file of ['lumina-tablica.html','lumina-tablica-light.html']) {
  const html=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const start=html.indexOf('(function initVodAdPlayback() {');
  const end=html.indexOf('</script>',start);
  const fallback=html.slice(start,end);
  test(file+': VOD poster and unavailable-playback fallback never request the heavy GIF',()=>{
    assert.ok(start>=0 && end>start);
    assert.doesNotMatch(html,/vod_hity_kina\.gif/);
    assert.match(html,/<video id="vod-ad-video"[^>]*poster="vod_hity_kina_poster\.jpg"/);
    // @007 23.11.2026: plik ładuje js/cc-lazy-video.js dopiero przy przewinięciu (data-lazy-src)
    assert.match(html,/<source (?:data-lazy-)?src="vod_hity_kina\.mp4(?:\?v=\d+)?" type="video\/mp4">/);
    assert.ok(fs.statSync(new URL('../vod_hity_kina_poster.jpg',import.meta.url)).size < fs.statSync(new URL('../vod_hity_kina.gif',import.meta.url)).size * .05);
  });
  test(file+': rejected playback uses one cover and successful playback keeps the original player',async()=>{
    for(const rejected of [true,false]) {
      const win=new Window({url:'http://localhost/'});
      win.document.body.innerHTML='<div><video id="vod-ad-video" class="card-916-img" style="width:100%"></video></div>';
      const video=win.document.querySelector('video'),timers=[];
      Object.defineProperty(win.document,'readyState',{value:'complete'});
      Object.defineProperty(video,'paused',{get:()=>rejected});
      video.play=()=>rejected?Promise.reject(Error('synthetic autoplay denied')):Promise.resolve();
      vm.runInNewContext(fallback,{window:win,document:win.document,setTimeout:fn=>timers.push(fn)});
      await Promise.resolve();await Promise.resolve();
      timers.forEach(fn=>fn());
      if(rejected) {
        const img=win.document.querySelector('img');assert.ok(img);
        assert.equal(img.getAttribute('src'),'vod_hity_kina_poster.jpg');assert.equal(img.className,'card-916-img');
        assert.equal(win.document.querySelectorAll('img').length,1);assert.match(img.alt,/VOD/);
      } else {assert.equal(win.document.querySelector('video'),video);assert.equal(win.document.querySelector('img'),null);}
    }
  });
}
function fixture(options = {}) {
  let callback; const events = {}; const watched = [];
  const video = { muted: true, controls: false, paused: true, isConnected: true, preload: 'none', plays: 0, pauses: 0,
    hasAttribute: key => key === 'preload' || key === 'muted',
    closest: () => options.mission ? { classList: { contains: () => options.active !== false } } : null,
    play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.pauses++; this.paused = true; }
  };
  const connection = { saveData: false, effectiveType: '4g', ...options.connection,
    addEventListener(name, fn) { events['connection:' + name] = fn; } };
  const motion = { matches: !!options.reduced, addEventListener(name, fn) { events['motion:' + name] = fn; } };
  const doc = { readyState: 'complete', hidden: false,
    querySelectorAll: () => [video], addEventListener(name, fn) { events['document:' + name] = fn; } };
  const win = { matchMedia: () => motion,
    IntersectionObserver: class { constructor(fn) { callback = fn; } observe(v) { watched.push(v); } unobserve() {} },
    addEventListener(name, fn) { events['window:' + name] = fn; } };
  const nav = { connection, onLine: true };
  vm.runInNewContext(source, { window: win, document: doc, navigator: nav });
  return { video, doc, win, nav, events, watched, connection, motion,
    intersect(visible = true) { callback([{ target: video, isIntersecting: visible, intersectionRatio: visible ? 0.8 : 0 }]); } };
}
test('registration never promotes preload=none or starts an off-screen video', () => {
  const f = fixture();
  assert.equal(f.video.preload, 'none'); assert.equal(f.video.plays, 0);
  f.win._registerVisibleVideos(); assert.equal(f.watched.length, 1);
  f.intersect(false); assert.equal(f.video.plays, 0);
});
test('visible video starts, pauses off-screen and resumes when visible', () => {
  const f = fixture(); f.intersect(); assert.equal(f.video.plays, 1);
  f.intersect(false); assert.equal(f.video.pauses, 1);
  f.intersect(); assert.equal(f.video.plays, 2);
});
test('hidden app pauses automatic videos and visible app can resume', () => {
  const f = fixture(); f.intersect(); f.doc.hidden = true;
  f.events['document:visibilitychange'](); assert.equal(f.video.pauses, 1);
  f.doc.hidden = false; f.events['document:visibilitychange'](); assert.equal(f.video.plays, 2);
  f.events['window:pagehide'](); assert.equal(f.video.pauses, 2);
});
test('data saver, slow connections, offline and reduced motion suppress automatic loads', () => {
  for (const options of [{ connection: { saveData: true } }, ...['slow-2g', '2g', '3g'].map(effectiveType => ({ connection: { effectiveType } })), { reduced: true }]) {
    const f = fixture(options); f.intersect(); assert.equal(f.video.plays, 0);
  }
  const f = fixture(); f.nav.onLine = false; f.intersect(); assert.equal(f.video.plays, 0);
});
test('connection changes pause playback without reload/retry loops', () => {
  const f = fixture(); f.intersect(); f.connection.saveData = true;
  f.events['connection:change'](); assert.equal(f.video.pauses, 1);
  f.win._registerVisibleVideos(); assert.equal(f.video.plays, 1);
});
test('only the active center carousel card may auto-play', () => {
  const f = fixture({ mission: true, active: false }); f.intersect(); assert.equal(f.video.plays, 0);
});
test('manual player and user-enabled audio are never taken over', () => {
  const f = fixture(); f.video.controls = true; f.intersect(); assert.equal(f.video.plays, 0);
  const a = fixture(); a.intersect(); a.video.muted = false;
  a.video.hasAttribute = key => key === 'preload'; a.doc.hidden = true;
  a.events['document:visibilitychange'](); assert.equal(a.video.pauses, 0);
});
test('LUMINA has one deferred loader and no eager all-promo load/play loop', () => {
  const html = fs.readFileSync(new URL('../lumina.html', import.meta.url), 'utf8');
  assert.equal(html.split('/js/cc-mobile-video-loading.js?v=20261009_mobileload1').length - 1, 1);
  assert.doesNotMatch(html, /v\.preload\s*=\s*'metadata'|Preload all promo videos|v\.load\(\)/);
  assert.doesNotMatch(html, /<video[^>]*\bautoplay\b/);
  assert.ok(JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts['test:cc-regression'].includes('scripts/mobile-video-loading.test.mjs'));
  assert.doesNotMatch(source, /localStorage|fetch\(|firebase|setInterval|setTimeout/);
});
