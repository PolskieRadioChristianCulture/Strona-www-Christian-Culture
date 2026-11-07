import fs from 'node:fs';
import path from 'node:path';
import { sprawdzLekcje } from './kurs-codzienny/straznik-lekcji.mjs';

const ROOT = process.cwd();

console.log('🚀 Rozpoczynam perfekcyjne budowanie Dnia 39 (Wj 8:1–32)...');

// Wczytujemy wersety Wj 8
const ubgPath = 'C:/Users/czark/Desktop/Biblia Audio Christian Culture/teksty_ubg/ubg-2025/EXO-008.json';
const ubgData = JSON.parse(fs.readFileSync(ubgPath, 'utf8'));
const versesHtml = ubgData.verses.map(v => `        <p><span class="verse-num">${v.number}</span> ${v.text}</p>`).join('\n');

// Wczytujemy bazowy Dzień 38
const d38Path = path.join(ROOT, 'akademia/kurscodzienny/dzien-38.html');
let html = fs.readFileSync(d38Path, 'utf8');

// 1. Meta i nagłówki
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="Dzień 39: Księga Wyjścia 8:1–32. Plagi żab, wszy i much. Bezsilność czarowników wyznających 'To jest palec Boży' oraz ochrona ziemi Goszen. Studium biblijne i quiz wiedzy."`);
html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-39"`);
html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-39"`);
html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32) — Z Biblią za Pan Brat"`);
html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 39. Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen — Wj 8:1–32."`);
html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108"`);

// 2. Navbar górny
const navBarRegex = /<nav class="border-b border-brand-line bg-brand-navy\/60 text-xs">[\s\S]*?<\/nav>/;
const newNavBar = `<nav class="border-b border-brand-line bg-brand-navy/60 text-xs">
    <div class="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-zinc-400">
      <div class="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1">
        <a href="/akademia" class="hover:text-amber-400">Akademia</a>
        <span>›</span>
        <a href="/akademia/kurscodzienny" class="hover:text-amber-400">Kurs Codzienny</a>
        <span>›</span>
        <span class="text-zinc-500">Księga Wyjścia</span>
        <span>›</span>
        <span class="text-amber-400 font-semibold">Dzień 39</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        <span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-38" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 38</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 40 (Jutro) →</span>
        </span>
      </div>
    </div>
  </nav>`;
html = html.replace(navBarRegex, newNavBar);

// 3. Hero Header
html = html.replace(/Dzień \d+ z 2009/g, 'Dzień 39 z 2009');
html = html.replace(/7 LISTOPADA 2026 • SOBOTA/g, '8 LISTOPADA 2026 • NIEDZIELA');
html = html.replace(/LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW/g, 'PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN');
html = html.replace(/Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil/g, 'Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza (Wj 8:1–32)');

// Werset w Hero
html = html.replace(/„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.”/g, '„Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.”');
html = html.replace(/— Księga Wyjścia 7:17 \(UBG\)/g, '— Księga Wyjścia 8:19 (UBG)');
html = html.replace(/data-verse-clip="[^"]*"/g, 'data-verse-clip="Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział. (Wj 8:19, UBG)"');

