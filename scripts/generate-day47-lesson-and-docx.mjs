import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 47: Wj 17:1–16 (16 listopada 2026, Poniedziałek)
const DAY_NUM = 47;
const DATE_STR = '2026-11-16';
const DATE_FORMATTED = 'Poniedziałek, 16 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 17:1–16';
const TITLE = 'WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM — JAHWE NISSI';
const SUBTITLE = 'Pragnienie ludu w Refidim, uderzona laska Mojżesza na Horebie, strumienie żywej wody, bitwa z Amalekiem i ręce podtrzymywane przez Aarona i Chura (Wj 17:1–16)';
const MEMORY_VERSE = '„Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela.” (Wj 17:6, UBG)';
const THEME = 'Siedemnasty rozdział Księgi Wyjścia to dramatyczna i pełna chwały lekcja o Bogu, który gasi pragnienie w najbardziej bezwodnych dolinach życia oraz zapewnia zwycięstwo w duchowej walce. W Refidim lud Boży staje w obliczu braku wody i w rozpaczy kłóci się z Mojżeszem, pytając zuchwale: „Czy PAN jest wśród nas, czy nie?”. Zamiast sądu, Bóg objawia nieskończoną łaskę: staje na skale Horebu, przyjmuje uderzenie laski sądu i wyprowadza obfity strumień wody żywej. Chwilę później na orzeźwiony lud napada bezwzględny Amalek. Gdy Jozue walczy mieczem w dolinie, Mojżesz na szczycie wzgórza wznosi ku niebu ręce z laską Boga, wspierany przez Aarona i Chura. Zwycięstwo rodzi się na kolanach i we wstawienniczej modlitwie, a Mojżesz wznosi ołtarz „PAN moim Sztandarem” — Jahwe Nissi! W Nowym Testamencie apostoł Paweł wyjaśnia bez cienia wątpliwości: „tą skałą był Chrystus” (1 Kor 10:4). Jezus został uderzony na krzyżu za nasze winy, by z Jego przebitego boku wytrysnęły dla nas strumienie Ducha Świętego i wody życia na wieki!';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 47 (Wj 17:1–16)...');

// ── 1. CZYTANIE DNIA (UBG) ──
const exo17Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-017.json');
const exo17Data = JSON.parse(fs.readFileSync(exo17Path, 'utf8'));

