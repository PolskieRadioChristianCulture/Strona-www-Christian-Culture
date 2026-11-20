import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from 'docx';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const DAY_NUM = 51;
const DATE_STR = '2026-11-20';
const DATE_FORMATTED = '20 LISTOPADA 2026 R. (PIĄTEK)';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 21:1–36';
const TITLE =
  'PRAWO PRZYMIERZA — GODNOŚĆ SŁUGI, OCHRONA ŻYCIA I SPRAWIEDLIWOŚĆ SPOŁECZNA';
const SUBTITLE =
  'Pierwsze ustawy Księgi Przymierza u stóp Synaju: wolność sług hebrajskich w siódmym roku, ochrona kobiet i dzieci, odróżnienie zabójstwa od przypadku, zasada proporcjonalnej sprawiedliwości oraz odpowiedzialność za bliźniego i jego mienie (Wj 21:1–36)';

const EXO21_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-021.json');
const exo21Data = JSON.parse(fs.readFileSync(EXO21_PATH, 'utf8'));
const verses = exo21Data.verses;

const v2 = verses.find((v) => v.number === 2)?.text || '';
const MEMORY_VERSE_QUOTE = v2.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 21:2 (UBG)`;

const THEME =
  'Dwudziesty pierwszy rozdział Księgi Wyjścia otwiera tak zwaną Księgę Przymierza (Wj 21–23), przekładając wzniosłe zasady Dekalogu na konkretne sytuacje codziennego życia narodu. Bóg nie zaczyna ustaw cywilnych od przywilejów władców ani podatków świątynnych, lecz od ochrony najsłabszych: zadłużonego sługi hebrajskiego, wykupionej córki, kobiet i dzieci, nienarodzonego życia oraz ofiar cudzego zaniedbania. Niewolnik hebrajski ma po sześciu latach pracy wyjść na wolność bez wykupu, a pozostać na stałe może jedynie wtedy, gdy z miłości do swego pana i rodziny dobrowolnie przekłuje ucho przy drzwiach. Równie jasno Bóg broni świętości życia, odróżnia zbrodnię z premedytacją od niezamierzonego wypadku, potępia handel ludźmi karą śmierci i ustanawia regułę „oko za oko” nie jako przyzwolenie na prywatną zemstę, lecz jako sądowe ograniczenie kary do rzeczywistej szkody. Nad całą księgą unosi się zapowiedź Jezusa Chrystusa — Tego, który przyjął postać sługi (Flp 2:7), został zdradzony za trzydzieści srebrników jak cena sługi z Wj 21:32 (Mt 26:15) i oddał samego Siebie na okup (kopher) za nasze życie (Mt 20:28)!';

const IMG_FILENAME = 'kc_day_51_prawa_przymierza_godnosc_zycia.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

if (!fs.existsSync(path.join(REPO, IMG_REL_PATH))) {
  throw new Error(`Brak przygotowanego obrazu Dnia 51: ${IMG_REL_PATH}`);
}

// Budowa sekcji Pisma Świętego UBG z EXO-021.json
function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 21:1–11 — Ustawy o sługach hebrajskich, wolności w siódmym roku i ochronie kobiet',
      from: 1,
      to: 11,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 21:12–27 — Ochrona życia ludzkiego, miasto schronienia, zakaz uprowadzenia i zasada proporcjonalnej sprawiedliwości',
      from: 12,
      to: 27,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 21:28–36 — Odpowiedzialność za szkodę, trzydzieści syklów srebra i obowiązek zabezpieczenia zagrożeń',
      from: 28,
      to: 36,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
  ];

  return sections
    .map((sec) => {
      const header = `<div class="${sec.extraClass}"><h3 class="font-bold text-amber-300 text-sm">${sec.heading}</h3></div>`;
      const ps = verses
        .filter((v) => v.number >= sec.from && v.number <= sec.to)
        .map(
          (v) =>
            `<p><span class="verse-num">21:${v.number}</span> ${v.text}</p>`
        )
        .join('\n        ');
      return `${header}\n        ${ps}`;
    })
    .join('\n        ');
}

function buildVersesDocxText() {
  return verses.map((v) => `${v.number}. ${v.text}`).join('\n');
}

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ (Standard Antigravity) ──
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Pierwszy

**Czy zdajesz sobie sprawę, że zaraz po ogłoszeniu Dziesięciu Przykazań Bóg zaczął spisywać codzienne prawo nie od przywilejów królów i bogaczy, lecz od obrony sługi, kobiety i bezbronnego dziecka?**

Zatrzymaj się w ten piątkowy poranek, dwudziestego listopada dwa tysiące dwudziestego szóstego roku. Zanim wejdziesz w rytm kończącego się tygodnia, spójrz na swoje relacje z ludźmi, nad którymi masz wpływ, oraz z tymi, którym na co dzień służysz. Często łatwo deklarujemy przywiązanie do wielkich haseł o miłości i sprawiedliwości, a jednocześnie przechodzimy obojętnie obok cudzego zmęczenia, niedopilnowanej odpowiedzialności albo krzywdy słabszego. W ciszy porannej modlitwy zadaj dziś szczere pytanie swojemu Ojcu: Tato, dlaczego tak szybko oddzielam wielkie prawdy o Twojej świętości od tego, jak traktuję najbliższych, współpracowników i tych, którzy nie potrafią sami obronić swojej godności?

W dwudziestym pierwszym rozdziale Księgi Wyjścia Izrael schodzi ze szczytów teologii pod Synajem prosto w codzienność sąsiedztwa, pracy i sporów międzyludzkich. Pan podaje Mojżeszowi pierwsze ustawy Przymierza. Zwróć uwagę na kolejność Bożego serca: pierwszym tematem jest los zadłużonego sługi hebrajskiego, który ma prawo wyjść na wolność w siódmym roku bez żadnego wykupu. Jeśli jednak taki sługa z miłości do swego pana, żony i dzieci sam wybiera pozostanie w domu pana, staje przed drzwiami, otrzymuje znak przekłutego ucha i służy już nie z przymusu długu, lecz z dobrowolnego oddania. Dalej Bóg broni godności kobiet i córek przed porzuceniem oraz niesprawiedliwym handlem, wyraźnie rozróżnia nieumyślny wypadek od podstępnego zabójstwa, nakłada karę śmierci na porywaczy ludzi i ustanawia surową odpowiedzialność za bezpieczeństwo kobiety brzemiennej oraz jej dziecka. Nawet tak często źle rozumiana zasada oko za oko nie była zachętą do prywatnej zemsty, lecz sądową tamą chroniącą słabszych przed okrutnym odwetem silniejszych. Co więcej, jeśli pan uderzył sługę i wybił mu oko albo ząb, musiał natychmiast wypuścić go na wolność. A na końcu rozdziału Bóg uczy, że odpowiadamy również za niezabezpieczoną studnię czy niebezpieczne zwierzę, a życie sługi oszacowano na trzydzieści syklów srebra.

Psychologia odpowiedzialności moralnej i dojrzałego przywództwa potwierdza, że prawdziwy charakter człowieka ujawnia się nie wobec przełożonych, od których zależy jego awans, lecz wobec osób słabszych, zależnych i bezbronnych. Kto ma na uwadze ludzką godność i bierze pełną odpowiedzialność za szkody wyrządzone własnym zaniedbaniem, ten buduje wspólnotę zaufania i pokoju.

Prawda Królestwa uderza z wyzwalającą mocą: Jezus Chrystus, wieczny Syn Boży, sam przyjął postać sługi, pozwolił przybić Swoje ciało do drzewa krzyża jak sługa z miłości do nas i został wyceniony przez świat na dokładnie trzydzieści srebrników, aby stać się naszym doskonałym okupem i obdarzyć nas prawdziwą wolnością dzieci Bożych!

Jezus mówi dziś do Ciebie:
„Tak jak Syn Człowieczy nie przyszedł, aby mu służono, ale aby służyć i oddać swoje życie na okup za wielu.” (Ewangelia według świętego Mateusza, rozdział dwudziesty, werset dwudziesty ósmy, UBG) oraz „Wiedząc, że nie tym, co zniszczalne, srebrem lub złotem, zostaliście wykupieni z waszego marnego postępowania przekazanego przez ojców; Lecz drogą krwią Chrystusa jako baranka niewinnego i nieskalanego.” (Pierwszy List świętego Piotra, rozdział pierwszy, wersety osiemnasty i dziewiętnasty, UBG)

Zadanie Taktyczne:
Na swoim piątkowym posterunku spójrz dziś uważnie na ludzi zależnych od Twoich decyzji, słów lub zaniedbań. Zrezygnuj dzisiaj z wymówek, przerzucania winy na okoliczności oraz ostrego tonu wobec słabszych. Wybierz jeden konkretny gest sprawiedliwości, napraw jedno drobne zaniedbanie w domu lub pracy i wyznaj z wdzięcznością: Zostałem wykupiony drogą krwią Sługi, Jezusa Chrystusa, dlatego z miłości chcę strzec godności, życia i bezpieczeństwa każdego bliźniego!

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za Twoją sprawiedliwość, która nie zapomina o sługach, kobietach, nienarodzonych dzieciach ani o żadnym człowieku stworzonym na Twój obraz. Przepraszam Cię za chwile mojej obojętności, pośpiechu i zaniedbań, przez które inni musieli ponosić konsekwencje mojego braku uwagi albo gniewu. Panie Jezu Chryste, Ty dobrowolnie przyjąłeś postać sługi i oddałeś swoje życie na okup za mój dług. Zapisz na moich uszach i w moim sercu gotowość do wiernej, dobrowolnej służby z miłości do Ciebie. Naucz mnie brać pełną odpowiedzialność za moje słowa, pracę i troskę o słabszych. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Otwórz swoje serce na sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Wejdź do wspólnoty ludzi z pasją, buduj codzienny nawyk czytania Pisma Świętego i każdego dnia wzrastaj w poznaniu Jezusa Chrystusa.

Błogosławieństwo:
Niech Pan zastępów obdarzy Cię sercem wrażliwym na prawdę i miłosierdzie, niech strzeże Twego domu od wszelkiej szkody i prowadzi Cię w wolności odkupionych dzieci Bożych. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 51 (20 listopada 2026 r.)
📖 Księga Wyjścia 21:1–36: Prawo Przymierza — Godność Sługi, Ochrona Życia i Sprawiedliwość Społeczna

Czy wiesz, że po ogłoszeniu Dekalogu na Synaju Bóg rozpoczął szczegółowe prawo cywilne Izraela nie od pałaców, lecz od wolności sług i obrony najsłabszych?

W 51. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) schodzimy ze szczytu góry Synaj w codzienność Księgi Przymierza (Wj 21:1–36: https://polskieradio.cc/mojabiblia?book=EXO&chapter=21). Zamiast zimnych paragrafów odkrywamy tu serce Boga, który broni zadłużonych sług (uwolnienie w 7. roku bez wykupu), kobiet i dzieci, odróżnia zbrodnię z premedytacją od wypadku, zakazuje handlu ludźmi i nakazuje brać pełną odpowiedzialność za szkody wyrządzone zaniedbaniem. Wybieraj dzisiaj świadomie: chroń godność słabszych i bierz odpowiedzialność za bezpieczeństwo tych, których Bóg stawia na Twojej drodze!

Kluczowe filary dzisiejszego studium:
1. Wolność Sługi i Miłość przy Drzwiach (Wj 21:1–6): Sługa hebrajski wychodził na wolność w 7. roku bez wykupu (Wj 21:2), a na stałe mógł zostać tylko z dobrowolnej miłości do pana i rodziny.
2. Ochrona Kobiet, Życia i Nienarodzonych (Wj 21:7–25): Prawo chroniło wykupione córki przed porzuceniem, karało śmiercią uprowadzenie człowieka, zapewniało ochronę dziecku w łonie matki oraz ograniczało wyrok sądowy do sprawiedliwej miary („oko za oko”), wykluczając prywatną zemstę.
3. Odpowiedzialność za Zaniedbania i Zapowiedź Okupu (Wj 21:26–36): Nawet uderzony sługa zyskiwał natychmiastową wolność (w. 26–27), niezabezpieczona studnia wymagała zadośćuczynienia (w. 33–34), a życie sługi wycenione na 30 syklów srebra (w. 32) zapowiadało zdradę i odkupieńczą ofiarę Jezusa Chrystusa (Mt 26:15; Mt 20:28).

Jezus mówi dziś do Ciebie:
„Tak jak Syn Człowieczy nie przyszedł, aby mu służono, ale aby służyć i oddać swoje życie na okup za wielu.” (Mt 20:28, UBG) | „Wiedząc, że nie tym, co zniszczalne, srebrem lub złotem, zostaliście wykupieni... Lecz drogą krwią Chrystusa jako baranka niewinnego i nieskalanego.” (1 P 1:18–19, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 21:1–36 oraz Flp 2:5–11 i Mt 5:38–42.
• Wierz: Jezus Chrystus przyjął postać Sługi i zapłacił pełny okup za Twoją wolność.
• Działaj: Zadbaj dziś o sprawiedliwe traktowanie słabszych i napraw jedną sprawę lub zaniedbanie, za które ponosisz odpowiedzialność.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-51

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://patronite.pl/osobowoscplus`;

