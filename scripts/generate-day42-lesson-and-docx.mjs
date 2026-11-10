import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 42: Wj 11:1–12:36 (11 listopada 2026, Środa)
const DAY_NUM = 42;
const DATE_STR = '2026-11-11';
const DATE_FORMATTED = 'Środa, 11 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 11:1–12:36';
const TITLE = 'ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH';
const SUBTITLE = 'Ustanowienie Paschy, krew na odrzwiach w Goszen, sąd o północy nad bogami i pierworodnymi Egiptu oraz wyjście z domu niewoli (Wj 11:1–12:36)';
const MEMORY_VERSE = '„A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu.” (Wj 12:13, UBG)';
const THEME = 'Jedenasty i dwunasty rozdział Księgi Wyjścia stanowią teologiczny i historyczny zwornik całego Starego Testamentu. Bóg ogłasza dziesiątą plagę — śmierć pierworodnych Egiptu i sąd nad wszystkimi bogami imperium, a jednocześnie ustanawia Paschę jako wieczną pamiątkę i początek nowego kalendarza zbawienia. Krew baranka bez skazy na węgarach i nadprożu staje się jedyną tarczą przed aniołem niszczycielem. W nocnym pośpiechu lud Boży spożywa paschę z przaśnym chlebem i gorzkimi ziołami, przepasany i z laską w dłoni, po czym opuszcza dom niewoli, obdarowany srebrem i złotem. W Jezusie Chrystusie paschalny baranek znajduje swoje ostateczne wypełnienie: Chrystus, nasza Pascha, został ofiarowany za nas, a Jego najdroższa krew gładzi grzech świata i uwalnia nas na wieki ze szponów szatana.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 42 (Wj 11:1–12:36)...');

// ── 1. CZYTANIE DNIA (UBG) ──
const exo11Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-011.json');
const exo12Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-012.json');

const exo11Data = JSON.parse(fs.readFileSync(exo11Path, 'utf8'));
const exo12Data = JSON.parse(fs.readFileSync(exo12Path, 'utf8'));

// Wj 11:1–10 oraz Wj 12:1–36
const readingVerses = [
  ...exo11Data.verses.map(v => ({ ref: `Wj 11:${v.number}`, num: v.number, text: v.text })),
  ...exo12Data.verses.filter(v => v.number <= 36).map(v => ({ ref: `Wj 12:${v.number}`, num: v.number, text: v.text }))
];

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 11:1–10 — Zapowiedź śmierci pierworodnych</h3></div>',
  ...exo11Data.verses.map(v => `<p><span class="verse-num">11:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 12:1–36 — Ustanowienie Paschy, sąd o północy i wyjście</h3></div>',
  ...exo12Data.verses.filter(v => v.number <= 36).map(v => `<p><span class="verse-num">12:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 42 (11 listopada 2026): Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Wj 11:1–12:36)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Drugi

Czy zastanawiałeś się kiedyś, dlaczego pośród największego sądu i trzęsienia ziemi w historii Bóg nie kazał swojemu ludowi budować schronów ani walczyć mieczem, lecz polecił im schronić się za krwią niewinnego baranka?

Zatrzymaj się w ten świąteczny, środowy poranek, jedenastego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w kochające oblicze Twojego Niebiańskiego Ojca. Pozwól, by w ciszy Twojego serca wybrzmiało to fundamentalne pytanie: Tato, czy moje serce i całe moje życie są dziś bezpiecznie ukryte za drogocenną krwią Jezusa Chrystusa, mojego Baranka Paschalnego, czy też wciąż próbuję opierać swoje bezpieczeństwo na własnych zasługach, sile i ludzkich zabezpieczeniach?

W jedenastym i dwunastym rozdziale Księgi Wyjścia wkraczamy w sam punkt kulminacyjny historii wyzwolenia z Egiptu. Po dziewięciu plagach nadchodzi noc ostatecznego sądu nad panteonem bóstw Egiptu i nad wszelkim pierworodnym. Lecz dla synów Izraela ta noc nie staje się nocą rozpaczy, ale nocą narodzin nowego narodu i nowego kalendarza. Bóg ustanawia Paschę. Każda rodzina bierze jednorocznego baranka bez skazy, zabija go o zmierzchu, a jego krwią kropi węgary i nadproża swoich drzwi.

Pismo Święte mówi z absolutną jasnością: gdy ujrzę krew, ominę was i nie dotknie was plaga zniszczenia! To nie status społeczny, nie hebrajskie pochodzenie ani nie ludzka moralność chroniły mieszkańców Goszen, lecz wyłącznie obecność krwi przymierza na odrzwiach. Wewnątrz domu spożywano upieczone mięso z przaśnym chlebem i gorzkimi ziołami, w pośpiechu, z biodrami przepasanymi i laską w dłoni, gotowi do drogi ku wolności. O północy w całym Egipcie rozległ się wielki krzyk, gdyż nie było domu bez zmarłego, lecz nad synami przymierza rozpostarła się tarcza Bożej łaski. Faraon nakazał natychmiastowe opuszczenie kraju, a lud wyszedł z niewoli obdarowany przez Egipcjan złotem i srebrem jako należną zapłatą za lata ucisku.

W Jezusie Chrystusie ta prawda staje się wiecznym fundamentem naszego zbawienia. Apostoł Paweł pisał do Koryntian: Chrystus bowiem, nasza Pascha, został za nas ofiarowany! Na krzyżu Golgoty Boży Baranek bez skazy przelał swoją najświętszą krew, aby każdy, kto w Niego wierzy, nie zginął pod wiecznym sądem, ale miał życie wieczne. Dziś krew Chrystusa oczyszcza Twoje sumienie, łamie każdą niewolę grzechu i czyni Cię obywatelem Królestwa Bożego. Nie bój się nocy tego świata! Twoje życie jest pod krwią Baranka. Przepasz biodra wiarą i ruszaj w drogę za Twoim Zbawicielem. Błogosławionej, zwycięskiej i pełnej pokoju środy z Bogiem!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 42 (11 listopada 2026 r.)
📖 Księga Wyjścia 11:1–12:36: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych

Czy wiesz, dlaczego noc Paschy zmieniła kalendarz ludzkości i stała się wiecznym prawzorem Krzyża Golgoty?