const readingVerses = exo17Data.verses.map(v => ({ ref: `Wj 17:${v.number}`, num: v.number, text: v.text }));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 17:1–7 — Pragnienie w Refidim, woda ze skały na Horebie oraz Massa i Meriba</h3></div>',
  ...exo17Data.verses.filter(v => v.number <= 7).map(v => `<p><span class="verse-num">17:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 17:8–16 — Atak Amaleka, wzniesione ręce Mojżesza, podpora Aarona i Chura oraz ołtarz Jahwe Nissi</h3></div>',
  ...exo17Data.verses.filter(v => v.number >= 8).map(v => `<p><span class="verse-num">17:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 47 (16 listopada 2026): Woda ze Skały w Horebie i Zwycięstwo nad Amalekiem — Jahwe Nissi (Wj 17:1–16)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Siódmy

Czy znalazłeś się kiedyś w miejscu, gdzie po ludzku skończyły się wszystkie źródła ratunku, a suchość i pragnienie zaczęły odbierać Ci siły do dalszej drogi?

Zatrzymaj się w ten poniedziałkowy poranek, szesnastego listopada dwa tysiące dwudziestego szóstego roku. Weź głęboki oddech i uświadom sobie, że Bóg, który przeprowadził Cię przez wczorajszy dzień, jest przy Tobie również dzisiaj. W ciszy modlitwy zapytaj swoje serce: czy wierzę, że Pan potrafi wyprowadzić żywy strumień nawet z najtwardszej skały?

W siedemnastym rozdziale Księgi Wyjścia lud Boży dociera do miejsca o nazwie Refidim. Choć sama nazwa oznaczała odpoczynek, w obozie zabrakło wody. Zamiast wołać z wiarą do Pana, zdesperowani ludzie zaczynają kłócić się z Mojżeszem i stawiają bolesne pytanie: Czy Pan jest wśród nas, czy nie? Jak odpowiada Bóg na ten krzyk zniecierpliwienia? Pan mówi do Mojżesza: Wyjdź przed lud, weź swoją laskę i uderz w skałę na Horebie! Bóg sam staje na skale przed swoim sługą. Gdy Mojżesz uderza laską sądu, lita skała pęka, a z jej wnętrza wytryska obfita, orzeźwiająca rzeka wody żywej, gasząca pragnienie setek tysięcy wędrowców!

Ale to nie koniec zmagań. W chwilę po ugaszeniu pragnienia na tyły zmęczonego ludu napadają wojownicy Amaleka. Mojżesz wysyła do walki młodego Jozuego, a sam wchodzi na szczyt wzgórza z laską Boga w dłoni. Rozpoczyna się duchowa tajemnica zwycięstwa: dopóki ręce Mojżesza są wzniesione w modlitwie ku niebu, Izrael odnosi sukces. Gdy ręce opadają ze zmęczenia, przewagę zyskuje wróg. Wtedy z pomocą przychodzą Aaron i Chur — podkładają pod Mojżesza kamień i podtrzymują jego ręce z obu stron aż do zachodu słońca! Bitwa zostaje wygrana na kolanach i we wspólnocie, a Mojżesz buduje ołtarz wdzięczności i ogłasza: Pan moim Sztandarem!

Nowy Testament odsłania przed nami pełnię tego cudu. Apostoł Paweł pisze wprost: tą duchową skałą był Chrystus! Nasz Zbawiciel został uderzony na krzyżu za nasze winy, a z Jego przebitego boku wypłynęła krew i woda — źródło Ducha Świętego i przebaczenia. Co więcej, Chrystus jest naszym wiecznym Orędownikiem, którego ręce nigdy nie opadają! Nie musisz toczyć swoich bitew o własnych siłach. Przyjdź dziś do Chrystusa, napij się wody żywej i stań do walki pod Jego niezawodnym sztandarem zwycięstwa!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 47 (16 listopada 2026 r.)
📖 Księga Wyjścia 17:1–16: Woda ze Skały w Horebie i Zwycięstwo nad Amalekiem — Jahwe Nissi

Czy potrafisz rozpoznać Bożą obecność w bezwodnej dolinie i toczyć duchowe walki na kolanach?

W 47. dniu formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) wkraczamy z Izraelem do Refidim pod górą Horeb (Wj 17:1–16: https://polskieradio.cc/mojabiblia?ref=Wj17:1-16).

Kluczowe filary dzisiejszego studium:
1. Pragnienie w Refidim i Massa-Meriba (Wj 17:1–7): W miejscu oznaczającym „odpoczynek” brakuje wody. Lud spiera się z Mojżeszem i zadaje dramatyczne pytanie niewiary: „Czy PAN jest wśród nas, czy nie?”.
2. Uderzona Skała na Horebie (Wj 17:5–6): Bóg staje na skale przed Mojżeszem. Cios laski sądu rozłupuje granit, wyprowadzając potoki żywej wody. Apostoł Paweł objawia: „a tą skałą był Chrystus” (1 Kor 10:4).
3. Atak Amaleka i dwa plany walki (Wj 17:8–10): Odwieczny wróg atakuje z ukrycia. Jozue walczy mieczem w dolinie, a Mojżesz oręduje z laską Boga na szczycie wzgórza.
4. Podtrzymane ręce i braterska wspólnota (Wj 17:11–13): Gdy ręce Mojżesza słabną, Aaron i Chur sadzają go na kamieniu i podtrzymują jego dłonie aż do zmierzchu. Zwycięstwo w dolinie rodzi się z wierności orędowniczej na wzgórzu!
5. Ołtarz JAHWE NISSI (Wj 17:14–16): Bóg nakazuje spisać to wydarzenie na pamiątkę w księdze, a Mojżesz wznosi ołtarz „PAN moim Sztandarem”. Pod sztandarem Krzyża jesteśmy więcej niż zwycięzcami (Rz 8:37).

Studiuj pełny tekst, kody Stronga i komentarz werset po wersecie:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-47

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 47 (Wj 17:6): „Oto stanę przed tobą na skale... i wypłynie z niej woda”. Twoją Skałą jest Chrystus. Zwyciężaj pod sztandarem Jahwe Nissi! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, ciepłe studio Christian Culture TV w kolorystyce ciemnego szafiru i szlachetnego złota Champagne Gold (#C4A35A). Na wielkoformatowym ekranie w tle grafika 16:9: potężna granitowa skała Horebu, z której pęknięcia wytryska rwący, krystalicznie czysty strumień wody gaszący pragnienie wędrowców, a w tle na grani wzgórza sylwetka Mojżesza z wzniesionymi ku niebu rękami podtrzymywanymi przez Aarona i Chura. Tytuł audycji: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 47: WODA ZE SKAŁY I ZWYCIĘSTWO NAD AMALEKIEM”.

[INTRO: PARADOKS BEZWODNEJ DOLINY]
Noemi: Dzień dobry! Witamy bardzo serdecznie w czterdziestym siódmym dniu naszej wspólnej podróży przez sześćdziesiąt sześć ksiąg Pisma Świętego! Dzisiejszy rozdział Księgi Wyjścia prowadzi nas do miejsca o nazwie Refidim. Po hebrajsku ta nazwa brzmi zachęcająco — oznacza „miejsce odpoczynku” i „orzeźwienia”. A jednak to właśnie tam Izrael staje twarzą w twarz z przerażającym brakiem wody!
Sara: Witaj, Noemi, witamy wszystkich naszych widzów i słuchaczy! To niezwykle głęboka prawda życiowa. Czasami wkraczamy w sytuacje, które miały być oazą spokoju, a okazują się duchową i materialną pustynią. I wtedy z ludzkich serc wyrywa się krzyk: „Mojżeszu, po co wyprowadziłeś nas z Egiptu, by zamorzyć nas pragnieniem?”. A w wersecie siódmym pada najbardziej bolesne pytanie: „Czy Pan jest wśród nas, czy nie?”.
Noemi: Wyobraźmy sobie to pytanie! Przecież zaledwie wczoraj rozważaliśmy deszcz manny spadający z niebios i słup obłoku, który stał pośrodku obozu! A jednak suchość w gardle sprawiła, że ludzie zakwestionowali samą obecność Boga. Zobaczmy jednak, jak wspaniały jest nasz Bóg. Zamiast gniewu i kary, Bóg mówi do Mojżesza: „Weź laskę, którą uderzyłeś w rzekę Nil, idź na Horeb... Oto Ja stanę przed tobą na skale!”.

[ANALIZA EGZEGETYCZNA: UDERZENIE W SKAŁĘ I CHRYSTUS]
Sara: To jeden z najbardziej wstrząsających momentów w całym Starym Testamencie! Bóg staje na skale na Horebie. Laska Mojżesza była laską sądu — to nią uderzono w Nil, zamieniając wodę w krew, to nią rozdzielono Morze Czerwone. Gdy Mojżesz uderza w skałę, na której spoczęła Boża obecność, z granitu wytryska rzeka!
Noemi: Apostoł Paweł w pierwszym Liście do Koryntian w rozdziale dziesiątym, wersecie czwartym, zdejmuje wszelką zasłonę z tej tajemnicy: „Pili bowiem z duchowej skały, która szła za nimi, a tą skałą był Chrystus!”. To Jezus wziął na Siebie cios Bożego sprawiedliwego sądu na krzyżu Golgoty. Z Jego przebitego boku wypłynęła krew i woda, by każdy, kto wierzy, został na wieki napojony Duchem Świętym!

[BITWA POD REFIDIM: DWA PLANY WALKI I BRATERSKIE WSPARCIE]
Sara: Ale ten rozdział ma jeszcze drugą, równie fascynującą część. Gdy tylko lud ugasił pragnienie, spada na nich zbrojny atak Amaleka. I tu po raz pierwszy na kartach Biblii pojawia się młody dowódca — Jozue! Mojżesz posyła go na pole bitwy w dolinie, a sam wchodzi na szczyt wzgórza z laską Boga w dłoni.
Noemi: I odkrywamy Bożą zasadę zwycięstwa: dopóki Mojżesz trzyma ręce wzniesione ku niebu w modlitwie, Izrael zwycięża. Gdy jego ramiona opadają, przewagę zyskuje Amalek. Ręce Mojżesza stają się ociężałe — żaden człowiek, nawet największy prorok, nie jest ze stali! I wtedy wkraczają Aaron i Chur. Sadzają Mojżesza na kamieniu i podtrzymują jego dłonie aż do zachodu słońca!
Sara: Jakie to wspaniałe przesłanie dla naszych wspólnot, rodzin i misji! Nie wygramy duchowej walki w pojedynkę. Każdy z nas potrzebuje braci i sióstr, którzy w chwilach słabości podtrzymają nasze ręce w modlitwie. Zwycięstwo Jozuego w dolinie zostało wywalczone na szczycie góry!
Noemi: A na koniec Mojżesz buduje ołtarz i nadaje mu imię JAHWE NISSI — Pan moim Sztandarem! Pod Jego sztandarem żadna ciemność ani żaden przeciwnik nie ma ostatniego słowa. Pomódlmy się razem o to zwycięstwo!

[MODLITWA KOŃCOWA]
Sara: Panie Jezu Chryste, nasza Żywa Skało! Dziękujemy Ci, że dałeś się uderzyć za nasze grzechy, abyśmy mogli pić ze strumieni Twojej łaski. Gdy w naszym życiu pojawia się bezwodna pustynia i gdy atakują nas wątpliwości, przypomnij nam, że Ty jesteś pośród nas.
Noemi: Podtrzymaj nasze opadające ręce, Panie. Poślij do naszego życia wiernych przyjaciół, takich jak Aaron i Chur, i uczyń nas wsparciem dla innych. Wznosimy dziś Twój Krzyż jako nasz jedyny sztandar — Jahwe Nissi! Bądź uwielbiony w każdym kroku naszego dzisiejszego dnia. Amen!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: WODA ZE SKAŁY NA HOREBIE, WALKA Z AMALEKIEM I OŁTARZ JAHWE NISSI: EGZEGEZA WJ 17:1–16
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 16 listopada 2026 r.

Siedemnasty rozdział Księgi Wyjścia (Wj 17:1–16) stanowi jeden z najbardziej newralgicznych węzłów teologicznych i typologicznych w całym Pięcioksięgu Mojżeszowym. Łączy w jednej zwartej narracji dwa fundamentalne motywy: nadprzyrodzone zaspokojenie egzystencjalnego pragnienia ludu poprzez cud wyprowadzenia wody z granitu na Horebie oraz pierwszą w dziejach Izraela po wyjściu z Egiptu otwartą wojnę obronną, stoczoną z koczowniczym plemieniem Amalekitów pod Refidim.

1. Kryzys w Refidim i semantyka Massa-Meriba (Wj 17:1–7)
Trasa marszu Izraela prowadzi z pustyni Sin etapami („według rozkazu PANA”) do Refidim (hebr. רְפִידִים — dosł. „miejsca odpoczynku” lub „posiłku”). Paradoks toponimu jest uderzający: miejsce obiecujące spoczynek okazuje się obszarem całkowitego braku wody (Wj 17:1). Reakcja ludu odsłania głęboki deficyt zaufania: zamiast błagalnej modlitwy następuje gwałtowny spór prawny z Mojżeszem (hebr. czasownik *riv* — formalne wytoczenie procesu sądowego). Mojżesz natychmiast demaskuje rzeczywistego adresata buntu: „Czemu wystawiacie PANA na próbę?” (Wj 17:2).
Punktem kulminacyjnym niewiary staje się zuchwałe pytanie utrwalone w nazwie Massa (hebr. מַסָּה — „kuszenie / próba”): „Czy PAN jest wśród nas, czy nie?” (Wj 17:7). Pytanie to, zadane w obecności unoszącego się nad obozem słupa obłoku i pośród codziennego cudu manny, staje się w tradycji biblijnej klasycznym paradygmatem zatwardziałości serca (Ps 95:8–9; Hbr 3:7–9).

2. Teofania na Horebie i chrystologiczna typologia Skały (Wj 17:5–6; 1 Kor 10:4)
Odpowiedź Boga na oskarżenia ludu stanowi triumf czystej łaski nad zasłużonym sądem. Mojżesz ma wziąć laskę, którą uderzył w Nil — narzędzie Bożego sądu nad bałwochwalstwem Egiptu — oraz starszych jako oficjalnych świadków przymierza. Bóg składa zdumiewającą deklarację: „Oto stanę przed tobą tam, na skale na Horebie” (Wj 17:6). W kulturze Bliskiego Wschodu pozycja stojącego przed oskarżycielem była pozycją oskarżonego przed trybunałem. Bóg w obłoku chwały staje na skale, a cios laski sądu spada na skałę, uwalniając potężny strumień krystalicznej wody (hebr. צוּר — *Cur*).
Apostoł Paweł w natchnieniu Ducha Świętego podaje ostateczny klucz hermeneutyczny do tego wydarzenia: „pili bowiem z duchowej skały, która szła za nimi, a tą skałą był Chrystus” (1 Kor 10:4). Skała uderzona laską sądu to prefiguracja Chrystusa uderzonego i zranionego na krzyżu za nasze grzechy (Iz 53:4–5). Wypływająca woda znajduje swoje wypełnienie w krwi i wodzie wypływających z przebitego boku Ukrzyżowanego (J 19:34) oraz w darze Ducha Świętego, obiecanym każdemu spragnionemu (J 7:37–39).

3. Wojna z Amalekiem i teologia wstawiennictwa (Wj 17:8–13)
Zaledwie lud ugasił pragnienie, w Refidim pojawia się Amalek — koczownicy wywodzący się od wnuka Ezawa (Rdz 36:12). Księga Powtórzonego Prawa dopowiada istotny szczegół moralny: Amalekici dopuścili się bezwzględnego, tchórzliwego ataku na tyły kolumny marszowej, wybijając zmęczonych, chorych i opóźnionych wędrowców, „nie bojąc się Boga” (Pwt 25:17–19).
Mojżesz po raz pierwszy w kanonie Pisma powołuje Jozuego (hebr. יְהוֹשֻׁעַ — *Jehoszua*, „PAN jest zbawieniem”) do dowodzenia zbrojnego w dolinie, podczas gdy sam udaje się na szczyt wzgórza z laską Boga. Struktura zwycięstwa ukazuje nierozerwalną synergię zaangażowania w dolinie i orędownictwa na wzgórzu (Wj 17:11). Gdy ręce Mojżesza słabną pod wpływem ludzkiej ułomności, Aaron (reprezentujący kapłaństwo) i Chur (reprezentujący starszyznę plemienną) sadzają Mojżesza na kamieniu i podtrzymują jego dłonie wzniesione ku niebu aż do zachodu słońca. To bezcenny wzorzec eklezjalny: wierność wstawiennicza wspólnoty warunkuje triumf nad siłami ciemności.

4. Pamięć w księdze i ołtarz JAHWE NISSI (Wj 17:14–16)
Wj 17:14 zawiera pierwszą w Biblii wzmiankę o spisywaniu słów Bożych do zwoju: „Zapisz to na pamiątkę w księdze i powtórz do uszu Jozuego”. Pamięć o zbawczych interwencjach Boga staje się fundamentem kanonu natchnionego. Zwieńczeniem wydarzeń jest budowa ołtarza nazwanego JAHWE NISSI (hebr. יְהוָה נִסִּי — „PAN moją chorągwią / sztandarem”). Sztandar (*nes*) był w starożytności widocznym z daleka punktem zbiórki i znakiem tożsamości wojska. Dla ludu Bożego jedynym i niezawodnym sztandarem jest sam PAN objawiony w Chrystusie Ukrzyżowanym i Zmartwychwstałym (Iz 11:10; J 12:32).

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI ZGODNIE Z WYTYCZNYMI GPT) ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 47
WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM — JAHWE NISSI
Pragnienie ludu w Refidim, uderzona laska Mojżesza na Horebie, strumienie żywej wody, bitwa z Amalekiem i ręce podtrzymywane przez Aarona i Chura (Wj 17:1–16)
Poniedziałek, 16 listopada 2026 r.  |  Czytanie: Wj 17:1–16
TEKST PAMIĘCIOWY: „Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela.” (Wj 17:6, UBG)
MYŚL PRZEWODNIA: Siedemnasty rozdział Księgi Wyjścia to dramatyczna i pełna chwały lekcja o Bogu, który gasi pragnienie w najbardziej bezwodnych dolinach życia oraz zapewnia zwycięstwo w duchowej walce. W Refidim lud Boży staje w obliczu braku wody i w rozpaczy kłóci się z Mojżeszem, pytając zuchwale: „Czy PAN jest wśród nas, czy nie?”. Zamiast sądu, Bóg objawia nieskończoną łaskę: staje na skale Horebu, przyjmuje uderzenie laski sądu i wyprowadza obfity strumień wody żywej. Chwilę później na orzeźwiony lud napada bezwzględny Amalek. Gdy Jozue walczy mieczem w dolinie, Mojżesz na szczycie wzgórza wznosi ku niebu ręce z laską Boga, wspierany przez Aarona i Chura. Zwycięstwo rodzi się na kolanach i we wstawienniczej modlitwie, a Mojżesz wznosi ołtarz „PAN moim Sztandarem” — Jahwe Nissi! W Nowym Testamencie apostoł Paweł wyjaśnia bez cienia wątpliwości: „tą skałą był Chrystus” (1 Kor 10:4). Jezus został uderzony na krzyżu za nasze winy, by z Jego przebitego boku wytrysnęły dla nas strumienie Ducha Świętego i wody życia na wieki!

ZANIM OTWORZYSZ BIBLIĘ
Siedemnasty rozdział Księgi Wyjścia wprowadza nas w kolejny, niezwykle wymagający etap wędrówki przez pustynię. Po doświadczeniu słodkiej wody w Mara i obfitości dwunastu źródeł w Elim, a także po cudzie porannej manny na pustyni Sin, Izrael wkracza w skalisty rejon Refidim u stóp masywu Horebu.
W tym suchym, spalonym słońcem krajobrazie dochodzi do ponownego zderzenia ludzkiej bezradności z potęgą Bożej opatrzności. Brak wody wywołuje w obozie gwałtowną panikę i agresywny spór z Mojżeszem. Jednak Bóg odpowiada cudem, który na zawsze wejdzie do kanonu biblijnej teologii zbawienia — uderzeniem w granitową skałę, z której wypływa rzeka orzeźwienia. Zaraz potem lud musi stanąć do swojej pierwszej otwartej bitwy z podstępnym Amalekiem, ucząc się, że zwycięstwa militarne i duchowe wykuwają się nie tylko siłą oręża, lecz przede wszystkim wiernością wzniesionych rąk w modlitwie. Otwórzmy ten rozdział z wiarą, prosząc Ducha Świętego o orzeźwienie ze Skały, którą jest Chrystus, oraz o moc do walki pod Jego zwycięskim sztandarem!

TEKST PISMA ŚWIĘTEGO — CZYTANIE DNIA (WJ 17:1–16, UBG)
Wj 17:1 Całe zgromadzenie synów Izraela wyruszyło z pustyni Sin, robiąc postoje, według rozkazu PANA, i rozbili obóz w Refidim, gdzie nie było wody, aby lud mógł się napić.
Wj 17:2 Dlatego lud spierał się z Mojżeszem, mówiąc: Dajcie nam wody, abyśmy się napili. Mojżesz odpowiedział im: Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?
Wj 17:3 Lud zaś pragnął tam wody i szemrał przeciwko Mojżeszowi, mówiąc: Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?
Wj 17:4 Wtedy Mojżesz zawołał do PANA: Cóż mam uczynić z tym ludem? Jeszcze trochę, a mnie ukamienują.
Wj 17:5 I PAN powiedział do Mojżesza: Idź przed ludem i weź ze sobą niektórych ze starszych Izraela. Weź także w rękę swoją laskę, którą uderzyłeś w rzekę, i idź.
Wj 17:6 Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela.
Wj 17:7 I nadał temu miejscu nazwę Massa i Meriba z powodu kłótni synów Izraela i dlatego, że wystawili na próbę PANA, mówiąc: Czy PAN jest wśród nas, czy nie?
Wj 17:8 Tymczasem Amalek nadciągnął, aby walczyć z Izraelem w Refidim.
Wj 17:9 I Mojżesz powiedział do Jozuego: Wybierz nam mężczyzn, wyrusz i stocz bitwę z Amalekiem. Ja zaś jutro stanę na szczycie wzgórza z laską Boga w ręku.
Wj 17:10 Jozue uczynił więc, jak mu Mojżesz rozkazał, i stoczył bitwę z Amalekiem. A Mojżesz, Aaron i Chur weszli na szczyt wzgórza.
Wj 17:11 Gdy Mojżesz podnosił rękę, przeważał Izrael, a gdy opuszczał rękę, przeważał Amalek.
Wj 17:12 Ale ręce Mojżesza były ociężałe. Wzięli więc kamień i podłożyli pod niego, i usiadł na nim. A Aaron i Chur podpierali jego ręce, jeden z jednej, drugi z drugiej strony. I jego ręce były stale podniesione aż do zachodu słońca.
Wj 17:13 Jozue rozgromił więc Amaleka i jego lud ostrzem miecza.
Wj 17:14 Wtedy PAN powiedział do Mojżesza: Zapisz to na pamiątkę w księdze i powtórz do uszu Jozuego, że wymażę zupełnie pamięć o Amaleku pod niebem.
Wj 17:15 Potem Mojżesz zbudował ołtarz i nadał mu nazwę: PAN moją chorągwią;
Wj 17:16 Bo powiedział: Ręka tronu PANA i wojna PANA będzie przeciwko Amalekowi z pokolenia na pokolenie.

ANALIZA EGZEGETYCZNA WERSET PO WERSECIE (40 PUNKTÓW W 5 CZĘŚCIACH)

CZĘŚĆ I — WĘDRÓWKA Z PUSTYNI SIN DO REFIDIM I BUNT PRAGNIENIA (WJ 17:1–3)
1. Wędrówka etapami według rozkazu PANA (17:1a): Izrael posuwa się naprzód ściśle według Bożych wskazówek („robiąc postoje według rozkazu PANA”) — trudne próby życiowe nie wynikają z błądzenia poza wolą Bożą, lecz są integralnym elementem Bożej szkoły wiary.
2. Obozowisko w Refidim (17:1b): Nazwa Refidim oznacza dosłownie „miejsca odpoczynku” lub „orzeźwienia”, lecz w tym miejscu paradoksalnie brakuje wody — Boży odpoczynek nie zależy od ziemskich wygód, lecz od Bożej obecności.
3. Fizyczna udręka bezwodnej pustyni (17:1c): Brak wody pod palącym słońcem Synaju bezpośrednio zagraża życiu setek tysięcy wędrowców, dzieci oraz ich stad.
4. Spór z Mojżeszem zamiast modlitwy do Boga (17:2a): Zgromadzenie zamiast paść na twarz przed Bogiem, który dał mannę i rozdzielił morze, agresywnie żąda od przywódcy: „Dajcie nam wody, abyśmy się napili!”.
5. Demaskacja duchowej istoty kłótni (17:2b): Mojżesz obnaża źródło ataku: „Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?” — pretensje do sługi Bożego są w rzeczywistości buntem przeciwko samemu Bogu.
6. Pragnienie rodzące ślepotę i zgorzknienie (17:3a): Cielesna potrzeba zaślepia duchowy wzrok; ludzie całkowicie zapominają o wczorajszym cudzie chleba z nieba.
7. Oszczercze oskarżenie o intencjonalną zagładę (17:3b): „Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?” — niewiara wmawia Bogu okrucieństwo i złą wolę.
8. Psychologiczna pułapka idealizowania niewoli (17:3c): Pragnienie wywołuje iluzję, że egipska niewola była lepsza od Bożej wolności, ukazując jak łatwo człowiek w kryzysie rezygnuje z Bożego powołania.

CZĘŚĆ II — KRZYK PRZYWÓDCY, LASKA SĄDU I UDERZONA SKAŁA NA HOREBIE (WJ 17:4–6)
9. Dramatyczna modlitwa Mojżesza (17:4a): Mojżesz nie odpowiada agresją na agresję, lecz woła do PANA: „Cóż mam uczynić z tym ludem?” — doskonały wzór przywódcy przynoszącego kryzys bezpośrednio przed tron Boży.
10. Zagrożenie samosądem i linczem (17:4b): „Jeszcze trochę, a mnie ukamienują” — desperacja ludu osiąga punkt krytyczny, bezpośrednio zagrażając życiu sługi Bożego.
11. Rozkaz marszu na oczach starszych (17:5a): Bóg nakazuje Mojżeszowi wyjść przed lud i zabrać ze sobą starszych Izraela jako urzędowych i wiarygodnych świadków nadchodzącego cudu.
12. Laska Bożego sądu (17:5b): „Weź także w rękę swoją laskę, którą uderzyłeś w rzekę, i idź” — laska, która sprowadziła sądy na Nil i rozdzieliła morze, ma posłużyć do ocalenia ludu.
13. Wstrząsająca teofania na skale (17:6a): „Oto stanę przed tobą tam, na skale na Horebie” — Niewidzialny Bóg w obłoku chwały staje na szczycie skały, stawiając Siebie w miejscu gotowości na przyjęcie ciosu!
14. Uderzenie w litą skałę (17:6b): Mojżesz na rozkaz Boży wymierza cios laską sądu w granitowy masyw — gest po ludzku absurdalny, stający się demonstracją Bożej wszechmocy.
15. Wypłynięcie obfitego strumienia wody (17:6c): Z rozłupanego granitu wytryska potężna rzeka krystalicznej, żywej wody, gasząca pragnienie całego obozu (Ps 78:15–16; Ps 105:41).
16. Publiczne świadectwo na Horebie (17:6d): „I Mojżesz uczynił tak na oczach starszych Izraela” — cud staje się jawnym, niepodważalnym faktem historycznym.

CZĘŚĆ III — MASSA I MERIBA — TRAGICZNE PYTANIE: „CZY PAN JEST WŚRÓD NAS?” (WJ 17:7)
17. Nadanie wiecznych nazw ostrzegawczych (17:7a): Mojżesz nazywa to miejsce Massa („próba / kuszenie”) i Meriba („kłótnia / spór”), utrwalając w pamięci pokoleń przestrogę przed powątpiewaniem w Boga.
18. Grzech kuszenia Boga (17:7b): Hebrajskie słowo massa oznacza domaganie się od Boga cudów na ludzkich warunkach jako warunku dalszego posłuszeństwa.
19. Zgorszenie kłótni we wspólnocie (17:7c): Meriba demaskuje destrukcyjną siłę podziału i oskarżeń niszczących Bożą jedność w chwili kryzysu.
20. Najbardziej tragiczne pytanie wędrówki (17:7d): „Czy PAN jest wśród nas, czy nie?” — słowa wypowiedziane pośród widzialnego słupa obłoku i codziennej manny na pustyni!
21. Zaślepienie na znaki obecności (17:7e): Lud patrzył na suchy piasek zamiast na obłok Bożej chwały, pozwalając okolicznościom zdefiniować wiarę.
22. Uniwersalna przestroga biblijna (17:7f): Psalm 95 oraz List do Hebrajczyków (Hbr 3:7–15) czynią z Massa i Meriba centralny symbol zatwardziałości serca, zamykającej wejście do Bożego odpoczynku.
23. Niewyczerpana Boża cierpliwość (17:7g): Mimo obraźliwego pytania ludu, Bóg nie zsyła ognia ani zarazy, lecz obdarowuje ich orzeźwiającym strumieniem łaski.
24. Skała pomnikiem pokory (17:7h): Refidim uczy, że Boże zaopatrzenie płynie nie z zasług człowieka, lecz z suwerennej, przebaczającej miłości Stwórcy.

CZĘŚĆ IV — ZBROJNY ATAK AMALEKA I WALKA NA DWÓCH PLANACH POD REFIDIM (WJ 17:8–13)
25. Niespodziewany atak odwiecznego wroga (17:8): Gdy tylko lud gasi pragnienie, nadciąga Amalek — koczowniczy potomkowie Ezawa, archetyp podstępnego ataku sił ciemności na słabych i zmęczonych (Pwt 25:17–19).
26. Pierwsze pojawienie się Jozuego (17:9a): Wj 17:9 po raz pierwszy na kartach Biblii wprowadza postać Jozuego (hebr. Jehoszua — „PAN jest zbawieniem”) jako wyznaczonego dowódcy wojskowego.
27. Boży podział ról w walce (17:9b): Mojżesz rozkazuje: „Wybierz nam mężczyzn, wyrusz i stocz bitwę z Amalekiem. Ja zaś jutro stanę na szczycie wzgórza z laską Boga w ręku”.
28. Dwa wymiary zwycięstwa — dolina i wzgórze (17:10): Walka toczy się równolegle na dwóch planach: fizycznego wysiłku miecza na nizinie oraz duchowego orędownictwa na szczycie wzniesienia.
29. Tajemnica wzniesionych rąk (17:11): Gdy ręce Mojżesza są wzniesione w modlitwie, zwycięża Izrael; gdy opadają ze zmęczenia, przeważa Amalek — duchowa łączność z niebem decyduje o losach bitwy.
30. Ludzka słabość przywódcy (17:12a): „Ale ręce Mojżesza były ociężałe” — nawet najwięksi mocarze wiary ulegają wyczerpaniu i nie są w stanie trwać w samotności.
31. Niezbędna rola Aarona i Chura (17:12b): Podkładają pod Mojżesza kamień, a sami stają po bokach i podtrzymują jego ręce aż do zachodu słońca — potężny obraz braterskiej wspólnoty i wzajemnego wsparcia w modlitwie.
32. Całkowity triumf nad wrogiem (17:13): Jozue gromi Amaleka ostrzem miecza, lecz cały lud wie, że zwycięstwo narodziło się z wytrwałości rąk wzniesionych ku Bogu na szczycie góry.

CZĘŚĆ V — KSIĘGA PAMIĄTKOWA, OŁTARZ JAHWE NISSI I ODWIECZNA WALKA (WJ 17:14–16)
33. Pierwszy nakaz spisania Pisma Świętego (17:14a): „Zapisz to na pamiątkę w księdze” — w Wj 17:14 po raz pierwszy w Biblii pojawia się bezpośredni Boży rozkaz utrwalenia wydarzeń w tekście natchnionym!
34. Instrukcja dla młodego pokolenia liderów (17:14b): „I powtórz do uszu Jozuego” — pamięć o Bożych cudach musi zostać przekazana przyszłym przywódcom, by na niej budowali swoją wiarę.
35. Nieodwołalny wyrok nad Amalekiem (17:14c): „Wymażę zupełnie pamięć o Amaleku pod niebem” — zło, zdrada i bezwzględność spotkają się z ostateczną Bożą sprawiedliwością.
36. Wzniesienie ołtarza dziękczynnego (17:15a): Mojżesz nie stawia pomnika własnej chwały ani geniuszu wojskowego Jozuego, lecz buduje ołtarz ofiarny dla PANA.
37. Objawienie Imienia: JAHWE NISSI (17:15b): Mojżesz nadaje ołtarzowi nazwę: „PAN moją chorągwią / sztandarem” (Jahwe Nissi) — Bóg jest naszym znakiem zbiórki, naszą ochroną i jedynym źródłem triumfu.
38. Ręka wzniesiona ku tronowi PANA (17:16a): Hebrajski idiom wskazuje na uroczystą przysięgę wierności Bogu — walka z siłami niszczącymi lud Boży jest sprawą samego Wszechmogącego.
39. Odwieczny konflikt duchowy (17:16b): „Wojna PANA będzie przeciwko Amalekowi z pokolenia na pokolenie” — zapowiedź nieustannej walki między duchem a ciałem, znajdującej kres w Chrystusie.
40. Pełnia chwały w Zbawicielu (17:16c): Rozdział siedemnasty łączy dar Wody Żywej z uderzonej Skały z wiecznym zwycięstwem pod Sztandarem Jahwe Nissi — w Jezusie Chrystusie otrzymujemy zarówno ugaszenie pragnienia duszy, jak i ostateczny triumf nad grzechem i śmiercią!

KLUCZE JĘZYKOWE & KONTEKST KULTUROWY
• Refidim (רְפִידִים) — dosłownie „miejsca odpoczynku / orzeźwienia”; od rdzenia rafad (rozścielać posłanie, podpierać). Miejsce pozornego spokoju, które bez Boga staje się bezwodną pustynią, lecz z Bogiem zamienia się w źródło życia.
• Massa (מַסָּה) — od czasownika nasah (badać, kusić, wystawiać na próbę). Grzech zuchwałego żądania od Boga dowodów na ludzkich warunkach.
• Meriba (מְרִיבָה) — od czasownika riv (prowadzić spór prawny, kłócić się). Postawa roszczeniowa, rozbijająca jedność ludu przymierza.
• Horeb (חֹרֵב) — oznaczający suchość, spustoszenie, pustkowie lub miecz. Miejsce pierwszego powołania Mojżesza w płonącym krzewie (Wj 3:1), gdzie teraz Bóg staje na skale.
• Cur (צוּר) — potężna, lita skała granitowa. W teologii biblijnej jeden z najwspanialszych tytułów Boga: „On jest Skałą, doskonałe są Jego dzieła” (Pwt 32:4).
• Amalek (עֲמָלĘק) — potomkowie Ezawa (Rdz 36:12). W tradycji biblijnej symbol bezwzględnego, cielesnego wroga Bożego ludu, atakującego z ukrycia słabych i zmęczonych (Pwt 25:17–19).
• Nes (נֵס) / Jahwe Nissi (יְהוָה נִסִּי) — sztandar bojowy, wysoki znak wojenny na drzewcu widoczny z daleka jako punkt zbiórki dla walczących. Mojżesz ogłasza: Bóg jest naszą zwycięską flagą!

JEZUS W CENTRUM — ODPOWIEDŹ NOWEGO TESTAMENTU
1. Uderzona Skała to Chrystus (1 Kor 10:4): Apostoł Paweł jednoznacznie wyjaśnia: „pili bowiem z duchowej skały, która szła za nimi, a tą skałą był Chrystus”. Bóg stanął na skale Horebu, przyjmując uderzenie laski sądu — to proroczy obraz Chrystusa uderzonego na Golgocie za nasze winy (Iz 53:4–5).
2. Krew i Woda z przebitego boku (J 19:34; J 7:37–39): Z pękniętej skały wytrysnęła woda żywa. Z przebitego boku Zbawiciela wypłynęła krew i woda — źródło odkupienia i Ducha Świętego dla każdego spragnionego serca.
3. Wzniesione ręce Mojżesza a Krzyż i Wstawiennictwo Chrystusa (Hbr 7:25; Łk 24:50): Rozkrzyżowane na wzgórzu ręce Mojżesza zapowiadają Chrystusa wywyższonego na krzyżu Kalwarii. Ponadto Chrystus jest naszym doskonałym Orędownikiem, którego ręce nigdy nie opadają i który żyje na wieki, aby wstawiać się za nami przed Ojcem!
4. Jahwe Nissi — Krzyż jako Sztandar Zwycięstwa (Iz 11:10; J 12:32; Kol 2:14–15): Jezus ogłasza: „A ja, gdy będę wywyższony nad ziemię, pociągnę wszystkich do siebie”. Na krzyżu Chrystus rozbroił moce ciemności. Pod Jego sztandarem jesteśmy więcej niż zwycięzcami (Rz 8:37).

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• 1 Kor 10:4 — Tożsamość duchowej Skały z osobą Jezusa Chrystusa.
• Ps 78:15–16 — Rozłupanie skał na pustkowiu i wyprowadzenie strumieni jak rzek.
• Ps 105:41 — Otwarcie skały i obfity wypływ wód po suchych bezdrożach.
• Iz 53:4–5 — Cierpiący Sługa uderzony przez Boga i zraniony za nasze nieprawości.
• J 7:37–39 — Jezus na Święcie Namiotów wołający o przyjściu i piciu ze strumieni wody żywej.
• Ps 95:7–11 — Ostrzeżenie przed zatwardzaniem serc jak w Massa i Meriba.
• Pwt 25:17–19 — Podstępny atak Amaleka na zmęczonych wędrowców.
• Hbr 7:25 — Wieczne wstawiennictwo Chrystusa przed obliczem Ojca.

PRAWDA NA DZIŚ — TEOLOGIA PRAKTYCZNA
1. Bóg jest obecny w dolinie braku: Pustynia Refidim uczy nas, że brak widzialnych środków nie oznacza nieobecności Boga. Bóg potrafi uczynić źródło w najbardziej jałowym granicie naszego życia.
2. Chrystus jedynym nasyceniem duszy: Żadne ziemskie źródła nie ugaszą głodu i pragnienia wieczności. Tylko uderzona Skała — Chrystus ukrzyżowany i zmartwychwstały — daje pokój i Ducha Świętego.
3. Duchowa walka wymaga modlitwy i wspólnoty: Sukces w dolinie zależy od wzniesionych rąk na wzgórzu. Nikt nie wygra bitwy w samotności — potrzebujemy braci i sióstr, takich jak Aaron i Chur, którzy podtrzymają nas w modlitwie.
4. Zwycięstwo pod sztandarem Jahwe Nissi: Nasza siła nie leży w ludzkich mieczach, lecz w imieniu Jezusa Chrystusa, który zwyciężył świat.

POMYŚL — PYTANIA DO SERCA
1. Czy w obliczu trudności i braków nie ulegasz pokusie pytania: „Czy Pan jest ze mną, czy nie?”?
2. Do jakich źródeł biegniesz najpierw, gdy Twoja dusza odczuwa duchowe pragnienie i znużenie?
3. Jak wygląda Twoje orędownictwo w chwilach życiowych bitew — czy Twoje ręce są wzniesione ku niebu?
4. Kto w Twojej wspólnocie lub rodzinie potrzebuje dziś podtrzymania opadających rąk w modlitwie?
5. Czy Twoje codzienne wybory stoją pod sztandarem Chrystusa — Jahwe Nissi?

MAŁY QUIZ — SPRAWDŹ SWOJĄ WIEDZĘ (20 PYTAŃ Z WJ 17:1–16)

Pytanie 1: Skąd wyruszyło całe zgromadzenie synów Izraela przed przybyciem do Refidim (Wj 17:1)?
A. Z oazy Elim
B. Z pustyni Sin, robiąc postoje według rozkazu PANA
C. Z krainy Goszen
D. Bezpośrednio z brzegu Morza Czerwonego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:1 podaje, że Izrael wyruszył z pustyni Sin według rozkazu PANA.

Pytanie 2: Czego zabrakło synom Izraela po rozbiciu obozu w Refidim (Wj 17:1)?
A. Manna przestała padać
B. Nie było wody, aby lud mógł się napić
C. Zabraknęło namiotów i drewna
D. Padły wszystkie stada bydła
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:1 mówi: „gdzie nie było wody, aby lud mógł się napić”.

Pytanie 3: Jakie żądanie skierował zdesperowany lud do Mojżesza w Wj 17:2?
A. „Poprowadź nas z powrotem do Egiptu!”
B. „Dajcie nam wody, abyśmy się napili”
C. „Zbudujmy studnię w dolinie”
D. „Rozdziel skały swoim mieczem”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:2 cytuje słowa ludu: „Dajcie nam wody, abyśmy się napili”.

Pytanie 4: O co zapytał Mojżesz kłócący się z nim lud w Wj 17:2?
A. „Gdzie podziało się wasze złoto?”
B. „Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?”
C. „Czy zapomnieliście o plagach egipskich?”
D. „Kto z was potrafi znaleźć źródło?”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:2: „Mojżesz odpowiedział im: Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?”.

Pytanie 5: Jakie dramatyczne oskarżenie lud wysunął przeciwko Mojżeszowi w Wj 17:3?
A. Że ukradł zapasy manny
B. „Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?”
C. Że zgubił drogę do Kanaanu
D. Że zawarł przymierze z Amalekitami
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:3 dokumentuje zarzut: „Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?”.

Pytanie 6: Co zaniepokojony Mojżesz wykrzyknął w modlitwie do PANA w Wj 17:4?
A. „Zgładź ten buntowniczy naród!”
B. „Cóż mam uczynić z tym ludem? Jeszcze trochę, a mnie ukamienują”
C. „Pozwól mi uciec do krainy Midian!”
D. „Ześlij deszcz z obłoków nad obozem”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:4: „Mojżesz zawołał do PANA: Cóż mam uczynić z tym ludem? Jeszcze trochę, a mnie ukamienują”.

Pytanie 7: Kogo PAN nakazał wziąć Mojżeszowi ze sobą przed wyruszeniem do skały (Wj 17:5)?
A. Wszystkich wojowników z pokolenia Judy
B. Niektórych ze starszych Izraela
C. Całą rodzinę faraona
D. Tylko i wyłącznie Aarona i Chura
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:5: „weź ze sobą niektórych ze starszych Izraela”.

Pytanie 8: Co Mojżesz miał wziąć w rękę na rozkaz Boży (Wj 17:5)?
A. Złoty kielich ofiarny
B. Swoją laskę, którą uderzył w rzekę Nil
C. Kamienne tablice przymierza
D. Miedzianego węża na drzewcu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:5: „Weź także w rękę swoją laskę, którą uderzyłeś w rzekę, i idź”.

Pytanie 9: Gdzie PAN obiecał stanąć przed Mojżeszem przed wydobyciem wody (Wj 17:6)?
A. W płonącym krzewie w dolinie
B. Na skale na Horebie
C. W bramie Namiotu Zgromadzenia
D. Na szczycie góry Synaj pośród gromów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:6: „Oto stanę przed tobą tam, na skale na Horebie”.

Pytanie 10: Co stało się, gdy Mojżesz uderzył w skałę na oczach starszych Izraela (Wj 17:6)?
A. Skała rozpadła się w drobny proch
B. Wypłynęła z niej woda, którą lud pił
C. Z wnętrza skały buchnął ogień Boży
D. Otworzyła się głęboka przepaść
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:6: „uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił”.

Pytanie 11: Jakie dwie nazwy nadał Mojżesz miejscu wytryśnięcia wody (Wj 17:7)?
A. Elim i Mara
B. Massa i Meriba
C. Beer-Szeba i Betel
D. Gilgal i Sziloh
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:7: „I nadał temu miejscu nazwę Massa i Meriba”.

Pytanie 12: Jakie dramatyczne pytanie zadał Izrael, z powodu którego nadano nazwę Massa (Wj 17:7)?
A. „Kto wprowadzi nas do ziemi obiecanej?”
B. „Czy PAN jest wśród nas, czy nie?”
C. „Gdzie podział się Bóg Abrahama?”
D. „Dlaczego Mojżesz nie daje nam mięsa?”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:7 podaje słowa ludu: „Czy PAN jest wśród nas, czy nie?”.

Pytanie 13: Jaki wróg nadciągnął nagle, aby walczyć z Izraelem w Refidim (Wj 17:8)?
A. Król Moabu z rydwanami
B. Amalek
C. Filistyni z pięciu miast
D. Wojska asyryjskie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:8: „Tymczasem Amalek nadciągnął, aby walczyć z Izraelem w Refidim”.

Pytanie 14: Kogo Mojżesz wyznaczył do poprowadzenia mężów do bitwy przeciw Amalekowi (Wj 17:9)?
A. Aarona
B. Jozuego
C. Chura
D. Kaleba
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:9: „Mojżesz powiedział do Jozuego: Wybierz nam mężczyzn, wyrusz i stocz bitwę z Amalekiem”.

Pytanie 15: Gdzie stanął Mojżesz podczas bitwy z Amalekiem i co trzymał w ręku (Wj 17:9)?
A. W pierwszym szeregu walczących z mieczem
B. Na szczycie wzgórza z laską Boga w ręku
C. W namiocie modlitwy z kadzielnicą
D. U stóp ołtarza na Horebie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:9: „Ja zaś jutro stanę na szczycie wzgórza z laską Boga w ręku”.

Pytanie 16: Kto wszedł na szczyt wzgórza razem z Mojżeszem (Wj 17:10)?
A. Jozue i Kaleb
B. Aaron i Chur
C. Miriam i Eleazar
D. Siedemdziesięciu starszych Izraela
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:10: „A Mojżesz, Aaron i Chur weszli na szczyt wzgórza”.

Pytanie 17: Jaka duchowa zależność ujawniła się podczas bitwy pod Refidim (Wj 17:11)?
A. Im głośniej trąbiono w rogi, tym szybciej uciekał Amalek
B. Gdy Mojżesz podnosił rękę, przeważał Izrael, a gdy opuszczał rękę, przeważał Amalek
C. Pozycja słońca na niebie decydowała o sile Jozuego
D. Przewaga zależała od liczby łuczników
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:11: „Gdy Mojżesz podnosił rękę, przeważał Izrael, a gdy opuszczał rękę, przeważał Amalek”.

Pytanie 18: Co uczynili Aaron i Chur, gdy ręce Mojżesza stały się ociężałe (Wj 17:12)?
A. Zastąpili Mojżesza i sami zeszli do walki na miecze
B. Podłożyli kamień, na którym usiadł, i podpierali jego ręce z obu stron aż do zachodu słońca
C. Związali ręce Mojżesza sznurem do drewnianego pala
D. Wezwali całe wojsko do natychmiastowego odwrotu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:12 szczegółowo opisuje podłożenie kamienia i podpieranie rąk przez Aarona i Chura.

Pytanie 19: Jaki nakaz PAN skierował do Mojżesza po zwycięstwie nad Amalekiem (Wj 17:14)?
A. Aby wzniósł złoty posąg upamiętniający wierność Jozuego
B. Zapisz to na pamiątkę w księdze i powtórz do uszu Jozuego
C. Aby natychmiast zawarł pokój z synami Ezawa
D. Aby złożył w ofierze całe bydło zdobyte na wrogu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:14: „Zapisz to na pamiątkę w księdze i powtórz do uszu Jozuego”.

Pytanie 20: Jaką nazwę Mojżesz nadał ołtarzowi wzniesionemu po zwycięstwie w Refidim (Wj 17:15)?
A. Betel — Dom Boży
B. PAN moją chorągwią (Jahwe Nissi)
C. Ebenezer — Aż dotąd pomagał nam PAN
D. Jahwe Szalom — PAN pokojem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 17:15: „Potem Mojżesz zbudował ołtarz i nadał mu nazwę: PAN moją chorągwią [Jahwe Nissi]”.

TWOJA DECYZJA
Porzuć Zwątpienie — Pij ze Skały Chrystusa i Walcz pod Jego Sztandarem!
Siedemnasty rozdział Księgi Wyjścia stawia przed każdym uczniem Jezusa radykalne wezwanie wiary: czy pozwolisz, by bezwodna pustynia i ataki przeciwnika wywołały w Tobie bunt i zwątpienie w obecność Boga?
Bóg nie opuścił Cię w dolinie Refidim. On sam stanął na Skale, wziął na Siebie cios sądu i otworzył dla Ciebie niewyczerpane źródła Ducha Świętego. Równocześnie wzywa Cię do wytrwałej modlitwy ze wzniesionymi rękami i do budowania braterskiej wspólnoty wiary.
Podejmij dziś osobistą decyzję: wyrzeknij się szemrania Massa i Meriba, wyznaj Chrystusa jako swoją jedyną Skałę i podnieś ręce w dziękczynieniu pod sztandarem Jahwe Nissi!

MODLITWA NA DZIŚ — 16 LISTOPADA 2026
Modlitwa o Wodę Żywą, Wytrwałość we Wstawiennictwie i Zwycięstwo pod Sztandarem Jahwe Nissi
Święty, Wszechmogący i Łaskawy Boże, Ojcze naszego Pana Jezusa Chrystusa!
Z głębi serca dziękujemy Ci za potężne poselstwo siedemnastego rozdziału Księgi Wyjścia. Dziękujemy, że jesteś Bogiem, który nie opuszcza swoich dzieci w bezwodnych dolinach i który z twardego granitu potrafi wyprowadzić rzekę żywej wody.
Wybacz nam, Panie, każdą chwilę, w której wątpiliśmy w Twoją obecność i pytaliśmy zuchwale: „Czy Pan jest z nami?”. Wybacz nam szemranie przeciwko Twojemu prowadzeniu i szukanie ratunku w iluzjach dawnego życia.
Panie Jezu Chryste, Ty jesteś naszą uderzoną Skałą i źródłem Wody Żywej! Napełnij nasze serca Twoim Duchem Świętym. Podtrzymaj nasze opadające ręce w chwilach znużenia i duchowej walki. Postaw na naszej drodze wiernych braci i siostry, abyśmy wspólnie trwali w modlitwie aż do ostatecznego zwycięstwa. Wznieś nad naszym życiem, naszymi rodzinami i naszą misją Twój niezawodny sztandar miłości i triumfu — Jahwe Nissi! W Twoje Najświętsze Imię modlimy się. Amen!

ZADANIE NA DZIŚ & TWÓJ ZAPIS
1. Przeczytaj osobiście cały siedemnasty rozdział Księgi Wyjścia (Wj 17:1–16) w przekładzie UBG.
2. Zbadaj 1 List do Koryntian 10:4 i podziękuj Jezusowi Chrystusowi za to, że jest Twoją Duchową Skałą, z której wypływa łaska i przebaczenie.
3. Wyznaj Bogu każdą sytuację w Twoim życiu, w której z powodu trudności lub braku zwątpiłeś i pytałeś w duchu: „Czy Pan jest ze mną, czy nie?” (Wj 17:7).
4. Zidentyfikuj duchowego „Amaleka” w Twoim życiu powszednim (pokusę, zniechęcenie, grzech cielesny) i stań do walki w imieniu Jezusa Chrystusa.
5. Znajdź dzisiaj brata lub siostrę w wierze, których „ręce opadają ze zmęczenia” — zadzwoń, pomódl się z nimi i wesprzyj ich tak, jak Aaron i Chur wsparli Mojżesza (Wj 17:12).
6. Zapisz w swoim duchowym notesie jedno zwycięstwo, które Bóg Ci podarował, budując osobisty ołtarz wdzięczności „Jahwe Nissi — Pan moim Sztandarem” (Wj 17:14–15).
7. Naucz się na pamięć tekstu pamięciowego: Wj 17:6.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 17 LISTOPADA 2026
DZIEŃ 48 — ODWIEDZINY JETRY I MĄDRA RADA: DECENTRALIZACJA I SŁUŻBA WSPÓLNOTY (WJ 18:1–27)
Dzień 48: Spotkanie Mojżesza z teściem Jetrą na pustyni, radość z ocalenia z Egiptu, ofiary dla Boga oraz mądra rada podziału odpowiedzialności i ustanowienia przełożonych nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami.`;

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
            trimmed.startsWith('ANALIZA EGZEGETYCZNA') ||
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
console.log('🏛️ Buduję stronę HTML lekcji Dnia 47 z pełnymi 40 punktami egzegetycznymi...');
const d46HtmlPath = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-46.html');
let html = fs.readFileSync(d46HtmlPath, 'utf8');

// Metadane
html = html.replace(/<title>Dzień 46:[^<]+<\/title>/, `<title>Dzień 47: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 47 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}">`);
html = html.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-46"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-47"`);
html = html.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 47: ${TITLE} (${READING}) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${SUBTITLE}"`);
html = html.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-46"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-47"`);
html = html.replace(/property="og:image" content="[^"]+"/, `property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_47_woda_ze_skaly_i_zwyciestwo_nad_amalekiem.jpg?v=20261116"`);