const v3SmsText = `Dzień 51 (Wj 21:2): „sześć lat będzie ci służyć, a w siódmym roku wyjdzie na wolność bez wykupu”. Bóg broni słabszych, a Chrystus Sługa zapłacił za nas okup! Dobrej nocy. polskieradio.cc`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi fotorealistyczna ilustracja 16:9: o złotym świcie u podnóża góry Synaj stary drewniany słupek drzwiowy skromnego domostwa, a obok na płaskim kamieniu starożytna waga sprawiedliwości z brązu i rozwinięty zwój Prawa. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 51: PRAWO PRZYMIERZA — GODNOŚĆ SŁUGI I OCHRONA ŻYCIA (WJ 21:1–36)”.

[INTRO: OD TABLIC DEKALOGU DO CODZIENNEGO SĄSIEDZTWA]
Noemi: Dzień dobry! Witamy serdecznie w pięćdziesiątym pierwszym dniu naszej codziennej podróży przez sześćdziesiąt sześć ksiąg Biblii! Wczoraj zatrzymaliśmy się przy Dziesięciu Przykazaniach w dwudziestym rozdziale Księgi Wyjścia, a dziś razem z Mojżeszem schodzimy z góry prosto w realia codziennego życia w dwudziestym pierwszym rozdziale!
Sara: Witaj Noemi, witamy całą wspólnotę Christian Culture TV! Gdyby ktoś dzisiaj pisał konstytucję nowego państwa, od czego by zaczął? Pewnie od władzy króla, podatków albo armii. A spójrzmy, od kogo zaczyna Bóg w pierwszym wersecie praw Przymierza: od ochrony najuboższego, zadłużonego niewolnika hebrajskiego!
Noemi: Dokładnie tak! Bóg nie zamyka Dekalogu w gablocie za szkłem. Od razu pokazuje, jak miłość Boga i bliźniego ma działać wtedy, gdy ktoś wpada w długi, gdy w domu rodzą się spory, gdy ktoś jest słaby, bezbronny albo gdy sąsiad zostawi niezakrytą studnię na podwórku!

[ANALIZA PROBLEMOWA: GODNOŚĆ SŁUGI, OBRONA ŻYCIA I MIARA SPRAWIEDLIWOŚCI]
Sara: Zobaczmy tę niezwykłą scenę z wersetów od drugiego do szóstego! Jeśli Hebrajczyk z biedy musiał odpracować dług, po sześciu latach wychodził na wolność za darmo, bez wykupu. A jeśli sam powiedział: „Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność”, pan przyprowadzał go przed sędziów do drzwi domu i przekłuwał mu ucho. To znak dobrowolnego przymierza z miłości, a nie niewoli ze strachu!
Noemi: A dalej rozdział dwudziesty pierwszy stawia potężną tamę przed przemocą i nadużyciami. Porywacze i handlarze ludźmi podlegali karze śmierci, podobnie jak mordercy z premedytacją — nie chronił ich nawet ołtarz! Natomiast dla nieumyślnego sprawcy wypadku Bóg wyznacza miejsce ucieczki. I co niezwykle ważne dla współczesnego świata: w wersetach dwudziestym drugim i dwudziestym trzecim Bóg wprost chroni kobietę brzemienną i jej dziecko!
Sara: Wiele osób mylnie cytuje też z tego rozdziału słowa „oko za oko, ząb za ząb”. Tymczasem w tamtym starożytnym świecie ten przepis nie był zachętą do prywatnej zemsty, lecz sądową granicą! Bogaty nie mógł odebrać życia biednemu za wybity ząb — kara musiała być sprawiedliwa, a jeśli pan uderzył sługę w oko albo wybił mu ząb, musiał natychmiast wypuścić go na wolność!

[SŁOWO ROZKAZU: PERSPEKTYWA BIBLIJNA I CHRYSTUS SŁUGA]
Noemi: I spójrzmy na niesamowitą nić prowadzącą z dwudziestego pierwszego rozdziału Księgi Wyjścia wprost pod krzyż Golgoty! W wersecie trzydziestym pojawia się hebrajskie słowo *kopher* — okup za życie, a w wersecie trzydziestym drugim czytamy, że życie zabitego sługi wyceniano na trzydzieści syklów srebra!
Sara: Trzydzieści srebrników... dokładnie tyle, ile za Jezusa Chrystusa odważono Judaszowi według Ewangelii Mateusza dwudziestego szóstego rozdziału! Wieczny Syn Boży, który przyjął postać sługi z Listu do Filipian, pozwolił oszacować się jak sługa za trzydzieści srebrników i powiedział: „Syn Człowieczy nie przyszedł, aby mu służono, ale aby służyć i oddać swoje życie na okup za wielu”. A w Kazaniu na Górze nauczył nas nie tylko ograniczać zemstę, ale odpowiadać dobrem i łaską!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak więc wprowadzić dzisiejsze Słowo w ten piątek?
• Czytaj: dwudziesty pierwszy rozdział Księgi Wyjścia oraz drugi rozdział Listu do Filipian.
• Wierz: Chrystus przyjął postać Sługi i złożył za Ciebie okup krwią bezcenną, abyś żył w prawdziwej wolności.
• Działaj: spójrz dziś uważnie, gdzie w pracy, w domu albo w sąsiedztwie możesz obronić godność słabszego i wziąć odpowiedzialność za własne zaniedbania!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Panie Boże, Ty jesteś sprawiedliwym Sędzią i Obrońcą słabych, sług, matek i dzieci. Przepraszamy Cię za każdą obojętność wobec ludzkiej krzywdy oraz za sytuacje, w których uciekaliśmy od odpowiedzialności za skutki naszych słów i czynów.
Noemi: Panie Jezu Chryste, Ty stałeś się Sługą i oddałeś swoje życie na okup za nasze grzechy, choć świat wycenił Cię na trzydzieści srebrników. Otwórz nasze uszy na Twój głos i naucz nas służyć z czystej miłości Tobie oraz bliźnim. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech Pan strzeże Twojego serca w prawdzie, sprawiedliwości i łasce przez cały ten piątek!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym drugim rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: KSIĘGA PRZYMIERZA (WJ 21:1–36) — DLACZEGO BIBLIJNE PRAWO CYWILNE ZACZYNA SIĘ OD GODNOŚCI SŁUGI I OCHRONY ŻYCIA?
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 20 listopada 2026 r.

Dwudziesty pierwszy rozdział Księgi Wyjścia (Wj 21:1–36) otwiera tak zwaną Księgę Przymierza (Wj 21–23) — pierwszy szczegółowy zbiór ustaw społecznych i cywilnych nadanych Izraelowi bezpośrednio po ogłoszeniu Dekalogu. Podczas gdy wiele starożytnych kodeksów Bliskiego Wschodu faworyzowało arystokrację i właścicieli majątków, biblijne prawo Przymierza stawia na pierwszym miejscu ochronę osób ekonomicznie i społecznie najsłabszych.

1. Prawa sług hebrajskich i wartość wolności (Wj 21:1–11)
Ustawy rozpoczynają się od regulacji losu Hebrajczyka, który z powodu długów lub skrajnego ubóstwa trafił w zależność służebną. Zamiast dożywotniego zniewolenia Bóg wyznacza sztywną granicę sześciu lat pracy, po których w siódmym roku sługa wychodzi na wolność bez żadnego wykupu (Wj 21:2, UBG). Pozostanie na stałe w domu pana jest dopuszczalne wyłącznie jako dobrowolny akt miłości wobec pana, żony i dzieci, potwierdzony publicznie przed sędziami i przekłuciem ucha przy drzwiach domu (Wj 21:5–6). Równie nowatorska w starożytnym świecie była ochrona córek i żon przed bezprawnym porzuceniem oraz sprzedażą cudzoziemcom (Wj 21:7–11).

2. Świętość życia, zakaz handlu ludźmi i granica odwetu (Wj 21:12–27)
> „Kto uprowadzi człowieka i sprzeda go lub zostanie on znaleziony w jego ręku, poniesie śmierć.” — Księga Wyjścia 21:16 (UBG)

Prawo Przymierza wyraźnie rozróżnia zabójstwo z premedytacją od nieumyślnego spowodowania śmierci, ustanawiając dla przypadkowego sprawcy miejsce schronienia (Wj 21:12–14), jednocześnie nakładając karę śmierci za porwanie człowieka i handel ludźmi (Wj 21:16). Szczególną ochroną objęto kobietę brzemienną oraz jej dziecko (Wj 21:22–25). W tym kontekście pada słynna reguła *lex talionis* („oko za oko, ząb za ząb”, Wj 21:23–25), której historycznym celem było powstrzymanie niekontrolowanej wendety klanowej i ograniczenie wyroku sędziowskiego dokładnie do miary wyrządzonej szkody. Jednocześnie Wj 21:26–27 gwarantowało natychmiastową wolność słudze lub niewolnicy, jeśli pan uszkodził im oko lub wybił ząb — co stanowiło bezprecedensowe uznanie podmiotowości sługi.

3. Odpowiedzialność za zaniedbanie i szkody w sąsiedztwie (Wj 21:28–36)
Ostatnia część rozdziału uczy odpowiedzialności prewencyjnej: właściciel, który wiedział o zagrożeniu ze strony własnego zwierzęcia, lecz je zlekceważył, ponosi ciężkie konsekwencje prawne (Wj 21:29–30), a osoba wykopująca lub odkrywająca studnię bez zabezpieczenia musi wynagrodzić stratę sąsiadowi (Wj 21:33–34). Prawo Przymierza nie rozdziela pobożności od troski o bezpieczeństwo bliźniego.

4. Perspektywa Chrystocentryczna
Kluczowe motywy Księgi Wyjścia 21 znajdują swoje najgłębsze wypełnienie w osobie Jezusa Chrystusa. Wieczny Syn Boży „ogołocił samego siebie, przyjmując postać sługi” (Flp 2:7, UBG) i niczym wierny sługa z miłości do Ojca i Kościoła przyjął rany dla naszego wyzwolenia. Tam, gdzie w Wj 21:32 życie sługi wyceniono na trzydzieści syklów srebra, Ewangelia ukazuje Chrystusa zdradzonego przez Judasza za dokładnie trzydzieści srebrników (Mt 26:15; Za 11:12–13), aby Syn Człowieczy oddał samego Siebie na doskonały okup (*kopher*) za nasze zbawienie (Mt 20:28; 1 Tm 2:6). W Kazaniu na Górze (Mt 5:38–42) Jezus uczy też swoich uczniów przechodzić od sądowej proporcjonalności *lex talionis* do osobistego przebaczenia i miłości nieprzyjaciół.

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 21:1–36 dowodzi, że biblijna wiara od początku łączy cześć oddawaną Bogu z ochroną ludzkiej godności, życia poczętego, wolności słabych i osobistej odpowiedzialności za szkody. Ostatecznym gwarantem i wypełnieniem tej sprawiedliwości jest Jezus Chrystus — Sługa i Odkupiciel świata.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

