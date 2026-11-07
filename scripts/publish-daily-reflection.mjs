import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

// Parsowanie argumentów (--day NN, --date YYYY-MM-DD)
const args = process.argv.slice(2);
let targetDay = null;
let targetDate = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--day' && args[i + 1]) targetDay = parseInt(args[i + 1], 10);
  if (args[i] === '--date' && args[i + 1]) targetDate = args[i + 1];
}

// Domyślnie bierzemy dzisiejszą datę w formacie Europe/Warsaw
if (!targetDate) {
  const now = new Date();
  const warsawTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const yyyy = warsawTime.getFullYear();
  const mm = String(warsawTime.getMonth() + 1).padStart(2, '0');
  const dd = String(warsawTime.getDate()).padStart(2, '0');
  targetDate = `${yyyy}-${mm}-${dd}`;
}

console.log(`\n🚀 [UNIVERSAL-PUBLISHER] Rozpoczynam poranną publikację rozważań dla daty: ${targetDate} (Dzień: ${targetDay || 'auto'})...`);

// Wczytanie centralnej bazy rozważań
const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
if (!fs.existsSync(jsonBazaPath)) {
  throw new Error(`BŁĄD: Brak pliku bazy ${jsonBazaPath}`);
}
const bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));

// Wyszukanie wpisu
let entry = null;
if (targetDay) {
  entry = bazaList.find(item => item.day === targetDay);
}
if (!entry) {
  entry = bazaList.find(item => item.date === targetDate);
}
if (!entry) {
  entry = bazaList[0]; // Pierwszy najnowszy wpis jako fallback
  console.log(`ℹ Brak ścisłego dopasowania daty ${targetDate}, używam najnowszego wpisu z bazy: Dzień ${entry.day} (${entry.date})`);
}

const DAY_NUM = entry.day;
const DATE_STR = entry.date;
const DATE_FORMATTED = entry.dateFormatted || DATE_STR;
const TITLE = entry.title;
const SUBTITLE = entry.teaser || entry.theme || '';
const READING = entry.reading || '';
const BOOK = entry.book || '';
const IMAGE_URL = entry.imageUrl || `/images/academy/daily/kc_day_${DAY_NUM}.jpg`;
const contentApp = entry.contentApp;
const contentWeb = entry.contentWeb;
const contentSms = entry.contentSms;

if (!contentApp || !contentWeb) {
  throw new Error(`BŁĄD: Wpis dla Dnia ${DAY_NUM} nie posiada pełnej treści (contentApp/contentWeb)!`);
}

console.log(`📖 Wybrany wpis: Dzień ${DAY_NUM} (${DATE_STR}) — ${TITLE}`);

// 1. Synchronizacja rozwazania_baza.json do mirrorów
const mirrors = [
  path.join(ROOT, '.pages-release', 'rozwazania_baza.json'),
  path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
  path.join(LUMINA_ROOT, 'rozwazania_baza.json'),
];
for (const m of mirrors) {
  try {
    fs.mkdirSync(path.dirname(m), { recursive: true });
    fs.writeFileSync(m, JSON.stringify(bazaList, null, 2), 'utf8');
    console.log(`✔ Zsynchronizowano mirror: ${m}`);
  } catch (e) {
    // mirror opcjonalny
  }
}

