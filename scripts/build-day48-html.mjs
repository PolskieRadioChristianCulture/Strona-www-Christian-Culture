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
const MEMORY_VERSE = '„Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.” — Księga Wyjścia 18:21 (UBG)';
const MEMORY_VERSE_QUOTE = 'Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką.';
const THEME = 'Osiemnasty rozdział Księgi Wyjścia to ponadczasowy traktat o biblijnej mądrości organizacyjnej, pokorze przywódczej i budowaniu zdrowej wspólnoty wiary. Po zwycięstwie nad Amalekiem Izrael dociera pod górę Boga, gdzie Mojżesza odwiedza jego teść Jetro, kapłan Midianu, przyprowadzając żonę Seforę oraz dwóch synów: Gerszoma i Eliezera. Na wieść o wielkich dziełach Bożych Jetro wyznaje wiarę w najwyższego PANA i składa Mu ofiary przymierza wraz z Aaronem i starszyzną. Nazajutrz jednak Jetro dostrzega paraliżujący problem: Mojżesz samotnie od rana do wieczora rozsądza spory całego ludu. Diagnoza mądrego teścia jest bezwzględna: „Niedobra to rzecz, którą czynisz. Zamęczycie się i ty, i ten lud... Sam jej nie podołasz”. Jetro przedstawia genialną reformę: Mojżesz ma zachować rolę orędownika i nauczyciela Bożych praw, a bieżące sądownictwo przekazać zaufanym mężom dzielnym, bogobojnym, prawdomównym i nienawidzącym chciwości, ustanowionym nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami. Mojżesz w głębokiej pokorze przyjmuje radę i wdraża ją w życie, przywracając pokój i ład w obozie. W świetle Nowego Testamentu historia ta zapowiada organizację Kościoła apostolskiego (Dz 6; 1 Tm 3; Tt 1) oraz wskazuje na Chrystusa — Jedynego doskonałego Pośrednika, który obdarza swoje Ciało różnorodnymi darami łaski i powołuje nas do wzajemnego niesienia ciężarów!';

console.log('🚀 Rozpoczynam budowanie czystego HTML Dnia 48...');

// Pobieramy wersety z pliku UBG
const exo18Path = path.join(process.cwd(), 'data/bible/ubg-2025/EXO-018.json');
const exo18Data = JSON.parse(fs.readFileSync(exo18Path, 'utf8'));

const readingHtml = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 18:1–12 — Przybycie Jetry, świadectwo Mojżesza, wyznanie wiary i wspólna ofiara przed Bogiem</h3></div>',
  ...exo18Data.verses.filter(v => v.number <= 12).map(v => `<p><span class="verse-num">18:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 18:13–27 — Przeciążenie Mojżesza, diagnoza i rada Jetry, wybór sędziów i pokój ludu</h3></div>',
  ...exo18Data.verses.filter(v => v.number >= 13).map(v => `<p><span class="verse-num">18:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// Pobieramy szablon z Dnia 47
const template47Path = path.join(process.cwd(), 'akademia/kurscodzienny/dzien-47.html');
let html = fs.readFileSync(template47Path, 'utf8');

// 1. Meta i nagłówek
html = html.replace(/<title>Dzień 47: [^<]+<\/title>/, `<title>Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html = html.replace(/content="Dzień 47 Kursu Codziennego[^"]+"/, `content="Dzień ${DAY_NUM} Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}"`);
html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-48">`);
html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-48">`);
html = html.replace(/property="og:title" content="Dzień 47: [^"]+"/, `property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat"`);
html = html.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${SUBTITLE}"`);
html = html.replace(/kc_day_47_woda_ze_skaly_i_zwyciestwo_nad_amalekiem\.jpg\?v=\d+/g, `kc_day_48_rady_jetry_i_wybor_sedziow.jpg?v=20261117`);

