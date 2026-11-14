import fs from 'node:fs';
import path from 'node:path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import { sprawdzLekcje } from './kurs-codzienny/straznik-lekcji.mjs';

const ROOT = process.cwd();

console.log('================================================================');
console.log('🚀 MASTER GENERATOR: DZIEŃ 39 (Wj 8:1–32) — NIEDZIELA 08.11.2026');
console.log('================================================================');

// 1. METRYKA DNIA
const DAY_NUM = 39;
const DATE_STR = '2026-11-08';
const DATE_FORMATTED = 'Niedziela, 8 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 8:1–32';
const TITLE = 'PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN';
const SUBTITLE = 'Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza';
const MEMORY_VERSE = '„Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.” (Wj 8:19, UBG)';
const THEME = 'Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.';

// 2. WCZYTUJEMY WERSETY UBG
const ubgPath = 'C:/Users/czark/Desktop/Biblia Audio Christian Culture/teksty_ubg/ubg-2025/EXO-008.json';
const ubgData = JSON.parse(fs.readFileSync(ubgPath, 'utf8'));
const versesList = ubgData.verses;
const versesHtml = versesList.map(v => `        <p><span class="verse-num">${v.number}</span> ${v.text}</p>`).join('\n');

// 3. PEŁNY TEKST LEKCJI (12 SEKCJI WG WYTYCZNYCH GPT)
const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 39
PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN
Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza
Niedziela, 8 listopada 2026 r.  |  Czytanie: Wj 8:1–32
TEKST PAMIĘCIOWY: „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.” (Wj 8:19, UBG)
MYŚL PRZEWODNIA: Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.

ZANIM OTWORZYSZ BIBLIĘ
Ósmy rozdział Księgi Wyjścia wprowadza nas w samo centrum wielkiej batalii o duszę narodu wybranego i o objawienie chwały jedynego prawdziwego Boga wobec najpotężniejszego mocarstwa starożytnego świata. W poprzednim rozdziale byliśmy świadkami sądu nad świętym Nilem — woda zamieniona w krew obnażyła bezradność bóstw Hapi i Ozyrysa, a siedem dni skażenia rzeki było czasem Bożej cierpliwości wzywającej do opamiętania. Faraon jednak zignorował ten znak, uciekając do swojego pałacu i utwardzając swoje serce.
W rozdziale ósmym rozpoczyna się dynamiczna seria trzech kolejnych plag: żab (druga plaga), wszy lub komarów (trzecia plaga) oraz gzów i jadowitych much (czwarta plaga). Każda z nich uderza precyzyjnie w inny element pogańskiego kultu Egiptu. Żaby były ucieleśnieniem bogini Heket, opiekunki płodności i narodzin. Proch ziemi zamieniony we wszy demaskował nicość boga ziemi Geba oraz uniemożliwiał kapłanom egipskim rytualną czystość w świątyniach. Natomiast chmary much i gzów ośmieszały bóstwo Uatczit oraz skarabeusza Khepri.
Jednak w tym rozdziale dochodzi do dwóch epokowych przełomów teologicznych. Po pierwsze, przy trzeciej pladze kapitulują egipscy magowie i czarownicy — po raz pierwszy nie są w stanie powtórzyć znaku swymi czarami i wypowiadają historyczne wyznanie: „To jest palec Boży” (Wj 8:19). Po drugie, przy czwartej pladze Bóg wprowadza widzialne, nienaruszalne rozróżnienie (hebr. pedut — wykupienie, rozdzielenie) pomiędzy ziemią Egiptu a krainą Goszen: podczas gdy cały Egipt tonie w ruinie i zniszczeniu, domy synów Izraela cieszą się absolutnym pokojem i ochroną. Rozdział ten demaskuje również taktykę kompromisów, jakimi szatan i duch tego świata usiłują zatrzymać wierzących w połowie drogi do pełnego posłuszeństwa Bogu.

CZĘŚĆ I — DRUGA PLAGA: INWAZJA ŻAB I MODLITWA WSTAWIENNICZA (Wj 8:1–15)
1. Ponowne posłanie i niezmienne poselstwo suwerena (8:1)
Bóg posyła Mojżesza do pałacu faraona z tą samą, nienaruszalną formułą: „Tak mówi PAN: Wypuść mój lud, aby mi służył”. Boże standardy nie podlegają dewaluacji ani obniżeniu; celem wyzwolenia człowieka nie jest bezcelowa samowola, lecz święta służba i uwielbienie Stwórcy.
2. Ostrzeżenie przed plagą żab (8:2)
Bóg zapowiada plagę żab (hebr. cfadea), która dotknie wszystkie granice Egiptu. W wierzeniach egipskich żaba była symbolem bogini Heket, przedstawianej z głową płaza, czczonej jako dawczyni życia i wspomożycielka przy porodach. Bóg obraca pogańskiego bożka w źródło odrazy i udręki.
3. Inwazja na strefy intymne i codzienność imperium (8:3)
Plaga nie ogranicza się do pól czy bagien. Żaby wchodzą do pałaców, sypialni, łóżek, pieców chlebowych i dzież na ciasto. To, co było symbolem płodności, staje się wszechobecnym koszmarem uniemożliwiającym odpoczynek, sen i przygotowanie pożywienia.
4. Totalny zasięg dotknięcia — od tronu po sługi (8:4)
Żaby wpełzają bezpośrednio na ciało faraona, na jego dostojników i cały lud. Pogański władca, uważający się za bóstwo nietykalne, zostaje upokorzony przez bezsilne płazy skaczące po jego szatach i łożu.
5. Gest posłuszeństwa i wyciągnięcie laski Aarona (8:5–6)
Na rozkaz Pana Aaron wyciąga rękę ze swoją laską nad rzeki, kanały i stawy Egiptu. Z wód wychodzą miliony płazów, które szczelnie przykrywają ziemię egipską. Cała natura natychmiast reaguje na głos Stwórcy.
6. Demoniczna imitacja i pułapka czarowników (8:7)
Magowie egipscy swymi zaklęciami również sprowadzają żaby. Pismo Święte ukazuje tu tragizm i bezsens okultyzmu: czarownicy potrafią jedynie powiększyć zniszczenie i cierpienie kraju, lecz nie potrafią usunąć ani jednej żaby!
7. Kapitulacja tyrana i pierwsza prośba o modlitwę (8:8)
Faraon po raz pierwszy wzywa Mojżesza i Aarona, błagając: „Módlcie się do PANA, aby oddalił żaby ode mnie i od mojego ludu, a wypuszczę lud, aby złożył ofiarę PANU”. Gdy pogańskie bóstwa zawodzą, pyszny monarcha szuka ratunku u pasterzy Boga Żywego.
8. Wolność proroka i wybór terminu przez władcę (8:9)
Mojżesz okazuje wspaniałomyślność posłańca Bożego, dając faraonowi zaszczyt wyznaczenia chwili, w której ma się wstawić za nim i jego ziemią, aby okazało się, że Bóg panuje nad czasem i okolicznościami.
9. Tragiczna prokrastynacja grzesznika: „Jutro” (8:10–11)
Na pytanie, kiedy żaby mają wyginąć, faraon odpowiada: „Jutro”. To przerażający obraz duchowej zwłoki człowieka: woli spędzić jeszcze jedną noc pośród obrzydliwych płazów, byle odsunąć moment pełnego ukorzenia się przed Panem.
10. Modlitwa wstawiennicza i smród zepsucia (8:12–15)
Mojżesz żarliwie woła do Pana, a Pan spełnia prośbę: żaby giną w domach, na podwórzach i polach. Ludzie zbierają je na wielkie stosy, a cała ziemia cuchnie rozkładem. Gdy jednak faraon widzi, że nadeszło wytchnienie, natychmiast zatwardza swoje serce i łamie obietnicę.

CZĘŚĆ II — TRZECIA PLAGA: PROCH ZIEMI I WYZNANIE CZAROWNIKÓW (Wj 8:16–19)
11. Sąd bez ostrzeżenia — trzecia faza cyklu (8:16a)
W strukturze plag egipskich każda trzecia plaga w triadzie (3., 6., 9.) nadchodzi nagle, bez wcześniejszego ostrzeżenia. Gdy człowiek lekceważy poprzednie znaki i cofa dane Bogu obietnice, sąd Boży spada niespodziewanie.
12. Uderzenie w pył ziemi (8:16b)
Pan nakazuje Mojżeszowi: „Powiedz Aaronowi: Wyciągnij swoją laskę i uderz pył ziemi, aby zamienił się we wszy na całej ziemi Egiptu”. Sąd dosięga samego fundamentu egzystencji imperium — żyznej czarnej ziemi (Kemet), z której Egipcjanie czerpali dumę.
13. Ośmieszenie bóstwa Geba (8:17a)
Plaga wszy i moskitów uderza w kult Geba — egipskiego boga ziemi, uważanego za ojca bóstw i opiekuna urodzaju. Ta sama ziemia, którą Egipcjanie czcili i całowali, rodzi teraz udrękę i cierpienie.
14. Paraliż pogańskiego kapłaństwa (8:17b)
Wszy i robactwo obsiadają ciała ludzi i bydła na całej ziemi. Kapłani egipscy, którzy obsesyjnie dbali o rytualną czystość — goląc ciała co dwa dni i nosząc nieskazitelny len — stają się rytualnie nieczyści i nie mogą wejść do żadnej świątyni. Pogański kult zostaje całkowicie sparaliżowany.
15. Bezsilność okultyzmu: „I nie mogli” (8:18)
Czarownicy próbują swymi tajemnymi zaklęciami powtórzyć cud i sprowadzić wszy, lecz ponoszą sromotną klęskę. Trzy słowa hebrajskie w tekście brzmią jak wyrok nad całym światem magii: we-lo jakolu („i nie zdołali”). Moce ciemności potrafią manipulować, lecz nie mają mocy powołać życia z prochu ziemi!
16. Monopol Stwórcy na dawanie życia (8:18b)
Tylko Bóg JAHWE ma moc uczynić z prochu ziemi istotę żywą (por. Rdz 2:7). Granica czarów zostaje definitywnie wyznaczona — szatan nie jest stwórcą, lecz ułomnym stworzeniem.
17. Dziejowe wyznanie kapłanów: „To jest palec Boży!” (8:19a)
Upokorzeni magowie stają przed faraonem i składają bezprecedensowe świadectwo: „To jest palec Boży (hebr. ecba Elohim)”. Pogańscy czarownicy pierwsi kapitulują i uznają, że konfrontują się z mocą przewyższającą wszelkie siły demoniczne i ludzkie.
18. Trwanie w pysze wbrew dowodom ekspertów (8:19b)
Mimo że właśni nadworni mędrcy i kapłani ostrzegają faraona przed walką z Bogiem, serce monarchy pozostaje zatwardziałe. Zaślepienie pychą sprawia, że człowiek odrzuca nawet najbardziej bezsporne świadectwa prawdy.
19. Wymiar pedagogiczny trzeciej plagi (8:19c)
Trzecia plaga dowodzi, że religijność bez posłuszeństwa prowadzi do duchowej klęski. Egipcjanie szukali czystości w zewnętrznych ablucjach, podczas gdy ich serca były pełne zepsucia i bałwochwalstwa.
20. Wierność Bożemu Słowu w zapowiedzi zatwardzenia (8:19d)
Tekst podkreśla: „nie posłuchał ich, jak PAN zapowiedział”. Nic nie dzieje się poza wiedzą i kontrolą suwerennego Boga; ludzki bunt nie jest w stanie pokrzyżować Bożego planu odkupienia.

CZĘŚĆ III — CZWARTA PLAGA: CHMARY MUCH I ROZRÓŻNIENIE GOSZEN (Wj 8:20–24)
21. Poranny apel u brzegów Nilu (8:20a)
Bóg nakazuje Mojżeszowi wstać wcześnie rano i stanąć przed faraonem, gdy ten wychodzi nad wodę. Suwerenny Pan nie czeka na zaproszenie ziemskich królów; staje na ich drodze o świcie każdego nowego dnia.
22. Niezmienne wezwanie do uwolnienia Bożego ludu (8:20b)
Orędzie pozostaje niezmienne: „Wypuść mój lud, aby mi służył”. Bóg nie negocjuje praw swojego ludu ani nie rezygnuje z upominania się o swoich wybranych.
23. Zapowiedź inwazji zjadliwych much i gzów (8:21a)
Bóg zapowiada plagę arow — chmary gryzących owadów, gzów i zjadliwych much, które wypełnią domy sług, domy ludu oraz całą ziemię egipską. Sąd ten uderza w bóstwo Khepri, uosabiane przez owada toczącego tarczę słońca.
24. Zniszczenie gospodarki i miru domowego (8:21b)
Gryzące owady uniemożliwiają pracę na roli, ranią bydło i wdzierają się do wnętrz domów, niszcząc zapasy żywności i sprowadzając bolesne rany na ciała mieszkańców.
25. Epokowe oddzielenie: Kraina Goszen nietykalna (8:22a)
W wersecie 22 Bóg ogłasza przełomową decyzję przymierza: „W owym dniu oddzielę ziemię Goszen, w której mieszka mój lud, aby tam nie było rozmaitych much”. Podczas gdy cały Egipt obraca się w ruinę, domy Hebrajczyków są bezpieczną oazą.
26. Objawienie Bożej obecności w środku ziemi (8:22b)
„I poznasz, że ja jestem PAN pośrodku ziemi”. Pogańscy bogowie byli bóstwami lokalnymi, przypisanymi do konkretnych świątyń. Bóg Abrahama, Izaaka i Jakuba objawia, że Jego panowanie obejmuje cały glob — nawet w samym sercu obcego imperium.
27. Ustanowienie znaku wykupienia — Pedut (8:23a)
Bóg wypowiada słowa o fundamentalnym znaczeniu teologicznym: „Oddzielę znakiem odkupienia (hebr. pedut) mój lud od twojego ludu”. Hebrajskie słowo pedut oznacza odkupienie, wykupienie, okup za życie. Izraelici nie są bezpieczni dlatego, że są lepsi z natury, lecz dlatego, że są ludem wykupionym przez krew przymierza!
28. Boża punktualność: „Jutro ten znak nastąpi” (8:23b)
Bóg wyznacza dokładny termin: znak oddzielenia nastąpi nazajutrz. W przeciwieństwie do faraona, którego „jutro” oznaczało odkładanie pokuty, Boże „jutro” jest wyrazem precyzyjnego wypełnienia obietnicy.
29. Wypełnienie sądu i spustoszenie Egiptu (8:24a)
PAN czyni według swego Słowa: chmary uciążliwych much nawiedzają dom faraona, domy jego sług i całą ziemię egipską. Pyszny pałac staje się miejscem udręki, z której nie ma ucieczki.
30. Ziemia obrócona w perzynę (8:24b)
Kronikarz biblijny notuje lakonicznie, lecz dosadnie: „I ziemia została zniszczona przez rozmaite muchy”. Imperium, które budowało piramidy i uważało się za centrum cywilizacji, zostaje rzucone na kolana przez chmarę owadów.

