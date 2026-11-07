import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, NumberFormat, BorderStyle } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 38: Wj 7:1–25 (7 listopada 2026, Sobota)
const DAY_NUM = 38;
const DATE_STR = '2026-11-07';
const DATE_FORMATTED = 'Sobota, 7 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 7:1–25';
const TITLE = 'LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW';
const SUBTITLE = 'Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil';
const MEMORY_VERSE = '„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.” (Wj 7:17, UBG)';
const THEME = 'Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich oraz zatwardziałym sercem faraona. Przemiana laski w węża połykającego laski czarowników oraz uderzenie w Nil dowodzą, że pozorna siła demonicznych iluzji jest bezsilna wobec suwerennego Stwórcy, a sąd nad rzeką Egiptu zapowiada ostateczne zwycięstwo łaski i odkupienia w Chrystusie.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 38 (Wj 7:1–25)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 38
LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW
Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil
Sobota, 7 listopada 2026 r.  |  Czytanie: Wj 7:1–25
TEKST PAMIĘCIOWY: „Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.” (Wj 7:17, UBG)
MYŚL PRZEWODNIA: Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich oraz zatwardziałym sercem faraona. Przemiana laski w węża połykającego laski czarowników oraz uderzenie w Nil dowodzą, że pozorna siła demonicznych iluzji jest bezsilna wobec suwerennego Stwórcy, a sąd nad rzeką Egiptu zapowiada ostateczne zwycięstwo łaski i odkupienia w Chrystusie.

ZANIM OTWORZYSZ BIBLIĘ
Siódmy rozdział Księgi Wyjścia wprowadza nas w decydującą fazę dramatu wyzwolenia narodu wybranego. Przez pierwsze sześć rozdziałów obserwowaliśmy przygotowanie posłańców: ocalenie małego Mojżesza w sitowiu Nilu, jego ucieczkę do Madianu, teofanię w płonącym krzaku na górze Horeb, bolesną pierwszą konfrontację z faraonem zakończoną dekretem o wyrobie cegieł bez słomy oraz odnowienie przymierza w rozdziale szóstym. Wtedy to Mojżesz, przygnieciony niewiarą ludu i własnym poczuciem słabości, powtarzał: „Oto mam wargi nieobrzezane, jakże więc faraon mnie posłucha?” (Wj 6:30).
W rozdziale siódmym Bóg definitywnie ucisza wszelkie ludzkie obawy i lęki. Zamiast dyskutować z kompleksami Mojżesza, nadaje mu bezprecedensowy status: „Oto ustanowiłem cię bogiem dla faraona, a Aaron, twój brat, będzie twoim prorokiem” (Wj 7:1). Od tej chwili Mojżesz nie reprezentuje już zbiega z Madianu ani przestraszonego pasterza owiec; występuje w pałacu egipskim z suwerennym autorytetem samego Króla Wszechświata wobec tyrana, który sam uzurpował sobie boską cześć jako wcielenie boga Horusa.
Rozdział ten otwiera wielką serię znaków i plag, będących w istocie procesem sądowym wytoczonym przez JAHWE panteonowi bóstw egipskich. Zobaczymy tu dwa fundamentalne etapy konfrontacji: najpierw znak laski Aarona, która zamienia się w potwora i połyka laski egipskich czarowników, a następnie pierwszą plagę — zamianę wód Nilu w krew na oczach faraona i jego dostojników. Nil, czczony przez Egipcjan jako źródło życia i ucieleśnienie bóstwa Hapi oraz Ozyrysa, staje się rzeką śmierci i zgnilizny. Rozdział ten stawia przed nami odwieczne pytanie: na czym opierasz swoje bezpieczeństwo i czy w obliczu Bożego sądu potrafisz ukorzyć swoje serce przed Królem królów?

CZĘŚĆ I — BOSKIE PEŁNOMOCNICTWO I ZAPOWIEDŹ SĄDÓW (Wj 7:1–7)
1. „Ustanowiłem cię bogiem dla faraona” (7:1a)
Słowa Boga: „Oto ustanowiłem cię bogiem (hebr. Elohim) dla faraona” nie oznaczają ubóstwienia Mojżesza w sensie ontologicznym. Mojżesz pozostaje stworzeniem i człowiekiem, lecz otrzymuje pełnomocnictwo do występowania z absolutnym autorytetem Bożym. Faraon, który uważał siebie za boga na ziemi, musiał stanąć twarzą w twarz z człowiekiem, przez którego przemawiał jedyny prawdziwy Władca nieba i ziemi.
2. Aaron jako prorok Mojżesza (7:1b)
Bóg ustanawia relację między Mojżeszem a Aaronem jako żywą ilustrację urzędu prorockiego: „A Aaron, twój brat, będzie twoim prorokiem (hebr. nawi)”. Prorok biblijny to nie wróżbita przepowiadający przyszłość, lecz rzecznik i usta Boga, który przekazuje dokładnie to, co usłyszał od swego Pana.
3. Bezwzględna integralność poselstwa (7:2)
„Będziesz mówił wszystko, co ci rozkażę, a Aaron, twój brat, będzie mówił do faraona”. Posłaniec Boży nie ma prawa do selekcji, wygładzania czy cenzurowania Bożego Słowa pod kątem oczekiwań słuchaczy. Prawda Boża musi być głoszona w całości, niezależnie od tego, czy podoba się ziemskim władcom.
4. Tajemnica zatwardzenia serca faraona (7:3a)
„Lecz ja zatwardzę serce faraona”. Teologia biblijna ukazuje harmonijną relację między Bożą suwerennością a ludzką odpowiedzialnością. Faraon wielokrotnie sam zatwardzał swoje serce (Wj 7:13, 22; 8:15, 32), a Boże działanie polegało na utwierdzeniu tyrana w wybranym przez niego buncie, aby obnażyć bezsilność pogaństwa i okazać chwałę Stwórcy (por. Rz 9:17–18).
5. Rozmnożenie znaków i cudów (7:3b)
Bóg zapowiada: „I rozmnożę moje znaki i moje cuda w ziemi Egiptu”. Hebrajskie pojęcia otot (znaki wskazujące na cel) oraz moftim (cuda budzące grozę) podkreślają, że nadchodzące wydarzenia nie były ślepymi kataklizmami natury, lecz celową pedagogiką Bożą, demaskującą nicość egipskich bóstw.
6. Wielkie sądy i Boże zastępy (7:4)
Bóg nazywa uciemiężonych niewolników: „Wyprowadzę moje zastępy (hebr. cewaot), mój lud, synów Izraela, z ziemi Egiptu przez wielkie sądy”. Naród traktowany jak darmowa siła robocza w oczach Boga jest królewską armią przymierza, uwalnianą mocą wyciągniętego ramienia.
7. Ewangelizacyjny cel sądów nad imperium (7:5)
„I poznają Egipcjanie, że ja jestem PANEM, gdy wyciągnę swoją rękę nad Egiptem”. Sądy Boże mają wymiar objawieniowy: pogański świat, żyjący w ciemności politeizmu i tyranii, ma stanąć w prawdzie przed obliczem Jedynego Prawdziwego Boga.
8. Nienaganne posłuszeństwo posłańców (7:6)
„I uczynili Mojżesz i Aaron tak, jak im PAN nakazał; tak uczynili”. To wspaniały punkt zwrotny: minął czas wymówek, wątpliwości i sporów z powołaniem. Dojrzali słudzy Boży wkraczają na drogę radykalnego, natychmiastowego posłuszeństwa.
9. Sędziwy wiek i Boża perspektywa czasu (7:7)
„A Mojżesz miał osiemdziesiąt lat, Aaron zaś osiemdziesiąt trzy lata, gdy mówili do faraona”. W oczach starożytnego świata i współczesnej kultury byli to starcy u schyłku życia. W Bożym planie ich największa misja życiowa dopiero się rozpoczynała. Bóg nie patrzy na ludzkie metryki, lecz kształtuje charakter swoich sług w szkole cierpliwości.

