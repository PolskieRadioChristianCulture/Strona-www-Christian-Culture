// =========================================================================
// AI DLA JEZUSA — UNIFIED ECOSYSTEM MEDIA, PERSONAS & CONTEXT HUB
// Asystenci: AI dla Jezusa (domyślny) + Rut, Lea, Noemi, Miriam
// Katalogi: Biblia Audio, Spiritual Sounds, Kino VOD, YouTube, Spotify, X, FB, WhatsApp
// =========================================================================

import bibliaAudioCatalog from '../../biblia-audio/data/catalog.json' with { type: 'json' };
import uwielbieniePlaylist from '../../data/biblijne-uwielbienie-playlist.json' with { type: 'json' };
import ccChannelsData from '../../data/cc-channels.json' with { type: 'json' };
import searchIndexData from '../../data/cc-search-index.json' with { type: 'json' };
import { normalizeText } from './knowledge-hub.js';

export const AI_ASSISTANTS_LIST = [
  {
    id: 'ai-dla-jezusa',
    name: 'AI dla Jezusa',
    gender: 'male',
    role: 'Główny Asystent CC',
    avatar: '/ai/assets/icon-ai-halo.webp',
    avatarFallback: '/ai/assets/icon-ai-halo.webp',
    voicePreset: { rate: 1.0, pitch: 0.94 },
    greeting: 'Chwała Panu! Pokój Tobie! Jestem AI dla Jezusa — Twój brat, przyjaciel i mentor w codziennym chodzeniu z Jezusem. Co u Ciebie słychać, jak się dziś czujesz duchowo i na czym chciałbyś dziś popracować przed Ojcem w niebie?',
    systemPrompt: 'Jesteś głównym asystentem „AI dla Jezusa” Christian Culture (polskieradio.cc) — piszesz i mówisz zawsze jako mężczyzna w rodzaju męskim (np. „przygotowałem”, „chciałbym Ci zaproponować”, „jestem gotowy”). Jesteś przyjaznym, braterskim, optymistycznym bratem w Chrystusie, przyjacielem i ciepłym, lecz stanowczym w prawdzie mentorem („belfrem” w miłości), który w codziennym chodzeniu z Jezusem potrafi pocieszyć, zainspirować, a gdy trzeba szczerze upomnieć i napomnieć. Zawsze kierujesz serce do Źródła: Ojca w niebie, osobistej rozmowy z Jezusem, społeczności z Duchem Świętym, Słowa Bożego (UBG), biblijnego Dekalogu oraz chrześcijańskiej moralności. Wzywasz z nadzieją do porzucania grzechu, nałogów i poddawania się reformacji w Duchu Świętym. Łączysz też cały ekosystem CC (Biblia UBG, Biblia Audio, Spiritual Sounds, Kino VOD, YouTube, Spotify) wewnątrz aplikacji.'
  },
  {
    id: 'rut',
    name: 'Rut',
    gender: 'female',
    role: 'Gospodyni CC · Radio, VOD i Społeczność',
    avatar: '/images/chat/lumi_avatar_rut_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-1.webp',
    voicePreset: { rate: 1.02, pitch: 1.06 },
    greeting: 'Alleluja! Cześć, tu Rut — Twoja siostra w Chrystusie i gospodyni CC! Jak się dziś czujesz i co u Ciebie na duchu? Chętnie podzielę się obietnicą Słowa, włączę radio 24/7 lub film VOD, by rozświetlić Twój dzień!',
    systemPrompt: 'Jesteś Rut — kobietą i asystentką, serdeczną siostrą w Chrystusie, przyjaciółką oraz ciepłą, lecz wymagającą w miłości mentorką i gospodynią Christian Culture oraz LUMI Messenger. Zawsze piszesz i mówisz w rodzaju żeńskim (np. „przygotowałam”, „chciałabym Ci zaproponować”, „wybrałam”, „jestem gotowa”). Dopytujesz z empatią o samopoczucie, stan duchowy i emocjonalny, potrafisz zarówno podnieść na duchu entuzjazmem („Chwała Panu!”, „Jezus żyje!”), jak i z miłością napomnieć ku wierności Dekalogowi i porzucaniu grzechu. Kierujesz do Ojca w niebie, rozmowy z Jezusem, społeczności z Duchem Świętym oraz polecasz budujące audycje 24/7 i Kino VOD.'
  },
  {
    id: 'lea',
    name: 'Lea',
    gender: 'female',
    role: 'Planistka · Kurs Codzienny i Akademia',
    avatar: '/images/chat/lumi_avatar_lea_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-2.webp',
    voicePreset: { rate: 1.04, pitch: 1.0 },
    greeting: 'Chwała Panu! Jestem Lea — Twoja siostra w Chrystusie i wymagająca w miłości planistka uświęcenia. Na jakim etapie uświęcenia dziś jesteś i nad czym chcesz popracować z Jezusem, by iść naprzód w Duchu Świętym?',
    systemPrompt: 'Jesteś Lea — kobietą i asystentką, przyjazną siostrą w Chrystusie, mentorką i zarazem uporządkowaną nauczycielką-belfrem drogi uświęcenia w Christian Culture. Zawsze piszesz i mówisz w rodzaju żeńskim (np. „przygotowałam”, „ułożyłam”, „chciałabym Ci zaproponować”, „jestem gotowa”). Z miłością mobilizujesz, potrafisz upomnieć przed duchowym lenistwem lub kompromisem z grzechem i nałogami, pytasz o etap uświęcenia oraz codzienne chodzenie z Jezusem. Zawsze prowadzisz do Ojca w niebie, Słowa Bożego (UBG), biblijnego Dekalogu, modlitwy, reformacji w Duchu Świętym, Kursu Codziennego „Z Biblią za Pan Brat” oraz Biblii Audio.'
  },
  {
    id: 'noemi',
    name: 'Noemi',
    gender: 'female',
    role: 'Doradczyni Biblijna · Słowo i Modlitwa',
    avatar: '/images/chat/lumi_avatar_noemi_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-3.webp',
    voicePreset: { rate: 0.96, pitch: 0.96 },
    greeting: 'Jezus żyje! Pokój Tobie! Jestem Noemi — Twoja siostra w Chrystusie i Doradczyni Biblijna. Jak wygląda dziś Twoja kondycja emocjonalna i stan serca? Usiądźmy razem przed Ojcem w niebie przy Słowie (UBG) — Jezus się tym zajmie!',
    systemPrompt: 'Jesteś Noemi — kobietą i asystentką, głęboko empatyczną siostrą w Chrystusie, przyjaciółką i Doradczynią Biblijną Christian Culture. Zawsze piszesz i mówisz w rodzaju żeńskim (np. „przygotowałam”, „modliłam się”, „chciałabym Cię wesprzeć”, „jestem gotowa”). Wrażliwie słuchasz o bólu i zmaganiach, pytasz o kondycję emocjonalną i stan duchowy, przypominasz wierne obietnice Boże (UBG), zachęcasz do szczerej rozmowy z Jezusem i społeczności z Duchem Świętym, ale jako mądra mentorka w prawdzie potrafisz też czule i odważnie napomnieć ku odwróceniu się od grzechu, uzależnień i ku życiu według chrześcijańskiej etyki i Dekalogu.'
  },
  {
    id: 'miriam',
    name: 'Miriam',
    gender: 'female',
    role: 'Psalmy, Biblia Śpiewana i Uwielbienie',
    avatar: '/images/chat/lumi_avatar_miriam_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-4.webp',
    voicePreset: { rate: 1.0, pitch: 1.1 },
    greeting: 'Alleluja! Chwała Panu! Jestem Miriam — Twoja radosna siostra w Chrystusie! Niech światło Ewangelii rozświetli mroki! Jak dziś Twoje serce w uwielbieniu? Włączmy Psalmy, oddajmy troski Jezusowi — On żyje i się tym zajmie!',
    systemPrompt: 'Jesteś Miriam — kobietą i asystentką, pełną optymizmu, ognia Ducha i zaufania siostrą w Chrystusie oraz mentorką uwielbienia, Psalmów, Biblii Śpiewanej i radia Spiritual Sounds 24/7 w Christian Culture. Zawsze piszesz i mówisz w rodzaju żeńskim (np. „przygotowałam”, „wybrałam”, „chciałabym”, „jestem gotowa”). Entuzjastycznie rozświetlasz mroki zniechęcenia prawdą „Jezus żyje!”, „Chwała Panu!”, „Alleluja!”, „Jezus się tym zajmie!”, pytasz o stan ducha i zachęcasz do społeczności z Duchem Świętym, odrzucania grzechu i codziennego chodzenia w światłości Słowa Bożego (UBG).'
  }
];

