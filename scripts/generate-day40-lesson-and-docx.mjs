import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 40: Wj 9:1–35 (9 listopada 2026, Poniedziałek)
const DAY_NUM = 40;
const DATE_STR = '2026-11-09';
const DATE_FORMATTED = 'Poniedziałek, 9 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 9:1–35';
const TITLE = 'POMÓR BYDŁA, WRZODY I OGIEŃ Z GRADEM — BOŻA MOC PONAD PYCHĄ FARAONA';
const SUBTITLE = 'Sąd nad bóstwami Apisem, Hathor, Imhotepem i Nut, bezsilność magów wobec wrzodów i schronienie w krainie Goszen';
const MEMORY_VERSE = '„Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi.” (Wj 9:16, UBG)';
const THEME = 'Dziewiąty rozdział Księgi Wyjścia ukazuje trzy kolejne, niszczycielskie sądy Boże nad Egiptem: zarazę na bydło, bolesne wrzody na ludziach i zwierzętach oraz bezprecedensowy grad zmieszany z ogniem. Bóg uderza w fundamenty egipskiej gospodarki, kult religijny bóstw zdrowia i fałszywe poczucie bezpieczeństwa. W centralnym oświadczeniu historii zbawienia (Wj 9:16) Pan objawia suwerenny cel zachowania faraona — aby Boża moc i Jego chwalebne imię stały się znane po całej ziemi. W Jezusie Chrystusie ten sąd zamienia się w nasze wybawienie: On stał się naszym schronieniem przed nadchodzącym gniewem, oddzielając nas łaską jak ziemię Goszen.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 40 (Wj 9:1–35)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 40
POMÓR BYDŁA, WRZODY I OGIEŃ Z GRADEM — BOŻA MOC PONAD PYCHĄ FARAONA
Sąd nad bóstwami Apisem, Hathor, Imhotepem i Nut, bezsilność magów wobec wrzodów i schronienie w krainie Goszen
Poniedziałek, 9 listopada 2026 r.  |  Czytanie: Wj 9:1–35
TEKST PAMIĘCIOWY: „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi.” (Wj 9:16, UBG)
MYŚL PRZEWODNIA: Dziewiąty rozdział Księgi Wyjścia ukazuje trzy kolejne, niszczycielskie sądy Boże nad Egiptem: zarazę na bydło, bolesne wrzody na ludziach i zwierzętach oraz bezprecedensowy grad zmieszany z ogniem. Bóg uderza w fundamenty egipskiej gospodarki, kult religijny bóstw zdrowia i fałszywe poczucie bezpieczeństwa. W centralnym oświadczeniu historii zbawienia (Wj 9:16) Pan objawia suwerenny cel zachowania faraona — aby Boża moc i Jego chwalebne imię stały się znane po całej ziemi. W Jezusie Chrystusie ten sąd zamienia się w nasze wybawienie: On stał się naszym schronieniem przed nadchodzącym gniewem, oddzielając nas łaską jak ziemię Goszen.

ZANIM OTWORZYSZ BIBLIĘ
Dziewiąty rozdział Księgi Wyjścia wprowadza nas w decydującą, dramatyczną fazę wielkiego starcia pomiędzy jedynym, żywym Bogiem JAHWE a panteonem najpotężniejszego imperium ówczesnego świata. Po sądzie nad Nilem, żabami, wszami i muchami, Boża ręka uderza bezpośrednio w fundamenty gospodarki, pogańskiego kultu medycyny i bezpieczeństwa militarnego Egiptu.
W tym rozdziale oglądamy trzy kolejne kataklizmy: zarazę i pomór na bydło (piąta plaga), ropiejące wrzody wywołane sadzą z pieca (szósta plaga) oraz zstąpienie z niebios ognistego gradu (siódma plaga). Każda z nich godzi w konkretne bóstwa pogańskie: świętego byka Apisa, boginię matkę Hathor, bóstwa uzdrawiania Imhotepa i Sechmet oraz bóstwa nieba Nut i burzy Seta.
Jednocześnie w rozdziale tym pada kluczowe zdanie teologii biblijnej: „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi” (Wj 9:16). Apostoł Paweł w Rz 9:17 uczyni z tego wersetu fundament nauki o Bożej suwerenności w historii odkupienia. Co więcej, przed uderzeniem nawałnicy gradu Bóg po raz pierwszy daje instrukcję ratunku przez wiarę: kto uląkł się Słowa Pana, schronił swe sługi i bydło pod dach, ocalając życie. Kraina Goszen pozostaje nietkniętą oazą pokoju, zapowiadając wieczne bezpieczeństwo wierzących w Chrystusie.

CZĘŚĆ I — PIĄTA PLAGA: POMÓR EGIPSKIEGO BYDŁA I OCHRONA W GOSZEN (Wj 9:1–7)
1. Poselstwo z tytułem przymierza (9:1)
Bóg posyła Mojżesza do pałacu faraona z formułą przymierza: „Tak mówi PAN, Bóg Hebrajczyków: Wypuść mój lud, aby mi służył”. Wszechmogący objawia się jako osobowy Bóg i wierny Obrońca uciśnionego ludu przymierza.
2. Ręka Pana na polach (9:2–3)
Sąd uderza bezpośrednio w konie, osły, wielbłądy, woły i owce — fundament rolnictwa, transportu, handlu oraz elitarnej armii rydwanów imperium.
3. Druzgocące uderzenie w panteon bóstw (9:3b)
Plaga obnaża całkowitą nicość byka Apisa (czczonego w Memfis jako żywe ucieleśnienie boga Ptaha) oraz bogini Hathor o krowiej głowie, ubóstwianej jako dawczyni ziemskiej pomyślności.
4. Cudowne rozróżnienie (9:4)
Bóg wyznacza absolutną granicę przymierza: „PAN rozdzieli stada Izraela i stada Egiptu, aby nie zdechło nic ze wszystkiego, co należy do synów Izraela”.
5. Wyznaczony czas suwerena (9:5)
„Jutro PAN to uczyni na tej ziemi” — precyzyjny termin wyklucza losowy przypadek i potwierdza, że epidemią zarządza sam Stwórca.
6. Spełnienie wyroku (9:6)
Następnego dnia ginie bydło Egipcjan na polach, lecz ze stad synów Izraela nie zdechło ani jedno zwierzę.
7. Dochodzenie faraona (9:7a)
Monarcha posyła zwiadowców, by zweryfikować stan stad w ziemi Goszen — fakt urzędowego ocalenia Izraela zostaje bezspornie zaprotokołowany na dworze.
8. Zaślepiony upór (9:7b)
Mimo niezbitego dowodu Bożej potęgi i sprawiedliwości, „serce faraona pozostało zatwardziałe i nie wypuścił ludu”.

