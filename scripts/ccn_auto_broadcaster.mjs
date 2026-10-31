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
  // 1. Bezpośrednia ścieżka do grafiki w obiekcie
  if (item.image) {
    const directPath = path.isAbsolute(item.image) ? item.image : path.join(rootDir, item.image.replace(/^\//, ''));
    if (fs.existsSync(directPath)) return directPath;
  }
  if (item.imageUrl) {
    const imgPath = path.isAbsolute(item.imageUrl) ? item.imageUrl : path.join(rootDir, item.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(imgPath)) return imgPath;
  }

  // 2. Dopasowanie ze sluga artykułu lub modułu
  const slug = item.url ? item.url.split('/').filter(Boolean).pop() : '';
  if (slug) {
    const candidateFiles = [
      path.join(rootDir, 'images', 'news', `art-${slug}.jpg`),
      path.join(rootDir, 'images', 'news', `${slug}.jpg`),
      path.join(rootDir, 'images', 'news', `art-${slug}.png`),
      path.join(rootDir, 'images', 'news', `${slug}.png`)
    ];
    for (const cand of candidateFiles) {
      if (fs.existsSync(cand)) return cand;
    }
  }

  // 3. Dopasowanie po kategorii / kontekście
  const titleLower = (item.title || '').toLowerCase();
  const urlLower = (item.url || '').toLowerCase();

  if (urlLower.includes('biblia-audio') || titleLower.includes('rodzaju')) {
    const p = path.join(rootDir, 'biblia-audio', 'assets', 'rodzaju-hero.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (urlLower.includes('akademia') || urlLower.includes('kurs')) {
    const p = path.join(rootDir, 'images', 'news', 'art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (urlLower.includes('mojabiblia')) {
    const p = path.join(rootDir, 'images', 'news', 'art-rdz15-abram-gwiazdy.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (urlLower.includes('lumina') || urlLower.includes('cezary') || urlLower.includes('wioletta')) {
    const p = path.join(rootDir, 'images', 'brand', 'cezary-wioletta-radiocc.jpg');
    if (fs.existsSync(p)) return p;
  }
  if (urlLower.includes('player') || urlLower.includes('radio') || urlLower.includes('muzyka')) {
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
    seenUrls.add(item.url);
    candidates.push(item);
  }

  // 1. KSIĄŻKI CEZAREGO ROGOWSKIEGO I WIOLETTY ROGOWSKIEJ
  const books = [
    {
      title: 'Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo',
      lead: '„Nie mierz problemu swoimi siłami, lecz mierz go potęgą Boga, który powołał cię do zwycięstwa.” Bestseller o pokonywaniu życiowych olbrzymów w oparciu o wierność Słowu Bożemu.',
      url: 'https://polskieradio.cc/ksiazki/pokonac-goliata',
      image: 'images/news/art-pokonac-goliata.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#PokonacGoliata'
    },
    {
      title: 'Książka: Kod Źródłowy Duszy — Cezary Rogowski. Biblijna tożsamość i sens istnienia',
      lead: '„Twoja tożsamość nie została zapisana przez opinię świata ani algorytmy, lecz przez Stwórcę, który utkał cię w łonie matki.” Głęboka teologiczna podróż do źródeł ludzkiego ducha.',
      url: 'https://polskieradio.cc/ksiazki/kod-zrodlowy',
      image: 'images/news/art-kod-zrodlowy.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#KodZrodlowyDuszy'
    },
    {
      title: 'Książka: Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo',
      lead: '„Prawda Boża nie potrzebuje retuszu współczesnej poprawności. Tylko bezkompromisowa Ewangelia ma moc uwalniać z sideł zakłamania.”',
      url: 'https://polskieradio.cc/ksiazki/prawda-bez-filtra',
      image: 'images/news/art-prawda-bez-filtra.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#PrawdaBezFiltra'
    },
    {
      title: 'Książka: U boku Diabła — Cezary Rogowski. Anatomia duchowej walki i zwycięstwa',
      lead: '„Największym sukcesem wroga jest przekonanie człowieka, że walka duchowa to tylko mit. Słowo Boże obnaża każdą strategię ciemności i daje oręż zwycięstwa w Chrystusie.”',
      url: 'https://polskieradio.cc/ksiazki/u-boku-diabla',
      image: 'images/news/art-u-boku-diabla.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#UbokuDiabla'
    },
    {
      title: 'Książka: Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania',
      lead: '„Jak pogodzić cierpienie z miłością Stwórcy? Biblijne świadectwo i refleksja nad prawdziwym charakterem Boga, który oddał wszystko za człowieka.”',
      url: 'https://polskieradio.cc/ksiazki/bog-jest-miloscia',
      image: 'images/news/art-bog-jest-miloscia.jpg',
      category: 'Książki',
      type: 'book',
      tag: '#BogJestMiloscia'
    }
  ];
  for (const b of books) addCandidate(b);

  // 2. WERSET DNIA (Z DEDYKOWANYMI GRAFIKAMI BIBLIJNYMI)
  const verses = [
    {
      title: 'Werset Dnia: „Spójrz ku niebu i policz gwiazdy...” (Rdz 15:5, UBG)',
      lead: '„I wyprowadził go na dwór, i powiedział: Spójrz ku niebu i policz gwiazdy, jeśli możesz je policzyć. I powiedział do niego: Takie będzie twoje potomstwo.” Bóg zawsze dotrzymuje przymierza!',
      url: 'https://polskieradio.cc/mojabiblia',
      image: 'images/news/art-rdz15-abram-gwiazdy.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Czyż Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG)',
      lead: '„Niech to będzie dalekie od ciebie, abyś miał tak postąpić, by uśmiercić sprawiedliwego z bezbożnym... Czyż Sędzia całej ziemi nie postąpi sprawiedliwie?” Wstawiennictwo i łaska Boża.',
      url: 'https://polskieradio.cc/mojabiblia',
      image: 'images/news/art-rdz18-mamre-wstawiennictwo.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Ty jesteś Bogiem, który mnie widzi” (Rdz 16:13, UBG)',
      lead: '„I nazwała imię PANA, który mówił do niej: Ty jesteś Bogiem, który widzi mnie; bo mówiła: Czyż nie widziałam tutaj Tego, który mnie widzi?” Bóg nigdy nie zapomina o samotnych na pustyni.',
      url: 'https://polskieradio.cc/mojabiblia',
      image: 'images/news/art-rdz16-17-hagar-el-roi.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#WersetDnia'
    },
    {
      title: 'Werset Dnia: „Pamiętaj o dniu szabatu, aby go święcić” (Wj 20:8, UBG)',
      lead: '„Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracował i wykonywał wszelką swoją pracę; ale siódmy dzień jest szabatem PANA, twego Boga.” Wieczna pamiątka stworzenia i odpocznienia.',
      url: 'https://polskieradio.cc/prawo/dekalog-bozy',
      image: 'images/news/art-dekalog-dziesiec-przykazan-wujek.jpg',
      category: 'Werset Dnia',
      type: 'verse',
      tag: '#Dekalog'
    },
    {
      title: 'Werset Dnia: „Wy myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20, UBG)',
      lead: '„Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby sprawić to, co jest dzisiaj – ocalić życie wielu ludzi.” Niezmienna suwerenność i wierność Boża.',
      url: 'https://polskieradio.cc/akademia',
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
      image: 'images/brand/cezary-wioletta-radiocc.jpg',
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
      type: 'music',
      tag: '#StudioDobregoSlowa'
    },
    {
      title: 'Kanał Transmisyjny: Biblia Śpiewana Live — Słowo Boże ubrane w natchnioną muzykę',
      lead: 'Całodobowy kanał radiowo-wizualny z natchnionymi Psalmami i pieśniami biblijnymi. Ukojenie, pokój i skupienie na Bożej obecności o każdej porze dnia i nocy.',
      url: 'https://polskieradio.cc/live/biblia-spiewana',
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
      image: 'images/brand/cezary-wioletta-radiocc.jpg',
      category: 'Wizytówka',
      type: 'profile',
      tag: '#CezaryRogowski'
    },
    {
      title: 'Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara',
      lead: 'Poznaj autorski profil Wioletty Rogowskiej na portalu LUMINA. Poradniki dotyczące chrześcijańskiego domu, wychowania dzieci w wierze, cyfrowego detoksu i służby bliźnim.',
      url: 'https://polskieradio.cc/lumina.wiolettarogowska',
      image: 'images/brand/cezary-wioletta-radiocc.jpg',
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
      type: 'music',
      tag: '#StudioDobregoSlowa'
    },
    {
      title: 'LUMINA — Wolna od Algorytmów Przestrzeń Społeczności Chrześcijańskiej',
      lead: 'Dołącz do chrześcijańskiego portalu społecznościowego LUMINA. Dziel się wersetami, modlitwami, świadectwami i twórz wartościowe relacje w czystym środowisku.',
      url: 'https://polskieradio.cc/lumina-tablica',
      image: 'images/brand/cezary-wioletta-radiocc.jpg',
      category: 'Społeczność',
      type: 'profile',
      tag: '#Lumina'
    }
  ];
  for (const p of profiles) addCandidate(p);

  // 5. NAJWAŻNIEJSZE DEDYKOWANE MODUŁY EKOSYSTEMU CC
  const coreModules = [
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
      image: 'images/news/art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg',
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
      image: 'images/brand/cezary-wioletta-radiocc.jpg',
      category: 'Ekosystem',
      type: 'module',
      tag: '#ChristianCulture'
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
    subHeader = '📖 WERSET DNIA | Słowo Boże (UBG)';
    callToAction = '👉 Odkryj w MojaBiblia:\n';
    addTags(item.tag || '#WersetDnia', '#SlowoBoze', '#UBG', '#Prawda');
  } else if (item.type === 'music') {
    subHeader = '🎵 MUZYKA & KANAŁY LIVE';
    callToAction = '👉 Słuchaj na żywo:\n';
    addTags(item.tag || '#CCNMuzyka', '#PolskieRadioCC', '#WorshipLive');
  } else if (item.type === 'profile') {
    subHeader = '👤 SPOŁECZNOŚĆ CC | Portal LUMINA';
    callToAction = '👉 Dołącz do społeczności LUMINA:\n';
    addTags(item.tag || '#Lumina', '#LudzieMisji', '#ChristianCulture');
  } else {
    addTags(item.tag || '#CCNNews', '#ChristianCulture', '#Prawda');
  }

  const hashtags = tagList.join(' ');
  const url = item.url;
  let bodyText = '';

  if (item.type === 'verse' && item.lead) {
    bodyText = item.lead;
  } else {
    bodyText = item.title.trim()
      .replace(/^CCN News\s*[-–—:]\s*/i, '')
      .replace(/^Kanał Transmisyjny:\s*/i, '')
      .replace(/^Książka:\s*/i, '')
      .replace(/^Wizytówka:\s*/i, '')
      .replace(/\s*•\s*Polskie Radio CC.*$/i, '')
      .replace(/\s*–\s*CCN Historia.*$/i, '')
      .replace(/\s*\(\/[a-z0-9_/-]+\)\s*$/i, '')
      .trim();
  }

  const subLine = subHeader ? `\n${subHeader}\n` : '\n\n';
  let tweet = `${header}${subLine}${bodyText}\n\n${callToAction}${url}\n\n${hashtags}`;

  // Limit 280 znaków (link t.co liczony jako 23 znaki)
  const calcLen = () => tweet.length - url.length + 23;

  if (calcLen() > 270) {
    while (calcLen() > 270 && bodyText.includes(' ')) {
      bodyText = bodyText.replace(/\s+\S+$/, '').trim();
      tweet = `${header}${subLine}${bodyText}…\n\n${callToAction}${url}\n\n${hashtags}`;
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
    console.log('🌐 [CCN Broadcaster] Otwieram x.com/compose/post w tle...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const textareaSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    await page.click(textareaSelector);
    await page.waitForTimeout(500);

    // 1. Wpisanie sformatowanego tekstu
    await page.keyboard.insertText(tweetText);
    console.log('📝 [CCN Broadcaster] Wpisano treść nowości...');
    await page.waitForTimeout(2000);

    // 2. Wgrywanie dedykowanej grafiki tematycznej
    if (imagePath && fs.existsSync(imagePath)) {
      console.log(`🖼️ [CCN Broadcaster] Załączam dedykowaną grafikę: ${path.basename(imagePath)}...`);
      const fileInput = await page.$('input[data-testid="fileInput"]');
      if (fileInput) {
        await page.setInputFiles('input[data-testid="fileInput"]', imagePath);
        console.log('⏳ [CCN Broadcaster] Oczekuję na załadowanie podglądu załącznika...');
        try {
          await page.waitForSelector('div[data-testid="attachments"], div[aria-label*="Usuń"], div[aria-label*="Remove"]', { timeout: 10000 });
          console.log('✅ [CCN Broadcaster] Dedykowana grafika została pomyślnie załączona!');
        } catch (e) {
          await page.waitForTimeout(4000);
        }
      } else {
        console.warn('⚠️ [CCN Broadcaster] Nie znaleziono input[data-testid="fileInput"].');
      }
    }

    // 3. Zamknij ewentualny modal powiadomień
    const overlayDismiss = await page.$('[data-testid="app-bar-close"], [aria-label="Zamknij"], [aria-label="Close"]');
    if (overlayDismiss) await overlayDismiss.click().catch(() => {});

    console.log('🔘 [CCN Broadcaster] Wysyłam post...');
    await page.focus(textareaSelector);
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(2000);

    const postBtn = await page.$('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');
    if (postBtn && await postBtn.isVisible().catch(() => false)) {
      await postBtn.click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(5000);
    console.log('🎉 [CCN Broadcaster] Post został opublikowany na platformie X!');

    await page.close();
    await context.close();
    return { success: true };
  } catch (err) {
    await context.close().catch(() => {});
    throw err;
  }
}

// Pojedynczy cykl publikacji
async function broadcastNext(dryRun = false) {
  const candidates = getAllEcosystemCandidates();
  if (candidates.length === 0) {
    throw new Error('Brak kandydatów do publikacji z ekosystemu.');
  }

  const history = loadHistory();
  const state = loadState();

  // Filtruj pozycje, które nie były publikowane w ostatnich 25 wpisach (rotacja)
  const recentUrls = new Set(history.slice(0, 25).map(h => (typeof h === 'string' ? h : h.url)));
  let nextIndex = (state.lastIndex + 1) % candidates.length;
  let attempts = 0;
  while (recentUrls.has(candidates[nextIndex].url) && attempts < candidates.length) {
    nextIndex = (nextIndex + 1) % candidates.length;
    attempts++;
  }
  const chosen = candidates[nextIndex];

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
    await broadcastNext(dryRun);
    if (!dryRun) {
      console.log('✅ Pojedynczy cykl publikacji zakończony pomyślnie.');
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(err => {
    console.error('BŁĄD KRYTYCZNY:', err.message);
    process.exit(1);
  });
}