CZĘŚĆ IV — PUŁAPKI KOMPROMISU I PONOWNY BUNT (Wj 8:25–32)
31. Faraon szuka porozumienia z pozycji władzy (8:25a)
Złamany cierpieniem monarcha wzywa Mojżesza i Aarona. Nie ma już w nim wcześniejszej pogardy; udręka zmusza go do szukania kompromisu.
32. Pierwszy kompromis: „Złóżcie ofiarę w tej ziemi” (8:25b)
Faraon proponuje pozorną ustępstwo: „Idźcie, złóżcie na tej ziemi ofiarę waszemu Bogu”. To klasyczna taktyka wroga: bądź religijny, módl się, składaj ofiary, ale pozostań w granicach mojego systemu — nie opuszczaj Egiptu, nie odcinaj się od pogańskiej kultury!
33. Kategoryczny sprzeciw Mojżesza: Zakaz ofiarowania w Egipcie (8:26a)
Mojżesz odpowiada bez chwili wahania: „Nie godzi się tak czynić; bo to, co złożylibyśmy w ofierze PANU, naszemu Bogu, byłoby zgorszeniem dla Egipcjan”. Służba Bogu nie może być dostosowywana do upodobań i tolerancji bezbożnego świata.
34. Śmiertelne zagrożenie ukamienowaniem (8:26b)
Hebrajczycy mieli składać w ofierze bydło, barany i kozy — zwierzęta, które w Egipcie otaczane były boską czcią (kult byka Apisa, bogini Hathor i barana Amona). Złożenie takiej ofiary na oczach pogan wywołałoby natychmiastowe ukamienowanie Izraelitów. Prawdziwe uwielbienie Boga zawsze będzie „zgorszeniem” dla pogańskiego świata.
35. Wymóg trzech dni drogi na pustynię (8:27)
Mojżesz nie cofa się ani o krok od pierwotnego nakazu: „Pójdziemy w trzy dni drogi na pustynię i złożymy ofiarę PANU, naszemu Bogu, jak nam rozkaże”. Prawdziwa wolność wymaga pełnego, fizycznego i duchowego oddzielenia od niewoli grzechu.
36. Drugi kompromis: „Tylko nie oddalajcie się zbytnio” (8:28a)
Widząc nieugiętość Bożego posłańca, faraon rzuca drugą propozycję: „Wypuszczę was... tylko nie oddalajcie się zbytnio”. To pułapka letniości: bądź chrześcijaninem, ale nie bądź radykalny, zachowaj kontakt ze starym życiem, bądź blisko granicy grzechu!
37. Błaganie o wstawiennictwo bez nawrócenia (8:28b)
Faraon dodaje: „Wstawcie się też za mną”. Podobnie jak wielu współczesnych ludzi, pragnie modlitwy o usunięcie kłopotów, lecz nie ma w nim pragnienia porzucenia buntu i oddania chwały Bogu.
38. Przestroga Mojżesza przed cynizmem i kłamstwem (8:29)
Mojżesz zgadza się modlić, lecz stawia sprawę jasno: „Tylko niech faraon już więcej nie oszukuje, nie chcąc wypuścić ludu, by złożył ofiarę PANU”. Bóg nie pozwala z siebie drwić; kłamstwo wobec Stwórcy jest igraniem z wiecznym sądem.
39. Całkowite oczyszczenie ziemi na modlitwę sługi Bożego (8:30–31)
Mojżesz woła do Pana, a Bóg okazuje swoją suwerenną łaskę: rozmaite muchy odchodzą od faraona, jego dworu i ludu. Pismo odnotowuje wspaniały szczegół: „Nie została ani jedna”. Gdy Bóg oczyszcza, czyni to doskonale!
40. Tragiczny finał: Ponowne zatwardzenie serca faraona (8:32)
Gdy tylko minęło niebezpieczeństwo i powrócił komfort, „faraon i tym razem zatwardził swe serce i nie wypuścił ludu”. Łaskawość Boga, zamiast skruszyć grzesznika, staje się dla pysznego serca okazją do powrotu w dawne kajdany nieposłuszeństwa.

JEZUS W CENTRUM — PALEC BOŻY, ZIEMIA GOSZEN I PEŁNE WYZWOLENIE
41. Palec Boży w służbie Jezusa Chrystusa (Wj 8:19 a Łk 11:20; Mt 12:28)
W ósmym rozdziale Księgi Wyjścia egipscy czarownicy wyznają: „To jest palec Boży”. Przez wieki formuła ta oznaczała bezpośrednią, suwerenną demonstrację Bożej wszechmocy nad mocami ciemności. Do tych samych słów nawiązał Pan Jezus Chrystus w Ewangelii Łukasza, mówiąc do faryzeuszy: „A jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże”. Na Krzyżu i w swojej ziemskiej posłudze Chrystus nie potrzebował wielkiego wysiłku — sam Palec Bożej łaski i autorytetu Syna Bożego druzgocze panowanie szatana, uwalniając więźniów z niewoli grzechu.
42. Kraina Goszen jako typologia wiecznego bezpieczeństwa w Chrystusie (Wj 8:22–23 a Rz 8:1; Ps 91:1–7)
Cudowne oddzielenie ziemi Goszen (hebr. pedut — wykupienie, okup) od plag niszczących Egipt jest proroczym cieniem naszego położenia w Chrystusie. W Nim — w naszym Odkupicielu — otrzymaliśmy wieczne schronienie przed Bożym gniewem ciążącym nad tym światem. „Teraz więc nie ma żadnego potępienia dla tych, którzy są w Chrystusie Jezusie”. Nawet gdy wokół nas świat pogrąża się w moralnym chaosie i duchowej ciemności, domy wierzących, okryte krwią Zbawiciela, cieszą się nienaruszalnym pokojem, łaską i Bożą obecnością.
43. Chrystusowe odrzucenie kompromisów kusiciela (Wj 8:25, 28 a Mt 4:8–10; Hbr 10:5–10)
Kompromisy faraona („służcie w tej ziemi”, „nie odchodźcie za daleko”) odzwierciedlają pokusy, jakimi szatan kusił Jezusa na pustyni: „Dam Ci to wszystko, jeśli upadniesz i oddasz mi pokłon”. Chrystus nie poszedł na żaden kompromis ze złem. Odrzucił połowiczność, odpowiadając: „Idź precz, szatanie! Jest bowiem napisane: PANU, swemu Bogu, będziesz oddawał pokłon i tylko jemu będziesz służył”. Jezus dokonał naszego odkupienia w posłuszeństwie aż do śmierci krzyżowej, nie pozostawiając ani centymetra naszego życia w niewoli wroga.
44. Wolność bez granic — wyjście na trzy dni drogi za Barankiem (Wj 8:27 a J 8:36; Gal 5:1)
Trzy dni drogi na pustynię symbolizują w biblijnej teologii śmierć, pogrzeb i zmartwychwstanie Chrystusa w trzecim dniu! Prawdziwe wyzwolenie nie polega na poprawieniu warunków bytowych w Egipcie, lecz na przejściu ze śmierci do życia. „Jeśli więc Syn was wyzwoli, będziecie prawdziwie wolni”. W Chrystusie zostaliśmy wyprowadzeni poza obóz pogańskiego świata, by w Duchu Świętym oddawać Ojcu cześć w duchu i w prawdzie.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 8:1 → Rz 12:1. Wypuszczenie do służby — w jaki sposób apostoł Paweł nawiązuje do celu wyjścia z niewoli, wzywając nas do oddania ciał na ofiarę żywą i świętą?
• Wj 8:2 → Ap 16:13–14. Symbolika żab — dlaczego nieczyste duchy w Księdze Apokalipsy wychodzą z paszczy smoka pod postacią żab i jak łączy się to z pogańskim kultem Egiptu?
• Wj 8:10 → 2 Kor 6:2; Hbr 3:7–8. Złudzenie „jutra” — dlaczego zwlekanie z pokutą i wybór „jutro” zamiast „dziś” jest jedną z najbardziej śmiercionośnych pułapek ludzkiej duszy?
• Wj 8:14 → Rz 6:21. Smród martwych bożków — jaki owoc przynosi grzech po zdemaskowaniu jego pozornego blasku i dlaczego światowe bożki kończą się duchowym rozkładem?
• Wj 8:18 → 1 J 4:4; Dz 19:13–16. Granice demonicznej mocy — dlaczego okultyzm i siły ciemności nie potrafią stworzyć życia i dlaczego wierzący w Chrystusie nie musi się ich lękać?
• Wj 8:19 → Łk 11:20. Palec Boży — jak Pan Jezus posłużył się formułą egipskich magów, dowodząc, że Jego moc nad demonami zwiastuje inaugurację Królestwa Bożego?
• Wj 8:22 → Mal 3:18. Rozróżnienie Goszen — jak prorok Malachiasz opisuje dzień, w którym Bóg ponownie w widzialny sposób ukaże różnicę między sprawiedliwym a bezbożnym?
• Wj 8:23 → Ef 1:7; Kol 1:13–14. Znak odkupienia (pedut) — w jaki sposób krew Chrystusa jest naszym wykupieniem i tarczą oddzielającą nas od potępienia tego świata?
• Wj 8:25 → 2 Kor 6:14–17. Pułapka „ofiary w Egipcie” — dlaczego nie można łączyć kultu prawdziwego Boga z kompromisami ze świeckim systemem i dlaczego Bóg wzywa: „Wyjdźcie spośród nich”?
• Wj 8:27 → Hbr 13:13–14. Trzy dni drogi za obóz — dlaczego pójście za Chrystusem wymaga opuszczenia ziemskich miast i poniesienia Jego urągania na pustyni wiary?
• Wj 8:28 → Łk 9:62. Pokusa „nie za daleko” — jak słowa Jezusa o ręce przyłożonej do pługa demaskują połowiczną, letnią wiarę, która chce trzymać się blisko granic świata?
• Wj 8:32 → Hbr 3:12–13. Zwodniczość ulgi — dlaczego ustąpienie bólu i nadejście wytchnienia bez prawdziwej pokuty prowadzi do jeszcze głębszego zatwardzenia serca?

PRAWDA NA DZIŚ
• Wolność od Boga ma cel: Bóg nie uwalnia nas do bezcelowej samowoli, lecz do świętej, radosnej służby i uwielbienia Jego Imienia (Wj 8:1).
• Bożki świata zawsze kończą się smrodem i odrazą: to, co ubóstwiasz zamiast Boga — choćby obiecywało rozkosz i płodność jak bogini Heket — stanie się źródłem Twojej udręki i rozkładu (Wj 8:3, 14).
• Nigdy nie mów Bogu „jutro”: odkładanie pokuty i posłuszeństwa na kolejny dzień to zgoda na spędzenie kolejnej nocy w niewoli własnego grzechu (Wj 8:10).
• Zło ma nieprzekraczalną granicę: szatan może zwodzić i imitować, lecz nie potrafi stworzyć życia z prochu ziemi ani unieważnić Bożego wyroku (Wj 8:18).
• Palec Boży wystarczy do zwycięstwa: przed suwerenną potęgą Stwórcy kapitulują najpotężniejsze elity okultystyczne i polityczne tego świata (Wj 8:19).
• Jesteś bezpieczny w Bożej Ziemi Goszen: ochrona ludu przymierza wynika z suwerennej łaski i wykupienia (pedut), a nie ze ślepego losu czy ludzkich zasług (Wj 8:22–23).
• Odrzuć pokusę religijności w granicach Egiptu: wróg nie boi się Twoich modlitw, dopóki składasz je w ramach kompromisów ze świeckim systemem wartości (Wj 8:25).
• Prawdziwy uczeń idzie na pełny dystans: nie zgadzaj się na pokusę „nie oddalania się zbytnio” — pójście za Chrystusem wymaga wyjścia na pełne trzy dni drogi poza grzech (Wj 8:27–28).

