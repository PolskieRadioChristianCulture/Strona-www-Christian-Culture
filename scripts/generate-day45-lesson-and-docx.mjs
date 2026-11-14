import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 45: Wj 15:1–27 (14 listopada 2026, Sobota)
const DAY_NUM = 45;
const DATE_STR = '2026-11-14';
const DATE_FORMATTED = 'Sobota, 14 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 15:1–27';
const TITLE = 'PIEŚŃ ZWYCIĘSTWA I GORZKIE WODY MARA — PAN TWOIM LEKARZEM';
const SUBTITLE = 'Triumf nad egipskim wojskiem, pieśń Miriam i przemiana gorzkich wód w słodkie (Wj 15:1–27)';
const MEMORY_VERSE = '„PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem. To mój Bóg, dlatego zbuduję mu przybytek, to Bóg mego ojca, dlatego będę go wywyższał.” (Wj 15:2, UBG)';
const THEME = 'Piętnasty rozdział Księgi Wyjścia ukazuje najstarszą i najbardziej przejmującą pieśń odkupienia w Piśmie Świętym. Po przejściu przez Morze Czerwone Mojżesz i Izrael wielbią Boga za Jego absolutną suwerenność i ocalenie, a Miriam prorokini z bębenkiem w ręku przewodzi chórowi dziękczynienia. Jednak zaledwie trzy dni później na pustyni Szur lud staje w obliczu gorzkich wód Mara. Na krzyk Mojżesza Bóg wskazuje niezwykłe drzewo, które wrzucone do wody czyni ją słodką i zdatną do picia. Bóg objawia tam Swoje przymierze uzdrowienia: JAHWE RAFFA — „Ja jestem PAN, który cię uzdrawia” (Wj 15:26). Krzyż Jezusa Chrystusa jest tym Bożym drzewem, które przemienia każdą ludzką gorycz, lęk i zranienie w źródło słodkiej, uzdrawiającej łaski.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 45 (Wj 15:1–27)...');

// ── 1. CZYTANIE DNIA (UBG) ──
const exo15Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-015.json');
const exo15Data = JSON.parse(fs.readFileSync(exo15Path, 'utf8'));

