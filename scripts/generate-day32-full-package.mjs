import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

// Dzień 32: Wj 1:1–22 (1 listopada 2026, Niedziela)
const DAY_NUM = 32;
const DATE_STR = '2026-11-01';
const DATE_FORMATTED = 'Niedziela, 1 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 1:1–22';
const TITLE = 'W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE';
const SUBTITLE = 'Śmierć pokolenia Józefa, dekret faraona, niewolniczy trud i odwaga bogobojnych położnych';
const MEMORY_VERSE = '„Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela.” (Wj 1:12, UBG)';
const THEME = 'Księga Wyjścia rozpoczyna się konfrontacją pogańskiego imperium z Bożą obietnicą przymierza. Żadne ludzkie dekrety, uciski ani wrogość świata nie są w stanie zatrzymać rozrostu ludu Bożego, a cicha wierność i bojaźń Boża zwykłych ludzi okazują się potężniejsze niż despotyczna władza faraona.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 32 (Księga Wyjścia 1:1–22)...');

// 1. Pełny tekst lekcji według Wytycznych GPT (12 sekcji, 44 punkty egzegetyczne)
const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 32
W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE
Śmierć pokolenia Józefa, dekret faraona, niewolniczy trud i odwaga bogobojnych położnych
Niedziela, 1 listopada 2026 r.  |  Czytanie: Wj 1:1–22
TEKST PAMIĘCIOWY: „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela.” (Wj 1:12, UBG)
MYŚL PRZEWODNIA: Księga Wyjścia rozpoczyna się konfrontacją pogańskiego imperium z Bożą obietnicą przymierza. Żadne ludzkie dekrety, uciski ani wrogość świata nie są w stanie zatrzymać rozrostu ludu Bożego, a cicha wierność i bojaźń Boża zwykłych ludzi okazują się potężniejsze niż despotyczna władza faraona.

ZANIM OTWORZYSZ BIBLIĘ
Pierwszego listopada rozpoczynamy drugi miesiąc naszej 66-miesięcznej podróży przez całe Pismo Święte. Wkraczamy w Księgę Wyjścia (hebr. We’elleh Szemot – „A oto imiona”), drugą monumentalną księgę Tory i całego kanonu biblijnego. Wczoraj zamknęliśmy Księgę Rodzaju widokiem trumny Józefa w Egipcie. Choć Józef umarł z proroczym wyznaniem wiary na ustach, rodzina przymierza pozostała w obcej ziemi. Pomiędzy finałem Genesis a początkiem Exodus upływają dziesięciolecia, a nawet stulecia. Mała pasterska rodzina licząca siedemdziesiąt dusz przekształca się w potężny naród, co staje się bezpośrednią przyczyną gwałtownego konfliktu politycznego i duchowego.
Pierwszy rozdział Księgi Wyjścia wprowadza nas w bolesną rzeczywistość radykalnej zmiany układu sił. Na tron Egiptu wstępuje nowy król, który „nie znał Józefa” – władca reprezentujący nową dynastię, kierujący się strachem, ksenofobią i zimną kalkulacją geopolityczną. Zamiast wdzięczności za ocalenie kraju z czasów głodu, faraon widzi w Hebrajczykach śmiertelne zagrożenie dla bezpieczeństwa państwa. Rozpoczyna się zaplanowana, stopniowa eskalacja represji: od przymusowej pracy niewolniczej, przez próbę potajemnego dzieciobójstwa rękami położnych, aż po jawny dekret ludobójczy nakazujący topienie noworodków w Nilu.
W samym sercu tej imperialnej machiny terroru Bóg objawia swój transcendentny paradoks: „Im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”. Władza faraona okazuje się bezsilna wobec Bożego błogosławieństwa życia. Co więcej, pierwszymi bohaterami wiary w tej księdze nie są potężni wodzowie ani kapłani, lecz dwie proste, bogobojne kobiety – położne Szifra i Pua, które zaryzykowały własne życie, wybierając posłuszeństwo Bogu ponad zbrodniczy rozkaz ziemskiego władcy.

CZĘŚĆ I — KORZENIE PRZYMIERZA I BOŻE BŁOGOSŁAWIEŃSTWO (Wj 1:1–7)
1. Hebrajski spójnik przymierza: We’elleh Szemot (1:1)
Księga Wyjścia w tekście hebrajskim rozpoczyna się od słów We’elleh Szemot („A oto imiona”). Początkowy spójnik „i/a” (waw consecutivum) podkreśla nierozerwalną jedność historyczną i teologiczną z Księgą Rodzaju. Wyjście nie jest nowym początkiem z próżni, lecz bezpośrednią kontynuacją przymierza zawartego z Abrahamem, Izaakiem i Jakubem.
2. Imienne przybycie synów Izraela (1:1)
Narrator wymienia synów Jakuba, zaznaczając, że każdy przyszedł ze swoim domem. Bóg nie traktuje swojego ludu jako anonimowej masy; każde plemię i każda rodzina mają swoje imię i swoje unikalne miejsce w planie zbawienia.
3. Struktura genealogiczna dwunastu plemion (1:2–4)
Kolejność wyliczenia synów odzwierciedla porządek matek: najpierw synowie Lei (Ruben, Symeon, Lewi, Juda, Issachar, Zabulon), następnie Beniamin (syn Racheli, jako że Józef był już w Egipcie), a wreszcie synowie nałożnic Bilhy i Zilpy (Dan, Neftali, Gad, Aszer). To potwierdzenie prawowitego dziedzictwa całego Izraela.
4. Siedemdziesiąt dusz potomstwa Jakuba (1:5)
Liczba siedemdziesiąt (por. Rdz 46:27) ma głębokie znaczenie symboliczne: oznacza pełnię i doskonałość zaczątku Bożego narodu. Mała grupa emigrantów staje się zarzewiem wielkiego narodu przymierza.
5. Obecność Józefa w Egipcie jako kotwica Opatrzności (1:5)
Zdanie „A Józef był już w Egipcie” przypomina o uprzedzającej Bożej łasce. Zanim rodzina dotknęła głodu i obcej ziemi, Bóg posłał Józefa, aby przygotował dla nich schronienie i ocalenie.
6. Śmierć pokolenia patriarchów (1:6)
Werset szósty notuje nieuchronny kres pewnej epoki: umiera Józef, umierają wszyscy jego bracia i całe owo pokolenie. Ludzkie autorytety i obrońcy odchodzą, lecz przymierze Boga z Jego ludem pozostaje niewzruszone.
7. Czterokrotny rozrost Izraela (1:7)
Tekst używa niezwykłego nagromadzenia hebrajskich czasowników: synowie Izraela byli płodni (paru), rozmnożyli się obficie (jaszrecu), stali się liczni (jirbu) i potężni ponad miarę (jaacmu meod meod). To bezpośrednie echo pierwotnego błogosławieństwa stworzenia z Rdz 1:28 oraz obietnicy danej Abrahamowi (Rdz 12:2; 17:6).
8. Napełnienie ziemi Goszen (1:7)
Sformułowanie „i ziemia napełniła się nimi” świadczy o widocznym, dynamicznym sukcesie demograficznym ludu Bożego w Egipcie. Błogosławieństwo Stwórcy okazuje się potężniejsze niż obca gleba i status cudzoziemców.

