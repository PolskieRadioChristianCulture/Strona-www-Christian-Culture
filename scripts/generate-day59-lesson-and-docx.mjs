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
const DAY_NUM = 59;
const DATE_STR = '2026-11-28';
const DATE_FORMATTED = '28 LISTOPADA 2026 R. (SOBOTA)';
const DATE_SHORT_UPPER = '28 LISTOPADA 2026 • SOBOTA';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 29:1–46';
const TITLE = 'POŚWIĘCENIE AARONA I JEGO SYNÓW, OFIARY OCZYSZCZENIA ORAZ NIEUSTANNE CAŁOPALENIE';
const SUBTITLE =
  'Obmycie wodą, namaszczenie olejkiem, ofiara za grzech, baran poświęcenia, codzienne poranne i wieczorne całopalenie oraz obietnica Boga: „I będę mieszkał pośród synów Izraela” (Wj 29:1–46)';

const EXO29_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-029.json');
const exo29Data = JSON.parse(fs.readFileSync(EXO29_PATH, 'utf8'));
const verses = exo29Data.verses;

const v45 = verses.find((v) => v.number === 45)?.text || '';
const MEMORY_VERSE_QUOTE = v45.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 29:45 (UBG)`;

const THEME =
  'Dwudziesty dziewiąty rozdział Księgi Wyjścia ukazuje, jak grzeszny człowiek może zostać przygotowany do świętej służby i jak Bóg otwiera drogę do zamieszkania pośród swojego ludu. Samo uszycie szat chwały z poprzedniego rozdziału nie wystarczało — Aaron i jego synowie potrzebowali obmycia wodą, przyobleczenia, namaszczenia olejkiem oraz trzech kolejnych ofiar: cielca za grzech spalonego za obozem (Wj 29:10–14), pierwszego barana całopalenia na miłą woń (Wj 29:15–18) i drugiego barana poświęcenia, którego krwią naznaczono prawe ucho, prawy kciuk i duży palec prawej stopy kapłanów (Wj 29:19–34). Po siedmiu dniach pełnego poświęcenia Bóg ustanawia codzienne, ustawiczne całopalenie dwóch rocznych baranków — rano i wieczorem — ogłaszając ostateczny cel całego Przybytku: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem” (Wj 29:38–46), co w pełni wypełniło się w Jezusie Chrystusie (J 1:14; Hbr 10:10–22)!';

const IMG_FILENAME = 'kc_day_59_poswiecenie_kaplanow_calopalenie.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Poświęcenie Aarona i jego synów u wejścia do Namiotu Zgromadzenia, namaszczenie świętym olejkiem, ołtarz całopalenia i blask Bożej chwały — Wj 29:1–46';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  throw new Error(`Brak wygenerowanej grafiki Dnia 59: ${imgFullPath}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 29:1–9 — Dary bez skazy, obmycie wodą, przyobleczenie szatami chwały i namaszczenie olejkiem',
      from: 1,
      to: 9,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 29:10–18 — Ofiara za grzech z cielca spalona za obozem oraz pierwszy baran całopalenia',
      from: 10,
      to: 18,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 29:19–34 — Drugi baran poświęcenia: ucho, dłoń i stopa, ofiara kołysania oraz święta uczta kapłańska',
      from: 19,
      to: 34,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 29:35–46 — Siedem dni poświęcenia, codzienne poranne i wieczorne całopalenie oraz zamieszkanie Boga wśród ludu',
      from: 35,
      to: 46,
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
            `<p><span class="verse-num">29:${v.number}</span> ${v.text}</p>`
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
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Dziewiąty

**Czy zdajesz sobie sprawę, że całe serce Bożego planu zbawienia nie polega jedynie na odległym przebaczeniu winy, lecz na gorącym pragnieniu samego Boga, aby zamieszkać pośród nas i być naszym Bogiem?**

Zatrzymaj się w ten sobotni poranek, dwudziestego ósmego listopada dwa tysiące dwudziestego szóstego roku. Pomyśl przez chwilę o progu codziennego życia, gdy stajesz przed zadaniami kończącego się tygodnia. Czy czasem czujesz, że Bóg wydaje się daleki, a Twoje modlitwy odbijają się od własnego zmęczenia albo poczucia niegodności? Tato, dlaczego tak często zapominamy, że nie musimy własną siłą zasługiwać na wstęp do Twojej obecności, skoro Ty sam przygotowałeś drogę oczyszczenia, namaszczenia i pokoju przez doskonałą ofiarę Twojego Syna?

W dwudziestym dziewiątym rozdziale Księgi Wyjścia Bóg podaje Mojżeszowi uroczysty porządek poświęcenia Aarona oraz jego synów do służby w Przybytku. Najpierw przy wejściu do Namiotu Zgromadzenia kapłani zostali obmyci czystą wodą, przyobleczeni w święte szaty chwały i namaszczeni wonnym olejkiem wylanym na głowę Aarona. Następnie złożono trzy ofiary: młodego cielca za grzech, którego ciało zostało spalone poza obozem, pierwszego barana całopalenia spalonego w całości na miłą woń dla Pana oraz drugiego barana poświęcenia. Krwią tego drugiego barana posmarowano koniec prawego ucha, wielki palec prawej ręki oraz wielki palec prawej stopy Aarona i jego synów, a potem pokropiono ich krwią i olejkiem namaszczenia. Przez siedem dni trwało poświęcenie ołtarza i kapłanów, a na koniec Bóg ustanowił ustawiczną ofiarę dwóch rocznych baranków składanych codziennie rano i wieczorem, obiecując z mocą: zamieszkam pośród synów Izraela i będę ich Bogiem.

Psychologia głębokiego oddania i spójności wewnętrznej potwierdza, że człowiek odzyskuje prawdziwą wolność dopiero wtedy, gdy jego słuchanie, działanie oraz codzienny kierunek drogi łączą się w jednym czystym celu. Rozdwojenie serca rodzi lęk, natomiast całkowite oddanie życia Bogu przynosi trwały pokój.

Prawda Królestwa uderza z wyzwalającą mocą: każdy obraz dwudziestego dziewiątego rozdziału Księgi Wyjścia prowadzi wprost do naszego Pana Jezusa Chrystusa! Cielec spalony za obozem zapowiada Zbawiciela, który wycierpiał poza bramą Jerozolimy, aby własną krwią zgładzić nasz grzech. Całopalenie ukazuje Jego doskonałe posłuszeństwo Ojcu aż do krzyża, a krew na uchu, dłoni i stopie uczy nas, że odkupienie obejmuje całe nasze życie — nasze słuchanie Słowa, naszą codzienną pracę i każdy krok na drodze wiary! Co więcej, Jezus nie musi powtarzać ofiary każdego ranka i wieczora, ponieważ jedną doskonałą ofiarą na zawsze uświęcił wszystkich, którzy do Niego przychodzą, a jako żywe Słowo rozbił swój namiot pośród nas.

Jezus mówi dziś do Ciebie przez świadectwo Pisma:
„Jedną bowiem ofiarą uczynił doskonałymi na zawsze tych, którzy są uświęceni.” (List do Hebrajczyków, rozdział dziesiąty, werset czternasty, UBG)

Zadanie Taktyczne:
Na swoim sobotnim posterunku rozpocznij i zakończ dzisiejszy dzień świadomą modlitwą wdzięczności pod krzyżem Chrystusa, tak jak dawne poranne i wieczorne całopalenie. Nie pielęgnuj dzisiaj zniechęcenia ani duchowej obojętności, lecz wyznaj z wiarą: krew Jezusa oczyściła moje sumienie, Jego Duch mnie namaszcza, a moje uszy, dłonie i stopy należą całkowicie do mojego Pana! Poświęć spokojną chwilę na lekturę Pisma Świętego i służbę swoim bliskim.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za dwudziesty dziewiąty rozdział Księgi Wyjścia — za obmycie wodą, za ofiarę poza obozem, za krew na uchu, dłoni i stopie oraz za Twoją wierną obietnicę, że chcesz mieszkać pośród swojego ludu. Przepraszam Cię za chwile, w których moje uszy słuchały lęku zamiast Twojego Słowa, a moje ręce lub kroki gubiły kierunek oddania. Panie Jezu Chryste, Ty jesteś moim doskonałym Barankiem i Jedynym Uświęcicielem. Oczyść moje sumienie swoją krwią, namaść moje serce swoim Duchem i spraw, aby ten sobotni dzień był dla Ciebie miłą wonią wdzięczności i miłości. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Zbuduj dziś swoje życie według wiernego wzoru Pisma Świętego przez sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Czytaj codziennie jeden rozdział, dziel się światłem Ewangelii z bliskimi i wzrastaj we wspólnocie wiary.

