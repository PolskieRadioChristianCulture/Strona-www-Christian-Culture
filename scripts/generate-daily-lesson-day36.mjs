import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 36: Wj 5:1–23 (5 listopada 2026 r., Czwartek)
const DAY_NUM = 36;
const DATE_STR = '2026-11-05';
const DATE_FORMATTED = 'Czwartek, 5 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 5:1–23';
const TITLE = 'PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY';
const SUBTITLE = 'Pycha tyrana („Nie znam PANA”), odbieranie słomy przy wyrobie cegieł, krzyk bitych przełożonych i szczera modlitwa Mojżesza w dolinie rozczarowania';
const MEMORY_VERSE = '„Potem Mojżesz i Aaron przyszli do faraona i powiedzieli: Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni.” (Wj 5:1, UBG)';
const THEME = 'Piąty rozdział Księgi Wyjścia ukazuje zderzenie Bożego autorytetu z pychą bezbożnej władzy oraz tajemnicę próby wiary: zanim przyjdzie ostateczne wyzwolenie, noc ucisku często staje się najciemniejsza. Prawdziwa wiara nie cofa się w obliczu przejściowego pogorszenia okoliczności, lecz zanosi swój ból bezpośrednio przed tron Boga.';

console.log('Rozpoczynam generowanie pełnej lekcji Dnia 36 (Wj 5:1–23)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 36
PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY
Pycha tyrana („Nie znam PANA”), odbieranie słomy przy wyrobie cegieł, krzyk bitych przełożonych i szczera modlitwa Mojżesza w dolinie rozczarowania
Czwartek, 5 listopada 2026 r.  |  Czytanie: Wj 5:1–23
TEKST PAMIĘCIOWY: „Potem Mojżesz i Aaron przyszli do faraona i powiedzieli: Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni.” (Wj 5:1, UBG)
MYŚL PRZEWODNIA: Piąty rozdział Księgi Wyjścia ukazuje zderzenie Bożego autorytetu z pychą bezbożnej władzy oraz tajemnicę próby wiary: zanim przyjdzie ostateczne wyzwolenie, noc ucisku często staje się najciemniejsza. Prawdziwa wiara nie cofa się w obliczu przejściowego pogorszenia okoliczności, lecz zanosi swój ból bezpośrednio przed tron Boga.

ZANIM OTWORZYSZ BIBLIĘ
Po duchowym triumfie końca czwartego rozdziału, gdy starsi i lud Izraela uwierzyli Bożym obietnicom i oddali pokłon Panu (Wj 4:31), następuje gwałtowne zderzenie z twardą rzeczywistością imperium. Piąty rozdział Księgi Wyjścia przenosi nas z cichego zgromadzenia wierzących prosto do pałacu najpotężniejszego monarchy ówczesnego świata. Mojżesz i Aaron stają przed obliczem faraona nie jako petenci proszący o litość, lecz jako ambasadorowie Króla królów z prorocką formułą: „Tak mówi PAN, Bóg Izraela: Wypuść mój lud!”.
Reakcja faraona odsłania samą istotę duchowego buntu każdego totalitarnego systemu przeciwko Stwórcy: „Któż to jest PAN, abym miał słuchać jego głosu? Nie znam PANA, a Izraela też nie wypuszczę!” (Wj 5:2). Zamiast natychmiastowego cudu i otwarcia bram wolności, posłuszeństwo Mojżesza wywołuje brutalny odwet tyrana. Faraon oskarża Hebrajczyków o lenistwo, nazywa Boże obietnice „kłamliwymi słowami” i wydaje okrutny dekret: niewolnicy muszą nadal wyrabiać tę samą dzienną normę cegieł, ale odtąd nie otrzymają słomy — muszą sami zbierać ścierń po polach Egiptu.
Rozdział ten jest jedną z najważniejszych biblijnych lekcji o anatomii duchowego kryzysu. Przełożeni synów Izraela, bici przez egipskich nadzorców, obracają swój gniew przeciwko Mojżeszowi i Aaronowi, a sam Mojżesz — wstrząśnięty cierpieniem braci — wraca do Boga z dramatycznym pytaniem: „Panie, dlaczego wyrządziłeś to zło twojemu ludowi? (...) A ty nie wybawiłeś swego ludu” (Wj 5:22–23). Bóg dopuszcza ten pozorny regres, aby oczyścić wiarę swego ludu ze złudzeń co do łaskawości Egiptu i przygotować scenę dla objawienia swojej wszechmocnej ręki w rozdziale szóstym.

CZĘŚĆ I — AMBASADOROWIE BOGA PRZED TRONEM TYRANA (Wj 5:1–5)
1. Odwaga wejścia do pałacu faraona (5:1a)
Tekst rozpoczyna się słowami: „Potem Mojżesz i Aaron przyszli do faraona”. Dwaj sędziwi Hebrajczycy — osiemdziesięcioletni pasterz i jego osiemdziesięciotrzyletni brat — bez armii, bez oręża i bez ludzkich gwarancji bezpieczeństwa przekraczają próg dworu władcy, który uważał się za wcielenie boga Horusa i syna boga słońca Ra. Posłuszeństwo Słowu Bożemu daje odwagę stanięcia przed najwyższymi potęgami tego świata.
2. Prorocka formuła królewska: „Tak mówi PAN” (5:1b)
Po raz pierwszy w Piśmie Świętym pada klasyczna formuła prorocka: „Tak mówi PAN, Bóg Izraela” (hebr. ko amar JHWH Elohej Jisrael). Była to oficjalna formuła dyplomatyczna starożytnego Wschodu, którą posłowie rozpoczynali odczytanie dekretu nadrzędnego suwerena. Mojżesz stawia JHWH ponad faraonem, a Boga pogardzanych niewolników ogłasza prawdziwym Władcą historii.
3. Boże żądanie: „Wypuść mój lud!” (5:1c)
Rozkaz brzmi jednoznacznie: „Wypuść mój lud” (hebr. szallach et ammi). Faraon uważał Hebrajczyków za swoją państwową własność i darmową siłę roboczą. Bóg deklaruje swoje wyłączne prawo własności: Izrael należy do Pana, a żadna ludzka władza nie ma prawa zniewalać tych, których Bóg nazwał swoim ludem.
4. Cel wolności: święto dla Pana na pustyni (5:1d)
„Aby dla mnie obchodził święto na pustyni” (hebr. we-jachoggu li ba-midbar). Czasownik chagag oznacza radosne świętowanie połączone z pielgrzymką i uwielbieniem. Biblijna wolność nie jest anarchią ani samowolą — jest wyzwoleniem z niewoli grzechu i tyranii po to, by z radością służyć Bogu i świętować w Jego obecności.
5. Pycha faraona: „Któż to jest PAN?” (5:2a)
Faraon odpowiada z pogardą: „Któż to jest PAN, abym miał słuchać jego głosu i wypuścić Izraela?” (hebr. mi JHWH aszer eszma be-kolo). W politeistycznym świecie Egiptu władca znał dziesiątki bóstw, lecz imię JHWH było dla niego obce i nic nieznaczące. To pytanie jest mottem każdego bezbożnego humanizmu i tyranii: człowiek stawiający się na miejscu Boga odrzuca najwyższy autorytet Stwórcy.
6. Wyznanie duchowej ślepoty: „Nie znam PANA” (5:2b)
„Nie znam PANA, a Izraela też nie wypuszczę”. Słowa faraona mają głęboko ironiczną wymowę prorocką: dziś z pychą oświadcza, że „nie zna PANA”, lecz cała dalsza akcja Księgi Wyjścia (plagi i Morze Czerwone) będzie Bożą odpowiedzią, po której „poznają Egipcjanie, że Ja jestem PANEM” (Wj 7:5; 14:4).
7. Wyjaśnienie posłańców: „Bóg Hebrajczyków ukazał się nam” (5:3a)
Mojżesz i Aaron cierpliwie tłumaczą w języku zrozumiałym dla egipskiej administracji: „Bóg Hebrajczyków ukazał się nam” (hebr. Elohej ha-Iwrim nikra alejnu). Nie proszą o polityczny przewrót, lecz świadczą o realnym spotkaniu z żywym Bogiem, które nakłada na nich bezwzględny obowiązek posłuszeństwa.
8. Trzy dni drogi i ofiara na pustyni (5:3b)
„Pozwól nam iść trzy dni drogą na pustynię i złożyć ofiarę PANU, naszemu Bogu”. Żądanie trzydniowej pielgrzymki było testem woli faraona: jeśli odmówi nawet kilkudniowego urlopu na oddanie czci Bogu, obnaży przed całym światem swoją absolutną, bezlitosną tyranię i brak jakiejkolwiek dobrej woli.
9. Bojaźń Boża ponad strachem przed człowiekiem (5:3c)
„By nie nawiedził nas zarazą albo mieczem”. Mojżesz i Aaron dają faraonowi do zrozumienia, że bardziej boją się nieposłuszeństwa wobec Świętego Boga niż gniewu egipskiego monarchy. Prawdziwa bojaźń Pańska uwalnia od paraliżującego strachu przed ludźmi.
10. Oskarżenie o sabotaż i odrywanie od pracy (5:4–5)
Król Egiptu przerywa rozmowę: „Dlaczego wy, Mojżeszu i Aaronie, odrywacie lud od pracy? Idźcie do waszych robót... Oto lud tej ziemi jest teraz liczny, a wy go odrywacie od robót”. Dla tyrana człowiek ma wartość wyłącznie jako trybik w machinie produkcyjnej; każda myśl o Bogu, modlitwie i odpoczynku jest traktowana jako zagrożenie dla gospodarki imperium.

CZĘŚĆ II — PSYCHOLOGIA TYRANII: CEGŁY BEZ SŁOMY I WOJNA INFORMACYJNA (Wj 5:6–14)
11. Błyskawiczny dekret odwetowy (5:6)
„Rozkazał więc faraon tego dnia nadzorcom ludu i jego przełożonym”. Jeszcze tego samego dnia faraon uruchamia aparat represji. Struktura obozu pracy była dwupoziomowa: na górze stali egipscy nadzorcy (hebr. nogesim — dosł. ciemiężyciele, poganiacze), a pod nimi hebrajscy przełożeni (hebr. szoterim — pisarze i brygadziści odpowiadający za rozliczanie norm).
12. Odebranie słomy do wyrobu cegieł (5:7)
„Już więcej nie będziecie dawać ludowi słomy do wyrobu cegły, jak dotychczas. Niech sami idą i zbierają sobie słomę”. W starożytnym Egipcie cegły suszone na słońcu wytwarzano z mułu nilowego mieszanego z posiekaną słomą (hebr. tewen). Słoma pełniła rolę zbrojenia, a kwasy organiczne uwalniane z niej podczas fermentacji zwiększały plastyczność i wytrzymałość cegieł. Bez słomy muł pękał i kruszył się.
13. Utrzymanie pełnej normy dziennej (5:8a)
„Wyznaczcie im tę samą liczbę cegieł, jaką wyrabiali poprzednio, nic nie zmniejszajcie” (hebr. matkonet ha-lewenim). Archeologia egipska (m.in. malowidła z grobowca Rechmire w Tebach oraz papirusy z Luwru) potwierdza istnienie rygorystycznych dziennych kontyngentów cegieł (często od 2000 do 3000 sztuk na brygadę). Wymaganie tej samej normy przy konieczności samodzielnego szukania surowca było fizycznie niewykonalne.
14. Duchowa diagnoza tyrana: „Próżnują!” (5:8b)
„Próżnują bowiem (hebr. nirpim hem) i dlatego wołają: Pozwól nam pójść i złożyć ofiarę naszemu Bogu”. W oczach świata pogoń za rzeczami duchowymi, modlitwa i studiowanie Słowa są pogardliwie nazywane „próżnowaniem” i marnowaniem czasu.
15. Strategia zagłuszania Bożego głosu (5:9a)
„Niech praca tych ludzi będzie cięższa, aby byli nią zajęci”. Oto ponadczasowa taktyka duchowego wroga dusz: przeciążyć człowieka pracą, zabieganiem, stresem i walką o przetrwanie do tego stopnia, by nie miał już ani sił, ani czasu podnieść oczu ku niebu i pomyśleć o zbawieniu.
16. Nazywanie Bożych obietnic „kłamliwymi słowami” (5:9b)
„A nie ufali kłamliwym słowom” (hebr. be-diwrej szaker). Faraon prowadzi otwartą wojnę informacyjną i psychologiczną: Słowo samego Boga JHWH nazywa kłamstwem i iluzją, aby zniszczyć autorytet Mojżesza i odebrać niewolnikom nadzieję.
17. Egzekucja rozkazu przez aparat ucisku (5:10–11)
Egipscy nadzorcy i przełożeni przekazują dekret ludowi: „Tak mówi faraon: Nie będę wam dawał słomy. Sami idźcie, zbierajcie sobie słomę, gdzie ją możecie znaleźć”. Zwróćmy uwagę na kontrast: w wersecie 1 brzmiało wyzwalające „Tak mówi PAN”, a w wersecie 10 rozlega się miażdżące „Tak mówi faraon”. Dwa królestwa i dwa głosy ścierają się w walce o duszę Izraela.
18. Rozproszenie ludu i zbieranie ścierni (5:12)
„Lud rozproszył się więc po całej ziemi Egiptu, aby zbierać ścierń (hebr. kasz) zamiast słomy”. Gdy właściwa słoma ze spichlerzy została zamknięta, zdesperowani Izraelici musieli wyrywać z pól suche resztki ścierniska, chwasty i trzcinę, krwawiąc dłonie pod palącym słońcem.
19. Codzienna presja nadzorców (5:13)
Nadzorcy przynaglali ich bez litości (hebr. aicim): „Wykonujcie wasze roboty, codzienną pracę jak wtedy, gdy wam dawano słomę”. System totalitarny i niewola grzechu zawsze żądają coraz więcej, dając w zamian coraz mniej.
20. Bicie przełożonych Izraela (5:14)
Gdy dzienne kontyngenty załamały się („ani wczoraj, ani dzisiaj”), gniew spadł na hebrajskich przełożonych (szoterim), których bito kijami. Przełożeni ci przyjęli razy na własne plecy, stając pomiędzy okrutnymi poganiaczami a swoimi wycieńczonymi braćmi.

CZĘŚĆ III — ROZCZAROWANIE PRZEŁOŻONYCH I Sąd NAD POSŁAŃCAMI (Wj 5:15–21)
21. Apelacja przełożonych bezpośrednio do faraona (5:15–16)
Hebrajsko-egipscy brygadziści udają się do pałacu, sądząc, że okrutne zarządzenie to nadużycie urzędników niższego szczebla, o którym król nie wie. Wołają: „Czemu postępujesz tak ze swoimi sługami? Nie dają twoim sługom słomy, a mówią: Róbcie cegłę. I oto biją twe sługi, a to wina twojego ludu”.
22. Złudzenie co do sprawiedliwości tyrana (5:15–16)
Trzykrotnie nazywają siebie „sługami faraona”. Wciąż jeszcze pokładają nadzieję w „sprawiedliwości” egipskiego systemu. Bóg musiał dopuścić ten wstrząs, aby całkowicie wyleczyć Izraelitów ze złudzeń, że w domu niewoli można wynegocjować godne życie.
23. Lodowata odpowiedź monarchy (5:17–18)
Faraon rozwiewa wszelkie złudzenia: „Próżnujecie, próżnujecie (nirpim attem, nirpim)! (...) Teraz więc idźcie i pracujcie. Słomy wam nie dadzą, ale macie dostarczać taką samą ilość cegieł”. Maski opadły — źródłem terroru jest sam władca.
24. Świadomość tragicznego położenia (5:19)
„A przełożeni spośród synów Izraela zobaczyli, że są w złym położeniu” (hebr. be-ra). Po ludzku znaleźli się w sytuacji bez wyjścia: między młotem królewskiego dekretu a kowadłem fizycznej niemożliwości. Często dopiero wtedy, gdy wszystkie ludzkie podpory zawodzą, człowiek jest gotów na wyłączne działanie Boga.
25. Spotkanie z czekającymi Mojżeszem i Aaronem (5:20)
„Gdy wychodzili od faraona, spotkali Mojżesza i Aarona, którzy na nich czekali”. Bracia nie uciekli w bezpieczne miejsce — stali u bram pałacu, solidaryzując się z cierpiącymi reprezentantami narodu.
26. Gorzki wyrzut: „Niech PAN wejrzy na was i osądzi!” (5:21a)
Złamani bólem przełożeni wybuchają gniewem przeciwko Bożym sługom: „Niech PAN wejrzy na was i osądzi!”. Jakże szybko powierzchowna wiara z Wj 4:31 załamuje się w ogniu pierwszego doświadczenia! Gdy pojawia się krzyż i cierpienie, tłum często odwraca się od tych, których wczoraj witał z entuzjazmem.
27. Oskarżenie o zepsucie opinii i sprowadzenie miecza (5:21b)
„Sprawiliście, że staliśmy się wstrętni (hebr. hiwasztem et reuchenu — dosł. zepsuliście naszą woń) w oczach faraona i w oczach jego sług, i daliście im do ręki miecz, aby nas zabili”. Prawda Boża zawsze burzy fałszywy „święty spokój” kompromisu ze światem i wywołuje wrogość sił ciemności.

CZĘŚĆ IV — SZCZERA MODLITWA MOJŻESZA W DOLINIE CIEMNOŚCI (Wj 5:22–23)
28. Kierunek w kryzysie: „Wtedy Mojżesz wrócił do PANA” (5:22a)
To najważniejszy zwrot w całym rozdziale: „Wtedy Mojżesz wrócił do PANA” (hebr. wa-jaszow Mosze el JHWH). Mojżesz nie wdaje się w kłótnię ze zgorzkniałymi przełożonymi, nie broni swojego honoru ani nie porzuca służby. Ze swoim bólem i niezrozumieniem wraca prosto w obecność Boga.
29. Dramatyczne „Dlaczego?” wiernego sługi (5:22b)
Mojżesz pyta z głębi zranionego serca pasterza: „Panie, dlaczego wyrządziłeś to zło twojemu ludowi? Dlaczego mnie tu posłałeś?”. Biblia nie cenzuruje trudnych pytań ludzi wierzących (podobnie wołali Hiob, Jeremiasz i Habakuk). Bóg woli szczery płacz i bolesne pytania zanoszone w modlitwie niż zimną obojętność i odejście od Niego.
30. Konfrontacja obietnicy z rzeczywistością (5:23a)
„Odkąd bowiem poszedłem do faraona, aby mówić w twoim imieniu, gorzej się obchodzi z tym ludem”. Mojżesz zrobił dokładnie to, co Bóg nakazał — mówił w Jego imieniu — a rezultatem po ludzku było pogorszenie losu niewolników. Posłuszeństwo Bogu nie gwarantuje braku burz; często to właśnie posłuszeństwo wywołuje najgwałtowniejszy sztorm.
31. Pozorne milczenie i zwłoka Boga: „A ty nie wybawiłeś swego ludu” (5:23b)
Rozdział kończy się dramatycznym zawieszeniem: „a ty nie wybawiłeś swego ludu” (hebr. we-haccel lo hiccalta et ammecha). Mojżesz oczekiwał natychmiastowego wyzwolenia, nie rozumiejąc jeszcze, że Boży plan wymaga czasu, sądu nad bogami Egiptu i pełnego dojrzenia historii.
32. Pedagogika doliny próby (5:1–23)
Dlaczego Bóg dopuścił kryzys z cegłami bez słomy? Po pierwsze, aby obnażyć do końca demoniczną naturę niewoli faraona. Po drugie, aby złamać poleganie Mojżesza i Izraela na ludzkich negocjacjach. Po trzecie, aby wyzwolenie było w stu procentach dziełem samej łaski i potężnej ręki Boga (Wj 6:1).

JEZUS W CENTRUM — WYZWOLICIEL Z NIEWOLI GRZECHU I PAN WŚRÓD BURZY
33. Chrystus przed obliczem władcy tego świata (Wj 5:1–2 a J 12:31; 14:30; Kol 2:15)
Mojżesz stający przed faraonem z żądaniem: „Wypuść mój lud!” jest typem Jezusa Chrystusa, który przyszedł na świat, aby skonfrontować się z duchowym faraonem — szatanem, „władcą tego świata” — i ogłosić jeńcom grzechu całkowite wyzwolenie (Łk 4:18).
34. Odrzucenie Syna Bożego przez świat (Wj 5:2 a J 1:10–11; 8:19; 16:3)
Aroganckie słowa faraona: „Nie znam PANA!” znajdują swoje pełne odbicie w postawie świata i religijnych przywódców wobec Jezusa: „Na świecie był i świat przez niego powstał, ale świat go nie poznał” (J 1:10). Duch antychrysta zawsze powtarza pytanie faraona: „Któż to jest Pan, abym miał słuchać jego głosu?”.
35. Bezwzględne jarzmo grzechu i religii uczynków a słodkie jarzmo Chrystusa (Wj 5:7–18 a Mt 11:28–30; 23:4)
Faraon żądał cegieł bez słomy, nakładając ciężary nie do uniesienia i oskarżając wyczerpanych ludzi o lenistwo. Taki jest obraz niewoli grzechu i faryzejskiego legalizmu. W zupełnym kontraście Jezus Chrystus woła do utrudzonych: „Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek... Albowiem moje jarzmo jest lekkie, a moje brzemię delikatne”.
36. Chrystus odrzucony przez własnych braci (Wj 5:20–21 a Dz 7:25–27, 35; Iz 53:3)
Gdy cierpienie wzrosło, przełożeni Izraela oskarżyli i odrzucili Mojżesza. Podobnie Jezus Chrystus — choć przyszedł zbawić swój lud — został wzgardzony, fałszywie oskarżony o podburzanie narodu i odrzucony przez tych, którym przyniósł wolność.
37. Prawdziwy Orędownik niosący razy za swój lud (Wj 5:14, 22 a Iz 53:4–5; Hbr 4:14–16)
Przełożeni przyjęli bicie za niewykonaną normę, a Mojżesz zaniósł płacz ludu przed oblicze Boga. Jezus Chrystus poszedł nieskończenie dalej: na swoje własne plecy przyjął biczowanie i gniew Boży należny za nasze grzechy, a dziś jako Najwyższy Kapłan nieustannie wstawia się za nami przed tronem Ojca.
38. Wolność do świętowania Paschy na pustyni (Wj 5:1, 3 a 1 Kor 5:7–8; Hbr 13:12–13)
Celem wyjścia z Egiptu było złożenie ofiary i obchodzenie święta dla Pana. W Chrystusie — naszym Baranku Paschalnym, który został ofiarowany za nas — wychodzimy poza obóz tego świata, aby całe nasze życie stało się nieustannym świętem wdzięczności, czystości i prawdy.
39. Godzina ciemności przed porankiem zmartwychwstania (Wj 5:22–23 a J 16:20–22; Łk 24:21)
Rozpacz Mojżesza („a ty nie wybawiłeś swego ludu”) przypomina smutek uczniów w Wielki Piątek i na drodze do Emaus: „A myśmy się spodziewali, że on jest tym, który miał odkupić Izraela”. Najciemniejsza godzina Golgoty poprzedzała jednak chwalebny poranek Zmartwychwstania!

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 5:1 → Iz 43:1; Łk 4:18–19. Dlaczego Bóg nazywa uciemiężonych niewolników „moim ludem” i jak Jezus realizuje misję wyzwolenia jeńców?
• Wj 5:2 → Hi 21:14–15; Ps 14:1; Rz 1:28. Do czego prowadzi dumna postawa człowieka mówiącego: „Kim jest Wszechmocny, abyśmy Mu służyli?”?
• Wj 5:3 → Dz 4:19; 5:29. Jak postawa Mojżesza i Aarona koresponduje z apostolską zasadą: „Trzeba bardziej słuchać Boga niż ludzi”?
• Wj 5:4–9 → Łk 23:2. W jaki sposób oskarżenie Mojżesza o odrywanie ludu od pracy i podburzanie narodu powtórzyło się w procesie Jezusa przed Piłatem?
• Wj 5:7–9 → Mt 11:28–30; Gal 5:1. Na czym polega różnica między okrutnym jarzmem duchowego faraona a odpoczynkiem i wolnością w Chrystusie?
• Wj 5:9 → 2 Krn 32:10–15; Iz 36:18–20. Jak pogańscy władcy (faraon, Sennacheryb) próbowali podważyć zaufanie ludu Bożego, nazywając Boże obietnice „kłamliwymi słowami”?
• Wj 5:14–16 → J 8:34; Rz 6:16–23. Dlaczego służba grzechowi i światu zawsze kończy się rozczarowaniem, biciem i śmiercią?
• Wj 5:20–21 → Wj 14:11–12; 16:2–3. Jak pierwszy kryzys przy cegłach ujawnia skłonność ludzkiego serca do szemrania i obwiniania Bożych sług w obliczu trudności?
• Wj 5:22–23 → Jer 20:7–9; Hab 1:2–3; Ps 73:13–17. Czego uczą nas szczere, pełne bólu modlitwy proroków w chwilach, gdy Boże drogi wydają się niezrozumiałe?
• Wj 5:23 → 1 P 1:6–7; Rz 8:28; Hbr 10:36. Dlaczego Bóg dopuszcza ogniste próby wiary, zanim wypełni swoje obietnice zbawienia?

PRAWDA NA DZIŚ
• Posłuszeństwo Bogu nie wyklucza burz: czasem pierwszym rezultatem wierności Słowu Bożemu jest zaostrzenie duchowej walki i oporu ze strony świata.
• Duch faraona nienawidzi czasu dla Boga: świat zawsze będzie nazywał modlitwę, świętowanie Sabatu i czytanie Biblii „próżnowaniem” oraz stratą czasu.
• Uważaj na pułapkę „cegieł bez słomy”: szatan chce tak przeciążyć Cię pracą, stresem i gonitwą, abyś nie miał już sił słuchać głosu Bożych obietnic.
• Obietnice Boga nigdy nie są „kłamliwymi słowami”: choć okoliczności wokół Ciebie mogą krzyczeć, że nic się nie zmienia, Słowo Pana trwa na wieki.
• Nie szukaj ratunku u faraona: wyzwolenie z duchowej niewoli nigdy nie przyjdzie przez kompromis ze światem, lecz wyłącznie z ręki Chrystusa.
• Uciekaj ze swoim bólem DO Boga, a nie OD Boga: gdy nie rozumiesz, dlaczego spotkało Cię doświadczenie, uczyń jak Mojżesz — wróć bezpośrednio przed oblicze Pana w szczerej modlitwie.
• Najciemniejsza godzina poprzedza świt: koniec piątego rozdziału nie jest końcem historii — w miejscu ludzkiej bezradności zaczyna się wszechmocne działanie Boga (Wj 6:1).

POMYŚL — PYTANIA DO REFLEKSJI
1. W jakich sytuacjach w swoim życiu doświadczyłeś tego, że po podjęciu dobrej, biblijnej decyzji trudności chwilowo wzrosły zamiast ustąpić?
2. Czy nie pozwalasz „faraonowi” współczesnego świata (nadmiarowi obowiązków, pogoni za zyskiem, rozproszeniu) odebrać Ci czasu na osobiste świętowanie i społeczność z Bogiem?
3. Jak reagujesz, gdy ludzie wokół Ciebie lekceważą Twoją wiarę lub nazywają Twoje duchowe priorytety „marnowaniem czasu”?
4. Czy w chwilach kryzysu masz tendencję do szukania winnych wokół siebie (jak przełożeni Izraela), czy do powrotu na kolana przed oblicze Boga (jak Mojżesz)?
5. Co oznacza dla Ciebie osobiście prawda, że Jezus Chrystus zdjął z Twoich ramion jarzmo „cegieł bez słomy” i obdarzył Cię łaską oraz odpoczynkiem?
6. Jakie trudne pytanie „Dlaczego, Panie?” nosisz dziś w sercu i czy odważysz się powierzyć je z ufnością Ojcu w niebie?
7. W jaki sposób możesz dziś wzmocnić brata lub siostrę w wierze, którzy przechodzą przez „dolinę rozczarowania” i czekają na wypełnienie Bożych obietnic?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Z jakim żądaniem w imieniu PANA, Boga Izraela, przyszli Mojżesz i Aaron do faraona w Wj 5:1?
Odpowiedź: „Wypuść mój lud, aby dla mnie obchodził święto na pustyni” (Wj 5:1).
2. Jak brzmiała dumna odpowiedź faraona na imię PANA w Wj 5:2?
Odpowiedź: „Któż to jest Pan, abym miał słuchać jego głosu i wypuścić Izraela? Nie znam Pana, a Izraela też nie wypuszczę” (Wj 5:2).
3. Na jak długą drogę na pustynię prosili Mojżesz i Aaron w Wj 5:3, aby złożyć ofiarę Bogu?
Odpowiedź: Na trzy dni drogi na pustynię (Wj 5:3).
4. Czego obawiali się Mojżesz i Aaron, gdyby lud nie złożył nakazanej ofiary Panu (Wj 5:3)?
Odpowiedź: Aby Bóg nie nawiedził ich zarazą albo mieczem (Wj 5:3).
5. O co król Egiptu oskarżył Mojżesza i Aarona w Wj 5:4–5?
Odpowiedź: O to, że odrywają liczny lud tej ziemi od jego robót i pracy (Wj 5:4–5).
6. Jakim dwóm grupom zwierzchników wydał faraon rozkaz zaostrzenia pracy jeszcze tego samego dnia (Wj 5:6)?
Odpowiedź: Nadzorcom ludu (Egipcjanom) oraz jego przełożonym (spośród synów Izraela) (Wj 5:6, 14).
7. Jakiego surowca zakazał faraon wydawać Izraelitom do wyrobu cegieł w Wj 5:7?
Odpowiedź: Słomy („Niech sami idą i zbierają sobie słomę”) (Wj 5:7).
8. Co faraon nakazał uczynić z dotychczasową dzienną normą (liczbą) wyrabianych cegieł (Wj 5:8)?
Odpowiedź: Nakazał wyznaczyć tę samą liczbę cegieł co poprzednio i nic z niej nie zmniejszać (Wj 5:8).
9. Jak faraon uzasadnił pragnienie Izraelitów, by pójść i złożyć ofiarę Bogu (Wj 5:8, 17)?
Odpowiedź: Stwierdził: „Próżnują bowiem i dlatego wołają: Pozwól nam pójść i złożyć ofiarę naszemu Bogu” (Wj 5:8, 17).
10. Jaki cel psychologiczny miało zwiększenie ciężaru pracy według słów faraona w Wj 5:9?
Odpowiedź: „Aby byli nią zajęci, a nie ufali kłamliwym słowom” (Wj 5:9).
11. Co musieli zbierać Izraelici po całej ziemi Egiptu zamiast słomy (Wj 5:12)?
Odpowiedź: Zbierali ścierń (ściernisko) zamiast słomy (Wj 5:12).
12. W jaki sposób nadzorcy przynaglali lud podczas pracy bez słomy (Wj 5:13)?
Odpowiedź: Mówili: „Wykonujcie wasze roboty, codzienną pracę jak wtedy, gdy wam dawano słomę” (Wj 5:13).
13. Kogo bito, gdy lud nie był w stanie wykonać wyznaczonej ilości cegieł (Wj 5:14)?
Odpowiedź: Bito przełożonych spośród synów Izraela, których nadzorcy faraona postawili nad nimi (Wj 5:14).
14. Do kogo udali się ze skargą pobici przełożeni synów Izraela w Wj 5:15?
Odpowiedź: Przyszli bezpośrednio do faraona, wołając: „Czemu postępujesz tak ze swoimi sługami?” (Wj 5:15).
15. Kogo przełożeni Izraela obarczyli winą za niewykonanie normy podczas rozmowy z faraonem w Wj 5:16?
Odpowiedź: Powiedzieli: „Nie dają twoim sługom słomy, a mówią: Róbcie cegłę. I oto biją twe sługi, a to wina twojego ludu” (Wj 5:16).
16. Jak faraon odpowiedział na skargę pobitych przełożonych Izraela w Wj 5:17–18?
Odpowiedź: Powtórzył: „Próżnujecie, próżnujecie (...) Słomy wam nie dadzą, ale macie dostarczać taką samą ilość cegieł” (Wj 5:17–18).
17. Kogo spotkali przełożeni Izraela, gdy wychodzili z pałacu od faraona (Wj 5:20)?
Odpowiedź: Spotkali Mojżesza i Aarona, którzy na nich czekali (Wj 5:20).
18. Jakie słowa sądu wypowiedzieli rozgoryczeni przełożeni do Mojżesza i Aarona w Wj 5:21?
Odpowiedź: „Niech Pan wejrzy na was i osądzi, bo sprawiliście, że staliśmy się wstrętni w oczach faraona i w oczach jego sług, i daliście im do ręki miecz, aby nas zabili” (Wj 5:21).
19. Co uczynił Mojżesz po wysłuchaniu gorzkich oskarżeń przełożonych (Wj 5:22)?
Odpowiedź: Mojżesz wrócił do PANA i wylał przed Nim swoje serce w modlitwie (Wj 5:22).
20. Jakimi słowami skargi zakończył Mojżesz swoją modlitwę w Wj 5:22–23?
Odpowiedź: „Panie, dlaczego wyrządziłeś to zło twojemu ludowi? Dlaczego mnie tu posłałeś? Odkąd bowiem poszedłem do faraona, aby mówić w twoim imieniu, gorzej się obchodzi z tym ludem; a ty nie wybawiłeś swego ludu” (Wj 5:22–23).

TWOJA DECYZJA
Piąty rozdział Księgi Wyjścia stawia każdego z nas w ogniu próby wiary. Często wyobrażamy sobie, że gdy pójdziemy za głosem Boga, wszystkie problemy natychmiast znikną, a bramy przed nami otworzą się bez oporu. Tymczasem rzeczywistość duchowej walki bywa inna: pierwsza konfrontacja z duchowym faraonem często przynosi zaostrzenie presji, niezrozumienie ze strony bliskich i poczucie, że musimy „robić cegły bez słomy”.
W takiej godzinie stoisz przed decydującym wyborem: czy uwierzysz propagandzie wroga, że Boże obietnice to „kłamliwe słowa”, i poddasz się rozgoryczeniu, czy też — wzorem Mojżesza — ze swoim bólem, zmęczeniem i pytaniami wrócisz prosto przed oblicze Pana? Pamiętaj: Bóg nie zapomniał o swoim przymierzu. On dopuszcza noc próby tylko po to, abyś przestał liczyć na litość Egiptu i zobaczył chwałę Jego wszechmocnego ramienia!
MOJA DECYZJA: Panie Boże Wszechmogący, wybieram dziś niezachwianą ufność Twojemu Słowu, nawet wtedy, gdy okoliczności wokół mnie wydają się trudniejsze niż wcześniej. Odrzucam kłamstwa wroga i nie pozwalam, by gonitwa tego świata odebrała mi czas na społeczność z Tobą i oddawanie Ci czci. Z każdym moim ciężarem, rozczarowaniem i trudnym pytaniem wracam dziś na kolana przed Twój tron, wierząc, że w Jezusie Chrystusie moje wyzwolenie jest pewne.

MODLITWA NA 5 LISTOPADA
Wszechmogący, Wiekuisty Boże, Panie zastępów i Odkupicielu uciśnionych!
Przychodzę przed Twoje święte oblicze w ten czwartek z pokorą i wdzięcznością za lekcję piątego rozdziału Księgi Wyjścia. Ty jesteś Królem nad wszystkimi królami ziemi i żadna pycha tego świata nie zdoła powstrzymać Twoich wyroków ani przekreślić Twoich obietnic.
Przebacz mi, Panie, chwile zwątpienia, gdy w obliczu narastających trudności traciłem cierpliwość, szemrałem na swoją drogę lub obwiniałem innych za moje niepowodzenia. Wybacz mi momenty, w których pozwalałem, by niewolniczy pośpiech i troski codzienności zagłuszyły w moim sercu Twój głos i odebrały mi radość świętowania przed Twoim obliczem.
Dziękuję Ci za Pana Jezusa Chrystusa, który stanął naprzeciw księcia ciemności, skruszył kajdany grzechu i zdjął z moich ramion nieznośne jarzmo „cegieł bez słomy”. Dziękuję Ci, że u Niego znajduję prawdziwy odpoczynek dla mojej duszy, a Jego krew otwiera mi drogę do tronu łaski w każdej godzinie próby.
Pomóż mi wytrwać w wierności, gdy wieją przeciwne wiatry. Napełnij moje serce pokojem, odwagą i niezłomną nadzieją, która wie, że po najciemniejszej nocy przychodzi poranek Twojego wybawienia. Przez Jezusa Chrystusa, mojego Pana i Zbawiciela. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj uważnie cały piąty rozdział Księgi Wyjścia (Wj 5:1–23) w przekładzie UBG.
☐ Zbadaj swój plan dnia: czy nadmiar pracy i pośpiech („cegły bez słomy”) nie kradną Ci czasu na modlitwę, Słowo Boże i święty odpoczynek? Wyznacz dziś nieprzekraczalny czas wyłącznie dla Boga.
☐ Jeśli przechodzisz obecnie przez trudne doświadczenie lub rozczarowanie, zanieś je dziś w szczerej, bezpośredniej modlitwie przed oblicze Pana, tak jak uczynił to Mojżesz w Wj 5:22.
☐ Przeczytaj obietnicę Pana Jezusa z Ewangelii Mateusza 11:28–30 i złóż u Jego stóp jeden konkretny ciężar, który przytłacza Twoje serce.
☐ Powstrzymaj się dziś od wszelkiego narzekania i obwiniania innych ludzi w sytuacjach stresowych w pracy lub w domu.
☐ Porównaj postawę faraona (Wj 5:2) z postawą pokornego sługi Bożego (Ps 95:6–8) i pomódl się o miękkie, posłuszne serce.
☐ Wyślij słowo otuchy lub podziel się linkiem do dzisiejszej lekcji z osobą, która czuje się przeciążona obowiązkami i potrzebuje duchowego pokrzepienia.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 6 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 37 — „TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA”
Czytanie: Wj 6:1–30. W odpowiedzi na rozpaczliwe pytanie Mojżesza Bóg przerywa milczenie i ogłasza wspaniałą kartę przymierza! Siedmiokrotne Boże „Ja” („Ja wyprowadzę was... Ja wybawię was... Ja odkupię was wyciągniętym ramieniem!”) staje się fundamentem paschalnej nadziei. Wróć jutro, aby usłyszeć potężną odpowiedź Boga w dolinie zwątpienia!`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day36-lesson.txt
const lessonTxtPath = path.join(process.cwd(), 'scripts/content/kc-day36-lesson.txt');
fs.writeFileSync(lessonTxtPath, lessonFullText, 'utf8');
console.log(`✅ Zapisano ${lessonTxtPath}`);

// 2. Budujemy oficjalny plik Microsoft Word (.docx) wg wytycznych GPT
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Aptos',
          size: 22, // 11 pt
          color: '1A202C',
        },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1276,
          bottom: 1276,
          left: 1276,
          right: 1276,
        },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'BIBLIJNA AKADEMIA | Z BIBLIĄ ZA PAN BRAT', size: 18, color: '718096', bold: true }),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.SPACE_BETWEEN,
            children: [
              new TextRun({ text: `${BOOK} • DZIEŃ ${DAY_NUM} • ${DATE_STR}`, size: 18, color: '718096' }),
              new TextRun({ text: '   |   Strona ', size: 18, color: '718096' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '718096' }),
            ],
          }),
        ],
      }),
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: '66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE', size: 20, color: 'C4A35A', bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: `${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}`, size: 22, color: '2B6CB0', bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: TITLE, size: 34, bold: true, color: '0F2942' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: SUBTITLE, size: 22, italics: true, color: '4A5568' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({ text: `${DATE_FORMATTED}   |   Czytanie: ${READING}`, size: 22, bold: true, color: '1A202C' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({ text: 'TEKST PAMIĘCIOWY: ', bold: true, color: 'C4A35A', size: 22 }),
          new TextRun({ text: MEMORY_VERSE, italics: true, bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: 'MYŚL PRZEWODNIA: ', bold: true, color: '2B6CB0', size: 22 }),
          new TextRun({ text: THEME, size: 22 }),
        ],
      }),
      ...lessonFullText.split('\n\n').slice(2).map(block => {
        const trimmed = block.trim();
        if (!trimmed) return new Paragraph({});
        
        if (trimmed.startsWith('ZANIM OTWORZYSZ BIBLIĘ') ||
            trimmed.startsWith('CZĘŚĆ ') ||
            trimmed.startsWith('JEZUS W CENTRUM') ||
            trimmed.startsWith('SPRAWDŹ W BIBLII') ||
            trimmed.startsWith('PRAWDA NA DZIŚ') ||
            trimmed.startsWith('POMYŚL —') ||
            trimmed.startsWith('MAŁY QUIZ') ||
            trimmed.startsWith('TWOJA DECYZJA') ||
            trimmed.startsWith('MODLITWA NA') ||
            trimmed.startsWith('ZADANIE NA DZIŚ') ||
            trimmed.startsWith('JUTRO —')) {
          return new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({ text: trimmed, bold: true, size: 26, color: '0F2942' })
            ]
          });
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return new Paragraph({
            spacing: { before: 140, after: 100 },
            children: [
              new TextRun({ text: lines[0], bold: true, size: 22, color: '2B6CB0' }),
              ...(lines[1] ? [new TextRun({ text: '\n' + lines.slice(1).join('\n'), size: 22 })] : [])
            ]
          });
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('☐ ')) {
          return new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: trimmed, size: 22 })
            ]
          });
        }

        return new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: trimmed, size: 22 })
          ]
        });
      })
    ],
  }],
});

const docxPath = 'C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_36_2026-11-05.docx';
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPath} (${buf.length} bajtów)`);