const pakiet5wersji = `====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

${v1TtsText}

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

${v2WebText}

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

${v3SmsText}

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

${v4VideoText}

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

${v5ArticleText}`;

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH) ──
const exegesisPlainBlocks = `CZĘŚĆ I: WSTĘP DO KSIĘGI PRZYMIERZA ORAZ PRAWA SŁUG HEBRAJSKICH (WJ 21:1–11)
1. Przejście od Dekalogu do ustaw wykonawczych (21:1): Słowo miszpatim oznacza konkretne orzeczenia prawne i precedensy, które przekładają dziesięć zasad Przymierza na realia życia społecznego Izraela.
2. Pierwszeństwo ochrony najsłabszych (21:2): Bóg nie rozpoczyna ustawodawstwa od przywilejów elit, lecz od ubogiego Hebrajczyka, który z powodu długów lub niedostatku musiał sprzedać swoją pracę.
3. Sześcioletni limit służby i siódmy rok wolności (21:2): Niewolnictwo długowe w Izraelu nie mogło być dożywotnim zniewoleniem — po sześciu latach pracy sługa w siódmym roku wychodził na wolność (chofszii) za darmo (chinnam), bez wykupu.
4. Kontrast z egipskim domem niewoli (21:2): Naród niedawno wykupiony z Egiptu nie wolno było zamieniać w wewnętrzne więzienie dla własnych braci i sióstr.
5. Ochrona integralności małżeństwa przy wyjściu (21:3): Kto przyszedł sam, odchodził sam; kto wszedł w służbę jako mąż swojej żony, zabierał żonę ze sobą na wolność.
6. Trudny przypadek rodziny założonej w domu pana (21:4): Jeśli żona została dana słudze przez pana tylko na okres służby, po sześciu latach pan nie tracił praw do domostwa, co stawiało sługę przed decyzją miłości.
7. Dobrowolna deklaracja miłości (21:5): „Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność” — jedynym dopuszczalnym powodem stałego związania z domem pana była świadoma miłość (ahaw), nie przymus ani dług.
8. Publiczny nadzór sędziów przeciw nadużyciom (21:6): Zaprowadzenie sługi przed sędziów (ha-Elohim — przed Boga i reprezentujących Go sędziów) gwarantowało, że decyzja nie została wymuszona w ukryciu przez pana.
9. Symbolika przekłutego ucha przy drzwiach (21:6): Drzwi i słupek domu oznaczały przynależność do rodziny, a przekłute ucho było trwałym znakiem dobrowolnego oddania się służbie z miłości (por. Ps 40:7–9; Hbr 10:5–7).
10. Ochrona młodej kobiety w służbie (21:7–8): Córka oddana do domu pana z myślą o małżeństwie nie mogła być traktowana jak tymczasowy pracownik fizyczny ani porzucona bez zabezpieczenia; w razie zmiany planów należało umożliwić jej wykup (padah).
11. Zakaz sprzedaży cudzoziemcom (21:8): Pan nie miał prawa sprzedać jej obcemu narodowi, gdyż oznaczałoby to zdradę zaufania i złamanie zobowiązania wobec rodziny.
12. Prawa córki oraz równe zaopatrzenie w domu (21:9–11): Jeśli przeznaczono ją dla syna, przysługiwał jej status córki; nawet w realiach poligamii ustawa zabezpieczała trzy podstawowe prawa kobiety (pożywienie, odzież i pożycie małżeńskie), a ich odmowa dawała jej natychmiastową wolność bez opłaty.

CZĘŚĆ II: ŚWIĘTOŚĆ ŻYCIA, MIASTO SCHRONIENIA I ZAKAZ HANDLU LUDŹMI (WJ 21:12–17)
13. Zasada odpowiedzialności za odebranie życia (21:12): Każdy, kto uderza człowieka ze skutkiem śmiertelnym, podlega najwyższej karze, ponieważ człowiek nosi w sobie obraz Stwórcy (Rdz 9:6).
14. Odróżnienie przypadku od premedytacji (21:13): Gdy sprawca nie czyhał na życie bliźniego, lecz doszło do tragicznego wypadku („Bóg podał go w jego rękę” — w sensie dopuszczenia Opatrzności), Bóg zapowiada ustanowienie miejsca schronienia (Lb 35:11–12; Pwt 19:2–10).
15. Brak azylu przy ołtarzu dla mordercy (21:14): Kto podstępnie zaplanował zabójstwo bliźniego, nie może zasłaniać się świętością miejsca kultu — nawet od Bożego ołtarza należy go zabrać przed sąd (por. 1 Krl 2:28–34).
16. Powszechna sprawiedliwość bez świętych kryjówek (21:14): Pobożność rytualna nigdy nie może chronić zbrodni ani zastępować odpowiedzialności moralnej.
17. Ochrona rodziców przed przemocą fizyczną (21:15): Uderzenie ojca lub matki było traktowane jak atak na Boży porządek wspólnoty i piąte przykazanie Dekalogu.
18. Bezwzględny zakaz uprowadzenia człowieka (21:16): Porwanie i sprzedaż człowieka (lub samo przetrzymywanie uprowadzonej ofiary) karano śmiercią — Pismo Święte z całą mocą potępia handel ludźmi i porywanie w niewolę (por. 1 Tm 1:10).
19. Ciężar złorzeczenia rodzicom (21:17): Hebrajskie kalal oznacza nie zwykłą kłótnię dziecięcą, lecz zuchwałe przeklinanie, pogardę i odrzucenie autorytetu ojca oraz matki w dorosłej wspólnocie (por. Mt 15:4).

CZĘŚĆ III: SPRAWIEDLIWOŚĆ PRZY OBRAŻENIACH, OCHRONA DZIECKA I LEX TALIONIS (WJ 21:18–27)
20. Zadośćuczynienie za czas utraconej sprawności (21:18–19): Gdy w bójce człowiek nie umarł, lecz musiał leżeć w łóżku, sprawca nie ponosił kary śmierci, ale musiał wypłacić pełne odszkodowanie za utracony czas pracy i pokryć koszty leczenia aż do wyzdrowienia.
21. Odpowiedzialność za śmiertelne pobicie sługi (21:20–21): Jeśli sługa lub niewolnica zmarli pod ręką bijącego ich pana, pan musiał ponieść karę — było to radykalnym wyłomem w prawie starożytnego Bliskiego Wschodu, gdzie właściciel mógł bezkarnie zabić niewolnika.
22. Ograniczenie odpowiedzialności karnej przy braku zamiaru zabójstwa (21:21): Jeśli sługa przeżył dzień lub dwa, zakładano brak zamiaru zabicia, a samą stratę pracy i leczenia odczuwał pan materialnie; tekst nie pochwala przemocy, lecz rozróżnia kwalifikację prawną w sądzie.
23. Ochrona kobiety brzemiennej i jej dziecka (21:22–23): Podczas bójki mężczyzn przypadkowe uderzenie kobiety brzemiennej niosło obowiązek kary finansowej nałożonej za pośrednictwem sędziów (pelilim), nawet jeśli dziecko wyszło bez trwałej szkody (poród przedwczesny bez urazu).
24. Pełna wartość życia w razie szkody (21:23): Gdy doszło do szkody dla matki lub dziecka, prawo nakazywało zasadę „życie za życie” (nefesz tachat nafesz), potwierdzając ochronę życia ludzkiego również na etapie życia poczętego.
25. Prawdziwy sens zasady „oko za oko” (21:24–25): Reguła lex talionis („oko za oko, ząb za ząb, rękę za rękę...”) obowiązywała sędziów, a nie prywatnych mścicieli; miała ograniczyć zemstę klanową tak, by kara nigdy nie przekraczała miary wyrządzonej krzywdy.
26. Natychmiastowa wolność dla skrzywdzonego sługi (21:26–27): Jeśli pan wybił słudze lub niewolnicy oko albo nawet jeden ząb, tracił wszelkie prawa do ich służby — musiał natychmiast wypuścić skrzywdzoną osobę na wolność.
27. Godność cielesna każdego człowieka (21:26–27): Nawet drobne trwałe uszkodzenie ciała sługi skutkowało wyzwoleniem, co skutecznie powstrzymywało przemoc w domach Izraela.

CZĘŚĆ IV: ODPOWIEDZIALNOŚĆ CYWILNA ZA SZKODY I ZAGROŻENIA (WJ 21:28–36)
28. Zwierzę zabijające człowieka — wina nieprzewidziana (21:28): Jeśli wół ubódł na śmierć mężczyznę lub kobietę bez wcześniejszych sygnałów agresji, zwierzę kamienowano i zakazywano jedzenia jego mięsa (szacunek dla ludzkiej krwi), lecz właściciel pozostawał niewinny.
29. Rażące niedbalstwo właściciela (21:29): Gdy wół bódł już wcześniej, a właściciela ostrzegano i mimo to nie pilnował zwierzęcia, odpowiadał własnym życiem za śmierć człowieka.
30. Instytucja okupu sądowego za życie (21:30): W przypadku zaniedbania bez bezpośredniego zamiaru zabójstwa sąd mógł wyznaczyć okup (kopher / pidjon nafszó), aby uratować winowajcę przed karą śmierci i zadośćuczynić rodzinie ofiary.
31. Równość dzieci wobec prawa (21:31): Gdy zginął syn lub córka, obowiązywało dokładnie to samo prawo jak wobec dorosłego mężczyzny czy kobiety — dzieci w Izraelu nie były obywatelami drugiej kategorii.
32. Odszkodowanie za zabitego sługę — 30 syklów srebra (21:32): Właściciel niebezpiecznego wołu płacił panu zabitego sługi trzydzieści syklów srebra, a zwierzę kamienowano; liczba ta nabrała później głębokiego znaczenia proroczego w odrzuceniu Mesjasza (Za 11:12–13; Mt 26:15).
33. Odpowiedzialność za odkrytą studnię (21:33–34): Kto wykopał studnię lub ją otworzył i nie zakrył, odpowiadał za upadek cudzego wołu lub osła — zaniedbanie prewencyjne jest moralnie i prawnie zawinione.
34. Obowiązek pełnego naprawienia szkody (21:34): Sprawca zaniedbania musiał wynagrodzić (jeszalem — od szalem, przywrócić całość i pokój) właścicielowi pełną wartość zwierzęcia.
35. Sprawiedliwy podział przy wypadku nieprzewidzianym (21:35): Gdy dwa łagodne woły walczyły bez wcześniejszej winy właścicieli i jeden padł, obaj sąsiedzi dzielili po połowie wartość żywego i padłego zwierzęcia, wspólnie niosąc stratę losową.
36. Pełna restytucja przy zlekceważeniu ostrzeżenia (21:36): Kto wiedział o agresji swego wołu i go nie upilnował, musiał oddać żywego wołu za wołu bez dzielenia się stratą z poszkodowanym sąsiadem.

CZĘŚĆ V: SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 21:1–36)
37. Prawo miłości w konkretnych decyzjach: Dekalog uczy kogo kochać, a Wj 21 uczy, jak ta miłość wygląda w umowach pracy, ochronie rodziny i zabezpieczeniu podwórka.
38. Wolność w Chrystusie przeciw duchowemu wyzyskowi: Żaden wierzący wykupiony przez Boga nie ma prawa traktować bliźniego jako narzędzia zysku lub własności pozbawionej godności (Ef 6:9).
39. Sprawiedliwość naprawcza zamiast nienawiści: Bibliczne prawo dąży do przywrócenia pokoju i całości (szalem), a nie do eskalacji odwetu.
40. Miszpatim (מִשְׁפָּטִים): Konkretne wyroki i zasady sprawiedliwości przekładające Dekalog na codzienność sąsiedzką (Wj 21:1).
41. Chofszii chinnam (חׇפְשִׁי חִנָּם): Wyzwolenie darmowe, bez opłaty i bez wykupu — obraz łaski Bożej wyprowadzającej z niewoli (Wj 21:2).
42. Ahaw (אָהֵב): Dobrowolna miłość sługi do swego pana i rodziny jako motyw wiernej służby (Wj 21:5).
43. Nefesz (נֶפֶשׁ): Całe życie i osoba człowieka chroniona prawem „życie za życie” (Wj 21:23).
44. Kopher (כֹּפֶר): Okup pokrywający winę i ratujący życie skazanego — pojęcie kluczowe dla teologii odkupienia w Chrystusie (Wj 21:30).
45. Jeszalem (יְשַׁלֵּם): Pełne wynagrodzenie i przywrócenie równowagi po wyrządzonej szkodzie (Wj 21:34).`;

const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}

ZANIM OTWORZYSZ BIBLIĘ
Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie 66 ksiąg Pisma Świętego — księga po księdze, każdego dnia jeden fragment. Dziś w Dniu 51 przechodzimy ze szczytu góry Synaj (Wj 20) do pierwszych szczegółowych ustaw Księgi Przymierza w dwudziestym pierwszym rozdziale Księgi Wyjścia (Wj 21:1–36).

Zanim przeczytasz komentarz, otwórz UBG i przeczytaj cały rozdział od wersetu 1 do 36. Zauważ, dlaczego Bóg rozpoczyna kodeks cywilny od praw zadłużonego sługi oraz ochrony córek, kobiet brzemiennych i bezbronnych, a także jak w wersecie 32 pojawia się zaskakująca kwota trzydziestu syklów srebra.

TEKST PISMA ŚWIĘTEGO (UBG • ${READING})
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (${READING})
• H4941 — Miszpatim (מִשְׁפָּטִים): sprawiedliwe wyroki, orzeczenia i ustawy stosujące Dekalog w życiu społecznym (Wj 21:1).
• H5650 — Ewed (עֶבֶד): sługa, niewolnik długowy chroniony przez Boże prawo przed bezterminowym wyzyskiem (Wj 21:2).
• H2670 / H2600 — Chofszii chinnam (חׇפְשִׁי חִנָּם): wolny za darmo, bez wykupu w siódmym roku służby (Wj 21:2).
• H0157 — Ahaw (אָהֵב): szczera miłość, z której sługa dobrowolnie wybiera pozostanie u boku pana i rodziny (Wj 21:5).
• H6299 — Padah (פָּדָה): wykupić, ocalić, zapewnić uczciwe uwolnienie wykupionej kobiety (Wj 21:8).
• H5315 — Nefesz (נֶפֶשׁ): życie i osoba ludzka chroniona najwyższą miarą sprawiedliwości (Wj 21:23).
• H3724 — Kopher (כֹּפֶר): cena życia, okup zwalniający od kary śmierci przy sprawiedliwym zadośćuczynieniu (Wj 21:30).
• H7999 — Szalem / Jeszalem (יְשַׁלֵּם): przywrócić całość, uczciwie wyrównać wyrządzoną szkodę (Wj 21:34).

ANALIZA EGZEGETYCZNA I FORMACJA TEOLOGICZNA (45 PUNKTÓW)

${exegesisPlainBlocks}

JEZUS W CENTRUM — SŁUGA Z MIŁOŚCI I OKUP ZA WIELU
1. Wieczny Syn Boży, który przyjął postać Sługi (Flp 2:6–8): Jezus Chrystus ogołocił samego Siebie i z czystej miłości do Ojca oraz grzesznego człowieka wybrał drogę posłusznego Sługi aż do śmierci krzyżowej — dokładnie tak, jak sługa z Wj 21:5–6 z miłości wybierał trwałą więź przy drzwiach domu.
2. Miłość wyceniona na trzydzieści srebrników (Wj 21:32; Za 11:12–13; Mt 26:15): W Wj 21:32 odszkodowanie za życie sługi wynosiło trzydzieści syklów srebra; w Ewangeliach przywódcy wycenili na trzydzieści srebrników samego Jezusa Chrystusa, ukazując, jak nisko świat oszacował Pana chwały.
3. Doskonały Okup (kopher) za nasze życie (Wj 21:30; Mt 20:28; 1 Tm 2:5–6): Tam, gdzie żadne ludzkie srebro ani złoto nie mogło wykupić nas spod wyroku grzechu (1 P 1:18–19), Chrystus oddał własne życie jako jedyny wystarczający okup za wszystkich.
4. Przekłute ręce i otwarte ucho posłuszeństwa (Ps 40:7–9; Hbr 10:5–7): Znak wiernego sługi z Wj 21:6 znajduje głębokie echo w Jezusie, którego posłuszeństwo zostało przypieczętowane bliznami miłości na krzyżu Golgoty.
5. Chrystus — nasze prawdziwe Miasto Schronienia (Wj 21:13; Hbr 6:18): Tak jak nieumyślny zabójca uciekał do wyznaczonego miejsca ocalenia, tak grzesznicy uciekają dziś pod ochronę krwi Chrystusa przed wyrokiem sądu.
6. Od ograniczenia zemsty do miłości nieprzyjaciół (Wj 21:24; Mt 5:38–42): Jezus nie znosi sprawiedliwości sądowej, lecz wzywa uczniów w życiu osobistym do porzucenia prywatnego odwetu i zwyciężania zła dobrem (Rz 12:19).

