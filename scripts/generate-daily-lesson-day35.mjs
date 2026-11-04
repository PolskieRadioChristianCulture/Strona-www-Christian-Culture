import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 35: Wj 4:1–31 (4 listopada 2026 r., Środa)
const DAY_NUM = 35;
const DATE_STR = '2026-11-04';
const DATE_FORMATTED = 'Środa, 4 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 4:1–31';
const TITLE = 'ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI';
const SUBTITLE = 'Wątpliwości Mojżesza, trzy cudowne znaki, Aaron rzecznikiem, przymierze krwi i powrót do uciemiężonego ludu';
const MEMORY_VERSE = '„I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.” (Wj 4:11–12, UBG)';
const THEME = 'Czwarty rozdział Księgi Wyjścia ukazuje zmaganie człowieka z powołaniem oraz suwerenność Boga, który odpowiada na ludzkie lęki znakami łaski, posyła pomocnika i wzywa do bezkompromisowej wierności przymierzu. Bóg nie szuka ludzkiej elokwencji, lecz posłusznego serca.';

console.log('Rozpoczynam generowanie pełnej lekcji Dnia 35 (Wj 4:1–31)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 35
ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI
Wątpliwości Mojżesza, trzy cudowne znaki, Aaron rzecznikiem, przymierze krwi i powrót do uciemiężonego ludu
Środa, 4 listopada 2026 r.  |  Czytanie: Wj 4:1–31
TEKST PAMIĘCIOWY: „I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.” (Wj 4:11–12, UBG)
MYŚL PRZEWODNIA: Czwarty rozdział Księgi Wyjścia ukazuje zmaganie człowieka z powołaniem oraz suwerenność Boga, który odpowiada na ludzkie lęki znakami łaski, posyła pomocnika i wzywa do bezkompromisowej wierności przymierzu. Bóg nie szuka ludzkiej elokwencji, lecz posłusznego serca.

ZANIM OTWORZYSZ BIBLIĘ
Czwarty rozdział Księgi Wyjścia stanowi bezpośrednią kontynuację teofanii przy płonącym krzewie na Bożej górze Horeb. W rozdziale trzecim Bóg objawił swoje święte Imię: JESTEM, KTÓRY JESTEM (JHWH), ogłosił historyczne zstąpienie na ratunek uciskanemu ludowi w Egipcie i powołał osiemdziesięcioletniego pasterza Mojżesza na swojego wysłannika. W rozdziale czwartym jesteśmy świadkami niezwykle dramatycznego dialogu między Stwórcą a powołanym człowiekiem. Mojżesz, świadom klęski sprzed czterdziestu lat, gdy próbował wyzwolić braci własną siłą (Wj 2:11–15), zmaga się z głębokim kompleksem nieadekwatności, sceptycyzmem i paraliżującym lękiem przed odrzuceniem.
W odpowiedzi na jego obawy Bóg nie odrzuca Mojżesza, lecz w cierpliwej pedagogice wyposaża go w trzy spektakularne znaki: laskę zamienioną w węża, rękę dotkniętą i uleczoną z trądu oraz wodę Nilu obracającą się w krew na ziemi. Każdy z tych znaków uderza w fundamenty egipskiej religii i magii, demonstrując całkowitą supremację Boga Abrahama nad siłami chaosu, chorobą i bóstwami imperium.
Gdy Mojżesz nadal wymawia się ociężałością ust i prosi o posłanie kogoś innego, Bóg w sprawiedliwym gniewie powołuje jego brata Aarona na rzecznika, objawiając zasadę braterskiej współpracy w dziele Królestwa. Rozdział zawiera również tajemniczy i wstrząsający epizod w gospodzie (Wj 4:24–26), gdzie zaniedbane przymierze obrzezania staje się kwestią życia i śmierci, a krew przymierza przynosi ocalenie. Zwieńczeniem rozdziału jest powrót do Egiptu, spotkanie z Aaronem i starszymi narodu oraz triumf wiary uciemiężonego ludu, który skłania głowy w pokłonie uwielbienia.

CZĘŚĆ I — WĄTPLIWOŚCI MOJŻESZA I TRZY CUDOWNE ZNAKI (Wj 4:1–9)
1. Realizm sceptycyzmu Mojżesza (4:1)
Mojżesz odpowiada Bogu: „A jeśli mi nie uwierzą i nie usłuchają mego głosu, lecz powiedzą: PAN ci się nie ukazał?”. Po czterdziestu latach na obczyźnie w Madianie pamięta bolesne słowa rodaka: „Któż cię ustanowił przełożonym i sędzią nad nami?” (Wj 2:14). Lęk przed ponownym odrzuceniem jest po ludzku zrozumiały, lecz ujawnia skupienie na sobie zamiast na powadze Tego, który posyła.
2. Boska pedagogika: „Co masz w ręku?” (4:2)
Bóg odpowiada pytaniem: „Co masz w ręku?”. Mojżesz odpowiada krótko: „Laskę”. Bóg rozpoczyna działanie od tego, co człowiek już posiada — zwykłego pasterskiego kija, narzędzia codziennej, żmudnej pracy. Bóg nie potrzebuje ludzkich koron ani bogactw; On uświęca to, co proste, by objawić swoją chwałę.
3. Rzucenie laski i metamorfoza w węża (4:3)
Na Boży rozkaz Mojżesz rzuca laskę na ziemię, a ta zamienia się w węża (hebr. nahasz). Mojżesz odruchowo ucieka przed nim. Wąż w starożytnym Egipcie był symbolem najwyższej władzy królewskiej (kobra Ureusz na diademie faraona reprezentująca boginię Wadżet) oraz ucieleśnieniem wrogich sił chaosu (bóg-wąż Apopis). Ucieczka Mojżesza symbolizuje ludzki lęk przed demoniczną potęgą tyrana.
4. Chwyt za ogon: sprawdzian zaufania (4:4)
Bóg nakazuje: „Wyciągnij rękę i chwyć go za ogon”. Każdy pasterz i zaklinacz węży na Wschodzie wiedział, że chwycenie jadowitego gada za ogon grozi śmiertelnym ukąszeniem — węża chwyta się tuż za głową. Nakaz Boga wymagał bezwzględnego zaufania Słowu wbrew ludzkiemu doświadczeniu. Gdy Mojżesz wyciąga rękę i chwyta węża, ten w jego dłoni znów staje się laską. Władza zła zostaje ujarzmiona przez posłuszeństwo wierze.
5. Cel znaku: tożsamość Boga Przymierza (4:5)
Znak ten ma jeden cel: „Aby uwierzyli, że ukazał ci się PAN, Bóg ich ojców, Bóg Abrahama, Bóg Izaaka i Bóg Jakuba”. Cuda biblijne nie służą rozrywce ani budowaniu ludzkiej sławy; one uwierzytelniają poselstwo Boga żywego i odnawiają przymierze z ojcami.
6. Drugi znak: ręka w zanadrzu i trąd (4:6)
Bóg nakazuje Mojżeszowi włożyć rękę w zanadrze. Gdy ją wyjmuje, ręka jest trędowata, biała jak śnieg (hebr. mecorat kaszaleg). Trąd w tradycji biblijnej był najstraszniejszą z chorób — symbolem śmiertelnego skażenia grzechem, nieczystości rytualnej i bezradności człowieka wobec wewnętrznego zepsucia (Kpł 13).
7. Uzdrowienie ręki: suwerenność nad życiem i śmiercią (4:7)
Na ponowny rozkaz Mojżesz wkłada rękę w zanadrze i wyjmuje ją całkowicie przywróconą do zdrowia, jak reszta jego ciała. Znak ten dowodzi, że Bóg ma absolutną władzę nad ludzkim ciałem, chorobą i śmiercią. Ten sam Bóg, który dopuścił cierpienie Izraela, ma moc całkowitego uleczenia swego ludu ze śmiertelnej niewoli.
8. Głos pierwszego i drugiego znaku (4:8)
Pismo stwierdza: „jeśli ci nie uwierzą i nie posłuchają głosu pierwszego znaku, to uwierzą głosowi drugiego znaku”. W języku biblijnym znaki „mówią” (mają swój głos). Objawiają one, że Bóg panuje zarówno nad zewnętrznym wrogiem politycznym (wąż/faraon), jak i nad wewnętrznym skażeniem człowieka (trąd).
9. Trzeci znak ostateczny: woda Nilu w krew (4:9)
Jeśli lud nie uwierzy dwóm pierwszym znakom, Mojżesz ma wziąć wody z Nilu i wylać ją na suchą ziemię — woda natychmiast zamieni się w krew. Nil był dla Egipcjan źródłem wszelkiego życia, ubóstwianym jako Hapi i Ozyrys. Zamiana wody w krew to profetyczna zapowiedź pierwszej plagi i jawna proklamacja, że bóstwa Egiptu są martwe, a ich źródło życia niesie śmierć pod sądem JHWH.
10. Znaki przymierza a ludzka słabość (4:1–9)
Trzy znaki dane Mojżeszowi wyczerpująco odpowiadają na każdą sferę wątpliwości: ukazują panowanie nad królestwem ciemności, moc uzdrowienia z grzechu oraz nieodwołalny sąd nad bałwochwalstwem. Prawdziwa wiara rodzi się ze słuchania głosu Boga, który działa w widzialnych znakach łaski.

CZĘŚĆ II — OCIĘŻAŁOŚĆ MOWY, GNIEW PANA I POWOŁANIE AARONA (Wj 4:10–17)
11. Wymówka retoryczna Mojżesza (4:10)
Mojżesz nie rezygnuje ze sprzeciwu: „O, mój Panie, nie jestem człowiekiem wymownym... mam ociężałe usta i ociężały język” (hebr. kewad peh u-kewad laszon). Czterdzieści lat pasterskiego milczenia odebrało mu pewność siebie; obawia się stanąć przed oratorską elitą egipskiego dworu.
12. Suwerenność Stwórcy nad zmysłami (4:11)
Bóg odpowiada pytaniem o fundamentalną teologię stworzenia: „Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN?”. Ludzkie wady i ograniczenia nie są przeszkodą dla Stwórcy wszechświata; On nie szuka ludzkiej doskonałości, lecz naczynia dla swojej mocy.
13. Obietnica Bożej obecności przy ustach (4:12)
„Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić”. Bóg nie obiecuje Mojżeszowi elokwencji retora, lecz obiecuje Siebie Samego. Wystarczy Boża obecność, aby ludzkie słowa stały się mieczem Ducha.
14. Upór człowieka: „Poślij kogo innego” (4:13)
W odpowiedzi Mojżesz mówi wprost: „O, mój Panie, poślij, proszę, kogoś innego”. W tym momencie maska rzekomej „nieśmiałości” opada. Prawdziwym problemem Mojżesza nie była wada wymowy, lecz brak gotowości poddania własnej woli i lęk przed ryzykiem posłuszeństwa.
15. Sprawiedliwy gniew PANA (4:14)
Tekst notuje: „Wtedy zapłonął gniew PANA na Mojżesza”. Boży gniew nie jest kapryśną furią, lecz świętą reakcją miłości na niewiarę człowieka, który w obliczu tylu obietnic i cudów wciąż odrzuca Boże wezwanie.
16. Wyznaczenie Aarona Lewity (4:14)
Bóg wskazuje rozwiązanie: „Czyż Aaron, Lewita, nie jest twoim bratem? Wiem, że on potrafi dobrze mówić”. Zanim Mojżesz sformułował swoje obawy, Bóg już przygotował odpowiedź: Aaron właśnie wyruszył na pustynię, a spotkanie przyniesie mu radość w sercu.
17. Zasada braterskiej wspólnoty (4:15)
„Będziesz mówił do niego i wkładał słowa w jego usta; a Ja będę z twoimi ustami i z jego ustami, i nauczę was, co macie czynić”. Bóg nie odrzuca Mojżesza, lecz dołącza do niego brata. W Królestwie Bożym nikt nie jest powołany do samotnego bohaterstwa; Boże dzieło rozwija się we wspólnocie i wzajemnym uzupełnianiu darów.
18. Aaron ustami, Mojżesz zamiast Boga (4:16)
Bóg ustala precyzyjną hierarchię posłannictwa: Aaron będzie rzecznikiem wobec ludu, a Mojżesz będzie dla niego „zamiast Boga” (hebr. le-Elohim) — bezpośrednim odbiorcą i przekaźnikiem Bożego objawienia. Mojżesz staje się wzorem urzędu prorockiego.
19. Przekształcenie laski pasterza w laskę Boga (4:17)
Bóg nakazuje: „A tę laskę weź w rękę, bo będziesz nią czynił znaki”. W wersecie 20 laska ta zostanie nazwana „laską Boga” (matteh ha-Elohim). Zwykły kij pasterski staje się berłem Króla królów, narzędziem rozstrzygnięcia losów imperium.
20. Lekcja Bożej cierpliwości i determinacji (4:10–17)
Historia ta uczy, że gdy Bóg wzywa człowieka, Jego powołanie jest nieodwołalne. Bóg łamie ludzki opór, dopasowuje okoliczności, posyła pomocników, lecz nie rezygnuje ze swego planu zbawienia.

CZĘŚĆ III — POŻEGNANIE Z JETREM, SĄD NAD PIERWORODNYMI I OCALAJĄCE OBRZEZANIE (Wj 4:18–26)
21. Etyka pożegnania z Jetrem (4:18)
Mojżesz wraca do swego teścia Jetry i prosi o pozwolenie na powrót do braci w Egipcie. Nie ucieka potajemnie, lecz okazuje szacunek i honor głowie rodziny. Jetro odpowiada z życzliwością: „Idź w pokoju” (lech le-szalom).
22. Uwolnienie od dawnego wyroku (4:19)
Bóg zapewnia Mojżesza w Madianie: „Idź, wracaj do Egiptu, bo pomarli wszyscy ludzie, którzy czyhali na twoje życie”. Czterdzieści lat wymazało dawną sprawę zabójstwa Egipcjanina; droga powrotu jest wolna od dawnych procesów prawnych.
23. Karawana pokory na ośle (4:20)
Mojżesz sadza żonę Seforę i swoich synów (Gerszoma i Eliezera) na osła i wyrusza do Egiptu, trzymając w ręku laskę Boga. Wódz narodu nie wjeżdża do imperium z konnicą i rydwanami, lecz w skromności pustynnego pasterza, zapowiadając Chrystusa wjeżdżającego do Jerozolimy.
24. Zapowiedź zatwardzenia serca faraona (4:21)
Bóg poucza Mojżesza: „Ja zatwardzę jego serce, tak że nie wypuści ludu”. Hebrajskie chazak oznacza wzmocnienie, uczynienie nieustępliwym. Bóg pozwala, by pyszny bunt faraona osiągnął apogeum, aby na oczach narodów objawić swoją absolutną sprawiedliwość i moc ocalenia.
25. Proklamacja synostwa Izraela (4:22)
Mojżesz ma przekazać faraonowi konstytucyjne słowa przymierza: „Tak mówi PAN: Izrael jest moim synem, moim pierworodnym” (hebr. beni bechori Jisrael). Niewolnicy lepiący cegły są w oczach Wiekuistego umiłowanym pierworodnym synem Boga.
26. Zapowiedź dziesiątej plagi: śmierć pierworodnych (4:23)
Już w czwartym rozdziale Bóg kładzie na stole ostateczną stawkę walki: „Wypuść mego syna, aby mi służył. Lecz jeśli odmówisz... oto zabiję twego syna, twego pierworodnego”. Odrzucenie Bożego synostwa sprowadza śmierć na dynastię ciemięzcy.
27. Tajemnica w gospodzie: śmiertelna konfrontacja (4:24)
Podczas podróży, w miejscu noclegu (hebr. malon), Bóg spotyka Mojżesza i „chce go zabić”. Ten wstrząsający epizod przypomina, że nikt — nawet wybrany wybawiciel narodu — nie może bezkarnie lekceważyć Bożego przymierza.
28. Zaniedbane obrzezanie syna (4:24–25)
Powodem Bożego gniewu było zaniechanie obrzezania młodszego syna Mojżesza, prawdopodobnie wskutek oporu cudzoziemskiej żony Sefory lub ugodowości pasterza w Madianie. Zgodnie z Rdz 17:14 nieobrzezany mężczyzna miał być wycięty ze swego ludu za złamanie przymierza. Człowiek posłany, by wymagać posłuszeństwa od faraona, musiał sam być nieskazitelnie posłuszny we własnym domu.
29. Błyskawiczny czyn Sefory i kamienny nóż (4:25)
Sefora natychmiast rozumie powagę sytuacji: bierze ostry krzemień (rytualny nóż kamienny), obrzeza napletek syna i dotyka stóp Mojżesza, wołając: „Zaprawdę, jesteś dla mnie oblubieńcem krwi” (hebr. chatan damim). Odwaga i determinacja kobiety ratują życie przywódcy.
30. Przebłaganie przez krew i ustąpienie gniewu (4:26)
Gdy krew przymierza zostaje przelana, Bóg odstępuje od Mojżesza. Epizod ten stanowi zapowiedź nocy paschalnej: tylko krew niewinnej ofiary przymierza chroni przed sądem Bożym i ratuje życie pierworodnych.

CZĘŚĆ IV — BRATERSKIE SPOTKANIE Z AARONEM I WIARA LUDU W EGIPCIE (Wj 4:27–31)
31. Prowadzenie Aarona na Bożą górę (4:27)
Gdy Mojżesz zbliża się do granic Egiptu, Bóg przemawia do Aarona: „Idź na pustynię naprzeciw Mojżesza”. Aaron wyrusza bez wahania i spotyka brata na górze Bożej Horeb. Boska synchronizacja łączy dwa powołane serca w wyznaczonym przez niebiosa czasie.
32. Pocałunek braterski i przezwyciężenie rozłąki (4:27)
Po czterdziestu latach milczenia bracia witają się świętym pocałunkiem. Aaron nie czuje zawiści o pierwszeństwo młodszego brata; jego serce jest przepełnione radością i gotowością służby.
33. Pełny raport i przekazanie słów Pana (4:28)
Mojżesz oznajmia Aaronowi wszystkie słowa Pana i polecone znaki. Prawdziwe przywództwo w Kościele i narodzie opiera się na przejrzystości, jedności doktrynalnej i wierności zwiastowaniu Słowa.
34. Zgromadzenie starszych Izraela (4:29)
Mojżesz i Aaron przybywają do Egiptu i zwołują wszystkich starszych synów Izraela (hebr. ziknej wenej Jisrael). Bóg nie pomija uświęconego porządku społecznego; nowina o wyzwoleniu trafia najpierw do odpowiedzialnych przywódców wspólnoty.
35. Wierne zwiastowanie przez Aarona (4:30a)
Aaron precyzyjnie powtarza wszystkie słowa, które PAN skierował do Mojżesza przy płonącym krzewie. Słowo Boże ma pierwszeństwo przed wszelkimi cudami i znakami.
36. Czynienie znaków przed oczyma ludu (4:30b)
Mojżesz wykonuje trzy cudowne znaki przed zgromadzonymi przedstawicielami ludu. Znaki potwierdzają boski autorytet poselstwa i pieczętują wiarygodność posłańców.
37. Triumf wiary: „I lud uwierzył” (4:31a)
Największa obawa Mojżesza z wersetu pierwszego („A jeśli mi nie uwierzą...?”) zostaje całkowicie rozproszona przez potęgę łaski: „I lud uwierzył!”. Uciemiężeni niewolnicy, złamani ciężarem robót publicznych, otwierają serca na obietnicę wolności.
38. Nawiedzenie Boga i liturgiczny pokłon (4:31b)
Gdy lud usłyszał, że PAN nawiedził synów Izraela (hebr. pakad JHWH) i wejrzał na ich ucisk, następuje wstrząsający finał: „skłonili głowy i oddali pokłon” (hebr. wa-jikkedu wa-jisztachawu). Rozdział zaczyna się od sceptycyzmu i lęku, a kończy na kolanach w chwalebnym akcie uwielbienia Boga Przymierza.

JEZUS W CENTRUM — WIĘKSZY NIŻ MOJŻESZ, ZWYCIĘZCA WĘŻA I OBLUBIENIEC KRWI
39. Chrystus — Prorok większy niż Mojżesz (Wj 4:10–12 a J 1:17; Hbr 3:1–6)
Mojżesz zmagał się z ociężałością ust i słabością wymowy; Jezus Chrystus jest samym Przedwiecznym Słowem (Logos), przez które wszystko się stało. Mojżesz był wiernym sługą w domu Bożym, lecz Chrystus panuje jako Syn nad całym domem, będąc ostatecznym Pośrednikiem Nowego Przymierza.
40. Zwycięstwo nad pradawnym wężem (Wj 4:3–4 a Rdz 3:15; Łk 10:19; Ap 12:9–11)
Chwycenie węża za ogon i zamiana go w laskę zapowiadały triumf Jezusa nad szatanem. Na krzyżu Golgoty Chrystus starł głowę pradawnego węża, odebrał mu władzę oskarżania i dał swoim uczniom moc deptania po wężach i skorpionach.
41. Uzdrowienie z duchowego trądu (Wj 4:6–7 a Mt 8:1–3; Iz 53:4–5)
Oczyszczenie ręki Mojżesza z trądu wskazuje na Tego, który dotykał trędowatych i przywracał im życie. Przez swoje rany Jezus uleczył śmiertelny trąd ludzkiego grzechu, czyniąc nas czystymi przed obliczem Ojca.
42. Krew Nowego Przymierza gładząca winę (Wj 4:24–26 a Mt 26:28; Hbr 9:22; 12:24)
Dramat w gospodzie uczy, że święty Bóg nie toleruje lekceważenia przymierza, a jedynym ratunkiem przed sądem jest krew ofiary. Sefora nazwała Mojżesza „oblubieńcem krwi”. Jezus Chrystus jest prawdziwym Oblubieńcem Kościoła, który nabył swoją Oblubienicę nie obrzezaniem ciała, lecz własną bezcenną krwią przelaną na krzyżu.
43. Posłuszeństwo Syna bez wymówek (Wj 4:13–14 a Mt 26:39; Hbr 10:7)
Gdy Mojżesz błagał: „poślij kogo innego”, wywołując Boży gniew, Jezus w Ogrodzie Getsemane modlił się w pokorze: „Ojcze mój, jeśli to możliwe, niech mnie ominie ten kielich; wszakże nie jak ja chcę, ale jak Ty”. Jezus nie wymawiał się słabością, lecz wypełnił wolę Ojca aż do śmierci krzyżowej.
44. Syn Pierworodny wydany za niewolników (Wj 4:22–23 a Rz 8:29, 32; Kol 1:15–18)
Izrael został nazwany „synem pierworodnym”, lecz Jezus jest Jednorodzonym i Pierworodnym wszelkiego stworzenia. Aby wyzwolić nas z niewoli grzechu, Bóg Ojciec nie oszczędził swego jedynego Pierworodnego, wydając Go na śmierć, byśmy stali się dziećmi Bożymi.
45. Nawiedzenie i wieczne uwolnienie (Wj 4:31 a Łk 1:68; 7:16)
Słowa: „PAN nawiedził synów Izraela” powracają w pieśni Zachariasza o narodzeniu Chrystusa: „Błogosławiony Pan, Bóg Izraela, że nawiedził i odkupił swój lud”. W Jezusie Chrystusie Bóg nawiedził ludzkość raz na zawsze, uwalniając nas z duchowego Egiptu do wiecznej wolności dzieci Bożych.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 4:2–4 → Łk 10:19. Jak władza nad wężem dana Mojżeszowi zapowiada władzę uczniów Chrystusa nad mocami ciemności?
• Wj 4:6–7 → Mt 8:2–3. W jaki sposób uzdrowienie trądu u Mojżesza koresponduje z mesjańskim uleczeniem trędowatego przez Jezusa?
• Wj 4:9 → J 2:1–11. Dlaczego pierwszy znak Mojżesza przyniósł krew i sąd, podczas gdy pierwszy cud Jezusa zamienił wodę w wino łaski i radości?
• Wj 4:10–12 → Jer 1:6–9. Jak Bóg odpowiada na wymówki Jeremiasza i Mojżesza dotyczące ich niezdolności do przemawiania?
• Wj 4:11 → Ps 94:9. Kto stworzył ucho i oko oraz co z tego wynika dla naszej ufności w Bożą suwerenność?
• Wj 4:14–16 → 1 Kor 12:14–22. Jak współpraca Mojżesza i Aarona ilustruje zasadę funkcjonowania Ciała Chrystusa i wzajemnego uzupełniania się darów?
• Wj 4:17 → 1 Kor 1:27–29. Dlaczego Bóg posługuje się zwykłą laską pasterską, by zawstydzić mędrców i potęgę Egiptu?
• Wj 4:22 → Jr 31:9. W jakim sensie tytuł „syn pierworodny” wyraża szczególną miłość i ojcowską troskę Boga o Jego lud?
• Wj 4:24–26 → Rdz 17:9–14. Jakie znaczenie miało obrzezanie jako nieodwołalny znak przymierza i dlaczego jego zaniedbanie groziło śmiercią?
• Wj 4:25 → Kol 2:11–12. W jaki sposób fizyczne obrzezanie przymierza znajduje swoje duchowe wypełnienie w chrzcie i odrodzeniu w Chrystusie?
• Wj 4:27 → Ps 133:1–3. Jak braterskie spotkanie Mojżesza i Aarona na Horebie objawia piękno i błogosławieństwo jedności braci w Panu?
• Wj 4:31 → Łk 1:68. Co oznacza biblijne „nawiedzenie Boga” i dlaczego prowadzi uciemiężonych ludzi do głębokiego uwielbienia?

PRAWDA NA DZIŚ
• Bóg zaczyna od tego, co masz w ręku: nie musisz czekać na nadzwyczajne zasoby — oddaj Bogu swoją codzienność, pracę i proste talenty.
• Twoja słabość nie jest przeszkodą dla Bożej wszechmocy: Ten, który stworzył usta, uzdalnia powołanych i daje słowo w odpowiednim czasie.
• Wymówki rodzą się z lęku i niewiary: odrzucenie Bożej misji rani serce Boga; prawdziwa pokora nie ucieka, lecz mówi: „Oto jestem, poślij mnie”.
• Bóg powołuje do wspólnoty: nikt nie ma służyć w pojedynkę; Aaron i Mojżesz przypominają o sile braterskiej współpracy i dzielenia odpowiedzialności.
• Posłuszeństwo Bogu zaczyna się we własnym domu: nie można prowadzić innych do wolności, zaniedbując Boże przykazania w życiu prywatnym i rodzinnym.
• Bez przelania krwi nie ma ocalenia: krew przymierza z Wj 4 wskazuje na krzyż Golgoty — jedyną tarczę chroniącą przed wiecznym sądem.
• Przeszkody znikają przed wiarą: ludzie, przed którymi drżysz, mogą otworzyć serca na Boże Słowo — zaufaj Bogu i głoś Jego obietnice z odwagą.
• Zrozumienie Bożej troski rodzi uwielbienie: gdy uświadomisz sobie, że Bóg widzi Twój ucisk i przyszedł Ci z pomocą, Twoje serce zegnie się w dziękczynnym pokłonie.

POMYŚL — PYTANIA DO REFLEKSJI
1. Co jest ową „laską w Twoim ręku” — jakimi prostymi umiejętnościami, relacjami lub narzędziami dysponujesz, które Bóg chce dziś uświęcić i użyć?
2. Jakie wymówki najczęściej podsuwasz Bogu, gdy czujesz wezwanie do zaangażowania się w Jego dzieło lub rozmowy o wierze?
3. Czy wierzysz, że Stwórca Twoich ust i myśli potrafi poprowadzić Cię w trudnych, decydujących rozmowach w pracy lub w rodzinie?
4. Jak w praktyce możesz dziś wesprzeć swojego „Aarona” lub „Mojżesza” — osobę, z którą służysz lub pracujesz w jednym zespole?
5. Czy w Twoim życiu osobistym i rodzinnym nie ma zaniedbanego „obrzezania” — nieposłuszeństwa jakiemuś wyraźnemu nakazowi Słowa Bożego?
6. W jaki sposób świadomość, że jesteś dzieckiem Boga i częścią Jego „pierworodnego ludu”, zmienia Twoje poczucie godności i odwagi w świecie?
7. Dlaczego uciekasz przed „wężami” swoich problemów, zamiast w autorytecie Słowa Bożego chwycić je wiarą i oddać Panu?
8. Kiedy ostatnio uklęknąłeś przed Bogiem nie po to, by prosić o pomoc, lecz by oddać Mu pokłon za to, że wejrzał na Twój los i nawiedził Twoje serce?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Jaką pierwszą wątpliwość wyraził Mojżesz w Wj 4:1 odnośnie Izraelitów w Egipcie?
Odpowiedź: „A jeśli mi nie uwierzą i nie usłuchają mego głosu, lecz powiedzą: PAN ci się nie ukazał?” (Wj 4:1).
2. O co zapytał PAN Mojżesza w Wj 4:2, zanim dał mu pierwszy znak?
Odpowiedź: „Co masz w ręku?”, na co Mojżesz odpowiedział: „Laskę” (Wj 4:2).
3. W co zamieniła się laska Mojżesza, gdy na Boży rozkaz rzucił ją na ziemię (Wj 4:3)?
Odpowiedź: W węża, przed którym Mojżesz zaczął uciekać (Wj 4:3).
4. Za co PAN nakazał Mojżeszowi chwycić węża, aby ten z powrotem stał się laską (Wj 4:4)?
Odpowiedź: Za ogon (Wj 4:4).
5. Jaki był cel pierwszego cudownego znaku z laską i wężem według Wj 4:5?
Odpowiedź: Aby uwierzyli, że ukazał mu się PAN, Bóg ich ojców: Abrahama, Izaaka i Jakuba (Wj 4:5).
6. Jaki był drugi cudowny znak dany Mojżeszowi w Wj 4:6–7?
Odpowiedź: Ręka włożona w zanadrze stała się trędowata, biała jak śnieg, a po ponownym włożeniu została całkowicie uleczona (Wj 4:6–7).
7. Jaki trzeci znak zapowiedział Bóg na wypadek, gdyby lud nie uwierzył dwóm pierwszym znakom (Wj 4:9)?
Odpowiedź: Woda wzięta z rzeki Nil po wylaniu na suchą ziemię zamieni się w krew (Wj 4:9).
8. Jaką wymówkę podał Mojżesz w Wj 4:10, próbując uchylić się od misji?
Odpowiedź: Że nie jest człowiekiem wymownym, lecz ma ociężałe usta i ociężały język (Wj 4:10).
9. Co PAN odpowiedział Mojżeszowi na zarzut o brak wymowy w Wj 4:11?
Odpowiedź: „Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN?” (Wj 4:11).
10. Jaką obietnicę złożył PAN Mojżeszowi w Wj 4:12?
Odpowiedź: „Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić” (Wj 4:12).
11. Jak zareagował Mojżesz w Wj 4:13 po Bożej obietnicy?
Odpowiedź: Powiedział: „O, mój Panie, poślij, proszę, kogoś innego” (Wj 4:13).
12. Jak zareagował PAN na ostateczny opór Mojżesza w Wj 4:14?
Odpowiedź: Zapłonął gniew PANA na Mojżesza i Bóg wyznaczył Aarona jako jego rzecznika (Wj 4:14).
13. Z jakiego pokolenia pochodził Aaron i jak Bóg scharakteryzował jego zdolności (Wj 4:14)?
Odpowiedź: Z pokolenia Lewiego („Aaron, Lewita”); Bóg powiedział: „Wiem, że on potrafi dobrze mówić” (Wj 4:14).
14. Jaką rolę Bóg wyznaczył Aaronowi względem Mojżesza w Wj 4:16?
Odpowiedź: Aaron miał być ustami (rzecznikiem) dla Mojżesza, a Mojżesz miał być dla niego „zamiast Boga” (Wj 4:16).
15. Co powiedział Jetro, teść Mojżesza, gdy ten poprosił o pozwolenie na powrót do braci w Egipcie (Wj 4:18)?
Odpowiedź: „Idź w pokoju” (Wj 4:18).
16. Jaką uspokajającą wiadomość przekazał PAN Mojżeszowi jeszcze w Madianie (Wj 4:19)?
Odpowiedź: Że pomarli wszyscy ludzie w Egipcie, którzy czyhali na jego życie (Wj 4:19).
17. Jak PAN nakazał nazwać naród Izraela w poselstwie skierowanym do faraona (Wj 4:22)?
Odpowiedź: „Izrael jest moim synem, moim pierworodnym” (Wj 4:22).
18. Jakie dramatyczne wydarzenie rozegrało się w gospodzie w drodze do Egiptu (Wj 4:24–26)?
Odpowiedź: PAN spotkał Mojżesza i chciał go zabić za brak obrzezania syna; Sefora obrzezała syna krzemieniem, ratując męża (Wj 4:24–26).
19. Gdzie doszło do radosnego spotkania Mojżesza z Aaronem wysłanym przez Boga (Wj 4:27)?
Odpowiedź: Na pustyni, na świętej górze Bożej (Horeb), gdzie powitali się pocałunkiem (Wj 4:27).
20. Jak zareagowali starsi i lud Izraela, gdy Aaron opowiedział słowa Pana, a Mojżesz uczynił znaki (Wj 4:31)?
Odpowiedź: Lud uwierzył, a usłyszawszy, że PAN nawiedził synów Izraela i wejrzał na ich ucisk, skłonili głowy i oddali pokłon (Wj 4:31).

TWOJA DECYZJA
Czwarty rozdział Księgi Wyjścia stawia nas w prawdzie przed naszymi własnymi oporami i lękami. Jakże często zachowujemy się jak Mojżesz: patrzymy na własne braki, wymawiamy się nieśmiałością, brakiem talentów lub skomplikowaną przeszłością i mówimy w sercu: „Panie, poślij kogoś innego!”. Zapominamy, że Ten, który nas powołuje, jest Stwórcą naszych ust, serc i umysłów. On nie potrzebuje ludzkich potęg; On zamienia zwykłą pasterską laskę w narzędzie wyzwolenia, a naszą słabość napełnia mocą Ducha Świętego.
Dziś stoisz przed wyborem: czy nadal będziesz uciekać przed Bożym głosem za zasłoną wymówek, czy też oddasz Bogu to, co masz w ręku, i ruszysz w posłuszeństwie tam, dokąd On Cię posyła? Pamiętaj także o lekcji z gospody: posłuszeństwo Bogu musi być całkowite i musi zacząć się od Twojego własnego domu i serca. Oczyszczeni krwią Nowego Przymierza Jezusa Chrystusa możemy z odwagą iść naprzód, wiedząc, że Pan idzie przed nami.
MOJA DECYZJA: Panie Boże Wszechmogący, porzucam dziś wszelkie wymówki, lęk przed ludźmi i poczucie własnej nieudolności. Wyznaję, że Ty jesteś moim Stwórcą i Zbawicielem. Oddaję w Twoje ręce moje życie, moje talenty, moją pracę i moją rodzinę. Oczyszczony krwią Jezusa Chrystusa mówię: „Oto jestem, poślij mnie!”. Wybieram wierność Twojemu Słowu i posłuszeństwo Twojej woli każdego dnia.

MODLITWA NA 4 LISTOPADA
Wszechmogący i Święty Boże, Ojcze Abrahama, Izaaka i Jakuba, Boże Przymierza i Zbawicielu uciśnionych!
Staję przed Tobą w tę środę z sercem pełnym czci i wdzięczności. Dziękuję Ci za świadectwo czwartego rozdziału Księgi Wyjścia, który odsłania Twoją niewyczerpaną cierpliwość wobec ludzkiej słabości i Twoją suwerenną moc panującą nad wszelkim stworzeniem.
Wybacz mi, Panie, każdą chwilę niewiary, gdy wymawiałem się własną nieudolnością, ociągałem się z posłuszeństwem Twojemu wezwaniu i uciekałem przed odpowiedzialnością za powierzone mi zadania. Przebacz mi chwile, gdy bardziej bałem się opinii ludzi i potęgi świata niż Twojego świętego Imienia. Oczyść moje usta, uświęć moje myśli i usuń z mego serca wszelki lęk.
Dziękuję Ci za Pana Jezusa Chrystusa — Proroka większego niż Mojżesz, który bez wahania i bez wymówek przyszedł na ten świat, by stać się naszym Oblubieńcem i odkupić nas własną krwią na krzyżu. Dziękuję Ci, że w Jego imieniu mamy zwycięstwo nad pradawnym wężem i uleczenie ze śmiertelnego trądu grzechu.
Napełnij mnie Twoim Duchem Świętym. Daj mi odwagę zwiastowania Twojej prawdy, dar braterskiej jedności i serce gotowe do oddania Ci czci w każdym doświadczeniu. Spraw, bym widząc Twoje nawiedzenie i opiekę nad moim życiem, zawsze skłaniał głowę w dziękczynnym uwielbieniu. Przez Jezusa Chrystusa, naszego Pana i Zbawiciela. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj osobiście cały czwarty rozdział Księgi Wyjścia (Wj 4:1–31) w przekładzie UBG.
☐ Zastanów się i wypisz na kartce: co jest „laską w Twoim ręku” — jaki konkretny talent, narzędzie lub zasób możesz dziś oddać Bogu na służbę?
☐ Podejmij świadomą decyzję o zaniechaniu jednej wymówki, którą dotychczas usprawiedliwiałeś brak zaangażowania duchowego lub zaniedbanie dobra.
☐ Zbadaj swoje serce i dom: czy nie ma w Twoim życiu sfery nieposłuszeństwa, którą należy niezwłocznie uporządkować w świetle Bożego Prawa?
☐ Wyraź słowną wdzięczność lub wyślij słowa wsparcia do swojego brata/siostry w wierze (swojego „Aarona”), z którym współpracujesz lub służysz.
☐ Przeczytaj fragmenty Nowego Testamentu o Chrystusie jako Słowie (J 1:1–14) i Pogromcy węża (Łk 10:19; Ap 12:11).
☐ Pomódl się o uciemiężonych, cierpiących i prześladowanych chrześcijan na świecie, prosząc Boga o ich ocalenie i umocnienie wiary.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 5 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 36 — „KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY”
Czytanie: Wj 5:1–23. Mojżesz i Aaron stają po raz pierwszy przed obliczem władcy egipskiego imperium z suwerennym żądaniem Boga: „Wypuść mój lud!”. Faraon odpowiada bezczelnym buntem: „Kim jest PAN, abym miał słuchać Jego głosu?”, i nakazuje podwojenie ciężarów niewoli. Zamiast natychmiastowego triumfu przychodzi bolesna próba wiary i rozczarowanie uciemiężonego ludu. Wróć jutro, aby odkryć, jak Bóg działa w dolinie próby!`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day35-lesson.txt
const lessonTxtPath = path.join(process.cwd(), 'scripts/content/kc-day35-lesson.txt');
fs.writeFileSync(lessonTxtPath, lessonFullText, 'utf8');
console.log(`✅ Zapisano ${lessonTxtPath}`);

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
          top: 1276, // ~2.25 cm
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
          new TextRun({ text: TITLE, size: 34, bold: true, color: '0F2942' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: SUBTITLE, size: 22, italics: true, color: '4A5568' }),
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

        // Numerowane podsekcje (np. "1. Tytuł (4:1)")
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

        // Pytania quizu lub punktory
        if (trimmed.startsWith('• ') || trimmed.startsWith('☐ ')) {
          return new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: trimmed, size: 22 })
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
const docxPath = 'C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_35_2026-11-04.docx';
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPath} (${buf.length} bajtów)`);