// 3. Budujemy kompletny 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 36 (5 listopada 2026): Pierwsza konfrontacja z faraonem — ciężary niewoli i próba wiary (Wj 5:1–23)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Szósty

Czy zdarzyło Ci się kiedyś, że gdy z całego serca postanowiłeś być posłuszny Bogu i zrobić krok wiary, zamiast natychmiastowej ulgi przyszła jeszcze większa burza, a trudności wokół Ciebie uderzyły ze zdwojoną siłą?

Zatrzymaj się w ten czwartkowy poranek, piątego listopada dwa tysiące dwudziestego szóstego roku, i spójrz z ufnością w oczy swojemu Niebiańskiemu Ojcu. Wypowiedz przed Nim to szczere, głębokie pytanie: Tato, dlaczego tak łatwo tracę pokój i poddaję się zniechęceniu, gdy moje posłuszeństwo Twojemu Słowu napotyka opór świata, zamiast pamiętać, że najciemniejsza noc zawsze poprzedza poranek Twojego cudownego wybawienia? W piątym rozdziale Księgi Wyjścia widzimy Mojżesza i Aarona, którzy po raz pierwszy wkraczają do pałacu faraona z potężnym królewskim poselstwem: „Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni!”. Odpowiedź władcy Egiptu brzmi jak manifest każdego buntu przeciwko Stwórcy: „Któż to jest Pan, abym miał słuchać jego głosu? Nie znam Pana, a Izraela też nie wypuszczę!”. Co więcej, faraon natychmiast wydaje okrutny rozkaz odwetowy: odbiera Hebrajczykom słomę potrzebną do wyrobu cegieł, lecz nakazuje utrzymać tę samą dzienną normę! Oskarża lud Boży o lenistwo, a obietnice Pana nazywa kłamliwymi słowami. Chce tak bardzo przeciążyć niewolników pracą ponad siły, aby nie mieli już czasu ani tchu myśleć o Bogu i wolności. Gdy pobici przełożeni Izraela wybuchają żalem przeciwko Mojżeszowi, ten robi jedyną właściwą rzecz: wraca prosto do Pana i wylewa przed Nim całe swoje zranione serce! Prawda Ewangelii rozświetla dziś tę dolinę próby: Jezus Chrystus stanął przed obliczem duchowego faraona — księcia tego świata — i na krzyżu Golgoty skruszył raz na zawsze jarzmo cegieł bez słomy! On woła dziś do Ciebie: Przyjdź do Mnie, jeśli jesteś spracowany i obciążony, a Ja dam Ci odpoczynek!