Błogosławieństwo:
Niech Pan zastępów obmyje Twoje serce czystą wodą swego Słowa i namaści Cię pokojem Ducha Świętego; niech Twoje słuchanie, praca rąk i każda ścieżka tej soboty przynoszą chwałę Jezusowi, a Jego żywa obecność niech zamieszka pośród Twojego domu. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}
if (/\b[IVXLCDM]+\b/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry rzymskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 59 (28 listopada 2026 r., Sobota)
📖 Księga Wyjścia 29:1–46: Poświęcenie Aarona i Jego Synów, Ofiary Oczyszczenia oraz Nieustanne Całopalenie

Czy wiesz, dlaczego podczas poświęcenia kapłanów krwią barana naznaczano kolejno prawe ucho, prawy kciuk i duży palec prawej stopy — i dlaczego Bóg nakazał składać codzienną ofiarę rano i wieczorem?

W 59. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 29. rozdział Księgi Wyjścia (Wj 29:1–46: https://polskieradio.cc/mojabiblia?book=EXO&chapter=29). Bóg ustanawia 7-dniowy obrzęd poświęcenia Aarona i jego synów: obmycie wodą u wejścia do Namiotu Zgromadzenia, przyobleczenie szat i namaszczenie olejkiem (Wj 29:1–9), ofiarę za grzech z cielca spalonego za obozem (Wj 29:10–14), pierwszego barana całopalenia na miłą woń (Wj 29:15–18) oraz drugiego barana poświęcenia, którego krew spoczywa na prawym uchu, kciuku i stopie kapłanów wraz z olejkiem i ofiarą kołysania (Wj 29:19–34). Rozdział wieńczy nakaz ustawicznego całopalenia dwóch rocznych baranków — rano i wieczorem — oraz najpiękniejsza obietnica Pisma: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem” (Wj 29:35–46). Wybieraj dzisiaj świadomie: oddaj Chrystusowi swoje uszy, dłonie i kroki, rozpoczynając i kończąc dzień pod Jego krzyżem!

Jezus mówi dziś do Ciebie:
• „I będę mieszkał pośród synów Izraela, i będę ich Bogiem.” (Wj 29:45, UBG)
• „Jedną bowiem ofiarą uczynił doskonałymi na zawsze tych, którzy są uświęceni.” (Hbr 10:14, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 29:1–46 oraz Hbr 10:10–22 i 13:11–16.
• Wierz: Jezus Chrystus wycierpiał poza bramą jako Twoja doskonała ofiara za grzech, raz na zawsze otworzył Ci drogę do Ojca i mieszka w swoim Kościele.
• Działaj: Oddaj dziś Bogu swoje słuchanie (ucho), dzisiejszą pracę (dłoń) i kierunek decyzji (stopa) oraz otwórz i zamknij dzień świadomą modlitwą wdzięczności.

Studiuj pełny tekst UBG, 9 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-59

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
📻 Radio 24/7 i Biblia Audio: https://polskieradio.cc
💛 Wspieraj misję Słowa (WspieramTO): https://polskieradio.cc/wspieramto`;

const v3SmsText = `Dzień 59 (Wj 29:45): „I będę mieszkał pośród synów Izraela, i będę ich Bogiem.” Przez jedną ofiarę Jezusa masz dziś wolny wstęp do Ojca! polskieradio.cc/akademia/kurscodzienny/dzien-59`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalna scena biblijna sprzed Namiotu Zgromadzenia: ołtarz całopalenia z wznoszącym się ku niebu płomieniem i dymem miłej woni, Aaron w świętych szatach namaszczany czystym olejkiem z rogu oraz jego synowie w białym bisiore, a nad Przybytkiem jaśniejący obłok chwały Pańskiej. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 59: POŚWIĘCENIE AARONA I JEGO SYNÓW, OFIARY OCZYSZCZENIA ORAZ NIEUSTANNE CAŁOPALENIE (WJ 29:1–46)”.

[INTRO: OD SZAT CHWAŁY DO SERCA PRZYMIERZA]
Noemi: Dzień dobry w sobotni poranek! Witamy serdecznie wszystkich widzów Christian Culture TV w pięćdziesiątym dziewiątym dniu naszego kursu „Z Biblią za Pan Brat”! Wczoraj w dwudziestym ósmym rozdziale Księgi Wyjścia podziwialiśmy święte szaty arcykapłana, a dziś w dwudziestym dziewiątym rozdziale oglądamy samą siedmiodniową uroczystość wprowadzenia Aarona i jego synów w służbę przed Bogiem!
Sara: Witaj Noemi, witamy bardzo ciepło każdego z Was! Ten rozdział odsłania niezwykle głęboką kolejność duchowego życia: zanim Aaron mógł stanąć przy ołtarzu i wejść do Namiotu Zgromadzenia, musiał przejść przez obmycie wodą, przyobleczenie szat, namaszczenie olejkiem i aż trzy różne ofiary!

[ANALIZA PROBLEMOWA: UCHO, DŁOŃ, STOPA I CODZIENNA OFIARA TAMID]
Noemi: Zobaczmy tę poruszającą scenę z czternastego oraz dwudziestego wersetu! Najpierw złożono cielca na ofiarę za grzech, a jego mięso, skórę i odchody spalono w ogniu poza obozem — dokładnie tam, gdzie wieki później poza bramą Jerozolimy ucierpiał nasz Zbawiciel Jezus Chrystus! Potem pierwszy baran został złożony jako pełne całopalenie na miłą woń dla PANA.
Sara: A następnie przychodzi drugi baran — baran poświęcenia! W dwudziestym wersecie Mojżesz bierze jego krew i smaruje koniec prawego ucha Aarona, wielkie palce jego prawych rąk i wielkie palce jego prawych stóp — dokładnie tak samo u jego synów — a potem kropi ich krwią z ołtarza i olejkiem namaszczenia! Ucho do słuchania Bożego Słowa, ręka do czystej służby i stopa do wiernego kroczenia drogą Pana!
Noemi: A od trzydziestego ósmego do czterdziestego szóstego wersetu Bóg ustanawia nieustanne całopalenie: dwa roczne baranki każdego dnia — jednego rano, a drugiego wieczorem! I podaje prawdziwy cel całej świątyni: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem”!

[SŁOWO ROZKAZU: JEDNA OFIARA JEZUSA I ŻYWA OBECNOŚĆ BOGA]
Sara: I tutaj cały dwudziesty dziewiąty rozdział Księgi Wyjścia rozbrzmiewa pełnią Ewangelii! List do Hebrajczyków w dziesiątym rozdziale pokazuje, że dawni kapłani musieli składać te same ofiary codziennie, ale nasz Pan Jezus Chrystus jedną jedyną ofiarą samego siebie uczynił doskonałymi na zawsze tych, którzy są uświęceni!
Noemi: Dokładnie tak! Dlatego dziś nie przynosimy już cielców ani baranków na miedziany ołtarz, lecz przez krew Jezusa mamy śmiałość wejść drogą nową i żywą przed oblicze Ojca! A hebrajskie słowo szachan — „będę mieszkał pośród nich” — znajduje swoje najpiękniejsze spełnienie w Ewangelii Jana: Słowo stało się ciałem i zamieszkało, czyli dosłownie rozbiło swój namiot wśród nas!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak przeżyć dwudziesty dziewiąty rozdział Księgi Wyjścia w tę sobotę?
• Czytaj: dwudziesty dziewiąty rozdział Księgi Wyjścia oraz dziesiąty rozdział Listu do Hebrajczyków, wersety od dziesiątego do dwudziestego drugiego.
• Wierz: krew Jezusa oczyszcza całe Twoje życie — ucho, dłoń i stopę — i otwiera Ci codzienny przystęp do Boga, który chce mieszkać z Tobą.
• Działaj: otwórz poranek i zamknij wieczór tej soboty świadomą modlitwą wdzięczności i oddaj dziś Bogu jedną konkretną czynność swoich rąk dla dobra bliźniego!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Ojcze Niebieski, dziękujemy Ci za dwudziesty dziewiąty rozdział Księgi Wyjścia — za obmycie wodą, namaszczenie olejkiem, ofiarę za grzech poza obozem i obietnicę Twojego zamieszkania pośród ludu.
Noemi: Panie Jezu Chryste, nasz Wielki Arcykapłanie i Baranku Boży, dziękujemy Ci, że jedną ofiarą na krzyżu otworzyłeś nam żywą drogę do Ojca. Poświęć nasze uszy na Twój głos, nasze dłonie do miłości i nasze stopy na Twoje ścieżki przez całą tę sobotę. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech pokój Bożego zamieszkania wypełnia dziś Twoje serce i Twój dom od poranka aż do wieczora!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w trzydziestym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: POŚWIĘCENIE KAPŁANÓW, KREW NA UCHU I OBIETNICA ZAMIESZKANIA BOGA — TEOLOGIA KSIĘGI WYJŚCIA 29
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 28 listopada 2026 r.

Dwudziesty dziewiąty rozdział Księgi Wyjścia (Wj 29:1–46) stanowi liturgiczny i teologiczny finał instrukcji dotyczących Przybytku z pierwszej części pobytu Izraela pod Synajem. Po opisie sprzętów świątyni (Wj 25–27) oraz szat arcykapłańskich (Wj 28) tekst przedstawia siedmiodniowy obrzęd ordynacji Aarona i jego synów, prowadzący do ustanowienia codziennego całopalenia (*olat tamid*) oraz obietnicy zamieszkania Boga pośród swojego ludu.

1. Obmycie, przyobleczenie, namaszczenie i ofiara poza obozem (Wj 29:1–18)
> „Aaronowi i jego synom każesz zbliżyć się do wejścia do Namiotu Zgromadzenia i obmyjesz ich wodą.” — Księga Wyjścia 29:4 (UBG)

Proces wprowadzenia w urząd (*kadasz*, קָדַשׁ, Strong H6942 — poświęcić, oddzielić) rozpoczął się u wejścia do Namiotu Zgromadzenia od oczyszczenia wodą, włożenia świętych szat na Aarona oraz wylania olejku namaszczenia (*miszcha*, מִשְׁחָה, Strong H4888) na jego głowę (Wj 29:4–9). Bezpośrednio po tym nastąpiła ściśle uporządkowana sekwencja ofiar. Najpierw Aaron i jego synowie włożyli ręce na młodego cielca jako ofiarę za grzech (*chattat*, חַטָּאת, Strong H2403): jego krwią pomazano rogi ołtarza, a mięso, skórę i odchody spalono poza obozem (Wj 29:10–14). Dopiero po usunięciu winy złożono pierwszego barana na całkowite całopalenie (*ola*, עֹלָה, Strong H5930), spalonego w całości na ołtarzu jako „miła woń” przed PANEM (Wj 29:15–18).

2. Baran poświęcenia: ucho, kciuk, stopa oraz „napełnienie rąk” (Wj 29:19–34)
> „Weźmiesz też nieco z krwi, która jest na ołtarzu, także z olejku do namaszczenia, i pokropisz Aarona, jego szaty oraz jego synów i szaty jego synów wraz z nim.” — Księga Wyjścia 29:21 (UBG)

Szczególną wymowę teologiczną ma obrzęd drugiego barana — barana poświęcenia, czyli dosłownie „napełnienia ręki” (hebr. *mille jad*, por. Strong H4390/H3027). Krwią tej ofiary posmarowano koniec prawego ucha, wielki palec prawej ręki oraz wielki palec prawej stopy Aarona i jego synów, obejmując symbolicznie zmysł słuchu, działanie rąk oraz kierunek całej drogi życiowej (Wj 29:20). Po pokropieniu krwią i olejkiem na dłonie kapłanów złożono części barana oraz przaśniki jako ofiarę kołysania (*tenufa*, תְּנוּפָה, Strong H8573), a wydzieloną pierś kołysania i prawą łopatkę wzniesienia (*teruma*, תְּרוּמָה, Strong H8641) ustanowiono wiecznym działem kapłańskim (Wj 29:22–28). Obrzęd wieńczyła święta uczta przymierza w miejscu świętym, z nakazem spalenia wszelkich resztek przed porankiem (Wj 29:31–34).

3. Siedem dni poświęcenia, ofiara ustawiczna i Boża chwała (Wj 29:35–46)
> „I będę mieszkał pośród synów Izraela, i będę ich Bogiem.” — Księga Wyjścia 29:45 (UBG)

Przez siedem pełnych dni kapłani oraz sam ołtarz przechodzili proces oczyszczenia i namaszczenia (Wj 29:35–37). Następnie Bóg ustanowił ustawiczne codzienne całopalenie (*tamid*, תָּמִיד, Strong H8548): dwa roczne baranki wraz z ofiarą z mąki, oliwy i wina — jeden rano, drugi wieczorem przez wszystkie pokolenia (Wj 29:38–42). To nieustanne nabożeństwo było miejscem spotkania i rozmowy Boga z ludem, uświęconym Jego chwałą (Wj 29:43–44). Słowo *szachan* (שָׁכַן, Strong H7931 — „będę mieszkał pośród”) wskazuje, że ostatecznym celem wyprowadzenia Izraela z Egiptu nie była sama wolność polityczna, lecz zamieszkanie Boga pośród odkupionego ludu (Wj 29:45–46).

4. Perspektywa Chrystocentryczna: Od ofiary poza obozem do Emmanuela
Nowy Testament odczytuje Księgę Wyjścia 29 jako proroctwo w obrazach wypełnione w osobie i dziele Jezusa Chrystusa. List do Hebrajczyków 13:11–12 wprost zestawia ciało cielca spalonego poza obozem (Wj 29:14) z męką Jezusa poza bramą Jerozolimy dla uświęcenia ludu własną krwią. Podczas gdy izraelscy kapłani musieli codziennie powtarzać ofiary poranne i wieczorne, Chrystus „jedną bowiem ofiarą uczynił doskonałymi na zawsze tych, którzy są uświęceni” (Hbr 10:14), otwierając nową i żywą drogę do Ojca z sercami oczyszczonymi i ciałem obmytym czystą wodą (Hbr 10:19–22). Z kolei obietnica zamieszkania Boga pośród ludu (Wj 29:45) spełnia się najpierw we Wcieleniu — gdy Słowo stało się ciałem i dosłownie „rozbiło namiot wśród nas” (J 1:14) — a w pełni zajaśnieje w Nowym Jeruzalem, gdzie Bóg zamieszka z ludźmi na wieki (Obj 21:3).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 29:1–46 uczy, że świętość służby nie zaczyna się od ludzkiego wysiłku, lecz od obmycia, ofiary oczyszczenia i namaszczenia danego przez Boga. W Jezusie Chrystusie to Bóg staje się naszym Jedynym Barankiem, Arcykapłanem i Uświęcicielem, aby zamieszkać pośród nas na wieki.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | polskieradio.cc/mojabiblia`;

// ── 2. QUIZ: 20 PYTAŃ Z WJ 29:1–46 (100% ZGODNE Z UBG-2025) ──
const quizItems = [
  {
    q: '1. Jakie zwierzęta bez skazy miał wziąć Mojżesz do poświęcenia Aarona i jego synów (Wj 29:1)?',
    a: [
      'Dwa cielce i jednego kozła',
      'Jednego młodego cielca i dwa barany bez skazy',
      'Siedem jagniąt i dwie synogarlice',
      'Jednego byka i trzy kozły',
    ],
    c: 1,
  },
  {
    q: '2. Jakie rodzaje pieczywa z wybornej mąki pszennej należało włożyć do jednego kosza (Wj 29:2–3)?',
    a: [
      'Chleb na zakwasie i placki miodowe',
      'Przaśne chleby, przaśne placki zaprawione oliwą i przaśne podpłomyki posmarowane oliwą',
      'Jęczmienne bochenki z solą i ziołami',
      'Dwanaście chlebów pokładnych na zakwasie',
    ],
    c: 1,
  },
  {
    q: '3. Od jakiej czynności u wejścia do Namiotu Zgromadzenia rozpoczęło się poświęcenie Aarona i jego synów (Wj 29:4)?',
    a: [
      'Od nałożenia złotej korony na głowę',
      'Od obmycia ich wodą',
      'Od spalenia kadzidła na dziedzińcu',
      'Od odczytania tablic przymierza',
    ],
    c: 1,
  },
  {
    q: '4. Co Mojżesz wylał na głowę Aarona po przyobleczeniu go w szaty, mitrę i świętą koronę (Wj 29:5–7)?',
    a: [
      'Czystą wodę źródlaną',
      'Olejek do namaszczenia',
      'Wino z ofiary z płynów',
      'Krew barana poświęcenia',
    ],
    c: 1,
  },
  {
    q: '5. Na jakiej mocy według Wj 29:9 kapłaństwo miało należeć do Aarona i jego synów?',
    a: [
      'Na czas siedmiu lat na pustyni',
      'Na mocy wiecznej ustawy',
      'Jedynie do chwili wejścia do Kanaanu',
      'Na mocy umowy starszych z pokolenia Judy',
    ],
    c: 1,
  },
  {
    q: '6. Co uczynili Aaron i jego synowie z głową cielca przed jego zabiciem u wejścia do Namiotu Zgromadzenia (Wj 29:10)?',
    a: [
      'Ozdobili ją błękitnym sznurem',
      'Włożyli swoje ręce na głowę cielca',
      'Polali ją wodą i oliwą',
      'Pochylili ją w stronę wschodnią',
    ],
    c: 1,
  },
  {
    q: '7. Co Mojżesz pomazał swym palcem krwią cielca ofiary za grzech i gdzie wylał resztkę krwi (Wj 29:12)?',
    a: [
      'Zasłonę Miejsca Najświętszego, a resztkę wylał do kadzi',
      'Rogi ołtarza, a resztkę krwi wylał u podnóża ołtarza',
      'Bramę dziedzińca, a resztkę zebrał do misy',
      'Stół chlebów pokładnych, a resztkę zakopał w piasku',
    ],
    c: 1,
  },
  {
    q: '8. Gdzie należało spalić mięso cielca ofiary za grzech, jego skórę i jego odchody (Wj 29:14)?',
    a: [
      'Na ołtarzu całopalenia na dziedzińcu',
      'W ogniu za obozem, bo to jest ofiara za grzech',
      'W Miejscu Świętym przed świecznikiem',
      'W garnkach miedzianych przy wejściu do Namiotu',
    ],
    c: 1,
  },
  {
    q: '9. Co zrobiono z pierwszym baranem po wyłożeniu na niego rąk i pokropieniu krwią wierzchu ołtarza (Wj 29:15–18)?',
    a: [
      'Ugotowano go i rozdano całemu obozowi',
      'Porąbano na części, opłukano trzewia i nogi i spalono całego na ołtarzu jako całopalenie dla PANA, miłą woń',
      'Spalono tylko jego skórę i łój poza obozem',
      'Zostawiono połowę mięsa do poranka',
    ],
    c: 1,
  },
  {
    q: '10. Które części ciała Aarona i jego synów posmarowano krwią drugiego barana (Wj 29:20)?',
    a: [
      'Czoło, lewą dłoń i lewe ramię',
      'Koniec prawego ucha, wielki palec prawej ręki i wielki palec prawej stopy',
      'Obie dłonie, kolana i czoło',
      'Lewe ucho, serce i prawy łokieć',
    ],
    c: 1,
  },
  {
    q: '11. Czym pokropiono Aarona, jego synów oraz ich szaty w Wj 29:21, aby zostali poświęceni?',
    a: [
      'Samą wodą z kadzi',
      'Krwią, która jest na ołtarzu, oraz olejkiem do namaszczenia',
      'Winem i popiołem z ołtarza',
      'Mąką pszenną zmieszaną z kadzidłem',
    ],
    c: 1,
  },
  {
    q: '12. Jakie części drugiego barana wraz z pieczywem z kosza przaśników położono na ręce Aarona i jego synów (Wj 29:22–24)?',
    a: [
      'Głowę, skórę i lewą nogę',
      'Łój, ogon, tłuszcz wnętrzności, płat wątroby, obie nerki z łojem, prawą łopatkę oraz bochen, placek na oliwie i podpłomyk',
      'Serce, płuca i oba rogi barana',
      'Wszystkie kości i skórę barana',
    ],
    c: 1,
  },
  {
    q: '13. W jaki sposób ofiarowano przed PANEM dary położone na ręce Aarona i jego synów (Wj 29:24–25)?',
    a: [
      'Zakopano je pod ołtarzem',
      'Kołysano nimi jako ofiarą kołysania przed PANEM, a potem spalono na ołtarzu jako całopalenie',
      'Rozdano je starszym Izraela bez spalania',
      'Zaniesiono je za obóz i spalono w dole',
    ],
    c: 1,
  },
  {
    q: '14. Które dwie części barana poświęcenia stały się wiecznym działem dla Aarona i jego synów od synów Izraela (Wj 29:26–28)?',
    a: [
      'Głowa i skóra',
      'Pierś kołysania i łopatka wzniesienia',
      'Nerki i płat wątroby',
      'Ogon i nogi barana',
    ],
    c: 1,
  },
  {
    q: '15. Ile dni miał chodzić w świętych szatach Aarona syn, który zajmie jego miejsce po nim (Wj 29:29–30)?',
    a: [
      'Trzy dni',
      'Siedem dni',
      'Czterdzieści dni',
      'Jeden dzień w roku',
    ],
    c: 1,
  },
  {
    q: '16. Kto mógł jeść mięso barana poświęcenia i chleb z kosza przy wejściu do Namiotu Zgromadzenia, a co należało zrobić z resztkami do poranka (Wj 29:32–34)?',
    a: [
      'Każdy przybysz z ludu, a resztki zachować na następny tydzień',
      'Tylko Aaron i jego synowie (obcy nie mógł jeść), a resztki pozostałe do poranka należało spalić w ogniu',
      'Tylko Mojżesz, a resztki oddać biednym za obozem',
      'Wszyscy Lewici, a resztki wysuszyć na słońcu',
    ],
    c: 1,
  },
  {
    q: '17. Przez ile dni należało poświęcać Aarona i jego synów oraz dokonywać przebłagania za ołtarz, aby stał się najświętszy (Wj 29:35–37)?',
    a: [
      'Przez trzy dni',
      'Przez siedem dni',
      'Przez dwanaście dni',
      'Przez trzydzieści dni',
    ],
    c: 1,
  },
  {
    q: '18. Co Bóg nakazał składać na ołtarzu codziennie i ustawicznie (Wj 29:38–39)?',
    a: [
      'Jednego cielca każdego tygodnia',
      'Dwa roczne baranki codziennie: jednego rano, a drugiego wieczorem',
      'Dwanaście baranków w każdy nów księżyca',
      'Siedem synogarlic w samo południe',
    ],
    c: 1,
  },
  {
    q: '19. Co należało składać wraz z porannym i wieczornym barankiem ustawicznego całopalenia (Wj 29:40–41)?',
    a: [
      'Srebrne naczynia i sól',
      'Dziesiątą część efy mąki pszennej zmieszanej z czwartą częścią hinu wytłoczonej oliwy oraz na ofiarę z płynów czwartą część hinu wina',
      'Kadzidło i korę akacji',
      'Miód, mleko i jęczmień',
    ],
    c: 1,
  },
  {
    q: '20. Jaki ostateczny cel całego Przybytku, ofiar i poświęcenia kapłanów ogłasza Bóg w Wj 29:45–46?',
    a: [
      'Aby Izrael wzbudzał postrach na pustyni',
      '„I będę mieszkał pośród synów Izraela, i będę ich Bogiem”',
      'Aby Mojżesz nigdy nie musiał wychodzić na górę Synaj',
      'Aby Aaron zbudował kamienne miasto w Egipcie',
    ],
    c: 1,
  },
];

// ── 3. PEŁNA LEKCJA WG WYTYCZNYCH GPT (12 SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH) ──
const lessonDocxText = `STRONA OTWIERAJĄCA

ZANIM OTWORZYSZ BIBLIĘ — WPROWADZENIE KONTEKSTOWE
Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie 66 ksiąg Pisma Świętego — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Słowa Bożego.
Dziś jest Dzień 59: Księga Wyjścia 29:1–46. W rozdziałach 25–28 Bóg przekazał plany świętych sprzętów Przybytku, samego Namiotu Zgromadzenia, dziedzińca z miedzianym ołtarzem oraz świętych szat arcykapłańskich. Teraz, w 29. rozdziale, przechodzimy od architektury i stroju do samego serca służby — uroczystego poświęcenia (ordynacji) Aarona i jego synów.
Zanim kapłan zacznie reprezentować lud przed Bogiem, sam musi zostać obmyty wodą, przyobleczony w szaty chwały, namaszczony olejkiem oraz oczyszczony krwią ofiar. W tym rozdziale odkryjemy głęboką kolejność łaski: od ofiary za grzech spalonej poza obozem, przez całopalenie i naznaczenie prawego ucha, kciuka i stopy krwią barana poświęcenia, aż po codzienne ustawiczne całopalenie (tamid) i wielką obietnicę: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem” (Wj 29:45).

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 29:1–46)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 29:1–46)
• H6942 — קָדַשׁ (Kadasz): poświęcić, uświęcić, oddzielić dla Boga na świętą służbę (Wj 29:1, 44).
• H4390 / H3027 — מִלֵּא יָד (Mille jad): dosł. „napełnić rękę” — biblijne określenie wprowadzenia w urząd kapłański i powierzenia służby (Wj 29:9, 24, 33).
• H4888 — מִשְׁחָה (Miszcha): namaszczenie świętym olejkiem wylanym na głowę Aarona i kropionym wraz z krwią na szaty (Wj 29:7, 21, 29).
• H2403 — חַטָּאת (Chattat): ofiara za grzech, której ciało spalano w ogniu poza obozem (Wj 29:14, 36).
• H5930 — עֹלָה (Ola): ofiara całopalna spalana w całości na ołtarzu jako „miła woń” wznosząca się ku PANU (Wj 29:18, 25, 42).
• H8573 — תְּנוּפָה (Tenufa): ofiara kołysania przed PANEM złożona na rękach kapłanów (Wj 29:24, 26–27).
• H8641 — תְּרוּמָה (Teruma): ofiara wzniesienia, stanowiąca wraz z piersią kołysania wieczny dział kapłański (Wj 29:27–28).
• H8548 — תָּמִיד (Tamid): ustawiczność — nieustanne codzienne całopalenie dwóch baranków rano i wieczorem (Wj 29:38, 42).
• H7931 — שָׁכַן (Szachan): zamieszkać pośród ludu — finałowa obietnica Bożej obecności wśród Izraela (Wj 29:45–46).

ANALIZA EGZEGETYCZNA — 5 CZĘŚCI, 45 PUNKTÓW STUDIUM (WJ 29:1–46)

CZĘŚĆ I — PRZYGOTOWANIE DARÓW, OBMYCIE WODĄ, PRZYOBLECZENIE I NAMASZCZENIE (WJ 29:1–9)
1. Trzy zwierzęta bez skazy (29:1): Jeden młody cielec i dwa barany bez skazy — Bóg przyjmuje do świętej służby wyłącznie ofiary nieskazitelne (por. 1 P 1:19).
2. Kosz przaśników z wybornej mąki pszennej (29:2–3): Przaśne chleby, placki zaprawione oliwą i podpłomyki posmarowane oliwą — brak zakwasu oznacza czystość bez zepsucia, a oliwa wskazuje na Ducha Świętego.
3. Wezwanie u wejścia do Namiotu Zgromadzenia (29:4): Poświęcenie odbywa się publicznie u progu świątyni, według Bożego porządku.
4. Obmycie czystą wodą (29:4): „Obmyjesz ich wodą” — przed nałożeniem świętych szat potrzebne jest oczyszczenie (zapowiedź obmycia przez Słowo i odrodzenie, J 13:10; Tyt 3:5; Hbr 10:22).
5. Przyobleczenie Aarona w pełny strój chwały (29:5–6): Tunika, błękitny ornat, efod, pektorał, pas, mitra i święta korona („Świętość PANU”) — strój dany z łaski od wewnątrz na zewnątrz.
6. Wylanie olejku namaszczenia na głowę Aarona (29:7): Obfite namaszczenie bez rozlewu krwi zapowiada namaszczenie Chrystusa Duchem Świętym (Ps 133:2; Łk 4:18; Dz 10:38).
7. Przyobleczenie synów Aarona (29:8–9): Szaty, pasy i mitry dla synów podkreślają, że wspólnota sług dzieli tę samą powagę powołania.
8. „Napełnienie rąk” — poświęcenie do służby (29:9): Hebrajski zwrot mille jad („napełnić rękę”) oznacza przekazanie pełnomocnictwa i włożenie obowiązków służby w dłonie powołanych.
9. „Kapłaństwo na mocy wiecznej ustawy” (29:9): Trwałość Bożego ustanowienia wskazuje naprzód na wieczne, nieprzemijające kapłaństwo Chrystusa (Hbr 7:24).

CZĘŚĆ II — OFIARA ZA GRZECH: PRZENIESIENIE WINY I SPALENIE ZA OBOZEM (WJ 29:10–14)
10. Włożenie rąk na głowę cielca (29:10): Aaron i jego synowie kładą dłonie na głowę zwierzęcia — jawne wyznanie grzechu i utożsamienie się z zastępczą ofiarą.
11. Cielec zabity przed PANEM (29:11): Zanim kapłan wstawi się za ludem, sam potrzebuje przebłagania za własne grzechy (Hbr 7:27).
12. Krew na rogach ołtarza i wylana u jego podnóża (29:12): Rogi oznaczają moc i ratunek, a podstawa — fundament pojednania: „bez przelania krwi nie ma przebaczenia grzechów” (Hbr 9:22).
13. Tłuszcz, płat wątroby i obie nerki spalone na ołtarzu (29:13): Najbogatsze części wewnętrzne oddane na ołtarzu Bogu, podczas gdy obciążone winą ciało nie nadaje się do spożycia.
14. Mięso, skóra i odchody spalone za obozem (29:14): „Bo to jest ofiara za grzech” — wprost zapowiedź Jezusa Chrystusa, który wycierpiał poza bramą Jerozolimy, aby uświęcić lud własną krwią (Hbr 13:11–12)!

CZĘŚĆ III — PIERWSZY BARAN: CAŁOPALENIE NA MIŁĄ WOŃ DLA PANA (WJ 29:15–18)
15. Włożenie rąk na pierwszego barana (29:15): Po usunięciu grzechu następuje akt całkowitego oddania się Bogu.
16. Pokropienie krwią wierzchu ołtarza dokoła (29:16): Krew otacza całe miejsce kultu jako znak pełnego pojednania.
17. Porąbanie na części, opłukanie trzewi i nóg (29:17): Nic nie zostaje ukryte ani pominięte; zarówno wnętrze serca (trzewia), jak i codzienna droga (nogi) muszą zostać obmyte.
18. Spalenie całego barana na ołtarzu (29:18): „Całopalenie dla PANA, miła woń” — cały dar wznosi się ku Bogu, zapowiadając doskonałe posłuszeństwo Jezusa aż do śmierci (Ef 5:2).

CZĘŚĆ IV — DRUGI BARAN POŚWIĘCENIA: UCHO, DŁOŃ, STOPA, KOŁYSANIE I UCZTA ŚWIĘTA (WJ 29:19–34)
19. Włożenie rąk na drugiego barana — barana poświęcenia (29:19, 22): Baran „napełnienia”, wprowadzający obmytych i przebaczonych kapłanów w codzienną posługę.
20. Krew na końcu prawego ucha (29:20): Słuch sługi Bożego ma być odkupiony i otwarty wyłącznie na głos Słowa Bożego (por. Iz 50:5).
21. Krew na wielkim palcu prawej ręki (29:20): Praca, czyny i każdy wysiłek rąk należą do Pana.
22. Krew na wielkim palcu prawej stopy (29:20): Kierunek całego życia i każdy krok mają podążać drogą Bożych przykazań.
23. Pokropienie krwią i olejkiem namaszczenia razem (29:21): Krew oczyszczenia oraz olejek Ducha Świętego spoczywają wspólnie zarówno na kapłanach, jak i na ich szatach.
24. Części barana i przaśniki złożone na rękach kapłanów (29:22–24): Dosłowne „napełnienie rąk” — dłonie sługi Bożego noszą dary pojednania i pokoju.
25. Ofiara kołysania przed PANEM i spalenie (29:24–25): Ruch ku ołtarzowi i z powrotem symbolizował oddanie daru Bogu oraz przyjęcie go z Jego ręki.
26. Pierś kołysania i łopatka wzniesienia jako dział kapłański (29:26–28): Serce (pierś) i siła (łopatka) z ofiar pojednawczych zapewniają utrzymanie sług ołtarza na mocy wiecznej ustawy.
27. Dziedziczenie świętych szat przez siedem dni (29:29–30): Następca Aarona przejmuje te same szaty na siedem dni — ciągłość służby mimo przemijania pokoleń.
28. Gotowanie i spożycie mięsa i chleba w miejscu świętym (29:31–33): Wspólny posiłek przymierza — przebłaganie przechodzi w społeczność radości przed Bogiem.
29. „Obcy zaś nie będzie z tego jadł, bo jest to rzecz święta” (29:33): Uczta ołtarza wymaga przynależności do przymierza i powołania Bożego.
30. Spalenie resztek pozostałych do poranka (29:34): Ochrona daru przed zepsuciem — świętość służby wymaga świeżości każdego dnia.
31. Kolejność trzech ofiar (29:10–34): Najpierw ofiara za grzech (przebaczenie), potem całopalenie (oddanie), na końcu baran poświęcenia (służba i wspólnota) — nigdy odwrotnie!

CZĘŚĆ V — SIEDEM DNI POŚWIĘCENIA, OFIARA USTAWICZNA I ZAMIESZKANIE BOGA POŚRÓD LUDU (WJ 29:35–46)
32. Siedem dni pełnego poświęcenia (29:35): Siedem dni wyraża pełnię przygotowania i oddzielenia do służby Bogu.
33. Codzienne oczyszczenie i namaszczenie ołtarza przez siedem dni (29:36–37): Nawet najświętszy ołtarz wymagał przebłagania i poświęcenia przed rozpoczęciem służby ludu.
34. „Ktokolwiek dotknie się ołtarza, musi być poświęcony” (29:37): Zbliżanie się do świętości Boga nie znosi lekkomyślności — wymaga czystości i czci.
35. Ustawiczna ofiara poranna i wieczorna (29:38–39): Dwa roczne baranki codziennie — jeden rano, drugi wieczorem — otaczały cały dzień Izraela nieprzerwanym świadectwem pojednania.
36. Mąka z wytłoczoną oliwą i wino na ofiarę z płynów (29:40–41): Codzienny trud, Duch Święty i radość zbawienia towarzyszące obu barankom jako miła woń.
37. „Nieustanne całopalenie przez wszystkie pokolenia” (29:42): Wierność Bożego miłosierdzia trwa nieprzerwanie dzień po dniu.
38. Spotkanie i rozmowa z Bogiem (29:42–43): „Gdzie będę się z wami spotykać, aby tam z tobą rozmawiać” — ofiara istnieje po to, by otworzyć żywą więź z Bogiem!
39. „To miejsce zostanie poświęcone moją chwałą” (29:43): Przybytek staje się święty nie przez ludzkie złoto, lecz przez obecność chwały PANA (Szekiny).
40. Bóg sam uświęca (29:44): „Poświęcę Namiot Zgromadzenia i ołtarz, poświęcę też Aarona i jego synów” — źródłem wszelkiego uświęcenia jest sam PAN!
41. Największa obietnica rozdziału (29:45): „I będę mieszkał pośród synów Izraela, i będę ich Bogiem” — przywrócenie bliskości z Bogiem utraconej po upadku w Edenie.
42. Cel wyjścia z Egiptu (29:46): Bóg wyzwolił swój lud z niewoli nie dla pustej niezależności, lecz po to, aby zamieszkać w jego środku jako jego Bóg.
43. Tamid (תָּמִיד) — rytm poranka i wieczoru: Wskazuje wierzącym potrzebę codziennego rozpoczynania i kończenia dnia pod krzyżem Chrystusa i modlitwą.
44. Szachan (שָׁכַן) — Bóg „rozbijający namiot” wśród ludzi: W Ewangelii Jana 1:14 Słowo stało się ciałem i dosłownie „zamieszkało (rozbiło namiot) wśród nas”.
45. Od Synaju do Nowego Jeruzalem (29:45–46; Obj 21:3): Obietnica Bożego zamieszkania pośród ludu spina całe Pismo Święte jedną klamrą łaski!

JEZUS W CENTRUM — NASZ BARANEK OFIARNY, JEDYNY UŚWIĘCICIEL I EMMANUEL MIESZKAJĄCY WŚRÓD NAS
1. Jezus Chrystus — Ofiara za Grzech Cierpiąca „Poza Obozem” (Wj 29:10–14; Hbr 13:11–12): Tak jak cielec ofiary za grzech był spalany poza obozem, tak Jezus, aby uświęcić lud własną krwią, wycierpiał poza bramą Jerozolimy.
2. Jezus Chrystus — Całopalenie Doskonałego Posłuszeństwa i Miłej Woni (Wj 29:15–18; Ef 5:2; Hbr 10:5–10): Chrystus oddał samego siebie Bogu w całkowitym posłuszeństwie jako ofiara i danina o miłej woni, spełniając wolę Ojca raz na zawsze.
3. Jezus Chrystus — Krew Oczyszczenia i Olejek Namaszczenia dla Wierzących (Wj 29:7, 20–21; Dz 10:38; 1 P 2:9): Przez krew Baranka i namaszczenie Duchem Świętym Kościół staje się „królewskim kapłaństwem”, którego uszy, ręce i stopy są poświęcone PANU.
4. Jezus Chrystus — Jedna Ofiara Doskonała na Zawsze Zastępująca Codzienne Baranki Tamid (Wj 29:38–42; Hbr 9:12–14; 10:11–14): Podczas gdy dawni kapłani składali baranki codziennie rano i wieczorem, Jezus jedną ofiarą samego siebie uczynił doskonałymi na zawsze tych, którzy są uświęceni!
5. Jezus Chrystus — Ten, Który Sam Uświęca i Otwiera Nową Drogę przez Zasłonę (Wj 29:44; Hbr 2:11; 10:19–22): Mając śmiałość wejść do Miejsca Najświętszego przez krew Jezusa, zbliżamy się z sercami oczyszczonymi i ciałem obmytym czystą wodą.
6. Jezus Chrystus — Emmanuel: Bóg Zamieszkujący Pośród Swego Ludu (Wj 29:45–46; J 1:14; Obj 21:3): Obietnica „I będę mieszkał pośród synów Izraela” stała się ciałem w Jezusie z Nazaretu i osiągnie pełnię w Nowym Jeruzalem!

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 29:4 → J 13:10; Tyt 3:5; Hbr 10:22: Co w Nowym Testamencie oznacza obmycie czystą wodą przed przystąpieniem do służby Bożej?
• Wj 29:7, 21 → Ps 133:2; Dz 10:38; 2 Kor 1:21–22: Jak namaszczenie olejkiem ukazuje posługę Ducha Świętego na Chrystusie i wierzących?
• Wj 29:10–12 → Kpł 16:21; Hbr 9:22: Co symbolizuje włożenie rąk na głowę ofiary i dlaczego bez przelania krwi nie ma przebaczenia?
• Wj 29:14 → Kpł 4:11–12; Hbr 13:11–13: Dlaczego mięso ofiary za grzech spalano poza obozem i jak łączy się to z Golgotą?
• Wj 29:15–18 → Ef 5:2; Rz 12:1: Co oznacza całkowite oddanie ciała i życia jako „miła woń” i „ofiara żywa”?
• Wj 29:20 → Kpł 8:23–24; Iz 50:5: Dlaczego krew poświęcenia spoczywała na prawym uchu, prawym kciuku i dużym palcu prawej stopy?
• Wj 29:22–28 → 1 Kor 9:13–14; Ga 6:6: W jaki sposób zasada utrzymania sług ołtarza z Wj 29 powraca w nauczaniu Nowego Testamentu?
• Wj 29:31–34 → 1 Kor 10:16–18; Obj 3:20: Jak uczta przymierza w miejscu świętym zapowiada wspólnotę stołu z Chrystusem?
• Wj 29:35–37 → Kpł 8:33–35; Hbr 9:23: Dlaczego obrzęd poświęcenia trwał siedem dni i obejmował także sam ołtarz?
• Wj 29:38–42 → Lb 28:3–8; Hbr 10:11–14: Jaki kontrast zachodzi między codziennym składaniem dwóch baranków a jedną ofiarą Jezusa?
• Wj 29:43–44 → Wj 40:34–35; Hbr 2:11: Co sprawia, że miejsce lub człowiek stają się naprawdę święte przed Bogiem?
• Wj 29:45–46 → J 1:14; 2 Kor 6:16; Obj 21:3: W jaki sposób obietnica „I będę mieszkał pośród nich” prowadzi przez całą Biblię od Wyjścia aż do Apokalipsy?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Nie zaczynam służby od działania, lecz od obmycia i łaski: Najpierw cielec ofiary za grzech, potem baran poświęcenia — nigdy odwrotnie.
• 2. Moje uszy, ręce i stopy należą w całości do Jezusa: Odkupienie obejmuje to, czego słucham, co robię oraz dokąd idę.
• 3. Bóg pragnie mieszkać blisko mnie, a nie pozostawać obcym sędzią: Cały Przybytek i ofiary prowadzą do przywróconej więzi Ojca z dzieckiem.
• 4. Zaczynanie i kończenie dnia w modlitwie jest moim duchowym tamid: Poranek i wieczór pod krzyżem chronią serce przed oziębłością.
• 5. Nie muszę powtarzać zasług, by kupić przebaczenie: Jedna ofiara Chrystusa uczyniła drogę do Ojca nową i żywą na zawsze.
• 6. Świętość jest darem samego Boga, a nie produktem mojej dumy: To PAN mówi: „Poświęcę Aarona i jego synów”.
• 7. Wczorajsza łaska nie zastępuje dzisiejszej wierności: Jak niewolno było zostawiać mięsa ofiary do poranka, tak każdego dnia potrzebuję świeżego chleba Słowa.
• 8. Cierpienie Chrystusa „poza obozem” wzywa mnie do odwagi wyznania: Nie wstydzę się wyjść ze świata ku Jezusowi i nieść Jego imienia.

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy w Twoim życiu duchowym najpierw przyjmujesz przebaczenie z łaski (ofiara za grzech), czy próbujesz od razu „pracować na przyjęcie” przed Bogiem?
2. Czego ostatnio najbardziej słuchają Twoje „uszy” — głosu Słowa Bożego czy lęku, plotek i hałasu tego świata?
3. Czy Twoje „dłonie” (praca, telefon, codzienne decyzje) oraz „stopy” (kierunek dnia) są świadomie oddane Jezusowi?
4. Czy wierzysz naprawdę w obietnicę Wj 29:45, że Bóg chce mieszkać pośród Twojego domu i życia?
5. Jak wygląda Twój codzienny rytm poranka i wieczoru — czy przypomina ustawiczne tamid wdzięczności i modlitwy?
6. Czy korzystasz dziś ze śmiałości przystępu do Ojca przez krew Jezusa (Hbr 10:19), czy nadal stoisz z daleka z powodu dawnej winy?
7. Co oznacza dla Ciebie dziś wyjść z Chrystusem „poza obóz” (Hbr 13:13) — w środowisku pracy, rodziny lub znajomych?
8. Z czym dziś najbardziej potrzebujesz stanąć przed Bogiem, by On sam Cię obmył, namaścił i poświęcił do służby?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 29:1–46)
${quizItems
  .map(
    (item, idx) => `Pytanie ${idx + 1}: ${item.q}
A. ${item.a[0]}
B. ${item.a[1]}
C. ${item.a[2]}
D. ${item.a[3]}
Poprawna odpowiedź: ${['A', 'B', 'C', 'D'][item.c]} — ${item.a[item.c]}.`
  )
  .join('\n\n')}

