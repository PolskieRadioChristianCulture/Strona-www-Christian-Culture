// =========================================================================
// AI DLA JEZUSA — CC CONNECT 2.0 & CC BIBLE SCHOLAR PLUGIN REGISTRY
// Architektura Sola Scriptura • ZERO COST FIRST • License & Permission Gate
// =========================================================================

export const CC_BIBLE_SCHOLAR_CATEGORIES = Object.freeze([
  { id: 'original-languages', code: 'A', name: 'Języki oryginalne & leksyka', description: 'Strong, morfologia, Greka NT, Hebrajski ST, interlinia' },
  { id: 'cross-refs-analysis', code: 'B', name: 'Odsyłacze & analiza tekstu', description: 'Odsyłacze OpenBible (CC BY), konkordancja UBG, porównywarka' },
  { id: 'historical-geo', code: 'C', name: 'Kontekst historyczno-geograficzny', description: 'Atlas, chronologia, zwyczaje, prosopografia, archeologia' },
  { id: 'commentaries-theology', code: 'D', name: 'Komentarze & teologia', description: 'Komentarze otwarte, teologia systematyczna, hermeneutyka biblijna' },
  { id: 'methodology-application', code: 'E', name: 'Metodyka & zastosowanie', description: '6 pytań, 12 pytań, hermeneutyka, zastosowanie życiowe' },
  { id: 'cc-integration-export', code: 'F', name: 'Integracja CC & eksport', description: 'Plany czytania, Głębokie studium (/sba/studium/), notatki, eksport' }
]);