Jezus mówi dziś do Ciebie:
Potem Mojżesz i Aaron przyszli do faraona i powiedzieli: Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni. (Księga Wyjścia, rozdział piąty, werset pierwszy, UBG)

Zadanie Taktyczne:
Nie daj się dzisiaj złapać w pułapkę duchowego faraona na swoim czwartkowym posterunku. Wróg Twojej duszy chce Cię tak przytłoczyć pośpiechem, stresem i pogonią za kolejnymi zadaniami, abyś zapomniał o Bożych obietnicach. Twoim dzisiejszym rozkazem jest zatrzymać ten kołowrotek: wyznacz czas wyłącznie na modlitwę i Słowo Boże, a jeśli przechodzisz przez trudną próbę, nie narzekaj przed ludźmi, lecz jak Mojżesz zanieś swój ból bezpośrednio przed tron Ojca w niebie!

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
„Ojcze w niebie, Królu królów i Panie wszelkiego stworzenia! Dziękuję Ci, że Twoje obietnice są prawdą, nawet gdy wokół mnie szaleje burza i rosną wymagania tego świata. Panie Jezu, Ty zdjąłeś z moich ramion okrutne jarzmo niewoli grzechu i obdarzyłeś mnie wolnością dziecka Bożego. Nie pozwól, by zabieganie i troski odebrały mi czas na społeczność z Tobą. W każdej próbie wiary ucz mnie wracać na kolana przed Twoje oblicze i cierpliwie czekać na objawienie Twojej wszechmocnej ręki. Tobie chwała na wieki. Amen.”

