import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 46: Wj 16:1–36 (15 listopada 2026, Niedziela)
const DAY_NUM = 46;
const DATE_STR = '2026-11-15';
const DATE_FORMATTED = 'Niedziela, 15 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 16:1–36';
const TITLE = 'MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU — BOŻE ZAOPATRZENIE NA PUSTYNI';
const SUBTITLE = 'Głodny lud na pustyni Sin, deszcz chleba z nieba, przepiórki o zmierzchu, miara omera i dar Bożego odpoczynku w Szabacie (Wj 16:1–36)';
const MEMORY_VERSE = '„Wtedy PAN powiedział do Mojżesza: Oto spuszczę wam jak deszcz chleb z nieba. Lud będzie wychodził i każdego dnia będzie zbierał według potrzeby dziennej, abym mógł go wystawić na próbę, czy będzie postępował zgodnie z moim prawem, czy nie.” (Wj 16:4, UBG)';
const THEME = 'Szesnasty rozdział Księgi Wyjścia to fundamentalna lekcja Bożej opatrzności i zaufania na każdy dzień. Gdy na pustyni Sin Izraelici stają w obliczu braku chleba i w lęku wspominają egipskie garnki mięsa, Bóg odpowiada nie gniewem, lecz łaskawym cudem. Wieczorem obóz pokrywają przepiórki, a o poranku na ziemi pojawia się drobny, biały pokarm przypominający szron — manna, o smaku placków z miodem. Bóg uczy lud zbierać wyłącznie porcję na dany dzień, zakazując chciwości i lękowego gromadzenia zapasów. Równocześnie Bóg objawia świętość Szabatu: w szósty dzień lud zbiera podwójnie (dwa omer na osobę), aby w siódmy dzień odpoczywać w świętym spoczynku dla PANA (Wj 16:23). W Ewangelii Jana Pan Jezus wskazuje na Siebie: „Nie Mojżesz dał wam chleb z nieba, ale mój Ojciec daje wam prawdziwy chleb z nieba... Ja jestem chlebem życia!” (J 6:32, 35).';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 46 (Wj 16:1–36)...');

// ── 1. CZYTANIE DNIA (UBG) ──
const exo16Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-016.json');
const exo16Data = JSON.parse(fs.readFileSync(exo16Path, 'utf8'));

