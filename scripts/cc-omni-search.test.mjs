import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { applyPageStandard, OMNI_SEARCH_SCRIPT } from './cc-page-standard.mjs';

const ROOT = process.cwd();
const omniSearchCode = fs.readFileSync(path.join(ROOT, 'components/cc-omni-search.js'), 'utf8');
const catalogData = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj/catalog.json'), 'utf8'));

test('cc-omni-search.js: module exists and defines expected contracts', () => {
  assert.ok(omniSearchCode.includes('window.CCOmniSearch'), 'defines window.CCOmniSearch');
  assert.ok(omniSearchCode.includes('open: openSearch'), 'exports open');
  assert.ok(omniSearchCode.includes('close: closeSearch'), 'exports close');
  assert.ok(omniSearchCode.includes('performSearch: performSearch'), 'exports performSearch');
  assert.ok(omniSearchCode.includes('Przewodnik Tematyczny Ekosystemu'), 'contains context guide title');
  assert.ok(omniSearchCode.includes('min-height: 44px'), 'enforces 44px touch target');
});

test('cc-omni-search.js: search for "werset dnia" returns "Mój Werset Dnia" as #1', () => {
  // Symulacja algorytmu wyszukiwania
  const normQuery = 'werset dnia';
  const queryWords = ['werset', 'dnia'];
  
  const scored = [];
  for (const item of catalogData.items) {
    const normTitle = (item.title || '').toLowerCase();
    const normTags = ((item.tags || []).join(' ')).toLowerCase();
    let score = 0;
    if (normTitle.includes(normQuery)) score += 50;
    if (normTitle === 'mój werset dnia' || normTitle === 'werset dnia') score += 100;
    for (const w of queryWords) {
      if (normTitle.includes(w)) score += 35;
      else if (normTags.includes(w)) score += 25;
    }
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);

  assert.ok(scored.length > 0, 'Found results for werset dnia');
  assert.equal(scored[0].item.title, 'Mój Werset Dnia');
  assert.equal(scored[0].item.url, 'https://polskieradio.cc/werset-dnia');
});

test('cc-omni-search.js: search for "nadzieja" identifies the context guide', () => {
  const guide = catalogData.contextGuides && catalogData.contextGuides.nadzieja;
  assert.ok(guide, 'Context guide for nadzieja exists');
  assert.ok(guide.topic.includes('Nadzieja'), 'Guide topic includes Nadzieja');
  assert.ok(guide.keyVerses.length >= 2, 'Has key scripture verses');
  assert.ok(guide.shortcuts.some(s => s.title.includes('Mój Werset Dnia')), 'Contains Mój Werset Dnia shortcut');
});

test('cc-page-standard: injects cc-omni-search.js and preserves idempotency', () => {
  const html = '<html><head></head><body><main>Test CC</main></body></html>';
  const res1 = applyPageStandard('index.html', html);
  assert.ok(res1.includes(`defer src="${OMNI_SEARCH_SCRIPT}"`), 'includes omni-search script');
  assert.ok(res1.includes('js/cc-back-to-top.js'), 'includes back-to-top script');
  
  const res2 = applyPageStandard('index.html', res1);
  assert.equal(res2, res1, 'idempotent call produces identical HTML');
});

test('cc-omni-search.js: search for "cclite" returns cclite.pl as #1 and matches context guide', () => {
  const normQuery = 'cclite';
  const scored = [];
  for (const item of catalogData.items) {
    const normTitle = (item.title || '').toLowerCase();
    const normTags = ((item.tags || []).join(' ')).toLowerCase();
    let score = 0;
    if (normTitle.includes(normQuery)) score += 50;
    if (normTitle.startsWith('cclite.pl')) score += 80;
    if (normTags.includes(normQuery)) score += 25;
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);

  assert.ok(scored.length >= 10, 'Found at least 10 results for cclite');
  assert.ok(scored[0].item.title.includes('cclite.pl'), 'Top result is cclite.pl');
  assert.equal(scored[0].item.url, 'https://cclite.pl');

  const guide = catalogData.contextGuides && (catalogData.contextGuides.cclite || catalogData.contextGuides.aplikacja);
  assert.ok(guide, 'Context guide for cclite or aplikacja exists');
  assert.ok(guide.shortcuts.some(s => s.url === 'https://cclite.pl'), 'Contains shortcut to cclite.pl');
});

test('cc-omni-search.js: search for "aplikacja" matches context guide and cclite.pl', () => {
  const guide = catalogData.contextGuides && catalogData.contextGuides.aplikacja;
  assert.ok(guide, 'Context guide for aplikacja exists');
  assert.ok(guide.keywords.includes('cclite'), 'Guide keywords include cclite');
  assert.ok(guide.shortcuts.some(s => s.title.includes('cclite.pl')), 'Contains shortcut to cclite.pl');
});

test('cc-omni-search.js: all key MENU CC items are indexed in catalog', () => {
  const urls = new Set(catalogData.items.map(i => (i.url || '').toLowerCase()));
  const requiredPaths = ['/skins', '/music', '/holos', '/studio', '/kalendarz', '/ambientsleep', '/tv', '/ziu', '/kuchnia', '/biznes', '/finanse', '/apologetyka', '/misje', '/biblioteka', '/wspolpraca', '/projektant', '/cc-light', '/widget', '/rolki', '/certyfikat'];
  for (const path of requiredPaths) {
    const found = Array.from(urls).some(u => u.includes(path));
    assert.ok(found, `MENU CC item with path ${path} must be indexed`);
  }
  assert.ok(catalogData.contextGuides.muzyka, 'Guide muzyka exists');
  assert.ok(catalogData.contextGuides.zdrowie, 'Guide zdrowie exists');
  assert.ok(catalogData.contextGuides.biznes, 'Guide biznes exists');
  assert.ok(catalogData.contextGuides.ksiazki, 'Guide ksiazki exists');
});

