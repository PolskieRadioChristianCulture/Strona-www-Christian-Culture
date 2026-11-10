import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 41: Wj 10:1–29 (10 listopada 2026, Wtorek)
const DAY_NUM = 41;
const DATE_STR = '2026-11-10';
const DATE_FORMATTED = 'Wtorek, 10 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 10:1–29';
const TITLE = 'PLAGI SZARAŃCZY I CIEMNOŚCI EGIPSKIEJ — SĄD NAD FAŁSZYWYM ŚWIATŁEM I WOLNOŚĆ BEZ KOMPROMISÓW';
const SUBTITLE = 'Sąd nad bóstwami Minem i Ra, namacalna ciemność trzydniowa i wolność bez kompromisów (Wj 10:1–29)';
const MEMORY_VERSE = '„Jeden drugiego nie widział i nikt nie wstał ze swego miejsca przez trzy dni; lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach.” (Wj 10:23, UBG)';
const THEME = 'Dziesiąty rozdział Księgi Wyjścia ukazuje dwie przedostatnie plagi przed ostatecznym wyjściem z Egiptu: plagę szarańczy i trzydniową ciemność dotykalną. Bóg obala panteon solarny Egiptu, demaskuje bezsilność bóstwa Ra i stawia granicę wszelkim duchowym kompromisom. Faraon próbuje zatrzymać dzieci i majątek Izraelitów, lecz Mojżesz wypowiada słowa niezłomnej wiary: „Ani jedno kopyto nie zostanie!”. W Jezusie Chrystusie ta prawda wypełnia się ostatecznie: On jest Światłością Świata, który wyrwał nas z ciemności i powołał do bezkompromisowej wolności Królestwa Bożego.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 41 (Wj 10:1–29)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 41
PLAGI SZARAŃCZY I CIEMNOŚCI EGIPSKIEJ — SĄD NAD FAŁSZYWYM ŚWIATŁEM I WOLNOŚĆ BEZ KOMPROMISÓW
Sąd nad bóstwami Minem i Ra, namacalna ciemność trzydniowa i wolność bez kompromisów (Wj 10:1–29)
Wtorek, 10 listopada 2026 r.  |  Czytanie: Wj 10:1–29
TEKST PAMIĘCIOWY: „Jeden drugiego nie widział i nikt nie wstał ze swego miejsca przez trzy dni; lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach.” (Wj 10:23, UBG)
MYŚL PRZEWODNIA: Dziesiąty rozdział Księgi Wyjścia ukazuje dwie przedostatnie plagi przed ostatecznym wyjściem z Egiptu: plagę szarańczy i trzydniową ciemność dotykalną. Bóg obala panteon solarny Egiptu, demaskuje bezsilność bóstwa Ra i stawia granicę wszelkim duchowym kompromisom. Faraon próbuje zatrzymać dzieci i majątek Izraelitów, lecz Mojżesz wypowiada słowa niezłomnej wiary: „Ani jedno kopyto nie zostanie!”. W Jezusie Chrystusie ta prawda wypełnia się ostatecznie: On jest Światłością Świata, który wyrwał nas z ciemności i powołał do bezkompromisowej wolności Królestwa Bożego.

ZANIM OTWORZYSZ BIBLIĘ
Dziesiąty rozdział Księgi Wyjścia wprowadza nas w bezpośrednie preludium do nocy paschalnej i ostatecznego wyzwolenia ludu przymierza. Po gradobiciu i ogniu, które zniszczyły len i jęczmień, pogański Egipt staje w obliczu dwóch najbardziej dewastujących plag w wymiarze biologicznym i religijnym: niszczycielskich chmar szarańczy oraz nieprzeniknionej, trzydniowej ciemności, której można było niemal dotknąć dłonią.
W rozdziale tym obserwujemy narastający bunt dworzan przeciwko uporowi faraona („Czyż jeszcze nie wiesz, że Egipt ginie?” — Wj 10:7) oraz serię podstępnych propozycji kompromisowych monarchy. Faraon zgadza się na kult pod warunkiem zatrzymania dzieci jako zakładników w Egipcie, a następnie proponuje wyjście rodzin z pozostawieniem stad jako zastawu majątkowego. Odpowiedź Mojżesza: „Ani jedno kopyto nie zostanie!” (Wj 10:26) przechodzi do kanonu biblijnej teologii wolności — prawdziwe uwielbienie Boga obejmuje całego człowieka: jego rodzinę, dzieci, powołanie i wszystkie dobra materialne.
Kulminacją rozdziału jest dziewiąta plaga — całkowite zaćmienie słońca, uderzające w serce religii państwowej imperium, czyli w bóstwo słońca Ra i Amona. Przez 72 godziny cały Egipt zostaje sparaliżowany nieprzeniknionym mrokiem, podczas gdy w domach synów Izraela w krainie Goszen jaśnieje Boże światło. W Jezusie Chrystusie ten kontrast zyskuje wymiar wieczny: Ten, który na Golgocie wziął na siebie ciemność sądu, wyprowadza nas z mroku grzechu i czyni dziećmi światłości.