// Social media share links
html = html.replace(/kurscodzienny%2Fdzien-47/g, `kurscodzienny%2Fdzien-48`);
html = html.replace(/share=dzien-47&amp;v=Wj%2017%3A6/g, `share=dzien-48&amp;v=Wj%2018%3A21`);
html = html.replace(/share=dzien-47&v=Wj 17:6/g, `share=dzien-48&v=Wj 18:21`);
html = html.replace(/Dzie%C5%84%2047%3A[^"']+/g, encodeURIComponent(`Dzień 48: ${TITLE} (${READING})`));

// 2. Nawigacja
// Breadcrumb
html = html.replace(/<span class="text-amber-400 font-semibold">Dzień 47<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 48</span>`);

// Pasek nawigacji górnej
const oldNavBlock = `<a href="/akademia/kurscodzienny/dzien-46" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 46</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-48" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition min-h-[44px]">
          <span>Dzień 48 (Wtorek) →</span>
        </a>`;

const newNavBlock = `<a href="/akademia/kurscodzienny/dzien-47" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 47</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-49" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition min-h-[44px]">
          <span>Dzień 49 (Środa) →</span>
        </a>`;

if (html.includes(oldNavBlock)) {
  html = html.replace(oldNavBlock, newNavBlock);
} else {
  html = html.replace(/<a href="\/akademia\/kurscodzienny\/dzien-46"[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-48"[\s\S]*?<\/a>/, newNavBlock);
}

// 3. Hero & Plakietki
html = html.replace(/<span>Dzień 47 z 2009<\/span>/g, `<span>Dzień 48 z 2009</span>`);
html = html.replace(/Dziś jest <strong class="text-white">Dzień 47<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 17:1–16<\/strong>\./g, `Dziś jest <strong class="text-white">Dzień 48</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 18:1–27</strong>.`);
html = html.replace(/DZIEŃ 47/g, `DZIEŃ 48`);
html = html.replace(/16 LISTOPADA 2026 • PONIEDZIAŁEK/g, `17 LISTOPADA 2026 • WTOREK`);
html = html.replace(/15 LISTOPADA 2026 • NIEDZIELA/g, `17 LISTOPADA 2026 • WTOREK`);
html = html.replace(/WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM — JAHWE NISSI/g, TITLE);
html = html.replace(/Pragnienie ludu w Refidim, uderzona laska Mojżesza na Horebie, strumienie żywej wody, bitwa z Amalekiem i ręce podtrzymywane przez Aarona i Chura \(Wj 17:1–16\)/g, SUBTITLE);
html = html.replace(/alt="Dzień 47:[^"]*"/, `alt="Dzień 48: ${TITLE} (${READING})"`);
html = html.replace(/Czytanie: Wj 17:1–16/g, `Czytanie: ${READING}`);
html = html.replace(/Czytanie: Wj 17/g, `Czytanie: Wj 18`);

// Werset do zapamiętania w Hero
html = html.replace(
  /„Oto stanę przed tobą tam, na skale na Horebie, i uderzysz w skałę, a wypłynie z niej woda, którą lud będzie pił\. I Mojżesz uczynił tak na oczach starszych Izraela\.”/g,
  MEMORY_VERSE_QUOTE
);
html = html.replace(/—\s*Księga Wyjścia 17:6 \(UBG\)/g, `— Księga Wyjścia 18:21 (UBG)`);
html = html.replace(/Wj 17:6/g, `Wj 18:21`);

// Tekst dla schowka
html = html.replace(
  /navigator\.clipboard\.writeText\('[^']+'\)/,
  `navigator.clipboard.writeText('${MEMORY_VERSE.replace(/'/g, "\\'")}')`
);

// Myśl przewodnia
html = html.replace(
  /Siedemnasty rozdział Księgi Wyjścia to dramatyczna i pełna chwały lekcja o Bogu, który gasi pragnienie[\s\S]*?wody życia na wieki!/,
  THEME
);

// 4. Zanim otworzysz Biblię (Intro)
const introText = `<p>Osiemnasty rozdział Księgi Wyjścia prowadzi nas pod świętą górę Boga (Horeb/Synaj), w miejsce, gdzie przed laty Mojżesz pasł owce Jetry i ujrzał płonący krzew. Po dramatycznych cudach wyprowadzenia z Egiptu, mannie na pustyni Sin i zwycięstwie nad Amalekiem w Refidim, następuje chwila wytchnienia i głębokiego uporządkowania życia społeczności. Do obozu przybywa teść Mojżesza Jetro, kapłan Midianu, przyprowadzając żonę Mojżesza Seforę oraz dwóch synów: Gerszoma i Eliezera.</p>
          <p>Spotkanie to rozpoczyna się od wzruszających gestów szacunku, braterskiego uścisku i złożenia świadectwa o wielkich dziełach PANA. Jetro z głębi serca wyznaje wiarę w Boga jedynego, błogosławi PANA i składa Mu ofiary przymierza. Jednak kolejny dzień odsłania cichy, destrukcyjny problem: Mojżesz samotnie, bez chwili wytchnienia, próbuje sądzić i rozwiązywać wszystkie problemy gigantycznego narodu od świtu do nocy. Tłum ludzi marnieje w zniecierpliwieniu, a wódz Izraela stoi na krawędzi wyczerpania.</p>
          <p>Jak rozpoznać granicę między świętą gorliwością a zgubnym pracoholizmem i pychą samowystarczalności? Dlaczego Bóg posłużył się mądrością teścia spoza narodu wybranego, by przeprowadzić kluczową reformę sądownictwa? Jakie cechy charakteru muszą wyróżniać tych, którym powierza się przywództwo we wspólnocie? I wreszcie — jak model Jetry i pokora Mojżesza kierują nasz wzrok ku Chrystusowi, który buduje swój Kościół jako harmonijne Ciało wielu współpracujących członków?</p>`;

html = html.replace(
  /(<section class="kc-card">\s*<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">\s*<i class="fa-solid fa-compass text-amber-400"><\/i>\s*<span>Zanim otworzysz Biblię<\/span>\s*<\/div>\s*<h3[^>]*>[\s\S]*?<\/h3>\s*<div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">)[\s\S]*?(<\/div>\s*<\/section>)/,
  `$1\n          ${introText}\n        $2`
);

// 5. Tekst Pisma Świętego
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 17:1–16/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=17/g, `/mojabiblia?book=EXO&chapter=18`);
html = html.replace(/Czytaj Wj 17:1–16/g, `Czytaj ${READING}`);
html = html.replace(/Czytaj Wj 17/g, `Czytaj Wj 18`);