TWOJA DECYZJA
Dwudziesty dziewiąty rozdział Księgi Wyjścia przypomina nam z niezwykłą mocą, że Bóg nie powołuje ludzi bez przygotowania ani nie zmusza grzesznika, by sam spłacał swój dług. Najpierw daje obmycie wodą, przyobleczenie szatami sprawiedliwości i przebaczenie przez ofiarę za grzech, a następnie namaszcza i napełnia ręce do radosnej służby oraz otwiera dom swojej obecności pośród ludu.
Podejmij dziś świadomą decyzję: przyjmij z wiarą jedyną, doskonałą ofiarę Jezusa Chrystusa, oddaj Mu pod panowanie swoje słuchanie, pracę rąk i ścieżki życia oraz pielęgnuj codzienny poranny i wieczorny czas z Bogiem!

MOJA DECYZJA:
„Panie Jezu Chryste, mój Baranku Ofiarny i Wielki Arcykapłanie! Dziękuję Ci, że wycierpiałeś poza obozem za moje grzechy i jedną ofiarą otworzyłeś mi drogę do Ojca. Oddaję Ci dziś moje prawe ucho, aby słuchało Twojego Słowa, moją prawą dłoń, aby służyła w miłości, i moje stopy, aby kroczyły Twoją ścieżką. Zamieszkaj w moim życiu i bądź moim Bogiem!”