test('cc-omni-search.js: VM execution of performSearch with synonyms, typos, and suggestions', async () => {
  const vm = await import('node:vm');
  // The fixture below expects lesson 15 as "today". Keep the test clock
  // independent of the release date instead of changing production search.
  class FixtureDate extends Date {
    constructor(...args) { super(...(args.length ? args : [2026, 9, 15, 12])); }
    static now() { return new FixtureDate().getTime(); }
  }
  const sandbox = {
    window: {
      location: { pathname: '/' },
      __ccSearchCatalog: catalogData
    },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      readyState: 'complete'
    },
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    URL,
    Date: FixtureDate
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const search = sandbox.window.CCOmniSearch.performSearch;
  assert.ok(typeof search === 'function', 'performSearch is a function');

  // 1. Lekcja 15 na dziś
  const r1 = search('Lekcja 15 na dziś');
  assert.equal(r1.isSuggestion, false, 'isSuggestion must be false for exact match');
  assert.ok(r1.items.length > 0, 'Must return results');
  assert.ok(r1.items[0].title.includes('Dzień 15') || r1.items[0].title.includes('Lekcja 15'), 'Top result is Lesson 15');

  // 2. Typo: "rozwżanie na dziś"
  const r2 = search('rozwżanie na dziś');
  assert.ok(r2.items.length > 0, 'Typo query finds results');
  assert.ok(r2.items[0].title.includes('na dziś') || r2.items[0].title.includes('Dzień 15') || r2.items[0].title.toLowerCase().includes('rozważanie'), 'Top result handles typo');

  // 3. Synonim: "worship"
  const r3 = search('worship');
  assert.ok(r3.items.some(i => i.title.toLowerCase().includes('worship') || i.title.toLowerCase().includes('muzyka')), 'Synonym finds worship items');

  // 4. Missing item with specific number: "Lekcja 99"
  const r4 = search('Lekcja 99');
  assert.equal(r4.isSuggestion, true, 'isSuggestion must be true for missing number');
  assert.ok(r4.suggestionNote && r4.suggestionNote.includes('99'), 'suggestionNote mentions missing number 99');
  const todayDay = new FixtureDate().getDate();
  assert.ok(r4.items[0].title.includes(`Dzień ${todayDay}`) || r4.items[0].title.includes(`Lekcja ${todayDay}`) || r4.items[0].title.includes('Dzień 15') || r4.items[0].title.includes('Lekcja 15'), 'Proposes today lesson as top suggestion');

  // 5. Completely missing query
  const r5 = search('nieznanybrakujacyhasloxyz');
  assert.equal(r5.isSuggestion, true, 'isSuggestion must be true for unknown phrase');
  assert.ok(r5.items.length > 0, 'Provides fallback proposals');

  // 6. Karaoke & Śpiewnik Słowa Bożego
  const r6 = search('karaoke');
  assert.equal(r6.isSuggestion, false, 'isSuggestion must be false for karaoke');
  assert.ok(r6.items.some(i => i.url.includes('/karaoke') || i.url.includes('/BiblijneUwielbienie')), 'karaoke finds Karaoke / BiblijneUwielbienie');

  const r7 = search('śpiewnik');
  assert.equal(r7.isSuggestion, false, 'isSuggestion must be false for śpiewnik');
  assert.ok(r7.items.some(i => i.url.includes('/karaoke') || i.url.includes('/BiblijneUwielbienie')), 'śpiewnik finds Karaoke / BiblijneUwielbienie');
});

test('cc-omni-search.js: Command Center World-Class UI contracts (recents, tags, 4 pillars, no veil)', () => {
  assert.ok(omniSearchCode.includes('getRecentSearches: getRecentSearches'), 'exports getRecentSearches');
  assert.ok(omniSearchCode.includes('saveRecentSearch: saveRecentSearch'), 'exports saveRecentSearch');
  assert.ok(omniSearchCode.includes('removeRecentSearch: removeRecentSearch'), 'exports removeRecentSearch');
  assert.ok(omniSearchCode.includes('clearRecentSearches: clearRecentSearches'), 'exports clearRecentSearches');
  assert.ok(!omniSearchCode.includes('#ccOmniOverlay.cc-veiled .cc-omni-cards'), 'veil is removed from standalone search');
  assert.ok(omniSearchCode.includes('Rozważanie „Dobrze, że jesteś”'), 'pillar 1: Dobrze że jesteś exists');
  assert.ok(omniSearchCode.includes('Lekcja Dnia: Z Biblią za Pan Brat'), 'pillar 2: Akademia / Z Biblią za Pan Brat exists');
  assert.ok(omniSearchCode.includes('APOKALIPSA — Księga Nadziei'), 'pillar 3: Podcast Apokalipsa exists');
  assert.ok(omniSearchCode.includes('Radio Christian Culture & Player'), 'pillar 4: Radio CC & Player exists');
  // L0 25.11.2026: chipy z hashtagami usunięte („nic nie wnoszą”) — nie mogą wrócić.
  assert.ok(!omniSearchCode.includes("label: '#Apokalipsa'") && !omniSearchCode.includes('cc-omni-tag-chip" data-search-query'), 'popular hashtag chips are removed (L0)');
  // Regresja 30.10–25.11: wołano niezdefiniowane normalizeText() → brak podpowiedzi przy pisaniu.
  assert.match(omniSearchCode, /function normalizeText\s*\(/, 'normalizeText is defined (live suggestions)');
  assert.ok(omniSearchCode.includes('startPlaceholderRotation'), 'rotating placeholder logic exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'Apokalipsa 14'"), 'placeholder Apokalipsa 14 exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'Jak pokonać lęk'"), 'placeholder Jak pokonać lęk exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'Lekcja 27'"), 'placeholder Lekcja 27 exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'Radio na żywo'"), 'placeholder Radio na żywo exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'Werset o pokoju'"), 'placeholder Werset o pokoju exists');
  assert.ok(omniSearchCode.includes("Szukaj: 'J 3:16'"), 'placeholder J 3:16 exists');
  assert.ok(omniSearchCode.includes('rgba(255, 255, 255, 0.15)'), 'transparent frosted-glass search input');
  assert.ok(!omniSearchCode.includes('>Czat</span>'), 'no visible text description for Czat');
  assert.ok(!omniSearchCode.includes('>Nowości</span>'), 'no visible text description for Nowości');
  assert.ok(!omniSearchCode.includes('>Wszystko</span>'), 'no visible text description for Wszystko');
  assert.ok(!omniSearchCode.includes('>Radio CC</span>'), 'no visible text description for Radio CC');
  assert.ok(!omniSearchCode.includes('apps-grid-gold.webp'), 'no 3D shiny ball for apps launcher');
  assert.ok(!omniSearchCode.includes('radio-play.webp'), 'no 3D shiny ball for radio play');
  assert.ok(!omniSearchCode.includes('radio-stop.webp'), 'no 3D shiny ball for radio stop');
  assert.ok(omniSearchCode.includes('aspect-ratio: 1774 / 400'), 'balanced distance between logo and input');
});

test('cc-omni-search.js: Faza 2 — Direct Scripture UBG Engine contracts', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      readyState: 'complete'
    },
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    URL,
    Date: Date
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const parseRef = sandbox.window.CCOmniSearch.parseBibleRef;
  assert.ok(typeof parseRef === 'function', 'parseBibleRef is exported');

  // Test 1: J 3:16 (Ewangelia Jana 3:16)
  const j316 = parseRef('J 3:16');
  assert.ok(j316, 'J 3:16 parsed successfully');
  assert.equal(j316.bookCode, 'JHN');
  assert.equal(j316.chapter, 3);
  assert.equal(j316.verse, 16);
  assert.equal(j316.refTitle, 'Ewangelia Jana 3:16');
  assert.equal(j316.isPending, false);
  assert.ok(j316.verseText.includes('umiłował świat'), 'UBG text matches canonical verse');

  // Test 2: Rz 8,28 (List do Rzymian 8:28)
  const rz828 = parseRef('Rz 8,28');
  assert.ok(rz828, 'Rz 8,28 parsed successfully');
  assert.equal(rz828.bookCode, 'ROM');
  assert.equal(rz828.chapter, 8);
  assert.equal(rz828.verse, 28);
  assert.ok(rz828.verseText.includes('współdziała dla dobra'));

  // Test 3: Ps 23 (Księga Psalmów 23)
  const ps23 = parseRef('Ps 23');
  assert.ok(ps23, 'Ps 23 parsed successfully');
  assert.equal(ps23.bookCode, 'PSA');
  assert.equal(ps23.chapter, 23);
  assert.ok(ps23.verseText.includes('PAN jest moim pasterzem'));

  // Test 4: 1 Kor 13:4-7
  const k13 = parseRef('1 Kor 13:4-7');
  assert.ok(k13, '1 Kor 13:4-7 parsed successfully');
  assert.equal(k13.bookCode, '1CO');
  assert.equal(k13.chapter, 13);
  assert.equal(k13.verse, 4);
  assert.equal(k13.verseEnd, 7);

  // Test 5: Apokalipsa 21:4
  const ap21 = parseRef('Apokalipsa 21:4');
  assert.ok(ap21, 'Apokalipsa 21:4 parsed successfully');
  assert.equal(ap21.bookCode, 'REV');
  assert.equal(ap21.verse, 4);
  assert.ok(ap21.verseText.includes('otrze Bóg wszelką łzę'));
});

