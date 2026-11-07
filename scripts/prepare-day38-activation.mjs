import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';

console.log('🔄 Przygotowanie aktywacji Dnia 38 w Akademii i bazach danych...');

// 1. Aktualizacja akademia.html - karty dni 35, 36, 37, 38
const akademiaPath = path.join(ROOT, 'akademia.html');
let akademiaContent = fs.readFileSync(akademiaPath, 'utf8');

// A. Poprawa href w karcie Dzień 35
akademiaContent = akademiaContent.replace(
  /<!-- KARTA DZIEŃ 35 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-\d+"/,
  `<!-- KARTA DZIEŃ 35 -->\n          <a href="/akademia/kurscodzienny/dzien-35"`
);

// B. Sprawdzenie czy karty 36, 37, 38 już istnieją w siatce
if (!akademiaContent.includes('<!-- KARTA DZIEŃ 36 -->')) {
  const cardsToAdd = `
          <!-- KARTA DZIEŃ 36 -->
          <a href="/akademia/kurscodzienny/dzien-36" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 36 • 5 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_36_mojzesz_faraon_cegly.jpg?v=20261105" alt="Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY (Wj 5:1–23)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Pierwsza konfrontacja Mojżesza i Aarona z faraonem, nakaz wyrobu cegieł bez słomy, ból ucisku i wołanie w ciemności próby — Wj 5:1–23.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 5:1–23</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 37 -->
          <a href="/akademia/kurscodzienny/dzien-37" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 37 • 6 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_37_obietnice_odkupienia_ramie_pana.jpg?v=20261106" alt="Dzień 37: TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA (Wj 6:1–30)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Objawienie Imienia JAHWE, wieczne przymierze z ojcami i 7 obietnic odkupienia wyciągniętym ramieniem w dolinie pozornej klęski — Wj 6:1–30.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 6:1–30</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 38 -->
          <a href="/akademia/kurscodzienny/dzien-38" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 38 • 7 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_38_laska_woda_w_krew_nil.jpg?v=20261107" alt="Dzień 38: LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW (Wj 7:1–25)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil — Wj 7:1–25.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 7:1–25</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

  // Wstawiamy karty za kartą Dnia 35
  const d35EndMarker = '<!-- KARTA DZIEŃ 35 -->';
  const pos = akademiaContent.indexOf(d35EndMarker);
  if (pos !== -1) {
    const closingTag = '</a>';
    const closePos = akademiaContent.indexOf(closingTag, pos);
    if (closePos !== -1) {
      const insertAt = closePos + closingTag.length;
      akademiaContent = akademiaContent.slice(0, insertAt) + '\n' + cardsToAdd + akademiaContent.slice(insertAt);
      console.log('✅ Dodano karty dla Dni 36, 37 i 38 do akademia.html');
    }
  }
}

fs.writeFileSync(akademiaPath, akademiaContent, 'utf8');
console.log('✅ Zapisano akademia.html');

// 2. Aktualizacja rozwazania_baza.json o Dzień 38
const pakietPath = path.join(ROOT, 'scripts/content/pakiet-day38-5wersji.md');
if (fs.existsSync(pakietPath)) {
  const pakiet = fs.readFileSync(pakietPath, 'utf8');
  const sep = '====================================================================';
  const parts = pakiet.split(sep);
  let contentApp = '', contentWeb = '', contentSms = '';

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].includes('WERSJA 1:')) contentApp = (parts[i + 1] || '').trim();
    else if (parts[i].includes('WERSJA 2:')) contentWeb = (parts[i + 1] || '').trim();
    else if (parts[i].includes('WERSJA 3:')) contentSms = (parts[i + 1] || '').trim();
  }

  const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
  let bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));

  const day38Item = {
    day: 38,
    date: '2026-11-07',
    dateFormatted: 'Sobota, 7 listopada 2026 r.',
    title: '☀️ Z Biblią za Pan Brat — Dzień 38: Laska, która połknęła węże, i woda zamieniona w krew',
    book: 'KSIĘGA WYJŚCIA',
    reading: 'Wj 7:1–25',
    memoryVerse: '„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.” (Wj 7:17, UBG)',
    theme: 'Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich oraz zatwardziałym sercem faraona. Przemiana laski w węża połykającego laski czarowników oraz uderzenie w Nil dowodzą, że pozorna siła demonicznych iluzji jest bezsilna wobec suwerennego Stwórcy, a sąd nad rzeką Egiptu zapowiada ostateczne zwycięstwo łaski i odkupienia w Chrystusie.',
    contentApp,
    contentWeb,
    contentSms,
    imageUrl: '/images/academy/daily/kc_day_38_laska_woda_w_krew_nil.jpg'
  };

  bazaList = bazaList.filter(item => !(item.day === 38 && item.date === '2026-11-07'));
  bazaList.unshift(day38Item);
  fs.writeFileSync(jsonBazaPath, JSON.stringify(bazaList, null, 2), 'utf8');
  console.log('✅ Zaktualizowano rozwazania_baza.json o Dzień 38');

  // Synchronizacja mirrorów rozwazania_baza.json
  const mirrors = [
    path.join(ROOT, '.pages-release', 'rozwazania_baza.json'),
    path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
    'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
    'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
    'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
    path.join(LUMINA_ROOT, 'rozwazania_baza.json'),
  ];
  for (const m of mirrors) {
    try {
      fs.mkdirSync(path.dirname(m), { recursive: true });
      fs.writeFileSync(m, JSON.stringify(bazaList, null, 2), 'utf8');
    } catch (e) {
      // mirror opcjonalny
    }
  }
}

// 3. Aktualizacja Mapy Ekosystemu (data/ecosystem-map.json)
const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-07',
    topic: 'Akademia Biblijna & Kurs Codzienny: Nocna publikacja i aktywacja Dnia 38 (Wj 7:1–25) — Laska, która połknęła węże, i woda zamieniona w krew (Hero CTA, spis 38 dni, catalog.json)',
    agent: 'A'
  };

  // Usuń ewentualny duplikat z dzisiejszą datą o tym samym temacie
  mapData.updatesLog = mapData.updatesLog.filter(e => !(e.date === '2026-11-07' && e.topic.includes('Dnia 38')));
  mapData.updatesLog.unshift(newEntry);

  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log('✅ Zaktualizowano data/ecosystem-map.json');

  // Mirror na Pulpit/@ICC/LUMINA
  try {
    const luminaMapPath = path.join(LUMINA_ROOT, 'data/ecosystem-map.json');
    fs.mkdirSync(path.dirname(luminaMapPath), { recursive: true });
    fs.writeFileSync(luminaMapPath, JSON.stringify(mapData, null, 2), 'utf8');
  } catch (e) {}
}

console.log('✨ Przygotowanie aktywacji zakończone.');