MODLITWA NA 28 LISTOPADA 2026 R.
Wszechmogący Ojcze w niebie! Dziękujemy Ci za dwudziesty dziewiąty rozdział Księgi Wyjścia — za głębokie obrazy obmycia wodą, namaszczenia olejkiem, ofiary poza obozem, krwi na uchu, dłoni i stopie oraz za codzienny rytm porannego i wieczornego całopalenia. Dziękujemy Ci najbardziej za obietnicę: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem”, która stała się ciałem w Twoim Synu Jezusie Chrystusie!
Przepraszamy Cię, Panie, za chwile, w których próbowaliśmy służyć Ci o własnych siłach bez uprzedniego zatrzymania się pod krzyżem, albo pozwalaliśmy, by poranny i wieczorny czas spotkania z Tobą zaginął w pośpiechu. Przepraszamy za wszystko, co w naszym słuchaniu, czynach i krokach nie było oddane Tobie.
Panie Jezu Chryste, Ty jedną ofiarą uczyniłeś doskonałymi na zawsze tych, którzy są uświęceni. Oczyść nasze sumienia, namaść nas swoim Duchem Świętym, napełniaj nasze dłonie pokojem Ewangelii i spraw, aby przez tę sobotę cała nasza codzienność była dla Ciebie miłą wonią wdzięczności. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
[ ] 1. Przeczytaj cały fragment Wj 29:1–46 w przekładzie UBG oraz List do Hebrajczyków 10:10–22 i 13:11–16.
[ ] 2. Zapamiętaj werset Wj 29:45 („I będę mieszkał pośród synów Izraela, i będę ich Bogiem”) i podziękuj Jezusowi za Jego bliskość.
[ ] 3. Zastosuj symbolikę Wj 29:20: oddaj dziś w modlitwie swoje ucho (czego słuchasz), dłoń (co czynisz) i stopę (dokąd idziesz).
[ ] 4. Zachowaj dzisiejsze duchowe „tamid”: znajdź 10 minut rano i 10 minut wieczorem na spokojną modlitwę wdzięczności i lekturę Słowa.
[ ] 5. Wykonaj jeden konkretny dobry uczynek dla domownika lub sąsiada jako „miłą woń” służby (Ef 5:2).
[ ] 6. Rozwiąż wszystkich 20 pytań quizu z Wj 29, aby utrwalić porządek ofiar i obrzęd poświęcenia kapłanów.
[ ] 7. Oznacz Dzień 59 jako ukończony w Akademii i podziel się tą lekcją z kimś, kto potrzebuje dziś pewności Bożej obecności.