POMYŚL — PYTANIA DO REFLEKSJI
1. Czy w jakiejś dziedzinie życia nie mówisz Bogu „jutro”, zwlekając z natychmiastowym porzuceniem grzechu lub wykonaniem Bożego polecenia?
2. Jakie „żaby” — ułudne bożki współczesnej kultury (sukces, pożądliwość, opinia ludzka) — próbują wedrzeć się do Twojej sypialni i zniszczyć pokój Twojego serca?
3. Czy doświadczyłeś sytuacji, w której Bóg w widoczny sposób osłonił Cię i Twoją rodzinę, czyniąc Wasz dom bezpieczną „Ziemią Goszen” pośród życiowej burzy?
4. Jak reagujesz na propozycje kompromisów ze światem w pracy lub szkole: czy bronisz radykalizmu wiary, czy próbujesz „składać ofiarę w tej ziemi”?
5. Dlaczego szatan tak bardzo lęka się Twojego pełnego poświęcenia („trzech dni drogi na pustynię”) i woli widzieć Cię jako letniego, połowicznego wierzącego?
6. Jak postępujesz, gdy w Twoim życiu przychodzi chwila ulgi i wytchnienia: czy Twoje serce mięknie w dziękczynieniu, czy też — wzorem faraona — wracasz do dawnych zaniedbań?
7. W jakich momentach Twojej codzienności widziałeś działanie „Palca Bożego”, który w ułamku sekundy rozwiązał sytuację po ludzku beznadziejną?
8. Komu w Twoim otoczeniu powinieneś dziś przypomnieć, że w Jezusie Chrystusie Bóg położył znak odkupienia chroniący przed wiecznym potępieniem?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Jaka była druga plaga, którą Bóg zapowiedział faraonowi w Wj 8:2?
Odpowiedź: Była to plaga żab, które miały dotknąć wszystkich granic Egiptu (Wj 8:2).
2. Do jakich miejsc miały wejść żaby według Bożego ostrzeżenia z Wj 8:3?
Odpowiedź: Do domu faraona, sypialni, na łoże, do domów sług i ludu, a także do pieców i dzież na ciasto (Wj 8:3).
3. Nad jakie wody Aaron miał wyciągnąć rękę ze swą laską, aby sprowadzić żaby (Wj 8:5)?
Odpowiedź: Nad rzeki, strugi (kanały) i nad jeziora (stawy) Egiptu (Wj 8:5).
4. Co uczynili egipscy czarownicy po pojawieniu się żab według Wj 8:7?
Odpowiedź: Uczynili to samo swoimi czarami i sprowadzili żaby na ziemię Egiptu (Wj 8:7).
5. O co poprosił faraon Mojżesza i Aarona podczas inwazji żab w Wj 8:8?
Odpowiedź: Poprosił, aby modlili się do PANA o oddalenie żab ode niego i jego ludu, obiecując wypuszczenie Izraela (Wj 8:8).
6. Jaki termin modlitwy wyznaczył faraon na pytanie Mojżesza w Wj 8:10?
Odpowiedź: Wyznaczył termin: „Jutro” (Wj 8:10).
7. Co stało się z żabami po modlitwie Mojżesza według Wj 8:13–14?
Odpowiedź: Wyginęły z domów, ze wsi i z pól, zbierano je na wielkie stosy, a ziemia zaczęła cuchnąć (Wj 8:13–14).
8. Jak zachował się faraon, gdy zauważył, że nadeszło wytchnienie od plagi żab (Wj 8:15)?
Odpowiedź: Zatwardził swoje serce i nie posłuchał Mojżesza i Aarona, jak PAN zapowiedział (Wj 8:15).
9. Co Aaron miał uderzyć laską, aby sprowadzić trzecią plagę według Wj 8:16?
Odpowiedź: Miał uderzyć pył (proch) ziemi (Wj 8:16).
10. W co zamienił się pył ziemi na całej ziemi egipskiej w Wj 8:17?
Odpowiedź: Zamienił się we wszy (komary/robactwo) na ludziach i na bydle (Wj 8:17).
11. Jaki był rezultat próby powtórzenia trzeciej plagi przez czarowników w Wj 8:18?
Odpowiedź: Próbowali sprowadzić wszy swymi czarami, ale nie mogli (Wj 8:18).
12. Jakie historyczne wyznanie złożyli czarownicy przed faraonem w Wj 8:19?
Odpowiedź: Powiedzieli do faraona: „To jest palec Boży” (Wj 8:19).
13. Gdzie Mojżesz miał stanąć przed faraonem rano przed czwartą plagą według Wj 8:20?
Odpowiedź: Miał stanąć przed nim nad brzegiem rzeki, gdy król wychodził rano nad wodę (Wj 8:20).
14. Na czym polegała czwarta plaga zapowiedziana w Wj 8:21?
Odpowiedź: Na zesłaniu rozmaitych much (chmar gzów i gryzących owadów) na faraona, jego sługi, lud i domy (Wj 8:21).
15. Jaką krainę Bóg oddzielił i zachował w nienaruszonym pokoju w Wj 8:22?
Odpowiedź: Oddzielił ziemię Goszen, w której mieszkał Jego lud (Wj 8:22).
16. Co Bóg postawił między swoim ludem a ludem faraona według Wj 8:23?
Odpowiedź: Postawił znak odkupienia (hebr. pedut — rozdzielenie/wykupienie) (Wj 8:23).
17. Jaki był pierwszy kompromis zaproponowany przez faraona w Wj 8:25?
Odpowiedź: Powiedział: „Idźcie, złóżcie na tej ziemi ofiarę waszemu Bogu” (Wj 8:25).
18. Dlaczego Mojżesz odmówił składania ofiar Bogu w granicach Egiptu (Wj 8:26)?
Odpowiedź: Ponieważ ofiara z ubóstwianych przez Egipcjan zwierząt byłaby dla nich obrzydliwością i ukamienowaliby Izraelitów (Wj 8:26).
19. Na jaką odległość Izraelici musieli wyruszyć na pustynię według Wj 8:27?
Odpowiedź: Na odległość trzech dni drogi na pustynię (Wj 8:27).
20. Jaki drugi kompromis zaproponował faraon i co uczynił po ustąpieniu much (Wj 8:28, 32)?
Odpowiedź: Pozwolił odejść pod warunkiem, że nie oddalą się zbytnio, lecz po ustąpieniu plagi ponownie zatwardził swe serce (Wj 8:28, 32).

TWOJA DECYZJA
Ósmy rozdział Księgi Wyjścia stawia przed każdym z nas lustro prawdy. Widzimy w nim bezsilność pogańskich bożków, które obracają się w cuchnące stosy, bezradność demonicznego okultyzmu zmuszonego do wyznania potęgi Palca Bożego oraz tragizm tyrana, który woli negocjować połowiczne kompromisy i mówić Bogu „jutro”, niż rzucić się w ramiona Stwórcy.
Z drugiej strony widzimy ziemię Goszen — oazę pokoju i suwerennego wykupienia, gdzie Boże dzieci odpoczywają pod bezpiecznymi skrzydłami Najwyższego. Dziś stajesz przed tym samym wyborem: czy chcesz pozostać w „Egipcie”, godząc się na religijność pełną kompromisów ze świeckim światem, czy też wyruszasz z Chrystusem na pełne trzy dni drogi poza obóz grzechu?
MOJA DECYZJA: Panie Boże Wszechmogący, wyznaję, że Ty jesteś jedynym, prawdziwym Królem mojego serca. Wyrzekam się wszelkiej zwłoki i odrzucam kuszące kłamstwo słowa „jutro”. Odrzucam wszelkie kompromisy z grzechem i duchem tego świata. Dziękuję Ci za Jezusa Chrystusa, który swoim Palcem skruszył moc szatana i uczynił moje życie bezpieczną Ziemią Goszen. Wybieram pełne posłuszeństwo Twojemu Słowu i wyruszam za moim Zbawicielem na pełny dystans wiary, miłości i świętości.

MODLITWA NA 8 LISTOPADA
Wszechmogący, Święty i Suwerenny Boże, Panie nieba, ziemi i wszystkich stworzeń!
W ten niedzielny poranek, ósmego listopada, stajemy przed Twoim majestatem z głębokim pokłonem i pieśnią dziękczynienia w naszych sercach. Twoje Słowo objawione w ósmym rozdziale Księgi Wyjścia napełnia nas świętym drżeniem i niezachwianą nadzieją. Ty jesteś Bogiem, którego jeden Palec kruszy pychę najpotężniejszych ziemskich mocarstw i zmusza do kapitulacji moce ciemności!
Przebacz nam, Panie, każdą chwilę, gdy w naszym życiu pojawiała się pokusa zwlekania — gdy na Twoje święte wołanie odpowiadaliśmy po ludzku: „jutro”. Przebacz nam momenty, w których szukaliśmy kompromisu ze światem, próbując służyć Tobie, a jednocześnie trzymać się blisko granic dawnych grzechów i wygody. Oczyść nasze serca ze wszelkiej obłudy faraona i wyrwij nas z letniości.
Dziękujemy Ci z całego serca za Ziemię Goszen Nowego Przymierza — za naszego Pana i Zbawiciela, Jezusa Chrystusa! Dziękujemy, że w Jego przelanej Krwi położyłeś na nas wieczny znak odkupienia (pedut), który chroni nas przed potępieniem i sądem tego świata. Dziękujemy, że w Chrystusie wyprowadziłeś nas w trzy dni drogi — ze śmierci do zmartwychwstania i nowego życia. Spraw, niech nasze domy będą oazami Twojego Ducha, prawdy i pokoju. Naucz nas żyć bez kompromisów, odważnie zwiastując Twoją chwałę. W Imieniu Jezusa Chrystusa, naszego Zwycięskiego Króla. Amen!

