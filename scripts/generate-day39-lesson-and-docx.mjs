import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 39: Wj 8:1–32 (8 listopada 2026, Niedziela)
const DAY_NUM = 39;
const DATE_STR = '2026-11-08';
const DATE_FORMATTED = 'Niedziela, 8 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 8:1–32';
const TITLE = 'PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN';
const SUBTITLE = 'Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza';
const MEMORY_VERSE = '„Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.” (Wj 8:19, UBG)';
const THEME = 'Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 39 (Wj 8:1–32)...');

// 1. Kopiowanie obrazka
const sourceImage = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/day39_finger_of_god_goshen_1794084071043.jpg';
const targetImages = [
  path.join(process.cwd(), 'images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg'),
  path.join(process.cwd(), '.pages-release/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg'
];

if (fs.existsSync(sourceImage)) {
  for (const target of targetImages) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(sourceImage, target);
      console.log(`✅ Skopiowano grafikę do: ${target}`);
    } catch (e) {
      console.warn(`⚠️ Błąd kopiowania do ${target}:`, e.message);
    }
  }
} else {
  console.warn('⚠️ Brak pliku źródłowego grafiki:', sourceImage);
}

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 39
PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN
Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza
Niedziela, 8 listopada 2026 r.  |  Czytanie: Wj 8:1–32
TEKST PAMIĘCIOWY: „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.” (Wj 8:19, UBG)
MYŚL PRZEWODNIA: Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.

ZANIM OTWORZYSZ BIBLIĘ
Ósmy rozdział Księgi Wyjścia wprowadza nas w samo centrum wielkiej batalii o duszę narodu wybranego i o objawienie chwały jedynego prawdziwego Boga wobec najpotężniejszego mocarstwa starożytnego świata. W poprzednim rozdziale byliśmy świadkami sądu nad świętym Nilem — woda zamieniona w krew obnażyła bezradność bóstw Hapi i Ozyrysa, a siedem dni skażenia rzeki było czasem Bożej cierpliwości wzywającej do opamiętania. Faraon jednak zignorował ten znak, uciekając do swojego pałacu i utwardzając swoje serce.
W rozdziale ósmym rozpoczyna się dynamiczna seria trzech kolejnych plag: żab (druga plaga), wszy lub komarów (trzecia plaga) oraz gzów i jadowitych much (czwarta plaga). Każda z nich uderza precyzyjnie w inny element pogańskiego kultu Egiptu. Żaby były ucieleśnieniem bogini Heket, opiekunki płodności i narodzin. Proch ziemi zamieniony we wszy demaskował nicość boga ziemi Geba oraz uniemożliwiał kapłanom egipskim rytualną czystość w świątyniach. Natomiast chmary much i gzów ośmieszały bóstwo Uatczit oraz skarabeusza Khepri.
Jednak w tym rozdziale dochodzi do dwóch epokowych przełomów teologicznych. Po pierwsze, przy trzeciej pladze kapitulują egipscy magowie i czarownicy — po raz pierwszy nie są w stanie powtórzyć znaku swymi czarami i wypowiadają historyczne wyznanie: „To jest palec Boży” (Wj 8:19). Po drugie, przy czwartej pladze Bóg wprowadza widzialne, nienaruszalne rozróżnienie (hebr. pedut — wykupienie, rozdzielenie) pomiędzy ziemią Egiptu a krainą Goszen: podczas gdy cały Egipt tonie w ruinie i zniszczeniu, domy synów Izraela cieszą się absolutnym pokojem i ochroną. Rozdział ten demaskuje również taktykę kompromisów, jakimi szatan i duch tego świata usiłują zatrzymać wierzących w połowie drogi do pełnego posłuszeństwa Bogu.