CZĘŚĆ II — POLITYKA STRACHU I UCIEMIĘŻENIE PRZEZ NOWEGO FARAONA (Wj 1:8–14)
9. Powstanie króla, który „nie znał Józefa” (1:8)
Wstąpienie na tron nowego faraona oznaczało prawdopodobnie przewrót polityczny i wyparcie dynastii Hyksosów przez rodzimą, tebańską XVIII dynastię. „Nie znać Józefa” to nie tylko brak wiedzy historycznej, lecz świadoma odmowa uznania dawnych zasług i paktów przymierza.
10. Propaganda lęku i ksenofobia władcy (1:9)
Faraon zwraca się do swego ludu językiem manipulacji: „Oto lud synów Izraela jest liczniejszy i silniejszy od nas”. Tyran buduje swoją władzę na kreowaniu wroga wewnętrznego i wzbudzaniu paranoi w społeczeństwie.
11. Przebiegłość zamiast mądrości (1:10)
Słowa „Chodźcie, postąpmy z nim mądrze” (hebr. nitchakmah lo) oznaczają w rzeczywistości podstępną, cyniczną kalkulację. Gdy człowiek odrzuca Bożą mądrość, jego „roztropność” staje się okrutną machinacją polityczną.
12. Strach przed utratą taniej siły roboczej i sojuszem z wrogami (1:10)
Faraon boi się dwóch rzeczy: że w razie wojny Izrael sprzymierzy się z najeźdźcami przeciwko Egiptowi, oraz że opuści ten kraj. To klasyczny dylemat despoty, który nienawidzi swoich poddanych, ale nie chce wypuścić ich z rąk ze względu na korzyści ekonomiczne.
13. Ustanowienie nadzorców niewolniczych prac (1:11)
Egipcjanie ustanawiają nad Izraelem „przełożonych nad podatkami/robotami” (sare missim), aby łamać ich ducha i ciało katorżniczą pracą. Niewolnictwo staje się instytucjonalnym narzędziem kontroli społecznej.
14. Budowa miast-twierdz: Pitom i Ramses (1:11)
Izraelici zostają zmuszeni do wznoszenia miast spichrzowych i magazynów zaopatrzeniowych dla armii faraona. Praca rąk ludu Bożego ma służyć chwale i potędze pogańskiego imperium.
15. Złota zasada Bożego rozrostu (1:12)
Werset dwunasty przynosi centralne orędzie teologiczne rozdziału: „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”. Żadna ludzka presja nie jest w stanie powstrzymać Bożego planu; prześladowanie staje się katalizatorem wzrostu.
16. Wstręt i lęk Egipcjan (1:12)
Wobec nieskuteczności represji Egipcjanie zaczynają czuć wstręt i trwożliwy lęk przed synami Izraela (hebr. jakucu). Niewolnicy, zamiast budzić pogardę, stają się źródłem paniki dla swoich panów.
17. Bezlitosna katorga (1:13)
Egipcjanie nakładają prace na Izraelitów „bez litości” (hebr. befarech – z bezwzględnym okrucieństwem i surowością). Przemoc staje się normą państwową.
18. Gorzkie życie przy zaprawie i cegle (1:14)
Tekst podkreśla, że Egipcjanie czynili życie Hebrajczyków „gorzkim” przez ciężką pracę przy glinie, zaprawie, cegłach i wszelkich pracach polowych. To doświadczenie goryczy stanie się później tłem dla pamiątki paschalnej (gorzkie zioła Paschy).
19. Niewola totalna bez przestrzeni na wytchnienie (1:14)
Wszystkie prace narzucane były z bezwzględną surowością. Izrael został pozbawiony jakichkolwiek praw obywatelskich, stając się własnością państwa faraona.

CZĘŚĆ III — BOGOBODNOŚĆ I ŚWIĘTY OPÓR POŁOŻNYCH (Wj 1:15–21)
20. Rozkaz faraona do hebrajskich położnych (1:15)
Widząc fiasko represji ekonomicznych, faraon przechodzi do drugiego etapu: biologicznego wyniszczenia narodu. Wzywa osobiście dwie przełożone położnych.
21. Uwiecznione imiona: Szifra i Pua (1:15)
Pismo Święte z rozmysłem pomija imię potężnego faraona (który w oczach świata był bogiem na ziemi), natomiast z czcią utrwala imiona dwóch prostych kobiet: Szifra („Piękna”) i Pua („Promienna/Jasna”). W Królestwie Bożym to wierność i bojaźń Boża decydują o wiecznej pamięci.
22. Tajny nakaz dzieciobójstwa (1:16)
Faraon nakazuje mordowanie nowo narodzonych chłopców podczas porodu na stołkach porodowych (hebr. obnajim), podczas gdy dziewczynki mają pozostać przy życiu.
23. Cel eksterminacji męskich potomków (1:16)
Wybicie synów miało natychmiast zniszczyć potencjał militarny Izraela, a pozostawione przy życiu córki miały zostać wchłonięte przez egipskie domy, co doprowadziłoby do całkowitej asymilacji i likwidacji tożsamości przymierza.
24. Bojaźń Boża silniejsza niż rozkaz króla (1:17)
Położne „bały się Boga i nie czyniły tak, jak im rozkazał król Egiptu”. Bojaźń Boża (jir’at Elohim) nie jest paraliżującym strachem, lecz głębokim uznaniem suwerenności i świętości Boga, które rodzi moralną odwagę do przeciwstawienia się złu.
25. Pierwsze biblijne obywatelskie nieposłuszeństwo (1:17)
Postawa Szifry i Pui stanowi najwcześniejszy w Piśmie Świętym przykład świętego nieposłuszeństwa wobec nieludzkiego prawa państwowego. Gdy nakaz władcy stoi w sprzeczności z prawem Bożym, człowiek wierzący musi wybrać posłuszeństwo Bogu (por. Dz 5:29).
26. Faraon żąda wyjaśnień (1:18)
Król Egiptu wzywa położne na przesłuchanie: „Dlaczego to uczyniłyście i zostawiłyście chłopców przy życiu?”. Tyran odkrywa, że jego wola napotyka niewidzialną, nieugiętą barierę.
27. Odpowiedź położnych: hebrajskie kobiety są żywotne (1:19)
Położne odpowiadają, że hebrajskie kobiety są silne i pełne życia (hebr. chajot) i rodzą same, zanim nadejdzie pomoc. Kobiety używają roztropności i sprytu w obronie bezbronnego życia przed mordercą.
28. Boże upodobanie i dobroć dla położnych (1:20)
„Dlatego Bóg dobrze czynił położnym”. Bóg staje po stronie tych, którzy z narażeniem życia chronią niewinnych. Żaden czyn miłosierdzia i odwagi wiary nie pozostaje bez Bożej nagrody.
29. Niezłomny wzrost ludu Bożego (1:20)
Końcówka wersetu dwudziestego ponownie akcentuje: „a lud pomnażał się i bardzo rósł w siłę”. Plany eksterminacji ponoszą całkowitą klęskę w zderzeniu z Bożą obietnicą.
30. Bóg zakłada domy bogobojnym położnym (1:21)
Ponieważ położne bały się Boga, On „założył im domy” (hebr. wajjaas lahem battim) – obdarzył je własnymi rodzinami, potomstwem i trwałym błogosławieństwem. Te, które chroniły dzieci innych, same otrzymały dar trwałych domów od Pana.

