import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'ANALIZA',
  title: 'Telefon milczy od tygodni: jak zauważyć samotnego sąsiada?',
  slug: 'telefon-milczy-od-tygodni-jak-zauwazyc-samotnego-sasiada',
  author: 'Cezary Rogowski',
  date: '2026-11-07',
  lead: 'W epoce wszechobecnej łączności cyfrowej i setek wirtualnych powiadomień najcichszy dramat współczesnego społeczeństwa rozgrywa się tuż za ścianą naszych mieszkań. Tysiące osób starszych, schorowanych i opuszczonych spędza kolejne dni w całkowitej ciszy, czekając na dźwięk dzwonka do drzwi lub choćby jedno życzliwe pytanie: „Czy wszystko w porządku?”. Pismo Święte, raporty socjologiczne oraz twarde dane medyczne ostrzegają: obojętność wobec sąsiada jest nie tylko kryzysem wspólnoty, ale bezpośrednim zagrożeniem życia, na które chrześcijańska odpowiedzialność nakazuje odpowiedzieć natychmiastowym i konkretnym działaniem.',
  sections: [
    {
      heading: '1. CICHA EPIDEMIA ZA ŚCIANĄ: CO MÓWIĄ TWARDE DANE O SAMOTNOŚCI W POLSCE',
      paragraphs: [
        'Zjawisko izolacji społecznej przestało być w Polsce incydentalnym problemem marginesu, stając się jednym z najpoważniejszych wyzwań demograficznych i cywilizacyjnych. Według oficjalnych danych Głównego Urzędu Statystycznego (GUS) z Narodowego Spisu Powszechnego w polskich miastach już ponad 38% gospodarstw domowych to gospodarstwa jednoosobowe. Wśród osób powyżej 75. roku życia odsetek ten dynamicznie rośnie, przekraczając w wielu aglomeracjach próg 45%. Oznacza to, że setki tysięcy seniorów funkcjonuje na co dzień w niemal absolutnej próżni relacyjnej.',
        'Potwierdzają to pogłębione badania Instytutu Pokolenia zawarte w ogólnopolskim raporcie „Poczucie samotności w Polsce”. Wynika z nich jednoznacznie, że ponad 53% dorosłych Polaków doświadcza regularnego lub chronicznego osamotnienia, przy czym najgłębsza i najbardziej bolesna pustka dotyka seniorów oraz młodych ludzi wchodzących w dorosłość. Z kolei analizy Stowarzyszenia mali bracia Ubogich wskazują, że co trzeci polski senior po 80. roku życia nie ma ani jednej bliskiej osoby, z którą mógłby porozmawiać w ciągu całego tygodnia. W zanonimizowanych blokowiskach milczenie staje się normą, a brak obecności bywa zauważany dopiero wtedy, gdy dochodzi do nieodwracalnej tragedii.'
      ]
    },
    {
      heading: '2. BIOLOGIA I BIOETYKA IZOLACJI: DLACZEGO SAMOTNOŚĆ NISZCZY ZDROWIE',
      paragraphs: [
        'Współczesna medycyna i bioetyka nie traktują już samotności jedynie jako subiektywnego dyskomfortu emocjonalnego, lecz jako bezpośredni czynnik niszczący ludzki organizm. W przełomowym raporcie Światowej Organizacji Zdrowia (WHO) — opracowanym przez powołaną Commission on Social Connection — izolacja społeczna została uznana za globalny priorytet zdrowia publicznego. Eksperci WHO wykazali, że chroniczna samotność wywiera na śmiertelność wpływ porównywalny z wypalaniem 15 papierosów dziennie, przewyższając skutki zdrowotne otyłości czy braku aktywności fizycznej.',
        'Z punktu widzenia neurobiologii przedłużająca się izolacja wyzwala w ciele człowieka stałą reakcję alarmową typu „walcz lub uciekaj”. Badania Harvard Study of Adult Development oraz metaanalizy prof. Julianne Holt-Lunstad dowodzą, że brak więzi podnosi stężenie kortyzolu o ponad 40%, wywołując uogólniony przewlekły stan zapalny śródbłonka naczyniowego. Przekłada się to bezpośrednio na 29% wzrost ryzyka choroby wieńcowej serca oraz 32% wzrost ryzyka udaru mózgu. U seniorów izolacja przyspiesza procesy neurodegeneracyjne: ryzyko wystąpienia demencji wzrasta aż o 50%, a brak kontaktu z ludźmi gwałtownie osłabia motywację do regularnego przyjmowania leków i właściwego odżywiania.',
        'Z perspektywy chrześcijańskiej bioetyki fakty te mają fundamentalne znaczenie. Człowiek stworzony na obraz Boga Relacji nie jest autonomiczną jednostką zaprojektowaną do trwania w izolacji. Ochrona życia, o którą niestrudzenie apeluje Kościół, nie kończy się na obronie nienarodzonych, lecz obejmuje także troskę o godną, bezpieczną i otoczoną miłością jesień życia naszych sąsiadów.'
      ]
    },
    {
      heading: '3. KTO JEST MOIM BLIŹNIM? EGZEGEZA ŁK 10:29 I GRECKIEGO POJĘCIA SPLAGCHNIZOMAI',
      paragraphs: [
        'Kiedy pytamy o biblijne źródła odpowiedzialności za drugiego człowieka, fundamentem pozostaje przypowieść Jezusa o miłosiernym Samarytaninie z 10. rozdziału Ewangelii według św. Łukasza. Punktem wyjścia jest podchwytliwe pytanie znawcy Prawa Mojżeszowego: „A kto jest moim bliźnim?” (Łk 10:29 UBG). Prawnik dążył do kazuistycznego wyznaczenia wąskich granic obowiązku — pragnął zdefiniować, wobec kogo pomoc jest obligatoryjna, a kogo można minąć obojętnie bez wyrzutów sumienia.',
        'Odpowiedź Chrystusa uderza w samo sedno ludzkiego egoizmu. Jezus nie definiuje pasywnej grupy odbiorców, lecz pyta: „Kto z tych trzech okazał się bliźnim temu, który wpadł w ręce zbójców?” (Łk 10:36 UBG). Gdy kapłan i lewita — ludzie reprezentujący elitę religijną i świątynny kult — zobaczyli rannego, przeszli drugą stroną drogi. Natomiast pogardzany przez Żydów Samarytanin: „ujrzał go i ulitował się” (Łk 10:33 UBG). W tekście greckim użyto tu niezwykłego czasownika splagchnizomai (Strong G4697), pochodzącego od splanchna — wnętrzności. Oznacza to głębokie, trzewiowe wzruszenie, ból serca na widok cierpienia bliźniego, który nie pozwala przejść obojętnie.',
        'Samarytanin nie ograniczył się do współczucia w sferze uczuć: podszedł, opatrzył rany winem i oliwą, wsadził poszkodowanego na swoje bydlę, zawiózł do gospody i wyjął własne dwa denary, gwarantując dalsze koszty opieki. To jest właśnie biblijna miłość agape (Strong G26) — miłość, która kosztuje czas, energię i finanse. Jezus kończy tę naukę krótkim nakazem skierowanym do każdego z nas: „Idź i ty czyń podobnie” (Łk 10:37 UBG).'
      ]
    },
    {
      heading: '4. ROZDZIELENIE FAKTÓW OD INTERPRETACJI TEOLOGICZNEJ: DLACZEGO SPOŁECZEŃSTWO ZOBYTNIAŁO',
      paragraphs: [
        'Zgodnie ze standardem rzetelnej publicystyki EkoCC konieczne jest precyzyjne rozgraniczenie obiektywnych czynników socjologicznych od chrześcijańskiej interpretacji moralnej. Po stronie faktów socjologicznych na zjawisko osamotnienia składają się: masowa migracja młodych pokoleń do metropolii lub za granicę, rozpad wielopokoleniowych rodzin, zamykanie lokalnych punktów usługowych oraz cyfryzacja, która wyeliminowała naturalne okazje do rozmowy w osiedlowym sklepie czy na poczcie. To uwarunkowania strukturalne, które same w sobie nie wynikają ze złej woli konkretnych ludzi.',
        'Jednak po stronie interpretacji teologicznej Słowo Boże stawia przed nami o wiele głębszą diagnozę. Jezus Chrystus w mowie eschatologicznej na Górze Oliwnej ostrzegał przed duchowym zjawiskiem ostatnich czasów: „A ponieważ bezprawie się rozmnoży, miłość wielu oziębnie” (Mt 24:12 UBG). Użyty w tym miejscu grecki czasownik psycho (Strong G5594) oznacza dosłownie dmuchanie chłodnym wiatrem, stopniowe stygnięcie ognia i popadanie w duchowe zlodowacenie. Zobojętnienie na los człowieka żyjącego za ścianą to nie tylko efekt zabiegania, ale objaw duchowej choroby, w której własny komfort staje się bożkiem.',
        'Pismo Święte jednoznacznie klasyfikuje bierność jako ciężkie przewinienie etyczne: „Kto więc wie, jak czynić dobrze, a nie czyni, ten ma grzech” (Jk 4:17 UBG). Grzechem nie jest jedynie to, co uczyniliśmy złego w afekcie, lecz także to, czego zaniechaliśmy z lenistwa, lęku lub obojętności. Gdy starsza kobieta umiera w samotności w bloku zamieszkanym przez setki rodzin, jest to milczący akt oskarżenia wobec całej lokalnej społeczności.'
      ]
    },
    {
      heading: '5. BÓG OSADZA SAMOTNYCH W RODZINIE: ODPOWIEDZIALNOŚĆ KOŚCIOŁA I WSPÓLNOTY',
      paragraphs: [
        'Słowo Boże wielokrotnie odsłania tożsamość Najwyższego jako Tego, który nieustannie upomina się o bezbronnych i zapomnianych: „Ojcem sierot i obrońcą wdów jest Bóg w swoim świętym mieszkaniu. Bóg osadza samotnych w rodzinie...” (Ps 68:5–6 UBG). W tekście hebrajskim na określenie samotnego pojawia się termin jachid (Strong H3173) — oznaczający kogoś, kto został zupełnie sam, odcięty od korzeni i wsparcia. Bożą odpowiedzią na ból osamotnienia nie jest abstrakcyjna idea, lecz powołanie do życia wspólnoty ludzi wierzących, która staje się duchową rodziną dla tych, którzy rodziny nie mają.',
        'Apostoł Jakub w Liście do rozproszonych chrześcijan sformułował niezmienne kryterium weryfikacji autentyczności religijnej: „Czysta i nieskalana pobożność przed Bogiem i Ojcem polega na tym: nawiedzać sieroty i wdowy w ich ucisku i zachowywać samego siebie nieskalanym od świata” (Jk 1:27 UBG). W języku greckim słowo episkeptomai (Strong G1980) oznacza nie tyle kurtuazyjne odwiedziny, ile osobiste nawiedzenie w celu zbadania sytuacji, zatroszczenia się o zdrowie, opał, chleb i bezpieczeństwo. Wspólnota chrześcijańska, która posiada wspaniałe programy, profesjonalne nagłośnienie i emocjonalne uwielbienie, ale nie dostrzega głodnych i samotnych staruszków we własnym sąsiedztwie, według Pisma Świętego mija się z prawdziwą pobożnością.',
        'W Liście do Galacjan apostoł Paweł uzupełnia ten wymóg zwięzłą formułą: „Jedni drugich brzemiona noście, a tak wypełnicie prawo Chrystusa” (Gal 6:2 UBG). Ciężar (greckie baros, Strong G922) to brzemiona, których człowiek nie jest w stanie udźwignąć o własnych siłach: lęk przed bezradnością, ograniczenia ruchowe, brak środków na opał czy paraliżująca cisza czterech ścian. Chrześcijanin jest powołany, by ten ciężar podzielić.'
      ]
    },
    {
      heading: '6. PRAKTYCZNY PROTOKÓŁ CZUJNOŚCI: 5 PROSTYCH GESTÓW, KTÓRE MOGĄ OCALIĆ ŻYCIE',
      paragraphs: [
        'Przełamanie bariery obojętności nie wymaga nadzwyczajnych nakładów finansowych ani specjalistycznego wykształcenia. Wymaga natomiast czujności, empatii i elementarnej odwagi. Redakcja CCN News przygotowała praktyczny, bezpieczny i taktowny przewodnik sąsiedzkiej troski, możliwy do wdrożenia przez każdego z nas od zaraz:',
        '1. Obserwuj subtelne sygnały ostrzegawcze. Samotny człowiek rzadko wzywa pomocy przez okno. Zwróć uwagę na detale: czy skrzynka pocztowa nie jest przepełniona ulotkami od wielu dni? Czy pod wycieraczką nie leży nieodebrane pieczywo? Czy rolety w oknach są opuszczone w środku dnia, albo przeciwnie — czy światło w kuchni pali się nieprzerwanie przez drugą dobę? Każde odstępstwo od znanej rutyny sąsiada to sygnał do sprawdzenia sytuacji.',
        '2. Przełam barierę anonimowości przyjaznym gestem. Nie musisz od razu wchodzić do czyjegoś mieszkania. Wystarczy serdeczne: „Dzień dobry, panie Janie, mieszkam obok pod numerem dwunastym. Gdyby potrzebował pan chleba, mleka lub wykupienia leków w aptece, proszę dać znać — idę na zakupy”. Taki prosty komunikat zdejmuje ze starszej osoby paraliżujący lęk przed byciem ciężarem dla innych.',
        '3. Zostaw dużą kartkę z numerem telefonu. Seniorzy często mają trudności z zapamiętywaniem kontaktów w smartfonach. Napisz czarnym, grubym markerem na czystej kartce: „Sąsiad z naprzeciwka (Piotr, m. 14), tel. 500-XXX-XXX — proszę dzwonić o każdej porze, gdyby cokolwiek się działo”. Przyklej tę kartkę wewnątrz mieszkania sąsiada przy drzwiach lub połóż obok telefonu stacjonarnego.',
        '4. Wprowadź zasadę stałego pukania kontrolnego. Umów się z samotnym sąsiadem na stały, przewidywalny rytuał, na przykład: „Panie Tadeuszu, w każdy wtorek i piątek o 17:00 zapukam do drzwi na trzy sekundy, żeby wymienić dwa zdania i sprawdzić, czy wszystko gra”. Dla osoby opuszczonej taka stała obecność staje się emocjonalną kotwicą i gwarancją, że ktoś czuwa nad jej losem.',
        '5. Gdy coś budzi uzasadniony niepokój — reaguj stanowczo. Jeśli pukanie i telefon nie przynoszą odpowiedzi, a wyczuwasz nietypowy zapach, słyszysz dobiegające jęki lub telewizor grający głośno przez kilkadziesiąt godzin bez przerwy, nie odchodź z myślą: „może wyjechał”. Skontaktuj się z administratorem budynku, sąsiadami posiadającymi klucze lub zadzwoń pod numer alarmowy 112, zgłaszając podejrzenie zagrożenia życia i zdrowia osoby starszej. Lepiej wytłumaczyć się z niepotrzebnego wezwania służb, niż żyć z wyrzutem sumienia, że można było kogoś uratować.'
      ]
    }
  ],
  conclusion: 'Samotność za ścianą naszych mieszkań nie jest wyłącznie problemem społecznym czy statystyką w urzędowych tabelach. Jest bezpośrednim sprawdzianem naszej chrześcijańskiej tożsamości i człowieczeństwa. W świecie, który potrafi bez trudu wysłać satelitę w kosmos i prowadzić wideokonferencje na tysiące kilometrów, najtrudniejszą podróżą bywa przejście kilku kroków korytarza, by zapukać do sąsiada. Prawdziwa wiara w Chrystusa zstępuje w prozę codzienności: w zrobione zakupy, wymienioną żarówkę, podaną dłoń i życzliwą rozmowę, która przywraca drugiemu człowiekowi wiarę w to, że nie został opuszczony przez Boga i ludzi.',
  cta: 'Nie czekaj na kolejną głośną tragedię z pierwszych stron gazet. Już dzisiaj wyjdź na swoją klatkę schodową, rozejrzyj się po sąsiedztwie i zrób ten jeden krok w stronę człowieka, którego telefon milczy od tygodni. Zapraszamy do wspólnej modlitwy: „Panie Boże Wszechmogący, Stwórco i Ojcze wszelkiej pociechy, Ty znasz każdą łzę wylewaną w ukryciu i słyszysz ciszę opuszczonych mieszkań w naszych miastach i wsiach. Skrusz znieczulicę naszych serc i wyrwij nas z egoizmu własnego komfortu. Otwórz nasze oczy i uszy na wołanie samotnych sąsiadów. Daj nam odwagę, cierpliwość i miłość, abyśmy potrafili zapukać do ich drzwi, podać pomocną dłoń i stać się Twoimi wysłannikami pokoju i nadziei. Przez Jezusa Chrystusa, naszego Zbawiciela i Pana. Amen.”',
  sources: [
    { name: 'Główny Urząd Statystyczny (GUS) — Raport „Jakość życia osób starszych w Polsce” oraz dane Narodowego Spisu Powszechnego o gospodarstwach jednoosobowych', url: 'https://stat.gov.pl' },
    { name: 'Instytut Pokolenia — Raport badawczy „Poczucie samotności w Polsce: skala, uwarunkowania i konsekwencje społeczne”', url: 'https://instytutpokolenia.pl' },
    { name: 'Światowa Organizacja Zdrowia (WHO) — Raport „Commission on Social Connection: Social isolation and loneliness as global health priorities”', url: 'https://www.who.int' },
    { name: 'Harvard Study of Adult Development & dr Julianne Holt-Lunstad — Badania nad biologicznymi skutkami izolacji społecznej i relacji międzyludzkich', url: 'https://www.adultdevelopmentstudy.org' },
    { name: 'Uwspółcześniona Biblia Gdańska (UBG) — Księga Kapłańska 19:18; Ewangelia Łukasza 10:25–37; Księga Psalmów 68:5–6; List do Galacjan 6:2; List Jakuba 1:27; List Jakuba 4:17; Ewangelia Mateusza 24:12', url: 'https://polskieradio.cc/mojabiblia' },
    { name: 'Strong\'s Greek & Hebrew Concordance — Hasła: G4697 (splagchnizomai), G26 (agape), G1980 (episkeptomai), G922 (baros), G5594 (psycho), H7453 (rea), H3173 (jachid)', url: 'https://polskieradio.cc/mojabiblia' }
  ],
  scripture: 'Księga Kapłańska 19:18 („Będziesz miłował swego bliźniego jak samego siebie”); Ewangelia Łukasza 10:29–37 (Przypowieść o miłosiernym Samarytaninie, splagchnizomai); Księga Psalmów 68:5–6 („Bóg osadza samotnych w rodzinie”); List do Galacjan 6:2 („Jedni drugich brzemiona noście”); List Jakuba 1:27 („Nawiedzać sieroty i wdowy w ich ucisku”); List Jakuba 4:17; Ewangelia Mateusza 24:12 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-telefon-milczy-od-tygodni-jak-zauwazyc-samotnego-sasiada.jpg'),
  imageCaption: 'Ilustracja redakcyjna CCN News: Spokojny pokój w jesiennym świetle, milczący telefon na drewnianym stoliku i starsza osoba patrząca przez okno — symbol potrzeby sąsiedzkiej empatii, czujności i chrześcijańskiej solidarności.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#Samotność',
    '#Seniorzy',
    '#PomocSąsiedzka',
    '#MiłosiernySamarytanin',
    '#CCNNews',
    '#Bioetyka',
    '#UBG',
    '#EkoCC365'
  ],
  seo: {
    title: 'Telefon milczy od tygodni: jak zauważyć samotnego sąsiada? | CCN',
    description: 'Epidemia samotności za ścianą: dane GUS, raport WHO, bioetyka relacji i biblijny nakaz miłości bliźniego (Łk 10:29 UBG). 5 praktycznych gestów, które mogą ocalić życie.',
    keywords: [
      'samotny sąsiad pomoc',
      'telefon milczy od tygodni',
      'epidemia samotności w Polsce',
      'GUS osoby starsze samotność',
      'WHO samotność zdrowie publiczne',
      'miłosierny Samarytanin Łk 10 UBG',
      'jak zauważyć samotnego sąsiada',
      'opieka nad seniorami sąsiedzi',
      'Cezary Rogowski',
      'CCN News Christian Culture'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynam przygotowanie artykułu EkoCC (Slot 2026-11-07)...');
  console.log('Tytuł:', articleData.title);
  console.log('Grafika:', articleData.imagePath);

  const res = await packageEkoccArticle(articleData);
  console.log('\n🎉 Kompletny pakiet redakcyjny przygotowany pomyślnie!');
  console.log('ZIP:', res.zipPath);
  console.log('DOCX:', res.docxPath);
  console.log('TXT:', res.txtPath);
  console.log('SEO:', res.seoPath);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
