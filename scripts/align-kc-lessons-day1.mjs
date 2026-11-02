#!/usr/bin/env node
// Uzupełnia lekcje Kursu Codziennego (szablon Dni 24+) o stałe elementy wzoru Dnia 1:
// werset z kopiowaniem, karta „Podróż przez 66 Ksiąg”, „Zastosowanie i Twój Zapis”,
// „Rozmowa z duchownym”, „Jutro” oraz kontener logowania w nagłówku.
// Skrypt jest idempotentny: pomija elementy, które już są na stronie.
// Użycie: node scripts/align-kc-lessons-day1.mjs 24 26 27 ...   (zapisuje 4 ścieżki każdego dnia)
import fs from 'node:fs';

const DIR = 'akademia/kurscodzienny';
const COPIES = (p) => [`akademia/kurscodzienny/${p}`, `kursy/kurscodzienny/${p}`];
const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA', 'LIPCA', 'SIERPNIA', 'WRZEŚNIA', 'PAŹDZIERNIKA', 'LISTOPADA', 'GRUDNIA'];
const BOOKS = { Rdz: ['GEN', 'Księga Rodzaju', 'Księgi Rodzaju'], Wj: ['EXO', 'Księga Wyjścia', 'Księgi Wyjścia'] };
const FULL_TO_ABBR = { 'Księga Rodzaju': 'Rdz', 'Księga Wyjścia': 'Wj' };

// Dzień 1 = 1 października 2026
const dateOf = (d) => new Date(Date.UTC(2026, 9, d));
const dateLabel = (d) => { const t = dateOf(d); return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}`; };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsq = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function lessonInfo(html, d) {
  const t = /<title>Dzień \d+: ([^<|]+?)\s*\(([^)]+)\)\s*\|/.exec(html);
  if (!t) throw new Error(`Dzień ${d}: nie rozpoznano tytułu`);
  const ref = t[2].trim(); // np. „Rdz 50:1–26”, „Wj 1:1–22”
  const abbr = ref.split(' ')[0];
  if (!BOOKS[abbr]) throw new Error(`Dzień ${d}: nieznana księga ${abbr}`);
  const firstCh = parseInt(ref.slice(abbr.length + 1), 10);
  const lastCh = (/[–-](\d+):\d+$/.exec(ref) || [])[1];
  const chLabel = lastCh && +lastCh !== firstCh ? `${firstCh}–${lastCh}` : `${firstCh}`;
  const desc = (/<meta name="description" content="([^"]+)"/.exec(html) || [])[1] || '';
  return { title: t[1].trim(), ref, abbr, code: BOOKS[abbr][0], bookFull: BOOKS[abbr][1], bookGen: BOOKS[abbr][2], firstCh, chLabel, desc };
}

const wstep = (d, i) => `
      <!-- ZANIM OTWORZYSZ BIBLIĘ (wzór Dnia 1) -->
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
            Dziś jest <strong class="text-white">Dzień ${d}</strong>: ${i.bookFull}, <strong class="text-brand-gold">${esc(i.ref)}</strong>.
          </p>
          <p>
            Zanim przeczytasz rozważanie, otwórz Biblię i przeczytaj cały fragment. Komentarz ma prowadzić do Słowa, a nie je zastępować.
          </p>
          <a href="/mojabiblia?book=${i.code}&chapter=${i.firstCh}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
            <i class="fa-solid fa-book-bible"></i>
            <span>Czytaj ${esc(i.ref)}</span>
          </a>
        </div>
      </article>
`;

const zapis = (d, i) => `
    <!-- ── ZADANIE NA DZIŚ & DZIENNIK (wzór Dnia 1) ── -->
    <section class="kc-card border-brand-gold/40">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-clipboard-check"></i>
        <span>Zadanie na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">
        Zastosowanie i Twój Zapis
      </h3>
      <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm mb-4">
        📖 <strong>Krok 1:</strong> Przeczytaj cały fragment <a href="/mojabiblia?book=${i.code}&chapter=${i.firstCh}" class="text-amber-300 underline font-semibold">${i.bookGen} ${esc(i.ref.slice(i.abbr.length + 1))}</a>.
      </div>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1" for="kc-input-learned">
            1. „Po przeczytaniu ${i.abbr} ${i.chLabel} dowiedziałem się o Bogu, że…”
          </label>
          <input type="text" id="kc-input-learned" oninput="saveDailyField('learned', this.value)" placeholder="Wpisz swoje spostrzeżenie..." class="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm min-h-[44px]" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1" for="kc-input-decision">
            2. „Dlatego dzisiaj chcę…”
          </label>
          <input type="text" id="kc-input-decision" oninput="saveDailyField('decision', this.value)" placeholder="Wpisz swoją praktyczną decyzję..." class="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm min-h-[44px]" />
        </div>
      </div>

      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-6">
        <div class="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-wider">Potwierdź realizację:</div>
        <div class="space-y-2.5">
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-read" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ PRZECZYTAŁEM</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-understood" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ ZROZUMIAŁEM</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-apply" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ ZASTOSUJĘ</span>
          </label>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button type="button" id="btn-complete-day" onclick="completeDay${d}()" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:from-amber-400 hover:to-amber-500 transition min-h-[44px]">
          <i class="fa-solid fa-check"></i>
          <span id="btn-complete-text">Oznacz Dzień ${d} jako ukończony</span>
        </button>
        <span id="save-status-msg" class="text-xs text-emerald-400 font-semibold hidden">
          ✓ Zapisano w Twoim profilu
        </span>
      </div>
    </section>