// 3. Budujemy kompletny 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 35 (4 listopada 2026): Znaki wiary, powołanie i powrót do Egiptu — Boża moc w ludzkiej słabości (Wj 4:1–31)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Piąty

Czy wiesz, że Ten, który powołał Cię do życia i obdarzył swoim świętym tchnieniem, nie oczekuje od Ciebie ludzkiej samowystarczalności ani wymownej perfekcji, lecz pragnie napełnić Twoją bezradność mocą swojego Ducha?

Zatrzymaj się w ten środowy poranek, czwartego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w prawdzie na swoje serce. Wypowiedz przed Ojcem w niebie to intymne, szczere pytanie: Tato, dlaczego tak często chowam się za paraliżującym poczuciem własnej nieudolności, powtarzając, że się nie nadaję i że powinieneś posłać kogoś innego, zamiast z wiarą zaufać, że Twoja wszechmoc doskonali się w mojej słabości? W czwartym rozdziale Księgi Wyjścia stajemy świadkami niezwykłego zmagania człowieka z Bożym wezwaniem. Po objawieniu Imienia przy płonącym krzewie Mojżesz wciąż drży z lęku przed odrzuceniem: „A jeśli mi nie uwierzą i nie usłuchają mego głosu?”. Wtedy Bóg pyta go z czułością i autorytetem: „Co masz w ręku?”. Mojżesz odpowiada krótko: „Laskę”. Zwykły, wysuszony kij pasterski! Bóg nakazuje mu rzucić go na ziemię, a laska zamienia się w węża — symbol egipskiej pychy i faraona. Lecz gdy na Boży rozkaz Mojżesz chwyta gada za ogon, ten z powrotem staje się laską! Potem Bóg każe mu włożyć dłoń w zanadrze: ręka staje się biała od śmiertelnego trądu, a po ponownym włożeniu zostaje całkowicie uzdrowiona! A gdy Mojżesz wciąż wymawia się ociężałością ust i prosi o posłanie kogoś innego, Bóg przypomina mu odwieczną prawdę: Kto dał człowiekowi usta? Czyż nie Ja, Pan? Idź, a Ja będę z twoimi ustami i nauczę cię, co masz mówić! Bóg posyła mu także brata Aarona, aby szli ramię w ramię. Prawda Ewangelii jaśnieje dziś z niewzruszoną potęgą: w Jezusie Chrystusie Bóg nie posłał kogoś innego — On sam zstąpił na ziemię jako Słowo, które stało się ciałem! Na krzyżu Golgoty Jezus starł głowę pradawnego węża, oczyścił nas ze śmiertelnego trądu grzechu swoją bezcenną krwią i uczynił nas dziećmi Najwyższego!