CZĘŚĆ I — DRUGA PLAGA: INWAZJA ŻAB I MODLITWA WSTAWIENNICZA (Wj 8:1–15)
1. Ponowne wezwanie i niezmienne poselstwo (8:1)
Bóg posyła Mojżesza do pałacu faraona z tą samą, nienaruszalną formułą: „Tak mówi PAN: Wypuść mój lud, aby mi służył”. Boże standardy nie podlegają inflacji ani obniżeniu; celem wyzwolenia człowieka nie jest bezcelowa samowola, lecz święta służba i uwielbienie Stwórcy.
2. Ostrzeżenie przed inwazją żab (8:2)
Bóg zapowiada plagę żab (hebr. cfadea), która dotknie wszystkie granice Egiptu. W wierzeniach egipskich żaba była symbolem bogini Heket, przedstawianej z głową płaza, czczonej jako dawczyni życia i wspomożycielka przy porodach. Bóg obraca pogańskiego bożka w źródło odrazy i udręki.
3. Wtargnięcie żab do stref intymnych (8:3–4)
Plaga nie ogranicza się do pól czy bagien. Żaby wchodzą do pałaców, sypialni, łóżek, pieców chlebowych i dzież na ciasto. To, co było symbolem płodności, staje się koszmarem uniemożliwiającym odpoczynek, sen i przygotowanie pożywienia.
4. Gest wyciągniętej ręki Aarona (8:5–6)
Na rozkaz Pana Aaron wyciąga rękę ze swoją laską nad rzeki, kanały i stawy Egiptu. Z wód wychodzą miliony płazów, pokrywając całą ziemię. Przyroda słucha głosu Stwórcy, a nie pogańskich zaklęć.
5. Pozorna moc i tragiczna pułapka czarowników (8:7)
Czarownicy egipscy swymi tajemnymi sztukami również sprowadzają żaby na ziemię egipską. Obnaża to absurdalność demonicznej siły: czarownicy potrafią jedynie powiększyć nieszczęście i dołożyć żab, lecz nie potrafią usunąć ani jednej z nich!
6. Kapitulacja monarchy: pierwsza prośba o modlitwę (8:8)
Przygnieciony ohydą plagi faraon wzywa Mojżesza i Aarona i mówi: „Módlcie się do PANA, aby oddalił żaby ode mnie i od mego ludu, a wypuszczę lud, aby złożył ofiarę PANU”. Pyszny tyran, który w rozdziale piątym pytał: „Któż to jest PAN?”, teraz prosi hebrajskich pasterzy o wstawiennictwo przed obliczem JAHWE.
7. Wybór godziny przez faraona: „Jutro” (8:9–10)
Mojżesz daje faraonowi prawo wyznaczenia dokładnego momentu usunięcia plagi, aby udowodnić, że wydarzenie to nie jest zbiegiem okoliczności, lecz dziełem Boga: „Abyś poznał, że nie ma nikogo takiego, jak PAN, nasz Bóg”. Faraon odpowiada: „Jutro”. Człowiek zatwardziały w grzechu woli spędzić jeszcze jedną noc pośród obrzydliwych żab, byle odsunąć moment pełnego poddania się Bogu.
8. Modlitwa wstawiennicza Mojżesza (8:11–12)
Mojżesz i Aaron wychodzą od faraona, a Mojżesz żarliwie woła do Pana w sprawie żab. Prawdziwy przywódca ludu Bożego jest mężem modlitwy, który zanosząc prośby, nie kieruje się złością, lecz szuka objawienia Bożej chwały.
9. Śmierć żab i smród w całej ziemi (8:13–14)
PAN wysłuchuje modlitwy Mojżesza: żaby giną w domach, na podwórzach i na polach. Egipcjanie zgarniają je w wielkie stosy, a cała ziemia zaczyna potwornie cuchnąć. Grzech i pogańskie kulty po zdemaskowaniu pozostawiają po sobie jedynie duchowy smród i zgniliznę.
10. Iluzja ulgi i ponowne zatwardzenie serca (8:15)
„Gdy faraon zobaczył, że nastąpiła ulga, zatwardził swoje serce i nie usłuchał ich, jak PAN powiedział”. To klasyczny portret religijnej nieszczerości: człowiek woła do Boga w kryzysie i składa obietnice, lecz w momencie gdy mija ból i przychodzi ulga, natychmiast powraca do swego uporu i buntu.

CZĘŚĆ II — TRZECIA PLAGA: PROCH ZIEMI I WYSTANIE CZAROWNIKÓW (Wj 8:16–19)
11. Sąd bez uprzedniego ostrzeżenia (8:16a)
Trzecia plaga uderza nagle, bez wcześniejszego poselstwa do faraona. W cyklu plag każda trzecia plaga (trzecia, szósta, dziewiąta) przychodzi bez zapowiedzi, jako surowy wyrok za lekceważenie poprzednich ostrzeżeń.
12. Uderzenie laską w proch ziemi (8:16b–17)
Aaron uderza laską w proch ziemi, a w całym Egipcie proch zamienia się we wszy lub uciążliwe komary (hebr. kinnim), które obsiadają ludzi i bydło. Uderzenie to godzi w boga Geba, egipskie bóstwo ziemi i gleby.
13. Rytualna nieczystość kapłanów pogańskich (8:17)
Wszy stanowiły dla Egipcjan niewyobrażalną katastrofę religijną. Kapłani egipscy golili całe ciało co drugi dzień i nosili czyste lniane szaty, aby żadne robactwo nie skalało ich podczas służby bożkom. Plaga kinnim sparaliżowała cały system świątynny imperium — żaden kapłan nie mógł zbliżyć się do ołtarza będąc rytualnie nieczystym.
14. Całkowita bezsilność magii (8:18)
Czarownicy próbują swymi tajemnymi zaklęciami wywołać wszy, lecz ponoszą sromotną klęskę: „I nie mogli”. Szatan i moce demoniczne mogą manipulować istniejącymi elementami i tworzyć iluzje, ale nie mają mocy stwórczej — nie potrafią powołać życia z prochu ziemi!
15. Przełomowe wyznanie: „To jest palec Boży!” (8:19a)
Upokorzeni czarownicy stają przed faraonem i składają bezprecedensowe świadectwo: „To jest palec Boży (hebr. ecba Elohim)”. Pogańscy magowie kapitulują i przyznają, że zjawiska te przekraczają wszelkie możliwości ludzkie i demoniczne, będąc bezpośrednim działaniem Stwórcy.
16. Ślepota tyranny wobec świadectwa własnych ekspertów (8:19b)
Nawet kapitulacja własnych kapłanów i czarowników nie kruszy pychy monarchy: „Lecz serce faraona było zatwardziałe i nie usłuchał ich”. Pycha potrafi oślepić człowieka do tego stopnia, że odrzuca nawet najbardziej racjonalne i oczywiste dowody prawdy.

CZĘŚĆ III — CZWARTA PLAGA: CHMARY MUCH I ROZRÓŻNIENIE GOSZEN (Wj 8:20–24)
17. Poranne spotkanie nad wodą (8:20)
Bóg nakazuje Mojżeszowi wstać wcześnie rano i wyjść naprzeciw faraonowi nad rzekę. Suwerenny Bóg nie rezygnuje z napominania grzesznika i staje na jego drodze o świcie każdego nowego dnia.
18. Zapowiedź plagi jadowitych much i gzów (8:21)
Bóg zapowiada inwazję owadów określanych hebrajskim słowem arow — rojowiska kąsających much, gzów lub żądlących owadów, niszczących zbiory i raniących ciało. Sąd ten wymierzony jest przeciwko bóstwu Khepri, uosabianemu przez owada toczącego kulę słońca.
19. Wielkie rozróżnienie: kraina Goszen nietykalna (8:22)
W tym wersecie rozbrzmiewa fundamentalna prawda przymierza: „Lecz w owym dniu uczynię rozróżnienie dla ziemi Goszen, w której mieszka mój lud, tak że nie będzie tam żadnych much, abyś poznał, że ja jestem PAN pośrodku tej ziemi”.
20. „Postawię okup/rozdzielenie między moim ludem a twoim” (8:23)
Bóg używa hebrajskiego terminu pedut (oznaczającego wykupienie, odkupienie, rozgraniczenie). Lud Boży nie jest lepszy z natury, lecz jest chroniony przez krew przymierza i suwerenną łaskę Boga. Domy Hebrajczyków stają się oazą pokoju pośród walącego się imperium.
21. Zniszczenie ziemi egipskiej przez rojowiska (8:24)
PAN spełnia swoją zapowiedź: ogromne roje much wdzierają się do pałacu faraona, do domów jego sług i w całej ziemi egipskiej. Ziemia została doszczętnie spustoszona przez plagę.