CZĘŚĆ II — POJEDYNEK LASEK I PORAŻKA CZAROWNIKÓW (Wj 7:8–13)
10. Znak legitymizujący poselstwo (7:8–9a)
Bóg przewiduje reakcję władcy: „Gdy faraon powie do was: Uczyńcie cud...”. Pogański monarcha domaga się uwierzytelnienia boskiego poselstwa. Bóg nie pozostawia swoich ambasadorów bez widzialnego świadectwa swojej obecności.
11. Rzucenie laski i przemiana w potwora morskiego (7:9b–10)
Aaron rzuca laskę przed faraonem i jego sługami, a ona staje się wężem/potworem (hebr. tannin). Użycie słowa tannin (w odróżnieniu od nahasz w Wj 4:3) ma potężne znaczenie symboliczne: oznacza potwora wodnego, smoka lub krokodyla — symbol nilowej potęgi Egiptu oraz węża uraeus zdobiącego koronę faraona jako znak boskiej ochrony!
12. Wezwanie elity okultystycznej Egiptu (7:11a)
Faraon nie chce uznać wyższości JAHWE, dlatego wzywa „mędrców i czarowników” oraz „kapłanów wróżbitów Egiptu” (hebr. hartummim). Egipska kasta kapłańska słynęła w świecie starożytnym z zaawansowanych praktyk magicznych, iluzjonistycznych i manipulowania siłami demonicznymi.
13. Nowotestamentowe świadectwo o magach (por. 2 Tm 3:8)
Apostoł Paweł w Drugim Liście do Tymoteusza ujawnia imiona przywódców tych czarowników: Jannes i Jambres. Paweł wskazuje, że tak jak oni sprzeciwili się Mojżeszowi, tak ludzie skażonego umysłu sprzeciwiają się prawdzie w czasach ostatecznych.
14. Zdolność szatana do imitowania cudów (7:11b–12a)
Czarownicy rzucają swoje laski i one również zamieniają się w węże „przez swoje zaklęcia” (hebr. balatehem). Pismo Święte nie zaprzecza realności działania mocy ciemności. Szatan posiada ograniczoną moc czynienia znaków zwodniczych, aby utwierdzić ludzi w kłamstwie (por. 2 Tes 2:9).
15. Triumf Bożej suwerenności: laska Aarona połyka laski czarowników (7:12b)
„Lecz laska Aarona połknęła ich laski”. To jeden z najbardziej dramatycznych obrazów w Księdze Wyjścia! Znak ten nie pozostawiał wątpliwości: moc Boga Hebrajczyków dosłownie strawiła i unicestwiła demoniczne symbole władzy Egiptu. Magowie potrafili wywołać iluzję, ale nie potrafili ochronić własnych lasek.
16. Ślepota zatwardziałego serca (7:13)
Mimo druzgocącej porażki swoich czarowników, „serce faraona pozostało zatwardziałe i nie usłuchał ich, jak zapowiedział PAN”. Zamiast ukorzyć się przed ewidentnym dowodem Bożej wyższości, tyran zamyka oczy na prawdę. Kiedy człowiek kocha swój grzech i władzę, żaden cud nie jest w stanie go przekonać.

CZĘŚĆ III — SĄD NAD ŚWIĘTYM NILEM: PIERWSZA PLAGA KRWI (Wj 7:14–21)
17. Poranne spotkanie u źródeł Nilu (7:14–15a)
Bóg nakazuje Mojżeszowi: „Idź do faraona rano; oto wychodzi on nad wodę. Stań naprzeciw niego na brzegu rzeki”. Faraon udawał się nad Nil o świcie, prawdopodobnie w celach rytualnych ablucji lub złożenia hołdu bóstwom rzeki. Mojżesz ma spotkać go na jego własnym religijnym terytorium.
18. Laska sądu w ręku Mojżesza (7:15b)
„Weź też do ręki laskę, która zamieniła się w węża”. Ta sama laska, która wczoraj połknęła węże czarowników, dziś staje się narzędziem wymierzenia sprawiedliwości nad całym systemem religijno-gospodarczym Egiptu.
19. Przypomnienie odrzuconego poselstwa (7:16)
Mojżesz ogłasza królowi: „PAN, Bóg Hebrajczyków, posłał mnie do ciebie, mówiąc: Wypuść mój lud, aby mi służył na pustyni; lecz ty dotąd nie usłuchałeś”. Bóg nie uderza bez ostrzeżenia; plaga jest bezpośrednią konsekwencją zatwardziałego nieposłuszeństwa władcy.
20. Poznanie PANA przez doświadczenie sądu (7:17a)
„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM”. Skoro faraon w Wj 5:2 zuchwale pytał: „Któż to jest PAN? Nie znam PANA!”, teraz Bóg odpowiada czynem. Poznanie Boga przez bezbożnych następuje przez miażdżącą demonstrację Jego sprawiedliwości.
21. Uderzenie w serce kultu Nilu (7:17b)
Nil (hebr. Jeor) był dla Egipcjan bóstwem samym w sobie — czczonym jako Hapi, dawca urodzaju i życia, oraz kojarzonym z Ozyrysem, którego krwią według wierzeń miały być wylewy rzeki. Bóg uderza bezpośrednio w to, co Egipcjanie ubóstwiali zamiast Stwórcy.
22. Dosłowna przemiana wody w krew (7:17c)
„Oto uderzę laską... wodę w rzece, a zamieni się w krew (hebr. dam)”. Próby racjonalistycznego tłumaczenia tego cudu spływem czerwonej glinki z Abisynii czy zakwitem wiciowców są bezpodstawne. Tekst mówi o natychmiastowej, nadprzyrodzonej przemianie na oczach świadków, powodującej natychmiastową śmierć ryb i smród nie do zniesienia.
23. Zagłada ekosystemu i niemożność picia (7:18)
„Ryby w rzece wyginą, a rzeka zasmrodzi się, tak że Egipcjanie będą się brzydzić pić wodę z rzeki”. Święta rzeka zamienia się w cuchnący rynsztok i masowy cmentarz. To, co było dumą imperium, staje się źródłem odrazy i przerażenia.
24. Powszechny zasięg kataklizmu (7:19)
Bóg nakazuje Aaronowi wyciągnąć laskę nad wszystkie wody Egiptu: nad ich rzeki, kanały (odnogi delty), stawy i wszelkie zbiorniki wodne. Krew pojawiła się nawet w domowych naczyniach drewnianych i kamiennych, służących do filtrowania wody. Sąd Boży objął każdą kroplę wody w państwie.
25. Publiczne wykonanie wyroku Bożego (7:20)
Mojżesz i Aaron czynią dokładnie tak, jak nakazał PAN: na oczach faraona i na oczach wszystkich jego sług Aaron podnosi laskę i uderza wodę w Nilu. Na ich oczach błękitne wody rzeki zamieniają się w gęstą krew. Nie było w tym żadnego ukrycia ani triku — wyrok zapadł publicznie.
26. Śmierć w rzece i bezradność Egiptu (7:21)
Ryby w Nilu natychmiast wyginęły, rzeka zasmrodziła się, nikt w całym kraju nie mógł zaspokoić pragnienia, a krew zalała całą ziemię egipską. Całe imperium stanęło w obliczu biologicznej katastrofy.

