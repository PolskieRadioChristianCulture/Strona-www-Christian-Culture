import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const SRC_DIR = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/scratch/unpacked_ziemskie_pytania';

const ARTICLES_CONFIG = [
  {
    folder: '01_Niedziela_handlowa',
    id: 'art-czy-katolik-powinien-uznawac-niedziele-handlowa',
    slug: 'czy-katolik-powinien-uznawac-niedziele-handlowa',
    category: 'wiara',
    categoryLabel: 'CCN Biblia & Społeczeństwo',
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'CCN Biblia',
    publishedAt: '2026-11-22T06:00:00+01:00',
    dateFormatted: '22 listopada 2026',
    scriptureReference: {
      verse: 'Wj 20:8–11; Mk 2:27–28',
      text: 'Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Tak więc Syn Człowieczy jest Panem także szabatu.'
    },
    sourceCitation: {
      sourceName: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej / Katechizm Kościoła Katolickiego',
      sourceUrl: 'https://www.gov.pl/web/rodzina/zakaz-handlu-w-niedziele'
    },
    imageCaption: 'Ilustracja koncepcyjna AI: Niedziela handlowa, relacje rodzinne a biblijny dzień odpoczynku i czwarte przykazanie Dekalogu (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia autentycznych wydarzeń).',
    imageFileName: 'art-czy-katolik-powinien-uznawac-niedziele-handlowa.jpg',
    fbImageFileName: 'fb-czy-katolik-powinien-uznawac-niedziele-handlowa.jpg',
    tags: ['Niedziela Handlowa', 'Dekalog', 'Szabat', 'Czwarty Nakaz', 'Prawo Pracy', 'Odpoczynek', 'Cezary Rogowski', 'CCN News']
  },
  {
    folder: '02_Trybunal_najwyzszy',
    id: 'art-trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad',
    slug: 'trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad',
    category: 'prawo',
    categoryLabel: 'CCN Prawo & Wiara',
    primaryPortalUrl: 'https://polskieradio.cc/prawo',
    primaryPortalLabel: 'CCN Prawo',
    publishedAt: '2026-11-22T06:15:00+01:00',
    dateFormatted: '22 listopada 2026',
    scriptureReference: {
      verse: 'Dn 7:9–10; Hbr 4:14–16',
      text: 'Przystąpmy więc z ufnością do tronu łaski, abyśmy dostąpili miłosierdzia i znaleźli łaskę ku pomocy w stosownym czasie.'
    },
    sourceCitation: {
      sourceName: 'Konstytucja Rzeczypospolitej Polskiej (Rozdział VIII: Sądy i Trybunały)',
      sourceUrl: 'https://www.prezydent.pl/prawo/konstytucja-rp/rozdzial-viii-sady-i-trybunaly'
    },
    imageCaption: 'Ilustracja koncepcyjna AI: Ziemskie sądownictwo i sale orzekania a wieczny niebiański tron Bożej sprawiedliwości i łaski (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia autentycznych wydarzeń).',
    imageFileName: 'art-trybunal-konstytucyjny-czy-najwyzszy.jpg',
    fbImageFileName: 'fb-trybunal-konstytucyjny-czy-najwyzszy.jpg',
    tags: ['Sąd Najwyższy', 'Trybunał Konstytucyjny', 'Sąd Boży', 'Sprawiedliwość', 'Orędownik', 'Chrystus', 'Cezary Rogowski', 'CCN Prawo']
  },
  {
    folder: '03_Fundusz_sprawiedliwosci',
    id: 'art-fundusz-sprawiedliwosci-ktorego-nie-znasz',
    slug: 'fundusz-sprawiedliwosci-ktorego-nie-znasz',
    category: 'finanse',
    categoryLabel: 'CCN Finanse & Wiara',
    primaryPortalUrl: 'https://polskieradio.cc/finanse',
    primaryPortalLabel: 'CCN Finanse',
    publishedAt: '2026-11-22T06:30:00+01:00',
    dateFormatted: '22 listopada 2026',
    scriptureReference: {
      verse: 'Rz 3:23–24; Ef 2:8–9',
      text: 'Wszyscy bowiem zgrzeszyli i są pozbawieni chwały Bożej; a zostają usprawiedliwieni darmo, z Jego łaski, przez odkupienie, które jest w Chrystusie Jezusie.'
    },
    sourceCitation: {
      sourceName: 'Ministerstwo Sprawiedliwości — Fundusz Pomocy Pokrzywdzonym',
      sourceUrl: 'https://www.gov.pl/web/sprawiedliwosc/fs-obszary-pomocy'
    },
    imageCaption: 'Ilustracja koncepcyjna AI: Pomoc pokrzywdzonym i zadośćuczynienie a Boża sprawiedliwość i dar odkupienia w Chrystusie (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia autentycznych wydarzeń).',
    imageFileName: 'art-fundusz-sprawiedliwosci-ktorego-nie-znasz.jpg',
    fbImageFileName: 'fb-fundusz-sprawiedliwosci-ktorego-nie-znasz.jpg',
    tags: ['Fundusz Sprawiedliwości', 'Odkupienie', 'Łaska', 'Usprawiedliwienie', 'Zadośćuczynienie', 'Pomoc Pokrzywdzonym', 'Cezary Rogowski']
  },
  {
    folder: '04_Okno_zycia',
    id: 'art-okno-zycia-wola-takze-do-ciebie',
    slug: 'okno-zycia-wola-takze-do-ciebie',
    category: 'kraj',
    categoryLabel: 'eM Rodzina & Wiara',
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'eM Rodzina',
    publishedAt: '2026-11-22T06:45:00+01:00',
    dateFormatted: '22 listopada 2026',
    scriptureReference: {
      verse: 'J 3:3; 1 J 1:9',
      text: 'Jeśli ktoś się nie narodzi na nowo, nie może ujrzeć królestwa Bożego... Jeśli wyznajemy nasze grzechy, On jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości.'
    },
    sourceCitation: {
      sourceName: 'Prokuratura Krajowa / Caritas Polska',
      sourceUrl: 'https://www.gov.pl/web/prokuratura-krajowa/zalecenia-prokuratora-generalnego-w-sprawie-zasad-postepowania-w-przypadkach-pozostawienia-dziecka-w-tzw-oknie-zycia'
    },
    imageCaption: 'Ilustracja koncepcyjna AI: Okno życia jako symbol ratowania bezbronnego życia i zaproszenie do duchowego nowego narodzenia (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia autentycznych wydarzeń).',
    imageFileName: 'art-okno-zycia-wola-takze-do-ciebie.jpg',
    fbImageFileName: 'fb-okno-zycia-wola-takze-do-ciebie.jpg',
    tags: ['Okno Życia', 'Nowe Narodzenie', 'Obrona Życia', 'Modlitwa Zawierzenia', 'Łaska', 'Rodzina', 'Cezary Rogowski']
  }
];

