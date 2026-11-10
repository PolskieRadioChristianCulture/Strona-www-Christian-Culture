import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { applyPageStandard, EDGE_PLUS_SCRIPT } from './cc-page-standard.mjs';

const source = fs.readFileSync(new URL('../js/cc-edge-plus.js', import.meta.url), 'utf8');
const html = '<!DOCTYPE html><html><head><title>Test</title></head><body><main>CC Content</main></body></html>';

test('CCEdgePlus: public routes receive root-relative deferred script via cc-page-standard', () => {
  for (const file of ['index.html', 'lumina.html', 'akademia.html', 'vod.html', 'mojabiblia.html']) {
    const result = applyPageStandard(file, html);
    assert.ok(result.includes(`defer src="${EDGE_PLUS_SCRIPT}"`), `File ${file} should contain deferred script`);
    assert.equal(applyPageStandard(file, result), result, 'applyPageStandard must be idempotent');
  }
});

test('CCEdgePlus: broadcast, operational, and live screens are completely untouched', () => {
  for (const file of [
    'cctv24-worship.html',
    'cctv24-worship-live.html',
    'stream-scene.html',
    'cctv24.html',
    'snadaniowa-live.html',
    'zapolske-live.html',
    'admin.html',
    'pilot.html',
    'ccmc.html'
  ]) {
    assert.equal(applyPageStandard(file, html), html, `Operational/live file ${file} must remain untouched`);
  }
});

test('CCEdgePlus: herbatka excludes edge-plus and mobile-edge scripts', () => {
  for (const file of ['herbatka.html', 'herbatka/index.html']) {
    const res = applyPageStandard(file, html);
    assert.equal(res.includes('cc-edge-plus.js'), false, `${file} must not include cc-edge-plus.js`);
    assert.equal(res.includes('cc-mobile-edge.js'), false, `${file} must not include cc-mobile-edge.js`);
  }
});

