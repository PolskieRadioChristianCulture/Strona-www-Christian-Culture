import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { Window } from 'happy-dom';
import { EWANGELIA_I18N } from '../Ewangelia/i18n.js';

const htmlEwangelia = await readFile(new URL('../Ewangelia.html', import.meta.url), 'utf8');
const htmlIndex = await readFile(new URL('../Ewangelia/index.html', import.meta.url), 'utf8');
const appJsRaw = await readFile(new URL('../Ewangelia/app.js', import.meta.url), 'utf8');

test('Ewangelia.html and Ewangelia/index.html are strictly identical', () => {
  assert.equal(htmlEwangelia, htmlIndex);
});

test('Ewangelia.html loads cache-busted styles.css and i18n.js module before app.js', () => {
  assert.ok(htmlEwangelia.includes('/Ewangelia/styles.css?v=20261122_i18n15_v2'));
  assert.equal(htmlEwangelia.includes('/Ewangelia/styles.css?v=20261022'), false);
  assert.equal(htmlEwangelia.includes('/Ewangelia/app.js?v=20261022'), false);

  const i18nTag = '<script type="module" src="/Ewangelia/i18n.js?v=20261122_i18n15_v2"></script>';
  const appTag = '<script type="module" src="/Ewangelia/app.js?v=20261122_i18n15_v2"></script>';
  const i18nIdx = htmlEwangelia.indexOf(i18nTag);
  const appIdx = htmlEwangelia.indexOf(appTag);
  assert.ok(i18nIdx !== -1, 'Missing i18n.js module tag');
  assert.ok(appIdx !== -1, 'Missing app.js module tag');
  assert.ok(i18nIdx < appIdx, 'i18n.js must be loaded before app.js');
});

test('prayer section exists and contains no markdown artifacts (#, *, \\)', () => {
  assert.ok(htmlEwangelia.includes('id="modlitwa"'));
  assert.ok(htmlEwangelia.includes('Modlitwa Oddania Życia Jezusowi Chrystusowi'));
  assert.ok(htmlEwangelia.includes('Efezjan 2,8–9'));
  assert.ok(htmlEwangelia.includes('Panie Jezu Chryste, Synu Boga żywego!'));

  const prayerPart = htmlEwangelia.slice(
    htmlEwangelia.indexOf('id="modlitwa"'),
    htmlEwangelia.indexOf('</section>', htmlEwangelia.indexOf('id="modlitwa"'))
  );
  assert.equal(/#[#\s]/.test(prayerPart), false, 'Found raw markdown # headings in prayer section');
  assert.equal(/\*{1,2}[A-Za-z0-9]/.test(prayerPart), false, 'Found raw markdown asterisks in prayer section');
  assert.equal(/\\/.test(prayerPart), false, 'Found raw backslashes in prayer section');
});

test('i18n dictionary supports all 15 world languages with complete prayers, promises, and no typos', () => {
  const targetLangs = ['pl', 'en', 'de', 'uk', 'es', 'ru', 'zh', 'fr', 'pt', 'ar', 'hi', 'id', 'it', 'ja', 'ko'];
  assert.equal(Object.keys(EWANGELIA_I18N).length >= 15, true);
  const serialized = JSON.stringify(EWANGELIA_I18N);
  assert.equal(/corderò/.test(serialized), false, 'Found Italian typo corderò');
  assert.equal(/karakternya/.test(serialized), false, 'Found Indonesian typo karakternya');

  for (const lang of targetLangs) {
    const dict = EWANGELIA_I18N[lang];
    assert.ok(dict, `Missing language: ${lang}`);
    assert.ok(dict.langName, `Missing langName for language: ${lang}`);
    assert.ok(dict.prayer, `Missing prayer for language: ${lang}`);
    assert.ok(dict.prayer.title, `Missing prayer title for language: ${lang}`);
    assert.ok(dict.prayer.stanzas && dict.prayer.stanzas.length >= 10, `Missing prayer stanzas for language: ${lang}`);
    assert.ok(dict.prayer.aftermath && dict.prayer.aftermath.promises.length >= 7, `Missing promises for language: ${lang}`);
    assert.ok(dict.prayer.aftermath.truthMain, `Missing truthMain for language: ${lang}`);
  }
});

test('page switches languages at runtime and updates DOM, RTL, prayer stanzas, and hero/player labels', async () => {
  const w = new Window({ url: 'https://polskieradio.cc/Ewangelia' });
  const d = w.document;
  d.write(htmlEwangelia);
  w.EWANGELIA_I18N = EWANGELIA_I18N;

  // Check language buttons in all 3 surfaces
  assert.ok(d.querySelectorAll('[data-lang]').length >= 15 * 3);
  assert.equal(d.querySelectorAll('.topbar-lang-switcher [data-lang]').length, 15);
  assert.equal(d.querySelectorAll('.prayer-lang-pills [data-lang]').length, 15);

  const appSrc = appJsRaw.replace(/^import[^\n]+\n/, '');
  vm.runInNewContext(appSrc, {
    document: d,
    window: w,
    navigator: w.navigator,
    location: w.location,
    localStorage: w.localStorage,
    URL,
    URLSearchParams,
    matchMedia: w.matchMedia.bind(w),
    setTimeout,
    clearTimeout,
    createAudioVisualizer: () => ({ prepare: async () => true, getEnabled: () => false, setEnabled: () => {} })
  });

  d.dispatchEvent(new w.Event('DOMContentLoaded'));

  const checks = [
    { lang: 'zh', dir: 'ltr', expectedCode: 'ZH' },
    { lang: 'ar', dir: 'rtl', expectedCode: 'AR' },
    { lang: 'en', dir: 'ltr', expectedCode: 'EN' },
    { lang: 'ko', dir: 'ltr', expectedCode: 'KO' },
    { lang: 'pl', dir: 'ltr', expectedCode: 'PL' }
  ];

  for (const { lang, dir, expectedCode } of checks) {
    const btn = d.querySelector(`.topbar-lang-switcher [data-lang="${lang}"]`);
    assert.ok(btn, `Missing topbar button for ${lang}`);
    btn.click();

    const dict = EWANGELIA_I18N[lang];
    assert.equal(d.documentElement.lang, lang);
    assert.equal(d.documentElement.dir, dir);
    assert.equal(d.getElementById('topbarLangCurrent').textContent, expectedCode);
    assert.equal(d.getElementById('prayerMainTitle').textContent, dict.prayer.title);
    assert.equal(d.querySelectorAll('#prayerStanzas .prayer-stanza').length, 10);
    assert.equal(d.querySelectorAll('#promisesList li').length, 7);
    assert.equal(d.querySelector('[data-i18n="hero.listenBtn"]').textContent, dict.hero.listenBtn);
    assert.equal(d.querySelector('[data-i18n="player.share"]').textContent, dict.player.share);
  }

  await w.happyDOM.close();
});
