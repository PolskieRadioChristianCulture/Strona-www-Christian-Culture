import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🚀 Rozpoczynam poranną publikację pełnego pakietu dla Dnia 35 (Wj 4:1–31)...');

const DAY_NUM = 35;
const DATE_STR = '2026-11-04';
const DATE_FORMATTED = 'Środa, 4 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 4:1–31';
const TITLE = '☀️ Z Biblią za Pan Brat — Dzień 35: Znaki wiary, powołanie i powrót do Egiptu — Boża moc w ludzkiej słabości';
const SUBTITLE = 'Trzy znaki pod Horebem, dialog o powołaniu, Aaron rzecznikiem i Boża moc w ludzkiej słabości';
const MEMORY_VERSE = '„I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.” (Wj 4:11–12, UBG)';
const THEME = 'Czwarty rozdział Księgi Wyjścia ukazuje zmaganie człowieka z powołaniem oraz suwerenność Boga, który odpowiada na ludzkie lęki znakami łaski, posyła pomocnika i wzywa do bezkompromisowej wierności przymierzu. Bóg nie szuka ludzkiej elokwencji, lecz posłusznego serca.';
const IMAGE_URL = 'https://polskieradio.cc/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg';
const LOCAL_IMAGE_URL = '/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg';

const pakietContent = fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day35-5wersji.md'), 'utf8');

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
  throw new Error('Błąd: nie udało się wyodrębnić wszystkich wersji treści z pakiet-day35-5wersji.md!');
}

// 1. Aktualizacja rozwazania_baza.md w Wektor1_VideoFactory
const mdBazaPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdBazaPath)) {
  const currentMd = fs.readFileSync(mdBazaPath, 'utf8');
  if (!currentMd.includes('Dzień 35 (4 listopada 2026)')) {
    const mdAppend = `\n\n## Dzień 35 (4 listopada 2026): Znaki wiary, powołanie i powrót do Egiptu — Boża moc w ludzkiej słabości (Wj 4:1–31)\n\n` + pakietContent;
    fs.appendFileSync(mdBazaPath, mdAppend, 'utf8');
    console.log('✔ Zaktualizowano rozwazania_baza.md o Dzień 35.');
  } else {
    console.log('ℹ rozwazania_baza.md zawiera już Dzień 35.');
  }
}

// 2. Synchronizacja rozwazania_baza.json we wszystkich mirrorach ekosystemu
const jsonBazaPath = path.join(ROOT, 'rozwazania_baza.json');
let bazaList = [];
if (fs.existsSync(jsonBazaPath)) {
  bazaList = JSON.parse(fs.readFileSync(jsonBazaPath, 'utf8'));
}

const day35Item = {
  day: DAY_NUM,
  date: DATE_STR,
  dateFormatted: DATE_FORMATTED,
  title: TITLE,
  book: BOOK,
  reading: READING,
  memoryVerse: MEMORY_VERSE,
  theme: THEME,
  contentApp: contentApp,
  contentWeb: contentWeb,
  contentSms: contentSms,
  imageUrl: LOCAL_IMAGE_URL
};

// Upewnij się, że Day 35 jest na początku w ROOT
bazaList = bazaList.filter(item => !(item.day === DAY_NUM && item.date === DATE_STR));
bazaList.unshift(day35Item);
fs.writeFileSync(jsonBazaPath, JSON.stringify(bazaList, null, 2), 'utf8');
console.log(`✔ Zaktualizowano rozwazania_baza.json w ROOT (pozycji: ${bazaList.length}).`);

// Lista mirrorów do synchronizacji
const jsonMirrors = [
  path.join(ROOT, '.pages-release/rozwazania_baza.json'),
  path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
  'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
  'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
  path.join(LUMINA_ROOT, 'rozwazania_baza.json')
];

for (const mirrorPath of jsonMirrors) {
  try {
    if (fs.existsSync(path.dirname(mirrorPath))) {
      fs.writeFileSync(mirrorPath, JSON.stringify(bazaList, null, 2), 'utf8');
      console.log(`✔ Zsynchronizowano rozwazania_baza.json do: ${mirrorPath}`);
    } else {
      console.log(`ℹ Pominięto (katalog nie istnieje): ${mirrorPath}`);
    }
  } catch (err) {
    console.error(`❌ Błąd zapisu do ${mirrorPath}:`, err.message);
  }
}

