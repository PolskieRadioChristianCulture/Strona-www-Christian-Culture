import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from 'docx';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Dzień 49: Wj 19:1–25 (18 listopada 2026, Środa)
const DAY_NUM = 49;
const DATE_STR = '2026-11-18';
const DATE_FORMATTED = 'Środa, 18 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 19:1–25';
const TITLE = 'PRZYMIERZE POD GÓRĄ SYNAJ — KRÓLEWSKIE KAPŁAŃSTWO I PRZYGOTOWANIE LUDU NA SPOTKANIE Z MAJESTATEM BOGA';
const SUBTITLE = 'Przybycie na pustynię Synaj w trzecim miesiącu, opieka orlich skrzydeł, obietnica szczególnej własności i świętego narodu, trzy dni uświęcenia i obmywania szat oraz majestatyczna teofania w ogniu, dymie i dźwięku trąby (Wj 19:1–25)';
const MEMORY_VERSE_QUOTE = 'Dlatego teraz, jeśli posłuchacie mego głosu i będziecie przestrzegać mojego przymierza, będziecie moją szczególną własnością ponad wszystkie narody, bo do mnie należy cała ziemia. A wy będziecie mi królestwem kapłanów i narodem świętym.';
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” (Wj 19:5–6, UBG)`;
const THEME = 'Dziewiętnasty rozdział Księgi Wyjścia jest jednym z najbardziej przełomowych punktów zwrotnych całej Biblii: Bóg, który wcześniej na skrzydłach orłów wyprowadził Izraela z domu niewoli i przyprowadził go do Siebie, staje teraz pod dymiącą Górą Synaj, aby zaprosić odkupiony lud do osobistego Przymierza. Zanim padnie choćby jedno z Dziesięciu Przykazań, Bóg przypomina o swojej suwerennej łasce i ogłasza potrójne powołanie Izraela: będzie szczególną własnością (segullah), królestwem kapłanów i narodem świętym pośród całej ziemi, która należy do PANA. Spotkanie z Bogiem żywym wymaga jednak głębokiego przygotowania serca i życia — przez trzy dni lud ma się uświęcić, wyprać szaty i uszanować wyznaczone granice świętości. Gdy trzeciego dnia o poranku góra drży w ogniu, dymie, błyskawicach i potężnym głosie trąby, Mojżesz pośredniczy między świętym Bogiem a drżącym narodem. W świetle Nowego Testamentu Synaj prowadzi nas wprost na Górę Syjon i pod krzyż Jezusa Chrystusa — Doskonałego Pośrednika Nowego Przymierza (Hbr 12:18–24), przez którego krew Kościół staje się wybranym rodem i królewskim kapłaństwem (1 P 2:9; Ap 5:10)!';

console.log('🚀 Rozpoczynam generowanie pełnej lekcji Dnia 49 (Wj 19:1–25)...');

// ── 0. DOPASOWANIE GRAFIKI DO DOKŁADNEGO ROZMIARU 1376x768 ──
const imgRelPath = 'images/academy/daily/kc_day_49_przymierze_pod_gora_synaj.jpg';
const imgAbsPath = path.join(process.cwd(), imgRelPath);
if (fs.existsSync(imgAbsPath)) {
  const srcBuf = fs.readFileSync(imgAbsPath);
  const meta = await sharp(srcBuf).metadata();
  if (meta.width !== 1376 || meta.height !== 768) {
    const buf = await sharp(srcBuf)
      .resize(1376, 768, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(imgAbsPath, buf);
    const luminaImg = 'C:/Users/czark/Desktop/@ICC/LUMINA/' + imgRelPath;
    if (fs.existsSync(path.dirname(luminaImg))) {
      fs.writeFileSync(luminaImg, buf);
    }
    console.log('✅ Dopasowano grafikę Dnia 49 do 1376×768 px.');
  }
}

// ── 1. CZYTANIE DNIA (UBG) ──
const exo19Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-019.json');
const exo19Data = JSON.parse(fs.readFileSync(exo19Path, 'utf8'));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 19:1–9 — Obóz na pustyni Synaj, łaska orlich skrzydeł, królewskie kapłaństwo i odpowiedź ludu</h3></div>',
  ...exo19Data.verses.filter(v => v.number <= 9).map(v => `<p><span class="verse-num">19:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 19:10–15 — Trzy dni uświęcenia, obmycie szat i granice wokół świętej góry</h3></div>',
  ...exo19Data.verses.filter(v => v.number >= 10 && v.number <= 15).map(v => `<p><span class="verse-num">19:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 19:16–25 — Zstąpienie PANA w ogniu i grzmotach, głos trąby i rozmowa z Mojżeszem na szczycie</h3></div>',
  ...exo19Data.verses.filter(v => v.number >= 16).map(v => `<p><span class="verse-num">19:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

const readingDocxLines = exo19Data.verses.map(v => `19:${v.number} ${v.text}`).join('\n\n');

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ (STANDARD ANTIGRAVITY) ──
const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 49 (18 listopada 2026): Przymierze pod Górą Synaj — Królewskie Kapłaństwo i Święty Naród (Wj 19:1–25)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Czterdziesty Dziewiąty

**Czy zdajesz sobie sprawę, że zanim Bóg dał swojemu ludowi choćby jedno przykazanie, najpierw wziął go na skrzydła orła i przyprowadził do Siebie?**

Zatrzymaj się w ten środowy poranek, osiemnastego listopada dwa tysiące dwudziestego szóstego roku. Oddaj na chwilę swój pośpiech Bogu i spójrz na własną drogę wiary. Tak często myślimy o chrześcijaństwie jak o ciężkim regulaminie, na który trzeba sobie zasłużyć, zanim Bóg spojrzy na nas z życzliwością. W sercu rodzi się wtedy lęk i zmęczenie. W ciszy modlitwy zadaj dziś bezkompromisowe pytanie swojemu Ojcu: Tato, dlaczego tak łatwo zapominam, że najpierw mnie odkupiłeś i przygarnąłeś do Siebie, a dopiero potem wzywasz mnie do świętości i posłuszeństwa?

W dziewiętnastym rozdziale Księgi Wyjścia Izrael w trzecim miesiącu po wyjściu z Egiptu rozbija obóz na pustyni naprzeciw góry Synaj. Mojżesz wstępuje na górę, a Pan przypomina mu fundament całej relacji przymierza: Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do Siebie. Dopiero na tym fundamencie wyświadczonej już łaski Bóg składa obietnicę: jeśli lud posłucha Jego głosu i będzie przestrzegał przymierza, stanie się szczególną własnością Boga ponad wszystkie narody, królestwem kapłanów i narodem świętym. Ale spotkanie z Bogiem żywym nie może być byle jakie i powierzchowne. Przez trzy dni Izrael ma się uświęcić, wyprać swoje szaty i uszanować wyznaczone granice u podnóża góry. Trzeciego dnia o poranku niebo rozrywają grzmoty, błyskawice, gęsty obłok, dym unoszący się jak z pieca i coraz potężniejszy głos trąby. Cała góra drży, a cały lud staje na spotkanie ze swoim Stwórcą i Zbawicielem!

Psychologia duchowego wzrostu i budowania tożsamości potwierdza tę biblijną kolejność: człowiek, który nie zna swojej godności i nie wie, że jest najpierw bezwarunkowo ocalony i umiłowany, próbuje kupować akceptację przez lękliwe wykonywanie przepisów albo całkowicie rezygnuje z wymagań moralnych. Bóg pod Synajem uczy nas jedności łaski i świętości. Łaska nie znosi szacunku, a Boża bliskość nie oznacza spoufalania się z grzechem. Obmyte szaty są znakiem serca gotowego porzucić dawne przyzwyczajenia, by z czystym sumieniem słuchać głosu Najwyższego.

Prawda Królestwa uderza z wyzwalającą mocą: Bóg nie powołał Cię do religijnej rutyny ani do życia z dala od Niego. Przez Jezusa Chrystusa uczynił Cię częścią królewskiego kapłaństwa i narodu świętego, a zamiast przerażającej góry płonącej ogniem otworzył Ci bezpieczny dostęp do swojej obecności przez krzyż Golgoty!

Jezus mówi dziś do Ciebie:
„Błogosławieni czystego serca, ponieważ oni zobaczą Boga.” (Ewangelia według świętego Mateusza, rozdział piąty, werset ósmy, UBG) oraz „Jeśli mnie miłujecie, zachowujcie moje przykazania.” (Ewangelia według świętego Jana, rozdział czternasty, werset piętnasty, UBG)

Zadanie Taktyczne:
Na swoim środowym posterunku przygotuj swoje serce jak lud przed spotkaniem z Bogiem. Zrezygnuj dzisiaj z bylejakości w modlitwie i nie pozwalaj sobie na lekkie traktowanie tego, co święte. Wybierz konkretną chwilę ciszy przed lekturą Słowa, uporządkuj jedną zaniedbaną sprawę sumienia i wyznaj na głos: Zostałem niesiony na skrzydłach Bożej łaski, dlatego w Chrystusie należę do Jego królewskiego kapłaństwa!

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci, że nie zostawiłeś mnie w domu niewoli, lecz przyprowadziłeś mnie do Siebie na skrzydłach swojej łaski. Wybacz mi chwile, w których traktowałem Twoją świętość zbyt lekko albo próbowałem zasłużyć na Twoją miłość własną siłą. Oczyść moje serce i moje myśli przez krew Jezusa Chrystusa, abym był gotowy słuchać Twojego głosu i wiernie trwać w Twoim przymierzu. Uczyń moje życie świadectwem narodu świętego i królewskiego kapłaństwa. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Otwórz swoje serce na sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Wejdź do bazy ludzi z pasją, buduj codzienny nawyk czytania Słowa i wspólnie z braćmi i siostrami wzrastaj w poznaniu Chrystusa.

Błogosławieństwo:
Niech Pan zastępów okryje Cię swoim pokojem i bojaźnią pełną miłości. Niech niesie Cię na orlich skrzydłach przez dzisiejsze wyzwania i czyni Twoje życie czystą świątynią Jego obecności. Dobrego dnia! Podaj dalej.

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 49 (18 listopada 2026 r.)
📖 Księga Wyjścia 19:1–25: Przymierze pod Górą Synaj — Królewskie Kapłaństwo i Przygotowanie Ludu

Czy pamiętasz, że Bóg najpierw niesie na skrzydłach orłów i wyzwala z niewoli, zanim wręczy tablicę swoich przykazań?

W 49. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) wkraczamy na pustynię Synaj, gdzie dokładnie w 3. miesiącu po wyjściu z Egiptu obóz Izraela zatrzymuje się u stóp świętej góry Boga (Wj 19:1–25: https://polskieradio.cc/mojabiblia?ref=Wj19:1-25). Zanim padnie Dekalog z Wj 20, Pan stawia przed narodem wspaniałą wizję tożsamości i wzywa do trzydniowego przygotowania na spotkanie ze swoim majestatem. Wybieraj dzisiaj świadomie: żyj jako ktoś wykupiony z łaski i oddany Bogu w świętości!

Kluczowe filary dzisiejszego studium:
1. Łaska poprzedzająca Prawo (Wj 19:1–4): Bóg przypomina Izraelowi: „Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do siebie”. Posłuszeństwo w Biblii nigdy nie kupuje zbawienia — jest odpowiedzią wdzięczności za już dokonane ocalenie.
2. Potrójne Powołanie Przymierza (Wj 19:5–6): Posłuszny lud staje się dla Stwórcy całej ziemi:
   • Szczególną własnością (*segullah*) — bezcennym skarbem Króla ponad wszystkie narody.
   • Królestwem kapłanów (*mamlechet kohanim*) — pośrednikiem błogosławieństwa dla całego świata.
   • Narodem świętym (*goj kadosz*) — wspólnotą oddzieloną od bałwochwalstwa i moralnego rozkładu.
3. Święte Przygotowanie i Granice (Wj 19:10–15): Przez 3 dni lud ma się uświęcić i wyprać szaty, a wokół góry wyznaczono nieprzekraczalną granicę. Prawdziwa bliskość z Bogiem wymaga czci, pokory i oczyszczenia życia.
4. Teofania w Ogniu, Dymie i Dźwięku Trąby (Wj 19:16–25): Trzeciego dnia o poranku góra Synaj trzęsie się i dymi jak piec w ogniu Bożej obecności. Mojżesz pełni rolę pośrednika między świętym Bogiem a drżącym ludem.
5. Od Góry Synaj do Góry Syjon (Hbr 12:18–24; 1 P 2:9): W Chrystusie — Pośredniku Nowego Przymierza — wierzący ze wszystkich narodów stają się królewskim kapłaństwem i narodem świętym, zyskując bezpieczny przystęp do tronu łaski.

Jezus mówi dziś do Ciebie:
„Błogosławieni czystego serca, ponieważ oni zobaczą Boga.” (Mt 5:8, UBG) | „Lecz wy jesteście rodem wybranym, królewskim kapłaństwem, narodem świętym, ludem nabytym...” (1 P 2:9, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 19:1–25 oraz Hbr 12:18–24 i 1 P 2:4–10.
• Wierz: Bóg przyprowadził Cię do Siebie na skrzydłach łaski Chrystusa — Twoja tożsamość nie zależy od lęku, lecz od krwi Przymierza.
• Działaj: Przygotuj dziś swoje serce przed spotkaniem z Bogiem — oczyść myśli i konkretny obszar codzienności z kompromisu, stając przed Nim z czcią i wdzięcznością.

Studiuj pełny tekst, kody Stronga i komentarz werset po wersecie:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-49

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://patronite.pl/osobowoscplus

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 49 (Wj 19:5-6): „Będziecie moją szczególną własnością... królestwem kapłanów i narodem świętym”. Bóg niesie Cię na orlich skrzydłach łaski! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w kolorystyce głębokiej czerni (#000000) oraz szlachetnego złota Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie w tle monumentalna grafika 16:9: granitowa góra Synaj w burzowym obłoku, ogniu, dymie i złotych błyskawicach o poranku; u jej podnóża kamienna granica, białe namioty obozu Izraela oraz Mojżesz z laską zwrócony ku majestatowi góry. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 49: PRZYMIERZE POD GÓRĄ SYNAJ I KRÓLEWSKIE KAPŁAŃSTWO”.

[INTRO: ŁASKA PRZED PRZYKAZANIEM]
Noemi: Dzień dobry! Witamy serdecznie w czterdziestym dziewiątym dniu naszej codziennej podróży przez sześćdziesiąt sześć ksiąg Pisma Świętego! Dziś stajemy w jednym z najbardziej podniosłych i przełomowych miejsc w całej historii zbawienia — u stóp góry Synaj!
Sara: Witaj, Noemi, witamy wszystkich naszych widzów i słuchaczy Christian Culture TV! Za chwilę, bo już w dwudziestym rozdziale Księgi Wyjścia, rozbrzmią Dziesięć Przykazań. Ale zanim Bóg wypowie choćby jedno „nie będziesz” albo „pamiętaj”, w dziewiętnastym rozdziale dzieje się coś absolutnie niezwykłego, co całkowicie zmienia sposób, w jaki rozumiemy Boże Prawo!
Noemi: Dokładnie tak! Izrael przybywa na pustynię Synaj w trzecim miesiącu po wyjściu z Egiptu. Mojżesz wchodzi na górę, a pierwsze słowa, jakie słyszy od Boga, to nie lista wymagań i kar, lecz poruszające przypomnienie miłości: „Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do siebie”.
Sara: „Niosłem was na skrzydłach orłów i przyprowadziłem was do siebie”! Nie „przyszliście do mnie własnym wysiłkiem”, nie „zdobyliście górę swoją pobożnością”. Najpierw jest łaska, wybawienie i czuła opieka Ojca, który jak orzeł bierze młode na własne skrzydła. A dopiero na tym fundamencie pojawia się zaproszenie do Przymierza!

[ANALIZA PROBLEMOWA: SZCZEGÓLNA WŁASNOŚĆ, ŚWIĘTOŚĆ I GRANICE]
Noemi: I spójrzmy, Sara, kim Bóg czyni ten ocalony lud w piątym i szóstym wersecie: „będziecie moją szczególną własnością ponad wszystkie narody... królestwem kapłanów i narodem świętym”. Hebrajskie słowo *segullah* oznacza najcenniejszy osobisty skarb króla! Bóg mówi Izraelowi: cała ziemia należy do Mnie, ale wy macie być Moim skarbem i moimi kapłanami — narodem, przez który świat pozna prawdziwego Boga!
Sara: Ale potem dzieje się coś, co dla współczesnego człowieka bywa bardzo trudne i zaskakujące. Gdy lud odpowiada jednym głosem: „Uczynimy wszystko, co PAN powiedział”, Bóg nie mówi: „Wspaniale, wpadnijcie na górę, kiedy chcecie”. Bóg nakazuje Mojżeszowi: „Uświęć ich dziś i jutro, niech wypiorą swoje szaty i wyznaczysz ludowi granice dokoła!”.
Noemi: To jest niesamowicie ważne lekcja na nasze czasy! Często wpadamy w dwie skrajności: albo widzimy Boga jako surowego policjanta bez serca, albo spoufalamy się z Nim tak bardzo, że zapominamy o Jego absolutnej świętości. Pod Synajem Bóg łączy czułość orlich skrzydeł z ogniem, dymem, grzmotami i wyraźną granicą! Trzy dni przygotowania i obmycie szat uczyły ludzi, że do Świętego Boga nie podchodzi się w brudzie lekceważenia i bylejakości.

[SŁOWO ROZKAZU: PERSPEKTYWA BIBLIJNA]
Sara: Zobaczmy na ekranie dzisiejsze Słowo i jego niesamowite wypełnienie w Nowym Testamencie! W Liście do Hebrajczyków w rozdziale dwunastym czytamy o kontraście dwóch gór: „Bo nie podeszliście do góry, która da się dotknąć i płonącej ogniem... Lecz podeszliście do góry Syjon i do miasta Boga żywego... I do pośrednika nowego przymierza, Jezusa, do krwi, którą się kropi, a która mówi lepsze rzeczy niż krew Abla”.
Noemi: Pod Synajem nawet zwierzę nie mogło dotknąć góry, a lud drżał na głos trąby. A pod krzyżem Jezusa Chrystusa to On sam — Doskonały Pośrednik — wziął na Siebie ogień Bożego sądu nad grzechem, obmył nasze szaty swoją krwią i otworzył nam dostęp do samego Ojca! Dlatego apostoł Piotr w pierwszym liście rozdziale drugim i wersecie dziewiątym przenosi dokładnie te słowa z Księgi Wyjścia na cały Kościół Jezusa: „Lecz wy jesteście rodem wybranym, królewskim kapłaństwem, narodem świętym, ludem nabytym, abyście rozgłaszali cnoty tego, który was powołał z ciemności do swej cudownej światłości”.

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Sara: Jak więc żyć tym poselstwem w tę środę?
• Czytaj: dziewiętnasty rozdział Księgi Wyjścia oraz dwunasty rozdział Listu do Hebrajczyków.
• Wierz: jesteś szczególną własnością Boga dzięki łasce Jezusa, nie przez własną doskonałość.
• Działaj: przygotuj dziś swoje serce przed modlitwą. Odłóż rozproszenia, zadbaj o czystość sumienia i stań przed światem jako świadek królewskiego kapłaństwa!

[MANIFEST: MODLITWA BOJOWA]
Noemi: Stańmy razem w modlitwie przed Bogiem Przymierza! Panie Boże Wszechmogący, Ty, który w ogniu i obłoku zstąpiłeś na górę Synaj, a na górze Kalwarii objawiłeś pełnię swojej miłości w Jezusie Chrystusie — oddajemy Ci cześć i chwałę! Dziękujemy Ci, że niosłeś nas na skrzydłach orłów i przyprowadziłeś do Siebie.
Sara: Obmyj dziś nasze duchowe szaty krwią Baranka. Uwolnij nas zarówno od lęku niewolników, jak i od lekkomyślnego traktowania Twojej świętości. Naucz nas słuchać Twojego głosu, strzec Twojego przymierza i odważnie rozgłaszać Twoje cnoty w świecie pełnym ciemności. W imieniu Jezusa Chrystusa, Pośrednika Nowego Przymierza. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Noemi: Niech Pan niesie Cię dziś na swoich skrzydłach i niech Jego świętość będzie Twoją radością i siłą!
Sara: Czytaj, wierz, działaj. Dla Jezusa! Dobrego dnia i do zobaczenia jutro na Dziesięciu Przykazaniach!

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: PRZYMIERZE SYNAJSKIE, TEOLOGIA ŁASKI I POWOŁANIE KRÓLEWSKIEGO KAPŁAŃSTWA (WJ 19:1–25)
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 18 listopada 2026 r.

Dziewiętnasty rozdział Księgi Wyjścia (Wj 19:1–25) stanowi teologiczne i strukturalne serce Pięcioksięgu. Po pięćdziesięciu dniach wędrówki od paschalnej nocy wyjścia z Egiptu — w trzecim miesiącu od opuszczenia domu niewoli — Izrael rozbija obóz na pustyni Synaj, naprzeciw góry Boga. To właśnie w tym rozdziale ustanowiona zostaje biblijna gramatyka przymierza: suwerenna łaska zbawienia zawsze poprzedza etyczne zobowiązania Prawa, a odkupiona wspólnota otrzymuje uniwersalną misję kapłańskiego pośrednictwa dla wszystkich narodów ziemi.

1. Orle skrzydła i priorytet łaski przed Dekalogiem (Wj 19:1–4)
Zanim z wysokości Synaju padnie pierwsze z Dziesięciu Przykazań (Wj 20), Bóg wzywa Mojżesza i powierza mu orędzie przypominające historię ocalenia: „Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do siebie” (Wj 19:4). Metafora orła (por. Pwt 32:11) ilustruje zarówno potęgę, jak i troskliwą czułość Boga, który chroni słaby lud przed śmiertelnym zagrożeniem i osobiście przyprowadza go do komunii ze Sobą.
> „Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do siebie.” (Wj 19:4, UBG)
Tym samym teologia Tory wyklucza wszelki legalizm: Izrael nie zachowuje przymierza po to, aby dopiero zasłużyć na wyzwolenie z Egiptu, lecz wchodzi w posłuszeństwo jako lud już wyzwolony i przyjęty przez łaskę.

2. Potrójny statut ludu Przymierza: Segullah, Królestwo Kapłanów i Naród Święty (Wj 19:5–8)
Warunkowa obietnica z Wj 19:5–6 definiuje tożsamość Izraela w relacji do całego stworzenia („bo do mnie należy cała ziemia”) za pomocą trzech fundamentalnych pojęć hebrajskich:
> • **Szczególna własność (סְגֻלָּה — *segullah*):** osobisty, pieczołowicie strzeżony skarb króla, odróżniony od zwykłego mienia państwowego.
> • **Królestwo kapłanów (מַמְלֶכֶת כֹּהֲנִים — *mamlechet kohanim*):** cała społeczność powołana do pośredniczenia między Bogiem Stwórcą a pozostałymi narodami ziemi — reprezentująca Boga przed światem i zanosząca świat przed Boga.
> • **Naród święty (גּוֹי קָדוֹשׁ — *goj kadosz*):** wspólnota konsekrowana, oddzielona etycznie i kultycznie dla służby Najwyższemu, odzwierciedlająca Jego charakter w sprawiedliwości i prawdzie.
Jednomyślna deklaracja ludu: „Uczynimy wszystko, co PAN powiedział” (Wj 19:8) stanowi formalną ratyfikację gotowości do wejścia w przymierze, mimo że późniejsza historia ukaże kruchość ludzkich obietnic opartych wyłącznie na własnych siłach (por. Wj 32).

3. Konsekracja, granice świętości i teofania na Górze Synaj (Wj 19:9–25)
Przygotowanie na zstąpienie PANA trwa trzy dni (Wj 19:10–15) i obejmuje zewnętrzne znaki wewnętrznego oczyszczenia: uświęcenie (hebr. *kiddusz*), wypranie szat oraz czasową powściągliwość małżeńską, aby cała uwaga wspólnoty skupiła się na spotkaniu z Bogiem. Równocześnie wokół góry zostaje wyznaczona wyraźna granica (hebr. *gewul*) pod karą śmierci (Wj 19:12–13).
Trzeciego dnia o poranku następuje potężna teofania: grzmoty, błyskawice, gęsty obłok (*anan kawed*), ogień, dym unoszący się jak z pieca, trzęsienie ziemi i narastający głos trąby (*szofar*). Fizyczne bariery oraz dwukrotne ostrzeżenie dla kapłanów i ludu (Wj 19:21–24) objawiają radykalną przepaść między absolutną świętością Boga a grzeszną naturą człowieka — przepaść, której sam człowiek nie potrafi przekroczyć bez wyznaczonego przez Boga pośrednika.

4. Perspektywa Chrystocentryczna: od Góry Synaj do Góry Syjon
Nowy Testament odczytuje Wj 19 jako fundament chrystologii i eklezjologii. List do Hebrajczyków (Hbr 12:18–24) przeciwstawia grozę nieprzekraczalnego Synaju przystępowi wierzących do niebiańskiej Góry Syjon przez Jezusa — Pośrednika Nowego Przymierza, którego przelana krew mówi lepsze rzeczy niż krew Abla. Chrystus jako Arcykapłan wziął na Siebie święty sąd Prawa i oczyścił sobie lud na własność (Tt 2:14). Dzięki Jego ofierze apostoł Piotr (1 P 2:9) oraz Jan w Apokalipsie (Ap 1:6; 5:10) przenoszą tytuły z Wj 19:5–6 na cały Kościół złożony z Żydów i pogan: „rodem wybranym, królewskim kapłaństwem, narodem świętym, ludem nabytym”.

📌 PODSUMOWANIE REDAKCYJNE CCN:
Dziewiętnasty rozdział Księgi Wyjścia łączy dwa bieguny biblijnej wiary: bezwarunkową łaskę Boga niosącego swój lud na orlich skrzydłach oraz majestatyczną świętość wymagającą czci, przygotowania i posłuszeństwa. Wypełnione w Chrystusie powołanie do królewskiego kapłaństwa wzywa dziś każdego wierzącego do życia godnego miana szczególnej własności Stwórcy.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

// Walidacja Wersji 1 pod kątem ZERO cyfr arabskich i rzymskich
const v1Block = pakiet5wersji
  .split('WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)\n====================================================================\n\n')[1]
  .split('\n\n====================================================================\nWERSJA 2: WERSJA WWW')[0]
  .trim();
if (/[0-9]/.test(v1Block)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI ZGODNIE Z WYTYCZNYMI GPT) ──
const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 49
${TITLE}
${SUBTITLE}
${DATE_FORMATTED}  |  Czytanie: ${READING}
TEKST PAMIĘCIOWY: ${MEMORY_VERSE}
MYŚL PRZEWODNIA: ${THEME}

ZANIM OTWORZYSZ BIBLIĘ
Po pięćdziesięciu dniach wędrówki od pamiętnej nocy paschalnej w Egipcie lud Izraela osiąga jeden z najważniejszych celów wyjścia: w trzecim miesiącu staje na pustyni Synaj, naprzeciw góry Boga (Horeb). W poprzednim rozdziale Mojżesz nauczył się pokory słuchania mądrych rad i podziału służby dzięki Jetrze. Teraz jednak cały naród staje przed wydarzeniem znacznie głębszym niż reorganizacja sądów — przed bezpośrednim spotkaniem ze Stwórcą wszechświata i zawarciem Przymierza, które ukształtuje tożsamość ludu Bożego na wszystkie przyszłe pokolenia.

Współczesny czytelnik często przystępuje do rozdziałów poprzedzających Dekalog z napięciem: z jednej strony pragnie bliskości i ojcowskiego ciepła Boga, z drugiej zaś czuje lęk przed starotestamentowym obrazem ognia, dymu, grzmotów i zakazu zbliżania się do góry pod groźbą śmierci. Czy Bóg Starego Testamentu jest surowym i niedostępnym sędzią, czy też właśnie w dziewiętnastym rozdziale Księgi Wyjścia odkrywa swoje najczulsze oblicze? Zauważmy porządek słów Pisma: zanim padnie nakaz obmywania szat i granice wokół góry, Bóg wyznaje z góry Synaj, że to On sam niósł Izraela na skrzydłach orłów i przyprowadził go do Siebie.

Jak pogodzić bezwarunkową łaskę wyzwolenia z bezkompromisowym wezwaniem do uświęcenia? Co dokładnie oznaczają trzy niezwykłe tytuły nadane ludowi Bożemu: „szczególna własność”, „królestwo kapłanów” i „naród święty”? Dlaczego wyznaczono granice wokół Synaju, które nawet kapłani nie mogli przekroczyć bez Bożego wezwania? I w jaki sposób ten majestatyczny obraz drżącej góry przygotowuje nasze serca na przyjęcie Jezusa Chrystusa — Doskonałego Pośrednika Nowego Przymierza, o którym uczy Nowy Testament?

TEKST PISMA ŚWIĘTEGO: KSIĘGA WYJŚCIA 19:1–25 (UBG)
${readingDocxLines}

ANALIZA EGZEGETYCZNA (45 ZAGADNIEŃ EGZEGETYCZNYCH)

CZĘŚĆ I: PRZYBYCIE NA SYNAJ, ŁASKA ORLICH SKRZYDEŁ I POWOŁANIE LUDU (WJ 19:1–6)
1. Chronologia przybycia — trzeci miesiąc (Wj 19:1): Wyrażenie „w trzecim miesiącu od wyjścia... w tym samym dniu” oznacza początek trzeciego miesiąca kalendarzowego (najprawdopodobniej nowiu miesiąca Siwan). Według tradycyjnego obliczenia żydowskiego od Paschy (14 Nisan) upłynęło około pięćdziesięciu dni — stąd późniejszy związek nadania Prawa ze Świętem Tygodni (Pięćdziesiątnicą).
2. Wędrówka z Refidim pod Synaj (Wj 19:2): Po ugaszeniu pragnienia wodą ze skały i odparciu Amaleka (Wj 17) oraz po wprowadzeniu ładu sądowniczego (Wj 18) Izrael dociera na rozległą równinę pustynną u podnóża granitowego masywu Synaj (w tradycji utożsamianego najczęściej z rejonem Dżebel Musa / równiną Er-Raha, choć dokładna lokalizacja pozostaje przedmiotem dyskusji geograficznych).
3. Jedność obozu „naprzeciw góry” (Wj 19:2): Hebrajski czasownik określający rozbicie obozu (*wajichan Jisrael*) stoi tu w liczbie pojedynczej („i rozbił obóz Izrael”), co starożytni komentatorzy odczytywali jako znak jedności wspólnoty — lud stanął pod górą jak jeden mąż, o jednym sercu.
4. Pośrednictwo Mojżesza i inicjatywa Boga (Wj 19:3): Mojżesz wstępuje ku Bogu, ale to PAN pierwszy woła do niego z góry. Bóg nigdy nie jest biernym obiektem ludzkich poszukiwań — to On inicjuje Przymierze i przemawia do swojego ludu.
5. Dwukrotne imię wspólnoty — „dom Jakuba” i „synowie Izraela” (Wj 19:3): Poetycki paralelizm przypomina zarówno naturalne, słabe pochodzenie od patriarchy Jakuba, jak i godność nowego imienia przymierza („Izrael”). Przymierze obejmuje cały naród bez względu na status społeczny.
6. Najpierw fakty łaski — „Widzieliście, co uczyniłem” (Wj 19:4): Zanim Bóg ogłosi jakiekolwiek wymagania, odwołuje się do naocznych faktów historycznych: sądu nad uciskiem egipskim i wyzwolenia, których Izrael doświadczył w pełni z łaski, zanim zdołał zachować choćby jedno przykazanie Dekalogu.
7. Metafora orlich skrzydeł (Wj 19:4): „Niosłem was na skrzydłach orłów”. W starożytnym Bliskim Wschodzie (por. Pwt 32:11) orzeł symbolizuje niezrównaną siłę, szybkość, wysokość lotu ponad niebezpieczeństwem i ojcowską opiekę nad pisklętami, które uczy latać, podkładając pod nie własne skrzydła.
8. Cel odkupienia — „przyprowadziłem was do siebie” (Wj 19:4): Wyjście z Egiptu nie miało na celu jedynie wolności politycznej ani zmiany miejsca zamieszkania. Ostatecznym celem Bożego zbawienia jest relacja: przyprowadzenie człowieka do samego Boga!
9. Warunek trwania w błogosławieństwie przymierza (Wj 19:5): Słowa „jeśli posłuchacie mego głosu i będziecie przestrzegać mojego przymierza” nie oznaczają zarabiania na miłość Boga, lecz wierne odpowiadanie na już otrzymaną łaskę (posłuszeństwo wiary).
10. Szczególna własność — hebr. *segullah* (Wj 19:5): Termin ten oznaczał w świecie starożytnym osobisty, najbardziej cenny skarb króla, odróżniony od powszechnego skarbu państwa. Izrael ma być szczególną radością i klejnotem Stwórcy.
11. Uniwersalna suwerenność Boga — „do mnie należy cała ziemia” (Wj 19:5): Wybranie Izraela nie wynika z tego, że Bóg jest bóstwem plemiennym ograniczonym do jednego terytorium. Ponieważ cała ziemia należy do Niego, wybór jednego narodu ma służyć zbawiennemu planowi dla całego świata.
12. Królestwo kapłanów — hebr. *mamlechet kohanim* (Wj 19:6): Cały naród, a nie tylko jedna kasta, otrzymuje powołanie kapłańskie: ma reprezentować świętego Boga wobec pogan oraz wstawiać się za światem przed Bogiem. Choć później służbę ołtarza powierzono pokoleniu Lewiego (Wj 28–29), pierwotny ideał powszechnego kapłaństwa wszystkich wierzących zostaje w pełni odnowiony w Chrystusie (1 P 2:9).
13. Naród święty — hebr. *goj kadosz* (Wj 19:6): Świętość oznacza tu oddzielenie od grzechu, bałwochwalstwa i niesprawiedliwości ku wyłącznej przynależności Bogu, na wzór Jego własnej czystości moralnej.

CZĘŚĆ II: ZGODA LUDU I OBIETNICA OBJAWIENIA W OBŁOKU (WJ 19:7–9)
14. Wierność posłańca — zwołanie starszych (Wj 19:7): Mojżesz nie przekazuje prywatnych opinii ani nie zatrzymuje Bożego orędzia dla siebie. Zwołuje starszych ludu i wykłada im „wszystkie te słowa”, nie ujmując ani nie dodając niczego od siebie.
15. Jednomyślna odpowiedź zgromadzenia (Wj 19:8): „Cały lud odpowiedział wspólnie: Uczynimy wszystko, co PAN powiedział”. W tym momencie entuzjazm wspólnoty jest szczery i jednogłośny, choć dalsza narracja (zwłaszcza Wj 32) ujawni, jak bardzo człowiek potrzebuje nie tylko dobrej chęci, ale i nowego serca od Boga (por. Pwt 5:29; Jr 31:33).
16. Pośrednicza służba Mojżesza w dwie strony (Wj 19:8–9): Mojżesz przekazuje Boże słowa ludowi, a następnie zanosi odpowiedź ludu do PANA. Choć wszechwiedzący Bóg słyszał deklarację Izraela, ustanawia porządek pośrednictwa i odpowiedzialności przedstawiciela.
17. Zstąpienie w gęstym obłoku (Wj 19:9): Bóg zapowiada: „Oto przyjdę do ciebie w gęstym obłoku”. Obłok (hebr. *aw he-anan*) jednocześnie objawia Bożą obecność i osłania śmiertelnego człowieka przed oślepiającym blaskiem majestatu, którego nikt nie może oglądać bezkarnie i pozostać przy życiu (por. Wj 33:20).
18. Uwierzytelnienie sługi Bożego przed ludem (Wj 19:9): Słuchanie bezpośredniej rozmowy Boga z Mojżeszem ma na celu ugruntowanie wiary wspólnoty w Boże posłannictwo („aby lud słyszał... i uwierzył ci na zawsze”). Wiara biblijna opiera się na świadectwie usłyszanego Słowa Bożego.

CZĘŚĆ III: TRZY DNI UŚWIĘCENIA, OBMYWANIE SZAT I GRANICE WOKÓŁ GÓRY (WJ 19:10–15)
19. Wezwanie do wewnętrznego i zewnętrznego uświęcenia (Wj 19:10): Nakaz „uświęć ich dziś i jutro” oznacza oddzielenie od zwykłych spraw powszednich i duchowe przygotowanie na audiencję u Króla królów.
20. Symbolika wypranych szat (Wj 19:10, 14): Pranie odzieży przed spotkaniem z Bogiem było widzialnym znakiem oczyszczenia z nieczystości i szacunku dla Bożej świętości. Wyraża prawdę, że człowiek nie wnosi w obecność Boga swego brudu bez przemiany i skruchy (por. Ap 7:14; 22:14).
21. Oczekiwanie na trzeci dzień (Wj 19:11): Bóg zstępuje na oczach całego ludu „trzeciego dnia”. Motyw trzeciego dnia w całej Biblii (por. Rdz 22:4; Oz 6:2; 1 Kor 15:4) staje się znakiem Bożej interwencji, objawienia chwały i nowego początku.
22. Wyznaczenie granic wokół góry (Wj 19:12): Wyrażenie „wyznaczysz ludowi granice dokoła” ustanawia świętą strefę buforową. Bóg uczy Izraela, że Jego obecność nie jest własnością człowieka do dowolnego zagospodarowania, lecz świętą rzeczywistością wzbudzającą cześć i dystans pokory.
23. Surowość kary za naruszenie granicy (Wj 19:12–13): Zakaz dotykania góry dotyczy zarówno ludzi, jak i zwierząt; naruszający ma zostać ukamienowany lub przeszyty strzałami z daleka, aby wykonawcy wyroku sami nie przekroczyli strefy świętej. Pokazuje to śmiertelną powagę Bożej świętości wobec skażonego grzechem stworzenia.
24. Zapowiedź sygnału trąby (Wj 19:13): „Gdy przeciągle będą trąbić, niech podejdą do góry” — dopiero na wyraźny znak Bożego rogu (*jowel* / trąba) lud może podejść do wyznaczonego podnóża, co podkreśla, że przystęp do Boga odbywa się wyłącznie na Jego warunkach i w Jego czasie.
25. Wierność wykonawcza Mojżesza (Wj 19:14): Mojżesz natychmiast zstępuje z góry i uświęca lud, a Izraelici posłusznie piorą swoje szaty. Między objawieniem a posłuszeństwem nie ma zwłoki.
26. Powściągliwość w sferze intymnej (Wj 19:15): Zakaz zbliżania się do żon na te trzy dni (por. 1 Kor 7:5) nie oznacza potępienia małżeństwa, które Bóg sam pobłogosławił w raju, lecz służył wyłączeniu rytualnej nieczystości (Kpł 15:16–18) i całkowitemu skupieniu umysłu oraz serca na słuchaniu głosu Boga.

CZĘŚĆ IV: TEOFANIA NA SYNAJU — GRZMOTY, OGIEŃ, DYM I GŁOS TRĄBY (WJ 19:16–19)
27. Poranek trzeciego dnia — kosmiczne znaki obecności Boga (Wj 19:16): O świcie górę ogarniają grzmoty, błyskawice, gęsty obłok oraz niezwykle potężny dźwięk trąby (*kol szofar chazak meod*). Całe stworzenie reaguje na przyjście swojego Stwórcy.
28. Święte drżenie obozu (Wj 19:16): „Cały lud, który był w obozie, zadrżał”. Nie jest to jeszcze panika niewolników, lecz głęboki wstrząs serca uświadamiającego sobie małość człowieka w obliczu majestatu Wszechmogącego.
29. Wyprowadzenie ludu „na spotkanie z Bogiem” (Wj 19:17): Hebrajskie *likrat ha-Elohim* brzmi jak opis wyjścia oblubienicy lub wasali na powitanie przybywającego Króla. Mimo trwogi Izrael nie ucieka, lecz prowadzony przez Mojżesza staje u stóp góry.
30. Ogień, dym jak z pieca i trzęsienie góry (Wj 19:18): „PAN zstąpił na nią w ogniu”. Ogień w Biblii symbolizuje absolutną czystość, chwałę i trawiący sąd Boga nad złem (por. Pwt 4:24; Hbr 12:29). Nawet skalny masyw Synaju trzęsie się u podstaw.
31. Narastający głos trąby (Wj 19:19): Dźwięk trąby nie słabnie, lecz „się przeciągał i coraz bardziej się rozlegał” — zapowiadając moment, w którym sam Bóg przemówi słowami Dekalogu.
32. Dialog Mojżesza z Bogiem w głosie grzmotu (Wj 19:19): „Mojżesz mówił, a Bóg odpowiadał mu głosem”. Wśród kosmicznego żywiołu nie ma chaosu — Bóg prowadzi czytelny, osobowy dialog ze swoim sługą na oczach i uszach całego zgromadzenia.

CZĘŚĆ V: OSTRZEŻENIE PRZED ZUCHWAŁĄ CIEKAWOŚCIĄ I KLUCZE JĘZYKOWE (WJ 19:20–25)
33. Zstąpienie na szczyt i wezwanie Mojżesza (Wj 19:20): PAN zstępuje na wierzchołek góry Synaj i wzywa Mojżesza na szczyt, ukazując zarówno bliskość względem wybranego pośrednika, jak i bezwzględny autorytet nad pozostałymi.
34. Ostrzeżenie przed przekraczaniem granicy z ciekawości (Wj 19:21): „Zejdź, przestrzeż lud, by nie przekroczył granicy, aby zobaczyć PANA, i aby wielu z nich nie zginęło”. Ludzka ciekawość pragnąca „zobaczyć” Boga bez czci i bez pośrednika prowadzi do zguby.
35. Nawet kapłani podlegają uświęceniu (Wj 19:22): „Nawet kapłani, którzy zbliżają się do PANA, niech się uświęcą”. Przed ustanowieniem kapłaństwa Aarona funkcję tę sprawowali prawdopodobnie pierworodni lub starsi rodów; tekst przypomina, że żadna funkcja religijna nie zwalnia z osobistej świętości i bojaźni Bożej.
36. Zaskakująca rozmowa o granicach (Wj 19:23–24): Gdy Mojżesz zapewnia, że granice zostały już wyznaczone, Bóg nalega ponownie i każe mu zejść, a potem wstąpić z Aaronem. Boża troska ostrzegawcza ma uchronić niecierpliwy tłum przed tragicznym zuchwalstwem.
37. Towarzystwo Aarona — przygotowanie służby (Wj 19:24): Polecenie, by później wstąpił Mojżesz wraz z Aaronem, zapowiada szczególną rolę Aarona u boku prawodawcy, przy wyraźnym zachowaniu dystansu reszty ludu i kapłanów.
38. Posłuszeństwo w trudnym zadaniu (Wj 19:25): Mojżesz schodzi ze szczytu, aby przekazać ludowi ostateczne przestrogi bezpośrednio przed ogłoszeniem Dziesięciu Przykazań w Wj 20.
39. Harmonia majestatu i łaski w całej perykopie: Wj 19 uczy, że Bóg Przymierza jest jednocześnie Orłem niosącym słabych na skrzydłach oraz Ogniem trawiącym wszelką nieprawość.
40. Oczekiwanie na Słowo Dekalogu: Cały rozdział 19 jest liturgiczną i duchową uwerturą do rozdziału 20 — przygotowuje uszy i sumienia na przyjęcie Prawa Bożego.

KLUCZE JĘZYKOWE I KULTUROWE
41. *Segullah* (סְגֻלָּה — H5459): szczególna własność, osobisty skarb króla pieczołowicie przechowywany w skarbcu. Wskazuje na niepowtarzalną wartość ludu Bożego wynikającą z wyboru łaski (por. Tt 2:14; 1 P 2:9).
42. *Mamlechet kohanim* (מַמְלֶכֶת כֹּהֲנִים — H4467 + H3548): królestwo kapłanów — naród, którego królem jest sam Bóg, a każdy członek ma uczestniczyć w świadectwie i modlitwie za świat.
43. *Goj kadosz* (גּוֹי קָדוֹשׁ — H1471 + H6918): naród święty — wspólnota wyłączona z pogańskiego stylu życia, ukształtowana według Bożych standardów prawdy i miłości.
44. *Kadasz / Kiddusz* (קָדַשׁ — H6942): uświęcić, oddzielić, przygotować do służby i obecności Boga. Świętość w Biblii to przede wszystkim przynależność do Świętego i odbijanie Jego charakteru.
45. *Szofar / Jowel* (שׁוֹפָר / יוֹבֵל — H7782 / H3104): róg barani, trąba zwiastująca teofanię, ogłoszenie Prawa, wolność jubileuszową oraz ostateczne przyjście Chrystusa (por. 1 Tes 4:16).

JEZUS W CENTRUM — ODPOWIEDŹ NOWEGO TESTAMENTU
1. Od Góry Synaj do Góry Syjon — kontrast dwóch przymierzy (Hbr 12:18–24): Autor Listu do Hebrajczyków wprost zestawia grozę Wj 19 („góry, która da się dotknąć i płonącej ogniem, mroku, ciemności, burzy i dźwięku trąby”, wobec której drżał nawet Mojżesz) z radością Nowego Przymierza: „Lecz podeszliście do góry Syjon i do miasta Boga żywego... i do pośrednika nowego przymierza, Jezusa, do krwi, którą się kropi”. Synaj ukazał potrzebę Pośrednika; Jezus tę potrzebę wypełnił doskonale.
2. Królewskie kapłaństwo i naród święty w Kościele (1 P 2:9–10): Apostoł Piotr dosłownie przenosi tytuły z Wj 19:5–6 na wierzących w Chrystusa: „Lecz wy jesteście rodem wybranym, królewskim kapłaństwem, narodem świętym, ludem nabytym, abyście rozgłaszali cnoty tego, który was powołał z ciemności do swej cudownej światłości”.
3. Wykupienie sobie ludu na własność (Tt 2:14): Paweł opisuje dzieło Chrystusa słowami nawiązującymi do hebrajskiego *segullah*: Zbawiciel „wydał samego siebie za nas, aby nas wykupić od wszelkiej nieprawości i oczyścić sobie lud na własność, gorliwy w spełnianiu dobrych uczynków”.
4. Pieśń Odkupionych w Apokalipsie (Ap 1:6; 5:9–10): Przez swoją krew Baranek uczynił ludzi z każdego plemienia, języka, ludu i narodu „królami i kapłanami” dla Boga — wypełniając obietnicę daną pod Synajem dla całej ludzkości.
5. Obmycie szat we krwi Baranka (Ap 7:14; 1 Kor 6:11): Zewnętrzne pranie szat na pustyni Synaj (Wj 19:10, 14) było zapowiedzią duchowego oczyszczenia sumienia i życia w Chrystusie: „zostaliście obmyci, lecz zostaliście uświęceni, lecz zostaliście usprawiedliwieni w imię Pana Jezusa”.
6. Jedyny Pośrednik otwierający przystęp do Ojca (J 14:6; 1 Tm 2:5; Hbr 10:19–22): Podczas gdy pod Synajem strzeżona granica broniła wstępu przed oblicze PANA, Jezus przez swoje ciało i krew otworzył wierzącym nową i żywą drogę do Miejsca Najświętszego, wzywając ludzi czystego serca, by przybliżali się z ufnością.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Pwt 32:10–12 — Jak Mojżesz w swojej pieśni rozwija obraz orła czuwającego nad pisklętami i niosącego Izraela na swoich skrzydłach?
• Hbr 12:18–29 — Jakie podobieństwa i jakie różnice dostrzegasz między przyjściem pod Górę Synaj a przystąpieniem wierzącego do Góry Syjon w Chrystusie?
• 1 P 2:4–10 — Jak apostoł Piotr wykorzystuje słowa z Wj 19:5–6, opisując tożsamość i misję Kościoła?
• Tt 2:11–14 — W jaki sposób łaska Zbawiciela wychowuje nas do świętego życia jako „ludu na własność”?
• Ap 5:9–10 — Kto i jaką ceną uczynił wierzących z wszystkich narodów królami i kapłanami dla Boga?
• Pwt 4:10–14 — Jak Mojżesz wspomina dzień zgromadzenia pod Chorebem i co było treścią przymierza słyszanego z ognia?
• Pwt 5:22–29 — Dlaczego lud po usłyszeniu głosu Bożego z ognia poprosił Mojżesza o pośrednictwo i jak Bóg ocenił tę bojaźń?
• Iz 6:1–7 — Jak prorok Izajasz zareagował na widok Bożej świętości i w jaki sposób Bóg oczyścił jego wargi do służby?
• Ps 24:3–5 — Kto według Psalmu może wstąpić na górę PANA i stanąć w Jego świętym miejscu?
• Mt 5:8 — Dlaczego Pan Jezus łączy czystość serca z obietnicą oglądania Boga?
• 1 Kor 6:19–20 — Co oznacza prawda, że zostaliśmy drogo kupieni i nasze ciało jest świątynią Ducha Świętego?
• 1 Tes 4:16–17 — Z jakim wydarzeniem końcowym Nowy Testament wiąże potężny głos trąby Bożej?

PRAWDA NA DZIŚ — TEOLOGIA PRAKTYCZNA
1. Łaska zawsze poprzedza wymagania: Bóg najpierw wykupił Cię z niewoli i przygarnął do Siebie, a dopiero potem daje przykazania jako drogę wolności, a nie sposób na kupienie zbawienia.
2. Jesteś szczególnym skarbem w oczach Stwórcy: Twoja wartość nie płynie z opinii ludzi ani z sukcesów zawodowych, lecz z tego, że Chrystus nabył Cię dla Boga jako swoją szczególną własność.
3. Każdy uczeń Jezusa jest powołany do kapłaństwa: Nie musisz stać na kazalnicy, by być w królewskim kapłaństwie — masz nieść światło Ewangelii, modlić się za bliźnich i reprezentować Boga w swoim codziennym miejscu pracy.
4. Bliskość z Bogiem nie znosi czci i powagi: Modlitwa i nabożeństwo nie są zwykłą rozmową przy okazji; warto zadbać o ciszę, skupienie i duchowe przygotowanie przed otwarciem Pisma.
5. Świętość jest odpowiedzią miłości, nie lęku: Pranie szat i oczyszczanie życia z kompromisów wynikają z pragnienia, by godnie stanąć przed Tym, który pierwszy nas umiłował.
6. Szanuj granice wyznaczone przez Boga: Boże granice w Piśmie Świętym nie mają Cię ograniczać, lecz chronić przed duchowym spaleniem i niszczącymi konsekwencjami pychy.
7. Same entuzjastyczne deklaracje nie wystarczą: Słowa „uczynimy wszystko” są łatwe w chwili wzruszenia, lecz do wierności potrzebujesz codziennego prowadzenia Ducha Świętego i pokory serca.
8. Chrystus jest Twoją otwartą drogą do Ojca: Nie musisz drżeć jak pod dymiącą górą bez pośrednika — w Jezusie możesz z czystym sumieniem przybliżyć się do tronu łaski.

POMYŚL — PYTANIA DO SERCA
1. Czy w swoim myśleniu o wierze częściej zaczynasz od listy obowiązków („muszę zrobić”), czy od wdzięczności za to, że Bóg już wziął Cię na skrzydła łaski?
2. W jakich sytuacjach codzienności zapominasz, że należysz do „królestwa kapłanów” i masz reprezentować charakter Chrystusa wobec ludzi wokół Ciebie?
3. Jak przygotowujesz swoje serce i otoczenie przed poranną modlitwą i czytaniem Biblii — czy dajesz Bogu skupienie, czy tylko resztki uwagi między powiadomieniami?
4. Jakie „szaty” nawyków, myśli lub słów wymagają dziś w Twoim życiu uczciwego wyprania i oddania pod oczyszczającą krew Jezusa?
5. Czy pamiętasz chwilę, gdy gorliwie obiecywałeś Bogu „uczynię wszystko”, a potem zabrakło Ci wytrwałości? Czego nauczyło Cię to o potrzebie łaski?
6. Czy w Twoim życiu duchowym zachowujesz równowagę między dziecięcą ufnością wobec Ojca a głęboką bojaźnią i szacunkiem wobec Jego świętości?
7. Które z Bożych granic w Twoim życiu sprawiają Ci dziś największą trudność i czy widzisz w nich ochronną miłość Ojca?
8. W jaki konkretny sposób możesz dziś wstawić się w modlitwie za kimś ze swojej rodziny lub znajomych, pełniąc służbę królewskiego kapłaństwa?

MAŁY QUIZ — SPRAWDŹ SWOJĄ WIEDZĘ (20 PYTAŃ Z WJ 19:1–25)

Pytanie 1: W którym miesiącu od wyjścia z ziemi Egiptu synowie Izraela przybyli na pustynię Synaj (Wj 19:1)?
A. W pierwszym miesiącu zaraz po przejściu przez Morze Czerwone
B. W trzecim miesiącu od wyjścia z ziemi Egiptu
C. W siódmym miesiącu w porze jesiennych zbiorów
D. W dwunastym miesiącu po bitwie z Amalekiem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:1 podaje wprost: „W trzecim miesiącu od wyjścia synów Izraela z ziemi Egiptu, w tym samym dniu, przyszli na pustynię Synaj”.

Pytanie 2: Skąd dokładnie wyruszył Izrael bezpośrednio przed przybyciem na pustynię Synaj (Wj 19:2)?
A. Z oazy Elim
B. Z pustyni Paran
C. Z Refidim
D. Z miasta Ramses
Poprawna odpowiedź: C. Wyjaśnienie: Wj 19:2 mówi: „Bo wyruszyli z Refidim i po przybyciu na pustynię Synaj rozbili obóz na pustyni”.

Pytanie 3: Gdzie dokładnie rozbił obóz Izrael na pustyni Synaj (Wj 19:2)?
A. W głębokiej jaskini nad rzeką
B. Na pustyni, naprzeciw góry
C. Na samym szczycie góry Synaj
D. Na wybrzeżu Zatoki Akaba
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:2: „tam Izrael obozował naprzeciw góry”.

Pytanie 4: Co uczynił Mojżesz po rozbiciu obozu pod górą (Wj 19:3)?
A. Wstąpił do Boga, a PAN zawołał do niego z góry
B. Zbudował ołtarz ze złota
C. Wrócił do Midianu po Jetrę
D. Rozpoczął walkę z Amalekiem
Poprawna odpowiedź: A. Wyjaśnienie: Wj 19:3: „A Mojżesz wstąpił do Boga i PAN zawołał do niego z góry”.

Pytanie 5: Jakiego obrazu użył Bóg w Wj 19:4, opisując wyprowadzenie i opiekę nad Izraelem?
A. Stada owiec prowadzonego przez lwa
B. Niesienia na skrzydłach orłów i przyprowadzenia do Siebie
C. Okrętu płynącego przez spokojne morze
D. Twierdzy zbudowanej z cedrów Libanu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:4: „Widzieliście, co uczyniłem Egipcjanom i jak niosłem was na skrzydłach orłów, i przyprowadziłem was do siebie”.

Pytanie 6: Jakim tytułem Bóg obiecał nazwać Izraela ponad wszystkie narody, jeśli posłucha Jego głosu (Wj 19:5)?
A. Najpotężniejszym imperium militarnym wschodu
B. Swoją szczególną własnością
C. Jedynymi mieszkańcami pustyni
D. Panami wszystkich królestw Egiptu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:5: „będziecie moją szczególną własnością ponad wszystkie narody, bo do mnie należy cała ziemia”.

Pytanie 7: Jakim uzasadnieniem Bóg poparł obietnicę uczynienia Izraela szczególną własnością w Wj 19:5?
A. Ponieważ Izrael był najliczniejszym narodem świata
B. Ponieważ do PANA należy cała ziemia
C. Ponieważ Egipcjanie podpisali traktat pokojowy
D. Ponieważ Mojżesz był z rodu królewskiego
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:5: „bo do mnie należy cała ziemia”.

Pytanie 8: Jakie dwa kolejne określenia powołania Izraela padają w Wj 19:6?
A. Wojownicy północy i budowniczowie świątyń
B. Królestwo kapłanów i naród święty
C. Mędrcy wschodu i pasterze pustyni
D. Sędziowie narodów i kupcy morscy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:6: „A wy będziecie mi królestwem kapłanów i narodem świętym”.

Pytanie 9: Kogo zwołał Mojżesz po zejściu z góry, aby wyłożyć słowa PANA (Wj 19:7)?
A. Wyłącznie Aarona i Miriam
B. Starszych ludu
C. Zwiadowców z pokolenia Judy
D. Cudzoziemców mieszkających w obozie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:7: „Mojżesz przyszedł i zwołał starszych ludu, i wyłożył im wszystkie te słowa, które mu PAN nakazał”.

Pytanie 10: Jak cały lud odpowiedział na słowa przymierza przedstawione przez Mojżesza (Wj 19:8)?
A. „Najpierw musimy zobaczyć cuda w obozie”
B. „Uczynimy wszystko, co PAN powiedział”
C. „Potrzebujemy miesiąca na naradę”
D. „To zbyt trudne wymagania dla naszego pokolenia”
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:8: „Cały lud odpowiedział wspólnie: Uczynimy wszystko, co PAN powiedział”.

Pytanie 11: W czym PAN zapowiedział swoje przyjście do Mojżesza, aby lud słyszał rozmowę i uwierzył mu na zawsze (Wj 19:9)?
A. W cichym powiewie wiatru
B. W gęstym obłoku
C. W krzewie cierniowym w obozie
D. W tęczy na bezchmurnym niebie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:9: „Oto przyjdę do ciebie w gęstym obłoku, aby lud słyszał, gdy będę z tobą rozmawiał, i uwierzył ci na zawsze”.

Pytanie 12: Co konkretnego mieli uczynić ludzie w ramach przygotowania i uświęcenia przed spotkaniem z Bogiem (Wj 19:10)?
A. Zbudować siedem ołtarzy z ciosanych kamieni
B. Wyprać swoje szaty
C. Posmarować czoła oliwą
D. Złożyć dziesięcinę ze wszystkich trzód
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:10: „Idź do ludu i uświęć ich dziś i jutro, i niech wypiorą swoje szaty”.

Pytanie 13: Którego dnia PAN miał zstąpić na oczach całego ludu na górę Synaj (Wj 19:11)?
A. Siódmego dnia po nowiu
B. Trzeciego dnia
C. Czterdziestego dnia
D. Nazajutrz rano
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:11: „Niech będą gotowi na trzeci dzień. Trzeciego dnia bowiem PAN zstąpi na oczach całego ludu na górę Synaj”.

Pytanie 14: Co groziło każdemu człowiekowi lub zwierzęciu, które dotknęłoby podnóża góry poza wyznaczoną granicą (Wj 19:12–13)?
A. Wygnanie z obozu na siedem dni
B. Śmierć przez ukamienowanie lub przeszycie strzałami, bez dotykania go ręką
C. Konfiskata dobytku
D. Siedmiodniowy post o chlebie i wodzie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:12–13: „Każdy, kto dotknie góry, poniesie śmierć. Nie dotknie go ręka, ale ukamienują go albo przeszyją strzałami; czy to zwierzę, czy człowiek, nie będzie żyć”.

Pytanie 15: Jaki sygnał miał oznaczać, że wyznaczeni lub lud mogą podejść w kierunku góry (Wj 19:13)?
A. Podniesienie laski Aarona o zachodzie słońca
B. Gdy przeciągle będą trąbić
C. Zapalenie trzech ognisk na równinie
D. Wschód pierwszej gwiazdy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:13: „Gdy przeciągle będą trąbić, niech podejdą do góry”.

Pytanie 16: Jakie zjawiska pojawiły się o poranku trzeciego dnia na górze Synaj (Wj 19:16)?
A. Deszcz manny i spokojna rosa
B. Grzmoty i błyskawice, gęsty obłok nad górą i bardzo potężny głos trąby
C. Zaćmienie księżyca i cisza w obozie
D. Rozkwitnięcie pustyni wokół namiotów
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:16 wymienia grzmoty, błyskawice, gęsty obłok i bardzo potężny głos trąby, od którego cały lud zadrżał.

Pytanie 17: Dlaczego góra Synaj cała dymiła, a dym unosił się jak z pieca (Wj 19:18)?
A. Ponieważ lud zapalił ofiary całopalne na jej szczycie
B. Ponieważ PAN zstąpił na nią w ogniu i cała góra bardzo się trzęsła
C. Ponieważ wiatr przywiał burzę piaskową z Egiptu
D. Ponieważ Amalekici podpalili obóz
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:18: „A góra Synaj cała dymiła, gdyż PAN zstąpił na nią w ogniu. Dym unosił się z niej jak dym z pieca i cała góra bardzo się trzęsła”.

Pytanie 18: Co działo się, gdy głos trąby się przeciągał i coraz bardziej rozlegał (Wj 19:19)?
A. Lud rzucił się do ucieczki w stronę Morza Czerwonego
B. Mojżesz mówił, a Bóg odpowiadał mu głosem
C. Aaron zaczął czytać zwoje Rodzaju
D. Głos zamilkł na siedem godzin
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:19: „Mojżesz mówił, a Bóg odpowiadał mu głosem”.

Pytanie 19: Przed czym PAN kazał Mojżeszowi ponownie przestrzec lud ze szczytu góry w Wj 19:21–22?
A. Przed głodem w czasie przemówienia
B. Aby lud nie przekraczał granicy, żeby zobaczyć PANA, oraz aby nawet kapłani zbliżający się do PANA uświęcili się, by ich nie wytracił
C. Przed atakiem Midianitów
D. Przed opuszczeniem namiotów bez obuwia
Poprawna odpowiedź: B. Wyjaśnienie: Wj 19:21–22 podkreśla zakaz przekraczania granicy z ciekawości oraz nakaz uświęcenia nawet dla kapłanów.

Pytanie 20: Kto oprócz Mojżesza miał według polecenia z Wj 19:24 wstąpić później na górę, podczas gdy kapłani i lud mieli pozostać za granicą?
A. Jetro
B. Jozue
C. Aaron
D. Chur
Poprawna odpowiedź: C. Wyjaśnienie: Wj 19:24: „PAN powiedział do niego: Idź, zejdź, a potem wstąpisz ty i Aaron z tobą”.

TWOJA DECYZJA
Dziewiętnasty rozdział Księgi Wyjścia rozbija dwa najczęstsze fałszywe obrazy Boga, z jakimi zmaga się ludzkie serce. Pierwszy z nich traktuje Boga jak surowego nadzorcę, którego przychylność trzeba wypracować przed wejściem do Jego domu. Drugi traktuje Go powierzchownie — jak kogoś, przed kim można stanąć w bylejakości, bez szacunku, bez przygotowania i bez gotowości na oczyszczenie życia z grzechu.

Tymczasem Słowo z góry Synaj pokazuje Ci Boga, który najpierw niesie na skrzydłach orłów i przyprowadza do Siebie, a następnie zaprasza do świętej przynależności jako swoją szczególną własność i królewskie kapłaństwo. Dzięki Jezusowi Chrystusowi nie stoisz już przed groźną barierą śmierci pod płonącą górą — Jego przelana krew otworzyła Ci drogę do niebiańskiej Góry Syjon, a Jego Duch Święty uzdalnia Cię do życia czystego, odważnego i wiernego Przymierzu.

Zdecyduj dziś, że nie będziesz już żyć ani w lęku niewolnika, ani w lekceważeniu tego, co święte. Przyjmij swoją królewsko-kapłańską tożsamość w Chrystusie i oczyść przestrzeń swojego serca na spotkanie z Bogiem żywym!

MOJA DECYZJA:
Przyjmuję z wdzięcznością prawdę, że Bóg najpierw wziął mnie na skrzydła swojej łaski i przyprowadził do Siebie przez Jezusa Chrystusa. Świadomie odrzucam zarówno paraliżujący lęk zasługiwania na zbawienie, jak i duchową bylejakość wobec Bożej świętości. Postanawiam dziś zadbać o czystość mojego serca, szanować Boże granice w codziennym życiu i pełnić służbę królewskiego kapłaństwa w moim domu, pracy i wspólnocie.

MODLITWA NA 18 LISTOPADA 2026 R.
Wszechmogący, Święty Boże, Królu całej ziemi i Ojcze naszego Pana Jezusa Chrystusa! Staję przed Tobą w ten środowy dzień z głęboką wdzięcznością za to, co ukazałeś w dziewiętnastym rozdziale Księgi Wyjścia. Dziękuję Ci, że nie jestem dla Ciebie przypadkowym przechodniem, lecz że niosłeś mnie na skrzydłach orłów swojej łaski i przyprowadziłeś mnie do Siebie, abym był Twoją szczególną własnością.

Wyznaję przed Tobą moje grzechy i chwile duchowego rozproszenia, w których zbliżałem się do Twojego Słowa i modlitwy w pośpiechu, z bylejakością lub z ukrytymi kompromisami w sercu. Przepraszam Cię także za każdy raz, gdy zapominałem o Twojej miłości i próbowałem własnym wysiłkiem zasłużyć na Twoje przyjęcie, zamiast zaufać dokonanemu dziełu zbawienia.

Panie Jezu Chryste, Doskonały Pośredniku Nowego Przymierza! Dziękuję Ci, że przez swoją krew na krzyżu obmyłeś moje duchowe szaty i zamieniłeś niedostępny strach Synaju na bezpieczny dostęp do Góry Syjon i tronu łaski. Oczyść dzisiaj moje serce, moje myśli i moje pragnienia, abym mógł oglądać Ciebie czystym sumieniem i słuchać Twojego głosu z radością oraz czcią.

Udziel mi siły Ducha Świętego, abym wiernie strzegł Twoich mądrych granic i nie przekraczał ich z pychy ani lekkomyślności. Uczyń mnie wiernym świadkiem Twojego królewskiego kapłaństwa i narodu świętego, który wśród codziennych spraw rozgłasza Twoje cnoty temu światu. Tobie niech będzie cześć, majestat i chwała na wieki. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj cały rozdział Wj 19:1–25 w przekładzie UBG oraz równoległy fragment Hbr 12:18–24.
2. Wypisz trzy konkretne sytuacje ze swojej przeszłości, w których wyraźnie widziałeś, jak Bóg niósł Cię „na skrzydłach orłów” i przeprowadzał przez trudności.
3. Przygotuj swoje „szaty serca”: zanim przystąpisz do głównej modlitwy lub nabożeństwa, odłóż telefon, zadbaj o 10 minut ciszy i wyznaj Bogu każdy niezałatwiony grzech lub zniecierpliwienie.
4. Przeczytaj na głos 1 P 2:9 i uświadom sobie swoje powołanie jako członka królewskiego kapłaństwa — zaplanuj dziś jedną rozmowę lub modlitwę wstawienniczą za osobę, która jeszcze nie zna Chrystusa.
5. Zidentyfikuj jedną „granicę Bożą” w swoim życiu (obszar etyki, prawdomówności, czystości lub ochrony czasu świętego), przed którą ostatnio się wahałeś, i podejmij jednoznaczną decyzję o jej poszanowaniu.
6. Naucz się na pamięć fragmentu wersetu przewodniego Wj 19:5–6 i powtórz go trzykrotnie w ciągu dnia.
7. Oznacz Dzień 49 jako ukończony w Akademii i podziel się lekcją z kimś, kto postrzega wiarę wyłącznie jako ciężki zbiór nakazów.

JUTRO — 19 LISTOPADA 2026 R.
DZIEŃ 50: DZIESIĘĆ PRZYKAZAŃ — PRAWO WOLNOŚCI PRZYMIERZA I OŁTARZ BOGA ŻYWEGO (WJ 20:1–26)
Jutro po trzydniowym przygotowaniu na pustyni Synaj usłyszymy sam głos Boga ogłaszający Dekalog. Zobaczymy, dlaczego Dziesięć Przykazań zaczyna się od słów o wyzwoleniu z domu niewoli, co każde przykazanie mówi o sercu Stwórcy oraz jak Chrystus wypełnił Prawo, wpisując je Duchem Świętym w serca swojego ludu!`;

// ── 4. GENEROWANIE DOKUMENTU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx)...');

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
                new TextRun({ text: 'BIBLIJNA AKADEMIA | Z BIBLIĄ ZA PAN BRAT', font: 'Calibri', size: 18, color: '718096', bold: true }),
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
                new TextRun({ text: `${BOOK} • DZIEŃ ${DAY_NUM} • ${DATE_STR}   |   Strona `, font: 'Calibri', size: 18, color: '718096' }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '718096' }),
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
            new TextRun({ text: '66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE', font: 'Calibri', size: 20, color: 'C4A35A', bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({ text: `${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}`, font: 'Calibri', size: 22, color: '2B6CB0', bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: TITLE, font: 'Calibri', size: 34, bold: true, color: '0F2942' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: SUBTITLE, font: 'Calibri', size: 22, italics: true, color: '4A5568' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: `${DATE_FORMATTED}   |   Czytanie: ${READING}`, font: 'Calibri', size: 22, bold: true, color: '1A202C' }),
          ],
        }),

        new Paragraph({
          spacing: { before: 100, after: 120 },
          children: [
            new TextRun({ text: 'TEKST PAMIĘCIOWY: ', font: 'Calibri', bold: true, color: 'C4A35A', size: 22 }),
            new TextRun({ text: MEMORY_VERSE, font: 'Calibri', italics: true, bold: true, size: 22, color: '0F2942' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: 'MYŚL PRZEWODNIA: ', font: 'Calibri', bold: true, color: '2B6CB0', size: 22 }),
            new TextRun({ text: THEME, font: 'Calibri', size: 22, color: '2D3748' }),
          ],
        }),

        ...lessonDocxText.split('\n\n').slice(1).flatMap(block => {
          const trimmed = block.trim();
          if (!trimmed) return [];

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
            const lines = trimmed.split('\n');
            const heading = lines[0];
            const rest = lines.slice(1);
            const paras = [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 120 },
                children: [
                  new TextRun({ text: heading, font: 'Calibri', bold: true, size: 26, color: '0F2942' }),
                ],
              })
            ];
            for (const line of rest) {
              if (line.trim()) {
                paras.push(new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: line.trim(), font: 'Calibri', size: 22, color: '2D3748' })],
                }));
              }
            }
            return paras;
          }

          if (trimmed.startsWith('MOJA DECYZJA:')) {
            return [
              new Paragraph({
                spacing: { before: 180, after: 180 },
                children: [
                  new TextRun({ text: trimmed, font: 'Calibri', bold: true, italics: true, size: 22, color: '0F2942' }),
                ],
              }),
            ];
          }

          if (trimmed.startsWith('Pytanie ')) {
            const lines = trimmed.split('\n');
            return lines.map(line => {
              const l = line.trim();
              if (l.startsWith('Pytanie ')) {
                return new Paragraph({
                  spacing: { before: 180, after: 60 },
                  children: [new TextRun({ text: l, font: 'Calibri', bold: true, size: 22, color: '0F2942' })],
                });
              }
              if (/^[A-D]\.\s/.test(l)) {
                return new Paragraph({
                  spacing: { before: 30, after: 30 },
                  indent: { left: 360 },
                  children: [new TextRun({ text: l, font: 'Calibri', size: 22, color: '2D3748' })],
                });
              }
              if (l.startsWith('Poprawna odpowiedź:')) {
                return new Paragraph({
                  spacing: { before: 50, after: 120 },
                  indent: { left: 360 },
                  children: [new TextRun({ text: l, font: 'Calibri', bold: true, color: '2B6CB0', size: 22 })],
                });
              }
              return new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [new TextRun({ text: l, font: 'Calibri', size: 22, color: '2D3748' })],
              });
            });
          }

          return trimmed.split('\n').filter(l => l.trim()).map(line => {
            const l = line.trim();
            const isTask = /^\d+\.\s/.test(l) || /^•\s/.test(l);
            return new Paragraph({
              spacing: { before: isTask ? 70 : 100, after: isTask ? 70 : 100 },
              children: [new TextRun({ text: l, font: 'Calibri', size: 22, color: '2D3748' })],
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
console.log(`✅ Zapisano sformatowany plik DOCX na Pulpicie: ${docxDesktopPath} (${docxBuffer.length} bajtów)`);

// ── 5. ZAPIS PAKIETU 5 WERSJI ROZWAŻAŃ ──
const pakietFilePath = path.join(process.cwd(), `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

// ── 6. BUDOWANIE PLIKU HTML LEKCJI (WZÓR DNIA 1 / STANDARD 21/21) ──
console.log('🌐 Przygotowuję stronę HTML lekcji Dnia 49...');

const template48Path = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-48.html');
let html = fs.readFileSync(template48Path, 'utf8');

// Naprawa ewentualnych artefaktów ze źródłowego szablonu
html = html.replace(/">\s*>>\s*\r?\n/g, '">\n');
html = html.replace(/">\s*\/>\s*\r?\n/g, ' />\n');

// 6.1 Meta i nagłówek HTML
html = html.replace(
  /<title>Dzień 48: [^<]+<\/title>/,
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
  /<meta property="og:title" content="[^"]+"[^>]*>/,
  `<meta property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]+"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_48_rady_jetry_i_wybor_sedziow\.jpg\?v=\d+/g,
  `kc_day_49_przymierze_pod_gora_synaj.jpg?v=20261118`
);

// Social share
html = html.replace(/kurscodzienny%2Fdzien-48/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2048[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);

// 6.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 48<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav48Regex = /<a href="\/akademia\/kurscodzienny\/dzien-47"[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-49"[\s\S]*?<\/a>/;
const nav49Block = `<a href="/akademia/kurscodzienny/dzien-48" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 48</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 50 (Czwartek) →</span>
        </span>`;
html = html.replace(nav48Regex, nav49Block);

// 6.3 Hero i grafika
html = html.replace(/<span>Dzień 48 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/17 LISTOPADA 2026 • WTOREK/g, `18 LISTOPADA 2026 • ŚRODA`);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 48:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>Ilustracja biblijna: Przymierze pod Górą Synaj — Królewskie Kapłaństwo i Przygotowanie Ludu (${READING})</span>`
);
html = html.replace(/Czytanie: Wj 18:1–27/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 19:5–6 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 19:5–6 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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

// 6.5 Karta „Zanim otworzysz Biblię” (Podróż przez 66 Ksiąg)
html = html.replace(
  /<!-- LESSON BODY CONTENT[^>]*-->/,
  `<!-- LESSON BODY CONTENT (Dzień 49, 18.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 49</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 19:1–25</strong>. W trzecim miesiącu po wyjściu z Egiptu Izrael staje na pustyni Synaj, naprzeciw góry Boga.
          </p>
          <p>
            Zanim przeczytasz rozważanie, otwórz Biblię i przeczytaj cały fragment. Zobacz, jak Bóg najpierw przypomina o orlich skrzydłach łaski, zanim zaprosi lud do trzydniowego uświęcenia i ogłosi go królewskim kapłaństwem.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=19" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj Wj 19:1–25</span></a>
        </div>
      </article>`
);

// 6.6 Tekst Pisma Świętego
html = html.replace(/<!-- SCRIPTURE SECTION[^>]*-->/, `<!-- SCRIPTURE SECTION (Wj 19:1–25) -->`);
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 18:1–27/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=18/g, `/mojabiblia?book=EXO&chapter=19`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=18/g, `/mojabiblia?book=EXO&amp;chapter=19`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">\n        ${readingHtml}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`
);

// 6.7 Klucze Językowe & Kody Stronga
const strongChips49 = `<span class="strong-chip"><span class="strong-id">H5459</span> <span class="strong-orig">סְגֻלָּה (Segullah)</span> — szczególna własność, osobisty skarb króla ponad wszystkie narody (Wj 19:5)</span>
          <span class="strong-chip"><span class="strong-id">H4467</span> <span class="strong-orig">מַמְלֶכֶת כֹּהֲנִים (Mamlechet kohanim)</span> — królestwo kapłanów, pośrednicy błogosławieństwa dla świata (Wj 19:6)</span>
          <span class="strong-chip"><span class="strong-id">H6918</span> <span class="strong-orig">גּוֹי קָדוֹשׁ (Goj kadosz)</span> — naród święty, oddzielony dla chwały i sprawiedliwości Boga (Wj 19:6)</span>
          <span class="strong-chip"><span class="strong-id">H5404</span> <span class="strong-orig">כַּנְפֵי נְשָׁרִים (Kanfej neszarim)</span> — skrzydła orłów, potężna i czuła opieka wybawienia (Wj 19:4)</span>
          <span class="strong-chip"><span class="strong-id">H6942</span> <span class="strong-orig">קָדַשׁ (Kadasz)</span> — uświęcić, oddzielić, przygotować na spotkanie z Bogiem (Wj 19:10, 14, 22)</span>
          <span class="strong-chip"><span class="strong-id">H1366</span> <span class="strong-orig">גְּבוּל (Gewul)</span> — granica wyznaczona wokół świętej góry w czci i bojaźni (Wj 19:12, 23)</span>
          <span class="strong-chip"><span class="strong-id">H6051</span> <span class="strong-orig">עָב הֶעָנָן (Aw he-anan)</span> — gęsty obłok objawiający i osłaniający Bożą chwałę (Wj 19:9, 16)</span>
          <span class="strong-chip"><span class="strong-id">H7782</span> <span class="strong-orig">שׁוֹפָר / יוֹבֵל (Szofar / Jowel)</span> — potężny głos trąby zwiastujący obecność Najwyższego (Wj 19:13, 16, 19)</span>`;

html = html.replace(/Klucze Językowe & Kody Stronga \(Wj 18:1–27\)/g, `Klucze Językowe & Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie stanowią osnowę teologiczną 18\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie stanowią osnowę teologiczną 19. rozdziału Księgi Wyjścia (orle skrzydła łaski, szczególna własność, królewskie kapłaństwo, uświęcenie i teofania pod Synajem):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips49}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 6.8 Egzegeza & Formacja Teologiczna (5 części, 45 punktów)
html = html.replace(/Pięć części studium Wj 18:1–27 \(45 punktów analitycznych\)/g, `Pięć części studium ${READING} (45 punktów analitycznych)`);

const exegesis49 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            PRZYBYCIE NA SYNAJ, ŁASKA ORLICH SKRZYDEŁ I POWOŁANIE LUDU (WJ 19:1–6)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Chronologia przybycia — trzeci miesiąc (19:1):</strong> Około 50 dni po nocy paschalnej Izrael przybywa na pustynię Synaj, co później zapoczątkowało związek Święta Tygodni (Pięćdziesiątnicy) z nadaniem Prawa.</p>
            <p><strong>2. Wędrówka z Refidim pod górę (19:2):</strong> Po cudownej wodzie ze skały, zwycięstwie nad Amalekiem i radach Jetry naród osiąga cel zapowiedziany w krzewie ognistym (Wj 3:12).</p>
            <p><strong>3. Jedność obozu „naprzeciw góry” (19:2):</strong> Hebrajski czasownik stoi w liczbie pojedynczej („rozbił obóz Izrael”), wskazując na jedność wspólnoty przed Bogiem.</p>
            <p><strong>4. Inicjatywa PANA (19:3):</strong> Mojżesz wstępuje ku górze, lecz to PAN pierwszy woła do niego — Przymierze rodzi się zawsze z suwerennej inicjatywy Boga.</p>
            <p><strong>5. „Dom Jakuba” i „synowie Izraela” (19:3):</strong> Paralelizm poetycki łączy pamięć o ludzkiej słabości Jakuba z godnością nowego imienia przymierza.</p>
            <p><strong>6. Najpierw fakty łaski (19:4):</strong> Zanim padnie jakiekolwiek przykazanie, Bóg przypomina naoczne wybawienie z Egiptu dokonane całkowicie z łaski.</p>
            <p><strong>7. Metafora orlich skrzydeł (19:4):</strong> „Niosłem was na skrzydłach orłów” (por. Pwt 32:11) wyraża potęgę i czułość ojca chroniącego bezbronne pisklęta.</p>
            <p><strong>8. Cel zbawienia — „do siebie” (19:4):</strong> Wyjście z niewoli nie jest tylko wolnością polityczną, lecz przyprowadzeniem człowieka do osobistej więzi z Bogiem.</p>
            <p><strong>9. Posłuszeństwo wiary (19:5):</strong> Przestrzeganie przymierza nie kupuje miłości Bożej, lecz jest wdzięczną odpowiedzią na już otrzymane ocalenie.</p>
            <p><strong>10. Segullah — szczególna własność (19:5):</strong> Osobisty, bezcenny skarb króla, odróżniony od powszechnego mienia państwa.</p>
            <p><strong>11. Władza nad całą ziemią (19:5):</strong> Wybór Izraela ma służyć światu, bo cała ziemia należy do jednego Stwórcy.</p>
            <p><strong>12. Mamlechet kohanim — królestwo kapłanów (19:6):</strong> Cały lud ma reprezentować Boga przed narodami i wstawiać się za nimi przed Najwyższym.</p>
            <p><strong>13. Goj kadosz — naród święty (19:6):</strong> Wspólnota oddzielona od bałwochwalstwa i niesprawiedliwości ku służbie Świętemu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            ZGODA LUDU I OBIETNICA OBJAWIENIA W OBŁOKU (WJ 19:7–9)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>14. Wierność posłańca (19:7):</strong> Mojżesz zwołuje starszych i wiernie wykłada „wszystkie te słowa”, niczego nie pomijając ani nie łagodząc.</p>
            <p><strong>15. Jednomyślna deklaracja zgromadzenia (19:8):</strong> „Uczynimy wszystko, co PAN powiedział” — szczery entuzjazm, który jednak bez odnowy serca okaże się kruchy (por. Wj 32).</p>
            <p><strong>16. Pośrednictwo dwustronne (19:8–9):</strong> Mojżesz zanosi odpowiedź ludu do PANA, ukazując biblijny porządek reprezentacji.</p>
            <p><strong>17. Zstąpienie w gęstym obłoku (19:9):</strong> Obłok jednocześnie objawia Bożą bliskość i osłania śmiertelników przed nieprzystępną chwałą (por. Wj 33:20).</p>
            <p><strong>18. Uwierzytelnienie sługi Bożego (19:9):</strong> Bezpośrednia rozmowa słyszana przez lud ugruntowuje zaufanie do Bożego posłannictwa („aby uwierzył ci na zawsze”).</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            TRZY DNI UŚWIĘCENIA, OBMYWANIE SZAT I GRANICE WOKÓŁ GÓRY (WJ 19:10–15)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Przygotowanie serca i czasu (19:10):</strong> Nakaz „uświęć ich dziś i jutro” oddziela czas święty od codziennej rutyny przed spotkaniem z Królem.</p>
            <p><strong>20. Wypranie szat (19:10, 14):</strong> Widzialny znak oczyszczenia i czci — przed Świętego nie przychodzi się w duchowej bylejakości (por. Ap 7:14).</p>
            <p><strong>21. Zapowiedź trzeciego dnia (19:11):</strong> Zstąpienie PANA trzeciego dnia zapowiada w Piśmie czas przełomu, objawienia chwały i nowego życia.</p>
            <p><strong>22. Wyznaczenie granic wokół góry (19:12):</strong> Strefa graniczna (*gewul*) uczy pokory — bliskość z Bogiem nie oznacza ludzkiej samowoli.</p>
            <p><strong>23. Śmiertelna powaga świętości (19:12–13):</strong> Zakaz dotykania góry dotyczy ludzi i zwierząt; wykonanie wyroku z daleka chroni innych przed wejściem w strefę świętą.</p>
            <p><strong>24. Sygnał przeciągłej trąby (19:13):</strong> Podejście następuje wyłącznie na Boży znak trąby, na warunkach wyznaczonych przez Stwórcę.</p>
            <p><strong>25. Natychmiastowe posłuszeństwo (19:14):</strong> Mojżesz schodzi bez zwłoki, a lud wiernie uświęca się i pierze swoje szaty.</p>
            <p><strong>26. Czasowe skupienie duchowe (19:15):</strong> Krótka powściągliwość małżeńska służyła rytualnej czystości (Kpł 15) i wyłącznemu oddaniu modlitwie przed teofanią.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            TEOFANIA NA SYNAJU — GRZMOTY, OGIEŃ, DYM I GŁOS TRĄBY (WJ 19:16–19)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>27. Kosmiczne znaki poranka (19:16):</strong> Grzmoty, błyskawice, gęsty obłok i potężny głos trąby ogłaszają przyjście Pana wszelkiego stworzenia.</p>
            <p><strong>28. Święte drżenie obozu (19:16):</strong> Cały lud drży — zdrowy wstrząs stworzenia wobec absolutnego majestatu Stwórcy.</p>
            <p><strong>29. Wyjście na spotkanie z Bogiem (19:17):</strong> Mojżesz wyprowadza lud u stóp góry (<em>likrat ha-Elohim</em>) jak orszak witający przybywającego Króla.</p>
            <p><strong>30. Ogień, dym jak z pieca i wstrząs góry (19:18):</strong> Ogień symbolizuje świętą czystość i sąd nad złem (Pwt 4:24; Hbr 12:29); trzęsie się cały masyw górski.</p>
            <p><strong>31. Narastający dźwięk trąby (19:19):</strong> Głos rogu narasta coraz potężniej, budując napięcie bezpośrednio przed ogłoszeniem Dekalogu.</p>
            <p><strong>32. Osobowy dialog w ogniu (19:19):</strong> Mojżesz przemawia, a Bóg odpowiada mu słyszalnym głosem — majestat łączy się z czytelnym słowem objawienia.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            OSTRZEŻENIE PRZED ZUCHWAŁOŚCIĄ I KLUCZE JĘZYKOWE (WJ 19:20–25)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>33. Wezwanie na szczyt (19:20):</strong> PAN zstępuje na szczyt Synaju i powołuje Mojżesza ku Sobie jako wybranego pośrednika przymierza.</p>
            <p><strong>34. Przestroga przed ciekawością bez czci (19:21):</strong> Przekroczenie granicy „aby zobaczyć PANA” na własnych warunkach grozi zagładą.</p>
            <p><strong>35. Nawet kapłani wymagają uświęcenia (19:22):</strong> Żaden urząd duchowny nie zastępuje osobistej czystości serca i bojaźni Bożej.</p>
            <p><strong>36. Powtórne ostrzeżenie dla ochrony ludu (19:23–24):</strong> Bóg ponawia zakaz nie z okrucieństwa, lecz by ocalić lud przed własną lekkomyślnością.</p>
            <p><strong>37. Towarzystwo Aarona (19:24):</strong> Zaproszenie Aarona obok Mojżesza zapowiada uporządkowaną służbę kapłańską przy wyraźnym zachowaniu granic.</p>
            <p><strong>38. Zejście przed ogłoszeniem Prawa (19:25):</strong> Mojżesz wraca do ludu z końcową przestrogą tuż przed słowami Dziesięciu Przykazań.</p>
            <p><strong>39. Jedność Orła i Ognia (19:4, 18):</strong> Bóg Przymierza jest jednocześnie czułą opieką dla ufających i trawiącym ogniem wobec pychy.</p>
            <p><strong>40. Uwertura do Wj 20:</strong> Cały rozdział 19 przygotowuje serce i sumienie na przyjęcie Prawa wolności.</p>
            <p><strong>41. Segullah (סְגֻלָּה):</strong> Bezcenny osobisty skarb Króla — tożsamość oparta na łasce wybrania.</p>
            <p><strong>42. Mamlechet kohanim (מַמְלֶכֶת כֹּהֲנִים):</strong> Królestwo kapłanów — powołanie każdego wierzącego do służby wstawiennictwa i świadectwa.</p>
            <p><strong>43. Goj kadosz (גּוֹי קָדוֹשׁ):</strong> Naród święty — oddzielenie od grzechu dla odzwierciedlania charakteru Boga.</p>
            <p><strong>44. Kadasz (קָדַשׁ):</strong> Uświęcić i przygotować się przez porzucenie brudu i skupienie na Bogu.</p>
            <p><strong>45. Szofar (שׁוֹפָר):</strong> Głos Bożej trąby zwiastujący objawienie Prawa oraz powrót Chrystusa (1 Tes 4:16).</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis49}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 6.9 Jezus w Centrum
const jesus49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Od Góry Synaj do Góry Syjon — Chrystus Doskonałym Pośrednikiem Przymierza
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Kontrast Góry Synaj i Góry Syjon (Hbr 12:18–24):</strong> List do Hebrajczyków zestawia przerażającą górę płonącą ogniem z radosnym przystępem wierzących do niebiańskiej Góry Syjon i do Jezusa — Pośrednika Nowego Przymierza, którego krew mówi lepsze rzeczy niż krew Abla.
          </p>
          <p>
            <strong>2. Królewskie Kapłaństwo i Naród Święty w Chrystusie (1 P 2:9–10):</strong> Apostoł Piotr przenosi bezpośrednio obietnice z Wj 19:5–6 na cały Kościół złożony z ludzi wszystkich narodów: „Lecz wy jesteście rodem wybranym, królewskim kapłaństwem, narodem świętym, ludem nabytym”.
          </p>
          <p>
            <strong>3. Wykupienie Ludu na Własność (Tt 2:14):</strong> Paweł uczy, że Zbawiciel „wydał samego siebie za nas, aby nas wykupić od wszelkiej nieprawości i oczyścić sobie lud na własność” — wypełniając obietnicę hebrajskiego <em>segullah</em>.
          </p>
          <p>
            <strong>4. Pieśń Odkupionych w Księdze Apokalipsy (Ap 1:6; 5:9–10):</strong> Przez krew Baranka ludzie z każdego plemienia, języka, ludu i narodu stają się „królami i kapłanami” dla Boga.
          </p>
          <p>
            <strong>5. Duchowe Obmycie Szat (1 Kor 6:11; Ap 7:14):</strong> Trzydniowe pranie szat pod Synajem zapowiadało pełne usprawiedliwienie i uświęcenie przez ofiarę Chrystusa i działanie Ducha Świętego.
          </p>
          <p>
            <strong>6. Jedyny Pośrednik Otwierający Przystęp do Ojca (J 14:6; 1 Tm 2:5):</strong> Zamiast śmiercionośnej granicy wokół góry, Jezus przez swój krzyż otworzył nam bezpieczną drogę do tronu łaski, aby czystym sercem oglądać Boga (Mt 5:8).
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=19" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj Wj 19:1–25</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus49}\n      $2`
);

// 6.10 Sprawdź w Biblii (12 porównań)
const compare49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:4 → Pwt 32:10–12</strong>: Jak Mojżesz rozwija obraz orła czuwającego nad pisklętami i niosącego lud na skrzydłach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:5–6 → 1 P 2:9–10</strong>: Jak apostoł Piotr stosuje tytuły „królewskiego kapłaństwa” i „narodu świętego” do Kościoła?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:5 → Tt 2:14</strong>: W jaki sposób Jezus wykupił i oczyścił sobie lud „na własność”, gorliwy w dobrych uczynkach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:6 → Ap 5:9–10</strong>: Jak krew Baranka uczyniła odkupionych z każdego narodu królami i kapłanami Bogu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:10, 14 → 1 Kor 6:11</strong>: Co oznacza duchowe obmycie i uświęcenie w imię Pana Jezusa Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:16–21 → Hbr 12:18–24</strong>: Dlaczego wierzący nie podeszli już do drżącej góry Synaj, lecz do Góry Syjon w Jezusie?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:18 → Pwt 4:24; Hbr 12:29</strong>: Dlaczego Pismo Święte nazywa naszego Boga „ogniem trawiącym”?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:8 → Pwt 5:28–29</strong>: Dlaczego samo entuzjastyczne „uczynimy wszystko” potrzebuje przemienionego serca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:10 → Mt 5:8</strong>: Dlaczego Chrystus wiąże czystość serca z obietnicą oglądania Boga?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:12 → Hbr 10:19–22</strong>: Jak krew Jezusa otworzyła śmiałe wejście do Miejsca Najświętszego zamiast strefy zakazu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:16, 19 → 1 Tes 4:16</strong>: Z jakim wydarzeniem końcowym Nowy Testament wiąże potężny głos trąby Bożej?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 19:1–25 → Iz 6:1–7</strong>: Jak człowiek reaguje na spotkanie ze świętym Bogiem i skąd przychodzi oczyszczenie?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare49}\n      $2`
);

// 6.11 Prawda na dziś (8 zasad)
const truth49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Przymierza pod Synajem — Co zmienia się w Twoim patrzeniu na Boga i świętość?
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Łaska zawsze poprzedza wymagania:</strong> Bóg najpierw wykupił Cię z niewoli na skrzydłach orłów i przyprowadził do Siebie, a dopiero potem daje przykazania jako drogę wolności.</p>
          <p>• <strong>2. Jesteś szczególną własnością Króla (<em>segullah</em>):</strong> Twoja godność nie zależy od opinii świata, lecz od tego, że Stwórca całej ziemi wybrał Cię w Chrystusie jako swój skarb.</p>
          <p>• <strong>3. Każdy uczeń Jezusa należy do królewskiego kapłaństwa:</strong> Masz przywilej wstawiania się w modlitwie za innymi i reprezentowania charakteru Boga w swojej codziennej pracy i rodzinie.</p>
          <p>• <strong>4. Bliskość z Bogiem nie znosi czci i powagi:</strong> Spotkanie ze Słowem Bożym zasługuje na przygotowanie, ciszę i szacunek — nie na pośpiech i duchową bylejakość.</p>
          <p>• <strong>5. Świętość jest odpowiedzią miłości, nie lęku:</strong> Oczyszczanie myśli i nawyków („pranie szat”) wynika z pragnienia, by godnie stanąć przed Tym, który pierwszy nas umiłował.</p>
          <p>• <strong>6. Boże granice chronią życie przed spaleniem:</strong> Wyznaczone w Piśmie granice moralne są ochronnym murem miłości Ojca, a nie ograniczeniem szczęścia.</p>
          <p>• <strong>7. Wzniosłe deklaracje potrzebują mocy Ducha:</strong> Entuzjastyczne „uczynimy wszystko” bez codziennej zależności od Chrystusa szybko rozbija się o ludzką słabość.</p>
          <p>• <strong>8. W Chrystusie Góra Syjon zastąpiła trwogę Synaju:</strong> Przez krew Pośrednika Nowego Przymierza możesz przystępować do Boga żywego z czystym sumieniem i dziecięcą ufnością.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth49}\n      $2`
);

// 6.12 Pomyśl (8 pytań do serca)
const questions49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w swoim myśleniu o wierze częściej zaczynasz od listy obowiązków („muszę zrobić”), czy od wdzięczności za to, że Bóg już wziął Cię na skrzydła łaski?</p>
          <p>2. W jakich sytuacjach codzienności zapominasz, że należysz do „królestwa kapłanów” i masz reprezentować charakter Chrystusa wobec ludzi wokół Ciebie?</p>
          <p>3. Jak przygotowujesz swoje serce i otoczenie przed poranną modlitwą i czytaniem Biblii — czy dajesz Bogu skupienie, czy tylko resztki uwagi między powiadomieniami?</p>
          <p>4. Jakie „szaty” nawyków, myśli lub słów wymagają dziś w Twoim życiu uczciwego wyprania i oddania pod oczyszczającą krew Jezusa?</p>
          <p>5. Czy pamiętasz chwilę, gdy gorliwie obiecywałeś Bogu „uczynię wszystko”, a potem zabrakło Ci wytrwałości? Czego nauczyło Cię to o potrzebie łaski?</p>
          <p>6. Czy w Twoim życiu duchowym zachowujesz równowagę między dziecięcą ufnością wobec Ojca a głęboką bojaźnią i szacunkiem wobec Jego świętości?</p>
          <p>7. Które z Bożych granic w Twoim życiu sprawiają Ci dziś największą trudność i czy widzisz w nich ochronną miłość Ojca?</p>
          <p>8. W jaki konkretny sposób możesz dziś wstawić się w modlitwie za kimś ze swojej rodziny lub znajomych, pełniąc służbę królewskiego kapłaństwa?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions49}\n      $2`
);

// 6.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 18 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 19 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 18/g, `Po przeczytaniu Wj 19`);

// 6.14 Twoja Decyzja
const decision49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Przyjmij Łaskę Orlich Skrzydeł i Żyj Jako Królewskie Kapłaństwo!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dziewiętnasty rozdział Księgi Wyjścia rozbija dwa najczęstsze fałszywe obrazy Boga, z jakimi zmaga się ludzkie serce. Pierwszy traktuje Boga jak surowego nadzorcę, którego przychylność trzeba wypracować przed wejściem do Jego domu. Drugi traktuje Go powierzchownie — jak kogoś, przed kim można stanąć w bylejakości, bez szacunku, bez przygotowania i bez gotowości na oczyszczenie życia z grzechu.
          </p>
          <p>
            Tymczasem Słowo z góry Synaj pokazuje Ci Boga, który najpierw niesie na skrzydłach orłów i przyprowadza do Siebie, a następnie zaprasza do świętej przynależności jako swoją szczególną własność i królewskie kapłaństwo. Dzięki Jezusowi Chrystusowi nie stoisz już przed groźną barierą śmierci pod płonącą górą — Jego przelana krew otworzyła Ci drogę do niebiańskiej Góry Syjon, a Jego Duch Święty uzdalnia Cię do życia czystego, odważnego i wiernego Przymierzu.
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Przyjmuję z wdzięcznością prawdę, że Bóg najpierw wziął mnie na skrzydła swojej łaski i przyprowadził do Siebie przez Jezusa Chrystusa. Świadomie odrzucam zarówno paraliżujący lęk zasługiwania na zbawienie, jak i duchową bylejakość wobec Bożej świętości. Postanawiam dziś zadbać o czystość mojego serca, szanować Boże granice w codziennym życiu i pełnić służbę królewskiego kapłaństwa w moim domu, pracy i wspólnocie.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision49}\n      $2`
);

