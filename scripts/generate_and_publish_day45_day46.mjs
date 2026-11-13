// Master publisher for Day 45 and Day 46 (Weekend: 14-15 listopada 2026 r.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { day45Data, day46Data } from './day_data_45_46.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEKTOR1 = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🚀 Rozpoczynam generowanie i publikację Dnia 45 (Sobota) oraz Dnia 46 (Niedziela)...');

// ── 1. CZYTANIE BIBLII UBG ──
const exo15Data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/ubg-2025/EXO-015.json'), 'utf8'));
const exo16Data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bible/ubg-2025/EXO-016.json'), 'utf8'));

// Dzień 45: Wj 15:1–27
const readingD45Html = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 15:1–21 — Pieśń Mojżesza i Miriam przy Morzu Czerwonym</h3></div>',
  ...exo15Data.verses.filter(v => v.number <= 21).map(v => `<p><span class="verse-num">15:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 15:22–27 — Gorzkie wody w Mara i Boże przymierze uzdrowienia</h3></div>',
  ...exo15Data.verses.filter(v => v.number >= 22).map(v => `<p><span class="verse-num">15:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

// Dzień 46: Wj 16:1–36
const readingD46Html = [
  '<div class="mb-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 16:1–12 — Pustynia Sin, szemranie o chleb i obietnica PANA</h3></div>',
  ...exo16Data.verses.filter(v => v.number <= 12).map(v => `<p><span class="verse-num">16:${v.number}</span> ${v.text}</p>`),
  '<div class="my-6 pt-4 pb-2 border-b border-brand-border/40"><h3 class="font-bold text-amber-300 text-sm">KSIĘGA WYJŚCIA 16:13–36 — Przepiórki, manna z nieba, miara omer i świętość Szabatu</h3></div>',
  ...exo16Data.verses.filter(v => v.number >= 13).map(v => `<p><span class="verse-num">16:${v.number}</span> ${v.text}</p>`)
].join('\n        ');

console.log('✅ Wczytano wersety UBG dla Dnia 45 i Dnia 46');

// ── 2. PAKIETY ROZWAŻAŃ I KOLEJKA PUBLIKACJI ──
const days = [day45Data, day46Data];

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
        for (const d of [day45Data, day46Data]) {
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
        console.log(`✅ Zaktualizowano mirror bazy rozważań: ${m} (${data.length} wpisów)`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji ${m}:`, e.message);
    }
  }
}

// ── 4. BUDOWA STRON LEKCJI HTML (Dzień 45 i Dzień 46) ──
const d44HtmlPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-44.html');
const templateHtml = fs.readFileSync(d44HtmlPath, 'utf8');

// Budujemy Dzień 45 na podstawie Dnia 44
let html45 = templateHtml;
html45 = html45.replace(/<title>Dzień 44:[^<]+<\/title>/, `<title>Dzień 45: ${day45Data.title} (${day45Data.reading}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html45 = html45.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 45 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${day45Data.book} ${day45Data.reading}: ${day45Data.subtitle}">`);
html45 = html45.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-44"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-45"`);
html45 = html45.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 45: ${day45Data.title} (${day45Data.reading}) | Z Biblią za Pan Brat"`);
html45 = html45.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${day45Data.subtitle}"`);
html45 = html45.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-44"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-45"`);
html45 = html45.replace(/kc_day_44_przejscie_przez_morze_czerwone\.jpg\?v=\d+/g, `kc_day_45_piesn_zwyciestwa_miriam_mara.jpg?v=20261114`);
html45 = html45.replace(/kc_day_44_przejscie_przez_morze_czerwone\.jpg/g, `kc_day_45_piesn_zwyciestwa_miriam_mara.jpg`);

html45 = html45.replace(/<span class="text-amber-400 font-semibold">Dzień 44<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 45</span>`);

const nav45 = `<a href="/akademia/kurscodzienny/dzien-44" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 44</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-46" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 46 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`;
html45 = html45.replace(/<a href="\/akademia\/kurscodzienny\/dzien-43"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/, nav45);

html45 = html45.replace(/<span>Dzień 44 z 2009<\/span>/, `<span>Dzień 45 z 2009</span>`);
html45 = html45.replace(/13 LISTOPADA 2026 • PIĄTEK/, `14 LISTOPADA 2026 • SOBOTA`);
html45 = html45.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${day45Data.title}\n      </h1>`);
html45 = html45.replace(/<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/, `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${day45Data.subtitle}\n      </p>`);
html45 = html45.replace(/alt="Dzień 44:[^"]+"/, `alt="Dzień 45: ${day45Data.title}"`);
html45 = html45.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>Ilustracja biblijna: ${day45Data.title} (${day45Data.reading})</span>`);
html45 = html45.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 14:1–31<\/span>/, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${day45Data.reading}</span>`);
html45 = html45.replace(/Księga Wyjścia 14:1–31 • Przejście przez Morze Czerwone[^<]*/, `Księga Wyjścia 15:1–27 • Pieśń Mojżesza i Miriam przy Morzu Czerwonym oraz gorzkie wody Mara przemienione w słodkie`);

html45 = html45.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/, `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">\n            ${day45Data.memoryVerse}\n          </blockquote>`);
html45 = html45.replace(/— Księga Wyjścia 14:14 \(UBG\)/, `— Księga Wyjścia 15:2 (UBG)`);
html45 = html45.replace(/navigator\.clipboard\.writeText\('[^']+'\)/, `navigator.clipboard.writeText('${day45Data.memoryVerse.replace(/'/g, "\\'")}')`);
html45 = html45.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/, `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${day45Data.theme}\n      </div>\n    </div>`);

html45 = html45.replace(/Dziś jest <strong class="text-white">Dzień 44<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 14:1–31<\/strong>\./, `Dziś jest <strong class="text-white">Dzień 45</strong>: Księga Wyjścia, <strong class="text-brand-gold">${day45Data.reading}</strong>.`);
html45 = html45.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 14:1–31<\/p>/, `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • ${day45Data.reading}</p>`);
html45 = html45.replace(/href="\/mojabiblia\?book=EXO&chapter=14"/g, `href="/mojabiblia?book=EXO&chapter=15"`);

html45 = html45.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/, `<div class="kc-prose-reading">\n        ${readingD45Html}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`);

// Zaktualizuj sekcję jutro w Dniu 45 wskazując na Dzień 46
html45 = html45.replace(/JUTRO — 14 LISTOPADA 2026/, `JUTRO — 15 LISTOPADA 2026`);
html45 = html45.replace(/Dalszy ciąg Księgi Wyjścia: Wj 15:1–27[^<]*/, `Dalszy ciąg Księgi Wyjścia: Wj 16:1–36 — Manna z nieba, przepiórki i świętość Szabatu na pustyni Sin`);
html45 = html45.replace(/href="\/akademia\/kurscodzienny\/dzien-45"/g, `href="/akademia/kurscodzienny/dzien-46"`);

// Zapisz Dzień 45 w 8 ścieżkach
const paths45 = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-45.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-45/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-45.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-45/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-45.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-45/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-45.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-45/index.html')
];

