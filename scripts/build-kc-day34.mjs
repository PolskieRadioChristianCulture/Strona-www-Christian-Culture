import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';

// Read base template (dzien-33.html)
const baseHtml = fs.readFileSync(path.join(REPO, 'akademia/kurscodzienny/dzien-33.html'), 'utf8');

// Read UBG Bible text for Exodus 3
const bibleData = JSON.parse(fs.readFileSync(path.join(REPO, 'data/bible/EXO_03.json'), 'utf8'));
const versesHtml = bibleData.verses.map(v => {
  return `<p><span class="verse-num">${v.verse}</span> ${v.text.UBG}</p>`;
}).join('\n        ');

// Read Quiz JSON
const quizQuestions = JSON.parse(fs.readFileSync(path.join(REPO, 'scratch/day34_quiz.json'), 'utf8'));

// Build Day 34 HTML from Day 33
let html = baseHtml;

// 1. Meta / Head
html = html.replace(
  /<title>Dzień 33:[^<]+<\/title>/,
  '<title>Dzień 34: PŁONĄCY KRZAK: ŚWIĘTE IMIĘ BOGA I BOŻE ZSTĄPIENIE NA RATUNEK (Wj 3:1–22) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>'
);

html = html.replace(
  /<meta name="description" content="[^"]+" \/>/,
  '<meta name="description" content="Księga Wyjścia — Miesiąc 2, Dzień 34 (3 Listopada 2026). Teofania na Horebie, powołanie Mojżesza, objawienie Imienia JHWH i obietnica wyzwolenia z Egiptu — Wj 3:1–22. Kurs codzienny Pisma Świętego." />'
);

html = html.replace(
  /<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-33" \/>/,
  '<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-34" />'
);

html = html.replace(
  /<meta property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-33" \/>/,
  '<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-34" />'
);

html = html.replace(
  /<meta property="og:title" content="[^"]+" \/>/,
  '<meta property="og:title" content="Dzień 34: PŁONĄCY KRZAK: ŚWIĘTE IMIĘ BOGA I BOŻE ZSTĄPIENIE NA RATUNEK — Z Biblią za Pan Brat" />'
);

html = html.replace(
  /<meta property="og:description" content="[^"]+" \/>/,
  '<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 34. Teofania na Horebie, powołanie Mojżesza, objawienie Imienia JHWH i Boża wierność — Wj 3:1–22." />'
);

html = html.replace(
  /<meta property="og:image" content="[^"]+" \/>/,
  '<meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg?v=20261103" />'
);

// 2. Navigation Header & Breadcrumb
html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-32"[^>]*>[\s\S]*?← Dzień 32[\s\S]*?<\/a>/,
  '<a href="/akademia/kurscodzienny/dzien-33" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">\n          <i class="fa-solid fa-chevron-left text-[10px]"></i>\n          <span>← Dzień 33</span>\n        </a>'
);

html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-34"[^>]*>[\s\S]*?Dzień 34 →[\s\S]*?<\/a>/,
  '<span class="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-500 flex items-center gap-1.5 opacity-50 cursor-not-allowed min-h-[44px]">\n          <span>Dzień 35 (Jutro) →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </span>'
);

html = html.replace(
  /<span>Dzień 33: Wj 2:1–25<\/span>/,
  '<span>Dzień 34: Wj 3:1–22</span>'
);

// 3. Hero Section
html = html.replace(
  /Miesiąc 2 • Dzień 33 • 2 Listopada 2026/,
  'Miesiąc 2 • Dzień 34 • 3 Listopada 2026'
);

html = html.replace(
  /<h1[^>]*>[\s\S]*?Z WÓD NILU DO PUSTYNI MADIAN[\s\S]*?<\/h1>/,
  '<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">\n            PŁONĄCY KRZAK: ŚWIĘTE IMIĘ BOGA I BOŻE ZSTĄPIENIE NA RATUNEK\n          </h1>'
);

html = html.replace(
  /<p class="text-sm sm:text-lg text-amber-200\/90 font-serif italic max-w-2xl">[\s\S]*?Ocalenie Mojżesza w koszyku z sitowia[\s\S]*?<\/p>/,
  '<p class="text-sm sm:text-lg text-amber-200/90 font-serif italic max-w-2xl">\n            Teofania na Horebie, powołanie Mojżesza, objawienie Imienia JHWH i obietnica wyzwolenia z Egiptu\n          </p>'
);