CZĘŚĆ IV — DEKRET ZAGŁADY I PERSPEKTYWA OCALENIA (Wj 1:22)
31. Przejście od tajnego spisku do otwartego terroru (1:22)
Gdy tajny plan z położnymi spalił na panewce, faraon zrzuca wszelkie maski. Przemoc państwowa staje się jawna i bezwzględna.
32. Powszechny nakaz dla całego narodu egipskiego (1:22)
Faraon wydaje rozkaz nie tylko urzędnikom, lecz „całemu swemu ludowi”. Każdy Egipcjanin staje się potencjalnym donosicielem i katem hebrajskich niemowląt.
33. Rzeka Nil jako narzędzie mordu (1:22)
„Każdego syna, który się urodzi, wrzućcie do rzeki”. Nil, który był dla Egiptu źródłem życia i bóstwem (Hapi), zostaje przez faraona zamieniony w cmentarz dla niewinnych hebrajskich dzieci.
34. Piekielna ironia tyranii (1:22)
Faraon myśli, że woda Nilu pochłonie przyszłość Izraela. Nie wie, że właśnie z wód tej rzeki Bóg wkrótce wyłowi w małym koszyku tego, który złamie potęgę imperium i poprowadzi lud ku wolności.
35. Fałszywa łaskawość wobec córek (1:22)
Rozkaz pozostawienia dziewczynek przy życiu nie wynika z litości, lecz z dążenia do całkowitej likwidacji narodu wybranego przez wymuszoną asymilację z Egipcjanami.
36. Narastająca ciemność przed świtem (1:22)
Rozdział pierwszy kończy się sceną skrajnego zagrożenia i udręki. Wydaje się, że zło odnosi całkowity triumf, a naród przymierza stoi na krawędzi zagłady.
37. Przygotowanie sceny pod narodziny Wybawiciela (1:22)
Najciemniejsza godzina nocy poprzedza wschód słońca. To w tę atmosferę terroru i dekretu śmierci wkracza w rozdziale drugim matka Mojżesza, kładąc podwaliny pod największe wyzwolenie Starego Testamentu.
38. Finał pierwszej perykopy Księgi Wyjścia (1:1–22)
Rozdział pierwszy dowodzi, że walka o naród wybrany jest w istocie walką duchową pomiędzy królestwem ciemności a Bogiem Przymierza. Żadne imperium świata nie jest w stanie pokonać tych, których strzeże Wszechmogący.

JEZUS W CENTRUM — TYPOLOGIA WYBAWIENIA I KRÓLESTWO ŻYCIA
39. Faraon i Herod: zbrodnia tyrana a rzeź niewiniątek (Wj 1:16, 22 a Mt 2:16–18)
Dekret faraona nakazujący mordowanie hebrajskich chłopców znajduje swój bezpośredni nowotestamentowy odpowiednik w rzezi niewiniątek w Betlejem nakazanej przez króla Heroda. W obu przypadkach szatan próbuje zniszczyć nasienie niewiasty (Rdz 3:15) i powstrzymać nadejście Wybawiciela, lecz Boża Opatrzność cudownie ratuje Wybrańca.
40. Nil śmierci a wody ocalenia i chrzest (Wj 1:22 a Wj 2:3; Rz 6:3–4)
Woda, która w zamiarze faraona miała być grobem, staje się dla Mojżesza miejscem ocalenia. W Nowym Testamencie wody chrztu symbolizują zanurzenie w śmierć Chrystusa, z której dzięki zmartwychwstaniu wychodzimy do nowego, niezniszczalnego życia.
41. Kościół rosnący pod pręgierzem ucisku (Wj 1:12 a Dz 8:1–4; 2 Kor 4:8–10)
Zasada „im bardziej ich uciskali, tym bardziej się pomnażali” stała się prawem rozwoju nowotestamentowego Kościoła. Krew męczenników okazała się nasieniem chrześcijan. Prześladowania w Jerozolimie rozproszyły uczniów, powodując gwałtowne rozprzestrzenienie się Ewangelii po całym ówczesnym świecie.
42. Chrystus jako Wybawiciel z duchowego Egiptu (Wj 1:13–14 a J 8:34–36; Hbr 2:14–15)
Niewolnicza praca przy glinie i zaprawie pod bezlitosnym biczem nadzorców jest porażającym obrazem niewoli grzechu i strachu przed śmiercią. Jezus Chrystus przyszedł jako prawdziwy i większy Wybawiciel, aby przez swoją śmierć na krzyżu zniszczyć diabła i wyzwolić tych, którzy przez całe życie podlegali niewoli.
43. Odwaga bogobojnych kobiet a służba w Królestwie Bożym (Wj 1:17–21 a Łk 1:38, 46–55; 8:1–3)
Szifra i Pua, które zaryzykowały wszystko dla ratowania życia, zapowiadają wierne kobiety Nowego Testamentu – od Marii przyjmującej Boże powołanie, po niewiasty trwające pod krzyżem i zwiastujące zmartwychwstanie Apostołom. Bóg wybiera to, co słabe w oczach świata, aby zawstydzić to, co potężne.
44. Zwycięstwo Życia nad dekretem śmierci (Wj 1:12, 22 a 1 Kor 15:54–57)
Ostateczną odpowiedzią Boga na dekrety śmierci faraonów i cezarów jest pusty grób Jezusa Chrystusa. Śmierć została pochłonięta w zwycięstwie, a lud odkupiony krwią Baranka ma zagwarantowany wieczny rozrost w chwale Ojca.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 1:7 → Rdz 1:28. Jak niezwykły rozrost Izraela w Egipcie nawiązuje do pierwotnego Bożego nakazu danego ludzkości przy stworzeniu?
• Wj 1:8 → Dz 7:17–18. Jak diakon Szczepan w swojej mowie obronnej interpretuje moment pojawienia się nowego króla w kontekście historii zbawienia?
• Wj 1:11 → Rdz 15:13–14. W jaki sposób uciemiężenie w Egipcie stanowiło dosłowne wypełnienie proroctwa przekazanego Abrahamowi w przymierzu nocy?
• Wj 1:12 → Rz 8:31, 37. Dlaczego żaden ziemski ucisk, cierpienie ani prześladowanie nie mogą odłączyć wierzących od miłości Chrystusa?
• Wj 1:13–14 → J 8:34–36. W czym bezlitosny trud przy zaprawie i cegłach przypomina niewolę grzechu, z której wyzwala jedynie Syn Boży?
• Wj 1:15–17 → Dz 5:29. Na jakiej fundamentalnej zasadzie moralnej Apostołowie oparli swój sprzeciw wobec nakazu Sanhedrynu, nawiązując do postawy położnych?
• Wj 1:17 → Prz 1:7; 16:6. Dlaczego bojaźń Pańska jest początkiem prawdziwej mądrości i skuteczną tarczą chroniącą przed uleganiem presji zła?
• Wj 1:20–21 → Hbr 6:10. Jak autor Listu do Hebrajczyków zapewnia, że Bóg nie zapomina o trudzie miłości i wierności swoich sług?
• Wj 1:22 → Mt 2:16–18. Jakie uderzające paralelizmy łączą rozkaz faraona z mordem niemowląt dokonanym przez Heroda w Betlejem?
• Wj 1:12 → 2 Kor 4:8–10. Co oznacza paradoks apostoła Pawła: „Zewsząd ucisk doznajemy, ale nie jesteśmy pognębieni; jesteśmy w rozterce, ale nie w rozpaczy”?
• Wj 1:21 → 1 Sm 2:30. W jaki sposób Boże zaopatrzenie dla domów położnych ilustruje obietnicę: „Tych, którzy mnie czczą, uczczę”?
• Wj 1:5 → Dz 7:14. Jak tradycja biblijna i mowa Szczepana podsumowują korzenie wyjścia i Bożą wierność w zachowaniu siedemdziesięciu pięciu dusz Jakuba?