const readingVerses = exo15Data.verses.map(v => ({ ref: `Wj 15:${v.number}`, num: v.number, text: v.text }));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 15:1–21 — Pieśń Mojżesza i Miriam przy Morzu Czerwonym</h3></div>',
  ...exo15Data.verses.filter(v => v.number <= 21).map(v => `<p><span class="verse-num">15:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 15:22–27 — Gorzkie wody w Mara i Boże przymierze uzdrowienia</h3></div>',
  ...exo15Data.verses.filter(v => v.number >= 22).map(v => `<p><span class="verse-num">15:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 45 (14 listopada 2026): Pieśń Zwycięstwa i Gorzkie Wody Mara — PAN Twoim Lekarzem (Wj 15:1–27)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Piąty

Czy doświadczyłeś kiedyś w swoim życiu sytuacji, w której po wielkiej radości i duchowym uniesieniu nagle pojawiło się gorzkie rozczarowanie, zmęczenie i pragnienie?

Zatrzymaj się w ten sobotni poranek, czternastego listopada dwa tysiące dwudziestego szóstego roku, i wsłuchaj się w kojący głos Twojego Niebiańskiego Ojca. Zapytaj w głębi serca: Panie, czy umiem śpiewać Twoją chwałę nie tylko nad brzegiem rozstąpionego morza, ale także wtedy, gdy staję przed gorzką wodą moich codziennych trudności?

W piętnastym rozdziale Księgi Wyjścia widzimy dwie niezwykle wymowne sceny. Najpierw Mojżesz, Miriam i cały uratowany Izrael wznoszą potężną pieśń uwielbienia: Pan jest moją mocą i pieśnią, stał się moim zbawieniem! Konia i jeźdźca pogrążył w odmętach! To radość ludu, który na własne oczy ujrzał koniec niewoli. Lecz po trzech dniach wędrówki przez pustynię Szur Izrael dociera do Mara — a tam woda jest gorzka i niezdatna do picia. Zamiast pieśni pojawia się szemranie i zwątpienie. Mojżesz nie kłóci się z ludem, lecz woła do Pana. A Bóg wskazuje mu drzewo, które wrzucone w gorzką toń czyni ją natychmiast słodką i ożywczą. To w Mara Bóg składa obietnicę: Ja jestem Pan, Twój Lekarz!

Drogi Bracie, Droga Siostro! W Jezusie Chrystusie ta prawda zajaśniała w pełni na wzgórzu Golgoty. To drzewo Krzyża Chrystusowego, wrzucone w gorzkie wody ludzkiego grzechu, bólu, samotności i choroby, odbiera im wszelką truciznę i przemienia je w zdroje wody żywej wytryskującej ku życiu wiecznemu! Niezależnie od tego, jaka gorycz spotkała Cię w minionym tygodniu, przynieś ją dziś do stóp Zbawiciela. On jest Twoim Uzdrowicielem. Błogosławionego, spokojnego i pełnego Bożej obecności sobotniego odpoczynku z Bogiem!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 45 (14 listopada 2026 r.)
📖 Księga Wyjścia 15:1–27: Pieśń Zwycięstwa i Gorzkie Wody Mara — PAN Twoim Lekarzem

Czy wiesz, w jaki sposób Bóg przemienia największą ludzką gorycz w źródło uzdrowienia i życia?

W 45. dniu naszej wielkiej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) stajemy wraz z Izraelem na brzegu Morza Czerwonego, a następnie wkraczamy w pustynię Szur (Wj 15:1–27: https://polskieradio.cc/mojabiblia?ref=Wj15:1-27).

Kluczowe filary dzisiejszego studium:
1. Pieśń Mojżesza i Odkupionych (Wj 15:1–19): Pierwszy hymn biblijny sławiący triumf Boga nad pychą wrogów. PAN jest wojownikiem, Bogiem chwalebnym w świętości i czyniącym cuda.
2. Pieśń Miriam i taniec uwielbienia (Wj 15:20–21): Miriam prorokini, siostra Aarona, bierze bębenek, a wszystkie niewiasty wychodzą za nią z tańcem, ogłaszając chwałę Boga.
3. Próba wiary w Mara (Wj 15:22–24): Po trzech dniach marszu bez wody lud dociera do Mara, lecz woda jest gorzka (stąd nazwa Mara). Szemranie ujawnia, jak szybko człowiek zapomina o wielkich cudach ocalenia.
4. Drzewo życia i Jahwe Raffa (Wj 15:25–27): Mojżesz woła do PANA, a Bóg ukazuje drzewo, które wrzucone do wody czyni ją słodką. Bóg ustanawia przymierze uzdrowienia: „Ja jestem PAN, który cię uzdrawia” (Wj 15:26). Z Mara lud przechodzi do Elim — oazy z dwunastoma źródłami wód i siedemdziesięcioma palmami.

Studiuj pełny tekst, kody Stronga i komentarz werset po wersecie:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-45

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 45 (Wj 15:2): „PAN moją mocą i chwałą, bo stał się moim zbawieniem”. Bóg przemienia każdą gorycz w Mara w słodycz życia. On jest Twoim Lekarzem! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym monumentalna grafika 16:9: Miriam z bębenkiem wzniesionym w dłoni na brzegu Morza Czerwonego, w tle kobiety tańczące z uwielbieniem i Mojżesz wznoszący ręce ku niebiosom, a w dali pustynia Szur i oaza z palmami Elim. Tytuł: DZIEŃ 45 — PIEŚŃ ZWYCIĘSTWA I GORZKIE WODY MARA: PAN TWOIM LEKARZEM.

[INTRO: OD TRIUMFU DO PRÓBY PUSTYNI]
Noemi: Dzień dobry! Witamy państwa w czterdziestym piątym dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Dziś otwieramy piętnasty rozdział Księgi Wyjścia — rozdział, który zaczyna się najwspanialszą pieśnią odkupienia, a kończy wstrząsającą próbą wiary przy gorzkich wodach Mara!
Sara: Witamy bardzo serdecznie! Po przejściu przez Morze Czerwone Izrael nie mógł milczeć. Narodziła się pieśń, która brzmi w Piśmie Świętym aż po Księgę Objawienia — Pieśń Mojżesza i Pieśń Baranka. Ale zaledwie trzy dni później przychodzi pragnienie i szemranie. Jak łatwo zapominamy o cudach, gdy wysycha nasze gardło!

[ANALIZA PROBLEMOWA: DRZEWO W MARA I JAHWE RAFFA]
Noemi: Zwróćmy uwagę na to, co wydarzyło się w Mara. Lud nie mógł pić wody, bo była gorzka. I co robi Mojżesz? Nie organizuje buntu, nie usprawiedliwia się, lecz woła do Boga. A Bóg nie stwarza nowego źródła z niczego, lecz wskazuje drzewo. Drzewo wrzucone w gorzką toń czyni ją słodką!
Sara: I właśnie tam Bóg objawia swoje imię przymierza: JAHWE RAFFA — „Ja jestem Pan, Twój Lekarz!”. Bóg nie obiecuje nam życia bez pustyni, ale obiecuje, że każdą gorycz potrafi uzdrowić i przemienić w źródło błogosławieństwa, a zaraz za Mara czeka oaza Elim z dwunastoma źródłami i siedemdziesięcioma palmami!

[SZCZYT CHRYSTOCENTRYCZNY: KRZYŻ GOLGOTY]
Noemi: I tutaj widzimy niesamowity cień Krzyża Chrystusa. Apostoł Piotr pisze, że Chrystus nasze grzechy poniósł w swoim ciele na drzewie, abyśmy Jego ranami zostali uzdrowieni!
Sara: To krzyż Golgoty jest tym świętym drzewem, które wrzucone w nasze zranione relacje, w naszą przeszłość, w chorobę i ból serca — odbiera gorycz i wlewa pokój oraz życie wieczne!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Sara: Nasze hasło na dziś: „PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem!” (Wj 15:2).
Noemi: Wejdźcie dziś na polskieradio.cc/akademia, rozwiążcie dwadzieścia pytań quizu i zbadajcie swoje serca: czy pozwalasz Bogu uzdrowić Twoje gorzkie Mara?

[MODLITWA BOJOWA]
Noemi i Sara razem: „Ojcze Niebieski, dziękujemy Ci, że jesteś naszym Zbawicielem i Wojownikiem! Dziękujemy, że w Jezusie Chrystusie objawiłeś się jako JAHWE RAFFA — nasz Boski Lekarz. Zanurz Krzyż Twojego Syna w każdej goryczy naszego życia. Daj nam serca pełne pieśni chwały i poprowadź nas do zdrojów żywej wody. W imieniu Jezusa Chrystusa. Amen!”

[OUTRO]
Noemi: Pełne materiały, kody Stronga i analizę egzegetyczną znajdziecie bezpłatnie na polskieradio.cc.
Sara: Do zobaczenia jutro w szesnastym rozdziale Księgi Wyjścia — Manna z nieba i świętość Szabatu! Z Biblią za Pan Brat!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: DOKSOLOGIA WYZWOLENIA, TEODYCEA PRÓBY I JAHWE RAFFA: EGZEGEZA TEOLOGICZNA WJ 15:1–27

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 14 listopada 2026 r.

W ramach programu formacji biblijnej „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje studium egzegetyczne piętnastego rozdziału Księgi Wyjścia. Rozdział ten stanowi literacki i teologiczny pomost pomiędzy historycznym cudem Morza Czerwonego a formacją przymierza na pustyni. Łączy on najstarszy poetycki hymn biblijny (Pieśń Morza, hebr. Szirat HaJam) z pierwszą próbą wierności w Mara, gdzie Bóg inauguruje przymierze uzdrowienia pod imieniem JAHWE RAFFA.

1. ARCHITEKTURA LITERACKA I DOKSOLOGIA „PIEŚNI MORZA” (WJ 15:1–19)
Pieśń Mojżesza (Wj 15:1–19) to arcydzieło hebrajskiej poezji archaicznej. Jej motywem przewodnim jest absolutna suwerenność Boga: „PAN jest mężem wojny, JAHWE to Jego imię” (15:3). Tekst nie gloryfikuje Mojżesza ani odwagi ludu, lecz koncentruje się wyłącznie na Prawicy Pana, która skruszyła pychę rydwanów faraona. Doksologia osiąga szczyt w wyznaniu unikalności Boga: „Któż jest jak Ty wśród bogów, PANIE? Chwalebny w świętości, straszliwy w chwałach, czyniący cuda!” (15:11).

2. PROFETALNY WYMIAR PIEŚNI MIRIAM (WJ 15:20–21)
Pojawienie się Miriam z bębenkiem (hebr. tof) na czele niewiast stanowi inaugurację profetycznej posługi kobiet w Izraelu. Miriam określona jest jako „prorokini” (hebr. nebi'a) i siostra Aarona. Jej antyfona powtarza rdzeń hymnu Mojżesza, potwierdzając, że uwielbienie w ludzie Bożym ma charakter responsoryjny, wspólnotowy i angażujący całą osobę — w pieśni i tańcu.

3. DIALEKTYKA PUSTYNI: OD EKSTAZY DO ROZCZAROWANIA W MARA (WJ 15:22–24)
Przejście z Morza Czerwonego na pustynię Szur ujawnia kruchość ludzkiego entuzjazmu. Trzy dni marszu bez wody doprowadzają lud do kryzysu fizycznego i duchowego. Gdy napotykają wody Mara, okazują się one gorzkie (hebr. mar). Lud natychmiast ulega pokusie szemrania (hebr. lun), kwestionując sens Bożego prowadzenia. Próba w Mara dowodzi, że samo doświadczenie wielkich cudów nie przekształca automatycznie natury człowieka; konieczna jest codzienna szkoła zaufania.

4. TEOLOGIA DRZEWA UZDRAWIAJĄCEGO I PRZYMIERZE JAHWE RAFFA (WJ 15:25–26)
W odpowiedzi na krzyk Mojżesza Bóg wskazuje mu drzewo (hebr. ec), które wrzucone w toń usuwa z wód gorycz i czyni je zdatnymi do picia. Wydarzenie to staje się fundamentem pod ogłoszenie ustawy i przymierza. Bóg objawia się pod imieniem JAHWE RAFFA („Ja jestem PAN, który cię uzdrawia” — 15:26). Uzdrowienie wód jest znakiem gotowości Boga do leczenia całego człowieka — jego ciała, emocji i relacji — pod warunkiem posłuszeństwa przykazaniom przymierza.

5. OAZA ELIM JAKO ZAPOWIEDŹ ESCHATOLOGICZNEGO ODPOCZNIENIA (WJ 15:27)
Bezpośrednio po próbie w Mara Bóg przyprowadza Izrael do Elim — oazy z dwunastoma źródłami wody (odpowiadającymi dwunastu plemionom) i siedemdziesięcioma palmami (odpowiadającymi siedemdziesięciu starszym). Elim jest pedagogicznym dowodem, że Boże próby nie mają na celu zniszczenia człowieka, lecz przygotowanie go na wejście w pełnię Bożego zaopatrzenia.

6. CHRYSTOCENTRYCZNA PEŁNIA ODKUPIENIA
W perspektywie Nowego Testamentu Pieśń Mojżesza łączy się z Pieśnią Baranka w Obj 15:3, gdzie odkupieni stoją nad szklanym morzem, wielbiąc Boga za ostateczny triumf nad szatanem. Z kolei drzewo wrzucone w gorzkie wody Mara stanowi profetyczny typ Krzyża Golgoty: Chrystus wziął na siebie gorycz przekleństwa i grzechu (Gal 3:13), a Jego rany stały się źródłem wiecznego uzdrowienia (1 P 2:24).

📌 PODSUMOWANIE REDAKCYJNE CCN
Piętnasty rozdział Księgi Wyjścia objawia sedno wiary pielgrzymiej: ten sam Bóg, który zwycięża potęgi tego świata, pochyla się nad ludzkim pragnieniem na pustyni i uczy nas, że Krzyż Zbawiciela uzdrawia każdą gorzką wodę doczesności.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl`;

// ── 3. TEKST LEKCJI DLA DOCX ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 45
PIEŚŃ ZWYCIĘSTWA I GORZKIE WODY MARA — PAN TWOIM LEKARZEM
Triumf nad egipskim wojskiem, pieśń Miriam i przemiana gorzkich wód w słodkie (Wj 15:1–27)
Sobota, 14 listopada 2026 r.  |  Czytanie: Wj 15:1–27
TEKST PAMIĘCIOWY: „PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem. To mój Bóg, dlatego zbuduję mu przybytek, to Bóg mego ojca, dlatego będę go wywyższał.” (Wj 15:2, UBG)
MYŚL PRZEWODNIA: Piętnasty rozdział Księgi Wyjścia ukazuje najstarszą i najbardziej przejmującą pieśń odkupienia w Piśmie Świętym. Po przejściu przez Morze Czerwone Mojżesz i Izrael wielbią Boga za Jego absolutną suwerenność i ocalenie, a Miriam prorokini z bębenkiem w ręku przewodzi chórowi dziękczynienia. Jednak zaledwie trzy dni później na pustyni Szur lud staje w obliczu gorzkich wód Mara. Na krzyk Mojżesza Bóg wskazuje niezwykłe drzewo, które wrzucone do wody czyni ją słodką i zdatną do picia. Bóg objawia tam Swoje przymierze uzdrowienia: JAHWE RAFFA — „Ja jestem PAN, który cię uzdrawia” (Wj 15:26). Krzyż Jezusa Chrystusa jest tym Bożym drzewem, które przemienia każdą ludzką gorycz, lęk i zranienie w źródło słodkiej, uzdrawiającej łaski.

ZANIM OTWORZYSZ BIBLIĘ
Piętnasty rozdział Księgi Wyjścia przenosi nas w jeden z najbardziej poruszających momentów historii zbawienia. Wczoraj staliśmy nad brzegiem spienionego Morza Czerwonego, widząc potężną armię faraona w rydwanach, która zamknęła drogę ucieczki bezbronnemu ludowi. Widzieliśmy laskę Mojżesza wyciągniętą nad wodami, wschodni wiatr rozdzielający toń na dwoje i bezpieczne przejście Izraela po suchym dnie. O świcie fale zalały egipskich najeźdźców, kładąc kres czterystu latom niewolniczego ucisku.
Dziś, na drugim brzegu morza, w wolności, rozbrzmiewa najstarszy poetycki hymn biblijny — Pieśń Mojżesza i Miriam. To pieśń absolutnego triumfu Boga nad ludzką pychą i zbrojną potęgą imperium. Jednak historia biblijna jest do bólu realistyczna: zaledwie trzy dni później, po wejściu w głąb pustyni Szur, kończy się woda w bukłakach. Gdy lud dociera do źródeł Mara, okazuje się, że woda jest gorzka i niezdatna do picia.
W tym dramatycznym kontraście Bóg odsłania sedno Swojego charakteru. Nie gani ludu za pragnienie, lecz wskazuje Mojżeszowi niezwykłe drzewo, które wrzucone w toń odbiera jej wszelką gorycz. Tam Bóg objawia swoje święte imię: JAHWE RAFFA — „Ja jestem PAN, Twój Lekarz!”. Otwórzmy ten rozdział, aby nauczyć się wielbić Boga w chwilach zwycięstwa i ufać Jego uzdrawiającej mocy w chwilach życiowej pustyni.

TEKST PISMA ŚWIĘTEGO — CZYTANIE DNIA (WJ 15:1–27, UBG)
Wj 15:1 Wówczas Mojżesz i synowie Izraela zaśpiewali PANU tę pieśń: Będę śpiewał PANU, bo bardzo się wywyższył. Konia i jego jeźdźca wrzucił w morze.
Wj 15:2 PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem. To mój Bóg, dlatego zbuduję mu przybytek, to Bóg mego ojca, dlatego będę go wywyższał.
Wj 15:3 PAN jest mężem wojny, JAHWE to jego imię.
Wj 15:4 Rydwany faraona i jego wojsko wrzucił w morze, a jego wyborni dowódcy utonęli w Morzu Czerwonym.
Wj 15:5 Głębiny ich okryły; opadli na dno jak kamień.
Wj 15:6 Twoja prawica, PANIE, wsławiła się mocą; twoja prawica, PANIE, rozbiła wroga.
Wj 15:7 I w wielkości swego majestatu zniszczyłeś tych, którzy powstali przeciwko tobie; posłałeś swój gniew, który ich pożarł jak ściernisko.
Wj 15:8 A od tchnienia twoich nozdrzy spiętrzyły się wody, fale stanęły jak wał, głębiny stężały w sercu morza.
Wj 15:9 Wróg powiedział: Będę ścigał, pochwycę, podzielę łup; nasyci się nimi moja dusza, dobędę mego miecza, moja ręka ich zniszczy.
Wj 15:10 Dmuchnąłeś swoim wiatrem i morze ich okryło; zatonęli jak ołów w potężnych wodach.
Wj 15:11 Któż jest jak ty wśród bogów, PANIE? Któż jest jak ty, chwalebny w świętości, straszliwy w chwałach, czyniący cuda?
Wj 15:12 Wyciągnąłeś swoją prawicę i pochłonęła ich ziemia.
Wj 15:13 Prowadziłeś w swoim miłosierdziu ten lud, który wykupiłeś; przyprowadziłeś go swoją mocą do swego świętego mieszkania.
Wj 15:14 Usłyszały to narody i zadrżały; boleść ogarnęła mieszkańców Filistei.
Wj 15:15 Wtedy przestraszyli się książęta Edomu, mocarzy Moabu ogarnęło drżenie, stopnieli wszyscy mieszkańcy Kanaanu.
Wj 15:16 Padł na nich strach i trwoga; z powodu wielkości twego ramienia zdrętwieli jak kamień, aż przeszedł twój lud, PANIE, aż przeszedł ten lud, który nabyłeś.
Wj 15:17 Wprowadzisz ich i zasadzisz na górze twego dziedzictwa, na miejscu, które przygotowałeś, PANIE, na twoje mieszkanie, w świątyni, Panie, którą twoje ręce ugruntowały.
Wj 15:18 PAN będzie królował na wieki wieków.
Wj 15:19 Gdy bowiem konie faraona wraz z jego rydwanami i jeźdźcami weszły w morze, PAN zawrócił na nich wody morza, a synowie Izraela przeszli suchą ziemią przez środek morza.
Wj 15:20 Wtedy Miriam prorokini, siostra Aarona, wzięła bębenek do ręki, a wszystkie kobiety wyszły za nią z bębenkami i z tańcami.
Wj 15:21 I Miriam odpowiadała im: Śpiewajcie PANU, bo bardzo się wywyższył; konia i jego jeźdźca wrzucił w morze.
Wj 15:22 Potem Mojżesz poprowadził Izraela od Morza Czerwonego i wyszli na pustynię Szur. Szli przez trzy dni po pustyni, a nie znaleźli wody.
Wj 15:23 I przyszli do Mara, ale nie mogli pić wody z Mara, bo była gorzka; dlatego nadano temu miejscu nazwę Mara.
Wj 15:24 I lud szemrał przeciwko Mojżeszowi, mówiąc: Co będziemy pić?
Wj 15:25 Wtedy Mojżesz zawołał do PANA, a PAN wskazał mu drzewo; i wrzucił je do wody, a wody stały się słodkie. Tam dał mu ustawę i prawo i tam go poddał próbie;
Wj 15:26 I powiedział: Jeśli będziesz pilnie słuchał głosu PANA, twego Boga, i będziesz robił to, co prawe w jego oczach, i nakłonisz uszy ku jego przykazaniom, i będziesz przestrzegał wszystkich jego ustaw, to nie ześlę na ciebie żadnej choroby, jaką zesłałem na Egipt, gdyż ja jestem PAN, który cię uzdrawia.
Wj 15:27 I przybyli do Elim, gdzie było dwanaście źródeł wody i siedemdziesiąt palm; tam rozbili obóz nad wodami.

CZĘŚĆ I — PIEŚŃ MOJŻESZA I TRIUMF PANA NAD MORZEM CZERWONYM (WJ 15:1–12)
1. Spontaniczny hymn ocalonych (15:1a): Mojżesz i synowie Izraela nie organizują wiecu politycznego, lecz intonują pieśń uwielbienia dla PANA.
2. Porażka końskiej dumy imperium (15:1b): „Konia i jego jeźdźca wrzucił w morze” — pogańskie symbole dominacji militarnej okazują się bezsilne wobec Stwórcy.
3. Potrójne wyznanie wiary (15:2a): PAN jest moją mocą, pieśnią i zbawieniem — osobiste przyswojenie Bożej łaski przez każdego wierzącego.
4. Pragnienie Bożej obecności (15:2b): „To mój Bóg, dlatego zbuduję mu przybytek” — wdzięczność rodzi pragnienie bliskiej społeczności i oddania czci.
5. Boży Wojownik o imieniu JAHWE (15:3): Bóg objawia się jako mąż wojny, który osobiście walczy w obronie uciśnionych i bezbronnych.
6. Zatopienie elity militarnej (15:4): Rydwany i wyborni dowódcy faraona zostają pogrążeni w głębinach Morza Czerwonego.
7. Opadnięcie na dno jak kamień (15:5): Ciężkie zbroje i pycha oprawców stają się ich grobem w morskiej otchłani.
8. Chwalebna prawica PANA (15:6): Prawica Boża symbolizuje suwerenną, niezwyciężoną moc łamiącą potęgę wszelkiego wroga.
9. Pożarcie pychy jak ściernisko (15:7): Ogień Bożego gniewu pochłania tych, którzy zuchwale powstali przeciwko Najwyższemu.
10. Tchnienie nozdrzy Stwórcy (15:8): Spiętrzenie wód i stężenie głębin było dziełem suwerennego tchnienia Boga, który włada prawami natury.
11. Zuchwałe zamiary wroga (15:9): Monolog pychy faraona („będę ścigał, pochwycę, podzielę łup”) zostaje nagle przerwany przez Bożą interwencję.
12. Ołów w potężnych wodach (15:10): Jedno dmuchnięcie wiatru Bożego kładzie kres nienawiści wroga — zatonęli bezpowrotnie.
13. Szczyt doksologii (15:11): „Któż jest jak ty wśród bogów, PANIE? Chwalebny w świętości, straszliwy w chwałach, czyniący cuda!”.

CZĘŚĆ II — ŚWIĘTY WOJOWNIK, SĄD NAD BOŻKAMI I PRZYSZŁOŚĆ KANAANU (WJ 15:13–19)
14. Miłosierdzie prowadzące odkupionych (15:13a): Bóg nie tylko wyprowadza z niewoli, ale wiernie prowadzi lud, który sam nabył.
15. Cel drogi — święte mieszkanie (15:13b): Celem wędrówki nie jest bezdroże pustyni, lecz święte Boże mieszkanie i obecność Najwyższego.
16. Trwoga narodów ościennych (15:14): Wieść o cudzie Morza Czerwonego paraliżuje mieszkańców Filistei i kładzie fundament pod przyszłe zwycięstwa.
17. Przerażenie Edomu i Moabu (15:15a): Mocarze pogańskich krain doświadczają drżenia serca na wieść o Bożej potędze.
18. Stopnienie mieszkańców Kanaanu (15:15b): Mieszkańcy Ziemi Obiecanej tracą odwagę na lata przed wkroczeniem Jozuego (por. Joz 2:9–11).
19. Zdrętwienie wrogów jak kamień (15:16): Boża ręka obezwładnia przeciwników, dopóki wykupiony lud bezpiecznie nie przekroczy granic.
20. Góra dziedzictwa i świątynia (15:17): Proroctwo o zasadzeniu ludu na Górze Moria — w miejscu przyszłej świątyni ugruntowanej przez ręce Pana.
21. Wieczne panowanie Króla (15:18): „PAN będzie królował na wieki wieków” — ostateczna proklamacja eschatologicznego królestwa Boga.
22. Podsumowanie kontrastu ocalenia (15:19): Konie faraona utonęły w morzu, a synowie Izraela przeszli suchą stopą — sąd i łaska w jednym wydarzeniu.

CZĘŚĆ III — PIEŚŃ MIRIAM, BĘBENEK I TANIEC UWIELBIENIA (WJ 15:20–21)
23. Miriam jako prorokini przymierza (15:20a): Po raz pierwszy w Biblii kobieta zostaje nazwana prorokinią (hebr. nebi'a).
24. Bębenek i taniec dziękczynienia (15:20b): Wszystkie niewiasty wychodzą z bębenkami — uwielbienie angażujące całe ciało, emocje i wspólnotę.
25. Śpiew responsoryjny (15:21a): Miriam przewodzi antyfonie chóru: „Śpiewajcie PANU, bo bardzo się wywyższył!”.
26. Pamiątka zwycięstwa nad koniem i jeźdźcem (15:21b): Kobiety powtarzają refren pieśni Mojżesza, pieczętując triumf wiary w sercach nowego pokolenia.

CZĘŚĆ IV — PUSTYNIA SZUR, GORZKIE WODY MARA I SZEMRANIE LUDU (WJ 15:22–24)
27. Wkroczenie w pustynię Szur (15:22a): Po euforii nad morzem rozpoczyna się surowa szkoła pustyni — droga uświęcenia.
28. Trzydniowe pragnienie (15:22b): Trzy dni marszu w spiekocie bez kropli wody wystawiają na próbę wiarę świeżo ocalonych niewolników.
29. Gorzkie rozczarowanie w Mara (15:23): Znalezienie wody rodzi nadzieję, lecz woda okazuje się gorzka (hebr. Mara) — bolesny cios dla spragnionych.
30. Ludzkie szemranie przeciw słudze Bożemu (15:24): „Co będziemy pić?” — zamiast modlitwy pojawia się pretensja, zwątpienie i oskarżenie.

CZĘŚĆ V — DRZEWO PRZEMIANY, PRZYMIERZE UZDROWIENIA (JAHWE RAFFA) I OAZA ELIM (WJ 15:25–27)
31. Krzyk modlitwy Mojżesza (15:25a): Mojżesz nie kłóci się z ludem, lecz natychmiast woła o pomoc do PANA.
32. Boże drzewo wrzucone w toń (15:25b): Bóg wskazuje konkretne drzewo, które wrzucone w gorzką wodę sprawia cudowną przemianę w słodki zdrój.
33. Ustawa, prawo i próba serca (15:25c): Bóg wykorzystuje Mara jako miejsce wychowawczej próby zaufania i posłuszeństwa.
34. Warunki przymierza zdrowia (15:26a): Pilne słuchanie głosu Boga, czynienie tego, co prawe, oraz zachowywanie przykazań.
35. Objawienie JAHWE RAFFA (15:26b): „Gdyż ja jestem PAN, który cię uzdrawia” — Bóg jako Najwyższy Lekarz ciała, duszy i ducha.
36. Błogosławieństwo oazy Elim (15:27): Dwanaście żywych źródeł i siedemdziesiąt palm — Bóg obficie wynagradza tych, którzy przetrwali próbę wierności.

JEZUS W CENTRUM
1. Pieśń Mojżesza i Pieśń Baranka (Wj 15:1–3 a Obj 15:2–3)
W Księdze Objawienia odkupieni z każdego narodu stoją nad szklanym morzem zmieszanym z ogniem, trzymając harfy Boże i śpiewając „pieśń Mojżesza, sługi Bożego, i pieśń Baranka”. Triumf nad faraonem był zaledwie cieniem ostatecznego triumfu Jezusa Chrystusa nad szatanem, grzechem i śmiercią.
2. Drzewo w Mara a Krzyż Golgoty (Wj 15:25 a Gal 3:13, 1 P 2:24)
Drzewo wskazane Mojżeszowi przez Boga zapowiada Krzyż Jezusa Chrystusa. Gdy w gorzkie wody ludzkiego przekleństwa, winy i cierpienia zostaje wrzucone „drzewo hańby”, na którym zawisł Zbawiciel, każda gorycz zostaje wchłonięta przez Jego miłość, a z serca człowieka wytryskują zdroje słodkiej wody życia wiecznego.
3. JAHWE RAFFA — Jezus Chrystus Boskim Lekarzem (Wj 15:26 a Mt 8:16–17, Iz 53:4–5)
Objawienie Boga jako JAHWE RAFFA osiąga swoją pełnię w osobie Jezusa z Nazaretu. Prorok Izajasz zapowiadał: „Lecz on został zraniony za nasze występki, starty za nasze nieprawości... a jego ranami zostaliśmy uzdrowieni”. Jezus uzdrawiał chorych, wypędzał demony i przywracał wzrok niewidomym, pieczętując Swoją krwią Boże przymierze pełni zdrowia i pokoju.
4. Od Mara do Elim — Zdroje Wody Żywej Ducha Świętego (Wj 15:27 a J 7:37–39, Obj 22:1–2)
Dwanaście źródeł w Elim odpowiada dwunastu apostołom Baranka, a siedemdziesiąt palm — pełnemu poselstwu ewangelii posłanemu do wszystkich narodów. Jezus zawołał w świątyni: „Jeśli ktoś pragnie, niech przyjdzie do mnie i pije!”. Kto przyjmuje Chrystusa, zostaje wyprowadzony z pustyni goryczy do wiecznej oazy Ducha Świętego.

SPRAWDŹ W BIBLII — 12 WERSETÓW PORÓWNAWCZYCH
Wj 15:2 → Ps 118:14: „PAN moją mocą i pieśnią, i stał się moim zbawieniem”.
Wj 15:2 → Iz 12:2: „Oto Bóg jest moim zbawieniem; będę ufał i nie ulęknę się, gdyż PAN BÓG jest moją mocą i pieśnią, on stał się moim zbawieniem”.
Wj 15:3 → Ps 24:8: „Któż jest tym Królem chwały? PAN silny i potężny, PAN dzielny w bitwie”.
Wj 15:11 → Ps 86:8: „Nie ma równego tobie wśród bogów, Panie, ani takich dzieł jak twoje”.
Wj 15:13 → Ps 77:20: „Prowadziłeś swój lud jak trzodę ręką Mojżesza i Aarona”.
Wj 15:18 → Obj 11:15: „Królestwa tego świata stały się królestwami naszego Pana i jego Chrystusa, i będzie królować na wieki wieków”.
Wj 15:20 → 1 Sm 18:6: „Kobiety ze wszystkich miast Izraela wychodziły naprzeciw króla Saula ze śpiewem i pląsami, przy bębenkach”.
Wj 15:23 → Rt 1:20: „Nie nazywajcie mnie Noemi, lecz nazywajcie mnie Mara, gdyż Wszechmocny napełnił mnie wielką goryczą”.
Wj 15:25 → 1 P 2:24: „On sam nasze grzechy poniósł w swoim ciele na drzewie, abyśmy obumarłszy grzechom, żyli dla sprawiedliwości; jego ranami zostaliście uzdrowieni”.
Wj 15:26 → Ps 103:2–3: „Błogosław, duszo moja, PANA... On przebacza wszystkie twoje nieprawości, leczy wszystkie twoje choroby”.
Wj 15:26 → Mt 8:17: „Aby się wypełniło, co zostało powiedziane przez proroka Izajasza: On wziął na siebie nasze słabości i nosił nasze choroby”.
Wj 15:27 → J 7:37–38: „Jeśli ktoś pragnie, niech przyjdzie do mnie i pije. Kto wierzy we mnie, jak mówi Pismo, z jego wnętrza popłyną rzeki wody żywej”.

PRAWDA NA DZIŚ — 8 ZASAD PRZYMIERZA
1. Pierwsza reakcja na ocalenie to uwielbienie: Prawdziwa wiara odpowiada na Boże wybawienie pieśnią wdzięczności i adoracji (Wj 15:1).
2. Prawdziwa pieśń sławi Boga, a nie ludzką siłę: W Pieśni Morza ani razu nie padają pochwały pod adresem człowieka — cała chwała należy do PANA (Wj 15:2–3).
3. Rola kobiet w profetycznym uwielbieniu: Miriam uczy nas, że radosne uwielbienie angażuje całą wspólnotę i budzi wiarę kolejnych pokoleń (Wj 15:20–21).
4. Pustynia weryfikuje wiarę po chwilach triumfu: Euforia na szczycie musi zostać sprawdzona w szarej codzienności marszu przez bezwodną pustynię (Wj 15:22).
5. Szemranie zatruwa serce, modlitwa przynosi ratunek: W obliczu trudności szemranie niszczy wspólnotę, a wołanie do Boga otwiera drogę do cudu (Wj 15:24–25).
6. Drzewo Krzyża uzdrawia każdą życiową gorycz: Wrzuć wiarą Krzyż Chrystusa w swoje zranienia, rozczarowania i ból przeszłości (Wj 15:25).
7. Posłuszeństwo fundamentem Bożego zdrowia: Przymierze JAHWE RAFFA łączy obietnicę ochrony ze szczerym słuchaniem głosu Pana i czystością życia (Wj 15:26).
8. Za każdym Mara Bóg przygotował oazę Elim: Próby na pustyni są tymczasowe; Bóg zawsze prowadzi swój lud ku obfitym źródłom odpocznienia (Wj 15:27).

POMYŚL — PYTANIA DO SERCA
1. Czy w chwilach zwycięstw i Bożego błogosławieństwa Twoją pierwszą reakcją jest szczere uwielbienie PANA (Wj 15:1–2)?
2. Jak reagujesz, gdy zaledwie kilka dni po wielkim duchowym uniesieniu spotyka Cię niespodziewana trudność lub rozczarowanie (Wj 15:22–24)?
3. Czy masz tendencję do szemrania i obwiniania innych, czy raczej natychmiast zanosisz sprawę w modlitwie do Boga (Wj 15:25)?
4. Jaka „gorzka woda” (zranienie z przeszłości, choroba, rozczarowanie ludźmi) wymaga dziś zanurzenia w uzdrawiającej mocy Krzyża Chrystusa?
5. Czy znasz i doświadczasz Boga jako JAHWE RAFFA — Twojego osobistego Lekarza ciała i duszy (Wj 15:26)?
6. Czy Twoje posłuszeństwo Bożym przykazaniom wypływa z wdzięczności za ocalenie, czy z formalnego obowiązku?
7. W jaki sposób wspierasz innych wierzących, gdy przechodzą przez swoją bezwodną pustynię Szur?
8. Czy wierzysz, że Bóg ma dla Ciebie przygotowaną oazę Elim — czas obfitego wytchnienia i odnowienia sił (Wj 15:27)?

MAŁY QUIZ WIEDZY BIBLIJNEJ — 20 PYTAŃ Z WJ 15:1–27
Pytanie 1: Kto według Wj 15:1 zaśpiewał pieśń PANU nad brzegiem morza?
A. Sam Mojżesz w samotności na skale
B. Mojżesz i synowie Izraela
C. Aaron z synami kapłanami
D. Miriam z córkami Lewiego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:1 stwierdza: „Wówczas Mojżesz i synowie Izraela zaśpiewali PANU tę pieśń”.

Pytanie 2: Jak Mojżesz określa PANA w tekście pamięciowym (Wj 15:2)?
A. Jako ogień trawiący i wicher pustynny
B. Jako moją moc, moją chwałę i moje zbawienie
C. Jako króla narodów i pana niebios
D. Jako mądrość przodków i tarczę synów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:2: „PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem”.

Pytanie 3: Jakim niezwykłym tytułem PAN zostaje nazwany w Wj 15:3?
A. Panem żniwa
B. Mężem wojny (JAHWE to Jego imię)
C. Sędzią przymierza
D. Pasterzem Izraela
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:3 podaje: „PAN jest mężem wojny, JAHWE to jego imię”.

Pytanie 4: Co według Wj 15:4 stało się z rydwanami faraona i jego wojskiem?
A. Zostały spalone przez ogień z nieba
B. PAN wrzucił je w morze, a wyborni dowódcy utonęli
C. Rozbiły się o skały pustyni
D. Zostały zdobyte przez Hebrajczyków
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:4: „Rydwany faraona i jego wojsko wrzucił w morze, a jego wyborni dowódcy utonęli w Morzu Czerwonym”.

Pytanie 5: Do czego w Wj 15:5 i 15:10 porównano opadnięcie egipskich żołnierzy na dno morza?
A. Do piasku pustyni i pyłu
B. Do kamienia (15:5) oraz do ołowiu (15:10)
C. Do pnia ściętego drzewa
D. Do skorupy glinianego dzbana
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:5 mówi: „opadli na dno jak kamień”, a Wj 15:10: „zatonęli jak ołów w potężnych wodach”.

Pytanie 6: Co według Wj 15:6 wsławiło się mocą i rozbiło wroga?
A. Laska Mojżesza
B. Prawica PANA
C. Miecz Jozuego
D. Tarcza przymierza
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:6 ogłasza: „Twoja prawica, PANIE, wsławiła się mocą; twoja prawica, PANIE, rozbiła wroga”.

Pytanie 7: Do czego przyrównano pożarcie wrogów przez Boży gniew w Wj 15:7?
A. Do pożarcia ścierniska
B. Do stopienia wosku
C. Do wysuszenia trawy
D. Do powalenia cedrów Libanu
Poprawna odpowiedź: A. Wyjaśnienie: Wj 15:7 mówi: „posłałeś swój gniew, który ich pożarł jak ściernisko”.

Pytanie 8: Co spowodowało spiętrzenie fal morskich według Wj 15:8?
A. Uderzenie pioruna
B. Tchnienie nozdrzy PANA
C. Trzęsienie ziemi na dnie morza
D. Wołanie aniołów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:8: „A od tchnienia twoich nozdrzy spiętrzyły się wody, fale stanęły jak wał”.

Pytanie 9: Co zuchwale mówił wróg przed pościgiem w Wj 15:9?
A. Będę prosił o pokój i przymierze
B. Będę ścigał, pochwycę, podzielę łup, dobędę miecza
C. Pozwolę im odejść na pustynię
D. Zbuduję nową stolicę w Memfis
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:9 cytuje pychę wroga: „Wróg powiedział: Będę ścigał, pochwycę, podzielę łup...”.

Pytanie 10: Jakie fundamentalne pytanie retoryczne pada w Wj 15:11?
A. Kto zdoła policzyć gwiazdy na niebie?
B. Któż jest jak ty wśród bogów, PANIE? Chwalebny w świętości, straszliwy w chwałach!
C. Kto pójdzie za nami do Kanaanu?
D. Gdzie są bogowie Egiptu i ich świątynie?
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:11 to serce Pieśni Morza: „Któż jest jak ty wśród bogów, PANIE?”.

Pytanie 11: Które narody ościenne według Wj 15:14–15 ogarnął lęk na wieść o cudzie Morza Czerwonego?
A. Rzymian, Greków i Persów
B. Filisteę, Edom, Moab i wszystkich mieszkańców Kanaanu
C. Asyrię, Babilon i Tyrus
D. Etiopię, Nubię i Libię
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:14–15 wymienia: mieszkańców Filistei, książąt Edomu, mocarzy Moabu i mieszkańców Kanaanu.

Pytanie 12: Dokąd według Wj 15:17 PAN wprowadzi i zasadzi swój odkupiony lud?
A. Na żyzne pola delty Nilu
B. Na górę swego dziedzictwa, do świątyni ugruntowanej przez Jego ręce
C. W dolinę rzeki Eufrat
D. Do warownych miast Hebronu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:17: „Wprowadzisz ich i zasadzisz na górze twego dziedzictwa... w świątyni, Panie, którą twoje ręce ugruntowały”.

Pytanie 13: Jaka proklamacja królewska zamyka pieśń Mojżesza w Wj 15:18?
A. Faraon ukorzy się przed Izraelem
B. PAN będzie królował na wieki wieków
C. Naród nasz posiądzie bogactwa ziemi
D. Zbudujemy mury wokół Jerozolimy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:18 ogłasza uroczyście: „PAN będzie królował na wieki wieków”.

Pytanie 14: Kim była Miriam i jaki tytuł otrzymała w Wj 15:20?
A. Żoną Mojżesza i królową obozu
B. Prorokinią, siostrą Aarona
C. Sędzią plemienia Judy
D. Kapłanką namiotu zgromadzenia
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:20 stwierdza: „Wtedy Miriam prorokini, siostra Aarona...”.

Pytanie 15: Z jakim instrumentem i w jaki sposób kobiety wyszły za Miriam w Wj 15:20?
A. Z harfami i srebrnymi trąbami
B. Z bębenkami i z tańcami
C. Ze złotymi cymbałami
D. Z fletami i lutniami
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:20: „wzięła bębenek do ręki, a wszystkie kobiety wyszły za nią z bębenkami i z tańcami”.

Pytanie 16: Na jaką pustynię wyszedł Izrael po opuszczeniu Morza Czerwonego (Wj 15:22)?
A. Na pustynię Paran
B. Na pustynię Szur
C. Na pustynię Judzką
D. Na pustynię Synaj
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:22: „Mojżesz poprowadził Izraela od Morza Czerwonego i wyszli na pustynię Szur”.

Pytanie 17: Ile dni szedł lud przez pustynię bez znalezienia wody przed dotarciem do Mara (Wj 15:22)?
A. Jeden dzień
B. Przez trzy dni
C. Przez siedem dni
D. Przez czterdzieści dni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:22: „Szli przez trzy dni po pustyni, a nie znaleźli wody”.

Pytanie 18: Dlaczego miejsce to nazwano „Mara” (Wj 15:23)?
A. Bo było tam mnóstwo jadowitych węży
B. Bo wody były gorzkie (Mara oznacza gorycz)
C. Bo stał tam samotny grobowiec
D. Bo wiał tam gorący wiatr południowy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:23: „nie mogli pić wody z Mara, bo była gorzka; dlatego nadano temu miejscu nazwę Mara”.

Pytanie 19: Co PAN wskazał Mojżeszowi, aby uczynić wodę słodką (Wj 15:25)?
A. Naczynie z czystą solą
B. Drzewo, które wrzucone do wody uczyniło ją słodką
C. Żelazną laskę przymierza
D. Źródło ukryte pod głazem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:25: „Wtedy Mojżesz zawołał do PANA, a PAN wskazał mu drzewo; i wrzucił je do wody, a wody stały się słodkie”.

Pytanie 20: Jakie imię przymierza i obietnicę złożył Bóg w Wj 15:26, a co czekało na lud w Elim (15:27)?
A. Jahwe Jireh na Synaju i miód w skalnych szczelinach
B. JAHWE RAFFA („Ja jestem PAN, który cię uzdrawia”), a w Elim 12 źródeł wody i 70 palm
C. Jahwe Nissi w bitwie i rzeka Jordan
D. Jahwe Szalom w namiocie i studnie Jakuba
Poprawna odpowiedź: B. Wyjaśnienie: Wj 15:26 objawia: „ja jestem PAN, który cię uzdrawia” (Jahwe Raffa), a Wj 15:27 opisuje Elim z 12 źródłami i 70 palmami.

TWOJA DECYZJA
Wybierz Przemianę Goryczy w Życie — Zaufaj Bogu jako JAHWE RAFFA!
Piętnasty rozdział Księgi Wyjścia stawia przed każdym z nas fundamentalny wybór: czy w obliczu trudności i życiowej pustyni ulegniesz pokusie szemrania, zgorzknienia i pretensji, czy też zawołasz do PANA i pozwolisz, by Krzyż Jezusa Chrystusa dotknął Twojego bólu? Bóg nie prowadzi Cię na manowce. Każda pustynia Szur i każde gorzkie źródło Mara to Boża szkoła wiary, która ma przygotować Cię na przyjęcie pełni Jego uzdrawiającej łaski. Zaledwie kawałek dalej czeka Elim z dwunastoma źródłami i siedemdziesięcioma palmami!
Oddaj dziś Bogu wszystkie swoje zranienia, rozczarowania, zniechęcenie i lęk. Wyznaj wiarę w Jezusa Chrystusa — Twojego Boskiego Lekarza. Zamiast szemrać — śpiewaj z Mojżeszem i Miriam pieśń ocalenia!

MODLITWA NA DZIŚ — 14 LISTOPADA 2026
Modlitwa o Przemianę Życiowej Goryczy i Uzdrowienie w Chrystusie
Wszechmogący Boże, Święty Wojowniku i nasz Wieczny Zbawicielu! Z całego serca wysławiamy Twoje święte Imię. Twoja prawica wsławiła się mocą i skruszyła potęgę wroga, uwalniając nas z niewoli grzechu i potępienia.
Dziękujemy Ci, Panie Jezu Chryste, że Ty jesteś naszą pieśnią, mocą i zbawieniem. Dziękujemy za drzewo Twojego Krzyża na Golgocie, które gładzi wszelką gorycz naszego życia i uwalnia nas od trucizny grzechu.
Wyznajemy Cię dziś jako JAHWE RAFFA — naszego Najwyższego Lekarza. Dotknij Swoją uzdrawiającą łaską naszych ciał, ulecz zranienia naszych serc i usuń z naszych ust wszelkie szemranie. Napełnij nas radością Ducha Świętego, abyśmy z Miriam wywyższali Cię pieśnią i tańcem. Poprowadź nas z pustyni do Twojej oazy Elim i bądź uwielbiony w całym naszym życiu, teraz i na wieki wieków. Amen!

ZADANIE NA DZIŚ & TWÓJ ZAPIS
1. Przeczytaj osobiście cały piętnasty rozdział Księgi Wyjścia (Wj 15:1–27) w przekładzie UBG.
2. Zaśpiewaj lub odsłuchaj pieśń uwielbienia, dziękując Bogu za konkretne ocalenie i wyzwolenie w Twoim życiu.
3. Nazwij przed Bogiem w modlitwie swoje obecne „Mara” — gorzką sytuację, trudność lub zranienie — i poproś o dotknięcie Krzyża Chrystusa.
4. Przeczytaj Ps 103:1–5 oraz Iz 53:4–5, rozważając imię JAHWE RAFFA.
5. Zbadaj swoje słowa z ostatnich dni: czy przeważało w nich dziękczynienie, czy raczej szemranie i narzekanie?
6. Zapisz poniżej swoje osobiste dziękczynienie za Bożą wierność i uzdrowienie.
7. Zadzwoń lub napisz do bliskiej osoby, niosąc jej słowo otuchy: za gorzkim Mara czeka Boże Elim!

JUTRO — 15 LISTOPADA 2026
DZIEŃ 46 — MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU: BOŻE ZAOPATRZENIE NA PUSTYNI (Wj 16:1–36)
Dzień 46: Pustynia Sin, szemranie o jedzenie, deszcz chleba z nieba, wieczorne przepiórki, zasada zbierania na jeden dzień oraz pierwsze objawienie świętego odpoczynku Szabatu.`;

// ── 4. GENEROWANIE DOKUMENTU WORD (.DOCX) NA PULPICIE ──
console.log('📄 Generuję dokument Microsoft Word (.docx) na Pulpicie...');

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

      // Parsowanie akapitów i nagłówków
      ...lessonDocxText.split('\n\n').slice(2).map(block => {
        const trimmed = block.trim();
        if (!trimmed) return new Paragraph({});

        if (trimmed.startsWith('ZANIM OTWORZYSZ BIBLIĘ') ||
            trimmed.startsWith('TEKST PISMA ŚWIĘTEGO') ||
            trimmed.startsWith('CZĘŚĆ ') ||
            trimmed.startsWith('KLUCZE JĘZYKOWE') ||
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

// Zapisujemy .docx na Pulpit
const docxPathDesktop = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPathDesktop, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPathDesktop} (${buf.length} bajtów)`);

// ── 5. ZAPIS PAKIETU 5 WERSJI ──
const scriptsContentDir = path.join(process.cwd(), 'scripts/content');
if (!fs.existsSync(scriptsContentDir)) fs.mkdirSync(scriptsContentDir, { recursive: true });
fs.writeFileSync(path.join(scriptsContentDir, `pakiet-day${DAY_NUM}-5wersji.md`), pakiet5wersji, 'utf8');

const queueDir = path.join(process.cwd(), `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);
if (!fs.existsSync(queueDir)) fs.mkdirSync(queueDir, { recursive: true });
fs.writeFileSync(path.join(queueDir, 'meta.json'), JSON.stringify({
  data: DATE_STR,
  dzien: DAY_NUM,
  zatwierdzil: "Cezary Rogowski",
  zatwierdzono: new Date().toISOString(),
  karta: {
    tytul: `Dzień ${DAY_NUM}: ${TITLE}`,
    opis: `${BOOK} ${READING}: ${SUBTITLE}`
  }
}, null, 2), 'utf8');

const rozwazanieJson = {
  id: `ref_day${DAY_NUM}_${DATE_STR}`,
  day: DAY_NUM,
  date: DATE_STR,
  dateFormatted: DATE_FORMATTED,
  title: `☀️ Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE}`,
  book: BOOK,
  reading: READING,
  memoryVerse: MEMORY_VERSE,
  theme: THEME,
  fullText: pakiet5wersji.split('WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 2: WERSJA WWW')[0].trim(),
  contentApp: pakiet5wersji.split('WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 2: WERSJA WWW')[0].trim(),
  contentWeb: pakiet5wersji.split('WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 3: WERSJA WIECZORNA (SMS)')[0].trim(),
  contentSms: 'Dzień 45 (Wj 15:2): „PAN moją mocą i chwałą, bo stał się moim zbawieniem”. Bóg przemienia każdą gorycz w Mara w słodycz życia. On jest Twoim Lekarzem! polskieradio.cc',
  tvScript: pakiet5wersji.split('WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)')[0].trim(),
  ccnArticle: pakiet5wersji.split('WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1].trim(),
  imageUrl: `/images/academy/daily/kc_day_${DAY_NUM}_piesn_zwyciestwa_miriam_mara.jpg`,
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
  publishedAt: `${DATE_STR}T00:00:00.000Z`,
  status: 'published'
};
fs.writeFileSync(path.join(queueDir, 'rozwazanie.json'), JSON.stringify(rozwazanieJson, null, 2), 'utf8');

// Dopisujemy do bazy rozwazania_baza.md w Wektor1
const bazaMdPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(bazaMdPath)) {
  const currentBaza = fs.readFileSync(bazaMdPath, 'utf8');
  if (!currentBaza.includes(`Dzień ${DAY_NUM} (14 listopada 2026)`)) {
    fs.appendFileSync(bazaMdPath, '\n\n' + pakiet5wersji, 'utf8');
    console.log('✅ Dopisano pakiet do rozwazania_baza.md');
  }
}

// ── 6. BUDOWA STRONY LEKCJI HTML NA WZORZE DNIA 44 Z PEŁNĄ EGZEGEZĄ I QUIZEM DLA DNIA 45 ──
console.log('🌐 Buduję stronę HTML lekcji Dnia 45...');
const d44HtmlPath = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-44.html');
let html = fs.readFileSync(d44HtmlPath, 'utf8');

// Metadane
html = html.replace(/<title>Dzień 44:[^<]+<\/title>/, `<title>Dzień 45: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 45 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}">`);
html = html.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-44"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-45"`);
html = html.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 45: ${TITLE} (${READING}) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${SUBTITLE}"`);
html = html.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-44"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-45"`);
html = html.replace(/kc_day_44_przejscie_przez_morze_czerwone\.jpg\?v=\d+/g, `kc_day_45_piesn_zwyciestwa_miriam_mara.jpg?v=20261114`);
html = html.replace(/kc_day_44_przejscie_przez_morze_czerwone\.jpg/g, `kc_day_45_piesn_zwyciestwa_miriam_mara.jpg`);

// Nawigacja
html = html.replace(/<span class="text-amber-400 font-semibold">Dzień 44<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 45</span>`);
const navBlock = `<a href="/akademia/kurscodzienny/dzien-44" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 44</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-46" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 46 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`;
html = html.replace(/<a href="\/akademia\/kurscodzienny\/dzien-43"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/, navBlock);
html = html.replace(/<a href="\/akademia\/kurscodzienny\/dzien-43"[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-45"[\s\S]*?<\/a>/, navBlock);

// Hero
html = html.replace(/<span>Dzień 44 z 2009<\/span>/, `<span>Dzień 45 z 2009</span>`);
html = html.replace(/13 LISTOPADA 2026 • PIĄTEK/, `14 LISTOPADA 2026 • SOBOTA`);
html = html.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`);
html = html.replace(/<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/, `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`);
html = html.replace(/alt="Dzień 44:[^"]+"/, `alt="Dzień 45: ${TITLE}"`);
html = html.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>Ilustracja biblijna: ${TITLE} (${READING})</span>`);
html = html.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 14:1–31<\/span>/, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${READING}</span>`);
html = html.replace(/Księga Wyjścia 14:1–31 • Przejście przez Morze Czerwone[^<]*/, `Księga Wyjścia 15:1–27 • Pieśń Mojżesza i Miriam przy Morzu Czerwonym oraz gorzkie wody Mara przemienione w słodkie`);

// Werset pamięciowy
html = html.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/, `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">\n            ${MEMORY_VERSE}\n          </blockquote>`);
html = html.replace(/— Księga Wyjścia 14:14 \(UBG\)/, `— Księga Wyjścia 15:2 (UBG)`);
html = html.replace(/navigator\.clipboard\.writeText\('[^']+'\)/, `navigator.clipboard.writeText('${MEMORY_VERSE.replace(/'/g, "\\'")}')`);
html = html.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/, `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${THEME}\n      </div>\n    </div>`);

// Karta wprowadzenia
html = html.replace(/Dziś jest <strong class="text-white">Dzień 44<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 14:1–31<\/strong>\./, `Dziś jest <strong class="text-white">Dzień 45</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>.`);
html = html.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 14:1–31<\/p>/, `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • ${READING}</p>`);
html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=14"/g, `href="/mojabiblia?book=EXO&chapter=15"`);

// Tekst czytania
html = html.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/, `<div class="kc-prose-reading">\n        ${readingHtml}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`);

// Kody Stronga
const strongHtml = `<span class="strong-chip"><span class="strong-id">H7892</span> <span class="strong-orig">שִׁיר (szir)</span> — pieśń / śpiew uwielbienia za ocalenie (Wj 15:1)</span>
          <span class="strong-chip"><span class="strong-id">H5797</span> <span class="strong-orig">עֹז (oz)</span> — moc / potęga Boga wojownika (Wj 15:2)</span>
          <span class="strong-chip"><span class="strong-id">H3444</span> <span class="strong-orig">יְשׁוּעָה (jeszua)</span> — zbawienie / wybawienie z ręki wroga (Wj 15:2)</span>
          <span class="strong-chip"><span class="strong-id">H4421</span> <span class="strong-orig">מִלְחָמָה (milchama)</span> — mąż wojny / wojownik walczący za lud (Wj 15:3)</span>
          <span class="strong-chip"><span class="strong-id">H6944</span> <span class="strong-orig">קֹדֶשׁ (kodesz)</span> — świętość / chwalebny w świętości (Wj 15:11)</span>
          <span class="strong-chip"><span class="strong-id">H4785</span> <span class="strong-orig">מָרָה (Mara)</span> — gorycz / gorzkie wody pustyni Szur (Wj 15:23)</span>
          <span class="strong-chip"><span class="strong-id">H6086</span> <span class="strong-orig">עֵץ (ec)</span> — drzewo uzdrawiające gorzką toń (Wj 15:25)</span>
          <span class="strong-chip"><span class="strong-id">H7495</span> <span class="strong-orig">רָפָא (rafa)</span> — uzdrawiać / JAHWE RAFFA — PAN twój lekarz (Wj 15:26)</span>
          <span class="strong-chip"><span class="strong-id">H352</span> <span class="strong-orig">אֵילִם (Elim)</span> — oaza 12 źródeł i 70 palm odpoczynku (Wj 15:27)</span>`;

html = html.replace(/Klucze Językowe & Kody Stronga \(Wj 14\)/, `Klucze Językowe & Kody Stronga (Wj 15)`);
html = html.replace(/osnowę teologiczną 14\. rozdziału Księgi Wyjścia/, `osnowę teologiczną 15. rozdziału Księgi Wyjścia`);
html = html.replace(/<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/, `<div class="flex flex-wrap gap-2">\n          ${strongHtml}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`);

// Egzegeza 5 części
const exegesisHtml = `<!-- CZĘŚĆ I -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
              PIEŚŃ MOJŻESZA I TRIUMF PANA NAD MORZEM CZERWONYM (WJ 15:1–12)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>1. Spontaniczny hymn ocalonych (15:1a):</strong> Mojżesz i synowie Izraela nie organizują wiecu politycznego, lecz intonują pieśń uwielbienia dla PANA.</p>
              <p><strong>2. Porażka końskiej dumy imperium (15:1b):</strong> „Konia i jego jeźdźca wrzucił w morze” — pogańskie symbole dominacji militarnej okazują się bezsilne wobec Stwórcy.</p>
              <p><strong>3. Potrójne wyznanie wiary (15:2a):</strong> PAN jest moją mocą, pieśnią i zbawieniem — osobiste przyswojenie Bożej łaski przez każdego wierzącego.</p>
              <p><strong>4. Pragnienie Bożej obecności (15:2b):</strong> „To mój Bóg, dlatego zbuduję mu przybytek” — wdzięczność rodzi pragnienie bliskiej społeczności i oddania czci.</p>
              <p><strong>5. Boży Wojownik o imieniu JAHWE (15:3):</strong> Bóg objawia się jako mąż wojny, który osobiście walczy w obronie uciśnionych i bezbronnych.</p>
              <p><strong>6. Zatopienie elity militarnej (15:4):</strong> Rydwany i wyborni dowódcy faraona zostają pogrążeni w głębinach Morza Czerwonego.</p>
              <p><strong>7. Opadnięcie na dno jak kamień (15:5):</strong> Ciężkie zbroje i pycha oprawców stają się ich grobem w morskiej otchłani.</p>
              <p><strong>8. Chwalebna prawica PANA (15:6):</strong> Prawica Boża symbolizuje suwerenną, niezwyciężoną moc łamiącą potęgę wszelkiego wroga.</p>
              <p><strong>9. Pożarcie pychy jak ściernisko (15:7):</strong> Ogień Bożego gniewu pochłania tych, którzy zuchwale powstali przeciwko Najwyższemu.</p>
              <p><strong>10. Tchnienie nozdrzy Stwórcy (15:8):</strong> Spiętrzenie wód i stężenie głębin było dziełem suwerennego tchnienia Boga, który włada prawami natury.</p>
              <p><strong>11. Zuchwałe zamiary wroga (15:9):</strong> Monolog pychy faraona („będę ścigał, pochwycę, podzielę łup”) zostaje nagle przerwany przez Bożą interwencję.</p>
              <p><strong>12. Ołów w potężnych wodach (15:10):</strong> Jedno dmuchnięcie wiatru Bożego kładzie kres nienawiści wroga — zatonęli bezpowrotnie.</p>
              <p><strong>13. Szczyt doksologii (15:11):</strong> „Któż jest jak ty wśród bogów, PANIE? Chwalebny w świętości, straszliwy w chwałach, czyniący cuda!”.</p>
            </div>
          </div>

          <!-- CZĘŚĆ II -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
              ŚWIĘTY WOJOWNIK, SĄD NAD BOŻKAMI I PRZYSZŁOŚĆ KANAANU (WJ 15:13–19)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>14. Miłosierdzie prowadzące odkupionych (15:13a):</strong> Bóg nie tylko wyprowadza z niewoli, ale wiernie prowadzi lud, który sam nabył.</p>
              <p><strong>15. Cel drogi — święte mieszkanie (15:13b):</strong> Celem wędrówki nie jest bezdroże pustyni, lecz święte Boże mieszkanie i obecność Najwyższego.</p>
              <p><strong>16. Trwoga narodów ościennych (15:14):</strong> Wieść o cudzie Morza Czerwonego paraliżuje mieszkańców Filistei i kładzie fundament pod przyszłe zwycięstwa.</p>
              <p><strong>17. Przerażenie Edomu i Moabu (15:15a):</strong> Mocarze pogańskich krain doświadczają drżenia serca na wieść o Bożej potędze.</p>
              <p><strong>18. Stopnienie mieszkańców Kanaanu (15:15b):</strong> Mieszkańcy Ziemi Obiecanej tracą odwagę na lata przed wkroczeniem Jozuego.</p>
              <p><strong>19. Zdrętwienie wrogów jak kamień (15:16):</strong> Boża ręka obezwładnia przeciwników, dopóki wykupiony lud bezpiecznie nie przekroczy granic.</p>
              <p><strong>20. Góra dziedzictwa i świątynia (15:17):</strong> Proroctwo o zasadzeniu ludu na Górze Moria — w miejscu przyszłej świątyni ugruntowanej przez ręce Pana.</p>
              <p><strong>21. Wieczne panowanie Króla (15:18):</strong> „PAN będzie królował na wieki wieków” — ostateczna proklamacja eschatologicznego królestwa Boga.</p>
              <p><strong>22. Podsumowanie kontrastu ocalenia (15:19):</strong> Konie faraona utonęły w morzu, a synowie Izraela przeszli suchą stopą.</p>
            </div>
          </div>

          <!-- CZĘŚĆ III -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
              PIEŚŃ MIRIAM, BĘBENEK I TANIEC UWIELBIENIA (WJ 15:20–21)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>23. Miriam jako prorokini przymierza (15:20a):</strong> Po raz pierwszy w Biblii kobieta zostaje nazwana prorokinią (hebr. nebi'a).</p>
              <p><strong>24. Bębenek i taniec dziękczynienia (15:20b):</strong> Wszystkie niewiasty wychodzą z bębenkami — uwielbienie angażujące całe ciało, emocje i wspólnotę.</p>
              <p><strong>25. Śpiew responsoryjny (15:21a):</strong> Miriam przewodzi antyfonie chóru: „Śpiewajcie PANU, bo bardzo się wywyższył!”.</p>
              <p><strong>26. Pamiątka zwycięstwa nad koniem i jeźdźcem (15:21b):</strong> Kobiety powtarzają refren pieśni Mojżesza, pieczętując triumf wiary w sercach nowego pokolenia.</p>
            </div>
          </div>

          <!-- CZĘŚĆ IV -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
              PUSTYNIA SZUR, GORZKIE WODY MARA I SZEMRANIE LUDU (WJ 15:22–24)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>27. Wkroczenie w pustynię Szur (15:22a):</strong> Po euforii nad morzem rozpoczyna się surowa szkoła pustyni — droga uświęcenia.</p>
              <p><strong>28. Trzydniowe pragnienie (15:22b):</strong> Trzy dni marszu w spiekocie bez kropli wody wystawiają na próbę wiarę świeżo ocalonych niewolników.</p>
              <p><strong>29. Gorzkie rozczarowanie w Mara (15:23):</strong> Znalezienie wody rodzi nadzieję, lecz woda okazuje się gorzka (hebr. Mara) — bolesny cios dla spragnionych.</p>
              <p><strong>30. Ludzkie szemranie przeciw słudze Bożemu (15:24):</strong> „Co będziemy pić?” — zamiast modlitwy pojawia się pretensja, zwątpienie i oskarżenie.</p>
            </div>
          </div>

          <!-- CZĘŚĆ V -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
              DRZEWO PRZEMIANY, PRZYMIERZE UZDROWIENIA (JAHWE RAFFA) I OAZA ELIM (WJ 15:25–27)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>31. Krzyk modlitwy Mojżesza (15:25a):</strong> Mojżesz nie kłóci się z ludem, lecz natychmiast woła o pomoc do PANA.</p>
              <p><strong>32. Boże drzewo wrzucone w toń (15:25b):</strong> Bóg wskazuje konkretne drzewo, które wrzucone w gorzką wodę sprawia cudowną przemianę w słodki zdrój.</p>
              <p><strong>33. Ustawa, prawo i próba serca (15:25c):</strong> Bóg wykorzystuje Mara jako miejsce wychowawczej próby zaufania i posłuszeństwa.</p>
              <p><strong>34. Warunki przymierza zdrowia (15:26a):</strong> Pilne słuchanie głosu Boga, czynienie tego, co prawe, oraz zachowywanie przykazań.</p>
              <p><strong>35. Objawienie JAHWE RAFFA (15:26b):</strong> „Gdyż ja jestem PAN, który cię uzdrawia” — Bóg jako Najwyższy Lekarz ciała, duszy i ducha.</p>
              <p><strong>36. Błogosławieństwo oazy Elim (15:27):</strong> Dwanaście żywych źródeł i siedemdziesiąt palm — Bóg obficie wynagradza tych, którzy przetrwali próbę wierności.</p>
            </div>
          </div>`;

html = html.replace(/Pięć części studium Wj 14:1–31 \(36 punktów analitycznych\)/, `Pięć części studium Wj 15:1–27 (36 punktów analitycznych)`);
html = html.replace(/Pięć części studium Wj 11:1–12:36 \(42 punkty analityczne\)/, `Pięć części studium Wj 15:1–27 (36 punktów analitycznych)`);

html = html.replace(/<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM/, `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n          ${exegesisHtml}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM`);

// Jezus w centrum
const jezusHtml = `<div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
              <i class="fa-solid fa-cross text-brand-gold text-sm"></i>
              <span>1. Pieśń Mojżesza i Pieśń Baranka (Wj 15:1–3 a Obj 15:2–3)</span>
            </h3>
            <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
              W Księdze Objawienia odkupieni ze wszystkich narodów stoją nad szklanym morzem, śpiewając pieśń Mojżesza i pieśń Baranka. Zwycięstwo nad faraonem zapowiadało ostateczny triumf Chrystusa nad szatanem, grzechem i śmiercią.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
              <i class="fa-solid fa-cross text-brand-gold text-sm"></i>
              <span>2. Drzewo w Mara a Krzyż Golgoty (Wj 15:25 a Gal 3:13, 1 P 2:24)</span>
            </h3>
            <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
              Drzewo wrzucone w gorzką wodę jest proroczym obrazem Krzyża Chrystusa. Gdy w gorzkie wody ludzkiego grzechu i cierpienia wkracza ofiara Golgoty, wszelka gorycz zostaje przemieniona w źródło życia wiecznego.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
              <i class="fa-solid fa-cross text-brand-gold text-sm"></i>
              <span>3. JAHWE RAFFA — Jezus Boskim Lekarzem (Wj 15:26 a Mt 8:16–17, Iz 53:4–5)</span>
            </h3>
            <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
              Imię JAHWE RAFFA objawia się w pełni w Jezusie Chrystusie: „Jego ranami zostaliście uzdrowieni”. Zbawiciel uzdrawia ciało, duszę i umysł każdego, kto z wiarą przychodzi do Jego stóp.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
              <i class="fa-solid fa-cross text-brand-gold text-sm"></i>
              <span>4. Od Mara do Elim — Zdroje Wody Żywej (Wj 15:27 a J 7:37–39, Obj 22:1–2)</span>
            </h3>
            <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
              Dwanaście źródeł i siedemdziesiąt palm w Elim zapowiada pełnię Ducha Świętego. Jezus woła: „Jeśli ktoś pragnie, niech przyjdzie do mnie i pije!”. Za każdą próbą na pustyni czeka obfitość Bożego odpocznienia.
            </p>
          </div>`;

html = html.replace(/<div class="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── SPRAWDŹ W BIBLII/, `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\n          ${jezusHtml}\n        </div>\n      </section>\n\n      <!-- ── SPRAWDŹ W BIBLII`);

// Sprawdź w Biblii (12 wersetów)
const porownajHtml = `<p><strong>Wj 15:2 → Ps 118:14:</strong> „PAN moją mocą i pieśnią, i stał się moim zbawieniem”.</p>
          <p><strong>Wj 15:2 → Iz 12:2:</strong> „Oto Bóg jest moim zbawieniem; będę ufał i nie ulęknę się, gdyż PAN BÓG jest moją mocą i pieśnią”.</p>
          <p><strong>Wj 15:3 → Ps 24:8:</strong> „Któż jest tym Królem chwały? PAN silny i potężny, PAN dzielny w bitwie”.</p>
          <p><strong>Wj 15:11 → Ps 86:8:</strong> „Nie ma równego tobie wśród bogów, Panie, ani takich dzieł jak twoje”.</p>
          <p><strong>Wj 15:13 → Ps 77:20:</strong> „Prowadziłeś swój lud jak trzodę ręką Mojżesza i Aarona”.</p>
          <p><strong>Wj 15:18 → Obj 11:15:</strong> „Królestwa tego świata stały się królestwami naszego Pana i jego Chrystusa, i będzie królować na wieki wieków”.</p>
          <p><strong>Wj 15:20 → 1 Sm 18:6:</strong> „Kobiety ze wszystkich miast Izraela wychodziły naprzeciw króla Saula ze śpiewem i pląsami, przy bębenkach”.</p>
          <p><strong>Wj 15:23 → Rt 1:20:</strong> „Nie nazywajcie mnie Noemi, lecz nazywajcie mnie Mara, gdyż Wszechmocny napełnił mnie wielką goryczą”.</p>
          <p><strong>Wj 15:25 → 1 P 2:24:</strong> „On sam nasze grzechy poniósł w swoim ciele na drzewie, abyśmy obumarłszy grzechom, żyli dla sprawiedliwości; jego ranami zostaliście uzdrowieni”.</p>
          <p><strong>Wj 15:26 → Ps 103:2–3:</strong> „Błogosław, duszo moja, PANA... On przebacza wszystkie twoje nieprawości, leczy wszystkie twoje choroby”.</p>
          <p><strong>Wj 15:26 → Mt 8:17:</strong> „On wziął na siebie nasze słabości i nosił nasze choroby”.</p>
          <p><strong>Wj 15:27 → J 7:37–38:</strong> „Jeśli ktoś pragnie, niech przyjdzie do mnie i pije. Kto wierzy we mnie... z jego wnętrza popłyną rzeki wody żywej”.</p>`;

html = html.replace(/<div class="space-y-2\.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── PRAWDA NA DZIŚ/, `<div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">\n          ${porownajHtml}\n        </div>\n      </section>\n\n      <!-- ── PRAWDA NA DZIŚ`);

// Prawda na dziś (8 zasad)
const prawdaHtml = `<p><strong>1. Pierwsza reakcja to uwielbienie:</strong> Prawdziwa wiara odpowiada na Boże ocalenie pieśnią wdzięczności i adoracji (Wj 15:1).</p>
          <p><strong>2. Prawdziwa pieśń sławi Boga:</strong> W Pieśni Morza cała chwała należy do PANA, a nie do ludzkiej siły (Wj 15:2–3).</p>
          <p><strong>3. Rola kobiet w uwielbieniu:</strong> Miriam uczy nas, że radosne uwielbienie angażuje całą wspólnotę i budzi wiarę pokoleń (Wj 15:20–21).</p>
          <p><strong>4. Pustynia weryfikuje wiarę:</strong> Duchowa euforia musi zostać sprawdzona w codzienności marszu przez bezwodną pustynię (Wj 15:22).</p>
          <p><strong>5. Szemranie zatruwa, modlitwa ratuje:</strong> Zamiast szemrać i narzekać, zanieś swoje pragnienie w pokornej modlitwie przed tron Boga (Wj 15:24–25).</p>
          <p><strong>6. Krzyż uzdrawia życiową gorycz:</strong> Wrzuć wiarą Krzyż Chrystusa w swoje zranienia, rozczarowania i ból (Wj 15:25).</p>
          <p><strong>7. Posłuszeństwo i JAHWE RAFFA:</strong> Boża obietnica uzdrowienia łączy się z posłuszeństwem Jego słowu (Wj 15:26).</p>
          <p><strong>8. Za każdym Mara czeka Elim:</strong> Trudności są chwilowe; Bóg prowadzi swój lud ku oazom obfitego odpocznienia (Wj 15:27).</p>`;

html = html.replace(/<div class="space-y-2\.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── POMYŚL/, `<div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">\n          ${prawdaHtml}\n        </div>\n      </section>\n\n      <!-- ── POMYŚL`);

// Pomyśl (8 pytań)
const pomyslHtml = `<p>1. Czy w chwilach zwycięstw Twoją pierwszą reakcją jest szczere uwielbienie Boga (Wj 15:1–2)?</p>
          <p>2. Jak reagujesz, gdy zaledwie kilka dni po uniesieniu spotyka Cię pustynia i pragnienie (Wj 15:22–24)?</p>
          <p>3. Czy szemrzesz i narzekasz, czy natychmiast zanosisz sprawę w modlitwie do PANA (Wj 15:25)?</p>
          <p>4. Jaka „gorzka woda” w Twoim życiu wymaga dziś zanurzenia w uzdrawiającej mocy Krzyża?</p>
          <p>5. Czy doświadczasz Boga jako JAHWE RAFFA — Twojego osobistego Lekarza (Wj 15:26)?</p>
          <p>6. Czy Twoje posłuszeństwo Bogu wypływa z wdzięczności za zbawienie?</p>
          <p>7. W jaki sposób wspierasz innych, gdy przechodzą przez swoją pustynię Szur?</p>
          <p>8. Czy wierzysz, że za Twoim Mara Bóg przygotował oazę Elim (Wj 15:27)?</p>`;

html = html.replace(/<div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── QUIZ/, `<div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">\n          ${pomyslHtml}\n        </div>\n      </section>\n\n      <!-- ── QUIZ`);

// Quiz nagłówek
html = html.replace(/20 Pytań z Wj [0-9–:-]+/, `20 Pytań z Wj 15:1–27`);
html = html.replace(/Po przeczytaniu Wj [0-9–:-]+ odpowiedz na poniższe pytania\./, `Po przeczytaniu Wj 15 odpowiedz na poniższe pytania.`);

// Twoja decyzja
html = html.replace(/Wybierz Wolność bez Kompromisów[\s\S]*?w drogę wolności za Królem Królów!/, `Wybierz Przemianę Goryczy w Życie — Zaufaj Bogu jako JAHWE RAFFA!\nPiętnasty rozdział Księgi Wyjścia stawia przed każdym z nas fundamentalny wybór: czy w obliczu trudności ulegniesz pokusie szemrania, czy zawołasz do PANA i pozwolisz, by Krzyż Chrystusa dotknął Twojego bólu? Każde gorzkie źródło Mara to Boża szkoła wiary. Za Mara czeka Elim z dwunastoma źródłami i siedemdziesięcioma palmami! Oddaj dziś Bogu wszystkie swoje zranienia i wyznaj wiarę w Jezusa — Twojego Boskiego Lekarza.`);

// Modlitwa
html = html.replace(/Modlitwa na \d+ listopada/, `Modlitwa na 14 listopada`);
html = html.replace(/Modlitwa o [\s\S]*?<\/h3>/, `Modlitwa o Przemianę Życiowej Goryczy i Uzdrowienie w Chrystusie</h3>`);
const modlitwaTekst = `<p>
            Wszechmogący Boże, Święty Wojowniku i nasz Wieczny Zbawicielu! Z całego serca wysławiamy Twoje święte Imię. Twoja prawica wsławiła się mocą i skruszyła potęgę wroga, uwalniając nas z niewoli grzechu i potępienia.
          </p>
          <p>
            Dziękujemy Ci, Panie Jezu Chryste, że Ty jesteś naszą pieśnią, mocą i zbawieniem. Dziękujemy za drzewo Twojego Krzyża na Golgocie, które gładzi wszelką gorycz naszego życia i uwalnia nas od trucizny grzechu.
          </p>
          <p>
            Wyznajemy Cię dziś jako JAHWE RAFFA — naszego Najwyższego Lekarza. Dotknij Swoją uzdrawiającą łaską naszych ciał, ulecz zranienia naszych serc i usuń z naszych ust wszelkie szemranie. Poprowadź nas z pustyni do Twojej oazy Elim i bądź uwielbiony w całym naszym życiu, teraz i na wieki wieków. Amen!
          </p>`;
html = html.replace(/<div class="p-5 rounded-2xl bg-black\/40 border border-brand-border\/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS/, `<div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">\n          ${modlitwaTekst}\n        </div>\n      </section>\n\n      <!-- ── ZASTOSOWANIE I TWÓJ ZAPIS`);

// Zadania na dziś (7 zadań)
const tasksHtml = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj osobiście cały piętnasty rozdział Księgi Wyjścia (Wj 15:1–27) w przekładzie UBG.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zaśpiewaj lub odsłuchaj pieśń uwielbienia, dziękując Bogu za konkretne ocalenie i wyzwolenie w Twoim życiu.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Nazwij przed Bogiem swoje obecne „Mara” — gorzką sytuację lub zranienie — i poproś o dotknięcie Krzyża Chrystusa.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Przeczytaj Ps 103:1–5 oraz Iz 53:4–5, rozważając Boże imię przymierza JAHWE RAFFA.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zbadaj swoje słowa: czy przeważało w nich dziękczynienie, czy raczej narzekanie i szemranie?</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zapisz poniżej swoje osobiste dziękczynienie za Bożą wierność i uzdrowienie.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Podziel się dzisiejszym rozważaniem z osobą przeżywającą trudny czas na życiowej pustyni.</span>
          </label>`;

html = html.replace(/<div class="space-y-4 text-xs sm:text-sm text-zinc-300 font-serif">[\s\S]*?<\/div>\s*<div class="space-y-4 pt-2">/, `<div class="space-y-4 text-xs sm:text-sm text-zinc-300 font-serif">\n          <p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:</p>\n          ${tasksHtml}\n        </div>\n        <div class="space-y-4 pt-2">`);

// Zapowiedź Jutro
const jutroHtml = `<div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 15 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 46 — MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU: BOŻE ZAOPATRZENIE NA PUSTYNI (Wj 16:1–36)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Głód na pustyni Sin, deszcz chleba z nieba, przepiórki o zmierzchu oraz dar świętego odpoczynku Szabatu.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <a href="/akademia/kurscodzienny/dzien-46" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Czytaj Dzień 46 →</span>
          </a>
          <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
            ← Spis kursu
          </a>
        </div>`;

html = html.replace(/<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/, `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">\n        ${jutroHtml}\n      </section>`);

// Udostępnianie
html = html.replace(/kurscodzienny%2Fdzien-\d+/g, `kurscodzienny%2Fdzien-45`);
html = html.replace(/Dzień \d+/g, `Dzień 45`);
html = html.replace(/DAY_KEY = 'kc_day\d+'/g, `DAY_KEY = 'kc_day45'`);
html = html.replace(/Oznacz Dzień \d+ jako ukończony/g, `Oznacz Dzień 45 jako ukończony`);

// QUIZ_DATA (20 pytań dla Dnia 45)
const quizData45 = [
  {
    q: "Kto według Wj 15:1 zaśpiewał pieśń PANU nad brzegiem morza?",
    a: [
      "Sam Mojżesz w samotności na skale",
      "Mojżesz i synowie Izraela",
      "Aaron z synami kapłanami",
      "Miriam z córkami Lewiego"
    ],
    c: 1
  },
  {
    q: "Jak Mojżesz określa PANA w tekście pamięciowym (Wj 15:2)?",
    a: [
      "Jako ogień trawiący i wicher pustynny",
      "Jako moją moc, moją chwałę i moje zbawienie",
      "Jako króla narodów i pana niebios",
      "Jako mądrość przodków i tarczę synów"
    ],
    c: 1
  },
  {
    q: "Jakim niezwykłym tytułem PAN zostaje nazwany w Wj 15:3?",
    a: [
      "Panem żniwa",
      "Mężem wojny (JAHWE to Jego imię)",
      "Sędzią przymierza",
      "Pasterzem Izraela"
    ],
    c: 1
  },
  {
    q: "Co według Wj 15:4 stało się z rydwanami faraona i jego wojskiem?",
    a: [
      "Zostały spalone przez ogień z nieba",
      "PAN wrzucił je w morze, a wyborni dowódcy utonęli",
      "Rozbiły się o skały pustyni",
      "Zostały zdobyte przez Hebrajczyków"
    ],
    c: 1
  },
  {
    q: "Do czego w Wj 15:5 i 15:10 porównano opadnięcie egipskich żołnierzy na dno morza?",
    a: [
      "Do piasku pustyni i pyłu",
      "Do kamienia (15:5) oraz do ołowiu (15:10)",
      "Do pnia ściętego drzewa",
      "Do skorupy glinianego dzbana"
    ],
    c: 1
  },
  {
    q: "Co według Wj 15:6 wsławiło się mocą i rozbiło wroga?",
    a: [
      "Laska Mojżesza",
      "Prawica PANA",
      "Miecz Jozuego",
      "Tarcza przymierza"
    ],
    c: 1
  },
  {
    q: "Do czego przyrównano pożarcie wrogów przez Boży gniew w Wj 15:7?",
    a: [
      "Do pożarcia ścierniska",
      "Do stopienia wosku",
      "Do wysuszenia trawy",
      "Do powalenia cedrów Libanu"
    ],
    c: 0
  },
  {
    q: "Co spowodowało spiętrzenie fal morskich według Wj 15:8?",
    a: [
      "Uderzenie pioruna",
      "Tchnienie nozdrzy PANA",
      "Trzęsienie ziemi na dnie morza",
      "Wołanie aniołów"
    ],
    c: 1
  },
  {
    q: "Co zuchwale mówił wróg przed pościgiem w Wj 15:9?",
    a: [
      "Będę prosił o pokój i przymierze",
      "Będę ścigał, pochwycę, podzielę łup, dobędę miecza",
      "Pozwolę im odejść na pustynię",
      "Zbuduję nową stolicę w Memfis"
    ],
    c: 1
  },
  {
    q: "Jakie fundamentalne pytanie retoryczne pada w Wj 15:11?",
    a: [
      "Kto zdoła policzyć gwiazdy na niebie?",
      "Któż jest jak ty wśród bogów, PANIE? Chwalebny w świętości, straszliwy w chwałach!",
      "Kto pójdzie za nami do Kanaanu?",
      "Gdzie są bogowie Egiptu i ich świątynie?"
    ],
    c: 1
  },
  {
    q: "Które narody ościenne według Wj 15:14–15 ogarnął lęk na wieść o cudzie Morza Czerwonego?",
    a: [
      "Rzymian, Greków i Persów",
      "Filisteę, Edom, Moab i wszystkich mieszkańców Kanaanu",
      "Asyrię, Babilon i Tyrus",
      "Etiopię, Nubię i Libię"
    ],
    c: 1
  },
  {
    q: "Dokąd według Wj 15:17 PAN wprowadzi i zasadzi swój odkupiony lud?",
    a: [
      "Na żyzne pola delty Nilu",
      "Na górę swego dziedzictwa, do świątyni ugruntowanej przez Jego ręce",
      "W dolinę rzeki Eufrat",
      "Do warownych miast Hebronu"
    ],
    c: 1
  },
  {
    q: "Jaka proklamacja królewska zamyka pieśń Mojżesza w Wj 15:18?",
    a: [
      "Faraon ukorzy się przed Izraelem",
      "PAN będzie królował na wieki wieków",
      "Naród nasz posiądzie bogactwa ziemi",
      "Zbudujemy mury wokół Jerozolimy"
    ],
    c: 1
  },
  {
    q: "Kim była Miriam i jaki tytuł otrzymała w Wj 15:20?",
    a: [
      "Żoną Mojżesza i królową obozu",
      "Prorokinią, siostrą Aarona",
      "Sędzią plemienia Judy",
      "Kapłanką namiotu zgromadzenia"
    ],
    c: 1
  },
  {
    q: "Z jakim instrumentem i w jaki sposób kobiety wyszły za Miriam w Wj 15:20?",
    a: [
      "Z harfami i srebrnymi trąbami",
      "Z bębenkami i z tańcami",
      "Ze złotymi cymbałami",
      "Z fletami i lutniami"
    ],
    c: 1
  },
  {
    q: "Na jaką pustynię wyszedł Izrael po opuszczeniu Morza Czerwonego (Wj 15:22)?",
    a: [
      "Na pustynię Paran",
      "Na pustynię Szur",
      "Na pustynię Judzką",
      "Na pustynię Synaj"
    ],
    c: 1
  },
  {
    q: "Ile dni szedł lud przez pustynię bez znalezienia wody przed dotarciem do Mara (Wj 15:22)?",
    a: [
      "Jeden dzień",
      "Przez trzy dni",
      "Przez siedem dni",
      "Przez czterdzieści dni"
    ],
    c: 1
  },
  {
    q: "Dlaczego miejsce to nazwano „Mara” (Wj 15:23)?",
    a: [
      "Bo było tam mnóstwo jadowitych węży",
      "Bo wody były gorzkie (Mara oznacza gorycz)",
      "Bo stał tam samotny grobowiec",
      "Bo wiał tam gorący wiatr południowy"
    ],
    c: 1
  },
  {
    q: "Co PAN wskazał Mojżeszowi, aby uczynić wodę słodką (Wj 15:25)?",
    a: [
      "Naczynie z czystą solą",
      "Drzewo, które wrzucone do wody uczyniło ją słodką",
      "Żelazną laskę przymierza",
      "Źródło ukryte pod głazem"
    ],
    c: 1
  },
  {
    q: "Jakie imię przymierza i obietnicę złożył Bóg w Wj 15:26, a co czekało na lud w Elim (15:27)?",
    a: [
      "Jahwe Jireh na Synaju i miód w skalnych szczelinach",
      "JAHWE RAFFA („Ja jestem PAN, który cię uzdrawia”), a w Elim 12 źródeł wody i 70 palm",
      "Jahwe Nissi w bitwie i rzeka Jordan",
      "Jahwe Szalom w namiocie i studnie Jakuba"
    ],
    c: 1
  }
];

html = html.replace(/const QUIZ_DATA = \[[\s\S]*?\];/, `const QUIZ_DATA = ${JSON.stringify(quizData45, null, 2)};`);

// Zapisujemy Dzień 45 w 8 ścieżkach
const paths45 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-45.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-45/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-45.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-45/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-45/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-45/index.html'
];

for (const p of paths45) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 8 kompletnych kopii HTML Dnia 45 z autentyczną egzegezą i quizem Wj 15!');

// ── 7. AKTUALIZACJA BAZY ROZWAŻAŃ JSON ──
const jsonMirrors = [
  path.join(process.cwd(), 'rozwazania_baza.json'),
  path.join(process.cwd(), '.pages-release/rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json'
];

for (const m of jsonMirrors) {
  if (fs.existsSync(m)) {
    try {
      let data = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (Array.isArray(data)) {
        data = data.filter(item => item.day !== DAY_NUM && item.date !== DATE_STR);
        data.unshift({
          id: `ref_day${DAY_NUM}_${DATE_STR}`,
          day: DAY_NUM,
          date: DATE_STR,
          dateFormatted: DATE_FORMATTED,
          title: `☀️ Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE}`,
          book: BOOK,
          reading: READING,
          memoryVerse: MEMORY_VERSE,
          theme: THEME,
          fullText: rozwazanieJson.contentApp,
          contentApp: rozwazanieJson.contentApp,
          contentWeb: rozwazanieJson.contentWeb,
          contentSms: rozwazanieJson.contentSms,
          imageUrl: rozwazanieJson.imageUrl,
          authorName: 'Cezary Rogowski',
          authorUid: 'admin',
          authorSlug: 'cezaryrgowski'
        });
        fs.writeFileSync(m, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano ${m}`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji ${m}:`, e.message);
    }
  }
}

console.log('🎉 Kompletne generowanie lekcji Dnia 45 zakończone pełnym sukcesem!');