for (const p of paths45) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html45, 'utf8');
}
console.log('✅ Zapisano 8 ścieżek HTML dla Dnia 45');

// Budujemy Dzień 46 na podstawie Dnia 45
let html46 = html45;
html46 = html46.replace(/<title>Dzień 45:[^<]+<\/title>/, `<title>Dzień 46: ${day46Data.title} (${day46Data.reading}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
html46 = html46.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="Dzień 46 Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${day46Data.book} ${day46Data.reading}: ${day46Data.subtitle}">`);
html46 = html46.replace(/<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-45"/, `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-46"`);
html46 = html46.replace(/property="og:title" content="[^"]+"/, `property="og:title" content="Dzień 46: ${day46Data.title} (${day46Data.reading}) | Z Biblią za Pan Brat"`);
html46 = html46.replace(/property="og:description" content="[^"]+"/, `property="og:description" content="${day46Data.subtitle}"`);
html46 = html46.replace(/property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-45"/, `property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-46"`);
html46 = html46.replace(/kc_day_45_piesn_zwyciestwa_miriam_mara\.jpg\?v=\d+/g, `kc_day_46_manna_z_nieba_chleb_zycia.jpg?v=20261115`);
html46 = html46.replace(/kc_day_45_piesn_zwyciestwa_miriam_mara\.jpg/g, `kc_day_46_manna_z_nieba_chleb_zycia.jpg`);

html46 = html46.replace(/<span class="text-amber-400 font-semibold">Dzień 45<\/span>/, `<span class="text-amber-400 font-semibold">Dzień 46</span>`);

const nav46 = `<a href="/akademia/kurscodzienny/dzien-45" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 45</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 47 (Poniedziałek) →</span>
        </span>`;
html46 = html46.replace(/<a href="\/akademia\/kurscodzienny\/dzien-44"[\s\S]*?<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-46"[\s\S]*?<\/a>/, nav46);

html46 = html46.replace(/<span>Dzień 45 z 2009<\/span>/, `<span>Dzień 46 z 2009</span>`);
html46 = html46.replace(/14 LISTOPADA 2026 • SOBOTA/, `15 LISTOPADA 2026 • NIEDZIELA`);
html46 = html46.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${day46Data.title}\n      </h1>`);
html46 = html46.replace(/<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/, `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${day46Data.subtitle}\n      </p>`);
html46 = html46.replace(/alt="Dzień 45:[^"]+"/, `alt="Dzień 46: ${day46Data.title}"`);
html46 = html46.replace(/<span>Ilustracja biblijna:[^<]*<\/span>/, `<span>Ilustracja biblijna: ${day46Data.title} (${day46Data.reading})</span>`);
html46 = html46.replace(/<span class="text-brand-gold font-mono font-semibold">Czytanie: Wj 15:1–27<\/span>/, `<span class="text-brand-gold font-mono font-semibold">Czytanie: ${day46Data.reading}</span>`);
html46 = html46.replace(/Księga Wyjścia 15:1–27 • Pieśń Mojżesza i Miriam[^<]*/, `Księga Wyjścia 16:1–36 • Manna z nieba, chleb powszedni, przepiórki i świętość Szabatu na pustyni Sin`);

html46 = html46.replace(/<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">[\s\S]*?<\/blockquote>/, `<blockquote class="font-serif text-base sm:text-lg md:text-xl text-zinc-100 font-medium leading-relaxed mb-4">\n            ${day46Data.memoryVerse}\n          </blockquote>`);
html46 = html46.replace(/— Księga Wyjścia 15:2 \(UBG\)/, `— Księga Wyjścia 16:4 (UBG)`);
html46 = html46.replace(/navigator\.clipboard\.writeText\('[^']+'\)/, `navigator.clipboard.writeText('${day46Data.memoryVerse.replace(/'/g, "\\'")}')`);
html46 = html46.replace(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>\s*<\/div>/, `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n${day46Data.theme}\n      </div>\n    </div>`);

html46 = html46.replace(/Dziś jest <strong class="text-white">Dzień 45<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 15:1–27<\/strong>\./, `Dziś jest <strong class="text-white">Dzień 46</strong>: Księga Wyjścia, <strong class="text-brand-gold">${day46Data.reading}</strong>.`);
html46 = html46.replace(/<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 15:1–27<\/p>/, `<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • ${day46Data.reading}</p>`);
html46 = html46.replace(/href="\/mojabiblia\?book=EXO&chapter=15"/g, `href="/mojabiblia?book=EXO&chapter=16"`);

html46 = html46.replace(/<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/, `<div class="kc-prose-reading">\n        ${readingD46Html}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`);

// Jutro w Dniu 46 -> Dzień 47
html46 = html46.replace(/JUTRO — 15 LISTOPADA 2026/, `JUTRO — 16 LISTOPADA 2026`);
html46 = html46.replace(/Dalszy ciąg Księgi Wyjścia: Wj 16:1–36[^<]*/, `Dalszy ciąg Księgi Wyjścia: Wj 17:1–16 — Woda ze skały w Horebie i bitwa z Amalekitami pod Refidim`);
html46 = html46.replace(/href="\/akademia\/kurscodzienny\/dzien-46"/g, `href="/akademia/kurscodzienny/dzien-47"`);

// Zapisz Dzień 46 w 8 ścieżkach
const paths46 = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-46.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-46/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-46.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-46/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-46.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-46/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-46.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-46/index.html')
];