TEKST PISMA ŚWIĘTEGO — CZYTANIE DNIA (WJ 10:1–29, UBG)
1 Potem PAN powiedział do Mojżesza: Idź do faraona, gdyż ja uczyniłem ciężkim jego serce i serca jego sług, abym mógł uczynić te moje znaki wśród nich;
2 I abyś opowiadał swemu synowi i swemu wnukowi to, co uczyniłem w Egipcie, i o moich znakach, które uczyniłem wśród nich, abyście poznali, że ja jestem PAN.
3 Mojżesz i Aaron przyszli więc do faraona i powiedzieli mu: Tak mówi PAN, Bóg Hebrajczyków: Jak długo będziesz się wzbraniał ukorzyć przede mną? Wypuść mój lud, aby mi służył.
4 Bo jeśli będziesz się wzbraniał wypuścić mój lud, oto jutro sprowadzę szarańczę na twoje granice;
5 I pokryje ona powierzchnię ziemi, tak że nie będzie można widzieć ziemi. Pożre resztkę tego, co ocalało, to, co wam zostało po gradzie, i ogryzie wszelkie drzewo, które wam rośnie na polu.
6 I napełni twoje domy i domy wszystkich twoich sług, i domy wszystkich Egipcjan, czego nie widzieli twoi ojcowie ani ojcowie twoich ojców od dnia, kiedy pojawili się na ziemi, aż do dziś. Wtedy odwrócił się i wyszedł od faraona.
7 I słudzy faraona powiedzieli do niego: Jak długo ten człowiek będzie dla nas sidłem? Wypuść tych ludzi, aby służyli PANU, swemu Bogu. Czyż jeszcze nie wiesz, że Egipt ginie?
8 Sprowadzono więc z powrotem Mojżesza i Aarona do faraona, a on powiedział do nich: Idźcie, służcie PANU, swemu Bogu. Lecz kto ma pójść?
9 A Mojżesz odpowiedział: Pójdziemy z naszymi dziećmi i z naszymi starcami, z naszymi synami i z naszymi córkami, z naszymi owcami i z naszymi wołami pójdziemy, bo mamy święto dla PANA.
10 Wtedy powiedział do nich: Niech tak PAN będzie z wami, jak ja wypuszczę was i wasze dzieci! Patrzcie, bo zło jest przed wami.
11 Nie tak! Idźcie wy, dorośli mężowie, i służcie PANU, bo tego żądaliście. I wypędzono ich sprzed oblicza faraona.
12 Wtedy PAN powiedział do Mojżesza: Wyciągnij swą rękę nad ziemię Egiptu z powodu szarańczy, aby naszła na ziemię Egiptu i pożarła wszelką roślinność ziemi, wszystko, co pozostawił grad.
13 I Mojżesz wyciągnął swą laskę nad ziemię Egiptu, a PAN sprowadził wschodni wiatr na tę ziemię przez cały ów dzień i całą noc. A gdy nastał poranek, wschodni wiatr przyniósł szarańczę.
14 I naszła szarańcza na całą ziemię Egiptu, i osiadła na wszystkich granicach Egiptu w wielkim mnóstwie. Przedtem nie było takiej szarańczy jak ta ani po niej takiej nie będzie.
15 Pokryła bowiem powierzchnię całej ziemi, tak że ziemia pociemniała. Pożarła wszelką roślinność ziemi i wszelki owoc drzew, który pozostawił grad. I nie zostało nic zielonego na drzewach ani na roślinności polnej w całej ziemi Egiptu.
16 Wtedy faraon pośpiesznie zawołał Mojżesza i Aarona i powiedział: Zgrzeszyłem przeciwko PANU, waszemu Bogu, i przeciwko wam.
17 Teraz więc przebacz, proszę, mój grzech tylko ten raz i módlcie się do PANA, waszego Boga, aby oddalił ode mnie tylko tę śmierć.
18 Wyszedł więc od faraona i modlił się do PANA.
19 A PAN zmienił wiatr na bardzo gwałtowny wiatr zachodni, który uniósł szarańczę i wrzucił ją do Morza Czerwonego; nie została ani jedna szarańcza na wszystkich granicach Egiptu.
20 Lecz PAN zatwardził serce faraona i nie wypuścił synów Izraela.
21 Potem PAN powiedział do Mojżesza: Wyciągnij swą rękę ku niebu, a nastanie ciemność nad ziemią Egiptu, tak że będzie można dotknąć ciemności.
22 I Mojżesz wyciągnął swą rękę ku niebu, i nastała gęsta ciemność w całej ziemi Egiptu przez trzy dni.
23 Jeden drugiego nie widział i nikt nie wstał ze swego miejsca przez trzy dni; lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach.
24 Wtedy faraon zawołał Mojżesza i powiedział: Idźcie, służcie PANU, tylko wasze owce i wasze woły niech zostaną; wasze dzieci również mogą iść z wami.
25 Mojżesz odpowiedział: Ty musisz dać nam też w nasze ręce ofiary i całopalenia, abyśmy złożyli ofiarę PANU, naszemu Bogu.
26 Także nasze stada pójdą z nami, nie zostanie ani jedno kopyto, gdyż z nich weźmiemy na służbę PANU, naszemu Bogu; a dopóki tam nie przybędziemy, sami nie wiemy, czym będziemy służyć PANU.
27 Lecz PAN zatwardził serce faraona i nie chciał ich wypuścić.
28 I faraon powiedział do niego: Idź precz ode mnie! Strzeż się, abyś więcej nie widział mego oblicza, bo w tym dniu, w którym ujrzysz me oblicze, umrzesz.
29 Mojżesz odpowiedział: Dobrze powiedziałeś, więcej już nie ujrzę twego oblicza.

