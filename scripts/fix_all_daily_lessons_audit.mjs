import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function loadChapter(num) {
  const file = path.join(ROOT, `data/bible/ubg-2025/EXO-${String(num).padStart(3, '0')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function vText(ch, num) {
  const data = loadChapter(ch);
  const found = (data.verses || []).find((v) => v.number === num);
  if (!found) throw new Error(`Brak wersetu Wj ${ch}:${num} w UBG-2025`);
  return found.text;
}

function vRangeHtml(ch, from = 1, to = 999) {
  const data = loadChapter(ch);
  return (data.verses || [])
    .filter((v) => v.number >= from && v.number <= to)
    .map((v) => `        <p><span class="verse-num">${ch}:${v.number}</span> ${v.text}</p>`)
    .join('\n');
}

function vRangePlainHtml(ch) {
  const data = loadChapter(ch);
  return (data.verses || [])
    .map((v) => `        <p><span class="verse-num">${v.number}</span> ${v.text}</p>`)
    .join('\n');
}

// ── GLOBAL FIXES FOR EVERY LESSON (D01..D46 & QUEUE) ──
function fixGlobalMarkup(html, n) {
  let out = html;

  // 1. Uszkodzone <meta name="description" ...> > />
  out = out.replace(/(<meta name="description" content="[^"]*"[^>]*>)\s*>+\s*\/>/g, '$1');

  // 2. Podwójne <a <a
  out = out.replace(/<a\s+<a\b/gi, '<a');

  // 3. Link Patronite radiocc -> osobowoscplus + zdjęcie kolizyjnego id="ccTopSubLink"
  out = out.replace(/https:\/\/patronite\.pl\/radiocc\b/gi, 'https://patronite.pl/osobowoscplus');
  out = out.replace(/(<a\b[^>]*patronite\.pl[^>]*?)\s+id=["']ccTopSubLink["']/gi, '$1');
  out = out.replace(/id=["']ccTopSubLink["']([^>]*patronite\.pl)/gi, '$1');

  // 4. Ujednolicenie przycisku Patronite w topbarze (serce zawsze widoczne na mobile i desktopie, tekst sr-only)
  out = out.replace(
    /<a href="https:\/\/patronite\.pl\/osobowoscplus"[^>]*>[\s\S]*?<\/a>/gi,
    '<a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 inline-flex items-center justify-center" title="Wspieraj Misję Christian Culture" aria-label="Wspieraj Misję Christian Culture"><span>❤️</span><span class="sr-only">Wspieraj</span></a>'
  );

  // 5. Naprawa reguł CSS w <style>, żeby #ccTopSubLink span oraz a[href*="patronite"] nigdy nie chowały pierwszej ikony
  out = out.replace(
    /\.ak-header #ccTopSubLink span,\s*\r?\n\s*\.ak-header a\[href\*="patronite"\] span:not\(:first-child\)/g,
    '.ak-header #ccTopSubLink .sr-only,\n    .ak-header #ccTopSubLink span:not(:first-child),\n    .ak-header a[href*="patronite"] .sr-only,\n    .ak-header a[href*="patronite"] span:not(:first-child)'
  );
  out = out.replace(
    /\.ak-header #ccTopSubLink span,(?!\s*\.ak-header a\[href\*="patronite"\] span:not\(:first-child\))/g,
    '.ak-header #ccTopSubLink .sr-only,\n    .ak-header #ccTopSubLink span:not(:first-child),\n    .ak-header a[href*="patronite"] .sr-only,\n    .ak-header a[href*="patronite"] span:not(:first-child),'
  );
  out = out.replace(
    /@media \(min-width: 640px\) \{([\s\S]*?)\.ak-header #ccTopSubLink (?:span|\.sr-only[\s\S]*?span:not\(:first-child\)),/g,
    '@media (min-width: 640px) {$1.ak-header #ccTopSubLink span:not(.sr-only),\n      .ak-header a[href*="patronite"] span:not(.sr-only),'
  );

  // 6. Naprawa wywołań i nazw funkcji completeDayXX + napisów ukończenia
  if (n) {
    out = out.replace(/\bcompleteDay\d+\(/g, `completeDay${n}(`);
    out = out.replace(/function completeDay\d+\(/g, `function completeDay${n}(`);
    out = out.replace(/window\.completeDay\d+\s*=\s*completeDay\d+/g, `window.completeDay${n} = completeDay${n}`);
    out = out.replace(/window\.completeDay\d+\s*=\s*function/g, `window.completeDay${n} = function`);
    out = out.replace(/Dzień \d+ ukończony!/g, `Dzień ${n} ukończony!`);
    out = out.replace(/Oznacz Dzień \d+ jako ukończony/g, `Oznacz Dzień ${n} jako ukończony`);
  }

  return out;
}

// ── NAPRAWA NAWIGACJI GÓRNEJ I SEKCJI #jutro ──
function fixNavAndJutro(html, n) {
  let out = html;
  if (n < 46) {
    const nextPad = pad2(n + 1);
    const nextBtn = `<a href="/akademia/kurscodzienny/dzien-${nextPad}" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień ${n + 1} →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`;

    // Zmień wyłączony <span>Dzień X+1 (Jutro) →</span> na aktywny link
    out = out.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień \d+[^<]*<\/span>\s*<\/span>/g,
      nextBtn
    );

    // Dla D35, D36 jeśli brakuje przycisku Dzień N+1 w <nav>
    const navMatch = out.match(/<nav class="border-b[\s\S]*?<\/nav>/);
    if (navMatch && !navMatch[0].includes(`dzien-${nextPad}`)) {
      const updatedNav = navMatch[0].replace(/(<\/div>\s*<\/div>\s*<\/nav>)$/, `  ${nextBtn}\n      $1`);
      out = out.replace(navMatch[0], updatedNav);
    }

    // W #jutro: zamień zablokowany <span>Dostępne od północy...</span> lub dodaj przycisk jeśli brak linku do dzien-(n+1)
    const jutroMatch = out.match(/<section[^>]*id="jutro"[\s\S]*?<\/section>/);
    if (jutroMatch) {
      let jutro = jutroMatch[0];
      const studyNextBtn = `<a href="/akademia/kurscodzienny/dzien-${nextPad}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg min-h-[44px]">\n            <span>Studiuj Dzień ${n + 1}</span>\n            <i class="fa-solid fa-arrow-right text-[10px]"></i>\n          </a>`;
      if (/Dostępne od północy/.test(jutro)) {
        jutro = jutro.replace(
          /<span class="inline-flex[^"]*">\s*<span>Dostępne od północy[^<]*<\/span>\s*<\/span>/,
          studyNextBtn
        );
      } else if (!jutro.includes(`dzien-${nextPad}`)) {
        jutro = jutro.replace(
          /(<a href="\/akademia\/kurscodzienny")/,
          `${studyNextBtn}\n          $1`
        );
      }
      out = out.replace(jutroMatch[0], jutro);
    }
  } else if (n === 46) {
    // Usuń wiszące </span> w nav D46
    out = out.replace(
      /(<span>Dzień 47 \(Poniedziałek\) →<\/span>\s*<\/span>)\s*<\/span>/,
      '$1'
    );
  }
  return out;
}

function replaceMemoryVerse(html, { quoteText, citeText, refShort, utteranceText }) {
  let out = html;
  const fullDisplay = `„${quoteText}”`;
  // 1. Wariant <blockquote> (D01..D38)
  out = out.replace(
    /(<blockquote class="font-serif italic text-base sm:text-lg text-white">)[\s\S]*?(<\/blockquote>\s*<div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">\s*)—[^\n<]+/,
    `$1\n          ${fullDisplay}\n        $2— ${citeText}`
  );
  // 2. Wariant <p class="font-serif italic text-base sm:text-lg text-white"> (D39..D46)
  out = out.replace(
    /(Werset do zapamiętania[\s\S]{0,600}?<p class="font-serif (?:italic )?text-base sm:text-lg[^"]*text-(?:white|zinc-100)[^"]*">)[\s\S]*?(<\/p>\s*<(?:p|div) class="[^"]*font-semibold">\s*)—[^\n<]+/,
    `$1\n            ${fullDisplay}\n          $2— ${citeText}`
  );
  // 3. Schowek (z referencją UBG) + TTS
  const clipPayload = refShort ? `${quoteText} (${refShort}, UBG)` : quoteText;
  const escapedClip = clipPayload.replace(/'/g, "\\'");
  out = out.replace(/navigator\.clipboard\.writeText\('[^']*'\)/g, `navigator.clipboard.writeText('${escapedClip}')`);
  const escapedUtts = (utteranceText || `${fullDisplay} (${citeText})`).replace(/"/g, '\\"');
  out = out.replace(
    /new SpeechSynthesisUtterance\("[^"]+"\)/,
    `new SpeechSynthesisUtterance("${escapedUtts}")`
  );
  return out;
}

function buildStrongSection(readingTag, introText, chips) {
  const chipsHtml = chips
    .map(
      (c) =>
        `          <span class="strong-chip"><span class="strong-id">${c.id}</span> <span class="strong-orig">${c.orig}</span> — ${c.meaning}</span>`
    )
    .join('\n');
  return `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
      <section class="kc-card">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
          <i class="fa-solid fa-spell-check text-amber-400"></i>
          <span>Klucze Językowe & Kody Stronga (${readingTag})</span>
        </div>
        <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
          ${introText}
        </p>
        <div class="flex flex-wrap gap-2">
${chipsHtml}
        </div>
      </section>`;
}

function buildExegesisSection(subtitle, parts) {
  const romans = ['I', 'II', 'III', 'IV', 'V'];
  const partsHtml = parts
    .map((p, idx) => {
      const itemsHtml = p.points.map((pt) => `            <p>${pt}</p>`).join('\n');
      return `        <!-- CZĘŚĆ ${romans[idx]} -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">${romans[idx]}</span>
            ${p.heading}
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
${itemsHtml}
          </div>
        </div>`;
    })
    .join('\n\n');

  return `<section class="kc-card space-y-6">
        <div class="flex items-center gap-2 border-b border-brand-line pb-4">
          <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
            <i class="fa-solid fa-scroll"></i>
          </span>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
            <p class="text-xs text-zinc-400">${subtitle}</p>
          </div>
        </div>

        <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
${partsHtml}
        </div>
      </section>`;
}

function buildJezusSection(eyebrow, heading, paragraphs, linkChapter, linkLabel) {
  const pHtml = paragraphs.map((p) => `          <p>\n            ${p}\n          </p>`).join('\n');
  return `<!-- ── JEZUS W CENTRUM ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-cross"></i>
          <span>${eyebrow}</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          ${heading}
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
${pHtml}
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=${linkChapter}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>${linkLabel}</span>
            </a>
          </div>
        </div>
      </section>`;
}

function buildSprawdzSection(items) {
  const cards = items
    .map(
      (it) =>
        `          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">${it.ref}</strong>: ${it.desc}</div>`
    )
    .join('\n');
  return `<!-- ── SPRAWDŹ W BIBLII ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Porównaj wersety we własnym Piśmie Świętym</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — ${items.length} Wersetów Porównawczych
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
${cards}
        </div>
      </section>`;
}

function buildPrawdaSection(heading, bullets) {
  const items = bullets.map((b) => `          <p>• ${b}</p>`).join('\n');
  return `<!-- ── PRAWDA NA DZIŚ ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Prawda na dziś</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          ${heading}
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
${items}
        </div>
      </section>`;
}

function buildPomyslSection(questions) {
  const qs = questions.map((q, i) => `          <p>${i + 1}. ${q}</p>`).join('\n');
  return `<!-- ── POMYŚL ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-heart"></i>
          <span>Pytania do serca (Pomyśl)</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
${qs}
        </div>
      </section>`;
}

function buildDecyzjaSection(heading, body, confession) {
  return `<!-- ── TWOJA DECYZJA ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-flag-checkered"></i>
          <span>Twoja decyzja</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          ${heading}
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            ${body}
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Osobiste Wyznanie Decyzji:</h4>
            <p class="italic text-white">
              „${confession}”
            </p>
          </div>
        </div>
      </section>`;
}

function buildModlitwaSection(dateLabel, heading, paragraphs) {
  const ps = paragraphs.map((p) => `          <p>\n            ${p}\n          </p>`).join('\n');
  return `<!-- ── MODLITWA ── -->
      <section class="kc-card">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i class="fa-solid fa-hands-praying"></i>
          <span>${dateLabel}</span>
        </div>
        <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          ${heading}
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
${ps}
        </div>
      </section>`;
}

function replaceTaskCheckboxes(html, tasks) {
  const tasksHtml = tasks
    .map(
      (t, idx) =>
        `          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-${idx + 1}" onchange="toggleTaskState(${idx + 1})" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>${idx + 1}. ${t}</span>
          </label>`
    )
    .join('\n');

  return html.replace(
    /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(\s*<\/div>\s*<div class="space-y-4 pt-2">)/,
    `$1\n${tasksHtml}$2`
  );
}

function replaceShareLinks(html, dayNum, titleText, reading, verseQuote) {
  const url = `https://polskieradio.cc/akademia/kurscodzienny/dzien-${pad2(dayNum)}`;
  const msg = `Z Biblią za Pan Brat — Dzień ${dayNum}: ${titleText} (${reading}). „${verseQuote}” ${url}`;
  const encMsg = encodeURIComponent(msg);
  const encUrl = encodeURIComponent(url);

  let out = html;
  out = out.replace(
    /https:\/\/api\.whatsapp\.com\/send\?text=[^"']+/g,
    `https://api.whatsapp.com/send?text=${encMsg}`
  );
  out = out.replace(
    /https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=[^"']+/g,
    `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`
  );
  out = out.replace(
    /https:\/\/twitter\.com\/intent\/tweet\?text=[^"']+/g,
    `https://twitter.com/intent/tweet?text=${encMsg}`
  );
  return out;
}

// ── NAPRAWA DNIA 37 (WJ 6:1–30, dotąd wyciek z Wj 5) ──
function fixDay37(html) {
  let out = html;
  const mv6 = vText(6, 6);

  out = out.replace(
    /<meta property="og:title" content="[^"]+" \/>/,
    '<meta property="og:title" content="Dzień 37: TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA — Z Biblią za Pan Brat" />'
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]+" \/>/,
    '<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 37. Objawienie Imienia JAHWE, wieczne przymierze i siedem obietnic odkupienia wyciągniętym ramieniem (Wj 6:1–30)." />'
  );

  // H1, podtytuł Hero i atrybuty obrazu
  out = out.replace(
    /<h1[^>]*>[\s\S]*?<\/h1>/,
    `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA\n      </h1>`
  );
  out = out.replace(/alt="Dzień 37:[^"]*"/g, 'alt="Dzień 37: Teraz zobaczysz, co uczynię faraonowi — siedem obietnic odkupienia (Wj 6:1–30)"');
  out = replaceShareLinks(out, 37, 'TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA', 'Wj 6:1–30', mv6);
  out = out.replace(
    /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
    `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        Objawienie Świętego Imienia JAHWE, niezłomne przymierze i siedem Bożych „Ja uczynię” pośród ludzkiej udręki ducha (Wj 6:1–30)\n      </p>`
  );

  out = replaceMemoryVerse(out, {
    quoteText: mv6,
    citeText: 'Księga Wyjścia 6:6 (UBG)',
    refShort: 'Wj 6:6',
    utteranceText: `${mv6} (Księga Wyjścia 6:6)`
  });

  // Myśl przewodnia lekcji
  out = out.replace(
    /(<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*)[\s\S]*?(<\/div>\s*<\/header>)/,
    `$1Szósty rozdział Księgi Wyjścia przenosi punkt ciężkości z ludzkiej niemocy na suwerenny autorytet JAHWE: na rozpaczliwy krzyk zniechęconych serc Bóg odpowiada siedmiokrotną przysięgą odkupienia wyciągniętym ramieniem — nie ze względu na entuzjazm człowieka, lecz przez wierność własnemu Imieniu i przymierzu.\n      </div>\n    </header>`
  );

  // Tekst Pisma Świętego (Wj 6:1–30 z UBG-2025)
  out = out.replace(
    /(<div class="kc-prose-reading">)[\s\S]*?(<\/div>\s*<\/section>)/,
    `$1\n${vRangePlainHtml(6)}\n      $2`
  );

  // Kody Stronga (Wj 6)
  const strong37 = `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
    <section class="kc-card">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
        <i class="fa-solid fa-spell-check text-amber-400"></i>
        <span>Klucze Językowe & Kody Stronga (Wj 6)</span>
      </div>
      <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
        Poniższe terminy hebrajskie stanowią osnowę teologiczną 6. rozdziału Księgi Wyjścia:
      </p>
      <div class="flex flex-wrap gap-2">
        <span class="strong-chip"><span class="strong-id">H3068</span> <span class="strong-orig">יְהוָה (JHWH / JAHWE)</span> — Święte Imię Przymierza: Bóg wierny i obecny jako Wybawiciel (Wj 6:2, 6, 8)</span>
        <span class="strong-chip"><span class="strong-id">H7706</span> <span class="strong-orig">אֵל שַׁדַּי (El Szaddaj)</span> — Bóg Wszechmogący, objawiony patriarchom w obietnicy (Wj 6:3)</span>
        <span class="strong-chip"><span class="strong-id">H1350</span> <span class="strong-orig">גָּאַל (ga'al)</span> — wykupić / odkupić jako najbliższy krewny Go'el (Wj 6:6)</span>
        <span class="strong-chip"><span class="strong-id">H1285</span> <span class="strong-orig">בְּרִית (berit)</span> — niezłomne przymierze, które Bóg pamięta mimo ucisku (Wj 6:4–5)</span>
        <span class="strong-chip"><span class="strong-id">H7115</span> <span class="strong-orig">קֹצֶר רוּחַ (qocer ruach)</span> — skrócenie ducha / udręka odbierająca tchnienie nadziei (Wj 6:9)</span>
        <span class="strong-chip"><span class="strong-id">H5450</span> <span class="strong-orig">סִבְלוֹת (siblot)</span> — ciężary przymusowej niewoli, spod których PAN wyprowadza (Wj 6:6–7)</span>
      </div>
    </section>`;
  out = out.replace(/<!-- HEBREW STRONG CODES[\s\S]*?<\/section>/, strong37);

  // Egzegeza (Wj 6:1–30)
  const egz37 = `<!-- THEOLOGICAL EXEGESIS (4 CZĘŚCI) -->
    <section class="kc-card space-y-6">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-scroll"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
          <p class="text-xs text-zinc-400">Cztery części studium Wj 6:1–30 (32 punkty analityczne)</p>
        </div>
      </div>

      <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            OBJAWIENIE IMIENIA JAHWE I PAMIĘĆ PRZYMIERZA (WJ 6:1–5)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Suwerenne „Teraz zobaczysz” (6:1a):</strong> Na pełne bólu pytanie Mojżesza z końca Wj 5 Bóg nie odpowiada wyrzutem, lecz obietnicą ukazania swojej mocy bezpośrednio nad opornym faraonem.</p>
            <p><strong>2. Przymus bezwarunkowy (6:1b):</strong> Faraon nie tylko pozwoli Izraelowi odejść — „mocną ręką wypędzi ich ze swojej ziemi”.</p>
            <p><strong>3. Od El Szaddaj do JAHWE (6:2–3):</strong> Patriarchowie znali brzmienie tetragramu (Rdz 15:7), lecz teraz Bóg objawia pełną historyczną wierność tego Imienia jako Ten, kto wypełnia przysięgę ojców.</p>
            <p><strong>4. Ustanowione przymierze Kanaan (6:4):</strong> Ziemia pielgrzymowania Abrahama, Izaaka i Jakuba pozostaje nienaruszalnym darem przymierza.</p>
            <p><strong>5. Bóg słyszy jęk uciśnionych (6:5):</strong> Żadna łza niewolnika nie znika w ciszy; słyszenie Boga łączy się ze wspomnieniem przymierza.</p>
            <p><strong>6. Pieczęć „Ja jestem PAN” (6:2, 6, 8):</strong> Powtarzająca się formuła stanowi podpis samego Stwórcy pod planem wyzwolenia.</p>
            <p><strong>7. Bóg ponad polityką mocarstw:</strong> To JAHWE dyktuje kalendarz wyjścia, a nie dwór królewski Egiptu.</p>
            <p><strong>8. Fundament wiary na czas zwątpienia:</strong> Gdy ludzkie wysiłki ponoszą porażkę, oparciem wierzącego pozostaje niezmienny charakter Boga.</p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            HEPTADA ODKUPIENIA — SIEDEM BOŻYCH „JA UCZYNIĘ” (WJ 6:6–8)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>9. Pierwsze słowo — „Wyprowadzę” (hoceti, 6:6a):</strong> Zerwanie z ciężarami przymusowej pracy egipskiej.</p>
            <p><strong>10. Drugie słowo — „Wyrwę” (hicalti, 6:6b):</strong> Ostateczne wyrwanie spod władzy ciemięzcy.</p>
            <p><strong>11. Trzecie słowo — „Wybawię / Odkupię” (ga'alti, 6:6c):</strong> Bóg występuje jako Go'el — najbliższy krewny płacący wykup wyciągniętym ramieniem.</p>
            <p><strong>12. Wielkie sądy sprawiedliwości (6:6d):</strong> Wybawienie wiąże się z demaskacją fałszywych bóstw Egiptu.</p>
            <p><strong>13. Czwarte słowo — „Wezmę was sobie za lud” (lakahti, 6:7a):</strong> Zaślubiny przymierza i nadanie nowej tożsamości.</p>
            <p><strong>14. Piąte słowo — „Będę wam Bogiem” (wehajiti, 6:7b):</strong> Osobista wspólnota Zbawiciela z wybawionym ludem.</p>
            <p><strong>15. Szóste słowo — „Wprowadzę was” (heweti, 6:8a):</strong> Droga ma swój cel — Bóg nie porzuca na pustyni.</p>
            <p><strong>16. Siódme słowo — „Dam wam w dziedzictwo” (natatti, 6:8b):</strong> Trwałe obdarowanie ziemią obiecaną przysięgą.</p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            UDRĘKA DUCHA IZRAELA I KRYZYS MOJŻESZA (WJ 6:9–13)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Duchowy paraliż pośród ludu (6:9):</strong> „Z powodu przeciążenia (udręki ducha) i ciężkiej pracy” Izrael nie potrafi przyjąć nawet najlepszej wieści.</p>
            <p><strong>18. Wrażliwość psychologiczna Pisma:</strong> Biblia uczciwie opisuje, jak długotrwały ucisk przytępia zdolność zaufania.</p>
            <p><strong>19. Bóg niezrażony brakiem entuzjazmu (6:10–11):</strong> Zniechęcenie słuchaczy nie zatrzymuje Bożego nakazu pójścia do faraona.</p>
            <p><strong>20. Logika rozpaczy Mojżesza (6:12a):</strong> „Oto synowie Izraela nie usłuchali mnie — jakże więc posłucha mnie faraon?”.</p>
            <p><strong>21. „Nieobrzezane wargi” (6:12b):</strong> Prorok odczuwa własną nieporadność jako barierę nie do pokonania.</p>
            <p><strong>22. Boża odpowiedź rozkazem misyjnym (6:13):</strong> PAN ponownie potwierdza wspólny mandat Mojżesza i Aarona wobec Izraela oraz faraona.</p>
            <p><strong>23. Słabość sługi miejscem mocy Boga:</strong> Autorytet poselstwa nie płynie z retoryki, lecz z posyłającego Boga.</p>
            <p><strong>24. Przejście od uczuć do posłuszeństwa:</strong> Wytrwałość w służbie opiera się na rozkazie PANA, nie na nastroju chwili.</p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            RODOWÓD PRZYMIERZA I WIERNOŚĆ POWOŁANIU (WJ 6:14–30)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>25. Historyczne zakorzenienie posłańców (6:14–19):</strong> Wykaz rodów Rubena, Symeona i Lewiego osadza Wyjście w realnych dziejach rodzin.</p>
            <p><strong>26. Pokolenie Amrama i Jokebed (6:20):</strong> Mojżesz i Aaron są dziećmi wierzącego domu z pokolenia Lewiego.</p>
            <p><strong>27. Zapowiedź linii kapłańskiej (6:23–25):</strong> Aaron, Eliszeba oraz Pinchas sygnalizują ciągłość służby ołtarza aż po kolejne pokolenia.</p>
            <p><strong>28. „To jest ten Aaron i Mojżesz” (6:26–27):</strong> Kronikarskie potwierdzenie, że właśnie ci ludzie z ludzkimi lękami zostali wybrani do wyprowadzenia zastępów PANA.</p>
            <p><strong>29. Wznowienie narracji (6:28–30):</strong> Po rodowodzie tekst wraca do napięcia misji i skargi Mojżesza o nieobrzezanych wargach.</p>
            <p><strong>30. Czas trwania służby ojców (137 lat Lewiego, Kehata, Amrama):</strong> Wyjście dojrzewało przez stulecia pamięci rodzinnej.</p>
            <p><strong>31. Zwykli ludzie w ręku Wszechmogącego:</strong> Bóg posługuje się niedoskonałymi świadkami, aby cała chwała należała do Niego.</p>
            <p><strong>32. Most do 7. rozdziału:</strong> Po tym dialogu Bóg ustanawia Mojżesza i Aarona do znaków i cudów w Egipcie.</p>
          </div>
        </div>
      </div>
    </section>`;
  out = out.replace(/<!-- THEOLOGICAL EXEGESIS[\s\S]*?<\/section>\s*(?=<section class="kc-card">\s*<div[^>]*>\s*<i class="fa-solid fa-cross)/, egz37 + '\n\n    ');

  const jezus37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Chrystus — Nasz Boski Go'el (Odkupiciel) i „Tak” Wszystkich Obietnic</h3>
      <div class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
        <p>Siedem Bożych „Ja jestem PAN — wyprowadzę, wyrwę, wybawię, wezmę was sobie za lud...” z Wj 6:6–8 osiąga swoje pełne wypełnienie w Jezusie Chrystusie. Hebrajskie słowo <em>ga'al</em> wskazuje na Odkupiciela (<em>Go'ela</em>), który płaci cenę wykupu za zniewolonego krewnego. Syn Boży przyjął nasze człowieczeństwo, aby stać się naszym Bratem i własną krwią wykupić nas spod ciężarów grzechu oraz śmierci (Ga 4:4–5; 1 P 1:18–19).</p>
        <p>Gdy Jezus ogłasza przed przeciwnikami: „Zanim Abraham się stał, JA JESTEM” (J 8:58), utożsamia się bezpośrednio z Tym, który przemówił do Mojżesza imieniem JAHWE w Wj 6:2–3. W Nim człowiek zdławiony przez „udrękę ducha” (<em>qocer ruach</em>) i poczucie bezsilności otrzymuje Ducha Świętego, oczyszczone sumienie oraz dziedzictwo nowego stworzenia, bo „ile tylko jest obietnic Bożych, wszystkie w Nim są Tak i Amen” (2 Kor 1:20).</p>
      </div>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-cross[\s\S]*?<\/section>/, jezus37);

  const sprawdz37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-book-bible"></i>
        <span>Sprawdź w Biblii</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Porównaj wersety w swojej Biblii — studium porównawcze Wj 6:1–30</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Wj 6:2–3 a Rdz 17:1</strong> — Jak objawienie Boga jako El Szaddaj przygotowało patriarchów na poznanie mocy Imienia JAHWE w wyzwoleniu narodu?</li>
        <li><strong>Wj 6:4–5 a Rdz 15:13–14</strong> — Wypełnienie starożytnej przysięgi o wyprowadzeniu z niewoli i wielkich sądach nad ciemięzcą.</li>
        <li><strong>Wj 6:6 a Tt 2:14</strong> — Związek między starotestamentowym <em>ga'al</em> (odkupieniem z Egiptu) a ofiarą Chrystusa wykupującego swój własny lud.</li>
        <li><strong>Wj 6:7 a 1 P 2:9–10</strong> — Obietnica „wezmę was sobie za lud i będę wam Bogiem” przeniesiona na Kościół Nowego Przymierza.</li>
        <li><strong>Wj 6:8 a 2 Kor 1:20</strong> — Boża przysięga „podniosłem swoją rękę” jako rękojmia niezmienności wszystkich obietnic w Chrystusie.</li>
        <li><strong>Wj 6:9 a Iz 40:28–31</strong> — Jak Bóg podnosi ludzi zmiażdżonych „udręką ducha”, gdy brakuje już sił na słuchanie?</li>
        <li><strong>Wj 6:12 a Jr 1:6–9</strong> — Wspólna skarga powołanych proroków („nie umiem mówić”) i Boża obietnica obecności mimo lęku.</li>
        <li><strong>Wj 6:20 a Hbr 11:23</strong> — Wiara Amrama i Jokebed, która wydała przewodników wyjścia z domu niewoli.</li>
      </ul>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-book-bible[\s\S]*?<\/section>/, sprawdz37);

  const prawda37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Prawda na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Prawda na dziś — co zmienia się w moim patrzeniu na Boże obietnice</h3>
      <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <p>• <strong>Wierność Boga nie zależy od Twoich emocji:</strong> Nawet gdy z powodu udręki ducha (Wj 6:9) nie potrafisz odczuć radości, siedem Bożych obietnic pozostaje w mocy.</p>
        <p>• <strong>Zbawienie jest od początku do końca dziełem łaski:</strong> Siedem czasowników w Wj 6:6–8 wypowiada sam Bóg — to On wyprowadza, wyrywa i odkupuje.</p>
        <p>• <strong>Przeszkody nie zaskakują Wszechmogącego:</strong> Boże „Teraz zobaczysz” rozbrzmiewa właśnie wtedy, gdy ludzki plan wydaje się przegrany.</p>
        <p>• <strong>Nieobrzezane wargi nie przekreślają powołania:</strong> Bóg używa sług świadomych swojej słabości, aby zwycięstwo było wyraźnie Jego dziełem.</p>
        <p>• <strong>Pamięć Boga jest niezawodna:</strong> Słyszy Twój cichy jęk i dotrzymuje przymierza zawartego w krwi Jezusa Chrystusa.</p>
      </div>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-lightbulb[\s\S]*?<\/section>/, prawda37);

  const pomysl37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-heart"></i>
        <span>Pomyśl</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Pytania do serca</h3>
      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal list-inside">
        <li>Która z siedmiu obietnic w Wj 6:6–8 („wyprowadzę, wyrwę, wybawię, wezmę, będę Bogiem, wprowadzę, dam dziedzictwo”) najbardziej mówi dziś do Twojej sytuacji?</li>
        <li>Czy przeżywasz teraz stan przypominający <em>qocer ruach</em> — udrękę ducha, przez którą nawet dobre Słowo z trudem dociera do serca (Wj 6:9)?</li>
        <li>W jakich chwilach czujesz się niegodny jak Mojżesz mówiący o „nieobrzezanych wargach” (Wj 6:12) i czy pozwalasz Bogu działać mimo tej słabości?</li>
        <li>Co to znaczy dla Ciebie osobiście, że Bóg pamięta o swoim przymierzu niezależnie od zmieniających się okoliczności (Wj 6:5)?</li>
        <li>Czy wierzysz, że Boże „Teraz zobaczysz, co uczynię” może odmienić sprawę, nad którą po ludzku straciłeś już nadzieję (Wj 6:1)?</li>
        <li>W jaki sposób Twoje codzienne życie świadczy o tym, że należysz do „ludu Bożego” wziętego na własność (Wj 6:7)?</li>
        <li>Jakie dziedzictwo wiary przekazujesz swoim bliskim, podobnie jak ród Amrama i Jokebed (Wj 6:20)?</li>
        <li>Jak dziś konkretnie powierzysz Chrystusowi ciężary (<em>siblot</em>), których sam nie jesteś w stanie unieść?</li>
      </ol>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-heart[\s\S]*?<\/section>/, pomysl37);

  const decyzja37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Twoja decyzja</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Twoja decyzja wiary</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Szósty rozdział Księgi Wyjścia zaprasza Cię do przestawienia wzroku z własnego zniechęcenia i ludzkiej słabości na siedmiokrotne „Ja jestem PAN” Zbawiciela. Niezależnie od tego, jak bardzo ucisk codzienności odebrał Ci oddech nadziei (Wj 6:9), Bóg nie cofa żadnego ze swoich słów. Dziś wybierz zaufanie Jego obietnicy odkupienia i rusz w posłuszeństwie, choćbyś czuł na wargach własną bezradność.
      </p>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-serif italic">
        <strong>MOJA DECYZJA:</strong> Panie Boże JAHWE, dziękuję Ci za siedem obietnic odkupienia, które potwierdziłeś w krwi Jezusa Chrystusa. Odrzucam paraliżujące zniechęcenie i przyjmuję Twoje „Ja jestem PAN — wyprowadzę i wybawię”. Oddaję Ci moje nieudolne wargi i słabe siły, abyś to Ty sam był uwielbiony w moim domu i powołaniu.
      </div>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-flag-checkered[\s\S]*?<\/section>/, decyzja37);

  const modlitwa37 = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hands-praying"></i>
        <span>Modlitwa</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Modlitwa na 6 listopada</h3>
      <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed italic space-y-2">
        <p>Wszechmogący Boże Abrahama, Izaaka i Jakuba, wierny Panie JAHWE, który nigdy nie łamiesz swojego przymierza!</p>
        <p>Przychodzę przed Twoje święte oblicze z szóstym rozdziałem Księgi Wyjścia w sercu. Ty znasz chwile, gdy przez ciężary życia i udrękę ducha nie potrafimy usłyszeć obietnicy wolności. Dziękuję Ci, że nie wycofujesz swojego miłosierdzia w chwilach naszej słabości, lecz wymawiasz nad nami potężne: „Teraz zobaczysz, co uczynię”.</p>
        <p>Uwielbiam Cię, Jezu Chryste — mój boski Odkupicielu (Go'elu), który wyciągniętym ramieniem na krzyżu Golgoty wyrwałeś mnie spod jarzma grzechu i wziąłeś mnie sobie za własność. Uzdrow moje zmęczone serce i podnieś ducha z przygnębienia.</p>
        <p>Przemień moje „nieobrzezane wargi” w narzędzie prawdy i odwagi, abym w Twoim pokoju niósł światło Ewangelii moim bliskim i wszystkim powierzonym mi osobom. Przez Jezusa Chrystusa, mojego Pana. Amen.</p>
      </div>
    </section>`;
  out = out.replace(/<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400[^>]*>\s*<i class="fa-solid fa-hands-praying[\s\S]*?<\/section>/, modlitwa37);

  out = out.replace(
    /Przeczytaj cały fragment <a href="\/mojabiblia\?book=EXO&chapter=\d+" class="text-amber-300 underline font-semibold">[^<]+<\/a>/,
    'Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=6" class="text-amber-300 underline font-semibold">Księgi Wyjścia 6:1–30</a>'
  );

  // 20 pytań quizowych ściśle z Wj 6:1–30 (UBG-2025)
  const quiz37 = [
    { q: 'Co powiedział PAN Mojżeszowi na początku szóstego rozdziału w sprawie faraona (Wj 6:1)?', a: ['Że wyśle najpierw anioła pokoju do pałacu', '„Teraz zobaczysz, co uczynię faraonowi; mocną ręką wypuści ich i mocną ręką wypędzi ich ze swojej ziemi”', 'Że Izraelici mają czekać jeszcze sto lat w Egipcie'], c: 1 },
    { q: 'Pod jakim imieniem Bóg objawił się Abrahamowi, Izaakowi i Jakubowi według Wj 6:3?', a: ['Jako Król Wschodu', 'Jako Bóg Wszechmogący (El Szaddaj)', 'Jako Pan Zastępów'], c: 1 },
    { q: 'Jakiej obietnicy wspomnienie podkreśla PAN w Wj 6:4?', a: ['Przymierza o zbudowaniu pałacu w Egipcie', 'Przymierza ustanowionego z ojcami, by dać im ziemię Kanaan', 'Przymierza o zniesieniu wszelkich świąt'], c: 1 },
    { q: 'Co wzbudziło Bożą reakcję opisaną w Wj 6:5?', a: ['Zwycięstwo armii Izraela nad rzeką Nil', 'Słyszenie jęku synów Izraela, których Egipcjanie trzymają w niewoli, oraz pamięć o przymierzu', 'List dziękczynny dostojników faraona'], c: 1 },
    { q: 'Ile wielkich zapowiedzi („wyprowadzę, wyrwę, wybawię, wezmę, będę, wprowadzę, dam”) Bóg składa w Wj 6:6–8?', a: ['Trzy zapowiedzi', 'Siedem obietnic odkupienia', 'Dwanaście przysiąg'], c: 1 },
    { q: 'W jaki sposób Bóg zapowiedział wybawienie Izraela w Wj 6:6?', a: ['Przez tajne przekupstwo urzędników faraona', 'Wyciągniętym ramieniem i przez wielkie sądy', 'Przez powstanie zbrojne samych niewolników'], c: 1 },
    { q: 'Jaką relację zapowiedział PAN w słowach z Wj 6:7?', a: ['„Wezmę was sobie za lud i będę wam Bogiem”', '„Pozostaniecie poddanymi faraona przez pokolenia”', '„Sam Mojżesz będzie wam jedynym bogiem”'], c: 0 },
    { q: 'Dlaczego synowie Izraela NIE usłuchali Mojżesza po usłyszeniu tych wielkich obietnic (Wj 6:9)?', a: ['Ponieważ chcieli najpierw koronować faraona', 'Z powodu przeciążenia (udręki ducha) i ciężkiej pracy', 'Bo Mojżesz odmówił rozmowy ze starszyzną'], c: 1 },
    { q: 'Jaką wymówkę lub trudność przed PANEM wyraził Mojżesz w Wj 6:12?', a: ['„Moje wojsko nie ma rydwanów”', '„Synowie Izraela nie usłuchali mnie... jakże posłucha mnie faraon, skoro jestem człowiekiem nieobrzezanych warg?”', '„Zapomniałem drogi do pałacu w Memfis”'], c: 1 },
    { q: 'Komu PAN wydał wspólny rozkaz dotyczący synów Izraela i faraona w Wj 6:13?', a: ['Jozue i Kalebowi', 'Mojżeszowi i Aaronowi', 'Miriam i Churovi'], c: 1 },
    { q: 'Którzy trzej synowie Jakuba otwierają wykaz rodów w Wj 6:14–16?', a: ['Juda, Dan i Józef', 'Ruben, Symeon i Lewi', 'Gad, Aszer i Beniamin'], c: 1 },
    { q: 'Ile lat żył Lewi według Wj 6:16?', a: ['Sto trzydzieści siedem lat', 'Osiemdziesiąt pięć lat', 'Sto dziesięć lat'], c: 0 },
    { q: 'Kim byli trzej synowie Lewiego wymienieni w Wj 6:16?', a: ['Korach, Datan i Abiram', 'Gerszon, Kehat i Merari', 'Nadab, Abihu i Eleazar'], c: 1 },
    { q: 'Jak miała na imię matka Aarona i Mojżesza w Wj 6:20?', a: ['Syfra', 'Jokebed', 'Sefora'], c: 1 },
    { q: 'Kto był ojcem Aarona i Mojżesza (Wj 6:20)?', a: ['Amram', 'Jishar', 'Chebron'], c: 0 },
    { q: 'Kogo pojął za żonę Aaron według Wj 6:23?', a: ['Miriam, prorokinię z Goszen', 'Eliszebę, córkę Amminadaba, siostrę Nachszona', 'Asenat z On'], c: 1 },
    { q: 'Który wnuk Aarona został wymieniony pod koniec rodowodu w Wj 6:25?', a: ['Pinchas, syn Eleazara', 'Gerszom, syn Mojżesza', 'Jozue, syn Nuna'], c: 0 },
    { q: 'Jaki przydomek nadaje narrator Aaronowi i Mojżeszowi w Wj 6:26?', a: ['„Budowniczowie piramid faraona”', '„Ci, którym PAN powiedział: Wyprowadźcie synów Izraela z ziemi Egiptu według ich zastępów”', '„Mędrcy z krainy Madian”'], c: 1 },
    { q: 'Które z imion synów Aarona z Eliszeby podaje Wj 6:23?', a: ['Nadab, Abihu, Eleazar i Itamar', 'Kain, Abel, Set i Enosz', 'Sema, Cham, Jafet i Kanaan'], c: 0 },
    { q: 'Jak kończy się szósty rozdział Księgi Wyjścia w Wj 6:30?', a: ['Szybkim wymarszem przez pustynię Szur', 'Powtórzoną obawą Mojżesza: „Oto mam nieobrzezane wargi — jakże więc posłucha mnie faraon?”', 'Koronacją Aarona na króla Egiptu'], c: 1 }
  ];
  out = out.replace(
    /const QUIZ_DATA = \[[\s\S]*?\];/,
    `const QUIZ_DATA = ${JSON.stringify(quiz37, null, 2)};`
  );
  return out;
}

// ── DANE DLA DNI 43, 44, 45, 46 ──
const D43_CONFIG = {
  title: 'WYJŚCIE Z EGIPTU — BÓG PROWADZI SWÓJ LUD',
  reading: 'Wj 12:37–13:22',
  mvChapter: 13,
  mvVerse: 21,
  strong: buildStrongSection(
    'Wj 12:37–13:22',
    'Poniższe terminy hebrajskie stanowią osnowę teologiczną fragmentu Wj 12:37–13:22 (wyjście z Ramzes, ustawa Paschy i słup obłoku oraz ognia):',
    [
      { id: 'H4682', orig: 'מַצָּה (macah)', meaning: 'przaśnik / chleb bez zakwasu pośpiechu i czystości serca (Wj 12:39; 13:6–7)' },
      { id: 'H6942', orig: 'קָדַשׁ (qadasz)', meaning: 'poświęcić, oddzielić wyłącznie dla Boga każdego pierworodnego (Wj 13:2)' },
      { id: 'H1060', orig: 'בְּכוֹר (bekhor)', meaning: 'pierworodny, wykupiony ofiarą jako własność PANA (Wj 13:2, 13–15)' },
      { id: 'H5982', orig: 'עַמּוּד (ammud)', meaning: 'słup / filar obecności Bożej wiodący obóz Izraela (Wj 13:21–22)' },
      { id: 'H6051', orig: 'עָנָן (anan)', meaning: 'obłok chwały chroniący lud w żarze pustyni za dnia (Wj 13:21)' },
      { id: 'H784', orig: 'אֵשׁ (esz)', meaning: 'ogień PANA rozświetlający mrok nocy w drodze wolności (Wj 13:21)' },
      { id: 'H5148', orig: 'נָחָה (nachah)', meaning: 'prowadzić pewną ręką, omijając zasadzki wojny filistyńskiej (Wj 13:17, 21)' },
      { id: 'H2142', orig: 'זָכַר (zakhar)', meaning: 'pamiętać dzień wyjścia z domu niewoli w każdym pokoleniu (Wj 13:3)' }
    ]
  ),
  exegesis: buildExegesisSection('Pięć części studium Wj 12:37–13:22 (35 punktów analitycznych)', [
    {
      heading: 'WYMARSZ Z RAMZES I WYPEŁNIENIE 430 LAT (WJ 12:37–42)',
      points: [
        '<strong>1. Historyczny ruch sześciuset tysięcy mężczyzn (12:37):</strong> Z Ramzes wyrusza do Sukkot cały naród z kobietami, dziećmi i licznym dobytkiem — dowód Bożej obietnicy rozmnożenia danej Abrahamowi.',
        '<strong>2. „Mnóstwo obcego ludu” (erew raw, 12:38):</strong> Razem z Izraelem wychodzą nie-Izraelici poruszeni mocą PANA — od początku odkupienie ma wymiar otwarty dla pokornych cudzoziemców.',
        '<strong>3. Przaśne placki wygnania (12:39):</strong> Brak zakwaszonego chleba uwiecznia moment, gdy Bóg nagle wyrwał lud z niewoli bez zbędnych przygotowań.',
        '<strong>4. Kalendarzowa precyzja Boga (12:40–41):</strong> Co do dnia po 430 latach „wszystkie zastępy PANA wyszły z ziemi Egiptu”.',
        '<strong>5. Noc czuwania dla PANA (12:42):</strong> Niezwykła noc wyjścia staje się wieczną wigilią pamięci i dziękczynienia dla wszystkich pokoleń.'
      ]
    },
    {
      heading: 'USTAWA PASCHY — JEDNO PRAWO DLA LUDU I CUDZOZIEMCA (WJ 12:43–51)',
      points: [
        '<strong>6. Granica przymierza przy stole paschalnym (12:43–45):</strong> Najemnik i nieobrzezany przybysz nie uczestniczą w wieczerzy, bo wspólnota paschalna oznacza pełne wejście w przymierze.',
        '<strong>7. Otwarta brama dla gości wiary (12:48–49):</strong> Każdy cudzoziemiec przyjmujący znak przymierza ma „jedno prawo” z urodzonym w Izraelu — zapowiedź powołania pogan w Chrystusie (Ef 2:19).',
        '<strong>8. Spożywanie w jednym domu i zakaz łamania kości (12:46):</strong> Baranek jednoczy rodzinę i proroczo zapowiada ciało Chrystusa na krzyżu (J 19:36).',
        '<strong>9. Powszechne posłuszeństwo ludu (12:50–51):</strong> Całe zgromadzenie czyni dokładnie tak, jak PAN rozkazał.'
      ]
    },
    {
      heading: 'POŚWIĘCENIE PIERWORODNYCH I PAMIĘĆ ZNAKÓW (WJ 13:1–16)',
      points: [
        '<strong>10. „Poświęć Mi wszystko pierworodne” (13:1–2):</strong> Życie uratowane przez krew baranka w Egipcie należy teraz w pełni do Boga.',
        '<strong>11. Święto Przaśników w miesiącu Abib (13:3–8):</strong> Siedem dni bez kwasu uczy dzieci, co PAN uczynił potężną ręką.',
        '<strong>12. Znak na ręce i między oczami (13:9, 16):</strong> Prawo Boże ma przenikać zarówno czyny człowieka (ręka), jak i jego myśli (czoło).',
        '<strong>13. Wykupienie osła barankiem i wykup synów (13:13–15):</strong> Zwierzę nieczyste zastąpione barankiem oraz wykup pierworodnych synów przypominają cenę ocalenia — „mocną ręką wyprowadził nas PAN”.'
      ]
    },
    {
      heading: 'OKRĘŻNA DROGA ŁASKI I KOŚCI JÓZEFA (WJ 13:17–19)',
      points: [
        '<strong>14. Mądra okrężna trasa Bożej opieki (13:17):</strong> Bóg nie kieruje młodych duchem pielgrzymów najkrótszą drogą przez ziemię Filistynów, by widok wojny nie złamał ich odwagi.',
        '<strong>15. Złożona lekcja dla nas:</strong> Czasem dłuższą drogą przez pustynię PAN chroni nasze niedojrzałe jeszcze serce przed załamaniem i chęcią powrotu do Egiptu.',
        '<strong>16. Izrael w uporządkowanym szyku (13:18):</strong> Z niewolniczego chaosu Bóg tworzy zdyscyplinowaną wspólnotę wolnych ludzi.',
        '<strong>17. Wierność przysiędze nad kośćmi Józefa (13:19):</strong> Mojżesz zabiera szczątki patriarchy (Rdz 50:25), łącząc koniec Księgi Rodzaju z wypełnieniem w Księdze Wyjścia.'
      ]
    },
    {
      heading: 'SŁUP OBŁOKU ZA DNIA I SŁUP OGNIA W NOCY (WJ 13:20–22)',
      points: [
        '<strong>18. Granica pustyni w Etam (13:20):</strong> Tam, gdzie kończy się bezpieczeństwo osiedli, zaczyna się widzialna bliskość Boga.',
        '<strong>19. Widzialna obecność PANA (13:21):</strong> Za dnia chłód i kierunek w słupie obłoku; w chłodzie nocy blask i opieka w słupie ognia — aby mogli iść dniem i nocą.',
        '<strong>20. Obietnica nieustannej obecności (13:22):</strong> Słup nie ustępował sprzed ludu — jak Chrystus obiecujący „Ja jestem z wami po wszystkie dni” (Mt 28:20).'
      ]
    }
  ]),
  jezus: buildJezusSection(
    'Jezus w centrum',
    'Chrystus — Pierworodny Przymierza, Przaśny Chleb i Ognisty Słup Przewodnictwa',
    [
      'Fragment Wj 12:37–13:22 ukazuje trzy potężne obrazy naszego Zbawiciela. Po pierwsze, w przepisie paschalnym: „nie złamiecie jego kości” (Wj 12:46) Ewangelia Jana rozpoznaje bezpośrednie proroctwo o ciele Jezusa na Golgocie (J 19:36). Po drugie, Jezus jest „Pierworodnym między wieloma braćmi” (Rz 8:29), przedstawionym Bogu w świątyni zgodnie z prawem pierworodnych z Wj 13:2 (Łk 2:22–23) — On złożył za nas okup własnym życiem (1 Tm 2:6).',
      'Po trzecie, słup obłoku za dnia i słup ognia nocą (Wj 13:21) zapowiadają Jezusa, który nazywa Siebie „Światłością świata” (J 8:12): kto idzie za Nim, nie będzie chodził w ciemności, lecz będzie miał światło życia. Nawet gdy Bóg prowadzi Cię drogą okrężną (Wj 13:17), Słup Jego obecności nigdy nie odstępuje.'
    ],
    13,
    'Czytaj Wj 12:37–13:22'
  ),
  sprawdz: buildSprawdzSection([
    { ref: 'Wj 12:40–41 → Rdz 15:13', desc: 'Dokładne wypełnienie proroctwa danego Abrahamowi po 400/430 latach ucisku.' },
    { ref: 'Wj 12:46 → J 19:36', desc: '„Żadna jego kość nie będzie złamana” — wypełnione na ciele Chrystusa podczas ukrzyżowania.' },
    { ref: 'Wj 12:48–49 → Ef 2:19', desc: 'Jedno prawo dla Izraelity i obcego: w Chrystusie nie jesteśmy już obcymi, lecz domownikami Boga.' },
    { ref: 'Wj 13:2 → Łk 2:23', desc: 'Józef i Maria przynoszą małego Jezusa do Jerozolimy zgodnie z nakazem: „Każdy pierworodny będzie poświęcony Panu”.' },
    { ref: 'Wj 13:7 → 1 Kor 5:7–8', desc: 'Oczyszczenie domu z kwasu jako wezwanie do życia w szczerości i prawdzie.' },
    { ref: 'Wj 13:9 → Pwt 6:6–8', desc: 'Słowo Boże ma być znakiem czynów (na ręce) i myśli (między oczami).' },
    { ref: 'Wj 13:13 → 1 P 1:18–19', desc: 'Wykupienie pierworodnego nie srebrem ani złotem, lecz drogocenną krwią Chrystusa.' },
    { ref: 'Wj 13:17 → 1 Kor 10:13', desc: 'Bóg nie dopuszcza próby ponad nasze siły — czasem chroni nas, prowadząc drogą okrężną.' },
    { ref: 'Wj 13:19 → Rdz 50:25', desc: 'Mojżesz po stuleciach spełnia prośbę umierającego Józefa o przeniesienie jego kości do Kanaan.' },
    { ref: 'Wj 13:21 → J 8:12', desc: 'Słup ognia w mroku nocy pustyni znajduje pełnię w Jezusie — Światłości świata.' },
    { ref: 'Wj 13:21 → Iz 4:5–6', desc: 'Obłok za dnia i blask ognia nocą nad całą wspólnotą odkupionych jako osłona chwały.' },
    { ref: 'Wj 13:22 → Mt 28:20', desc: 'Słup nigdy nie ustępował sprzed ludu — jak obietnica Chrystusa: „Oto Ja jestem z wami po wszystkie dni”.' }
  ]),
  prawda: buildPrawdaSection('5 Filarów Drogi Wolności — Co zmienia się w Twojej codzienności?', [
    '<strong>Należysz do Tego, który Cię wykupił:</strong> Jak pierworodny w Wj 13:2, Twoje życie ocalone przez Chrystusa nie należy już do Egiptu, lecz do Boga.',
    '<strong>Okrężne drogi bywają Bożą ochroną:</strong> Jeśli Bóg nie daje Ci skrótu (Wj 13:17), może chronić Cię przed bitwą, na którą nie jesteś jeszcze gotów.',
    '<strong>Ewangelia nie zamyka drzwi przed nikim:</strong> „Jedno prawo” dla obcego (Wj 12:49) ukazuje serce Boga otwarte dla każdego, kto przyjmuje przymierze.',
    '<strong>Pamięć wiary kształtuje kolejne pokolenie:</strong> Rozmowa ojca z synem z Wj 13:14 uczy dzieci nie suchych rytuałów, lecz wdzięczności za mocną rękę PANA.',
    '<strong>Światło w nocy i cień za dnia są zapewnione:</strong> Nie musisz wiedzieć, gdzie rozbijesz obóz za miesiąc — wystarczy iść krok za dzisiejszym Słupem Obecności.'
  ]),
  pomysl: buildPomyslSection([
    'Czy wyruszyłeś już ze swojego „Ramzes” grzechu i kompromisu, czy nadal odwlekasz decyzję o całkowitym wyjściu spod władzy świata (Wj 12:37)?',
    'Jakie „kości Józefa” — niewypełnione jeszcze Boże obietnice lub modlitwy Twoich poprzedników — niesiesz dziś z wiarą ku Kanaan (Wj 13:19)?',
    'Czy zdarzało Ci się narzekać na okrężną drogę, którą Bóg poprowadził Twoje życie, zamiast dostrzec w niej Jego mądrą ochronę (Wj 13:17)?',
    'Co oznacza w praktyce, że Twoje czyny („ręka”) i myśli („między oczami”) mają być pamiątką Bożego wykupienia (Wj 13:9)?',
    'Czy Twoje dzieci i domownicy słyszą od Ciebie konkretne świadectwo: „Mocną ręką wyprowadził nas PAN” (Wj 13:14)?',
    'Gdzie w tej chwili najbardziej potrzebujesz cienia obłoku w skwarze życia, a gdzie — ognistego światła pośrodku nocy (Wj 13:21)?',
    'Czy pamiętasz, że bez przymierza z Chrystusem pozostajemy obcy przy stole zbawienia, a w Nim mamy pełne obywatelstwo (Wj 12:48–49)?',
    'Jaki pierwszy krok posłuszeństwa możesz zrobić dziś, idąc za prowadzeniem Słupa Chwały?'
  ]),
  decyzja: buildDecyzjaSection(
    'Wejdź na Drogę Wyjścia — Podążaj za Słupem Bożej Obecności!',
    'Wyjście z Egiptu nie kończy się za progiem bezpiecznego domu — zaczyna się jako pielgrzymka za widzialną obecnością Boga. Wj 12:37–13:22 przypomina, że Ten, który wybawia z domu niewoli, bierze pełną odpowiedzialność za trasę naszej wędrówki. Dziś przestań tęsknić za wygodą starego Egiptu, nie lękaj się okrężnych ścieżek na pustyni i powierz swoje dni Panu, który nigdy nie wycofuje swojego światła.',
    'Panie Jezu Chryste, Ty jesteś moim Odkupicielem i Pierworodnym Zmartwychwstałym! Oddaję Ci dziś całe moje życie jako poświęcone Tobie dziedzictwo. Ufam Twojej mądrości nawet wtedy, gdy prowadzisz mnie drogą okrężną przez pustynię. Bądź moim Obłokiem w upale zmagań i moim Ogniem w ciemnej nocy — chcę iść za Tobą każdego dnia i każdej nocy.'
  ),
  modlitwa: buildModlitwaSection(
    'Modlitwa na 12 listopada',
    'Modlitwa Pielgrzyma o Mądre Prowadzenie i Czystość Serca',
    [
      'Wszechmogący Boże, Królu chwały i Przewodniku Twojego ludu! Dziękujemy Ci za potężne świadectwo dwunastego i trzynastego rozdziału Księgi Wyjścia, w którym po długiej niewoli wyprowadziłeś swój lud dokładnie w oznaczonym dniu.',
      'Dziękujemy Ci, Panie Jezu, że wykupiłeś nas jako Swoją wyłączną własność nie na podstawie naszych zasług, lecz przez własną ofiarę bez skazy. Oczyść nasze domy i myśli z wszelkiego kwasu obłudy i lęku, aby Twoje Słowo stało się znakiem na naszych dłoniach i w naszym myśleniu.',
      'Gdy boimy się zakrętów i okrężnych dróg naszego życia, udziel nam zaufania, że Ty sam chronisz nas przed bitwami ponad nasze siły. Dziękujemy za obietnicę Twojej stałej obecności: za chłód łaski w skwarze dnia i za jasny ogień Słowa w godzinach ciemności. Prowadź nas bezpiecznie ku ziemi obietnicy. Amen.'
    ]
  ),
  tasks: [
    'Przeczytaj uważnie cały fragment <a href="/mojabiblia?book=EXO&chapter=13" class="text-amber-300 underline font-semibold">Wj 12:37–13:22</a> w przekładzie UBG.',
    'Wypisz jedną „okrężną drogę” w swoim życiu i podziękuj Bogu za ochronę, którą mogła skrywać.',
    'Porozmawiaj z kimś z domu lub znajomych o tym, z jakiej niewoli wyrwał Cię Bóg (Wj 13:14).',
    'Przeczytaj porównawczo J 8:12 oraz Łk 2:22–24, łącząc słup ognia i prawo pierworodnych z Chrystusem.',
    'Zapamiętaj kluczowy werset dnia z Wj 13:21 i powtórz go przed snem.',
    'Pomyśl o ludziach z „obcego ludu” (Wj 12:38), którzy potrzebują dziś zaproszenia do Jezusa.',
    'Zapisz poniżej, co w Twojej codzienności ma zostać w pełni poświęcone PANU.'
  ],
  quizComment: '// ── QUIZ LOGIC (20 PYTAŃ Z WJ 12:37–13:22) ──',
  quiz: [
    { q: 'Skąd i dokąd wyruszyli synowie Izraela na początku marszu z Egiptu (Wj 12:37)?', a: ['Z Jerycha do Hebronu', 'Z Ramzes do Sukkot', 'Z Memfis do Aleksandrii', 'Z Syjonu do Gileadu'], c: 1 },
    { q: 'Ilu w przybliżeniu pieszych mężczyzn wyszło z Egiptu, nie licząc dzieci (Wj 12:37)?', a: ['Około stu tysięcy', 'Około sześciuset tysięcy', 'Około trzech milionów', 'Dwunastu tysięcy'], c: 1 },
    { q: 'Kto jeszcze oprócz samych Izraelitów wyruszył z nimi z Egiptu według Wj 12:38?', a: ['Armia faraona jako straż honorowa', 'Mnóstwo obcego ludu oraz ogromne stada owiec i bydła', 'Sami kapłani egipscy', 'Wyłącznie starszyzna bez dobytku'], c: 1 },
    { q: 'Co upiekli Izraelici z ciasta wyniesionego w pośpiechu z Egiptu (Wj 12:39)?', a: ['Chleb na zakwasie miodowym', 'Przaśne placki z niezakwaszonego ciasta', 'Placki jęczmienne z oliwą z Oliwek', 'Drożdżowe kołacze świąteczne'], c: 1 },
    { q: 'Ile lat wynosił czas przebywania synów Izraela w Egipcie według Wj 12:40–41?', a: ['Dwieście piętnaście lat', 'Czterysta trzydzieści lat', 'Sto dwadzieścia lat', 'Siedemset lat'], c: 1 },
    { q: 'Które stwierdzenie o ustawie Paschy jest prawdziwe według Wj 12:46?', a: ['Mięso należy rozdać po wszystkich ulicach miasta', 'Baranek ma być spożywany w jednym domu i nie wolno łamać jego kości', 'Można go piec wyłącznie nad rzeką', 'Każdy gość musi zabrać połowę do Egiptu'], c: 1 },
    { q: 'Pod jakim warunkiem cudzoziemiec będący gościem mógł obchodzić Paschę PANA (Wj 12:48)?', a: ['Po opłaceniu podwójnej daniny ze złota', 'Po obrzezaniu każdego mężczyzny w jego domu — wtedy miał takie samo prawo jak urodzony w tej ziemi', 'Dopiero po czterdziestu latach na pustyni', 'Bez żadnych warunków ani wejścia w przymierze'], c: 1 },
    { q: 'Czego zabraniał Boży nakaz dotyczący najemnika i nieobrzezanego przybysza w Wj 12:43–45?', a: ['Przejścia przez bramę miasta Sukkot', 'Spożywania z ofiary Paschy', 'Picie wody ze studni pustynnych', 'Posiadania własnych namiotów'], c: 1 },
    { q: 'Co rozkazał PAN Mojżeszowi poświęcić Mu spośród całego Izraela w Wj 13:2?', a: ['Dziesiątą część każdego pola jęczmienia', 'Wszystko pierworodne, co otwiera łono — zarówno spośród ludzi, jak i bydła', 'Złote kolczyki i naramienniki z Ramzes', 'Wszystkie konie wojenne Egipcjan'], c: 1 },
    { q: 'W jakim miesiącu Izraelici wyszli z Egiptu według Wj 13:4?', a: ['W miesiącu Tiszri', 'W miesiącu Abib', 'W miesiącu Kislev', 'W miesiącu Adar'], c: 1 },
    { q: 'Jak miała wyglądać odpowiedź ojca, gdy syn zapyta w przyszłości: „Co to znaczy?” (Wj 13:14)?', a: ['„Takie było nasze dawne prawo pogańskie”', '„Mocną ręką wyprowadził nas PAN z Egiptu, z domu niewoli”', '„Zbudowaliśmy sobie wolność siłą naszych rąk”', '„Kupiliśmy te ziemie od królów Kanaanu”'], c: 1 },
    { q: 'Co należało zrobić z każdym pierworodnym osła, jeśli nie został wykupiony owcą (Wj 13:13)?', a: ['Darować go faraonowi', 'Złamać mu kark (natomiast każdego pierworodnego syna trzeba wykupić)', 'Wypuścić go wolno na pustynię', 'Złożyć go w darze dla Filistynów'], c: 1 },
    { q: 'Gdzie według Wj 13:9 i 13:16 miało znajdować się przypomnienie Bożego prawa i wyprowadzenia?', a: ['Wyłącznie na bramach Sukkot', 'Jako znak na ręce i jako pamiątka między oczami (na czole)', 'Jedynie w tajnym zwoju lewitów', 'Na żaglach okrętów na Nilu'], c: 1 },
    { q: 'Dlaczego Bóg NIE poprowadził Izraela krótszą drogą przez ziemię Filistynów (Wj 13:17)?', a: ['Bo nie znał drogi nad Morzem Śródziemnym', 'Aby lud nie żałował na widok wojny i nie zawrócił z powrotem do Egiptu', 'Bo Filistyni byli wtedy sojusznikami Izraela', 'Z powodu zbyt wysokich gór na północy'], c: 1 },
    { q: 'Którędy Bóg poprowadził lud okrężną drogą w Wj 13:18?', a: ['Wzdłuż gór Libanu na północ', 'Okrężną drogą przez pustynię ku Morzu Czerwonemu', 'Przez stolicę Teb i górny Nil', 'Drogą królewską prosto na Damaszek'], c: 1 },
    { q: 'Czyje kości zabrał ze sobą Mojżesz przy wyjściu z Egiptu zgodnie z dawną przysięgą (Wj 13:19)?', a: ['Kości Abrahama', 'Kości Józefa', 'Kości Judy', 'Kości patriarchy Lewiego'], c: 1 },
    { q: 'Gdzie Izraelici rozbili obóz po wyruszeniu ze Sukkot (Wj 13:20)?', a: ['W Goszen', 'W Etam, na skraju pustyni', 'W Jerychu', 'Pod Górą Karmel'], c: 1 },
    { q: 'W czym szedł PAN przed ludem ZA DNIA według Wj 13:21?', a: ['W wietrze ze wschodu bez znaku', 'W słupie obłoku, by prowadzić ich drogą', 'W widzialnym orszaku rydwanów', 'W postaci płynącej rzeki przed obozem'], c: 1 },
    { q: 'Co prowadziło Izraelitów i świeciło im NOCĄ według Wj 13:21?', a: ['Pochodnie z drewna akacjowego', 'Słup ognia, aby mogli iść dniem i nocą', 'Gwiazda na zachodnim krańcu nieba', 'Latarnie ustawione na wzgórzach Etam'], c: 1 },
    { q: 'Co werset Wj 13:22 podkreśla o słupie obłoku i słupie ognia?', a: ['Że znikały co tydzień na trzy dni próby', 'Że nie ustępowały sprzed ludu ani za dnia, ani w nocy', 'Że towarzyszyły tylko samemu Mojżeszowi w namiocie', 'Że zgasły natychmiast po przekroczeniu Etam'], c: 1 }
  ]
};

const D44_CONFIG = {
  title: 'PRZEJŚCIE PRZEZ MORZE CZERWONE — PAN BĘDZIE ZA WAS WALCZYŁ',
  reading: 'Wj 14:1–31',
  mvChapter: 14,
  mvVerse: 14,
  strong: buildStrongSection(
    'Wj 14:1–31',
    'Poniższe terminy hebrajskie stanowią osnowę teologiczną 14. rozdziału Księgi Wyjścia (przejście przez Morze Czerwone i ratunek PANA):',
    [
      { id: 'H3898', orig: 'לָחַם (lacham)', meaning: 'walczyć w obronie swojego ludu jak potężny Wojownik (Wj 14:14, 25)' },
      { id: 'H2790', orig: 'חָרַשׁ (charasz)', meaning: 'milczeć w pokornej ciszy wiary przed dziełem Bożym (Wj 14:14)' },
      { id: 'H3444', orig: 'יְשׁוּעָה (jeszua)', meaning: 'ratunek, zbawienie i pełne ocalenie od PANA (Wj 14:13, 30)' },
      { id: 'H2724', orig: 'חָרָבָה (charabah)', meaning: 'sucha ziemia pośrodku rozstąpionych głębin morskich (Wj 14:21)' },
      { id: 'H3220', orig: 'יָם (jam)', meaning: 'morze — symbol śmiertelnego żywiołu ujarzmionego słowem PANA (Wj 14:16, 22)' },
      { id: 'H7307', orig: 'רוּחַ קָדִים (ruach qadim)', meaning: 'gwałtowny wiatr wschodni rozcinający wody przez całą noc (Wj 14:21)' },
      { id: 'H3513', orig: 'כָּבֵד (kabad)', meaning: 'okazać chwałę nad faraonem i całym jego wojskiem (Wj 14:4, 17–18)' },
      { id: 'H539', orig: 'אָמַן (aman)', meaning: 'uwierzyć, zaufać PANU oraz Jego słudze Mojżeszowi po wielkim cudzie (Wj 14:31)' }
    ]
  ),
  exegesis: buildExegesisSection('Pięć części studium Wj 14:1–31 (35 punktów analitycznych)', [
    {
      heading: 'BOŻA STRATEGIA POD PI-HACHIROT I POŚCIG FARAONA (WJ 14:1–9)',
      points: [
        '<strong>1. Celowy manewr nad brzegiem morza (14:1–3):</strong> Bóg każe zawrócić przed Pi-Hachirot między Migdol a morzem, sprawiając, że faraon błędnie ocenia położenie Izraela jako śmiertelną pułapkę.',
        '<strong>2. Chwała PANA ponad pogańską armią (14:4):</strong> Celem nie jest ucieczka w cieniu wstydu, lecz jawne objawienie, „że Ja jestem PAN”.',
        '<strong>3. Pycha imperialnej pogoni (14:5–7):</strong> Faraon zaprzęga 600 wyborowych rydwanów i wszystkie rydwany Egiptu z dowódcami, żałując utraty darmowej siły roboczej.',
        '<strong>4. Zuchwałość naprzeciw „wysokiej ręki” (14:8–9):</strong> Podczas gdy Izrael wychodził pod osłoną mocy Bożej, rydwany dopadają ich przy samym obozowisku nad morzem.'
      ]
    },
    {
      heading: 'PANIKA LUDU I WIELKIE SŁOWO WIARY MOJŻESZA (WJ 14:10–14)',
      points: [
        '<strong>5. Krzyk lęku i pamięć „grobów w Egipcie” (14:10–12):</strong> Przerażony lud zapomina dziesięciu plag zaledwie po kilku dniach marszu i wini Mojżesza za ucieczkę z niewoli.',
        '<strong>6. Trzykrotny program odwagi (14:13):</strong> „Nie bójcie się! Stójcie mocno i oglądajcie ratunek PANA, którego dokona dziś dla was”.',
        '<strong>7. Ostateczny koniec przeszłości (14:13b):</strong> „Egipcjan, których dziś widzicie, już nigdy więcej nie zobaczycie” — całkowite zerwanie więzów.',
        '<strong>8. Obietnica z Wj 14:14:</strong> „PAN będzie za was walczył, a wy będziecie milczeć” — koniec nerwowego szemrania, początek ufnej bezradności wiary.'
      ]
    },
    {
      heading: 'PODNIESIONA LASKA I NOCNE ROZDZIELENIE OBOZÓW (WJ 14:15–20)',
      points: [
        '<strong>9. Od modlitwy do kroku posłuszeństwa (14:15):</strong> „Powiedz synom Izraela, niech ruszą naprzód!” — wiara wchodzi naprzeciw ścianie wody.',
        '<strong>10. Podniesiona laska nad morzem (14:16):</strong> Symbol Bożego autorytetu wskazuje drogę, gdzie po ludzku istnieje tylko przepaść.',
        '<strong>11. Anioł Boży i Słup za plecami ludu (14:19–20):</strong> Tarcza Boga wkracza dokładnie między atakujące wojsko a bezbronne rodziny Izraela: ciemność dla wroga, światło w nocy dla swoich.'
      ]
    },
    {
      heading: 'SUCHE DNO POŚRODKU MORZA I ODWRÓT WÓD (WJ 14:21–28)',
      points: [
        '<strong>12. Silny wiatr wschodni przez całą noc (14:21):</strong> PAN posługuje się żywiołem stworzenia, aby przemienić morskie dno w suchy trakt.',
        '<strong>13. Mur wody po prawej i lewej (14:22):</strong> Śmierć została ujarzmiona po obu stronach ścieżki odkupionych.',
        '<strong>14. Straż poranna i zamieszanie w obozie wroga (14:23–25):</strong> Kiedy rydwany wjeżdżają w ślad za Izraelem, Bóg zdejmuje z nich koła — sami Egipcjanie wyznają: „PAN walczy za nich przeciwko Egipcjanom”.',
        '<strong>15. Zamknięcie wód o świcie (14:26–28):</strong> Na powrotny gest laski wody wracają na miejsce — nie ocalał ani jeden żołnierz pościgu.'
      ]
    },
    {
      heading: 'WYBAWIENIE, BOJAŹŃ PAŃSKA I NARODZINY WIARY (WJ 14:29–31)',
      points: [
        '<strong>16. Kontrast ocalenia i sądu (14:29–30):</strong> Izrael staje na przeciwnym brzegu żywy, widząc dowód całkowitej klęski tyranii.',
        '<strong>17. Z lęku przed faraonem do bojaźni PANA (14:31a):</strong> Strach przed człowiekiem ustępuje czci wobec Wszechmogącego.',
        '<strong>18. Wiara w PANA i w Mojżesza (14:31b):</strong> Wielkie dzieło nad Morzem Czerwonym pieczętuje zaufanie do Bożego zbawienia na dalszą wędrówkę przez pustynię.'
      ]
    }
  ]),
  jezus: buildJezusSection(
    'Jezus w centrum',
    'Chrystus — Droga Przez Wody Śmierci i Ten, Który Zwycięża Za Swój Lud',
    [
      'Apostoł Paweł w 1 Kor 10:1–2 odkrywa przed nami głęboką tajemnicę czternastego rozdziału Księgi Wyjścia: wszyscy ojcowie nasi byli pod obłokiem i wszyscy przeszli przez morze, i wszyscy „w Mojżesza zostali ochrzczeni w obłoku i w morzu”. Wody Morza Czerwonego są obrazem sądu i śmierci, przez które Bóg przeprowadził swój lud po suchej ziemi, zamykając na zawsze za jego plecami moc dawnego ciemięzcy.',
      'To dokładnie czyni śmierć i zmartwychwstanie Jezusa Chrystusa! Gdy stoją przed nami oskarżenia grzechu, lęk śmierci i niemożliwa przeszkoda, brzmi Boże słowo z Wj 14:14: „PAN będzie za was walczył, a wy będziecie milczeć”. Na krzyżu Jezus Sam pokonał zwierzchności i moce ciemności (Kol 2:15), przeprowadzając wierzącego w Nim przez chrzest śmierci do nowego, zwycięskiego życia (Rz 6:4).'
    ],
    14,
    'Czytaj Wj 14:1–31'
  ),
  sprawdz: buildSprawdzSection([
    { ref: 'Wj 14:4 → Rz 9:17', desc: 'Historia konfrontacji z faraonem objawia suwerenną moc i chwałę Imienia Boga na całej ziemi.' },
    { ref: 'Wj 14:13 → 2 Krn 20:17', desc: '„Stójcie i oglądajcie ratunek PANA, który jest z wami” — ponadludzkie wybawienie w obliczu przewagi wroga.' },
    { ref: 'Wj 14:14 → Ps 46:11', desc: '„Zatrzymajcie się i poznajcie, że Ja jestem Bogiem” — cisza wiary wobec bitwy toczonej przez PANA.' },
    { ref: 'Wj 14:15 → Mt 14:29', desc: 'Wezwanie do ruchu naprzód w wierze mimo wzburzonych wód życiowej niemożliwości.' },
    { ref: 'Wj 14:19 → Ps 34:8', desc: 'Anioł Pański zakłada obóz wokół tych, którzy się Go boją, i wyrywa ich z pułapki.' },
    { ref: 'Wj 14:21 → Ps 66:6', desc: '„Przemienił morze w suchą ziemię; przeszli przez rzekę pieszo — tam radowaliśmy się w Nim”.' },
    { ref: 'Wj 14:22 → 1 Kor 10:1–2', desc: 'Przejście przez obłok i morze jako biblijny pierwowzór chrztu i nowej przynależności do Chrystusa.' },
    { ref: 'Wj 14:25 → Rz 8:31', desc: 'Skoro sam Bóg walczy za nas, nawet potężne rydwany wroga nie mogą się ostać.' },
    { ref: 'Wj 14:28 → J 8:36', desc: 'Gdy Syn wyzwoli człowieka, dawni nadzorcy grzechu tracą nad nim władzę na zawsze.' },
    { ref: 'Wj 14:30 → Hbr 11:29', desc: '„Przez wiarę przeszli przez Morze Czerwone jak po suchej ziemi; gdy Egipcjanie spróbowali tego samego, zostali pochłonięci”.' },
    { ref: 'Wj 14:31 → Ps 106:12', desc: 'Dzieło Bożego ratunku rodzi żywą wiarę, cześć oraz pieśń dziękczynienia.' },
    { ref: 'Wj 14:20 → Iz 52:12', desc: '„PAN pójdzie przed wami, a Bóg Izraela będzie waszą tylną strażą” — podwójna ochrona odkupionych.' }
  ]),
  prawda: buildPrawdaSection('5 Prawdy Zwycięstwa — Co zmienia się, gdy przed Tobą stoi Morze?', [
    '<strong>Ślepy zaułek dla człowieka jest sceną chwały dla Boga:</strong> Zanim Bóg każe rozbić obóz pod Pi-Hachirot, ma już wyznaczony suchy trakt w sercu morza.',
    '<strong>Cisza ufności jest potężniejsza od krzyku paniki:</strong> Wj 14:14 wzywa do odłożenia nerwowej walki o własnych siłach tam, gdzie walczy sam Wszechmogący.',
    '<strong>Wiara nie ucieka w tył, lecz robi krok naprzód:</strong> Dopiero gdy Mojżesz wyciąga laskę i lud rusza ku falom, wody rozstępują się krok po kroku.',
    '<strong>Boży Słup staje między Tobą a przeszłością:</strong> Ten sam Obłok, który daje światło dziecku Bożemu, oślepia pościg ciemności.',
    '<strong>Zmartwychwstanie to Twoje Morze Czerwone:</strong> Chrystus raz na zawsze rozbroił moce, które goniły Cię w grzechu i lęku śmierci.'
  ]),
  pomysl: buildPomyslSection([
    'Przed jakim „Morzem Czerwonym” stoisz dzisiaj, mając za plecami pędzące rydwany dawnych problemów lub lęku (Wj 14:9–10)?',
    'Czy kiedy narasta presja, Twoim pierwszym odruchem jest tęsknota za wygodą przeszłości („lepiej było w Egipcie”), czy stanięcie w wierze (Wj 14:12–13)?',
    'W jakiej jednej sprawie Bóg mówi Ci dziś bardzo konkretnie: „PAN będzie za was walczył, a wy będziecie milczeć” (Wj 14:14)?',
    'Jaki praktyczny krok „naprzód” (Wj 14:15) musisz wykonać dzisiaj w zaufaniu, zanim zobaczysz suche dno pod stopami?',
    'Czy doświadczyłeś kiedyś chwili, gdy Bóg stanął dosłownie za Twoimi plecami między Tobą a zagrożeniem, dokładnie jak Słup Obłoku w Wj 14:19–20?',
    'Jakiego dawnego „Egipcjanina” — grzechu, nałogu czy paraliżującego strachu — potrzebujesz dziś oddać Bogu z wiarą, że „już go nigdy nie zobaczysz” (Wj 14:13)?',
    'Czy pielęgnujesz w sobie bojaźń Pańską zrodzoną ze wspominania Bożych dzieł w Twoim życiu (Wj 14:31)?',
    'Komu z zastraszonych przyjaciół możesz dzisiaj przekazać odwagę słów z Wj 14:13–14?'
  ]),
  decyzja: buildDecyzjaSection(
    'Przestań Drżeć Przed Pościgiem — Zrób Krok w Stronę Morza w Imię PANA!',
    'Czternasty rozdział Księgi Wyjścia uczy, że między paniką bezradności a triumfem brzegu leży jedno słowo: zaufanie, które nie cofa się do niewoli. Bóg nie oczekuje, abyś sam rozdzielił wody przed sobą ani pokonał 600 rydwanów wroga. Twoim zadaniem jest uciszyć oskarżycielskie myśli, patrzeć na zbawienie PANA i ruszyć naprzód w ślad za Jego obecnością.',
    'Panie Jezu Chryste, Zwycięzco śmierci i mocy ciemności! Dziękuję Ci, że walczysz za mnie tam, gdzie moje własne siły dawno się skończyły. Odrzucam panikę i pokusę powrotu do przeszłości. Wybieram posłuszeństwo wiary i stawiam dziś krok naprzód, ufając, że Twoje Słowo otwiera suchą ścieżkę pośród niemożliwych głębin. Tobie oddaję chwałę na wieki!'
  ),
  modlitwa: buildModlitwaSection(
    'Modlitwa na 13 listopada',
    'Modlitwa Ufności Przed Morzem Prób i Zaufania Zwycięskiemu Panu',
    [
      'Wszechmogący Boże, Wojowniku sprawiedliwości i Ojcze miłosierdzia! Stajemy przed Tobą z czternastym rozdziałem Księgi Wyjścia, wiedząc, że po ludzku sami znaleźliśmy się nieraz w potrzasku między falami lęku a pościgiem trudności.',
      'Przebacz nam każde szemranie i słabość serca, w których pytaliśmy, czy nie lepiej było pozostać w starym wygodnym świecie. Ucisz dziś zgiełk naszych trosk słowem z Wj 14:14: „PAN będzie za was walczył, a wy będziecie milczeć”.',
      'Panie Jezu, który przez swój krzyż i pusty grób otworzyłeś drogę przez wody śmierci, stań dziś Swoim Duchem jako tarcza za naszymi plecami. Poprowadź nas suchym gruntem wiary na drugi brzeg, abyśmy wraz z całym Kościołem wyznali bojaźń i wiarę w Ciebie, jedynego Wybawiciela. Amen.'
    ]
  ),
  tasks: [
    'Przeczytaj osobiście cały rozdział <a href="/mojabiblia?book=EXO&chapter=14" class="text-amber-300 underline font-semibold">Wj 14:1–31</a> w przekładzie UBG.',
    'Przeczytaj głośno Wj 14:13–14 i oddaj Bogu jedną sprawę, w której sam próbowałeś gorączkowo walczyć.',
    'Rozważ 1 Kor 10:1–2 i podziękuj Jezusowi za chrzest przymierza oddzielający Cię od starego życia.',
    'Zidentyfikuj jeden „krok naprzód” (Wj 14:15), który od dawna odkładałeś przez lęk, i wykonaj go dziś.',
    'Wpisz poniżej świadectwo dawnej sytuacji, z której PAN już Cię bezpiecznie przeprowadził.',
    'Powierz w modlitwie osobę, która czuje się dziś osaczona bez wyjścia.',
    'Powtórz wieczorem z pamięci: „PAN będzie za was walczył, a wy będziecie milczeć” (Wj 14:14).'
  ],
  quizComment: '// ── QUIZ LOGIC (20 PYTAŃ Z WJ 14:1–31) ──',
  quiz: [
    { q: 'Gdzie Bóg nakazał Izraelitom zawrócić i rozbić obóz w Wj 14:2?', a: ['Przed Jerychem nad Jordanem', 'Przed Pi-Hachirot, między Migdol a morzem, naprzeciw Baal-Sefon', 'Pod górą Tabor w Galilei', 'Na nizinie Goszen daleko od wody'], c: 1 },
    { q: 'Co według Wj 14:3 miał pomyśleć faraon o położeniu Izraela?', a: ['Że przygotowali już okręty wojenne', 'Że zbłądzili w kraju i zamknęła ich pustynia', 'Że wrócili potajemnie do Ramzes', 'Że zawarli pokój z Kanaanem'], c: 1 },
    { q: 'Ile wyborowych rydwanów zabrał faraon do pościgu za Izraelem według Wj 14:7?', a: ['Sto pięćdziesiąt rydwanów', 'Sześćset wyborowych rydwanów oraz wszystkie pozostałe rydwany Egiptu z dowódcami', 'Cztery tysiące łodzi rzecznych', 'Dwanaście rydwanów samej straży pałacowej'], c: 1 },
    { q: 'Jaką reakcję wśród Izraelitów wywołał widok nadciągających wojsk egipskich (Wj 14:10–11)?', a: ['Natychmiast zaśpiewali hymn triumfu', 'Bardzo się przestraszyli, wołali do PANA i czynili wyrzuty Mojżeszowi, pytając, czy nie było grobów w Egipcie', 'Wyruszyli z mieczami naprzeciw rydwanów', 'Uciekli w ciszy na łodzie kupców'], c: 1 },
    { q: 'Czego według Wj 14:12 rzekomo chcieli Izraelici w Egipcie zamiast umierać na pustyni?', a: ['Walczyć w imieniu Aarona', 'Raczej służyć Egipcjanom niż umrzeć na pustyni', 'Zbudować miasto w Etam', 'Oddać całe bydło faraonowi'], c: 1 },
    { q: 'Jaką pierwszą obietnicę złożył Mojżesz przerażonemu ludowi w Wj 14:13?', a: ['„Przygotujcie proce i włócznie do walki!”', '„Nie bójcie się! Stójcie a oglądajcie ratunek PANA... Egipcjan, których dziś widzicie, już nigdy nie zobaczycie”', '„Napiszemy prośbę o ułaskawienie do faraona”', '„Rozproszymy się po górach Synaju”'], c: 1 },
    { q: 'Jak brzmi dokładna treść wersetu pamięciowego Wj 14:14 (UBG)?', a: ['„PAN pośle pomoc po trzech dniach, gdy zbudujecie most”', '„PAN będzie za was walczył, a wy będziecie milczeć”', '„Każdy niech walczy swoim mieczem o swoją rodzinę”', '„Wody cofną się same przed brzaskiem lata”'], c: 1 },
    { q: 'Jaką komendę dał PAN Mojżeszowi dla całego ludu w Wj 14:15?', a: ['„Rozbijcie obóz na trzydzieści dni”', '„Czemu wołasz do Mnie? Powiedz synom Izraela, niech ruszą naprzód!”', '„Wróćcie do Sukkot przed nocą”', '„Przepłyńcie morze na tratwach”'], c: 1 },
    { q: 'Co Mojżesz miał uczynić swoją laską nad morzem w Wj 14:16?', a: ['Rzucić ją przed rydwany faraona', 'Podnieść laskę, wyciągnąć rękę nad morze i rozdzielić je', 'Zakopać ją w piasku przy Pi-Hachirot', 'Przekazać ją dowódcom straży'], c: 1 },
    { q: 'Co uczynił Anioł Boży i słup obłoku tuż przed przejściem (Wj 14:19–20)?', a: ['Odeszli daleko przed cały Izrael na pustynię', 'Przesunęli się i stanęli za nimi — między obozem Egipcjan a obozem Izraela', 'Zniknęli całkowicie w chmurach', 'Spalili namioty Izraela od tyłu'], c: 1 },
    { q: 'Jak słup obłoku oddziaływał na oba obozy tej samej nocy (Wj 14:20)?', a: ['Oba obozy miały jednakowy blask księżyca', 'Dla jednych (Egipcjan) był chmurą i ciemnością, a drugim (Izraelowi) oświecał noc', 'Zamarzł powierzchnię całego morza', 'Zasypał rydwany gradem i popiołem'], c: 1 },
    { q: 'W jaki sposób PAN cofnął wody morskie w Wj 14:21?', a: ['Silnym wiatrem wschodnim wiejącym przez całą noc', 'Trzęsieniem ziemi bez żadnego wiatru', 'Południowym upałem wysuszającym morze w minutę', 'Przez trzy wielkie tamy z kamieni'], c: 0 },
    { q: 'Co stało się z wodą, gdy synowie Izraela weszli w środek morza po suchej ziemi (Wj 14:22)?', a: ['Sięgała im stale do ramion', 'Woda była dla nich murem po ich prawej i po lewej stronie', 'Rozlała się spokojnie na daleką pustynię', 'Zamieniła się w twardy lód'], c: 1 },
    { q: 'Kiedy PAN spojrzał na obóz Egipcjan ze słupa ognia i obłoku, wprowadzając zamieszanie (Wj 14:24)?', a: ['W samo południe', 'O straży porannej', 'Tuż po zachodzie słońca', 'Trzeciego dnia po wymarszu'], c: 1 },
    { q: 'Jakie mechaniczne uszkodzenie sprawił PAN rydwanom egipskim w środku morza (Wj 14:25)?', a: ['Złamały się wszystkie dyszle i miecze', 'Poodpadały koła ich rydwanów, tak że z trudem się posuwały', 'Konie zasnęły w głębokiej wodzie', 'Piasek przykrył wszystkie wozy w jednej chwili'], c: 1 },
    { q: 'Co krzyknęli sami Egipcjanie, widząc chaos swoich rydwanów (Wj 14:25)?', a: ['„Szybciej naprzód, woda opada!”', '„Uciekajmy przed Izraelem, bo PAN walczy za nich przeciwko Egipcjanom!”', '„Złóżmy ofiary bogom Nilu!”', '„Wracajmy szukać naszych kół!”'], c: 1 },
    { q: 'Kiedy morze wróciło na swoje miejsce i zalało armię pościgu (Wj 14:27)?', a: ['W środku nocy bez księżyca', 'Nad ranem / o świcie, gdy Mojżesz znów wyciągnął rękę nad morze', 'Po siedmiu dniach oblężenia', 'Dopiero po wejściu Izraela na górę Synaj'], c: 1 },
    { q: 'Ilu żołnierzy z całego wojska faraona, które weszło do morza, ocalało według Wj 14:28?', a: ['Ocalał tylko sam faraon i trzej dowódcy', 'Nie ocalał z nich ani jeden', 'Ocalała połowa konnicy', 'Wszystkich wyłowiono żywych na drugi brzeg'], c: 1 },
    { q: 'Jaka była duchowa reakcja Izraela po ujrzeniu potężnego dzieła PANA w Wj 14:31?', a: ['Zaraz wrócili na zachodni brzeg', 'Lud bał się PANA i uwierzył PANU oraz Mojżeszowi, Jego słudze', 'Uznali, że to był zwykły przypadek wiatru', 'Wybrali nowego wodza zamiast Mojżesza'], c: 1 },
    { q: 'Gdzie według Wj 14:30 zobaczył Izrael martwych Egipcjan jako dowód całkowitego wybawienia?', a: ['W głębinach studni w Etam', 'Na brzegu morza', 'Pod murami Ramzes', 'W dolinie Migdol'], c: 1 }
  ]
};

const D45_JEZUS = buildJezusSection(
  'Jezus w centrum',
  'Pieśń Mojżesza i Baranka — Chrystus Uzdrowiciel Gorzkich Wód w Mara',
  [
    'Piętnasty rozdział Księgi Wyjścia otwiera najstarszy hymn odkupienia w Piśmie Świętym, który rozbrzmi jeszcze w wieczności jako „pieśń Mojżesza, sługi Bożego, i pieśń Baranka” (Obj 15:3). Słowa Wj 15:2 — „PAN moją mocą i moją chwałą, bo stał się dla mnie zbawieniem” — niosą imię <em>Jeszua</em> („zbawienie”), w którym objawił się Jezus z Nazaretu! To On zrzucił duchowego jeźdźca w morze sądu i podarował nam nowe życie.',
    'A zaledwie trzy dni później, przy gorzkich źródłach Mara (Wj 15:23–25), PAN ukazuje Mojżeszowi drzewo: wrzucone w gorycz wody czyni ją słodką! Ojcowie Kościoła i teologowie od wieków widzą w tym drzewie rzuconym w gorycz życia zapowiedź Krzyża Chrystusa. Tam, gdzie gorzkość grzechu, rozczarowania czy cierpienia czyni życie niezdatnym do picia, Chrystus objawia się jako „PAN, który cię uzdrawia” (<em>JHWH Rofe</em>, Wj 15:26; 1 P 2:24) i wprowadza spragnioną duszę pod dwanaście źródeł pokoju w Elim (Wj 15:27).'
  ],
  15,
  'Czytaj Wj 15:1–27'
);

const D45_SPRAWDZ = buildSprawdzSection([
  { ref: 'Wj 15:2 → Iz 12:2', desc: 'Dosłowne echo hymnu Mojżesza u proroka Izajasza: „PAN moją mocą i pieśnią, stał się moim zbawieniem”.' },
  { ref: 'Wj 15:2 → Ps 118:14', desc: 'Ten sam okrzyk triumfu wybrzmiewa w psalmie zapowiadającym odrzucony Kamień Węgielny — Chrystusa.' },
  { ref: 'Wj 15:3 → Obj 19:11–16', desc: '„PAN jest wojownikiem” — Jezus jako sprawiedliwy Zwycięzca nad wszelką niesprawiedliwością.' },
  { ref: 'Wj 15:11 → Ps 89:7', desc: '„Któż jak Ty, PANIE, wśród bogów, okazały w świętości?” — nieporównywalny majestat Stwórcy.' },
  { ref: 'Wj 15:13 → 1 P 1:18–19', desc: '„W Twoim miłosierdziu prowadzisz lud, który wykupiłeś” — pasterstwo łaski po odkupieniu krwią.' },
  { ref: 'Wj 15:17–18 → Obj 11:15', desc: '„PAN będzie królował na wieki wieków” — od świętej góry po wieczne Królestwo Baranka.' },
  { ref: 'Wj 15:20 → 1 Kor 14:26', desc: 'Pieśń Miriam i kobiet jako radosne uwielbienie Bożego ratunku we wspólnocie.' },
  { ref: 'Wj 15:23–25 → Gal 3:13', desc: 'Drzewo wrzucone w gorzkie wody Mara jako proroczy znak krzyża przemieniającego przekleństwo w błogosławieństwo.' },
  { ref: 'Wj 15:25 → Hbr 12:15', desc: 'Ostrzeżenie przed gorzkim korzeniem w sercu — tylko łaska Chrystusa czyni gorycz słodką.' },
  { ref: 'Wj 15:26 → 1 P 2:24', desc: '„Ja jestem PAN, który cię uzdrawia” — „Jego ranami zostaliście uzdrowieni”.' },
  { ref: 'Wj 15:26 → Pwt 7:15', desc: 'Przymierze posłuszeństwa Słowu jako droga błogosławieństwa i ochrony od chorób Sądu Egiptu.' },
  { ref: 'Wj 15:27 → Obj 22:1–2', desc: 'Dwanaście źródeł i siedemdziesiąt palm w Elim — przedsmak odpocznienia u wód życia.' }
]);

const D45_DECYZJA = buildDecyzjaSection(
  'Zaśpiewaj Pieśń Odkupienia — Rzuć Drzewo Krzyża w Swoją „Mara”!',
  'Rozdział piętnasty odsłania bolesny kontrast ludzkiego serca: łatwo śpiewać hymny chwały na drugim brzegu Morza Czerwonego (Wj 15:1–21), ale zaledwie trzy dni bez wody potrafią zamienić uwielbienie w szemranie przy źródłach Mara (Wj 15:22–24). Dziś nie zatrzymuj się w rozgoryczeniu i nie szukaj ulgi poza Bogiem. Wzorem Mojżesza zawołaj do PANA (15:25), przyjmij uzdrawiającą moc Krzyża Chrystusa i idź w posłuszeństwie ku źródłom w Elim!',
  'Panie Jezu Chryste, Ty jesteś moją mocą, moją pieśnią i moim zbawieniem! Odrzucam gorzkie szemranie, kiedy po chwilach zachwytu przychodzi próba pustyni. Zapraszam Twój krzyż w każde gorzkie miejsce mojej historii i przyjmuję Cię jako JHWH Rofe — PANA, który uzdrawia duszę i ciało. Ucz mnie słuchać Twojego głosu w codziennym posłuszeństwie!'
);

const D46_CONFIG = {
  title: 'MANNA Z NIEBA I ŚWIĘTOŚĆ SZABATU — BOŻE ZAOPATRZENIE NA PUSTYNI',
  reading: 'Wj 16:1–36',
  mvChapter: 16,
  mvVerse: 4,
  strong: buildStrongSection(
    'Wj 16:1–36',
    'Poniższe terminy hebrajskie stanowią osnowę teologiczną 16. rozdziału Księgi Wyjścia (manna z nieba, codzienne zaufanie i święty Szabat):',
    [
      { id: 'H4478', orig: 'מָן (man / Man hu?)', meaning: 'manna — dosł. „Co to jest?”; codzienny chleb z nieba zsyłany jak rosa (Wj 16:15, 31)' },
      { id: 'H3899', orig: 'לֶחֶם (lechem)', meaning: 'chleb z nieba dający życie zgłodniałemu ludowi na pustyni (Wj 16:4, 8, 15)' },
      { id: 'H4057', orig: 'מִדְבָּר (midbar)', meaning: 'pustynia Sin — miejsce próby zaufania z dala od egipskich pól (Wj 16:1, 32)' },
      { id: 'H7676', orig: 'שַׁבָּת (szabbat)', meaning: 'święty siódmy dzień odpoczynku ustanowiony zanim podano Dekalog na Synaju (Wj 16:23, 25–26, 29)' },
      { id: 'H7677', orig: 'שַׁבָּתוֹן (szabbaton)', meaning: 'uroczysty, całkowity odpoczynek poświęcony wyłącznie PANU (Wj 16:23)' },
      { id: 'H6016', orig: 'עֹמֶר (omer)', meaning: 'dzienna miara na osobę (~2,2 l) ucząca zaufania bez chciwego gromadzenia (Wj 16:16, 36)' },
      { id: 'H5254', orig: 'נָסָה (nacah)', meaning: 'wystawić na próbę posłuszeństwa względem prawa Bożego i dnia Szabatu (Wj 16:4)' },
      { id: 'H3519', orig: 'כָּבוֹד (kabod)', meaning: 'chwała PANA ukazująca się w obłoku jako odpowiedź na szemranie (Wj 16:7, 10)' }
    ]
  ),
  exegesis: buildExegesisSection('Pięć części studium Wj 16:1–36 (35 punktów analitycznych)', [
    {
      heading: 'PUSTYNIA SIN I SZEMRANIE O „GARNCACH MIĘSA” (WJ 16:1–5)',
      points: [
        '<strong>1. Piętnasty dzień drugiego miesiąca (16:1):</strong> Miesiąc po wyjściu z Egiptu kończą się własne zapasy i w sercu pustyni Sin zaczyna się prawdziwa szkoła zależności od Boga.',
        '<strong>2. Fałszywa nostalgia niewoli (16:2–3):</strong> Głód zamienia pamięć: naród idealizuje egipskie „garnce mięsa i chleb do syta”, zapominając o biczu nadzorców i mordowaniu niemowląt.',
        '<strong>3. Boża odpowiedź na niezasłużony wyrzut (16:4):</strong> Zamiast gniewu Bóg zsyła chleb z nieba — zarazem jako łaskę podtrzymania życia i jako codzienną próbę posłuszeństwa prawu.'
      ]
    },
    {
      heading: 'CHWAŁA PANA W OBŁOKU, PRZEPIÓRKI I MANNA (WJ 16:6–15)',
      points: [
        '<strong>4. „Szemrzecie nie przeciw nam, lecz przeciw PANU” (16:6–8):</strong> Bunt przeciw Bożym sługom dotyka samego Boga, który kieruje historią.',
        '<strong>5. Chwała objawiona mimo niewdzięczności (16:9–12):</strong> PAN wysłuchuje szemrania i zapowiada mięso wieczorem oraz sytość chleba o poranku.',
        '<strong>6. Przepiórki o zmierzchu i rosa o świcie (16:13–15):</strong> Po opadnięciu rosy na pustyni pojawia się drobne, jak szron ciało: <em>Man hu?</em> — „To jest chleb, który wam dał PAN”.'
      ]
    },
    {
      heading: 'MIARA OMERA I ROBACZYWIENIE CHCIWOŚCI (WJ 16:16–21)',
      points: [
        '<strong>7. Sprawiedliwa równość łaski (16:16–18):</strong> Jeden omer na osobę; kto zebrał więcej, nie miał nadmiaru, a słabszy, kto zebrał mniej — nie cierpiał braku (cytowane przez Pawła w 2 Kor 8:15).',
        '<strong>8. Zakaz chomikowania na jutro (16:19–20):</strong> Kto z braku zaufania zatrzymał mannę do rana w dni powszednie, znalazł robactwo i zgniliznę — lekcja codziennego „chleba naszego powszedniego daj nam dzisiaj”.',
        '<strong>9. Ranny rytm modlitwy i pracy (16:21):</strong> Mannę trzeba było zbierać wcześnie rano, zanim wzejdzie słońce i ją roztopi.'
      ]
    },
    {
      heading: 'PODWÓJNA PORCJA SZÓSTEGO DNIA I ŚWIĘTY SZABAT (WJ 16:22–30)',
      points: [
        '<strong>10. Cud potrójnej lekcji w szóstym dniu (16:22–24):</strong> W piątek z nieba spada podwójna porcja (dwa omery na głowę) i jako jedyna przechowana na siódmy dzień — nie psuje się ani nie rodzi robaków!',
        '<strong>11. Szabat przed Synajem (16:25–26):</strong> Bóg wskazuje na święty dzień siódmy — odpoczynek Szabatu PANA — już przed nadaniem tablic na górze Synaj, potwierdzając jego uniwersalne pochodzenie od stworzenia (Rdz 2:2–3).',
        '<strong>12. Porażka zachłannej pracy w Szabat (16:27–30):</strong> Ci, którzy wyszli szukać w siódmym dniu, wrócili z pustymi rękami; Bóg wzywa do zatrzymania gonitwy i odpoczęcia z ludem.'
      ]
    },
    {
      heading: 'OMER MANNY PRZED PANEM — WIECZNA PAMIĄTKA WIARY (WJ 16:31–36)',
      points: [
        '<strong>13. Biały dar o smaku placka z miodem (16:31):</strong> Chleb Boży żywi i smakuje słodyczą tym, którzy przyjmują go z wdzięcznością.',
        '<strong>14. Naczynie przed Świadectwem (16:32–34):</strong> Pełny omer manny zostaje zachowany na pamiątkę pokoleń (Hbr 9:4), aby dzieci pamiętały wierność Boga na pustkowiu.',
        '<strong>15. Czterdzieści lat codziennego cudu (16:35–36):</strong> Ani jednego dnia nie zabrakło chleba z nieba aż do samej granicy Kanaanu.'
      ]
    }
  ]),
  jezus: buildJezusSection(
    'Jezus w centrum',
    'Jezus Chrystus — Prawdziwy Chleb z Nieba i Pan Świętego Szabatu',
    [
      'W szóstym rozdziale Ewangelii Jana tłum pyta Jezusa, wskazując właśnie na Wj 16: „Ojcowie nasi jedli mannę na pustyni, jak jest napisane: Dał im do jedzenia chleb z nieba” (J 6:31). Jezus odpowiada im z boskim autorytetem: „Zaprawdę, zaprawdę powiadam wam: Nie Mojżesz dał wam chleb z nieba, ale mój Ojciec daje wam prawdziwy chleb z nieba. [...] Ja jestem chlebem życia. Kto do Mnie przychodzi, nigdy nie będzie łaknął” (J 6:32, 35, 48–51).',
      'Manna podtrzymywała życie doczesne przez 40 lat, lecz ciało Chrystusa wydane za świat daje życie wieczne. Równie wymownie brzmi obecność Szabatu w Wj 16:23–30! Ten sam Zbawiciel, który karmił Izraela na pustyni i nie dopuścił zepsucia podwójnej porcji w piątek, ogłasza się „Panem Szabatu” (Mk 2:27–28) i zaprasza zmęczonych pogonią tego świata: „Przyjdźcie do Mnie wszyscy, którzy jesteście spracowani i obciążeni, a Ja wam dam odpoczynek” (Mt 11:28).'
    ],
    16,
    'Czytaj Wj 16:1–36'
  ),
  sprawdz: buildSprawdzSection([
    { ref: 'Wj 16:4 → Pwt 8:3', desc: 'Upokorzenie głodem i nakarmienie manną, abyś poznał, że „nie samym chlebem żyje człowiek, ale każdym słowem z ust PANA”.' },
    { ref: 'Wj 16:4 → J 6:31–33', desc: 'Manna jako proroctwo o prawdziwym Chlebie z nieba — Jezusie Chrystusie.' },
    { ref: 'Wj 16:8 → Łk 10:16', desc: 'Kto odrzuca wiernych posłańców PANA, odrzuca samego Tego, który ich posłał.' },
    { ref: 'Wj 16:15 → J 6:51', desc: '„To jest chleb, który wam dał PAN” kontra „Ja jestem chlebem żywym, który zstąpił z nieba”.' },
    { ref: 'Wj 16:18 → 2 Kor 8:15', desc: '„Ten, kto miał dużo, nie miał nadmiaru, a kto miał mało, nie miał braku” — zasada hojnej solidarności w Kościele.' },
    { ref: 'Wj 16:19–20 → Mt 6:11, 34', desc: 'Zaufanie o chleb na dziś zamiast chciwego lęku o jutro — „Dosyć ma dzień swojej biedy”.' },
    { ref: 'Wj 16:21 → Ps 5:4', desc: 'Wczesny poranek jako czas szukania Bożego posilenia, zanim żar dnia pochłonie siły.' },
    { ref: 'Wj 16:23 → Rdz 2:2–3', desc: 'Siódmy dzień poświęcony odpoczynkowi PANA jeszcze zanim Izrael stanął pod górą Synaj.' },
    { ref: 'Wj 16:26 → Wj 20:8–11', desc: 'Przygotowanie w szóstym dniu, aby siódmy dzień był w pełni wolny na odpoczynek i cześć dla Boga.' },
    { ref: 'Wj 16:29 → Mk 2:27', desc: '„Szabat został ustanowiony dla człowieka” — Boży dar wytchnienia chroniący przed niewolnictwem pracy.' },
    { ref: 'Wj 16:33 → Hbr 9:4', desc: 'Złote naczynie z manną złożone przed Arką Przymierza jako znak Bożej wierności.' },
    { ref: 'Wj 16:35 → Obj 2:17', desc: 'Zwycięzcy w Chrystusie obiecana jest „ukryta manna” wiecznego pokoju z Bogiem.' }
  ]),
  prawda: buildPrawdaSection('5 Lekcji Pustyni Sin — Co zmienia się w Twojej ekonomii i odpoczynku?', [
    '<strong>Niewola potrafi wydawać się syta, gdy zapomnisz jej cenę:</strong> Lęk przed brakiem idealizuje przeszłe „garnce mięsa”, lecz Bóg nie wyprowadził Cię, byś żył jako syty niewolnik.',
    '<strong>Codzienna zależność bije na głowę lękowe gromadzenie:</strong> Manna w tygodniu uczy odbierania Bożej łaski dziś rano bez nerwowego chomikowania jutra.',
    '<strong>Chleb Boży szuka się z samego rana:</strong> Kto zaczyna dzień od Słowa i modlitwy (Wj 16:21), zbiera pokarm zanim upał obowiązków go roztopi.',
    '<strong>Święty Szabat to test zaufania i dar wolności:</strong> Odpoczynek siódmego dnia dowodzi, że Twoje utrzymanie nie leży w siedmiodniowym wyścigu, lecz w błogosławieństwie Stwórcy.',
    '<strong>Chrystus jest jedyną pełnią głodnej duszy:</strong> Każde ziemskie nasycenie wraca w głód — tylko Chleb Życia gasi pragnienie wieczności.'
  ]),
  pomysl: buildPomyslSection([
    'Czy kiedy brakuje Ci wygody lub poczucia kontroli, łapiesz się na idealizowaniu przeszłości sprzed nawrócenia („garnce mięsa w Egipcie”, Wj 16:3)?',
    'Jak zaczyna się Twój poranek — czy zbierasz duchową mannę Bożego Słowa o świcie, zanim roztopi ją skwar codziennych spraw (Wj 16:21)?',
    'Gdzie w Twoim myśleniu o pieniądzach, czasie czy karierze psuje się „manna zachomikowana ze strachu” zamiast ufności w codzienne „daj nam dzisiaj” (Wj 16:19–20)?',
    'Czy traktujesz siódmy dzień — święty Szabat — jako radosny dar odpoczynku w obecności PANA, z wcześniejszym przygotowaniem szóstego dnia (Wj 16:22–30)?',
    'Kiedy ostatnio podzieliłeś się nadmiarem swoich zasobów z kimś, kto zebrał „mniej” w trudniejszej porze życia (Wj 16:18; 2 Kor 8:15)?',
    'Jaka chciwość lub niewiara w Boże zaopatrzenie psuje Twój pokój serca dzisiaj?',
    'Co znaczy dla Ciebie karmić się Chrystusem jako prawdziwym Chlebem z nieba w zwykłych obowiązkach tego tygodnia (J 6:35)?',
    'Jaki „omer pamięci” (Wj 16:32) z wdzięczności za wierność Boga w tym roku warto zachować przed oczami swojej rodziny?'
  ]),
  decyzja: buildDecyzjaSection(
    'Odrzuć Narzekanie Pustyni — Karm Się Chrystusem i Świętuj Odpoczynek PANA!',
    'Szesnasty rozdział Księgi Wyjścia wystawia na próbę dwa obszary, w których najłatwiej zapominamy o Bogu: nasz lęk o codzienny chleb oraz naszą gorączkę nieustannej pracy bez odpoczynku. Bóg zaprasza Cię dziś do porannej modlitwy ufności i do wejścia w błogosławiony rytm Szabatu — jako człowiek wolny, którego nie utrzymuje faraon, ale Ojciec Niebieski.',
    'Panie Jezu Chryste, Chlebie Żywy zstępujący z nieba! Wyznaję moje lękowe narzekania i brak wiary w Twoje codzienne zaopatrzenie. Wybieram od dziś zbierać Twoje Słowo o poranku, dzielić się hojnie tym, co otrzymuję, i czcić Twój święty dzień odpoczynku z sercem wolnym od gonitwy. Wiem, że Ten, który karmił Izraela przez czterdzieści lat, zatroszczy się wiernie o każdy mój dzień.'
  ),
  modlitwa: buildModlitwaSection(
    'Modlitwa na 15 listopada',
    'Modlitwa o Chleb Powszedni, Hojność i Błogosławiony Odpoczynek Szabatu',
    [
      'Ojcze Niebieski, Dawco wszelkiego dobrego daru i Stwórco nieba i ziemi! Dziękujemy Ci za szesnasty rozdział Księgi Wyjścia, w którym z czułością karmisz nawet szemrzący lud na pustkowiu Sin, ucząc go codziennego zaufania i świętości Szabatu.',
      'Przebacz nam każdą chwilę tęsknoty za złudnymi garncami świata i każdy strach o jutro, przez który próbowaliśmy gromadzić szczęście własnymi siłami zamiast przyjmować Twój powszedni omer łaski. Naucz nas otwierać Twoje Słowo wcześnie rano i dziękować za drobne, cudowne dowody Twojej obecności.',
      'Panie Jezu Chryste, nasz prawdziwy Chlebie z nieba i Panie Szabatu! Karm nasze dusze Sobą samym, byśmy nie żyli samym chlebem, lecz każdym Twoim słowem. Wlej w nasze rodziny pokój świętego odpoczynku w Twoje imię i spraw, aby każdy dzień naszego życia głosił Twoją chwałę. Amen.'
    ]
  ),
  tasks: [
    'Przeczytaj cały rozdział <a href="/mojabiblia?book=EXO&chapter=16" class="text-amber-300 underline font-semibold">Wj 16:1–36</a> w przekładzie UBG.',
    'Przeczytaj Ewangelię Jana 6:31–51, odkrywając, jak Jezus wypełnia znak manny na pustyni.',
    'Zarezerwuj jutro rano 15 minut cichego spotkania ze Słowem przed rozpoczęciem gonitwy dnia (Wj 16:21).',
    'Sprawdź swój plan tygodnia pod kątem świętego odpoczynku siódmego dnia i przygotowania przed Szabatem (Wj 16:23).',
    'Przekaż konkretną pomoc lub zachętę osobie przeżywającej trudniejszy materialnie lub duchowo czas (2 Kor 8:15).',
    'Zapisz w notatniku jedno świadectwo Bożego zaopatrzenia z przeszłości jako Twój „omer pamiątki”.',
    'Powtórz z pamięci Wj 16:4 i oddaj Bogu troskę o nadchodzący tydzień.'
  ],
  quizComment: '// ── QUIZ LOGIC (20 PYTAŃ Z WJ 16:1–36) ──',
  quiz: [
    { q: 'Dokąd przybyli synowie Izraela po wyruszeniu z Elim piętnastego dnia drugiego miesiąca (Wj 16:1)?', a: ['Do ziemi Kanaan nad Jordanem', 'Na pustynię Sin, między Elim a Synajem', 'Z powrotem do Sukkot', 'Do oazy Ramzes'], c: 1 },
    { q: 'O co szemrało całe zgromadzenie Izraelitów przeciw Mojżeszowi i Aaronowi w Wj 16:2–3?', a: ['O brak broni do podboju Kanaanu', 'O brak jedzenia, wspominając egipskie garnce mięsa i jedzenie chleba do syta', 'O zbyt długie pieśni uwielbienia', 'O zbyt ciężkie skrzynie ze srebrem'], c: 1 },
    { q: 'Co PAN obiecał spuścić z nieba „jak deszcz” w Wj 16:4?', a: ['Złote monety na pustynię', 'Chleb z nieba, aby wystawić lud na próbę posłuszeństwa', 'Oliwę z oliwek na siedem lat', 'Kamyki szlachetne z gór Synaju'], c: 1 },
    { q: 'Ile podwójnej miary mieli przygotować Izraelici szóstego dnia według Wj 16:5?', a: ['Dziesięć razy więcej niż w tygodniu', 'Dwa razy tyle, ile zbierali codziennie', 'Ani grama — mieli pościć przez dwa dni', 'Tylko połowę zwykłej miary'], c: 1 },
    { q: 'Co powiedział Mojżesz ludowi o istocie ich szemrania (Wj 16:7–8)?', a: ['Że słusznie narzekają wyłącznie na Aarona', 'Że ich szemranie jest nie przeciw Mojżeszowi i Aaronowi, ale przeciwko PANU', 'Że to tylko drobna słabość starszyzny', 'Że winni są kupcy z Madian'], c: 1 },
    { q: 'Jaką postać objawienia ujrzał lud na pustyni, gdy Aaron przemówił (Wj 16:10)?', a: ['Potężnego lwa na szczycie góry', 'Chwałę PANA, która ukazała się w obłoku', 'Błyskawice uderzające w obozowisko', 'Anioła z tablicami kamiennymi'], c: 1 },
    { q: 'Co pojawiło się w obozie wieczorem i nakryło go w Wj 16:13?', a: ['Chmura szarańczy', 'Przepiórki przylatujące wieczorem i okrywające obóz', 'Stado dzikich gołębi z północy', 'Stado saren pustynnych'], c: 1 },
    { q: 'Co leżało na powierzchni pustyni rano, gdy podniosła się warstwa rosy (Wj 16:14)?', a: ['Ziarna dojrzałej pszenicy w kłosach', 'Coś drobnego, okrągłego / łuskowatego, drobnego jak szron na ziemi', 'Gotowe bochenki chleba w koszach', 'Słodkie owoce palm z Elim'], c: 1 },
    { q: 'Dlaczego Izraelici nazwali ten pokarm „manna” (Wj 16:15, 31)?', a: ['Od imienia pierwszej córki Aarona', 'Bo na jego widok pytali jedni drugich: „Man hu?” („Co to jest?”), gdyż nie wiedzieli, co to było', 'Bo rósł na drzewach mannowych pod Synajem', 'Tak nazywał się królewski chleb w Memfis'], c: 1 },
    { q: 'Ile każdy człowiek miał zebrać manny każdego powszedniego dnia (Wj 16:16)?', a: ['Jedną tonę na całą rodzinę', 'Po jednym omerze na głowę według liczby dusz w namiocie', 'Tylko garść raz na trzy dni', 'Tyle, ile uniesie osioł'], c: 1 },
    { q: 'Co działo się według Wj 16:18 po odmierzeniu zebranej manny omerem?', a: ['Kto zebrał więcej, sprzedawał biedniejszym', 'Kto zebrał więcej, nie miał za dużo, a kto mniej, nie miał za mało', 'Połowa zawsze przepadała w piasku', 'Zostawało tylko dla kapłanów Lewiego'], c: 1 },
    { q: 'Co stało się w dzień powszedni z manną zostawioną wbrew zakazowi do rana (Wj 16:20)?', a: ['Stwardniała jak biały marmur', 'Zalęgło się w niej robactwo i zaśmierdziała się', 'Zamieniła się w wodę źródlaną', 'Przemieniła się w czysty miód'], c: 1 },
    { q: 'O jakiej porze zbierano mannę i co działo się z niezebraną później (Wj 16:21)?', a: ['W południe, gdy wiał zimny wiatr', 'Zbierano ją rano; a gdy słońce dogrzewało — topniała', 'Wyłącznie o północy przy pochodniach', 'Tylko podczas ulewnego deszczu'], c: 1 },
    { q: 'Co niezwykłego stało się szóstego dnia bez żadnego zepsucia (Wj 16:22–24)?', a: ['Spadła poczwórna porcja ze srebrem', 'Zebrali po dwa omery na osobę, a przechowana do siódmego dnia nie zaśmierdziała się i nie miała robaków', 'Wszyscy spali przez cały dzień', 'Przepiórki zostały na dziesięć dni'], c: 1 },
    { q: 'Czym Mojżesz nazwał dzień siódmy w Wj 16:23–26?', a: ['Dniem targowym pustyni', 'Odpoczynkiem, świętym Szabatem dla PANA, w którym manna nie spada na pole', 'Dniem zwykłej pracy przy zbiorze drzewa', 'Świętem zakończenia postu'], c: 1 },
    { q: 'Co spotkało tych nieposłusznych, którzy wyszli zbierać mannę siódmego dnia (Wj 16:27)?', a: ['Zebrali potrójny omer przed wschodem słońca', 'Wyszli, ale nic nie znaleźli', 'Zostali ugryzieni przez pustynne węże', 'Znaleźli tylko gorzkie zioła'], c: 1 },
    { q: 'Do czego werset Wj 16:31 porównuje wygląd i smak manny?', a: ['Do żółtego jęczmienia o smaku gorzkiej oliwy', 'Była jak białe ziarno kolendry, a w smaku jak placek z miodem', 'Do czarnego żyta o smaku soli morskiej', 'Do czerwonych owoców granatu'], c: 1 },
    { q: 'Po co PAN nakazał nabrać jeden pełny omer manny do dzbana i złożyć przed Świadectwem (Wj 16:32–34)?', a: ['Na sprzedaż w ziemi Kanaan', 'Dla pokoleń, aby widziały chleb, którym PAN żywił ich na pustyni po wyjściu z Egiptu', 'Jako tajny lek dla faraona', 'Do rozdania kupcom z Edomu'], c: 1 },
    { q: 'Jak długo synowie Izraela jedli mannę według Wj 16:35?', a: ['Przez czterdzieści dni pod górą Synaj', 'Przez czterdzieści lat, aż przyszli do zamieszkanej ziemi na granicy Kanaanu', 'Tylko przez siedem miesięcy zimy', 'Przez sto dwadzieścia lat'], c: 1 },
    { q: 'Jakiej jednostce objętości odpowiadał jeden omer według ostatniego wersetu Wj 16:36?', a: ['Połowie bata', 'Dziesiątej części efy', 'Trzem kwarcom egipskim', 'Dwóm talantom srebra'], c: 1 }
  ]
};

function applyRichDay(html, dayNum, cfg) {
  let out = fixGlobalMarkup(html, dayNum);
  out = fixNavAndJutro(out, dayNum);

  const mv = vText(cfg.mvChapter, cfg.mvVerse);
  out = replaceMemoryVerse(out, {
    quoteText: mv,
    citeText: `Księga Wyjścia ${cfg.mvChapter}:${cfg.mvVerse} (UBG)`,
    refShort: `Wj ${cfg.mvChapter}:${cfg.mvVerse}`,
    utteranceText: `${mv} (Księga Wyjścia ${cfg.mvChapter}:${cfg.mvVerse})`
  });

  if (cfg.strong) {
    out = out.replace(/<!-- HEBREW STRONG CODES[\s\S]*?<\/section>/, cfg.strong);
  }
  if (cfg.exegesis) {
    out = out.replace(/<section class="kc-card space-y-6">\s*<div class="flex items-center gap-2 border-b border-brand-line pb-4">[\s\S]{0,400}?EGZEGEZA & FORMACJA TEOLOGICZNA[\s\S]*?<\/section>\s*(?=<!-- ── JEZUS)/, cfg.exegesis + '\n\n      ');
  }
  if (cfg.jezus) {
    out = out.replace(/<!-- ── JEZUS W CENTRUM[\s\S]*?<\/section>/, cfg.jezus);
  }
  if (cfg.sprawdz) {
    out = out.replace(/<!-- ── SPRAWDŹ W BIBLII[\s\S]*?<\/section>/, cfg.sprawdz);
  }
  if (cfg.prawda) {
    out = out.replace(/<!-- ── PRAWDA NA DZIŚ[\s\S]*?<\/section>/, cfg.prawda);
  }
  if (cfg.pomysl) {
    out = out.replace(/<!-- ── POMYŚL[\s\S]*?<\/section>/, cfg.pomysl);
  }
  if (cfg.decyzja) {
    out = out.replace(/<!-- ── TWOJA DECYZJA[\s\S]*?<\/section>/, cfg.decyzja);
  }
  if (cfg.modlitwa) {
    out = out.replace(/<!-- ── MODLITWA[\s\S]*?<\/section>/, cfg.modlitwa);
  }
  if (cfg.tasks) {
    out = replaceTaskCheckboxes(out, cfg.tasks);
  }
  if (cfg.quizComment) {
    out = out.replace(/\/\/ ── QUIZ LOGIC \([^\n]+\) ──/, cfg.quizComment);
  }
  if (cfg.quiz) {
    out = out.replace(/const QUIZ_DATA = \[[\s\S]*?\];/, `const QUIZ_DATA = ${JSON.stringify(cfg.quiz, null, 2)};`);
  }

  // Czytaj Wj 11:1-12:36 -> właściwy link dla dnia (gdy sekcja Jezus w centrum została albo nie została podmieniona)
  out = out.replace(
    /<a[^>]+href="\/mojabiblia\?book=EXO&chapter=\d+"[^>]*>(\s*<i[^>]*><\/i>)?\s*<span>Czytaj Wj 11:1–12:36<\/span>\s*<\/a>/g,
    `<a href="/mojabiblia?book=EXO&chapter=${cfg.mvChapter}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${cfg.reading}</span></a>`
  );

  // Naprawa tekstu Strong intro na D45
  if (dayNum === 45) {
    out = out.replace(
      /Poniższe terminy hebrajskie stanowią osnowę teologiczną 11\. i 12\. rozdziału Księgi Wyjścia:/g,
      'Poniższe terminy hebrajskie stanowią osnowę teologiczną 15. rozdziału Księgi Wyjścia:'
    );
  }

  // Naprawa #jutro dla D43 (-> D44) i D44 (-> D45) i D46 (-> D47)
  if (dayNum === 43) {
    out = out.replace(
      /DZIEŃ 43 — WYJŚCIE Z RAMZES[\s\S]*?<\/p>/,
      `DZIEŃ 44 — PRZEJŚCIE PRZEZ MORZE CZERWONE — PAN BĘDZIE ZA WAS WALCZYŁ (Wj 14:1–31)\n        </h3>\n        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">\n          Dzień 44: Pułapka nad brzegiem morza, pościg rydwanów faraona, sucha ścieżka między ścianami wody oraz obietnica z Wj 14:14: „PAN będzie za was walczył, a wy będziecie milczeć”.\n        </p>`
    );
  } else if (dayNum === 44) {
    out = out.replace(
      /DZIEŃ 43 — WYJŚCIE Z RAMZES[\s\S]*?<\/p>/,
      `DZIEŃ 45 — PIEŚŃ ZWYCIĘSTWA I GORZKIE WODY MARA — PAN TWOIM LEKARZEM (Wj 15:1–27)\n        </h3>\n        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">\n          Dzień 45: Najstarszy hymn odkupienia Mojżesza i Miriam nad brzegiem wolności oraz przemiana gorzkich wód w słodkie przy źródłach Mara.\n        </p>`
    );
  } else if (dayNum === 46) {
    out = out.replace(
      /DZIEŃ 43 — WYJŚCIE Z RAMZES[\s\S]*?<\/p>/,
      `DZIEŃ 47 — WODA ZE SKAŁY W HOREBIE I ZWYCIĘSTWO NAD AMALEKIEM (Wj 17:1–16)\n        </h3>\n        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">\n          Dzień 47: Kolejna próba pragnienia w Massa i Meriba, uderzona skała dająca żywy strumień oraz wzniesione ręce Mojżesza nad doliną bitwy pod Refidim.\n        </p>`
    );
    out = out.replace(/Dostępne od północy \(12 listopada\)/g, 'Dostępne od północy (16 listopada 2026)');
  }

  out = replaceShareLinks(out, dayNum, cfg.title, cfg.reading, mv);
  return out;
}