// Myśl przewodnia
html = html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.\n      </div>`
);

// Obrazek
html = html.replace(/src="\/images\/academy\/daily\/[^"]*"/g, 'src="/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108"');
html = html.replace(/alt="[^"]*"/g, 'alt="Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32)"');
html = html.replace(/Ilustracja biblijna: [^<]*/g, 'Ilustracja biblijna: Egipscy czarownicy upuszczają laski i wyznają przed faraonem: „To jest palec Boży”, a ziemia Goszen jaśnieje w Bożym pokoju (Wj 8:19–23)');
html = html.replace(/Czytanie: Wj 7:1–25/g, 'Czytanie: Wj 8:1–32');
html = html.replace(/Czytanie: Wj 7/g, 'Czytanie: Wj 8:1–32');
html = html.replace(/\(Wj 7:1–25\)/g, '(Wj 8:1–32)');
html = html.replace(/\(Wj 7\)/g, '(Wj 8)');
html = html.replace(/7\. rozdziału/g, '8. rozdziału');

// 4. Zanim otworzysz Biblię
const zanimRegex = /<!-- ZANIM OTWORZYSZ BIBLIĘ \(wzór Dnia 1\) -->[\s\S]*?<\/article>/;
const newZanim = `<!-- ZANIM OTWORZYSZ BIBLIĘ (wzór Dnia 1) -->
      <article class="kc-card">
        <div class="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <i class="fa-solid fa-compass"></i>
          <span>Zanim otworzysz Biblię</span>
        </div>
        <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Podróż przez 66 Ksiąg Pisma Świętego
        </h2>
        <div class="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-300">
          <p>
            Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie <strong>66 ksiąg Biblii</strong> — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Pisma.
          </p>
          <p>
            Dziś jest <strong class="text-white">Dzień 39</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 8:1–32</strong>.
          </p>
          <p>
            Zanim przeczytasz rozważanie, otwórz Biblię i przeczytaj cały fragment. Komentarz ma prowadzić do Słowa, a nie je zastępować.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=8" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
            <i class="fa-solid fa-book-bible"></i>
            <span>Czytaj Wj 8:1–32</span>
          </a>
        </div>
      </article>`;
html = html.replace(zanimRegex, newZanim);

// 5. Tekst Pisma Świętego
const scriptureRegex = /<!-- SCRIPTURE SECTION [^>]*-->[\s\S]*?<\/section>/;
const newScripture = `<!-- SCRIPTURE SECTION (Wj 8:1–32) -->
    <section class="kc-card">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-brand-line">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
            <i class="fa-solid fa-book-bible"></i>
          </span>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">TEKST PISMA ŚWIĘTEGO</h2>
            <p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 8:1–32</p>
          </div>
        </div>
        <a href="/mojabiblia?book=EXO&chapter=8" class="text-xs text-amber-400 hover:text-amber-300 font-serif flex items-center gap-1.5 transition">
          <span>Otwórz w MojaBiblia Interlinearnej</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

      <div class="kc-prose-reading">