CZĘŚĆ II — SZÓSTA PLAGA: SADZA Z PIECA I BOLESNE WRZODY (Wj 9:8–12)
9. Sąd bez ostrzeżenia słownego (9:8a)
Szósta plaga — podobnie jak trzecia — spada nagle, bez uprzedniej audiencji, jako surowy wyrok za zatwardziałość wobec poprzednich znaków.
10. Sadza z pieca hutniczego (9:8b)
Piece, w których hebrajscy niewolnicy wypalali gliniane cegły, stają się narzędziem pomsty i sprawiedliwego sądu nad ich ciemiężycielami.
11. Symboliczny gest ku niebu (9:8c)
Mojżesz rozrzuca sadzę ku niebu na oczach monarchy, manifestując, że wyrok pochodzi wprost z tronu Świętego Boga.
12. Jątrzące się bąble i wrzody (9:9)
Drobny pył w całym Egipcie zamienia się w bolesną zarazę skórną (hebr. szchin) wywołującą ropiejące pęcherze na ludziach i zwierzętach.
13. Klęska bóstw medycyny (9:9b)
Egipskie bóstwa uzdrawiania — Imhotep, Serapis i lwia bogini Sechmet — okazują się bezsilną fikcją w obliczu Bożego gniewu.
14. Upokorzenie egipskich magów (9:11a)
Czarownicy (hartummim) nie mogą nawet ustać przed Mojżeszem z powodu piekących wrzodów, które pokryły ich ciała.
15. Ostateczny kres prestiżu kasty kapłańskiej (9:11b)
Skalani rytualną i fizyczną nieczystością kapłani zostają wykluczeni z pogańskich obrzędów świątynnych imperium.
16. Sądowe zatwardzenie serca (9:12)
„PAN zatwardził serce faraona” — gdy grzesznik uporczywie odrzuca kolejne wezwania do skruchy, Bóg wydaje go jego własnemu upartemu buntowi.

CZĘŚĆ III — SUWERENNY CEL BOGA I OSTRZEŻENIE PRZED GRADEM (Wj 9:13–19)
17. Poranne orędzie wolności (9:13)
Bóg nakazuje Mojżeszowi wstać wcześnie rano i stanąć przed faraonem z niezmiennym poselstwem: „Wypuść mój lud, aby mi służył”.
18. Cios w samo serce imperium (9:14)
„Ześlę wszystkie moje plagi wprost w twoje serce” — wyrok przestaje dotykać jedynie zasobów zewnętrznych, uderzając bezpośrednio w duszę i życie monarchy.
19. Świadectwo jedyności Boga (9:14b)
Nadrzędny cel sądu: „Abyś poznał, że nie ma nikogo takiego jak Ja na całej ziemi”.
20. Powściągliwość Bożej ręki (9:15)
Bóg wyjawia, że mógł jednym uderzeniem zarazy zetrzeć faraona z powierzchni ziemi, lecz powstrzymał swój gniew ze względu na wyższy cel zbawczy.
21. Wieczny manifest suwerenności — Wj 9:16
„Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi”. Bóg panuje suwerennie nad biegiem historii.
22. Diagnoza pychy (9:17)
„Jeszcze się wynosisz nad mój lud, nie chcąc go wypuścić?” — pycha doczesnego monarchy staje w szranki ze Stwórcą wszechświata.
23. Zapowiedź kataklizmu z nieba (9:18)
PAN zapowiada niespotykany dotąd w historii Egiptu grad, wymierzony w kult bogini niebios Nut oraz bóstwa zjawisk atmosferycznych Seta.
24. Ratunek przez wiarę w Słowo (9:19)
Przed uderzeniem plagi Bóg miłosiernie wskazuje drogę ocalenia: nakazuje zgromadzić ludzi i bydło z pól pod bezpieczny dach domostw.

CZĘŚĆ IV — SIÓDMA PLAGA: OGIEŃ Z GRADEM I OAZA W GOSZEN (Wj 9:20–26)
25. Bojaźń słowa wśród Egipcjan (9:20)
Część dostojników i sług faraona ulękła się Słowa Pańskiego i schroniła swe sługi oraz stada do domów — początek pękania egipskiego monolitu pod wpływem prawdy.
26. Tragedia lekceważenia prawdy (9:21)
Ci, którzy nie wzięli do serca Słowa Pana, pozostawili sługi i bydło na polu, skazując ich na nieuchronną śmierć w nawałnicy.
27. Wyciągnięcie laski ku niebu (9:22–23a)
Na gest Mojżesza niebiosa odpowiadają gromem, błyskawicami i niszczycielską nawałnicą gradu.
28. Ogień biegający po ziemi (9:23b–24)
Niezwykły fenomen fizyczno-duchowy: płomienie ognia i potężne błyskawice przetaczające się wewnątrz brył lodowego gradu.
29. Całkowita dewastacja roślinności (9:25)
Grad miażdży ludzi, zwierzęta, rośliny polne i łamie wszystkie drzewa w całej ziemi egipskiej.
30. Nienaruszalny azyl ziemi Goszen (9:26)
„Tylko w ziemi Goszen, gdzie mieszkali synowie Izraela, gradu nie było” — widzialne świadectwo nienaruszalnej tarczy Bożej łaski.
31. Zniszczenie gospodarki rolnej (9:31)
Len i jęczmień zostały doszczętnie zbite, rujnując przemysł tekstylny i zapasy żywnościowe imperium.
32. Ocalenie pszenicy i orkiszu (9:32)
Boża powściągliwość zostawia jeszcze przestrzeń na upamiętanie — późniejsze zboża nie zostały zniszczone.

