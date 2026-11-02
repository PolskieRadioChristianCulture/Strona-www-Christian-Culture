#!/usr/bin/env node
// Uzupełnia starsze lekcje Kursu Codziennego (Dni 2–23) i Dzień 25 o elementy wzoru Dnia 1.
// Każdą z 4 ścieżek (akademia/kursy × .html/index.html) poprawia osobno, bo w części dni kopie się różnią.
// Idempotentny: pomija elementy, które już są. Użycie: node scripts/align-kc-lessons-legacy.mjs 2 3 ... 23 25
import fs from 'node:fs';
import { esc, jsq, lessonInfo, wstep, zapis, duchowny, zapisScript } from './align-kc-lessons-day1.mjs';

const pad = (n) => String(n).padStart(2, '0');
const PATHS = (d) => ['akademia', 'kursy'].flatMap((b) => [`${b}/kurscodzienny/dzien-${pad(d)}.html`, `${b}/kurscodzienny/dzien-${pad(d)}/index.html`]);
const ABBR = { 'KSIĘGA RODZAJU': 'Rdz', 'KSIĘGA WYJŚCIA': 'Wj' };

// Lektor (ta sama implementacja co w Dniach 24+), dodawany tylko gdy strona go nie ma
const TTS = `
  <!-- SCRIPT: LEKTOR AUDIO (wzór Dnia 1) -->
  <script>
    (function () {
      // Własny zakres: strona może już deklarować ttsUtterance / isTtsPlaying
      let utterance = null;
      let playing = false;
      function ui(on) {
        const icon = document.getElementById('tts-icon');
        const text = document.getElementById('tts-btn-text');
        const btn = document.getElementById('btn-audio-tts');
        if (icon) icon.className = (on ? 'fa-solid fa-pause' : 'fa-solid fa-volume-high') + ' text-xs text-amber-300';
        if (text) text.textContent = on ? 'Pauza Audio' : 'Słuchaj Audio';
        if (btn) { btn.classList.toggle('ring-2', on); btn.classList.toggle('ring-amber-400', on); }
      }
      window.toggleAudioLesson = function () {
        if (!('speechSynthesis' in window)) { alert('Twoja przeglądarka nie wspiera odtwarzania mowy (Web Speech API).'); return; }
        if (playing) { window.speechSynthesis.cancel(); playing = false; ui(false); return; }
        const title = document.querySelector('h1')?.textContent?.trim() || '';
        const body = document.querySelector('main')?.innerText || '';
        window.speechSynthesis.cancel();
        utterance = new SpeechSynthesisUtterance(title + '. ' + body.slice(0, 4500));
        utterance.lang = 'pl-PL';
        utterance.rate = 0.96;
        utterance.onend = utterance.onerror = () => { playing = false; ui(false); };
        window.speechSynthesis.speak(utterance);
        playing = true;
        ui(true);
      };
    })();
  </script>
`;

// Przenosi notatki ze starego dziennika (journal-1/2, complete, checklist) do kluczy wzoru Dnia 1
const legacyMigration = (d) => `
  <script>
    (function () {
      try {
        const n = 'kc_day${d}_';
        const old = Object.keys(localStorage).filter((k) => new RegExp('^kc_(dzien|day)_?0?${d}_').test(k) && !k.startsWith(n));
        const pick = (re) => old.find((k) => re.test(k));
        const move = (re, key) => { const k = pick(re); if (k && localStorage.getItem(n + key) === null) localStorage.setItem(n + key, localStorage.getItem(k)); };
        move(/journal-?1$/, 'learned');
        move(/journal-?2$/, 'decision');
        move(/_complete(d)?$/, 'completed');
        const cl = pick(/checklist$/);
        if (cl && localStorage.getItem(n + 'chk_read') === null) {
          const c = JSON.parse(localStorage.getItem(cl) || '{}');
          localStorage.setItem(n + 'chk_read', !!c.c1); localStorage.setItem(n + 'chk_understood', !!c.c2); localStorage.setItem(n + 'chk_apply', !!c.c3);
        }
      } catch (e) {}
    })();
  </script>`;

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
const pytania = (qs) => card('Pomyśl', 'fa-heart', 'Pytania do serca', `      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal pl-5">\n${qs.map((q) => `        <li>${q}</li>`).join('\n')}\n      </ol>`);
const ref = (code, ch, label, note) => `<a href="/mojabiblia?book=${code}&chapter=${ch}" class="text-amber-300 underline font-semibold">${label}</a> — ${note}`;