JUTRO — 29 LISTOPADA 2026 R.
DZIEŃ 60: ZŁOTY OŁTARZ KADZENIA, OKUP ZA DUSZĘ, MIEDZIANA KADŹ ORAZ ŚWIĘTY OLEJEK NAMASZCZENIA (WJ 30:1–38)
Jutro w 30. rozdziale Księgi Wyjścia staniemy przed złotym ołtarzem wonnego kadzidła tuż przed zasłoną Miejsca Najświętszego, poznamy sprawiedliwy okup pół sykla za duszę (równy dla bogatego i ubogiego), miedzianą kadź do obmywania rąk i stóp oraz wyjątkową recepturę świętego olejku namaszczenia i świętego kadzidła!
`;

console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 59 (12 sekcji)...');

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
                const isTask = /^\[\s*\]/.test(l) || /^\d+\.\s/.test(l) || /^•\s/.test(l);
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

const pakiet5wersji = `# PAKIET 5 WERSJI ROZWAŻAŃ — DZIEŃ ${DAY_NUM} (${DATE_STR})
## ${BOOK} ${READING} — ${TITLE}

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

${v1TtsText}

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / WhatsApp / cclite.pl)
====================================================================

${v2WebText}

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

${v3SmsText}

====================================================================
WERSJA 4: SCENARIUSZ TELEWIZYJNY (Christian Culture TV / CCTV24 — Noemi i Sara)
====================================================================