// Pasek nawigacji górnej i breadcrumbs
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 46<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień 47</span>`
);
html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-45"[\s\S]*?<span>← Dzień 45<\/span>[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-47"[\s\S]*?<span>Dzień 47 \(Poniedziałek\) →<\/span>\s*<\/a>/,
  `<a href="/akademia/kurscodzienny/dzien-46" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 46</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 48 (Wtorek) →</span>
        </span>`
);
html = html.replace(
  /<span>Dzień 46 z 2009<\/span>/,
  `<span>Dzień 47 z 2009</span>`
);

// Hero badge data & tytuły
html = html.replace(/DZIEŃ 46 • NIEDZIELA, 15 LISTOPADA 2026/, `DZIEŃ 47 • PONIEDZIAŁEK, 16 LISTOPADA 2026`);
html = html.replace(/MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU — BOŻE ZAOPATRZENIE NA PUSTYNI/g, TITLE);
html = html.replace(/Głód na pustyni Sin, deszcz chleba z nieba, przepiórki i dar świętego odpoczynku \(Wj 16:1–36\)/, SUBTITLE);
html = html.replace(/Głód ludu na pustyni Sin, deszcz chleba z nieba, przepiórki o zmierzchu, miara omera i dar Bożego odpoczynku w Szabacie \(Wj 16:1–36\)/, SUBTITLE);

// Obraz w Hero
html = html.replace(/images\/academy\/daily\/kc_day_46_manna_z_nieba_chleb_zycia\.jpg\?v=\d+/, `images/academy/daily/kc_day_47_woda_ze_skaly_i_zwyciestwo_nad_amalekiem.jpg?v=20261116`);
html = html.replace(/alt="Dzień 46:[^"]+"/, `alt="Dzień 47: ${TITLE}"`);
html = html.replace(/<span>Ilustracja biblijna: [^<]+<\/span>/, `<span>Ilustracja biblijna: ${TITLE} (${READING})</span>`);
html = html.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 16:1–36<\/span>/g, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${READING}</span>`);

