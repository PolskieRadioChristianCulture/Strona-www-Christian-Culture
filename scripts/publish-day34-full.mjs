import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🚀 Rozpoczynam publikację pełnego pakietu dla Dnia 34 (Wj 3:1–22)...');

const DAY_NUM = 34;
const DATE_STR = '2026-11-03';
const DATE_FORMATTED = 'Wtorek, 3 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 3:1–22';
const TITLE = 'PŁONĄCY KRZAK: ŚWIĘTE IMIĘ BOGA I BOŻE ZSTĄPIENIE NA RATUNEK';
const SUBTITLE = 'Teofania na Horebie, powołanie Mojżesza, objawienie Imienia JHWH i obietnica wyzwolenia z Egiptu';
const MEMORY_VERSE = '„I Bóg odpowiedział Mojżeszowi: JESTEM, KTÓRY JESTEM. I dodał: Tak powiesz synom Izraela: JESTEM posłał mnie do was.” (Wj 3:14, UBG)';
const THEME = 'Święty Bóg przymierza nie jest obojętnym obserwatorem ludzkiej niedoli. On widzi ucisk, słyszy krzyk i osobiście zstępuje, aby ratować swój lud. Objawiając Mojżeszowi w płonącym krzaku przedwieczne Imię „JESTEM, KTÓRY JESTEM”, Bóg kładzie kres ludzkiej samowystarczalności i powołuje cichego pasterza, by stał się świadkiem Jego nieskończonej mocy i wierności.';
const IMAGE_URL = 'https://polskieradio.cc/images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg';

const pakietContent = fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day34-5wersji.md'), 'utf8');

// Wyodrębnienie wersji
const wersja1Match = pakietContent.match(/====================================================================\r?\nWERSJA 1: ROZWAŻANIE PORANNE[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 2/);
const wersja2Match = pakietContent.match(/====================================================================\r?\nWERSJA 2: WERSJA WWW \/ PORTAL[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 3/);
const wersja3Match = pakietContent.match(/====================================================================\r?\nWERSJA 3: WERSJA WIECZORNA[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 4/);

const contentApp = wersja1Match ? wersja1Match[1].trim() : '';
const contentWeb = wersja2Match ? wersja2Match[1].trim() : '';
const contentSms = wersja3Match ? wersja3Match[1].trim() : '';

console.log('✔ Wyodrębniono wersje:');
console.log('   contentApp długość:', contentApp.length);
console.log('   contentWeb długość:', contentWeb.length);
console.log('   contentSms długość:', contentSms.length);

if (!contentApp || !contentWeb || !contentSms) {
  throw new Error('Błąd: nie udało się wyodrębnić wszystkich wersji treści!');
}

// 2. Aktualizacja rozwazania_baza.md
const mdBazaPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdBazaPath)) {
  const currentMd = fs.readFileSync(mdBazaPath, 'utf8');
  if (!currentMd.includes('Dzień 34 (3 listopada 2026)')) {
    const mdAppend = `\n\n## Dzień 34 (3 listopada 2026): Płonący Krzak — Święte Imię Boga, powołanie Mojżesza i Boże zstąpienie na ratunek (Wj 3:1–22)\n\n` + pakietContent;
    fs.appendFileSync(mdBazaPath, mdAppend, 'utf8');
    console.log('✔ Zaktualizowano rozwazania_baza.md o Dzień 34.');
  } else {
    console.log('ℹ rozwazania_baza.md zawiera już Dzień 34.');
  }
}

// 3. Aktualizacja rozwazania_baza.json
const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
let bazaList = [];
if (fs.existsSync(jsonBazaPath)) {
  bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));
}
if (!bazaList.some(item => item.day === 34 && item.date === DATE_STR)) {
  bazaList.unshift({
    day: DAY_NUM,
    date: DATE_STR,
    dateFormatted: DATE_FORMATTED,
    title: `☀️ Z Biblią za Pan Brat — Dzień 34: Płonący Krzak — Święte Imię Boga i Boże zstąpienie na ratunek`,
    book: BOOK,
    reading: READING,
    memoryVerse: MEMORY_VERSE,
    theme: THEME,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    imageUrl: `/images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg`
  });
  fs.writeFileSync(jsonBazaPath, JSON.stringify(bazaList, null, 2), 'utf8');
  console.log('✔ Zaktualizowano rozwazania_baza.json w ROOT.');

  const luminaJson = path.join(LUMINA_ROOT, 'rozwazania_baza.json');
  if (fs.existsSync(path.dirname(luminaJson))) {
    fs.writeFileSync(luminaJson, JSON.stringify(bazaList, null, 2), 'utf8');
    console.log('✔ Zsynchronizowano rozwazania_baza.json do LUMINA.');
  }
}