// Treści uzupełniane na podstawie tekstu lekcji (do przejrzenia przez L0)
const CONTENT = {
  18: { pytania: [
    'Czego naprawdę pragnę najbardziej — i czy ma to wartość w oczach Boga?',
    'Czy, jak Ezaw, nie zamieniam czasem trwałego błogosławieństwa na chwilowe zaspokojenie?',
    'Jak modlę się w czasie długiego czekania — tak jak Izaak, który przez lata prosił o potomstwo (Rdz 25:21)?',
    'W jakiej sprawie, jak Rebeka (Rdz 25:22), powinienem dziś najpierw zapytać Pana?',
  ] },
  19: { pytania: [
    'Czy próbuję czasem „pomóc Bogu” na skróty — sprytem, półprawdą albo manipulacją?',
    'Czego boję się bardziej: samego zła czy tego, że zostanę przyłapany (Rdz 27:12)?',
    'Czy zdarza mi się używać imienia Boga, aby uwiarygodnić własne plany (Rdz 27:20)?',
    'Komu w mojej rodzinie potrzebna jest dziś moja szczerość zamiast podstępu?',
  ] },
  25: {
    biblia: card('Sprawdź w Biblii', 'fa-book-bible', 'Porównaj wersety w swojej Biblii', list([
      ref('GEN', 39, 'Rdz 39:2–3', 'Pan był z Józefem także w domu obcego pana.'),
      ref('GEN', 39, 'Rdz 39:9', 'Józef nazywa grzech po imieniu: to grzech przeciwko Bogu.'),
      ref('GEN', 39, 'Rdz 39:21', 'Boża obecność i łaska w więzieniu.'),
      ref('GEN', 38, 'Rdz 38:26', 'Juda publicznie przyznaje się do winy.'),
      ref('MAT', 1, 'Mt 1:3', 'Peres i Tamar w rodowodzie Jezusa.'),
      ref('1CO', 10, '1 Kor 10:13', 'Bóg razem z pokusą daje wyjście.'),
      ref('2TI', 2, '2 Tm 2:22', 'wezwanie, by uciekać od pożądliwości.'),
      ref('1PE', 2, '1 P 2:19–23', 'Chrystus, który cierpiał niesłusznie, jest naszym wzorem.'),
    ])),
    prawda: card('Prawda na dziś', 'fa-lightbulb', 'Prawda na dziś', list([
      'Boża obecność nie zależy od okoliczności — Pan był z Józefem w domu Potifara i w więzieniu.',
      'Wierność bywa kosztowna, ale Bóg nie zapomina o tych, którzy Mu ufają.',
      'Z pokusą się nie negocjuje — czasem mądrością jest ucieczka.',
      'Bóg potrafi wpisać złamaną historię, jak historia Judy i Tamar, w swój plan zbawienia — aż po rodowód Jezusa.',
    ])),
    pytania: [
      'Gdzie dziś najbardziej potrzebuję pamiętać, że Pan jest ze mną — także wtedy, gdy spotyka mnie niesprawiedliwość?',
      'Czy jest pokusa, z którą wciąż negocjuję, zamiast od niej uciec jak Józef?',
      'Jak reaguję, gdy za uczciwość spotyka mnie fałszywe oskarżenie?',
      'Czy, jak Juda, potrafię uczciwie przyznać się do swojej winy?',
    ],
    decyzja: card('Twoja decyzja', 'fa-flag-checkered', 'Twoja decyzja', list([
      'Nazwę po imieniu pokusę, z którą się zmagam, i odetnę się od niej.',
      'Będę wierny w swoich obowiązkach także wtedy, gdy nikt nie patrzy.',
      'Zaufam, że Bóg jest ze mną także tam, gdzie dzieje mi się krzywda.',
    ])),
    modlitwa: card('Modlitwa', 'fa-hands-praying', 'Modlitwa', `      <p class="font-serif italic text-base sm:text-lg text-zinc-200 leading-relaxed">
        Panie Boże, dziękuję Ci, że byłeś z Józefem w domu Potifara i w więziennych murach. Bądź ze mną w moich próbach.
        Daj mi siłę, abym uciekał od grzechu i był wierny także wtedy, gdy nikt nie patrzy.
        Gdy spotyka mnie niesprawiedliwość, naucz mnie ufać Tobie i patrzeć na Jezusa, który cierpiał niewinnie dla mojego zbawienia. Amen.
      </p>`),
  },
};