CZĘŚĆ IV — PUŁAPKI KOMPROMISU I PONOWNY BUNT (Wj 8:25–32)
22. Pierwszy kompromis faraona: „Złóżcie ofiarę w tej ziemi” (8:25)
Faraon wzywa Mojżesza i proponuje ugodę: „Idźcie, złóżcie ofiarę waszemu Bogu w tej ziemi”. Szatan nie ma nic przeciwko temu, byś był religijny, bylebyś pozostał w „Egipcie” — w granicach systemu tego świata, bez radykalnego oddzielenia od grzechu.
23. Odpowiedź Mojżesza: Zakaz składania obrzydliwości Egipcjan (8:26)
Mojżesz bezkompromisowo odrzuca propozycję: „Nie godzi się tak czynić, gdyż ofiarowalibyśmy PANU, naszemu Bogu, obrzydliwość Egipcjan”. Izraelici mieli składać w ofierze bydło i barany — zwierzęta ubóstwiane przez Egipcjan (kult byka Apisa i barana Amona). Złożenie takiej ofiary w Egipcie wywołałoby natychmiastowe ukamienowanie ze strony pogan.
24. Wymóg trzech dni drogi na pustynię (8:27)
Mojżesz nalega na pełne posłuszeństwo Bożemu nakazowi: „Pójdziemy na odległość trzech dni drogi na pustynię i złożymy ofiarę PANU”. Prawdziwy kult wymaga całkowitego zerwania z pogańskim środowiskiem i wejścia w przestrzeń Bożej obecności.
25. Drugi kompromis faraona: „Tylko nie odchodźcie za daleko” (8:28a)
Widząc nieugiętość Mojżesza, monarcha proponuje kolejną półprawdę: „Wypuszczę was... tylko nie odchodźcie za daleko”. To kolejna pokusa wroga: bądź chrześcijaninem, ale nie bądź „fanatykiem”, nie angażuj się za bardzo, trzymaj się blisko starych znajomości i kompromisów.
26. Ponowna prośba o modlitwę wstawienniczą (8:28b)
Podobnie jak przy żabach, faraon dodaje: „Módlcie się za mną”. Tyran szuka korzyści z modlitwy sług Bożych, nie mając jednak zamiaru ukorzyć swego serca.
27. Uczciwe ostrzeżenie Mojżesza przed obłudą (8:29)
Mojżesz obiecuje modlitwę, lecz wypowiada surowe napomnienie: „Tylko niech faraon więcej nie postępuje zdradliwie, nie wypuszczając ludu, aby złożył ofiarę PANU”. Słudzy Boży nie mogą pozwalać na manipulowanie Bożym miłosierdziem.
28. Cudowne usunięcie owadów na modlitwę Mojżesza (8:30–31)
Mojżesz modli się do Pana, a Bóg usuwa chmary much od faraona, jego sług i ludu tak dokładnie, że „nie pozostała ani jedna”. Boże działanie jest doskonałe i kompletne.
29. Zatwardzenie serca po raz kolejny (8:32)
„Lecz faraon zatwardził swoje serce i tym razem, i nie wypuścił ludu”. Gdy tylko minęło bezpośrednie zagrożenie, monarcha po raz kolejny łamie przysięgę. Odrzucenie kolejnych fal łaski utwierdza człowieka w duchowej ślepocie i przygotowuje grunt pod jeszcze surowszy sąd.

JEZUS W CENTRUM — EWANGELIA W CIENIU PALCA BOŻEGO
Ósmy rozdział Księgi Wyjścia jaśnieje wspaniałym światłem Nowego Przymierza w Jezusie Chrystusie:
1. Palec Boży wypędzający ciemność (Łk 11:20):
Gdy wrogowie Jezusa oskarżali Go, że mocą Belzebuba wyrzuca demony, Zbawiciel odpowiedział słowami nawiązującymi bezpośrednio do Wj 8:19: „A jeśli Ja palcem Bożym wyganiam demony, to z pewnością przyszło do was królestwo Boże”. To, co w Egipcie sprowadziło sąd na magów, w osobie Chrystusa stało się uwalniającą mocą Ducha Świętego, niszczącą królestwo szatana i przynoszącą uzdrowienie zniewolonym!
2. Chrystus naszą Ziemią Goszen (Rz 8:1; J 10:28):
Oddzielenie ziemi Goszen od plag Egiptu jest proroczym obrazem bezpieczeństwa tych, którzy są „w Chrystusie Jezusie”. W Nim nie ma żadnego potępienia. Choć świat wokół nas pogrąża się w zamęcie, lęku i duchowej ciemności, wierzący ukryci w ranach Zbawiciela cieszą się nienaruszalnym pokojem i ochroną Ducha Świętego.
3. Krew Chrystusa jako nasz prawdziwy Pedut (Wykupienie):
Bóg powiedział w Wj 8:23: „Postawię wykupienie (pedut) między moim ludem a twoim”. Nowy Testament objawia, że naszym wiecznym Wykupicielem jest Jezus Chrystus, który „nabył nas Bogu swoją krwią z każdego plemienia, języka, ludu i narodu” (Ap 5:9; 1 P 1:18–19).
4. Odrzucenie kompromisów świata (2 Kor 6:14–18):
Odpowiedź Mojżesza wobec propozycji faraona: „złóżcie ofiarę w tej ziemi” oraz „nie odchodźcie za daleko” znajduje swoje echo w apostolskim napomnieniu: „Wyjdźcie spośród nich i odłączcie się, mówi Pan, i nieczystego się nie dotykajcie, a Ja was przyjmę”. Jezus wzywa nas do radykalnego naśladowania bez oglądania się za siebie.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Ps 78:45: „Zesłał na nich roje owadów, które ich pożerały, i żaby, które ich niszczyły”.
• Ps 105:30–31: „Zaroiła się ich ziemia od żab, nawet w komnatach ich królów. Rzekł, i przyszły roje much, i wszy na wszystkie ich granice”.
• Łk 11:20: Jezus posługujący się formułą „palec Boży” w odniesieniu do zwycięstwa nad królestwem ciemności.
• 2 Kor 6:17: Nakaz wyjścia i duchowego oddzielenia ludu Bożego od pogańskiego systemu świata.
• Ap 16:13–14: Nieczyste duchy pod postacią żab wychodzące z ust smoka w czasach ostatecznych.