// 4. Publikacja w Firestore: cuda-398c0 (Dobrze, że jesteś)
async function publishCuda() {
  const cudaKeyPath = path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json');
  if (!fs.existsSync(cudaKeyPath)) {
    console.error('❌ Brak klucza cudaServiceAccountKey.json');
    return;
  }
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(cudaKeyPath))
  }, 'cudaApp34');

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;
  const docData = {
    date: DATE_STR,
    dayOfWeek: 'Wtorek',
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 34: Płonący Krzak — Święte Imię Boga i Boże zstąpienie na ratunek`,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    book: BOOK,
    reading: READING,
    memoryVerse: MEMORY_VERSE,
    imageUrl: IMAGE_URL,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('reflections').doc(docId).set(docData, { merge: true });
  console.log(`✔ Opublikowano w cuda-398c0 / reflections: ${docId}`);
  await cudaApp.delete();
}

// 5. Publikacja w Firestore: cc-mission-control
async function publishMissionControl() {
  const mcKeyPath = path.join(WEKTOR_ROOT, 'serviceAccountKey.json');
  if (!fs.existsSync(mcKeyPath)) {
    console.error('❌ Brak klucza serviceAccountKey.json');
    return;
  }
  const mcApp = admin.initializeApp({
    credential: admin.credential.cert(require(mcKeyPath))
  }, 'mcApp34');

  const db = mcApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  const morningData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 34: Płonący Krzak — Święte Imię Boga i Boże zstąpienie na ratunek`,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    book: BOOK,
    reading: READING,
    imageUrl: IMAGE_URL,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const webData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 34: Płonący Krzak — Święte Imię Boga i Boże zstąpienie na ratunek`,
    content: contentWeb,
    contentWeb: contentWeb,
    book: BOOK,
    reading: READING,
    imageUrl: IMAGE_URL,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('morning_inspirations').doc(docId).set(morningData, { merge: true });
  await db.collection('web_inspirations').doc(docId).set(webData, { merge: true });
  console.log(`✔ Opublikowano w cc-mission-control (morning & web): ${docId}`);

  // Kolejkowanie priorytetowe dla Grupy Nazira (3 wiadomości)
  const nazirGroupId = '120363409279454206@g.us';
  const nazirCommands = [
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `☀️ *PORANNA WERSJA APLIKACYJNA TTS (Dzień 34)*\n\n${contentApp}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day34_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `🌐 *WERSJA NA CAŁY DZIEŃ WWW (Dzień 34)*\n\n${contentWeb}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day34_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `🌙 *WIECZORNA WERSJA SMS (Dzień 34)*\n\n${contentSms}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day34_publisher'
    }
  ];

  for (const cmd of nazirCommands) {
    await db.collection('CommandQueue').add(cmd);
  }
  console.log('✔ Zakolejkowano 3 priorytetowe wiadomości dla Grupy Nazira w CommandQueue.');

  await mcApp.delete();
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log('🎉 Publikacja baz danych i Firebase zakończona pełnym sukcesem!');
}

main().catch(console.error);