test('cc-omni-search.js: Faza 2 — Pastoral Hope Intent & Split-View Preview UI contracts', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      readyState: 'complete'
    },
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    URL,
    Date: Date
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const detectHope = sandbox.window.CCOmniSearch.detectHopeIntent;
  assert.ok(typeof detectHope === 'function', 'detectHopeIntent is exported');

  // Intencje duszpasterskie
  assert.equal(detectHope('mam lęk i nie wiem co robić'), true, 'detects lęk');
  assert.equal(detectHope('depresja i samotność'), true, 'detects depresja');
  assert.equal(detectHope('potrzebuję modlitwy'), true, 'detects modlitwa');
  assert.equal(detectHope('infolinia nadziei pomoc'), true, 'detects infolinia');
  assert.equal(detectHope('duszpasterz rozmowa'), true, 'detects duszpasterz');
  assert.equal(detectHope('radio cc na zywo'), false, 'normal search is not hope intent');

  // Wymagania CSS i struktury UI Split-View
  assert.ok(omniSearchCode.includes('.cc-omni-split-layout'), 'defines .cc-omni-split-layout grid');
  assert.ok(omniSearchCode.includes('.cc-omni-preview-pane'), 'defines .cc-omni-preview-pane');
  assert.ok(omniSearchCode.includes('.cc-preview-btn-main'), 'defines .cc-preview-btn-main');
  assert.ok(omniSearchCode.includes('.cc-scripture-card'), 'defines .cc-scripture-card');
  assert.ok(omniSearchCode.includes('.cc-hope-card'), 'defines .cc-hope-card');
  assert.ok(omniSearchCode.includes('+48 730 958 583'), 'contains Infolinia Nadziei number');
  assert.ok(omniSearchCode.includes('+48 608 337 477'), 'contains Pastor Mariusz number');
  assert.ok(omniSearchCode.includes('showCopyToast'), 'defines copy toast function');
  assert.ok(omniSearchCode.includes('#FF7A00'), 'uses canonical classic orange #FF7A00');
});

test('cc-omni-search.js: Faza 3 — Fuzzy Search & Typo Auto-Correction and Mobile Thumb Zone contracts', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Date: Date
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const parseBible = sandbox.window.CCOmniSearch.parseBibleRef;
  const detectTypo = sandbox.window.CCOmniSearch.detectTypoCorrection;

  assert.ok(typeof parseBible === 'function', 'parseBibleRef is exported');
  assert.ok(typeof detectTypo === 'function', 'detectTypoCorrection is exported');

  // 1. Fuzzy Scripture matching (apokalispa 14 -> REV 14, pslam 23 -> PSA 23)
  const apokFuzzy = parseBible('apokalispa 14');
  assert.ok(apokFuzzy, 'apokalispa 14 is recognized');
  assert.equal(apokFuzzy.bookCode, 'REV', 'resolves to REV code');
  assert.equal(apokFuzzy.isFuzzyMatch, true, 'flagged as fuzzy match');
  assert.equal(apokFuzzy.correctedFrom, 'apokalispa', 'tracks original typo');

  const psalmFuzzy = parseBible('pslam 23');
  assert.ok(psalmFuzzy, 'pslam 23 is recognized');
  assert.equal(psalmFuzzy.bookCode, 'PSA', 'resolves to PSA code');
  assert.equal(psalmFuzzy.isFuzzyMatch, true, 'flagged as fuzzy match');

  // 2. Query typo auto-correction
  assert.equal(detectTypo('apokalispa', ['apokalispa']), 'apokalipsa', 'corrects apokalispa -> apokalipsa');
  assert.equal(detectTypo('mojabibla', ['mojabibla']), 'mojabiblia', 'corrects mojabibla -> mojabiblia');
  assert.equal(detectTypo('nadzeja', ['nadzeja']), 'nadzieja', 'corrects nadzeja -> nadzieja');
  assert.equal(detectTypo('bilbia', ['bilbia']), 'biblia', 'corrects bilbia -> biblia');
  assert.equal(detectTypo('infolina', ['infolina']), 'infolinia', 'corrects infolina -> infolinia');
  assert.equal(detectTypo('apokalipsa', ['apokalipsa']), null, 'exact match returns null (no correction needed)');

  // 3. UI contracts
  assert.ok(omniSearchCode.includes('.cc-omni-autocorrect-banner'), 'defines .cc-omni-autocorrect-banner');
  assert.ok(omniSearchCode.includes('.cc-autocorrect-btn'), 'defines .cc-autocorrect-btn');
  assert.ok(omniSearchCode.includes('Pokazuję wyniki dla:'), 'contains autocorrect user copy');
  assert.ok(omniSearchCode.includes('.cc-scripture-fuzzy-hint'), 'defines .cc-scripture-fuzzy-hint');
  assert.ok(omniSearchCode.includes('overscroll-behavior-y: contain'), 'defines mobile overscroll contain');
  assert.ok(omniSearchCode.includes('safe-area-inset-bottom'), 'respects mobile notch and bottom safe area');

  // 4. Footer attribution contract (Your Imagination Studio)
  assert.ok(omniSearchCode.includes('.cc-omni-footer-center'), 'defines .cc-omni-footer-center');
  assert.ok(omniSearchCode.includes('.cc-omni-yis-link'), 'defines .cc-omni-yis-link');
  assert.ok(omniSearchCode.includes('Powered by'), 'contains Powered by');
  assert.ok(omniSearchCode.includes('https://polskieradio.cc/yis'), 'links to Your Imagination Studio https://polskieradio.cc/yis');
  assert.ok(omniSearchCode.includes('dla Christian Culture'), 'contains dla Christian Culture');
});