html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">\n        ${readingHtml}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`
);

// 6. Kody Stronga
const strongChips = `<span class="strong-chip"><span class="strong-id">H3503</span> <span class="strong-orig">יִתְרוֹ (Jitro)</span> — „jego dostojność / obfitość” — teść Mojżesza, mędrzec i kapłan Midianu (Wj 18:1)</span>
          <span class="strong-chip"><span class="strong-id">H3548</span> <span class="strong-orig">כֹּהֵן מִדְיָן (Kohen Midian)</span> — kapłan Midianu, człowiek z zewnątrz, przez którego Bóg wnosi ład (Wj 18:1)</span>
          <span class="strong-chip"><span class="strong-id">H2428</span> <span class="strong-orig">אַנְשֵׁי־חַיִל (Anszej chajil)</span> — mężowie dzielni, prawi, o niezłomnym kręgosłupie moralnym (Wj 18:21, 25)</span>
          <span class="strong-chip"><span class="strong-id">H3373</span> <span class="strong-orig">יִרְאֵי אֱלֹהִים (Jirej Elohim)</span> — bojący się Boga, nieugięci wobec ludzkich nacisków i strachu (Wj 18:21)</span>
          <span class="strong-chip"><span class="strong-id">H571</span> <span class="strong-orig">אַנְשֵׁי אֱמֶת (Anszej emet)</span> — mężowie prawdomówni, ludzie autentycznej prawdy i rzetelności (Wj 18:21)</span>
          <span class="strong-chip"><span class="strong-id">H1215</span> <span class="strong-orig">שֹׂנְאֵי בָצַע (Sonei waca)</span> — nienawidzący chciwości i nieprawego zysku, nieprzekupni (Wj 18:21)</span>
          <span class="strong-chip"><span class="strong-id">H5034</span> <span class="strong-orig">נָבֹל תִּבֹּל (Nabol tibol)</span> — zwiędnąć, uschnąć jak liść — tragiczny skutek przeciążenia (Wj 18:18)</span>
          <span class="strong-chip"><span class="strong-id">H8269</span> <span class="strong-orig">שָׂרִים (Sarim)</span> — przywódcy, przełożeni nad tysiącami, setkami, pięćdziesiątkami i dziesiątkami (Wj 18:21)</span>
          <span class="strong-chip"><span class="strong-id">H7965</span> <span class="strong-orig">שָׁלוֹם (Szalom)</span> — pełnia pokoju, harmonii i bezpieczeństwa — owoc mądrego porządku (Wj 18:23)</span>`;

