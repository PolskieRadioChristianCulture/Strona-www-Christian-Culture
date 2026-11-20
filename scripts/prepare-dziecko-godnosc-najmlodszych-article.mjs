import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'ANALIZA RODZINNO-BIBLIJNA',
  title: 'Dziecko nie jest własnością rodzica. Co Biblia mówi o godności najmłodszych?',
  slug: 'dziecko-nie-jest-wlasnoscia-rodzica-co-biblia-mowi-o-godnosci-najmlodszych',
  author: 'Cezary Rogowski',
  date: '2026-11-20',
  lead: 'Międzynarodowy Dzień Praw Dziecka, obchodzony 20 listopada w rocznicę uchwalenia Konwencji o prawach dziecka przez Zgromadzenie Ogólne ONZ, przypomina o prawdzie głębszej niż przepisy i deklaracje: najmłodsi są pełnoprawnymi ludźmi powierzonymi naszej trosce, a nie prywatnym projektem ani własnością dorosłych. W codziennym zmęczeniu łatwo pomylić rodzicielską odpowiedzialność z prawem do nieograniczonej kontroli albo przeciwnie — ze strachem przed stawianiem jakichkolwiek granic. Zarówno rzetelne badania nad rozwojem człowieka, jak i Pismo Święte pokazują spójną drogę: szacunek dla godności dziecka nie osłabia autorytetu rodzica, lecz oczyszcza go w świetle Bożej łaski.',
  sections: [
    {
      heading: '1. SKĄD WZIĄŁ SIĘ 20 LISTOPADA? OD POLSKIEJ INICJATYWY W ONZ DO KONSTYTUCYJNEJ OCHRONY DZIECKA',
      paragraphs: [
        'Zanim przyjrzymy się biblijnej teologii dzieciństwa, warto oddzielić fakty historyczne i prawne od internetowych haseł. Data 20 listopada nie jest przypadkową akcją w kalendarzu mediów społecznościowych. Najpierw, 14 grudnia 1954 roku, Zgromadzenie Ogólne Organizacji Narodów Zjednoczonych przyjęło rezolucję 836(IX), zalecającą państwom ustanowienie Powszechnego Dnia Dziecka (Universal Children’s Day) w trosce o dobro i wzajemne zrozumienie najmłodszych na świecie. Pięć lat później, 20 listopada 1959 roku, Zgromadzenie Ogólne ONZ uchwaliło Deklarację Praw Dziecka — ważny dokument moralny, który jednak nie miał jeszcze mocy wiążącego traktatu międzynarodowego.',
        'Przełom dokonał się dokładnie trzydzieści lat później, 20 listopada 1989 roku, gdy Zgromadzenie Ogólne ONZ przyjęło rezolucją A/RES/44/25 wiążącą Konwencję o prawach dziecka (CRC), która stała się najszerzej ratyfikowanym traktatem praw człowieka w historii. Co szczególnie warte przypomnienia w Polsce, głównym inicjatorem przekształcenia deklaracji z 1959 roku w wiążące prawo międzynarodowe była właśnie Polska, która w 1978 roku przedłożyła Komisji Praw Człowieka ONZ pierwszy projekt konwencji (przy znaczącym udziale prawnika prof. Adama Łopatki). Polska ratyfikowała Konwencję w 1991 roku (Dz.U. z 1991 r. nr 120, poz. 526).',
        'Równie jasno zasada podmiotowości dziecka została zapisana w Artykule 72 Konstytucji Rzeczypospolitej Polskiej z dnia 2 kwietnia 1997 roku (Dz.U. z 1997 r. nr 78, poz. 483). Ustawa zasadnicza stanowi nie tylko o ochronie dziecka przed przemocą, okrucieństwem, wyzyskiem i demoralizacją (ust. 2), lecz także w ust. 4 zobowiązuje organy władzy publicznej oraz osoby odpowiedzialne za dziecko do „wysłuchania i w miarę możliwości uwzględnienia zdania dziecka”. Prawo nie odbiera rodzicom pierwszeństwa w wychowaniu — wyznacza jedynie granicę tam, gdzie władza miałaby zamienić się w krzywdę lub lekceważenie młodego człowieka.'
      ]
    },
    {
      heading: '2. FAKTY PSYCHOLOGICZNE A ETYKIETOWANIE RODZICÓW: CO NAPRAWDĘ MÓWIĄ BADANIA O STYLACH WYCHOWANIA?',
      paragraphs: [
        'W popularnych poradnikach internetowych łatwo dziś trafić na sensacyjne uproszczenia, w których niemal każdy błąd wychowawczy lub stanowcze wymaganie rodzica bywa pochopnie nazywane „toksycznością”. Rzetelna psychologia rozwojowa jest znacznie bardziej sprawiedliwa i zniuansowana. Klasyczny model stylów wychowania opracowany przez dr Dianę Baumrind i rozwinięty przez Eleanor Maccoby oraz Johna Martina opiera się na dwóch niezależnych wymiarach: wymaganiu i strukturze (stawianie granic, konsekwencja, troska o zasady) oraz responsywności i cieple (uważne słuchanie, okazywanie uczuć, wsparcie emocjonalne).',
        'Na gruncie tego rozróżnienia niemiecki psycholog prof. Martin Pinquart opublikował w 2017 roku dwie szeroko zakrojone metaanalizy podsumowujące dziesięciolecia badań nad dziećmi i młodzieżą: pierwszą dotyczącą zachowań eksternalizacyjnych („Developmental Psychology”, 2017, t. 53, nr 5, s. 873–932; DOI: 10.1037/dev0000295) oraz drugą dotyczącą objawów internalizacyjnych („Marriage & Family Review”, 2017, t. 53, nr 7, s. 613–640; DOI: 10.1080/01494929.2016.1247761). Wyniki potwierdzają wyraźną różnicę między stylem autorytatywnym (wysokie ciepło połączone z jasnymi wymaganiami) a stylem autorytarnym (wysoka kontrola przy niskiej responsywności emocjonalnej). Dzieci wychowywane w atmosferze jednoczesnych granic i serdecznego dialogu wykazują wyższą samoregulację i mniejsze nasilenie zarówno buntu czy agresji, jak i lęku oraz wycofania.',
        'Z tych samych badań wynika również przestroga przed nadmierną „kontrolą psychologiczną”, czyli zawstydzaniem, wywoływaniem poczucia winy czy warunkowaniem miłości od posłuszeństwa — to właśnie ona najsilniej wiąże się z obniżeniem poczucia własnej wartości i lękiem u młodych osób. Jednocześnie trzeba wyraźnie powiedzieć w obronie zmęczonych mam i ojców: stawianie mądrych zasad i uczenie dziecka odpowiedzialności nie jest żadną przemocą, a potknięcie pod wpływem przemęczenia nie czyni rodzica „toksycznym”. Większość rodziców naprawdę kocha swoje dzieci, lecz potrzebuje wsparcia, by w stresie nie uciekać ani w surowy dyktat, ani w bezradną uległość.'
      ]
    },
    {
      heading: '3. STAROŻYTNA REWOLUCJA EWANGELII: PATRIA POTESTAS A ZBAWICIEL BIORĄCY DZIECKO W RAMIONA (MT 18:1–10; MK 10:13–16 UBG)',
      paragraphs: [
        'Aby w pełni docenić wagę słów Pisma Świętego o dzieciach, trzeba przenieść się w realia świata śródziemnomorskiego I wieku po Chrystusie. W klasycznym prawie rzymskim obowiązywała instytucja patria potestas — dożywotnia, niemal absolutna władza ojca rodziny (paterfamilias) nad potomstwem. Obejmowała ona kontrolę majątkową, decyzyjność w sprawach małżeństwa, a w archaicznym rdzeniu także teoretyczne prawo życia i śmierci (vitae necisque potestas) oraz decyzję przy narodzinach, czy uznać noworodka i go wychować, czy porzucić. Choć w czasach cesarstwa skrajne formy tej władzy były łagodzone przez obyczaj (mos maiorum), radę rodzinną i późniejsze edykty cesarskie, w powszechnej mentalności dziecko nie stało w centrum społecznego szacunku — było kimś na dole hierarchii, kogo dopiero trzeba „wykształcić”, by stał się pełnoprawnym obywatelem.',
        'Właśnie na takim tle kulturowym rozgrywa się scena opisana w Ewangeliach synoptycznych Mateusza i Marka. Gdy ludzie przynosili małe dzieci (gr. paidion, Strong G3813) do Jezusa, uczniowie gromili przynoszących, sądząc prawdopodobnie, że Mistrz ma ważniejsze sprawy niż zajmowanie się najmłodszymi. Reakcja Zbawiciela jest niezwykle wyrazista: „Gdy Jezus to zobaczył, oburzył się i powiedział do nich: Pozwólcie dzieciom przychodzić do mnie i nie zabraniajcie im. Do takich bowiem należy królestwo Boże. Zaprawdę powiadam wam: Kto nie przyjmie królestwa Bożego jak dziecko, nie wejdzie do niego. I brał je na ręce, a kładąc na nie ręce, błogosławił je” (Mk 10:14–16 UBG).',
        'Równie rewolucyjnie brzmi przekaz zapisany przez Mateusza w 18. rozdziale jego Ewangelii — sekcji poświęconej życiu i porządkowi wspólnoty wierzących. Na pytanie uczniów o wielkość w Królestwie Niebieskim Jezus nie wskazuje na uczonych w Piśmie ani na przywódców politycznych: „A Jezus, zawoławszy dziecko, postawił je pośród nich; I powiedział: Zaprawdę powiadam wam: Jeśli się nie nawrócicie i nie staniecie się jak dzieci, nie wejdziecie do królestwa niebieskiego” (Mt 18:2–3 UBG). Chwilę później wypowiada surowe ostrzeżenie wobec dorosłych lekceważących najmłodszych: „Uważajcie, abyście nie gardzili żadnym z tych małych. Mówię wam bowiem, że ich aniołowie w niebie zawsze patrzą na oblicze mojego Ojca, który jest w niebie” (Mt 18:10 UBG). W świecie, w którym dziecko nie miało głosu, Chrystus stawia je w samym środku i wiąże sposób traktowania dziecka z relacją człowieka wobec samego Boga.'
      ]
    },
    {
      heading: '4. DZIEDZICTWO OD PANA I GRANICA WŁADZY: EGZEGEZA PSALMU 127, KSIĘGI RODZAJU 1 I LISTÓW PAWŁA (EF 6:1–4; KOL 3:20–21 UBG)',
      paragraphs: [
        'Teologia biblijna jasno rozgranicza prawo własności od powierzonego szafarstwa. Pierwszy rozdział Księgi Rodzaju — fundament biblijnej antropologii — stwierdza wprost: „Stworzył więc Bóg człowieka na swój obraz, na obraz Boga go stworzył; stworzył ich mężczyzną i kobietą” (Rdz 1:27 UBG). Godność człowieka (Imago Dei, wyrażona także w 7. Zasadzie Wiary Kościoła Bożego) nie jest nagrodą za osiągnięcie pełnoletności, dyplom czy samodzielność finansową. Każde dziecko od początku nosi obraz Stwórcy. Dlatego Psalm 127 — „Pieśń stopni dla Salomona”, w której autor przypomina, że bez Bożego błogosławieństwa wszelki ludzki trud budowania domu jest daremny — uczy: „Oto dzieci są dziedzictwem od PANA, a owoc łona nagrodą” (Ps 127:3 UBG). Hebrajski rzeczownik nachalah (Strong H5159) oznacza dziedzictwo lub udział nadany z łaski przez Boga jako Najwyższego Właściciela. Rodzic nie jest zatem właścicielem dziecka, lecz jego opiekunem i szafarzem przed Bogiem.',
        'W zgodzie z tym obrazem Stary Testament w Księdze Powtórzonego Prawa (Pwt 6:6–7 UBG) nie nakazuje rodzicom tresury ani przemocy, lecz wierne towarzyszenie w codzienności: „A te słowa, które ja dziś nakazuję tobie, będą w twoim sercu; I będziesz je często przypominał swoim synom i rozmawiał o nich, przebywając w swoim domu, idąc drogą, kładąc się i wstając”. Przekaz wiary rodzi się w klimacie relacji, wspólnego czasu i osobistej spójności dorosłych, a nie z lęku przed karą.',
        'Najbardziej bezpośredni dialog ze starożytną kulturą władzy ojcowskiej podejmuje jednak apostoł Paweł w listach z uwięzienia rzymskiego (ok. 60–62 r. po Chr.). W ramach tzw. tablic domowych w Listach do Efezjan i Kolosan Paweł najpierw potwierdza piąte przykazanie Dekalogu: „Dzieci, bądźcie posłuszne waszym rodzicom w Panu, bo jest to sprawiedliwe. Czcij swego ojca i matkę – jest to pierwsze przykazanie z obietnicą” (Ef 6:1–2 UBG). Natychmiast jednak zwraca się do ojców — adresatów posiadających w Imperium Rzymskim niemal nieograniczoną władzę domową — i stawia im wyraźną duchową tamę: „A wy, ojcowie, nie pobudzajcie do gniewu waszych dzieci, lecz wychowujcie je w karności i w napominaniu Pana” (Ef 6:4 UBG) oraz w liście bliźniaczym: „Ojcowie, nie pobudzajcie do gniewu waszych dzieci, aby nie upadały na duchu” (Kol 3:21 UBG).',
        'W języku greckim apostoł używa tu bardzo precyzyjnych pojęć. Czasowniki parorgizō (Strong G3949 — rozjątrzać, doprowadzać do gwałtownego gniewu przez niesprawiedliwość lub surowość) oraz erethizō (Strong G2042 — drażnić, prowokować) wskazują na sposób sprawowania władzy, który zamiast prowadzić ku dobru, rani i łamie młode serce, powodując stan określony greckim czasownikiem athumeō (Strong G0120) — utratę ducha, zniechęcenie i wewnętrzne załamanie. W miejsce takiego postępowania Paweł wskazuje paideia (Strong G3809 — całościowe wychowanie, kształtowanie i mądrą dyscyplinę pełną troski) oraz nouthesia (Strong G3559 — napominanie odwołujące się do rozumu i sumienia dziecka). Pamiętając w świetle Ewangelii, że zbawienie jest wyłącznie darem Bożej łaski przez wiarę w Jezusa Chrystusa (Ef 2:8–9 UBG; 10. Zasada Wiary), ani rodzic nie zasługuje na niebo „perfekcyjnym wychowaniem”, ani dziecko nie musi na miłość dorosłych zapracować bezbłędnością.'
      ]
    },
    {
      heading: '5. MIĘDZY DYKTATEM A BEZGRANICZNOŚCIĄ: SZACUNEK NIE OZNACZA BRAKU AUTORYTETU',
      paragraphs: [
        'Odrzucenie mentalności „dziecko to moja własność” bywa czasem błędnie rozumiane jako rezygnacja z wychowania i oddanie wszystkich decyzji domowych w ręce kilkulatka. Taki skrajny model nie służy jednak ani godności dziecka, ani jego poczuciu bezpieczeństwa. Dziecko potrzebuje dorosłego, który bierze na siebie ciężar mądrych granic — tak jak w badaniach rozwojowych styl autorytatywny łączy wysokie ciepło z jasnymi wymaganiami, a w Biblii Bóg okazuje nam jednocześnie bezwarunkową miłość i niezmienne zasady przymierza.',
        'Różnica między zdrowym autorytetem a panowaniem nad drugim człowiekiem ujawnia się w motywacji i metodach. Władza traktująca dziecko jak własność pyta: „Jak szybko wymusić posłuszeństwo, żeby było wygodnie lub żeby inni dobrze o nas mówili?”. Szafarz powierzonego przez Boga życia pyta inaczej: „Czego to dziecko potrzebuje dziś, aby wzrastać w prawdzie, bezpieczeństwie i odpowiedzialności za własne wybory jutro?”. Tam, gdzie pojawia się błąd dziecka, zdrowy autorytet koryguje czyn i uczy naprawy szkody — nigdy nie upokarza osoby i nie wycofuje czułości jako środka nacisku.'
      ]
    },
    {
      heading: '6. PIĘĆ CODZIENNYCH KROKÓW KU GODNOŚCI DZIECKA W DOMU: PRZEWODNIK EkoCC',
      paragraphs: [
        'Rozważanie o godności najmłodszych nabiera realnego kształtu nie w uroczystych przemówieniach 20 listopada, lecz w zwykłym rytmie popołudnia przy kuchennym stole. Redakcja Christian Culture przygotowała pięć konkretnych nawyków, od których można zacząć jeszcze dziś:',
        '1. Zejdź do poziomu wzroku dziecka i wysłuchaj jego relacji bez pośpiechu i ekranu w dłoni (Mk 10:16 UBG; Art. 72 ust. 4 Konstytucji RP). Gdy dziecko mówi o drobnym konflikcie w szkole lub pokazuje swój rysunek, dla niego jest to sprawa najwyższej wagi. Pięć minut niepodzielnej uwagi buduje w młodym człowieku przekonanie, że jego głos ma znaczenie.',
        '2. Oddzielaj ocenę zachowania od godności osoby (Rdz 1:27; Ef 6:4 UBG). Zamiast etykiet („zawsze psujesz”, „jesteś niegrzeczny”), nazwij konkretny fakt i granicę: „Nie wolno rzucać zabawkami, bo można kogoś zranić. Kocham cię i wspólnie posprzątamy”. Dzięki temu dziecko uczy się odpowiedzialności bez poczucia bycia gorszym lub odrzuconym.',
        '3. Przepraszaj dziecko, kiedy jako dorosły stracisz panowanie nad tonem głosu (Kol 3:21; Jk 1:19–20 UBG). Szczere „przesadziłem, podniosłem głos ze zmęczenia, przepraszam” nie podważa autorytetu rodzica — przeciwnie, uczy młodego człowieka, że w naszym domu prawda i pokora obowiązują wszystkich, a relacja jest ważniejsza niż ego.',
        '4. Daj przestrzeń na wybór odpowiedni do wieku w ramach bezpiecznych granic dorosłego (Ps 127:3; Ef 6:4 UBG). Pozwól dziecku współdecydować o drobiazgach dnia codziennego, ucząc je argumentowania i ponoszenia naturalnych konsekwencji — tak kształtuje się sumienie, a nie ślepy konformizm.',
        '5. Módl się z dzieckiem o odwagę i pokój, a nie używaj imienia Boga jako straszaka dyscyplinarnego (Mt 18:5–6; Ef 2:8–9 UBG). Kiedy dom staje się miejscem, w którym najmłodsi poznają cierpliwą miłość rodziców, łatwiej przychodzi im zrozumieć, jak dobry i bliski jest Ojciec w niebie.'
      ]
    }
  ],
  conclusion: 'Dziecko nie jest własnością rodzica, przedłużeniem jego niespełnionych ambicji ani ciężarem do przetrwania. Jest odrębną osobą stworzoną na obraz Boga (Rdz 1:27 UBG) i powierzoną rodzicom jako bezcenne dziedzictwo od Pana (Ps 127:3 UBG). Gdy łączymy jasne, odpowiedzialne granice dorosłego z ciepłem, cierpliwym słuchaniem i pokorą w duchu słów apostoła Pawła (Ef 6:4; Kol 3:21 UBG), dom staje się miejscem, w którym najmłodsi wzrastają nie w lęku przed gniewem, lecz w wolności, szacunku i bezpiecznej miłości Chrystusa.',
  cta: 'Zatrzymaj się dziś na chwilę przy swoim dziecku, wnuku lub najmłodszych w Twoim otoczeniu. Odłóż na kwadrans telefon, spójrz dziecku w oczy i zapytaj je spokojnie, co było dla niego dziś najważniejsze lub najtrudniejsze — i po prostu wysłuchaj bez poprawiania w pół zdania. Możesz też powierzyć swój dom Bogu w krótkiej modlitwie:\n\n„Panie Boże, Stwórco każdego życia i kochający Ojcze, dziękuję Ci za dzieci, które postawiłeś na naszej drodze i powierzyłeś naszej opiece jako bezcenne dziedzictwo. Strzeż naszych serc przed zniecierpliwieniem, pychą i chęcią panowania z pozycji siły. Naucz nas słuchać z uwagą, stawiać mądre i bezpieczne granice oraz nigdy nie doprowadzać najmłodszych do upadku na duchu. Niech nasze domy odbijają łaskę, pokój i szacunek, które okazał nam Twój Syn, Jezus Chrystus. Amen.”\n\n[Status redakcyjny: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4. Proponowany portal docelowy: EkoCC — rodzina i relacje (propozycja kanoniczna /news lub dedykowany dział rodzinny — dokładny URL do potwierdzenia przez wydawcę)]',
  sources: [
    {
      name: 'Organizacja Narodów Zjednoczonych (ONZ) — Konwencja o prawach dziecka, przyjęta przez Zgromadzenie Ogólne ONZ rezolucją A/RES/44/25 dnia 20 listopada 1989 r. (ratyfikowana przez Polskę w 1991 r.: Dz.U. z 1991 r. nr 120, poz. 526) oraz Deklaracja Praw Dziecka z 20 listopada 1959 r.',
      url: 'https://www.un.org/en/observances/world-childrens-day'
    },
    {
      name: 'Konstytucja Rzeczypospolitej Polskiej z dnia 2 kwietnia 1997 r. (Dz.U. z 1997 r. nr 78, poz. 483) — Artykuł 72 (ochrona praw dziecka oraz obowiązek wysłuchania i w miarę możliwości uwzględnienia zdania dziecka)',
      url: 'https://isap.sejm.gov.pl'
    },
    {
      name: 'Pinquart M. — „Associations of parenting dimensions and styles with externalizing problems of children and adolescents: An updated meta-analysis”, Developmental Psychology, 2017, Vol. 53(5), s. 873–932',
      url: 'https://doi.org/10.1037/dev0000295'
    },
    {
      name: 'Pinquart M. — „Associations of parenting dimensions and styles with internalizing symptoms in children and adolescents: A meta-analysis”, Marriage & Family Review, 2017, Vol. 53(7), s. 613–640',
      url: 'https://doi.org/10.1080/01494929.2016.1247761'
    },
    {
      name: 'Oxford Reference / Encyclopaedia Britannica — Patria potestas oraz vitae necisque potestas w prawie rzymskim (kontekst historyczno-prawny starożytności)',
      url: 'https://www.britannica.com/topic/patria-potestas'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Księga Rodzaju 1:26–27; Księga Powtórzonego Prawa 6:4–7; Księga Psalmów 127:1–5; Ewangelia według św. Mateusza 18:1–10; Ewangelia według św. Marka 10:13–16; List do Efezjan 2:8–9; 6:1–4; List do Kolosan 3:20–21; List Jakuba 1:19–20',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong’s Hebrew & Greek Concordance (słownik interlinearny MojaBiblia CC) — Hasła: H5159 (nachalah — dziedzictwo od Pana), G3813 (paidion — małe dziecko), G3949 (parorgizō — pobudzać do gniewu), G2042 (erethizō — drażnić, prowokować), G0120 (athumeō — upaść na duchu), G3809 (paideia — wychowanie, karność), G3559 (nouthesia — napominanie)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady 7 (Natura człowieka stworzonego na obraz Boga), 10 (Zbawienie z łaski przez wiarę) oraz 23 (Małżeństwo i rodzina oparte na wzajemnym szacunku)',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Księga Psalmów 127:3 („Oto dzieci są dziedzictwem od PANA, a owoc łona nagrodą”); Księga Rodzaju 1:27 („Stworzył więc Bóg człowieka na swój obraz”); Ewangelia według św. Marka 10:14–16 („Pozwólcie dzieciom przychodzić do mnie... I brał je na ręce, a kładąc na nie ręce, błogosławił je”); Ewangelia według św. Mateusza 18:1–10; List do Efezjan 6:1–4 („A wy, ojcowie, nie pobudzajcie do gniewu waszych dzieci, lecz wychowujcie je w karności i w napominaniu Pana”); List do Kolosan 3:20–21 („aby nie upadały na duchu”) (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-dziecko-nie-jest-wlasnoscia-rodzica-co-biblia-mowi-o-godnosci-najmlodszych.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Rodzice siedzący na wysokości wzroku swojego siedmioletniego dziecka przy drewnianym stole w naturalnym popołudniowym świetle i słuchający z uwagą jego opowieści o rysunku — symbol szacunku, obecności i dialogu w rodzinie.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#DzienPrawDziecka',
    '#GodnoscDziecka',
    '#WychowaniePoBozemu',
    '#Rodzina',
    '#EkoCC',
    '#EkoCC365',
    '#BibliaUBG',
    '#CCNNews'
  ],
  seo: {
    title: 'Dziecko nie jest własnością rodzica. Co mówi Biblia?',
    description: 'Międzynarodowy Dzień Praw Dziecka (20 listopada), badania Pinquarta oraz egzegeza UBG (Ps 127:3, Mk 10:14, Ef 6:4): jak łączyć szacunek dla dziecka z mądrymi granicami.',
    keywords: [
      'dziecko nie jest własnością rodzica',
      'międzynarodowy dzień praw dziecka 20 listopada',
      'co Biblia mówi o godności dzieci',
      'Psalm 127:3 dziedzictwo od Pana',
      'Efezjan 6:4 nie pobudzajcie do gniewu',
      'Kolosan 3:21 aby nie upadały na duchu',
      'styl autorytatywny Pinquart metaanaliza',
      'artykuł 72 Konstytucji RP prawa dziecka',
      'Cezary Rogowski',
      'Christian Culture EkoCC'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 17: 2026-11-20 — Międzynarodowy Dzień Praw Dziecka)...');
  console.log('Tytuł:', articleData.title);
  console.log('Dział kalendarza: RODZINA | Priorytet: A | Portal roboczy:', articleData.portal);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${currentJsonPath}`);

  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4');
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
