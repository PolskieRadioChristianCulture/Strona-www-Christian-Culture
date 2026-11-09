import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'EGZEGEZA I SPOŁECZEŃSTWO',
  title: 'Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia?',
  slug: 'swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia',
  author: 'Cezary Rogowski',
  date: '2026-11-09',
  lead: 'Dla wielu wierzących dążenie do świętości stało się synonimem wyczerpującego dążenia do bezbłędności i ukrywania wszelkich ludzkich pęknięć pod maską religijnego sukcesu. Pismo Święte demaskuje jednak ten destrukcyjny perfekcjonizm jako współczesną formę faryzeizmu, ukazując, że biblijne uświęcenie nie polega na graniu ról, lecz na radykalnym stanięciu w prawdzie przed Bogiem. Prawdziwa wolność i dojrzałość wiary rodzą się dopiero wtedy, gdy przestajemy udawać samowystarczalnych siłaczy i pozwalamy, by Boża łaska objawiła swą moc w naszej słabości.',
  sections: [
    {
      heading: '1. MASKA DOSKONAŁOŚCI: DLACZEGO RELIGIJNY TEATR WYCZERPUJE DUSZĘ I RODZI SAMOTNOŚĆ',
      paragraphs: [
        'Wielu chrześcijan żyje w nieustannym napięciu pomiędzy rzeczywistym stanem swojego serca a społecznym oczekiwaniem nieskazitelności. W kulturze wspólnotowej, w której premiuje się nienaganny wizerunek, zmaganie z bezsilnością, zniechęceniem, wątpliwościami wiary czy konfliktami rodzinnymi bywa traktowane jako powód do wstydu. W efekcie człowiek zaczyna stosować wyuczone strategie zarządzania wrażeniem (ang. impression management). W niedzielny poranek wkłada niewidzialną maskę człowieka duchowego sukcesu, podczas gdy w zaciszu domowym mierzy się z poczuciem winy, chronicznym wyczerpaniem i duchową pustką.',
        'Psychologia religii opisuje to destrukcyjne zjawisko pojęciem „ucieczki w duchowość” (ang. spiritual bypass), sformułowanym pierwotnie przez Johna Welwooda i rozwiniętym w badaniach klinicznych prof. Kennetha Pargamenta z Bowling Green State University. Polega ono na używaniu wzniosłych pojęć religijnych i formułek pobożnościowych jako mechanizmu obronnego służącego unikaniu konfrontacji z trudnymi emocjami, ranami psychicznymi czy nierozwiązanymi kryzysami relacyjnymi. Kiedy na autentyczny ból odpowiada się wyłącznie sloganem: „Musisz się po prostu więcej modlić”, u cierpiącego rodzi się syndrom oszusta (ang. impostor syndrome) — paraliżujący lęk, że gdyby bracia i siostry poznali prawdę o jego słabościach, zostałby bezlitośnie osądzony i odrzucony.',
        'Najbardziej bolesnym skutkiem religijnego udawania jest głęboka, wewnętrzna samotność w tłumie. Człowiek otoczony setkami współwyznawców pozostaje dramatycznie odizolowany, ponieważ nikt nie zna jego prawdziwego oblicza. Co więcej, nieszczera fasada pobożności budzi nieufność także u ludzi poszukujących Boga z zewnątrz: świat nie potrzebuje aktorów recytujących moralne formułki, lecz świadków, którzy w prawdzie przeżywają swoje odkupienie pośród realnych trudów codzienności.'
      ]
    },
    {
      heading: '2. BIBLIJNA DEFINICJA ŚWIĘTOŚCI: KADOSZ I HAGIOS ZAMIAST STERYLNEGO PERFEKCJONIZMU',
      paragraphs: [
        'Fundamentalny błąd religijnego moralizmu polega na utożsamieniu świętości z moralną sterylnością i bezgrzesznym triumfalizmem. Pismo Święte definiuje jednak świętość w zupełnie innych kategoriach. W języku hebrajskim Starego Testamentu kluczowe słowo kadosz (Strong H6918) oznacza dosłownie: „oddzielony”, „odrębny”, „poświęcony dla Boga”. Świętość nie jest stanem wypracowanym przez ludzką dyscyplinę, lecz rzeczywistością wynikającą z przynależności do Boga. To nie człowiek czyni siebie świętym — to obecność Trzykroć Świętego Boga uświęca miejsce, czas i naczynie, które zostaje Mu oddane.',
        'Przejmującą ilustracją tej prawdy jest powołanie proroka Izajasza (Iz 6:1–7 UBG). Gdy prorok ujrzał Pana siedzącego na wysokim i wyniosłym tronie w świątyni, a serafini wołali: „Święty, święty, święty jest PAN zastępów”, jego reakcją nie była duma z własnej prawości, lecz krzyk bezradności: „Biada mi, bo ginę, gdyż jestem człowiekiem nieczystych warg i mieszkam pośród ludu o nieczystych wargach”. Prawdziwe spotkanie z Bożą świętością nie pompuje religijnego ego, lecz bezlitośnie obnaża naszą kruchość. Kluczowy jest jednak kolejny krok: Bóg nie odtrąca przerażonego proroka, lecz posyła serafina z rozżarzonym węglem z ołtarza, dotyka jego warg i mówi: „Oto dotknęło to twoich warg, a twoja nieprawość jest usunięta, a twój grzech zmazany”. Świętość Boga jest ogniem oczyszczającym, a nie niszczącym; jej fundamentem jest łaska, która dotyka miejsca zranionego i skażonego.',
        'W Nowym Testamencie greckie słowo hagios (Strong G40) oraz hagiasmos (Strong G38 — uświęcenie) opisują dynamiczny proces przemiany myślenia i serca pod wpływem Ducha Świętego. Jezus Chrystus w konfrontacji z religijnymi elitami swoich czasów wypowiedział najostrzejsze słowa pod adresem tych, którzy dbali wyłącznie o zewnętrzną nieskazitelność: „Biada wam, uczeni w Piśmie i faryzeusze, obłudnicy! Bo jesteście podobni do grobów pobielanych, które z zewnątrz wydają się piękne, ale wewnątrz są pełne kości umarłych i wszelkiej nieczystości. Tak i wy z zewnątrz wydajecie się ludziom sprawiedliwi, ale wewnątrz jesteście pełni obłudy i nieprawości” (Mt 23:27–28 UBG). Greckie słowo hypokrisis (Strong G5272) oznaczało w świecie antycznym grę aktorską na scenie, noszenie teatralnej maski. Chrystus nie brzydził się celnikami, grzesznikami ani ludźmi połamanymi życiowo; Jego najgłębszy sprzeciw budziła religijna gra pozorów, która uniemożliwiała przyjęcie daru zbawienia.'
      ]
    },
    {
      heading: '3. WIELCY MĘŻOWIE WIARY W OGNIU PRAWDY: LEKCJA Z DAWIDA, PIOTRA I PAWŁA',
      paragraphs: [
        'Karty Pisma Świętego zadziwiają bezkompromisowym realizmem. Biblia nigdy nie retuszuje biografii swoich bohaterów ani nie tworzy z nich nieskazitelnych pomników. Król Dawid, nazwany mężem według Bożego serca, dopuścił się cudzołóstwa z Batszebą i podstępnego zabójstwa Uriasza Chetyty. Przez blisko rok żył w kłamstwie i wypieraniu winy, co doprowadziło go do ruiny fizycznej i duchowej: „Gdy milczałem, moje kości schnęły od codziennego mego narzekania” (Ps 32:3 UBG). Świętość Dawida nie polegała na tym, że nigdy nie upadł, lecz na tym, jak zareagował na Boże napomnienie przez proroka Natana. Dawid nie szukał okoliczności łagodzących, nie zrzucał winy na innych, lecz padł na twarz, wołając: „Zgrzeszyłem przeciwko PANU”. W Psalmie 51 sformułował niezmienne prawo duchowe: „Ofiarami dla Boga są duch skruszony; sercem skruszonym i złamanym, o Boże, nie wzgardzisz” (Ps 51:17 UBG).',
        'Podobnie apostoł Piotr musiał przejść przez bolesne odarcie z religijnej pewności siebie. Przed pojmaniem Mistrza z dumą deklarował: „Choćby się wszyscy zgorszyli z twojego powodu, ja się nigdy nie zgorszę” (Mt 26:33 UBG). Kilka godzin później, w blasku ogniska na dziedzińcu arcykapłana, ze strachu trzykrotnie zaklął się, że nie zna Jezusa. Spojrzenie pojmanego Chrystusa złamało jego pychę: Piotr wyszedł na zewnątrz i gorzko zapłakał (Łk 22:61–62 UBG). Gdy zmartwychwstały Zbawiciel przywracał Piotra do służby nad Jeziorem Tyberiadzkim (J 21:15–17 UBG), nie pytał go o sprawność organizacyjną ani o gwarancje niezłomności. Zapytał trzykrotnie: „Szymonie, synu Jonasza, czy miłujesz mnie?”. Piotr, pozbawiony już złudzeń co do własnej siły, odpowiedział w prawdzie: „Panie, ty wiesz wszystko, ty wiesz, że cię kocham”. Jego autorytet pasterski narodził się nie z bezgrzeszności, lecz z doświadczenia przebaczającej miłości.',
        'Najbardziej dojrzałą teologię autentyczności pozostawił apostoł Paweł. W Liście do Rzymian wstrząsająco opisuje wewnętrzne rozdarcie człowieka wiary: „Wiem bowiem, że we mnie, to jest w moim ciele, nie mieszka dobro... Nieszczęsny ja człowiek! Któż mnie wybawi z tego ciała śmierci? Dziękuję Bogu przez Jezusa Chrystusa, naszego Pana” (Rz 7:18.24–25 UBG). Paweł nie bał się odsłonić swojego zmagania, ponieważ wiedział, gdzie jest ratunek. Pod koniec swojego pracowitego życia, pisząc do Tymoteusza, nie kreował się na nieomylnego patriarchę, lecz wyznał: „Wierna to mowa i godna całkowitego przyjęcia, że Chrystus Jezus przyszedł na świat, aby zbawić grzeszników, z których ja jestem pierwszy” (1 Tm 1:15 UBG). Użył przy tym greckiego czasu teraźniejszego (eimi ego — „ja jestem pierwszy”, a nie „byłem”). Świadomość własnej kruchości nie odbierała mu radości zbawienia, lecz chroniła przed pychą i kierowała całą chwałę ku Chrystusowi.'
      ]
    },
    {
      heading: '4. ROZDZIELENIE FAKTÓW OD KOMENTARZA TEOLOGICZNEGO: PSYCHOLOGIA WSTYDU A PRAWDA EWANGELII',
      paragraphs: [
        'Rzetelność publicystyczna wymaga precyzyjnego oddzielenia obserwowalnych faktów psychologicznych od teologicznej wykładni Słowa Bożego. Po stronie badań empirycznych, kluczowym odkryciem współczesnych nauk społecznych jest rozróżnienie pomiędzy poczuciem winy (ang. guilt) a destrukcyjnym wstydem (ang. shame), szczegółowo udokumentowane m.in. przez dr Brené Brown z University of Houston oraz badaczy z Amerykańskiego Towarzystwa Psychologicznego (APA). Poczucie winy odnosi się do konkretnego zachowania: „Zrobiłem coś złego, skrzywdziłem kogoś, złamałem standard”. Jest to emocja adaptacyjna, która skłania do zadośćuczynienia, przeprosin i zmiany postępowania. Wstyd natomiast uderza w samą tożsamość jednostki: „Jestem wadliwy, nieudany, bezwartościowy”. Wstyd paraliżuje, wywołuje chroniczny lęk przed obnażeniem i zmusza do budowania obronnych murów perfekcjonizmu lub agresji.',
        'Wieloletnie badania kliniczne prof. Harolda G. Koeniga z Duke University Medical Center nad zdrowiem psychicznym w kontekście religijnym wskazują, że środowiska wyznaniowe, które operują toksyczną pedagogiką wstydu i piętnują wszelkie przejawy ludzkiej bezsilności, generują u swoich członków podwyższone ryzyko zaburzeń lękowych, depresji oraz nerwic natręctw o podłożu skrupulanckim. Zamiast doświadczenia uzdrowienia, wierzący internalizuje obraz Boga jako surowego kontrolera, który czyha na najmniejsze potknięcie.',
        'Z punktu widzenia ortodoksyjnej teologii biblijnej, to rozróżnienie rzuca potężne światło na mechanizm upadku i odkupienia. Pierwszą reakcją Adama i Ewy po zerwaniu owocu w Edenie było zrobienie fartuchów z liści figowych i ucieczka w krzaki przed głosem Boga (Rdz 3:7–10 UBG). To praobraz każdego religijnego udawania: człowiek usiłuje własnymi, nietrwałymi wytworami (liście figowe własnych uczynków) zasłonić wstyd swojej nagości. Odpowiedź Boga w Ewangelii jest rewolucyjna: Bóg nie każe ludziom udawać, że nic się nie stało, lecz sam sporządza dla nich odzienie ze skór (Rdz 3:21 UBG), co wymagało przelania krwi niewinnego stworzenia i zapowiadało ostateczną ofiarę Baranka Bożego. 28 Zasad Wiary Kościoła Bożego jednoznacznie przypomina, że zbawienie i usprawiedliwienie są całkowicie darmowym darem Bożej łaski przez wiarę w Jezusa Chrystusa (Ef 2:8–9 UBG). Nasza tożsamość nie opiera się na naszej bezbłędności, lecz na doskonałej sprawiedliwości Chrystusa, która została nam przypisana.'
      ]
    },
    {
      heading: '5. SKARB W NACZYNIACH GLINIANYCH (2 KOR 4:7): MOC BOGA W LUDZKIM PĘKNIĘCIU',
      paragraphs: [
        'Jedną z najgłębszych metafor chrześcijańskiego życia pozostawił apostoł Paweł w 2 Liście do Koryntian: „Mamy zaś ten skarb w naczyniach glinianych, aby wspaniałość tej mocy była z Boga, a nie z nas” (2 Kor 4:7 UBG). W języku greckim zwrot ostrakinois skeuesin (Strong G3749 i G4632) odnosi się do pospolitych, tanich naczyń z wypalanej gliny. W świecie hellenistycznym cenne klejnoty, złoto i dokumenty trzymano w kunsztownych skrzyniach z brązu, srebra lub kości słoniowej. Gliniane dzbany służyły do celów gospodarczych: noszono w nich wodę, oliwę lub wyrzucano jako bezwartościowe skorupy po pierwszym stłuczeniu.',
        'Bóg celowo wybrał naczynia gliniane — kruche, podatne na zarysowania, pęknięcia i wyszczerbienia — aby nikt nie miał wątpliwości, skąd pochodzi moc przemieniająca ludzkie życie. Gdyby naczynie było z litego złota, obserwator mógłby podziwiać piękno i odporność samego naczynia. Gdy jednak naczynie jest z gliny, a bije z niego transcendentne światło Ewangelii, cała uwaga skupia się na Skarbie, którym jest Jezus Chrystus. Co więcej, w świecie starożytnym naczynie, które miało rysy i pęknięcia, przepuszczało światło umieszczonej wewnątrz oliwnej lampy. To właśnie przez pęknięcia naszej słabości Boże światło najjaśniej rozświetla mrok otaczającego świata.',
        'Ta prawda znajduje swój punkt kulminacyjny w słynnej odpowiedzi, jaką Paweł usłyszał od zmartwychwstałego Pana w sprawie swojego dręczącego „ciernia w ciele”: „Wystarczy ci moja łaska. Moja moc bowiem doskonali się w słabości. Najchętniej więc będę się chlubił z moich słabości, aby zamieszkała we mnie moc Chrystusa. Dlatego mam upodobanie w słabościach, w zniewagach, w potrzebach, w prześladowaniach, w uciskach dla Chrystusa; gdy bowiem jestem słaby, wtedy jestem mocny” (2 Kor 12:9–10 UBG). Greckie słowo astheneia (Strong G769) oznacza brak sił, niemoc, ograniczenie. Chrześcijańska dojrzałość nie polega na wyeliminowaniu ludzkiej słabości, lecz na uznaniu jej przed Bogiem i uczynieniu z niej przestrzeni dla działania Jego suwerennej łaski.'
      ]
    },
    {
      heading: '6. DROGA KU WOLNOŚCI: 5 PRAKTYCZNYCH DECYZJI UWALNIAJĄCYCH OD RELIGIJNEGO POZORU',
      paragraphs: [
        'Jak w praktyce porzucić męczący teatr pobożności i wejść w autentyczne, biblijne uświęcenie? Redakcja CCN przedstawia 5 konkretnych, odpowiedzialnych decyzji opartych na Piśmie Świętym:',
        '1. Stań w prawdzie przed Bogiem w osobistej izdebce (1 J 1:8–9 UBG). Przestań używać przed Bogiem wyuczonych, sztucznych formułek. Pierwszy List Jana przypomina: „Jeśli mówimy, że nie mamy grzechu, sami siebie oszukujemy i nie ma w nas prawdy. Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości”. Grecki czasownik homologeo oznacza „mówić to samo”, czyli zgodzić się z Bożą diagnozą bez szukania wymówek. Prawdziwa modlitwa zaczyna się tam, gdzie zrzucamy maskę i mówimy: „Panie, oto jestem: zmęczony, zraniony, zmagający się z pokusą. Zmiłuj się nade mną”.',
        '2. Przestań mierzyć swoją wartość cudzymi osiągnięciami (Ga 6:4 UBG). Apostoł Paweł wzywa: „Niech każdy bada swoje własne dzieło, a wtedy będzie miał powód do chluby w samym sobie, a nie w kimś innym”. Porównywanie się z innymi wierzącymi to prosta droga do pychy (gdy wydaje nam się, że wypadamy lepiej) albo do rozpaczy (gdy czujemy się gorsi). Bóg nie powołał cię do kopiowania czyjejś duchowej drogi, lecz do wiernego chodzenia z Nim we własnych realiach.',
        '3. Zbuduj bezpieczną relację przymierza z 1–2 dojrzałymi osobami (Jk 5:16 UBG). Słowa Jakuba: „Wyznawajcie sobie nawzajem upadki i módlcie się jedni za drugich, abyście byli uzdrowieni” nie oznaczają publicznego ekshibicjonizmu przed całym tłumem. Oznaczają posiadanie w zborze choć jednego zaufanego, dyskretnego brata lub siostry, przed którymi można bez lęku powiedzieć prawdę o swoim zmaganiu. Prawdziwe uzdrowienie dokonuje się w atmosferze dyskrecji, empatii i wstawienniczej modlitwy.',
        '4. Rozróżnij swoje codzienne zmaganie od niezmiennej tożsamości w Chrystusie (Rz 8:1 UBG). Twój upadek, kryzys czy zły dzień nie przekreślają twojego synostwa Bożego. List do Rzymian ogłasza uroczyście: „Teraz więc nie ma żadnego potępienia dla tych, którzy są w Chrystusie Jezusie”. Szatan jest oskarżycielem braci, który wmawia ci, że jesteś hipokrytą i nie masz prawa wracać do Boga. Duch Święty jest Pocieszycielem, który przekonuje o grzechu, ale jednocześnie wskazuje na krzyż i woła w twoim sercu: „Abba, Ojcze!”.',
        '5. Praktykuj łaskę i zrezygnuj z roli sędziego wobec innych (Kol 3:12–13 UBG). Człowiek, który sam doświadczył, jak wiele przebaczył mu Bóg, traci ochotę na moralizatorstwo wobec bliźnich. Pismo Święte wzywa: „Przywdziejcie więc jako wybrani Boży, święci i umiłowani, serdeczne miłosierdzie, dobroć, pokorę, cichość, cierpliwość; znosząc jedni drugich i przebaczając sobie nawzajem, jeśli ktoś ma skargę przeciw drugiemu: jak i Chrystus przebaczył wam, tak i wy”. Prawdziwie święta wspólnota to taka, w której potknięty brat nie zostaje stratowany, lecz otrzymuje pomocną dłoń do powstania.'
      ]
    }
  ],
  conclusion: 'Świętość nie jest sterylnym piedestałem, na którym stawia się nieskazitelne posągi. Prawdziwa biblijna świętość rodzi się w prochu codzienności, w zmaganiu, w łzach skruchy i w zachwycie nad niepojętą łaską Zbawiciela. Udawanie doskonałości jest duchowym więzieniem, które kradnie radość i niszczy relacje. Gdy zdejmujemy maski i stajemy przed Bogiem jako gliniane naczynia z całą prawdą o naszej słabości, doświadczamy cudu: Jego moc wypełnia nasze pęknięcia, a Jego pokój uwalnia nas od lęku. Nie musimy niczego udawać przed Tym, który znał wszystkie nasze upadki, a mimo to oddał za nas swoje życie na Golgocie.',
  cta: 'Jeśli od tygodni nosisz w sobie wyczerpujący ciężar udawania, że wszystko w twoim życiu jest pod kontrolą — zatrzymaj się dziś i odetchnij. Jezus Chrystus nie przyszedł powoływać sprawiedliwych we własnych oczach, lecz tych, którzy wiedzą, że potrzebują Lekarza. Zrób dziś krok w stronę prawdy: zamknij drzwi swojej izdebki, zrzuć ciężar pozorów i powiedz Bogu wszystko tak, jak jest. Zapraszamy do wspólnej modlitwy:\n\n„Panie Boże Wszechmogący, Święty i Sprawiedliwy, dziękujemy Ci, że w Twojej obecności nie musimy niczego udawać ani grać ról nienagannych siłaczy. Ty znasz nasze serca, wiesz o każdym naszym potknięciu, pęknięciu i bezsilności, a jednak w Jezusie Chrystusie przygarniasz nas z bezwarunkową miłością i łaską. Uwolnij nas od tyranii religijnego perfekcjonizmu, lęku przed ludzką opinią i wstydu, który każe się ukrywać. Daj nam odwagę chodzenia w prawdzie i uczyń z naszego życia czyste, gliniane naczynia, przez które Twoja łaska, pokój i światłość rozleją się na ludzi wokół nas. Przez Jezusa Chrystusa, naszego Pana i Zbawiciela. Amen.”',
  sources: [
    {
      name: 'Harold G. Koenig (Duke University Medical Center) — „Handbook of Religion and Health” (Oxford University Press); badania nad zdrowiem psychicznym, autentycznością relacji i negatywnymi skutkami toksycznego wstydu religijnego',
      url: 'https://spiritualityandhealth.duke.edu'
    },
    {
      name: 'Kenneth I. Pargament (Bowling Green State University) — „The Psychology of Religion and Coping: Theory, Research, Practice” (Guilford Press); analiza zjawiska ucieczki w duchowość (spiritual bypass) i dojrzałych form integracji wiary',
      url: 'https://www.guilford.com'
    },
    {
      name: 'Brené Brown (University of Houston) — „Daring Greatly: How the Courage to Be Vulnerable Transforms the Way We Live, Love, Parent, and Lead”; badania nad wstydem, podatnością na zranienie i uwalniającą mocą autentyczności',
      url: 'https://brenebrown.com'
    },
    {
      name: 'Amerykańskie Towarzystwo Psychologiczne (APA) — Raporty naukowe dotyczące mechanizmów obronnych, syndromu oszusta i zarządzania wizerunkiem w grupach o wysokich wymaganiach normatywnych',
      url: 'https://www.apa.org'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — 2 Koryntian 4:7; 2 Koryntian 12:7–10; 1 Jana 1:8–9; List do Rzymian 7:18–25; 8:1; 1 List do Tymoteusza 1:15; Księga Izajasza 6:1–7; Ewangelia Mateusza 23:27–28; Ewangelia Łukasza 22:61–62; Ewangelia Jana 21:15–17; Księga Psalmów 32:3; 51:1–19; List do Galacjan 6:2–5; List do Kolosan 3:12–13; List do Efezjan 2:8–10',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek and Hebrew Concordance — Hasła: H6918 (kadosz — święty, oddzielony), G40 (hagios — święty, uświęcony), G38 (hagiasmos — uświęcenie, przemiana), G5272 (hypokrisis — obłuda, gra aktorska), G3749 (ostrakinos — gliniany, kruchy), G4632 (skeuos — naczynie), G769 (astheneia — słabość, niemoc), G3670 (homologeo — wyznawać, zgadzać się w prawdzie)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasada o zbawieniu z łaski przez wiarę, uświęceniu przez Słowo i Ducha Świętego oraz wspólnocie Kościoła jako Ciele Chrystusa',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: '2 Koryntian 4:7 („Mamy zaś ten skarb w naczyniach glinianych, aby wspaniałość tej mocy była z Boga, a nie z nas”); 2 Koryntian 12:9 („Wystarczy ci moja łaska. Moja moc bowiem doskonali się w słabości”); 1 Jana 1:9 („Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości”); Księga Psalmów 51:17 („Ofiarami dla Boga są duch skruszony; sercem skruszonym i złamanym, o Boże, nie wzgardzisz”); Ewangelia Mateusza 23:27–28; List do Rzymian 8:1 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia.jpg'),
  imageCaption: 'Ilustracja redakcyjna CCN / Christian Culture: Gliniane naczynie ze szlachetnymi pęknięciami, przez które przenika ciepłe, złociste światło na drewnianym stole obok otwartego Pisma Świętego — biblijny symbol mocy Bożej doskonalącej się w ludzkiej słabości (2 Kor 4:7).',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#Świętość',
    '#Autentyczność',
    '#ŁaskaBoża',
    '#2Kor4',
    '#2Kor12',
    '#SłabośćAMoc',
    '#CCNNews',
    '#EgzegezaBiblijna',
    '#UBG',
    '#EkoCC365'
  ],
  seo: {
    title: 'Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia? | CCN News',
    description: 'Religijny perfekcjonizm a biblijna prawda o świętości. Egzegeza 2 Kor 4:7, 2 Kor 12:9 i Ps 51 UBG, psychologia wstydu oraz 5 kroków ku autentycznej wolności w Chrystusie.',
    keywords: [
      'swietosc nie wymaga udawania',
      'dlaczego prawda o slabosci uwalnia',
      'perfekcjonizm religijny a wiara',
      'skarb w naczyniach glinianych 2 Kor 4 UBG',
      'moc w slabosci 2 Kor 12',
      'kadosz hagios znaczenie biblijne',
      'spiritual bypass ucieczka w duchowosc',
      'wstyd a poczucie winy Brene Brown',
      'Dawid Psalm 51 UBG',
      'Cezary Rogowski publicystyka',
      'Christian Culture Network',
      'EkoCC 365'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynam przygotowanie artykułu EkoCC (Slot 2026-11-09, LP 6)...');
  console.log('Tytuł:', articleData.title);
  console.log('Grafika:', articleData.imagePath);

  if (!fs.existsSync(articleData.imagePath)) {
    console.warn(`⚠️ Plik grafiki jeszcze nie istnieje pod ścieżką docelową: ${articleData.imagePath}`);
    console.log('Oczekiwanie na grafikę lub sprawdzenie folderu...');
  }

  // Zapisz scripts/current-article-data.json
  const currentDataPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentDataPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log('✔ Zapisano scripts/current-article-data.json');

  if (fs.existsSync(articleData.imagePath)) {
    const res = await packageEkoccArticle(articleData);
    console.log('\n🎉 Kompletny pakiet redakcyjny przygotowany pomyślnie!');
    console.log('ZIP:', res.zipPath);
    console.log('DOCX:', res.docxPath);
    console.log('TXT:', res.txtPath);
    console.log('SEO:', res.seoPath);
  } else {
    console.log('Wstrzymano pakowanie do momentu zapisu pliku grafiki 16:9.');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