CZĘŚĆ IV — PARODIA CZAROWNIKÓW, UCIECZKA FARAONA I TYDZIEŃ CIERPIENIA (Wj 7:22–25)
27. Tragikomiczna imitacja wróżbitów (7:22a)
„Lecz czarownicy egipscy uczynili to samo swymi czarami”. Zwróćmy uwagę na głęboką ironię i bezsilność okultyzmu: magowie faraona potrafili zamienić resztki ocalałej czystej wody w krew, ale nie potrafili oczyścić ani jednej kropli krwi z powrotem w wodę! Szatan potrafi jedynie niszczyć, pomnażać cierpienie i zanieczyszczać Boże stworzenie.
28. Zatwardziałość faraona w obliczu katastrofy (7:22b)
Zamiast przerazić się niemocą swoich doradców, faraon uczynił z ich sztuczki pretekst do odrzucenia Boga: „I serce faraona pozostało zatwardziałe, i nie usłuchał ich, jak zapowiedział PAN”. Grzeszne serce chwyta się byle pozoru, aby usprawiedliwić swoje trwanie w buncie.
29. Bezduszna ucieczka władcy do pałacu (7:23a)
„Faraon odwrócił się więc, wszedł do swego domu”. Monarcha opuszcza brzeg rzeki pełnej krwi i chowa się w chłodnych murach pałacu, demonstracyjnie odwracając się plecami do Bożych posłańców.
30. Ignorowanie oczywistych faktów (7:23b)
„I nie wziął tego do swego serca (hebr. we-lo szat libbo gam la-zot)”. To tragiczna diagnoza duchowej pychy: człowiek widzi Boży sąd, cierpi skutki własnego buntu, a mimo to zamyka swój umysł i serce, udając, że nic się nie stało.
31. Rozpaczliwe kopanie studni wokół rzeki (7:24)
Podczas gdy faraon siedzi w pałacu, zwykli Egipcjanie muszą kopać doły w wilgotnym piasku wokół Nilu, szukając naturalnie przefiltrowanej wody do picia. Grzech i pycha przywódców zawsze sprowadzają cierpienie na niewinnych ludzi.
32. Siedem dni Bożego ostrzeżenia (7:25)
„I minęło siedem dni po tym, jak PAN uderzył w rzekę”. Liczba siedem w Biblii oznacza pełnię i doskonałość. Bóg nie uderza chaotycznie ani w niekontrolowanym gniewie. Przez pełne siedem dni rzeka krwi była widocznym kazaniem o świętości Boga, dając faraonowi i całemu Egiptowi czas na opamiętanie przed nadejściem kolejnego sądu.

