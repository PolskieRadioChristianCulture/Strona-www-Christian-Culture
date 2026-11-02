#!/usr/bin/env node
// Przebudowa Dnia 33 na szkielet wzoru Dnia 1 (szablon Dnia 32 po wyrównaniu).
// Treść Dnia 33 (tekst Wj 2, kody Stronga, egzegeza, zadanie, modlitwa, quiz) przenoszona bez zmian ze strony opublikowanej 02.11.2026.
// Użycie (jednorazowo): node scripts/rebuild-kc-day33-standard.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { jutro } from './align-kc-lessons-day1.mjs';

const src = execSync('git show 658ce551:akademia/kurscodzienny/dzien-33.html', { encoding: 'utf8', maxBuffer: 1 << 26 });
let s = fs.readFileSync('akademia/kurscodzienny/dzien-32.html', 'utf8');

const grab = (re, what) => { const m = re.exec(src); if (!m) throw new Error(`Dzień 33: brak ${what}`); return m[1] ?? m[0]; };
const swap = (re, rep, what) => { if (!re.test(s)) throw new Error(`szkielet: brak ${what}`); s = s.replace(re, rep); };

// 1. Nagłówek dokumentu: tytuł … og:image z opublikowanego Dnia 33
swap(/<title>[\s\S]*?<meta property="og:image"[^>]*\/>/, () => grab(/(<title>[\s\S]*?<meta property="og:image"[^>]*\/>)/, 'meta'), 'meta');

