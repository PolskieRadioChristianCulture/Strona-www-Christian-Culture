#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: MŁODY INWESTOR CHRZEŚCIJAŃSKI (WYDANIE 2.0)
 * Autor: Cezary Rogowski | 5 listopada 2026 r.
 * Portal główny: CCN Finanse (https://polskieradio.cc/finanse)
 * Kategoria: szafarstwo / inwestycje
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SCRATCH_DIR = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/scratch/mlody_inwestor_w2';
const rawTxtPath = path.join(SCRATCH_DIR, 'CCN_Mlody_Inwestor_Chrzescijanski_WYDANIE_2.txt');
const imageSrcPath = path.join(SCRATCH_DIR, 'Mlody_inwestor_grafika_16x9.png');

console.log('🚀 Rozpoczynam publikację artykułu: Młody Inwestor Chrześcijański (Wydanie 2.0)...');

const rawTxt = fs.readFileSync(rawTxtPath, 'utf8').replace(/\r\n/g, '\n');
const lines = rawTxt.split('\n');

const title = 'Młody inwestor chrześcijański: złoto, nawyki i dochód bez długu';
const subtitle = 'Biblijny poradnik niezależności finansowej — bez niewoli długu, z planem na kryzys i emeryturę';
const slug = 'mlody-inwestor-chrzescijanski-zloto-nieruchomosci-nawyki';
const author = 'Cezary Rogowski';
const date = '2026-11-05';
const dateFormatted = '5 listopada 2026';
const readTimeMinutes = 18;

const lead = 'Czy można bezpiecznie przejść przez utratę pracy, chorobę, inflację, zmianę prawa czy emeryturę, której wysokości dziś nie znamy? Nikt nie ma gwarancji. Można jednak świadomie zmniejszać ryzyko: żyć poniżej możliwości, unikać zbędnych zobowiązań, odkładać rezerwę, rozwijać kompetencje i budować zróżnicowany majątek bez popadania w niewolę długu.';

// Parse sections
const sections = [];
let currentHeading = null;
let currentParagraphs = [];

// Skip header metadata lines until section 1 or introduction
let inBody = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (line.startsWith('Wprowadzenie:')) {
    inBody = true;
    currentHeading = line;
    currentParagraphs = [];
    continue;
  }

  if (/^[0-9]+\.\s+/.test(line)) {
    if (currentHeading && currentParagraphs.length > 0) {
      sections.push({ heading: currentHeading, paragraphs: [...currentParagraphs] });
    }
    inBody = true;
    currentHeading = line;
    currentParagraphs = [];
    continue;
  }

  if (line.startsWith('Zakończenie:')) {
    if (currentHeading && currentParagraphs.length > 0) {
      sections.push({ heading: currentHeading, paragraphs: [...currentParagraphs] });
    }
    currentHeading = line;
    currentParagraphs = [];
    continue;
  }

  if (line.startsWith('Panie, naucz mnie')) {
    // Prayer line
    currentParagraphs.push(`*${line}*`);
    continue;
  }

  if (line.startsWith('Cezary Rogowski — CCN Finanse')) {
    // End of article body
    if (currentHeading && currentParagraphs.length > 0) {
      sections.push({ heading: currentHeading, paragraphs: [...currentParagraphs] });
    }
    break;
  }

  if (inBody) {
    // Skip disclaimer if matched
    if (line.startsWith('WAŻNE:') || line.startsWith('Ilustracja koncepcyjna')) continue;
    currentParagraphs.push(line);
  }
}

console.log(`✔ Przetworzono sekcji artykułu: ${sections.length}`);

// Convert sections to flat content array of paragraphs
const contentParagraphs = [];
// Add lead and disclaimers
contentParagraphs.push('**WAŻNE:** Tekst ma charakter edukacyjny; nie jest indywidualną poradą inwestycyjną, podatkową ani prawną. Żaden rodzaj aktywów nie gwarantuje zysku ani całkowitej niezależności. Liczby i warunki prawne — stan na 5 listopada 2026.');

for (const s of sections) {
  contentParagraphs.push(`### ${s.heading}`);
  for (const p of s.paragraphs) {
    contentParagraphs.push(p);
  }
}