W 42. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 11. i 12. rozdział Księgi Wyjścia (Wj 11:1–12:36: https://polskieradio.cc/mojabiblia?ref=Wj11:1-12:36). To historyczny punkt zwrotny przymierza: ustanowienie Baranka Paschalnego, ocalenie pierworodnych przez krew i triumfalne wyjście z domu niewoli.

Kluczowe filary dzisiejszego studium:

1. Zapowiedź dziesiątej plagi i łaska w oczach Egipcjan (Wj 11:1–10):
Bóg zapowiada ostatni, ostateczny cios w egipski system władzy — śmierć wszystkiego, co pierworodne, od następcy tronu faraona po niewolnicę przy żarnach. Jednocześnie Bóg nakazuje Izraelitom zażądać od sąsiadów srebra i złota, przywracając sprawiedliwość ekonomiczną za wieki darmowej pracy niewolniczej.

2. Początek nowego kalendarza zbawienia (Wj 12:1–2):
„Ten miesiąc będzie dla was początkiem miesięcy, pierwszym miesiącem roku” — spotkanie z odkupieniem Boga redefiniuje czas. Życie wierzącego nie liczy się według metryki świata, lecz od momentu spotkania z Barankiem Paschalnym.

3. Baranek bez skazy dla każdego domu (Wj 12:3–6):
Jednoroczny samiec bez wady, wybrany 10. dnia nisan i strzeżony do 14. dnia, zostaje zabity o zmierzchu. Każda rodzina potrzebuje osobistego zjednoczenia z ofiarą.

4. Znak Krwi na odrzwiach i obietnica ominięcia sądu (Wj 12:7, 13):
Krew na obu węgarach i nadprożu: „A gdy ujrzę krew, ominę was (hebr. pasachti) i nie dotknie was plaga zniszczenia!”. Jedynym kryterium ocalenia była obecność krwi zastępczej ofiary.

5. Wieczerza paschalna w pośpiechu i przaśny chleb (Wj 12:8–11, 15–20):
Mięso pieczone w ogniu z gorzkimi ziołami i przaśnikami (chlebem czystości bez zakwasu). Postawa pielgrzyma: biodra przepasane, buty na nogach, laska w dłoni — gotowość do natychmiastowego porzucenia Egiptu.

6. Sąd o północy, wielki krzyk i wyjście z Ramzes (Wj 12:29–36):
O północy Bóg uderza we wszystkie bóstwa Egiptu. Faraon w nocy wypędza Izraela. Około 600 tysięcy mężczyzn wraz z rodzinami rusza w drogę ku Ziemi Obiecanej.

7. Chrystus w centrum — Nasz Baranek Paschalny:
„Chrystus bowiem, nasza pascha, został za nas ofiarowany” (1 Kor 5:7). Krew Jezusa na krzyżu jest naszym jedynym i wiecznym schronieniem przed sądem Bożym (Rz 5:9; Hbr 9:14).

Kompletna lekcja biblijna z 42 punktami egzegezy, studium porównawczym, 20 pytaniami quizu i autozapisem decyzji:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-42

Błogosławionej środy pod bezpieczną ochroną Krwi Chrystusa! 🕊️

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 42 (Wj 12:13): „Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia”. Jezus Chrystus jest Twoim Barankiem Paschalnym. Odpocznij w pokoju pod Jego krwią! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym monumentalna grafika 16:9: hebrajski ojciec rodziny w krainie Goszen namaszczający gałązką hizopu węgary i nadproże wejścia do domu krwią baranka paschalnego. Wewnątrz domu ciepłe, złote światło lampy oliwnej i rodzina gotowa do wyjścia z laskami w dłoniach; na zewnątrz dramatyczny granat nocy sądu nad pałacami Memfis. Tytuł: DZIEŃ 42 — ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH.

[INTRO: NOC KTÓRA ZMIENIŁA BIEG HISTORII]
Noemi: Dzień dobry! Witamy państwa w czterdziestym drugim dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Dziś otwieramy jedenasty i dwunasty rozdział Księgi Wyjścia — noc, w której narodził się naród przymierza i w której Bóg dał światu prawzór Golgoty!
Sara: Witamy bardzo serdecznie! To najświętsza noc Starego Testamentu. Po dziewięciu plagach Bóg zsyła ostateczny sąd na Egipt i jego fałszywe bóstwa, ale swojemu ludowi daje cudowny znak ocalenia: Krew Baranka Paschalnego!

[ANALIZA PROBLEMOWA: TEOLOGIA KRWI I PRZAŚNIKÓW]
Noemi: Zwróćmy uwagę na słowa Boga z dwunastego rozdziału, wersetu trzynastego: „Gdy ujrzę krew, ominę was!”. Bóg nie powiedział: „Gdy ujrzę wasze dobre uczynki, waszą inteligencję czy wasze pochodzenie”. Jedynym kryterium ocalenia przed aniołem niszczycielem była krew na węgarach i nadprożu!
Sara: Dokładnie tak! I to krew zastosowana wiarą. Trzeba było wziąć wiązkę hizopu, zanurzyć w misie z krwią i dotknąć nią drzwi. Co więcej, nikt nie mógł wychodzić za próg domu aż do rana. Bezpieczeństwo było wyłącznie wewnątrz domu naznaczonego krwią. A na stole: upieczony w ogniu baranek, przaśny chleb bez zakwasu i gorzkie zioła przypominające o niewoli!

[SZCZYT CHRYSTOCENTRYCZNY: CHRYSTUS NASZĄ PASCHĄ]
Noemi: I tutaj Stary Testament łączy się w doskonałą jedność z Nowym Testamentem. Apostoł Paweł w Pierwszym Liście do Koryntian mówi wprost: „Chrystus bowiem, nasza pascha, został za nas ofiarowany!”.
Sara: Jan Chrzciciel nad Jordanem zawołał: „Oto Baranek Boży, który gładzi grzech świata!”. Jezus jest Barankiem bez skazy i bez zmazy. Żadna Jego kość nie została połamana na krzyżu. Jego krew przelana na Golgocie raz na zawsze gładzi nasz grzech i chroni nas przed wiecznym potępieniem!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Sara: Nasze hasło na dziś: „Gdy ujrzę krew, ominę was!” (Wj 12:13).
Noemi: Wejdźcie dziś na polskieradio.cc/akademia, rozwiążcie dwadzieścia pytań quizu i zbadajcie swoje serca: czy Wasze życie jest w całości powierzone Chrystusowi i obmyte Jego krwią?

[MODLITWA BOJOWA]
Noemi i Sara razem: „Ojcze Niebieski, dziękujemy Ci za dar Baranka Paschalnego — Jezusa Chrystusa! Dziękujemy za Jego drogocenną krew, która chroni nas przed sądem, niszczycielem i wszelkim lękiem. Usuń z naszych serc wszelki kwas grzechu i obłudy. Daj nam gotowość pielgrzymów do codziennego chodzenia w Twojej prawdzie. W imieniu Jezusa Chrystusa. Amen!”

[OUTRO]
Noemi: Kompletne materiały, quiz wiedzy i komentarz werset po wersecie znajdziecie bezpłatnie na polskieradio.cc.
Sara: Do zobaczenia jutro w trzynastym rozdziale Księgi Wyjścia — Filar obłoku, filar ognia i droga przez pustynię! Z Biblią za Pan Brat!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

(polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: SOTERIOLOGIA KRWI I DEMONTAŻ MONARCHII SAKRALNEJ: EGZEGEZA TEOLOGICZNA WJ 11:1–12:36

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 11 listopada 2026 r.

W ramach programu formacji biblijnej „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje studium egzegetyczne jedenastego i dwunastego rozdziału Księgi Wyjścia. Wydarzenia nocy paschalnej (14 nisan) stanowią centralny węzeł teologiczny hebrajskiego Pięcioksięgu, inaugurując narodziny wspólnoty przymierza oraz reorientację kalendarza sakralnego. Egzegeza tekstu odsłania jurydyczny charakter dziesiątej plagi, substytucyjną naturę ofiary paschalnej oraz jej ścisłą typologię nowotestamentową w dziele Jezusa Chrystusa.

1. DZIESIĄTA PLAGA JAKO SĄD NAD SAKRALNĄ MONARCHIĄ (WJ 11:1–10; 12:29–30)
Śmierć pierworodnych (hebr. bechor) uderzyła bezpośrednio w fundament teologiczny egipskiego państwa. Faraon był czczony jako wcielenie Horusa, a jego pierworodny syn stanowił żywą gwarancję boskiej ciągłości dynastii. Sąd Boży o północy obalił to roszczenie, dowodząc, że jedynym Suwerenem życia i śmierci jest JAHWE („nad wszystkimi bogami Egiptu dokonam sądu, Ja, PAN” — Wj 12:12).

2. KALENDARZ REDEMPCYJNY: CZAS MIERZONY WYZWOLENIEM (WJ 12:1–2)
Ustanowienie miesiąca Abib (późniejszego Nisan) jako „początku miesięcy” (hebr. rosz chadaszim) oznaczało radykalne zerwanie z egipską rachubą czasu opartą na cyklach wylewów Nilu i pogańskich świętach solarnych. Od tej pory tożsamość człowieka wierzącego jest definiowana przez akt odkupienia, a nie przez uwarunkowania przyrodnicze czy imperia polityczne.

3. TEOLOGIA BARANKA SUBSTYTUCYJNEGO (WJ 12:3–6)
Wymóg wyboru jednorocznego samca „bez skazy” (hebr. tamim) ustanawiał kanon ofiary zastępczej. Baranek nie umierał za własny brak, lecz w miejsce pierworodnego w każdym domu przymierza. Czterodniowy okres obserwacji zwierzęcia (od 10 do 14 nisan) służył drobiazgowej weryfikacji jego nienaganności — cechy profetycznie zapowiadającej absolutną bezgrzeszność Chrystusa (1 P 1:19).

4. APLIKACJA KRWI NA WĘGARY I ZASADA OMINIĘCIA (WJ 12:7, 13, 22–23)
Zanurzenie gałązki hizopu w misie z krwią i pokropienie węgarów oraz nadproża stanowiło publiczny akt wiary. Hebrajski termin „pasach” (stąd Pesach) oznacza dosłownie „przejść obok, oszczędzić, rozpostrzeć skrzydła ochronne”. Pismo podkreśla obiektywny charakter znaku: „Gdy ujrzę krew, ominę was”. Ocalenie nie zależało od subiektywnego stanu emocjonalnego domowników, lecz od obecności zastępczej krwi na futrynie.

5. PRZAŚNIKI, GORZKIE ZIOŁA I POŚPIECH PIELGRZYMA (WJ 12:8–11, 14–20)
Kombinacja pieczonego mięsa, przaśnego chleba (hebr. macca) i gorzkich ziół (hebr. merorim) łączyła pamięć o cierpieniu niewoli z wezwaniem do natychmiastowego uświęcenia (usunięcie zakwasu jako symbolu zepsucia moralnego — por. 1 Kor 5:7–8). Nakaz spożywania posiłku w szatach podróżnych z laską w dłoni uczył, że usprawiedliwienie natychmiast pociąga za sobą radykalne wyruszenie w drogę uświęcenia.

6. RESTYTUCJA EKONOMICZNA I WYJŚCIE Z RAMZES (WJ 12:31–36)
„Pożyczenie” od Egipcjan srebra, złota i szat nie było grabieżą, lecz prawną wypłatą zaległego wynagrodzenia za wieki niewolniczej pracy, zapowiedzianą już Abrahamowi w Rdz 15:14. Lud Boży opuścił imperium nie jako uciekinierzy, lecz jako zwycięskie zastępy Pana.

7. CHRYSTOCENTRYCZNY SZCZYT ODKUPIENIA
W perspektywie Nowego Testamentu wieczerza paschalna osiąga pełnię w Ostatniej Wieczerzy i Ofierze Krzyżowej. Chrystus wziął chleb przaśny i kielich, ogłaszając Nowe Przymierze w Swojej Krwi (Łk 22:19–20). Krew Jezusa oczyszcza sumienia z martwych uczynków (Hbr 9:14), pieczętując wieczne wyzwolenie z niewoli szatana i grzechu.

📌 PODSUMOWANIE REDAKCYJNE CCN
Noc paschalna w 12. rozdziale Księgi Wyjścia objawia sedno Bożej ewangelii łaski: przed sprawiedliwym sądem Bożym ocalić może wyłącznie Krew Baranka przyjęta przez wiarę i posłuszeństwo.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl`;

// ── 3. TEKST LEKCJI DLA DOCX ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 42
ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH
Ustanowienie Paschy, krew na odrzwiach w Goszen, sąd o północy nad bogami i pierworodnymi Egiptu oraz wyjście z domu niewoli (Wj 11:1–12:36)
Środa, 11 listopada 2026 r.  |  Czytanie: Wj 11:1–12:36
TEKST PAMIĘCIOWY: „A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu.” (Wj 12:13, UBG)
MYŚL PRZEWODNIA: Jedenasty i dwunasty rozdział Księgi Wyjścia stanowią teologiczny i historyczny zwornik całego Starego Testamentu. Bóg ogłasza dziesiątą plagę — śmierć pierworodnych Egiptu i sąd nad wszystkimi bogami imperium, a jednocześnie ustanawia Paschę jako wieczną pamiątkę i początek nowego kalendarza zbawienia. Krew baranka bez skazy na węgarach i nadprożu staje się jedyną tarczą przed aniołem niszczycielem. W nocnym pośpiechu lud Boży spożywa paschę z przaśnym chlebem i gorzkimi ziołami, przepasany i z laską w dłoni, po czym opuszcza dom niewoli, obdarowany srebrem i złotem. W Jezusie Chrystusie paschalny baranek znajduje swoje ostateczne wypełnienie: Chrystus, nasza Pascha, został ofiarowany za nas, a Jego najdroższa krew gładzi grzech świata i uwalnia nas na wieki ze szponów szatana.

ZANIM OTWORZYSZ BIBLIĘ
Jedenasty i dwunasty rozdział Księgi Wyjścia przenoszą nas w sam środek nocy, która na zawsze przedzieliła historię ludzkości na czas przed i po wyzwoleniu. Po dziewięciu plagach, które skompromitowały bóstwa Nilu, rolnictwa, bydła i słońca, Bóg przystępuje do ostatecznego rozstrzygnięcia. Władca Egiptu uważał się za wcielenie bóstwa, a swojego pierworodnego syna za kolejnego boga na tronie. Dziesiąta plaga — śmierć pierworodnych — to bezpośredni wyrok Najwyższego Sędziego nad pychą tyrana i całym panteonem pogańskich ułud.
W tym samym momencie Bóg daje Izraelowi prawo Paschy. Ocalenie nie przychodzi przez walkę zbrojną, spryt dyplomatyczny ani ludzkie zasługi. Jedynym ratunkiem jest krew jednorocznego baranka bez skazy, nałożona gałązką hizopu na węgary i nadproża domostw. Wewnątrz domu rodzina spożywa upieczoną ofiarę z chlebem przaśnym i gorzkimi ziołami. Gdy anioł niszczyciel przechodzi przez ziemię egipską o północy, krew na drzwiach staje się nienaruszalną granicą łaski: „Gdy ujrzę krew, ominę was!”.
Zrozumienie Paschy w Księdze Wyjścia jest absolutnym kluczem do zrozumienia Nowego Testamentu. Jan Chrzciciel nazwie Jezusa „Barankiem Bożym”, Paweł ogłosi: „Chrystus, nasza Pascha, został ofiarowany”, a Apostoł Piotr przypomni nam, że zostaliśmy wykupieni nie srebrem ani złotem, lecz drogocenną krwią Chrystusa jako Baranka nienagannego i nieskalanego. Otwórzmy ten święty tekst z drżeniem serca i wdzięcznością za nasze wieczne odkupienie.

TEKST PISMA ŚWIĘTEGO — CZYTANIE DNIA (WJ 11:1–12:36, UBG)
Wj 11:1 I PAN powiedział do Mojżesza: Sprowadzę jeszcze jedną plagę na faraona i na Egipt, potem wypuści was stąd. A gdy was wypuści, całkowicie was stąd wypędzi.
Wj 11:2 Powiedz teraz do uszu ludu, aby każdy mężczyzna pożyczył od swego sąsiada i każda kobieta od swej sąsiadki srebrne i złote przedmioty.
Wj 11:3 A PAN dał ludowi łaskę w oczach Egipcjan. Mojżesz także był bardzo wielkim mężem w ziemi Egiptu w oczach sług faraona i w oczach ludu.
Wj 11:4 Wtedy Mojżesz powiedział: Tak mówi PAN: O północy przejdę przez Egipt.
Wj 11:5 I umrze wszystko, co pierworodne w ziemi Egiptu, od pierworodnego syna faraona, który miał zasiadać na jego tronie, aż do pierworodnego niewolnicy, która jest przy żarnach, i wszelkie pierworodne bydła.
Wj 11:6 I będzie wielki krzyk w całej ziemi Egiptu, jakiego nigdy przedtem nie było i jakiego potem nie będzie.
Wj 11:7 Ale na nikogo z synów Izraela pies nie ruszy swym językiem, ani na człowieka, ani na bydlę, abyście wiedzieli, że PAN uczynił różnicę między Egipcjanami a Izraelem.
Wj 11:8 I przyjdą do mnie wszyscy twoi słudzy, i będą mi się kłaniać, mówiąc: Wyjdź ty i cały lud, który jest pod twoim przywództwem. Potem wyjdę. I wyszedł od faraona z wielkim gniewem.
Wj 11:9 PAN powiedział do Mojżesza: Faraon nie posłucha was, aby mnożyły się moje cuda w ziemi Egiptu.
Wj 11:10 Mojżesz i Aaron czynili więc te wszystkie cuda przed faraonem. Lecz PAN zatwardził serce faraona i ten nie wypuścił synów Izraela ze swojej ziemi.

Wj 12:1 PAN powiedział jeszcze do Mojżesza i Aarona w ziemi Egiptu:
Wj 12:2 Ten miesiąc będzie dla was początkiem miesięcy, będzie dla was pierwszym miesiącem roku.
Wj 12:3 Powiedzcie całemu zgromadzeniu Izraela: Dziesiątego dnia tego miesiąca każdy weźmie sobie baranka dla rodziny, jednego baranka dla domu.
Wj 12:4 A jeśli rodzina jest zbyt mała, aby zjeść baranka, niech dobierze go razem z sąsiadem, który jest najbliższy jej domu, według liczby dusz, naliczywszy tyle osób, ile mogłoby zjeść baranka.
Wj 12:5 Wasz baranek ma być bez skazy, jednoroczny samiec. Weźmiecie go spośród owiec albo kóz.
Wj 12:6 Będziecie go strzegli aż do czternastego dnia tego miesiąca, a wtedy całe zgromadzenie Izraela zabije go pod wieczór.
Wj 12:7 Potem wezmą z jego krwi i pokropią oba węgary i nadproże domu, w którym będą go spożywać.
Wj 12:8 I będą jeść tej nocy mięso pieczone przy ogniu i przaśny chleb; będą je jeść z gorzkimi ziołami.
Wj 12:9 Nie jedzcie z niego nic surowego ani ugotowanego w wodzie, lecz tylko upieczone przy ogniu, z jego głową, nogami i wnętrznościami.
Wj 12:10 Nie zostawicie z niego niczego do rana; a jeśliby coś z niego zostało do rana, spalicie to w ogniu.
Wj 12:11 Tak oto będziecie go spożywać: Wasze biodra będą przepasane, obuwie na waszych nogach i laska w waszym ręku. Będziecie go jeść pośpiesznie. To Pascha PANA.
Wj 12:12 Gdyż tej nocy przejdę przez ziemię Egiptu i zabiję wszystko, co pierworodne w ziemi Egiptu, od człowieka aż do zwierzęcia, a nad wszystkimi bogami Egiptu dokonam sądu, ja, PAN.
Wj 12:13 A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu.
Wj 12:14 Ten dzień będzie dla was pamiątką i będziecie go obchodzić jako święto dla PANA po wszystkie pokolenia. Będziecie go obchodzić jako ustawę wieczną.
Wj 12:15 Przez siedem dni będziecie jeść przaśny chleb. Już w pierwszym dniu usuniecie zakwas z waszych domów, bo ktokolwiek będzie jadł coś kwaszonego, od pierwszego dnia aż do siódmego, ta dusza zostanie wykluczona z Izraela.
Wj 12:16 W tym pierwszym dniu będzie święte zgromadzenie, także siódmego dnia będziecie mieć święte zgromadzenie. W tych dniach nie będziecie wykonywać żadnej pracy. Będzie wam tylko wolno przygotować to, czego każdy potrzebuje do jedzenia.
Wj 12:17 I będziecie obchodzić Święto Przaśników, bo w tym właśnie dniu wyprowadziłem wasze zastępy z ziemi Egiptu. Dlatego będziecie obchodzić ten dzień po wszystkie pokolenia jako ustawę wieczną.
Wj 12:18 W pierwszym miesiącu, od wieczora czternastego dnia tego miesiąca do wieczora dnia dwudziestego pierwszego tego miesiąca, będziecie jeść przaśny chleb.
Wj 12:19 Przez siedem dni nie znajdzie się żaden zakwas w waszych domach. Ktokolwiek bowiem będzie jadł coś kwaszonego, ta dusza zostanie wykluczona ze zgromadzenia Izraela, zarówno przybysz, jak i urodzony w tej ziemi.
Wj 12:20 Nie będziecie jeść nic kwaszonego; we wszystkich waszych domach będziecie jeść przaśne chleby.
Wj 12:21 Wtedy Mojżesz wezwał wszystkich starszych Izraela i powiedział im: Wybierzcie i weźcie sobie baranka dla swych rodzin i zabijcie go jako paschę.
Wj 12:22 Weźmiecie też wiązkę hizopu i zanurzycie we krwi, która jest w misie, i pokropicie nadproże i oba węgary tą krwią, która jest w misie. Niech nikt z was nie wychodzi za drzwi swego domu aż do rana.
Wj 12:23 PAN bowiem przejdzie, aby zabijać Egipcjan, a gdy ujrzy krew na nadprożu i na obu węgarach, PAN ominie drzwi i nie pozwoli niszczycielowi wejść do waszych domów, aby was zabić.
Wj 12:24 Będziecie przestrzegać tego jako ustawy dla ciebie i twoich synów aż na wieki.
Wj 12:25 Kiedy wejdziecie do ziemi, którą da wam PAN, jak to obiecał, będziecie przestrzegać tego obrzędu.
Wj 12:26 A gdy wasi synowie zapytają was: Co oznacza ten wasz obrzęd?
Wj 12:27 Wtedy odpowiecie: To ofiara paschy PANA, który ominął domy synów Izraela w Egipcie, gdy zabijał Egipcjan, a nasze domy ocalił. Potem lud schylił się i oddał pokłon.
Wj 12:28 I synowie Izraela odeszli, i uczynili, jak PAN rozkazał Mojżeszowi i Aaronowi, tak właśnie zrobili.
Wj 12:29 A o północy PAN zabił wszystko, co pierworodne w ziemi Egiptu, od pierworodnego syna faraona, zasiadającego na jego tronie, aż do pierworodnego więźnia, który był w więzieniu, oraz wszystko, co pierworodne z bydła.
Wj 12:30 Wstał tej nocy faraon, a z nim wszyscy jego słudzy oraz wszyscy Egipcjanie; i podniósł się w Egipcie wielki krzyk, bo nie było domu, w którym nie byłoby umarłego.
Wj 12:31 Faraon wezwał Mojżesza i Aarona w nocy i powiedział: Wstańcie, wyjdźcie spośród mego ludu, wy i synowie Izraela. Idźcie i służcie PANU, jak mówiliście.
Wj 12:32 Zabierzcie też swoje trzody i bydła, jak żądaliście, i idźcie. Mnie też błogosławcie.
Wj 12:33 I Egipcjanie przynaglali lud, aby ich jak najszybciej wyprawić z ziemi, bo mówili: Wszyscy pomrzemy.
Wj 12:34 Wziął więc lud swoje ciasto, zanim się zakwasiło, i dzieże owinięte w swoje szaty i kładli je na swoje ramiona.
Wj 12:35 Synowie Izraela postąpili według nakazu Mojżesza i pożyczyli od Egipcjan srebrne i złote przedmioty oraz szaty.
Wj 12:36 A PAN dał ludowi łaskę w oczach Egipcjan, tak że im pożyczyli. I złupili Egipcjan.

CZĘŚĆ I — ZAPOWIEDŹ DZIESIĄTEJ PLAGI I UPRZYWILEJOWANIE LUDU (WJ 11:1–10)
1. Ostatni cios sądu (11:1a): Bóg zapowiada nadejście jednej, ostatecznej plagi, po której opór faraona zostanie ostatecznie złamany.
2. Całkowite wypędzenie (11:1b): Tyran, który wzbraniał wyjścia, wkrótce sam w pośpiechu i panicznym strachu wypędzi lud Boży ze swoich granic.
3. Sprawiedliwa restytucja majątkowa (11:2): Nakaz prośby o złoto i srebro stanowi Bożą rekompensatę za pokolenia niewolniczego trudu przy budowie miast imperium.
4. Szacunek w oczach wrogów (11:3): Bóg daje swemu ludowi i Mojżeszowi niezwykły autorytet w oczach urzędników i ludu Egiptu.
5. Północna godzina sądu (11:4): „O północy przejdę przez Egipt” — wyznaczenie precyzyjnego terminu Bożej interwencji w samo jądro egipskiej nocy.
6. Uniwersalność wyroku na pychę (11:5): Od dziedzica tronu aż po niewolnicę przy żarnach — żaden status społeczny nie ocali pogańskiego buntu przed sprawiedliwością.
7. Bezprecedensowy krzyk rozpaczy (11:6): Egipt doświadcza lamentu, jakiego nie było w całych jego dziejach, gdy ginie pokolenie nadziei imperium.
8. Cudowne rozdzielenie Goszen (11:7): Nawet pies nie szczeknie na synów Izraela — Bóg w widoczny sposób okazuje różnicę między bezbożnym Egiptem a Jego ludem.

CZĘŚĆ II — NOWY KALENDARZ I BARANEK PASCHALNY (WJ 12:1–10)
9. Reset czasu przymierza (12:1–2): Miesiąc Abib (Nisan) staje się początkiem nowego roku; prawdziwe życie człowieka liczy się od momentu odkupienia.
10. Baranek dla każdego domu (12:3): Odkupienie ma wymiar osobisty i rodzinny; każdy dom musi posiadać własną ofiarę przymierza.
11. Wspólnota i solidarność sąsiedzka (12:4): Małe rodziny łączą się z sąsiadami, aby żadna cząstka daru Bożego nie została zmarnowana.
12. Doskonałość ofiary bez skazy (12:5a): Baranek ma być samcem jednorocznym, absolutnie zdrowym i bez wady (hebr. tamim).
13. Czterodniowa próba wierności (12:6a): Wybór 10. dnia i strzeżenie do 14. dnia nisan pozwalało na dokładną inspekcję zwierzęcia przed ofiarowaniem.
14. Godzina wieczornej ofiary (12:6b): Zabicie baranka pod wieczór (hebr. bejn haarba’im — między wieczorami) zapowiada godzinę śmierci Chrystusa.
15. Znamię krwi na odrzwiach (12:7): Pokropienie węgarów i nadproża stanowiło publiczną tarczę wiary oddzielającą domowników od potępienia.
16. Ogień, przaśniki i gorzkie zioła (12:8–10): Pieczenie w ogniu symbolizuje pełnię sądu Bożego; zioła przypominają gorycz niewoli, a przaśniki wzywają do czystości serca.

CZĘŚĆ III — POŚPIECH PIELGRZYMA I ŚWIĘTO PRZAŚNIKÓW (WJ 12:11–20)
17. Postawa gotowości do drogi (12:11a): Biodra przepasane, obuwie na nogach i laska w ręku — zbawiony człowiek nie mości się w świecie, lecz jest pielgrzymem.
18. Pośpieszne spożywanie Paschy (12:11b): Zbawienie wymaga natychmiastowej decyzji zerwania z przeszłością i gotowości do pójścia za Bożym wezwaniem.
19. Sąd nad bogami Egiptu (12:12): Pascha to nie tylko ocalenie ludzi, ale publiczne zdemaskowanie niemocy panteonu demonicznych bóstw Nilu.
20. Obiektywna tarcza krwi (12:13a): „Gdy ujrzę krew, ominę was” — fundamentem pokoju nie jest ludzkie samopoczucie, lecz Boże spojrzenie na krew ofiary.
21. Wieczna pamiątka pokoleń (12:14): Pascha zostaje ustanowiona jako ustawa wieczna, kształtująca tożsamość dzieci Bożych po wszystkie czasy.
22. Siedmiodniowe Święto Przaśników (12:15): Całkowite usunięcie zakwasu z domostw jako warunek trwania w przymierzu ze Świętym Bogiem.
23. Święte zgromadzenia pierwszego i siódmego dnia (12:16): Odpoczynek od codziennej pracy i poświęcenie czasu na uroczyste wielbienie Odkupiciela.
24. Nakaz czystości od zakwasu (12:17–20): Zakwas jako symbol pychy, hipokryzji i grzechu musi zostać bezwzględnie usunięty z życia wspólnoty.

CZĘŚĆ IV — POSŁUSZEŃSTWO WIARY I OCHRONA PRZED NISZCZYCIELEM (WJ 12:21–28)
25. Zwołanie starszyzny Izraela (12:21): Mojżesz przekazuje instrukcje paschalne przywódcom, uruchamiając posłuszeństwo całego ludu.
26. Wiązka hizopu i misa z krwią (12:22a): Hizop — roślina pokory i oczyszczenia — służy do przeniesienia krwi z naczynia na futrynę domu.
27. Zakaz wychodzenia za próg (12:22b): „Niech nikt z was nie wychodzi za drzwi swego domu aż do rana” — bezpieczeństwo istnieje wyłącznie pod krwią przymierza.
28. Boża tarcza przed aniołem niszczycielem (12:23): Sam PAN strzeże wejścia do domów oznaczonych krwią, nie dopuszczając śmierci do wnętrza.
29. Wychowanie międzypokoleniowe (12:24–26): Pytanie dzieci: „Co oznacza ten wasz obrzęd?” staje się szkołą żywej wiary i wdzięczności.
30. Świadectwo ocalenia rodzin (12:27a): Odpowiedź rodziców przypomina o Bożej suwerennej łasce, która ominęła hebrajskie domy w nocy sądu.
31. Pokłon adoracji i wdzięczności (12:27b): Wobec majestatu Bożego planu lud upada na twarz w głębokim dziękczynieniu.
32. Precyzyjne posłuszeństwo nakazom (12:28): Izraelici uczynili dokładnie tak, jak nakazał PAN przez Mojżesza i Aarona — wiara wyraża się w posłuszeństwie.

CZĘŚĆ V — SĄD O PÓŁNOCY, KRZYK W EGIPCIE I WYJŚCIE (WJ 12:29–36)
33. Uderzenie o północy (12:29a): W najciemniejszej godzinie nocy PAN wykonuje sprawiedliwy wyrok nad pierworodnymi w całej krainie Nilu.
34. Porażka dynastycznego bóstwa (12:29b): Śmierć syna faraona obnaża bezsilność roszczeń władcy podającego się za potomka boga Ra.
35. Nocny zryw monarchy i dworzan (12:30a): Faraon wstaje w środku nocy, skonfrontowany z nieodwracalną klęską swojej pychy.
36. Żałoba w każdym egipskim domu (12:30b): Powszechny krzyk w Egipcie — nie było rodziny, w której nie leżałby zmarły pierworodny.
37. Nocne wezwanie Mojżesza i Aarona (12:31): Złamany monarcha wzywa proroków w ciemności i nakazuje natychmiastowe opuszczenie kraju.
38. Zgoda na pełne uwielbienie (12:32a): Faraon zezwala na zabranie stad i dzieci — bezwarunkowa kapitulacja wobec żądania: „Ani jedno kopyto nie zostanie!”.
39. Błaganie o błogosławieństwo (12:32b): Pogański monarcha prosi Mojżesza o modlitwę wstawienniczą: „Mnie też błogosławcie!”.
40. Panika i przynaglanie Egipcjan (12:33): Mieszkańcy Egiptu wypychają Izraelitów w lęku przed całkowitą zagładą biologiczną.
41. Chleb w dzieżach na ramionach (12:34): W pośpiechu lud zabiera niezakwaszone ciasto w szatach — żywa ilustracja pośpiechu wyjścia z grzechu.
42. Triumfalne ogołocenie niewoli (12:35–36): Bóg napełnia Egipcjan życzliwością, dzięki czemu lud Boży otrzymuje bogate dary na drogę do Ziemi Obiecanej.

JEZUS W CENTRUM
1. Jezus Chrystus — Nasz Prawdziwy Baranek Paschalny (Wj 12:3–6 a 1 Kor 5:7, J 1:29)
Baranek paschalny w Egipcie był proroczą zapowiedzią Jezusa Chrystusa. Gdy Jan Chrzciciel ujrzał Jezusa idącego ku niemu, zawołał: „Oto Baranek Boży, który gładzi grzech świata!”. Chrystus nie przyszedł, aby złożyć ofiarę z tysięcy zwierząt, lecz sam ofiarował samego siebie jako doskonałego, jednorocznego Baranka bez skazy. Apostoł Paweł ogłasza z mocą: „Chrystus bowiem, nasza pascha, został za nas ofiarowany”.

2. Baranek bez skazy i nienaruszona kość (Wj 12:5, 46 a 1 P 1:18–19, J 19:36)
Baranek w Egipcie musiał być nienaganny i zdrowy, a żadna jego kość nie mogła być złamana. Gdy żołnierze rzymscy na Golgocie łamali golenie ukrzyżowanym złoczyńcom, podeszli do Jezusa i ujrzeli, że już umarł, dlatego nie połamali Jego nóg, „aby wypełniło się Pismo: Kość jego nie będzie złamana”. Piotr Apostoł przypomina, że zostaliśmy wykupieni „drogocenną krwią Chrystusa jako baranka niewinnego i nieskalanego”.

3. Krew Przebłagania na odrzwiach serca (Wj 12:7, 13 a Rz 3:25, Hbr 9:14, 22)
Krew na drewnianych odrzwiach domostw układała się w kształt krzyża: dwa węgary pionowe i poziome nadproże. Bóg obiecał: „Gdy ujrzę krew, ominę was!”. Dziś krew Chrystusa, zastosowana przez wiarę w Twoim sercu, stanowi jedyną i niezachwianą ochronę przed wiecznym potępieniem. W Nim mamy odkupienie przez krew Jego i odpuszczenie grzechów.

4. Chleb Przaśny i Nowe Przymierze — Wieczerza Pańska (Wj 12:8, 14 a Łk 22:19–20, 1 Kor 11:23–26)
Podczas ostatniej wieczerzy paschalnej w Jerozolimie Pan Jezus wziął przaśny chleb, połamał go i dał uczniom, mówiąc: „To jest ciało moje, które jest za was dawane”. Następnie podał kielich: „Ten kielich to nowe przymierze w mojej krwi, która się za was wylewa”. Za każdym razem, gdy spożywamy ten chleb i pijemy z tego kielicha, zwiastujemy śmierć Pana, aż przyjdzie.

SPRAWDŹ W BIBLII — 12 WERSETÓW PORÓWNAWCZYCH
Wj 11:1 → Rdz 15:14: Bóg wypełnia po 430 latach obietnicę daną Abrahamowi: „Naród, któremu będą służyć, ja osądzę; potem zaś wyjdą z wielkim majątkiem”.
Wj 11:7 → Ml 3:18: Wyraźna różnica uczyniona przez Boga: „Wtedy znowu zobaczycie różnicę między sprawiedliwym a bezbożnym, między tym, który służy Bogu, a tym, który mu nie służy”.
Wj 12:2 → 2 Kor 5:17: Nowy początek w Chrystusie: „Tak więc jeśli ktoś jest w Chrystusie, nowym jest stworzeniem; to, co stare, przeminęło, oto wszystko stało się nowe”.
Wj 12:5 → 1 P 1:19: Czystość ofiary Zbawiciela: „Lecz drogocenną krwią Chrystusa, jako baranka niewinnego i nieskalanego”.
Wj 12:7 → Hbr 10:22: Oczyszczenie sumienia krwią: „Zbliżmy się ze szczerym sercem, w pełni wiary, mając serca oczyszczone od złego sumienia i ciało obmyte czystą wodą”.
Wj 12:8 → 1 Kor 5:8: Święto czystości i szczerości: „Obchodźmy więc święto nie ze starym zakwasem ani z zakwasem złości i przewrotności, lecz z przaśnym chlebem szczerości i prawdy”.
Wj 12:11 → Łk 12:35: Gotowość sług Chrystusa: „Niech wasze biodra będą przepasane i wasze lampy zapalone”.
Wj 12:13 → Rz 5:9: Usprawiedliwienie przez krew: „Tym bardziej więc teraz, będąc usprawiedliwieni jego krwią, będziemy przez niego ocaleni od gniewu”.
Wj 12:22 → Hbr 11:28: Wiara Mojżesza w moc krwi: „Przez wiarę uczynił paschę i pokropienie krwią, aby ten, który niszczył to, co pierworodne, nie dotknął ich”.
Wj 12:29 → Hbr 10:31: Straszliwa powaga sądu Bożego: „Straszna to rzecz wpaść w ręce Boga żywego”.
Wj 12:31 → Iz 52:11–12: Wyjście z domu niewoli: „Odejdźcie, odejdźcie, wyjdźcie stamtąd, nie dotykajcie niczego nieczystego... gdyż PAN pójdzie przed wami”.
Wj 12:36 → Kol 2:15: Ogołocenie potęg ciemności na krzyżu: „Rozbroił zwierzchności i władze, i jawnie wystawił je na pokaz, triumfując nad nimi na nim”.

PRAWDA NA DZIŚ — 8 ZASAD PRZYMIERZA
1. Ocalenie wyłącznie przez Krew: Żadne ludzkie cnoty, uczynki ani pobożność nie uchronią człowieka przed sądem — jedyną tarczą zbawienia jest Krew Chrystusa (Wj 12:13).
2. Nowy początek w Bożym kalendarzu: Prawdziwy czas Twojego życia rozpoczął się w dniu, w którym spotkałeś Zbawiciela i przyjąłeś Jego łaskę (Wj 12:2).
3. Bezpieczeństwo w granicach domu: Wiara wymaga trwania w Bożej wspólnocie i niewychodzenia poza ramy przymierza i Słowa Bożego (Wj 12:22).
4. Radykalne usunięcie zakwasu: Kto należy do Chrystusa, musi zdecydowanie wyrzucić z życia kwas hipokryzji, pychy i tolerowanego grzechu (Wj 12:15).
5. Postawa pielgrzyma: Wierzący żyje w świecie z przepasanymi biodrami i laską w ręku — gotowy do natychmiastowego pójścia za głosem Pana (Wj 12:11).
6. Odpowiedzialność za wiarę dzieci: Gdy synowie i córki pytają o sens naszej wiary, naszym świętym obowiązkiem jest opowiedzieć im o krzyżu i zmartwychwstaniu (Wj 12:26–27).
7. Nieuchronność sprawiedliwego sądu: Odrzucenie Bożych ostrzeżeń prowadzi bezbożny świat do nieodwracalnej godziny sądu o północy (Wj 12:29).
8. Boża sprawiedliwość i rekompensata: Bóg nie zapomina o cierpieniach swoich sług i w swoim czasie sprawiedliwie wynagradza lata wiernej służby (Wj 12:36).

POMYŚL — PYTANIA DO SERCA
1. Czy masz stuprocentową pewność, że Twoje życie jest ukryte za krwią Baranka Paschalnego — Jezusa Chrystusa (Wj 12:13)?
2. Czy potrafisz wskazać moment, w którym Boże odkupienie zresetowało Twój osobisty kalendarz i uczyniło Cię nowym stworzeniem (Wj 12:2)?
3. Jaki „zakwas” grzechu, goryczy lub kompromisu tolerujesz jeszcze w zakamarkach swojego domu lub serca (Wj 12:15)?
4. Czy Twoja postawa życiowa odzwierciedla pielgrzyma gotowego do drogi (przepasane biodra), czy też zbyt mocno zapuściłeś korzenie w doczesnym Egipcie (Wj 12:11)?
5. Co odpowiadasz swoim dzieciom i bliskim, gdy pytają Cię o fundament i sens Twojego chrześcijańskiego życia (Wj 12:26)?
6. Czy trwasz w bezpiecznych granicach Bożej łaski, czy zdarza Ci się wychodzić za próg posłuszeństwa (Wj 12:22)?
7. W jaki sposób dziękujesz Bogu za ocalenie od wiecznego sądu i potępienia?
8. Czy wierzysz, że krew Chrystusa ma moc złamać każdy wieloletni łańcuch niewoli w Twojej rodzinie?

MAŁY QUIZ WIEDZY BIBLIJNEJ — 20 PYTAŃ Z WJ 11:1–12:36
Pytanie 1: Co według Wj 11:1 zapowiedział PAN Mojżeszowi w sprawie faraona?
A. Że faraon od razu uwierzy w Boga
B. Że sprowadzi jeszcze jedną plagę, po której faraon całkowicie ich stąd wypędzi
C. Że ustanowi Mojżesza wezyrem Egiptu
D. Że wody Nilu wyschną na zawsze
Poprawna odpowiedź: B. Wyjaśnienie: Wj 11:1 stwierdza: „Sprowadzę jeszcze jedną plagę na faraona i na Egipt, potem wypuści was stąd. A gdy was wypuści, całkowicie was stąd wypędzi”.

Pytanie 2: O co Izraelici mieli poprosić swoich egipskich sąsiadów przed wyjściem (Wj 11:2)?
A. O konie i rydwany bojowe
B. O srebrne i złote przedmioty
C. O zboże i oliwę
D. O mapy pustyni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 11:2 nakazywał prosić o srebrne i złote przedmioty oraz szaty jako rekompensatę za niewolę.

Pytanie 3: Kiedy według słów Mojżesza PAN miał przejść przez Egipt w dziesiątej pladze (Wj 11:4)?
A. O wschodzie słońca
B. W samo południe
C. O północy
D. O zmierzchu
Poprawna odpowiedź: C. Wyjaśnienie: Wj 11:4 mówi: „Tak mówi PAN: O północy przejdę przez Egipt”.

Pytanie 4: Jaki niezwykły znak pokoju i rozdzielenia zapowiedział Bóg dla Izraela w Wj 11:7?
A. Że na nikogo z synów Izraela pies nie ruszy swym językiem
B. Że nad Goszen pojawi się tęcza
C. Że spadnie manna z nieba
D. Że zapłoną ogniska na granicach
Poprawna odpowiedź: A. Wyjaśnienie: Wj 11:7: „Ale na nikogo z synów Izraela pies nie ruszy swym językiem, ani na człowieka, ani na bydlę”.

Pytanie 5: Co Bóg powiedział o miesiącu Paschy w Wj 12:2?
A. Że będzie to miesiąc żałoby
B. Że ten miesiąc będzie początkiem miesięcy, pierwszym miesiącem roku
C. Że będzie to ostatni miesiąc w kalendarzu
D. Że należy go wykreślić z pamięci
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:2 redefiniuje czas przymierza: „Ten miesiąc będzie dla was początkiem miesięcy, pierwszym miesiącem roku”.

Pytanie 6: Którego dnia pierwszego miesiąca należało wybrać baranka dla domu (Wj 12:3)?
A. Pierwszego dnia
B. Dziesiątego dnia
C. Czternastego dnia
D. Dwudziestego pierwszego dnia
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:3: „Dziesiątego dnia tego miesiąca każdy weźmie sobie baranka dla rodziny”.

Pytanie 7: Jakie cechy musiał posiadać baranek paschalny według Wj 12:5?
A. Dowolny wiek i maść
B. Samica bez rogów
C. Baranek bez skazy, jednoroczny samiec, spośród owiec lub kóz
D. Zwierzę ofiarowane wcześniej w pogańskiej świątyni
Poprawna odpowiedź: C. Wyjaśnienie: Wj 12:5: „Wasz baranek ma być bez skazy, jednoroczny samiec. Weźmiecie go spośród owiec albo kóz”.

Pytanie 8: Do którego dnia miesiąca należało strzec baranka przed zabiciem (Wj 12:6)?
A. Do dwunastego dnia
B. Do czternastego dnia
C. Do piętnastego dnia
D. Przez cały miesiąc
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:6 nakazywał strzec go aż do czternastego dnia nisan, gdy całe zgromadzenie zabijało go pod wieczór.

Pytanie 9: Czym i w jaki sposób należało oznaczyć wejście do domu krwią baranka (Wj 12:7, 22)?
A. Wylać krew na próg wejściowy
B. Pokropić wiązką hizopu oba węgary i nadproże
C. Namalować znak na dachu
D. Zanurzyć dłonie i odcisnąć je na drzwiach
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:7, 22 nakazuje pokropić oba węgary i nadproże wiązką hizopu.

Pytanie 10: Z czym należało spożywać pieczone mięso baranka w noc paschalną (Wj 12:8)?
A. Z miodem i figami
B. Z przaśnym chlebem i gorzkimi ziołami
C. Z winem i oliwkami
D. Z gotowanym jęczmieniem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:8: „I będą jeść tej nocy mięso pieczone przy ogniu i przaśny chleb; będą je jeść z gorzkimi ziołami”.

Pytanie 11: Czego kategorycznie zakazano przy przyrządzaniu baranka w Wj 12:9?
A. Pieczenia przy ogniu
B. Jedzenia mięsa surowego lub ugotowanego w wodzie
C. Solenia mięsa
D. Spożywania z rodziną
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:9 zakazuje: „Nie jedzcie z niego nic surowego ani ugotowanego w wodzie, lecz tylko upieczone przy ogniu”.

Pytanie 12: W jakim ubiorze i w jaki sposób Izraelici mieli spożywać Paschę (Wj 12:11)?
A. W szatach żałobnych, leżąc przy stole
B. Z biodrami przepasanymi, obuwiem na nogach, laską w ręku i w pośpiechu
C. Na kolanach w milczeniu
D. W tańcu wokół ołtarza
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:11 nakazuje postawę gotowości: przepasane biodra, obuwie, laska w ręku i pośpiech pielgrzyma.

Pytanie 13: Jakie fundamentalne słowa wypowiedział Bóg w Wj 12:13 w sprawie krwi na domach?
A. „Gdy przyniesiecie złoto, ominę was”
B. „Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia”
C. „Gdy Mojżesz zawoła, spojrzę na was”
D. „Gdy usłyszę wasz płacz, zlituję się”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:13 to złoty werset Paschy: „Gdy bowiem ujrzę krew, ominę was!”.

Pytanie 14: Przez ile dni należało jeść przaśny chleb podczas Święta Przaśników (Wj 12:15)?
A. Przez 3 dni
B. Przez 7 dni
C. Przez 14 dni
D. Przez 40 dni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:15 nakazuje jeść przaśny chleb przez siedem dni, bezwzględnie usuwając zakwas.

Pytanie 15: Jaki kategoryczny zakaz obowiązywał synów Izraela w noc paschalną aż do rana (Wj 12:22)?
A. Zakaz spania
B. Zakaz rozmawiania z dziećmi
C. Niech nikt z was nie wychodzi za drzwi swego domu aż do rana
D. Zakaz palenia ognia
Poprawna odpowiedź: C. Wyjaśnienie: Wj 12:22b nakazuje: „Niech nikt z was nie wychodzi za drzwi swego domu aż do rana”.

Pytanie 16: Co rodzice mieli odpowiedzieć swoim dzieciom, gdy zapytają o znaczenie obrzędu (Wj 12:26–27)?
A. Że to tradycja pradziadków
B. Że to ofiara paschy PANA, który ominął domy synów Izraela w Egipcie, a nasze domy ocalił
C. Że to tajemnica kapłanów
D. Że dowiedzą się w dorosłości
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:27 nakazuje dawać jasne świadectwo Bożej łaski ocalenia w nocy Paschy.

Pytanie 17: Kto zginął w ziemi Egiptu o północy w dziesiątej pladze (Wj 12:29)?
A. Tylko wojsko faraona
B. Wszystko, co pierworodne: od syna faraona po pierworodnego więźnia i bydła
C. Wszyscy kapłani pogańscy
D. Tylko starcy w miastach
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:29 rejestruje śmierć wszystkiego, co pierworodne w całym Egipcie.

Pytanie 18: Jak zareagował faraon i Egipcjanie w nocy po uderzeniu plagi (Wj 12:30–31)?
A. Zmobilizowali armię do walki
B. Podniósł się wielki krzyk, a faraon w nocy wezwał Mojżesza i kazał natychmiast wyjść ludowi
C. Zamknęli bramy miast
D. Złożyli okup z owiec
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:30–31 ukazuje wielki krzyk w Egipcie i natychmiastowe wypędzenie ludu przez monarchę.

Pytanie 19: O co poprosił złamany faraon Mojżesza i Aarona na odchodnym w Wj 12:32?
A. O zwrot pożyczonego złota
B. „Mnie też błogosławcie”
C. O pozostawienie lekarzy
D. O obietnicę powrotu za rok
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:32b: pogański tyran pokornie błaga: „Mnie też błogosławcie”.

Pytanie 20: W czym lud Izraela niósł niezakwaszone ciasto opuszczając Egipt (Wj 12:34)?
A. W żelaznych skrzyniach
B. W dzieżach owiniętych w swoje szaty na ramionach
C. Na wozach zaprzężonych w woły
D. W glinianych dzbanach
Poprawna odpowiedź: B. Wyjaśnienie: Wj 12:34: „Wziął więc lud swoje ciasto, zanim się zakwasiło, i dzieże owinięte w swoje szaty i kładli je na swoje ramiona”.

TWOJA DECYZJA
Wybierz Bezpieczeństwo pod Krwią Baranka — Wyjdź z Domu Niewoli!
Dwunasty rozdział Księgi Wyjścia stawia przed nami ostateczną alternatywę: albo pozostajesz w sferze buntu tego świata i podlegasz sprawiedliwemu sądowi Bożemu, albo chronisz się pod Krwią Baranka bez skazy. Bóg nie badał zasług Hebrajczyków ani ich moralnej doskonałości — badał, czy na drzwiach ich domów znajduje się krew przymierza. Dziś Pan Jezus Chrystus wzywa Cię do osobistego zaufania Jego ofierze na krzyżu. Wyrzecz się wszelkiego kwasu grzechu, weź laskę pielgrzyma i wyrusz w drogę wolności za Królem Królów!

Osobiste Wyznanie Decyzji:
„Panie Boże Wszechmogący, Święty Sędzio i Miłosierny Zbawicielu! Dziękuję Ci z całego serca za dar Jezusa Chrystusa — mojego Baranka Paschalnego. Wyznaję, że sam z siebie nie mam żadnych zasług, którymi mógłbym uchronić się przed Twoim sprawiedliwym sądem. Wiarą kropię dziś węgary mojego serca, mój dom, moją rodzinę i moją przyszłość najdroższą Krwią Jezusa. Wyrzucam ze swojego życia wszelki stary kwas grzechu, obłudy i kompromisu. Przepasuję biodra wiarą i postanawiam iść za Tobą jako wierny pielgrzym każdego dnia mojego życia. Amen!”

MODLITWA NA 11 LISTOPADA
Święty, Święty, Święty Panie Boże Zastępów!
Przynosimy Ci dziś hołd i uwielbienie w czterdziestym drugim dniu naszego studium Słowa. Dziękujemy Ci za wielką tajemnicę Paschy, która rozświetliła mroki egipskiej nocy i zapowiedziała triumf Golgoty.
Panie Jezu Chryste, Baranku Boży bez skazy i zmazy! Dziękujemy Ci, że wziąłeś na siebie kielich Bożego gniewu i przelałeś Swoją bezcenną krew, abyśmy my mogli żyć. Dziękujemy, że gdy Ojciec patrzy na nas przez Twoją krew, omija nas wieczny sąd i śmierć, a otwiera się przed nami Ziemia Obiecana wiecznego Królestwa.
Oczyszczaj nasze myśli i domy z wszelkiego kwasu grzechu. Daj nam mądrość i odwagę, abyśmy wychowywali nasze dzieci w pamięci o Twoim krzyżu i zmartwychwstaniu. Napełnij nas pokojem, który przewyższa wszelki rozum, i spraw, abyśmy byli żywymi świadkami Twojej łaski w tym niespokojnym świecie. Tobie niech będzie wszelka cześć, chwała, mądrość i dziękczynienie na wieki wieków. Amen!

ZADANIE NA DZIŚ & TWÓJ ZAPIS
Wykonaj dzisiejsze kroki formacji biblijnej:
1. Przeczytaj osobiście cały jedenasty i dwunasty rozdział Księgi Wyjścia (Wj 11:1–12:36) w przekładzie UBG.
2. Podziękuj Chrystusowi w modlitwie za Jego krew przelaną na krzyżu, która jest Twoim jedynym i wiecznym schronieniem.
3. Zbadaj swoje serce i dom: czy nie ma w Twoim życiu jakiegoś „zakwasu” grzechu lub nieszczerości, który należy bezzwłocznie usunąć (1 Kor 5:7–8)?
4. Przeczytaj 1 Kor 5:7–8 oraz 1 P 1:18–19, rozważając doskonałość Baranka Bożego.
5. Pomyśl o swoich bliskich i powierz ich w modlitwie pod ochronę krwi Zbawiciela.
6. Zapisz poniżej swoje osobiste postanowienie wierności i wdzięczności za Boże odkupienie.
7. Podziel się dzisiejszym rozważaniem z osobą, która zmaga się z lękiem przed śmiercią lub sądem Bożym.

JUTRO — 12 LISTOPADA 2026
DZIEŃ 43 — WYJŚCIE Z RAMZES, FILAR OBŁOKU I OGNIA ORAZ POŚWIĘCENIE PIERWORODNYCH (Wj 12:37–13:22)
Dzień 43: Wymarsz z Egiptu, noc czuwania dla Pana, obwarowania Paschy, poświęcenie każdego pierworodnego oraz cudowne Boże prowadzenie w słupie obłoku we dnie i w słupie ognia w nocy.`;

// ── 4. GENEROWANIE DOKUMENTU MICROSOFT WORD (.DOCX) ──
console.log('📄 Generuję dokument Microsoft Word (.docx)...');

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
        
        // Numerowane podsekcje (np. "1. Tytuł (11:1)")
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

// ── 5. ZAPISUJEMY PAKIET 5 WERSJI W SCRIPTS/CONTENT/ ──
const scriptsContentDir = path.join(process.cwd(), 'scripts/content');
if (!fs.existsSync(scriptsContentDir)) {
  fs.mkdirSync(scriptsContentDir, { recursive: true });
}
const pakietPath = path.join(scriptsContentDir, `pakiet-day${DAY_NUM}-5wersji.md`);
fs.writeFileSync(pakietPath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano scripts/content/pakiet-day${DAY_NUM}-5wersji.md (${pakiet5wersji.length} znaków)`);

// Zapisujemy kopię w kolejka-publikacji/kurs-codzienny/2026-11-11
const queueDir = path.join(process.cwd(), `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);
if (!fs.existsSync(queueDir)) {
  fs.mkdirSync(queueDir, { recursive: true });
}
const metaJson = {
  data: DATE_STR,
  dzien: DAY_NUM,
  zatwierdzil: "Cezary Rogowski",
  zatwierdzono: new Date().toISOString(),
  karta: {
    tytul: `Dzień ${DAY_NUM}: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych`,
    opis: "Księga Wyjścia 11:1–12:36: Ustanowienie Baranka Paschalnego, krew na odrzwiach w Goszen, sąd o północy nad bogami Egiptu i ocalenie pierworodnych."
  }
};
fs.writeFileSync(path.join(queueDir, 'meta.json'), JSON.stringify(metaJson, null, 2), 'utf8');

const rozwazanieJson = {
  id: `ref_day${DAY_NUM}_${DATE_STR}`,
  day: DAY_NUM,
  date: DATE_STR,
  title: `Dzień ${DAY_NUM}: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych`,
  fullText: pakiet5wersji.split('====================================================================\nWERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 2: WERSJA WWW')[0].trim(),
  contentWeb: pakiet5wersji.split('====================================================================\nWERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 3: WERSJA WIECZORNA (SMS)')[0].trim(),
  tvScript: pakiet5wersji.split('====================================================================\nWERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)')[0].trim(),
  ccnArticle: pakiet5wersji.split('====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1].trim(),
  imageUrl: `/images/academy/daily/kc_day_${DAY_NUM}_swieto_paschy_krew_baranka.jpg`
};
fs.writeFileSync(path.join(queueDir, 'rozwazanie.json'), JSON.stringify(rozwazanieJson, null, 2), 'utf8');
console.log('✅ Zapisano kolejka-publikacji/kurs-codzienny/2026-11-11/rozwazanie.json oraz meta.json');

// Dopisujemy do bazy rozwazania_baza.md w Wektor1_VideoFactory
const bazaPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(bazaPath)) {
  const currentBaza = fs.readFileSync(bazaPath, 'utf8');
  if (!currentBaza.includes(`Dzień ${DAY_NUM} (11 listopada 2026)`)) {
    fs.appendFileSync(bazaPath, '\n\n' + pakiet5wersji, 'utf8');
    console.log('✅ Dopisano pakiet do rozwazania_baza.md');
  } else {
    console.log(`ℹ️ Pakiet Dnia ${DAY_NUM} już znajduje się w rozwazania_baza.md`);
  }
}

// ── 6. BUDOWA STRONY LEKCJI HTML (akademia/kurscodzienny/dzien-42.html) ──
console.log('🌐 Buduję stronę HTML lekcji Dnia 42 na wzorze Dnia 41...');
const d41HtmlPath = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-41.html');
let html = fs.readFileSync(d41HtmlPath, 'utf8');

// A. Metadane i tytuły
html = html.replace(/<title>Dzień 41:[^<]+<\/title>/, `<title>Dzień 42: ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH (Wj 11:1–12:36) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 42 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. Księga Wyjścia 11:1–12:36: Ustanowienie Paschy, krew na odrzwiach w Goszen, sąd o północy nad bogami Egiptu i wykupienie pierworodnych.">`);
html = html.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-41"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-42"`);
html = html.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Wj 11:1–12:36) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="Księga Wyjścia 11:1–12:36: Ustanowienie Paschy, krew na odrzwiach w Goszen, śmierć pierworodnych Egiptu i triumfalne wyjście z domu niewoli."`);
html = html.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-41"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-42"`);
html = html.replace(/kc_day_41_szarancza_ciemnosc\.jpg\?v=\d+/g, `kc_day_42_swieto_paschy_krew_baranka.jpg?v=20261111`);
html = html.replace(/kc_day_41_szarancza_ciemnosc\.jpg/g, `kc_day_42_swieto_paschy_krew_baranka.jpg`);

// B. Górny pasek nawigacji & Breadcrumbs
html = html.replace(/<span class="text-amber-400 font-semibold">Dzień 41<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 42</span>`);