html = html.replace(/Klucze Językowe & Kody Stronga \(Wj 17:1–16\)/g, `Klucze Językowe & Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie stanowią osnowę teologiczną 17\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie stanowią osnowę teologiczną 18. rozdziału Księgi Wyjścia (rady Jetry, mądrość delegowania, cztery cnoty przywódcy oraz ustanowienie sędziów w Izraelu):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 7. Egzegeza & Formacja Teologiczna (5 części, 45 punktów)
html = html.replace(/Pięć części studium Wj 17:1–16 \(40 punktów analitycznych\)/g, `Pięć części studium ${READING} (45 punktów analitycznych)`);

const exegesis5Parts = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            SPOTKANIE POD GÓRĄ BOGA, POWRÓT SEFORY I ŚWIADECTWO WYBAWIENIA (WJ 18:1–8)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Tożsamość Jetry (18:1):</strong> Jetro (zwany także Reuelem) jest kapłanem Midianitów — potomków Abrahama z Ketury (Rdz 25:1–2). Przechowywał wiarę w Boga Najwyższego na pustyni Synaj.</p>
            <p><strong>2. Wieść o wyjściu z Egiptu (18:1):</strong> Sława Bożego sądu nad faraonem i rozdzielenia Morza Czerwonego przekracza granice narodów, docierając do obozowisk koczowników.</p>
            <p><strong>3. Powrót żony i synów (18:2):</strong> Mojżesz odesłał wcześniej rodzinę do Midianu na czas groźnych plag w Egipcie. Teraz Bóg jednoczy rozproszoną rodzinę.</p>
            <p><strong>4. Imię Gerszom jako pamięć wygnania (18:3):</strong> Hebrajskie <em>Gerszom</em> („byłem przybyszem w obcej ziemi”) upamiętnia 40 lat pokornego pasterzowania na obczyźnie.</p>
            <p><strong>5. Imię Eliezer jako hymn ocalenia (18:4):</strong> <em>Eliezer</em> („Mój Bóg jest pomocą”) głosi, że to Bóg ocalił Mojżesza od miecza mściwego tyrana.</p>
            <p><strong>6. Obozowisko pod Górą Boga (18:5):</strong> Horeb staje się miejscem wypełnienia obietnicy z krzewu ognistego: „Gdy wyprowadzisz lud z Egiptu, będziecie służyć Bogu na tej górze” (Wj 3:12).</p>
            <p><strong>7. Szacunek i kultura relacji (18:7):</strong> Wódz Izraela kłania się przed teściem, całuje go i zaprasza do namiotu. Prawdziwa wielkość duchowa wyraża się w pokorze i wdzięczności.</p>
            <p><strong>8. Szczere świadectwo o trudzie i łasce (18:8):</strong> Mojżesz nie przemilcza trudów wędrówki, lecz przypisuje całą chwałę PANU, który wybawił lud z każdej opresji.</p>
            <p><strong>9. Ewangelizacyjna moc faktów (18:8):</strong> Prawdziwe świadectwo opowiada o konkretnych faktach Bożej interwencji, wzbudzając wiarę w sercach słuchaczy.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            RADOŚĆ, WYZNANIE WIARY I OFIARA PRZYMIERZA JETRY (WJ 18:9–12)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Radość z Bożego dobra (18:9):</strong> Jetro szczerze weseli się ze zwycięstwa Izraela — brak w nim plemiennej zawiści czy pogańskiej niechęci.</p>
            <p><strong>11. Błogosławieństwo PANA (18:10):</strong> Uroczysta formuła liturgiczna błogosławiąca Boga za skruszenie jarzma egipskiej niewoli.</p>
            <p><strong>12. Wyznanie supremacji Boga Izraela (18:11):</strong> „Teraz wiem, że PAN jest większy od wszystkich bogów” — kapłan Midianu uznaje wyłączny autorytet Jahwe.</p>
            <p><strong>13. Sąd nad zuchwałością pychy (18:11):</strong> Egipcjanie zginęli tą samą bronią, którą uciskali innych — woda Nilu stała się wodą Morza Czerwonego.</p>
            <p><strong>14. Całopalenie i ofiary krwawe (18:12):</strong> Złożenie ofiar <em>ola</em> i <em>zewachim</em> przez Jetrę jako akt pełnego oddania i komunii z Najwyższym.</p>
            <p><strong>15. Braterska uczta z Aaronem i starszyzną (18:12):</strong> Przywódcy Izraela łamią chleb z gościem, pieczętując więź przymierza.</p>
            <p><strong>16. Spożywanie chleba „przed obliczem Boga” (18:12):</strong> Świadomość Bożej obecności (<em>lifnej ha-Elohim</em>) uświęca każdy posiłek i relację braterską.</p>
            <p><strong>17. Zapowiedź powołania pogan (18:12):</strong> Uczta ta jest profetycznym znakiem czasów Nowego Przymierza, gdy narody zbiegną się do światła Zbawiciela.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            SAMOTNY SĘDZIA — KRYZYS PRZECIĄŻENIA I DIAGNOZA JETRY (WJ 18:13–18)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>18. Sądzenie od świtu do nocy (18:13):</strong> Monopol decyzyjny paraliżuje Mojżesza i wycieńcza stojących w palącym słońcu ludzi.</p>
            <p><strong>19. Oczy mentora z zewnątrz (18:14):</strong> Jetro natychmiast dostrzega strukturalny błąd, do którego Mojżesz zdążył się przyzwyczaić.</p>
            <p><strong>20. Pytanie demaskujące centralizm (18:14):</strong> „Dlaczego ty siedzisz sam, a cały lud stoi przed tobą?”.</p>
            <p><strong>21. Gorliwość bez granic (18:15):</strong> Mojżesz szczerze chce służyć Bogu, ale myli powołanie z osobistą kontrolą każdego detalu.</p>
            <p><strong>22. Łączenie ról prawodawcy i sędziego (18:16):</strong> Dźwiganie wszystkich spraw prawnych przerasta możliwości jednego człowieka.</p>
            <p><strong>23. Odważna diagnoza — „Niedobra to rzecz” (18:17):</strong> Pobożne intencje nie usprawiedliwiają błędnej, niszczącej organizacji.</p>
            <p><strong>24. Groźba uwiądu — nabol tibol (18:18):</strong> Hebrajski termin oznacza „zwiędnąć jak liść”. Przeciążenie niszczy zdrowie i ducha.</p>
            <p><strong>25. Cierpienie całego zgromadzenia (18:18):</strong> Wypalony lider nie jest w stanie zapewnić pokoju i sprawiedliwości ludowi.</p>
            <p><strong>26. Pokora uznania ludzkiej skończoności (18:18):</strong> „Sam jej nie podołasz” — nikt poza Bogiem nie jest wszechmocny.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            PROJEKT ZDECENTRALIZOWANEJ SŁUŻBY I CZTERY CNOTY PRZYWÓDCY (WJ 18:19–23)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>27. Pokorna mądrość doradcy (18:19):</strong> Jetro proponuje plan, poddając go pod rozstrzygnięcie Boga.</p>
            <p><strong>28. Kluczowe zadanie — wstawiennictwo (18:19):</strong> Mojżesz ma zanieść najważniejsze sprawy przed Boży tron modlitwy.</p>
            <p><strong>29. Rola nauczyciela i formatora (18:20):</strong> Nauczanie ustaw i dróg postępowania jest trwalsze niż ciągłe rozstrzyganie sporów.</p>
            <p><strong>30. Anszej chajil — mężowie dzielni (18:21):</strong> Ludzie o niezłomnym kręgosłupie moralnym, odwadze i życiowej zaradności.</p>
            <p><strong>31. Jirej Elohim — bojący się Boga (18:21):</strong> Sędziowie kierujący się sprawiedliwością Bożą, nieprzekupni i wolni od ludzkiego strachu.</p>
            <p><strong>32. Anszej emet — ludzie prawdy (18:21):</strong> Autentyczni, transparentni, brzydzący się fałszem i kłamstwem.</p>
            <p><strong>33. Sonei waca — nienawidzący chciwości (18:21):</strong> Liderzy wolni od pożądania brudnego zysku i partykularnych korzyści.</p>
            <p><strong>34. Struktura subsydiarności (18:21–22):</strong> Podział na tysiące, setki, pięćdziesiątki i dziesiątki gwarantuje szybką pomoc na miejscu.</p>
            <p><strong>35. Obietnica wytrwania i pokoju (18:23):</strong> Odpowiedni podział ról przynosi siłę liderowi i pokój (<em>szalom</em>) całemu ludowi.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            POKORA MOJŻESZA, WDROŻENIE REFORMY I KLUCZE JĘZYKOWE (WJ 18:24–27)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>36. Pokora wielkiego proroka (18:24):</strong> Mojżesz nie obraża się na teścia, lecz natychmiast wdraża całą radę w życie.</p>
            <p><strong>37. Powszechny wybór liderów (18:25):</strong> Wybór mężów z całego Izraela oparty wyłącznie na etycznych i duchowych kwalifikacjach.</p>
            <p><strong>38. Realne zaufanie i delegowanie (18:26):</strong> Mojżesz pozwala sędziom decydować, przyjmując do siebie tylko najtrudniejsze sprawy.</p>
            <p><strong>39. Płynność i ład społeczny (18:26):</strong> Znikają kolejki, a sprawiedliwość dociera do każdego namiotu.</p>
            <p><strong>40. Szlachetne pożegnanie (18:27):</strong> Jetro wraca do swej ziemi, pozostawiając trwałe owoce mądrości.</p>
            <p><strong>41. Kohen Midian (כֹּהֵן מִדְיָן):</strong> Bóg posługuje się mądrością człowieka z zewnątrz ku zbudowaniu swego ludu.</p>
            <p><strong>42. Anszej chajil (אַנְשֵׁי־חַיִל):</strong> Męstwo moralne jako fundament stabilnego przywództwa.</p>
            <p><strong>43. Jirej Elohim (יִרְאֵי אֱלֹהִים):</strong> Bojaźń Boża jedynym lekarstwem na korupcję władzy.</p>
            <p><strong>44. Anszej emet (אַנְשֵׁי אֱמֶת):</strong> Prawdomówność i integralność serca.</p>
            <p><strong>45. Sonei waca (שֹׂנְאֵי בָצַע):</strong> Nienawiść do nieprawego zysku warunkiem bezstronnego sądu.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis5Parts}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 8. Jezus w Centrum
const jesusCenterContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Chrystus — Doskonały Pośrednik, Budowniczy Ciała i Dawca Odpoczynku
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Chrystus — Jedyny Doskonały Pośrednik Nowego Przymierza (1 Tm 2:5; Hbr 8:6):</strong> Podczas gdy Mojżesz uginał się pod ciężarem wstawiennictwa za ludem i musiał dzielić się władzą, Jezus Chrystus jest Jedynym Pośrednikiem między Bogiem a ludźmi, który wziął na Siebie cały ciężar naszych grzechów i wstawia się za nami nieustannie przed tronem Ojca.
          </p>
          <p>
            <strong>2. Powołanie Siedmiu Diakonów w Dziejach Apostolskich (Dz 6:1–7):</strong> Wzór Jetry i Mojżesza staje się bezpośrednią inspiracją dla apostołów w Jerozolimie. W obliczu przeciążenia powołują siedmiu mężów pełnych Ducha i mądrości do obsługi stołów, aby sami mogli trwać w modlitwie i posłudze Słowa.
          </p>
          <p>
            <strong>3. Jedno Ciało i Różnorodność Darów Łaski (1 Kor 12:12–28; Rz 12:4–8):</strong> Bóg nie powołał jednego człowieka do spełniania wszystkich funkcji. Chrystus obdarza Kościół różnorodnymi darami, tworząc harmonijne Ciało, w którym każdy członek jest potrzebny i powołany do wzajemnej służby.
          </p>
          <p>
            <strong>4. Kryteria Przywództwa w Kościele Nowego Testamentu (1 Tm 3:1–13; Tt 1:5–9):</strong> Apostoł Paweł, opisując cechy biskupów, starszych i diakonów, powtarza etyczne wymagania Jetry: nienaganność, trzeźwość, prawdomówność, brak chciwości na brudny zysk i bojaźń Boża.
          </p>
          <p>
            <strong>5. Słodkie Jarzmo i Lekkie Brzemię Zbawiciela (Mt 11:28–30):</strong> Jezus zaprasza wszystkich spracowanych i obciążonych do Siebie. W przeciwieństwie do ludzkiego przeciążenia, jarzmo Chrystusa przynosi odpoczynek dla duszy i uwalnia z niewoli samowystarczalności.
          </p>
          <p>
            <strong>6. Wielka Uczta Narodów u boku Zbawiciela (Łk 13:29; Mt 8:11):</strong> Ofiara i wspólny posiłek Jetry z Aaronem i starszyzną Izraela przed Bogiem prefiguruje zbawienie pogan i wieczną ucztę Baranka, przy której zasiądą ludzie ze wszystkich narodów, plemion i języków.
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=18" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj Wj 18:1–27</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesusCenterContent}\n      $2`
);