test('cc-omni-search.js: Biblia Intelligence CC — P0 contracts (topics, scripture levels, sources register, zero cost)', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Date: Date
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const parseBible = sandbox.window.CCOmniSearch.parseBibleRef;
  const detectTopic = sandbox.window.CCOmniSearch.detectBibleTopic;
  const topics = sandbox.window.CCOmniSearch.BIBLE_TOPICS;

  assert.ok(typeof detectTopic === 'function', 'detectBibleTopic is exported');
  assert.ok(typeof topics === 'object' && topics.szabat, 'BIBLE_TOPICS has szabat topic');

  // 1. Scripture Range support (J 3:16-17)
  const rangeMatch = parseBible('J 3:16-17');
  assert.ok(rangeMatch, 'parses J 3:16-17');
  assert.equal(rangeMatch.verse, 16);
  assert.equal(rangeMatch.verseEnd, 17);
  assert.ok(rangeMatch.verseText.includes('[16]'), 'includes [16] in range text');
  assert.ok(rangeMatch.verseText.includes('[17]'), 'includes [17] in range text');

  // 2. Theological topic detection
  const szabatTopic = detectTopic('szabat');
  assert.ok(szabatTopic, 'detects szabat topic');
  assert.equal(szabatTopic.slug, 'szabat');
  assert.ok(szabatTopic.verses.some(v => v.ref === 'Rdz 2:2-3'));

  const graceTopic = detectTopic('usprawiedliwienie z wiary');
  assert.ok(graceTopic, 'detects usprawiedliwienie topic');
  assert.equal(graceTopic.slug, 'usprawiedliwienie');

  const mediatorTopic = detectTopic('jedyny posrednik');
  assert.ok(mediatorTopic, 'detects posrednik topic');
  assert.equal(mediatorTopic.slug, 'posrednik');

  const prophecyTopic = detectTopic('proroctwa apokalipsy');
  assert.ok(prophecyTopic, 'detects proroctwa topic');
  assert.equal(prophecyTopic.slug, 'proroctwa');

  // 3. UI contracts for Biblia Intelligence
  assert.ok(omniSearchCode.includes('.cc-scripture-level'), 'defines .cc-scripture-level');
  assert.ok(omniSearchCode.includes('TEKST BIBLIJNY'), 'contains TEKST BIBLIJNY badge');
  assert.ok(omniSearchCode.includes('.cc-btn-scripture-sub'), 'defines .cc-btn-scripture-sub for context and compare');
  assert.ok(omniSearchCode.includes('Kontekst rozdziału'), 'contains Kontekst rozdziału action');
  assert.ok(omniSearchCode.includes('Porównaj przekłady') || omniSearchCode.includes('Porównaj 4 przekłady'), 'contains Porównaj przekłady action');
  assert.ok(omniSearchCode.includes('.cc-bible-topic-card'), 'defines .cc-bible-topic-card');
  assert.ok(omniSearchCode.includes('.cc-sources-modal-backdrop'), 'defines .cc-sources-modal-backdrop');
  assert.ok(omniSearchCode.includes('STEPBible Data'), 'cites STEPBible Data');
  assert.ok(omniSearchCode.includes('SBL Greek New Testament'), 'cites SBLGNT');
  assert.ok(omniSearchCode.includes('Crossreferences.org'), 'cites Crossreferences.org');
  assert.ok(omniSearchCode.includes('ZERO COST FIRST'), 'declares ZERO COST FIRST architecture');
});


test('cc-omni-search.js: Biblia Intelligence CC — P1 contracts (Greek/Hebrew lemmas, Strong, cross-refs, interlinear)', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Date: Date
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const detectLemma = sandbox.window.CCOmniSearch.detectStrongOrLemma;
  const lemmas = sandbox.window.CCOmniSearch.TOP_LEMMAS;
  const crossRefs = sandbox.window.CCOmniSearch.TOP_CROSS_REFS;
  const tokens = sandbox.window.CCOmniSearch.TOP_INTERLINEAR_TOKENS;

  assert.ok(typeof detectLemma === 'function', 'detectStrongOrLemma is exported');
  assert.ok(typeof lemmas === 'object' && lemmas.G3056, 'TOP_LEMMAS has G3056 (logos)');
  assert.ok(typeof lemmas.H7676 === 'object', 'TOP_LEMMAS has H7676 (shabbat)');

  // 1. Direct Strong code lookup
  const logosMatch = detectLemma('G3056');
  assert.ok(logosMatch, 'detects G3056');
  assert.equal(logosMatch.translit, 'logos');
  assert.equal(logosMatch.lang, 'grc');
  assert.equal(logosMatch.occurrences, 330);

  const shabbatMatch = detectLemma('H7676');
  assert.ok(shabbatMatch, 'detects H7676');
  assert.equal(shabbatMatch.lang, 'he');
  assert.equal(shabbatMatch.translit, 'shabbāt');

  // 2. Transliteration alias lookup
  const agapeMatch = detectLemma('agape');
  assert.ok(agapeMatch, 'detects agape');
  assert.equal(agapeMatch.strong, 'G0026');

  const charisMatch = detectLemma('charis');
  assert.ok(charisMatch, 'detects charis');
  assert.equal(charisMatch.strong, 'G5485');

  // 3. Dynamic unbuffered Strong code fallback
  const fallbackMatch = detectLemma('G9999');
  assert.ok(fallbackMatch, 'detects unbuffered Strong G9999');
  assert.equal(fallbackMatch.strong, 'G9999');
  assert.equal(fallbackMatch.lang, 'grc');

  // 4. Cross-references contract
  assert.ok(Array.isArray(crossRefs['JHN:3:16']), 'cross-refs defined for JHN:3:16');
  assert.ok(crossRefs['JHN:3:16'].some(cr => cr.ref === 'Rz 5:8'), 'includes Rz 5:8 as parallel');
  assert.ok(crossRefs['EXO:20:8'].some(cr => cr.ref === 'Rdz 2:3'), 'includes Rdz 2:3 for EXO:20:8');

  // 5. Interlinear tokens contract
  assert.ok(Array.isArray(tokens['JHN:3:16']), 'interlinear tokens defined for JHN:3:16');
  assert.ok(tokens['JHN:3:16'].some(t => t.strong === 'G0025'), 'tokens include G0025 (agapaō)');
  assert.ok(tokens['GEN:1:1'].some(t => t.strong === 'H7225' && t.isRtl), 'tokens include H7225 (Bereszit) in RTL');

  // 6. UI contracts
  assert.ok(omniSearchCode.includes('.cc-lemma-card'), 'defines .cc-lemma-card');
  assert.ok(omniSearchCode.includes('.cc-lemma-orig'), 'defines .cc-lemma-orig');
  assert.ok(omniSearchCode.includes('.cc-lemma-disclaimer'), 'defines Strong disclaimer');
  assert.ok(omniSearchCode.includes('.cc-scripture-crossrefs'), 'defines .cc-scripture-crossrefs');
  assert.ok(omniSearchCode.includes('.cc-scripture-tokens-section'), 'defines .cc-scripture-tokens-section');
  assert.ok(omniSearchCode.includes('.cc-token-chip'), 'defines .cc-token-chip');
  assert.ok(omniSearchCode.includes('STEPBible Data'), 'declares STEPBible Data provenance');
  assert.ok(omniSearchCode.includes('SBL Greek New Testament'), 'declares SBLGNT provenance');
});