Jezus mówi dziś do Ciebie:
I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić. (Księga Wyjścia, rozdział czwarty, wersety jedenasty i dwunasty, UBG)

Zadanie Taktyczne:
Zmiażdż dzisiaj wszelkie wymówki i lęki na swoim środowym posterunku. Przestań wmawiać sobie, że jesteś zbyt słaby, zbyt mało wymowny lub zbyt niedoskonały, by Bóg mógł przez Ciebie działać. Twoim dzisiejszym rozkazem jest oddać Bogu to, co masz w ręku — Twoje codzienne obowiązki, pracę, prosty gest miłości czy słowo otuchy. Gdy czujesz opór przed trudną rozmową lub zadaniem, nie uciekaj, lecz wyznaj z wiarą: „Pan jest ze mną, On uzdalnia moje usta i prowadzi moje kroki!”.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
„Ojcze w niebie, Stwórco moich ust, mojego umysłu i całego mego życia! Wybacz mi każdą wymówkę, przez którą uciekałem przed Twoją wolą i chowaniem się za własną nieudolnością. Dziękuję Ci, Panie Jezu, że Twoja łaska wystarcza w każdej mojej słabości. Ty zwyciężyłeś szatana na krzyżu i obmyłeś mnie swoją świętą krwią. Oddaję Ci moją codzienność — uświęć moje usta, napełnij moje serce odwagą i poślij mnie tam, gdzie ktoś potrzebuje Twojej nadziei i miłości. Tobie chwała na wieki. Amen.”