// 2. Firebase cuda-398c0 (Aplikacja „Dobrze, że jesteś”)
async function publishCuda() {
  const cudaKeyPath = path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json');
  if (!fs.existsSync(cudaKeyPath)) {
    console.warn('⚠ Brak klucza cudaServiceAccountKey.json — pomijam zapis do cuda-398c0');
    return;
  }
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(cudaKeyPath))
  }, `cuda_${Date.now()}`);

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  await db.collection('reflections').doc(docId).set({
    date: DATE_STR,
    dayOfWeek: DATE_FORMATTED.split(',')[0] || '',
    title: TITLE,
    teaser: SUBTITLE,
    fullText: contentApp,
    imageUrl: IMAGE_URL.startsWith('http') ? IMAGE_URL : `https://polskieradio.cc${IMAGE_URL}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    dayNumber: DAY_NUM,
    reading: READING,
    book: BOOK
  });
  console.log(`✔ [CUDA-398C0] Opublikowano dokument reflections/${docId}`);
  await cudaApp.delete();
}

// 3. Firebase cc-mission-control (Rozważania TTS/WWW + kolejki WhatsApp)
async function publishMissionControl() {
  const mcKeyPath = path.join(WEKTOR_ROOT, 'serviceAccountKey.json');
  if (!fs.existsSync(mcKeyPath)) {
    console.warn('⚠ Brak klucza serviceAccountKey.json — pomijam zapis do cc-mission-control');
    return;
  }

  try {
    const mcApp = admin.initializeApp({
      credential: admin.credential.cert(require(mcKeyPath))
    }, `mc_${Date.now()}`);

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
    console.log(`✔ [MC] Opublikowano morning_inspirations/${docId}`);

    await db.collection('web_inspirations').doc(docId).set({
      date: DATE_STR,
      title: TITLE,
      content: contentWeb,
      dayNumber: DAY_NUM,
      reading: READING,
      book: BOOK,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✔ [MC] Opublikowano web_inspirations/${docId}`);

    // WhatsApp CommandQueue
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
        source: 'auto_universal_publisher'
      },
      {
        action: 'send_whatsapp_message',
        chatId: nazirGroupId,
        command: `wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`,
        message: `🌐 *WERSJA NA CAŁY DZIEŃ WWW (Dzień ${DAY_NUM})*\n\n${contentWeb}`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_universal_publisher'
      },
      {
        action: 'send_whatsapp_message',
        chatId: nazirGroupId,
        command: `wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms || ''}`,
        message: `🌙 *WIECZORNA WERSJA SMS (Dzień ${DAY_NUM})*\n\n${contentSms || ''}`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_universal_publisher'
      }
    ];

    for (const cmd of nazirCommands) {
      await db.collection('CommandQueue').add(cmd);
    }
    console.log('✔ [MC] Zakolejkowano 3 priorytety dla Grupy Nazira w CommandQueue.');

    if (contentSms) {
      await db.collection('CommandQueue').add({
        action: 'send_whatsapp_message',
        chatId: bartekTarget,
        command: `wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
        message: `☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_universal_publisher'
      });
      console.log('✔ [MC] Zakolejkowano wersję SMS dla Bartka.');
    }

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
        source: 'auto_universal_publisher'
      });
      console.log(`✔ [MC] Zakolejkowano wersję WWW dla grupy FIFO (${group.name}).`);
    }

    await mcApp.delete();
  } catch (err) {
    console.error('⚠ [MC] Błąd Firestore (quota/sieć):', err.message);
  }

  // 4. Zapasowa kolejka Cloudflare D1
  try {
    const mc = require(path.join(WEKTOR_ROOT, 'mc_d1_client'));
    const nazirGroupId = '120363403565056716@g.us';
    const bartekTarget = '48509370007@c.us';
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`, nazirGroupId, 9, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`, nazirGroupId, 8, DAY_NUM);
    if (contentSms) {
      await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`, nazirGroupId, 7, DAY_NUM);
      await mc.pushCommand(`wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}`, bartekTarget, 6, DAY_NUM);
    }
    console.log('✔ [D1] Zapasowo zakolejkowano do Cloudflare D1.');
  } catch (e) {
    console.warn('ℹ mc_d1_client:', e.message);
  }
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log(`\n🎉 [UNIVERSAL-PUBLISHER] Zakończono publikację Dnia ${DAY_NUM} (${DATE_STR})!`);
}

main().catch(err => {
  console.error('❌ Błąd krytyczny uniwersalnego publikatora:', err);
  process.exit(1);
});