// Podróż przez 66 Ksiąg
html = html.replace(
  /Dziś jest <strong class="text-white">Dzień 46<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 16:1–36<\/strong>\./,
  `Dziś jest <strong class="text-white">Dzień 47</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 17:1–16</strong>.`
);
html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=16"/g, `href="/mojabiblia?book=EXO&chapter=17"`);
html = html.replace(/<span>Czytaj Wj 16:1–36<\/span>/g, `<span>Czytaj Wj 17:1–16</span>`);

// Kody Stronga
const strongChipsHtml = `<!-- KLUCZE JĘZYKOWE & KODY STRONGA -->
      <section class="kc-card">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
          <i class="fa-solid fa-spell-check text-amber-400"></i>
          <span>Klucze Językowe & Kody Stronga (Wj 17:1–16)</span>
        </div>
        <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
          Poniższe terminy hebrajskie stanowią osnowę teologiczną 17. rozdziału Księgi Wyjścia (woda ze skały, orędownictwo i zwycięstwo pod sztandarem Boga):
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="strong-chip"><span class="strong-id">H7508</span> <span class="strong-orig">רְפִידִים (Refidim)</span> — „miejsca odpoczynku” — obóz na pustkowiu, w którym brak wody stał się próbą wiary (Wj 17:1, 8)</span>
          <span class="strong-chip"><span class="strong-id">H4532</span> <span class="strong-orig">מַסָּה (Massa)</span> — próba / kuszenie — od nasah (kusić, żądać od Boga dowodów na własnych warunkach) (Wj 17:7)</span>
          <span class="strong-chip"><span class="strong-id">H4809</span> <span class="strong-orig">מְרִיבָה (Meriba)</span> — spór / kłótnia — od riv (procesować się, kłócić ze sługą Bożym) (Wj 17:7)</span>
          <span class="strong-chip"><span class="strong-id">H6697</span> <span class="strong-orig">צוּר (Cur)</span> — potężna, lita skała granitowa na Horebie, z której Bóg wyprowadził żywą wodę (Wj 17:6)</span>
          <span class="strong-chip"><span class="strong-id">H6002</span> <span class="strong-orig">עֲמָלֵק (Amalek)</span> — podstępny wróg atakujący z ukrycia zmęczony lud Boży pod Refidim (Wj 17:8–16)</span>
          <span class="strong-chip"><span class="strong-id">H3091</span> <span class="strong-orig">יְהוֹשֻׁעַ (Jehoszua / Jozue)</span> — „PAN jest zbawieniem” — powołany dowódca armii w dolinie (Wj 17:9–14)</span>
          <span class="strong-chip"><span class="strong-id">H5251</span> <span class="strong-orig">נֵס (Nes)</span> — sztandar, chorągiew, wysoki znak wojenny na wzgórzu (Wj 17:15)</span>
          <span class="strong-chip"><span class="strong-id">H3071</span> <span class="strong-orig">יְהוָה נִסִּי (Jahwe Nissi)</span> — „PAN moim Sztandarem” — ołtarz wzniesiony na pamiątkę wiecznego triumfu Boga (Wj 17:15)</span>
        </div>
      </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">\s*<i class="fa-solid fa-spell-check text-amber-400"><\/i>\s*<span>Klucze Językowe & Kody Stronga \(Wj 16:1–36\)[\s\S]*?<\/div>\s*<\/section>/,
  strongChipsHtml
);

// Social share linki
const shareTextEncoded = encodeURIComponent(`Z Biblią za Pan Brat — Dzień 47: ${TITLE} (${READING}). „${MEMORY_VERSE}” https://polskieradio.cc/akademia/kurscodzienny/dzien-47`);
html = html.replace(/https:\/\/api\.whatsapp\.com\/send\?text=[^"]+/, `https://api.whatsapp.com/send?text=${shareTextEncoded}`);
html = html.replace(/https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=https%3A%2F%2Fpolskieradio\.cc%2Fakademia%2Fkurscodzienny%2Fdzien-46/g, `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-47`);
html = html.replace(/https:\/\/twitter\.com\/intent\/tweet\?text=[^"]+/, `https://twitter.com/intent/tweet?text=${shareTextEncoded}`);

// Kopiowanie wersetu i boks pamięciowy
html = html.replace(
  /<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->[\s\S]*?<!-- MYŚL PRZEWODNIA -->/,
  `<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-bookmark"></i>
            <span>Werset do zapamiętania</span>
          </div>
          <p class="font-serif italic text-base sm:text-lg text-white">
            „Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela.”
          </p>
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 17:6 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela. (Wj 17:6, UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
          class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
          title="Kopiuj werset do schowka"
        >
          <i class="fa-regular fa-copy"></i>
          <span>Kopiuj</span>
        </button>
      </div>\n\n      <!-- MYŚL PRZEWODNIA -->`
);

// Myśl przewodnia
html = html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>\s*<!-- LESSON BODY CONTENT/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ${THEME}\n      </div>\n    </div>\n\n    <!-- LESSON BODY CONTENT`
);

// Wprowadzenie Zanim otworzysz Biblię
html = html.replace(
  /<div class="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── TEKST PISMA ŚWIĘTEGO/,
  `<div class="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif">
          <p>
            Siedemnasty rozdział Księgi Wyjścia wprowadza nas w kolejny, niezwykle wymagający etap wędrówki przez pustynię. Po doświadczeniu słodkiej wody w Mara i obfitości dwunastu źródeł w Elim, a także po cudzie porannej manny na pustyni Sin, Izrael wkracza w skalisty rejon Refidim u stóp masywu Horebu.
          </p>
          <p>
            W tym suchym, spalonym słońcem krajobrazie dochodzi do ponownego zderzenia ludzkiej bezradności z potęgą Bożej opatrzności. Brak wody wywołuje w obozie gwałtowną panikę i agresywny spór z Mojżeszem. Jednak Bóg odpowiada cudem, który na zawsze wejdzie do kanonu biblijnej teologii zbawienia — uderzeniem w granitową skałę, z której wypływa rzeka orzeźwienia. Zaraz potem lud musi stanąć do swojej pierwszej otwartej bitwy z podstępnym Amalekiem, ucząc się, że zwycięstwa militarne i duchowe wykuwają się nie tylko siłą oręża, lecz przede wszystkim wiernością wzniesionych rąk w modlitwie. Otwórzmy ten rozdział z wiarą, prosząc Ducha Świętego o orzeźwienie ze Skały, którą jest Chrystus, oraz o moc do walki pod Jego zwycięskim sztandarem!
          </p>
        </div>
      </section>

      <!-- ── TEKST PISMA ŚWIĘTEGO`
);

// Tekst czytania dnia
html = html.replace(/KSIĘGA WYJŚCIA 16:1–36 \(UBG\)/g, `KSIĘGA WYJŚCIA 17:1–16 (UBG)`);
html = html.replace(/Czytanie na Dzień 46 • Przekład Uwspółcześniona Biblia Gdańska/g, `Czytanie na Dzień 47 • Przekład Uwspółcześniona Biblia Gdańska`);
html = html.replace(
  /<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 16:1–36<\/p>/g,
  `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 17:1–16</p>`
);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">\n        ${readingHtml}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`
);

// Egzegeza 40 punktów analitycznych (5 części po 8 punktów)
const exegesis40Html = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            WĘDRÓWKA Z PUSTYNI SIN DO REFIDIM I BUNT PRAGNIENIA (WJ 17:1–3)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Wędrówka etapami według rozkazu PANA (17:1a):</strong> Izrael posuwa się naprzód ściśle według Bożych wskazówek („robiąc postoje według rozkazu PANA”) — trudne próby życiowe nie wynikają z błądzenia poza wolą Bożą, lecz są integralnym elementem Bożej szkoły wiary.</p>
            <p><strong>2. Obozowisko w Refidim (17:1b):</strong> Nazwa Refidim oznacza dosłownie „miejsca odpoczynku” lub „orzeźwienia”, lecz w tym miejscu paradoksalnie brakuje wody — Boży odpoczynek nie zależy od ziemskich wygód, lecz od Bożej obecności.</p>
            <p><strong>3. Fizyczna udręka bezwodnej pustyni (17:1c):</strong> Brak wody pod palącym słońcem Synaju bezpośrednio zagraża życiu setek tysięcy wędrowców, dzieci oraz ich stad.</p>
            <p><strong>4. Spór z Mojżeszem zamiast modlitwy do Boga (17:2a):</strong> Zgromadzenie zamiast paść na twarz przed Bogiem, który dał mannę i rozdzielił morze, agresywnie żąda od przywódcy: „Dajcie nam wody, abyśmy się napili!”.</p>
            <p><strong>5. Demaskacja duchowej istoty kłótni (17:2b):</strong> Mojżesz obnaża źródło ataku: „Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?” — pretensje do sługi Bożego są w rzeczywistości buntem przeciwko samemu Bogu.</p>
            <p><strong>6. Pragnienie rodzące ślepotę i zgorzknienie (17:3a):</strong> Cielesna potrzeba zaślepia duchowy wzrok; ludzie całkowicie zapominają o wczorajszym cudzie chleba z nieba.</p>
            <p><strong>7. Oszczercze oskarżenie o intencjonalną zagładę (17:3b):</strong> „Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?” — niewiara wmawia Bogu okrucieństwo i złą wolę.</p>
            <p><strong>8. Psychologiczna pułapka idealizowania niewoli (17:3c):</strong> Pragnienie wywołuje iluzję, że egipska niewola była lepsza od Bożej wolności, ukazując jak łatwo człowiek w kryzysie rezygnuje z Bożego powołania.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            KRZYK PRZYWÓDCY, LASKA SĄDU I UDERZONA SKAŁA NA HOREBIE (WJ 17:4–6)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>9. Dramatyczna modlitwa Mojżesza (17:4a):</strong> Mojżesz nie odpowiada agresją na agresję, lecz woła do PANA: „Cóż mam uczynić z tym ludem?” — doskonały wzór przywódcy przynoszącego kryzys bezpośrednio przed tron Boży.</p>
            <p><strong>10. Zagrożenie samosądem i linczem (17:4b):</strong> „Jeszcze trochę, a mnie ukamienują” — desperacja ludu osiąga punkt krytyczny, bezpośrednio zagrażając życiu sługi Bożego.</p>
            <p><strong>11. Rozkaz marszu na oczach starszych (17:5a):</strong> Bóg nakazuje Mojżeszowi wyjść przed lud i zabrać ze sobą starszych Izraela jako urzędowych i wiarygodnych świadków nadchodzącego cudu.</p>
            <p><strong>12. Laska Bożego sądu (17:5b):</strong> „Weź także w rękę swoją laskę, którą uderzyłeś w rzekę, i idź” — laska, która sprowadziła sądy na Nil i rozdzieliła morze, ma posłużyć do ocalenia ludu.</p>
            <p><strong>13. Wstrząsająca teofania na skale (17:6a):</strong> „Oto stanę przed tobą tam, na skale na Horebie” — Niewidzialny Bóg w obłoku chwały staje na szczycie skały, stawiając Siebie w miejscu gotowości na przyjęcie ciosu!</p>
            <p><strong>14. Uderzenie w litą skałę (17:6b):</strong> Mojżesz na rozkaz Boży wymierza cios laską sądu w granitowy masyw — gest po ludzku absurdalny, stający się demonstracją Bożej wszechmocy.</p>
            <p><strong>15. Wypłynięcie obfitego strumienia wody (17:6c):</strong> Z rozłupanego granitu wytryska potężna rzeka krystalicznej, żywej wody, gasząca pragnienie całego obozu (Ps 78:15–16; Ps 105:41).</p>
            <p><strong>16. Publiczne świadectwo na Horebie (17:6d):</strong> „I Mojżesz uczynił tak na oczach starszych Izraela” — cud staje się jawnym, niepodważalnym faktem historycznym.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            MASSA I MERIBA — TRAGICZNE PYTANIE: „CZY PAN JEST WŚRÓD NAS?” (WJ 17:7)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Nadanie wiecznych nazw ostrzegawczych (17:7a):</strong> Mojżesz nazywa to miejsce Massa („próba / kuszenie”) i Meriba („kłótnia / spór”), utrwalając w pamięci pokoleń przestrogę przed powątpiewaniem w Boga.</p>
            <p><strong>18. Grzech kuszenia Boga (17:7b):</strong> Hebrajskie słowo massa oznacza domaganie się od Boga cudów na ludzkich warunkach jako warunku dalszego posłuszeństwa.</p>
            <p><strong>19. Zgorszenie kłótni we wspólnocie (17:7c):</strong> Meriba demaskuje destrukcyjną siłę podziału i oskarżeń niszczących Bożą jedność w chwili kryzysu.</p>
            <p><strong>20. Najbardziej tragiczne pytanie wędrówki (17:7d):</strong> „Czy PAN jest wśród nas, czy nie?” — słowa wypowiedziane pośród widzialnego słupa obłoku i codziennej manny na pustyni!</p>
            <p><strong>21. Zaślepienie na znaki obecności (17:7e):</strong> Lud patrzył na suchy piasek zamiast na obłok Bożej chwały, pozwalając okolicznościom zdefiniować wiarę.</p>
            <p><strong>22. Uniwersalna przestroga biblijna (17:7f):</strong> Psalm 95 oraz List do Hebrajczyków (Hbr 3:7–15) czynią z Massa i Meriba centralny symbol zatwardziałości serca, zamykającej wejście do Bożego odpoczynku.</p>
            <p><strong>23. Niewyczerpana Boża cierpliwość (17:7g):</strong> Mimo obraźliwego pytania ludu, Bóg nie zsyła ognia ani zarazy, lecz obdarowuje ich orzeźwiającym strumieniem łaski.</p>
            <p><strong>24. Skała pomnikiem pokory (17:7h):</strong> Refidim uczy, że Boże zaopatrzenie płynie nie z zasług człowieka, lecz z suwerennej, przebaczającej miłości Stwórcy.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            ZBROJNY ATAK AMALEKA I WALKA NA DWÓCH PLANACH POD REFIDIM (WJ 17:8–13)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>25. Niespodziewany atak odwiecznego wroga (17:8):</strong> Gdy tylko lud gasi pragnienie, nadciąga Amalek — koczowniczy potomkowie Ezawa, archetyp podstępnego ataku sił ciemności na słabych i zmęczonych (Pwt 25:17–19).</p>
            <p><strong>26. Pierwsze pojawienie się Jozuego (17:9a):</strong> Wj 17:9 po raz pierwszy na kartach Biblii wprowadza postać Jozuego (hebr. Jehoszua — „PAN jest zbawieniem”) jako wyznaczonego dowódcy wojskowego.</p>
            <p><strong>27. Boży podział ról w walce (17:9b):</strong> Mojżesz rozkazuje: „Wybierz nam mężczyzn, wyrusz i stocz bitwę z Amalekiem. Ja zaś jutro stanę na szczycie wzgórza z laską Boga w ręku”.</p>
            <p><strong>28. Dwa wymiary zwycięstwa — dolina i wzgórze (17:10):</strong> Walka toczy się równolegle na dwóch planach: fizycznego wysiłku miecza na nizinie oraz duchowego orędownictwa na szczycie wzniesienia.</p>
            <p><strong>29. Tajemnica wzniesionych rąk (17:11):</strong> Gdy ręce Mojżesza są wzniesione w modlitwie, zwycięża Izrael; gdy opadają ze zmęczenia, przeważa Amalek — duchowa łączność z niebem decyduje o losach bitwy.</p>
            <p><strong>30. Ludzka słabość przywódcy (17:12a):</strong> „Ale ręce Mojżesza były ociężałe” — nawet najwięksi mocarze wiary ulegają wyczerpaniu i nie są w stanie trwać w samotności.</p>
            <p><strong>31. Niezbędna rola Aarona i Chura (17:12b):</strong> Podkładają pod Mojżesza kamień, a sami stają po bokach i podtrzymują jego ręce aż do zachodu słońca — potężny obraz braterskiej wspólnoty i wzajemnego wsparcia w modlitwie.</p>
            <p><strong>32. Całkowity triumf nad wrogiem (17:13):</strong> Jozue gromi Amaleka ostrzem miecza, lecz cały lud wie, że zwycięstwo narodziło się z wytrwałości rąk wzniesionych ku Bogu na szczycie góry.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            KSIĘGA PAMIĄTKOWA, OŁTARZ JAHWE NISSI I ODWIECZNA WALKA (WJ 17:14–16)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>33. Pierwszy nakaz spisania Pisma Świętego (17:14a):</strong> „Zapisz to na pamiątkę w księdze” — w Wj 17:14 po raz pierwszy w Biblii pojawia się bezpośredni Boży rozkaz utrwalenia wydarzeń w tekście natchnionym!</p>
            <p><strong>34. Instrukcja dla młodego pokolenia liderów (17:14b):</strong> „I powtórz do uszu Jozuego” — pamięć o Bożych cudach musi zostać przekazana przyszłym przywódcom, by na niej budowali swoją wiarę.</p>
            <p><strong>35. Nieodwołalny wyrok nad Amalekiem (17:14c):</strong> „Wymażę zupełnie pamięć o Amaleku pod niebem” — zło, zdrada i bezwzględność spotkają się z ostateczną Bożą sprawiedliwością.</p>
            <p><strong>36. Wzniesienie ołtarza dziękczynnego (17:15a):</strong> Mojżesz nie stawia pomnika własnej chwały ani geniuszu wojskowego Jozuego, lecz buduje ołtarz ofiarny dla PANA.</p>
            <p><strong>37. Objawienie Imienia: JAHWE NISSI (17:15b):</strong> Mojżesz nadaje ołtarzowi nazwę: „PAN moją chorągwią / sztandarem” (Jahwe Nissi) — Bóg jest naszym znakiem zbiórki, naszą ochroną i jedynym źródłem triumfu.</p>
            <p><strong>38. Ręka wzniesiona ku tronowi PANA (17:16a):</strong> Hebrajski idiom wskazuje na uroczystą przysięgę wierności Bogu — walka z siłami niszczącymi lud Boży jest sprawą samego Wszechmogącego.</p>
            <p><strong>39. Odwieczny konflikt duchowy (17:16b):</strong> „Wojna PANA będzie przeciwko Amalekowi z pokolenia na pokolenie” — zapowiedź nieustannej walki między duchem a ciałem, znajdującej kres w Chrystusie.</p>
            <p><strong>40. Pełnia chwały w Zbawicielu (17:16c):</strong> Rozdział siedemnasty łączy dar Wody Żywej z uderzonej Skały z wiecznym zwycięstwem pod Sztandarem Jahwe Nissi — w Jezusie Chrystusie otrzymujemy zarówno ugaszenie pragnienia duszy, jak i ostateczny triumf nad grzechem i śmiercią!</p>
          </div>
        </div>`;

// Podmieniamy nagłówek egzegezy na 40 punktów analitycznych
html = html.replace(/<p class="text-xs text-zinc-400">Pięć części studium Wj 16:1–36 \(\d+ punktów analitycznych\)<\/p>/, `<p class="text-xs text-zinc-400">Pięć części studium Wj 17:1–16 (40 punktów analitycznych)</p>`);

// Podmieniamy 5 części egzegezy
html = html.replace(/<!-- CZĘŚĆ I -->[\s\S]*?<!-- CZĘŚĆ V -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, `${exegesis40Html}\n        </div>\n      </section>`);

// Jezus w centrum
const jesusInCenterHtml = `<!-- ── JEZUS W CENTRUM ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-cross"></i>
          <span>Jezus w centrum</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Jezus Chrystus — Uderzona Skała, Woda Żywa i Sztandar Zwycięstwa (Jahwe Nissi)
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Uderzona Skała to Ukrzyżowany Chrystus (1 Kor 10:4):</strong> Apostoł Paweł bez cienia wątpliwości wskazuje: „pili bowiem z duchowej skały, która szła za nimi, a tą skałą był Chrystus”. Bóg stanął na skale Horebu, przyjmując uderzenie laski sądu — to proroczy obraz Chrystusa uderzonego na Golgocie za nasze winy (Iz 53:4–5).
          </p>
          <p>
            <strong>2. Krew i Woda z przebitego boku (J 19:34; J 7:37–39):</strong> Z pękniętej skały wytrysnęła woda żywa. Z przebitego boku Zbawiciela wypłynęła krew i woda — źródło odkupienia i Ducha Świętego dla każdego spragnionego serca.
          </p>
          <p>
            <strong>3. Wzniesione ręce Mojżesza a Krzyż i Wstawiennictwo Chrystusa (Hbr 7:25; Łk 24:50):</strong> Rozkrzyżowane na wzgórzu ręce Mojżesza zapowiadają Chrystusa wywyższonego na krzyżu Kalwarii. Ponadto Chrystus jest naszym doskonałym Orędownikiem, którego ręce nigdy nie opadają i który żyje na wieki, aby wstawiać się za nami przed Ojcem!
          </p>
          <p>
            <strong>4. Jahwe Nissi — Krzyż jako Sztandar Zwycięstwa (Iz 11:10; J 12:32; Kol 2:14–15):</strong> Jezus ogłasza: „A ja, gdy będę wywyższony nad ziemię, pociągnę wszystkich do siebie”. Na krzyżu Chrystus rozbroił moce ciemności. Pod Jego sztandarem jesteśmy więcej niż zwycięzcami (Rz 8:37).
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=17" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj Wj 17:1–16</span>
            </a>
          </div>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── JEZUS W CENTRUM ── -->[\s\S]*?<!-- ── SPRAWDŹ W BIBLII ── -->/,
  `${jesusInCenterHtml}\n\n      <!-- ── SPRAWDŹ W BIBLII ── -->`
);

// Sprawdź w Biblii
const compareVersesHtml = `<!-- ── SPRAWDŹ W BIBLII ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Porównaj wersety we własnym Piśmie Świętym</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 8 Wersetów Porównawczych (Wj 17:1–16)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:6 → 1 Kor 10:4</strong>: Skała z Horebu dająca żywy napój jest bezpośrednią prefiguracją Jezusa Chrystusa.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:6 → Ps 78:15–16</strong>: Cudowne rozłupanie skały i wyprowadzenie strumieni jak rzek na pustkowiu.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:6 → Iz 53:4–5</strong>: Cierpiący Sługa uderzony przez Boga, aby z Jego ran popłynęło uzdrowienie i życie.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:6 → J 7:37–39</strong>: Wołanie Jezusa na Święcie Namiotów o gaszeniu pragnienia Duchem Świętym.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:7 → Ps 95:8–9</strong>: Przestroga przed zatwardzaniem serc w Meriba i kuszeniem Boga w Massa.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:8 → Pwt 25:17–19</strong>: Pamięć o podstępnym ataku Amaleka na tyły zmęczonej kolumny Izraela.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:11–12 → Hbr 7:25</strong>: Nieustanne wstawiennictwo Chrystusa, którego ręce nigdy nie opadają przed Ojcem.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 17:15 → Rz 8:37</strong>: Ołtarz Jahwe Nissi — pod sztandarem Chrystusa jesteśmy więcej niż zwycięzcami.</div>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── SPRAWDŹ W BIBLII ── -->[\s\S]*?<!-- ── PRAWDA NA DZIŚ ── -->/,
  `${compareVersesHtml}\n\n      <!-- ── PRAWDA NA DZIŚ ── -->`
);

// Prawda na dziś
const truthTodayHtml = `<!-- ── PRAWDA NA DZIŚ ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Prawda na dziś</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          4 Filary Refidim i Horebu — Co zmienia się w Twojej walce i zaufaniu?
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>Bóg jest obecny w dolinie braku:</strong> Pustynia Refidim uczy nas, że brak widzialnych środków nie oznacza nieobecności Boga. Bóg potrafi uczynić źródło w najbardziej jałowym granicie naszego życia.</p>
          <p>• <strong>Chrystus jedynym nasyceniem duszy:</strong> Żadne ziemskie źródła nie ugaszą głodu i pragnienia wieczności. Tylko uderzona Skała — Chrystus ukrzyżowany i zmartwychwstały — daje pokój i Ducha Świętego.</p>
          <p>• <strong>Duchowa walka wymaga modlitwy i wspólnoty:</strong> Sukces w dolinie zależy od wzniesionych rąk na wzgórzu. Nikt nie wygra bitwy w samotności — potrzebujemy braci i sióstr, takich jak Aaron i Chur, którzy podtrzymają nas w modlitwie.</p>
          <p>• <strong>Zwycięstwo pod sztandarem Jahwe Nissi:</strong> Nasza siła nie leży w ludzkich mieczach, lecz w imieniu Jezusa Chrystusa, który zwyciężył świat.</p>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── PRAWDA NA DZIŚ ── -->[\s\S]*?<!-- ── POMYŚL ── -->/,
  `${truthTodayHtml}\n\n      <!-- ── POMYŚL ── -->`
);

// Pomyśl
const thinkHeartHtml = `<!-- ── POMYŚL ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-heart"></i>
          <span>Pytania do serca (Pomyśl)</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (Wj 17:1–16)
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w obliczu trudności i braków nie ulegasz pokusie pytania: „Czy Pan jest ze mną, czy nie?” (Wj 17:7)?</p>
          <p>2. Do jakich źródeł biegniesz najpierw, gdy Twoja dusza odczuwa duchowe pragnienie i znużenie?</p>
          <p>3. Jak wygląda Twoje orędownictwo w chwilach życiowych bitew — czy Twoje ręce są wzniesione ku niebu?</p>
          <p>4. Kto w Twojej wspólnocie lub rodzinie potrzebuje dziś podtrzymania opadających rąk w modlitwie (Wj 17:12)?</p>
          <p>5. Czy Twoje codzienne wybory stoją pod sztandarem Chrystusa — Jahwe Nissi (Wj 17:15)?</p>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── POMYŚL ── -->[\s\S]*?<!-- ── QUIZ ── -->/,
  `${thinkHeartHtml}\n\n      <!-- ── QUIZ ── -->`
);

// Quiz nagłówek
html = html.replace(/20 Pytań z Wj 16 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 17 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 16 odpowiedz/g, `Po przeczytaniu Wj 17 odpowiedz`);

// Twoja decyzja
const yourDecisionHtml = `<section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-flag-checkered"></i>
          <span>Twoja decyzja</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Porzuć Zwątpienie — Pij ze Skały Chrystusa i Walcz pod Jego Sztandarem!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Siedemnasty rozdział Księgi Wyjścia stawia przed każdym uczniem Jezusa radykalne wezwanie wiary: czy pozwolisz, by bezwodna pustynia i ataki przeciwnika wywołały w Tobie bunt i zwątpienie w obecność Boga?
          </p>
          <p>
            Bóg nie opuścił Cię w dolinie Refidim. On sam stanął na Skale, wziął na Siebie cios sądu i otworzył dla Ciebie niewyczerpane źródła Ducha Świętego. Równocześnie wzywa Cię do wytrwałej modlitwy ze wzniesionymi rękami i do budowania braterskiej wspólnoty wiary.
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Osobiste Wyznanie Decyzji:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, moja duchowa Skało i wieczny Orędowniku! Wyrzekam się szemrania Massa i Meriba oraz wszelkiego zwątpienia w Twoją obecność. Wyznaję Cię jako moje jedyne źródło wody żywej. Podnoszę dziś ręce ku niebu w modlitwie i staję do walki pod Twoim zwycięskim sztandarem — Jahwe Nissi!”
            </p>
          </div>
        </div>
      </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>[\s\S]*?<\/section>\s*<!-- ── MODLITWA ── -->/,
  `${yourDecisionHtml}\n\n      <!-- ── MODLITWA ── -->`
);