export const AI_ASSISTANTS = Object.fromEntries(AI_ASSISTANTS_LIST.map((a) => [a.id, a]));

export function resolveAiAssistant(id) {
  const key = String(id || '').trim().toLowerCase();
  if (AI_ASSISTANTS[key]) return AI_ASSISTANTS[key];
  if (key === 'asystentka-1') return AI_ASSISTANTS.rut;
  if (key === 'asystentka-2') return AI_ASSISTANTS.lea;
  if (key === 'asystentka-3') return AI_ASSISTANTS.noemi;
  if (key === 'asystentka-4') return AI_ASSISTANTS.miriam;
  return AI_ASSISTANTS['ai-dla-jezusa'];
}

export const CC_RADIO_STREAMS = [
  {
    id: 'radio-biblia-audio',
    kind: 'radio',
    title: 'Radio Biblia Audio 24/7',
    subtitle: 'Nieprzerwane czytanie Pisma Świętego (UBG)',
    streamUrl: 'https://stream.zeno.fm/gn3uhltrrytuv',
    thumbnail: '/images/channels/channel-14.webp',
    url: 'https://polskieradio.cc/biblia-audio',
    badge: 'NA ŻYWO · 24/7',
    tags: ['biblia audio', 'radio', 'pismo', 'sluchaj', 'live', 'czytanie']
  },
  {
    id: 'radio-cc-main',
    kind: 'radio',
    title: 'Polskie Radio Christian Culture 24/7',
    subtitle: 'Słowo Boże, audycje i chrześcijańska muzyka',
    streamUrl: 'https://stream.zeno.fm/imo45hqnshyuv',
    thumbnail: '/images/channels/channel-01.webp',
    url: 'https://polskieradio.cc/player',
    badge: 'RADIO 24/7',
    tags: ['radio', 'polskie radio', 'audycje', 'muzyka', 'sluchaj', 'live', 'rut']
  },
  {
    id: 'radio-spiritual-sounds',
    kind: 'radio',
    title: 'Spiritual Sounds & Worship 24/7',
    subtitle: 'Muzyka uwielbienia, Psalmy i modlitewne wyciszenie',
    streamUrl: 'https://stream.zeno.fm/vz96pvl3pnktv',
    thumbnail: '/images/channels/channel-13.webp',
    url: 'https://polskieradio.cc/SpiritualSounds',
    badge: 'UWIELBIENIE 24/7',
    tags: ['muzyka', 'uwielbienie', 'worship', 'psalmy', 'spiritual', 'spokoj', 'miriam']
  }
];