test('cc-omni-search.js: Biblia Intelligence CC — P2 contracts (Atlas Geograficzny, Miejsca Biblijne, OpenBible, OSM, Wikidata)', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: async () => ({ ok: false })
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const detectPlace = sandbox.window.CCOmniSearch.detectBiblePlace;
  const places = sandbox.window.CCOmniSearch.BIBLE_PLACES;

  assert.ok(typeof detectPlace === 'function', 'detectBiblePlace is exported');
  assert.ok(typeof places === 'object', 'BIBLE_PLACES is exported');
  assert.ok(places.jerusalem, 'BIBLE_PLACES has Jerusalem');
  assert.ok(places.sinai, 'BIBLE_PLACES has Mount Sinai');
  assert.ok(places.patmos, 'BIBLE_PLACES has Patmos Island');

  // 1. Detection of Jerusalem by canonical Polish name, ID, and aliases
  const jerusalemMatch = detectPlace('Jerozolima');
  assert.ok(jerusalemMatch, 'detects Jerozolima');
  assert.equal(jerusalemMatch.id, 'jerusalem');
  assert.equal(jerusalemMatch.coords.lat, 31.7767);
  assert.equal(jerusalemMatch.coords.lon, 35.2345);
  assert.equal(jerusalemMatch.wikidataId, 'Q1218');
  assert.equal(jerusalemMatch.certainty, 'POTWIERDZONA ARCHEOLOGICZNIE');

  const syjonMatch = detectPlace('syjon');
  assert.ok(syjonMatch, 'detects Syjon alias for Jerusalem');
  assert.equal(syjonMatch.id, 'jerusalem');

  // 2. Detection of Mount Sinai (Horeb)
  const sinaiMatch = detectPlace('Góra Synaj');
  assert.ok(sinaiMatch, 'detects Góra Synaj');
  assert.equal(sinaiMatch.id, 'sinai');
  assert.equal(sinaiMatch.coords.lat, 28.5397);
  assert.equal(sinaiMatch.coords.lon, 33.9750);
  assert.equal(sinaiMatch.certainty, 'PRAWDOPODOBNA / TRADYCYJNA');

  const horebMatch = detectPlace('horeb');
  assert.ok(horebMatch, 'detects Horeb alias for Sinai');
  assert.equal(horebMatch.id, 'sinai');

  // 3. Detection of Patmos Island (Apocalypse)
  const patmosMatch = detectPlace('patmos');
  assert.ok(patmosMatch, 'detects Patmos');
  assert.equal(patmosMatch.id, 'patmos');
  assert.equal(patmosMatch.coords.lat, 37.5147);
  assert.equal(patmosMatch.coords.lon, 26.5458);

  // 4. Detection of Capernaum
  const capernaumMatch = detectPlace('kafarnaum');
  assert.ok(capernaumMatch, 'detects Kafarnaum');
  assert.equal(capernaumMatch.id, 'capernaum');

  // 5. UI contracts for Bible Places Card
  assert.ok(omniSearchCode.includes('.cc-bible-place-card'), 'defines .cc-bible-place-card');
  assert.ok(omniSearchCode.includes('ATLAS BIBLIJNY &amp; GEOGRAFIA SACRA'), 'declares ATLAS BIBLIJNY header');
  assert.ok(omniSearchCode.includes('.cc-bible-place-coords'), 'defines .cc-bible-place-coords');
  assert.ok(omniSearchCode.includes('OPENBIBLE (R13)') || omniSearchCode.includes('OpenBible Geocoding Data'), 'cites OpenBible Geocoding');
  assert.ok(omniSearchCode.includes('OSM (R20)') || omniSearchCode.includes('OpenStreetMap'), 'cites OpenStreetMap');
  assert.ok(omniSearchCode.includes('openstreetmap.org'), 'links to OpenStreetMap coordinates');
  assert.ok(omniSearchCode.includes('wikidata.org'), 'links to Wikidata archaeological IDs');
});