// Add 90 days plan table section from PLAN_90_DNI_I_MODEL_2_NOGI.md
contentParagraphs.push('### Plan 90 dni — chrześcijański młody inwestor');
contentParagraphs.push('**Zasada:** najpierw płynna rezerwa i kontrola drogiego długu, później aktywa niepłynne (złoto, ziemia, nieruchomości).');
contentParagraphs.push('• **Dni 1–14:** Budżet, bilans osobisty, lista długów, przegląd realnych potrzeb rodziny → Efekt: Rzeczywista nadwyżka operacyjna.\n• **Dni 15–30:** Automatyczne odkładanie 10–15% dochodu netto zaraz po wypłacie → Efekt: Powtarzalny nawyk szafarstwa.\n• **Dni 31–45:** Analiza spreadu złota fizycznego, kosztów przechowywania i bezpieczeństwa → Efekt: Własna karta porównawcza kruszców.\n• **Dni 46–60:** Rozpisanie „nogi A” (główny dochód) i „nogi B” (alternatywna kompetencja/usługa) → Efekt: Plan odporności na kryzys.\n• **Dni 61–75:** Portfolio usług i pierwsze materiały marki osobistej opartej na zaufaniu → Efekt: Niezależny dowód kompetencji.\n• **Dni 76–90:** Dogłębna analiza jednej działki budowlanej i jednego mieszkania na wynajem (bez zakupu!) → Efekt: Praktyczny test ryzyka, podatków i kosztów ukrytych.');

contentParagraphs.push('### Karta Dwóch Nóg Dochodowych Salomona');
contentParagraphs.push('Biblijny model rozproszenia ryzyka (Koh 11,2) zakłada, że człowiek roztropny nie opiera całego bytu rodziny na jednej pensji czy jednym kontrahencie. Zbuduj drugą niezależną nogę kompetencji, która nie zależy od tego samego rynku, zachowując czas na modlitwę, małżeństwo, dzieci i sabatowy odpoczynek.');

const tags = [
  'Inwestycje',
  'Złoto',
  'Nieruchomości',
  'Budżet Domowy',
  'Szafarstwo',
  'Wolność Finansowa',
  'Model Dwóch Nóg',
  'Przysłowia Salomona',
  'Cezary Rogowski',
  'CCN Finanse'
];