Rozkaz Dnia (Zadbaj o wzrost):
Wzrastaj codziennie w Słowie Bożym. Dołącz do naszej armii ludzi z pasją, zaproś bliskich i przejdź z nami całe Pismo Święte w projekcie „Z Biblią za Pan Brat”.

Błogosławieństwo:
Niech Wszechmogący Bóg napełni Twoje usta mądrością, uleczy wszelki lęk w Twoim sercu i prowadzi Cię w zwycięstwie przez wszystkie ścieżki dzisiejszego dnia. Dobrej, błogosławionej środy w obecności Pana!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 35 (4 listopada 2026 r.)
📖 Księga Wyjścia 4:1–31: Znaki wiary, powołanie i powrót do Egiptu — Boża moc w ludzkiej słabości

Czy zdajesz sobie sprawę, że Bóg nigdy nie pyta o to, czego Ci brakuje, lecz pyta o to, co masz w ręku, aby napełnić to swoją nadprzyrodzoną mocą?

W 35. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia/kurscodzienny) wkraczamy w kulminacyjny dialog powołania Mojżesza pod górą Horeb (Wj 4:1–31). Mimo wielkich obietnic Bożych Mojżesz wciąż zmaga się z lękiem przed odrzuceniem przez rodaków: „A jeśli mi nie uwierzą i nie usłuchają mego głosu?” (Wj 4:1). W odpowiedzi Bóg wyposaża go w trzy monumentalne znaki:
1. Laska zamieniona w węża (Wj 4:2–5) — symbol władzy nad pychą faraona (egipski Ureusz) i demonicznymi siłami chaosu. Chwycenie gada za ogon to triumf bezwzględnego posłuszeństwa.
2. Ręka trędowata i uleczona (Wj 4:6–8) — manifestacja Bożej suwerenności nad życiem, śmiercią i grzechem. Ten sam Bóg, który dopuścił ucisk, ma moc całkowitego uzdrowienia swego ludu.
3. Woda Nilu w krew (Wj 4:9) — zwiastun sądu nad bóstwami Egiptu i pogańskim imperium.

