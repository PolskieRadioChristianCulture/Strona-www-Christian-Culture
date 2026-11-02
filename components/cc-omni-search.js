/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCOmniSearch (@w = wyszukiwarka)
 * Plik: /components/cc-omni-search.js
 * 
 * Centralny silnik inteligentnego wyszukiwania dla całego ekosystemu CC:
 * - Podpina wszystkie lupy, pola wyszukiwania i skrót Ctrl+K / '/' w ekosystemie.
 * - Błyskawiczne sugerowanie (<2ms) już od pierwszej wpisanej litery.
 * - Inteligentne rozpoznawanie kontekstu (Przewodnik Tematyczny Ekosystemu dla
 *   haseł takich jak: nadzieja, werset dnia, modlitwa, lęk, apokalipsa, dekalog itp.).
 * - Posegregowane wyniki w 6 kategoriach zgodnych z architekturą CC:
 *   1. 🌐 Moduły & Platformy
 *   2. 📖 Słowo Boże & Rozważania
 *   3. 📻 Audycje & Muzyka
 *   4. 🎬 Kino VOD & Kanały
 *   5. 📰 Wiedza & Publicystyka
 *   6. 👤 Profile & Społeczność
 * - Ergonomia dotyku min. 44px, wysoki kontrast, zero zewnętrznych zależności,
 *   wsparcie motywu ciemnego i jasnego, 100% Zero-QA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window.CCOmniSearchInitialized) return;
  window.CCOmniSearchInitialized = true;

  // 1. Sprawdzenie czy jesteśmy na dedykowanej stronie /szukaj
  const isSearchPage = /^\/szukaj(?:\/|\.html)?$/i.test(window.location.pathname);
  // Własny adres wyszukiwarki: polskieradio.cc/wyszukiwarka (decyzja L0 26.10.2026) — otwarta na pełnym ekranie
  const isStandalonePage = /^\/wyszukiwarka(?:\/|\.html)?$/i.test(window.location.pathname);

  // 2. Globalny stan wyszukiwarki
  let catalogData = window.__ccSearchCatalog || null;
  let isCatalogLoading = false;
  let activeIndex = -1;
  let currentResults = [];
  let currentQuery = '';
  let activeFilter = 'all';
  // Tryb wyszukiwania: 'cc' (ekosystem Christian Culture) lub 'google' (cały internet) — zapamiętany na urządzeniu (L0 26.10.2026)
  const ENGINE_KEY = 'cc_search_engine';
  let searchEngine = 'cc';
  try { if (localStorage.getItem(ENGINE_KEY) === 'google') searchEngine = 'google'; } catch (_) {}
  const googleUrl = (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q);

  const RECENTS_KEY = 'cc_recent_searches';
  function getRecentSearches() {
    try {
      const list = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
      return (Array.isArray(list) ? list : []).filter(item => typeof item === 'string' && item.trim().length > 0).slice(0, 8);
    } catch (_) {
      return [];
    }
  }
  function saveRecentSearch(query) {
    const q = String(query || '').trim();
    if (!q || q.length < 2) return;
    try {
      const current = getRecentSearches().filter(item => item.toLowerCase() !== q.toLowerCase());
      current.unshift(q);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(current.slice(0, 10)));
    } catch (_) {}
  }
  function removeRecentSearch(query) {
    const q = String(query || '').trim().toLowerCase();
    try {
      const current = getRecentSearches().filter(item => item.toLowerCase() !== q);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(current));
    } catch (_) {}
  }
  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch (_) {}
  }

  const PLACEHOLDERS_BY_LANG = {
    pl: [
      'Zapytaj Christian Culture…',
      "Szukaj: 'Apokalipsa 14'",
      "Szukaj: 'Jak pokonać lęk'",
      "Szukaj: 'Lekcja 27'",
      "Szukaj: 'Radio na żywo'",
      "Szukaj: 'Werset o pokoju'",
      "Szukaj: 'J 3:16'",
      "Szukaj: 'Lekcja 28 na dziś'",
      "Szukaj: 'Rozważanie Dobrze że jesteś'",
      "Szukaj: 'Infolinia Nadziei'",
      "Szukaj: 'LUMINA społeczność'"
    ],
    en: [
      'Ask Christian Culture…',
      "Search: 'Apocalypse 14'",
      "Search: 'How to overcome fear'",
      "Search: 'Lesson 27'",
      "Search: 'Live Radio'",
      "Search: 'Verse about peace'",
      "Search: 'John 3:16'",
      "Search: 'Daily reflection'",
      "Search: 'Hope Helpline'",
      "Search: 'LUMINA Community'"
    ],
    de: [
      'Christian Culture fragen…',
      "Suche: 'Apokalypse 14'",
      "Suche: 'Angst überwinden'",
      "Suche: 'Lektion 27'",
      "Suche: 'Live-Radio'",
      "Suche: 'Vers über Frieden'",
      "Suche: 'Johannes 3:16'",
      "Suche: 'Tagesandacht'",
      "Suche: 'Hoffnungs-Hotline'",
      "Suche: 'LUMINA-Gemeinschaft'"
    ]
  };

  function getPlaceholders() {
    const lang = (window.EkoCCI18n?.getLocale?.() || document.documentElement?.getAttribute('lang') || 'pl').toLowerCase();
    return PLACEHOLDERS_BY_LANG[lang] || PLACEHOLDERS_BY_LANG.pl;
  }

  const PLACEHOLDERS = PLACEHOLDERS_BY_LANG.pl;
  let placeholderInterval = null;
  function stopPlaceholderRotation() {
    if (placeholderInterval) {
      clearInterval(placeholderInterval);
      placeholderInterval = null;
    }
  }
  function startPlaceholderRotation(input) {
    if (!input) return;
    stopPlaceholderRotation();
    let idx = 0;
    placeholderInterval = setInterval(() => {
      if (!input || !document.body.contains(input)) {
        stopPlaceholderRotation();
        return;
      }
      if (searchEngine === 'google') return;
      // Jeśli użytkownik wpisał własny tekst — nie zmieniamy podpowiedzi
      if (input.value && input.value.trim().length > 0) return;
      const currentPlaceholders = getPlaceholders();
      idx = (idx + 1) % currentPlaceholders.length;
      input.setAttribute('placeholder', currentPlaceholders[idx]);
      const fallbackInput = document.getElementById('ccw-q');
      if (fallbackInput && (!fallbackInput.value || !fallbackInput.value.trim().length)) {
        fallbackInput.setAttribute('placeholder', PLACEHOLDERS[idx]);
      }
    }, 2800);
  }


  // Wyszukiwarka do ustawienia jako domyślna w przeglądarce (OpenSearch)
  if (typeof document !== 'undefined' && document.head && typeof document.querySelector === 'function'
    && !document.querySelector('link[rel="search"][type="application/opensearchdescription+xml"]')) {
    const os = document.createElement('link');
    os.rel = 'search';
    os.type = 'application/opensearchdescription+xml';
    os.title = 'Christian Culture';
    os.href = '/opensearch.xml';
    document.head.appendChild(os);
  }

  // 3. Normalizacja polskich znaków i tekstu
  function normalizeStr(str) {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .trim();
  }

  function containsTerm(text, term) {
    return term.length <= 3 ? text.split(/[^a-z0-9]+/).includes(term) : text.includes(term);
  }

  function breadcrumbOf(rawUrl) {
    try {
      const u = new URL(rawUrl, 'https://polskieradio.cc');
      const parts = u.pathname.split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch (_) { return p; } }).map(p => p.replace(/\.html$/, ''));
      return [u.hostname.replace(/^www\./, '')].concat(parts.slice(0, 3)).join(' › ');
    } catch (_) {
      return '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const words = query
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
    if (!words.length) return escapedText;

    try {
      const pattern = words
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
      const regex = new RegExp(`(${pattern})`, 'gi');
      return escapedText.replace(regex, '<mark class="cc-omni-hl">$1</mark>');
    } catch {
      return escapedText;
    }
  }

  // 4. Pobieranie katalogu (z cache)
  async function loadCatalog() {
    if (catalogData && catalogData.items) return catalogData;
    if (isCatalogLoading) {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (catalogData && catalogData.items) {
            clearInterval(interval);
            resolve(catalogData);
          }
        }, 50);
      });
    }

    isCatalogLoading = true;
    const paths = ['/szukaj/catalog.json', '/data/cc-search-index.json'];
    for (const p of paths) {
      try {
        const resp = await fetch(p, { cache: 'default' });
        if (resp.ok) {
          const json = await resp.json();
          catalogData = json.items ? json : { items: Array.isArray(json) ? json : [], contextGuides: {} };
          window.__ccSearchCatalog = catalogData;
          isCatalogLoading = false;
          return catalogData;
        }
      } catch {
        // Spróbuj kolejnej ścieżki
      }
    }
    isCatalogLoading = false;
    catalogData = { items: [], contextGuides: {} };
    return catalogData;
  }

  // 5. Dopasowanie kategorii do 6 filarów ekosystemu CC
  function categorizeItem(item) {
    const cat = item.category || '';
    const url = item.url || '';
    const title = item.title || '';

    if (item.type === 'profile' || cat.includes('Społeczność') || url.includes('/lumina.') || title.startsWith('Profil:')) {
      return { group: 'community', name: 'Profile & Społeczność', icon: '👤' };
    }
    if (item.type === 'reflection' || cat.includes('Biblia') || url.includes('/werset-dnia') || url.includes('/mojabiblia') || title.includes('Rozważanie') || title.includes('Werset')) {
      return { group: 'bible', name: 'Słowo Boże & Rozważania', icon: '📖' };
    }
    if (cat.includes('Radio') || url.includes('radio') || url.includes('cctv24') || url.includes('player') || title.includes('Muzyka') || title.includes('Audycja') || title.includes('Śniadaniowa')) {
      return { group: 'radio', name: 'Audycje & Muzyka', icon: '📻' };
    }
    if (cat.includes('Media') || url.includes('/vod') || url.includes('/kino') || title.includes('Film') || title.includes('VOD')) {
      return { group: 'vod', name: 'Kino VOD & Kanały', icon: '🎬' };
    }
    if (cat.includes('Portale') || cat.includes('Artykuły') || cat.includes('Wiedza') || url.includes('/news') || url.includes('/nauka') || url.includes('/historia') || url.includes('/biologia') || url.includes('/prawo') || url.includes('/seks')) {
      return { group: 'news', name: 'Wiedza & Publicystyka', icon: '📰' };
    }
    return { group: 'modules', name: 'Moduły & Platformy', icon: '🌐' };
  }

  // 6. Słownik synonimów i powiązań semantycznych ekosystemu Christian Culture
  const SYNONYM_MAP = {
    // Lekcje, rozważania i studia
    'lekcja': ['lekcje', 'lekcji', 'rozważanie', 'rozwazanie', 'inspiracja', 'kurs', 'studium', 'dzień', 'dzien', 'nauka'],
    'lekcje': ['lekcja', 'rozważania', 'kursy', 'studia'],
    'lekcji': ['lekcja', 'rozważania', 'kursy'],
    'rozwazanie': ['rozważanie', 'rozwazania', 'lekcja', 'inspiracja', 'słowo na dziś', 'werset dnia', 'dobrze że jesteś', 'dzień', 'dzien'],
    'rozważanie': ['rozwazanie', 'lekcja', 'inspiracja', 'słowo na dziś', 'werset dnia', 'dobrze że jesteś', 'dzień', 'dzien'],
    'rozwazania': ['rozważania', 'rozważanie', 'lekcje', 'inspiracje'],
    'rozważania': ['rozwazania', 'rozważanie', 'lekcje', 'inspiracje'],
    'rozwzanie': ['rozważanie', 'rozwazanie', 'lekcja', 'inspiracja'], // tolerancja częstej literówki
    'inspiracja': ['rozważanie', 'lekcja', 'słowo na dziś', 'poranna', 'cytat'],
    'kurs': ['akademia', 'lekcja', '28 kroków', 'kurs codzienny', 'studium', 'formacja'],
    'kursy': ['akademia', 'lekcje', '28 kroków', 'kurs codzienny'],
    'akademia': ['kurs', 'lekcja', 'biblijna', '28 kroków', 'z biblią za pan brat', 'studium'],
    'dzien': ['dzień', 'lekcja', 'rozważanie', 'dziś', 'dzisiaj', 'werset'],
    'dzień': ['dzien', 'lekcja', 'rozważanie', 'dziś', 'dzisiaj', 'werset'],

    // Dynamiczny kontekst daty i dnia bieżącego
    'dzis': ['dziś', 'dzisiaj', 'na dziś', 'dzisiejsza', 'aktualna', 'bieżąca'],
    'dziś': ['dzis', 'dzisiaj', 'na dziś', 'dzisiejsza', 'aktualna', 'bieżąca'],
    'dzisiaj': ['dziś', 'dzis', 'na dziś', 'dzisiejsza'],

    // Pismo Święte
    'biblia': ['pismo święte', 'słowo boże', 'ewangelia', 'mojabiblia', 'interlinearna', 'werset'],
    'pismo': ['biblia', 'słowo boże', 'pismo święte'],
    'werset': ['słowo', 'cytat', 'mojabiblia', 'werset dnia', 'pismo'],

    // Muzyka, Radio & Transmisje
    'muzyka': ['worship', 'pieśni', 'uwielbienie', 'radio', 'ambient', 'sleep', 'hymny', 'karaoke'],
    'worship': ['uwielbienie', 'pieśni', 'muzyka', 'cctv24 worship', 'live', 'karaoke', 'worship mode'],
    'spiewana': ['śpiewana', 'biblia śpiewana', 'muzyka', 'pieśni', 'karaoke', 'śpiewnik'],
    'śpiewana': ['spiewana', 'biblia śpiewana', 'muzyka', 'pieśni', 'karaoke', 'śpiewnik'],
    'karaoke': ['śpiewnik', 'spiewnik', 'biblijne uwielbienie', 'biblia śpiewana', 'uwielbienie', 'worship mode', 'tekst pieśni', 'śpiewaj'],
    'spiewnik': ['śpiewnik', 'karaoke', 'biblijne uwielbienie', 'pieśni', 'tekst pieśni', 'uwielbienie', 'worship', 'śpiewaj'],
    'śpiewnik': ['spiewnik', 'karaoke', 'biblijne uwielbienie', 'pieśni', 'tekst pieśni', 'uwielbienie', 'worship', 'śpiewaj'],
    'uwielbienie': ['karaoke', 'śpiewnik', 'spiewnik', 'worship', 'pieśni', 'muzyka', 'cctv24 worship', 'live', 'biblijne uwielbienie'],
    'radio': ['stacja', 'audycja', 'transmisja', 'live', 'cctv24', 'śniadaniowa', 'zapolske'],
    'audycja': ['radio', 'podcast', 'śniadaniowa', 'nagrania'],

    // Filmy i VOD
    'film': ['kino', 'vod', 'wideo', 'filmy', 'seans'],
    'kino': ['vod', 'film', 'filmy', 'kino chrześcijańskie'],
    'vod': ['kino', 'film', 'filmy', 'wideo'],
    'apokalipsa': ['objawienie', 'proroctwo', 'palla', 'czasy ostateczne', 'alfred palla'],

    // Społeczność LUMINA
    'spolecznosc': ['społeczność', 'lumina', 'profil', 'tablica', 'czat', 'posty'],
    'społeczność': ['spolecznosc', 'lumina', 'profil', 'tablica', 'czat', 'posty'],
    'lumina': ['społeczność', 'profil', 'tablica', 'portal', 'posty', 'czat'],

    // Modlitwa & Wstawiennictwo
    'modlitwa': ['wstawiennictwo', 'za polskę', 'intencje', 'modlitwy', 'zjednoczeni'],
    'intencja': ['modlitwa', 'wstawiennictwo'],

    // Aplikacje & Narzędzia
    'aplikacja': ['cclite', 'cclite.pl', 'apka', 'pwa', 'mobile', 'dobrze że jesteś'],
    'apka': ['aplikacja', 'cclite', 'cclite.pl', 'mobile'],

    // Sklep & Zasoby
    'sklep': ['koszyk', 'zamówienie', 'współpraca', 'książki', 'literatura'],
    'ksiazki': ['książki', 'sklep', 'biblioteka', 'literatura'],
    'książki': ['ksiazki', 'sklep', 'biblioteka', 'literatura'],

    // Finanse, Gospodarka & Wolność (CCN Finanse / Specyfikacja § 6)
    'cbdc': ['cyfrowy pieniądz', 'cyfrowy pieniadz', 'waluta banku centralnego', 'pieniądz programowalny', 'nadzór finansowy', 'gotówka', 'prawo niedzielne', 'apokalipsa 13'],
    'pieniadz': ['pieniądz', 'cbdc', 'waluta', 'finanse', 'gotówka', 'płatności', 'budżet', 'szafarz'],
    'pieniądz': ['pieniadz', 'cbdc', 'waluta', 'finanse', 'gotówka', 'płatności', 'budżet', 'szafarz'],
    'gotowka': ['gotówka', 'cbdc', 'cyfrowy pieniądz', 'płatności', 'wolność finansowa'],
    'gotówka': ['gotowka', 'cbdc', 'cyfrowy pieniądz', 'płatności', 'wolność finansowa'],
    'niedzielne': ['prawo niedzielne', 'sabat', 'szabat', 'wolność religijna', 'apokalipsa 13', 'dzień święty'],
    'wolnosc': ['wolność', 'wolność religijna', 'wolność sumienia', 'prawa obywatelskie'],
    'wolność': ['wolnosc', 'wolność religijna', 'wolność sumienia', 'prawa obywatelskie'],

    // Etyka publiczna, Polityka & Państwo (Specyfikacja § 6)
    'polityka': ['państwo i kościół', 'wolność sumienia', 'etyka publiczna', 'prawo religijne', 'rząd', 'władza'],
    'panstwo': ['państwo', 'polityka', 'władza', 'prawo', 'obywatel'],
    'państwo': ['panstwo', 'polityka', 'władza', 'prawo', 'obywatel'],

    // Nowe technologie, Sztuczna Inteligencja & Praca (Specyfikacja § 6)
    'ai': ['sztuczna inteligencja', 'si', 'automatyzacja', 'technologia', 'etyka technologii', 'praca', 'algorytmy'],
    'praca': ['automatyzacja', 'zawód', 'etyka pracy', 'bezrobocie', 'ai', 'zarządzanie'],
    'automatyzacja': ['ai', 'technologia', 'praca', 'robotyzacja']
  };

  // Damerau-Levenshtein distance (tolerancja literówek i przestawień liter)
  function levenshteinDist(a, b) {
    if (a === b) return 0;
    const la = a.length;
    const lb = b.length;
    if (!la) return lb;
    if (!lb) return la;
    if (Math.abs(la - lb) > 2) return 99;

    const d = [];
    for (let i = 0; i <= la; i++) d[i] = [i];
    for (let j = 1; j <= lb; j++) d[0][j] = j;

    for (let i = 1; i <= la; i++) {
      for (let j = 1; j <= lb; j++) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,       // deletion
          d[i][j - 1] + 1,       // insertion
          d[i - 1][j - 1] + cost // substitution
        );
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition (np. bilbia -> biblia)
        }
      }
    }
    return d[la][lb];
  }

  function isFuzzyWordMatch(word, targetWord) {
    if (!word || !targetWord) return false;
    if (word === targetWord) return true;
    const maxDist = word.length <= 4 ? 1 : 2;
    return levenshteinDist(word, targetWord) <= maxDist;
  }


  // ── FAZA 2: BAZA WIEDZY BIBLIJNEJ UBG & INTENCJA DUSZPASTERSKA ──
  const BIBLE_BOOK_ALIASES = {
    'rdz': 'GEN', 'rodzaju': 'GEN', 'rodzaj': 'GEN', 'gen': 'GEN',
    'wj': 'EXO', 'wyjscia': 'EXO', 'wyjscie': 'EXO', 'exo': 'EXO',
    'kpl': 'LEV', 'kaplanska': 'LEV', 'lev': 'LEV',
    'lb': 'NUM', 'liczb': 'NUM', 'num': 'NUM',
    'pwt': 'DEU', 'powtorzonego': 'DEU', 'powtorzonegoprawa': 'DEU', 'deu': 'DEU',
    'joz': 'JOS', 'jozuego': 'JOS', 'jos': 'JOS',
    'sdz': 'JDG', 'sedziow': 'JDG', 'jdg': 'JDG',
    'rut': 'RUT',
    '1sm': '1SA', '1sam': '1SA', '1samuela': '1SA', '1sa': '1SA',
    '2sm': '2SA', '2sam': '2SA', '2samuela': '2SA', '2sa': '2SA',
    '1krl': '1KI', '1krolow': '1KI', '1ki': '1KI',
    '2krl': '2KI', '2krolow': '2KI', '2ki': '2KI',
    '1krn': '1CH', '1kronik': '1CH', '1ch': '1CH',
    '2krn': '2CH', '2kronik': '2CH', '2ch': '2CH',
    'ezd': 'EZR', 'ezdrasza': 'EZR', 'ezr': 'EZR',
    'neh': 'NEH', 'nehemiasza': 'NEH',
    'est': 'EST', 'estery': 'EST',
    'hi': 'JOB', 'hioba': 'JOB', 'job': 'JOB',
    'ps': 'PSA', 'psalm': 'PSA', 'psalmy': 'PSA', 'psa': 'PSA',
    'prz': 'PRO', 'przyslow': 'PRO', 'przypowiesci': 'PRO', 'pro': 'PRO',
    'kzn': 'ECC', 'kaznodziei': 'ECC', 'koheleta': 'ECC', 'koh': 'ECC', 'ecc': 'ECC',
    'pnp': 'SNG', 'piesn': 'SNG', 'piesnnadpiesniami': 'SNG', 'sng': 'SNG',
    'iz': 'ISA', 'izajasza': 'ISA', 'izajasz': 'ISA', 'isa': 'ISA',
    'jr': 'JER', 'jeremiasza': 'JER', 'jeremiasz': 'JER', 'jer': 'JER',
    'lm': 'LAM', 'treny': 'LAM', 'lam': 'LAM',
    'ez': 'EZK', 'ezechiela': 'EZK', 'ezk': 'EZK',
    'dn': 'DAN', 'daniela': 'DAN', 'dan': 'DAN',
    'oz': 'HOS', 'ozeasza': 'HOS', 'hos': 'HOS',
    'jl': 'JOL', 'joela': 'JOL', 'jol': 'JOL',
    'am': 'AMO', 'amosa': 'AMO', 'amo': 'AMO',
    'ab': 'OBA', 'abdiasza': 'OBA', 'oba': 'OBA',
    'jon': 'JON', 'jonasza': 'JON',
    'mi': 'MIC', 'micheasza': 'MIC', 'mic': 'MIC',
    'na': 'NAH', 'nahuma': 'NAH', 'nah': 'NAH',
    'ha': 'HAB', 'hab': 'HAB', 'habakuka': 'HAB',
    'so': 'ZEP', 'sofoniasza': 'ZEP', 'zep': 'ZEP',
    'ag': 'HAG', 'aggeusza': 'HAG', 'hag': 'HAG',
    'za': 'ZEC', 'zachariasza': 'ZEC', 'zec': 'ZEC',
    'ml': 'MAL', 'malachiasza': 'MAL', 'mal': 'MAL',
    'mt': 'MAT', 'mateusza': 'MAT', 'mateusz': 'MAT', 'mat': 'MAT',
    'mk': 'MRK', 'marka': 'MRK', 'marek': 'MRK', 'mrk': 'MRK',
    'lk': 'LUK', 'lukasza': 'LUK', 'lukasz': 'LUK', 'luk': 'LUK',
    'j': 'JHN', 'jana': 'JHN', 'jan': 'JHN', 'jhn': 'JHN',
    'dz': 'ACT', 'dzieje': 'ACT', 'dziejeapostolskie': 'ACT', 'act': 'ACT',
    'rz': 'ROM', 'rzymian': 'ROM', 'rom': 'ROM',
    '1kor': '1CO', '1koryntian': '1CO', '1co': '1CO',
    '2kor': '2CO', '2koryntian': '2CO', '2co': '2CO',
    'ga': 'GAL', 'galacjan': 'GAL', 'gal': 'GAL',
    'ef': 'EPH', 'efezjan': 'EPH', 'eph': 'EPH',
    'flp': 'PHP', 'filipian': 'PHP', 'php': 'PHP',
    'kol': 'COL', 'kolosan': 'COL', 'col': 'COL',
    '1tes': '1TH', '1tesaloniczan': '1TH', '1th': '1TH',
    '2tes': '2TH', '2tesaloniczan': '2TH', '2th': '2TH',
    '1tm': '1TI', '1tymoteusza': '1TI', '1ti': '1TI',
    '2tm': '2TI', '2tymoteusza': '2TI', '2ti': '2TI',
    'tt': 'TIT', 'tytusa': 'TIT', 'tit': 'TIT',
    'flm': 'PHM', 'filemona': 'PHM', 'phm': 'PHM',
    'hbr': 'HEB', 'hebrajczykow': 'HEB', 'heb': 'HEB',
    'jk': 'JAS', 'jakuba': 'JAS', 'jas': 'JAS',
    '1p': '1PE', '1piotra': '1PE', '1pe': '1PE',
    '2p': '2PE', '2piotra': '2PE', '2pe': '2PE',
    '1j': '1JN', '1jana': '1JN', '1jn': '1JN',
    '2j': '2JN', '2jana': '2JN', '2jn': '2JN',
    '3j': '3JN', '3jana': '3JN', '3jn': '3JN',
    'jud': 'JUD', 'judy': 'JUD',
    'obj': 'REV', 'ap': 'REV', 'apokalipsa': 'REV', 'objawienie': 'REV', 'rev': 'REV'
  };

  const BIBLE_BOOK_NAMES = {
    GEN: { name: 'Księga Rodzaju', short: 'Rdz' },
    EXO: { name: 'Księga Wyjścia', short: 'Wj' },
    LEV: { name: 'Księga Kapłańska', short: 'Kpł' },
    NUM: { name: 'Księga Liczb', short: 'Lb' },
    DEU: { name: 'Księga Powtórzonego Prawa', short: 'Pwt' },
    JOS: { name: 'Księga Jozuego', short: 'Joz' },
    JDG: { name: 'Księga Sędziów', short: 'Sdz' },
    RUT: { name: 'Księga Rut', short: 'Rut' },
    '1SA': { name: '1 Księga Samuela', short: '1Sm' },
    '2SA': { name: '2 Księga Samuela', short: '2Sm' },
    '1KI': { name: '1 Księga Królów', short: '1Krl' },
    '2KI': { name: '2 Księga Królów', short: '2Krl' },
    '1CH': { name: '1 Księga Kronik', short: '1Krn' },
    '2CH': { name: '2 Księga Kronik', short: '2Krn' },
    EZR: { name: 'Księga Ezdrasza', short: 'Ezd' },
    NEH: { name: 'Księga Nehemiasza', short: 'Neh' },
    EST: { name: 'Księga Estery', short: 'Est' },
    JOB: { name: 'Księga Hioba', short: 'Hi' },
    PSA: { name: 'Księga Psalmów', short: 'Ps' },
    PRO: { name: 'Księga Przysłów', short: 'Prz' },
    ECC: { name: 'Księga Kaznodziei', short: 'Kzn' },
    SNG: { name: 'Pieśń nad Pieśniami', short: 'PnP' },
    ISA: { name: 'Księga Izajasza', short: 'Iz' },
    JER: { name: 'Księga Jeremiasza', short: 'Jr' },
    LAM: { name: 'Lamentacje Jeremiasza', short: 'Lm' },
    EZK: { name: 'Księga Ezechiela', short: 'Ez' },
    DAN: { name: 'Księga Daniela', short: 'Dn' },
    HOS: { name: 'Księga Ozeasza', short: 'Oz' },
    JOL: { name: 'Księga Joela', short: 'Jl' },
    AMO: { name: 'Księga Amosa', short: 'Am' },
    OBA: { name: 'Księga Abdiasza', short: 'Ab' },
    JON: { name: 'Księga Jonasza', short: 'Jon' },
    MIC: { name: 'Księga Micheasza', short: 'Mi' },
    NAH: { name: 'Księga Nahuma', short: 'Na' },
    HAB: { name: 'Księga Habakuka', short: 'Ha' },
    ZEP: { name: 'Księga Sofoniasza', short: 'So' },
    HAG: { name: 'Księga Aggeusza', short: 'Ag' },
    ZEC: { name: 'Księga Zachariasza', short: 'Za' },
    MAL: { name: 'Księga Malachiasza', short: 'Ml' },
    MAT: { name: 'Ewangelia Mateusza', short: 'Mt' },
    MRK: { name: 'Ewangelia Marka', short: 'Mk' },
    LUK: { name: 'Ewangelia Łukasza', short: 'Łk' },
    JHN: { name: 'Ewangelia Jana', short: 'J' },
    ACT: { name: 'Dzieje Apostolskie', short: 'Dz' },
    ROM: { name: 'List do Rzymian', short: 'Rz' },
    '1CO': { name: '1 List do Koryntian', short: '1Kor' },
    '2CO': { name: '2 List do Koryntian', short: '2Kor' },
    GAL: { name: 'List do Galacjan', short: 'Ga' },
    EPH: { name: 'List do Efezjan', short: 'Ef' },
    PHP: { name: 'List do Filipian', short: 'Flp' },
    COL: { name: 'List do Kolosan', short: 'Kol' },
    '1TH': { name: '1 List do Tesaloniczan', short: '1Tes' },
    '2TH': { name: '2 List do Tesaloniczan', short: '2Tes' },
    '1TI': { name: '1 List do Tymoteusza', short: '1Tm' },
    '2TI': { name: '2 List do Tymoteusza', short: '2Tm' },
    TIT: { name: 'List do Tytusa', short: 'Tt' },
    PHM: { name: 'List do Filemona', short: 'Flm' },
    HEB: { name: 'List do Hebrajczyków', short: 'Hbr' },
    JAS: { name: 'List Jakuba', short: 'Jk' },
    '1PE': { name: '1 List Piotra', short: '1P' },
    '2PE': { name: '2 List Piotra', short: '2P' },
    '1JN': { name: '1 List Jana', short: '1J' },
    '2JN': { name: '2 List Jana', short: '2J' },
    '3JN': { name: '3 List Jana', short: '3J' },
    JUD: { name: 'List Judy', short: 'Jud' },
    REV: { name: 'Objawienie Jana (Apokalipsa)', short: 'Obj' }
  };

  // Kanoniczny bufor najczęściej wyszukiwanych wersetów (dosłowne brzmienie UBG-2025)
  const TOP_UBG_VERSES = {
    "JHN:3:16": "Tak bowiem Bóg umiłował świat, że dał swego jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne.",
    "ROM:8:28": "A wiemy, że wszystko współdziała dla dobra tych, którzy miłują Boga, to jest tych, którzy są powołani według postanowienia Boga.",
    "PSA:23:1": "PAN jest moim pasterzem, niczego mi nie zabraknie.",
    "PRO:3:5": "Ufaj PANU z całego swego serca i nie polegaj na swoim rozumie.",
    "PRO:3:6": "Zważaj na niego we wszystkich swoich drogach, a on będzie prostować twoje ścieżki.",
    "ISA:40:31": "Ale ci, którzy oczekują PANA, nabiorą nowych sił; wzbiją się na skrzydłach jak orły, będą biec, a się nie zmęczą, będą chodzić, a nie ustaną.",
    "PHP:4:13": "Wszystko mogę w Chrystusie, który mnie umacnia.",
    "MAT:6:33": "Ale szukajcie najpierw królestwa Bożego i jego sprawiedliwości, a to wszystko będzie wam dodane.",
    "1CO:13:4": "Miłość jest cierpliwa, jest życzliwa. Miłość nie zazdrości, nie przechwala się, nie unosi się pychą;",
    "1CO:13:13": "A teraz trwają wiara, nadzieja, miłość, te trzy. Z nich zaś największa jest miłość.",
    "JOS:1:9": "Czyż ci nie nakazałem? Wzmocnij się i bądź mężny. Nie lękaj się i nie przerażaj, gdyż PAN, twój Bóg, jest z tobą, dokądkolwiek pójdziesz.",
    "JER:29:11": "Gdyż ja znam myśli, które mam o was, mówi PAN: myśli o pokoju, a nie o utrapieniu, aby zapewnić wam koniec, jakiego oczekujecie.",
    "GEN:1:1": "Na początku Bóg stworzył niebo i ziemię.",
    "PSA:91:1": "Kto mieszka pod osłoną Najwyższego, w cieniu Wszechmocnego przebywać będzie.",
    "PSA:91:2": "Będę mówił o PANU: Moja ucieczka i twierdza, mój Bóg, jemu będę ufał.",
    "ROM:12:2": "A nie dostosowujcie się do tego świata, ale przemieńcie się przez odnowienie waszego umysłu, abyście mogli rozeznać, co jest dobrą, przyjemną i doskonałą wolą Boga.",
    "EPH:2:8": "Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga.",
    "EPH:2:9": "Nie z uczynków, aby nikt się nie chlubił.",
    "2TI:3:16": "Całe Pismo jest natchnione przez Boga i pożyteczne do nauki, do strofowania, do poprawiania, do wychowywania w sprawiedliwości;",
    "HEB:11:1": "A wiara jest podstawą tego, czego się spodziewamy, i dowodem tego, czego nie widzimy.",
    "1JN:1:9": "Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości.",
    "REV:21:4": "I otrze Bóg wszelką łzę z ich oczu, i śmierci już nie będzie ani smutku, ani krzyku, ani bólu nie będzie, bo pierwsze rzeczy przeminęły.",
    "REV:3:20": "Oto stoję u drzwi i pukam. Jeśli ktoś usłyszy mój głos i otworzy drzwi, wejdę do niego i spożyję z nim wieczerzę, a on ze mną.",
    "MAT:11:28": "Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek.",
    "JHN:14:6": "Jezus mu odpowiedział: Ja jestem drogą, prawdą i życiem. Nikt nie przychodzi do Ojca jak tylko przeze mnie.",
    "ROM:6:23": "Zapłatą bowiem za grzech jest śmierć, ale darem łaski Boga jest życie wieczne w Jezusie Chrystusie, naszym Panu.",
    "1PE:5:7": "Wszystkie wasze troski przerzućcie na niego, gdyż on troszczy się o was.",
    "GAL:5:22": "Owocem zaś Ducha jest miłość, radość, pokój, cierpliwość, życzliwość, dobroć, wiara;",
    "PSA:119:105": "Twoje słowo jest pochodnią dla moich nóg i światłością na mojej ścieżce.",
    "GEN:2:2": "I ukończył Bóg w siódmym dniu swoje dzieło, które uczynił, i odpoczął w siódmym dniu od wszelkiego swego dzieła, które uczynił.",
    "GEN:2:3": "I pobłogosławił Bóg dzień siódmy, i uświęcił go, bo w nim odpoczął od wszelkiego swego dzieła, które stworzył i uczynił.",
    "EXO:20:8": "Pamiętaj o dniu szabatu, aby go święcić.",
    "EXO:20:9": "Sześć dni będziesz pracować i wykonywać wszelką twoją pracę;",
    "EXO:20:10": "Ale siódmy dzień jest szabatem PANA, twego Boga. W nim nie będziesz wykonywał żadnej pracy...",
    "EXO:20:11": "Gdyż w sześciu dniach PAN stworzył niebo i ziemię, morze i wszystko, co w nich jest, a w siódmym dniu odpoczął. Dlatego PAN pobłogosławił dzień szabatu i uświęcił go.",
    "MRK:2:27": "I powiedział im: Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu.",
    "MRK:2:28": "Dlatego Syn Człowieczy jest Panem także szabatu.",
    "HEB:4:9": "Pozostaje więc jeszcze odpoczynek dla ludu Bożego.",
    "1TI:2:5": "Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus;",
    "REV:14:6": "I widziałem innego anioła lecącego środkiem nieba, mającego wieczną ewangelię, aby ją zwiastować mieszkańcom ziemi...",
    "REV:14:7": "Mówiącego donośnym głosem: Bójcie się Boga i oddajcie mu chwałę, gdyż przyszła godzina jego sądu. Pokłońcie się temu, który stworzył niebo i ziemię, morze i źródła wód.",
    "REV:14:12": "Tu jest cierpliwość świętych, tu są ci, którzy strzegą przykazań Boga i wiary Jezusa.",
    "DAN:7:13": "I widziałem w widzeniach nocnych: a oto w obłokach nieba przychodził jakby Syn Człowieczy; przyszedł aż do Przedwiecznego i przyprowadzono go przed niego.",
    "DAN:7:14": "I dano mu panowanie, cześć i królestwo, aby mu służyły wszystkie narody, ludy i języki. Jego panowanie jest panowaniem wiecznym, które nie przeminie...",
    "ROM:3:24": "Zostając usprawiedliwieni darmo, z jego łaski, przez odkupienie, które jest w Jezusie Chrystusie.",
    "ROM:5:1": "Będąc więc usprawiedliwieni z wiary, mamy pokój z Bogiem przez naszego Pana Jezusa Chrystusa;",
    "2PE:1:19": "Mamy też mocniejsze słowo prorockie, a wy dobrze robicie, trzymając się go jak lampy świecącej w ciemnym miejscu, aż dzień zaświta i jutrzenka wzejdzie w waszych sercach;",
    "JHN:3:17": "Bo Bóg nie posłał swego Syna na świat, aby potępił świat, lecz aby świat był przez niego zbawiony.",
    "ROM:8:38": "Jestem bowiem pewien, że ani śmierć, ani życie, ani aniołowie, ani władze, ani moce, ani teraźniejsze, ani przyszłe rzeczy;",
    "ROM:8:39": "Ani wysokość, ani głębokość, ani żadne inne stworzenie nie będzie mogło nas odłączyć od miłości Boga, która jest w Jezusie Chrystusie, naszym Panu."
  };

  // Rozpoznawanie referencji biblijnych w zapytaniu

  // =========================================================================
  // PORÓWNYWARKA WIELOPRZEKŁADOWA & WERYFIKACJA CYTOWAŃ (P3)
  // Standard @777: UBG (Wzorzec Kanoniczny), BW (1975), BT (Wyd. V), BG (1632)
  // Protokół Weryfikacji Biblijnej — EkoCC @777 (Dyrektywa Dowódcy 2026-10-20)
  // =========================================================================
  const TOP_COMPARE_VERSES = {
    "JHN:3:16": {
      refTitle: "Ewangelia Jana 3:16",
      UBG: "Tak bowiem Bóg umiłował świat, że dał swego jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne.",
      BW: "Albowiem tak Bóg umiłował świat, że Syna swego jednorodzonego dał, aby każdy, kto weń wierzy, nie zginął, ale miał żywot wieczny.",
      BT: "Tak bowiem Bóg umiłował świat, że Syna swego Jednorodzonego dał, aby każdy, kto w Niego wierzy, nie zginął, ale miał życie wieczne.",
      BG: "Albowiem tak Bóg umiłował świat, że Syna swego jednorodzonego dał, aby każdy, kto weń wierzy, nie zginął, ale miał żywot wieczny."
    },
    "PSA:23:1": {
      refTitle: "Psalm 23:1",
      UBG: "PAN jest moim pasterzem, niczego mi nie zabraknie.",
      BW: "Pan jest pasterzem moim, niczego mi nie braknie.",
      BT: "Pan jest moim pasterzem, nie brak mi niczego.",
      BG: "Pan jest pasterzem moim, na niczem mi nie zejdzie."
    },
    "ROM:8:28": {
      refTitle: "List do Rzymian 8:28",
      UBG: "A wiemy, że wszystko współdziała dla dobra tych, którzy miłują Boga, to jest tych, którzy są powołani według postanowienia Boga.",
      BW: "A wiemy, że Bóg współdziała we wszystkim ku dobremu z tymi, którzy Boga miłują, to jest z tymi, którzy według postanowienia jego są powołani.",
      BT: "Wiemy też, że Bóg z tymi, którzy Go miłują, współdziała we wszystkim dla ich dobra, z tymi, którzy są powołani według Jego zamiaru.",
      BG: "A wiemy, iż tym, którzy miłują Boga, wszystkie rzeczy dopomagają ku dobremu, to jest tym, którzy według postanowienia powołani są."
    },
    "GEN:1:1": {
      refTitle: "Księga Rodzaju 1:1",
      UBG: "Na początku Bóg stworzył niebo i ziemię.",
      BW: "Na początku stworzył Bóg niebo i ziemię.",
      BT: "Na początku Bóg stworzył niebo i ziemię.",
      BG: "Na początku stworzył Bóg niebo i ziemię."
    },
    "JHN:1:1": {
      refTitle: "Ewangelia Jana 1:1",
      UBG: "Na początku było Słowo, a Słowo było u Boga i Bogiem było Słowo.",
      BW: "Na początku było Słowo, a Słowo było u Boga, a Bogiem było Słowo.",
      BT: "Na początku było Słowo, a Słowo było u Boga, i Bogiem było Słowo.",
      BG: "Na początku było Słowo, a ono Słowo było u Boga, a Bogiem było ono Słowo."
    },
    "PHP:4:13": {
      refTitle: "List do Filipian 4:13",
      UBG: "Wszystko mogę w Chrystusie, który mnie umacnia.",
      BW: "Wszystko mogę w tym, który mnie wzmacnia, w Chrystusie.",
      BT: "Wszystko mogę w Tym, który mnie umacnia.",
      BG: "Wszystko mogę w Chrystusie, który mię posila."
    },
    "1TI:2:5": {
      refTitle: "1 List do Tymoteusza 2:5",
      UBG: "Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus;",
      BW: "Albowiem jeden jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus,",
      BT: "Albowiem jeden jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek, Chrystus Jezus,",
      BG: "Albowiem jeden jest Bóg, jeden też pośrednik między Bogiem i ludźmi, człowiek Chrystus Jezus;"
    },
    "REV:14:7": {
      refTitle: "Objawienie Jana (Apokalipsa) 14:7",
      UBG: "Mówiącego donośnym głosem: Bójcie się Boga i oddajcie mu chwałę, gdyż przyszła godzina jego sądu. Pokłońcie się temu, który stworzył niebo i ziemię, morze i źródła wód.",
      BW: "I mówił donośnym głosem: Bójcie się Boga i oddajcie mu chwałę, gdyż nadeszła godzina sądu jego, i oddajcie pokłon temu, który stworzył niebo i ziemię, i morze, i źródła wód.",
      BT: "Mówił on głosem donośnym: «Ulęknijcie się Boga i dajcie Mu chwałę, bo przyszła godzina Jego sądu. Pokłońcie się Temu, co niebo uczynił i ziemię, i morze, i źródła wód!»",
      BG: "Mówiący głosem wielkim: Bójcie się Boga, i dajcie mu chwałę, iż przyszła godzina sądu jego; i kłońcie się temu, który uczynił niebo i ziemię, i morze, i źródła wód."
    },
    "EXO:20:8": {
      refTitle: "Księga Wyjścia 20:8",
      UBG: "Pamiętaj o dniu szabatu, aby go święcić.",
      BW: "Pamiętaj o dniu sabatu, aby go święcić.",
      BT: "Pamiętaj o dniu szabatu, aby go uświęcić.",
      BG: "Pamiętaj na dzień odpocznienia, abyś go święcił."
    },
    "EPH:2:8": {
      refTitle: "List do Efezjan 2:8",
      UBG: "Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga.",
      BW: "Albowiem łaską zbawieni jesteście przez wiarę, i to nie z was: Boży to dar;",
      BT: "Łaską bowiem jesteście zbawieni przez wiarę. A to pochodzi nie od was, lecz jest darem Boga:",
      BG: "Albowiem łaską jesteście zbawieni przez wiarę, i to nie z was; dar to Boży jest;"
    }
  };

  function normalizeTextForComparison(str) {
    return String(str || '').toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function verifyBibleQuote(query) {
    if (!query) return null;
    const normQ = normalizeTextForComparison(query);
    if (normQ.length < 12) return null;

    let bestMatch = null;

    for (const [key, vText] of Object.entries(TOP_UBG_VERSES)) {
      const normUbg = normalizeTextForComparison(vText);
      const comp = TOP_COMPARE_VERSES[key];
      const normBw = comp ? normalizeTextForComparison(comp.BW) : '';
      const normBt = comp ? normalizeTextForComparison(comp.BT) : '';
      const normBg = comp ? normalizeTextForComparison(comp.BG) : '';

      // 1. Zgodność dosłowna z UBG (całość lub podciąg)
      if (normUbg.includes(normQ) || normQ.includes(normUbg)) {
        return {
          isQuote: true,
          refKey: key,
          refTitle: comp ? comp.refTitle : key,
          status: 'VERIFIED_UBG',
          statusLabel: '100% ZGODNOŚĆ DOSŁOWNA Z UBG',
          badgeClass: 'cc-quote-badge-verified',
          ubgText: vText,
          inputQuery: query,
          matchedEdition: 'UBG',
          isExactUbg: true,
          note: 'Tekst jest w 100% zgodny z kanonicznym przekładem Uwspółcześnionej Biblii Gdańskiej (Standard @777 / Zero-QA).'
        };
      }

      // 2. Wykrycie innego tradycyjnego przekładu (BW / BT / BG)
      if (normBw && normBw.includes(normQ)) {
        return {
          isQuote: true,
          refKey: key,
          refTitle: comp.refTitle,
          status: 'DIFF_EDITION',
          statusLabel: 'ROZBIEŻNOŚĆ BRZMIENIOWA — ROZPOZNANO PRZEKŁAD BW (WARSZAWSKA)',
          badgeClass: 'cc-quote-badge-warning',
          ubgText: vText,
          detectedText: comp.BW,
          inputQuery: query,
          matchedEdition: 'BW',
          isExactUbg: false,
          note: 'Wpisany fragment odpowiada brzmieniu Biblii Warszawskiej (1975). Zgodnie z Protokołem @777 do publicznego cytowania zaleca się kanoniczne brzmienie UBG.'
        };
      }

      if (normBt && normBt.includes(normQ)) {
        return {
          isQuote: true,
          refKey: key,
          refTitle: comp.refTitle,
          status: 'DIFF_EDITION',
          statusLabel: 'ROZBIEŻNOŚĆ BRZMIENIOWA — ROZPOZNANO PRZEKŁAD BT (TYSIĄCLECIA)',
          badgeClass: 'cc-quote-badge-warning',
          ubgText: vText,
          detectedText: comp.BT,
          inputQuery: query,
          matchedEdition: 'BT',
          isExactUbg: false,
          note: 'Wpisany fragment odpowiada brzmieniu Biblii Tysiąclecia. Zgodnie z Protokołem @777 do publicznego cytowania zaleca się kanoniczne brzmienie UBG.'
        };
      }

      if (normBg && normBg.includes(normQ)) {
        return {
          isQuote: true,
          refKey: key,
          refTitle: comp.refTitle,
          status: 'DIFF_EDITION',
          statusLabel: 'ROZBIEŻNOŚĆ BRZMIENIOWA — ROZPOZNANO PRZEKŁAD BG (GDAŃSKA 1632)',
          badgeClass: 'cc-quote-badge-warning',
          ubgText: vText,
          detectedText: comp.BG,
          inputQuery: query,
          matchedEdition: 'BG',
          isExactUbg: false,
          note: 'Wpisany fragment odpowiada historycznemu brzmieniu Biblii Gdańskiej z 1632 roku. W ekosystemie CC zalecamy uwspółcześnione brzmienie UBG.'
        };
      }

      // 3. Ocena tokenowa dla parafraz (z uwzględnieniem rdzeni polskich słów min 4 znaki)
      const qTokens = normQ.split(' ').filter(t => t.length >= 3);
      const ubgTokens = normUbg.split(' ').filter(t => t.length >= 3);
      let matches = 0;
      for (const t of qTokens) {
        const hasMatch = ubgTokens.some(u => u === t || (t.length >= 4 && u.length >= 4 && (u.startsWith(t.slice(0, 4)) || t.startsWith(u.slice(0, 4)))));
        if (hasMatch) matches++;
      }
      const ratio = matches / Math.max(qTokens.length, 1);
      if (ratio >= 0.45 && (!bestMatch || ratio > bestMatch.ratio)) {
        bestMatch = {
          key,
          ratio,
          vText,
          refTitle: comp ? comp.refTitle : key
        };
      }
    }

    if (bestMatch && bestMatch.ratio >= 0.45) {
      return {
        isQuote: true,
        refKey: bestMatch.key,
        refTitle: bestMatch.refTitle,
        status: 'PARAPHRASE',
        statusLabel: 'PARAFRAZA LUB NIEDOSŁOWNY CYTAT',
        badgeClass: 'cc-quote-badge-paraphrase',
        ubgText: bestMatch.vText,
        inputQuery: query,
        matchedEdition: 'PARAFRAZA',
        isExactUbg: false,
        note: 'Standard @777: Tekst różni się od kanonicznego brzmienia UBG. Cytując jako Słowo Boże, podawaj dosłowne brzmienie przekładu.'
      };
    }

    return null;
  }

    function parseBibleRef(q) {
    if (!q) return null;
    const norm = q.toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z').trim();
    const m = norm.match(/^(?:(1|2|3)\s*)?([a-z]+)\s*(\d+)(?:[\s:,]+(\d+)(?:[-–—](\d+))?)?$/);
    if (!m) return null;
    const rawKey = (m[1] ? m[1] + m[2] : m[2]);
    let code = BIBLE_BOOK_ALIASES[rawKey];
    let matchedAlias = rawKey;
    if (!code) {
      let bestDist = 99;
      let bestAlias = null;
      for (const alias of Object.keys(BIBLE_BOOK_ALIASES)) {
        if (alias.length >= 3 && Math.abs(rawKey.length - alias.length) <= 2) {
          const dist = levenshteinDist(rawKey, alias);
          const maxAllowed = rawKey.length <= 4 ? 1 : 2;
          if (dist <= maxAllowed && dist < bestDist) {
            bestDist = dist;
            bestAlias = alias;
          }
        }
      }
      if (bestAlias) {
        code = BIBLE_BOOK_ALIASES[bestAlias];
        matchedAlias = bestAlias;
      }
    }
    if (!code) return null;
    const isFuzzyMatch = matchedAlias !== rawKey;
    const chapter = parseInt(m[3], 10);
    const verse = m[4] ? parseInt(m[4], 10) : null;
    const verseEnd = m[5] ? parseInt(m[5], 10) : null;
    const bookInfo = BIBLE_BOOK_NAMES[code] || { name: code, short: code };
    const refTitle = `${bookInfo.name} ${chapter}${verse ? ':' + verse : ''}${verseEnd ? '-' + verseEnd : ''}`;
    const key = `${code}:${chapter}:${verse || 1}`;
    let cachedText = TOP_UBG_VERSES[key];
    if (verse && verseEnd && verseEnd > verse) {
      const parts = [];
      for (let v = verse; v <= verseEnd; v++) {
        const t = TOP_UBG_VERSES[`${code}:${chapter}:${v}`];
        if (t) parts.push(`[${v}] ${t}`);
      }
      if (parts.length > 0) cachedText = parts.join(' ');
    }
    return {
      bookCode: code,
      bookName: bookInfo.name,
      shortName: bookInfo.short,
      chapter,
      verse,
      verseEnd,
      refTitle,
      verseText: cachedText || null,
      isPending: !cachedText,
      isFuzzyMatch: isFuzzyMatch,
      correctedFrom: rawKey
    };
  }

  // Asynchroniczne dociąganie wersetu z plików UBG-2025
  
  // =========================================================================
// =========================================================================
  // EKOCC SEARCH GLOBAL: KANONICZNY REJESTR RAG WIEDZY BIBLIJNEJ (ETAP 4 & 5)
  // 21 Zweryfikowanych Fragmentów UBG & Materiałów CC • Standard ZERO COST
  // =========================================================================
  const PRESET_WALLS = [
    {
      id: 'polska-radio',
      name: 'Polska & Fale Radiowe CC',
      tag: 'Oficjalny motyw CC',
      desktop: '/images/search/polska-radio-1600.webp',
      mobile: '/images/search/polska-radio-800.webp',
      thumb: '/images/search/polska-radio-thumb.webp',
      credit: 'Tło: Polska & Fale Radiowe · Christian Culture'
    },
    {
      id: 'global-radio',
      name: 'Global Christian Culture',
      tag: 'Złote Fale Misji',
      desktop: '/images/search/global-radio-1600.webp',
      mobile: '/images/search/global-radio-800.webp',
      thumb: '/images/search/global-radio-thumb.webp',
      credit: 'Tło: Global Christian Culture · Złote Fale Świata'
    },
    {
      id: 'andromeda',
      name: 'Galaktyka Andromedy',
      tag: 'Kosmos & Stworzenie',
      desktop: '/images/search/andromeda-1600.webp',
      mobile: '/images/search/andromeda-800.webp',
      thumb: '/images/search/andromeda-thumb.webp',
      credit: 'Tło: Galaktyka Andromedy · fot. Unsplash'
    }
  ];

  let currentWallId = 'polska-radio';
  let applyWallGlobal = null;
  const WALL_KEY = 'cc_search_wallpaper';

  const BIBLE_RAG_REGISTRY = [
  {
    "id": "rag-zbawienie-jhn-3-16",
    "title": "Ewangelia Jana 3:16 — Boża miłość i dar życia wiecznego",
    "url": "https://polskieradio.cc/wyszukiwarka?q=J+3:16",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "zbawienie",
    "verses": [
      "J 3:16",
      "J 3:17"
    ],
    "text": "Tak bowiem Bóg umiłował świat, że dał swego Jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne. Bo Bóg nie posłał swego Syna na świat, aby potępił świat, lecz aby świat był przez niego zbawiony."
  },
  {
    "id": "rag-laska-eph-2-8-9",
    "title": "List do Efezjan 2:8-9 — Zbawienie z łaski przez wiarę, dar Boży",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Ef+2:8-9",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "laska",
    "verses": [
      "Ef 2:8",
      "Ef 2:9",
      "Ef 2:10"
    ],
    "text": "Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił. Jesteśmy bowiem jego dziełem, stworzeni w Chrystusie Jezusie do dobrych uczynków, które Bóg przygotował, abyśmy w nich postępowali."
  },
  {
    "id": "rag-usprawiedliwienie-rom-3-23-24",
    "title": "List do Rzymian 3:23-24 — Wszyscy zgrzeszyli i darmo są usprawiedliwieni",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Rz+3:23-24",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "usprawiedliwienie",
    "verses": [
      "Rz 3:23",
      "Rz 3:24"
    ],
    "text": "Wszyscy bowiem zgrzeszyli i są pozbawieni chwały Bożej; a zostają usprawiedliwieni darmo, z jego łaski, przez odkupienie, które jest w Jezusie Chrystusie."
  },
  {
    "id": "rag-wyznanie-1jhn-1-9",
    "title": "1 List Jana 1:9 — Przebaczenie grzechów i oczyszczenie z niesprawiedliwości",
    "url": "https://polskieradio.cc/wyszukiwarka?q=1J+1:9",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "przebaczenie",
    "verses": [
      "1J 1:9"
    ],
    "text": "Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam odpuścić grzechy i oczyścić nas z wszelkiej niesprawiedliwości."
  },
  {
    "id": "rag-posrednik-1tim-2-5",
    "title": "1 List do Tymoteusza 2:5 — Jeden jest Bóg i jeden Pośrednik Jezus Chrystus",
    "url": "https://polskieradio.cc/wyszukiwarka?q=1Tm+2:5",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "posrednik",
    "verses": [
      "1Tm 2:5"
    ],
    "text": "Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus, który oddał samego siebie na okup za wszystkich, o czym świadectwo zostało złożone we właściwym czasie."
  },
  {
    "id": "rag-droga-jhn-14-6",
    "title": "Ewangelia Jana 14:6 — Jezus jest Drogą, Prawdą i Życiem",
    "url": "https://polskieradio.cc/wyszukiwarka?q=J+14:6",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "posrednik",
    "verses": [
      "J 14:6"
    ],
    "text": "Odpowiedział mu Jezus: Ja jestem drogą, prawdą i życiem. Nikt nie przychodzi do Ojca jak tylko przeze mnie."
  },
  {
    "id": "rag-imie-act-4-12",
    "title": "Dzieje Apostolskie 4:12 — Nie ma innego imienia pod niebem dla zbawienia",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Dz+4:12",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "posrednik",
    "verses": [
      "Dz 4:12"
    ],
    "text": "I nie ma w nikim innym zbawienia. Nie ma bowiem pod niebem żadnego innego imienia danego ludziom, przez które moglibyśmy być zbawieni."
  },
  {
    "id": "rag-szabat-exo-20-8-11",
    "title": "Księga Wyjścia 20:8-11 — Czwarte Przykazanie Dekalogu: Pamiętaj o dniu szabatu",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Wj+20:8-11",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "szabat",
    "verses": [
      "Wj 20:8",
      "Wj 20:9",
      "Wj 20:10",
      "Wj 20:11"
    ],
    "text": "Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracować i wykonywać wszystkie swoje prace; ale siódmy dzień jest szabatem PANA, twego Boga. [...] Gdyż przez sześć dni PAN stworzył niebo i ziemię, morze i wszystko, co jest w nich, a siódmego dnia odpoczął. Dlatego PAN pobłogosławił dzień szabatu i uświęcił go."
  },
  {
    "id": "rag-szabat-gen-2-2-3",
    "title": "Księga Rodzaju 2:2-3 — Ustanowienie Szabatu przy stworzeniu świata",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Rdz+2:2-3",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "szabat",
    "verses": [
      "Rdz 2:2",
      "Rdz 2:3"
    ],
    "text": "I odpoczął w siódmym dniu od wszelkiego swego dzieła, które uczynił. I pobłogosławił Bóg siódmy dzień, i uświęcił go, bo w nim odpoczął od wszelkiego swego dzieła, które stworzył i uczynił."
  },
  {
    "id": "rag-szabat-mrk-2-27-28",
    "title": "Ewangelia Marka 2:27-28 — Szabat dla człowieka, Syn Człowieczy Panem szabatu",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Mk+2:27-28",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "szabat",
    "verses": [
      "Mk 2:27",
      "Mk 2:28"
    ],
    "text": "I powiedział im: Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Tak więc Syn Człowieczy jest Panem także szabatu."
  },
  {
    "id": "rag-pokoj-php-4-6-7",
    "title": "List do Filipian 4:6-7 — Pokój Boży przewyższający wszelki rozum",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Flp+4:6-7",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "pokoj",
    "verses": [
      "Flp 4:6",
      "Flp 4:7"
    ],
    "text": "O nic się zbytnio nie troszczcie, ale we wszystkim w modlitwie i błaganiu z dziękczynieniem powierzcie wasze prośby Bogu. A pokój Boży, który przewyższa wszelki rozum, będzie strzegł waszych serc i myśli w Chrystusie Jezusie."
  },
  {
    "id": "rag-pokoj-jhn-14-27",
    "title": "Ewangelia Jana 14:27 — Mój pokój wam daję, niech się nie trwoży serce wasze",
    "url": "https://polskieradio.cc/wyszukiwarka?q=J+14:27",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "pokoj",
    "verses": [
      "J 14:27"
    ],
    "text": "Pokój zostawiam wam, mój pokój wam daję; nie daję wam tak, jak daje świat. Niech się nie trwoży wasze serce ani się nie lęka."
  },
  {
    "id": "rag-pasterz-psa-23",
    "title": "Psalm 23:1-4 — PAN jest moim pasterzem, niczego mi nie braknie",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Ps+23:1-4",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "pokoj",
    "verses": [
      "Ps 23:1",
      "Ps 23:2",
      "Ps 23:3",
      "Ps 23:4"
    ],
    "text": "PAN jest moim pasterzem, niczego mi nie braknie. Sprawia, że kładę się na zielonych pastwiskach, prowadzi mnie nad spokojne wody. [...] Choćbym nawet chodził doliną cienia śmierci, zła się nie ulęknę, bo ty jesteś ze mną; twoja laska i twój kij mnie pocieszają."
  },
  {
    "id": "rag-smierc-ecc-9-5-6",
    "title": "Księga Kaznodziei 9:5-6 — Umarli o niczym nie wiedzą aż do zmartwychwstania",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Kzn+9:5-6",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "zmartwychwstanie",
    "verses": [
      "Kzn 9:5",
      "Kzn 9:6"
    ],
    "text": "Żyjący bowiem wiedzą, że umrą, ale umarli o niczym nie wiedzą i nie mają już żadnej zapłaty, gdyż pamięć o nich poszła w zapomnienie. Zarówno ich miłość, jak i nienawiść oraz zazdrość już dawno zginęły i nigdy nie będą mieli udziału w niczym, co dzieje się pod słońcem."
  },
  {
    "id": "rag-zmartwychwstanie-1thess-4-16-17",
    "title": "1 List do Tesaloniczan 4:16-17 — Powtórne Przyjście i zmartwychwstanie sprawiedliwych",
    "url": "https://polskieradio.cc/wyszukiwarka?q=1Tes+4:16-17",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "zmartwychwstanie",
    "verses": [
      "1Tes 4:16",
      "1Tes 4:17"
    ],
    "text": "Gdyż sam Pan zstąpi z nieba z okrzykiem, z głosem archanioła i z trąbą Bożą, a zmarli w Chrystusie powstaną pierwsi. Potem my, którzy żyjemy i pozostaniemy, razem z nimi będziemy porwani w chmurach naprzeciw Panu w powietrze; i tak zawsze będziemy z Panem."
  },
  {
    "id": "rag-trojorzedzie-rev-14-6-7",
    "title": "Apokalipsa 14:6-7 — Pierwsze Orędzie Anielskie: Ewangelia Wieczna i Sąd Boży",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Obj+14:6-7",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "apokalipsa",
    "verses": [
      "Obj 14:6",
      "Obj 14:7"
    ],
    "text": "I widziałem innego anioła lecącego środkiem nieba, który miał wieczną ewangelię, aby ją zwiastować mieszkańcom ziemi [...] mówiącego donośnym głosem: Bójcie się Boga i oddajcie mu chwałę, bo przyszła godzina jego sądu. Oddajcie pokłon temu, który stworzył niebo i ziemię, morze i źródła wód."
  },
  {
    "id": "rag-cierpliwosc-rev-14-12",
    "title": "Apokalipsa 14:12 — Wytrwałość świętych: Strzegą przykazań Boga i wiary Jezusa",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Obj+14:12",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "apokalipsa",
    "verses": [
      "Obj 14:12"
    ],
    "text": "Tu jest wytrwałość świętych, tu są ci, którzy strzegą przykazań Boga i wiary Jezusa."
  },
  {
    "id": "rag-nowa-ziemia-rev-21-3-4",
    "title": "Apokalipsa 21:3-4 — Otrze Bóg wszelką łzę, śmierci już nie będzie",
    "url": "https://polskieradio.cc/wyszukiwarka?q=Obj+21:3-4",
    "type": "scripture",
    "language": "pl",
    "author": "Uwspółcześniona Biblia Gdańska (UBG)",
    "license": "UBG_AUTHORIZED",
    "topic": "nadzieja",
    "verses": [
      "Obj 21:3",
      "Obj 21:4"
    ],
    "text": "Oto przybytek Boga jest z ludźmi i będzie mieszkał z nimi, a oni będą jego ludem, a sam Bóg będzie z nimi, będąc ich Bogiem. I otrze Bóg wszelką łzę z ich oczu, i śmierci już nie będzie ani smutku, ani krzyku, ani bólu już nie będzie, bo pierwsze rzeczy przeminęły."
  },
  {
    "id": "rag-cc-apokalipsa-wyklady",
    "title": "Apokalipsa — Księga Nadziei: Seria 28 wykładów biblijnych Cezarego Rogowskiego",
    "url": "https://polskieradio.cc/akademia/apokalipsa",
    "type": "course",
    "language": "pl",
    "author": "Cezary Rogowski (Christian Culture)",
    "license": "CC_ORIGINAL",
    "topic": "apokalipsa",
    "verses": [
      "Obj 1:1-3",
      "Obj 14:6-12",
      "Obj 21:1-7"
    ],
    "text": "Cykl 28 autorytatywnych wykładów teologicznych i historycznych z egzegezą werset po wersecie Księgi Objawienia. Apokalipsa nie jest księgą grozy, lecz chrystocentryczną Księgą Nadziei odsłaniającą zwycięstwo Baranka nad złem, odkupienie ludu Bożego i nastanie Nowej Ziemi."
  },
  {
    "id": "rag-cc-kurs-codzienny-jozef",
    "title": "Kurs Codzienny: Dzień 28 — Ja jestem Józef — Przebaczenie zamiast zemsty (Rdz 44–45)",
    "url": "https://polskieradio.cc/akademia/kurscodzienny/dzien-28",
    "type": "course",
    "language": "pl",
    "author": "Cezary Rogowski & Christian Culture",
    "license": "CC_ORIGINAL",
    "topic": "przebaczenie",
    "verses": [
      "Rdz 45:4-8",
      "Rdz 50:20"
    ],
    "text": "Lekcja studium Księgi Rodzaju w cyklu Z Biblią za Pan Brat. Kluczowy moment pojednania Józefa z braćmi w Egipcie. Przebaczenie jako decyzja wiary w suwerenność Bożą: Wy obmyśliliście przeciwko mnie zło, ale Bóg obrócił to w dobro, aby ocalić życie wielu ludzi."
  },
  {
    "id": "rag-cc-radio-247",
    "title": "Radio Christian Culture — 6 całodobowych kanałów nadawczych 24/7",
    "url": "https://polskieradio.cc/player",
    "type": "broadcast",
    "language": "pl",
    "author": "Christian Culture Media",
    "license": "CC_ORIGINAL",
    "topic": "radio",
    "verses": [
      "Rz 10:17",
      "Ps 150:1-6"
    ],
    "text": "Globalna platforma nadawcza PolskieRadio.cc: Program 1 (słowno-muzyczny), Radio Global (English worship & sermons), Biblia Audio PL (24/7 ciągłe czytanie Pisma Świętego UBG), Global Bible (anglojęzyczna Biblia Audio), Instrumental Worship (muzyka do modlitwy) oraz Biblia Śpiewana (słowa wersetów w pieśniach)."
  }
];

  // KATALOG TEMATYCZNY PISMA ŚWIĘTEGO & MODLITEWNIK CC (P5)
  // 12 Kanonicznych Wątków Wiary • UBG Canonical Text • Zero Cost First
  // =========================================================================
  const BIBLE_TOPICS = {
    wiara: {
      title: 'Wiara i Zaufanie Bogu — Pewność Rzeczy Niewidzialnych',
      slug: 'wiara',
      summary: 'Wiara biblijna to niezłomne zaufanie Bogu, Jego charakterowi i Jego obietnicom wbrew widzialnym okolicznościom. Rodzi się ze słuchania Słowa Bożego i przynosi owoc w posłuszeństwie miłości.',
      verses: [
        { ref: 'Hbr 11:1', text: 'A wiara jest pewnością tego, czego się spodziewamy, i dowodem tego, czego nie widzimy.' },
        { ref: 'Rz 10:17', text: 'Wiara więc jest ze słuchania, a słuchanie przez słowo Boże.' },
        { ref: 'Mk 11:24', text: 'Wszystko, o co w modlitwie prosicie, wierzcie, że otrzymacie, a stanie się wam.' },
        { ref: 'Prz 3:5-6', text: 'Ufaj PANU z całego swego serca i nie polegaj na swoim rozumie. Zważaj na niego na wszystkich swoich drogach, a on wyrówna twoje ścieżki.' }
      ],
      prayerTitle: 'Modlitwa o Pomnożenie Wiary i Niezłomne Zaufanie',
      prayerText: 'Panie Jezu Chryste, Ty jesteś Dawcą i Dokończycielem naszej wiary. Odrzucam wszelkie zwątpienie i opieram moje życie na Twojej niezmiennej obietnicy. Wierzę, że Twoje Słowo jest prawdą i że Ty prowadzisz moje drogi. Przymnóż mi wiary, abym nie zachwiał się w próbie, lecz oddawał Tobie chwałę każdego dnia. Amen.',
      studyUrl: '/mojabiblia?book=HEB&chapter=11',
      mediaUrl: '/player?q=wiara'
    },
    usprawiedliwienie: {
      title: 'Usprawiedliwienie z Wiary i Boża Łaska',
      slug: 'usprawiedliwienie',
      summary: 'Fundament ewangelii: darmowe usprawiedliwienie grzesznika z Bożej łaski wyłącznie przez wiarę w odkupieńczą ofiarę Jezusa Chrystusa na krzyżu, bez zasług z uczynków prawa.',
      verses: [
        { ref: 'Rz 3:24', text: 'Zostając usprawiedliwieni darmo, z jego łaski, przez odkupienie, które jest w Jezusie Chrystusie.' },
        { ref: 'Ef 2:8-9', text: 'Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił.' },
        { ref: 'Rz 5:1', text: 'Będąc więc usprawiedliwieni z wiary, mamy pokój z Bogiem przez naszego Pana Jezusa Chrystusa;' }
      ],
      prayerTitle: 'Modlitwa Dziękczynna za Dar Zbawienia i Łaskę',
      prayerText: 'Boże i Ojcze Niebiański, dziękuję Ci z całego serca, że z darmowej łaski, przez wiarę w Twojego Syna Jezusa Chrystusa, darowałeś mi wszystkie grzechy i dałeś życie wieczne. Wyznaję, że Jezus jest jedyną Drogą, Prawdą i Życiem. Moje zbawienie jest w Twojej darmowej łasce, a nie w moich zasługach. Bądź uwielbiony na wieki. Amen.',
      studyUrl: '/mojabiblia?book=ROM&chapter=3',
      mediaUrl: '/player?q=laska'
    },
    pokoj: {
      title: 'Boży Pokój i Ukojenie Lęku — Pokój Przewyższający Rozum',
      slug: 'pokoj',
      summary: 'Boży pokój (Szalom) nie jest brakiem burzy, lecz obecnością Chrystusa w sercu. Uwalnia od paraliżującego lęku i rozpaczy, chroniąc myśli i dając głębokie ukojenie.',
      verses: [
        { ref: 'Flp 4:6-7', text: 'O nic się zbytnio nie troszczcie, ale we wszystkim przez modlitwę i błaganie z dziękczynieniem niech wasze prośby będą przedstawiane Bogu. A pokój Boży, który przewyższa wszelki rozum, będzie strzegł waszych serc i myśli w Chrystusie Jezusie.' },
        { ref: 'J 14:27', text: 'Pokój zostawiam wam, mój pokój daję wam; nie daję wam tak, jak daje świat. Niech się nie trwoży wasze serce ani się nie lęka.' },
        { ref: 'Ps 4:8', text: 'W pokoju się położę i zasnę, bo ty sam, PANIE, sprawiasz, że mieszkam bezpiecznie.' }
      ],
      prayerTitle: 'Modlitwa o Wewnętrzny Pokój i Uwolnienie od Lęku',
      prayerText: 'Panie mój, w Twoje ręce składam wszelki niepokój, strach i troskę o jutro. Przyjmuję Twój pokój, który przewyższa wszelki ludzki rozum i który strzeże mego serca i myśli w Chrystusie Jezusie. Ty powiedziałeś: Niech się nie trwoży wasze serce ani się nie lęka. W Twoim pokoju kładę się i zasypiam, bo Ty sam, Panie, sprawiasz, że mieszkam bezpiecznie. Amen.',
      studyUrl: '/mojabiblia?book=PHP&chapter=4',
      mediaUrl: '/player?q=pokoj'
    },
    modlitwa: {
      title: 'Moc Modlitwy i Żywa Komunia z Ojcem',
      slug: 'modlitwa',
      summary: 'Modlitwa to oddech odrodzonej duszy — szczera, ufna rozmowa z Ojcem Niebiańskim w imieniu Jezusa Chrystusa, niosąca Bożą interwencję i przemianę ludzkiego serca.',
      verses: [
        { ref: 'Mt 6:6', text: 'Ale ty, gdy się modlisz, wejdź do swego pokoju, zamknij drzwi i módl się do twego Ojca, który jest w ukryciu, a twój Ojciec, który widzi w ukryciu, nagrodzi cię jawnie.' },
        { ref: '1 Tes 5:17', text: 'Nieustannie się módlcie.' },
        { ref: 'Jk 5:16', text: 'Wiele może usilna modlitwa sprawiedliwego.' }
      ],
      prayerTitle: 'Modlitwa o Ducha Modlitwy i Bliskość z Bogiem',
      prayerText: 'Ojcze nasz, który jesteś w niebie, dziękuję Ci, że Twoje ucho jest otwarte na wołanie Twoich dzieci. Napełnij mnie Duchem Świętym, naucz mnie modlić się nieustannie i trwać w Twojej obecności. Niech moja modlitwa będzie wonnym kadzidłem przed Twoim tronem, a moje serce niech zawsze szuka Twojej woli. Amen.',
      studyUrl: '/mojabiblia?book=MAT&chapter=6',
      mediaUrl: '/modlitwa'
    },
    nadzieja: {
      title: 'Żywa Nadzieja i Zmartwychwstanie w Chrystusie',
      slug: 'nadzieja',
      summary: 'Nadzieja chrześcijańska to nie życzeniowe myślenie, lecz pewna kotwica duszy oparta na fakcie historycznego zmartwychwstania Jezusa Chrystusa i obietnicy wiecznego życia.',
      verses: [
        { ref: '1 P 1:3', text: 'Błogosławiony niech będzie Bóg i Ojciec naszego Pana Jezusa Chrystusa, który według swego wielkiego miłosierdzia zrodził nas na nowo do żywej nadziei przez zmartwychwstanie Jezusa Chrystusa;' },
        { ref: 'Rz 15:13', text: 'A Bóg nadziei niech was napełni wszelką radością i pokojem w wierze, abyście obfitowali w nadzieję przez moc Ducha Świętego.' },
        { ref: 'Tyt 2:13', text: 'Oczekując błogosławionej nadziei i chwalebnego objawienia się wielkiego Boga i Zbawiciela naszego, Jezusa Chrystusa;' }
      ],
      prayerTitle: 'Modlitwa o Odnowienie Żywej Nadziei',
      prayerText: 'Boże wszelkiej nadziei, napełnij mnie wszelką radością i pokojem w wierze, abym obfitował w nadzieję przez moc Ducha Świętego. Choćbym przechodził przez ciemną dolinę, wiem, że mój Odkupiciel żyje i że przyjdzie dzień Jego chwały. Kotwico mojej duszy, w Tobie pokładam całą moją ufność. Amen.',
      studyUrl: '/mojabiblia?book=1PE&chapter=1',
      mediaUrl: '/player?q=nadzieja'
    },
    szabat: {
      title: 'Szabat — Dzień Pański i Pamiątka Stworzenia',
      slug: 'szabat',
      summary: 'Siódmy dzień tygodnia ustanowiony przez Boga przy stworzeniu (Rdz 2:2-3), włączony do Dekalogu (Wj 20:8-11) i potwierdzony przez Jezusa Chrystusa (Mk 2:27-28) jako święty dar odpoczynku i komunii ze Stwórcą.',
      verses: [
        { ref: 'Rdz 2:2-3', text: 'I ukończył Bóg w siódmym dniu swoje dzieło... I pobłogosławił Bóg dzień siódmy, i uświęcił go.' },
        { ref: 'Wj 20:8-11', text: 'Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracować... Ale siódmy dzień jest szabatem PANA, twego Boga.' },
        { ref: 'Mk 2:27-28', text: 'Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Dlatego Syn Człowieczy jest Panem także szabatu.' },
        { ref: 'Hbr 4:9', text: 'Pozostaje więc jeszcze odpoczynek dla ludu Bożego.' }
      ],
      prayerTitle: 'Modlitwa Szabatowa o Święty Boży Odpoczynek',
      prayerText: 'Święty Boże i Stwórco Wszechświata, dziękuję Ci za dar świętego dnia szabatu — pamiątkę Twojego wspaniałego stworzenia i odkupienia w Chrystusie. Wyciszam moje serce z codziennego znoju i oddaję ten czas na uwielbienie Ciebie, studiowanie Twojego Słowa i braterską miłość. Uświęć mnie w Twojej prawdzie. Amen.',
      studyUrl: '/mojabiblia?book=EXO&chapter=20',
      mediaUrl: '/player?q=szabat'
    },
    posrednik: {
      title: 'Jeden Jedyny Pośrednik — Jezus Chrystus',
      slug: 'posrednik',
      summary: 'Nowy Testament jednoznacznie naucza o jedynym arcykapłanie i pośredniku pomiędzy Bogiem Ojcem a ludzkością — zmartwychwstałym Chrystusie, który wstawia się za nami w niebiańskiej świątyni.',
      verses: [
        { ref: '1 Tm 2:5', text: 'Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus;' },
        { ref: 'Hbr 7:25', text: 'Dlatego też całkowicie może zbawić tych, którzy przez niego przychodzą do Boga, bo zawsze żyje, aby wstawiać się za nimi.' },
        { ref: 'J 14:6', text: 'Ja jestem drogą, prawdą i życiem. Nikt nie przychodzi do Ojca jak tylko przeze mnie.' }
      ],
      prayerTitle: 'Modlitwa przez Jedynego Pośrednika Jezusa Chrystusa',
      prayerText: 'Panie Jezu Chryste, człowieku i Synu Boży, Ty jesteś moim jedynym i doskonałym Arcykapłanem. Z ufnością przystępuję do tronu łaski, bo wiem, że Ty orędujesz za mną przed obliczem Ojca. Dziękuję Ci za przelaną krew na krzyżu Golgoty, która otworzyła mi drogę do samego serca Boga. Amen.',
      studyUrl: '/mojabiblia?book=1TI&chapter=2',
      mediaUrl: '/player?q=jezus'
    },
    proroctwa: {
      title: 'Proroctwa Daniela i Objawienia — Historia i Nadzieja',
      slug: 'proroctwa',
      summary: 'Wielka panorama historii zbawienia: proroctwa o sukcesji królestw, sądzie Bożym, powtórnym przyjściu Chrystusa i ostatecznym tryumfie Królestwa Bożego (Dn 2, Dn 7, Ap 14).',
      verses: [
        { ref: 'Dn 7:13-14', text: 'I oto w obłokach nieba przychodził jakby Syn Człowieczy... I dano mu panowanie, cześć i królestwo...' },
        { ref: 'Ap 14:6-7', text: 'I widziałem innego anioła... mającego wieczną ewangelię... Bójcie się Boga i oddajcie mu chwałę, gdyż przyszła godzina jego sądu.' },
        { ref: 'Ap 14:12', text: 'Tu jest cierpliwość świętych, tu są ci, którzy strzegą przykazań Boga i wiary Jezusa.' },
        { ref: '2 P 1:19', text: 'Mamy też mocniejsze słowo prorockie, a wy dobrze robicie, trzymając się go jak lampy świecącej w ciemnym miejscu...' }
      ],
      prayerTitle: 'Modlitwa o Czuwanie i Gotowość na Przyjście Pana',
      prayerText: 'Wszechmogący Panie, Twoje słowo prorockie jest pochodnią świecącą w ciemności tego świata. Daj mi czujne serce, mądrość Ducha i wierność Twoim przykazaniom w tych ostatecznych czasach. Spraw, abym głosił wieczną ewangelię z odwagą i radością, wołając wraz z całym Kościołem: Przyjdź, Panie Jezu! Amen.',
      studyUrl: '/mojabiblia?book=REV&chapter=14',
      mediaUrl: '/vod?q=apokalipsa'
    },
    przebaczenie: {
      title: 'Boże Przebaczenie, Oczyszczenie z Grzechu i Pojednanie',
      slug: 'przebaczenie',
      summary: 'Bóg jest gotowy przebaczyć każdy wyznany grzech dzięki krwi Chrystusa. Przebaczenie Boże uzdrawia z poczucia winy i uzdalnia nas do darowania win naszym winowajcom.',
      verses: [
        { ref: '1 J 1:9', text: 'Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości.' },
        { ref: 'Ps 103:12', text: 'Jak daleko jest wschód od zachodu, tak daleko oddalił od nas nasze występki.' },
        { ref: 'Ef 4:32', text: 'Bądźcie raczej dla siebie nawzajem życzliwi, miłosierni, przebaczając sobie, jak i wam Bóg przebaczył w Chrystusie.' }
      ],
      prayerTitle: 'Modlitwa o Przebaczenie i Czystość Serca',
      prayerText: 'Miłosierny Ojcze, wyznaję przed Tobą moje winy i słabości. Ty jesteś wierny i sprawiedliwy, aby odpuścić mi grzechy i oczyścić mnie z wszelkiej nieprawości. Usuwasz moje przewinienia tak daleko, jak wschód jest od zachodu. Ulecz moje serce i uzdolnij mnie, bym tak jak Ty przebaczył mi w Chrystusie, przebaczał wszystkim, którzy mnie zranili. Amen.',
      studyUrl: '/mojabiblia?book=1JN&chapter=1',
      mediaUrl: '/player?q=przebaczenie'
    },
    milosc: {
      title: 'Boża Miłość (Agape) i Największe Przykazanie',
      slug: 'milosc',
      summary: 'Bóg sam jest miłością. Miłość Boża objawiła się najpełniej w posłaniu Syna Bożego jako ofiary za nasze grzechy. Jest fundamentem i spoiwem wszelkiej doskonałości.',
      verses: [
        { ref: 'J 3:16', text: 'Tak bowiem Bóg umiłował świat, że dał swego jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne.' },
        { ref: '1 J 4:8', text: 'Kto nie miłuje, nie zna Boga, gdyż Bóg jest miłością.' },
        { ref: '1 Kor 13:4-8', text: 'Miłość jest cierpliwa, jest życzliwa... Miłość nigdy nie ustaje.' },
        { ref: 'Rz 5:5', text: 'A nadzieja nie zawodzi, bo miłość Boża jest rozlana w naszych sercach przez Ducha Świętego, który został nam dany.' }
      ],
      prayerTitle: 'Modlitwa o Wypełnienie Bożą Miłością',
      prayerText: 'Ojcze Niebiański, Ty tak umiłowałeś świat, że dałeś swego jednorodzonego Syna. Wlej Twoją miłość w moje serce przez Ducha Świętego, który został mi dany. Naucz mnie kochać prawdziwie — cierpliwie, łaskawie, bez zazdrości i bez szukania swego. Niech Twoja miłość we mnie będzie świadectwem dla wszystkich ludzi. Amen.',
      studyUrl: '/mojabiblia?book=1CO&chapter=13',
      mediaUrl: '/player?q=milosc'
    },
    uzdrowienie: {
      title: 'Boże Uzdrowienie — Pocieszenie, Siła i Ratunek w Chorobie',
      slug: 'uzdrowienie',
      summary: 'Bóg jest Lekarzem dusz i ciał. W cierpieniu i słabości ofiarowuje Swoją łaskę, pocieszenie, odnowienie sił i wierność, a ostatecznie uwolnienie od wszelkiego bólu i łez.',
      verses: [
        { ref: 'Iz 53:5', text: 'Lecz on był zraniony za nasze występki, starty za nasze nieprawości. Kara dla naszego pokoju była na nim, a jego ranami zostaliśmy uzdrowieni.' },
        { ref: 'Ps 103:3', text: 'On przebacza wszystkie twoje nieprawości, on uzdrawia wszystkie twoje choroby;' },
        { ref: 'Jk 5:14-15', text: 'Choruje ktoś wśród was? Niech zawoła starszych zboru i niech się modlą nad nim... A modlitwa wiary uzdrowi chorego i Pan go podźwignie;' }
      ],
      prayerTitle: 'Modlitwa o Boże Uzdrowienie i Siłę w Cierpieniu',
      prayerText: 'Panie Jezu, Ty wziąłeś na siebie nasze niemoc i nosiłeś nasze choroby, a w Twoich ranach jest nasze uzdrowienie. Wołam do Ciebie o zdrowie dla mojego ciała, ukojenie w bólu i pokój dla mojej duszy. Oddaję Ci moje życie i ufam Twojej wszechmocy i miłości. Bądź moją siłą i moim lekarzem. Amen.',
      studyUrl: '/mojabiblia?book=PSA&chapter=103',
      mediaUrl: '/player?q=uzdrowienie'
    },
    madrosc: {
      title: 'Boża Mądrość i Przewodnictwo Ducha Świętego',
      slug: 'madrosc',
      summary: 'Początkiem mądrości jest bojaźń Pańska. Bóg obiecuje udzielić obficie mądrości każdemu, kto prosi z wiarą, prowadząc przez labirynty życia światłem Swojego Słowa.',
      verses: [
        { ref: 'Prz 3:5-6', text: 'Ufaj PANU z całego swego serca i nie polegaj na swoim rozumie. Zważaj na niego na wszystkich swoich drogach, a on wyrówna twoje ścieżki.' },
        { ref: 'Jk 1:5', text: 'A jeśli komuś z was brakuje mądrości, niech prosi Boga, który daje wszystkim obficie i nie wymawia, a będzie mu dana.' },
        { ref: 'Ps 119:105', text: 'Twoje słowo jest pochodnią dla moich nóg i światłem na mojej ścieżce.' }
      ],
      prayerTitle: 'Modlitwa o Mądrość i Boże Prowadzenie',
      prayerText: 'Panie, Twoje Słowo jest lampą dla moich stóp i światłem na mojej ścieżce. Proszę Cię o dar Bożej mądrości z góry — czystej, miłującej pokój i pełnej dobrych owoców. Nie pozwól mi polegać na własnym rozumie, lecz daj mi w każdym kroku rozpoznawać Twoją wolę i podążać za głosem Twojego Ducha. Amen.',
      studyUrl: '/mojabiblia?book=PRO&chapter=3',
      mediaUrl: '/player?q=madrosc'
    }
  };


  // =========================================================================
  // BIBLIA INTELLIGENCE CC — ETAP P1: LINGWISTYKA, LEKSYKON, CROSS-REFS
  // Standard ZERO COST FIRST • STEPBible Data & SBLGNT (CC BY 4.0)
  // =========================================================================

  const TOP_LEMMAS = {
    G3056: {
      strong: 'G3056',
      lang: 'grc',
      original: 'λόγος',
      translit: 'logos',
      pronunciation: "lo'-gos",
      partOfSpeech: 'Rzeczownik męski (Noun Masculine)',
      definitionPl: 'Słowo, mowa, wypowiedź; boski Logos (odwieczne Słowo Boże, uosobiona Mądrość i Syn Boży Jezus Chrystus); sens, zamysł, sprawa.',
      kjvDef: 'word, saying, speech, treatise, utterance',
      origin: 'Od G3004 (legō - mówić, zbierać, zestawiać)',
      occurrences: 330,
      keyVerses: ['J 1:1', 'J 1:14', '1 J 1:1', 'Łk 1:2', 'Ap 19:13']
    },
    G0025: {
      strong: 'G0025',
      lang: 'grc',
      original: 'ἀγαπάω',
      translit: 'agapaō',
      pronunciation: "ag-ap-ah'-o",
      partOfSpeech: 'Czasownik (Verb)',
      definitionPl: 'Miłować, darzyć bezwarunkową, ofiarną miłością Bożą; cenić najwyżej, przedkładać dobro drugiego ponad własne.',
      kjvDef: 'to love',
      origin: 'Od G0026 (agapē - miłość Boża)',
      occurrences: 143,
      keyVerses: ['J 3:16', 'J 13:34', '1 J 4:19', 'Rz 8:37']
    },
    G0026: {
      strong: 'G0026',
      lang: 'grc',
      original: 'ἀγάπη',
      translit: 'agapē',
      pronunciation: "ag-ah'-pay",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Miłość bezwarunkowa, ofiarna i doskonała; Boża miłość wylewana w serca wierzących przez Ducha Świętego.',
      kjvDef: 'love, charity',
      origin: 'Od G0025 (agapaō)',
      occurrences: 116,
      keyVerses: ['1 Kor 13:4', '1 Kor 13:13', '1 J 4:8', 'Rz 5:5']
    },
    G2316: {
      strong: 'G2316',
      lang: 'grc',
      original: 'θεός',
      translit: 'theos',
      pronunciation: "theh'-os",
      partOfSpeech: 'Rzeczownik męski (Noun Masculine)',
      definitionPl: 'Bóg, Najwyższy Stwórca, Bóstwo; Jedyny prawdziwy Bóg Ojciec, Syn i Duch Święty.',
      kjvDef: 'God',
      origin: 'Pierwotne określenie Boga w grece biblijnej',
      occurrences: 1317,
      keyVerses: ['J 1:1', 'J 3:16', '1 Tm 2:5', '1 J 4:8']
    },
    G5485: {
      strong: 'G5485',
      lang: 'grc',
      original: 'χάρις',
      translit: 'charis',
      pronunciation: "khar'-ece",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Łaska, niezasłużona Boża przychylność i życzliwość niosąca zbawienie; dar darmowy dla wierzącego.',
      kjvDef: 'grace, favour, acceptable, benefit, gift, grace, gracious',
      origin: 'Od G5463 (chairō - radować się)',
      occurrences: 155,
      keyVerses: ['Ef 2:8', 'Rz 3:24', 'Tyt 2:11', '2 Kor 12:9']
    },
    G4102: {
      strong: 'G4102',
      lang: 'grc',
      original: 'πίστις',
      translit: 'pistis',
      pronunciation: "pis'-tis",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Wiara, zaufanie, wierność, pewność obietnic Bożych; podstawa usprawiedliwienia chrześcijanina.',
      kjvDef: 'faith, fidelity, belief',
      origin: 'Od G3982 (peithō - przekonać, zaufać)',
      occurrences: 243,
      keyVerses: ['Hbr 11:1', 'Rz 1:17', 'Ef 2:8', 'Rz 5:1']
    },
    G4151: {
      strong: 'G4151',
      lang: 'grc',
      original: 'πνεῦμα',
      translit: 'pneuma',
      pronunciation: "pnyoo'-mah",
      partOfSpeech: 'Rzeczownik nijaki (Noun Neuter)',
      definitionPl: 'Duch, Duch Święty, tchnienie życia, wiatr; niematerialna Boża obecność i trzecia Osoba Bóstwa.',
      kjvDef: 'Spirit, Holy Ghost, breath, wind',
      origin: 'Od G4154 (pneō - oddychać, wiać)',
      occurrences: 379,
      keyVerses: ['J 3:8', 'J 14:26', 'Dz 1:8', 'Rz 8:16', 'Gal 5:22']
    },
    G2222: {
      strong: 'G2222',
      lang: 'grc',
      original: 'ζωή',
      translit: 'zōē',
      pronunciation: "dzo-ay'",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Życie — w wymiarze duchowym i wiecznym; życie w obfitości z Boga przeciwstawione śmierci grzechu.',
      kjvDef: 'life',
      origin: 'Od G2198 (zaō - żyć)',
      occurrences: 135,
      keyVerses: ['J 3:16', 'J 14:6', '1 J 5:12', 'Rz 6:23']
    },
    H7225: {
      strong: 'H7225',
      lang: 'he',
      original: 'רֵאשִׁית',
      translit: 'rē’šît',
      pronunciation: "ray-sheet'",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Początek, pierwocina, zarzewie czasu, najlepsza część; słowo otwierające Biblię w Rdz 1:1 (Bereszit).',
      kjvDef: 'beginning, chief, firstfruits, part, principal',
      origin: 'Od H7218 (rō’š - głowa, wierzchołek)',
      occurrences: 51,
      keyVerses: ['Rdz 1:1', 'Prz 1:7', 'Prz 8:22', 'Pwt 11:12']
    },
    H7676: {
      strong: 'H7676',
      lang: 'he',
      original: 'שַׁבָּת',
      translit: 'shabbāt',
      pronunciation: "shab-bawth'",
      partOfSpeech: 'Rzeczownik żeński (Noun Feminine)',
      definitionPl: 'Szabat, odpoczynek, siódmy dzień tygodnia uświęcony przez Boga przy stworzeniu (Rdz 2:2-3) i wpisany w Dekalog (Wj 20:8-11).',
      kjvDef: 'Sabbath',
      origin: 'Od H7673 (shābat - ustać, odpocząć, zaprzestać pracy)',
      occurrences: 111,
      keyVerses: ['Wj 20:8', 'Wj 31:13', 'Iz 58:13', 'Kpł 23:3']
    },
    H1254: {
      strong: 'H1254',
      lang: 'he',
      original: 'בָּרָא',
      translit: 'bārā’',
      pronunciation: "baw-raw'",
      partOfSpeech: 'Czasownik (Verb)',
      definitionPl: 'Stworzyć, ukształtować z niczego; czasownik w Biblii używany WYŁĄCZNIE o suwerennym działaniu samego Boga.',
      kjvDef: 'create, creator, make',
      origin: 'Rdzeń semicki oznaczający akt stwórczy Boga',
      occurrences: 54,
      keyVerses: ['Rdz 1:1', 'Rdz 1:27', 'Iz 40:28', 'Ps 51:10']
    },
    H0430: {
      strong: 'H0430',
      lang: 'he',
      original: 'אֱלֹהִים',
      translit: '’ĕlōhîm',
      pronunciation: "el-o-heem'",
      partOfSpeech: 'Rzeczownik męski w liczbie mnogiej majestatycznej (Plural of Majesty)',
      definitionPl: 'Bóg Najwyższy, Stwórca; forma gramatyczna wyrażająca pełnię majestatu, mocy i potęgi jedynego Boga.',
      kjvDef: 'God, gods, judge',
      origin: 'Od H0433 (’ĕlôah - bóstwo, moc)',
      occurrences: 2606,
      keyVerses: ['Rdz 1:1', 'Pwt 6:4', 'Ps 19:1', 'Iz 45:18']
    },
    H3068: {
      strong: 'H3068',
      lang: 'he',
      original: 'יְהוָה',
      translit: 'YHWH / Yahweh',
      pronunciation: 'yah-weh',
      partOfSpeech: 'Imię własne Boga (Tetragramaton)',
      definitionPl: 'PAN (JHWH) — wieczne, osobiste i przymierzowe Imię Boga: „JESTEM, KTÓRY JESTEM”; Ten, który trwa wiecznie i dochowuje przymierza.',
      kjvDef: 'LORD, GOD, Jehovah',
      origin: 'Od H1961 (hāyāh - być, istnieć, stawać się)',
      occurrences: 6828,
      keyVerses: ['Wj 3:14', 'Wj 20:2', 'Pwt 6:4', 'Ps 23:1', 'Iz 42:8']
    },
    H7965: {
      strong: 'H7965',
      lang: 'he',
      original: 'שָׁלוֹם',
      translit: 'shālôm',
      pronunciation: "shaw-lome'",
      partOfSpeech: 'Rzeczownik męski (Noun Masculine)',
      definitionPl: 'Pokój, pełnia, pomyślność, zdrowie, bezpieczeństwo; stan harmonii i pojednania człowieka z Bogiem.',
      kjvDef: 'peace, well, welfare, prosperity',
      origin: 'Od H7999 (shālam - być całym, pojednać się)',
      occurrences: 237,
      keyVerses: ['Lb 6:26', 'Iz 9:6', 'Ps 122:6', 'Jer 29:11']
    },
    H7307: {
      strong: 'H7307',
      lang: 'he',
      original: 'רוּחַ',
      translit: 'rûaḥ',
      pronunciation: "roo'-akh",
      partOfSpeech: 'Rzeczownik żeński/męski',
      definitionPl: 'Duch, tchnienie, wiatr; Duch Boży unoszący się nad wodami (Rdz 1:2), dający życie i natchnienie prorokom.',
      kjvDef: 'Spirit, wind, breath',
      origin: 'Rdzeń oznaczający powiew, tchnienie życia',
      occurrences: 378,
      keyVerses: ['Rdz 1:2', 'Ez 37:9', 'Za 4:6', 'Ps 104:30']
    },
    H2617: {
      strong: 'H2617',
      lang: 'he',
      original: 'חֶסֶד',
      translit: 'ḥesed',
      pronunciation: "kheh'-sed",
      partOfSpeech: 'Rzeczownik męski (Noun Masculine)',
      definitionPl: 'Miłosierdzie, łaska, niezłomna miłość przymierzowa; lojalność i dobroć Boga trwająca na wieki.',
      kjvDef: 'mercy, kindness, lovingkindness, goodness',
      origin: 'Od H2616 (ḥāsad - okazać dobroć, być łaskawym)',
      occurrences: 248,
      keyVerses: ['Ps 136:1', 'Ps 23:6', 'Wj 34:6', 'Oz 6:6']
    }
  };

  const LEMMA_ALIASES = {
    logos: 'G3056',
    agape: 'G0026',
    agapao: 'G0025',
    theos: 'G2316',
    charis: 'G5485',
    pistis: 'G4102',
    pneuma: 'G4151',
    zoe: 'G2222',
    reszit: 'H7225',
    bereszit: 'H7225',
    reshit: 'H7225',
    szabat: 'H7676',
    shabbat: 'H7676',
    sabat: 'H7676',
    bara: 'H1254',
    elohim: 'H0430',
    jahwe: 'H3068',
    yahweh: 'H3068',
    jhwh: 'H3068',
    shalom: 'H7965',
    szalom: 'H7965',
    ruach: 'H7307',
    chesed: 'H2617'
  };

  function detectStrongOrLemma(query) {
    if (!query) return null;
    const raw = query.trim();
    const strongM = raw.match(/^([GHgh])\s*(\d{1,5})$/);
    if (strongM) {
      const prefix = strongM[1].toUpperCase();
      const num = parseInt(strongM[2], 10);
      const pad4 = prefix + String(num).padStart(4, '0');
      const padDirect = prefix + num;
      if (TOP_LEMMAS[pad4]) return TOP_LEMMAS[pad4];
      if (TOP_LEMMAS[padDirect]) return TOP_LEMMAS[padDirect];
      return {
        strong: pad4,
        lang: prefix === 'G' ? 'grc' : 'he',
        original: prefix === 'G' ? 'Tekst Grecki (SBLGNT)' : 'Tekst Hebrajski (Masorecki)',
        translit: pad4,
        pronunciation: pad4,
        partOfSpeech: prefix === 'G' ? 'Greka Koine NT' : 'Hebrajski biblijny ST',
        definitionPl: 'Hasło leksykonu Stronga ' + pad4 + '. Zbadaj morfologię, etymologię i wszystkie wystąpienia w MojaBiblia.',
        origin: 'STEPBible-Data / Tyndale House Cambridge (CC BY 4.0)',
        occurrences: 0,
        keyVerses: []
      };
    }
    const norm = raw.toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z').trim();
    const mapped = LEMMA_ALIASES[norm];
    if (mapped && TOP_LEMMAS[mapped]) return TOP_LEMMAS[mapped];
    return null;
  }

  const TOP_CROSS_REFS = {
    "JHN:3:16": [
      { ref: "Rz 5:8", relation: "PARALELA", text: "Lecz Bóg okazuje swoją miłość do nas przez to, że gdy jeszcze byliśmy grzesznikami, Chrystus za nas umarł." },
      { ref: "1 J 4:9", relation: "PARALELA", text: "W tym objawiła się miłość Boga ku nam, że Bóg posłał swego jednorodzonego Syna na świat, abyśmy żyli przez niego." },
      { ref: "Ef 2:4-5", relation: "WSPÓLNY MOTYW", text: "Lecz Bóg, który jest bogaty w miłosierdzie, z powodu swojej wielkiej miłości... ożywił nas razem z Chrystusem." }
    ],
    "ROM:8:28": [
      { ref: "Jer 29:11", relation: "PARALELA", text: "Gdyż ja znam myśli, które mam o was, mówi PAN: myśli o pokoju, a nie o utrapieniu, aby zapewnić wam koniec, jakiego oczekujecie." },
      { ref: "Ef 1:11", relation: "WSPÓLNY MOTYW", text: "W nim, mówię, w którym też otrzymaliśmy dziedzictwo, przeznaczeni według postanowienia tego, który dokonuje wszystkiego..." }
    ],
    "PSA:23:1": [
      { ref: "J 10:11", relation: "SPEŁNIENIE PROROCZE", text: "Ja jestem dobrym pasterzem. Dobry pasterz oddaje swoje życie za owce." },
      { ref: "Flp 4:19", relation: "PARALELA", text: "A mój Bóg zaspokoi wszelką waszą potrzebę według swego bogactwa w chwale, w Chrystusie Jezusie." }
    ],
    "GEN:2:2": [
      { ref: "Wj 20:11", relation: "CYTAT BEZPOŚREDNI", text: "Gdyż w sześciu dniach PAN stworzył niebo i ziemię, morze i wszystko, co w nich jest, a w siódmym dniu odpoczął." },
      { ref: "Hbr 4:4", relation: "CYTAT BEZPOŚREDNI", text: "Powiedział bowiem na jednym miejscu o siódmym dniu tak: I odpoczął Bóg w siódmym dniu od wszystkich swych dzieł." }
    ],
    "EXO:20:8": [
      { ref: "Rdz 2:3", relation: "WSPÓLNY MOTYW", text: "I pobłogosławił Bóg dzień siódmy, i uświęcił go, bo w nim odpoczął od wszelkiego swego dzieła." },
      { ref: "Mk 2:27-28", relation: "NAUCZANIE CHRYSTUSA", text: "Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Dlatego Syn Człowieczy jest Panem także szabatu." }
    ],
    "1TI:2:5": [
      { ref: "Hbr 8:6", relation: "PARALELA", text: "Teraz zaś otrzymał tym znakomitszą służbę, im lepszego przymierza jest pośrednikiem, które zostało ustanowione na lepszych obietnicach." },
      { ref: "J 14:6", relation: "PARALELA", text: "Jezus mu odpowiedział: Ja jestem drogą, prawdą i życiem. Nikt nie przychodzi do Ojca jak tylko przeze mnie." }
    ],
    "DAN:7:13": [
      { ref: "Mt 24:30", relation: "SPEŁNIENIE PROROCZE", text: "I wówczas ukaże się na niebie znak Syna Człowieczego... i ujrzą Syna Człowieczego przychodzącego na obłokach nieba z mocą i wielką chwałą." },
      { ref: "Ap 1:7", relation: "SPEŁNIENIE PROROCZE", text: "Oto przychodzi z obłokami i ujrzy go wszelkie oko, także ci, którzy go przebili." }
    ],
    "REV:14:6": [
      { ref: "Ap 14:12", relation: "KONTEKST PERYKOPY", text: "Tu jest cierpliwość świętych, tu są ci, którzy strzegą przykazań Boga i wiary Jezusa." },
      { ref: "Wj 20:11", relation: "ALUZJA DO DEKALOGU", text: "Pokłońcie się temu, który stworzył niebo i ziemię, morze i źródła wód." }
    ]
  };

  const TOP_INTERLINEAR_TOKENS = {
    "JHN:3:16": [
      { orig: "οὕτως", translit: "houtōs", strong: "G3779", gloss: "tak" },
      { orig: "γὰρ", translit: "gar", strong: "G1063", gloss: "bowiem" },
      { orig: "ἠγάπησεν", translit: "ēgapēsen", strong: "G0025", gloss: "umiłował" },
      { orig: "ὁ θεὸς", translit: "ho theos", strong: "G2316", gloss: "Bóg" },
      { orig: "τὸν κόσμον", translit: "ton kosmon", strong: "G2889", gloss: "świat" },
      { orig: "υἱὸν", translit: "huion", strong: "G5207", gloss: "Syna" },
      { orig: "μονογενῆ", translit: "monogenē", strong: "G3439", gloss: "jednorodzonego" },
      { orig: "πιστεύων", translit: "pisteuōn", strong: "G4100", gloss: "wierzący" },
      { orig: "ζωὴν αἰώνιον", translit: "zōēn aiōnion", strong: "G2222", gloss: "życie wieczne" }
    ],
    "GEN:1:1": [
      { orig: "בְּרֵאשִׁית", translit: "bərē’šît", strong: "H7225", gloss: "na początku", isRtl: true },
      { orig: "בָּרָא", translit: "bārā’", strong: "H1254", gloss: "stworzył", isRtl: true },
      { orig: "אֱלֹהִים", translit: "’ĕlōhîm", strong: "H0430", gloss: "Bóg", isRtl: true },
      { orig: "הַשָּׁמַיִם", translit: "haššāmayim", strong: "H8064", gloss: "niebo", isRtl: true },
      { orig: "הָאָרֶץ", translit: "hā’āreṣ", strong: "H0776", gloss: "ziemię", isRtl: true }
    ],
    "PSA:23:1": [
      { orig: "יְהוָה", translit: "YHWH", strong: "H3068", gloss: "PAN", isRtl: true },
      { orig: "רֹעִי", translit: "rō‘î", strong: "H7462", gloss: "pasterzem moim", isRtl: true },
      { orig: "לֹא אֶחְסָר", translit: "lō’ ’eḥsār", strong: "H2637", gloss: "nie zabraknie mi", isRtl: true }
    ],
    "EXO:20:8": [
      { orig: "זָכוֹר", translit: "zāḵôr", strong: "H2142", gloss: "pamiętaj", isRtl: true },
      { orig: "אֶת־יוֹם", translit: "’eṯ-yôm", strong: "H3117", gloss: "dzień", isRtl: true },
      { orig: "הַשַּׁבָּת", translit: "haššabbāṯ", strong: "H7676", gloss: "szabatu", isRtl: true },
      { orig: "לְקַדְּשׁוֹ", translit: "ləqaddəšô", strong: "H6942", gloss: "aby go święcić", isRtl: true }
    ]
  };

    function detectBibleTopic(query) {
    if (!query) return null;
    const norm = query.toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z').trim();

    if (norm.includes('usprawiedliwien') || norm.includes('laska boza') || norm.includes('zbawien') || norm.includes('z laski') || norm.includes('darmo')) return BIBLE_TOPICS.usprawiedliwienie;
    if (norm.includes('wiar') || norm.includes('wierz') || norm.includes('zaufan') || norm.includes('niewidzialn')) return BIBLE_TOPICS.wiara;
    if (norm.includes('pokoj') || norm.includes('spokoj') || norm.includes('lek') || norm.includes('strach') || norm.includes('niepokoj') || norm.includes('ukojenie')) return BIBLE_TOPICS.pokoj;
    if (norm.includes('modlitw') || norm.includes('modlic') || norm.includes('wstawiennictw') || norm.includes('ojcze nasz')) return BIBLE_TOPICS.modlitwa;
    if (norm.includes('nadziej') || norm.includes('zmartwychwstan') || norm.includes('otucha')) return BIBLE_TOPICS.nadzieja;
    if (norm.includes('szabat') || norm.includes('sabat') || norm.includes('dzien siodmy') || norm.includes('dzien panski') || norm.includes('odpocznien')) return BIBLE_TOPICS.szabat;
    if (norm.includes('posrednik') || norm.includes('arcykaplan') || norm.includes('jedyny posrednik') || norm.includes('oredownik')) return BIBLE_TOPICS.posrednik;
    if (norm.includes('proroctw') || norm.includes('apokalips') || norm.includes('daniel') || norm.includes('trzy poselstwa') || norm.includes('paruzj') || norm.includes('powtorne przyjscie')) return BIBLE_TOPICS.proroctwa;
    if (norm.includes('przebaczen') || norm.includes('odpuszczen') || norm.includes('pojednan') || norm.includes('oczyszczen z grzech')) return BIBLE_TOPICS.przebaczenie;
    if (norm.includes('milosc') || norm.includes('agape') || norm.includes('milowac') || norm.includes('przykazanie milosci')) return BIBLE_TOPICS.milosc;
    if (norm.includes('uzdrowien') || norm.includes('chorob') || norm.includes('uleczen') || norm.includes('cierpien') || norm.includes('lekarz')) return BIBLE_TOPICS.uzdrowienie;
    if (norm.includes('madrosc') || norm.includes('przewodnictw') || norm.includes('rozeznan')) return BIBLE_TOPICS.madrosc;

    return null;
  }


  // =========================================================================
  // ATLAS BIBLIJNY & GEOGRAFIA SACRA (Biblia Intelligence CC — P2)
  // Źródła: OpenBible Geocoding Data (CC BY 4.0 - R13), Wikidata (CC0 - R18),
  // OpenStreetMap (ODbL - R20). Standard ZERO COST FIRST.
  // =========================================================================
  const BIBLE_PLACES = {
    jerusalem: {
      id: 'jerusalem',
      name: 'Jerozolima (Syjon / Miasto Dawida)',
      origName: 'יְרוּשָׁלַםִ / Ierousalēm',
      lang: 'he',
      region: 'Judea / Góry Judzkie',
      coords: { lat: 31.7767, lon: 35.2345 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q1218',
      summary: 'Centralne miasto historii biblijnej: stolica Królestwa Dawida i Salomona, miejsce Świątyni Pańskiej, ukrzyżowania i zmartwychwstania Jezusa Chrystusa, zesłania Ducha Świętego oraz zapowiedź Nowego Jeruzalem.',
      verses: [
        { ref: 'Ps 122:6', text: 'Proście o pokój dla Jeruzalem: Niech zażywają pokoju ci, którzy cię miłują!' },
        { ref: 'Łk 24:47', text: 'I aby w jego imieniu głoszono pokutę i przebaczenie grzechów wszystkim narodom, począwszy od Jerozolimy.' },
        { ref: 'Ap 21:2', text: 'A ja, Jan, widziałem święte miasto, Nowe Jeruzalem, zstępujące z nieba od Boga, przygotowane jak oblubienica ozdobiona dla swego męża.' }
      ],
      studyUrl: '/mojabiblia?q=Jerozolima',
      aliases: ['jerozolima', 'jeruzalem', 'syjon', 'miasto dawida', 'morijja', 'jerusalem']
    },
    bethlehem: {
      id: 'bethlehem',
      name: 'Betlejem (Efrata)',
      origName: 'בֵּית לֶחֶם / Bēth Leḥem',
      lang: 'he',
      region: 'Judea (ok. 8 km na południe od Jerozolimy)',
      coords: { lat: 31.7054, lon: 35.2024 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q5662',
      summary: 'Dosłownie „Dom Chleba”. Miasto narodzin króla Dawida oraz prorocze miejsce narodzenia Mesjasza — Jezusa Chrystusa (Mi 5:2), który jest Prawdziwym Chlebem Żywota.',
      verses: [
        { ref: 'Mi 5:2', text: 'Ale ty, Betlejem Efrata, choć jesteś najmniejsze wśród tysięcy w Judzie, z ciebie wyjdzie mi ten, który ma być władcą w Izraelu...' },
        { ref: 'Mt 2:1', text: 'Gdy zaś Jezus urodził się w Betlejem w Judei za dni króla Heroda, oto mędrcy ze Wschodu przybyli do Jerozolimy;' },
        { ref: 'Łk 2:4', text: 'Poszedł też Józef z Galilei, z miasta Nazaret, do Judei, do miasta Dawida, zwanego Betlejem...' }
      ],
      studyUrl: '/mojabiblia?q=Betlejem',
      aliases: ['betlejem', 'efrata', 'bethlehem']
    },
    nazareth: {
      id: 'nazareth',
      name: 'Nazaret',
      origName: 'Ναζαρέτ / Nazaret',
      lang: 'grc',
      region: 'Dolna Galilea',
      coords: { lat: 32.7019, lon: 35.3035 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q430776',
      summary: 'Miejscowość dzieciństwa i młodości Jezusa Chrystusa, skąd wziął się Jego tytuł „Jezus z Nazaretu” (Nazarejczyk). Miejsce zwiastowania Maryi przez archanioła Gabriela.',
      verses: [
        { ref: 'Łk 1:26', text: 'A w szóstym miesiącu Bóg posłał anioła Gabriela do miasta w Galilei, zwanego Nazaret;' },
        { ref: 'Mt 2:23', text: 'A przyszedłszy, zamieszkał w mieście zwanym Nazaret, aby się spełniło, co zostało powiedziane przez proroków: Będzie nazwany Nazarejczykiem.' },
        { ref: 'J 1:46', text: 'I powiedział mu Natanael: Czy z Nazaretu może być coś dobrego? Filip mu odpowiedział: Chodź i zobacz!' }
      ],
      studyUrl: '/mojabiblia?q=Nazaret',
      aliases: ['nazaret', 'nazareth', 'nazarejczyk']
    },
    capernaum: {
      id: 'capernaum',
      name: 'Kafarnaum (Kfar Nahum)',
      origName: 'כְּפַר נַחוּם / Kapharnaoum',
      lang: 'he',
      region: 'Północny brzeg Jeziora Galilejskiego (Tal Hum)',
      coords: { lat: 32.8805, lon: 35.5750 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q193139',
      summary: 'Główna baza galilejskiej służby Jezusa, nazwana w Ewangelii „Jego miastem” (Mt 9:1). Miejsce powołania celnika Mateusza, uzdrowienia sługi setnika i wygłoszenia mowy o Chlebie Życia w tamtejszej synagodze.',
      verses: [
        { ref: 'Mt 4:13', text: 'I opuściwszy Nazaret, przyszedł i zamieszkał w Kafarnaum, nad morzem, w granicach Zabulona i Neftalego;' },
        { ref: 'Mk 2:1', text: 'Po kilku dniach znowu wszedł do Kafarnaum i usłyszano, że jest w domu.' },
        { ref: 'J 6:59', text: 'To mówił w synagodze, nauczając w Kafarnaum.' }
      ],
      studyUrl: '/mojabiblia?q=Kafarnaum',
      aliases: ['kafarnaum', 'capernaum', 'kfar nahum']
    },
    sinai: {
      id: 'sinai',
      name: 'Góra Synaj (Horeb / Dżabal Musa)',
      origName: 'סִינַי / Har Sīnay',
      lang: 'he',
      region: 'Półwysep Synaj',
      coords: { lat: 28.5397, lon: 33.9750 },
      certainty: 'PRAWDOPODOBNA / TRADYCYJNA',
      wikidataId: 'Q377485',
      summary: 'Święta góra Bożego Przymierza: miejsce objawienia się Boga w krzewie gorejącym, ogłoszenia Dekalogu (Dziesięciu Przykazań) Mojżeszowi, zawarcia przymierza z Izraelem oraz ucieczki i odnowienia proroka Eliasza.',
      verses: [
        { ref: 'Wj 19:18', text: 'A cała góra Synaj dymiła, gdyż PAN zstąpił na nią w ogniu; i unosił się dym z niej jak dym z pieca, a cała góra bardzo się trzęsła.' },
        { ref: 'Wj 20:1-2', text: 'Wtedy Bóg mówił wszystkie te słowa: Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli.' },
        { ref: '1 Krl 19:8', text: 'Wstał więc, pojadł i popił, a posiliwszy się tym pokarmem, szedł czterdzieści dni i czterdzieści nocy aż do Bożej góry Horeb.' }
      ],
      studyUrl: '/mojabiblia?q=Synaj',
      aliases: ['synaj', 'horeb', 'gora synaj', 'gora horeb', 'mount sinai', 'sinai']
    },
    jericho: {
      id: 'jericho',
      name: 'Jerycho (Miasto Palm / Tell es-Sultan)',
      origName: 'יְרִיחוֹ / Yərīḥō',
      lang: 'he',
      region: 'Dolina Dolnego Jordanu (Depresja Morza Martwego)',
      coords: { lat: 31.8706, lon: 35.4444 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q5788',
      summary: 'Jedno z najstarszych stale zamieszkanych miast świata (ok. 250 m p.p.m.). Miejsce cudownego upadku murów za czasów Jozuego, ocalenia Rachab oraz spotkania Jezusa z Zacheuszem i uzdrowienia ślepego Bartymeusza.',
      verses: [
        { ref: 'Joz 6:20', text: 'Wtedy lud krzyknął i zadęli w trąby. A gdy lud usłyszał dźwięk trąb i wzniósł wielki okrzyk, mur runął na swoje miejsce...' },
        { ref: 'Łk 19:1-2', text: 'Potem wszedł do Jerycha i przechodził przez nie. A był tam pewien człowiek, imieniem Zacheusz, który był przełożonym celników i był bogaty.' },
        { ref: 'Hbr 11:30', text: 'Przez wiarę runęły mury Jerycha, gdy je obchodzono dokoła przez siedem dni.' }
      ],
      studyUrl: '/mojabiblia?q=Jerycho',
      aliases: ['jerycho', 'jericho', 'tell es-sultan', 'miasto palm']
    },
    hebron: {
      id: 'hebron',
      name: 'Hebron (Kiriat-Arba / Grobowiec Patriarchów)',
      origName: 'חֶבְרוֹן / Ḥevrōn',
      lang: 'he',
      region: 'Góry Judzkie (Judea)',
      coords: { lat: 31.5297, lon: 35.0938 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q16869',
      summary: 'Jedno z najstarszych miast Judy: miejsce pobytu Abrahama, Izaaka i Jakuba, pieczary Makpela (miejsca pochówku patriarchów) oraz pierwsza stolica króla Dawida, gdzie panował przez 7 lat i 6 miesięcy.',
      verses: [
        { ref: 'Rdz 23:19', text: 'I potem Abraham pochował Sarę, swoją żonę, w jaskini na polu Makpela naprzeciw Mamre, czyli Hebronu, w ziemi Kanaan.' },
        { ref: '2 Sm 2:1-4', text: 'I zapytał Dawid PANA: Czy mam iść do któregoś z miast Judy?... Do Hebronu... I namaścili tam Dawida na króla nad domem Judy.' }
      ],
      studyUrl: '/mojabiblia?q=Hebron',
      aliases: ['hebron', 'makpela', 'kiriat-arba', 'kiriat arba', 'mamre']
    },
    babylon: {
      id: 'babylon',
      name: 'Babilon (Babel / Mezopotamia)',
      origName: 'בָּבֶל / Babylōn',
      lang: 'he',
      region: 'Mezopotamia (współczesny Irak nad Eufratem)',
      coords: { lat: 32.5364, lon: 44.4208 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q5684',
      summary: 'Symbol buntu człowieka przeciw Bogu od wieży Babel (Rdz 11), imperium Nabuchodonozora niszczące Świątynię Jerozolimską w 586 r. p.n.e. oraz w Apokalipsie wielki symbol odstępczego systemu religijno-politycznego czasów końca.',
      verses: [
        { ref: 'Ps 137:1', text: 'Nad rzekami Babilonu — tam siedzieliśmy i płakaliśmy na wspomnienie Syjonu.' },
        { ref: 'Dan 4:30', text: 'Czyż to nie jest ten wielki Babilon, który ja zbudowałem na stolicę królestwa potęgą mojej władzy i ku chwale mojego majestatu?' },
        { ref: 'Ap 18:2', text: 'I zawołał donośnie silnym głosem: Upadł, upadł wielki Babilon i stał się siedliskiem demonów i schronieniem wszelkiego ducha nieczystego...' }
      ],
      studyUrl: '/mojabiblia?q=Babilon',
      aliases: ['babilon', 'babel', 'babylon', 'wieza babel']
    },
    patmos: {
      id: 'patmos',
      name: 'Wyspa Patmos',
      origName: 'Πάτμος / Patmos',
      lang: 'grc',
      region: 'Morze Egejskie (archipelag Dodekanez, Grecja)',
      coords: { lat: 37.5147, lon: 26.5458 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q178703',
      summary: 'Górzysta wyspa na Morzu Egejskim, miejsce zesłania apostoła Jana za panowania cesarza Domicjana, gdzie otrzymał on od zmartwychwstałego Chrystusa wizję Księgi Objawienia (Apokalipsy).',
      verses: [
        { ref: 'Ap 1:9', text: 'Ja, Jan, wasz brat i współuczestnik w ucisku, w królestwie i w cierpliwości Jezusa Chrystusa, byłem na wyspie zwanej Patmos z powodu słowa Bożego i świadectwa Jezusa Chrystusa.' },
        { ref: 'Ap 1:10', text: 'W dzień Pański byłem w zachwyceniu i usłyszałem za sobą donośny głos jakby trąby;' }
      ],
      studyUrl: '/mojabiblia?q=Patmos',
      aliases: ['patmos', 'wyspa patmos']
    },
    antioch: {
      id: 'antioch',
      name: 'Antiochia Syryjska (Antakya)',
      origName: 'Ἀντιόχεια / Antiocheia',
      lang: 'grc',
      region: 'Syria / Rzymska prowincja Syrii (dziś płd. Turcja)',
      coords: { lat: 36.2021, lon: 36.1606 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q200441',
      summary: 'Kolebka misji pogańskiej w pierwotnym Kościele: miasto, w którym po raz pierwszy nazwano uczniów „chrześcijanami” (Dz 11:26), oraz baza wypadowa podróży misyjnych apostoła Pawła i Barnaby.',
      verses: [
        { ref: 'Dz 11:26', text: 'I przez cały rok zbierali się w tym kościele i nauczali wielu ludzi. W Antiochii też po raz pierwszy nazwano uczniów chrześcijanami.' },
        { ref: 'Dz 13:1-3', text: 'A w kościele w Antiochii byli prorocy i nauczyciele... Wtedy po poście i modlitwie włożyli na nich ręce i wyprawili ich.' },
        { ref: 'Ga 2:11', text: 'A gdy Piotr przyszedł do Antiochii, sprzeciwiłem mu się w twarz, bo zasłużył na naganę.' }
      ],
      studyUrl: '/mojabiblia?q=Antiochia',
      aliases: ['antiochia', 'antioch', 'antakya', 'antiochia syryjska']
    },
    carmel: {
      id: 'carmel',
      name: 'Góra Karmel (Karem El)',
      origName: 'כַּרְמֶל / Har haKarmel',
      lang: 'he',
      region: 'Wybrzeże Morza Śródziemnego / Północny Izrael',
      coords: { lat: 32.7333, lon: 35.0500 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q185526',
      summary: 'Dosłownie „Ogród Boży”. Pasmo górskie, na którym prorok Eliasz stawił czoła 450 prorokom Baala, a Bóg odpowiedział ogniem z nieba trawiącym całopalenie i potwierdzającym, że PAN jest jedynym prawdziwym Bogiem.',
      verses: [
        { ref: '1 Krl 18:21', text: 'Wtedy Eliasz podszedł do całego ludu i powiedział: Jak długo będziecie chwiać się między dwiema stronami? Jeśli PAN jest Bogiem, idźcie za nim, a jeśli Baal, idźcie za nim!' },
        { ref: '1 Krl 18:38', text: 'Wtedy spadł ogień PANA i strawił całopalenie, drwa, kamienie i proch, a wodę, która była w rowie, wysuszył.' }
      ],
      studyUrl: '/mojabiblia?q=Karmel',
      aliases: ['karmel', 'gora karmel', 'carmel', 'mount carmel']
    },
    galilee: {
      id: 'galilee',
      name: 'Jezioro Galilejskie (Genezaret / Tyberiadzkie)',
      origName: 'יָם כִּנֶּרֶת / Limnē Gennēzaret',
      lang: 'he',
      region: 'Galilea / Rów Jordanu (ok. 210 m p.p.m.)',
      coords: { lat: 32.8333, lon: 35.5833 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q126982',
      summary: 'Słodkowodne jezioro, nad brzegami którego Jezus powołał rybaków Piotra, Andrzeja, Jakuba i Jana; miejsce uciszenia burzy, chodzenia Jezusa po wodzie oraz cudownego połowu ryb po zmartwychwstaniu.',
      verses: [
        { ref: 'Mt 4:18-19', text: 'A Jezus, przechodząc koło Morza Galilejskiego, ujrzał dwóch braci... I powiedział im: Pójdźcie za mną, a uczynię was rybakami ludzi.' },
        { ref: 'Mk 4:39', text: 'Wtedy wstał, zgromił wiatr i powiedział do morza: Milcz, ucisz się! I ustał wiatr, i nastała wielka cisza.' },
        { ref: 'J 21:1', text: 'Potem Jezus znowu objawił się uczniom nad Morzem Tyberiadzkim...' }
      ],
      studyUrl: '/mojabiblia?q=Galilejskie',
      aliases: ['jezioro galilejskie', 'morze galilejskie', 'genezaret', 'tyberiadzkie', 'kinneret']
    },
    jordan: {
      id: 'jordan',
      name: 'Rzeka Jordan (Jarden)',
      origName: 'יַרְדֵּן / Yardēn',
      lang: 'he',
      region: 'Rów Tektoniczny Jordanu (od Hermonu do Morza Martwego)',
      coords: { lat: 31.8986, lon: 35.5564 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q40059',
      summary: 'Główna rzeka Ziemi Obiecanej: miejsce cudownego przejścia Izraelitów pod wodzą Jozuego, uzdrowienia syryjskiego wodza Naamana z trądu oraz chrztu Jezusa Chrystusa przez Jana Chrzciciela i zstąpienia Ducha Świętego.',
      verses: [
        { ref: 'Joz 3:17', text: 'A kapłani niosący Arkę Przymierza PANA stali mocno na suchym dnie pośrodku Jordanu, a cały Izrael przechodził po suchym...' },
        { ref: 'Mt 3:13-16', text: 'Wtedy przyszedł Jezus z Galilei nad Jordan do Jana, aby być ochrzczonym przez niego... I oto otworzyły mu się niebiosa, i ujrzał Ducha Bożego zstępującego jak gołębica...' }
      ],
      studyUrl: '/mojabiblia?q=Jordan',
      aliases: ['jordan', 'rzeka jordan', 'jarden']
    },
    olives: {
      id: 'olives',
      name: 'Góra Oliwna (Oliwki / Getsemani)',
      origName: 'הַר הַזֵּיתִים / To Oros tōn Elaiōn',
      lang: 'he',
      region: 'Na wschód od Jerozolimy (Dolina Cedronu)',
      coords: { lat: 31.7781, lon: 35.2444 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q206161',
      summary: 'Wzgórze górujące nad Jerozolimą: miejsce modlitwy i krwawego potu Jezusa w ogrodzie Getsemani, mowy eschatologicznej o znakach końca świata (Mt 24), wniebowstąpienia Chrystusa oraz proroczej zapowiedzi Jego triumfalnego powrotu (Zach 14:4).',
      verses: [
        { ref: 'Zach 14:4', text: 'W tym dniu jego stopy staną na Górze Oliwnej, która jest naprzeciw Jerozolimy od wschodu, a Góra Oliwna rozstąpi się pośrodku...' },
        { ref: 'Łk 22:39', text: 'A wyszedłszy, udał się według zwyczaju na Górę Oliwną; i szli za nim także jego uczniowie.' },
        { ref: 'Dz 1:11-12', text: 'Ten Jezus, który został wzięty od was do nieba, przyjdzie tak samo... Wtedy wrócili do Jerozolimy z góry zwanej Oliwną...' }
      ],
      studyUrl: '/mojabiblia?q=Oliwna',
      aliases: ['gora oliwna', 'oliwna', 'getsemani', 'oliwki', 'mount of olives']
    },
    ephesus: {
      id: 'ephesus',
      name: 'Efez',
      origName: 'Ἔφεσος / Ephesos',
      lang: 'grc',
      region: 'Ionia / Azja Mniejsza (dziś zachodnia Turcja)',
      coords: { lat: 37.9497, lon: 27.3639 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q47611',
      summary: 'Metropolia rzymskiej prowincji Azji: ośrodek wieloletniej posługi apostoła Pawła (ponad 2 lata w szkole Tyrannosa), adresat Listu do Efezjan oraz pierwszy z siedmiu kościołów w Księdze Objawienia (Ap 2:1-7).',
      verses: [
        { ref: 'Dz 19:10', text: 'A działo się to przez dwa lata, tak że wszyscy, którzy mieszkali w Azji, zarówno Żydzi, jak i Grecy, słyszeli słowo Pana Jezusa.' },
        { ref: 'Ap 2:1', text: 'Aniołowi kościoła w Efezie napisz: To mówi ten, który trzyma siedem gwiazd w swojej prawej ręce, który chodzi pośród siedmiu złotych świeczników...' }
      ],
      studyUrl: '/mojabiblia?q=Efez',
      aliases: ['efez', 'ephesus', 'efezjan']
    },
    rome: {
      id: 'rome',
      name: 'Rzym',
      origName: 'Ῥώμη / Rōmē',
      lang: 'grc',
      region: 'Półwysep Apeniński (stolica Imperium Rzymskiego)',
      coords: { lat: 41.9028, lon: 12.4964 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q220',
      summary: 'Stolica Imperium Rzymskiego: cel ostatniej drogi uwięzionego apostoła Pawła, gdzie głosił Ewangelię w areszcie domowym „z całą odwagą, bez przeszkód” (Dz 28:31) oraz adresat fundamentalnego Listu do Rzymian.',
      verses: [
        { ref: 'Dz 28:16', text: 'A gdy przybyliśmy do Rzymu, setnik przekazał więźniów dowódcy straży, lecz Pawłowi pozwolono mieszkać osobno z żołnierzem, który go pilnował.' },
        { ref: 'Rz 1:7', text: 'Wszystkim, którzy jesteście w Rzymie, umiłowanym Boga, powołanym świętym: Łaska wam i pokój od Boga, naszego Ojca, i Pana Jezusa Chrystusa.' }
      ],
      studyUrl: '/mojabiblia?q=Rzym',
      aliases: ['rzym', 'rome', 'rzymian']
    },
    damascus: {
      id: 'damascus',
      name: 'Damaszek',
      origName: 'דַּמֶּשֶׂק / Damaskos',
      lang: 'he',
      region: 'Syria (jedno z najstarszych miast świata)',
      coords: { lat: 33.5138, lon: 36.2765 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q3616',
      summary: 'Starożytna stolica Syrii: miejsce dramatycznego nawrócenia Szawła z Tarsu w drodze do Damaszku po ujrzeniu zmartwychwstałego Chrystusa w oślepiającym świetle, ulica Prosta i chrzest przez Ananiasza.',
      verses: [
        { ref: 'Dz 9:3-5', text: 'A gdy jechał i zbliżał się do Damaszku, nagle olśniła go światłość z nieba. A gdy upadł na ziemię, usłyszał głos: Szawle, Szawle, dlaczego mnie prześladujesz? A on zapytał: Kim jesteś, Panie? A Pan odpowiedział: Ja jestem Jezus, którego ty prześladujesz...' },
        { ref: 'Ga 1:17', text: 'Lecz odszedłem do Arabii, a potem znowu wróciłem do Damaszku.' }
      ],
      studyUrl: '/mojabiblia?q=Damaszek',
      aliases: ['damaszek', 'damascus']
    },
    tarsus: {
      id: 'tarsus',
      name: 'Tars w Cylicji',
      origName: 'Ταρσός / Tarsos',
      lang: 'grc',
      region: 'Cylicja (południowa Azja Mniejsza, dzisiejsza Turcja)',
      coords: { lat: 36.9167, lon: 34.9000 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q172370',
      summary: 'Miasto rodzinne apostoła Pawła (Szawła): znany starożytny ośrodek uniwersytecki i filozoficzny, nadający Pawłowi prestiżowe rzymskie obywatelstwo z urodzenia (Dz 22:28).',
      verses: [
        { ref: 'Dz 21:39', text: 'Lecz Paweł powiedział: Ja jestem Żydem z Tarsu w Cylicji, obywatelem niepośledniego miasta...' },
        { ref: 'Dz 22:3', text: 'Ja jestem Żydem urodzonym w Tarsie w Cylicji, lecz wychowanym w tym mieście u stóp Gamaliela...' }
      ],
      studyUrl: '/mojabiblia?q=Tars',
      aliases: ['tars', 'tarsus', 'tars w cylicji']
    },
    nebo: {
      id: 'nebo',
      name: 'Góra Nebo (Pisga)',
      origName: 'הַר נְבוֹ / Har Nəvō',
      lang: 'he',
      region: 'Płaskowyż Moabu (dzisiejsza Jordania, na wschód od Jordanu)',
      coords: { lat: 31.7683, lon: 35.7253 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q831862',
      summary: 'Szczyt pasma Pisga, na który Bóg wprowadził 120-letniego Mojżesza, by ukazać mu całą Ziemię Obiecaną przed śmiercią; miejsce spoczynku i pochówku Mojżesza ręką samego Boga (Pwt 34:5-6).',
      verses: [
        { ref: 'Pwt 34:1', text: 'I wstąpił Mojżesz z równin Moabu na górę Nebo, na wierzchołek Pisga, który jest naprzeciw Jerycha. A PAN pokazał mu całą ziemię...' },
        { ref: 'Pwt 34:5', text: 'I umarł tam Mojżesz, sługa PANA, w ziemi Moabu, według słowa PANA.' }
      ],
      studyUrl: '/mojabiblia?q=Nebo',
      aliases: ['nebo', 'gora nebo', 'pisga', 'mount nebo']
    },
    moriah: {
      id: 'moriah',
      name: 'Góra Moria (Wzgórze Świątynne)',
      origName: 'הַר הַמּוֹרִיָּה / Har haMōrīyyā',
      lang: 'he',
      region: 'Jerozolima (Wzgórze Świątynne)',
      coords: { lat: 31.7781, lon: 35.2353 },
      certainty: 'POTWIERDZONA ARCHEOLOGICZNIE',
      wikidataId: 'Q1131114',
      summary: 'Święte wzgórze ofiary: miejsce, gdzie Abraham z wiarą przyprowadził syna Izaaka na całopalenie (Bóg zaopatrzył baranka na ofiarę zastępczą) oraz gdzie król Salomon zbudował wspaniałą Świątynię Pańską na klepisku Ornana Jebuzejczyka.',
      verses: [
        { ref: 'Rdz 22:2', text: 'I rzekł: Weź teraz twego syna, twego jedynego, którego miłujesz, Izaaka, i idź do ziemi Moria, i złóż go tam na całopalenie...' },
        { ref: '2 Krn 3:1', text: 'I zaczął Salomon budować dom PANA w Jerozolimie na górze Moria, która została wskazana Dawidowi, jego ojcu...' }
      ],
      studyUrl: '/mojabiblia?q=Moria',
      aliases: ['moria', 'gora moria', 'moriah', 'mount moriah', 'wzgorze swiatynne']
    }
  };

  function detectBiblePlace(query) {
    if (!query) return null;
    const raw = String(query).trim();
    const norm = raw.toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z').trim();
    if (norm.length < 3) return null;

    for (const key of Object.keys(BIBLE_PLACES)) {
      const p = BIBLE_PLACES[key];
      if (norm === p.id || norm === p.name.toLowerCase()) return p;
      for (const a of p.aliases) {
        if (norm === a || norm === a.replace(/\s+/g, '')) return p;
        if (norm.length >= 4 && (norm.startsWith(a) || a.startsWith(norm))) return p;
      }
    }
    return null;
  }

    async function fetchBibleVerse(bookCode, chapter, verse) {
    const chPad = String(chapter).padStart(3, '0');
    const url = '/data/bible/ubg-2025/' + bookCode + '-' + chPad + '.json';
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !Array.isArray(data.verses)) return null;
      if (verse) {
        const vObj = data.verses.find(v => v.number === verse);
        return vObj ? vObj.text : null;
      }
      const first = data.verses[0];
      return first ? (first.text + ' ... (Werset 1 z ' + data.verses.length + ')') : null;
    } catch (_) {
      return null;
    }
  }

  // Rozpoznawanie intencji pomocy życiowej i wsparcia duszpasterskiego
  function detectHopeIntent(query) {
    if (!query) return false;
    const norm = query.toLowerCase()
      .replace(/[ą]/g, 'a').replace(/[ć]/g, 'c').replace(/[ę]/g, 'e')
      .replace(/[ł]/g, 'l').replace(/[ń]/g, 'n').replace(/[ó]/g, 'o')
      .replace(/[ś]/g, 's').replace(/[źż]/g, 'z').trim();
    const words = norm.split(/\s+/).filter(Boolean);
    const HOPE_KEYWORDS = [
      'lek', 'depresja', 'samotnosc', 'smutek', 'strach', 'pomoc', 'pomocy',
      'modlitwa', 'modlitwy', 'pomodl', 'dlugi', 'kryzys', 'nadzieja',
      'infolinia', 'duszpasterz', 'rozpacz', 'cierpienie', 'zalamanie',
      'ratunek', 'trudnosci', 'problem', 'problemy', 'bezsilnosc'
    ];
    return words.some(w => HOPE_KEYWORDS.includes(w)) ||
           norm.includes('chce porozmawiac') || norm.includes('potrzebuje pomocy') ||
           norm.includes('zalamanie nerwowe') || norm.includes('kryzys wiary');
  }

  // Inteligentne dopasowanie obrazka podglądu dla elementu
  function previewImageForItem(item) {
    if (item && item.image && typeof item.image === 'string' && item.image.length > 3) return item.image;
    const url = ((item && item.url) || '').toLowerCase();
    const title = ((item && item.title) || '').toLowerCase();
    if (url.includes('apokalipsa') || title.includes('apokalipsa')) {
      return '/images/courses/apokalipsa/banner-promo.jpg';
    }
    if (url.includes('kurscodzienny') || url.includes('dzien-') || url.includes('akademia')) {
      return '/images/ogloszenia-akademia.webp';
    }
    if (url.includes('mojabiblia') || url.includes('biblia') || title.includes('biblia') || title.includes('werset')) {
      return '/images/ogloszenia-biblia-gdanska.webp';
    }
    if (url.includes('podcast') || url.includes('player') || url.includes('radio') || title.includes('radio')) {
      return '/images/ogloszenia-widget-radio.webp';
    }
    if (url.includes('duszpasterz') || title.includes('duszpasterz') || title.includes('mariusz')) {
      return '/images/ogloszenia-duszpasterz-mariusz.webp';
    }
    if (url.includes('infolinia') || url.includes('pomoc') || url.includes('uslugi')) {
      return '/images/ogloszenia-infolinia-nadzieja.webp';
    }
    if (url.includes('lumina') || url.includes('spolecznosc')) {
      return '/images/brand/lumina-brand.webp';
    }
    return '/images/tlo_menu_cc.webp';
  }

  function isAudioOrRadioItem(item) {
    if (!item) return false;
    const url = ((item && item.url) || '').toLowerCase();
    const title = ((item && item.title) || '').toLowerCase();
    const desc = ((item && (item.description || item.contentSnippet)) || '').toLowerCase();
    return url.includes('podcast') || url.includes('player') || url.includes('radio') ||
           url.includes('worship') || url.includes('spiewana') || url.includes('ambient') ||
           title.includes('podcast') || title.includes('radio') || title.includes('słuchaj') ||
           title.includes('worship') || title.includes('audio') || desc.includes('podcast') ||
           desc.includes('odsłuch') || desc.includes('transmisja') || desc.includes('muzyka');
  }

  // Toast z potwierdzeniem skopiowania do schowka
  function showCopyToast(message) {
    let toast = document.getElementById('ccOmniToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ccOmniToast';
      toast.className = 'cc-omni-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('cc-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('cc-show');
    }, 2200);
  }

  // Prezentacja karty podglądu błyskawicznego (Split-View Preview)
  function getPreviewHtml(item) {
    if (!item) {
      return `
        <div class="cc-preview-placeholder">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">✨</div>
          <div style="font-weight: 700; color: #ffffff; font-size: 1.05rem;">Podgląd Błyskawiczny</div>
          <p style="font-size: 0.86rem; color: var(--omni-muted); margin: 6px 0 0;">Użyj strzałek ↑ ↓ na klawiaturze lub najedź kursorem na wynik, aby zobaczyć szczegóły.</p>
        </div>
      `;
    }
    const meta = item._meta || categorizeItem(item);
    const imgUrl = previewImageForItem(item);
    const url = item.url || '#';
    const title = escapeHtml(item.title || '');
    const desc = escapeHtml(item.description || item.contentSnippet || '');
    const group = escapeHtml(meta.name || '');
    const icon = meta.icon || '✨';
    const crumb = escapeHtml(breadcrumbOf(item.url || ''));
    const isAudio = isAudioOrRadioItem(item);
    const playLabel = isAudio ? '▶ Słuchaj teraz' : 'Otwórz materiał →';
    const isExternal = url.startsWith('http') && !url.includes('polskieradio.cc') && !url.includes('cclite.pl');

    return `
      <div class="cc-preview-card">
        <div class="cc-preview-media">
          <img src="${imgUrl}" alt="${title}" class="cc-preview-img" onerror="this.style.display='none'" />
          <span class="cc-preview-badge"><span aria-hidden="true">${icon}</span> ${group}</span>
        </div>
        <div class="cc-preview-meta">
          <span class="cc-preview-crumb">${crumb}</span>
        </div>
        <h3 class="cc-preview-title">${title}</h3>
        <p class="cc-preview-desc">${desc}</p>
        <div class="cc-preview-actions">
          <a href="${url}" class="cc-preview-btn-main" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
            ${playLabel}
          </a>
          <button type="button" class="cc-preview-btn-copy" data-copy-url="${url}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Kopiuj link</span>
          </button>
          <a href="${url}" target="_blank" rel="noopener" class="cc-preview-btn-ext" title="Otwórz w nowej karcie" aria-label="Otwórz w nowej karcie">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
            </svg>
          </a>
        </div>
      </div>
    `;
  }


  // =========================================================================
  // AUDIO PLAYER & BIBLIA SŁUCHANA CC (P4)
  // Standard ZERO COST FIRST • Web Speech API • Radio Waveform Visualizer
  // =========================================================================
  let currentAudioUtterance = null;
  let currentAudioState = 'idle'; // 'idle' | 'playing' | 'paused'
  let currentAudioSpeed = 1.0;

  function stopBibleAudio() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentAudioState = 'idle';
    currentAudioUtterance = null;
    updateAudioUI('idle');
  }

  function playBibleAudio(text, refTitle, speed = currentAudioSpeed) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis API not supported in this browser.');
      return false;
    }

    if (currentAudioState === 'paused' && currentAudioUtterance) {
      window.speechSynthesis.resume();
      currentAudioState = 'playing';
      updateAudioUI('playing');
      return true;
    }

    window.speechSynthesis.cancel();

    const cleanText = String(text || '')
      .replace(/\[\d+\]/g, '')
      .replace(/G\d+|H\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const fullUtteranceText = refTitle ? `${refTitle}. ${cleanText}` : cleanText;
    const UtteranceClass = (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) || (typeof SpeechSynthesisUtterance !== 'undefined' ? SpeechSynthesisUtterance : null);
    if (!UtteranceClass) return false;
    const utterance = new UtteranceClass(fullUtteranceText);
    const activeLang = (typeof localStorage !== 'undefined' && (localStorage.getItem('cc_user_lang_choice') || localStorage.getItem('lumina_lang'))) || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'pl';
    const isEn = typeof activeLang === 'string' && activeLang.startsWith('en');
    utterance.lang = isEn ? 'en-US' : (typeof activeLang === 'string' && activeLang.startsWith('es') ? 'es-ES' : 'pl-PL');
    utterance.rate = Number(speed) || 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices() || [];
    const plVoice = voices.find(v => v.lang && (v.lang === 'pl-PL' || v.lang.startsWith('pl')));
    if (plVoice) utterance.voice = plVoice;

    utterance.onstart = () => {
      currentAudioState = 'playing';
      updateAudioUI('playing');
    };

    utterance.onend = () => {
      currentAudioState = 'idle';
      currentAudioUtterance = null;
      updateAudioUI('idle');
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      currentAudioState = 'idle';
      currentAudioUtterance = null;
      updateAudioUI('idle');
    };

    currentAudioUtterance = utterance;
    currentAudioState = 'playing';
    updateAudioUI('playing');
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function toggleBibleAudio(text, refTitle) {
    if (currentAudioState === 'playing') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      currentAudioState = 'paused';
      updateAudioUI('paused');
    } else if (currentAudioState === 'paused') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      currentAudioState = 'playing';
      updateAudioUI('playing');
    } else {
      playBibleAudio(text, refTitle, currentAudioSpeed);
    }
  }

  function updateAudioUI(state) {
    if (typeof document === 'undefined') return;
    const playBtns = document.querySelectorAll('[data-action="toggle-audio"]');
    playBtns.forEach(btn => {
      const icon = btn.querySelector('.cc-audio-play-icon');
      const label = btn.querySelector('.cc-audio-play-label');
      if (state === 'playing') {
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('cc-playing');
        if (icon) icon.textContent = '⏸';
        if (label) label.textContent = 'Pauza';
      } else if (state === 'paused') {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('cc-playing');
        if (icon) icon.textContent = '▶';
        if (label) label.textContent = 'Wznów';
      } else {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('cc-playing');
        if (icon) icon.textContent = '▶';
        if (label) label.textContent = 'Słuchaj wersetu';
      }
    });

    const waveforms = document.querySelectorAll('.cc-waveform-visualizer');
    waveforms.forEach(wf => {
      if (state === 'playing') {
        wf.classList.add('cc-waveform-active');
      } else {
        wf.classList.remove('cc-waveform-active');
      }
    });

    const statusTags = document.querySelectorAll('.cc-audio-status-tag');
    statusTags.forEach(tag => {
      if (state === 'playing') {
        tag.textContent = '🔊 Odtwarzanie...';
        tag.classList.add('cc-tag-playing');
      } else if (state === 'paused') {
        tag.textContent = '⏸ Wstrzymano';
        tag.classList.remove('cc-tag-playing');
      } else {
        tag.textContent = '🎙️ Lektor UBG';
        tag.classList.remove('cc-tag-playing');
      }
    });
  }

  function renderScriptureAudioBar(match) {
    if (!match) return '';
    const rawText = match.verseText || '';
    const audioUrl = `/player?q=${encodeURIComponent(match.bookName + ' ' + match.chapter)}`;
    const safeRef = escapeHtml(match.refTitle || '');
    const safeText = escapeHtml(rawText);

    return `
      <div class="cc-scripture-audio-bar" id="ccScriptureAudioBar">
        <div class="cc-audio-bar-left">
          <button type="button" class="cc-btn-play-verse" id="ccBtnPlayVerse" data-action="toggle-audio" data-verse="${safeText}" data-ref="${safeRef}" aria-pressed="false" title="Słuchaj wersetu (Lektor UBG / Mowa)">
            <span class="cc-audio-play-icon" aria-hidden="true">▶</span>
            <span class="cc-audio-play-label">Słuchaj wersetu</span>
          </button>
          <div class="cc-waveform-visualizer" id="ccAudioWaveform" aria-hidden="true" title="Wskaźnik fali radiowej CC">
            <span class="cc-wave-bar cc-wave-1"></span>
            <span class="cc-wave-bar cc-wave-2"></span>
            <span class="cc-wave-bar cc-wave-3"></span>
            <span class="cc-wave-bar cc-wave-4"></span>
            <span class="cc-wave-bar cc-wave-5"></span>
          </div>
          <span class="cc-audio-status-tag" id="ccAudioStatusTag">🎙️ Lektor UBG</span>
        </div>
        <div class="cc-audio-bar-right">
          <div class="cc-audio-speed-selector" title="Prędkość lektora">
            <button type="button" class="cc-speed-btn active" data-speed="1.0">1.0x</button>
            <button type="button" class="cc-speed-btn" data-speed="1.25">1.25x</button>
            <button type="button" class="cc-speed-btn" data-speed="1.5">1.5x</button>
          </div>
          <a href="${audioUrl}" class="cc-btn-open-player" title="Otwórz pełny rozdział w odtwarzaczu CC Player">
            <span>CC Player →</span>
          </a>
        </div>
      </div>
    `;
  }

  
  // =========================================================================
  // WIZUALIZACJE & KARTY DZIELENIA SOCIAL MEDIA (P6)
  // Standard ZERO COST FIRST • HTML5 Canvas 1080x1080 • Direct Social Share
  // =========================================================================

  function drawBibleShareCard(canvas, verseText, refTitle) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // 1. Tło: głęboki kosmiczny gradient (EkoCC Dark Obsidian)
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 650);
    bgGrad.addColorStop(0, '#131c2e');
    bgGrad.addColorStop(0.55, '#090e17');
    bgGrad.addColorStop(1, '#04060a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Złote ozdobne linie i podwójna ramka
    ctx.strokeStyle = 'rgba(196, 163, 90, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = 'rgba(255, 122, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // Narożniki ozdobne
    const cornerSize = 24;
    ctx.strokeStyle = '#FF7A00';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(42, 42 + cornerSize); ctx.lineTo(42, 42); ctx.lineTo(42 + cornerSize, 42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 42 - cornerSize, 42); ctx.lineTo(W - 42, 42); ctx.lineTo(W - 42, 42 + cornerSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(42, H - 42 - cornerSize); ctx.lineTo(42, H - 42); ctx.lineTo(42 + cornerSize, H - 42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 42 - cornerSize, H - 42); ctx.lineTo(W - 42, H - 42); ctx.lineTo(W - 42, H - 42 - cornerSize); ctx.stroke();

    // 3. Nagłówek: krzyż / emblemat i plakietka
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FF7A00';
    ctx.font = 'bold 36px "Outfit", system-ui, sans-serif';
    ctx.fillText('✝', W / 2, 130);

    ctx.fillStyle = '#C4A35A';
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.fillText('S Ł O W O   B O Ż E   •   U B G', W / 2, 185);

    // Linia podziału ze złotym rombem
    ctx.strokeStyle = 'rgba(196, 163, 90, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, 220); ctx.lineTo(W / 2 - 25, 220);
    ctx.moveTo(W / 2 + 25, 220); ctx.lineTo(W / 2 + 160, 220);
    ctx.stroke();

    ctx.fillStyle = '#FF7A00';
    ctx.beginPath();
    ctx.arc(W / 2, 220, 5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Tekst wersetu: łamanie wierszy i wyśrodkowanie
    const cleanQuote = String(verseText || '')
      .replace(/\[\d+\]/g, '')
      .replace(/G\d+|H\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const formattedQuote = `„${cleanQuote}”`;
    
    let fontSize = 42;
    if (formattedQuote.length > 250) fontSize = 30;
    else if (formattedQuote.length > 160) fontSize = 35;
    else if (formattedQuote.length < 80) fontSize = 48;

    ctx.font = `italic 600 ${fontSize}px "Outfit", Georgia, serif`;
    ctx.fillStyle = '#ffffff';

    const maxTextWidth = W - 220;
    const words = formattedQuote.split(' ');
    let lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    let startY = (H / 2) - (totalTextHeight / 2) + 20;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, startY + (i * lineHeight));
    }

    // 5. Sigla referencyjna w kolorze akcji #FF7A00
    const refY = startY + (lines.length * lineHeight) + 60;
    ctx.font = 'bold 30px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#FF7A00';
    ctx.fillText(`— ${refTitle} (UBG)`, W / 2, Math.min(refY, H - 180));

    // 6. Stopka: logo / watermark Christian Culture
    ctx.font = '500 20px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(243, 229, 200, 0.7)';
    ctx.fillText('polskieradio.cc  •  Christian Culture', W / 2, H - 100);
  }

// =========================================================================
  // MODAL GALERII TEŁ WYSZUKIWARKI (WALLPAPER PICKER)
  // Wybór oficjalnych motywów CC + Własne zdjęcie z dysku • LocalStorage
  // =========================================================================
  function ensureWallpaperModal() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ccWallpaperModalBackdrop')) return;
    const modal = document.createElement('div');
    modal.className = 'cc-wallpaper-modal-backdrop';
    modal.id = 'ccWallpaperModalBackdrop';
    modal.style.display = 'none';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ccWallpaperModalTitle');
    modal.innerHTML = `
      <div class="cc-wallpaper-modal">
        <div class="cc-wallpaper-modal-head">
          <div class="cc-wallpaper-modal-title" id="ccWallpaperModalTitle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>
            <span>Zmień tło wyszukiwarki</span>
          </div>
          <button type="button" class="cc-wallpaper-modal-close" id="ccWallpaperModalClose" aria-label="Zamknij okno">×</button>
        </div>
        <div class="cc-wallpaper-modal-body">
          <p class="cc-wallpaper-modal-desc">
            Wybierz oficjalne tło Christian Culture lub wgraj własne zdjęcie z dysku / aparatu:
          </p>
          <div class="cc-wallpaper-grid" id="ccWallpaperGrid"></div>
        </div>
        <div class="cc-wallpaper-modal-foot">
          <button type="button" class="cc-btn-wall-reset-modal" id="ccBtnWallResetModal">
            Przywróć domyślne tło CC
          </button>
          <button type="button" class="cc-btn-wall-close-modal" id="ccBtnWallCloseModal">
            Gotowe
          </button>
        </div>
      </div>
    `;
    const targetRoot = document.getElementById('ccOmniOverlay') || document.body;
    targetRoot.appendChild(modal);

    modal.querySelector('#ccWallpaperModalClose').addEventListener('click', closeWallpaperModal);
    modal.querySelector('#ccBtnWallCloseModal').addEventListener('click', closeWallpaperModal);
    modal.querySelector('#ccBtnWallResetModal').addEventListener('click', () => {
      try { localStorage.removeItem(WALL_KEY); } catch (_) {}
      if (typeof applyWallGlobal === 'function') applyWallGlobal('polska-radio');
      renderWallpaperGrid();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeWallpaperModal();
    });
  }

  function renderWallpaperGrid() {
    const grid = document.getElementById('ccWallpaperGrid');
    if (!grid) return;

    let customUrl = null;
    try {
      const saved = localStorage.getItem(WALL_KEY);
      if (saved && (saved.startsWith('data:image') || saved.startsWith('http'))) {
        customUrl = saved;
      }
    } catch (_) {}

    const presetsHtml = PRESET_WALLS.map(w => {
      const isActive = (currentWallId === w.id);
      return `
        <div class="cc-wall-card ${isActive ? 'active' : ''}" data-wall-id="${w.id}">
          <div class="cc-wall-thumb-wrap">
            <img src="${w.thumb || w.desktop}" alt="${escapeHtml(w.name)}" class="cc-wall-thumb" loading="lazy">
            ${isActive ? '<span class="cc-wall-active-pill">✓ Wybrane</span>' : ''}
          </div>
          <div class="cc-wall-info">
            <strong class="cc-wall-title">${escapeHtml(w.name)}</strong>
            <span class="cc-wall-tag">${escapeHtml(w.tag || 'Motyw CC')}</span>
          </div>
        </div>
      `;
    }).join('');

    const customIsActive = (currentWallId === 'custom');
    const customCardHtml = `
      <div class="cc-wall-card cc-wall-custom-card ${customIsActive ? 'active' : ''}" id="ccWallCustomCard">
        <div class="cc-wall-thumb-wrap cc-wall-custom-wrap">
          ${customUrl ? `<img src="${customUrl}" alt="Własna tapeta" class="cc-wall-thumb">` : `
            <div class="cc-wall-upload-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Wgraj z pliku</span>
            </div>
          `}
          ${customIsActive ? '<span class="cc-wall-active-pill">✓ Wybrane</span>' : ''}
        </div>
        <div class="cc-wall-info">
          <strong class="cc-wall-title">Własna tapeta</strong>
          <span class="cc-wall-tag">${customUrl ? 'Zmień plik 📁' : 'Wybierz zdjęcie 📁'}</span>
        </div>
      </div>
    `;

    grid.innerHTML = presetsHtml + customCardHtml;

    // Obsługa kliknięć w karty
    grid.querySelectorAll('.cc-wall-card[data-wall-id]').forEach(card => {
      card.addEventListener('click', () => {
        const wallId = card.getAttribute('data-wall-id');
        try { localStorage.setItem(WALL_KEY, wallId); } catch (_) {}
        if (typeof applyWallGlobal === 'function') applyWallGlobal(wallId);
        renderWallpaperGrid();
      });
    });

    const customBtn = grid.querySelector('#ccWallCustomCard');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        const wallFile = document.getElementById('ccOmniWallFile');
        if (wallFile) wallFile.click();
      });
    }
  }

  function openWallpaperModal() {
    ensureWallpaperModal();
    renderWallpaperGrid();
    const modal = document.getElementById('ccWallpaperModalBackdrop');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeWallpaperModal() {
    const modal = document.getElementById('ccWallpaperModalBackdrop');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function ensureShareModal() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ccShareCardModalBackdrop')) return;
    const modal = document.createElement('div');
    modal.className = 'cc-share-card-modal-backdrop';
    modal.id = 'ccShareCardModalBackdrop';
    modal.style.display = 'none';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ccShareModalTitle');
    modal.innerHTML = `
      <div class="cc-share-card-modal">
        <div class="cc-share-modal-head">
          <div class="cc-share-modal-title" id="ccShareModalTitle">
            <span aria-hidden="true">🖼️</span>
            <strong id="ccShareCardRefTitle">Karta Słowa Bożego &amp; Dzielenie</strong>
          </div>
          <button type="button" class="cc-share-modal-close" id="ccShareModalClose" aria-label="Zamknij okno">×</button>
        </div>
        <div class="cc-share-modal-body">
          <div class="cc-share-canvas-wrap">
            <canvas id="ccShareVerseCanvas" class="cc-share-verse-canvas" width="1080" height="1080"></canvas>
          </div>
          <div class="cc-share-card-actions">
            <button type="button" class="cc-btn-share-main" id="ccBtnDownloadCardPng">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Pobierz grafikę PNG</span>
            </button>
            <button type="button" class="cc-btn-share-sub" id="ccBtnCopyCardText">
              <span>Kopiuj tekst i link</span>
            </button>
          </div>
          <div class="cc-share-social-grid">
            <a href="#" target="_blank" rel="noopener" class="cc-social-share-btn cc-share-wa" id="ccShareLinkWa" title="Udostępnij na WhatsApp">
              <span>WhatsApp</span>
            </a>
            <a href="#" target="_blank" rel="noopener" class="cc-social-share-btn cc-share-tg" id="ccShareLinkTg" title="Udostępnij na Telegram">
              <span>Telegram</span>
            </a>
            <a href="#" target="_blank" rel="noopener" class="cc-social-share-btn cc-share-fb" id="ccShareLinkFb" title="Udostępnij na Facebook">
              <span>Facebook</span>
            </a>
            <a href="#" target="_blank" rel="noopener" class="cc-social-share-btn cc-share-x" id="ccShareLinkX" title="Udostępnij na X">
              <span>X (Twitter)</span>
            </a>
            <a href="/lumina-tablica" class="cc-social-share-btn cc-share-lumina" id="ccShareLinkLumina" title="Opublikuj w Społeczności LUMINA">
              <span>LUMINA</span>
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#ccShareModalClose').addEventListener('click', closeShareModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeShareModal();
    });

    modal.querySelector('#ccBtnDownloadCardPng').addEventListener('click', () => {
      const canvas = document.getElementById('ccShareVerseCanvas');
      if (!canvas) return;
      const refTitle = modal.getAttribute('data-ref') || 'werset-ubg';
      const safeFilename = 'Biblia-CC-' + refTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.png';
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    modal.querySelector('#ccBtnCopyCardText').addEventListener('click', () => {
      const text = modal.getAttribute('data-full-text') || '';
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = modal.querySelector('#ccBtnCopyCardText span');
          if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Skopiowano!';
            setTimeout(() => { btn.textContent = orig; }, 1600);
          }
        }).catch(() => {});
      }
    });
  }

  function openShareModal(verseText, refTitle) {
    ensureShareModal();
    const modal = document.getElementById('ccShareCardModalBackdrop');
    if (!modal) return;

    modal.setAttribute('data-verse', verseText);
    modal.setAttribute('data-ref', refTitle);

    const titleEl = modal.querySelector('#ccShareCardRefTitle');
    if (titleEl) titleEl.textContent = refTitle || 'Karta Słowa Bożego';

    const fullShareText = `„${verseText}” — ${refTitle} (UBG)\nhttps://polskieradio.cc/wyszukiwarka?q=${encodeURIComponent(refTitle)}`;
    modal.setAttribute('data-full-text', fullShareText);

    const shareUrl = `https://polskieradio.cc/wyszukiwarka?q=${encodeURIComponent(refTitle)}`;
    const encText = encodeURIComponent(fullShareText);
    const encUrl = encodeURIComponent(shareUrl);

    const linkWa = modal.querySelector('#ccShareLinkWa');
    if (linkWa) linkWa.href = `https://api.whatsapp.com/send?text=${encText}`;

    const linkTg = modal.querySelector('#ccShareLinkTg');
    if (linkTg) linkTg.href = `https://t.me/share/url?url=${encUrl}&text=${encodeURIComponent('„' + verseText + '” — ' + refTitle + ' (UBG)')}`;

    const linkFb = modal.querySelector('#ccShareLinkFb');
    if (linkFb) linkFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;

    const linkX = modal.querySelector('#ccShareLinkX');
    if (linkX) linkX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent('„' + verseText + '” — ' + refTitle + ' (UBG)')}&url=${encUrl}`;

    const linkLumina = modal.querySelector('#ccShareLinkLumina');
    if (linkLumina) linkLumina.href = `/lumina-tablica?draft=${encText}`;

    const canvas = modal.querySelector('#ccShareVerseCanvas');
    if (canvas) {
      drawBibleShareCard(canvas, verseText, refTitle);
    }

    modal.style.display = 'flex';
  }

  function closeShareModal() {
    const modal = document.getElementById('ccShareCardModalBackdrop');
    if (modal) modal.style.display = 'none';
  }

// =========================================================================
  // EKOCC SEARCH GLOBAL: SILNIK RAG & ODPOWIEDZI BIBLIJNYCH (ETAP 5)
  // Zero Cost Grounded Synthesis • UBG Canonical Text
  // =========================================================================
  function stripPolishDiacritics(str) {
    return normalizeStr(str);
  }

  function normalizeTokens(text) {
    return normalizeStr(text)
      .replace(/[^a-z0-9]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  const RAG_TOPIC_STEMS = {
    apokalipsa: 'apokalips',
    zbawienie: 'zbawien',
    przebaczenie: 'przebaczen',
    usprawiedliwienie: 'usprawiedliwien',
    posrednik: 'posredni',
    zmartwychwstanie: 'zmartwychwstan',
    szabat: 'szaba',
    pokoj: 'pokoj',
    laska: 'lask',
    nadzieja: 'nadziej',
    milosc: 'milosc',
    madrosc: 'madrosc',
    uzdrowienie: 'uzdrowien',
    modlitwa: 'modlitw',
    wiara: 'wiar'
  };

  function queryKnowledgeRegistryClient(question, minScore = 0.35) {
    if (!question || typeof question !== 'string') return [];
    const qTrim = question.trim();
    if (qTrim.length < 2) return [];

    const queryNorm = stripPolishDiacritics(qTrim).toLowerCase();
    const queryTokens = normalizeTokens(qTrim);

    const scored = BIBLE_RAG_REGISTRY.map(item => {
      let score = 0;

      // 1. Sigla wersetowe
      if (Array.isArray(item.verses)) {
        for (const v of item.verses) {
          const vClean = stripPolishDiacritics(v).toLowerCase().replace(/\s+/g, '');
          const qClean = queryNorm.replace(/\s+/g, '');
          if (qClean.includes(vClean) || queryNorm.includes(stripPolishDiacritics(v).toLowerCase())) {
            score += 0.55;
            break;
          }
        }
      }

      // 2. Rdzeń tematu
      const topicNorm = stripPolishDiacritics(item.topic || '').toLowerCase();
      const stem = RAG_TOPIC_STEMS[topicNorm] || (topicNorm.length > 4 ? topicNorm.slice(0, -1) : topicNorm);
      if (stem && queryNorm.includes(stem)) {
        score += 0.35;
      }

      // 3. Słowa kluczowe w tytule i tekście
      const itemTokens = new Set([
        ...normalizeTokens(item.title),
        ...normalizeTokens(item.topic),
        ...normalizeTokens(item.text).slice(0, 40)
      ]);

      let matchCount = 0;
      for (const token of queryTokens) {
        if (itemTokens.has(token)) {
          matchCount++;
        } else {
          for (const it of itemTokens) {
            if (it.length >= 4 && token.length >= 4 && (it.startsWith(token.slice(0, 4)) || token.startsWith(it.slice(0, 4)))) {
              matchCount += 0.6;
              break;
            }
          }
        }
      }

      if (queryTokens.length > 0) {
        score += Math.min(0.5, (matchCount / queryTokens.length) * 0.5);
      }

      return { item, score: Number(score.toFixed(3)) };
    });

    return scored
      .filter(x => x.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x, idx) => ({
        id: idx + 1,
        chunkId: x.item.id,
        title: x.item.title,
        url: x.item.url,
        type: x.item.type,
        topic: x.item.topic,
        verses: x.item.verses || [],
        text: x.item.text,
        score: x.score
      }));
  }

  function detectBibleRagQuery(query) {
    if (!query || typeof query !== 'string') return null;
    const q = query.trim();
    if (q.length < 3) return null;

    const isQuestion = q.includes('?') ||
      /^(jak|co|kto|dlaczego|czym|gdzie|kiedy|czy|po co|ile)\b/i.test(q) ||
      /co mówi biblia|co biblia mówi|pismo mówi|jak biblia|według biblii|w biblii/i.test(q);

    const sources = queryKnowledgeRegistryClient(q);
    if (!sources || sources.length === 0) return null;

    if (isQuestion || sources[0].score >= 0.35) {
      return {
        query: q,
        isQuestion,
        sources,
        primary: sources[0]
      };
    }
    return null;
  }

  function renderBibleRagCard(ragData) {
    if (!ragData || !ragData.sources || !ragData.sources.length) return '';
    const primary = ragData.sources[0];
    const secondary = ragData.sources.length > 1 ? ragData.sources[1] : null;

    const primaryRef = (primary.verses && primary.verses[0]) || primary.title;
    const secondaryRef = secondary ? ((secondary.verses && secondary.verses[0]) || secondary.title) : '';

    const sourcesHtml = ragData.sources.slice(0, 3).map((s, idx) => {
      const vRef = (s.verses && s.verses[0]) || '';
      const searchUrl = vRef ? `/wyszukiwarka?q=${encodeURIComponent(vRef)}` : (s.url || '#');
      return `
        <a href="${searchUrl}" class="cc-rag-source-chip" title="Zobacz źródło [${idx + 1}]: ${escapeHtml(s.title)}">
          <span class="cc-rag-source-num">[${idx + 1}]</span>
          <span class="cc-rag-source-title">${escapeHtml(s.title)}</span>
          ${vRef ? `<span class="cc-rag-source-ref">${escapeHtml(vRef)}</span>` : ''}
        </a>
      `;
    }).join('');

    const answerLines = [];
    answerLines.push(`<p class="cc-rag-p-lead">Na podstawie Pisma Świętego (UBG) <span class="cc-rag-cite-tag" title="Źródło 1">[1]</span>:</p>`);
    answerLines.push(`<blockquote class="cc-rag-quote">„${escapeHtml(primary.text)}” <span class="cc-rag-cite-tag" title="Źródło 1">[1]</span></blockquote>`);
    if (secondary) {
      answerLines.push(`<p class="cc-rag-p-secondary">Świadectwo to potwierdza również fragment <span class="cc-rag-cite-tag" title="Źródło 2">[2]</span>: <em>„${escapeHtml(secondary.text)}”</em> <span class="cc-rag-cite-tag" title="Źródło 2">[2]</span></p>`);
    }
    answerLines.push(`<p class="cc-rag-footnote">(Opracowanie biblijne Christian Culture oparte na kanonicznym tekście UBG · Standard ZERO COST).</p>`);

    const fullPlainText = `Na podstawie Pisma Świętego (UBG) [1]:\n„${primary.text}” [1]\n` +
      (secondary ? `\nŚwiadectwo to potwierdza również fragment [2]: „${secondary.text}” [2]\n` : '') +
      `\nŹródła:\n[1] ${primary.title} (${primaryRef})\n` +
      (secondary ? `[2] ${secondary.title} (${secondaryRef})\n` : '') +
      `https://polskieradio.cc/wyszukiwarka?q=${encodeURIComponent(ragData.query)}`;

    return `
      <div class="cc-rag-answer-card" id="ccBibleRagCard" data-query="${escapeHtml(ragData.query)}">
        <div class="cc-rag-card-header">
          <div class="cc-rag-badge-group">
            <span class="cc-rag-badge-ai">✨ ODPOWIEDŹ BIBLIJNA CC</span>
            <span class="cc-rag-badge-standard">UBG · ZERO COST</span>
          </div>
          <span class="cc-rag-model-badge" id="ccRagModelBadge" title="Deterministyczna synteza źródłowa UBG (100% zgodności doktrynalnej)">Grounded Scripture</span>
        </div>

        <div class="cc-rag-question-bar">
          <span class="cc-rag-q-icon" aria-hidden="true">💡</span>
          <span class="cc-rag-q-text">Pytanie: <strong>„${escapeHtml(ragData.query)}”</strong></span>
        </div>

        <div class="cc-rag-answer-content" id="ccRagAnswerContent">
          ${answerLines.join('')}
        </div>

        <div class="cc-rag-sources-box">
          <div class="cc-rag-sources-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
            <span>Autorytatywne źródła Pisma Świętego i materiałów CC:</span>
          </div>
          <div class="cc-rag-sources-grid">
            ${sourcesHtml}
          </div>
        </div>

        <div class="cc-rag-actions">
          <button type="button" class="cc-btn-rag-copy cc-btn-orange" data-action="copy-rag-answer" data-answer="${escapeHtml(fullPlainText)}" title="Skopiuj odpowiedź z wersetami i źródłami">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Kopiuj odpowiedź</span>
          </button>
          <a href="/mojabiblia?q=${encodeURIComponent(primaryRef)}" class="cc-btn-rag-link" title="Otwórz fragment w MojaBiblia">
            <span>📖 MojaBiblia →</span>
          </a>
          <button type="button" class="cc-btn-rag-link" data-action="toggle-compare" data-ref="${escapeHtml(primaryRef)}" title="Porównaj w 4 przekładach (UBG / BW / BT / BG)">
            <span>⚖️ 4 Przekłady</span>
          </button>
          <button type="button" class="cc-btn-rag-link" data-action="toggle-audio" data-verse="${escapeHtml(primary.text)}" data-ref="${escapeHtml(primaryRef)}" title="Słuchaj wersetu (Lektor UBG)">
            <span aria-hidden="true">▶</span>
            <span>Słuchaj</span>
          </button>
          <button type="button" class="cc-btn-rag-link" data-action="open-share-card" data-verse="${escapeHtml(primary.text)}" data-ref="${escapeHtml(primaryRef)}" title="Generuj kartę graficzną 1080x1080">
            <span>🎨 Karta graficzna</span>
          </button>
        </div>
      </div>
    `;
  }

    function renderScriptureCard(match) {
    if (!match) return '';
    const quoteText = match.verseText ? escapeHtml(match.verseText) : 'Ładowanie wersetu z Uwspółcześnionej Biblii Gdańskiej (UBG)...';
    const strongUrl = `/mojabiblia?book=${encodeURIComponent(match.bookCode)}&chapter=${match.chapter}${match.verse ? '&verse=' + match.verse : ''}`;
    const compareUrl = `/mojabiblia?book=${encodeURIComponent(match.bookCode)}&chapter=${match.chapter}${match.verse ? '&verse=' + match.verse : ''}&compare=1`;
    const contextUrl = `/mojabiblia?book=${encodeURIComponent(match.bookCode)}&chapter=${match.chapter}`;
    const audioUrl = `/player?q=${encodeURIComponent(match.bookName + ' ' + match.chapter)}`;
    const copyPayload = escapeHtml(`„${match.verseText || ''}” — ${match.refTitle} (UBG)`);

    const refKey = `${match.bookCode}:${match.chapter}:${match.verse || 1}`;
    const tokens = TOP_INTERLINEAR_TOKENS[refKey] || null;
    let tokensHtml = '';
    if (tokens && tokens.length > 0) {
      const isOT = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'].includes(match.bookCode);
      const chips = tokens.map(t => {
        const isHe = isOT || (t.strong && t.strong.startsWith('H'));
        return '<button type="button" class="cc-token-chip" data-strong="' + escapeHtml(t.strong) + '" title="Kliknij, aby zbadać lemat ' + escapeHtml(t.strong) + '">' +
          '<span class="cc-token-orig ' + (isHe ? 'cc-hebrew' : '') + '" ' + (isHe ? 'dir="rtl"' : '') + '>' + escapeHtml(t.orig) + '</span>' +
          '<span class="cc-token-translit">' + escapeHtml(t.translit) + '</span>' +
          '<span class="cc-token-strong">' + escapeHtml(t.strong) + '</span>' +
          '<span class="cc-token-gloss">' + escapeHtml(t.gloss) + '</span>' +
        '</button>';
      }).join('');

      tokensHtml = '<div class="cc-scripture-tokens-section">' +
        '<div class="cc-scripture-tokens-label">' +
          '<span>🔬 Podgląd interlinearny (kliknij słowo, aby zbadać lemat):</span>' +
          '<small>Tekst oryginalny • Kody Stronga</small>' +
        '</div>' +
        '<div class="cc-scripture-tokens-list">' +
          chips +
        '</div>' +
      '</div>';
    }

    const crossRefs = TOP_CROSS_REFS[refKey] || null;
    let crossRefsHtml = '';
    if (crossRefs && crossRefs.length > 0) {
      const crossChips = crossRefs.map(cr => {
        return '<a href="/mojabiblia?ref=' + encodeURIComponent(cr.ref) + '" class="cc-crossref-chip" title="' + escapeHtml(cr.text || '') + '">' +
          '<span class="cc-crossref-rel">[' + escapeHtml(cr.relation) + ']</span>' +
          '<span class="cc-crossref-ref">' + escapeHtml(cr.ref) + '</span>' +
          '<span class="cc-crossref-desc">' + escapeHtml(cr.text || '') + '</span>' +
        '</a>';
      }).join('');

      crossRefsHtml = '<div class="cc-scripture-crossrefs">' +
        '<div class="cc-scripture-crossrefs-label">' +
          '<span>🔗 Odsyłacze wersetowe (Cross-References):</span>' +
          '<small>Źródło: OpenBible / Crossreferences.org (CC BY 4.0)</small>' +
        '</div>' +
        '<div class="cc-scripture-crossrefs-list">' +
          crossChips +
        '</div>' +
      '</div>';
    }

    return `
      <div class="cc-scripture-card" id="ccScriptureCard">
        <div class="cc-scripture-head">
          <div class="cc-scripture-badge">
            <span class="cc-scripture-icon" aria-hidden="true">📖</span>
            <span class="cc-scripture-level" title="Poziom: Kanoniczny Tekst Biblijny (Biblia w centrum)">TEKST BIBLIJNY</span>
            <span class="cc-scripture-edition">UBG (Uwspółcześniona Biblia Gdańska)</span>
          </div>
          <span class="cc-scripture-ref">${escapeHtml(match.refTitle)}</span>
        </div>${match.isFuzzyMatch ? `
        <div class="cc-scripture-fuzzy-hint">✨ Rozpoznano werset: <b>${escapeHtml(match.refTitle)}</b> <small>(zamiast „${escapeHtml(match.correctedFrom)}”)</small></div>` : ''}
        <blockquote class="cc-scripture-quote" id="ccScriptureQuote">
          „${quoteText}”
        </blockquote>
        ${renderScriptureAudioBar(match)}
        ${tokensHtml}
        ${crossRefsHtml}
        <div class="cc-scripture-actions">
          <a href="${strongUrl}" class="cc-btn-scripture-main">
            Otwórz w MojaBiblia (Strong) →
          </a>
          <a href="${contextUrl}" class="cc-btn-scripture-sub" title="Zobacz cały rozdział w kontekście (±5 wersetów)">
            Kontekst rozdziału
          </a>
          <button type="button" class="cc-btn-scripture-sub cc-btn-compare-trigger" data-action="toggle-compare" data-ref="${escapeHtml(refKey)}" title="Porównaj 4 przekłady UBG, BW, BT, BG">
            <span>⚖️ Porównaj 4 przekłady</span>
          </button>
          <button type="button" class="cc-btn-scripture-copy" id="ccScriptureCopyBtn" data-quote="${copyPayload}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Kopiuj werset</span>
          </button>
          <a href="${audioUrl}" class="cc-btn-scripture-audio">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7Z"/>
            </svg>
            <span>Biblia Audio CC</span>
          </a>
          <button type="button" class="cc-btn-scripture-share" data-action="open-share-card" data-verse="${quoteText}" data-ref="${escapeHtml(match.refTitle)}" title="Udostępnij werset lub pobierz kartę graficzną">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span>Karta &amp; Udostępnij</span>
          </button>
          <button type="button" class="cc-btn-scripture-sources" data-open-sources="true" title="Zobacz rejestr licencji i źródeł Biblia Intelligence CC">
            <span>📜 Źródła (R01–R40)</span>
          </button>
        </div>
        ${renderComparePanel(refKey, match)}
        <div class="cc-scripture-license-note">
          Kanoniczny tekst UBG • Standard ZERO COST • Dane językowe: STEPBible &amp; SBLGNT (CC BY 4.0) • Bez płatnych modeli AI
        </div>
      </div>
    `;
  }



  function renderComparePanel(refKey, match) {
    const comp = TOP_COMPARE_VERSES[refKey] || {
      refTitle: match ? match.refTitle : refKey,
      UBG: (match && match.verseText) ? match.verseText : (TOP_UBG_VERSES[refKey] || 'Brak tekstu UBG'),
      BW: (match && match.verseText) ? match.verseText : (TOP_UBG_VERSES[refKey] || 'Brak tekstu BW'),
      BT: (match && match.verseText) ? match.verseText : (TOP_UBG_VERSES[refKey] || 'Brak tekstu BT'),
      BG: (match && match.verseText) ? match.verseText : (TOP_UBG_VERSES[refKey] || 'Brak tekstu BG')
    };

    const title = comp.refTitle || (match ? match.refTitle : refKey);

    return `
      <div class="cc-scripture-compare-panel" id="ccComparePanel_${escapeHtml(refKey.replace(/[^a-zA-Z0-9]/g, '_'))}" style="display:none;">
        <div class="cc-compare-head">
          <div class="cc-compare-title">
            <span class="cc-compare-icon" aria-hidden="true">⚖️</span>
            <strong>Zestawienie 4 Przekładów Pisma Świętego: ${escapeHtml(title)}</strong>
          </div>
          <span class="cc-compare-sub">Standard Kanoniczny EkoCC: UBG (Textus Receptus)</span>
        </div>
        <div class="cc-compare-grid">
          <div class="cc-compare-col cc-compare-ubg">
            <div class="cc-compare-col-head">
              <span class="cc-badge-trans cc-badge-ubg">UBG</span>
              <span class="cc-compare-edition-name">Uwspółcześniona Gdańska</span>
              <button type="button" class="cc-btn-copy-trans" data-copy="${escapeHtml(comp.UBG)}" title="Kopiuj przekład UBG">Kopiuj</button>
            </div>
            <p class="cc-compare-text">„${escapeHtml(comp.UBG)}”</p>
          </div>
          <div class="cc-compare-col cc-compare-bw">
            <div class="cc-compare-col-head">
              <span class="cc-badge-trans cc-badge-bw">BW</span>
              <span class="cc-compare-edition-name">Biblia Warszawska (1975)</span>
              <button type="button" class="cc-btn-copy-trans" data-copy="${escapeHtml(comp.BW)}" title="Kopiuj przekład BW">Kopiuj</button>
            </div>
            <p class="cc-compare-text">„${escapeHtml(comp.BW)}”</p>
          </div>
          <div class="cc-compare-col cc-compare-bt">
            <div class="cc-compare-col-head">
              <span class="cc-badge-trans cc-badge-bt">BT</span>
              <span class="cc-compare-edition-name">Biblia Tysiąclecia (Wyd. V)</span>
              <button type="button" class="cc-btn-copy-trans" data-copy="${escapeHtml(comp.BT)}" title="Kopiuj przekład BT">Kopiuj</button>
            </div>
            <p class="cc-compare-text">„${escapeHtml(comp.BT)}”</p>
          </div>
          <div class="cc-compare-col cc-compare-bg">
            <div class="cc-compare-col-head">
              <span class="cc-badge-trans cc-badge-bg">BG</span>
              <span class="cc-compare-edition-name">Biblia Gdańska (1632)</span>
              <button type="button" class="cc-btn-copy-trans" data-copy="${escapeHtml(comp.BG)}" title="Kopiuj przekład BG">Kopiuj</button>
            </div>
            <p class="cc-compare-text">„${escapeHtml(comp.BG)}”</p>
          </div>
        </div>
        <div class="cc-compare-footer-note">
          ℹ️ Zgodnie ze Standardem @777 Christian Culture, podstawowym zatwierdzonym tekstem do cytowania w całym ekosystemie jest <strong>UBG</strong>. Pozostałe przekłady służą celom badawczym, lingwistycznym i porównawczym.
        </div>
      </div>
    `;
  }

  function renderQuoteVerificationCard(result) {
    if (!result) return '';
    const safeRef = escapeHtml(result.refTitle);
    const ubgCopy = escapeHtml(`„${result.ubgText}” — ${result.refTitle} (UBG)`);
    const compareUrl = `/mojabiblia?q=${encodeURIComponent(result.refKey)}&compare=1`;

    return `
      <div class="cc-quote-verification-card" id="ccQuoteVerificationCard">
        <div class="cc-quote-verif-head">
          <div class="cc-quote-verif-badge">
            <span class="cc-quote-verif-icon" aria-hidden="true">🛡️</span>
            <span class="cc-quote-verif-level">WERYFIKACJA CYTATU BIBLIJNEGO</span>
            <span class="cc-quote-verif-standard">PROTOKÓŁ @777 • ZERO-QA</span>
          </div>
          <span class="cc-quote-status-badge ${result.badgeClass}">${escapeHtml(result.statusLabel)}</span>
        </div>
        <div class="cc-quote-detected-row">
          <span class="cc-quote-ref-pill">📖 ${safeRef}</span>
          <span class="cc-quote-edition-pill">Wzorzec Kanoniczny: UBG</span>
        </div>
        <blockquote class="cc-quote-canonical-text">
          „${escapeHtml(result.ubgText)}”
        </blockquote>
        ${result.detectedText ? `
        <div class="cc-quote-diff-box">
          <span class="cc-quote-diff-label">Rozpoznany wariant (${escapeHtml(result.matchedEdition)}):</span>
          <p class="cc-quote-diff-text">„${escapeHtml(result.detectedText)}”</p>
        </div>` : ''}
        <div class="cc-quote-verif-note">
          ${escapeHtml(result.note)}
        </div>
        <div class="cc-quote-verif-actions">
          <button type="button" class="cc-btn-scripture-main" style="background:#FF7A00;" id="ccQuoteCopyCanonicalBtn" data-quote="${ubgCopy}">
            <span>Kopiuj Kanoniczny Cytat UBG</span>
          </button>
          <button type="button" class="cc-btn-scripture-sub" data-action="toggle-audio" data-verse="${escapeHtml(result.ubgText)}" data-ref="${safeRef}" title="Słuchaj kanonicznego wersetu UBG">
            <span class="cc-audio-play-icon" aria-hidden="true">▶</span>
            <span class="cc-audio-play-label">Słuchaj (Lektor UBG)</span>
          </button>
          <button type="button" class="cc-btn-scripture-sub" data-action="open-share-card" data-verse="${escapeHtml(result.ubgText)}" data-ref="${safeRef}" title="Udostępnij cytat lub pobierz kartę graficzną">
            <span>🖼️ Karta &amp; Udostępnij</span>
          </button>
          <button type="button" class="cc-btn-scripture-sub" data-action="toggle-compare" data-ref="${escapeHtml(result.refKey)}">
            <span>⚖️ Zobacz 4 Przekłady (UBG, BW, BT, BG)</span>
          </button>
          <a href="${compareUrl}" class="cc-btn-scripture-sub" title="Otwórz badanie w MojaBiblia">
            <span>Badaj w MojaBiblia →</span>
          </a>
        </div>
        ${renderComparePanel(result.refKey, { refTitle: result.refTitle, verseText: result.ubgText })}
      </div>
    `;
  }

    function renderLemmaCard(lemma) {
    if (!lemma) return '';
    const isHe = lemma.lang === 'he';
    const strongUrl = `/mojabiblia?strong=${encodeURIComponent(lemma.strong)}`;
    const concordUrl = `/szukaj?q=${encodeURIComponent(lemma.strong)}`;

    return `
      <div class="cc-lemma-card" id="ccLemmaCard">
        <div class="cc-lemma-head">
          <div class="cc-lemma-badge">
            <span class="cc-lemma-icon" aria-hidden="true">🏛️</span>
            <span class="cc-lemma-level">LINGWISTYKA &amp; TEKST ORYGINALNY</span>
            <span class="cc-lemma-lang">${isHe ? 'Hebrajski biblijny (Stary Testament)' : 'Greka Koine (Nowy Testament)'}</span>
          </div>
          <span class="cc-lemma-status">ZERO COST • SBLGNT / STEPBIBLE</span>
        </div>

        <div class="cc-lemma-word-row">
          <div class="cc-lemma-orig${isHe ? ' cc-rtl' : ''}" dir="${isHe ? 'rtl' : 'ltr'}">${escapeHtml(lemma.original)}</div>
          <div class="cc-lemma-meta">
            <div class="cc-lemma-translit">${escapeHtml(lemma.translit)} <small class="cc-lemma-pron">(${escapeHtml(lemma.pronunciation)})</small></div>
            <div class="cc-lemma-strong-badge" title="Numer Leksykonu Stronga">${escapeHtml(lemma.strong)}</div>
          </div>
        </div>

        <div class="cc-lemma-disclaimer">
          ⚠️ <em>Zasada egzegetyczna:</em> Numeracja Stronga służy jako pomocniczy indeks morfologiczny, a nie samoistny dowód teologiczny. Rzeczywiste znaczenie słowa wynika z kontekstu perykopy.
        </div>

        <div class="cc-lemma-morph">
          <strong>Część mowy:</strong> ${escapeHtml(lemma.partOfSpeech || 'Forma leksykalna')}
          ${lemma.origin ? ` • <span class="cc-lemma-origin"><strong>Etymologia:</strong> ${escapeHtml(lemma.origin)}</span>` : ''}
        </div>

        <div class="cc-lemma-def">
          <div class="cc-lemma-def-label">Definicja Leksykonowa (STEPBible CC BY 4.0):</div>
          <p class="cc-lemma-def-text">${escapeHtml(lemma.definitionPl)}</p>
        </div>

        ${lemma.occurrences > 0 ? `
        <div class="cc-lemma-occurrences">
          📊 <strong>Wystąpienia w Piśmie:</strong> ok. ${lemma.occurrences} razy
          ${lemma.keyVerses && lemma.keyVerses.length ? ` (Kluczowe: ${lemma.keyVerses.map(kv => `<a href="/mojabiblia?q=${encodeURIComponent(kv)}" class="cc-lemma-verse-link">${escapeHtml(kv)}</a>`).join(', ')})` : ''}
        </div>` : ''}

        <div class="cc-lemma-actions">
          <a href="${strongUrl}" class="cc-btn-scripture-main">
            Otwórz hasło w MojaBiblia (Strong) →
          </a>
          <a href="${concordUrl}" class="cc-btn-scripture-sub" title="Przeszukaj wszystkie wystąpienia">
            Konkordancja w UBG
          </a>
          <button type="button" class="cc-btn-scripture-sources" data-open-sources="true" title="Zobacz licencje korpusów językowych">
            <span>📜 Źródła (R01–R40)</span>
          </button>
        </div>
      </div>
    `;
  }

    function renderBibleTopicCard(topicData) {
    if (!topicData) return '';
    const versesHtml = topicData.verses.map(v => `
      <div class="cc-bible-topic-verse-item">
        <div class="cc-topic-verse-row">
          <strong class="cc-bible-topic-ref">${escapeHtml(v.ref)}:</strong>
          <span class="cc-bible-topic-text">„${escapeHtml(v.text)}”</span>
        </div>
        <button type="button" class="cc-btn-topic-verse-audio" data-action="toggle-audio" data-verse="${escapeHtml(v.text)}" data-ref="${escapeHtml(v.ref)}" title="Słuchaj wersetu (Lektor UBG)">
          <span class="cc-audio-play-icon" aria-hidden="true">▶</span>
          <span>Słuchaj</span>
        </button>
      </div>
    `).join('');

    const prayerBoxId = 'ccPrayerBox_' + escapeHtml(topicData.slug);
    const prayerHtml = topicData.prayerText ? `
      <div class="cc-thematic-prayer-box" id="${prayerBoxId}" style="display:none;">
        <div class="cc-prayer-box-head">
          <div class="cc-prayer-box-title">
            <span aria-hidden="true">🙏</span>
            <span>${escapeHtml(topicData.prayerTitle || 'Modlitwa Biblijna')}</span>
          </div>
          <span class="cc-prayer-box-sub">Modlitewnik Christian Culture • Oparty na UBG</span>
        </div>
        <blockquote class="cc-prayer-text">
          „${escapeHtml(topicData.prayerText)}”
        </blockquote>
        <div class="cc-prayer-actions">
          <button type="button" class="cc-btn-prayer-audio" data-action="toggle-audio" data-verse="${escapeHtml(topicData.prayerText)}" data-ref="${escapeHtml(topicData.prayerTitle || topicData.title)}" title="Módl się z lektorem">
            <span class="cc-audio-play-icon" aria-hidden="true">▶</span>
            <span class="cc-audio-play-label">Módl się z lektorem</span>
          </button>
          <button type="button" class="cc-btn-prayer-copy" data-action="copy-prayer" data-prayer="${escapeHtml(topicData.prayerText)}" title="Kopiuj treść modlitwy">
            <span>Kopiuj modlitwę</span>
          </button>
          <a href="/modlitwa" class="cc-btn-prayer-intercede" title="Przejdź do Zjednoczeni za Polskę / Tablica Modlitwy">
            <span>Zanieś intencję do Społeczności →</span>
          </a>
        </div>
      </div>
    ` : '';

    return `
      <div class="cc-bible-topic-card" id="ccBibleTopicCard">
        <div class="cc-bible-topic-head">
          <div class="cc-bible-topic-badge">
            <span class="cc-bible-topic-icon" aria-hidden="true">📜</span>
            <span class="cc-bible-topic-level">TEMAT PISMA ŚWIĘTEGO</span>
            <span class="cc-bible-topic-sub">BIBLIA INTELLIGENCE CC</span>
          </div>
          <span class="cc-bible-topic-tag">ZERO COST FIRST</span>
        </div>
        <h3 class="cc-bible-topic-title">${escapeHtml(topicData.title)}</h3>
        <p class="cc-bible-topic-summary">${escapeHtml(topicData.summary)}</p>
        <div class="cc-bible-topic-verses">
          <div class="cc-bible-topic-verses-label">Kluczowe Referencje Biblijne (UBG):</div>
          ${versesHtml}
        </div>
        <div class="cc-bible-topic-actions">
          ${topicData.prayerText ? `
          <button type="button" class="cc-btn-prayer-trigger" data-action="toggle-prayer" data-target="${prayerBoxId}" aria-expanded="false" title="Otwórz modlitwę opartą na tym Słowie">
            <span>🙏 Pomódl się tym Słowem</span>
          </button>` : ''}
          <a href="${escapeHtml(topicData.studyUrl)}" class="cc-btn-scripture-main">Studiuj w MojaBiblia (Strong) →</a>
          <a href="${escapeHtml(topicData.mediaUrl)}" class="cc-btn-scripture-audio">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z"/></svg>
            <span>Materiały CC</span>
          </a>
          <button type="button" class="cc-btn-scripture-sources" data-open-sources="true" title="Zobacz rejestr licencji i źródeł Biblia Intelligence CC">
            <span>📜 Rejestr Źródeł (R01–R40)</span>
          </button>
        </div>
        ${prayerHtml}
        <div class="cc-scripture-license-note">
          Biblia w centrum • Oddzielenie tekstu Pisma od opracowań i komentarzy redakcyjnych Christian Culture
        </div>
      </div>
    `;
  }


  function renderPlaceCard(place) {
    if (!place) return '';
    const osmUrl = `https://www.openstreetmap.org/?mlat=${place.coords.lat}&mlon=${place.coords.lon}#map=13/${place.coords.lat}/${place.coords.lon}`;
    const wikidataUrl = `https://www.wikidata.org/wiki/${place.wikidataId}`;
    const versesHtml = place.verses.map(v => `
      <div class="cc-bible-place-verse-item">
        <strong class="cc-bible-place-ref">${escapeHtml(v.ref)}:</strong>
        <span class="cc-bible-place-text">„${escapeHtml(v.text)}”</span>
      </div>
    `).join('');

    return `
      <div class="cc-bible-place-card" id="ccBiblePlaceCard">
        <div class="cc-bible-place-head">
          <div class="cc-bible-place-badge">
            <span class="cc-bible-place-icon" aria-hidden="true">🗺️</span>
            <span class="cc-bible-place-level">ATLAS BIBLIJNY &amp; GEOGRAFIA SACRA</span>
            <span class="cc-bible-place-sub">OPENBIBLE (R13) • OSM (R20)</span>
          </div>
          <span class="cc-bible-place-certainty" title="Stopień weryfikacji archeologiczno-historycznej">${escapeHtml(place.certainty)}</span>
        </div>
        <div class="cc-bible-place-title-row">
          <h3 class="cc-bible-place-title">${escapeHtml(place.name)}</h3>
          <span class="cc-bible-place-orig" ${place.lang === 'he' ? 'dir="rtl"' : ''}>${escapeHtml(place.origName)}</span>
        </div>
        <div class="cc-bible-place-meta-bar">
          <span class="cc-bible-place-region">📍 Region: <b>${escapeHtml(place.region)}</b></span>
          <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="cc-bible-place-coords" title="Otwórz współrzędne w OpenStreetMap">
            🌐 ${place.coords.lat.toFixed(4)}° N, ${place.coords.lon.toFixed(4)}° E ↗
          </a>
          <span class="cc-bible-place-qid" title="Identyfikator otwartych danych Wikidata">ID: ${escapeHtml(place.wikidataId)}</span>
        </div>
        <p class="cc-bible-place-summary">${escapeHtml(place.summary)}</p>
        <div class="cc-bible-place-verses">
          <div class="cc-bible-place-verses-label">Kluczowe Miejsca w Piśmie Świętym (UBG):</div>
          ${versesHtml}
        </div>
        <div class="cc-bible-place-actions">
          <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="cc-btn-scripture-main" style="background:#FF7A00;" title="Otwórz interaktywną mapę satelitarno-topograficzną OpenStreetMap">
            <span>Otwórz na Mapie (OpenStreetMap) ↗</span>
          </a>
          <a href="${escapeHtml(place.studyUrl)}" class="cc-btn-scripture-sub" title="Szukaj wszystkich wystąpień w MojaBiblia">
            Konkordancja w MojaBiblia →
          </a>
          <a href="${wikidataUrl}" target="_blank" rel="noopener noreferrer" class="cc-btn-scripture-sub" title="Dane historyczno-archeologiczne Wikidata">
            Wikidata (${escapeHtml(place.wikidataId)}) ↗
          </a>
          <button type="button" class="cc-btn-scripture-sources" data-open-sources="true" title="Zobacz rejestr licencji i źródeł Biblia Intelligence CC">
            <span>📜 Źródła (R01–R40)</span>
          </button>
        </div>
        <div class="cc-scripture-license-note">
          OpenBible Geocoding Data (CC BY 4.0) • OpenStreetMap (ODbL) • Wikidata (CC0) • Standard ZERO COST • Bez opłat i modeli AI
        </div>
      </div>
    `;
  }

    function renderHopeCard(query) {
    return `
      <div class="cc-hope-card" id="ccHopeCard">
        <div class="cc-hope-badge">💛 Wsparcie Duchowe & Modlitwa</div>
        <h3 class="cc-hope-title">Potrzebujesz rozmowy lub modlitwy? Nie jesteś sam.</h3>
        <p class="cc-hope-desc">W Christian Culture czeka na Ciebie bezpłatna pomoc duszpasterska, życzliwe wysłuchanie i wsparcie modlitewne:</p>
        <blockquote class="cc-hope-verse">
          „Wszystkie wasze troski przerzućcie na niego, gdyż on troszczy się o was.”
          <cite>— 1 List Piotra 5:7 (UBG)</cite>
        </blockquote>
        <div class="cc-hope-actions">
          <a href="tel:+48730958583" class="cc-hope-btn cc-hope-btn-call">
            <span class="cc-hope-btn-icon" aria-hidden="true">📞</span>
            <span class="cc-hope-btn-text">
              <strong>Infolinia Nadziei</strong>
              <small>+48 730 958 583 (całodobowa)</small>
            </span>
          </a>
          <a href="tel:+48608337477" class="cc-hope-btn cc-hope-btn-call">
            <span class="cc-hope-btn-icon" aria-hidden="true">👤</span>
            <span class="cc-hope-btn-text">
              <strong>Duszpasterz Mariusz</strong>
              <small>+48 608 337 477 (rozmowa)</small>
            </span>
          </a>
          <a href="/modlitwa" class="cc-hope-btn cc-hope-btn-pray">
            <span class="cc-hope-btn-icon" aria-hidden="true">🙏</span>
            <span class="cc-hope-btn-text">
              <strong>Ściana Modlitwy</strong>
              <small>Zgłoś intencję modlitewną →</small>
            </span>
          </a>
        </div>
      </div>
    `;
  }

  // ── FAZA 3: SŁOWNIK KANONICZNY & AUTOKOREKTA LITERÓWEK (LEVENSHTEIN) ──
  const CANONICAL_WORDS = [
    'apokalipsa', 'rozważanie', 'rozwazanie', 'inspiracja', 'lekcja',
    'kurs', 'akademia', 'mojabiblia', 'biblia', 'werset', 'modlitwa',
    'nadzieja', 'worship', 'śpiewana', 'spiewana', 'karaoke', 'śpiewnik',
    'spiewnik', 'uwielbienie', 'radio', 'audycja', 'podcast', 'film',
    'kino', 'społeczność', 'spolecznosc', 'lumina', 'profil', 'tablica',
    'czat', 'duszpasterz', 'infolinia', 'pomoc', 'święte', 'swiete',
    'jezus', 'chrystus', 'bóg', 'bog', 'przebaczenie', 'zbawienie',
    'pokój', 'pokoj', 'miłość', 'milosc', 'wiara', 'łaska', 'laska',
    'świadectwo', 'swiadectwo', 'ewangelia', 'apostoł', 'apostol',
    'stworzenie', 'sabat', 'szabat', 'proroctwo', 'palla', 'rogowski',
    'rogowska', 'mariusz'
  ];

  function detectTypoCorrection(normQuery, queryWords) {
    if (!queryWords || !queryWords.length) return null;
    let hasCorrection = false;
    const correctedWords = [];
    const ignoredWords = new Set(['w','z','na','o','do','i','a','oraz','czyli','dla','ze','za','po','od','czy','the','and','of','is']);

    for (const w of queryWords) {
      if (ignoredWords.has(w) || /^\d+$/.test(w)) {
        correctedWords.push(w);
        continue;
      }
      if (CANONICAL_WORDS.includes(w)) {
        correctedWords.push(w);
        continue;
      }
      let bestMatch = null;
      let minDistance = 99;
      for (const target of CANONICAL_WORDS) {
        if (Math.abs(w.length - target.length) > 2) continue;
        const dist = levenshteinDist(w, target);
        const maxDist = w.length <= 4 ? 1 : 2;
        if (dist <= maxDist && dist < minDistance) {
          minDistance = dist;
          bestMatch = target;
        }
      }
      if (bestMatch && bestMatch !== w) {
        correctedWords.push(bestMatch);
        hasCorrection = true;
      } else {
        correctedWords.push(w);
      }
    }
    if (!hasCorrection) return null;
    return correctedWords.join(' ');
  }

  // Rozszerzanie zapytania o synonimy i rozpoznawanie zapytań "na dziś"
  function expandQueryTerms(normQuery, queryWords) {
    const synonymsList = [];
    for (const w of queryWords) {
      if (SYNONYM_MAP[w]) {
        for (const syn of SYNONYM_MAP[w]) {
          synonymsList.push(normalizeStr(syn));
        }
      }
    }

    const isTodayQuery = /\b(dzis|dzisiaj|na dzis|dzisiejsz\w*)\b/.test(normQuery);
    const now = new Date();
    const todayDayNum = now.getDate(); // np. 15

    return {
      synonyms: Array.from(new Set(synonymsList)),
      isTodayQuery,
      todayDayNum
    };
  }

  // Inteligentne propozycje bliskoznaczne gdy brak bezpośredniego wyniku
  function findNearSuggestions(normQuery, queryWords, filter) {
    if (!catalogData || !catalogData.items || !catalogData.items.length) return [];

    const isLessonRelated = queryWords.some(w => ['lekcja', 'lekcje', 'lekcji', 'dzien', 'dzień', 'rozwazanie', 'rozważanie', 'kurs', 'studium', 'akademia'].includes(w));
    const now = new Date();
    const todayDay = now.getDate(); // np. 15
    const suggestions = [];
    const seenUrls = new Set();

    function addSuggestion(item) {
      if (!item || seenUrls.has(item.url)) return;
      seenUrls.add(item.url);
      const meta = categorizeItem(item);
      if (filter !== 'all' && meta.group !== filter) return;
      suggestions.push(Object.assign({}, item, { _meta: meta, isNearMatch: true }));
    }

    // 1. Jeśli zapytanie dotyczyło lekcji/rozważań/kursu — zaproponuj dzisiejszą lekcję (Dzień 15), Kurs 28 Kroków i Werset Dnia
    if (isLessonRelated) {
      // Dzień bieżący w kursie codziennym (np. Dzień 15 / Lekcja 15 na dziś)
      const todayLesson = publicSearchItems().find(i => {
        const t = normalizeStr(i.title);
        return t.includes(`dzien ${todayDay}`) || t.includes(`lekcja ${todayDay}`);
      });
      if (todayLesson) addSuggestion(todayLesson);

      // Lekcja fundamentalna 28 Kroków
      const fundLesson = publicSearchItems().find(i => normalizeStr(i.title).includes(`lekcja ${todayDay}:`)) ||
                         publicSearchItems().find(i => normalizeStr(i.title).includes('lekcja 01:') || normalizeStr(i.title).includes('lekcja 1:'));
      if (fundLesson) addSuggestion(fundLesson);

      // Mój Werset Dnia
      const werset = publicSearchItems().find(i => normalizeStr(i.title).includes('werset dnia'));
      if (werset) addSuggestion(werset);

      // Kurs Codzienny / Akademia
      const akademia = publicSearchItems().find(i => (i.url || '').includes('/akademia'));
      if (akademia) addSuggestion(akademia);
    }

    // 2. Przeszukanie katalogu pod kątem częściowych słów lub tolerancji literówek
    for (const item of publicSearchItems()) {
      if (suggestions.length >= 6) break;
      const normTitle = normalizeStr(item.title);
      const normTags = normalizeStr(Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''));
      const text = `${normTitle} ${normTags}`;
      const words = text.split(/\s+/);

      const hasPartialOrFuzzy = queryWords.some(qw => {
        if (qw.length >= 3 && text.includes(qw)) return true;
        return qw.length >= 4 && words.some(w => isFuzzyWordMatch(qw, w));
      });

      if (hasPartialOrFuzzy) {
        addSuggestion(item);
      }
    }

    // 3. Fallback do głównych filarów ekosystemu
    if (suggestions.length < 4) {
      for (const item of publicSearchItems()) {
        if (suggestions.length >= 6) break;
        if (item.featured) addSuggestion(item);
      }
    }

    return suggestions.slice(0, 8);
  }

  function publicSearchItems() {
    return (catalogData?.items || []).filter(item =>
      (!item.access || item.access === 'public') &&
      (!item.visibility || item.visibility === 'public') &&
      !['draft', 'unpublished', 'private', 'removed'].includes(item.status));
  }

  // 7. Inteligentne wyszukiwanie w pamięci (<2ms)
  function publicationTime(item) {
    const iso = item.publishedAt || item.updatedAt;
    if (iso && Number.isFinite(Date.parse(iso))) return Date.parse(iso);
    const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','wrzesnia','pazdziernika','listopada','grudnia'];
    const match = normalizeStr(item.date || '').match(/^(\d{1,2}) (\S+) (\d{4})$/);
    if (match && months.includes(match[2])) return Date.UTC(+match[3], months.indexOf(match[2]), +match[1]);
    return 0;
  }

  function performSearch(query, filter = 'all', limit = 16) {
    if (!catalogData || !catalogData.items) return { items: [], guide: null, isSuggestion: false, suggestionNote: null };

    let normQuery = normalizeStr(query).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cbdcAliases = ['cyfrowy pieniadz', 'waluta banku centralnego', 'central bank digital currency'];
    if (cbdcAliases.includes(normQuery)) normQuery = 'cbdc';
    if (!normQuery) {
      return {
        items: publicSearchItems().filter(i => i.featured).slice(0, 8).map(i => Object.assign({}, i, { _meta: categorizeItem(i) })),
        guide: null,
        isSuggestion: false,
        suggestionNote: null
      };
    }

    if (/^(najnowsze (artykuly|publikacje)( cc)?|latest (articles|publications)( cc)?)$/.test(normQuery)) {
      const seen = new Set();
      const items = publicSearchItems().filter(i => i.type === 'article' && publicationTime(i) > 0)
        .filter(i => filter === 'all' || categorizeItem(i).group === filter)
        .sort((a, b) => publicationTime(b) - publicationTime(a))
        .filter(i => { const key = new URL(i.url, 'https://polskieradio.cc').href; if (seen.has(key)) return false; seen.add(key); return true; })
        .slice(0, limit).map(i => Object.assign({}, i, { _meta: categorizeItem(i) }));
      return { items, guide: null, isSuggestion: false, suggestionNote: null };
    }
    const ignoredWords = new Set(['w','z','na','o','do','i','a','oraz','czyli','dla','ze','za','po','od','czy','the','and','of','is']);
    const queryWords = normQuery.split(/\s+/).filter(w => w && !ignoredWords.has(w));
    if (!queryWords.length) return { items: [], guide: null, isSuggestion: false, suggestionNote: null, autocorrect: null };
    const typoCorrection = detectTypoCorrection(normQuery, queryWords);
    const { synonyms, isTodayQuery, todayDayNum } = expandQueryTerms(normQuery, queryWords);
    if (typoCorrection) {
      const correctedTokens = typoCorrection.split(/\s+/);
      for (const ct of correctedTokens) {
        if (!synonyms.includes(ct)) synonyms.push(ct);
      }
    }
    const numberTokens = queryWords.filter(w => /^\d+$/.test(w));

    // Sprawdzenie przewodnika tematycznego
    let matchedGuide = null;
    if (catalogData.contextGuides) {
      for (const [key, g] of Object.entries(catalogData.contextGuides)) {
        const keyNorm = normalizeStr(key);
        const match = queryWords.some(w => keyNorm.includes(w) || (g.keywords && g.keywords.some(k => normalizeStr(k).includes(w))));
        if (match) {
          matchedGuide = g;
          break;
        }
      }
    }

    const scored = [];
    for (const item of publicSearchItems()) {
      const meta = categorizeItem(item);
      if (filter !== 'all' && meta.group !== filter) continue;

      const normTitle = normalizeStr(item.title);
      const normDesc = normalizeStr(item.description);
      const normTags = normalizeStr(Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''));
      const normContent = normalizeStr(item.contentSnippet || item.fullText || '');
      const itemUrl = normalizeStr(item.url || '');
      const allItemText = `${normTitle} ${normTags} ${normDesc} ${normContent}`;
      const itemWords = allItemText.split(/\s+/).filter(Boolean);

      let score = 0;

      // Dokładne dopasowanie frazy w tytule
      if (normTitle === normQuery) score += 140;
      else if (normTitle.startsWith(normQuery)) score += 90;
      else if (containsTerm(normTitle, normQuery)) score += 60;
      else if (containsTerm(normTags, normQuery)) score += 40;

      // Słowa zapytania z tolerancją literówek
      let primaryWordsMatched = 0;
      for (const w of queryWords) {
        if (containsTerm(normTitle, w)) {
          score += 35;
          primaryWordsMatched++;
        } else if (containsTerm(normTags, w)) {
          score += 25;
          primaryWordsMatched++;
        } else if (containsTerm(normDesc, w)) {
          score += 15;
          primaryWordsMatched++;
        } else if (containsTerm(normContent, w)) {
          score += 8;
          primaryWordsMatched++;
        } else if (w.length >= 4 && itemWords.some(iw => isFuzzyWordMatch(w, iw))) {
          // Dopasowanie literówki (np. "rozwżanie" -> "rozważanie")
          score += 28;
          primaryWordsMatched++;
        }
      }

      // Bonus za synonimy
      for (const syn of synonyms) {
        if (containsTerm(normTitle, syn)) score += 20;
        else if (containsTerm(normTags, syn)) score += 12;
      }

      // Specjalne dopasowanie dla zapytań o materiał "na dziś" (np. Lekcja 15 na dziś)
      if (isTodayQuery && todayDayNum) {
        const dayStr = String(todayDayNum);
        const dayPadded = todayDayNum < 10 ? '0' + todayDayNum : String(todayDayNum);
        if (normTitle.includes(dayStr) || normTags.includes(dayStr) || itemUrl.includes(`dzien-${dayPadded}`)) {
          score += 55;
        }
      }

      // Jeśli użytkownik podał konkretną liczbę (np. "15"), dopasowanie tej dokładnej liczby w tytule ma priorytet
      for (const num of numberTokens) {
        if (normTitle.includes(`lekcja ${num}`) || normTitle.includes(`dzien ${num}`) || normTitle.includes(` ${num}:`) || normTitle.includes(` ${num} `) || normTitle.endsWith(` ${num}`)) {
          score += 90;
        } else if (normTitle.includes(num)) {
          score += 45;
        }
      }

      if (primaryWordsMatched === queryWords.length && queryWords.length > 1) {
        score += 25;
      }
      if (score > 0) {
        if (item.featured) score += 10;
        scored.push({ item, score, meta, primaryWordsMatched });
      }
    }

    // Analiza czy w zapytaniu występuje konkretny numer (np. 15, 99)
    const stopWords = new Set(['w', 'z', 'na', 'o', 'do', 'i', 'a', 'oraz', 'czyli', 'dla', 'ze', 'za', 'po', 'od']);
    const significantWords = queryWords.filter(w => !stopWords.has(w));

    let missingNumberToken = null;

    if (scored.length > 0) {
      scored.sort((a, b) => b.score - a.score);
      const seen = new Set();
      for (let i = 0; i < scored.length;) {
        const key = new URL(scored[i].item.url, 'https://polskieradio.cc').href;
        if (seen.has(key)) scored.splice(i, 1);
        else { seen.add(key); i++; }
      }

      // Sprawdzenie czy numer z zapytania rzeczywiście istnieje w wynikach
      if (numberTokens.length > 0) {
        for (const num of numberTokens) {
          const numFound = scored.some(s => {
            const t = normalizeStr(s.item.title);
            const tags = normalizeStr(Array.isArray(s.item.tags) ? s.item.tags.join(' ') : (s.item.tags || ''));
            const u = normalizeStr(s.item.url || '');
            return t.includes(num) || tags.includes(num) || u.includes(num);
          });
          if (!numFound) {
            missingNumberToken = num;
            break;
          }
        }
      }

      // Jeśli w zapytaniu był konkretny numer (np. Lekcja 99), którego nie ma w ekosystemie:
      if (missingNumberToken) {
        const todayDay = new Date().getDate();
        const todayItem = publicSearchItems().find(i => normalizeStr(i.title).includes(`dzien ${todayDay}`) || normalizeStr(i.title).includes(`lekcja ${todayDay}`));
        const otherScored = scored.filter(s => !todayItem || s.item.url !== todayItem.url).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true }));
        const suggestionList = todayItem
          ? [Object.assign({}, todayItem, { _meta: categorizeItem(todayItem), isNearMatch: true }), ...otherScored.slice(0, 15)]
          : scored.slice(0, 16).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true }));

        return {
          items: suggestionList,
          guide: matchedGuide,
          isSuggestion: true,
          suggestionNote: `Nie znaleziono w ekosystemie materiału z numerem ${missingNumberToken}. Proponujemy aktualną Lekcję ${todayDay} na dziś oraz dostępne lekcje biblijne:`
        };
      }

      // Sprawdzenie czy przynajmniej jeden wynik pokrywa wszystkie istotne słowa lub ma wysoki score
      const hasExactOrAllWordsMatch = scored.some(s => {
        if (s.score >= 90) return true;
        if (significantWords.length <= 1) return s.primaryWordsMatched >= 1;
        return s.primaryWordsMatched >= significantWords.length;
      });

      // Jeśli zapytanie wielowyrazowe nie znalazło pełnego pokrycia
      if (!hasExactOrAllWordsMatch && significantWords.length >= 2) {
        return {
          items: scored.slice(0, limit).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true })),
          guide: matchedGuide,
          isSuggestion: true,
          suggestionNote: `Brak pełnego dopasowania dla wszystkich słów. Proponujemy najbardziej zbliżone materiały z ekosystemu:`
        };
      }

      return {
        items: scored.slice(0, limit).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: s.primaryWordsMatched < queryWords.length })),
        guide: matchedGuide,
        isSuggestion: false,
        suggestionNote: null,
        autocorrect: typoCorrection ? { original: query, corrected: typoCorrection } : null
      };
    }

    // Gdy brak bezpośrednich wyników — sugeruj bliskoznaczną propozycję
    const nearSuggestions = findNearSuggestions(normQuery, queryWords, filter);
    const isLessonQuery = queryWords.some(w => ['lekcja', 'lekcje', 'lekcji', 'dzien', 'dzień', 'rozwazanie', 'rozważanie', 'kurs'].includes(w));
    
    let note = `Nie znaleźliśmy bezpośredniego dopasowania dla «${query}». Proponujemy bliskoznaczne materiały z ekosystemu Christian Culture:`;
    if (isLessonQuery) {
      const todayDay = new Date().getDate();
      note = `Nie znaleziono dokładnie tego numeru lekcji. Proponujemy aktualną Lekcję ${todayDay} na dziś oraz powiązane studia biblijne:`;
    }

    return {
      items: nearSuggestions,
      guide: matchedGuide,
      isSuggestion: true,
      suggestionNote: note,
      autocorrect: typoCorrection ? { original: query, corrected: typoCorrection } : null
    };
  }

  // 7. Tworzenie elementów interfejsu (CSS + Modal)
  function ensureStyles() {
    if (document.getElementById('cc-omni-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-omni-search-styles';
    style.textContent = `
      /* Wyszukiwarka ekosystemu — ekran startowy jak Google, kolory EkoCC (@007, wzór L0 26.10.2026). */
      #ccOmniOverlay {
        --omni-gold: #FF7A00; /* kolor akcji CC (standard L0 26.10.2026) */
        --omni-gold-hover: #FF8C33;
        --omni-gold-deep: #E66A00;
        --omni-ink: #F3E5C8;
        --omni-muted: #b9b0a0;
        --omni-title: #E2CC9A;
        --omni-line: rgba(196, 163, 90, 0.32);
        --omni-paper: #ffffff;
        --omni-paper-ink: #1f1a12;
        --omni-paper-muted: #6b6457;
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #05070c url('/images/search/polska-radio-1600.webp') center / cover no-repeat fixed;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: rgba(196, 163, 90, 0.35) transparent;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-out, visibility 0.2s;
        box-sizing: border-box;
        font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      #ccOmniOverlay::before {
        content: "";
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at 50% 38%, rgba(5, 7, 12, 0.25) 0%, rgba(3, 4, 8, 0.88) 100%);
        pointer-events: none;
      }
      @media (max-width: 640px) {
        #ccOmniOverlay { background-image: url('/images/search/polska-radio-800.webp'); }
      }

      /* Elegancki ciemny pasek przewijania (eliminacja białych pasków Windows) */
      #ccOmniOverlay::-webkit-scrollbar,
      .cc-omni-results-col::-webkit-scrollbar,
      .cc-sources-modal-body::-webkit-scrollbar,
      .cc-omni-apps::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      #ccOmniOverlay::-webkit-scrollbar-track,
      .cc-omni-results-col::-webkit-scrollbar-track,
      .cc-sources-modal-body::-webkit-scrollbar-track,
      .cc-omni-apps::-webkit-scrollbar-track {
        background: transparent;
      }
      #ccOmniOverlay::-webkit-scrollbar-thumb,
      .cc-omni-results-col::-webkit-scrollbar-thumb,
      .cc-sources-modal-body::-webkit-scrollbar-thumb,
      .cc-omni-apps::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35);
        border-radius: 6px;
      }
      #ccOmniOverlay::-webkit-scrollbar-thumb:hover,
      .cc-omni-results-col::-webkit-scrollbar-thumb:hover,
      .cc-sources-modal-body::-webkit-scrollbar-thumb:hover,
      .cc-omni-apps::-webkit-scrollbar-thumb:hover {
        background: #FF7A00;
      }

            #ccOmniOverlay.cc-open {
        opacity: 1;
        visibility: visible;
      }
      #ccOmniModal {
        position: relative;
        width: 100%;
        max-width: 760px;
        min-height: 100%;
        margin: 0 auto;
        padding: 0 16px;
        color: var(--omni-ink);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .cc-omni-top {
        /* Przypięty do prawej krawędzi ekranu, nie do kolumny treści (L0 26.10.2026) */
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 3;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        padding: max(env(safe-area-inset-top), 12px) max(env(safe-area-inset-right), 20px) 8px 16px;
        background: linear-gradient(180deg, rgba(3, 4, 8, 0.85) 0%, rgba(3, 4, 8, 0) 100%);
        box-sizing: border-box;
      }
      /* Pasek w prawym górnym rogu: Czat | Nowości | Wszystko | Logowanie LUMINA (wzór L0 26.10.2026) */
      .cc-omni-topnav {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cc-omni-toplink,
      .cc-omni-apps-btn,
      .cc-omni-radio,
      .cc-omni-edge-btn,
      #ccOmniOverlay #ccTopBarFavBtn,
      #ccOmniOverlay .cc-topbar-fav-btn {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        margin: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #FF7A00;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        flex-shrink: 0;
        box-shadow: none;
        transition: background-color 0.15s, transform 0.15s, color 0.15s;
      }
      .cc-omni-toplink:hover, .cc-omni-toplink:focus-visible,
      .cc-omni-apps-btn:hover, .cc-omni-apps-btn:focus-visible,
      .cc-omni-radio:hover, .cc-omni-radio:focus-visible,
      .cc-omni-edge-btn:hover, .cc-omni-edge-btn:focus-visible,
      #ccOmniOverlay #ccTopBarFavBtn:hover, #ccOmniOverlay #ccTopBarFavBtn:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        color: #FF8C33;
        transform: scale(1.08);
        outline: none;
      }
      .cc-omni-toplink:active,
      .cc-omni-apps-btn:active,
      .cc-omni-radio:active,
      .cc-omni-edge-btn:active {
        transform: scale(0.95);
      }
      .cc-omni-toplink svg,
      .cc-omni-apps-btn svg,
      .cc-omni-radio svg,
      .cc-omni-edge-btn svg,
      #ccOmniOverlay #ccTopBarFavBtn svg {
        width: 22px;
        height: 22px;
        color: #FF7A00;
        flex-shrink: 0;
      }
      .cc-omni-radio .cc-i-stop,
      .cc-omni-radio[aria-pressed="true"] .cc-i-play {
        display: none;
      }
      .cc-omni-radio[aria-pressed="true"] .cc-i-stop {
        display: block;
        color: #FF7A00;
      }
      .cc-omni-radio.cc-loading {
        opacity: 0.6;
      }
      .cc-omni-apps-wrap {
        position: relative;
        display: flex;
        align-items: center;
        height: 44px;
        margin: 0;
      }
      #ccOmniOverlay.cc-standalone #ccOmniClose,
      .ccw-fallback ~ #ccOmniOverlay #ccOmniClose {
        display: none !important;
      }
      /* Menu „Wszystko”: ciemne szkło jak cała wyszukiwarka, ikony w kolorze akcji #FF7A00 (L0 26.10.2026) */
      .cc-omni-apps {
        position: absolute;
        right: 0;
        top: calc(100% + 10px);
        z-index: 2;
        width: 320px;
        max-height: calc(100vh - 160px); /* kończy się nad dolną belką */
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 16px 14px 14px;
        background: rgba(8, 9, 14, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: var(--omni-ink);
        border: 1px solid var(--omni-line);
        border-top: 3px solid var(--omni-gold);
        border-radius: 18px;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 122, 0, 0.12);
        box-sizing: border-box;
        scrollbar-width: thin;
        scrollbar-color: var(--omni-gold) transparent;
      }
      .cc-omni-apps[hidden] { display: none; }
      .cc-omni-apps-title {
        margin: 0 0 12px;
        padding: 0 4px 10px;
        border-bottom: 1px solid var(--omni-line);
        color: var(--omni-gold);
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-omni-apps-sec {
        margin: 14px 4px 6px;
        color: var(--omni-muted);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-omni-apps-title + .cc-omni-apps-sec { margin-top: 2px; }
      .cc-omni-apps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
      }
      .cc-omni-apps-grid a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-height: 78px;
        padding: 10px 4px 8px;
        border-radius: 14px;
        color: var(--omni-ink);
        text-decoration: none;
        font-size: 0.76rem;
        font-weight: 500;
        line-height: 1.2;
        text-align: center;
        transition: background-color 0.15s;
      }
      .cc-omni-app-ico {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--omni-gold);
        background: rgba(255, 122, 0, 0.1);
        border: 1px solid rgba(255, 122, 0, 0.35);
        box-sizing: border-box;
        transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
      }
      .cc-omni-apps-grid a:hover, .cc-omni-apps-grid a:focus-visible { background: rgba(255, 255, 255, 0.06); outline: none; }
      .cc-omni-apps-grid a:hover .cc-omni-app-ico, .cc-omni-apps-grid a:focus-visible .cc-omni-app-ico {
        background: var(--omni-gold);
        color: #fff;
        box-shadow: 0 0 14px rgba(255, 122, 0, 0.55);
      }
      #ccOmniOverlay #ccTopBarFavBtn {
        border: 0;
        background: transparent;
        box-shadow: none;
        min-width: 44px;
        min-height: 44px;
      }
      #ccOmniOverlay #ccTopBarFavBtn:focus-visible {
        outline: 2px solid var(--omni-gold-hover);
        outline-offset: 2px;
      }
      .cc-omni-account {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, var(--omni-gold-hover), var(--omni-gold) 55%, var(--omni-gold-deep));
        box-shadow: 0 0 18px rgba(255, 122, 0, 0.55);
        color: #fff;
        text-decoration: none;
        overflow: hidden;
        flex-shrink: 0;
      }
      .cc-omni-account:hover, .cc-omni-account:focus-visible { box-shadow: 0 0 22px rgba(255, 175, 50, 0.85); transform: scale(1.08); outline: none; }
      .cc-omni-account { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease; }
      .cc-omni-account-face { font-size: 1.2rem; font-weight: 800; line-height: 1; }
      .cc-omni-account img { width: 100%; height: 100%; object-fit: cover; }
      @media (max-width: 640px) {
        .cc-omni-apps { position: fixed; left: 16px; right: 16px; top: calc(max(env(safe-area-inset-top), 12px) + 56px); bottom: calc(max(env(safe-area-inset-bottom), 8px) + 64px); max-height: none; width: auto; }
      }
      @media (max-width: 420px) {
        .cc-omni-toplink { padding: 0 6px; gap: 6px; font-size: 0.86rem; }
        .cc-omni-topnav { gap: 0; }
      }
      .cc-omni-btn {
        background: transparent;
        border: 0;
        border-radius: 50%;
        color: var(--omni-ink);
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background-color 0.15s;
        touch-action: manipulation;
        padding: 0;
        flex-shrink: 0;
      }
      .cc-omni-btn:hover, .cc-omni-btn:focus-visible {
        color: var(--omni-gold);
        background: rgba(255, 255, 255, 0.1);
        outline: none;
      }
      .cc-omni-hero {
        text-align: center;
        padding: calc(8vh + 54px) 0 16px;
      }
      .cc-omni-brand {
        position: relative;
        width: min(580px, 100%);
        aspect-ratio: 1774 / 400;
        margin: 0 auto;
        overflow: hidden;
      }
      .cc-omni-brand img {
        position: absolute;
        top: -60%;
        left: 0;
        display: block;
        width: 100%;
        height: auto;
      }
      .cc-omni-header {
        padding: 0;
      }
      .cc-omni-field {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 56px;
        padding: 0 8px 0 20px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        color: #ffffff;
        border: 2px solid #FF7A00;
        border-radius: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 122, 0, 0.3);
        transition: box-shadow 0.18s, border-color 0.18s, background-color 0.18s;
        box-sizing: border-box;
      }
      .cc-omni-field:focus-within, .cc-omni-field:hover {
        border-color: #FF8C33;
        background: rgba(255, 255, 255, 0.22);
        box-shadow: 0 12px 42px rgba(0, 0, 0, 0.5), 0 0 28px rgba(255, 140, 51, 0.45);
      }
      .cc-omni-search-icon {
        color: #FF7A00;
        display: flex;
        flex-shrink: 0;
      }
      .cc-omni-search-icon svg {
        color: #FF7A00;
        stroke: #FF7A00;
      }
      #ccOmniInput {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        font: 500 1.05rem/1.3 inherit;
        color: #ffffff;
        padding: 0;
        min-height: 44px;
      }
      #ccOmniInput::placeholder {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 400;
      }
      .cc-omni-field .cc-omni-btn {
        color: rgba(255, 255, 255, 0.8);
      }
      .cc-omni-field .cc-omni-btn:hover, .cc-omni-field .cc-omni-btn:focus-visible {
        color: #FF7A00;
        background: rgba(255, 255, 255, 0.12);
      }
      #ccOmniMic.cc-listening {
        color: #b3261e;
      }
      /* Przełącznik G (Google) — aktywny ma podświetlenie, pole ma niebiesko-pomarańczową ramkę */
      .cc-omni-engine { opacity: 0.55; transition: opacity 0.15s, background-color 0.15s; }
      .cc-omni-engine:hover, .cc-omni-engine:focus-visible { opacity: 1; }
      .cc-omni-engine[aria-pressed="true"] { opacity: 1; background: #e8f0fe; box-shadow: inset 0 0 0 1px #4285F4; }
      .cc-omni-field.cc-engine-google { border-color: #4285F4; box-shadow: 0 8px 30px rgba(66, 133, 244, 0.35); }
      .cc-omni-google-go {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        margin: 0 -12px;
        border-radius: 12px;
        background: rgba(66, 133, 244, 0.14);
        color: var(--omni-ink);
        text-decoration: none;
        min-height: 56px;
      }
      .cc-omni-google-go:hover, .cc-omni-google-go:focus-visible { background: rgba(66, 133, 244, 0.24); outline: none; }
      .cc-omni-google-go b { display: block; font-size: 1.05rem; font-weight: 600; color: #fff; }
      .cc-omni-google-go small { display: block; font-size: 0.8rem; color: var(--omni-muted); }
      .cc-omni-google-g {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #fff;
        color: #4285F4;
        font: 800 1.2rem/36px Arial, sans-serif;
        text-align: center;
        flex-shrink: 0;
      }
      .cc-omni-google-sub { margin: 6px 0 0; font-size: 0.78rem; color: var(--omni-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      /* ── Nowe style: Historia, Tagi, Filary i Skróty (Spotlight / Raycast Standard) ── */
      .cc-omni-recents-bar {
        width: 100%;
        max-width: 820px;
        background: rgba(18, 22, 36, 0.75);
        border: 1px solid rgba(196, 163, 90, 0.25);
        border-radius: 14px;
        padding: 10px 14px;
        box-sizing: border-box;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      .cc-omni-recents-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.78rem;
        color: var(--omni-gold);
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .cc-omni-recents-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cc-omni-recents-clear {
        background: transparent;
        border: 0;
        color: var(--omni-muted);
        font: 500 0.74rem inherit;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
        min-height: 32px;
        display: inline-flex;
        align-items: center;
      }
      .cc-omni-recents-clear:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.12);
      }
      .cc-omni-recents-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-recent-pill {
        display: inline-flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 0 4px 0 12px;
        min-height: 36px;
        transition: all 0.15s ease;
      }
      .cc-omni-recent-pill:hover {
        background: rgba(196, 163, 90, 0.15);
        border-color: rgba(196, 163, 90, 0.45);
      }
      .cc-omni-recent-query {
        background: transparent;
        border: 0;
        color: var(--omni-ink);
        font: 500 0.82rem inherit;
        cursor: pointer;
        padding: 6px 4px 6px 0;
        min-height: 36px;
        display: inline-flex;
        align-items: center;
      }
      .cc-omni-recent-query:hover {
        color: var(--omni-gold);
      }
      .cc-omni-recent-del {
        background: transparent;
        border: 0;
        color: var(--omni-muted);
        font-size: 1rem;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 50%;
        line-height: 1;
        min-height: 28px;
        min-width: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .cc-omni-recent-del:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.18);
      }
      .cc-omni-tags-bar {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 10px;
        justify-content: center;
      }
      .cc-omni-tags-label {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--omni-gold);
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .cc-omni-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }
      .cc-omni-tag-chip {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0 14px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--omni-ink);
        font: 600 0.82rem inherit;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
        text-decoration: none;
        touch-action: manipulation;
      }
      .cc-omni-tag-chip:hover, .cc-omni-tag-chip:focus-visible {
        background: rgba(196, 163, 90, 0.18);
        border-color: var(--omni-gold);
        color: var(--omni-gold);
        transform: translateY(-1px);
        outline: none;
      }
      .cc-omni-featured-section {
        width: 100%;
        max-width: 860px;
        background: linear-gradient(180deg, rgba(16, 21, 36, 0.62) 0%, rgba(10, 14, 24, 0.42) 100%);
        border: 1px solid rgba(196, 163, 90, 0.22);
        border-radius: 20px;
        padding: 16px 18px 18px;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        box-sizing: border-box;
      }
      .cc-omni-featured-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        padding: 0 2px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .cc-omni-featured-title-wrap {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-featured-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.88rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #FF7A00;
      }
      .cc-omni-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-left: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(255, 122, 0, 0.16);
        border: 1px solid rgba(255, 122, 0, 0.45);
        color: #FF7A00;
        font-size: 0.64rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-omni-context-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(196, 163, 90, 0.12);
        border: 1px solid rgba(196, 163, 90, 0.3);
        color: rgba(243, 229, 200, 0.92);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        transition: opacity 0.22s ease, transform 0.22s ease;
      }
      .cc-live-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF7A00;
        box-shadow: 0 0 6px #FF7A00;
        animation: ccPulseLive 1.8s infinite ease-in-out;
      }
      @keyframes ccPulseLive {
        0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px #FF7A00; }
        50% { transform: scale(1.35); opacity: 0.55; box-shadow: 0 0 12px #FF8C33; }
      }
      .cc-omni-featured-controls {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .cc-omni-feat-nav {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid rgba(196, 163, 90, 0.32);
        background: rgba(15, 20, 34, 0.75);
        color: var(--omni-gold);
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
      }
      .cc-omni-feat-nav:hover, .cc-omni-feat-nav:focus-visible {
        background: rgba(255, 122, 0, 0.2);
        border-color: #FF7A00;
        color: #fff;
        transform: scale(1.06);
        outline: none;
      }
      .cc-omni-featured-dots {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .cc-omni-feat-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(196, 163, 90, 0.26);
        border: 1px solid rgba(196, 163, 90, 0.38);
        padding: 0;
        cursor: pointer;
        transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1), background 0.22s, transform 0.22s, border-color 0.22s, box-shadow 0.22s;
      }
      .cc-omni-feat-dot:hover {
        background: rgba(255, 122, 0, 0.55);
        border-color: #FF7A00;
      }
      .cc-omni-feat-dot.active {
        width: 22px;
        background: linear-gradient(90deg, #FF7A00, #C4A35A);
        border-color: #FF8C33;
        box-shadow: 0 0 10px rgba(255, 122, 0, 0.55);
      }
      .cc-omni-feat-modes {
        display: flex;
        align-items: center;
        gap: 5px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 2px 2px 12px;
        margin-bottom: 2px;
      }
      @media (min-width: 641px) {
        .cc-omni-feat-modes {
          flex-wrap: wrap;
          overflow-x: visible;
        }
      }
      .cc-omni-feat-modes::-webkit-scrollbar {
        display: none;
      }
      .cc-omni-feat-mode-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(196, 163, 90, 0.22);
        background: rgba(14, 18, 30, 0.72);
        color: rgba(243, 229, 200, 0.78);
        font-size: 0.7rem;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
      }
      .cc-omni-feat-mode-btn:hover, .cc-omni-feat-mode-btn:focus-visible {
        border-color: rgba(255, 122, 0, 0.55);
        color: #fff;
        background: rgba(255, 122, 0, 0.14);
        transform: translateY(-1px);
        outline: none;
      }
      .cc-omni-feat-mode-btn.active {
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.24), rgba(196, 163, 90, 0.22));
        border-color: #FF7A00;
        color: #fff;
        box-shadow: 0 4px 14px rgba(255, 122, 0, 0.22);
      }
      .cc-omni-featured-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        perspective: 1000px;
      }
      @media (min-width: 641px) {
        .cc-omni-featured-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .cc-omni-feat-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 15px 16px;
        min-height: 98px;
        background: linear-gradient(145deg, rgba(16, 21, 36, 0.9) 0%, rgba(11, 15, 26, 0.86) 100%);
        border: 1px solid rgba(196, 163, 90, 0.28);
        border-radius: 16px;
        text-decoration: none;
        color: var(--omni-ink);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
        transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease, box-shadow 0.26s ease, background-color 0.26s ease, opacity 0.26s cubic-bezier(0.22, 1, 0.36, 1), filter 0.26s ease;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        will-change: transform, opacity, filter;
      }
      .cc-omni-feat-card.cc-card-updating {
        opacity: 0.08;
        transform: perspective(900px) translate3d(0, 10px, -16px) rotateX(5deg) scale(0.965);
        filter: blur(3px);
      }
      .cc-omni-feat-card.cc-card-entering {
        animation: ccCardCascadeIn 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @keyframes ccCardCascadeIn {
        0% {
          opacity: 0.22;
          transform: perspective(900px) translate3d(0, -8px, 10px) scale(0.98);
          border-color: rgba(255, 122, 0, 0.65);
        }
        60% {
          border-color: rgba(196, 163, 90, 0.58);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 18px rgba(255, 122, 0, 0.2);
        }
        100% {
          opacity: 1;
          transform: perspective(900px) translate3d(0, 0, 0) scale(1);
        }
      }
      .cc-omni-feat-card::after {
        content: "";
        position: absolute;
        top: 0;
        left: -120%;
        width: 75%;
        height: 100%;
        background: linear-gradient(105deg, transparent 0%, rgba(255, 140, 51, 0.14) 45%, rgba(196, 163, 90, 0.22) 55%, transparent 100%);
        transform: skewX(-20deg);
        pointer-events: none;
      }
      .cc-omni-feat-card.cc-card-entering::after {
        animation: ccCardShimmerSweep 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @keyframes ccCardShimmerSweep {
        0% { left: -110%; opacity: 1; }
        100% { left: 140%; opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .cc-live-pulse-dot { animation: none; }
        .cc-omni-feat-card.cc-card-updating { transform: none; filter: none; opacity: 0.6; }
        .cc-omni-feat-card.cc-card-entering { animation: none; }
        .cc-omni-feat-card.cc-card-entering::after { animation: none; }
      }
      .cc-omni-feat-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.09) 0%, transparent 62%);
        pointer-events: none;
      }
      .cc-omni-feat-card:hover, .cc-omni-feat-card:focus-visible {
        transform: translateY(-3px);
        border-color: var(--omni-gold);
        background: linear-gradient(145deg, rgba(24, 31, 52, 0.95) 0%, rgba(15, 20, 35, 0.92) 100%);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55), 0 0 18px rgba(196, 163, 90, 0.26);
        outline: none;
      }
      .cc-omni-feat-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.22), rgba(196, 163, 90, 0.32));
        border: 1px solid rgba(255, 122, 0, 0.45);
        color: #FF7A00;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.32);
        transition: transform 0.22s ease, border-color 0.22s ease, color 0.22s ease;
      }
      .cc-omni-feat-card:hover .cc-omni-feat-icon {
        border-color: var(--omni-gold);
        color: var(--omni-gold);
        transform: scale(1.06);
      }
      .cc-omni-feat-info {
        flex: 1;
        min-width: 0;
      }
      .cc-omni-feat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 4px;
      }
      .cc-omni-feat-tag {
        display: inline-block;
        font-size: 0.67rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #FF7A00;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-feat-badge {
        display: inline-flex;
        align-items: center;
        padding: 1px 6px;
        border-radius: 6px;
        background: rgba(196, 163, 90, 0.14);
        border: 1px solid rgba(196, 163, 90, 0.28);
        color: var(--omni-gold-light);
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .cc-omni-feat-title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: normal;
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.32;
        color: #fff;
        margin-bottom: 4px;
      }
      .cc-omni-feat-card:hover .cc-omni-feat-title {
        color: var(--omni-gold-light);
      }
      .cc-omni-feat-desc {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 0.77rem;
        color: var(--omni-muted);
        line-height: 1.4;
      }
      .cc-omni-feat-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }
      .cc-omni-feat-listen-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 30px;
        padding: 4px 12px;
        border-radius: 999px;
        background: #FF7A00;
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #FFFFFF;
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(255, 122, 0, 0.35);
        transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        position: relative;
        z-index: 2;
      }
      .cc-omni-feat-listen-btn:hover, .cc-omni-feat-listen-btn:focus-visible {
        background: #FF8C33;
        transform: translateY(-1px) scale(1.02);
        box-shadow: 0 5px 14px rgba(255, 122, 0, 0.5);
        outline: none;
      }
      .cc-omni-feat-listen-btn:active {
        background: #E66A00;
        transform: translateY(0) scale(0.99);
      }
      .cc-omni-feat-listen-btn.cc-loading {
        opacity: 0.8;
        pointer-events: none;
      }
      .cc-omni-feat-listen-btn.is-playing {
        background: #E66A00;
        border-color: #FFD29D;
        box-shadow: 0 0 0 2px rgba(255, 140, 51, 0.42), 0 5px 16px rgba(255, 122, 0, 0.55);
      }
      .cc-feat-listen-ico {
        font-size: 0.72rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
      }
      .cc-feat-eq {
        display: none;
        align-items: flex-end;
        gap: 2px;
        height: 11px;
        margin-left: 2px;
      }
      .cc-omni-feat-listen-btn.is-playing .cc-feat-eq,
      .cc-omni-stream-bar.is-playing .cc-feat-eq {
        display: inline-flex;
      }
      .cc-feat-eq i {
        display: inline-block;
        width: 2.5px;
        height: 10px;
        border-radius: 2px;
        background: #FFFFFF;
        animation: ccFeatEqBounce 0.85s infinite ease-in-out;
      }
      .cc-feat-eq i:nth-child(2) {
        animation-delay: 0.2s;
        height: 7px;
      }
      .cc-feat-eq i:nth-child(3) {
        animation-delay: 0.4s;
        height: 11px;
      }
      @keyframes ccFeatEqBounce {
        0%, 100% { transform: scaleY(0.35); }
        50% { transform: scaleY(1); }
      }
      .cc-omni-stream-bar {
        display: none;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        padding: 9px 14px;
        margin-bottom: 12px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.18) 0%, rgba(196, 163, 90, 0.16) 100%);
        border: 1px solid rgba(255, 122, 0, 0.5);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      }
      .cc-omni-stream-bar.is-playing {
        display: flex;
      }
      .cc-omni-stream-bar-info {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;
      }
      .cc-omni-stream-bar-tag {
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #FF8C33;
        white-space: nowrap;
      }
      .cc-omni-stream-bar-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: #FFFFFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-stream-bar-actions {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cc-omni-stream-station-btn {
        padding: 4px 9px;
        border-radius: 999px;
        border: 1px solid rgba(196, 163, 90, 0.3);
        background: rgba(12, 16, 28, 0.78);
        color: rgba(243, 229, 200, 0.85);
        font-size: 0.68rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.16s, border-color 0.16s, color 0.16s;
      }
      .cc-omni-stream-station-btn:hover,
      .cc-omni-stream-station-btn.active {
        background: rgba(255, 122, 0, 0.25);
        border-color: #FF7A00;
        color: #FFFFFF;
      }
      .cc-omni-stream-stop-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        background: #FF7A00;
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #FFFFFF;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.16s;
      }
      .cc-omni-stream-stop-btn:hover {
        background: #FF8C33;
      }
      .cc-omni-stream-stop-btn:active {
        background: #E66A00;
      }
      @media (prefers-reduced-motion: reduce) {
        .cc-feat-eq i { animation: none; }
      }
      .cc-omni-feat-arrow {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(196, 163, 90, 0.2);
        color: var(--omni-muted);
        font-size: 0.92rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        transition: transform 0.2s, color 0.2s, background 0.2s, border-color 0.2s;
        flex-shrink: 0;
      }
      .cc-omni-feat-card:hover .cc-omni-feat-arrow {
        transform: translateX(3px);
        color: #fff;
        background: rgba(255, 122, 0, 0.25);
        border-color: #FF7A00;
      }
      .cc-omni-pro-shortcuts {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        justify-content: center;
        align-items: center;
        font-size: 0.76rem;
        color: rgba(243, 229, 200, 0.55);
        margin-top: 6px;
      }
      .cc-omni-pro-shortcuts kbd {
        display: inline-block;
        padding: 2px 6px;
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 600;
        line-height: 1.2;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 4px;
        color: var(--omni-gold);
        margin-right: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      /* Strona startowa: karty, skróty, kontynuacja */
      .cc-omni-home {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        padding: 24px 0 8px;
      }
      .cc-omni-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }
      .cc-omni-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        min-height: 56px;
        background: var(--omni-paper);
        color: var(--omni-paper-ink);
        border: 1px solid rgba(255, 122, 0, 0.4);
        border-radius: 16px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .cc-omni-card:hover, .cc-omni-card:focus-visible {
        border-color: var(--omni-gold);
        box-shadow: 0 6px 20px rgba(255, 122, 0, 0.35);
        outline: none;
      }
      .cc-omni-card-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #fff1e5;
        color: var(--omni-gold-deep);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cc-omni-card b {
        display: block;
        font-size: 0.92rem;
        font-weight: 600;
        line-height: 1.25;
      }
      .cc-omni-card small {
        display: block;
        font-size: 0.78rem;
        color: var(--omni-paper-muted);
      }
      .cc-omni-shortcuts {
        display: grid;
        grid-template-columns: repeat(4, 76px);
        gap: 18px 10px;
        justify-content: center;
      }
      @media (min-width: 641px) {
        .cc-omni-shortcuts { grid-template-columns: repeat(8, 84px); }
      }
      .cc-omni-shortcut {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--omni-ink);
        font-size: 0.78rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
      }
      .cc-omni-shortcut span:first-child {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        color: var(--omni-gold-deep);
        border: 1px solid rgba(255, 122, 0, 0.55);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transition: background-color 0.15s, color 0.15s, transform 0.15s;
      }
      .cc-omni-shortcut:hover span:first-child, .cc-omni-shortcut:focus-visible span:first-child {
        background: var(--omni-gold-hover);
        color: #fff;
        transform: scale(1.05);
      }
      .cc-omni-shortcut:focus-visible { outline: none; }
      button.cc-omni-shortcut { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-size: 0.78rem; font-weight: 500; }
      button.cc-omni-shortcut[aria-expanded="true"] span:first-child { background: var(--omni-gold); color: #fff; }
      .cc-omni-continue[hidden] { display: none; }
      .cc-omni-favs-empty { margin: 0; padding: 16px 18px; font-size: 0.88rem; line-height: 1.5; color: var(--omni-paper-muted); }
      .cc-omni-continue {
        width: 100%;
        background: var(--omni-paper);
        color: var(--omni-paper-ink);
        border-radius: 18px;
        border-top: 4px solid var(--omni-gold);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      .cc-omni-continue-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        background: linear-gradient(90deg, #fbf5e8, #fffdf8);
        border-bottom: 1px solid #efe3c8;
        color: var(--omni-gold-deep);
        font-size: 0.86rem;
        font-weight: 600;
      }
      .cc-omni-continue-list {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
        padding: 14px;
      }
      @media (min-width: 641px) {
        .cc-omni-continue-list { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      }
      .cc-omni-continue-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        min-height: 56px;
        border-radius: 12px;
        background: #fcf8ef;
        border: 1px solid #efe3c8;
        text-decoration: none;
        color: inherit;
        min-width: 0;
        box-sizing: border-box;
      }
      .cc-omni-continue-item:hover, .cc-omni-continue-item:focus-visible {
        border-color: var(--omni-gold);
        outline: none;
      }
      .cc-omni-continue-item > span:first-child {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #1a1712;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .cc-omni-continue-item b {
        display: block;
        font-size: 0.88rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-continue-item small {
        display: block;
        font-size: 0.74rem;
        color: var(--omni-gold-deep);
      }
      .cc-omni-continue-item > span:last-child { min-width: 0; }
      /* Stan wyników: pole u góry, wyniki na ciemnym tle */
      #ccOmniModal.cc-has-query .cc-omni-hero { padding: 70px 0 14px; }
      #ccOmniModal.cc-has-query .cc-omni-brand { width: min(260px, 100%); }
      .cc-omni-filters {
        display: none;
        gap: 4px;
        margin-top: 10px;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        border-bottom: 1px solid var(--omni-line);
      }
      #ccOmniModal.cc-has-query .cc-omni-filters { display: flex; }
      .cc-omni-filters::-webkit-scrollbar { display: none; }
      .cc-omni-filter-chip {
        position: relative;
        padding: 0 12px;
        border: 0;
        background: transparent;
        color: var(--omni-muted);
        font: 500 0.88rem/1 inherit;
        cursor: pointer;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        touch-action: manipulation;
        flex-shrink: 0;
      }
      .cc-omni-filter-chip:hover { color: var(--omni-ink); }
      .cc-omni-filter-chip.active { color: var(--omni-gold); }
      .cc-omni-filter-chip.active::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: var(--omni-gold);
      }
      .cc-omni-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px 0 18px;
      }
      #ccOmniModal.cc-has-query .cc-omni-body {
        margin-top: 12px;
        padding: 16px 20px 18px;
        background: rgba(5, 6, 10, 0.86);
        border: 1px solid var(--omni-line);
        border-radius: 18px;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .cc-omni-guide {
        border: 1px solid var(--omni-line);
        border-radius: 14px;
        padding: 14px 16px;
      }
      .cc-omni-guide-badge {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--omni-gold);
        margin-bottom: 6px;
      }
      .cc-omni-guide-topic {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 6px;
        color: var(--omni-ink);
      }
      .cc-omni-guide-summary {
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--omni-muted);
        margin: 0 0 10px;
      }
      .cc-omni-guide-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-guide-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 14px;
        border-radius: 22px;
        border: 1px solid var(--omni-line);
        color: var(--omni-ink);
        text-decoration: none;
        font-size: 0.84rem;
        font-weight: 500;
        min-height: 44px;
        box-sizing: border-box;
      }
      .cc-omni-guide-pill:hover, .cc-omni-guide-pill:focus-visible {
        border-color: var(--omni-gold);
        color: var(--omni-gold);
      }
      
        /* ── FAZA 2: SPLIT-VIEW (RAYCAST / SPOTLIGHT STYLE) ── */
        .cc-omni-split-layout {
          display: grid;
          grid-template-columns: minmax(320px, 1.15fr) minmax(280px, 0.85fr);
          gap: 20px;
          align-items: start;
          margin-top: 10px;
        }
        .cc-omni-results-col {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cc-omni-preview-pane {
          position: sticky;
          top: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 16px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: calc(100vh - 60px);
          overflow-y: auto;
          scrollbar-width: none !important; /* Firefox: brak paska przewijania */
          -ms-overflow-style: none !important; /* IE / Edge */
        }
        .cc-omni-preview-pane::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari, Edge: całkowite ukrycie paska */
          width: 0 !important;
          height: 0 !important;
        }
        @media (max-width: 860px) {
          .cc-omni-split-layout {
            display: block;
          }
          .cc-omni-preview-pane {
            display: none !important;
          }
        }

        .cc-preview-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cc-preview-placeholder {
          text-align: center;
          padding: 32px 16px;
        }
        .cc-preview-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 190px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cc-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cc-preview-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(11, 15, 26, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--omni-gold);
          backdrop-filter: blur(8px);
        }
        .cc-preview-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--omni-muted);
        }
        .cc-preview-crumb {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cc-preview-title {
          margin: 0;
          font-size: 1.12rem;
          font-weight: 700;
          line-height: 1.35;
          color: #ffffff;
        }
        .cc-preview-desc {
          margin: 0;
          font-size: 0.86rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.82);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cc-preview-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cc-preview-btn-main {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff !important;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          border: 0;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 122, 0, 0.4);
          transition: background 0.15s, transform 0.15s;
          flex: 1;
          min-width: 140px;
          text-align: center;
        }
        .cc-preview-btn-main:hover {
          background: #FF8C33;
          transform: translateY(-1px);
          color: #ffffff !important;
        }
        .cc-preview-btn-main:active {
          background: #E66A00;
          transform: translateY(0);
        }
        .cc-preview-btn-copy, .cc-preview-btn-ext {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cc-preview-btn-copy:hover, .cc-preview-btn-ext:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: #FF7A00;
          color: #FF7A00;
        }

        /* Karta Pisma Świętego (Direct Scripture Snippet) */
        .cc-scripture-card {
          background: linear-gradient(135deg, rgba(196, 163, 90, 0.16) 0%, rgba(11, 15, 26, 0.75) 100%);
          border: 1.5px solid rgba(196, 163, 90, 0.45);
          border-radius: 16px;
          padding: 18px 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cc-scripture-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .cc-scripture-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--omni-gold);
        }
        .cc-scripture-ref {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .cc-scripture-quote {
          margin: 0;
          font-size: 1.08rem;
          line-height: 1.6;
          font-style: italic;
          color: #ffffff;
          border-left: 3px solid #FF7A00;
          padding-left: 14px;
        }
        .cc-scripture-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .cc-btn-scripture-main {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff !important;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(255, 122, 0, 0.35);
          transition: background 0.15s, transform 0.15s;
        }
        .cc-btn-scripture-main:hover {
          background: #FF8C33;
          transform: translateY(-1px);
          color: #ffffff !important;
        }
        .cc-btn-scripture-copy, .cc-btn-scripture-audio {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-btn-scripture-copy:hover, .cc-btn-scripture-audio:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: #FF7A00;
        }

        /* Biblia Intelligence CC — Dodatki do Karty Pisma */
        .cc-scripture-level, .cc-bible-topic-level {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(196, 163, 90, 0.25);
          border: 1px solid rgba(196, 163, 90, 0.5);
          font-size: 0.72rem;
          font-weight: 800;
          color: #F3E5C8;
          letter-spacing: 0.05em;
        }
        .cc-scripture-edition {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
        }
        .cc-scripture-license-note {
          font-size: 0.75rem;
          color: rgba(243, 229, 200, 0.65);
          padding-top: 6px;
          border-top: 1px dashed rgba(196, 163, 90, 0.25);
          line-height: 1.4;
        }
        .cc-btn-scripture-sub {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(196, 163, 90, 0.15);
          border: 1px solid rgba(196, 163, 90, 0.35);
          color: #F3E5C8;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .cc-btn-scripture-sub:hover, .cc-btn-scripture-sub:focus-visible {
          background: rgba(196, 163, 90, 0.28);
          border-color: #C4A35A;
          color: #ffffff;
          outline: none;
        }
        .cc-btn-scripture-sources {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: rgba(243, 229, 200, 0.85);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-btn-scripture-sources:hover, .cc-btn-scripture-sources:focus-visible {
          background: rgba(255, 255, 255, 0.14);
          border-color: #C4A35A;
          color: #ffffff;
        }

/* Karta Odpowiedzi Biblijnej AI & RAG CC (ZERO COST) */
        .cc-rag-answer-card {
          background: linear-gradient(135deg, rgba(196, 163, 90, 0.18) 0%, rgba(10, 14, 23, 0.94) 100%);
          border: 1.5px solid rgba(196, 163, 90, 0.45);
          border-radius: 16px;
          padding: 20px 22px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: ccFadeIn 0.25s ease-out;
        }
        .cc-rag-card-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .cc-rag-badge-group {
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }
        .cc-rag-badge-ai {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(196, 163, 90, 0.2);
          border: 1px solid rgba(196, 163, 90, 0.5);
          color: #E2CC9A;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .cc-rag-badge-standard {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 122, 0, 0.15);
          border: 1px solid rgba(255, 122, 0, 0.4);
          color: #FFB366;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .cc-rag-model-badge {
          font-size: 0.76rem;
          color: rgba(243, 229, 200, 0.7);
          font-family: monospace;
          background: rgba(0, 0, 0, 0.35);
          padding: 3px 8px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cc-rag-question-bar {
          display: flex;
          align-items: baseline;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          font-size: 0.95rem;
          color: #F3E5C8;
        }
        .cc-rag-q-icon {
          font-size: 1.1rem;
        }
        .cc-rag-q-text strong {
          color: #ffffff;
        }
        .cc-rag-answer-content {
          font-size: 1.05rem;
          line-height: 1.65;
          color: #ffffff;
        }
        .cc-rag-p-lead {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #E2CC9A;
        }
        .cc-rag-quote {
          margin: 8px 0 12px 0;
          padding: 10px 16px;
          background: rgba(196, 163, 90, 0.08);
          border-left: 3px solid #FF7A00;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          font-size: 1.06rem;
          line-height: 1.6;
          color: #ffffff;
        }
        .cc-rag-p-secondary {
          margin: 8px 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.98rem;
        }
        .cc-rag-footnote {
          margin: 10px 0 0 0;
          font-size: 0.78rem;
          color: rgba(243, 229, 200, 0.6);
          font-style: italic;
        }
        .cc-rag-cite-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: #FF7A00;
          background: rgba(255, 122, 0, 0.15);
          padding: 1px 5px;
          border-radius: 4px;
          vertical-align: super;
          margin-left: 2px;
        }
        .cc-rag-sources-box {
          margin-top: 4px;
          padding: 12px 14px;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(196, 163, 90, 0.2);
          border-radius: 10px;
        }
        .cc-rag-sources-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--omni-gold);
          margin-bottom: 8px;
        }
        .cc-rag-sources-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cc-rag-source-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          min-height: 38px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 19px;
          color: #F3E5C8;
          text-decoration: none;
          font-size: 0.82rem;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .cc-rag-source-chip:hover {
          background: rgba(196, 163, 90, 0.18);
          border-color: rgba(196, 163, 90, 0.4);
          transform: translateY(-1px);
          color: #ffffff;
        }
        .cc-rag-source-num {
          font-weight: 800;
          color: #FF7A00;
        }
        .cc-rag-source-title {
          font-weight: 600;
        }
        .cc-rag-source-ref {
          font-size: 0.74rem;
          color: rgba(243, 229, 200, 0.65);
          background: rgba(0, 0, 0, 0.25);
          padding: 2px 6px;
          border-radius: 8px;
        }
        .cc-rag-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }
        .cc-btn-rag-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff !important;
          font-size: 0.88rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 122, 0, 0.35);
          transition: background 0.15s, transform 0.15s;
        }
        .cc-btn-rag-copy:hover {
          background: #FF8C33;
          transform: translateY(-1px);
        }
        .cc-btn-rag-copy:active {
          background: #E66A00;
        }
        .cc-btn-rag-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #F3E5C8 !important;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-btn-rag-link:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(196, 163, 90, 0.45);
          color: #ffffff !important;
        }

        /* Karta Tematu Biblijnego (Bible Topic Guide) */
        .cc-bible-topic-card {
          background: linear-gradient(135deg, rgba(196, 163, 90, 0.14) 0%, rgba(11, 15, 26, 0.82) 100%);
          border: 1.5px solid rgba(196, 163, 90, 0.45);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cc-bible-topic-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .cc-bible-topic-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cc-bible-topic-sub {
          font-size: 0.75rem;
          color: var(--omni-gold);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .cc-bible-topic-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: #FF7A00;
          background: rgba(255, 122, 0, 0.12);
          border: 1px solid rgba(255, 122, 0, 0.35);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .cc-bible-topic-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .cc-bible-topic-summary {
          margin: 0;
          font-size: 0.96rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.9);
        }
        .cc-bible-topic-verses {
          background: rgba(0, 0, 0, 0.28);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cc-bible-topic-verses-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--omni-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cc-bible-topic-verse-item {
          font-size: 0.9rem;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.92);
        }
        .cc-bible-topic-ref {
          color: #FF8C33;
          margin-right: 4px;
        }
        .cc-bible-topic-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        /* Karta Lematy i Języka Oryginalnego (Biblia Intelligence CC — P1) */
        .cc-lemma-card {
          background: linear-gradient(135deg, rgba(196, 163, 90, 0.18) 0%, rgba(11, 15, 26, 0.85) 100%);
          border: 1.5px solid rgba(196, 163, 90, 0.55);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cc-lemma-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .cc-lemma-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cc-lemma-level {
          font-size: 0.72rem;
          font-weight: 800;
          color: #F3E5C8;
          letter-spacing: 0.05em;
          background: rgba(196, 163, 90, 0.28);
          border: 1px solid rgba(196, 163, 90, 0.6);
          padding: 2px 8px;
          border-radius: 6px;
        }
        .cc-lemma-lang {
          font-size: 0.78rem;
          color: var(--omni-gold);
          font-weight: 700;
        }
        .cc-lemma-status {
          font-size: 0.72rem;
          font-weight: 700;
          color: #FF7A00;
          background: rgba(255, 122, 0, 0.12);
          border: 1px solid rgba(255, 122, 0, 0.35);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .cc-lemma-word-row {
          display: flex;
          align-items: baseline;
          gap: 16px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cc-lemma-orig {
          font-size: 2.2rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: 0.02em;
        }
        .cc-lemma-orig.cc-rtl, .cc-token-orig.cc-rtl {
          font-family: 'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif;
          direction: rtl;
          unicode-bidi: isolate;
        }
        .cc-lemma-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cc-lemma-translit {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--omni-gold);
        }
        .cc-lemma-pron {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
        }
        .cc-lemma-strong-badge {
          background: #FF7A00;
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(255, 122, 0, 0.3);
        }
        .cc-lemma-disclaimer {
          font-size: 0.76rem;
          line-height: 1.45;
          color: rgba(243, 229, 200, 0.8);
          background: rgba(0, 0, 0, 0.25);
          border-left: 3px solid var(--omni-gold);
          padding: 6px 10px;
          border-radius: 0 6px 6px 0;
        }
        .cc-lemma-morph {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.9);
        }
        .cc-lemma-def {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cc-lemma-def-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--omni-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cc-lemma-def-text {
          margin: 0;
          font-size: 1rem;
          line-height: 1.55;
          color: #ffffff;
        }
        .cc-lemma-occurrences {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);
        }
        .cc-lemma-verse-link {
          color: #FF8C33;
          text-decoration: underline;
          margin: 0 3px;
        }
        .cc-lemma-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        /* Odsyłacze Wersetowe (Cross-References) */
        .cc-scripture-crossrefs {
          background: rgba(0, 0, 0, 0.26);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }
        .cc-scripture-crossrefs-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--omni-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cc-scripture-crossrefs-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cc-crossref-item {
          font-size: 0.88rem;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.92);
        }
        .cc-crossref-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: #FF7A00;
          background: rgba(255, 122, 0, 0.12);
          border: 1px solid rgba(255, 122, 0, 0.3);
          padding: 1px 6px;
          border-radius: 4px;
          margin-right: 6px;
        }
        .cc-crossref-ref {
          color: var(--omni-gold);
          font-weight: 700;
          text-decoration: underline;
          margin-right: 4px;
        }
        .cc-crossref-ref:hover {
          color: #FF8C33;
        }

        /* Pasek Tokenów Języka Oryginalnego (Interlinear) */
        .cc-scripture-tokens-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .cc-scripture-tokens-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--omni-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cc-scripture-tokens-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }
        .cc-token-chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
          min-width: 72px;
          flex-shrink: 0;
          color: #ffffff;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .cc-token-chip:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: #FF7A00;
          transform: translateY(-1px);
        }
        .cc-token-orig {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }
        .cc-token-translit {
          font-size: 0.74rem;
          color: var(--omni-gold);
        }
        .cc-token-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: #FF8C33;
          background: rgba(255, 122, 0, 0.15);
          padding: 1px 5px;
          border-radius: 6px;
        }
        .cc-token-gloss {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.75);
        }

        
        /* Biblia Intelligence CC (P2): Atlas Geograficzny & Miejsca Biblijne */
        .cc-bible-place-card {
          margin: 14px 0;
          padding: 18px 20px;
          border-radius: 14px;
          background: rgba(16, 22, 34, 0.95);
          border: 1px solid rgba(196, 163, 90, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(196, 163, 90, 0.2);
          color: #F3E5C8;
          font-family: inherit;
        }
        .cc-bible-place-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cc-bible-place-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cc-bible-place-level {
          color: #FF7A00;
        }
        .cc-bible-place-sub {
          color: rgba(243, 229, 200, 0.6);
          font-weight: 500;
        }
        .cc-bible-place-certainty {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.35);
          letter-spacing: 0.04em;
        }
        .cc-bible-place-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
        }
        .cc-bible-place-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #C4A35A;
        }
        .cc-bible-place-orig {
          font-family: "SBL Greek", "SBL Hebrew", "Ezra SIL", Georgia, serif;
          font-size: 1.1rem;
          color: #E2CC9A;
        }
        .cc-bible-place-meta-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 0.82rem;
          color: rgba(243, 229, 200, 0.8);
        }
        .cc-bible-place-coords {
          color: #C4A35A;
          text-decoration: none;
          padding: 2px 8px;
          background: rgba(196, 163, 90, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(196, 163, 90, 0.25);
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-bible-place-coords:hover {
          background: rgba(255, 122, 0, 0.15);
          border-color: #FF7A00;
          color: #FF8C33;
        }
        .cc-bible-place-qid {
          font-size: 0.72rem;
          color: rgba(243, 229, 200, 0.5);
          font-family: monospace;
        }
        .cc-bible-place-summary {
          margin: 0 0 14px 0;
          font-size: 0.95rem;
          line-height: 1.55;
          color: rgba(243, 229, 200, 0.92);
        }
        .cc-bible-place-verses {
          margin-bottom: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.35);
          border-left: 3px solid #C4A35A;
        }
        .cc-bible-place-verses-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #C4A35A;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .cc-bible-place-verse-item {
          font-size: 0.86rem;
          line-height: 1.45;
          margin-bottom: 4px;
        }
        .cc-bible-place-verse-item:last-child {
          margin-bottom: 0;
        }
        .cc-bible-place-ref {
          color: #FF8C33;
          margin-right: 4px;
        }
        .cc-bible-place-text {
          font-style: italic;
          color: rgba(243, 229, 200, 0.9);
        }
        .cc-bible-place-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }

        



        /* ── BIBLIA INTELLIGENCE CC (P6): KARTY DZIELENIA SOCIAL MEDIA ── */
        .cc-btn-scripture-share {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 122, 0, 0.14);
          border: 1px solid rgba(255, 122, 0, 0.4);
          color: #FF8C33;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cc-btn-scripture-share:hover {
          background: #FF7A00;
          border-color: #FF7A00;
          color: #ffffff !important;
        }
        .cc-share-card-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000000;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: ccFadeIn 0.2s ease-out;
        }
        .cc-share-card-modal {
          width: 100%;
          max-width: 480px;
          background: rgba(14, 20, 32, 0.98);
          border: 1px solid rgba(196, 163, 90, 0.4);
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          color: #F3E5C8;
          display: flex;
          flex-direction: column;
        }
        .cc-share-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(196, 163, 90, 0.25);
          background: rgba(196, 163, 90, 0.05);
        }
        .cc-share-modal-title {
          font-size: 0.92rem;
          color: #FF8C33;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cc-share-modal-close {
          background: transparent;
          border: 0;
          color: rgba(243, 229, 200, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .cc-share-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .cc-share-modal-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: calc(88vh - 60px);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .cc-share-modal-body::-webkit-scrollbar { display: none; }
        .cc-share-canvas-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .cc-share-verse-canvas {
          max-width: 100%;
          width: 320px;
          height: 320px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .cc-share-card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cc-btn-share-main {
          flex: 1;
          min-width: 180px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          border: 0;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 122, 0, 0.35);
        }
        .cc-btn-share-main:hover {
          background: #FF8C33;
        }
        .cc-btn-share-sub {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .cc-btn-share-sub:hover {
          background: rgba(255, 255, 255, 0.16);
        }
        .cc-share-social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cc-social-share-btn {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 700;
          text-decoration: none;
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: background 0.15s, transform 0.15s;
        }
        .cc-social-share-btn:hover {
          transform: translateY(-1px);
        }
        .cc-share-wa:hover { background: #25D366; border-color: #25D366; color: #fff; }
        .cc-share-tg:hover { background: #229ED9; border-color: #229ED9; color: #fff; }
        .cc-share-fb:hover { background: #1877F2; border-color: #1877F2; color: #fff; }
        .cc-share-x:hover { background: #000000; border-color: #ffffff; color: #fff; }
        .cc-share-lumina:hover { background: #FF7A00; border-color: #FF7A00; color: #fff; }

                /* ── BIBLIA INTELLIGENCE CC (P5): KATALOG TEMATYCZNY & MODLITEWNIK ── */
        .cc-topic-verse-row {
          flex: 1;
        }
        .cc-bible-topic-verse-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          margin-bottom: 6px;
        }
        .cc-btn-topic-verse-audio {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 14px;
          background: rgba(255, 122, 0, 0.12);
          border: 1px solid rgba(255, 122, 0, 0.35);
          color: #FF8C33;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .cc-btn-topic-verse-audio:hover {
          background: #FF7A00;
          color: #ffffff;
        }
        .cc-btn-prayer-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff !important;
          border: 0;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(255, 122, 0, 0.35);
        }
        .cc-btn-prayer-trigger:hover {
          background: #FF8C33;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 122, 0, 0.5);
        }
        .cc-btn-prayer-trigger:active {
          background: #E66A00;
          transform: translateY(0);
        }
        .cc-thematic-prayer-box {
          margin-top: 14px;
          padding: 16px 18px;
          border-radius: 14px;
          background: rgba(10, 16, 28, 0.95);
          border: 1.5px solid rgba(196, 163, 90, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          animation: ccFadeIn 0.25s ease-out;
        }
        .cc-prayer-box-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cc-prayer-box-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #FF8C33;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cc-prayer-box-sub {
          font-size: 0.72rem;
          color: rgba(243, 229, 200, 0.6);
        }
        .cc-prayer-text {
          margin: 0 0 14px 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #ffffff;
          font-style: italic;
          border-left: 3px solid #FF7A00;
          padding-left: 14px;
        }
        .cc-prayer-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cc-btn-prayer-audio {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 20px;
          background: rgba(255, 122, 0, 0.15);
          border: 1px solid rgba(255, 122, 0, 0.4);
          color: #FF8C33;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .cc-btn-prayer-audio:hover {
          background: #FF7A00;
          color: #ffffff;
        }
        .cc-btn-prayer-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #F3E5C8;
          font-size: 0.78rem;
          cursor: pointer;
        }
        .cc-btn-prayer-copy:hover {
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }
        .cc-btn-prayer-intercede {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0 12px;
          border-radius: 20px;
          background: transparent;
          border: 1px solid rgba(196, 163, 90, 0.35);
          color: #C4A35A;
          font-size: 0.78rem;
          text-decoration: none;
        }
        .cc-btn-prayer-intercede:hover {
          background: rgba(196, 163, 90, 0.15);
          color: #ffffff;
        }

                /* ── BIBLIA INTELLIGENCE CC (P4): AUDIO PLAYER & BIBLIA SŁUCHANA ── */
        .cc-scripture-audio-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin: 12px 0 10px 0;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(196, 163, 90, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }
        .cc-audio-bar-left, .cc-audio-bar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        /* Styl przycisku PLAY dla wyników wyszukiwania (JOMA-D052 Orange #FF7A00) */
      .cc-omni-item-play-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        min-height: 44px;
        min-width: 44px;
        padding: 4px 12px;
        border-radius: 9999px;
        background: #FF7A00;
        color: #FFFFFF !important;
        border: none;
        font-family: inherit;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.3px;
        cursor: pointer;
        margin-left: auto;
        box-shadow: 0 2px 8px rgba(255, 122, 0, 0.4);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 2;
      }
      .cc-omni-item-play-btn:hover {
        background: #FF8C33;
        transform: scale(1.05);
        box-shadow: 0 4px 14px rgba(255, 122, 0, 0.6);
      }
      .cc-omni-item-play-btn:active {
        background: #E66A00;
        transform: scale(0.97);
      }
      .cc-omni-item-play-btn.cc-playing {
        background: #22c55e;
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
      }
      .cc-preview-btn-tts {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        min-width: 44px;
        padding: 8px 16px;
        border-radius: 9999px;
        background: #FF7A00;
        color: #FFFFFF !important;
        border: none;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(255, 122, 0, 0.4);
        transition: all 0.2s;
      }
      .cc-preview-btn-tts:hover {
        background: #FF8C33;
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(255, 122, 0, 0.55);
      }
      .cc-preview-btn-tts.cc-playing {
        background: #22c55e;
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
      }
      .cc-btn-play-verse {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 22px;
          background: #FF7A00;
          color: #ffffff !important;
          border: 0;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 12px rgba(255, 122, 0, 0.35);
        }
        .cc-btn-play-verse:hover {
          background: #FF8C33;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 122, 0, 0.5);
        }
        .cc-btn-play-verse:active {
          background: #E66A00;
          transform: translateY(0);
        }
        .cc-btn-play-verse.cc-playing {
          background: #22c55e;
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
        }
        .cc-btn-play-verse.cc-playing:hover {
          background: #16a34a;
        }
        .cc-audio-play-icon {
          font-size: 0.95rem;
          line-height: 1;
        }
        .cc-waveform-visualizer {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          height: 22px;
          padding: 0 4px;
        }
        .cc-wave-bar {
          display: inline-block;
          width: 3.5px;
          height: 6px;
          background: rgba(196, 163, 90, 0.45);
          border-radius: 2px;
          transition: height 0.15s ease, background-color 0.15s;
        }
        .cc-waveform-active .cc-wave-bar {
          background: #FF7A00;
          animation: ccWavePulse 0.9s ease-in-out infinite alternate;
        }
        .cc-waveform-active .cc-wave-1 { animation-delay: 0.0s; height: 16px; }
        .cc-waveform-active .cc-wave-2 { animation-delay: 0.2s; height: 22px; }
        .cc-waveform-active .cc-wave-3 { animation-delay: 0.4s; height: 12px; }
        .cc-waveform-active .cc-wave-4 { animation-delay: 0.1s; height: 18px; }
        .cc-waveform-active .cc-wave-5 { animation-delay: 0.3s; height: 14px; }

        @keyframes ccWavePulse {
          0% { height: 5px; }
          50% { height: 22px; }
          100% { height: 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cc-waveform-active .cc-wave-bar {
            animation: none !important;
            height: 14px !important;
          }
        }
        .cc-audio-status-tag {
          font-size: 0.74rem;
          font-weight: 700;
          color: rgba(243, 229, 200, 0.75);
          letter-spacing: 0.04em;
        }
        .cc-audio-status-tag.cc-tag-playing {
          color: #4ade80;
        }
        .cc-audio-speed-selector {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 2px;
          gap: 2px;
        }
        .cc-speed-btn {
          background: transparent;
          border: 0;
          color: rgba(243, 229, 200, 0.7);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          min-height: 28px;
          min-width: 32px;
          transition: background 0.15s, color 0.15s;
        }
        .cc-speed-btn:hover {
          color: #ffffff;
        }
        .cc-speed-btn.active {
          background: rgba(196, 163, 90, 0.25);
          color: #FF8C33;
          border: 1px solid rgba(196, 163, 90, 0.4);
        }
        .cc-btn-open-player {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-height: 36px;
          padding: 0 12px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #F3E5C8;
          font-size: 0.76rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cc-btn-open-player:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: #FF7A00;
          color: #ffffff;
        }

                /* Biblia Intelligence CC (P3): Porównywarka Wieloprzekładowa i Weryfikacja Cytowań */
        .cc-scripture-compare-panel {
          margin: 14px 0;
          padding: 16px;
          border-radius: 12px;
          background: rgba(8, 12, 20, 0.95);
          border: 1px solid rgba(196, 163, 90, 0.35);
          animation: ccFadeIn 0.2s ease-out;
        }
        .cc-compare-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .cc-compare-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #C4A35A;
          font-size: 0.92rem;
        }
        .cc-compare-sub {
          font-size: 0.72rem;
          color: rgba(243, 229, 200, 0.6);
        }
        .cc-compare-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .cc-compare-col {
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
        }
        .cc-compare-ubg {
          border-color: rgba(196, 163, 90, 0.5);
          background: rgba(196, 163, 90, 0.06);
        }
        .cc-compare-bw {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(56, 189, 248, 0.05);
        }
        .cc-compare-bt {
          border-color: rgba(168, 85, 247, 0.4);
          background: rgba(168, 85, 247, 0.05);
        }
        .cc-compare-bg {
          border-color: rgba(52, 211, 153, 0.4);
          background: rgba(52, 211, 153, 0.05);
        }
        .cc-compare-col-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 8px;
        }
        .cc-badge-trans {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.06em;
        }
        .cc-badge-ubg { background: #C4A35A; color: #000; }
        .cc-badge-bw { background: #38bdf8; color: #000; }
        .cc-badge-bt { background: #c084fc; color: #000; }
        .cc-badge-bg { background: #34d399; color: #000; }
        .cc-compare-edition-name {
          font-size: 0.72rem;
          color: rgba(243, 229, 200, 0.75);
          flex: 1;
          margin-left: 4px;
        }
        .cc-btn-copy-trans {
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 0.68rem;
          cursor: pointer;
        }
        .cc-btn-copy-trans:hover {
          background: #FF7A00;
          border-color: #FF7A00;
        }
        .cc-compare-text {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.92);
          font-style: italic;
        }
        .cc-compare-footer-note {
          font-size: 0.72rem;
          color: rgba(243, 229, 200, 0.6);
          line-height: 1.4;
        }

        /* Weryfikator Cytowań */
        .cc-quote-verification-card {
          margin: 14px 0;
          padding: 18px 20px;
          border-radius: 14px;
          background: rgba(14, 20, 32, 0.96);
          border: 1.5px solid rgba(196, 163, 90, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          color: #F3E5C8;
        }
        .cc-quote-verif-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cc-quote-verif-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .cc-quote-verif-level { color: #C4A35A; }
        .cc-quote-verif-standard { color: rgba(243, 229, 200, 0.6); }
        .cc-quote-status-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }
        .cc-quote-badge-verified {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }
        .cc-quote-badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .cc-quote-badge-paraphrase {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
        .cc-quote-detected-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cc-quote-ref-pill {
          font-size: 0.88rem;
          font-weight: 700;
          color: #FF8C33;
          background: rgba(255, 122, 0, 0.12);
          padding: 2px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 122, 0, 0.3);
        }
        .cc-quote-edition-pill {
          font-size: 0.74rem;
          color: rgba(243, 229, 200, 0.75);
        }
        .cc-quote-canonical-text {
          margin: 0 0 12px 0;
          font-size: 1.05rem;
          line-height: 1.5;
          font-weight: 600;
          color: #ffffff;
          border-left: 3px solid #C4A35A;
          padding-left: 14px;
        }
        .cc-quote-diff-box {
          margin-bottom: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.35);
          border-left: 3px solid #f59e0b;
        }
        .cc-quote-diff-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #fbbf24;
          text-transform: uppercase;
        }
        .cc-quote-diff-text {
          margin: 4px 0 0 0;
          font-size: 0.88rem;
          font-style: italic;
          color: rgba(243, 229, 200, 0.85);
        }
        .cc-quote-verif-note {
          font-size: 0.76rem;
          color: rgba(243, 229, 200, 0.7);
          line-height: 1.45;
          margin-bottom: 14px;
        }
        .cc-quote-verif-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Modal Źródeł i Licencji (R01–R40) */
        .cc-sources-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .cc-sources-modal-backdrop[hidden] {
          display: none !important;
        }
        .cc-sources-modal {
          background: #0B0F1A;
          border: 1.5px solid rgba(196, 163, 90, 0.45);
          border-radius: 18px;
          max-width: 760px;
          width: 100%;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(196, 163, 90, 0.2);
          color: #ffffff;
          overflow: hidden;
        }
        .cc-sources-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }
        .cc-sources-kicker {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--omni-gold);
          text-transform: uppercase;
        }
        .cc-sources-title {
          margin: 4px 0 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
        }
        .cc-sources-close {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-size: 1.1rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-sources-close:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: #FF7A00;
        }
        .cc-sources-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cc-sources-intro {
          margin: 0;
          font-size: 0.92rem;
          line-height: 1.5;
          color: rgba(243, 229, 200, 0.9);
        }
        .cc-sources-table-wrap {
          overflow-x: auto;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cc-sources-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.84rem;
          text-align: left;
        }
        .cc-sources-table th {
          background: rgba(255, 255, 255, 0.06);
          color: var(--omni-gold);
          padding: 10px 12px;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cc-sources-table td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
        }
        .cc-sources-table tr:last-child td {
          border-bottom: none;
        }
        .cc-tag-lic {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .cc-lic-a {
          background: rgba(46, 204, 113, 0.18);
          color: #2ECC71;
          border: 1px solid rgba(46, 204, 113, 0.4);
        }
        .cc-lic-b {
          background: rgba(241, 196, 15, 0.18);
          color: #F1C40F;
          border: 1px solid rgba(241, 196, 15, 0.4);
        }
        .cc-sources-footer-note {
          font-size: 0.84rem;
          color: rgba(243, 229, 200, 0.75);
          margin-top: 4px;
        }
        .cc-sources-doc-link {
          color: #C4A35A;
          font-weight: 700;
          text-decoration: underline;
          margin-left: 4px;
        }
        .cc-sources-doc-link:hover {
          color: #FF7A00;
        }

        /* =========================================================================
           Dedykowane Okno Zmiany Tła Wyszukiwarki (Wallpaper Modal)
           Wybór oficjalnych motywów CC + Własne zdjęcie z dysku / aparatu
           ========================================================================= */
        .cc-wallpaper-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000000;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: ccWallFadeIn 0.2s ease-out;
        }
        @keyframes ccWallFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .cc-wallpaper-modal {
          background: #0B0F1A;
          border: 1.5px solid rgba(196, 163, 90, 0.45);
          border-radius: 20px;
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(196, 163, 90, 0.25);
          color: #ffffff;
          overflow: hidden;
          animation: ccWallSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes ccWallSlideUp {
          from { transform: translateY(16px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .cc-wallpaper-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }
        .cc-wallpaper-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
        }
        .cc-wallpaper-modal-title svg {
          color: var(--omni-gold);
          flex-shrink: 0;
        }
        .cc-wallpaper-modal-close {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-size: 1.25rem;
          line-height: 1;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .cc-wallpaper-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #FF7A00;
        }
        .cc-wallpaper-modal-body {
          padding: 22px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cc-wallpaper-modal-desc {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.45;
          color: rgba(243, 229, 200, 0.85);
        }
        .cc-wallpaper-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 580px) {
          .cc-wallpaper-grid {
            grid-template-columns: 1fr;
          }
        }
        .cc-wall-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
          position: relative;
        }
        .cc-wall-card:hover {
          transform: translateY(-2px);
          border-color: rgba(196, 163, 90, 0.7);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .cc-wall-card.active {
          border-color: #FF7A00;
          box-shadow: 0 0 0 1.5px #FF7A00, 0 10px 28px rgba(255, 122, 0, 0.25);
          background: rgba(255, 122, 0, 0.06);
        }
        .cc-wall-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          overflow: hidden;
        }
        .cc-wall-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s ease;
        }
        .cc-wall-card:hover .cc-wall-thumb {
          transform: scale(1.03);
        }
        .cc-wall-active-pill {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #FF7A00;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .cc-wall-info {
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cc-wall-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
        }
        .cc-wall-tag {
          font-size: 0.76rem;
          color: var(--omni-gold);
        }
        .cc-wall-custom-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
        }
        .cc-wall-upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--omni-gold);
          font-size: 0.84rem;
          font-weight: 600;
          padding: 16px;
        }
        .cc-wallpaper-modal-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          gap: 12px;
        }
        .cc-btn-wall-reset-modal {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(243, 229, 200, 0.8);
          font-size: 0.84rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 20px;
          cursor: pointer;
          min-height: 44px;
          transition: background 0.15s, color 0.15s;
        }
        .cc-btn-wall-reset-modal:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .cc-btn-wall-close-modal {
          background: #FF7A00;
          border: 0;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 22px;
          cursor: pointer;
          min-height: 44px;
          transition: background 0.15s, transform 0.15s;
        }
        .cc-btn-wall-close-modal:hover {
          background: #FF8C33;
          transform: translateY(-1px);
        }
        .cc-btn-wall-close-modal:active {
          background: #E66A00;
        }


        /* Karta Wsparcia & Pomocy Duszpasterskiej (Hope Intent Card) */
        .cc-hope-card {
          background: linear-gradient(135deg, rgba(255, 122, 0, 0.12) 0%, rgba(11, 15, 26, 0.8) 100%);
          border: 1.5px solid rgba(255, 122, 0, 0.4);
          border-radius: 16px;
          padding: 18px 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cc-hope-badge {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #FF8C33;
        }
        .cc-hope-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
        }
        .cc-hope-desc {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
        }
        .cc-hope-verse {
          margin: 2px 0 6px;
          font-size: 0.94rem;
          line-height: 1.5;
          font-style: italic;
          color: var(--omni-gold);
          border-left: 2px solid var(--omni-gold);
          padding-left: 10px;
        }
        .cc-hope-verse cite {
          font-style: normal;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.7);
          display: block;
          margin-top: 2px;
        }
        .cc-hope-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          margin-top: 4px;
        }
        .cc-hope-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #ffffff;
          text-decoration: none;
          min-height: 44px;
          box-sizing: border-box;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .cc-hope-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: #FF7A00;
          transform: translateY(-1px);
          color: #ffffff;
        }
        .cc-hope-btn-icon {
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .cc-hope-btn-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .cc-hope-btn-text strong {
          font-size: 0.88rem;
          color: #ffffff;
        }
        .cc-hope-btn-text small {
          font-size: 0.74rem;
          color: rgba(255, 255, 255, 0.65);
        }

        /* Floating Copy Toast */
        .cc-omni-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: #111827;
          color: #ffffff;
          border: 1px solid #FF7A00;
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          z-index: 100000;
        }
        .cc-omni-toast.cc-show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .cc-omni-results-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cc-omni-item {
        display: block;
        padding: 10px 12px;
        margin: 0 -12px;
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        min-height: 44px;
        box-sizing: border-box;
        transition: background-color 0.12s;
      }
      .cc-omni-item:hover, .cc-omni-item.cc-active {
        background: rgba(196, 163, 90, 0.1);
      }
      .cc-omni-item-source {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
        min-width: 0;
      }
      .cc-omni-item-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .cc-omni-item-site {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.25;
      }
      .cc-omni-item-sitename {
        font-size: 0.86rem;
        color: var(--omni-ink);
      }
      .cc-omni-item-crumb {
        font-size: 0.76rem;
        color: var(--omni-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-item-title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 8px;
      }
      .cc-omni-item-title {
        font-size: 1.12rem;
        font-weight: 400;
        line-height: 1.3;
        color: var(--omni-title);
        margin: 0;
      }
      .cc-omni-item:hover .cc-omni-item-title,
      .cc-omni-item.cc-active .cc-omni-item-title {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .cc-omni-item-badge {
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--omni-gold);
        white-space: nowrap;
      }
      .cc-omni-item-desc {
        font-size: 0.88rem;
        color: var(--omni-muted);
        line-height: 1.5;
        margin: 4px 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .cc-omni-hl {
        background: transparent;
        color: var(--omni-ink);
        font-weight: 700;
      }
      .cc-omni-suggestion-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .cc-omni-suggestion-icon { font-size: 1.1rem; line-height: 1.3; flex-shrink: 0; }
      .cc-omni-suggestion-title { font-size: 0.92rem; font-weight: 600; color: var(--omni-ink); margin-bottom: 2px; }
      .cc-omni-suggestion-desc { font-size: 0.84rem; color: var(--omni-muted); line-height: 1.4; }
      .cc-omni-empty {
        text-align: center;
        padding: 30px 12px;
        color: var(--omni-muted);
      }
      .cc-omni-empty p { margin: 8px 0 16px; font-size: 0.92rem; }
      /* Stopka w naturalnym przepływie na samym dole (L0: centralnie, na dole, bez nachodzenia na elementy) */
      .cc-omni-footer {
        position: relative;
        margin-top: auto;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 36px 0 max(env(safe-area-inset-bottom, 24px), 24px);
        font-size: 0.78rem;
        color: rgba(243, 229, 200, 0.65);
        box-sizing: border-box;
      }
      #ccOmniModal { padding-bottom: 20px; }
      .cc-omni-footer-center {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        font-size: 0.88rem;
        color: rgba(243, 229, 200, 0.75);
        padding: 6px 0;
        line-height: 1.4;
      }
      .cc-omni-yis-link {
        color: #C4A35A;
        font-weight: 600;
        text-decoration: none;
        margin: 0 4px;
        transition: color 0.15s, text-shadow 0.15s;
      }
      .cc-omni-yis-link:hover, .cc-omni-yis-link:focus-visible {
        color: #FF7A00;
        text-shadow: 0 0 10px rgba(255, 122, 0, 0.45);
        outline: none;
      }
      .cc-omni-footer-sub {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 12px;
      }
      .cc-omni-footer-left {
        display: flex;
        align-items: center;
        gap: 4px 10px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .cc-omni-footlink {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 10px;
        border: 0;
        border-radius: 22px;
        background: transparent;
        color: #fff;
        font: 600 0.84rem/1 inherit;
        cursor: pointer;
      }
      .cc-omni-footlink svg { color: var(--omni-gold); }
      .cc-omni-footlink:hover, .cc-omni-footlink:focus-visible { background: rgba(255, 255, 255, 0.1); outline: none; }
      .cc-omni-footlink[hidden] { display: none; }
      .cc-omni-credit { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      @media (max-width: 640px) {
        .cc-omni-credit { display: none; }
        .cc-omni-footer-sub {
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px 12px;
        }
      }
      .cc-omni-footer-hints { display: none; }
      .cc-omni-kbd {
        border: 1px solid var(--omni-line);
        border-radius: 5px;
        padding: 2px 6px;
        font: inherit;
      }
      .cc-omni-footer-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .cc-omni-support-btn {
        color: #FF7A00 !important;
        position: relative;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s, color 0.2s;
      }
      .cc-omni-support-btn:hover, .cc-omni-support-btn:focus-visible {
        color: #FF8C33 !important;
        background: rgba(255, 122, 0, 0.16) !important;
        transform: scale(1.12);
        outline: none;
      }
      .cc-omni-support-btn:active {
        transform: scale(0.94);
      }
      .cc-omni-iconbtn {
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
      }
      .cc-omni-iconbtn:hover, .cc-omni-iconbtn:focus-visible { background: rgba(255, 255, 255, 0.12); color: var(--omni-gold-hover); outline: none; }
      .cc-omni-iconbtn[hidden] { display: none !important; }
      .cc-omni-share-msg { font-size: 0.8rem; color: #fff; white-space: nowrap; }
      .cc-omni-share-msg:empty { display: none; }
      .cc-omni-view-all {
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.84rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 10px;
        border-radius: 22px;
        flex-shrink: 0;
      }
      .cc-omni-view-all svg { color: var(--omni-gold); }
      .cc-omni-view-all:hover, .cc-omni-view-all:focus-visible { background: rgba(255, 255, 255, 0.1); outline: none; }
      /* PLAY/STOP Radia CC w górnej belce (liczy się do /milion przez cc-radio-milion.js) */
      .cc-omni-radio {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border: 0;
        border-radius: 50%;
        padding: 0;
        background: transparent;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.15s, transform 0.15s, color 0.15s;
      }
      .cc-omni-radio:hover, .cc-omni-radio:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        color: var(--omni-gold-hover);
        transform: scale(1.08);
        outline: none;
      }
      .cc-omni-radio:active { transform: scale(0.95); }
      .cc-omni-radio svg {
        width: 22px;
        height: 22px;
        color: inherit;
        flex-shrink: 0;
      }
      .cc-omni-radio .cc-i-stop, .cc-omni-radio[aria-pressed="true"] .cc-i-play { display: none; }
      .cc-omni-radio[aria-pressed="true"] .cc-i-stop { display: block; color: var(--omni-gold-hover); }
      .cc-omni-radio.cc-loading { opacity: 0.6; }
      /* Gwiazdka ulubionych w belce wyszukiwarki: sama ikona, bez kwadratowej ramki (L0 26.10.2026) */
      #ccOmniOverlay .cc-topbar-fav-btn {
        border: 0;
        border-radius: 50%;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
        color: var(--omni-gold);
        margin: 0;
      }
      #ccOmniOverlay .cc-topbar-fav-btn:hover, #ccOmniOverlay .cc-topbar-fav-btn:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        transform: none;
        outline: none;
      }
      #ccOmniOverlay .cc-topbar-fav-btn:hover svg { stroke: var(--omni-gold-hover); }
      #ccOmniOverlay .cc-topbar-fav-btn.is-active { background: transparent; box-shadow: none; }
      #ccOmniOverlay .cc-topbar-fav-btn.is-active svg { fill: var(--omni-gold); stroke: var(--omni-gold); }
      @media (max-width: 440px) {
        .cc-omni-toplink span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cc-omni-toplink { padding: 0; width: 44px; justify-content: center; }
      }
      /* Trzy koła (Wszystko, PLAY, konto) z odstępem, żeby ich poświaty się nie stykały (L0 26.10.2026) */
      .cc-omni-topnav .cc-omni-apps-wrap { margin-left: 10px; }
      .cc-omni-topnav .cc-omni-radio { margin-left: 16px; }
      .cc-omni-topnav .cc-omni-edge-btn { margin-left: 6px; }
      .cc-omni-topnav .cc-omni-account { margin-left: 16px; }
      @media (max-width: 440px) {
        .cc-omni-top { padding-left: 8px !important; padding-right: 8px !important; }
        .cc-omni-topnav a[href="/mess"],
        .cc-omni-topnav a[href="/news"] {
          display: none !important;
        }
        .cc-omni-topnav .cc-omni-apps-wrap { margin-left: 4px; }
        .cc-omni-topnav .cc-omni-radio { margin-left: 6px; }
        .cc-omni-topnav .cc-omni-edge-btn { margin-left: 4px; }
        .cc-omni-topnav .cc-omni-account { margin-left: 6px; }
        .cc-omni-lang-mount .ekocc-lang-switcher { padding: 2px 4px; gap: 3px; }
        .cc-omni-lang-mount .ekocc-lang-btn { min-width: 34px; height: 38px; min-height: 38px; padding: 0 4px; font-size: 0.76rem; }
      }
      @media (max-width: 340px) {
        .cc-omni-top { padding-left: 4px !important; padding-right: 4px !important; }
        .cc-omni-topnav .cc-omni-apps-wrap { margin-left: 2px; }
        .cc-omni-topnav .cc-omni-radio { margin-left: 4px; }
        .cc-omni-topnav .cc-omni-edge-btn { margin-left: 2px; }
        .cc-omni-topnav .cc-omni-account { margin-left: 4px; }
        .cc-omni-lang-mount .ekocc-lang-switcher { padding: 1px 2px; gap: 2px; }
        .cc-omni-lang-mount .ekocc-lang-btn { min-width: 28px; height: 36px; min-height: 36px; padding: 0 2px; font-size: 0.72rem; }
      }
      /* ── FAZA 3: AUTOKOREKTA LITERÓWEK & ERGONOMIA KCIUKA MOBILE ── */
      .cc-omni-autocorrect-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 18px;
        margin: 0 0 16px 0;
        border-radius: 14px;
        background: rgba(196, 163, 90, 0.12);
        border: 1px solid rgba(196, 163, 90, 0.35);
        font-size: 0.94rem;
        color: #F3E5C8;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        animation: ccFadeIn 0.22s ease-out;
      }
      .cc-autocorrect-icon {
        font-size: 1.25rem;
        color: #C4A35A;
        flex-shrink: 0;
      }
      .cc-autocorrect-text {
        flex: 1;
        min-width: 0;
        line-height: 1.45;
      }
      .cc-autocorrect-btn {
        background: transparent;
        border: none;
        padding: 0;
        color: #FF7A00;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s;
      }
      .cc-autocorrect-btn:hover, .cc-autocorrect-btn:focus-visible {
        color: #FF8C33;
      }
      .cc-autocorrect-instead {
        margin-left: 10px;
        color: rgba(243, 229, 200, 0.65);
        font-size: 0.88rem;
      }
      .cc-autocorrect-btn-orig {
        background: transparent;
        border: none;
        padding: 0;
        color: rgba(243, 229, 200, 0.85);
        font: inherit;
        font-style: italic;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .cc-autocorrect-btn-orig:hover, .cc-autocorrect-btn-orig:focus-visible {
        color: #ffffff;
      }
      .cc-scripture-fuzzy-hint {
        font-size: 0.86rem;
        color: #C4A35A;
        background: rgba(196, 163, 90, 0.12);
        padding: 4px 10px;
        border-radius: 8px;
        margin: 4px 0 10px 0;
        display: inline-block;
      }
      .cc-scripture-fuzzy-hint small {
        color: rgba(243, 229, 200, 0.7);
        font-style: italic;
      }

      /* Optymalizacja kciuka i płynnego dotyku na smartfonach */
      #ccOmniModal {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
      }
      .cc-omni-results-col {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
      }
      @media (hover: none) and (pointer: coarse) {
        .cc-omni-item:active {
          background: rgba(196, 163, 90, 0.18);
          transform: scale(0.992);
        }
        .cc-omni-filter-chip {
          padding: 0 14px;
        }
        .cc-omni-field {
          min-height: 52px;
        }
      }

      /* /wyszukiwarka — pełna gotowość do natychmiastowego wyszukiwania (Spotlight/Raycast) */
      /* 2-kolumnowy panel krawędziowy bez paska przewijania (Dyrektywa L0 30.10.2026) */
      dialog.cc-mobile-edge, .cc-mobile-edge, .cc-mobile-edge[data-profile="search"] {
        width: 122px !important; max-width: 90vw !important;
        overflow-y: auto !important; overflow-x: hidden !important;
        scrollbar-width: none !important; -ms-overflow-style: none !important;
      }
      dialog.cc-mobile-edge::-webkit-scrollbar, .cc-mobile-edge::-webkit-scrollbar, .cc-mobile-edge[data-profile="search"]::-webkit-scrollbar {
        display: none !important; width: 0 !important; height: 0 !important;
      }
      dialog.cc-mobile-edge nav, .cc-mobile-edge nav, .cc-mobile-edge[data-profile="search"] nav {
        display: grid !important; grid-template-columns: repeat(2, 44px) !important;
        gap: 6px 8px !important; justify-content: center !important; align-content: start !important;
        min-height: auto !important; width: 100% !important; box-sizing: border-box !important;
        padding: max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)) !important;
      }
      .cc-mobile-edge nav button[data-edge-key="close"] { grid-column: 1 / -1 !important; justify-self: center !important; margin-bottom: 2px !important; }
      .cc-mobile-edge:not([data-profile="lumina"]) nav button[data-edge-key="menu"] { grid-column: 1 / -1 !important; justify-self: center !important; }
      .cc-mobile-edge nav :is(a,button)[data-edge-key="heart"] { color: #FF7A00 !important; }
      .cc-mobile-edge .cc-edge-lang-divider { grid-column: 1 / -1 !important; width: 100% !important; height: 1px !important; background: rgba(196, 163, 90, 0.25) !important; margin: 6px 0 2px 0 !important; }
      .cc-mobile-edge .cc-edge-lang-group { grid-column: 1 / -1 !important; display: flex !important; flex-direction: row !important; justify-content: center !important; flex-wrap: wrap !important; gap: 6px 8px !important; width: 100% !important; }

`;
    document.head.appendChild(style);
  }

  function mountModal() {
    if (document.getElementById('ccOmniOverlay')) return;
    ensureStyles();

    const overlay = document.createElement('div');
    overlay.id = 'ccOmniOverlay';
    if (isStandalonePage) {
      overlay.classList.add('cc-standalone');
    }
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Uniwersalna wyszukiwarka ekosystemu Christian Culture');

    overlay.innerHTML = `
      <div id="ccOmniModal">
        <div class="cc-omni-top">
          <nav class="cc-omni-topnav" aria-label="Szybki dostęp">
            <a class="cc-omni-toplink" href="/mess" aria-label="Czat" title="Czat">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2h6A3.5 3.5 0 0 1 16 5.5v3A3.5 3.5 0 0 1 12.5 12H8l-3.5 3v-3.2A3.5 3.5 0 0 1 3 8.5Z"/><path d="M18 8.2a3.5 3.5 0 0 1 3 3.5v2.8a3.5 3.5 0 0 1-2 3.2V21l-3.4-2.8H12a3.5 3.5 0 0 1-3.2-2h3.7A5.5 5.5 0 0 0 18 10.7Z"/></svg>
            </a>
            <a class="cc-omni-toplink" href="/news" aria-label="Nowości CCN" title="Nowości CCN">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8h3"/><path d="M7 4v14M11 8h5M11 12h5M11 16h5"/></svg>
            </a>
            <div class="cc-omni-apps-wrap">
              <button type="button" id="ccOmniApps" class="cc-omni-toplink cc-omni-apps-btn" aria-label="Wszystko: aplikacje Christian Culture" title="Wszystko — aplikacje Christian Culture" aria-expanded="false" aria-controls="ccOmniAppsMenu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/>
                </svg>
              </button>
              <div id="ccOmniAppsMenu" class="cc-omni-apps" hidden>
                <p class="cc-omni-apps-title">Cały ekosystem Christian Culture</p>
                ${renderAppsGrid()}
              </div>
            </div>
            <button type="button" id="ccOmniRadio" class="cc-omni-toplink cc-omni-radio" aria-pressed="false" aria-label="Słuchaj Radia Christian Culture" title="Radio Christian Culture">
              <svg class="cc-i-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/>
              </svg>
              <svg class="cc-i-stop" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>
              </svg>
            </button>
            <button type="button" id="ccOmniEdgeBtn" class="cc-omni-toplink cc-omni-edge-btn cc-mobile-edge-trigger" data-profile="search" data-edge-key="open" aria-label="Otwórz panel nawigacji EkoCC" aria-haspopup="dialog" aria-controls="cc-mobile-edge-dialog" aria-expanded="false" title="Nawigacja ekosystemu Christian Culture">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <a class="cc-omni-account" id="ccOmniAccount" href="/lumina-login" aria-label="Zaloguj przez Google do LUMINA" title="Twoje konto LUMINA">
              <span class="cc-omni-account-face" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
            </a>
            </nav>
${isStandalonePage ? '' : `
          <button type="button" id="ccOmniClose" class="cc-omni-btn" aria-label="Zamknij wyszukiwarkę" title="Zamknij (Esc)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
`}
        </div>
        <div class="cc-omni-hero"><p class="cc-omni-brand"><img src="/images/search/christian-culture-gold.png" width="1774" height="887" alt="Christian Culture" decoding="async" fetchpriority="high"></p></div>
        <div class="cc-omni-header">
          <div class="cc-omni-field">
          <span class="cc-omni-search-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" id="ccOmniInput" data-i18n-placeholder="search_placeholder" placeholder="Zapytaj Christian Culture…" autocomplete="off" spellcheck="false" aria-label="Wpisz szukane słowo">
          <button type="button" id="ccOmniClear" class="cc-omni-btn" aria-label="Wyczyść zapytanie" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button type="button" id="ccOmniEngine" class="cc-omni-btn cc-omni-engine" aria-pressed="false" aria-label="Szukaj w całym internecie przez Google" title="Przełącz: Christian Culture / Google">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h6a5.1 5.1 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14a6.6 6.6 0 0 1 0-4.2V7H2a11 11 0 0 0 0 10l3.7-3Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4Z"/></svg>
          </button>
          <button type="button" id="ccOmniMic" class="cc-omni-btn" aria-label="Szukaj głosem" hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3"></rect>
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
            </svg>
          </button>
          </div>
        </div>

        <div class="cc-omni-filters">
          <button type="button" class="cc-omni-filter-chip active" data-filter="all">Wszystko</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="modules">Moduły</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="bible">Słowo i rozważania</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="radio">Radio</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="vod">Wideo</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="news">CCN</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="community">Społeczność</button>
        </div>

        <div class="cc-omni-body" id="ccOmniBody">
          <!-- Renderowane dynamicznie -->
        </div>

        <div class="cc-omni-footer">
          <div class="cc-omni-footer-sub">
            <div class="cc-omni-footer-left">
              <button type="button" id="ccOmniSourcesBtn" class="cc-omni-iconbtn" aria-label="Rejestr źródeł i licencji Biblia Intelligence (R01–R40)" title="Źródła i licencje">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
              </button>
              <button type="button" id="ccOmniWallBtn" class="cc-omni-iconbtn" aria-label="Zmień tło wyszukiwarki" title="Zmień tło wyszukiwarki (wybierz motyw lub wgraj własne zdjęcie)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>
              </button>
              <input type="file" id="ccOmniWallFile" accept="image/*" hidden>
            </div>
            <div class="cc-omni-footer-right">
              <span id="ccOmniShareMsg" class="cc-omni-share-msg" role="status" aria-live="polite"></span>
              <a href="https://polskieradio.cc/wspieraj" id="ccOmniSupport" class="cc-omni-iconbtn cc-omni-support-btn" aria-label="Wspieram To — Wolne Media Boże" title="Wspieram To">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>
              </a>
              <button type="button" id="ccOmniShare" class="cc-omni-iconbtn" aria-label="Udostępnij wyszukiwarkę Christian Culture" title="Udostępnij">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
              </button>
              <a href="/#contact-section" id="ccOmniContact" class="cc-omni-iconbtn" aria-label="Kontakt" title="Kontakt">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              </a>
            </div>
          </div>
          <div class="cc-omni-footer-center">
            Powered by <a href="https://polskieradio.cc/yis" class="cc-omni-yis-link" target="_blank" rel="noopener noreferrer">Your Imagination Studio</a> dla Christian Culture
          </div>
        </div>
        <!-- Modal Rejestru Źródeł i Licencji (R01–R40) -->
        <div class="cc-sources-modal-backdrop" id="ccOmniSourcesModal" hidden>
          <div class="cc-sources-modal" role="dialog" aria-modal="true" aria-labelledby="ccSourcesTitle">
            <div class="cc-sources-modal-head">
              <div>
                <div class="cc-sources-kicker">BIBLIA INTELLIGENCE CC • ZERO COST FIRST</div>
                <h2 id="ccSourcesTitle" class="cc-sources-title">Rejestr Źródeł i Licencji (R01–R40)</h2>
              </div>
              <button type="button" class="cc-sources-close" id="ccSourcesClose" aria-label="Zamknij panel źródeł">✕</button>
            </div>
            <div class="cc-sources-modal-body">
              <p class="cc-sources-intro">
                Biblia Intelligence CC działa w standardzie <strong>ZERO COST FIRST</strong>, w oparciu o legalne, zweryfikowane korpusy otwarte oraz domeny publiczne. Żadne treści Pisma Świętego nie są generowane przez komercyjne modele AI.
              </p>
              <div class="cc-sources-table-wrap">
                <table class="cc-sources-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Źródło / Korpus</th>
                      <th>Zastosowanie</th>
                      <th>Status / Licencja</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>R01</strong></td>
                      <td><strong>STEPBible Data</strong> (Tyndale House Cambridge)</td>
                      <td>Hebrajski, greka, morfologia, lematy, kody Stronga</td>
                      <td><span class="cc-tag-lic cc-lic-a">CC BY 4.0 (A)</span></td>
                    </tr>
                    <tr>
                      <td><strong>R02</strong></td>
                      <td><strong>SBL Greek New Testament</strong> (Faithlife / SBL)</td>
                      <td>Kanoniczny tekst grecki Nowego Testamentu</td>
                      <td><span class="cc-tag-lic cc-lic-a">CC BY 4.0 (A)</span></td>
                    </tr>
                    <tr>
                      <td><strong>R08</strong></td>
                      <td><strong>Biblica Słowo Życia PL</strong> (eBible)</td>
                      <td>Współczesny polski Nowy Testament</td>
                      <td><span class="cc-tag-lic cc-lic-b">CC BY-SA 4.0 (B)</span></td>
                    </tr>
                    <tr>
                      <td><strong>R11/R12</strong></td>
                      <td><strong>Crossreferences.org &amp; OpenBible</strong></td>
                      <td>340 000 odsyłaczy biblijnych i fraz paralelnych</td>
                      <td><span class="cc-tag-lic cc-lic-a">CC BY 4.0 (A)</span></td>
                    </tr>
                    <tr>
                      <td><strong>R37</strong></td>
                      <td><strong>Polska Biblia Gdańska (1632/1881)</strong></td>
                      <td>Klasyczny tekst reformacyjny w języku polskim</td>
                      <td><span class="cc-tag-lic cc-lic-a">Domena Publiczna (A)</span></td>
                    </tr>
                    <tr>
                      <td><strong>R40</strong></td>
                      <td><strong>Archiwa i Produkcje Christian Culture</strong></td>
                      <td>Apokalipsa SDS, Akademia Biblijna, Biblia Audio</td>
                      <td><span class="cc-tag-lic cc-lic-a">Autorskie CC (A)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="cc-sources-footer-note">
                Pełna specyfikacja 40 źródeł, aparatu krytycznego i polityki praw autorskich:
                <a href="https://github.com/PolskieRadioChristianCulture/Strona-www-Christian-Culture/blob/main/docs/bible-intelligence/SOURCE_REGISTER.md" target="_blank" rel="noopener noreferrer" class="cc-sources-doc-link">
                  docs/bible-intelligence/SOURCE_REGISTER.md ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    // The shared favorites script mounts asynchronously; keep the requested order.
    const topnav = overlay.querySelector('.cc-omni-topnav');
    const placeFavorite = () => {
      const favorite = topnav.querySelector('#ccTopBarFavBtn');
      const apps = topnav.querySelector('.cc-omni-apps-wrap');
      if (favorite && apps) {
        favoriteObserver.disconnect();
        topnav.insertBefore(favorite, apps);
      }
    };
    const favoriteObserver = new MutationObserver(placeFavorite);
    favoriteObserver.observe(topnav, { childList: true });
    placeFavorite();

    // EkoCC i18n Core — integracja językowa modala wyszukiwarki
    const mountI18n = () => {
      if (window.EkoCCI18n) {
        const langMount = overlay.querySelector('.cc-omni-lang-mount');
        if (langMount && !langMount.hasChildNodes()) {
          window.EkoCCI18n.renderSwitcher(langMount);
        }
        if (input) {
          input.placeholder = window.EkoCCI18n.t('search_placeholder');
          input.setAttribute('aria-label', window.EkoCCI18n.t('search_label'));
        }
      }
    };
    mountI18n();
    document.addEventListener('ekocc:locale-changed', () => mountI18n());

    // Zdarzenia wewnątrz modala
    const input = document.getElementById('ccOmniInput');
    const clearBtn = document.getElementById('ccOmniClear');
    startPlaceholderRotation(input);
    const closeBtn = document.getElementById('ccOmniClose');
    const filterChips = overlay.querySelectorAll('.cc-omni-filter-chip');

    overlay.addEventListener('click', (e) => {
      const featListenBtn = e.target.closest('.cc-omni-feat-listen-btn');
      if (featListenBtn) {
        e.preventDefault();
        e.stopPropagation();
        const stationId = featListenBtn.getAttribute('data-feat-stream') || 'poland';
        const streamTitle = featListenBtn.getAttribute('data-feat-stream-title') || '';
        toggleFeaturedStream(stationId, streamTitle, featListenBtn);
        return;
      }
      const streamStopBtn = e.target.closest('[data-feat-stream-stop]');
      if (streamStopBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (window.CCChatRadio && window.CCChatRadio.state().playing) {
          window.CCChatRadio.pause();
        }
        return;
      }
      const streamSwitchBtn = e.target.closest('[data-feat-station-switch]');
      if (streamSwitchBtn) {
        e.preventDefault();
        e.stopPropagation();
        const stId = streamSwitchBtn.getAttribute('data-feat-station-switch') || 'poland';
        const stLabel = streamSwitchBtn.getAttribute('data-feat-station-label') || '';
        toggleFeaturedStream(stId, stLabel, streamSwitchBtn, true);
        return;
      }
      const featTrigger = e.target.closest('.cc-omni-feat-dot, .cc-omni-feat-mode-btn');
      if (featTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const setIdx = parseInt(featTrigger.getAttribute('data-feat-set'), 10);
        if (!isNaN(setIdx)) {
          rotateFeaturedCards(setIdx);
          startFeaturedRotation();
        }
        return;
      }
      const featNav = e.target.closest('.cc-omni-feat-nav');
      if (featNav) {
        e.preventDefault();
        e.stopPropagation();
        const dir = featNav.getAttribute('data-feat-nav');
        const totalSets = FEATURED_MODES.length;
        const nextIdx = dir === 'prev'
          ? (activeFeaturedSet - 1 + totalSets) % totalSets
          : (activeFeaturedSet + 1) % totalSets;
        rotateFeaturedCards(nextIdx);
        startFeaturedRotation();
        return;
      }
      // Na /wyszukiwarka kliknięcie w tapetę odsłania panele, nie zamyka strony
      if (e.target === overlay && !isStandalonePage) closeSearch();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    // Udostępnij wyszukiwarkę: systemowe okno udostępniania (telefon) albo skopiowanie linku (komputer)
    const shareBtn = document.getElementById('ccOmniShare');
    const shareMsg = document.getElementById('ccOmniShareMsg');
    const SHARE_URL = 'https://polskieradio.cc/wyszukiwarka';
    let shareTimer = 0;
    const flashShare = (text) => {
      shareMsg.textContent = text;
      clearTimeout(shareTimer);
      shareTimer = setTimeout(() => { shareMsg.textContent = ''; }, 2600);
    };
    shareBtn.addEventListener('click', async () => {
      const data = { title: 'Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska', text: 'Globalna Wyszukiwarka Chrześcijańska — Słowo Boże, rozważania, radio, kanały i LUMINA:', url: SHARE_URL };
      if (navigator.share) {
        try { await navigator.share(data); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(SHARE_URL);
        flashShare('Skopiowano link');
      } catch (_) {
        window.prompt('Skopiuj link do wyszukiwarki:', SHARE_URL);
      }
    });

    // Obsługa tapety: oficjalne motywy CC + własna tapeta użytkownika (localStorage)
    const wallBtn = document.getElementById('ccOmniWallBtn');
    const wallLabel = document.getElementById('ccOmniWallLabel');
    const wallUpload = document.getElementById('ccOmniWallUpload');
    const wallReset = document.getElementById('ccOmniWallReset');
    const wallFile = document.getElementById('ccOmniWallFile');
    const credit = document.getElementById('ccOmniCredit');

    currentWallId = 'polska-radio';

    const applyWall = (wallVal) => {
      const preset = PRESET_WALLS.find(p => p.id === wallVal);
      if (preset) {
        currentWallId = preset.id;
        overlay.style.backgroundImage = `url("${preset.desktop}")`;
        if (credit) credit.textContent = preset.credit;
        if (wallLabel) wallLabel.textContent = `Tło: ${preset.name}`;
        if (wallBtn) {
          wallBtn.title = `Zmień tło wyszukiwarki (aktualne: ${preset.name})`;
          wallBtn.setAttribute('aria-label', `Zmień tło wyszukiwarki (aktualne: ${preset.name})`);
        }
        if (wallReset) wallReset.hidden = (preset.id === 'polska-radio');
      } else if (!wallVal) {
        currentWallId = 'polska-radio';
        overlay.style.backgroundImage = `url("${PRESET_WALLS[0].desktop}")`;
        if (credit) credit.textContent = PRESET_WALLS[0].credit;
        if (wallLabel) wallLabel.textContent = `Tło: ${PRESET_WALLS[0].name}`;
        if (wallBtn) {
          wallBtn.title = `Galeria teł (aktualne: ${PRESET_WALLS[0].name})`;
          wallBtn.setAttribute('aria-label', `Wybierz tło wyszukiwarki (aktualne: ${PRESET_WALLS[0].name})`);
        }
        if (wallReset) wallReset.hidden = true;
      } else {
        currentWallId = 'custom';
        overlay.style.backgroundImage = `url("${wallVal}")`;
        if (credit) credit.textContent = 'Tło: Twoja tapeta';
        if (wallLabel) wallLabel.textContent = 'Tło: Własna';
        if (wallBtn) {
          wallBtn.title = 'Galeria teł (aktualne: Twoja tapeta)';
          wallBtn.setAttribute('aria-label', 'Wybierz tło wyszukiwarki (aktualne: Twoja tapeta)');
        }
        if (wallReset) wallReset.hidden = false;
      }
    };
    applyWallGlobal = (v) => applyWall(v);

    try {
      const saved = localStorage.getItem(WALL_KEY);
      applyWall(saved);
    } catch (_) {
      applyWall('polska-radio');
    }

    if (wallBtn) {
      wallBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openWallpaperModal();
      });
    }

    if (wallUpload) {
      wallUpload.addEventListener('click', () => {
        if (wallFile) wallFile.click();
      });
    }

    if (wallReset) {
      wallReset.addEventListener('click', () => {
        try { localStorage.removeItem(WALL_KEY); } catch (_) {}
        applyWall('polska-radio');
      });
    }
    wallFile.addEventListener('change', () => {
      const file = wallFile.files && wallFile.files[0];
      wallFile.value = '';
      if (!file || !/^image\//.test(file.type)) return;
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(src);
        // Kilka prób: coraz mniejszy obraz, aż zmieści się w pamięci przeglądarki
        for (const [side, quality] of [[1920, 0.82], [1440, 0.75], [1024, 0.7]]) {
          const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          try {
            localStorage.setItem(WALL_KEY, dataUrl);
            applyWall(dataUrl);
            renderWallpaperGrid();
            return;
          } catch (_) {}
        }
        applyWall(canvas2Url(img)); // pamięć pełna: tapeta tylko do zamknięcia strony
      };
      img.onerror = () => URL.revokeObjectURL(src);
      img.src = src;
    });
    function canvas2Url(img) {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7);
    }

    // PLAY/STOP Radia CC: wspólny odtwarzacz ekosystemu (cc-chat-radio.js); start liczy się do /milion (cc-radio-milion.js)
    // Przycisk + obok PLAY otwierający panel krawędziowy EkoCC (L0 29.10.2026)
    // Usuniecie ewentualnego zduplikowanego pierwszego przycisku + (L0 29.10.2026)
    overlay.querySelectorAll('.cc-omni-topnav .cc-mobile-edge-trigger:not(#ccOmniEdgeBtn)').forEach(d => d.remove());

    const edgeBtn = document.getElementById('ccOmniEdgeBtn');
    if (edgeBtn) {
      edgeBtn.addEventListener('click', (e) => {
        const dialog = document.getElementById('cc-mobile-edge-dialog');
        if (dialog) {
          dialog.dataset.profile = 'search';
          const nav = dialog.querySelector('nav');
          if (nav && !nav.querySelector('[data-edge-key="heart"]')) {
            const heartLink = document.createElement('a');
            heartLink.href = '/wspieraj';
            heartLink.dataset.edgeKey = 'heart';
            heartLink.setAttribute('aria-label', 'Wspieram To — Wolne Media Boże');
            heartLink.title = 'Wspieram To — Wolne Media Boże';
            heartLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"></path></svg>';
            const searchLink = nav.querySelector('[data-edge-key="search"]');
            if (searchLink && searchLink.nextSibling) nav.insertBefore(heartLink, searchLink.nextSibling);
            else nav.appendChild(heartLink);
          }
          if (!dialog.open && typeof dialog.showModal === 'function') {
            e.stopPropagation();
            dialog.showModal();
            document.body.style.overflow = 'hidden';
            edgeBtn.setAttribute('aria-expanded', 'true');
          }
        }
      });
    }

    const radioBtn = document.getElementById('ccOmniRadio');
    radioBtn.addEventListener('click', async () => {
      radioBtn.classList.add('cc-loading');
      try {
        const radio = await ensureOmniRadio();
        if (radio.state().playing) {
          radio.pause();
        } else {
          const id = radio.state().stationId || 'poland';
          await radio.prepare(id);
          radio.select(id);
          await radio.play();
        }
      } catch (_) {
        radioBtn.setAttribute('aria-label', 'Radio chwilowo niedostępne — spróbuj ponownie');
        omniRadioReady = null;
      } finally {
        radioBtn.classList.remove('cc-loading');
      }
    });
    // Jeśli radio już gra na tej stronie, przycisk od razu pokazuje STOP
    if (window.CCChatRadio) ensureOmniRadio();

    // Przełącznik G: Christian Culture ↔ Google (cały internet)
    const engineBtn = document.getElementById('ccOmniEngine');
    const field = overlay.querySelector('.cc-omni-field');
    const applyEngine = () => {
      const g = searchEngine === 'google';
      engineBtn.setAttribute('aria-pressed', String(g));
      engineBtn.setAttribute('aria-label', g ? 'Wróć do wyszukiwania w Christian Culture' : 'Szukaj w całym internecie przez Google');
      field.classList.toggle('cc-engine-google', g);
      if (g) {
        input.placeholder = 'Szukaj w Google…';
      } else {
        input.placeholder = PLACEHOLDERS[0];
        startPlaceholderRotation(input);
      }
    };
    applyEngine();
    engineBtn.addEventListener('click', () => {
      searchEngine = searchEngine === 'google' ? 'cc' : 'google';
      try { localStorage.setItem(ENGINE_KEY, searchEngine); } catch (_) {}
      applyEngine();
      renderResults(input.value, activeFilter);
      input.focus();
    });

    // Obsługa Modalu Źródeł i Licencji Biblia Intelligence CC
    const sourcesModal = document.getElementById('ccOmniSourcesModal');
    const sourcesClose = document.getElementById('ccSourcesClose');
    const openSourcesModal = () => {
      if (sourcesModal) {
        sourcesModal.hidden = false;
        if (sourcesClose) sourcesClose.focus();
      }
    };
    const closeSourcesModal = () => {
      if (sourcesModal) sourcesModal.hidden = true;
    };
    if (sourcesClose) sourcesClose.addEventListener('click', closeSourcesModal);
    if (sourcesModal) {
      sourcesModal.addEventListener('click', (e) => {
        if (e.target === sourcesModal) closeSourcesModal();
      });
    }
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-sources="true"]') || e.target.closest('#ccOmniSourcesBtn')) {
        e.preventDefault();
        e.stopPropagation();
        openSourcesModal();
      }
    });

        // Skrót „Ulubione” rozwija listę ulubionych pod skrótami
    overlay.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-omni-action="favorites"]');
      if (!favBtn) return;
      const section = document.getElementById('ccOmniFavs');
      if (!section) return;
      section.hidden = !section.hidden;
      favBtn.setAttribute('aria-expanded', String(!section.hidden));
      if (!section.hidden) section.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // „Wszystko”: menu aplikacji ekosystemu
    const appsBtn = document.getElementById('ccOmniApps');
    const appsMenu = document.getElementById('ccOmniAppsMenu');
    const setApps = (open) => { appsMenu.hidden = !open; appsBtn.setAttribute('aria-expanded', String(open)); };
    appsBtn.addEventListener('click', (e) => { e.stopPropagation(); setApps(appsMenu.hidden); });
    overlay.addEventListener('click', (e) => { if (!appsMenu.hidden && !e.target.closest('.cc-omni-apps-wrap')) setApps(false); });
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !appsMenu.hidden) { e.stopPropagation(); setApps(false); appsBtn.focus(); } }, true);

    // Logowanie Google — LUMINA: zalogowany widzi swój inicjał/zdjęcie, niezalogowany loguje się przez Google
    const account = document.getElementById('ccOmniAccount');
    let session = null;
    try {
      if (localStorage.getItem('lumina_user_session') === 'active') {
        const user = JSON.parse(localStorage.getItem('lumina_current_user') || 'null');
        if (user && (user.uid || user.email)) session = user;
      }
    } catch (_) {}
    if (session) {
      const name = session.displayName || (session.email ? session.email.split('@')[0] : 'LUMINA');
      account.href = '/lumina';
      account.setAttribute('aria-label', 'Twoje konto LUMINA: ' + name);
      if (session.photoURL && /^https:\/\//.test(session.photoURL)) {
        const img = document.createElement('img');
        img.src = session.photoURL;
        img.alt = '';
        img.referrerPolicy = 'no-referrer';
        account.replaceChildren(img);
      } else {
        account.querySelector('.cc-omni-account-face').textContent = name.trim().charAt(0).toUpperCase() || 'C';
      }
    } else {
      account.addEventListener('click', (e) => {
        if (typeof window.ccLoginWithGoogle === 'function') {
          e.preventDefault();
          window.ccLoginWithGoogle(location.pathname + location.search);
        }
      });
    }


    // Faza 2: Obsługa kopiowania linku / wersetu oraz hoveru na wynikach dla Split-View
    overlay.addEventListener('click', (e) => {
      // Obsługa otwierania generatora kart / udostępniania (P6)
      const shareCardBtn = e.target.closest('[data-action="open-share-card"]');
      if (shareCardBtn) {
        e.preventDefault();
        e.stopPropagation();
        const verseText = shareCardBtn.getAttribute('data-verse') || '';
        const refTitle = shareCardBtn.getAttribute('data-ref') || '';
        openShareModal(verseText, refTitle);
        return;
      }

      // Kopiowanie odpowiedzi RAG (Etap 5)
      const copyRagBtn = e.target.closest('[data-action="copy-rag-answer"]');
      if (copyRagBtn) {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = copyRagBtn.getAttribute('data-answer');
        if (textToCopy && navigator.clipboard) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const span = copyRagBtn.querySelector('span');
            if (span) {
              const orig = span.textContent;
              span.textContent = 'Skopiowano odpowiedź!';
              setTimeout(() => { span.textContent = orig; }, 1800);
            }
          }).catch(() => {});
        }
        return;
      }

      // Obsługa otwierania modlitewnika tematycznego (P5)
      const prayerTrigger = e.target.closest('[data-action="toggle-prayer"]');
      if (prayerTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = prayerTrigger.getAttribute('data-target');
        const box = document.getElementById(targetId);
        if (box) {
          const isOpen = box.style.display !== 'none';
          box.style.display = isOpen ? 'none' : 'block';
          prayerTrigger.setAttribute('aria-expanded', String(!isOpen));
          if (!isOpen) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        return;
      }

      // Kopiowanie modlitwy (P5)
      const copyPrayerBtn = e.target.closest('[data-action="copy-prayer"]');
      if (copyPrayerBtn) {
        e.preventDefault();
        e.stopPropagation();
        const prayerToCopy = copyPrayerBtn.getAttribute('data-prayer');
        if (prayerToCopy && navigator.clipboard) {
          navigator.clipboard.writeText(prayerToCopy).then(() => {
            const span = copyPrayerBtn.querySelector('span');
            if (span) {
              const orig = span.textContent;
              span.textContent = 'Skopiowano modlitwę!';
              setTimeout(() => { span.textContent = orig; }, 1600);
            }
          }).catch(() => {});
        }
        return;
      }

      // Obsługa odtwarzania audio wersetu / cytatu (P4)
      const playVerseBtn = e.target.closest('[data-action="toggle-audio"]');
      if (playVerseBtn) {
        e.preventDefault();
        e.stopPropagation();
        const verseText = playVerseBtn.getAttribute('data-verse') || '';
        const refTitle = playVerseBtn.getAttribute('data-ref') || '';
        toggleBibleAudio(verseText, refTitle);
        return;
      }

      // Wybór prędkości lektora (P4)
      const speedBtn = e.target.closest('.cc-speed-btn');
      if (speedBtn) {
        e.preventDefault();
        e.stopPropagation();
        const speed = parseFloat(speedBtn.getAttribute('data-speed')) || 1.0;
        currentAudioSpeed = speed;
        document.querySelectorAll('.cc-speed-btn').forEach(b => b.classList.remove('active'));
        speedBtn.classList.add('active');
        if (currentAudioState === 'playing' && currentAudioUtterance) {
          const vText = currentAudioUtterance.text;
          playBibleAudio(vText, '', speed);
        }
        return;
      }

      const compareTrigger = e.target.closest('[data-action="toggle-compare"]');
      if (compareTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const refKey = compareTrigger.getAttribute('data-ref') || '';
        const idSafe = 'ccComparePanel_' + refKey.replace(/[^a-zA-Z0-9]/g, '_');
        const panel = document.getElementById(idSafe) || compareTrigger.closest('.cc-scripture-card, .cc-quote-verification-card')?.querySelector('.cc-scripture-compare-panel');
        if (panel) {
          const isOpen = panel.style.display !== 'none';
          panel.style.display = isOpen ? 'none' : 'block';
          compareTrigger.setAttribute('aria-expanded', String(!isOpen));
          if (!isOpen) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        return;
      }

      const copyTransBtn = e.target.closest('.cc-btn-copy-trans');
      if (copyTransBtn) {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = copyTransBtn.getAttribute('data-copy');
        if (textToCopy && navigator.clipboard) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const orig = copyTransBtn.textContent;
            copyTransBtn.textContent = 'Skopiowano!';
            setTimeout(() => { copyTransBtn.textContent = orig; }, 1600);
          }).catch(() => {});
        }
        return;
      }

      const quoteCopyBtn = e.target.closest('#ccQuoteCopyCanonicalBtn');
      if (quoteCopyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const qText = quoteCopyBtn.getAttribute('data-quote');
        if (qText && navigator.clipboard) {
          navigator.clipboard.writeText(qText).then(() => {
            const span = quoteCopyBtn.querySelector('span');
            if (span) {
              const orig = span.textContent;
              span.textContent = 'Skopiowano do schowka!';
              setTimeout(() => { span.textContent = orig; }, 1800);
            }
          }).catch(() => {});
        }
        return;
      }

      const tokenChip = e.target.closest('.cc-token-chip');
      if (tokenChip) {
        e.preventDefault();
        e.stopPropagation();
        const strong = tokenChip.getAttribute('data-strong');
        if (strong) {
          input.value = strong;
          clearBtn.style.display = 'inline-flex';
          renderResults(strong, activeFilter);
          if (isStandalonePage) {
            history.replaceState(null, '', '/wyszukiwarka?q=' + encodeURIComponent(strong));
          }
          input.focus();
        }
        return;
      }

            const autoBtn = e.target.closest('.cc-autocorrect-btn, .cc-autocorrect-btn-orig');
      if (autoBtn) {
        e.preventDefault();
        e.stopPropagation();
        const q = autoBtn.getAttribute('data-query');
        if (q) {
          input.value = q;
          clearBtn.style.display = 'inline-flex';
          renderResults(q, activeFilter);
          if (isStandalonePage) {
            history.replaceState(null, '', '/wyszukiwarka?q=' + encodeURIComponent(q));
          }
          input.focus();
        }
        return;
      }

      const copyBtn = e.target.closest('.cc-preview-btn-copy');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const copyUrl = copyBtn.getAttribute('data-copy-url');
        if (copyUrl) {
          const fullUrl = copyUrl.startsWith('http') ? copyUrl : (location.origin + copyUrl);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullUrl).then(() => {
              showCopyToast('Skopiowano link do schowka!');
            }).catch(() => {
              showCopyToast('Skopiowano: ' + fullUrl);
            });
          } else {
            showCopyToast('Skopiowano: ' + fullUrl);
          }
        }
        return;
      }

      const scriptCopyBtn = e.target.closest('.cc-btn-scripture-copy');
      if (scriptCopyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const quote = scriptCopyBtn.getAttribute('data-quote') || '';
        if (quote) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(quote).then(() => {
              showCopyToast('Werset skopiowany do schowka!');
            }).catch(() => {
              showCopyToast(quote);
            });
          } else {
            showCopyToast(quote);
          }
        }
        return;
      }
    });

    overlay.addEventListener('mouseover', (e) => {
      if (e.target.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = true;
      }
      const it = e.target.closest('.cc-omni-item');
      if (!it) return;
      const allItems = Array.from(overlay.querySelectorAll('.cc-omni-item'));
      const idx = allItems.indexOf(it);
      if (idx >= 0 && idx !== activeIndex) {
        activeIndex = idx;
        allItems.forEach((el, i) => el.classList.toggle('cc-active', i === activeIndex));
        if (currentResults && currentResults[activeIndex]) {
          renderPreviewPane(currentResults[activeIndex]);
        }
      }
    });

        overlay.addEventListener('mouseout', (e) => {
      if (e.target.closest('.cc-omni-featured-section') && !e.relatedTarget?.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = false;
      }
    });

    overlay.addEventListener('touchstart', (e) => {
      if (e.target.closest('.cc-omni-featured-section')) {
        isFeaturedHovered = true;
        setTimeout(() => { isFeaturedHovered = false; }, 4000);
      }
    }, { passive: true });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      renderResults('', activeFilter);
      input.focus();
      startPlaceholderRotation(input);
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      clearBtn.style.display = val ? 'inline-flex' : 'none';
      renderResults(val, activeFilter);
      if (isStandalonePage) {
        const q = val.trim();
        history.replaceState(null, '', q ? '/wyszukiwarka?q=' + encodeURIComponent(q) : '/wyszukiwarka');
      }
    });

    input.addEventListener('keydown', handleKeyNavigation);

    // Wyszukiwanie głosem (Web Speech API) — przycisk pojawia się tylko, gdy przeglądarka je obsługuje
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('ccOmniMic');
    // Nagłówek Permissions-Policy może zablokować mikrofon — wtedy nie pokazujemy martwego przycisku
    const policy = document.permissionsPolicy || document.featurePolicy;
    const micAllowed = !policy || typeof policy.allowsFeature !== 'function' || policy.allowsFeature('microphone');
    if (Recognition && micBtn && micAllowed) {
      micBtn.hidden = false;
      let recognizer = null;
      micBtn.addEventListener('click', () => {
        if (recognizer) { recognizer.stop(); return; }
        recognizer = new Recognition();
        recognizer.lang = 'pl-PL';
        recognizer.interimResults = false;
        micBtn.classList.add('cc-listening');
        micBtn.setAttribute('aria-label', 'Słucham… naciśnij, aby przerwać');
        recognizer.onresult = (ev) => {
          const text = ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
          if (!text) return;
          input.value = text;
          clearBtn.style.display = 'inline-flex';
          renderResults(text, activeFilter);
        };
        recognizer.onerror = (ev) => {
          const messages = {
            'not-allowed': 'Zezwól na mikrofon w ustawieniach przeglądarki',
            'service-not-allowed': 'Zezwól na mikrofon w ustawieniach przeglądarki',
            'no-speech': 'Nie usłyszałem — spróbuj jeszcze raz',
            'audio-capture': 'Nie znaleziono mikrofonu',
            'network': 'Brak połączenia z usługą rozpoznawania mowy'
          };
          input.value = '';
          input.placeholder = messages[ev.error] || 'Wyszukiwanie głosowe niedostępne';
        };
        recognizer.onend = () => {
          recognizer = null;
          micBtn.classList.remove('cc-listening');
          micBtn.setAttribute('aria-label', 'Szukaj głosem');
        };
        try { recognizer.start(); } catch (_) { recognizer.onend(); }
      });
    }

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        renderResults(input.value, activeFilter);
      });
    });
  }

  function handleKeyNavigation(e) {
    const items = document.querySelectorAll('.cc-omni-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      } else {
        const val = document.getElementById('ccOmniInput').value.trim();
        if (searchEngine === 'google' && val) window.location.href = googleUrl(val);
        else window.location.href = `/szukaj?q=${encodeURIComponent(val)}`;
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const sModal = document.getElementById('ccOmniSourcesModal');
      if (sModal && !sModal.hidden) {
        sModal.hidden = true;
        return;
      }
      closeSearch();
    }
  }

  function updateActiveItem(items) {
    items.forEach((it, idx) => {
      if (idx === activeIndex) {
        it.classList.add('cc-active');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('cc-active');
      }
    });
  }

  function renderResults(query, filter) {
    const body = document.getElementById('ccOmniBody');
    if (!body) return;

    currentQuery = query;
    const modal = document.getElementById('ccOmniModal');
    const hasQuery = !!String(query || '').trim();
    if (modal) modal.classList.toggle('cc-has-query', hasQuery);
    if (!hasQuery) {
      currentResults = [];
      activeIndex = -1;
      body.innerHTML = renderHome();
      startFeaturedRotation();
      return;
    }
    stopFeaturedRotation();
    const { items, guide, isSuggestion, suggestionNote, autocorrect } = performSearch(query, filter);
    currentResults = items;
    activeIndex = (items && items.length > 0) ? 0 : -1;

    // Faza 2: Detekcja wersetu biblijnego UBG
    const bibleMatch = parseBibleRef(query);
    const scriptureCardHtml = bibleMatch ? renderScriptureCard(bibleMatch) : '';

    // Biblia Intelligence CC (P1): Detekcja lematu greckiego/hebrajskiego lub kodu Stronga
    const lemmaMatch = detectStrongOrLemma(query);
    const lemmaCardHtml = lemmaMatch ? renderLemmaCard(lemmaMatch) : '';

    // Biblia Intelligence: Detekcja tematu biblijnego (jeśli brak bezpośredniego wersetu i lematu)
    const bibleTopic = (!bibleMatch && !lemmaMatch) ? detectBibleTopic(query) : null;
    const bibleTopicCardHtml = bibleTopic ? renderBibleTopicCard(bibleTopic) : '';

    // Biblia Intelligence CC (P2): Detekcja miejsca biblijnego i atlasu (OpenBible / OSM)
    const placeMatch = (!bibleMatch && !lemmaMatch) ? detectBiblePlace(query) : null;
    const placeCardHtml = placeMatch ? renderPlaceCard(placeMatch) : '';

    // Biblia Intelligence CC (P3): Weryfikacja cytowań Pisma Świętego (jeśli brak bezpośredniej sigli)
    const quoteVerification = (!bibleMatch) ? verifyBibleQuote(query) : null;
    const quoteVerificationCardHtml = quoteVerification ? renderQuoteVerificationCard(quoteVerification) : '';

    // Etap 5: Detekcja pytania biblijnego i synteza RAG CC (ZERO COST)
    const ragMatch = (!bibleMatch && !lemmaMatch) ? detectBibleRagQuery(query) : null;
    const ragCardHtml = ragMatch ? renderBibleRagCard(ragMatch) : '';

    // Faza 2: Detekcja intencji duszpasterskiej / pomocy
    const isHope = detectHopeIntent(query);
    const hopeCardHtml = isHope ? renderHopeCard(query) : '';

    let leftColHtml = '';

    // Tryb Google: pierwszy wynik prowadzi do wyszukiwania w całym internecie, poniżej materiały CC
    if (searchEngine === 'google') {
      leftColHtml += `
        <a class="cc-omni-google-go" href="${escapeHtml(googleUrl(query))}">
          <span class="cc-omni-google-g" aria-hidden="true">G</span>
          <span><b>Szukaj „${escapeHtml(query)}” w Google</b><small>Naciśnij Enter, aby otworzyć wyniki z całego internetu</small></span>
        </a>
        <p class="cc-omni-google-sub">Z ekosystemu Christian Culture:</p>`;
    }

    if (scriptureCardHtml) {
      leftColHtml += scriptureCardHtml;
    }
    if (ragCardHtml) {
      leftColHtml += ragCardHtml;
    }
    if (quoteVerificationCardHtml) {
      leftColHtml += quoteVerificationCardHtml;
    }
    if (lemmaCardHtml) {
      leftColHtml += lemmaCardHtml;
    }
    if (placeCardHtml) {
      leftColHtml += placeCardHtml;
    }
    if (bibleTopicCardHtml) {
      leftColHtml += bibleTopicCardHtml;
    }
    if (hopeCardHtml) {
      leftColHtml += hopeCardHtml;
    }

    // Faza 3: Pasek autokorekty literówki (np. Pokazuję wyniki dla: Apokalipsa)
    if (autocorrect && autocorrect.corrected.toLowerCase() !== query.trim().toLowerCase()) {
      leftColHtml += `
        <div class="cc-omni-autocorrect-banner" id="ccOmniAutoCorrect">
          <span class="cc-autocorrect-icon">✨</span>
          <div class="cc-autocorrect-text">
            Pokazuję wyniki dla: <button type="button" class="cc-autocorrect-btn" data-query="${escapeHtml(autocorrect.corrected)}"><strong>${escapeHtml(autocorrect.corrected)}</strong></button>
            <span class="cc-autocorrect-instead">Zamiast: <button type="button" class="cc-autocorrect-btn-orig" data-query="${escapeHtml(autocorrect.original)}"><i>${escapeHtml(autocorrect.original)}</i></button></span>
          </div>
        </div>
      `;
    }

    // 1. Jeśli jest dopasowany przewodnik tematyczny
    if (guide) {
      const topic = escapeHtml(guide.topic || '');
      const summary = escapeHtml(guide.summary || '');
      let pillsHtml = '';
      if (guide.shortcuts && Array.isArray(guide.shortcuts)) {
        pillsHtml = guide.shortcuts.map(s => {
          const sTitle = escapeHtml(s.title || '');
          const sUrl = escapeHtml(s.url || '#');
          const sIcon = escapeHtml(s.icon || '🔗');
          return `<a href="${sUrl}" class="cc-omni-guide-pill"><span>${sIcon}</span><span>${sTitle}</span></a>`;
        }).join('');
      }

      leftColHtml += `
        <div class="cc-omni-guide">
          <div class="cc-omni-guide-badge">Przewodnik po ekosystemie</div>
          <h4 class="cc-omni-guide-topic">${topic}</h4>
          <p class="cc-omni-guide-summary">${summary}</p>
          <div class="cc-omni-guide-pills">
            ${pillsHtml}
          </div>
        </div>
      `;
    }

    // 2. Nagłówek propozycji bliskoznacznych gdy brak bezpośrednich wyników
    if (isSuggestion && items && items.length) {
      leftColHtml += `
        <div class="cc-omni-suggestion-header">
          <div class="cc-omni-suggestion-icon">💡</div>
          <div class="cc-omni-suggestion-text">
            <div class="cc-omni-suggestion-title">Brak bezpośredniego dopasowania dla „${escapeHtml(query)}”</div>
            <div class="cc-omni-suggestion-desc">${escapeHtml(suggestionNote || 'Oto bliskoznaczne propozycje i powiązane materiały z ekosystemu Christian Culture:')}</div>
          </div>
        </div>
      `;
    }

    // 3. Lista wyników
    if (!items.length) {
      if (!scriptureCardHtml && !lemmaCardHtml && !bibleTopicCardHtml && !hopeCardHtml) {
        leftColHtml += `
          <div class="cc-omni-empty">
            <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
            <div style="font-weight:700;font-size:1.05rem;color:inherit;">Nie znaleziono bezpośrednich wyników dla "${escapeHtml(query)}"</div>
            <p>Spróbuj wpisać inne słowo, np. <i>nadzieja</i>, <i>werset dnia</i>, <i>modlitwa</i>, <i>apokalipsa</i> lub przejdź do pełnego indeksu.</p>
            <a href="/szukaj?q=${encodeURIComponent(query)}" class="cc-omni-guide-pill" style="display:inline-flex;">Przeszukaj pełne archiwum /szukaj &rarr;</a>
          </div>
        `;
      }
    } else {
      leftColHtml += '<div class="cc-omni-results-list" id="ccOmniResultsList" role="feed">';
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const titleHl = highlightMatches(item.title, query);
        const descHl = highlightMatches(item.description, query);
        const meta = item._meta || categorizeItem(item);
        const url = escapeHtml(item.url || '#');
        const icon = meta.icon || '✨';
        const groupName = escapeHtml(meta.name || '');
        const suggestionBadge = (item.isNearMatch || isSuggestion) ? '<span class="cc-omni-item-badge cc-badge-suggestion">Temat pokrewny</span>' : '';
        const crumb = escapeHtml(breadcrumbOf(item.url || ''));
        const isItemActive = (idx === activeIndex);

        leftColHtml += `
          <a href="${url}" class="cc-omni-item${isItemActive ? ' cc-active' : ''}" data-url="${url}">
            <div class="cc-omni-item-source">
              <span class="cc-omni-item-icon" aria-hidden="true">${icon}</span>
              <span class="cc-omni-item-site"><span class="cc-omni-item-sitename">${groupName}</span><span class="cc-omni-item-crumb">${crumb}</span></span>
            </div>
            <div class="cc-omni-item-title-row">
              <span class="cc-omni-item-title">${titleHl}</span>
              ${suggestionBadge}
            </div>
            <p class="cc-omni-item-desc">${descHl}</p>
          </a>
        `;
      }
      leftColHtml += '</div>';
    }

    // Faza 2: Całość wyników w luksusowym dwukolumnowym Split-View (Raycast / Spotlight style)
    const previewContent = (items && items.length > 0) ? getPreviewHtml(items[0]) : '';
    const finalHtml = `
      <div class="cc-omni-split-layout">
        <div class="cc-omni-results-col">
          ${leftColHtml}
        </div>
        <aside class="cc-omni-preview-pane" id="ccOmniPreviewPane" aria-label="Podgląd błyskawiczny">
          ${previewContent}
        </aside>
      </div>
    `;

    body.innerHTML = finalHtml;

    // Asynchroniczne dociągnięcie tekstu wersetu UBG, jeśli nie był w kanonicznym buforze podręcznym
    if (bibleMatch && bibleMatch.isPending) {
      fetchBibleVerse(bibleMatch.bookCode, bibleMatch.chapter, bibleMatch.verse).then(text => {
        if (!text) return;
        const quoteEl = document.getElementById('ccScriptureQuote');
        const copyBtn = document.getElementById('ccScriptureCopyBtn');
        if (quoteEl) quoteEl.textContent = '„' + text + '”';
        if (copyBtn) copyBtn.setAttribute('data-quote', '„' + text + '” — ' + bibleMatch.refTitle + ' (UBG)');
      });
    }
  }

  // Strona startowa: prawdziwe skróty ekosystemu i historia odwiedzin z tej przeglądarki (cc-favorites.js)
  const HOME_ICONS = {
    play: '<path d="M8 5v14l11-7Z"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19V5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="15.5" cy="14" r="2.5"/><path d="M7 12h4M7 16h4M7 8l9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
    channels: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 14v4M10 16h4"/>',
    bible: '<path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2Z"/><path d="M5 20V4M12 6v8M9 9h6"/>',
    quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
    cross: '<path d="M12 2v20M7 7h10"/>',
    pray: '<path d="M12 3v7l-3 4v7M12 10l3 4v7M9 14l-4 2M15 14l4 2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
        sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    bookmark: '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
    newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18M3 7h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    book: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
  };
  const svgIcon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOME_ICONS[name] || ''}</svg>`;
  // Menu „Wszystko”: cały ekosystem w sekcjach z rejestru linków (L0 24.10.2026); każdy adres sprawdzony 26.10.2026 (200).
  // Pominięte: uslugi/centrum/randka.cclite.pl (brak DNS) — do decyzji L0.
  const APP_ICONS = {
    worship: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/><path d="M12 9v6M9.5 11.5h5"/>',
    karaoke: '<circle cx="15" cy="8" r="4"/><path d="m12.2 10.8-8.5 8.5 1 1 8.5-8.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    scroll: '<path d="M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1 0-4h1Z"/><path d="M10 9h4M10 13h4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 19h16"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    columns: '<path d="M3 21h18M4 9h16M12 3 3 8h18ZM6 9v9M10 9v9M14 9v9M18 9v9"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    family: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>',
    school: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 15v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    plane: '<path d="M10.5 13.5 3 11l1.5-1.5 8 1L17 6a2 2 0 0 1 3 3l-4.5 4.5 1 8L15 23l-2.5-7.5L8 19v3l-1.5 1-1-4-4-1L3 16.5h3Z"/>',
    library: '<path d="M4 4h4v16H4ZM10 4h4v16h-4ZM16 5l3.5-1 3 15.5-3.5 1Z"/>',
    pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    tent: '<path d="M12 3 2 21h20ZM12 3v18M8 21l4-7 4 7"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    board: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    video: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="m11 9 4 3-4 3Z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    hands: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a2 2 0 0 0 1.4.3L21 4M3 3l.5.5L9 9"/>',
    broadcast: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
    idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 21 9.8C21 6 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="7.5" r="1"/>',
    counter: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    // Kursy (L0 02.11.2026)
    courses: '<path d="M12 21V7"/><path d="m16 12 2 2 4-4"/><path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"/>',
    puzzle: '<path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5a2.4 2.4 0 0 1 0 3.4l-1.6 1.6a1 1 0 0 1-.8.3c-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.9.5.9 1a1 1 0 0 1-.3.8l-1.6 1.6a2.4 2.4 0 0 1-3.4 0l-1.6-1.6a1 1 0 0 0-.8-.3c-.5.1-.9.5-1 1a2.5 2.5 0 1 1-3.3-3.3c.5-.2.9-.5 1-1a1 1 0 0 0-.3-.9l-1.6-1.5a2.4 2.4 0 0 1 0-3.4l1.5-1.5c.3-.3.6-.4 1-.3.5.1.8.5 1 1a2.5 2.5 0 1 0 3.3-3.3c-.5-.2-.9-.5-1-1 0-.4.1-.7.3-1l1.5-1.5a2.4 2.4 0 0 1 3.4 0l1.6 1.6c.2.2.5.3.9.3.5-.1.8-.5 1-1a2.5 2.5 0 1 1 3.2 3.2c-.4.2-.9.5-.9 1Z"/>',
    nosmoke: '<path d="M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13"/><path d="M18 8c0-2.5-2-2.5-2-5"/><path d="m2 2 20 20"/><path d="M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.9"/><path d="M22 8c0-2.5-2-2.5-2-5"/><path d="M7 12v4"/>',
    mountain: '<path d="m8 3 4 8 5-5 5 15H2Z"/>'
  };
  Object.assign(HOME_ICONS, APP_ICONS);
  const APPS_MENU = [
    { title: 'Słuchaj i oglądaj', items: [
      ['Radio', '/player', 'radio'], ['TV 24', '/cctv24', 'tv'], ['Kanały', '/kanaly', 'channels'],
      ['Podcasty', '/podcasty', 'mic'], ['Kino VOD', '/vod', 'film'], ['Muzyka', '/music', 'music'], ['topTEN', '/topTEN/', 'trophy'],
      ['Uwielbienie', '/BiblijneUwielbienie', 'worship'], ['Karaoke', '/karaoke-studio', 'karaoke'], ['CC Network', '/network', 'globe']
    ] },
    { title: 'Słowo i modlitwa', items: [
      ['Akademia', '/akademia', 'book'], ['Lekcja dnia', '/akademia/kurscodzienny', 'calendar'], ['MojaBiblia', '/mojabiblia', 'bible'],
      ['Werset dnia', '/werset-dnia', 'quote'], ['Ewangelia', '/Ewangelia', 'cross'], ['Modlitwa 24/7', '/BCM24', 'pray'],
      ['Za Polskę', '/zapolske-live', 'flag'], ['Apokalipsa', '/apokalipsa-live', 'scroll'], ['Kalendarz', '/kalendarz', 'calendar'],
      ['Biblia PDF', '/biblia-do-pobrania', 'download']
    ] },
    { title: 'Kursy', items: [
      ['Wszystkie kursy', '/kursy', 'courses'], ['Rozwiąż problem', '/Rozwi%C4%85%C5%BCProblem', 'puzzle'],
      ['Rzuć palenie', '/Rozwi%C4%85%C5%BCProblem#kurs', 'nosmoke'], ['Pokonać Goliata', '/kursy/pokonac-goliata', 'mountain'],
      ['Apokalipsa — kurs', '/kursy/apokalipsa/lekcja-1', 'scroll']
    ] },
    { title: 'Wiedza CCN', items: [
      ['Portal CCN', '/news', 'news'], ['Nauka', '/nauka', 'flask'], ['Historia', '/historia', 'columns'],
      ['Apologetyka', '/apologetyka', 'shield'], ['Psychologia', '/psychologia', 'brain'], ['Małżeństwo', '/seks', 'family'],
      ['Edukacja', '/edukacja', 'school'], ['Finanse', '/finanse', 'coins'], ['Technologie', '/technologie', 'cpu'],
      ['Misje', '/misje', 'plane'], ['Biblioteka', '/biblioteka', 'library'], ['Książki autora', '/ksiazki-autora', 'pen'],
      ['eM Motywacja', '/em', 'bolt'], ['Survival', '/survival', 'tent'], ['#antyHALLOWEEN', '/Halloween', 'ban']
    ] },
    { title: 'Społeczność', items: [
      ['LUMINA', '/lumina', 'people'], ['Tablica', '/tablica', 'board'], ['LUMI Mess', '/mess', 'chat'],
      ['Shorts', '/shorts', 'video'], ['Moje Centrum', '/moje-centrum', 'user'], ['CC Lite', 'https://cclite.pl', 'phone']
    ] },
    { title: 'Współpraca, usługi i wsparcie', items: [
      ['Wspieraj', '/wspieraj', 'heart'], ['Współpraca', '/wspolpraca', 'hands'], ['Nadawaj z nami', '/nadawaj', 'broadcast'],
      ['Wizytówki', '/wizytowki', 'idcard'], ['Coaching', '/holistyczny-coaching', 'target'], ['Kreator YIS', '/YIS', 'palette'],
      ['Milion', '/milion', 'counter'], ['HOLOS', '/holos', 'sparkle'], ['Mapa', '/mapa', 'map'],
      ['O nas', '/o-nas', 'info'], ['Kontakt', '/#contact-section', 'mail'], ['Prywatność', '/privacy', 'lock']
    ] }
  ];
  function renderAppsGrid() {
    return APPS_MENU.map(sec => `<p class="cc-omni-apps-sec">${escapeHtml(sec.title)}</p><div class="cc-omni-apps-grid">` +
      sec.items.map(([label, url, icon]) => `<a href="${url}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''}><span class="cc-omni-app-ico">${svgIcon(icon, 20)}</span>${escapeHtml(label)}</a>`).join('') +
      '</div>').join('');
  }

  const HOME_SHORTCUTS = [
    { label: 'YouTube', url: 'https://www.youtube.com/@ChristianCultureTV', icon: 'play', external: true },
    { label: 'Kanały', url: '/kanaly', icon: 'tv' },
    { label: 'Akademia', url: '/akademia', icon: 'book' },
    { label: 'Podcasty', url: '/podcasty', icon: 'mic' },
    { label: 'Portal CCN', url: '/news', icon: 'news' },
    { label: 'LUMINA', url: '/lumina', icon: 'people' },
    { label: 'Ulubione', action: 'favorites', icon: 'star' },
    { label: 'Strona główna', url: '/', icon: 'home' }
  ];
  function visitedLabel(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const now = new Date();
    const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'Odwiedzono dziś, ' + time;
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Odwiedzono wczoraj, ' + time;
    return 'Odwiedzono ' + d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
  }
    // ── Silnik Dynamicznych Okien Propozycji („Tętniąca Życiem Wyszukiwarka EkoCC” — Wersja Premium) ──
  const FEATURED_MODES = [
    { id: 0, label: 'Dla Ciebie', fullLabel: 'Dla Ciebie • Pora Dnia & Kalendarz', icon: 'sparkle' },
    { id: 1, label: 'Słowo & Kurs', fullLabel: 'Słowo Boże & Kurs Codzienny', icon: 'bible' },
    { id: 2, label: 'Proroctwa', fullLabel: 'Proroctwa & Czas Końca', icon: 'compass' },
    { id: 3, label: 'Radio & Live', fullLabel: 'Radio 24/7 & Telewizja Uwielbienia', icon: 'radio' },
    { id: 4, label: 'CCN & Wiedza', fullLabel: 'Aktualności CCN, Nauka & Historia', icon: 'newspaper' },
    { id: 5, label: 'Pokój & Pomoc', fullLabel: 'Pokój Serca, Modlitwa & Wsparcie', icon: 'heart' },
    { id: 6, label: 'Kino & Audio', fullLabel: 'Kino VOD, Słuchowiska & Książki', icon: 'film' },
    { id: 7, label: 'Społeczność', fullLabel: 'LUMINA, Rodzina & Rozwój', icon: 'users' }
  ];

  function getSmartContextInfo(nowDate = new Date()) {
    const hour = nowDate.getHours();
    const dayOfWeek = nowDate.getDay(); // 0=Nd, 5=Pt, 6=Sob
    const dayOfMonth = nowDate.getDate();
    const month = nowDate.getMonth() + 1; // 1..12
    const lessonDay = Math.max(1, Math.min(31, dayOfMonth));
    const monthsGenitive = [
      '', 'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
      'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
    ];
    const dateShort = `${dayOfMonth} ${monthsGenitive[month] || ''}`.trim();

    // 1. Karta Pory Dnia (Slot 0)
    let timeCard;
    let timeContextLabel;
    if (hour >= 5 && hour < 12) {
      timeContextLabel = 'Poranek ze Słowem';
      timeCard = {
        tag: 'PORANEK ZE SŁOWEM',
        badge: 'PORANEK',
        title: 'Rozważanie „Dobrze, że jesteś” i Werset Dnia',
        desc: 'Rozpocznij dzień z Bożą obietnicą, modlitwą i pokojem serca na nowe wyzwania.',
        url: '/werset-dnia',
        icon: 'sun'
      };
    } else if (hour >= 12 && hour < 17) {
      timeContextLabel = 'Popołudnie z Radiem i Słowem';
      timeCard = {
        tag: 'SŁUCHAJ W CIĄGU DNIA',
        badge: 'LIVE 24/7',
        title: 'Radio Christian Culture 24/7 & Audycje Dnia',
        desc: 'Muzyka uwielbienia, Biblia Audio i budujące pasma towarzyszące Ci w pracy i w drodze.',
        url: '/player',
        icon: 'radio'
      };
    } else if (hour >= 17 && hour < 22) {
      timeContextLabel = 'Wieczorne Studium i Wyciszenie';
      timeCard = {
        tag: 'WIECZÓR Z BOGIEM',
        badge: 'WIECZÓR',
        title: 'Wieczorne Studium: Apokalipsa & Kino VOD',
        desc: 'Odpocznij po całym dniu przy profetycznym Słowie Bożym lub wartościowym filmie.',
        url: '/apokalipsa-live',
        icon: 'film'
      };
    } else {
      timeContextLabel = 'Nocne Ukojenie i Boży Pokój';
      timeCard = {
        tag: 'NOCNE PASMO POKOJU',
        badge: 'NOC 24/7',
        title: 'Nocne Ukojenie: Psalmy, Ambient Sleep & Modlitwa',
        desc: 'Łagodne brzmienia uwielbienia i biblijne obietnice na spokojny, głęboki sen bez lęku.',
        url: '/cctv24-worship',
        icon: 'moon'
      };
    }

    // 2. Karta Wydarzeń, Okoliczności, Świąt i Dnia Tygodnia (Slot 1)
    let occasionCard;
    let occasionLabel = dateShort;
    const isSabbath = (dayOfWeek === 6) || (dayOfWeek === 5 && hour >= 16);
    const isReformationLightSeason = (month === 10 && dayOfMonth >= 24) || (month === 11 && dayOfMonth <= 5);
    const isIndependenceSeason = (month === 11 && dayOfMonth >= 8 && dayOfMonth <= 14);
    const isNativitySeason = (month === 12 && dayOfMonth >= 15) || (month === 1 && dayOfMonth <= 6);
    const isPaschaSeason = (month === 3 && dayOfMonth >= 20) || (month === 4 && dayOfMonth <= 25);
    const isSummerMission = (month === 7 || month === 8);

    if (isSabbath) {
      occasionLabel = 'Święty Czas Odpocznienia • Szabat';
      occasionCard = {
        tag: 'ŚWIĘTY CZAS ODPOCZNIENIA',
        badge: 'SZABAT',
        title: 'Błogosławiony Szabat: Odpocznij w Bożej Obecności',
        desc: 'Śpiewane Psalmy, uwielbienie i studium Słowa na święty dzień odpocznienia (Wj 20:8–11).',
        url: '/biblia-spiewana-live',
        icon: 'worship'
      };
    } else if (isReformationLightSeason) {
      occasionLabel = `Reformacja & Światło (${dateShort})`;
      occasionCard = {
        tag: 'WYDARZENIE SEZONU',
        badge: 'ŚWIATŁO vs MROK',
        title: 'Światło Zwycięża Mrok — Reformacja & Prawda Biblijna',
        desc: 'Dlaczego chrześcijanie wybierają Życie i Światłość Chrystusa? Biblijna odpowiedź na kulturę mroku.',
        url: '/Halloween',
        icon: 'shield'
      };
    } else if (isIndependenceSeason) {
      occasionLabel = `Modlitwa za Polskę (${dateShort})`;
      occasionCard = {
        tag: 'WYDARZENIE NARODOWE',
        badge: 'ZA POLSKĘ',
        title: 'Zjednoczeni za Polskę — Modlitwa o Naród i Pokój',
        desc: 'Wspólne wstawiennictwo o błogosławieństwo, mądrość i Bożą ochronę dla naszej Ojczyzny.',
        url: '/zapolske-live',
        icon: 'flag'
      };
    } else if (isNativitySeason) {
      occasionLabel = 'Proroctwa Mesjańskie • Immanuel';
      occasionCard = {
        tag: 'PROROCTWA MESJAŃSKIE',
        badge: 'IMMANUEL',
        title: 'Bóg z Nami — 300 Proroctw o Narodzeniu Mesjasza',
        desc: 'Odkryj niezwykłe wypełnienie starotestamentowych proroctw o przyjściu Zbawiciela Świata.',
        url: '/mojabiblia',
        icon: 'star'
      };
    } else if (isPaschaSeason) {
      occasionLabel = 'Pascha & Zmartwychwstanie';
      occasionCard = {
        tag: 'PASCHA & KRZYŻ',
        badge: 'ZMARTWYCHWSTANIE',
        title: 'Baranek Boży i Pusty Grób — Fundament Wiary',
        desc: 'Historyczne i biblijne świadectwa zmartwychwstania Jezusa Chrystusa oraz nowego życia.',
        url: '/Ewangelia',
        icon: 'cross'
      };
    } else if (isSummerMission) {
      occasionLabel = 'Misja Boże Wakacje';
      occasionCard = {
        tag: 'CYKL BOŻE WAKACJE',
        badge: 'LATO CC',
        title: 'Boże Wakacje — Odpoczynek, Misja i Ewangelizacja',
        desc: 'Inspiracje w podróży, Biblia Audio i codzienne umocnienie podczas letniego wypoczynku.',
        url: '/akademia',
        icon: 'compass'
      };
    } else if (dayOfWeek === 0) {
      occasionLabel = `Niedziela dla Rodziny (${dateShort})`;
      occasionCard = {
        tag: 'CZAS DLA RODZINY',
        badge: 'NIEDZIELA',
        title: 'Cyfrowy Detoks i Rodzinne Kino Chrześcijańskie',
        desc: 'Jak odzyskać prawdziwą bliskość przy wspólnym stole oraz budujące filmy dla całego domu.',
        url: '/news/cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj',
        icon: 'family'
      };
    } else {
      occasionCard = {
        tag: 'INTERLINEARNA BIBLIA',
        badge: 'GREKA & HEBR',
        title: 'MojaBiblia: Kody Stronga & Greka',
        desc: 'Badaj oryginalne znaczenie słów hebrajskich i greckich z przekładami UBG, BW, BT i BG.',
        url: '/mojabiblia',
        icon: 'scroll'
      };
    }

    // 3. Karta Kalendarzowej Lekcji Dnia (Slot 2)
    const dailyLessonCard = {
      tag: 'LEKCJA NA DZIŚ',
      badge: `DZIEŃ ${lessonDay}`,
      title: `Kurs Codzienny (Dzień ${lessonDay}): Z Biblią za Pan Brat`,
      desc: 'Dzisiejsze rozważanie Pisma Świętego werset po wersecie przygotowane dokładnie na ten dzień.',
      url: `/akademia/kurscodzienny/dzien-${lessonDay}`,
      icon: 'calendar'
    };

    // 4. Karta Dopasowana do Indywidualnych Potrzeb Użytkownika (Slot 3)
    let personalCard = {
      tag: 'POKÓJ SERCA • NA DZIŚ',
      badge: 'DLA CIEBIE',
      title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
      desc: 'Biblijne uciszenie burzy w sercu według Bożego Słowa (Cezary Rogowski).',
      url: '/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski',
      icon: 'newspaper'
    };

    try {
      const recents = getRecentSearches();
      const joinedQueries = recents.join(' ').toLowerCase();
      let favs = [];
      let history = [];
      if (typeof localStorage !== 'undefined') {
        favs = JSON.parse(localStorage.getItem('cc_user_favorites') || '[]');
        history = JSON.parse(localStorage.getItem('cc_user_visit_history') || '[]');
      }
      favs = (Array.isArray(favs) ? favs : []).filter(f => f && f.url && f.title && !/^\/(wyszukiwarka|szukaj)\b/i.test(f.url));
      history = (Array.isArray(history) ? history : []).filter(h => h && h.url && h.title && !/^\/(wyszukiwarka|szukaj)\b/i.test(h.url));

      if (/lęk|lek|strach|stres|depres|dług|dlug|kredyt|pomoc|kryzys|samotn|ból|bol/.test(joinedQueries)) {
        personalCard = {
          tag: 'WSPARCIE I RATUNEK',
          badge: 'DOPASOWANE',
          title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
          desc: 'Biblijne uciszenie burzy w sercu, wsparcie modlitewne 24/7 i wyjście z kryzysu.',
          url: '/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski',
          icon: 'heart'
        };
      } else if (/apokalips|daniel|proroc|koniec|znak|besti|objawieni/.test(joinedQueries)) {
        personalCard = {
          tag: 'TWOJE ZAINTERESOWANIA',
          badge: 'PROROCTWA',
          title: 'APOKALIPSA — Księga Nadziei (Wykłady SDS)',
          desc: 'Kontynuuj odkrywanie proroctw Księgi Daniela i Objawienia św. Jana w świetle Biblii.',
          url: '/apokalipsa-live',
          icon: 'compass'
        };
      } else if (/muzyk|śpiew|spiew|karaoke|uwielbieni|psalm|radio/.test(joinedQueries)) {
        personalCard = {
          tag: 'TWOJE BRZMIENIE 24/7',
          badge: 'UWIELBIENIE',
          title: 'Śpiewane Psalmy i Przypowieści (Karaoke Live)',
          desc: 'Transmisja telewizyjna na żywo z dynamicznym karaoke biblijnym i pieśniami chwały.',
          url: '/biblia-spiewana-live',
          icon: 'music'
        };
      } else if (favs.length > 0) {
        personalCard = {
          tag: 'TWOJE ULUBIONE',
          badge: 'ULUBIONE ★',
          title: String(favs[0].title),
          desc: 'Wróć jednym kliknięciem do zapisanego przez Ciebie materiału w ekosystemie CC.',
          url: String(favs[0].url),
          icon: 'star'
        };
      } else if (history.length > 0) {
        personalCard = {
          tag: 'KONTYNUUJ ODKRYWANIE',
          badge: 'TWOJA ŚCIEŻKA',
          title: String(history[0].title),
          desc: 'Kontynuuj dokładnie tam, gdzie ostatnio zakończyłeś lekturę lub odsłuch.',
          url: String(history[0].url),
          icon: 'clock'
        };
      }
    } catch (_) {}

    return {
      pillText: `${timeContextLabel} • ${occasionLabel}`,
      cards: [timeCard, occasionCard, dailyLessonCard, personalCard]
    };
  }

  // 8 Zestawów Tematycznych × 4 Sloty = 32 Wyselekcjonowane Propozycje Premium
  const FEATURED_POOLS = [
    // Slot 0 (Lewy Górny) — 8 zestawów (0..7)
    [
      {
        tag: 'Inspiracja na Dziś',
        badge: 'PORANEK',
        title: 'Rozważanie „Dobrze, że jesteś”',
        desc: 'Codzienne słowo umocnienia, modlitwa i Boży pokój na każdy dzień.',
        url: '/player',
        icon: 'heart'
      },
      {
        tag: 'Słowo Boże na Dziś',
        badge: 'OBIETNICA',
        title: 'Mój Werset Dnia z Obietnicą',
        desc: 'Losuj i rozważaj żywe obietnice Pisma Świętego przygotowane na dziś.',
        url: '/werset-dnia',
        icon: 'sparkle'
      },
      {
        tag: 'Podcast Spotify SDS',
        badge: 'PODCAST',
        title: 'APOKALIPSA — Księga Nadziei',
        desc: 'Profetyczny cykl wykładów biblijnych Studia Dobrego Słowa werset po wersecie.',
        url: '/podcasty',
        icon: 'mic'
      },
      {
        tag: 'Nadajemy 24/7',
        badge: 'LIVE 24/7',
        title: 'Radio Christian Culture & Player',
        desc: 'Muzyka uwielbienia, słuchowiska Biblia Audio i stacje tematyczne non-stop.',
        url: '/player',
        icon: 'radio'
      },
      {
        tag: 'Portal Informacyjny CC',
        badge: 'CCN NEWS',
        title: 'Aktualności CCN — Świat w Świetle Biblii',
        desc: 'Rzetelne analizy wydarzeń, komentarze i publicystyka bez manipulacji.',
        url: '/news',
        icon: 'newspaper'
      },
      {
        tag: 'Psychologia & Wiara',
        badge: 'POKÓJ SERCA',
        title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
        desc: 'Biblijne uciszenie burzy w sercu według Bożego Słowa (Cezary Rogowski).',
        url: '/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski',
        icon: 'heart'
      },
      {
        tag: 'Kino Chrześcijańskie VOD',
        badge: 'BEZ REKLAM',
        title: 'Filmy Fabularne i Dokumentalne CC',
        desc: 'Wartościowe kino chrześcijańskie dla całej rodziny bez opłat i subskrypcji.',
        url: '/vod',
        icon: 'film'
      },
      {
        tag: 'Społeczność Wiary',
        badge: 'LUMINA',
        title: 'Portal Społecznościowy LUMINA',
        desc: 'Dołącz do chrześcijan z całej Polski — dyskusje, świadectwa i wspólna modlitwa.',
        url: '/lumina',
        icon: 'users'
      }
    ],
    // Slot 1 (Prawy Górny) — 8 zestawów (0..7)
    [
      {
        tag: 'Interlinearna Biblia',
        badge: 'GREKA & HEBR',
        title: 'MojaBiblia: Kody Stronga & Greka',
        desc: 'Oryginalne znaczenie słów hebrajskich i greckich w Twojej przeglądarce.',
        url: '/mojabiblia',
        icon: 'scroll'
      },
      {
        tag: 'Interlinearna Biblia',
        badge: '4 PRZEKŁADY',
        title: 'MojaBiblia: Kody Stronga & Greka',
        desc: 'Porównuj przekłady UBG, BW, BT i BG ze słownikiem grecko-hebrajskim.',
        url: '/mojabiblia',
        icon: 'bible'
      },
      {
        tag: 'Kurs Proroctw Biblijnych',
        badge: 'PROROCTWA',
        title: 'Księga Daniela — 2300 Wieczorów i Poranków',
        desc: 'Klucz do zrozumienia czasów ostatecznych i nadziei Zbawienia w Chrystusie.',
        url: '/akademia',
        icon: 'compass'
      },
      {
        tag: 'Biblia Śpiewana Live 24/7',
        badge: 'KARAOKE TV',
        title: 'Śpiewane Psalmy i Przypowieści',
        desc: 'Transmisja telewizyjna na żywo z dynamicznym karaoke biblijnym non-stop.',
        url: '/biblia-spiewana-live',
        icon: 'tv'
      },
      {
        tag: 'Nauka & Stworzenie',
        badge: 'ODKRYCIA',
        title: 'Portal Nauka — Dowody Bożego Projektu',
        desc: 'Fascynujące odkrycia fizyki, kosmologii i biologii potwierdzające Stworzenie.',
        url: '/nauka',
        icon: 'flask'
      },
      {
        tag: 'Wstawiennictwo 24/7',
        badge: 'MODLITWA',
        title: 'Całodobowa Modlitwa Wstawiennicza BCM24',
        desc: 'Zostaw intencję modlitewną lub dołącz do strażników modlitwy o każdej porze.',
        url: '/BCM24',
        icon: 'pray'
      },
      {
        tag: 'Słuchowisko Biblijne',
        badge: 'AUDIO HD',
        title: 'Biblia Audio — Nowy Testament UBG',
        desc: 'Żywe Słowo Boże z profesjonalną muzyką i udźwiękowieniem radiowym.',
        url: '/player',
        icon: 'volume'
      },
      {
        tag: 'Relacje & Małżeństwo',
        badge: 'RODZINA',
        title: 'Cyfrowy detoks w chrześcijańskim domu',
        desc: 'Jak odzyskać prawdziwą bliskość przy wspólnym stole (Wioletta Rogowska).',
        url: '/news/cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj',
        icon: 'family'
      }
    ],
    // Slot 2 (Lewy Dolny) — 8 zestawów (0..7)
    [
      {
        tag: 'Akademia Biblijna',
        badge: 'LEKCJA DNIA',
        title: 'Lekcja Dnia: Z Biblią za Pan Brat',
        desc: 'Codzienne studium Pisma Świętego werset po wersecie z komentarzem.',
        url: '/akademia#kurscodzienny',
        icon: 'book'
      },
      {
        tag: 'Akademia Biblijna',
        badge: 'KURS 31 DNI',
        title: 'Lekcja Dnia: Z Biblią za Pan Brat',
        desc: 'Systematyczny kurs biblijny prowadzący przez kluczowe księgi Pisma Świętego.',
        url: '/akademia#kurscodzienny',
        icon: 'calendar'
      },
      {
        tag: 'Kanał Profetyczny 24/7',
        badge: 'WIDEO LIVE',
        title: 'Apokalipsa Live — Wykłady Wideo Non-Stop',
        desc: 'Całodobowe pasmo telewizyjne z wykładami o proroctwach Księgi Objawienia.',
        url: '/apokalipsa-live',
        icon: 'tv'
      },
      {
        tag: 'Telewizja CCTV24 Worship',
        badge: 'PASMO NOCNE',
        title: 'CCTV24 — Pasmo Bożej Obecności',
        desc: 'Nocne czuwania, modlitwy i pieśni chwały w krystalicznej jakości HD.',
        url: '/cctv24-worship',
        icon: 'play'
      },
      {
        tag: 'Historia & Korzenie Wiary',
        badge: 'HISTORIA',
        title: 'Historia Chrześcijaństwa, Słowian i Biblii',
        desc: 'Niezafałszowane dzieje Kościoła, Reformacji i polskich przekładów Pisma.',
        url: '/historia',
        icon: 'columns'
      },
      {
        tag: 'Modlitwa & Wstawiennictwo',
        badge: 'ZA POLSKĘ',
        title: 'Zjednoczeni za Polskę — Czuwanie',
        desc: 'Wspólna modlitwa narodu o pokój, Boże prowadzenie i duchowe przebudzenie.',
        url: '/modlitwa',
        icon: 'flag'
      },
      {
        tag: 'Literatura Chrześcijańska',
        badge: 'KSIĄŻKI',
        title: 'Książki Autora & Powieść „Pardon, Czy To Miłość?”',
        desc: 'Poruszająca literatura, poradniki duchowe i publikacje Cezarego Rogowskiego.',
        url: '/ksiazki-autora',
        icon: 'pen'
      },
      {
        tag: 'Zdrowie Ciała i Ducha',
        badge: 'HOLOS',
        title: 'HOLOS — Biblijne Zdrowie, Sen i Odporność',
        desc: 'Osiem naturalnych praw zdrowia, regeneracja organizmu i higiena myśli.',
        url: '/holos',
        icon: 'sparkle'
      }
    ],
    // Slot 3 (Prawy Dolny) — 8 zestawów (0..7)
    [
      {
        tag: 'Aktualności CCN • Na Dziś',
        badge: 'POLECANE',
        title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
        desc: 'Biblijne uciszenie burzy w sercu według Bożego Słowa (Cezary Rogowski).',
        url: '/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski',
        icon: 'newspaper'
      },
      {
        tag: 'Biblioteka Słowa Bożego',
        badge: 'PDF & AUDIO',
        title: 'Biblia do Pobrania Za Darmo (UBG / BG)',
        desc: 'Pobierz Pismo Święte w formacie PDF oraz audiobooki do słuchania offline.',
        url: '/biblia-do-pobrania',
        icon: 'download'
      },
      {
        tag: 'Obrona Wiary & Prawda',
        badge: 'APOLOGETYKA',
        title: 'Apologetyka Biblijna — Odpowiedzi na Trudne Pytania',
        desc: 'Rzeczowe argumenty potwierdzające wiarygodność Biblii i proroctw mesjańskich.',
        url: '/apologetyka',
        icon: 'shield'
      },
      {
        tag: 'Studio Śpiewu & Tekstów',
        badge: 'ŚPIEWAJ Z NAMI',
        title: 'Biblijne Uwielbienie & Studio Karaoke CC',
        desc: 'Śpiewaj pieśni uwielbienia z zsynchronizowanym tekstem na żywo w przeglądarce.',
        url: '/BiblijneUwielbienie',
        icon: 'music'
      },
      {
        tag: 'Analizy & Społeczeństwo',
        badge: 'PRAWO & ETYKA',
        title: 'Wolność Sumienia i Prawo Boże',
        desc: 'Głębokie analizy wyzwań współczesnego świata w świetle Pisma Świętego.',
        url: '/prawo',
        icon: 'scale'
      },
      {
        tag: 'Finanse & Szafarstwo',
        badge: 'WOLNOŚĆ',
        title: 'Boże Zasady Finansów i Wyjście z Długów',
        desc: 'Praktyczna mądrość biblijna w zarządzaniu budżetem domowym i pokonywaniu długów.',
        url: '/finanse',
        icon: 'coins'
      },
      {
        tag: 'Krótkie Formy Wideo',
        badge: 'CC SHORTS',
        title: 'CC Shorts — 60 Sekund z Dobrym Słowem',
        desc: 'Dynamiczne pionowe rolki wideo z myślą dnia, wersetem i inspiracją.',
        url: '/shorts',
        icon: 'video'
      },
      {
        tag: 'Nawigator Ekosystemu',
        badge: '60+ MODUŁÓW',
        title: 'Żywa Mapa Ekosystemu Christian Culture',
        desc: 'Interaktywna mapa wszystkich portali, kanałów TV, kursów i narzędzi misji CC.',
        url: '/mapa',
        icon: 'map'
      }
    ]
  ];

  let activeFeaturedSet = 0;
  let featuredRotationTimer = null;
  let isFeaturedHovered = false;
  let omniRadioReady = null;
  let activeStreamCardTitle = '';

  const OMNI_STATION_NAMES = {
    poland: 'Radio Christian Culture 24/7',
    biblia_audio: 'Radio Biblia Audio UBG',
    biblia_spiewana: 'Biblia Śpiewana 24/7',
    instrumental_worship: 'Pasmo Uwielbienia & Modlitwy',
    global: 'Radio CC Global (EN)',
    global_biblia: 'Global Bible Audio'
  };

  function resolveCardStream(card) {
    if (!card) return '';
    if (card.streamStation) return card.streamStation;
    const url = String(card.url || '').toLowerCase();
    const icon = String(card.icon || '').toLowerCase();
    const title = String(card.title || '').toLowerCase();
    if (url.includes('biblia-spiewana') || url.includes('biblijneuwielbienie') || url.includes('karaoke') || icon === 'worship' || icon === 'music') {
      return 'biblia_spiewana';
    }
    if (url.includes('cctv24-worship') || url.includes('bcm24') || url.includes('modlitwa') || url.includes('zapolske') || icon === 'moon' || icon === 'pray') {
      return 'instrumental_worship';
    }
    if (url.includes('werset-dnia') || url.includes('kurscodzienny') || url.includes('biblia-do-pobrania') || title.includes('biblia audio') || title.includes('rozważanie')) {
      return 'biblia_audio';
    }
    if (url.includes('/player') || url.includes('/podcasty') || url.includes('apokalipsa') || url.includes('/vod') || url.includes('/shorts') || ['radio', 'mic', 'volume', 'play', 'tv', 'film', 'video', 'sun'].includes(icon)) {
      return 'poland';
    }
    return '';
  }

  function loadOmniExternalScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function syncFeaturedStreamUI(st) {
    const state = st || (typeof window !== 'undefined' && window.CCChatRadio && typeof window.CCChatRadio.state === 'function'
      ? window.CCChatRadio.state()
      : { playing: false, stationId: '' });
    const isPlaying = !!state.playing;
    const currentStation = state.stationId || 'poland';

    const radioBtn = typeof document !== 'undefined' ? document.getElementById('ccOmniRadio') : null;
    if (radioBtn) {
      radioBtn.setAttribute('aria-pressed', String(isPlaying));
      radioBtn.setAttribute('aria-label', isPlaying ? 'Zatrzymaj Radio Christian Culture' : 'Słuchaj Radia Christian Culture');
    }

    if (typeof document === 'undefined') return;
    const listenBtns = document.querySelectorAll('.cc-omni-feat-listen-btn');
    listenBtns.forEach((btn) => {
      const btnStation = btn.getAttribute('data-feat-stream') || '';
      const activeForCard = isPlaying && btnStation === currentStation;
      btn.classList.toggle('is-playing', activeForCard);
      btn.setAttribute('aria-pressed', String(activeForCard));
      const ico = btn.querySelector('.cc-feat-listen-ico');
      const txt = btn.querySelector('.cc-feat-listen-txt');
      if (ico) ico.textContent = activeForCard ? '⏸' : '▶';
      if (txt) txt.textContent = activeForCard ? 'Odtwarzanie • Stop' : 'Słuchaj teraz';
    });

    const streamBar = document.getElementById('ccOmniStreamBar');
    if (streamBar) {
      streamBar.classList.toggle('is-playing', isPlaying);
      const barTitle = streamBar.querySelector('.cc-omni-stream-bar-title');
      if (barTitle && isPlaying) {
        const stName = OMNI_STATION_NAMES[currentStation] || 'Radio Christian Culture';
        barTitle.textContent = activeStreamCardTitle
          ? `${stName} — ${activeStreamCardTitle}`
          : stName;
      }
      streamBar.querySelectorAll('.cc-omni-stream-station-btn').forEach((sBtn) => {
        const sId = sBtn.getAttribute('data-feat-station-switch');
        sBtn.classList.toggle('active', isPlaying && sId === currentStation);
      });
    }
  }

  function ensureOmniRadio() {
    if (omniRadioReady) return omniRadioReady;
    omniRadioReady = (async () => {
      if (!window.CCRadioStations) await loadOmniExternalScript('/js/cc-radio-catalog.js?v=20261025_repertoire');
      if (!window.CCChatRadio) await loadOmniExternalScript('/js/cc-chat-radio.js?v=20261026_spectrum1');
      if (!window.CCRadioMilion) await loadOmniExternalScript('/js/cc-radio-milion.js?v=20261011_2');
      window.CCChatRadio.subscribe((st) => {
        syncFeaturedStreamUI(st);
      });
      syncFeaturedStreamUI(window.CCChatRadio.state());
      return window.CCChatRadio;
    })();
    return omniRadioReady;
  }

  async function toggleFeaturedStream(stationId, streamTitle = '', triggerBtn = null, forcePlay = false) {
    if (triggerBtn) triggerBtn.classList.add('cc-loading');
    try {
      const radio = await ensureOmniRadio();
      const st = radio.state();
      if (!forcePlay && st.playing && st.stationId === stationId) {
        radio.pause();
      } else {
        activeStreamCardTitle = streamTitle || OMNI_STATION_NAMES[stationId] || '';
        await radio.prepare(stationId);
        radio.select(stationId);
        await radio.play();
      }
      syncFeaturedStreamUI(radio.state());
    } catch (_) {
      omniRadioReady = null;
    } finally {
      if (triggerBtn) triggerBtn.classList.remove('cc-loading');
    }
  }

  const CANONICAL_FEATURED_CARDS = [
    {
      tag: 'INSPIRACJA NA DZIŚ',
      title: 'Rozważanie „Dobrze, że jesteś”',
      desc: 'Codzienne słowo umocnienia, modlitwa i Boży pokój na każdy dzień.',
      url: '/player',
      icon: 'heart'
    },
    {
      tag: 'AKADEMIA BIBLIJNA',
      title: 'Lekcja Dnia: Z Biblią za Pan Brat',
      desc: 'Codzienne studium Pisma Świętego werset po wersecie z komentarzem.',
      url: '/akademia#kurscodzienny',
      icon: 'book'
    },
    {
      tag: 'PODCAST SPOTIFY SDS',
      title: 'APOKALIPSA — Księga Nadziei',
      desc: 'Profetyczny cykl wykładów biblijnych Studia Dobrego Słowa.',
      url: '/player#apokalipsa',
      icon: 'mic'
    },
    {
      tag: 'NADAJEMY 24/7',
      title: 'Radio Christian Culture & Player',
      desc: 'Muzyka uwielbienia, słuchowiska Biblia Audio i stacje tematyczne.',
      url: '/player',
      icon: 'radio'
    }
  ];

  function getFeaturedCardData(slotIdx, setIdx) {
    if (setIdx === 0) {
      return CANONICAL_FEATURED_CARDS[slotIdx] || CANONICAL_FEATURED_CARDS[0];
    }
    const pool = FEATURED_POOLS[slotIdx] || [];
    return pool[setIdx % pool.length];
  }

  function rotateFeaturedCards(targetSet = null) {
    const grid = document.querySelector('.cc-omni-featured-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.cc-omni-feat-card');
    if (cards.length < 4) return;

    const totalSets = FEATURED_MODES.length;
    const nextSet = (targetSet !== null)
      ? ((targetSet % totalSets) + totalSets) % totalSets
      : (activeFeaturedSet + 1) % totalSets;
    activeFeaturedSet = nextSet;

    // Aktualizacja kapsułek wskaźnika (dots)
    const dots = document.querySelectorAll('.cc-omni-feat-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === nextSet);
      dot.setAttribute('aria-current', idx === nextSet ? 'true' : 'false');
    });

    // Aktualizacja przycisków trybów tematycznych
    const modeBtns = document.querySelectorAll('.cc-omni-feat-mode-btn');
    modeBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === nextSet);
      btn.setAttribute('aria-selected', idx === nextSet ? 'true' : 'false');
    });

    // Aktualizacja pigułki kontekstu w nagłówku
    const contextPill = document.getElementById('ccOmniContextPill');
    if (contextPill) {
      const smart = getSmartContextInfo();
      const modeObj = FEATURED_MODES[nextSet] || FEATURED_MODES[0];
      contextPill.textContent = nextSet === 0
        ? smart.pillText
        : `${nextSet + 1}/${totalSets} • ${modeObj.fullLabel}`;
    }

    // Wielostopniowa kaskada 3D ze złotym połyskiem (stagger 95ms między okienkami)
    cards.forEach((card, slotIdx) => {
      setTimeout(() => {
        card.classList.remove('cc-card-entering');
        card.classList.add('cc-card-updating');
        setTimeout(() => {
          const item = getFeaturedCardData(slotIdx, nextSet);
          if (!item) return;
          card.href = item.url;
          const iconSpan = card.querySelector('.cc-omni-feat-icon');
          const tagSpan = card.querySelector('.cc-omni-feat-tag');
          const badgeSpan = card.querySelector('.cc-omni-feat-badge');
          const titleEl = card.querySelector('.cc-omni-feat-title');
          const descSpan = card.querySelector('.cc-omni-feat-desc');
          const actionsSpan = card.querySelector('.cc-omni-feat-actions');
          const listenBtn = card.querySelector('.cc-omni-feat-listen-btn');

          if (iconSpan) iconSpan.innerHTML = svgIcon(item.icon || 'star', 20);
          if (tagSpan) tagSpan.textContent = item.tag || '';
          if (badgeSpan) {
            badgeSpan.textContent = item.badge || 'POLECANE';
            badgeSpan.style.display = item.badge ? 'inline-flex' : 'none';
          }
          if (titleEl) titleEl.textContent = item.title || '';
          if (descSpan) descSpan.textContent = item.desc || '';

          const streamId = resolveCardStream(item);
          if (actionsSpan && listenBtn) {
            if (streamId) {
              actionsSpan.style.display = 'flex';
              listenBtn.setAttribute('data-feat-stream', streamId);
              listenBtn.setAttribute('data-feat-stream-title', item.title || '');
            } else {
              actionsSpan.style.display = 'none';
              listenBtn.setAttribute('data-feat-stream', '');
            }
          }
          syncFeaturedStreamUI();

          card.classList.remove('cc-card-updating');
          card.classList.add('cc-card-entering');
          setTimeout(() => {
            card.classList.remove('cc-card-entering');
          }, 680);
        }, 185);
      }, slotIdx * 95);
    });
  }

  function startFeaturedRotation() {
    stopFeaturedRotation();
    if (typeof window === 'undefined') return;
    featuredRotationTimer = setInterval(() => {
      const radioPlaying = !!(window.CCChatRadio && typeof window.CCChatRadio.state === 'function' && window.CCChatRadio.state().playing);
      if (isFeaturedHovered || radioPlaying || (typeof document !== 'undefined' && document.hidden)) return;
      rotateFeaturedCards();
    }, 5600);
  }

  function stopFeaturedRotation() {
    if (featuredRotationTimer) {
      clearInterval(featuredRotationTimer);
      featuredRotationTimer = null;
    }
  }

  function renderHome() {
    // 1. Ostatnie wyszukiwania użytkownika
    const recents = getRecentSearches();
    const recentsHtml = recents.length ? `
      <div class="cc-omni-recents-bar" role="region" aria-label="Ostatnie wyszukiwania">
        <div class="cc-omni-recents-header">
          <span class="cc-omni-recents-title">${svgIcon('clock', 14)} Ostatnie wyszukiwania</span>
          <button type="button" class="cc-omni-recents-clear" data-omni-action="clear-recents" title="Wyczyść historię wyszukiwania">Wyczyść historię</button>
        </div>
        <div class="cc-omni-recents-pills">
          ${recents.map(r => `
            <span class="cc-omni-recent-pill">
              <button type="button" class="cc-omni-recent-query" data-search-query="${escapeHtml(r)}">${escapeHtml(r)}</button>
              <button type="button" class="cc-omni-recent-del" data-remove-query="${escapeHtml(r)}" aria-label="Usuń ${escapeHtml(r)} z historii">×</button>
            </span>
          `).join('')}
        </div>
      </div>` : '';

    // 2. Popularne tematy / szybkie tagi
    const tags = [
      { label: '#Apokalipsa', query: 'Apokalipsa' },
      { label: '#KursCodzienny', query: 'Kurs Codzienny' },
      { label: '#WersetDnia', query: 'Werset Dnia' },
      { label: '#DobrzeŻeJesteś', query: 'Dobrze, że jesteś' },
      { label: '#Radio24/7', query: 'Radio CC' },
      { label: '#Lumina', query: 'LUMINA' },
      { label: '#Wizytówki', query: 'Wizytówki' },
      { label: '#Modlitwa', query: 'Modlitwa' },
      { label: '#Pomoc', query: 'Pomoc' }
    ];
    const tagsHtml = `
      <div class="cc-omni-tags-bar" role="navigation" aria-label="Popularne tematy">
        <span class="cc-omni-tags-label">${svgIcon('sparkle', 14)} Popularne tematy:</span>
        <div class="cc-omni-tags-list">
          ${tags.map(t => `<button type="button" class="cc-omni-tag-chip" data-search-query="${escapeHtml(t.query)}">${escapeHtml(t.label)}</button>`).join('')}
        </div>
      </div>`;

    // 3. 4 Kluczowe Okna Ekosystemu („POLECANE NA DZIŚ” — Kaskadowa Auto-Promocja Premium)
    const smartContext = getSmartContextInfo();
    const initialCards = [
      getFeaturedCardData(0, activeFeaturedSet),
      getFeaturedCardData(1, activeFeaturedSet),
      getFeaturedCardData(2, activeFeaturedSet),
      getFeaturedCardData(3, activeFeaturedSet)
    ];
    const activeModeObj = FEATURED_MODES[activeFeaturedSet] || FEATURED_MODES[0];
    const initialContextText = activeFeaturedSet === 0
      ? smartContext.pillText
      : `${activeFeaturedSet + 1}/${FEATURED_MODES.length} • ${activeModeObj.fullLabel}`;

    const featuredCards = `
      <section class="cc-omni-featured-section" aria-label="Polecane dziś w EkoCC">
        <div class="cc-omni-featured-head">
          <div class="cc-omni-featured-title-wrap">
            <span class="cc-omni-featured-label">
              ☆ POLECANE DZIŚ W EKOCC
            </span>
          </div>
        </div>
        <div class="cc-omni-featured-grid">
          ${initialCards.map((card, i) => `
            <a class="cc-omni-feat-card" href="${escapeHtml(card.url)}" data-slot-index="${i}">
              <span class="cc-omni-feat-icon">${svgIcon(card.icon, 20)}</span>
              <span class="cc-omni-feat-info">
                <span class="cc-omni-feat-tag">${escapeHtml(card.tag)}</span>
                <strong class="cc-omni-feat-title">${escapeHtml(card.title)}</strong>
                <span class="cc-omni-feat-desc">${escapeHtml(card.desc)}</span>
              </span>
              <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
            </a>`).join('')}
        </div>
      </section>`;

    // 4. Skróty do aplikacji
    const shortcuts = '<nav class="cc-omni-shortcuts" aria-label="Skróty ekosystemu">' + HOME_SHORTCUTS.map(sc => sc.action
      ? `<button type="button" class="cc-omni-shortcut" data-omni-action="${sc.action}" aria-expanded="false" aria-controls="ccOmniFavs"><span>${svgIcon(sc.icon)}</span><span>${escapeHtml(sc.label)}</span></button>`
      : `<a class="cc-omni-shortcut" href="${sc.url}"${sc.external ? ' target="_blank" rel="noopener"' : ''}><span>${svgIcon(sc.icon)}</span><span>${escapeHtml(sc.label)}</span></a>`).join('') + '</nav>';

    // 5. Ulubione
    let favs = [];
    try { favs = JSON.parse(localStorage.getItem('cc_user_favorites') || '[]'); } catch (_) {}
    favs = (Array.isArray(favs) ? favs : []).filter(f => f && f.url && f.title).slice(0, 8);
    const favList = favs.length
      ? `<div class="cc-omni-continue-list">${favs.map(f => `<a class="cc-omni-continue-item" href="${escapeHtml(f.url)}"><span>${escapeHtml(f.icon || '★')}</span><span><b>${escapeHtml(f.title)}</b><small>${escapeHtml(f.category || 'Ulubione')}</small></span></a>`).join('')}</div>`
      : '<p class="cc-omni-favs-empty">Nie masz jeszcze ulubionych. Na dowolnej stronie Christian Culture kliknij gwiazdkę ☆, a strona pojawi się tutaj.</p>';
    const favSection = `
      <section class="cc-omni-continue" id="ccOmniFavs" aria-label="Ulubione" hidden>
        <div class="cc-omni-continue-head">${svgIcon('star', 16)}<span>Twoje ulubione</span></div>
        ${favList}
      </section>`;

    // 6. Ostatnio odwiedzane
    let history = [];
    try { history = JSON.parse(localStorage.getItem('cc_user_visit_history') || '[]'); } catch (_) {}
    history = (Array.isArray(history) ? history : []).filter(h => h && h.url && h.title && h.url !== location.pathname).slice(0, 4);
    const cont = history.length ? `
      <section class="cc-omni-continue" aria-label="Kontynuuj">
        <div class="cc-omni-continue-head">${svgIcon('clock', 16)}<span>Ostatnio odwiedzane</span></div>
        <div class="cc-omni-continue-list">${history.map(h => `<a class="cc-omni-continue-item" href="${escapeHtml(h.url)}"><span>${escapeHtml(h.icon || '✨')}</span><span><b>${escapeHtml(h.title)}</b><small>${escapeHtml(visitedLabel(h.visitedAt))}</small></span></a>`).join('')}</div>
      </section>` : '';

    // 7. Podpowiedzi klawiszowe (Raycast / Spotlight style)
    const proHelper = `
      <div class="cc-omni-pro-shortcuts" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> Nawiguj</span>
        <span><kbd>↵ Enter</kbd> Wybierz</span>
        <span><kbd>Esc</kbd> Zamknij</span>
        <span><kbd>Ctrl+K</kbd> / <kbd>/</kbd> Szukaj</span>
      </div>`;

    return '<div class="cc-omni-home">' + recentsHtml + tagsHtml + featuredCards + shortcuts + favSection + cont + proHelper + '</div>';
  }

  // 8. Otwieranie i zamykanie wyszukiwarki
  function openSearch(initialQuery = '') {
    startFeaturedRotation();
    if (isSearchPage) {
      // Jeśli jesteśmy na stronie /szukaj, skupiamy dedykowane pole
      const searchPageInput = document.getElementById('q') || document.querySelector('input[name="q"]');
      if (searchPageInput) {
        searchPageInput.focus();
        if (initialQuery) {
          searchPageInput.value = initialQuery;
          searchPageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      return;
    }

    mountModal();
    const overlay = document.getElementById('ccOmniOverlay');
    const input = document.getElementById('ccOmniInput');

    loadCatalog().then(() => {
      renderResults(initialQuery || (input ? input.value : ''), activeFilter);
    });

    overlay.classList.add('cc-open');
    document.body.style.overflow = 'hidden';

    if (input) {
      if (initialQuery) {
        input.value = initialQuery;
        const clearBtn = document.getElementById('ccOmniClear');
        if (clearBtn) clearBtn.style.display = 'inline-flex';
      }
      startPlaceholderRotation(input);
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    }
  }

  function closeSearch() {
    stopFeaturedRotation();
    closeShareModal();
    stopBibleAudio();
    stopPlaceholderRotation();
    const overlay = document.getElementById('ccOmniOverlay');
    if (!overlay) return;
    if (isStandalonePage) {
      // Na własnym adresie zamknięcie wraca do poprzedniej strony CC albo na stronę główną
      const fromCC = !!document.referrer && new URL(document.referrer).origin === location.origin;
      if (fromCC && history.length > 1) history.back(); else location.href = '/';
      return;
    }
    overlay.classList.remove('cc-open');
    document.body.style.overflow = '';
  }

  function toggleSearch() {
    const overlay = document.getElementById('ccOmniOverlay');
    if (overlay && overlay.classList.contains('cc-open')) {
      closeSearch();
    } else {
      openSearch();
    }
  }

  // 9. Automatyczne podpinanie wszystkich lup i pól wyszukiwania w DOM
  function wireDomSearchElements() {
    // A. Skróty klawiszowe Ctrl+K oraz /
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        e.preventDefault();
        openSearch();
      }
    });

    // B. Przechwytywanie kliknięć we wszystkie elementy wyszukiwania
    document.addEventListener('click', (e) => {
      // Sprawdź czy kliknięto w ikonę lupy, przycisk lub pole z atrybutem
      const searchTarget = e.target.closest([
        '[data-cc-search]',
        '[data-action="search"]',
        '.fa-magnifying-glass',
        '.fa-search',
        '.search-icon',
        '.nav-search-icon',
        '.mapa-search-icon',
        '.mobile-nav-search-btn',
        '#mobileNavSearchBtn',
        '.btn-omni-action',
        'a[href*="/szukaj"]'
      ].join(', '));

      if (searchTarget) {
        // Jeśli kliknięto bezpośredni link do /szukaj z prawego przycisku lub ctrl, nie blokujemy
        if (searchTarget.tagName === 'A' && (e.ctrlKey || e.metaKey || e.shiftKey)) return;

        // Jeśli kliknięto wewnątrz formularza MojaBiblia na mojabiblia.html do lokalnego szukania
        if (searchTarget.closest('#mbSearchForm') || searchTarget.classList.contains('mb-search-btn')) {
          // Pozwalamy lokalnemu skryptowi MojaBiblia obsłużyć jeśli pole nie jest puste
          const mbInput = document.getElementById('mbSearchInput');
          if (mbInput && mbInput.value.trim().length > 0) return;
        }

        e.preventDefault();
        openSearch();
      }
    }, true);

    // C. Jeśli na stronie jest element #menuCcSearchInput (np. w index.html), podepnij go
    const menuInput = document.getElementById('menuCcSearchInput');
    if (menuInput) {
      menuInput.addEventListener('focus', () => {
        // Wstępne załadowanie katalogu w tle dla natychmiastowej responsywności
        loadCatalog();
      });
      menuInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          openSearch(menuInput.value);
        }
      });
    }

    // D. Podpięcie paska odtwarzacza (player.html)
    const playerInput = document.getElementById('searchInput');
    if (playerInput) {
      playerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = playerInput.value.trim();
          if (val) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // E. Podpięcie paska LUMINA (lumina.html)
    const luminaInput = document.getElementById('omniSearchInput');
    if (luminaInput) {
      luminaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = luminaInput.value.trim();
          if (val && !val.startsWith('@') && !val.startsWith('#')) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // F. Podpięcie paska VOD (vod.html)
    const vodInput = document.getElementById('netflixSearchInput');
    if (vodInput) {
      vodInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = vodInput.value.trim();
          if (val) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // G. Wstępne załadowanie katalogu przy bezczynności przeglądarki
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadCatalog(), { timeout: 3000 });
    } else {
      setTimeout(() => loadCatalog(), 1500);
    }
  }

  // 10. Eksport do przestrzeni globalnej
  window.CCOmniSearch = {
    open: openSearch,
    close: closeSearch,
    toggle: toggleSearch,
    loadCatalog: loadCatalog,
    publicationTime: publicationTime,
    performSearch: performSearch,
    getRecentSearches: getRecentSearches,
    saveRecentSearch: saveRecentSearch,
    removeRecentSearch: removeRecentSearch,
    clearRecentSearches: clearRecentSearches,
    parseBibleRef: parseBibleRef,
    detectHopeIntent: detectHopeIntent,
    detectBibleTopic: detectBibleTopic,
    BIBLE_TOPICS: BIBLE_TOPICS,
    TOP_LEMMAS: TOP_LEMMAS,
    detectStrongOrLemma: detectStrongOrLemma,
    TOP_CROSS_REFS: TOP_CROSS_REFS,
    TOP_INTERLINEAR_TOKENS: TOP_INTERLINEAR_TOKENS,
    BIBLE_PLACES: BIBLE_PLACES,
    detectBiblePlace: detectBiblePlace,
    renderPlaceCard: renderPlaceCard,
    TOP_COMPARE_VERSES: TOP_COMPARE_VERSES,
    verifyBibleQuote: verifyBibleQuote,
    renderComparePanel: renderComparePanel,
    renderQuoteVerificationCard: renderQuoteVerificationCard,
    renderBibleTopicCard: renderBibleTopicCard,
    detectBibleRagQuery: detectBibleRagQuery,
    queryKnowledgeRegistryClient: queryKnowledgeRegistryClient,
    renderBibleRagCard: renderBibleRagCard,
    BIBLE_RAG_REGISTRY: BIBLE_RAG_REGISTRY,
    PRESET_WALLS: PRESET_WALLS,
    openWallpaperModal: openWallpaperModal,
    closeWallpaperModal: closeWallpaperModal,
    renderWallpaperGrid: renderWallpaperGrid,
    drawBibleShareCard: drawBibleShareCard,
    openShareModal: openShareModal,
    closeShareModal: closeShareModal,
    playBibleAudio: playBibleAudio,
    stopBibleAudio: stopBibleAudio,
    toggleBibleAudio: toggleBibleAudio,
    renderScriptureAudioBar: renderScriptureAudioBar,
    getAudioState: () => currentAudioState,
    getPreviewHtml: getPreviewHtml,
    TOP_UBG_VERSES: TOP_UBG_VERSES,
    PLACEHOLDERS: PLACEHOLDERS,
    startPlaceholderRotation: startPlaceholderRotation,
    stopPlaceholderRotation: stopPlaceholderRotation,
    detectTypoCorrection: detectTypoCorrection,
    CANONICAL_WORDS: CANONICAL_WORDS
  };

  // Uruchomienie po załadowaniu DOM
  const startPage = () => {
    wireDomSearchElements();
    if (isStandalonePage) {
      const q = new URLSearchParams(location.search).get('q') || '';
      // Wyszukiwarka domyślna przeglądarki w trybie Google: od razu wyniki z całego internetu
      if (q && searchEngine === 'google') { location.replace(googleUrl(q)); return; }
      openSearch(q);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPage);
  } else {
    startPage();
  }

})();