// Nawigacja w lewo i prawo
const newNavBlock = `<a href="/akademia/kurscodzienny/dzien-41" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 41</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 43 (Jutro) →</span>
        </span>`;

html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-40"[\s\S]*?<\/a>\s*(?:<a href="\/akademia\/kurscodzienny\/dzien-42"[\s\S]*?<\/a>|<span class="[^"]*">\s*<span>Dzień 42 \(Jutro\) →<\/span>\s*<\/span>)/,
  newNavBlock
);

// C. Hero sekcja
html = html.replace(/<span>Dzień 41 z 2009<\/span>/, `<span>Dzień 42 z 2009</span>`);
html = html.replace(/10 LISTOPADA 2026 • WTOREK/, `11 LISTOPADA 2026 • ŚRODA`);
html = html.replace(
  /<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        Ustanowienie Paschy, krew na odrzwiach w Goszen, sąd o północy nad bogami Egiptu i ocalenie pierworodnych (Wj 11:1–12:36)\n      </p>`
);
html = html.replace(/alt="Dzień 41:[^"]+"/, `alt="Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych"`);
html = html.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>Ilustracja biblijna: Święto Paschy, krew Baranka na odrzwiach w Goszen i wyzwolenie pierworodnych (Wj 11:1–12:36)</span>`);
html = html.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 10:1–29<\/span>/,
  `<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 11:1–12:36</span>`);
