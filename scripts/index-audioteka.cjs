const fs = require('fs');

const audiotekaEntry = {
  title: 'Audioteka Christian Culture — Audiobiblioteka Wiary 0,00 zł',
  category: 'Audio & Słuchowiska',
  url: 'https://polskieradio.cc/audioteka',
  description: 'Twoja chrześcijańska audiobiblioteka wiary online — 0,00 zł, bez opłat, zawsze za darmo. Słuchaj Biblii Audio, wykładów i studiów biblijnych, muzyki uwielbienia, podcastów inspirujących i serii tematycznych.',
  tags: [
    'audioteka',
    'audioteka christian culture',
    'audiobiblioteka',
    'audiobiblioteka wiary',
    'audiobooki',
    'audiobook',
    'biblia audio',
    'wykłady biblijne',
    'studia biblijne',
    'muzyka uwielbienia',
    'worship',
    'podcasty',
    'podcast',
    'słuchaj za darmo',
    '0 zł',
    'darmowe audiobooki',
    'radio cc',
    'polskieradio.cc/audioteka'
  ],
  featured: true
};

// 1. Update data/cc-search-index.json
const indexPath = 'data/cc-search-index.json';
if (fs.existsSync(indexPath)) {
  const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const existing = data.items.findIndex(it => it.url && it.url.includes('/audioteka'));
  if (existing >= 0) {
    data.items[existing] = audiotekaEntry;
  } else {
    data.items.unshift(audiotekaEntry);
  }
  data.totalItems = data.items.length;
  data.updatedAt = '2026-11-11T14:55:00.000Z';
  fs.writeFileSync(indexPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Indexed in data/cc-search-index.json');
}

// 2. Update szukaj/catalog.json
const catalogPath = 'szukaj/catalog.json';
if (fs.existsSync(catalogPath)) {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const existing = data.items.findIndex(it => it.url && it.url.includes('/audioteka'));
  if (existing >= 0) {
    data.items[existing] = audiotekaEntry;
  } else {
    data.items.unshift(audiotekaEntry);
  }
  data.totalItems = data.items.length;
  data.updatedAt = '2026-11-11T14:55:00.000Z';
  fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Indexed in szukaj/catalog.json');
}

// 3. Update data/ecosystem-map.json
const mapPath = 'data/ecosystem-map.json';
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  
  // Register in recentUpdates
  if (!mapData.recentUpdates) mapData.recentUpdates = [];
  mapData.recentUpdates.unshift({
    date: '2026-11-11',
    topic: 'Oficjalna premiera Audioteka Christian Culture (Audiobiblioteka Wiary 0,00 zł)',
    agent: 'A'
  });
  mapData.recentUpdates = mapData.recentUpdates.slice(0, 15);

  // Register node if nodes array exists
  if (Array.isArray(mapData.nodes)) {
    const existingNode = mapData.nodes.find(n => n.id === 'audioteka' || (n.url && n.url.includes('/audioteka')));
    if (!existingNode) {
      mapData.nodes.push({
        id: 'audioteka',
        label: 'Audioteka Christian Culture',
        category: 'audio',
        url: 'https://polskieradio.cc/audioteka',
        description: 'Chrześcijańska Audiobiblioteka Wiary 0,00 zł',
        status: 'active'
      });
    }
  }

  mapData.lastUpdated = '2026-11-11';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log('Updated data/ecosystem-map.json');
}
