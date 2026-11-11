#!/usr/bin/env node
/**
 * CCN NEWS — AUTOMATYCZNY NADAJNIK NOWOŚCI EKOSYSTEMU NA PLATFORMĘ X
 *
 * Dyrektywy Dowódcy (31.10.2026):
 * 1. „publikuj nieregularnie mniej więcej co 30 minut krótkie info o nowościach
 *     z ekosystemu pod nazwą CCN NEWS | polskieradio.cc/news”
 * 2. „Na platformie X i na Facebooku muszą być bezwzględnie tematyczne dedykowane grafiki,
 *     bo jak teraz widzę na platformie X, to cały czas w każdym poście tylko logo CCN.”
 * 3. „mamy książki, z których można fragmenty cytować. Mamy książki moje, mojej żony.
 *     Mamy wizytówki różnych użytkowników, wizytówki muzyczne, portale muzyczne,
 *     nowości muzyczne z kanałów YouTube. Werset dnia bardzo dobrze, żeby się pojawiał
 *     przynajmniej raz na jakiś czas, co godzinę, co półtorej z dedykowaną grafiką.”
 *
 * Silnik: Playwright (100% Free Tier, zero opłat API X, auth_token z .env.local)
 * Standard: ZERO COST / JOMA-D005 / @SMCC / @matrix-cc / 28 Zasad Wiary
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Ścieżki
const ENV_LOCAL_PATH = path.join(ROOT, '.env.local');
const ENV_PATH = path.join(ROOT, '.env');
const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
const HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
const BROADCASTER_STATE_PATH = path.join(ROOT, 'data', 'ccn_broadcaster_state.json');
const BROADCASTER_LOG_PATH = path.join(ROOT, 'data', 'ccn_broadcaster_log.json');
const CATALOG_PATH = path.join(ROOT, 'szukaj', 'catalog.json');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');

// Załaduj zmienne środowiskowe
function loadEnv() {
  const envFiles = [ENV_LOCAL_PATH, ENV_PATH];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`[WARN] Nie udało się odczytać ${envFile}:`, err.message);
      }
    }
  }
}

loadEnv();

// Rejestry stanu i historii
function loadState() {
  try {
    if (fs.existsSync(BROADCASTER_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(BROADCASTER_STATE_PATH, 'utf8'));
    }
  } catch (e) {}
  return { lastIndex: -1, lastPostedAt: null, totalBroadcasts: 0 };
}

function saveState(state) {
  try {
    const dir = path.dirname(BROADCASTER_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BROADCASTER_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('[BŁĄD] Zapis stanu nadajnika:', e.message);
  }
}

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const data = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
      return Array.isArray(data) ? data : (data.published || []);
    }
  } catch (err) {
    console.warn('[WARN] Błąd odczytu historii X:', err.message);
  }
  return [];
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify({ version: '1.0', published: history }, null, 2), 'utf8');
  } catch (err) {
    console.error('[BŁĄD] Zapis historii X:', err.message);
  }
}

function appendLog(entry) {
  try {
    const dir = path.dirname(BROADCASTER_LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let logs = [];
    if (fs.existsSync(BROADCASTER_LOG_PATH)) {
      try { logs = JSON.parse(fs.readFileSync(BROADCASTER_LOG_PATH, 'utf8')); } catch (e) {}
    }
    logs.unshift(entry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(BROADCASTER_LOG_PATH, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    console.warn('[WARN] Zapis logu nadajnika:', e.message);
  }
}

// Inteligentny resolver dedykowanych grafik tematycznych na dysku
function resolveItemImage(item, rootDir) {
  const resolveCandidate = (rawPath) => {
    if (!rawPath) return null;
    const cleanPath = rawPath.replace(/^https?:\/\/[^\/]+\//i, '').replace(/^\/+/, '');
    const p1 = path.join(rootDir, cleanPath);
    if (fs.existsSync(p1)) return p1;
    if (path.isAbsolute(rawPath) && fs.existsSync(rawPath)) return rawPath;
    return null;
  };

  // 1. Bezpośrednia ścieżka do grafiki w obiekcie
  if (item.image) {
    const p = resolveCandidate(item.image);
    if (p) return p;
  }
  if (item.imageUrl) {
    const p = resolveCandidate(item.imageUrl);
    if (p) return p;
  }

  // 2. Dopasowanie ze sluga artykułu lub modułu
  const slug = item.url ? item.url.split('/').filter(Boolean).pop() : '';
  if (slug) {
    const candidateFiles = [
      path.join(rootDir, 'images', 'news', `art-${slug}.jpg`),
      path.join(rootDir, 'images', 'news', `${slug}.jpg`),
      path.join(rootDir, 'images', 'news', `art-${slug}.png`),
      path.join(rootDir, 'images', 'news', `${slug}.png`),
      path.join(rootDir, 'images', `${slug}.jpg`),
      path.join(rootDir, 'images', `${slug}.png`)
    ];
    for (const cand of candidateFiles) {
      if (fs.existsSync(cand)) return cand;
    }
  }

  // 3. Dopasowanie po kategorii / kontekście
  const titleLower = (item.title || '').toLowerCase();
  const pathLower = item.url ? (() => { try { return new URL(item.url).pathname.toLowerCase(); } catch (e) { return item.url.toLowerCase(); } })() : '';

  if (pathLower.includes('biblia-audio') || titleLower.includes('rodzaju')) {
    const p = path.join(rootDir, 'biblia-audio', 'assets', 'rodzaju-hero.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('akademia') || pathLower.includes('kurs')) {
    const p1 = path.join(rootDir, 'images', 'academy', 'z_biblia_za_pan_brat_hero.jpg');
    if (fs.existsSync(p1)) return p1;
    const p = path.join(rootDir, 'images', 'news', 'art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('mojabiblia')) {
    const p = path.join(rootDir, 'images', 'news', 'art-rdz15-abram-gwiazdy.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('mapa')) {
    const p1 = path.join(rootDir, 'assets', 'mapa', 'planeta-poster.jpg');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(rootDir, 'images', 'mapa-bg-earth.jpg');
    if (fs.existsSync(p2)) return p2;
  }
  if (pathLower.includes('badz-blisko')) {
    const p = path.join(rootDir, 'badz-blisko', 'swiatlo.png');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('rozwiaz')) {
    const p = path.join(rootDir, 'rozwiaz-problem', 'assets', 'og-rozwiaz-problem.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('arkoffire') || pathLower.includes('ark-of-fire') || pathLower.includes('ark_of_fire')) {
    const p = path.join(rootDir, 'ArkOfFire', 'assets', 'ark-of-fire-hero.webp');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('the-journal') || pathLower.includes('journal')) {
    const p1 = path.join(rootDir, 'the-journal', 'assets', 'the-journal.png');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(rootDir, 'the-journal', 'assets', 'pamietnik.png');
    if (fs.existsSync(p2)) return p2;
  }
  if (pathLower.includes('topten')) {
    const p1 = path.join(rootDir, 'topTEN', 'assets', 'wspieramto-banner.png');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(rootDir, 'images', 'brand', 'topten-logo.png');
    if (fs.existsSync(p2)) return p2;
  }
  if (pathLower.includes('lumina') || pathLower.includes('cezary') || pathLower.includes('wioletta')) {
    const p = path.join(rootDir, 'images', 'brand', 'cezary-wioletta-radiocc.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (pathLower.includes('player') || pathLower.includes('/radio') || pathLower.includes('muzyka') || titleLower.includes('gerald welch')) {
    const p = path.join(rootDir, 'images', 'news', 'art-gerald-welch-the-call.jpg');
    if (fs.existsSync(p)) return p;
  }

  // 4. Bezpieczna, estetyczna grafika redakcyjna wysokiej rozdzielczości
  const fallback = path.join(rootDir, 'images', 'brand', 'cezary-wioletta-radiocc.jpg');
  if (fs.existsSync(fallback)) return fallback;

  return null;
}

// Baza treści całego ekosystemu Christian Culture
function getAllEcosystemCandidates() {
  const candidates = [];
  const seenUrls = new Set();

  function addCandidate(item) {
    if (!item.url || seenUrls.has(item.url)) return;

    // Blokada rocznicowa (Dyrektywa Dowódcy 01.11.2026):
    // Artykuły o Dniu Reformacji i Marcinie Lutrze publikowane wyłącznie w rocznicę (31 października).
    const textToCheck = ((item.title || '') + ' ' + (item.url || '') + ' ' + (item.tag || '') + ' ' + (item.image || '') + ' ' + (item.imageUrl || '') + ' ' + (item.lead || '')).toLowerCase();
    const isReformation = textToCheck.includes('reformacj') || textToCheck.includes('luter') || textToCheck.includes('lutr') || textToCheck.includes('95-tez');
    const isHalloween = textToCheck.includes('halloween') || textToCheck.includes('31 października') || textToCheck.includes('31 pazdziernika');
    if (isHalloween) {
      const today = new Date();
      const isOctober = today.getMonth() === 9;
      const isHalloweenPeriod = isOctober && today.getDate() >= 24 && today.getDate() <= 31;
      if (!isHalloweenPeriod) {
        return; // Pomiń poza okresem 24–31 października
      }
    }
    if (isReformation) {
      const today = new Date();
      const isAnniversaryDay = today.getMonth() === 9 && today.getDate() === 31; // 31 października (miesiące 0-11: 9 = październik)
      if (!isAnniversaryDay) {
        return; // Pomiń poza rocznicą 31 października
      }
    }

    seenUrls.add(item.url);
    candidates.push(item);
  }

  // 1. KSIĄŻKI CEZAREGO ROGOWSKIEGO I WIOLETTY ROGOWSKIEJ
  const books = [
    {
      title: 'Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo',
      lead: '„Nie mierz problemu swoimi siłami, lecz mierz go potęgą Boga, który powołał cię do zwycięstwa.” Bestseller o pokonywaniu życiowych olbrzymów w oparciu o wierność Słowu Bożemu.',
      url: 'https://polskieradio.cc/pokonac-goliata',
      image: 'images/news/art-pokonac-goliata.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#PokonacGoliata'
    },
    {
      title: 'Książka: Kod Źródłowy Duszy — Cezary Rogowski. Biblijna tożsamość i sens istnienia',
      lead: '„Twoja tożsamość nie została zapisana przez opinię świata ani algorytmy, lecz przez Stwórcę, który utkał cię w łonie matki.” Głęboka teologiczna podróż do źródeł ludzkiego ducha.',
      url: 'https://polskieradio.cc/news/kod-zrodlowy-duszy-jak-zresetowac-wewnetrzny-system-i-wrocic-do-ustawien-fabrycznych-boga',
      image: 'images/news/art-kod-zrodlowy.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#KodZrodlowyDuszy'
    },
    {
      title: 'Książka: U boku Diabła — Cezary Rogowski. Anatomia duchowej walki i zwycięstwa',
      lead: '„Największym sukcesem wroga jest przekonanie człowieka, że walka duchowa to tylko mit. Słowo Boże obnaża każdą strategię ciemności i daje oręż zwycięstwa w Chrystusie.”',
      url: 'https://polskieradio.cc/u-boku-diabla',
      image: 'images/news/art-u-boku-diabla.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#UbokuDiabla'
    },
    {
      title: 'Książka: Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo',
      lead: '„Prawda Boża nie potrzebuje retuszu współczesnej poprawności. Tylko bezkompromisowa Ewangelia ma moc uwalniać z sideł zakłamania.”',
      url: 'https://polskieradio.cc/prawda-bez-filtra',
      image: 'images/news/art-prawda-bez-filtra.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#PrawdaBezFiltra'
    },
    {
      title: 'Książka: Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania',
      lead: '„Jak pogodzić cierpienie z miłością Stwórcy? Biblijne świadectwo i refleksja nad prawdziwym charakterem Boga, który oddał wszystko za człowieka.”',
      url: 'https://polskieradio.cc/bog-jest-miloscia',
      image: 'images/news/art-bog-jest-miloscia.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#BogJestMiloscia'
    },
    {
      title: 'Półka z Książkami: Cezary Rogowski — Oficjalna Biblioteka Autorska',
      lead: 'Kompletny zbiór książek, powieści i publikacji formacyjnych Cezarego Rogowskiego. Czytaj online, słuchaj audiobooków i pobieraj bezpłatnie w ekosystemie CC.',
      url: 'https://polskieradio.cc/ksiazki-autora',
      image: 'assets/ksiazki-autora-og.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#KsiazkiAutora'
    }
  ];
  for (const b of books) addCandidate(b);

  // 2. WERSET DNIA (Z DEDYKOWANYMI GRAFIKAMI BIBLIJNYMI)
  const verses = [
    {
      title: 'Werset Dnia: „Ty jesteś Bogiem, który mnie widzi” (Rdz 16:13, UBG)',
      lead: '„I nazwała PANA, który mówił do niej: Ty jesteś Bogiem, który mnie widzi. Powiedziała bowiem: Czyż tu nie spoglądałam na tego, który widzi mnie?” (Rdz 16:13)',
      url: 'https://polskieradio.cc/mojabiblia?ref=GEN.16.13',
      image: 'images/news/art-rdz16-17-hagar-el-roi.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Spójrz teraz na niebo i policz gwiazdy...” (Rdz 15:5, UBG)',
      lead: '„Spójrz teraz na niebo i policz gwiazdy, jeśli będziesz mógł je policzyć; i powiedział mu: Takie będzie twoje potomstwo.” (Rdz 15:5, UBG)',
      url: 'https://polskieradio.cc/mojabiblia?ref=GEN.15.5',
      image: 'images/news/art-rdz15-abram-gwiazdy.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG)',
      lead: '„Niech to będzie dalekie od ciebie, by zabić sprawiedliwego z niegodziwym (...) Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG)',
      url: 'https://polskieradio.cc/mojabiblia?ref=GEN.18.25',
      image: 'images/news/art-rdz18-mamre-wstawiennictwo.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Pamiętaj o dniu szabatu, aby go święcić” (Wj 20:8, UBG)',
      lead: '„Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracował, ale siódmy dzień jest szabatem PANA.” (Wj 20:8-10, UBG)',
      url: 'https://polskieradio.cc/prawo/dziesiec-przykazan-bozych-biblia-jakub-wujek-bjw-dekalog',
      image: 'images/news/art-dekalog-dziesiec-przykazan-wujek.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#Dekalog'
    },
    {
      title: 'Werset Dnia: „Wy myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20, UBG)',
      lead: '„Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG)',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-31',
      image: 'images/news/art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    }
  ];
  for (const v of verses) addCandidate(v);

  // 3. MUZYKA, PORTALE MUZYCZNE & YOUTUBE
  const musicItems = [
    {
      title: 'topTEN — Oficjalna Lista Przebojów i Notowania Muzyki Chrześcijańskiej',
      lead: 'Oficjalne notowania muzyki chrześcijańskiej Polskiego Radia CC. Cotygodniowe zestawienie, głosowanie na utwory i wsparcie artystów w programie wspieramTO.',
      url: 'https://polskieradio.cc/topTEN',
      image: 'topTEN/assets/wspieramto-banner.png',
      category: 'Notowania & Muzyka',
      type: 'music',
      tag: '#topTEN'
    },
    {
      title: 'Nowość Muzyczna: Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39 / CC Men)',
      lead: 'Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39). Premiera utworu z tekstem w odtwarzaczu CC Men.',
      url: 'https://polskieradio.cc/CezaryRogowski',
      image: 'images/cezaryrogowski/cezary-hero.jpg',
      category: 'Muzyka & Wizytówka',
      type: 'music',
      tag: '#CCMen'
    },
    {
      title: 'Nowość Muzyczna: Gerald Welch — THE CALL. Głębokie uwielbienie w Polskim Radiu CC',
      lead: 'Premiera utworu Geralda Welcha „The Call”. Posłuchaj przejmującego chrześcijańskiego uwielbienia i poznaj historię utworu w recenzji muzycznej CCN News.',
      url: 'https://polskieradio.cc/news/gerald-welch-the-call',
      image: 'images/news/art-gerald-welch-the-call.jpg',
      category: 'Muzyka',
      type: 'music',
      tag: '#CCNMuzyka'
    },
    {
      title: 'Polskie Radio CC — Odtwarzacz Muzyki Chrześcijańskiej Spotify-Style & Transmisje 24/7',
      lead: 'Nowoczesny odtwarzacz: krystaliczny dźwięk HD, teksty pieśni, nocny kanał Ambient Sleep oraz codzienne rozważania wprost w Twojej przeglądarce.',
      url: 'https://polskieradio.cc/player',
      image: 'images/player/art-worship.jpg',
      category: 'Radio & Muzyka',
      type: 'music',
      tag: '#PolskieRadioCC'
    },
    {
      title: 'Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy',
      lead: 'Fascynująca seria wykładów biblijnych wyjaśniających proroctwa Daniela i Objawienia św. Jana w jakości 4K UHD. Oglądaj bezpłatnie w Kinie Chrześcijańskim VOD.',
      url: 'https://polskieradio.cc/vod',
      image: 'images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg',
      category: 'Kino VOD',
      type: 'vod',
      tag: '#StudioDobregoSlowa'
    },
    {
      title: 'Kanał Transmisyjny: Biblia Śpiewana Live — Słowo Boże ubrane w natchnioną muzykę',
      lead: 'Całodobowy kanał radiowo-wizualny z natchnionymi Psalmami i pieśniami biblijnymi. Ukojenie, pokój i skupienie na Bożej obecności o każdej porze dnia i nocy.',
      url: 'https://polskieradio.cc/biblia-spiewana',
      image: 'Logo_Biblia_Spiewana.jpg',
      category: 'Muzyka',
      type: 'music',
      tag: '#BibliaSpiewana'
    }
  ];
  for (const m of musicItems) addCandidate(m);

  // 4. WIZYTÓWKI & PROFILE SPOŁECZNOŚCI LUMINA
  const profiles = [
    {
      title: 'Wizytówka: Cezary Rogowski — Założyciel Christian Culture & Polskie Radio CC',
      lead: 'Poznaj profil założyciela misji Christian Culture, architekta ekosystemu mediów biblijnych, publicysty i autora książek. Dołącz do dyskusji na portalu LUMINA.',
      url: 'https://polskieradio.cc/lumina.cezaryrgowski',
      image: 'images/mcc/em-cezary-rogowski-16-9.jpg',
      category: 'Wizytówka',
      type: 'profile',
      tag: '#CezaryRogowski'
    },
    {
      title: 'Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara',
      lead: 'Poznaj autorski profil Wioletty Rogowskiej na portalu LUMINA. Poradniki dotyczące chrześcijańskiego domu, wychowania dzieci w wierze, cyfrowego detoksu i służby bliźnim.',
      url: 'https://polskieradio.cc/lumina.wiolettarogowska',
      image: 'images/wioletta/wioletta-og.jpg',
      category: 'Wizytówka',
      type: 'profile',
      tag: '#WiolettaRogowska'
    },
    {
      title: 'Studio Dobrego Słowa: Mariusz & pastor Wincenty Sieja — Cykl „Apokalipsa: Księga Nadziei”',
      lead: 'Głębokie studium biblijnych proroctw Księgi Objawienia w świetle Ewangelii i Słowa Bożego. Odkryj nadzieję w Chrystusie w cyklu prowadzonym przez Mariusza i pastora Wincentego Sieję ze Studia Dobrego Słowa.',
      url: 'https://polskieradio.cc/vod',
      image: 'avatar_mariusz_sds.jpg',
      category: 'Studio Dobrego Słowa',
      type: 'vod',
      tag: '#StudioDobregoSlowa'
    },
    {
      title: 'LUMINA — Wolna od Algorytmów Przestrzeń Społeczności Chrześcijańskiej',
      lead: 'Dołącz do chrześcijańskiego portalu społecznościowego LUMINA. Dziel się wersetami, modlitwami, świadectwami i twórz wartościowe relacje w czystym środowisku.',
      url: 'https://polskieradio.cc/lumina-tablica',
      image: 'images/kultura/card-lumina.jpg',
      category: 'Społeczność',
      type: 'profile',
      tag: '#Lumina'
    }
  ];
  for (const p of profiles) addCandidate(p);

  // 5. NAJWAŻNIEJSZE DEDYKOWANE MODUŁY EKOSYSTEMU CC
  const coreModules = [
    {
      title: 'Ark of Fire — Chrześcijański Rock i Metal z Holandii w Polskim Radiu CC',
      lead: 'Oficjalna wizytówka artysty: potężne brzmienie, świadectwo wiary w Jezusa Chrystusa, przejrzystość AI i utwór It Is Finished.',
      url: 'https://polskieradio.cc/ArkOfFire/pl/',
      image: 'ArkOfFire/assets/ark-of-fire-hero.webp',
      category: 'Wizytówka & Rock',
      type: 'music',
      tag: '#ArkOfFire'
    },
    {
      title: 'THE JOURNAL — 90-Dniowy Przewodnik Rozwoju Osobistego i Wiary',
      lead: 'Zatrzymaj się na 5 minut dziennie. 90 dni, 9 etapów formacji, karta codzienna, bezpłatny pamiętnik PDF i pytania wieczorne.',
      url: 'https://polskieradio.cc/the-journal',
      image: 'the-journal/assets/the-journal.png',
      category: 'THE JOURNAL',
      type: 'module',
      tag: '#TheJournal'
    },
    {
      title: 'Rozwiąż problem: Rzuć palenie w 14 dni — Praktyczny kurs chrześcijański',
      lead: 'Nowy moduł w ekosystemie: 14 lekcji, plan na głód nikotynowy, podsumowanie audio i wolność w Chrystusie.',
      url: 'https://polskieradio.cc/rozwiaz-problem',
      image: 'rozwiaz-problem/assets/og-rozwiaz-problem.jpg',
      category: 'Kurs & Wolność',
      type: 'course',
      tag: '#RozwiazProblem'
    },
    {
      title: 'Bądź Blisko: 7 Dni ze Słowem — Spotkania ze Słowem dające pokój',
      lead: 'Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Prosty, bezpłatny plan biblijny Christian Culture.',
      url: 'https://polskieradio.cc/badz-blisko',
      image: 'badz-blisko/swiatlo.png',
      category: 'Słowo Boże',
      type: 'module',
      tag: '#BadzBlisko'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 42 (Wj 11:1–12:36): Święto Paschy, Krew Baranka i Wykupienie Pierworodnych — Noc sądu i triumfalne wyjście z Egiptu',
      lead: 'Dzień 42 (11 listopada 2026): Ustanowienie Paschy, krew baranka bez skazy na odrzwiach w Goszen, sąd o północy nad bogami Egiptu i wykupienie pierworodnych.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-42',
      image: 'images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Sąd nad fałszywym światłem i wolność bez kompromisów',
      lead: 'Dzień 41 (10 listopada 2026): Kolejne sądy nad Egiptem: niszczycielska plaga szarańczy oraz namacalna ciemność egipska trwająca trzy dni. Sąd nad bożkiem słońca Ra i nienaruszalne Boże światło w domach Izraela.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-41',
      image: 'images/academy/daily/kc_day_41_szarancza_ciemnosc.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 40 (Wj 9:1–35): Pomór bydła, wrzody i ogień z gradem — Boża moc ponad pychą faraona',
      lead: 'Dzień 40 (9 listopada 2026): Kolejne sądy nad Egiptem: pomór bydła, wrzody z popiołu pieca i niszczycielski grad z ogniem. Boża moc objawiona nad pychą faraona i bezpieczne schronienie w ziemi Goszen.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-40',
      image: 'images/academy/daily/kc_day_40_pomor_wrzody_grad.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 39 (Wj 8:1–32): Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen',
      lead: 'Dzień 39 (8 listopada 2026): Trzy kolejne sądy nad bóstwami Egiptu, kapitulacja magów wyznających „To jest palec Boży” oraz nienaruszalna ochrona ziemi Goszen.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-39',
      image: 'images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 38 (Wj 7:1–25): Laska połykająca węże i woda w krew',
      lead: 'Dzień 38 (7 listopada 2026): Pierwszy znak przed faraonem, laska Aarona połykająca węże i plaga na Nilu — Boża suwerenność nad bożkami Egiptu.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-38',
      image: 'images/academy/daily/kc_day_38_laska_woda_w_krew_nil.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Akademia Biblijna: Z Biblią za Pan Brat — Dzień 37 (Wj 6:1–30): Siedem obietnic odkupienia',
      lead: 'Dzień 37 (6 listopada 2026): Objawienie Imienia JAHWE, wieczne przymierze, 7 Bożych obietnic odkupienia wyciągniętym ramieniem i przezwyciężenie udręki ducha.',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-37',
      image: 'images/academy/daily/kc_day_37_obietnice_odkupienia_ramie_pana.jpg',
      category: 'Akademia Biblijna',
      type: 'module',
      tag: '#KursCodzienny'
    },
    {
      title: 'Biblia Audio CC: Księga Rodzaju 15 (GEN-015) — Przymierze z Abramem i Boża obietnica',
      lead: 'Nowy rozdział w słuchowisku (6 listopada 2026)! Księga Rodzaju 15,1–21 (UBG): Przymierze Boga z Abramem, gwiazdy na niebie, usprawiedliwienie z wiary i obietnica dziedzictwa.',
      url: 'https://polskieradio.cc/biblia-audio',
      image: 'images/news/art-rdz15-abram-gwiazdy.jpg',
      category: 'Biblia Audio',
      type: 'module',
      tag: '#BibliaAudio'
    },
    {
      title: 'Biblia Audio CC — Księga Rodzaju w Kinowej Jakości Dźwięku i Słuchowiskach',
      lead: 'Trwa produkcja pierwszego kinowego słuchowiska Pisma Świętego od Księgi Rodzaju. Posłuchaj pierwszych rozdziałów lub wesprzyj nagranie!',
      url: 'https://polskieradio.cc/biblia-audio',
      image: 'biblia-audio/assets/rodzaju-hero.jpg',
      category: 'Biblia Audio',
      type: 'module',
      tag: '#BibliaAudio'
    },
    {
      title: 'Akademia Biblijna & Kurs Codzienny — Systematyczne Studium Słowa Bożego',
      lead: 'Codzienna dawka wiedzy biblijnej, komentarze werset po wersecie oraz bezpłatne kursy formacyjne dla każdego.',
      url: 'https://polskieradio.cc/akademia',
      image: 'images/academy/z_biblia_za_pan_brat_hero.jpg',
      category: 'Akademia',
      type: 'module',
      tag: '#AkademiaBiblijna'
    },
    {
      title: 'Interlinearna MojaBiblia — Kody Stronga, Greka, Hebrajski i Przekład UBG',
      lead: 'Nowoczesne cyfrowe narzędzie do wnikliwego badania tekstu Pisma Świętego w językach oryginalnych.',
      url: 'https://polskieradio.cc/mojabiblia',
      image: 'images/news/art-rdz15-abram-gwiazdy.jpg',
      category: 'Pismo Święte',
      type: 'module',
      tag: '#MojaBiblia'
    },
    {
      title: '95 tez Marcina Lutra (Wittenberga, 1517) — Kompletny Tekst z Komentarzem',
      lead: 'Powrót do czystej Ewangelii i jedynego autorytetu Słowa Bożego. Przeczytaj kompletny polski przekład 95 tez z historycznym wstępem redakcyjnym.',
      url: 'https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517',
      image: 'images/news/95-tez-marcina-lutra-wittenberga-1517.jpg',
      category: 'Historia',
      type: 'news',
      tag: '#DzienReformacji'
    },
    {
      title: 'Żywa Interaktywna Mapa Ekosystemu Christian Culture',
      lead: 'Zobacz na żywo strukturę ponad 20 portali, platform edukacyjnych, odtwarzaczy i aplikacji tworzących zintegrowany ekosystem Christian Culture.',
      url: 'https://polskieradio.cc/mapa',
      image: 'assets/mapa/planeta-poster.jpg',
      category: 'Ekosystem',
      type: 'module',
      tag: '#MapaCC'
    }
  ];
  for (const m of coreModules) addCandidate(m);

  // 6. ARTYKUŁY Z ARTICLES.TS Z DEDYKOWANYMI GRAFIKAMI
  if (fs.existsSync(ARTICLES_TS_PATH)) {
    try {
      const tsContent = fs.readFileSync(ARTICLES_TS_PATH, 'utf8');
      const blocks = tsContent.split(/\{\s*id:\s*['"`]/);
      for (const block of blocks.slice(1)) {
        const idMatch = block.match(/^([^'"`]+)/);
        const titleMatch = block.match(/title:\s*['"`](.*?)['"`]/);
        const slugMatch = block.match(/slug:\s*['"`](.*?)['"`]/);
        const leadMatch = block.match(/lead:\s*['"`](.*?)['"`]/) || block.match(/excerpt:\s*['"`](.*?)['"`]/);
        const portalMatch = block.match(/portal:\s*['"`](.*?)['"`]/);
        const imgMatch = block.match(/imageUrl:\s*['"`](.*?)['"`]/);

        if (titleMatch && (slugMatch || idMatch)) {
          const slug = slugMatch ? slugMatch[1] : idMatch[1];
          const portal = portalMatch ? portalMatch[1] : 'news';
          const title = titleMatch[1];
          const lead = leadMatch ? leadMatch[1] : '';
          const url = `https://polskieradio.cc/${portal}/${slug}`;
          const image = imgMatch ? imgMatch[1] : null;

          addCandidate({
            title,
            lead,
            url,
            image,
            category: `CCN ${portal.toUpperCase()}`,
            type: 'news',
            tag: `#${portal}`
          });
        }
      }
    } catch (e) {
      console.warn('[WARN] Błąd parsowania articles.ts:', e.message);
    }
  }

  // 7. POZYCJE Z CATALOG.JSON
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      if (Array.isArray(catalog.items)) {
        for (const it of catalog.items) {
          if (it.url && it.title && !it.url.includes('#') && (it.url.includes('polskieradio.cc') || it.url.startsWith('/'))) {
            const fullUrl = it.url.startsWith('http') ? it.url : `https://polskieradio.cc${it.url}`;
            let tag = '#CCNNews';
            if (fullUrl.includes('/historia/')) tag = '#HistoriaBiblijna';
            else if (fullUrl.includes('/nauka/')) tag = '#NaukaIBiblia';
            else if (fullUrl.includes('/akademia/')) tag = '#KursCodzienny';
            else if (fullUrl.includes('/biblia-audio/')) tag = '#BibliaAudio';

            addCandidate({
              title: it.title,
              lead: it.description || it.subtitle || '',
              url: fullUrl,
              image: it.image || it.imageUrl || null,
              category: it.category || 'Ekosystem',
              type: 'news',
              tag
            });
          }
        }
      }
    } catch (e) {
      console.warn('[WARN] Błąd catalog.json:', e.message);
    }
  }

  return candidates;
}

// Formatowanie posta zgodnie z dyrektywą Dowódcy
function formatBroadcasterTweet(item) {
  const header = '🔴 CCN NEWS | polskieradio.cc/news';
  let subHeader = '';
  let callToAction = '👉 Sprawdź w ekosystemie:\n';
  const tagList = [];
  function addTags(...tags) {
    for (const t of tags) {
      if (t && !tagList.includes(t)) tagList.push(t);
    }
  }

  if (item.type === 'book') {
    subHeader = '📚 KSIĄŻKA & WYDAWNICTWO CC';
    callToAction = '👉 Czytaj w ekosystemie:\n';
    addTags(item.tag || '#KsiazkiCC', '#CezaryRogowski', '#ChristianCulture');
  } else if (item.type === 'verse') {
    subHeader = '📖 WERSET DNIA (UBG)';
    if ((item.url || '').includes('akademia')) {
      callToAction = '👉 Akademia Biblijna:\n';
    } else if ((item.url || '').includes('prawo')) {
      callToAction = '👉 Czytaj w serwisie:\n';
    } else {
      callToAction = '👉 MojaBiblia:\n';
    }
    addTags(item.tag || '#WersetDnia', '#SlowoBoze');
  } else if (item.type === 'vod' || (item.url || '').includes('/vod') || item.category === 'Kino VOD' || item.category === 'Studio Dobrego Słowa') {
    subHeader = '🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS';
    callToAction = '👉 Oglądaj bezpłatnie w jakości 4K:\n';
    addTags(item.tag || '#StudioDobregoSlowa', '#KinoVOD', '#Apokalipsa', '#ChristianCulture');
  } else if (item.type === 'music') {
    if ((item.url || '').includes('topTEN') || item.tag === '#topTEN') {
      subHeader = '🏆 TOPTEN | NOTOWANIA CC';
      callToAction = '👉 Głosuj i słuchaj:\n';
      addTags('#topTEN', '#PolskieRadioCC', '#MuzykaChrzescijanska');
    } else if ((item.url || '').includes('CezaryRogowski')) {
      subHeader = '🎵 PREMIERA AUTORSKA | CC MEN';
      callToAction = '👉 Słuchaj z tekstem:\n';
      addTags(item.tag || '#CCMen', '#CezaryRogowski', '#MuzykaChrzescijanska');
    } else if ((item.url || '').includes('ArkOfFire') || (item.title || '').includes('Ark of Fire')) {
      subHeader = '🎸 ARK OF FIRE | ROCK & METAL';
      callToAction = '👉 Odkryj wizytówkę i muzykę:\n';
      addTags('#ArkOfFire', '#ChristianRock', '#PolskieRadioCC');
    } else {
      subHeader = '🎵 MUZYKA & KANAŁY LIVE';
      callToAction = '👉 Słuchaj na żywo:\n';
      addTags(item.tag || '#CCNMuzyka', '#PolskieRadioCC', '#WorshipLive', '#ChristianCulture');
    }
  } else if (item.type === 'course' || (item.url || '').toLowerCase().includes('rozwiaz')) {
    subHeader = '🕊️ ROZWIĄŻ PROBLEM | NOWY KURS';
    callToAction = '👉 Rozpocznij kurs:\n';
    addTags(item.tag || '#RozwiazProblem', '#RzucPalenie', '#Wolnosc');
  } else if (item.type === 'profile') {
    subHeader = '👤 SPOŁECZNOŚĆ CC | Portal LUMINA';
    callToAction = '👉 Dołącz do społeczności LUMINA:\n';
    addTags(item.tag || '#Lumina', '#LudzieMisji', '#ChristianCulture');
  } else if (item.type === 'module') {
    if ((item.url || '').includes('biblia-audio')) {
      subHeader = '🎧 BIBLIA AUDIO & SŁUCHOWISKA CC';
      callToAction = '👉 Słuchaj bezpłatnie:\n';
      addTags(item.tag || '#BibliaAudio', '#SlowoBoze', '#ChristianCulture');
    } else if ((item.url || '').includes('badz-blisko')) {
      subHeader = '🌱 BĄDŹ BLISKO | 7 DNI ZE SŁOWEM';
      callToAction = '👉 Rozpocznij 7-dniową drogę:\n';
      addTags(item.tag || '#BadzBlisko', '#SlowoBoze', '#ChristianCulture');
    } else if ((item.url || '').includes('ArkOfFire') || (item.title || '').includes('Ark of Fire')) {
      subHeader = '🎸 ARK OF FIRE | ROCK & METAL';
      callToAction = '👉 Odkryj wizytówkę i muzykę:\n';
      addTags(item.tag || '#ArkOfFire', '#ChristianRock', '#ChristianCulture');
    } else if ((item.url || '').includes('the-journal') || (item.title || '').includes('THE JOURNAL')) {
      subHeader = '📔 THE JOURNAL | 90 DNI FORMACJI';
      callToAction = '👉 Odkryj i zacznij dziś:\n';
      addTags(item.tag || '#TheJournal', '#FormacjaDuchowa', '#ChristianCulture');
    } else if ((item.url || '').includes('akademia')) {
      subHeader = '🎓 AKADEMIA BIBLIJNA CC';
      callToAction = '👉 Studiuj bezpłatnie:\n';
      addTags(item.tag || '#AkademiaBiblijna', '#KursCodzienny', '#ChristianCulture');
    } else if ((item.url || '').includes('mojabiblia')) {
      subHeader = '📖 MOJA BIBLIA INTERLINEARNA';
      callToAction = '👉 Badaj Pismo Święte:\n';
      addTags(item.tag || '#MojaBiblia', '#Strong', '#UBG');
    } else if ((item.url || '').includes('mapa')) {
      subHeader = '🗺️ ŻYWA MAPA EKOSYSTEMU CC';
      callToAction = '👉 Zobacz architekturę na żywo:\n';
      addTags(item.tag || '#MapaCC', '#EkosystemCC', '#ChristianCulture');
    } else {
      subHeader = '🌐 EKOSYSTEM CHRISTIAN CULTURE';
      callToAction = '👉 Odkryj w ekosystemie:\n';
      addTags(item.tag || '#EkosystemCC', '#ChristianCulture', '#Prawda');
    }
  } else if (item.type === 'news') {
    const tLower = (item.title || '').toLowerCase();
    if (tLower.includes('z biblią za pan brat') || tLower.includes('kurs codzienny') || (item.url || '').includes('/akademia/')) {
      subHeader = '🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY';
      callToAction = '👉 Studiuj w serwisie:\n';
      addTags('#KursCodzienny', '#AkademiaBiblijna', '#CCNNews');
    } else if (tLower.includes('sprawozdanie') || tLower.includes('raport')) {
      subHeader = '🌍 RAPORT MISYJNY CC';
      callToAction = '👉 Czytaj pełny raport:\n';
      addTags('#CCNNews', '#MisjaCC', '#ChristianCulture');
    } else if (tLower.includes('bioetyka') || tLower.includes('genom') || tLower.includes('crispr')) {
      subHeader = '🧬 NAUKA & BIOETYKA';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#Bioetyka', '#Prawda');
    } else if (tLower.includes('inwestor') || tLower.includes('finanse') || tLower.includes('złoto') || tLower.includes('szafarz') || (item.url || '').includes('/finanse/')) {
      subHeader = '💰 CCN FINANSE | BIBLIJNE SZAFARSTWO';
      callToAction = '👉 Czytaj bezpłatny poradnik w serwisie:\n';
      addTags('#CCNFinanse', '#FinansePoBozemu', '#CezaryRogowski', '#CCNNews');
    } else if (tLower.includes('blackout') || tLower.includes('survival') || tLower.includes('72 godziny')) {
      subHeader = '🛡️ SURVIVAL & BEZPIECZEŃSTWO CC';
      callToAction = '👉 Czytaj poradnik w serwisie:\n';
      addTags('#CCNNews', '#SurvivalCC', '#Prawda');
    } else if (tLower.includes('archeolog') || tLower.includes('kamienie') || tLower.includes('jerozolim') || tLower.includes('ezechiasz') || tLower.includes('tel dan')) {
      subHeader = '🏛️ ARCHEOLOGIA & HISTORIA BIBLIJNA';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#ArcheologiaBiblijna', '#CCNNews', '#Prawda');
    } else if (tLower.includes('reformacj') || tLower.includes('lutr') || (item.url || '').includes('/historia/')) {
      subHeader = '📜 HISTORIA & REFORMACJA';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#DzienReformacji', '#Prawda');
    } else if (tLower.includes('newsletter')) {
      subHeader = '📬 OFICJALNY NEWSLETTER CC';
      callToAction = '👉 Dołącz bezpłatnie w serwisie:\n';
      addTags('#CCNNews', '#NewsletterCC', '#ChristianCulture');
    } else if (tLower.includes('detoks') || tLower.includes('rodzin') || tLower.includes('wychowan') || tLower.includes('nastolat')) {
      subHeader = '🏠 CHRZEŚCIJAŃSKI DOM & RODZINA';
      callToAction = '👉 Czytaj poradnik w serwisie:\n';
      addTags('#CCNNews', '#RodzinaCC', '#Wychowanie', '#Prawda');
    } else if (tLower.includes('tętno misji') || tLower.includes('przegląd ekosystemu')) {
      subHeader = '🔥 TĘTNO MISJI | CC INSIDE';
      callToAction = '👉 Sprawdź przegląd w serwisie:\n';
      addTags('#CCNNews', '#TetnoMisji', '#ChristianCulture');
    } else if (tLower.includes('halloween')) {
      subHeader = '✝️ DEKLARACJA REDAKCYJNA CC';
      callToAction = '👉 Czytaj analizę biblijną:\n';
      addTags('#CCNNews', '#ChristianCulture', '#Swiatlosc', '#Prawda');
    } else if (tLower.includes('charytat') || tLower.includes('diakoni') || tLower.includes('senior') || tLower.includes('milosierdzie') || tLower.includes('miłosierdzie')) {
      subHeader = '🤝 DIAKONIA & POMOC SPOŁECZNA';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#Diakonia', '#ChristianCulture');
    } else if (tLower.includes('telefon milczy') || tLower.includes('samotn') || tLower.includes('sąsiad') || tLower.includes('sasiad')) {
      subHeader = '🤝 SPOŁECZEŃSTWO & EMPATIA | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#Samotnosc', '#PomocSasiedzka', '#CezaryRogowski', '#Prawda');
    } else if (tLower.includes('życzliwość') || tLower.includes('zyczliwosc') || (item.url || '').includes('zyczliwosc') || tLower.includes('pomaganiu')) {
      subHeader = '💡 eM • MOTYWACJA & ETYKA | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#eM', '#CezaryRogowski', '#Prawda');
    } else if (tLower.includes('pokonać goliata') || tLower.includes('pokonac goliata') || (item.url || '').includes('pokonac-goliata')) {
      subHeader = '🛡️ POKONAĆ GOLIATA | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj artykuł w serwisie:\n';
      addTags('#PokonacGoliata', '#CezaryRogowski', '#CCNNews', '#Prawda');
    } else if (tLower.includes('u boku diabła') || tLower.includes('u boku diabla') || (item.url || '').includes('u-boku-diabla')) {
      subHeader = '🛡️ U BOKU DIABŁA | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj artykuł w serwisie:\n';
      addTags('#UbokuDiabla', '#CezaryRogowski', '#CCNNews', '#Prawda');
    } else if (tLower.includes('pokój') || tLower.includes('pokoj') || tLower.includes('lęk') || tLower.includes('lek')) {
      subHeader = '🕊️ POKÓJ SERCA & NADZIEJA';
      callToAction = '👉 Czytaj artykuł w serwisie:\n';
      addTags('#CCNNews', '#PokojBozy', '#SlowoBoze', '#Prawda');
    } else if (tLower.includes('patriotyzm') || tLower.includes('niepodległość') || tLower.includes('niepodleglosc')) {
      subHeader = '🇵🇱 OJCZYZNA & SPOŁECZEŃSTWO | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#Patriotyzm', '#CezaryRogowski', '#Prawda');
    } else if (tLower.includes('kraków') || tLower.includes('krakow') || tLower.includes('strzelanin')) {
      subHeader = '🖤 KRAKÓW W ŻAŁOBIE | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj chrześcijański komentarz:\n';
      addTags('#Krakow', '#CCNNews', '#CezaryRogowski', '#Modlitwa', '#Prawda');
    } else if (tLower.includes('kryzys') || tLower.includes('kościele wolno')) {
      subHeader = '💡 eM • WIARA & AUTENTYCZNOŚĆ | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#KryzysWiary', '#CezaryRogowski', '#CCNNews', '#Prawda');
    } else if (tLower.includes('świętość') || tLower.includes('swietosc') || tLower.includes('słabości') || tLower.includes('slabosci')) {
      subHeader = '✝️ FORMACJA & WIARA | CEZARY ROGOWSKI';
      callToAction = '👉 Czytaj artykuł w serwisie:\n';
      addTags('#Swietosc', '#CezaryRogowski', '#CCNNews', '#Prawda');
    } else if (tLower.includes('czytelnictw') || tLower.includes('towarzystwo biblijne') || tLower.includes('cyfrowe studium') || tLower.includes('ekumeniczn') || tLower.includes('rada ekumeniczna') || tLower.includes('dni biblijne')) {
      subHeader = '📖 POLSKA & BIBLIA | RAPORT CCN';
      callToAction = '👉 Czytaj raport w serwisie:\n';
      addTags('#CCNNews', '#Biblia', '#SlowoBoze', '#ChristianCulture');
    } else {
      subHeader = '📰 RAPORT & PUBLICYSTYKA CCN';
      callToAction = '👉 Czytaj w serwisie:\n';
      addTags('#CCNNews', '#ChristianCulture', '#Prawda');
    }
  } else {
    addTags(item.tag || '#CCNNews', '#ChristianCulture', '#Prawda');
  }

  const hashtags = tagList.join(' ');
  const url = item.url;
  let bodyText = '';

  if (item.type === 'verse' && item.lead) {
    bodyText = item.lead;
  } else if ((item.url || '').includes('topTEN')) {
    bodyText = 'Oficjalna lista przebojów muzyki chrześcijańskiej. Głosuj na utwory i wspieraj artystów!';
  } else if ((item.url || '').includes('ArkOfFire') || (item.title || '').includes('Ark of Fire')) {
    bodyText = 'Ark of Fire — chrześcijański rock z Holandii. Świadectwo odkupienia i utwór „It Is Finished” w Polskim Radiu CC.';
  } else if ((item.url || '').includes('the-journal') || (item.title || '').includes('THE JOURNAL')) {
    bodyText = 'THE JOURNAL — 90-dniowy przewodnik formacji, wiary i nawyków. Karta dzienna, pytania wieczorne i bezpłatne PDF!';
  } else if ((item.url || '').includes('CezaryRogowski') && item.lead) {
    bodyText = item.lead;
  } else if ((item.url || '').includes('krakow') || (item.title || '').toLowerCase().includes('kraków')) {
    bodyText = 'Kraków w żałobie: 6 ofiar strzelaniny. Chrześcijański komentarz Cezarego Rogowskiego wobec zła, bólu i żałoby.';
  } else if ((item.url || '').includes('pokonac-goliata') || (item.title || '').toLowerCase().includes('pokonać goliata')) {
    bodyText = 'Pokonać Goliata — 8 kroków zwycięzcy z doliny lęku do pełnej wolności według Słowa Bożego.';
  } else if ((item.url || '').toLowerCase().includes('rozwiaz')) {
    bodyText = 'Rzuć palenie w 14 dni — bezpłatny kurs, plan na głód nikotynowy, audio i biblijna nadzieja.';
  } else if ((item.url || '').includes('blackout') || (item.title || '').toLowerCase().includes('blackout')) {
    bodyText = 'Kryzys infrastrukturalny, blackout i 72 godziny w domu: Jak mądrze zabezpieczyć rodzinę według biblijnej roztropności.';
  } else if ((item.url || '').includes('badz-blisko')) {
    bodyText = '7 krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Bezpłatny 7-dniowy przewodnik!';
  } else if ((item.url || '').includes('dzien-42')) {
    bodyText = 'Dzień 42 (Wj 11:1–12:36): Święto Paschy, krew Baranka na odrzwiach w Goszen, sąd nad bóstwami Egiptu i odkupienie ludu Bożego.';
  } else if ((item.url || '').includes('dzien-41')) {
    bodyText = 'Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Boża suwerenność, sąd nad fałszywym światłem i wolność bez kompromisów.';
  } else if ((item.url || '').includes('dzien-40')) {
    bodyText = 'Dzień 40 (Wj 9:1–35): Pomór bydła, wrzody i bezprecedensowy grad z ogniem. Boża moc ponad pychą faraona i ochrona ziemi Goszen.';
  } else if ((item.url || '').includes('dzien-39')) {
    bodyText = 'Dzień 39 (Wj 8:1–32): Plagi żab, wszy i much — bezsilność czarowników („To jest palec Boży!”) i ochrona ziemi Goszen.';
  } else if ((item.url || '').includes('dzien-38')) {
    bodyText = 'Dzień 38 (Wj 7:1–25): Laska Aarona połykająca węże czarnoksiężników i woda Nilu zamieniona w krew.';
  } else if ((item.url || '').includes('dzien-37')) {
    bodyText = 'Dzień 37 (Wj 6:1–30): Objawienie Imienia JAHWE, 7 Bożych obietnic odkupienia i wyciągnięte Boże ramię.';
  } else if ((item.url || '').includes('dzien-36')) {
    bodyText = 'Dzień 36 (Wj 5:1–23): Pierwsza konfrontacja Mojżesza i Aarona z faraonem, próba wiary pod uciskiem i Boża wierność.';
  } else if ((item.url || '').includes('dzien-35')) {
    bodyText = 'Dzień 35 (Wj 4:1–31): Znaki z laską na Horebie, powołanie Aarona jako rzecznika i posłuszeństwo Bożemu wezwaniu.';
  } else if ((item.url || '').includes('dzien-34')) {
    bodyText = 'Dzień 34 (Wj 3:1–22): Płonący krzak, Święte Imię Boga i Boże zstąpienie na ratunek ludu.';
  } else if ((item.url || '').includes('dzien-33')) {
    bodyText = 'Dzień 33 (Wj 2:1–25): Z wód Nilu do pustyni Madian — ocalenie Mojżesza i Boża pamięć o przymierzu.';
  } else if ((item.url || '').includes('dzien-32')) {
    bodyText = 'Start Księgi Wyjścia! Dzień 32 (Wj 1:1–22): Nowy król, ucisk i Boże ocalenie — heroiczna wiara położnych Szifry i Pui.';
  } else if ((item.url || '').endsWith('/akademia')) {
    bodyText = 'Akademia Biblijna & Kurs Codzienny: Systematyczne studium Pisma Świętego i bezpłatne kursy dla każdego.';
  } else if ((item.title || '').includes('GEN-015') || (item.title || '').includes('Rodzaju 15')) {
    bodyText = 'Nowy rozdział w słuchowisku! Księga Rodzaju 15 (UBG): Przymierze z Abramem, gwiazdy na niebie i wiara (Rdz 15,6).';
  } else if ((item.title || '').includes('GEN-012') || (item.title || '').includes('Rodzaju 12')) {
    bodyText = 'Nowy rozdział w słuchowisku! Księga Rodzaju 12 (UBG): Powołanie Abrama, wyjście z Haranu i obietnica wielkiego narodu.';
  } else if (item.type === 'vod' && item.title.includes('Proroctwa')) {
    bodyText = 'Proroctwa Daniela i Księgi Objawienia w serii wykładów biblijnych 4K UHD ze SDS.';
  } else if (item.type === 'vod' && item.title.includes('Księga Nadziei')) {
    bodyText = 'Cykl „Apokalipsa: Księga Nadziei” — Mariusz i pastor Wincenty Sieja (SDS).';
  } else {
    bodyText = item.title.trim()
      .replace(/^CCN News\s*[-–—:]\s*/i, '')
      .replace(/^Nowość Muzyczna:\s*/i, '')
      .replace(/^Kanał Transmisyjny:\s*/i, '')
      .replace(/^Książka:\s*/i, '')
      .replace(/^Wizytówka:\s*/i, '')
      .replace(/^Kraj\s*[-–—:]\s*/i, '')
      .replace(/^Świat\s*[-–—:]\s*/i, '')
      .replace(/\s*•\s*Polskie Radio CC.*$/i, '')
      .replace(/\s*–\s*CCN Historia.*$/i, '')
      .replace(/\s*\(\/[a-z0-9_/-]+\)\s*$/i, '')
      .trim();

    if (bodyText === bodyText.toUpperCase() && bodyText.length > 30) {
      bodyText = bodyText.charAt(0).toUpperCase() + bodyText.slice(1).toLowerCase();
      bodyText = bodyText
        .replace(/christian culture/gi, 'Christian Culture')
        .replace(/halloween/gi, 'Halloween')
        .replace(/wycliffe global alliance/gi, 'Wycliffe Global Alliance')
        .replace(/global scripture access/gi, 'Global Scripture Access')
        .replace(/„nie”/gi, '„NIE”')
        .replace(/\bpolsce\b/gi, 'Polsce')
        .replace(/\bpolska\b/gi, 'Polska')
        .replace(/\bpolski\b/gi, 'Polski')
        .replace(/\bpolskiego\b/gi, 'Polskiego')
        .replace(/\bpolskich\b/gi, 'Polskich')
        .replace(/\bpisma świętego\b/gi, 'Pisma Świętego')
        .replace(/\bsłowa bożego\b/gi, 'Słowa Bożego')
        .replace(/\btowarzystwo biblijne\b/gi, 'Towarzystwo Biblijne')
        .replace(/\btowarzystwa biblijnego\b/gi, 'Towarzystwa Biblijnego')
        .replace(/\bpolska rada ekumeniczna\b/gi, 'Polska Rada Ekumeniczna')
        .replace(/\bpolskiej rady ekumenicznej\b/gi, 'Polskiej Rady Ekumenicznej')
        .replace(/\bpolską radę ekumeniczną\b/gi, 'Polską Radę Ekumeniczną')
        .replace(/\bdni biblijne\b/gi, 'Dni Biblijne')
        .replace(/\bdniach biblijnych\b/gi, 'Dniach Biblijnych')
        .replace(/\bchsch\b/gi, 'ChSCh')
        .replace(/\bkrakowie\b/gi, 'Krakowie')
        .replace(/\bkraków\b/gi, 'Kraków')
        .replace(/\bwarszawie\b/gi, 'Warszawie')
        .replace(/\bboga\b/gi, 'Boga')
        .replace(/\bbogu\b/gi, 'Bogu')
        .replace(/\bbóg\b/gi, 'Bóg')
        .replace(/\bbożego\b/gi, 'Bożego')
        .replace(/\bbożej\b/gi, 'Bożej')
        .replace(/\bboży\b/gi, 'Boży')
        .replace(/\bbożym\b/gi, 'Bożym')
        .replace(/\bjakuba\b/gi, 'Jakuba')
        .replace(/\bjakub\b/gi, 'Jakub')
        .replace(/\bizaaka\b/gi, 'Izaaka')
        .replace(/\bizaak\b/gi, 'Izaak')
        .replace(/\bezawa\b/gi, 'Ezawa')
        .replace(/\bezaw\b/gi, 'Ezaw')
        .replace(/\brebeki\b/gi, 'Rebeki')
        .replace(/\brebeka\b/gi, 'Rebeka')
        .replace(/\bksiędze rodzaju\b/gi, 'Księdze Rodzaju')
        .replace(/\bksięga rodzaju\b/gi, 'Księga Rodzaju')
        .replace(/\bksiędze wyjścia\b/gi, 'Księdze Wyjścia')
        .replace(/\bksięga wyjścia\b/gi, 'Księga Wyjścia')
        .replace(/\bjezus\b/gi, 'Jezus')
        .replace(/\bchrystus\b/gi, 'Chrystus')
        .replace(/\bopen doors\b/gi, 'Open Doors')
        .replace(/\bpkwp\b/gi, 'PKWP')
        .replace(/\bnigerii\b/gi, 'Nigerii')
        .replace(/\bazji\b/gi, 'Azji')
        .replace(/\bbliskim wschodzie\b/gi, 'Bliskim Wschodzie')
        .replace(/\bbliski wschód\b/gi, 'Bliski Wschód')
        .replace(/\bgoliata\b/gi, 'Goliata')
        .replace(/\bgoliath\b/gi, 'Goliath')
        .replace(/\bdawida\b/gi, 'Dawida')
        .replace(/\bdawid\b/gi, 'Dawid')
        .replace(/\bcezarego rogowskiego\b/gi, 'Cezarego Rogowskiego')
        .replace(/\bcezary rogowsk[a-z]*\b/gi, 'Cezary Rogowski')
        .replace(/\bwiolett[a-z]* rogowsk[a-z]*\b/gi, 'Wioletta Rogowska')
        .replace(/\?\s+([a-ząćęłńóśźż])/g, (m, c) => '? ' + c.toUpperCase());
    }
  }

  const subLine = subHeader ? `\n${subHeader}\n` : '\n\n';
  let tweet = `${header}${subLine}${bodyText}\n\n${callToAction}${url}\n\n${hashtags}`;

  // Limit 280 znaków (link t.co liczony jako 23 znaki)
  const calcLen = () => tweet.length - url.length + 23;

  if (calcLen() > 278) {
    while (calcLen() > 278 && bodyText.includes(' ')) {
      bodyText = bodyText.replace(/\s+\S+$/, '').trim();
      const cleaned = bodyText.replace(/\s+(według|w|z|do|i|a|o|na|oraz|ze|od|po|dla)\s*$/i, '').trim();
      tweet = `${header}${subLine}${cleaned}…\n\n${callToAction}${url}\n\n${hashtags}`;
    }
  }

  return tweet;
}