SPRAWDŹ W BIBLII — 12 WERSÓW PORÓWNAWCZYCH
• Wj 21:2 → J 8:34–36: Kto jest wolnym bez wykupu, gdy Syn Boży uwalnia człowieka z niewoli grzechu?
• Wj 21:5–6 → Flp 2:5–8: Jak dobrowolna decyzja sługi z miłości odbija się w uniżeniu Jezusa Chrystusa?
• Wj 21:6 → Ps 40:7–9; Hbr 10:5–7: Co oznacza w Liście do Hebrajczyków całkowite oddanie ciała na służbę Bogu?
• Wj 21:12–14 → Lb 35:11–12: Jak Bóg zorganizował miasta schronienia, aby odróżnić wypadek od zbrodni?
• Wj 21:14 → 1 Krl 2:28–34: Dlaczego ołtarz Pański nie był kryjówką dla podstępnego mordercy?
• Wj 21:15,17 → Mt 15:4–6: Jak Jezus bronił piątego przykazania przed ludzkimi tradycjami unikającymi troski o rodziców?
• Wj 21:16 → 1 Tm 1:9–10: Dlaczego apostoł Paweł stawia handlarzy ludźmi wśród najcięższych przestępców sprzecznych ze zdrową nauką?
• Wj 21:22–23 → Ps 139:13–16: Jak całe Pismo potwierdza godność i wartość życia rozwijającego się w łonie matki?
• Wj 21:24–25 → Mt 5:38–42; Rz 12:19: Czym różni się sądowe ograniczenie kary od osobistej zemsty w sercu chrześcijanina?
• Wj 21:26–27 → Kol 4:1; Ef 6:9: Czego Paweł wymaga od przełożonych i pracodawców pamiętających o Panu w niebie?
• Wj 21:30 → 1 P 1:18–19; Mt 20:28: Dlaczego żaden materialny okup nie zastąpi bezcennej krwi Baranka?
• Wj 21:32 → Za 11:12–13; Mt 26:15: Jaką wymowę ma cena trzydziestu srebrników w zdradzie Pana Jezusa?

PRAWDA NA DZIŚ — 8 ZASAD KSIĘGI PRZYMIERZA DLA CODZIENNOŚCI
• 1. Wiara bez sprawiedliwości wobec słabszych jest pusta: Bóg zaczyna prawo Przymierza od sługi, córki i bezbronnego dziecka — to miara także naszej pobożności.
• 2. Najwyższa służba rodzi się z miłości, nie ze strachu: Chrześcijanin nie służy Bogu jak przestraszony niewolnik odliczający dni, lecz jak syn i sługa z wyboru miłości.
• 3. Bóg nienawidzi handlu ludźmi i każdego wyzysku: Zysk osiągnięty krzywdą, zastraszeniem lub manipulacją ludźmi spotyka się ze stanowczym sądem Stwórcy.
• 4. Życie ludzkie — także nienarodzone — jest pod ochroną Boga: Chrześcijanin stoi po stronie życia, troski o matki i bezpieczeństwa bezbronnych.
• 5. Sprawiedliwość nie jest prywatną zemstą: Oddaj sąd Bogu i właściwym procedurom zamiast odpowiadać złością i odwetem.
• 6. Odpowiadamy także za nasze zaniedbania: Niezabezpieczona „studnia” (brak wyobraźni, niedbalstwo w pracy lub na drodze) jest zawinioną krzywdą bliźniego.
• 7. Zadośćuczynienie buduje prawdziwy pokój: Kto wyrządził szkodę, nie kończy sprawy na słowie „przepraszam”, lecz realnie naprawia krzywdę.
• 8. Zostaliśmy wykupieni bezcennym okupem: Świat mógł wycenić Sługę na trzydzieści srebrników, lecz dla nas Jego krew jest skarbem całego zbawienia.

POMYŚL — 8 PYTAŃ DO SERCA
1. Jak traktujesz osoby, które nie mogą się odwdzięczyć, mają niższy status lub zależą od Twoich decyzji w pracy i domu?
2. Czy Twoja służba Bogu przypomina odliczanie lat przymusu, czy dobrowolną wierność wypływającą z wdzięczności za miłość Chrystusa?
3. Czy chronisz w swoich słowach i wyborach szacunek wobec własnych rodziców oraz starszego pokolenia?
4. Gdzie w Twoim życiu pojawia się pokusa prywatnego odwetu („oko za oko” w sercu), zamiast powierzenia sprawiedliwości Bogu?
5. Jakie „odkryte studnie” — zaniedbane obowiązki, nieostrożne słowa lub niedopatrzenia — wymagają dziś Twojego zabezpieczenia?
6. Czy w sytuacji, gdy popełniłeś błąd i naraziłeś kogoś na stratę, jesteś gotów do uczciwego zadośćuczynienia?
7. Czy pamiętasz, jak wielką cenę — własne życie Sługi zamiast trzydziestu srebrników — zapłacił Jezus za Twoją wolność?
8. Kto w Twoim otoczeniu potrzebuje dziś konkretnej obrony, życzliwości albo wsparcia, aby poczuć godność dziecka Bożego?

MAŁY QUIZ — 20 PYTAŃ Z WJ 21:1–36

Pytanie 1: Jak długo według Wj 21:2 miał służyć kupiony niewolnik – Hebrajczyk, zanim wyszedł na wolność bez wykupu?
A. Trzy lata, a w czwartym roku na wolność
B. Sześć lat, a w siódmym roku wyjdzie na wolność bez wykupu
C. Dziesięć lat, a potem za podwójnym wykupem
D. Dwanaście lat aż do roku jubileuszowego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:2 mówi wprost: „sześć lat będzie ci służyć, a w siódmym roku wyjdzie na wolność bez wykupu”.

Pytanie 2: Co działo się z żoną niewolnika hebrajskiego, jeśli był żonaty już przed rozpoczęciem służby (Wj 21:3)?
A. Pozostawała na stałe w domu pana
B. Musiała zapłacić dodatkowy wykup w srebrze
C. Jego żona odchodziła razem z nim na wolność
D. Przechodziła na własność sędziów
Poprawna odpowiedź: C. Wyjaśnienie: Wj 21:3: „a jeśli miał żonę, jego żona odejdzie z nim”.

Pytanie 3: Kto zachowywał żonę i dzieci urodzone w czasie służby, jeśli to pan dał słudze żonę (Wj 21:4)?
A. Należały do pana, a sługa odchodził sam
B. Odchodziły zawsze do sąsiedniego pokolenia
C. Przechodziły pod opiekę kapłanów przybytku
D. Zostawały sprzedane do Egiptu
Poprawna odpowiedź: A. Wyjaśnienie: Wj 21:4: „to jego żona i dzieci będą należały do jego pana, a on odejdzie sam”.

Pytanie 4: Co mógł zadeklarować sługa w Wj 21:5, jeśli nie chciał opuszczać swego pana i rodziny?
A. Że chce otrzymać połowę majątku pana
B. Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność
C. Że zamierza uciec na pustynię Synaj
D. Że przejmuje dom pana po siódmym roku
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:5 cytuje wyznanie miłości sługi: „Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność”.

Pytanie 5: Dokąd prowadził pan sługę chcącego pozostać na zawsze i jaki znak wykonywał według Wj 21:6?
A. Do namiotu Mojżesza i wręczał mu laskę
B. Przed sędziów oraz do drzwi lub ich słupka, gdzie szydłem przekłuwał mu ucho
C. Nad brzeg Jordanu i obmywał mu ręce
D. Na szczyt góry i zakładał mu żelazny łańcuch
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:6 opisuje przyprowadzenie do sędziów i do drzwi/słupka oraz przekłucie ucha szydłem.

Pytanie 6: Czego nie miał prawa uczynić pan wobec niewolnicy hebrajskiej przeznaczonej na małżonkę, jeśli mu się nie spodobała (Wj 21:8)?
A. Pozwolić na jej odkupienie przez rodzinę
B. Zapewnić jej pożywienia i odzieży
C. Sprzedać jej obcemu ludowi, ponieważ zrobiłby jej krzywdę
D. Wydać jej za mąż za swojego syna
Poprawna odpowiedź: C. Wyjaśnienie: Wj 21:8 zabrania kategorycznie: „Nie ma prawa sprzedać jej obcemu ludowi, ponieważ zrobiłby jej krzywdę”.

Pytanie 7: Jakie trzy rzeczy musiał zapewnić mąż pierwszej żonie, jeśli wziął sobie jeszcze inną (Wj 21:10–11)?
A. Srebro, złoto i stado owiec
B. Pożywienie, ubranie oraz prawo małżeńskie
C. Osobny dom, rydwan i dwóch sług
D. Pole pszenicy, winnicę i studnię
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:10 wymienia te trzy obowiązki, a w razie ich odmowy kobieta wychodziła darmo bez okupu (w. 11).

Pytanie 8: Co Bóg obiecał ustanowić w Wj 21:13 dla człowieka, który zabił kogoś nieumyślnie, nie czyhając na niego?
A. Podwójną opłatę w miedzi
B. Miejsce, do którego będzie mógł uciec
C. Zwolnienie od wszelkich praw w obozie
D. Siedem dni postu przed sądem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:13 zapowiada miasta schronienia: „wyznaczę miejsce, do którego będzie mógł uciec”.

Pytanie 9: Co nakazywało prawo w Wj 21:14 wobec mordercy, który podstępnie czyhał na bliźniego i zabił go?
A. Mógł bezpiecznie schronić się w świątyni na zawsze
B. Nawet od Bożego ołtarza należało go zabrać, aby umarł
C. Wystarczyło, że przeprosił starszych ludu
D. Oddawał dziesięć wołów jako zadośćuczynienie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:14: „to nawet od mojego ołtarza go weźmiesz, aby umarł”.

Pytanie 10: Jaka kara groziła według Wj 21:16 człowiekowi, który uprowadził kogoś i sprzedał lub przetrzymywał u siebie?
A. Grzywna w wysokości trzydziestu syklów
B. Poniesie śmierć
C. Sześć lat pracy w polu
D. Wygnanie na trzy miesiące
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:16 karze porwanie i handel ludźmi karą śmierci.

Pytanie 11: Jakie czyny przeciw rodzicom w Wj 21:15 i Wj 21:17 były karane śmiercią?
A. Niezgodność w wyborze zawodu lub domu
B. Uderzenie ojca lub matki oraz złorzeczenie ojcu lub matce
C. Wyjazd z obozu przed zachodem słońca
D. Zadawanie pytań podczas składania ofiar
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:15 wymienia uderzenie ojca lub matki, a Wj 21:17 złorzeczenie im.

Pytanie 12: Co musiał zapłacić sprawca bójki według Wj 21:19, gdy pobity mężczyzna wstał i zaczął chodzić o lasce?
A. Zostawał skazany na wygnanie z pokolenia
B. Wypłacał odszkodowanie i łożył na jego leczenie
C. Oddawał połowę swojej ziemi
D. Nie ponosił żadnych kosztów leczenia
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:19: „wypłaci mu tylko odszkodowanie i będzie łożyć na jego leczenie”.

Pytanie 13: Co działo się według Wj 21:20, jeśli ktoś uderzył kijem swego niewolnika lub niewolnicę tak, że umarli pod jego ręką?
A. Był całkowicie zwolniony od winy
B. Musiał ponieść karę
C. Płacił jedynie jednego sykla sędziom
D. Składał ofiarę z gołębi bez wyroku
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:20 stanowi wyraźnie: „musi ponieść karę”.

Pytanie 14: Kto według Wj 21:22 ustalał wysokość kary, gdy podczas bójki uderzono kobietę brzemienną, lecz nie doszło do trwałej szkody?
A. Wyłącznie sąsiedzi sprawcy
B. Nakładał ją mąż kobiety, a sprawca dawał według uznania sędziów
C. Losowano kwotę przy ołtarzu
D. Sprawca sam wybierał grzywnę
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:22: „musi ponieść karę, jaką nałoży na niego mąż tej kobiety, a da według uznania sędziów”.

Pytanie 15: Jaką miarę sprawiedliwości ustanawia prawo w Wj 21:23–25 w razie dojścia do szkody?
A. Dziesięć razy surowszy odwet niż szkoda
B. Życie za życie, oko za oko, ząb za ząb, rękę za rękę, nogę za nogę, oparzenie za oparzenie, ranę za ranę, siniec za siniec
C. Całkowity zakaz wymierzania jakichkolwiek wyroków
D. Karę zależną wyłącznie od majątku pokrzywdzonego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:23–25 określa proporcjonalną zasadę sądową równą rzeczywistej szkodzie.