JEZUS W CENTRUM — KRZYŻ, POKONANIE WĘŻA I ŹRÓDŁO WODY ŻYWEJ
33. Zwycięska laska a Krzyż Golgoty (Wj 7:12 a Kol 2:15; 1 J 3:8)
Laska Aarona połykająca laski czarowników jest bezpośrednią typologią Krzyża Jezusa Chrystusa. Na Golgocie szatan zebrał wszystkie swoje potęgi: oskarżenie Prawa, grzech i śmierć. Lecz Chrystus przez swoją śmierć i zmartwychwstanie „rozbroił zwierzchności i władze, i jawnie wystawił je na pokaz, triumfując nad nimi przez krzyż”. Śmierć została pochłonięta w zwycięstwie (1 Kor 15:54).
34. Pierwszy znak Mojżesza a pierwszy cud Jezusa (Wj 7:20 a J 1:17; J 2:1–11)
To jeden z najbardziej fundamentalnych kontrastów w całym Piśmie Świętym. Mojżesz, szafarz Zakonu, rozpoczyna swoją publiczną służbę od zamiany wody w krew — znaku sądu, śmierci i potępienia pod Prawem. Jezus Chrystus, szafarz Nowego Przymierza łaski, rozpoczyna swoją publiczną działalność w Kanie Galilejskiej od zamiany wody w wyborne wino weselne — znaku radości, przebaczenia, życia i obfitości łaski! „Prawo bowiem zostało dane przez Mojżesza, a łaska i prawda przyszły przez Jezusa Chrystusa”.
35. Krew Nilu przynosząca śmierć a Krew Chrystusa niosąca życie (Wj 7:20 a J 19:34; Hbr 12:24)
Krew, która popłynęła w Nilu, zabiła wszelkie życie i uczyniła rzekę źródłem odrazy. Krew, która wypłynęła z przebitego boku Jezusa Chrystusa na krzyżu wraz z wodą, jest krwią Nowego Przymierza, która oczyszcza sumienie z martwych uczynków, gładzi grzechy świata i daje życie wieczne każdemu, kto wierzy.
36. Chrystus jako Źródło Wody Żywej w świecie duchowej posuchy (Wj 7:24 a J 4:13–14; 7:37–38)
Egipcjanie kopali rozpaczliwie doły w piasku wokół zatrutego Nilu, szukając kropli wody. To obraz każdego człowieka szukającego ukojenia w popękanych cysternach tego świata (por. Jr 2:13). Jezus Chrystus staje pośród nas i woła: „Jeśli ktoś pragnie, niech przyjdzie do mnie i pije! Kto wierzy we mnie, jak mówi Pismo, rzeki wody żywej popłyną z jego wnętrza”.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Wj 7:1 → J 10:34–36. Co oznaczało nadanie Mojżeszowi tytułu Elohim i jak Jezus posłużył się tym pojęciem w konfrontacji z faryzeuszami?
• Wj 7:11–12 → 2 Tm 3:8–9. W jaki sposób apostoł Paweł nawiązuje do buntu Jannesa i Jambresa, opisując zwodzicieli czasów ostatecznych?
• Wj 7:12 → Kol 2:15; 1 J 4:4. Dlaczego laska połykająca węże daje nam pewność, że „Większy jest Ten, który jest w was, niż ten, który jest na świecie”?
• Wj 7:13, 22 → Hbr 3:12–15. Jak autor Listu do Hebrajczyków przestrzega przed powolnym zatwardzaniem serca przez zwodniczość grzechu?
• Wj 7:17 → Ps 78:44; Ps 105:29. Jak autorzy natchnionych psalmów historycznych wspominają zamianę rzek Egiptu w krew jako dowód Bożej wierności przymierzu?
• Wj 7:19–20 → Ap 8:8; Ap 16:4–6. W jaki sposób plaga krwi powraca w eschatologicznych sądach nad bezbożnym światem w Księdze Apokalipsy?
• Wj 7:20 → J 1:17; J 2:1–11. Dlaczego przeciwstawienie zamiany wody w krew przez Mojżesza i wody w wino przez Jezusa stanowi klucz do zrozumienia przejścia od Zakonu do Łaski?
• Wj 7:21 → Iz 19:5–10. Jak prorok Izajasz zapowiada późniejszy sąd nad gospodarką i rybołówstwem Nilu jako obnażenie pychy mędrców Egiptu?
• Wj 7:22 → 2 Tes 2:9–11. Dlaczego zwiedzenie demoniczne posługuje się fałszywymi znakami i dlaczego ludzie odrzucający prawdę ulegają kłamstwu?
• Wj 7:23 → Prz 29:1. Jaki los czeka człowieka, który mimo wielu upomnień usztywnia swój kark i nie bierze Bożego głosu do serca?
• Wj 7:24 → Jr 2:13. Dlaczego kopanie studni w piasku wokół zatrutego Nilu jest ostrzeżeniem przed porzuceniem Boga na rzecz ułomnych ludzkich podpór?
• Wj 7:25 → 2 P 3:9. Czego uczy nas pełne siedem dni cierpliwości Boga przed kolejnym uderzeniem o Jego pragnieniu upamiętania grzesznika?

PRAWDA NA DZIŚ
• Iluzje zła są bezsilne wobec Bożej Prawdy: demoniczne podróbki mogą imponować na krótką metę, lecz prawda Boża ostatecznie połyka wszelkie kłamstwo.
• Bóg uderza w to, co stawiasz na Jego miejscu: Nil był dla Egipcjan bogiem i gwarantem dostatku — gdy człowiek tworzy sobie bożka, Bóg obnaża jego bezwartościowość i odrazę.
• Uważaj na proces zatwardzania serca: każde zignorowane Boże ostrzeżenie sprawia, że sumienie staje się twardsze, a człowiek bardziej ślepy na prawdę.
• Szatan potrafi niszczyć, ale nigdy nie potrafi uzdrawiać: czarownicy powiększyli ilość krwi, ale nie potrafili dać ani jednej kropli czystej wody. Grzech zawsze pogłębia kryzys, który obiecywał rozwiązać.
• Nie uciekaj do pałacu duchowej obojętności: ucieczka faraona i lekceważenie faktów („nie wziął tego do serca”) to śmiertelna pułapka dla tych, którzy chcą zagłuszyć głos sumienia.
• Wiek nie ogranicza Bożego powołania: Mojżesz miał 80 lat, a Aaron 83 — Bóg może użyć Twojego życia w najpotężniejszy sposób właśnie wtedy, gdy świat spisuje Cię na straty.
• Zakon przynosi sąd, Chrystus przynosi wesele łaski: woda zamieniona w krew w Wj 7 objawia wyrok sprawiedliwego Prawa, podczas gdy woda zamieniona w wino w Kanie objawia obfitość przebaczenia w Chrystusie.
• Prawdziwe ugaszenie pragnienia jest tylko w Jezusie: nie trać sił na kopanie popękanych studni tego świata, gdy Zbawiciel zaprasza Cię, byś darmo pił ze Źródła Wody Żywej.

