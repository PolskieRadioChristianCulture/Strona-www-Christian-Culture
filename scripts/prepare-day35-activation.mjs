import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// 1. Zaktualizuj akademia.html dodając brakujące karty Dnia 34 i Dnia 35 do siatki
const akademiaPath = path.join(ROOT, 'akademia.html');
let akademiaContent = fs.readFileSync(akademiaPath, 'utf8');

const day33CardMarker = '<!-- KARTA DZIEŃ 33 -->';
if (akademiaContent.includes(day33CardMarker) && !akademiaContent.includes('<!-- KARTA DZIEŃ 35 -->')) {
  const card34Html = `
          <!-- KARTA DZIEŃ 34 -->
          <a href="/akademia/kurscodzienny/dzien-34" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 34 • 3 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg?v=20261103" alt="Dzień 34: OGIEŃ, KTÓRY NIE PŁONIE: PŁONĄCY KRZAK, ŚWIĘTE IMIĘ JAHWE I WEZWANIE DO MISJI — Wj 3:1–22" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              OGIEŃ, KTÓRY NIE PŁONIE: PŁONĄCY KRZAK, ŚWIĘTE IMIĘ JAHWE I WEZWANIE DO MISJI
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Góra Horeb, płonący i niespalający się krzak, objawienie Imienia JAHWE („JESTEM, KTÓRY JESTEM”), obietnica wybawienia z Egiptu i posłanie Mojżesza — Wj 3:1–22.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 3:1–22</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 35 -->
          <a href="/akademia/kurscodzienny/dzien-35" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 35 • 4 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg?v=20261104" alt="Dzień 35: ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI (Wj 4:1–31)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Wątpliwości Mojżesza, trzy cudowne znaki, Aaron rzecznikiem, przymierze krwi i powrót do uciemiężonego ludu — Wj 4:1–31.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 4:1–31</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

  // Znajdź koniec karty Dnia 33 i wstaw karty 34 oraz 35
  const day33Index = akademiaContent.indexOf(day33CardMarker);
  const closingTagIndex = akademiaContent.indexOf('</a>', day33Index);
  if (closingTagIndex !== -1) {
    const insertPos = closingTagIndex + 4;
    akademiaContent = akademiaContent.slice(0, insertPos) + '\n' + card34Html + akademiaContent.slice(insertPos);
    fs.writeFileSync(akademiaPath, akademiaContent, 'utf8');
    console.log('✅ Dodano karty Dnia 34 i Dnia 35 do akademia.html');
  }
} else {
  console.log('ℹ️ Karty Dnia 34 i 35 już obecne lub znacznik nieznaleziony w akademia.html');
}

// 2. Dodaj Dzień 35 do rozwazania_baza.json
const rozwazaniaPath = path.join(ROOT, 'rozwazania_baza.json');
const rozwazaniaData = JSON.parse(fs.readFileSync(rozwazaniaPath, 'utf8'));

if (!rozwazaniaData.some(item => item.day === 35)) {
  const pakietPath = path.join(ROOT, 'scripts/content/pakiet-day35-5wersji.md');
  const pakietText = fs.readFileSync(pakietPath, 'utf8');

  // Ekstrakcja wersji z pakiet-day35-5wersji.md
  const getSection = (startMarker, endMarker) => {
    const s = pakietText.indexOf(startMarker);
    if (s === -1) return '';
    const startPos = s + startMarker.length;
    const e = endMarker ? pakietText.indexOf(endMarker, startPos) : pakietText.length;
    return pakietText.slice(startPos, e !== -1 ? e : undefined).trim();
  };

  const v1 = getSection('WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)', '====================================================================\nWERSJA 2');
  const v2 = getSection('WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)', '====================================================================\nWERSJA 3');
  const v3 = getSection('WERSJA 3: WERSJA WIECZORNA (SMS)', '====================================================================\nWERSJA 4');

  const cleanV1 = v1.replace(/^=+\s*/, '').trim();
  const cleanV2 = v2.replace(/^=+\s*/, '').trim();
  const cleanV3 = v3.replace(/^=+\s*/, '').trim();

  const day35Entry = {
    day: 35,
    date: '2026-11-04',
    dateFormatted: 'Środa, 4 listopada 2026 r.',
    title: '☀️ Z Biblią za Pan Brat — Dzień 35: Znaki wiary, powołanie i powrót do Egiptu — Boża moc w ludzkiej słabości',
    book: 'KSIĘGA WYJŚCIA',
    reading: 'Wj 4:1–31',
    memoryVerse: '„I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.” (Wj 4:11–12, UBG)',
    theme: 'Czwarty rozdział Księgi Wyjścia ukazuje zmaganie człowieka z powołaniem oraz suwerenność Boga, który odpowiada na ludzkie lęki znakami łaski, posyła pomocnika i wzywa do bezkompromisowej wierności przymierzu. Bóg nie szuka ludzkiej elokwencji, lecz posłusznego serca.',
    contentApp: cleanV1,
    contentWeb: cleanV2,
    contentSms: cleanV3,
    imageUrl: '/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg'
  };

  rozwazaniaData.unshift(day35Entry);
  fs.writeFileSync(rozwazaniaPath, JSON.stringify(rozwazaniaData, null, 2), 'utf8');
  console.log('✅ Dodano Dzień 35 do rozwazania_baza.json');
} else {
  console.log('ℹ️ Dzień 35 jest już zarejestrowany w rozwazania_baza.json');
}

// 3. Dodaj wpis do data/ecosystem-map.json
const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const mapTopic = 'Akademia Biblijna (Kurs Codzienny): Nocna publikacja i aktywacja Dnia 35 (Wj 4:1–31 UBG — Znaki wiary, powołanie i powrót do Egiptu) w pełnym standardzie 21/21';
  if (!mapData.updatesLog.some(u => u.topic === mapTopic && u.date === '2026-11-04')) {
    mapData.updatesLog.unshift({
      topic: mapTopic,
      date: '2026-11-04',
      agent: 'A'
    });
    fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
    console.log('✅ Zaktualizowano data/ecosystem-map.json');
  } else {
    console.log('ℹ️ Wpis w data/ecosystem-map.json już istnieje');
  }
}
