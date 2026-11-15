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
  title: 'Gdy religia staje się konkursem na nienaganny wizerunek',
  slug: 'gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek',
  author: 'Cezary Rogowski',
  date: '2026-11-15',
  lead: 'Dla wielu ludzi niedzielne przekroczenie progu wspólnoty wiary wiąże się z podświadomym przymusem założenia nieskazitelnej maski: wygładzonego uśmiechu, nienagannego wyglądu i deklaracji nieustannego sukcesu duchowego. Za tą starannie wyreżyserowaną fasadą kryje się jednak nierzadko głęboki lęk przed odrzuceniem, chroniczne poczucie winy oraz wycieńczenie ciągłą grą pozorów. Pismo Święte nie wzywa nas do religijnego teatru ani budowania iluzji własnej doskonałości, lecz zaprasza do stanięcia w prawdzie przed Bogiem, którego łaska objawia się w naszej ludzkiej kruchości. Prawdziwa wiara zaczyna się w miejscu, w którym wreszcie mamy odwagę zdjąć maskę i pozwolić Chrystusowi uleczyć nasze prawdziwe serce.',
  sections: [
    {
      heading: '1. TEATR ŻYCIA NIEDZIELNEGO: JAK POBOŻNOŚĆ ZAMIENIA SIĘ W ZARZĄDZANIE WRAŻENIEM (IMPRESSION MANAGEMENT)',
      paragraphs: [
        'Zjawisko zarządzania wizerunkiem w środowiskach religijnych jest jednym z najbardziej powszechnych, a jednocześnie najstaranniej przemilczanych problemów współczesnych wspólnot wiary. W wielu kręgach wytworzyła się subtelna, niepisana presja demonstrowania nieustannego triumfu duchowego, harmonii rodzinnej i nieskazitelności moralnej. Zwykłe, serdeczne pytanie zadane przed nabożeństwem: „Co u ciebie słychać?” automatycznie uruchamia wyuczoną, bezpieczną formułkę: „Wszystko wspaniale, chwała Bogu!”. Tymczasem za tym wygładzonym uśmiechem kryją się nierzadko bezsenne noce, bolesny kryzys małżeński, paraliżujący lęk o przyszłość dzieci czy dojmujące poczucie pustki.',
        'W socjologii zjawisko to po raz pierwszy kompleksowo zdiagnozował prof. Erving Goffman w fundamentalnej pracy „The Presentation of Self in Everyday Life”. Goffman wykazał, że w interakcjach społecznych ludzie dzielą swoje funkcjonowanie na scenę (front stage) — przestrzeń wystudiowanych ról, gdzie odgrywamy to, co zyskuje społeczną aprobatę — oraz kulisy (backstage), gdzie możemy odetchnąć i być sobą. Tragedia zaczyna się wówczas, gdy wspólnota wiary, powołana przez Chrystusa do bycia bezpieczną przystanią i duchowym szpitalem dla poranionych, przekształca się w surowy teatr. Na takiej religijnej scenie wierzący nieustannie pilnują swoich kostiumów, lękając się, że jakiekolwiek pęknięcie na fasadzie zdyskwalifikuje ich w oczach braci i sióstr.',
        'Ten niewidzialny konkurs na nienaganny wizerunek generuje potężny koszt emocjonalny. Prowadzi do głębokiego wyobcowania: człowiek otoczony setkami uśmiechniętych współwyznawców czuje się przeraźliwie samotny, ponieważ nikt w tym tłumie nie zna jego rzeczywistych zmagań. Presja nieskazitelności sprawia, że zamiast dzielić ze sobą ciężary, zaczynamy ze sobą rywalizować na poziom uduchowienia, poprawność językową czy tempo odnoszonych „sukcesów wiary”. W rezultacie religia, która miała nieść wyzwolenie, staje się ciężkim, wyczerpującym jarzmem.'
      ]
    },
    {
      heading: '2. ROZPOZNANIE NAUKOWE: RELIGIJNOŚĆ ZEWNĘTRZNA GORDONA ALLPORTA I MECHANIZM SPIRITUAL BYPASS',
      paragraphs: [
        'Rzetelna analiza fenomenu religijnego wizerunkowości wymaga odwołania się do twardego dorobku psychologii religii. Pionier badań nad strukturą postaw religijnych, prof. Gordon Allport z Harvard University (wspólnie z J. Michaelem Rossem), wprowadził przełomowe rozróżnienie pomiędzy religijnością wewnętrzną (intrinsic religiosity) a religijnością zewnętrzną (extrinsic religiosity). Człowiek o religijności wewnętrznej znajduje w wierze ostateczny sens istnienia i nadrzędny autorytet — żyje Ewangelią na co dzień, niezależnie od tego, czy ktokolwiek na niego patrzy. Z kolei religijność zewnętrzna ma charakter czysto instrumentalny: religia jest w niej używana jako narzędzie do budowania statusu społecznego, zdobywania akceptacji grupy, ugruntowywania nienagannej reputacji lub uśmierzania osobistych lęków.',
        'Gdy w danej społeczności dominuje orientacja zewnętrzna, normą staje się to, co psychoterapeuta John Welwood zdefiniował jako ucieczkę w duchowość (ang. spiritual bypass). Jest to mechanizm obronny polegający na wykorzystywaniu pojęć, praktyk i rytuałów religijnych do unikania konfrontacji z nierozwiązanymi problemami emocjonalnymi, traumą, kryzysem relacyjnym czy poczuciem własnej bezradności. W praktyce oznacza to zasypywanie głębokich ran pobożnymi frazesami: zamiast wysłuchać i wesprzeć cierpiącego człowieka, otoczenie serwuje mu powierzchowne recepty: „Musisz się po prostu więcej modlić”, „Widocznie brakuje ci wiary” albo „Oddaj to Bogu i przestań narzekać”.',
        'Z kolei badania dr Brené Brown z University of Houston nad anatomią wstydu i podatności na zranienie (vulnerability) dowodzą, że perfekcjonizm nie jest dążeniem do doskonałości, lecz pancerzem chroniącym przed wstydem. W kulturach o wysokim poziomie wymagań wizerunkowych ludzie dochodzą do błędnego wniosku: „Jeśli będę wyglądać nieskazitelnie, modlić się bezbłędnie i nigdy nie okażę słabości, uniknę osądu, krytyki i odrzucenia”. Brown wykazała, że pancerz ten skutecznie blokuje empatię, niszczy autentyczną bliskość i uniemożliwia doświadczenie prawdziwej przynależności. Nie można bowiem czuć się kochanym za to, kim się jest, jeśli stale pokazuje się światu wyłącznie wyretuszowaną wersję samego siebie.'
      ]
    },
    {
      heading: '3. EGZEGEZA BIBLIJNA: GRECKIE HYPOKRITES CZYLI AKTOR NA SCENIE W NAUCZANIU JEZUSA (MT 23, ŁK 18)',
      paragraphs: [
        'Kiedy studiujemy Nowy Testament w języku greckim, odkrywamy z całą wyrazistością, jak fundamentalne znaczenie dla Jezusa Chrystusa miało zdemaskowanie religijnej obłudy. Najostrzejsze słowa Zbawiciela, jakie odnajdujemy na kartach Ewangelii, nie były skierowane do moralnych rozbitków, poborców podatkowych czy prostytutek, lecz do religijnych elit tamtych czasów — uczonych w Piśmie i faryzeuszy, którzy uczynili z pobożności wyrafinowany spektakl dla publiczności.',
        'W 23. rozdziale Ewangelii Mateusza Jezus posługuje się z mocą greckim terminem hypokrites (Strong G5273). W starożytnym teatrze greckim i rzymskim słowo to nie miało pierwotnie wydźwięku wyłącznie pejoratywnego — oznaczało po prostu aktora dramatycznego, który zakładał na twarz wielką maskę (personę) i modulował głos, aby odgrywać na scenie postać inną niż ta, którą był w rzeczywistości. Gdy Jezus grzmi: „Biada wam, uczeni w Piśmie i faryzeusze, obłudnicy [hypokritai]!” (Mt 23:25 UBG), w istocie mówi: „Biada wam, wy którzy zrobiliście z wiary teatr, a z Bożej obecności scenę dla własnego wizerunku!”.',
        'Jezus piętnuje konkretne przejawy tego zjawiska: „Wszystkie zaś swoje uczynki czynią po to, aby ludzie ich widzieli. Poszerzają bowiem swoje filakterie i wydłużają frędzle swoich szat. Lubią też pierwsze miejsca na ucztach i pierwsze krzesła w synagogach” (Mt 23:5–6 UBG). Posługuje się wstrząsającym porównaniem do grobów pobielanych: „Obłudnicy! Bo jesteście podobni do grobów pobielanych, które z zewnątrz wydają się piękne, ale wewnątrz pełne są kości umarłych i wszelkiej nieczystości. Tak i wy na zewnątrz wydajecie się ludziom sprawiedliwi, ale wewnątrz jesteście pełni obłudy i nieprawości” (Mt 23:27–28 UBG). W starożytnej Judei groby bielono wapnem przed świętem Paschy, by pielgrzymi przypadkowo ich nie dotknęli i nie zaciągnęli rytualnej nieczystości. Piękna biel na zewnątrz kryła w sobie rozkład.',
        'Z kolei w Ewangelii Łukasza Jezus przedstawia genialne studium dwóch postaw serca w Przypowieści o faryzeuszu i celniku (Łk 18:9–14 UBG). Zwróćmy uwagę, jak rozpoczyna się modlitwa faryzeusza: „Faryzeusz stanął i tak się w sobie modlił: Boże, dziękuję ci, że nie jestem jak inni ludzie: zdziercy, niesprawiedliwi, cudzołożnicy albo jak i ten celnik. Poszczę dwa razy w tygodniu, daję dziesięcinę ze wszystkiego, co mam” (Łk 18:11–12 UBG). Grecki zwrot pros heauton proseucheto („tak się w sobie modlił”) demaskuje, że faryzeusz wcale nie rozmawiał z Bogiem — zachwycał się własnym moralnym bilansem, porównując się z gorszym w jego mniemaniu sąsiadem. Natomiast celnik stał z daleka, nie śmiał nawet podnieść oczu ku niebu, lecz bił się w piersi i wołał: „Boże, bądź miłosierny [hilastheti, Strong G2433 — uczyń przebłaganie] mnie grzesznemu!”. Konkluzja Jezusa burzy wszelkie ludzkie kalkulacje: to pogardzany celnik odszedł do domu usprawiedliwiony, a nie dumny faryzeusz, „każdy bowiem, kto się wywyższa, będzie poniżony, a kto się poniża, będzie wywyższony” (Łk 18:14 UBG).'
      ]
    },
    {
      heading: '4. ROZDZIELENIE FAKTÓW OD TEOLOGII: OCENA SPOŁECZNA A TAJEMNICA BOŻEGO SERCA (1 SM 16:7, RZYM 3)',
      paragraphs: [
        'Dojrzała refleksja chrześcijańska wymaga precyzyjnego oddzielenia mechanizmów społecznej oceny od Bożej teologii usprawiedliwienia. Na płaszczyźnie socjologicznej naturalnym odruchem każdej grupy ludzkiej jest tworzenie hierarchii, kategoryzowanie jednostek i nagradzanie tych, którzy idealnie wpisują się w behawioralny kanon środowiska. Ludzie nie mają wglądu w myśli i motywacje drugiego człowieka — oceniają wyłącznie to, co słyszą i widzą: elokwencję, ubiór, pozycję zawodową czy publiczną aktywność.',
        'Boża perspektywa jest jednak radykalnie odmienna, o czym Pismo Święte przypomina w fundamentalnym wydarzeniu namaszczenia Dawida w Betlejem: „PAN zaś powiedział do Samuela: Nie patrz na jego wygląd ani na wysokość jego wzrostu, gdyż go odrzuciłem. Bo PAN nie patrzy na to, na co patrzy człowiek. Człowiek bowiem patrzy na to, co jest przed oczyma, ale PAN patrzy na serce” (1 Sm 16:7 UBG). W języku hebrajskim serce (lewaw, Strong H3824) to nie siedlisko ulotnych wzruszeń, lecz centrum woli, sumienia, najgłębszych decyzji i autentyczności człowieka. Bóg nie daje się zwieść żadnemu marketingowi religijnemu — widzi nas dokładnie takimi, jakimi jesteśmy w najciemniejszym pokoju, gdy gasną wszystkie światła.',
        'W świetle teologii biblijnej oraz 28 Zasad Wiary Kościoła Bożego (w szczególności zasad dotyczących upadłej natury człowieka i usprawiedliwienia z łaski), wszelkie próby budowania własnej sprawiedliwości przed Bogiem w oparciu o nienaganny wizerunek są z góry skazane na klęskę. Apostoł Paweł w Liście do Rzymian stwierdza bez ogródek: „Wszyscy bowiem zgrzeszyli i są pozbawieni chwały Bożej; a zostają usprawiedliwieni darmo, z jego łaski, przez odkupienie, które jest w Chrystusie Jezusie” (Rz 3:23–24 UBG).',
        'Zbawienie nie jest nagrodą przyznawaną za wygranie konkursu na najbardziej bezgrzesznego członka zboru. Zbawienie jest niezasłużonym darem łaski ofiarowanym ludziom, którzy uznali swoje bankructwo duchowe i złożyli ufność w ofierze Jezusa na krzyżu. Gdy chrześcijanin naprawdę pojmuje, że jego akceptacja u Ojca opiera się na doskonałości Chrystusa, a nie na jego własnej bezbłędności, znika neurotyczna potrzeba udowadniania czegokolwiek komukolwiek. Łaska uwalnia z więzienia wizerunku.'
      ]
    },
    {
      heading: '5. KIEDY APOSTOŁOWIE ULEGAJĄ PRESJI ŚRODOWISKA: LEKCJA Z ANTIOCHII (GAL 2:11–14) I CENA ODWAGI',
      paragraphs: [
        'Niezwykle pouczającym, a zarazem poruszającym dowodem na to, jak potężna potrafi być presja środowiska religijnego, jest biblijna relacja o sporze w Antiochii, zanotowana przez apostoła Pawła w Liście do Galacjan: „A gdy Piotr przyszedł do Antiochii, sprzeciwiłem mu się w twarz, bo zasłużył na naganę. Zanim bowiem przyszli niektórzy od Jakuba, jadał z poganami. Lecz gdy oni przyszli, wycofywał się i oddzielał, bojąc się tych, którzy byli z obrzezania. A razem z nim obłudnie postępowali [synypekrithesan, Strong G4942 — udawali razem z nim] i inni Żydzi, tak że i Barnaba dał się wciągnąć w ich obłudę [hypokrisei]” (Gal 2:11–13 UBG).',
        'Zdumiewające! Piotr — filar Kościoła, naoczny świadek zmartwychwstania, człowiek, który w domu Korneliusza na własne oczy widział wylanie Ducha Świętego na nieobrzezanych pogan — uległ lękowi przed opinią rygorystycznej delegacji z Jerozolimy. Ze strachu przed utratą wizerunku prawowiernego Żyda przestał siadać do wspólnego stołu z chrześcijanami pochodzenia pogańskiego. Co gorsza, jego wizerunkowy kompromis natychmiast pociągnął za sobą innych, w tym szlachetnego Barnabę. Pokazuje to, jak potężny i zaraźliwy jest lęk przed religijnym ostracyzmem — potrafi złamać nawet duchowych tytanów.',
        'W tej dramatycznej chwili apostoł Paweł wykazał się heroiczną bezkompromisowością: „Gdy jednak widziałem, że nie postępują prosto według prawdy ewangelii, powiedziałem Piotrowi przy wszystkich: Jeśli ty, będąc Żydem, żyjesz po pogańsku, a nie po żydowsku, dlaczego zmuszasz pogan, aby żyli po żydowsku?” (Gal 2:14 UBG). Paweł zrozumiał, że religijna gra pozorów nie jest drobną słabością charakteru, lecz śmiertelnym ciosem w samo serce Ewangelii. Jeśli bowiem do Bożej łaski musimy dodawać zewnętrzne, wizerunkowe rytuały, aby zasłużyć na akceptację, to śmierć Chrystusa traci swoje zbawcze znaczenie. Prawda Ewangelii domaga się odwagi odrzucenia konformizmu, nawet jeśli ceną jest publiczna konfrontacja.'
      ]
    },
    {
      heading: '6. 6 KROKÓW DO WOLNOŚCI OD RELIGIJNYCH POZORÓW: PRAKTYCZNY PRZEWODNIK EkoCC',
      paragraphs: [
        'Jak w praktyce codziennego życia wyzwolić się z paraliżującego przymusu bycia nieskazitelnym i zacząć żyć w autentycznej wolności dzieci Bożych? Redakcja eM i Christian Culture Network proponuje 6 sprawdzonych, biblijnych decyzji, które uzdrawiają duszę i relacje:',
        '1. Zrezygnuj z języka wyuczonej nieskazitelności (Mt 5:37; Jk 5:16 UBG). Przestań odpowiadać automatycznym „wszystko w porządku”, gdy w twoim sercu toczy się bolesna walka. Nie musisz opowiadać o swoich problemach każdemu napotkanemu człowiekowi, ale miej odwagę powiedzieć zaufanemu przyjacielowi: „Przechodzę trudny czas, potrzebuję twojej modlitwy i wsparcia”. Zdjęcie maski przed jednym dojrzałym człowiekiem jest początkiem duchowego uzdrowienia.',
        '2. Odrzuć duchową rywalizację i porównywanie się z innymi (2 Kor 10:12; Gal 6:4 UBG). Pismo Święte ostrzega: „Gdy sami siebie mierzą sobą i porównują się sami ze sobą, postępują nierozumnie”. Sukces duchowy twojego brata nie umniejsza twojej wartości w oczach Boga, a jego potknięcie nie powinno być pożywką dla twojej pychy. Każdy z nas biegnie swój własny bieg wiary, patrząc na Jezusa, a nie na trybuny.',
        '3. Praktykuj pobożność w ukryciu przed ludzkim wzrokiem (Mt 6:1–6 UBG). Zrób coś dobrego, ofiaruj wsparcie finansowe, pość lub módl się intensywnie w taki sposób, aby nikt poza Bogiem się o tym nie dowiedział. Świadoma rezygnacja z ludzkiego poklasku i budowania na pobożności kapitału wizerunkowego jest najskuteczniejszą odtrutką na truciznę faryzejizmu.',
        '4. Zbuduj w swoim domu i wspólnocie kulturę bezpiecznego szpitala (Gal 6:1–2; Rz 15:1–2 UBG). Jeśli ktoś w twojej obecności przyznaje się do słabości, błędu czy wątpliwości, nie atakuj go moralizatorstwem i nie przekazuj jego tajemnicy dalej pod płaszczykiem „prośby o modlitwę”. Bądź człowiekiem, przy którym inni czują się bezpieczni — który potrafi wysłuchać bez potępienia i podać pomocną dłoń w duchu łagodności.',
        '5. Odróżnij biblijne uświęcenie od zewnętrznego moralizmu (Kol 2:20–23; Tyt 2:11–12 UBG). Prawdziwe uświęcenie nie polega na mechanicznym dopasowywaniu się do kodeksu zakazów i nakazów grupy, lecz jest nadprzyrodzonym dziełem Ducha Świętego, który od wewnątrz przemienia nasze pragnienia i motywacje. Moralizm rodzi pychę u silniejszych i rozpacz u słabszych; Boża łaska rodzi pokorę, miłość i autentyczną prawość.',
        '6. Zakotwicz swoją tożsamość w krzyżu Chrystusa, a nie w opinii ludzi (Rz 8:1.31–34; Gal 1:10 UBG). Za każdym razem, gdy ogarnia cię lęk przed tym, co pomyślą inni, przypomnij sobie: Ten, który zna o tobie najmroczniejszą prawdę, oddał za ciebie swoje życie na Golgocie i ogłasza cię swoim ukochanym dzieckiem. Jeśli Bóg cię przyjął i usprawiedliwił, żaden ludzki trybunał nie ma władzy odebrać ci twojej godności.'
      ]
    }
  ],
  conclusion: 'Religia oparta na konkursie wizerunkowym jest duchową ślepą uliczką — produkuje albo pysznych faryzeuszy gardzących otoczeniem, albo wycieńczonych, zalęknionych ludzi ukrywających swoje rany za fasadą uśmiechu. Jezus Chrystus nie przyszedł na świat, aby oklaskiwać nasze sceniczne kreacje, lecz aby ocalić i uzdrowić to, co zginęło. Najwspanialszym odkryciem chrześcijaństwa jest prawda, że przed Bogiem nie musimy niczego udawać. Możemy stanąć w świetle Jego prawdy ze swoją słabością, grzechem i zmęczeniem, aby doświadczyć cudu usprawiedliwienia z łaski. Dopiero człowiek, który zrzucił ciężar religijnej maski, staje się naprawdę wolny, by kochać Boga całym sercem i bezinteresownie służyć drugiemu człowiekowi.',
  cta: 'Czy czujesz w swoim życiu zmęczenie nieustannym udawaniem, że wszystko masz pod kontrolą? Zrób dziś krok ku prawdziwej wolności. Zatrzymaj się w zaciszu swojego pokoju, zamknij drzwi i powiedz Bogu w pełnej szczerości wszystko to, czego dotąd bałeś się ujawnić przed ludźmi. Zapraszamy do wspólnej modlitwy:\n\n„Panie Boże Wszechmogący, Stwórco mojego serca, dziękuję Ci, że przed Twoim obliczem nie muszę nosić żadnych masek ani udawać kogoś, kim nie jestem. Ty znasz każdą moją myśl, każdy ukryty lęk, każdą słabość i każdy bolesny upadek, a mimo to w Jezusie Chrystusie ogarniasz mnie nieskończoną, wierną miłością. Przebacz mi chwile, w których bardziej zależało mi na ludzkim poklasku i nienagannej opinii niż na Twojej prawdzie. Uwolnij mnie od ducha faryzejizmu, od porównywania się z innymi i od potępiania bliźnich. Napełnij moje serce Twoją łaską i pokojem, abym potrafił żyć w prawdzie, pokorze i autentycznej miłości. Przez Jezusa Chrystusa, mojego Pana i Zbawiciela. Amen.”',
  sources: [
    {
      name: 'Erving Goffman — „The Presentation of Self in Everyday Life” (Anchor Books / Doubleday); klasyczna teoria dramaturgiczna i socjologia zarządzania wrażeniem (impression management)',
      url: 'https://www.penguinrandomhouse.com'
    },
    {
      name: 'Gordon W. Allport, J. Michael Ross — „Personal Religious Orientation and Prejudice” (Journal of Personality and Social Psychology, 1967); naukowa typologia religijności wewnętrznej (intrinsic) oraz zewnętrznej (extrinsic)',
      url: 'https://psycnet.apa.org/record/1967-11536-001'
    },
    {
      name: 'Kenneth I. Pargament (Bowling Green State University) — „The Psychology of Religion and Coping: Theory, Research, Practice” (Guilford Press); badania kliniczne nad dojrzałymi i neurotycznymi formami radzenia sobie ze stresem w kontekście wiary',
      url: 'https://www.guilford.com'
    },
    {
      name: 'John Welwood — „Toward a Psychology of Awakening: Buddhism, Psychotherapy, and the Path of Personal and Spiritual Transformation” (Shambhala); definicja mechanizmu ucieczki w duchowość (spiritual bypass)',
      url: 'https://www.shambhala.com'
    },
    {
      name: 'Brené Brown (University of Houston) — „The Gifts of Imperfection” oraz „Daring Greatly” (Random House); badania nad perfekcjonizmem jako tarczą przed wstydem oraz rolą odwagi do podatności na zranienie (vulnerability)',
      url: 'https://brenebrown.com'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Ewangelia według św. Mateusza 5:37; 6:1–6.16–18; 23:1–7.25–28; Ewangelia według św. Łukasza 18:9–14; List do Galacjan 1:10; 2:11–14; 6:1–4; List do Rzymian 3:23–24; 8:1.31–34; 15:1–2; 1 Księga Samuela 16:7; 2 List do Koryntian 10:12; List do Kolosan 2:20–23; List Jakuba 5:16; List do Tytusa 2:11–12',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek and Hebrew Concordance — Hasła: G5273 (hypokrites — aktor, obłudnik), G5272 (hypokrisis — obłuda, gra sceniczna), G4942 (synypokrinomai — udawać z kimś, naśladować obłudę), G2433 (hilaskomai — zmiłować się, dokonać przebłagania), H3824 (lebab / lew — serce, wewnętrzny człowiek, sumienie)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasada o naturze człowieka i grzechu, zbawieniu i usprawiedliwieniu wyłącznie z łaski przez wiarę w Jezusa Chrystusa, uświęceniu przez Ducha Świętego oraz wspólnocie Kościoła jako Ciała Chrystusowego',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Ewangelia według św. Mateusza 23:27–28 („Biada wam, uczeni w Piśmie i faryzeusze, obłudnicy! Bo jesteście podobni do grobów pobielanych, które z zewnątrz wydają się piękne, ale wewnątrz pełne są kości umarłych i wszelkiej nieczystości. Tak i wy na zewnątrz wydajecie się ludziom sprawiedliwi, ale wewnątrz jesteście pełni obłudy i nieprawości”); Ewangelia według św. Łukasza 18:13–14 („A celnik, stojąc z daleka, nie śmiał nawet oczu podnieść ku niebu, ale bił się w piersi, mówiąc: Boże, bądź miłosierny mnie grzesznemu!... ten odszedł do swego domu usprawiedliwiony”); 1 Księga Samuela 16:7 („Człowiek bowiem patrzy na to, co jest przed oczyma, ale PAN patrzy na serce”); List do Galacjan 2:11–14; List do Rzymian 3:23–24 (UBG)',
  imagePath: path.join(ROOT, 'images/em/art-gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.jpg'),
  imageCaption: 'Ilustracja redakcyjna eM / Christian Culture: Odłożona na bok maska pozorów obok otwartego Pisma Świętego na ciepłym, drewnianym stole w świetle poranka — symbol wyzwolenia z faryzejskiej presji nieskazitelności i powrotu do autentycznej prawdy serca przed Bogiem.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#ReligiaBezMaski',
    '#Autentyczność',
    '#eM',
    '#Wiara',
    '#ŁaskaBoża',
    '#UBG',
    '#EkoCC365',
    '#Goffman',
    '#Allport',
    '#PobielaneGroby',
    '#WolnośćWChrystusie'
  ],
  seo: {
    title: 'Gdy religia staje się konkursem na nienaganny wizerunek | eM Christian Culture',
    description: 'Dlaczego w kościele tak trudno przyznać się do słabości? Odkryj egzegezę greckiego hypokrites, badania Goffmana i Allporta oraz 6 kroków do wiary bez masek.',
    keywords: [
      'gdy religia staje sie konkursem na nienaganny wizerunek',
      'wizerunkowosc w kosciele',
      'hipokryzja faryzejska hypokrites',
      'groby pobielane mateusza 23 UBG',
      'gordon allport religijnosc zewnetrzna',
      'erving goffman impression management w kosciele',
      'sprawa w antiochii pawel i piotr galacjan 2',
      'pan patrzy na serce 1 samuela 16',
      'usprawiedliwienie z laski rzymian 3',
      'motywacja em christian culture',
      'cezary rogowski publicystyka',
      'ekocc kalendarz 365 artykulow'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynam przygotowanie artykułu EkoCC (Slot 2026-11-15, LP 12)...');
  console.log('Tytuł:', articleData.title);
  console.log('Grafika:', articleData.imagePath);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  // Zapisz scripts/current-article-data.json
  const currentDataPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentDataPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log('✔ Zapisano scripts/current-article-data.json');

  // Uruchom pakowanie pakietem DOCX, TXT, SEO, ZIP
  const res = await packageEkoccArticle(articleData);
  console.log('\n🎉 Kompletny pakiet redakcyjny przygotowany pomyślnie!');
  console.log('ZIP:', res.zipPath);
  console.log('DOCX:', res.docxPath);
  console.log('TXT:', res.txtPath);
  console.log('SEO:', res.seoPath);
  console.log('TempDir:', res.tempDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