PRAWDA NA DZIŚ
• Boże błogosławieństwo jest silniejsze niż wrogość świata: żaden ludzki dekret, kryzys ani ucisk nie zniweczą Bożego powołania w Twoim życiu.
• Presja i tyrania rodzą się z lęku: ludzie odrzucający Boga próbują kontrolować innych przez wzbudzanie strachu i ksenofobiczne podziały.
• Ucisk staje się katalizatorem duchowego wzrostu: im większe trudności napotyka człowiek wierzący, tym potężniej objawia się w nim moc łaski.
• Bojaźń Boża wyzwala z paraliżującego lęku przed ludźmi: kto czci Boga nade wszystko, zyskuje odwagę do odmowy udziału w niesprawiedliwości.
• Bóg pamięta imiona pokornych: historia zapomina o bezbożnych władcach, lecz uwiecznia ciche bohaterstwo tych, którzy ratują życie.
• Ochrona bezbronnych jest bezwzględnym obowiązkiem wiary: Bóg zawsze staje po stronie słabych i błogosławi tym, którzy stają w ich obronie.
• Wierność Bogu zawsze przynosi nagrodę: Ten, który założył domy bogobojnym położnym, buduje trwałą przyszłość dla każdego, kto Mu bezgranicznie ufa.

POMYŚL — PYTANIA DO REFLEKSJI
1. Czy w swoim życiu doświadczyłeś sytuacji, w której trudności, sprzeciw lub kryzys paradoksalnie przyczyniły się do Twojego duchowego dojrzenia?
2. W jakich obszarach współczesnego świata dostrzegasz działanie propagandy lęku i podstępu przypominające manipulację faraona z Wj 1:9–10?
3. Czy Twoje codzienne wybory kształtuje bojaźń Boża, czy raczej lęk przed opinią otoczenia, odrzuceniem lub stratą materialną?
4. Jak w praktyce możesz dziś naśladować odwagę Szifry i Pui w przeciwstawianiu się nieetycznym naciskom w pracy lub środowisku?
5. Dlaczego Pismo Święte zatarło imię potężnego faraona, a uwieczniło imiona dwóch hebrajskich położnych? Co to mówi o Bożej hierarchii wartości?
6. W jaki sposób świadomość, że Jezus wyzwolił Cię z niewoli grzechu, wpływa na Twoją codzienną wdzięczność i poczucie wolności?
7. W jaki konkretny sposób możesz stanąć w obronie osób słabych, nienarodzonych, chorych lub zepchniętych na margines w Twoim społeczeństwie?
8. Jaką masz pewność, że pomimo nacisku zsekularyzowanego świata Kościół Jezusa Chrystusa wciąż wzrasta i odniesie ostateczne zwycięstwo?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Ilu synów Jakuba przybyło z nim do Egiptu według Wj 1:1–4?
Odpowiedź: Jedenastu wymienionych z imienia, gdyż Józef był już w Egipcie (Wj 1:1–5).
2. Ile dusz liczyło całe potomstwo z bioder Jakuba w Egipcie?
Odpowiedź: Siedemdziesiąt dusz (Wj 1:5).
3. Co stało się z Józefem i jego braćmi według Wj 1:6?
Odpowiedź: Józef, wszyscy jego bracia i całe owo pokolenie pomarli (Wj 1:6).
4. Jakimi określeniami tekst opisuje demograficzny rozwój synów Izraela w Egipcie?
Odpowiedź: Byli płodni, rozmnożyli się bardzo, stali się niezwykle potężni i ziemia napełniła się nimi (Wj 1:7).
5. Kto wstąpił na tron w Egipcie według Wj 1:8?
Odpowiedź: Nowy król, który nie znał Józefa (Wj 1:8).
6. Jakie słowa nowy król skierował do swego ludu w Wj 1:9?
Odpowiedź: „Oto lud synów Izraela jest liczniejszy i silniejszy od nas” (Wj 1:9).
7. Do jakiego podstępu faraon wezwał Egipcjan w Wj 1:10?
Odpowiedź: Do przebiegłego/mądrego postąpienia z nimi, aby w razie wojny nie sprzymierzyli się z wrogami i nie opuścili ziemi (Wj 1:10).
8. Kogo ustanowiono nad synami Izraela, aby ich uciszać?
Odpowiedź: Nadzorców robót przymusowych (Wj 1:11).
9. Jakie miasta-spichlerze dla faraona zbudowali hebrajscy niewolnicy?
Odpowiedź: Pitom i Ramses (Wj 1:11).
10. Jaki był skutek uciskania Izraela według Wj 1:12?
Odpowiedź: Im bardziej ich uciskali, tym bardziej się pomnażali i rozrastali (Wj 1:12).
11. Jakie uczucie wzbudził w Egipcjanach dynamiczny rozrost Izraela?
Odpowiedź: Obawiali się synów Izraela i czuli przed nimi trwożliwy wstręt (Wj 1:12).
12. Przy jakich pracach Egipcjanie czynili życie Hebrajczyków gorzkim?
Odpowiedź: Przy zaprawie, cegłach i wszelkich pracach na polu – wszystko bez litości (Wj 1:14).
13. Jak miały na imię hebrajskie położne wezwane przez króla Egiptu?
Odpowiedź: Szifra i Pua (Wj 1:15).
14. Jaki rozkaz wydał faraon położnym odnośnie narodzin hebrajskich dzieci?
Odpowiedź: Jeśli urodzi się syn – miały go zabić, a jeśli córka – zostawić przy życiu (Wj 1:16).
15. Dlaczego położne odmówiły wykonania rozkazu faraona?
Odpowiedź: Ponieważ bały się Boga (Wj 1:17).
16. Co odpowiedziały położne, gdy faraon zażądał wyjaśnień?
Odpowiedź: Że kobiety hebrajskie są żywotne i rodzą, zanim położna do nich przyjdzie (Wj 1:19).
17. Jak Bóg zareagował na heroiczną postawę położnych?
Odpowiedź: Bóg dobrze czynił położnym, a lud pomnażał się i bardzo rósł w siłę (Wj 1:20).
18. W jaki sposób Bóg osobiście wynagrodził położne w Wj 1:21?
Odpowiedź: Założył im domy – obdarzył je własnymi rodzinami i potomstwem (Wj 1:21).
19. Jaki jawny rozkaz faraon wydał całemu swojemu narodowi w Wj 1:22?
Odpowiedź: Aby każdego nowo narodzonego syna wrzucali do rzeki Nil (Wj 1:22).
20. Kogo według nakazu faraona z Wj 1:22 należało oszczędzić?
Odpowiedź: Każdą córkę (Wj 1:22).