// 9. Sprawdź w Biblii
const compareScriptureContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 8 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:18 → Mt 11:28–30</strong>: Zbawiciel uwalnia od wyczerpującego jarzma samowystarczalności, dając odpoczynek dla duszy.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:19–20 → Dz 6:2–4</strong>: Apostołowie oddzielają posługę stołów, by trwać w modlitwie i zwiastowaniu Słowa.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:21 → 1 Tm 3:1–13</strong>: Etyczne i duchowe kwalifikacje przywódców: prawdomówność, bojaźń Boża i brak chciwości.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:21 → Tt 1:5–9</strong>: Ustanawianie starszych w każdym mieście na fundamencie nienagannej wierności i dojrzałości.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:22 → Gal 6:2</strong>: „Jedni drugich brzemiona noście, a tak wypełniajcie prawo Chrystusowe”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:23 → 1 Kor 12:14–26</strong>: Różnorodność członków jednego Ciała — nikt nie może powiedzieć drugiemu: „Nie potrzebuję cię”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:24 → Przyp 11:14</strong>: „Gdzie nie ma dobrej rady, upada naród, lecz w mnóstwie doradców jest wybawienie”.</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 18:27 → Łk 13:29</strong>: Poganie z północy i południa zasiadający przy stole Królestwa Bożego.</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compareScriptureContent}\n      $2`
);

// 10. Prawda na dziś
const truthContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          4 Filary Mądrości Jetry — Co zmienia się w Twoim przywództwie i zaufaniu?
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>Samowystarczalność jest iluzją i pychą:</strong> Nikt z nas nie został stworzony do samotnego kontrolowania wszystkiego. Prawdziwa dojrzałość w Chrystusie polega na uznaniu swoich granic i powierzeniu spraw wspólnocie.</p>
          <p>• <strong>Mądrość może przyjść z niespodziewanej strony:</strong> Bóg posłużył się Jetrą spoza Izraela, by wskazać Mojżeszowi ślepe punkty. Bądź otwarty na życzliwą i trzeźwą korektę od ludzi, których Bóg stawia na Twojej drodze.</p>
          <p>• <strong>Charakter jest ważniejszy niż charyzma:</strong> Przy doborze współpracowników fundamentem są: męstwo ducha, bojaźń Boża, prawdomówność i nienawiść do chciwości (Wj 18:21), a nie zewnętrzna błyskotliwość.</p>
          <p>• <strong>Właściwy podział ról przynosi Boży pokój:</strong> Gdy lider strzeże modlitwy i formacji, a współpracownicy rzetelnie służą na swoich odcinkach, cała społeczność powraca do swych namiotów w głębokim pokoju (<em>szalom</em>).</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truthContent}\n      $2`
);

