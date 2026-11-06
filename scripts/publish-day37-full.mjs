import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('\n🚀 Rozpoczynam poranną publikację pełnego pakietu dla Dnia 37 (Wj 6:1–30)...');

const DAY_NUM = 37;
const DATE_STR = '2026-11-06';
const DATE_FORMATTED = 'Piątek, 6 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 6:1–30';
const TITLE = '☀️ Z Biblią za Pan Brat — Dzień 37: Teraz zobaczysz, co uczynię faraonowi — siedem obietnic odkupienia';
const SUBTITLE = 'Objawienie Imienia JAHWE, wieczne przymierze z ojcami i 7 obietnic odkupienia wyciągniętym ramieniem';
const MEMORY_VERSE = '„Dlatego powiedz synom Izraela: Ja jestem PAN! Wyprowadzę was spod ciężarów Egipcjan, wybawię was z ich niewoli i odkupię was wyciągniętym ramieniem i przez wielkie sądy.” (Wj 6:6, UBG)';
const THEME = 'Szósty rozdział Księgi Wyjścia ukazuje przełom w dolinie pozornej klęski: Bóg objawia pełnię Imienia JAHWE i składa 7 obietnic odkupienia wyciągniętym ramieniem, które wypełniły się w Chrystusie.';
const IMAGE_URL = '/images/academy/daily/kc_day_37_obietnice_odkupienia_ramie_pana.jpg';

// Read pakiet content
const pakietContent = fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day37-5wersji.md'), 'utf8');

// Extract versions
const sep = '====================================================================';
const parts = pakietContent.split(sep);
let contentApp = '', contentWeb = '', contentSms = '';

for (let i = 0; i < parts.length; i++) {
  if (parts[i].includes('WERSJA 1:')) contentApp = (parts[i+1] || '').trim();
  else if (parts[i].includes('WERSJA 2:')) contentWeb = (parts[i+1] || '').trim();
  else if (parts[i].includes('WERSJA 3:')) contentSms = (parts[i+1] || '').trim();
}

console.log('✔ Wyodrębniono wersje:');
console.log('   contentApp długość:', contentApp.length);
console.log('   contentWeb długość:', contentWeb.length);
console.log('   contentSms długość:', contentSms.length);

if (!contentApp || !contentWeb || !contentSms) {
  throw new Error('Błąd: nie udało się wyodrębnić wszystkich wersji treści!');
}

// 1. Update rozwazania_baza.md
const mdBazaPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdBazaPath)) {
  const currentMd = fs.readFileSync(mdBazaPath, 'utf8');
  if (!currentMd.includes('Dzień 37 (6 listopada 2026)')) {
    fs.appendFileSync(mdBazaPath, `\n\n## Dzień 37 (6 listopada 2026): Teraz zobaczysz, co uczynię faraonowi — siedem obietnic odkupienia (Wj 6:1–30)\n\n` + pakietContent, 'utf8');
    console.log('✔ Zaktualizowano rozwazania_baza.md o Dzień 37.');
  } else {
    console.log('ℹ rozwazania_baza.md zawiera już Dzień 37.');
  }
}

// 2. Sync rozwazania_baza.json
const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
let bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));

const day37Item = {
  day: DAY_NUM,
  date: DATE_STR,
  dateFormatted: DATE_FORMATTED,
  title: TITLE,
  book: BOOK,
  reading: READING,
  memoryVerse: MEMORY_VERSE,
  theme: THEME,
  contentApp,
  contentWeb,
  contentSms,
  imageUrl: IMAGE_URL
};

bazaList = bazaList.filter(item => !(item.day === DAY_NUM && item.date === DATE_STR));
bazaList.unshift(day37Item);
fs.writeFileSync(jsonBazaPath, JSON.stringify(bazaList, null, 2), 'utf8');
console.log('✔ Zaktualizowano rozwazania_baza.json w ROOT.');

// Sync mirrors
const mirrors = [
  path.join(ROOT, '.pages-release', 'rozwazania_baza.json'),
  path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
  path.join(LUMINA_ROOT, 'rozwazania_baza.json'),
];
for (const mirror of mirrors) {
  try {
    fs.mkdirSync(path.dirname(mirror), { recursive: true });
    fs.writeFileSync(mirror, JSON.stringify(bazaList, null, 2), 'utf8');
    console.log('✔ Zsynchronizowano do:', mirror);
  } catch (e) {
    console.warn('⚠ Pominięto mirror:', mirror, e.message);
  }
}