ZADANIE NA DZIŚ
☐ Przeczytaj osobiście cały ósmy rozdział Księgi Wyjścia (Wj 8:1–32) w przekładzie UBG.
☐ Zrób duchowy rachunek sumienia: czy w Twoim życiu jest dziedzina, w której mówisz Bogu „jutro” zamiast poddać się Mu dziś?
☐ Zbadaj swoje serce pod kątem kompromisów ze światem w sferze zawodowej, moralnej lub rodzinnej („ofiara w tej ziemi”).
☐ Otwórz Ewangelię Łukasza 11:14–23 i rozważ w modlitwie autorytet Jezusa Chrystusa wypędzającego złe duchy „Palcem Bożym”.
☐ Pomódl się o uświęcenie Twojego ogniska domowego, prosząc Boga, by uczynił Twój dom nienaruszalną „Ziemią Goszen”.
☐ Zapisz w notatniku lub w polu poniżej jedno konkretne postanowienie radykalnego oddzielenia od grzechu („trzy dni drogi na pustynię”).
☐ Udostępnij dzisiejszą lekcję lub werset pamięciowy jednej osobie, która zmaga się ze zwątpieniem lub walczy z duchowym zniechęceniem.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 9 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 40 — „POMÓR BYDŁA, WRZODY I GRAD: SĄD NAD DUMĄ I GOSPODARKĄ EGIPTU”
Czytanie: Wj 9:1–35. Kolejna seria trzech plag uderza z druzgocącą siłą! Ginie bydło na polach Egiptu, piecowy popiół rzucony w niebo staje się wrzodami na ludziach i zwierzętach, a ogień zstępuje z nieba w bezprecedensowym gradobiciu. Bóg wypowiada do faraona słowa, które wstrząsają historią: „Właśnie po to cię zachowałem, aby okazać na tobie moją moc i aby moje imię było głoszone po całej ziemi”. Wróć jutro, by zobaczyć suwerenność Boga panującego nad żywiołami nieba i ziemi!`;

// Zapisujemy canonical text lekcji
fs.writeFileSync(path.join(ROOT, 'scripts/content/kc-day39-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano: scripts/content/kc-day39-lesson.txt');

// 4. GENEROWANIE DOKUMENTU MICROSOFT WORD (.DOCX)
console.log('📄 Generowanie sformatowanego pliku Microsoft Word (.docx)...');
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

const docxPath = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, docxBuf);
console.log(`✅ Utworzono sformatowany DOCX na Pulpicie: ${docxPath} (${docxBuf.length} bajtów)`);

// 5. BUDUJEMY 5-WERSYJNY PAKIET ROZWAŻAŃ WG STANDARDU ANTIGRAVITY
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 39 (8 listopada 2026): Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen (Wj 8:1–32)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Dziewiąty

Czy zauważyłeś kiedyś, jak często człowiek w obliczu życiowego kryzysu woła do Boga o ratunek, a gdy tylko mija ból i wraca spokój, natychmiast zapomina o swoich obietnicach i powraca do dawnych nawyków?

Zatrzymaj się w ten niedzielny poranek, ósmego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w kochające oblicze Twojego Ojca w niebie. Pozwól, by w ciszy Twojego serca wybrzmiało to osobiste pytanie: Tato, czy moje serce jest naprawdę szczere i oddane Tobie w całości, czy też szukam Ciebie jedynie jako koła ratunkowego w trudnych chwilach, a potem próbuję negocjować z Tobą kompromisy?

W ósmym rozdziale Księgi Wyjścia jesteśmy świadkami eskalacji duchowej bitwy o wolność Bożego ludu. Po sądzie nad Nilem na Egipt spadają trzy kolejne plagi: żaby, wszy oraz jadowite muchy. Każda z nich uderza w fundamenty pogańskiego kultu. Żaby, czczone jako bóstwo płodności, wdzierają się do sypialni, łóżek i pieców chlebowych, zamieniając pogańską dumę w odrazę. Następnie proch ziemi uderzony laską Aarona zamienia się we wszy. I wtedy dzieje się coś przełomowego: egipscy czarownicy, którzy dotąd naśladowali znaki swymi tajemnymi sztukami, ponoszą całkowitą klęskę. Stają przed faraonem i z przerażeniem wyznają: To jest palec Boży!

Zło ma swoje granice. Może kusić, zwodzić i imitować, ale nie ma mocy tworzyć życia z prochu ziemi ani powstrzymać Bożego wyroku. Lecz zamiast ukorzyć się przed Stwórcą, faraon brnie w zatwardziałość. Wtedy nadchodzi czwarta plaga — chmary niszczycielskich much. I tu Bóg wypowiada słowa, które są balsamem dla każdego wierzącego serca: Uczynię rozróżnienie dla ziemi Goszen, w której mieszka mój lud. W całym Egipcie panuje zniszczenie i groza, lecz w domach Bożych dzieci panuje nienaruszalny pokój i bezpieczeństwo!

Gdy faraon widzi bezradność swoich bóstw, zaczyna proponować kompromisy: Ofiarujcie waszemu Bogu w tej ziemi, a potem: Idźcie, tylko nie odchodźcie za daleko. Jakże dobrze znamy tę taktykę wroga! Zły duch nie boi się religijności, dopóki pozostajesz w granicach kompromisu ze światem. Lecz Mojżesz odpowiada zdecydowanie: musimy odejść na odległość trzech dni drogi na pustynię! Prawdziwe uwielbienie Boga wymaga całkowitego zerwania z niewolą grzechu.

W Jezusie Chrystusie ta prawda nabiera wiecznego blasku. Pan Jezus powiedział: Jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże. Krzyż Chrystusa jest naszą Ziemią Goszen. W Nim jesteś bezpieczny, odkupiony i chroniony przed potępieniem tego świata. Nie zgadzaj się dziś na żadne kompromisy ze starym życiem. Służ Panu całym sercem w wolności, którą wywalczył dla Ciebie Zbawiciel. Błogosławionej, pełnej pokoju i zwycięstwa niedzieli!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 39 (8 listopada 2026 r.)
📖 Księga Wyjścia 8:1–32: Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen

Czy wiesz, co dzieje się, gdy człowiek próbuje targować się z Bogiem i składać Mu ofiary na własnych, kompromisowych warunkach?

W 39. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 8. rozdział Księgi Wyjścia (Wj 8:1–32: https://polskieradio.cc/mojabiblia?ref=Wj8:1-32). Duchowe starcie z panteonem Egiptu wkracza w decydującą fazę.

Kluczowe filary dzisiejszego studium:

1. Druga plaga — inwazja żab (Wj 8:1–15):
Żaby były w Egipcie ucieleśnieniem bogini Heket, patronki płodności i narodzin. Bóg sprawia, że bożek płodności wdziera się do sypialni, pieców i misek, stając się źródłem wstrętu i rozpaczy. Czarownicy powiększają plagę, lecz nie potrafią jej usunąć. Faraon prosi o modlitwę, lecz na pytanie o termin odpowiada: „Jutro” — woląc spędzić jeszcze jedną noc pośród żab, byle odsunąć moment ukorzenia się przed Bogiem.

2. Trzecia plaga — proch we wszy i kapitulacja magów (Wj 8:16–19):
Uderzenie w proch ziemi uderza w bóstwo Geba. Czarownicy po raz pierwszy ponoszą sromotną klęskę i wyznają przed władcą: „To jest palec Boży!” (hebr. ecba Elohim). Szatan nie potrafi stworzyć życia z prochu ani unieważnić Bożego sądu.

3. Czwarta plaga — rojowiska much i rozróżnienie Goszen (Wj 8:20–24):
Bóg wprowadza epokowe rozróżnienie (hebr. pedut — wykupienie, rozdzielenie): ziemia Goszen, w której mieszka lud przymierza, pozostaje całkowicie nienaruszona! Podczas gdy Egipt obraca się w ruinę, domy Izraelitów cieszą się Bożą ochroną.

4. Dwa kompromisy tyrana (Wj 8:25–32):
Faraon proponuje półśrodki:
• Kompromis 1: „Złóżcie ofiarę w tej ziemi” (bądźcie wierzący, ale w ramach świeckiego systemu).
• Kompromis 2: „Tylko nie odchodźcie za daleko” (nie bądźcie radykalni w wierze).
Mojżesz odrzuca oba: służba Bogu wymaga wyjścia na 3 dni drogi i całkowitego oddzielenia od grzechu.

5. Chrystus w Centrum — Palec Boży i Nasze Goszen:
Jezus Chrystus nawiązał do Wj 8:19, mówiąc: „A jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże” (Łk 11:20). W Chrystusie mamy naszą duchową Ziemię Goszen: wieczne bezpieczeństwo, wolność od potępienia i moc do życia bez kompromisów ze złem.

Kompletna lekcja biblijna z 40 punktami egzegezy, studium porównawczym, 20 pytaniami quizu i autozapisem decyzji:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-39

Błogosławionej niedzieli w cieniu zwycięskiego Zbawiciela! 🕊️

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 39 (Wj 8:19): „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży!”. Moce ciemności są bezsilne wobec Króla królów, a w Chrystusie jesteś bezpieczny jak lud Boży w ziemi Goszen. Odrzuć wszelkie kompromisy ze światem i odpocznij w Bożej wierności. Błogosławionej nocy! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Ciepłe światło portretowe. Na ekranie głównym grafika 16:9: nilowe rozlewiska, żaby, załamani czarownicy upuszczający laski i kraina Goszen opromieniona Bożym światłem pokoju. Tytuł: DZIEŃ 39 — TO JEST PALEC BOŻY.

[INTRO: KAPITULACJA OKULTYZMU EGIPSKIEGO]
Noemi: Dzień dobry! Witamy państwa w trzydziestym dziewiątym dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Wkraczamy w ósmy rozdział Księgi Wyjścia — rozdział, w którym załamują się egipscy czarownicy!
Sara: Witamy bardzo serdecznie! Spójrzmy na ten niezwykły przełom: po sądzie nad Nilem Bóg uderza plagą żab i wszy. I właśnie przy trzeciej pladze magowie faraona, którzy dotąd chełpili się swymi tajemnymi sztukami, ponoszą całkowitą klęskę!
Noemi: Rzucają swoje zaklęcia, próbują powołać życie z prochu ziemi, ale nie mogą! Wtedy stają przed tronem i z przerażeniem wyznają: „To jest palec Boży!”. Szatan potrafi imitować, ale nie potrafi stworzyć ani jednej żywej komórki!

[ANALIZA PROBLEMOWA: ZIEMIA GOSZEN I ZNAK ROZDZIELENIA]
Sara: A potem następuje czwarta plaga — zjadliwe roje much i gzów niszczące cały Egipt. I tutaj po raz pierwszy Bóg ogłasza coś niezwykłego: oddzielenie ziemi Goszen!
Noemi: Dokładnie tak! Bóg używa hebrajskiego słowa pedut — wykupienie, rozgraniczenie przymierza. W całym Egipcie panuje dewastacja i rozpacz, a w krainie Goszen — cisza, pokój i Boża ochrona!
Sara: Widząc to, faraon próbuje targować się z Mojżeszem. Rzuca dwa kompromisy: „złóżcie ofiarę w tej ziemi” oraz „tylko nie odchodźcie za daleko”. Jakże często wróg próbuje zaoferować wierzącym taką połowiczną, ugodową religijność!
Noemi: Ale Mojżesz odpowiada zdecydowanie: nie ma mowy! Musimy odejść na trzy dni drogi na pustynię! Prawdziwe uwielbienie Boga wymaga radykalnego zerwania z niewolą grzechu.

[CHRYSTUS W CENTRUM: PALEC BOŻY I NASZE SCHRONIENIE]
Sara: W Nowym Testamencie Pan Jezus Chrystus powraca do tego obrazu, mówiąc: „Jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże!”.
Noemi: Krzyż Chrystusa jest naszą Ziemią Goszen! W Jego ranach jesteśmy wykupieni, wolni i bezpieczni przed potępieniem tego świata. Nie zgadzajmy się na żadne kompromisy ze starym życiem!

[MODLITWA KOŃCOWA]
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci za Twoją suwerenną moc, przed którą milkną moce ciemności. Dziękujemy za Jezusa Chrystusa, który palcem Bożym uwolnił nas z niewoli grzechu i uczynił nas mieszkańcami Ziemi Goszen. Zachowaj nas przed kompromisami tego świata i napełnij nas Twoim świętym pokojem. Amen!”

[OUTRO]
Noemi: Wszystkie materiały, quiz i komentarze znajdziecie bezpłatnie na polskieradio.cc.
Sara: Do zobaczenia jutro w dziewiątym rozdziale! Czytaj, wierz, działaj. Dla Jezusa!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: KAPITULACJA OKULTYZMU EGIPSKIEGO I TEOLOGIA ODDZIELENIA GOSZEN: ANALIZA EGZEGETYCZNA WJ 8:1–32

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 8 listopada 2026 r.

W ramach ogólnopolskiego programu studiów biblijnych „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje egzegetyczne studium ósmego rozdziału Księgi Wyjścia. Rozdział ten dokumentuje drugą fazę konfrontacji teologicznej pomiędzy Bogiem JAHWE a panteonem imperium egipskiego, obejmując plagę żab (Wj 8:1–15), wszy (Wj 8:16–19) oraz gzów i much (Wj 8:20–32).

1. DESTRUKCJA KULTU HEKET I PSYCHOLOGIA ZWŁOKI (WJ 8:1–15)
Plaga żab uderzała bezpośrednio w kult bogini Heket — bóstwa z głową żaby, czczonego jako uosobienie witalności i płodności nilowej. Masowe pojawienie się płazów w przestrzeniach domowych i kuchennych obróciło symbol kultu w źródło sanitarnej i rytualnej zgnilizny. Istotnym rysem psychologicznym jest odpowiedź faraona na pytanie Mojżesza o termin modlitwy wstawienniczej: monarcha wybiera „jutro” (w. 10), co w analizie pastoralnej stanowi klasyczny przykład prokrastynacji duchowej grzesznika unikającego natychmiastowej kapitulacji przed Bogiem.

2. KAPITULACJA MAGII I FORMUŁA „PALEC BOŻY” (WJ 8:16–19)
Trzecia plaga (kinnim — wszy lub komary z prochu ziemi) wyznacza granicę możliwości egipskiej kasty hartummim (magów i kapłanów wróżbitów). Podczas gdy magowie zdołali zreplikować zamianę laski w węża, uderzenie w Nil i plagę żab, nie potrafili powołać życia z prochu ziemi (Wj 8:18). Ich publiczne wyznanie: „To jest palec Boży (ecba Elohim)” (w. 19) stanowi prawno-religijne uznanie transcendencji Stwórcy nad demonicznymi manipulacjami pogaństwa.

3. KRAINA GOSZEN JAKO PRZESTRZEŃ „PEDUT” (WJ 8:20–24)
Przy czwartej pladze Bóg po raz pierwszy wprowadza zasadę widzialnego oddzielenia: kraina Goszen zostaje całkowicie wyłączona spod działania rojowisk much. Kluczowy termin hebrajski pedut (w. 23) oznacza wykupienie, rozgraniczenie o charakterze zbawczym. Lud przymierza doświadcza nietykalności nie z racji własnych zasług etycznych, lecz na mocy suwerennego przymierza łaski.

4. DIALEKTYKA KOMPROMISÓW: POKUSA POŁOWICZNEJ RELIGIJNOŚCI (WJ 8:25–32)
W obliczu dewastacji kraju faraon formułuje dwie propozycje kompromisowe:
a) „Złóżcie ofiarę w tej ziemi” (w. 25) — próba zatrzymania kultu w granicach systemu egipskiego;
b) „Tylko nie odchodźcie za daleko” (w. 28) — próba ograniczenia radykalizmu wiary.
Mojżesz kategorycznie odrzuca obie opcje, wskazując na konieczność triduum viatorum (trzech dni drogi na pustynię) oraz na niemożliwość składania Bogu „obrzydliwości Egipcjan” (ubóstwianych zwierząt).

5. CHRYSTOCENTRYCZNA REALIZACJA MOTYWU
Formuła „palca Bożego” powraca w nauczaniu Jezusa Chrystusa w Łk 11:20 jako znak inauguracji Królestwa Bożego poprzez egzorcyzmowanie mocy szatańskich. Chrystus jest ostateczną Ziemią Goszen dla wierzących — w Nim lud Boży otrzymuje uwolnienie od gniewu i wieczne bezpieczeństwo przymierza.

📌 PODSUMOWANIE REDAKCYJNE CCN
Ósmy rozdział Księgi Wyjścia uczy, że kompromis ze światem uniemożliwia prawdziwy kult Boga. Wolność przymierza wymaga całkowitego wyjścia z Egiptu i zaufania Temu, którego Palec kruszy pychę najpotężniejszych ziemskich imperiów.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl
`;

