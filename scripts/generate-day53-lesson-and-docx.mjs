import fs from 'node:fs';
import path from 'node:path';
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
const DAY_NUM = 53;
const DATE_STR = '2026-11-22';
const DATE_FORMATTED = '22 LISTOPADA 2026 R. (NIEDZIELA)';
const DATE_SHORT_UPPER = '22 LISTOPADA 2026 • NIEDZIELA';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 23:1–33';
const TITLE =
  'SPRAWIEDLIWY SĄD, MIŁOŚĆ NIEPRZYJACIÓŁ, ROK SZABATOWY I ANIOŁ PRZYMIERZA';
const SUBTITLE =
  'Biblijna etyka prawdy w sądzie, nakaz czynnej pomocy nieprzyjacielowi, odpoczynek siódmego dnia i siódmego roku, trzy święta pielgrzymie oraz obietnica Anioła niosącego Imię PANA (Wj 23:1–33)';

const EXO23_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-023.json');
const exo23Data = JSON.parse(fs.readFileSync(EXO23_PATH, 'utf8'));
const verses = exo23Data.verses;

const v20 = verses.find((v) => v.number === 20)?.text || '';
const MEMORY_VERSE_QUOTE = v20.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 23:20 (UBG)`;

const THEME =
  'Dwudziesty trzeci rozdział Księgi Wyjścia stanowi wspaniałe zwieńczenie Księgi Przymierza (Wj 21–23), łącząc bezkompromisową sprawiedliwość sądową, radykalne miłosierdzie wobec wrogów, Boży rytm odpoczynku i dziękczynienia oraz proroczą obietnicę Anioła kroczącego przed ludem Bożym. Bóg zakazuje rozpowszechniania fałszywych wieści, ulegania presji tłumu oraz przyjmowania łapówek zaślepiających mędrców. Jednocześnie wzywa Izraelitę, by nawet zbłąkanego wołu wroga odprowadził z powrotem i pomógł podnieść osła upadającego pod ciężarem tego, kto go nienawidzi! Ziemia co siódmy rok ma odpocząć dla nakarmienia ubogich i dzikich zwierząt, siódmy dzień przynosi odetchnienie także sługom, przybyszom i zwierzętom, a trzy doroczne święta kierują wdzięczność ku Zbawicielowi. Na szczycie rozdziału Bóg ogłasza: „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem” (Wj 23:20) — zapowiadając samego Jezusa Chrystusa, niosącego Imię Ojca, uczącego kochać nieprzyjaciół (Mt 5:44) i prowadzącego swój lud do przygotowanego miejsca (J 14:2–3)!';

const IMG_FILENAME = 'kc_day_53_sprawiedliwy_sad_aniol_przymierza.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: William West (ok. 1793–1861), „Izraelici prowadzeni przez Słup Światła”, Bristol Museum & Art Gallery, Wikimedia Commons (domena publiczna) — Wj 23:20';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

if (!fs.existsSync(path.join(REPO, IMG_REL_PATH))) {
  throw new Error(`Brak przygotowanego obrazu Dnia 53: ${IMG_REL_PATH}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 23:1–9 — Prawda w sądzie, bezstronność wobec ubogiego i bogatego, czynna pomoc wrogowi oraz odrzucenie łapówki',
      from: 1,
      to: 9,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 23:10–19 — Rok szabatowy dla ziemi i ubogich, odpoczynek siódmego dnia oraz trzy doroczne święta PANA',
      from: 10,
      to: 19,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 23:20–33 — Obietnica Anioła Przymierza, błogosławieństwo chleba i wody oraz zakaz kompromisu z bałwochwalstwem',
      from: 20,
      to: 33,
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
            `<p><span class="verse-num">23:${v.number}</span> ${v.text}</p>`
        )
        .join('\n        ');
      return `${header}\n        ${ps}`;
    })
    .join('\n        ');
}

function buildVersesDocxText() {
  return verses.map((v) => `${v.number}. ${v.text}`).join('\n');
}

// ── 1. PAKIET 5 WERSJI ROZWAŻAŃ (Standard Antigravity) ──
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Trzeci

**Czy potrafisz płynąć pod prąd krzyczącej większości i podać pomocną dłoń temu, kto otwarcie Cię nie lubi?**

Zatrzymaj się w ten niedzielny poranek, dwudziestego drugiego listopada dwa tysiące dwudziestego szóstego roku. Weź spokojny, głęboki oddech i uświadom sobie, że zanim staniesz dziś przed wyzwaniami rozmów, wiadomości i ludzkich ocen, Bóg idzie już przed Tobą i zna każdy kamień na Twojej drodze. W świecie pełnym pośpiechu bardzo łatwo powtarzać niesprawdzone plotki, ulegać głośnej większości i zamykać serce na człowieka, który nas zranił. W ciszy porannej modlitwy zapytaj dziś szczerze swojego Ojca: Tato, czy bardziej boję się opinii tłumu, czy utraty Twojej prawdy i czystego sumienia?

W dwudziestym trzecim rozdziale Księgi Wyjścia docieramy do wspaniałego finału Księgi Przymierza. Zobacz, jak niezwykle aktualne są Boże słowa zapisane u stóp góry Synaj! Bóg mówi wprost: nie będziesz rozgłaszał fałszywych wieści i nie pójdziesz za większością, aby wyrządzić zło albo nagiąć sąd. Większość nie ma racji tylko dlatego, że krzyczy najgłośniej! Zaraz potem Pan dotyka najtrudniejszej struny ludzkiego serca: jeśli napotkasz błądzącego wołu swego wroga lub jego osła, musisz go odprowadzić, a jeśli zobaczysz, że osioł tego, który Cię nienawidzi, leży przygnieciony ciężarem, masz obowiązek mu pomóc! Następnie Pan przypomina o odrzuceniu łapówki, o szacunku dla przybysza, o roku szabatowym, w którym ziemia odpoczywa dla nakarmienia ubogich, oraz o odpoczynku siódmego dnia, aby odetchnęli także słudzy, przybysze i zwierzęta. Po wezwaniu na trzy doroczne święta wdzięczności rozdział osiąga swój zapierający dech w piersiach szczyt. Bóg ogłasza: Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem! W tym Aniele jest samo Imię Boga!

Psychologia odwagi cywilnej i dojrzałości emocjonalnej potwierdza, że człowiek wewnętrznie wolny nie szuka poklasku tłumu ani nie żywi się urazą, lecz potrafi rozdzielić osobistą niechęć od obowiązku zwykłej dobroci. Pomoc okazana przeciwnikowi rozbija spiralę wrogości i przywraca wewnętrzny pokój.

A w świetle Ewangelii odsłania się najgłębsze piękno tego rozdziału: Tym Aniołem Przymierza niosącym Imię Ojca i prowadzącym lud do przygotowanego miejsca jest sam Jezus Chrystus! To On wziął na Siebie nasz najcięższy ciężar grzechu, gdy byliśmy jeszcze nieprzyjaciółmi Boga, nauczył nas miłować nieprzyjaciół i złożył obietnicę: Idę, aby wam przygotować miejsce!

Jezus mówi dziś do Ciebie:
„Lecz ja wam mówię: Miłujcie waszych nieprzyjaciół, błogosławcie tym, którzy was przeklinają, dobrze czyńcie tym, którzy was nienawidzą i módlcie się za tych, którzy wam wyrządzają zło i prześladują was.” (Ewangelia według świętego Mateusza, rozdział piąty, werset czterdziesty czwarty, UBG) oraz „W domu mego Ojca jest wiele mieszkań. Gdyby tak nie było, powiedziałbym wam. Idę, aby wam przygotować miejsce.” (Ewangelia według świętego Jana, rozdział czternasty, werset drugi, UBG)

Zadanie Taktyczne:
Na swoim niedzielnym posterunku nie powtarzaj dzisiaj żadnej niesprawdzonej plotki ani złośliwego sądu o drugim człowieku. Jeśli wiesz o kimś, kto bywa wobec Ciebie chłodny lub trudny, okaż mu dziś nieoczekiwany gest życzliwości i módl się o jego dobro. Powierz wszystkie swoje plany Przewodnikowi drogi i wyznaj z ufnością: Idę naprzód nie sam, bo Ten, który nosi Imię Ojca, strzeże mnie w drodze i prowadzi do miejsca, które dla mnie przygotował!

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za Twoją prawdę, która nie ugina się przed naciskiem tłumu ani przekupstwem, i za Twoje serce pełne miłosierdzia nawet wobec tych, którzy nam szkodzą. Przepraszam Cię za chwile, gdy powtarzałem pochopne opinie, ulegałem ludzkiej presji albo odwracałem wzrok od ciężaru mojego bliźniego z powodu dawnej urazy. Panie Jezu Chryste, Ty jesteś moim wiernym Przewodnikiem, moim odpoczynkiem i Aniołem Przymierza, który idzie przede mną. Strzeż mnie w drodze, oddal ode mnie wszelkie sidła kompromisu ze złem, błogosław mój chleb i wodę oraz prowadź mnie bezpiecznie do domu Ojca. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Otwórz swoje serce na sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Wejdź do wspólnoty ludzi wiernych Pismu, buduj codzienny nawyk czytania Słowa Bożego i każdego dnia wzrastaj w poznaniu Jezusa Chrystusa.

Błogosławieństwo:
Niech PAN błogosławi Twój chleb i Twoją wodę, niech oddali od Twego domu wszelką chorobę i lęk, a Jego wierny Anioł niech strzeże Cię na każdej ścieżce tego tygodnia. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 53 (22 listopada 2026 r.)
📖 Księga Wyjścia 23:1–33: Sprawiedliwy Sąd, Miłość Nieprzyjaciół, Rok Szabatowy i Anioł Przymierza

Czy wiesz, że tysiąc pięćset lat przed Kazaniem na Górze Bóg nakazał Izraelitom pomagać nawet osłowi swojego wroga i obiecał posłać przed ludem Anioła niosącego Jego własne Imię?