const readingVerses = exo16Data.verses.map(v => ({ ref: `Wj 16:${v.number}`, num: v.number, text: v.text }));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 16:1–12 — Pustynia Sin, szemranie o chleb i obietnica PANA</h3></div>',
  ...exo16Data.verses.filter(v => v.number <= 12).map(v => `<p><span class="verse-num">16:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 16:13–36 — Przepiórki, manna z nieba, miara omer i świętość Szabatu</h3></div>',
  ...exo16Data.verses.filter(v => v.number >= 13).map(v => `<p><span class="verse-num">16:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 46 (15 listopada 2026): Manna z Nieba i Świętość Szabatu — Boże Zaopatrzenie na Pustyni (Wj 16:1–36)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Szósty

Czy zdarza Ci się budzić rano z niepokojem o jutro, o finanse, o zdrowie i o to, czy wystarczy Ci sił i środków na wszystkie wyzwania nadchodzących dni?

Zatrzymaj się w ten niedzielny poranek, piętnastego listopada dwa tysiące dwudziestego szóstego roku. Odetchnij głęboko Bożą obecnością i spójrz na niebo. Zapytaj w ciszy modlitwy: Panie Jezu, czy wierzę z całego serca, że jesteś moim dobrym Pasterzem i że mój Ojciec Niebieski wie, czego potrzebuję, zanim jeszcze Go o to poproszę?

W szesnastym rozdziale Księgi Wyjścia lud Boży wędruje przez pustynię Sin. Skończyły się zapasy zabrane z Egiptu, a w sercach ludzi odzywa się paraliżujący lęk przed głodem. Zaczynają wspominać egipskie garnki pełne mięsa i chleba, zapominając o okrucieństwie niewoli. Jak reaguje Bóg? Pan mówi do Mojżesza: Oto spuszczę wam jak deszcz chleb z nieba! O poranku całą pustynię pokrywa biała, delikatna warstwa manny. Bóg nakazuje zbierać ją codziennie — dokładnie tyle, ile potrzeba na jeden dzień. Jeśli ktoś z braku wiary próbował gromadzić zapasy na zapas, pokarm psuł się i robaczywiał. Bóg uczył swój lud zaufania krok po kroku, dzień po dniu. A w szósty dzień Bóg dawał podwójną porcję, aby siódmy dzień był dniem świętego odpoczynku i pokoju dla Pana!

W Jezusie Chrystusie ta manna znajduje swoje najwspanialsze wypełnienie. Jezus staje pośród nas i woła: To Ja jestem Chlebem Żywym, który zstąpił z nieba; jeśli kto spożywa z tego chleba, żyć będzie na wieki! Nie musisz żyć w lęku o przyszłość. Kto karmi się Słowem Bożym i opiera swoje życie na Chrystusie, nigdy nie zazna duchowego głodu. Złóż wszystkie swoje troski w ręce Pana i przyjmij Jego błogosławieństwo na cały nadchodzący tydzień!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 46 (15 listopada 2026 r.)
📖 Księga Wyjścia 16:1–36: Manna z Nieba i Świętość Szabatu — Boże Zaopatrzenie na Pustyni

Czy potrafisz zaufać Bogu o chleb powszedni na każdy pojedynczy dzień bez lęku o jutro?

W 46. dniu naszej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) wkraczamy z Izraelem w głąb pustyni Sin (Wj 16:1–36: https://polskieradio.cc/mojabiblia?ref=Wj16:1-36).

Kluczowe filary dzisiejszego studium:
1. Szemranie z głodu i pamięć niewoli (Wj 16:1–3): Izraelici wspominają garnki mięsa w Egipcie, ulegając pokusie fałszywego bezpieczeństwa kosztem wolności.
2. Obietnica chleba z nieba i przepiórki (Wj 16:4–13): Bóg objawia Swą chwałę w obłoku i zsyła wieczorem przepiórki, a o poranku mannę, sprawdzając posłuszeństwo ludu.
3. Cud manny i miara omer (Wj 16:14–21): Białe ziarno jak kolendra o smaku placków z miodem. Każdy zbierał według swoich potrzeb: ten, kto zebrał dużo, nie miał za wiele, a kto zebrał mało, nie miał za mało (zasada sprawiedliwości Bożej — 2 Kor 8:15).
4. Święty Szabat i chleb na zapas (Wj 16:22–30): Pierwsze wyraźne objawienie daru Szabatu na pustyni przed nadaniem Zakonu na Synaju. W szósty dzień Bóg daje podwójną porcję, która nie ulega zepsuciu, uświęcając dzień świętego odpoczynku.
5. Dzban z manną w Miejscu Najświętszym (Wj 16:31–36): Omer manny złożony na pamiątkę przed Świadectwem dla przyszłych pokoleń.

Studiuj pełny tekst, kody Stronga i komentarz werset po wersecie:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-46

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 46 (Wj 16:4): „Oto spuszczę wam jak deszcz chleb z nieba”. Bóg troszczy się o Twój każdy dzień. Zaufaj Chrystusowi — Prawdziwemu Chlebowi Życia! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, ciepłe studio Christian Culture TV w kolorystyce ciemnego szafiru i szlachetnego złota Champagne Gold (#C4A35A). Na wielkoformatowym ekranie w tle grafika 16:9: poranna pustynia Sin zasypana białym pokarmem przypominającym szron, w tle obłok chwały Pańskiej i wschodzące słońce, a na pierwszym planie hebrajska rodzina zbierająca mannę do glinianych naczyń omer. Tytuł audycji: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 46: MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU”.

[INTRO: NIEPOKÓJ PUSTYNI I ODPOWIEDŹ NIEBIOS]
Noemi: Dzień dobry! Witamy bardzo serdecznie w czterdziestym szóstym dniu naszej wielkiej podróży przez Pismo Święte w Christian Culture TV! Dziś wchodzimy na pustynię Sin — miejsce, w którym kończą się wszelkie ludzkie zapasy, a zaczyna się absolutna szkoła Bożej zależności.
Sara: Dokładnie tak, Noemi! Minął dokładnie miesiąc od nocy paschalnej w Egipcie. Chleb upieczony z zabranej mąki został zjedzony. Wokół tylko piasek, skały i bezkresne pustkowie. I wtedy z ludzkich serc wydobywa się krzyk: „Obyśmy pomarli w Egipcie przy garncach mięsa!”.
Noemi: Zobaczmy, jak zadziwiająca jest Boża cierpliwość. Bóg nie uderza piorunem, nie odsyła ludu z powrotem do niewoli, lecz składa obietnicę: „Oto spuszczę wam jak deszcz chleb z nieba!”.

[ANALIZA PROBLEMOWA: CODZIENNY OMER I CHCIWOŚĆ]
Sara: I tu pojawia się niezwykła reguła: każdy miał zebrać dokładnie jeden omer na osobę — ani grama więcej na zapas w dni powszednie. Kto z braku zaufania próbował zachomikować mannę na następny dzień, rano znajdował w naczyniu tylko zgniliznę i robactwo!
Noemi: Bóg uczył swój lud modlitwy, którą tysiąc pięćset lat później Pan Jezus włożył w usta swoich uczniów: „Chleba naszego powszedniego daj nam dzisiaj”. Prawdziwa wiara to zaufanie, że Bóg zatroszczy się o mnie jutro tak samo wiernie, jak zatroszczył się dzisiaj!

[SZCZYT CHRYSTOCENTRYCZNY: CHLEB ŻYCIA I PAN SZABATU]
Sara: Ale ten rozdział przynosi jeszcze dwa potężne objawienia. Pierwsze to dar Szabatu — w szósty dzień Bóg daje podwójną porcję, która cudownie nie psuje się przez noc, aby w siódmy dzień cały lud mógł wejść w Boży odpoczynek! To stało się zanim Izrael dotarł pod górę Synaj. Szabat to odwieczny dar miłości Stwórcy.
Noemi: A drugie objawienie to sam Jezus Chrystus! W szóstym rozdziale Ewangelii Jana Pan Jezus stawia sprawę jasno: „Nie Mojżesz dał wam chleb z nieba... To Ja jestem Chlebem Żywym, który zstąpił z nieba. Kto spożywa ten chleb, będzie żył na wieki!”. Zwykła manna syciła ciało na kilka godzin, lecz Chrystus nasyca duszę na całą wieczność!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Sara: Zapamiętajmy na dziś słowa z wersetu czwartego: „Oto spuszczę wam jak deszcz chleb z nieba”.
Noemi: Wejdźcie na polskieradio.cc/akademia, rozwiążcie dzisiejszy quiz dwudziestu pytań i podejmijcie decyzję: przestaję żyć w lęku o finanse i jutrzejszy dzień, a zaczynam karmić się Słowem Bożym o każdym poranku!

[MODLITWA BOJOWA]
Noemi i Sara razem: „Panie Jezu Chryste, Ty jesteś Chlebem Życia i Panem naszego odpoczynku! Odbierz z naszych serc wszelki lęk o jutro, wszelkie narzekanie i chciwość. Naucz nas zbierać Twoje Słowo o świcie, dzielić się hojnie z potrzebującymi i świętować Twój pokój każdego dnia. Amen!”

[OUTRO]
Sara: Zostańcie z nami na polskieradio.cc.
Noemi: Do zobaczenia jutro w siedemnastym rozdziale Księgi Wyjścia — woda ze skały w Horebie i zwycięstwo nad Amalekiem!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: MANNA Z NIEBA, TEOLOGIA POWSZEDNIEGO ZAOPATRZENIA I ANTE-SINAICKI SZABAT: EGZEGEZA WJ 16:1–36

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 15 listopada 2026 r.

W ramach cyklu badawczo-formacyjnego „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje studium egzegetyczno-teologiczne szesnastego rozdziału Księgi Wyjścia. Rozdział ten stanowi zwrotny punkt w formacji antropologicznej i duchowej Izraela: przejście od oswobodzenia z ucisku militarnego do wewnętrznej reedukacji w zakresie zaufania, ekonomii łaski oraz instytucji świętego czasu (Szabatu) przed zawarciem przymierza na Synaju.

1. CHRONOLOGIA PUSTYNI SIN I PSYCHOLOGIA NIEWOLNIKA (WJ 16:1–3)
Tekst precyzyjnie datuje przybycie na pustynię Sin na piętnasty dzień drugiego miesiąca po wyjściu z Egiptu (Wj 16:1). Oznacza to upływ dokładnie trzydziestu dni od nocy paschalnej — naturalny czas wyczerpania zapasów przaśnego ciasta wyniesionego z Goszen. Reakcją ludu jest regresywna nostalgia za egipskimi „garncami mięsa” (hebr. sir habbasar) i „chlebem do syta”. Zjawisko to odsłania typową traumę postniewolniczą: człowiek zniewolony woli przewidywalną wegetację w tyranii niż wymagającą odpowiedzialności wolność przymierza z Bogiem.

2. BOSKA EKONOMIA ŁASKI: DESZCZ CHLEBA JAKO PRÓBA POSŁUSZEŃSTWA (WJ 16:4–12)
Odpowiedź Boga nie przybiera formy represji, lecz darmowego daru: „Oto spuszczę wam jak deszcz chleb z nieba” (16:4). Formuła ta wprowadza terminologię próby (hebr. nasa): dar materialny staje się instrumentem weryfikacji wierności prawu Bożemu. Bóg objawia Swój Majestat (hebr. Kabod JAHWE) w obłoku pustynnym (16:10), demonstrując, że zaopatrzenie nie jest wynikiem naturalnych praw ekosystemu, lecz suwerennego miłosierdzia Stwórcy.

3. FENOMENOLOGIA MANNY I RÓWNOŚĆ MIARY OMERA (WJ 16:13–21)
Wieczorny przelot przepiórek (hebr. selaw) oraz poranny osad manny (hebr. man hu — „co to jest?”, 16:15) wyznaczają dobowy rytm zaopatrzenia. Manna opisana jest jako substancja drobna, łuskowata, biała jak nasienie kolendry, o smaku placków z miodem (16:31). Zasada omera (ok. 2,2 litra na osobę) ustanawia teologiczną normę dystrybucji: „ten, kto nazbierał więcej, nie miał nadmiaru, a temu, kto nazbierał mało, nie zabrakło” (16:18). Apostoł Paweł w 2 Kor 8:15 czyni z tego wersetu fundament chrześcijańskiej solidarności i dobrowolnego dzielenia się dobrami. Zakaz pozostawiania manny do rana demaskuje iluzję akumulacji kapitału: chciwość skutkuje gniciem i robactwem (16:20).

4. INSTYTUCJA SZABATU PRZED KODEKSEM SYNAICKIM (WJ 16:22–30)
Kluczowym elementem rozdziału jest pierwsze w dziejach przymierza uroczyste ogłoszenie Szabatu (hebr. Szabbat / Szabbaton, 16:23). Fakt, że nakaz święcenia siódmego dnia pojawia się przed proklamacją Dekalogu w Wj 20, dowodzi kreacyjnego i uniwersalnego charakteru spoczynku Bożego (odwołanie do Rdz 2:2–3). Podwójna porcja w szóstym dniu, która cudownie nie ulega rozkładowi, stanowi cotygodniowy dowód transcendencji Boga nad prawami biologii. Szabat objawia się jako wyzwolenie człowieka spod dyktatu permanentnej produkcji.

5. ARKA ŚWIADECTWA I WIECZNA PAMIĄTKA (WJ 16:31–36)
Polecenie złożenia pełnego omera manny w naczyniu przed Świadectwem (hebr. Edut, 16:34) wprowadza koncepcję pamiątki historyczno-zbawczej (zob. Hbr 9:4). Czterdziestoletni okres żywienia manną aż do granic Kanaanu (16:35) pieczętuje stałość Bożej wierności w całym okresie próby pokoleniowej.

6. WYPEŁNIENIE CHRYSTOCENTRYCZNE I ESCHATOLOGICZNE
W mowie eucharystycznej w Kafarnaum (J 6:31–58) Jezus dokonuje definitywnej reinterpretacji manny. Ojcowie jedli mannę na pustyni i pomarli; Chrystus jest Chlebem Prawdziwym, który zstępuje z nieba i daje życie światu (J 6:33). Manna doczesna była typem wcielenia Słowa i ofiary krzyżowej. W wymiarze eschatologicznym Księga Objawienia obiecuje wiernym „mannę ukrytą” (Ap 2:17) — wieczną komunię ze Zbawicielem w chwale Nowego Jeruzalem.

📌 PODSUMOWANIE REDAKCYJNE CCN
Wj 16 uczy nowoczesnego człowieka, uwikłanego w lęk przed brakiem i kult konsumpcji, że życie nie zależy od ilości nagromadzonych dóbr, lecz od Słowa wychodzącego z ust Bożych oraz od umiejętności wejścia w święty odpoczynek z Bogiem.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI ZGODNIE Z WYTYCZNYMI GPT) ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 46
MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU — BOŻE ZAOPATRZENIE NA PUSTYNI
Głodny lud na pustyni Sin, deszcz chleba z nieba, przepiórki o zmierzchu, miara omera i dar Bożego odpoczynku w Szabacie (Wj 16:1–36)
Niedziela, 15 listopada 2026 r.  |  Czytanie: Wj 16:1–36
TEKST PAMIĘCIOWY: „Wtedy PAN powiedział do Mojżesza: Oto spuszczę wam jak deszcz chleb z nieba. Lud będzie wychodził i każdego dnia będzie zbierał według potrzeby dziennej, abym mógł go wystawić na próbę, czy będzie postępował zgodnie z moim prawem, czy nie.” (Wj 16:4, UBG)
MYŚL PRZEWODNIA: Szesnasty rozdział Księgi Wyjścia to fundamentalna lekcja Bożej opatrzności i zaufania na każdy dzień. Gdy na pustyni Sin Izraelici stają w obliczu braku chleba i w lęku wspominają egipskie garnki mięsa, Bóg odpowiada nie gniewem, lecz łaskawym cudem. Wieczorem obóz pokrywają przepiórki, a o poranku na ziemi pojawia się drobny, biały pokarm przypominający szron — manna, o smaku placków z miodem. Bóg uczy lud zbierać wyłącznie porcję na dany dzień, zakazując chciwości i lękowego gromadzenia zapasów. Równocześnie Bóg objawia świętość Szabatu: w szósty dzień lud zbiera podwójnie (dwa omer na osobę), aby w siódmy dzień odpoczywać w świętym spoczynku dla PANA (Wj 16:23). W Ewangelii Jana Pan Jezus wskazuje na Siebie: „Nie Mojżesz dał wam chleb z nieba, ale mój Ojciec daje wam prawdziwy chleb z nieba... Ja jestem chlebem życia!” (J 6:32, 35).

ZANIM OTWORZYSZ BIBLIĘ
Szesnasty rozdział Księgi Wyjścia wprowadza nas w samo serce pustynnej szkoły wiary. Zaledwie miesiąc temu Izrael świętował cud paschalnego ocalenia i przeszedł suchą stopą przez Morze Czerwone. Minęły dni radosnych pieśni Mojżesza i Miriam, a oaza Elim z dwunastoma źródłami i siedemdziesięcioma palmami pozostała w tyle. Teraz lud wkracza w surowy, skalisty krajobraz pustyni Sin, rozciągającej się pomiędzy Elim a górą Synaj.
W tym surowym środowisku kończą się zapasy mąki wyniesionej z Egiptu. Pojawia się głód, a wraz z nim paraliżujący lęk przed śmiercią głodową. Zamiast wołać z wiarą do Boga, który rozdzielił wody morza, lud zaczyna gwałtownie szemrać przeciwko swoim przywódcom, idealizując egipską niewolę.
Odpowiedź Boga jest jednym z najbardziej zachwycających objawień łaski w całym Piśmie Świętym. Zamiast kary, Bóg zsyła z niebios „deszcz chleba” i wieczorny dar mięsa. Równocześnie wprowadza Boży porządek: codzienną zależność od powszedniego chleba oraz cotygodniowe uświęcenie siódmego dnia — Szabatu. Otwórzmy ten rozdział z modlitwą, prosząc Ducha Świętego, by nauczył nas ufać Chrystusowi w każdej pustyni naszego życia.

TEKST PISMA ŚWIĘTEGO — CZYTANIE DNIA (WJ 16:1–36, UBG)
Wj 16:1 Potem wyruszyli z Elim i całe zgromadzenie synów Izraela przybyło na pustynię Sin, która leży między Elim a Synajem, piętnastego dnia drugiego miesiąca po ich wyjściu z ziemi Egiptu.
Wj 16:2 I całe zgromadzenie synów Izraela szemrało przeciw Mojżeszowi i Aaronowi na pustyni.
Wj 16:3 Synowie Izraela mówili do nich: Obyśmy pomarli z ręki PANA w ziemi Egiptu, gdy siadaliśmy nad garncami mięsa, gdy najadaliśmy się chleba do syta! Bo wyprowadziliście nas na tę pustynię, by całą tę rzeszę zamorzyć głodem.
Wj 16:4 Wtedy PAN powiedział do Mojżesza: Oto spuszczę wam jak deszcz chleb z nieba. Lud będzie wychodził i każdego dnia będzie zbierał według potrzeby dziennej, abym mógł go wystawić na próbę, czy będzie postępował zgodnie z moim prawem, czy nie.
Wj 16:5 A szóstego dnia przyrządzą to, co przyniosą, a będzie tego dwa razy tyle, co zbierają codziennie.
Wj 16:6 Mojżesz i Aaron mówili do wszystkich synów Izraela: Wieczorem poznacie, że PAN wyprowadził was z ziemi Egiptu;
Wj 16:7 A rano ujrzycie chwałę PANA, usłyszał bowiem wasze szemrania przeciw PANU. A my, czym jesteśmy, że szemrzecie przeciwko nam?
Wj 16:8 Mojżesz mówił dalej: PAN da wam wieczorem mięso do jedzenia, a rano chleb do syta. PAN bowiem usłyszał wasze szemrania, które podnosicie przeciw niemu. A my, czym jesteśmy? Wasze szemrania nie są przeciwko nam, ale przeciwko PANU.
Wj 16:9 Mojżesz powiedział do Aarona: Powiedz całemu zgromadzeniu synów Izraela: Zbliżcie się przed oblicze PANA, gdyż usłyszał wasze szemranie.
Wj 16:10 Gdy Aaron mówił do całego zgromadzenia synów Izraela, spojrzeli w stronę pustyni, a oto chwała PANA ukazała się w obłoku.
Wj 16:11 Potem PAN powiedział do Mojżesza:
Wj 16:12 Usłyszałem szemranie synów Izraela. Powiedz do nich: Pod wieczór będziecie jeść mięso, a rano będziecie nasyceni chlebem. I poznacie, że ja jestem PAN, wasz Bóg.
Wj 16:13 Wieczorem stało się tak, że zleciały się przepiórki i pokryły obóz, a rano dokoła obozu leżała rosa;
Wj 16:14 A gdy warstwa rosy się uniosła, ukazało się na powierzchni pustyni coś bardzo małego, okrągłego, drobnego jak szron na ziemi.
Wj 16:15 Gdy synowie Izraela to zobaczyli, mówili jeden do drugiego: To manna, gdyż nie wiedzieli, co to było. I Mojżesz powiedział do nich: To jest chleb, który PAN dał wam do jedzenia.
Wj 16:16 Oto co PAN rozkazał: Niech każdy zbiera z niego tyle, ile trzeba do jedzenia, omer na osobę, według liczby osób. Niech każdy zbiera dla tych, którzy są w jego namiocie.
Wj 16:17 I synowie Izraela tak uczynili, i zbierali jedni więcej, drudzy mniej.
Wj 16:18 A gdy to mierzyli omerem, to ten, kto nazbierał więcej, nie miał nadmiaru, temu zaś, kto nazbierał mało, nie zabrakło. Każdy zbierał według tego, co mógł zjeść.
Wj 16:19 Mojżesz mówił też do nich: Niech nikt nie pozostawia z tego nic do rana.
Wj 16:20 Jednak nie usłuchali Mojżesza i zostawili niektórzy z tego aż do rana, i zamieniło się w robaki, i cuchnęło. I Mojżesz rozgniewał się na nich.
Wj 16:21 Zbierali to więc każdego ranka, każdy według tego, co mógł zjeść. A gdy słońce zaczynało grzać, topniało.
Wj 16:22 A gdy nastał szósty dzień, zbierali dwa razy więcej chleba, po dwa omery na każdego. I wszyscy przełożeni zgromadzenia przyszli i powiedzieli o tym Mojżeszowi.
Wj 16:23 On zaś powiedział im: Oto co PAN mówił: Jutro będzie odpoczynek, święty szabat dla PANA. Upieczcie, co macie upiec, ugotujcie, co macie ugotować, a co zostanie, zostawcie sobie i zachowajcie do jutra.
Wj 16:24 Zostawili więc to do rana, jak Mojżesz rozkazał, i nie cuchnęło ani nie było w tym robaków.
Wj 16:25 I Mojżesz powiedział: Jedzcie to dziś, bo dziś jest szabat dla PANA. Dziś nie znajdziecie tego na polu.
Wj 16:26 Przez sześć dni będziecie to zbierać, a w siódmym dniu jest szabat, w nim tego nie będzie.
Wj 16:27 A siódmego dnia niektórzy z ludu wyszli, aby zbierać, ale nic nie znaleźli.
Wj 16:28 Wtedy PAN powiedział do Mojżesza: Jak długo będziecie się wzbraniać przed przestrzeganiem moich przykazań i moich praw?
Wj 16:29 Patrzcie, PAN dał wam szabat, dlatego w szóstym dniu daje wam chleb na dwa dni. Niech każdy zostanie na swoim miejscu, niech nikt nie wychodzi ze swego miejsca w siódmym dniu.
Wj 16:30 Odpoczywał więc lud siódmego dnia.
Wj 16:31 I dom Izraela nadał temu pokarmowi nazwę manna. Była jak nasienie kolendry, biała, o smaku placków z miodem.
Wj 16:32 Mojżesz powiedział: Tak rozkazał PAN: Napełnij nim omer na przechowanie dla waszych przyszłych pokoleń, aby widziały ten chleb, którym was karmiłem na pustyni, gdy wyprowadziłem was z ziemi Egiptu.
Wj 16:33 Potem Mojżesz powiedział do Aarona: Weź naczynie, wsyp do niego pełen omer manny i postaw je przed PANEM na przechowanie dla waszych przyszłych pokoleń.
Wj 16:34 Jak PAN przykazał Mojżeszowi, tak Aaron postawił je przed Świadectwem na przechowanie.
Wj 16:35 A synowie Izraela jedli mannę przez czterdzieści lat, aż przybyli do ziemi zamieszkałej. Jedli mannę, aż przybyli do granic ziemi Kanaan.
Wj 16:36 A omer to dziesiąta część efy.

CZĘŚĆ I — PUSTYNIA SIN I SZEMRANIE O „GARNCACH MIĘSA” (WJ 16:1–5)
1. Precyzyjna data próby (16:1): Piętnasty dzień drugiego miesiąca po wyjściu z Egiptu — dokładnie miesiąc po Passze kończą się domowe zapasy, a zaczyna szkoła wiary.
2. Geograficzne zawieszenie (16:1b): Pustynia Sin rozciągająca się między Elim a Synajem to strefa całkowitego ogołocenia z ziemskich zabezpieczeń.
3. Zbiorowy bunt wspólnoty (16:2): „Całe zgromadzenie synów Izraela szemrało” — lęk przed brakiem działa jak wysoce zakaźna trucizna niszcząca jedność.
4. Wykoślawiona pamięć niewoli (16:3a): „Gdy siadaliśmy nad garncami mięsa, gdy najadaliśmy się chleba do syta” — człowiek w kryzysie fałszuje przeszłość, zapominając o biczach i ucisku.
5. Oskarżenie o intencjonalną śmierć (16:3b): „Wyprowadziliście nas, by tę rzeszę zamorzyć głodem” — niewiara przypisuje Bożym sługom i samemu Bogu złą wolę.
6. Suwerenna odpowiedź łaski (16:4a): Bóg nie odpowiada gromem gniewu, lecz obietnicą cudu: „Oto spuszczę wam jak deszcz chleb z nieba”.
7. Pedagogika próby posłuszeństwa (16:4b): Codzienne zbieranie manny jest Bożą próbą sprawdzającą, czy człowiek będzie posłuszny Bożemu prawu bez gromadzenia na zapas.
8. Zapowiedź podwójnego daru (16:5): Szóstego dnia Bóg przygotowuje podwójną miarę, zapowiadając wyjątkowość nadchodzącego siódmego dnia.

CZĘŚĆ II — CHWAŁA PANA W OBŁOKU, PRZEPIÓRKI I MANNA (WJ 16:6–15)
9. Wieczorne poznanie i poranny zachwyt (16:6–7a): Wieczór przynosi dowód Bożej interwencji, a poranek odsłania chwałę PANA (hebr. Kabod JAHWE).
10. Sedno szemrania zdemaskowane (16:7b–8): „Wasze szemrania nie są przeciwko nam, ale przeciwko PANU” — bunt przeciw Bożemu powołaniu uderza w samego Boga.
11. Zbliżenie przed oblicze Boże (16:9): Mojżesz nakazuje ludowi stanąć przed PANEM — konfrontacja szemrania z Bożą świętością przynosi opamiętanie.
12. Objawienie w pustynnym obłoku (16:10): Spojrzenie w stronę pustyni odsłania chwałę Boga jaśniejącą w słupie obłoku — Bóg jest obecny na bezdrożach.
13. Wysłuchanie jęku ludu (16:11–12a): Bóg słyszy nawet niedojrzałe, podszyte lękiem szemranie, odpowiadając mięsem o zmierzchu i chlebem o świcie.
14. Wieczorny przelot przepiórek (16:13a): Zgodnie ze słowem Pana obóz zostaje zasypany przez migrujące ptaki, zaspokajając nagłą potrzebę białka.
15. Znikająca rosa i cudowny osad (16:13b–14): O poranku opadająca rosa odsłania na pustyni coś drobnego, okrągłego i łuskowatego, przypominającego szron na ziemi.
16. Pytanie, które stało się imieniem (16:15): „Man hu?” („Co to jest?”) — Mojżesz ogłasza: „To jest chleb, który PAN dał wam do jedzenia”.

CZĘŚĆ III — MIARA OMERA I ROBACZYWIENIE CHCIWOŚCI (WJ 16:16–21)
17. Boży nakaz równej miary (16:16): Omer na głowę według liczby dusz w namiocie — nikt nie ma prawa narzucać głodu słabszym ani zagarniać nadmiaru.
18. Różnorodność zbierania, jedność nasycenia (16:17–18a): Jedni zbierali więcej, drudzy mniej, lecz przy pomiarze omerem nikt nie miał nadmiaru ani braku.
19. Zasada Bożej sprawiedliwości społecznej (16:18b): Cudowna równość manny staje się wzorcem nowotestamentowej solidarności chrześcijańskiej (2 Kor 8:15).
20. Kategoryczny zakaz chomikowania (16:19): „Niech nikt nie pozostawia z tego nic do rana” — wezwanie do całkowitego zaufania na jutrzejszy dzień.
21. Bunt niewiary i zepsucie zapasów (16:20a): Ci, którzy ze strachu zostawili mannę na noc, znaleźli rano cuchnącą masę pełną robaków.
22. Święty gniew Mojżesza (16:20b): Przywódca oburza się na brak zaufania ludu, który woli polegać na spleśniałym zapasie niż na żywym Bogu.
23. Poranny rytm zbierania (16:21a): Mannę należało zbierać wcześnie rano — duchowa lekcja poszukiwania Boga na początku każdego dnia.
24. Rozpływanie się pod wpływem słońca (16:21b): Gdy słońce zaczynało grzać, dar nieba topniał — lekcja nieodwracalności zmarnowanego czasu łaski.

CZĘŚĆ IV — PODWÓJNA PORCJA SZÓSTEGO DNIA I ŚWIĘTY SZABAT (WJ 16:22–30)
25. Cud szóstego dnia (16:22): W piątek na ziemię spada podwójna porcja chleba — dwa omery na osobę — co wprawia w zdumienie przełożonych zgromadzenia.
26. Pierwsze ogłoszenie Szabatu (16:23a): „Jutro będzie odpoczynek, święty szabat dla PANA” — pierwsze uroczyste objawienie Szabatu w historii wędrówki.
27. Przygotowanie posiłków przed szabatem (16:23b): Nakaz pieczenia i gotowania w szóstym dniu, aby dzień siódmy był wolny od uciążliwych prac kuchennych.
28. Cud zachowania bez zepsucia (16:24): Przechowana na Szabat manna nie cuchnie ani nie robaczywieje — Boże błogosławieństwo zawiesza prawa biologicznego rozkładu!
29. Dzień bez manny na polu (16:25–26): W siódmy dzień pole pustyni jest puste — Bóg uczy, że błogosławieństwo spoczynku przewyższa gorączkę pracy.
30. Porażka ludzkiej zachłanności (16:27): Niektórzy mimo zakazu wyszli zbierać w siódmym dniu i wrócili z pustymi rękami — praca wbrew woli Bożej jest daremna.
31. Wyrzut Bożego zasmucenia (16:28): „Jak długo będziecie się wzbraniać przed przestrzeganiem moich przykazań i praw?” — Bóg cierpi nad ludzkim oporem.
32. Radosny spoczynek ludu (16:29–30): „Odpoczywał więc lud siódmego dnia” — Szabat staje się znakiem wolności dzieci Bożych od jarzma niewolniczej pracy.

CZĘŚĆ V — OMER MANNY PRZED ŚWIADECTWEM — WIECZNA PAMIĄTKA WIARY (WJ 16:31–36)
33. Charakterystyka chleba niebios (16:31): Dom Izraela nadaje nazwę manna — ziarno białe jak kolendra, o słodkim smaku placków pieczonych na miodzie.
34. Nakaz wiecznego przechowania (16:32): Pełen omer manny ma zostać odłożony na zawsze, aby przyszłe pokolenia widziały Boże zaopatrzenie na pustkowiu.
35. Złote naczynie Aarona (16:33): Aaron na rozkaz Mojżesza napełnia omerem naczynie i stawia je przed PANEM na wieczną pamiątkę.
36. Przed Arką Świadectwa (16:34): Naczynie z manną spocznie później w Miejscu Najświętszym przed Świadectwem (Hbr 9:4), obok laski Aarona i tablic przymierza.
37. Czterdzieści lat nieustannej wierności (16:35a): Ani jednego dnia nie zabrakło chleba z nieba przez pełne cztery dekady wędrówki przez pustynię.
38. Ustanie manny u granic Kanaanu (16:35b): Pokarm nadprzyrodzony ustępuje miejsca owocom Ziemi Obiecanej w chwili wejścia do Kanaanu (por. Joz 5:12).
39. Precyzja miary Bożej (16:36): Omer to dziesiąta część efy — Bóg dba o szczegółową sprawiedliwość i ład w życiu Swojego ludu.
40. Trwałe dziedzictwo zaufania: Doświadczenie manny staje się fundamentem całej biblijnej teologii opatrzności, prowadzącej wprost do osoby Jezusa Chrystusa.

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 16)
• H4478 — מָן (man / Man hu?): manna — dosłownie „Co to jest?”; pokarm podarowany przez Boga z nieba (Wj 16:15, 31).
• H3899 — לֶחֶם (lechem): chleb — podstawowy pokarm podtrzymujący życie, zapowiadający Chleb Żywy (Wj 16:4, 8, 15).
• H4057 — מִדְבָּר (midbar): pustynia Sin — surowe miejsce próby i ogołocenia z ziemskich złudzeń (Wj 16:1).
• H7676 — שַׁבָּת (szabbat): szabat, zaprzestanie pracy, święty odpoczynek ustanowiony przez Stwórcę (Wj 16:23, 25, 29).
• H7677 — שַׁבָּתוֹן (szabbaton): wielki, uroczysty spoczynek poświęcony wyłącznie Bogu (Wj 16:23).
• H6016 — עֹמֶר (omer): miara objętości (ok. 2,2 litra, 1/10 efy) — sprawiedliwa dzienna porcja łaski na osobę (Wj 16:16, 36).
• H5254 — נָסָה (nasa): doświadczać, badać, wystawiać na próbę wierności i posłuszeństwa prawu (Wj 16:4).
• H3519 — כָּבוֹד (kabod): chwała, majestat PANA ukazujący się w obłoku na pustyni (Wj 16:7, 10).

