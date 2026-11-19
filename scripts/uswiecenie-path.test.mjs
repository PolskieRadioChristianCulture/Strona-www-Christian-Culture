import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const prodHtmlPath = path.join(ROOT, 'index.html');
const testHtmlPath = path.join(ROOT, 'test', 'uswiecenie', 'index.html');
const cssPath = path.join(ROOT, 'css', 'cc-sanctification-path.css');
const jsPath = path.join(ROOT, 'js', 'cc-sanctification-path.js');

function assertSanctificationContract(html, label) {
  assert.match(html, /id="sciezka-uswiecenia"/, `${label}: brak sekcji #sciezka-uswiecenia`);
  assert.match(html, /class="cc-mandala-thread"/, `${label}: brak pionowej linii łączącej z Mandali`);
  assert.match(html, /id="ccDailyVerseNode"/, `${label}: brak węzła Wersetu Dnia`);
  assert.strictEqual((html.match(/id="ccDailyVerseNode"/g) || []).length, 1, `${label}: w dokumencie może istnieć tylko jeden #ccDailyVerseNode`);
  assert.match(html, /id="ccReflectionToggleBtn"/, `${label}: brak pulsującej ikony odkrywającej rozważanie i modlitwę`);
  assert.match(html, /class="cc-reflection-card[^"]*"[^>]*id="ccVerseReflectionCard"\s+hidden/, `${label}: karta rozważania i modlitwy musi być domyślnie ukryta`);
  assert.match(html, /id="ccSanctificationToggleBtn"/, `${label}: brak pulsującego przycisku Wejdź na ścieżkę uświęcenia`);
  assert.ok(html.includes('Wejdź na ścieżkę uświęcenia'), `${label}: przycisk musi mieć napis Wejdź na ścieżkę uświęcenia`);
  assert.match(html, /class="cc-map-card[^"]*"[^>]*id="ccSanctificationMap"\s+hidden/, `${label}: okno Mapy Uświęcenia musi być domyślnie ukryte`);
  assert.match(html, /class="cc-path-connector/, `${label}: brak linii łączących kroki ścieżki`);
  assert.match(html, /v=20261119_gold13/, `${label}: brak zaktualizowanego cache-bustera v=20261119_gold13`);
  for (const n of [1, 2, 3, 4]) assert.match(html, new RegExp('id="heroSlide' + n + '"'), `${label}: brak okna prezentacji ${n}`);
  for (const n of [1, 2, 3, 4]) assert.match(html, new RegExp('data-go="' + n + '"'), `${label}: brak kropki nawigacyjnej ${n}`);
  const iS1 = html.indexOf('id="heroSlide1"'), iS2 = html.indexOf('id="heroSlide2"'), iS3 = html.indexOf('id="heroSlide3"'), iS4 = html.indexOf('id="heroSlide4"');
  const iDots = html.indexOf('id="heroDots"');
  const iVerse = html.indexOf('id="ccDailyVerseNode"');
  assert.ok(iS1 < html.indexOf('id="heroSeeMoreBtn"') && html.indexOf('id="heroSeeMoreBtn"') < iS2, `${label}: ZOBACZ WIĘCEJ w oknie 1`);
  assert.ok(iS2 < html.indexOf('id="liveStreamBox"') && html.indexOf('id="liveStreamBox"') < iS3, `${label}: transmisja w oknie 2`);
  assert.ok(iS3 < html.indexOf('id="heroVerseBtn"') && html.indexOf('id="heroVerseBtn"') < iS4, `${label}: przyciski w oknie 3`);
  assert.ok(iS4 < iVerse && iVerse < iDots, `${label}: #ccDailyVerseNode musi znajdować się w oknie 4 prezentacji Hero (przed #heroDots)`);
  assert.match(html, /id="ccDailyVerseNode"[^>]*role="button"[^>]*tabindex="0"|id="heroSlide4"[\s\S]*role="button"[^>]*tabindex="0"/, `${label}: 4. okno Wersetu Dnia musi być dostępne do kliknięcia i z klawiatury`);
  assert.match(html, /id="heroDots"/, `${label}: brak kropek przełączania okien`);
  assert.match(html, /id="heroSeeMoreBtn"/, `${label}: brak dużego napisu ZOBACZ WIĘCEJ w Hero`);
  assert.ok(html.includes('ZOBACZ WIĘCEJ'), `${label}: brak tekstu ZOBACZ WIĘCEJ`);
  assert.match(html, /id="heroThirdDescription"/, `${label}: brak trzeciej prezentacji (maszyna do pisania)`);
  assert.match(html, /id="heroVerseBtn"[^>]*>[\s\S]*?Werset<\/a>/, `${label}: brak przycisku WERSET`);
  const iSec = html.indexOf('id="sciezka-uswiecenia"');
  const iRef = html.indexOf('id="ccVerseRefLink"');
  const iRefl = html.indexOf('id="ccReflectionToggleBtn"');
  assert.ok(iVerse < iSec && iSec < iRef && iRef < iRefl, `${label}: po przeniesieniu Wersetu Dnia do Hero sekcja ścieżki zaczyna się od odnośnika MojaBiblia przed „Odkryj rozważanie”`);
  assert.match(html, /id="ccConnectorVerseToRef"/, `${label}: brak linii od góry ścieżki do odnośnika`);
  assert.match(html, /id="ccConnectorVerseToReflection"/, `${label}: brak linii odnośnika do rozważania`);
  assert.match(html, /id="ccMoreArchiveToggle"/, `${label}: brak pojedynczego przycisku Więcej`);
  assert.match(html, /id="ccMoreSectionsWrapper"\s+hidden/, `${label}: 9 zakładek musi być ukrytych pod Więcej`);

  const requiredAccordions = [
    'dailyReflectionSection', 'apps-section', 'books-section',
    'social-channels', 'broadcast-section', 'support-store',
    'reviews-section', 'qna-section', 'contact-section'
  ];
  const wrapperStart = html.indexOf('id="ccMoreSectionsWrapper"');
  const wrapperEnd = html.indexOf('<!-- /#ccMoreSectionsWrapper -->');
  assert.ok(wrapperStart !== -1 && wrapperEnd > wrapperStart, `${label}: niepoprawne granice #ccMoreSectionsWrapper`);
  const wrappedSlice = html.slice(wrapperStart, wrapperEnd);
  for (const id of requiredAccordions) {
    assert.ok(wrappedSlice.includes(`id="${id}"`), `${label}: sekcja #${id} powinna znajdować się wewnątrz #ccMoreSectionsWrapper`);
  }
}

test('produkcyjna strona główna index.html spełnia kontrakt 4-oknowego Hero i Ścieżki Uświęcenia bez noindex', () => {
  assert.ok(fs.existsSync(prodHtmlPath), 'brak index.html');
  const html = fs.readFileSync(prodHtmlPath, 'utf8');
  assert.doesNotMatch(html, /noindex/i, 'index.html nie może zawierać noindex');
  assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/polskieradio\.cc\/"\s*>/i, 'brak canonical strony głównej');
  assert.doesNotMatch(html, /<base\s+href=/i, 'produkcyjny index.html nie powinien mieć <base href>');
  assertSanctificationContract(html, 'index.html');
});

test('test/uswiecenie/index.html spełnia kontrakt testowej Ścieżki Uświęcenia', () => {
  assert.ok(fs.existsSync(testHtmlPath), 'brak test/uswiecenie/index.html');
  assert.ok(fs.existsSync(cssPath), 'brak css/cc-sanctification-path.css');
  assert.ok(fs.existsSync(jsPath), 'brak js/cc-sanctification-path.js');

  const html = fs.readFileSync(testHtmlPath, 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow">/i, 'wersja testowa musi mieć noindex, nofollow');
  assertSanctificationContract(html, 'test/uswiecenie/index.html');
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
  assert.match(css, /\.cc-verse-enter-hint/, 'brak stylu wskazówki kliknięcia 4. okna Wersetu Dnia');

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
  assert.match(js, /function startSlide4\(/, 'brak obsługi 4. okna prezentacji Hero');
  assert.match(js, /cc:hero-verse-shown/, 'brak synchronizacji wejścia Wersetu Dnia z Oknem 4');
  assert.match(js, /openStepOneFromVerse/, 'brak przejścia po kliknięciu 4. okna do Kroku 1');
  assert.match(js, /setReflectionOpen\(true\)/, 'kliknięcie 4. okna musi otwierać kartę rozważania i modlitwy');

  const chatJs = fs.readFileSync(path.join(ROOT, 'components', 'cc-global-chat-button.js'), 'utf8');
  assert.match(chatJs, /#ccGlobalChatOverlay\.cc-chat-home-theme/);
  assert.match(chatJs, /buildVerseGreetingForAssistant/);
  assert.match(chatJs, /trimVerseByWord/);
});