POMYŚL — PYTANIA DO REFLEKSJI
1. Dlaczego faraon wolał spędzić jeszcze jedną noc z żabami, mówiąc do Mojżesza: „Jutro”? Czy w Twoim życiu nie ma grzechu lub nałogu, z którym zwlekasz, zamiast ukorzyć się przed Bogiem dzisiaj?
2. W czym przejawia się pokusa „złożenia ofiary w tej ziemi” (kompromisu z kulturą świata) we współczesnym chrześcijaństwie?
3. Jak świadomość, że jesteś Bożą „ziemią Goszen” w Chrystusie, wpływa na Twój pokój serca pośród współczesnych kryzysów i niepokojów na świecie?

MAŁY QUIZ — 20 PYTAŃ Z ODPOWIEDZIAMI
1. Jaka była druga plaga sprowadzona na Egipt według Wj 8:2?
Odpowiedź: Plaga żab (Wj 8:2).
2. Do jakich miejsc w domach Egipcjan miały wejść żaby według zapowiedzi z Wj 8:3?
Odpowiedź: Do sypialni, łóżek, domów sług, pieców i dzież na ciasto (Wj 8:3).
3. Co uczynił Aaron, aby żaby wyszły na ziemię egipską (Wj 8:6)?
Odpowiedź: Wyciągnął rękę nad wody Egiptu, a żaby wyszły i pokryły ziemię (Wj 8:6).
4. Co zrobili czarownicy egipscy w obliczu plagi żab (Wj 8:7)?
Odpowiedź: Uczynili to samo swymi czarami i również sprowadzili żaby na ziemię (Wj 8:7).
5. O co faraon poprosił Mojżesza i Aarona po raz pierwszy w Wj 8:8?
Odpowiedź: Poprosił o modlitwę do PANA, aby oddalił żaby, obiecując wypuszczenie ludu (Wj 8:8).
6. Na kiedy faraon wyznaczył termin usunięcia żab według Wj 8:10?
Odpowiedź: Na jutro (Wj 8:10).
7. W jakim celu Mojżesz pozwolił faraonowi wybrać czas ustąpienia plagi (Wj 8:10)?
Odpowiedź: Aby poznał, że nie ma nikogo takiego, jak PAN, nasz Bóg (Wj 8:10).
8. Co zrobili Egipcjanie z martwymi żabami i jaki był tego skutek (Wj 8:14)?
Odpowiedź: Zgarnęli je w wielkie stosy, a cała ziemia zasmrodziła się (Wj 8:14).
9. Jak zachował się faraon, gdy zobaczył, że nastąpiła ulga (Wj 8:15)?
Odpowiedź: Zatwardził swoje serce i nie usłuchał ich (Wj 8:15).
10. W co uderzył Aaron swoją laską przy trzeciej pladze (Wj 8:16–17)?
Odpowiedź: W proch ziemi (Wj 8:16–17).
11. W co zamienił się proch ziemi w całym Egipcie (Wj 8:17)?
Odpowiedź: We wszy (lub komary), które obsiadły ludzi i bydło (Wj 8:17).
12. Czy czarownicy zdołali powtórzyć plagę wszy swymi zaklęciami (Wj 8:18)?
Odpowiedź: Nie, nie zdołali tego uczynić (Wj 8:18).
13. Co powiedzieli czarownicy do faraona, gdy nie mogli wywołać wszy (Wj 8:19)?
Odpowiedź: „To jest palec Boży” (Wj 8:19).
14. Gdzie Mojżesz miał spotkać faraona przed zapowiedzią czwartej plagi (Wj 8:20)?
Odpowiedź: Wcześnie rano nad wodą (Wj 8:20).
15. Jaka była czwarta plaga zapowiedziana w Wj 8:21?
Odpowiedź: Rojowiska kąsających much i gzów (Wj 8:21).
16. Jaką krainę Bóg w cudowny sposób wyodrębnił i uchronił przed plagą much (Wj 8:22)?
Odpowiedź: Ziemię Goszen, w której mieszkał lud Boży (Wj 8:22).
17. Jaki pierwszy kompromis zaproponował faraon Mojżeszowi w Wj 8:25?
Odpowiedź: Zaproponował, aby złożyli ofiarę Bogu w tej ziemi (w Egipcie) (Wj 8:25).
18. Dlaczego Mojżesz odmówił składania ofiar w ziemi egipskiej (Wj 8:26)?
Odpowiedź: Ponieważ składaliby ofiarę będącą obrzydliwością dla Egipcjan i zostaliby ukamienowani (Wj 8:26).
19. Jaki drugi kompromis zaproponował faraon w Wj 8:28?
Odpowiedź: Pozwolił odejść na pustynię, ale zastrzegł: „tylko nie odchodźcie za daleko” (Wj 8:28).
20. Co uczynił faraon po tym, jak Bóg na modlitwę Mojżesza usunął wszystkie muchy (Wj 8:32)?
Odpowiedź: Ponownie zatwardził swoje serce i nie wypuścił ludu (Wj 8:32).