for (const p of paths46) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html46, 'utf8');
}
console.log('✅ Zapisano 8 ścieżek HTML dla Dnia 46');

// ── 5. AKTUALIZACJA POWIĄZAŃ NAWIGACYJNYCH W DNIU 44 ──
const d44Paths = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-44.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-44/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-44.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-44/index.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-44.html'),
  path.join(LUMINA, 'akademia/kurscodzienny/dzien-44/index.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-44.html'),
  path.join(LUMINA, 'kursy/kurscodzienny/dzien-44/index.html')
];

for (const p of d44Paths) {
  if (fs.existsSync(p)) {
    let d44Content = fs.readFileSync(p, 'utf8');
    d44Content = d44Content.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 45 \(Jutro\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-45" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 45 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    fs.writeFileSync(p, d44Content, 'utf8');
  }
}
console.log('✅ Zaktualizowano powiązania nawigacyjne w Dniu 44');

// ── 6. DODANIE KAFELKÓW DNI 45 I 46 DO KATALOGÓW I STRON GŁÓWNYCH ──
const card45Html = `          <!-- DZIEŃ 45 -->
          <a href="/akademia/kurscodzienny/dzien-45" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 45 • 14 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-brand-line">
              <img src="/images/academy/daily/kc_day_45_piesn_zwyciestwa_miriam_mara.jpg?v=20261114" alt="Dzień 45: Pieśń Zwycięstwa i Gorzkie Wody Mara — PAN Twoim Lekarzem" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </div>
            <h3 class="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              Pieśń Zwycięstwa i Gorzkie Wody Mara — PAN Twoim Lekarzem
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 font-serif">
              Triumf nad wojskiem faraona, pieśń Miriam z bębenkiem oraz cud przemiany gorzkich wód Mara w słodkie.
            </p>
            <div class="mt-auto pt-3 border-t border-brand-line flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 15:1–27</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

const card46Html = `          <!-- DZIEŃ 46 -->
          <a href="/akademia/kurscodzienny/dzien-46" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 46 • 15 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-brand-line">
              <img src="/images/academy/daily/kc_day_46_manna_z_nieba_chleb_zycia.jpg?v=20261115" alt="Dzień 46: Manna z Nieba i Świętość Szabatu — Boże Zaopatrzenie na Pustyni" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            </div>
            <h3 class="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              Manna z Nieba i Świętość Szabatu — Boże Zaopatrzenie na Pustyni
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 font-serif">
              Głód na pustyni Sin, deszcz chleba z nieba, przepiórki o zmierzchu oraz dar świętego odpoczynku Szabatu.
            </p>
            <div class="mt-auto pt-3 border-t border-brand-line flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 16:1–36</span>
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
    if (!content.includes('href="/akademia/kurscodzienny/dzien-45"')) {
      if (content.includes('href="/akademia/kurscodzienny/dzien-44"')) {
        content = content.replace(/(<!-- DZIEŃ 44 -->[\s\S]*?<\/a>)/, `$1\n\n${card45Html}\n\n${card46Html}`);
        fs.writeFileSync(cf, content, 'utf8');
        console.log(`✅ Zaktualizowano siatkę lekcji w ${cf}`);
      }
    }
  }
}

