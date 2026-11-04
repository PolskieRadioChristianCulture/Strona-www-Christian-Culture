import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const catalogPath = path.join(ROOT, 'szukaj', 'catalog.json');
const indexPath = path.join(ROOT, 'data', 'cc-search-index.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const badzBliskoEntry = {
  title: "Po prostu bądź blisko — Siedem dni ze Słowem",
  category: "Duchowość i modlitwa",
  url: "https://polskieradio.cc/badz-blisko",
  description: "Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Prosty plan biblijny Christian Culture.",
  tags: [
    "badz blisko",
    "bądź blisko",
    "badzblisko",
    "7 dni ze slowem",
    "7 dni ze słowem",
    "siedem dni ze slowem",
    "plan biblijny",
    "miejsce na oddech",
    "oddech",
    "wyciszenie",
    "chwila ciszy",
    "modlitwa",
    "slowo boze",
    "słowo boże",
    "zatrzymaj sie",
    "zatrzymaj się",
    "twoj maly krok"
  ],
  featured: true
};

// Usuń ewentualny stary wpis jeśli istnieje
catalog.items = catalog.items.filter(i => !i.url.includes('badz-blisko') && !i.url.includes('badzblisko'));
// Dodaj wpis
catalog.items.unshift(badzBliskoEntry);

const now = new Date().toISOString();
catalog.updatedAt = now;
catalog.totalItems = catalog.items.length;

const jsonStr = JSON.stringify(catalog, null, 2);

fs.writeFileSync(catalogPath, jsonStr, 'utf8');
fs.writeFileSync(indexPath, jsonStr, 'utf8');

console.log(`Indexed badz-blisko. Total items: ${catalog.totalItems}, updatedAt: ${now}`);