CZĘŚĆ V — POZORNY ŻAL FARAONA I POWRÓT DO BUNTU (Wj 9:27–35)
33. Spektakularne wyznanie winy (9:27)
Przerażony nawałnicą król woła: „Tym razem zgrzeszyłem. PAN jest sprawiedliwy, a ja i mój lud jesteśmy niegodziwi”.
34. Błaganie o wstawiennictwo (9:28)
Tyran prosi o modlitwę, obiecując wypuszczenie ludu: „Wstawcie się u PANA, aby ustały Boże grzmoty i grad, bo już dość”.
35. Modlitwa z wyciągniętymi rękami (9:29a)
Mojżesz wychodzi za miasto i wyciąga ręce do Pana w geście arcykapłańskiego orędownictwa.
36. Ziemia należy do PANA (9:29b)
Uciszenie żywiołów ma dowieść, że cały glob ziemski podlega suwerennej władzy Jedynego Stwórcy: „Abyś wiedział, że ziemia należy do PANA”.
37. Przenikliwy wzrok proroka (9:30)
Mojżesz bezbłędnie diagnozuje powierzchowność królewskich deklaracji: „Ale wiem, że ty i twoi słudzy jeszcze nie boicie się PANA Boga”.
38. Natychmiastowe uciszenie żywiołów (9:33)
Na modlitwę Mojżesza grzmoty i grad milkną, a ulewa ustaje — cała przyroda słucha natychmiast swego Władcy.
39. Recydywa grzechu w chwili ulgi (9:34)
Gdy minęło niebezpieczeństwo, faraon „jeszcze bardziej zgrzeszył i zatwardził serce, on i jego słudzy”.
40. Niezłomność proroczego wyroku (9:35)
Król nie wypuszcza Izraela, dokładnie wypełniając Słowo, które PAN zapowiedział przez Mojżesza.

JEZUS W CENTRUM — EWANGELIA W CIENIU OGNISTEGO GRADU
Dziewiąty rozdział Księgi Wyjścia odsłania głębokie prawdy chrystocentryczne, które jaśnieją pełnym blaskiem w Nowym Testamencie:
1. Schronienie przed nadchodzącym gniewem (Wj 9:20–21 a 1 Tes 1:10, Rz 5:9):
Przed uderzeniem niszczycielskiego gradu Bóg dał jednoznaczną instrukcję: kto uląkł się słowa Pana i schronił pod dach, ocalał. Jezus Chrystus jest naszym jedynym i wiecznym Schronieniem! W Nim jesteśmy usprawiedliwieni Jego krwią i całkowicie ocaleni przed gniewem nadchodzącym na bezbożny świat.
2. Wypełnienie Wj 9:16 w Pawłowej teologii łaski (Wj 9:16 a Rz 9:17):
Apostoł Paweł cytuje bezpośrednio Wj 9:16 w Liście do Rzymian 9:17, wykazując suwerenną wolność Boga w historii odkupienia. Pycha ziemskich tyranów staje się tłem, na którym Bóg objawia nieskończoną moc Zmartwychwstania Chrystusa i głosi Ewangelię zbawienia wszystkim narodom ziemi.
3. Pan żywiołów i uciszyciel burzy (Wj 9:23, 33 a Mt 8:26–27):
Gdy Mojżesz wyciągnął ręce do Pana, nawałnica natychmiast ustała. Pan Jezus Chrystus uciszał burzę na Jeziorze Galilejskim jednym autorytatywnym słowem: „Milcz, ucisz się!”. On jest Władcą wszelkiego stworzenia, przed którym drżą moce przyrody i piekła.
4. Prawdziwe upamiętanie zamiast lęku przed karą (Wj 9:27, 34 a 2 Kor 7:10):
Faraon zawołał: „Zgrzeszyłem, PAN jest sprawiedliwy”, lecz gdy ból minął, wrócił do grzechu. Chrystus wzywa nas do prawdziwego nawrócenia serca — nie ze strachu przed gradem sądu, lecz z zachwytu nad Jego miłością i krzyżem, co rodzi trwałą przemianę życia.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 9:3 → Ps 50:10: Bóg jest jedynym Właścicielem bydła na tysiącach gór i suwerennie nim rozporządza.
• Wj 9:4 → Mal 3:18: Boże rozróżnienie między ludem przymierza a tymi, którzy Mu nie służą.
• Wj 9:11 → 2 Tm 3:8–9: Jak Jannes i Jambres sprzeciwiali się Mojżeszowi, tak ich głupota staje się jawna dla wszystkich.
• Wj 9:12 → Rz 1:28: Wydanie zatwardziałego człowieka na pastwę jego własnego spaczonego rozumu.
• Wj 9:16 → Rz 9:17: Cytat Pawła o suwerennym celu Boga w wywyższeniu Jego imienia po całej ziemi.
• Wj 9:20 → Prz 22:3: Roztropny widzi zło i ukrywa się, lecz prostoduszni idą dalej i ponoszą szkodę.
• Wj 9:23 → Ap 16:21: Przepowiednia eschatologicznego sądu wielkiego gradu spadającego z nieba na ludzi.
• Wj 9:26 → Iz 32:18–19: Bezpieczne mieszkanie ludu Bożego w pokoju, nawet gdy grad powali las.
• Wj 9:27 → 1 Sm 15:24: Pozorne wyznanie winy Saula i faraona bez skruchy i bez uświęcenia.
• Wj 9:29 → Ps 24:1: „Do PANA należy ziemia i to, co ją napełnia, świat i jego mieszkańcy”.
• Wj 9:30 → J 2:24–25: Jezus nie powierzał się ludziom, bo sam wiedział, co kryje się w ludzkim sercu.
• Wj 9:34 → 2 P 2:22: Powrót psa do swoich wymiocin — tragiczna stałość nieodrodzonego serca po ustaniu kary.

