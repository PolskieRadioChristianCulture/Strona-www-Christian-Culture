import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { applyPageStandard, BACK_TO_TOP_SCRIPT } from './cc-page-standard.mjs';
const source = fs.readFileSync(new URL('../js/cc-back-to-top.js', import.meta.url), 'utf8');
const html = '<html><body><main>CC</main></body></html>';
test('public routes including nested lessons receive one root-relative deferred module', () => {
  for (const file of ['index.html', 'holos.html', 'lumina.html', 'akademia/kurscodzienny/dzien-08.html']) {
    const result = applyPageStandard(file, html);
    assert.ok(result.includes(`defer src="${BACK_TO_TOP_SCRIPT}"`));
    assert.equal(applyPageStandard(file, result), result);
  }
});
test('frozen broadcast and operational screens stay byte-for-byte unchanged', () => {
  for (const file of ['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html', 'cctv24.html', 'snadaniowa-live.html', 'zapolske-live.html', 'nested/obs.html', 'admin.html', 'embed.html', 'pilot.html']) assert.equal(applyPageStandard(file, html), html);
});
test('fragments, redirect documents and non-HTML files are untouched', () => {
  assert.equal(applyPageStandard('part.html', '<div>CC</div>'), '<div>CC</div>');
  const redirect = html.replace('<html>', '<html><meta http-equiv="refresh" content="0;url=/">');
  assert.equal(applyPageStandard('old.html', redirect), redirect);
  assert.equal(applyPageStandard('file.js', html), html);
});
test('HOLOS and the clean release builder use the shared standard; regression is mandatory', () => {
  const holos = fs.readFileSync(new URL('../holos.html', import.meta.url), 'utf8');
  assert.equal(applyPageStandard('holos.html', holos).split(BACK_TO_TOP_SCRIPT).length - 1, 1);
  const builder = fs.readFileSync(new URL('./build-pages-release.mjs', import.meta.url), 'utf8');
  assert.match(builder, /applyPageStandard\(relativePath, original\)/);
  assert.match(builder, /standardized === original\) fs\.copyFileSync/);
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts['test:cc-regression'].includes('scripts/cc-back-to-top.test.mjs'));
  assert.doesNotMatch(source, /fetch\(|localStorage|firebase|XMLHttpRequest/);
});
function setup({ width = 390, existing = false, reduced = false, obstacle = false, modal = false } = {}) {
  const listeners = {};
  const children = [];
  function element() {
    return { attrs: {}, css: {}, contains: () => false, setAttribute(k, v) { this.attrs[k] = v; },
      style: { setProperty(k, v) { this.owner.css[k] = v; } },
      addEventListener(name, fn, capture) { listeners['button:' + name] = { fn, capture }; } };
  }
  let button = existing ? element() : null;
  if (button) button.style.owner = button;
  const block = { getBoundingClientRect: () => ({ top: 720, bottom: 800, width: 390, height: 80 }) };
  const doc = {
    readyState: 'complete', documentElement: { scrollTop: 0 },
    body: { appendChild(e) { children.push(e); button = e; } }, head: { appendChild() {} },
    createElement() { const e = element(); e.style.owner = e; return e; },
    getElementById: () => button,
    querySelectorAll: () => modal ? [block] : [],
    elementsFromPoint: (x, y) => obstacle && y >= 720 ? [block] : [],
    addEventListener(name, fn) { listeners['document:' + name] = fn; }
  };
  const scrolls = [];
  const win = { innerWidth: width, innerHeight: 800, scrollY: 0,
    matchMedia: () => ({ matches: reduced }), scrollTo: options => scrolls.push(options),
    getComputedStyle: () => ({ position: 'fixed', display: 'block', visibility: 'visible' }),
    requestAnimationFrame(fn) { fn(); },
    addEventListener(name, fn) { listeners['window:' + name] = fn; }
  };
  const context = vm.createContext({ window: win, document: doc });
  vm.runInContext(source, context);
  return { win, doc, button, children, scrolls, listeners, context };
}
test('320/390/1280: hidden initially, shown after scrolling, hidden again at top', () => {
  for (const width of [320, 390, 1280]) {
    const s = setup({ width });
    assert.equal(s.button.css.display, 'none');
    s.win.scrollY = 400; s.listeners['window:scroll']();
    assert.equal(s.button.css.display, 'flex');
    assert.equal(s.button.attrs['aria-label'], 'Przewiń na górę');
    s.win.scrollY = 0; s.listeners['window:scroll']();
    assert.equal(s.button.css.display, 'none');
  }
});
test('legacy button is reused and repeated module execution does not duplicate listeners/buttons', () => {
  const s = setup({ existing: true });
  assert.equal(s.children.length, 0);
  vm.runInContext(source, s.context);
  assert.equal(s.children.length, 0);
  assert.equal(s.listeners['button:click'].capture, true);
});
test('click scrolls the page and respects reduced motion without invoking legacy handlers', () => {
  for (const reduced of [false, true]) {
    const s = setup({ reduced }); let prevented = 0;
    s.listeners['button:click'].fn({ preventDefault() { prevented++; }, stopImmediatePropagation() { prevented++; } });
    assert.equal(prevented, 2);
    assert.equal(s.scrolls[0].top, 0);
    assert.equal(s.scrolls[0].behavior, reduced ? 'instant' : 'smooth');
  }
});
test('fixed bottom player reserves room above it', () => {
  const s = setup({ obstacle: true });
  s.win.scrollY = 500; s.listeners['window:scroll']();
  assert.equal(s.button.css.bottom, 'max(92px, env(safe-area-inset-bottom))');
  assert.equal(s.button.css.display, 'flex');
});
test('open modal and fullscreen suppress the page control', () => {
  const s = setup({ modal: true }); s.win.scrollY = 500; s.listeners['window:scroll']();
  assert.equal(s.button.css.display, 'none');
  const f = setup(); f.win.scrollY = 500;
  f.doc.fullscreenElement = {};
  f.listeners['window:scroll']();
  assert.equal(f.button.css.display, 'none');
});

test('release refreshes the shared chat loader without touching frozen channels',async()=>{
 const {applyPageStandard}=await import('./cc-page-standard.mjs');
 const html='<body><script src="/components/cc-support-footer.js" defer></script><script src="/js/cc-back-to-top.js"></script></body>';
 const result=applyPageStandard('lumina.html',html);
 assert.match(result,/cc-support-footer\.js\?v=20261116_a007_column/);
 assert.equal(applyPageStandard('lumina.html',result),result);
 for(const file of ['cctv24-worship.html','stream-scene.html','snadaniowa-live.html','zapolske-live.html'])assert.equal(applyPageStandard(file,html),html);
});