CZĘŚĆ I — SĄD NAD PYCHĄ I ZAPOWIEDŹ SZARAŃCZY (WJ 10:1–6)
1. Pedagogika przymierza dla pokoleń (10:1–2): Bóg objawia Mojżeszowi nadrzędny cel znaków: przekazywanie prawdy o Bożej suwerenności dzieciom i wnukom.
2. Ciężar nieugiętego serca (10:1b): Uczynienie ciężkim serca faraona odsłania sprawiedliwy sąd nad monarchą, który zamknął się na prawdę.
3. Wezwanie do pokory (10:3): „Jak długo będziesz się wzbraniał ukorzyć przede mną?” — sednem buntu człowieka jest pycha odrzucająca panowanie Boga.
4. Groźba ósmej plagi (10:4): Odmowa wypuszczenia ludu skutkuje zapowiedzią szarańczy, która przekroczy granice Egiptu.
5. Zasłonięcie oblicza ziemi (10:5a): Rój szarańczy ma być tak gęsty, że ludzkie oko nie będzie mogło dojrzeć powierzchni ziemi.
6. Pożarcie resztek po gradzie (10:5b): Szarańcza niszczy wszelkie ocalałe rośliny i drzewa, dopełniając ruinę egipskiego rolnictwa.
7. Naruszenie pałaców i domostw (10:6a): Plaga wkracza w sferę prywatną monarchów i kapłanów, napełniając wszystkie domy w Egipcie.
8. Bezprecedensowy charakter sądu (10:6b): Kataklizm, jakiego nie widzieli przodkowie od początku stworzenia, pieczętuje historyczny wyrok Boga.

CZĘŚĆ II — BUNT SŁUG FARAONA I PUŁAPKA KOMPROMISU (WJ 10:7–11)
9. Głos rozpaczy na dworze (10:7a): Słudzy faraona po raz pierwszy otwarcie protestują przeciw uporowi króla: „Jak długo ten człowiek będzie dla nas sidłem?”.
10. Urzędowe stwierdzenie ruiny (10:7b): „Czyż jeszcze nie wiesz, że Egipt ginie?” — dwór monarchy przyznaje, że imperium leży w gruzach.
11. Ponowne wezwanie posłów (10:8): Faraon wzywa Mojżesza i Aarona, stawiając podchwytliwe pytanie: „Kto właściwie ma pójść?”.
12. Odpowiedź bezkompromisowej wiary (10:9a): Mojżesz deklaruje: pójdziemy z dziećmi, starcami, synami i córkami — nikt nie zostanie w niewoli!
13. Święto z całym dobytkiem (10:9b): Obecność stad owiec i wołów jest niezbędna, gdyż uwielbienie Pana wymaga konkretnej ofiary przymierza.
14. Szyderstwo i groźba faraona (10:10): Monarcha oskarża posłów o złe zamiary i odrzuca możliwość wypuszczenia rodzin.
15. Propozycja pozostawienia dzieci (10:11a): Tyran żąda: „Idźcie tylko wy, dorośli mężowie” — klasyczna taktyka wroga chcącego zagarnąć młode pokolenie.
16. Wypędzenie ze wzgardą (10:11b): Mojżesz i Aaron zostają gwałtownie wyrzuceni sprzed oblicza władcy, co zamyka drogę negocjacji.

CZĘŚĆ III — ÓSMA PLAGA: WSCHODNI WIATR I SĄD SZARAŃCZY (WJ 10:12–20)
17. Wyciągnięcie laski nad Nil (10:12–13a): Mojżesz posłusznie wykonuje Boże polecenie, inicjując bieg nadprzyrodzonych żywiołów.
18. Wschodni wiatr posłuszny Bogu (10:13b): Wiatr wieje przez całą dobę, niosąc z pustynnych rubieży miliardowe roje owadów.
19. Totalna inwazja granic (10:14): Szarańcza osiada na całym terytorium imperium w niespotykanej dotąd w dziejach ilości.
20. Pociemnienie ziemi i zagłada zieleni (10:15a): Ziemia staje się czarna od owadów, które pożerają każdy liść, źdźbło i owoc.
21. Klęska bóstwa rolnictwa Min (10:15b): W całym Egipcie nie pozostaje nic zielonego — bóstwa wegetacji okazują się martwą iluzją.
22. Nagłe wyznanie grzechu pod presją (10:16): Faraon wzywa Mojżesza: „Zgrzeszyłem przeciwko PANU, waszemu Bogu, i przeciwko wam”.
23. Błaganie o oddalenie śmierci (10:17): Monarcha prosi o modlitwę, traktując szarańczę jako śmiertelne zagrożenie biologiczne.
24. Zachodni wicher oczyszczenia (10:18–19): Na modlitwę Mojżesza potężny wiatr zachodni zmiata całą szarańczę w fale Morza Czerwonego — nie zostaje ani jedna!