W 53. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) zamykamy studium Księgi Przymierza w 23. rozdziale Księgi Wyjścia (Wj 23:1–33: https://polskieradio.cc/mojabiblia?book=EXO&chapter=23). Odkrywamy tu zadziwiającą jedność prawdy, odwagi cywilnej, czynnego miłosierdzia, rytmu odpoczynku i Bożej ochrony na drodze ku Ziemi Obiecanej.

Kluczowe filary dzisiejszego studium:
1. Prawda ponad presją tłumu i przekupstwem (Wj 23:1–3, 6–9): Zakaz szerzenia fałszywych wieści (w. 1), zakaz ulegania większości w wyrządzaniu zła (w. 2) i zakaz brania darów zaślepiających mądrych (w. 8) stają na straży czystego sumienia i rzetelnego sądu.
2. Czynna pomoc dla wroga i odpoczynek dla stworzenia (Wj 23:4–5, 10–19): Pismo nakazuje odprowadzić zbłąkane zwierzę nieprzyjaciela i ulżyć osłowi tego, kto nas nienawidzi (w. 4–5). Siódmy rok odłogu karmi ubogich, siódmy dzień daje odetchnienie wszystkim pracującym (w. 10–12), a trzy święta uczą wdzięczności przed PANEM (w. 14–19).
3. Anioł Przymierza i ostrzeżenie przed sidłem (Wj 23:20–33): „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem” (Wj 23:20, UBG). W Nim jest Imię PANA (w. 21), błogosławieństwo chleba i wody (w. 25) oraz stopniowe zwycięstwo bez kompromisu z bożkami (w. 29–33).

Jezus mówi dziś do Ciebie:
„Lecz ja wam mówię: Miłujcie waszych nieprzyjaciół, błogosławcie tym, którzy was przeklinają, dobrze czyńcie tym, którzy was nienawidzą i módlcie się za tych, którzy wam wyrządzają zło i prześladują was.” (Mt 5:44, UBG) | „Idę, aby wam przygotować miejsce.” (J 14:2, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 23:1–33 oraz Mt 5:43–48 i J 14:1–6.
• Wierz: Anioł Przymierza — Jezus Chrystus — idzie przed Tobą i strzeże Twojej drogi do domu Ojca.
• Działaj: Zatrzymaj dziś niesprawdzone plotki, nie ulegaj presji większości wbrew sumieniu i okaż praktyczną życzliwość osobie, z którą masz trudną relację.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-53

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://patronite.pl/osobowoscplus`;

const v3SmsText = `Dzień 53 (Wj 23:20): „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem”. Nie ulegaj tłumowi, pomagaj nawet wrogom! polskieradio.cc`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalne dzieło Williama Westa z domeny publicznej: lud Izraela kroczący przez górski wąwóz pustyni za wysokim, świetlistym Słupem Światła rozświetlającym niebo nad drogą ku Ziemi Obiecanej. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 53: SPRAWIEDLIWY SĄD, MIŁOŚĆ NIEPRZYJACIÓŁ I ANIOŁ PRZYMIERZA (WJ 23:1–33)”.

[INTRO: ODWAGA WOBEC TŁUMU I DOBROĆ DLA WROGA]
Noemi: Dzień dobry! Witamy bardzo serdecznie w pięćdziesiątym trzecim dniu naszej codziennej podróży przez sześćdziesiąt sześć ksiąg Biblii! Wczoraj rozważaliśmy prawo własności i litości przed zachodem słońca, a dziś kończymy lekturę Księgi Przymierza w dwudziestym trzecim rozdziale Księgi Wyjścia!
Sara: Witaj Noemi, witamy wszystkich widzów Christian Culture TV! Ten rozdział brzmi tak, jakby został napisany dokładnie na nasze współczesne czasy pełne dezinformacji, hejtu i presji medialnej! Zobaczmy już pierwsze dwa wersety: „Nie będziesz rozgłaszał fałszywych wieści... Nie idź za większością, aby wyrządzić zło”!
Noemi: Dokładnie tak! Bóg uczy, że większość nie ma racji tylko dlatego, że jest głośna. Chrześcijanin nie wchodzi w spółkę z fałszywym świadkiem, nie bierze łapówki, która „zaślepia mądrych”, i nie nagina sprawiedliwości ani z powodu biedy, ani z powodu bogactwa.

[ANALIZA PROBLEMOWA: OSIOŁ NIEPRZYJACIELA, ROK SZABATOWY I ŚWIĘTA]
Sara: Ale spójrzmy na wersety czwarty i piąty — to prawdziwy skarb Starego Testamentu! Jeśli spotkasz błądzącego wołu swego wroga, musisz go odprowadzić. A jeśli zobaczysz, że osioł człowieka, który Cię nienawidzi, upadł pod swoim ciężarem, Pismo mówi stanowczo: „nie odmówisz mu pomocy. Owszem, masz mu z nim pomóc”!
Noemi: To jest ewangelia w praktyce na półtora tysiąca lat przed Kazaniem na Górze! A zaraz po tym Bóg ustanawia piękny rytm miłosierdzia dla całej ziemi i stworzenia: co siódmy rok pola, winnice i sady oliwne odpoczywają, żeby mogli z nich jeść ubodzy i zwierzęta polne, a siódmego dnia odpoczywa człowiek wraz z wołem, osłem, synem niewolnicy i przybyszem!
Sara: Do tego dochodzą trzy wielkie doroczne święta: Święto Przaśników w miesiącu Abib na pamiątkę wyjścia z Egiptu, Święto Żniw pierwocin pracy oraz Święto Zbiorów pod koniec roku. Bóg przypomina: „Nie pokażecie się przede mną z pustymi rękami”, bo wdzięczność uczy serce pamiętać, od Kogo pochodzi chleb, woda i zdrowie!

[SŁOWO ROZKAZU: ANIOŁ PRZYMIERZA I JEZUS W CENTRUM]
Noemi: I spójrzmy na niesamowity finał z wersetów dwudziestego i dwudziestego pierwszego: „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem. Zważaj na niego i słuchaj jego głosu... gdyż moje imię jest w nim”!
Sara: To słowa przepełnione obecnością samego Jezusa Chrystusa! Żadne stworzenie nie nosi w sobie pełni Bożego Imienia i nie posiada władzy przebaczania grzechów — to przedwcielony Syn Boży, Anioł Przymierza! To On powiedział później swoim uczniom w Ewangelii Jana: „Idę, aby wam przygotować miejsce”, i to On wzywa nas, byśmy miłowali naszych nieprzyjaciół! A końcowe wersety rozdziału dodają jeszcze jedną mądrą pociechę: Bóg mówi „Pomału będę wypędzał wrogów, aż się rozmnożysz”, ostrzegając zarazem przed zawieraniem przymierza z obcymi bożkami, by nie stały się dla nas sidłem!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak przeżyć tę niedzielę w świetle dwudziestego trzeciego rozdziału Księgi Wyjścia?
• Czytaj: cały dwudziesty trzeci rozdział Księgi Wyjścia oraz piąty rozdział Ewangelii Mateusza i czternasty rozdział Ewangelii Jana.
• Wierz: Anioł Przymierza, w którym jest Imię PANA — Jezus Chrystus — strzeże Cię w drodze i prowadzi do przygotowanego miejsca.
• Działaj: zatrzymaj dziś każdą plotkę, nie daj się zastraszyć presji większości i zrób jeden dobry uczynek dla osoby, z którą trudno Ci się zgodzić!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Ojcze Niebieski, dziękujemy Ci za światło sprawiedliwości, odwagi i miłosierdzia płynące z Księgi Wyjścia. Przepraszamy Cię za chwile, gdy powtarzaliśmy niesprawdzone wieści, gdy baliśmy się sprzeciwić większości albo gdy zamykaliśmy serce na potrzebę kogoś, kto nas skrzywdził.
Noemi: Panie Jezu Chryste, nasz wierny Przewodniku i Aniele Przymierza! Prowadź nas bezpiecznie przez pustynię codziennych prób, naucz nas prawdziwego odpoczynku w Tobie, błogosław nasz chleb i wodę oraz chroń nas przed każdym sidłem kompromisu ze złem. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech Pan strzeże każdego Twojego kroku przez całą niedzielę i nowy tydzień!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym czwartym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: SPRAWIEDLIWY SĄD, POMOC NIEPRZYJACIELOWI, ROK SZABATOWY I ANIOŁ PRZYMIERZA — EGZEGEZA WJ 23:1–33
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 22 listopada 2026 r.

Dwudziesty trzeci rozdział Księgi Wyjścia (Wj 23:1–33) zamyka tzw. Księgę Przymierza (Wj 21–23) — najstarszy po Dekalogu zbiór ustaw społecznych, sądowych i liturgicznych Izraela. Tekst ten łączy trzy pozornie odległe dziedziny życia: bezstronność sądownictwa i odporność na dezinformację, rewolucyjną etykę miłości nieprzyjaciół oraz rytm szabatowego odpoczynku i pielgrzymich świąt pod opieką tajemniczego Anioła Przymierza.

1. Odporność na dezinformację, presję tłumu i korupcję (Wj 23:1–3, 6–9)
> „Nie będziesz rozgłaszał fałszywych wieści. Nie wchodź w spółkę z bezbożnym, by być fałszywym świadkiem. Nie idź za większością, aby wyrządzić zło...” — Księga Wyjścia 23:1–2 (UBG)

Pierwszy nakaz rozdziału uderza w źródło niesprawiedliwości społecznej: szerzenie niesprawdzonych lub kłamliwych wieści (hebr. שֵׁמַע שָׁוְא — *szema szaw*, Strong H8088 + H7723) oraz uleganie owczemu pędowi tłumu (*rabbim*). Biblijna sprawiedliwość odrzuca zarówno stronniczość na rzecz zamożnych i przekupstwo (שֹׁחַד — *szochad*, Strong H7810, które „zaślepia mądrych”, Wj 23:8), jak i fałszywą litość naginającą prawo na rzecz ubogiego wbrew prawdzie (Wj 23:3). Równocześnie w. 6 i 9 przypominają, by ubogiego i przybysza (*ger*, Strong H1616) nigdy nie pozbawiać należnego im sprawiedliwego procesu.

2. Etyka czynnej dobroci wobec wroga (Wj 23:4–5)
Pomiędzy przepisami procesowymi Bóg umieszcza nakaz przełamujący logikę plemiennej wrogości: Izraelita, który napotka zabłąkanego wołu lub osła swego nieprzyjaciela (*ojew*, Strong H0341), ma obowiązek go odprowadzić, a widząc osła człowieka nienawidzącego go leżącego pod ciężarem, nie może przejść obojętnie, lecz musi pomóc go podnieść (Wj 23:4–5). Tak Stary Testament kładzie podwaliny pod nauczanie Pana Jezusa o miłości nieprzyjaciół (Mt 5:44) oraz apostolskie wezwanie Pawła: „Nie daj się zwyciężyć złu, ale zło dobrem zwyciężaj” (Rz 12:21, UBG).

3. Rok szabatowy, siódmy dzień odetchnienia i trzy święta pielgrzymie (Wj 23:10–19)
Każdego siódmego roku ziemia, winnice i sady oliwne miały pozostawać odłogiem (czasownik שָׁמַט — *szamat*, Strong H8058 — „odpuścić / dać odpocząć”), aby z plonów samosiewu korzystali ubodzy oraz dzikie zwierzęta (Wj 23:10–11). Z kolei co siedem dni Szabat (שַׁבָּת — *szabat*, Strong H7676) zapewniał wytchnienie nie tylko właścicielom gospodarstw, lecz także zwierzętom roboczym, dzieciom niewolnic oraz przybyszom (Wj 23:12). Rytm roku dopełniały trzy radosne święta dziękczynienia (Przaśników w miesiącu Abib, Żniw z pierwocinami *bikkurim* H1061 oraz Zbiorów pod koniec roku, Wj 23:14–19).

4. Anioł niosący Imię PANA i stopniowe dziedziczenie obietnicy (Wj 23:20–33)
Zwieńczeniem rozdziału jest uroczysta obietnica Przewodnika drogi: „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem” (Wj 23:20, UBG). Słowo מַלְאָךְ (*malak*, Strong H4397 — „Posłaniec / Anioł”) zostało tu opatrzone nadzwyczajnymi atrybutami Boskości: ma On władzę odpuszczania lub nieodpuszczania przestępstw, żąda bezwzględnego posłuszeństwa, a sam Bóg wyznaje: „gdyż moje imię jest w nim” (Wj 23:21). Klasyczna chrystologia biblijna rozpoznaje w Tym Aniele Przymierza przedwcielonego Syna Bożego — Jezusa Chrystusa, który sam wyznał: „Idę, aby wam przygotować miejsce” (J 14:2, UBG). Bóg zapewnia również o stopniowym oczyszczaniu ziemi („Pomału będę ich wypędzał”, Wj 23:30) oraz przestrzega przed kompromisem z pogaństwem, aby nie stało się ono duchowym sidłem (מוֹקֵשׁ — *mokesz*, Strong H4170, Wj 23:33).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 23:1–33 ukazuje dojrzałą pobożność Przymierza: prawdę nieulegającą tłumom ani pieniądzom, czynną pomoc okazywaną nawet przeciwnikom, troskę o odpoczynek ludzi i stworzenia oraz niezłomne zaufanie Chrystusowi — Aniołowi Przymierza prowadzącemu swój lud do przygotowanej ojczyzny.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 53 (22 listopada 2026): Sprawiedliwy Sąd, Miłość Nieprzyjaciół, Rok Szabatowy i Anioł Przymierza (Wj 23:1–33)

====================================================================
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

${v5ArticleText}
`;

// ── 2. PEŁNA LEKCJA (12 OBOWIĄZKOWYCH SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH, 20 PYTAŃ QUIZU) ──
const quizItems = [
  {
    q: 'Jakich dwóch grzechów związanych z wypowiadaniem słów i zeznawaniem zakazuje pierwszy werset Księgi Wyjścia 23 (Wj 23:1)?',
    a: [
      'Rozgłaszania fałszywych wieści oraz wchodzenia w spółkę z bezbożnym, by być fałszywym świadkiem',
      'Rozmawiania z kupcami podczas święta Przaśników oraz pisania listów',
      'Wspominania imion przodków oraz zadawania pytań starszym w bramie',
      'Składania przysięgi w południe oraz milczenia przed sędziami',
    ],
    c: 0,
    exp: 'Wj 23:1 (UBG) brzmi: „Nie będziesz rozgłaszał fałszywych wieści. Nie wchodź w spółkę z bezbożnym, by być fałszywym świadkiem.”',
  },
  {
    q: 'Przed jaką pokusą w postępowaniu sądowym i społecznym przestrzega Wj 23:2?',
    a: [
      'Przed zbyt wczesnym zamykaniem bram obozu wieczorem',
      'Przed pójściem za większością, aby wyrządzić zło, i zeznawaniem pod jej presją, by naginać sąd',
      'Przed wysłuchiwaniem zeznań więcej niż dwóch świadków',
      'Przed powoływaniem sędziów z innych pokoleń Izraela',
    ],
    c: 1,
    exp: 'Wj 23:2 uczy odwagi cywilnej: prawda i sprawiedliwość nie zależą od głosu większości.',
  },
  {
    q: 'Czego wymaga bezstronność sędziowska w Wj 23:3 oraz Wj 23:6 w stosunku do osoby ubogiej?',
    a: [
      'Zawsze należy z góry uniewinnić ubogiego, nawet gdy złamał prawo',
      'Ubogiemu nie wolno w ogóle występować przed sądem',
      'Nie wolno okazywać bezprawnej przychylności ubogiemu wbrew prawdzie (w. 3), ale też nie wolno naginać jego sprawiedliwego sądu na jego niekorzyść (w. 6)',
      'Ubogi musiał wpłacić podwójną kaucję przed rozprawą',
    ],
    c: 2,
    exp: 'Zestawienie Wj 23:3 i 23:6 ukazuje idealną równowagę Bożej sprawiedliwości: ani stronniczej litości przeciw faktom, ani lekceważenia praw biednego.',
  },
  {
    q: 'Co należy uczynić według Wj 23:4, gdy napotka się błądzącego wołu albo osła swojego wroga?',
    a: [
      'Zostawić zwierzę na pustyni, aby nie rozmawiać z przeciwnikiem',
      'Zatrzymać je u siebie na siedem dni jako zastaw',
      'Oddać je najbliższemu kapłanowi na ofiarę',
      'Musisz odprowadzić je z powrotem do swojego wroga',
    ],
    c: 3,
    exp: 'Wj 23:4 (UBG): „Jeśli napotkasz błądzącego wołu swego wroga lub jego osła, musisz odprowadzić go do niego.”',
  },
  {
    q: 'Jak Bóg nakazuje postąpić w Wj 23:5, gdy zobaczy się osła człowieka, który nas nienawidzi, leżącego pod swoim ciężarem?',
    a: [
      'Nie odmówisz mu pomocy — owszem, masz mu razem z nim pomóc podnieść zwierzę',
      'Możesz przejść drugą stroną drogi, jeśli nie rozmawiacie od roku',
      'Wystarczy wezwać sąsiada, ale samemu nie wolno dotykać ciężaru',
      'Należy zabrać ładunek do czasu przeprosin ze strony właściciela',
    ],
    c: 0,
    exp: 'Wj 23:5 wzywa do czynnego miłosierdzia: nawet wobec osoby otwarcie wrogiej należy wspólnie dźwignąć ciężar.',
  },
  {
    q: 'Jakie zapewnienie dotyczące sprawiedliwości Boga wypowiada Wj 23:7?',
    a: [
      'Że każdy sąd odbywa się wyłącznie raz w roku',
      '„Trzymaj się z dala od nieuczciwej sprawy. Nie zabijaj niewinnego i sprawiedliwego, bo nie usprawiedliwię bezbożnego”',
      'Że wina oskarżonego wygasa po zachodzie słońca',
      'Że sędziowie są zwolnieni z odpowiedzialności za pomyłkę',
    ],
    c: 1,
    exp: 'Wj 23:7 przypomina o świętym charakterze Boga jako Najwyższego Sędziego, który nigdy nie uniewinnia nieprawości bezbożnego.',
  },
  {
    q: 'Dlaczego Bóg kategorycznie zabrania brania darów (łapówek) w Wj 23:8?',
    a: [
      'Ponieważ dary są zbyt trudne do podzielenia między starszych',
      'Ponieważ dary wolno składać jedynie w miesiącu Abib',
      'Ponieważ dar zaślepia mądrych i wypacza słowa sprawiedliwych',
      'Ponieważ srebro mogło być skażone w Egipcie',
    ],
    c: 2,
    exp: 'Wj 23:8 diagnozuje psychologię korupcji: przekupstwo odbiera jasność widzenia nawet ludziom mądrym i krzywi wyroki sprawiedliwych.',
  },
  {
    q: 'Czym Wj 23:9 motywuje zakaz uciskania przybysza?',
    a: [
      'Przepisy handlowe wymagały ochrony zagranicznych kupców',
      'Przybysze musieli pracować przez siedem dni w tygodniu',
      'Każdy przybysz otrzymywał podwójną działkę pola w Kanaanie',
      '„Bo sami wiecie, jak się czuje przybysz, gdyż byliście przybyszami w ziemi Egiptu”',
    ],
    c: 3,
    exp: 'Bóg odwołuje się do osobistego doświadczenia Izraela w Egipcie, by wykształcić w narodzie empatię wobec obcych i słabszych.',
  },
  {
    q: 'Jaki był główny cel pozostawiania ziemi, winnic i sadów oliwnych odłogiem w siódmym roku według Wj 23:10–11?',
    a: [
      'Aby ziemia odpoczęła, aby jedli z niej ubodzy ludu, a resztę zjadły zwierzęta polne',
      'Aby wysłać całą żywność w darze do Midianu',
      'Aby na rok całkowicie zakazać zbierania jakichkolwiek owoców przez kogokolwiek',
      'Aby spalić wszystkie stare krzewy winne i zasadzić nowe',
    ],
    c: 0,
    exp: 'Rok szabatowy w Wj 23:11 łączy odnowę ekologiczną ziemi z konkretną troską socjalną o ubogich oraz o dzikie stworzenia.',
  },
  {
    q: 'Kogo wymienia Wj 23:12 jako adresatów odpoczynku siódmego dnia poza samym gospodarzem?',
    a: [
      'Wyłącznie kapłanów i starszych pokoleń',
      'Twojego wołu i twojego osła, syna twojej niewolnicy oraz przybysza',
      'Tylko mężczyzn powyżej dwudziestego roku życia',
      'Wyłącznie podróżnych wracających z Morza Czerwonego',
    ],
    c: 1,
    exp: 'Wj 23:12 ukazuje miłosierdzie Szabatu rozciągające się na zwierzęta pociągowe, najemnych/sługi oraz przybyszów.',
  },
  {
    q: 'Czego Bóg zabrania wypowiadać ludzkimi ustami w Wj 23:13?',
    a: [
      'Nazw gór i rzek ziemi Kanaan',
      'Liczby dni pozostałych do końca żniw',
      'Imienia obcych bogów — „niech nie będzie słyszane z twoich ust”',
      'Prośby o błogosławieństwo chleba i wody',
    ],
    c: 2,
    exp: 'Wj 23:13 wzywa do czystości języka i pamięci: Izrael miał nie wspominać z czcią ani nie wzywać imion bożków pogańskich.',
  },
  {
    q: 'Ile razy w roku według Wj 23:14–17 wszyscy mężczyźni Izraela mieli obchodzić święto pielgrzymie przed Panem BOGIEM?',
    a: [
      'Raz w roku, wyłącznie w porze jesiennej',
      'Dwa razy w roku, na początku i w połowie zimy',
      'Siedem razy w roku, w każdym nowiu księżyca',
      'Trzy razy w roku: Święto Przaśników, Święto Żniw oraz Święto Zbiorów',
    ],
    c: 3,
    exp: 'Wj 23:14–17 ustanawia trzy doroczne święta: Przaśników (miesiąc Abib), Żniw (pierwociny) i Zbiorów (koniec roku).',
  },
  {
    q: 'Z jakim zastrzeżeniem wiązało się przybycie na Święto Przaśników w miesiącu Abib według Wj 23:15?',
    a: [
      '„Nie pokażecie się przede mną z pustymi rękami”',
      'Należało przynieść chleb na starym zakwasie',
      'Święto trwało tylko jeden dzień od rana do południa',
      'Udział brali jedynie mieszkańcy okolic Synaju',
    ],
    c: 0,
    exp: 'Wj 23:15 przypomina o wdzięczności serca wyrażonej darem przyniesionym przed oblicze Boga na pamiątkę wyjścia z Egiptu.',
  },
  {
    q: 'Jakich dwóch nieczystych praktyk kultowych zakazuje Wj 23:18–19 przy składaniu ofiar i pierwocin?',
    a: [
      'Przynoszenia młodych kłosów jęczmienia oraz śpiewania psalmów o świcie',
      'Ofiarowania krwi ofiary z chlebem kwaszonym, zostawiania tłuszczu przez noc aż do poranka oraz gotowania koźlęcia w mleku jego matki',
      'Zapalania lamp oliwnych przed wejściem do namiotu',
      'Przynoszenia pierwocin do domu PANA w koszach z trzciny',
    ],
    c: 1,
    exp: 'Wj 23:18–19 oddziela święty kult PANA od zakwasu zepsucia oraz od pogańskich rytuałów magiczno-płodnościowych (gotowania koźlęcia w mleku matki).',
  },
  {
    q: 'W jakim celu Bóg posyła Anioła przed Izraelem według obietnicy z Wj 23:20?',
    a: [
      'Aby zbudować kamienną twierdzę na pustyni Synaj',
      'Aby zwolnić lud z posłuszeństwa przykazaniom Przymierza',
      '„Aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem”',
      'Aby zamknąć granice przed wszystkimi przybyszami',
    ],
    c: 2,
    exp: 'Wj 23:20 (UBG): obietnica osobistego Przewodnika, Opiekuna w drodze i Tego, który doprowadzi lud do przygotowanego miejsca.',
  },
  {
    q: 'Dlaczego lud miał uważnie słuchać głosu Anioła z Wj 23:21 i nie pobudzać Go do buntu?',
    a: [
      'Ponieważ Anioł był zwykłym posłańcem z sąsiedniego narodu',
      'Ponieważ miał przebywać w obozie tylko przez siedem dni',
      'Ponieważ nikt nie słyszał Jego głosu aż do czasów Dawida',
      '„Bo nie przebaczy waszych przestępstw, gdyż moje imię jest w nim”',
    ],
    c: 3,
    exp: 'Obecność Bożego Imienia w Aniele oraz władza przebaczania lub sądzenia grzechów wskazuje na Boską tożsamość Przedwcielonego Chrystusa.',
  },
  {
    q: 'Jakie konkretne błogosławieństwa dla wiernie służącego ludu obiecuje Bóg w Wj 23:25–26?',
    a: [
      'Błogosławieństwo chleba i wody, oddalenie choroby, brak roniących i niepłodnych w ziemi oraz dopełnienie liczby dni',
      'Zwolnienie z wszelkiej pracy na polach i w winnicach na zawsze',
      'Natychmiastowe zniknięcie wszystkich zwierząt na pustyni',
      'Zbudowanie dwunastu miast ze złota bez żadnego wysiłku',
    ],
    c: 0,
    exp: 'Wj 23:25–26 wiąże wierną służbę jedynemu Bogu z codziennym zaopatrzeniem, zdrowiem, płodnością życia i pokojem długich dni.',
  },
  {
    q: 'Dlaczego Bóg zapowiada w Wj 23:29–30, że wypędzi mieszkańców Kanaanu „pomału”, a nie w jednym roku?',
    a: [
      'Ponieważ Bóg potrzebował więcej czasu na zebranie wojska',
      '„By ziemia nie zmieniła się w pustynię i nie namnożył się przeciwko tobie dziki zwierz” — aż Izrael się rozmnoży i posiądzie ziemię',
      'Aby Izraelici mogli nauczyć się kultu posągów od sąsiadów',
      'Ponieważ w siódmym roku nie wolno było przekraczać Jordanu',
    ],
    c: 1,
    exp: 'Boża mądrość w Wj 23:29–30 uczy cierpliwości w procesie wzrostu: przedwczesne oczyszczenie całego terenu bez gotowości do jego zagospodarowania przyniosłoby spustoszenie i zagrożenie ze strony dzikich zwierząt.',
  },
  {
    q: 'Jakie granice Ziemi Obiecanej wyznacza Bóg w Wj 23:31?',
    a: [
      'Jedynie dolinę w promieniu jednego dnia drogi od Synaju',
      'Tylko wschodni brzeg Nilu i góry Midianu',
      'Od Morza Czerwonego aż do Morza Filistynów, od pustyni aż do rzeki (Eufratu)',
      'Wyłącznie wzgórza wokół Jerycha i Hebronu',
    ],
    c: 2,
    exp: 'Wj 23:31 wyznacza pełne granice przymierza rozciągające się od Zatoki Akaba (Morze Czerwone) i Morza Śródziemnego (Morze Filistynów) aż po pustynię i rzekę Eufrat.',
  },
  {
    q: 'Przed jakim duchowym niebezpieczeństwem ostrzega ostatni werset rozdziału (Wj 23:33)?',
    a: [
      'Przed zbyt wysokimi plonami oliwek w szóstym roku',
      'Przed oddawaniem pierwocin do domu PANA bez zwłoki',
      'Przed pomaganiem wrogowi w podnoszeniu jego osła',
      'Przed pozwoleniem bałwochwalcom na mieszkanie w ziemi i zawarciem z nimi przymierza, bo służenie ich bogom stanie się dla ludu sidłem',
    ],
    c: 3,
    exp: 'Wj 23:33 kończy Księgę Przymierza stanowczym ostrzeżeniem: tolerowanie bałwochwalstwa i duchowych kompromisów prowadzi do grzechu i staje się sidłem (mokesz) dla wiary ludu Bożego.',
  },
];

const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 53
${TITLE}
${SUBTITLE}
${DATE_FORMATTED}  |  Czytanie: ${READING}
TEKST PAMIĘCIOWY: ${MEMORY_VERSE}
MYŚL PRZEWODNIA: ${THEME}

ZANIM OTWORZYSZ BIBLIĘ
Dwudziesty trzeci rozdział Księgi Wyjścia to uroczyste zamknięcie tzw. Księgi Przymierza (Wj 21–23), którą Bóg przekazał Mojżeszowi bezpośrednio po ogłoszeniu Dziesięciu Przykazań na górze Synaj. Po regulacjach dotyczących wolności sług, ochrony życia, własności i pomocy najsłabszym (Wj 21–22), Pan kieruje wzrok ludu ku czterem filarom zdrowego społeczeństwa i wiernej wspólnoty przymierza: czystości sumienia w sądzie i słowie, czynnej miłości wobec osobistego nieprzyjaciela, Bożemu rytmowi odpoczynku i dziękczynienia oraz zaufaniu Przewodnikowi drogi — Aniołowi PANA.
W tym rozdziale uderza ponadczasowa świeżość Bożej etyki. Pismo Święte jeszcze na półtora tysiąca lat przed erą mediów społecznościowych ostrzega przed rozgłaszaniem niesprawdzonych wieści oraz uleganiem presji głośnej większości. Co więcej, zanim Pan Jezus wygłosił Kazanie na Górze, Stary Testament nakazał już Izraelitom pomagać nawet osłowi tego, kto ich nienawidzi!
Zanim przeczytasz poniższe punkty studium, otwórz własną Biblię i przeczytaj uważnie wszystkie trzydzieści trzy wersety w przekładzie Uwspółcześnionej Biblii Gdańskiej. Zwróć uwagę na niezwykle głęboki finał: dlaczego Bóg daje stopniowe zwycięstwo („pomału będę ich wypędzał”) oraz kim jest tajemniczy Anioł, w którym mieszka samo Imię PANA?

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 23:1–33)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 23:1–33)
• H8088 שֵׁמַע (Szema) — wieść, relacja, pogłoska; zakaz szerzenia fałszywych wieści (szema szaw, H7723) chroni prawdę przed plotką i oszczerstwem (Wj 23:1).
• H2555 חָמָס (Chamas) — przemoc, bezprawie, krzywda; „świadek chamas” to człowiek wspierający niesprawiedliwość fałszywym zeznaniem (Wj 23:1).
• H7810 שֹׁחַד (Szochad) — łapówka, podarek korupcyjny, który „zaślepia mądrych i wypacza słowa sprawiedliwych” (Wj 23:8).
• H8058 שָׁמַט (Szamat) — odpuścić, zostawić odłogiem; w siódmym roku ziemia odpoczywa, by nakarmić ubogich i zwierzęta (Wj 23:11).
• H7676 שַׁבָּת (Szabat) — odpoczynek siódmego dnia ustanowiony dla człowieka, sługi, przybysza oraz zwierząt pociągowych (Wj 23:12).
• H1061 בִּכּוּרִים (Bikkurim) — pierwociny pierwszych plonów przynoszone z wdzięcznością do domu PANA (Wj 23:16, 19).
• H4397 מַלְאָךְ (Malak) — Posłaniec, Anioł PANA idący przed ludem i niosący Jego własne Imię (szemi bekirbo, H8034) (Wj 23:20–21).
• H4170 מוֹקֵשׁ (Mokesz) — sidło, pułapka duchowa powstająca wskutek przymierza z obcymi bożkami i grzesznych kompromisów (Wj 23:33).

ANALIZA EGZEGETYCZNA I TEOLOGICZNA (5 CZĘŚCI, 45 PUNKTÓW)

CZĘŚĆ I — PRAWDA W SĄDZIE, ODPORNOŚĆ NA TŁUM I BEZSTRONNOŚĆ (WJ 23:1–3, 6–9)
1. Stop dla fałszywych wieści i oszczerstw (23:1)
Pierwsze przykazanie rozdziału brzmi: „Nie będziesz rozgłaszał fałszywych wieści”. Zanim zapadnie jakikolwiek niesprawiedliwy wyrok, zło zaczyna się często od powtarzania niesprawdzonej plotki lub manipulacji.
2. Zakaz spółki z bezbożnym jako fałszywy świadek (23:1)
Bierna zgoda na kłamstwo albo milczące przyłączenie się do niegodziwego spisku czyni człowieka współwinnym „świadectwa przemocy” (ed chamas).
3. Odwaga sprzeciwu wobec presji większości (23:2)
„Nie idź za większością, aby wyrządzić zło” — Pismo demaskuje fałsz poglądu, jakoby głos tłumu stanowił miarę dobra. Prawda Boża nie podlega głosowaniu.
4. Niezależność sumienia podczas procesu (23:2)
Zakaz ulegania zdaniu większości „by naginać sąd” zobowiązuje świadka i sędziego do wierności faktom nawet wtedy, gdy środowisko lub opinia publiczna naciska na inny werdykt.
5. Brak fałszywej stronniczości na rzecz ubogiego (23:3)
Niezwykle trzeźwy przepis: „I nie okazuj przychylności ubogiemu w jego sprawie”. Prawdziwe miłosierdzie pomaga biednemu w potrzebie, ale w sądzie nie nagina faktów z sentymentu przeciwko prawdzie.
6. Jednoczesna ochrona praw ubogiego przed dyskryminacją (23:6)
Bóg natychmiast równoważy werset trzeci nakazem z wersetu szóstego: „Nie naginaj sądu twego ubogiego w jego sprawie”. Brak pieniędzy czy wpływów nie może pozbawiać nikogo sprawiedliwości.
7. Z dala od każdej nieuczciwej sprawy (23:7)
„Trzymaj się z dala od nieuczciwej sprawy” — Bóg wzywa nie tylko do unikania jawnego kłamstwa, ale do zachowania bezpiecznego dystansu wobec manipulacji, intryg i niejasnych układów.
8. Świętość krwi niewinnej i Boży wyrok na bezbożnych (23:7)
Zabicie niewinnego i sprawiedliwego na podstawie zmanipulowanego procesu jest ohydą przed Bogiem, który oświadcza: „nie usprawiedliwię bezbożnego” (por. Pwt 25:1).
9. Anatomia korupcji i ślepota mędrców (23:8)
Łapówka (szochad) nigdy nie bywa neutralnym „prezentem wdzięczności” — Pismo ostrzega, że dar zaślepia nawet przenikliwych mędrców i wypacza słowa ludzi uchodzących za sprawiedliwych.
10. Pamięć egipska jako tarcza dla przybysza (23:9)
„Nie uciskaj również przybysza, bo sami wiecie, jak się czuje przybysz”. Doświadczenie własnej bezsilności w obcym kraju ma rodzić w sercu wierzącego empatię i sprawiedliwość wobec cudzoziemców.

CZĘŚĆ II — CZYNNA MIŁOŚĆ WOBEC NIEPRZYJACIELA I JEGO CIĘŻARU (WJ 23:4–5)
11. Zaskakujące położenie nakazu w samym sercu prawa sądowego (23:4–5)
Wiersze o pomocy wrogowi zostały wpisane bezpośrednio między przepisy procesowe (w. 1–3 i w. 6–8), ponieważ prawdziwa sprawiedliwość jest nierozerwalna z miłosierdziem.
12. Błądzący wół i osioł wroga (23:4)
Jeśli wół lub osioł człowieka wrogiego Ci pobłądził, nie wolno Ci odwrócić wzroku ani cieszyć się z jego straty. Hebrajskie haszew tesziwenu podkreśla stanowczy obowiązek: „z całą pewnością odprowadzisz go do niego”.
13. Miłość mierzona postawą wobec przeciwnika, a nie przyjaciela (23:4)
Później potwierdzi to Jezus w Kazaniu na Górze (Mt 5:46–47): życzliwość dla przyjaciół znają nawet poganie; miarą serca przemienionego przez Boga jest dobroć okazana wrogowi.
14. Zwierzę leżące pod ciężarem tego, kto Cię nienawidzi (23:5)
Werset piąty podnosi poprzeczkę jeszcze wyżej: chodzi nie tylko o chłodnego konkurenta („wroga”), lecz o osobę, która aktywnie Cię „nienawidzi” (sonacha).
15. Przełamanie obojętności i mściwej satysfakcji (23:5)
Pokusa mówi: „niech sobie sam radzi, skoro mnie skrzywdził”. Bóg odpowiada: „nie odmówisz mu pomocy. Owszem, masz mu z nim pomóc”.
16. Wspólne dźwiganie ciężaru z przeciwnikiem (23:5)
Hebrajskie azow taazow immo („pomóż wraz z nim”) wymaga nie wyręczania wszystkiego z pogardą, ale stanięcia ramię w ramię przy jednym ciężarze — co często otwiera drzwi do pojednania.
17. Troska Boga o zwierzę robocze nawet w sporze ludzi (23:5)
Osioł nie jest winny konfliktu dwóch sąsiadów. Bóg widzi cierpienie przeciążonego stworzenia i nie pozwala, by ludzka nienawiść mściła się na zwierzętach.
18. Zapowiedź nowotestamentowego prawa Chrystusa (23:4–5; Rz 12:20–21)
Tak jak Chrystus przyjął nas, gdy byliśmy jeszcze Jego nieprzyjaciółmi (Rz 5:10), tak wierzący zwyciężają zło dobrem, karmiąc głodnego przeciwnika i wspierając potrzebującego.

CZĘŚĆ III — ROK SZABATOWY, DZIEŃ ODPOCZYNKU I TRZY ŚWIĘTA PANA (WJ 23:10–19)
19. Sześć lat siewu i siódmy rok odpuszczenia dla ziemi (23:10–11)
Ziemia należy do Stwórcy, nie jest maszyną do bezlitosnej eksploatacji. Co siódmy rok pola, winnice i sady oliwne odpoczywały (szamat), odzyskując żyzność w rękach Boga.
20. Bezpłatny stół dla ubogich i dzikich zwierząt (23:11)
Plony rosnące samoistnie w siódmym roku nie trafiały do spichlerza właściciela, lecz stawały się darmowym zaopatrzeniem dla ubogich ludu oraz dla zwierząt polnych — wspaniały wyraz Bożej ekonomii hojności.
21. Szabat siódmego dnia jako odetchnienie dla wszystkich (23:12)
W samym środku pracowitego życia Bóg strzeże odpoczynku siódmego dnia nie tylko dla gospodarza, ale wyraźnie dla wołu, osła, syna niewolnicy oraz przybysza — żeby każdy mógł „odetchnąć” (jinafesz).
22. Czułość we wszystkim, co nakazał Pan, i czystość ust (23:13)
„A we wszystkim, co wam powiedziałem, bądźcie ostrożni” — posłuszeństwo nie jest wybiórcze. Zakaz wymawiania z czcią imion obcych bogów chroni serce przed duchowym skażeniem (por. Ps 16:4).
23. Trzy doroczne pielgrzymki radości przed PANEM (23:14, 17)
Wiara Izraela nie była indywidualnym pustelnictwem, lecz radosnym zgromadzeniem całego ludu przed obliczem PANA trzy razy w roku: wiosną, wczesnym latem i jesienią.
24. Święto Przaśników w miesiącu Abib i dar wdzięczności (23:15)
Siedem dni jedzenia chleba przaśnego przypominało o pośpiechu wybawienia z Egiptu. Nakaz „Nie pokażecie się przede mną z pustymi rękami” uczy, że wdzięczność zawsze przynosi dar z serca.
25. Święto Żniw i Święto Zbiorów jako szkoła zależności od Stwórcy (23:16)
Zarówno pierwsze kłosy pracy na polu (Szawuot / Pięćdziesiątnica), jak i końcowy zbiór owoców jesienią (Sukkot / Święto Namiotów) oddawały chwałę Temu, który zsyła deszcz i wzrost.
26. Czystość ofiary bez zakwasu i bez odkładania na jutro (23:18)
Zakaz łączenia krwi ofiary z chlebem kwaszonym (symbolem zepsucia) oraz nakaz spożycia tłuszczu ofiary bez zostawiania go do zepsucia się do rana uczyły świeżości i świętości czci Bożej.
27. Pierwociny dla domu PANA i zakaz pogańskiego okrucieństwa (23:19)
Najlepsze pierwociny (reszit bikkurei) należą się Bogu jako Pierwszemu, a zakaz gotowania koźlęcia w mleku matki wyrażał zarówno sprzeciw wobec kananejskich rytuałów magicznych, jak i szacunek dla relacji matki i dziecka.

CZĘŚĆ IV — ANIOŁ PRZYMIERZA, BŁOGOSŁAWIEŃSTWO I PRZESTROGA PRZED SIDŁEM (WJ 23:20–33)
28. Obietnica Boskiego Przewodnika na drodze (23:20)
„Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem” — Izrael nie szedł w nieznane o własnych siłach; Bóg sam przygotował cel i wyznaczył Stróża drogi.
29. Autorytet i Boskość Anioła niosącego Imię PANA (23:21)
„Zważaj na niego i słuchaj jego głosu; nie pobudzaj go do gniewu, bo nie przebaczy waszych przestępstw, gdyż moje imię jest w nim”. Żaden zwykły anioł stworzony nie nosi w sobie Imienia Jahwe ani nie ma suwerennej władzy przebaczania grzechów — to sam przedwcielony Syn Boży (Anioł Przymierza, Ml 3:1).
30. Obietnica obrony przed prześladowcami (23:22)
Warunek jest prosty i oparty na zaufaniu: „jeśli będziesz pilnie słuchać jego głosu... będę wrogiem twoich wrogów”. Walki ludu Bożego należą do samego Pana.
31. Zniszczenie bałwochwalstwa i absolutna wierność (23:23–24)
Anioł wprowadzi lud pośród sześciu plemion kanaanejskich, ale warunkiem zachowania przymierza jest bezkompromisowe zburzenie posągów i ołtarzy obcych bóstw zamiast naśladowania ich czynów.
32. Błogosławieństwo powszedniego chleba i wody oraz ochrona zdrowia (23:25–26)
Służba jedynemu PANU przynosi ojcowską opiekę nad podstawami życia: błogosławieństwo chleba i wody, oddalenie chorób, ochronę życia macierzyńskiego i dopełnienie miary dni.
33. Święta trwoga przed obliczem PANA (23:27–28)
Wysłanie Bożego strachu i „szerszeni” przed ludem pokazuje, że ocalenie Izraela było cudem Bożej interwencji, a nie wynikiem militarnej przewagi plemion wyprowadzonych z niewoli.
34. Mądrość stopniowego dziedziczenia: „pomału” (23:29–30)
„Nie wypędzę ich... w jednym roku, by ziemia nie zmieniła się w pustynię i nie namnożył się przeciwko tobie dziki zwierz. Pomału będę ich wypędzał”. Bóg kształtuje nasz wzrost i zwycięstwa w tempie, które potrafimy odpowiedzialnie zagospodarować, by puste miejsce nie zapełniło się nowym zagrożeniem!
35. Rozległe granice obietnicy (23:31)
Granice od Morza Czerwonego do Morza Filistynów i od pustyni aż po rzekę Eufrat wskazują hojność Bożego dziedzictwa, zrealizowaną historycznie za Dawida i Salomona, a duchowo w zasięgu Ewangelii.
36. Ostrzeżenie końcowe: zero przymierza z bożkami, by nie wpaść w sidło (23:32–33)
Ostatnie zdanie Księgi Przymierza jest twardym realizmem: obecność nieodpartego kompromisu z bożkami świata nigdy nie zostaje neutralna — „będzie to dla ciebie sidłem” (mokesz).

CZĘŚĆ V — SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 23:1–33)
37. Jedność prawdy i miłości:
Sprawiedliwość bez prawdy staje się manipulacją, a prawda bez miłosierdzia wobec słabych i wrogów staje się chłodem — w Bogu oba te przymioty są nierozłączne.
38. Odwaga bycia mniejszością wierną Bogu:
Kto zna wartość Bożego sądu, nie lęka się iść pod prąd tłumu i medialnej presji, bo wyrok ostateczny należy do PANA.
39. Szabat i rok siódmy jako wyznanie zaufania Stwórcy:
Zatrzymanie pracy w siódmym dniu i w siódmym roku dowodzi, że nasze utrzymanie pochodzi z błogosławieństwa Boga, a nie z nieustannego lęku i wyścigu.
40. Szema szaw (שֵׁמַע שָׁוְא):
Oczyszczenie języka z fałszywych wieści i pochopnych plotek jest pierwszym testem posłuszeństwa Przymierzu.
41. Szochad (שֹׁחַד):
Łapówka w sercu przybiera dziś czasem formę pragnienia poklasku, układów lub korzyści — Bóg uwalnia od nich przez bojaźń Bożą.
42. Azow taazow immo (עָזֹב תַּעֲזֹב עִמּוֹ):
Czynna pomoc podnosząca ciężar nieprzyjaciela staje się najczytelniejszym językiem Ewangelii w codziennych sporach.
43. Jinafesz (יִנָּפֵשׁ):
Odetchnienie i odnowa życia (od nefesz — dusza) są darem Boga dla każdego człowieka i stworzenia w dniu Szabatu.
44. Malak HaBerit (מַלְאַךְ הַבְּרִית) — Anioł z Imieniem Bożym:
Obietnica Wj 23:20–21 buduje most prosto do Nowego Testamentu, ukazując obecność Syna Bożego prowadzącego Kościół przez pustynię tego świata.
45. Mokesz (מוֹקֵשׁ):
Czujność przed małymi kompromisami chroni serce przed duchowym sidłem i pozwala bezpiecznie dojść do przygotowanego dziedzictwa.

JEZUS W CENTRUM — ANIOŁ PRZYMIERZA, PRZYJACIEL NIEPRZYJACIÓŁ I NASZE ODPOCZNIENIE
1. Anioł Przymierza niosący Imię Ojca i przygotowujący miejsce (Wj 23:20–21; J 14:2–3):
W Wj 23:20 Bóg obiecuje posłać Anioła, który strzeże w drodze i prowadzi „do miejsca, które przygotowałem”, a w Wj 23:21 dodaje: „moje imię jest w nim”. W Ewangelii Jana Jezus ogłasza: „Idę, aby wam przygotować miejsce” i „Objawiłem twoje imię ludziom” (J 17:6). Ten sam Syn Boży, który prowadził Izraela przez pustynię (1 Kor 10:4, 9), jest dziś naszym jedynym Przewodnikiem do domu Ojca!
2. Od pomocy osłowi wroga do Kazania na Górze i Krzyża (Wj 23:4–5; Mt 5:44; Rz 5:10):
Gdy w Wj 23:4–5 Bóg nakazał pomagać zwierzęciu człowieka, który Cię nienawidzi, przygotowywał ludzkość na szczyt objawiony w Jezusie: „Miłujcie waszych nieprzyjaciół... módlcie się za tych, którzy wam wyrządzają zło” (Mt 5:44, UBG). A sam Chrystus umarł za nas wtedy, gdy byliśmy jeszcze Jego nieprzyjaciółmi (Rz 5:8–10), biorąc na Siebie ciężar, pod którym upadaliśmy!
3. Niewinny Sędzia i Ofiara fałszywych świadków (Wj 23:1–2, 7; Mt 26:59–61; 1 P 2:23):
Przed Sanhedrynem przeciwko Jezusowi wystąpili fałszywi świadkowie, a tłum uległ większości wołając o ukrzyżowanie Niewinnego — łamiąc wszystkie zasady Wj 23:1–7. Jezus dobrowolnie przyjął niesprawiedliwy wyrok, powierzając sprawę Temu, który sądzi sprawiedliwie, aby nas usprawiedliwić z łaski.
4. Pan Szabatu i wieczny Odpoczynek ludu Bożego (Wj 23:12; Mk 2:27; Hbr 4:9–10):
Prawo Wj 23:12 podkreśla, że Szabat został dany dla odetchnienia sługi, przybysza i zwierzęcia. Jezus potwierdza: „Szabat został ustanowiony dla człowieka” (Mk 2:27, UBG), a List do Hebrajczyków 4:9–10 wskazuje, że w Chrystusie wkraczamy w prawdziwy odpoczynek ludu Bożego od własnych uczynków, przeżywając każdy siódmy dzień jako radosny znak stworzenia i odkupienia.
5. Chrystus nasza Pascha i Pierwociny zmartwychwstania (Wj 23:15–19; 1 Kor 5:7–8; 1 Kor 15:20):
Wszystkie trzy święta pielgrzymie znajdują w Nim swoje spełnienie: Jezus jest naszą Paschą ofiarowaną za nas, przaśnikiem szczerości i prawdy (1 Kor 5:7–8) oraz pierwszym plonem (pierwocinami) tych, którzy zasnęli w śmierci, gwarantującym nasze zmartwychwstanie (1 Kor 15:20)!
6. Wolność od sidła ciemności dzięki obecności Chrystusa (Wj 23:32–33; 2 Kor 6:14–16):
Tam, gdzie Wj 23:32–33 przestrzega przed przymierzem z bożkami stającym się sidłem, Nowy Testament wzywa Kościół, by nie wprzęgał się w nierówne jarzmo z ciemnością, gdyż jesteśmy żywą świątynią Boga chodzącego pośród swojego ludu.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 23:1 → Przyp 19:5; Ef 4:25: Dlaczego fałszywe świadectwo i plotka są śmiertelnym wrogiem wspólnoty?
• Wj 23:2 → Mt 7:13–14; Dz 5:29: Dlaczego posłuszeństwo Bogu bywa drogą pod prąd głośnej większości?
• Wj 23:4–5 → Mt 5:44–45; Rz 12:20–21: Jak czynna pomoc nieprzyjacielowi rozbraja spiralę nienawiści?
• Wj 23:5 → Ga 6:2: W jaki sposób wzajemne noszenie ciężarów wypełnia prawo Chrystusa?
• Wj 23:7 → Przyp 17:15; Rz 3:25–26: Jak Bóg może usprawiedliwić grzesznika, nie usprawiedliwiając zła? (Przez ofiarę krzyża Jezusa!)
• Wj 23:8 → Pwt 16:19; Dz 8:18–20: Dlaczego dar korupcyjny i kupowanie wpływów duchowych zawsze zaślepiają sąd?
• Wj 23:10–11 → Kpł 25:1–7; 2 Krn 36:21: Jakie skutki duchowe i historyczne przynosi lekceważenie Bożego roku odpoczynku?
• Wj 23:12 → Mk 2:27; Hbr 4:9–10: Dlaczego dzień odpoczynku jest darem miłosierdzia dla zmęczonego człowieka i stworzenia?
• Wj 23:15–16 → 1 Kor 5:7–8; 1 Kor 15:20: Jak Święto Przaśników i Pierwociny Żniw wskazują na śmierć i zmartwychwstanie Chrystusa?
• Wj 23:20–21 → Ml 3:1; J 14:2–3: Co łączy Anioła niosącego Imię PANA w drodze na pustyni z Jezusem przygotowującym nam mieszkanie?
• Wj 23:25 → Mt 6:31–33; Flp 4:19: Jak wierna służba Bogu uwalnia serce od lęku o chleb, wodę i zdrowie?
• Wj 23:29–33 → Pwt 7:22; 2 Kor 6:14–16: Dlaczego Bóg prowadzi zwycięstwo etapami („pomału”) i zabrania duchowego kompromisu?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Prawda nie liczy głów w tłumie: Większość może się mylić i wyrządzać zło — moje sumienie odpowiada przed Bogiem, nie przed modą czy tłumem.
• 2. Nie powtarzam niesprawdzonych wieści: Każda plotka lub pochopne oskarżenie bez dowodu łamie Wj 23:1.
• 3. Pomoc wrogowi to test dojrzałej wiary: Nie czekam, aż przeciwnik zmieni nastawienie — pomagam podnieść jego ciężar ze względu na Pana.
• 4. Sprawiedliwość jest odporna na interes i sympatię: Nie przekupuję, nie przyjmuję dwuznacznych przysług i nie naginam prawdy ani dla bogatych, ani dla ubogich.
• 5. Odpoczynek jest nakazem miłości, nie lenistwem: W rytmie siódmego dnia odpoczywam sam i daję odetchnąć innym wokół mnie.
• 6. Nie staję przed Bogiem z pustym, niewdzięcznym sercem: Z radością oddaję Panu pierwociny mojego czasu, sił i wdzięczności.
• 7. Zwycięstwo przychodzi „pomału” i we właściwej mierze: Nie zniechęcam się, gdy Bóg zmienia moje życie i otoczenie krok po kroku zamiast w jeden dzień.
• 8. Przede mną idzie Ten, w którym jest Imię PANA: Jezus Chrystus strzeże mnie w drodze i na pewno doprowadzi do przygotowanego miejsca!

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy w tym tygodniu powtórzyłeś komuś niesprawdzoną wiadomość lub krzywdzącą opinię, zanim upewniłeś się o jej prawdziwości?
2. W jakiej sprawie ulegasz ostatnio presji otoczenia, znajomych lub „głośnej większości” wbrew jasnemu światłu własnego sumienia?
3. Kto w Twoim otoczeniu jest dziś dla Ciebie „trudnym sąsiadem” lub przeciwnikiem — i jaki konkretny gest dobra możesz mu okazać niczym pomoc przy ciężarze osła?
4. Czy w ocenie innych kierujesz się bezstronnością, czy pozwalasz, by sympatia, interes albo dawny uraz wypaczały Twoje słowa?
5. Czy pamiętasz w swojej postawie wobec cudzoziemców, nowych osób i słabszych, jak to jest czuć się przybyszem bez oparcia?
6. Czy w natłoku obowiązków szanujesz Boży rytm odpoczynku siódmego dnia dla siebie, swojej rodziny i tych, którzy dla Ciebie pracują?
7. W jakim obszarze życia niecierpliwisz się na Boga, zapominając, że On często buduje trwałe zwycięstwo „pomału”, aby uchronić Cię przed pustką i zagrożeniem?
8. Czy na co dzień uważnie słuchasz głosu Chrystusa — Tego, który nosi Imię Ojca i prowadzi Cię bezpiecznie przez pustynię codzienności?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 23:1–33)
${quizItems
  .map(
    (item, idx) => `Pytanie ${idx + 1}: ${item.q}
A. ${item.a[0]}
B. ${item.a[1]}
C. ${item.a[2]}
D. ${item.a[3]}
Poprawna odpowiedź: ${['A', 'B', 'C', 'D'][item.c]}. Wyjaśnienie: ${item.exp}`
  )
  .join('\n\n')}

TWOJA DECYZJA
Dwudziesty trzeci rozdział Księgi Wyjścia zaprasza Cię dziś do odważnego, czystego i pełnego nadziei chrześcijaństwa. Nie jesteśmy skazani na strach przed opinią tłumu, na gorzką zemstę wobec nieprzyjaciół ani na wyczerpujący bieg bez wytchnienia. Przed nami idzie bowiem żywy Anioł Przymierza — Jezus Chrystus, w którym mieszka Imię Ojca i który przyszedł, aby szukać, strzec i doprowadzić nas bezpiecznie do domu przygotowanego w niebie.
Podejmij dziś osobistą decyzję przed Bogiem: oczyść swoje usta z fałszywych wieści, odważnie stań po stronie prawdy, okaż nieoczekiwaną dobroć trudnemu człowiekowi i oprzyj całą drogę na prowadzeniu Zbawiciela!

MOJA DECYZJA:
„Panie Jezu Chryste, Aniele Przymierza i wierny Przewodniku mojej drogi, dziękuję Ci, że nie idę przez życie sam, lecz Ty mnie strzeżesz i prowadzisz do miejsca, które przygotowałeś w domu Ojca. Świadomie wybieram dziś prawdę ponad presję większości, czyste serce wolne od plotek i interesowności, odpoczynek zaufania oraz czynną życzliwość nawet wobec tych, którzy są mi nieprzychylni.”

MODLITWA NA 22 LISTOPADA 2026 R.
Wszechmogący, Sprawiedliwy i Wierny Boże! Dziękujemy Ci za dwudziesty trzeci rozdział Księgi Wyjścia, który zamyka Księgę Przymierza tak jasnym światłem prawdy, odwagi i miłosierdzia. Dziękujemy Ci, że nie pozwalasz nam rozpowszechniać fałszywych wieści ani ulegać tłumowi w wyrządzaniu krzywdy, a zarazem uczysz nas podnosić ciężar nawet tego człowieka, który nas nienawidzi.
Przepraszamy Cię za chwile naszego milczenia, gdy należało stanąć w obronie prawdy, za powtarzanie niesprawdzonych słów, za brak bezstronności, za chowanie dawnych uraz oraz za lękliwy pośpiech, w którym zapominamy o Twoim darze odpoczynku i dziękczynienia. Oczyść nasze domy i relacje z wszelkich sideł ukrytych kompromisów ze złem.
Panie Jezu Chryste, Ty jesteś Aniołem Przymierza niosącym Imię Ojca, Panem Szabatu i naszą Paschą. Bądź przy nas w tę niedzielę i w każdym dniu nadchodzącego tygodnia. Błogosław nasz chleb i naszą wodę, oddal od nas choroby ducha i ciała, daj nam cierpliwość w stopniowym wzrastaniu i prowadź nas pewnie do miejsca, które nam przygotowałeś. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj uważnie cały 23. rozdział Księgi Wyjścia (Wj 23:1–33 UBG) oraz Ewangelię Mateusza 5:43–48 i Ewangelię Jana 14:1–6.
2. Zapamiętaj werset Wj 23:20 i powtórz go z wdzięcznością przed rozpoczęciem nowego tygodnia.
3. Wprowadź dziś osobisty „post od plotek i niesprawdzonych wieści” — nie przekazuj dalej żadnej informacji, której prawdy nie sprawdziłeś.
4. Okaż konkretny gest dobroci, pomocy lub modlitwy osobie, z którą masz trudną relację lub która Cię zawiodła (praktyka Wj 23:4–5).
5. Przeżyj dzisiejszy dzień z wdzięcznością i odetchnieniem przed Bogiem — nie stawaj przed Nim z pustym sercem, lecz złóż ofiarę dziękczynienia.
6. Nazwij w modlitwie jedno „sidło” kompromisu, które odciąga Twoją uwagę od wyłącznej wierności Jezusowi, i odsuń się od niego.
7. Oznacz Dzień 53 jako ukończony w Akademii i podziel się tą lekcją z osobą zmagającą się z lękiem o przyszłość lub presją otoczenia!

JUTRO — 23 LISTOPADA 2026 R.
DZIEŃ 54: KREW PRZYMIERZA, UCZTA STARSZYCH I CHWAŁA PANA NA SYNAJU (WJ 24:1–18)
Jutro wejdziemy z Mojżeszem, Aaronem, Nadabem, Abihu i siedemdziesięcioma starszymi na zbocza góry Synaj w 24. rozdziale Księgi Wyjścia. Ujrzymy uroczystą ratyfikację Przymierza krwią ofiar, zdumiewającą ucztę starszych przed obliczem Boga Izraela oraz Mojżesza wstępującego w ogień chwały na czterdzieści dni i czterdzieści nocy!`;

// ── 3. GENEROWANIE PLIKU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 53...');

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

// ── 4. ZAPIS PAKIETU 5 WERSJI + SUROWEJ LEKCJI ──
const pakietFilePath = path.join(REPO, `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

const lessonTxtPath = path.join(REPO, `scripts/content/kc-day${DAY_NUM}-lesson.txt`);
fs.writeFileSync(lessonTxtPath, lessonDocxText, 'utf8');
console.log(`✅ Zapisano tekst lekcji: ${lessonTxtPath}`);

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 52 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 53 (4 ścieżki Clean URLs + kolejka)...');
const template52Path = path.join(REPO, 'akademia/kurscodzienny/dzien-52.html');
let html = fs.readFileSync(template52Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 52: [^<]+<\/title>/,
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
  /kc_day_52_wlasnosc_zadoscuczynienie_swietosc\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261122`
);

html = html.replace(/kurscodzienny%2Fdzien-52/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2052[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść pokój sprawiedliwości i Bożą troskę komuś, kto dziś szczególnie jej wypatruje\./,
  'Jedno kliknięcie może przynieść odwagę prawdy i pewność obecności Anioła Przymierza komuś, kto dziś szczególnie jej potrzebuje.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 52<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav52Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-51"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/;
const nav53Block = `<a href="/akademia/kurscodzienny/dzien-52" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 52</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 54 (Poniedziałek) →</span>
        </span>`;
if (!nav52Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 52 w szablonie');
}
html = html.replace(nav52Regex, nav53Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 52 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/21 LISTOPADA 2026 • SOBOTA/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 52:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 22:1–31/g, `Czytanie: ${READING}`);

// 5.4 Werset pamięciowy i Myśl przewodnia
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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 23:20 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 23:20 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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

// 5.5 Zanim otworzysz Biblię
html = html.replace(
  /<!-- LESSON BODY CONTENT[^>]*-->/,
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 22.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 53</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. W końcowym rozdziale Księgi Przymierza odkrywamy, jak Bóg chroni prawdę przed tłumem i łapówką, wzywa do czynnej pomocy nieprzyjacielowi i prowadzi nas pod opieką Anioła Przymierza.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie wszystkie trzydzieści trzy wersety w przekładzie UBG. Zwróć uwagę, dlaczego obok sprawiedliwości sądowej pojawia się troska o odpoczynek w siódmym dniu i roku oraz dlaczego Bóg wypędza wrogów „pomału”.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=23" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(
  /<!-- SCRIPTURE SECTION[^>]*-->/,
  `<!-- SCRIPTURE SECTION (${READING}) -->`
);
html = html.replace(
  /Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 22:1–31/g,
  `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`
);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=22/g, `/mojabiblia?book=EXO&chapter=23`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=22/g, `/mojabiblia?book=EXO&amp;chapter=23`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips53 = `<span class="strong-chip"><span class="strong-id">H8088</span> <span class="strong-orig">שֵׁמַע (Szema)</span> — wieść lub pogłoska; zakaz szerzenia fałszywych wieści (szema szaw) (Wj 23:1)</span>
          <span class="strong-chip"><span class="strong-id">H2555</span> <span class="strong-orig">חָמָס (Chamas)</span> — przemoc i bezprawie w fałszywym świadectwie (Wj 23:1)</span>
          <span class="strong-chip"><span class="strong-id">H7810</span> <span class="strong-orig">שֹׁחַד (Szochad)</span> — łapówka zaślepiająca mądrych i wypaczająca słowa sprawiedliwych (Wj 23:8)</span>
          <span class="strong-chip"><span class="strong-id">H8058</span> <span class="strong-orig">שָׁמַט (Szamat)</span> — zostawić ziemię odłogiem w siódmym roku dla ubogich i zwierząt (Wj 23:11)</span>
          <span class="strong-chip"><span class="strong-id">H7676</span> <span class="strong-orig">שַׁבָּת (Szabat)</span> — siódmy dzień odetchnienia dla człowieka, sługi, przybysza i zwierząt (Wj 23:12)</span>
          <span class="strong-chip"><span class="strong-id">H1061</span> <span class="strong-orig">בִּכּוּרִים (Bikkurim)</span> — pierwociny pierwszych plonów przynoszone z wdzięcznością do domu PANA (Wj 23:16, 19)</span>
          <span class="strong-chip"><span class="strong-id">H4397</span> <span class="strong-orig">מַלְאָךְ (Malak)</span> — Anioł Przymierza prowadzący lud i niosący Imię PANA (szemi bekirbo) (Wj 23:20–21)</span>
          <span class="strong-chip"><span class="strong-id">H4170</span> <span class="strong-orig">מוֹקֵשׁ (Mokesz)</span> — duchowe sidło wynikające z przymierza z obcymi bogami (Wj 23:33)</span>`;

html = html.replace(
  /Klucze Językowe &amp; Kody Stronga \(Wj 22:1–31\)/g,
  `Klucze Językowe &amp; Kody Stronga (${READING})`
);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą duchowy fundament 22\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 23. rozdziału Księgi Wyjścia (odrzucenie fałszu i łapówki, czynna pomoc wrogowi, rok i dzień odpoczynku, pierwociny wdzięczności, Anioł z Imieniem PANA oraz przestroga przed sidłem):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips53}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 22:1–31 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis53 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            PRAWDA W SĄDZIE, ODPORNOŚĆ NA TŁUM I BEZSTRONNOŚĆ (WJ 23:1–3, 6–9)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Stop dla fałszywych wieści i oszczerstw (23:1):</strong> Pierwszy zakaz rozdziału uderza w powtarzanie niesprawdzonych pogłosek (<em>szema szaw</em>), od których zaczyna się niesprawiedliwość.</p>
            <p><strong>2. Zakaz spółki z bezbożnym jako fałszywy świadek (23:1):</strong> Milczące lub czynne wsparcie niegodziwego spisku czyni człowieka współwinnym „świadectwa przemocy” (<em>ed chamas</em>).</p>
            <p><strong>3. Odwaga sprzeciwu wobec presji większości (23:2):</strong> „Nie idź za większością, aby wyrządzić zło” — Pismo przypomina, że prawda nie podlega głosowaniu tłumu.</p>
            <p><strong>4. Niezależność sumienia podczas procesu (23:2):</strong> Zakaz ulegania większości „by naginać sąd” chroni wyroki przed opinią ulicy i lękiem przed ludźmi.</p>
            <p><strong>5. Brak fałszywej stronniczości na rzecz ubogiego (23:3):</strong> Prawdziwe miłosierdzie wspiera biednego w życiu, lecz przed sądem nie nagina faktów z sentymentu przeciwko prawdzie.</p>
            <p><strong>6. Jednoczesna ochrona praw ubogiego przed dyskryminacją (23:6):</strong> „Nie naginaj sądu twego ubogiego w jego sprawie” — brak majątku nigdy nie może odbierać należnej sprawiedliwości.</p>
            <p><strong>7. Bezpieczny dystans od każdej nieuczciwej sprawy (23:7):</strong> Bóg nakazuje trzymać się z dala od manipulacji, intryg i niejasnych układów zanim wciągną sumienie.</p>
            <p><strong>8. Świętość niewinnej krwi i wyrok Najwyższego Sędziego (23:7):</strong> Skazanie sprawiedliwego na śmierć jest ohydą przed Panem, który ogłasza: „nie usprawiedliwię bezbożnego”.</p>
            <p><strong>9. Anatomia korupcji i ślepota mędrców (23:8):</strong> Łapówka (<em>szochad</em>) zaślepia nawet bystre oczy mędrców i krzywi słowa ludzi uznawanych za prawych.</p>
            <p><strong>10. Pamięć egipska jako tarcza dla przybysza (23:9):</strong> Doświadczenie własnej bezsilności w obcym kraju ma rodzić w wierzących czułość i sprawiedliwość wobec przybysza (<em>ger</em>).</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            CZYNNA MIŁOŚĆ WOBEC NIEPRZYJACIELA I JEGO CIĘŻARU (WJ 23:4–5)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Miłosierdzie wpisane w samo serce prawa (23:4–5):</strong> Wiersze o pomocy wrogowi leżą między przepisami sądowymi, bo sprawiedliwość bez miłosierdzia zamiera.</p>
            <p><strong>12. Błądzący wół i osioł wroga (23:4):</strong> Zamiast cieszyć się z cudzej straty, Izraelita ma bezwzględny obowiązek odprowadzić zbłąkane zwierzę przeciwnika.</p>
            <p><strong>13. Miarą wiary jest postawa wobec wroga (23:4):</strong> Dobroć dla przyjaciół znają wszyscy, lecz Bóg uczy czynić dobro również tym, z którymi jesteśmy w sporze (por. Mt 5:44–47).</p>
            <p><strong>14. Zwierzę leżące pod ciężarem nienawidzącego (23:5):</strong> Werset 5 mówi wprost o osobie otwarcie nieprzyjaznej („tego, który cię nienawidzi” — <em>sonacha</em>).</p>
            <p><strong>15. Przełamanie obojętności i mściwej satysfakcji (23:5):</strong> „Nie odmówisz mu pomocy. Owszem, masz mu z nim pomóc” — Bóg gasi pokusę złośliwego odwrócenia głowy.</p>
            <p><strong>16. Wspólne dźwiganie brzemienia (23:5):</strong> Hebrajskie <em>azow taazow immo</em> oznacza wspólne stanięcie przy jednym ciężarze, co często kruszy lód wrogości.</p>
            <p><strong>17. Współczucie dla stworzenia ponad sporem ludzi (23:5):</strong> Zwierzę robocze nie jest winne ludzkiej niechęci; Bóg troszczy się także o ulżenie przeciążonemu zwierzęciu.</p>
            <p><strong>18. Zapowiedź zwycięstwa dobra nad złem (23:4–5; Rz 12:20–21):</strong> Czynna pomoc wrogowi odzwierciedla miłość Chrystusa, który umarł za nas, gdy byliśmy jeszcze Jego nieprzyjaciółmi.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            ROK SZABATOWY, DZIEŃ ODPOCZYNKU I TRZY ŚWIĘTA PANA (WJ 23:10–19)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Sześć lat uprawy i siódmy rok odpuszczenia (23:10–11):</strong> Ziemia należy do Boga, dlatego w siódmym roku pola, winnice i sady oliwne odpoczywają (<em>szamat</em>).</p>
            <p><strong>20. Bezpłatny stół dla ubogich i dzikich zwierząt (23:11):</strong> Plony roku szabatowego karmią ubogich ludu oraz zwierzęta polne — znak Bożej hojności i troski o stworzenie.</p>
            <p><strong>21. Szabat siódmego dnia jako odetchnienie dla wszystkich (23:12):</strong> Odpoczynek siódmego dnia chroni nie tylko właściciela, ale wołu, osła, syna niewolnicy i przybysza, aby mogli odetchnąć (<em>jinafesz</em>).</p>
            <p><strong>22. Czujność słowa i czystość języka od imion bożków (23:13):</strong> Zakaz wspominania imienia obcych bogów w ustach ludu chroni serce przed duchowym bałwochwalstwem.</p>
            <p><strong>23. Trzy doroczne pielgrzymki radości przed PANEM (23:14, 17):</strong> Cały naród trzykrotnie w roku gromadził się przed Bogiem na wspólnej liturgii wdzięczności.</p>
            <p><strong>24. Święto Przaśników w miesiącu Abib i dar wdzięczności (23:15):</strong> Pamiątka wyjścia z Egiptu z nakazem „Nie pokażecie się przede mną z pustymi rękami” uczy wdzięcznego serca.</p>
            <p><strong>25. Święto Żniw i Święto Zbiorów (23:16):</strong> Pierwsze plony pracy i jesienny finał zbiorów przypominały, że każdy kęs chleba pochodzi z ręki Stwórcy.</p>
            <p><strong>26. Czystość ofiary bez zakwasu i bez odkładania (23:18):</strong> Krew ofiary bez chleba kwaszonego i tłuszcz bez zostawiania do rana uczyły świeżej, niezepsutej czci wobec Boga.</p>
            <p><strong>27. Pierwociny w domu PANA i zakaz pogańskich rytuałów (23:19):</strong> Najlepsze pierwociny (<em>bikkurim</em>) należą do Boga, a zakaz gotowania koźlęcia w mleku matki odcina Izraela od okrutnych praktyk kanaanejskich.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            ANIOŁ PRZYMIERZA, BŁOGOSŁAWIEŃSTWO I PRZESTROGA PRZED SIDŁEM (WJ 23:20–33)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>28. Obietnica Boskiego Przewodnika drogi (23:20):</strong> „Oto posyłam Anioła przed tobą, aby cię strzegł w drodze i doprowadził do miejsca, które przygotowałem”.</p>
            <p><strong>29. Boskość i autorytet Anioła niosącego Imię PANA (23:21):</strong> Anioł ten ma władzę przebaczania lub sądzenia przestępstw, a Bóg mówi o Nim: „moje imię jest w nim” — to przedwcielony Syn Boży.</p>
            <p><strong>30. Obietnica obrony przed wrogami (23:22):</strong> Słuchanie Jego głosu sprawia, że sam Bóg staje się wrogiem nieprzyjaciół swojego ludu.</p>
            <p><strong>31. Zniszczenie posągów zamiast naśladowania narodów (23:23–24):</strong> Warunkiem wejścia w dziedzictwo jest całkowite odrzucenie bałwochwalstwa sześciu ludów Kanaanu.</p>
            <p><strong>32. Błogosławieństwo chleba, wody i zdrowia (23:25–26):</strong> Wierna służba PANU przynosi zaopatrzenie powszednie, oddalenie chorób, błogosławieństwo potomstwa i pełnię dni.</p>
            <p><strong>33. Boży strach i szerszenie przed ludem (23:27–28):</strong> Zwycięstwo Izraela nie było triumfem ludzkiej siły zbrojnej, lecz nadprzyrodzoną interwencją Boga zastępów.</p>
            <p><strong>34. Mądrość stopniowego wzrostu: „pomału” (23:29–30):</strong> Bóg wypędza wrogów stopniowo, by pusta ziemia nie stała się pustynią pełną dzikiego zwierza — chroni nas przed sukcesem większym niż nasza dojrzałość.</p>
            <p><strong>35. Rozległe granice obietnicy przymierza (23:31):</strong> Od Morza Czerwonego po Morze Filistynów i od pustyni po rzekę Eufrat rozciąga się hojne dziedzictwo zrealizowane w czasie pokoju.</p>
            <p><strong>36. Finałowe ostrzeżenie przed sidłem kompromisu (23:32–33):</strong> Zawarcie przymierza z obcymi bogami lub tolerowanie bałwochwalstwa w swoim domu zawsze staje się duchowym sidłem (<em>mokesz</em>).</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 23:1–33)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>37. Jedność prawdy i miłości:</strong> Sprawiedliwość bez prawdy zamienia się w manipulację, a prawda bez miłosierdzia wobec wrogów staje się chłodem — w Chrystusie oba idą razem.</p>
            <p><strong>38. Odwaga bycia mniejszością wierną Bogu:</strong> Uczeń Jezusa nie mierzy dobra popularnością wśród tłumu, lecz wiernością Słowu.</p>
            <p><strong>39. Rytm Szabatu jako wyznanie zaufania:</strong> Zatrzymanie pracy w siódmym dniu i roku dowodzi wiary, że nasz chleb i woda zależą od Stwórcy, nie od lęku.</p>
            <p><strong>40. <em>Szema szaw</em> (שֵׁמַע שָׁוְא):</strong> Oczyszczenie ust z plotek i niesprawdzonych wieści jest codziennym sprawdzianem uczciwości.</p>
            <p><strong>41. <em>Szochad</em> (שֹׁחַד):</strong> Wolność od łapówek, układów i poklasku otwiera oczy serca na jasne rozeznanie woli Bożej.</p>
            <p><strong>42. <em>Azow taazow immo</em> (עָזֹב תַּעֲזֹב עִמּוֹ):</strong> Wspólne podniesienie ciężaru wroga buduje most łaski ponad dawnymi podziałami.</p>
            <p><strong>43. <em>Jinafesz</em> (יִנָּפֵשׁ):</strong> Odetchnienie duszy w Szabat obejmuje każdego pracującego człowieka i stworzenie.</p>
            <p><strong>44. <em>Malak</em> z Imieniem Bożym (מַלְאַךְ):</strong> Przedwcielony Chrystus prowadzi swój lud do miejsca przygotowanego przez Ojca.</p>
            <p><strong>45. <em>Mokesz</em> (מוֹקֵשׁ):</strong> Czystość sumienia i brak przymierza ze złem strzegą przed duchowymi sidłami w codziennym życiu.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis53}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Anioł Przymierza Niosący Imię Ojca, Przyjaciel Nieprzyjaciół i Nasze Odpocznienie
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Anioł Przymierza prowadzący do przygotowanego miejsca (Wj 23:20–21; Ewangelia Jana 14:2–3):</strong> W Wj 23:20 Bóg posyła przed ludem Anioła niosącego Jego Imię, by doprowadzić lud „do miejsca, które przygotowałem”. W Ewangelii Jana Jezus ogłasza uczniom dokładnie te słowa: „Idę, aby wam przygotować miejsce” — to On sam jest Przewodnikiem naszej drogi do domu Ojca!
          </p>
          <p>
            <strong>2. Od pomocy osłowi wroga do Kazania na Górze i Krzyża (Wj 23:4–5; Ewangelia Mateusza 5:44; List do Rzymian 5:10):</strong> Zanim Chrystus powiedział: „Miłujcie waszych nieprzyjaciół”, Bóg wpisał pomoc wrogowi w samo prawo Przymierza. Na krzyżu Jezus poszedł najdalej — umarł za nas, gdy byliśmy jeszcze Jego nieprzyjaciółmi, dźwigając nasz ciężar!
          </p>
          <p>
            <strong>3. Niewinny Sędzia odrzucający fałszywych świadków (Wj 23:1–2, 7; Ewangelia Mateusza 26:59–61; 1 Piotra 2:23):</strong> Podczas procesu Jezusa fałszywi świadkowie i tłum ulegający większości złamali wszystkie nakazy Wj 23:1–7. Zbawiciel milczał przed oszczerstwem i przyjął wyrok, by usprawiedliwić nas swoją sprawiedliwością.
          </p>
          <p>
            <strong>4. Pan Szabatu i wieczny Odpoczynek ludu Bożego (Wj 23:12; Ewangelia Marka 2:27; List do Hebrajczyków 4:9–10):</strong> Szabat dany dla odetchnienia ludzi i stworzenia wskazuje na Jezusa Chrystusa, w którym odpoczywamy od ciężaru własnych uczynków i wiary w lęku, radując się błogosławionym siódmym dniem stworzenia i odkupienia.
          </p>
          <p>
            <strong>5. Chrystus nasza Pascha i Pierwociny zmartwychwstania (Wj 23:15–19; 1 List do Koryntian 5:7–8; 15:20):</strong> Święto Przaśników znajduje spełnienie w Chrystusie — naszej Passze ofiarowanej za nas, a Święto Pierwocin Żniw w Jego zmartwychwstaniu jako pierwszym plonie tych, którzy zasnęli.
          </p>
          <p>
            <strong>6. Ochrona przed sidłem ciemności (Wj 23:32–33; 2 List do Koryntian 6:14–16):</strong> Przestroga przed przymierzem z obcymi bożkami uczy Kościół trwać wyłącznie przy świetle Ewangelii bez kompromisu z grzechem.
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=23" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus53}\n      $2`
);

