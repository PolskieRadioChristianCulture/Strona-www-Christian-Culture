import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const now = new Date().toISOString();

for (const rel of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const f = path.join(ROOT, rel);
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-31') {
      item.title = 'Z Biblią za Pan Brat — Dzień 31 (Lekcja 31): Bóg obrócił to w dobro — Ewangelia Opatrzności (Rdz 50:1–26)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 31 na dziś'].includes(t));
      item.featured = false;
    }
  }
  const has32 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-32');
  if (!has32) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 32 (Lekcja 32 na dziś): W nieskrępowanym rozroście: Nowy król, uciskanie i Boże ocalenie (Wj 1:1–22)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-32',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 32 (Lekcja 32 na dziś, 1 listopada 2026). Księga Wyjścia: nowy faraon, niewola Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia — Wj 1:1–22.',
      tags: [
        'lekcja 32', 'lekcja 32 na dziś', 'lekcja na dziś', 'dzień 32', 'dzien 32',
        'rozważanie 32', 'rozważanie na dziś', 'słowo na dziś',
        'w nieskrępowanym rozroście', 'nowy król', 'faraon', 'szifra i pua', 'położne', 'bojaźń boża',
        'niewola egipska', 'wj 1', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '1 listopada 2026', 'dzisiaj', 'dziś'
      ],
      featured: true,
    });
  }
  idx.totalItems = idx.items.length;
  idx.updatedAt = now;
  fs.writeFileSync(f, JSON.stringify(idx, null, 2) + '\n');
  console.log('✅ Zaktualizowano', f, 'totalItems:', idx.totalItems);

  // Mirror do LUMINA
  const luminaFile = path.join(LUMINA_ROOT, rel);
  if (fs.existsSync(path.dirname(luminaFile))) {
    fs.writeFileSync(luminaFile, JSON.stringify(idx, null, 2) + '\n');
    console.log('✅ Zsynchronizowano mirror LUMINA:', luminaFile);
  }
}

// Ensure byte-for-byte identical content
fs.copyFileSync(path.join(ROOT, 'szukaj/catalog.json'), path.join(ROOT, 'data/cc-search-index.json'));

const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const topic = 'Z Biblią za Pan Brat — Dzień 32 (Wj 1): Publikacja lekcji „W nieskrępowanym rozroście: Nowy król, uciskanie i Boże ocalenie” w Akademii Biblijnej';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-11-01',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('✅ Zaktualizowano ecosystem-map.json');

  const luminaMap = path.join(LUMINA_ROOT, 'data/ecosystem-map.json');
  if (fs.existsSync(path.dirname(luminaMap))) {
    fs.writeFileSync(luminaMap, JSON.stringify(map, null, 2) + '\n');
    console.log('✅ Zsynchronizowano mirror ecosystem-map.json w LUMINA');
  }
}