CZĘŚĆ IV — DZIEWIĄTA PLAGA: DOTYKALNA CIEMNOŚĆ I ŚWIATŁO W GOSZEN (WJ 10:21–23)
25. Ręka ku niebu bez ostrzeżenia (10:21a): Dziewiąta plaga — podobnie jak trzecia i szósta — spada natychmiastowo na rozkaz Boży.
26. Dotykalny mrok sądowy (10:21b): Zjawisko „yamasz choszech” — ciemność tak gęsta, ciężka i wilgotna, że można było jej fizycznie dotknąć.
27. Zaćmienie boga słońca Ra (10:22): Najwyższe bóstwo państwowe imperium zostaje bezdyskusyjnie powalone na kolana i wymazane z nieba na 72 godziny.
28. Trzydniowy paraliż egzystencjalny (10:23a): Przez trzy dni żaden Egipcjanin nie widzi drugiego i nikt nie jest w stanie wstać ze swego miejsca.
29. Niewzruszone światło w Goszen (10:23b): „Lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach” — nienaruszalny pokój łaski Bożej.
30. Przedsmak rozdzielenia wiecznego: Kontrast między paraliżującym mrokiem a Bożym światłem zapowiada ostateczne rozdzielenie zbawionych i potępionych.
31. Bezsilność pogańskich świątyń: Egipscy kapłani w swoich komnatach nie mogą rozpalić ognia ani odnaleźć posągów swoich bóstw.
32. Świadectwo Bożej obecności: Światło w domach Izraela nie pochodziło z ludzkiego wysiłku, lecz z obecności Chwały JAHWE pośród Jego ludu.

CZĘŚĆ V — OSTATNI KOMPROMIS, ANI JEDNO KOPYTO I PROROCZE ROZSTANIE (WJ 10:24–29)
33. Druga oferta kompromisu (10:24): Faraon ustępuje w sprawie dzieci, lecz żąda: „Tylko wasze owce i woły niech zostaną”.
34. Zastaw majątkowy niewoli: Wróg godzi się na pobożność, jeśli tylko zachowa kontrolę nad finansami i zasobami sług Bożych.
35. Żądanie ofiar od samego monarchy (10:25): Mojżesz odpowiada śmiało: ty sam musisz dać nam w ręce ofiary i całopalenia dla naszego Boga!
36. Kanon bezkompromisowej wolności — Wj 10:26: „Także nasze stada pójdą z nami, nie zostanie ani jedno kopyto!”.
37. Służba wymagająca pełnej dyspozycyjności (10:26b): „Dopóki tam nie przybędziemy, sami nie wiemy, czym będziemy służyć PANU” — całkowite zaufanie Bożej woli.
38. Sądowe zacięcie tyrana (10:27): PAN zatwardza serce faraona, który w ślepej furii odrzuca ostatnią szansę ocalenia.
39. Śmiertelna groźba monarchy (10:28): „Strzeż się, abyś więcej nie widział mego oblicza, bo w tym dniu, w którym je ujrzysz, umrzesz!”.
40. Pieczęć prorockiego wyroku (10:29): Mojżesz odpowiada majestatycznie: „Dobrze powiedziałeś, więcej już nie ujrzę twego oblicza” — klamra zamykająca historię sądu.

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 10)
• H697 — אַרְבֶּה (arbeh): szarańcza, niezliczony rój niszczycielski zasłaniający słońce (Wj 10:4, 12–15).
• H2822 — חֹשֶׁךְ (choszech): ciemność, mrok sądowy, gęsty i namacalny (Wj 10:21–22).
• H216 — אוֹר (or): światłość, Boże światło przymierza jaśniejące w mieszkaniach Goszen (Wj 10:23).
• H6541 — פַּרְסָה (parsa): kopyto, rozdzielone kopyto; „ani jedno kopyto nie zostanie” (Wj 10:26).
• H3513 — כָּבַד (kawad): uczynić ciężkim, zatwardzić serce w pysznym uporze (Wj 10:1).
• H6031 — עָנָה (ana): ukorzyć się, uniżyć serce w posłuszeństwie przed Bogiem (Wj 10:3).