JEZUS W CENTRUM — EWANGELIA W CIENIU MANNY I SZABATU
1. Jezus jako Prawdziwy Chleb z Nieba (Wj 16:4, 15 a J 6:31–35, 48–51)
W szóstym rozdziale Ewangelii Jana słuchacze Jezusa powołują się na cud manny: „Ojcowie nasi jedli mannę na pustyni... dał im do jedzenia chleb z nieba”. Jezus koryguje ich myślenie: nie Mojżesz dał chleb, lecz Ojciec Niebieski, który teraz daje Prawdziwy Chleb dający życie światu. Jezus ogłasza: „Ja jestem chlebem życia. Kto przychodzi do mnie, nie będzie łaknął, a kto wierzy we mnie, nigdy nie będzie pragnął”. Manna na pustyni podtrzymywała życie doczesne na krótki czas — Chrystus daje życie wieczne.
2. Codzienna zależność — Chleb Powszedni (Wj 16:16–21 a Mt 6:11, 25–34)
Zasada zbierania manny na jeden dzień znajduje swój bezpośredni wyraz w Modlitwie Pańskiej: „Chleba naszego powszedniego daj nam dzisiaj”. Chrystus uczy swoich uczniów, by nie troszczyli się ze strachem o dzień jutrzejszy, bo Ojciec Niebieski wie, czego potrzebują. Próba chomikowania manny kończyła się robactwem i zgnilizną — tak samo próba budowania poczucia bezpieczeństwa na gromadzeniu bogactw zamiast na Bogu prowadzi do duchowego rozkładu.
3. Jezus Panem Świętego Szabatu (Wj 16:22–30 a Mk 2:27–28, Mt 11:28, Hbr 4:9–11)
Zanim pod Synajem wyryto Dekalog na kamiennych tablicach, Bóg objawił dar Szabatu przy mannie. W Jezusie Chrystusie Szabat osiąga swój najgłębszy sens. Jezus ogłasza się Panem Szabatu i wzywa: „Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a Ja wam dam odpoczynek”. List do Hebrajczyków przypomina, że „pozostaje odpoczynek szabatu dla ludu Bożego” — to odpocznienie od własnych uczynków i wejście w dokonaną na krzyżu sprawiedliwość Chrystusa.
4. Ukryta manna w Miejscu Najświętszym (Wj 16:33–34 a Hbr 9:4, Ap 2:17)
Omer manny włożony do złotego naczynia przed Świadectwem w Arce Przymierza był znakiem nieprzemijającego przymierza. W Liście do Kościoła w Pergamie zmartwychwstały Chrystus obiecuje zwycięzcy: „Temu, kto zwycięży, dam jeść z manny ukrytej”. Tą ukrytą manną jest sam uwielbiony Chrystus, którym odkupieni będą radować się w wiecznej wspólnocie Nowego Jeruzalem.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 16:4 → Pwt 8:3: Upokorzenie głodem i nakarmienie manną, aby człowiek poznał, że „nie samym chlebem żyje człowiek, ale każdym słowem, które pochodzi z ust PANA”.
• Wj 16:4 → J 6:32–33: Jezus prostuje: to nie Mojżesz dał chleb z nieba, lecz Ojciec daje Prawdziwy Chleb dający życie światu.
• Wj 16:7 → Iz 40:5: „I objawi się chwała PANA, i ujrzy to wszelkie ciało razem, gdyż usta PANA to powiedziały”.
• Wj 16:8 → Łk 10:16: „Kto was słucha, mnie słucha, a kto wami gardzi, mną gardzi; a kto mną gardzi, gardzi tym, który mnie posłał”.
• Wj 16:15 → Ps 78:24–25: Bóg „spuścił na nich jak deszcz mannę do jedzenia i dał im zboże z nieba. Człowiek jadł chleb anielski”.
• Wj 16:18 → 2 Kor 8:14–15: Apostoł Paweł cytuje zasadę omera jako fundament chrześcijańskiej solidarności i dzielenia się nadmiarem dóbr.
• Wj 16:19–20 → Mt 6:34: „Nie troszczcie się więc o dzień jutrzejszy, gdyż dzień jutrzejszy zatroszczy się o swoje. Dosyć ma dzień swego zła”.
• Wj 16:21 → Prz 8:17: „Ja miłuję tych, którzy mnie miłują, a ci, którzy mnie szukają wcześnie rano, znajdą mnie”.
• Wj 16:23 → Rdz 2:2–3: Bóg odpoczął siódmego dnia po ukończeniu dzieła stworzenia i pobłogosławił go, uświęcając od początku świata.
• Wj 16:29 → Mk 2:27: „Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu”.
• Wj 16:33 → Hbr 9:4: Złote naczynie z manną, laska Aarona, która zakwitła, oraz tablice przymierza złożone wewnątrz Arki.
• Wj 16:35 → Joz 5:12: Manna ustała następnego dnia po spożyciu plonów ziemi Kanaan — cud ustępuje miejsca normalnemu owocowaniu wiary.