Rozkaz Dnia (Zadbaj o wzrost):
Wzrastaj codziennie w Słowie Bożym. Dołącz do naszej armii ludzi z pasją, zaproś bliskich i przejdź z nami całe Pismo Święte w projekcie „Z Biblią za Pan Brat”.

Błogosławieństwo:
Niech Pan obdarzy Cię niezłomną wytrwałością w próbach, uchroni Twoje serce przed niewolniczym pośpiechem i napełni Cię głębokim pokojem Chrystusa. Dobrego, zwycięskiego czwartku z Bogiem!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 36 (5 listopada 2026 r.)
📖 Księga Wyjścia 5:1–23: Pierwsza konfrontacja z faraonem — ciężary niewoli i próba wiary

Czy wiesz, dlaczego czasem tuż po tym, jak podejmiesz decyzję o posłuszeństwie Bogu, trudności w Twoim życiu chwilowo się nasilają, zamiast natychmiast zniknąć?

W 36. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia/kurscodzienny) przekraczamy wraz z Mojżeszem i Aaronem próg pałacu faraona (Wj 5:1–23). Po raz pierwszy w Biblii rozbrzmiewa tu królewska formuła prorocka:
> „Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni.” (Wj 5:1, UBG)

Odpowiedź egipskiego monarchy obnaża duchową istotę każdego buntu przeciwko Stwórcy: „Któż to jest Pan, abym miał słuchać jego głosu i wypuścić Izraela? Nie znam Pana, a Izraela też nie wypuszczę” (Wj 5:2). Zamiast natychmiastowego wyzwolenia przychodzi brutalny odwet:
1. Cegły bez słomy (Wj 5:6–8): Faraon odbiera niewolnikom słomę potrzebną do wiązania mułu nilowego, lecz nakazuje utrzymać tę samą dzienną normę cegieł.
2. Wojna psychologiczna (Wj 5:8–9): Władca oskarża Izraelitów o próżnowanie, a obietnice Boga nazywa „kłamliwymi słowami” (hebr. diwrej szaker). Nakazuje przeciążyć lud pracą, „aby byli nią zajęci” i nie myśleli o Bogu.
3. Kryzys i powrót do Pana (Wj 5:14–23): Bici przełożeni Izraela obracają swój żal przeciwko Mojżeszowi (Wj 5:21). Wstrząśnięty Mojżesz nie porzuca jednak misji, lecz „wraca do Pana” (Wj 5:22) ze szczerą, pełną bólu modlitwą.

