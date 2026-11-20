import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'em',
  type: 'MOTYWACJA eM',
  title: 'Wielki post internetowy? Jak odzyskać uwagę przed świętami',
  slug: 'wielki-post-internetowy-jak-odzyskac-uwage-przed-swietami',
  author: 'Cezary Rogowski',
  date: '2026-11-17',
  lead: 'Druga połowa listopada to ostatni spokojny oddech przed grudniowym pośpiechem, przedświątecznymi zakupami i lawiną powiadomień walczących o każdą wolną minutę. W świecie, w którym niemal połowa młodych ludzi deklaruje obecność w sieci prawie bez przerwy, propozycja „postu internetowego” przestaje być chwilową modą, a staje się troską o wewnętrzną wolność. Pismo Święte nie uczy lękliwej ucieczki przed technologią ani kupowania Bożej przychylności cyfrową ascezą, lecz wzywa do mądrego „odkupywania czasu” (Ef 5:16 UBG). Odzyskanie uwagi przed świętami zaczyna się od uczciwego pytania: kto dziś naprawdę rządzi naszą codziennością?',
  sections: [
    {
      heading: '1. DIAGNOSTYKA ROZPROSZENIA: CO MÓWIĄ BADANIA O NASZEJ UWADZE I NAWYKACH ONLINE',
      paragraphs: [
        'Zanim przejdziemy do refleksji duchowej, spójrzmy na rzetelne dane naukowe pokazujące, jak zmieniło się nasze codzienne korzystanie z ekranów. Według raportu Pew Research Center „Teens, Social Media and Technology 2024” (opublikowanego 12 grudnia 2024 r. na podstawie badania 1391 nastolatków w wieku 13–17 lat) aż 95% młodych ludzi ma dostęp do smartfona, a 96% korzysta z internetu każdego dnia. Niemal połowa badanych przyznaje, że jest online „prawie bez przerwy”, co oznacza niemal dwukrotny wzrost względem 24% dekadę wcześniej. Jedna trzecia ankietowanych deklaruje niemal ciągłą obecność na co najmniej jednej z pięciu największych platform społecznościowych.',
        'Równolegle Światowa Organizacja Zdrowia (WHO — Biuro Regionalne dla Europy) w raporcie z 25 września 2024 r., opartym na badaniu HBSC wśród blisko 280 tysięcy uczniów z 44 krajów Europy, Azji Środkowej i Kanady, odnotowała niepokojący trend. Odsetek nastolatków wykazujących tzw. problematyczne korzystanie z mediów społecznościowych — objawiające się utratą kontroli, rozdrażnieniem po odłożeniu ekranu i zaniedbywaniem innych obowiązków — wzrósł z 7% w 2018 roku do 11% w 2022 roku. Eksperci WHO uczciwie zaznaczają jednak ważny niuans: umiarkowane i kontrolowane używanie sieci wiązało się z silniejszym wsparciem rówieśniczym. Problemem nie jest sama łączność, lecz utrata panowania nad własną uwagą.',
        'Czy krótkie odstawienie mediów społecznościowych przynosi realną ulgę psychiczną? Odpowiedzi dostarcza badanie kohortowe opublikowane 24 listopada 2025 r. w czasopiśmie „JAMA Network Open” przez zespół Elombe Calverta i dr. Johna Torousa z Beth Israel Deaconess Medical Center oraz University of Bath (373 młodych dorosłych monitorowanych obiektywnie między marcem 2024 a marcem 2025 r.). Już tygodniowy detoks od mediów społecznościowych obniżył u badanych objawy lęku o 16,1%, objawy depresyjne o 24,8%, a trudności ze snem i bezsennością o 14,5%. Autorzy badania zachowują przy tym naukową rzetelność i podkreślają ograniczenie tej interwencji: sam jednorazowy tydzień przerwy nie gwarantuje trwałej zmiany, jeśli nie zbudujemy stałych, zdrowych granic na kolejne miesiące.'
      ]
    },
    {
      heading: '2. ROZDZIELENIE FAKTÓW OD TEOLOGII: CZY POST CYFROWY ZBAWIA I CZY TECHNOLOGIA JEST GRZECHEM?',
      paragraphs: [
        'Uczciwa analiza wymaga wyraźnego rozdzielenia faktów psychologicznych od nauki Pisma Świętego. Smartfon, szybki internet czy media społecznościowe są narzędziami moralnie neutralnymi i same w sobie nie stanowią grzechu. Mogą służyć rzetelnej pracy, edukacji, podtrzymywaniu relacji na odległość oraz dzieleniu się Dobrą Nowiną z ludźmi w każdym zakątku świata. Problem zaczyna się dopiero wtedy, gdy narzędzie zaprojektowane do utrzymywania uwagi przejmuje rolę gospodarza w naszym domu i zaczyna dyktować rytm naszych myśli.',
        'Z perspektywy teologii biblijnej oraz 28 Zasad Wiary Kościoła Bożego musimy też strzec się przeciwnego błędu: zamiany „postu internetowego” w nową formę religijnej zasługi. Apostoł Paweł przypomina fundament Ewangelii (Sola Gratia): „Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił” (Ef 2:8–9 UBG). Wyłączenie powiadomień czy rezygnacja z przeglądania aktualności przez tydzień nie kupuje Bożej przychylności ani nie czyni nikogo lepszym chrześcijaninem przed Bożym tronem. Zbawienie pozostaje wyłącznym darem Chrystusa.',
        'Jednocześnie ten sam fragment Pisma dodaje w kolejnym wersecie: „Jesteśmy bowiem jego dziełem, stworzeni w Chrystusie Jezusie do dobrych uczynków, które Bóg wcześniej przygotował, abyśmy w nich postępowali” (Ef 2:10 UBG). Oznacza to, że choć odłożenie telefonu nas nie zbawia, to oczyszczenie umysłu z nadmiaru cyfrowego szumu przygotowuje serce na posłuszeństwo Bogu i realną służbę bliźnim. Wstrzemięźliwość od nadmiaru bodźców nie jest celem samym w sobie, lecz mądrym sposobem zrobienia miejsca na to, co naprawdę ma wieczną wartość.'
      ]
    },
    {
      heading: '3. EGZEGEZA BIBLIJNA: „ODKUPUJĄC CZAS” (EF 5:15–17) I PRAWO WOLNOŚCI W CHRYSTUSIE (1 KOR 6:12)',
      paragraphs: [
        'Jednym z najtrafniejszych tekstów biblijnych opisujących dzisiejszą walkę o uwagę jest wezwanie z Listu do Efezjan: „Uważajcie więc, żebyście postępowali rozważnie, nie jak niemądrzy, ale jak mądrzy; Odkupując czas, bo dni są złe. Dlatego nie bądźcie nierozumnymi, ale rozumiejcie, jaka jest wola Pana” (Ef 5:15–17 UBG). W greckim oryginale Paweł używa tu mocnego słowa exagorazō (Strong G1805), które w świecie starożytnym oznaczało wykupienie towaru z targowiska lub uwolnienie niewolnika za pełną cenę. Chrześcijanin jest wezwany do uważnego pilnowania swoich dni, by nie oddawać ich bezrefleksyjnie za bezcen.',
        'Szczególnie wymowne jest również słowo określające „czas” — grecki termin kairos (Strong G2540). Biblia rozróżnia mechaniczny upływ minut (chronos) od kairos, czyli konkretnej, niepowtarzalnej chwili sposobności podarowanej przez Boga. Tygodnie poprzedzające koniec roku to właśnie taki kairos: czas na wyciszenie, naprawę zaniedbanych relacji i głębszą modlitwę. Jeśli pozwolimy, by każda wolna chwila znikała w bezwiednym przewijaniu krótkich filmów i gorących nagłówków, oddamy nasz bezcenny czas w ręce algorytmów obojętnych na dobro naszej duszy.',
        'Drugim filarem biblijnego spojrzenia jest zasada dojrzałej wolności sformułowana w Pierwszym Liście do Koryntian: „Wszystko mi wolno, ale nie wszystko jest pożyteczne. Wszystko mi wolno, ale ja nie dam się niczemu zniewolić” (1 Kor 6:12 UBG). Kilka rozdziałów dalej Paweł przywołuje obraz sportowca ćwiczącego panowanie nad sobą — egkrateuomai (Strong G1467), czyli świadome powściąganie własnych impulsów dla wyższego celu (1 Kor 9:25 UBG). Dojrzały człowiek nie pyta wyłącznie o to, czy aplikacja jest „zakazana”, ale o to, czy przynosi duchowy pożytek i czy wciąż potrafi ją spokojnie odłożyć.'
      ]
    },
    {
      heading: '4. POST BEZ POKAZÓWKI I MĄDROŚĆ CISZY: LEKCJA JEZUSA (MT 6:16–21; MK 1:35)',
      paragraphs: [
        'W kulturze mediów społecznościowych nawet decyzja o ograniczeniu internetu bywa okazją do publicznej autopromocji. Zdarza się, że ktoś ogłasza wszem i wobec: „Od poniedziałku robię wielki detoks od sieci!”, zbierając pod tym wpisem dziesiątki polubień i podziwu. Jezus w Kazaniu na Górze ostrzega przed takim właśnie duchem pokazowości, posługując się greckim czasownikiem nēsteuō (Strong G3522 — pościć): „A gdy pościcie, nie miejcie twarzy smutnej jak obłudnicy... Ale ty, gdy pościsz, namaść sobie głowę i umyj twarz; Aby nie ludzie widzieli, że pościsz, lecz twój Ojciec, który jest w ukryciu” (Mt 6:16–18 UBG). Prawdziwa dyscyplina duchowa nie potrzebuje publiczności.',
        'Kilka wersetów dalej Zbawiciel dotyka samego źródła naszych nawyków: „Gdzie bowiem jest wasz skarb, tam będzie i wasze serce” (Mt 6:21 UBG). Nasza uwaga jest najwierniejszym kompasem pokazującym, co w danej chwili naprawdę cenimy. Jeśli pierwszym odruchem o poranku i ostatnim przed zaśnięciem jest sprawdzenie cudzych opinii lub kolejnych wiadomości, serce powoli przywiązuje się do nieustannego zgiełku. Wówczas nawet najlepsze postanowienia rozpadają się pod naporem kolejnego sygnału powiadomienia.',
        'Sam Pan Jezus, choć każdego dnia otaczały Go tłumy potrzebujących ludzi, dawał nam wzór mądrego wycofywania się do ciszy. Ewangelista Marek zapisał: „A wstawszy wczesnym rankiem, przed świtem, wyszedł i udał się na odludne miejsce, i tam się modlił” (Mk 1:35 UBG). W podobnym tonie Psalmy wzywają do świadomego zatrzymania biegu: „Uspokójcie się [hebr. raphah, H7503 — przestańcie się szamotać, opuśćcie ręce] i uznajcie, że ja jestem Bogiem” (Ps 46:10 UBG) oraz „Odwróć moje oczy, aby nie patrzyły na marność, ożyw mnie na twojej drodze” (Ps 119:37 UBG). Cisza przed Bogiem nie jest stratą czasu — to odzyskanie wzroku serca.'
      ]
    },
    {
      heading: '5. DLACZEGO WŁAŚNIE PRZED ŚWIĘTAMI? PUŁAPKA GRUDNIOWEJ PRESJI I PORÓWNYWANIA',
      paragraphs: [
        'Druga połowa listopada to moment szczególny, ponieważ wielka machina przedświątecznej sprzedaży i medialnej gorączki dopiero nabiera rozpędu. W grudniu każdego roku jesteśmy wystawieni na zmasowany przekaz reklamowy, promocje wywołujące sztuczny pośpiech oraz wyidealizowane obrazy rodzinnej doskonałości w sieci. Kto wchodzi w ten czas z rozproszoną uwagą i nawykiem kompulsywnego przeglądania ekranów, szybko odczuwa narastające zmęczenie, zniecierpliwienie i poczucie, że nie nadąża za wyśrubowanymi oczekiwaniami.',
        'Psychologia współczesnego stresu potwierdza, że nieustanne porównywanie własnej codzienności z wyretuszowanymi kadrami z internetu potęguje poczucie niedostatku i napięcie w rodzinie. Zamiast cieszyć się prostą obecnością najbliższych osób przy wspólnym stole, zaczynamy uciekać w telefon, by odreagować przemęczenie — co paradoksalnie jeszcze bardziej wyczerpuje nasze zasoby uwagi. W rezultacie okres, który mógłby stać się czasem wdzięczności za dar przyjścia Chrystusa i bliskości domu, mija w nerwowym biegu między kolejnymi powiadomieniami.',
        'Apostoł Paweł w Liście do Filipian zostawił nam niezwykle praktyczną receptę na taki właśnie przedświąteczny zgiełk: „Nie troszczcie się o nic, ale we wszystkim przez modlitwę i prośbę z dziękczynieniem niech wasze pragnienia będą znane Bogu. A pokój Boży, który przewyższa wszelkie zrozumienie, będzie strzegł waszych serc i myśli w Chrystusie Jezusie” (Flp 4:6–7 UBG). Chwilę później dodaje kryterium higieny umysłu, które doskonale sprawdza się wobec treści internetowych: „W końcu, bracia, co prawdziwe, co uczciwe, co sprawiedliwe, co czyste, co miłe, co chwalebne, jeśli jest jakaś cnota i jakaś chwała – o tym myślcie” (Flp 4:8 UBG).'
      ]
    },
    {
      heading: '6. PIĘĆ PRAKTYCZNYCH KROKÓW „POSTU UWAGI”: PRZEWODNIK EkoCC NA NAJBLIŻSZE TYGODNIE',
      paragraphs: [
        'Aby hasło „wielkiego postu internetowego” nie skończyło się na jednodniowym zapale, potrzebujemy prostych, możliwych do utrzymania granic. Redakcja eM i Christian Culture Network przygotowała pięć konkretnych kroków na najbliższe tygodnie przed świętami:',
        '1. Odzyskaj pierwszą i ostatnią godzinę dnia (Mk 1:35 UBG). Przez pierwsze 45–60 minut po przebudzeniu nie otwieraj mediów społecznościowych ani serwisów informacyjnych — zacznij poranek od krótkiej modlitwy i kilku wersetów z Pisma Świętego, a wieczorem na godzinę przed snem odłóż telefon do ładowania poza sypialnią.',
        '2. Wprowadź świadome „tarcie” i wyłącz zbędne powiadomienia (1 Kor 6:12 UBG). Zostaw wyłącznie sygnały połączeń od bliskich oraz niezbędne komunikaty z pracy, a aplikacje pochłaniające najwięcej czasu usuń z głównego ekranu telefonu. Gdy dostęp wymaga dodatkowego wysiłku, bezmyślny odruch sięgania po ekran słabnie.',
        '3. Wyznacz jedno lub dwa stałe okna na wiadomości w ciągu dnia (Ef 5:16 UBG). Zamiast zaglądać do sieci kilkadziesiąt razy między zadaniami, wybierz konkretną porę — na przykład w południe i późnym popołudniem — i po dwudziestu minutach świadomie zamknij przeglądarkę. Twój umysł potrzebuje ciągłości, a nie życia w trybie ciągłego alarmu.',
        '4. Podaruj rodzinie jedno popołudnie lub wieczór w tygodniu całkowicie offline (Flp 4:8 UBG). Umówcie się w domu na wspólny koszyk na telefony podczas niedzielnego obiadu, gry planszowej albo spaceru. Prawdziwa bliskość rodzi się tam, gdzie patrzymy sobie w oczy, a nie w osobne ekrany pod wspólnym dachem.',
        '5. Pość cicho, bez chwalenia się i bez perfekcjonizmu (Mt 6:16–18; Ef 2:8 UBG). Jeśli po kilku dniach sięgniesz po telefon z przyzwyczajenia i spędzisz w sieci więcej czasu, niż planowałeś, nie rzucaj całego postanowienia w poczuciu porażki. Po prostu odłóż urządzenie, podziękuj Bogu za Jego cierpliwość i spokojnie wróć do obranej granicy.'
      ]
    }
  ],
  conclusion: 'Czy „wielki post internetowy” przed świętami ma sens i jak naprawdę odzyskać swoją uwagę? Ma głęboki sens pod jednym warunkiem: że nie uczynimy z niego kolejnego popisu silnej woli ani religijnego konkursu, lecz potraktujemy go jako spokojne, ciche „odkupienie czasu” (Ef 5:16 UBG). Nie sprawi to, że znikną wszystkie przedświąteczne obowiązki czy codzienne troski, a technologia nadal pozostanie częścią naszej pracy i komunikacji. Jednak świadome wyciszenie zbędnego szumu otwiera przestrzeń, w której znów wyraźnie słyszymy głos Boga w Jego Słowie oraz dostrzegamy ludzi, których Pan postawił najbliżej naszego serca.',
  cta: 'Zanim nadejdzie grudniowy pośpiech, zatrzymaj się dziś na pięć minut w ciszy i spójrz na czas ekranowy w swoim telefonie nie z oskarżeniem, lecz z trzeźwą uczciwością. Wybierz jeden z pięciu kroków na najbliższy tydzień i powierz tę decyzję Bogu w krótkiej modlitwie:\n\n„Panie Boże Wszechmogący, Dawco czasu i wszelkiego dobra, dziękuję Ci za dar życia, bliskich i mądre narzędzia, którymi możemy się posługiwać w tym świecie. Wyznaję przed Tobą, jak łatwo moja uwaga rozprasza się w zgiełku ekranów, pośpiechu i zbędnych informacji. Naucz mnie mądrze odkupować czas, chronić serce przed marnością i w ciszy szukać przede wszystkim Twojego Królestwa. Uczyń mój dom miejscem prawdziwej obecności, pokoju i życzliwej rozmowy przed nadchodzącymi świętami. Przez Jezusa Chrystusa, naszego Pana i Zbawiciela. Amen.”\n\n[Status redakcyjny: Do autoryzacji autora i akceptacji wydawcy]',
  sources: [
    {
      name: 'Pew Research Center — „Teens, Social Media and Technology 2024” (Michelle Faverio, Olivia Sidoti; opublikowany 12 grudnia 2024 r., próba 1391 nastolatków w wieku 13–17 lat)',
      url: 'https://www.pewresearch.org/internet/2024/12/12/teens-social-media-and-technology-2024/'
    },
    {
      name: 'Światowa Organizacja Zdrowia (WHO Regional Office for Europe) — „Teens, screens and mental health” (raport z badania HBSC na grupie blisko 280 000 młodych osób w 44 krajach, opublikowany 25 września 2024 r.)',
      url: 'https://www.who.int/europe/news/item/25-09-2024-teens--screens-and-mental-health'
    },
    {
      name: 'JAMA Network Open — Calvert E., Torous J. i wsp., „Social Media Detox and Youth Mental Health” (badanie kohortowe 373 uczestników, Beth Israel Deaconess Medical Center & University of Bath, 24 listopada 2025 r., DOI: 10.1001/jamanetworkopen.2025.45245)',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12645342/'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — List do Efezjan 2:8–10; 5:15–17; Ewangelia według św. Mateusza 6:16–21; Ewangelia według św. Marka 1:35; 1 List do Koryntian 6:12; 9:25; Księga Psalmów 46:10; 119:37; List do Filipian 4:6–8',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek & Hebrew Concordance (słownik interlinearny MojaBiblia CC) — Hasła: G1805 (exagorazō — wykupić, odkupić), G2540 (kairos — właściwy, wyznaczony czas), G3522 (nēsteuō — pościć), G1467 (egkrateuomai — powściągać się, ćwiczyć panowanie nad sobą), H7503 (raphah — uciszyć się, zaprzestać szamotania)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady o Piśmie Świętym jako najwyższym autorytecie (Sola Scriptura), zbawieniu z łaski przez wiarę (Sola Gratia) i chrześcijańskim szafarstwie czasem',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'List do Efezjan 5:15–17 („Uważajcie więc, żebyście postępowali rozważnie, nie jak niemądrzy, ale jak mądrzy; Odkupując czas, bo dni są złe. Dlatego nie bądźcie nierozumnymi, ale rozumiejcie, jaka jest wola Pana”); Ewangelia według św. Mateusza 6:21 („Gdzie bowiem jest wasz skarb, tam będzie i wasze serce”); 1 List do Koryntian 6:12 („Wszystko mi wolno, ale ja nie dam się niczemu zniewolić”); List do Filipian 4:6–8; List do Efezjan 2:8–10 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-wielki-post-internetowy-jak-odzyskac-uwage-przed-swietami.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Otwarta Biblia w ciepłym popołudniowym świetle późnej jesieni, skórzany notatnik z piórem, parujący kubek herbaty oraz wyciszony smartfon odłożony ekranem do dołu — symbol świadomego odzyskania uwagi i spokoju przed świętami.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#WielkiPostInternetowy',
    '#DetoksCyfrowy',
    '#Uwaga',
    '#eM',
    '#CCNNews',
    '#EkoCC',
    '#EkoCC365',
    '#OdkupujacCzas',
    '#BibliaUBG',
    '#PrzedSwietami'
  ],
  seo: {
    title: 'Wielki post internetowy? Jak odzyskać uwagę przed świętami',
    description: 'Czy wielki post internetowy ma sens? Sprawdź badania Pew, WHO i JAMA oraz biblijny plan odzyskania uwagi i pokoju przed świętami (Ef 5:16 UBG).',
    keywords: [
      'wielki post internetowy',
      'detoks cyfrowy chrześcijaństwo',
      'jak odzyskać uwagę przed świętami',
      'odkupując czas Ef 5:16',
      'Mateusza 6 post w ukryciu',
      'higiena cyfrowa Biblia',
      'smartfon a modlitwa',
      'Pew Research WHO JAMA social media',
      'Cezary Rogowski',
      'eM Christian Culture',
      'EkoCC'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 14: 2026-11-17)...');
  console.log('Tytuł:', articleData.title);
  console.log('Portal:', articleData.portal);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  // Zapisz aktualne dane artykułu do pliku roboczego dla package-ekocc-article.mjs
  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${currentJsonPath}`);

  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: Do autoryzacji autora i akceptacji wydawcy (Bramka T4 / L0)');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');

  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd podczas przygotowywania artykułu:', err);
    process.exit(1);
  });
}
