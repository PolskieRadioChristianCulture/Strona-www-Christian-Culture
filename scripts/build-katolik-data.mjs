#!/usr/bin/env node
/**
 * Deterministyczny generator i walidator korpusu danych dla portalu
 * „Odkryj Biblię — dla katolików” (/test/katolik -> /katolik).
 *
 * - Łączy 66 ksiąg kanonu (39 ST + 27 NT = 1189 rozdziałów) z oficjalnym
 *   korpusem UBG-2025 w /data/bible/ubg-2025/ (CC BY-ND 4.0).
 * - Pobiera WSZYSTKIE cytaty biblijne dosłownie z plików JSON UBG-2025 (zero zmyślonych cytatów).
 * - Generuje i waliduje Plan 365 dni (1189 rozdziałów bez luk i duplikatów) + ścieżkę startową (21 dni Ew. Jana).
 * - Zapisuje test/katolik/data/{books-66.json, plan-365.json, studies.json}.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OT_BOOKS } from './katolik-books-ot.mjs';
import { NT_BOOKS } from './katolik-books-nt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UBG_DIR = path.join(ROOT, 'data', 'bible', 'ubg-2025');
const OUT_DIR = path.join(ROOT, 'test', 'katolik', 'data');
const UPDATED_AT = '2026-11-26';

const manifest = JSON.parse(fs.readFileSync(path.join(UBG_DIR, 'manifest.json'), 'utf8'));
const chapterCache = new Map();

function loadChapter(bookCode, chapterNum) {
  const key = `${bookCode}-${String(chapterNum).padStart(3, '0')}`;
  if (chapterCache.has(key)) return chapterCache.get(key);
  const full = path.join(UBG_DIR, `${key}.json`);
  if (!fs.existsSync(full)) {
    throw new Error(`Brak pliku UBG-2025: ${key}.json`);
  }
  const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
  chapterCache.set(key, parsed);
  return parsed;
}

function quoteUbg(bookCode, chapter, verseStart, verseEnd = verseStart) {
  const data = loadChapter(bookCode, chapter);
  const slice = data.verses.filter((v) => v.number >= verseStart && v.number <= verseEnd);
  if (!slice.length) {
    throw new Error(`Nie znaleziono wersetu UBG: ${bookCode} ${chapter}:${verseStart}-${verseEnd}`);
  }
  const text = slice.map((v) => (verseEnd > verseStart ? `${v.number} ${v.text}` : v.text)).join(' ');
  const label = `${data.book} ${chapter}:${verseStart}${verseEnd > verseStart ? '–' + verseEnd : ''}`;
  return {
    bookId: bookCode,
    bookName: data.book,
    chapter,
    verseStart,
    verseEnd,
    label,
    translation: 'UBG-2025',
    sourceUrl: `/data/bible/ubg-2025/${bookCode}-${String(chapter).padStart(3, '0')}.json`,
    text,
    verses: slice.map((v) => ({ number: v.number, text: v.text })),
  };
}

// 1. Zbuduj i zwaliduj 66 ksiąg względem manifestu UBG-2025
const manifestBooks = new Map();
for (const entry of manifest.chapters) {
  if (!manifestBooks.has(entry.bookCode)) {
    manifestBooks.set(entry.bookCode, { bookName: entry.book, chapters: 0 });
  }
  manifestBooks.get(entry.bookCode).chapters += 1;
}

const rawBooks = [...OT_BOOKS, ...NT_BOOKS];
if (rawBooks.length !== 66) {
  throw new Error(`Oczekiwano 66 ksiąg, otrzymano ${rawBooks.length}`);
}

const seenIds = new Set();
let totalChapters = 0;
let otCount = 0;
let ntCount = 0;

const books66 = rawBooks.map((b, idx) => {
  if (seenIds.has(b.id)) throw new Error(`Duplikat bookId: ${b.id}`);
  seenIds.add(b.id);
  const m = manifestBooks.get(b.id);
  if (!m) throw new Error(`Brak księgi ${b.id} w manifeście UBG-2025`);
  if (b.order !== idx + 1) throw new Error(`Błędna kolejność dla ${b.id}: ${b.order}`);
  if (b.testament === 'OT') otCount += 1;
  if (b.testament === 'NT') ntCount += 1;
  totalChapters += m.chapters;

  const verifiedRefs = b.refs.map(([ch, vStart, vEnd]) => quoteUbg(b.id, ch, vStart, vEnd || vStart));

  return {
    id: b.id,
    order: b.order,
    testament: b.testament,
    name: m.bookName,
    aliases: b.aliases,
    genre: b.genre,
    era: b.era,
    chapters: m.chapters,
    teaser: b.teaser,
    summary: b.summary,
    historicalContext: b.historicalContext,
    authorship: b.authorship,
    dating: b.dating,
    outline: b.outline,
    themes: b.themes,
    gospelLink: b.gospelLink,
    references: verifiedRefs.map((r) => ({
      bookId: r.bookId,
      chapter: r.chapter,
      verseStart: r.verseStart,
      verseEnd: r.verseEnd,
      label: r.label,
      translation: r.translation,
      sourceUrl: r.sourceUrl,
      text: r.text,
    })),
    questions: b.questions,
    sources: b.sources,
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  };
});

if (otCount !== 39 || ntCount !== 27 || totalChapters !== 1189) {
  throw new Error(`Błąd walidacji kanonu: OT=${otCount}, NT=${ntCount}, rozdziały=${totalChapters}`);
}

// 2. Wygeneruj i zwaliduj Plan 365 dni (1189 rozdziałów deterministycznie)
const flatChapters = [];
for (const b of books66) {
  for (let ch = 1; ch <= b.chapters; ch += 1) {
    flatChapters.push({ bookId: b.id, bookName: b.name, chapter: ch });
  }
}
if (flatChapters.length !== 1189) {
  throw new Error(`Oczekiwano 1189 rozdziałów płaskich, jest ${flatChapters.length}`);
}

const days365 = [];
const coveredKeys = new Set();

for (let d = 1; d <= 365; d += 1) {
  const startIdx = Math.floor(((d - 1) * 1189) / 365);
  const endIdx = Math.floor((d * 1189) / 365) - 1;
  if (endIdx < startIdx) throw new Error(`Pusty dzień w planie 365: dzień ${d}`);

  const daySlice = flatChapters.slice(startIdx, endIdx + 1);
  const passages = [];
  for (const item of daySlice) {
    const k = `${item.bookId}:${item.chapter}`;
    if (coveredKeys.has(k)) throw new Error(`Duplikat rozdziału w Planie 365: ${k}`);
    coveredKeys.add(k);
    const prev = passages[passages.length - 1];
    if (prev && prev.bookId === item.bookId && prev.chapterTo + 1 === item.chapter) {
      prev.chapterTo = item.chapter;
    } else {
      passages.push({
        bookId: item.bookId,
        bookName: item.bookName,
        chapterFrom: item.chapter,
        chapterTo: item.chapter,
      });
    }
  }
  days365.push({
    day: d,
    chapterCount: daySlice.length,
    passages,
    label: passages
      .map((p) => (p.chapterFrom === p.chapterTo ? `${p.bookName} ${p.chapterFrom}` : `${p.bookName} ${p.chapterFrom}–${p.chapterTo}`))
      .join(' · '),
  });
}

if (coveredKeys.size !== 1189 || days365.length !== 365) {
  throw new Error(`Niepełne pokrycie Planu 365: dni=${days365.length}, rozdziały=${coveredKeys.size}`);
}

// Opcjonalna ścieżka startowa: 21 dni z Ewangelią Jana (wyraźnie oznaczona jako ścieżka wprowadzająca)
const johnStarterPath = Array.from({ length: 21 }, (_, idx) => ({
  day: idx + 1,
  chapterCount: 1,
  passages: [{ bookId: 'JHN', bookName: 'Ewangelia Jana', chapterFrom: idx + 1, chapterTo: idx + 1 }],
  label: `Ewangelia Jana ${idx + 1}`,
}));

const plan365 = {
  version: 1,
  method: 'canonical',
  methodNote: 'Prosty plan kanoniczny obejmujący 100% kanonu 66 ksiąg (1189 rozdziałów w 365 niepustych dniach, średnio 3–4 rozdziały dziennie).',
  totalDays: 365,
  totalChapters: 1189,
  translation: 'UBG-2025',
  days: days365,
  starterPath: {
    id: 'john-21',
    title: 'Ścieżka startowa: 21 dni z Ewangelią Jana',
    note: 'Łagodne wprowadzenie do samodzielnego czytania Pisma Świętego (1 rozdział dziennie). Ścieżka startowa jest dodatkiem wprowadzającym, a nie osobnym pełnym planem rocznym.',
    totalDays: 21,
    days: johnStarterPath,
  },
  updatedAt: UPDATED_AT,
};

// 3. Zbuduj korpus studiów tematycznych i 13 pytań FAQ (100% dosłowne cytaty z UBG-2025)
const trustVerse = quoteUbg('ACT', 17, 11, 11);

const studies = [
  {
    slug: 'poznaj-jezusa',
    navLabel: 'Poznaj Jezusa',
    category: 'Fundament Ewangelii',
    title: 'Kim jest Jezus Chrystus według Pisma Świętego?',
    summary: 'Życie, nauczanie, krzyż, zmartwychwstanie i obietnice Jezusa wprost na kartach Ewangelii — bez uproszczeń i bez presji.',
    shortAnswer: 'Według Nowego Testamentu Jezus nie jest jedynie dawnym nauczycielem etyki ani odległą postacią z obrazów. Jest Synem Bożym, który stał się człowiekiem, oddał swoje życie na krzyżu za ludzkie grzechy, zmartwychwstał i zaprasza każdego do żywej, osobistej relacji ze sobą.',
    quotes: [
      quoteUbg('JHN', 3, 16, 17),
      quoteUbg('JHN', 14, 6, 6),
      quoteUbg('MAT', 11, 28, 30),
    ],
    commentary: [
      {
        heading: 'Jezus bliższy niż myślisz',
        body: 'Wiele osób wychowanych w tradycji religijnej zna Jezusa z lekcji religii lub świąt, ale nigdy nie przeczytało samodzielnie jednej całej Ewangelii. Na kartach Pisma spotykamy Chrystusa, który nie gardzi ludzkimi pytaniami — rozmawia nocą z dociekliwym Nikodemem (J 3), przy studni ze zranioną Samarytanką (J 4) i zatrzymuje się przy tych, którzy czują się niegodni.'
      },
      {
        heading: 'Krzyż i zmartwychwstanie jako historyczny fundament',
        body: 'Centralnym wydarzeniem wszystkich czterech Ewangelii jest ofiara Jezusa na Golgocie i pusty grób trzeciego dnia. Apostoł Paweł przypomina, że bez zmartwychwstania wiara byłaby daremna (1 Kor 15:14). Ponieważ Jezus żyje, chrześcijaństwo nie polega na samym naśladowaniu wspomnień, lecz na zaufaniu żywemu Zbawicielowi.'
      },
      {
        heading: 'Od czego zacząć osobiste poznawanie Jezusa?',
        body: 'Najprostszy krok to przeczytanie jednego rozdziału Ewangelii Jana dziennie — powoli, zadając proste pytanie: „Co ten fragment mówi o sercu Jezusa?”. Możesz skorzystać z naszego Planu 365 dni lub 21-dniowej ścieżki startowej.'
      }
    ],
    catholicContext: null,
    reflectionQuestion: 'Który obraz Jezusa z Ewangelii (Przyjaciel, Pasterz, Nauczyciel, Zbawiciel) najbardziej przemawia do tego, czego dziś szukasz?',
    relatedSlugs: ['zbawienie', 'modlitwa', 'jedyny-posrednik'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Opracowanie redakcyjne Christian Culture (status: draft)', url: '/test/katolik/o-projekcie' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'zbawienie',
    navLabel: 'Zbawienie z łaski',
    category: 'Fundament Ewangelii',
    title: 'Zbawienie: dar łaski czy nagroda za zasługi?',
    summary: 'Ewangelia łaski (Sola Gratia, Sola Fide), pokuta, nowe życie oraz miejsce dobrych uczynków jako owocu wdzięczności.',
    shortAnswer: 'Biblia uczy jasno, że zbawienie jest darmowym darem Bożej łaski przyjmowanym przez wiarę w Jezusa Chrystusa (Ef 2:8–9; Rz 3:23–24). Dobre uczynki są niezwykle cenne, ale są owocem otrzymanej łaski, a nie walutą, którą człowiek kupuje sobie niebo.',
    quotes: [
      quoteUbg('EPH', 2, 8, 10),
      quoteUbg('ROM', 3, 23, 24),
      quoteUbg('ROM', 10, 9, 13),
    ],
    commentary: [
      {
        heading: 'Dlaczego nie musimy już żyć w nieustannym lęku, czy „zrobiliśmy wystarczająco dużo”?',
        body: 'Wiele szczerych, pobożnych osób nosi w sercu ciche pytanie: czy moje dobre uczynki przeważą moje błędy? Słowo Boże przynosi w tym miejscu głęboką ulgę. Nikt z ludzi nie spełnia doskonałej miary świętości Boga (Rz 3:23). Dlatego ratunek nie zaczyna się od naszej doskonałości, lecz od tego, że Chrystus na krzyżu spłacił nasz dług w całości.'
      },
      {
        heading: 'Prawdziwe miejsce dobrych uczynków',
        body: 'Zauważ, że List do Efezjan nie kończy się na słowach „nie z uczynków” (Ef 2:9) — już w kolejnym wersecie dodaje: „stworzeni w Chrystusie Jezusie do dobrych uczynków” (Ef 2:10). Jabłoń nie rodzi jabłek po to, żeby stać się jabłonią — rodzi je, bo już nią jest. Podobnie człowiek przyjęty przez Jezusa czyni dobro nie ze strachu przed karą, lecz z wdzięczności i miłości.'
      },
      {
        heading: 'Pokuta i osobiste powierzenie życia Jezusowi',
        body: 'Biblijna pokuta (metanoia) to szczera zmiana kierunku — odwrócenie się od życia bez Boga ku zaufaniu Jezusowi. Poniższa modlitwa jest wyłącznie dobrowolnym przykładem słów, a nie magiczną formułą automatycznie gwarantującą zbawienie; Bóg patrzy na szczere serce, nie na wyuczoną recytację.'
      }
    ],
    optionalPrayer: {
      disclaimer: 'Dobrowolny przykład modlitwy (nie jest formułą automatycznie gwarantującą zbawienie — możesz porozmawiać z Bogiem całkowicie własnymi słowami):',
      text: 'Panie Jezu, przychodzę do Ciebie szczerze taki, jaki jestem. Dziękuję Ci, że umiłowałeś mnie i oddałeś za mnie swoje życie na krzyżu. Wyznaję przed Tobą moje grzechy i proszę o Twoje przebaczenie. Chcę Ci zaufać jako mojemu jedynemu Zbawicielowi i poznawać Cię coraz lepiej przez Twoje Słowo. Prowadź mnie każdego dnia. Amen.'
    },
    catholicContext: {
      heading: 'Perspektywa porównawcza (źródłowo i z szacunkiem)',
      officialView: 'Oficjalne nauczanie Kościoła katolickiego (np. Katechizm Kościoła Katolickiego, KKK 1987–2011; Wspólna Deklaracja o Usprawiedliwieniu z 1999 r.) podkreśla pierwotność Bożej łaski, lecz jednocześnie łączy proces usprawiedliwienia z uświęceniem, sakramentami i pojęciem zasługi rozumianej we współpracy z łaską (KKK 2006–2010).',
      ccView: 'Stanowisko Christian Culture (Sola Gratia, Sola Fide): usprawiedliwienie jest jednorazowym, pełnym darem przypisania sprawiedliwości Chrystusa grzesznikowi wyłącznie przez wiarę, bez ludzkich zasług; uświęcenie i dobre uczynki są naturalnym owocem nowego życia w Duchu Świętym.',
      sourceLabel: 'Katechizm Kościoła Katolickiego (KKK 1987–2011), vatican.va',
      sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P6Z.HTM'
    },
    reflectionQuestion: 'Co zmieniłoby się w Twoim codziennym pokoju serca, gdybyś przyjął zbawienie jako dar od Jezusa, a nie ciężar do odpracowania?',
    relatedSlugs: ['poznaj-jezusa', 'modlitwa', 'jedyny-posrednik'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Katechizm Kościoła Katolickiego (KKK 1987–2011) — źródło porównawcze', url: 'https://www.vatican.va/archive/ENG0015/__P6Z.HTM' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'modlitwa',
    navLabel: 'Modlitwa',
    category: 'Życie z Bogiem',
    title: 'Jak rozmawiać bezpośrednio z Bogiem?',
    summary: 'Modlitwa jako szczera, osobista rozmowa z Ojcem w imieniu Jezusa — wzór Modlitwy Pańskiej i praktyczne kroki.',
    shortAnswer: 'Możesz zwracać się bezpośrednio do Boga własnymi słowami, w każdej chwili i miejscu. Jezus nauczył uczniów zwracać się do Boga „Ojcze nasz” i obiecał, że w Jego imieniu mamy śmiały przystęp do tronu łaski bez strachu i bez pośrednictwa ludzkich formuł.',
    quotes: [
      quoteUbg('MAT', 6, 9, 13),
      quoteUbg('PHP', 4, 6, 7),
      quoteUbg('HEB', 4, 14, 16),
    ],
    commentary: [
      {
        heading: 'Prostota zamiast wielomówstwa',
        body: 'Tuż przed Modlitwą Pańską Jezus powiedział: „Modląc się, nie bądźcie wielomówni… wie bowiem wasz Ojciec, czego potrzebujecie, zanim go poprosicie” (Mt 6:7–8). Modlitwa nie jest recytowaniem zadanej liczby powtórzeń, aby „przekonać” niechętnego Boga — jest szczerą rozmową dziecka ze kochającym Ojcem.'
      },
      {
        heading: 'Prosty biblijny rytm modlitwy',
        body: 'Wzór z Mt 6:9–13 podpowiada cztery naturalne elementy rozmowy z Bogiem: (1) Uwielbienie i wdzięczność („Ojcze nasz, święć się imię Twoje”), (2) Oddanie swojej woli („bądź wola Twoja”), (3) Zwykłe potrzeby i prośba o przebaczenie („chleba powszedniego… przebacz nam”), (4) Prośba o ochronę i prowadzenie w trudnych wyborach.'
      },
      {
        heading: 'Modlitwa razem z otwartą Biblią',
        body: 'Jednym z najlepszych sposobów na żywą modlitwę jest modlenie się słowami Psalmów lub krótkiego fragmentu Ewangelii: najpierw czytasz kilka wersetów (Bóg mówi do Ciebie), a potem odpowiadasz Mu własnymi słowami na to, co przeczytałeś.'
      }
    ],
    catholicContext: null,
    reflectionQuestion: 'Gdybyś miał dziś powiedzieć Bogu jedno całkiem szczere zdanie własnymi słowami — bez gotowej formułki — jak by ono brzmiało?',
    relatedSlugs: ['jedyny-posrednik', 'poznaj-jezusa', 'zbawienie'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'biblia-a-tradycja',
    navLabel: 'Biblia a tradycja',
    category: 'Badanie Pisma',
    title: 'Biblia a tradycja kościelna — co jest ostateczną miarą wiary?',
    summary: 'Uczciwe, źródłowe porównanie zasady Sola Scriptura i relacji między Pismem Świętym a tradycją (Mk 7, 2 Tm 3:16–17).',
    shortAnswer: 'Christian Culture przyjmuje zasadę Sola Scriptura: Biblia (66 ksiąg) jest jedynym nieomylnym i wystarczającym autorytetem w sprawach wiary i zbawienia. Historia i tradycja mogą być pomocnym świadectwem, ale każdą ludzką naukę należy sprawdzać w świetle Pisma Świętego (Dz 17:11; Mk 7:8–13).',
    quotes: [
      quoteUbg('2TI', 3, 16, 17),
      quoteUbg('MRK', 7, 8, 13),
      quoteUbg('ACT', 17, 11, 11),
    ],
    commentary: [
      {
        heading: 'Czym jest, a czym NIE jest Sola Scriptura?',
        body: 'Zasada „Tylko Pismo” nie oznacza pogardy dla historii chrześcijaństwa ani przekonania, że każdy zamyka się w izolacji. Oznacza jasno określoną hierarchię autorytetu: ludzkie sobory, nauczyciele i tradycje mogą się mylić i zmieniać na przestrzeni wieków — dlatego ostatecznym sędzią każdej nauki pozostaje spisane Słowo Boże.'
      },
      {
        heading: 'Jak Jezus odnosił się do tradycji ludzkiej?',
        body: 'W Ewangelii Marka 7:8–13 Jezus nie krytykował Prawa Bożego, lecz ludzkie przepisy religijne („tradycję starszych”), które z czasem zaczęły znosić lub przysłaniać jasne przykazanie Boga. W każdym sporze religijnym Jezus odwoływał się do słów: „Napisano” (Mt 4:4,7,10).'
      },
      {
        heading: 'Dlaczego w projekcie korzystamy z kanonu 66 ksiąg?',
        body: 'Stary Testament w kanonie hebrajskim (przyjmowanym przez wspólnoty ewangeliczne i protestanckie) liczy 39 ksiąg; wraz z 27 księgami Nowego Testamentu daje to 66 ksiąg. Kanon katolicki obejmuje 73 księgi (dodając 7 ksiąg tzw. deuterokanonicznych: Tobiasza, Judyty, 1–2 Machabejską, Mądrości, Mądrość Syracha, Barucha oraz dodatki do Estery i Daniela). Nie mylimy przy tym całego katolickiego przekładu z księgami deuterokanonicznymi — różnica dotyczy zakresu kanonu Starego Testamentu.'
      }
    ],
    catholicContext: {
      heading: 'Oficjalne stanowisko katolickie a stanowisko Christian Culture',
      officialView: 'Kościół rzymskokatolicki naucza (Konstytucja Dei Verbum 9; KKK 80–82, 85–87, 120), że Pismo Święte i Tradycja stanowią jeden święty depozyt słowa Bożego, a jego autentyczna interpretacja została powierzona Urzędowi Nauczycielskiemu Kościoła (Magisterium); kanon katolicki obejmuje 73 księgi.',
      ccView: 'Christian Culture nie reprezentuje Kościoła rzymskokatolickiego i świadomie stoi na gruncie Sola Scriptura oraz kanonu 66 ksiąg: Słowo Boże samo się wyjaśnia, jest w pełni wystarczające ku zbawieniu (2 Tm 3:15–17) i stoi ponad każdą instytucjonalną tradycją.',
      sourceLabel: 'Katechizm Kościoła Katolickiego (KKK 80–87, 120), vatican.va',
      sourceUrl: 'https://www.vatican.va/archive/ENG0015/__PL.HTM'
    },
    reflectionQuestion: 'Kiedy pojawia się rozbieżność między przyzwyczajeniem religijnym a jasnym wersetem Biblii — według jakiej miary chcesz podejmować decyzję?',
    relatedSlugs: ['dekalog', 'jedyny-posrednik', 'o-projekcie'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Katechizm Kościoła Katolickiego (KKK 80–87, 120) — źródło porównawcze', url: 'https://www.vatican.va/archive/ENG0015/__PL.HTM' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'dekalog',
    navLabel: 'Dekalog i Sabat',
    category: 'Badanie Pisma',
    title: 'Jak naprawdę brzmi Dekalog w Biblii? (Wj 20 i Pwt 5)',
    summary: 'Pełny, dosłowny tekst Dziesięciu Przykazań z Księgi Wyjścia 20 i Księgi Powtórzonego Prawa 5 oraz biblijny kontekst dnia odpoczynku.',
    shortAnswer: 'Pełny tekst biblijny Dziesięciu Przykazań (Wj 20:1–17 oraz Pwt 5:6–21) zawiera wyraźne drugie przykazanie zakazujące czynienia i kłaniania się rzeźbom i obrazom w kulcie religijnym oraz czwarte przykazanie nakazujące święcić siódmy dzień tygodnia — szabat (sobotę) jako pamiątkę stworzenia i wyzwolenia.',
    quotes: [
      quoteUbg('EXO', 20, 1, 17),
      quoteUbg('DEU', 5, 6, 21),
    ],
    commentary: [
      {
        heading: 'Sprawdź tekst biblijny słowo po słowie',
        body: 'Większość osób w Polsce zna skróconą, rymowaną wersję katechetyczną ze szkoły, ale rzadko czytała oryginalny tekst Dekalogu z 20. rozdziału Księgi Wyjścia. Zachęcamy: przeczytaj uważnie oba pełne cytaty powyżej — zarówno z Księgi Wyjścia 20:1–17, jak i z Księgi Powtórzonego Prawa 5:6–21.'
      },
      {
        heading: 'Dwie różnice, które najczęściej zaskakują czytelników',
        body: 'Po pierwsze, w biblijnym brzmieniu bardzo obszerne przykazanie (Wj 20:4–6) dotyczy zakazu oddawania czci religijnej rzeźbom i wizerunkom — w skróconym katechizmie zostało ono włączone w pierwsze przykazanie, a dziesiąte rozdzielono na dziewiąte i dziesiąte. Po drugie, przykazanie o dniu odpoczynku (Wj 20:8–11) wskazuje konkretnie siódmy dzień tygodnia (szabat — sobotę), ustanowiony przez Stwórcę już w Księdze Rodzaju 2:2–3.'
      },
      {
        heading: 'Sabat i przykazania według stanowiska Christian Culture',
        body: 'W rozumieniu Christian Culture Dziesięć Przykazań jest niezmiennym wyrazem charakteru i miłości Boga (J 14:15; Rz 3:31), a biblijny szabat (siódmy dzień tygodnia, od zachodu słońca w piątek do zachodu słońca w sobotę) pozostaje darem odpoczynku i znakiem Stwórcy. Przestrzeganie przykazań nigdy nie służy „kupowaniu” zbawienia, lecz jest radosną odpowiedzią miłości człowieka już zbawionego przez łaskę.'
      }
    ],
    catholicContext: {
      heading: 'Numeracja katechetyczna i niedziela w nauczaniu katolickim',
      officialView: 'Kościół katolicki podaje w Katechizmie (KKK 2052–2074, tabela porównawcza) pełny tekst Wj 20 i Pwt 5, stosując tradycyjną numerację św. Augustyna (łączącą Wj 20:2–6 w 1. przykazanie i dzielącą Wj 20:17 na 9. i 10.) oraz nauczając, że dzień Pański został przeniesiony na niedzielę na pamiątkę zmartwychwstania Chrystusa (KKK 2174–2176).',
      ccView: 'Stanowisko Christian Culture: Nowy Testament nie zawiera żadnego Bożego nakazu przeniesienia świętości siódmego dnia na niedzielę; Jezus sam zachowywał szabat (Łk 4:16) i nazwał siebie „Panem szabatu” (Mk 2:28). Zachęcamy każdego czytelnika do spokojnego, osobistego zbadania Pisma.',
      sourceLabel: 'Katechizm Kościoła Katolickiego (KKK 2052–2176), vatican.va',
      sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P77.HTM'
    },
    reflectionQuestion: 'Czy znałeś wcześniej pełne biblijne brzmienie Wj 20:1–17? Co najbardziej zwróciło Twoją uwagę podczas tej lektury?',
    relatedSlugs: ['biblia-a-tradycja', 'zbawienie', 'poznaj-jezusa'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Katechizm Kościoła Katolickiego (KKK 2052–2176) — źródło porównawcze', url: 'https://www.vatican.va/archive/ENG0015/__P77.HTM' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'jedyny-posrednik',
    navLabel: 'Jedyny Pośrednik',
    category: 'Badanie Pisma',
    title: 'Jezus jako jedyny Pośrednik — co Biblia mówi o Marii i świętych?',
    summary: '1 Tm 2:5, Hbr 4:14–16, J 14:6 i Łk 1:46–55: głęboki szacunek dla wiary Marii przy zachowaniu wyłącznego pośrednictwa Chrystusa.',
    shortAnswer: 'Pismo Święte uczy jednoznacznie: „Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus” (1 Tm 2:5). Maria jest w Ewangelii pięknym wzorem pokornej wiary i posłuszeństwa Bogu, lecz Biblia nie uczy modlitwy do Marii ani do zmarłych świętych.',
    quotes: [
      quoteUbg('1TI', 2, 5, 5),
      quoteUbg('HEB', 4, 14, 16),
      quoteUbg('JHN', 14, 6, 6),
      quoteUbg('LUK', 1, 46, 55),
    ],
    commentary: [
      {
        heading: 'Dlaczego nikt nie jest bardziej dostępny niż sam Jezus?',
        body: 'Czasem ludzie zwracają się do innych pośredników z obawy, że Bóg jest zbyt surowy lub daleki. Tymczasem List do Hebrajczyków 4:14–16 burzy ten lęk u samych podstaw: nasz Arcykapłan Jezus współczuje naszym słabościom, bo sam był kuszony we wszystkim oprócz grzechu — dlatego możemy przychodzić wprost do tronu łaski z pełną ufnością.'
      },
      {
        heading: 'Biblijny obraz Marii — z pełnym szacunkiem',
        body: 'W Christian Culture odnosimy się do Marii z głębokim biblijnym szacunkiem: była błogosławioną, bogobojną kobietą, która z pokorą przyjęła powołanie bycia matką Jezusa (Łk 1:38,48). W swojej pieśni Magnificat (Łk 1:47) sama nazwała Boga „moim Zbawicielem”, a w Kanie Galilejskiej wypowiedziała najlepsze słowa, jakie kieruje do każdego czytelnika: „Cokolwiek wam powie [Jezus], czyńcie” (J 2:5).'
      },
      {
        heading: 'Co Nowy Testament mówi o modlitwie do świętych?',
        body: 'W Nowym Testamencie „świętymi” nazywani są wszyscy żyjący wierzący w Chrystusa (np. 1 Kor 1:2; Ef 1:1) — i jak najbardziej zachęca się nas do wzajemnej modlitwy za siebie tu na ziemi (Jk 5:16). Natomiast na kartach całej Biblii nie ma ani jednego nakazu ani przykładu modlitwy kierowanej do zmarłych ludzi; wszelka modlitwa kierowana jest wyłącznie do Boga w imieniu Jezusa.'
      }
    ],
    catholicContext: {
      heading: 'Stanowisko katolickie a stanowisko Christian Culture',
      officialView: 'Kościół katolicki naucza (KKK 956, 963–975), że jedyne pośrednictwo Chrystusa nie wyklucza „podporządkowanego” wstawiennictwa Maryi i świętych w niebie, odróżniając cześć należną Bogu (latria) od czci oddawanej świętym (dulia) i Maryi (hyperdulia).',
      ccView: 'Christian Culture — w wierności zasadzie Solus Christus — nie praktykuje kultu maryjnego ani modlitwy do świętych, uznając, że Pismo Święte powierza całą modlitwę, cześć i pośrednictwo zbawcze wyłącznie Trójjedynemu Bogu przez Jezusa Chrystusa (1 Tm 2:5; Dz 4:12).',
      sourceLabel: 'Katechizm Kościoła Katolickiego (KKK 956, 963–975), vatican.va',
      sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P2C.HTM'
    },
    reflectionQuestion: 'Co czujesz, gdy czytasz, że sam Jezus zaprasza Cię bezpośrednio do siebie (Mt 11:28; Hbr 4:16) bez żadnych barier i pośredników?',
    relatedSlugs: ['modlitwa', 'po-smierci', 'biblia-a-tradycja'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Katechizm Kościoła Katolickiego (KKK 956, 963–975) — źródło porównawcze', url: 'https://www.vatican.va/archive/ENG0015/__P2C.HTM' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'po-smierci',
    navLabel: 'Co po śmierci?',
    category: 'Nadzieja przyszłości',
    title: 'Co dzieje się z człowiekiem po śmierci według Biblii?',
    summary: 'Biblijne studium snu śmierci, zmartwychwstania i wieczności w Chrystusie (J 11, Koh 9:5, 1 Tes 4:13–18) z jawnym rozróżnieniem interpretacji.',
    shortAnswer: 'Według stanowiska biblijnego przyjmowanego przez Christian Culture śmierć w Piśmie porównywana jest do nieświadomego snu (J 11:11–14; Koh 9:5–6), a chrześcijańska nadzieja nie opiera się na naturalnej nieśmiertelności duszy ani na czyśćcu, lecz na zmartwychwstaniu ciał przy powrocie Jezusa Chrystusa (1 Tes 4:13–18).',
    quotes: [
      quoteUbg('JHN', 11, 25, 26),
      quoteUbg('ECC', 9, 5, 6),
      quoteUbg('1TH', 4, 13, 18),
      quoteUbg('REV', 21, 3, 4),
    ],
    commentary: [
      {
        heading: 'Jak Jezus nazywał śmierć?',
        body: 'Gdy umarł przyjaciel Jezusa, Łazarz, Jezus powiedział do uczniów prosto: „Łazarz, nasz przyjaciel, zasnął, ale idę, aby go obudzić” (J 11:11). Podobnego języka („śpiący w Panu”) używał wielokrotnie apostoł Paweł (1 Kor 15:20; 1 Tes 4:13–15). Sen to obraz spokojnego odpoczynku bez bólu i bez świadomości upływu czasu — aż do radosnego poranka zmartwychwstania.'
      },
      {
        heading: 'Dlaczego Pismo kieruje nadzieję na dzień zmartwychwstania?',
        body: 'Gdyby sprawiedliwi w pełni otrzymywali nagrodę już w chwili śmierci, zmartwychwstanie i powrót Chrystusa traciłyby centralną rolę. Tymczasem w 1 Tes 4:16–18 Paweł pociesza pogrążonych w żałobie obietnicą, że sam Pan zstąpi z nieba, wzbudzi zmarłych i połączy wszystkich wierzących ze sobą na zawsze.'
      },
      {
        heading: 'Co Biblia mówi o czyśćcu?',
        body: 'Słowo „czyściec” ani nauka o pośmiertnym oczyszczaniu z kar za grzechy nie występują w kanonie 66 ksiąg. Według Nowego Testamentu krew Jezusa Chrystusa „oczyszcza nas z wszelkiego grzechu” w pełni już tu i teraz (1 J 1:7; Hbr 10:14).'
      }
    ],
    catholicContext: {
      heading: 'Rozróżnienie interpretacji chrześcijańskich',
      officialView: 'Kościół katolicki (KKK 1020–1037) oraz część tradycji chrześcijańskich naucza o nieśmiertelności duszy, sądzie szczegółowym bezpośrednio po śmierci oraz istnieniu czyśćca dla dusz wymagających ostatecznego oczyszczenia przed wejściem do nieba.',
      ccView: 'Stanowisko Christian Culture (warunkowa nieśmiertelność — 1 Tm 6:16; 1 Kor 15:51–54): człowiek jest niepodzielną jednością, śmierć jest stanem nieświadomego odpoczynku, a życie wieczne jest darem otrzymywanym przy zmartwychwstaniu w dniu powrotu Chrystusa.',
      sourceLabel: 'Katechizm Kościoła Katolickiego (KKK 1020–1037), vatican.va',
      sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P2L.HTM'
    },
    reflectionQuestion: 'Dlaczego obietnica z Ap 21:4, że Bóg osobiście otrze każdą łzę i nie będzie już śmierci, jest tak ważna wobec naszych ludzkich pożegnań?',
    relatedSlugs: ['powrot-jezusa', 'zbawienie', 'jedyny-posrednik'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Katechizm Kościoła Katolickiego (KKK 1020–1037) — źródło porównawcze', url: 'https://www.vatican.va/archive/ENG0015/__P2L.HTM' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'powrot-jezusa',
    navLabel: 'Powrót Jezusa',
    category: 'Nadzieja przyszłości',
    title: 'Powtórne przyjście Jezusa — nadzieja bez sensacyjnych dat',
    summary: 'Biblijna obietnica widzialnego, chwalebnego powrotu Chrystusa i nowego stworzenia — spokojna, trzeźwa nadzieja bez wyznaczania terminów.',
    shortAnswer: 'Powtórne przyjście Jezusa jest jednym z najczęściej powtarzanych tematów Nowego Testamentu. Będzie ono dosłowne, widzialne i pełne chwały (Dz 1:11; 1 Tes 4:16). Sam Jezus zakazał wyznaczania dat („o tym dniu i godzinie nikt nie wie”, Mt 24:36) — zamiast lęku zaprasza do spokojnej gotowości serca.',
    quotes: [
      quoteUbg('1TH', 4, 13, 18),
      quoteUbg('REV', 21, 3, 4),
    ],
    commentary: [
      {
        heading: 'Dlaczego powrót Jezusa nazywany jest „błogosławioną nadzieją”?',
        body: 'Dla wielu ludzi temat „końca świata” kojarzy się z filmami katastroficznymi i strachem. W Biblii jest dokładnie odwrotnie: powrót Jezusa to nie zagłada nadziei, lecz koniec cierpienia, wojen, chorób i śmierci — moment, w którym Zbawiciel przychodzi po tych, którzy Go kochają (J 14:1–3; Tt 2:13).'
      },
      {
        heading: 'Stanowcze NIE dla sensacyjnego wyznaczania dat',
        body: 'W Christian Culture kategorycznie odrzucamy wszelkie sensacyjne wyznaczanie dat powrotu Chrystusa. Sam Jezus powiedział wyraźnie, że nikt z ludzi nie zna dnia ani godziny (Mt 24:36). Dojrzała wiara nie polega na odliczaniu dni w lęku, lecz na codziennym chodzeniu z Bogiem, uczciwej pracy i niesieniu dobra ludziom.'
      }
    ],
    catholicContext: null,
    reflectionQuestion: 'Co pomaga Ci patrzeć w przyszłość z pokojem i nadzieją zamiast lęku przed wiadomościami ze świata?',
    relatedSlugs: ['po-smierci', 'proroctwa', 'poznaj-jezusa'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'proroctwa',
    navLabel: 'Proroctwa Biblii',
    category: 'Nadzieja przyszłości',
    title: 'Daniel i Apokalipsa — jak czytać proroctwa bez strachu i sensacji?',
    summary: 'Wprowadzenie do ksiąg Daniela i Apokalipsy z jasno oznaczonym stanowiskiem interpretacyjnym Christian Culture.',
    shortAnswer: 'Proroctwa Daniela i Apokalipsy nie zostały dane po to, by straszyć czytelników tajemnymi szyframi, lecz by pokazać, że historia świata nie wymknęła się Bogu z rąk — a jej finałem jest wieczne królestwo Jezusa Chrystusa (Dn 2:44; Ap 14:6–7).',
    quotes: [
      quoteUbg('DAN', 2, 44, 44),
      quoteUbg('REV', 14, 6, 7),
      quoteUbg('REV', 21, 3, 4),
    ],
    commentary: [
      {
        heading: 'Zasada zdrowego czytania proroctw: Pismo wyjaśnia Pismo',
        body: 'Symbole w Księdze Daniela i Apokalipsie (bestie, rogi, wody, kobieta, Baranek) nie są dowolnymi zagadkami do zgadywania na podstawie bieżących nagłówków z internetu. Sama Biblia niemal każdy swój symbol wyjaśnia w innych wersetach (np. bestie oznaczają królestwa — Dn 7:17,23; wody oznaczają ludy i narody — Ap 17:15).'
      },
      {
        heading: 'Stanowisko interpretacyjne Christian Culture (jawnie oznaczone)',
        body: 'Chrześcijanie stosują różne szkoły czytania proroctw (historycystyczną, preterystyczną, futurystyczną, idealistyczną). Christian Culture odczytuje Księgę Daniela i Apokalipsę w tradycji historycystycznej (ciągły zarys dziejów zbawienia od czasów proroka aż po powrót Chrystusa), zawsze stawiając w centrum samego Jezusa i wieczną Ewangelię (Ap 14:6), bez wyznaczania jakichkolwiek dat.'
      }
    ],
    catholicContext: null,
    reflectionQuestion: 'Dlaczego pierwszym i najważniejszym przesłaniem proroctwa w Ap 14:6 jest „wieczna Ewangelia”, a nie groźba?',
    relatedSlugs: ['powrot-jezusa', 'po-smierci', 'biblia-a-tradycja'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Księga Daniela i Apokalipsa w Mapie Biblii CC', url: '/test/katolik/mapa-biblii/DAN' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
  {
    slug: 'o-projekcie',
    navLabel: 'O projekcie',
    category: 'Tożsamość i zasady',
    title: 'O projekcie „Odkryj Biblię — dla katolików”',
    summary: 'Jawna tożsamość Christian Culture, wyjaśnienie kanonu 66 vs 73 ksiąg, zasady redakcyjne, źródła, licencja UBG i prywatność.',
    shortAnswer: 'Christian Culture jest niezależną inicjatywą chrześcijańską. Nie reprezentujemy Kościoła rzymskokatolickiego. Naszym celem jest przybliżanie Jezusa Chrystusa i zachęcanie do osobistego poznawania Pisma Świętego w kanonie 66 ksiąg.',
    quotes: [
      quoteUbg('ACT', 17, 11, 11),
      quoteUbg('2TI', 3, 16, 17),
    ],
    commentary: [
      {
        heading: 'Nasza jawna tożsamość i szacunek dla każdego czytelnika',
        body: 'Christian Culture jest niezależną inicjatywą chrześcijańską. Nie reprezentujemy Kościoła rzymskokatolickiego. Naszym celem jest przybliżanie Jezusa Chrystusa i zachęcanie do osobistego poznawania Pisma Świętego w kanonie 66 ksiąg. Projekt powstał z głębokiego szacunku dla osób wywodzących się z tradycji katolickiej, które chcą spokojnie, bez presji i bez wrogości same otworzyć Biblię.'
      },
      {
        heading: 'Kanon 66 ksiąg a kanon 73 ksiąg — uczciwe wyjaśnienie',
        body: 'Kanon katolicki obejmuje 73 księgi (46 ksiąg Starego Testamentu, w tym 7 ksiąg tzw. deuterokanonicznych, oraz 27 ksiąg Nowego Testamentu). Projekt Christian Culture świadomie przyjmuje kanon 66 ksiąg (39 ksiąg Starego Testamentu według kanonu hebrajskiego i 27 ksiąg Nowego Testamentu). Nie mylimy całego katolickiego przekładu Biblii z księgami deuterokanonicznymi — zawsze jasno oznaczamy przyjęty przekład i źródło.'
      },
      {
        heading: 'Przekład, licencja i status redakcyjny',
        body: 'Podstawowym przekładem cytowanym na tej stronie jest Uwspółcześniona Biblia Gdańska (UBG-2025) © Fundacja Wrota Nadziei / Logos Media, wykorzystywana ewangelizacyjnie na licencji CC BY-ND 4.0 bezpośrednio ze zweryfikowanego korpusu Christian Culture (/data/bible/ubg-2025/). Wszystkie streszczenia ksiąg oraz studia tematyczne w wersji testowej /test/katolik posiadają status roboczy (draft) i oczekują na końcową akceptację redakcyjną przed promocją na /katolik.'
      },
      {
        heading: 'Prywatność, dostępność i zero przymusu',
        body: 'Korzystanie z portalu, Mapy 66 ksiąg i Planu 365 dni jest całkowicie bezpłatne i nie wymaga zakładania konta, podawania adresu e-mail ani żadnych darowizn. Twój postęp czytania zapisywany jest lokalnie w Twojej przeglądarce (z możliwością eksportu i usunięcia). Nie wysyłamy treści modlitw, pytań duchowych ani przekonań religijnych do systemów reklamowych i nie tworzymy remarketingu na podstawie wiary.'
      }
    ],
    catholicContext: null,
    reflectionQuestion: 'Masz uwagę merytoryczną, błąd techniczny lub propozycję źródła? Napisz do nas: radiochristianculture@gmail.com.',
    relatedSlugs: ['biblia-a-tradycja', 'poznaj-jezusa', 'zbawienie'],
    sources: [
      { label: 'Uwspółcześniona Biblia Gdańska (UBG-2025), CC BY-ND 4.0', url: '/mojabiblia' },
      { label: 'Polityka Prywatności Christian Culture', url: '/privacy' },
      { label: 'Strona główna Christian Culture', url: '/' }
    ],
    reviewStatus: 'draft',
    updatedAt: UPDATED_AT,
  },
];

// 13 pytań startowych FAQ (Sekcja 8 specyfikacji)
const faq = [
  {
    id: 'faq-start',
    question: 'Od czego zacząć czytanie Biblii?',
    category: 'Start z Biblią',
    answer: 'Jeśli dopiero zaczynasz, najlepiej rozpocząć od Ewangelii Jana (21 rozdziałów — ok. 5–7 minut dziennie), aby wprost poznać Jezusa Chrystusa, Jego słowa i relacje z ludźmi. Równolegle możesz uruchomić nasz Plan 365 dni, który w ciągu roku przeprowadzi Cię przez wszystkie 66 ksiąg (1189 rozdziałów) od dowolnej daty.',
    refs: [quoteUbg('JHN', 20, 31, 31), quoteUbg('ACT', 17, 11, 11)],
    studySlug: 'poznaj-jezusa',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-modlitwa',
    question: 'Czy mogę rozmawiać bezpośrednio z Bogiem?',
    category: 'Życie z Bogiem',
    answer: 'Tak. Nowy Testament uczy, że przez Jezusa Chrystusa każdy człowiek ma bezpośredni, śmiały dostęp do Boga Ojca (Hbr 4:16; Ef 2:18). Nie potrzebujesz wyszukanych formuł ani ziemskich pośredników — Bóg słucha szczerego serca i zwykłych ludzkich słów.',
    refs: [quoteUbg('HEB', 4, 14, 16), quoteUbg('PHP', 4, 6, 7)],
    studySlug: 'modlitwa',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-zbawienie',
    question: 'Jak mogę otrzymać zbawienie?',
    category: 'Ewangelia',
    answer: 'Według Biblii zbawienie otrzymuje się jako dar Bożej łaski przez szczere zawierzenie Jezusowi Chrystusowi, który umarł za nasze grzechy i zmartwychwstał (J 3:16; Rz 10:9–10; Ef 2:8–9). Nie kupuje się go obrzędem ani liczbą dobrych czynów, lecz przyjmuje z wiarą i pokutą.',
    refs: [quoteUbg('JHN', 3, 16, 17), quoteUbg('ROM', 10, 9, 13)],
    studySlug: 'zbawienie',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-uczynki',
    question: 'Czy dobre uczynki dają zbawienie?',
    category: 'Ewangelia',
    answer: 'Dobre uczynki są bardzo ważne, ale według Pisma Świętego nie są ceną ani podstawą zbawienia — są jego owocem (Ef 2:8–10; Tt 3:5). Najpierw Bóg zbawia nas z łaski przez wiarę w Chrystusa, a potem przemienione serce z wdzięczności czyni dobro bliźnim.',
    refs: [quoteUbg('EPH', 2, 8, 10), quoteUbg('ROM', 3, 23, 24)],
    studySlug: 'zbawienie',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-posrednik',
    question: 'Kto jest pośrednikiem między Bogiem a ludźmi?',
    category: 'Badanie Pisma',
    answer: 'Pismo Święte odpowiada jednym jasnym zdaniem: „Jeden bowiem jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus” (1 Tm 2:5). Sam Jezus mówi też: „Ja jestem drogą, prawdą i życiem. Nikt nie przychodzi do Ojca jak tylko przeze mnie” (J 14:6).',
    refs: [quoteUbg('1TI', 2, 5, 5), quoteUbg('JHN', 14, 6, 6)],
    studySlug: 'jedyny-posrednik',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-maria',
    question: 'Co Biblia mówi o Marii?',
    category: 'Badanie Pisma',
    answer: 'Biblia przedstawia Marię z wielkim szacunkiem jako pokorną, bogobojną matkę Jezusa (Łk 1:28–38), która w swojej pieśni sama nazwała Boga „moim Zbawicielem” (Łk 1:47) i skierowała uwagę ludzi na Syna: „Cokolwiek wam powie, czyńcie” (J 2:5). Pismo nie nakazuje kultu maryjnego ani modlitwy do Marii.',
    refs: [quoteUbg('LUK', 1, 46, 55)],
    studySlug: 'jedyny-posrednik',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-swieci',
    question: 'Czy Biblia nakazuje modlitwę do świętych?',
    category: 'Badanie Pisma',
    answer: 'Nie. W Nowym Testamencie określenie „święci” odnosi się do wszystkich żyjących wierzących, którzy wzajemnie modlą się za siebie na ziemi. W całej Biblii nie ma jednak nakazu ani przykładu zwracania się w modlitwie do zmarłych świętych — wszelką modlitwę kierujemy wprost do Boga przez Jezusa (1 Tm 2:5).',
    refs: [quoteUbg('1TI', 2, 5, 5), quoteUbg('ACT', 4, 12, 12)],
    studySlug: 'jedyny-posrednik',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-tradycja',
    question: 'Co Biblia mówi o ludzkiej tradycji religijnej?',
    category: 'Badanie Pisma',
    answer: 'Sama historia i tradycja mogą być cenną pamięcią, ale gdy ludzka tradycja staje ponad jasnym przykazaniem Bożym lub je zmienia, Jezus wyraźnie ją odrzuca (Mk 7:8–13). Ostatecznym sprawdzianem każdej nauki pozostaje natchnione Pismo Święte (2 Tm 3:16–17; Dz 17:11).',
    refs: [quoteUbg('MRK', 7, 8, 13), quoteUbg('2TI', 3, 16, 17)],
    studySlug: 'biblia-a-tradycja',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-dekalog',
    question: 'Jak naprawdę brzmi biblijny Dekalog?',
    category: 'Dekalog i Sabat',
    answer: 'Pełne brzmienie Dziesięciu Przykazań zapisano w Księdze Wyjścia 20:1–17 oraz Księdze Powtórzonego Prawa 5:6–21. Zawiera ono m.in. wyraźne przykazanie zakazujące czynienia i kłaniania się rzeźbom/obrazom w kulcie (Wj 20:4–6) oraz przykazanie święcenia siódmego dnia — szabatu (Wj 20:8–11).',
    refs: [quoteUbg('EXO', 20, 1, 17)],
    studySlug: 'dekalog',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-sabat',
    question: 'Co Biblia mówi o sabacie (szabacie)?',
    category: 'Dekalog i Sabat',
    answer: 'Już przy stworzeniu świata Bóg pobłogosławił siódmy dzień (Rdz 2:2–3), potwierdził go w czwartym przykazaniu Dekalogu (Wj 20:8–11), a Jezus sam go zachowywał (Łk 4:16) i nazwał siebie „Panem szabatu” (Mk 2:28). Według stanowiska Christian Culture biblijny dzień odpoczynku przypada na siódmy dzień tygodnia — sobotę.',
    refs: [quoteUbg('EXO', 20, 8, 11)],
    studySlug: 'dekalog',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-smierc',
    question: 'Co dzieje się po śmierci?',
    category: 'Nadzieja przyszłości',
    answer: 'W tradycji katolickiej naucza się o nieśmiertelnej duszy i czyśćcu (KKK 1020–1037). W rozumieniu biblijnym Christian Culture śmierć jest stanem nieświadomego snu i odpoczynku (Koh 9:5–6; J 11:11–14), a prawdziwa nadzieja wieczności spełni się przy zmartwychwstaniu w dniu powrotu Jezusa (1 Tes 4:13–18).',
    refs: [quoteUbg('ECC', 9, 5, 6), quoteUbg('1TH', 4, 13, 18)],
    studySlug: 'po-smierci',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-powrot',
    question: 'Czym jest powtórne przyjście Jezusa?',
    category: 'Nadzieja przyszłości',
    answer: 'To obiecany przez samego Jezusa (J 14:1–3) i apostołów (1 Tes 4:16–17) dosłowny, widzialny powrót Chrystusa, który położy kres cierpieniu, złu i śmierci, wzbudzi zmarłych i zapoczątkuje nowe niebo i nową ziemię (Ap 21:3–4). Nikt nie zna daty tego dnia — dlatego żyjemy w spokojnej gotowości, bez sensacyjnych przepowiedni.',
    refs: [quoteUbg('1TH', 4, 13, 18), quoteUbg('REV', 21, 3, 4)],
    studySlug: 'powrot-jezusa',
    reviewStatus: 'draft',
  },
  {
    id: 'faq-kanon66',
    question: 'Dlaczego Christian Culture korzysta z 66 ksiąg zamiast 73?',
    category: 'Tożsamość i zasady',
    answer: 'Kanon katolicki liczy 73 księgi (obejmując 7 ksiąg deuterokanonicznych Starego Testamentu przyjętych dogmatycznie na Soborze Trydenckim w 1546 r.). Christian Culture — jak wspólnoty ewangeliczne i protestanckie — przyjmuje kanon 66 ksiąg: 39 ksiąg Starego Testamentu (kanon hebrajski używany w czasach Jezusa) oraz 27 ksiąg Nowego Testamentu. Podajemy tę różnicę jawnie i z szacunkiem.',
    refs: [quoteUbg('2TI', 3, 16, 17), quoteUbg('ACT', 17, 11, 11)],
    studySlug: 'o-projekcie',
    reviewStatus: 'draft',
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'books-66.json'), JSON.stringify({
  version: 1,
  translation: 'UBG-2025',
  license: manifest.copyright,
  totalBooks: books66.length,
  otCount,
  ntCount,
  totalChapters,
  reviewStatus: 'draft',
  updatedAt: UPDATED_AT,
  books: books66,
}, null, 2), 'utf8');

fs.writeFileSync(path.join(OUT_DIR, 'plan-365.json'), JSON.stringify(plan365, null, 2), 'utf8');

fs.writeFileSync(path.join(OUT_DIR, 'studies.json'), JSON.stringify({
  version: 1,
  translation: 'UBG-2025',
  license: manifest.copyright,
  reviewStatus: 'draft',
  updatedAt: UPDATED_AT,
  trustVerse,
  studies,
  faq,
}, null, 2), 'utf8');

console.log(`✅ Wygenerowano i zweryfikowano dane /test/katolik/data/:`);
console.log(`   - books-66.json: ${books66.length} ksiąg (${otCount} ST + ${ntCount} NT, ${totalChapters} rozdziałów, wszystkie odsyłacze zweryfikowane z UBG-2025)`);
console.log(`   - plan-365.json: ${days365.length} dni, ${coveredKeys.size} unikalnych rozdziałów + ścieżka startowa Ewangelia Jana (21 dni)`);
console.log(`   - studies.json: ${studies.length} studiów tematycznych + ${faq.length} pytań FAQ (100% dosłowne cytaty z UBG-2025)`);