// 5.10 Sprawdź w Biblii
const compare53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:1 → Księga Przypowieści 19:5; Efezjan 4:25</strong>: Dlaczego fałszywe świadectwo i plotka niszczą zaufanie we wspólnocie?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:2 → Ewangelia Mateusza 7:13–14; Dzieje 5:29</strong>: Dlaczego wierność Bogu wymaga nieraz pójścia pod prąd większości?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:4–5 → Ewangelia Mateusza 5:44–45; Rzymian 12:20–21</strong>: Jak czynna dobroć wobec nieprzyjaciela zwycięża zło dobrem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:5 → List do Galacjan 6:2</strong>: W jaki sposób noszenie wzajemnych ciężarów wypełnia prawo Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:7 → Księga Przypowieści 17:15; Rzymian 3:25–26</strong>: Jak Bóg usprawiedliwia wierzącego w Jezusa, pozostając sprawiedliwym?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:8 → Księga Powtórzonego Prawa 16:19; Dzieje 8:18–20</strong>: Dlaczego przekupstwo i handel darami duchowymi zaślepiają sąd?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:10–11 → Księga Kapłańska 25:1–7; 2 Kronik 36:21</strong>: Jakie znaczenie dla ludu i ziemi miał siódmy rok odpoczynku?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:12 → Ewangelia Marka 2:27; Hebrajczyków 4:9–10</strong>: Dlaczego Szabat jest błogosławionym darem odetchnienia dla człowieka?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:15–16 → 1 List do Koryntian 5:7–8; 15:20</strong>: Jak Święto Przaśników i Pierwociny wskazują na Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:20–21 → Księga Malachiasza 3:1; Ewangelia Jana 14:2–3</strong>: Co łączy Anioła niosącego Imię PANA z Jezusem przygotowującym nam miejsce?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:25 → Ewangelia Mateusza 6:31–33; Filipian 4:19</strong>: Jak służba Bogu uwalnia nas od troski o chleb, wodę i jutro?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 23:29–33 → 2 List do Koryntian 6:14–16</strong>: Dlaczego Bóg prowadzi zwycięstwo stopniowo i ostrzega przed sidłem kompromisu?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare53}\n      $2`
);

// 5.11 Prawda na dziś
const truth53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Prawdy, Odwagi i Prowadzenia — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Prawda nie liczy głosów tłumu:</strong> Większość może błądzić i wyrządzać zło — moje sumienie odpowiada przed Bogiem, nie przed modą czy presją otoczenia.</p>
          <p>• <strong>2. Zatrzymuję niesprawdzone wieści u siebie:</strong> Nie powtarzam plotek ani pochopnych oskarżeń, dopóki nie znam faktów.</p>
          <p>• <strong>3. Pomoc wrogowi rozbraja nienawiść:</strong> Nie czekam na pierwszy krok przeciwnika — pomagam podnieść jego ciężar ze względu na Chrystusa.</p>
          <p>• <strong>4. Bezstronność chroni prawdę przed interesem:</strong> Nie przyjmuję „darów” zaślepiających ocenę i nie naginam racji ani z lęku, ani z fałszywego sentymentu.</p>
          <p>• <strong>5. Odpoczynek siódmego dnia jest darem łaski:</strong> Zatrzymanie pracy uwalnia mnie, bliskich i podwładnych od niewolniczego pośpiechu.</p>
          <p>• <strong>6. Nie staję przed Bogiem z pustym sercem:</strong> Wdzięczność zawsze wyraża się hojnością, modlitwą i oddaniem Bogu pierwocin.</p>
          <p>• <strong>7. Bóg kształtuje zwycięstwo „pomału”:</strong> Nie zniechęcam się stopniowym tempem zmian — Pan uwalnia mnie w miarę gotowości serca.</p>
          <p>• <strong>8. Przede mną idzie Chrystus z Imieniem Ojca:</strong> Nie wędruję sam — Anioł Przymierza strzeże drogi i doprowadzi do przygotowanego miejsca.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth53}\n      $2`
);

