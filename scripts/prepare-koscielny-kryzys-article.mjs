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
  title: 'Czy w Kościele wolno mówić o własnym kryzysie?',
  slug: 'czy-w-kosciele-wolno-mowic-o-wlasnym-kryzysie',
  author: 'Cezary Rogowski',
  date: '2026-11-08',
  lead: 'Dla wielu chrześcijan niedzielne wejście do świątyni wiąże się z niewidzialnym przymusem przywdziania maski człowieka sukcesu, którego wiara jest niezłomna, a życie rodzinne nienaganne. Gdy jednak w zaciszu domowym uderza bezsilność, chroniczny lęk, kryzys małżeński, wypalenie czy wątpliwości wiary, pojawia się paraliżujące poczucie winy i strach przed odrzuceniem. Pismo Święte nie zna jednak kultu nieskazitelności — od psalmów lamentu, przez udrękę Getsemane, aż po teologię słabości apostoła Pawła, Boże Słowo uczy, że autentyczna wspólnota wiary ma być bezpiecznym szpitalem dla zranionych, a nie sceną religijnych pozorów.',
  sections: [
    {
      heading: '1. ILUZJA NIESKAZITELNOŚCI: DLACZEGO W NIEDZIELĘ TAK TRUDNO PRZYZNAĆ SIĘ DO BEZSILNOŚCI',
      paragraphs: [
        'Zjawisko religijnego zarządzania wizerunkiem (ang. impression management) to jeden z najczęstszych, choć rzadko nazywanych wprost problemów współczesnych wspólnot wiary. W wielu środowiskach wytworzyła się niepisana presja demonstrowania nieustannego triumfu duchowego. Zwykłe, niedzielne pytanie: „Co u ciebie słychać?” automatycznie wyzwala wyuczoną, bezpieczną odpowiedź: „Wszystko w porządku, chwała Bogu!”. Tymczasem za fasadą uśmiechu kryją się nierzadko miesiące bezsenności, rozpadające się więzi małżeńskie, lęk o przyszłość dzieci czy paraliżujące poczucie bezradności.',
        'W psychologii religii proces ten określany bywa mianem ucieczki w duchowość (ang. spiritual bypass). Polega on na próbie uśmierzania realnego, psychicznego i egzystencjalnego bólu powierzchownymi formułkami pobożnościowymi. Człowiek przeżywający trudności słyszy nierzadko od współbraci: „Musisz się po prostu więcej modlić”, „Widocznie twoja wiara jest za mała” albo „Czy na pewno wyznałeś każdy ukryty grzech?”. Takie reakcje, zamiast przynosić ulgę, stają się źródłem wtórnej traumy religijnej: cierpiący zaczyna wierzyć, że jego kryzys jest dowodem osobistego potępienia i odrzucenia przez Boga.',
        'Wieloletnie badania kliniczne prof. Kennetha Pargamenta z Bowling Green State University nad psychologią religijnego radzenia sobie ze stresem dowodzą, że tłumienie trudnych emocji i brak bezpiecznej przestrzeni do ujawnienia słabości we wspólnocie prowadzi do gwałtownego nasilenia stanów lękowych i depresyjnych. Chrześcijanin czuje się uwięziony w samotności pośród tłumu: otoczony setkami modlących się ludzi, nie ma ani jednej osoby, której mógłby w zaufaniu powiedzieć: „Nie daję już rady, pomóż mi”.'
      ]
    },
    {
      heading: '2. PISMO ŚWIĘTE NIE BOI SIĘ CIEMNOŚCI: AUTENTYCZNOŚĆ HIOBA, DAWIDA I PROROKÓW',
      paragraphs: [
        'Wbrew współczesnemu kultowi samowystarczalności i sukcesu, karty Pisma Świętego uderzają bezkompromisową szczerością wobec ludzkiego cierpienia. Biblia nie jest podręcznikiem taniego optymizmu, lecz zapisem autentycznego przymierza Boga z kruchym człowiekiem. Ponad jedna trzecia wszystkich psalmów to utwory lamentacyjne — pieśni bólu, wołania z otchłani i bezradności. Psalmista nie zaczyna modlitwy od teologicznego traktatu, lecz od surowego krzyku: „Z głębokości wołam do ciebie, PANIE” (Ps 130:1 UBG). Król Dawid, nazwany mężem według Bożego serca, nie wstydził się zapisać słów o swojej bezsilności: „Zmęczyłem się moim wzdychaniem, co noc płaczem oblewam moje łóżko, łzami skrapiam moje posłanie” (Ps 6:6 UBG).',
        'Najbardziej przejmującą lekcję w tej materii przynosi Księga Hioba. Cierpiący patriarcha, który w jednej chwili stracił rodzinę, majątek i zdrowie, doświadczył najgłębszego bólu nie ze strony wrogów, lecz ze strony trzech przyjaciół: Elifaza, Bildada i Sofara. Przybyli oni z gotowymi, sztywnymi dogmatami, usiłując logicznie dowieść, że skoro Hiob tak straszliwie cierpi, to musiał popełnić potajemny, ciężki grzech. Ich religijna ortodoksja okazała się całkowicie pozbawiona miłosierdzia. W finale księgi Bóg zaskakuje wszystkich: staje po stronie udręczonego, buntującego się i pytającego Hioba, a surowo napomina teologizujących przyjaciół: „Mój gniew zapłonął przeciwko tobie i przeciwko twoim dwom przyjaciołom, ponieważ nie mówiliście o mnie prawdy, jak mój sługa Hiob” (Hi 42:7 UBG). Szczery krzyk człowieka w ciemności jest w oczach Boga cenniejszy niż nieszczera, obronna mowa obrońców religijnego status quo.',
        'Podobnie prorok Eliasz w 1 Księdze Królewskiej po wyczerpującej konfrontacji na górze Karmel ucieka na pustynię pod krzak janowca i prosi Boga o śmierć: „Dosyć już, PANIE! Weź teraz moje życie...” (1 Krl 19:4 UBG). Reakcja Boga jest wstrząsająco czuła i wolna od moralizatorstwa: Pan nie robi prorokowi wymówek, nie oskarża go o brak wiary, lecz posyła anioła z pieczonym na węglach chlebem i dzbanem wody, dając mu dwukrotny odpoczynek snu, a dopiero po zaspokojeniu fizycznych i emocjonalnych potrzeb przemawia do niego w cichym, łagodnym powiewie.'
      ]
    },
    {
      heading: '3. JEZUS W GETSEMANE I APOSTOŁ PAWEŁ: TEOLOGIA CIERNIA W CIELE I MOC W SŁABOŚCI',
      paragraphs: [
        'Szczytem biblijnego objawienia godności ludzkiego zmagania jest postawa samego Jezusa Chrystusa w ogrodzie Getsemane. Wcielony Syn Boży w przededniu męki krzyżowej nie założył maski niewzruszonego heroizmu. Zabrał ze sobą Piotra, Jakuba i Jana, i odsłonił przed nimi najgłębszą trwogę swego serca: „Wtedy Jezus powiedział do nich: Smutna jest moja dusza aż do śmierci. Zostańcie tu i czuwajcie ze mną” (Mt 26:38 UBG). Zbawiciel świata prosił słabych, zawodnych ludzi o obecność i wsparcie w godzinie udręki. Jego pot spadający na ziemię niczym gęste krople krwi (Łk 22:44) uświęcił doświadczenie bezradności, dowodząc, że ból i trwoga nie są grzechem, lecz częścią naszego człowieczeństwa, którą Chrystus w pełni przyjął i odkupił.',
        'W pismach Nowego Testamentu najpełniejszą wykładnię autentyczności w kryzysie dał apostoł Paweł. W 2 Liście do Koryntian zmagał się on ze wspólnotą zafascynowaną tzw. „arcyapostołami” — wędrownymi mówcami, którzy imponowali tłumom elokwencją, sukcesami, manifestacjami siły i domniemaną bezgrzesznością. Paweł nie podjął jednak rywalizacji na sukcesy. Zamiast tego zszokował odbiorców, odsłaniając swój własny, bolesny kryzys — „cierń dla ciała” (gr. skolops te sarki, 2 Kor 12:7 UBG), który dręczył go i upokarzał.',
        'Trzykrotna modlitwa Pawła o odebranie cierpienia spotkała się z odpowiedzią Chrystusa, która na zawsze zburzyła fundamenty religijnego triumfalizmu: „Lecz powiedział mi: Wystarczy ci moja łaska. Moja moc bowiem doskonali się w słabości. Najchętniej więc będę się chlubił z moich słabości, aby zamieszkała we mnie moc Chrystusa” (2 Kor 12:9 UBG). Użyte tu greckie słowo astheneia (Strong G769) oznacza dosłownie niemoc, brak sił, chorobę i bezradność. Bóg nie potrzebuje naszej udawanej siły. Jego suwerenna moc objawia się z największą wyrazistością właśnie tam, gdzie człowiek dochodzi do kresu własnych możliwości i przestaje polegać na sobie.'
      ]
    },
    {
      heading: '4. ROZDZIELENIE FAKTÓW OD INTERPRETACJI TEOLOGICZNEJ: SPOŁECZNY KONFORMIZM A WSPÓLNOTA KRZYŻA',
      paragraphs: [
        'Rzetelna analiza problemu wymaga wyraźnego rozdzielenia obiektywnych faktów socjologicznych i psychologicznych od chrześcijańskiej interpretacji teologicznej. Po stronie faktów nauk społecznych, lęk przed ujawnieniem kryzysu w grupie wyznaniowej wynika ze zjawiska tzw. konformizmu normatywnego i obawy przed utratą statusu. Społeczności o wysokim poziomie spoistości i jasno określonych regułach moralnych podświadomie chronią swoją tożsamość grupową. Ujawnienie kryzysu — np. załamania psychicznego, zdrady, uzależnienia czy biedy — bywa przez grupę interpretowane jako zagrożenie dla jej dobrego imienia. Dochodzi wówczas do mechanizmu kozła ofiarnego lub obwiniania ofiary (ang. blaming the victim), co pozwala pozostałym członkom utrzymać iluzję własnego bezpieczeństwa: „Jemu to się przytrafiło, bo źle żył; mnie to nie spotka, bo jestem wierny”.',
        'Z punktu widzenia ortodoksyjnej teologii biblijnej taka postawa jest jednak duchowym bankructwem i zaprzeczeniem Ewangelii łaski. 28 Zasad Wiary przypomina, że człowiek zostaje usprawiedliwiony wyłącznie z darmo danej łaski przez wiarę w Jezusa Chrystusa, a nie na podstawie własnej nieskazitelności czy uczynków prawa (Ef 2:8–9 UBG). Kościół nie jest korporacją zadowolonych z siebie moralistów, lecz Ciałem Chrystusa, wspólnotą wzajemnej zależności i solidarności.',
        'Apostoł Paweł w Liście do Rzymian formułuje jasny, bezwarunkowy nakaz chrześcijańskiej relacyjności: „Radujcie się z tymi, którzy się radują, a płaczcie z tymi, którzy płaczą” (Rz 12:15 UBG). Płacz z płaczącymi nie jest opcją dla wybranych, lecz podstawowym obowiązkiem każdego ucznia Jezusa. Jeśli we wspólnocie jest miejsce wyłącznie na śpiew i manifestację radości, a brakuje przestrzeni na łzy i bezradność, to wspólnota ta minęła się z duchem Nowego Testamentu.'
      ]
    },
    {
      heading: '5. SPOWIEDŹ WZAJEMNA I NOSZENIE BRZEMION: EGZEGEZA JK 5:16 ORAZ GAL 6:2 W ORYGINALE GRECKIM',
      paragraphs: [
        'Klucz do uzdrowienia relacji we wspólnocie leży w powrocie do pierwotnego znaczenia dwóch fundamentalnych tekstów Nowego Testamentu. Pierwszym z nich jest napomnienie apostoła Jakuba: „Wyznawajcie sobie nawzajem upadki i módlcie się jedni za drugich, abyście byli uzdrowieni. Wiele może usilna modlitwa sprawiedliwego” (Jk 5:16 UBG). W tekście greckim występuje tu czasownik exomologeisthe (Strong G1843) — złożenie przyimka ek (na zewnątrz, do końca) oraz homologeo (zgadzać się, mówić to samo). Oznacza on otwarte, szczere, obustronne odsłonięcie prawdy przed braćmi. Jakub nie pisze o jednostronnym donosie czy instytucjonalnym przesłuchaniu, lecz o kulturze wzajemności (allelon).',
        'Co istotne, celem tej otwartości jest uzdrowienie: „abyście byli uzdrowieni” (gr. iathete, Strong G2390). Słowo to w Nowym Testamencie odnosi się nie tylko do usunięcia objawów fizycznych, lecz do całościowego uleczenia duszy, relacji i sumienia. Dopóki człowiek nosi swój kryzys i upadek w ciemności wstydu, dopóty rana gnije i zatruwa całe jego życie. Gdy w bezpiecznym środowisku braterskiej miłości prawda zostaje wypowiedziana, potęga wstydu zostaje złamana krwią Chrystusa i przyjęciem wspólnoty.',
        'Drugim fundamentem jest wezwanie z Listu do Galacjan: „Jedni drugich brzemiona noście, a tak wypełniajcie prawo Chrystusa” (Ga 6:2 UBG). Paweł posługuje się tu słowem baros (Strong G922) — oznaczającym przytłaczający, miażdżący ciężar, głaz, którego nikt nie zdoła unieść w pojedynkę. Co ciekawe, w wersecie 5 tego samego rozdziału apostoł dodaje: „Każdy bowiem poniesie swoje własne brzemię”, używając jednak zupełnie innego słowa: phortion (Strong G5413) — oznaczającego codzienny plecak, bagaż osobistej odpowiedzialności. Kościół nie ma wyręczać dorosłych ludzi z ich codziennych obowiązków (phortion), ale ma bezwzględny nakaz biec z pomocą i podstawiać ramiona, gdy kogoś przygniata baros — śmierć bliskiej osoby, zdrada małżeńska, diagnoza nowotworu czy kryzys psychiczny. Wypełnieniem prawa Chrystusowego jest miłość agape, która wkracza w błoto cudzego cierpienia.'
      ]
    },
    {
      heading: '6. BEZPIECZNA PRZYSTAŃ ZAMIAST SALI ROZPRAW: 5 ZASAD BUDOWANIA DOJRZAŁEJ WSPÓLNOTY',
      paragraphs: [
        'Jak w praktyce przekształcić zbór i domową grupę ze sztywnej sali rozpraw w bezpieczną przystań łaski? Redakcja eM i Christian Culture proponuje 5 konkretnych, biblijnych i odpowiedzialnych zasad do wdrożenia w każdej wspólnocie:',
        '1. Zasada żelaznej dyskrecji. Zaufanie buduje się latami, a burzy w ułamku sekundy jednym nieodpowiedzialnym komentarzem. Cokolwiek zostało powierzone w zaufaniu przez człowieka w kryzysie, musi pozostać nienaruszalną tajemnicą. Pod żadnym pozorem nie wolno przekazywać cudzych dramatów dalej pod pretekstem „prośby o modlitwę w szerszym gronie”. Plotka w szatach pobożności jest grzechem, który niszczy ludzkie życie i wypycha poranionych ze zboru.',
        '2. Sztuka obecności bez taniego doradzania. Kiedy przyjaciele Hioba przez pierwsze siedem dni siedzieli z nim na ziemi w milczeniu, byli najlepszymi towarzyszami na świecie (Hi 2:13). Wszystko zepsuli dopiero wtedy, gdy zaczęli wygłaszać mądre kazania. Człowiek w kryzysie najczęściej nie potrzebuje gotowych instrukcji ani pouczeń. Potrzebuje obecności: kogoś, kto zaparzy herbatę, posiedzi obok w ciszy, wysłucha bez przerywania i powie z miłością: „Nie rozumiem wszystkiego, przez co przechodzisz, ale jestem przy tobie i nie zostawię cię samego”.',
        '3. Mądre rozróżnienie sfery duchowej i medycznej. Dojrzała wiara nie unieważnia biologii ani osiągnięć medycyny. Depresja kliniczna, stany lękowe, zaburzenia afektywne czy chroniczne wypalenie to schorzenia wymagające profesjonalnej diagnozy psychiatrycznej i psychoterapeutycznej. Wmawianie choremu, że jego choroba jest wynikiem „słabej wiary” lub „działania demonicznego”, jest skrajną nieodpowiedzialnością. Chrześcijańska wspólnota powinna zachęcać do korzystania z pomocy fachowców, traktując wiedzę medyczną jako narzędzie Bożej łaski powszechnej, jednocześnie otaczając cierpiącego modlitwą i troską.',
        '4. Bezpieczne, małe kręgi przymierza. Nikt nie ma obowiązku spowiadać się ze swoich intymnych zmagań przed całym zborem z ambony. Prawdziwe noszenie brzemion może dokonywać się wyłącznie w zaufanych, kilkuosobowych grupach przymierza — pośród 2–3 dojrzałych, sprawdzonych braci lub sióstr, którzy potrafią zachować tajemnicę i nie ulegają pokusie plotkowania. W takich małych grupach zdejmuje się zbroję i doświadcza uzdrawiającej mocy przebaczenia.',
        '5. Pamięć o tożsamości naszego Boga. W Psalmie 34:18 (UBG) czytamy obietnicę, która powinna być wypisana na drzwiach każdego kościoła: „Bliski jest PAN skruszonym w sercu i wybawia złamanych na duchu”. W języku hebrajskim szawur lew oznacza dosłownie serce roztrzaskane, połamane na drobne kawałki. Bóg nie brzydzi się ludzkim pęknięciem. Nie odtrąca człowieka, którego życie legło w gruzach, lecz zbliża się do niego ze szczególną czułością. Jeśli Kościół ma być Jego ambasadą na ziemi, musi pachnieć tą samą bliskością i łaską wobec każdego, kto stracił siły.'
      ]
    }
  ],
  conclusion: 'Kościół, w którym nie wolno zapłakać, potknąć się ani powiedzieć: „Bracia, nie daję już rady”, przestaje być Ciałem Chrystusa, a staje się jedynie kolejną korporacją zarządzania wizerunkiem. Prawdziwa dojrzałość duchowa nie polega na udawaniu, że nie dotyka nas ziemski ból, lecz na odwadze przynoszenia swoich pęknięć do stóp Ukrzyżowanego i Zmartwychwstałego Pana. To właśnie w szczelinach naszego glinianego naczynia najjaśniej błyszczy niegasnące światło Jego łaski. Nie bójmy się prawdy o sobie — Chrystus przyszedł powołać nie sprawiedliwych, ale grzeszników i złamanych na duchu.',
  cta: 'Jeśli niesiesz dzisiaj w sercu ciężar, o którym boisz się komukolwiek powiedzieć ze wstydu i lęku przed osądzeniem — zatrzymaj się. Bóg widzi twoją samotną walkę i nie odwraca od ciebie oblicza. Nie musisz być nieskazitelny, by być kochanym. Zrób dziś jeden odważny krok: znajdź choć jedną sprawdzoną, życzliwą osobę w wierze i pozwól sobie pomóc. Zapraszamy do wspólnej modlitwy:\n\n„Panie Jezu Chryste, Ty sam doświadczyłeś trwogi w Getsemane i wiesz, czym jest samotność, ból i odrzucenie. Dziękujemy Ci, że przed Twoim obliczem nie musimy niczego udawać ani grać ról samowystarczalnych siłaczy. Oddajemy Ci nasze lęki, zranienia, wątpliwości i kryzysy, wierząc Twojej obietnicy, że Twoja moc doskonali się w naszej słabości. Ulecz nasze serca z pychy i fałszywego wizerunku. Uczyń z naszych zborów, rodzin i relacji bezpieczne przystanie przebaczenia, dyskrecji i braterskiej miłości, w których każdy złamany człowiek odnajdzie Twoje zbawienie, pokój i nadzieję. Przez Chrystusa, naszego Zbawiciela i Pana. Amen.”',
  sources: [
    {
      name: 'Kenneth I. Pargament (Bowling Green State University) — „The Psychology of Religion and Coping: Theory, Research, Practice” (Guilford Press); badania nad religijnym radzeniem sobie ze stresem i zjawiskiem ucieczki w duchowość (spiritual bypass)',
      url: 'https://www.guilford.com'
    },
    {
      name: 'Amerykańskie Towarzystwo Psychologiczne (APA) — Raporty kliniczne na temat stygmatyzacji kryzysów emocjonalnych w grupach o wysokiej spoistości i roli wsparcia społecznego',
      url: 'https://www.apa.org'
    },
    {
      name: 'Gordon W. Allport — Klasyczne badania nad dojrzałą i niedojrzałą religijnością („The Individual and His Religion”) oraz psychologią postaw obronnych',
      url: 'https://www.apa.org'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — 2 Koryntian 12:7–10; List Jakuba 5:16; List do Galacjan 6:2–5; Ewangelia Mateusza 26:36–39; Ewangelia Łukasza 22:41–44; Księga Psalmów 6:6; 34:18; 130:1; List do Rzymian 12:15; 1 Księga Królewska 19:4–8; Księga Hioba 42:7; List do Efezjan 2:8–9; 1 List do Koryntian 12:25–26',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek & Hebrew Concordance — Hasła: G769 (astheneia — słabość, niemoc), G1843 (exomologeomai — otwarcie wyznawać), G922 (baros — przytłaczający ciężar), G5413 (phortion — codzienny ładunek), G2390 (iaomai — całościowo uzdrawiać), H7665 (szawar — kruszyć, łamać), H3820 (lew — serce, wnętrze)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasada o Kościele, zbawieniu z łaski, jedności Ciała Chrystusa i wzajemnej odpowiedzialności za braci i siostry',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: '2 Koryntian 12:9 („Wystarczy ci moja łaska. Moja moc bowiem doskonali się w słabości”); List Jakuba 5:16 („Wyznawajcie sobie nawzajem upadki i módlcie się jedni za drugich, abyście byli uzdrowieni”); List do Galacjan 6:2 („Jedni drugich brzemiona noście, a tak wypełniajcie prawo Chrystusa”); Ewangelia Mateusza 26:38 („Smutna jest moja dusza aż do śmierci. Zostańcie tu i czuwajcie ze mną”); Księga Psalmów 34:18 („Bliski jest PAN skruszonym w sercu i wybawia złamanych na duchu”); List do Rzymian 12:15 (UBG)',
  imagePath: path.join(ROOT, 'images/em/art-czy-w-kosciele-wolno-mowic-o-wlasnym-kryzysie.jpg'),
  imageCaption: 'Ilustracja redakcyjna eM / Christian Culture: Otwarta Biblia na drewnianej ławce w ciepłym świetle kaplicy i cicha rozmowa oparta na empatii w tle — symbol bezpiecznej przestrzeni zaufania, w której chrześcijanin nie musi ukrywać swoich zmagań.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#KryzysWiary',
    '#Autentyczność',
    '#ŁaskaBoża',
    '#2Kor12',
    '#eMMotywacja',
    '#WspólnotaKościoła',
    '#UBG',
    '#EkoCC365'
  ],
  seo: {
    title: 'Czy w Kościele wolno mówić o własnym kryzysie? | eM Christian Culture',
    description: 'Iluzja nieskazitelności a biblijna prawda o słabości. Egzegeza 2 Kor 12:9 i Jk 5:16 UBG, psychologia religijnego wizerunku oraz 5 zasad bezpiecznej wspólnoty wiary.',
    keywords: [
      'kryzys w kosciele',
      'czy wolno mowic o kryzysie',
      'slabosc chrzescijanina 2 Kor 12 UBG',
      'spowiedz wzajemna Jk 5:16',
      'noszenie brzemion Gal 6:2',
      'autentycznosc w wierze',
      'spiritual bypass religia',
      'Hiob i psalmy lamentu',
      'depresja a wiara',
      'Cezary Rogowski eM',
      'Christian Culture'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynam przygotowanie artykułu EkoCC (Slot 2026-11-08)...');
  console.log('Tytuł:', articleData.title);
  console.log('Grafika:', articleData.imagePath);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki: ${articleData.imagePath}`);
  }

  // Zapisz także scripts/current-article-data.json
  const currentDataPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentDataPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log('✔ Zapisano scripts/current-article-data.json');

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