// 11. Pomyśl (Pytania do serca)
const questionsContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w swoim życiu zawodowym, rodzinnym lub kościelnym nie ulegasz pokusie samotnego kontrolowania wszystkiego?</p>
          <p>2. Jak reagujesz, gdy bliska osoba lub ktoś z zewnątrz zwraca Ci uwagę, że Twoje tempo życia jest niszczące („niedobra to rzecz, którą czynisz”)?</p>
          <p>3. Czy chronisz swój czas na osobistą modlitwę i relację z Bogiem, czy też pozwalasz, by pochłonęły Cię bieżące obowiązki?</p>
          <p>4. Jakie kryteria stosujesz, wybierając współpracowników lub powierzając komuś odpowiedzialność? Czy na pierwszym miejscu stawiasz charakter i bojaźń Bożą?</p>
          <p>5. Czy czerpiesz swój odpoczynek z łaski Chrystusa, czy próbujesz zasłużyć na akceptację przez nieustanny trud?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questionsContent}\n      $2`
);

// 12. Quiz Wiedzy Biblijnej
html = html.replace(/20 Pytań z Wj 17 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 18 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 17 odpowiedz na poniższe pytania/g, `Po przeczytaniu Wj 18 odpowiedz na poniższe pytania`);

// 13. Twoja Decyzja
const decisionContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Porzuć Iluzję Samowystarczalności — Zaufaj Bogu i Buduj Wspólnotę!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Osiemnasty rozdział Księgi Wyjścia stawia przed każdym uczniem Jezusa lustro prawdy. Wielu z nas żyje w przekonaniu, że nasza wartość, pobożność i sukces zależą od tego, jak wiele spraw zdołamy osobiście skontrolować i udźwignąć. Często mylimy świętą gorliwość z pracoholizmem, a brak zaufania do ludzi nazywamy „odpowiedzialnością”.
          </p>
          <p>
            Mojżesz, choć rozmawiał z Bogiem twarzą w twarz, miał w sobie niezwykłą wielkość: potrafił z pokorą przyjąć słowa prawdy od drugiego człowieka i natychmiast zreorganizować swoje życie. Przestał być wąskim gardłem całej społeczności. Pozwolił innym stanąć do służby, a sam skupił się na tym, do czego Bóg powołał go w sposób niezbywalny: na trwaniu w Bożej obecności, orędownictwie i nauczaniu dróg Królestwa.
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Osobiste Wyznanie Decyzji:</h4>
            <p class="italic text-white">
              „Świadomie rezygnuję z postawy samotnego bohatera i fałszywej kontroli. W pokorze uznaję moje ludzkie granice i powierzam moje przeciążenie Chrystusowi. Podejmuję decyzję, by w zaufaniu dzielić się odpowiedzialnością z innymi, szukać współpracowników o prawym i bogobojnym sercu oraz strzec mojego czasu na osobistą modlitwę i trwanie w obecności Pana.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decisionContent}\n      $2`
);