function createMockEnvironment({
  width = 390,
  height = 844,
  scrollY = 0,
  reduced = false,
  modal = false,
  fullscreen = false,
  hasExistingDialog = true,
  locale = 'pl'
} = {}) {
  const listeners = {};
  const elements = new Map();
  let modalOpen = false;

  function createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); el.className = Array.from(this._classes).join(' '); },
        remove(c) { this._classes.delete(c); el.className = Array.from(this._classes).join(' '); },
        contains(c) { return this._classes.has(c); },
        toggle(c, force) {
          if (force === true) this.add(c);
          else if (force === false) this.remove(c);
          else if (this.contains(c)) this.remove(c);
          else this.add(c);
        }
      },
      attrs: {},
      style: {
        cssText: '',
        setProperty(k, v) { this[k] = v; }
      },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; },
      removeAttribute(k) { delete this.attrs[k]; },
      contains: () => false,
      append(...nodes) { nodes.forEach(n => el.appendChild(n)); },
      after(node) { el.parentNode?.appendChild(node); },
      appendChild(child) {
        child.parentNode = el;
        return child;
      },
      getBoundingClientRect: () => ({ top: 100, bottom: 200, left: 10, right: 100, width: 48, height: 48 }),
      addEventListener(name, fn) {
        const key = (el.id ? '#' + el.id : el.tagName) + ':' + name;
        listeners[key] = fn;
      },
      removeEventListener(name) {
        const key = (el.id ? '#' + el.id : el.tagName) + ':' + name;
        delete listeners[key];
      },
      click() {
        if (listeners[(el.id ? '#' + el.id : el.tagName) + ':click']) {
          listeners[(el.id ? '#' + el.id : el.tagName) + ':click']({
            preventDefault() {},
            stopPropagation() {}
          });
        }
      },
      focus() {}
    };

    if (tag === 'dialog') {
      el.open = false;
      el.showModal = function () {
        el.open = true;
        modalOpen = true;
      };
      el.close = function () {
        el.open = false;
        modalOpen = false;
        if (listeners['#cc-mobile-edge-dialog:close']) {
          listeners['#cc-mobile-edge-dialog:close']();
        }
      };
    }

    return el;
  }

  const body = createElement('body');
  const head = createElement('head');

  if (hasExistingDialog) {
    const dialog = createElement('dialog');
    dialog.id = 'cc-mobile-edge-dialog';
    body.appendChild(dialog);
    elements.set('cc-mobile-edge-dialog', dialog);
  }

  const doc = {
    readyState: 'complete',
    documentElement: {
      lang: locale,
      scrollTop: scrollY,
      dataset: {},
      style: { overflow: '' }
    },
    body,
    head,
    createElement,
    getElementById(id) {
      if (id === 'ccEdgePlusBtn') return elements.get('ccEdgePlusBtn') || null;
      if (id === 'cc-mobile-edge-dialog') return elements.get('cc-mobile-edge-dialog') || null;
      return null;
    },
    querySelector(sel) {
      if (sel === 'meta[name="cc-csp-nonce"]') return null;
      if (sel === '#cc-edge-plus-styles') return elements.get('cc-edge-plus-styles') || null;
      if (sel === '.cc-edge-plus-tooltip') return elements.get('cc-edge-plus-tooltip') || null;
      return null;
    },
    querySelectorAll(sel) {
      if (modal && sel.includes('dialog[open]')) {
        return [{
          getBoundingClientRect: () => ({ width: 300, height: 200 }),
          style: { visibility: 'visible', display: 'block' }
        }];
      }
      return [];
    },
    addEventListener(name, fn) {
      listeners['document:' + name] = fn;
    },
    removeEventListener(name) {
      delete listeners['document:' + name];
    },
    fullscreenElement: fullscreen ? body : null
  };

  const win = {
    innerWidth: width,
    innerHeight: height,
    scrollY,
    pageYOffset: scrollY,
    matchMedia: () => ({ matches: reduced }),
    getComputedStyle: () => ({ visibility: 'visible', display: 'block' }),
    requestAnimationFrame(fn) { fn(); },
    addEventListener(name, fn) {
      listeners['window:' + name] = fn;
    },
    removeEventListener(name) {
      delete listeners['window:' + name];
    },
    location: { pathname: '/index.html' },
    document: doc
  };

  // Przechwytywanie tworzonych elementów
  const originalAppendChild = body.appendChild.bind(body);
  body.appendChild = function (child) {
    if (child.id) elements.set(child.id, child);
    return originalAppendChild(child);
  };
  const originalHeadAppendChild = head.appendChild.bind(head);
  head.appendChild = function (child) {
    if (child.id) elements.set(child.id, child);
    return originalHeadAppendChild(child);
  };

  const context = vm.createContext({ window: win, document: doc });
  vm.runInContext(source, context);

  return { win, doc, context, listeners, elements, body };
}

test('CCEdgePlus: initial state is hidden at top of page (scrollY < 300)', () => {
  const env = createMockEnvironment({ scrollY: 0 });
  const btn = env.elements.get('ccEdgePlusBtn');
  assert.ok(btn, 'Button #ccEdgePlusBtn should be created');
  assert.equal(btn.classList.contains('is-visible'), false, 'Button should not have .is-visible class at scrollY=0');
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
  assert.equal(btn.getAttribute('aria-controls'), 'cc-mobile-edge-dialog');
  assert.equal(btn.getAttribute('aria-label'), 'Otwórz panel Christian Culture');
});

test('CCEdgePlus: activates smoothly when scrolled past threshold (scrollY >= 300)', () => {
  const env = createMockEnvironment({ scrollY: 0 });
  const btn = env.elements.get('ccEdgePlusBtn');
  assert.equal(btn.classList.contains('is-visible'), false);

  env.win.scrollY = 350;
  env.win.pageYOffset = 350;
  env.listeners['window:scroll']();

  assert.equal(btn.classList.contains('is-visible'), true, 'Button should have .is-visible when scrollY >= 300');
});