TWOJA DECYZJA
Pierwszy rozdział Księgi Wyjścia stawia nas w obliczu starcia dwóch diametralnie różnych porządków: despotycznego imperium budowanego na strachu i przemocy oraz Królestwa Boga, które pomnaża życie mimo ucisku. Faraon dysponował armią, rydwanami, nadzorcami i potęgą państwową, lecz jego zamysły runęły w zderzeniu z wiarą dwóch prostych położnych. Szifra i Pua nie posiadały tytułów politycznych ani siły militarnej; posiadały coś nieskończenie cenniejszego – bojaźń Bożą, która wyzwoliła je z paraliżującego strachu przed człowiekiem.
Dziś stoisz przed tym samym wyborem. Świat wokół Ciebie może wywierać presję, wymagać moralnych kompromisów, grozić odrzuceniem lub narzucać standardy sprzeczne z Bożym Słowem. Możesz ulec konformizmowi i lękowi, albo stanąć w autorytecie wiary, wiedząc, że żaden ludzki ucisk nie powstrzyma Bożego rozrostu w Twoim sercu. W Jezusie Chrystusie Bóg pokonał tyranię grzechu i potęgę śmierci. Możesz dziś podjąć decyzję o bezkompromisowej wierności Bogu w każdym obszarze swojego życia.
MOJA DECYZJA: Panie Boże, wybieram świętą bojaźń przed Twoim Majestatem ponad lęk przed ludźmi i nacisk tego świata. Wierzę, że Twoje błogosławieństwo pomnaża życie nawet w najtrudniejszych okolicznościach. Odrzucam kompromis z grzechem i deklaruję odwagę Szifry i Pui: będę chronić prawdę, stać po stronie słabych i iść za Jezusem Chrystusem, moim jedynym Zbawicielem i Królem!

MODLITWA NA 1 LISTOPADA
Wszechmogący Boże, Panie historii i Stwórco życia, dziękuję Ci za ten niedzielny poranek, pierwszy dzień listopada i za wejście w monumentalne karty Księgi Wyjścia. Dziękuję Ci, że jesteś Bogiem, który pamięta o swoim przymierzu i nigdy nie zapomina o swoim ludzie, nawet gdy ten znajduje się w głębokiej ciemności obcej ziemi.
Uwielbiam Cię za to, że żadna tyrania, zbrodniczy dekret ani ludzka nienawiść nie są w stanie powstrzymać Twojego błogosławieństwa. Dziękuję Ci za świadectwo Szifry i Pui – za ich prostą, niezłomną wiarę i bojaźń Bożą, która okazała się potężniejsza niż potęga tronu faraona. Wybacz mi, Panie, każdą chwilę słabości, w której z lęku przed ludzką opinią, presją grupy lub doczesną stratą godziłem się na kompromisy sprzeczne z Twoją świętą wolą.
Napełnij moje serce duchem odwagi, prawości i miłości. Spraw, abym na moim codziennym posterunku potrafił chronić życie, wspierać potrzebujących i nieugięcie zwiastować prawdę o Jezusie Chrystusie, który wyrwał nas z niewoli grzechu i śmierci. Prowadź naszą społeczność w tym nowym miesiącu formacji przez Księgę Wyjścia. Tobie niech będzie chwała, cześć i uwielbienie na wieki wieków. W imieniu Jezusa Chrystusa. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj uważnie cały pierwszy rozdział Księgi Wyjścia (Wj 1:1–22) w przekładzie UBG, zwracając szczególną uwagę na wersety 12 i 17.
☐ Przeprowadź rachunek sumienia: zidentyfikuj obszar, w którym odczuwasz ludzką presję lub lęk, i powierz go w modlitwie Bogu.
☐ Naucz się na pamięć wersetu pamięciowego: Wj 1:12 – „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”.
☐ Wybierz dziś odwagę wiary: podejmij jedną konkretną decyzję odmowy pójścia na łatwy kompromis moralny w swoim środowisku.
☐ Zadzwoń lub napisz do osoby przeżywającej udrękę, kryzys lub samotność, przypominając jej, że Bóg wyprowadza wzrost z najtrudniejszych prób.
☐ Podziękuj Bogu za rozpoczęcie drugiego miesiąca formacji biblijnej w programie „Z Biblią za Pan Brat”.
☐ Podziel się lekcją lub myślą przewodnią na Tablicy LUMINA lub w grupie formacyjnej WhatsApp.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 2 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 33 — „KOSZYK NA NILU: NARODZINY WYBAWICIELA, UCIECZKA I WOŁANIE W NIESZCZĘŚCIU”
Czytanie: Wj 2:1–25. Narodziny Mojżesza w cieniu dekretu śmierci, wiara Jokebed, arka z sitowia na rzece Nil, adopcja przez córkę faraona, zabójstwo Egipcjanina, ucieczka do Madianu, małżeństwo z Seforą oraz Boże wejrzenie na jęk cierpiącego Izraela.`;

// Zapisujemy kc-day32-lesson.txt
fs.writeFileSync(path.join(ROOT, 'scripts/content/kc-day32-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day32-lesson.txt');

// 2. Budujemy plik DOCX na Pulpicie
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
          top: 1276, // ~2.25 cm
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
          new TextRun({ text: TITLE, size: 36, bold: true, color: '0F2942' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: SUBTITLE, size: 24, italics: true, color: '4A5568' }),
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

const docxPath = 'C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_32_2026-11-01.docx';
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPath} (${buf.length} bajtów)`);

