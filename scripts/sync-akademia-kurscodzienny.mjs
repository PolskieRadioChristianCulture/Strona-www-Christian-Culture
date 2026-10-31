#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const akademiaPath = path.join(ROOT, 'akademia.html');
const kurscodziennyPath = path.join(ROOT, 'akademia/kurscodzienny.html');
const akademiaDir = path.join(ROOT, 'akademia/kurscodzienny');
const kursyDir = path.join(ROOT, 'kursy/kurscodzienny');
const kursyHtml = path.join(ROOT, 'kursy.html');
const kursyIndex = path.join(ROOT, 'kursy/index.html');
const kursyKurscodziennyHtml = path.join(ROOT, 'kursy/kurscodzienny.html');
const kursyKurscodziennyIndex = path.join(ROOT, 'kursy/kurscodzienny/index.html');

// 1. Znajdź najnowszy opublikowany dzień
const dayFiles = fs.readdirSync(akademiaDir).filter(f => /^dzien-\d+\.html$/.test(f));
let maxDay = 0;
for (const f of dayFiles) {
  const match = f.match(/^dzien-(\d+)\.html$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > maxDay) maxDay = num;
  }
}

const currentDay = maxDay || 32;
const prevDay = currentDay - 1;
const currentDayPad = String(currentDay).padStart(2, '0');
const prevDayPad = String(prevDay).padStart(2, '0');

const monthNamesCaps = {
  10: 'PAŹDZIERNIKA',
  11: 'LISTOPADA',
  12: 'GRUDNIA'
};
const monthNamesTitle = {
  10: 'Października',
  11: 'Listopada',
  12: 'Grudnia'
};

const monthNum = currentDay <= 31 ? 10 : 11;
const dayOfMonth = currentDay <= 31 ? currentDay : currentDay - 31;
const monthCaps = monthNamesCaps[monthNum];
const monthTitle = monthNamesTitle[monthNum];
const year = '2026';

console.log(`🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego (Dzień ${currentDay} • ${dayOfMonth} ${monthTitle} ${year})...`);

// 2. Zaktualizuj akademia.html
let akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');

// A. Zaktualizuj DWA PRZYCISKI HERO w akademia.html
const heroActionsRegex = /<!-- Hero Actions -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
const updatedHeroActions = `<!-- Hero Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="/akademia/kurscodzienny/dzien-${currentDayPad}" class="cin-btn-primary min-h-[48px]">
            <span>CZYTAJ DZIEŃ ${currentDay} (${dayOfMonth} ${monthCaps})</span>
            <span>→</span>
          </a>
          <a href="/akademia/kurscodzienny/dzien-${prevDayPad}" class="cin-btn-secondary min-h-[48px]">
            <span>← DZIEŃ ${prevDay}</span>
          </a>
          <a href="#katalog-kurscodzienny" class="cin-btn-secondary min-h-[48px]">
            <span>PRZEGLĄDAJ DNI MIESIĄCA ↓</span>
          </a>
        </div>`;
akademiaHtml = akademiaHtml.replace(heroActionsRegex, updatedHeroActions);

// B. Zaktualizuj licznik dostępnych dni w akademia.html
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ Dostępne \([^)]+\)/g,
  `Dni 1–${currentDay} Dostępne (${dayOfMonth} ${monthTitle} ${year})`
);
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ z \d+ Dostępne[^\n<]*/g,
  `Dni 1–${currentDay} Dostępne (${dayOfMonth} ${monthTitle} ${year})`
);

// C. Zapewnij prawidłowe statusy kart w akademia.html
const HL = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const NORMAL = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const TODAY = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const AVAIL = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';

akademiaHtml = akademiaHtml.replace(/<a href="\/akademia\/kurscodzienny\/dzien-(\d+)" class="([^"]+)">([\s\S]*?)<\/a>/g, (m, day, cls, inner) => {
  if (cls.includes('cin-btn')) return m; // Nie modyfikuj przycisków akcji Hero
  const d = parseInt(day, 10);
  if (d === currentDay) {
    let newInner = inner.replace(AVAIL, TODAY);
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${HL}">${newInner}</a>`;
  } else if (d < currentDay) {
    let newInner = inner.replace(TODAY, AVAIL);
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${cls === HL ? NORMAL : cls}">${newInner}</a>`;
  }
  return m;
});

fs.writeFileSync(akademiaPath, akademiaHtml, 'utf8');
console.log('✅ Zaktualizowano akademia.html');

// Zsynchronizuj akademia/index.html, kursy.html oraz kursy/index.html
fs.writeFileSync(path.join(ROOT, 'akademia/index.html'), akademiaHtml, 'utf8');
fs.writeFileSync(kursyHtml, akademiaHtml, 'utf8');
fs.mkdirSync(path.join(ROOT, 'kursy'), { recursive: true });
fs.writeFileSync(kursyIndex, akademiaHtml, 'utf8');
console.log('✅ Zsynchronizowano akademia/index.html, kursy.html oraz kursy/index.html');