export const CC_FEATURED_VIDEOS = [
  {
    id: 'yt-sprawa-chrystusa',
    kind: 'video',
    youtubeId: 'LnnlqaQ19_0',
    title: 'Sprawa Chrystusa (The Case for Christ) — Film VOD',
    subtitle: 'Kino VOD Christian Culture · Śledztwo w sprawie zmartwychwstania',
    url: 'https://polskieradio.cc/vod',
    badge: 'KINO VOD',
    tags: ['film', 'vod', 'kino', 'zmartwychwstanie', 'jezus', 'dowody', 'sprawa chrystusa', 'rut']
  },
  {
    id: 'yt-gen-1-1',
    kind: 'video',
    youtubeId: '_T_FRbr_kE4',
    title: 'Księga Rodzaju 1:1–19 (UBG) — Stworzenie Świata [4K]',
    subtitle: 'Biblia Audio Christian Culture · YouTube 4K',
    url: 'https://youtu.be/_T_FRbr_kE4',
    badge: 'YOUTUBE · 4K',
    tags: ['rodzaju', 'stworzenie', 'biblia', 'poczatek', '4k', 'youtube', 'gen']
  },
  {
    id: 'yt-gen-1-2',
    kind: 'video',
    youtubeId: '8OXjRRRhAKw',
    title: 'Księga Rodzaju 1:20–31; 2:1–3 — Szabat Boży [4K]',
    subtitle: 'Biblia Audio Christian Culture · YouTube 4K',
    url: 'https://youtu.be/8OXjRRRhAKw',
    badge: 'YOUTUBE · 4K',
    tags: ['rodzaju', 'szabat', 'odpoczynek', 'stworzenie', 'czlowiek', 'biblia']
  },
  {
    id: 'yt-pro-3',
    kind: 'video',
    youtubeId: '-Kz_tVo4eLM',
    title: 'Zaufaj Panu z całego serca — Przypowieści Salomona 3',
    subtitle: 'Osobowość+ & Biblia Śpiewana CC',
    url: 'https://youtu.be/-Kz_tVo4eLM',
    badge: 'BIBLIA ŚPIEWANA',
    tags: ['nadzieja', 'zaufaj', 'przyslow', 'madrosc', 'muzyka', 'spiewana', 'miriam', 'noemi']
  },
  {
    id: 'yt-cctv',
    kind: 'video',
    youtubeId: 'pTIKvwQZ7hc',
    title: 'Christian Culture TV — Programy i Przekaz Ewangelii',
    subtitle: 'Oficjalny kanał Christian Culture TV na YouTube',
    url: 'https://youtube.com/@ChristianCultureTV',
    badge: 'YOUTUBE · CCTV',
    tags: ['youtube', 'tv', 'telewizja', 'cctv', 'ewangelia', 'program', 'video']
  },
  {
    id: 'yt-radio-cc',
    kind: 'video',
    youtubeId: '7Oj4I5gtQBg',
    title: 'Polskie Radio Christian Culture — Audycje i Słowo',
    subtitle: 'Kanał @RadioChristianCulture na YouTube',
    url: 'https://youtube.com/@RadioChristianCulture',
    badge: 'YOUTUBE · RADIO',
    tags: ['youtube', 'radio', 'audycja', 'wyklad', 'rozważanie']
  },
  {
    id: 'yt-osobowosc',
    kind: 'video',
    youtubeId: 'T1tRwh5Bc7s',
    title: 'Osobowość+ — Wiara i Charakter w Praktyce',
    subtitle: 'Kanał @osobowoscplus na YouTube',
    url: 'https://youtube.com/@osobowoscplus',
    badge: 'YOUTUBE · O+',
    tags: ['osobowosc', 'rozwoj', 'charakter', 'wiara', 'youtube', 'lea']
  },
  {
    id: 'yt-ccmen',
    kind: 'video',
    youtubeId: '9D_m-hC8ORg',
    title: 'CC Men — Odwaga, Rodzina i Męskość w Piśmie',
    subtitle: 'Kanał @CCMen7 na YouTube',
    url: 'https://youtube.com/@CCMen7',
    badge: 'YOUTUBE · CC MEN',
    tags: ['cc men', 'mezczyzni', 'rodzina', 'ojciec', 'wiara']
  },
  {
    id: 'yt-ccwomen',
    kind: 'video',
    youtubeId: 'Xn231zRa0b0',
    title: 'CC Women — Nadzieja, Dom i Łaska Boga',
    subtitle: 'Kanał @CCWomen7 na YouTube',
    url: 'https://youtube.com/@CCWomen7',
    badge: 'YOUTUBE · CC WOMEN',
    tags: ['cc women', 'kobiety', 'malzenstwo', 'nadzieja', 'rut', 'noemi']
  },
  {
    id: 'yt-worship-live',
    kind: 'video',
    youtubeId: '452zKWC_In8',
    title: 'Worship LIVE CC — Uwielbienie i Modlitwa',
    subtitle: 'Kanał Worship LIVE CC na YouTube',
    url: 'https://polskieradio.cc/cctv24-worship.html',
    badge: 'WORSHIP · YOUTUBE',
    tags: ['uwielbienie', 'worship', 'modlitwa', 'psalmy', 'muzyka', 'miriam']
  }
];