// 3. Publikacja w Firestore: cuda-398c0 (Dobrze, że jesteś)
async function publishCuda() {
  const cudaKeyPath = path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json');
  if (!fs.existsSync(cudaKeyPath)) {
    console.error('❌ Brak klucza cudaServiceAccountKey.json');
    return;
  }
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(cudaKeyPath))
  }, 'cudaApp35');

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;
  const docData = {
    date: DATE_STR,
    dayOfWeek: 'Środa',
    dayNumber: DAY_NUM,
    title: TITLE,
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

// 4. Publikacja w Firestore: cc-mission-control (morning_inspirations, web_inspirations, CommandQueue)
async function publishMissionControl() {
  const mcKeyPath = path.join(WEKTOR_ROOT, 'serviceAccountKey.json');
  if (!fs.existsSync(mcKeyPath)) {
    console.error('❌ Brak klucza serviceAccountKey.json');
    return;
  }
  const mcApp = admin.initializeApp({
    credential: admin.credential.cert(require(mcKeyPath))
  }, 'mcApp35');

  const db = mcApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  const morningData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: TITLE,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    book: BOOK,
    reading: READING,
    imageUrl: IMAGE_URL,
    published: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const webData = {
    date: DATE_STR,
    dayNumber: DAY_NUM,
    title: TITLE,
    content: contentWeb,
    contentWeb: contentWeb,
    book: BOOK,
    reading: READING,
    imageUrl: IMAGE_URL,
    published: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('morning_inspirations').doc(docId).set(morningData, { merge: true });
  await db.collection('web_inspirations').doc(docId).set(webData, { merge: true });
  console.log(`✔ Opublikowano w cc-mission-control (morning & web): ${docId}`);

  // 5. Poranna dystrybucja WhatsApp (CommandQueue)
  const nazirGroupId = '120363409279454206@g.us';
  const bartekTarget = '48730948823@c.us';

  // Wiadomości priorytetowe dla Grupy Nazira (3 wersje)
  const nazirCommands = [
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`,
      message: `☀️ *PORANNA WERSJA APLIKACYJNA TTS (Dzień ${DAY_NUM})*\n\n${contentApp}`,
      priority: 'high',
      status: 'pending',
      date: DATE_STR,
      dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day35_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`,
      message: `🌐 *WERSJA NA CAŁY DZIEŃ WWW (Dzień ${DAY_NUM})*\n\n${contentWeb}`,
      priority: 'high',
      status: 'pending',
      date: DATE_STR,
      dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day35_publisher'
    },
    {
      action: 'send_whatsapp_message',
      chatId: nazirGroupId,
      command: `wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`,
      message: `🌙 *WIECZORNA WERSJA SMS (Dzień ${DAY_NUM})*\n\n${contentSms}`,
      priority: 'high',
      status: 'pending',
      date: DATE_STR,
      dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day35_publisher'
    }
  ];

  for (const cmd of nazirCommands) {
    await db.collection('CommandQueue').add(cmd);
  }
  console.log('✔ Zakolejkowano 3 priorytetowe wiadomości dla Grupy Nazira w CommandQueue.');

  // Wersja SMS dla Bartka na WhatsApp (zgodnie z harmonogramem 06:00)
  const bartekCommand = {
    action: 'send_whatsapp_message',
    chatId: bartekTarget,
    command: `wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
    message: `☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
    priority: 'high',
    status: 'pending',
    date: DATE_STR,
    dayNumber: DAY_NUM,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'auto_day35_publisher'
  };
  await db.collection('CommandQueue').add(bartekCommand);
  console.log('✔ Zakolejkowano wersję SMS dla Bartka w CommandQueue.');

  // 2 grupy WhatsApp FIFO z wersją WWW (zgodnie z Pancernymi Zasadami CC)
  const supportBlock = `🌿 Możesz wspierać misję Christian Culture\nmodlitwą, udostępniając i polecając nasze treści\noraz poprzez cykliczny dar finansowy 🕊️\nKażde wsparcie pomaga nam docierać z Ewangelią dalej\ni tworzyć przestrzeń wzrostu duchowego dla tysięcy osób ✨🙏\n\nWspieraj Bożą misję:\n👉 https://patronite.pl/osobowoscplus\n\n💳 Nr konta (Bank / Revolut):\n48 2910 0006 0000 0000 0527 2629\n👉 z dopiskiem: „Dar misyjny”\n\n💸 Wsparcie przez bezpieczny link Revolut:\nhttps://revolut.me/christianculture\n\n📲 BLIK:\n537 137 043\n\n🌿 Dziękujemy za Twoje wsparcie, modlitwę i zaufanie.\nRazem budujemy Christian Culture — ku Bożej chwale i dla dobra ludzi 🤍`;
  
  const defaultFifoGroups = [
    { name: "Cuda Każdego Dnia", groupId: "120363024884245648@g.us" },
    { name: "#DobrzeZeJestes", groupId: "120363042188448956@g.us" }
  ];

  for (const group of defaultFifoGroups) {
    const greeting = `Szczęść Boże, zespole ${group.name}! 🕊️\n\n`;
    const fullWaText = greeting + contentWeb + "\n\n_nazir | Christian Culture | www.polskieradio.cc_\n\n" + supportBlock;
    await db.collection('CommandQueue').add({
      action: 'send_whatsapp_message',
      chatId: group.groupId,
      command: `wyślij celowane [${group.groupId}]: ${fullWaText}`,
      message: fullWaText,
      priority: 'normal',
      status: 'pending',
      date: DATE_STR,
      dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day35_publisher'
    });
    console.log(`✔ Zakolejkowano wersję WWW dla grupy FIFO (${group.name}) w CommandQueue.`);
  }

  // Zapasowe kolejkowanie do Cloudflare D1
  try {
    const mc = require(path.join(WEKTOR_ROOT, 'mc_d1_client'));
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`, nazirGroupId, 9, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`, nazirGroupId, 8, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`, nazirGroupId, 7, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}`, bartekTarget, 6, DAY_NUM);
    console.log('✔ Zapasowo zakolejkowano rozkazy do Cloudflare D1 (mc_d1_client).');
  } catch (d1Err) {
    console.warn('ℹ mc_d1_client info/warning:', d1Err.message);
  }

  await mcApp.delete();
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log('🎉 Publikacja Firebase cuda-398c0 i cc-mission-control oraz dystrybucja WhatsApp zakończona sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd krytyczny w publish-day35-full.mjs:', err);
  process.exit(1);
});