Trzy filary teologiczne na dziś:
1. Cel Bożej wolności (Wj 5:1): Bóg wyprowadza nas z niewoli nie do samowoli, lecz do radosnego świętowania i służby w Jego obecności.
2. Taktyka zagłuszania (Wj 5:9): Duch tego świata próbuje zamęczyć człowieka pracą i gonitwą „bez słomy”, by zagłuszyć w nim tęsknotę za wiecznością.
3. Dolina próby przed wybawieniem (Wj 5:22–23): Bóg dopuszcza przejściowy kryzys, aby wyleczyć swój lud ze złudzeń co do Egiptu i objawić w pełni swoje zbawcze ramię (Wj 6:1).

Studiuj kody Stronga (H7971 szallach, H2287 chagag, H5065 nagas, H8401 tewen) i pełny komentarz egzegetyczny w MojejBiblii CC: https://polskieradio.cc/mojabiblia?book=EXO&chapter=5 oraz na stronie Akademii: https://polskieradio.cc/akademia/kurscodzienny/dzien-36

Zadanie Taktyczne (Czytaj | Wierz | Działaj):
* CZYTAJ: Przeczytaj uważnie cały 5. rozdział Księgi Wyjścia oraz zaproszenie Jezusa z Mt 11:28–30.
* WIERZ: Zaufaj, że Boże obietnice są niezawodne, nawet gdy okoliczności wokół Ciebie zdają się mówić co innego.
* DZIAŁAJ: Zatrzymaj dziś niewolniczy pośpiech, oddaj czas Bogu, a każdy swój ciężar i pytanie zanieś wprost przed Jego tron.

