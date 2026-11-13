import fs from 'node:fs';

const p = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

const newEntry = {
  date: '2026-11-13',
  agent: 'A',
  title: 'OpenBot Diagram Kanałów Nadawczych (37 Kanałów TV/Radio • 6 Filarów • OBS 24/7)',
  description: 'Rozpisanie kompletnego przepływu emisji kanałów nadawczych (Pasmo 0B, workflow CC 0B) na kanwie OpenBot: 37 kanałów telewizyjnych i portali CCN, stacje radiowe 24/7, integracja OBS, podcasty RSS 2.0 i globalna syndykacja.'
};

if (Array.isArray(data.updates)) {
  data.updates.unshift(newEntry);
} else if (Array.isArray(data.recentUpdates)) {
  data.recentUpdates.unshift(newEntry);
}

fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
const mirror = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';
if (fs.existsSync('C:/Users/czark/Desktop/@ICC/LUMINA/data')) {
  fs.writeFileSync(mirror, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Map updated with broadcast channels');