Pytanie 16: Co zyskiwał niewolnik lub niewolnica w Wj 21:26–27, gdy pan wybił im oko albo choćby jeden ząb?
A. Podwójną rację chleba przez rok
B. Pan musiał natychmiast wypuścić ich na wolność
C. Otrzymywali jednego wołu
D. Mogli skrócić służbę o jeden miesiąc
Poprawna odpowiedź: B. Wyjaśnienie: Zarówno Wj 21:26 (za oko), jak i Wj 21:27 (za ząb) nakazują: „wypuści go na wolność”.

Pytanie 17: Co działo się według Wj 21:29, jeśli wół bódł już wcześniej, właściciela ostrzegano, a mimo to nie pilnował go i zwierzę zabiło człowieka?
A. Właściciel oddawał tylko skórę zwierzęcia
B. Wół był ukamienowany i jego właściciel ponosił śmierć (z możliwością nałożenia okupu za duszę w w. 30)
C. Sąd karał jedynie pasterza z sąsiedniego namiotu
D. Zwierzę wypuszczano na pustynię
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:29–30 nakłada najwyższą odpowiedzialność za zlekceważone ostrzeżenie, dopuszczając w w. 30 sądowy okup za życie.

Pytanie 18: Jakie odszkodowanie według Wj 21:32 wynosiła strata niewolnika lub niewolnicy ubodzonych przez wołu?
A. Pięć syklów złota
B. Trzydzieści syklów srebra, a wół miał być ukamienowany
C. Dziesięć syklów miedzi
D. Sto owiec i dwa osły
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:32 podaje kwotę „trzydzieści syklów srebra”, która później wraca w proroctwie Za 11:12 i zdradzie Judasza w Mt 26:15.

Pytanie 19: Kto według Wj 21:33–34 ponosił winę i musiał wynagrodzić stratę, jeśli wół lub osioł wpadł w wykopaną i niezabezpieczoną studnię?
A. Właściciel zwierzęcia, bo nie pilnował drogi
B. Właściciel tej studni, który musiał wyrównać stratę
C. Cała rada starszych obozu
D. Nikt nie odpowiadał za wypadek w nocy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:34: „Właściciel tej studni musi wyrównać stratę i wynagrodzi ich właścicielowi”.

Pytanie 20: Czym różnił się wyrok w Wj 21:36 od Wj 21:35, gdy wół zabił wołu sąsiada, ale właściciel zlekceważył wcześniejsze ostrzeżenia o swoim zwierzęciu?
A. Dzielił się zapłatą za żywego wołu po połowie
B. Musiał oddać żywego wołu za wołu, a zdechłe zwierzę należało do niego
C. Oddawał tylko połowę ceny skóry
D. Nie musiał płacić niczego, jeśli zwierzęta walczyły w dzień
Poprawna odpowiedź: B. Wyjaśnienie: Wj 21:36: przy znanym wcześniej zagrożeniu winny zaniedbania ponosi pełną restytucję („oddać wołu za wołu”).

TWOJA DECYZJA
Dwudziesty pierwszy rozdział Księgi Wyjścia uczy nas, że wiara biblijna nie zamyka się w pobożnych deklaracjach, lecz sprawdza się w szacunku dla najsłabszych, ochronie ludzkiego życia i odważnej odpowiedzialności za własne czyny oraz zaniedbania. Nie musimy już żyć ani w strachu przed własną bezsilnością, ani w chęci odwetu, ponieważ Chrystus jako dobrowolny Sługa oddał samego Siebie na okup za nasze grzechy.

Podejmij dziś osobistą decyzję przed Bogiem: pozwól Mu oczyścić Twoje podejście do osób zależnych od Ciebie, zabezpiecz zaniedbane obszary odpowiedzialności i służ z wdzięczności temu, kto Cię wykupił bezcenną krwią.

MOJA DECYZJA:
„Dziękuję Ci, Panie Jezu Chryste, że przyjąłeś postać Sługi i oddałeś swoje życie na okup za moją wolność. Z wdzięczności za Twoją łaskę wybieram dziś sprawiedliwość wobec słabszych, szacunek dla każdego ludzkiego życia i pełną odpowiedzialność za moje słowa, obowiązki oraz naprawianie wszelkich wyrządzonych szkód.”

MODLITWA NA 20 LISTOPADA 2026 R.
Wszechmogący, Sprawiedliwy i Miłosierny Boże! Dziękujemy Ci za dwudziesty pierwszy rozdział Księgi Wyjścia, w którym odsłaniasz swoje ojcowskie serce wobec sług, kobiet, dzieci, nienarodzonych i wszystkich skrzywdzonych przez ludzką chciwość lub niedbalstwo. Dziękujemy Ci, że Twoje prawo nigdy nie chroni wyzysku silnych kosztem słabych, lecz stawia wokół bezbronnych mocny mur sprawiedliwości.

Wyznajemy przed Tobą wszystkie nasze grzechy obojętności, ostrych słów wobec osób zależnych od nas, prób zrzucania winy na innych oraz zaniedbań, które naraziły kogoś na stratę lub smutek. Przepraszamy za każdą chęć odwetu w myślach i za brak wyobraźni tam, gdzie należało zadbać o bezpieczeństwo bliźniego.

Panie Jezu Chryste, Ty jesteś jedynym Sługą doskonałym, który z miłości do Ojca i do nas przyjął rany krzyża. Świat wycenił Cię na trzydzieści srebrników, lecz Twoja krew stała się bezcennym okupem za naszą wolność. Wpisz w nasze serca Twoją gotowość do pokornej służby i uczyń nas ludźmi pokoju, prawdy i zadośćuczynienia.

Błogosław w ten piątek naszym rodzinom, miejscom pracy i każdemu spotkanemu człowiekowi. Strzeż życia ludzkiego od poczęcia aż po kres dni i prowadź nas drogą wierności Twojemu Przymierzu. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj cały 21. rozdział Księgi Wyjścia (Wj 21:1–36 UBG) oraz hymn o Chrystusie Słudze w Liście do Filipian 2:5–11.
2. Zapamiętaj werset Wj 21:2 i przypomnij sobie, że Twoja wolność w Chrystusie została darowana bez wykupu z Twojej strony.
3. Okaż dziś konkretny szacunek osobie na niższym stanowisku, usługodawcy, pracownikowi lub młodszemu członkowi rodziny.
4. Zabezpiecz dziś jedną „odkrytą studnię” w swoim domu, pracy lub relacjach — usuń zaniedbanie, które mogłoby komuś zaszkodzić.
5. Jeśli pamiętasz o niezadośćuczynionej krzywdzie lub niespełnionej obietnicy wobec kogoś, podejmij dziś pierwszy krok do jej naprawienia.
6. W każdej napiętej rozmowie zrezygnuj z odwetu („oko za oko”) i wybierz spokojne, sprawiedliwe rozwiązanie sporu.
7. Oznacz Dzień 51 jako ukończony w Akademii i przekaż tę lekcję osobie, która uważa prawa Starego Testamentu za surowe lub niezrozumiałe!

JUTRO — 21 LISTOPADA 2026 R.
DZIEŃ 52: PRAWO WŁASNOŚCI, ZADOŚĆUCZYNIENIA I ŚWIĘTOŚCI LUDU BOŻEGO (WJ 22:1–31)
Jutro pozostaniemy w Księdze Przymierza, czytając dwudziesty drugi rozdział Księgi Wyjścia. Zobaczymy, jak Bóg reguluje ochronę własności, uczy wielokrotnego zadośćuczynienia za kradzież, staje w obronie cudzoziemca, wdowy i sieroty oraz wzywa cały naród do bycia ludem świętym przed Panem!`;

// ── 4. GENEROWANIE DOKUMENTU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 51...');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 22,
          color: '1A202C',
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'BIBLIJNA AKADEMIA | Z BIBLIĄ ZA PAN BRAT',
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `${BOOK} • DZIEŃ ${DAY_NUM} • ${DATE_STR}   |   Strona `,
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                }),
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
            new TextRun({
              text: '66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE',
              font: 'Calibri',
              size: 20,
              color: 'C4A35A',
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}`,
              font: 'Calibri',
              size: 22,
              color: '2B6CB0',
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: TITLE,
              font: 'Calibri',
              size: 34,
              bold: true,
              color: '0F2942',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: SUBTITLE,
              font: 'Calibri',
              size: 22,
              italics: true,
              color: '4A5568',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `${DATE_FORMATTED}   |   Czytanie: ${READING}`,
              font: 'Calibri',
              size: 22,
              bold: true,
              color: '1A202C',
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 100, after: 120 },
          children: [
            new TextRun({
              text: 'TEKST PAMIĘCIOWY: ',
              font: 'Calibri',
              bold: true,
              color: 'C4A35A',
              size: 22,
            }),
            new TextRun({
              text: MEMORY_VERSE,
              font: 'Calibri',
              italics: true,
              bold: true,
              size: 22,
              color: '0F2942',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: 'MYŚL PRZEWODNIA: ',
              font: 'Calibri',
              bold: true,
              color: '2B6CB0',
              size: 22,
            }),
            new TextRun({
              text: THEME,
              font: 'Calibri',
              size: 22,
              color: '2D3748',
            }),
          ],
        }),
        ...lessonDocxText
          .split('\n\n')
          .slice(1)
          .flatMap((block) => {
            const trimmed = block.trim();
            if (!trimmed) return [];

            if (
              trimmed.startsWith('ZANIM OTWORZYSZ BIBLIĘ') ||
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
              trimmed.startsWith('MOJA DECYZJA') ||
              trimmed.startsWith('MODLITWA NA') ||
              trimmed.startsWith('ZADANIE NA DZIŚ') ||
              trimmed.startsWith('JUTRO —')
            ) {
              const lines = trimmed.split('\n');
              const headingLine = lines[0];
              const bodyLines = lines.slice(1);
              return [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 260, after: 120 },
                  border: {
                    bottom: {
                      color: 'C4A35A',
                      space: 4,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: headingLine,
                      font: 'Calibri',
                      bold: true,
                      size: 26,
                      color: '0F2942',
                    }),
                  ],
                }),
                ...bodyLines
                  .filter((l) => l.trim())
                  .map(
                    (l) =>
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: l.trim(),
                            font: 'Calibri',
                            size: 22,
                            color: '2D3748',
                          }),
                        ],
                      })
                  ),
              ];
            }

            if (trimmed.startsWith('Pytanie ')) {
              const lines = trimmed.split('\n');
              return lines.map((line) => {
                const l = line.trim();
                if (l.startsWith('Pytanie ')) {
                  return new Paragraph({
                    spacing: { before: 140, after: 60 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        bold: true,
                        size: 22,
                        color: '0F2942',
                      }),
                    ],
                  });
                }
                if (/^[A-D]\.\s/.test(l)) {
                  return new Paragraph({
                    spacing: { before: 30, after: 30 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        size: 22,
                        color: '2D3748',
                      }),
                    ],
                  });
                }
                if (l.startsWith('Poprawna odpowiedź:')) {
                  return new Paragraph({
                    spacing: { before: 50, after: 120 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        bold: true,
                        color: '2B6CB0',
                        size: 22,
                      }),
                    ],
                  });
                }
                return new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: l,
                      font: 'Calibri',
                      size: 22,
                      color: '2D3748',
                    }),
                  ],
                });
              });
            }

            return trimmed
              .split('\n')
              .filter((l) => l.trim())
              .map((line) => {
                const l = line.trim();
                const isTask = /^\d+\.\s/.test(l) || /^•\s/.test(l);
                return new Paragraph({
                  spacing: {
                    before: isTask ? 70 : 100,
                    after: isTask ? 70 : 100,
                  },
                  children: [
                    new TextRun({
                      text: l,
                      font: 'Calibri',
                      size: 22,
                      color: '2D3748',
                    }),
                  ],
                });
              });
          }),
      ],
    },
  ],
});

const docxDesktopPath = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxDesktopPath, docxBuffer);
console.log(
  `✅ Zapisano sformatowany plik DOCX na Pulpicie: ${docxDesktopPath} (${docxBuffer.length} bajtów)`
);

// ── 5. ZAPIS PAKIETU 5 WERSJI ROZWAŻAŃ ──
const pakietFilePath = path.join(
  REPO,
  `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`
);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

// ── 6. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 50 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 51 (4 ścieżki Clean URLs + kolejka)...');
const template50Path = path.join(REPO, 'akademia/kurscodzienny/dzien-50.html');
let html = fs.readFileSync(template50Path, 'utf8');

// 6.1 Meta i nagłówek
html = html.replace(
  /<title>Dzień 50: [^<]+<\/title>/,
  `<title>Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`
);
html = html.replace(
  /<meta name="description" content="[^"]+"[^>]*>/,
  `<meta name="description" content="Dzień ${DAY_NUM} Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}" />`
);
html = html.replace(
  /<link rel="canonical" href="[^"]*"[^>]*>/,
  `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}" />`
);
html = html.replace(
  /<meta property="og:url" content="[^"]*"[^>]*>/,
  `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]+"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_50_dekalog_dziesiec_przykazan\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261120`
);