JEZUS W CENTRUM — EWANGELIA W CIENIU EGIPSKICH PLAG
1. Jezus jako Światłość Świata (Wj 10:23 a J 8:12, J 1:4–5, 9):
Podczas gdy pogański świat spowity jest paraliżującym mrokiem buntu, w Chrystusie wierzący mają wieczne światło. Jezus ogłosił: „Ja jestem światłością świata. Kto idzie za mną, nie będzie chodził w ciemności, ale będzie miał światłość życia”. Jego obecność w sercu rozprasza wszelką ciemność grzechu.
2. Trzygodzinna ciemność Golgoty (Wj 10:22–23 a Mt 27:45, Mk 15:33):
Gdy Chrystus umierał na krzyżu za nasze winy, nad całą ziemią zapadła trzydniowa w skondensowanym wymiarze ciemność od szóstej do dziewiątej godziny. Zbawiciel wszedł w najgłębszy mrok sądu i oddzielenia od Boga, abyśmy my na zawsze mieszkali w jasności Ojca.
3. „Ani jedno kopyto nie zostanie” — Całkowite Odkupienie (Wj 10:26 a 1 Tes 5:23, Rz 12:1):
Chrystus nie zawarł kompromisu z szatanem. Nie pozostawił w mocy wroga żadnej sfery naszego życia. Odkupił nas całych: ducha, duszę i ciało. Nasze dzieci, małżeństwa, talenty i dobra materialne są Jego własnością i służą Jego wiecznemu Królestwu.
4. Przejście z ciemności do Królestwa Syna (Wj 10:23 a Kol 1:13, 1 P 2:9):
Bóg „wyrwał nas z mocy ciemności i przeniósł do królestwa swego umiłowanego Syna”. Podobnie jak domy w Goszen jaśniały pośród nocy Nilu, tak Kościół powołany jest do ogłaszania cnót Tego, który wezwał nas z ciemności do cudownej swojej światłości.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 10:2 → Ps 78:4–6: Nakaz przekazywania wspaniałych dzieł Pana i Jego cudów następnym pokoleniom.
• Wj 10:3 → 1 P 5:6: „Ukórzcie się więc pod mocną ręką Boga, aby was wywyższył w stosownym czasie”.
• Wj 10:4 → Jl 1:4: Prorocza wizja sądu szarańczy jako symbolu Dnia Pańskiego i wezwania do skruchy.
• Wj 10:9 → Joz 24:15: „Ja i mój dom będziemy służyć PANU” — bezkompromisowa decyzja całej rodziny.
• Wj 10:11 → Ef 6:4: Nakaz wychowywania dzieci w karności i napomnieniu Pańskim z dala od kompromisów świata.
• Wj 10:15 → Ap 9:3: Eschatologiczny obraz szarańczy wychodzącej z dymu studni czeluści w czasie ostatecznym.
• Wj 10:21 → Iz 60:2: „Oto bowiem ciemność okryje ziemię i gęsty mrok narody, ale nad tobą wzejdzie PAN”.
• Wj 10:23 → J 8:12: „Ja jestem światłością świata. Kto idzie za mną, nie będzie chodził w ciemności”.
• Wj 10:24 → Mt 6:24: „Nie możecie służyć Bogu i mamonie” — odrzucenie zastawu majątkowego u faraona.
• Wj 10:26 → Rz 12:1: Oddanie całego swego ciała i życia na ofiarę żywą, świętą i miłą Bogu.
• Wj 10:28 → Prz 29:1: Człowiek, który mimo wielu napomnień usztywnia kark, nagle zostanie zdruzgotany bez ratunku.
• Wj 10:29 → Hbr 11:27: „Przez wiarę opuścił Egipt, nie lękając się gniewu króla, wytrwał bowiem tak, jakby widział Niewidzialnego”.

PRAWDA NA DZIŚ — 8 ZASAD PRZYMIERZA
1. Świadectwo dla pokoleń: Twoje obecne próby i Boże ocalenia są lekcją wiary, którą masz przekazać swoim dzieciom i wnukom (Wj 10:1–2).
2. Pokora warunkiem łaski: Prawdziwe nawrócenie zaczyna się od pytania: „Jak długo będziesz się wzbraniał ukorzyć?” (Wj 10:3).
3. Nie oddawaj dzieci światu: Szatan zgadza się na Twoją religijność, byleby przejąć serca i umysły młodego pokolenia (Wj 10:11).
4. Światło wśród nocy: Gdy wokół panuje gęsty mrok buntu i zwiedzenia, w domu człowieka przymierza jaśnieje Boży pokój (Wj 10:23).
5. Ani jedno kopyto: Twoja praca, finanse i majątek należą w całości do Boga — nie zostawiaj ich na pastwę kompromisów (Wj 10:26).
6. Czystość uwielbienia: Nie możemy służyć Bogu według warunków dyktowanych przez świat — to Bóg wyznacza standard kultu (Wj 10:26b).
7. Tragedia zatwardziałości: Odrzucenie kolejnych ostrzeżeń prowadzi do duchowej ślepoty i ostatecznego zerwania z łaską (Wj 10:27–28).
8. Odwaga Niewidzialnego: Prawdziwy uczeń Chrystusa nie boi się gniewu ziemskich tyranów, bo patrzy na Wiecznego Króla (Wj 10:29).

