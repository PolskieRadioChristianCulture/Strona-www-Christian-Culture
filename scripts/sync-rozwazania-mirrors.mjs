import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
let list = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));

// 1. Enrich Day 38
const d38 = list.find(x => x.day === 38 || x.date === '2026-11-07');
if (d38) {
  d38.id = 'ref_day38_2026-11-07';
  d38.day = 38;
  d38.date = '2026-11-07';
  d38.dayOfWeek = 'Sobota';
  d38.dateFormatted = 'Sobota, 7 listopada 2026 r.';
  d38.teaser = 'Dzień 38 — Laska, która połknęła węże, i woda zamieniona w krew: Starcie z czarownikami i sąd nad Nilem (Wj 7:1–25)';
  d38.fullText = d38.contentApp;
  d38.authorName = 'Cezary Rogowski';
  d38.authorUid = 'admin';
  d38.authorSlug = 'cezaryrgowski';
}

// 2. Enrich Day 37
const d37 = list.find(x => x.day === 37 || x.date === '2026-11-06');
if (d37) {
  d37.id = 'ref_day37_2026-11-06';
  d37.day = 37;
  d37.date = '2026-11-06';
  d37.dayOfWeek = 'Piątek';
  d37.dateFormatted = 'Piątek, 6 listopada 2026 r.';
  d37.teaser = 'Dzień 37 — Teraz zobaczysz, co uczynię faraonowi: Siedem obietnic odkupienia wyciągniętym ramieniem (Wj 6:1–30)';
  d37.fullText = d37.contentApp;
  d37.authorName = 'Cezary Rogowski';
  d37.authorUid = 'admin';
  d37.authorSlug = 'cezaryrgowski';
}

// 3. Enrich Day 36
const d36 = list.find(x => x.day === 36 || x.date === '2026-11-05');
if (d36) {
  d36.id = 'ref_day36_2026-11-05';
  d36.day = 36;
  d36.date = '2026-11-05';
  d36.dayOfWeek = 'Czwartek';
  d36.dateFormatted = 'Czwartek, 5 listopada 2026 r.';
  d36.teaser = 'Dzień 36 — Pierwsza konfrontacja z faraonem: Ciężary niewoli i próba wiary (Wj 5:1–23)';
  d36.fullText = d36.contentApp;
  d36.authorName = 'Cezary Rogowski';
  d36.authorUid = 'admin';
  d36.authorSlug = 'cezaryrgowski';
}

// Ensure Day 38 is first
list = list.filter(x => x.id !== 'ref_day38_2026-11-07');
list.unshift(d38);

const mirrors = [
  path.join(ROOT, 'rozwazania_baza.json'),
  path.join(ROOT, '.pages-release', 'rozwazania_baza.json'),
  path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
  path.join(LUMINA_ROOT, 'rozwazania_baza.json')
];

let updated = 0;
for (const m of mirrors) {
  try {
    fs.mkdirSync(path.dirname(m), { recursive: true });
    fs.writeFileSync(m, JSON.stringify(list, null, 2), 'utf8');
    console.log(`✅ Zsynchronizowano mirror: ${m}`);
    updated++;
  } catch(e) {
    console.error(`❌ Błąd zapisu do mirrora ${m}:`, e.message);
  }
}

console.log(`\n🎉 Pomyślnie zsynchronizowano ${updated}/${mirrors.length} mirrorów rozwazania_baza.json.`);
