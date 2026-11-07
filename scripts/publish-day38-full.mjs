import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('\n🚀 Rozpoczynam poranną publikację pełnego pakietu dla Dnia 38 (Wj 7:1–25)...');

const DAY_NUM = 38;
const DATE_STR = '2026-11-07';
const DATE_FORMATTED = 'Sobota, 7 listopada 2026 r.';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 7:1–25';
const TITLE = '☀️ Z Biblią za Pan Brat — Dzień 38: Laska, która połknęła węże, i woda zamieniona w krew';
const SUBTITLE = 'Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek i uderzenie w święty Nil';
const MEMORY_VERSE = '„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.” (Wj 7:17, UBG)';
const THEME = 'Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich oraz zatwardziałym sercem faraona. Przemiana laski w węża połykającego laski czarowników oraz uderzenie w Nil dowodzą, że pozorna siła demonicznych iluzji jest bezsilna wobec suwerennego Stwórcy, a sąd nad rzeką Egiptu zapowiada ostateczne zwycięstwo łaski i odkupienia w Chrystusie.';
const IMAGE_URL = '/images/academy/daily/kc_day_38_laska_woda_w_krew_nil.jpg';

// Read pakiet content
const pakietContent = fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day38-5wersji.md'), 'utf8');

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
  if (!currentMd.includes('Dzień 38 (7 listopada 2026)')) {
    fs.appendFileSync(mdBazaPath, `\n\n## Dzień 38 (7 listopada 2026): Laska, która połknęła węże, i woda zamieniona w krew (Wj 7:1–25)\n\n` + pakietContent, 'utf8');
    console.log('✔ Zaktualizowano rozwazania_baza.md o Dzień 38.');
  } else {
    console.log('ℹ rozwazania_baza.md zawiera już Dzień 38.');
  }
}