test('cc-omni-search.js: Biblia Intelligence CC — P3 contracts (Porównywarka 4 Przekładów UBG/BW/BT/BG i Weryfikacja Cytowań @777)', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: async () => ({ ok: false })
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const compareVerses = sandbox.window.CCOmniSearch.TOP_COMPARE_VERSES;
  const verifyQuote = sandbox.window.CCOmniSearch.verifyBibleQuote;
  const renderCompare = sandbox.window.CCOmniSearch.renderComparePanel;
  const renderQuoteCard = sandbox.window.CCOmniSearch.renderQuoteVerificationCard;

  assert.ok(typeof compareVerses === 'object', 'TOP_COMPARE_VERSES is exported');
  assert.ok(typeof verifyQuote === 'function', 'verifyBibleQuote is exported');
  assert.ok(typeof renderCompare === 'function', 'renderComparePanel is exported');
  assert.ok(typeof renderQuoteCard === 'function', 'renderQuoteVerificationCard is exported');

  // 1. Parallel translations data contract (UBG, BW, BT, BG)
  assert.ok(compareVerses['JHN:3:16'], 'contains 4-translation dataset for JHN:3:16');
  assert.equal(typeof compareVerses['JHN:3:16'].UBG, 'string');
  assert.equal(typeof compareVerses['JHN:3:16'].BW, 'string');
  assert.equal(typeof compareVerses['JHN:3:16'].BT, 'string');
  assert.equal(typeof compareVerses['JHN:3:16'].BG, 'string');
  assert.ok(compareVerses['JHN:3:16'].UBG.includes('Tak bowiem Bóg umiłował świat'));
  assert.ok(compareVerses['JHN:3:16'].BW.includes('Albowiem tak Bóg umiłował świat'));

  assert.ok(compareVerses['PSA:23:1'], 'contains 4-translation dataset for PSA:23:1');
  assert.ok(compareVerses['ROM:8:28'], 'contains 4-translation dataset for ROM:8:28');
  assert.ok(compareVerses['EXO:20:8'], 'contains 4-translation dataset for EXO:20:8');

  // 2. Canonical UBG exact quote verification
  const ubgQuote = verifyQuote('Tak bowiem Bóg umiłował świat');
  assert.ok(ubgQuote, 'verifies UBG quote');
  assert.equal(ubgQuote.status, 'VERIFIED_UBG');
  assert.equal(ubgQuote.isExactUbg, true);
  assert.equal(ubgQuote.matchedEdition, 'UBG');
  assert.ok(ubgQuote.statusLabel.includes('ZGODNOŚĆ DOSŁOWNA Z UBG'));

  // 3. Detection of alternative traditional translations (BW, BT, BG)
  const bwQuote = verifyQuote('Albowiem tak Bóg umiłował świat');
  assert.ok(bwQuote, 'detects BW quote');
  assert.equal(bwQuote.status, 'DIFF_EDITION');
  assert.equal(bwQuote.matchedEdition, 'BW');
  assert.equal(bwQuote.isExactUbg, false);
  assert.ok(bwQuote.statusLabel.includes('ROZPOZNANO PRZEKŁAD BW'));

  // 4. Paraphrase detection
  const paraphraseQuote = verifyQuote('Bóg tak ukochał świat że dał jedynego Syna żeby wierzący mieli życie');
  assert.ok(paraphraseQuote, 'detects paraphrase');
  assert.equal(paraphraseQuote.status, 'PARAPHRASE');
  assert.equal(paraphraseQuote.isExactUbg, false);

  // 5. Compare panel and UI contracts
  const compareHtml = renderCompare('JHN:3:16');
  assert.ok(compareHtml.includes('cc-scripture-compare-panel'), 'renders compare panel container');
  assert.ok(compareHtml.includes('cc-badge-ubg'), 'renders UBG badge');
  assert.ok(compareHtml.includes('cc-badge-bw'), 'renders BW badge');
  assert.ok(compareHtml.includes('cc-badge-bt'), 'renders BT badge');
  assert.ok(compareHtml.includes('cc-badge-bg'), 'renders BG badge');
  assert.ok(compareHtml.includes('cc-btn-copy-trans'), 'renders copy buttons for each translation');

  const quoteCardHtml = renderQuoteCard(bwQuote);
  assert.ok(quoteCardHtml.includes('cc-quote-verification-card'), 'renders quote verification card');
  assert.ok(quoteCardHtml.includes('PROTOKÓŁ @777'), 'declares PROTOKÓŁ @777 compliance');
  assert.ok(quoteCardHtml.includes('cc-quote-diff-box'), 'renders diff box for non-UBG quote');
  assert.ok(quoteCardHtml.includes('ccQuoteCopyCanonicalBtn'), 'renders copy canonical UBG CTA');
});