// ── 7. INDEKS WYSZUKIWARKI (@w) ──
const searchFiles = [
  path.join(ROOT, 'data/cc-search-index.json'),
  path.join(ROOT, 'szukaj/catalog.json'),
  path.join(LUMINA, 'data/cc-search-index.json'),
  path.join(LUMINA, 'szukaj/catalog.json')
];

const newLessons = [
  {
    title: `Z Biblią za Pan Brat — Dzień 45: ${day45Data.title} (${day45Data.reading})`,
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-45",
    description: `Kurs Codzienny Pisma Świętego — Dzień 45 (14 listopada 2026). ${day45Data.book} ${day45Data.reading}: ${day45Data.subtitle}. Jahwe Raffa — PAN Twój Lekarz.`,
    tags: [
      "lekcja 45", "dzień 45", "dzien 45", "pieśń mojżesza", "miriam", "morze czerwone",
      "mara", "gorzkie wody", "jahwe raffa", "pan twoim lekarzem", "wj 15", "wyjścia 15",
      "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "14 listopada 2026", "sobota"
    ],
    featured: false
  },
  {
    title: `Z Biblią za Pan Brat — Dzień 46: ${day46Data.title} (${day46Data.reading})`,
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-46",
    description: `Kurs Codzienny Pisma Świętego — Dzień 46 (15 listopada 2026). ${day46Data.book} ${day46Data.reading}: ${day46Data.subtitle}. Manna z nieba i chleb życia w Chrystusie.`,
    tags: [
      "lekcja 46", "dzień 46", "dzien 46", "manna z nieba", "chleb z nieba", "pustynia sin",
      "przepiórki", "szabat", "święty szabat", "omer", "chleb życia", "wj 16", "wyjścia 16",
      "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "15 listopada 2026", "niedziela"
    ],
    featured: false
  }
];

for (const sf of searchFiles) {
  if (fs.existsSync(sf)) {
    try {
      let sData = JSON.parse(fs.readFileSync(sf, 'utf8'));
      if (Array.isArray(sData)) {
        sData = sData.filter(item => !item.url?.includes('dzien-45') && !item.url?.includes('dzien-46'));
        sData.unshift(...newLessons);
        fs.writeFileSync(sf, JSON.stringify(sData, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano indeks wyszukiwarki: ${sf}`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd indeksu ${sf}:`, e.message);
    }
  }
}

console.log('🎉 Kompletne generowanie Dnia 45 i Dnia 46 na weekend zakończone pełnym sukcesem!');
