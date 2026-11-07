import fs from 'node:fs';
import path from 'node:path';

const pakietPath = path.join(process.cwd(), 'scripts/content/pakiet-day39-5wersji.md');
const pakietContent = fs.readFileSync(pakietPath, 'utf8');

// Ekstrakcja 3 wersji z pakiet-day39-5wersji.md
const appMatch = pakietContent.match(/====================================================================\r?\nWERSJA 1: ROZWAŻANIE PORANNE[^\n]*\r?\n====================================================================\r?\n\r?\n([\s\S]*?)(?=\r?\n====================================================================\r?\nWERSJA 2:)/);
const webMatch = pakietContent.match(/====================================================================\r?\nWERSJA 2: WERSJA WWW[^\n]*\r?\n====================================================================\r?\n\r?\n([\s\S]*?)(?=\r?\n====================================================================\r?\nWERSJA 3:)/);
const smsMatch = pakietContent.match(/====================================================================\r?\nWERSJA 3: WERSJA WIECZORNA[^\n]*\r?\n====================================================================\r?\n\r?\n([\s\S]*?)(?=\r?\n====================================================================\r?\nWERSJA 4:)/);

const contentApp = appMatch ? appMatch[1].trim() : '';
const contentWeb = webMatch ? webMatch[1].trim() : '';
const contentSms = smsMatch ? smsMatch[1].trim() : '';

const day39Entry = {
  day: 39,
  date: "2026-11-08",
  dateFormatted: "Niedziela, 8 listopada 2026 r.",
  title: "☀️ Z Biblią za Pan Brat — Dzień 39: Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen",
  book: "KSIĘGA WYJŚCIA",
  reading: "Wj 8:1–32",
  memoryVerse: "„Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.” (Wj 8:19, UBG)",
  theme: "Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.",
  contentApp,
  contentWeb,
  contentSms,
  imageUrl: "/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg"
};

const MIRRORS = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/rozwazania_baza.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/data/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/cclite/rozwazania_baza.json'
];

for (const m of MIRRORS) {
  if (fs.existsSync(m)) {
    try {
      const data = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (Array.isArray(data)) {
        // Usuń jeśli już istnieje Day 39
        const filtered = data.filter(item => item.day !== 39 && item.date !== '2026-11-08');
        filtered.unshift(day39Entry);
        fs.writeFileSync(m, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano mirror: ${m} (${filtered.length} wpisów)`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji ${m}:`, e.message);
    }
  }
}

console.log('🎉 Wpis Dnia 39 został zsynchronizowany we wszystkich mirrorach bazy rozważań!');
