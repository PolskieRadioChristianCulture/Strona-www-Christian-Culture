import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const rozwazaniePath = path.join(ROOT, 'kolejka-publikacji/kurs-codzienny/2026-11-11/rozwazanie.json');
const raw = JSON.parse(fs.readFileSync(rozwazaniePath, 'utf8'));

const day42Entry = {
  id: "ref_day42_2026-11-11",
  day: 42,
  date: "2026-11-11",
  dateFormatted: "Środa, 11 listopada 2026 r.",
  title: "☀️ Z Biblią za Pan Brat — Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych",
  book: "KSIĘGA WYJŚCIA",
  reading: "Wj 11:1–12:36",
  memoryVerse: "„Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę uderzał ziemię Egiptu.” (Wj 12:13, UBG)",
  theme: "Jedenasty i dwunasty rozdział Księgi Wyjścia opisuje noc Paschy, sąd nad bogami Egiptu, ocalenie pierworodnych przez krew baranka na odrzwiach domów w Goszen oraz wyjście Izraela z niewoli egipskiej.",
  fullText: raw.fullText,
  contentApp: raw.fullText,
  contentWeb: raw.contentWeb,
  contentSms: "Dzień 42 (Wj 12:13): „Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia”. Jezus Chrystus jest Twoim Barankiem Paschalnym. Odpocznij w pokoju pod Jego krwią! polskieradio.cc",
  tvScript: raw.tvScript,
  ccnArticle: raw.ccnArticle,
  imageUrl: raw.imageUrl || "/images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg",
  authorName: "Cezary Rogowski",
  authorUid: "admin",
  authorSlug: "cezaryrgowski"
};

const MIRRORS = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/.pages-release/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/rozwazania_baza.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json'
];

for (const m of MIRRORS) {
  if (fs.existsSync(m)) {
    try {
      const data = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (Array.isArray(data)) {
        const filtered = data.filter(item => item.day !== 42 && item.date !== '2026-11-11');
        filtered.unshift(day42Entry);
        fs.writeFileSync(m, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano mirror: ${m} (${filtered.length} wpisów)`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji ${m}:`, e.message);
    }
  }
}

console.log('🎉 Wpis Dnia 42 został pomyślnie zsynchronizowany we wszystkich mirrorach bazy rozważań!');
