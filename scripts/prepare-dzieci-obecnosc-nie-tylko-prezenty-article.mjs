import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'ANALIZA RODZINNO-BIBLIJNA',
  title: 'Dlaczego dzieci potrzebują obecności, nie tylko prezentów?',
  slug: 'dlaczego-dzieci-potrzebuja-obecnosci-nie-tylko-prezentow',
  author: 'Cezary Rogowski',
  date: '2026-11-21',
  lead: 'W drugiej połowie listopada sklepowe witryny i internetowe koszyki zaczynają podpowiadać rodzicom prosty skrót: im bogatszy prezent, tym wyraźniejszy dowód miłości. Zmęczeni tempem pracy dorośli często sięgają po kolejne upominki z najszczerszej troski, chcąc wynagrodzić dzieciom zabiegany tydzień albo wywołać szybki uśmiech. Tymczasem zarówno rzetelne badania z psychologii rozwojowej i socjologii rodziny, jak i Pismo Święte pokazują spójną prawdę: podarunki mają swoje dobre miejsce, lecz żaden przedmiot nie zastąpi uważnej obecności dorosłego, w której dziecko uczy się bezpieczeństwa, własnej wartości i Bożej miłości.',
  sections: [
    {
      heading: '1. PUŁAPKA „WYCHOWANIA PRZEZ PREZENTY”: CO MÓWIĄ BADANIA O MATERIALIZMIE I ZAANGAŻOWANYM CZASIE',
      paragraphs: [
        'Aby nie popaść w łatwe moralizowanie ani poczucie winy, zacznijmy od twardych ustaleń naukowych, oddzielając fakty empiryczne od refleksji teologicznej. W głośnym badaniu opublikowanym w „Journal of Consumer Research” (2015, t. 41, nr 6, s. 1333–1357; DOI: 10.1086/680087) badaczki Marsha L. Richins i Lan Nguyen Chaplin przeanalizowały zjawisko określane jako „material parenting” — czyli wychowanie, w którym rodzice używają dóbr materialnych do wyrażania uczuć, nagradzania osiągnięć lub karania poprzez odbieranie rzeczy.',
        'Wynik okazał się niezwykle ważny właśnie dla kochających domów: nawet bardzo ciepli i wspierający rodzice mogą całkowicie nieświadomie wzmacniać w dzieciach postawy materialistyczne utrzymujące się w dorosłości, jeśli regularnie zamieniają czułość, świętowanie sukcesu albo przeprosiny w kolejny zakup. Dziecko uczy się wtedy wewnętrznego równania: „jestem ważny i zasługuję na miłość wtedy, gdy dostaję coś wartościowego”. Badaczki nie potępiają samego dawania prezentów z okazji świąt czy urodzin ani nie przypisują rodzicom złych intencji — wskazują jedynie na ryzyko sytuacji, w której rzecz staje się głównym językiem bliskości.',
        'Równie trzeźwe i uwalniające światło rzuca badanie socjologiczne Melissy A. Milkie, Kei M. Nomaguchi i Kathleen E. Denny opublikowane w „Journal of Marriage and Family” (2015, t. 77, nr 2, s. 355–372; DOI: 10.1111/jomf.12170). Analizując dzienniczki czasu rodzin z panelu PSID-CDS, autorki wykazały, że sama ogólna liczba godzin spędzanych biernie obok dziecka w wieku 3–11 lat (tzw. czas dostępności) nie była decydującym czynnikiem dla wyników emocjonalnych czy szkolnych. Co innego jednak pokazała obserwacja dorastania (12–18 lat): kluczowy okazał się aktywnie zaangażowany czas (engaged time), szczególnie wtedy, gdy matka i ojciec spędzali go z nastolatkiem wspólnie. Taki uważny, zaangażowany kontakt wiązał się z mniejszą liczbą zachowań ryzykownych i lepszym funkcjonowaniem młodzieży. Dla zapracowanych rodziców to dobra wiadomość: nie chodzi o perfekcyjne „wiszenie nad dzieckiem” przez dwanaście godzin na dobę, lecz o autentyczną uwagę wtedy, gdy jesteśmy razem.'
      ]
    },
    {
      heading: '2. BEZPIECZNA WIĘŹ RODZI SIĘ W RELACJI, NIE W PUDEŁKU: PERSPEKTYWA PSYCHOLOGII ROZWOJOWEJ',
      paragraphs: [
        'Dlaczego nawet najdroższa zabawka lub nowoczesny gadżet po kilku dniach lądują w kącie pokoju, a dziecko znów ciągnie rodzica za rękaw? Odpowiedzi dostarcza teoria przywiązania zapoczątkowana przez Johna Bowlby’ego i Mary Ainsworth oraz wielka metaanaliza Marianne S. de Wolff i Marinusa H. van IJzendoorna opublikowana w „Child Development” (1997, t. 68, nr 4, s. 571–591; DOI: 10.1111/j.1467-8624.1997.tb04218.x). Przegląd 66 badań (N = 4176) potwierdził wiarygodny związek między wrażliwą responsywnością opiekuna a bezpiecznym stylem przywiązania dziecka (w podgrupie 21 badań na próbach nieklinicznych ocenianych procedurą Obcej Sytuacji łączna wielkość efektu wyniosła r = 0,24).',
        'Co szczególnie istotne, badacze zauważyli, że nie chodzi wyłącznie o jedną izolowaną cechę, lecz o cały zespół codziennych zachowań: dostrzeganie sygnałów dziecka, adekwatną i terminową odpowiedź, wzajemność oraz wprowadzanie spokojnej struktury. Żaden przedmiot nie potrafi odpowiedzieć na zmęczenie dziecka, nie zapyta, dlaczego w szkole było dziś smutno, i nie pomoże wyregulować rozbieganego serca po trudnym dniu. Prezent może sprawić krótką przyjemność zmysłową, ale to twarz, głos i cierpliwe uszy dorosłego wysyłają układowi nerwowemu dziecka sygnał: „Jesteś bezpieczny, widziany i ważniejszy niż moje sprawy”.',
        'Warto przy tym mocno podkreślić sprawiedliwość wobec rodziców: trudności w znalezieniu czasu przy dwóch etatach, dojazdach i domowych obowiązkach nie czynią nikogo „toksycznym rodzicem”. W kulturze pośpiechu dorośli sami często żyją na granicy wyczerpania. Rozpoznanie, że prezent nie zastąpi spotkania, nie ma służyć biczowaniu sumień, lecz uwolnieniu nas od kosztownej presji kupowania — tak, aby odzyskać przestrzeń na zwykłą, spokojną bliskość.'
      ]
    },
    {
      heading: '3. EGZEGEZA BIBLIJNA: STÓŁ PEŁEN MIŁOŚCI I SŁOWO „SZANAN” W CODZIENNOŚCI (PWT 6:6–7; PRZYP 15:17; 17:1 UBG)',
      paragraphs: [
        'Przechodząc z płaszczyzny badań naukowych do komentarza biblijno-teologicznego, zauważamy niezwykłą spójność Objawienia z tym, jak Bóg zaprojektował ludzkie serce. Najważniejszy starotestamentowy tekst o wychowaniu pochodzi z Księgi Powtórzonego Prawa — pożegnalnej mowy przymierza wygłoszonej przez Mojżesza na równinach Moabu tuż przed wejściem Izraela do ziemi Kanaan. Bezpośrednio po uroczystym wyznaniu wiary Szema („Słuchaj, Izraelu...”, Pwt 6:4–5 UBG) Pismo Święte nie nakazuje organizowania kosztownych widowisk dla najmłodszych, lecz wzywa do wiernej, codziennej obecności: „A te słowa, które ja dziś nakazuję tobie, będą w twoim sercu; I będziesz je często przypominał swoim synom i rozmawiał o nich, przebywając w swoim domu, idąc drogą, kładąc się i wstając” (Pwt 6:6–7 UBG).',
        'Hebrajski czasownik przetłumaczony tu jako „często przypominał” to שָׁנַן (szanan, Strong H8150), którego pierwotny rdzeń oznacza „ostrzyć” lub „wygładzać na osełce” (w intensywnej formie Piel — cierpliwie i starannie wgrywać prawdę w pamięć i serce). Obrazy dobrane przez natchnionego autora są uderzająco zwyczajne: dom, wspólna droga, wieczorne kładzenie się spać i poranne wstawanie. Najtrwalsza formacja wiary i poczucia przynależności dokonuje się przy okazji codziennych rozmów, w których dziecko widzi spójność słowa i życia rodzica.',
        'Ten sam priorytet relacji nad materialnym przepychem wybrzmiewa w poetyckim paralelizmie antytetycznym Księgi Przypowieści Salomona (hebr. meszalim — krótkich sentencji mądrościowych budowanych na wyrazistym kontraście). Czytamy w nich: „Lepsza jest potrawa z jarzyn, gdzie miłość, niż tuczny wół, gdzie panuje nienawiść” (Przyp 15:17 UBG) oraz „Lepszy jest kęs suchego chleba, a przy tym spokój, niż dom pełen bydła ofiarnego z kłótnią” (Przyp 17:1 UBG). W świecie starożytnego Bliskiego Wschodu tuczny wół i mięso ofiarne były szczytem zamożności i święta. Pismo Święte mówi wprost: prosty posiłek w atmosferze miłości i pokoju ma większą wartość duchową i wychowawczą niż wystawny stół pozbawiony życzliwej obecności.'
      ]
    },
    {
      heading: '4. JEZUS I APOSTOŁ PAWEŁ O DARZE Z SAMEGO SIEBIE (MK 10:13–16; ŁK 15:20, 31; 1 TES 2:7–8 UBG)',
      paragraphs: [
        'W Ewangeliach ten Boży porządek wartości zostaje ukazany w osobie samego Jezusa Chrystusa. Ewangelista Marek — piszący dla odbiorców w świecie grecko-rzymskim, w którym dzieci nie miały wysokiej pozycji społecznej — opisuje moment, gdy dorośli przynosili najmłodszych do Nauczyciela, a uczniowie chcieli ich odprawić, uznając zapewne, że Zbawiciel ma pilniejsze zadania. Reakcja Jezusa była jednoznaczna: „Gdy Jezus to zobaczył, oburzył się i powiedział do nich: Pozwólcie dzieciom przychodzić do mnie i nie zabraniajcie im. Do takich bowiem należy królestwo Boże. Zaprawdę powiadam wam: Kto nie przyjmie królestwa Bożego jak dziecko, nie wejdzie do niego. I brał je na ręce, a kładąc na nie ręce, błogosławił je” (Mk 10:14–16 UBG).',
        'W oryginale greckim pojawia się tu niezwykle czuły czasownik ἐναγκαλίζομαι (enagkalizomai, Strong G1723 — „wziąć w zgięcie ramion, przygarnąć i objąć”), użyty w całym Nowym Testamencie wyłącznie przez Marka (Mk 9:36; 10:16). Chrystus nie rzucił dzieciom zdawkowego pozdrowienia z daleka ani nie delegował pomocnika — zatrzymał pochód dorosłych, pochylił się, przytulił je i poświęcił im swoją pełną, niepodzielną uwagę. Równie głęboko rysuje serce Boga przypowieść z 15. rozdziału Ewangelii Łukasza: ojciec wybiega naprzeciw wracającemu synowi, pada mu na szyję i całuje go (Łk 15:20 UBG), a starszemu synowi przypomina istotę dziedzictwa: „Synu, ty zawsze jesteś ze mną i wszystkie moje dobra należą do ciebie” (Łk 15:31 UBG). Nawet gdy w Kazaniu na Górze Jezus mówi o ziemskich ojcach umiejących dawać dobre dary (Mt 7:9–11 UBG), najwyższym darem Ojca Niebieskiego nie są same rzeczy, lecz Jego własna obecność i społeczność z człowiekiem.',
        'W ślad za tym wzorem idzie apostoł Paweł w Pierwszym Liście do Tesaloniczan — jednym z najwcześniejszych pism Nowego Testamentu (powstałym ok. 50–51 r. po Chr. w Koryncie). Opisując swoją duchową opiekę nad młodym zborem, używa jednocześnie obrazu matki i ojca: „Byliśmy jednak wśród was łagodni jak karmicielka troszcząca się o swoje dzieci. Darzyliśmy was taką życzliwością, że gotowi byliśmy użyczyć wam nie tylko ewangelii Boga, ale i naszych dusz, bo staliście się nam drodzy” (1 Tes 2:7–8 UBG), dodając dalej: „jak ojciec swoje dzieci, zachęcaliśmy i pocieszaliśmy, i zaklinaliśmy; Abyście postępowali w sposób godny Boga” (1 Tes 2:11–12 UBG). Grecki czasownik μεταδίδωμι (metadidōmi, Strong G3330 — „udzielić części z tego, co własne”) połączony ze słowem ψυχή (psychē, Strong G5590 — „dusza, własne życie”) pokazuje sedno rodzicielstwa: dać dziecku prezent to łatwa transakcja; oddać mu kawałek własnego czasu, uwagi i życia — to miłość w czynie (1 J 3:18 UBG).',
        'W duchu 28 Zasad Wiary Kościoła Bożego (Zasady 10, 11 i 23) warto zarazem pamiętać o uwalniającej równowadze między łaską, wiarą i odpowiedzialnością. Zbawienie jest bezinteresownym darem Bożej łaski przez wiarę w Jezusa Chrystusa, a nie nagrodą za bezbłędne rodzicielstwo („Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił” — Ef 2:8–9 UBG). Ta sama łaska nie zwalnia nas jednak z codziennej troski, lecz uzdalnia, by wychowywać dzieci „w karności i w napominaniu Pana” (Ef 6:4 UBG — gr. paideia, Strong G3809 oraz nouthesia, Strong G3559), z sercem wolnym od pośpiechu i gniewu.'
      ]
    },
    {
      heading: '5. JAK ZASTĄPIĆ „WYŚCIG NA PREZENTY” PRAWDZIWĄ BLISKOŚCIĄ? 5 KONKRETNYCH KROKÓW DLA RODZICÓW',
      paragraphs: [
        'Nadchodzący czas przedświątecznych promocji, Mikołajek i końca roku to najlepszy moment, aby świadomie odwrócić kolejność w domu: najpierw człowiek, potem upominek. Redakcja Christian Culture przygotowała pięć prostych, realistycznych kroków możliwych do wdrożenia bez dodatkowych kosztów:',
        '1. Oddziel prezent od dowodu miłości i nagrody za posłuszeństwo (Richins i Chaplin, 2015; Pwt 6:7 UBG). Drobny czy świąteczny upominek ma cieszyć jako bezinteresowny znak serdeczności, ale nie powinien być łapówką za spokój, nagrodą za każdą ocenę ani lekarstwem na wyrzuty sumienia po pracowitym tygodniu. Zamiast „kupię ci coś, tylko daj mi skończyć”, powiedz uczciwie: „Potrzebuję jeszcze piętnastu minut na dokończenie pracy, a o 18:00 jestem tylko dla ciebie”.',
        '2. Zaplanuj codziennie choćby 15–20 minut aktywnie zaangażowanej uwagi bez ekranów (Milkie i in., 2015; Mk 10:16 UBG). Badania pokazują, że nie wygrywa rodzic, który bezustannie kontroluje plan dnia dziecka, lecz ten, kto potrafi odłożyć telefon do innego pokoju i naprawdę wejść w świat syna lub córki: usiąść na dywanie przy drewnianych klockach, zagrać w planszówkę, wyjść na krótki spacer albo po prostu porozmawiać z nastolatkiem o jego dniu bez przerywania i wykładu.',
        '3. Twórzcie wspólne chwile obojga rodziców z dorastającymi dziećmi (Milkie i in., 2015; 1 Tes 2:11–12 UBG). Gdy dziecko staje się nastolatkiem, rzadziej prosi o przytulenie, co bywa mylnie odczytywane jako brak potrzeby bliskości. Wspólny sobotni obiad, wieczorna herbata czy wyjazd, w którym uczestniczą oboje rodzice, pozostaje jednym z najsilniejszych filarów chroniących młodzież przed zagubieniem.',
        '4. Ćwicz „wrażliwą responsywność” na małe sygnały w ciągu zwykłego dnia (De Wolff i van IJzendoorn, 1997; 1 J 3:18 UBG). Kiedy dziecko woła: „Zobacz, co narysowałem!” albo nastolatek rzuca półsłówkiem uwagę o trudnej sytuacji w klasie, te kilkadziesiąt sekund żywego zainteresowania buduje bezpieczną więź skuteczniej niż najdroższa konsola rozpakowana raz w roku.',
        '5. Zastąp część wydatków rodzinnymi rytuałami, które zostają w pamięci (Przyp 15:17; 17:1 UBG). Wspólne pieczenie prostego ciasta, czytanie rozdziału Biblii lub dobrej książki przed snem, wieczorne podziękowanie Bogu za jedną dobrą rzecz z mijającego dnia — to prezenty, których nie da się zepsuć ani odłożyć na półkę. A jeśli jako rodzic czujesz przytłoczenie lub bezradność w natłoku obowiązków, nie wahaj się prosić o wsparcie współmałżonka, dziadków, dojrzałej wspólnoty w zborze czy certyfikowanego doradcy rodzinnego. Mądra prośba o pomoc jest troską o dom, nigdy porażką.'
      ]
    }
  ],
  conclusion: 'Prezenty potrafią wywołać szczery uśmiech i są pięknym elementem rodzinnego świętowania, lecz nie zostały stworzone do udźwignięcia ciężaru ludzkiego serca. Zarówno badania nad materializmem i rozwojem bezpiecznej więzi, jak i Słowo Boże (Pwt 6:6–7; Przyp 15:17; Mk 10:14–16; 1 Tes 2:8 UBG) przypominają o tym samym fundamencie: dziecko potrzebuje przede wszystkim rodzica, który patrzy mu w oczy, słucha bez pośpiechu i dzieli się z nim własnym czasem. Kiedy dom staje się miejscem spokojnej obecności zakorzenionej w łasce Jezusa Chrystusa, nawet skromny podarunek nabiera prawdziwego blasku.',
  cta: 'Zatrzymaj się w ten weekend choćby na pół godziny z daleka od telefonu i listy zakupów. Usiądź przy swoim dziecku lub zadzwoń do dorosłego syna czy córki nie po to, by zapytać o obowiązki albo listę życzeń, ale by pobyć razem, wysłuchać i okazać życzliwość. Możesz też powierzyć swoją rodzinę Bogu w krótkiej modlitwie:\n\n„Panie Boże, dobry Ojcze w niebie, dziękujemy Ci, że nie kochasz nas z dystansu, lecz przychodzisz do nas ze swoją obecnością i łaską w Jezusie Chrystusie. Strzeż naszych domów przed pośpiechem, który każe nam zastępować relację rzeczami i wydatkami. Daj nam wrażliwe oczy, cierpliwe uszy i mądre serca, aby nasze dzieci czuły się przy nas widziane, bezpieczne i bezwarunkowo kochane — w codziennych rozmowach przy stole, w drodze i przed snem. Naucz nas kochać nie tylko słowem, ale czynem, czasem i prawdą. Amen.”\n\n[Status redakcyjny: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4. Proponowany portal docelowy: EkoCC — rodzina i relacje (propozycja kanoniczna /news lub dedykowany dział rodzinny — dokładny URL do potwierdzenia przez wydawcę)]',
  sources: [
    {
      name: 'Richins M. L., Chaplin L. N. — „Material Parenting: How the Use of Goods in Parenting Fosters Materialism in the Next Generation”, Journal of Consumer Research, 2015, Vol. 41(6), s. 1333–1357',
      url: 'https://doi.org/10.1086/680087'
    },
    {
      name: 'Milkie M. A., Nomaguchi K. M., Denny K. E. — „Does the Amount of Time Mothers Spend With Children or Adolescents Matter?”, Journal of Marriage and Family, 2015, Vol. 77(2), s. 355–372',
      url: 'https://doi.org/10.1111/jomf.12170'
    },
    {
      name: 'De Wolff M. S., van IJzendoorn M. H. — „Sensitivity and Attachment: A Meta-Analysis on Parental Antecedents of Infant Attachment”, Child Development, 1997, Vol. 68(4), s. 571–591',
      url: 'https://doi.org/10.1111/j.1467-8624.1997.tb04218.x'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Księga Powtórzonego Prawa 6:4–7; Księga Przypowieści Salomona 15:17; 17:1; Ewangelia według św. Mateusza 7:9–11; Ewangelia według św. Marka 10:13–16; Ewangelia według św. Łukasza 15:20, 31; 1 List do Tesaloniczan 2:7–8, 11–12; List do Efezjan 2:8–9; 6:4; 1 List Jana 3:18',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong’s Hebrew & Greek Concordance (słownik interlinearny MojaBiblia CC) — Hasła: H8150 (shanan — ostrzyć, pilnie wpajać w codzienności), G1723 (enagkalizomai — wziąć w ramiona, objąć), G3330 (metadidōmi — udzielić z własnego życia), G5590 (psychē — dusza, życie), G3809 (paideia — wychowanie), G3559 (nouthesia — napominanie)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady 10 (Zbawienie z łaski przez wiarę), 11 (Wzrost w Chrystusie) oraz 23 (Małżeństwo i rodzina)',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Księga Powtórzonego Prawa 6:6–7 („I będziesz je często przypominał swoim synom i rozmawiał o nich, przebywając w swoim domu, idąc drogą, kładąc się i wstając”); Księga Przypowieści Salomona 15:17 („Lepsza jest potrawa z jarzyn, gdzie miłość, niż tuczny wół, gdzie panuje nienawiść”); 17:1; Ewangelia według św. Marka 10:14–16 („I brał je na ręce, a kładąc na nie ręce, błogosławił je”); Ewangelia według św. Łukasza 15:20, 31; 1 List do Tesaloniczan 2:7–8 („gotowi byliśmy użyczyć wam nie tylko ewangelii Boga, ale i naszych dusz”); List do Efezjan 2:8–9; 6:4; 1 List Jana 3:18 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-dlaczego-dzieci-potrzebuja-obecnosci-nie-tylko-prezentow.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Rodzice siedzący razem z około siedmioletnim dzieckiem na dywanie w salonie w ciepłym popołudniowym świetle i wspólnie układający drewniane klocki, podczas gdy na bocznym stoliku leży nietknięte, skromnie zapakowane pudełko prezentowe — obraz uważnej obecności cenniejszej niż same upominki.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#Rodzina',
    '#ObecnoscNiePrezenty',
    '#WychowaniePoBozemu',
    '#RelacjeRodzinne',
    '#EkoCC',
    '#EkoCC365',
    '#BibliaUBG',
    '#CCNNews'
  ],
  seo: {
    title: 'Dlaczego dzieci potrzebują obecności, nie tylko prezentów?',
    description: 'Co badania (Richins i Chaplin, Milkie, De Wolff) i Biblia UBG (Pwt 6:7, Mk 10:16, 1 Tes 2:8) mówią o obecności rodziców ważniejszej niż drogie prezenty.',
    keywords: [
      'dlaczego dzieci potrzebuja obecnosci nie prezentow',
      'wychowanie bez materializmu badania',
      'material parenting Richins Chaplin',
      'zaangazowany czas rodzicow Milkie',
      'bezpieczne przywiazanie De Wolff van IJzendoorn',
      'Powtorzonego Prawa 6:7 wychowanie',
      'Marka 10:16 Jezus i dzieci',
      '1 Tesaloniczan 2:8 oddac dusze',
      'Cezary Rogowski',
      'Christian Culture EkoCC'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 18: 2026-11-21 — Temat sezonowy / uzupełniający)...');
  console.log('Tytuł:', articleData.title);
  console.log('Meta title length:', articleData.seo.title.length, '| Meta description length:', articleData.seo.description.length);
  console.log('Dział kalendarza: RODZINA | Priorytet: B | Portal roboczy:', articleData.portal);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${currentJsonPath}`);

  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