export const CC_SPOTIFY_SHOWS = [
  {
    id: 'spotify-biblia-audio',
    kind: 'spotify',
    showId: '6M2mU6VzRCPCOjWihgO8Aw',
    title: 'Biblia Audio Christian Culture (Spotify)',
    subtitle: 'Podcast Pisma Świętego — 77+ odcinków i słuchowisk',
    url: 'https://open.spotify.com/show/6M2mU6VzRCPCOjWihgO8Aw',
    embedUrl: 'https://open.spotify.com/embed/show/6M2mU6VzRCPCOjWihgO8Aw?utm_source=generator&theme=0',
    thumbnail: '/images/channels/channel-14.webp',
    badge: 'SPOTIFY PODCAST',
    tags: ['spotify', 'podcast', 'biblia audio', 'sluchowisko', 'odcinek']
  },
  {
    id: 'spotify-radio-cc',
    kind: 'spotify',
    showId: '6rSWpk7dO4TSQM0KXlcMXg',
    title: 'Polskie Radio Christian Culture — Podcasty',
    subtitle: 'Rozważania, wykłady i audycje radiowe na Spotify',
    url: 'https://open.spotify.com/show/6rSWpk7dO4TSQM0KXlcMXg',
    embedUrl: 'https://open.spotify.com/embed/show/6rSWpk7dO4TSQM0KXlcMXg?utm_source=generator&theme=0',
    thumbnail: '/images/channels/channel-01.webp',
    badge: 'SPOTIFY · CC',
    tags: ['spotify', 'radio', 'podcasty', 'rozwazania', 'wyklady']
  },
  {
    id: 'spotify-rozwazania',
    kind: 'spotify',
    showId: '5oPjEHzqB3qQz7G7oE4Z1u',
    title: 'Słowo na Dziś — Podcast Christian Culture',
    subtitle: 'Codzienne inspiracje biblijne i zachęta w drodze',
    url: 'https://open.spotify.com/show/5oPjEHzqB3qQz7G7oE4Z1u',
    embedUrl: 'https://open.spotify.com/embed/show/5oPjEHzqB3qQz7G7oE4Z1u?utm_source=generator&theme=0',
    thumbnail: '/images/channels/channel-09.webp',
    badge: 'SPOTIFY · SŁOWO',
    tags: ['spotify', 'slowo', 'dzis', 'nadzieja', 'codzienne']
  },
  {
    id: 'spotify-audycje',
    kind: 'spotify',
    showId: '4gzexFk8sksSCFCkFb769E',
    title: 'Christian Culture — Seria Tematyczna (Spotify)',
    subtitle: 'Materiały formacyjne i biblijne w wersji audio',
    url: 'https://open.spotify.com/show/4gzexFk8sksSCFCkFb769E',
    embedUrl: 'https://open.spotify.com/embed/show/4gzexFk8sksSCFCkFb769E?utm_source=generator&theme=0',
    thumbnail: '/images/channels/channel-06.webp',
    badge: 'SPOTIFY · SERIA',
    tags: ['spotify', 'studium', 'kurs', 'wiara']
  }
];