// Social share URL i tekst
html = html.replace(/kurscodzienny%2Fdzien-50/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2050[^"']+/g,
  encodeURIComponent(
    `Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`
  )
);

// 6.2 Nawigacja i okruszki (dzien-50 zostaje wyłącznie jako pojedynczy link powrotny ← Dzień 50)
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 50<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav50Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-49"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/;
const nav51Block = `<a href="/akademia/kurscodzienny/dzien-50" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 50</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 52 (Sobota) →</span>
        </span>`;
if (!nav50Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 50 w szablonie');
}
html = html.replace(nav50Regex, nav51Block);

// 6.3 Hero i grafika
html = html.replace(
  /<span>Dzień 50 z 2009<\/span>/g,
  `<span>Dzień ${DAY_NUM} z 2009</span>`
);
html = html.replace(
  /19 LISTOPADA 2026 • CZWARTEK/g,
  `20 LISTOPADA 2026 • PIĄTEK`
);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 50:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>Ilustracja biblijna: Słupek drzwiowy, waga sprawiedliwości i zwój Prawa Przymierza u podnóża Synaju (${READING})</span>`
);
html = html.replace(/Czytanie: Wj 20:1–26/g, `Czytanie: ${READING}`);

// 6.4 Werset pamięciowy i Myśl przewodnia
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
            ${MEMORY_VERSE_QUOTE}
          </p>
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 21:2 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 21:2 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
          class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
          title="Kopiuj werset do schowka"
        >
          <i class="fa-regular fa-copy"></i>
          <span>Kopiuj</span>
        </button>
      </div>

      <!-- MYŚL PRZEWODNIA -->`
);

html = html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ${THEME}\n      </div>`
);

// 6.5 Zanim otworzysz Biblię
html = html.replace(
  /<!-- LESSON BODY CONTENT[^>]*-->/,
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 20.11.2026) -->`
);
html = html.replace(
  /<article class="kc-card">[\s\S]*?<\/article>/,
  `<article class="kc-card">
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
            Dziś jest <strong class="text-white">Dzień 51</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Ze szczytu Synaju przechodzimy do pierwszych ustaw Księgi Przymierza regulujących życie codzienne ludu Bożego.
          </p>
          <p>
            Zanim przeczytasz komentarz, otwórz własną Biblię i przeczytaj cały rozdział od wersetu 1 do 36. Zwróć uwagę, dlaczego Bóg rozpoczyna ustawy cywilne od praw zadłużonego sługi oraz ochrony bezbronnych, a także jak rozumieć sądową zasadę proporcjonalności w wersetach 23–25.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=21" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 6.6 Tekst Pisma Świętego
html = html.replace(
  /<!-- SCRIPTURE SECTION[^>]*-->/,
  `<!-- SCRIPTURE SECTION (${READING}) -->`
);
html = html.replace(
  /Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 20:1–26/g,
  `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`
);
html = html.replace(
  /\/mojabiblia\?book=EXO&chapter=20/g,
  `/mojabiblia?book=EXO&chapter=21`
);
html = html.replace(
  /\/mojabiblia\?book=EXO&amp;chapter=20/g,
  `/mojabiblia?book=EXO&amp;chapter=21`
);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`
);

// 6.7 Klucze Językowe & Kody Stronga
const strongChips51 = `<span class="strong-chip"><span class="strong-id">H4941</span> <span class="strong-orig">מִשְׁפָּטִים (Miszpatim)</span> — sprawiedliwe wyroki i ustawy stosujące Dekalog w praktyce (Wj 21:1)</span>
          <span class="strong-chip"><span class="strong-id">H5650</span> <span class="strong-orig">עֶבֶד (Ewed)</span> — sługa długowy chroniony przez Boże prawo przed wyzyskiem (Wj 21:2)</span>
          <span class="strong-chip"><span class="strong-id">H2670</span> <span class="strong-orig">חׇפְשִׁי (Chofszii)</span> — wolny bez wykupu w siódmym roku służby (Wj 21:2)</span>
          <span class="strong-chip"><span class="strong-id">H0157</span> <span class="strong-orig">אָהֵב (Ahaw)</span> — miłość, z której sługa dobrowolnie wybiera pozostanie u boku pana i rodziny (Wj 21:5)</span>
          <span class="strong-chip"><span class="strong-id">H6299</span> <span class="strong-orig">פָּדָה (Padah)</span> — wykupić i zabezpieczyć los wykupionej kobiety (Wj 21:8)</span>
          <span class="strong-chip"><span class="strong-id">H5315</span> <span class="strong-orig">נֶפֶשׁ (Nefesz)</span> — życie ludzkie chronione najwyższą miarą sprawiedliwości (Wj 21:23)</span>
          <span class="strong-chip"><span class="strong-id">H3724</span> <span class="strong-orig">כֹּפֶר (Kopher)</span> — okup pokrywający winę i ratujący życie skazanego (Wj 21:30)</span>
          <span class="strong-chip"><span class="strong-id">H7999</span> <span class="strong-orig">יְשַׁלֵּם (Jeszalem)</span> — pełne wynagrodzenie i przywrócenie pokoju po szkodzie (Wj 21:34)</span>`;

html = html.replace(
  /Klucze Językowe & Kody Stronga \(Wj 20:1–26\)/g,
  `Klucze Językowe & Kody Stronga (${READING})`
);
html = html.replace(
  /Poniższe terminy hebrajskie stanowią osnowę teologiczną 20\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie stanowią osnowę teologiczną 21. rozdziału Księgi Wyjścia (sprawiedliwe wyroki przymierza, uwolnienie sługi bez wykupu, dobrowolna służba z miłości, ochrona życia oraz okup i pełna restytucja):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips51}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 6.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 20:1–26 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis51 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            WSTĘP DO KSIĘGI PRZYMIERZA ORAZ PRAWA SŁUG HEBRAJSKICH (WJ 21:1–11)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Przejście od Dekalogu do ustaw wykonawczych (21:1):</strong> Słowo <em>miszpatim</em> oznacza konkretne orzeczenia prawne przekładające zasady Przymierza na realia codziennego sąsiedztwa.</p>
            <p><strong>2. Pierwszeństwo ochrony najsłabszych (21:2):</strong> Bóg rozpoczyna ustawy cywilne nie od przywilejów elit, lecz od ubogiego Hebrajczyka, który z długów trafił na służbę.</p>
            <p><strong>3. Sześcioletni limit służby i siódmy rok wolności (21:2):</strong> Niewolnictwo długowe nie mogło trwać bez końca — w siódmym roku sługa wychodził na wolność (<em>chofszii</em>) za darmo (<em>chinnam</em>), bez wykupu.</p>
            <p><strong>4. Kontrast z egipskim domem niewoli (21:2):</strong> Naród niedawno wyzwolony przez łaskę Boga nie mógł zamieniać własnych braci w bezterminowych niewolników.</p>
            <p><strong>5. Ochrona integralności małżeństwa przy wyjściu (21:3):</strong> Kto wszedł w służbę jako mąż swojej żony, zabierał ją z powrotem na wolność bez żadnych przeszkód.</p>
            <p><strong>6. Trudny wybór rodziny założonej w domu pana (21:4):</strong> Gdy żona została dana słudze na czas służby, po sześciu latach pan zachowywał pieczę nad domostwem, stawiając sługę przed decyzją miłości.</p>
            <p><strong>7. Dobrowolna deklaracja miłości (21:5):</strong> „Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność” — jedynym powodem stałego związania była miłość (<em>ahaw</em>), nigdy przymus.</p>
            <p><strong>8. Publiczny nadzór sędziów przeciw wymuszeniom (21:6):</strong> Zaprowadzenie przed sędziów gwarantowało, że deklaracja sługi jest prawdziwie dobrowolna, a nie wymuszona w ukryciu.</p>
            <p><strong>9. Symbolika przekłutego ucha przy drzwiach (21:6):</strong> Słupek drzwiowy oznaczał trwałą przynależność do domostwa, a znak na uchu — wierne posłuszeństwo z miłości (por. Ps 40:7–9; Hbr 10:5–7).</p>
            <p><strong>10. Ochrona młodej kobiety w służbie (21:7–8):</strong> Córka oddana do domu pana z zamiarem małżeństwa nie mogła zostać porzucona ani pozbawiona szansy uczciwego wykupu (<em>padah</em>).</p>
            <p><strong>11. Zakaz sprzedaży cudzoziemcom (21:8):</strong> Pan nie miał prawa sprzedać jej obcemu ludowi, gdyż byłoby to jawnym złamaniem zaufania i krzywdą bezbronnej.</p>
            <p><strong>12. Prawa córki i równe zaopatrzenie w domu (21:9–11):</strong> Przeznaczonej dla syna przysługiwał status córki, a odmowa pożywienia, odzieży lub prawa małżeńskiego skutkowała natychmiastowym uwolnieniem bez okupu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            ŚWIĘTOŚĆ ŻYCIA, MIASTO SCHRONIENIA I ZAKAZ HANDLU LUDŹMI (WJ 21:12–17)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>13. Odpowiedzialność za odebranie życia (21:12):</strong> Śmiertelne uderzenie człowieka podlegało najwyższej karze, ponieważ życie każdego człowieka niesie obraz Boży (Rdz 9:6).</p>
            <p><strong>14. Odróżnienie wypadku od premedytacji (21:13):</strong> Jeśli sprawca nie czyhał na bliźniego, Bóg zapowiada ustanowienie miejsca schronienia dla ochrony przed pochopną zemstą (Lb 35:11–12).</p>
            <p><strong>15. Brak azylu przy ołtarzu dla mordercy (21:14):</strong> Kto podstępnie zaplanował zabójstwo bliźniego, nie mógł schronić się za ołtarzem — należało oddać go w ręce sprawiedliwości (1 Krl 2:28–34).</p>
            <p><strong>16. Koniec bezkarności pod pozorem religii (21:14):</strong> Rytuał świątynny nigdy nie usprawiedliwia zbrodni ani nie zwalnia od odpowiedzialności moralnej.</p>
            <p><strong>17. Ochrona rodziców przed przemocą (21:15):</strong> Uderzenie ojca lub matki było atakiem na fundament domu oraz piąte przykazanie Dekalogu.</p>
            <p><strong>18. Bezwzględny zakaz uprowadzenia człowieka (21:16):</strong> Porwanie i sprzedaż człowieka (albo przetrzymywanie porwanej ofiary) karano śmiercią — Biblia stanowczo potępia handel ludźmi (1 Tm 1:10).</p>
            <p><strong>19. Ciężar złorzeczenia rodzicom (21:17):</strong> Zuchwałe przeklinanie i pogarda wobec ojca i matki niszczyły jedność wspólnoty Przymierza (por. Mt 15:4).</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            SPRAWIEDLIWOŚĆ PRZY OBRAŻENIACH, OCHRONA DZIECKA I LEX TALIONIS (WJ 21:18–27)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>20. Odszkodowanie za czas leczenia (21:18–19):</strong> Jeśli pobity w kłótni wyzdrowiał i chodził o lasce, sprawca pokrywał stratę zarobków i pełne koszty leczenia.</p>
            <p><strong>21. Kara za śmiertelne pobicie sługi (21:20–21):</strong> Śmierć sługi pod ręką bijącego go pana pociągała karę — było to przełomem w porównaniu do praw pogańskich dających panu nieograniczoną władzę nad życiem niewolnika.</p>
            <p><strong>22. Kwalifikacja prawna przy braku zamiaru śmierci (21:21):</strong> Przeżycie dnia lub dwóch oddzielało w sądzie pobicie bez zamiaru zabójstwa od morderstwa, nie pochwalając jednak samej przemocy.</p>
            <p><strong>23. Ochrona kobiety brzemiennej (21:22):</strong> Przypadkowe uderzenie kobiety ciężarnej powodowało odpowiedzialność finansową orzekaną przy udziale sędziów (<em>pelilim</em>), nawet bez trwałego uszczerbku.</p>
            <p><strong>24. Pełna wartość życia w razie szkody (21:23):</strong> W razie uszczerbku lub śmierci obowiązywała zasada „życie za życie” (<em>nefesz tachat nafesz</em>), broniąca również życia dziecka w łonie matki.</p>
            <p><strong>25. Prawdziwy cel zasady „oko za oko” (21:24–25):</strong> Reguła <em>lex talionis</em> służyła sędziom do ograniczenia odwetu — kara nie mogła przekroczyć miary wyrządzonej krzywdy i zabraniała prywatnej wendety.</p>
            <p><strong>26. Natychmiastowe wyzwolenie skrzywdzonego sługi (21:26–27):</strong> Wybicie oka lub nawet jednego zęba słudze czy niewolnicy dawało im natychmiastową, bezwarunkową wolność.</p>
            <p><strong>27. Uznanie cielesnej godności sługi (21:26–27):</strong> Ciało sługi nie było rzeczą do bezkarnego niszczenia, lecz pozostawało pod ochroną samego Boga.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            ODPOWIEDZIALNOŚĆ CYWILNA ZA SZKODY I ZAGROŻENIA (WJ 21:28–36)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>28. Wypadek nieprzewidziany ze zwierzęciem (21:28):</strong> Jeśli łagodny dotąd wół zabił człowieka, zwierzę kamienowano na znak szacunku dla krwi ludzkiej, lecz właściciel był niewinny.</p>
            <p><strong>29. Ciężkie niedbalstwo właściciela (21:29):</strong> Gdy zwierzę było już wcześniej znane jako groźne i ostrzegano właściciela, jego zaniedbanie groziło najwyższą odpowiedzialnością za śmierć ofiary.</p>
            <p><strong>30. Instytucja okupu za życie (21:30):</strong> Przy braku bezpośredniego zamiaru zbrodni sąd mógł wyznaczyć okup (<em>kopher</em> / <em>pidjon nafszó</em>), ratując winowajcę i wspierając rodzinę zmarłego.</p>
            <p><strong>31. Równość dzieci przed prawem (21:31):</strong> Zabity syn lub córka mieli przed sądem dokładnie taką samą wartość i ochronę jak dorośli.</p>
            <p><strong>32. Trzydzieści syklów srebra za sługę (21:32):</strong> Odszkodowanie w wysokości 30 syklów srebra stało się później przejmującą zapowiedzią ceny, za jaką zdradzono Jezusa (Za 11:12–13; Mt 26:15).</p>
            <p><strong>33. Odkryta studnia jako zawinione zagrożenie (21:33–34):</strong> Kto wykopał lub otworzył studnię i jej nie przykrył, odpowiadał za upadek cudzego wołu lub osła.</p>
            <p><strong>34. Pełne wyrównanie straty (21:34):</strong> Winny zaniedbania musiał wynagrodzić (<em>jeszalem</em> — przywrócić całość i pokój) pełną wartość szkody sąsiadowi.</p>
            <p><strong>35. Sprawiedliwy podział przy wypadku losowym (21:35):</strong> Gdy dwa łagodne woły walczyły bez winy właścicieli, obaj sąsiedzi dzielili stratę i zysk po połowie.</p>
            <p><strong>36. Pełna restytucja po zlekceważeniu ostrzeżenia (21:36):</strong> Właściciel wiedzący o zagrożeniu ze strony własnego wołu oddawał żywe zwierzę za zabite bez dzielenia straty.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 21:1–36)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>37. Miłość Boga przekuta w codzienną etykę:</strong> Dekalog wskazuje kierunek serca, a Księga Przymierza pokazuje, jak miłość bliźniego działa w pracy, rodzinie i sąsiedztwie.</p>
            <p><strong>38. Wolność w Chrystusie przeciw wyzyskowi:</strong> Wykupieni krwią Jezusa nie mogą traktować słabszych jako narzędzi bez godności (Ef 6:9).</p>
            <p><strong>39. Sprawiedliwość naprawcza zamiast odwetu:</strong> Celem biblijnego sądu jest przywrócenie pokoju i całości (<em>szalem</em>), a nie eskalacja nienawiści.</p>
            <p><strong>40. Miszpatim (מִשְׁפָּטִים):</strong> Sprawiedliwe wyroki i zasady stosujące Boże Prawo w praktyce codziennej.</p>
            <p><strong>41. Chofszii chinnam (חׇפְשִׁי חִנָּם):</strong> Darmowe wyjście na wolność bez wykupu jako obraz zbawienia z łaski.</p>
            <p><strong>42. Ahaw (אָהֵב):</strong> Miłość, z której sługa dobrowolnie oddaje się na stałą służbę przy domu pana.</p>
            <p><strong>43. Nefesz (נֶפֶשׁ):</strong> Życie ludzkie chronione na równi u wolnych, sług, kobiet i dzieci.</p>
            <p><strong>44. Kopher (כֹּפֶר):</strong> Okup zwalniający życie od wyroku — pojęcie dopełnione na krzyżu Chrystusa.</p>
            <p><strong>45. Jeszalem (יְשַׁלֵּם):</strong> Uczciwe wynagrodzenie straty i odbudowanie zaufania we wspólnocie.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis51}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 6.9 Jezus w Centrum