// 14. Modlitwa
const prayerContent = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Mądrość w Służbie, Pokorę Słuchania i Zaufanie Wspólnocie
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Święty Boże, Ojcze naszego Pana Jezusa Chrystusa!
            Staję przed Tobą w ten wtorkowy dzień z sercem pełnym wdzięczności za mądrość Twojego odwiecznego Słowa. Dziękuję Ci za świadectwo życia Mojżesza i Jetry, które przypomina mi, że Ty jesteś Bogiem porządku, pokoju i harmonii. Wyznaję przed Tobą mój grzech pychy, niecierpliwości i lęku, przez który tak często próbowałem dźwigać wszystko o własnych siłach, nie dopuszczając innych do pomocy.
          </p>
          <p>
            Przepraszam Cię za chwile, w których pod płaszczykiem gorliwości niszczyłem własne siły, zaniedbywałem modlitwę i raniłem moich najbliższych. Dziękuję Ci, Panie Jezu, że Twoje jarzmo jest przyjemne, a Twoje brzemię lekkie. Ty sam wziąłeś na ramiona krzyż naszego odkupienia i dałeś nam Ducha Świętego, byśmy żyli we wspólnocie miłości.
          </p>
          <p>
            Proszę Cię, obdarz mnie duchem pokory i mądrości. Ucz mnie słuchać dobrych rad i rozpoznawać głos Twojej prawdy płynący z ust ludzi, których stawiasz na mojej drodze. Pomóż mi wyznaczać właściwe granice, chronić czas na intymne trwanie przed Twoim obliczem i uczyć innych Twoich ustaw i praw. Wzbudź w moim otoczeniu, w Kościele i w narodzie mężów i niewiasty dzielne, bojące się Ciebie, prawdomówne i nienawidzące wszelkiej niegodziwości. W imieniu Jezusa Chrystusa, mojego Jedynego Pośrednika i Pana. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayerContent}\n      $2`
);
html = html.replace(/<span>Modlitwa na 16 listopada<\/span>/g, `<span>Modlitwa na 17 listopada</span>`);

// 15. Zadania na dziś i Zapis
const tasksChecklist = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=18" class="text-amber-300 underline font-semibold">Wj 18:1–27</a> w przekładzie UBG.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Przeprowadź audyt własnego przeciążenia: Wypisz na kartce sprawy, które prowadzisz samotnie, i zakreśl te do przekazania innym.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zastosuj zasadę czterech cnót: Wskaż w otoczeniu osobę dzielną, bogobojną, prawdomówną i uczciwą, i zaproponuj jej współpracę.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Chroń przestrzeń wstawiennictwa: Zarezerwuj dziś nienaruszalne 20 minut na modlitwę, zanim rzucisz się w wir obowiązków.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Wyraź wdzięczność doradcom: Podziękuj osobie, która w przeszłości dała Ci trafną, choć trudną radę korygującą Twoje tempo życia.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Przeczytaj i porównaj fragmenty: Przestudiuj Wj 18:1–27 równolegle z Dz 6:1–7 oraz 1 Tm 3:1–13.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 48 jako ukończony i podziel się lekcją z kimś zmagającym się z przeciążeniem.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>[\s\S]*?)<label class="flex items-start gap-3 p-3 rounded-xl bg-black\/40[\s\S]*?<\/label>\s*(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasksChecklist}\n        $2`
);