fs.writeFileSync(path.join(ROOT, 'scripts/content/pakiet-day39-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano: scripts/content/pakiet-day39-5wersji.md');

// 6. SYNCHRONIZACJA Z ROZWAZANIA_BAZA.JSON (POZYCJA 0)
console.log('🔄 Aktualizacja rozwazania_baza.json...');
const bazaJsonPath = path.join(ROOT, 'rozwazania_baza.json');
let bazaData = JSON.parse(fs.readFileSync(bazaJsonPath, 'utf8'));

// Wyciągamy poszczególne wersje
const contentApp = pakiet5Wersji.split('====================================================================\nWERSJA 1: ROZWAŻANIE PORANNE')[1].split('====================================================================\nWERSJA 2: WERSJA WWW')[0].trim().replace(/^\(TTS[^\n]*\)\n+/i, '');
const contentWeb = pakiet5Wersji.split('====================================================================\nWERSJA 2: WERSJA WWW')[1].split('====================================================================\nWERSJA 3: WERSJA WIECZORNA')[0].trim().replace(/^\(LUMINA[^\n]*\)\n+/i, '');
const contentSms = pakiet5Wersji.split('====================================================================\nWERSJA 3: WERSJA WIECZORNA')[1].split('====================================================================\nWERSJA 4: SCENARIUSZ WIDEO')[0].trim().replace(/^\(SMS\)\n+/i, '');
const tvScript = pakiet5Wersji.split('====================================================================\nWERSJA 4: SCENARIUSZ WIDEO')[1].split('====================================================================\nWERSJA 5: PORTAL INFORMACYJNY')[0].trim().replace(/^\(Christian Culture TV[^\n]*\)\n+/i, '');
const ccnArticle = pakiet5Wersji.split('====================================================================\nWERSJA 5: PORTAL INFORMACYJNY')[1].trim();

const itemDay39 = {
  day: DAY_NUM,
  date: DATE_STR,
  dateFormatted: DATE_FORMATTED,
  title: `☀️ Z Biblią za Pan Brat — Dzień ${DAY_NUM}: Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen`,
  book: BOOK,
  reading: READING,
  memoryVerse: MEMORY_VERSE,
  theme: THEME,
  fullText: contentApp,
  contentApp: contentApp,
  contentWeb: contentWeb,
  contentSms: contentSms,
  tvScript: tvScript,
  ccnArticle: ccnArticle,
  imageUrl: '/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg'
};

// Jeśli pozycja 0 ma już day 39, aktualizujemy ją; jeśli nie, dodajemy na początek
if (bazaData.length > 0 && bazaData[0].day === 39) {
  bazaData[0] = itemDay39;
} else {
  bazaData.unshift(itemDay39);
}
fs.writeFileSync(bazaJsonPath, JSON.stringify(bazaData, null, 2), 'utf8');
console.log('✅ Zaktualizowano pozycję 0 w rozwazania_baza.json z pełnymi polami (w tym tvScript)!');

// 7. BUDUJEMY PERFEKCYJNY PLIK HTML LEKCJI (akademia/kurscodzienny/dzien-39.html)
console.log('🌐 Budowanie kompletnego HTML lekcji Dnia 39...');

// QUIZ DATA — 20 PYTAŃ Z WJ 8:1–32
const QUIZ_DATA = [
  {
    q: "Jaka była druga plaga, którą Bóg zapowiedział faraonowi w Wj 8:2?",
    a: ["Plaga szarańczy", "Plaga żab", "Plaga ciemności"],
    c: 1
  },
  {
    q: "Do jakich miejsc w Egipcie miały wedrzeć się żaby według Wj 8:3?",
    a: ["Do sypialni, łóżek, pieców i dzież na ciasto", "Wyłącznie do kanałów i bagien", "Jedynie do stajni rydwanów"],
    c: 0
  },
  {
    q: "Nad jakie wody Aaron miał wyciągnąć rękę ze swą laską w Wj 8:5?",
    a: ["Nad Morze Czerwone", "Nad rzeki, strugi i jeziora Egiptu", "Nad studnie ziemi Goszen"],
    c: 1
  },
  {
    q: "Co uczynili egipscy czarownicy po pojawieniu się żab (Wj 8:7)?",
    a: ["Oczyścili pałac i usunęli plagę", "Uczynili to samo swoimi czarami i sprowadzili żaby", "Uciekli w popłochu na pustynię"],
    c: 1
  },
  {
    q: "O co poprosił faraon Mojżesza i Aarona podczas inwazji żab w Wj 8:8?",
    a: ["O złożenie ofiary bogini Heket", "Aby modlili się do PANA o oddalenie żab", "O darowanie podatków ludowi"],
    c: 1
  },
  {
    q: "Jaki termin modlitwy wyznaczył faraon na pytanie Mojżesza w Wj 8:10?",
    a: ["Natychmiast", "Jutro", "Za siedem dni"],
    c: 1
  },
  {
    q: "Co stało się z żabami po modlitwie Mojżesza (Wj 8:13–14)?",
    a: ["Wróciły żywe do Nilu", "Wyginęły, zbierano je na stosy i ziemia cuchnęła", "Rozpuściły się w piasku"],
    c: 1
  },
  {
    q: "Jak postąpił faraon, gdy zauważył, że nadeszło wytchnienie od żab (Wj 8:15)?",
    a: ["Wypuścił cały lud Izraela", "Zatwardził swoje serce i nie posłuchał", "Nawrócił się do Boga Izraela"],
    c: 1
  },
  {
    q: "Co Aaron miał uderzyć laską, aby sprowadzić trzecią plagę (Wj 8:16)?",
    a: ["Skałę na pustyni", "Pył ziemi", "Wody Nilu"],
    c: 1
  },
  {
    q: "W co zamienił się pył ziemi na całej ziemi Egiptu (Wj 8:17)?",
    a: ["We wszy i moskity na ludziach i bydle", "W jadowite węże", "W płonący popiół"],
    c: 0
  },
  {
    q: "Jaki był rezultat próby powtórzenia trzeciej plagi przez czarowników (Wj 8:18)?",
    a: ["Zgładzili wszystkie wszy", "Czynili to samo swymi czarami, ale nie mogli", "Wywołali trzęsienie ziemi"],
    c: 1
  },
  {
    q: "Jakie historyczne wyznanie złożyli czarownicy przed faraonem w Wj 8:19?",
    a: ["„To jest przypadek natury”", "„To jest palec Boży”", "„To potęga bóstwa Geba”"],
    c: 1
  },
  {
    q: "Gdzie Mojżesz miał stanąć przed faraonem rano przed czwartą plagą (Wj 8:20)?",
    a: ["W świątyni boga Ra", "Nad brzegiem wody, gdy król wychodził nad rzekę", "W sali tronowej pałacu"],
    c: 1
  },
  {
    q: "Na czym polegała czwarta plaga zesłana na Egipt w Wj 8:21?",
    a: ["Na pomorze bydła", "Na inwazji rozmaitych uciążliwych much i gzów", "Na gradzie z ogniem"],
    c: 1
  },
  {
    q: "Jaką krainę Bóg oddzielił i zachował w nienaruszonym pokoju w Wj 8:22?",
    a: ["Ziemię Madian", "Ziemię Goszen, w której mieszkał Jego lud", "Krainę Moabu"],
    c: 1
  },
  {
    q: "Co Bóg postawił między swoim ludem a ludem faraona według Wj 8:23?",
    a: ["Mur z kamienia", "Znak odkupienia (hebr. pedut — rozdzielenie)", "Gęstą mgłę"],
    c: 1
  },
  {
    q: "Jaki był pierwszy kompromis zaproponowany przez faraona w Wj 8:25?",
    a: ["„Idźcie, złóżcie na tej ziemi ofiarę waszemu Bogu”", "„Zostańcie w Egipcie jako wolni rzemieślnicy”", "„Módlcie się tylko w nocy”"],
    c: 0
  },
  {
    q: "Dlaczego Mojżesz odmówił składania ofiar Bogu w granicach Egiptu (Wj 8:26)?",
    a: ["Z powodu braku drewna na ołtarz", "Gdyż ofiara ze zwierząt była obrzydliwością dla Egipcjan i ukamienowaliby ich", "Czekał na posiłki z Madianu"],
    c: 1
  },
  {
    q: "Na jaką odległość Izraelici musieli wyruszyć na pustynię według Wj 8:27?",
    a: ["Na odległość jednego dnia drogi", "Na odległość trzech dni drogi na pustynię", "Na siedem dni drogi"],
    c: 1
  },
  {
    q: "Jaki drugi kompromis zaproponował faraon w Wj 8:28?",
    a: ["Wypuszczę was, tylko nie oddalajcie się zbytnio", "Zostawcie dzieci w zastaw", "Oddajcie całe wasze bydło"],
    c: 0
  }
];

// Wczytujemy szkielet Dnia 1 / Dnia 38 do precyzyjnej przebudowy
const baseTemplate = fs.readFileSync(path.join(ROOT, 'akademia/kurscodzienny/dzien-38.html'), 'utf8');

// Budujemy sekcje HTML dla Dnia 39
const htmlContent = `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>
  <meta name="description" content="Dzień 39: Księga Wyjścia 8:1–32. Plagi żab, wszy i much. Bezsilność czarowników wyznających 'To jest palec Boży' oraz ochrona ziemi Goszen. Studium biblijne i quiz wiedzy." />
  <link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-39" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-39" />
  <meta property="og:title" content="Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32) — Z Biblią za Pan Brat" />
  <meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 39. Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen — Wj 8:1–32." />
  <meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108" />

  <!-- Fonts: Cinzel, Playfair Display, Plus Jakarta Sans, Lora, Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- Shared Lumina Courses CSS -->
  <link rel="stylesheet" href="/css/lumina-courses.css?v=20261008_desktop_icons_v3" />

  <!-- Tailwind CDN fallback -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            'brand-gold': '#C4A35A',
            'brand-gold-light': '#E2CC9A',
            'brand-gold-dark': '#8E6E32',
            'brand-dark': '#060A10',
            'brand-navy': '#0A121E',
            'brand-panel': '#0F1A2A',
            'brand-border': 'rgba(196,163,90,0.22)',
            'brand-line': 'rgba(255,255,255,0.08)'
          },
          fontFamily: {
            serif: ['Lora', 'Georgia', 'serif'],
            display: ['Cinzel', 'Playfair Display', 'serif'],
            sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  </script>

  <style>
    body { background: #07090E; color: #f1f5f9; }
    .ak-header { background: rgba(7,9,14,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(196,163,90,0.18); position: sticky; top: 0; z-index: 50; }
    .ak-header #reader-font-label,
    .ak-header #tts-btn-text,
    .ak-header .theme-toggle-label,
    .ak-header #ccTopSubLink .sr-only,
    .ak-header #ccTopSubLink span:not(:first-child),
    .ak-header a[href*="patronite"] .sr-only,
    .ak-header a[href*="patronite"] span:not(:first-child),
    .ak-header #cc-auth-nav-container span { display: none !important; }
    @media (min-width: 640px) {
      .ak-header #reader-font-label,
      .ak-header #tts-btn-text,
      .ak-header .theme-toggle-label,
      .ak-header #ccTopSubLink span:not(.sr-only),
      .ak-header a[href*="patronite"] span:not(.sr-only),
      .ak-header #cc-auth-nav-container span { display: inline !important; }
    }
    .kc-card {
      background: #0D1522;
      border: 1px solid rgba(196,163,90,0.22);
      border-radius: 1.25rem;
      padding: 1.5rem;
      position: relative;
    }
    @media (min-width: 640px) {
      .kc-card { padding: 2rem; }
    }
    .kc-prose-reading {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.0625rem;
      line-height: 1.85;
      color: #e2e8f0;
    }
    .kc-prose-reading p { margin-bottom: 1rem; }
    .verse-num {
      color: #C4A35A;
      font-weight: 700;
      font-size: 0.85em;
      margin-right: 0.35rem;
    }
    .strong-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      background: rgba(196,163,90,0.12);
      border: 1px solid rgba(196,163,90,0.3);
      color: #E2CC9A;
      margin: 0.2rem;
    }
    .strong-chip .strong-id { color: #f59e0b; font-weight: 700; }
    .strong-chip .strong-orig { font-style: italic; }
  </style>
</head>
<body class="font-sans antialiased text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">

  <!-- TOP HEADER (wzór Dnia 1) -->
  <header class="ak-header">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <a href="/akademia" class="flex items-center gap-2 group min-h-[44px]">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-base shadow-md group-hover:scale-105 transition">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="leading-tight">
            <span class="text-xs uppercase tracking-widest text-amber-400 font-semibold block">LUMINA Academy</span>
            <span class="text-sm font-bold text-white group-hover:text-amber-300 transition">Z Biblią za Pan Brat</span>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-2">
        <button id="btn-reader-font" onclick="toggleReaderFont()" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]" title="Zmień krój czytania">
          <i class="fa-solid fa-font"></i>
          <span id="reader-font-label">Krój</span>
        </button>

        <div class="flex items-center rounded-lg bg-white/5 p-0.5 min-h-[44px]">
          <button onclick="adjustFontSize(-1)" class="w-8 h-8 flex items-center justify-center text-xs text-zinc-400 hover:text-white transition" title="Mniejsza czcionka">A−</button>
          <button onclick="adjustFontSize(1)" class="w-8 h-8 flex items-center justify-center text-xs text-zinc-400 hover:text-white transition" title="Większa czcionka">A+</button>
        </div>

        <button id="btn-audio-tts" onclick="toggleAudioLesson()" class="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition flex items-center gap-1.5 min-h-[44px]" title="Posłuchaj lektora">
          <i class="fa-solid fa-volume-high"></i>
          <span id="tts-btn-text">Lektor</span>
        </button>

        <button id="btn-theme-toggle" onclick="toggleCourseTheme()" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]" title="Zmień motyw">
          <i class="fa-solid fa-moon"></i>
          <span class="theme-toggle-label">Motyw</span>
        </button>

        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs transition shadow flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-heart text-[10px]"></i>
          <span>Wspieraj</span>
        </a>

        <div id="cc-auth-nav-container" class="flex items-center min-h-[44px]"></div>
      </div>
    </div>
  </header>

  <!-- NAVBAR STRONY -->
  <nav class="border-b border-brand-line bg-brand-navy/60 text-xs">
    <div class="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-zinc-400">
      <div class="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1">
        <a href="/akademia" class="hover:text-amber-400">Akademia</a>
        <span>›</span>
        <a href="/akademia/kurscodzienny" class="hover:text-amber-400">Kurs Codzienny</a>
        <span>›</span>
        <span class="text-zinc-500">Księga Wyjścia</span>
        <span>›</span>
        <span class="text-amber-400 font-semibold">Dzień 39</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        <span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-38" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 38</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 40 (Jutro) →</span>
        </span>
      </div>
    </div>
  </nav>

  <!-- HERO SECTION -->
  <main class="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <i class="fa-solid fa-calendar-day"></i>
          <span>Dzień 39 z 2009</span>
          <span class="text-zinc-600">•</span>
          <span>Księga Wyjścia</span>
        </span>
        <span class="text-xs text-zinc-400 font-mono">8 LISTOPADA 2026 • NIEDZIELA</span>
      </div>

      <h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
        PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN
      </h1>

      <p class="text-lg sm:text-xl text-zinc-300 font-serif italic">
        Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza (Wj 8:1–32)
      </p>

      <div class="flex items-center gap-3 pt-2">
        <button id="kcJumpShareBtn" onclick="document.getElementById('ccDailyShare').scrollIntoView({behavior: 'smooth'})" class="px-4 py-2 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-zinc-950 text-xs font-bold transition flex items-center gap-2 shadow min-h-[44px]">
          <i class="fa-solid fa-arrow-down"></i>
          <span>Podziel się tą lekcją ↓</span>
        </button>
      </div>

      <!-- GRAFIKA LEKCJI 16:9 -->
      <div class="relative rounded-2xl overflow-hidden border border-brand-border/40 shadow-2xl bg-brand-navy">
        <img
          src="/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108"
          alt="Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32)"
          class="w-full aspect-video object-cover"
          loading="eager"
        />
        <div class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-xs text-zinc-300 flex items-center justify-between">
          <span>Ilustracja biblijna: Egipscy czarownicy upuszczają laski i wyznają przed faraonem: „To jest palec Boży”, a ziemia Goszen jaśnieje w Bożym pokoju (Wj 8:19–23)</span>
          <span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 8:1–32</span>
        </div>
      </div>

      <!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-bookmark"></i>
            <span>Werset do zapamiętania</span>
          </div>
          <p class="font-serif italic text-base sm:text-lg text-white">
            „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.”
          </p>
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 8:19 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział. (Wj 8:19, UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
          class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
          title="Kopiuj werset do schowka"
        >
          <i class="fa-regular fa-copy"></i>
          <span>Kopiuj</span>
        </button>
      </div>

      <!-- MYŚL PRZEWODNIA -->
      <div class="p-4 rounded-xl bg-brand-panel/60 border border-brand-border/20 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
        <strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>
        Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.
      </div>
    </div>

    <!-- LESSON BODY CONTENT (Dzień 39, 08.11.2026) -->
    <section class="space-y-6">

      <!-- ZANIM OTWORZYSZ BIBLIĘ (wzór Dnia 1) -->
      <article class="kc-card">
        <div class="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <i class="fa-solid fa-compass"></i>
          <span>Zanim otworzysz Biblię</span>
        </div>
        <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Podróż przez 66 Ksiąg Pisma Świętego
        </h2>
        <div class="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-300 font-serif">
          <p>
            Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie <strong>66 ksiąg Biblii</strong> — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Pisma.
          </p>
          <p>
            Dziś jest <strong class="text-white">Dzień 39</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 8:1–32</strong>.
          </p>
          <p>
            Zanim przeczytasz rozważanie, otwórz Biblię i przeczytaj cały fragment. Komentarz ma prowadzić do Słowa, a nie je zastępować.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=8" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
            <i class="fa-solid fa-book-bible"></i>
            <span>Czytaj Wj 8:1–32</span>
          </a>
        </div>
      </article>

      <!-- SCRIPTURE SECTION (Wj 8:1–32) -->
      <section class="kc-card">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-brand-line">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
              <i class="fa-solid fa-book-bible"></i>
            </span>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-white font-display">TEKST PISMA ŚWIĘTEGO</h2>
              <p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 8:1–32</p>
            </div>
          </div>
          <a href="/mojabiblia?book=EXO&chapter=8" class="text-xs text-amber-400 hover:text-amber-300 font-serif flex items-center gap-1.5 transition">
            <span>Otwórz w MojaBiblia Interlinearnej</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>

        <div class="kc-prose-reading">
${versesHtml}
        </div>
      </section>

      <!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
      <section class="kc-card">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
          <i class="fa-solid fa-spell-check text-amber-400"></i>
          <span>Klucze Językowe & Kody Stronga (Wj 8)</span>
        </div>
        <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
          Poniższe terminy hebrajskie stanowią osnowę teologiczną 8. rozdziału Księgi Wyjścia:
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="strong-chip"><span class="strong-id">H6854</span> <span class="strong-orig">צְפַרְדֵּעַ (cfadea)</span> — żaba — uderzenie w kult bóstwa płodności Heket (Wj 8:2)</span>
          <span class="strong-chip"><span class="strong-id">H3654</span> <span class="strong-orig">כֵּן (ken / kinnim)</span> — wszy / komary z prochu ziemi (Wj 8:16–17)</span>
          <span class="strong-chip"><span class="strong-id">H676</span> <span class="strong-orig">אֶצְבַּע (ecba)</span> — palec: „To jest palec Boży” (Wj 8:19)</span>
          <span class="strong-chip"><span class="strong-id">H6157</span> <span class="strong-orig">עָרֹב (arow)</span> — roje much / gzów niszczących Egipt (Wj 8:21)</span>
          <span class="strong-chip"><span class="strong-id">H6304</span> <span class="strong-orig">פְּדוּת (pedut)</span> — wykupienie / oddzielenie ziemi Goszen (Wj 8:23)</span>
          <span class="strong-chip"><span class="strong-id">H3513</span> <span class="strong-orig">כָּבַד (kawad)</span> — zatwardzić serce / uczynić ciężkim (Wj 8:15, 32)</span>
        </div>
      </section>

      <!-- THEOLOGICAL EXEGESIS (4 CZĘŚCI, 40 PUNKTÓW) -->
      <section class="kc-card space-y-6">
        <div class="flex items-center gap-2 border-b border-brand-line pb-4">
          <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
            <i class="fa-solid fa-feather-pointed"></i>
          </span>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
            <p class="text-xs text-zinc-400">Cztery części studium Wj 8:1–32 (40 punktów analitycznych)</p>
          </div>
        </div>

        <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">

          <!-- CZĘŚĆ I -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
              DRUGA PLAGA: INWAZJA ŻAB I MODLITWA WSTAWIENNICZA (WJ 8:1–15)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>1. Poselstwo suwerena (8:1):</strong> Bóg posyła Mojżesza do faraona z tą samą formułą: „Wypuść mój lud, aby mi służył”. Celem wyzwolenia człowieka jest święta służba i uwielbienie Stwórcy.</p>
              <p><strong>2. Uderzenie w kult Heket (8:2):</strong> Żaby były symbolem bogini płodności Heket. Bóg obraca pogańskiego bożka w źródło wstrętu, paniki i zgnilizny.</p>
              <p><strong>3. Inwazja na strefy intymne (8:3):</strong> Żaby wdzierają się do sypialni, łóżek, pieców i dzież na ciasto, uniemożliwiając odpoczynek, sen i przygotowanie posiłku.</p>
              <p><strong>4. Zasięg dotknięcia (8:4):</strong> Płazy wpełzają na ciało samego monarchy, jego dostojników i poddanych, krusząc dumę pogańskiego władcy.</p>
              <p><strong>5. Wyciągnięcie laski Aarona (8:5–6):</strong> Wyciągnięta laska nad wody wywołuje plagę — natura słucha głosu Pana, a nie pogańskich zaklęć.</p>
              <p><strong>6. Bezsilna imitacja magów (8:7):</strong> Czarownicy egipscy sprowadzają żaby swymi czarami, lecz potrafią jedynie pomnożyć udrękę — nie potrafią usunąć ani jednej żaby!</p>
              <p><strong>7. Pierwsza prośba o modlitwę (8:8):</strong> Pyszny monarcha kapituluje przed pasterzami Boga Żywego: „Módlcie się do PANA, aby oddalił żaby”.</p>
              <p><strong>8. Zaszczyt wyboru terminu (8:9):</strong> Mojżesz daje królowi wolność wyznaczenia godziny cudu, by nikt nie przypisał ustąpienia plagi przypadkowi.</p>
              <p><strong>9. Tragiczna zwłoka: „Jutro” (8:10–11):</strong> Faraon woli spędzić kolejną noc pośród żab, byle odsunąć moment pełnej kapitulacji przed Bogiem.</p>
              <p><strong>10. Stosy martwych żab i zepsucie (8:12–15):</strong> Na modlitwę Mojżesza żaby giną, lecz ziemia cuchnie ich rozkładem. Gdy nadeszła ulga, faraon natychmiast zatwardza serce.</p>
            </div>
          </div>

          <!-- CZĘŚĆ II -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
              TRZECIA PLAGA: PROCH ZIEMI I WYZNANIE CZAROWNIKÓW (WJ 8:16–19)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>11. Sąd bez ostrzeżenia (8:16a):</strong> Trzecia plaga uderza nagle jako wyrok za odrzucenie poprzednich ostrzeżeń i cofnięcie danego słowa.</p>
              <p><strong>12. Uderzenie w pył ziemi (8:16b):</strong> Laska Aarona uderza proch czarnej ziemi nilowej, z której imperium czerpało dumę i plony.</p>
              <p><strong>13. Zdemaskowanie bóstwa Geba (8:17a):</strong> Pył staje się wszami i moskitami, obnażając bezradność egipskiego boga ziemi Geba.</p>
              <p><strong>14. Paraliż pogańskiego kapłaństwa (8:17b):</strong> Robactwo obsiada kapłanów egipskich, czyniąc ich rytualnie nieczystymi i uniemożliwiając obrzędy w świątyniach.</p>
              <p><strong>15. Totalna klęska magii (8:18a):</strong> Czarownicy próbują wywołać wszy swymi zaklęciami, lecz ponoszą sromotną klęskę: „I nie mogli”.</p>
              <p><strong>16. Monopol Stwórcy na życie (8:18b):</strong> Moce demoniczne mogą niszczyć i łudzić, ale nie mają mocy stwórczej, by powołać życie z prochu ziemi.</p>
              <p><strong>17. Świadectwo magów: „To jest palec Boży!” (8:19a):</strong> Pogańscy kapłani publicznie wyznają transcendencję Stwórcy nad okultyzmem.</p>
              <p><strong>18. Niewiarygodne zaślepienie tyrana (8:19b):</strong> Faraon odrzuca nawet świadectwo własnych doradców i ekspertów, brnąc w niszczycielski bunt.</p>
              <p><strong>19. Zdemaskowanie pozorów religijności (8:19c):</strong> Czystość zewnętrzna bez nawrócenia serca okazuje się bezwartościową iluzją przed Bogiem.</p>
              <p><strong>20. Niezłomność Bożego Słowa (8:19d):</strong> Zatwardziałość faraona dokładnie wypełnia Boże zapowiedzi — historia nie wymyka się Bogu z rąk.</p>
            </div>
          </div>

          <!-- CZĘŚĆ III -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
              CZWARTA PLAGA: CHMARY MUCH I ROZRÓŻNIENIE GOSZEN (WJ 8:20–24)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>21. Poranny apel u brzegów Nilu (8:20a):</strong> Bóg ponownie posyła Mojżesza o świcie nad wodę — Stwórca nie rezygnuje z napominania błądzących.</p>
              <p><strong>22. Niezmienne żądanie wolności (8:20b):</strong> „Wypuść mój lud, aby mi służył” — Boży nakaz pozostaje bezkompromisowy.</p>
              <p><strong>23. Zapowiedź inwazji zjadliwych gzów (8:21a):</strong> Roje gryzących owadów i much (arow) mają zalać domy, pałac i ziemię całego Egiptu.</p>
              <p><strong>24. Ośmieszenie bóstwa Khepri (8:21b):</strong> Plaga obnaża bezsilność bóstwa uosabianego przez owada toczącego tarczę słoneczną.</p>
              <p><strong>25. Epokowe wyodrębnienie ziemi Goszen (8:22a):</strong> Po raz pierwszy Bóg w widoczny sposób oddziela krainę Goszen — w domach Izraela nie ma ani jednej muchy!</p>
              <p><strong>26. Bóg obecny pośrodku ziemi (8:22b):</strong> Bóg objawia, że Jego panowanie obejmuje cały glob, burząc pogańskie mity o bóstwach terytorialnych.</p>
              <p><strong>27. Znak odkupienia — Pedut (8:23a):</strong> Bóg kładzie okup i rozdzielenie między ludami — ochrona wynika z przymierza i łaski, nie z ludzkich zasług.</p>
              <p><strong>28. Boża punktualność: „Jutro ten znak” (8:23b):</strong> W przeciwieństwie do zwłoki faraona, Boże „jutro” jest pewnym i niezawodnym wypełnieniem obietnicy.</p>
              <p><strong>29. Wykonanie sądu w pałacu i kraju (8:24a):</strong> Straszliwe roje much dewastują dom faraona, siedziby sług i wszelką roślinność.</p>
              <p><strong>30. Ruina mocarstwa (8:24b):</strong> „Ziemia została zniszczona przez rozmaite muchy” — pyszne imperium kapituluje przed bezbronnym robactwem.</p>
            </div>
          </div>

          <!-- CZĘŚĆ IV -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
              PUŁAPKI KOMPROMISU I PONOWNY BUNT (WJ 8:25–32)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>31. Wezwanie pod presją kataklizmu (8:25a):</strong> Złamany cierpieniem monarcha wzywa Mojżesza, by negocjować ugodę.</p>
              <p><strong>32. Pierwszy kompromis: „Ofiarujcie w tej ziemi” (8:25b):</strong> Szatan proponuje religijność w ramach pogańskiego systemu bez opuszczania Egiptu.</p>
              <p><strong>33. Odmowa profanacji (8:26a):</strong> Mojżesz odrzuca ugodę — ofiary z bydła byłyby zgorszeniem dla czczących byka Apisa i krowę Hathor Egipcjan.</p>
              <p><strong>34. Groźba ukamienowania (8:26b):</strong> Składanie ofiar w granicach imperium sprowadziłoby lincz — prawdziwy kult zawsze drażni pogański świat.</p>
              <p><strong>35. Nakaz trzech dni drogi (8:27):</strong> Wyzwolenie wymaga pełnego dystansu: pójścia w trzy dni drogi na pustynię za Panem.</p>
              <p><strong>36. Drugi kompromis: „Nie za daleko” (8:28a):</strong> Pokusa letniości: wierz w Boga, ale nie bądź radykalny, trzymaj się blisko starych kompromisów.</p>
              <p><strong>37. Desperacka prośba o modlitwę (8:28b):</strong> Tyran szuka ulgi od cierpienia, lecz nie ma w nim pragnienia opamiętania i pokuty serca.</p>
              <p><strong>38. Przestroga przed obłudą (8:29):</strong> Mojżesz ostrzega króla przed igraniem z Bogiem i łamaniem danego słowa.</p>
              <p><strong>39. Doskonałe oczyszczenie (8:30–31):</strong> Na modlitwę proroka Bóg usuwa wszystkie muchy — „nie została ani jedna”.</p>
              <p><strong>40. Tragiczny nawrót do zatwardziałości (8:32):</strong> Gdy minął ból, faraon ponownie zatwardził swe serce, ściągając na siebie kolejne sądy.</p>
            </div>
          </div>

        </div>
      </section>

      <!-- ── JEZUS W CENTRUM ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-cross"></i>
          <span>Jezus w centrum</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Palec Boży, Ziemia Goszen i Pełne Wyzwolenie — Chrystus w centrum Wj 8
        </h3>
        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4 font-serif">
          Ósmy rozdział Księgi Wyjścia ukazuje fundamentalne typologie biblijne, które znajdują swoje ostateczne wypełnienie w osobie i dziele Jezusa Chrystusa:
        </p>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif">
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">1. Palec Boży w służbie Jezusa Chrystusa (Wj 8:19 a Łk 11:20)</h4>
            <p class="text-zinc-300 leading-relaxed">Egipscy czarownicy wyznają: „To jest palec Boży”. Pan Jezus odwołał się do tych słów: „Jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże”. Chrystus z nieporównaną łatwością kruszy władzę szatana, uwalniając więźniów grzechu.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">2. Kraina Goszen — bezpieczne schronienie w Chrystusie (Wj 8:22–23 a Rz 8:1)</h4>
            <p class="text-zinc-300 leading-relaxed">Cudowne oddzielenie Goszen (hebr. pedut — wykupienie) zapowiada położenie wierzącego w Chrystusie. Nie ma potępienia dla tych, którzy są w Nim. Choć wokół szaleje burza, domy odkupionych krwią Zbawiciela cieszą się nienaruszalnym pokojem.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">3. Bezkompromisowość Chrystusa wobec kusiciela (Wj 8:25, 28 a Mt 4:10)</h4>
            <p class="text-zinc-300 leading-relaxed">Podobnie jak faraon proponował kompromisy, szatan kusił Chrystusa na pustyni obietnicą ziemskich królestw. Jezus odrzucił ugodę: „Idź precz, szatanie! PANU będziesz oddawał pokłon”. Zbawiciel wywalczył dla nas wolność całkowitą, bez uległości wobec zła.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">4. Trzy dni drogi — droga Zmartwychwstania (Wj 8:27 a J 8:36)</h4>
            <p class="text-zinc-300 leading-relaxed">Trzy dni drogi na pustynię zapowiadają śmierć i zmartwychwstanie Chrystusa w trzecim dniu. Prawdziwe wyzwolenie nie polega na ugodzie z niewolą, lecz na wyjściu poza stary świat ku nowemu życiu z Bogiem.</p>
          </div>
        </div>
      </section>

      <!-- ── SPRAWDŹ W BIBLII ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Porównaj wersety we własnym Piśmie Świętym</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:1 → Rz 12:1</strong>: Wyzwolenie z niewoli jako wezwanie do ofiary żywej i świętej służby Bogu.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:2 → Ap 16:13–14</strong>: Demoniczne duchy na podobieństwo żab wychodzące z ust smoka w czasach ostatecznych.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:10 → 2 Kor 6:2</strong>: Zwodniczość słowa „jutro” wobec biblijnego nakazu: „Oto teraz czas zbawienia”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:14 → Rz 6:21</strong>: Smród martwych żab jako obraz duchowego rozkładu i wstydu po grzechu.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:18 → 1 J 4:4</strong>: Bezsilność magii wobec Stwórcy: „Większy jest Ten, który jest w was”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:19 → Łk 11:20</strong>: Palec Boży niszczący zwierzchności ciemności i objawiający Królestwo Boże.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:22 → Mal 3:18</strong>: Ostateczne rozróżnienie między sprawiedliwym a bezbożnym w obliczu sądu.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:23 → Ef 1:7</strong>: Odkupienie (pedut) przez krew jako tarcza bezpieczeństwa ludu przymierza.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:25 → 2 Kor 6:14</strong>: Odrzucenie „ofiary w Egipcie” — zakaz wprzęgania się w nierówne jarzmo ze światem.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:27 → Hbr 13:13</strong>: Trzy dni drogi — wyjście za obóz, ku zmartwychwstaniu, znosząc urąganie Chrystusa.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:28 → Łk 9:62</strong>: Pułapka „nie za daleko” — zakaz oglądania się wstecz po przyłożeniu ręki do pługa.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 8:32 → Hbr 3:13</strong>: Ostrzeżenie przed zatwardziałością serca z powodu zwodniczości grzechu w chwili ulgi.</div>
        </div>
      </section>

      <!-- ── PRAWDA NA DZIŚ ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Prawda na dziś</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Przymierza — Co zmienia się w Twoim patrzeniu?
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>Służba zamiast samowoli:</strong> Bóg uwalnia nas, byśmy Mu służyli w świętości, a nie po to, by żyć dla własnego egoizmu (Wj 8:1).</p>
          <p>• <strong>Koniec pogańskich bożków:</strong> To, co stawiasz na miejscu Boga, w końcu stanie się źródłem Twojej udręki i duchowego rozkładu (Wj 8:3, 14).</p>
          <p>• <strong>Złudzenie „jutra”:</strong> Odkładanie nawrócenia na jutro to zgoda na spędzenie kolejnej nocy pośród brudu grzechu (Wj 8:10).</p>
          <p>• <strong>Granice szatana:</strong> Siły ciemności nie potrafią powołać życia z prochu — ich moc jest ściśle ograniczona przez Stwórcę (Wj 8:18).</p>
          <p>• <strong>Wystarczy Palec Boży:</strong> Najpotężniejsze imperia i mocarstwa kłaniają się przed samym tylko dotknięciem Bożej ręki (Wj 8:19).</p>
          <p>• <strong>Oaza Ziemi Goszen:</strong> W Chrystusie masz zapewnione wieczne bezpieczeństwo i pokój, choćby cały świat wokół tonął w kryzysie (Wj 8:22–23).</p>
          <p>• <strong>Odrzuć kompromisy:</strong> Wróg zawsze proponuje religijność w ramach świeckiego systemu — Bóg wymaga pełnego oddzielenia (Wj 8:25).</p>
          <p>• <strong>Pełny dystans wiary:</strong> Prawdziwy uczeń idzie na pełne „trzy dni drogi”, nie zatrzymując się na granicy letniości (Wj 8:27–28).</p>
        </div>
      </section>

      <!-- ── POMYŚL ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-heart"></i>
          <span>Pytania do serca (Pomyśl)</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w Twoim życiu jest obszar, w którym mówisz Bogu „jutro”, zwlekając z natychmiastowym posłuszeństwem Jego Duchowi?</p>
          <p>2. Jakie doczesne „żaby” — fałszywe poczucie bezpieczeństwa czy pogoń za uznaniem — próbują zakłócić Twój wewnętrzny pokój?</p>
          <p>3. Czy doświadczyłeś Bożej ochrony w Ziemi Goszen, gdy w trudnych okolicznościach Bóg zachował Twoje serce w nienaruszonym pokoju?</p>
          <p>4. W jakich sytuacjach czujesz pokusę „składania ofiary w Egipcie” — dostosowywania wiary do oczekiwań bezbożnego otoczenia?</p>
          <p>5. Dlaczego tak ważne jest dla Ciebie pójście na pełne „trzy dni drogi” za Jezusem, zamiast pozostawania letnim chrześcijaninem?</p>
          <p>6. Jak reagujesz w chwilach wytchnienia: czy Twoje serce trwa w dziękczynieniu, czy ulega uśpieniu i zapomina o Bogu?</p>
          <p>7. Czy pamiętasz, że przed Palcem Bożym milkną wszelkie oskarżenia wroga i demony muszą ustąpić?</p>
          <p>8. Komu z Twoich bliskich możesz dziś pomóc wyrwać się ze szponów kompromisu i przypomnieć o wolności w Chrystusie?</p>
        </div>
      </section>

      <!-- ── QUIZ ── -->
      <section class="kc-card" id="quiz-section">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-circle-question"></i>
          <span>Mały Quiz Wiedzy Biblijnej</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
          20 Pytań z Wj 8:1–32 (Sprawdź swoją wiedzę)
        </h3>
        <p class="text-xs text-zinc-400 mb-6">
          Po przeczytaniu Wj 8 odpowiedz na poniższe pytania. Każde pytanie posiada natychmiastowe wyjaśnienie.
        </p>

        <div id="quizContainer" class="space-y-6"></div>
        <div id="quizResult" class="hidden mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
          <div class="text-2xl font-black text-amber-400 font-display" id="quizScoreText"></div>
          <p class="text-xs text-zinc-300" id="quizFeedbackText"></p>
        </div>
      </section>

      <!-- ── TWOJA DECYZJA ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-hand-holding-heart"></i>
          <span>Twoja decyzja</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Koniec z kompromisami — Wybierz Pełną Wolność Przymierza
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Ósmy rozdział Księgi Wyjścia obnaża daremność negocjowania z grzechem. Faraon proponował połowiczność, ugodę w granicach imperium i odkładanie nawrócenia na „jutro”. Zakończyło się to ruiną jego państwa i stertami gnijących płazów.
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Osobiste Wyznanie Decyzji:</h4>
            <p class="italic text-white">
              „Panie Boże Wszechmogący, wyznaję, że Ty jesteś jedynym Królem mojego serca. Odrzucam zwodnicze słowo »jutro« i wyrzekam się wszelkich kompromisów ze światem. Dziękuję Ci za Ziemię Goszen w Jezusie Chrystusie, w której mam wieczne bezpieczeństwo. Wyruszam za moim Zbawicielem na pełne trzy dni drogi ku nowemu, uświęconemu życiu!”
            </p>
          </div>
        </div>
      </section>

      <!-- ── MODLITWA ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-hands-praying"></i>
          <span>Modlitwa na 8 listopada</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Czyste Serce i Odwagę Wiary
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Święty i Miłosierny Boże, Ojcze naszego Pana Jezusa Chrystusa! Dziękujemy Ci za potęgę Twojego Słowa objawionego w ósmym rozdziale Księgi Wyjścia. Przed Twoim Palcem milkną wszelkie moce zła i uginają się władcy tego świata.
          </p>
          <p>
            Przebacz nam, Panie, każdą chwilę duchowej opieszałości, gdy mówiliśmy „jutro” zamiast odpowiedzieć posłuszeństwem na Twój głos. Zachowaj nasze serca przed zatwardziałością i znieczulicą, która gubiła faraona.
          </p>
          <p>
            Dziękujemy Ci za krew Jezusa Chrystusa, która położyła na naszym życiu wieczny znak odkupienia. Uczyń nasze rodziny, nasze domy i zbory bezpieczną Ziemią Goszen, w której jaśnieje Twoja obecność i pokój. Prowadź nas drogą pełnego poświęcenia, bez oglądania się na kompromisy tego świata. W Imieniu Jezusa Chrystusa. Amen!
          </p>
        </div>
      </section>

      <!-- ── ZASTOSOWANIE I TWÓJ ZAPIS (wzór Dnia 1) ── -->
      <section class="kc-card space-y-6">
        <div class="flex items-center gap-2 border-b border-brand-line pb-4">
          <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
            <i class="fa-solid fa-clipboard-check"></i>
          </span>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">ZADANIE NA DZIŚ & TWÓJ ZAPIS</h2>
            <p class="text-xs text-zinc-400">Praktyczne wdrożenie Słowa Bożego w codzienność</p>
          </div>
        </div>

        <div class="space-y-4 text-xs sm:text-sm text-zinc-300 font-serif">
          <p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:</p>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj osobiście cały ósmy rozdział Księgi Wyjścia (Wj 8:1–32) w przekładzie UBG.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zbadaj, czy w Twoim życiu jest sprawa, w której odkładasz posłuszeństwo i mówisz Bogu „jutro”.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Przeanalizuj swoje relacje i pracę — odrzuć pokusę kompromisu („ofiara w granicach Egiptu”).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Otwórz Łk 11:14–23 i podziękuj Jezusowi za autorytet Palca Bożego niszczącego dzieła diabła.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Pomódl się o uświęcenie Twojego domu jako bezpiecznej Ziemi Goszen.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zapisz w polu poniżej jedno konkretne postanowienie pójścia na pełny dystans wiary.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Udostępnij dzisiejsze rozważanie osobie potrzebującej duchowego umocnienia.</span>
          </label>
        </div>

        <div class="space-y-4 pt-2">
          <div>
            <label for="kc-input-learned" class="block text-xs uppercase font-bold tracking-wider text-amber-400 mb-2">Czego nauczyło Cię dzisiejsze Słowo?</label>
            <textarea id="kc-input-learned" rows="3" class="w-full rounded-xl bg-black/50 border border-brand-line p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="Zapisz swoje osobiste spostrzeżenia..."></textarea>
          </div>
          <div>
            <label for="kc-input-decision" class="block text-xs uppercase font-bold tracking-wider text-amber-400 mb-2">Twoje konkretne postanowienie:</label>
            <textarea id="kc-input-decision" rows="2" class="w-full rounded-xl bg-black/50 border border-brand-line p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="Co zmienisz w swoim życiu od dzisiaj?"></textarea>
          </div>

          <div class="flex items-center gap-4 flex-wrap pt-2">
            <label class="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input type="checkbox" id="chk-read" class="rounded text-amber-500 focus:ring-amber-400">
              <span>PRZECZYTAŁEM</span>
            </label>
            <label class="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input type="checkbox" id="chk-understood" class="rounded text-amber-500 focus:ring-amber-400">
              <span>ZROZUMIAŁEM</span>
            </label>
            <label class="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input type="checkbox" id="chk-apply" class="rounded text-amber-500 focus:ring-amber-400">
              <span>ZASTOSUJĘ</span>
            </label>
          </div>

          <button id="btn-complete-day" onclick="completeDay39()" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 min-h-[44px]">
            <i class="fa-solid fa-check"></i>
            <span>Oznacz Dzień 39 jako ukończony</span>
          </button>
        </div>
      </section>

      <!-- ── ROZMOWA Z DUCHOWNYM ── -->
      <section class="p-6 rounded-2xl bg-[#0F1420] border border-brand-border/30 text-zinc-300" id="kontakt-duchowny">
        <div class="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
          <i class="fa-solid fa-comments"></i>
          <span>Wsparcie Duszpasterskie</span>
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          Potrzebujesz rozmowy lub modlitwy?
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Jeśli zmagasz się z trudnymi pytaniami, walką duchową lub pragniesz oddać swoje życie Jezusowi Chrystusowi, nasi duszpasterze są do Twojej dyspozycji.
        </p>
        <a href="mailto:kontakt@polskieradio.cc" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-white border border-brand-border/40 text-xs font-bold transition min-h-[44px]">
          <i class="fa-solid fa-envelope"></i>
          <span>Napisz do duszpasterza (kontakt@polskieradio.cc)</span>
        </a>
      </section>

      <!-- ── ZAPOWIEDŹ: JUTRO ── -->
      <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 9 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 40 — POMÓR BYDŁA, WRZODY I GRAD (Wj 9:1–35)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 40: Księga Wyjścia 9:1–35. Kolejne trzy plagi uderzają w gospodarkę i zdrowie imperium. Bóg oznajmia faraonowi: „Właśnie po to cię zachowałem, aby okazać na tobie moją moc”. Ognisty grad niszczący pola i Boże panowanie nad żywiołami.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (9 listopada)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
            ← Spis kursu
          </a>
        </div>
      </section>

      <!-- ── UDOSTĘPNIANIE & MEDIA SPOŁECZNOŚCIOWE ── -->
      <section class="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black/40 to-transparent border border-brand-border/30 text-center space-y-4" id="ccDailyShare">
        <div class="text-xs font-bold uppercase tracking-widest text-brand-gold">
          Podziel się Słowem Bożym z innymi
        </div>
        <p class="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-serif">
          Nie zatrzymuj tego poselstwa dla siebie. Jedno kliknięcie może przynieść Bożą wolność komuś, kto zmaga się w niewoli kompromisów.
        </p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <a href="https://api.whatsapp.com/send?text=Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2039%3A%20Plagi%20%C5%BCab%2C%20wszy%20i%20much%20(Wj%208)%3A%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-39" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow min-h-[44px]">
            <i class="fa-brands fa-whatsapp text-sm"></i>
            <span>WhatsApp</span>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-39" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow min-h-[44px]">
            <i class="fa-brands fa-facebook-f text-sm"></i>
            <span>Facebook</span>
          </a>
          <a href="https://twitter.com/intent/tweet?text=Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2039%3A%20Plagi%20%C5%BCab%2C%20wszy%20i%20much%20(Wj%208)&url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-39" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-2 shadow min-h-[44px]">
            <i class="fa-brands fa-x-twitter text-sm"></i>
            <span>X (Twitter)</span>
          </a>
        </div>
      </section>

    </section>
  </main>

  <!-- PRZYCISK DO GÓRY -->
  <button id="backToTopBtn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-brand-gold text-zinc-950 font-bold shadow-xl flex items-center justify-center hover:bg-brand-gold-light transition z-40 min-h-[44px] min-w-[44px]" title="Do góry">
    <i class="fa-solid fa-arrow-up"></i>
  </button>

  <!-- SKRYPTY LEKCJI (wzór Dnia 1) -->
  <script src="/js/cc-global-auth.js?v=20261007_auth_v2" defer></script>
  <script src="/js/cc-course-theme.js?v=20261008_desktop_icons_v3" defer></script>
  <script src="/js/cc-daily-course-share.js?v=20261108_wa1" defer></script>

  <script>
    // ── QUIZ LOGIC (20 PYTAŃ Z WJ 8:1–32) ──
    const QUIZ_DATA = ${JSON.stringify(QUIZ_DATA, null, 2)};
    const DAY_KEY = 'kc_day39';

    let userAnswers = {};

    function renderQuiz() {
      const container = document.getElementById('quizContainer');
      if (!container) return;
      container.innerHTML = QUIZ_DATA.map((item, qIdx) => {
        return \`
          <div class="p-4 rounded-xl bg-black/40 border border-brand-line space-y-3" id="qBox_\${qIdx}">
            <div class="flex items-start gap-2.5">
              <span class="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">\${qIdx + 1}</span>
              <p class="text-sm font-semibold text-white font-serif leading-snug">\${item.q}</p>
            </div>
            <div class="grid grid-cols-1 gap-2 pl-8">
              \${item.a.map((ans, aIdx) => \`
                <button
                  type="button"
                  onclick="selectAnswer(\${qIdx}, \${aIdx})"
                  id="btnAns_\${qIdx}_\${aIdx}"
                  class="text-left px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs sm:text-sm text-zinc-300 transition flex items-center justify-between border border-transparent min-h-[44px]"
                >
                  <span>\${ans}</span>
                  <span class="status-icon text-xs"></span>
                </button>
              \`).join('')}
            </div>
            <div id="qFeedback_\${qIdx}" class="hidden pl-8 text-xs font-serif pt-1"></div>
          </div>
        \`;
      }).join('');
    }

    function selectAnswer(qIdx, aIdx) {
      if (userAnswers[qIdx] !== undefined) return;
      userAnswers[qIdx] = aIdx;
      const q = QUIZ_DATA[qIdx];
      const isCorrect = (aIdx === q.c);
      
      const btn = document.getElementById(\`btnAns_\${qIdx}_\${aIdx}\`);
      const feedback = document.getElementById(\`qFeedback_\${qIdx}\`);
      
      if (isCorrect) {
        btn.classList.remove('bg-white/5', 'hover:bg-white/10');
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-200');
        btn.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i>';
        feedback.className = 'pl-8 text-xs font-serif text-emerald-400 block';
        feedback.textContent = 'Brawo! Prawidłowa odpowiedź.';
      } else {
        btn.classList.remove('bg-white/5', 'hover:bg-white/10');
        btn.classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-200');
        btn.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-xmark text-rose-400"></i>';
        
        const correctBtn = document.getElementById(\`btnAns_\${qIdx}_\${q.c}\`);
        if (correctBtn) {
          correctBtn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-200');
          correctBtn.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i>';
        }
        feedback.className = 'pl-8 text-xs font-serif text-rose-400 block';
        feedback.textContent = \`Prawidłowa odpowiedź to: "\${q.a[q.c]}".\`;
      }

      checkQuizCompletion();
    }

    function checkQuizCompletion() {
      if (Object.keys(userAnswers).length === QUIZ_DATA.length) {
        let score = 0;
        QUIZ_DATA.forEach((q, idx) => {
          if (userAnswers[idx] === q.c) score++;
        });
        const resBox = document.getElementById('quizResult');
        const scoreText = document.getElementById('quizScoreText');
        const feedText = document.getElementById('quizFeedbackText');
        
        resBox.classList.remove('hidden');
        scoreText.textContent = \`Twój wynik: \${score} / \${QUIZ_DATA.length}\`;
        if (score === QUIZ_DATA.length) {
          feedText.textContent = 'Doskonale! Znasz na wskroś 8. rozdział Księgi Wyjścia!';
        } else if (score >= 15) {
          feedText.textContent = 'Wspaniały wynik! Masz bardzo dobrą znajomość tekstu Pisma Świętego.';
        } else {
          feedText.textContent = 'Dobry początek! Warto przeczytać ten rozdział jeszcze raz, by zapamiętać Boże obietnice.';
        }
        try {
          localStorage.setItem(DAY_KEY + '_quiz', score);
        } catch(e){}
      }
    }

    // ── PROGRESS & AUTO-SAVE ──
    function completeDay39() {
      try {
        localStorage.setItem(DAY_KEY + '_completed', 'true');
        localStorage.setItem(DAY_KEY + '_learned', document.getElementById('kc-input-learned').value || '');
        localStorage.setItem(DAY_KEY + '_decision', document.getElementById('kc-input-decision').value || '');
        localStorage.setItem(DAY_KEY + '_chk_read', document.getElementById('chk-read').checked ? '1' : '0');
        localStorage.setItem(DAY_KEY + '_chk_understood', document.getElementById('chk-understood').checked ? '1' : '0');
        localStorage.setItem(DAY_KEY + '_chk_apply', document.getElementById('chk-apply').checked ? '1' : '0');
        
        const btn = document.getElementById('btn-complete-day');
        btn.classList.remove('from-amber-500', 'to-amber-600');
        btn.classList.add('bg-emerald-600', 'text-white');
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Dzień 39 ukończony!</span>';
      } catch(e) {}
    }
    window.completeDay39 = completeDay39;

    function toggleTaskState(idx) {
      try {
        const chk = document.getElementById('chk-task-' + idx);
        if (chk) localStorage.setItem(DAY_KEY + '_task_' + idx, chk.checked ? '1' : '0');
      } catch(e) {}
    }
    window.toggleTaskState = toggleTaskState;

    function loadSavedState() {
      try {
        if (localStorage.getItem(DAY_KEY + '_completed') === 'true') {
          const btn = document.getElementById('btn-complete-day');
          if (btn) {
            btn.classList.remove('from-amber-500', 'to-amber-600');
            btn.classList.add('bg-emerald-600', 'text-white');
            btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Dzień 39 ukończony!</span>';
          }
        }
        const learned = localStorage.getItem(DAY_KEY + '_learned');
        if (learned && document.getElementById('kc-input-learned')) document.getElementById('kc-input-learned').value = learned;
        const decision = localStorage.getItem(DAY_KEY + '_decision');
        if (decision && document.getElementById('kc-input-decision')) document.getElementById('kc-input-decision').value = decision;
        
        if (localStorage.getItem(DAY_KEY + '_chk_read') === '1' && document.getElementById('chk-read')) document.getElementById('chk-read').checked = true;
        if (localStorage.getItem(DAY_KEY + '_chk_understood') === '1' && document.getElementById('chk-understood')) document.getElementById('chk-understood').checked = true;
        if (localStorage.getItem(DAY_KEY + '_chk_apply') === '1' && document.getElementById('chk-apply')) document.getElementById('chk-apply').checked = true;
        
        for (let i = 1; i <= 7; i++) {
          if (localStorage.getItem(DAY_KEY + '_task_' + i) === '1') {
            const chk = document.getElementById('chk-task-' + i);
            if (chk) chk.checked = true;
          }
        }
      } catch(e) {}
    }

    // ── AUDIO TTS PLAYER DUMMY / REAL HANDLER ──
    function toggleAudioLesson() {
      const btnText = document.getElementById('tts-btn-text');
      if (window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          if (btnText) btnText.textContent = 'Lektor';
        } else {
          const u = new SpeechSynthesisUtterance("${MEMORY_VERSE.replace(/"/g, '')}");
          u.lang = 'pl-PL';
          u.onend = () => { if (btnText) btnText.textContent = 'Lektor'; };
          window.speechSynthesis.speak(u);
          if (btnText) btnText.textContent = 'Pauza';
        }
      }
    }
    window.toggleAudioLesson = toggleAudioLesson;

    // ── FONTS & THEME ──
    function toggleReaderFont() {
      const reading = document.querySelector('.kc-prose-reading');
      if (!reading) return;
      if (reading.style.fontFamily.includes('Lora')) {
        reading.style.fontFamily = 'Inter, system-ui, sans-serif';
      } else {
        reading.style.fontFamily = 'Lora, Georgia, serif';
      }
    }
    window.toggleReaderFont = toggleReaderFont;

    let currentFontSize = 1.0625;
    function adjustFontSize(delta) {
      const reading = document.querySelector('.kc-prose-reading');
      if (!reading) return;
      currentFontSize = Math.max(0.875, Math.min(1.5, currentFontSize + delta * 0.0625));
      reading.style.fontSize = currentFontSize + 'rem';
    }
    window.adjustFontSize = adjustFontSize;

    function toggleCourseTheme() {
      document.documentElement.classList.toggle('dark');
    }
    window.toggleCourseTheme = toggleCourseTheme;

    document.addEventListener('DOMContentLoaded', () => {
      renderQuiz();
      loadSavedState();
    });
  </script>
</body>
</html>`;

// Sprawdzamy Strażnika Lekcji
const bledy = sprawdzLekcje(htmlContent, 39);
if (bledy.length > 0) {
  console.error('❌ Błędy wykryte przez Strażnika Lekcji w Dniu 39:');
  for (const b of bledy) console.error('   -', b);
  throw new Error(`Strażnik Lekcji zgłosił błędy w Dniu 39.`);
}
console.log('✅ Strażnik Lekcji potwierdził 100% poprawności Dnia 39 (0 błędów)!');

// Zapisujemy we wszystkich 4 ścieżkach Clean URLs
const targetPaths = [
  'akademia/kurscodzienny/dzien-39.html',
  'akademia/kurscodzienny/dzien-39/index.html',
  'kursy/kurscodzienny/dzien-39.html',
  'kursy/kurscodzienny/dzien-39/index.html'
];

for (const p of targetPaths) {
  const fullPath = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, htmlContent, 'utf8');
  console.log(`✅ Zapisano: ${p}`);
}