Wszystkie materiały, narzędzia interlinearne i audio w ekosystemie Christian Culture są całkowicie bezpłatne. Jeśli pragniesz współtworzyć to dzieło, dołącz do naszych Patronów: https://polskieradio.cc/wspieraj

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 36 (Wj 5:1): „Tak mówi PAN: Wypuść mój lud!”. Nie daj się przytłoczyć ciężarom świata. Nawet gdy próba wiary jest trudna, zanieś swój ból Bogu jak Mojżesz — poranek Bożego wybawienia jest blisko! Spokojnej nocy! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[SCENA: STUDIO CHRISTIAN CULTURE TV — WARSZAWA]
[Eleganckie studio w tonacji głębokiego granatu, obsydianu i szlachetnego złota. Na ekranie głównym grafika: monumentalna sala tronowa Egiptu, przed dumnym faraonem stoją Mojżesz i Aaron, a w tle trud wyrobu cegieł. Złoty napis: DZIEŃ 36 — PIERWSZA KONFRONTACJA Z FARAONEM I PRÓBA WIARY.]
[Prowadzące: Noemi i Sara — profesjonalne, pełne ciepła, biblijnego autorytetu i pasji.]

[INTRO: 0:00–0:45]
Noemi: Dzień dobry! Witamy państwa bardzo serdecznie w ten czwartkowy poranek, piątego listopada dwa tysiące dwudziestego szóstego roku, na antenie Christian Culture TV!
Sara: W naszym codziennym cyklu „Z Biblią za Pan Brat” otwieramy dziś piąty rozdział Księgi Wyjścia. Po wczorajszym, pełnym wiary pokłonie starszych Izraela, dziś wkraczamy z Mojżeszem i Aaronem prosto do pałacu faraona!
Noemi: I to jest moment przełomowy, bo zamiast natychmiastowego zwycięstwa przychodzi gwałtowne zderzenie z pychą imperium i bardzo bolesna próba wiary!

