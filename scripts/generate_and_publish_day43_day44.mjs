// Master publisher for Day 43 and Day 44
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { day43Data, day44Data } from './day_data_43_44.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEKTOR1 = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🚀 Rozpoczynam generowanie i publikację Dnia 43 oraz Dnia 44...');

// ── 1. CZYTANIE BIBLII UBG ──
const exo12Data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/ubg-2025/EXO-012.json'), 'utf8'));
const exo13Data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/ubg-2025/EXO-013.json'), 'utf8'));
const exo14Data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/ubg-2025/EXO-014.json'), 'utf8'));

// Dzień 43: Wj 12:37–13:22
const readingD43Html = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 12:37–51 — Wymarsz z Ramzes i ustawa o Paschy</h3></div>',
  ...exo12Data.verses.filter(v => v.number >= 37).map(v => `<p><span class="verse-num">12:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 13:1–22 — Poświęcenie pierworodnych, słup obłoku i słup ognia</h3></div>',
  ...exo13Data.verses.map(v => `<p><span class="verse-num">13:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// Dzień 44: Wj 14:1–31
const readingD44Html = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 14:1–31 — Przejście przez Morze Czerwone i ratunek PANA</h3></div>',
  ...exo14Data.verses.map(v => `<p><span class="verse-num">14:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

console.log('✅ Wczytano wersety UBG dla Dnia 43 i Dnia 44');

// ── 2. PAKIETY ROZWAŻAŃ I KOLEJKA PUBLIKACJI ──
const days = [day43Data, day44Data];

for (const d of days) {
  const queueDir = path.join(ROOT, `kolejka-publikacji/kurs-codzienny/${d.dateStr}`);
  fs.mkdirSync(queueDir, { recursive: true });

  const rozwazanieJson = {
    id: `ref_day${d.dayNum}_${d.dateStr}`,
    day: d.dayNum,
    date: d.dateStr,
    dateFormatted: d.dateFormatted,
    title: `☀️ Z Biblią za Pan Brat — Dzień ${d.dayNum}: ${d.title}`,
    book: d.book,
    reading: d.reading,
    memoryVerse: d.memoryVerse,
    theme: d.theme,
    fullText: d.contentApp,
    contentApp: d.contentApp,
    contentWeb: d.contentWeb,
    contentSms: d.contentSms,
    imageUrl: d.imageUrl,
    authorName: 'Cezary Rogowski',
    authorUid: 'admin',
    authorSlug: 'cezaryrgowski',
    publishedAt: `${d.dateStr}T06:00:00.000Z`,
    status: 'published'
  };

  fs.writeFileSync(path.join(queueDir, 'rozwazanie.json'), JSON.stringify(rozwazanieJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(queueDir, 'meta.json'), JSON.stringify({ day: d.dayNum, date: d.dateStr, status: 'published' }, null, 2), 'utf8');
  console.log(`✅ Zapisano kolejkę publikacji dla Dnia ${d.dayNum}`);
}

// ── 3. SYNCHRONIZACJA BAZY ROZWAŻAŃ (6 MIRRORÓW) ──
const MIRRORS = [
  path.join(ROOT, 'rozwazania_baza.json'),
  path.join(ROOT, '.pages-release/rozwazania_baza.json'),
  path.join(WEKTOR1, 'rozwazania_baza.json'),
  path.join(LUMINA, 'rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json'
];

for (const m of MIRRORS) {
  if (fs.existsSync(m)) {
    try {
      let data = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (Array.isArray(data)) {
        for (const d of [day43Data, day44Data]) {
          data = data.filter(item => item.day !== d.dayNum && item.date !== d.dateStr);
          const entry = {
            id: `ref_day${d.dayNum}_${d.dateStr}`,
            day: d.dayNum,
            date: d.dateStr,
            dateFormatted: d.dateFormatted,
            title: `☀️ Z Biblią za Pan Brat — Dzień ${d.dayNum}: ${d.title}`,
            book: d.book,
            reading: d.reading,
            memoryVerse: d.memoryVerse,
            theme: d.theme,
            fullText: d.contentApp,
            contentApp: d.contentApp,
            contentWeb: d.contentWeb,
            contentSms: d.contentSms,
            imageUrl: d.imageUrl,
            authorName: 'Cezary Rogowski',
            authorUid: 'admin',
            authorSlug: 'cezaryrgowski'
          };
          data.unshift(entry);
        }
        fs.writeFileSync(m, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano mirror: ${m} (${data.length} wpisów)`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji ${m}:`, e.message);
    }
  }
}

// ── 4. BUDOWA STRON LEKCJI HTML (Dzień 43 i Dzień 44) ──
const d42HtmlPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-42.html');
const templateHtml = fs.readFileSync(d42HtmlPath, 'utf8');

// Budujemy Dzień 43
let html43 = templateHtml;
html43 = html43.replace(/<title>Dzień 42:[^<]+<\/title>/, `<title>Dzień 43: ${day43Data.title} (${day43Data.reading}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html43 = html43.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 43 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${day43Data.book} ${day43Data.reading}: ${day43Data.subtitle}">`);
html43 = html43.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-42"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-43"`);
html43 = html43.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 43: ${day43Data.title} (${day43Data.reading}) | Z Biblią za Pan Brat"`);
html43 = html43.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${day43Data.subtitle}"`);
html43 = html43.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-42"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-43"`);
html43 = html43.replace(/kc_day_42_swieto_paschy_krew_baranka\.jpg\?v=\d+/g, `kc_day_43_slup_obloku_i_ognia.jpg?v=20261112`);
html43 = html43.replace(/kc_day_42_swieto_paschy_krew_baranka\.jpg/g, `kc_day_43_slup_obloku_i_ognia.jpg`);

html43 = html43.replace(/<span class="text-amber-400 font-semibold">Dzień 42<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 43</span>`);

const nav43 = `<a href="/akademia/kurscodzienny/dzien-42" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 42</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-44" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 44 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`;
html43 = html43.replace(/<a href="\/akademia\/kurscodzienny\/dzien-41"[\s\S]*?<\/span>\s*<\/span>/, nav43);

html43 = html43.replace(/<span>Dzień 42 z 2009<\/span>/, `<span>Dzień 43 z 2009</span>`);
html43 = html43.replace(/11 LISTOPADA 2026 • ŚRODA/, `12 LISTOPADA 2026 • CZWARTEK`);
html43 = html43.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${day43Data.title}\n      </h1>`);
html43 = html43.replace(/<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/, `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${day43Data.subtitle}\n      </p>`);
html43 = html43.replace(/alt="Dzień 42:[^"]+"/, `alt="Dzień 43: ${day43Data.title}"`);
html43 = html43.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>Ilustracja biblijna: ${day43Data.title} (${day43Data.reading})</span>`);
html43 = html43.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 11:1–12:36<\/span>/, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${day43Data.reading}</span>`);
html43 = html43.replace(/Księga Wyjścia 11:1–12:36 • Ustanowienie Baranka Paschalnego[^<]*/, `Księga Wyjścia 12:37–13:22 • Wymarsz z Egiptu, poświęcenie pierworodnych i prowadzenie w słupie obłoku i ognia`);

html43 = html43.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/, `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">\n            ${day43Data.memoryVerse}\n          </blockquote>`);
html43 = html43.replace(/— Księga Wyjścia 12:13 \(UBG\)/, `— Księga Wyjścia 13:21 (UBG)`);
html43 = html43.replace(/navigator\.clipboard\.writeText\('[^']+'\)/, `navigator.clipboard.writeText('${day43Data.memoryVerse.replace(/'/g, "\\'")}')`);
html43 = html43.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/, `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${day43Data.theme}\n      </div>\n    </div>`);

html43 = html43.replace(/Dziś jest <strong class="text-white">Dzień 42<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 11:1–12:36<\/strong>\./, `Dziś jest <strong class="text-white">Dzień 43</strong>: Księga Wyjścia, <strong class="text-brand-gold">${day43Data.reading}</strong>.`);
html43 = html43.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 11:1–12:36<\/p>/, `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • ${day43Data.reading}</p>`);
html43 = html43.replace(/href="\/mojabiblia\?book=EXO&chapter=12"/g, `href="/mojabiblia?book=EXO&chapter=13"`);

html43 = html43.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/, `<div class="kc-prose-reading">\n        ${readingD43Html}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`);