Gdy Mojżesz wymawia się ociężałością ust („nie jestem wymowny”), Bóg odpowiada słowami, które na zawsze kładą kres ludzkim kompleksom:
> „Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.” (Wj 4:11–12, UBG)

A gdy Mojżesz wciąż prosi o posłanie kogoś innego, Bóg w sprawiedliwym gniewie powołuje jego brata Aarona Lewitę na rzecznika (Wj 4:14–16), ukazując siłę braterskiej wspólnoty. W drodze do Egiptu dochodzi do dramatycznego epizodu w gospodzie (Wj 4:24–26): zaniedbane obrzezanie syna omal nie kosztuje Mojżesza życia, lecz krew przymierza przelana przez Seforę przynosi przebłaganie. Rozdział kończy się zjednoczeniem braci na Horebie, zwołaniem starszych w Egipcie i wielkim triumfem wiary: „I lud uwierzył... skłonili głowy i oddali pokłon” (Wj 4:31).

Trzy filary teologiczne na dziś:
1. Boża moc w ludzkiej laseczce (Wj 4:2): Bóg nie potrzebuje ludzkich koron. On bierze to, co proste i wzgardzone — pasterski kij — i czyni zeń „laskę Boga” (Wj 4:20).
2. Krew Przymierza (Wj 4:24–26): Bóg wymaga bezwzględnej wierności we własnym domu. Krew obrzezania zapowiada krew Golgoty — jedyną tarczę chroniącą przed sądem.
3. Wiara uciemiężonych (Wj 4:31): Bóg widzi ucisk i zstępuje, a Jego Słowo rodzi wiarę i liturgiczny pokłon uwielbienia.