${v4VideoText}

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY / LEKSYKON BIBLIJNY (CCN NEWS @CCN)
====================================================================

${v5ArticleText}
`;

const gdriveOutputsDir = 'H:/Mój dysk/OA - orkiestracja Agentowa/produkowane przez Agentów';
const desktopDir = 'C:/Users/czark/Desktop';
const docxFilename = `Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuffer = await Packer.toBuffer(doc);
if (fs.existsSync(gdriveOutputsDir)) {
  const gdriveOutPath = path.join(gdriveOutputsDir, docxFilename);
  fs.writeFileSync(gdriveOutPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX na Google Drive: ${gdriveOutPath} (${docxBuffer.length} bajtów)`);
}
if (fs.existsSync(desktopDir)) {
  const desktopOutPath = path.join(desktopDir, docxFilename);
  fs.writeFileSync(desktopOutPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX na Desktop: ${desktopOutPath} (${docxBuffer.length} bajtów)`);
}
if (!fs.existsSync(gdriveOutputsDir) && !fs.existsSync(desktopDir)) {
  const fallbackPath = path.join(REPO, 'scripts/content', docxFilename);
  fs.writeFileSync(fallbackPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX (fallback): ${fallbackPath} (${docxBuffer.length} bajtów)`);
}

// ── 4. ZAPIS PAKIETU 5 WERSJI + SUROWEJ LEKCJI ──
fs.mkdirSync(path.join(REPO, 'scripts/content'), { recursive: true });
fs.writeFileSync(path.join(REPO, `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`), pakiet5wersji, 'utf8');
fs.writeFileSync(path.join(REPO, `scripts/content/kc-day${DAY_NUM}-lesson.txt`), lessonDocxText, 'utf8');
console.log(`✅ Zapisano pakiet-day${DAY_NUM}-5wersji.md i kc-day${DAY_NUM}-lesson.txt`);

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 58 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 59 (4 ścieżki Clean URLs + kolejka)...');
const template58Path = path.join(REPO, 'akademia/kurscodzienny/dzien-58.html');
let html = fs.readFileSync(template58Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 58: [^<]+<\/title>/,
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
  /<meta property="og:title" content="[^"]*"[^>]*>/,
  `<meta property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_58_szaty_arcykaplana_napiersnik\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261128`
);

html = html.replace(/kurscodzienny%2Fdzien-58/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2058[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przypomnieć komuś, że Jezus Chrystus nosi jego imię na swoich ramionach mocy i na swoim sercu przed tronem Ojca\./,
  'Jedno kliknięcie może przypomnieć komuś, że Bóg przez ofiarę Jezusa Chrystusa otworzył żywą drogę pojednania i pragnie zamieszkać pośród swojego ludu.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 58<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav58Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-57"[\s\S]*?<\/a>\s*(?:<a href="\/akademia\/kurscodzienny\/dzien-59"[\s\S]*?<\/a>|<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>\s*<\/span>)/;
const nav59Block = `<a href="/akademia/kurscodzienny/dzien-58" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 58</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 60 (Niedziela) →</span>
        </span>`;
if (!nav58Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 58 w szablonie');
}
html = html.replace(nav58Regex, nav59Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 58 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/27 LISTOPADA 2026 • PIĄTEK/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 58:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 28:1–43/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 29:45 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 29:45 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 28.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 59</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Po ukazaniu sprzętów świątyni i świętych szat kapłańskich (Wj 25–28) Bóg ustanawia siedmiodniowy obrzęd poświęcenia Aarona i jego synów oraz codzienne poranne i wieczorne całopalenie.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie czterdzieści sześć wersetów w przekładzie UBG. Zwróć uwagę na kolejność ofiar (najpierw cielec za grzech spalony poza obozem, potem baran całopalenia i baran poświęcenia), krew na prawym uchu, kciuku i stopie oraz finałową obietnicę zamieszkania Boga pośród swojego ludu.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=29" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(/<!-- SCRIPTURE SECTION[^>]*-->/, `<!-- SCRIPTURE SECTION (${READING}) -->`);
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 28:1–43/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=28/g, `/mojabiblia?book=EXO&chapter=29`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=28/g, `/mojabiblia?book=EXO&amp;chapter=29`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips59 = `<span class="strong-chip"><span class="strong-id">H6942</span> <span class="strong-orig">קָדַשׁ (Kadasz)</span> — poświęcić, uświęcić, oddzielić dla Boga na służbę (Wj 29:1, 44)</span>
          <span class="strong-chip"><span class="strong-id">H4390 / H3027</span> <span class="strong-orig">מִלֵּא יָד (Mille jad)</span> — dosł. „napełnić rękę”: wprowadzenie w urząd kapłański (Wj 29:9, 24, 33)</span>
          <span class="strong-chip"><span class="strong-id">H4888</span> <span class="strong-orig">מִשְׁחָה (Miszcha)</span> — święty olejek namaszczenia wylany na głowę Aarona (Wj 29:7, 21, 29)</span>
          <span class="strong-chip"><span class="strong-id">H2403</span> <span class="strong-orig">חַטָּאת (Chattat)</span> — ofiara za grzech spalona w ogniu poza obozem (Wj 29:14, 36)</span>
          <span class="strong-chip"><span class="strong-id">H5930</span> <span class="strong-orig">עֹלָה (Ola)</span> — całopalenie wznoszące się w całości ku Bogu jako miła woń (Wj 29:18, 25, 42)</span>
          <span class="strong-chip"><span class="strong-id">H8573</span> <span class="strong-orig">תְּנוּפָה (Tenufa)</span> — ofiara kołysania na rękach kapłanów przed PANEM (Wj 29:24, 26–27)</span>
          <span class="strong-chip"><span class="strong-id">H8641</span> <span class="strong-orig">תְּרוּמָה (Teruma)</span> — ofiara wzniesienia jako wieczny dział kapłański (Wj 29:27–28)</span>
          <span class="strong-chip"><span class="strong-id">H8548</span> <span class="strong-orig">תָּמִיד (Tamid)</span> — ustawiczne codzienne całopalenie rano i wieczorem (Wj 29:38, 42)</span>
          <span class="strong-chip"><span class="strong-id">H7931</span> <span class="strong-orig">שָׁכַן (Szachan)</span> — zamieszkać pośród ludu: „będę mieszkał pośród synów Izraela” (Wj 29:45–46)</span>`;

html = html.replace(/Klucze Językowe &amp; Kody Stronga \(Wj 28:1–43\)/g, `Klucze Językowe &amp; Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 28\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 29. rozdziału Księgi Wyjścia (poświęcenie i „napełnienie ręki”, namaszczenie olejkiem, ofiara za grzech poza obozem, całopalenie, ofiary kołysania i wzniesienia, ustawiczne tamid oraz zamieszkanie Boga wśród ludu):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips59}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 28:1–43 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis59 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            PRZYGOTOWANIE DARÓW, OBMYCIE WODĄ, PRZYOBLECZENIE I NAMASZCZENIE (WJ 29:1–9)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Trzy zwierzęta bez skazy (29:1):</strong> Jeden młody cielec i dwa barany bez skazy — Bóg przyjmuje do świętej służby wyłącznie ofiary nieskazitelne (por. 1 P 1:19).</p>
            <p><strong>2. Kosz przaśników z wybornej mąki pszennej (29:2–3):</strong> Przaśne chleby, placki zaprawione oliwą i podpłomyki posmarowane oliwą — brak zakwasu wskazuje na czystość bez zepsucia, a oliwa na Ducha Świętego.</p>
            <p><strong>3. Wezwanie u wejścia do Namiotu Zgromadzenia (29:4):</strong> Poświęcenie odbywa się publicznie u progu świątyni, według Bożego porządku.</p>
            <p><strong>4. Obmycie czystą wodą (29:4):</strong> „Obmyjesz ich wodą” — przed nałożeniem świętych szat potrzebne jest oczyszczenie (zapowiedź obmycia przez Słowo i odrodzenia, J 13:10; Tyt 3:5; Hbr 10:22).</p>
            <p><strong>5. Przyobleczenie Aarona w pełny strój chwały (29:5–6):</strong> Tunika, błękitny ornat, efod, pektorał, pas, mitra i święta korona („Świętość PANU”) — strój dany z łaski od wewnątrz na zewnątrz.</p>
            <p><strong>6. Wylanie olejku namaszczenia na głowę Aarona (29:7):</strong> Obfite namaszczenie bez rozlewu krwi zapowiada namaszczenie Chrystusa Duchem Świętym (Ps 133:2; Łk 4:18; Dz 10:38).</p>
            <p><strong>7. Przyobleczenie synów Aarona (29:8–9):</strong> Szaty, pasy i mitry dla synów podkreślają, że wspólnota sług dzieli tę samą powagę powołania.</p>
            <p><strong>8. „Napełnienie rąk” — poświęcenie do służby (29:9):</strong> Hebrajski zwrot <em>mille jad</em> („napełnić rękę”) oznacza przekazanie pełnomocnictwa i powierzenie służby w dłonie powołanych.</p>
            <p><strong>9. „Kapłaństwo na mocy wiecznej ustawy” (29:9):</strong> Trwałość Bożego ustanowienia wskazuje naprzód na wieczne, nieprzemijające kapłaństwo Chrystusa (Hbr 7:24).</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            OFIARA ZA GRZECH: PRZENIESIENIE WINY I SPALENIE ZA OBOZEM (WJ 29:10–14)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Włożenie rąk na głowę cielca (29:10):</strong> Aaron i jego synowie kładą dłonie na głowę zwierzęcia — jawne wyznanie winy i utożsamienie się z zastępczą ofiarą.</p>
            <p><strong>11. Cielec zabity przed PANEM (29:11):</strong> Zanim kapłan wstawi się za ludem, sam potrzebuje przebłagania za własne grzechy (Hbr 7:27).</p>
            <p><strong>12. Krew na rogach ołtarza i wylana u jego podnóża (29:12):</strong> Rogi oznaczają moc i ratunek, a podstawa — fundament pojednania: „bez przelania krwi nie ma przebaczenia grzechów” (Hbr 9:22).</p>
            <p><strong>13. Tłuszcz, płat wątroby i obie nerki spalone na ołtarzu (29:13):</strong> Najbogatsze części wewnętrzne oddane na ołtarzu Bogu, podczas gdy obciążone winą ciało nie mogło być spożyte.</p>
            <p><strong>14. Mięso, skóra i odchody spalone za obozem (29:14):</strong> „Bo to jest ofiara za grzech” — wprost zapowiedź Jezusa Chrystusa, który wycierpiał poza bramą Jerozolimy, aby uświęcić lud własną krwią (Hbr 13:11–12)!</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            PIERWSZY BARAN: CAŁOPALENIE NA MIŁĄ WOŃ DLA PANA (WJ 29:15–18)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>15. Włożenie rąk na pierwszego barana (29:15):</strong> Po usunięciu grzechu następuje akt całkowitego oddania się Bogu.</p>
            <p><strong>16. Pokropienie krwią wierzchu ołtarza dokoła (29:16):</strong> Krew otacza całe miejsce spotkania z Bogiem jako znak pełnego pojednania.</p>
            <p><strong>17. Porąbanie na części, opłukanie trzewi i nóg (29:17):</strong> Nic nie zostaje ukryte ani pominięte; zarówno wnętrze serca (trzewia), jak i codzienna droga (nogi) muszą zostać obmyte.</p>
            <p><strong>18. Spalenie całego barana na ołtarzu (29:18):</strong> „Całopalenie dla PANA, miła woń” — cały dar wznosi się ku Bogu, zapowiadając doskonałe posłuszeństwo Jezusa aż do śmierci (Ef 5:2).</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            DRUGI BARAN POŚWIĘCENIA: UCHO, DŁOŃ, STOPA, KOŁYSANIE I UCZTA ŚWIĘTA (WJ 29:19–34)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Włożenie rąk na drugiego barana — barana poświęcenia (29:19, 22):</strong> Baran „napełnienia”, wprowadzający obmytych i przebaczonych kapłanów w codzienną posługę.</p>
            <p><strong>20. Krew na końcu prawego ucha (29:20):</strong> Słuch sługi Bożego ma być odkupiony i otwarty wyłącznie na głos Słowa Bożego (por. Iz 50:5).</p>
            <p><strong>21. Krew na wielkim palcu prawej ręki (29:20):</strong> Praca, czyny i każdy wysiłek rąk należą całkowicie do Pana.</p>
            <p><strong>22. Krew na wielkim palcu prawej stopy (29:20):</strong> Kierunek całego życia i każdy krok mają podążać drogą Bożych przykazań.</p>
            <p><strong>23. Pokropienie krwią i olejkiem namaszczenia razem (29:21):</strong> Krew oczyszczenia oraz olejek Ducha Świętego spoczywają wspólnie zarówno na kapłanach, jak i na ich szatach.</p>
            <p><strong>24. Części barana i przaśniki złożone na rękach kapłanów (29:22–24):</strong> Dosłowne „napełnienie rąk” — dłonie sługi Bożego noszą dary pojednania i pokoju.</p>
            <p><strong>25. Ofiara kołysania przed PANEM i spalenie (29:24–25):</strong> Ruch ku ołtarzowi i z powrotem symbolizował oddanie daru Bogu oraz przyjęcie go z Jego ręki.</p>
            <p><strong>26. Pierś kołysania i łopatka wzniesienia jako dział kapłański (29:26–28):</strong> Serce (pierś) i siła (łopatka) z ofiar pojednawczych zapewniają utrzymanie sług ołtarza na mocy wiecznej ustawy.</p>
            <p><strong>27. Dziedziczenie świętych szat przez siedem dni (29:29–30):</strong> Następca Aarona przejmuje te same szaty na siedem dni — ciągłość służby mimo przemijania pokoleń.</p>
            <p><strong>28. Gotowanie i spożycie mięsa i chleba w miejscu świętym (29:31–33):</strong> Wspólny posiłek przymierza — przebłaganie przechodzi w społeczność radości przed Bogiem.</p>
            <p><strong>29. „Obcy zaś nie będzie z tego jadł, bo jest to rzecz święta” (29:33):</strong> Uczta ołtarza wymaga przynależności do przymierza i powołania Bożego.</p>
            <p><strong>30. Spalenie resztek pozostałych do poranka (29:34):</strong> Ochrona daru przed zepsuciem — świętość służby wymaga świeżości każdego dnia.</p>
            <p><strong>31. Kolejność trzech ofiar (29:10–34):</strong> Najpierw ofiara za grzech (przebaczenie), potem całopalenie (oddanie), na końcu baran poświęcenia (służba i wspólnota) — nigdy odwrotnie!</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SIEDEM DNI POŚWIĘCENIA, OFIARA USTAWICZNA I ZAMIESZKANIE BOGA POŚRÓD LUDU (WJ 29:35–46)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>32. Siedem dni pełnego poświęcenia (29:35):</strong> Siedem dni wyraża pełnię przygotowania i oddzielenia do służby Bogu.</p>
            <p><strong>33. Codzienne oczyszczenie i namaszczenie ołtarza przez siedem dni (29:36–37):</strong> Nawet najświętszy ołtarz wymagał przebłagania i poświęcenia przed rozpoczęciem służby ludu.</p>
            <p><strong>34. „Ktokolwiek dotknie się ołtarza, musi być poświęcony” (29:37):</strong> Zbliżanie się do świętości Boga nie znosi lekkomyślności — wymaga czystości i czci.</p>
            <p><strong>35. Ustawiczna ofiara poranna i wieczorna (29:38–39):</strong> Dwa roczne baranki codziennie — jeden rano, drugi wieczorem — otaczały cały dzień Izraela nieprzerwanym świadectwem pojednania.</p>
            <p><strong>36. Mąka z wytłoczoną oliwą i wino na ofiarę z płynów (29:40–41):</strong> Codzienny trud, Duch Święty i radość zbawienia towarzyszące obu barankom jako miła woń.</p>
            <p><strong>37. „Nieustanne całopalenie przez wszystkie pokolenia” (29:42):</strong> Wierność Bożego miłosierdzia trwa nieprzerwanie dzień po dniu.</p>
            <p><strong>38. Spotkanie i rozmowa z Bogiem (29:42–43):</strong> „Gdzie będę się z wami spotykać, aby tam z tobą rozmawiać” — ofiara istnieje po to, by otworzyć żywą więź z Bogiem!</p>
            <p><strong>39. „To miejsce zostanie poświęcone moją chwałą” (29:43):</strong> Przybytek staje się święty nie przez ludzkie złoto, lecz przez obecność chwały PANA (Szekiny).</p>
            <p><strong>40. Bóg sam uświęca (29:44):</strong> „Poświęcę Namiot Zgromadzenia i ołtarz, poświęcę też Aarona i jego synów” — źródłem wszelkiego uświęcenia jest sam PAN!</p>
            <p><strong>41. Największa obietnica rozdziału (29:45):</strong> „I będę mieszkał pośród synów Izraela, i będę ich Bogiem” — przywrócenie bliskości z Bogiem utraconej po upadku w Edenie.</p>
            <p><strong>42. Cel wyjścia z Egiptu (29:46):</strong> Bóg wyzwolił swój lud z niewoli nie dla pustej niezależności, lecz po to, aby zamieszkać w jego środku jako jego Bóg.</p>
            <p><strong>43. <em>Tamid</em> (תָּמִיד) — rytm poranka i wieczoru:</strong> Wskazuje wierzącym potrzebę codziennego rozpoczynania i kończenia dnia pod krzyżem Chrystusa i modlitwą.</p>
            <p><strong>44. <em>Szachan</em> (שָׁכַן) — Bóg „rozbijający namiot” wśród ludzi:</strong> W Ewangelii Jana 1:14 Słowo stało się ciałem i dosłownie „zamieszkało (rozbiło namiot) wśród nas”.</p>
            <p><strong>45. Od Synaju do Nowego Jeruzalem (29:45–46; Obj 21:3):</strong> Obietnica Bożego zamieszkania pośród ludu spina całe Pismo Święte jedną klamrą łaski!</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis59}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Nasz Baranek Ofiarny, Jedyny Uświęciciel i Emmanuel Mieszkający Wśród Nas
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Jezus Chrystus — Ofiara za Grzech Cierpiąca „Poza Obozem” (Wj 29:10–14; Hebrajczyków 13:11–12):</strong> Tak jak cielec ofiary za grzech był spalany poza obozem, tak Jezus, aby uświęcić lud własną krwią, wycierpiał poza bramą Jerozolimy.
          </p>
          <p>
            <strong>2. Jezus Chrystus — Całopalenie Doskonałego Posłuszeństwa i Miłej Woni (Wj 29:15–18; Efezjan 5:2; Hebrajczyków 10:5–10):</strong> Chrystus oddał samego siebie Bogu w całkowitym posłuszeństwie jako ofiara i danina o miłej woni, spełniając wolę Ojca raz na zawsze.
          </p>
          <p>
            <strong>3. Jezus Chrystus — Krew Oczyszczenia i Olejek Namaszczenia dla Wierzących (Wj 29:7, 20–21; Dzieje 10:38; 1 Piotra 2:9):</strong> Przez krew Baranka i namaszczenie Duchem Świętym Kościół staje się „królewskim kapłaństwem”, którego uszy, ręce i stopy są poświęcone PANU.
          </p>
          <p>
            <strong>4. Jezus Chrystus — Jedna Ofiara Doskonała na Zawsze Zastępująca Codzienne Baranki <em>Tamid</em> (Wj 29:38–42; Hebrajczyków 9:12–14; 10:11–14):</strong> Podczas gdy dawni kapłani składali baranki codziennie rano i wieczorem, Jezus jedną ofiarą samego siebie uczynił doskonałymi na zawsze tych, którzy są uświęceni!
          </p>
          <p>
            <strong>5. Jezus Chrystus — Ten, Który Sam Uświęca i Otwiera Nową Drogę przez Zasłonę (Wj 29:44; Hebrajczyków 2:11; 10:19–22):</strong> Mając śmiałość wejść do Miejsca Najświętszego przez krew Jezusa, zbliżamy się z sercami oczyszczonymi i ciałem obmytym czystą wodą.
          </p>
          <p>
            <strong>6. Jezus Chrystus — Emmanuel: Bóg Zamieszkujący Pośród Swego Ludu (Wj 29:45–46; Jana 1:14; Objawienie 21:3):</strong> Obietnica „I będę mieszkał pośród synów Izraela” stała się ciałem w Jezusie z Nazaretu i osiągnie pełnię w Nowym Jeruzalem!
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=29" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus59}\n      $2`
);