// Modlitwa
const prayerHtml = `<!-- ── MODLITWA ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-hands-praying"></i>
          <span>Modlitwa na 16 listopada</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Wodę Żywą, Wytrwałość we Wstawiennictwie i Zwycięstwo pod Sztandarem Jahwe Nissi
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Święty, Wszechmogący i Łaskawy Boże, Ojcze naszego Pana Jezusa Chrystusa!
            Z głębi serca dziękujemy Ci za potężne poselstwo siedemnastego rozdziału Księgi Wyjścia. Dziękujemy, że jesteś Bogiem, który nie opuszcza swoich dzieci w bezwodnych dolinach i który z twardego granitu potrafi wyprowadzić rzekę żywej wody.
          </p>
          <p>
            Wybacz nam, Panie, każdą chwilę, w której wątpiliśmy w Twoją obecność i pytaliśmy zuchwale: „Czy Pan jest z nami?”. Wybacz nam szemranie przeciwko Twojemu prowadzeniu i szukanie ratunku w iluzjach dawnego życia.
          </p>
          <p>
            Panie Jezu Chryste, Ty jesteś naszą uderzoną Skałą i źródłem Wody Żywej! Napełnij nasze serca Twoim Duchem Świętym. Podtrzymaj nasze opadające ręce w chwilach znużenia i duchowej walki. Postaw na naszej drodze wiernych braci i siostry, abyśmy wspólnie trwali w modlitwie aż do ostatecznego zwycięstwa. Wznieś nad naszym życiem, naszymi rodzinami i naszą misją Twój niezawodny sztandar miłości i triumfu — Jahwe Nissi! W Twoje Najświętsze Imię modlimy się. Amen!
          </p>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── MODLITWA ── -->[\s\S]*?<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS/,
  `${prayerHtml}\n\n      <!-- ── ZASTOSOWANIE I TWÓJ ZAPIS`
);

// Przycisk oznaczenia dnia ukończonego
html = html.replace(/<span>Dzień 46 jako ukończony<\/span>/g, `<span>Dzień 47 jako ukończony</span>`);
html = html.replace(/Oznacz Dzień 46 jako ukończony/g, `Oznacz Dzień 47 jako ukończony`);

// 7 Zadań w Zastosowaniu
html = html.replace(
  /<!-- ── 7 KROKÓW ZASTOSOWANIA ── -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- ── DWA POLA DO ZAPISU ── -->/,
  `<!-- ── 7 KROKÓW ZASTOSOWANIA ── -->
        <div class="space-y-3">
          <h3 class="font-display font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-brand-gold"></i>
            7 KROKÓW ZASTOSOWANIA NA DZIŚ:
          </h3>
          <div class="grid grid-cols-1 gap-2 text-xs sm:text-sm text-zinc-300 font-serif">
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>1. Przeczytaj osobiście cały siedemnasty rozdział Księgi Wyjścia (Wj 17:1–16) w przekładzie UBG.</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>2. Zbadaj 1 List do Koryntian 10:4 i podziękuj Jezusowi za to, że jest Twoją Duchową Skałą.</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>3. Wyznaj Bogu każdą sytuację zwątpienia i pytania: „Czy Pan jest ze mną, czy nie?” (Wj 17:7).</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>4. Zidentyfikuj duchowego „Amaleka” w Twoim życiu powszednim i stań do walki w imieniu Jezusa.</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>5. Znajdź dzisiaj brata lub siostrę, których „ręce opadają”, i podtrzymaj ich w modlitwie (Wj 17:12).</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>6. Zapisz w dzienniku jedno Boże zwycięstwo, budując ołtarz Jahwe Nissi (Wj 17:14–15).</span>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
              <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
              <span>7. Naucz się na pamięć tekstu pamięciowego: Wj 17:6.</span>
            </label>
          </div>
        </div>
        <!-- ── DWA POLA DO ZAPISU ── -->`
);

// Podmieniamy sekcję Jutro na Dzień 48
html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->[\s\S]*?<\/section>\s*<\/div>\s*<\/main>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->
      <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 17 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 48 — ODWIEDZINY JETRY I MĄDRA RADA: DECENTRALIZACJA I SŁUŻBA WSPÓLNOTY (WJ 18:1–27)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 48: Spotkanie Mojżesza z teściem Jetrą na pustyni, radość z ocalenia z Egiptu, ofiary dla Boga oraz mądra rada podziału odpowiedzialności i ustanowienia przełożonych nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>DOSTĘPNE JUTRO O 00:00</span>
          </span>
        </div>
      </section>
    </div>
  </main>`
);