html = html.replace(/Księga Wyjścia 10:1–29 • Plaga szarańczy i dotykalnej ciemności w Egipcie pośród światła w krainie Goszen/,
  `Księga Wyjścia 11:1–12:36 • Ustanowienie Baranka Paschalnego, krew na odrzwiach w krainie Goszen i sąd o północy nad pierworodnymi Egiptu`);

// D. Werset pamięciowy
html = html.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/,
  `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">
            „A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu.”
          </blockquote>`);
html = html.replace(/— Księga Wyjścia 10:23 \(UBG\)/, `— Księga Wyjścia 12:13 (UBG)`);
html = html.replace(/navigator\.clipboard\.writeText\('[^']+'\)/,
  `navigator.clipboard.writeText('A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu. (Wj 12:13, UBG)')`);

// Myśl przewodnia lekcji
html = html.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${THEME}\n      </div>\n    </div>`);

// E. Karta wprowadzenia (Podróż przez 66 Ksiąg)
html = html.replace(/Dziś jest <strong class="text-white">Dzień 41<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 10:1–29<\/strong>\./,
  `Dziś jest <strong class="text-white">Dzień 42</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 11:1–12:36</strong>.`);
html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=10" class="inline-flex items-center gap-2 px-5 py-2\.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-\[44px\]">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Czytaj Wj 10:1–29<\/span>\s*<\/a>/,
  `<a href="/mojabiblia?book=EXO&chapter=12" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">\n            <i class="fa-solid fa-book-bible"></i>\n            <span>Czytaj Wj 11:1–12:36</span>\n          </a>`);