// Publikacja przez Playwright w tle
async function publishToX(tweetText, imagePath, dryRun = false) {
  if (dryRun) {
    console.log('\n[DRY RUN CCN BROADCASTER] Podgląd wpisu:');
    console.log('───────────────────────────────────────────────────────');
    console.log(tweetText);
    console.log('───────────────────────────────────────────────────────');
    console.log('🖼️ Dedykowana grafika:', imagePath ? path.basename(imagePath) : 'Brak');
    return { success: true, dryRun: true };
  }

  const authToken = process.env.X_AUTH_TOKEN;
  if (!authToken) {
    throw new Error('Brak X_AUTH_TOKEN w .env.local. Zaloguj się lub wklej auth_token.');
  }

  if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(async () => {
    return await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
  });

  await context.addCookies([
    {
      name: 'auth_token',
      value: authToken,
      domain: '.x.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'auth_token',
      value: authToken,
      domain: '.twitter.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ]);

  try {
    const page = await context.newPage();
    console.log('🌐 [CCN Broadcaster] Otwieram x.com/home w tle...');
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/i/flow/login')) {
      throw new Error('[CCN Broadcaster BŁĄD AUTORYZACJI] Sesja X wygasła. Wymagane odświeżenie X_AUTH_TOKEN w .env.local.');
    }

    let isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1000 }).catch(() => false);
    let textarea = isDialog
      ? page.locator('[role="dialog"] div[data-testid="tweetTextarea_0"], [role="dialog"] div[role="textbox"][contenteditable="true"]').first()
      : page.locator('div[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').first();

    const isReady = await textarea.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isReady) {
      const sideNavBtn = page.locator('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/post"]').first();
      if (await sideNavBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('🔘 [CCN Broadcaster] Otwieram okno tworzenia posta (SideNav button)...');
        await sideNavBtn.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('🌐 [CCN Broadcaster] Przechodzę bezpośrednio do x.com/compose/post...');
        await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
      }
      isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 2000 }).catch(() => false);
      textarea = isDialog
        ? page.locator('[role="dialog"] div[data-testid="tweetTextarea_0"], [role="dialog"] div[role="textbox"][contenteditable="true"]').first()
        : page.locator('div[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').last();
    }

    await textarea.waitFor({ state: 'visible', timeout: 25000 });
    await textarea.click({ force: true }).catch(async () => {
      await textarea.focus();
    });
    await page.waitForTimeout(500);

    // 1. Wpisanie sformatowanego tekstu
    await page.keyboard.insertText(tweetText);
    console.log('📝 [CCN Broadcaster] Wpisano treść nowości...');
    await page.waitForTimeout(2000);

    // 2. Wgrywanie dedykowanej grafiki tematycznej
    if (imagePath && fs.existsSync(imagePath)) {
      console.log(`🖼️ [CCN Broadcaster] Załączam dedykowaną grafikę: ${path.basename(imagePath)}...`);
      isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1000 }).catch(() => false);
      const fileInput = isDialog
        ? page.locator('[role="dialog"] input[data-testid="fileInput"]').first()
        : page.locator('input[data-testid="fileInput"]').last();
      await fileInput.setInputFiles(imagePath);
      console.log('⏳ [CCN Broadcaster] Oczekuję na załadowanie podglądu załącznika...');
      try {
        await page.waitForSelector('div[data-testid="attachments"], div[aria-label*="Usuń"], div[aria-label*="Remove"]', { timeout: 15000 });
        console.log('✅ [CCN Broadcaster] Dedykowana grafika została pomyślnie załączona!');
      } catch (e) {
        await page.waitForTimeout(4000);
      }
    }

    // 3. Wysłanie posta (przycisk TweetButton z modalu lub Control+Enter)
    console.log('🔘 [CCN Broadcaster] Wysyłam post...');
    isDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    const postBtn = isDialog
      ? page.locator('[role="dialog"] [data-testid="tweetButton"]')
      : page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').last();

    const btnVisible = await postBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      await postBtn.click({ force: true });
    }

    // Jeśli przycisk nadal widoczny po 1.5s, użyj natywnego skrótu Control+Enter
    await page.waitForTimeout(1500);
    if (await postBtn.isVisible().catch(() => false)) {
      console.log('🔄 [CCN Broadcaster] Ponawiam próbę wysłania skrótem Control+Enter...');
      await textarea.focus();
      await page.keyboard.press('Control+Enter');
    }

    // Weryfikacja: powiadomienie o wysłaniu, toast, zniknięcie przycisku publikacji lub zamknięcie modalu dialogowego
    const alertText = await page.locator('[role="alert"], div[data-testid="toast"]').innerText().catch(() => '');
    const isSentAlert = alertText.toLowerCase().includes('sent') || alertText.toLowerCase().includes('wysłano') || alertText.toLowerCase().includes('post was sent');

    let confirmed = isSentAlert;
    if (!confirmed) {
      confirmed = await Promise.race([
        page.waitForSelector('[role="alert"]', { timeout: 8000 }).then(async (el) => {
          const t = await el.innerText().catch(() => '');
          return t.toLowerCase().includes('sent') || t.toLowerCase().includes('wysłano') || t.toLowerCase().includes('post was sent');
        }).catch(() => false),
        postBtn.waitFor({ state: 'hidden', timeout: 8000 }).then(() => true).catch(() => false),
        isDialog ? page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 8000 }).then(() => true).catch(() => false) : Promise.resolve(false)
      ]);
    }

    if (!confirmed) {
      const latestAlert = await page.locator('[role="alert"]').innerText().catch(() => '');
      if (latestAlert.toLowerCase().includes('sent') || latestAlert.toLowerCase().includes('wysłano') || latestAlert.toLowerCase().includes('post was sent')) {
        confirmed = true;
      } else {
        const errorText = await page.locator('div[data-testid="error-detail"]').innerText().catch(() => '');
        const stillActive = await postBtn.isVisible().catch(() => false);
        const ariaDisabled = await postBtn.getAttribute('aria-disabled').catch(() => 'false');
        if (stillActive && ariaDisabled !== 'true') {
          await page.screenshot({ path: path.join(__dirname, '../x_debug_screen.png') }).catch(() => {});
          throw new Error('[CCN Broadcaster BŁĄD PUBLIKACJI] Przycisk publikacji nadal aktywny. Treść komunikatu: "' + (errorText || latestAlert) + '". Zrzut ekranu zapisano w x_debug_screen.png');
        }
      }
    }

    await page.waitForTimeout(3000).catch(() => {});
    console.log('🎉 [CCN Broadcaster] Post został zweryfikowany i opublikowany na platformie X!');

    await page.close().catch(() => {});
    await context.close().catch(() => {});
    return { success: true };
  } catch (err) {
    await context.close().catch(() => {});
    throw err;
  }
}