html = html.replace(
  /<span class="text-amber-300 font-semibold">Wj 2:1–25<\/span>/g,
  '<span class="text-amber-300 font-semibold">Wj 3:1–22</span>'
);

html = html.replace(
  /src="\/images\/academy\/daily\/kc_day_33_ocalenie_mojzesza_nil_madian\.jpg\?v=20261102"/,
  'src="/images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg?v=20261103"'
);

html = html.replace(
  /alt="Ocalenie Mojżesza z wód Nilu i ucieczka do Madianu — Wj 2:1–25"/,
  'alt="Płonący krzak na górze Horeb — teofania i powołanie Mojżesza — Wj 3:1–22"'
);

// Memory Verse
const newMemoryVerseText = 'I Bóg odpowiedział Mojżeszowi: JESTEM, KTÓRY JESTEM. I dodał: Tak powiesz synom Izraela: JESTEM posłał mnie do was.';
const newMemoryRef = 'Księga Wyjścia 3:14 (UBG)';
const newCopyText = `I Bóg odpowiedział Mojżeszowi: JESTEM, KTÓRY JESTEM. I dodał: Tak powiesz synom Izraela: JESTEM posłał mnie do was. (Wj 3:14)`;

html = html.replace(
  /onclick="navigator\.clipboard\.writeText\('[^']+'\);\s*alert\('[^']+'\);"/,
  `onclick="navigator.clipboard.writeText('${newCopyText.replace(/'/g, "\\'")}'); alert('Skopiowano werset!');"`
);

html = html.replace(
  /<blockquote[^>]*>[\s\S]*?I Bóg usłyszał ich jęk[\s\S]*?<\/blockquote>/,
  `<blockquote class="font-serif italic text-base sm:text-lg text-zinc-200 border-l-2 border-brand-gold/60 pl-4 py-1 leading-relaxed">\n              „${newMemoryVerseText}”\n            </blockquote>`
);

html = html.replace(
  /<div class="text-right text-xs font-semibold text-brand-gold mt-2 font-serif">[\s\S]*?Księga Wyjścia 2:24[\s\S]*?<\/div>/,
  `<div class="text-right text-xs font-semibold text-brand-gold mt-2 font-serif">\n              — ${newMemoryRef}\n            </div>`
);

// 4. Card 1: Podróż przez 66 Ksiąg
html = html.replace(
  /Dziś jest <strong class="text-white">Dzień 33<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 2:1–25<\/strong>\./,
  'Dziś jest <strong class="text-white">Dzień 34</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 3:1–22</strong>.'
);

html = html.replace(
  /href="\/mojabiblia\?book=EXO&amp;chapter=2"/g,
  'href="/mojabiblia?book=EXO&amp;chapter=3"'
);

html = html.replace(
  /<span>Czytaj Wj 2:1–25<\/span>/,
  '<span>Czytaj Wj 3:1–22</span>'
);

// 5. Card 2: Scripture Text
html = html.replace(
  /<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 2:1–25<\/p>/,
  '<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 3:1–22</p>'
);

html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>/,
  `<div class="kc-prose-reading">\n        ${versesHtml}\n      </div>\n    </section>`
);