// 3. Budujemy 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 32 (1 listopada 2026): W nieskrępowanym rozroście — Nowy król, uciskanie i Boże ocalenie (Wj 1:1–22)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Drugi

Czy zdajesz sobie sprawę, że w Bożym Królestwie żadna ludzka presja, żaden dekret wroga ani żadna próba ucisku nie są w stanie zatrzymać wzrostu Twojej wiary, a im bardziej świat usiłuje Cię złamać, tym potężniej objawia się w Tobie siła życia Chrystusa?

Zatrzymaj się na progu trzydziestego drugiego dnia naszej formacyjnej wędrówki przez całe Pismo Święte i zbadaj z całą surowością swoje serce w ten niedzielny poranek, pierwszego listopada dwa tysiące dwudziestego szóstego roku. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego w obliczu rosnącej presji środowiska, lęku o przyszłość i nacisków tego świata tak łatwo ulegam paraliżującemu strachowi lub pokusie kompromisu, zamiast z niewzruszoną wiarą wyznać, że Twoje błogosławieństwo jest nieskończenie potężniejsze niż jakiekolwiek dekrety ziemskich tyranów? Wkraczając dzisiaj w Księgę Wyjścia, stajemy świadkami narodzin narodu przymierza w piecu ucisku. W Egipcie powstaje nowy król, który nie znał Józefa. Tyran kierowany strachem nakłada niewolnicze jarzmo i wydaje zbrodnicze rozkazy. Jednak Słowo Boże objawia paradoks Opatrzności: im bardziej go uciskali, tym bardziej się pomnażał i rozrastał! W psychologii odporności psychicznej i konformizmu społecznego zjawisko ulegania autorytetom pokazuje, jak łatwo człowiek rezygnuje z własnego sumienia pod wpływem strachu. Lecz w samym sercu pogańskiego imperium dwie proste kobiety, położne Szifra i Pua, dokonały czynu heroicznego: bały się Boga bardziej niż faraona i ocaliły niewinne życie! Prawda Królestwa uderza z wyzwalającą mocą: na krzyżu Golgoty szatan i władcy tego świata wydali ostateczny wyrok śmierci na Syna Bożego, lecz z grobu wytrysnęło wieczne zmartwychwstanie! Jezus Chrystus żyje, panuje i daje nam moc do przeciwstawienia się każdemu kłamstwu ciemności!

Jezus mówi dziś do Ciebie:
Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela. (Księga Wyjścia, rozdział pierwszy, werset dwunasty, UBG)

Zadanie Taktyczne:
Zmiażdż dzisiaj wszelki lęk przed opinią ludzi, presją otoczenia oraz pokusą konformizmu na swoim niedzielnym posterunku. Twoim dzisiejszym rozkazem jest całkowite poddanie sumienia pod autorytet Bożej bojaźni: Bóg jest Twoim jedynym Królem! Zakazuję Ci ulegania manipulacji strachem i rezygnowania z prawdy Ewangelii dla świętego spokoju. Zastąp to żywym wyznaniem wiary: „Panie Jezu, Ty jesteś moim Panem — wybieram posłuszeństwo Bogu ponad ludzkie nakazy i wierzę, że w Twoich rękach każda próba pomnaża moją wiarę!”, czyniąc to z nienaganną, królewską klasą i całkowitym oddaniem dziecka Bożego.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
„Ojcze w niebie, dziękuję Ci za ten niedzielny poranek i za moc Twojego Słowa, które rozprasza ciemność. Dziękuję Ci, że Twoje przymierze trwa na wieki i żadna ziemska potęga nie jest w stanie stłumić życia, które nam dałeś. Wybacz mi każdą chwilę tchórzostwa i kompromisu ze złem. Panie Jezu, napełnij mnie odwagą Szifry i Pui — daj mi serce, które nade wszystko boi się Ciebie, potrafi chronić słabych i odrzuca kłamstwa wroga. Tobie chwała na wieki.”

Rozkaz Dnia (Zadbaj o wzrost):
Nie idź w tę podróż sam. Wejdź do naszej bazy ludzi z pasją, zintegruj swoje siły z innymi i ruszaj ramię w ramię przez sześćdziesiąt sześć miesięcy formacji w unikalnym projekcie „Z Biblią za Pan Brat”.

Błogosławieństwo:
Niech Pan zastępów napełni Twoje serce pokojem i nieugiętą odwagą Jego prawdy, ustrzeże Cię od sideł wroga i błogosławi Twojemu domowi przez cały dzisiejszy dzień.

Dobrego dnia! Podaj dalej.

====================================================================
WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 32: W nieskrępowanym rozroście — Nowy król, uciskanie i Boże ocalenie

Trzydziesty drugi dzień naszej 66-miesięcznej podróży przez Pismo Święte otwiera monumentalną Księgę Wyjścia (Wj 1:1–22).