// ── WYKONANIE NAPRAWY NA WSZYSTKICH 46 DNIACH (4 ŚCIEŻKI KAŻDY) ──
let updatedCount = 0;

for (let n = 1; n <= 46; n++) {
  const canonicalPath = path.join(ROOT, `akademia/kurscodzienny/dzien-${pad2(n)}.html`);
  if (!fs.existsSync(canonicalPath)) continue;
  let html = fs.readFileSync(canonicalPath, 'utf8');

  html = fixGlobalMarkup(html, n);
  html = fixNavAndJutro(html, n);

  if (n === 34) {
    const mv3 = vText(3, 14);
    html = replaceMemoryVerse(html, {
      quoteText: mv3,
      citeText: 'Księga Wyjścia 3:14 (UBG)',
      refShort: 'Wj 3:14',
      utteranceText: `${mv3} (Księga Wyjścia 3:14)`
    });
    html = html.replace(
      /(<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*)[\s\S]*?(<\/div>\s*<\/header>)/,
      `$1Trzeci rozdział Księgi Wyjścia to objawienie Świętego Imienia JAHWE (JESTEM, KTÓRY JESTEM) z płonącego krzaka: Bóg widzi niedolę swego ludu, pamięta o przymierzu i zstępuje osobiście, aby wyrwać go z niewoli Egiptu.\n      </div>\n    </header>`
    );
    html = html.replace(
      /href="\/mojabiblia\?book=EXO&chapter=2"([^>]*>(?:\s*<[^>]+>)*\s*<span>?Czytaj Wj 3)/g,
      'href="/mojabiblia?book=EXO&chapter=3"$1'
    );
    html = html.replace(/href="\/mojabiblia\?book=EXO&chapter=2"/g, 'href="/mojabiblia?book=EXO&chapter=3"');
  } else if (n === 37) {
    html = fixDay37(html);
  } else if (n === 40) {
    const mv9 = vText(9, 16);
    html = replaceMemoryVerse(html, {
      quoteText: mv9,
      citeText: 'Księga Wyjścia 9:16 (UBG)',
      refShort: 'Wj 9:16',
      utteranceText: `${mv9} (Księga Wyjścia 9:16)`
    });
  } else if (n === 41) {
    const mv10 = vText(10, 23);
    html = replaceMemoryVerse(html, {
      quoteText: mv10,
      citeText: 'Księga Wyjścia 10:23 (UBG)',
      refShort: 'Wj 10:23',
      utteranceText: `${mv10} (Księga Wyjścia 10:23)`
    });
  } else if (n === 42) {
    const mv12 = vText(12, 13);
    html = replaceMemoryVerse(html, {
      quoteText: mv12,
      citeText: 'Księga Wyjścia 12:13 (UBG)',
      refShort: 'Wj 12:13',
      utteranceText: `${mv12} (Księga Wyjścia 12:13)`
    });
  } else if (n === 43) {
    html = applyRichDay(html, 43, D43_CONFIG);
  } else if (n === 44) {
    html = applyRichDay(html, 44, D44_CONFIG);
  } else if (n === 45) {
    html = applyRichDay(html, 45, {
      title: 'PIEŚŃ ZWYCIĘSTWA I GORZKIE WODY MARA — PAN TWOIM LEKARZEM',
      reading: 'Wj 15:1–27',
      mvChapter: 15,
      mvVerse: 2,
      jezus: D45_JEZUS,
      sprawdz: D45_SPRAWDZ,
      decyzja: D45_DECYZJA,
      quizComment: '// ── QUIZ LOGIC (20 PYTAŃ Z WJ 15:1–27) ──'
    });
  } else if (n === 46) {
    html = applyRichDay(html, 46, D46_CONFIG);
  }

  const targets = [
    path.join(ROOT, `akademia/kurscodzienny/dzien-${pad2(n)}.html`),
    path.join(ROOT, `akademia/kurscodzienny/dzien-${pad2(n)}/index.html`),
    path.join(ROOT, `kursy/kurscodzienny/dzien-${pad2(n)}.html`),
    path.join(ROOT, `kursy/kurscodzienny/dzien-${pad2(n)}/index.html`)
  ];
  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, html, 'utf8');
    updatedCount++;
  }
}