// 1. Copy images
for (const a of ARTICLES_CONFIG) {
  const folderPath = path.join(SRC_DIR, a.folder);
  const src16x9 = path.join(folderPath, 'Grafika_16x9.jpg');
  const src1x1 = path.join(folderPath, 'Grafika_social_1x1.jpg');

  const dst1 = path.join(ROOT, 'images/news', a.imageFileName);
  const dst2 = path.join(ROOT, 'portals/ccn-news/public/images/news', a.imageFileName);
  const dstFb = path.join(ROOT, 'images/social/ccn-fb', a.fbImageFileName);

  fs.copyFileSync(src16x9, dst1);
  fs.copyFileSync(src16x9, dst2);
  fs.copyFileSync(src1x1, dstFb);

  console.log(`[IMG] Copied for ${a.id}: ${a.imageFileName} & ${a.fbImageFileName}`);
}

// 2. Parse text into article objects
const parsedArticles = [];

for (const a of ARTICLES_CONFIG) {
  const folderPath = path.join(SRC_DIR, a.folder);
  const txtFiles = fs.readdirSync(folderPath).filter(x => x.endsWith('.txt') && !x.includes('SEO') && !x.includes('Post'));
  const raw = fs.readFileSync(path.join(folderPath, txtFiles[0]), 'utf8');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const title = lines[0];
  const excerpt = lines[1];
  
  // Body paragraphs (skip lines 0, 1, 2 and trailing author/sources)
  const bodyLines = [];
  let i = 3;
  let sectionIdx = 1;

  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('Cezary Rogowski — Christian Culture Network.') || l.startsWith('ŹRÓDŁA') || l.startsWith('http')) {
      break;
    }
    // Check if line looks like a section header (short line without end punctuation or question mark heading)
    if (l.length < 65 && !l.endsWith('.') && !l.endsWith('”') && !l.endsWith(';') || l.includes('?') && l.length < 60) {
      bodyLines.push(`${sectionIdx}. ${l}`);
      sectionIdx++;
    } else {
      bodyLines.push(l);
    }
    i++;
  }

  // Calculate read time (avg 200 words/min)
  const wordCount = bodyLines.join(' ').split(/\s+/).length;
  const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 200));

  parsedArticles.push({
    id: a.id,
    title,
    slug: a.slug,
    excerpt,
    content: bodyLines,
    category: a.category,
    categoryLabel: a.categoryLabel,
    author: 'AUTHORS.cezary', // will replace quotes in code generation
    publishedAt: a.publishedAt,
    dateFormatted: a.dateFormatted,
    imageUrl: `/images/news/${a.imageFileName}`,
    imageCaption: a.imageCaption,
    readTimeMinutes,
    isPopular: true,
    popularRank: 4,
    tags: a.tags,
    scriptureReference: a.scriptureReference,
    sourceCitation: a.sourceCitation,
    primaryPortalUrl: a.primaryPortalUrl,
    primaryPortalLabel: a.primaryPortalLabel
  });
}

console.log(`Parsed ${parsedArticles.length} articles successfully.`);
fs.writeFileSync(
  path.join(ROOT, 'scripts/content/ziemskie_pytania_parsed.json'),
  JSON.stringify(parsedArticles, null, 2),
  'utf8'
);
