import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../js/cc-home-language.js', import.meta.url), 'utf8');
function boot({ languages = ['en-US'], stored = {}, cookie = '', url = 'https://polskieradio.cc/', blocked = false } = {}) {
  const local = new Map(Object.entries(stored));
  const session = new Map();
  const jar = new Map(cookie ? cookie.split('; ').map(c => c.split('=')) : []);
  const document = { documentElement: { lang: 'pl' } };
  Object.defineProperty(document, 'cookie', {
    get: () => [...jar].map(p => p.join('=')).join('; '),
    set: value => { const [key, val] = value.split(';')[0].split('='); if (/Max-Age=0/.test(value)) jar.delete(key); else jar.set(key, val); }
  });
  let navigation;
  const storage = map => ({ getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value) });
  const window = { navigator: { languages, language: languages[0] }, location: { href: url, hostname: 'polskieradio.cc', reload: () => { navigation = 'reload'; }, replace: value => { navigation = value; } }, sessionStorage: storage(session) };
  Object.defineProperty(window, 'localStorage', { get: () => { if (blocked) throw Error('storage denied'); return storage(local); } });
  vm.runInNewContext(source, { window, document, URL });
  return { window, document, local, jar, navigation: () => navigation };
}
for (const [languages, expected] of [[['pl-PL'], 'pl'], [['en-GB'], 'en'], [['de-DE'], 'en'], [['es-MX', 'pl-PL'], 'pl'], [[], 'en']]) {
  test(`first visit: ${languages.join(',')} → ${expected}`, () => {
    const page = boot({ languages });
    assert.equal(page.document.documentElement.lang, expected);
    assert.equal(page.local.has('cc_user_lang_choice'), false, 'automatic detection must not become a manual preference');
  });
}
test('manual selection survives a fresh session and a different browser language', () => {
  const first = boot({ languages: ['en-US'] });
  first.window.CCHomeLanguage.choose('pl');
  assert.equal(first.navigation(), 'reload');
  const next = boot({ languages: ['en-US'], stored: Object.fromEntries(first.local) });
  assert.equal(next.window.CCHomeLanguage.get(), 'pl');
  next.window.CCHomeLanguage.choose('en');
  assert.equal(boot({ languages: ['pl-PL'], stored: Object.fromEntries(next.local) }).window.CCHomeLanguage.get(), 'en');
});
test('cookie preference works when localStorage is unavailable', () => {
  const page = boot({ blocked: true, cookie: 'cc_lang_pref=pl' });
  assert.equal(page.window.CCHomeLanguage.get(), 'pl');
  page.window.CCHomeLanguage.choose('en');
  assert.equal(page.jar.get('cc_lang_pref'), 'en');
});
test('legacy forced Polish and invalid stored values do not defeat browser preference', () => {
  assert.equal(boot({ stored: { lumina_lang: 'pl', cc_user_lang_choice: 'bogus' } }).window.CCHomeLanguage.get(), 'en');
});
test('explicit language link wins for this visit; manual selection clears it and retains unrelated URL state', () => {
  const page = boot({ url: 'https://polskieradio.cc/?lang=en&source=pwa#radio', stored: { cc_user_lang_choice: 'pl' } });
  assert.equal(page.window.CCHomeLanguage.get(), 'en');
  assert.equal(page.local.get('cc_user_lang_choice'), 'pl');
  page.window.CCHomeLanguage.choose('pl');
  assert.equal(page.navigation(), 'https://polskieradio.cc/?source=pwa#radio');
  assert.equal(page.jar.get('googtrans'), '/pl/pl');
});