// Naprawa kolejki publikacji HTML i JSON
for (const qItem of [
  { date: '2026-11-10', day: 41 },
  { date: '2026-11-11', day: 42 }
]) {
  const qPath = path.join(ROOT, `kolejka-publikacji/kurs-codzienny/${qItem.date}/lekcja.html`);
  if (fs.existsSync(qPath)) {
    let qHtml = fs.readFileSync(qPath, 'utf8');
    qHtml = fixGlobalMarkup(qHtml, qItem.day);
    if (qItem.day === 42) {
      const mv12 = vText(12, 13);
      qHtml = replaceMemoryVerse(qHtml, {
        quoteText: mv12,
        citeText: 'Księga Wyjścia 12:13 (UBG)',
        refShort: 'Wj 12:13',
        utteranceText: `${mv12} (Księga Wyjścia 12:13)`
      });
    }
    fs.writeFileSync(qPath, qHtml, 'utf8');
    updatedCount++;
  }
}

const q12JsonPath = path.join(ROOT, 'kolejka-publikacji/kurs-codzienny/2026-11-12/rozwazanie.json');
if (fs.existsSync(q12JsonPath)) {
  const q12 = JSON.parse(fs.readFileSync(q12JsonPath, 'utf8'));
  q12.memoryVerse = `„${vText(13, 21)}” (Wj 13:21, UBG)`;
  fs.writeFileSync(q12JsonPath, JSON.stringify(q12, null, 2) + '\n', 'utf8');
  updatedCount++;
}

console.log(`✅ Zaktualizowano ${updatedCount} plików lekcji/kolejki.`);
