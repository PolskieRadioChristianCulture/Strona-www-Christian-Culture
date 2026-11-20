import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 48: Wj 18:1–27 (17 listopada 2026, Wtorek)
const DAY_NUM = 48;
const DATE_STR = '2026-11-17';
const DATE_FORMATTED = 'Wtorek, 17 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 18:1–27';
const TITLE = 'RADY JETRY, MĄDROŚĆ DELEGOWANIA I WSPÓLNOTA SŁUŻBY — PRZYWÓDZTWO WEDŁUG BOŻEGO PORZĄDKU';
const SUBTITLE = 'Przybycie teścia Mojżesza z Seforą i synami, wyznanie wiary i ofiara Jetry, przeciążenie sędziego Izraela, mądra rada podziału odpowiedzialności oraz wybór bogobojnych i prawdomównych przywódców (Wj 18:1–27)';
const MEMORY_VERSE = '„Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.” (Wj 18:21, UBG)';
const THEME = 'Osiemnasty rozdział Księgi Wyjścia to ponadczasowy traktat o biblijnej mądrości organizacyjnej, pokorze przywódczej i budowaniu zdrowej wspólnoty wiary. Po zwycięstwie nad Amalekiem Izrael dociera pod górę Boga, gdzie Mojżesza odwiedza jego teść Jetro, kapłan Midianu, przyprowadzając żonę Seforę oraz dwóch synów: Gerszoma i Eliezera. Na wieść o wielkich dziełach Bożych Jetro wyznaje wiarę w najwyższego PANA i składa Mu ofiary przymierza wraz z Aaronem i starszyzną. Nazajutrz jednak Jetro dostrzega paraliżujący problem: Mojżesz samotnie od rana do wieczora rozsądza spory całego ludu. Diagnoza mądrego teścia jest bezwzględna: „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”. Jetro przedstawia genialną reformę: Mojżesz ma zachować rolę orędownika i nauczyciela Bożych praw, a bieżące sądownictwo przekazać zaufanym mężom dzielnym, bogobojnym, prawdomównym i nienawidzącym chciwości, ustanowionym nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Mojżesz w głębokiej pokorze przyjmuje radę i wdraża ją w życie, przywracając pokój i ład w obozie. W świetle Nowego Testamentu historia ta zapowiada organizację Kościoła apostolskiego (Dz 6; 1 Tm 3; Tt 1) oraz wskazuje na Chrystusa — Jedynego doskonałego Pośrednika, który obdarza swoje Ciało różnorodnymi darami łaski i powołuje nas do wzajemnego niesienia ciężarów!';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 48 (Wj 18:1–27)...');

// ── 1. CZYTANIE DNIA (UBG) ──
const exo18Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-018.json');
const exo18Data = JSON.parse(fs.readFileSync(exo18Path, 'utf8'));