// F. Tekst Pisma Świętego
html = html.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 10:1–29<\/p>/,
  `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 11:1–12:36</p>`);
html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=10"/g, `href="/mojabiblia?book=EXO&chapter=12"`);
html = html.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">
        ${readingHtml}
        </div>
      </section>

      <!-- HEBREW STRONG CODES`);

// G. Kody Stronga
const strongHtml = `<span class="strong-chip"><span class="strong-id">H6453</span> <span class="strong-orig">פֶּסַח (pesach)</span> — Pascha / ominięcie / przejście ocalające (Wj 12:11, 21, 27)</span>
          <span class="strong-chip"><span class="strong-id">H1818</span> <span class="strong-orig">דָּם (dam)</span> — krew / krew znaku przymierza na odrzwiach (Wj 12:7, 13, 22)</span>
          <span class="strong-chip"><span class="strong-id">H7716</span> <span class="strong-orig">שֶׂה (seh)</span> — baranek / jagnię bez skazy dla każdego domu (Wj 12:3–5)</span>
          <span class="strong-chip"><span class="strong-id">H8549</span> <span class="strong-orig">תָּמִים (tamim)</span> — bez skazy / doskonały, nienaganny (Wj 12:5)</span>
          <span class="strong-chip"><span class="strong-id">H4682</span> <span class="strong-orig">מַצָּה (macca)</span> — przaśny chleb / chleb niekwaszony czystości (Wj 12:8, 15, 18)</span>
          <span class="strong-chip"><span class="strong-id">H1060</span> <span class="strong-orig">בְּכוֹר (bechor)</span> — pierworodny / wykupienie pierworodnych (Wj 11:5; 12:12, 29)</span>
          <span class="strong-chip"><span class="strong-id">H7843</span> <span class="strong-orig">מַשְׁחִית (maszchit)</span> — niszczyciel / anioł niszczący, przed którym chroni krew (Wj 12:13, 23)</span>
          <span class="strong-chip"><span class="strong-id">H2320</span> <span class="strong-orig">חֹדֶשׁ (chodesz)</span> — miesiąc / początek miesięcy, nowy czas (Wj 12:2)</span>`;

html = html.replace(/Klucze Językowe & Kody Stronga \(Wj 10\)/, `Klucze Językowe & Kody Stronga (Wj 11–12)`);
html = html.replace(/osnowę teologiczną 10\. rozdziału Księgi Wyjścia/, `osnowę teologiczną 11. i 12. rozdziału Księgi Wyjścia`);

html = html.replace(/<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">
          ${strongHtml}
        </div>
      </section>
 
      <!-- THEOLOGICAL EXEGESIS`);

