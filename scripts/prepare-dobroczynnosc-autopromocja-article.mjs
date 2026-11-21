import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'em',
  type: 'MOTYWACJA eM',
  title: 'Kiedy dobroczynność staje się autopromocją?',
  slug: 'kiedy-dobroczynnosc-staje-sie-autopromocja',
  author: 'Cezary Rogowski',
  date: '2026-11-22',
  lead: 'W epoce mediów społecznościowych pomoc drugiemu człowiekowi coraz częściej odbywa się w blasku telefonu: od sfilmowanych paczek przekazywanych potrzebującym po symboliczne nakładki na zdjęcia profilowe. Z jednej strony jawność zbiórek i relacje terenowe potrafią budować zaufanie oraz mobilizować darczyńców, z drugiej jednak łatwo zamieniają ludzką biedę w tło do budowania własnego wizerunku. Badania z ekonomii behawioralnej i psychologii społecznej oraz nauczanie Jezusa z Kazania na Górze (Mt 6:1–4 UBG) wyznaczają w tej sprawie niezwykle czytelne kryterium: granicę między służbą a autopromocją wyznacza to, czyjej chwały i nagrody naprawdę szukamy.',
  sections: [
    {
      heading: '1. POMOC W ŚWIETLE KAMERY: NAPIĘCIE MIĘDZY PRZEJRZYSTOŚCIĄ A SPEKTAKLEM',
      paragraphs: [
        'Współczesna kultura cyfrowa przyzwyczaiła nas do zasady, że wydarzenie, którego nie widać w sieci, rzekomo w ogóle się nie wydarzyło. Ten sam mechanizm wkradł się w obszar pomagania, tworząc bolesny dylemat dla darczyńców, wolontariuszy i ludzi wiary. Na ekranach smartfonów codziennie pojawiają się materiały wideo dokumentujące przekazywanie posiłków, pieniędzy lub prezentów osobom w kryzysie, często opatrzone dynamicznym montażem i osobistym komentarzem nagrywającego.',
        'Uczciwość redakcyjna nakazuje jednak od razu uniknąć taniego cynizmu i nie wrzucać każdego publicznego działania do jednego worka. Organizacje charytatywne oraz inicjatywy misyjne potrzebują rzetelnej sprawozdawczości, aby pokazać darczyńcom, że powierzone środki rzeczywiście dotarły do potrzebujących, a nagłośnienie sprawdzonej zbiórki często ratuje komuś zdrowie lub dach nad głową. Problem nie polega zatem na samym istnieniu komunikacji, lecz na momencie, w którym potrzebujący człowiek przestaje być celem troski, a staje się rekwizytem w kampanii wizerunkowej darczyńcy.',
        'Gdy dobroczynność zostaje podporządkowana algorytmom zasięgu, uwaga odbiorcy przesuwa się z cierpienia bliźniego na szlachetność bohatera nagrania. Wówczas zamiast cichej solidarności pojawia się rywalizacja o moralny prestiż, a godność osoby przyjmującej wsparcie zostaje wystawiona na widok publiczny bez jej pełnej swobody. Aby odpowiedzieć na pytanie z tytułu bez ogólników, oddzielmy najpierw ustalenia naukowe o ludzkich motywacjach od komentarza teologicznego opartego na Piśmie Świętym.'
      ]
    },
    {
      heading: '2. FAKTY EMPIRYCZNE: CO BADANIA MÓWIĄ O MOTYWACJI WIZERUNKOWEJ I „AKTYWIZMIE NA POKAZ”',
      paragraphs: [
        'Zjawisko pomagania podyktowanego troską o własny obraz zostało dokładnie przebadane przez ekonomistów i psychologów na długo przed rozkwitem krótkich form wideo. W przełomowym artykule „Incentives and Prosocial Behavior” opublikowanym w „American Economic Review” (2006, t. 96, nr 5, s. 1652–1678; DOI: 10.1257/aer.96.5.1652) Roland Bénabou i Jean Tirole wykazali, że zachowania prospołeczne napędzają trzy powiązane siły: wewnętrzny altruizm, bodźce materialne oraz troska o wizerunek (zarówno reputację społeczną w oczach innych, jak i samoocenę). Gdy czyn jest widoczny dla otoczenia, pełni funkcję sygnału moralnego, który ma przekonać obserwatorów o szlachetności działającego.',
        'Ten wizerunkowy mechanizm przetestowali eksperymentalnie Dan Ariely, Anat Bracha i Stephan Meier w badaniu „Doing Good or Doing Well? Image Motivation and Monetary Incentives in Behaving Prosocially” („American Economic Review”, 2009, t. 99, nr 1, s. 544–555; DOI: 10.1257/aer.99.1.544). W seriach zadań laboratoryjnych i terenowych na rzecz organizacji charytatywnych (takich jak Amerykański Czerwony Krzyż) manipulowano dwoma czynnikami: jawnością (czy wysiłek był widoczny dla innych, czy anonimowy) oraz obecnością prywatnej nagrody pieniężnej. Bez zachęt finansowych uczestnicy wkładali wyraźnie większy wysiłek wtedy, gdy ich wkład był publiczny niż wtedy, gdy pozostawał prywatny — co potwierdziło realną siłę motywacji wizerunkowej. Co więcej, dodanie zapłaty w sytuacji publicznej potrafiło tę motywację wypierać, ponieważ psuło czysty sygnał bezinteresowności.',
        'Jeszcze bliżej współczesnych mediów społecznościowych podeszli Kirk Kristofferson, Katherine White i John Peloza w pracy „The Nature of Slacktivism: How the Social Observability of an Initial Act of Token Support Affects Subsequent Prosocial Action” („Journal of Consumer Research”, 2014, t. 40, nr 6, s. 1149–1166; DOI: 10.1086/674137). Badacze rozstrzygnęli spór o tzw. slacktivism, sprawdzając, jak symboliczne wsparcie (na przykład dołączenie do grupy w sieci lub przypięcie wstążki) wpływa na późniejszą, kosztowną pomoc, taką jak wolontariat czy realna darowizna. Okazało się, że publiczny gest symboliczny zaspokaja potrzebę zarządzania wrażeniem (impression management) i zmniejsza skłonność do dalszego, trudniejszego zaangażowania, podczas gdy identyczny gest wykonany prywatnie pobudza wewnętrzną spójność z własnymi wartościami i zwiększa późniejszą gotowość do realnej pomocy.'
      ]
    },
    {
      heading: '3. KOMENTARZ TEOLOGICZNY I EGZEGEZA: „NIE TRĄB PRZED SOBĄ” W KAZANIU NA GÓRZE (MT 6:1–4 UBG)',
      paragraphs: [
        'Przechodząc od danych empirycznych do wyraźnie wyodrębnionej refleksji biblijnej, zauważamy, że Chrystus zdiagnozował pułapkę motywacji wizerunkowej dwa tysiące lat przed pojawieniem się kamer i internetu. W 6. rozdziale Ewangelii według św. Mateusza — w samym sercu Kazania na Górze, w którym Jezus opisuje etykę królestwa niebieskiego w zestawieniu z zewnętrzną pobożnością religijnych elit — jałmużna otwiera trzyczęściowy wykład o miłosierdziu, modlitwie i poście (Mt 6:1–18 UBG). Słowa Zbawiciela brzmią bezkompromisowo: „Pilnujcie się, abyście waszej jałmużny nie dawali przed ludźmi po to, aby was widzieli, inaczej nie będziecie mieli nagrody u waszego Ojca, który jest w niebie. Dlatego, gdy dajesz jałmużnę, nie trąb przed sobą, jak to robią obłudnicy w synagogach i na ulicach, aby ich ludzie chwalili. Zaprawdę powiadam wam: Odbierają swoją nagrodę” (Mt 6:1–2 UBG).',
        'Greckie słownictwo tego fragmentu odsłania niezwykle ostrą precyzję diagnozy Jezusa. Słowo przetłumaczone jako „jałmużna” to ἐλεημοσύνη (eleēmosynē, Strong G1654 — miłosierdzie, litość okazywana czynem), natomiast „obłudnicy” to ὑποκριταί (hypokritai, od hypokritēs, Strong G5273), czyli w świecie grecko-rzymskim aktorzy teatralni występujący w masce przed widownią. Czasownik σαλπίζω (salpizō, Strong G4537 — „trąbić”) tworzy wyrazistą metaforę autopromocji: robienia wokół własnego daru hałasu, który ma przyciągnąć spojrzenia przechodniów. Najbardziej wymowny jest jednak czasownik ἀπέχω (apechō, Strong G0568 — „odbierają”): w starożytnych papirusach gospodarczych termin ten był urzędowym pokwitowaniem odbioru całej należności („zapłacono w całości”). Jeśli darczyńca szukał ludzkiego uznania, to w chwili aplauzu otrzymał pełny rachunek — w niebie nie czeka już żadna dopłata.',
        'W odpowiedzi na ten spektakl Jezus wskazuje drogę wolności wewnętrznej: „Ale ty, gdy dajesz jałmużnę, niech nie wie twoja lewa ręka, co czyni prawa; Aby twoja jałmużna pozostała w ukryciu, a twój Ojciec, który widzi w ukryciu, odda ci jawnie” (Mt 6:3–4 UBG). Greckie wyrażenie ἐν τῷ κρυπτῷ (en tō kryptō, Strong G2927 — w skrytości, w tym, co zakryte przed tłumem) nie oznacza wstydu przed samym dobrem, lecz świadomą rezygnację z widowni, a wręcz z własnego samouwielbienia („niech nie wie lewa ręka”). W szerszym kontekście rozdziału dokładnie ten sam wzorzec powtarza się przy modlitwie w zamkniętym pokoju (Mt 6:5–6 UBG) oraz przy poście (Mt 6:16–18 UBG): prawdziwa pobożność nie potrzebuje sceny, bo jej jedynym istotnym Świadkiem jest Ojciec w niebie.'
      ]
    },
    {
      heading: '4. UKRYCIE (MT 6:4) A ŚWIATŁO PRZED LUDŹMI (MT 5:16): ROZWIĄZANIE POZORNEGO NAPIĘCIA I NAUKA O ŁASCE',
      paragraphs: [
        'Czytając Ewangelię Mateusza w kontekście całego kanonu, czytelnik słusznie może zapytać: jak pogodzić nakaz dawania jałmużny „w ukryciu” (Mt 6:4 UBG) z wcześniejszym wezwaniem z tego samego Kazania na Górze: „Tak niech wasza światłość świeci przed ludźmi, aby widzieli wasze dobre uczynki i chwalili waszego Ojca, który jest w niebie” (Mt 5:16 UBG)? Klucz leży w greckim czasowniku δοξάζω (doxazō, Strong G1392 — chwalić, wywyższać) oraz w kierunku, w jakim płynie uznanie. W Mt 6:2 aktorzy czynią dobro po to, „aby ich ludzie chwalili” — reflektory skierowane są na darczyńcę. W Mt 5:16 światło dobra wskazuje poza człowieka, „aby chwalili waszego Ojca” — widzowie nie podziwiają marki ofiarodawcy, lecz poznają miłość Boga.',
        'Zestawienie dwóch innych historii biblijnych pokazuje, jak poważnie Bóg traktuje intencję daru. W świątyni jerozolimskiej Jezus dostrzegł ubogą wdowę wrzucającą dwie drobne monety: „Oni wszyscy bowiem wrzucili do darów Bożych z tego, co im zbywało, ale ona ze swego niedostatku wrzuciła wszystko, co miała na utrzymanie” (Łk 21:4 UBG). Z kolei w Księdze Dziejów Apostolskich Ananiasz i Safira sprzedali ziemię, zatrzymali część ceny i złożyli resztę u stóp apostołów, udając całkowitą ofiarność, by zdobyć opinię duchowych bohaterów zboru — na co Piotr odpowiedział: „Nie okłamałeś ludzi, lecz Boga” (Dz 5:4 UBG). Grzech małżeństwa z Jerozolimy nie polegał na zatrzymaniu części majątku, który pozostawał ich własnością, lecz na kupowaniu fałszywego podziwu wspólnoty.',
        'W świetle 28 Zasad Wiary Kościoła Bożego (szczególnie Zasady 10 o zbawieniu z łaski i Zasady 21 o szafarstwie) trzeba przy tym stanowczo odrzucić błąd myślenia, jakoby cicha dobroczynność była walutą kupującą zbawienie. Pismo Święte uczy jednoznacznie: „Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił” (Ef 2:8–9 UBG). Dobre uczynki są owocem nowego życia w Chrystusie, a nie jego ceną (Ef 2:10 UBG). Człowiek, który naprawdę przyjął darmową łaskę krzyża, nie musi już budować sobie pomnika z własnej szczodrości ani zarabiać na boską lub ludzką akceptację.'
      ]
    },
    {
      heading: '5. JAK ODRÓŻNIĆ AUTOPROMOCJĘ OD SŁUŻBY? CZTERY PYTANIA KONTROLNE I KRYTERIUM SERCA',
      paragraphs: [
        'Skoro granica między dobrym świadectwem a autopromocją przebiega w ludzkim sercu, warto posługiwać się trzeźwymi kryteriami zamiast pochopnego oceniania innych albo samozadowolenia. Dobroczynność staje się autopromocją dokładnie wtedy, gdy spełniony zostaje jeden z czterech sygnałów ostrzegawczych, które każdy z nas może sprawdzić wyłącznie we własnym sumieniu:',
        'Po pierwsze, zadaj sobie pytanie z testu anonimowości: czy podjąłbym dokładnie ten sam wysiłek i poniósł ten sam koszt, gdyby nikt — nawet rodzina, obserwujący w internecie czy współpracownicy — nigdy nie miał się o nim dowiedzieć? Jeśli bez publikacji zapał nagle stygnie, motywacja wizerunkowa zaczyna zastępować miłość. Po drugie, sprawdź, kto jest w centrum kadru lub opowieści: czy komunikat chroni godność i prywatność człowieka w potrzebie, czy raczej wystawia jego słabość na widok publiczny, by podnieść reputację pomagającego?',
        'Po trzecie, zwróć uwagę na efekt opisany w badaniach nad aktywizmem symbolicznym: czy publiczne udostępnienie apelu albo drobnego gestu uspokaja moje sumienie i zamyka temat, czy prowadzi do cichej, konkretnej odpowiedzialności? Apostoł Jan przypomina: „Moje dzieci, nie miłujmy słowem ani językiem, ale uczynkiem i prawdą” (1 J 3:18 UBG). Po czwarte, sprawdź stan własnego serca według 2 Listu do Koryntian: „Każdy jak postanowił w swym sercu, tak niech zrobi, nie z żalem ani z przymusu, gdyż radosnego dawcę Bóg miłuje” (2 Kor 9:7 UBG). Greckie słowo ἱλαρός (hilaros, Strong G2431 — radosny, ochoczy, wolny od ciężaru) opisuje dawcę, który nie daje pod presją wizerunku ani dla pochwały, lecz z wewnętrznej radości z Bożej łaski.'
      ]
    },
    {
      heading: '6. PIĘĆ KROKÓW DO CICHEJ HOJNOŚCI NA CO DZIEŃ: PRZEWODNIK eM',
      paragraphs: [
        'Przemiana nawyku z „pokazać światu” na „usłużyć bliźniemu” nie wymaga rewolucji życiowej, lecz kilku świadomych, powtarzalnych decyzji podejmowanych z dala od kamer. Redakcja eM Christian Culture proponuje pięć prostych kroków, które można wdrożyć jeszcze w ten weekend:',
        '1. Praktykuj zasadę jednego ukrytego dobra w tygodniu (Mt 6:3–4 UBG). Wybierz jedną konkretną pomoc — anonimowy przelew na zweryfikowaną zbiórkę, zakupy zostawione pod drzwiami starszego sąsiada, opłacenie obiadu albo cichą przysługę w pracy — i z góry postanów, że nie wspomnisz o tym w żadnym poście ani towarzyskiej rozmowie.',
        '2. Gdy wspierasz akcję publicznie dla dobra zbiórki, usuń z przekazu siebie (Mt 5:16 UBG; Ariely i in., 2009). Jeśli chcesz zachęcić znajomych do wsparcia potrzebującej rodziny lub dzieła misyjnego, udostępnij sprawdzony link i opis potrzeby bez dopisywania, ile sam wpłaciłeś i jak szlachetnie się przy tym czujesz.',
        '3. Połącz każdy internetowy gest z cichym, realnym czynem (Kristofferson i in., 2014; 1 J 3:17–18 UBG). Zanim udostępnisz wzruszający apel w mediach społecznościowych, przeznacz choćby drobną, realną kwotę ze swojego budżetu albo kilkanaście minut praktycznego wsparcia dla konkretnej osoby w swoim otoczeniu.',
        '4. Chroń godność i wizerunek obdarowanych, szczególnie dzieci i osób w kryzysie. Nigdy nie publikuj bez wyraźnej, świadomej zgody zdjęć ani nagrań przedstawiających bezradność, łzy lub warunki mieszkaniowe osób, którym pomagasz — prawdziwa miłość zasłania wstyd bliźniego, a nie monetyzuje go zasięgami.',
        '5. Zasilaj serce Ewangelią łaski, aby nie głodować za ludzkim poklaskiem (Ef 2:8–9; 2 Kor 9:8 UBG). Gdy wiesz, że w Chrystusie zostałeś już bezwarunkowo przyjęty przez Ojca, nie musisz nikomu udowadniać swojej wartości głośną dobroczynnością. Z tej wolności rodzi się cicha, trwała hojność, której nie trzeba nagrywać.'
      ]
    }
  ],
  conclusion: 'Kiedy dobroczynność staje się autopromocją? Wtedy, gdy potrzebujący człowiek zamienia się w scenografię, a głównym celem gestu przestaje być ulga bliźniego i chwała Boga, stając się nią budowanie własnego wizerunku oraz zbieranie ludzkiego poklasku. Zarówno badania ekonomii behawioralnej i psychologii (Bénabou i Tirole, 2006; Ariely, Bracha i Meier, 2009; Kristofferson, White i Peloza, 2014), jak i słowa Jezusa Chrystusa (Mt 6:1–4 UBG) przestrzegają przed tą samą pułapką: kto kupuje dobrem aplauz widowni, odbiera już swoją pełną zapłatę i ubożeje w wewnętrznej motywacji. Dopiero zakorzenienie w Bożej łasce (Ef 2:8–10 UBG) uwalnia serce od potrzeby trąbienia przed sobą i pozwala kochać czynem, prawdą i cichą obecnością.',
  cta: 'Zanim minie ten tydzień, wykonaj jeden cichy gest życzliwości, o którym będzie wiedział wyłącznie Bóg i osoba obdarowana — bez zdjęcia, relacji i wzmianki w rozmowie. Jeśli zaś chcesz wesprzeć zweryfikowane dzieło ewangelizacyjne lub pomocowe, zrób to po cichu i z radością serca (2 Kor 9:7 UBG). Możesz też stanąć przed Bogiem w krótkiej, szczerej modlitwie:\n\n„Panie Boże, Ojciec pełen miłosierdzia, dziękujemy Ci za dar zbawienia z łaski w Jezusie Chrystusie, na który nie musimy sobie zasłużyć ani przed Tobą, ani przed ludźmi. Oczyść nasze serca z próżności, potrzeby poklasku i pokusy wykorzystywania dobra do budowania własnego wizerunku. Naucz nas wrażliwości, która widzi prawdziwą potrzebę drugiego człowieka, szanuje jego godność i potrafi dawać w ukryciu z radością, aby cała chwała należała wyłącznie do Ciebie. Amen.”\n\n[Status redakcyjny: Do autoryzacji autora i akceptacji wydawcy — Bramka bezpieczeństwa T4 (L0). Slot kalendarza 365 EkoCC: lp. 19 (2026-11-22, Dział eM, Priorytet B). Proponowany URL publikacji po zatwierdzeniu L0: https://polskieradio.cc/news/kiedy-dobroczynnosc-staje-sie-autopromocja]',
  sources: [
    {
      name: 'Bénabou R., Tirole J. — „Incentives and Prosocial Behavior”, American Economic Review, 2006, Vol. 96, No. 5, s. 1652–1678',
      url: 'https://doi.org/10.1257/aer.96.5.1652'
    },
    {
      name: 'Ariely D., Bracha A., Meier S. — „Doing Good or Doing Well? Image Motivation and Monetary Incentives in Behaving Prosocially”, American Economic Review, 2009, Vol. 99, No. 1, s. 544–555',
      url: 'https://doi.org/10.1257/aer.99.1.544'
    },
    {
      name: 'Kristofferson K., White K., Peloza J. — „The Nature of Slacktivism: How the Social Observability of an Initial Act of Token Support Affects Subsequent Prosocial Action”, Journal of Consumer Research, 2014, Vol. 40, No. 6, s. 1149–1166',
      url: 'https://doi.org/10.1086/674137'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Ewangelia według św. Mateusza 5:16; 6:1–6, 16–18; Ewangelia według św. Łukasza 21:1–4; Dzieje Apostolskie 5:1–4; 2 List do Koryntian 9:6–8; List do Efezjan 2:8–10; 1 List Jana 3:17–18',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong’s Greek Concordance (słownik interlinearny MojaBiblia CC) — Hasła: G1654 (eleēmosynē — jałmużna, miłosierdzie), G5273 (hypokritēs — aktor, obłudnik), G4537 (salpizō — trąbić), G0568 (apechō — odebrać w pełni), G2927 (kryptos — ukrycie), G1392 (doxazō — chwalić), G2431 (hilaros — radosny, ochoczy)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady 10 (Zbawienie z łaski przez wiarę) oraz 21 (Szafarstwo)',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Ewangelia według św. Mateusza 6:1–4 („Pilnujcie się, abyście waszej jałmużny nie dawali przed ludźmi po to, aby was widzieli... Ale ty, gdy dajesz jałmużnę, niech nie wie twoja lewa ręka, co czyni prawa”); Ewangelia według św. Mateusza 5:16; Ewangelia według św. Łukasza 21:1–4; Dzieje Apostolskie 5:1–4; 2 List do Koryntian 9:6–8 („radosnego dawcę Bóg miłuje”); List do Efezjan 2:8–10; 1 List Jana 3:17–18 (UBG)',
  imagePath: path.join(ROOT, 'images/em/art-kiedy-dobroczynnosc-staje-sie-autopromocja.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Osoba w skromnym płaszczu dyskretnie stawiająca na wycieraczce przed drewnianymi drzwiami mieszkania starszej sąsiadki prostą papierową torbę ze świeżym pieczywem i jabłkami w porannym świetle korytarza, bez kamer i smartfonów — symbol cichej dobroczynności bez autopromocji.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '@eM',
    '@MojaBiblia',
    '#Dobroczynnosc',
    '#HojnoscWUkryciu',
    '#Autentycznosc',
    '#MotywacjaeM',
    '#EkoCC',
    '#EkoCC365',
    '#BibliaUBG'
  ],
  seo: {
    title: 'Kiedy dobroczynność staje się autopromocją? Analiza i Biblia',
    description: 'Badania (Bénabou i Tirole, Ariely, Kristofferson) oraz egzegeza UBG (Mt 6:1-4, Mt 5:16): kiedy pomoc staje się autopromocją i jak dawać w skrytości.',
    keywords: [
      'kiedy dobroczynnosc staje sie autopromocja',
      'pomaganie na pokaz badania',
      'slacktivism Kristofferson White Peloza',
      'motywacja wizerunkowa Ariely Bracha Meier',
      'Benabou Tirole prosocial behavior',
      'Mateusza 6:1-4 jalmuzna w ukryciu',
      'niech nie wie lewa reka co czyni prawa',
      '2 Koryntian 9:7 radosny dawca',
      'Cezary Rogowski eM Christian Culture',
      'EkoCC Motywacja'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 19: 2026-11-22 — eM)...');
  console.log('Tytuł:', articleData.title);
  console.log('Meta title length:', articleData.seo.title.length, '| Meta description length:', articleData.seo.description.length);
  console.log('Dział kalendarza: eM | Priorytet: B | Portal pakietu:', articleData.portal);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  const jsonPath = path.join(ROOT, 'scripts/article-lp19-em-2026-11-22.json');
  fs.writeFileSync(jsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${jsonPath}`);

  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: Do autoryzacji autora i akceptacji wydawcy (Bramka T4 / L0)');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