// Mirrory
const mirrorPaths = [
  path.join(ROOT, '.pages-release/akademia/kurscodzienny/dzien-39.html'),
  path.join(ROOT, '.pages-release/akademia/kurscodzienny/dzien-39/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-39.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-39/index.html'
];

for (const m of mirrorPaths) {
  try {
    fs.mkdirSync(path.dirname(m), { recursive: true });
    fs.writeFileSync(m, htmlContent, 'utf8');
    console.log(`✅ Zsynchronizowano mirror: ${m}`);
  } catch (e) {
    console.warn(`⚠️ Błąd mirrora ${m}:`, e.message);
  }
}

// 8. AKTUALIZACJA DNIA 38 — DODANIE NAWIGACJI DO DNIA 39
console.log('🔗 Aktualizacja Dnia 38 o odnośnik do Dnia 39...');
const d38Paths = [
  'akademia/kurscodzienny/dzien-38.html',
  'akademia/kurscodzienny/dzien-38/index.html',
  'kursy/kurscodzienny/dzien-38.html',
  'kursy/kurscodzienny/dzien-38/index.html',
  '.pages-release/akademia/kurscodzienny/dzien-38.html',
  '.pages-release/akademia/kurscodzienny/dzien-38/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-38.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-38/index.html'
];

for (const p38 of d38Paths) {
  const fullP38 = path.isAbsolute(p38) ? p38 : path.join(ROOT, p38);
  if (fs.existsSync(fullP38)) {
    let d38Html = fs.readFileSync(fullP38, 'utf8');
    // Zamieniamy zablokowany link "Dzień 39 (Jutro)" na aktywny link
    d38Html = d38Html.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 39 \(Jutro\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-39" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]"><span>Dzień 39 →</span><i class="fa-solid fa-chevron-right text-[10px]"></i></a>`
    );
    // W sekcji jutro upewniamy się, że przycisk odsyła do Dnia 39
    d38Html = d38Html.replace(
      /<span class="inline-flex items-center gap-2 px-5 py-2\.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-\[44px\]">\s*<span>Dostępne od północy \(8 listopada\)<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-39" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow min-h-[44px]"><span>Czytaj Dzień 39 →</span></a>`
    );
    fs.writeFileSync(fullP38, d38Html, 'utf8');
    console.log(`✅ Zaktualizowano nawigację w: ${p38}`);
  }
}

console.log('🎉 Kompletne wygenerowanie i wdrożenie Dnia 39 zakończone sukcesem!');