POMYŚL — PYTANIA DO REFLEKSJI
1. Czy w Twoim życiu istnieją „Nilowe rzeki” — kariera, pieniądze, relacje czy własna samowystarczalność — na których polegasz bardziej niż na Bogu?
2. Jak reagujesz, gdy Słowo Boże dotyka Twoich błędów: czy w pokorze szukasz przebaczenia, czy wzorem faraona „wchodzisz do domu” i nie bierzesz tego do serca?
3. Czy doświadczyłeś w swoim życiu sytuacji, w której kłamstwo lub ludzka manipulacja próbowały Cię zastraszyć, a prawda Boża ostatecznie zatriumfowała?
4. W jaki sposób fakt, że Mojżesz i Aaron rozpoczęli swoją największą misję po osiemdziesiątce, wpływa na Twoje podejście do własnego wieku i planów?
5. Czy nie dajesz się zwieść współczesnym imitacjom duchowości (horoskopom, ezoteryce, fałszywym teoriom), które obiecują oświecenie, a w istocie zatruwają źródła życia?
6. Co osobiście oznacza dla Ciebie kontrast między sądem wody w krew pod Mojżeszem a weselem wody w wino pod panowaniem Jezusa Chrystusa?
7. W jakich obszarach codzienności zdarza Ci się „kopać w piasku” w poszukiwaniu ulgi, zamiast przyjść bezpośrednio do Chrystusa po Wodę Żywą?
8. Kogo w swoim otoczeniu powinieneś dziś z miłością i odwagą przestrzec przed zatwardzaniem serca wobec Bożego głosu?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Kim Bóg ustanowił Mojżesza dla faraona według Wj 7:1?
Odpowiedź: Ustanowił go bogiem (Elohim) dla faraona (Wj 7:1).
2. Jaką rolę wobec Mojżesza wyznaczył Bóg jego bratu Aaronowi w Wj 7:1?
Odpowiedź: Miał być jego prorokiem (rzecznikiem) (Wj 7:1).
3. Co Bóg zapowiedział Mojżeszowi odnośnie serca faraona w Wj 7:3?
Odpowiedź: Zapowiedział, że zatwardzi serce faraona i rozmnoży swoje znaki i cuda w Egipcie (Wj 7:3).
4. Jak Bóg nazwał Izraelitów wyprowadzanych z Egiptu w Wj 7:4?
Odpowiedź: Nazwał ich „moimi zastępami, moim ludem, synami Izraela” (Wj 7:4).
5. Co mieli poznać Egipcjanie, gdy Bóg wyciągnie rękę nad ich krajem (Wj 7:5)?
Odpowiedź: Mieli poznać, że On jest PANEM (JAHWE) (Wj 7:5).
6. Ile lat miał Mojżesz, a ile Aaron, gdy stanęli przed faraonem w Wj 7:7?
Odpowiedź: Mojżesz miał 80 lat, a Aaron 83 lata (Wj 7:7).
7. W co miała zamienić się laska Aarona po rzuceniu jej przed faraonem (Wj 7:9)?
Odpowiedź: Miała zamienić się w potwora morskiego / węża (hebr. tannin) (Wj 7:9).
8. Kogo wezwał faraon, aby odpowiedzieć na znak laski Aarona (Wj 7:11)?
Odpowiedź: Wezwał mędrców, czarowników i kapłanów wróżbitów Egiptu (Wj 7:11).
9. Jakie imiona nosili przywódcy egipskich czarowników według 2 Listu do Tymoteusza 3:8?
Odpowiedź: Jannes i Jambres (2 Tm 3:8).
10. Co stało się z laskami egipskich czarowników po rzuceniu ich na ziemię (Wj 7:12)?
Odpowiedź: Zamieniły się w węże, lecz laska Aarona połknęła ich laski (Wj 7:12).
11. Jak zareagował faraon na znak pożarcia lasek swoich czarowników (Wj 7:13)?
Odpowiedź: Jego serce pozostało zatwardziałe i nie usłuchał ich (Wj 7:13).
12. O jakiej porze dnia i gdzie Mojżesz miał spotkać faraona według nakazu z Wj 7:15?
Odpowiedź: Rano, na brzegu rzeki Nil, gdy faraon wychodził nad wodę (Wj 7:15).
13. Jaką laskę Mojżesz miał wziąć do ręki na spotkanie z faraonem (Wj 7:15)?
Odpowiedź: Laskę, która była zamieniona w węża (Wj 7:15).
14. W co miała zamienić się woda rzeki po uderzeniu laską według Wj 7:17?
Odpowiedź: Miała zamienić się w krew (Wj 7:17).
15. Co według zapowiedzi Bożej z Wj 7:18 miało stać się z rybami w rzece Nil?
Odpowiedź: Ryby w rzece miały wyginąć, a rzeka miała zasmrodzić się (Wj 7:18).
16. W jakich naczyniach w domach Egipcjan również pojawiła się krew według Wj 7:19?
Odpowiedź: W naczyniach drewnianych i kamiennych (Wj 7:19).
17. Na czyich oczach Aaron podniósł laskę i uderzył wody Nilu w Wj 7:20?
Odpowiedź: Na oczach faraona i na oczach wszystkich jego sług (Wj 7:20).
18. Co uczynili egipscy czarownicy po zamianie wód w krew (Wj 7:22)?
Odpowiedź: Uczynili to samo swymi czarami, również zamieniając wodę w krew (Wj 7:22).
19. Gdzie poszedł faraon po ujrzeniu pierwszej plagi i co zanotował kronikarz (Wj 7:23)?
Odpowiedź: Wszedł do swego domu i nie wziął tego do swego serca (Wj 7:23).
20. Ile dni minęło po uderzeniu Nilu przez Pana przed nadejściem kolejnego ostrzeżenia (Wj 7:25)?
Odpowiedź: Minęło siedem dni (Wj 7:25).

TWOJA DECYZJA
Siódmy rozdział Księgi Wyjścia stawia każdego z nas w obliczu konfrontacji z własną pychą i fałszywymi źródłami bezpieczeństwa. Możemy — wzorem faraona — otaczać się iluzjami, lekceważyć napomnienia Ducha Świętego, uciekać do pałacu własnej obojętności i „nie brać do serca” Bożego głosu. Taka droga prowadzi jednak do duchowej ruiny i zatwardzenia, które ściąga nieuchronny sąd.
Możemy też wybrać drogę Mojżesza i Aarona: drogę pokornego posłuszeństwa Bogu, zaufania Jego suwerenności i stanięcia po stronie Prawdy, która połyka wszelkie demoniczne kłamstwo. Pierwszy cud Mojżesza przypomina o surowości Bożego Prawa, które zamienia ziemskie bożki w krew i śmierć. Lecz w Jezusie Chrystusie otrzymaliśmy dar nieskończenie wspanialszy: Jego Krew na krzyżu nie niesie potępienia, lecz daruje wieczne przebaczenie, a On sam jest Źródłem Wody Żywej, która gasi wszelkie pragnienie naszej duszy.
MOJA DECYZJA: Panie Boże Wszechmogący, wyznaję, że Ty jesteś jedynym, suwerennym Królem mojego życia. Odrzucam wszelkie bożki tego świata — fałszywe poczucie bezpieczeństwa, pychę rozumu i znieczulicę serca. Nie chcę jak faraon uciekać przed Twoim głosem. Przyjmuję dziś z wiarą oczyszczającą Krew Jezusa Chrystusa i otwieram moje serce na strumienie Jego Wody Żywej. Wybieram posłuszeństwo Twojemu Słowu w każdym dniu mojego życia.