POMYŚL — PYTANIA DO REFLEKSJI OSOBISTEJ
1. Czy opowiadasz swoim dzieciom i bliskim o wielkich dziełach, które Bóg uczynił w Twoim życiu (Wj 10:2)?
2. W jakich obszarach Twojego serca wciąż toczy się walka z pychą i niechęcią do ukorzenia się przed Bogiem (Wj 10:3)?
3. Czy nie ulegasz pokusie kompromisu, pozwalając, by wzorce tego świata kształtowały Twoje dzieci (Wj 10:11)?
4. Czy w Twoim mieszkaniu i rodzinie płonie Boże światło modlitwy i pokoju pośród ciemności współczesnego świata (Wj 10:23)?
5. Czy potrafisz powiedzieć z odwagą wiary: „ani jedno kopyto nie zostanie” w odniesieniu do Twoich finansów i talentów (Wj 10:26)?
6. Czy Twoje serce jest całkowicie oddane Chrystusowi, czy też trzymasz jeszcze jakiś „zastaw” w rękach tego świata?
7. Jak reagujesz, gdy stajesz w obliczu gróźb i presji ludzi nieprzyjaznych Ewangelii (Wj 10:28–29)?
8. Czy Jezus Chrystus jest Twoją jedyną Światłością rozpraszającą wszelki lęk i paraliż?

MAŁY QUIZ — 20 PYTAŃ Z ODPOWIEDZIAMI
1. Jaki cel Bożych znaków w Egipcie został wskazany Mojżeszowi w Wj 10:1–2?
Odpowiedź: Aby opowiadał synowi i wnukowi o Bożych dziełach i poznali, że On jest PANEM (Wj 10:1–2).
2. Jakie pytanie postawili Mojżesz i Aaron faraonowi w Wj 10:3?
Odpowiedź: „Jak długo będziesz się wzbraniał ukorzyć przede mną? Wypuść mój lud, aby mi służył” (Wj 10:3).
3. Co zapowiedział Bóg przez Mojżesza w Wj 10:4–5, jeśli faraon odmówi wypuszczenia ludu?
Odpowiedź: Sprowadzenie szarańczy, która pokryje powierzchnię ziemi i pożre wszystko, co ocalało po gradzie (Wj 10:4–5).
4. Czym wyróżniała się zapowiedziana plaga szarańczy według Wj 10:6?
Odpowiedź: Czegoś takiego nie widzieli ich ojcowie ani przodkowie od początku pobytu na ziemi aż do dziś (Wj 10:6).
5. Co powiedzieli słudzy faraona do swego monarchy po wyjściu Mojżesza w Wj 10:7?
Odpowiedź: „Jak długo ten człowiek będzie dla nas sidłem? Wypuść tych ludzi, aby służyli PANU, swemu Bogu. Czyż jeszcze nie wiesz, że Egipt ginie?” (Wj 10:7).
6. Jaki pierwszy warunek kompromisowy postawił faraon w Wj 10:8–11?
Odpowiedź: Aby poszli służyć PANU wyłącznie dorośli mężowie, a dzieci zostały w Egipcie (Wj 10:11).
7. Jaka była bezkompromisowa odpowiedź Mojżesza w Wj 10:9?
Odpowiedź: „Pójdziemy z naszymi dziećmi i z naszymi starcami, z naszymi synami i z naszymi córkami, z naszymi owcami i z naszymi wołami pójdziemy, bo mamy święto dla PANA” (Wj 10:9).
8. Jak zakończyła się audiencja Mojżesza i Aarona po odrzuceniu kompromisu (Wj 10:11)?
Odpowiedź: Zostali wypędzeni sprzed oblicza faraona (Wj 10:11).
9. Jaki wiatr sprowadził plagę szarańczy na ziemię Egiptu (Wj 10:13)?
Odpowiedź: Wschodni wiatr wiejący przez cały dzień i całą noc (Wj 10:13).
10. Jak Pismo Święte opisuje rozmiar zniszczeń szarańczy w Wj 10:14–15?
Odpowiedź: Pokryła powierzchnię całej ziemi, ziemia pociemniała i nie zostało nic zielonego na drzewach ani na polach w całym Egipcie (Wj 10:14–15).
11. Co wyznał pośpiesznie wezwany faraon przed Mojżeszem i Aaronem w Wj 10:16–17?
Odpowiedź: „Zgrzeszyłem przeciwko PANU, waszemu Bogu, i przeciwko wam. Teraz więc przebacz, proszę, mój grzech tylko ten raz i módlcie się do PANA, waszego Boga, aby oddalił ode mnie tylko tę śmierć” (Wj 10:16–17).
12. W jaki sposób Bóg usunął plagę szarańczy po modlitwie Mojżesza (Wj 10:19)?
Odpowiedź: PAN zmienił wiatr na bardzo gwałtowny wiatr zachodni, który uniósł szarańczę i wrzucił ją do Morza Czerwonego (Wj 10:19).
13. Ile szarańczy pozostało w granicach Egiptu po interwencji zachodniego wiatru (Wj 10:19)?
Odpowiedź: Nie została ani jedna szarańcza na wszystkich granicach Egiptu (Wj 10:19).
14. Na czym polegała dziewiąta plaga sprowadzona na Egipt w Wj 10:21–22?
Odpowiedź: Na gęstej ciemności nad całą ziemią Egiptu przez trzy dni, tak że można było jej dotknąć (Wj 10:21–22).
15. Jak zachowywali się Egipcjanie podczas trzydniowej ciemności według Wj 10:23a?
Odpowiedź: Jeden drugiego nie widział i nikt nie wstał ze swego miejsca przez trzy dni (Wj 10:23a).
16. Co działo się w domach synów Izraela podczas panowania gęstej ciemności (Wj 10:23b)?
Odpowiedź: Wszyscy synowie Izraela mieli światło w swoich mieszkaniach (Wj 10:23b).
17. Jaki kolejny podstępny kompromis zaproponował faraon w Wj 10:24?
Odpowiedź: „Idźcie, służcie PANU, tylko wasze owce i wasze woły niech zostaną; wasze dzieci również mogą iść z wami” (Wj 10:24).
18. Jak brzmiała niezłomna odpowiedź Mojżesza w Wj 10:26?
Odpowiedź: „Także nasze stada pójdą z nami, nie zostanie ani jedno kopyto, gdyż z nich weźmiemy na służbę PANU, naszemu Bogu” (Wj 10:26).
19. Jaką śmiertelną groźbę skierował rozwścieczony faraon do Mojżesza w Wj 10:28?
Odpowiedź: „Idź precz ode mnie! Strzeż się, abyś więcej nie widział mego oblicza, bo w tym dniu, w którym ujrzysz me oblicze, umrzesz” (Wj 10:28).
20. Jakie prorocze słowa wypowiedział Mojżesz w odpowiedzi na groźbę monarchy (Wj 10:29)?
Odpowiedź: „Dobrze powiedziałeś, więcej już nie ujrzę twego oblicza” (Wj 10:29).