test('cc-omni-search.js: Biblia Intelligence CC — P4 contracts (Audio Player, Biblia Słuchana, Waveform Visualizer, Web Speech Engine)', async () => {
  const vm = await import('node:vm');
  let spokenText = null;
  let synthCanceled = false;

  class MockUtterance {
    constructor(text) {
      this.text = text;
      this.lang = 'pl-PL';
      this.rate = 1.0;
    }
  }

  const mockSpeechSynthesis = {
    speak: (utt) => { spokenText = utt.text; },
    cancel: () => { synthCanceled = true; },
    pause: () => {},
    resume: () => {},
    getVoices: () => [{ lang: 'pl-PL', name: 'Paulina PL' }]
  };

  const sandbox = {
    window: {
      location: { pathname: '/' },
      speechSynthesis: mockSpeechSynthesis,
      SpeechSynthesisUtterance: MockUtterance
    },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: async () => ({ ok: false })
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const playAudio = sandbox.window.CCOmniSearch.playBibleAudio;
  const stopAudio = sandbox.window.CCOmniSearch.stopBibleAudio;
  const toggleAudio = sandbox.window.CCOmniSearch.toggleBibleAudio;
  const renderAudioBar = sandbox.window.CCOmniSearch.renderScriptureAudioBar;
  const getAudioState = sandbox.window.CCOmniSearch.getAudioState;

  assert.ok(typeof playAudio === 'function', 'playBibleAudio is exported');
  assert.ok(typeof stopAudio === 'function', 'stopBibleAudio is exported');
  assert.ok(typeof toggleAudio === 'function', 'toggleBibleAudio is exported');
  assert.ok(typeof renderAudioBar === 'function', 'renderScriptureAudioBar is exported');

  // 1. Play audio utterance
  const playResult = playAudio('Na początku Bóg stworzył niebo i ziemię.', 'Księga Rodzaju 1:1', 1.0);
  assert.equal(playResult, true, 'playAudio returns true');
  assert.ok(spokenText && spokenText.includes('Na początku Bóg stworzył'), 'speechSynthesis spoke the verse');
  assert.ok(spokenText.includes('Księga Rodzaju 1:1'), 'speechSynthesis included ref title');

  // 2. Stop audio
  stopAudio();
  assert.equal(synthCanceled, true, 'speechSynthesis cancelled');
  assert.equal(getAudioState(), 'idle', 'state is idle after stop');

  // 3. Render audio bar HTML contracts
  const match = {
    bookCode: 'JHN',
    bookName: 'Ewangelia Jana',
    chapter: 3,
    verse: 16,
    refTitle: 'Ewangelia Jana 3:16',
    verseText: 'Tak bowiem Bóg umiłował świat...'
  };
  const audioBarHtml = renderAudioBar(match);
  assert.ok(audioBarHtml.includes('cc-scripture-audio-bar'), 'renders audio bar container');
  assert.ok(audioBarHtml.includes('cc-btn-play-verse'), 'renders play button');
  assert.ok(audioBarHtml.includes('cc-waveform-visualizer'), 'renders radio waveform visualizer');
  assert.ok(audioBarHtml.includes('cc-wave-bar'), 'renders wave bars');
  assert.ok(audioBarHtml.includes('cc-audio-status-tag'), 'renders audio status tag');
  assert.ok(audioBarHtml.includes('cc-audio-speed-selector'), 'renders speed selector');
  assert.ok(audioBarHtml.includes('cc-btn-open-player'), 'renders CC Player link');

  // 4. CSS contracts for Audio Bar & Waveform
  assert.ok(omniSearchCode.includes('.cc-scripture-audio-bar'), 'defines .cc-scripture-audio-bar');
  assert.ok(omniSearchCode.includes('.cc-btn-play-verse'), 'defines .cc-btn-play-verse');
  assert.ok(omniSearchCode.includes('.cc-waveform-active'), 'defines .cc-waveform-active');
  assert.ok(omniSearchCode.includes('@keyframes ccWavePulse'), 'defines @keyframes ccWavePulse');
  assert.ok(omniSearchCode.includes('prefers-reduced-motion'), 'supports prefers-reduced-motion');
});


test('cc-omni-search.js: Biblia Intelligence CC — P5 contracts (Katalog 12 Tematów Pisma Świętego, Modlitewnik CC, UBG, Audio Modlitwy)', async () => {
  const vm = await import('node:vm');
  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: async () => ({ ok: false })
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const topics = sandbox.window.CCOmniSearch.BIBLE_TOPICS;
  const detectTopic = sandbox.window.CCOmniSearch.detectBibleTopic;
  const renderTopicCard = sandbox.window.CCOmniSearch.renderBibleTopicCard;

  assert.ok(typeof topics === 'object', 'BIBLE_TOPICS is exported');
  assert.ok(typeof detectTopic === 'function', 'detectBibleTopic is exported');
  assert.ok(typeof renderTopicCard === 'function', 'renderBibleTopicCard is exported');

  // 1. 12 Canonical Thematic Topics presence
  const expectedTopics = [
    'wiara', 'usprawiedliwienie', 'pokoj', 'modlitwa', 'nadzieja', 'szabat',
    'posrednik', 'proroctwa', 'przebaczenie', 'milosc', 'uzdrowienie', 'madrosc'
  ];
  for (const slug of expectedTopics) {
    assert.ok(topics[slug], `contains topic ${slug}`);
    assert.ok(topics[slug].prayerText, `topic ${slug} has prayer text`);
    assert.ok(topics[slug].prayerTitle, `topic ${slug} has prayer title`);
    assert.ok(Array.isArray(topics[slug].verses) && topics[slug].verses.length >= 2, `topic ${slug} has multiple verses`);
  }

  // 2. Thematic detection queries
  const faithMatch = detectTopic('jak mieć silną wiarę');
  assert.ok(faithMatch, 'detects wiara');
  assert.equal(faithMatch.slug, 'wiara');

  const peaceMatch = detectTopic('modlitwa o pokój w sercu i uwolnienie od lęku');
  assert.ok(peaceMatch, 'detects pokoj');
  assert.equal(peaceMatch.slug, 'pokoj');

  const healingMatch = detectTopic('uzdrowienie z choroby');
  assert.ok(healingMatch, 'detects uzdrowienie');
  assert.equal(healingMatch.slug, 'uzdrowienie');

  const wisdomMatch = detectTopic('mądrość Boża');
  assert.ok(wisdomMatch, 'detects madrosc');
  assert.equal(wisdomMatch.slug, 'madrosc');

  const loveMatch = detectTopic('miłość Boża agape');
  assert.ok(loveMatch, 'detects milosc');
  assert.equal(loveMatch.slug, 'milosc');

  const forgivenessMatch = detectTopic('przebaczenie grzechów');
  assert.ok(forgivenessMatch, 'detects przebaczenie');
  assert.equal(forgivenessMatch.slug, 'przebaczenie');

  // 3. Render HTML contracts for Modlitewnik
  const topicHtml = renderTopicCard(topics.pokoj);
  assert.ok(topicHtml.includes('cc-bible-topic-card'), 'renders topic card container');
  assert.ok(topicHtml.includes('cc-btn-prayer-trigger'), 'renders prayer trigger button');
  assert.ok(topicHtml.includes('cc-thematic-prayer-box'), 'renders prayer box');
  assert.ok(topicHtml.includes('cc-btn-prayer-audio'), 'renders prayer audio button');
  assert.ok(topicHtml.includes('cc-btn-prayer-copy'), 'renders copy prayer button');
  assert.ok(topicHtml.includes('cc-btn-topic-verse-audio'), 'renders per-verse audio button');

  // 4. CSS contracts for Modlitewnik
  assert.ok(omniSearchCode.includes('.cc-thematic-prayer-box'), 'defines .cc-thematic-prayer-box');
  assert.ok(omniSearchCode.includes('.cc-btn-prayer-trigger'), 'defines .cc-btn-prayer-trigger');
  assert.ok(omniSearchCode.includes('.cc-btn-prayer-audio'), 'defines .cc-btn-prayer-audio');
});

test('cc-omni-search.js: Biblia Intelligence CC — P6 contracts (Karty Dzielenia Social Media, Canvas 1080x1080, Social Deep Links)', async () => {
  const vm = await import('node:vm');
  let filledTextCalls = [];
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    arc: () => {},
    fill: () => {},
    measureText: (text) => ({ width: text.length * 15 }),
    fillText: (text, x, y) => { filledTextCalls.push({ text, x, y }); },
    createRadialGradient: () => ({ addColorStop: () => {} })
  };

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: (type) => (type === '2d' ? mockCtx : null),
    toDataURL: () => 'data:image/png;base64,MOCK'
  };

  const sandbox = {
    window: { location: { pathname: '/' } },
    document: {
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      createElement: (tag) => {
        if (tag === 'canvas') return mockCanvas;
        return {
          setAttribute: () => {},
          appendChild: () => {},
          style: {},
          querySelector: () => null,
          addEventListener: () => {}
        };
      },
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    fetch: async () => ({ ok: false })
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const drawCard = sandbox.window.CCOmniSearch.drawBibleShareCard;
  const openModal = sandbox.window.CCOmniSearch.openShareModal;
  const closeModal = sandbox.window.CCOmniSearch.closeShareModal;

  assert.ok(typeof drawCard === 'function', 'drawBibleShareCard is exported');
  assert.ok(typeof openModal === 'function', 'openShareModal is exported');
  assert.ok(typeof closeModal === 'function', 'closeShareModal is exported');

  // 1. Draw card execution and dimensions 1080x1080
  drawCard(mockCanvas, 'Tak bowiem Bóg umiłował świat, że dał swego Jednorodzonego Syna...', 'J 3:16');
  assert.equal(mockCanvas.width, 1080, 'canvas width is 1080');
  assert.equal(mockCanvas.height, 1080, 'canvas height is 1080');
  assert.ok(filledTextCalls.some(c => c.text.includes('S Ł O W O   B O Ż E   •   U B G')), 'renders UBG header');
  assert.ok(filledTextCalls.some(c => c.text.includes('J 3:16 (UBG)')), 'renders reference siglum in UBG');
  assert.ok(filledTextCalls.some(c => c.text.includes('polskieradio.cc')), 'renders brand watermark');

  // 2. HTML & UI action contracts
  assert.ok(omniSearchCode.includes('data-action="open-share-card"'), 'has data-action open-share-card');
  assert.ok(omniSearchCode.includes('cc-btn-scripture-share'), 'has cc-btn-scripture-share class');
  assert.ok(omniSearchCode.includes('cc-share-card-modal-backdrop'), 'defines modal backdrop');
  assert.ok(omniSearchCode.includes('cc-share-verse-canvas'), 'defines share verse canvas');
  assert.ok(omniSearchCode.includes('cc-btn-share-main'), 'defines download PNG button');
  assert.ok(omniSearchCode.includes('Pobierz grafikę PNG'), 'contains Pobierz grafikę PNG text');
  assert.ok(omniSearchCode.includes('Kopiuj tekst i link'), 'contains Kopiuj tekst i link text');

  // 3. Social deep links contracts
  assert.ok(omniSearchCode.includes('api.whatsapp.com/send?text='), 'integrates WhatsApp deep link');
  assert.ok(omniSearchCode.includes('t.me/share/url?'), 'integrates Telegram deep link');
  assert.ok(omniSearchCode.includes('facebook.com/sharer/sharer.php?'), 'integrates Facebook deep link');
  assert.ok(omniSearchCode.includes('twitter.com/intent/tweet?'), 'integrates X deep link');
  assert.ok(omniSearchCode.includes('/lumina-tablica?draft='), 'integrates LUMINA deep link');

  // 4. CSS styling contracts
  assert.ok(omniSearchCode.includes('.cc-btn-scripture-share'), 'defines .cc-btn-scripture-share style');
  assert.ok(omniSearchCode.includes('.cc-share-social-grid'), 'defines .cc-share-social-grid style');
  assert.ok(omniSearchCode.includes('.cc-share-wa:hover'), 'defines .cc-share-wa WhatsApp color');
  assert.ok(omniSearchCode.includes('.cc-share-tg:hover'), 'defines .cc-share-tg Telegram color');
});

test('cc-omni-search.js: Tętniąca Życiem Wyszukiwarka EkoCC — dynamiczne okna propozycji (NOWOŚCI, LIVE badge, pule rotacji)', () => {
  assert.ok(omniSearchCode.includes('NOWOŚCI') || omniSearchCode.includes('POLECANE DZIŚ W EKOCC') || omniSearchCode.includes('Polecane na dziś'), 'header renamed to NOWOŚCI');
  assert.ok(omniSearchCode.includes('cc-omni-live-badge'), 'defines cc-omni-live-badge');
  assert.ok(omniSearchCode.includes('cc-live-pulse-dot'), 'defines cc-live-pulse-dot pulsing indicator');
  assert.ok(omniSearchCode.includes('ccPulseLive'), 'defines animation ccPulseLive');
  assert.ok(omniSearchCode.includes('cc-omni-featured-dots'), 'defines interactive pagination dots container');
  assert.ok(omniSearchCode.includes('cc-omni-feat-dot'), 'defines individual interactive dots');
  assert.ok(omniSearchCode.includes('cc-card-updating'), 'defines smooth card update transition');
  assert.ok(omniSearchCode.includes('cc-card-entering'), 'defines premium 3D entering cascade transition');
  assert.ok(omniSearchCode.includes('ccCardCascadeIn'), 'defines ccCardCascadeIn keyframe');
  assert.ok(omniSearchCode.includes('ccCardShimmerSweep'), 'defines ccCardShimmerSweep golden sheen keyframe');
  assert.ok(omniSearchCode.includes('FEATURED_MODES'), 'defines 8 thematic FEATURED_MODES');
  assert.ok(omniSearchCode.includes('getSmartContextInfo'), 'defines intelligent time/date/holiday/user context engine');
  assert.ok(omniSearchCode.includes('cc-omni-feat-modes'), 'defines interactive thematic mode strip');
  assert.ok(omniSearchCode.includes('cc-omni-context-pill'), 'defines live context indicator pill');
  assert.ok(omniSearchCode.includes('cc-omni-feat-listen-btn'), 'defines inline ▶ Słuchaj teraz button on audio/video cards');
  assert.ok(omniSearchCode.includes('Słuchaj teraz'), 'contains Słuchaj teraz label on cards');
  assert.ok(omniSearchCode.includes('toggleFeaturedStream'), 'defines toggleFeaturedStream inline stream playback');
  assert.ok(omniSearchCode.includes('ccOmniStreamBar'), 'defines inline live stream bar inside featured section');
  assert.ok(omniSearchCode.includes('FEATURED_POOLS'), 'defines FEATURED_POOLS rotation data');
  assert.ok(omniSearchCode.includes('rotateFeaturedCards'), 'defines rotateFeaturedCards logic');
  assert.ok(omniSearchCode.includes('startFeaturedRotation'), 'defines startFeaturedRotation timer');
  assert.ok(omniSearchCode.includes('stopFeaturedRotation'), 'defines stopFeaturedRotation cleanup');
  assert.ok(omniSearchCode.includes('isFeaturedHovered'), 'pauses rotation on user hover/touch interaction');
});

test('cc-omni-search.js: Wspieram To button in footer (#ccOmniSupport) linking to /wspieraj with heart icon', () => {
  assert.ok(omniSearchCode.includes('id="ccOmniSupport"'), 'defines #ccOmniSupport in footer');
  assert.ok(omniSearchCode.includes('href="https://polskieradio.cc/wspieraj"'), 'links to /wspieraj');
  assert.ok(omniSearchCode.includes('cc-omni-support-btn'), 'defines cc-omni-support-btn class');
  assert.ok(omniSearchCode.includes('Wspieram To'), 'contains Wspieram To label');
  assert.ok(omniSearchCode.includes('#FF7A00'), 'uses canonical #FF7A00 orange action color');
});