// Zaktualizuj sekcję jutro w Dniu 43 wskazując na Dzień 44
html43 = html43.replace(/JUTRO — 12 LISTOPADA 2026/, `JUTRO — 13 LISTOPADA 2026`);
html43 = html43.replace(/Dalszy ciąg Księgi Wyjścia: Wj 12:37–13:22[^<]*/, `Dalszy ciąg Księgi Wyjścia: Wj 14:1–31 — Przejście przez Morze Czerwone i ratunek PANA`);
html43 = html43.replace(/href="\/akademia\/kurscodzienny\/dzien-43"/g, `href="/akademia/kurscodzienny/dzien-44"`);

// Zapisz Dzień 43 w 4 ścieżkach
const paths43 = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-43.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-43/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-43.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-43/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-43.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-43/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-43.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-43/index.html')
];

for (const p of paths43) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html43, 'utf8');
}
console.log('✅ Zapisano 8 ścieżek HTML dla Dnia 43');

// Budujemy Dzień 44 na podstawie Dnia 43
let html44 = html43;
html44 = html44.replace(/<title>Dzień 43:[^<]+<\/title>/, `<title>Dzień 44: ${day44Data.title} (${day44Data.reading}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html44 = html44.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 44 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${day44Data.book} ${day44Data.reading}: ${day44Data.subtitle}">`);
html44 = html44.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-43"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-44"`);
html44 = html44.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 44: ${day44Data.title} (${day44Data.reading}) | Z Biblią za Pan Brat"`);
html44 = html44.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${day44Data.subtitle}"`);
html44 = html44.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-43"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-44"`);
html44 = html44.replace(/kc_day_43_slup_obloku_i_ognia\.jpg\?v=\d+/g, `kc_day_44_przejscie_przez_morze_czerwone.jpg?v=20261113`);
html44 = html44.replace(/kc_day_43_slup_obloku_i_ognia\.jpg/g, `kc_day_44_przejscie_przez_morze_czerwone.jpg`);

html44 = html44.replace(/<span class="text-amber-400 font-semibold">Dzień 43<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 44</span>`);

