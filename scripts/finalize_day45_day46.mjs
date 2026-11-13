import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { day45Data, day46Data } from './day_data_45_46.mjs';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const days = [
  { ...day45Data, dayOfWeek: 'SOBOTA' },
  { ...day46Data, dayOfWeek: 'NIEDZIELA' },
];

// 1. Update rozwazania_baza.md
const mdBazaPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdBazaPath)) {
  let currentMd = fs.readFileSync(mdBazaPath, 'utf8');
  for (const d of days) {
    const hdr = `## Dzień ${d.dayNum} (${d.dateStr}): ${d.title} (${d.reading})`;
    if (!currentMd.includes(`Dzień ${d.dayNum} (`) && !currentMd.includes(`ref_day${d.dayNum}_${d.dateStr}`)) {
      const block = `\n\n${hdr}\n\n### Wersja TTS (App):\n${d.contentApp}\n\n### Wersja WWW:\n${d.contentWeb}\n\n### Wersja SMS:\n${d.contentSms}\n`;
      fs.appendFileSync(mdBazaPath, block, 'utf8');
      console.log(`✔ Dopisano Dzień ${d.dayNum} do rozwazania_baza.md`);
    } else {
      console.log(`ℹ rozwazania_baza.md zawiera już Dzień ${d.dayNum}`);
    }
  }
}

// 2. Firebase cuda-398c0 & cc-mission-control
async function uploadToFirestore() {
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json')))
  }, 'cuda_45_46_' + Date.now());
  const cudaDb = cudaApp.firestore();

  const mcApp = admin.initializeApp({
    credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'serviceAccountKey.json')))
  }, 'mc_45_46_' + Date.now());
  const mcDb = mcApp.firestore();

  for (const d of days) {
    const docIdRef = `ref_day${d.dayNum}_${d.dateStr}`;
    const docIdShort = `day${d.dayNum}_${d.dateStr}`;
    const fullTitle = `☀️ Z Biblią za Pan Brat — Dzień ${d.dayNum}: ${d.title}`;

    await cudaDb.collection('reflections').doc(docIdRef).set({
      date: d.dateStr,
      dayOfWeek: d.dayOfWeek,
      title: fullTitle,
      teaser: d.subtitle,
      fullText: d.contentApp,
      contentApp: d.contentApp,
      contentWeb: d.contentWeb,
      contentSms: d.contentSms,
      imageUrl: `https://polskieradio.cc${d.imageUrl}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      dayNumber: d.dayNum,
      reading: d.reading,
      book: d.book
    }, { merge: true });
    console.log(`✔ Opublikowano do cuda-398c0/reflections/${docIdRef}`);

    for (const docId of [docIdRef, docIdShort]) {
      await mcDb.collection('morning_inspirations').doc(docId).set({
        date: d.dateStr,
        dayNumber: d.dayNum,
        title: fullTitle,
        teaser: d.subtitle,
        fullText: d.contentApp,
        contentApp: d.contentApp,
        contentWeb: d.contentWeb,
        contentSms: d.contentSms,
        imageUrl: `https://polskieradio.cc${d.imageUrl}`,
        reading: d.reading,
        book: d.book,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await mcDb.collection('web_inspirations').doc(docId).set({
        date: d.dateStr,
        dayNumber: d.dayNum,
        title: fullTitle,
        teaser: d.subtitle,
        fullText: d.contentWeb,
        contentWeb: d.contentWeb,
        content: d.contentWeb,
        contentSms: d.contentSms,
        imageUrl: `https://polskieradio.cc${d.imageUrl}`,
        reading: d.reading,
        book: d.book,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    console.log(`✔ Opublikowano do cc-mission-control morning_inspirations & web_inspirations (${docIdRef})`);
  }

  await cudaApp.delete();
  await mcApp.delete();
}

// 3. Update ecosystem-map.json
function updateEcosystemMap() {
  const mapPaths = [
    path.join(ROOT, 'data/ecosystem-map.json'),
    path.join(LUMINA_ROOT, 'data/ecosystem-map.json')
  ];
  const topicText = 'Pakiet wyprzedzający na weekend: Dzień 45 (Wj 15 Pieśń Zwycięstwa i Mara) oraz Dzień 46 (Wj 16 Manna z nieba i Szabat) + 11 pasm OpenBot';

  for (const p of mapPaths) {
    if (fs.existsSync(p)) {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(mapData.recentUpdates)) {
        mapData.recentUpdates = mapData.recentUpdates.filter(u => !u.topic.includes('Dzień 45') && !u.topic.includes('Dzień 46'));
        mapData.recentUpdates.unshift({
          date: '2026-11-13',
          topic: topicText,
          agent: 'A'
        });
        mapData.lastUpdated = '2026-11-13';
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log(`✔ Zaktualizowano Żywą Mapę: ${p}`);
      }
    }
  }
}

async function main() {
  await uploadToFirestore();
  updateEcosystemMap();
  console.log('🎉 Firestore i Żywa Mapa zaktualizowane pomyślnie!');
}

main().catch(err => {
  console.error('❌ Błąd:', err);
  process.exit(1);
});