PRAWDA NA DZIŚ — 8 ZASAD PRZYMIERZA
1. Bóg panuje nad gospodarką: Żadne ziemskie bogactwo, stada ani zasoby nie są bezpieczne poza Bożą łaską i przymierzem (Wj 9:3–6).
2. Bezużyteczność pogańskich bożków: Żadne bóstwa zdrowia ani ziemskie autorytety nie obronią człowieka przed Bożym wyrokiem (Wj 9:11).
3. Cena odrzucenia ostrzeżeń: Gdy człowiek uporczywie zamyka serce przed prawdą, Bóg w końcu utwierdza go w jego własnym wyborze (Wj 9:12).
4. Wyższy Boży cel: Bóg używa nawet oporu swoich wrogów, aby Jego święte Imię stało się znane na całym świecie (Wj 9:16).
5. Wiara reaguje natychmiast: Kto boi się Słowa Pańskiego, szuka natychmiastowego schronienia i ocala swoje życie (Wj 9:20).
6. Nienaruszalny azyl Goszen: Wokół Ciebie może szaleć nawałnica ognia i gradu, lecz w Chrystusie Twoje serce ma nienaruszalny pokój (Wj 9:26).
7. Strach przed karą to nie upamiętanie: Wyznanie „zgrzeszyłem” pod presją bólu nic nie znaczy, jeśli po ustaniu kryzysu wracasz do grzechu (Wj 9:27, 34).
8. Ziemia należy do PANA: Wszelkie stworzenie i żywioły słuchają rozkazu Zbawiciela — to On ma ostatnie słowo w Twoim życiu (Wj 9:29).

POMYŚL — PYTANIA DO REFLEKSJI
1. Czy Twoje poczucie stabilności opiera się na doczesnym „bydle i zasobach”, czy na suwerennej wierności Boga (Wj 9:3)?
2. Jak reagujesz na Boże ostrzeżenia: czy natychmiast szukasz schronienia w Słowie (Wj 9:20), czy ryzykujesz lekceważenie prawdy (Wj 9:21)?
3. Czy dostrzegasz w swoim życiu ochronną tarczę ziemi Goszen pośród kryzysów otaczającego świata (Wj 9:26)?
4. Czy Twoje modlitwy w trudnych chwilach wynikają z pragnienia Bożej świętości, czy tylko z chęci odsunięcia cierpienia (Wj 9:28)?
5. Czy w chwilach ulgi Twoje serce trwa w uświęceniu i posłuszeństwie, czy też ulega pokusie powrotu do starych nawyków (Wj 9:34)?
6. Czy wierzysz, że Bóg ma moc uciszyć każdą nawałnicę ognia i gradu w Twoim życiu rodzinnym i zawodowym (Wj 9:33)?
7. W jaki sposób możesz dziś aktywnie rozgłaszać chwalebne Imię Boga w swoim środowisku (Wj 9:16)?
8. Czy Jezus Chrystus jest Twoim jedynym, niewzruszonym dachem chroniącym przed nadchodzącym sądem?