function transform(s, d, file) {
  const i = lessonInfo(s, d);
  const need = (re, what) => { if (!re.test(s)) throw new Error(`${file}: brak kotwicy (${what})`); };

  // 1. Karta „Podróż przez 66 Ksiąg” na początku treści
  if (!s.includes('Podróż przez 66 Ksiąg')) {
    need(/<main[^>]*>/, 'main');
    s = s.replace(/(<main[^>]*>)/, `$1\n${wstep(d, i, 'Z Biblią za Pan Brat')}`);
  }
  // 2. Werset: kopiowanie gotowego tekstu (zamiast odczytu z DOM)
  if (!/navigator\.clipboard\.writeText\('[^']+\(/.test(s) && s.includes('this.parentElement.nextElementSibling')) {
    const m = /nextElementSibling[\s\S]*?<blockquote[^>]*>\s*([\s\S]*?)\s*<\/blockquote>\s*<div[^>]*>\s*—\s*(KSIĘGA RODZAJU|KSIĘGA WYJŚCIA)\s+(\d+:\d+(?:[–-]\d+)?)/i.exec(s);
    if (!m) throw new Error(`${file}: brak kotwicy (werset)`);
    const verse = m[1].replace(/<[^>]+>/g, '').replace(/^„|”$/g, '').trim();
    const copy = esc(jsq(`${verse} (${ABBR[m[2].toUpperCase()]} ${m[3]})`));
    s = s.replace(/navigator\.clipboard\.writeText\(this\.parentElement\.nextElementSibling\?\.textContent\?\.trim\(\) \|\| ''\)/, `navigator.clipboard.writeText('${copy}')`);
  }
  // 3. „Zastosowanie i Twój Zapis” zamiast starego dziennika
  if (!s.includes('id="btn-complete-day"')) {
    const re = /<!--[^>]*ZADANIE[^>]*-->\s*<(section|article)[\s\S]*?<\/\1>/;
    need(re, 'stary dziennik');
    const old = re.exec(s)[0];
    // Ukryte zastępniki dla identyfikatorów starego dziennika — stary skrypt odwołuje się do nich bez błędów
    const ids = [...old.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
    const stubs = ids.length ? `\n    <div hidden aria-hidden="true">${ids.map((id) => `<span id="${id}"></span>`).join('')}</div>` : '';
    s = s.replace(re, () => zapis(d, i).trim() + stubs);
    need(/\n\s*<!-- Floating Back to Top Button -->/, 'przycisk do góry');
    s = s.replace(/(\n\s*<!-- Floating Back to Top Button -->)/, `\n${legacyMigration(d)}${zapisScript(d)}$1`);
  }
  // 4. Rozmowa z duchownym (wzór Dnia 1)
  if (!s.includes('id="kontakt-duchowny"')) {
    const re = /<!--[^>]*DUCHOWN[^>]*-->\s*<(section|article)[\s\S]*?<\/\1>/;
    if (re.test(s)) s = s.replace(re, () => duchowny().trim());
    else s = s.replace(/(<span id="save-status-msg"[\s\S]*?<\/section>)/, `$1\n${duchowny()}`);
  }
  // 5. Skrypt udostępniania jako pusty znacznik (kod w środku <script src> przeglądarka pomija)
  s = s.replace(/(<script src="\/js\/cc-daily-course-share\.js[^"]*" defer>)[\s\S]*?(<\/script>)/, '$1$2');
  // 6. Lektor, gdy strona go nie definiuje
  const live = s.replace(/<script src="[^"]*"[^>]*><\/script>/g, '');
  if (!/function toggleAudioLesson\b|window\.toggleAudioLesson = /.test(live)) s = s.replace(/(\n\s*<!-- Floating Back to Top Button -->)/, `\n${TTS}$1`);
  // 7. Quiz bez identyfikatora sekcji (Dzień 23)
  if (!s.includes('id="quiz-section"') && !s.includes('id="quizContainer"')) {
    s = s.replace(/(<!--[^>]*QUIZ[^>]*-->\s*<section )/, '$1id="quiz-section" ');
  }
  // 8. Treści uzupełniane (Dni 18, 19, 25)
  const c = CONTENT[d];
  if (c && !/pytania do serca|pytania osobiste/i.test(s)) {
    const quiz = /(\n[ \t]*<!--[^>]*(QUIZ|Quiz)[^>]*-->)/;
    need(quiz, 'quiz');
    s = s.replace(quiz, `\n${c.biblia || ''}${c.prawda || ''}${pytania(c.pytania)}$1`);
  }
  if (c?.decyzja && !/Twoja decyzja/i.test(s)) {
    need(/(\n[ \t]*<!-- ── ZADANIE NA DZIŚ & DZIENNIK \(wzór Dnia 1\) ── -->)/, 'zapis');
    s = s.replace(/(\n[ \t]*<!-- ── ZADANIE NA DZIŚ & DZIENNIK \(wzór Dnia 1\) ── -->)/, `\n${c.decyzja}${c.modlitwa}$1`);
  }
  if (d === 25 && !/Jezus w centrum/i.test(s)) {
    need(/<span>Most do Ewangelii i Zastosowanie Praktyczne<\/span>/, 'most do Ewangelii');
    s = s.replace('<span>Most do Ewangelii i Zastosowanie Praktyczne</span>', '<span>Jezus w centrum — Most do Ewangelii i Zastosowanie Praktyczne</span>');
  }
  return s;
}

for (const d of process.argv.slice(2).map(Number).filter(Boolean)) {
  for (const p of PATHS(d)) {
    const before = fs.readFileSync(p, 'utf8');
    const after = transform(before, d, p);
    if (after !== before) fs.writeFileSync(p, after);
  }
  console.log(`Dzień ${pad(d)}: 4 ścieżki`);
}