// 3. Pobierz karty z sekcji katalog-kurscodzienny w akademia.html i zaktualizuj akademia/kurscodzienny.html
const cardsMatch = akademiaHtml.match(/id="katalog-kurscodzienny"[\s\S]*?<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">([\s\S]*?)<\/div>\s*<\/section>/);

if (cardsMatch && cardsMatch[1]) {
  const allCardsHtml = cardsMatch[1].trim();

  let kurscodziennyHtml = fs.readFileSync(kurscodziennyPath, 'utf8');

  // Zaktualizuj DWA PRZYCISKI HERO w kurscodzienny.html
  const heroCtaRegex = /<!-- CTA Buttons -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
  const updatedHeroCta = `<!-- CTA Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/akademia/kurscodzienny/dzien-${currentDayPad}" class="cin-btn-primary min-h-[48px]">
          <span>CZYTAJ DZIEŃ ${currentDay} (${dayOfMonth} ${monthCaps})</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-${prevDayPad}" class="cin-btn-secondary min-h-[48px]">
          <span>← DZIEŃ ${prevDay}</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-01" class="cin-btn-secondary min-h-[48px]">
          <span>OD POCZĄTKU (DZIEŃ 1)</span>
        </a>
        <a href="#katalog-dni" class="cin-btn-secondary min-h-[48px]">
          <span>SPIS DNI ↓</span>
        </a>
      </div>`;
  kurscodziennyHtml = kurscodziennyHtml.replace(heroCtaRegex, updatedHeroCta);

  // Zaktualizuj licznik w kurscodzienny.html
  kurscodziennyHtml = kurscodziennyHtml.replace(
    /Dni 1–\d+ Dostępne \([^)]+\)/g,
    `Dni 1–${currentDay} Dostępne (${dayOfMonth} ${monthTitle} ${year})`
  );
  kurscodziennyHtml = kurscodziennyHtml.replace(
    /Dni 1–\d+ z \d+ Dostępne[^\n<]*/g,
    `Dni 1–${currentDay} Dostępne (${dayOfMonth} ${monthTitle} ${year})`
  );

  // Zaktualizuj siatkę kart w kurscodzienny.html
  const gridRegex = /<!-- SIATKA DNI -->\s*<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?<\/div>\s*<\/section>/;
  const updatedGrid = `<!-- SIATKA DNI -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${allCardsHtml}
      </div>
    </section>`;
  kurscodziennyHtml = kurscodziennyHtml.replace(gridRegex, updatedGrid);

  fs.writeFileSync(kurscodziennyPath, kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'akademia/kurscodzienny/index.html'), kurscodziennyHtml, 'utf8');
  console.log('✅ Zaktualizowano akademia/kurscodzienny.html oraz akademia/kurscodzienny/index.html');

  // Zsynchronizuj z kursy/kurscodzienny.html oraz kursy/kurscodzienny/index.html
  fs.mkdirSync(path.dirname(kursyKurscodziennyHtml), { recursive: true });
  fs.copyFileSync(kurscodziennyPath, kursyKurscodziennyHtml);
  fs.mkdirSync(path.dirname(kursyKurscodziennyIndex), { recursive: true });
  fs.copyFileSync(kurscodziennyPath, kursyKurscodziennyIndex);
  console.log('✅ Zsynchronizowano kursy/kurscodzienny.html oraz kursy/kurscodzienny/index.html');
}

// 4. Czyszczenie podwójnych linków nawigacyjnych w plikach lekcji
const lessonTargets = [
  'akademia/kurscodzienny/dzien-30.html',
  'akademia/kurscodzienny/dzien-30/index.html',
  'kursy/kurscodzienny/dzien-30.html',
  'kursy/kurscodzienny/dzien-30/index.html',
  'akademia/kurscodzienny/dzien-31.html',
  'akademia/kurscodzienny/dzien-31/index.html',
  'kursy/kurscodzienny/dzien-31.html',
  'kursy/kurscodzienny/dzien-31/index.html',
  'akademia/kurscodzienny/dzien-32.html',
  'akademia/kurscodzienny/dzien-32/index.html',
  'kursy/kurscodzienny/dzien-32.html',
  'kursy/kurscodzienny/dzien-32/index.html'
];

for (const target of lessonTargets) {
  const fp = path.join(ROOT, target);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(/\s*<a href="\/akademia\/kurscodzienny\/dzien-26" class="px-2\.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-\[32px\] flex items-center font-bold">Dzień 26 →<\/a>/g, '');
    fs.writeFileSync(fp, content, 'utf8');
  }
}
console.log('✅ Oczyszczono nawigację w plikach lekcji');

// 5. Zsynchronizuj wszystkie pliki lekcji dzienne do kursy/kurscodzienny/
if (fs.existsSync(akademiaDir)) {
  fs.mkdirSync(kursyDir, { recursive: true });
  const entries = fs.readdirSync(akademiaDir, { withFileTypes: true });
  let syncedFiles = 0;
  for (const entry of entries) {
    const src = path.join(akademiaDir, entry.name);
    const dst = path.join(kursyDir, entry.name);
    if (entry.isFile() && entry.name.startsWith('dzien-')) {
      fs.copyFileSync(src, dst);
      syncedFiles++;
    } else if (entry.isDirectory() && entry.name.startsWith('dzien-')) {
      fs.cpSync(src, dst, { recursive: true });
      syncedFiles++;
    }
  }
  console.log(`✅ Zsynchronizowano ${syncedFiles} plików/katalogów lekcji do kursy/kurscodzienny/`);
}

console.log('✨ Synchronizacja Akademii i Kursu Codziennego zakończona sukcesem!');
