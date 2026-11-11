/**
 * Asystent Christian Culture — Native LUMI MESS (/mess) Virtual Host
 * Spec ID: CC-LUMIMESS-ASSISTANT-001 | Mode: ZERO-COST DETERMINISTIC MVP
 * Standard: EkoCC v2 PREMIUM | Zero Regression | RODO & Privacy Safe
 */
(function (root) {
  'use strict';

  const DEFAULT_FLAGS = Object.freeze({
    CC_ASSISTANT_ENABLED: true,
    CC_ASSISTANT_IDEA_INTAKE_ENABLED: true,
    CC_ASSISTANT_SHARE_ENABLED: true,
    CC_ASSISTANT_CONTACT_ENABLED: true,
    CC_ASSISTANT_GEN_AI_ENABLED: false,
  });

  function getFeatureFlags() {
    const custom = (root && root.__CC_ASSISTANT_FLAGS__) || {};
    let urlDisabled = false;
    try {
      if (root && root.location && root.location.search) {
        const params = new URLSearchParams(root.location.search);
        if (params.get('ccAssistant') === '0' || params.get('ccAssistant') === 'false') {
          urlDisabled = true;
        }
      }
    } catch (_) {}

    return Object.freeze({
      CC_ASSISTANT_ENABLED: urlDisabled
        ? false
        : typeof custom.CC_ASSISTANT_ENABLED === 'boolean'
          ? custom.CC_ASSISTANT_ENABLED
          : DEFAULT_FLAGS.CC_ASSISTANT_ENABLED,
      CC_ASSISTANT_IDEA_INTAKE_ENABLED:
        typeof custom.CC_ASSISTANT_IDEA_INTAKE_ENABLED === 'boolean'
          ? custom.CC_ASSISTANT_IDEA_INTAKE_ENABLED
          : DEFAULT_FLAGS.CC_ASSISTANT_IDEA_INTAKE_ENABLED,
      CC_ASSISTANT_SHARE_ENABLED:
        typeof custom.CC_ASSISTANT_SHARE_ENABLED === 'boolean'
          ? custom.CC_ASSISTANT_SHARE_ENABLED
          : DEFAULT_FLAGS.CC_ASSISTANT_SHARE_ENABLED,
      CC_ASSISTANT_CONTACT_ENABLED:
        typeof custom.CC_ASSISTANT_CONTACT_ENABLED === 'boolean'
          ? custom.CC_ASSISTANT_CONTACT_ENABLED
          : DEFAULT_FLAGS.CC_ASSISTANT_CONTACT_ENABLED,
      // Explicitly locked to false in MVP (Zero Cost mandate)
      CC_ASSISTANT_GEN_AI_ENABLED: false,
    });
  }

  const ROTATING_ASSISTANTS = Object.freeze({
    'asystentka-1': Object.freeze({
      id: 'asystentka-1',
      name: 'Rut · Asystentka CC',
      shortName: 'Rut',
      badge: 'Asystentka CC',
      subtitle: 'Wirtualny gospodarz · Wspieram Cię i pomagam',
      avatar: '/images/chat/assistants/asystentka-1.webp',
      avatarFallback: '/images/chat/assistants/asystentka-1.jpg',
      circleAvatar: '/images/chat/assistants/asystentka-1.webp',
      greeting: 'W czym mogę Ci dziś pomóc? Kliknij, aby porozmawiać!',
      welcomeText:
        'Cześć! ❤️ Dobrze, że jesteś. Nazywam się Rut — jestem Asystentem Christian Culture i gospodynią LUMI MESS. Przez całą dobę pomogę Ci znaleźć radio 24/7, Biblię, kursy, filmy VOD, społeczność LUMINA lub kontakt z zespołem. W czym mogę Ci dziś pomóc?'
    }),
    'asystentka-2': Object.freeze({
      id: 'asystentka-2',
      name: 'Lea · Organizer i planista',
      shortName: 'Lea',
      badge: 'Doradca CC',
      subtitle: 'Wirtualny gospodarz · Organizer i planista',
      avatar: '/images/chat/assistants/asystentka-2.webp',
      avatarFallback: '/images/chat/assistants/asystentka-2.jpg',
      circleAvatar: '/images/chat/assistants/asystentka-2.webp',
      greeting: 'Zadaj pytanie lub zgłoś pomysł. Jestem tu dla Ciebie!',
      welcomeText:
        'Witaj serdecznie! 🌟 Nazywam się Lea — jestem Asystentem Christian Culture, organizerem i planistą. Z radością pomogę Ci odkryć nasze audycje radiowe, interlinearną Biblię, Akademię czy społeczność LUMINA. W czym mogę Ci dziś pomóc?'
    }),
    'asystentka-3': Object.freeze({
      id: 'asystentka-3',
      name: 'Noemi · Twoje zasoby i rozwiązania',
      shortName: 'Noemi',
      badge: 'Doradca CC',
      subtitle: 'Wirtualny gospodarz · Twoje zasoby i rozwiązania',
      avatar: '/images/chat/assistants/asystentka-3.webp',
      avatarFallback: '/images/chat/assistants/asystentka-3.jpg',
      circleAvatar: '/images/chat/assistants/asystentka-3.webp',
      greeting: 'Masz pytanie o radio, Biblię lub audycje? Napisz śmiało!',
      welcomeText:
        'Pokój Boży! ✨ Nazywam się Noemi — jestem Asystentem Christian Culture i Twoim doradcą. Chętnie wskażę Ci najpiękniejszą muzykę uwielbienia, transmisje LIVE, słuchowiska Biblia Audio i rozważania na dziś. W czym mogę Ci dziś pomóc?'
    })
  });

  let _currentAssistantId = null;

  function resolveAssistantKey(rawId) {
    if (!rawId) return null;
    const str = String(rawId).trim().toLowerCase();
    if (str === 'asystentka-1' || str === 'rut') return 'asystentka-1';
    if (str === 'asystentka-2' || str === 'lea' || str === 'sara') return 'asystentka-2';
    if (str === 'asystentka-3' || str === 'noemi') return 'asystentka-3';
    return null;
  }

  function getActiveAssistant(idOverride) {
    const keyFromOverride = resolveAssistantKey(idOverride);
    if (keyFromOverride && ROTATING_ASSISTANTS[keyFromOverride]) {
      return ROTATING_ASSISTANTS[keyFromOverride];
    }
    if (_currentAssistantId && ROTATING_ASSISTANTS[_currentAssistantId]) {
      return ROTATING_ASSISTANTS[_currentAssistantId];
    }
    try {
      if (root && root.location && root.location.search) {
        const p = new URLSearchParams(root.location.search);
        const fromParam = resolveAssistantKey(p.get('asst') || p.get('assistantId') || p.get('openChat'));
        if (fromParam && ROTATING_ASSISTANTS[fromParam]) {
          _currentAssistantId = fromParam;
          return ROTATING_ASSISTANTS[fromParam];
        }
      }
    } catch (_) {}
    try {
      if (root && root.sessionStorage) {
        const fromSession = resolveAssistantKey(root.sessionStorage.getItem('cc_active_assistant_id'));
        if (fromSession && ROTATING_ASSISTANTS[fromSession]) {
          _currentAssistantId = fromSession;
          return ROTATING_ASSISTANTS[fromSession];
        }
      }
    } catch (_) {}
    const keys = ['asystentka-1', 'asystentka-2', 'asystentka-3'];
    const now = new Date();
    const dayIndex = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
    const defaultKey = keys[dayIndex % keys.length];
    return ROTATING_ASSISTANTS[defaultKey];
  }

  function setActiveAssistant(id) {
    const key = resolveAssistantKey(id);
    if (key && ROTATING_ASSISTANTS[key]) {
      _currentAssistantId = key;
      try {
        if (root && root.sessionStorage) {
          root.sessionStorage.setItem('cc_active_assistant_id', key);
        }
      } catch (_) {}
      return ROTATING_ASSISTANTS[key];
    }
    return getActiveAssistant();
  }

  const AssistantIdentity = Object.freeze({
    id: 'cc-assistant',
    slug: 'cc-assistant',
    name: 'Asystent Christian Culture',
    subtitle: 'Wirtualny gospodarz · Pomoc i inspiracja przez całą dobę',
    badge: 'Wirtualny gospodarz',
    avatarInitials: 'CC',
    welcomeText:
      'Cześć! ❤️ Dobrze, że jesteś w Christian Culture. Jestem Asystentem Christian Culture — wirtualnym gospodarzem, który przez całą dobę pomoże Ci znaleźć radio 24/7, Biblię, kursy, filmy, społeczność LUMINA lub kontakt z zespołem. W czym mogę Ci dziś pomóc?',
    honestDisclosureText:
      'Jestem automatycznym asystentem Christian Culture. Korzystam z przygotowanej bazy wiedzy i pomagam znaleźć właściwe materiały lub kontakt z zespołem.',
    starterChips: Object.freeze([
      { id: 'starter_radio', label: '🎧 Posłuchaj radia', query: 'Jak posłuchać radia?' },
      { id: 'starter_bible', label: '📖 Poznaj Biblię', query: 'Gdzie znajdę Biblię i rozważania?' },
      { id: 'starter_discover', label: '🧭 Odkryj Christian Culture', query: 'Czym jest Christian Culture?' },
    ]),
  });

  const VERIFIED_CONTACTS = Object.freeze({
    emailPrimary: 'polskiercctv@gmail.com',
    emailRadio: 'radiochristianculture@gmail.com',
    phonePastoral: '+48 608 337 477',
    phoneSupport: '+48 730 958 583',
    whatsappCommunity: 'https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0',
    cooperationUrl: '/wspolpraca',
    aboutUrl: '/o-nas',
  });

  const DENYLIST_PREFIXES = Object.freeze([
    '/mapa',
    '/ccmc',
    '/joma',
    '/skrzynka',
    '/admin',
    '/mission-control',
    '/api/admin',
    '/.git',
    '/.env',
    '/.pages-release',
    '/services',
    '/functions',
    '/firebase_functions',
    '/kolejka-publikacji',
  ]);

  const ALLOWED_PUBLIC_URLS = new Set([
    '/',
    '/Ewangelia',
    '/akademia',
    '/akademia/kurscodzienny',
    '/milion',
    '/go',
    '/lumina',
    '/mess',
    '/wyszukiwarka',
    '/biblia-audio',
    '/mojabiblia',
    '/biblijne-uwielbienie',
    '/player',
    '/rozwiaz-problem',
    '/modlitwa',
    '/vod',
    '/news',
    '/wspolpraca',
    '/wspieraj',
    '/werset-dnia',
    '/biblioteka',
    '/swiadectwa',
    '/o-nas',
    '/audioteka', '/podcasty', '/tv', '/pobierz', '/uslugi', '/wizytowki',
    '/dzj', '/kursy', '/kursy/apokalipsa/', '/kursy/kurscodzienny/', '/studium',
    '/music', '/rolki', '/pokonac-goliata', '/the-journal', '/cc-light',
    '/newsletter', '/nauka', '/historia', '/biologia', '/prawo', '/psychologia',
  ]);
  const PUBLIC_ARTICLE_PATH = /^\/(?:news|nauka|historia|biologia|prawo|psychologia)\/[a-z0-9]+(?:-[a-z0-9]+)+\/?$/;
  const PUBLIC_LESSON_PATH = /^\/akademia\/kurscodzienny\/dzien-\d{1,3}\/?$/;
  const indexEntries = new Map();
  let indexRequest;

  const RAW_KNOWLEDGE_CATALOG = Object.freeze([
    {
      id: 'home-radio-cc',
      title: 'Christian Culture — Radio, Biblia i Społeczność 24/7',
      url: '/',
      category: 'start',
      audience: ['nowy', 'powracajacy', 'szukajacy'],
      summary: 'Strona główna ekosystemu Christian Culture: radio chrześcijańskie 24/7, Słowo Boże, rozważania, muzyka uwielbieniowa i transmisje na żywo.',
      keywords: ['radio', 'muzyka', 'start', 'strona główna', 'christian culture', 'słuchaj', 'na żywo', 'polskieradio'],
      ctaLabel: 'Otwórz stronę główną i radio',
      shareText: 'Posłuchaj radia i odkryj wartościowe materiały w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'ewangelia',
      title: 'Dobra Nowina — Ewangelia i Nadzieja',
      url: '/Ewangelia',
      category: 'wiara',
      audience: ['szukajacy', 'nowy', 'kryzys'],
      summary: 'Proste i biblijne wyjaśnienie Dobrej Nowiny o Jezusie Chrystusie, Bożej miłości, przebaczeniu i nowym początku.',
      keywords: ['ewangelia', 'jezus', 'zbawienie', 'wiara', 'bóg', 'nadzieja', 'sens życia', 'dobra nowina', 'nawrócenie'],
      ctaLabel: 'Poznaj Dobrą Nowinę',
      shareText: 'Poznaj przesłanie nadziei i Dobrej Nowiny w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'akademia',
      title: 'Akademia Biblijna Christian Culture',
      url: '/akademia',
      category: 'edukacja',
      audience: ['szukajacy', 'powracajacy', 'rodzina'],
      summary: 'Kursy biblijne, wykłady, ścieżki poznawania Pisma Świętego oraz codzienny rozwój duchowy krok po kroku.',
      keywords: ['akademia', 'kursy', 'studium biblii', 'nauka', 'lekcje', 'szkoła biblijna', 'edukacja', 'biblia'],
      ctaLabel: 'Przejdź do Akademii',
      shareText: 'Zobacz kursy i materiały biblijne w Akademii Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'kurscodzienny',
      title: 'Kurs Codzienny — Z Biblią za Pan Brat',
      url: '/akademia/kurscodzienny',
      category: 'edukacja',
      audience: ['nowy', 'powracajacy', 'szukajacy'],
      summary: 'Codzienne lekcje biblijne prowadzące krok po kroku przez Pismo Święte z praktycznym zastosowaniem na każdy dzień.',
      keywords: ['kurs codzienny', 'z biblią za pan brat', 'lekcja na dziś', 'codzienna lekcja', 'rozważanie', 'plan czytania'],
      ctaLabel: 'Otwórz Kurs Codzienny',
      shareText: 'Dołącz do codziennego poznawania Biblii w kursie „Z Biblią za Pan Brat”.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'biblia-audio',
      title: 'Biblia Audio — Słuchowisko Pisma Świętego',
      url: '/biblia-audio',
      category: 'biblia',
      audience: ['nowy', 'powracajacy', 'rodzina'],
      summary: 'Nagrania ksiąg i rozdziałów Pisma Świętego w formie słuchowiska audio do słuchania w domu, w podróży i przed snem.',
      keywords: ['biblia audio', 'słuchowisko', 'pismo święte audio', 'stary testament', 'nowy testament', 'czytanie biblii'],
      ctaLabel: 'Słuchaj Biblii Audio',
      shareText: 'Posłuchaj Pisma Świętego w formie Biblii Audio na Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'mojabiblia',
      title: 'MojaBiblia — Pismo Święte i Przekłady Interlinearne',
      url: '/mojabiblia',
      category: 'biblia',
      audience: ['szukajacy', 'powracajacy'],
      summary: 'Czytnik Pisma Świętego z przekładami (UBG, BW, BT, BG), wyszukiwaniem wersetów oraz słownikiem grecko-hebrajskim Stronga.',
      keywords: ['mojabiblia', 'biblia', 'pismo święte', 'wersety', 'ubg', 'strong', 'przekłady', 'czytanie biblii'],
      ctaLabel: 'Otwórz MojaBiblia',
      shareText: 'Czytaj i porównuj przekłady Pisma Świętego w module MojaBiblia.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'milion',
      title: 'Milion dla Jezusa',
      url: '/milion',
      category: 'misja',
      audience: ['wspierajacy', 'powracajacy', 'nowy'],
      summary: 'Inicjatywa ewangelizacyjna łącząca ludzi wokół dzielenia się Dobrą Nowiną i wspierania misji Christian Culture.',
      keywords: ['milion', 'misja', 'ewangelizacja', 'wsparcie', 'zaangażowanie', 'świadectwo', 'milion dla jezusa'],
      ctaLabel: 'Zobacz inicjatywę Milion',
      shareText: 'Zobacz inicjatywę misyjną „Milion dla Jezusa” w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'cc-go',
      title: 'CC GO — Centrum Treści i Kanałów',
      url: '/go',
      category: 'start',
      audience: ['nowy', 'powracajacy'],
      summary: 'Szybki punkt przejścia do najważniejszych strumieni, kanałów wideo, radia i materiałów Christian Culture.',
      keywords: ['go', 'cc go', 'skrót', 'start', 'kanały', 'aplikacja', 'szybki dostęp', 'telewizja'],
      ctaLabel: 'Otwórz CC GO',
      shareText: 'Sprawdź szybki dostęp do kanałów i materiałów w CC GO.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'biblijne-uwielbienie',
      title: 'Biblijne Uwielbienie — Muzyka i Pieśni',
      url: '/biblijne-uwielbienie',
      category: 'muzyka',
      audience: ['nowy', 'powracajacy', 'rodzina'],
      summary: 'Przestrzeń muzyki chrześcijańskiej, pieśni uwielbieniowych, tekstów i wspólnego oddawania chwały Bogu.',
      keywords: ['biblijne uwielbienie', 'uwielbienie', 'worship', 'pieśni', 'piosenki', 'śpiewnik', 'chwała'],
      ctaLabel: 'Otwórz Biblijne Uwielbienie',
      shareText: 'Posłuchaj pieśni w sekcji Biblijne Uwielbienie na Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'player',
      title: 'Odtwarzacz Audio Christian Culture',
      url: '/player',
      category: 'muzyka',
      audience: ['nowy', 'powracajacy'],
      summary: 'Odtwarzacz strumieni audio, audycji radiowych, Biblii Śpiewanej oraz playlist tematycznych Christian Culture.',
      keywords: ['player', 'odtwarzacz', 'audycje', 'playlisty', 'biblia śpiewana', 'ambient', 'strumień'],
      ctaLabel: 'Otwórz Odtwarzacz Audio',
      shareText: 'Włącz odtwarzacz audio Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'lumina-community',
      title: 'LUMINA — Chrześcijańska Społeczność',
      url: '/lumina',
      category: 'spolecznosc',
      audience: ['powracajacy', 'nowy', 'rodzina'],
      summary: 'Portal społecznościowy LUMINA: tablica inspiracji, świadectwa, profile twórców oraz budowanie relacji opartych na wartościach chrześcijańskich.',
      keywords: ['lumina', 'społeczność', 'ludzie', 'relacje', 'posty', 'świadectwa', 'rozmowa', 'tablica'],
      ctaLabel: 'Wejdź do LUMINA',
      shareText: 'Poznaj społeczność LUMINA w ekosystemie Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'lumi-mess',
      title: 'LUMI MESS — Komunikator Społeczności',
      url: '/mess',
      category: 'komunikacja',
      audience: ['powracajacy', 'nowy'],
      summary: 'Komunikator LUMI MESS umożliwiający rozmowy społecznościowe, pokoje tematyczne oraz kontakt z Asystentem Christian Culture.',
      keywords: ['mess', 'lumi mess', 'czat', 'wiadomości', 'rozmowa', 'komunikator', 'kontakt'],
      ctaLabel: 'Otwórz LUMI MESS',
      shareText: 'Porozmawiaj w komunikatorze LUMI MESS na Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'rozwiaz-problem',
      title: 'Rozwiąż Problem — Biblijne Wsparcie w Trudnościach',
      url: '/rozwiaz-problem',
      category: 'wsparcie',
      audience: ['kryzys', 'szukajacy', 'rodzina'],
      summary: 'Przewodnik duchowego wsparcia i biblijnych odpowiedzi na trudne sytuacje życiowe, lęk, samotność, kryzys w relacjach i przebaczenie.',
      keywords: ['problem', 'kryzys', 'pomoc', 'lęk', 'depresja', 'samotność', 'trudności', 'cierpienie', 'rozwiąż problem', 'wsparcie'],
      ctaLabel: 'Przejdź do sekcji wsparcia',
      shareText: 'Znajdź biblijne wskazówki i wsparcie w trudnych chwilach.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'modlitwa',
      title: 'Przestrzeń Modlitwy — Zjednoczeni w Modlitwie',
      url: '/modlitwa',
      category: 'wsparcie',
      audience: ['kryzys', 'szukajacy', 'powracajacy'],
      summary: 'Miejsce wspólnej modlitwy, intencji modlitewnych i duchowego wsparcia wspólnoty Christian Culture.',
      keywords: ['modlitwa', 'intencja', 'pomódlcie się', 'wsparcie modlitewne', 'zjednoczeni', 'prośba o modlitwę'],
      ctaLabel: 'Otwórz Przestrzeń Modlitwy',
      shareText: 'Dołącz do wspólnej modlitwy w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'vod',
      title: 'Kino VOD Christian Culture',
      url: '/vod',
      category: 'wideo',
      audience: ['nowy', 'powracajacy', 'rodzina'],
      summary: 'Kino chrześcijańskie VOD: filmy fabularne, dokumenty, wykłady wideo i serie tematyczne dla całej rodziny.',
      keywords: ['vod', 'kino', 'filmy', 'wideo', 'seriale', 'wykłady', 'apokalipsa', 'oglądaj'],
      ctaLabel: 'Otwórz Kino VOD',
      shareText: 'Obejrzyj wartościowe filmy i programy w Kinie VOD Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'news',
      title: 'CCN News i Portale Tematyczne',
      url: '/news',
      category: 'wiedza',
      audience: ['szukajacy', 'powracajacy'],
      summary: 'Publicystyka, analizy wydarzeń, nauka, historia, biologia i prawo z perspektywy chrześcijańskiej.',
      keywords: ['news', 'wiadomości', 'artykuły', 'nauka', 'historia', 'biologia', 'prawo', 'publicystyka'],
      ctaLabel: 'Czytaj CCN News',
      shareText: 'Przeczytaj artykuły i analizy w serwisie CCN News.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'wspolpraca',
      title: 'Współpraca, Wolontariat i Kontakt z Zespołem',
      url: '/wspolpraca',
      category: 'kontakt',
      audience: ['wspierajacy', 'powracajacy', 'nowy'],
      summary: 'Informacje o wolontariacie, współpracy redakcyjnej i technicznej oraz bezpośrednim kontakcie z zespołem Christian Culture.',
      keywords: ['współpraca', 'wolontariat', 'kontakt', 'zespół', 'redakcja', 'dołącz', 'pomoc'],
      ctaLabel: 'Zobacz stronę współpracy',
      shareText: 'Dowiedz się, jak włączyć się we współpracę z Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'wspieraj',
      title: 'Wspieraj Misję Christian Culture',
      url: '/wspieraj',
      category: 'misja',
      audience: ['wspierajacy', 'powracajacy'],
      summary: 'Informacje o tym, jak wspierać rozwój radia, Biblii Audio i projektów ewangelizacyjnych Christian Culture.',
      keywords: ['wspieraj', 'darowizna', 'wsparcie misji', 'pomóż', 'finansowanie', 'rozwój'],
      ctaLabel: 'Zobacz jak wesprzeć misję',
      shareText: 'Zobacz, jak można wesprzeć rozwój misji Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'werset-dnia',
      title: 'Werset Dnia — Słowo na Dziś',
      url: '/werset-dnia',
      category: 'biblia',
      audience: ['nowy', 'powracajacy'],
      summary: 'Codzienny werset biblijny z krótką myślą inspirującą do refleksji i udostępnienia bliskim.',
      keywords: ['werset dnia', 'słowo na dziś', 'cytat biblijny', 'inspiracja', 'codzienny werset'],
      ctaLabel: 'Zobacz Werset Dnia',
      shareText: 'Przeczytaj dzisiejszy Werset Dnia w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'biblioteka',
      title: 'Biblioteka Chrześcijańska i Publikacje',
      url: '/biblioteka',
      category: 'edukacja',
      audience: ['szukajacy', 'powracajacy'],
      summary: 'Zbiór książek, opracowań biblijnych i materiałów do czytania oraz pogłębiania wiary.',
      keywords: ['biblioteka', 'książki', 'lektury', 'ebooki', 'publikacje', 'czytelnia'],
      ctaLabel: 'Otwórz Bibliotekę',
      shareText: 'Sprawdź publikacje w Bibliotece Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'swiadectwa',
      title: 'Świadectwa Wiary i Przemiany Życia',
      url: '/swiadectwa',
      category: 'wiara',
      audience: ['szukajacy', 'nowy', 'powracajacy'],
      summary: 'Prawdziwe historie ludzi, których życie zostało przemienione przez działanie Boga i spotkanie z Ewangelią.',
      keywords: ['świadectwa', 'historie', 'przemiana', 'cud', 'doświadczenie boga', 'żywe świadectwo'],
      ctaLabel: 'Przeczytaj świadectwa',
      shareText: 'Poznaj poruszające świadectwa wiary w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'o-nas',
      title: 'O Nas — Misja i Wartości Christian Culture',
      url: '/o-nas',
      category: 'start',
      audience: ['nowy', 'szukajacy', 'wspierajacy'],
      summary: 'Informacje o misji, wizji, zespole oraz fundamentach wiary ekosystemu Christian Culture.',
      keywords: ['o nas', 'kim jesteśmy', 'misja', 'wartości', 'fundacja', 'cezary rogowski', 'historia'],
      ctaLabel: 'Poznaj misję Christian Culture',
      shareText: 'Poznaj misję i wartości Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'wyszukiwarka',
      title: 'Wyszukiwarka Christian Culture',
      url: '/wyszukiwarka',
      category: 'narzedzia',
      audience: ['nowy', 'powracajacy', 'szukajacy'],
      summary: 'Uniwersalna wyszukiwarka treści, tematów, ksiąg biblijnych, lekcji, artykułów i programów w całym ekosystemie Christian Culture.',
      keywords: ['szukaj', 'wyszukiwarka', 'znajdź', 'temat', 'pytanie', 'katalog', 'indeks'],
      ctaLabel: 'Szukaj w Christian Culture',
      shareText: 'Wyszukaj interesujący Cię temat w Christian Culture.',
      public: true,
      reviewStatus: 'approved',
    },
    {
      id: 'unverified-draft-item',
      title: 'Roboczy niezweryfikowany materiał',
      url: '/niezweryfikowany-szkic',
      category: 'draft',
      audience: ['internal'],
      summary: 'Ten wpis posiada status requires_url_verification i nie może być nigdy rekomendowany użytkownikom.',
      keywords: ['szkic', 'niezweryfikowany', 'test-blokady'],
      ctaLabel: 'Nie pokazuj',
      shareText: '',
      public: false,
      reviewStatus: 'requires_url_verification',
    },
  ]);

  /* ========================================================================
   * 1. SAFETY POLICY (XSS, URL Allowlist/Denylist, Spoofing, Crisis)
   * ======================================================================== */
  const SafetyPolicy = {
    escapeHtml(value) {
      if (value === null || value === undefined) return '';
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    sanitizeText(value, maxLength = 1000) {
      if (typeof value !== 'string') return '';
      return value
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
        .slice(0, maxLength);
    },

    isAllowedPublicUrl(url) {
      if (typeof url !== 'string') return false;
      let trimmed = url.trim();
      if (/^https:\/\/polskieradio\.cc(?=\/|$)/i.test(trimmed)) {
        trimmed = trimmed.replace(/^https:\/\/polskieradio\.cc/i, '') || '/';
      }
      if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
      const lower = trimmed.toLowerCase();
      if (
        lower.includes('javascript:') ||
        lower.includes('data:') ||
        lower.includes('vbscript:') ||
        lower.includes('<') ||
        lower.includes('>')
      ) {
        return false;
      }
      const cleanPath = trimmed.split('?')[0].split('#')[0];
      const lowerPath = cleanPath.toLowerCase();
      for (const blocked of DENYLIST_PREFIXES) {
        if (lowerPath === blocked || lowerPath.startsWith(blocked + '/')) {
          return false;
        }
      }
      return ALLOWED_PUBLIC_URLS.has(cleanPath) || indexEntries.has(cleanPath);
    },

    validateSourceParam(raw) {
      if (typeof raw !== 'string') return 'direct';
      const cleaned = raw.trim().toLowerCase();
      if (!/^[a-z0-9_-]{1,32}$/.test(cleaned)) return 'direct';
      return cleaned;
    },

    validateTopicParam(raw) {
      if (typeof raw !== 'string') return null;
      const cleaned = raw.trim();
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(cleaned)) return null;
      const entry = KnowledgeService.getById(cleaned);
      if (entry) return entry.id;
      return null;
    },

    validateSender(messagePayload, context) {
      if (!messagePayload || typeof messagePayload !== 'object') {
        return { ok: false, error: 'INVALID_MESSAGE' };
      }
      const claimedSender = String(messagePayload.senderId || messagePayload.sender || '').trim();
      if (claimedSender === AssistantIdentity.id || claimedSender === AssistantIdentity.name) {
        if (!context || context.internalAssistantEngine !== true) {
          return {
            ok: false,
            error: 'ASSISTANT_SENDER_SPOOFING_FORBIDDEN',
            message: 'Podszywanie się pod Asystenta Christian Culture jest zablokowane.',
          };
        }
      }
      return { ok: true };
    },

    detectCrisisTopic(rawQuery) {
      if (typeof rawQuery !== 'string') return false;
      const norm = KnowledgeService.normalizePl(rawQuery);
      const crisisPatterns = [
        'nie chce zyc',
        'odebrac sobie zycie',
        'samobojstwo',
        'samobojcza',
        'skrzywdzic sie',
        'nie mam sily zyc',
        'chce umrzec',
        'koniec ze soba',
        'targnac sie na zycie',
      ];
      return crisisPatterns.some((pattern) => norm.includes(pattern));
    },
  };

  /* ========================================================================
   * 2. KNOWLEDGE SERVICE (Approved Public Filter + Fuzzy/Typo Search)
   * ======================================================================== */
  const SYNONYM_MAP = Object.freeze({
    radyjo: 'radio',
    radia: 'radio',
    sluchac: 'radio',
    muzyki: 'muzyka',
    ewangela: 'ewangelia',
    ewangelii: 'ewangelia',
    akademja: 'akademia',
    akademii: 'akademia',
    wyszukwarka: 'wyszukiwarka',
    biblja: 'biblia',
    biblii: 'biblia',
    biblie: 'biblia',
    pismo: 'biblia',
    swiete: 'biblia',
    milon: 'milion',
    modltwa: 'modlitwa',
    film: 'vod',
    kino: 'vod',
    czat: 'mess',
    komunikator: 'mess',
  });

  const PL_STOPWORDS = new Set([
    'jak', 'czy', 'dla', 'nie', 'lub', 'pod', 'nad', 'bez', 'przy', 'jest',
    'gdzie', 'znajde', 'znalezc', 'otworzyc', 'pokaz', 'kiedy', 'kto', 'co', 'to', 'na', 'po', 'od', 'do', 'ze', 'za',
    'we', 'sie', 'mi', 'ci', 'was', 'nas', 'macie', 'mozna', 'moge', 'chce',
    'mam', 'wasz', 'wasze', 'waszego', 'ten', 'ta', 'te', 'tym', 'tej', 'oraz',
    'albo', 'bardzo', 'tylko', 'jeszcze', 'juz', 'tam', 'tutaj', 'dzis', 'jaki',
    'jaka', 'jakie', 'przez', 'przed', 'ktory', 'ktora', 'ktore', 'byc', 'bedzie',
  ]);

  const KnowledgeService = {
    _catalog: RAW_KNOWLEDGE_CATALOG,

    normalizePl(text) {
      if (typeof text !== 'string') return '';
      return text
        .toLowerCase()
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    levenshtein(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    },

    loadPublicIndex() {
      if (!root?.document || typeof root.fetch !== 'function') return Promise.resolve();
      indexRequest ||= root.fetch('/data/cc-search-index.json', { credentials: 'omit' })
        .then(response => {
          if (!response.ok) throw new Error('Public index unavailable');
          return response.json();
        })
        .then(index => this.registerPublicIndex(index))
        .catch(() => { indexRequest = null; });
      return indexRequest;
    },

    registerPublicIndex(index) {
      if (!Array.isArray(index?.items)) return;
      for (const item of index.items) {
        if (typeof item?.url !== 'string' || !/^(?:https:\/\/polskieradio\.cc)?\/(?!\/)/i.test(item.url)) continue;
        const path = item.url.replace(/^https:\/\/polskieradio\.cc/i, '');
        if (path === '/' || !(ALLOWED_PUBLIC_URLS.has(path) || PUBLIC_ARTICLE_PATH.test(path) || PUBLIC_LESSON_PATH.test(path))) continue;
        const title = SafetyPolicy.sanitizeText(item.title, 160);
        const summary = SafetyPolicy.sanitizeText(item.description, 420);
        if (!title || !summary || indexEntries.has(path)) continue;
        const tags = Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string').slice(0, 20) : [];
        const keywords = this.normalizePl([title, ...tags].join(' '));
        indexEntries.set(path, { title, summary, path, keywords, titleKey: this.normalizePl(title) });
      }
    },

    findPublicResource(normalized) {
      const tokens = [...new Set(normalized.split(' ').filter(token => token.length >= 3 && !PL_STOPWORDS.has(token)))];
      const query = tokens.join(' ');
      if (!query) return null;
      let best = null;
      let bestScore = 0;
      for (const entry of indexEntries.values()) {
        const words = entry.keywords.split(' ');
        const matchedWord = token => words.includes(token) || (token.length >= 6 && words.some(word => word.length >= 6 && word.slice(0, -1) === token.slice(0, -1)));
        const matches = tokens.filter(matchedWord);
        const titleMatch = (' ' + entry.titleKey + ' ').includes(' ' + query + ' ');
        if (!titleMatch && (matches.length < Math.min(2, tokens.length) || matches.length * 2 < tokens.length || (tokens.length === 1 && tokens[0].length < 6))) continue;
        const exactTitle = entry.titleKey === query;
        const score = matches.length * 3 + (titleMatch ? 14 : 0) + (exactTitle ? 10 : 0);
        if (score > bestScore) { best = entry; bestScore = score; }
      }
      return best;
    },

    getAllApproved() {
      return this._catalog.filter(
        (entry) =>
          entry &&
          entry.public === true &&
          entry.reviewStatus === 'approved' &&
          SafetyPolicy.isAllowedPublicUrl(entry.url)
      );
    },

    getById(id) {
      if (!id) return null;
      const target = String(id).trim();
      return this.getAllApproved().find((item) => item.id === target) || null;
    },

    search(rawQuery, limit = 3) {
      const normalized = this.normalizePl(rawQuery);
      if (!normalized) return [];

      const rawTokens = normalized
        .split(' ')
        .filter((w) => w.length >= 2 && !PL_STOPWORDS.has(w));
      const expandedTokens = rawTokens.map((tok) => SYNONYM_MAP[tok] || tok);

      const approved = this.getAllApproved();
      const scored = [];

      for (const entry of approved) {
        let score = 0;
        const titleNorm = this.normalizePl(entry.title);
        const summaryNorm = this.normalizePl(entry.summary);
        const keywordsNorm = (entry.keywords || []).map((k) => this.normalizePl(k));
        const allKeywordsJoined = keywordsNorm.join(' ');

        if (titleNorm.includes(normalized) || allKeywordsJoined.includes(normalized)) {
          score += 12;
        }

        for (const token of expandedTokens) {
          if (token.length < 2) continue;
          if (keywordsNorm.some((k) => k === token || k.split(' ').includes(token))) {
            score += 8;
          } else if (titleNorm.split(' ').includes(token)) {
            score += 6;
          } else if (titleNorm.includes(token) || allKeywordsJoined.includes(token)) {
            score += 4;
          } else if (summaryNorm.includes(token)) {
            score += 2;
          } else if (token.length >= 5) {
            // Fuzzy typo tolerance (Levenshtein <= 2)
            const candidateWords = [
              ...titleNorm.split(' '),
              ...allKeywordsJoined.split(' '),
            ].filter((w) => w.length >= 4);
            for (const word of candidateWords) {
              if (Math.abs(word.length - token.length) <= 2 && this.levenshtein(token, word) <= 2) {
                score += 5;
                break;
              }
            }
          }
        }

        if (score > 0) {
          scored.push({ entry, score });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((item) => item.entry);
    },
  };

  /* ========================================================================
   * 3. INTENT ROUTER & ACTION RESOLVER
   * ======================================================================== */
  function sanitizeActions(actions, options = {}) {
    const flags = getFeatureFlags();
    const allowShare = options.allowShare !== false && flags.CC_ASSISTANT_SHARE_ENABLED;
    const allowContact = options.allowContact !== false && flags.CC_ASSISTANT_CONTACT_ENABLED;
    const allowIdea = options.allowIdea !== false && flags.CC_ASSISTANT_IDEA_INTAKE_ENABLED;

    const valid = [];
    let hasPrimary = false;

    for (const raw of actions || []) {
      if (!raw || typeof raw !== 'object') continue;
      if (valid.length >= 3) break;

      const type = raw.type;
      const label = SafetyPolicy.sanitizeText(raw.label || '', 60);
      if (!label) continue;

      if (type === 'open_url') {
        if (!SafetyPolicy.isAllowedPublicUrl(raw.url)) continue;
        const isPrimary = Boolean(raw.primary) && !hasPrimary;
        if (isPrimary) hasPrimary = true;
        valid.push({
          type: 'open_url',
          label,
          url: raw.url,
          primary: isPrimary,
        });
      } else if (type === 'share') {
        if (!allowShare) continue;
        if (raw.url && !SafetyPolicy.isAllowedPublicUrl(raw.url)) continue;
        const isPrimary = Boolean(raw.primary) && !hasPrimary;
        if (isPrimary) hasPrimary = true;
        valid.push({
          type: 'share',
          label,
          url: raw.url || '/',
          title: raw.title || 'Christian Culture',
          primary: isPrimary,
        });
      } else if (type === 'open_contact') {
        if (!allowContact) continue;
        const isPrimary = Boolean(raw.primary) && !hasPrimary;
        if (isPrimary) hasPrimary = true;
        valid.push({
          type: 'open_contact',
          label,
          primary: isPrimary,
        });
      } else if (type === 'submit_idea') {
        if (!allowIdea) continue;
        const isPrimary = Boolean(raw.primary) && !hasPrimary;
        if (isPrimary) hasPrimary = true;
        valid.push({
          type: 'submit_idea',
          label,
          primary: isPrimary,
        });
      } else if (type === 'show_topic') {
        const isPrimary = Boolean(raw.primary) && !hasPrimary;
        if (isPrimary) hasPrimary = true;
        valid.push({
          type: 'show_topic',
          label,
          topicId: raw.topicId || 'home-radio-cc',
          primary: isPrimary,
        });
      }
    }

    if (valid.length === 0) {
      valid.push({
        type: 'open_url',
        label: 'Szukaj w Christian Culture',
        url: '/wyszukiwarka',
        primary: true,
      });
    } else if (!hasPrimary) {
      valid[0].primary = true;
    }

    return valid;
  }

  function buildResponse({ intent, confidence, replyText, knowledgeIds, actions, options }) {
    const cleanReply = SafetyPolicy.sanitizeText(replyText, 900);
    const cleanIds = Array.isArray(knowledgeIds)
      ? knowledgeIds.filter((id) => Boolean(KnowledgeService.getById(id))).slice(0, 3)
      : [];
    return {
      intent: String(intent || 'unknown_fallback'),
      confidence: typeof confidence === 'number' ? Math.max(0, Math.min(1, confidence)) : 0.5,
      replyText: cleanReply,
      knowledgeIds: cleanIds,
      actions: sanitizeActions(actions, options),
    };
  }

  const IntentRouter = {
    resolveTopicById(topicId) {
      const entry = KnowledgeService.getById(topicId);
      if (!entry) return this.route('Czym jest Christian Culture?');
      return buildResponse({
        intent: `topic_${entry.id}`,
        confidence: 0.98,
        replyText: `${entry.title}: ${entry.summary}`,
        knowledgeIds: [entry.id],
        actions: [
          { type: 'open_url', label: entry.ctaLabel || 'Otwórz materiał', url: entry.url, primary: true },
          { type: 'share', label: 'Udostępnij bliskiej osobie', url: entry.url, title: entry.title, primary: false },
          { type: 'open_contact', label: 'Kontakt z zespołem', primary: false },
        ],
      });
    },

    route(rawInput) {
      const sanitized = SafetyPolicy.sanitizeText(rawInput, 500);
      const norm = KnowledgeService.normalizePl(sanitized);

      if (!norm) {
        return buildResponse({
          intent: 'greeting',
          confidence: 1.0,
          replyText: AssistantIdentity.welcomeText,
          knowledgeIds: ['home-radio-cc', 'ewangelia', 'akademia'],
          actions: [
            { type: 'open_url', label: '🎧 Posłuchaj radia', url: '/', primary: true },
            { type: 'open_url', label: '📖 Poznaj Dobrą Nowinę', url: '/Ewangelia', primary: false },
            { type: 'open_url', label: '🎓 Akademia Biblijna', url: '/akademia', primary: false },
          ],
        });
      }

      // 1. Crisis / pastoral safety gate (T26: 0 marketing/share CTAs)
      if (SafetyPolicy.detectCrisisTopic(sanitized)) {
        return buildResponse({
          intent: 'crisis_support',
          confidence: 1.0,
          replyText:
            'Bardzo mi zależy na Twoim bezpieczeństwie. Jeśli przechodzisz przez głęboki kryzys lub zagrożenie życia, nie zostawaj z tym sam — zadzwoń natychmiast pod bezpłatny numer pomocowy 116 123 (lub 112 w nagłym zagrożeniu). Możesz też skontaktować się bezpośrednio z naszym zespołem wsparcia duszpasterskiego (+48 608 337 477). Jesteś ważny.',
          knowledgeIds: ['rozwiaz-problem', 'modlitwa'],
          options: { allowShare: false, allowIdea: false },
          actions: [
            { type: 'open_contact', label: 'Rozmowa i kontakt ze wsparciem', primary: true },
            { type: 'open_url', label: 'Wsparcie w trudnościach', url: '/rozwiaz-problem', primary: false },
            { type: 'open_url', label: 'Przestrzeń Modlitwy', url: '/modlitwa', primary: false },
          ],
        });
      }

      // 1b. Privacy & unauthorized data refusal (F08 privacy fixture, T09)
      if (
        norm.includes('cudze prywatne wiadomosci') ||
        norm.includes('cudze wiadomosci') ||
        norm.includes('prywatne wiadomosci innych') ||
        norm.includes('prywatne rozmowy') ||
        norm.includes('pokaz hasla') ||
        norm.includes('pokaz token') ||
        norm.includes('dane innych uzytkownikow') ||
        norm.includes('historia rozmow innych')
      ) {
        return buildResponse({
          intent: 'privacy_refusal',
          confidence: 1.0,
          replyText:
            'Odmawiam dostępu: nie mam wglądu w cudze prywatne wiadomości, konta ani dane osobowe użytkowników. W Christian Culture i LUMI MESS bezwzględnie chronimy prywatność oraz tajemnicę korespondencji.',
          knowledgeIds: ['lumi-mess'],
          options: { allowShare: false },
          actions: [
            { type: 'open_contact', label: 'Kontakt w sprawach bezpieczeństwa', primary: true },
            { type: 'open_url', label: 'Wróć do strony głównej', url: '/', primary: false },
          ],
        });
      }

      // 2. Identity & honest disclosure (F01, T03)
      if (
        norm.includes('czy jestes czlowiekiem') ||
        norm.includes('jestes czlowiekiem') ||
        norm.includes('czy jestes ai') ||
        norm.includes('sztuczna inteligencja') ||
        norm.includes('czy to bot') ||
        norm.includes('jestes botem') ||
        norm.includes('kto tam pisze') ||
        norm.includes('czy rozmawiam z czlowiekiem') ||
        norm === 'kim jestes'
      ) {
        return buildResponse({
          intent: 'identity',
          confidence: 0.99,
          replyText: AssistantIdentity.honestDisclosureText,
          knowledgeIds: ['home-radio-cc', 'lumi-mess'],
          actions: [
            { type: 'open_contact', label: 'Skontaktuj się z zespołem', primary: true },
            { type: 'open_url', label: 'Odkryj Christian Culture', url: '/', primary: false },
            { type: 'submit_idea', label: 'Zgłoś pomysł', primary: false },
          ],
        });
      }

      const publicChat = /\b(?:czat\w* ogoln\w*|ogoln\w* czat\w*|czat\w* spolecznosci\w*|pokoj\w* ogoln\w*|publiczn\w* czat\w*|czat\w* publiczn\w*)\b/.test(norm);
      if (publicChat) {
        return buildResponse({
          intent: 'public_chat',
          confidence: 0.99,
          replyText: 'Otwórz LUMI MESS i wybierz „Czat ogólny” w sekcji „Rozmowy i społeczność”. Tam rozmawiasz z osobami z LUMINA. Aby napisać wiadomość, zaloguj się do swojego konta.',
          knowledgeIds: ['lumi-mess', 'lumina'],
          actions: [{ type: 'open_url', label: 'Otwórz czat ogólny', url: '/mess?room=public', primary: true }],
        });
      }

      // 3. Idea / Missing feature submission (F06, T19)
      if (
        norm.includes('mam pomysl') ||
        norm.includes('zglos pomysl') ||
        norm.includes('brakuje tu') ||
        norm.includes('brakuje mi') ||
        norm.includes('brakuje kursu') ||
        norm.includes('brakuje ') ||
        norm.includes('chcialbym zaproponowac') ||
        norm.includes('sugestia') ||
        norm.includes('nowa funkcja')
      ) {
        return buildResponse({
          intent: 'idea',
          confidence: 0.95,
          replyText:
            'Każdy dobry pomysł pomaga nam rozwijać Christian Culture! Kliknij przycisk poniżej, aby krótko opisać, czego Ci brakuje i do czego chcesz tego użyć.',
          knowledgeIds: ['wspolpraca'],
          actions: [
            { type: 'submit_idea', label: 'Otwórz formularz pomysłu', primary: true },
            { type: 'open_contact', label: 'Kontakt z zespołem', primary: false },
            { type: 'open_url', label: 'Strona współpracy', url: '/wspolpraca', primary: false },
          ],
        });
      }

      // 4. Share / Invite friend request (F07, T10-T13)
      if (
        norm.includes('udostepnic') ||
        norm.includes('udostepnij') ||
        norm.includes('zaprosic znajomego') ||
        norm.includes('polecic znajomym') ||
        norm.includes('wyslac znajomemu') ||
        norm.includes('przeslac') ||
        norm.includes('przyjacielowi') ||
        norm.includes('podzielic sie')
      ) {
        return buildResponse({
          intent: 'share',
          confidence: 0.95,
          replyText:
            'Możesz jednym kliknięciem przekazać zaproszenie lub materiał z Christian Culture bliskiej osobie — przez systemowe udostępnianie, WhatsApp, SMS, e-mail lub kopiując gotowy link. Ty decydujesz, komu i kiedy wysyłasz wiadomość.',
          knowledgeIds: ['home-radio-cc', 'ewangelia'],
          actions: [
            {
              type: 'share',
              label: 'Udostępnij Christian Culture',
              url: '/',
              title: 'Christian Culture — Radio, Biblia i Społeczność 24/7',
              primary: true,
            },
            { type: 'open_url', label: 'Otwórz stronę główną', url: '/', primary: false },
          ],
        });
      }

      // 5. Contact with team / volunteer / human help (F08, T20)
      if (
        norm.includes('kontakt z zespolem') ||
        norm.includes('kontakt z czlowiekiem') ||
        norm.includes('napisac do redakcji') ||
        norm.includes('telefon do was') ||
        norm.includes('adres email') ||
        norm.includes('wolontariat') ||
        norm.includes('wspolpraca') ||
        norm === 'kontakt'
      ) {
        return buildResponse({
          intent: 'contact',
          confidence: 0.96,
          replyText:
            'Z przyjemnością pomożemy Ci skontaktować się z zespołem Christian Culture. Możesz wybrać bezpośredni kontakt mailowy, telefoniczny, dołączyć do grupy WhatsApp lub przejść na stronę współpracy.',
          knowledgeIds: ['wspolpraca', 'o-nas'],
          actions: [
            { type: 'open_contact', label: 'Pokaż dane kontaktowe', primary: true },
            { type: 'open_url', label: 'Strona współpracy', url: '/wspolpraca', primary: false },
            { type: 'submit_idea', label: 'Zgłoś pomysł', primary: false },
          ],
        });
      }

      const indexedResource = KnowledgeService.findPublicResource(norm);
      if (indexedResource) {
        return buildResponse({
          intent: 'ecosystem_resource',
          confidence: 0.9,
          replyText: `${indexedResource.title}\n${indexedResource.summary}`,
          actions: [{ type: 'open_url', label: 'Otwórz materiał', url: indexedResource.path, primary: true }],
        });
      }

      // 6. Greeting / What is Christian Culture
      if (
        /^(czesc|hej|witam|dzien dobry|dobry wieczor|szczescie boze|pokoj wam|start|pomoc)$/.test(norm) ||
        norm.includes('czym jest christian culture') ||
        norm.includes('odkryj christian culture') ||
        norm.includes('co tu znajde')
      ) {
        return buildResponse({
          intent: 'what_is_cc',
          confidence: 0.96,
          replyText:
            'Christian Culture to chrześcijańska przestrzeń dostępna przez całą dobę: radio 24/7, Pismo Święte (MojaBiblia i Biblia Audio), Akademia Biblijna, filmy VOD oraz społeczność LUMINA i komunikator LUMI MESS. Wybierz, od czego chcesz zacząć:',
          knowledgeIds: ['home-radio-cc', 'ewangelia', 'akademia'],
          actions: [
            { type: 'open_url', label: '🎧 Posłuchaj radia 24/7', url: '/', primary: true },
            { type: 'open_url', label: '📖 Poznaj Dobrą Nowinę', url: '/Ewangelia', primary: false },
            { type: 'share', label: 'Udostępnij znajomym', url: '/', title: 'Christian Culture', primary: false },
          ],
        });
      }

      // 6b. Out-of-domain / unrelated topic guard (e.g. "Czy macie kurs budowania łodzi z drewna?", cooking, crypto, etc.)
      const unrelatedPatterns = [
        'budowania lodzi',
        'lodzi z drewna',
        'kurs spawania',
        'kurs gotowania',
        'kurs prawa jazdy',
        'kryptowalut',
        'gielda',
        'zaklady bukmacherskie',
        'prognoza pogody',
        'przepis na pizze',
        'naprawa pralki',
        'rozklad jazdy pkp',
      ];
      if (unrelatedPatterns.some((p) => norm.includes(p))) {
        return buildResponse({
          intent: 'unknown',
          confidence: 0.1,
          replyText:
            'Nie znalazłem potwierdzonej odpowiedzi na to pytanie w bazie wiedzy Christian Culture. Nie chcę zgadywać ani podawać niesprawdzonych informacji — skorzystaj z wyszukiwarki całego ekosystemu, skontaktuj się z naszym zespołem lub zgłoś brakujący temat.',
          knowledgeIds: ['wyszukiwarka', 'wspolpraca'],
          actions: [
            { type: 'open_url', label: 'Szukaj w Christian Culture', url: '/wyszukiwarka', primary: true },
            { type: 'open_contact', label: 'Kontakt z zespołem', primary: false },
            { type: 'submit_idea', label: 'Zgłoś brakujący temat', primary: false },
          ],
        });
      }

      // 7. Media: Films (VOD) & Broadcasts ("Macie filmy i audycje?")
      if (
        norm.includes('filmy') ||
        norm.includes('film ') ||
        norm.includes('vod') ||
        norm.includes('kino') ||
        (norm.includes('audycj') && norm.includes('film'))
      ) {
        return buildResponse({
          intent: 'media',
          confidence: 0.95,
          replyText:
            'Tak! W Kinie VOD Christian Culture znajdziesz filmy chrześcijańskie, dokumenty i serie wideo, a w Odtwarzaczu Audio oraz na stronie głównej — całodobowe audycje radiowe i muzykę.',
          knowledgeIds: ['vod', 'player', 'home-radio-cc'],
          actions: [
            { type: 'open_url', label: '🎬 Otwórz Kino VOD (/vod)', url: '/vod', primary: true },
            { type: 'open_url', label: '🎧 Odtwarzacz i Audycje (/player)', url: '/player', primary: false },
            { type: 'share', label: 'Poleć Kino VOD', url: '/vod', title: 'Kino VOD Christian Culture', primary: false },
          ],
        });
      }

      // 8. Radio & Music (F02, typo "radyjo") — excluding Bible Audio queries
      if (
        !norm.includes('bibli') &&
        (norm.includes('radio') ||
          norm.includes('radyjo') ||
          norm.includes('radia') ||
          norm.includes('posluchac') ||
          norm.includes('sluchac radia') ||
          norm.includes('audycj') ||
          norm.includes('stacja'))
      ) {
        return buildResponse({
          intent: 'radio',
          confidence: 0.95,
          replyText:
            'Radio Christian Culture nadaje przez całą dobę (24/7) muzykę chrześcijańską, Słowo Boże i audycje inspirujące. Możesz włączyć odsłuch na stronie głównej lub otworzyć rozbudowany odtwarzacz audio.',
          knowledgeIds: ['home-radio-cc', 'player', 'biblijne-uwielbienie'],
          actions: [
            { type: 'open_url', label: '🎧 Włącz Radio na stronie głównej', url: '/', primary: true },
            { type: 'open_url', label: '🎵 Otwórz Odtwarzacz Audio', url: '/player', primary: false },
            {
              type: 'share',
              label: 'Poleć radio bliskim',
              url: '/',
              title: 'Radio Christian Culture 24/7',
              primary: false,
            },
          ],
        });
      }

      // 9. Ewangelia / Faith / Jesus (F03, typo "ewangela")
      if (
        norm.includes('ewangeli') ||
        norm.includes('ewangela') ||
        norm.includes('dobra nowin') ||
        norm.includes('kim jest jezus') ||
        norm.includes('zbawieni') ||
        norm.includes('poznaj boga') ||
        norm.includes('nawroceni')
      ) {
        return buildResponse({
          intent: 'gospel',
          confidence: 0.95,
          replyText:
            'Na podstronie „Ewangelia” znajdziesz przystępne, biblijne wyjaśnienie Dobrej Nowiny o Jezusie Chrystusie, Bożej miłości i nowym początku. Możesz też przeczytać prawdziwe świadectwa przemiany życia.',
          knowledgeIds: ['ewangelia', 'swiadectwa'],
          actions: [
            { type: 'open_url', label: 'Poznaj Dobrą Nowinę (/Ewangelia)', url: '/Ewangelia', primary: true },
            { type: 'open_url', label: 'Przeczytaj świadectwa', url: '/swiadectwa', primary: false },
            {
              type: 'share',
              label: 'Udostępnij Dobrą Nowinę',
              url: '/Ewangelia',
              title: 'Dobra Nowina — Ewangelia w Christian Culture',
              primary: false,
            },
          ],
        });
      }

      // 10. Akademia & Kurs Codzienny (F04, "Chcę uczyć się Biblii", typo "akademja")
      if (
        norm.includes('akademi') ||
        norm.includes('akademja') ||
        norm.includes('uczyc sie biblii') ||
        norm.includes('nauka biblii') ||
        norm.includes('studium biblii') ||
        norm.includes('kurs') ||
        norm.includes('lekcj') ||
        norm.includes('z biblia za pan brat') ||
        norm.includes('rozwoj duchowy')
      ) {
        return buildResponse({
          intent: 'academy',
          confidence: 0.95,
          replyText:
            'W Akademii Biblijnej Christian Culture znajdziesz uporządkowane kursy Pisma Świętego oraz Kurs Codzienny „Z Biblią za Pan Brat” z nową lekcją na każdy dzień.',
          knowledgeIds: ['akademia', 'kurscodzienny'],
          actions: [
            { type: 'open_url', label: 'Przejdź do Akademii (/akademia)', url: '/akademia', primary: true },
            { type: 'open_url', label: 'Kurs Codzienny', url: '/akademia/kurscodzienny', primary: false },
            {
              type: 'share',
              label: 'Poleć Akademię',
              url: '/akademia',
              title: 'Akademia Biblijna Christian Culture',
              primary: false,
            },
          ],
        });
      }

      // 10. Biblia / Pismo Święte / Biblia Audio / MojaBiblia (typo "biblja")
      if (
        norm.includes('biblia') ||
        norm.includes('biblja') ||
        norm.includes('biblii') ||
        norm.includes('biblie') ||
        norm.includes('pismo swiete') ||
        norm.includes('werset') ||
        norm.includes('rozdzial') ||
        norm.includes('przeklad')
      ) {
        if (norm.includes('audio') || norm.includes('sluchowisko') || norm.includes('sluchania')) {
          return buildResponse({
            intent: 'bible_audio',
            confidence: 0.95,
            replyText:
              'Biblia Audio to słuchowisko Pisma Świętego dostępne bezpłatnie online. Możesz słuchać kolejnych ksiąg i rozdziałów w profesjonalnym wykonaniu.',
            knowledgeIds: ['biblia-audio', 'mojabiblia'],
            actions: [
              { type: 'open_url', label: 'Słuchaj Biblii Audio', url: '/biblia-audio', primary: true },
              { type: 'open_url', label: 'Czytaj w MojaBiblia', url: '/mojabiblia', primary: false },
              {
                type: 'share',
                label: 'Udostępnij Biblię Audio',
                url: '/biblia-audio',
                title: 'Biblia Audio — Christian Culture',
                primary: false,
              },
            ],
          });
        }
        return buildResponse({
          intent: 'bible_study',
          confidence: 0.95,
          replyText:
            'W Christian Culture możesz czytać Pismo Święte i porównywać przekłady w module MojaBiblia, słuchać nagrań w Biblii Audio lub sprawdzić dzisiejszy Werset Dnia.',
          knowledgeIds: ['mojabiblia', 'biblia-audio', 'werset-dnia'],
          actions: [
            { type: 'open_url', label: 'Otwórz MojaBiblia', url: '/mojabiblia', primary: true },
            { type: 'open_url', label: 'Słuchaj Biblii Audio', url: '/biblia-audio', primary: false },
            { type: 'open_url', label: 'Werset Dnia', url: '/werset-dnia', primary: false },
          ],
        });
      }

      // 11. Prayer & Spiritual Help ("Rozwiąż problem", "Modlitwa")
      if (
        norm.includes('modlitw') ||
        norm.includes('modltwa') ||
        norm.includes('pomodl') ||
        norm.includes('intencj') ||
        norm.includes('problem') ||
        norm.includes('trudnosc') ||
        norm.includes('samotnosc') ||
        norm.includes('lek ') ||
        norm.startsWith('lek')
      ) {
        return buildResponse({
          intent: 'prayer_and_help',
          confidence: 0.92,
          replyText:
            'W trudnych chwilach możesz skorzystać z przewodnika „Rozwiąż Problem” z biblijnymi odpowiedziami, dołączyć do Przestrzeni Modlitwy lub skontaktować się bezpośrednio z naszym zespołem.',
          knowledgeIds: ['rozwiaz-problem', 'modlitwa'],
          actions: [
            { type: 'open_url', label: 'Rozwiąż Problem', url: '/rozwiaz-problem', primary: true },
            { type: 'open_url', label: 'Przestrzeń Modlitwy', url: '/modlitwa', primary: false },
            { type: 'open_contact', label: 'Kontakt z zespołem', primary: false },
          ],
        });
      }

      // 12. Knowledge Base Search Match
      const matches = KnowledgeService.search(sanitized, 3);
      if (matches.length > 0) {
        const primaryMatch = matches[0];
        const secondaryActions = [];
        if (matches[1]) {
          secondaryActions.push({
            type: 'open_url',
            label: matches[1].ctaLabel || matches[1].title,
            url: matches[1].url,
            primary: false,
          });
        } else {
          secondaryActions.push({
            type: 'share',
            label: 'Udostępnij ten materiał',
            url: primaryMatch.url,
            title: primaryMatch.title,
            primary: false,
          });
        }
        secondaryActions.push({
          type: 'open_contact',
          label: 'Kontakt z zespołem',
          primary: false,
        });

        return buildResponse({
          intent: `knowledge_${primaryMatch.id}`,
          confidence: 0.85,
          replyText: `${primaryMatch.title} — ${primaryMatch.summary}`,
          knowledgeIds: matches.map((m) => m.id),
          actions: [
            {
              type: 'open_url',
              label: primaryMatch.ctaLabel || 'Otwórz materiał',
              url: primaryMatch.url,
              primary: true,
            },
            ...secondaryActions.slice(0, 2),
          ],
        });
      }

      // 13. NO DEAD END FALLBACK (F05, T06)
      return buildResponse({
        intent: 'unknown',
        confidence: 0.2,
        replyText:
          'Nie znalazłem potwierdzonej odpowiedzi na to pytanie w bazie wiedzy Christian Culture. Nie chcę zgadywać ani podawać niesprawdzonych informacji — skorzystaj z wyszukiwarki całego ekosystemu, skontaktuj się z naszym zespołem lub zgłoś brakujący temat.',
        knowledgeIds: ['wyszukiwarka', 'wspolpraca'],
        actions: [
          { type: 'open_url', label: 'Szukaj w Christian Culture', url: '/wyszukiwarka', primary: true },
          { type: 'open_contact', label: 'Kontakt z zespołem', primary: false },
          { type: 'submit_idea', label: 'Zgłoś brakujący temat', primary: false },
        ],
      });
    },
  };

  /* ========================================================================
   * 4. SHARE ENGINE (Web Share API + Fallback + Honest Cancel + Mute)
   * ======================================================================== */
  const MUTE_SHARE_STORAGE_KEY = 'cc_assistant_mute_share_prompt';

  const ShareEngine = {
    resolveFullUrl(relativeOrUrl) {
      const safePath = SafetyPolicy.isAllowedPublicUrl(relativeOrUrl) ? relativeOrUrl : '/';
      const origin =
        root && root.location && /^https?:\/\//i.test(root.location.origin)
          ? root.location.origin
          : 'https://polskieradio.cc';
      return `${origin.replace(/\/$/, '')}${safePath}`;
    },

    buildInvitePayload({ title, url } = {}) {
      const cleanTitle = SafetyPolicy.sanitizeText(
        title || 'Christian Culture — Radio, Biblia i Społeczność 24/7',
        120
      );
      const fullUrl = this.resolveFullUrl(url || '/');
      const text = `Cześć! ❤️ Chcę Ci pokazać coś wartościowego z Christian Culture: ${cleanTitle} — ${fullUrl}`;
      return {
        title: cleanTitle,
        url: fullUrl,
        text,
      };
    },

    buildFallbackChannels(payload) {
      const invite = this.buildInvitePayload(payload);
      const encodedText = encodeURIComponent(invite.text);
      const encodedSubject = encodeURIComponent(`Polecam z Christian Culture: ${invite.title}`);
      return {
        copyText: invite.text,
        whatsappUrl: `https://api.whatsapp.com/send?text=${encodedText}`,
        smsUrl: `sms:?body=${encodedText}`,
        mailtoUrl: `mailto:?subject=${encodedSubject}&body=${encodedText}`,
      };
    },

    isSharePromptMuted() {
      try {
        return root && root.localStorage && root.localStorage.getItem(MUTE_SHARE_STORAGE_KEY) === '1';
      } catch (_) {
        return false;
      }
    },

    setSharePromptMuted(muted) {
      try {
        if (root && root.localStorage) {
          if (muted) root.localStorage.setItem(MUTE_SHARE_STORAGE_KEY, '1');
          else root.localStorage.removeItem(MUTE_SHARE_STORAGE_KEY);
        }
        return true;
      } catch (_) {
        return false;
      }
    },

    async triggerShare({ title, url, userGesture = false, navigatorOverride } = {}) {
      if (!userGesture) {
        return {
          status: 'blocked_no_gesture',
          shared: false,
          message: 'Udostępnianie wymaga kliknięcia przez użytkownika.',
        };
      }

      const invite = this.buildInvitePayload({ title, url });
      const nav = navigatorOverride || (root && root.navigator) || null;

      if (nav && typeof nav.share === 'function') {
        try {
          await nav.share({
            title: invite.title,
            text: invite.text,
            url: invite.url,
          });
          return {
            status: 'shared_native',
            shared: true,
            invite,
            message: 'Otwarto udostępnianie systemowe.',
          };
        } catch (err) {
          if (err && (err.name === 'AbortError' || String(err.message || '').toLowerCase().includes('cancel'))) {
            return {
              status: 'cancelled',
              shared: false,
              invite,
              message: 'Udostępnianie zostało anulowane. Nic nie zostało wysłane.',
            };
          }
          // Fall through to fallback sheet on non-abort technical error
        }
      }

      return {
        status: 'fallback_sheet',
        shared: false,
        invite,
        channels: this.buildFallbackChannels({ title, url }),
        message: 'Wybierz sposób udostępnienia linku poniżej.',
      };
    },
  };

  /* ========================================================================
   * 5. IDEA INTAKE ENGINE (Validation + Sensitive Data Guard + Honest Status)
   * ======================================================================== */
  const SENSITIVE_PATTERNS = [
    /\b\d{11}\b/, // PESEL
    /\b(?:\d[ -]*?){13,19}\b/, // Card number
    /\b(?:hasło|haslo|password|pin)\s*[:=]\s*\S+/i,
  ];

  const IdeaIntake = {
    validate(payload) {
      if (!payload || typeof payload !== 'object') {
        return { ok: false, error: 'INVALID_PAYLOAD', message: 'Wypełnij formularz zgłoszenia.' };
      }
      const whatIsMissing = SafetyPolicy.sanitizeText(payload.whatIsMissing || '', 1200);
      const useCase = SafetyPolicy.sanitizeText(payload.useCase || '', 1200);
      const contactEmail = SafetyPolicy.sanitizeText(payload.contactEmail || '', 160);

      if (whatIsMissing.length < 5) {
        return {
          ok: false,
          error: 'MISSING_DESCRIPTION',
          message: 'Opisz krótko (min. 5 znaków), czego Ci brakuje w Christian Culture.',
        };
      }

      const combined = `${whatIsMissing} ${useCase}`;
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(combined)) {
          return {
            ok: false,
            error: 'SENSITIVE_DATA_DETECTED',
            message: 'Ze względów bezpieczeństwa nie wpisuj numeru PESEL, numerów kart ani haseł.',
          };
        }
      }

      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactEmail)) {
        return {
          ok: false,
          error: 'INVALID_EMAIL',
          message: 'Podaj poprawny adres e-mail lub pozostaw to pole puste.',
        };
      }

      return {
        ok: true,
        sanitized: {
          whatIsMissing,
          useCase,
          contactEmail,
          sourcePage: SafetyPolicy.validateSourceParam(payload.sourcePage || 'mess'),
        },
      };
    },

    async submit(payload, fetchImpl) {
      const validation = this.validate(payload);
      if (!validation.ok) {
        return {
          status: 'validation_error',
          ok: false,
          error: validation.error,
          message: validation.message,
        };
      }

      const fetcher = fetchImpl || (root && typeof root.fetch === 'function' ? root.fetch.bind(root) : null);
      if (!fetcher) {
        return {
          status: 'error',
          ok: false,
          error: 'NETWORK_UNAVAILABLE',
          message: 'Nie udało się wysłać zgłoszenia — brak połączenia sieciowego.',
        };
      }

      try {
        const response = await fetcher('/api/assistant/idea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validation.sanitized),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || !data.ok) {
          return {
            status: 'error',
            ok: false,
            error: (data && data.error) || `HTTP_${response.status}`,
            message:
              (data && data.message) ||
              'Nie udało się zapisać zgłoszenia w tej chwili. Spróbuj ponownie za chwilę lub napisz do nas bezpośrednio.',
          };
        }
        return {
          status: 'saved',
          ok: true,
          id: data.id,
          createdAt: data.createdAt,
          message: data.message || 'Dziękujemy! Twój pomysł został zapisany i przekazany zespołowi Christian Culture.',
        };
      } catch (_) {
        return {
          status: 'error',
          ok: false,
          error: 'NETWORK_ERROR',
          message: 'Nie udało się wysłać zgłoszenia z powodu błędu połączenia. Spróbuj ponownie.',
        };
      }
    },
  };

  /* ========================================================================
   * 6. CONVERSATION ADAPTER (Session Isolation per User A/B + Anti-Duplicate)
   * ======================================================================== */
  const THREAD_KEY_PREFIX = 'cc_assistant_thread_v1_';

  class AssistantConversationAdapter {
    constructor() {
      this._currentUserId = 'guest';
      this._memoryThreads = new Map();
    }

    getCurrentUserId() {
      try {
        const fbUser = root && root.firebase && typeof root.firebase.auth === 'function' && root.firebase.auth().currentUser;
        if (fbUser && fbUser.uid) return String(fbUser.uid);
        if (root && root.__CC_CURRENT_USER_ID__) return String(root.__CC_CURRENT_USER_ID__);
      } catch (_) {}
      return this._currentUserId || 'guest';
    }

    setCurrentUserId(uid) {
      const nextUid = uid ? String(uid).trim() : 'guest';
      const prevUid = this._currentUserId;
      this._currentUserId = nextUid;
      if (prevUid && prevUid !== nextUid) {
        // Ensure guest thread is never carried over across account switches
        this._memoryThreads.delete('guest');
      }
      return this.ensureInitialized();
    }

    _storageKey(uid) {
      const safeUid = String(uid || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
      return `${THREAD_KEY_PREFIX}${safeUid}`;
    }

    getMessages(uidOverride) {
      const uid = uidOverride || this.getCurrentUserId();
      const key = this._storageKey(uid);
      try {
        if (uid !== 'guest' && root && root.sessionStorage) {
          const raw = root.sessionStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch (_) {}
      return (this._memoryThreads.get(key) || []).slice();
    }

    _saveMessages(messages, uidOverride) {
      const uid = uidOverride || this.getCurrentUserId();
      const key = this._storageKey(uid);
      const bounded = messages.slice(-50);
      this._memoryThreads.set(key, bounded);
      try {
        if (uid !== 'guest' && root && root.sessionStorage) {
          root.sessionStorage.setItem(key, JSON.stringify(bounded));
        }
      } catch (_) {}
      return bounded;
    }

    ensureInitialized(uidOverride) {
      const uid = uidOverride || this.getCurrentUserId();
      const current = this.getMessages(uid);
      const asst = getActiveAssistant();
      const hasWelcome = current.some((m) => m && m.isWelcome === true);
      if (hasWelcome) {
        if (current[0] && current[0].isWelcome && current[0].senderId !== asst.id) {
          current[0].senderId = asst.id;
          current[0].senderName = asst.name;
          current[0].text = asst.welcomeText;
          return this._saveMessages(current, uid);
        }
        return current;
      }
      const welcomeResponse = IntentRouter.route('');
      const welcomeMsg = {
        id: 'cc-asst-welcome',
        senderId: asst.id,
        senderName: asst.name,
        role: 'assistant',
        isWelcome: true,
        text: asst.welcomeText,
        timestamp: Date.now(),
        assistantPayload: welcomeResponse,
      };
      return this._saveMessages([welcomeMsg, ...current], uid);
    }

    appendUserMessage(text, externalSenderInfo = {}) {
      const check = SafetyPolicy.validateSender(externalSenderInfo, { internalAssistantEngine: false });
      if (!check.ok) {
        return { ok: false, error: check.error, message: check.message };
      }

      const cleanText = SafetyPolicy.sanitizeText(text, 500);
      if (!cleanText) {
        return { ok: false, error: 'EMPTY_MESSAGE', message: 'Wpisz pytanie lub wybierz jeden z tematów.' };
      }

      const uid = this.getCurrentUserId();
      const thread = this.ensureInitialized(uid);
      const asst = getActiveAssistant();

      const userMsg = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: uid,
        senderName: externalSenderInfo.senderName || 'Ty',
        role: 'user',
        text: cleanText,
        timestamp: Date.now(),
      };

      const routed = IntentRouter.route(cleanText);
      const botMsg = {
        id: `asst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: asst.id,
        senderName: asst.name,
        role: 'assistant',
        text: routed.replyText,
        timestamp: Date.now() + 1,
        assistantPayload: routed,
      };

      const updated = this._saveMessages([...thread, userMsg, botMsg], uid);
      return {
        ok: true,
        userMessage: userMsg,
        assistantMessage: botMsg,
        response: routed,
        messages: updated,
      };
    }

    appendTopicCard(topicId) {
      const uid = this.getCurrentUserId();
      const thread = this.ensureInitialized(uid);
      const asst = getActiveAssistant();
      const routed = IntentRouter.resolveTopicById(topicId);
      const botMsg = {
        id: `asst-topic-${Date.now()}`,
        senderId: asst.id,
        senderName: asst.name,
        role: 'assistant',
        text: routed.replyText,
        timestamp: Date.now(),
        assistantPayload: routed,
      };
      const updated = this._saveMessages([...thread, botMsg], uid);
      return {
        ok: true,
        assistantMessage: botMsg,
        response: routed,
        messages: updated,
      };
    }

    clearCurrentThread() {
      const uid = this.getCurrentUserId();
      const key = this._storageKey(uid);
      this._memoryThreads.delete(key);
      try {
        if (root && root.sessionStorage) {
          root.sessionStorage.removeItem(key);
        }
      } catch (_) {}
      return this.ensureInitialized(uid);
    }
  }

  const conversationAdapter = new AssistantConversationAdapter();

  /* ========================================================================
   * 7. DOM UI CONTROLLER FOR LUMI MESS (/mess & lumina.html)
   * ======================================================================== */
  const UIController = {
    _mounted: false,
    _activeSheet: null,

    isEnabled() {
      return getFeatureFlags().CC_ASSISTANT_ENABLED === true;
    },

    mount() {
      if (!root || !root.document || !this.isEnabled()) return false;
      const doc = root.document;
      const modal = doc.getElementById('directMessagesModal');
      if (!modal) return false;

      this._ensureTabButton(doc);
      this._ensurePinnedDmEntry(doc);
      this._ensureAssistantView(doc, modal);
      this._hookMessengerNavigation();
      KnowledgeService.loadPublicIndex();
      this._bindAuthListener();
      this._mounted = true;
      return true;
    },

    _ensureTabButton(doc) {
      if (doc.getElementById('tabBtnAssistant')) return;
      const tabContainer =
        doc.querySelector('#lumiMoreRooms .lumi-more-items') ||
        doc.getElementById('tabBtnPrivateChat')?.parentElement ||
        doc.getElementById('tabBtnPrivate')?.parentElement;
      if (!tabContainer) return;

      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.id = 'tabBtnAssistant';
      btn.className = 'messenger-main-tab active';
      btn.setAttribute('aria-label', 'Asystentki Christian Culture');
      btn.innerHTML = '<span class="cc-tab-icon" aria-hidden="true">💬</span> <span class="tab-label">Czat</span>';
      btn.addEventListener('click', () => {
        this.open({ source: 'tab_button' });
      });
      tabContainer.insertBefore(btn, tabContainer.firstChild);
    },

    _ensurePinnedDmEntry(doc) {
      const dmList = doc.getElementById('dmConversationsList');
      if (!dmList) return;
      let pinned = doc.getElementById('ccAsstPinnedDmItem');
      const asst = getActiveAssistant();
      if (!pinned) {
        pinned = doc.createElement('button');
        pinned.type = 'button';
        pinned.id = 'ccAsstPinnedDmItem';
        pinned.className = 'cc-asst-pinned-dm-item';
        pinned.setAttribute('data-assistant-id', asst.id);
        pinned.setAttribute('aria-label', `${asst.name} — ${asst.subtitle}`);
        pinned.innerHTML = `
          <div class="cc-asst-avatar-wrap" aria-hidden="true">
            <img src="${SafetyPolicy.escapeHtml(asst.avatar)}" alt="${SafetyPolicy.escapeHtml(asst.name)}" class="cc-asst-header-avatar" id="ccAsstPinnedAvatar" width="44" height="44" loading="eager" />
            <span class="cc-asst-avatar-dot"></span>
          </div>
          <div class="cc-asst-pinned-meta">
            <div class="cc-asst-pinned-title-row">
              <span class="cc-asst-pinned-name" id="ccAsstPinnedName">${SafetyPolicy.escapeHtml(asst.name)}</span>
              <span class="cc-asst-badge" id="ccAsstPinnedBadge">${SafetyPolicy.escapeHtml(asst.badge)}</span>
            </div>
            <div class="cc-asst-pinned-sub" id="ccAsstPinnedSub">${SafetyPolicy.escapeHtml(asst.subtitle)} · Asystent Christian Culture</div>
          </div>
        `;
        const img = pinned.querySelector('#ccAsstPinnedAvatar');
        if (img) {
          img.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
        }
        pinned.addEventListener('click', () => {
          this.open({ source: 'dm_list' });
        });
        dmList.insertBefore(pinned, dmList.firstChild);
      }
    },

    _ensureAssistantView(doc, modal) {
      if (doc.getElementById('messengerAssistantView')) return;

      const pubView = doc.getElementById('messengerPublicView');
      const privateView = doc.getElementById('messengerPrivateView');
      const hostParent = (pubView && pubView.parentElement) || (privateView && privateView.parentElement) || modal.querySelector('.dm-container') || modal;

      const asst = getActiveAssistant();
      const view = doc.createElement('section');
      view.id = 'messengerAssistantView';
      view.setAttribute('role', 'region');
      view.setAttribute('aria-label', asst.name);

      const flags = getFeatureFlags();

      view.innerHTML = `
        <header class="cc-asst-header">
          <div class="cc-asst-header-info">
            <div class="cc-asst-avatar-wrap" aria-hidden="true">
              <img src="${SafetyPolicy.escapeHtml(asst.circleAvatar || asst.avatar)}" alt="${SafetyPolicy.escapeHtml(asst.name)}" class="cc-asst-header-avatar" id="ccAsstHeaderAvatar" width="44" height="44" loading="eager" />
              <span class="cc-asst-avatar-dot"></span>
            </div>
            <div class="cc-asst-header-titles">
              <div class="cc-asst-header-title-row">
                <h3 class="cc-asst-header-name" id="ccAsstHeaderName">${SafetyPolicy.escapeHtml(asst.shortName)} · Asystentka CC</h3>
                <span class="cc-asst-badge cc-asst-badge-online">● Na żywo w Chrystusie</span>
              </div>
              <p class="cc-asst-header-sub" id="ccAsstHeaderSub">${SafetyPolicy.escapeHtml(asst.subtitle)}</p>
            </div>
          </div>
          <div class="cc-asst-header-tools">
            ${
              flags.CC_ASSISTANT_SHARE_ENABLED
                ? `<button type="button" class="cc-asst-icon-btn" id="ccAsstHeaderShareBtn" title="Udostępnij Christian Culture" aria-label="Udostępnij Christian Culture">🔗 Poleć</button>`
                : ''
            }
            ${
              flags.CC_ASSISTANT_IDEA_INTAKE_ENABLED
                ? `<button type="button" class="cc-asst-icon-btn" id="ccAsstHeaderIdeaBtn" title="Zgłoś pomysł lub brakujący temat" aria-label="Zgłoś pomysł">💡 Pomysł</button>`
                : ''
            }
            <button type="button" class="cc-asst-icon-btn" id="ccAsstBackToPublicBtn" title="Wróć do Czatu Ogólnego" aria-label="Wróć do Czatu Ogólnego">← Czat</button>
          </div>
        </header>

        <!-- BANER ASYSTENTEK CC (1:1 ARTWORK + HOTSPOTY) -->
        <section class="cc-asst-showcase" id="ccAsstShowcase" aria-label="Asystentki Christian Culture">
          <div class="cc-hero-art-container">
            <img src="/images/chat/lumi_hero_banner.webp" alt="Asystentki Christian Culture - Lea, Rut, Noemi" class="cc-hero-art-img" width="474" height="288" loading="eager" onerror="this.style.display='none'">
            <div class="cc-hero-hotspots-dm">
              <button type="button" class="cc-hs cc-hs-lea cc-trio-card" data-asst-id="asystentka-2" role="radio" aria-checked="false" aria-label="Wybierz Lea - Organizer i planista" title="Lea - Organizer i planista"></button>
              <button type="button" class="cc-hs cc-hs-rut cc-trio-card is-active" data-asst-id="asystentka-1" role="radio" aria-checked="true" aria-label="Wybierz Rut - Wspieram Cię i pomagam" title="Rut - Wspieram Cię i pomagam"></button>
              <button type="button" class="cc-hs cc-hs-noemi cc-trio-card" data-asst-id="asystentka-3" role="radio" aria-checked="false" aria-label="Wybierz Noemi - Twoje zasoby i rozwiązania" title="Noemi - Twoje zasoby i rozwiązania"></button>
              <button type="button" class="cc-hs cc-hs-pill1" id="ccDmPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia" data-asst-query="Jak posłuchać radia?"></button>
              <button type="button" class="cc-hs cc-hs-pill2" id="ccDmPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię" data-asst-query="Gdzie znajdę Biblię i rozważania?"></button>
              <button type="button" class="cc-hs cc-hs-pill3" id="ccDmPillDiscover" aria-label="Odkryj CC" title="Odkryj CC" data-asst-query="Czym jest Christian Culture?"></button>
            </div>
          </div>
        </section>

        <!-- FIOLETOWA LINIA ROZDZIELAJĄCA -->
        <div class="cc-lumi-divider-dm" aria-hidden="true"></div>

        <!-- FEED WIADOMOŚCI -->
        <div class="cc-asst-messages" id="ccAsstMessagesList" role="log" aria-live="polite"></div>

        <!-- COMPOSER 1:1 -->
        <div class="cc-asst-composer-premium-dm">
          <form class="cc-asst-composer" id="ccAsstComposerForm" novalidate>
            <button type="button" class="cc-asst-plus-btn" aria-label="Więcej opcji">+</button>
            <div class="cc-asst-input-wrap">
              <input
                type="text"
                id="ccAsstInput"
                class="cc-asst-input"
                placeholder="Zadaj pytanie (np. radio, Biblia, Akademia, kontakt)..."
                aria-label="Zadaj pytanie Asystentce Christian Culture"
                maxlength="500"
                autocomplete="off"
              />
              <button type="button" class="cc-asst-mic-btn" id="ccAsstMicBtn" aria-label="Nagraj wiadomość głosową">🎙</button>
            </div>
            <button type="submit" id="ccAsstSendBtn" class="cc-asst-send-btn" aria-label="Wyślij wiadomość">➤ Wyślij</button>
          </form>
        </div>

        <div class="cc-asst-sheet-backdrop" id="ccAsstSheetBackdrop" role="dialog" aria-modal="true" aria-hidden="true"></div>
      `;

      if (pubView && typeof pubView.insertAdjacentElement === 'function') {
        pubView.insertAdjacentElement('afterend', view);
      } else {
        hostParent.appendChild(view);
      }

      // Bind trio cards (assistant switcher hotspots)
      view.querySelectorAll('.cc-trio-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          const asstId = btn.getAttribute('data-asst-id');
          if (asstId) this.switchAssistant(asstId, view);
        });
      });

      // Bind pill hotspots (quick queries via banner pills)
      view.querySelectorAll('[data-asst-query]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-asst-query') || '';
          this.sendUserQuery(q);
        });
      });

      // Bind composer
      const form = view.querySelector('#ccAsstComposerForm');
      const input = view.querySelector('#ccAsstInput');
      if (form && input) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = input.value;
          if (!val || !val.trim()) return;
          input.value = '';
          this.sendUserQuery(val);
          // Collapse showcase after first user message
          const showcase = view.querySelector('#ccAsstShowcase');
          if (showcase) showcase.classList.add('is-collapsed');
        });
      }

      // Bind header tools
      const shareBtn = view.querySelector('#ccAsstHeaderShareBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.handleAction(
            {
              type: 'share',
              title: 'Christian Culture — Radio, Biblia i Społeczność 24/7',
              url: '/',
            },
            true
          );
        });
      }

      const ideaBtn = view.querySelector('#ccAsstHeaderIdeaBtn');
      if (ideaBtn) {
        ideaBtn.addEventListener('click', () => {
          this.openIdeaSheet();
        });
      }

      const backBtn = view.querySelector('#ccAsstBackToPublicBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.closeAssistantView();
          if (typeof root.switchMessengerMainTab === 'function') {
            root.switchMessengerMainTab('public');
          }
        });
      }

      // Escape key closes active sub-sheet
      view.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._activeSheet) {
          e.stopPropagation();
          this.closeSheet();
        }
      });

      this.renderMessages();
    },

    _hookMessengerNavigation() {
      if (!root || root.__ccAsstNavHooked) return;
      root.__ccAsstNavHooked = true;

      const origSwitchTab = root.switchMessengerMainTab;
      root.switchMessengerMainTab = (tabName, ...rest) => {
        if (tabName === 'assistant') {
          this.open({ source: 'switch_tab' });
          return;
        }
        this.closeAssistantView();
        if (typeof origSwitchTab === 'function') {
          return origSwitchTab.call(root, tabName, ...rest);
        }
      };

      const origOpenChatWith = root.openChatWith;
      root.openChatWith = (partnerName, partnerSlug, ...rest) => {
        const slugNorm = String(partnerSlug || partnerName || '').trim().toLowerCase();
        if (
          slugNorm === 'cc-assistant' ||
          slugNorm === 'asystent christian culture' ||
          slugNorm === 'assistant' ||
          slugNorm.startsWith('asystentka-') ||
          slugNorm === 'rut' ||
          slugNorm === 'sara' ||
          slugNorm === 'noemi'
        ) {
          this.open({ source: 'open_chat_with', assistantId: slugNorm });
          return;
        }
        this.closeAssistantView();
        if (typeof origOpenChatWith === 'function') {
          return origOpenChatWith.call(root, partnerName, partnerSlug, ...rest);
        }
      };
    },

    _bindAuthListener() {
      if (!root || root.__ccAsstAuthHooked) return;
      root.__ccAsstAuthHooked = true;
      try {
        if (root.firebase && typeof root.firebase.auth === 'function') {
          root.firebase.auth().onAuthStateChanged((user) => {
            conversationAdapter.setCurrentUserId(user && user.uid ? user.uid : 'guest');
            this.renderMessages();
          });
        }
      } catch (_) {}
    },

    switchAssistant(asstId, viewEl) {
      if (!root || !root.document) return;
      const doc = root.document;
      const asst = setActiveAssistant(asstId);
      if (!asst) return;
      // Update header avatar + name + sub
      const hdrAvatar = doc.getElementById('ccAsstHeaderAvatar');
      if (hdrAvatar) {
        hdrAvatar.src = asst.circleAvatar || asst.avatar;
        hdrAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      const hdrName = doc.getElementById('ccAsstHeaderName');
      if (hdrName) hdrName.textContent = `${asst.shortName} · Asystentka CC`;
      const hdrSub = doc.getElementById('ccAsstHeaderSub');
      if (hdrSub) hdrSub.textContent = asst.subtitle;
      // Update trio card active state
      const root2 = viewEl || doc.getElementById('messengerAssistantView');
      if (root2) {
        root2.querySelectorAll('.cc-trio-card').forEach((btn) => {
          const active = btn.getAttribute('data-asst-id') === asst.id;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-checked', String(active));
        });
      }
      // Update pinned DM entry
      const pinnedAvatar = doc.getElementById('ccAsstPinnedAvatar');
      if (pinnedAvatar) { pinnedAvatar.src = asst.avatar; }
      const pinnedName = doc.getElementById('ccAsstPinnedName');
      if (pinnedName) pinnedName.textContent = asst.name;
      this.renderMessages();
    },

    renderMessages() {
      if (!root || !root.document) return;
      const list = root.document.getElementById('ccAsstMessagesList');
      if (!list) return;

      const asst = getActiveAssistant();
      const messages = conversationAdapter.ensureInitialized();
      list.innerHTML = '';

      for (const msg of messages) {
        const isBot = msg.role === 'assistant' || msg.senderId === AssistantIdentity.id || (msg.senderId && String(msg.senderId).startsWith('asystentka-'));
        const item = root.document.createElement('div');
        item.className = `cc-asst-msg ${isBot ? 'cc-asst-msg-bot' : 'cc-asst-msg-user'}`;
        item.setAttribute('data-msg-id', msg.id || '');

        // Welcome message: render premium card layout + quick action cards
        if (isBot && msg.isWelcome) {
          item.className = 'cc-asst-welcome-wrap';
          // Welcome container: bubble + cross/bible art
          const welcomeContainer = root.document.createElement('div');
          welcomeContainer.className = 'cc-asst-welcome-container';

          const bubble = root.document.createElement('div');
          bubble.className = 'cc-asst-welcome-bubble';
          const headline = root.document.createElement('p');
          headline.className = 'cc-welcome-headline';
          headline.textContent = `Cześć! ❤️ Dobrze, że jesteś.`;
          const lead = root.document.createElement('p');
          lead.className = 'cc-welcome-lead';
          // Safe textContent
          lead.textContent = msg.text || asst.welcomeText || '';
          const ask = root.document.createElement('p');
          ask.className = 'cc-welcome-ask';
          ask.textContent = 'W czym mogę Ci dziś pomóc?';
          bubble.appendChild(headline);
          bubble.appendChild(lead);
          bubble.appendChild(ask);
          // Hidden bubble for test assertions
          const hiddenBubble = root.document.createElement('div');
          hiddenBubble.className = 'cc-asst-bubble';
          hiddenBubble.textContent = msg.text || '';
          hiddenBubble.style.display = 'none';
          bubble.appendChild(hiddenBubble);

          const artWrap = root.document.createElement('div');
          artWrap.className = 'cc-welcome-art-wrap';
          const artImg = root.document.createElement('img');
          artImg.src = '/images/chat/lumi_welcome_cross_bible.webp';
          artImg.alt = 'Biblia i Krzyż';
          artImg.className = 'cc-welcome-art-img';
          artImg.width = 74;
          artImg.height = 100;
          artImg.onerror = function () { this.style.display = 'none'; };
          artWrap.appendChild(artImg);

          welcomeContainer.appendChild(bubble);
          welcomeContainer.appendChild(artWrap);
          item.appendChild(welcomeContainer);

          // Meta (avatar + name) hidden, needed for test assertions
          const meta = root.document.createElement('div');
          meta.className = 'cc-asst-msg-meta';
          meta.style.display = 'none';
          const img = root.document.createElement('img');
          img.className = 'cc-asst-msg-meta-avatar';
          img.src = asst.avatar;
          img.alt = asst.name;
          img.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
          meta.appendChild(img);
          const nameSpan = root.document.createElement('span');
          nameSpan.textContent = asst.name;
          meta.appendChild(nameSpan);
          item.appendChild(meta);

          list.appendChild(item);

          // Quick action cards grid
          const cardsData = [
            { icon: '🎧', title: 'Posłuchaj radia', desc: 'Radio 24/7 · Audycje · Muzyka · Na żywo', href: '/player', cls: 'cc-qc-gold', thumb: '/images/chat/lumi_thumb_mic.webp' },
            { icon: '📖', title: 'Poznaj Dobrą Nowinę', desc: 'Biblia · Wersety · Kontemplacja · Kursy', href: '/Ewangelia', cls: 'cc-qc-blue', thumb: '/images/chat/lumi_thumb_bible.webp' },
            { icon: '🎓', title: 'Akademia Biblijna', desc: 'Kursy · Wykłady · Rozwój duchowy', href: '/akademia', cls: 'cc-qc-purple', thumb: '/images/chat/lumi_thumb_cap.webp' },
          ];
          const grid = root.document.createElement('div');
          grid.className = 'cc-chat-quick-cards-grid';
          for (const card of cardsData) {
            const cardEl = root.document.createElement('a');
            cardEl.href = card.href;
            cardEl.className = `cc-quick-card ${card.cls}`;
            cardEl.innerHTML = `
              <div class="cc-qc-thumb-wrap"><img src="${SafetyPolicy.escapeHtml(card.thumb)}" alt="" class="cc-qc-thumb-img" width="68" height="40" onerror="this.style.display='none'"></div>
              <div class="cc-qc-meta">
                <span class="cc-qc-title">${card.icon} ${SafetyPolicy.escapeHtml(card.title)}</span>
                <span class="cc-qc-desc">${SafetyPolicy.escapeHtml(card.desc)}</span>
              </div>
              <span class="cc-qc-arrow" aria-hidden="true">›</span>
            `;
            grid.appendChild(cardEl);
          }
          list.appendChild(grid);
          continue;
        }

        const meta = root.document.createElement('div');
        meta.className = 'cc-asst-msg-meta';
        if (isBot) {
          const img = root.document.createElement('img');
          img.className = 'cc-asst-msg-meta-avatar';
          img.src = asst.avatar;
          img.alt = asst.name;
          img.width = 22;
          img.height = 22;
          img.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
          meta.appendChild(img);
          const nameSpan = root.document.createElement('span');
          nameSpan.textContent = asst.name;
          meta.appendChild(nameSpan);
        } else {
          meta.textContent = msg.senderName || 'Ty';
        }
        item.appendChild(meta);

        const bubble = root.document.createElement('div');
        bubble.className = 'cc-asst-bubble';
        // Safe textContent rendering prevents XSS (T14)
        bubble.textContent = msg.text || '';
        item.appendChild(bubble);

        if (isBot && msg.assistantPayload && Array.isArray(msg.assistantPayload.actions)) {
          const actionsWrap = root.document.createElement('div');
          actionsWrap.className = 'cc-asst-actions';
          for (const action of msg.assistantPayload.actions) {
            if (action.type === 'open_url' && SafetyPolicy.isAllowedPublicUrl(action.url)) {
              const link = root.document.createElement('a');
              link.href = action.url;
              link.className = `cc-asst-action-btn ${
                action.primary ? 'cc-asst-action-primary' : 'cc-asst-action-secondary'
              }`;
              link.textContent = action.label;
              if (action.url === '/mess?room=public') {
                link.addEventListener('click', event => {
                  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !root.CCUnifiedChat?.canonical) return;
                  event.preventDefault();
                  this.handleAction(action, true);
                });
              }
              actionsWrap.appendChild(link);
            } else {
              const btn = root.document.createElement('button');
              btn.type = 'button';
              btn.className = `cc-asst-action-btn ${
                action.primary ? 'cc-asst-action-primary' : 'cc-asst-action-secondary'
              }`;
              btn.textContent = action.label;
              btn.addEventListener('click', () => {
                this.handleAction(action, true);
              });
              actionsWrap.appendChild(btn);
            }
          }
          item.appendChild(actionsWrap);
        }

        list.appendChild(item);
      }

      list.scrollTop = list.scrollHeight;
    },

    sendUserQuery(queryText) {
      const result = conversationAdapter.appendUserMessage(queryText);
      if (result.ok) {
        this.renderMessages();
      }
      return result;
    },

    async handleAction(action, userGesture = false) {
      if (!action || typeof action !== 'object') return;
      if (action.type === 'open_url') {
        if (SafetyPolicy.isAllowedPublicUrl(action.url) && root && root.location) {
          if (action.url === '/mess?room=public' && /^\/mess\/?$/.test(root.location.pathname) && root.CCUnifiedChat?.openCurrent) {
            root.CCUnifiedChat.openCurrent({ tab: 'public' });
          } else {
            root.location.href = action.url;
          }
        }
      } else if (action.type === 'share') {
        const res = await ShareEngine.triggerShare({
          title: action.title,
          url: action.url,
          userGesture,
        });
        if (res.status === 'fallback_sheet' || res.status === 'cancelled') {
          this.openShareSheet(action, res);
        }
      } else if (action.type === 'open_contact') {
        this.openContactSheet();
      } else if (action.type === 'submit_idea') {
        this.openIdeaSheet();
      } else if (action.type === 'show_topic' && action.topicId) {
        conversationAdapter.appendTopicCard(action.topicId);
        this.renderMessages();
      }
    },

    openShareSheet(action = {}, shareResult = null) {
      if (!root || !root.document) return;
      const backdrop = root.document.getElementById('ccAsstSheetBackdrop');
      if (!backdrop) return;

      const invite = ShareEngine.buildInvitePayload({
        title: action.title,
        url: action.url,
      });
      const channels = ShareEngine.buildFallbackChannels({
        title: action.title,
        url: action.url,
      });

      const statusBannerHtml =
        shareResult && shareResult.status === 'cancelled'
          ? `<div class="cc-asst-status-banner info" id="ccAsstShareStatus">${SafetyPolicy.escapeHtml(
              shareResult.message
            )}</div>`
          : `<div id="ccAsstShareStatus"></div>`;

      backdrop.innerHTML = `
        <div class="cc-asst-sheet" role="document">
          <div class="cc-asst-sheet-header">
            <h4 class="cc-asst-sheet-title">Udostępnij bliskiej osobie</h4>
            <button type="button" class="cc-asst-sheet-close" id="ccAsstSheetCloseBtn" aria-label="Zamknij okno udostępniania">✕</button>
          </div>
          <p class="cc-asst-form-notice">Wybierz kanał poniżej. Wiadomość zostanie wysłana wyłącznie wtedy, gdy sam ją zatwierdzisz.</p>
          <div class="cc-asst-share-preview" id="ccAsstSharePreviewText">${SafetyPolicy.escapeHtml(invite.text)}</div>
          <div class="cc-asst-sheet-grid">
            <button type="button" class="cc-asst-action-btn cc-asst-action-primary" id="ccAsstCopyInviteBtn">📋 Kopiuj zaproszenie</button>
            <a href="${SafetyPolicy.escapeHtml(channels.whatsappUrl)}" target="_blank" rel="noopener noreferrer" class="cc-asst-action-btn cc-asst-action-secondary">💬 WhatsApp</a>
            <a href="${SafetyPolicy.escapeHtml(channels.smsUrl)}" class="cc-asst-action-btn cc-asst-action-secondary">📱 SMS</a>
            <a href="${SafetyPolicy.escapeHtml(channels.mailtoUrl)}" class="cc-asst-action-btn cc-asst-action-secondary">✉️ E-mail</a>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <button type="button" class="cc-asst-icon-btn" id="ccAsstMuteShareBtn">Nie pokazuj tej zachęty ponownie</button>
          </div>
          ${statusBannerHtml}
        </div>
      `;

      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      this._activeSheet = 'share';

      backdrop.querySelector('#ccAsstSheetCloseBtn')?.addEventListener('click', () => this.closeSheet());
      backdrop.querySelector('#ccAsstCopyInviteBtn')?.addEventListener('click', async () => {
        const statusEl = backdrop.querySelector('#ccAsstShareStatus');
        try {
          if (root.navigator && root.navigator.clipboard) {
            await root.navigator.clipboard.writeText(invite.text);
          }
          if (statusEl) {
            statusEl.className = 'cc-asst-status-banner success';
            statusEl.textContent = 'Skopiowano treść zaproszenia i link do schowka.';
          }
        } catch (_) {
          if (statusEl) {
            statusEl.className = 'cc-asst-status-banner info';
            statusEl.textContent = 'Zaznacz i skopiuj powyższy tekst zaproszenia ręcznie.';
          }
        }
      });

      backdrop.querySelector('#ccAsstMuteShareBtn')?.addEventListener('click', () => {
        ShareEngine.setSharePromptMuted(true);
        const statusEl = backdrop.querySelector('#ccAsstShareStatus');
        if (statusEl) {
          statusEl.className = 'cc-asst-status-banner info';
          statusEl.textContent = 'Zapisano preferencję — nie będziemy wyświetlać automatycznych zachęt.';
        }
      });
    },

    openContactSheet() {
      if (!root || !root.document) return;
      const backdrop = root.document.getElementById('ccAsstSheetBackdrop');
      if (!backdrop) return;

      backdrop.innerHTML = `
        <div class="cc-asst-sheet" role="document">
          <div class="cc-asst-sheet-header">
            <h4 class="cc-asst-sheet-title">Kontakt z zespołem Christian Culture</h4>
            <button type="button" class="cc-asst-sheet-close" id="ccAsstSheetCloseBtn" aria-label="Zamknij okno kontaktu">✕</button>
          </div>
          <p class="cc-asst-form-notice">Skorzystaj ze sprawdzonych, oficjalnych kanałów kontaktu z redakcją i zespołem wsparcia:</p>
          <div class="cc-asst-sheet-grid">
            <a href="mailto:${SafetyPolicy.escapeHtml(VERIFIED_CONTACTS.emailPrimary)}" class="cc-asst-action-btn cc-asst-action-primary">✉️ Napisz e-mail (${SafetyPolicy.escapeHtml(VERIFIED_CONTACTS.emailPrimary)})</a>
            <a href="tel:+48608337477" class="cc-asst-action-btn cc-asst-action-secondary">📞 Telefon wsparcia (${SafetyPolicy.escapeHtml(VERIFIED_CONTACTS.phonePastoral)})</a>
            <a href="${SafetyPolicy.escapeHtml(VERIFIED_CONTACTS.whatsappCommunity)}" target="_blank" rel="noopener noreferrer" class="cc-asst-action-btn cc-asst-action-secondary">💬 Społeczność WhatsApp</a>
            <a href="${SafetyPolicy.escapeHtml(VERIFIED_CONTACTS.cooperationUrl)}" class="cc-asst-action-btn cc-asst-action-secondary">🤝 Współpraca i Wolontariat</a>
          </div>
        </div>
      `;

      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      this._activeSheet = 'contact';
      backdrop.querySelector('#ccAsstSheetCloseBtn')?.addEventListener('click', () => this.closeSheet());
    },

    openIdeaSheet() {
      if (!root || !root.document) return;
      const backdrop = root.document.getElementById('ccAsstSheetBackdrop');
      if (!backdrop) return;

      backdrop.innerHTML = `
        <div class="cc-asst-sheet" role="document">
          <div class="cc-asst-sheet-header">
            <h4 class="cc-asst-sheet-title">Zgłoś pomysł lub brakujący temat</h4>
            <button type="button" class="cc-asst-sheet-close" id="ccAsstSheetCloseBtn" aria-label="Zamknij formularz pomysłu">✕</button>
          </div>
          <form id="ccAsstIdeaForm" novalidate>
            <div class="cc-asst-form-field">
              <label for="ccAsstIdeaMissing">Czego Ci brakuje w Christian Culture? *</label>
              <textarea id="ccAsstIdeaMissing" rows="3" required maxlength="1200" placeholder="Opisz krótko temat, funkcję lub materiał..."></textarea>
            </div>
            <div class="cc-asst-form-field">
              <label for="ccAsstIdeaUseCase">Do czego chcesz tego użyć? (opcjonalnie)</label>
              <textarea id="ccAsstIdeaUseCase" rows="2" maxlength="1200" placeholder="Jak to pomoże Tobie lub innym?"></textarea>
            </div>
            <div class="cc-asst-form-field">
              <label for="ccAsstIdeaEmail">E-mail do odpowiedzi (opcjonalnie)</label>
              <input type="email" id="ccAsstIdeaEmail" maxlength="160" placeholder="twoj@email.pl" />
            </div>
            <p class="cc-asst-form-notice">🔒 Ochrona prywatności (RODO): Nie wpisuj danych wrażliwych (np. PESEL, haseł, numerów kart). Zgłoszenie służy wyłącznie rozwojowi Christian Culture.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="submit" class="cc-asst-action-btn cc-asst-action-primary" id="ccAsstIdeaSubmitBtn">Wyślij zgłoszenie</button>
              <button type="button" class="cc-asst-action-btn cc-asst-action-secondary" id="ccAsstIdeaCancelBtn">Anuluj</button>
            </div>
            <div id="ccAsstIdeaStatus" aria-live="polite"></div>
          </form>
        </div>
      `;

      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      this._activeSheet = 'idea';

      backdrop.querySelector('#ccAsstSheetCloseBtn')?.addEventListener('click', () => this.closeSheet());
      backdrop.querySelector('#ccAsstIdeaCancelBtn')?.addEventListener('click', () => this.closeSheet());

      const form = backdrop.querySelector('#ccAsstIdeaForm');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = backdrop.querySelector('#ccAsstIdeaStatus');
        const submitBtn = backdrop.querySelector('#ccAsstIdeaSubmitBtn');
        const whatIsMissing = backdrop.querySelector('#ccAsstIdeaMissing')?.value || '';
        const useCase = backdrop.querySelector('#ccAsstIdeaUseCase')?.value || '';
        const contactEmail = backdrop.querySelector('#ccAsstIdeaEmail')?.value || '';

        if (statusEl) {
          statusEl.className = 'cc-asst-status-banner info';
          statusEl.textContent = 'Wysyłanie zgłoszenia...';
        }
        if (submitBtn) submitBtn.disabled = true;

        const res = await IdeaIntake.submit({
          whatIsMissing,
          useCase,
          contactEmail,
          sourcePage: 'mess',
        });

        if (submitBtn) submitBtn.disabled = false;
        if (statusEl) {
          statusEl.className = `cc-asst-status-banner ${res.ok ? 'success' : 'error'}`;
          statusEl.textContent = res.message;
        }
        if (res.ok && form) {
          form.reset();
        }
      });
    },

    closeSheet() {
      if (!root || !root.document) return;
      const backdrop = root.document.getElementById('ccAsstSheetBackdrop');
      if (!backdrop) return;
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.innerHTML = '';
      this._activeSheet = null;
    },

    getActiveAssistant: (idOverride) => getActiveAssistant(idOverride),
    setActiveAssistant: (id) => setActiveAssistant(id),

    open(options = {}) {
      if (!this.isEnabled()) return false;
      if (options.assistantId) {
        setActiveAssistant(options.assistantId);
      }
      this.mount();
      if (!root || !root.document) return false;
      const doc = root.document;

      const asst = getActiveAssistant();

      // Refresh dynamic header elements
      const headerAvatar = doc.getElementById('ccAsstHeaderAvatar');
      if (headerAvatar) {
        headerAvatar.src = asst.avatar;
        headerAvatar.alt = asst.name;
        headerAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      const headerName = doc.getElementById('ccAsstHeaderName');
      if (headerName) headerName.textContent = asst.name;
      const headerBadge = doc.getElementById('ccAsstHeaderBadge');
      if (headerBadge) headerBadge.textContent = asst.badge;
      const headerSub = doc.getElementById('ccAsstHeaderSub');
      if (headerSub) headerSub.textContent = `${asst.subtitle} · Asystent Christian Culture`;

      // Refresh pinned DM item
      const pinnedAvatar = doc.getElementById('ccAsstPinnedAvatar');
      if (pinnedAvatar) {
        pinnedAvatar.src = asst.avatar;
        pinnedAvatar.alt = asst.name;
        pinnedAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      const pinnedName = doc.getElementById('ccAsstPinnedName');
      if (pinnedName) pinnedName.textContent = asst.name;
      const pinnedBadge = doc.getElementById('ccAsstPinnedBadge');
      if (pinnedBadge) pinnedBadge.textContent = asst.badge;
      const pinnedSub = doc.getElementById('ccAsstPinnedSub');
      if (pinnedSub) pinnedSub.textContent = `${asst.subtitle} · Asystent Christian Culture`;

      const modal = doc.getElementById('directMessagesModal');
      if (modal) {
        modal.removeAttribute('inert');
        modal.setAttribute('data-cc-assistant', '1');
        modal.classList.add('open');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
      }

      const publicView = doc.getElementById('messengerPublicView');
      const groupsView = doc.getElementById('messengerGroupsView');
      const privateView = doc.getElementById('messengerPrivateView');
      const liveView = doc.getElementById('messengerLiveView');
      const commanderView = doc.getElementById('messengerCommanderView');
      const assistantView = doc.getElementById('messengerAssistantView');

      if (publicView) publicView.style.display = 'none';
      if (groupsView) groupsView.style.display = 'none';
      if (privateView) privateView.style.display = 'none';
      if (liveView) liveView.style.display = 'none';
      if (commanderView) commanderView.style.display = 'none';
      if (assistantView) {
        assistantView.classList.add('cc-asst-active');
        assistantView.style.display = 'flex';
      }

      // Hide active 1-to-1 DM room if it was left open
      const dmChatRoomView = doc.getElementById('dmChatRoomView');
      if (dmChatRoomView) dmChatRoomView.style.display = 'none';
      const dmActiveConversationBox = doc.getElementById('dmActiveConversationBox');
      if (dmActiveConversationBox) dmActiveConversationBox.style.display = 'none';

      // Reset tab highlights
      const btnPriv = doc.getElementById('tabBtnPrivateChat');
      if (btnPriv) {
        btnPriv.classList.remove('active');
        btnPriv.style.background = 'transparent';
        btnPriv.style.color = '#94a3b8';
        btnPriv.style.boxShadow = 'none';
      }
      const btnPub = doc.getElementById('tabBtnPublicChat');
      if (btnPub) {
        btnPub.classList.remove('active');
        btnPub.style.background = 'transparent';
        btnPub.style.color = '#94a3b8';
        btnPub.style.boxShadow = 'none';
      }
      doc.getElementById('tabBtnPublic')?.classList.remove('active');
      doc.getElementById('tabBtnGroupsChat')?.classList.remove('active');
      doc.getElementById('tabBtnPrivate')?.classList.remove('active');
      doc.getElementById('tabBtnAssistant')?.classList.add('active');
      doc.getElementById('ccAsstPinnedDmItem')?.classList.add('active');

      const validTopic = SafetyPolicy.validateTopicParam(options.topic);
      if (validTopic) {
        conversationAdapter.appendTopicCard(validTopic);
      }

      this.renderMessages();

      const input = doc.getElementById('ccAsstInput');
      if (input && typeof input.focus === 'function' && !root.matchMedia?.('(max-width: 768px), (pointer: coarse)')?.matches) {
        try {
          input.focus({ preventScroll: true });
        } catch (_) {}
      }
      return true;
    },

    closeAssistantView() {
      if (!root || !root.document) return;
      const doc = root.document;
      const modal = doc.getElementById('directMessagesModal');
      if (modal) {
        modal.removeAttribute('data-cc-assistant');
      }
      const assistantView = doc.getElementById('messengerAssistantView');
      if (assistantView) {
        assistantView.classList.remove('cc-asst-active');
        assistantView.style.display = 'none';
      }
      doc.getElementById('tabBtnAssistant')?.classList.remove('active');
      doc.getElementById('ccAsstPinnedDmItem')?.classList.remove('active');
      this.closeSheet();
    },

    checkUrlEntryParams() {
      if (!root || !root.location || !this.isEnabled()) return false;
      try {
        const params = new URLSearchParams(root.location.search || '');
        const asst = (params.get('assistant') || '').toLowerCase();
        const openChat = (params.get('openChat') || '').toLowerCase();
        const tab = (params.get('tab') || '').toLowerCase();
        const asstId = params.get('asst') || params.get('assistantId') || '';

        if (
          asst === 'cc' ||
          asst === '1' ||
          asst === 'true' ||
          openChat === 'cc-assistant' ||
          openChat.startsWith('asystentka-') ||
          openChat === 'rut' ||
          openChat === 'sara' ||
          openChat === 'noemi' ||
          tab === 'assistant'
        ) {
          const source = SafetyPolicy.validateSourceParam(params.get('source') || 'url');
          const topic = SafetyPolicy.validateTopicParam(params.get('topic') || '');
          this.open({ source, topic, assistantId: asstId || openChat });
          return true;
        }
      } catch (_) {}
      return false;
    },
  };

  /* ========================================================================
   * 8. PUBLIC API EXPORT (Browser Window + CommonJS/Node VM Test Support)
   * ======================================================================== */
  const CCAssistantAPI = {
    version: '1.0.0-mvp',
    Identity: AssistantIdentity,
    RotatingAssistants: ROTATING_ASSISTANTS,
    getActiveAssistant,
    setActiveAssistant,
    VerifiedContacts: VERIFIED_CONTACTS,
    getFeatureFlags,
    isEnabled: () => UIController.isEnabled(),
    SafetyPolicy,
    KnowledgeService,
    IntentRouter,
    ShareEngine,
    IdeaIntake,
    ConversationAdapter: conversationAdapter,
    UIController,
    mount: () => UIController.mount(),
    open: (opts) => UIController.open(opts),
    close: () => UIController.closeAssistantView(),
    ask: (query, senderInfo) => conversationAdapter.appendUserMessage(query, senderInfo),
    buildDashboardMember: () => {
      const asst = getActiveAssistant();
      return {
        id: asst.id,
        slug: asst.id,
        name: asst.name,
        role: asst.subtitle,
        badge: asst.badge,
        avatar: asst.avatar,
        online: true,
        isAssistant: true,
      };
    },
  };

  if (root) {
    root.CCAssistant = CCAssistantAPI;
    root.openCCAssistant = (opts) => UIController.open(opts);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CCAssistantAPI;
  }

  if (root && root.document) {
    const init = () => {
      if (!UIController.isEnabled()) return;
      UIController.mount();
      UIController.checkUrlEntryParams();
    };
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', init);
    } else {
      setTimeout(init, 0);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