Studiuj kody Stronga (H4294 matteh, H5175 nahasz, H6883 caraat, H1818 dam) i pełny komentarz egzegetyczny w MojejBiblii CC: https://polskieradio.cc/mojabiblia oraz na stronie Akademii: https://polskieradio.cc/akademia/kurscodzienny/dzien-35

Zadanie Taktyczne (Czytaj | Wierz | Działaj):
* CZYTAJ: Przeczytaj uważnie cały 4. rozdział Księgi Wyjścia oraz fragment Hbr 3:1–6.
* WIERZ: Zaufaj, że Stwórca Twoich ust i serca uzdalnia Cię do każdego zadania, które przed Tobą stawia.
* DZIAŁAJ: Zrezygnuj dziś z wymówek, uporządkuj zaniedbane sprawy w swoim domu i wesprzyj brata lub siostrę w wierze.

Wszystkie materiały, narzędzia interlinearne i audio w ekosystemie Christian Culture są całkowicie bezpłatne. Jeśli pragniesz współtworzyć to dzieło, dołącz do naszych Patronów: https://polskieradio.cc/wspieraj

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 35 (Wj 4:11–12): Bóg pyta dziś Ciebie: „Kto dał człowiekowi usta? Czyż nie Ja, PAN? Idź, a Ja będę z tobą!”. Zostaw wymówki i lęki. Oddaj w Jego ręce to, co masz. Przedwieczny czuwa nad Twoim domem i obdarza Cię pokojem. Błogosławionej nocy! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[SCENA: STUDIO CHRISTIAN CULTURE TV — WARSZAWA]
[Eleganckie studio w tonacji głębokiego granatu, obsydianu i szlachetnego złota. Na ekranie głównym grafika: pasterz Mojżesz o poranku na pustyni u stóp góry Horeb, trzymający pasterską laskę, a w oddali sylwetka Aarona idącego na spotkanie pod złotym niebem. Złoty napis: DZIEŃ 35 — ZNAKI WIARY I BOŻA MOC W LUDZKIEJ SŁABOŚCI.]
[Prowadzące: Noemi i Sara — profesjonalne, pełne ciepła, biblijnego autorytetu i pasji.]