test('CCEdgePlus: hides when scrolled back up to top (scrollY < 300)', () => {
  const env = createMockEnvironment({ scrollY: 400 });
  const btn = env.elements.get('ccEdgePlusBtn');
  assert.equal(btn.classList.contains('is-visible'), true);

  env.win.scrollY = 150;
  env.win.pageYOffset = 150;
  env.listeners['window:scroll']();

  assert.equal(btn.classList.contains('is-visible'), false, 'Button should hide when scrolled back < 300');
});

test('CCEdgePlus: configurable threshold dynamically updates visibility threshold', () => {
  const env = createMockEnvironment({ scrollY: 0 });
  const btn = env.elements.get('ccEdgePlusBtn');
  const api = env.context.CCEdgePlus;

  assert.equal(api.threshold, 300);
  api.threshold = 500;
  assert.equal(api.threshold, 500);

  env.win.scrollY = 400;
  env.win.pageYOffset = 400;
  env.listeners['window:scroll']();
  assert.equal(btn.classList.contains('is-visible'), false, 'At scrollY=400 with threshold 500 button remains hidden');

  env.win.scrollY = 550;
  env.win.pageYOffset = 550;
  env.listeners['window:scroll']();
  assert.equal(btn.classList.contains('is-visible'), true, 'At scrollY=550 with threshold 500 button is visible');
});

test('CCEdgePlus: clicking button opens existing Christian Culture dialog without duplicating', () => {
  const env = createMockEnvironment({ scrollY: 350 });
  const btn = env.elements.get('ccEdgePlusBtn');
  const dialog = env.elements.get('cc-mobile-edge-dialog');
  assert.equal(dialog.open, false);

  btn.click();

  assert.equal(dialog.open, true, 'Existing dialog should be opened via showModal');
  assert.equal(btn.getAttribute('aria-expanded'), 'true');

  // Closing dialog
  dialog.close();
  assert.equal(dialog.open, false);
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
  assert.equal(env.doc.body.style.overflow, '', 'Body overflow must be restored to prevent page freeze');
});

test('CCEdgePlus: closing panel restores body and html overflow to unfreeze mobile scroll', () => {
  const env = createMockEnvironment({ scrollY: 500, hasExistingDialog: true });
  const btn = env.elements.get('ccEdgePlusBtn');
  const dialog = env.elements.get('cc-mobile-edge-dialog');

  // Open panel
  btn.click();
  assert.equal(dialog.open, true);
  assert.equal(env.doc.body.style.overflow, 'hidden');

  // Close panel via dialog.close()
  dialog.close();
  assert.equal(dialog.open, false);
  assert.equal(env.doc.body.style.overflow, '', 'Overflow must be cleared on close to unfreeze page');
});

test('CCEdgePlus: suppressed when modal dialog is open or during fullscreen', () => {
  const envModal = createMockEnvironment({ scrollY: 500, modal: true });
  const btnModal = envModal.elements.get('ccEdgePlusBtn');
  assert.equal(btnModal.classList.contains('is-visible'), false, 'Must be hidden when modal is open');

  const envFs = createMockEnvironment({ scrollY: 500, fullscreen: true });
  const btnFs = envFs.elements.get('ccEdgePlusBtn');
  assert.equal(btnFs.classList.contains('is-visible'), false, 'Must be hidden during fullscreen');
});

test('CCEdgePlus: multilingual labels update on locale change', () => {
  const env = createMockEnvironment({ scrollY: 0, locale: 'en' });
  const btn = env.elements.get('ccEdgePlusBtn');
  assert.equal(btn.getAttribute('aria-label'), 'Open Christian Culture panel');

  env.doc.documentElement.lang = 'de';
  env.listeners['document:ekocc:locale-changed']();
  assert.equal(btn.getAttribute('aria-label'), 'Christian Culture Panel öffnen');
});
