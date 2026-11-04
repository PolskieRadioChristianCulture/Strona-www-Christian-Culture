import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const mapPath = path.join(ROOT, 'data', 'ecosystem-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// Dodaj do updatesLog na początek
const newLog = {
  date: "2026-11-04",
  agent: "A",
  topic: "Bądź Blisko (/badz-blisko, /BądźBlisko) — nowa podstrona: 7-dniowy plan biblijny ze Słowem Bożym, wyciszenie i mały krok"
};

map.updatesLog.unshift(newLog);

// Dodaj do nodes jeśli jeszcze nie ma
if (map.nodes && !map.nodes.some(n => n.id === 'badz-blisko')) {
  const newNode = {
    id: 'badz-blisko',
    branchId: 'cc-spiritual',
    name: 'Po prostu bądź blisko — Siedem dni ze Słowem',
    shortDesc: '7-dniowy plan biblijny: wyciszenie, chwila ze Słowem i mały krok.',
    fullDesc: 'Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Prosty plan biblijny Christian Culture w rytmie Twojego dnia.',
    type: 'service',
    url: 'https://polskieradio.cc/badz-blisko',
    status: 'active',
    lang: 'pl',
    icon: '✨',
    category: 'Duchowość i Modlitwa',
    keywords: ['badz blisko', 'bądź blisko', '7 dni', 'plan biblijny', 'oddech', 'wyciszenie', 'modlitwa', 'Słowo Boże'],
    connections: ['mojabiblia', 'akademia-glowna']
  };
  map.nodes.push(newNode);
}

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2), 'utf8');
console.log('Map updated successfully with badz-blisko!');