// 6. Card 3: ZANIM OTWORZYSZ BIBLIĘ
const card3Content = `<section class="kc-card space-y-4 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-compass"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">ZANIM OTWORZYSZ BIBLIĘ</h2>
          <p class="text-xs text-zinc-400">Pustynia formacji i Boże wtargnięcie w codzienność</p>
        </div>
      </div>
      <p>
        Trzeciego listopada wkraczamy w jeden z najbardziej doniosłych rozdziałów całego Starego Testamentu. Wczoraj pozostawiliśmy Mojżesza na pustyni Madian — zbiega z Egiptu, dawnego księcia, który po nieudanej próbie wymierzenia sprawiedliwości własną siłą musiał uciekać przed gniewem faraona. Minęło czterdzieści długich lat. Cztery dekady wypasania owiec w surowym klimacie pustkowia dokonały w Mojżeszu głębokiego oczyszczenia. Z porywczego, pewnego siebie męża Bóg ukształtował człowieka ogołoconego z pychy i własnych ambicji.
      </p>
      <p>
        I właśnie wtedy, gdy z ludzkiej perspektywy Mojżesz osiągnął podeszły wiek osiemdziesięciu lat, a jego życie wydawało się zepchnięte na margines wielkiej historii, Bóg wkracza w jego codzienność. Na zboczu góry Horeb dochodzi do niezwykłego spotkania: ciernisty krzew płonie ogniem, lecz nie ulega spaleniu. Z płomienia rozlega się głos Boga Abrahama, Izaaka i Jakuba. Rozpoczyna się dialog, który na zawsze zdefiniował biblijne rozumienie Boga — Jego świętości, imienia i zbawczego działania.
      </p>
      <p>
        Bóg nie posyła anioła z daleka; On sam mówi: <em>„Zstąpiłem, aby go wyrwać”</em>. A gdy Mojżesz zmaga się z lękiem przed powrotem do Egiptu i pyta o tożsamość Tego, który go posyła, Bóg objawia tajemnicę Swojego Imienia: <strong>JESTEM, KTÓRY JESTEM (JHWH)</strong>. To Imię jest rękojmią, że cokolwiek przyniesie przyszłość, Bóg zawsze JEST obecny, samowystarczalny i wierny Swoim obietnicom.
      </p>
    </section>`;

// Replace Card 3 in html
html = html.replace(
  /<section class="kc-card space-y-4 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">[\s\S]*?<\/section>/,
  card3Content
);