[ROZWINIĘCIE: 0:45–3:30]
Sara: Posłuchajmy pierwszych słów Mojżesza i Aarona przed tronem: „Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni”. Co za odwaga! Dwaj starsi bracia z pasterską laską wydają rozkaz najpotężniejszemu władcy świata!
Noemi: A faraon odpowiada słowami, które przejdą do historii jako szczyt ludzkiej arogancji: „Któż to jest Pan, abym miał słuchać jego głosu? Nie znam Pana, a Izraela też nie wypuszczę!”. I natychmiast przechodzi do kontrataku!
Sara: Wydaje bezlitosny dekret: od tej pory Hebrajczycy nie dostaną słomy do wyrobu cegieł, muszą sami zbierać ścierń po polach, ale dzienna norma cegieł pozostaje dokładnie taka sama! Dlaczego to robi? Sam to wyjaśnia w wersecie dziewiątym: „Niech praca tych ludzi będzie cięższa, aby byli nią zajęci, a nie ufali kłamliwym słowom!”.
Noemi: Zatrzymajmy się przy tym zdaniu! Czy to nie jest dokładny opis taktyki duchowego wroga w dwudziestym pierwszym wieku? Zamęczyć człowieka pracą, kredytami, stresem, pośpiechem — tak, żeby nie miał już siły otworzyć Biblii, pomodlić się i zaufać Bożym obietnicom!
Sara: A gdy przełożeni Izraela zostają pobici za niewykonanie normy, ich wiara pęka. Wychodzą z pałacu i obwiniają Mojżesza! I co wtedy robi Mojżesz? Werset dwudziesty drugi mówi: „Wtedy Mojżesz wrócił do Pana”! Nie kłóci się z ludźmi, nie ucieka na pustynię, ale idzie z tym rozdzierającym bólem prosto do Boga: „Panie, dlaczego?”.

[SZCZYT CHRYSTOCENTRYCZNY: 3:30–5:00]
Noemi: Kochani, ten rozdział prowadzi nas bezpośrednio do Jezusa Chrystusa! Faraon nakładał na ludzi ciężary nie do uniesienia — cegły bez słomy. A co mówi nasz Pan Jezus Chrystus w Ewangelii Mateusza? „Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek!”.
Sara: Jezus stanął przed duchowym faraonem — szatanem — i na krzyżu Golgoty złamał jego władzę! A nawet gdy w naszym życiu przychodzi Wielki Piątek i wydaje się, że pomoc się spóźnia, pamiętajmy: po piątym rozdziale Księgi Wyjścia zawsze przychodzi rozdział szósty i poranek Bożego zwycięstwa!

