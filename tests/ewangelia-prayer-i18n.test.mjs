import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { EWANGELIA_I18N } from '../Ewangelia/i18n.js';

const htmlEwangelia = await readFile(new URL('../Ewangelia.html', import.meta.url), 'utf8');
const htmlIndex = await readFile(new URL('../Ewangelia/index.html', import.meta.url), 'utf8');

test('Ewangelia.html and Ewangelia/index.html are strictly identical', () => {
  assert.equal(htmlEwangelia, htmlIndex);
});

test('prayer section exists and contains no markdown artifacts (#, *, \\)', () => {
  assert.ok(htmlEwangelia.includes('id="modlitwa"'));
  assert.ok(htmlEwangelia.includes('Modlitwa Oddania Życia Jezusowi Chrystusowi'));
  assert.ok(htmlEwangelia.includes('Efezjan 2,8–9'));
  assert.ok(htmlEwangelia.includes('Panie Jezu Chryste, Synu Boga żywego!'));

  const prayerPart = htmlEwangelia.slice(htmlEwangelia.indexOf('id="modlitwa"'), htmlEwangelia.indexOf('</section>', htmlEwangelia.indexOf('id="modlitwa"')));
  // Check no raw markdown heading '# ' or '## '
  assert.equal(/#[#\s]/.test(prayerPart), false, 'Found raw markdown # headings in prayer section');
  // Check no raw markdown bold/italic '**' or '*'
  assert.equal(/\*{1,2}[A-Za-z0-9]/.test(prayerPart), false, 'Found raw markdown asterisks in prayer section');
  // Check no raw backslashes '\'
  assert.equal(/\\/.test(prayerPart), false, 'Found raw backslashes in prayer section');
});

test('i18n dictionary supports all 15 world languages with complete prayers and promises', () => {
  const targetLangs = ['pl', 'en', 'de', 'uk', 'es', 'ru', 'zh', 'fr', 'pt', 'ar', 'hi', 'id', 'it', 'ja', 'ko'];
  assert.equal(Object.keys(EWANGELIA_I18N).length >= 15, true);
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

test('page switches languages correctly and updates DOM in happy-dom', () => {
  const w = new Window({ url: 'https://polskieradio.cc/Ewangelia' });
  w.document.write(htmlEwangelia);

  // Check language buttons
  const buttons = w.document.querySelectorAll('[data-lang]');
  assert.ok(buttons.length >= 15 * 3); // topbar + menu + prayer section

  // Check topbar language switcher
  const topbarBtns = w.document.querySelectorAll('.topbar-lang-switcher [data-lang]');
  assert.equal(topbarBtns.length, 15);

  // Check prayer language switcher pills
  const prayerBtns = w.document.querySelectorAll('.prayer-lang-pills [data-lang]');
  assert.equal(prayerBtns.length, 15);

  w.happyDOM.close();
});