const LEGACY_APP_PLUGINS = [
  Object.freeze({
    id: 'scroll-bible',
    version: '1.1.0',
    name: 'Scrolluj Biblię (SBA)',
    shortName: 'Scrolluj Biblię',
    category: 'Biblia & Tekst',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: ['ubg-2025'],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['bible', 'study'],
    surfaces: ['ai', 'lumimes', 'sba', 'mcp'],
    icon: '📖',
    url: 'https://polskieradio.cc/sba',
    authMode: 'open',
    defaultConnected: true,
    description: 'Pionowe czytanie Uwspółcześnionej Biblii Gdańskiej (UBG), audio zsynchronizowane z wersetem i warsztat Głębokie studium.',
    tools: ['cc_bible_get_verse', 'cc_bible_get_chapter', 'cc_bible_get_context', 'cc_sba_deep_study'],
    samplePrompt: 'Otwórz Jan 3:16 i wskaż kontekst w Scrolluj Biblię'
  }),
  Object.freeze({
    id: 'mojabiblia',
    version: '1.1.0',
    name: 'MojaBiblia Interlinearna',
    shortName: 'MojaBiblia',
    category: 'Biblia & Tekst',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: ['ubg-2025', 'step-mojabiblia-interlinear'],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['bible', 'study'],
    surfaces: ['ai', 'lumimes', 'sba', 'mcp'],
    icon: '📜',
    url: 'https://polskieradio.cc/mojabiblia',
    authMode: 'open',
    defaultConnected: true,
    description: 'Greka, hebrajski, kody Stronga i weryfikowany tekst UBG.',
    tools: ['cc_bible_get_verse', 'cc_find_scripture', 'cc_bible_lexicon_lookup'],
    samplePrompt: 'Sprawdź znaczenie słowa agape (G0026) w MojaBiblia i porównaj z 1 Kor 13'
  }),
  Object.freeze({
    id: 'akademia',
    version: '1.0.0',
    name: 'Akademia Biblijna & Kurs Codzienny',
    shortName: 'Akademia',
    category: 'Nauczanie',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: ['cc-scholar-study-methods'],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['study'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '🎓',
    url: 'https://polskieradio.cc/akademia',
    authMode: 'open',
    defaultConnected: true,
    description: 'Codzienne lekcje kursu Z Biblią za Pan Brat, kazania i uporządkowana ścieżka studiów.',
    tools: ['cc_find_sermon', 'cc_search', 'cc_topics'],
    samplePrompt: 'Znajdź dzisiejszą lekcję Kursu Codziennego w Akademii Biblijnej'
  }),
  Object.freeze({
    id: 'biblia-audio',
    version: '1.0.0',
    name: 'Biblia Audio 24/7',
    shortName: 'Biblia Audio',
    category: 'Audio & Radio',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: ['ubg-2025'],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['media', 'bible'],
    surfaces: ['ai', 'lumimes', 'sba', 'mcp'],
    icon: '🎧',
    url: 'https://polskieradio.cc/biblia-audio',
    authMode: 'open',
    defaultConnected: true,
    description: 'Katalog słuchowisk Księgi Rodzaju, Księgi Wyjścia i odtwarzacz audio na żywo.',
    tools: ['cc_find_audio_bible', 'cc_search'],
    samplePrompt: 'Odtwórz lub wskaż nagrania Biblia Audio z Księgi Wyjścia'
  }),
  Object.freeze({
    id: 'spiritual-sounds',
    version: '1.0.0',
    name: 'Spiritual Sounds CC',
    shortName: 'Spiritual Sounds',
    category: 'Audio & Radio',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['media'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '🎵',
    url: 'https://polskieradio.cc/SpiritualSounds',
    authMode: 'open',
    defaultConnected: true,
    description: 'Chrześcijańska muzyka uwielbieniowa, ambient modlitewny, Biblia Śpiewana i psalmy audio.',
    tools: ['cc_find_audio_bible', 'cc_search'],
    samplePrompt: 'Poleć spokojną muzykę z Spiritual Sounds do modlitwy i studium Psalmu 23'
  }),
  Object.freeze({
    id: 'radio-247',
    version: '1.0.0',
    name: 'Polskie Radio Christian Culture 24/7',
    shortName: 'Radio 24/7',
    category: 'Audio & Radio',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['media'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '📻',
    url: 'https://polskieradio.cc/player',
    authMode: 'open',
    defaultConnected: true,
    description: 'Strumień radiowy 24/7, bieżące audycje i szybkie przejście do odtwarzacza.',
    tools: ['cc_search', 'cc_get_source'],
    samplePrompt: 'Co teraz gra i gdzie mogę włączyć Radio Christian Culture 24/7?'
  }),
  Object.freeze({
    id: 'ccn-news',
    version: '1.0.0',
    name: 'CCN News & Portale Tematyczne',
    shortName: 'CCN News',
    category: 'Publikacje & Wiedza',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['news'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '📰',
    url: 'https://polskieradio.cc/news',
    authMode: 'open',
    defaultConnected: true,
    description: 'Artykuły Christian Culture News, nauka, historia, biologia i komentarz biblijny.',
    tools: ['cc_search', 'cc_get_document'],
    samplePrompt: 'Wyszukaj artykuły CCN News o archeologii biblijnej i historii'
  }),
  Object.freeze({
    id: 'vod',
    version: '1.0.0',
    name: 'Kino Chrześcijańskie VOD',
    shortName: 'VOD',
    category: 'Wideo & Media',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['media'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '🎬',
    url: 'https://polskieradio.cc/vod',
    authMode: 'open',
    defaultConnected: false,
    description: 'Katalog filmów fabularnych, wykładów wideo i transmisji Christian Culture.',
    tools: ['cc_search', 'cc_find_sermon'],
    samplePrompt: 'Jakie filmy lub wykłady biblijne polecasz teraz na Christian Culture VOD?'
  }),
  Object.freeze({
    id: 'lumina',
    version: '1.0.0',
    name: 'LUMINA Społeczność',
    shortName: 'LUMINA',
    category: 'Społeczność',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['community'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '✨',
    url: 'https://polskieradio.cc/lumina',
    authMode: 'open',
    defaultConnected: true,
    description: 'Publiczne wpisy, profile twórców misji oraz wspólna przestrzeń społeczności wiary.',
    tools: ['cc_search'],
    samplePrompt: 'Pokaż jak dołączyć i korzystać ze społeczności LUMINA'
  }),
  Object.freeze({
    id: 'lumi-chat',
    version: '1.0.0',
    name: 'LumiMes — Asystent Społeczności',
    shortName: 'LumiMes',
    category: 'Społeczność',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['community', 'study'],
    surfaces: ['ai', 'lumimes'],
    icon: '💬',
    url: 'https://polskieradio.cc/mess',
    authMode: 'open',
    defaultConnected: true,
    description: 'Asystenci Rut, Lea, Noemi i Miriam zintegrowani z pływającym widżetem i narzędziami CC Bible Scholar.',
    tools: ['cc_search', 'cc_bible_lexicon_lookup', 'cc_bible_cross_references', 'cc_bible_study_questions'],
    samplePrompt: 'Pomóż mi napisać serdeczne zaproszenie do wspólnego czytania Pisma Świętego'
  }),
  Object.freeze({
    id: 'wizytowki',
    version: '1.0.0',
    name: 'Wizytówki CC & Rekomendacje',
    shortName: 'Wizytówki',
    category: 'Ekosystem & Zasięg',
    scholarCategory: null,
    priority: 'P2',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['community'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '🪪',
    url: 'https://polskieradio.cc/wizytowki',
    authMode: 'open',
    defaultConnected: false,
    description: 'Katalog dzieł, kanałów i rekomendowanych projektów chrześcijańskich.',
    tools: ['cc_search'],
    samplePrompt: 'Wyszukaj sprawdzone chrześcijańskie dzieła w Wizytówkach CC'
  }),
  Object.freeze({
    id: 'canva',
    version: '1.0.0',
    name: 'Canva (Konto Użytkownika OAuth)',
    shortName: 'Canva',
    category: 'Kreacja & Grafika',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['user:external_connect'],
    contexts: ['creative'],
    surfaces: ['ai'],
    icon: '🎨',
    url: 'https://polskieradio.cc/ai/aplikacja',
    authMode: 'oauth',
    defaultConnected: false,
    description: 'Opcjonalne połączenie OAuth z Twoim własnym kontem Canva: lista projektów i eksport szkicu.',
    tools: ['canva_brief', 'canva_designs'],
    samplePrompt: 'Przygotuj brief do grafiki z wersetem dnia i zapisz szkic w mojej Canvie'
  }),
  Object.freeze({
    id: 'holos',
    version: '1.0.0',
    name: 'HOLOS / Ekosystem CC (Mapa & Centrum)',
    shortName: 'Mapa CC',
    category: 'Ekosystem & Zasięg',
    scholarCategory: null,
    priority: 'P1',
    availability: 'ready',
    costPolicy: 'no-unapproved-cost',
    licenseGate: 'approved',
    datasets: [],
    dependencies: [],
    permissions: ['read:public_catalog'],
    contexts: ['navigation'],
    surfaces: ['ai', 'lumimes', 'mcp'],
    icon: '🌐',
    url: 'https://polskieradio.cc/mapa',
    authMode: 'open',
    defaultConnected: true,
    description: 'Interaktywna mapa wszystkich modułów Christian Culture, radia, telewizji i aplikacji.',
    tools: ['cc_search', 'cc_topics'],
    samplePrompt: 'Pokaż pełną mapę usług i kanałów w ekosystemie Christian Culture'
  })
];

function scholarPlugin(spec) {
  return Object.freeze({
    version: '1.0.0',
    category: 'CC Bible Scholar',
    costPolicy: 'no-unapproved-cost',
    authMode: 'open',
    icon: '📘',
    url: 'https://polskieradio.cc/test/bible-scholar/',
    dependencies: [],
    datasets: [],
    tools: [],
    permissions: ['read:scholar_public'],
    contexts: ['bible', 'study'],
    surfaces: ['ai', 'lumimes', 'sba', 'mcp'],
    defaultConnected: spec.availability === 'ready',
    ...spec
  });
}

// 40 wtyczek CC Bible Scholar — uczciwy status wykonawczy:
// ready = w pełni wdrożona logika serwerowa + zweryfikowana licencja + dane w repozytorium
// planned = zaplanowana do Etap 4 (dane wymagają importu / audytu licencyjnego)
export const CC_BIBLE_SCHOLAR_PLUGINS = Object.freeze([
  // === A. JĘZYKI ORYGINALNE & LEKSYKA (9) ===
  scholarPlugin({
    id: 'strongs',
    name: 'Słownik Stronga (G/H + STEP)',
    shortName: 'Strong G/H',
    scholarCategory: 'original-languages',
    priority: 'P1',
    availability: 'ready',
    datasets: ['step-mojabiblia-interlinear'],
    tools: ['cc_bible_lexicon_lookup', 'cc_bible_token_analysis'],
    icon: '🔤',
    description: 'Wyszukiwanie kodów Stronga (G/H) z polską definicją, transliteracją, wymową i jawnym rozdzieleniem kodów rozszerzonych STEP (autoGenerated).',
    licenseGate: 'approved',
    samplePrompt: 'Wyjaśnij kod Stronga G3056 (logos) oraz hebrajski H7225 (bereszit)'
  }),
  scholarPlugin({
    id: 'morphology',
    name: 'Analiza Morfologiczna (Greka/Hebrajski)',
    shortName: 'Morfologia',
    scholarCategory: 'original-languages',
    priority: 'P1',
    availability: 'ready',
    dependencies: ['strongs'],
    datasets: ['step-mojabiblia-interlinear'],
    tools: ['cc_bible_token_analysis'],
    icon: '🧩',
    description: 'Rozbiór gramatyczny tokenów werset po wersecie (czas, tryb, przypadek, forma źródłowa) na bazie warstwy interlinearnej MojaBiblia.',
    licenseGate: 'approved',
    samplePrompt: 'Pokaż analizę morfologiczną wersetu J 1:1 słowo po słowie'
  }),
  scholarPlugin({
    id: 'greek-nt',
    name: 'Grecki Nowy Testament (Koine)',
    shortName: 'Greka NT',
    scholarCategory: 'original-languages',
    priority: 'P1',
    availability: 'ready',
    dependencies: ['strongs'],
    datasets: ['step-mojabiblia-interlinear', 'ubg-2025'],
    tools: ['cc_bible_token_analysis', 'cc_bible_compare_editions'],
    icon: '🇬🇷',
    description: 'Tekst oryginalny Nowego Testamentu z lematyzacją, transliteracją i zestawieniem z polskim przekładem UBG.',
    licenseGate: 'approved',
    samplePrompt: 'Pokaż grecki tekst i glosy polskie dla J 3:16'
  }),
  scholarPlugin({
    id: 'hebrew-bible',
    name: 'Hebrajski i Aramejski ST (Tekst Masorecki)',
    shortName: 'Hebrajski ST',
    scholarCategory: 'original-languages',
    priority: 'P1',
    availability: 'ready',
    dependencies: ['strongs'],
    datasets: ['step-mojabiblia-interlinear', 'ubg-2025'],
    tools: ['cc_bible_token_analysis', 'cc_bible_compare_editions'],
    icon: '🕎',
    description: 'Analiza Starego Testamentu z obsługą RTL, oznaczeniem sekcji aramejskich (np. Dn 2–7) i kodami Stronga.',
    licenseGate: 'approved',
    samplePrompt: 'Przeanalizuj hebrajsko-aramejski tekst Daniela 2:4 (dir=rtl)'
  }),
  scholarPlugin({
    id: 'lxx-septuagint',
    name: 'Septuaginta (LXX Swete)',
    shortName: 'Septuaginta LXX',
    scholarCategory: 'original-languages',
    priority: 'P2',
    availability: 'planned',
    datasets: ['lxx-swete'],
    icon: '📜',
    description: 'Planowany moduł porównawczy greckiej Septuaginty (Swete CC BY 4.0) z cytatami w Nowym Testamencie.',
    licenseGate: 'pending_import',
    samplePrompt: 'Porównaj Ps 22 z LXX i Mt 27'
  }),
  scholarPlugin({
    id: 'interlinear',
    name: 'Interlinia Słowo po Słowie',
    shortName: 'Interlinia',
    scholarCategory: 'original-languages',
    priority: 'P1',
    availability: 'ready',
    dependencies: ['strongs', 'morphology'],
    datasets: ['step-mojabiblia-interlinear', 'ubg-2025'],
    tools: ['cc_bible_token_analysis'],
    icon: '📑',
    description: 'Zestawienie każdego tokenu oryginału z transliteracją, kodem Stronga i polskim odpowiednikiem.',
    licenseGate: 'approved',
    samplePrompt: 'Rozpisz interlinię dla Rdz 1:1'
  }),
  scholarPlugin({
    id: 'semantic-domains',
    name: 'Domeny Semantyczne (UBS)',
    shortName: 'Domeny UBS',
    scholarCategory: 'original-languages',
    priority: 'P3',
    availability: 'planned',
    datasets: ['ubs-dictionary-lxx'],
    icon: '🕸️',
    description: 'Planowane mapowanie pól znaczeniowych słów biblijnych po zakończeniu audytu licencji UBS.',
    licenseGate: 'pending_license_audit'
  }),
  scholarPlugin({
    id: 'lexicons',
    name: 'Rozszerzone Leksykony Akademickie',
    shortName: 'Leksykony',
    scholarCategory: 'original-languages',
    priority: 'P3',
    availability: 'planned',
    dependencies: ['strongs'],
    datasets: ['ubs-dictionary-lxx'],
    icon: '📚',
    description: 'Planowane słowniki teologiczne i klasyczne leksykony (Abbott-Smith / BDB / UBS) po imporcie z atrybucją.',
    licenseGate: 'pending_license_audit'
  }),
  scholarPlugin({
    id: 'textual-criticism',
    name: 'Aparat Krytyki Tekstu (SBLGNT)',
    shortName: 'Krytyka tekstu',
    scholarCategory: 'original-languages',
    priority: 'P3',
    availability: 'planned',
    datasets: ['sblgnt'],
    icon: '🔬',
    description: 'Planowane zestawienie wariantów rękopisów Nowego Testamentu z pełną atrybucją SBLGNT (CC BY 4.0).',
    licenseGate: 'pending_import'
  }),

  // === B. ODSYŁACZE & ANALIZA TEKSTU (8) ===
  scholarPlugin({
    id: 'cross-references',
    name: 'Odsyłacze Biblijne (OpenBible CC BY)',
    shortName: 'Odsyłacze',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P1',
    availability: 'ready',
    datasets: ['openbible-cross-references'],
    tools: ['cc_bible_cross_references'],
    icon: '🔗',
    description: 'Ponad 344 tys. odsyłaczy biblijnych z OpenBible.info (CC BY 4.0) posortowanych według trafności (Votes), sharded per księga.',
    licenseGate: 'approved',
    samplePrompt: 'Pokaż najważniejsze odsyłacze biblijne dla Rz 8:28 i J 3:16'
  }),
  scholarPlugin({
    id: 'parallel-passages',
    name: 'Synopsa & Fragmenty Równoległe',
    shortName: 'Równoległe',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P2',
    availability: 'planned',
    dependencies: ['cross-references'],
    datasets: ['aquifer-biblical-knowledge'],
    icon: '⚖️',
    description: 'Planowana synopsa czterech Ewangelii oraz Królów/Kronik.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'polish-concordance',
    name: 'Konkordancja Polska UBG',
    shortName: 'Konkordancja UBG',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P1',
    availability: 'ready',
    datasets: ['ubg-2025'],
    tools: ['cc_bible_concordance', 'cc_bible_search'],
    icon: '🔍',
    description: 'Pełnotekstowa, stronicowana konkordancja Uwspółcześnionej Biblii Gdańskiej (31 212 wersetów) z dokładną liczbą wystąpień.',
    licenseGate: 'approved',
    samplePrompt: 'Wyszukaj wszystkie wystąpienia słowa "miłość" w UBG z podziałem na strony'
  }),
  scholarPlugin({
    id: 'translation-compare',
    name: 'Porównywarka Wydań & Oryginału',
    shortName: 'Porównywarka',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P1',
    availability: 'ready',
    datasets: ['ubg-2025', 'step-mojabiblia-interlinear'],
    tools: ['cc_bible_compare_editions'],
    icon: '📑',
    description: 'Porównanie UBG z warstwą oryginału (STEP); niezweryfikowane pola BW/BT/BG są jawnie oznaczane i blokowane przed fałszywym porównaniem.',
    licenseGate: 'approved',
    samplePrompt: 'Porównaj Ps 23:1 w UBG z warstwą hebrajską i sprawdź status innych przekładów'
  }),
  scholarPlugin({
    id: 'discourse-analysis',
    name: 'Analiza Dyskursu i Struktury Argumentu',
    shortName: 'Analiza dyskursu',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P2',
    availability: 'planned',
    dependencies: ['morphology'],
    datasets: ['cc-scholar-study-methods'],
    icon: '📐',
    description: 'Planowane rozbijanie perykop na zdania główne, spójniki logiczne i przebieg myśli autora.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'literary-genre',
    name: 'Gatunek Literacki & Kontekst Formy',
    shortName: 'Gatunek literacki',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P2',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '🎭',
    description: 'Planowane rozpoznawanie gatunku (poezja hebrajska, list, apokaliptyka, przypowieść, prawo).',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'chiasm-detector',
    name: 'Struktury Chiastyczne & Paralelizmy',
    shortName: 'Chiazmy',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P3',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '🔀',
    description: 'Planowane wykrywanie symetrii ABBA i paralelizmu członów w Psalmach i Listach.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'ot-in-nt',
    name: 'Cytaty ST w Nowym Testamencie',
    shortName: 'ST w NT',
    scholarCategory: 'cross-refs-analysis',
    priority: 'P2',
    availability: 'planned',
    dependencies: ['cross-references'],
    datasets: ['openbible-cross-references'],
    icon: '🔁',
    description: 'Planowany indeks bezpośrednich cytatów i aluzji ze Starego Testamentu w Nowym Testamencie.',
    licenseGate: 'planned'
  }),

  // === C. KONTEKST HISTORYCZNO-GEOGRAFICZNY (6) ===
  scholarPlugin({
    id: 'bible-atlas',
    name: 'Atlas Biblijny & Miejsca (Theographic)',
    shortName: 'Atlas biblijny',
    scholarCategory: 'historical-geo',
    priority: 'P2',
    availability: 'planned',
    datasets: ['theographic-bible-metadata'],
    icon: '🗺️',
    description: 'Planowany atlas miast, rzek i krain biblijnych z koordynatami z otwartego zbioru Theographic.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'timeline',
    name: 'Chronologia i Linia Czasu',
    shortName: 'Chronologia',
    scholarCategory: 'historical-geo',
    priority: 'P2',
    availability: 'planned',
    datasets: ['theographic-bible-metadata'],
    icon: '⏳',
    description: 'Planowana chronologia wydarzeń biblijnych, królów i proroków.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'ancient-customs',
    name: 'Zwyczaje i Kultura Starożytna',
    shortName: 'Kultura i zwyczaje',
    scholarCategory: 'historical-geo',
    priority: 'P2',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '🏺',
    description: 'Planowany opis realiów społecznych, świąt, miar i wag biblijnych.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'people-prosopography',
    name: 'Postacie Biblijne (Prosopografia)',
    shortName: 'Postacie',
    scholarCategory: 'historical-geo',
    priority: 'P2',
    availability: 'planned',
    datasets: ['theographic-bible-metadata'],
    icon: '👥',
    description: 'Planowany katalog ponad 3 000 osób biblijnych, genealogii i powiązań.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'archaeology',
    name: 'Odkrycia Archeologiczne',
    shortName: 'Archeologia',
    scholarCategory: 'historical-geo',
    priority: 'P3',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '🏛️',
    description: 'Planowane noty o inskrypcjach i wykopaliskach potwierdzających tło biblijne.',
    licenseGate: 'pending_import'
  }),
  scholarPlugin({
    id: 'second-temple',
    name: 'Okres Drugiej Świątyni',
    shortName: 'Druga Świątynia',
    scholarCategory: 'historical-geo',
    priority: 'P3',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '🕊️',
    description: 'Planowane tło historyczne okresu międzytestamentalnego i Qumran.',
    licenseGate: 'pending_import'
  }),

  // === D. KOMENTARZE & TEOLOGIA (5) ===
  scholarPlugin({
    id: 'public-commentaries',
    name: 'Komentarze Domeny Publicznej (Audytowane)',
    shortName: 'Komentarze PD',
    scholarCategory: 'commentaries-theology',
    priority: 'P2',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '📖',
    description: 'Planowane otwarte komentarze biblijne (CC BY-SA / Public Domain) po weryfikacji zgodności z Sola Scriptura.',
    licenseGate: 'pending_license_audit'
  }),
  scholarPlugin({
    id: 'church-fathers',
    name: 'Pisma Wczesnochrześcijańskie',
    shortName: 'Kanon wczesny',
    scholarCategory: 'commentaries-theology',
    priority: 'P3',
    availability: 'planned',
    datasets: ['aquifer-biblical-knowledge'],
    icon: '🕯️',
    description: 'Planowane historyczne świadectwa interpretacji pierwszych wieków z wyraźnym oddzieleniem tradycji od Pisma.',
    licenseGate: 'pending_license_audit'
  }),
  scholarPlugin({
    id: 'systematic-theology',
    name: 'Wątki Teologii Systematycznej',
    shortName: 'Teologia',
    scholarCategory: 'commentaries-theology',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '⛪',
    description: 'Planowany indeks tematów wiary oparty na całym kanonie Pisma Świętego.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'apologetics',
    name: 'Apologetyka Biblijna',
    shortName: 'Apologetyka',
    scholarCategory: 'commentaries-theology',
    priority: 'P3',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '🛡️',
    description: 'Planowane odpowiedzi na trudne pytania tekstu biblijnego i harmonizacja pozornych napięć.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'adventist-hermeneutics',
    name: 'Hermeneutyka Biblijna & Proroctwa CC',
    shortName: 'Hermeneutyka CC',
    scholarCategory: 'commentaries-theology',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '📜',
    description: 'Planowane narzędzie zasad Sola Scriptura, typologii i ciągłości historyczno-proroczej (Dn/Ap).',
    licenseGate: 'planned'
  }),

  // === E. METODYKA & APLIKACJA (6) ===
  scholarPlugin({
    id: 'six-questions',
    name: 'Metoda 6 Pytań Obserwacyjnych',
    shortName: '6 Pytań',
    scholarCategory: 'methodology-application',
    priority: 'P1',
    availability: 'ready',
    datasets: ['cc-scholar-study-methods', 'ubg-2025'],
    tools: ['cc_bible_study_questions', 'cc_bible_study_template'],
    icon: '6️⃣',
    description: 'Sześć fundamentalnych pytań obserwacji tekstu (Kto? Co? Kiedy? Gdzie? Dlaczego? Jak?) połączonych z /sba/studium/.',
    licenseGate: 'approved',
    samplePrompt: 'Wygeneruj warsztat 6 pytań obserwacyjnych dla Flp 4:6-7'
  }),
  scholarPlugin({
    id: 'twelve-questions',
    name: 'Metoda 12 Pytań Odkrywania Prawdy',
    shortName: '12 Pytań',
    scholarCategory: 'methodology-application',
    priority: 'P1',
    availability: 'ready',
    dependencies: ['six-questions'],
    datasets: ['cc-scholar-study-methods', 'ubg-2025'],
    tools: ['cc_bible_study_questions', 'cc_bible_study_template'],
    icon: '🧭',
    description: 'Dwanaście pogłębionych pytań egzegetycznych o naturę Boga, człowieka, grzech, obietnicę i posłuszeństwo.',
    licenseGate: 'approved',
    samplePrompt: 'Przygotuj zestaw 12 pytań do fragmentu Rz 12:1-2'
  }),
  scholarPlugin({
    id: 'hermeneutics',
    name: 'Zasady Hermeneutyki & Kręgi Kontekstu',
    shortName: 'Hermeneutyka',
    scholarCategory: 'methodology-application',
    priority: 'P1',
    availability: 'ready',
    datasets: ['cc-scholar-study-methods', 'ubg-2025'],
    tools: ['cc_bible_study_questions', 'cc_bible_study_template', 'cc_bible_mind_map_seed'],
    icon: '🔭',
    description: 'Kontekst bliski, księga, autor i cały kanon biblijny plus seed mapy myśli gotowy do /sba/studium/.',
    licenseGate: 'approved',
    samplePrompt: 'Przeprowadź analizę kręgów kontekstu dla Ef 2:8-10'
  }),
  scholarPlugin({
    id: 'life-application',
    name: 'Zastosowanie Życiowe (Słowo w Czyn)',
    shortName: 'Zastosowanie',
    scholarCategory: 'methodology-application',
    priority: 'P1',
    availability: 'ready',
    datasets: ['cc-scholar-study-methods', 'ubg-2025'],
    tools: ['cc_bible_study_questions', 'cc_bible_study_template'],
    icon: '🌱',
    description: 'Praktyczny plan posłuszeństwa Słowu Bożemu na dziś: modlitwa, relacje, krok działania.',
    licenseGate: 'approved',
    samplePrompt: 'Pomóż zastosować Ps 23:1-3 w dzisiejszym dniu'
  }),
  scholarPlugin({
    id: 'memory-verses',
    name: 'Zapamiętywanie Wersetów (SRS)',
    shortName: 'Pamięć wersetów',
    scholarCategory: 'methodology-application',
    priority: 'P2',
    availability: 'planned',
    datasets: ['ubg-2025'],
    icon: '🧠',
    description: 'Planowany system powtórek interwałowych wybranych wersetów UBG.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'sermon-prep',
    name: 'Asystent Szkicu Kazania / Rozważania',
    shortName: 'Szkic kazania',
    scholarCategory: 'methodology-application',
    priority: 'P2',
    availability: 'planned',
    dependencies: ['hermeneutics', 'cross-references'],
    datasets: ['cc-scholar-study-methods'],
    icon: '🎙️',
    description: 'Planowany kreator homiletyczny łączący egzegezę, strukturę i zastosowanie.',
    licenseGate: 'planned'
  }),

  // === F. INTEGRACJA CC & EKSPORT (6) ===
  scholarPlugin({
    id: 'reading-plans',
    name: 'Plany Czytania Pisma Świętego',
    shortName: 'Plany czytania',
    scholarCategory: 'cc-integration-export',
    priority: 'P2',
    availability: 'planned',
    datasets: ['ubg-2025'],
    icon: '📅',
    description: 'Planowane roczne i tematyczne plany lektury Biblii zsynchronizowane z Scrolluj Biblię.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'family-devotion',
    name: 'Ołtarz Rodzinny & Studium Domowe',
    shortName: 'Studium rodzinne',
    scholarCategory: 'cc-integration-export',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '🏡',
    description: 'Planowane krótkie scenariusze czytania, rozmowy i modlitwy dla rodzin i dzieci.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'group-study-sync',
    name: 'Małe Grupy Biblijne CC',
    shortName: 'Małe grupy',
    scholarCategory: 'cc-integration-export',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    icon: '🤝',
    description: 'Planowane udostępnianie pytań i konspektów do wspólnego studium w grupie.',
    licenseGate: 'planned'
  }),
  scholarPlugin({
    id: 'deep-study-bridge',
    name: 'Most Głębokie Studium (/sba/studium/)',
    shortName: 'Most Studium',
    scholarCategory: 'cc-integration-export',
    priority: 'P1',
    availability: 'ready',
    datasets: ['cc-scholar-study-methods', 'ubg-2025'],
    tools: ['cc_bible_study_template', 'cc_bible_mind_map_seed', 'cc_sba_deep_study'],
    icon: '🌉',
    url: 'https://polskieradio.cc/sba/studium/',
    description: 'Bezpośredni link i szablony startowe między AI dla Jezusa, LumiMes i 8-etapowym warsztatem /sba/studium/.',
    licenseGate: 'approved',
    samplePrompt: 'Przygotuj szablon Głębokiego studium i mapy myśli dla J 15:1-8'
  }),
  scholarPlugin({
    id: 'personal-journal',
    name: 'Prywatny Dziennik Modlitwy i Notatek',
    shortName: 'Dziennik lokalny',
    scholarCategory: 'cc-integration-export',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    permissions: ['user:private_notes'],
    contexts: ['study'],
    surfaces: ['ai', 'sba'],
    icon: '🔒',
    description: 'Planowane notatki prywatne użytkownika w lokalnej bazie IndexedDB (nigdy nie wysyłane do statycznych plików ani bez zgody).',
    licenseGate: 'approved'
  }),
  scholarPlugin({
    id: 'academic-export',
    name: 'Eksport Markdown / SVG / BibTeX',
    shortName: 'Eksport badawczy',
    scholarCategory: 'cc-integration-export',
    priority: 'P2',
    availability: 'planned',
    datasets: ['cc-scholar-study-methods'],
    permissions: ['export:markdown_bibtex'],
    icon: '📤',
    description: 'Planowany eksport notatek i przypisów źródłowych (CC BY / UBG) w formatach Markdown, JSON i BibTeX.',
    licenseGate: 'planned'
  })
]);

export const CC_PLUGIN_REGISTRY = Object.freeze([
  ...LEGACY_APP_PLUGINS,
  ...CC_BIBLE_SCHOLAR_PLUGINS
]);

export const EXTERNAL_AI_PROVIDERS = Object.freeze([
  Object.freeze({
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI Apps & Connectors',
    protocol: 'Remote MCP + OpenAPI 3.1',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp',
    openapiUrl: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/openapi.json',
    setupNote: 'W Ustawienia → Aplikacje/Złącza → Dodaj własny serwer MCP wklej adres https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp'
  }),
  Object.freeze({
    id: 'claude',
    name: 'Claude / Anthropic Custom Connectors',
    protocol: 'Streamable HTTP / SSE MCP',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp',
    setupNote: 'W Claude Settings → Connectors → Add custom connector podaj https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp'
  }),
  Object.freeze({
    id: 'gemini',
    name: 'Gemini / Google Custom Actions',
    protocol: 'OpenAPI 3.1 REST / MCP Bridge',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/openapi.json',
    setupNote: 'Importuj specyfikację OpenAPI 3.1 jako narzędzie lub połącz klienta MCP z endpointem Christian Culture.'
  }),
  Object.freeze({
    id: 'cursor',
    name: 'Cursor / Windsurf / Antigravity / VS Code',
    protocol: 'mcp.json Remote HTTP',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp',
    setupNote: 'Dodaj serwer "ai-dla-jezusa-cc" z url https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp w pliku mcp.json.'
  })
]);

const TOOL_PLUGIN_OWNERS = new Map();
for (const plugin of CC_PLUGIN_REGISTRY) {
  for (const toolName of plugin.tools || []) {
    if (!TOOL_PLUGIN_OWNERS.has(toolName)) {
      TOOL_PLUGIN_OWNERS.set(toolName, []);
    }
    TOOL_PLUGIN_OWNERS.get(toolName).push(plugin);
  }
}

export function getLegacyAppPlugins() {
  return LEGACY_APP_PLUGINS;
}

export function getScholarPlugins() {
  return CC_BIBLE_SCHOLAR_PLUGINS;
}

export function getAllPlugins() {
  return CC_PLUGIN_REGISTRY;
}

export function getScholarStats() {
  const ready = CC_BIBLE_SCHOLAR_PLUGINS.filter((p) => p.availability === 'ready' && p.licenseGate === 'approved');
  const planned = CC_BIBLE_SCHOLAR_PLUGINS.filter((p) => p.availability !== 'ready' || p.licenseGate !== 'approved');
  return {
    total: CC_BIBLE_SCHOLAR_PLUGINS.length,
    readyCount: ready.length,
    plannedCount: planned.length,
    readyIds: ready.map((p) => p.id),
    plannedIds: planned.map((p) => p.id),
    blockedDatasets: ['mojabiblia-bw-bt-bg-embedded', 'net-bible-notes']
  };
}

export function getPluginManifest(id) {
  const key = String(id || '').trim().toLowerCase();
  return CC_PLUGIN_REGISTRY.find((p) => p.id === key) || null;
}

export function getDefaultConnectedPluginIds() {
  return CC_PLUGIN_REGISTRY.filter((p) => p.defaultConnected && p.availability === 'ready').map((p) => p.id);
}

export function sanitizePluginIds(ids) {
  if (!Array.isArray(ids)) return getDefaultConnectedPluginIds();
  const valid = new Set(CC_PLUGIN_REGISTRY.map((p) => p.id));
  const out = [];
  for (const raw of ids) {
    const id = String(raw || '').trim().toLowerCase();
    if (!valid.has(id) || out.includes(id)) continue;
    const m = getPluginManifest(id);
    if (!m || m.availability !== 'ready' || m.licenseGate !== 'approved') continue;
    out.push(id);
    for (const dep of m.dependencies || []) {
      const depM = getPluginManifest(dep);
      if (depM && depM.availability === 'ready' && depM.licenseGate === 'approved' && !out.includes(dep)) {
        out.push(dep);
      }
    }
  }
  return out;
}

export function resolveScholarPackagePlan(requestedIds = CC_BIBLE_SCHOLAR_PLUGINS.map((p) => p.id)) {
  const requested = Array.isArray(requestedIds) && requestedIds.length
    ? requestedIds.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
    : CC_BIBLE_SCHOLAR_PLUGINS.map((p) => p.id);

  const installable = [];
  const addedDeps = [];
  const skippedPlanned = [];
  const rejected = [];

  for (const id of requested) {
    const plugin = getPluginManifest(id);
    if (!plugin) {
      rejected.push({ id, reason: 'unknown_plugin' });
      continue;
    }
    if (plugin.licenseGate !== 'approved' || plugin.availability !== 'ready') {
      skippedPlanned.push({
        id: plugin.id,
        name: plugin.name,
        availability: plugin.availability,
        licenseGate: plugin.licenseGate,
        datasets: plugin.datasets || []
      });
      continue;
    }
    for (const depId of plugin.dependencies || []) {
      const dep = getPluginManifest(depId);
      if (dep && dep.availability === 'ready' && dep.licenseGate === 'approved' && !installable.includes(depId)) {
        installable.push(depId);
        if (!requested.includes(depId)) {
          addedDeps.push({ plugin: plugin.id, dependency: depId });
        }
      }
    }
    if (!installable.includes(plugin.id)) {
      installable.push(plugin.id);
    }
  }

  return {
    ok: true,
    totalCatalog: CC_BIBLE_SCHOLAR_PLUGINS.length,
    installableCount: installable.length,
    installableIds: installable,
    addedDependencies: addedDeps,
    skippedPlannedCount: skippedPlanned.length,
    skippedPlanned,
    rejected
  };
}

export function isToolAllowedForSession(toolName, activePluginIds = null, opts = {}) {
  const owners = TOOL_PLUGIN_OWNERS.get(toolName) || [];
  if (!owners.length) {
    // Podstawowe narzędzia kanoniczne (cc_search, cc_get_source, cc_get_document, cc_topics, cc_get_source_policy, cc_find_scripture)
    return { allowed: true, reason: 'core_public_tool' };
  }

  const readyOwners = owners.filter((p) => p.availability === 'ready' && p.licenseGate === 'approved');
  if (!readyOwners.length) {
    return {
      allowed: false,
      code: 'LICENSE_OR_PLUGIN_NOT_READY',
      reason: `Narzędzie "${toolName}" wymaga wtyczek w przygotowaniu lub oczekujących na audyt licencji (${owners.map((p) => p.id).join(', ')}).`
    };
  }

  const blockedDataset = opts.datasetId && ['mojabiblia-bw-bt-bg-embedded', 'net-bible-notes'].includes(opts.datasetId);
  if (blockedDataset) {
    return {
      allowed: false,
      code: 'LICENSE_BLOCKED',
      reason: `Zbiór "${opts.datasetId}" jest zablokowany przez bramkę licencyjną CC Bible Scholar.`
    };
  }

  // Jeśli klient nie podał X-CC-Active-Plugins (wywołanie anonimowe / zewnętrzny klient MCP),
  // wszystkie narzędzia gotowych i licencyjnie zatwierdzonych wtyczek publicznych są dostępne do odczytu.
  if (activePluginIds === null || activePluginIds === undefined) {
    return { allowed: true, reason: 'public_ready_tool' };
  }

  const normalizedActive = new Set(Array.isArray(activePluginIds) ? activePluginIds.map((x) => String(x || '').trim().toLowerCase()) : []);
  const matchedOwner = readyOwners.find((p) => normalizedActive.has(p.id));
  if (!matchedOwner) {
    return {
      allowed: false,
      code: 'PLUGIN_NOT_INSTALLED',
      reason: `Wtyczka wymagana dla narzędzia "${toolName}" (${readyOwners.map((p) => p.id).join(' / ')}) nie jest aktywna w tej sesji.`
    };
  }

  for (const depId of matchedOwner.dependencies || []) {
    if (!normalizedActive.has(depId)) {
      return {
        allowed: false,
        code: 'DEPENDENCY_MISSING',
        reason: `Wtyczka "${matchedOwner.id}" wymaga aktywnej zależności "${depId}".`
      };
    }
  }

  return { allowed: true, ownerPlugin: matchedOwner.id };
}