// 5.10 Sprawdź w Biblii (12 wersetów porównawczych)
const compare59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:4 → Jana 13:10; Tytusa 3:5; Hebrajczyków 10:22</strong>: Co w Nowym Testamencie oznacza obmycie czystą wodą przed przystąpieniem do służby Bożej?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:7, 21 → Psalm 133:2; Dzieje 10:38; 2 Koryntian 1:21–22</strong>: Jak namaszczenie olejkiem ukazuje posługę Ducha Świętego na Chrystusie i wierzących?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:10–12 → Kapłańska 16:21; Hebrajczyków 9:22</strong>: Co symbolizuje włożenie rąk na głowę ofiary i dlaczego bez przelania krwi nie ma przebaczenia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:14 → Kapłańska 4:11–12; Hebrajczyków 13:11–13</strong>: Dlaczego mięso ofiary za grzech spalano poza obozem i jak łączy się to z Golgotą?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:15–18 → Efezjan 5:2; Rzymian 12:1</strong>: Co oznacza całkowite oddanie ciała i życia jako „miła woń” i „ofiara żywa”?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:20 → Kapłańska 8:23–24; Izajasza 50:5</strong>: Dlaczego krew poświęcenia spoczywała na prawym uchu, prawym kciuku i dużym palcu prawej stopy?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:22–28 → 1 Koryntian 9:13–14; Galacjan 6:6</strong>: W jaki sposób zasada utrzymania sług ołtarza z Wj 29 powraca w nauczaniu Nowego Testamentu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:31–34 → 1 Koryntian 10:16–18; Objawienie 3:20</strong>: Jak uczta przymierza w miejscu świętym zapowiada wspólnotę stołu z Chrystusem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:35–37 → Kapłańska 8:33–35; Hebrajczyków 9:23</strong>: Dlaczego obrzęd poświęcenia trwał siedem dni i obejmował także sam ołtarz?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:38–42 → Liczb 28:3–8; Hebrajczyków 10:11–14</strong>: Jaki kontrast zachodzi między codziennym składaniem dwóch baranków a jedną ofiarą Jezusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:43–44 → Księga Wyjścia 40:34–35; Hebrajczyków 2:11</strong>: Co sprawia, że miejsce lub człowiek stają się naprawdę święte przed Bogiem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 29:45–46 → Jana 1:14; 2 Koryntian 6:16; Objawienie 21:3</strong>: W jaki sposób obietnica „I będę mieszkał pośród nich” prowadzi od Wyjścia do Apokalipsy?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare59}\n      $2`
);

// 5.11 Prawda na dziś
const truth59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Poświęcenia, Codziennego Tamid i Zamieszkania Boga — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Nie zaczynam służby od działania, lecz od obmycia i łaski:</strong> Najpierw cielec ofiary za grzech, potem baran poświęcenia — nigdy odwrotnie.</p>
          <p>• <strong>2. Moje uszy, ręce i stopy należą w całości do Jezusa:</strong> Odkupienie obejmuje to, czego słucham, co robię oraz dokąd idę.</p>
          <p>• <strong>3. Bóg pragnie mieszkać blisko mnie, a nie pozostawać obcym sędzią:</strong> Cały Przybytek i ofiary prowadzą do przywróconej więzi Ojca z dzieckiem.</p>
          <p>• <strong>4. Zaczynanie i kończenie dnia w modlitwie jest moim duchowym tamid:</strong> Poranek i wieczór pod krzyżem chronią serce przed oziębłością.</p>
          <p>• <strong>5. Nie muszę powtarzać zasług, by kupić przebaczenie:</strong> Jedna ofiara Chrystusa uczyniła drogę do Ojca nową i żywą na zawsze.</p>
          <p>• <strong>6. Świętość jest darem samego Boga, a nie produktem mojej dumy:</strong> To PAN mówi: „Poświęcę Aarona i jego synów”.</p>
          <p>• <strong>7. Wczorajsza łaska nie zastępuje dzisiejszej wierności:</strong> Jak nie wolno było zostawiać mięsa ofiary do poranka, tak każdego dnia potrzebuję świeżego chleba Słowa.</p>
          <p>• <strong>8. Cierpienie Chrystusa „poza obozem” wzywa mnie do odwagi wyznania:</strong> Nie wstydzę się wyjść ze świata ku Jezusowi i nieść Jego imienia.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth59}\n      $2`
);