MAŁY QUIZ — 20 PYTAŃ Z ODPOWIEDZIAMI
1. Jakie nieszczęście zapowiedział Bóg na bydło Egipcjan w Wj 9:3?
Odpowiedź: Potężny pomór i zarazę bardzo ciężką na polach (Wj 9:3).
2. Jakie rozróżnienie uczynił PAN w piątej pladze według Wj 9:4?
Odpowiedź: Między bydłem Izraela a bydłem Egipcjan — ze stad Izraela nic nie zginęło (Wj 9:4).
3. Co uczynił faraon po wygaśnięciu zarazy na bydło w Wj 9:7?
Odpowiedź: Posłał sługi i dowiedział się, że z bydła Izraela nie zginęło ani jedno, lecz zatwardził serce (Wj 9:7).
4. Co Mojżesz i Aaron mieli wziąć w garście przed szóstą plagą (Wj 9:8)?
Odpowiedź: Sadzę z pieca hutniczego (Wj 9:8).
5. W co zamieniła się sadza rzucona ku niebu przed faraonem (Wj 9:9)?
Odpowiedź: W pył wywołujący wrzody i bąble jątrzące się na ludziach i na bydle (Wj 9:9).
6. Dlaczego czarownicy egipscy nie mogli ustać przed Mojżeszem w Wj 9:11?
Odpowiedź: Z powodu wrzodów, które były na nich i na wszystkich Egipcjanach (Wj 9:11).
7. Kto zatwardził serce faraona po szóstej pladze według Wj 9:12?
Odpowiedź: PAN zatwardził serce faraona, jak zapowiedział Mojżeszowi (Wj 9:12).
8. O jakiej porze Mojżesz miał stanąć przed faraonem z kolejnym ostrzeżeniem w Wj 9:13?
Odpowiedź: Wstać rano i stanąć przed faraonem (Wj 9:13).
9. Gdzie Bóg zapowiedział zesłanie wszystkich swoich plag w Wj 9:14?
Odpowiedź: Wprost w twoje serce, na twoje sługi i na twój lud (Wj 9:14).
10. W jakim celu Bóg zachował faraona przy życiu według Wj 9:16?
Odpowiedź: Aby okazać na nim Bożą moc i żeby rozgłaszano Boże imię na całej ziemi (Wj 9:16).
11. Jaki kataklizm zapowiedział PAN na następny dzień około tego czasu w Wj 9:18?
Odpowiedź: Grad bardzo ciężki, jakiego w Egipcie nie było od dnia założenia (Wj 9:18).
12. Co uczynili ci spośród sług faraona, którzy ulękli się słowa PANA (Wj 9:20)?
Odpowiedź: Schronili swoje sługi i swoje bydło do domów (Wj 9:20).
13. Co stało się z ludźmi i bydłem tych, którzy nie wzięli do serca słowa PANA (Wj 9:21)?
Odpowiedź: Zostawili swoje sługi i bydło na polu na pastwę zagłady (Wj 9:21).
14. Co pojawiło się na niebie wraz z gradem, gdy Mojżesz wyciągnął laskę (Wj 9:23–24)?
Odpowiedź: Grzmoty i ogień biegający po ziemi zmieszany z gradem (Wj 9:23–24).
15. Gdzie na całej ziemi egipskiej nie było gradu podczas siódmej plagi (Wj 9:26)?
Odpowiedź: Tylko w ziemi Goszen, gdzie mieszkali synowie Izraela (Wj 9:26).
16. Co wyznał faraon, gdy wezwał Mojżesza i Aarona pośród gradu w Wj 9:27?
Odpowiedź: „Zgrzeszyłem tym razem. PAN jest sprawiedliwy, a ja i mój lud jesteśmy bezbożni” (Wj 9:27).
17. Jaką obietnicę złożył faraon w zamian za modlitwę w Wj 9:28?
Odpowiedź: „Módlcie się do PANA (...), a wypuszczę was i nie będziecie dłużej zatrzymywani” (Wj 9:28).
18. Jakie uprawy zostały zniszczone przez grad, a jakie ocalały (Wj 9:31–32)?
Odpowiedź: Len i jęczmień zostały zniszczone, a pszenica i orkisz ocalały, bo były późne (Wj 9:31–32).
19. O czym wiedział Mojżesz co do faraona i jego sług w Wj 9:30?
Odpowiedź: Że jeszcze nie boją się PANA Boga (Wj 9:30).
20. Jak zareagował faraon, gdy zobaczył, że deszcz, grad i grzmoty ustały (Wj 9:34–35)?
Odpowiedź: Zgrzeszył znowu, zaciął się w uporze wraz ze sługami i nie wypuścił Izraela (Wj 9:34–35).

TWOJA DECYZJA
Dziewiąty rozdział Księgi Wyjścia stawia przed nami zasadniczy wybór: czy będziemy jak słudzy faraona, którzy zlekceważyli Boże Słowo i zostawili swoje stada na pewną zagładę na polach, czy jak ci, którzy w pokorze schronili się pod bezpieczny dach? Faraon płakał z powodu gradu, ale nie chciał porzucić buntu. Prawdziwa wiara to nie chwilowa skrucha w kryzysie, lecz całkowite schronienie życia w Jezusie Chrystusie.
MOJA DECYZJA: Panie Boże Wszechmogący, Królu i Sędzio całej ziemi! Wyznaję, że poza Twoją łaską nie ma dla mnie bezpiecznego miejsca. Odrzucam fałszywy żal faraona, który szukał jedynie ulgi od bólu. Przychodzę do Ciebie z całym moim życiem i chowam się pod bezpieczny dach krwi Jezusa Chrystusa. Postanawiam żyć w bojaźni Twojego Słowa i całym sercem rozgłaszać Twoją chwałę!

MODLITWA NA 9 LISTOPADA
Wszechmogący Boże, Święty i Sprawiedliwy Władco nieba i ziemi!
Dziękujemy Ci za Twoje niezłomne Słowo z dziewiątego rozdziału Księgi Wyjścia. Twoja moc przewyższa wszelką pychę doczesnych władców, a Twoje imię jest godne wiecznej chwały po wszystkich krańcach globu.
Panie Jezu Chryste, dziękujemy Ci, że Ty jesteś naszym schronieniem przed sądem, ogniem i nawałnicą grzechu. Ustrzeż nasze serca przed zwodniczą zatwardziałością faraona. Nie pozwól, byśmy szukali Ciebie jedynie jako koła ratunkowego w cierpieniu, lecz napełnij nas duchem szczerej bojaźni Bożej i trwałego posłuszeństwa.
Błogosław nasze rodziny, nasze domy i zbory, czyniąc z nich oazę ziemi Goszen. Daj nam odwagę wierzyć Twojemu Słowu bez zwłoki i rozgłaszać Twoją potęgę pośród zagubionego świata. Tobie cześć, chwała i dziękczynienie na wieki wieków. Amen!