// 7. Card 4: EGZEGEZA & FORMACJA TEOLOGICZNA
const card4Content = `<section class="kc-card space-y-6">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-feather-pointed"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
          <p class="text-xs text-zinc-400">Cztery filary objawienia w Wj 3:1–22</p>
        </div>
      </div>

      <div class="space-y-4 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
        <div class="p-4 rounded-xl bg-black/30 border border-white/5">
          <h3 class="font-display font-bold text-base text-amber-300 mb-1.5 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center">1</span>
            SPOTKANIE NA GÓRZE HOREB: PŁONĄCY KRZEW I ŚWIĘTA ZIEMIA (WJ 3:1–6)
          </h3>
          <p class="text-xs sm:text-sm text-zinc-300">
            Mojżesz pasie trzodę teścia Jetra i dociera do góry Bożej Horeb (Synaj). Bóg spotyka człowieka w wierności zwykłym obowiązkom pasterza. Ukazuje mu się Anioł PANA w płomieniu ognia ze środka krzaka (seneh) — przedcielesne objawienie Syna Bożego. Krzak płonie żywym ogniem, lecz nie spala się: Boża świętość nie potrzebuje ziemskiego paliwa i ogarnia stworzenie nie niszcząc go. Bóg woła go dwukrotnie po imieniu: „Mojżeszu, Mojżeszu!” i nakazuje zdjąć sandały, bo ziemia stała się święta z racji Bożej obecności. Bóg objawia się jako Bóg Abrahama, Izaaka i Jakuba — Bóg żywych, wierny obietnicom.
          </p>
        </div>

        <div class="p-4 rounded-xl bg-black/30 border border-white/5">
          <h3 class="font-display font-bold text-base text-amber-300 mb-1.5 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center">2</span>
            MANIFEST BOŻEGO RATUNKU: WIDZIAŁEM, SŁYSZAŁEM, ZSTĄPIŁEM (WJ 3:7–10)
          </h3>
          <p class="text-xs sm:text-sm text-zinc-300">
            PAN ogłasza cztery akty Swojej empatii i suwerenności: <em>„Widziałem ucisk... słyszałem krzyk... znam cierpienia... zstąpiłem, aby go wyrwać”</em> (3:7–8). Żadna łza ciemiężonych nie uchodzi Bożej uwadze. Wyzwolenie ma dwa kierunki: wyrwanie z rąk Egipcjan oraz wprowadzenie do ziemi dobrej i przestronnej, opływającej mlekiem i miodem. Choć to sam Bóg zstępuje na ratunek, powołuje i posyła człowieka: <em>„A teraz idź, poślę cię do faraona, abyś wyprowadził mój lud”</em> (3:10).
          </p>
        </div>

        <div class="p-4 rounded-xl bg-black/30 border border-white/5">
          <h3 class="font-display font-bold text-base text-amber-300 mb-1.5 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center">3</span>
            KRYZYS TOŻSAMOŚCI I OBJAWIENIE IMIENIA JHWH (WJ 3:11–15)
          </h3>
          <p class="text-xs sm:text-sm text-zinc-300">
            Mojżesz pyta w pokorze: <em>„Kimże ja jestem, abym miał pójść do faraona?”</em>. Bóg nie odpowiada pochwałami ludzkich talentów, lecz daje obietnicę: <em>„Będę z tobą”</em>. Gdy Mojżesz pyta o imię Boga, Bóg objawia Swoje przedwieczne, samowystarczalne Imię: <strong>JESTEM, KTÓRY JESTEM</strong> (hebr. <em>Ehyeh Asher Ehyeh</em>). Bóg istnieje sam przez się, nie podlega żadnym stworzonym definicjom i pozostaje niezmienny we wszystkich pokoleniach jako Prawdziwy i Wieczny Zbawiciel.
          </p>
        </div>

        <div class="p-4 rounded-xl bg-black/30 border border-white/5">
          <h3 class="font-display font-bold text-base text-amber-300 mb-1.5 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center">4</span>
            INSTRUKCJA TAKTYCZNA: STARSI IZRAELA, FARAON I WYJŚCIE Z BOGACTWEM (WJ 3:16–22)
          </h3>
          <p class="text-xs sm:text-sm text-zinc-300">
            Bóg przekazuje Mojżeszowi dokładną strategię: zgromadzenie starszych Izraela, zapowiedź nawiedzenia i obietnica wyjścia. Następnie pójście do króla Egiptu z prośbą o 3 dni drogi na pustynię, by złożyć ofiarę PANU. Bóg uprzedza, że faraon nie ulegnie po dobroci, lecz pod przymusem cudów mocnej ręki Bożej. Na koniec Bóg obiecuje sprawiedliwą rekompensatę za wieki niewolniczej pracy: synowie Izraela nie wyjdą z pustymi rękami, lecz otrzymają naczynia srebrne, złote i szaty.
          </p>
        </div>
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card space-y-6">[\s\S]*?<\/section>/,
  card4Content
);

// 8. Card 5: JEZUS W CENTRUM
const card5Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Płonący krzak, zstąpienie na ratunek i przedwieczne „JA JESTEM” — Chrystus w centrum</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-3">
        Objawienie na Horebie w Wj 3 jest jedną z najwspanialszych zapowiedzi Osoby i misji Jezusa Chrystusa:
      </p>
      <ul class="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Anioł PANA w płomieniu (Wj 3:2):</strong> W teologii chrześcijańskiej jest to starotestamentowe objawienie Przedwiecznego Syna Bożego — Słowa, które w pełni czasów stało się ciałem.</li>
        <li><strong>Płonący, lecz niespalony krzew:</strong> Obraz wcielenia — bóstwo zjednoczone z człowieczeństwem, gdzie święty ogień Bożej chwały zamieszkał w ludzkiej naturze bez zniszczenia jej.</li>
        <li><strong>„Zstąpiłem, aby go wyrwać” (Wj 3:8):</strong> Prefiguracja przyjścia Jezusa Chrystusa, który zstąpił z nieba na ziemię, aby wyrwać nas z wiecznej niewoli grzechu i szatana.</li>
        <li><strong>Formuła „JA JESTEM” (Wj 3:14):</strong> W Ewangelii Jana Jezus wielokrotnie przypisuje Sobie to Boże Imię: <em>„Zanim Abraham był, JA JESTEM”</em> (J 8:58), potwierdzając Swoją jedność z Ojcem.</li>
        <li><strong>Odrzucenie ludzkiej pychy:</strong> Prawdziwe zbawienie nie przychodzi przez miecz ani ludzką siłę, lecz przez uniżenie i posłuszeństwo Bogu.</li>
      </ul>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>[\s\S]*?<\/section>/,
  card5Content
);

// 9. Card 6: Porównaj wersety
const card6Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-book-bible"></i>
        <span>Sprawdź w Biblii</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Porównaj wersety w swojej Biblii</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Wj 3:14 a J 8:58</strong> — Bóg objawia Mojżeszowi: <em>„JESTEM, KTÓRY JESTEM”</em>, a Jezus ogłasza Żydom: <em>„Zanim Abraham był, JA JESTEM”</em>.</li>
        <li><strong>Wj 3:5 a Joz 5:15</strong> — Mojżesz zdejmuje sandały przed płonącym krzakiem, a Jozue zdejmuje sandały przed Wodzem wojska PANA.</li>
        <li><strong>Wj 3:7–8 a J 1:14</strong> — Bóg widzi ucisk i osobiście zstępuje, a w Nowym Testamencie: <em>„Słowo stało się ciałem i zamieszkało wśród nas”</em>.</li>
        <li><strong>Wj 3:11 a 2 Kor 12:9</strong> — Mojżesz pyta: <em>„Kimże ja jestem?”</em>, a apostoł Paweł słyszy: <em>„Wystarczy ci moja łaska, moja moc bowiem doskonali się w słabości”</em>.</li>
      </ul>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Sprawdź w Biblii<\/span>[\s\S]*?<\/section>/,
  card6Content
);

// 10. Card 7: Prawda na dziś
const card7Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Prawda na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Prawda na dziś</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Bóg powołuje cię po imieniu:</strong> Żaden człowiek nie jest dla Boga anonimowy. On zna twoje imię, twoją historię i twoje miejsce na pustyni.</li>
        <li><strong>Twoja niewystarczalność jest przestrzenią dla Bożej mocy:</strong> Prawdziwa służba Bogu zaczyna się w chwili, gdy przestajesz polegać na własnej sile, a zaczynasz polegać na obecności Tego, który powiedział: <em>„Będę z tobą”</em>.</li>
        <li><strong>Bóg zna twoje cierpienie:</strong> Bóg nie zapomniał o tobie. On widzi twój ucisk, słyszy twoje westchnienia i ma przygotowany czas wyzwolenia.</li>
      </ul>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>[\s\S]*?<\/section>/,
  card7Content
);

// 11. Card 8: Pytania do serca
const card8Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-heart"></i>
        <span>Pomyśl</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Pytania do serca</h3>
      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal list-inside">
        <li>Czy w swojej codzienności potrafisz zatrzymać się przed Bogiem, jak Mojżesz przed płonącym krzakiem, czy raczej biegniesz dalej w pośpiechu i hałasie świata?</li>
        <li>Z jakich „sandałów” (ludzkiej pychy, pozornej kontroli, grzechu) musisz dziś zrezygnować, aby stanąć w prawdzie przed świętym Bogiem?</li>
        <li>Czy zdarza ci się wymawiać przed Bożym powołaniem słowami Mojżesza: <em>„Kimże ja jestem?”</em> i jak na te wątpliwości odpowiada obietnica: <em>„Będę z tobą”</em>?</li>
        <li>Co oznacza dla ciebie osobiście prawda, że Jezus Chrystus jest przedwiecznym „JA JESTEM” w twoich codziennych zmaganiach?</li>
      </ol>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pomyśl<\/span>[\s\S]*?<\/section>/,
  card8Content
);

// 12. Card 9: Quiz title
html = html.replace(
  /<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 2<\/span>/,
  '<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 3</span>'
);

// 13. Card 10: Twoja decyzja
const card10Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Twoja decyzja</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Twoja decyzja — zadanie na dziś</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-3">
        Stojąc w duchu przed tajemnicą Płonącego Krzaka, zdejmuję wszelkie maski samowystarczalności i lęku. Przestaję patrzeć na własne ograniczenia, a spoglądam na wielkość Tego, który mnie powołał.
      </p>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm sm:text-base font-serif italic">
        „Panie Boże, uznaję Twoją absolutną świętość i suwerenność. Wyznaję, że beze mnie możesz uczynić wszystko, ale ja bez Ciebie nie mogę nic. Powierzam Ci moje słabości, porzucam wymówki i mówię dziś: «Oto jestem, poślij mnie — niech Twoje Imię JESTEM będzie moją jedyną siłą i tarczą w każdym wyzwaniu!». Amen.”
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>[\s\S]*?<\/section>/,
  card10Content
);

// 14. Card 11: Modlitwa
const card11Content = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hands-praying"></i>
        <span>Modlitwa</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Modlitwa na 3 listopada</h3>
      <p class="font-serif italic text-base sm:text-lg text-zinc-200 leading-relaxed pl-4 border-l-2 border-brand-gold/60 py-1">
        Święty, Święty, Święty Panie Boże Wszechmogący, Boże Abrahama, Izaaka i Jakuba, staję w ten wtorkowy poranek w głębokim pokłonie przed Twoim Majestatem. Dziękuję Ci za dar Twojego Słowa i za objawienie w płonącym krzewie Horebu. Dziękuję Ci, że nie jesteś Bogiem martwym ani dalekim, lecz wiecznym „JESTEM, KTÓRY JESTEM” — obecnym w każdej sekundzie mojego życia.<br><br>
        Wybacz mi, Panie, każdą chwilę, gdy wątpiłem w Twoją troskę, gdy myślałem, że nie widzisz mojego ucisku i nie słyszysz moich modlitw. Dziękuję za Jezusa Chrystusa, który zstąpił z nieba, aby odkupić mnie z niewoli grzechu i śmierci. Napełnij moje serce świętą bojaźnią, odwagą wiary i cichością pasterza. Niech Twoja łaska prowadzi mnie dziś w każdym spotkaniu, w każdej decyzji i w każdym czynie. W imieniu Jezusa Chrystusa. Amen.
      </p>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa<\/span>[\s\S]*?<\/section>/,
  card11Content
);

// 15. Card 12: Zastosowanie i Twój Zapis placeholder & labels
html = html.replace(
  /placeholder="Wpisz krótko: czego uczy Cię dziś historia ocalenia Mojżesza\?"/,
  'placeholder="Wpisz krótko: co mówi Ci dziś objawienie Bożego Imienia JESTEM, KTÓRY JESTEM?"'
);

html = html.replace(
  /placeholder="Wpisz konkretną decyzję wiary na dzisiejszy dzień\.\.\."/,
  'placeholder="Wpisz konkretną decyzję wiary: w czym rezygnujesz z własnej siły na rzecz Bożej obecności?"'
);

// 16. Card 13: Share link
html = html.replace(
  /href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-33"/g,
  'href="https://polskieradio.cc/akademia/kurscodzienny/dzien-34"'
);

// 17. #jutro section
const jutroSection = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 4 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 35 — Znak laski, ręka trędowata i powrót Mojżesza do Egiptu (Wj 4:1–31)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Jutro czytamy czwarty rozdział Księgi Wyjścia: Mojżesz zmaga się z kolejnymi wątpliwościami, otrzymuje trzy cudowne znaki potwierdzające jego posłannictwo, a Bóg wyznacza Aarona na jego rzecznika. Wróć jutro, aby kontynuować podróż!
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Wróć do spisu kursu
        </a>
      </div>
    </section>`;