// 2. Firebase cuda-398c0
async function publishCuda() {
  const cudaApp = admin.initializeApp({
    credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json')))
  }, 'cuda38_' + Date.now());

  const db = cudaApp.firestore();
  const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

  await db.collection('reflections').doc(docId).set({
    date: DATE_STR,
    dayOfWeek: 'SOBOTA',
    title: TITLE,
    teaser: SUBTITLE,
    fullText: contentApp,
    contentApp: contentApp,
    contentWeb: contentWeb,
    contentSms: contentSms,
    imageUrl: `https://polskieradio.cc${IMAGE_URL}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    dayNumber: DAY_NUM,
    reading: READING,
    book: BOOK
  }, { merge: true });
  console.log(`✔ Opublikowano do cuda-398c0/reflections/${docId}`);
  await cudaApp.delete();
}

// 3. Firebase cc-mission-control + CommandQueue + Cloudflare D1
async function publishMissionControl() {
  const nazirGroupId = '120363403565056716@g.us';
  const bartekTarget = '48509370007@c.us';

  // A. Próba zapisu do Firestore cc-mission-control
  try {
    const mcApp = admin.initializeApp({
      credential: admin.credential.cert(require(path.join(WEKTOR_ROOT, 'serviceAccountKey.json')))
    }, 'mc38_' + Date.now());

    const db = mcApp.firestore();
    const docIdRef = `ref_day${DAY_NUM}_${DATE_STR}`;
    const docIdShort = `day${DAY_NUM}_${DATE_STR}`;

    for (const docId of [docIdRef, docIdShort]) {
      await db.collection('morning_inspirations').doc(docId).set({
        date: DATE_STR,
        dayNumber: DAY_NUM,
        title: TITLE,
        teaser: SUBTITLE,
        fullText: contentApp,
        contentApp: contentApp,
        contentWeb: contentWeb,
        contentSms: contentSms,
        imageUrl: `https://polskieradio.cc${IMAGE_URL}`,
        reading: READING,
        book: BOOK,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await db.collection('web_inspirations').doc(docId).set({
        date: DATE_STR,
        dayNumber: DAY_NUM,
        title: TITLE,
        teaser: SUBTITLE,
        fullText: contentWeb,
        contentWeb: contentWeb,
        content: contentWeb,
        contentSms: contentSms,
        imageUrl: `https://polskieradio.cc${IMAGE_URL}`,
        reading: READING,
        book: BOOK,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    console.log(`✔ Opublikowano do cc-mission-control morning_inspirations & web_inspirations (${docIdRef})`);

    // WhatsApp Firestore Queue
    const nazirCommands = [
      {
        action: 'send_whatsapp_message',
        chatId: nazirGroupId,
        command: `wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`,
        message: `📖 *WERSJA PORANNA TTS (Dzień ${DAY_NUM})*\n\n${contentApp}`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_day38_publisher'
      },
      {
        action: 'send_whatsapp_message',
        chatId: nazirGroupId,
        command: `wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`,
        message: `🌐 *WERSJA NA CAŁY DZIEŃ WWW (Dzień ${DAY_NUM})*\n\n${contentWeb}`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_day38_publisher'
      },
      {
        action: 'send_whatsapp_message',
        chatId: nazirGroupId,
        command: `wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`,
        message: `🌙 *WIECZORNA WERSJA SMS (Dzień ${DAY_NUM})*\n\n${contentSms}`,
        priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'auto_day38_publisher'
      }
    ];

    for (const cmd of nazirCommands) {
      await db.collection('CommandQueue').add(cmd);
    }
    console.log('✔ Zakolejkowano 3 priorytetowe wiadomości dla Grupy Nazira w Firestore CommandQueue.');

    await db.collection('CommandQueue').add({
      action: 'send_whatsapp_message',
      chatId: bartekTarget,
      command: `wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
      message: `☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}\n\n_Christian Culture_`,
      priority: 'high', status: 'pending', date: DATE_STR, dayNumber: DAY_NUM,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'auto_day38_publisher'
    });
    console.log('✔ Zakolejkowano wersję SMS dla Bartka w Firestore CommandQueue.');

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
        source: 'auto_day38_publisher'
      });
      console.log(`✔ Zakolejkowano wersję WWW dla grupy FIFO (${group.name}) w Firestore CommandQueue.`);
    }

    await mcApp.delete();
  } catch (err) {
    console.warn('ℹ Informacja Firestore Mission Control:', err.message);
  }

  // B. Cloudflare D1 & Local Queue (Gwarantowane kolejkowanie bez limitów Firestore)
  try {
    const mc = require(path.join(WEKTOR_ROOT, 'mc_d1_client'));
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 📖 *1. ROZWAŻANIE PORANNE (TTS)* — Dzień ${DAY_NUM}\n\n${contentApp}`, nazirGroupId, 9, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: ☀️ *2. ROZWAŻANIE NA CAŁY DZIEŃ (WWW)* — Dzień ${DAY_NUM}\n\n${contentWeb}`, nazirGroupId, 8, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${nazirGroupId}]: 🌙 *3. ROZWAŻANIE WIECZORNE (SMS)* — Dzień ${DAY_NUM}\n\n${contentSms}`, nazirGroupId, 7, DAY_NUM);
    await mc.pushCommand(`wyślij celowane [${bartekTarget}]: ☀️ *Rozważanie SMS — Dzień ${DAY_NUM} (${READING}):*\n\n${contentSms}`, bartekTarget, 6, DAY_NUM);
    console.log('✔ Gwarantowane zakolejkowanie WhatsApp w Cloudflare D1 / Local Queue ukończone.');
  } catch (e) {
    console.warn('ℹ mc_d1_client warning:', e.message);
  }
}

async function main() {
  await publishCuda();
  await publishMissionControl();
  console.log('\n🎉 Publikacja Dnia 38 — Firebase + WhatsApp zakończona sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd krytyczny:', err);
  process.exit(1);
});