ZADANIE NA DZIŚ
1. Przeczytaj osobiście cały dziewiąty rozdział Księgi Wyjścia (Wj 9:1–35) w przekładzie UBG.
2. Zbadaj swoje serce: czy Twoje wołanie do Boga w kryzysie nie jest powierzchownym szukaniem ulgi jak u faraona?
3. Zastanów się, czy chronisz swoje życie pod dachem Słowa Bożego (Wj 9:20), czy wystawiasz się na niebezpieczeństwo pól.
4. Przeczytaj Rz 9:17 i rozważ suwerenność Boga w rozgłaszaniu Jego imienia na całej ziemi.
5. Podziękuj Chrystusowi za Jego krew, która jest Twoim wiecznym Goszen chroniącym przed gniewem.
6. Zapisz konkretne postanowienie trwałego uświęcenia w codzienności po ustaniu życiowych burz.
7. Podziel się dzisiejszym rozważaniem z kimś, kto zmaga się z lękiem przed nadchodzącą burzą życiową.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 10 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 41 — „PLAGI SZARAŃCZY I CIEMNOŚCI EGIPSKIEJ (WJ 10:1–29)”
Czytanie: Wj 10:1–29. Dwie przedostatnie plagi przed sądem nad pierworodnymi. Chmary niszczycielskiej szarańczy pożerające resztki plonów oraz przerażająca trzydniowa ciemność dotykalna w całym Egipcie, podczas gdy w domach synów Izraela jaśniało Boże światło.`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day40-lesson.txt
const scriptsContentDir = path.join(process.cwd(), 'scripts/content');
if (!fs.existsSync(scriptsContentDir)) {
  fs.mkdirSync(scriptsContentDir, { recursive: true });
}
fs.writeFileSync(path.join(scriptsContentDir, 'kc-day40-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day40-lesson.txt');

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
      // Metryka & Tytuł
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

      // Ramka Tekst Pamięciowy
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

      // Parsowanie akapitów i nagłówków z tekstu lekcji
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
        
        // Numerowane podsekcje (np. "1. Tytuł (9:1)")
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

// Zapisujemy .docx na Pulpit
const docxPathDesktop = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxPathDrive = `H:/Mój dysk/OA - orkiestracja Agentowa/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPathDesktop, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPathDesktop} (${buf.length} bajtów)`);

try {
  if (fs.existsSync(path.dirname(docxPathDrive))) {
    fs.writeFileSync(docxPathDrive, buf);
    console.log(`✅ Skopiowano plik DOCX na Google Drive @OA: ${docxPathDrive}`);
  }
} catch (e) {
  console.warn('⚠️ Google Drive @OA niedostępny:', e.message);
}

// 3. Budujemy 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 40 (9 listopada 2026): Pomór bydła, wrzody i ogień z gradem — Boża moc ponad pychą faraona (Wj 9:1–35)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty

Czy zauważyłeś kiedyś, że człowiek potrafi wołać do Boga w rozpaczy, składać uroczyste obietnice poprawy, a gdy tylko burza minie i wraca spokój, natychmiast zapomina o swoich słowach i wraca do starego życia?

Zatrzymaj się w ten poniedziałkowy poranek, dziewiątego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w kochające oblicze Twojego Ojca w niebie. Pozwól, by w ciszy Twojego serca wybrzmiało to osobiste pytanie: Tato, czy moje nawrócenie jest trwałą przemianą serca z miłości do Ciebie, czy też szukam Ciebie jedynie jako bezpiecznego dachu w czasie życiowych nawałnic, a potem powracam do własnych dróg?

W dziewiątym rozdziale Księgi Wyjścia Boża konfrontacja z pychą faraona wchodzi w fazę druzgocących uderzeń w fundamenty imperium. Bóg zsyła trzy kolejne plagi: pomór na bydło, ropiejące wrzody z sadzy pieca oraz bezprecedensowy grad zmieszany z ogniem. Giną konie, osły, wielbłądy i stada Egipcjan — uderzenie w bóstwa Apisa i Hathor. Czarownicy pokryci wrzodami nie mogą nawet ustać przed Mojżeszem. A wreszcie niebo odpowiada grzmotem, błyskawicami i lodem niszczącym wszelką roślinność.

I pośród tej grozy Bóg wypowiada słowa o fundamentalnym znaczeniu dla całej historii zbawienia: Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi! Pycha ziemskich władców i opór mocarstw nie są w stanie pokrzyżować Bożego planu. Co więcej, przed uderzeniem gradu Bóg daje ratunek: kto ze sług faraona uląkł się słowa Pana, schronił swoje sługi i bydło do domów. A w ziemi Goszen, gdzie mieszkał Boży lud, gradu nie było!

Gdy burza szaleje, przerażony faraon woła: Zgrzeszyłem! Pan jest sprawiedliwy, a ja i mój lud jesteśmy bezbożni. Lecz Mojżesz wie, że to tylko strach przed bólem, a nie skrucha. Gdy tylko nawałnica ustała, król powrócił do grzechu.

W Jezusie Chrystusie ta prawda staje się naszą wieczną nadzieją. Chrystus jest naszym jedynym i bezpiecznym Schronieniem przed nadchodzącym sądem! On wziął na siebie nawałnicę Bożego gniewu na krzyżu Golgoty. W Nim jesteś bezpieczny jak w ziemi Goszen. Nie bądź jak faraon, który wracał do zatwardziałości. Wybierz dziś pełne posłuszeństwo i oddaj swoje życie Zbawicielowi. Błogosławionego, pełnego pokoju i zwycięstwa poniedziałku!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 40 (9 listopada 2026 r.)
📖 Księga Wyjścia 9:1–35: Pomór bydła, wrzody i ogień z gradem — Boża moc ponad pychą faraona

Czy wiesz, co odróżnia prawdziwe nawrócenie od chwilowej skruchy wywołanej strachem przed karą?

W 40. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 9. rozdział Księgi Wyjścia (Wj 9:1–35: https://polskieradio.cc/mojabiblia?ref=Wj9:1-35). Starcie z panteonem Egiptu wkracza w fazę druzgocących uderzeń w gospodarkę, medycynę i kult bóstw natury.

Kluczowe filary dzisiejszego studium:

1. Piąta plaga — pomór bydła na polach (Wj 9:1–7):
Sąd uderza w konie rydwanów, osły, wielbłądy i stada — podstawę gospodarki i wojskowości Nilu. Bóg demaskuje fałsz kultu świętego byka Apisa i bogini krowy Hathor. Wszystkie stada Izraela w ziemi Goszen pozostają nietknięte — z bydła Hebrajczyków nie ginie ani jedno zwierzę!

2. Szósta plaga — sadza z pieca i wstydliwe wrzody (Wj 9:8–12):
Piece hutnicze, w których Izraelici wypalali niewolnicze cegły, stają się narzędziem sądu. Drobny pył wywołuje ropiejące wrzody (hebr. szchin). Egipscy magowie (hartummim) ponoszą ostateczną klęskę prestiżową: z powodu bolesnych ran nie mogą nawet ustać przed Mojżeszem!

3. Teologiczny manifest historii zbawienia (Wj 9:13–19):
Wj 9:16 zawiera jedno z najważniejszych oświadczeń Starego Testamentu: „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi”. Apostoł Paweł w Rz 9:17 cytuje ten werset, wskazując na absolutną suwerenność Boga ponad pychą ziemskich mocarstw.

4. Siódma plaga — zstąpienie ognistego gradu i zasada schronienia (Wj 9:20–26):
Bóg zapowiada bezprecedensowy grad zmieszany z błyskawicami ognia. Po raz pierwszy pojawia się ratunek przez wiarę w Słowo: kto ze sług faraona uląkł się słowa PANA, wprowadził sługi i bydło pod dach i ocalał! Ziemia Goszen znów jaśnieje nienaruszalnym pokojem.

5. Pozorny żal faraona i prawdziwe Schronienie w Chrystusie (Wj 9:27–35):
Przerażony nawałnicą faraon woła: „Zgrzeszyłem tym razem. PAN jest sprawiedliwy!”. Lecz gdy grad ustał, jego serce natychmiast powróciło do buntu. Prawdziwe upamiętanie rodzi się z miłości, a nie ze strachu przed bólem. W Jezusie Chrystusie mamy wieczne Schronienie (1 Tes 1:10) — On osłania nas przed nawałnicą sądu!

Kompletna lekcja biblijna z 40 punktami egzegezy, studium porównawczym, 20 pytaniami quizu i autozapisem decyzji:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-40

Błogosławionego poniedziałku w cieniu zwycięskiego Zbawiciela! 🕊️

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 40 (Wj 9:16): „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi”. Żadna ludzka pycha nie zatrzyma Bożego planu, a w Chrystusie masz wieczne schronienie przed każdą burzą jak w ziemi Goszen. Trwaj w Bożej wierności! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym grafika 16:9: potężna nawałnica ognistego gradu uderzająca w pałac faraona i świątynie pogańskie, podczas gdy w tle kraina Goszen pozostaje rozświetlona cichym, złotym blaskiem niebios. Tytuł: DZIEŃ 40 — MOC BOGA PONAD PYCHĄ FARAONA.

[INTRO: STARCE Z POTĘGĄ NATURY I PYCHĄ IMPERIUM]
Noemi: Dzień dobry! Witamy państwa w czterdziestym dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Dziś wkraczamy w dziewiąty rozdział Księgi Wyjścia — moment, w którym Boży sąd uderza w fundamenty egipskiej potęgi z siłą, jakiej ten świat jeszcze nie widział!
Sara: Witamy bardzo serdecznie! Wczoraj widzieliśmy palec Boży i rozróżnienie ziemi Goszen. Dziś oglądamy trzy kolejne potężne plagi: pomór bydła, wstydliwe wrzody na ludziach i kapłanach, a wreszcie niszczycielski grad zmieszany z ogniem!

[ANALIZA PROBLEMOWA: KAPITULACJA MAGÓW I ZASADA SCHRONIENIA]
Noemi: Zobaczmy najpierw szóstą plagę: Mojżesz bierze garść sadzy z pieca hutniczego — tego samego, przy którym Izraelici niewolniczo cierpieli — i rzuca ją ku niebu. I nagle w całym Egipcie wybuchają wrzody! A co dzieje się z czarownikami, którzy wcześniej próbowali naśladować cuda? Pismo mówi wprost: nie mogli nawet ustać przed Mojżeszem! Cała pogańska elita medyczna i religijna została powalona na kolana!
Sara: A potem siódma plaga — ogień biegający po ziemi wewnątrz gradu. Ale zobaczmy to niesamowite miłosierdzie Boga: zanim grad spadł, Bóg dał ostrzeżenie! Powiedział: kto schroni sługi i bydło pod dach, ocali życie. I część Egipcjan posłuchała! To pokazuje, że Boże Słowo zawsze daje drogę ocalenia temu, kto wierzy i szuka schronienia!

[SZCZYT CHRYSTOCENTRYCZNY: CHRYSTUS NASZYM SCHRONIENIEM]
Noemi: I spójrzmy na faraona: gdy spada ognisty grad, król woła: „Zgrzeszyłem! Pan jest sprawiedliwy!”. Ale gdy tylko Mojżesz modli się i burza ustaje, faraon natychmiast wraca do zatwardziałości.
Sara: To przestroga przed fałszywym żalem ze strachu przed cierpieniem. Jezus Chrystus wzywa nas do prawdziwego nawrócenia. On jest naszym Schronieniem przed nadchodzącym sądem! W Nim jesteśmy ocaleni i bezpieczni!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Sara: Nasze hasło na dziś: „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi” (Wj 9:16).
Noemi: Otwórzcie dziś dziewiąty rozdział na polskieradio.cc/akademia. Zbadajcie swoje serce: czy Wasza wiara opiera się na szczerej miłości do Zbawiciela, czy tylko na strachu przed trudnościami? Odpocznijcie pod dachem Bożej łaski!

[MODLITWA BOJOWA]
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci za Twoją suwerenną potęgę i za Jezusa Chrystusa, w którym mamy wieczne schronienie. Ustrzeż nasze serca przed uporem faraona i daj nam trwać w wierności Twojemu Słowu każdego dnia. Amen!”

[OUTRO]
Noemi: Kompletne materiały, quiz wiedzy i komentarz werset po wersecie znajdziecie bezpłatnie na polskieradio.cc.
Sara: Do zobaczenia jutro w dziesiątym rozdziale Księgi Wyjścia! Z Biblią za Pan Brat!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: SUWERENNOŚĆ BOGA W OBLICZU PYCHY IMPERIUM: EGZEGEZA TEOLOGICZNA WJ 9:1–35

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 9 listopada 2026 r.

W ramach ogólnopolskiego programu formacji biblijnej „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje egzegetyczne studium dziewiątego rozdziału Księgi Wyjścia. Rozdział ten dokumentuje trzecią fazę konfrontacji teologicznej pomiędzy Bogiem JAHWE a panteonem imperium egipskiego, obejmując pomór bydła (Wj 9:1–7), plagę wrzodów (Wj 9:8–12) oraz niszczycielski kataklizm ognistego gradu (Wj 9:13–35).

1. DESTRUKCJA GOSPODARKI I KULTU BYDŁA (WJ 9:1–7)
Piąta plaga uderzyła bezpośrednio w fundamenty gospodarki rolnej i militarnej Nilu (konie rydwanów, woły pociągowe, osły i owce). Był to bezpośredni sąd nad kultem byka Apisa (czczonego w Memfis jako żywe wcielenie boga Ptaha) oraz bogini Hathor. Suwerenne wyznaczenie terminu („jutro”) oraz absolutna nietykalność stad w ziemi Goszen wykluczają naturalną etiologię epizootii.

2. PARALIŻ KASTY KAPŁAŃSKIEJ: SADZA Z PIECA I WRZODY (WJ 9:8–12)
Rzucenie sadzy z pieca hutniczego — symbolu niewolniczej katorgi Hebrajczyków — wywołało jątrzące się bąble (szchin). Plaga ta zdemaskowała bezsilność egipskich bóstw medycyny (Imhotepa i Sechmet). Egipscy magowie (hartummim) ponieśli ostateczną klęskę prestiżową: z powodu ran nie mogli nawet ustać przed Mojżeszem, co oznaczało ich rytualne i fizyczne wykluczenie ze służby państwowej.

3. MANIFEST TEOLOGICZNY HISTORII ZBAWIENIA (WJ 9:13–19)
Werset Wj 9:16 stanowi jeden z najważniejszych tekstów teologicznych Starego Testamentu: „Lecz dlatego cię postawiłem, aby okazać na tobie moją moc i żeby rozgłaszano moje imię na całej ziemi”. Tekst ten, zacytowany przez apostoła Pawła w Rz 9:17, obnaża iluzję autonomii ludzkiego władcy. Bóg nie usuwa faraona jednym uderzeniem, lecz czyni go areną objawienia Bożej sprawiedliwości i suwerennej łaski.

4. FENOMEN OGIEŃ Z GRADEM I ZASADA SCHRONIENIA (WJ 9:20–26)
Siódma plaga łączyła dwa przeciwstawne żywioły: lód i ogień błyskawic. Przed uderzeniem kataklizmu Bóg dał możliwość ocalenia każdemu, kto uląkł się Jego Słowa — zapowiadając nowotestamentową zasadę usprawiedliwienia z wiary. Kraina Goszen pozostała nietknięta, manifestując nienaruszalne bezpieczeństwo ludu przymierza.

5. DIALEKTYKA POZORNEGO ŻALU (WJ 9:27–35)
Wyznanie faraona: „Zgrzeszyłem tym razem. PAN jest sprawiedliwy” stanowi klasyczny przykład attritionis — żalu ze strachu przed karą doczesną, pozbawionego miłości do Boga. Ustanie sądu na modlitwę Mojżesza skutkowało natychmiastowym powrotem tyrana do zatwardziałości serca, potwierdzając diagnozę proroka: „Wiem, że jeszcze nie boicie się PANA Boga”.

📌 PODSUMOWANIE REDAKCYJNE CCN
Dziewiąty rozdział Księgi Wyjścia objawia, że jedynym bezpiecznym miejscem pośród burz historii jest schronienie pod dachem Bożej łaski. W Jezusie Chrystusie wierzący znajdują wieczne Goszen — ocalenie od sądu i wolność od zatwardziałości tego świata.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl
`;