PRAWDA NA DZIŚ — 8 ZASAD PRZYMIERZA
1. Próba pustyni obnaża idole serca: Gdy kończą się ludzkie zapasy, ujawnia się prawda o tym, na czym naprawdę opieramy swoje poczucie bezpieczeństwa (Wj 16:1–3).
2. Lęk przed brakiem zniekształca pamięć: Człowiek w kryzysie skłonny jest gloryfikować grzeszną przeszłość, zapominając o ucisku niewoli (Wj 16:3).
3. Bóg odpowiada łaską na szemranie: Zamiast wyroku Bóg daje dar z niebios, ucząc nas Swojej ojcowskiej cierpliwości i miłosierdzia (Wj 16:4).
4. Dzienna miara zaufania: Wiara nie polega na posiadaniu gwarancji na dziesięć lat naprzód, lecz na zaufaniu Bogu o powszednią porcję na dzisiaj (Wj 16:16).
5. Zachłanność obraca się w zgniliznę: Próba zatrzymania Bożych darów wyłącznie dla siebie ze strachu przed jutrem rodzi duchowe robactwo i zepsucie (Wj 16:20).
6. Poranek to czas zbierania Bożej łaski: Kto szuka Boga o świcie, zbiera duchowy pokarm, zanim skwar codziennych obowiązków roztopi siły (Wj 16:21).
7. Szabat to Boża tarcza wolności: Siódmy dzień odpoczynku przypomina, że nie jesteśmy niewolnikami produkcji, lecz synami i córkami Króla (Wj 16:23–30).
8. Pamięć o Bożych cudach chroni przyszłe pokolenia: Zachowaj swój „omer pamięci” — świadectwo Bożego zaopatrzenia, aby Twoje dzieci nie zwątpiły w trudnych chwilach (Wj 16:32).

