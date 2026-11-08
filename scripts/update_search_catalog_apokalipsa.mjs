import fs from 'node:fs';
import path from 'node:path';

const catalogPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\szukaj\\catalog.json';
const searchIndexPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\cc-search-index.json';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Check existing
const has30 = catalog.items.some(it => it.url && it.url.includes('apokalipsa/lekcja-30'));
const has31 = catalog.items.some(it => it.url && it.url.includes('apokalipsa/lekcja-31'));

const item30 = {
  id: 'apok-lekcja-30',
  title: 'Lekcja 30: UPADŁ WIELKI BABILON — TAJEMNICA SZKARŁATNEJ KOBIETY',
  subtitle: 'Apokalipsa 17:1–6 — Sąd nad wielką wszetecznicą i demaskacja duchowego zwiedzenia',
  description: 'Studium Apokalipsy 17:1–6 z pastorem Wincentym Sieją (Studio Dobrego Słowa). Kobieta na bestii, kielich obrzydliwości i demaskacja duchowego Babilonu.',
  category: 'studia_biblijne',
  categoryLabel: 'Akademia Biblijna • Apokalipsa',
  url: 'https://polskieradio.cc/akademia/apokalipsa/lekcja-30',
  tags: ['apokalipsa', 'apokalipsa 17', 'babilon', 'szkarlatna kobieta', 'studium biblijne', 'wincenty sieja', 'studio dobrego slowa', 'lekcja 30'],
  icon: '📖',
  priority: 85
};

const item31 = {
  id: 'apok-lekcja-31',
  title: 'Lekcja 31: ÓSMY KRÓL — PRZEPOWIEDNIA DLA NASZYCH CZASÓW',
  subtitle: 'Apokalipsa 17:7–18 — Tajemnica zwierzęcia, które było, nie ma go i znowu będzie',
  description: 'Studium Apokalipsy 17:7–18 z pastorem Wincentym Sieją (Studio Dobrego Słowa). Kim jest Ósmy Król, siedem głów, dziesięć rogów i ostateczny triumf Baranka.',
  category: 'studia_biblijne',
  categoryLabel: 'Akademia Biblijna • Apokalipsa',
  url: 'https://polskieradio.cc/akademia/apokalipsa/lekcja-31',
  tags: ['apokalipsa', 'apokalipsa 17', 'osmy krol', 'siedem glow', 'dziesiec rogow', 'zwyciestwo baranka', 'studium biblijne', 'wincenty sieja', 'studio dobrego slowa', 'lekcja 31'],
  icon: '📖',
  priority: 90
};

if (!has30) catalog.items.push(item30);
if (!has31) catalog.items.push(item31);
catalog.totalItems = catalog.items.length;
catalog.updatedAt = new Date().toISOString();

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('✅ szukaj/catalog.json updated with lessons 30 & 31. Total items:', catalog.totalItems);

// Update data/cc-search-index.json if exists
if (fs.existsSync(searchIndexPath)) {
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
  if (Array.isArray(searchIndex)) {
    if (!searchIndex.some(it => it.url && it.url.includes('apokalipsa/lekcja-30'))) searchIndex.push(item30);
    if (!searchIndex.some(it => it.url && it.url.includes('apokalipsa/lekcja-31'))) searchIndex.push(item31);
    fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf8');
    console.log('✅ data/cc-search-index.json updated (array)');
  } else if (Array.isArray(searchIndex.items)) {
    if (!searchIndex.items.some(it => it.url && it.url.includes('apokalipsa/lekcja-30'))) searchIndex.items.push(item30);
    if (!searchIndex.items.some(it => it.url && it.url.includes('apokalipsa/lekcja-31'))) searchIndex.items.push(item31);
    searchIndex.totalItems = searchIndex.items.length;
    searchIndex.updatedAt = new Date().toISOString();
    fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf8');
    console.log('✅ data/cc-search-index.json updated (object with items)');
  }
}

// Copy catalog.json to .pages-release and Desktop/@ICC/LUMINA
const pagesCatalog = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\.pages-release\\szukaj\\catalog.json';
const luminaCatalog = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\szukaj\\catalog.json';
fs.mkdirSync(path.dirname(pagesCatalog), { recursive: true });
fs.copyFileSync(catalogPath, pagesCatalog);
fs.mkdirSync(path.dirname(luminaCatalog), { recursive: true });
fs.copyFileSync(catalogPath, luminaCatalog);
console.log('✅ Search catalog copied to mirrors');