[INTRO: 0:00–0:45]
Noemi: Dzień dobry! Witamy państwa bardzo serdecznie w ten środowy poranek, czwartego listopada dwa tysiące dwudziestego szóstego roku, na antenie Christian Culture TV!
Sara: Kontynuujemy naszą niezwykłą, 66-miesięczną podróż przez wszystkie księgi Pisma Świętego w formacyjnym programie „Z Biblią za Pan Brat”. Dziś otwieramy czwarty rozdział Księgi Wyjścia.
Noemi: To rozdział, w którym każdy z nas może przejrzeć się jak w lustrze! Rozdział o ludzkich wątpliwościach, cudownych znakach, o Bożej cierpliwości i o powrocie do uciemiężonego ludu!

[ROZWINIĘCIE: 0:45–3:30]
Sara: Pomyślmy o Mojżeszu. Po wielkim objawieniu Imienia JHWH przy płonącym krzewie wciąż mówi: „Panie, a jeśli mi nie uwierzą?”. Czterdzieści lat temu chciał wyzwolić Izrael siłą swoich mięśni — poniósł klęskę i musiał uciekać. Teraz, gdy ma osiemdziesiąt lat, boi się porażki.
Noemi: I popatrzmy na genialną pedagogikę Boga! Bóg pyta: „Co masz w ręku?”. Zwykłą laskę pasterską! Bóg mówi: „Rzuć ją na ziemię”. Laska staje się wężem! Mojżesz ucieka, ale Bóg nakazuje mu chwycić go za ogon. Wąż w Egipcie — słynny Ureusz na koronie faraona — symbolizował śmiertelną potęgę imperium. Bóg pokazuje: Ja panuję nad twoim największym wrogiem!
Sara: A potem drugi znak: ręka włożona w zanadrze staje się trędowata, a po chwili znów zdrowa. Bóg ma władzę nad grzechem, chorobą i życiem! I trzeci znak: woda z Nilu, bóstwa Egipcjan, która staje się krwią na ziemi!
Noemi: A jednak Mojżesz dalej szuka wymówek: „Panie, nie jestem wymowny, mam ociężałe usta!”. I wtedy padają słowa, które każdy z nas powinien wyryć w swoim sercu: „Kto dał człowiekowi usta? Albo kto czyni niemym lub ślepym? Czyż nie Ja, PAN? Idź, a Ja będę z twoimi ustami!”.
Sara: Bóg nie szuka oratorskich gwiazd ani celebrytów pewnych siebie. Bóg szuka ludzi pokornych, którzy oddadzą Mu to, co mają w ręku! A gdy Mojżesz wciąż się lęka, Bóg posyła mu brata Aarona, by szli razem, ramię w ramię!

[SZCZYT CHRYSTOCENTRYCZNY: 3:30–5:00]
Noemi: W tym rozdziale mamy też dramatyczny epizod w drodze: przymierze obrzezania i słowa Sefory o „oblubieńcu krwi”. Dlaczego to takie ważne? Bo nikt nie może służyć Bogu, lekceważąc Jego przykazania we własnym domu!
Sara: I to prowadzi nas prosto na Golgotę! Jezus Chrystus jest naszym jedynym i prawdziwym Oblubieńcem Krwi! To On przelał swoją krew za nas na krzyżu, pokonał pradawnego węża i uleczył nas ze śmiertelnego trądu potępienia! Mojżesz wymawiał się słabością, ale Jezus powiedział w Getsemane: „Nie moja, lecz Twoja wola niech się stanie!”.

[ZADANIE TAKTYCZNE I MODLITWA: 5:00–6:30]
Noemi: Nasze zadanie taktyczne na tę środę: Przestań mówić Bogu, czego nie potrafisz! Oddaj Mu swoją pasterską laskę — Twoje codzienne talenty i pracę. I pamiętaj: Bóg będzie z Twoimi ustami w każdej rozmowie!
Sara i Noemi razem: „Wszechmogący Boże, dziękujemy Ci, że Ty znasz nasze słabości i nie odrzucasz nas z powodu naszych lęków. Panie Jezu, Ty jesteś Zwycięzcą nad grzechem i śmiercią. Oddajemy Ci nasze serca i nasze domy. Uświęć nasze usta i naucz nas głosić Twoją prawdę z odwagą i miłością. Tobie niech będzie chwała na wieki wieków. Amen!”