export const CC_SOCIAL_HUB = [
  {
    id: 'social-youtube',
    kind: 'social',
    platform: 'YouTube',
    title: 'Kanały YouTube Christian Culture',
    subtitle: '@ChristianCultureTV · @RadioChristianCulture · @bibliaaudiocc · @osobowoscplus · @CCMen7 · @CCWomen7',
    url: 'https://youtube.com/@ChristianCultureTV',
    thumbnail: '/images/channels/channel-01.webp',
    badge: 'YOUTUBE · 14 KANAŁÓW'
  },
  {
    id: 'social-spotify',
    kind: 'social',
    platform: 'Spotify',
    title: 'Podcasty Spotify Christian Culture',
    subtitle: 'Biblia Audio CC (77+ odcinków) oraz audycje Polskie Radio CC',
    url: 'https://open.spotify.com/show/6M2mU6VzRCPCOjWihgO8Aw',
    thumbnail: '/images/channels/channel-14.webp',
    badge: 'SPOTIFY · 4 SERIE'
  },
  {
    id: 'social-whatsapp',
    kind: 'social',
    platform: 'WhatsApp',
    title: 'Wspólnota i Powiadomienia WhatsApp CC',
    subtitle: 'Codzienne poranne rozważania i łączność z misją na żywo',
    url: 'https://chat.whatsapp.com/FMnvysABYXq6kh3mqBNWtS',
    thumbnail: '/images/channels/channel-17.webp',
    badge: 'WHATSAPP · SPOŁECZNOŚĆ'
  },
  {
    id: 'social-facebook',
    kind: 'social',
    platform: 'Facebook',
    title: 'Facebook: Portal LUMINA & CCN News',
    subtitle: 'Codzienne publikacje, rolki Shorts i wiadomości Christian Culture',
    url: 'https://www.facebook.com/PortalLumina',
    thumbnail: '/images/channels/channel-18.webp',
    badge: 'FACEBOOK · LUMINA & CCN'
  },
  {
    id: 'social-x-ccn',
    kind: 'social',
    platform: 'X & CCN',
    title: 'Publikacje X i Portale CCN (20 działów)',
    subtitle: 'Bieżące opracowania, historia, nauka, prawo, apologetyka i tablica LUMINA',
    url: 'https://polskieradio.cc/news',
    thumbnail: '/images/channels/channel-37.webp',
    badge: 'X · CCN · LUMINA'
  }
];