// 5.12 Pomyśl
const questions53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy zdarzyło Ci się w ostatnich dniach powtórzyć plotkę albo ostrą opinię o kimś bez sprawdzenia jej rzetelności?</p>
          <p>2. W jakiej sytuacji boisz się sprzeciwić głośnej większości lub grupie znajomych w obronie tego, co prawe i prawdziwe?</p>
          <p>3. Kto w Twoim otoczeniu jest dla Ciebie trudną osobą lub przeciwnikiem — i w jaki konkretny sposób możesz mu dzisiaj pomóc?</p>
          <p>4. Czy w swoich osądach pozostajesz wolny od stronniczości, osobistych korzyści oraz pochopnych sympatii?</p>
          <p>5. Jak traktujesz osoby nowe, obce lub bezradne — czy pamiętasz o łasce, którą sam otrzymałeś od Boga?</p>
          <p>6. Czy pozwalasz sobie oraz ludziom zależnym od Ciebie na prawdziwy odpoczynek i odetchnienie w rytmie siódmego dnia?</p>
          <p>7. W jakim zmaganiu tracisz cierpliwość, zapominając, że Bóg prowadzi Cię ku zwycięstwu „pomału”, krok po kroku?</p>
          <p>8. Czy ufasz dziś obietnicy z Wj 23:20, że Chrystus idzie przed Tobą, strzeże Cię w drodze i przygotował Ci bezpieczne miejsce?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions53}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 22 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 23 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 22/g, `Po przeczytaniu Wj 23`);