`;

const duchowny = () => `
    <!-- ── POROZMAWIAJ Z DUCHOWNYM (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-gradient-to-br from-[#121722] to-[#0E121A] border border-amber-500/30 text-zinc-300 shadow-xl" id="kontakt-duchowny">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4 text-center sm:text-left">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-300 shrink-0 shadow-lg">
            <i class="fa-solid fa-hands-praying"></i>
          </div>
          <div>
            <span class="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">Duchowe wsparcie • Rozmowa</span>
            <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-1">Możesz na ten temat porozmawiać z duchownym</h3>
            <p class="text-xs sm:text-sm text-zinc-300">Duchowny: <strong class="text-white font-semibold">Mariusz</strong> • <span class="text-amber-200 font-mono font-semibold">+48 608 337 477</span></p>
          </div>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto justify-center shrink-0">
          <a href="tel:+48608337477" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-amber-500 transition min-h-[44px]">
            <i class="fa-solid fa-phone"></i>
            <span>Zadzwoń</span>
          </a>
          <a href="sms:+48608337477" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-amber-400 font-bold text-xs uppercase tracking-wider transition min-h-[44px]">
            <i class="fa-solid fa-comment-sms"></i>
            <span>Wyślij SMS</span>
          </a>
        </div>
      </div>
    </section>
`;

function jutro(d) {
  const n = d + 1;
  const nextFile = `${DIR}/dzien-${pad(n)}.html`;
  let h3, text, link;
  if (fs.existsSync(nextFile)) {
    const ni = lessonInfo(fs.readFileSync(nextFile, 'utf8'), n);
    h3 = `DZIEŃ ${n} — ${esc(ni.title)} (${esc(ni.ref)})`;
    text = esc(ni.desc);
    link = `<a href="/akademia/kurscodzienny/dzien-${pad(n)}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
          <span>Przejdź do Dnia ${n}</span>
          <span>→</span>
        </a>`;
  } else {
    // Lekcja jutrzejsza jeszcze nieopublikowana — zapowiedź bez linku (aktualizuje ją publikacja Dnia N+1).
    h3 = `DZIEŃ ${n} — kolejny fragment Pisma`;
    text = 'Jutro czytamy dalej. Nowa lekcja pojawi się w spisie kursu — wróć, aby kontynuować podróż przez Biblię.';
    link = '';
  }
  return `
    <!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — ${dateLabel(n)}
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        ${h3}
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        ${text}
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        ${link}
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Wróć do spisu kursu
        </a>
      </div>
    </section>
`;
}

const zapisScript = (d) => `
  <!-- SCRIPT: ZASTOSOWANIE I TWÓJ ZAPIS (wzór Dnia 1) -->
  <script>
    (function () {
      const DAY_KEY = 'kc_day${d}';
      const get = (k) => { try { return localStorage.getItem(\`\${DAY_KEY}_\${k}\`); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(\`\${DAY_KEY}_\${k}\`, v); } catch (e) {} };
      function renderCompleted(done) {
        const t = document.getElementById('btn-complete-text');
        const m = document.getElementById('save-status-msg');
        if (t) t.textContent = done ? '✓ Dzień ${d} ukończony' : 'Oznacz Dzień ${d} jako ukończony';
        if (m) m.classList.toggle('hidden', !done);
      }
      window.saveDailyField = function (field, value) { set(field, value); };
      window.updateChecklist = function () {
        ['read', 'understood', 'apply'].forEach((k) => { const el = document.getElementById('chk-' + k); if (el) set('chk_' + k, el.checked); });
      };
      window.completeDay${d} = function () {
        const done = get('completed') !== 'true';
        set('completed', done);
        renderCompleted(done);
      };
      document.addEventListener('DOMContentLoaded', () => {
        const l = document.getElementById('kc-input-learned'); if (l) l.value = get('learned') || '';
        const dc = document.getElementById('kc-input-decision'); if (dc) dc.value = get('decision') || '';
        ['read', 'understood', 'apply'].forEach((k) => { const el = document.getElementById('chk-' + k); if (el) el.checked = get('chk_' + k) === 'true'; });
        renderCompleted(get('completed') === 'true');
      });
    })();
  </script>
`;

// Sekcja udostępniania (#ccDailyShare) z opcjonalnym komentarzem nad nią
const SHARE = /(\r?\n[ \t]*(?:<!--[^\n]*-->\s*)?<section id="ccDailyShare")/;

function transform(html, d) {
  const i = lessonInfo(html, d);
  let s = html;
  const once = (re, rep, what) => { if (!re.test(s)) throw new Error(`Dzień ${d}: brak kotwicy (${what})`); s = s.replace(re, rep); };

  // 1. Logowanie w nagłówku
  if (!s.includes('id="cc-auth-nav-container"')) {
    once(/(<a href="https:\/\/patronite\.pl\/osobowoscplus"[\s\S]*?<\/a>)(\s*<\/div>)/, `$1\n        <div id="cc-auth-nav-container" class="cc-auth-widget-container"></div>$2`, 'patronite');
  }
  // 2. Werset z kopiowaniem
  if (!/navigator\.clipboard\.writeText\('[^']+\(/.test(s)) {
    const m = /<span>Werset Pamięciowy Dnia:<\/span>\s*<\/div>\s*<blockquote[^>]*>\s*([\s\S]*?)\s*<\/blockquote>\s*<div[^>]*>\s*—\s*([^<(]+?)\s*(?:\([^)]*\))?\s*<\/div>/.exec(s);
    if (!m) throw new Error(`Dzień ${d}: brak kotwicy (werset)`);
    const verse = m[1].replace(/^„|”$/g, '').trim();
    const refFull = m[2].trim(); // „Księga Rodzaju 37:11”
    const book = Object.keys(FULL_TO_ABBR).find((b) => refFull.startsWith(b));
    const shortRef = book ? `${FULL_TO_ABBR[book]} ${refFull.slice(book.length).trim()}` : refFull;
    const copy = esc(jsq(`${verse} (${shortRef})`));
    once(/(<span>Werset Pamięciowy Dnia:<\/span>)/, `$1\n          <button type="button" onclick="navigator.clipboard.writeText('${copy}'); alert('Skopiowano werset!');" class="ml-auto text-zinc-400 hover:text-amber-300 text-xs normal-case font-sans min-h-[44px] px-2">\n            <i class="fa-regular fa-copy mr-1"></i>Kopiuj\n          </button>`, 'werset-przycisk');
  }
  // 3. Karta „Podróż przez 66 Ksiąg”
  if (!s.includes('Podróż przez 66 Ksiąg')) {
    once(/(<!-- LESSON BODY CONTENT[^>]*-->\s*<section class="space-y-6">)/, `$1\n${wstep(d, i)}`, 'treść lekcji');
  }
  // 4. Zastosowanie i Twój Zapis + duchowny (przed sekcją udostępniania); stary przycisk ukończenia zastępuje #btn-complete-day
  if (!s.includes('id="btn-complete-day"')) {
    once(SHARE, `\n${zapis(d, i)}${s.includes('id="kontakt-duchowny"') ? '' : duchowny()}$1`, 'sekcja udostępniania');
    once(/\r?\n[ \t]*<!-- COMPLETION BUTTON -->\s*<div class="text-center py-6">[\s\S]*?<div id="completeMsg"[\s\S]*?<\/div>\s*<\/div>\r?\n/, '\n', 'stary przycisk ukończenia');
    s = s.replace(/document\.getElementById\('btnCompleteLesson'\)\.onclick/g, "(document.getElementById('btnCompleteLesson') || {}).onclick");
    s = s.replace(/document\.getElementById\('completeMsg'\)\.classList/g, "document.getElementById('completeMsg')?.classList");
    once(/(\n\s*<!-- Floating Back to Top Button -->)/, `\n${zapisScript(d)}$1`, 'przycisk do góry');
  }
  if (!s.includes('id="kontakt-duchowny"')) {
    once(SHARE, `\n${duchowny()}$1`, 'sekcja udostępniania (duchowny)');
  }
  // 5. Jutro (na końcu treści)
  if (!s.includes('id="jutro"')) {
    once(/(\n\s*<\/main>)/, `\n${jutro(d)}$1`, 'koniec main');
  }
  return s;
}

const days = process.argv.slice(2).map(Number).filter(Boolean);
for (const d of days) {
  const base = fs.readFileSync(`${DIR}/dzien-${pad(d)}.html`, 'utf8');
  const out = transform(base, d);
  for (const p of COPIES(`dzien-${pad(d)}.html`).concat(COPIES(`dzien-${pad(d)}/index.html`))) {
    const cur = fs.readFileSync(p, 'utf8');
    if (cur !== base) throw new Error(`${p} różni się od akademia/kurscodzienny/dzien-${pad(d)}.html — przerwano`);
  }
  for (const p of COPIES(`dzien-${pad(d)}.html`).concat(COPIES(`dzien-${pad(d)}/index.html`))) fs.writeFileSync(p, out);
  console.log(`Dzień ${pad(d)}: zapisano 4 ścieżki`);
}