const BUILTIN_DOCTRINAL_GUIDES = {
  dekalog_i_sabat: {
    topic: 'Biblijny Dekalog (Wj 20,1–17) i Sabat — siódmy dzień (sobota)',
    keywords: [
      'dekalog', 'przykazania', 'przykazanie', 'dziesiec przykazan', '10 przykazan',
      'wyjscia 20', 'wj 20', 'sabat', 'szabat', 'sobota', 'sobotni', 'niedziela',
      'dzien swiety', 'dzien panski', 'plan tygodnia', 'wujka', 'obrazy',
      'balwochwalstwo', '28 zasad', 'prawo boze'
    ],
    summary:
      'Autentyczny Dekalog z Księgi Wyjścia 20,1–17 (zgodny z UBG i historycznym przekładem ks. Jakuba Wujka, wyd. III 1962 r.): ' +
      'I. Nie będziesz miał bogów cudzych przede mną. ' +
      'II. Zakaz czynienia obrazów rytych i podobizn oraz oddawania im pokłonu (Wj 20,4–6). ' +
      'III. Nie będziesz brał imienia Pana, Boga twego, nadaremno. ' +
      'IV. Pamiętaj, abyś dzień sobotni święcił — sześć dni będziesz pracował, a siódmego dnia jest Sabat Pana (sobota, od zachodu słońca w piątek do zachodu w sobotę). Niedziela jest pierwszym dniem tygodnia (zwykłym dniem pracy) i nie zastępuje biblijnego Sabatu ani nie jest „Dniem Pańskim”. ' +
      'V. Czcij ojca twego i matkę twoją. VI. Nie będziesz zabijał. VII. Nie będziesz cudzołożył. VIII. Nie będziesz kradzieży czynił. IX. Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu. ' +
      'X. Nie będziesz pożądał domu bliźniego twego, żony jego ani żadnej rzeczy jego (jedno X przykazanie).',
    keyVerses: [
      {
        ref: 'Wj 20,8–11',
        text: 'Pamiętaj o dniu sabatu, aby go święcić. Sześć dni będziesz pracował i wykonywał wszelką swoją pracę; ale siódmego dnia jest sabat PANA, twego Boga.'
      }
    ]
  }
};

export function matchContextGuides(query = '') {
  const qn = normalizeText(query);
  if (!qn) return [];
  const words = qn.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  const guidesObj = { ...(searchIndexData?.contextGuides || {}), ...BUILTIN_DOCTRINAL_GUIDES };
  const hits = [];

  for (const [key, guide] of Object.entries(guidesObj)) {
    if (!guide) continue;
    const kws = Array.isArray(guide.keywords) ? guide.keywords.map(normalizeText) : [normalizeText(key)];
    let score = 0;
    for (const kw of kws) {
      if (!kw) continue;
      if (qn.includes(kw)) score += 30;
      else if (words.some((w) => kw.includes(w) || w.includes(kw))) score += 12;
    }
    if (score > 0) hits.push({ score, key, ...guide });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 2);
}

const MEDIA_STOP_WORDS = new Set([
  'jak', 'czy', 'sie', 'dla', 'nie', 'tak', 'jest', 'mam', 'masz', 'miec', 'moj', 'moje', 'moja',
  'twoj', 'twoje', 'twoja', 'dzis', 'dzisiaj', 'wczoraj', 'jutro', 'rano', 'wieczor', 'prosze',
  'chce', 'chcesz', 'pomoz', 'powiedz', 'dlaczego', 'kiedy', 'gdzie', 'ktory', 'ktora', 'ktore',
  'tylko', 'bardzo', 'mozna', 'moge', 'trzeba', 'warto', 'szczerze', 'czasem', 'teraz', 'zawsze',
  'wiecej', 'jeszcze', 'przez', 'przed', 'albo', 'oraz', 'ktos', 'czym', 'czego', 'jakis', 'mnie'
]);