// Przycisk ukończenia dnia
html = html.replace(/completeDay47\(\)/g, `completeDay48()`);
html = html.replace(/Oznacz Dzień 47 jako ukończony/g, `Oznacz Dzień 48 jako ukończony`);

// 16. Zapowiedź: Jutro
const tomorrowSection = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
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

html = html.replace(/<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/, `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrowSection}`);

// 17. JavaScript (QUIZ, DAY_KEY, completeDay48, TTS)
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

// DAY_KEY i funkcja completeDay
html = html.replace(/const DAY_KEY = 'kc_day47';/g, `const DAY_KEY = 'kc_day48';`);
html = html.replace(/function completeDay47\(\)/g, `function completeDay48()`);
html = html.replace(/window\.completeDay47 = completeDay47;/g, `window.completeDay48 = completeDay48;`);
html = html.replace(/kc_day47_/g, `kc_day48_`);
html = html.replace(/Dzień 47 ukończony/g, `Dzień 48 ukończony`);

// TTS Lektor — pełna zamiana bloku toggleAudioLesson
const ttsHandlerBlock = `function toggleAudioLesson() {
      const btnText = document.getElementById('tts-btn-text');
      if (window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          if (btnText) btnText.textContent = 'Lektor';
        } else {
          const u = new SpeechSynthesisUtterance("Upatrz też sobie wśród całego ludu mężczyzn dzielnych i bojących się Boga, mężczyzn prawdomównych, którzy nienawidzą chciwości, i ustanów ich przełożonymi nad tysiącem, nad setką, nad pięćdziesiątką i nad dziesiątką. (Księga Wyjścia 18:21)");
          u.lang = 'pl-PL';
          u.onend = () => { if (btnText) btnText.textContent = 'Lektor'; };
          window.speechSynthesis.speak(u);
          if (btnText) btnText.textContent = 'Pauza';
        }
      }
    }`;

html = html.replace(/function toggleAudioLesson\(\)\s*\{[\s\S]*?window\.toggleAudioLesson = toggleAudioLesson;/, `${ttsHandlerBlock}\n    window.toggleAudioLesson = toggleAudioLesson;`);

// Zapisujemy we wszystkich 8 ścieżkach
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
console.log('✅ Zapisano 8 kompletnych kopii HTML Dnia 48!');