MODLITWA NA 7 LISTOPADA
Święty, Sprawiedliwy i Wszechmogący Boże, Panie nieba, ziemi i wszystkich wód!
Stajemy przed Twoim majestatem w ten sobotni poranek z drżeniem i głębokim dziękczynieniem za potęgę Twojego Słowa objawionego w siódmym rozdziale Księgi Wyjścia. Ty jesteś Bogiem, przed którym uginają się tyrani i milkną zwierzchności ciemności. Dziękujemy Ci, że w Twoim ręku żadne demoniczne zwiedzenie ani ludzka pycha nie mają mocy przetrwać próby prawdy.
Przebacz nam, Panie, każdą chwilę, gdy nasze serca stawały się twarde, gdy lekceważyliśmy cichy głos Twojego Ducha lub gdy szukaliśmy ratunku w mętnych wodach tego świata zamiast u Ciebie. Wybacz nam momenty, w których pokładaliśmy nadzieję w ludziach, pieniądzach lub własnych siłach, czyniąc z nich współczesny Nil. Oczyść nasze sumienia i zachowaj nas przed duchową znieczulicą faraona.
Dziękujemy Ci z całego serca za Pana Jezusa Chrystusa! Dziękujemy, że podczas gdy Prawo Mojżesza obnażyło nasz grzech i zamieniło ziemskie wody w krew sądu, nasz Zbawiciel przelał swoją bezcenną Krew na Golgocie, aby nas odkupić, usprawiedliwić i obdarować Wodą Żywą. Dziękujemy, że w Chrystusie Krzyż pochłonął wszelką władzę wroga, a Jego zmartwychwstanie gwarantuje nam wieczne zwycięstwo. Napełnij nas dziś Twoim pokojem, odwagą i Duchem Świętym. W imieniu Jezusa Chrystusa. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj osobiście cały siódmy rozdział Księgi Wyjścia (Wj 7:1–25) w przekładzie UBG.
☐ Zrób duchowy rachunek sumienia: czy w Twoim życiu nie ma obszaru, w którym odpychasz Boże upomnienie i „nie bierzesz go do serca”?
☐ Zidentyfikuj swoje „rzeki Nilu” — rzeczy lub zasoby, którym ufasz bardziej niż Bogu — i złóż je w modlitwie u stóp Chrystusa.
☐ Przeczytaj w Ewangelii Jana 2:1–11 opis cudu w Kanie Galilejskiej i podziękuj Jezusowi za łaskę Nowego Przymierza.
☐ Przeczytaj słowa Jezusa z J 7:37–39 i poproś Ducha Świętego o napełnienie Twojego wnętrza strumieniami Wody Żywej.
☐ Wyraź wdzięczność Bogu za ludzi w dojrzałym wieku w Twojej wspólnocie lub rodzinie, pamiętając o powołaniu Mojżesza i Aarona po osiemdziesiątce.
☐ Udostępnij dzisiejszą lekcję lub werset pamięciowy jednej osobie, która zmaga się ze zwątpieniem lub poszukuje prawdy o Bogu.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 8 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 39 — „PLAGA ŻAB, WSZY I MUCH: SĄD NAD BOŻKAMI EGIPTU I ODDZIELENIE GOSZEN”
Czytanie: Wj 8:1–32. Sąd nad Egiptem przybiera na sile! Miliony żab wypełniają domy, sypialnie i piece chlebowe Egipcjan, proch ziemi zamienia się we wszy, a bezradni czarownicy wyznają: „To jest palec Boży!”. Po raz pierwszy Bóg w widoczny sposób oddziela krainę Goszen, chroniąc swój lud przed plagą gzów i much. Wróć jutro, aby zobaczyć, jak Bóg demonstruje swoją świętą obecność w samym środku pogańskiego imperium!`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day38-lesson.txt
fs.writeFileSync(path.join(process.cwd(), 'scripts/content/kc-day38-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day38-lesson.txt');

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
        
        // Numerowane podsekcje (np. "1. Tytuł (7:1)")
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
const docxPath = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPath} (${buf.length} bajtów)`);

// 3. Budujemy 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 38 (7 listopada 2026): Laska, która połknęła węże, i woda zamieniona w krew (Wj 7:1–25)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Ósmy

Czy zastanawiałeś się kiedyś, jak kruche i bezradne stają się ludzkie potęgi oraz największe autorytety tego świata, gdy stają w konfrontacji z suwerennym głosem Boga Wszechmogącego?

Zatrzymaj się w ten sobotni poranek, siódmego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w kochające oblicze Twojego Ojca w niebie. Pozwól, by w ciszy Twojego serca wybrzmiało to osobiste pytanie: Tato, dlaczego tak łatwo daję się onieśmielić i zastraszyć pozornej potędze tego świata, i dlaczego tak często szukam bezpieczeństwa w ułomnych ludzkich źródłach zamiast ufać Twojej nieskończonej mocy?

W siódmym rozdziale Księgi Wyjścia Bóg wyprowadza Mojżesza i Aarona z cienia ich własnych słabości. Mojżesz, który jeszcze wczoraj powtarzał ze drżeniem, że ma wargi nieobrzezane i nikt go nie posłucha, otrzymuje niezwykłe Boże pełnomocnictwo: Oto ustanowiłem cię bogiem dla faraona, a Aaron, twój brat, będzie twoim prorokiem. Przed obliczem pysznego monarchy, który sam uważał się za boga na ziemi, staje osiemdziesięcioletni pasterz niosący w dłoni zwykłą pasterską laskę. Lecz ta laska w rękach wiary jest berłem Władcy wszechświata.

Gdy faraon żąda cudu, Aaron rzuca laskę na posadzkę pałacu, a ona zamienia się w potężnego węża. Czarownicy egipscy swymi tajemnymi zaklęciami czynią to samo, tworząc iluzję równorzędnej siły. Lecz wtedy dzieje się coś, co rozwiewa wszelkie złudzenia: laska Aarona połyka laski czarowników! Zło potrafi imitować Boże znaki, potrafi tworzyć iluzję potęgi, ale w ostatecznym starciu prawda Boża pochłania wszelkie kłamstwo ciemności.

A potem nadchodzi świt nad świętą rzeką Nil. Nil był dla Egipcjan źródłem życia, bóstwem dającym chleb i urodzaj. Faraon przychodzi nad brzeg o poranku, a Mojżesz z rozkazu Boga uderza laską w rzekę. Na oczach całego dworu błękitne wody Nilu zamieniają się w krew. Ryby giną, rzeka cuchnie, a ludzie nie mogą pić. Bóg uderza w samo serce pogańskiej dumy, dowodząc, że to, co człowiek ubóstwia zamiast Stwórcy, staje się dla niego źródłem śmierci i odrazy.

W Jezusie Chrystusie ta historia nabiera najgłębszego blasku. Gdy Mojżesz rozpoczynał swoją misję, zamienił wodę w krew na znak sądu i potępienia pod Prawem. Gdy Jezus Chrystus rozpoczynał swoją misję w Kanie Galilejskiej, zamienił wodę w wyborne wino weselne na znak łaski, radości i przebaczenia w Nowym Przymierzu. Na krzyżu Golgoty laska Bożej miłości pochłonęła śmierć, szatana i wszelkie potępienie. A z przebitego boku Zbawiciela wypłynęła krew i woda — krew, która oczyszcza z grzechu, oraz woda życia, która na wieki gasi pragnienie spragnionej duszy.