// 6.15 Modlitwa
html = html.replace(/<span>Modlitwa na 17 listopada<\/span>/g, `<span>Modlitwa na 18 listopada</span>`);
const prayer49 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Wdzięczność za Orle Skrzydła Łaski i Czystość Serca
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Święty Boże, Królu całej ziemi i Ojcze naszego Pana Jezusa Chrystusa! Staję przed Tobą w ten środowy dzień z głęboką wdzięcznością za to, co ukazałeś w dziewiętnastym rozdziale Księgi Wyjścia. Dziękuję Ci, że nie jestem dla Ciebie przypadkowym przechodniem, lecz że niosłeś mnie na skrzydłach orłów swojej łaski i przyprowadziłeś mnie do Siebie, abym był Twoją szczególną własnością.
          </p>
          <p>
            Wyznaję przed Tobą moje grzechy i chwile duchowego rozproszenia, w których zbliżałem się do Twojego Słowa i modlitwy w pośpiechu, z bylejakością lub z ukrytymi kompromisami w sercu. Przepraszam Cię także za każdy raz, gdy zapominałem o Twojej miłości i próbowałem własnym wysiłkiem zasłużyć na Twoje przyjęcie, zamiast zaufać dokonanemu dziełu zbawienia.
          </p>
          <p>
            Panie Jezu Chryste, Doskonały Pośredniku Nowego Przymierza! Dziękuję Ci, że przez swoją krew na krzyżu obmyłeś moje duchowe szaty i zamieniłeś niedostępny strach Synaju na bezpieczny dostęp do Góry Syjon i tronu łaski. Oczyść dzisiaj moje serce, moje myśli i moje pragnienia, abym mógł oglądać Ciebie czystym sumieniem i słuchać Twojego głosu z radością oraz czcią.
          </p>
          <p>
            Udziel mi siły Ducha Świętego, abym wiernie strzegł Twoich mądrych granic i nie przekraczał ich z pychy ani lekkomyślności. Uczyń mnie wiernym świadkiem Twojego królewskiego kapłaństwa i narodu świętego, który wśród codziennych spraw rozgłasza Twoje cnoty temu światu. Tobie niech będzie cześć, majestat i chwała na wieki. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer49}\n      $2`
);

// 6.16 Zadania na dziś (7 zadań) i zapis
const tasks49 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=19" class="text-amber-300 underline font-semibold">Wj 19:1–25</a> w przekładzie UBG oraz równoległy fragment Hbr 12:18–24.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Wypisz trzy konkretne sytuacje ze swojej przeszłości, w których Bóg niósł Cię „na skrzydłach orłów” i przeprowadzał przez trudności.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Przygotuj swoje „szaty serca”: przed modlitwą odłóż telefon, zadbaj o 10 minut ciszy i wyznaj Bogu każdy niezałatwiony grzech.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Przeczytaj 1 P 2:9 i podejmij dziś modlitwę wstawienniczą lub rozmowę z osobą, która jeszcze nie zna Chrystusa.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zidentyfikuj jedną „granicę Bożą” w swoim życiu (etyka, prawda, czystość, czas święty) i podejmij decyzję o jej poszanowaniu.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Naucz się na pamięć wersetu przewodniego Wj 19:5–6 i powtórz go trzykrotnie w ciągu dnia.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 49 jako ukończony i podziel się lekcją z kimś, kto postrzega wiarę wyłącznie jako zbiór nakazów.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks49}\n        $2`
);