TWOJA DECYZJA
Dziesiąty rozdział Księgi Wyjścia stawia przed nami zasadniczy wybór: czy pójdziemy na podstępny kompromis ze światem, czy staniemy w pełnej wolności Ewangelii? Faraon oferował częściową wolność: modlitwę bez dzieci albo wiarę bez poświęcenia majątku. Mojżesz odrzucił te propozycje z absolutną stanowczością: „Pójdziemy z naszymi dziećmi... nie zostanie ani jedno kopyto!”. Prawdziwy uczeń Jezusa Chrystusa nie handluje wiarą i nie zawiera rozejmu z ciemnością. Oddajemy Panu wszystko — bez reszty i bez kompromisów!
MOJA DECYZJA: Panie Boże Wszechmogący, Światłości Świata i Królu Chwały! Wyrzekam się dziś wszelkiego kompromisu z duchem tego świata. Odrzucam podstępne propozycje faraona i powierzam Ci całe moje życie: moją duszę, moją rodzinę, moje dzieci, moją pracę i każdy posiadany zasób. Postanawiam, że w niewoli grzechu nie zostanie ani jedno kopyto! Chcę żyć w Twoim świetle i wiernie służyć Ci każdego dnia. Amen!

MODLITWA NA 10 LISTOPADA
Święty i Sprawiedliwy Boże, Panie nieba i ziemi!
Dziękujemy Ci za potężne poselstwo dziesiątego rozdziału Księgi Wyjścia. Ty jesteś Bogiem, który rozprasza najgęstszy mrok i kruszy pychę najpotężniejszych władców tego świata.
Panie Jezu Chryste, Ty jesteś prawdziwą Światłością Świata! Dziękujemy Ci, że wziąłeś na siebie ciemność Golgoty, aby nasze domy i serca jaśniały wiecznym światłem Goszen. Ustrzeż nas przed podstępnymi kompromisami faraona. Daj nam odwagę chronić nasze dzieci przed zepsuciem tego wieku i poświęcić wszelkie nasze dobra na Twoją wyłączną służbę.
Napełnij nasze rodziny świętą odwagą i pokojem, który przewyższa wszelki rozum. Spraw, abyśmy w każdej ciemności byli żywymi pochodniami Twojej Ewangelii. Tobie niech będzie chwała, cześć i panowanie na wieki wieków. Amen!