const nav44 = `<a href="/akademia/kurscodzienny/dzien-43" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 43</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 45 (Jutro) →</span>
        </span>`;
html44 = html44.replace(/<a href="\/akademia\/kurscodzienny\/dzien-42"[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-44"[\s\S]*?<\/a>/, nav44);

html44 = html44.replace(/<span>Dzień 43 z 2009<\/span>/, `<span>Dzień 44 z 2009</span>`);
html44 = html44.replace(/12 LISTOPADA 2026 • CZWARTEK/, `13 LISTOPADA 2026 • PIĄTEK`);
html44 = html44.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${day44Data.title}\n      </h1>`);
html44 = html44.replace(/<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/, `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${day44Data.subtitle}\n      </p>`);
html44 = html44.replace(/alt="Dzień 43:[^"]+"/, `alt="Dzień 44: ${day44Data.title}"`);
html44 = html44.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>Ilustracja biblijna: ${day44Data.title} (${day44Data.reading})</span>`);
html44 = html44.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 12:37–13:22<\/span>/, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${day44Data.reading}</span>`);
html44 = html44.replace(/Księga Wyjścia 12:37–13:22 • Wymarsz z Egiptu[^<]*/, `Księga Wyjścia 14:1–31 • Przejście przez Morze Czerwone, mur z wód po prawej i lewej stronie oraz Boży ratunek`);

html44 = html44.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/, `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">\n            ${day44Data.memoryVerse}\n          </blockquote>`);
html44 = html44.replace(/<p class="font-serif italic text-base sm:text-lg text-white">[\s\S]*?<\/p>/, `<p class="font-serif italic text-base sm:text-lg text-white">\n            ${day44Data.memoryVerse}\n          </p>`);
html44 = html44.replace(/<meta name="description" content="[^"]*"[^>]*>(?:\s*>+\s*\/>)?/, `<meta name="description" content="${day44Data.title} — ${day44Data.reading}" />`);
html44 = html44.replace(/https:\/\/patronite\.pl\/radiocc/g, 'https://patronite.pl/osobowoscplus');
html44 = html44.replace(/(<a[^>]*patronite\.pl[^>]*?)\s+id="ccTopSubLink"/g, '$1');
html44 = html44.replace(/<a\s+<a/gi, '<a');
html44 = html44.replace(/completeDay4[23]/g, 'completeDay44');
html44 = html44.replace(/Dzień 4[23] ukończony!/g, 'Dzień 44 ukończony!');
html44 = html44.replace(/— Księga Wyjścia 13:21 \(UBG\)/, `— Księga Wyjścia 14:14 (UBG)`);
html44 = html44.replace(/navigator\.clipboard\.writeText\('[^']+'\)/, `navigator.clipboard.writeText('${day44Data.memoryVerse.replace(/'/g, "\\'")}')`);
html44 = html44.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/, `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${day44Data.theme}\n      </div>\n    </div>`);

html44 = html44.replace(/Dziś jest <strong class="text-white">Dzień 43<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 12:37–13:22<\/strong>\./, `Dziś jest <strong class="text-white">Dzień 44</strong>: Księga Wyjścia, <strong class="text-brand-gold">${day44Data.reading}</strong>.`);
html44 = html44.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 12:37–13:22<\/p>/, `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • ${day44Data.reading}</p>`);
html44 = html44.replace(/href="\/mojabiblia\?book=EXO&chapter=13"/g, `href="/mojabiblia?book=EXO&chapter=14"`);

html44 = html44.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/, `<div class="kc-prose-reading">\n        ${readingD44Html}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`);

// Jutro w Dniu 44 -> Dzień 45
html44 = html44.replace(/JUTRO — 13 LISTOPADA 2026/, `JUTRO — 14 LISTOPADA 2026`);
html44 = html44.replace(/Dalszy ciąg Księgi Wyjścia: Wj 14:1–31[^<]*/, `Dalszy ciąg Księgi Wyjścia: Wj 15:1–27 — Pieśń Mojżesza i Miriam oraz gorzkie wody Mara przemienione w słodkie`);

// Zapisz Dzień 44 w 4 ścieżkach
const paths44 = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-44.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-44/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-44.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-44/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-44.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-44/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-44.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-44/index.html')
];