// Podmieniamy QUIZ_DATA i DAY_KEY w skrypcie
const quizDataJson = [
  {
    "q": "Skąd wyruszyło całe zgromadzenie synów Izraela przed przybyciem do Refidim (Wj 17:1)?",
    "a": [
      "Z oazy Elim",
      "Z pustyni Sin, robiąc postoje według rozkazu PANA",
      "Z krainy Goszen",
      "Bezpośrednio z brzegu Morza Czerwonego"
    ],
    "c": 1
  },
  {
    "q": "Czego zabrakło synom Izraela po rozbiciu obozu w Refidim (Wj 17:1)?",
    "a": [
      "Manna przestała padać",
      "Nie było wody, aby lud mógł się napić",
      "Zabraknęło namiotów i drewna",
      "Padły wszystkie stada bydła"
    ],
    "c": 1
  },
  {
    "q": "Jakie żądanie skierował zdesperowany lud do Mojżesza w Wj 17:2?",
    "a": [
      "„Poprowadź nas z powrotem do Egiptu!”",
      "„Dajcie nam wody, abyśmy się napili”",
      "„Zbudujmy studnię w dolinie”",
      "„Rozdziel skały swoim mieczem”"
    ],
    "c": 1
  },
  {
    "q": "O co zapytał Mojżesz kłócący się z nim lud w Wj 17:2?",
    "a": [
      "„Gdzie podziało się wasze złoto?”",
      "„Dlaczego kłócicie się ze mną? Czemu wystawiacie PANA na próbę?”",
      "„Czy zapomnieliście o plagach egipskich?”",
      "„Kto z was potrafi znaleźć źródło?”"
    ],
    "c": 1
  },
  {
    "q": "Jakie dramatyczne oskarżenie lud wysunął przeciwko Mojżeszowi w Wj 17:3?",
    "a": [
      "Że ukradł zapasy manny",
      "„Po co wyprowadziłeś nas z Egiptu, aby uśmiercić nas, nasze dzieci i nasze bydło pragnieniem?”",
      "Że zgubił drogę do Kanaanu",
      "Że zawarł przymierze z Amalekitami"
    ],
    "c": 1
  },
  {
    "q": "Co zaniepokojony Mojżesz wykrzyknął w modlitwie do PANA w Wj 17:4?",
    "a": [
      "„Zgładź ten buntowniczy naród!”",
      "„Cóż mam uczynić z tym ludem? Jeszcze trochę, a mnie ukamienują”",
      "„Pozwól mi uciec do krainy Midian!”",
      "„Ześlij deszcz z obłoków nad obozem”"
    ],
    "c": 1
  },
  {
    "q": "Kogo PAN nakazał wziąć Mojżeszowi ze sobą przed wyruszeniem do skały (Wj 17:5)?",
    "a": [
      "Wszystkich wojowników z pokolenia Judy",
      "Niektórych ze starszych Izraela",
      "Całą rodzinę faraona",
      "Tylko i wyłącznie Aarona i Chura"
    ],
    "c": 1
  },
  {
    "q": "Co Mojżesz miał wziąć w rękę na rozkaz Boży (Wj 17:5)?",
    "a": [
      "Złoty kielich ofiarny",
      "Swoją laskę, którą uderzył w rzekę Nil",
      "Kamienne tablice przymierza",
      "Miedzianego węża na drzewcu"
    ],
    "c": 1
  },
  {
    "q": "Gdzie PAN obiecał stanąć przed Mojżeszem przed wydobyciem wody (Wj 17:6)?",
    "a": [
      "W płonącym krzewie w dolinie",
      "Na skale na Horebie",
      "W bramie Namiotu Zgromadzenia",
      "Na szczycie góry Synaj pośród gromów"
    ],
    "c": 1
  },
  {
    "q": "Co stało się, gdy Mojżesz uderzył w skałę na oczach starszych Izraela (Wj 17:6)?",
    "a": [
      "Skała rozpadła się w drobny proch",
      "Wypłynęła z niej woda, którą lud pił",
      "Z wnętrza skały buchnął ogień Boży",
      "Otworzyła się głęboka przepaść"
    ],
    "c": 1
  },
  {
    "q": "Jakie dwie nazwy nadał Mojżesz miejscu wytryśnięcia wody (Wj 17:7)?",
    "a": [
      "Elim i Mara",
      "Massa i Meriba",
      "Beer-Szeba i Betel",
      "Gilgal i Sziloh"
    ],
    "c": 1
  },
  {
    "q": "Jakie dramatyczne pytanie zadał Izrael, z powodu którego nadano nazwę Massa (Wj 17:7)?",
    "a": [
      "„Kto wprowadzi nas do ziemi obiecanej?”",
      "„Czy PAN jest wśród nas, czy nie?”",
      "„Gdzie podział się Bóg Abrahama?”",
      "„Dlaczego Mojżesz nie daje nam mięsa?”"
    ],
    "c": 1
  },
  {
    "q": "Jaki wróg nadciągnął nagle, aby walczyć z Izraelem w Refidim (Wj 17:8)?",
    "a": [
      "Król Moabu z rydwanami",
      "Amalek",
      "Filistyni z pięciu miast",
      "Wojska asyryjskie"
    ],
    "c": 1
  },
  {
    "q": "Kogo Mojżesz wyznaczył do poprowadzenia mężów do bitwy przeciw Amalekowi (Wj 17:9)?",
    "a": [
      "Aarona",
      "Jozuego",
      "Chura",
      "Kaleba"
    ],
    "c": 1
  },
  {
    "q": "Gdzie stanął Mojżesz podczas bitwy z Amalekiem i co trzymał w ręku (Wj 17:9)?",
    "a": [
      "W pierwszym szeregu walczących z mieczem",
      "Na szczycie wzgórza z laską Boga w ręku",
      "W namiocie modlitwy z kadzielnicą",
      "U stóp ołtarza na Horebie"
    ],
    "c": 1
  },
  {
    "q": "Kto wszedł na szczyt wzgórza razem z Mojżeszem (Wj 17:10)?",
    "a": [
      "Jozue i Kaleb",
      "Aaron i Chur",
      "Miriam i Eleazar",
      "Siedemdziesięciu starszych Izraela"
    ],
    "c": 1
  },
  {
    "q": "Jaka duchowa zależność ujawniła się podczas bitwy pod Refidim (Wj 17:11)?",
    "a": [
      "Im głośniej trąbiono w rogi, tym szybciej uciekał Amalek",
      "Gdy Mojżesz podnosił rękę, przeważał Izrael, a gdy opuszczał rękę, przeważał Amalek",
      "Pozycja słońca na niebie decydowała o sile Jozuego",
      "Przewaga zależała od liczby łuczników"
    ],
    "c": 1
  },
  {
    "q": "Co uczynili Aaron i Chur, gdy ręce Mojżesza stały się ociężałe (Wj 17:12)?",
    "a": [
      "Zastąpili Mojżesza i sami zeszli do walki na miecze",
      "Podłożyli kamień, na którym usiadł, i podpierali jego ręce z obu stron aż do zachodu słońca",
      "Związali ręce Mojżesza sznurem do drewnianego pala",
      "Wezwali całe wojsko do natychmiastowego odwrotu"
    ],
    "c": 1
  },
  {
    "q": "Jaki nakaz PAN skierował do Mojżesza po zwycięstwie nad Amalekiem (Wj 17:14)?",
    "a": [
      "Aby wzniósł złoty posąg upamiętniający wierność Jozuego",
      "Zapisz to na pamiątkę w księdze i powtórz do uszu Jozuego",
      "Aby natychmiast zawarł pokój z synami Ezawa",
      "Aby złożył w ofierze całe bydło zdobyte na wrogu"
    ],
    "c": 1
  },
  {
    "q": "Jaką nazwę Mojżesz nadał ołtarzowi wzniesionemu po zwycięstwie w Refidim (Wj 17:15)?",
    "a": [
      "Betel — Dom Boży",
      "PAN moją chorągwią (Jahwe Nissi)",
      "Ebenezer — Aż dotąd pomagał nam PAN",
      "Jahwe Szalom — PAN pokojem"
    ],
    "c": 1
  }
];

