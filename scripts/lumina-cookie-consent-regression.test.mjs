// Regresja L0 22.11.2026 (RODO): odmowa cookies musi być respektowana.
// Błąd: lumina-bottom-nav.js sprawdzał tylko „granted”, więc po „Odrzuć” przy każdej wizycie
// wstawiał drugi baner „Zgadzam się” bez możliwości odmowy.
// Test uruchamia PRAWDZIWY fragment lumina-bottom-nav.js (sekcja Consent Mode) w happy-dom.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';

const SOURCE = fs.readFileSync('lumina-bottom-nav.js', 'utf8');
const START = SOURCE.indexOf('window.acceptLuminaCookies = function');
const END = SOURCE.indexOf('function loadLuminaRadioScript()');
assert.ok(START > 0 && END > START, 'sekcja zgody cookies w lumina-bottom-nav.js nie została znaleziona');
const SECTION = `${SOURCE.slice(START, END)}\nfunction loadLuminaRadioScript() {}`;

function mount({ consent, firstBanner = false, storageThrows = false } = {}) {
  const win = new Window({ url: 'https://polskieradio.cc/lumina', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  if (firstBanner) win.document.body.innerHTML = '<div id="lumina-cookie-banner" style="display:none"></div>';
  if (consent) win.localStorage.setItem('lumina_cookie_consent', consent);
  const gtagCalls = [];
  win.gtag = (...args) => gtagCalls.push(args);
  if (storageThrows) {
    Object.defineProperty(win, 'localStorage', { get() { throw new Error('SecurityError'); } });
  }
  const ctx = vm.createContext(win);
  vm.runInContext(`(function(){ ${SECTION} })();`, ctx);
  return { win, gtagCalls, banner: () => win.document.getElementById('luminaCookieConsentBanner') };
}

test('po odmowie („denied”) baner „Zgadzam się” NIE wraca', () => {
  const { banner } = mount({ consent: 'denied' });
  assert.equal(banner(), null);
});

test('po zgodzie brak banera i Consent Mode = granted', () => {
  const { banner, gtagCalls } = mount({ consent: 'granted' });
  assert.equal(banner(), null);
  assert.equal(gtagCalls.at(-1)?.[2]?.analytics_storage, 'granted');
});

test('bez decyzji baner ma równorzędny przycisk „Odrzuć”, który zapisuje odmowę', async () => {
  const { win, banner, gtagCalls } = mount();
  const el = banner();
  assert.ok(el, 'baner powinien się pokazać, gdy nie ma decyzji');
  const buttons = [...el.querySelectorAll('button')];
  const reject = buttons.find((b) => b.textContent.trim() === 'Odrzuć');
  const accept = buttons.find((b) => /Zgadzam się/.test(b.textContent));
  assert.ok(reject && accept, 'oba przyciski: Odrzuć i Zgadzam się');
  for (const b of [reject, accept]) assert.match(b.getAttribute('style'), /min-height:44px/, 'cel dotyku min. 44 px');
  // Jasny motyw przemalowuje baner na biały — „Odrzuć” musi dziedziczyć kolor tekstu, by był czytelny.
  assert.match(reject.getAttribute('style'), /color:inherit/);
  win.rejectLuminaCookies();
  assert.equal(win.localStorage.getItem('lumina_cookie_consent'), 'denied');
  assert.equal(gtagCalls.at(-1)?.[2]?.analytics_storage, 'denied');
  await new Promise((r) => setTimeout(r, 250));
  assert.equal(banner(), null, 'baner znika po odmowie');
});

test('gdy strona ma własny baner, drugi nie jest dokładany', () => {
  const { banner } = mount({ firstBanner: true });
  assert.equal(banner(), null);
});

test('zablokowany localStorage (tryb prywatny) nie wywraca strony', () => {
  assert.doesNotThrow(() => mount({ storageThrows: true }));
});

test('baner mieści się na telefonie, a nowa wersja skryptu trafia na wszystkie strony', () => {
  assert.match(SECTION, /max-width:min\(460px, calc\(100vw - 40px\)\)/);
  const standard = fs.readFileSync('scripts/cc-page-standard.mjs', 'utf8');
  assert.match(standard, /lumina-bottom-nav\\\.js\)\(\?:\\\?\[\^"'\]\*\)\?\(\["'\]\)\/g, '\$1\$2\?v=20261122_consent1\$3'/);
});