// 5.14 Twoja decyzja
const decision53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Wybierz Prawdę Ponad Tłum, Dobroć dla Wrogów i Prowadzenie Anioła Przymierza!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty trzeci rozdział Księgi Wyjścia pokazuje, że lud Boży nie idzie przez świat według zasad plotki, lęku przed tłumem ani mściwości. Naszym wyróżnikiem jest czyste świadectwo, gotowość do pomocy nawet przeciwnikowi, pokój odpoczynku i bezkompromisowa wierność jedynemu Panu.
          </p>
          <p>
            Ponieważ Jezus Chrystus — Anioł Przymierza niosący Imię Ojca — idzie przed Tobą, strzeże Cię w drodze i przygotował Ci wieczne mieszkanie, podejmij dziś świadomą decyzję: słuchaj Jego głosu, odrzuć sidła zła i zwyciężaj zło dobrem mocą Ducha Świętego!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, Aniele Przymierza i wierny Przewodniku mojej drogi, dziękuję Ci, że strzeżesz mnie na każdym kroku i prowadzisz do miejsca, które dla mnie przygotowałeś. Świadomie decyduję dziś odrzucać fałszywe wieści i presję większości, strzec sprawiedliwości, pomagać także tym, którzy są mi nieprzychylni, oraz ufać Twojemu prowadzeniu przez całe życie.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision53}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 21 listopada<\/span>/g, `<span>Modlitwa na 22 listopada</span>`);