Po śmierci pokolenia Józefa na tron Egiptu wstępuje nowy faraon, który nie znał Józefa. Kierowany ksenofobią i lękiem przed utratą dominacji, władca nakłada na Izraelitów nieludzkie jarzmo niewolnictwa, zmuszając ich do katorżniczej pracy przy budowie miast-twierdz Pitom i Ramses. Pismo Święte objawia jednak transcendentny paradoks Bożej Opatrzności: „Im bardziej go uciskali, tym bardziej się pomnażał i rozrastał” (Wj 1:12). Gdy represje ekonomiczne zawodzą, tyran wydaje zbrodniczy rozkaz wymordowania hebrajskich noworodków płci męskiej. W tym momencie na scenę wkraczają prawdziwe bohaterki wiary: hebrajskie położne Szifra i Pua, które zaryzykowały życie, wybierając bojaźń Bożą ponad zbrodniczy edykt władcy (Wj 1:17). Bóg wynagradza ich wierność, dając im własne domy i chroniąc lud przymierza. Wydarzenia te zapowiadają krzyż i zmartwychwstanie Jezusa Chrystusa: żadna wściekłość wroga ani dekret śmierci nie zniszczą Bożego ludu, a próby stają się zarzewiem duchowego triumfu (Mt 2:16–18; Rz 8:31, 37)! Wybieraj dzisiaj świadomie: odrzuć lęk przed ludźmi, zaufaj potędze Boga i broń życia w prawdzie Królestwa!

Jezus mówi dziś do Ciebie:
„Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela.” (Wj 1:12) oraz „Trzeba bardziej słuchać Boga niż ludzi.” (Dz 5:29)

Zadanie Taktyczne (Czytaj | Wierz | Działaj):
* CZYTAJ: Przeczytaj uważnie cały 1. rozdział Księgi Wyjścia oraz apostolską deklarację odwagi z Dz 5:27–32.
* WIERZ: Przyjmij prawdę, że w rękach Chrystusa każdy ucisk i każda trudność stają się narzędziem Twojego duchowego wzrostu.
* DZIAŁAJ: Sprzeciw się dziś odważnie nieetycznemu kompromisowi lub niesprawiedliwości i wesprzyj osobę słabą lub zepchniętą na margines.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

Dołącz do bazy i całej społeczności formacyjnej: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴 TRZYDZIESTY DRUGI DZIEŃ SERII!
www.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl
Wspomóż misję: patronite.pl/osobowoscplus

====================================================================
WERSJA 3: OFICJALNY KURS CODZIENNY (polskieradio.cc/akademia)
====================================================================

66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 32
W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE
Śmierć pokolenia Józefa, dekret faraona, niewolniczy trud i odwaga bogobojnych położnych
Niedziela, 1 listopada 2026 r.  |  Czytanie: Wj 1:1–22

[Pełna treść kursowa wygenerowana wg wytycznych GPT znajduje się w pliku: Z_Biblia_za_Pan_Brat_Dzien_32_2026-11-01.docx oraz na platformie polskieradio.cc/akademia/kurscodzienny/dzien-32]

====================================================================
WERSJA 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym pojawia się monumentalna panorama budowy egipskich twierdz z Nilu w tle oraz napis: DZIEŃ 32 — W NIESKRĘPOWANYM ROZROŚCIE. W tle dynamiczny, pełen majestatu i nadziei motyw orkiestrowy.

[INTRO: ROZPOCZYNAMY KSIĘGĘ WYJŚCIA — NOWY ETAP MISJI]
Noemi: Dzień dobry państwu! Witamy niezwykle gorąco w trzydziestym drugim dniu naszej wielkiej formacyjnej podróży „Z Biblią za Pan Brat” na antenie Christian Culture TV! Rozpoczynamy dzisiaj drugi miesiąc formacji i wkraczamy w Księgę Wyjścia — monumentalną historię o przełamywaniu kajdan, wierności Boga i drodze ku prawdziwej wolności!
Sara: Witamy w ten wyjątkowy niedzielny poranek, pierwszego listopada! Wczoraj żegnaliśmy patriarchów w Księdze Rodzaju, a dziś stajemy w obliczu dramatycznego zwrotu akcji. W Egipcie powstaje nowy faraon, który nie znał Józefa. Władca widzi rosnący w siłę lud Boży i zamiast wdzięczności wybiera lęk, uciskanie i zbrodniczą przemoc. Ale w odpowiedzi Bóg ogłasza żelazne prawo swojego Królestwa: im bardziej ich uciskali, tym bardziej się pomnażali!

[ANALIZA PROBLEMOWA: BOJAŹŃ BOŻA A LĘK PRZED WŁADZĄ]
Noemi: Spójrzmy na ten mechanizm, który tak doskonale znamy z historii i z naszego życia. Gdy bezbożny system czuje, że traci kontrolę, uderza w wierzących manipulacją, strachem i obciążeniami ponad miarę. Faraon nakazuje hebrajskim położnym mordowanie chłopców. I tu pojawia się absolutny fenomen wiary: Szifra i Pua! Dwie proste kobiety stają przed wszechwładnym monarchą i mówią w swoich sercach: Bóg jest wyżej niż król!
Sara: To fundament biblijnej odwagi, Noemi! Położne bały się Boga i dlatego nie bały się faraona! Bojaźń Boża nie paraliżuje — ona wyzwala człowieka z niewolniczego lęku przed ludźmi! Bóg obdarzył je rodzinami, założył im domy i zachował swój lud. A gdy spojrzymy na Nowy Testament, widzimy Heroda mordującego dzieci w Betlejem i Chrystusa, który przez swój krzyż i zmartwychwstanie łamie ostatecznie potęgę szatana!

[SŁOWO ROZKAZU: PERSPEKTYWA BIBLIJNA]
Noemi: Wyświetlamy najważniejsze współrzędne taktyczne na dzisiejszy dzień: „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał” (Wj 1:12) oraz słowa Apostołów: „Trzeba bardziej słuchać Boga niż ludzi” (Dz 5:29).
Sara: Zapamiętaj to w każdym ucisku i trudzie: to nie wrogowie decydują o Twojej przyszłości, lecz zmartwychwstały Chrystus, który żyje w Tobie!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Nasz żelazny standard: Czytaj, Wierz, Działaj!
Sara: Przeczytajcie dziś pierwszy rozdział Księgi Wyjścia. Uwierzycie, że żadna presja nie zniszczy Bożego planu w Waszym życiu. A w działaniu — stańcie dziś odważnie po stronie prawdy i nie ulegajcie kompromisom!