for (const p of paths44) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html44, 'utf8');
}
console.log('✅ Zapisano 8 ścieżek HTML dla Dnia 44');

// ── 5. AKTUALIZACJA POWIĄZAŃ NAWIGACYJNYCH W DNIU 42 ──
const d42Paths = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-42.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-42/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-42.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-42/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-42.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-42/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-42.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-42/index.html')
];

for (const p of d42Paths) {
  if (fs.existsSync(p)) {
    let d42Content = fs.readFileSync(p, 'utf8');
    d42Content = d42Content.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 43 \(Jutro\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-43" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 43 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    fs.writeFileSync(p, d42Content, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania w Dniu 42');

// ── 6. DODANIE KAFELKÓW DNI 43 I 44 DO AKADEMIA.HTML ──
const card43Html = `          <!-- DZIEŃ 43 -->
          <a href="/akademia/kurscodzienny/dzien-43" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 43 • 12 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-brand-line">
              <img src="/images/academy/daily/kc_day_43_slup_obloku_i_ognia.jpg?v=20261112" alt="Dzień 43: Wyjście z Egiptu — Bóg prowadzi swój lud" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </div>
            <h3 class="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              Wyjście z Egiptu — Bóg prowadzi swój lud
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 font-serif">
              Wymarsz z Ramzes do Sukkot, uświęcenie pierworodnych oraz obłok za dnia i słup ognia nocą.
            </p>
            <div class="mt-auto pt-3 border-t border-brand-line flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 12:37–13:22</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

const card44Html = `          <!-- DZIEŃ 44 -->
          <a href="/akademia/kurscodzienny/dzien-44" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 44 • 13 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-brand-line">
              <img src="/images/academy/daily/kc_day_44_przejscie_przez_morze_czerwone.jpg?v=20261113" alt="Dzień 44: Przejście przez Morze Czerwone — PAN będzie za was walczył" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </div>
            <h3 class="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              Przejście przez Morze Czerwone — PAN będzie za was walczył
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 font-serif">
              Pułapka nad brzegiem morza, pościg rydwanów faraona, wschodni wiatr i przejście po suchym dnie.
            </p>
            <div class="mt-auto pt-3 border-t border-brand-line flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 14:1–31</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

const catalogFiles = [
  path.join(ROOT, 'akademia.html'),
  path.join(ROOT, 'akademia/kurscodzienny.html'),
  path.join(ROOT, 'kursy.html'),
  path.join(ROOT, 'kursy/kurscodzienny.html'),
  path.join(LUMINA, 'akademia.html'),
  path.join(LUMINA, 'akademia/kurscodzienny.html'),
  path.join(LUMINA, 'kursy.html'),
  path.join(LUMINA, 'kursy/kurscodzienny.html')
];

for (const cf of catalogFiles) {
  if (fs.existsSync(cf)) {
    let content = fs.readFileSync(cf, 'utf8');
    // Zmień kartę 42 z DZISIEJSZA LEKCJA na DOSTĘPNA TERAZ
    content = content.replace(
      /(<a href="\/akademia\/kurscodzienny\/dzien-42"[^>]*>[\s\S]*?)<span class="[^"]*animate-pulse[^"]*">DZISIEJSZA LEKCJA<\/span>/,
      `$1<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>`
    );
    // Usuń stare karty 43 lub 44 jeśli były
    if (!content.includes('href="/akademia/kurscodzienny/dzien-44"')) {
      if (content.includes('href="/akademia/kurscodzienny/dzien-43"')) {
        content = content.replace(/(<!-- DZIEŃ 43 -->[\s\S]*?<\/a>)/, `$1\n\n${card44Html}`);
      } else {
        content = content.replace(/(<!-- DZIEŃ 42 -->[\s\S]*?<\/a>)/, `$1\n\n${card43Html}\n\n${card44Html}`);
      }
      fs.writeFileSync(cf, content, 'utf8');
      console.log(`✅ Zaktualizowano siatkę lekcji w ${cf}`);
    }
  }
}

console.log('🎉 Kompletne generowanie Dnia 43 i Dnia 44 zakończone powodzeniem!');