TWOJA DECYZJA
Ósmy rozdział Księgi Wyjścia obnaża odwieczną walkę pomiędzy suwerennym wezwaniem Boga do radykalnego posłuszeństwa a subtelnymi propozycjami kompromisu płynącymi ze strony tego świata. Faraon reprezentuje postawę człowieka, który w obliczu kryzysu szuka ulgi i prosi o modlitwę, lecz gdy tylko mija ból, powraca do swego uporu. Co więcej, próbuje negocjować z Bogiem: „służcie Mu, ale w Egipcie”, „idźcie, ale nie za daleko”.
Bóg nie przyjmuje jednak połowicznego oddania. On żąda całego serca i wyprowadza swój lud na odległość trzech dni drogi — poza granice kompromisu, w przestrzeń przymierza i wolności. Cudowna ochrona ziemi Goszen przypomina nam, że ci, którzy należą do Boga, nie muszą lękać się plag i zamętu tego świata. W Jezusie Chrystusie otrzymaliśmy wieczne schronienie, a Jego Duch Święty — Palec Boży — kruszy wszelkie demoniczne więzy w naszym życiu.
MOJA DECYZJA: Panie Boże Wszechmogący, wyznaję, że Ty jesteś moim jedynym Panem i Zbawicielem. Odrzucam dziś wszelkie kompromisy ze światem — nie chcę zatrzymywać się w połowie drogi ani służyć Ci na warunkach dyktowanych przez kulturę tego świata. Dziękuję Ci za Jezusa Chrystusa, który swoim Duchem — Palcem Bożym — wyzwolił mnie z niewoli ciemności i uczynił mnie mieszkańcem bezpiecznej Ziemi Goszen. Wybieram bezkompromisowe posłuszeństwo Twojemu Słowu każdego dnia.