Nie bój się dzisiaj żadnych gróźb ani iluzji tego świata. Złóż swoje życie w rękach Chrystusa, bo Większy jest Ten, który jest w Tobie, niż ten, który jest na świecie. Błogosławionej, pełnej pokoju i Bożej obecności soboty!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 38 (7 listopada 2026 r.)
📖 Księga Wyjścia 7:1–25: Laska, która połknęła węże, i woda zamieniona w krew

Czy wiesz, co dzieje się z ludzkimi bożkami, gdy w bieg historii wkracza żywy Bóg JAHWE?

W 38. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 7. rozdział Księgi Wyjścia (Wj 7:1–25: https://polskieradio.cc/mojabiblia?ref=Wj7:1-25). Rozpoczyna się bezpośrednie starcie Stwórcy z panteonem bóstw Egiptu.

Kluczowe filary dzisiejszego studium:

1. Boskie pełnomocnictwo posłańców (Wj 7:1–7):
Bóg ustanawia Mojżesza „bogiem (Elohim) dla faraona”, a Aarona jego prorokiem. Osiemdziesięcioletni pasterz staje przed monarchą mocarstwa nie we własnym imieniu, lecz z autorytetem Najwyższego. Bóg zapowiada wielkie sądy, aby „poznali Egipcjanie, że Ja jestem PANEM”.

2. Znak laski i pojedynek z czarownikami (Wj 7:8–13):
Aaron rzuca laskę, która staje się potworem/wężem (hebr. tannin — symbol węża uraeus na koronie faraona). Egipscy magowie (Jannes i Jambres wg 2 Tm 3:8) swymi zaklęciami imitują znak, lecz laska Aarona połyka laski czarowników! Prawda Boża pochłania demoniczne iluzje.

3. Uderzenie w Nil — woda zamieniona w krew (Wj 7:14–21):
O poranku na brzegu Nilu Aaron uderza laską w wody rzeki. Święty Nil — czczony jako bóg Hapi i ucieleśnienie Ozyrysa — na oczach króla zamienia się w krew. Ryby wyginęły, rzeka zaśmierdziała, a cały Egipt stanął w obliczu katastrofy. To, co ludzie ubóstwiają zamiast Boga, staje się źródłem odrazy.

4. Ucieczka tyrana i bezsilność magii (Wj 7:22–25):
Czarownicy powiększają ilość krwi, lecz nie potrafią dać ani jednej kropli czystej wody. Faraon ucieka do pałacu i „nie bierze tego do serca”. Mija siedem dni Bożej cierpliwości wzywającej do upamiętania.

5. Chrystus w Centrum — Zakon a Łaska:
Pierwszy cud Mojżesza przyniósł krew i sąd pod Prawem. Pierwszy cud Jezusa w Kanie Galilejskiej przyniósł wino i wesele pod panowaniem Łaski (J 1:17; 2:1–11)! Na krzyżu Chrystus pochłonął śmierć (Kol 2:15), a z Jego boku wypłynęła krew i woda (J 19:34) — wieczne Źródło Wody Żywej.

Kompletna lekcja biblijna z 36 punktami egzegezy, studium porównawczym, 20 pytaniami quizu i autozapisem decyzji:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-38

Błogosławionej soboty w cieniu zwycięskiego Krzyża Zbawiciela! 🕊️

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 38 (Wj 7:17): „Po tym poznasz, że ja jestem PANEM: oto uderzę laską wodę w rzece, a zamieni się w krew”. Boża prawda połyka wszelkie kłamstwo, a Krzyż Chrystusa pokonał moce ciemności. Nie szukaj ratunku w bożkach tego świata — pij z Wody Żywej u stóp Zbawiciela. Błogosławionej nocy! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Ciepłe światło portretowe. Na ekranie głównym grafika 16:9: wschód słońca nad Nilem, Aaron uderzający laską w wody zamieniające się w karmazynową krew, przerażony dwór faraona. Tytuł: DZIEŃ 38 — LASKA, KTÓRA POŁKNĘŁA WĘŻE. Subtelny motyw smyczkowy budujący napięcie.

[INTRO: STARCE Z LASKĄ PRZED TRONEM IMPERIUM]
Noemi: Dzień dobry! Witamy państwa bardzo serdecznie w trzydziestym ósmym dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Wkraczamy w siódmy rozdział Księgi Wyjścia — moment, w którym kończą się dyplomatyczne rozmowy, a zaczyna bezpośrednie starcie Boga JAHWE z bogami Egiptu!
Sara: Dokładnie tak, Noemi! Spójrzmy na tę scenę: osiemdziesięcioletni Mojżesz i osiemdziesięciotrzyletni Aaron stają przed faraonem. Jeszcze przed chwilą Mojżesz mówił: „mam nieobrzezane wargi, jak mnie posłucha?”. A Bóg odpowiada: „Ustanowiłem cię bogiem dla faraona!”. To nie Mojżesz staje w swojej sile; to Stwórca przemawia przez usta swoich posłańców!

[ANALIZA PROBLEMOWA: POJEDYNEK LASEK I SĄD NAD NILEM]
Noemi: I dochodzi do pierwszego pojedynku. Aaron rzuca laskę, która staje się wężem. Czarownicy egipscy powtarzają to samo swymi zaklęciami. Ale co się dzieje za chwilę? Laska Aarona połyka laski czarowników! Zło potrafi imitować, potrafi tworzyć podróbki prawdy, ale w ostatecznym rozrachunku Boża suwerenność dosłownie połyka kłamstwo wroga!
Sara: A potem świt nad Nilem. Nil był dla Egipcjan bogiem — źródłem życia, żywności, fundamentem całej gospodarki. I właśnie w to bóstwo uderza laska Boga! Cała rzeka na oczach faraona staje się krwią. Ryby giną, rzeka cuchnie, ludzie kopią w piasku. To, co Egipcjanie ubóstwiali zamiast Stwórcy, stało się dla nich przekleństwem i obrzydliwością!

[CHRYSTUS W CENTRUM: ZAKON A ŁASKA]
Noemi: A jak to wskazuje na Chrystusa? Zobaczmy ten genialny kontrast: pierwszy cud Mojżesza to zamiana wody w krew — znak sądu i potępienia pod Prawem. A jaki był pierwszy cud Jezusa w Kanie Galilejskiej?
Sara: Zamiana wody w wyborne wino! Znak wesela, przebaczenia, życia i obfitości łaski w Nowym Przymierzu! Na krzyżu Golgoty laska Bożej miłości pochłonęła śmierć, a z boku Jezusa wypłynęła krew i woda — odkupienie i Woda Żywa dla każdego z nas!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Noemi: Nasze współrzędne na dziś: „Po tym poznasz, że ja jestem PANEM: oto uderzę laską wodę w rzece, a zamieni się w krew” (Wj 7:17).
Sara: Otwórzcie dziś siódmy rozdział Księgi Wyjścia na polskieradio.cc/akademia. Zbadajcie swoje serce: czy nie macie w życiu jakiegoś „Nilu”, na którym polegacie bardziej niż na Bogu? I nie uciekajcie jak faraon do pałacu obojętności — ukórzcie się przed Chrystusem!

[MODLITWA BOJOWA]
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci, że Twoja Prawda połyka wszelkie kłamstwo i lęk. Dziękujemy za Jezusa Chrystusa, który na krzyżu rozbroił moce ciemności i darował nam Wodę Życia. Zachowaj nasze serca przed zatwardziałością i prowadź nas w swojej łasce. Amen!”

[OUTRO]
Noemi: Dziękujemy za wspólny czas! Pamiętajcie, że wszystkie materiały są bezpłatne na polskieradio.cc.
Sara: Do zobaczenia jutro w ósmym rozdziale! Czytaj, wierz, działaj. Dla Jezusa!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: SĄD NAD PANTEONEM NILU I TRIUMF SUWERENNEGO SŁOWA: STUDIUM EGZEGETYCZNE WJ 7:1–25

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 7 listopada 2026 r.

W ramach ogólnopolskiego programu studiów biblijnych „Z Biblią za Pan Brat”, redakcja leksykonu naukowego portalu CCN publikuje analizę teologiczno-historyczną siódmego rozdziału Księgi Wyjścia. Perykopa ta stanowi formalne otwarcie serii dziesięciu plag egipskich, będących w istocie procesem sądowym JAHWE przeciwko kosmo-politycznemu systemowi politeizmu egipskiego.

1. USTANOWIENIE MOJŻESZA JAKO „ELOHIM” (WJ 7:1–7)
Kluczowa fraza wersetu pierwszego: „Oto ustanowiłem cię bogiem (hebr. Elohim) dla faraona, a Aaron, twój brat, będzie twoim prorokiem (hebr. nawi)” definiuje naturę reprezentacji teokratycznej. W semickiej tradycji przymierza Mojżesz nie staje się bóstwem w sensie ontologicznym (co stanowiłoby zaprzeczenie monoteizmu), lecz otrzymuje plenipotentny autorytet Najwyższego (status legatus a latere Boga). Aaron pełni funkcję klasycznego nawi — rzecznika przekazującego verbum Domini.
Na uwagę zasługuje również wzmianka o wieku posłańców (Mojżesz 80 lat, Aaron 83 lata; w. 7), co w egzegezie biblijnej podkreśla prymat suwerennego powołania nad biologicznymi ograniczeniami człowieka.

2. POJEDYNEK LASEK I SEMIOTYKA „TANNIN” (WJ 7:8–13)
Przemiana laski Aarona w węża/potwora posługuje się terminem hebrajskim tannin (w. 9, 10), odmiennym od nahasz z Wj 4:3. Tannin w tradycji starożytnego Bliskiego Wschodu oznacza potwora głębin, smoka morskiego lub krokodyla — zwierzę ściśle powiązane z kultem boga Sobka oraz z ucieleśnieniem potęgi Nilu. Dodatkowo kobra królewska (uraeus) stanowiła centralny element korony faraona jako symbol boskiej nietykalności.
Gdy czarownicy egipscy (w tradycji żydowskiej i nowotestamentowej utożsamiani z Jannesem i Jambresem; por. 2 Tm 3:8) replikują zjawisko za pomocą sztuk tajemnych (hebr. balatehem), laska Aarona połyka laski magów (w. 12). Czasownik bala („połknąć, pochłonąć”) zwiastuje totalne unicestwienie roszczeń panteonu egipskiego.

3. TEOLOGIA PLAGI KRWI JAKO SĄDU NAD BÓSTWAMI HAPI I OZYRYSA (WJ 7:14–25)
Uderzenie w Nil o poranku (w. 15, 20) miało precyzyjny cel teologiczny. Nil był czczony jako bóg Hapi (pan wylewów i żyzności), a jego wody identyfikowano z płynami ustrojowymi i krwią zmartwychwstającego Ozyrysa. Zamiana wód rzeki, kanałów i cystern w dosłowną krew (hebr. dam) skutkowała:
a) natychmiastową zagładą ichtiofauny („ryby wyginęły”);
b) zanieczyszczeniem bakteriologiczno-organicznym („rzeka zasmrodziła się”);
c) rytualną nieczystością całego kraju, uniemożliwiającą kapłanom egipskim sprawowanie kultu.
Imitacja dokonana przez czarowników (w. 22) obnaża paradoks demonicznej magii: potrafi ona jedynie eskalować destrukcję, nie będąc zdolną do przywrócenia ani jednej kropli czystej wody.