// 6.17 Zapowiedź: Jutro (Dzień 50)
const tomorrow49 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 19 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 50 — DZIESIĘĆ PRZYKAZAŃ: PRAWO WOLNOŚCI PRZYMIERZA I OŁTARZ BOGA ŻYWEGO (Wj 20:1–26)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 50: Po trzydniowym przygotowaniu na pustyni Synaj sam Bóg ogłasza Dekalog. Zobaczysz, dlaczego Prawo zaczyna się od słów o wyzwoleniu z niewoli, i jak Chrystus wpisuje je w serca wierzących.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (19 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow49}`
);

// 6.18 JavaScript: QUIZ_DATA (20 pytań z Wj 19), DAY_KEY, completeDay49, TTS
const quizData49 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 19:1–25) ──
    const QUIZ_DATA = [
      {
        q: "W którym miesiącu od wyjścia z ziemi Egiptu synowie Izraela przybyli na pustynię Synaj (Wj 19:1)?",
        a: ["W pierwszym miesiącu zaraz po przejściu przez Morze Czerwone", "W trzecim miesiącu od wyjścia z ziemi Egiptu", "W siódmym miesiącu w porze jesiennych zbiorów", "W dwunastym miesiącu po bitwie z Amalekiem"],
        c: 1
      },
      {
        q: "Skąd bezpośrednio wyruszył Izrael przed przybyciem na pustynię Synaj (Wj 19:2)?",
        a: ["Z oazy Elim", "Z pustyni Paran", "Z Refidim", "Z miasta Ramses"],
        c: 2
      },
      {
        q: "Gdzie dokładnie rozbił obóz Izrael na pustyni Synaj (Wj 19:2)?",
        a: ["W głębokiej jaskini nad rzeką", "Na pustyni, naprzeciw góry", "Na samym szczycie góry Synaj", "Na wybrzeżu Zatoki Akaba"],
        c: 1
      },
      {
        q: "Co uczynił Mojżesz po rozbiciu obozu pod górą (Wj 19:3)?",
        a: ["Wstąpił do Boga, a PAN zawołał do niego z góry", "Zbudował ołtarz ze złota", "Wrócił do Midianu po Jetrę", "Rozpoczął walkę z Amalekiem"],
        c: 0
      },
      {
        q: "Jakiego obrazu użył Bóg w Wj 19:4, opisując wyprowadzenie i opiekę nad Izraelem?",
        a: ["Stada owiec prowadzonego przez lwa", "Niesienia na skrzydłach orłów i przyprowadzenia do Siebie", "Okrętu płynącego przez spokojne morze", "Twierdzy zbudowanej z cedrów Libanu"],
        c: 1
      },
      {
        q: "Jakim tytułem Bóg obiecał nazwać Izraela ponad wszystkie narody, jeśli posłucha Jego głosu (Wj 19:5)?",
        a: ["Najpotężniejszym imperium militarnym wschodu", "Swoją szczególną własnością", "Jedynymi mieszkańcami pustyni", "Panami wszystkich królestw Egiptu"],
        c: 1
      },
      {
        q: "Jakim uzasadnieniem Bóg poparł obietnicę uczynienia Izraela szczególną własnością w Wj 19:5?",
        a: ["Ponieważ Izrael był najliczniejszym narodem świata", "Ponieważ do PANA należy cała ziemia", "Ponieważ Egipcjanie podpisali traktat pokojowy", "Ponieważ Mojżesz był z rodu królewskiego"],
        c: 1
      },
      {
        q: "Jakie dwa kolejne określenia powołania Izraela padają w Wj 19:6?",
        a: ["Wojownicy północy i budowniczowie świątyń", "Królestwo kapłanów i naród święty", "Mędrcy wschodu i pasterze pustyni", "Sędziowie narodów i kupcy morscy"],
        c: 1
      },
      {
        q: "Kogo zwołał Mojżesz po zejściu z góry, aby wyłożyć słowa PANA (Wj 19:7)?",
        a: ["Wyłącznie Aarona i Miriam", "Starszych ludu", "Zwiadowców z pokolenia Judy", "Cudzoziemców mieszkających w obozie"],
        c: 1
      },
      {
        q: "Jak cały lud odpowiedział na słowa przymierza przedstawione przez Mojżesza (Wj 19:8)?",
        a: ["Najpierw musimy zobaczyć cuda w obozie", "Uczynimy wszystko, co PAN powiedział", "Potrzebujemy miesiąca na naradę", "To zbyt trudne wymagania dla naszego pokolenia"],
        c: 1
      },
      {
        q: "W czym PAN zapowiedział swoje przyjście do Mojżesza, aby lud słyszał rozmowę i uwierzył mu na zawsze (Wj 19:9)?",
        a: ["W cichym powiewie wiatru", "W gęstym obłoku", "W krzewie cierniowym w obozie", "W tęczy na bezchmurnym niebie"],
        c: 1
      },
      {
        q: "Co konkretnego mieli uczynić ludzie w ramach przygotowania i uświęcenia przed spotkaniem z Bogiem (Wj 19:10)?",
        a: ["Zbudować siedem ołtarzy z ciosanych kamieni", "Wyprać swoje szaty", "Posmarować czoła oliwą", "Złożyć dziesięcinę ze wszystkich trzód"],
        c: 1
      },
      {
        q: "Którego dnia PAN miał zstąpić na oczach całego ludu na górę Synaj (Wj 19:11)?",
        a: ["Siódmego dnia po nowiu", "Trzeciego dnia", "Czterdziestego dnia", "Nazajutrz rano"],
        c: 1
      },
      {
        q: "Co groziło każdemu człowiekowi lub zwierzęciu, które dotknęłoby podnóża góry poza wyznaczoną granicą (Wj 19:12–13)?",
        a: ["Wygnanie z obozu na siedem dni", "Śmierć przez ukamienowanie lub przeszycie strzałami, bez dotykania go ręką", "Konfiskata dobytku", "Siedmiodniowy post o chlebie i wodzie"],
        c: 1
      },
      {
        q: "Jaki sygnał miał oznaczać, że można podejść do góry (Wj 19:13)?",
        a: ["Podniesienie laski Aarona o zachodzie słońca", "Gdy przeciągle będą trąbić", "Zapalenie trzech ognisk na równinie", "Wschód pierwszej gwiazdy"],
        c: 1
      },
      {
        q: "Jakie zjawiska pojawiły się o poranku trzeciego dnia na górze Synaj (Wj 19:16)?",
        a: ["Deszcz manny i spokojna rosa", "Grzmoty i błyskawice, gęsty obłok nad górą i bardzo potężny głos trąby", "Zaćmienie księżyca i cisza w obozie", "Rozkwitnięcie pustyni wokół namiotów"],
        c: 1
      },
      {
        q: "Dlaczego góra Synaj cała dymiła, a dym unosił się jak z pieca (Wj 19:18)?",
        a: ["Ponieważ lud zapalił ofiary całopalne na jej szczycie", "Ponieważ PAN zstąpił na nią w ogniu i cała góra bardzo się trzęsła", "Ponieważ wiatr przywiał burzę piaskową z Egiptu", "Ponieważ Amalekici podpalili obóz"],
        c: 1
      },
      {
        q: "Co działo się, gdy głos trąby się przeciągał i coraz bardziej rozlegał (Wj 19:19)?",
        a: ["Lud rzucił się do ucieczki w stronę Morza Czerwonego", "Mojżesz mówił, a Bóg odpowiadał mu głosem", "Aaron zaczął czytać zwoje Rodzaju", "Głos zamilkł na siedem godzin"],
        c: 1
      },
      {
        q: "Przed czym PAN kazał Mojżeszowi ponownie przestrzec lud ze szczytu góry w Wj 19:21–22?",
        a: ["Przed głodem w czasie przemówienia", "Aby lud nie przekraczał granicy, żeby zobaczyć PANA, oraz aby nawet kapłani zbliżający się do PANA uświęcili się, by ich nie wytracił", "Przed atakiem Midianitów", "Przed opuszczeniem namiotów bez obuwia"],
        c: 1
      },
      {
        q: "Kto oprócz Mojżesza miał według polecenia z Wj 19:24 wstąpić później na górę, podczas gdy kapłani i lud mieli pozostać za granicą?",
        a: ["Jetro", "Jozue", "Aaron", "Chur"],
        c: 2
      }
    ];`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData49);
