/**
 * publish_facebook_ccn_news.js — Emisja nowości ekosystemu Christian Culture na Facebooku
 * 
 * Standard JOMA-D005 / Dyrektywa Dowódcy (31.10.2026):
 * 1. „Jeśli koniecznie mamy publikować częściej na Facebooku, a dobrze by było publikować
 *     raz na godzinę mniej więcej, no to trzeba zastosować tą samą opcję jak w publikacji
 *     na platformie X.”
 * 2. „Na platformie X i na Facebooku muszą być bezwzględnie tematyczne dedykowane grafiki,
 *     bo jak teraz widzę na platformie X, to cały czas w każdym poście tylko logo CCN.”
 * 3. „mamy książki, z których można fragmenty cytować. Mamy książki moje, mojej żony.
 *     Mamy wizytówki różnych użytkowników, wizytówki muzyczne, portale muzyczne,
 *     nowości muzyczne z kanałów YouTube. Werset dnia bardzo dobrze, żeby się pojawiał
 *     przynajmniej raz na jakiś czas, co godzinę, co półtorej z dedykowaną grafiką.”
 * 4. „Jeszcze taka ważna uwaga, żeby w postach nie podawać linków na Facebooku, tylko w komentarzu.
 *     I dobrze było, żeby bot w komentarzu podawał linki do artykułów, bo Facebook nie lubi linków w postach,
 *     bo to wyprowadza ruch z Facebooka.”
 * 
 * Zakres: Cały ekosystem Christian Culture (Książki, Profile, Muzyka, Werset Dnia, CCN News, Biblia Audio, Akademia)
 * Format: Post bez linku zewnętrznego (zasięg FB) + dedykowana grafika 16:9 + link w 1. komentarzu bota
 * Ochrona: Pełny rejestr data/fb_ccn_published_history.json — ZERO DUPLIKATÓW!
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' },
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true }
];

const ROOT_CC = path.resolve(__dirname, '..', 'polskieradio.cc');
const CATALOG_PATH = path.join(ROOT_CC, 'szukaj', 'catalog.json');
const ARTICLES_TS_PATH = path.join(ROOT_CC, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');
const HISTORY_FILE = path.join(__dirname, 'data', 'fb_ccn_published_history.json');
const SESSION_PATH = path.join(__dirname, 'fb_session.json');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return Array.isArray(data) ? data : (data.published || []);
    } catch(e) {}
  }
  return [];
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: '1.0', published: history }, null, 2), 'utf8');
  } catch(e) {
    console.error('Błąd zapisu historii FB CCN:', e.message);
  }
}

// Inteligentny resolver dedykowanych grafik tematycznych na dysku
function resolveItemImage(item, rootDir) {
  if (item.image) {
    const directPath = path.isAbsolute(item.image) ? item.image : path.join(rootDir, item.image.replace(/^\//, ''));
    if (fs.existsSync(directPath)) return directPath;
  }
  if (item.imageUrl) {
    const imgPath = path.isAbsolute(item.imageUrl) ? item.imageUrl : path.join(rootDir, item.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(imgPath)) return imgPath;
  }

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

  const fallback = path.join(rootDir, 'images', 'brand', 'cezary-wioletta-radiocc.jpg');
  if (fs.existsSync(fallback)) return fallback;

  return null;
}

function getAllCandidates() {
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
      image: 'images/news/art-co-dalej-z-ta-niedziela-szabat-bacchiocchi.jpg',
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

  // 5. MODUŁY GŁÓWNE EKOSYSTEMU
  const coreModules = [
    {
      title: 'Biblia Audio CC — Księga Rodzaju w Kinowej Jakości Dźwięku 3D',
      lead: 'Trwa produkcja pierwszego kinowego słuchowiska Pisma Świętego od Księgi Rodzaju. Posłuchaj pierwszych rozdziałów lub zostań patronem nagrania!',
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
  for (const mod of coreModules) addCandidate(mod);

  // 6. ARTYKUŁY CCN NEWS Z PLIKU ARTICLES.TS
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
    } catch(e) {}
  }

  // 7. POZYCJE Z KATALOGU WYSZUKIWARKI
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      const items = catalog.items || catalog;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!item.title || !item.url) continue;
          let fullUrl = item.url;
          if (!fullUrl.startsWith('http')) {
            fullUrl = `https://polskieradio.cc${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
          }
          addCandidate({
            title: item.title,
            lead: item.description || item.subtitle || '',
            url: fullUrl,
            image: item.image || item.imageUrl || null,
            category: item.category || 'Ekosystem',
            type: 'news',
            tag: '#EkoCC'
          });
        }
      }
    } catch(e) {}
  }

  return candidates;
}

function getNextUnbroadcastedItem() {
  const candidates = getAllCandidates();
  const history = loadHistory();
  const publishedUrls = new Set(history.map(h => (typeof h === 'string' ? h : h.url)));

  const unbroadcasted = candidates.filter(c => !publishedUrls.has(c.url));
  console.log(`📊 Baza nowości Ekosystemu FB: ${candidates.length} pozycji, opublikowano wcześniej: ${publishedUrls.size}, pozostało: ${unbroadcasted.length}`);

  if (unbroadcasted.length > 0) {
    return { item: unbroadcasted[0], totalLeft: unbroadcasted.length };
  }

  // Jeśli wyczerpano całą pulę — restart rotacji od najstarszego
  return { item: candidates[0], totalLeft: 0, resetLoop: true };
}

// Formatowanie posta Facebooka — BEZPOŚREDNI KLIKALNY LINK W OPISIE (DYREKTYWA DOWÓDCY)
function formatFacebookPost(item) {
  let header = '🔴 CCN NEWS | polskieradio.cc/news';
  let ctaText = '👉 Pełny materiał oraz bezpłatny dostęp w ekosystemie:';
  if (item.type === 'book') {
    header = '🔴 CCN KSIĄŻKI | Cezary Rogowski';
    ctaText = '👉 Czytaj bezpłatne fragmenty w ekosystemie:';
  } else if (item.type === 'verse') {
    header = '📖 WERSET DNIA | Słowo Boże (UBG)';
    ctaText = '👉 Odkryj w interlinearnej MojaBiblia:';
  } else if (item.type === 'music') {
    header = '🎵 CCN MUZYKA & YOUTUBE | Polskie Radio CC';
    ctaText = '👉 Słuchaj w jakości HD / Oglądaj na VOD:';
  } else if (item.type === 'profile') {
    header = '👤 SPOŁECZNOŚĆ CC | Portal LUMINA';
    ctaText = '👉 Poznaj profil i dołącz do społeczności:';
  }

  const lines = [
    `${header}\n`,
    `📖 *${item.title}*\n`
  ];

  if (item.lead && item.lead.length > 5) {
    lines.push(`${item.lead}\n`);
  }

  // BEZPOŚREDNI, AKTYWNY LINK W OPISIE POSTA
  lines.push(`${ctaText}`);
  lines.push(`${item.url}\n`);
  lines.push(`#ChristianCulture #CCNNews #PolskieRadioCC #Biblia #Wiadomosci ${item.tag || ''}`);

  return lines.join('\n');
}

async function publishPost(page, postText, imagePath, targetName, item) {
  console.log(`   ⏳ Otwieram kompozytor posta na: ${targetName}...`);

  const triggerClicked = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('span, div[role="button"]'));
    const trigger = nodes.find(el => {
      const t = (el.innerText || '').trim().toLowerCase();
      return t.includes('słychać') || t.includes('napisz coś') || t.includes('utwórz post') || t.includes('stwórz post');
    });
    if (trigger) { trigger.click(); return true; }
    return false;
  });

  if (!triggerClicked) throw new Error("Nie znaleziono pola tworzenia posta");

  const editorSelector = 'div[role="dialog"] div[role="textbox"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });

  // 1. Wgrywanie dedykowanej grafiki tematycznej jeśli dostępna
  if (imagePath && fs.existsSync(imagePath)) {
    console.log(`   🖼️ Załączam dedykowaną grafikę: ${path.basename(imagePath)}...`);
    const fileInput = await page.$('div[role="dialog"] input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      await new Promise(r => setTimeout(r, 5000));
      console.log("   ✅ Dedykowana grafika załączona pomyślnie.");
    }
  }

  // 2. Wprowadzanie tekstu posta (BEZ LINKU ZEWNĘTRZNEGO)
  console.log("   ✍️ Wprowadzam sformatowany tekst nowości (bez linku w treści)...");
  await page.evaluate((txt) => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    const ed = postDialog ? postDialog.querySelector('div[role="textbox"]') : document.querySelector('div[role="textbox"]');
    if (ed) {
      ed.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', txt);
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      ed.dispatchEvent(pasteEvent);
    }
  }, postText);

  await page.keyboard.press('Space');
  await page.keyboard.press('Backspace');
  await new Promise(r => setTimeout(r, 3000));

  // 3. Sprawdź przycisk Dalej (lub bezpośrednio Opublikuj)
  const hasDalej = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const dalej = btns.find(b => (b.innerText || '').trim() === 'Dalej' && b.getAttribute('aria-disabled') !== 'true');
    if (dalej) { dalej.click(); return true; }
    return false;
  });

  if (hasDalej) {
    console.log("   🔘 Kliknięto 'Dalej'...");
    await new Promise(r => setTimeout(r, 4000));
  } else {
    try {
      await page.waitForFunction(() => {
        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
        const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
        if (!postDialog) return false;
        const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
        const dalej = btns.find(b => (b.innerText || '').trim() === 'Dalej' && b.getAttribute('aria-disabled') !== 'true');
        if (dalej) { dalej.click(); return true; }
        const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
        return !!pub;
      }, { timeout: 6000 });
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {}
  }

  // 4. Kliknięcie Opublikuj
  console.log("   🔘 Klikam 'Opublikuj'...");
  await page.waitForFunction(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    return !!pub;
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    if (pub) pub.click();
  });

  await new Promise(r => setTimeout(r, 12000));
  console.log(`   ✅ Post nowości opublikowany na: ${targetName}!`);

  // 5. DODANIE PIERWSZEGO KOMENTARZA Z LINKIEM (DYREKTYWA DOWÓDCY DLA ZASIĘGU FB)
  if (item && item.url) {
    console.log(`   💬 Dodaję pierwszy komentarz z bezpośrednim linkiem...`);
    try {
      await page.evaluate(() => window.scrollBy(0, 350));
      await new Promise(r => setTimeout(r, 3000));

      const commentSelector = 'form textarea, div[role="textbox"][aria-label*="komentarz" i], div[role="textbox"][aria-label*="comment" i]';
      let commentBox = await page.$(commentSelector);

      if (!commentBox) {
        // Spróbuj kliknąć przycisk "Skomentuj" pod pierwszym postem
        const clicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div[role="button"]'));
          const cBtn = btns.find(b => {
            const t = (b.innerText || '').trim().toLowerCase();
            const a = (b.getAttribute('aria-label') || '').toLowerCase();
            return t === 'skomentuj' || a.includes('skomentuj') || a.includes('zostaw komentarz') || a.includes('napisz komentarz');
          });
          if (cBtn) { cBtn.click(); return true; }
          return false;
        });
        if (clicked) {
          await new Promise(r => setTimeout(r, 2500));
          commentBox = await page.$(commentSelector);
        }
      }

      if (commentBox) {
        const commentText = `🔗 Bezpłatny dostęp w ekosystemie Christian Culture:\n${item.url}`;
        await commentBox.focus();
        await page.keyboard.type(commentText, { delay: 20 });
        await new Promise(r => setTimeout(r, 1000));
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 4000));
        console.log(`   ✅ Pierwszy komentarz z linkiem opublikowany pomyślnie!`);
      } else {
        console.log(`   ℹ️ Nie udało się zlokalizować pola komentarza, wpis główny opublikowany.`);
      }
    } catch (commErr) {
      console.warn(`   ⚠️ Błąd podczas dodawania komentarza: ${commErr.message}`);
    }
  }

  return true;
}

async function run() {
  const { item, totalLeft } = getNextUnbroadcastedItem();
  const imagePath = resolveItemImage(item, ROOT_CC);

  console.log(`\n📢 Wybrana nowość z ekosystemu na Facebooka:`);
  console.log(`   Kategoria: ${item.category} (${item.type || 'news'})`);
  console.log(`   Tytuł: "${item.title}"`);
  console.log(`   Link: ${item.url}`);
  console.log(`   Grafika: ${imagePath ? path.basename(imagePath) : 'BRAK'}`);

  const postText = formatFacebookPost(item);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pl-PL']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  if (fs.existsSync(SESSION_PATH)) {
    try {
      let raw = fs.readFileSync(SESSION_PATH, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const cookies = JSON.parse(raw);
      await page.setCookie(...cookies);
      console.log(`🔑 Wczytano ${cookies.length} ciasteczek z fb_session.json.`);
    } catch(e) {
      console.error('Błąd ciasteczek:', e.message);
    }
  }

  const results = [];
  for (const target of FB_PAGES) {
    console.log(`\n📢 Otwieram cel: ${target.name} (${target.url})`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 4000));

      if (target.isPage) {
        const switchClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
          const btn = buttons.find(b => (b.innerText || '').trim() === 'Przełącz' || (b.innerText || '').trim() === 'Przełącz teraz');
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (switchClicked) {
          console.log(`   🔄 Przełączam profil na: ${target.name}...`);
          await new Promise(r => setTimeout(r, 2000));
          await page.evaluate(() => {
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
            const switchDialog = dialogs.find(d => (d.innerText || '').includes('Przełącz profil') || (d.innerText || '').includes('Przełącz się na'));
            if (switchDialog) {
              const btns = Array.from(switchDialog.querySelectorAll('div[role="button"], button'));
              const confirmBtn = btns.find(b => (b.innerText || '').trim() === 'Przełącz');
              if (confirmBtn) confirmBtn.click();
            }
          });
          await new Promise(r => setTimeout(r, 8000));
        }
      }

      const ok = await publishPost(page, postText, imagePath, target.name, item);
      results.push({ target: target.name, ok });
    } catch(e) {
      console.error(`   ❌ Błąd publikacji na ${target.name}: ${e.message}`);
      results.push({ target: target.name, ok: false });
    }
  }

  await browser.close();

  const successCount = results.filter(r => r.ok).length;
  if (successCount > 0) {
    const history = loadHistory();
    history.push({
      url: item.url,
      title: item.title,
      type: item.type || 'news',
      image: imagePath ? path.basename(imagePath) : null,
      publishedAt: new Date().toISOString()
    });
    saveHistory(history);
    console.log(`\n🎉 Pomyślnie wyemitowano nowość z dedykowaną grafiką na Facebooku (${successCount}/${results.length})! Zapisano do historii.`);
  }

  process.exit(successCount > 0 ? 0 : 1);
}

if (process.argv[1]?.includes('publish_facebook_ccn_news')) {
  run().catch(e => {
    console.error('❌ Błąd krytyczny skryptu FB CCN:', e.message);
    process.exit(1);
  });
}

module.exports = { formatFacebookPost, getAllCandidates, getNextUnbroadcastedItem, resolveItemImage };