html = html.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  jutroSection
);

// 18. Scripts replacement
// Replace QUIZ_DATA
html = html.replace(
  /const QUIZ_DATA = \[[\s\S]*?\];/,
  `const QUIZ_DATA = ${JSON.stringify(quizQuestions, null, 2)};`
);

// Replace Quiz & Diary storage keys
html = html.replace(/kc_day33_quiz/g, 'kc_day34_quiz');
html = html.replace(/kc_day33_completed/g, 'kc_day34_completed');
html = html.replace(/const DAY_KEY = 'kc_day33';/g, "const DAY_KEY = 'kc_day34';");
html = html.replace(/const STORAGE_KEY = 'kc_quiz_day33_score';/g, "const STORAGE_KEY = 'kc_quiz_day34_score';");

// Ensure share script is clean and empty
html = html.replace(
  /<script src="\/js\/cc-daily-course-share\.js[^"]*" defer>[\s\S]*?<\/script>/,
  '<script src="/js/cc-daily-course-share.js?v=20261025_v4" defer></script>'
);

// Target 4 paths:
const TARGETS = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-34.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-34/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-34.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-34/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-34.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-34/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-34.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-34/index.html'),
];

for (const target of TARGETS) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, html, 'utf8');
  console.log('Wrote:', target);
}

console.log('All 8 target files written successfully.');