html = html.replace(/Doskonale! Znasz na wskroś 9\. rozdział Księgi Wyjścia!/g, `Doskonale! Znasz na wskroś 19. rozdział Księgi Wyjścia!`);

html = html.replace(/kc_day48_/g, `kc_day49_`);
html = html.replace(/DAY_KEY = 'kc_day48'/g, `DAY_KEY = 'kc_day49'`);
html = html.replace(/completeDay48/g, `completeDay49`);
html = html.replace(/Oznacz Dzień 48 jako ukończony/g, `Oznacz Dzień 49 jako ukończony`);
html = html.replace(/Dzień 48 ukończony/g, `Dzień 49 ukończony`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 19:5–6.")`
);

// ── 7. ZAPIS 4 ŚCIEŻEK CLEAN URLs (+ lustro LUMINA jeśli istnieje) ──
const paths49 = [
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-49.html'),
  path.join(process.cwd(), 'akademia/kurscodzienny/dzien-49/index.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-49.html'),
  path.join(process.cwd(), 'kursy/kurscodzienny/dzien-49/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-49.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-49/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-49.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-49/index.html'
];

for (const p of paths49) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 4 ścieżki Clean URLs Dnia 49 (oraz kopie w Desktop/@ICC/LUMINA)!');

// ── 8. ZAPIS DANYCH DO KOLEJKI PRZEDPUBLIKACYJNEJ (LOKALNIE) ──
const queueDir = path.join(process.cwd(), `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);
fs.mkdirSync(queueDir, { recursive: true });
fs.writeFileSync(path.join(queueDir, 'meta.json'), JSON.stringify({
  data: DATE_STR,
  dzien: DAY_NUM,
  przygotowal: '@A001 (antigravity)',
  przygotowano: new Date().toISOString(),
  status: 'prepared_for_00_00',
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
  fullText: v1Block,
  contentApp: v1Block,
  contentWeb: pakiet5wersji
    .split('WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)\n====================================================================\n\n')[1]
    .split('\n\n====================================================================\nWERSJA 3: WERSJA WIECZORNA (SMS)')[0]
    .trim(),
  contentSms: pakiet5wersji
    .split('WERSJA 3: WERSJA WIECZORNA (SMS)\n====================================================================\n\n')[1]
    .split('\n\n====================================================================\nWERSJA 4: SCENARIUSZ WIDEO')[0]
    .trim(),
  tvScript: pakiet5wersji
    .split('WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)\n====================================================================\n\n')[1]
    .split('\n\n====================================================================\nWERSJA 5: ARTYKUŁ TEOLOGICZNY')[0]
    .trim(),
  ccnArticle: pakiet5wersji
    .split('WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)\n====================================================================\n\n')[1]
    .trim(),
  imageUrl: `/${imgRelPath}`,
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
  publishedAt: `${DATE_STR}T00:00:00.000Z`,
  status: 'prepared'
};
fs.writeFileSync(path.join(queueDir, 'rozwazanie.json'), JSON.stringify(rozwazanieJson, null, 2), 'utf8');
console.log(`✅ Zapisano pakiet przygotowawczy JSON w kolejka-publikacji/kurs-codzienny/${DATE_STR}/`);