const sources = [
  { name: 'Komisja Nadzoru Finansowego (KNF) — Inwestuj świadomie', url: 'https://www.knf.gov.pl/dla_konsumenta/kampanie_informacyjne/inwestuj_swiadomie?articleId=70530&p_id=18' },
  { name: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej — Limity IKE / IKZE 2026', url: 'https://www.gov.pl/web/rodzina/ike-limit-wplat' },
  { name: 'Ministerstwo Finansów — Ochrona deponentów i obligacje skarbowe', url: 'https://www.gov.pl/web/finanse/ochrona-deponentow-rynek-finansowy' },
  { name: 'Krajowy Ośrodek Wsparcia Rolnictwa (KOWR) — Nabywanie nieruchomości rolnych', url: 'https://www.gov.pl/web/kowr/zgody-na-nabycie-nieruchomosci-rolnych' },
  { name: 'Uwspółcześniona Biblia Gdańska (UBG)', url: 'https://polskieradio.cc/mojabiblia' }
];

const scripture = 'Prz 21,5; Prz 6,6–8; Prz 11,1; Prz 22,7; Koh 11,2; Rdz 41,33–36; Łk 12,15; Łk 14,28–30; Mt 6,24; 1 Tm 6,6–10; Ef 2,8–10; Ef 4,28 (UBG)';

const conclusion = 'Prawdziwa wolność finansowa ma kilka warstw: brak drogich długów konsumpcyjnych, płynna rezerwa na 3–6 miesięcy, umiejętność uczciwego zarabiania oparta na co najmniej dwóch niezależnych źródłach, rozsądna dywersyfikacja (złoto, obligacje, ziemia, własny dom) oraz majątek, którym można zarządzać bez paniki. Złoto i ziemia mogą pomóc, ale nie zastąpią wiedzy, płynności, dyscypliny ani Bożej łaski.';

const cta = 'Dziś sporządź osobisty bilans finansowy, wyznacz pierwszą miesięczną kwotę oszczędzania (10–15% netto) i zobowiąż się przed Bogiem, że nie kupisz żadnej inwestycji, której ryzyka nie rozumiesz. Nie chodzi o zdobycie świata, lecz o odpowiedzialne życie wobec Boga i ludzi.';

const seoMeta = {
  title: 'Młody inwestor chrześcijański: złoto, nawyki i dochód bez długu',
  description: 'Poznaj biblijne zasady Salomona, system 10–15% oszczędzania, budowanie marki, dwie nogi biznesu oraz inwestowanie w złoto, ziemię i najem.',
  keywords: tags
};

// 1. Wygeneruj pakiety DOCX, TXT, SEO i ZIP na Pulpicie
const pkgResult = await packageEkoccArticle({
  portal: 'finanse',
  type: 'PORADNIK',
  title,
  slug,
  author,
  date,
  lead,
  sections,
  conclusion,
  cta,
  tags,
  sources,
  scripture,
  imagePath: imageSrcPath,
  imageCaption: 'Młody człowiek planuje finanse przy Biblii, złocie i modelu domu, w tle wiejska posiadłość (ilustracja poglądowa koncepcyjna).',
  seo: seoMeta
}, 'C:/Users/czark/Desktop');

console.log('✔ Zapisano pakiet redakcyjny na Pulpicie:', pkgResult.zipPath);

// 2. Wstaw artykuł do portals/ccn-finanse/src/data/articles.ts
const finanseArticlesTsPath = path.join(ROOT, 'portals/ccn-finanse/src/data/articles.ts');
let finCode = fs.readFileSync(finanseArticlesTsPath, 'utf8');

const finArticleEntry = `  {
    "id": "art-${slug}",
    "title": ${JSON.stringify(title)},
    "slug": "${slug}",
    "excerpt": ${JSON.stringify(lead)},
    "content": ${JSON.stringify(contentParagraphs, null, 6)},
    "scriptureReference": {
      "verse": "Księga Przysłów 21:5",
      "text": "Myśli pracowitego przynoszą obfitość, a każdego, kto jest porywczy, spotyka tylko nędza.",
      "strongCode": "H4284"
    },
    "category": "szafarstwo",
    "categoryLabel": "BIBLIJNA NIEZALEŻNOŚĆ, ZŁOTO, NIERUCHOMOŚCI I MODEL DWÓCH NÓG",
    "publishedAt": "${date}T10:00:00Z",
    "dateFormatted": "${dateFormatted}",
    "imageUrl": "/images/news/${slug}.png",
    "imageCaption": "Ilustracja redakcyjna: Młody człowiek planuje finanse przy Biblii, złocie i modelu domu (ilustracja poglądowa wygenerowana na potrzeby publikacji edukacyjnej).",
    "readTimeMinutes": ${readTimeMinutes},
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": ${JSON.stringify(tags)},
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture & Redaktor Naczelny CCN",
      "status": "Żonaty",
      "avatarUrl": "/avatar_cezary_official.jpg",
      "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
    }
  },
`;

if (!finCode.includes(`"art-${slug}"`)) {
  const insertIdx = finCode.indexOf('export const INITIAL_ARTICLES: Article[] = [');
  if (insertIdx !== -1) {
    const insertPos = insertIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
    finCode = finCode.slice(0, insertPos) + finArticleEntry + finCode.slice(insertPos);
    fs.writeFileSync(finanseArticlesTsPath, finCode, 'utf8');
    console.log('✔ Artykuł dodany do portals/ccn-finanse/src/data/articles.ts');
  }
} else {
  console.log('ℹ Artykuł już istnieje w ccn-finanse/articles.ts');
}

// 3. Wstaw artykuł także do portals/ccn-news/src/data/articles.ts
const newsArticlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let newsCode = fs.readFileSync(newsArticlesTsPath, 'utf8');

const newsArticleEntry = `  {
    id: 'art-${slug}',
    title: ${JSON.stringify(title)},
    slug: '${slug}',
    excerpt: ${JSON.stringify(lead)},
    content: ${JSON.stringify(contentParagraphs, null, 6)},
    scriptureReference: {
      verse: 'Księga Przysłów 21:5',
      text: 'Myśli pracowitego przynoszą obfitość, a każdego, kto jest porywczy, spotyka tylko nędza.',
      strongCode: 'H4284'
    },
    category: 'szafarstwo',
    categoryLabel: 'CCN FINANSE • BIZNES, ZŁOTO I ROZTROPNOŚĆ',
    publishedAt: '${date}T10:00:00Z',
    dateFormatted: '${dateFormatted}',
    imageUrl: '/images/news/${slug}.png',
    imageCaption: 'Ilustracja redakcyjna: Młody człowiek planuje finanse przy Biblii, złocie i modelu domu.',
    readTimeMinutes: ${readTimeMinutes},
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(tags)},
    author: {
      id: 'cezary-rogowski',
      name: 'Cezary Rogowski',
      role: 'Założyciel Christian Culture & Redaktor Naczelny CCN',
      status: 'Żonaty',
      avatarUrl: '/avatar_cezary_official.jpg',
      bio: 'Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC.'
    }
  },
`;

if (!newsCode.includes(`'art-${slug}'`)) {
  const insertIdx = newsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [');
  if (insertIdx !== -1) {
    const insertPos = insertIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
    newsCode = newsCode.slice(0, insertPos) + newsArticleEntry + newsCode.slice(insertPos);
    fs.writeFileSync(newsArticlesTsPath, newsCode, 'utf8');
    console.log('✔ Artykuł dodany do portals/ccn-news/src/data/articles.ts');
  }
} else {
  console.log('ℹ Artykuł już istnieje w ccn-news/articles.ts');
}

console.log('\n✅ Rejestracja w bazach portali zakończona.');