// Inteligentny wybór kandydata z zachowaniem zrównoważonej rotacji kategorii
function chooseNextCandidate(candidates, history, state, requestedType = null, requestedIndex = null) {
  if (requestedIndex !== null && candidates[requestedIndex]) {
    return { chosen: candidates[requestedIndex], nextIndex: requestedIndex };
  }

  const recentUrls = new Set(history.slice(0, 15).map(h => (typeof h === 'string' ? h : h.url)));
  const lastItem = history[0] || {};
  const lastTitleLower = (lastItem.title || '').toLowerCase();

  // Ochrona przed powtarzaniem tego samego tematu kluczowego (np. książka i artykuł) w odstępie poniżej 6 postów
  const recentTopics = history.slice(0, 6).map(h => ((h.title || '') + ' ' + (h.url || '')).toLowerCase());
  const isTopicTooRecent = (cand) => {
    const cText = ((cand.title || '') + ' ' + (cand.url || '')).toLowerCase();
    const keywords = [
      'kod-zrodlowy', 'kod źródłowy',
      'pokonac-goliata', 'pokonać goliata',
      'prawda-bez-filtra', 'prawda bez filtra',
      'u-boku-diabla', 'u boku diabła',
      'bog-jest-miloscia', 'bóg jest miłością'
    ];
    return keywords.some(kw => cText.includes(kw) && recentTopics.some(rt => rt.includes(kw)));
  };

  // Jeśli zażądano konkretnego typu
  if (requestedType) {
    const typeCandidates = candidates.filter(c => (c.type || 'news') === requestedType);
    if (typeCandidates.length > 0) {
      let cand = typeCandidates.find(c => !recentUrls.has(c.url)) || typeCandidates[0];
      const idx = candidates.indexOf(cand);
      return { chosen: cand, nextIndex: idx };
    }
  }

  // Oblicz dystans od ostatniej publikacji każdego typu w historii
  const getDistanceSinceType = (t) => {
    const idx = history.findIndex(h => (h.type || 'news') === t);
    return idx === -1 ? 999 : idx;
  };

  const distVerse = getDistanceSinceType('verse');
  const distBook = getDistanceSinceType('book');
  const distMusic = getDistanceSinceType('music');
  const distProfile = getDistanceSinceType('profile');
  const distModule = getDistanceSinceType('module');
  const distVod = getDistanceSinceType('vod');
  const distCourse = getDistanceSinceType('course');
  const distNews = getDistanceSinceType('news');

  // Sprawdź priorytety filarów ekosystemu w kolejności najdłuższego braku publikacji
  // Dyrektywa Dowódcy: Werset dnia co ~1.5 - 2h (co 3-4 posty), książki, muzyka, profile regularnie
  const priorityTypes = [];
  if (distNews >= 5) priorityTypes.push({ type: 'news', dist: distNews });
  if (distCourse >= 6) priorityTypes.push({ type: 'course', dist: distCourse });
  if (distBook >= 6) priorityTypes.push({ type: 'book', dist: distBook });
  if (distVerse >= 4) priorityTypes.push({ type: 'verse', dist: distVerse });
  if (distVod >= 6) priorityTypes.push({ type: 'vod', dist: distVod });
  if (distMusic >= 6) priorityTypes.push({ type: 'music', dist: distMusic });
  if (distProfile >= 8) priorityTypes.push({ type: 'profile', dist: distProfile });
  if (distModule >= 8) priorityTypes.push({ type: 'module', dist: distModule });

  priorityTypes.sort((a, b) => b.dist - a.dist);

  for (const p of priorityTypes) {
    const matching = candidates.filter(c => (c.type || 'news') === p.type);
    const available = matching.filter(c => !recentUrls.has(c.url) && !isTopicTooRecent(c));
    if (available.length > 0) {
      // Priorytet dla pozycji, które jeszcze nigdy nie były publikowane, a następnie o największym dystansie
      available.sort((a, b) => {
        const idxA = history.findIndex(h => (typeof h === 'string' ? h : h.url) === a.url);
        const idxB = history.findIndex(h => (typeof h === 'string' ? h : h.url) === b.url);
        const distA = idxA === -1 ? 9999 : idxA;
        const distB = idxB === -1 ? 9999 : idxB;
        return distB - distA;
      });
      const chosen = available[0];
      const nextIndex = candidates.indexOf(chosen);
      return { chosen, nextIndex };
    }
  }

  // Domyślna rotacja sekwencyjna z ochroną przed powtórzeniem tego samego tematu pod rząd
  let nextIndex = (state.lastIndex + 1) % candidates.length;
  let attempts = 0;
  while (attempts < candidates.length) {
    const cand = candidates[nextIndex];
    const candTitleLower = (cand.title || '').toLowerCase();
    const isRecent = recentUrls.has(cand.url);

    // Ochrona przed dwoma postami o tym samym temacie pod rząd
    const isTopicDuplicate =
      (lastTitleLower.includes('halloween') && candTitleLower.includes('halloween')) ||
      (lastTitleLower.includes('blackout') && candTitleLower.includes('blackout')) ||
      (lastTitleLower.includes('bioetyka') && candTitleLower.includes('bioetyka')) ||
      (lastTitleLower.includes('dzień 33') && candTitleLower.includes('dzień 33')) ||
      (lastTitleLower.includes('dzien-33') && candTitleLower.includes('dzien-33')) ||
      (lastTitleLower.includes('dzień 34') && candTitleLower.includes('dzień 34')) ||
      (lastTitleLower.includes('dzien-34') && candTitleLower.includes('dzien-34')) ||
      (lastTitleLower.includes('płonący krzak') && candTitleLower.includes('płonący krzak')) ||
      ((lastTitleLower.includes('z biblią za pan brat') || lastTitleLower.includes('kurs codzienny') || lastTitleLower.includes('akademia biblijna')) &&
       (candTitleLower.includes('z biblią za pan brat') || candTitleLower.includes('kurs codzienny') || candTitleLower.includes('akademia biblijna')));

    // Ochrona przed dwoma postami tego samego typu pod rząd (np. 2x profile, 2x music)
    const isTypeDuplicate = lastItem.type && cand.type === lastItem.type;

    if (!isRecent && !isTopicDuplicate && !isTypeDuplicate) {
      break;
    }
    nextIndex = (nextIndex + 1) % candidates.length;
    attempts++;
  }

  return { chosen: candidates[nextIndex], nextIndex };
}