const jesus51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Chrystus Sługą z Miłości, Wykupicielem za Trzydzieści Srebrników i Naszym Okupem
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Wieczny Syn Boży w postaci Sługi (Flp 2:6–8):</strong> Jezus Chrystus ogołocił samego Siebie i z miłości do Ojca oraz grzeszników przyjął postać sługi aż do śmierci krzyżowej — dokładnie jak wierny sługa z Wj 21:5–6 oddający się na służbę z miłości.
          </p>
          <p>
            <strong>2. Wyceniony na trzydzieści srebrników (Wj 21:32; Za 11:12–13; Mt 26:15):</strong> W Wj 21:32 odszkodowanie za zabitego sługę wynosiło trzydzieści syklów srebra; za tę samą cenę sługi Judasz wydał Pana chwały, obnażając ślepotę grzesznego świata.
          </p>
          <p>
            <strong>3. Doskonały Okup (kopher) za nasze życie (Wj 21:30; Mt 20:28; 1 Tm 2:5–6):</strong> Żadne srebro ani złoto nie mogło wykupić nas spod wyroku Prawa — Syn Człowieczy oddał własne życie jako jedyny wystarczający okup za wielu (1 P 1:18–19).
          </p>
          <p>
            <strong>4. Blizny wierności z miłości do Kościoła (Ps 40:7–9; Hbr 10:5–7):</strong> Symbolika przekłutego ucha przy drzwiach domu znajduje głębokie echo w posłuszeństwie Jezusa, którego ciało zostało przebite na drzewie krzyża dla naszego wyzwolenia.
          </p>
          <p>
            <strong>5. Prawdziwe Miasto Schronienia (Wj 21:13; Hbr 6:18):</strong> Tak jak sprawca wypadku znajdował ocalenie w wyznaczonym mieście ucieczki, tak każdy grzesznik znajduje dziś pewny ratunek w Jezusie Chrystusie.
          </p>
          <p>
            <strong>6. Od sądowej miary do miłości nieprzyjaciół (Wj 21:24; Mt 5:38–42):</strong> Jezus wzywa swoich uczniów, aby zamiast prywatnej zemsty powierzali sąd Bogu i zwyciężali zło dobrem (Rz 12:19).
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=21" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus51}\n      $2`
);

// 6.10 Sprawdź w Biblii
const compare51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:2 → J 8:34–36</strong>: Jak Syn Boży daje prawdziwą wolność bez wykupu niewolnikom grzechu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:5–6 → Flp 2:5–8</strong>: Jak dobrowolna służba z miłości zapowiada uniżenie Jezusa Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:6 → Ps 40:7–9; Hbr 10:5–7</strong>: Co oznacza otwarte ucho i gotowość ciała do pełnienia woli Ojca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:13 → Lb 35:11–12</strong>: W jaki sposób miasta schronienia chroniły sprawców wypadków przed zemstą?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:14 → 1 Krl 2:28–34</strong>: Dlaczego ołtarz Boży nie mógł chronić podstępnego zabójcy?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:15,17 → Mt 15:4–6</strong>: Jak Jezus przypomniał świętość szacunku i wsparcia wobec rodziców?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:16 → 1 Tm 1:9–10</strong>: Dlaczego Nowy Testament stawia porywaczy ludzi na równi z ciężkimi przestępcami?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:22–23 → Ps 139:13–16</strong>: Jak Pismo Święte ukazuje Bożą troskę o dziecko jeszcze w łonie matki?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:24–25 → Mt 5:38–42; Rz 12:19</strong>: Jak odróżnić sądową proporcjonalność od osobistego odwetu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:26–27 → Ef 6:9; Kol 4:1</strong>: Do jakiej sprawiedliwości wobec podwładnych zobowiązani są wierzący?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:30 → Mt 20:28; 1 P 1:18–19</strong>: Dlaczego wyłącznie krew Chrystusa stanowi wystarczający okup za duszę?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 21:32 → Za 11:12–13; Mt 26:15</strong>: Co łączy odszkodowanie za zabitego sługę z trzydziestoma srebrnikami Judasza?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare51}\n      $2`
);

// 6.11 Prawda na dziś
const truth51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Księgi Przymierza dla Codzienności — Godność Słabych i Odpowiedzialność
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Prawdziwa pobożność broni najsłabszych:</strong> Bóg zaczyna prawo Przymierza od sługi, wykupionej córki i kobiety brzemiennej — tak samo patrzmy na słabszych wokół nas.</p>
          <p>• <strong>2. Najpiękniejsza służba wynika z miłości:</strong> Chrześcijanin nie służy Bogu ze strachu przed karą, lecz jak sługa wierny z miłości do Pana.</p>
          <p>• <strong>3. Wyzysk i handel ludźmi są zbrodnią przed Bogiem:</strong> Każdy zysk budowany na zniewoleniu lub zastraszeniu człowieka spotyka się ze sprzeciwem Stwórcy.</p>
          <p>• <strong>4. Każde życie ludzkie ma bezcenną wartość:</strong> Troska o życie poczęte, bezpieczeństwo dzieci i starszych jest sprawdzianem wierności Przymierzu.</p>
          <p>• <strong>5. Sprawiedliwość nie jest prywatnym odwetem:</strong> Oddaj gniew i wyrok Bogu oraz prawu zamiast szukać osobistej zemsty.</p>
          <p>• <strong>6. Odpowiadamy za własne zaniedbania:</strong> Niezabezpieczona „studnia” (brak wyobraźni i niedbalstwo) jest zawinioną krzywdą bliźniego.</p>
          <p>• <strong>7. Zadośćuczynienie odbudowuje pokój:</strong> Kto wyrządził szkodę, nie kończy na wymówkach, lecz uczciwie ją naprawia.</p>
          <p>• <strong>8. Twoją wolność opłacił Sługa Chrystus:</strong> Świat wycenił Go na trzydzieści srebrników, lecz dla nas Jego krew jest bezcennym okupem zbawienia.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth51}\n      $2`
);

// 6.12 Pomyśl
const questions51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Jak traktujesz osoby, które są od Ciebie zależne służbowo, rodzinnie lub finansowo i nie mają siły się bronić?</p>
          <p>2. Czy Twoja służba Bogu przypomina przymus odrabiania długu, czy dobrowolną wierność z miłości do Jezusa Chrystusa?</p>
          <p>3. Czy w swoich słowach i czynach okazujesz trwałą cześć i troskę swoim rodzicom oraz osobom starszym?</p>
          <p>4. Gdzie w swoim sercu ulegasz pokusie prywatnego odwetu zamiast powierzenia sprawiedliwości Bogu?</p>
          <p>5. Jakie „odkryte studnie” — niedopilnowane obowiązki, ryzykowne nawyki lub zaniedbania — zagrażają bezpieczeństwu innych wokół Ciebie?</p>
          <p>6. Czy potrafisz wziąć pełną odpowiedzialność i naprawić wyrządzoną szkodę zamiast szukać winnych na zewnątrz?</p>
          <p>7. Co budzi w Twoim sercu świadomość, że Chrystus Sługa przyjął cenę trzydziestu srebrników, aby stać się Twoim okupem?</p>
          <p>8. Komu dzisiaj możesz okazać konkretną ochronę, sprawiedliwość lub serdeczne wsparcie w imię Jezusa?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions51}\n      $2`
);

// 6.13 Quiz nagłówek
html = html.replace(
  /20 Pytań z Wj 20 \(Sprawdź swoją wiedzę\)/g,
  `20 Pytań z Wj 21 (Sprawdź swoją wiedzę)`
);
html = html.replace(/Po przeczytaniu Wj 20/g, `Po przeczytaniu Wj 21`);

// 6.14 Twoja decyzja
const decision51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Chroń Godność Słabych i Służ z Miłości Wykupionych!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty pierwszy rozdział Księgi Wyjścia przypomina, że Bóg Przymierza patrzy nie tylko na nasze słowa podczas modlitwy, lecz również na umowy, traktowanie słabszych, ochronę życia poczętego oraz gotowość do naprawiania szkód wynikłych z naszego zaniedbania.
          </p>
          <p>
            Ponieważ Jezus Chrystus sam przyjął postać Sługi i oddał Siebie na okup za naszą wolność, nie musimy już bronić własnych interesów cudzym kosztem. Podejmij dziś konkretną decyzję: stań po stronie sprawiedliwości, szacunku i odpowiedzialności mocą Ducha Świętego!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Dziękuję Ci, Panie Jezu Chryste, że przyjąłeś postać Sługi i zapłaciłeś za mnie bezcenny okup swojej krwi. Świadomie wybieram dziś szacunek dla godności każdego człowieka, troskę o życie i bezpieczeństwo bezbronnych oraz pełną odpowiedzialność za moje słowa, pracę i naprawienie wszelkich wyrządzonych szkód.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision51}\n      $2`
);

// 6.15 Modlitwa
html = html.replace(
  /<span>Modlitwa na 19 listopada<\/span>/g,
  `<span>Modlitwa na 20 listopada</span>`
);
const prayer51 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Wrażliwość na Godność Słabych i Wierną Służbę z Miłości
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Sprawiedliwy i Miłosierny Boże! Dziękujemy Ci za dwudziesty pierwszy rozdział Księgi Wyjścia, w którym odsłaniasz swoje ojcowskie serce wobec sług, kobiet, dzieci, nienarodzonych oraz wszystkich skrzywdzonych przez ludzkie niedbalstwo lub chciwość.
          </p>
          <p>
            Wyznajemy przed Tobą chwile naszej obojętności, ostrych słów wobec osób od nas zależnych, prób zrzucania winy na okoliczności oraz zaniedbań, które naraziły kogokolwiek na stratę lub ból. Przepraszamy za pragnienie odwetu i brak czujności tam, gdzie należało zadbać o bezpieczeństwo bliźniego.
          </p>
          <p>
            Panie Jezu Chryste, Ty stałeś się Sługą z miłości i oddałeś swoje życie na okup za nasze winy, choć świat wycenił Cię na trzydzieści srebrników. Otwórz nasze uszy na Twój głos i uczyń nas ludźmi pokoju, prawdy oraz uczciwego zadośćuczynienia.
          </p>
          <p>
            Błogosław dzisiaj naszym rodzinom, miejscom pracy i każdemu spotkanemu człowiekowi. Strzeż życia ludzkiego i prowadź nas w wolności dzieci Bożych. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer51}\n      $2`
);

// 6.16 Zadania na dziś (7 zadań)
const tasks51 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=21" class="text-amber-300 underline font-semibold">Wj 21:1–36</a> w przekładzie UBG oraz hymn o Słudze w Flp 2:5–11.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 21:2 i dziękuj Bogu za wolność darowaną bez żadnego wykupu w Jezusie Chrystusie.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Okaż dziś wyraźny szacunek i życzliwość osobie na niższym stanowisku, usługodawcy albo komuś zależnemu od Twoich decyzji.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Zabezpiecz jedną „odkrytą studnię” w domu lub pracy — usuń zaniedbanie mogące narazić innych na szkodę.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Jeśli zwlekasz z naprawieniem drobnej straty lub dotrzymaniem obietnicy, ureguluj tę sprawę jeszcze dzisiaj.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zastąp odruch odwetu w rozmowie lub komentarzach spokojną sprawiedliwością i modlitwą o pokój.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 51 jako ukończony i prześlij lekcję komuś, kto pyta o sens praw Starego Testamentu.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks51}\n        $2`
);