POMYŚL — PYTANIA DO SERCA
1. Czy w chwilach kryzysu finansowego lub niepewności nie łapiesz się na tęsknocie za dawnymi „garncami mięsa” ze świata (Wj 16:3)?
2. Jak reagujesz, gdy stajesz w obliczu braku — czy Twoją pierwszą reakcją jest szemranie, czy cicha modlitwa zaufania (Wj 16:2, 8)?
3. Czy potrafisz zaufać Bogu o „chleb powszedni na dzisiaj”, czy też paraliżuje Cię paniczny lęk o zabezpieczenie odległej przyszłości (Wj 16:16–20)?
4. W jakich obszarach Twojego życia „manna zachomikowana ze strachu” zamieniła się w zgorzknienie i brak pokoju?
5. O której godzinie i w jaki sposób zaczynasz swój dzień — czy zbierasz duchową mannę Słowa Bożego o świcie, zanim roztopi ją pośpiech (Wj 16:21)?
6. Jak wygląda Twoje przeżywanie Szabatu — czy pozwalasz Bogu zatrzymać Twój bieg i odpocząć w Jego obecności (Wj 16:23–30)?
7. Czy dzielisz się swoim omerem z tymi, którzy w obecnym czasie zebrali mniej i cierpią niedostatek (Wj 16:18; 2 Kor 8:15)?
8. Jaki konkretny cud Bożej opieki z przeszłości warto dziś opowiedzieć swoim dzieciom i bliskim jako żywe świadectwo (Wj 16:32)?