// Pojedynczy cykl publikacji
async function broadcastNext(dryRun = false, requestedType = null, requestedIndex = null) {
  const candidates = getAllEcosystemCandidates();
  if (candidates.length === 0) {
    throw new Error('Brak kandydatów do publikacji z ekosystemu.');
  }

  const history = loadHistory();
  const state = loadState();

  const { chosen, nextIndex } = chooseNextCandidate(candidates, history, state, requestedType, requestedIndex);

  const tweetText = formatBroadcasterTweet(chosen);
  const imagePath = resolveItemImage(chosen, ROOT);

  console.log(`\n📢 Wybrana pozycja z ekosystemu [${nextIndex + 1}/${candidates.length}]:`);
  console.log(`   Kategoria: ${chosen.category} (${chosen.type || 'standard'})`);
  console.log(`   Tytuł: "${chosen.title}"`);
  console.log(`   Link: ${chosen.url}`);
  console.log(`   Grafika: ${imagePath ? path.basename(imagePath) : 'BRAK'}`);

  await publishToX(tweetText, imagePath, dryRun);

  if (!dryRun) {
    const publishedAt = new Date().toISOString();
    history.unshift({
      slug: chosen.url.split('/').filter(Boolean).pop(),
      title: chosen.title,
      url: chosen.url,
      type: chosen.type || 'news',
      image: imagePath ? path.basename(imagePath) : null,
      publishedAt,
      method: 'ccn_auto_broadcaster'
    });
    saveHistory(history);

    state.lastIndex = nextIndex;
    state.lastPostedAt = publishedAt;
    state.totalBroadcasts = (state.totalBroadcasts || 0) + 1;
    saveState(state);

    appendLog({
      timestamp: publishedAt,
      title: chosen.title,
      url: chosen.url,
      type: chosen.type || 'news',
      image: imagePath ? path.basename(imagePath) : null,
      status: 'PUBLISHED'
    });
  }

  return chosen;
}

