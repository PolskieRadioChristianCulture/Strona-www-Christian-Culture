import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const testHtmlPath = path.join(ROOT, 'test', 'uswiecenie', 'index.html');
const cssPath = path.join(ROOT, 'css', 'cc-sanctification-path.css');
const jsPath = path.join(ROOT, 'js', 'cc-sanctification-path.js');

test('test/uswiecenie/index.html spełnia kontrakt testowej Ścieżki Uświęcenia', () => {
  assert.ok(fs.existsSync(testHtmlPath), 'brak test/uswiecenie/index.html');
  assert.ok(fs.existsSync(cssPath), 'brak css/cc-sanctification-path.css');
  assert.ok(fs.existsSync(jsPath), 'brak js/cc-sanctification-path.js');

  const html = fs.readFileSync(testHtmlPath, 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow">/i, 'wersja testowa musi mieć noindex, nofollow');
  assert.match(html, /id="sciezka-uswiecenia"/, 'brak sekcji #sciezka-uswiecenia');
  assert.match(html, /class="cc-mandala-thread"/, 'brak pionowej linii łączącej z Mandali');
  assert.match(html, /id="ccDailyVerseNode"/, 'brak węzła Wersetu Dnia');
  assert.match(html, /id="ccSanctificationMap"/, 'brak węzła Mapy Uświęcenia');
  assert.match(html, /id="ccMoreArchiveToggle"/, 'brak pojedynczego przycisku Więcej');
  assert.match(html, /id="ccMoreSectionsWrapper"\s+hidden/, '9 zakładek musi być ukrytych pod Więcej');

  const requiredAccordions = [
    'dailyReflectionSection', 'apps-section', 'books-section',
    'social-channels', 'broadcast-section', 'support-store',
    'reviews-section', 'qna-section', 'contact-section'
  ];
  const wrapperStart = html.indexOf('id="ccMoreSectionsWrapper"');
  const wrapperEnd = html.indexOf('<!-- /#ccMoreSectionsWrapper -->');
  assert.ok(wrapperStart !== -1 && wrapperEnd > wrapperStart, 'niepoprawne granice #ccMoreSectionsWrapper');
  const wrappedSlice = html.slice(wrapperStart, wrapperEnd);
  for (const id of requiredAccordions) {
    assert.ok(wrappedSlice.includes(`id="${id}"`), `sekcja #${id} powinna znajdować się wewnątrz #ccMoreSectionsWrapper`);
  }
});

test('CSS i JS zachowują obrót Mandali przy prefers-reduced-motion oraz dynamiczny odczyt rozważań', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.hero-section\s+\.mandala-svg[\s\S]*animation-iteration-count:\s*infinite\s*!important/);

  const js = fs.readFileSync(jsPath, 'utf8');
  assert.match(js, /fetch\(['"]\/rozwazania_baza\.json['"]/);
  assert.match(js, /Europe\/Warsaw/);
  assert.match(js, /cc_sanctification_state_v1/);
});