const prayer53 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Odwagę Prawdy, Serce dla Nieprzyjaciół i Bezpieczną Drogę z Aniołem Przymierza
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Sprawiedliwy i Wierny Boże! Dziękujemy Ci za dwudziesty trzeci rozdział Księgi Wyjścia, w którym zamykasz Księgę Przymierza tak jasnym światłem odwagi wobec tłumu, czystości sumienia oraz czynnego miłosierdzia nawet wobec naszych przeciwników.
          </p>
          <p>
            Przepraszamy Cię za chwile, gdy powtarzaliśmy niesprawdzone wieści, gdy baliśmy się stanąć w obronie prawdy przed większością, za brak bezstronności oraz za chowanie urazy i odwracanie wzroku od potrzeb tych, którzy nas zranili. Oczyść nasze domy z wszelkich sideł ukrytych kompromisów.
          </p>
          <p>
            Panie Jezu Chryste, Ty jesteś Aniołem Przymierza niosącym Imię Ojca, Panem Szabatu i naszą Paschą. Dziękujemy Ci, że idziesz przed nami w drodze i przygotowałeś dla nas miejsce w domu Ojca. Błogosław nasz chleb i naszą wodę, oddal od nas choroby ducha i ciała oraz naucz nas cierpliwości, gdy Twoje zwycięstwo rozwija się w naszym życiu „pomału”.
          </p>
          <p>
            Prowadź nas bezpiecznie w tę niedzielę i przez cały nadchodzący tydzień na chwałę Twojego świętego Imienia. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer53}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks53 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=23" class="text-amber-300 underline font-semibold">Wj 23:1–33</a> w przekładzie UBG oraz Mt 5:43–48 i J 14:1–6.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 23:20 i powierz w modlitwie wszystkie ścieżki nowego tygodnia Aniołowi Przymierza — Jezusowi Chrystusowi.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zachowaj dziś dyscyplinę słowa — nie przekazuj dalej żadnej niesprawdzonej wieści ani krzywdzącej plotki.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Okaż konkretny gest życzliwości, pomocy lub cichej modlitwy osobie, z którą masz trudną relację (praktyka Wj 23:4–5).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Przyjdź dziś przed Pana z sercem pełnym wdzięczności za chleb powszedni, wodę, zdrowie i bliskich (Wj 23:15, 25).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Nazwij jedno „sidło” kompromisu odciągające Cię od pełnej wierności Chrystusowi i podejmij konkretny krok odcięcia się od niego.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 53 jako ukończony i prześlij tę lekcję osobie potrzebującej odwagi i pokoju na drodze.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks53}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 54)
const tomorrow53 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 23 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 54 — KREW PRZYMIERZA, UCZTA STARSZYCH I CHWAŁA PANA NA SYNAJU (Wj 24:1–18)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 54: W dwudziestym czwartym rozdziale Księgi Wyjścia zobaczymy uroczystą ratyfikację Przymierza krwią ofiar, zdumiewającą ucztę siedemdziesięciu starszych przed obliczem Boga Izraela oraz Mojżesza wstępującego w obłok chwały na czterdzieści dni i czterdzieści nocy.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (23 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow53}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay53, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData53 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 23:1–33) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData53);
html = html.replace(
  /Doskonale! Znasz na wskroś 22\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 23. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day52_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day52'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay52/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 52 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 52 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 23:20.")`
);
html = html.replace(/cc-daily-course-share\.js\?v=[\w.-]+/g, `cc-daily-course-share.js?v=20261114_share2`);

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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 53.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-22/
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
          'Prawda ponad presją większości, pomoc osłowi nieprzyjaciela, rok szabatowy i trzy święta PANA oraz obietnica Anioła Przymierza niosącego Imię Boga.',
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