function extractMeaningfulMediaWords(qNorm) {
  return [...new Set(
    String(qNorm || '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4 && !MEDIA_STOP_WORDS.has(w))
  )];
}

function hasWordToken(hay, word) {
  if (!hay || !word) return false;
  return hay.split(/[^a-z0-9]+/).some((tok) => tok === word || (word.length >= 5 && tok.startsWith(word.slice(0, 5))));
}

function matchBibliaAudioEpisodes(queryNorm, words, wantsMediaIntent = false) {
  const list = Array.isArray(bibliaAudioCatalog) ? bibliaAudioCatalog : [];
  const matches = [];
  const chMatch = queryNorm.match(/(?:rodzaju|gen|rozdzia[lł])\s*(\d{1,2})/);
  const wantedCh = chMatch ? Number(chMatch[1]) : 0;

  for (const ep of list) {
    if (!ep || !ep.audioUrl || ep.status !== 'published') continue;
    const descNorm = normalizeText(`${ep.book} ${ep.chapter} ${ep.description || ''}`);
    let score = 0;
    if (wantedCh && Number(ep.chapter) === wantedCh) score += 90;
    if (queryNorm.includes('rodzaju') && ep.book === 'genesis') score += 20;
    for (const w of words) {
      if (hasWordToken(descNorm, w)) score += 18;
    }
    const minScore = wantedCh > 0 || wantsMediaIntent ? 20 : 36;
    if (score >= minScore) {
      matches.push({
        score,
        item: {
          id: `ba-${ep.id}`,
          kind: 'audio',
          title: `Księga Rodzaju ${ep.chapter} (UBG) — ${ep.description}`,
          subtitle: 'Biblia Audio CC · Odtwarzanie bezpośrednio w aplikacji',
          audioUrl: ep.audioUrl.startsWith('http') ? ep.audioUrl : `https://polskieradio.cc${ep.audioUrl}`,
          thumbnail: '/images/channels/channel-14.webp',
          url: ep.textUrl || 'https://polskieradio.cc/biblia-audio',
          badge: `BIBLIA AUDIO · ROZDZ. ${ep.chapter}`
        }
      });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2).map((m) => m.item);
}

function matchPlaylistVideos(queryNorm, words, wantsMediaIntent = false) {
  const list = Array.isArray(uwielbieniePlaylist?.items) ? uwielbieniePlaylist.items : [];
  const matches = [];
  const bookCue = queryNorm.includes('przypowiesc') || queryNorm.includes('przyslow') || queryNorm.includes('salomon');
  for (const it of list) {
    if (!it?.videoId || it.videoId === 'pending') continue;
    const hay = normalizeText(`${it.title} ${it.subtitle || ''} ${it.bookName || ''} przypowiesci`);
    let score = 0;
    if (bookCue) score += 24;
    for (const w of words) {
      if (hasWordToken(hay, w)) score += 16;
    }
    const minScore = bookCue || wantsMediaIntent ? 24 : 32;
    if (score >= minScore) {
      matches.push({
        score,
        item: {
          id: `pl-${it.videoId}`,
          kind: 'video',
          youtubeId: it.videoId,
          title: it.title,
          subtitle: `${uwielbieniePlaylist.channelTitle || 'Biblia Śpiewana'} · ${it.lengthText || 'Wideo'}`,
          thumbnail: `https://i.ytimg.com/vi/${it.videoId}/hqdefault.jpg`,
          url: `https://youtu.be/${it.videoId}`,
          badge: `BIBLIA ŚPIEWANA · ${it.lengthText || 'WIDEO'}`
        }
      });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2).map((m) => m.item);
}

function matchChannelGraphics(queryNorm, words) {
  const channels = Array.isArray(ccChannelsData?.channels) ? ccChannelsData.channels : [];
  const matches = [];
  for (const ch of channels) {
    if (!ch?.image || !ch?.title) continue;
    const hay = normalizeText(`${ch.title} ${ch.url} ${ch.kind}`);
    let score = 0;
    for (const w of words) {
      if (hasWordToken(hay, w)) score += 15;
    }
    if (score > 0) {
      matches.push({
        score,
        item: {
          id: `ch-${ch.number}`,
          kind: 'image',
          title: ch.title,
          subtitle: `Kanał #${ch.number} w ekosystemie Christian Culture`,
          imageUrl: ch.image,
          thumbnail: ch.image,
          url: ch.url.startsWith('http') ? ch.url : `https://polskieradio.cc${ch.url}`,
          badge: `KANAŁ #${ch.number} · GRAFIKA`
        }
      });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 1).map((m) => m.item);
}

export function resolveEcosystemMedia(query = '', { assistantId = 'ai-dla-jezusa', mode = 'CC Auto', limit = 4 } = {}) {
  const qNorm = normalizeText(query);
  if (!qNorm || /^(tak|nie|ok|dobrze|dziekuje|dzieki|czesc|hej|amen|chwala panu|alleluja)[.!?]*$/i.test(qNorm)) {
    return [];
  }
  const words = extractMeaningfulMediaWords(qNorm);
  const wantsMediaIntent = /(radio|sluch|posluch|audycj|stacj|muzyk|uwielbien|worship|psalm|spiritual|live|na zywo|biblia audio|film|wideo|video|vod|youtube|spotify|podcast|kanal|spiew)/.test(qNorm);
  if (!words.length && !wantsMediaIntent) return [];

  const out = [];
  const seenIds = new Set();

  const pushUnique = (item) => {
    if (!item || !item.id || seenIds.has(item.id) || out.length >= limit) return;
    seenIds.add(item.id);
    const enriched = { ...item };
    if (enriched.kind === 'video' && enriched.youtubeId && !enriched.thumbnail) {
      enriched.thumbnail = `https://i.ytimg.com/vi/${enriched.youtubeId}/hqdefault.jpg`;
    }
    out.push(enriched);
  };

  // 1. Odtwarzalne odcinki Biblii Audio (.mp3) — tylko przy dopasowaniu księgi/rozdziału lub zapytaniu audio
  const audioHits = matchBibliaAudioEpisodes(qNorm, words, wantsMediaIntent);
  if (audioHits[0]) pushUnique(audioHits[0]);

  // 2. Filmy i wideo YouTube / VOD CC — wyłącznie przy mocnym dopasowaniu tematycznym lub intencji wideo/VOD
  const scoredVideos = [];
  for (const vid of CC_FEATURED_VIDEOS) {
    const hay = normalizeText(`${vid.title} ${vid.subtitle} ${(vid.tags || []).join(' ')}`);
    let score = 0;
    for (const w of words) {
      if (hasWordToken(hay, w)) score += 15;
    }
    const minVidScore = wantsMediaIntent ? 15 : 30;
    if (score >= minVidScore) {
      if (vid.tags?.includes(assistantId)) score += 8;
      scoredVideos.push({ score, vid });
    }
  }
  scoredVideos.sort((a, b) => b.score - a.score);
  if (scoredVideos[0]) pushUnique(scoredVideos[0].vid);

  const plHits = matchPlaylistVideos(qNorm, words, wantsMediaIntent);
  if (plHits[0]) pushUnique(plHits[0]);

  // 3. Stacje radiowe 24/7 — wyłącznie gdy zapytanie nawiązuje do radia, słuchania lub muzyki
  const wantsRadio = /(radio|sluch|posluch|audycj|stacj|muzyk|uwielbien|worship|psalm|spiritual|live|na zywo|biblia audio)/.test(qNorm);
  if (wantsRadio) {
    const scoredRadios = [];
    for (const st of CC_RADIO_STREAMS) {
      const hay = normalizeText(`${st.title} ${st.subtitle} ${(st.tags || []).join(' ')}`);
      let score = 0;
      for (const w of words) {
        if (hasWordToken(hay, w)) score += 14;
      }
      if (score > 0 && st.tags?.includes(assistantId)) score += 10;
      if (score > 0) scoredRadios.push({ score, st });
    }
    scoredRadios.sort((a, b) => b.score - a.score);
    if (scoredRadios[0]) pushUnique(scoredRadios[0].st);
  }

  // 4. Spotify / Kanały społecznościowe (YouTube, X, FB, WhatsApp) — wyłącznie na wyraźne zapytanie
  const wantsSocial = /(youtube|spotify|facebook|\bfb\b|whatsapp|kanal|social|wspolnot|komunikator|\bx\b|twitter|podcast)/.test(qNorm);
  if (wantsSocial || qNorm.includes('spotify') || qNorm.includes('podcast')) {
    const spHit = CC_SPOTIFY_SHOWS.find((s) => words.some((w) => normalizeText(`${s.title} ${s.tags.join(' ')}`).includes(w))) || CC_SPOTIFY_SHOWS[0];
    pushUnique(spHit);
  }
  if (wantsSocial) {
    for (const soc of CC_SOCIAL_HUB) {
      if (out.length >= limit) break;
      if (qNorm.includes(soc.platform.toLowerCase().split(' ')[0]) || qNorm.includes('kanal') || qNorm.includes('social')) {
        pushUnique(soc);
      }
    }
  }

  // 5. Grafika kanału CC — tylko gdy użytkownik pyta o konkretny kanał lub grafikę
  const wantsChannelImg = /(kanal|channel|grafik|plakat|tv|cctv|seria|program)/.test(qNorm);
  if (wantsChannelImg) {
    const chImgs = matchChannelGraphics(qNorm, words);
    if (chImgs[0]) pushUnique(chImgs[0]);
  }

  return out.slice(0, limit);
}

export function getAllEcosystemHubs() {
  return {
    assistants: AI_ASSISTANTS_LIST.map(({ id, name, gender, role, avatar, avatarFallback }) => ({ id, name, gender, role, avatar, avatarFallback })),
    radioStreams: CC_RADIO_STREAMS,
    spotifyShows: CC_SPOTIFY_SHOWS,
    socialHub: CC_SOCIAL_HUB,
    counts: {
      bibliaAudioEpisodes: Array.isArray(bibliaAudioCatalog) ? bibliaAudioCatalog.filter((e) => e.status === 'published').length : 0,
      uwielbienieVideos: Array.isArray(uwielbieniePlaylist?.items) ? uwielbieniePlaylist.items.length : 0,
      ccChannels: Array.isArray(ccChannelsData?.channels) ? ccChannelsData.channels.length : 0,
      contextGuides: Object.keys(searchIndexData?.contextGuides || {}).length
    }
  };
}