ZADANIE NA DZIŚ
1. Przeczytaj osobiście cały dziesiąty rozdział Księgi Wyjścia (Wj 10:1–29) w przekładzie UBG.
2. Zbadaj swoje serce: czy nie pozostawiłeś w niewoli kompromisów jakiejś sfery swojego życia lub rodziny?
3. Zastanów się, w jaki sposób przekazujesz świadectwo Bożych dzieł swoim dzieciom i wnukom (Wj 10:2).
4. Przeczytaj J 8:12 i podziękuj Chrystusowi za Jego światłość, która rozprasza mrok w Twoim domu.
5. Zadeklaruj w modlitwie: „ani jedno kopyto nie zostanie” — oddaj swoje finanse i pracę Panu Bogu.
6. Zapisz poniżej konkretną decyzję odrzucenia kompromisu w codziennym postępowaniu.
7. Podziel się dzisiejszym rozważaniem z osobą, która zmaga się z lękiem przed ciemnością tego świata.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 11 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 42 — „ŚWIĘTO PASCHY, KREW BARANKA I WYKUPIENIE PIERWORODNYCH (WJ 11:1–12:30)”
Czytanie: Wj 11:1–12:30. Noc sądu i odkupienia przymierza. Ustanowienie Baranka Paschalnego, krew na odrzwiach domów w Goszen, śmierć pierworodnych w Egipcie i triumfalne wyjście z domu niewoli.`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day41-lesson.txt
const scriptsContentDir = path.join(process.cwd(), 'scripts/content');
if (!fs.existsSync(scriptsContentDir)) {
  fs.mkdirSync(scriptsContentDir, { recursive: true });
}
fs.writeFileSync(path.join(scriptsContentDir, 'kc-day41-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day41-lesson.txt');

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
      ...lessonFullText.split('\n\n').slice(2).map(block => {
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
        
        // Numerowane podsekcje (np. "1. Tytuł (10:1)")
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
const docxPathDrive = `H:/Mój dysk/OA - orkiestracja Agentowa/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPathDesktop, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPathDesktop} (${buf.length} bajtów)`);

try {
  if (fs.existsSync(path.dirname(docxPathDrive))) {
    fs.writeFileSync(docxPathDrive, buf);
    console.log(`✅ Skopiowano plik DOCX na Google Drive @OA: ${docxPathDrive}`);
  }
} catch (e) {
  console.warn('⚠️ Google Drive @OA niedostępny:', e.message);
}

// 3. Weryfikujemy scripts/content/pakiet-day41-5wersji.md
const pakietPath = path.join(scriptsContentDir, `pakiet-day${DAY_NUM}-5wersji.md`);
if (fs.existsSync(pakietPath)) {
  const pakietContent = fs.readFileSync(pakietPath, 'utf8');
  console.log(`✅ Pakiet 5 wersji istnieje w ${pakietPath} (${pakietContent.length} znaków)`);
  
  // Dopisujemy do bazy rozwazania_baza.md w Wektor1_VideoFactory
  const bazaPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
  if (fs.existsSync(bazaPath)) {
    const currentBaza = fs.readFileSync(bazaPath, 'utf8');
    if (!currentBaza.includes('Dzień 41 (10 listopada 2026)')) {
      fs.appendFileSync(bazaPath, '\n\n' + pakietContent, 'utf8');
      console.log('✅ Dopisano pakiet do rozwazania_baza.md');
    } else {
      console.log('ℹ️ Pakiet Dnia 41 już znajduje się w rozwazania_baza.md');
    }
  }
}

// 4. Publikujemy plik lekcji HTML w Akademii i tworzymy 4 ścieżki Clean URLs
const queuedHtmlPath = path.join(process.cwd(), 'kolejka-publikacji/kurs-codzienny/2026-11-10/lekcja.html');
if (fs.existsSync(queuedHtmlPath)) {
  const html = fs.readFileSync(queuedHtmlPath, 'utf8');
  
  const cleanPaths = [
    path.join(process.cwd(), 'akademia/kurscodzienny/dzien-41.html'),
    path.join(process.cwd(), 'akademia/kurscodzienny/dzien-41/index.html'),
    path.join(process.cwd(), 'kursy/kurscodzienny/dzien-41.html'),
    path.join(process.cwd(), 'kursy/kurscodzienny/dzien-41/index.html')
  ];

  for (const p of cleanPaths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, html, 'utf8');
  }
  console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 41 w polskieradio.cc');

  // Lustrzane kopie w Desktop/@ICC/LUMINA
  const mirrorBase = 'C:/Users/czark/Desktop/@ICC/LUMINA';
  if (fs.existsSync(mirrorBase)) {
    const mirrorPaths = [
      path.join(mirrorBase, 'akademia/kurscodzienny/dzien-41.html'),
      path.join(mirrorBase, 'akademia/kurscodzienny/dzien-41/index.html'),
      path.join(mirrorBase, 'kursy/kurscodzienny/dzien-41.html'),
      path.join(mirrorBase, 'kursy/kurscodzienny/dzien-41/index.html')
    ];
    for (const mp of mirrorPaths) {
      fs.mkdirSync(path.dirname(mp), { recursive: true });
      fs.writeFileSync(mp, html, 'utf8');
    }
    console.log('✅ Zsynchronizowano lustro @ICC/LUMINA dla Dnia 41');
  }
}

// 5. Aktualizacja linku z Dnia 40 do Dnia 41 w akademia/kurscodzienny/dzien-40.html (i 3 lustrzanych kopiach)
const d40Paths = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-40.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-40/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-40.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-40/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-40.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-40/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-40.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-40/index.html'
];

for (const p of d40Paths) {
  if (fs.existsSync(p)) {
    let d40Content = fs.readFileSync(p, 'utf8');
    // Top bar nav update
    d40Content = d40Content.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 41 \(Jutro\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-41" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 41 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    // Jutro button update
    d40Content = d40Content.replace(
      /<span class="inline-flex items-center gap-2 px-5 py-2\.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-\[44px\]">\s*<span>Dostępne od północy \(10 listopada\)<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-41" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">\n            <span>Przejdź do Dnia 41</span>\n            <span>→</span>\n          </a>`
    );
    fs.writeFileSync(p, d40Content, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania nawigacyjne w Dniu 40 wskazujące na Dzień 41');

console.log('🎉 Komplet lekcji, DOCX i 5-wersyjnego pakietu Dnia 41 wygenerowane pomyślnie!');