// 5.12 Pomyśl
const questions59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w Twoim życiu duchowym najpierw przyjmujesz przebaczenie z łaski (ofiara za grzech), czy próbujesz od razu „pracować na przyjęcie” przed Bogiem?</p>
          <p>2. Czego ostatnio najbardziej słuchają Twoje „uszy” — głosu Słowa Bożego czy lęku, plotek i hałasu tego świata?</p>
          <p>3. Czy Twoje „dłonie” (praca, telefon, codzienne decyzje) oraz „stopy” (kierunek dnia) są świadomie oddane Jezusowi?</p>
          <p>4. Czy wierzysz naprawdę w obietnicę Wj 29:45, że Bóg chce mieszkać pośród Twojego domu i życia?</p>
          <p>5. Jak wygląda Twój codzienny rytm poranka i wieczoru — czy przypomina ustawiczne tamid wdzięczności i modlitwy?</p>
          <p>6. Czy korzystasz dziś ze śmiałości przystępu do Ojca przez krew Jezusa (Hbr 10:19), czy nadal stoisz z daleka z powodu dawnej winy?</p>
          <p>7. Co oznacza dla Ciebie dziś wyjść z Chrystusem „poza obóz” (Hbr 13:13) — w środowisku pracy, rodziny lub znajomych?</p>
          <p>8. Z czym dziś najbardziej potrzebujesz stanąć przed Bogiem, by On sam Cię obmył, namaścił i poświęcił do służby?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions59}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 28 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 29 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 28/g, `Po przeczytaniu Wj 29`);

// 5.14 Twoja decyzja
const decision59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Przyjmij Jedyną Ofiarę Chrystusa, Oddaj Ucho, Dłoń i Stopę i Otwórz Dom na Obecność Boga!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty dziewiąty rozdział Księgi Wyjścia przypomina nam z niezwykłą mocą, że Bóg nie powołuje ludzi bez przygotowania ani nie zmusza grzesznika, by sam spłacał swój dług. Najpierw daje obmycie wodą, przyobleczenie szatami sprawiedliwości i przebaczenie przez ofiarę za grzech, a następnie namaszcza i napełnia ręce do radosnej służby oraz otwiera dom swojej obecności pośród ludu.
          </p>
          <p>
            Podejmij dziś świadomą decyzję: przyjmij z wiarą jedyną, doskonałą ofiarę Jezusa Chrystusa, oddaj Mu pod panowanie swoje słuchanie, pracę rąk i ścieżki życia oraz pielęgnuj codzienny poranny i wieczorny czas z Bogiem!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, mój Baranku Ofiarny i Wielki Arcykapłanie! Dziękuję Ci, że wycierpiałeś poza obozem za moje grzechy i jedną ofiarą otworzyłeś mi drogę do Ojca. Oddaję Ci dziś moje prawe ucho, aby słuchało Twojego Słowa, moją prawą dłoń, aby służyła w miłości, i moje stopy, aby kroczyły Twoją ścieżką. Zamieszkaj w moim życiu i bądź moim Bogiem!”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision59}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 27 listopada<\/span>/g, `<span>Modlitwa na 28 listopada</span>`);
const prayer59 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Oczyszczenie Serca, Poświęcenie Słuchu, Rąk i Kroków oraz Boże Zamieszkanie
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący Ojcze w niebie! Dziękujemy Ci za dwudziesty dziewiąty rozdział Księgi Wyjścia — za głębokie obrazy obmycia wodą, namaszczenia olejkiem, ofiary poza obozem, krwi na uchu, dłoni i stopie oraz za codzienny rytm porannego i wieczornego całopalenia. Dziękujemy Ci najbardziej za obietnicę: „I będę mieszkał pośród synów Izraela, i będę ich Bogiem”, która stała się ciałem w Twoim Synu Jezusie Chrystusie!
          </p>
          <p>
            Przepraszamy Cię, Panie, za chwile, w których próbowaliśmy służyć Ci o własnych siłach bez uprzedniego zatrzymania się pod krzyżem, albo pozwalaliśmy, by poranny i wieczorny czas spotkania z Tobą zaginął w pośpiechu. Przepraszamy za wszystko, co w naszym słuchaniu, czynach i krokach nie było oddane Tobie.
          </p>
          <p>
            Panie Jezu Chryste, Ty jedną ofiarą uczyniłeś doskonałymi na zawsze tych, którzy są uświęceni. Oczyść nasze sumienia, namaść nas swoim Duchem Świętym, napełniaj nasze dłonie pokojem Ewangelii i spraw, aby przez tę sobotę cała nasza codzienność była dla Ciebie miłą wonią wdzięczności. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer59}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks59 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=29" class="text-amber-300 underline font-semibold">Wj 29:1–46</a> w przekładzie UBG oraz List do Hebrajczyków 10:10–22 i 13:11–16.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 29:45 („I będę mieszkał pośród synów Izraela, i będę ich Bogiem”) i podziękuj Jezusowi za Jego bliskość.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zastosuj symbolikę Wj 29:20: oddaj dziś w modlitwie swoje ucho (czego słuchasz), dłoń (co czynisz) i stopę (dokąd idziesz).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Zachowaj dzisiejsze duchowe „tamid”: znajdź 10 minut rano i 10 minut wieczorem na spokojną modlitwę wdzięczności i lekturę Słowa.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Wykonaj jeden konkretny dobry uczynek dla domownika lub sąsiada jako „miłą woń” służby (Ef 5:2).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Rozwiąż wszystkich 20 pytań quizu z Wj 29, aby utrwalić porządek ofiar i obrzęd poświęcenia kapłanów.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 59 jako ukończony i podziel się tą lekcją z kimś, kto potrzebuje dziś pewności Bożej obecności.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks59}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 60)
const tomorrow59 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 29 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 60 — ZŁOTY OŁTARZ KADZENIA, OKUP ZA DUSZĘ, MIEDZIANA KADŹ ORAZ ŚWIĘTY OLEJEK NAMASZCZENIA (Wj 30:1–38)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 60: W trzydziestym rozdziale Księgi Wyjścia staniemy przed złotym ołtarzem wonnego kadzidła tuż przed zasłoną Miejsca Najświętszego, poznamy sprawiedliwy okup pół sykla za duszę (równy dla bogatego i ubogiego), miedzianą kadź do obmywania rąk i stóp oraz wyjątkową recepturę świętego olejku namaszczenia i świętego kadzidła!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (29 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
          <a href="/wspieramto" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF8C33] active:bg-[#E66A00] text-white text-xs font-extrabold uppercase tracking-wider transition min-h-[44px]">
            <i class="fa-solid fa-heart"></i>
            <span>WspieramTO — Budujemy Dom + Studio CC →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow59}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay59, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData59 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 29:1–46) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData59);
html = html.replace(
  /Doskonale! Znasz na wskroś 28\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 29. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day58_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day58'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay58/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 58 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 58 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 29:45.")`
);

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 59
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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 59.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-28/
fs.mkdirSync(path.join(QUEUE_DIR, 'obrazy'), { recursive: true });
fs.copyFileSync(imgFullPath, path.join(QUEUE_DIR, 'obrazy', IMG_FILENAME));
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
          'Obmycie wodą, namaszczenie olejkiem, ofiara za grzech poza obozem, baran poświęcenia (ucho, dłoń, stopa), ustawiczne całopalenie oraz obietnica Boga: „I będę mieszkał pośród synów Izraela”.',
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