MODLITWA NA 8 LISTOPADA
Wszechmogący, Święty i Sprawiedliwy Boże, Panie niebios i ziemi!
W ten niedzielny poranek stajemy przed Twoim majestatem z sercami pełnymi czci i uwielbienia za Twoją absolutną suwerenność objawioną w ósmym rozdziale Księgi Wyjścia. Ty jesteś Bogiem, przed którego potęgą uginają się dumni władcy, a najpotężniejsi magowie tego świata zmuszeni są wyznać: „To jest palec Boży!”.
Dziękujemy Ci, Ojcze, za Twoją ojcowską opiekę nad Twoim ludem. Dziękujemy, że tak jak w starożytności oddzieliłeś krainę Goszen od niszczycielskich plag Egiptu, tak dzisiaj w Jezusie Chrystusie dajesz nam nienaruszalne schronienie, pokój i zbawienie. Choć wokół nas świat pogrąża się w niepokoju i grzechu, my jesteśmy bezpieczni w Twoim wyciągniętym ramieniu.
Przebacz nam, Panie, każdą pokusę kompromisu z duchem tego świata. Wybacz chwile, w których próbowaliśmy łączyć świętość z ziemskimi nawykami, i zachowaj nas przed obłudą faraona, który wołał o ulgę, a po jej otrzymaniu zatwardzał swoje serce. Daj nam serca miękkie, prawe i posłuszne Twojemu Słowu.
Panie Jezu Chryste, dziękujemy Ci, że Ty palcem Bożym wypędzasz wszelką ciemność z naszego życia. Dziękujemy za Twoją krew przelaną na krzyżu, która jest naszą wieczną tarczą. Prowadź nas w ten niedzielny dzień w mocy Twojego Ducha i spraw, aby nasze życie przynosiło Ci chwałę. W Imieniu Jezusa Chrystusa. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj osobiście cały ósmy rozdział Księgi Wyjścia (Wj 8:1–32) w przekładzie UBG.
2. Zbadaj swoje serce: czy w Twoim życiu nie ma obszaru, w którym mówisz Bogu „jutro” zamiast poddać się Jego woli dzisiaj?
3. Zidentyfikuj ewentualne „kompromisy faraona” — sfery, w których duch tego świata namawia Cię, byś „nie odchodził za daleko” w wierze.
4. Podziękuj Bogu w modlitwie za duchową „Ziemię Goszen” — za nienaruszalne bezpieczeństwo i pokój, jakie masz w Jezusie Chrystusie.
5. Przeczytaj słowa Pana Jezusa z Ewangelii Łukasza 11:14–23 o Palcu Bożym wypędzającym demony.
6. Porozmawiaj z kimś z rodziny lub wspólnoty o niebezpieczeństwie nieszczerej religijności, która szuka Boga tylko w czasie kryzysu.
7. Udostępnij dzisiejszą lekcję lub werset pamięciowy osobie potrzebującej Bożego pokoju i pocieszenia.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 9 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 40 — „POMÓR BYDŁA, WRZODY I GRAD: BOŻA MOC NAD POTĘGĄ NATURY”
Czytanie: Wj 9:1–35. Batalia wkracza w dramatyczną fazę! Plaga zarazy niszczy stada Egipcjan, garść sadzy z pieca rzucona ku niebu wywołuje piekące wrzody u ludzi i zwierząt, a z nieba spada bezprecedensowy grad z ogniem, jakiego Egipt nie widział od początku swego istnienia. Wróć jutro, aby zobaczyć, dlaczego Bóg rzekł do faraona: „Właśnie po to cię zachowałem, aby okazać na tobie moją moc i by rozsławiono moje imię po całej ziemi”!`;

// 2. Zapisujemy treść lekcji w scripts/content/kc-day39-lesson.txt
fs.writeFileSync(path.join(process.cwd(), 'scripts/content/kc-day39-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day39-lesson.txt');

// 3. Budujemy oficjalny plik Microsoft Word (.docx) wg wytycznych GPT
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
        
        // Numerowane podsekcje (np. "1. Tytuł (8:1)")
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

// Zapisujemy .docx na Pulpit oraz na Google Drive @OA
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

// 4. Budujemy 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 39 (8 listopada 2026): Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen (Wj 8:1–32)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Dziewiąty

Czy zauważyłeś kiedyś, jak często człowiek w obliczu życiowego kryzysu woła do Boga o ratunek, a gdy tylko mija ból i wraca spokój, natychmiast zapomina o swoich obietnicach i powraca do dawnych nawyków?

Zatrzymaj się w ten niedzielny poranek, ósmego listopada dwa tysiące dwudziestego szóstego roku, i spójrz w kochające oblicze Twojego Ojca w niebie. Pozwól, by w ciszy Twojego serca wybrzmiało to osobiste pytanie: Tato, czy moje serce jest naprawdę szczere i oddane Tobie w całości, czy też szukam Ciebie jedynie jako koła ratunkowego w trudnych chwilach, a potem próbuję negocjować z Tobą kompromisy?

W ósmym rozdziale Księgi Wyjścia jesteśmy świadkami eskalacji duchowej bitwy o wolność Bożego ludu. Po sądzie nad Nilem na Egipt spadają trzy kolejne plagi: żaby, wszy oraz jadowite muchy. Każda z nich uderza w fundamenty pogańskiego kultu. Żaby, czczone jako bóstwo płodności, wdzierają się do sypialni, łóżek i pieców chlebowych, zamieniając pogańską dumę w odrazę. Następnie proch ziemi uderzony laską Aarona zamienia się we wszy. I wtedy dzieje się coś przełomowego: egipscy czarownicy, którzy dotąd naśladowali znaki swymi tajemnymi sztukami, ponoszą całkowitą klęskę. Stają przed faraonem i z przerażeniem wyznają: To jest palec Boży!

Zło ma swoje granice. Może kusić, zwodzić i imitować, ale nie ma mocy tworzyć życia z prochu ziemi ani powstrzymać Bożego wyroku. Lecz zamiast ukorzyć się przed Stwórcą, faraon brnie w zatwardziałość. Wtedy nadchodzi czwarta plaga — chmary niszczycielskich much. I tu Bóg wypowiada słowa, które są balsamem dla każdego wierzącego serca: Uczynię rozróżnienie dla ziemi Goszen, w której mieszka mój lud. W całym Egipcie panuje zniszczenie i groza, lecz w domach Bożych dzieci panuje nienaruszalny pokój i bezpieczeństwo!

Gdy faraon widzi bezradność swoich bóstw, zaczyna proponować kompromisy: Ofiarujcie waszemu Bogu w tej ziemi, a potem: Idźcie, tylko nie odchodźcie za daleko. Jakże dobrze znamy tę taktykę wroga! Zły duch nie boi się religijności, dopóki pozostajesz w granicach kompromisu ze światem. Lecz Mojżesz odpowiada zdecydowanie: musimy odejść na odległość trzech dni drogi na pustynię! Prawdziwe uwielbienie Boga wymaga całkowitego zerwania z niewolą grzechu.

W Jezusie Chrystusie ta prawda nabiera wiecznego blasku. Pan Jezus powiedział: Jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże. Krzyż Chrystusa jest naszą Ziemią Goszen. W Nim jesteś bezpieczny, odkupiony i chroniony przed potępieniem tego świata. Nie zgadzaj się dziś na żadne kompromisy ze starym życiem. Służ Panu całym sercem w wolności, którą wywalczył dla Ciebie Zbawiciel. Błogosławionej, pełnej pokoju i zwycięstwa niedzieli!

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 39 (8 listopada 2026 r.)
📖 Księga Wyjścia 8:1–32: Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen

Czy wiesz, co dzieje się, gdy człowiek próbuje targować się z Bogiem i składać Mu ofiary na własnych, kompromisowych warunkach?

W 39. dniu naszej 66-miesięcznej podróży przez całe Pismo Święte (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 8. rozdział Księgi Wyjścia (Wj 8:1–32: https://polskieradio.cc/mojabiblia?ref=Wj8:1-32). Duchowe starcie z panteonem Egiptu wkracza w decydującą fazę.

Kluczowe filary dzisiejszego studium:

1. Druga plaga — inwazja żab (Wj 8:1–15):
Żaby były w Egipcie ucieleśnieniem bogini Heket, patronki płodności i narodzin. Bóg sprawia, że bożek płodności wdziera się do sypialni, pieców i misek, stając się źródłem wstrętu i rozpaczy. Czarownicy powiększają plagę, lecz nie potrafią jej usunąć. Faraon prosi o modlitwę, lecz na pytanie o termin odpowiada: „Jutro” — woląc spędzić jeszcze jedną noc pośród żab, byle odsunąć moment ukorzenia się przed Bogiem.

2. Trzecia plaga — proch we wszy i kapitulacja magów (Wj 8:16–19):
Uderzenie w proch ziemi uderza w bóstwo Geba. Czarownicy po raz pierwszy ponoszą sromotną klęskę i wyznają przed władcą: „To jest palec Boży!” (hebr. ecba Elohim). Szatan nie potrafi stworzyć życia z prochu ani unieważnić Bożego sądu.

3. Czwarta plaga — rojowiska much i rozróżnienie Goszen (Wj 8:20–24):
Bóg wprowadza epokowe rozróżnienie (hebr. pedut — wykupienie, rozdzielenie): ziemia Goszen, w której mieszka lud przymierza, pozostaje całkowicie nienaruszona! Podczas gdy Egipt obraca się w ruinę, domy Izraelitów cieszą się Bożą ochroną.

4. Dwa kompromisy tyrana (Wj 8:25–32):
Faraon proponuje półśrodki:
• Kompromis 1: „Złóżcie ofiarę w tej ziemi” (bądźcie wierzący, ale w ramach świeckiego systemu).
• Kompromis 2: „Tylko nie odchodźcie za daleko” (nie bądźcie radykalni w wierze).
Mojżesz odrzuca oba: służba Bogu wymaga wyjścia na 3 dni drogi i całkowitego oddzielenia od grzechu.

5. Chrystus w Centrum — Palec Boży i Nasze Goszen:
Jezus Chrystus nawiązał do Wj 8:19, mówiąc: „A jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże” (Łk 11:20). W Chrystusie mamy naszą duchową Ziemię Goszen: wieczne bezpieczeństwo, wolność od potępienia i moc do życia bez kompromisów ze złem.

Kompletna lekcja biblijna z 36 punktami egzegezy, studium porównawczym, 20 pytaniami quizu i autozapisem decyzji:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-39

Błogosławionej niedzieli w cieniu zwycięskiego Zbawiciela! 🕊️

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 39 (Wj 8:19): „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży!”. Moce ciemności są bezsilne wobec Króla królów, a w Chrystusie jesteś bezpieczny jak lud Boży w ziemi Goszen. Odrzuć wszelkie kompromisy ze światem i odpocznij w Bożej wierności. Błogosławionej nocy! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym grafika 16:9: przerażeni czarownicy egipscy na pałacowym tarasie upuszczający laski i zwoje, wskazujący palcem w górę w geście poddania, podczas gdy za ciemną, nękaną plagami doliną Nilu jaśnieje zielona, oświetlona promieniami niebios ziemia Goszen. Tytuł: DZIEŃ 39 — TO JEST PALEC BOŻY!

[INTRO: ESKALACJA BITWY O DUSZĘ NARODU]
Noemi: Dzień dobry! Witamy państwa w trzydziestym dziewiątym dniu programu „Z Biblią za Pan Brat” na antenie Christian Culture TV. Dziś otwieramy ósmy rozdział Księgi Wyjścia — rozdział, w którym pękają ostatnie złudzenia pogańskiego Egiptu!
Sara: Witamy serdecznie! Wczoraj widzieliśmy krew w Nilu. Dziś oglądamy trzy kolejne plagi: żaby, wszy i chmary jadowitych much. Ale w tym rozdziale dzieją się dwie rzeczy fundamentalne, które zmieniają bieg całej historii: po pierwsze, kapitulacja egipskich czarowników, a po drugie — cudowne rozróżnienie ziemi Goszen!

[ANALIZA PROBLEMOWA: KAPITULACJA MAGII I ROZRÓŻNIENIE GOSZEN]
Noemi: Zobaczmy najpierw plagę żab. Żaba była w Egipcie czczona jako bogini Heket — bóstwo płodności. I nagle ten bożek wdziera się wszędzie: do sypialni, pod kołdry, do pieców z chlebem! Bóg demaskuje fałszywych bogów: to, co ludzie ubóstwiają poza Stwórcą, staje się dla nich źródłem obrzydzenia i udręki!
Sara: A potem przychodzi trzecia plaga — proch zamieniony we wszy. Czarownicy próbują to powtórzyć swymi zaklęciami, ale ponoszą totalną klęskę! I to właśnie oni — elita okultystyczna imperium — stają przed faraonem i mówią słowa, które przeszły do historii: „To jest palec Boży!”. Pogańscy magowie uznali wyższość Boga JAHWE, podczas gdy faraon nadal tkwił w zatwardziałości!
Noemi: A przy czwartej pladze Bóg mówi: „Uczynię rozróżnienie dla ziemi Goszen!”. Cały Egipt tonie w rojach much i zniszczeniu, a w Goszen — tam, gdzie mieszka lud przymierza — nie ma ani jednej muchy! To jest obraz Bożej ochrony nad tymi, którzy należą do Niego!

[CHRYSTUS W CENTRUM: PALEC BOŻY I NASZE SCHRONIENIE]
Sara: I pomyślmy, jak to wspaniale wypełnia się w Jezusie Chrystusie! W Ewangelii Łukasza 11:20 Jezus mówi: „A jeśli Ja palcem Bożym wyganiam demony, to przyszło do was Królestwo Boże!”. Palec Boży, który w Egipcie obnażył czarowników, w Chrystusie kruszy wszelkie jarzmo grzechu i szatana!
Noemi: A Krzyż Chrystusa jest naszą Ziemią Goszen! W Nim jesteśmy bezpieczni przed sądem, w Nim mamy pokój, którego świat dać nie może. Dlatego Mojżesz nie zgodził się na kompromisy faraona: „złóżcie ofiarę w tej ziemi” czy „nie idźcie za daleko”. Z Jezusem idziemy na sto procent, bez kompromisów!

[SŁOWO ROZKAZU & ZADANIE TAKTYCZNE]
Sara: Nasze hasło na dziś: „Wtedy czarownicy powiedzieli do faraona: To jest palec Boży!” (Wj 8:19).
Noemi: Otwórzcie dziś ósmy rozdział na polskieradio.cc/akademia. Zbadajcie swoje serce: czy nie odkładacie upamiętania na „jutro” jak faraon? I czy nie idziecie na kompromisy ze światem? Odpocznijcie w Bożej Ziemi Goszen!

[MODLITWA BOJOWA]
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci za Twoją suwerenną moc, przed którą milkną moce ciemności. Dziękujemy za Jezusa Chrystusa, który palcem Bożym uwolnił nas z niewoli grzechu i uczynił nas mieszkańcami Ziemi Goszen. Zachowaj nas przed kompromisami tego świata i napełnij nas Twoim świętym pokojem. Amen!”

[OUTRO]
Noemi: Wszystkie materiały, quiz i komentarze znajdziecie bezpłatnie na polskieradio.cc.
Sara: Do zobaczenia jutro w dziewiątym rozdziale! Czytaj, wierz, działaj. Dla Jezusa!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: KAPITULACJA OKULTYZMU EGIPSKIEGO I TEOLOGIA ODDZIELENIA GOSZEN: ANALIZA EGZEGETYCZNA WJ 8:1–32

Autorzy: Cezary Rogowski, Wioletta Rogowska | Publikacja: 8 listopada 2026 r.

W ramach ogólnopolskiego programu studiów biblijnych „Z Biblią za Pan Brat”, redakcja naukowa portalu CCN publikuje egzegetyczne studium ósmego rozdziału Księgi Wyjścia. Rozdział ten dokumentuje drugą fazę konfrontacji teologicznej pomiędzy Bogiem JAHWE a panteonem imperium egipskiego, obejmując plagę żab (Wj 8:1–15), wszy (Wj 8:16–19) oraz gzów i much (Wj 8:20–32).

1. DESTRUKCJA KULTU HEKET I PSYCHOLOGIA ZWŁOKI (WJ 8:1–15)
Plaga żab uderzała bezpośrednio w kult bogini Heket — bóstwa z głową żaby, czczonego jako uosobienie witalności i płodności nilowej. Masowe pojawienie się płazów w przestrzeniach domowych i kuchennych obróciło symbol kultu w źródło sanitarnej i rytualnej zgnilizny. Istotnym rysem psychologicznym jest odpowiedź faraona na pytanie Mojżesza o termin modlitwy wstawienniczej: monarcha wybiera „jutro” (w. 10), co w analizie pastoralnej stanowi klasyczny przykład prokrastynacji duchowej grzesznika unikającego natychmiastowej kapitulacji przed Bogiem.

2. KAPITULACJA MAGII I FORMUŁA „PALEC BOŻY” (WJ 8:16–19)
Trzecia plaga (kinnim — wszy lub komary z prochu ziemi) wyznacza granicę możliwości egipskiej kasty hartummim (magów i kapłanów wróżbitów). Podczas gdy magowie zdołali zreplikować zamianę laski w węża, uderzenie w Nil i plagę żab, nie potrafili powołać życia z prochu ziemi (Wj 8:18). Ich publiczne wyznanie: „To jest palec Boży (ecba Elohim)” (w. 19) stanowi prawno-religijne uznanie transcendencji Stwórcy nad demonicznymi manipulacjami pogaństwa.

3. KRAINA GOSZEN JAKO PRZESTRZEŃ „PEDUT” (WJ 8:20–24)
Przy czwartej pladze Bóg po raz pierwszy wprowadza zasadę widzialnego oddzielenia: kraina Goszen zostaje całkowicie wyłączona spod działania rojowisk much. Kluczowy termin hebrajski pedut (w. 23) oznacza wykupienie, rozgraniczenie o charakterze zbawczym. Lud przymierza doświadcza nietykalności nie z racji własnych zasług etycznych, lecz na mocy suwerennego przymierza łaski.

4. DIALEKTYKA KOMPROMISÓW: POKUSA POŁOWICZNEJ RELIGIJNOŚCI (WJ 8:25–32)
W obliczu dewastacji kraju faraon formułuje dwie propozycje kompromisowe:
a) „Złóżcie ofiarę w tej ziemi” (w. 25) — próba zatrzymania kultu w granicach systemu egipskiego;
b) „Tylko nie odchodźcie za daleko” (w. 28) — próba ograniczenia radykalizmu wiary.
Mojżesz kategorycznie odrzuca obie opcje, wskazując na konieczność triduum viatorum (trzech dni drogi na pustynię) oraz na niemożliwość składania Bogu „obrzydliwości Egipcjan” (ubóstwianych zwierząt).

5. CHRYSTOCENTRYCZNA REALIZACJA MOTYWU
Formuła „palca Bożego” powraca w nauczaniu Jezusa Chrystusa w Łk 11:20 jako znak inauguracji Królestwa Bożego poprzez egzorcyzmowanie mocy szatańskich. Chrystus jest ostateczną Ziemią Goszen dla wierzących — w Nim lud Boży otrzymuje uwolnienie od gniewu i wieczne bezpieczeństwo przymierza.

📌 PODSUMOWANIE REDAKCYJNE CCN
Ósmy rozdział Księgi Wyjścia uczy, że kompromis ze światem uniemożliwia prawdziwy kult Boga. Wolność przymierza wymaga całkowitego wyjścia z Egiptu i zaufania Temu, którego Palec kruszy pychę najpotężniejszych ziemskich imperiów.

🌐 Źródła i powiązane serwisy: polskieradio.cc | polskieradio.cc/lumina | cclite.pl
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts/content/pakiet-day39-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day39-5wersji.md');

// 5. Dopisujemy do bazy rozwazania_baza.md
const bazaPath = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.md';
if (fs.existsSync(bazaPath)) {
  fs.appendFileSync(bazaPath, '\n\n' + pakiet5Wersji, 'utf8');
  console.log('✅ Dopisano pakiet do rozwazania_baza.md');
}

console.log('🎉 Komplet lekcji, DOCX i 5-wersyjnego pakietu Dnia 39 wygenerowane pomyślnie!');