fs.writeFileSync(path.join(scriptsContentDir, 'pakiet-day40-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day40-5wersji.md');

// 4. Dopisujemy do bazy rozwazania_baza.md w Wektor1_VideoFactory
const bazaPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(bazaPath)) {
  const currentBaza = fs.readFileSync(bazaPath, 'utf8');
  if (!currentBaza.includes('Dzień 40 (9 listopada 2026)')) {
    fs.appendFileSync(bazaPath, '\n\n' + pakiet5Wersji, 'utf8');
    console.log('✅ Dopisano pakiet do rozwazania_baza.md');
  } else {
    console.log('ℹ️ Pakiet Dnia 40 już znajduje się w rozwazania_baza.md');
  }
}

// 5. Korygujemy drobne komentarze w dzien-40.html i synchronizujemy 4 ścieżki
const day40HtmlPath = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-40.html');
if (fs.existsSync(day40HtmlPath)) {
  let html = fs.readFileSync(day40HtmlPath, 'utf8');
  html = html.replace('<!-- SCRIPTURE SECTION (Wj 8:1–32) -->', '<!-- SCRIPTURE SECTION (Wj 9:1–35) -->');
  html = html.replace('// ── QUIZ LOGIC (20 PYTAŃ Z WJ 8:1–32) ──', '// ── QUIZ LOGIC (20 PYTAŃ Z WJ 9:1–35) ──');
  
  const cleanPaths = [
    day40HtmlPath,
    path.join(process.cwd(), 'akademia/kurscodzienny/dzien-40/index.html'),
    path.join(process.cwd(), 'kursy/kurscodzienny/dzien-40.html'),
    path.join(process.cwd(), 'kursy/kurscodzienny/dzien-40/index.html')
  ];

  for (const p of cleanPaths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, html, 'utf8');
  }
  console.log('✅ Zsynchronizowano 4 ścieżki Clean URLs dla Dnia 40');
}

console.log('🎉 Komplet lekcji, DOCX i 5-wersyjnego pakietu Dnia 40 wygenerowane pomyślnie!');