html = html.replace(
  /\/\/ ── QUIZ LOGIC[\s\S]*?const DAY_KEY = 'kc_day46';/,
  `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 17:1–16) ──\n    const QUIZ_DATA = ${JSON.stringify(quizDataJson, null, 2)};\n    const DAY_KEY = 'kc_day47';`
);

// Zmiana referencji dnia i ukończenia
html = html.replace(
  /const u = new SpeechSynthesisUtterance\([\s\S]*?\);/,
  `const u = new SpeechSynthesisUtterance("Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił. I Mojżesz uczynił tak na oczach starszych Izraela. (Księga Wyjścia 17:6)");`
);
html = html.replace(/Znasz na wskroś 16\. rozdział Księgi Wyjścia!/g, `Znasz na wskroś 17. rozdział Księgi Wyjścia!`);
html = html.replace(/completeDay46/g, `completeDay47`);
html = html.replace(/Dzień 46 ukończony!/g, `Dzień 47 ukończony!`);
html = html.replace(/day46_/g, `day47_`);
html = html.replace(/kc_day46_/g, `kc_day47_`);

// Zapisujemy Dzień 47 w 8 ścieżkach
const paths47 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-47.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-47/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-47.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-47/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-47.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-47/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-47.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-47/index.html'
];

for (const p of paths47) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 8 kompletnych kopii HTML Dnia 47 z 40 punktami egzegetycznymi!');