MAŁY QUIZ WIEDZY BIBLIJNEJ — 20 PYTAŃ Z WJ 16:1–36
Pytanie 1: Dokąd przybyło całe zgromadzenie synów Izraela po wyruszeniu z Elim w Wj 16:1?
A. Do oazy pod górą Horeb
B. Na pustynię Sin, leżącą między Elim a Synajem
C. Do ziemi Filistynów nad brzegiem morza
D. Do doliny Jordanu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:1 precyzuje, że Izrael przybył na pustynię Sin, która leży między Elim a Synajem.

Pytanie 2: Kiedy dokładnie Izraelici przybyli na pustynię Sin według Wj 16:1?
A. Pierwszego dnia pierwszego miesiąca
B. Piętnastego dnia drugiego miesiąca po wyjściu z Egiptu
C. Dokładnie w setnym dniu wędrówki
D. W dniu święta Namiotów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:1: „piętnastego dnia drugiego miesiąca po ich wyjściu z ziemi Egiptu”.

Pytanie 3: Przeciwko komu szemrało całe zgromadzenie synów Izraela na pustyni (Wj 16:2)?
A. Przeciwko starcom z pokolenia Judy
B. Przeciwko Mojżeszowi i Aaronowi
C. Przeciwko zwiadowcom wysłanym do Kanaanu
D. Przeciwko lewitom niosącym namiot
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:2: „I całe zgromadzenie synów Izraela szemrało przeciw Mojżeszowi i Aaronowi na pustyni”.

Pytanie 4: Za czym tęsknili zbuntowani Izraelici według Wj 16:3?
A. Za złotymi pałacami Memfis
B. Za egipskimi garncami mięsa i jedzeniem chleba do syta
C. Za rydwanami faraona
D. Za ogrodami palmowymi w Ramses
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:3 cytuje ich słowa: „gdy siadaliśmy nad garncami mięsa, gdy najadaliśmy się chleba do syta!”.

Pytanie 5: Co PAN obiecał spuścić ludowi z nieba w Wj 16:4?
A. Złoty deszcz monet
B. Chleb z nieba jak deszcz
C. Ulewę czystej wody źródlanej
D. Owoce figowe z niebios
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:4: „Oto spuszczę wam jak deszcz chleb z nieba”.

Pytanie 6: W jakim celu Bóg nakazał zbierać mannę codziennie według potrzeby dziennej (Wj 16:4)?
A. Aby zaoszczędzić zapasy na zimę
B. Aby wystawić lud na próbę, czy będzie postępował zgodnie z Jego prawem
C. Aby sprawdzić, kto biega najszybciej po pustyni
D. Aby zmęczyć buntowników pracą fizyczną
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:4: „abym mógł go wystawić na próbę, czy będzie postępował zgodnie z moim prawem, czy nie”.

Pytanie 7: Ile chleba mieli przygotować Izraelici szóstego dnia według Wj 16:5?
A. Tyle samo, co każdego dnia
B. Dwa razy tyle, co zbierają codziennie
C. Trzy razy więcej na cały tydzień
D. Ani grama, bo w szósty dzień obowiązywał ścisły post
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:5 mówi: „będzie tego dwa razy tyle, co zbierają codziennie”.

Pytanie 8: Co Mojżesz i Aaron powiedzieli ludowi o istocie ich szemrania w Wj 16:7–8?
A. Że szemrają słusznie, bo Mojżesz popełnił błąd
B. Że ich szemrania nie są przeciwko nim, ale przeciwko PANU
C. Że to tylko przejściowe zmęczenie upałem
D. Że winni są kupcy midianiccy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:8: „Wasze szemrania nie są przeciwko nam, ale przeciwko PANU”.

Pytanie 9: Gdzie ukazała się chwała PANA, gdy Aaron przemawiał do ludu (Wj 16:10)?
A. W płonącym krzewie na skale
B. W obłoku w stronę pustyni
C. Na szczycie góry Horeb
D. W rzece płynącej ze skały
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:10: „spojrzeli w stronę pustyni, a oto chwała PANA ukazała się w obłoku”.

Pytanie 10: Jakie mięso zleciało się wieczorem i pokryło obóz Izraela (Wj 16:13)?
A. Dzikie kaczki z Nilu
B. Przepiórki
C. Gołębie synajskie
D. Pustynne kuropatwy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:13: „Wieczorem stało się tak, że zleciały się przepiórki i pokryły obóz”.

Pytanie 11: Co ukazało się na powierzchni pustyni o poranku, gdy uniosła się rosa (Wj 16:14)?
A. Dojrzałe kłosy pszenicy
B. Coś bardzo małego, okrągłego, drobnego jak szron na ziemi
C. Gotowe placki jęczmienne
D. Kryształy soli kamiennej
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:14 opisuje: „coś bardzo małego, okrągłego, drobnego jak szron na ziemi”.

Pytanie 12: Co oznacza hebrajskie zawołanie „Man hu?”, od którego powstała nazwa manna (Wj 16:15)?
A. „Chleb Boży”
B. „Co to jest?” (gdyż nie wiedzieli, co to było)
C. „Słodka rosa niebios”
D. „Dar Mojżesza”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:15: „mówili jeden do drugiego: To manna (Man hu?), gdyż nie wiedzieli, co to było”.

Pytanie 13: Jaka była dzienna miara manny wyznaczona na jedną osobę (Wj 16:16)?
A. Jeden kor
B. Jeden omer na osobę
C. Jedna efa
D. Pół miarki mąki
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:16: „omer na osobę, według liczby osób”.

Pytanie 14: Co stało się przy mierzeniu omerem u tych, którzy nazbierali więcej lub mniej (Wj 16:18)?
A. Ci, co mieli więcej, sprzedawali resztę biednym
B. Ten, kto nazbierał więcej, nie miał nadmiaru, a temu, kto mało, nie zabrakło
C. Nadmiar natychmiast zamieniał się w kamień
D. Wszyscy musieli oddać połowę kapłanom
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:18: „ten, kto nazbierał więcej, nie miał nadmiaru, temu zaś, kto nazbierał mało, nie zabrakło”.

Pytanie 15: Co stało się z manną, którą nieposłuszni ludzie zostawili na noc do rana (Wj 16:20)?
A. Wyschła na wiór i stała się twarda
B. Zamieniła się w robaki i cuchnęła
C. Zamieniła się w czyste złoto
D. Została zjedzona przez pustynne lisy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:20: „zostawili niektórzy z tego aż do rana, i zamieniło się w robaki, i cuchnęło”.

Pytanie 16: Co działo się z manną pozostawioną na polu, gdy słońce zaczynało mocno grzać (Wj 16:21)?
A. Twardniała jak skała
B. Topniała
C. Zmieniała kolor na czerwony
D. Unosiła się z wiatrem w chmury
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:21: „A gdy słońce zaczynało grzać, topniało”.

Pytanie 17: Co Mojżesz powiedział przełożonym zgromadzenia o siódmym dniu w Wj 16:23?
A. Że będą musieli maszerować dwa razy szybciej
B. „Jutro będzie odpoczynek, święty szabat dla PANA”
C. Że stoczą wielką bitwę pod Synajem
D. Że nadszedł dzień postu i żałoby
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:23: „Oto co PAN mówił: Jutro będzie odpoczynek, święty szabat dla PANA”.

Pytanie 18: Co stało się z manną zachowaną na siódmy dzień według rozkazu Mojżesza (Wj 16:24)?
A. Zgniła tak samo jak w dni powszednie
B. Nie cuchnęła ani nie było w tym robaków
C. Zamieniła się w wino i oliwę
D. Spłonęła w garnkach
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:24: „nie cuchnęło ani nie było w tym robaków”.

Pytanie 19: Jaki smak i wygląd miała manna według opisu w Wj 16:31?
A. Była gorzka jak piołun i czarna jak węgiel
B. Była jak nasienie kolendry, biała, o smaku placków z miodem
C. Wyglądała jak suszone figi i smakowała jak sól
D. Przypominała oliwki z góry Oliwnej
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:31 podaje: „Była jak nasienie kolendry, biała, o smaku placków z miodem”.