// H. Egzegeza (5 części, 42 punkty)
html = html.replace(/Pięć części studium Wj 10:1–29 \(40 punktów analitycznych\)/, `Pięć części studium Wj 11:1–12:36 (42 punkty analityczne)`);

const exegesis5PartsHtml = `<!-- CZĘŚĆ I -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
              ZAPOWIEDŹ DZIESIĄTEJ PLAGI I UPRZYWILEJOWANIE LUDU (WJ 11:1–10)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>1. Ostatni cios sądu (11:1a):</strong> Bóg zapowiada nadejście jednej, ostatecznej plagi, po której opór faraona zostanie ostatecznie złamany.</p>
              <p><strong>2. Całkowite wypędzenie (11:1b):</strong> Tyran, który wzbraniał wyjścia, wkrótce sam w pośpiechu i panicznym strachu wypędzi lud Boży ze swoich granic.</p>
              <p><strong>3. Sprawiedliwa restytucja majątkowa (11:2):</strong> Nakaz prośby o złoto i srebro stanowi Bożą rekompensatę za pokolenia niewolniczego trudu przy budowie miast imperium.</p>
              <p><strong>4. Szacunek w oczach wrogów (11:3):</strong> Bóg daje swemu ludowi i Mojżeszowi niezwykły autorytet w oczach urzędników i ludu Egiptu.</p>
              <p><strong>5. Północna godzina sądu (11:4):</strong> „O północy przejdę przez Egipt” — wyznaczenie precyzyjnego terminu Bożej interwencji w samo jądro egipskiej nocy.</p>
              <p><strong>6. Uniwersalność wyroku na pychę (11:5):</strong> Od dziedzica tronu aż po niewolnicę przy żarnach — żaden status społeczny nie ocali pogańskiego buntu przed sprawiedliwością.</p>
              <p><strong>7. Bezprecedensowy krzyk rozpaczy (11:6):</strong> Egipt doświadcza lamentu, jakiego nie było w całych jego dziejach, gdy ginie pokolenie nadziei imperium.</p>
              <p><strong>8. Cudowne rozdzielenie Goszen (11:7):</strong> Nawet pies nie szczeknie na synów Izraela — Bóg w widoczny sposób okazuje różnicę między bezbożnym Egiptem a Jego ludem.</p>
            </div>
          </div>

          <!-- CZĘŚĆ II -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
              NOWY KALENDARZ I BARANEK PASCHALNY (WJ 12:1–10)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>9. Reset czasu przymierza (12:1–2):</strong> Miesiąc Abib (Nisan) staje się początkiem nowego roku; prawdziwe życie człowieka liczy się od momentu odkupienia.</p>
              <p><strong>10. Baranek dla każdego domu (12:3):</strong> Odkupienie ma wymiar osobisty i rodzinny; każdy dom musi posiadać własną ofiarę przymierza.</p>
              <p><strong>11. Wspólnota i solidarność sąsiedzka (12:4):</strong> Małe rodziny łączą się z sąsiadami, aby żadna cząstka daru Bożego nie została zmarnowana.</p>
              <p><strong>12. Doskonałość ofiary bez skazy (12:5a):</strong> Baranek ma być samcem jednorocznym, absolutnie zdrowym i bez wady (hebr. tamim).</p>
              <p><strong>13. Czterodniowa próba wierności (12:6a):</strong> Wybór 10. dnia i strzeżenie do 14. dnia nisan pozwalało na dokładną inspekcję zwierzęcia przed ofiarowaniem.</p>
              <p><strong>14. Godzina wieczornej ofiary (12:6b):</strong> Zabicie baranka pod wieczór (hebr. bejn haarba’im) zapowiada godzinę śmierci Chrystusa.</p>
              <p><strong>15. Znamię krwi na odrzwiach (12:7):</strong> Pokropienie węgarów i nadproża stanowiło publiczną tarczę wiary oddzielającą domowników od potępienia.</p>
              <p><strong>16. Ogień, przaśniki i gorzkie zioła (12:8–10):</strong> Pieczenie w ogniu symbolizuje pełnię sądu Bożego; zioła przypominają gorycz niewoli, a przaśniki wzywają do czystości serca.</p>
            </div>
          </div>

          <!-- CZĘŚĆ III -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
              POŚPIECH PIELGRZYMA I ŚWIĘTO PRZAŚNIKÓW (WJ 12:11–20)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>17. Postawa gotowości do drogi (12:11a):</strong> Biodra przepasane, obuwie na nogach i laska w ręku — zbawiony człowiek nie mości się w świecie, lecz jest pielgrzymem.</p>
              <p><strong>18. Pośpieszne spożywanie Paschy (12:11b):</strong> Zbawienie wymaga natychmiastowej decyzji zerwania z przeszłością i gotowości do pójścia za Bożym wezwaniem.</p>
              <p><strong>19. Sąd nad bogami Egiptu (12:12):</strong> Pascha to nie tylko ocalenie ludzi, ale publiczne zdemaskowanie niemocy panteonu demonicznych bóstw Nilu.</p>
              <p><strong>20. Obiektywna tarcza krwi (12:13a):</strong> „Gdy ujrzę krew, ominę was” — fundamentem pokoju nie jest ludzkie samopoczucie, lecz Boże spojrzenie na krew ofiary.</p>
              <p><strong>21. Wieczna pamiątka pokoleń (12:14):</strong> Pascha zostaje ustanowiona jako ustawa wieczna, kształtująca tożsamość dzieci Bożych po wszystkie czasy.</p>
              <p><strong>22. Siedmiodniowe Święto Przaśników (12:15):</strong> Całkowite usunięcie zakwasu z domostw jako warunek trwania w przymierzu ze Świętym Bogiem.</p>
              <p><strong>23. Święte zgromadzenia pierwszego i siódmego dnia (12:16):</strong> Odpoczynek od codziennej pracy i poświęcenie czasu na uroczyste wielbienie Odkupiciela.</p>
              <p><strong>24. Nakaz czystości od zakwasu (12:17–20):</strong> Zakwas jako symbol pychy, hipokryzji i grzechu musi zostać bezwzględnie usunięty z życia wspólnoty.</p>
            </div>
          </div>

          <!-- CZĘŚĆ IV -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
              POSŁUSZEŃSTWO WIARY I OCHRONA PRZED NISZCZYCIELEM (WJ 12:21–28)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>25. Zwołanie starszyzny Izraela (12:21):</strong> Mojżesz przekazuje instrukcje paschalne przywódcom, uruchamiając posłuszeństwo całego ludu.</p>
              <p><strong>26. Wiązka hizopu i misa z krwią (12:22a):</strong> Hizop — roślina pokory i oczyszczenia — służy do przeniesienia krwi z naczynia na futrynę domu.</p>
              <p><strong>27. Zakaz wychodzenia za próg (12:22b):</strong> „Niech nikt z was nie wychodzi za drzwi swego domu aż do rana” — bezpieczeństwo istnieje wyłącznie pod krwią przymierza.</p>
              <p><strong>28. Boża tarcza przed aniołem niszczycielem (12:23):</strong> Sam PAN strzeże wejścia do domów oznaczonych krwią, nie dopuszczając śmierci do wnętrza.</p>
              <p><strong>29. Wychowanie międzypokoleniowe (12:24–26):</strong> Pytanie dzieci: „Co oznacza ten wasz obrzęd?” staje się szkołą żywej wiary i wdzięczności.</p>
              <p><strong>30. Świadectwo ocalenia rodzin (12:27a):</strong> Odpowiedź rodziców przypomina o Bożej suwerennej łasce, która ominęła hebrajskie domy w nocy sądu.</p>
              <p><strong>31. Pokłon adoracji i wdzięczności (12:27b):</strong> Wobec majestatu Bożego planu lud upada na twarz w głębokim dziękczynieniu.</p>
              <p><strong>32. Precyzyjne posłuszeństwo nakazom (12:28):</strong> Izraelici uczynili dokładnie tak, jak nakazał PAN przez Mojżesza i Aarona — wiara wyraża się w posłuszeństwie.</p>
            </div>
          </div>

          <!-- CZĘŚĆ V -->
          <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
            <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
              SĄD O PÓŁNOCY, KRZYK W EGIPCIE I WYJŚCIE (WJ 12:29–36)
            </h3>
            <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
              <p><strong>33. Uderzenie o północy (12:29a):</strong> W najciemniejszej godzinie nocy PAN wykonuje sprawiedliwy wyrok nad pierworodnymi w całej krainie Nilu.</p>
              <p><strong>34. Porażka dynastycznego bóstwa (12:29b):</strong> Śmierć syna faraona obnaża bezsilność roszczeń władcy podającego się za potomka boga Ra.</p>
              <p><strong>35. Nocny zryw monarchy i dworzan (12:30a):</strong> Faraon wstaje w środku nocy, skonfrontowany z nieodwracalną klęską swojej pychy.</p>
              <p><strong>36. Żałoba w każdym egipskim domu (12:30b):</strong> Powszechny krzyk w Egipcie — nie było rodziny, w której nie leżałby zmarły pierworodny.</p>
              <p><strong>37. Nocne wezwanie Mojżesza i Aarona (12:31):</strong> Złamany monarcha wzywa proroków w ciemności i nakazuje natychmiastowe opuszczenie kraju.</p>
              <p><strong>38. Zgoda na pełne uwielbienie (12:32a):</strong> Faraon zezwala na zabranie stad i dzieci — bezwarunkowa kapitulacja wobec żądania: „Ani jedno kopyto nie zostanie!”.</p>
              <p><strong>39. Błaganie o błogosławieństwo (12:32b):</strong> Pogański monarcha prosi Mojżesza o modlitwę wstawienniczą: „Mnie też błogosławcie!”.</p>
              <p><strong>40. Panika i przynaglanie Egipcjan (12:33):</strong> Mieszkańcy Egiptu wypychają Izraelitów w lęku przed całkowitą zagładą biologiczną.</p>
              <p><strong>41. Chleb w dzieżach na ramionach (12:34):</strong> W pośpiechu lud zabiera niezakwaszone ciasto w szatach — żywa ilustracja pośpiechu wyjścia z grzechu.</p>
              <p><strong>42. Triumfalne ogołocenie niewoli (12:35–36):</strong> Bóg napełnia Egipcjan życzliwością, dzięki czemu lud Boży otrzymuje bogate dary na drogę do Ziemi Obiecanej.</p>
            </div>
          </div>`;