// 1b. Style sekcji Dnia 33 (tekst z numerami wersetów, kody Stronga)
const css = grab(/(\n[ \t]*\.kc-prose-reading \{[\s\S]*?)\n[ \t]*\.cin-gold-btn \{/, 'style');
swap(/(\n[ \t]*<\/style>)/, `${css}$1`, 'style');

// 2. Hero
const h1 = grab(/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/, 'h1');
const sub = grab(/<\/h1>\s*<p[^>]*>\s*([\s\S]*?)\s*<\/p>/, 'podtytuł');
const img = grab(/(<img\s+src="\/images\/academy\/daily\/kc_day_33[^"]*"\s+alt="[^"]*")/, 'grafika');
const caption = grab(/<span>(Ilustracja biblijna:[^<]*)<\/span>/, 'podpis grafiki');
const verse = grab(/<blockquote[^>]*>\s*([\s\S]*?)\s*<\/blockquote>/, 'werset');
swap(/Dzień 32 z 2009/, 'Dzień 33 z 2009', 'etykieta dnia');
swap(/1 LISTOPADA 2026 • NIEDZIELA/, '2 LISTOPADA 2026 • PONIEDZIAŁEK', 'data');
swap(/(<h1[^>]*>\s*)[\s\S]*?(\s*<\/h1>)/, `$1${h1}$2`, 'h1');
swap(/(<\/h1>\s*<p[^>]*>\s*)[\s\S]*?(\s*<\/p>)/, `$1${sub}$2`, 'podtytuł');
swap(/<img\s+src="\/images\/academy\/daily\/kc_day_32[^"]*"\s+alt="[^"]*"/, img, 'grafika');
swap(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>${caption}</span>`, 'podpis');
swap(/Czytanie: Wj 1:1–22/, 'Czytanie: Wj 2:1–25', 'czytanie');
swap(/(<span>Werset Pamięciowy Dnia:<\/span>[\s\S]*?<blockquote[^>]*>\s*)[\s\S]*?(\s*<\/blockquote>)/, `$1${verse}$2`, 'werset');
swap(/— Księga Wyjścia 1:12 \(UBG\)/, '— Księga Wyjścia 2:24–25 (UBG)', 'odnośnik wersetu');
swap(/navigator\.clipboard\.writeText\('[^']*'\)/, `navigator.clipboard.writeText('${verse.replace(/^„|”$/g, '')} (Wj 2:24–25)')`, 'kopiowanie wersetu');
swap(/(<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*)[\s\S]*?(\s*<\/div>)/,
  '$1Bóg obraca dekret śmierci w drogę ocalenia, kształtuje Mojżesza w szkole pustyni i nigdy nie zapomina o swoim przymierzu — słyszy, pamięta, widzi i zna swój lud.$2', 'myśl przewodnia');

// 3. Treść lekcji: karta kursu + sekcje Dnia 33 + elementy wzoru
const section = (comment) => grab(new RegExp(`(<!-- ${comment}[^>]*-->\\s*<section[\\s\\S]*?<\\/section>)`), comment);
const task = grab(/<strong class="text-white">Zadanie Taktyczne:<\/strong>\s*([\s\S]*?)\s*<\/p>/, 'zadanie');
const prayer = grab(/Modlitwa:<\/div>\s*<p[^>]*>\s*([\s\S]*?)\s*<\/p>/, 'modlitwa');
const card = (label, icon, title, inner) => `
    <section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid ${icon}"></i>
        <span>${label}</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">${title}</h3>
${inner}
    </section>
`;
const list = (items) => `      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed">\n${items.map((x) => `        <li class="pl-3 border-l-2 border-amber-500/40">${x}</li>`).join('\n')}\n      </ul>`;
const ref = (code, ch, label, note) => `<a href="/mojabiblia?book=${code}&chapter=${ch}" class="text-amber-300 underline font-semibold">${label}</a> — ${note}`;
const wstepCard = /(\s*<!-- ZANIM OTWORZYSZ BIBLIĘ \(wzór Dnia 1\) -->[\s\S]*?<\/article>)/.exec(s)[1]
  .replace('<strong class="text-white">Dzień 32</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 1:1–22</strong>', '<strong class="text-white">Dzień 33</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 2:1–25</strong>')
  .replace('book=EXO&chapter=1"', 'book=EXO&chapter=2"').replace('Czytaj Wj 1:1–22', 'Czytaj Wj 2:1–25');

const body = `    <!-- LESSON BODY CONTENT (Dzień 33, treść opublikowana 02.11.2026) -->
    <section class="space-y-6">
${wstepCard}

    ${section('SCRIPTURE SECTION')}

    ${section('HEBREW STRONG CODES')}

    ${section('THEOLOGICAL EXEGESIS')}
${card('Jezus w centrum', 'fa-cross', 'Odrzucony wyzwoliciel — zapowiedź Chrystusa', `      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed">
        Mojżesz, ocalony z wód i odrzucony przez własnych braci („Kto cię ustanowił przełożonym i sędzią nad nami?” — Wj 2:14), zapowiada Jezusa, który „przyszedł do swoich, a swoi Go nie przyjęli” (J 1:11).
        Szczepan w Dz 7:25–29, 35 pokazuje, że Bóg posłał jako wybawiciela właśnie tego, którego lud odrzucił. Tak i Chrystus, odrzucony przez ludzi, stał się Zbawicielem.
      </p>`)}${card('Sprawdź w Biblii', 'fa-book-bible', 'Porównaj wersety w swojej Biblii', list([
  ref('GEN', 6, 'Rdz 6:14', 'to samo słowo <em>tebah</em>: arka Noego i koszyk Mojżesza.'),
  ref('EXO', 1, 'Wj 1:22', 'dekret faraona, który Bóg obrócił w drogę ocalenia.'),
  ref('ACT', 7, 'Dz 7:20–29, 35', 'Szczepan o Mojżeszu odrzuconym przez swoich.'),
  ref('JHN', 1, 'J 1:11', 'Chrystus przyszedł do swoich, a swoi Go nie przyjęli.'),
  ref('NUM', 12, 'Lb 12:3', 'Mojżesz — najłagodniejszy z ludzi.'),
  ref('HEB', 11, 'Hbr 11:23–27', 'wiara rodziców Mojżesza i jego wybór.'),
]))}${card('Prawda na dziś', 'fa-lightbulb', 'Prawda na dziś', list([
  'Bóg potrafi obrócić narzędzie śmierci w drogę ocalenia — Nil stał się kołyską Mojżesza.',
  'Boże dzieło nie jest budowane ludzką siłą ani przemocą (Wj 2:11–15).',
  'Czas pustyni to szkoła, w której Bóg kształtuje pokorę i cichość.',
  'Bóg słyszy, pamięta, widzi i zna — nawet wtedy, gdy wydaje się, że milczy (Wj 2:23–25).',
]))}${card('Pomyśl', 'fa-heart', 'Pytania do serca', `      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal pl-5">
        <li>Gdzie w moim życiu Bóg może zamienić to, co groźne, w drogę ocalenia?</li>
        <li>Czy próbuję „ratować sytuację” własną siłą i gniewem, zamiast czekać na Boży czas?</li>
        <li>Jak przeżywam swój „Madian” — czas czekania i ukrytej codzienności?</li>
        <li>Czy wierzę, że Bóg słyszy moje westchnienie i pamięta o swoich obietnicach?</li>
      </ol>`)}
    </section>

`;
swap(/[ \t]*<!-- LESSON BODY CONTENT[\s\S]*?(?=[ \t]*<!-- 20-QUESTION QUIZ SECTION -->)/, () => body, 'treść lekcji');
swap(/Sprawdź swoją wiedzę — 20 Pytań z Wj 1/, 'Sprawdź swoją wiedzę — 20 Pytań z Wj 2', 'tytuł quizu');

// 4. Decyzja i modlitwa (treść Dnia 33) przed „Zastosowanie i Twój Zapis”
const decyzja = card('Twoja decyzja', 'fa-flag-checkered', 'Twoja decyzja — zadanie na dziś', `      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed">${task}</p>`)
  + card('Modlitwa', 'fa-hands-praying', 'Modlitwa', `      <p class="font-serif italic text-base sm:text-lg text-zinc-200 leading-relaxed">${prayer}</p>`);
swap(/(\n[ \t]*<!-- ── ZADANIE NA DZIŚ & DZIENNIK \(wzór Dnia 1\) ── -->)/, `\n${decyzja}$1`, 'zapis');
swap(/Księgi Wyjścia 1:1–22/, 'Księgi Wyjścia 2:1–25', 'krok 1');
swap(/(Krok 1:[\s\S]*?book=EXO&chapter=)1"/, '$12"', 'link krok 1');
swap(/Po przeczytaniu Wj 1 dowiedziałem/, 'Po przeczytaniu Wj 2 dowiedziałem', 'pole zapisu');

// 5. Quiz: dane Dnia 33
const quizData = grab(/(const QUIZ_DATA = \[[\s\S]*?\n\s*\];)/, 'QUIZ_DATA');
swap(/const QUIZ_DATA = \[[\s\S]*?\n\s*\];/, () => quizData, 'QUIZ_DATA');

// 6. Numer dnia w adresach, kluczach i tekstach; nawigacja wstecz
s = s.replace(/dzien-32/g, 'dzien-33').replace(/kc_day32/g, 'kc_day33').replace(/completeDay32/g, 'completeDay33')
  .replace(/Dzień 32/g, 'Dzień 33').replace(/Dnia 32/g, 'Dnia 33').replace(/Dzien%2032/g, 'Dzien%2033').replace(/Dzie%C5%84%2032/g, 'Dzie%C5%84%2033');
s = s.replace(/href="\/akademia\/kurscodzienny\/dzien-31"([^>]*>)← Dzień 31</, 'href="/akademia/kurscodzienny/dzien-32"$1← Dzień 32<');
// Link „następny dzień” ze szkieletu wskazywałby teraz na samego siebie (Dnia 34 jeszcze nie ma)
s = s.replace(/\r?\n[ \t]*<a href="\/akademia\/kurscodzienny\/dzien-33"[^>]*>Dzień 33 →<\/a>/, '');

// 7. „Jutro” dla Dnia 34
swap(/\n[ \t]*<!-- ── ZAPOWIEDŹ: JUTRO \(wzór Dnia 1\) ── -->[\s\S]*?id="jutro"[\s\S]*?<\/section>\r?\n/, () => `\n${jutro(33)}`, 'jutro');

for (const p of ['akademia', 'kursy'].flatMap((b) => [`${b}/kurscodzienny/dzien-33.html`, `${b}/kurscodzienny/dzien-33/index.html`])) fs.writeFileSync(p, s);
console.log('Dzień 33: przebudowany (4 ścieżki)');
