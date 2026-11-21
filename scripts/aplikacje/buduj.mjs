#!/usr/bin/env node
/*
 * Jedno źródło prawdy dla Centrum Aplikacji Christian Culture (/aplikacje/ PL oraz /aplikacje/en/ EN).
 * Generuje deterministycznie:
 *   - aplikacje/index.html (PL, index,follow)
 *   - aplikacje/en/index.html (EN, index,follow)
 * Zasady pancerne:
 *   - Tylko publiczne usługi Christian Culture (bez prywatnego panelu dowodzenia)
 *   - Zero martwych linków Google Play 404 (pl.cclite.app + oficjalny profil dev?id=5215448773598149938)
 *   - Zero fontawesome, wyłącznie zweryfikowane zasoby graficzne.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ASSETS_V = '20261121_prod1';

export const PLAY_APP_PL = 'https://play.google.com/store/apps/details?id=pl.cclite.app&hl=pl';
export const PLAY_APP_EN = 'https://play.google.com/store/apps/details?id=pl.cclite.app&hl=en';
export const PLAY_DEV_PL = 'https://play.google.com/store/apps/dev?id=5215448773598149938&hl=pl';
export const PLAY_DEV_EN = 'https://play.google.com/store/apps/dev?id=5215448773598149938&hl=en';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const APPS = [
  {
    id: 'android-cc',
    wide: true,
    cats: ['android', 'media', 'biblia'],
    platformsPl: ['Android', 'Google Play'],
    platformsEn: ['Android', 'Google Play'],
    badgePlay: true,
    isIcon: true,
    img: '/app-christian-culture.png',
    hrefPl: PLAY_APP_PL,
    hrefEn: PLAY_APP_EN,
    ext: true,
    catLabelPl: 'Oficjalna aplikacja · Android',
    catLabelEn: 'Official Android App',
    titlePl: 'Christian Culture (Google Play)',
    titleEn: 'Christian Culture (Google Play)',
    descPl: 'Radio PL i Global, Biblia Audio CC, Motywacyjny Werset Dnia oraz Planer Biblijny w jednej bezpłatnej aplikacji na smartfony z Androidem.',
    descEn: 'Radio PL & Global, Biblia Audio CC, Motivational Verse of the Day and Bible Planner in one free Android app.',
    ctaPl: 'Pobierz w Google Play',
    ctaEn: 'Get it on Google Play',
    secHrefPl: PLAY_DEV_PL,
    secHrefEn: PLAY_DEV_EN,
    secExt: true,
    secLabelPl: 'Profil wydawcy',
    secLabelEn: 'Publisher profile',
    keys: 'android google play christian culture pl cclite app radio biblia audio planer werset'
  },
  {
    id: 'cclite-pwa',
    wide: false,
    cats: ['android', 'biblia', 'media'],
    platformsPl: ['PWA', 'Android & iOS'],
    platformsEn: ['PWA', 'Android & iOS'],
    badgePlay: false,
    isIcon: true,
    img: '/cc_app_lite.jpg',
    hrefPl: 'https://cclite.pl/',
    hrefEn: 'https://cclite.pl/',
    ext: true,
    catLabelPl: 'Lekka aplikacja PWA · 0 zł',
    catLabelEn: 'Lightweight PWA · Free',
    titlePl: 'CC Lite PWA',
    titleEn: 'CC Lite PWA',
    descPl: 'Błyskawiczna aplikacja progresywna bez ciężkiego pobierania — instaluje się jednym kliknięciem na ekranie głównym Androida, iPhone i komputera.',
    descEn: 'Ultra-light Progressive Web App installed in seconds onto Android, iPhone and desktop home screens with full streaming & devotionals.',
    ctaPl: 'Uruchom CC Lite',
    ctaEn: 'Launch CC Lite',
    keys: 'cc lite cclite pwa web app telefon skrot ekran glowny iphone android'
  },
  {
    id: 'dzj',
    cats: ['android', 'biblia'],
    platformsPl: ['Web App', 'Rozważania'],
    platformsEn: ['Web App', 'Daily Study'],
    isIcon: false,
    img: '/images/academy/daily/kc_day_52_wlasnosc_zadoscuczynienie_swietosc.jpg',
    hrefPl: 'https://christian-culture.web.app/',
    hrefEn: 'https://christian-culture.web.app/',
    ext: true,
    catLabelPl: 'Codzienne rozważania · Audio TTS',
    catLabelEn: 'Daily Reflections · Audio',
    titlePl: 'Dobrze, że jesteś',
    titleEn: 'Good That You Are Here',
    descPl: 'Poranne rozważania biblijne na każdy dzień roku, werset dnia oraz czytelny tryb nocny z opcją słuchania lektora.',
    descEn: 'Daily morning Christian reflections, Scripture verses and reader-friendly dark mode with spoken audio support.',
    ctaPl: 'Czytaj na dziś',
    ctaEn: 'Read today',
    keys: 'dobrze ze jestes rozwazania cuda kazdego dnia poranne modlitwa dzj web app'
  },
  {
    id: 'lumina-portal',
    cats: ['spolecznosc'],
    platformsPl: ['Web App', 'Społeczność'],
    platformsEn: ['Web App', 'Community'],
    isIcon: true,
    img: '/cc_app_lumina.jpg',
    hrefPl: '/lumina',
    hrefEn: '/lumina',
    catLabelPl: 'Portal Chrześcijański',
    catLabelEn: 'Christian Social Portal',
    titlePl: 'LUMINA',
    titleEn: 'LUMINA',
    descPl: 'Bezpieczna przestrzeń rozmów, wpisów, modlitwy, relacji i profili członków społeczności Christian Culture.',
    descEn: 'Faith-centered community portal for conversations, prayer intentions, posts and member profiles.',
    ctaPl: 'Wejdź do LUMINA',
    ctaEn: 'Open LUMINA',
    keys: 'lumina portal spolecznosc chrzescijanska wpisy tablica profile logowanie google'
  },
  {
    id: 'lumi-mess',
    cats: ['spolecznosc'],
    platformsPl: ['Web App', 'Czat'],
    platformsEn: ['Web App', 'Chat'],
    isIcon: false,
    img: '/assets/promo/promo-lumina-16x9.webp',
    hrefPl: '/mess',
    hrefEn: '/mess',
    catLabelPl: 'Komunikator i pokoje modlitwy',
    catLabelEn: 'Messenger & Prayer Rooms',
    titlePl: 'LUMI Messenger',
    titleEn: 'LUMI Messenger',
    descPl: 'Wiadomości prywatne i tematyczne pokoje rozmów zintegrowane z radiem, transmisją i asystentką Rut.',
    descEn: 'Direct messages and topic rooms integrated with Christian Culture radio and community fellowship.',
    ctaPl: 'Otwórz LUMI MESS',
    ctaEn: 'Open LUMI MESS',
    keys: 'lumi mess messenger czat komunikator pokoje modlitwy wiadomosci rozmowy'
  },
  {
    id: 'player',
    cats: ['media'],
    platformsPl: ['Web App', 'Audio 24/7'],
    platformsEn: ['Web App', 'Audio 24/7'],
    isIcon: false,
    img: '/assets/promo/promo-topten-16x9.webp',
    hrefPl: '/player',
    hrefEn: '/player',
    catLabelPl: 'Odtwarzacz w stylu Spotify',
    catLabelEn: 'Audio Player Hub',
    titlePl: 'Player PolskieRadio.cc',
    titleEn: 'PolskieRadio.cc Player',
    descPl: 'Pełnoekranowe centrum muzyki chrześcijańskiej, audycji, radia non-stop 24/7 oraz słuchowisk z obsługą ekranu blokady.',
    descEn: 'Music and devotional audio dashboard streaming 24/7 Christian radio, podcasts and Scripture recordings.',
    ctaPl: 'Słuchaj w Playerze',
    ctaEn: 'Open Player',
    keys: 'player spotify radio polskieradio muzyka uwielbienie audio streaming 24/7'
  },
  {
    id: 'mojabiblia',
    cats: ['biblia'],
    platformsPl: ['Web App', 'UBG + Strong'],
    platformsEn: ['Web App', 'Interlinear'],
    isIcon: true,
    img: '/Logo%20Biblia%20Audio%20CC.jpg',
    hrefPl: '/mojabiblia',
    hrefEn: '/mojabiblia',
    catLabelPl: 'Czytnik Pisma Świętego',
    catLabelEn: 'Interlinear Bible Study',
    titlePl: 'MojaBiblia Interlinearna',
    titleEn: 'MojaBiblia Interlinear',
    descPl: 'Przekłady UBG, BW, BT i BG z interlinearnym słownikiem hebrajskim i greckim (kody Stronga) oraz morfologią wyrazów.',
    descEn: 'Study Scripture with Polish translations, Hebrew & Greek Strong numbers and morphology analysis.',
    ctaPl: 'Czytaj Biblię',
    ctaEn: 'Read Bible',
    keys: 'mojabiblia biblia ubg bw bt bg strong interlinearna hebrajski grecki czytnik'
  },
  {
    id: 'biblia-audio',
    cats: ['biblia', 'media'],
    platformsPl: ['Audio 320 kbps'],
    platformsEn: ['Audio 320 kbps'],
    isIcon: false,
    img: '/assets/promo/promo-biblia-audio-16x9.webp',
    hrefPl: '/biblia-audio/',
    hrefEn: '/biblia-audio/',
    catLabelPl: 'Słuchowisko Biblijne',
    catLabelEn: 'Audio Bible Editions',
    titlePl: 'Biblia Audio CC',
    titleEn: 'Biblia Audio CC',
    descPl: 'Rozdział po rozdziale — wierny tekst Uwspółcześnionej Biblii Gdańskiej nagrany z dbałością o spokój i czystość brzmienia.',
    descEn: 'Chapter-by-chapter clear Scripture audio recordings designed for daily listening and meditation.',
    ctaPl: 'Słuchaj rozdziałów',
    ctaEn: 'Listen now',
    keys: 'biblia audio sluchowisko ubg pismo swiete ksiega rodzaju wyjscia psalmy mp3'
  },
  {
    id: 'akademia',
    cats: ['biblia'],
    platformsPl: ['Kursy', 'Web App'],
    platformsEn: ['Courses', 'Web App'],
    isIcon: false,
    img: '/assets/promo/promo-kurscodzienny-16x9.webp',
    hrefPl: '/akademia/kurscodzienny',
    hrefEn: '/akademia/kurscodzienny',
    catLabelPl: 'Akademia Biblijna',
    catLabelEn: 'Bible Academy',
    titlePl: 'Z Biblią za Pan Brat',
    titleEn: 'Daily Bible Course',
    descPl: 'Codzienny 10-minutowy kurs czytania i rozumienia Pisma Świętego księga po księdze z zapisem postępów.',
    descEn: 'Daily 10-minute guided Scripture study plan walking chapter by chapter with progress tracking.',
    ctaPl: 'Otwórz dzisiejszą lekcję',
    ctaEn: 'Open today’s lesson',
    keys: 'akademia kurs codzienny z biblia za pan brat lekcje nauka pisma'
  },
  {
    id: '40dm',
    cats: ['biblia', 'spolecznosc'],
    platformsPl: ['PL & EN', 'Plan + Pokój'],
    platformsEn: ['EN & PL', 'Plan + Room'],
    isIcon: false,
    img: '/images/social/40dm/40dm-promo-16x9-pl.jpg',
    imgEn: '/images/social/40dm/40dm-promo-16x9-en.jpg',
    hrefPl: '/40DM/',
    hrefEn: '/40DM/en/',
    catLabelPl: 'Plan Modlitwy & LUMI MESS',
    catLabelEn: 'Prayer Plan & Fellowship',
    titlePl: '40 Dni Modlitwy',
    titleEn: '40 Days of Prayer',
    descPl: '40-dniowa podróż modlitewna z 9 obietnicami biblijnymi, licznikiem wspólnej modlitwy i dedykowanym pokojem rozmów.',
    descEn: '40-day guided prayer plan with Scripture promises, confirmation counter and dedicated fellowship room.',
    ctaPl: 'Wejdź do planu',
    ctaEn: 'Open prayer plan',
    keys: '40 dni modlitwy 40dm pokoj modlitwy wspolna modlitwa obietnice pl en'
  },
  {
    id: 'vod',
    cats: ['media'],
    platformsPl: ['Kino VOD', '4K / HD'],
    platformsEn: ['Cinema VOD', 'HD'],
    isIcon: false,
    img: '/assets/promo/promo-vod-16x9.webp',
    hrefPl: '/vod',
    hrefEn: '/vod',
    catLabelPl: 'Filmy i Wykłady',
    catLabelEn: 'Christian Films & Talks',
    titlePl: 'Kino Chrześcijańskie VOD',
    titleEn: 'Christian Cinema VOD',
    descPl: 'Starannie wybrane filmy fabularne o wierze i rodzinie, dokumenty biblijne, świadectwa oraz serie wykładów.',
    descEn: 'Curated Christian feature films, testimonies, biblical documentaries and lecture series.',
    ctaPl: 'Przejdź do kina',
    ctaEn: 'Browse VOD',
    keys: 'vod kino filmy fabularne chrzescijanskie wyklady wideo'
  },
  {
    id: 'werset',
    cats: ['biblia'],
    platformsPl: ['Web App', 'Karty Graficzne'],
    platformsEn: ['Web App', 'Share Cards'],
    isIcon: false,
    img: '/assets/promo/promo-spiritual-sounds-16x9.webp',
    hrefPl: '/werset-dnia',
    hrefEn: '/werset-dnia',
    catLabelPl: 'Motywacja ze Słowa',
    catLabelEn: 'Verse of the Day',
    titlePl: 'Mój Werset Dnia',
    titleEn: 'My Verse of the Day',
    descPl: 'Codzienny werset ze Słowa Bożego gotowy do przeczytania, zapisania w ulubionych i pobrania w formie eleganckiej grafiki.',
    descEn: 'Daily Scripture verse with calm editorial presentation and ready-to-share image cards.',
    ctaPl: 'Sprawdź dzisiejszy werset',
    ctaEn: 'Read today’s verse',
    keys: 'werset dnia moj werset cytat biblia grafika udostepnij'
  },
  {
    id: 'holos',
    cats: ['spolecznosc', 'biblia'],
    platformsPl: ['Life OS', 'Web App'],
    platformsEn: ['Life OS', 'Web App'],
    isIcon: true,
    img: '/images/holos/holos_emblem.jpg',
    hrefPl: '/holos',
    hrefEn: '/holos',
    catLabelPl: 'System Życia Chrześcijanina',
    catLabelEn: 'Christian Life OS',
    titlePl: 'HOLOS — Life OS',
    titleEn: 'HOLOS — Life OS',
    descPl: 'Osobiste centrum modlitwy, dobrych nawyków, postu i rytmu dnia oparte na biblijnym porządku serca i czasu.',
    descEn: 'Calm personal workspace for prayer rhythm, fasting, good habits and daily stewardship.',
    ctaPl: 'Uruchom HOLOS',
    ctaEn: 'Open HOLOS',
    keys: 'holos life os nawyki modlitwa post planer produktywnosc chrzescijanska'
  },
  {
    id: 'gpt-jezusa',
    cats: ['spolecznosc', 'biblia'],
    platformsPl: ['Asystent AI', '0 zł'],
    platformsEn: ['AI Assistant', 'Free'],
    isIcon: true,
    img: '/cc_app_gpt.png',
    hrefPl: 'https://chatgpt.com/g/g-683a0f4c86108191b0633a08b8b28580-gpt-dla-jezusa',
    hrefEn: 'https://chatgpt.com/g/g-683a0f4c86108191b0633a08b8b28580-gpt-dla-jezusa',
    ext: true,
    catLabelPl: 'Wsparcie AI dla Służby',
    catLabelEn: 'Biblical AI Companion',
    titlePl: 'GPT Dla Jezusa',
    titleEn: 'GPT For Jesus',
    descPl: 'Narzędzie AI przygotowane do rozmów o Piśmie Świętym, szukania wersetów oraz redagowania chrześcijańskiej ewangelizacji.',
    descEn: 'Custom GPT companion tuned for Bible questions, verse exploration and Christian encouragement.',
    ctaPl: 'Otwórz w ChatGPT',
    ctaEn: 'Open in ChatGPT',
    keys: 'gpt dla jezusa ai asystent chatgpt rozmowa biblia pytania'
  }
];

const T = {
  pl: {
    lang: 'pl',
    title: 'Aplikacje Christian Culture — Android (Google Play) i Web/PWA | PolskieRadio.cc',
    desc: 'Oficjalne centrum aplikacji Christian Culture: aplikacja Android w Google Play, CC Lite PWA, Dobrze że jesteś, LUMINA, LUMI MESS, MojaBiblia, Akademia i 40 Dni Modlitwy — zawsze za darmo, bez reklam.',
    ogTitle: 'Aplikacje Christian Culture — Android & Web/PWA',
    ogDesc: 'Jedno miejsce dla wszystkich aplikacji misji Christian Culture na Androida, iPhone i przeglądarkę. 100% bezpłatnie i bez reklam.',
    ogImageAlt: 'Aplikacje Christian Culture na Androida i Web/PWA — Christian Culture, CC Lite, LUMINA, Biblia Audio, HOLOS',
    canonical: 'https://polskieradio.cc/aplikacje/',
    urlSelf: '/aplikacje/',
    urlPl: '/aplikacje/',
    urlEn: '/aplikacje/en/',
    skip: 'Przejdź do treści',
    tickBadge: 'Ekosystem 24/7',
    tickLabel: 'Pasek aktualności Christian Culture',
    brandTitle: 'Christian Culture',
    brandSub: 'Centrum Aplikacji',
    navLabel: 'Główna nawigacja',
    menuStart: 'Start',
    menuAndroid: 'Google Play',
    menuCatalog: 'Wszystkie (14)',
    menuInstall: 'Instalacja',
    menuPromo: 'Polecamy',
    supportTxt: 'Wspieram to',
    menuBtn: 'Menu',
    chips: [
      { label: 'Android · Google Play', cc: true },
      { label: 'Web & PWA · 0 zł', cc: false }
    ],
    h1a: 'Aplikacje',
    h1b: 'Twojej Wiary',
    sub: 'Android · Google Play · iPhone · Web PWA',
    claim: 'Jedna misja, kilkanaście żywych narzędzi — zawsze pod ręką',
    lead: 'Słuchaj radia 24/7, czytaj Słowo Boże z kodami Stronga, dołącz do modlitwy na LUMINA i korzystaj z codziennych rozważań — bez opłat i bez reklam.',
    heroPlayCta: 'Pobierz na Androida',
    heroCatalogCta: 'Wszystkie aplikacje (14)',
    stageVerDefault: 'ZWERYFIKOWANE 24/7',
    stageTabs: [
      { id: 'android', label: 'Android Play', tag: 'OFICJALNA APLIKACJA GOOGLE PLAY', title: 'Christian Culture', desc: 'Radio PL i Global, Biblia Audio CC, Motywacyjny Werset Dnia i Planer Biblijny w jednym pakiecie.', liveLabel: 'Wydawca', liveVal: 'Polskie Radio Christian Culture TV', cta: 'Pobierz z Google Play', href: PLAY_APP_PL, ext: true, img: '/app-christian-culture.png', badge: 'Google Play · 0 zł' },
      { id: 'dzj', label: 'Dziś w DZJ', tag: 'CODZIENNE ROZWAŻANIE', title: 'Dobrze, że jesteś', desc: 'Świeże rozważanie biblijne każdego ranka z wersetem dnia i spokojnym czytaniem na telefonie.', liveLabel: 'Dzisiaj', liveVal: 'Ładowanie dzisiejszego rozważania…', cta: 'Czytaj na dziś', href: 'https://christian-culture.web.app/', ext: true, img: '/images/academy/daily/kc_day_52_wlasnosc_zadoscuczynienie_swietosc.jpg', badge: 'Web & PWA · 0 zł' },
      { id: 'lumina', label: 'LUMI MESS', tag: 'SPOŁECZNOŚĆ I MODLITWA', title: 'LUMINA & LUMI MESS', desc: 'Bezpieczny portal i komunikator społeczności wierzących z pokojami modlitwy i rozmów.', liveLabel: 'Dostępność', liveVal: 'Przeglądarka · Android · iOS', cta: 'Wejdź do LUMI MESS', href: '/mess', ext: false, img: '/cc_app_lumina.jpg', badge: 'Komunikator CC' },
      { id: 'mojabiblia', label: 'MojaBiblia', tag: 'CZYTNIK INTERLINEARNY UBG', title: 'MojaBiblia Interlinearna', desc: 'Polskie przekłady Pisma Świętego wraz z greckim i hebrajskim słownikiem Stronga.', liveLabel: 'Przekłady', liveVal: 'UBG · BW · BT · BG · Strong', cta: 'Otwórz Biblię', href: '/mojabiblia', ext: false, img: '/Logo%20Biblia%20Audio%20CC.jpg', badge: 'Czytnik Pisma' },
      { id: '40dm', label: '40DM', tag: 'WSPÓLNA MODLITWA', title: '40 Dni Modlitwy', desc: '40-dniowy program modlitwy ze Słowem Bożym, obietnicami UBG i żywym pokojem rozmów.', liveLabel: 'Edycja', liveVal: 'Wersja polska i angielska', cta: 'Otwórz plan 40DM', href: '/40DM/', ext: false, img: '/images/social/40dm/40dm-promo-16x9-pl.jpg', badge: 'Plan 40 dni' }
    ],
    stats: [
      { id: 'statApps', val: '14', suffix: '', label: 'Aktywnych aplikacji i narzędzi' },
      { id: 'statReflections', val: '108', suffix: '+', label: 'Rozważań w bazie na dziś' },
      { id: 'statTime', val: '24', suffix: '/7', label: 'Dostęp non-stop bez przerw' },
      { id: 'statPrice', val: '0', suffix: ' zł', label: 'Bez opłat i bez reklam' }
    ],
    flagEyebrow: 'Smartfon z Androidem & iOS',
    flagH2a: 'Oficjalnie w Google Play',
    flagH2b: 'i jako szybkie PWA',
    flagLead: 'Zainstaluj oficjalną aplikację Christian Culture ze Sklepu Play albo przypnij lekką wersję webową bez zajmowania pamięci telefonu.',
    flagDevBadge: 'Zweryfikowany profil wydawcy',
    flagPlayTitle: 'Christian Culture na Androida',
    flagPlayDesc: 'Kompletna aplikacja misyjna na smartfony i tablety z systemem Android — prosto z naszego zweryfikowanego konta w Sklepie Google Play.',
    flagPlayBtn: 'Pobierz w Google Play',
    flagDevBtn: 'Wszystkie publikacje w Google Play →',
    flagPills: [
      { k: 'Radio 24/7', v: 'Polskie Radio CC i strumień Global jednym dotykiem' },
      { k: 'Biblia Audio CC', v: 'Profesjonalne nagrania rozdziałów UBG do słuchania' },
      { k: 'Werset Dnia', v: 'Codzienne Słowo umocnienia na początek dnia' },
      { k: 'Planer Biblijny', v: 'Przejrzysty rytm modlitwy i lektury Pisma Świętego' }
    ],
    sideLiteTitle: 'CC Lite PWA (Android i iPhone)',
    sideLiteTag: 'INSTALACJA BEZ SKLEPU',
    sideLiteDesc: 'Ekspresowa aplikacja webowa dla każdego smartfona (również iOS). Otwórz cclite.pl i wybierz „Dodaj do ekranu głównego”.',
    sideLiteCta: 'Otwórz CC Lite',
    sideDzjTitle: 'Dobrze, że jesteś',
    sideDzjTag: 'CODZIENNE ROZWAŻANIA',
    sideDzjDesc: 'Poranne Słowo na każdy dzień cyklu z krótką modlitwą, wersetem przewodnim i trybem cichego czytania.',
    sideDzjCta: 'Czytaj na dziś',
    catEyebrow: 'Pełny Ekosystem',
    catH2a: 'Wszystkie',
    catH2b: '14 aplikacji CC',
    catLead: 'Wybierz obszar dopasowany do Twoich potrzeb — od radia i kina chrześcijańskiego po pogłębione studium Pisma Świętego.',
    searchPh: 'Szukaj aplikacji (np. Biblia, Radio, 40DM)...',
    searchAria: 'Filtruj aplikacje po nazwie lub słowie kluczowym',
    countTpl: 'Wyświetlane: {n} z {total} aplikacji',
    filters: [
      { id: 'all', label: 'Wszystkie (14)' },
      { id: 'android', label: 'Android & PWA' },
      { id: 'biblia', label: 'Biblia & Modlitwa' },
      { id: 'media', label: 'Radio, Audio & VOD' },
      { id: 'spolecznosc', label: 'Społeczność & Narzędzia' }
    ],
    emptyTitle: 'Brak pasującej aplikacji dla tego filtra.',
    emptyBtn: 'Pokaż wszystkie 14 aplikacji',
    instEyebrow: 'W 30 sekund na Twoim ekranie',
    instH2a: 'Jak zainstalować',
    instH2b: 'na telefonie',
    instLead: 'Każde narzędzie działa od razu w przeglądarce, a wybrane możesz dodać jako ikonę z pełnym ekranem jak klasyczną aplikację.',
    instTabs: [
      { id: 'play', label: 'Android · Google Play' },
      { id: 'android-pwa', label: 'Android · Chrome PWA' },
      { id: 'ios-pwa', label: 'iPhone / iPad · Safari' }
    ],
    instPanels: {
      play: [
        { title: 'Otwórz Sklep Google Play', body: 'Stuknij główny przycisk „Pobierz w Google Play”, który przeniesie Cię prosto do oficjalnej karty pl.cclite.app.' },
        { title: 'Zainstaluj za darmo (0 zł)', body: 'Aplikacja jest całkowicie bezpłatna, wolna od reklam i nie wymaga żadnych subskrypcji.' },
        { title: 'Słuchaj i czytaj codziennie', body: 'Korzystaj w tle z Radia PL/Global, Biblii Audio oraz porannych inspiracji jednym dotknięciem.' }
      ],
      'android-pwa': [
        { title: 'Otwórz wybraną stronę w Chrome', body: 'Wejdź np. na cclite.pl, christian-culture.web.app, polskieradio.cc/lumina lub /mojabiblia.' },
        { title: 'Wybierz „Dodaj do ekranu głównego”', body: 'Kliknij trzy kropki w prawym górnym rogu Chrome i wybierz opcję instalacji aplikacji na ekranie.' },
        { title: 'Uruchamiaj z ikony bez paska adresu', body: 'Ikona pojawi się między aplikacjami na Androidzie i otworzy usługę natychmiast na pełnym ekranie.' }
      ],
      'ios-pwa': [
        { title: 'Otwórz adres w przeglądarce Safari', body: 'Uruchom Safari na iPhonie lub iPadzie i przejdź do cclite.pl albo ulubionej strony Christian Culture.' },
        { title: 'Kliknij przycisk Udostępnij', body: 'Na dolnym pasku Safari dotknij kwadratu ze strzałką w górę i przewiń menu akcji.' },
        { title: 'Stuknij „Do ekranu początkowego”', body: 'Zatwierdź nazwę ikony — od tej chwili otworzysz aplikację CC dokładnie jednym dotknięciem jak z App Store.' }
      ]
    },
    copyBtn: 'Skopiuj link CC Lite (cclite.pl)',
    copyDone: 'Skopiowano: https://cclite.pl/',
    pwaBtn: 'Zainstaluj tę stronę teraz (PWA)',
    promoEyebrow: 'Christian Culture',
    promoH2a: 'Polecamy',
    promoH2b: 'w ekosystemie',
    promoHead: '★ POLECAMY',
    quickLinks: [
      { title: 'Radio 24/7 (Player)', sub: 'Odtwarzacz w stylu Spotify →', href: '/player', p: 'q-player' },
      { title: 'Pomoc CC & Bądź Blisko', sub: 'Wsparcie i modlitwa →', href: '/pomogebomoge', p: 'q-pomoc' },
      { title: 'Mapa Ekosystemu CC', sub: 'Wszystkie moduły w jednym miejscu →', href: '/mapa', p: 'q-mapa' }
    ],
    patEyebrow: 'Patronat',
    patH2a: 'Wszystkie aplikacje za darmo',
    patH2b: 'dzięki ludziom',
    patLead: 'Nie wyświetlamy reklam i nie blokujemy Słowa Bożego płatnym abonamentem. Jeśli te narzędzia służą Twojemu sercu — wesprzyj ich rozwój.',
    patCta: 'Wspieram to',
    patPatronite: 'Zostań patronem na Patronite',
    patShare: 'Udostępnij ten katalog',
    patShared: 'Link skopiowany do schowka',
    patWays: [
      'Wspieraj rozwój aplikacji Android, PWA i serwerów radiowych (BLIK, przelew)',
      'Dołącz do grona Patronów Christian Culture w serwisie Patronite',
      'Udostępnij bezpłatne aplikacje rodzinie, wspólnocie i znajomym'
    ],
    fAppsHead: 'Najpopularniejsze',
    fCcHead: 'Christian Culture',
    fNote: 'Wszystkie aplikacje i platformy Christian Culture pozostają całkowicie bezpłatne i pozbawione reklam. Oficjalny wydawca: Polskie Radio Christian Culture TV.'
  },
  en: {
    lang: 'en',
    title: 'Christian Culture Apps — Android (Google Play) & Web/PWA Hub | PolskieRadio.cc',
    desc: 'Official Christian Culture Apps Hub: Android app on Google Play, CC Lite PWA, Good That You Are Here devotionals, LUMINA, LUMI MESS, MojaBiblia, Academy & 40 Days of Prayer — 100% free and ad-free.',
    ogTitle: 'Christian Culture Apps — Android & Web/PWA Hub',
    ogDesc: 'One place for all Christian Culture faith, Bible study, 24/7 radio and community apps on Android, iOS and Web. Free & ad-free.',
    ogImageAlt: 'Christian Culture Apps on Android & Web/PWA — Christian Culture, CC Lite, LUMINA, Biblia Audio, HOLOS',
    canonical: 'https://polskieradio.cc/aplikacje/en/',
    urlSelf: '/aplikacje/en/',
    urlPl: '/aplikacje/',
    urlEn: '/aplikacje/en/',
    skip: 'Skip to content',
    tickBadge: 'Ecosystem 24/7',
    tickLabel: 'Christian Culture live ticker',
    brandTitle: 'Christian Culture',
    brandSub: 'Apps Hub',
    navLabel: 'Main navigation',
    menuStart: 'Start',
    menuAndroid: 'Google Play',
    menuCatalog: 'All Apps (14)',
    menuInstall: 'Install Guide',
    menuPromo: 'Featured',
    supportTxt: 'Support this',
    menuBtn: 'Menu',
    chips: [
      { label: 'Android · Google Play', cc: true },
      { label: 'Web & PWA · Free', cc: false }
    ],
    h1a: 'Apps for',
    h1b: 'Your Faith',
    sub: 'Android · Google Play · iPhone · Web PWA',
    claim: 'One Gospel mission, fourteen living tools — always within reach',
    lead: 'Stream Christian radio 24/7, explore Scripture with Strong’s interlinear lexicon, join prayer rooms on LUMINA and read daily reflections — free forever, zero ads.',
    heroPlayCta: 'Get it on Google Play (Android)',
    heroCatalogCta: 'Explore all 14 apps',
    stageVerDefault: 'VERIFIED 24/7',
    stageTabs: [
      { id: 'android', label: 'Android Play', tag: 'OFFICIAL GOOGLE PLAY APP', title: 'Christian Culture', desc: 'Radio PL & Global, Biblia Audio CC, Daily Verse & Bible Planner packed into one free Android app.', liveLabel: 'Publisher', liveVal: 'Polskie Radio Christian Culture TV', cta: 'Open Google Play', href: PLAY_APP_EN, ext: true, img: '/app-christian-culture.png', badge: 'Google Play · Free' },
      { id: 'dzj', label: 'Today’s Word', tag: 'DAILY DEVOTIONAL', title: 'Good That You Are Here', desc: 'Fresh morning biblical reflection every day with audio narrator, verse of the day and night reading mode.', liveLabel: 'Today', liveVal: 'Loading latest daily reflection…', cta: 'Read today', href: 'https://christian-culture.web.app/', ext: true, img: '/images/academy/daily/kc_day_52_wlasnosc_zadoscuczynienie_swietosc.jpg', badge: 'Web & PWA · Free' },
      { id: 'lumina', label: 'LUMI MESS', tag: 'COMMUNITY & PRAYER', title: 'LUMINA & LUMI MESS', desc: 'Safe Christian social portal and instant messenger featuring community prayer rooms.', liveLabel: 'Platforms', liveVal: 'Browser · Android · iOS', cta: 'Open LUMI MESS', href: '/mess', ext: false, img: '/cc_app_lumina.jpg', badge: 'CC Messenger' },
      { id: 'mojabiblia', label: 'MojaBiblia', tag: 'INTERLINEAR SCRIPTURE READER', title: 'MojaBiblia Interlinear', desc: 'Scripture reading side-by-side with Hebrew & Greek Strong’s numbers and morphology.', liveLabel: 'Features', liveVal: 'UBG · BW · BT · BG · Strong', cta: 'Open Bible Reader', href: '/mojabiblia', ext: false, img: '/Logo%20Biblia%20Audio%20CC.jpg', badge: 'Bible Study' },
      { id: '40dm', label: '40DM', tag: 'PRAYER JOURNEY', title: '40 Days of Prayer', desc: '40-day guided Scripture & prayer challenge with daily promises and community room.', liveLabel: 'Edition', liveVal: 'English & Polish editions', cta: 'Open 40DM Plan', href: '/40DM/en/', ext: false, img: '/images/social/40dm/40dm-promo-16x9-en.jpg', badge: '40-Day Plan' }
    ],
    stats: [
      { id: 'statApps', val: '14', suffix: '', label: 'Active Web & Android tools' },
      { id: 'statReflections', val: '108', suffix: '+', label: 'Reflections published' },
      { id: 'statTime', val: '24', suffix: '/7', label: 'Non-stop availability' },
      { id: 'statPrice', val: '0', suffix: '$', label: 'Free & ad-free forever' }
    ],
    flagEyebrow: 'Android Smartphones & iOS',
    flagH2a: 'Official on Google Play',
    flagH2b: 'and instant PWA',
    flagLead: 'Install the verified Christian Culture Android app directly from Google Play or pin lightweight progressive web apps with zero storage bloat.',
    flagDevBadge: 'Verified Developer Profile',
    flagPlayTitle: 'Christian Culture for Android',
    flagPlayDesc: 'Flagship mobile hub for smartphones and tablets — downloaded directly from our official Google Play developer account.',
    flagPlayBtn: 'Get it on Google Play',
    flagDevBtn: 'Official Google Play Developer Profile →',
    flagPills: [
      { k: 'Radio 24/7', v: 'Polish & Global Christian streams in one tap' },
      { k: 'Biblia Audio CC', v: 'Clear Scripture chapter narration anywhere' },
      { k: 'Verse of the Day', v: 'Daily Scripture encouragement every morning' },
      { k: 'Bible Planner', v: 'Structured rhythm of prayer and Word' }
    ],
    sideLiteTitle: 'CC Lite PWA (Android & iPhone)',
    sideLiteTag: 'INSTANT HOME-SCREEN INSTALL',
    sideLiteDesc: 'Ultra-fast progressive web app for every smartphone including iOS. Open cclite.pl and tap Add to Home Screen.',
    sideLiteCta: 'Launch CC Lite',
    sideDzjTitle: 'Good That You Are Here',
    sideDzjTag: 'DAILY REFLECTIONS',
    sideDzjDesc: 'Morning devotional for each day of the cycle with short prayer, verse highlight and calm night theme.',
    sideDzjCta: 'Read today',
    catEyebrow: 'Full Ecosystem',
    catH2a: 'Every',
    catH2b: '14 CC Applications',
    catLead: 'Pick what serves your walk today — from 24/7 radio and cinema VOD to deep biblical interlinear research.',
    searchPh: 'Search apps (e.g. Bible, Radio, 40DM)...',
    searchAria: 'Filter apps by name or keyword',
    countTpl: 'Showing {n} of {total} apps',
    filters: [
      { id: 'all', label: 'All (14)' },
      { id: 'android', label: 'Android & PWA' },
      { id: 'biblia', label: 'Bible & Prayer' },
      { id: 'media', label: 'Radio, Audio & VOD' },
      { id: 'spolecznosc', label: 'Community & Tools' }
    ],
    emptyTitle: 'No matching app for this filter.',
    emptyBtn: 'Show all 14 apps',
    instEyebrow: 'On your screen in 30 seconds',
    instH2a: 'How to install',
    instH2b: 'on your phone',
    instLead: 'Every tool works immediately in your browser, and you can pin apps directly to your home screen with full native feel.',
    instTabs: [
      { id: 'play', label: 'Android · Google Play' },
      { id: 'android-pwa', label: 'Android · Chrome PWA' },
      { id: 'ios-pwa', label: 'iPhone / iPad · Safari' }
    ],
    instPanels: {
      play: [
        { title: 'Open Google Play Store', body: 'Tap “Get it on Google Play” to jump straight to our verified pl.cclite.app listing.' },
        { title: 'Download completely free', body: 'Zero subscription paywalls, zero annoying video ads, safe for everyday devotion.' },
        { title: 'Listen & study anywhere', body: 'Play 24/7 radio streams, Biblia Audio chapters and daily inspirations in the background.' }
      ],
      'android-pwa': [
        { title: 'Visit any CC app in Chrome', body: 'Open cclite.pl, christian-culture.web.app, polskieradio.cc/lumina or /mojabiblia.' },
        { title: 'Tap “Add to Home screen”', body: 'Open Chrome’s top-right menu and select Install app / Add to Home screen.' },
        { title: 'Launch full-screen anytime', body: 'A crisp Christian Culture icon appears in your Android launcher without browser bars.' }
      ],
      'ios-pwa': [
        { title: 'Open the URL in Safari', body: 'Navigate on iPhone or iPad to cclite.pl or any Christian Culture web application.' },
        { title: 'Tap the Share button', body: 'At the bottom of Safari, tap the Share icon and scroll through the action sheet.' },
        { title: 'Select “Add to Home Screen”', body: 'Confirm the shortcut name — your app now launches cleanly in standalone mode.' }
      ]
    },
    copyBtn: 'Copy CC Lite link (cclite.pl)',
    copyDone: 'Copied: https://cclite.pl/',
    pwaBtn: 'Install this hub as PWA',
    promoEyebrow: 'Christian Culture',
    promoH2a: 'Featured',
    promoH2b: 'across the mission',
    promoHead: '★ FEATURED',
    quickLinks: [
      { title: 'Radio 24/7 (Player)', sub: 'Spotify-style audio dashboard →', href: '/player', p: 'q-player' },
      { title: 'CC Care & Stay Close', sub: 'Personal prayer & support →', href: '/badz-blisko/', p: 'q-pomoc' },
      { title: 'Ecosystem Map', sub: 'All Christian Culture modules →', href: '/mapa', p: 'q-mapa' }
    ],
    patEyebrow: 'Patronage',
    patH2a: 'Every app remains free',
    patH2b: 'thanks to community',
    patLead: 'We run zero third-party ads and put no price tag on the Word of God. If these tools bless your home, stand with the mission.',
    patCta: 'Support this',
    patPatronite: 'Become a Patron on Patronite',
    patShare: 'Share this directory',
    patShared: 'Link copied to clipboard',
    patWays: [
      'Support Android & PWA development and streaming infrastructure',
      'Join the Christian Culture Patron community on Patronite',
      'Share free faith apps with your family, church and friends'
    ],
    fAppsHead: 'Highlights',
    fCcHead: 'Christian Culture',
    fNote: 'Every Christian Culture app and channel remains free and ad-free. Official publisher: Polskie Radio Christian Culture TV.'
  }
};

function renderPage(lang) {
  const c = T[lang];
  const en = lang === 'en';
  const playUrl = en ? PLAY_APP_EN : PLAY_APP_PL;
  const devUrl = en ? PLAY_DEV_EN : PLAY_DEV_PL;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${c.canonical}#page`,
        url: c.canonical,
        name: c.title,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: 'Christian Culture', url: 'https://polskieradio.cc/' }
      },
      {
        '@type': 'MobileApplication',
        '@id': `${c.canonical}#android-app`,
        name: 'Christian Culture',
        operatingSystem: 'Android',
        applicationCategory: 'LifestyleApplication',
        installUrl: playUrl,
        offers: { '@type': 'Offer', price: '0', priceCurrency: en ? 'USD' : 'PLN' },
        publisher: {
          '@type': 'Organization',
          name: 'Polskie Radio Christian Culture TV',
          url: devUrl
        }
      }
    ]
  };

  const firstScreen = c.stageTabs[0];

  const cardsHtml = APPS.map((app) => {
    const platforms = en ? app.platformsEn : app.platformsPl;
    const catLabel = en ? app.catLabelEn : app.catLabelPl;
    const title = en ? app.titleEn : app.titlePl;
    const desc = en ? app.descEn : app.descPl;
    const cta = en ? app.ctaEn : app.ctaPl;
    const href = en ? app.hrefEn : app.hrefPl;
    const imgSrc = en && app.imgEn ? app.imgEn : app.img;
    const extAttr = app.ext ? ' target="_blank" rel="noopener"' : '';
    const secHref = en ? app.secHrefEn : app.secHrefPl;
    const secLabel = en ? app.secLabelEn : app.secLabelPl;
    const secExtAttr = app.secExt ? ' target="_blank" rel="noopener"' : '';
    const wideCls = app.wide ? ' acard--wide' : '';
    const badges = platforms.map((p, i) => `<span class="abadge${app.badgePlay && i === 1 ? ' abadge--play' : ''}">${esc(p)}</span>`).join('');

    return `        <article class="acard${wideCls} reveal" data-cat="${esc(app.cats.join(' '))}" data-keys="${esc(app.keys + ' ' + title + ' ' + desc)}" data-tilt>
          <div class="acard__media${app.isIcon ? ' is-icon' : ''}">
            <img src="${esc(imgSrc)}" width="${app.isIcon ? 92 : 480}" height="${app.isIcon ? 92 : 270}" loading="lazy" decoding="async" alt="${esc(title)}">
            <div class="acard__badges">${badges}</div>
          </div>
          <div class="acard__body">
            <small class="acard__cat">${esc(catLabel)}</small>
            <h3 class="acard__title">${esc(title)}</h3>
            <p class="acard__desc">${esc(desc)}</p>
            <div class="acard__actions">
              <a class="btn btn--${app.badgePlay ? 'cc' : 'ghost'} btn--sm" href="${esc(href)}"${extAttr} data-promo="app-${esc(app.id)}">${esc(cta)}</a>${secHref ? `
              <a class="btn btn--ghost btn--sm" href="${esc(secHref)}"${secExtAttr} data-promo="app-${esc(app.id)}-sec">${esc(secLabel)}</a>` : ''}
            </div>
          </div>
        </article>`;
  }).join('\n');

  return `<!-- GENERATED BY scripts/aplikacje/buduj.mjs — DO NOT EDIT DIRECTLY -->
<!doctype html>
<html lang="${lang}" class="no-js">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#04070f">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="${c.canonical}">
<link rel="alternate" hreflang="pl" href="https://polskieradio.cc/aplikacje/">
<link rel="alternate" hreflang="en" href="https://polskieradio.cc/aplikacje/en/">
<link rel="alternate" hreflang="x-default" href="https://polskieradio.cc/aplikacje/">
<meta property="og:type" content="website">
<meta property="og:locale" content="${en ? 'en_US' : 'pl_PL'}">
<meta property="og:locale:alternate" content="${en ? 'pl_PL' : 'en_US'}">
<meta property="og:site_name" content="Christian Culture">
<meta property="og:title" content="${esc(c.ogTitle)}">
<meta property="og:description" content="${esc(c.ogDesc)}">
<meta property="og:url" content="https://polskieradio.cc${c.urlSelf}">
<meta property="og:image" content="https://polskieradio.cc/aplikacje/img/og-aplikacje-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.ogImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.ogTitle)}">
<meta name="twitter:description" content="${esc(c.ogDesc)}">
<meta name="twitter:image" content="https://polskieradio.cc/aplikacje/img/og-aplikacje-1200x630.jpg">
<link rel="icon" type="image/png" href="/app-christian-culture.png">
<link rel="apple-touch-icon" href="/app-christian-culture.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/css/cc-mobile-edge.css?v=20261113_edge13">
<link rel="stylesheet" href="/aplikacje/ap.css?v=${ASSETS_V}">
<script src="/js/cc-global-auth.js?v=20261116_a007_auth" defer></script>
<script src="/js/cc-favorites.js?v=20261114_favz1" defer></script>
<script src="/js/cc-mobile-edge.js?v=20261110_edge12" defer></script>
<script src="/js/cc-edge-plus.js?v=20261110_edgep2" defer></script>
<script src="/components/cc-omni-search.js?v=20261030_feat11" defer></script>
<script src="/components/cc-global-chat-button.js?v=20261119_gold2" defer></script>
<script src="/js/cc-back-to-top.js?v=20261116_btt5" defer></script>
<script src="/components/cc-support-footer.js?v=20261116_a007_column" defer></script>
<script src="/aplikacje/ap-eco.js?v=${ASSETS_V}" defer></script>
<script src="/aplikacje/ap.js?v=${ASSETS_V}" defer></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/json" id="deviceScreensData">${JSON.stringify(c.stageTabs)}</script>
</head>
<body data-lang="${lang}">
<a class="skip" href="#tresc">${esc(c.skip)}</a>

<div class="tick" role="region" aria-label="${esc(c.tickLabel)}">
  <span class="tick__badge"><i aria-hidden="true"></i>${esc(c.tickBadge)}</span>
  <div class="tick__track"><div class="tick__run" id="tickRun"></div></div>
</div>

<header class="nav" id="nav">
  <div class="wrap nav__in">
    <a class="brand" href="#start" aria-label="${esc(c.brandTitle)} — ${esc(c.brandSub)}">
      <img src="/app-christian-culture.png" width="36" height="36" alt="">
      <span class="brand__text"><b>${esc(c.brandTitle)}</b><small>${esc(c.brandSub)}</small></span>
    </a>
    <nav aria-label="${esc(c.navLabel)}">
      <ul class="menu" id="menu">
        <li><a href="#start">${esc(c.menuStart)}</a></li>
        <li><a href="#android">${esc(c.menuAndroid)}</a></li>
        <li><a href="#katalog">${esc(c.menuCatalog)}</a></li>
        <li><a href="#instalacja">${esc(c.menuInstall)}</a></li>
        <li><a href="#polecamy">${esc(c.menuPromo)}</a></li>
      </ul>
    </nav>
    <!-- .header-right = miejsce na gwiazdkę „Ulubione” z js/cc-favorites.js (wstawiana jako pierwsza) -->
    <div class="header-right nav__actions">
      <a class="support-btn" href="/wspieraj" data-promo="nav-wspieram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg><span class="support-txt">${esc(c.supportTxt)}</span></a>
      <div class="lang" role="group" aria-label="${en ? 'Language' : 'Język'}">
        <a href="${c.urlPl}" hreflang="pl" lang="pl"${lang === 'pl' ? ' aria-current="true"' : ''}>PL</a>
        <a href="${c.urlEn}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a>
      </div>
    </div>
    <button class="burger" id="menuToggle" type="button" aria-expanded="false" aria-controls="menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/></svg>
      <span>${esc(c.menuBtn)}</span>
    </button>
  </div>
</header>

<main id="tresc">
  <section class="hero" id="start" aria-labelledby="h1">
    <canvas class="hero__fx" id="apCanvas" aria-hidden="true"></canvas>
    <div class="wrap hero__grid">
      <div>
        <ul class="chips" aria-label="${esc(c.tickBadge)}">
          ${c.chips.map((ch) => `<li class="chip${ch.cc ? ' chip--cc' : ''}">${ch.cc ? '<span class="dot" aria-hidden="true"></span>' : ''}${esc(ch.label)}</li>`).join('')}
          <li class="chip" id="heroDayChip">${en ? 'Updated Daily' : 'Aktualizowane codziennie'}</li>
        </ul>
        <h1 id="h1"><span class="l"><span>${esc(c.h1a)}</span></span><span class="l"><span>${esc(c.h1b)}</span></span><span class="sub">${esc(c.sub)}</span></h1>
        <p class="claim">${esc(c.claim)}</p>
        <p class="lead">${esc(c.lead)}</p>
        <div class="cta">
          <a class="btn btn--cc" href="${esc(playUrl)}" target="_blank" rel="noopener" data-promo="hero-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3.6v16.8c0 .8.9 1.3 1.6.9l13.7-8.4c.6-.4.6-1.4 0-1.8L6.6 2.7C5.9 2.3 5 2.8 5 3.6z"/></svg>${esc(c.heroPlayCta)}</a>
          <a class="btn btn--ghost" href="#katalog">${esc(c.heroCatalogCta)}</a>
        </div>
      </div>

      <aside class="device-stage" aria-label="${en ? 'Interactive Christian Culture App Preview' : 'Interaktywny podgląd aplikacji Christian Culture'}">
        <div class="phone-frame" data-tilt>
          <div class="phone-pill" aria-hidden="true"></div>
          <div class="phone-screen">
            <div class="phone-top">
              <span class="phone-badge"><span class="dot" aria-hidden="true"></span><span id="stageBadge">${esc(firstScreen.badge)}</span></span>
              <span class="phone-ver" id="stageVer">${esc(c.stageVerDefault)}</span>
            </div>
            <div class="phone-preview">
              <img class="phone-preview__icon" id="stageImg" src="${esc(firstScreen.img)}" width="74" height="74" alt="${esc(firstScreen.title)}">
              <div class="phone-preview__meta">
                <span class="phone-preview__tag" id="stageTag">${esc(firstScreen.tag)}</span>
                <h2 class="phone-preview__title" id="stageTitle">${esc(firstScreen.title)}</h2>
                <p class="phone-preview__desc" id="stageDesc">${esc(firstScreen.desc)}</p>
              </div>
            </div>
            <div class="phone-livebox">
              <strong id="stageLiveLabel">${esc(firstScreen.liveLabel)}</strong>
              <span id="stageLiveVal">${esc(firstScreen.liveVal)}</span>
            </div>
            <div class="phone-cta">
              <a class="btn btn--cc" id="stagePrimary" href="${esc(firstScreen.href)}" target="_blank" rel="noopener" data-promo="stage-cta">${esc(firstScreen.cta)}</a>
              <a class="btn btn--ghost" href="#instalacja">${en ? 'Install guide' : 'Instalacja'}</a>
            </div>
          </div>
        </div>
        <div class="stage-tabs" role="tablist" aria-label="${en ? 'Select preview app' : 'Wybierz podgląd aplikacji'}">
          ${c.stageTabs.map((t, i) => `<button type="button" class="stage-tab" role="tab" data-screen="${esc(t.id)}" aria-selected="${i === 0 ? 'true' : 'false'}">${esc(t.label)}</button>`).join('\n          ')}
        </div>
      </aside>
    </div>
  </section>

  <div class="stats" role="list">
    ${c.stats.map((st) => `<div role="listitem" class="stat reveal"><strong><span class="reel" id="${esc(st.id)}" data-reel="${esc(st.val)}">${esc(st.val)}</span>${st.suffix ? `<span class="acc">${esc(st.suffix)}</span>` : ''}</strong><small>${esc(st.label)}</small></div>`).join('\n    ')}
  </div>

  <section class="section" id="android" aria-labelledby="h-flag">
    <div class="wrap">
      <div class="reveal">
        <p class="eyebrow">${esc(c.flagEyebrow)}</p>
        <h2 class="h2" id="h-flag">${esc(c.flagH2a)} <em>${esc(c.flagH2b)}</em></h2>
        <p class="lead">${esc(c.flagLead)}</p>
      </div>
      <div class="flagship-grid">
        <div class="flag-main reveal" data-tilt>
          <div>
            <div class="flag-head">
              <img class="flag-icon" src="/app-christian-culture.png" width="84" height="84" alt="Christian Culture Android">
              <div>
                <span class="phone-badge"><span class="dot" aria-hidden="true"></span>${esc(c.flagDevBadge)}</span>
                <h3 class="flag-title">${esc(c.flagPlayTitle)}</h3>
                <span class="flag-sub">pl.cclite.app · Android · 0 zł</span>
              </div>
            </div>
            <p class="lead" style="margin-top:16px">${esc(c.flagPlayDesc)}</p>
          </div>
          <div class="flag-pills">
            ${c.flagPills.map((p) => `<div class="flag-pill"><b>${esc(p.k)}</b>${esc(p.v)}</div>`).join('\n            ')}
          </div>
          <div class="cta">
            <a class="btn btn--cc" href="${esc(playUrl)}" target="_blank" rel="noopener" data-promo="flag-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3.6v16.8c0 .8.9 1.3 1.6.9l13.7-8.4c.6-.4.6-1.4 0-1.8L6.6 2.7C5.9 2.3 5 2.8 5 3.6z"/></svg>${esc(c.flagPlayBtn)}</a>
            <a class="btn btn--ghost" href="${esc(devUrl)}" target="_blank" rel="noopener" data-promo="flag-dev">${esc(c.flagDevBtn)}</a>
          </div>
        </div>

        <div class="flag-stack">
          <article class="flag-side reveal" data-tilt>
            <div class="flag-side__top">
              <img class="flag-side__icon" src="/cc_app_lite.jpg" width="58" height="58" alt="${esc(c.sideLiteTitle)}">
              <div>
                <small>${esc(c.sideLiteTag)}</small>
                <h3>${esc(c.sideLiteTitle)}</h3>
              </div>
            </div>
            <p>${esc(c.sideLiteDesc)}</p>
            <div class="cta">
              <a class="btn btn--gold btn--sm" href="https://cclite.pl/" target="_blank" rel="noopener" data-promo="flag-cclite">${esc(c.sideLiteCta)}</a>
              <a class="btn btn--ghost btn--sm" href="#instalacja">${en ? 'How to add' : 'Jak dodać?'}</a>
            </div>
          </article>

          <article class="flag-side reveal" data-tilt>
            <div class="flag-side__top">
              <img class="flag-side__icon" src="/images/academy/daily/kc_day_52_wlasnosc_zadoscuczynienie_swietosc.jpg" width="58" height="58" alt="${esc(c.sideDzjTitle)}">
              <div>
                <small id="dzjLivePill">${esc(c.sideDzjTag)}</small>
                <h3>${esc(c.sideDzjTitle)}</h3>
              </div>
            </div>
            <p>${esc(c.sideDzjDesc)}</p>
            <div class="cta">
              <a class="btn btn--cc btn--sm" href="https://christian-culture.web.app/" target="_blank" rel="noopener" data-promo="flag-dzj">${esc(c.sideDzjCta)}</a>
              <a class="btn btn--ghost btn--sm" href="/akademia/kurscodzienny">${en ? 'Daily Course' : 'Kurs Codzienny'}</a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" id="katalog" aria-labelledby="h-cat">
    <div class="wrap">
      <div class="catalog-head reveal">
        <div>
          <p class="eyebrow">${esc(c.catEyebrow)}</p>
          <h2 class="h2" id="h-cat">${esc(c.catH2a)} <em>${esc(c.catH2b)}</em></h2>
          <p class="lead">${esc(c.catLead)}</p>
        </div>
      </div>
      <div class="catalog-tools reveal">
        <div class="filter-pills" role="group" aria-label="${en ? 'Filter by category' : 'Filtruj według kategorii'}">
          ${c.filters.map((f, idx) => `<button type="button" class="fpill" data-cat="${esc(f.id)}" aria-pressed="${idx === 0 ? 'true' : 'false'}">${esc(f.label)}</button>`).join('\n          ')}
        </div>
        <div class="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
          <input type="search" id="appSearch" placeholder="${esc(c.searchPh)}" aria-label="${esc(c.searchAria)}" autocomplete="off">
        </div>
      </div>
      <p class="catalog-count" id="catalogCount" data-tpl="${esc(c.countTpl)}" aria-live="polite">${esc(c.countTpl.replace('{n}', APPS.length).replace('{total}', APPS.length))}</p>
      <div class="app-grid" id="appGrid">
${cardsHtml}
      </div>
      <div class="empty-box" id="emptyBox" hidden>
        <p class="lead" style="margin-inline:auto;margin-bottom:16px">${esc(c.emptyTitle)}</p>
        <button type="button" class="btn btn--cc btn--sm" id="catalogReset">${esc(c.emptyBtn)}</button>
      </div>
    </div>
  </section>

  <section class="section" id="instalacja" aria-labelledby="h-inst">
    <div class="wrap">
      <div class="reveal">
        <p class="eyebrow">${esc(c.instEyebrow)}</p>
        <h2 class="h2" id="h-inst">${esc(c.instH2a)} <em>${esc(c.instH2b)}</em></h2>
        <p class="lead">${esc(c.instLead)}</p>
      </div>
      <div class="install-box reveal">
        <div class="install-tabs" role="tablist" aria-label="${en ? 'Select device platform' : 'Wybierz platformę'}">
          ${c.instTabs.map((tb, idx) => `<button type="button" class="itab" role="tab" data-tab="${esc(tb.id)}" aria-selected="${idx === 0 ? 'true' : 'false'}">${esc(tb.label)}</button>`).join('\n          ')}
        </div>
        ${c.instTabs.map((tb, idx) => `<div class="ipanel" role="tabpanel" data-panel="${esc(tb.id)}"${idx === 0 ? '' : ' hidden'}>
          <div class="steps">
            ${c.instPanels[tb.id].map((st, sIdx) => `<div class="step"><span class="step__num">0${sIdx + 1}</span><h3>${esc(st.title)}</h3><p>${esc(st.body)}</p></div>`).join('\n            ')}
          </div>
        </div>`).join('\n        ')}
        <div class="install-bar">
          <div class="cta">
            <a class="btn btn--cc btn--sm" href="${esc(playUrl)}" target="_blank" rel="noopener" data-promo="inst-play">${esc(c.flagPlayBtn)}</a>
            <button type="button" class="btn btn--ghost btn--sm" id="copyHubBtn" data-copy="https://cclite.pl/" data-done="${esc(c.copyDone)}">${esc(c.copyBtn)}</button>
            <button type="button" class="btn btn--gold btn--sm" id="pwaInstallBtn" hidden>${esc(c.pwaBtn)}</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" id="polecamy" aria-labelledby="h-promo">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">${esc(c.promoEyebrow)}</p><h2 class="h2" id="h-promo">${esc(c.promoH2a)} <em>${esc(c.promoH2b)}</em></h2></div>
      <div class="promo reveal" aria-label="${esc(c.promoHead)}">
        <div class="promo__stage" id="promoStage"></div>
        <div class="promo__side">
          <div class="promo__head">${esc(c.promoHead)}<div class="dots" id="promoDots"></div></div>
          <div class="promo__bar"><i id="promoBar"></i></div>
          <nav class="qlinks" aria-label="${esc(c.promoHead)}">
            ${c.quickLinks.map((q) => `<a href="${esc(q.href)}" data-promo="${esc(q.p)}">${esc(q.title)}<span>${esc(q.sub)}</span></a>`).join('\n            ')}
          </nav>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="wspieram" aria-labelledby="h-pat">
    <div class="wrap">
      <div class="patron reveal">
        <div class="patron__grid">
          <div>
            <p class="eyebrow">${esc(c.patEyebrow)}</p>
            <h2 class="h2" id="h-pat">${esc(c.patH2a)} <em>${esc(c.patH2b)}</em></h2>
            <p class="lead">${esc(c.patLead)}</p>
            <div class="cta">
              <a class="btn btn--cc" href="/wspieraj" data-promo="patron-wspieram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>${esc(c.patCta)}</a>
              <a class="btn btn--ghost" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" data-promo="patron-patronite">${esc(c.patPatronite)}</a>
              <button class="btn btn--ghost" type="button" id="shareBtn" data-done="${esc(c.patShared)}">${esc(c.patShare)}</button>
            </div>
          </div>
          <ul class="patron__ways">
            <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-9-8.6C1.6 8.2 3.6 5 7 5c2 0 3.4 1 5 2.8C13.6 6 15 5 17 5c3.4 0 5.4 3.2 4 6.4-2 4.3-9 8.6-9 8.6z"/></svg><span>${esc(c.patWays[0])}</span></li>
            <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/></svg><span>${esc(c.patWays[1])}</span></li>
            <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg><span>${esc(c.patWays[2])}</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <h2>${esc(c.fAppsHead)}</h2>
      <ul>
        <li><a href="${esc(playUrl)}" target="_blank" rel="noopener">Christian Culture (Google Play)</a></li>
        <li><a href="https://cclite.pl/" target="_blank" rel="noopener">CC Lite PWA</a></li>
        <li><a href="https://christian-culture.web.app/" target="_blank" rel="noopener">${en ? 'Good That You Are Here' : 'Dobrze, że jesteś'}</a></li>
        <li><a href="/lumina">LUMINA Portal</a></li>
        <li><a href="/mess">LUMI Messenger</a></li>
      </ul>
    </div>
    <div>
      <h2>${esc(c.fCcHead)}</h2>
      <ul>
        <li><a href="/">Christian Culture</a></li>
        <li><a href="/mojabiblia">MojaBiblia Interlinearna</a></li>
        <li><a href="/akademia/kurscodzienny">${en ? 'Daily Bible Course' : 'Kurs Codzienny'}</a></li>
        <li><a href="/wspieraj">${esc(c.patCta)}</a></li>
      </ul>
    </div>
    <p style="max-width:38ch;margin:0">${esc(c.fNote)}</p>
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</body>
</html>
`;
}

export function buildAll(writeFiles = true) {
  const plHtml = renderPage('pl');
  const enHtml = renderPage('en');
  if (writeFiles) {
    fs.mkdirSync(path.join(ROOT, 'aplikacje/en'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'aplikacje/index.html'), plHtml, 'utf8');
    fs.writeFileSync(path.join(ROOT, 'aplikacje/en/index.html'), enHtml, 'utf8');
  }
  return { plHtml, enHtml };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildAll(true);
  console.log('Generated aplikacje/index.html and aplikacje/en/index.html');
}
