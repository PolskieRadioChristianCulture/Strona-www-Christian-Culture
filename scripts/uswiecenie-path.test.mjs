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
  assert.match(html, /id="ccReflectionToggleBtn"/, 'brak pulsującej ikony odkrywającej rozważanie i modlitwę');
  assert.match(html, /class="cc-reflection-card[^"]*"[^>]*id="ccVerseReflectionCard"\s+hidden/, 'karta rozważania i modlitwy musi być domyślnie ukryta');
  assert.match(html, /id="ccSanctificationToggleBtn"/, 'brak pulsującego przycisku Wejdź na ścieżkę uświęcenia');
  assert.ok(html.includes('Wejdź na ścieżkę uświęcenia'), 'przycisk musi mieć napis Wejdź na ścieżkę uświęcenia');
  assert.match(html, /class="cc-map-card[^"]*"[^>]*id="ccSanctificationMap"\s+hidden/, 'okno Mapy Uświęcenia musi być domyślnie ukryte');
  assert.match(html, /class="cc-path-connector/, 'brak linii łączących kroki ścieżki');
  assert.match(html, /v=20261119_gold12/, 'brak zaktualizowanego cache-bustera v=20261119_gold12');
  for (const n of [1, 2, 3]) assert.match(html, new RegExp('id="heroSlide' + n + '"'), 'brak okna prezentacji ' + n);
  const iS1 = html.indexOf('id="heroSlide1"'), iS2 = html.indexOf('id="heroSlide2"'), iS3 = html.indexOf('id="heroSlide3"');
  assert.ok(iS1 < html.indexOf('id="heroSeeMoreBtn"') && html.indexOf('id="heroSeeMoreBtn"') < iS2, 'ZOBACZ WIĘCEJ w oknie 1');
  assert.ok(iS2 < html.indexOf('id="liveStreamBox"') && html.indexOf('id="liveStreamBox"') < iS3, 'transmisja w oknie 2');
  assert.ok(iS3 < html.indexOf('id="heroVerseBtn"'), 'przyciski w oknie 3');
  assert.match(html, /id="heroDots"/, 'brak kropek przełączania okien');
  assert.match(html, /id="heroSeeMoreBtn"/, 'brak dużego napisu ZOBACZ WIĘCEJ w Hero');
  assert.ok(html.includes('ZOBACZ WIĘCEJ'), 'brak tekstu ZOBACZ WIĘCEJ');
  assert.match(html, /id="heroThirdDescription"/, 'brak trzeciej prezentacji (maszyna do pisania)');
  assert.match(html, /id="heroVerseBtn"[^>]*>[\s\S]*?Werset<\/a>/, 'brak przycisku WERSET');
  const iVerse = html.indexOf('id="ccDailyVerseNode"');
  const iRef = html.indexOf('id="ccVerseRefLink"');
  const iRefl = html.indexOf('id="ccReflectionToggleBtn"');
  assert.ok(iVerse !== -1 && iRef > iVerse && iRefl > iRef, 'odnośnik MojaBiblia musi stać na ścieżce między wersetem a „Odkryj rozważanie”');
  assert.match(html, /id="ccConnectorVerseToRef"/, 'brak linii wersetu do odnośnika');
  assert.match(html, /id="ccConnectorVerseToReflection"/, 'brak linii odnośnika do rozważania');
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
  assert.match(css, /#080808|#0a0a0a/i);
  assert.match(css, /ccVerseWordWave/, 'brak animacji falowania słów Wersetu Dnia');
  assert.match(css, /ccOrbRingPulse/, 'brak animacji pulsowania ikony rozważania');
  assert.match(css, /ccCtaHaloPulse/, 'brak animacji pulsowania przycisku ścieżki');
  assert.match(css, /ccPathSparkDrop/, 'brak animacji światła na liniach łączących kroki');
  assert.match(css, /ccHeroCascadeIn/, 'brak kaskadowej animacji Hero');
  assert.match(css, /ccCaretBlink/, 'brak kursora maszyny do pisania');
  assert.match(css, /\.btn-verse/, 'brak stylu przycisku WERSET');
  assert.match(css, /\.cc-hero-slide\s*\{[\s\S]*?grid-area:\s*1\s*\/\s*1/, 'okna muszą być w tym samym miejscu');

  const js = fs.readFileSync(jsPath, 'utf8');
  assert.match(js, /fetch\(['"]\/rozwazania_baza\.json['"]/);
  assert.match(js, /Europe\/Warsaw/);
  assert.match(js, /cc_sanctification_state_v1/);
  assert.match(js, /formatAnimatedVerseHtml/, 'brak funkcji animacji słów Wersetu Dnia');
  assert.match(js, /renderReflectionCard/, 'brak funkcji renderującej ukryte rozważanie i modlitwę');
  assert.match(js, /updateStreakPill/, 'brak funkcji aktualizującej serię bez restartu animacji wersetu');
  assert.match(js, /initHeroCascade/, 'brak kaskadowej prezentacji Hero');
  assert.match(js, /cc-tw-typed/, 'brak maszyny do pisania');
  assert.match(js, /getElementById\('playBtn'\)/, 'RADIO musi włączać dolny odtwarzacz');

  const chatJs = fs.readFileSync(path.join(ROOT, 'components', 'cc-global-chat-button.js'), 'utf8');
  assert.match(chatJs, /#ccGlobalChatOverlay\.cc-chat-home-theme/);
  assert.match(chatJs, /buildVerseGreetingForAssistant/);
  assert.match(chatJs, /trimVerseByWord/);
});