[OUTRO: 6:30–7:00]
Noemi: Dziękujemy za wspólne studiowanie Słowa Bożego! Pamiętajcie, że pełny tekst studium, 20 pytań quizu i interaktywne narzędzia czekają na Was na portalu polskieradio.cc/akademia.
Sara: Błogosławionego, pełnego pokoju i odwagi dnia! Do zobaczenia jutro w piątym rozdziale Księgi Wyjścia!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: ZNAKI WIARY, TEOLOGIA POWOŁANIA I PRZYMIERZE KRWI W CZWARTYM ROZDZIALE KSIĘGI WYJŚCIA
**Księga Wyjścia — Miesiąc 2 | Dzień 35 (4 listopada 2026 r.)**

W ramach ogólnopolskiego programu badań biblijnych „Z Biblią za Pan Brat”, redakcja leksykonu teologicznego portalu informacyjnego CCN publikuje monograficzne studium egzegetyczne czwartego rozdziału Księgi Wyjścia (Wj 4:1–31). Perykopa ta stanowi kluczowy węzeł teologiczny Pentateuchu: bada psychologię ludzkiego oporu wobec powołania, odsłania semiotykę trzech cudownych znaków uwierzytelniających, formułuje doktrynę Bożego synostwa Izraela oraz przypomina o bezwzględnej konieczności posłuszeństwa przymierzu krwi.

1. Semiotyka trzech znaków u stóp Horebu (Wj 4:1–9)
Sceptycyzm Mojżesza („A jeśli mi nie uwierzą...?”) zostaje przez Boga skonfrontowany z pytaniem o to, czym człowiek realnie dysponuje: „Co masz w ręku?”. Laska pasterska (hebr. matteh), narzędzie prostego nomady, w kontakcie z ziemią ulega metamorfozie w węża (hebr. nahasz). W kontekście wierzeń egipskich wąż kobry (Ureusz) był insygnium boskiej suwerenności faraona i personifikacją opiekuńczej bogini Wadżet. Nakaz pochwycenia gada za ogon — wbrew elementarnym zasadom bezpieczeństwa — stanowił test bezwzględnego zaufania Słowu Bożemu.
Drugi znak — dłoń dotknięta trądem (hebr. caraat) i natychmiast uleczona — proklamuje suwerenność JHWH nad zepsuciem, nieczystością rytualną i biologiczną śmiercią.
Trzeci znak — eschatologiczna zapowiedź pierwszej plagi: woda Nilu zamieniona w krew (hebr. dam) na suchym lądzie — uderza w fundament teologii państwowej Egiptu, w której Nil ubóstwiany był jako bóstwo Hapi i ozyriańskie źródło nieśmiertelności.

2. Teologia stworzenia a ludzkie ułomności (Wj 4:10–17)
Próba uchylenia się od misji za pomocą argumentu o wadzie wymowy (hebr. kewad peh u-kewad laszon — „ociężałość ust i języka”) spotyka się z pryncypialną deklaracją teologii stworzenia: „Kto dał człowiekowi usta? (...) Czyż nie Ja, PAN?” (Wj 4:11). W myśli biblijnej ludzkie ułomności nie stanowią bariery dla Bożej misji, lecz stają się przestrzenią objawienia łaski (por. 2 Kor 12:9). Zapalenie się gniewu Bożego w obliczu słów: „poślij kogo innego” (Wj 4:13–14) wskazuje na moralną niedopuszczalność trwania w niewierze po otrzymaniu obietnicy asystencji Ducha. Wprowadzenie Aarona Lewity jako rzecznika (hebr. nabi — proroka) ustanawia model kolegialnego przywództwa w ludzie Bożym.

3. Izrael jako syn pierworodny i tajemnica w gospodzie (Wj 4:21–26)
Wersety 21–23 zawierają pierwszą w Starym Testamencie proklamację narodowego synostwa: „Izrael jest moim synem, moim pierworodnym” (hebr. beni bechori Jisrael). Zależność ta wyznacza oś teologiczną wyzwolenia: odrzucenie prawa Boga do Jego pierworodnego skutkuje sądem nad pierworodnymi Egiptu.
Tym większego dramatyzmu nabiera epizod w gospodzie (Wj 4:24–26), gdzie Bóg nastaje na życie Mojżesza z powodu zaniechania obrzezania syna (por. Rdz 17:14). Paradoks polega na tym, że przywódca niosący wolność synowi pierworodnemu sam zaniedbał znak przymierza we własnym domu. Błyskawiczna interwencja Sefory, która nożem krzemiennym dokonuje obrzezania i dotyka stóp męża, nazywając go „oblubieńcem krwi” (hebr. chatan damim), przywraca porządek przymierza i odwraca gniew Boży. Bez przelania krwi nie ma ocalenia.

4. Braterska koinonia i liturgia uwielbienia (Wj 4:27–31)
Zakończenie rozdziału harmonizuje wcześniejsze napięcia: spotkanie Mojżesza z Aaronem na Horebie, zwołanie starszych synów Izraela i publiczna demonstracja znaków prowadzą do przełamania zwątpienia: „I lud uwierzył” (Wj 4:31). Słysząc, że Bóg „nawiedził” swój lud (hebr. pakad JHWH), udręczeni niewolnicy skłaniają głowy i oddają pokłon (hebr. wa-jikkedu wa-jisztachawu). Posłannictwo kończy się liturgią uwielbienia Boga Przymierza.

5. Szczyt chrystologiczny: Jezus Chrystus — Pełnia Słowa i Zwycięzca Węża
W optyce Nowego Testamentu Wj 4 zapowiada zbawcze dzieło Jezusa Chrystusa:
- Jezus jest większy niż Mojżesz: Mojżesz zmagał się ze słabością mowy, Chrystus jest Słowem Wcielonym (J 1:14; Hbr 3:1–6);
- Zwycięstwo nad wężem: Na krzyżu Chrystus zniweczył potęgę diabła (Hbr 2:14; Ap 12:9–11);
- Oczyszczenie z trądu: Przez swoją krew Jezus uleczył śmiertelny trąd grzechu (Mt 8:1–3; 1 J 1:7);
- Oblubieniec Krwi: Jezus nabył Kościół nie krzemiennym nożem, lecz krwią Nowego Przymierza (Mt 26:28; Ef 5:25–27);
- Nawiedzenie odkupieńcze: Wcielenie Chrystusa stanowi definitywne nawiedzenie ludzkości przez Boga (Łk 1:68; 7:16).

📌 PODSUMOWANIE REDAKCYJNE CCN
Czwarty rozdział Księgi Wyjścia uczy, że Bóg nie powołuje uzdolnionych, lecz uzdalnia powołanych. Prawdziwa moc w służbie Królestwa Bożego rodzi się ze złamania ludzkiej pychy, bezwzględnego posłuszeństwa przymierzu i zaufania Temu, który w Chrystusie pokonał wszelkie moce zła.

*Wszystkie materiały formacyjne i publicystyczne w ekosystemie Christian Culture są całkowicie bezpłatne. Dołącz do naszej bazy subskrybentów i śledź codzienne analizy w ramach projektu „Z Biblią za Pan Brat”.*

🌐 **Źródła i powiązane serwisy:** [polskieradio.cc](https://www.polskieradio.cc) | [polskieradio.cc/lumina](https://www.polskieradio.cc/lumina) | [cclite.pl](https://www.cclite.pl)  
💬 *Dołącz do społeczności:* [Grupa WhatsApp CCN / CC](https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0)
`;

const pakietPath = path.join(process.cwd(), 'scripts/content/pakiet-day35-5wersji.md');
fs.writeFileSync(pakietPath, pakiet5Wersji, 'utf8');
console.log(`✅ Zapisano ${pakietPath}`);

console.log('🎉 KOMPLETNA LEKCJA I PAKIET DNIA 35 WYGENEROWANE Z SUKCESEM!');