// 3. Firebase cuda-398c0
async function publishCuda() {
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json')))
  }, 'cuda37');

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  await db.collection('reflections').doc(docId).set({
    date: DATE_STR,
    dayOfWeek: 'Piątek',
    title: TITLE,
    teaser: SUBTITLE,
    fullText: contentApp,
    imageUrl: `https://polskieradio.cc${IMAGE_URL}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    dayNumber: DAY_NUM,
    reading: READING,
    book: BOOK
  });
  console.log(`✔ Opublikowano do cuda-398c0/reflections/${docId}`);
  await cudaApp.delete();
}

// 4. Firebase cc-mission-control + CommandQueue
async function publishMissionControl() {
  const mcApp = admin.initializeApp({
    credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'serviceAccountKey.json')))
  }, 'mc37');

  const db = mcApp.firestore();
  const docId = `day${DAY_NUM}_${DATE_STR}`;

  await db.collection('morning_inspirations').doc(docId).set({
    date: DATE_STR,
    title: TITLE,
    content: contentApp,
    dayNumber: DAY_NUM,
    reading: READING,
    book: BOOK,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`✔ Opublikowano do cc-mission-control/morning_inspirations/${docId}`);

  await db.collection('web_inspirations').doc(docId).set({
    date: DATE_STR,
    title: TITLE,
    content: contentWeb,
    dayNumber: DAY_NUM,
    reading: READING,
    book: BOOK,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`✔ Opublikowano do cc-mission-control/web_inspirations/${docId}`);

  // WhatsApp Queue
  const nazirGroupId = '120363403565056716@g.us';
  const bartekTarget = '48509370007@c.us';

  const nazirCommands = [
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`,
      message: `📖 *WERSJA PORANNA TTS (Dzień ${DAY_NUM})*\n\n${contentApp}`,
      priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day37_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`,
      message: `🌐 *WERSJA NA CAŁY DZIEŃ WWW (Dzień ${DAY_NUM})*\n\n${contentWeb}`,
      priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day37_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`,
      message: `🌙 *WIECZORNA WERSJA SMS (Dzień ${DAY_NUM})*\n\n${contentSms}`,
      priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day37_publisher'
    }
  ];

  for (const cmd of nazirCommands) {
    await db.collection('CommandQueue').add(cmd);
  }
  console.log('✔ Zakolejkowano 3 priorytetowe wiadomości dla Grupy Nazira w CommandQueue.');

  await db.collection('CommandQueue').add({
    action: 'send_whatsapp_message',
    chatId: bartekTarget,
    command: `wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
    message: `☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
    priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'auto_day37_publisher'
  });
  console.log('✔ Zakolejkowano wersję SMS dla Bartka.');

  const supportBlock = `🌿 Możesz wspierać misję Christian Culture\nmodlitwą, udostępniając i polecając nasze treści\noraz poprzez cykliczny dar finansowy 🕊️\nKażde wsparcie pomaga nam docierać z Ewangelią dalej\ni tworzyć przestrzeń wzrostu duchowego dla tysięcy osób ✨🙏\n\nWspieraj Bożą misję:\n👉 https://patronite.pl/osobowoscplus\n\n💳 Nr konta:\n48 2910 0006 0000 0000 0527 2629\nz dopiskiem: „Dar misyjny"\n\n💸 Revolut: https://revolut.me/christianculture\n📲 BLIK: 537 137 043\n\n🌿 Dziękujemy za Twoje wsparcie i zaufanie. 🤍`;

  const fifoGroups = [
    { name: 'Cuda Każdego Dnia', groupId: '120363024884245648@g.us' },
    { name: '#DobrzeZeJestes', groupId: '120363042188448956@g.us' },
  ];
  for (const group of fifoGroups) {
    const greeting = `Szczęść Boże, zespole ${group.name}! 🕊️\n\n`;
    const fullText = greeting + contentWeb + '\n\n_nazir | Christian Culture | www.polskieradio.cc_\n\n' + supportBlock;
    await db.collection('CommandQueue').add({
      action: 'send_whatsapp_message',
      chatId: group.groupId,
      command: `wyślij celowane [${group.groupId}]: ${fullText}`,
      message: fullText,
      priority: 'normal', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day37_publisher'
    });
    console.log(`✔ Zakolejkowano wersję WWW dla grupy FIFO (${group.name}).`);
  }

  // Cloudflare D1 backup
  try {
    const mc = require(path.join(WEKTOR_ROOT, 'mc_d1_client'));
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`, nazirGroupId, 9, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`, nazirGroupId, 8, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`, nazirGroupId, 7, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}`, bartekTarget, 6, DAY_NUM);
    console.log('✔ Zapasowo zakolejkowano do Cloudflare D1.');
  } catch (e) {
    console.warn('ℹ mc_d1_client:', e.message);
  }

  await mcApp.delete();
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log('\n🎉 Publikacja Dnia 37 — Firebase + WhatsApp zakończona sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd krytyczny:', err);
  process.exit(1);
});