${versesHtml}
      </div>
    </section>`;
html = html.replace(scriptureRegex, newScripture);

// 6. Kody Stronga
const strongRegex = /<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->[\s\S]*?<\/section>/;
const newStrong = `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
    <section class="kc-card">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
        <i class="fa-solid fa-spell-check text-amber-400"></i>
        <span>Klucze Językowe & Kody Stronga (Wj 8)</span>
      </div>
      <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
        Poniższe terminy hebrajskie stanowią osnowę teologiczną 8. rozdziału Księgi Wyjścia:
      </p>
      <div class="flex flex-wrap gap-2">
        <span class="strong-chip"><span class="strong-id">H6854</span> <span class="strong-orig">צְפַרְדֵּעַ (cfadea)</span> — żaba — uderzenie w kult bóstwa płodności Heket (Wj 8:2)</span>
        <span class="strong-chip"><span class="strong-id">H3654</span> <span class="strong-orig">כֵּן (ken / kinnim)</span> — wszy / komary z prochu ziemi (Wj 8:16–17)</span>
        <span class="strong-chip"><span class="strong-id">H676</span> <span class="strong-orig">אֶצְבַּע (ecba)</span> — palec: „To jest palec Boży” (Wj 8:19)</span>
        <span class="strong-chip"><span class="strong-id">H6157</span> <span class="strong-orig">עָרֹב (arow)</span> — roje much / gzów niszczących Egipt (Wj 8:21)</span>
        <span class="strong-chip"><span class="strong-id">H6304</span> <span class="strong-orig">פְּדוּת (pedut)</span> — wykupienie / oddzielenie ziemi Goszen (Wj 8:23)</span>
        <span class="strong-chip"><span class="strong-id">H3513</span> <span class="strong-orig">כָּבַד (kawad)</span> — zatwardzić serce / uczynić ciężkim (Wj 8:15, 32)</span>
      </div>
    </section>`;
html = html.replace(strongRegex, newStrong);

// 7. Egzegeza 4 części
const exegesisRegex = /<!-- THEOLOGICAL EXEGESIS \(4 CZĘŚCI\) -->[\s\S]*?<\/section>\s*<!-- ── JEZUS W CENTRUM/;
const newExegesis = `<!-- THEOLOGICAL EXEGESIS (4 CZĘŚCI) -->
    <section class="kc-card space-y-6">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-feather-pointed"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
          <p class="text-xs text-zinc-400">Cztery części studium Wj 8:1–32 (32 punkty analityczne)</p>
        </div>
      </div>

      <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">

        <!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            DRUGA PLAGA: INWAZJA ŻAB I MODLITWA WSTAWIENNICZA (WJ 8:1–15)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Niezmienne poselstwo suwerena (8:1):</strong> Bóg posyła Mojżesza z tą samą formułą: „Wypuść mój lud, aby mi służył”. Celem wolności jest kult i posłuszeństwo Stwórcy.</p>
            <p><strong>2. Uderzenie w kult bogini Heket (8:2):</strong> Żaby były symbolem bogini płodności. Bóg obraca pogańskiego bożka w źródło odrazy i zgnilizny.</p>
            <p><strong>3. Inwazja na strefy intymne (8:3–4):</strong> Żaby wdzierają się do sypialni, łóżek, pieców i dzież na ciasto, uniemożliwiając odpoczynek i posiłek.</p>
            <p><strong>4. Gest laski Aarona (8:5–6):</strong> Wyciągnięta laska nad wody wywołuje plagę — natura słucha głosu Pana, a nie pogańskich zaklęć.</p>
            <p><strong>5. Pułapka czarowników (8:7):</strong> Magowie powtarzają znak, lecz potrafią jedynie pomnożyć udrękę, nie potrafiąc usunąć ani jednej żaby.</p>
            <p><strong>6. Pierwsza prośba faraona o modlitwę (8:8):</strong> Tyran ucieka się do wstawiennictwa pasterzy: „Módlcie się do PANA, aby oddalił żaby”.</p>
            <p><strong>7. Odpowiedź tyrana: „Jutro” (8:9–10):</strong> Faraon woli spędzić kolejną noc z płazami, byle odsunąć moment pełnej kapitulacji przed Bogiem.</p>
            <p><strong>8. Modlitwa Mojżesza (8:11–12):</strong> Prorok żarliwie woła do Pana, szukając objawienia Bożej chwały.</p>
            <p><strong>9. Stosy martwych żab i smród (8:13–14):</strong> Po zdemaskowaniu bożków pozostaje jedynie duchowy i fizyczny smród zepsucia.</p>
            <p><strong>10. Ulga i powrót do buntu (8:15):</strong> Gdy nadeszło wytchnienie, faraon zatwardził swe serce — to portret nieszczerej, kryzysowej religijności.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            TRZECIA PLAGA: PROCH ZIEMI I WYZNANIE CZAROWNIKÓW (WJ 8:16–19)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Sąd bez ostrzeżenia (8:16a):</strong> Trzecia plaga uderza nagle jako wyrok za odrzucenie poprzednich napomnień.</p>
            <p><strong>12. Uderzenie w bóstwo Geba (8:16b–17):</strong> Pył ziemi staje się wszami i komarami, obsiadając ludzi i bydło w całym Egipcie.</p>
            <p><strong>13. Paraliż świątyń pogańskich (8:17):</strong> Skalanie ciał kapłanów uniemożliwiło im sprawowanie pogańskich obrzędów.</p>
            <p><strong>14. Totalna bezsilność magii (8:18):</strong> Czarownicy próbowali uczynić to samo, lecz nie zdołali stworzyć życia z prochu.</p>
            <p><strong>15. Świadectwo magów: „To jest palec Boży!” (8:19a):</strong> Okultyści uznają absolutną wyższość Stwórcy nad sztukami tajemnymi.</p>
            <p><strong>16. Ślepota tyranny (8:19b):</strong> Nawet świadectwo własnych kapłanów nie kruszy pychy monarchy.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            CZWARTA PLAGA: CHMARY MUCH I ROZRÓŻNIENIE GOSZEN (WJ 8:20–24)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Poranny apel nad Nilem (8:20):</strong> Bóg ponownie staje na drodze faraona o świcie, wzywając do upamiętania.</p>
            <p><strong>18. Inwazja rojowisk (8:21):</strong> Sąd uderza w kult bóstwa Khepri — żądlące owady dewastują domy i uprawy.</p>
            <p><strong>19. Cudowne wyodrębnienie Goszen (8:22):</strong> Kraina zamieszkana przez Izraelitów zostaje całkowicie osłonięta przed plagą.</p>
            <p><strong>20. Zasada odkupienia — Pedut (8:23):</strong> Boża ochrona wynika z przymierza i łaski, nie z ludzkich zasług.</p>
            <p><strong>21. Zniszczenie Egiptu (8:24):</strong> Ziemia zostaje doszczętnie spustoszona przez roje much.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            PUŁAPKI KOMPROMISU I PONOWNY BUNT (WJ 8:25–32)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>22. Pierwszy kompromis: „Ofiarujcie w tej ziemi” (8:25):</strong> Wróg proponuje religijność w ramach pogańskiego systemu.</p>
            <p><strong>23. Odmowa profanacji (8:26):</strong> Mojżesz odrzuca kompromis — ofiara z ubóstwianych zwierząt wywołałaby ukamienowanie.</p>
            <p><strong>24. Trzy dni drogi na pustynię (8:27):</strong> Prawdziwy kult wymaga całkowitego wyjścia z niewoli grzechu.</p>
            <p><strong>25. Drugi kompromis: „Tylko nie za daleko” (8:28a):</strong> Pokusa letniości i pozostawania blisko starych kompromisów.</p>
            <p><strong>26. Prośba o wstawiennictwo (8:28b):</strong> Tyran szuka ulgi bez pokuty serca.</p>
            <p><strong>27. Przestroga przed obłudą (8:29):</strong> Mojżesz wzywa do uczciwości przed obliczem Boga.</p>
            <p><strong>28. Doskonałe oczyszczenie (8:30–31):</strong> Na modlitwę Mojżesza nie pozostaje ani jedna mucha.</p>
            <p><strong>29. Ponowne zatwardzenie serca (8:32):</strong> Faraon łamie słowo, ściągając na siebie jeszcze większy sąd.</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ── JEZUS W CENTRUM`;
html = html.replace(exegesisRegex, newExegesis);

// 8. Tytuł Quizu i pytania
html = html.replace(/20 Pytań z [^<]*/g, '20 Pytań z Wj 8:1–32 (Sprawdź swoją wiedzę)');
html = html.replace(/Po przeczytaniu [A-ZĄĆĘŁŃÓŚŹŻ]+ \d+/g, 'Po przeczytaniu Wj 8');
html = html.replace(/Po przeczytaniu Wj \d+/g, 'Po przeczytaniu Wj 8');
html = html.replace(/Po przeczytaniu Wj 7/g, 'Po przeczytaniu Wj 8');
html = html.replace(/Przeczytaj cały fragment <a href="\/mojabiblia\?book=[A-Z0-9]+&chapter=\d+"/g, 'Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=8"');

// 9. Przyciski ukończenia i klucze zapisu
html = html.replace(/completeDay\d+\(\)/g, 'completeDay39()');
html = html.replace(/function completeDay\d+\(\)/g, 'function completeDay39()');
html = html.replace(/window\.completeDay\d+ =/g, 'window.completeDay39 =');
html = html.replace(/Oznacz Dzień \d+ jako ukończony/g, 'Oznacz Dzień 39 jako ukończony');
html = html.replace(/Dzień \d+ ukończony/g, 'Dzień 39 ukończony');
html = html.replace(/const DAY_KEY = 'kc_day\d+';/g, "const DAY_KEY = 'kc_day39';");
html = html.replace(/kc_day\d+_quiz/g, 'kc_day39_quiz');
html = html.replace(/kc_day\d+_completed/g, 'kc_day39_completed');
html = html.replace(/kc_day\d+_learned/g, 'kc_day39_learned');
html = html.replace(/kc_day\d+_decision/g, 'kc_day39_decision');
html = html.replace(/kc_day\d+_chk_/g, 'kc_day39_chk_');

// 10. Linki udostępniania i czyszczenie Dzień 38 poza linkiem nawigacyjnym
html = html.replace(/Dzie%C5%84%2038/g, 'Dzie%C5%84%2039');
html = html.replace(/kurscodzienny%2Fdzien-38/g, 'kurscodzienny%2Fdzien-39');
html = html.replace(/share=dzien-38/g, 'share=dzien-39');
html = html.replace(/share=dzien-39&v=7:17/g, 'share=dzien-39&v=8:19');
html = html.replace(/share=dzien-39&(?:amp;)?v=[^\d"]*7:/g, 'share=dzien-39&v=8:');

// Podmiana sekcji Jutro w Dniu 39 (zapowiedź Dnia 40)
const jutro40 = `<!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 9 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 40 — POMÓR BYDŁA, WRZODY I GRAD (Wj 9:1–35)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Dzień 40: Księga Wyjścia 9:1–35. Kolejne trzy plagi uderzają w gospodarkę i zdrowie Egiptu. Bóg oznajmia faraonowi: „Właśnie po to cię zachowałem, aby okazać na tobie moją moc”. Ognisty grad niszczący pola i Boże panowanie nad naturą.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
          <span>Dostępne od północy (9 listopada)</span>
        </span>
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Spis kursu
        </a>
      </div>
    </section>`;

html = html.replace(/<!-- ── ZAPOWIEDŹ: JUTRO \(wzór Dnia 1\) -->[\s\S]*?<\/section>/, jutro40);

// Usuwamy wszelkie komentarze Dzień 38
html = html.replace(/<!-- LESSON BODY CONTENT \(Dzień \d+[^)]*\) -->/, '<!-- LESSON BODY CONTENT (Dzień 39, 08.11.2026) -->');

// Sprawdzamy błędy strażnika dla Dnia 39
const bledy = sprawdzLekcje(html, 39);
if (bledy.length > 0) {
  console.error('❌ Wykryte błędy Strażnika Lekcji:');
  for (const b of bledy) console.error('   -', b);
  throw new Error(`Strażnik Lekcji zgłosił ${bledy.length} błędów w generowanym HTML.`);
}

console.log('✅ Strażnik Lekcji potwierdził 100% spójności dla Dnia 39 (0 błędów)!');

// Zapisujemy we wszystkich 4 ścieżkach
const paths = [
  'akademia/kurscodzienny/dzien-39.html',
  'akademia/kurscodzienny/dzien-39/index.html',
  'kursy/kurscodzienny/dzien-39.html',
  'kursy/kurscodzienny/dzien-39/index.html'
];

for (const p of paths) {
  const fullP = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(fullP), { recursive: true });
  fs.writeFileSync(fullP, html, 'utf8');
  console.log(`✅ Zapisano ścieżkę: ${p}`);
}

// Mirror do .pages-release oraz Desktop/@ICC/LUMINA
const mirrors = [
  path.join(ROOT, '.pages-release/akademia/kurscodzienny/dzien-39.html'),
  path.join(ROOT, '.pages-release/akademia/kurscodzienny/dzien-39/index.html'),
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-39.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-39/index.html'
];

for (const m of mirrors) {
  try {
    fs.mkdirSync(path.dirname(m), { recursive: true });
    fs.writeFileSync(m, html, 'utf8');
    console.log(`✅ Zsynchronizowano mirror: ${m}`);
  } catch (e) {
    console.warn(`⚠️ Błąd synchronizacji mirrora ${m}:`, e.message);
  }
}

console.log('🎉 Perfekcyjne wdrożenie lekcji Dnia 39 zakończone sukcesem!');