4. CHRYSTOCENTRYCZNA POLARYZACJA: ZAKON A ŁASKA
Egzegeza biblijna dostrzega w Wj 7:20 głęboką antytezę wobec prologu Ewangelii Jana. Pierwszy publiczny znak przymierza mojżeszowego to zamiana wody w krew sądu i śmierci, demaskująca winę człowieka pod Prawem. Pierwszy publiczny znak Jezusa Chrystusa w Kanie Galilejskiej (J 2:1–11) to zamiana wody w wino weselne, inaugurująca epokę łaski, odpuszczenia grzechów i eschatologicznego wesela Baranka.
Ostateczne wypełnienie motywu krwi i wody następuje na krzyżu Golgoty (J 19:34; 1 J 5:6), gdzie z przebitego boku Zbawiciela wypływa krew odkupienia i woda usprawiedliwienia, uwalniając lud Boży z niewoli grzechu.

📌 PODSUMOWANIE REDAKCYJNE CCN
Sąd nad Nilem dowodzi, że żadna ziemska potęga ani demoniczna iluzja nie może ostać się przed obliczem Boga JAHWE. Pycha faraona, który „wszedł do swego domu i nie wziął tego do serca”, pozostaje ostrzeżeniem dla każdego pokolenia przed lekceważeniem Bożego wezwania do upamiętania.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts/content/pakiet-day38-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day38-5wersji.md');

// 4. Dopisujemy do bazy rozwazania_baza.md
const bazaPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(bazaPath)) {
  fs.appendFileSync(bazaPath, '\n\n' + pakiet5Wersji, 'utf8');
  console.log('✅ Dopisano pakiet do rozwazania_baza.md');
}

console.log('🎉 Komplet lekcji, DOCX i 5-wersyjnego pakietu Dnia 38 wygenerowane pomyślnie!');