const readingVerses = exo18Data.verses.map(v => ({ ref: `Wj 18:${v.number}`, num: v.number, text: v.text }));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 18:1–12 — Przybycie Jetry, świadectwo Mojżesza, wyznanie wiary i wspólna ofiara przed Bogiem</h3></div>',
  ...exo18Data.verses.filter(v => v.number <= 12).map(v => `<p><span class="verse-num">18:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 18:13–27 — Przeciążenie Mojżesza, diagnoza i rada Jetry, wybór sędziów i pokój ludu</h3></div>',
  ...exo18Data.verses.filter(v => v.number >= 13).map(v => `<p><span class="verse-num">18:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 48 (17 listopada 2026): Rady Jetry, Mądrość Delegowania i Wspólnota Służby (Wj 18:1–27)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Ósmy

Czy nosisz w sobie przekonanie, że musisz zrobić wszystko sam, bo nikt inny nie dopilnuje spraw tak dokładnie jak Ty?

Zatrzymaj się w ten wtorkowy poranek, siedemnastego listopada dwa tysiące dwudziestego szóstego roku. Weź głęboki oddech i spójrz prawdzie w oczy: samotne dźwiganie wszystkich spraw nie jest dowodem wielkiej wiary, lecz prostą drogą do wycieńczenia serca i zranienia tych, którym służysz. W ciszy modlitwy zadaj bezkompromisowe pytanie swojemu Ojcu: Tato, dlaczego tak bardzo boję się zaufać innym i dlaczego pozwalam, by fałszywa duma wpędzała mnie w samotny pracoholizm?

W osiemnastym rozdziale Księgi Wyjścia lud Boży dociera pod świętą górę Horeb. Na wieść o wielkich dziełach Pana przybywa Jetro, teść Mojżesza, przyprowadzając jego żonę Seforę oraz dwóch synów. Po radosnym powitaniu, wysłuchaniu świadectwa i złożeniu ofiar, nazajutrz Jetro obserwuje codzienną posługę zięcia. Widzi Mojżesza siedzącego samotnie na stolcu sędziowskim od wczesnego rana aż do zachodu słońca, podczas gdy tysiące znużonych ludzi stoją w palącym pyle pustyni, czekając na rozstrzygnięcie sporów. Mądry teść stawia odważną diagnozę: Niedobra to rzecz, którą czynisz! Zamęczysz się i ty, i ten lud, który jest z tobą. Ta sprawa jest zbyt ciężka dla ciebie. Sam jej nie podołasz!

Psychologia przywództwa, zarządzania i wypalenia zawodowego jednoznacznie potwierdza tę biblijną prawdę: syndrom samotnego bohatera prowadzi nieuchronnie do zgorzknienia, chronicznego zmęczenia i paraliżu całej społeczności. Jetro nie kwestionował powołania Mojżesza, lecz wskazał na mądry podział ról. Mojżesz miał pozostać nauczycielem Bożych ustaw i orędownikiem przed Bogiem, a bieżące rozsądzanie spraw przekazać sprawdzonym współpracownikom — mężom dzielnym, bojącym się Boga, prawdomównym i nienawidzącym chciwości, ustanowionym nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Największy prorok Izraela nie obraził się na teścia, lecz w głębokiej pokorze przyjął radę i natychmiast ją wdrożył!

Prawda Królestwa uderza z wyzwalającą mocą: Bóg nie stworzył Cię samowystarczalną wyspą. Jezus Chrystus nie powołał solistów, lecz zbudował swoje Ciało — żywy Kościół, w którym każdy członek ma swoje niezastąpione miejsce i dar Ducha Świętego do wzajemnej posługi.

Jezus mówi dziś do Ciebie:
„Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek. Weźcie na siebie moje jarzmo i uczcie się ode mnie, że jestem cichy i pokornego serca, a znajdziecie odpoczynek dla waszych dusz. Moje bowiem jarzmo jest przyjemne, a moje brzemię lekkie.” (Ewangelia według świętego Mateusza, rozdział jedenasty, wersety od dwudziestego ósmego do trzydziestego, UBG)

Zadanie Taktyczne:
Na swoim wtorkowym posterunku przełam schemat samotnika. Zidentyfikuj dziś jedno zadanie lub odpowiedzialność, którą próbujesz nieść sam, i w zaufaniu przekaż je zaufanej osobie lub poproś brata albo siostrę o pomoc. Porzuć iluzję niezastąpioności. Wyznaj na głos: Moja wartość płynie z łaski Chrystusa, a nie z mojej samowystarczalności.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za mądrość Twojego Słowa i za dar wspólnoty. Wybacz mi pychę i lęk, które każą mi wszystko kontrolować samemu. Daj mi pokorę Mojżesza, bym potrafił słuchać mądrych rad i dzielić się odpowiedzialnością. Uczyń mnie człowiekiem prawdomównym, bojącym się Ciebie i nienawidzącym wszelkiej chciwości. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Otwórz swoje serce na sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Wejdź do bazy ludzi z pasją, zintegruj swoje siły z innymi i buduj Boży porządek oparty na zaufaniu i wzajemnym wsparciu.

Błogosławieństwo:
Niech Pan zastępów obdarzy Cię mądrością i pokojem. Niech uwolni Cię od paraliżującego ciężaru i otoczy wiernymi ludźmi, z którymi w jedności będziesz budować Jego Królestwo. Dobrego dnia! Podaj dalej.

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 48 (17 listopada 2026 r.)
📖 Księga Wyjścia 18:1–27: Rady Jetry, Mądrość Delegowania i Wspólnota Służby — Przywództwo według Bożego Porządku

Czy potrafisz rozpoznać granice własnych sił i budować Boże dzieło we wspólnocie zaufania?

W 48. dniu formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) obóz Izraela staje u stóp góry Boga na pustyni Synaj (Wj 18:1–27: https://polskieradio.cc/mojabiblia?ref=Wj18:1-27). Do Mojżesza przybywa jego teść Jetro, kapłan Midianu, przyprowadzając Seforę oraz synów Gerszoma i Eliezera.

Kluczowe filary dzisiejszego studium:
1. Świadectwo i Wyznanie Wiary (Wj 18:1–12): Mojżesz opowiada Jetrze o całym trudzie drogi i wybawieniu z ręki faraona. Jetro wielbi Boga: „Teraz wiem, że PAN jest większy od wszystkich bogów!”. Składa całopalenia, a Aaron i starsi Izraela zasiadają z nim do wspólnego chleba przed Bogiem.
2. Diagnoza Wypalenia i Przeciążenia (Wj 18:13–18): Mojżesz samotnie sądzi spory od rana do wieczora. Jetro wypowiada przełomowe słowa: „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”. Samotne przywództwo jest pułapką dla lidera i udręką dla ludu.
3. Cztery Cnoty Prawdziwego Lidera (Wj 18:21): Jetro podaje niezmienne biblijne kryteria doboru współpracowników:
   • Mężowie dzielni (anszej chajil) — o niezłomnym kręgosłupie moralnym i odwadze.
   • Bojący się Boga (jirej Elohim) — kierujący się Bożą sprawiedliwością, a nie opinią ludzi.
   • Prawdomówni (anszej emet) — rzetelni, uczciwi, wierni faktom.
   • Nienawidzący chciwości (sonei waca) — wolni od pokusy zysku, łapówek i partykularnych interesów.
4. Struktura Zdecentralizowanej Służby (Wj 18:19–23): Mojżesz zachowuje to, co najważniejsze: orędownictwo przed Bogiem i nauczanie praw. Sprawy codzienne rozsądzają liderzy nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Efekt: trwałość służby i pokój ludu.
5. Pokora Mojżesza i Nowy Testament (Wj 18:24–27; Dz 6:1–7): Największy prorok pokornie słucha rady teścia. Ten model powraca w Dziejach Apostolskich przy ustanowieniu siedmiu diakonów, aby apostołowie mogli trwać w modlitwie i posłudze Słowa.

Zadanie Taktyczne:
• Czytaj: Wj 18:1–27 oraz Dz 6:1–7.
• Wierz: Twoją siłą nie jest samowystarczalność, lecz Chrystus, który powołuje całe Ciało do współpracy (1 Kor 12).
• Działaj: Zidentyfikuj obszar przeciążenia w swojej pracy lub wspólnocie i wdroż mądrość Jetry — podziel się odpowiedzialnością z zaufanymi ludźmi.

Studiuj pełny tekst, kody Stronga i komentarz werset po wersecie:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-48

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://patronite.pl/osobowoscplus

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 48 (Wj 18:21): „Upatrz sobie mężów dzielnych, bojących się Boga, prawdomównych i nienawidzących chciwości”. Nie dźwigaj wszystkiego sam. Zaufaj wspólnocie w Chrystusie! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, ciepłe studio Christian Culture TV w kolorystyce ciemnego szafiru i szlachetnego złota Champagne Gold (#C4A35A). Na wielkoformatowym ekranie w tle grafika 16:9: pustynny obóz Izraela u stóp majestatycznej góry Synaj, w centrum Mojżesz rozmawiający z teściem Jetrą przed namiotem przymierza, a wokół zgromadzeni sprawiedliwi starsi i zorganizowane grupy ludu radzące w pokoju i ładzie. Tytuł audycji: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 48: RADY JETRY I MĄDROŚĆ DELEGOWANIA”.

[INTRO: PUŁAPKA SAMOTNEGO BOHATERA]
Noemi: Dzień dobry! Witamy bardzo serdecznie w czterdziestym ósmym dniu naszej codziennej podróży przez sześćdziesiąt sześć ksiąg Pisma Świętego! Czy zdarzyło Ci się kiedyś poczuć, że cały świat spoczywa wyłącznie na Twoich barkach? Że jeśli Ty czegoś nie dopilnujesz, nie załatwisz i nie naprawisz, to wszystko runie?
Sara: Witaj, Noemi, witamy wszystkich naszych widzów i słuchaczy! To jedno z najczęstszych kłamstw, w jakie wpadają ludzie pełni pasji, gorliwości i odpowiedzialności. I dzisiejszy, osiemnasty rozdział Księgi Wyjścia pokazuje nam, że w tę samą pułapkę wpadł największy z przywódców Starego Testamentu — sam Mojżesz!
Noemi: Wyobraźmy sobie tę scenę: Izrael rozbija obóz u stóp góry Boga po wyjściu z Egiptu i bitwie z Amalekiem. Przybywa Jetro, teść Mojżesza, kapłan Midianu, przyprowadzając żonę Mojżesza Seforę oraz dwóch synów: Gerszoma i Eliezera. Po radosnym powitaniu i wzruszającej uczcie przymierza, nazajutrz Jetro widzi coś, co wprawia go w osłupienie.
Sara: Mojżesz siada rano na krześle sędziowskim. Przed nim kłębi się tłum setek tysięcy ludzi z tysiącami sporów — od granic miedzy po kradzieże i rodzinne sprzeczki. Słońce praży, ludzie stoją od rana do nocy, a Mojżesz z anielską cierpliwością próbuje osobiście rozwiązać każdy pojedynczy przypadek!

[ANALIZA PROBLEMOWA: DIAGNOZA JETRY I CZTERY CNOTY LIDERÓW]
Noemi: I wtedy Jetro podchodzi do Mojżesza i zadaje genialne, proste pytanie: „Cóż to jest, co ty czynisz dla ludu? Dlaczego ty siedzisz sam, a cały lud stoi przed tobą od rana aż do wieczora?”. A gdy Mojżesz tłumaczy, że lud przychodzi radzić się Boga, Jetro odpowiada bez ogródek: „Niedobra to rzecz, którą czynisz! Zamęczycie się i ty, i ten lud... Sam jej nie podołasz!”.
Sara: Jakie to potężne słowa! Jetro nie mówi, że Mojżesz robi coś złego moralnie. On mówi: to, co robisz, jest organizacyjnie niszczące. Jeśli się nie zmienisz, wypalisz się i zniszczysz ludzi, których kochasz. I daje mu radę, która stała się fundamentem zdrowego zarządzania na tysiąclecia.
Noemi: Mojżesz ma zachować swoje kluczowe powołanie duchowe: stawać przed Bogiem, orędować i uczyć lud Bożych ustaw i drogi, którą mają chodzić. Ale bieżące sprawy ma przekazać sprawdzonym liderom. I zobaczmy, jakie kryteria podaje Jetro w wersecie dwudziestym pierwszym:
Sara: Nie uroda, nie bogactwo, nie charyzma czy znajomości! Cztery twarde cnoty charakteru: mężowie dzielni, mężowie bojący się Boga, mężowie prawdomówni i mężowie nienawidzący chciwości! Ustanowieni nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Sprawy trudne — do Mojżesza; sprawy drobne — rozsądzane natychmiast na miejscu!

[PERSPEKTYWA CHRYSTOCENTRYCZNA I NOWY TESTAMENT]
Noemi: I to, co zachwyca mnie najbardziej w Mojżeszu, to jego gigantyczna pokora. Człowiek, który rozmawiał z Bogiem twarzą w twarz, posłuchał rady teścia z pogańskiego Midianu! Zrobił dokładnie tak, jak powiedział Jetro. I wiecie, co stało się w Nowym Testamencie? W szóstym rozdziale Dziejów Apostolskich apostołowie stają przed identycznym problemem: zaniedbywanie wdów przy codziennym rozdawaniu jałmużny.
Sara: Dokładnie tak! Apostołowie mówią: „Nie jest rzeczą słuszną, abyśmy opuścili Słowo Boże i służyli stołom”. Wybierają siedmiu diakonów pełnych Ducha Świętego i mądrości, a sami oddają się modlitwie i posłudze Słowa! A w centrum tego wszystkiego stoi nasz Pan, Jezus Chrystus — Jedyny Pośrednik Nowego Przymierza, który wziął na Siebie ciężar naszych grzechów i wyposażył swój Kościół w dary łaski, byśmy dźwigali nawzajem swoje brzemiona!
Noemi: Stańmy razem do modlitwy, by zrzucić fałszywy ciężar samowystarczalności!

[MANIFEST: MODLITWA BOJOWA]
Sara: Panie Jezu Chryste, Głowo Twojego Kościoła! Dziękujemy Ci za mądrość Pisma Świętego, która uczy nas pokory i zdrowego porządku. Wyznajemy przed Tobą, jak często próbujemy być samotnymi bohaterami, biorąc na siebie sprawy, którymi powinniśmy dzielić się z braćmi i siostrami.
Noemi: Ulecz nas z pracoholizmu, z pychy i z braku zaufania. Daj nam pokorę Mojżesza, byśmy potrafili przyjmować mądre rady. Wzbudź w naszych domach, kościołach i w całym ekosystemie Christian Culture przywódców według Twojego serca — ludzi dzielnych, bogobojnych, prawdomównych i wolnych od chciwości. Niech Twoje jarzmo będzie naszą wolnością. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Nie musisz dźwigać wszystkiego sam. Chrystus niesie Ciebie, a Ty noś swoich bliźnich w miłości!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Dobrego dnia i do zobaczenia jutro!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: RADY JETRY, DECENTRALIZACJA WŁADZY I ETYKA PRZYWÓDZTWA: EGZEGEZA WJ 18:1–27
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 17 listopada 2026 r.

Osiemnasty rozdział Księgi Wyjścia (Wj 18:1–27) stanowi fundamentalny kamień węgielny biblijnej politologii, teologii sprawowania władzy oraz eklezjalnej struktury wspólnoty przymierza. Położony strategicznie pomiędzy serią cudów na pustyni (woda ze skały w Refidim, manna, zwycięstwo nad Amalekiem) a monumentalną teofanią na Synaju (Wj 19–20), rozdział ten przenosi uwagę czytelnika z bezpośrednich, nadprzyrodzonych interwencji Boga w sferę uświęconego rozsądku, organizacji instytucjonalnej i etyki delegowania uprawnień.

1. Spotkanie pod Górą Boga i ekumenia przymierza (Wj 18:1–12)
Przybycie Jetry (hebr. יִתְרוֹ — Jithro, „jego doskonałość / obfitość”), kapłana Midianu i teścia Mojżesza, staje się okazją do rodzinnej i duchowej reintegracji. Jetro przyprowadza Seforę oraz dwóch synów Mojżesza, których imiona stanowią teologiczny zapis drogi wiary patriarchy: Gerszom (hebr. גֵּרְשֹׁם — „byłem przybyszem w obcej ziemi”) oraz Eliezer (hebr. אֱלִיעֶזֶר — „Bóg mego ojca był moją pomocą”).
Mojżesz składa szczegółowe świadectwo o zbawczych działaniach PANA wobec faraona i trudach pustyni. Reakcja Jetry jest wielowymiarowa: objawia radość ze zwycięstwa Jahwe, formułuje uroczyste wyznanie wiary („Teraz wiem, że PAN jest większy od wszystkich bogów”; hebr. עַתָּה יָדַעְתִּי כִּי־גָדוֹל יְהוָה מִכָּל־הָאֱלֹהִים — Wj 18:11) oraz składa Bogu ofiarę całopalną i biesiadną. Uczta przymierza, w której uczestniczą Aaron i wszyscy starsi Izraela, zapowiada eschatologiczne włączenie narodów pogańskich do społeczności ludu Bożego.

2. Patologia centralizmu sądowniczego (Wj 18:13–18)
Scena z Wj 18:13–16 odsłania strukturalną niewydolność charyzmatycznego jedynowładztwa: Mojżesz samotnie zasiada do sądzenia spraw od świtu do zmierzchu. Na pytanie teścia o rację takiego postępowania, prawodawca odpowiada poczuciem wyłącznej odpowiedzialności: „Bo lud przychodzi do mnie, aby się radzić Boga... ja rozsądzam między nimi i oznajmiam ustawy Boga i jego prawa” (Wj 18:15–16).
Diagnoza Jetry jest bezkompromisowa: „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud, który jest z tobą, bo ta sprawa jest zbyt ciężka dla ciebie. Sam jej nie podołasz” (hebr. נָבֹל תִּבֹּל — *nabol tibol*, dosł. „zwiędniesz jak liść, uschniesz”). Centralizm decyzyjny okazuje się pułapką psychofizyczną dla lidera i udręką przewlekłości postępowań dla obywateli.

3. Czterostopniowy dekalog kwalifikacji sędziowskich (Wj 18:19–23)
Plan naprawczy Jetry nie redukuje duchowej roli Mojżesza, lecz ją krystalizuje: Mojżesz ma pozostać orędownikiem (stawanie przed Bogiem) i edukatorem (nauczanie ustaw i dróg postępowania). Rozsądzanie spraw powszednich zostaje przekazane sędziom wyłonionym według rygorystycznych kryteriów etycznych (Wj 18:21):
> 1. Mężowie dzielni (אַנְשֵׁי־חַיִל — *anszej chajil*): ludzie o niezłomnym kręgosłupie moralnym, odwadze cywilnej i życiowej zaradności.
> 2. Bojący się Boga (יִרְאֵי אֱלֹהִים — *jirej Elohim*): ludzie uznający wyższość sprawiedliwości Bożej nad naciskami politycznymi i opinią publiczną.
> 3. Mężowie prawdomówni (אַנְשֵׁי אֱמֶת — *anszej emet*): ludzie prawdy, uczciwości intelektualnej i niezłomnej transparentności.
> 4. Nienawidzący chciwości (שֹׂנְאֵי בָצַע — *sonei waca*): ludzie wrodzy niegodziwemu zyskowi, odporni na korupcję i nepotyzm.
Struktura hierarchiczna nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami wprowadza zasadę subsydiarności: sprawy drobne są rozstrzygane na najniższym możliwym szczeblu, a do instancji wyższej trafiają wyłącznie precedensy najtrudniejsze.

4. Wypełnienie w Chrystusie i eklezjologia Nowego Przymierza
Reforma Jetry znajduje swoje bezpośrednie odzwierciedlenie w życiu pierwotnego Kościoła. W Dz 6:1–7 apostołowie stają przed identycznym ryzykiem zaniedbania modlitwy i posługi Słowa na rzecz obsługi stołów, co rozwiązują przez powołanie siedmiu mężów cieszących się dobrą sławą i pełnych Ducha Świętego. Ponadto apostoł Paweł powtarza kryteria Jetry przy ustanawianiu starszych i diakonów w 1 Tm 3 oraz Tt 1.
Chrystologiczny szczyt tego rozdziału objawia się w osobie Jezusa Chrystusa: Zbawiciel nie jest tyranem przeciążającym swoje sługi, lecz cichym i pokornym Królem, którego jarzmo jest przyjemne, a brzemię lekkie (Mt 11:28–30). Jako Jedyny Pośrednik Nowego Przymierza (1 Tm 2:5) obdarza swoje mistyczne Ciało różnorodnością posług, powołując wszystkich wierzących do wzajemnej miłości i służby (1 Kor 12:12–27).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Osiemnasty rozdział Księgi Wyjścia demaskuje mit o samowystarczalności jednostki w dziele Bożym. Prawdziwe przywództwo opiera się na pokorze słuchania dobrych rad, delegowaniu autorytetu ludziom o sprawdzonym charakterze oraz budowaniu wspólnoty, w której każdy ciężar jest niesiony wspólnie pod okiem suwerennego Boga.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI ZGODNIE Z WYTYCZNYMI GPT) ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 48
RADY JETRY, MĄDROŚĆ DELEGOWANIA I WSPÓLNOTA SŁUŻBY — PRZYWÓDZTWO WEDŁUG BOŻEGO PORZĄDKU
Przybycie teścia Mojżesza z Seforą i synami, wyznanie wiary i ofiara Jetry, przeciążenie sędziego Izraela, mądra rada podziału odpowiedzialności oraz wybór bogobojnych i prawdomównych przywódców (Wj 18:1–27)
Wtorek, 17 listopada 2026 r.  |  Czytanie: Wj 18:1–27
TEKST PAMIĘCIOWY: „Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.” (Wj 18:21, UBG)
MYŚL PRZEWODNIA: Osiemnasty rozdział Księgi Wyjścia to ponadczasowy traktat o biblijnej mądrości organizacyjnej, pokorze przywódczej i budowaniu zdrowej wspólnoty wiary. Po zwycięstwie nad Amalekiem Izrael dociera pod górę Boga, gdzie Mojżesza odwiedza jego teść Jetro, kapłan Midianu, przyprowadzając żonę Seforę oraz dwóch synów: Gerszoma i Eliezera. Na wieść o wielkich dziełach Bożych Jetro wyznaje wiarę w najwyższego PANA i składa Mu ofiary przymierza wraz z Aaronem i starszyzną. Nazajutrz jednak Jetro dostrzega paraliżujący problem: Mojżesz samotnie od rana do wieczora rozsądza spory całego ludu. Diagnoza mądrego teścia jest bezwzględna: „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”. Jetro przedstawia genialną reformę: Mojżesz ma zachować rolę orędownika i nauczyciela Bożych praw, a bieżące sądownictwo przekazać zaufanym mężom dzielnym, bogobojnym, prawdomównym i nienawidzącym chciwości, ustanowionym nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Mojżesz w głębokiej pokorze przyjmuje radę i wdraża ją w życie, przywracając pokój i ład w obozie. W świetle Nowego Testamentu historia ta zapowiada organizację Kościoła apostolskiego (Dz 6; 1 Tm 3; Tt 1) oraz wskazuje na Chrystusa — Jedynego doskonałego Pośrednika, który obdarza swoje Ciało różnorodnymi darami łaski i powołuje nas do wzajemnego niesienia ciężarów!

ZANIM OTWORZYSZ BIBLIĘ
Osiemnasty rozdział Księgi Wyjścia prowadzi nas pod świętą górę Boga (Horeb/Synaj), w miejsce, gdzie przed laty Mojżesz pasł owce Jetry i ujrzał płonący krzew. Po dramatycznych cudach wyprowadzenia z Egiptu, mannie na pustyni Sin i zwycięstwie nad Amalekiem w Refidim, następuje chwila wytchnienia i głębokiego uporządkowania życia społeczności. Do obozu przybywa teść Mojżesza Jetro, kapłan Midianu, przyprowadzając żonę Mojżesza Seforę oraz dwóch synów: Gerszoma i Eliezera. Imiona tych chłopców są żywym pomnikiem Bożej łaski — Gerszom przypomina o byciu cudzoziemcem na wygnaniu, a Eliezer ogłasza, że Bóg ojca był pomocą i ocalił Mojżesza przed mieczem tyrana.
Spotkanie to rozpoczyna się od wzruszających gestów szacunku, braterskiego uścisku i złożenia świadectwa o wielkich dziełach PANA. Jetro, choć pochodzi spoza linii Izraela, z głębi serca wyznaje wiarę w Boga jedynego, błogosławi PANA i składa Mu ofiary przymierza. Jednak kolejny dzień odsłania cichy, destrukcyjny problem, który mógł zniszczyć całą misję wyjścia: Mojżesz samotnie, bez chwili wytchnienia, próbuje sądzić i rozwiązywać wszystkie problemy gigantycznego narodu od świtu do nocy. Tłum ludzi marnieje w zniecierpliwieniu, a wódz Izraela stoi na krawędzi fizycznego i emocjonalnego załamania.
Jak rozpoznać granicę między świętą gorliwością a zgubnym pracoholizmem i pychą samowystarczalności? Dlaczego Bóg posłużył się mądrością teścia spoza narodu wybranego, by przeprowadzić kluczową reformę sądownictwa? Jakie cechy charakteru muszą wyróżniać tych, którym powierza się duchowe i organizacyjne przywództwo we wspólnocie? I wreszcie — jak model Jetry i pokora Mojżesza kierują nasz wzrok ku Chrystusowi, który buduje swój Kościół jako zjednoczone Ciało wielu współpracujących członków?

TEKST PISMA ŚWIĘTEGO: KSIĘGA WYJŚCIA 18:1–27 (UBG)
18:1 A gdy teść Mojżesza Jetro, kapłan Midianitów, usłyszał o wszystkim, co Bóg uczynił dla Mojżesza i swego ludu Izraela, że PAN wyprowadził Izraela z Egiptu;
18:2 Wtedy Jetro, teść Mojżesza, wziął żonę Mojżesza Seforę, którą ten wcześniej odesłał;
18:3 Oraz jej dwóch synów, z których jednemu było na imię Gerszom, bo Mojżesz powiedział: Jestem przybyszem w cudzej ziemi;
18:4 Drugi zaś miał na imię Eliezer, bo mówił: Bóg mego ojca był moją pomocą i wybawił mnie od miecza faraona.
18:5 Jetro, teść Mojżesza, przybył wraz z jego synami i żoną do Mojżesza na pustynię, gdzie obozował przy górze Boga.
18:6 I kazał powiedzieć Mojżeszowi: Ja, twój teść Jetro, idę do ciebie wraz z twoją żoną i z oboma jej synami.
18:7 Mojżesz wyszedł więc swemu teściowi naprzeciw, pokłonił się i ucałował go. Potem wypytywali się wzajemnie o powodzenie i weszli do namiotu.
18:8 Mojżesz opowiedział swemu teściowi wszystko, co PAN uczynił faraonowi i Egipcjanom ze względu na Izraela, o całym trudzie, który ich spotkał w drodze, i jak PAN ich wybawił.
18:9 Jetro cieszył się ze wszelkiego dobra, które PAN uczynił Izraelowi, że wybawił go z ręki Egipcjan.
18:10 I Jetro powiedział: Niech będzie błogosławiony PAN, który was wybawił z ręki Egipcjan i z ręki faraona i który wybawił lud z niewoli egipskiej.
18:11 Teraz wiem, że PAN jest większy od wszystkich bogów, bo gdy oni zuchwale powstawali przeciwko niemu, to od tego poginęli.
18:12 Potem Jetro, teść Mojżesza, wziął całopalenie i ofiary dla Boga. Przyszedł też Aaron i wszyscy starsi Izraela, aby jeść chleb z teściem Mojżesza przed Bogiem.
18:13 Nazajutrz Mojżesz usiadł, aby sądzić lud. I lud stał przed Mojżeszem od rana aż do wieczora.
18:14 Gdy teść Mojżesza zobaczył wszystko, co on czynił dla ludu, powiedział: Cóż to jest, co ty czynisz dla ludu? Dlaczego ty siedzisz sam, a cały lud stoi przed tobą od rana aż do wieczora?
18:15 Wtedy Mojżesz odpowiedział swemu teściowi: Bo lud przychodzi do mnie, aby się radzić Boga.
18:16 Gdy mają jakąś sprawę, przychodzą do mnie, a ja rozsądzam między nimi i oznajmiam ustawy Boga i jego prawa.
18:17 Teść Mojżesza powiedział do niego: Niedobra to rzecz, którą czynisz.
18:18 Zamęczycie się i ty, i ten lud, który jest z tobą, bo ta sprawa jest zbyt ciężka dla ciebie. Sam jej nie podołasz.
18:19 Dlatego posłuchaj teraz mego głosu, poradzę ci, a Bóg będzie z tobą. Wstawiaj się za ludem przed Bogiem i zanoś sprawy Bogu;
18:20 Nauczaj go też ustaw i praw, wskazuj im drogę, którą mają chodzić, i czyny, które mają spełniać.
18:21 Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.
18:22 Niech oni sądzą lud w każdym czasie. A gdy będzie ważniejsza sprawa, zaniosą ją do ciebie, ale każdą mniej ważną sprawę sami będą sądzić. W ten sposób ulżysz sobie, gdy poniosą ciężar z tobą.
18:23 Jeśli tak uczynisz, a Bóg tak ci nakaże, wytrwasz i cały ten lud będzie wracać na swoje miejsce w pokoju.
18:24 Mojżesz usłuchał więc rady swego teścia i uczynił wszystko, jak mu powiedział.
18:25 I Mojżesz wybrał z całego Izraela dzielnych mężczyzn, i ustanowił ich przełożonymi nad ludem, nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką;
18:26 I sądzili lud w każdym czasie. Trudne sprawy zanosili do Mojżesza, a każdą drobniejszą sprawę sami sądzili.
18:27 Potem Mojżesz odprawił swego teścia, który odszedł do swej ziemi.

ANALIZA EGZEGETYCZNA (45 ZAGADNIEŃ EGZEGETYCZNYCH)

CZĘŚĆ I: SPOTKANIE POD GÓRĄ BOGA I ŚWIADECTWO WYBAWIENIA (WJ 18:1–8)
1. Tożsamość Jetry (Wj 18:1): Jetro (zwany także Reuelem w Wj 2:18) jest kapłanem Midianu — potomków Abrahama z Ketury (Rdz 25:1–2). Posiadał wiedzę o Bogu Najwyższym, choć przemieszaną z tradycjami koczowniczymi.
2. Wieść o wyjściu z Egiptu (Wj 18:1): Wieść o cudach PANA przekracza granice narodowe. Sława Bożego sądu nad bogami Egiptu i rozdzielenia Morza Czerwonego dociera na pustynię, poruszając serca ościennych plemion.
3. Powrót Sefory i synów (Wj 18:2): Tekst wyjaśnia, że Mojżesz wcześniej odesłał żonę i synów do Midianu (prawdopodobnie w czasie narastającego konfliktu z faraonem, by zapewnić im bezpieczeństwo przed plagami). Teraz rodzina zostaje zjednoczona.
4. Imię Gerszom jako pamięć wygnania (Wj 18:3): Imię pierwszego syna (hebr. גֵּרְשֹׁם) pochodzi od słowa *ger* (cudzoziemiec, przybysz). Przypomina o czterdziestoletnim okresie pokornego pasterzowania na obczyźnie.
5. Imię Eliezer jako hymn ocalenia (Wj 18:4): Imię drugiego syna (hebr. אֱלִיעֶזֶר) oznacza „Mój Bóg jest pomocą”. Mojżesz wyznaje, że to nie własna sprawność, lecz Bóg ojca ocalił go przed mieczem mściwego faraona.
6. Obozowisko przy Górze Boga (Wj 18:5): Góra Boga to Horeb/Synaj. Koło historii zamyka się: w tym samym miejscu, gdzie Bóg przemówił w krzaku ognistym, teraz obozuje ocalony naród.
7. Etykieta i szacunek rodzinny (Wj 18:6–7): Mimo swej ogromnej pozycji przywódcy narodu, Mojżesz wychodzi naprzeciw teściowi, składa głęboki pokłon szacunku i całuje go. Prawdziwa wielkość w Bogu rodzi pokorę i miłość rodzinną.
8. Relacja o trudzie drogi i Bożej wierności (Wj 18:8): Mojżesz nie przechwala się własnym geniuszem taktycznym. Cała opowieść koncentruje się na tym, co uczynił PAN — jak Bóg przeprowadził przez Morze, osłodził wodę w Mara, zesłał mannę i rozgromił Amaleka.
9. Ewangelizacyjna moc osobistego świadectwa (Wj 18:8): Świadectwo Mojżesza nie przemilcza trudów ani niebezpieczeństw („o całym trudzie, który ich spotkał”), lecz ukazuje, że Boże wybawienie zawsze przewyższa ludzkie słabości.

CZĘŚĆ II: RADOŚĆ, WYZNANIE WIARY I OFIARA PRZYMIERZA JETRY (WJ 18:9–12)
10. Radość poganina ze zbawienia Izraela (Wj 18:9): Jetro szczerze raduje się ze wszelkiego dobra, które PAN uczynił. Brak tu zawiści czy plemiennej wrogości — jest zachwyt nad Bożą dobrocią.
11. Błogosławieństwo PANA (Wj 18:10): Jetro wypowiada liturgiczną formułę uwielbienia: „Niech będzie błogosławiony PAN”. Wybawienie z ręki faraona staje się źródłem chwały Boga w ustach cudzoziemca.
12. Uznanie wyższości PANA nad wszystkimi bogami (Wj 18:11): Słowa „Teraz wiem, że PAN jest większy od wszystkich bogów” (hebr. עַתָּה יָדַעְתִּי) stanowią punkt zwrotny w duchowej drodze Jetry. Monoteistyczna prawda rozbija politeistyczny światopogląd Midianity.
13. Sąd nad pychą wrogów (Wj 18:11): Fraza „gdy oni zuchwale powstawali przeciwko niemu, to od tego poginęli” wskazuje na zasadę Bożej sprawiedliwości — ci, którzy chcieli utopić hebrajskie dzieci w Nilu, sami zginęli w odmętach morza.
14. Całopalenie i ofiary krwawe (Wj 18:12): Jetro składa *ola* (całopalenie całkowitego oddania) oraz *zewachim* (ofiary biesiadne). Jest to akt formalnego kultu jedynego Boga Izraela.
15. Wspólnota stołu z Aaronem i starszyzną (Wj 18:12): Aaron (przyszły arcykapłan) oraz starsi Izraela zasiadają z Jetrą do wspólnego posiłku.
16. Uczta „przed Bogiem” (Wj 18:12): Hebrajskie sformułowanie *lifnej ha-Elohim* („przed obliczem Boga”) nadaje posiłkowi charakter świętego przymierza i głębokiej jedności w obecności Szechiny.
17. Zapowiedź powołania narodów (Wj 18:12): Uczta ta jest profetycznym cieniem Nowego Przymierza, w którym poganie zasiadają przy jednym stole z potomkami Abrahama w Królestwie Bożym (Mt 8:11).

CZĘŚĆ III: SAMOTNY SĘDZIA — KRYZYS PRZECIĄŻENIA I DIAGNOZA JETRY (WJ 18:13–18)
18. Sądzenie od rana do wieczora (Wj 18:13): Następnego dnia po święcie Mojżesz wraca do rutyny. Setki tysięcy ludzi stoją w palącym słońcu, oczekując na osobiste rozstrzygnięcie sporów.
19. Wnikliwa obserwacja z zewnątrz (Wj 18:14): Jetro obserwuje proces z dystansu mentora i życzliwego teścia. Zauważa to, do czego Mojżesz przyzwyczaił się z poczucia obowiązku.
20. Trzeźwe pytanie diagnostyczne (Wj 18:14): „Cóż to jest, co ty czynisz dla ludu? Dlaczego ty siedzisz sam, a cały lud stoi przed tobą?”. Pytanie demaskuje brak ergonomii i niebezpieczny centralizm.
21. Motywacja Mojżesza — gorliwość o wolę Bożą (Wj 18:15): Mojżesz nie działa z żądzy władzy, lecz z czystego pragnienia służby: „Bo lud przychodzi do mnie, aby się radzić Boga”.
22. Rozsądzanie i nauczanie ustaw (Wj 18:16): Mojżesz łączył funkcję sędziego, mediatora i nauczyciela Bożych praw. Sprawa była jednak zbyt rozległa dla jednego umysłu.
23. Bezkompromisowa ocena Jetry (Wj 18:17): „Niedobra to rzecz, którą czynisz” (hebr. לֹא־טוֹב הַדָּבָר). To jedno z nielicznych miejsc w Torze, gdzie działanie pobożnego Mojżesza zostaje nazwane „niedobrym”.
24. Metafora uwiądu — „zamęczycie się” (Wj 18:18): Hebrajski czasownik *nabol tibol* oznacza dosłownie „zwiędnąć, opaść jak zeschły liść”. Nadmierne obciążenie prowadzi do uschnięcia sił życiowych.
25. Obustronna szkoda przeciążenia (Wj 18:18): Jetro widzi, że cierpi nie tylko lider („ty”), ale także lud („ten lud, który jest z tobą”). Zmęczeni sędziowie wydają powierzchowne wyroki, a zniecierpliwiony lud popada w frustrację.
26. Zrozumienie ludzkich ograniczeń (Wj 18:18): „Sam jej nie podołasz”. Nawet człowiek napełniony Duchem Świętym i rozmawiający z Bogiem twarzą w twarz pozostaje istotą stworzoną, mającą granice sił fizycznych i psychicznych.

CZĘŚĆ IV: PROJEKT PRZYWÓDZTWA SŁUŻEBNEGO I CZTERY CNOTY LIDERA (WJ 18:19–23)
27. Pokorna postawa doradcy (Wj 18:19): Jetro nie narzuca się despotycznie, lecz mówi: „poradzę ci, a Bóg będzie z tobą”. Cała rada jest podporządkowana suwerennej woli Bożej.
28. Podstawowe powołanie Mojżesza — wstawiennictwo (Wj 18:19): „Wstawiaj się za ludem przed Bogiem i zanoś sprawy Bogu”. Najważniejszą misją duchowego lidera jest modlitwa i reprezentowanie ludu przed tronem łaski.
29. Dydaktyka i formacja — nauczanie praw (Wj 18:20): Mojżesz ma uczyć ustaw i wskazywać drogę postępowania (*derech*) oraz czyny (*ma'aseh*). Lepiej wyposażyć ludzi w zasady, niż rozstrzygać każdy ich krok.
30. Cztery fundamentalne cnoty przywódcy (Wj 18:21):
    • *Anszej chajil* (mężowie dzielni) — ludzie silni moralnie, odważni, posiadający autorytet i życiową mądrość.
    • *Jirej Elohim* (bojący się Boga) — ludzie, dla których bojaźń Boża jest początkiem mądrości, niepodatni na ludzki strach.
    • *Anszej emet* (mężowie prawdomówni) — ludzie wierni prawdzie, odrzucający kłamstwo, fałsz i manipulację.
    • *Sonei waca* (nienawidzący chciwości) — ludzie całkowicie wolni od korupcji, nieprzekupni, nienawidzący niesprawiedliwego zysku.
31. Struktura dziesiętna i podział odpowiedzialności (Wj 18:21): Ustanowienie przełożonych nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Taki podział gwarantował, że nawet najmniejsza grupa dziesięciu rodzin miała swojego pasterza i rozjemcę.
32. Zasada subsydiarności w sądownictwie (Wj 18:22): Sprawy codzienne i drobne rozstrzygane są lokalnie. Do Mojżesza trafiają jedynie sprawy najtrudniejsze i bezprecedensowe.
33. Wspólne niesienie brzemienia (Wj 18:22): „W ten sposób ulżysz sobie, gdy poniosą ciężar z tobą”. Prawdziwa służba w Królestwie Bożym jest dziełem zespołowym.
34. Warunek Bożej aprobaty (Wj 18:23): „Jeśli tak uczynisz, a Bóg tak ci nakaże”. Jetro nie stawia swojej mądrości ponad Boga — plan wymaga potwierdzenia przez Najwyższego.
35. Owoc reformy — wytrwanie i pokój (Wj 18:23): Rezultatem wdrożenia mądrości jest przetrwanie lidera („wytrwasz”) oraz powrót ludu do swoich namiotów w głębokim pokoju (*be-szalom*).

CZĘŚĆ V: POKORA MOJŻESZA, WDROŻENIE REFORMY I POKÓJ ZGROMADZENIA (WJ 18:24–27)
36. Niezwykła pokora męża Bożego (Wj 18:24): Mojżesz nie zasłania się swoją charyzmą ani objawieniami z góry. W pokorze słucha teścia i natychmiast wdraża całą radę.
37. Wybór ludzi z całego Izraela (Wj 18:25): Selekcja nie opiera się na nepotyzmie czy przynależności klanowej, lecz na moralnych i duchowych kwalifikacjach kandydatów.
38. Realne przekazanie władzy i zaufanie (Wj 18:26): Mojżesz nie kontroluje obsesyjnie każdego wyroku sędziów. Zaufanie umożliwia prawidłowe funkcjonowanie wspólnoty.
39. Efektywność nowego systemu (Wj 18:26): Sprawy są rozstrzygane szybko, sprawiedliwie i blisko ludzi. Kończy się paraliż decyzyjny i wyczerpanie.
40. Zakończenie wizyty i wolność relacji (Wj 18:27): Mojżesz z wdzięcznością odprawia teścia, który powraca do swojej ziemi. Jetro nie rości sobie pretensji do pozostania szarą eminencją — spełnił swoją misję i odszedł w pokoju.

KLUCZE JĘZYKOWE I KULTUROWE
41. *Kohen Midian* (כֹּהֵן מִדְיָן) — kapłan Midianitów. Ukazuje, że Bóg potrafi użyć mądrości człowieka z zewnątrz, aby pobłogosławić i zreorganizować swój lud.
42. *Anszej chajil* (אַנְשֵׁי־חַיִל) — mężowie dzielni, waleczni, silni duchem i charakterem. To samo słowo pojawia się w opisie niewiasty dzielnej (*eszet chajil* w Przyp 31:10).
43. *Jirej Elohim* (יִרְאֵי אֱלֹהִים) — bojący się Boga. Bojaźń Boża jest jedyną skuteczną tamą przeciwko korupcji i nadużyciom władzy.
44. *Anszej emet* (אַנְשֵׁי אֱמֶת) — ludzie prawdy (*emet*). W języku hebrajskim prawda to wierność, stabilność, niezawodność i autentyczność.
45. *Sonei waca* (שֹׂנְאֵי בָצַע) — nienawidzący chciwości i nieprawego zysku. Prawdziwy sługa Boży nie szuka własnej korzyści materialnej ani poklasku.

JEZUS W CENTRUM — ODPOWIEDŹ NOWEGO TESTAMENTU
1. Chrystus — Jedyny Doskonały Pośrednik Nowego Przymierza (1 Tm 2:5; Hbr 8:6; Hbr 9:15): Podczas gdy Mojżesz uginał się pod ciężarem wstawiennictwa za ludem i musiał dzielić się władzą, Jezus Chrystus jest Jedynym Pośrednikiem między Bogiem a ludźmi, który wziął na Siebie cały ciężar naszych grzechów i wstawia się za nami nieustannie.
2. Powołanie Siedmiu Diakonów w Dziejach Apostolskich (Dz 6:1–7): Wzór Jetry i Mojżesza staje się bezpośrednią inspiracją dla apostołów w Jerozolimie. W obliczu przeciążenia powołują siedmiu mężów pełnych Ducha i mądrości do obsługi stołów, aby sami mogli trwać w modlitwie i posłudze Słowa.
3. Jedno Ciało i Różnorodność Darów Łaski (1 Kor 12:12–28; Rz 12:4–8): Bóg nie powołał jednego człowieka do spełniania wszystkich funkcji. Chrystus obdarza Kościół różnorodnymi darami, tworząc harmonijne Ciało, w którym każdy członek jest potrzebny i powołany do wzajemnej służby.
4. Kryteria Przywództwa w Kościele Nowego Testamentu (1 Tm 3:1–13; Tt 1:5–9): Apostoł Paweł, opisując cechy biskupów, starszych i diakonów, powtarza etyczne wymagania Jetry: nienaganność, trzeźwość, prawdomówność, brak chciwości na brudny zysk i bojaźń Boża.
5. Słodkie Jarzmo i Lekkie Brzemię Zbawiciela (Mt 11:28–30): Jezus zaprasza wszystkich spracowanych i obciążonych do Siebie. W przeciwieństwie do ludzkiego przeciążenia, jarzmo Chrystusa przynosi odpoczynek dla duszy i uwalnia z niewoli samowystarczalności.
6. Wielka Uczta Narodów u boku Zbawiciela (Łk 13:29; Mt 8:11): Ofiara i wspólny posiłek Jetry z Aaronem i starszyzną Izraela przed Bogiem prefiguruje zbawienie pogan i wieczną ucztę Baranka, przy której zasiądą ludzie ze wszystkich narodów, plemion i języków.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Dz 6:1–7 — Jak apostołowie rozwiązali problem przeciążenia w pierwotnym Kościele i jakie były owoce podziału ról?
• Pwt 1:9–18 — Jak Mojżesz wspomina wybór sędziów i jakie instrukcje bezstronności im przekazał?
• Lb 11:14–17 — Jak Bóg zareagował na późniejsze wołanie Mojżesza o samotności i jak podzielił Ducha na siedemdziesięciu starszych?
• 1 Tm 3:1–13 — Jakie kwalifikacje moralne i duchowe stawia apostoł Paweł przed przywódcami zborowymi?
• Tt 1:5–9 — Dlaczego Tytus miał ustanowić starszych w każdym mieście i czego mieli unikać liderzy?
• 1 Kor 12:14–26 — Dlaczego oko nie może powiedzieć ręce: „Nie potrzebuję ciebie”?
• Mt 18:15–17 — Jak Jezus nakazuje rozwiązywać spory we wspólnocie na najniższych możliwych szczeblach?
• Przyp 11:14 — Dlaczego w mnóstwie doradców jest wybawienie i bezpieczeństwo?
• Przyp 15:22 — Co dzieje się z planami, w których brakuje szczerej narady?
• 1 P 5:1–4 — W jaki sposób pasterze mają paść trzodę Bożą — bez przymusu, bez chciwości i nie panując z góry?
• Mt 11:28–30 — Do kogo Jezus kieruje wezwanie o zrzuceniu ciężarów i przyjęciu Jego odpoczynku?
• 1 Tm 2:5 — Kto jest jedynym prawdziwym Pośrednikiem między świętym Bogiem a upadłym człowiekiem?

PRAWDA NA DZIŚ — TEOLOGIA PRAKTYCZNA
1. Samowystarczalność jest iluzją i pychą: Nikt z nas nie został stworzony do samotnego niesienia wszystkich problemów. Przyznanie się do ograniczeń jest aktem dojrzałości i zaufania Bogu.
2. Mądrość może przyjść z niespodziewanej strony: Mojżesz potrafił przyjąć radę teścia spoza Izraela. Bóg często posługuje się ludźmi spoza naszego wąskiego kręgu, by wskazać nam ślepe punkty.
3. Kluczowe powołanie wymaga ochrony: Lider duchowy musi strzec czasu na modlitwę, wstawiennictwo i studiowanie Słowa Bożego. Zasypanie drobnymi sprawami niszczy duchową wrażliwość.
4. Etyka ważniejsza niż charyzma: Przy doborze współpracowników decydujący jest charakter: bojaźń Boża, prawdomówność i wolność od chciwości, a nie zewnętrzna błyskotliwość.
5. Delegowanie to akt zaufania Bogu i ludziom: Przekazanie odpowiedzialności innym uwalnia potencjał wspólnoty i pozwala rosnąć nowym pokoleniom sług Bożych.
6. Zdrowa struktura przynosi pokój: Gdy zadania są jasno rozdzielone, a spory rozstrzygane sprawiedliwie na właściwych szczeblach, cała społeczność powraca do swoich domów w pokoju.
7. Współpraca w Ciele Chrystusa: W Kościele nie ma miejsca na jednoosobowe teatry. Wszyscy jesteśmy członkami jednego Ciała powołanymi do wzajemnego budowania.
8. Odpoczynek w Chrystusie: Nasza ostateczna tożsamość i bezpieczeństwo spoczywają w dokonanym dziele Jezusa, a nie w liczbie spraw, które uda nam się osobiście załatwić.

POMYŚL — PYTANIA DO SERCA
1. Czy w swoim życiu zawodowym, rodzinnym lub kościelnym nie ulegasz pokusie samotnego kontrolowania wszystkiego?
2. Jak reagujesz, gdy bliska osoba lub ktoś z zewnątrz zwraca Ci uwagę, że Twoje tempo życia jest niszczące („niedobra to rzecz, którą czynisz”)?
3. Czy chronisz swój czas na osobistą modlitwę i relację z Bogiem, czy też pozwalasz, by pochłonęły Cię bieżące obowiązki?
4. Jakie kryteria stosujesz, wybierając współpracowników lub powierzając komuś odpowiedzialność? Czy na pierwszym miejscu stawiasz charakter i bojaźń Bożą?
5. Czy potrafisz zaufać innym i pozwolić im wykonywać zadania po swojemu, nie poprawiając każdego szczegółu?
6. W jakim obszarze Twojego życia brakuje dziś mądrego podziału ról i delegowania zadań?
7. Czy Twoje serce jest wolne od chciwości, pokusy zysku i nieszczerości w relacjach z ludźmi?
8. Czy czerpiesz swój odpoczynek z łaski Chrystusa, czy próbujesz zasłużyć na akceptację przez nieustanny trud?

MAŁY QUIZ — SPRAWDŹ SWOJĄ WIEDZĘ (20 PYTAŃ Z WJ 18:1–27)

Pytanie 1: Kim był Jetro dla Mojżesza i jaką funkcję pełnił w Midianie (Wj 18:1)?
A. Był bratem Mojżesza i dowódcą wojsk
B. Był teściem Mojżesza i kapłanem Midianitów
C. Był egipskim urzędnikiem dworskim
D. Był jednym ze starszych pokolenia Lewiego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:1 jednoznacznie określa Jetrę jako teścia Mojżesza i kapłana Midianitów.

Pytanie 2: O czym usłyszał Jetro, zanim wyruszył na spotkanie z Mojżeszem (Wj 18:1)?
A. O klęsce Izraela w walce z Amalekitami
B. O wszystkim, co Bóg uczynił dla Mojżesza i swego ludu Izraela, że PAN wyprowadził Izraela z Egiptu
C. O budowie złotego cielca na pustyni
D. O zatonięciu floty handlowej w Morzu Czerwonym
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:1 podaje, że Jetro usłyszał o wielkich dziełach Bożych i wyprowadzeniu ludu z Egiptu.

Pytanie 3: Kogo Jetro przyprowadził ze sobą do obozu Mojżesza (Wj 18:2–3)?
A. Tylko stada owiec i wielbłądów
B. Żonę Mojżesza Seforę oraz jej dwóch synów
C. Całe wojsko zbrojne Midianitów
D. Egipskich posłów z okupem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:2–3 mówi o przyprowadzeniu Sefory oraz dwóch synów Mojżesza.

Pytanie 4: Jak miał na imię pierwszy syn Mojżesza i dlaczego otrzymał to imię (Wj 18:3)?
A. Eliezer, bo Bóg był pomocą
B. Gerszom, bo Mojżesz powiedział: „Jestem przybyszem w cudzej ziemi”
C. Jozue, bo PAN jest zbawieniem
D. Manasses, bo Bóg dał zapomnieć o trudzie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:3: „jednemu było na imię Gerszom, bo Mojżesz powiedział: Jestem przybyszem w cudzej ziemi”.

Pytanie 5: Jakie znaczenie miało imię drugiego syna Mojżesza — Eliezera (Wj 18:4)?
A. „Bóg mego ojca był moją pomocą i wybawił mnie od miecza faraona”
B. „PAN moim sztandarem na wzgórzu”
C. „Owocny w krainie mego ucisku”
D. „Światło o poranku”
Poprawna odpowiedź: A. Wyjaśnienie: Wj 18:4 cytuje Mojżesza: „Bóg mego ojca był moją pomocą i wybawił mnie od miecza faraona”.

Pytanie 6: Gdzie obozował Mojżesz, gdy przybył do niego Jetro (Wj 18:5)?
A. Nad Nilem w Goszen
B. Na pustyni, przy górze Boga
C. W oazie Elim pod palmami
D. Na granicy Kanaanu w Kadesz
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:5 precyzuje, że obóz znajdował się „na pustyni, gdzie obozował przy górze Boga”.

Pytanie 7: Jak Mojżesz przywitał swojego teścia Jetrę (Wj 18:7)?
A. Posłał sługę z darami i został w namiocie
B. Wyszedł naprzeciw, pokłonił się, ucałował go, wypytywali się o powodzenie i weszli do namiotu
C. Nakazał mu złożyć daninę przed wejściem
D. Przywitał go chłodno z obawy przed bałwochwalstwem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:7 opisuje pełne szacunku i czułości powitanie: wyjście naprzeciw, pokłon, pocałunek i rozmowę w namiocie.

Pytanie 8: O czym Mojżesz opowiedział Jetrze podczas rozmowy w namiocie (Wj 18:8)?
A. O swoich planach podboju miast kananejskich
B. O wszystkim, co PAN uczynił faraonowi i Egipcjanom, o trudzie w drodze i jak PAN ich wybawił
C. O bogactwach, jakie Izraelici zabrali z Egiptu
D. O tajemnicach egipskich kapłanów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:8 wylicza: dzieła PANA wobec faraona, cały trud w drodze i cudowne Boże ocalenie.

Pytanie 9: Jak zareagował Jetro na relację Mojżesza o ocaleniu Izraela (Wj 18:9–10)?
A. Zaniepokoił się potęgą militarną Izraela
B. Cieszył się ze wszelkiego dobra od PANA i powiedział: „Niech będzie błogosławiony PAN”
C. Zażądał zwrotu kosztów utrzymania rodziny Mojżesza
D. Ostrzegł Mojżesza przed zemstą faraona
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:9–10 podkreśla radość Jetry i jego uroczyste błogosławieństwo PANA za wybawienie ludu.

Pytanie 10: Jakie fundamentalne wyznanie wiary złożył Jetro w Wj 18:11?
A. „Wszyscy bogowie narodów są równi”
B. „Teraz wiem, że PAN jest większy od wszystkich bogów”
C. „Mojżesz jest największym z królów ziemi”
D. „Pustynia należy do bogów Midianu”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:11 cytuje wyznanie Jetry: „Teraz wiem, że PAN jest większy od wszystkich bogów”.

Pytanie 11: Co uczynił Jetro przed Bogiem w Wj 18:12?
A. Wziął całopalenie i ofiary dla Boga
B. Zbudował zamek obronny wokół obozu
C. Nakazał zniszczyć ołtarz Mojżesza
D. Namaścił Mojżesza na króla
Poprawna odpowiedź: A. Wyjaśnienie: Wj 18:12 podaje: „Jetro, teść Mojżesza, wziął całopalenie i ofiary dla Boga”.

Pytanie 12: Kto przyszedł, aby wspólnie z teściem Mojżesza jeść chleb przed Bogiem (Wj 18:12)?
A. Wojownicy Jozuego
B. Aaron i wszyscy starsi Izraela
C. Kobiety z pokolenia Judy
D. Egipscy uciekinierzy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:12: „Przyszedł też Aaron i wszyscy starsi Izraela, aby jeść chleb z teściem Mojżesza przed Bogiem”.

Pytanie 13: Co robił Mojżesz nazajutrz po uczcie i jak długo to trwało (Wj 18:13)?
A. Odpoczywał w swoim namiocie przez cały dzień
B. Usiadł, aby sądzić lud, a lud stał przed nim od rana aż do wieczora
C. Wyruszył na polowanie na pustynię
D. Malował plany świątyni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:13: „Nazajutrz Mojżesz usiadł, aby sądzić lud. I lud stał przed Mojżeszem od rana aż do wieczora”.

Pytanie 14: Jakie pytanie zadał Jetro, widząc samotnie pracującego Mojżesza (Wj 18:14)?
A. „Ile zarabiasz na każdym wyroku sądu?”
B. „Dlaczego ty siedzisz sam, a cały lud stoi przed tobą od rana aż do wieczora?”
C. „Gdzie podziali się twoi ochroniarze?”
D. „Czemu nie każesz ukamienować buntowników?”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:14 cytuje pytanie Jetry: „Dlaczego ty siedzisz sam, a cały lud stoi przed tobą od rana aż do wieczora?”.

Pytanie 15: Jak Mojżesz uzasadnił swoje samotne zasiadanie na sądzie (Wj 18:15–16)?
A. Że nikomu w obozie nie ufa
B. Bo lud przychodzi radzić się Boga, a on rozsądza spory i oznajmia ustawy Boga
C. Że tylko on zna język hebrajski i egipski
D. Bo taki otrzymał bezwzględny nakaz od Aarona
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:15–16: Mojżesz wyjaśnia, że lud przychodzi radzić się Boga, a on rozsądza sprawy i uczy praw Bożych.

Pytanie 16: Co powiedział teść Mojżesza w Wj 18:17–18 o jego sposobie pracy?
A. „Czynisz wspaniale, tak trzymaj dalej”
B. „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”
C. „Powinieneś pracować także w nocy”
D. „Zwiększ opłaty za rozstrzyganie sporów”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:17–18: Jetro diagnozuje: „Niedobra to rzecz... Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”.

Pytanie 17: Jakie dwa kluczowe zadania duchowe Jetro pozostawił wyłącznie Mojżeszowi (Wj 18:19–20)?
A. Gotowanie posiłków i rozbijanie namiotów
B. Wstawianie się za ludem przed Bogiem i nauczanie ustaw oraz wskazywanie drogi życia
C. Dowodzenie wojskiem w każdej potyczce i zbieranie podatków
D. Wykonywanie szat kapłańskich
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:19–20: zanoszenie spraw przed Boga (orędownictwo) oraz nauczanie praw i dróg Bożych.

Pytanie 18: Jakie cztery cnoty charakteru musieli posiadać mężowie wybierani na przywódców (Wj 18:21)?
A. Mężczyźni wysocy, bogaci, elokwentni i młodzi
B. Mężczyźni dzielni, bojący się Boga, prawdomówni i nienawidzący chciwości
C. Krewni Mojżesza, kupcy, żołnierze i uczeni w piśmie
D. Kapłani z Egiptu, rzemieślnicy, pasterze i muzycy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:21 wymienia: mężowie dzielni (*anszej chajil*), bojący się Boga, prawdomówni i nienawidzący chciwości.

Pytanie 19: Nad jakimi grupami ludzi mieli zostać ustanowieni sędziowie (Wj 18:21)?
A. Nad milionami, prowincjami i miastami
B. Nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką
C. Wyłącznie nad poszczególnymi rodami lewickimi
D. Nad właścicielami stad wielbłądów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:21 precyzuje strukturę: przełożeni nad tysiącem, setką, pięćdziesiątką i dziesiątką.

Pytanie 20: Jaki był skutek pokornego usłuchania rady Jetry przez Mojżesza (Wj 18:23–26)?
A. Wybuchł bunt starszych i wojna domowa
B. Mojżesz wybrał dzielnych mężów, którzy sądzili lud w każdym czasie, a trudne sprawy zanosili do niego, przynosząc pokój wspólnocie
C. Jetro został ogłoszony królem Izraela
D. Lud odmówił podporządkowania się nowym sędziom
Poprawna odpowiedź: B. Wyjaśnienie: Wj 18:24–26 potwierdza, że Mojżesz wdrożył reformę, wyznaczył mężów, którzy sprawiedliwie sądzili lud, zapewniając trwałość i ład.

TWOJA DECYZJA
Słowo Boże z osiemnastego rozdziału Księgi Wyjścia stawia przed nami lustro prawdy. Wielu z nas żyje w przekonaniu, że nasza wartość, pobożność i sukces zależą od tego, jak wiele spraw zdołamy osobiście skontrolować i udźwignąć. Często mylimy świętą gorliwość z pracoholizmem, a brak zaufania do ludzi nazywamy „odpowiedzialnością”. Dzisiejsza lekcja burzy ten destrukcyjny schemat.
Mojżesz, choć rozmawiał z Bogiem i oglądał Jego cuda, miał w sobie niezwykłą wielkość: potrafił z pokorą usłyszeć słowa prawdy od drugiego człowieka i natychmiast zreorganizować swoje życie. Przestał być wąskim gardłem całej społeczności. Pozwolił innym stanąć do służby, a sam skupił się na tym, do czego Bóg powołał go w sposób niezbywalny: na trwaniu w Bożej obecności, orędownictwie i nauczaniu dróg Królestwa.
Bóg wzywa Cię dzisiaj do porzucenia pychy samowystarczalności. Nie musisz być samotnym bohaterem. W Chrystusie jesteś częścią Ciała, w którym każdy członek jest cenny i powołany do wzajemnego dźwigania brzemion. Zrób dziś krok pokory: zaufaj, deleguj, otwórz się na współpracę i zacznij budować Boży ład w swoim domu, pracy i wspólnocie!

MOJA DECYZJA:
Świadomie rezygnuję z postawy samotnego bohatera i fałszywej kontroli. W pokorze uznaję moje ludzkie granice i powierzam moje przeciążenie Chrystusowi. Podejmuję decyzję, by w zaufaniu dzielić się odpowiedzialnością z innymi, szukać współpracowników o prawym i bogobojnym sercu oraz strzec mojego czasu na osobistą modlitwę i trwanie w obecności Pana.

MODLITWA NA 17 LISTOPADA 2026 R.
Wszechmogący, Święty Boże, Ojcze naszego Pana Jezusa Chrystusa! Staję przed Tobą w ten wtorkowy dzień z sercem pełnym wdzięczności za mądrość Twojego odwiecznego Słowa. Dziękuję Ci za świadectwo życia Mojżesza i Jetry, które przypomina mi, że Ty jesteś Bogiem porządku, pokoju i harmonii. Wyznaję przed Tobą mój grzech pychy, niecierpliwości i lęku, przez który tak często próbowałem dźwigać wszystko o własnych siłach, nie dopuszczając innych do pomocy.
Przepraszam Cię za chwile, w których pod płaszczykiem gorliwości i fałszywej odpowiedzialności niszczyłem własne siły, zaniedbywałem modlitwę i raniłem moich najbliższych. Dziękuję Ci, Panie Jezu, że Twoje jarzmo jest przyjemne, a Twoje brzemię lekkie. Ty nie nakładasz na nas ciężarów ponad siły, lecz sam wziąłeś na ramiona krzyż naszego odkupienia i dałeś nam Ducha Świętego, byśmy żyli we wspólnocie miłości.
Proszę Cię, obdarz mnie duchem pokory i mądrości. Ucz mnie słuchać dobrych rad i rozpoznawać głos Twojej prawdy płynący z ust ludzi, których stawiasz na mojej drodze. Pomóż mi wyznaczać właściwe granice, chronić czas na intymne trwanie przed Twoim obliczem i uczyć innych Twoich ustaw i praw. Wzbudź w moim otoczeniu, w Kościele i w narodzie mężów i niewiasty dzielne, bojące się Ciebie, prawdomówne i nienawidzące wszelkiej niegodziwości.
Niech Twój pokój, który przewyższa wszelki rozum, strzeże mojego serca i umysłu. Oddaję Ci każdy mój plan, każdą troskę i każdą relację. Prowadź mnie ścieżkami sprawiedliwości i spraw, by owocem mojego życia był ład, miłość i pomnożenie Twojej chwały na ziemi. W imieniu Jezusa Chrystusa, mojego Jedynego Pośrednika i Pana. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeprowadź audyt własnego przeciążenia: Wypisz na kartce wszystkie obowiązki i sprawy, które obecnie prowadzisz samotnie, i zakreśl te, które możesz w zaufaniu przekazać innym.
2. Zastosuj zasadę czterech cnót: Zidentyfikuj w swoim otoczeniu przynajmniej jedną osobę spełniającą biblijne kryteria Jetry (dzielna, bogobojna, prawdomówna, uczciwa) i zaproponuj jej współpracę lub powierz konkretną odpowiedzialność.
3. Chroń przestrzeń wstawiennictwa: Zarezerwuj dziś nienaruszalne 20 minut na modlitwę i trwanie przed Bożym obliczem, zanim rzucisz się w wir bieżących obowiązków.
4. Wyraź wdzięczność doradcom: Podziękuj osobie (współmałżonkowi, przyjacielowi, mentorowi), która w przeszłości dała Ci trafną, choć trudną radę korygującą Twoje postępowanie.
5. Zbadaj swoje serce pod kątem chciwości: Zastanów się, czy w Twoich decyzjach zawodowych lub finansowych nie pojawia się pokusa nieprawego zysku, i odrzuć wszelki kompromis ze złem.
6. Przeczytaj i porównaj fragmenty: Przestudiuj Wj 18:1–27 równolegle z Dz 6:1–7 oraz 1 Tm 3:1–13, notując biblijne zasady zdrowego przywództwa.
7. Oznacz dzień jako ukończony i podziel się lekcją: Przekaż dzisiejsze rozważanie przynajmniej jednej osobie zmagającej się z pracoholizmem lub przeciążeniem w służbie.

JUTRO — 18 LISTOPADA 2026 R.
DZIEŃ 49: TELESKOP PRZYMIERZA POD GÓRĄ SYNAJ — ŚWIĘTE KAPŁAŃSTWO I PRZYGOTOWANIE LUDU NA SPOTKANIE Z MAJESTATEM BOGA (WJ 19:1–25)
Jutro wkraczamy w jeden z najświętszych momentów w dziejach ludzkości. Izrael staje pod drżącą, dymiącą Górą Synaj. Bóg ogłasza swoje odwieczne powołanie: „Będziecie moją szczególną własnością pośród wszystkich narodów... królestwem kapłanów i narodem świętym”. Zobaczymy obmywanie szat, granice wokół góry, dźwięk archanielskiej trąby i majestat Boga, który zstępuje w ogniu, by zawrzeć wieczne Przymierze ze swoim odkupionym ludem!`;

// ── 4. GENEROWANIE DOKUMENTU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx)...');

const doc = new Document({
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
                new TextRun({ text: trimmed, bold: true, size: 26, color: '0F2942' }),
              ],
            });
          }

          if (trimmed.startsWith('Pytanie ')) {
            return new Paragraph({
              spacing: { before: 180, after: 80 },
              children: [
                new TextRun({ text: trimmed, bold: true, size: 22, color: '1A202C' }),
              ],
            });
          }

          if (/^[A-D]\.\s/.test(trimmed)) {
            return new Paragraph({
              spacing: { before: 40, after: 40 },
              indent: { left: 360 },
              children: [
                new TextRun({ text: trimmed, size: 22, color: '2D3748' }),
              ],
            });
          }

          if (trimmed.startsWith('Poprawna odpowiedź:')) {
            return new Paragraph({
              spacing: { before: 60, after: 140 },
              indent: { left: 360 },
              children: [
                new TextRun({ text: trimmed, bold: true, color: '2B6CB0', size: 22 }),
              ],
            });
          }

          if (/^\d+\.\s/.test(trimmed) || /^•\s/.test(trimmed)) {
            return new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({ text: trimmed, size: 22, color: '2D3748' }),
              ],
            });
          }

          return new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: trimmed, size: 22, color: '2D3748' }),
            ],
          });
        }),
      ],
    },
  ],
});

const docxDesktopPath = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxDesktopPath, docxBuffer);
console.log(`✅ Zapisano sformatowany plik DOCX na Pulpicie: ${docxDesktopPath} (${docxBuffer.length} bajtów)`);

// ── 5. ZAPIS PAKIETU 5 WERSJI ROZWAŻAŃ ──
const pakietFilePath = path.join(process.cwd(), `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

// ── 6. BUDOWANIE PLIKU HTML LEKCJI (WZÓR DNIA 1 / STANDARD 21/21) ──
console.log('🌐 Przygotowuję stronę HTML lekcji Dnia 48...');

// Pobieramy wzorzec z Dnia 47
const template47Path = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-47.html');
let html = fs.readFileSync(template47Path, 'utf8');

// Metadane nagłówka HTML
html = html.replace(/<title>Dzień 47: [^<]+<\/title>/, `<title>Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/content="Dzień 47 Kursu Codziennego[^"]+"/, `content="Dzień ${DAY_NUM} Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}"`);
// Canonical & OG URLs
html = html.replace(/href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-47"/g, `href="https://polskieradio.cc/akademia/kurscodzienny/dzien-48"`);
html = html.replace(/content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-47"/g, `content="https://polskieradio.cc/akademia/kurscodzienny/dzien-48"`);
html = html.replace(/property="og:title" content="Dzień 47: [^"]+"/, `property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${SUBTITLE}"`);
html = html.replace(/kc_day_47_woda_ze_skaly_i_zwyciestwo_nad_amalekiem\.jpg\?v=\d+/g, `kc_day_48_rady_jetry_i_wybor_sedziow.jpg?v=20261117`);

// Udostępnianie social media URL
html = html.replace(/kurscodzienny%2Fdzien-47/g, `kurscodzienny%2Fdzien-48`);
html = html.replace(/Dzie%C5%84%2047%3A%20WODA%20ZE%20SKA%C5%81Y%20W%20HOREBIE%20I%20ZWYCI%C4%98STWO%20NAD%20AMALEKIEM%20%E2%80%94%20JAHWE%20NISSI%20\(Wj%2017%3A1%E2%80%9316\)/g, encodeURIComponent(`Dzień 48: ${TITLE} (${READING})`));

// Pasek nawigacji górnej — poprzedni dzień (Dzień 47) i następny dzień (Dzień 49)
html = html.replace(
  /href="\/akademia\/kurscodzienny\/dzien-46"/g,
  `href="/akademia/kurscodzienny/dzien-47"`
);
html = html.replace(
  /href="\/akademia\/kurscodzienny\/dzien-48"/g,
  `href="/akademia/kurscodzienny/dzien-49"`
);
html = html.replace(
  /<span>← Dzień 46<\/span>/g,
  `__PREV_DAY_LINK_SHORT__`
);
html = html.replace(
  /<span>← Dzień 46 \(Niedziela\)<\/span>/g,
  `__PREV_DAY_LINK_LONG__`
);
html = html.replace(
  /<span>Dzień 47 \(Poniedziałek\)<\/span>/g,
  `<span>Dzień ${DAY_NUM} (Wtorek)</span>`
);
html = html.replace(
  /<span>Dzień 48 \(Wtorek\) →<\/span>/g,
  `<span>Dzień 49 (Środa) →</span>`
);

// Breadcrumb & Hero
html = html.replace(/DZIEŃ 47/g, `DZIEŃ ${DAY_NUM}`);
html = html.replace(/Dzień 47/g, `Dzień ${DAY_NUM}`);
html = html.replace(/__PREV_DAY_LINK_SHORT__/g, `<span>← Dzień 47</span>`);
html = html.replace(/__PREV_DAY_LINK_LONG__/g, `<span>← Dzień 47 (Poniedziałek)</span>`);
html = html.replace(/15 LISTOPADA 2026 • NIEDZIELA/g, `17 LISTOPADA 2026 • WTOREK`);
html = html.replace(/16 LISTOPADA 2026 • PONIEDZIAŁEK/g, `17 LISTOPADA 2026 • WTOREK`);
html = html.replace(/WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM — JAHWE NISSI/g, TITLE);
html = html.replace(/Pragnienie ludu w Refidim, uderzona laska Mojżesza na Horebie, strumienie żywej wody, bitwa z Amalekiem i ręce podtrzymywane przez Aarona i Chura \(Wj 17:1–16\)/g, SUBTITLE);
html = html.replace(/Wj 17:1–16/g, READING);
html = html.replace(/Wj 17:6/g, `Wj 18:21`);

// Tekst pamięciowy
const memoryVerseBlock = `<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <i class="fa-solid fa-bookmark"></i>
              <span>Werset do zapamiętania</span>
            </div>
            <p class="font-serif italic text-base sm:text-lg text-white">
              „Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.”
            </p>
            <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 18:21 (UBG)</p>
          </div>
          <button
            onclick="navigator.clipboard.writeText('„Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.” (Wj 18:21, UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
            class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
            title="Kopiuj werset do schowka"
          >
            <i class="fa-regular fa-copy"></i>
            <span>Kopiuj</span>
          </button>
        </div>`;
html = html.replace(/<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->[\s\S]*?<!-- MYŚL PRZEWODNIA -->/, `${memoryVerseBlock}\n\n        <!-- MYŚL PRZEWODNIA -->`);

// TTS Lektor
html = html.replace(
  /new SpeechSynthesisUtterance\([^)]*\)/,
  `new SpeechSynthesisUtterance("Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką. (Księga Wyjścia 18:21)")`
);

// Myśl przewodnia
html = html.replace(
  /Siedemnasty rozdział Księgi Wyjścia to dramatyczna i pełna chwały lekcja o Bogu, który gasi pragnienie w najbardziej bezwodnych dolinach życia[\s\S]*?wody życia na wieki!/,
  THEME
);

// Zanim otworzysz Biblię (Section intro)
const introHtml = `<p>Osiemnasty rozdział Księgi Wyjścia prowadzi nas pod świętą górę Boga (Horeb/Synaj), w miejsce, gdzie przed laty Mojżesz pasł owce Jetry i ujrzał płonący krzew. Po dramatycznych cudach wyprowadzenia z Egiptu, mannie na pustyni Sin i zwycięstwie nad Amalekiem w Refidim, następuje chwila wytchnienia i głębokiego uporządkowania życia społeczności. Do obozu przybywa teść Mojżesza Jetro, kapłan Midianu, przyprowadzając żonę Mojżesza Seforę oraz dwóch synów: Gerszoma i Eliezera.</p>
        <p>Spotkanie to rozpoczyna się od wzruszających gestów szacunku, braterskiego uścisku i złożenia świadectwa o wielkich dziełach PANA. Jetro z głębi serca wyznaje wiarę w Boga jedynego, błogosławi PANA i składa Mu ofiary przymierza. Jednak kolejny dzień odsłania cichy, destrukcyjny problem: Mojżesz samotnie, bez chwili wytchnienia, próbuje sądzić i rozwiązywać wszystkie problemy gigantycznego narodu od świtu do nocy. Tłum ludzi marnieje w zniecierpliwieniu, a wódz Izraela stoi na krawędzi wyczerpania.</p>
        <p>Jak rozpoznać granicę między świętą gorliwością a zgubnym pracoholizmem i pychą samowystarczalności? Dlaczego Bóg posłużył się mądrością teścia spoza narodu wybranego, by przeprowadzić kluczową reformę sądownictwa? Jakie cechy charakteru muszą wyróżniać tych, którym powierza się przywództwo we wspólnocie? I wreszcie — jak model Jetry i pokora Mojżesza kierują nasz wzrok ku Chrystusowi, który buduje swój Kościół jako harmonijne Ciało wielu współpracujących członków?</p>`;

html = html.replace(
  /<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel\/70 border border-brand-border\/30 mb-8"[\s\S]*?<\/section>\s*<!-- ── TEKST PISMA ŚWIĘTEGO ── -->/,
  `<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel/70 border border-brand-border/30 mb-8">
        <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 mb-4 flex items-center gap-3">
          <i class="fa-solid fa-compass text-amber-400"></i>
          <span>ZANIM OTWORZYSZ BIBLIĘ — TŁO I PROBLEM DNIA</span>
        </h2>
        <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">
          ${introHtml}
        </div>
      </section>

      <!-- ── TEKST PISMA ŚWIĘTEGO ── -->`
);

// Podmiana tekstu Pisma Świętego
html = html.replace(
  /<div class="space-y-3 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── CZĘŚCI LEKCJI ── -->/,
  `<div class="space-y-3 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">
        ${readingHtml}
      </div>
    </section>

    <!-- ── CZĘŚCI LEKCJI ── -->`
);

// Podmiana 5 kart egzegetycznych (Części I–V + Klucze)
const cardsHtml = `<!-- CZĘŚĆ I -->
    <article class="kc-card p-6 sm:p-8 rounded-2xl bg-[#0C121D] border border-brand-border/40 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-brand-border/30 pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">CZĘŚĆ I • Wj 18:1–8</span>
        <span class="text-xs text-zinc-500">PUNKTY EGZEGETYCZNE 1–9</span>
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
        SPOTKANIE POD GÓRĄ BOGA, POWRÓT SEFORY I ŚWIADECTWO WYBAWIENIA (WJ 18:1–8)
      </h3>
      <div class="space-y-3 text-sm text-zinc-300 leading-relaxed font-serif">
        <p><strong>1. Tożsamość Jetry (Wj 18:1):</strong> Jetro (zwany także Reuelem) jest kapłanem Midianitów — potomków Abrahama z Ketury (Rdz 25:1–2). Przechowywał wiarę w Boga Najwyższego na pustyni Synaj.</p>
        <p><strong>2. Wieść o wyjściu z Egiptu (Wj 18:1):</strong> Sława Bożego sądu nad faraonem i rozdzielenia Morza Czerwonego przekracza granice narodów, docierając do obozowisk koczowników.</p>
        <p><strong>3. Powrót żony i synów (Wj 18:2):</strong> Mojżesz odesłał wcześniej rodzinę do Midianu na czas groźnych plag w Egipcie. Teraz Bóg jednoczy rozproszoną rodzinę.</p>
        <p><strong>4. Imię Gerszom jako pamięć wygnania (Wj 18:3):</strong> Hebrajskie <em>Gerszom</em> („byłem przybyszem w obcej ziemi”) upamiętnia 40 lat pokornego pasterzowania na obczyźnie.</p>
        <p><strong>5. Imię Eliezer jako hymn ocalenia (Wj 18:4):</strong> <em>Eliezer</em> („Mój Bóg jest pomocą”) głosi, że to Bóg ocalił Mojżesza od miecza mściwego tyrana.</p>
        <p><strong>6. Obozowisko pod Górą Boga (Wj 18:5):</strong> Horeb staje się miejscem wypełnienia obietnicy z krzewu ognistego: „Gdy wyprowadzisz lud z Egiptu, będziecie służyć Bogu na tej górze” (Wj 3:12).</p>
        <p><strong>7. Szacunek i kultura relacji (Wj 18:7):</strong> Wódz Izraela kłania się przed teściem, całuje go i zaprasza do namiotu. Prawdziwa wielkość duchowa wyraża się w pokorze i wdzięczności.</p>
        <p><strong>8. Szczere świadectwo o trudzie i łasce (Wj 18:8):</strong> Mojżesz nie przemilcza trudów wędrówki, lecz przypisuje całą chwałę PANU, który wybawił lud z każdej opresji.</p>
        <p><strong>9. Ewangelizacyjna moc faktów (Wj 18:8):</strong> Prawdziwe świadectwo opowiada o konkretnych faktach Bożej interwencji, wzbudzając wiarę w sercach słuchaczy.</p>
      </div>
    </article>

    <!-- CZĘŚĆ II -->
    <article class="kc-card p-6 sm:p-8 rounded-2xl bg-[#0C121D] border border-brand-border/40 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-brand-border/30 pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">CZĘŚĆ II • Wj 18:9–12</span>
        <span class="text-xs text-zinc-500">PUNKTY EGZEGETYCZNE 10–17</span>
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
        RADOŚĆ, WYZNANIE WIARY I OFIARA PRZYMIERZA JETRY (WJ 18:9–12)
      </h3>
      <div class="space-y-3 text-sm text-zinc-300 leading-relaxed font-serif">
        <p><strong>10. Radość z Bożego dobra (Wj 18:9):</strong> Jetro szczerze weseli się ze zwycięstwa Izraela — brak w nim plemiennej zawiści czy pogańskiej niechęci.</p>
        <p><strong>11. Błogosławieństwo PANA (Wj 18:10):</strong> Uroczysta formuła liturgiczna błogosławiąca Boga za skruszenie jarzma egipskiej niewoli.</p>
        <p><strong>12. Wyznanie supremacji Boga Izraela (Wj 18:11):</strong> „Teraz wiem, że PAN jest większy od wszystkich bogów” — kapłan Midianu uznaje wyłączny autorytet Jahwe.</p>
        <p><strong>13. Sąd nad zuchwałością pychy (Wj 18:11):</strong> Egipcjanie zginęli tą samą bronią, którą uciskali innych — woda Nilu stała się wodą Morza Czerwonego.</p>
        <p><strong>14. Całopalenie i ofiary krwawe (Wj 18:12):</strong> Złożenie ofiar <em>ola</em> i <em>zewachim</em> przez Jetrę jako akt pełnego oddania i komunii z Najwyższym.</p>
        <p><strong>15. Braterska uczta z Aaronem i starszyzną (Wj 18:12):</strong> Przywódcy Izraela łamią chleb z gościem, pieczętując więź przymierza.</p>
        <p><strong>16. Spożywanie chleba „przed obliczem Boga” (Wj 18:12):</strong> Świadomość Bożej obecności (<em>lifnej ha-Elohim</em>) uświęca każdy posiłek i relację braterską.</p>
        <p><strong>17. Zapowiedź powołania pogan (Wj 18:12):</strong> Uczta ta jest profetycznym znakiem czasów Nowego Przymierza, gdy narody zbiegną się do światła Zbawiciela.</p>
      </div>
    </article>

    <!-- CZĘŚĆ III -->
    <article class="kc-card p-6 sm:p-8 rounded-2xl bg-[#0C121D] border border-brand-border/40 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-brand-border/30 pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">CZĘŚĆ III • Wj 18:13–18</span>
        <span class="text-xs text-zinc-500">PUNKTY EGZEGETYCZNE 18–26</span>
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
        SAMOTNY SĘDZIA — KRYZYS PRZECIĄŻENIA I DIAGNOZA JETRY (WJ 18:13–18)
      </h3>
      <div class="space-y-3 text-sm text-zinc-300 leading-relaxed font-serif">
        <p><strong>18. Sądzenie od świtu do nocy (Wj 18:13):</strong> Monopol decyzyjny paraliżuje Mojżesza i wycieńcza stojących w palącym słońcu ludzi.</p>
        <p><strong>19. Oczy mentora z zewnątrz (Wj 18:14):</strong> Jetro natychmiast dostrzega strukturalny błąd, do którego Mojżesz zdążył się przyzwyczaić.</p>
        <p><strong>20. Pytanie demaskujące centralizm (Wj 18:14):</strong> „Dlaczego ty siedzisz sam, a cały lud stoi przed tobą?”.</p>
        <p><strong>21. Gorliwość bez granic (Wj 18:15):</strong> Mojżesz szczerze chce służyć Bogu, ale myli powołanie z osobistą kontrolą każdego detalu.</p>
        <p><strong>22. Łączenie ról prawodawcy i sędziego (Wj 18:16):</strong> Dźwiganie wszystkich spraw prawnych przerasta możliwości jednego człowieka.</p>
        <p><strong>23. Odważna diagnoza — „Niedobra to rzecz” (Wj 18:17):</strong> Pobożne intencje nie usprawiedliwiają błędnej, niszczącej organizacji.</p>
        <p><strong>24. Groźba uwiądu — nabol tibol (Wj 18:18):</strong> Hebrajski termin oznacza „zwiędnąć jak liść”. Przeciążenie niszczy zdrowie i ducha.</p>
        <p><strong>25. Cierpienie całego zgromadzenia (Wj 18:18):</strong> Wypalony lider nie jest w stanie zapewnić pokoju i sprawiedliwości ludowi.</p>
        <p><strong>26. Pokora uznania ludzkiej skończoności (Wj 18:18):</strong> „Sam jej nie podołasz” — nikt poza Bogiem nie jest wszechmocny.</p>
      </div>
    </article>

    <!-- CZĘŚĆ IV -->
    <article class="kc-card p-6 sm:p-8 rounded-2xl bg-[#0C121D] border border-brand-border/40 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-brand-border/30 pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">CZĘŚĆ IV • Wj 18:19–23</span>
        <span class="text-xs text-zinc-500">PUNKTY EGZEGETYCZNE 27–35</span>
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
        PROJEKT ZDECENTRALIZOWANEJ SŁUŻBY I CZTERY CNOTY PRZYWÓDCY (WJ 18:19–23)
      </h3>
      <div class="space-y-3 text-sm text-zinc-300 leading-relaxed font-serif">
        <p><strong>27. Pokorna mądrość doradcy (Wj 18:19):</strong> Jetro proponuje plan, poddając go pod rozstrzygnięcie Boga.</p>
        <p><strong>28. Kluczowe zadanie — wstawiennictwo (Wj 18:19):</strong> Mojżesz ma zanieść najważniejsze sprawy przed Boży tron modlitwy.</p>
        <p><strong>29. Rola nauczyciela i formatora (Wj 18:20):</strong> Nauczanie ustaw i dróg postępowania jest trwalsze niż ciągłe rozstrzyganie sporów.</p>
        <p><strong>30. Anszej chajil — mężowie dzielni (Wj 18:21):</strong> Ludzie o niezłomnym kręgosłupie moralnym, odwadze i życiowej zaradności.</p>
        <p><strong>31. Jirej Elohim — bojący się Boga (Wj 18:21):</strong> Sędziowie kierujący się sprawiedliwością Bożą, nieprzekupni i wolni od ludzkiego strachu.</p>
        <p><strong>32. Anszej emet — ludzie prawdy (Wj 18:21):</strong> Autentyczni, transparentni, brzydzący się fałszem i kłamstwem.</p>
        <p><strong>33. Sonei waca — nienawidzący chciwości (Wj 18:21):</strong> Liderzy wolni od pożądania brudnego zysku i partykularnych korzyści.</p>
        <p><strong>34. Struktura subsydiarności (Wj 18:21–22):</strong> Podział na tysiące, setki, pięćdziesiątki i dziesiątki gwarantuje szybką pomoc na miejscu.</p>
        <p><strong>35. Obietnica wytrwania i pokoju (Wj 18:23):</strong> Odpowiedni podział ról przynosi siłę liderowi i pokój (<em>szalom</em>) całemu ludowi.</p>
      </div>
    </article>

    <!-- CZĘŚĆ V -->
    <article class="kc-card p-6 sm:p-8 rounded-2xl bg-[#0C121D] border border-brand-border/40 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-brand-border/30 pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">CZĘŚĆ V • Wj 18:24–27</span>
        <span class="text-xs text-zinc-500">PUNKTY EGZEGETYCZNE 36–45</span>
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
        POKORA MOJŻESZA, WDROŻENIE REFORMY I KLUCZE JĘZYKOWE (WJ 18:24–27)
      </h3>
      <div class="space-y-3 text-sm text-zinc-300 leading-relaxed font-serif">
        <p><strong>36. Pokora wielkiego proroka (Wj 18:24):</strong> Mojżesz nie obraża się na teścia, lecz natychmiast wdraża całą radę w życie.</p>
        <p><strong>37. Powszechny wybór liderów (Wj 18:25):</strong> Wybór mężów z całego Izraela oparty wyłącznie na etycznych i duchowych kwalifikacjach.</p>
        <p><strong>38. Realne zaufanie i delegowanie (Wj 18:26):</strong> Mojżesz pozwala sędziom decydować, przyjmując do siebie tylko najtrudniejsze sprawy.</p>
        <p><strong>39. Płynność i ład społeczny (Wj 18:26):</strong> Znikają kolejki, a sprawiedliwość dociera do każdego namiotu.</p>
        <p><strong>40. Szlachetne pożegnanie (Wj 18:27):</strong> Jetro wraca do swej ziemi, pozostawiając trwałe owoce mądrości.</p>
        <p><strong>41. Kohen Midian (כֹּהֵן מִדְיָן):</strong> Bóg posługuje się mądrością człowieka z zewnątrz ku zbudowaniu swego ludu.</p>
        <p><strong>42. Anszej chajil (אַנְשֵׁי־חַיִל):</strong> Męstwo moralne jako fundament stabilnego przywództwa.</p>
        <p><strong>43. Jirej Elohim (יִרְאֵי אֱלֹהִים):</strong> Bojaźń Boża jedynym lekarstwem na korupcję władzy.</p>
        <p><strong>44. Anszej emet (אַנְשֵׁי אֱמֶת):</strong> Prawdomówność i integralność serca.</p>
        <p><strong>45. Sonei waca (שֹׂנְאֵי בָצַע):</strong> Nienawiść do nieprawego zysku warunkiem bezstronnego sądu.</p>
      </div>
    </article>`;

html = html.replace(
  /<!-- CZĘŚĆ I -->[\s\S]*?<!-- ── JEZUS W CENTRUM ── -->/,
  `${cardsHtml}

    <!-- ── JEZUS W CENTRUM ── -->`
);

// Podmiana JEZUS W CENTRUM
const chrystusHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/40 via-brand-panel to-brand-panel border border-brand-gold/40 shadow-2xl space-y-4 my-8">
      <div class="flex items-center gap-3 text-amber-400 border-b border-brand-gold/30 pb-3">
        <i class="fa-solid fa-cross text-xl"></i>
        <h2 class="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider">
          JEZUS W CENTRUM — ODPOWIEDŹ NOWEGO TESTAMENTU
        </h2>
      </div>
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">
        <p><strong>1. Chrystus — Jedyny Doskonały Pośrednik Nowego Przymierza (1 Tm 2:5; Hbr 8:6):</strong> Podczas gdy Mojżesz uginał się pod ciężarem wstawiennictwa za ludem i musiał dzielić się władzą, Jezus Chrystus jest Jedynym Pośrednikiem między Bogiem a ludźmi, który wziął na Siebie cały ciężar naszych grzechów i wstawia się za nami nieustannie przed tronem Ojca.</p>
        <p><strong>2. Powołanie Siedmiu Diakonów w Dziejach Apostolskich (Dz 6:1–7):</strong> Wzór Jetry i Mojżesza staje się bezpośrednią inspiracją dla apostołów w Jerozolimie. W obliczu przeciążenia powołują siedmiu mężów pełnych Ducha i mądrości do obsługi stołów, aby sami mogli trwać w modlitwie i posłudze Słowa.</p>
        <p><strong>3. Jedno Ciało i Różnorodność Darów Łaski (1 Kor 12:12–28; Rz 12:4–8):</strong> Bóg nie powołał jednego człowieka do spełniania wszystkich funkcji. Chrystus obdarza Kościół różnorodnymi darami, tworząc harmonijne Ciało, w którym każdy członek jest potrzebny i powołany do wzajemnej służby.</p>
        <p><strong>4. Kryteria Przywództwa w Kościele Nowego Testamentu (1 Tm 3:1–13; Tt 1:5–9):</strong> Apostoł Paweł, opisując cechy biskupów, starszych i diakonów, powtarza etyczne wymagania Jetry: nienaganność, trzeźwość, prawdomówność, brak chciwości na brudny zysk i bojaźń Boża.</p>
        <p><strong>5. Słodkie Jarzmo i Lekkie Brzemię Zbawiciela (Mt 11:28–30):</strong> Jezus zaprasza wszystkich spracowanych i obciążonych do Siebie. W przeciwieństwie do ludzkiego przeciążenia, jarzmo Chrystusa przynosi odpoczynek dla duszy i uwalnia z niewoli samowystarczalności.</p>
        <p><strong>6. Wielka Uczta Narodów u boku Zbawiciela (Łk 13:29; Mt 8:11):</strong> Ofiara i wspólny posiłek Jetry z Aaronem i starszyzną Izraela przed Bogiem prefiguruje zbawienie pogan i wieczną ucztę Baranka, przy której zasiądą ludzie ze wszystkich narodów, plemion i języków.</p>
      </div>
    </section>`;

html = html.replace(
  /<!-- ── JEZUS W CENTRUM ── -->[\s\S]*?<!-- ── SPRAWDŹ W BIBLII ── -->/,
  `<!-- ── JEZUS W CENTRUM ── -->
    ${chrystusHtml}

    <!-- ── SPRAWDŹ W BIBLII ── -->`
);

// Podmiana Porównaj wersety
const bibliaHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel/60 border border-brand-border/30 space-y-4 my-8">
      <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-3 border-b border-brand-border/30 pb-3">
        <i class="fa-solid fa-book-bible text-amber-400"></i>
        <span>SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (PORÓWNAJ WERSETY)</span>
      </h2>
      <ul class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif">
        <li><strong>• Dz 6:1–7:</strong> Jak apostołowie rozwiązali problem przeciążenia w pierwotnym Kościele i jakie były owoce podziału ról?</li>
        <li><strong>• Pwt 1:9–18:</strong> Jak Mojżesz wspomina wybór sędziów i jakie instrukcje bezstronności im przekazał?</li>
        <li><strong>• Lb 11:14–17:</strong> Jak Bóg zareagował na późniejsze wołanie Mojżesza o samotności i jak podzielił Ducha na siedemdziesięciu starszych?</li>
        <li><strong>• 1 Tm 3:1–13:</strong> Jakie kwalifikacje moralne i duchowe stawia apostoł Paweł przed przywódcami zborowymi?</li>
        <li><strong>• Tt 1:5–9:</strong> Dlaczego Tytus miał ustanowić starszych w każdym mieście i czego mieli unikać liderzy?</li>
        <li><strong>• 1 Kor 12:14–26:</strong> Dlaczego oko nie może powiedzieć ręce: „Nie potrzebuję ciebie”?</li>
        <li><strong>• Mt 18:15–17:</strong> Jak Jezus nakazuje rozwiązywać spory we wspólnocie na najniższych możliwych szczeblach?</li>
        <li><strong>• Przyp 11:14:</strong> Dlaczego w mnóstwie doradców jest wybawienie i bezpieczeństwo?</li>
        <li><strong>• Przyp 15:22:</strong> Co dzieje się z planami, w których brakuje szczerej narady?</li>
        <li><strong>• 1 P 5:1–4:</strong> W jaki sposób pasterze mają paść trzodę Bożą — bez przymusu, bez chciwości i nie panując z góry?</li>
        <li><strong>• Mt 11:28–30:</strong> Do kogo Jezus kieruje wezwanie o zrzuceniu ciężarów i przyjęciu Jego odpoczynku?</li>
        <li><strong>• 1 Tm 2:5:</strong> Kto jest jedynym prawdziwym Pośrednikiem między świętym Bogiem a upadłym człowiekiem?</li>
      </ul>
    </section>`;

html = html.replace(
  /<!-- ── PORÓWNAJ WERSETY ── -->[\s\S]*?<!-- ── PRAWDA NA DZIŚ ── -->/,
  `<!-- ── PORÓWNAJ WERSETY ── -->
    ${bibliaHtml}

    <!-- ── PRAWDA NA DZIŚ ── -->`
);

// Podmiana Prawda na dziś
const prawdaHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel/60 border border-brand-border/30 space-y-4 my-8">
      <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-3 border-b border-brand-border/30 pb-3">
        <i class="fa-solid fa-lightbulb text-amber-400"></i>
        <span>PRAWDA NA DZIŚ — TEOLOGIA PRAKTYCZNA</span>
      </h2>
      <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
        <p><strong>1. Samowystarczalność jest iluzją i pychą:</strong> Nikt z nas nie został stworzony do samotnego niesienia wszystkich problemów. Przyznanie się do ograniczeń jest aktem dojrzałości i zaufania Bogu.</p>
        <p><strong>2. Mądrość może przyjść z niespodziewanej strony:</strong> Mojżesz potrafił przyjąć radę teścia spoza Izraela. Bóg często posługuje się ludźmi spoza naszego wąskiego kręgu, by wskazać nam ślepe punkty.</p>
        <p><strong>3. Kluczowe powołanie wymaga ochrony:</strong> Lider duchowy musi strzec czasu na modlitwę, wstawiennictwo i studiowanie Słowa Bożego. Zasypanie drobnymi sprawami niszczy duchową wrażliwość.</p>
        <p><strong>4. Etyka ważniejsza niż charyzma:</strong> Przy doborze współpracowników decydujący jest charakter: bojaźń Boża, prawdomówność i wolność od chciwości, a nie zewnętrzna błyskotliwość.</p>
        <p><strong>5. Delegowanie to akt zaufania Bogu i ludziom:</strong> Przekazanie odpowiedzialności innym uwalnia potencjał wspólnoty i pozwala rosnąć nowym pokoleniom sług Bożych.</p>
        <p><strong>6. Zdrowa struktura przynosi pokój:</strong> Gdy zadania są jasno rozdzielone, a spory rozstrzygane sprawiedliwie na właściwych szczeblach, cała społeczność powraca do swoich domów w pokoju.</p>
        <p><strong>7. Współpraca w Ciele Chrystusa:</strong> W Kościele nie ma miejsca na jednoosobowe teatry. Wszyscy jesteśmy członkami jednego Ciała powołanymi do wzajemnego budowania.</p>
        <p><strong>8. Odpoczynek w Chrystusie:</strong> Nasza ostateczna tożsamość i bezpieczeństwo spoczywają w dokonanym dziele Jezusa, a nie w liczbie spraw, które uda nam się osobiście załatwić.</p>
      </div>
    </section>`;

html = html.replace(
  /<!-- ── PRAWDA NA DZIŚ ── -->[\s\S]*?<!-- ── POMYŚL ── -->/,
  `<!-- ── PRAWDA NA DZIŚ ── -->
    ${prawdaHtml}

    <!-- ── POMYŚL ── -->`
);

// Podmiana Pytania do serca (Pomyśl)
const pytaniaHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel/60 border border-brand-border/30 space-y-4 my-8">
      <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-3 border-b border-brand-border/30 pb-3">
        <i class="fa-solid fa-heart text-amber-400"></i>
        <span>POMYŚL — PYTANIA DO SERCA</span>
      </h2>
      <ol class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif list-decimal pl-5 leading-relaxed">
        <li>Czy w swoim życiu zawodowym, rodzinnym lub kościelnym nie ulegasz pokusie samotnego kontrolowania wszystkiego?</li>
        <li>Jak reagujesz, gdy bliska osoba lub ktoś z zewnątrz zwraca Ci uwagę, że Twoje tempo życia jest niszczące („niedobra to rzecz, którą czynisz”)?</li>
        <li>Czy chronisz swój czas na osobistą modlitwę i relację z Bogiem, czy też pozwalasz, by pochłonęły Cię bieżące obowiązki?</li>
        <li>Jakie kryteria stosujesz, wybierając współpracowników lub powierzając komuś odpowiedzialność? Czy na pierwszym miejscu stawiasz charakter i bojaźń Bożą?</li>
        <li>Czy potrafisz zaufać innym i pozwolić im wykonywać zadania po swojemu, nie poprawiając każdego szczegółu?</li>
        <li>W jakim obszarze Twojego życia brakuje dziś mądrego podziału ról i delegowania zadań?</li>
        <li>Czy Twoje serce jest wolne od chciwości, pokusy zysku i nieszczerości w relacjach z ludźmi?</li>
        <li>Czy czerpiesz swój odpoczynek z łaski Chrystusa, czy próbujesz zasłużyć na akceptację przez nieustanny trud?</li>
      </ol>
    </section>`;

html = html.replace(
  /<!-- ── POMYŚL ── -->[\s\S]*?<!-- ── QUIZ ── -->/,
  `<!-- ── POMYŚL ── -->
    ${pytaniaHtml}

    <!-- ── QUIZ ── -->`
);

// Podmiana Twoja decyzja
const decyzjaHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/30 to-brand-panel border border-brand-gold/40 my-8 space-y-4">
      <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-3 border-b border-brand-gold/30 pb-3">
        <i class="fa-solid fa-hand-holding-heart text-amber-400"></i>
        <span>TWOJA DECYZJA — WEZWANIE DO POKORY I ZAUFANIA</span>
      </h2>
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed">
        <p>Słowo Boże z osiemnastego rozdziału Księgi Wyjścia stawia przed nami lustro prawdy. Wielu z nas żyje w przekonaniu, że nasza wartość, pobożność i sukces zależą od tego, jak wiele spraw zdołamy osobiście skontrolować i udźwignąć. Często mylimy świętą gorliwość z pracoholizmem, a brak zaufania do ludzi nazywamy „odpowiedzialnością”. Dzisiejsza lekcja burzy ten destrukcyjny schemat.</p>
        <p>Mojżesz, choć rozmawiał z Bogiem i oglądał Jego cuda, miał w sobie niezwykłą wielkość: potrafił z pokorą usłyszeć słowa prawdy od drugiego człowieka i natychmiast zreorganizować swoje życie. Przestał być wąskim gardłem całej społeczności. Pozwolił innym stanąć do służby, a sam skupił się na tym, do czego Bóg powołał go w sposób niezbywalny: na trwaniu w Bożej obecności, orędownictwie i nauczaniu dróg Królestwa.</p>
        <div class="p-4 rounded-xl bg-black/40 border border-brand-gold/30 text-amber-200 font-bold italic">
          MOJA DECYZJA: Świadomie rezygnuję z postawy samotnego bohatera i fałszywej kontroli. W pokorze uznaję moje ludzkie granice i powierzam moje przeciążenie Chrystusowi. Podejmuję decyzję, by w zaufaniu dzielić się odpowiedzialnością z innymi, szukać współpracowników o prawym i bogobojnym sercu oraz strzec mojego czasu na osobistą modlitwę i trwanie w obecności Pana.
        </div>
      </div>
    </section>`;

html = html.replace(
  /<!-- ── TWOJA DECYZJA ── -->[\s\S]*?<!-- ── MODLITWA ── -->/,
  `<!-- ── TWOJA DECYZJA ── -->
    ${decyzjaHtml}

    <!-- ── MODLITWA ── -->`
);

// Podmiana Modlitwa
const modlitwaHtml = `<section class="p-6 sm:p-8 rounded-2xl bg-brand-panel/80 border border-brand-border/40 my-8 space-y-4">
      <h2 class="font-serif text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-3 border-b border-brand-border/30 pb-3">
        <i class="fa-solid fa-hands-praying text-amber-400"></i>
        <span>MODLITWA NA 17 LISTOPADA 2026 R.</span>
      </h2>
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed italic">
        <p>Wszechmogący, Święty Boże, Ojcze naszego Pana Jezusa Chrystusa! Staję przed Tobą w ten wtorkowy dzień z sercem pełnym wdzięczności za mądrość Twojego odwiecznego Słowa. Dziękuję Ci za świadectwo życia Mojżesza i Jetry, które przypomina mi, że Ty jesteś Bogiem porządku, pokoju i harmonii. Wyznaję przed Tobą mój grzech pychy, niecierpliwości i lęku, przez który tak często próbowałem dźwigać wszystko o własnych siłach, nie dopuszczając innych do pomocy.</p>
        <p>Przepraszam Cię za chwile, w których pod płaszczykiem gorliwości i fałszywej odpowiedzialności niszczyłem własne siły, zaniedbywałem modlitwę i raniłem moich najbliższych. Dziękuję Ci, Panie Jezu, że Twoje jarzmo jest przyjemne, a Twoje brzemię lekkie. Ty nie nakładasz na nas ciężarów ponad siły, lecz sam wziąłeś na ramiona krzyż naszego odkupienia i dałeś nam Ducha Świętego, byśmy żyli we wspólnocie miłości.</p>
        <p>Proszę Cię, obdarz mnie duchem pokory i mądrości. Ucz mnie słuchać dobrych rad i rozpoznawać głos Twojej prawdy płynący z ust ludzi, których stawiasz na mojej drodze. Pomóż mi wyznaczać właściwe granice, chronić czas na intymne trwanie przed Twoim obliczem i uczyć innych Twoich ustaw i praw. Wzbudź w moim otoczeniu, w Kościele i w narodzie mężów i niewiasty dzielne, bojące się Ciebie, prawdomówne i nienawidzące wszelkiej niegodziwości.</p>
        <p>Niech Twój pokój, który przewyższa wszelki rozum, strzeże mojego serca i umysłu. Oddaję Ci każdy mój plan, każdą troskę i każdą relację. Prowadź mnie ścieżkami sprawiedliwości i spraw, by owocem mojego życia był ład, miłość i pomnożenie Twojej chwały na ziemi. W imieniu Jezusa Chrystusa, mojego Jedynego Pośrednika i Pana. Amen!</p>
      </div>
    </section>`;

html = html.replace(
  /<!-- ── MODLITWA ── -->[\s\S]*?<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS/,
  `<!-- ── MODLITWA ── -->
    ${modlitwaHtml}

    <!-- ── ZASTOSOWANIE I TWÓJ ZAPIS`
);

// Podmiana Zadań w sekcji Zapis
const zadaniaChecklistHtml = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeprowadź audyt własnego przeciążenia: Wypisz na kartce wszystkie obowiązki i sprawy, które obecnie prowadzisz samotnie, i zakreśl te, które możesz w zaufaniu przekazać innym.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zastosuj zasadę czterech cnót: Zidentyfikuj w swoim otoczeniu przynajmniej jedną osobę spełniającą biblijne kryteria Jetry (dzielna, bogobojna, prawdomówna, uczciwa) i zaproponuj jej współpracę.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Chroń przestrzeń wstawiennictwa: Zarezerwuj dziś nienaruszalne 20 minut na modlitwę i trwanie przed Bożym obliczem, zanim rzucisz się w wir bieżących obowiązków.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Wyraź wdzięczność doradcom: Podziękuj osobie, która w przeszłości dała Ci trafną, choć trudną radę korygującą Twoje postępowanie.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zbadaj swoje serce pod kątem chciwości: Zastanów się, czy w Twoich decyzjach zawodowych lub finansowych nie pojawia się pokusa nieprawego zysku, i odrzuć wszelki kompromis.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Przeczytaj i porównaj fragmenty: Przestudiuj Wj 18:1–27 równolegle z Dz 6:1–7 oraz 1 Tm 3:1–13, notując biblijne zasady zdrowego przywództwa.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz dzień jako ukończony i podziel się lekcją: Przekaż dzisiejsze rozważanie przynajmniej jednej osobie zmagającej się z pracoholizmem lub przeciążeniem w służbie.</span>
          </label>`;

html = html.replace(
  /<div class="space-y-2 text-xs sm:text-sm text-zinc-300 font-serif">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Status ukończenia dnia -->/,
  `<div class="space-y-2 text-xs sm:text-sm text-zinc-300 font-serif">
          ${zadaniaChecklistHtml}
        </div>
      </div>
      <!-- Status ukończenia dnia -->`
);

// Podmiana sekcji Jutro
const jutroHtml = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 18 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 49 — TELESKOP PRZYMIERZA POD GÓRĄ SYNAJ: ŚWIĘTE KAPŁAŃSTWO I PRZYGOTOWANIE LUDU (Wj 19:1–25)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 49: Przygotowanie narodu na spotkanie z majestatem Boga. Obmywanie szat, granice wokół góry, dym, ogień i głos trąby zapowiadający ogłoszenie Dziesięciu Przykazań.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (18 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  jutroHtml
);

// Podmiana danych QUIZ_DATA w skrypcie
const quizDataJs = `const QUIZ_DATA = [
      {
        q: "Kim był Jetro dla Mojżesza i jaką funkcję pełnił w Midianie (Wj 18:1)?",
        a: ["Był bratem Mojżesza i wodzem wojsk", "Był teściem Mojżesza i kapłanem Midianitów", "Był egipskim urzędnikiem dworskim", "Był starszym z pokolenia Lewiego"],
        c: 1
      },
      {
        q: "O czym usłyszał Jetro, zanim wyruszył na spotkanie z Mojżeszem (Wj 18:1)?",
        a: ["O klęsce Izraela w walce z Amalekitami", "O wszystkim, co Bóg uczynił dla Mojżesza i Izraela, że PAN wyprowadził lud z Egiptu", "O budowie złotego cielca", "O zatonięciu floty handlowej"],
        c: 1
      },
      {
        q: "Kogo Jetro przyprowadził ze sobą do obozu Mojżesza (Wj 18:2–3)?",
        a: ["Tylko stada owiec i wielbłądów", "Żonę Mojżesza Seforę oraz jej dwóch synów", "Całe wojsko zbrojne Midianitów", "Egipskich posłów z okupem"],
        c: 1
      },
      {
        q: "Jak miał na imię pierwszy syn Mojżesza i co oznaczało to imię (Wj 18:3)?",
        a: ["Eliezer, bo Bóg był pomocą", "Gerszom, bo Mojżesz powiedział: Jestem przybyszem w cudzej ziemi", "Jozue, bo PAN jest zbawieniem", "Manasses, bo Bóg dał zapomnieć o trudzie"],
        c: 1
      },
      {
        q: "Jakie znaczenie miało imię drugiego syna Mojżesza — Eliezera (Wj 18:4)?",
        a: ["Bóg mego ojca był moją pomocą i wybawił mnie od miecza faraona", "PAN moim sztandarem na wzgórzu", "Owocny w krainie mego ucisku", "Światło o poranku"],
        c: 0
      },
      {
        q: "Gdzie obozował Mojżesz, gdy przybył do niego Jetro (Wj 18:5)?",
        a: ["Nad Nilem w Goszen", "Na pustyni, przy górze Boga", "W oazie Elim pod palmami", "W Kadesz-Barnea"],
        c: 1
      },
      {
        q: "Jak Mojżesz przywitał swojego teścia Jetrę (Wj 18:7)?",
        a: ["Został w namiocie i posłał sługi", "Wyszedł naprzeciw, pokłonił się, ucałował go i weszli do namiotu", "Zażądał daniny przed wejściem", "Przywitał go chłodno z obawy przed bałwochwalstwem"],
        c: 1
      },
      {
        q: "O czym Mojżesz opowiedział Jetrze podczas rozmowy w namiocie (Wj 18:8)?",
        a: ["O swoich planach podboju miast kananejskich", "O wszystkim, co PAN uczynił faraonowi i Egipcjanom, o trudzie w drodze i jak PAN ich wybawił", "O skarbach zabranych z Egiptu", "O tajemnicach kapłanów Nilu"],
        c: 1
      },
      {
        q: "Jak zareagował Jetro na relację Mojżesza o ocaleniu Izraela (Wj 18:9–10)?",
        a: ["Zaniepokoił się potęgą militarną Izraela", "Cieszył się ze wszelkiego dobra od PANA i powiedział: Niech będzie błogosławiony PAN", "Zażądał zwrotu kosztów utrzymania rodziny Mojżesza", "Ostrzegł przed zemstą faraona"],
        c: 1
      },
      {
        q: "Jakie fundamentalne wyznanie wiary złożył Jetro w Wj 18:11?",
        a: ["Wszyscy bogowie narodów są równi", "Teraz wiem, że PAN jest większy od wszystkich bogów", "Mojżesz jest największym z królów", "Pustynia należy do bogów Midianu"],
        c: 1
      },
      {
        q: "Co uczynił Jetro przed Bogiem w Wj 18:12?",
        a: ["Wziął całopalenie i ofiary dla Boga", "Zbudował zamek obronny", "Nakazał zniszczyć ołtarz Mojżesza", "Namaścił Mojżesza na króla"],
        c: 0
      },
      {
        q: "Kto przyszedł, aby wspólnie z teściem Mojżesza jeść chleb przed Bogiem (Wj 18:12)?",
        a: ["Wojownicy Jozuego", "Aaron i wszyscy starsi Izraela", "Kobiety z pokolenia Judy", "Egipscy uciekinierzy"],
        c: 1
      },
      {
        q: "Co robił Mojżesz nazajutrz po uczcie i jak długo to trwało (Wj 18:13)?",
        a: ["Odpoczywał w namiocie przez cały dzień", "Usiadł, aby sądzić lud, a lud stał przed nim od rana aż do wieczora", "Wyruszył na polowanie", "Kreślił plany świątyni"],
        c: 1
      },
      {
        q: "Jakie pytanie zadał Jetro, widząc samotnie pracującego Mojżesza (Wj 18:14)?",
        a: ["Ile zarabiasz na każdym wyroku?", "Dlaczego ty siedzisz sam, a cały lud stoi przed tobą od rana aż do wieczora?", "Gdzie podziali się twoi ochroniarze?", "Czemu nie każesz ukamienować buntowników?"],
        c: 1
      },
      {
        q: "Jak Mojżesz uzasadnił swoje samotne zasiadanie na sądzie (Wj 18:15–16)?",
        a: ["Że nikomu w obozie nie ufa", "Bo lud przychodzi radzić się Boga, a on rozsądza spory i oznajmia ustawy Boga", "Że tylko on potrafi pisać", "Bo taki otrzymał nakaz od Aarona"],
        c: 1
      },
      {
        q: "Co powiedział teść Mojżesza w Wj 18:17–18 o jego sposobie pracy?",
        a: ["Czynisz wspaniale, tak trzymaj dalej", "Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz", "Powinieneś pracować także w nocy", "Zwiększ opłaty sądowe"],
        c: 1
      },
      {
        q: "Jakie dwa kluczowe zadania duchowe Jetro pozostawił Mojżeszowi (Wj 18:19–20)?",
        a: ["Gotowanie posiłków i rozbijanie namiotów", "Wstawianie się za ludem przed Bogiem i nauczanie ustaw oraz wskazywanie drogi życia", "Dowodzenie wojskiem i pobór podatków", "Szycie szat kapłańskich"],
        c: 1
      },
      {
        q: "Jakie cztery cnoty charakteru musieli posiadać mężowie wybierani na przywódców (Wj 18:21)?",
        a: ["Wysocy, bogaci, elokwentni i młodzi", "Mężczyźni dzielni, bojący się Boga, prawdomówni i nienawidzący chciwości", "Krewni Mojżesza, kupcy i żołnierze", "Kapłani egipscy, rzemieślnicy i muzycy"],
        c: 1
      },
      {
        q: "Nad jakimi grupami ludzi mieli zostać ustanowieni sędziowie (Wj 18:21)?",
        a: ["Nad milionami, prowincjami i miastami", "Nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką", "Wyłącznie nad pokoleniem Lewiego", "Nad właścicielami wielbłądów"],
        c: 1
      },
      {
        q: "Jaki był skutek pokornego usłuchania rady Jetry przez Mojżesza (Wj 18:24–26)?",
        a: ["Wybuchł bunt starszych i wojna domowa", "Mojżesz wybrał dzielnych mężów, którzy sądzili lud w każdym czasie, a trudne sprawy zanosili do niego, przynosząc pokój", "Jetro został ogłoszony królem Izraela", "Lud odmówił podporządkowania się nowym sędziom"],
        c: 1
      }
    ];`;

html = html.replace(/const QUIZ_DATA = \[[\s\S]*?\];/, quizDataJs);

// Zmiana wszystkich kluczy localStorage na kc_day48_
html = html.replace(/kc_day47_/g, `kc_day48_`);
html = html.replace(/DAY_KEY = 'kc_day47'/g, "DAY_KEY = 'kc_day48'");
html = html.replace(/completeDay47/g, 'completeDay48');
html = html.replace(/Oznacz Dzień 47 jako ukończony/g, 'Oznacz Dzień 48 jako ukończony');
html = html.replace(/Dzień 47 ukończony/g, 'Dzień 48 ukończony');
html = html.replace(/Dzień 47 z 2009/g, 'Dzień 48 z 2009');
html = html.replace(/20 Pytań z Wj 17 \(Sprawdź swoją wiedzę\)/g, '20 Pytań z Wj 18 (Sprawdź swoją wiedzę)');
html = html.replace(/Po przeczytaniu Wj 17/g, 'Po przeczytaniu Wj 18');
html = html.replace(/QUIZ LOGIC \(20 PYTAŃ Z WJ 17:1–16\)/g, 'QUIZ LOGIC (20 PYTAŃ Z WJ 18:1–27)');
html = html.replace(/Klucze Językowe & Kody Stronga \(Wj 17:1–16\)/g, 'Klucze Językowe & Kody Stronga (Wj 18:1–27)');
html = html.replace(/osnowę teologiczną 17\. rozdziału/g, 'osnowę teologiczną 18. rozdziału');
html = html.replace(/Księgi Wyjścia 17:1–16/g, 'Księgi Wyjścia 18:1–27');
html = html.replace(/href="\/mojabiblia\?book=EXO&amp;chapter=17"/g, 'href="/mojabiblia?book=EXO&amp;chapter=18"');
html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=17"/g, 'href="/mojabiblia?book=EXO&chapter=18"');
html = html.replace(/Czytaj Wj 17/g, 'Czytaj Wj 18');
html = html.replace(/Księga Wyjścia 17:6/g, 'Księga Wyjścia 18:21');
html = html.replace(/Wj 17:6/g, 'Wj 18:21');
html = html.replace(/17\. rozdział Księgi Wyjścia/g, '18. rozdział Księgi Wyjścia');
html = html.replace(/17\. rozdziału Księgi Wyjścia/g, '18. rozdziału Księgi Wyjścia');

// Zapisujemy Dzień 48 w 8 ścieżkach
const paths48 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-48.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-48/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-48.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-48/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-48.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-48/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-48.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-48/index.html'
];

for (const p of paths48) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 8 kompletnych kopii HTML Dnia 48 z 45 punktami egzegetycznymi!');

// ── 7. AKTUALIZACJA DNIA 47 (ŁĄCZNIK DO DNIA 48) ──
console.log('🔗 Aktualizuję Dzień 47 (link nawigacji i sekcję Jutro)...');
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
  if (fs.existsSync(p)) {
    let content47 = fs.readFileSync(p, 'utf8');
    // Górny pasek nawigacji
    content47 = content47.replace(
      /<span class="px-3 py-1.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-\[44px\]">\s*<span>Dzień 48 \(Wtorek\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-48" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition min-h-[44px]">
          <span>Dzień 48 (Wtorek) →</span>
        </a>`
    );
    // Sekcja Jutro
    content47 = content47.replace(
      /<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-\[44px\]">\s*<span>Dostępne od północy \(16 listopada 2026\)<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-48" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8C33] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 transition min-h-[44px]">
            <span>CZYTAJ DZIEŃ 48 (17 LISTOPADA) →</span>
          </a>`
    );
    fs.writeFileSync(p, content47, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania w Dniu 47!');

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
  contentSms: 'Dzień 48 (Wj 18:21): „Upatrz sobie mężów dzielnych, bojących się Boga, prawdomównych i nienawidzących chciwości”. Nie dźwigaj wszystkiego sam. Zaufaj wspólnocie w Chrystusie! polskieradio.cc',
  tvScript: pakiet5wersji.split('WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1].split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)')[0].trim(),
  ccnArticle: pakiet5wersji.split('WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1].trim(),
  imageUrl: `/images/academy/daily/kc_day_${DAY_NUM}_rady_jetry_i_wybor_sedziow.jpg`,
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
  if (!currentBaza.includes(`Dzień ${DAY_NUM} (17 listopada 2026)`)) {
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

console.log('🎉 Kompletne generowanie i synchronizacja lekcji Dnia 48 zakończona sukcesem!');