[ZADANIE TAKTYCZNE I MODLITWA: 5:00–6:30]
Noemi: Nasze zadanie taktyczne na ten czwartek: Nie pozwól, by gonitwa za „cegłami” tego świata ukradła Ci czas dla Boga! A jeśli przechodzisz dziś przez dolinę niezrozumienia — wróć do Pana w szczerej modlitwie!
Sara i Noemi razem: „Panie Boże Wszechmogący, Królu królów! Dziękujemy Ci, że Twoje Słowo nigdy nie jest kłamstwem, lecz wieczną prawdą. Panie Jezu, dziękujemy Ci, że wyzwoliłeś nas z niewoli grzechu i zdjąłeś z naszych ramion ciężary ponad siły. Daj nam wytrwałość w godzinie próby, uchroni nasze serca przed zwątpieniem i prowadź nas do chwalebnego zwycięstwa. Amen!”

[OUTRO: 6:30–7:00]
Noemi: Dziękujemy, że jesteście z nami! Pełna lekcja, komentarz werset po wersecie i dwadzieścia pytań quizu czekają na Was na stronie polskieradio.cc/akademia/kurscodzienny/dzien-36.
Sara: Błogosławionego czwartku w Bożym pokoju! Do zobaczenia jutro w szóstym rozdziale Księgi Wyjścia!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: ANATOMIA TYRANII, CEGŁY BEZ SŁOMY I TEOLOGIA PRÓBY WIARY W PIĄTYM ROZDZIALE KSIĘGI WYJŚCIA
**Księga Wyjścia — Miesiąc 2 | Dzień 36 (5 listopada 2026 r.)**

W ramach codziennego cyklu badawczego „Z Biblią za Pan Brat”, zespół redakcyjny leksykonu biblijnego CCN publikuje analizę egzegetyczno-historyczną piątego rozdziału Księgi Wyjścia (Wj 5:1–23). Tekst ten dokumentuje pierwszą dyplomatyczną i duchową konfrontację Mojżesza oraz Aarona z dworem faraona, mechanizmy ekonomicznego zniewolenia w starożytnym Egipcie oraz biblijną teologię kryzysu poprzedzającego odkupienie.

1. Formuła poselska JHWH wobec doktryny boskości faraona (Wj 5:1–5)
Wystąpienie Mojżesza i Aarona rozpoczyna się od uroczystej formuły kurialnej starożytnego Bliskiego Wschodu: „Tak mówi PAN, Bóg Izraela” (hebr. ko amar JHWH Elohej Jisrael). Użycie tego zwrotu (po raz pierwszy w kanonie biblijnym) stawia JHWH w pozycji Suwerena wydającego polecenie wasalowi. Żądanie „Wypuść mój lud” (hebr. szallach et ammi) uderza w fundament egipskiego ustroju państwowego, w którym faraon — uważany za wcielenie Horusa i dziedzica Ra — rościł sobie wyłączne prawo własności do poddanych oraz zasobów pracy.
Odpowiedź monarchy: „Któż to jest PAN, abym miał słuchać jego głosu? Nie znam PANA” (Wj 5:2) stanowi klasyczny wyraz hybris władzy absolutnej, która nie uznaje żadnej normy moralnej ponad własnym dekretem.

2. Kontekst archeologiczny: technologia wyrobu cegieł i struktura nadzoru (Wj 5:6–14)
Opis przedstawiony w Wj 5:6–14 wykazuje niezwykłą precyzję historyczną i terminologiczną, potwierdzoną przez egiptologię:
- Dwuwarstwowy aparat przymusu: Tekst rozróżnia egipskich komisarycznych nadzorców robót (hebr. nogesim) oraz rekrutowanych spośród samych Hebrajczyków przełożonych-pisarzy (hebr. szoterim), odpowiedzialnych za ewidencję i egzekwowanie dziennego kontyngentu (hebr. matkonet ha-lewenim). Dokładnie taką strukturę ukazują freski z grobowca wezyra Rechmire w Tebach (XVIII dynastia).
- Rola słomy (hebr. tewen) i ścierni (hebr. kasz): Cegły z aluwialnego mułu Nilu wymagały domieszki sieczki zbożowej jako spoiwa zapobiegającego pękaniu podczas schnięcia na słońcu. Dokumenty z epoki Ramessydów (m.in. Papirus Anastasi IV oraz Rolka Skórzana z Luwru) potwierdzają zarówno surowe normy dzienne, jak i kary cielesne wymierzane przełożonym w przypadku niewykonania planu z powodu braku słomy.

3. Socjotechnika totalitaryzmu: praca jako narzędzie depolityzacji i sekularyzacji (Wj 5:8–9)
Szczególną wartość analityczną posiadają słowa faraona w Wj 5:9: „Niech praca tych ludzi będzie cięższa, aby byli nią zajęci, a nie ufali kłamliwym słowom” (hebr. be-diwrej szaker). Tekst biblijny demaskuje ponadczasowy mechanizm inżynierii społecznej stosowany przez reżimy autorytarne: celowe utrzymywanie społeczeństwa w stanie permanentnego wyczerpania ekonomicznego, aby uniemożliwić refleksję duchową, integrację wspólnotową i dążenie do wolności.

4. Kryzys przywództwa i lamentacja prorocka (Wj 5:15–23)
Załamanie się przełożonych Izraela, którzy po bezskutecznej apelacji do faraona zwracają się przeciwko Mojżeszowi i Aaronowi („Niech PAN wejrzy na was i osądzi”, Wj 5:21), ukazuje kruchość wiary opartej wyłącznie na oczekiwaniu natychmiastowego sukcesu. W obliczu odrzucenia Mojżesz daje wzorzec duchowego przywództwa: „Wtedy Mojżesz wrócił do PANA” (Wj 5:22). Jego modlitwa („Dlaczego wyrządziłeś to zło... a ty nie wybawiłeś swego ludu”, Wj 5:22–23) otwiera w tradycji biblijnej nurt szczerej lamentacji prorockiej (por. Jer 20:7; Hab 1:2), w której ból niezrozumienia nie prowadzi do apostazji, lecz do głębszego przylgnięcia do Boga.

5. Perspektywa chrystologiczna: Chrystus wobec jarzma niewoli
W świetle teologii Nowego Testamentu piąty rozdział Księgi Wyjścia ukazuje kontrast między niewolą grzechu a odkupieniem w Chrystusie:
- Jezus Chrystus jako większy Mojżesz stawia czoła „władcy tego świata” (J 12:31; Hbr 2:14–15), żądając uwolnienia jeńców grzechu;
- W miejsce bezlitosnego nakazu faraona („cegły bez słomy”) Chrystus ofiaruje strudzonym swoje łagodne jarzmo i dar usprawiedliwienia z łaski (Mt 11:28–30; Rz 5:1);
- Pozorna klęska i ciemność z końca Wj 5 zapowiadają godzinę krzyża, po której następuje definitywne objawienie mocy Bożej w zmartwychwstaniu (Wj 6:1; 1 Kor 15:54–57).

📌 PODSUMOWANIE REDAKCYJNE CCN
Piąty rozdział Księgi Wyjścia przypomina, że droga do prawdziwej wolności nigdy nie jest bezkonfliktowym spacerem. Zanim runą mury duchowego Egiptu, wiara musi przejść przez ogień próby, w którym upadają ludzkie złudzenia, a jedyną ostoją pozostaje wierność i obietnica Boga Przymierza.

*Wszystkie materiały formacyjne i publicystyczne w ekosystemie Christian Culture są całkowicie bezpłatne. Dołącz do naszej bazy subskrybentów i śledź codzienne analizy w ramach projektu „Z Biblią za Pan Brat”.*

🌐 **Źródła i powiązane serwisy:** [polskieradio.cc](https://www.polskieradio.cc) | [polskieradio.cc/lumina](https://www.polskieradio.cc/lumina) | [cclite.pl](https://www.cclite.pl)  
💬 *Dołącz do społeczności:* [Grupa WhatsApp CCN / CC](https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0)
`;

const pakietPath = path.join(process.cwd(), 'scripts/content/pakiet-day36-5wersji.md');
fs.writeFileSync(pakietPath, pakiet5Wersji, 'utf8');
console.log(`✅ Zapisano ${pakietPath}`);

console.log('🎉 KOMPLETNA LEKCJA I PAKIET DNIA 36 WYGENEROWANE Z SUKCESEM!');