[MANIFEST: MODLITWA BOJOWA]
Sara: Powstańmy do wspólnej deklaracji wiary.
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci za Twoje wieczne przymierze. Wyznajemy, że Ty panujesz nad historią i żadna ludzka tyrania nie powstrzyma Twojego Królestwa. Panie Jezu, napełnij nas odwagą bogobojnych położnych, abyśmy z czystym sumieniem wiernie służyli Twojej prawdzie. Tobie chwała na wieki wieków. Amen.”

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Noemi: Dziękujemy za wspólny poranek w Christian Culture TV! Pamiętajcie, że wszystkie nasze portale i aplikacje są dla państwa zawsze całkowicie bezpłatne (polskieradio.cc, cclite.pl, patronite.pl/osobowoscplus).
Sara: Niech Boży pokój i niezłomna odwaga towarzyszą Wam przez całą niedzielę!
Noemi: Do zobaczenia jutro w drugim rozdziale Księgi Wyjścia! Czytaj, wierz, działaj. Dla Jezusa!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: W NIESKRĘPOWANYM ROZROŚCIE — NOWY KRÓL, UCIEMIĘŻENIE IZRAELA I ŚWIĘTY OPÓR POŁOŻNYCH W PIERWSZYM ROZDZIALE KSIĘGI WYJŚCIA
**Księga Wyjścia — Miesiąc 2 | Dzień 32 (1 listopada 2026 r.)**

W ramach ogólnopolskiego programu badań biblijnych „Z Biblią za Pan Brat”, redakcja leksykonu teologicznego portalu informacyjnego CCN publikuje analityczne studium otwierającego rozdziału Księgi Wyjścia (Wj 1:1–22). Stanowi on przejście od narracji rodzinno-patriarchalnej Księgi Rodzaju do dramatu narodzin ludu Bożego w warunkach totalitarnej presji państwowej Nowego Państwa w Egipcie. Tekst syntetyzuje wątki imperialnej propagandy lęku, teologii Bożego błogosławieństwa triumfującego nad opresją oraz pierwszego w historii biblijnej aktu obywatelskiego nieposłuszeństwa motywowanego bojaźnią Bożą.

1. Zmiana paradygmatu politycznego i instytucjonalizacja ucisku (Wj 1:1–14)
Rozdział otwiera imienne zestawienie jedenastu synów Jakuba oraz wzmianka o siedemdziesięciu duszach potomstwa, które w ziemi Goszen doświadczyło bezprecedensowego rozrostu demograficznego (Wj 1:7; nawiązanie do Rdz 1:28 i 15:5). Sukces ten staje się pretekstem do represji po wstąpieniu na tron nowego monarchy, który „nie znał Józefa” (Wj 1:8). Narrator precyzyjnie demaskuje psychologiczny mechanizm tyranii: faraon projektuje własny lęk przed utratą dominacji na mniejszość hebrajską, kreując ją na zagrożenie militarne (Wj 1:9–10). Instytucjonalizacja niewolnictwa poprzez nałożenie robót przymusowych i budowę miast-twierdz Pitom i Ramses (Wj 1:11) rodzi jednak teologiczny paradoks:
> „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela.” (Wj 1:12)

2. Bojaźń Boża a etyka nieposłuszeństwa obywatelskiego: Szifra i Pua (Wj 1:15–21)
Wobec fiaska represji ekonomicznych faraon sięga po biologiczne ludobójstwo, wydając tajny rozkaz hebrajskim położnym Szifrze i Pui, nakazujący mordowanie nowo narodzonych chłopców na stołkach porodowych (Wj 1:15–16). Autorskie uwiecznienie imion położnych przy jednoczesnym pominięciu imienia faraona stanowi wyraźny zabieg teologiczny: w oczach Boga to wierność moralna determinuje trwałą wartość człowieka. Położne odmawiają wykonania zbrodniczego rozkazu, kierując się „bojaźnią Bożą” (Wj 1:17) – postawą uznania transcendentnego prawa Stwórcy ponad dekret doczesnego władcy (por. Dz 5:29). Odpowiedź położnych chroniąca życie zostaje pobłogosławiona przez Boga, który obdarza je własnymi rodzinami („założył im domy”, Wj 1:21).

3. Totalitarny dekret eksterminacji i ironia Nilu (Wj 1:22)
Finałowy werset rozdziału dokumentuje eskalację od tajnej intrygi do powszechnego dekretu skierowanego do całego narodu egipskiego: nakazu topienia nowo narodzonych synów w Nilu (Wj 1:22). Rzeka uchodząca w egipskim panteonie za bóstwo życia (Hapi) zostaje przekształcona w narzędzie masowej kaźni. Narracja osiąga tu punkt kulminacyjny napięcia, przygotowując czytelnika na pojawienie się Mojżesza, który z wód tej samej rzeki zostanie wyłowiony ku ocaleniu narodu.

4. Chrystus w Centrum: Wyzwolenie z niewoli i triumf życia
Perykopa Wj 1 znajduje pełne dopełnienie chrystocentryczne w Nowym Testamencie. Zbrodniczy edykt faraona zapowiada rzeź niewiniątek w Betlejem z rozkazu króla Heroda (Mt 2:16–18), z której Opatrzność ratuje Dziecię Jezus. Niewolniczy trud przy zaprawie i cegłach obrazuje duchową niewolę grzechu, z której wykupić może jedynie krew Chrystusa (J 8:34–36; Hbr 2:14–15). Wreszcie, wzrost Kościoła pośród prześladowań (Dz 8:1–4) oraz zmartwychwstanie Jezusa pieczętują ostateczny triumf Bożego Królestwa nad wszelkimi dekretami śmierci.

📌 PODSUMOWANIE REDAKCYJNE CCN
Pierwszy rozdział Księgi Wyjścia ukazuje fundamentalną prawdę teologiczną: ziemska potęga i przemoc są bezradne wobec suwerennej woli Boga, który strzeże swojego przymierza. Cicha wierność bogobojnych sług ma w historii zbawienia większą wagę niż imperialne armie despotów.

*Wszystkie materiały formacyjne i publicystyczne w ekosystemie Christian Culture są całkowicie bezpłatne. Dołącz do naszej bazy subskrybentów i śledź codzienne analizy w ramach projektu „Z Biblią za Pan Brat”.*

🌐 **Źródła i powiązane serwisy:** [polskieradio.cc](https://www.polskieradio.cc) | [polskieradio.cc/lumina](https://www.polskieradio.cc/lumina) | [cclite.pl](https://www.cclite.pl)  
💬 *Dołącz do społeczności:* [Grupa WhatsApp CCN / CC](https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0)
`;

fs.writeFileSync(path.join(ROOT, 'scripts/content/pakiet-day32-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day32-5wersji.md');

console.log('🎉 Kompletna lekcja tekstowa, plik Word .docx i pakiet 5 wersji wygenerowane pomyślnie!');
