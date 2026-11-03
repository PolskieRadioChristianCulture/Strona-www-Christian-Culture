import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🚀 Rozpoczynam generowanie pełnego pakietu dla Dnia 33 (Wj 2:1–25)...');

// 1. Dane Dnia 33
const DAY_NUM = 33;
const DATE_STR = '2026-11-02';
const DATE_FORMATTED = 'Poniedziałek, 2 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 2:1–25';
const TITLE = 'Z WÓD NILU DO PUSTYNI MADIAN: OCALENIE MOJŻESZA, CZAS PRÓBY I BOŻA PAMIĘĆ O PRZYMIERZU';
const SUBTITLE = 'Koszyk z sitowia, litość córki faraona, fałszywy start w Egipcie, ucieczka do Madianu i jęk uciemiężonych docierający przed Boży tron';
const MEMORY_VERSE = '„I Bóg usłyszał ich narzekanie, i wspomniał Bóg na swoje przymierze z Abrahamem, Izaakiem i Jakubem. I wejrzał Bóg na synów Izraela, i poznał ich Bóg.” (Wj 2:24–25, UBG)';
const THEME = 'Gdy faraon skazuje niewinne dzieci na śmierć w falach Nilu, Boża Opatrzność czyni z wód rzeki kołyskę ocalenia dla przyszłego wyzwoliciela. Bóg nie potrzebuje jednak ludzkiej przemocy ani niecierpliwości — zanim Mojżesz stanie się Bożym narzędziem, musi przejść czterdzieści lat formacji na pustyni Madian. W najciemniejszej nocy cierpienia Bóg słyszy jęk swojego ludu i wiernie pamięta o swoim przymierzu.';

const pakietContent = fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day33-5wersji.md'), 'utf8');

// Wyodrębnienie wersji
const wersja1Match = pakietContent.match(/WERSJA 1: ROZWAŻANIE PORANNE[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 2/);
const wersja2Match = pakietContent.match(/WERSJA 2: WERSJA WWW \/ PORTAL[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 3/);
const wersja3Match = pakietContent.match(/WERSJA 3: WERSJA WIECZORNA[\s\S]*?====================================================================\r?\n([\s\S]*?)\r?\n====================================================================\r?\nWERSJA 4/);

const contentApp = wersja1Match ? wersja1Match[1].trim() : '';
const contentWeb = wersja2Match ? wersja2Match[1].trim() : '';
const contentSms = wersja3Match ? wersja3Match[1].trim() : '';

console.log('✅ Wyodrębniono wersje:');
console.log('   contentApp długość:', contentApp.length);
console.log('   contentWeb długość:', contentWeb.length);
console.log('   contentSms długość:', contentSms.length);

// 2. Aktualizacja rozwazania_baza.md
const mdBazaPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdBazaPath)) {
  const currentMd = fs.readFileSync(mdBazaPath, 'utf8');
  if (!currentMd.includes('Dzień 33 (2 listopada 2026)')) {
    const mdAppend = `\n\n## Dzień 33 (2 listopada 2026): Z wód Nilu do pustyni Madian — Ocalenie Mojżesza, czas próby i Boża pamięć o przymierzu (Wj 2:1–25)\n\n` + pakietContent;
    fs.appendFileSync(mdBazaPath, mdAppend, 'utf8');
    console.log('✅ Zaktualizowano rozwazania_baza.md o Dzień 33.');
  } else {
    console.log('ℹ️ rozwazania_baza.md zawiera już Dzień 33.');
  }
}

// 3. Aktualizacja rozwazania_baza.json
const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
let bazaList = [];
if (fs.existsSync(jsonBazaPath)) {
  bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));
}
if (!bazaList.some(item => item.day === 33 && item.date === DATE_STR)) {
  bazaList.unshift({
    day: DAY_NUM,
    date: DATE_STR,
    dateFormatted: DATE_FORMATTED,
    title: `☀️ Z Biblią za Pan Brat — Dzień 33: Z wód Nilu do pustyni Madian — Ocalenie Mojżesza, czas próby i Boża pamięć o przymierzu`,
    book: BOOK,
    reading: READING,
    memoryVerse: MEMORY_VERSE,
    theme: THEME,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    imageUrl: `/images/academy/daily/kc_day_33_ocalenie_mojzesza_nil_madian.jpg`
  });
  fs.writeFileSync(jsonBazaPath, JSON.stringify(bazaList, null, 2), 'utf8');
  console.log('✅ Zaktualizowano rozwazania_baza.json w ROOT.');

  // Lustro w LUMINA
  const luminaJson = path.join(LUMINA_ROOT, 'rozwazania_baza.json');
  if (fs.existsSync(path.dirname(luminaJson))) {
    fs.writeFileSync(luminaJson, JSON.stringify(bazaList, null, 2), 'utf8');
    console.log('✅ Zsynchronizowano rozwazania_baza.json do LUMINA.');
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
  }, 'cudaApp');

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;
  const docData = {
    date: DATE_STR,
    dayOfWeek: 'Poniedziałek',
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 33: Z wód Nilu do pustyni Madian — Ocalenie Mojżesza, czas próby i Boża pamięć o przymierzu`,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    book: BOOK,
    reading: READING,
    memoryVerse: MEMORY_VERSE,
    imageUrl: `https://polskieradio.cc/images/academy/daily/kc_day_33_ocalenie_mojzesza_nil_madian.jpg`,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('reflections').doc(docId).set(docData, { merge: true });
  console.log(`✅ Opublikowano w cuda-398c0 / reflections: ${docId}`);
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
  }, 'mcApp');

  const db = mcApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  const morningData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 33: Z wód Nilu do pustyni Madian — Ocalenie Mojżesza, czas próby i Boża pamięć o przymierzu`,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    book: BOOK,
    reading: READING,
    imageUrl: `https://polskieradio.cc/images/academy/daily/kc_day_33_ocalenie_mojzesza_nil_madian.jpg`,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const webData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: `☀️ Z Biblią za Pan Brat — Dzień 33: Z wód Nilu do pustyni Madian — Ocalenie Mojżesza, czas próby i Boża pamięć o przymierzu`,
    content: contentWeb,
    contentWeb: contentWeb,
    book: BOOK,
    reading: READING,
    imageUrl: `https://polskieradio.cc/images/academy/daily/kc_day_33_ocalenie_mojzesza_nil_madian.jpg`,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('morning_inspirations').doc(docId).set(morningData, { merge: true });
  await db.collection('web_inspirations').doc(docId).set(webData, { merge: true });
  console.log(`✅ Opublikowano w cc-mission-control (morning & web): ${docId}`);

  // Kolejkowanie priorytetowe dla Grupy Nazira (3 wiadomości)
  const nazirGroupId = '120363409279454206@g.us';
  const nazirCommands = [
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `☀️ *PORANNA WERSJA APLIKACYJNA TTS (Dzień 33)*\n\n${contentApp}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day33_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `📖 *WERSJA NA CAŁY DZIEŃ WWW (Dzień 33)*\n\n${contentWeb}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day33_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      message: `🌙 *WIECZORNA WERSJA SMS (Dzień 33)*\n\n${contentSms}`,
      priority: 'high',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day33_publisher'
    }
  ];

  for (const cmd of nazirCommands) {
    await db.collection('CommandQueue').add(cmd);
  }
  console.log('✅ Zakolejkowano 3 priorytetowe wiadomości dla Grupy Nazira w CommandQueue.');

  await mcApp.delete();
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log('🎉 Faza 1 (bazy i Firebase) zakończona pełnym sukcesem!');
}

main().catch(console.error);