// Losowy interwał: 24 do 36 minut (średnio 30 minut z nieregularnym rozkładem)
function getRandomNextDelayMinutes() {
  const minMin = 24;
  const maxMin = 36;
  return minMin + Math.random() * (maxMin - minMin);
}

// Pętla 24/7 (Daemon)
async function runDaemonLoop() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 CCN NEWS BROADCASTER DAEMON 24/7 URUCHOMIONY');
  console.log('   Harmonogram: nieregularnie co ok. 30 minut (24–36 min)');
  console.log('   Kanał: platforma X (@csbwersetdnia)');
  console.log(`   Start: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  while (true) {
    try {
      console.log(`\n⏰ [${new Date().toLocaleTimeString('pl-PL')}] Rozpoczynam cykl publikacji...`);
      await broadcastNext(false);
    } catch (err) {
      console.error(`❌ [${new Date().toLocaleTimeString('pl-PL')}] Błąd publikacji:`, err.message);
      appendLog({
        timestamp: new Date().toISOString(),
        error: err.message,
        status: 'ERROR'
      });
    }

    const delayMinutes = getRandomNextDelayMinutes();
    const delayMs = Math.round(delayMinutes * 60 * 1000);
    const nextTime = new Date(Date.now() + delayMs);

    console.log(`⏳ Kolejna nieregularna publikacja za: ${delayMinutes.toFixed(1)} min (~${nextTime.toLocaleTimeString('pl-PL')})...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const once = args.includes('--once');
  const loop = args.includes('--loop');
  const status = args.includes('--status');

  const typeIdx = args.indexOf('--type');
  const requestedType = typeIdx !== -1 && args[typeIdx + 1] ? args[typeIdx + 1].toLowerCase() : null;

  const indexIdx = args.indexOf('--index');
  const requestedIndex = indexIdx !== -1 && args[indexIdx + 1] ? parseInt(args[indexIdx + 1], 10) : null;

  if (status) {
    const s = loadState();
    const h = loadHistory();
    console.log('📊 STATUS CCN AUTO BROADCASTER:');
    console.log('   Łącznie publikacji:', s.totalBroadcasts || 0);
    console.log('   Ostatnia publikacja:', s.lastPostedAt || 'Brak');
    console.log('   Wpisów w historii:', h.length);
    process.exit(0);
  }

  if (loop) {
    await runDaemonLoop();
  } else {
    // Domyślnie lub z flagą --once
    await broadcastNext(dryRun, requestedType, requestedIndex);
    if (!dryRun) {
      console.log('✅ Pojedynczy cykl publikacji zakończony pomyślnie.');
      process.exit(0);
    } else {
      process.exit(0);
    }
  }
}

const isMainModule = process.argv[1] && (fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase() || process.argv[1].endsWith('ccn_auto_broadcaster.mjs'));
if (isMainModule) {
  main().catch(err => {
    console.error('BŁĄD KRYTYCZNY:', err.message);
    process.exit(1);
  });
}

// Wspólna rotacja dla Facebooka (Wektor1_VideoFactory/publish_facebook_ccn_news.js) — L0 04.11.2026: taka sama rotacja jak na X.
export { getAllEcosystemCandidates, chooseNextCandidate, resolveItemImage };