Pytanie 20: Gdzie postawiono naczynie z pełnym omerem manny na wieczną pamiątkę (Wj 16:34)?
A. W namiocie Mojżesza pod jego łożem
B. Przed Świadectwem na przechowanie
C. Zakopano w jaskini pod Synajem
D. Wrzucono w fale Morza Czerwonego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 16:34: „Jak PAN przykazał Mojżeszowi, tak Aaron postawił je przed Świadectwem na przechowanie”.

TWOJA DECYZJA
Porzuć Lęk o Jutro — Wybierz Zaufanie Chrystusowi i Święty Odpoczynek!
Szesnasty rozdział Księgi Wyjścia stawia przed każdym uczniem Jezusa fundamentalne pytanie: w czym pokładasz nadzieję swojego bytu? Czy ulegasz pokusie niewolniczego lęku, wspominając złudne bezpieczeństwo świata, czy wierzysz, że Twój Niebiański Ojciec ześle Ci z niebios codzienną porcję łaski?
Bóg nie powołał Cię do wiecznej szarpaniny i chomikowania ze strachu. On uczy Cię modlitwy o chleb powszedni oraz zaprasza do wejścia w Jego święty odpoczynek. Kto wierzy, że Jezus Chrystus jest Chlebem Żywym, ten przestaje panikować w obliczu pustyni i staje się człowiekiem hojnym, wolnym i pełnym pokoju.
Podejmij dziś osobistą decyzję wiary: powierz Chrystusowi swoje finanse, pracę i przyszłość. Zrezygnuj z narzekania, a zacznij dzień od zbierania Bożego Słowa o poranku!

MODLITWA NA DZIŚ — 15 LISTOPADA 2026
Modlitwa o Chleb Powszedni, Wierność Słowu i Błogosławiony Pokój Szabatu
Święty i Wszechmogący Boże, Ojcze naszego Pana Jezusa Chrystusa!
Z całego serca dziękujemy Ci za cudowne poselstwo szesnastego rozdziału Księgi Wyjścia. Dziękujemy, że jesteś Bogiem, który widzi każdą pustynię naszego życia, słyszy nasze wołanie i nigdy nie pozostawia swoich dzieci bez zaopatrzenia.
Wybacz nam, Panie, każdą chwilę zwątpienia, w której szemraliśmy i z lękiem patrzyliśmy w przyszłość, zapominając o Twoich wielkich dziełach ocalenia. Wybacz nam pokusę chomikowania ze strachu i zaniedbywanie świętego odpoczynku w Twojej obecności.
Panie Jezu Chryste, Ty jesteś Prawdziwym Chlebem z Nieba! Karm nasze dusze Twoim Słowem każdego poranka. Spraw, abyśmy nasyceni Twoją miłością potrafili dzielić się z tymi, którzy mają mniej. Bądź Panem naszego czasu, naszej pracy i naszych myśli. Napełnij nasze domy pokojem Szabatu i prowadź nas bezpiecznie przez pustynię doczesności aż do bram Twojego wiecznego Królestwa. W Twoje Najświętsze Imię modlimy się. Amen!