// 6.17 Zapowiedź: Jutro (Dzień 52)
const tomorrow51 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 21 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 52 — PRAWO WŁASNOŚCI, ZADOŚĆUCZYNIENIA I ŚWIĘTOŚCI LUDU BOŻEGO (Wj 22:1–31)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 52: W dwudziestym drugim rozdziale Księgi Wyjścia zobaczymy biblijne prawo ochrony mienia, wielokrotnego zadośćuczynienia, opieki nad cudzoziemcem, wdową i sierotą oraz wezwanie do świętości ludu Bożego.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (21 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow51}`
);

// 6.18 JavaScript: QUIZ_DATA (20 pytań z Wj 21:1-36), DAY_KEY, completeDay51, TTS
const quizData51 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 21:1–36) ──
    const QUIZ_DATA = [
      {
        q: "Jak długo według Wj 21:2 miał służyć kupiony niewolnik – Hebrajczyk, zanim wyszedł na wolność bez wykupu?",
        a: ["Trzy lata, a w czwartym roku na wolność", "Sześć lat, a w siódmym roku wyjdzie na wolność bez wykupu", "Dziesięć lat, a potem za podwójnym wykupem", "Dwanaście lat aż do roku jubileuszowego"],
        c: 1
      },
      {
        q: "Co działo się z żoną niewolnika hebrajskiego, jeśli był żonaty już przed rozpoczęciem służby (Wj 21:3)?",
        a: ["Pozostawała na stałe w domu pana", "Musiała zapłacić dodatkowy wykup w srebrze", "Jego żona odchodziła razem z nim na wolność", "Przechodziła na własność sędziów"],
        c: 2
      },
      {
        q: "Kto zachowywał żonę i dzieci urodzone w czasie służby, jeśli to pan dał słudze żonę (Wj 21:4)?",
        a: ["Należały do pana, a sługa odchodził sam", "Odchodziły zawsze do sąsiedniego pokolenia", "Przechodziły pod opiekę kapłanów przybytku", "Zostawały sprzedane do Egiptu"],
        c: 0
      },
      {
        q: "Co mógł zadeklarować sługa w Wj 21:5, jeśli nie chciał opuszczać swego pana i rodziny?",
        a: ["Że chce otrzymać połowę majątku pana", "Kocham mojego pana, moją żonę i moich synów, nie wyjdę na wolność", "Że zamierza uciec na pustynię Synaj", "Że przejmuje dom pana po siódmym roku"],
        c: 1
      },
      {
        q: "Dokąd prowadził pan sługę chcącego pozostać na zawsze i jaki znak wykonywał według Wj 21:6?",
        a: ["Do namiotu Mojżesza i wręczał mu laskę", "Przed sędziów oraz do drzwi lub ich słupka, gdzie szydłem przekłuwał mu ucho", "Nad brzeg Jordanu i obmywał mu ręce", "Na szczyt góry i zakładał mu żelazny łańcuch"],
        c: 1
      },
      {
        q: "Czego nie miał prawa uczynić pan wobec niewolnicy hebrajskiej przeznaczonej na małżonkę, jeśli mu się nie spodobała (Wj 21:8)?",
        a: ["Pozwolić na jej odkupienie przez rodzinę", "Zapewnić jej pożywienia i odzieży", "Sprzedać jej obcemu ludowi, ponieważ zrobiłby jej krzywdę", "Wydać jej za mąż za swojego syna"],
        c: 2
      },
      {
        q: "Jakie trzy rzeczy musiał zapewnić mąż pierwszej żonie, jeśli wziął sobie jeszcze inną (Wj 21:10–11)?",
        a: ["Srebro, złoto i stado owiec", "Pożywienie, ubranie oraz prawo małżeńskie", "Osobny dom, rydwan i dwóch sług", "Pole pszenicy, winnicę i studnię"],
        c: 1
      },
      {
        q: "Co Bóg obiecał ustanowić w Wj 21:13 dla człowieka, który zabił kogoś nieumyślnie, nie czyhając na niego?",
        a: ["Podwójną opłatę w miedzi", "Miejsce, do którego będzie mógł uciec", "Zwolnienie od wszelkich praw w obozie", "Siedem dni postu przed sądem"],
        c: 1
      },
      {
        q: "Co nakazywało prawo w Wj 21:14 wobec mordercy, który podstępnie czyhał na bliźniego i zabił go?",
        a: ["Mógł bezpiecznie schronić się w świątyni na zawsze", "Nawet od Bożego ołtarza należało go zabrać, aby umarł", "Wystarczyło, że przeprosił starszych ludu", "Oddawał dziesięć wołów jako zadośćuczynienie"],
        c: 1
      },
      {
        q: "Jaka kara groziła według Wj 21:16 człowiekowi, który uprowadził kogoś i sprzedał lub przetrzymywał u siebie?",
        a: ["Grzywna w wysokości trzydziestu syklów", "Poniesie śmierć", "Sześć lat pracy w polu", "Wygnanie na trzy miesiące"],
        c: 1
      },
      {
        q: "Jakie czyny przeciw rodzicom w Wj 21:15 i Wj 21:17 były karane śmiercią?",
        a: ["Niezgodność w wyborze zawodu lub domu", "Uderzenie ojca lub matki oraz złorzeczenie ojcu lub matce", "Wyjazd z obozu przed zachodem słońca", "Zadawanie pytań podczas składania ofiar"],
        c: 1
      },
      {
        q: "Co musiał zapłacić sprawca bójki według Wj 21:19, gdy pobity mężczyzna wstał i zaczął chodzić o lasce?",
        a: ["Zostawał skazany na wygnanie z pokolenia", "Wypłacał odszkodowanie i łożył na jego leczenie", "Oddawał połowę swojej ziemi", "Nie ponosił żadnych kosztów leczenia"],
        c: 1
      },
      {
        q: "Co działo się według Wj 21:20, jeśli ktoś uderzył kijem swego niewolnika lub niewolnicę tak, że umarli pod jego ręką?",
        a: ["Był całkowicie zwolniony od winy", "Musiał ponieść karę", "Płacił jedynie jednego sykla sędziom", "Składał ofiarę z gołębi bez wyroku"],
        c: 1
      },
      {
        q: "Kto według Wj 21:22 ustalał wysokość kary, gdy podczas bójki uderzono kobietę brzemienną, lecz nie doszło do trwałej szkody?",
        a: ["Wyłącznie sąsiedzi sprawcy", "Nakładał ją mąż kobiety, a sprawca dawał według uznania sędziów", "Losowano kwotę przy ołtarzu", "Sprawca sam wybierał grzywnę"],
        c: 1
      },
      {
        q: "Jaką miarę sprawiedliwości ustanawia prawo w Wj 21:23–25 w razie dojścia do szkody?",
        a: ["Dziesięć razy surowszy odwet niż szkoda", "Życie za życie, oko za oko, ząb za ząb, rękę za rękę, nogę za nogę, oparzenie za oparzenie, ranę za ranę, siniec za siniec", "Całkowity zakaz wymierzania jakichkolwiek wyroków", "Karę zależną wyłącznie od majątku pokrzywdzonego"],
        c: 1
      },
      {
        q: "Co zyskiwał niewolnik lub niewolnica w Wj 21:26–27, gdy pan wybił im oko albo choćby jeden ząb?",
        a: ["Podwójną rację chleba przez rok", "Pan musiał natychmiast wypuścić ich na wolność", "Otrzymywali jednego wołu", "Mogli skrócić służbę o jeden miesiąc"],
        c: 1
      },
      {
        q: "Co działo się według Wj 21:29–30, jeśli wół bódł już wcześniej, właściciela ostrzegano, a mimo to nie pilnował go i zwierzę zabiło człowieka?",
        a: ["Właściciel oddawał tylko skórę zwierzęcia", "Wół był ukamienowany i właściciel ponosił śmierć lub wyznaczony przez sąd okup za duszę", "Sąd karał jedynie pasterza z sąsiedniego namiotu", "Zwierzę wypuszczano na pustynię"],
        c: 1
      },
      {
        q: "Jakie odszkodowanie według Wj 21:32 wynosiła strata niewolnika lub niewolnicy ubodzonych przez wołu?",
        a: ["Pięć syklów złota", "Trzydzieści syklów srebra, a wół miał być ukamienowany", "Dziesięć syklów miedzi", "Sto owiec i dwa osły"],
        c: 1
      },
      {
        q: "Kto według Wj 21:33–34 ponosił winę i musiał wynagrodzić stratę, jeśli wół lub osioł wpadł w wykopaną i niezabezpieczoną studnię?",
        a: ["Właściciel zwierzęcia, bo nie pilnował drogi", "Właściciel tej studni, który musiał wyrównać stratę", "Cała rada starszych obozu", "Nikt nie odpowiadał za wypadek w nocy"],
        c: 1
      },
      {
        q: "Czym różnił się wyrok w Wj 21:36 od Wj 21:35, gdy wół zabił wołu sąsiada, ale właściciel zlekceważył wcześniejsze ostrzeżenia o swoim zwierzęciu?",
        a: ["Dzielił się zapłatą za żywego wołu po połowie", "Musiał oddać żywego wołu za wołu, a zdechłe zwierzę należało do niego", "Oddawał tylko połowę ceny skóry", "Nie musiał płacić niczego, jeśli zwierzęta walczyły w dzień"],
        c: 1
      }
    ];`;

html = html.replace(
  /\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/,
  quizData51
);
html = html.replace(
  /Doskonale! Znasz na wskroś 20\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 21. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day50_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day50'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay50/g, `completeDay${DAY_NUM}`);
html = html.replace(
  /Oznacz Dzień 50 jako ukończony/g,
  `Oznacz Dzień ${DAY_NUM} jako ukończony`
);
html = html.replace(/Dzień 50 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 21:2.")`
);
html = html.replace(
  /cc-daily-course-share\.js\?v=[\w.-]+/g,
  `cc-daily-course-share.js?v=20261114_share2`
);

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach
const cleanUrlPaths = [
  path.join(REPO, `akademia/kurscodzienny/dzien-${DAY_NUM}.html`),
  path.join(REPO, `akademia/kurscodzienny/dzien-${DAY_NUM}/index.html`),
  path.join(REPO, `kursy/kurscodzienny/dzien-${DAY_NUM}.html`),
  path.join(REPO, `kursy/kurscodzienny/dzien-${DAY_NUM}/index.html`),
];
for (const p of cleanUrlPaths) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 51.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-20/
fs.mkdirSync(QUEUE_DIR, { recursive: true });
fs.writeFileSync(path.join(QUEUE_DIR, 'lekcja.html'), html, 'utf8');

fs.writeFileSync(
  path.join(QUEUE_DIR, 'meta.json'),
  JSON.stringify(
    {
      data: DATE_STR,
      dzien: DAY_NUM,
      przygotowal: '@A001 (antigravity)',
      przygotowano: new Date().toISOString(),
      status: 'prepared_for_00_00',
      karta: {
        tytul: `Dzień ${DAY_NUM}: ${TITLE}`,
        opis:
          'Pierwsze ustawy Księgi Przymierza na Synaju: wolność sług w 7. roku, ochrona kobiet i nienarodzonych, zasada proporcjonalnej sprawiedliwości i odpowiedzialność za bliźniego.',
      },
    },
    null,
    2
  ),
  'utf8'
);

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
  fullText: v1TtsText,
  contentApp: v1TtsText,
  contentWeb: v2WebText,
  contentSms: v3SmsText,
  tvScript: v4VideoText,
  ccnArticle: v5ArticleText,
  imageUrl: `/${IMG_REL_PATH}`,
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
  publishedAt: `${DATE_STR}T00:00:00.000Z`,
  status: 'prepared_for_00_00',
};

fs.writeFileSync(
  path.join(QUEUE_DIR, 'rozwazanie.json'),
  JSON.stringify(rozwazanieJson, null, 2),
  'utf8'
);

console.log(
  `✅ Zapisano kompletny pakiet przedpublikacyjny w kolejka-publikacji/kurs-codzienny/${DATE_STR}/ (lekcja.html, meta.json, rozwazanie.json, obrazy/${IMG_FILENAME})`
);