// ── 7. AKTUALIZACJA DNIA 46 (ŁĄCZNIK DO DNIA 47) ──
console.log('🔗 Aktualizuję Dzień 46 (link nawigacji i sekcję Jutro)...');
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
  if (fs.existsSync(p)) {
    let content46 = fs.readFileSync(p, 'utf8');
    // Górny pasek nawigacji
    content46 = content46.replace(
      /<span class="px-3 py-1.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-\[44px\]">\s*<span>Dzień 47 \(Poniedziałek\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-47" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition min-h-[44px]">
          <span>Dzień 47 (Poniedziałek) →</span>
        </a>`
    );
    // Sekcja Jutro
    content46 = content46.replace(
      /<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-\[44px\]">\s*<span>DOSTĘPNE JUTRO O 00:00<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-47" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8C33] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 transition min-h-[44px]">
            <span>STUDIUJ DZIEŃ 47 TERAZ →</span>
          </a>`
    );
    fs.writeFileSync(p, content46, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania w Dniu 46!');

// ── 8. AKTUALIZACJA KOLEJKI PUBLIKACJI I BAZY ROZWAŻAŃ ──
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
  contentSms: 'Dzień 47 (Wj 17:6): „Oto stanę przed tobą na skale... i wypłynie z niej woda”. Twoją Skałą jest Chrystus. Zwyciężaj pod sztandarem Jahwe Nissi! polskieradio.cc',
  tvScript: pakiet5wersji.split('WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)')[0].trim(),
  ccnArticle: pakiet5wersji.split('WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1].trim(),
  imageUrl: `/images/academy/daily/kc_day_${DAY_NUM}_woda_ze_skaly_i_zwyciestwo_nad_amalekiem.jpg`,
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
  if (!currentBaza.includes(`Dzień ${DAY_NUM} (16 listopada 2026)`)) {
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

console.log('🎉 Kompletne generowanie i synchronizacja lekcji Dnia 47 zakończona sukcesem!');
