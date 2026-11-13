import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const pkgPath = path.join(ROOT, 'kolejka-publikacji/kurs-codzienny/2026-11-11/rozwazanie.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const day42Entry = {
  id: 'ref_day42_2026-11-11',
  day: 42,
  date: '2026-11-11',
  dateFormatted: 'Środa, 11 listopada 2026 r.',
  title: '☀️ Z Biblią za Pan Brat — Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Wj 11:1–12:36)',
  book: 'KSIĘGA WYJŚCIA',
  reading: 'Wj 11:1–12:36',
  memoryVerse: '„A krew będzie dla was znakiem na domach, w których będziecie. Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę uderzał ziemię Egiptu.” (Wj 12:13, UBG)',
  theme: 'Księga Wyjścia 11:1–12:36: Ustanowienie Baranka Paschalnego, krew na odrzwiach w Goszen, sąd o północy nad bogami Egiptu i ocalenie pierworodnych.',
  fullText: pkg.fullText,
  contentApp: pkg.fullText,
  contentWeb: pkg.contentWeb,
  contentSms: 'Dzień 42 (Wj 12:13): „Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia”. Jezus Chrystus jest Twoim Barankiem Paschalnym. Odpocznij w pokoju pod Jego krwią! polskieradio.cc',
  tvScript: pkg.tvScript,
  ccnArticle: pkg.ccnArticle,
  imageUrl: '/images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg'
};

const bazaPath = path.join(ROOT, 'rozwazania_baza.json');
let baza = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));
baza = baza.filter(e => e.id !== day42Entry.id && e.date !== day42Entry.date);
baza.unshift(day42Entry);
fs.writeFileSync(bazaPath, JSON.stringify(baza, null, 2), 'utf8');

console.log('✅ Zaktualizowano rozwazania_baza.json o Dzień 42 (2026-11-11)!');
console.log('Nowy wpis:', {
  id: baza[0].id,
  day: baza[0].day,
  date: baza[0].date,
  title: baza[0].title
});