ZADANIE NA DZIŚ & TWÓJ ZAPIS
1. Przeczytaj osobiście cały szesnasty rozdział Księgi Wyjścia (Wj 16:1–36) w przekładzie UBG.
2. Przeczytaj Ewangelię Jana 6:31–51 i podziękuj Jezusowi za to, że jest Twoim Chlebem Życia.
3. Zbadaj swój poranny plan dnia: zaplanuj 15 minut na czytanie Słowa i modlitwę, zanim zaczniesz przeglądać wiadomości lub obowiązki (Wj 16:21).
4. Przeanalizuj swój tydzień pod kątem odpoczynku: czy nie traktujesz siebie jak niewolnika ciągłej pracy kosztem społeczności z Bogiem i rodziną (Wj 16:23–30)?
5. Wesprzyj dzisiaj lub w nadchodzącym tygodniu osobę w trudnej sytuacji materialnej, wypełniając zasadę Bożej równości (2 Kor 8:15).
6. Zapisz w swoim dzienniku duchowym jedno konkretne doświadczenie Bożej wierności jako Twój „omer pamiątki” (Wj 16:32).
7. Naucz się na pamięć tekstu pamięciowego: Wj 16:4.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 16 LISTOPADA 2026
DZIEŃ 47 — WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM (WJ 17:1–16)
Dzień 47: Kolejna próba pragnienia w Massa i Meriba, uderzona skała dająca żywy strumień w Horebie, zbrojny atak Amaleka pod Refidim oraz wzniesione ręce Mojżesza podtrzymywane przez Aarona i Chura.`;

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

// ── 5. ZAPIS SUROWEJ LEKCJI I PAKIETU 5 WERSJI ──
const scriptsContentDir = path.join(process.cwd(), 'scripts/content');
if (!fs.existsSync(scriptsContentDir)) fs.mkdirSync(scriptsContentDir, { recursive: true });
fs.writeFileSync(path.join(scriptsContentDir, `kc-day${DAY_NUM}-lesson.txt`), lessonDocxText, 'utf8');
fs.writeFileSync(path.join(scriptsContentDir, `pakiet-day${DAY_NUM}-5wersji.md`), pakiet5wersji, 'utf8');
console.log(`✅ Zapisano kc-day${DAY_NUM}-lesson.txt oraz pakiet-day${DAY_NUM}-5wersji.md`);

// ── 6. BUDOWA STRONY LEKCJI HTML ZGODNIE Z WZOREM DNIA 1 (21/21) ──
console.log('🌐 Buduję stronę HTML lekcji Dnia 46 z pełnymi 40 punktami egzegetycznymi...');
const d46HtmlPath = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-46.html');
let html = fs.readFileSync(d46HtmlPath, 'utf8');

// Metadane
html = html.replace(/<title>Dzień 46:[^<]+<\/title>/, `<title>Dzień 46: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 46 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}">`);
html = html.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-46"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-46"`);
html = html.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 46: ${TITLE} (${READING}) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${SUBTITLE}"`);
html = html.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-46"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-46"`);

// Egzegeza 40 punktów analitycznych (5 części po 8 punktów)
const exegesis40Html = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            PUSTYNIA SIN I SZEMRANIE O „GARNCACH MIĘSA” (WJ 16:1–5)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Precyzyjna data próby (16:1):</strong> Piętnasty dzień drugiego miesiąca po wyjściu z Egiptu — dokładnie miesiąc po Passze kończą się domowe zapasy, a zaczyna szkoła wiary.</p>
            <p><strong>2. Geograficzne zawieszenie (16:1b):</strong> Pustynia Sin rozciągająca się między Elim a Synajem to strefa całkowitego ogołocenia z ziemskich zabezpieczeń.</p>
            <p><strong>3. Zbiorowy bunt wspólnoty (16:2):</strong> „Całe zgromadzenie synów Izraela szemrało” — lęk przed brakiem działa jak wysoce zakaźna trucizna niszcząca jedność.</p>
            <p><strong>4. Wykoślawiona pamięć niewoli (16:3a):</strong> „Gdy siadaliśmy nad garncami mięsa, gdy najadaliśmy się chleba do syta” — człowiek w kryzysie fałszuje przeszłość, zapominając o biczach i ucisku.</p>
            <p><strong>5. Oskarżenie o intencjonalną śmierć (16:3b):</strong> „Wyprowadziliście nas, by tę rzeszę zamorzyć głodem” — niewiara przypisuje Bożym sługom i samemu Bogu złą wolę.</p>
            <p><strong>6. Suwerenna odpowiedź łaski (16:4a):</strong> Bóg nie odpowiada gromem gniewu, lecz obietnicą cudu: „Oto spuszczę wam jak deszcz chleb z nieba”.</p>
            <p><strong>7. Pedagogika próby posłuszeństwa (16:4b):</strong> Codzienne zbieranie manny jest Bożą próbą sprawdzającą, czy człowiek będzie posłuszny Bożemu prawu bez gromadzenia na zapas.</p>
            <p><strong>8. Zapowiedź podwójnego daru (16:5):</strong> Szóstego dnia Bóg przygotowuje podwójną miarę, zapowiadając wyjątkowość nadchodzącego siódmego dnia.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            CHWAŁA PANA W OBŁOKU, PRZEPIÓRKI I MANNA (WJ 16:6–15)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>9. Wieczorne poznanie i poranny zachwyt (16:6–7a):</strong> Wieczór przynosi dowód Bożej interwencji, a poranek odsłania chwałę PANA (hebr. Kabod JAHWE).</p>
            <p><strong>10. Sedno szemrania zdemaskowane (16:7b–8):</strong> „Wasze szemrania nie są przeciwko nam, ale przeciwko PANU” — bunt przeciw Bożemu powołaniu uderza w samego Boga.</p>
            <p><strong>11. Zbliżenie przed oblicze Boże (16:9):</strong> Mojżesz nakazuje ludowi stanąć przed PANEM — konfrontacja szemrania z Bożą świętością przynosi opamiętanie.</p>
            <p><strong>12. Objawienie w pustynnym obłoku (16:10):</strong> Spojrzenie w stronę pustyni odsłania chwałę Boga jaśniejącą w słupie obłoku — Bóg jest obecny na bezdrożach.</p>
            <p><strong>13. Wysłuchanie jęku ludu (16:11–12a):</strong> Bóg słyszy nawet niedojrzałe, podszyte lękiem szemranie, odpowiadając mięsem o zmierzchu i chlebem o świcie.</p>
            <p><strong>14. Wieczorny przelot przepiórek (16:13a):</strong> Zgodnie ze słowem Pana obóz zostaje zasypany przez migrujące ptaki, zaspokajając nagłą potrzebę białka.</p>
            <p><strong>15. Znikająca rosa i cudowny osad (16:13b–14):</strong> O poranku opadająca rosa odsłania na pustyni coś drobnego, okrągłego i łuskowatego, przypominającego szron na ziemi.</p>
            <p><strong>16. Pytanie, które stało się imieniem (16:15):</strong> „Man hu?” („Co to jest?”) — Mojżesz ogłasza: „To jest chleb, który PAN dał wam do jedzenia”.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            MIARA OMERA I ROBACZYWIENIE CHCIWOŚCI (WJ 16:16–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Boży nakaz równej miary (16:16):</strong> Omer na głowę według liczby dusz w namiocie — nikt nie ma prawa narzucać głodu słabszym ani zagarniać nadmiaru.</p>
            <p><strong>18. Różnorodność zbierania, jedność nasycenia (16:17–18a):</strong> Jedni zbierali więcej, drudzy mniej, lecz przy pomiarze omerem nikt nie miał nadmiaru ani braku.</p>
            <p><strong>19. Zasada Bożej sprawiedliwości społecznej (16:18b):</strong> Cudowna równość manny staje się wzorcem nowotestamentowej solidarności chrześcijańskiej (2 Kor 8:15).</p>
            <p><strong>20. Kategoryczny zakaz chomikowania (16:19):</strong> „Niech nikt nie pozostawia z tego nic do rana” — wezwanie do całkowitego zaufania na jutrzejszy dzień.</p>
            <p><strong>21. Bunt niewiary i zepsucie zapasów (16:20a):</strong> Ci, którzy ze strachu zostawili mannę na noc, znaleźli rano cuchnącą masę pełną robaków.</p>
            <p><strong>22. Święty gniew Mojżesza (16:20b):</strong> Przywódca oburza się na brak zaufania ludu, który woli polegać na spleśniałym zapasie niż na żywym Bogu.</p>
            <p><strong>23. Poranny rytm zbierania (16:21a):</strong> Mannę należało zbierać wcześnie rano — duchowa lekcja poszukiwania Boga na początku każdego dnia.</p>
            <p><strong>24. Rozpływanie się pod wpływem słońca (16:21b):</strong> Gdy słońce zaczynało grzać, dar nieba topniał — lekcja nieodwracalności zmarnowanego czasu łaski.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            PODWÓJNA PORCJA SZÓSTEGO DNIA I ŚWIĘTY SZABAT (WJ 16:22–30)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>25. Cud szóstego dnia (16:22):</strong> W piątek na ziemię spada podwójna porcja chleba — dwa omery na osobę — co wprawia w zdumienie przełożonych zgromadzenia.</p>
            <p><strong>26. Pierwsze ogłoszenie Szabatu (16:23a):</strong> „Jutro będzie odpoczynek, święty szabat dla PANA” — pierwsze uroczyste objawienie Szabatu w historii wędrówki.</p>
            <p><strong>27. Przygotowanie posiłków przed szabatem (16:23b):</strong> Nakaz pieczenia i gotowania w szóstym dniu, aby dzień siódmy był wolny od uciążliwych prac kuchennych.</p>
            <p><strong>28. Cud zachowania bez zepsucia (16:24):</strong> Przechowana na Szabat manna nie cuchnie ani nie robaczywieje — Boże błogosławieństwo zawiesza prawa biologicznego rozkładu!</p>
            <p><strong>29. Dzień bez manny na polu (16:25–26):</strong> W siódmy dzień pole pustyni jest puste — Bóg uczy, że błogosławieństwo spoczynku przewyższa gorączkę pracy.</p>
            <p><strong>30. Porażka ludzkiej zachłanności (16:27):</strong> Niektórzy mimo zakazu wyszli zbierać w siódmym dniu i wrócili z pustymi rękami — praca wbrew woli Bożej jest daremna.</p>
            <p><strong>31. Wyrzut Bożego zasmucenia (16:28):</strong> „Jak długo będziecie się wzbraniać przed przestrzeganiem moich przykazań i praw?” — Bóg cierpi nad ludzkim oporem.</p>
            <p><strong>32. Radosny spoczynek ludu (16:29–30):</strong> „Odpoczywał więc lud siódmego dnia” — Szabat staje się znakiem wolności dzieci Bożych od jarzma niewolniczej pracy.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            OMER MANNY PRZED ŚWIADECTWEM — WIECZNA PAMIĄTKA WIARY (WJ 16:31–36)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>33. Charakterystyka chleba niebios (16:31):</strong> Dom Izraela nadaje nazwę manna — ziarno białe jak kolendra, o słodkim smaku placków pieczonych na miodzie.</p>
            <p><strong>34. Nakaz wiecznego przechowania (16:32):</strong> Pełen omer manny ma zostać odłożony na zawsze, aby przyszłe pokolenia widziały Boże zaopatrzenie na pustkowiu.</p>
            <p><strong>35. Złote naczynie Aarona (16:33):</strong> Aaron na rozkaz Mojżesza napełnia omerem naczynie i stawia je przed PANEM na wieczną pamiątkę.</p>
            <p><strong>36. Przed Arką Świadectwa (16:34):</strong> Naczynie z manną spocznie później w Miejscu Najświętszym przed Świadectwem (Hbr 9:4), obok laski Aarona i tablic przymierza.</p>
            <p><strong>37. Czterdzieści lat nieustannej wierności (16:35a):</strong> Ani jednego dnia nie zabrakło chleba z nieba przez pełne cztery dekady wędrówki przez pustynię.</p>
            <p><strong>38. Ustanie manny u granic Kanaanu (16:35b):</strong> Pokarm nadprzyrodzony ustępuje miejsca owocom Ziemi Obiecanej w chwili wejścia do Kanaanu (por. Joz 5:12).</p>
            <p><strong>39. Precyzja miary Bożej (16:36):</strong> Omer to dziesiąta część efy — Bóg dba o szczegółową sprawiedliwość i ład w życiu Swojego ludu.</p>
            <p><strong>40. Trwałe dziedzictwo zaufania:</strong> Doświadczenie manny staje się fundamentem całej biblijnej teologii opatrzności, prowadzącej wprost do osoby Jezusa Chrystusa.</p>
          </div>
        </div>`;

// Podmieniamy nagłówek egzegezy na 40 punktów analitycznych
html = html.replace(/<p class="text-xs text-zinc-400">Pięć części studium Wj 16:1–36 \(\d+ punktów analitycznych\)<\/p>/, `<p class="text-xs text-zinc-400">Pięć części studium Wj 16:1–36 (40 punktów analitycznych)</p>`);

// Podmieniamy 5 części egzegezy
html = html.replace(/<!-- CZĘŚĆ I -->[\s\S]*?<!-- CZĘŚĆ V -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, `${exegesis40Html}\n        </div>\n      </section>`);

// Podmieniamy podsumowanie w Zastosowaniu (7 zadań zachowane)
// Zapisujemy Dzień 46 w 8 ścieżkach
const paths46 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-46.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-46/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-46.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-46/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-46/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-46/index.html'
];

for (const p of paths46) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 8 kompletnych kopii HTML Dnia 46 z 40 punktami egzegetycznymi!');

// ── 7. AKTUALIZACJA KOLEJKI PUBLIKACJI I BAZY ROZWAŻAŃ ──
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
  contentSms: 'Dzień 46 (Wj 16:4): „Oto spuszczę wam jak deszcz chleb z nieba”. Bóg troszczy się o Twój każdy dzień. Zaufaj Chrystusowi — Prawdziwemu Chlebowi Życia! polskieradio.cc',
  tvScript: pakiet5wersji.split('WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)')[0].trim(),
  ccnArticle: pakiet5wersji.split('WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1].trim(),
  imageUrl: `/images/academy/daily/kc_day_${DAY_NUM}_manna_z_nieba_chleb_zycia.jpg`,
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
  if (!currentBaza.includes(`Dzień ${DAY_NUM} (15 listopada 2026)`)) {
    fs.appendFileSync(bazaMdPath, '\n\n' + pakiet5wersji, 'utf8');
    console.log('✅ Dopisano pakiet do rozwazania_baza.md');
  }
}

// Bazy JSON
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

console.log('🎉 Kompletne generowanie i synchronizacja lekcji Dnia 46 zakończona sukcesem!');