html = html.replace(/<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
          ${exegesis5PartsHtml}
        </div>
      </section>

      <!-- ── JEZUS W CENTRUM`);

// I. Jezus w centrum
html = html.replace(/Prawdziwa Światłość Świata i Wykupienie bez Kompromisów — Chrystus w centrum Wj 10/,
  `Nasz Baranek Paschalny i Krew Nowego Przymierza — Chrystus w centrum Wj 11–12`);
html = html.replace(/Dziesiąty rozdział Księgi Wyjścia w profetyczny sposób zapowiada zbawcze dzieło Jezusa Chrystusa:/,
  `Jedenasty i dwunasty rozdział Księgi Wyjścia stanowią najważniejszą zapowiedź ofiary Chrystusa w całym Pięcioksięgu:`);

const christocentrismHtml = `<div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">1. Jezus Chrystus — Nasz Baranek Paschalny (Wj 12:3–6 a 1 Kor 5:7, J 1:29)</h4>
            <p class="text-zinc-300 leading-relaxed">Baranek paschalny w Egipcie był proroczą zapowiedzią Jezusa Chrystusa. Jan Chrzciciel zawołał nad Jordanem: „Oto Baranek Boży, który gładzi grzech świata!”. Apostoł Paweł ogłasza z absolutną mocą: „Chrystus bowiem, nasza pascha, został za nas ofiarowany”.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">2. Baranek bez skazy i nienaruszona kość (Wj 12:5, 46 a 1 P 1:18–19, J 19:36)</h4>
            <p class="text-zinc-300 leading-relaxed">Baranek musiał być doskonały (tamim), a żadna jego kość nie mogła być złamana. Na Golgocie żołnierze nie połamali kości Zbawiciela, „aby wypełniło się Pismo: Kość jego nie będzie złamana”. Zostaliśmy wykupieni niewinną i nieskalaną krwią Chrystusa.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">3. Krew Przebłagania na odrzwiach serca (Wj 12:7, 13 a Rz 3:25, Hbr 9:14, 22)</h4>
            <p class="text-zinc-300 leading-relaxed">Krew na drewnianych odrzwiach układała się w zarys krzyża. Bóg obiecał: „Gdy ujrzę krew, ominę was!”. Dziś krew Chrystusa przyjęta z wiarą w sercu chroni przed wiecznym sądem i oczyszcza sumienie z martwych uczynków do służby Bogu żywemu.</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-brand-border/20">
            <h4 class="font-bold text-amber-300 mb-1">4. Chleb Przaśny i Nowe Przymierze — Wieczerza Pańska (Wj 12:8, 14 a Łk 22:19–20, 1 Kor 11:23–26)</h4>
            <p class="text-zinc-300 leading-relaxed">Podczas ostatniej wieczerzy paschalnej Jezus ustanowił Wieczerzę Pańską: „To jest ciało moje... Ten kielich to nowe przymierze w mojej krwi”. Obchodzimy tę pamiątkę z przaśnym chlebem szczerości i prawdy aż do Jego powtórnego przyjścia.</p>
          </div>`;

html = html.replace(/<div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── SPRAWDŹ W BIBLII/,
  `<div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif">
          ${christocentrismHtml}
        </div>
      </section>

      <!-- ── SPRAWDŹ W BIBLII`);

// J. Porównaj wersety (12 wersetów)
const compareGridHtml = `<div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 11:1 → Rdz 15:14</strong>: Bóg wypełnia po 430 latach obietnicę daną Abrahamowi: sąd nad Egiptem i wyjście z wielkim majątkiem.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 11:7 → Ml 3:18</strong>: Wyraźne rozdzielenie: „Wtedy znowu zobaczycie różnicę między sprawiedliwym a bezbożnym”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:2 → 2 Kor 5:17</strong>: Nowy kalendarz: „Jeśli ktoś jest w Chrystusie, nowym jest stworzeniem; stare przeminęło”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:5 → 1 P 1:19</strong>: „Drogocenną krwią Chrystusa, jako baranka niewinnego i nieskalanego”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:7 → Hbr 10:22</strong>: Serca pokropione krwią i oczyszczone od złego sumienia.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:8 → 1 Kor 5:8</strong>: „Obchodźmy święto z przaśnym chlebem szczerości i prawdy”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:11 → Łk 12:35</strong>: Postawa pielgrzyma: „Niech wasze biodra będą przepasane i wasze lampy zapalone”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:13 → Rz 5:9</strong>: „Będąc usprawiedliwieni jego krwią, będziemy przez niego ocaleni od gniewu”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:22 → Hbr 11:28</strong>: „Przez wiarę uczynił paschę i pokropienie krwią, aby niszczyciel ich nie dotknął”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:29 → Hbr 10:31</strong>: Nieuchronność Bożego wyroku: „Straszna to rzecz wpaść w ręce Boga żywego”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:31 → Iz 52:11–12</strong>: Wymarsz z niewoli: „Odejdźcie, odejdźcie, wyjdźcie stamtąd... PAN pójdzie przed wami”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 12:36 → Kol 2:15</strong>: Triumf nad potęgami: „Rozbroił zwierzchności i władze, triumfując nad nimi na krzyżu”.</div>`;

html = html.replace(/<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── PRAWDA NA DZIŚ/,
  `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          ${compareGridHtml}
        </div>
      </section>

      <!-- ── PRAWDA NA DZIŚ`);

// K. Prawda na dziś (8 Zasad Przymierza)
const prawdaHtml = `<p>• <strong>Ocalenie wyłącznie przez Krew:</strong> Żadne ludzkie uczynki ani status nie uchronią przed sądem — jedyną tarczą zbawienia jest Krew Chrystusa (Wj 12:13).</p>
          <p>• <strong>Nowy początek w Bożym kalendarzu:</strong> Prawdziwy czas Twojego życia rozpoczął się w dniu spotkania ze Zbawicielem (Wj 12:2).</p>
          <p>• <strong>Bezpieczeństwo w granicach przymierza:</strong> Wiara wymaga trwania w Bożej prawdzie i niewychodzenia poza ramy Słowa Bożego (Wj 12:22).</p>
          <p>• <strong>Radykalne usunięcie zakwasu:</strong> Kto należy do Chrystusa, musi bezwzględnie usunąć z życia kwas pychy, nieszczerości i grzechu (Wj 12:15).</p>
          <p>• <strong>Postawa pielgrzyma:</strong> Wierzący żyje w świecie z przepasanymi biodrami i laską w ręku — gotowy do natychmiastowego pójścia za Panem (Wj 12:11).</p>
          <p>• <strong>Edukacja wiary w rodzinie:</strong> Naszym świętym obowiązkiem jest opowiadać dzieciom o Krzyżu i wielkich dziełach Bożych (Wj 12:26–27).</p>
          <p>• <strong>Nieuchronność sądu nad pychą:</strong> Odrzucenie Bożych ostrzeżeń prowadzi buntowników do nieodwracalnego sądu o północy (Wj 12:29).</p>
          <p>• <strong>Boża sprawiedliwość i wynagrodzenie:</strong> Bóg nie zapomina o trudach swoich sług i sprawiedliwie wynagradza lata wiernej służby (Wj 12:36).</p>`;

html = html.replace(/<div class="space-y-2\.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── POMYŚL/,
  `<div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          ${prawdaHtml}
        </div>
      </section>

      <!-- ── POMYŚL`);

// L. Pytania do serca (Pomyśl)
const pomyslHtml = `<p>1. Czy masz absolutną pewność wiary, że Twoje życie jest bezpiecznie ukryte za krwią Baranka Paschalnego — Jezusa Chrystusa (Wj 12:13)?</p>
          <p>2. W jaki sposób spotkanie z Chrystusem zresetowało Twój osobisty kalendarz i cele życiowe (Wj 12:2)?</p>
          <p>3. Jaki „zakwas” grzechu, goryczy lub kompromisu tolerujesz jeszcze w zakamarkach swojego serca lub domu (Wj 12:15)?</p>
          <p>4. Czy Twoja codzienna postawa odzwierciedla pielgrzyma gotowego do drogi ku wieczności, czy też zbyt mocno zapuściłeś korzenie w świecie (Wj 12:11)?</p>
          <p>5. Co odpowiadasz swoim dzieciom i bliskim, gdy pytają Cię o sens Twojej wiary i nadziei (Wj 12:26–27)?</p>
          <p>6. Czy trwasz w granicach Bożej ochrony, czy zdarza Ci się wychodzić za próg posłuszeństwa Słowu (Wj 12:22)?</p>
          <p>7. Czy wierzysz, że krew Chrystusa ma moc skruszyć najcięższe łańcuchy niewoli w Twojej rodzinie?</p>
          <p>8. Za jakie konkretne wyzwolenie z domu niewoli dziękujesz dziś Bogu z najgłębszą wdzięcznością?</p>`;

html = html.replace(/<div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── QUIZ/,
  `<div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          ${pomyslHtml}
        </div>
      </section>

      <!-- ── QUIZ`);

// M. Quiz sekcja
html = html.replace(/20 Pytań z Wj 10:1–29/, `20 Pytań z Wj 11:1–12:36`);
html = html.replace(/Po przeczytaniu Wj 10 odpowiedz na poniższe pytania\./, `Po przeczytaniu Wj 11–12 odpowiedz na poniższe pytania.`);

// N. Twoja decyzja
html = html.replace(/Wybierz Wolność bez Kompromisów — Ani Jedno Kopyto w Niewoli!/, `Wybierz Bezpieczeństwo pod Krwią Baranka — Wyjdź z Domu Niewoli!`);
html = html.replace(/Dziesiąty rozdział Księgi Wyjścia wzywa nas do bezkompromisowej wierności Bogu[\s\S]*?Oddajemy Panu wszystko — bez reszty i bez kompromisów!/,
  `Dwunasty rozdział Księgi Wyjścia stawia przed nami ostateczną alternatywę: albo pozostajesz w sferze buntu tego świata i podlegasz sprawiedliwemu sądowi Bożemu, albo chronisz się pod Krwią Baranka bez skazy. Bóg nie badał zasług Hebrajczyków ani ich moralnej doskonałości — badał, czy na drzwiach ich domów znajduje się krew przymierza. Dziś Pan Jezus Chrystus wzywa Cię do osobistego zaufania Jego ofierze na krzyżu. Wyrzecz się wszelkiego kwasu grzechu, weź laskę pielgrzyma i wyrusz w drogę wolności za Królem Królów!`);
html = html.replace(/„Panie Boże Wszechmogący, Światłości Świata i Królu Chwały! Wyrzekam się dziś wszelkiego kompromisu[\s\S]*?Amen!”/,
  `„Panie Boże Wszechmogący, Święty Sędzio i Miłosierny Zbawicielu! Dziękuję Ci z całego serca za dar Jezusa Chrystusa — mojego Baranka Paschalnego. Wyznaję, że sam z siebie nie mam żadnych zasług, którymi mógłbym uchronić się przed Twoim sprawiedliwym sądem. Wiarą kropię dziś węgary mojego serca, mój dom, moją rodzinę i moją przyszłość najdroższą Krwią Jezusa. Wyrzucam ze swojego życia wszelki stary kwas grzechu, obłudy i kompromisu. Przepasuję biodra wiarą i postanawiam iść za Tobą jako wierny pielgrzym każdego dnia mojego życia. Amen!”`);

// O. Modlitwa
html = html.replace(/Modlitwa na 10 listopada/, `Modlitwa na 11 listopada`);
html = html.replace(/Modlitwa o Światłość w Domu i Świętą Bezkompromisowość/, `Modlitwa o Ochronę Krwi Chrystusa i Czystość Pielgrzyma`);
html = html.replace(/<div class="p-5 rounded-2xl bg-black\/40 border border-brand-border\/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS/,
  `<div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Święty, Sprawiedliwy i Wszechmogący Boże! Przynosimy Ci dziś pokłon i uwielbienie za wielką tajemnicę Paschy, która rozświetliła mroki egipskiej nocy i zapowiedziała wieczny triumf Krzyża Golgoty.
          </p>
          <p>
            Panie Jezu Chryste, nasz Baranku Paschalny! Dziękujemy Ci, że złożyłeś Siebie w ofierze bez skazy, przelewając drogocenną krew dla naszego wiecznego zbawienia. Dziękujemy, że gdy Ojciec patrzy na nas przez Twoją krew, omija nas sąd i potępienie, a śmierć nie ma nad nami władzy.
          </p>
          <p>
            Usuń z naszych serc i domów wszelki kwas obłudy i grzechu. Przepasz nasze biodra wiernością i uczyń nas odważnymi pielgrzymami Twojej prawdy. Bądź uwielbiony w naszych rodzinach teraz i na wieki wieków. Amen!
          </p>
        </div>
      </section>

      <!-- ── ZASTOSOWANIE I TWÓJ ZAPIS`);

// P. Zadania na dziś (7 zadań)
const tasksHtml = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj osobiście cały jedenasty i dwunasty rozdział Księgi Wyjścia (Wj 11:1–12:36) w przekładzie UBG.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Podziękuj Chrystusowi w modlitwie za Jego krew przelaną na krzyżu, która jest Twoim jedynym i wiecznym schronieniem.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zbadaj swoje serce i dom: czy nie ma w Twoim życiu jakiegoś „zakwasu” grzechu lub nieszczerości, który należy bezzwłocznie usunąć (1 Kor 5:7–8)?</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Przeczytaj 1 Kor 5:7–8 oraz 1 P 1:18–19, rozważając doskonałość Baranka Bożego.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Pomyśl o swoich bliskich i powierz ich w modlitwie pod ochronę krwi Zbawiciela.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zapisz poniżej swoje osobiste postanowienie wierności i wdzięczności za Boże odkupienie.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Podziel się dzisiejszym rozważaniem z osobą, która zmaga się z lękiem przed śmiercią lub sądem Bożym.</span>
          </label>`;

html = html.replace(/<div class="space-y-4 text-xs sm:text-sm text-zinc-300 font-serif">[\s\S]*?<\/div>\s*<div class="space-y-4 pt-2">/,
  `<div class="space-y-4 text-xs sm:text-sm text-zinc-300 font-serif">
          <p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:</p>
          ${tasksHtml}
        </div>
        <div class="space-y-4 pt-2">`);

// R. Zapowiedź JUTRO
const jutroHtml = `<div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 12 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 43 — WYJŚCIE Z RAMZES, FILAR OBŁOKU I OGNIA ORAZ POŚWIĘCENIE PIERWORODNYCH (Wj 12:37–13:22)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 43: Wymarsz z Egiptu, noc czuwania dla Pana, obwarowania Paschy, poświęcenie każdego pierworodnego oraz cudowne Boże prowadzenie w słupie obłoku we dnie i w słupie ognia w nocy.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (12 listopada)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
            ← Spis kursu
          </a>
        </div>`;

html = html.replace(/<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        ${jutroHtml}
      </section>`);

// S. Udostępnianie
html = html.replace(/Dzie(?:ń|%C5%84)%2041%3A%20Plagi%20szara%C5%84czy%20i%20ciemno%C5%9Bci%20egipskiej%20(?:\(Wj%2010\)|%28Wj%2010%29)/g,
  `Dzie%C5%84%2042%3A%20%C5%9Awi%C4%99to%20Paschy%2C%20krew%20Baranka%20i%20wykupienie%20pierworodnych%20%28Wj%2011%E2%80%9312%29`);
html = html.replace(/Dzień%2041%3A%20Plagi%20szara%C5%84czy%20i%20ciemno%C5%9Bci%20egipskiej%20\(Wj%2010\)/g,
  `Dzień%2042%3A%20%C5%9Awi%C4%99to%20Paschy%2C%20krew%20Baranka%20i%20wykupienie%20pierworodnych%20(Wj%2011%E2%80%9312)`);
html = html.replace(/https%3A%2F%2Fpolskieradio\.cc%2Fakademia%2Fkurscodzienny%2Fdzien-41/g,
  `https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-42`);

// T. Quiz Dane (20 pytań)
const quizData42 = [
  {
    q: "Co według Wj 11:1 zapowiedział PAN Mojżeszowi w sprawie faraona?",
    a: [
      "Że faraon od razu uwierzy w Boga",
      "Że sprowadzi jeszcze jedną plagę, po której faraon całkowicie ich stąd wypędzi",
      "Że ustanowi Mojżesza wezyrem Egiptu",
      "Że wody Nilu wyschną na zawsze"
    ],
    c: 1
  },
  {
    q: "O co Izraelici mieli poprosić swoich egipskich sąsiadów przed wyjściem (Wj 11:2)?",
    a: [
      "O konie i rydwany bojowe",
      "O srebrne i złote przedmioty",
      "O zboże i oliwę",
      "O mapy pustyni"
    ],
    c: 1
  },
  {
    q: "Kiedy według słów Mojżesza PAN miał przejść przez Egipt w dziesiątej pladze (Wj 11:4)?",
    a: [
      "O wschodzie słońca",
      "W samo południe",
      "O północy",
      "O zmierzchu"
    ],
    c: 2
  },
  {
    q: "Jaki niezwykły znak pokoju i rozdzielenia zapowiedział Bóg dla Izraela w Wj 11:7?",
    a: [
      "Że na nikogo z synów Izraela pies nie ruszy swym językiem",
      "Że nad Goszen pojawi się tęcza",
      "Że spadnie manna z nieba",
      "Że zapłoną ogniska na granicach"
    ],
    c: 0
  },
  {
    q: "Co Bóg powiedział o miesiącu Paschy w Wj 12:2?",
    a: [
      "Że będzie to miesiąc żałoby",
      "Że ten miesiąc będzie początkiem miesięcy, pierwszym miesiącem roku",
      "Że będzie to ostatni miesiąc w kalendarzu",
      "Że należy go wykreślić z pamięci"
    ],
    c: 1
  },
  {
    q: "Którego dnia pierwszego miesiąca należało wybrać baranka dla domu (Wj 12:3)?",
    a: [
      "Pierwszego dnia",
      "Dziesiątego dnia",
      "Czternastego dnia",
      "Dwudziestego pierwszego dnia"
    ],
    c: 1
  },
  {
    q: "Jakie cechy musiał posiadać baranek paschalny według Wj 12:5?",
    a: [
      "Dowolny wiek i maść",
      "Samica bez rogów",
      "Baranek bez skazy, jednoroczny samiec, spośród owiec lub kóz",
      "Zwierzę ofiarowane wcześniej w pogańskiej świątyni"
    ],
    c: 2
  },
  {
    q: "Do którego dnia miesiąca należało strzec baranka przed zabiciem (Wj 12:6)?",
    a: [
      "Do dwunastego dnia",
      "Do czternastego dnia",
      "Do piętnastego dnia",
      "Przez cały miesiąc"
    ],
    c: 1
  },
  {
    q: "Czym i w jaki sposób należało oznaczyć wejście do domu krwią baranka (Wj 12:7, 22)?",
    a: [
      "Wylać krew na próg wejściowy",
      "Pokropić wiązką hizopu oba węgary i nadproże",
      "Namalować znak na dachu",
      "Zanurzyć dłonie i odcisnąć je na drzwiach"
    ],
    c: 1
  },
  {
    q: "Z czym należało spożywać pieczone mięso baranka w noc paschalną (Wj 12:8)?",
    a: [
      "Z miodem i figami",
      "Z przaśnym chlebem i gorzkimi ziołami",
      "Z winem i oliwkami",
      "Z gotowanym jęczmieniem"
    ],
    c: 1
  },
  {
    q: "Czego kategorycznie zakazano przy przyrządzaniu baranka w Wj 12:9?",
    a: [
      "Pieczenia przy ogniu",
      "Jedzenia mięsa surowego lub ugotowanego w wodzie",
      "Solenia mięsa",
      "Spożywania z rodziną"
    ],
    c: 1
  },
  {
    q: "W jakim ubiorze i w jaki sposób Izraelici mieli spożywać Paschę (Wj 12:11)?",
    a: [
      "W szatach żałobnych, leżąc przy stole",
      "Z biodrami przepasanymi, obuwiem na nogach, laską w ręku i w pośpiechu",
      "Na kolanach w milczeniu",
      "W tańcu wokół ołtarza"
    ],
    c: 1
  },
  {
    q: "Jakie fundamentalne słowa wypowiedział Bóg w Wj 12:13 w sprawie krwi na domach?",
    a: [
      "„Gdy przyniesiecie złoto, ominę was”",
      "„Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia”",
      "„Gdy Mojżesz zawoła, spojrzę na was”",
      "„Gdy usłyszę wasz płacz, zlituję się”"
    ],
    c: 1
  },
  {
    q: "Przez ile dni należało jeść przaśny chleb podczas Święta Przaśników (Wj 12:15)?",
    a: [
      "Przez 3 dni",
      "Przez 7 dni",
      "Przez 14 dni",
      "Przez 40 dni"
    ],
    c: 1
  },
  {
    q: "Jaki kategoryczny zakaz obowiązywał synów Izraela w noc paschalną aż do rana (Wj 12:22)?",
    a: [
      "Zakaz spania",
      "Zakaz rozmawiania z dziećmi",
      "Niech nikt z was nie wychodzi za drzwi swego domu aż do rana",
      "Zakaz palenia ognia"
    ],
    c: 2
  },
  {
    q: "Co rodzice mieli odpowiedzieć swoim dzieciom, gdy zapytają o znaczenie obrzędu (Wj 12:26–27)?",
    a: [
      "Że to tradycja pradziadków",
      "Że to ofiara paschy PANA, który ominął domy synów Izraela w Egipcie, a nasze domy ocalił",
      "Że to tajemnica kapłanów",
      "Że dowiedzą się w dorosłości"
    ],
    c: 1
  },
  {
    q: "Kto zginął w ziemi Egiptu o północy w dziesiątej pladze (Wj 12:29)?",
    a: [
      "Tylko wojsko faraona",
      "Wszystko, co pierworodne: od syna faraona po pierworodnego więźnia i bydła",
      "Wszyscy kapłani pogańscy",
      "Tylko starcy w miastach"
    ],
    c: 1
  },
  {
    q: "Jak zareagował faraon i Egipcjanie w nocy po uderzeniu plagi (Wj 12:30–31)?",
    a: [
      "Zmobilizowali armię do walki",
      "Podniósł się wielki krzyk, a faraon w nocy wezwał Mojżesza i kazał natychmiast wyjść ludowi",
      "Zamknęli bramy miast",
      "Złożyli okup z owiec"
    ],
    c: 1
  },
  {
    q: "O co poprosił złamany faraon Mojżesza i Aarona na odchodnym w Wj 12:32?",
    a: [
      "O zwrot pożyczonego złota",
      "„Mnie też błogosławcie”",
      "O pozostawienie lekarzy",
      "O obietnicę powrotu za rok"
    ],
    c: 1
  },
  {
    q: "W czym lud Izraela niósł niezakwaszone ciasto opuszczając Egipt (Wj 12:34)?",
    a: [
      "W żelaznych skrzyniach",
      "W dzieżach owiniętych w swoje szaty na ramionach",
      "Na wozach zaprzężonych w woły",
      "W glinianych dzbanach"
    ],
    c: 1
  }
];

html = html.replace(/const QUIZ_DATA = \[[\s\S]*?\];/, `const QUIZ_DATA = ${JSON.stringify(quizData42, null, 2)};`);

// U. Klucze skryptu & Storage
html = html.replace(/const DAY_KEY = 'kc_day41';/, `const DAY_KEY = 'kc_day42';`);
html = html.replace(/function completeDay41\(\)/, `function completeDay42()`);
html = html.replace(/window\.completeDay41 = completeDay41;/, `window.completeDay42 = completeDay42;`);
html = html.replace(/onclick="completeDay41\(\)"/, `onclick="completeDay42()"`);
html = html.replace(/Oznacz Dzień 41 jako ukończony/g, `Oznacz Dzień 42 jako ukończony`);
html = html.replace(/Dzień 41 ukończony!/g, `Dzień 42 ukończony!`);
html = html.replace(/<!-- LESSON BODY CONTENT \(Dzień 41, 10\.11\.2026\) -->/, `<!-- LESSON BODY CONTENT (Dzień 42, 11.11.2026) -->`);

// V. Audio TTS Utterance
html = html.replace(/const u = new SpeechSynthesisUtterance\("[^"]*"\);/,
  `const u = new SpeechSynthesisUtterance("A ta krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę zabijał w ziemi Egiptu. (Księga Wyjścia 12:13 (UBG))");`);

// W. Zapisujemy w kolejce
fs.writeFileSync(path.join(queueDir, 'lekcja.html'), html, 'utf8');
console.log('✅ Zapisano kolejka-publikacji/kurs-codzienny/2026-11-11/lekcja.html');

// ── 7. ZAPISUJEMY 4 ŚCIEŻKI CLEAN URLS DLA DNIA 42 ──
const cleanPaths42 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-42.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-42/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-42.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-42/index.html')
];

for (const cp of cleanPaths42) {
  fs.mkdirSync(path.dirname(cp), { recursive: true });
  fs.writeFileSync(cp, html, 'utf8');
}
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 42 w polskieradio.cc');

// Mirror w Desktop/@ICC/LUMINA
const mirrorBase = 'C:/Users/czark/Desktop/@ICC/LUMINA';
if (fs.existsSync(mirrorBase)) {
  const mirrorPaths42 = [
    path.join(mirrorBase, 'akademia/kurscodzienny/dzien-42.html'),
    path.join(mirrorBase, 'akademia/kurscodzienny/dzien-42/index.html'),
    path.join(mirrorBase, 'kursy/kurscodzienny/dzien-42.html'),
    path.join(mirrorBase, 'kursy/kurscodzienny/dzien-42/index.html')
  ];
  for (const mp of mirrorPaths42) {
    fs.mkdirSync(path.dirname(mp), { recursive: true });
    fs.writeFileSync(mp, html, 'utf8');
  }
  // Kopiujemy także grafikę do mirrora
  const mirrorImg = path.join(mirrorBase, 'images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg');
  fs.mkdirSync(path.dirname(mirrorImg), { recursive: true });
  fs.copyFileSync(
    path.join(process.cwd(), 'images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg'),
    mirrorImg
  );
  console.log('✅ Zsynchronizowano lustro @ICC/LUMINA dla Dnia 42 wraz z grafiką');
}

// ── 8. AKTUALIZACJA POWIĄZAŃ NAWIGACYJNYCH W DNIU 41 ──
const d41Paths = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-41.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-41/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-41.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-41/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-41.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-41/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-41.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-41/index.html'
];

for (const p of d41Paths) {
  if (fs.existsSync(p)) {
    let d41Content = fs.readFileSync(p, 'utf8');
    // Top bar nav update: Dzień 42 (Jutro) -> Dzień 42 ->
    d41Content = d41Content.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 42 \(Jutro\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-42" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 42 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    // Jutro button update
    d41Content = d41Content.replace(
      /<span class="inline-flex items-center gap-2 px-5 py-2\.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-\[44px\]">\s*<span>Dostępne od północy \(11 listopada\)<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-42" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">\n            <span>Przejdź do Dnia 42</span>\n            <span>→</span>\n          </a>`
    );
    fs.writeFileSync(p, d41Content, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania nawigacyjne w Dniu 41 wskazujące na Dzień 42');

// ── 9. DODANIE KARTY DNIA 42 DO 8 PLIKÓW KATALOGOWYCH ──
const card42Html = `          <!-- DZIEŃ 42 -->
          <a href="/akademia/kurscodzienny/dzien-42" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 42 • 11 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-brand-line">
              <img src="/images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg?v=20261111" alt="Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </div>
            <h3 class="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              Święto Paschy, Krew Baranka i Wykupienie Pierworodnych
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 font-serif">
              Ustanowienie Baranka Paschalnego, krew na odrzwiach w Goszen, sąd o północy nad pierworodnymi Egiptu i wyjście z niewoli.
            </p>
            <div class="mt-auto pt-3 border-t border-brand-line flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 11:1–12:36</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

// Aktualizujemy akademia.html dodając kartę 42, zmieniając kartę 41 na DOSTĘPNA TERAZ
let akademiaContent = fs.readFileSync(path.join(process.cwd(), 'akademia.html'), 'utf8');

// Jeśli karta 42 jeszcze nie istnieje w akademia.html, wstaw ją po karcie 41
if (!akademiaContent.includes('/akademia/kurscodzienny/dzien-42" class="group')) {
  // Zmiana karty 41 na DOSTĘPNA TERAZ
  akademiaContent = akademiaContent.replace(
    /(<a href="\/akademia\/kurscodzienny\/dzien-41" class=")[^"]+("[\s\S]*?)<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>/,
    `$1group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col$2<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>`
  );
  // Wstawienie karty 42 za kartą 41
  akademiaContent = akademiaContent.replace(
    /(<a href="\/akademia\/kurscodzienny\/dzien-41" class="group[\s\S]*?<\/a>)/,
    `$1\n\n${card42Html}`
  );
  fs.writeFileSync(path.join(process.cwd(), 'akademia.html'), akademiaContent, 'utf8');
  console.log('✅ Dodano kartę Dnia 42 do akademia.html');
}

console.log('🎉 Wszystkie elementy lekcji, pakietu 5 wersji, pliku docx i HTML dla Dnia 42 zostały przygotowane!');
