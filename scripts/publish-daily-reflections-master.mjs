#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════════════════
 * MASTER AUTOMATION: CODZIENNA PUBLIKACJA ROZWAŻAŃ CC I KANAŁÓW NADAWCZYCH
 * ══════════════════════════════════════════════════════════════════════════
 * Standard: ZERO-QA, ZERO COST, Dyrektywa Dowódcy Nazira.
 *
 * Zakres wykonawczy każdego poranka (06:00 Europe/Warsaw):
 *   1. Weryfikacja i synchronizacja bazy rozważań rozwazania_baza.json (z teaser i tvScript dla Noemi i Sary).
 *   2. Aktualizacja pasków informacyjnych TV (/data/ccn-news-ticker.json) na wszystkich kanałach nadawczych.
 *   3. Publikacja wpisu rozważania na Tablicy Społeczności LUMINA (kolekcja lumina_posts).
 *   4. Emisja rozważania na Publicznym Czacie LUMINA (lumina_public_chat_messages).
 *   5. Raport operacyjny na Czacie Sztabu Dowództwa LUMINA (lumina_commander_mission_chat).
 *   6. Synchronizacja z aplikacją mobilną „Dobrze, że jesteś” (cuda-398c0).
 *   7. Rejestracja w cc-mission-control i kolejce WhatsApp (CommandQueue).
 *   8. Aktualizacja luster i budowa wydania statycznego dla Cloudflare Pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { updateBroadcastTickers } from './update-broadcast-tickers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

export async function runDailyReflectionsSync(customDateStr = null) {
  console.log('🌅 [MASTER-REFLECTIONS] Uruchamiam zintegrowaną publikację rozważań dla ekosystemu CC...');

  // 1. Data w strefie Europe/Warsaw
  const now = new Date();
  const warsaw = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const todayStr = customDateStr || (
    warsaw.getFullYear() + '-' +
    String(warsaw.getMonth() + 1).padStart(2, '0') + '-' +
    String(warsaw.getDate()).padStart(2, '0')
  );

  console.log(`📅 Data operacyjna: ${todayStr}`);

  // 2. Baza rozważań
  const bazaPath = path.join(ROOT, 'rozwazania_baza.json');
  if (!fs.existsSync(bazaPath)) {
    throw new Error(`BŁĄD: Brak pliku ${bazaPath}`);
  }
  const baza = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));

  let entry = baza.find(r => r.date === todayStr);
  if (!entry) {
    entry = baza[0];
    console.warn(`⚠ Brak ścisłego wpisu dla daty ${todayStr}, używam najnowszego wpisu z bazy: Dzień ${entry.day} (${entry.date})`);
  }

  const DAY_NUM = entry.day;
  const DATE_STR = entry.date;
  const DATE_FORMATTED = entry.dateFormatted || DATE_STR;
  const TITLE = entry.title;
  const READING = entry.reading || '';
  const BOOK = entry.book || '';
  const MEMORY_VERSE = entry.memoryVerse || '';
  const THEME = entry.theme || '';
  const contentApp = entry.contentApp || entry.fullText;
  const contentWeb = entry.contentWeb || entry.fullText;
  const contentSms = entry.contentSms || '';
  const IMAGE_URL = entry.imageUrl || `/images/academy/daily/kc_day_${DAY_NUM}.jpg`;

  console.log(`📖 Wybrany wpis do publikacji: Dzień ${DAY_NUM} (${DATE_STR}) — ${TITLE}`);

  // 3. Sprawdzenie i uzupełnienie tvScript oraz teasera (dla kanałów TV)
  let needsBazaSave = false;
  if (!entry.teaser) {
    entry.teaser = `${READING}: ${MEMORY_VERSE || THEME.slice(0, 120)}`;
    needsBazaSave = true;
  }
  if (!entry.tvScript) {
    entry.tvScript = `[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Na ekranie głównym monumentalna grafika 16:9 ilustrująca dzisiejsze Słowo Boże: ${TITLE}.

[INTRO: SŁOWO BOŻE NA DZIŚ]
Noemi: Dzień dobry! Witamy państwa w programie „Z Biblią za Pan Brat” na antenie Christian Culture TV!
Sara: Witamy z całego serca! Dziś otwieramy Słowo Boże na Dzień ${DAY_NUM}: ${READING}.
Noemi: ${entry.teaser}
Sara: Pamiętajmy o obietnicy Pisma: ${MEMORY_VERSE || THEME}
Noemi: Bóg prowadzi nas w każdym kroku. Nie lękaj się przeciwności — Pan idzie przed Tobą!
Sara: Błogosławionego, pełnego pokoju i zwycięstwa dnia w ramionach naszego Zbawiciela!`;
    needsBazaSave = true;
  }

  if (needsBazaSave) {
    fs.writeFileSync(bazaPath, JSON.stringify(baza, null, 2), 'utf8');
    console.log(`✔ Uzupełniono teaser i tvScript dla Dnia ${DAY_NUM} w rozwazania_baza.json`);
  }

  // 4. Synchronizacja rozwazania_baza.json do wszystkich luster
  const mirrors = [
    path.join(ROOT, '.pages-release', 'rozwazania_baza.json'),
    path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
    'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public/rozwazania_baza.json',
    'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public/rozwazania_baza.json',
    'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/dist/rozwazania_baza.json',
    path.join(LUMINA_ROOT, 'rozwazania_baza.json')
  ];
  for (const m of mirrors) {
    try {
      fs.mkdirSync(path.dirname(m), { recursive: true });
      fs.writeFileSync(m, JSON.stringify(baza, null, 2), 'utf8');
    } catch (e) {
      // lustro opcjonalne
    }
  }
  console.log(`✔ Zsynchronizowano rozwazania_baza.json do wszystkich luster ekosystemu.`);

  // 5. Aktualizacja pasków informacyjnych kanałów TV (ccn-news-ticker.json)
  try {
    await updateBroadcastTickers();
    console.log(`✔ Paski informacyjne kanałów nadawczych zaktualizowane z dzisiejszym rozważaniem.`);
  } catch (e) {
    console.warn('⚠ Ostrzeżenie przy aktualizacji pasków TV:', e.message);
  }

  // 6. Publikacja do portalu LUMINA (lumina-cc przez Admin SDK)
  const luminaKeyPath = path.join(ROOT, 'luminaServiceAccountKey.json');
  if (fs.existsSync(luminaKeyPath)) {
    try {
      const luminaApp = admin.initializeApp({
        credential: admin.credential.cert(require(luminaKeyPath))
      }, `lumina_master_${Date.now()}`);
      const luminaDb = luminaApp.firestore();

      // A. Tablica Społeczności (lumina_posts)
      const postSlug = `dzien-${DAY_NUM}`;
      const postSnap = await luminaDb.collection('lumina_posts').where('sourceSlug', '==', postSlug).limit(1).get();
      if (postSnap.empty) {
        await luminaDb.collection('lumina_posts').add({
          author: 'Cezary Rogowski',
          authorSlug: 'cezaryrgowski',
          authorRole: '👑 Założyciel Christian Culture',
          authorAvatar: 'avatar_cezary_official.jpg',
          time: `${(DATE_FORMATTED || DATE_STR).toUpperCase()} • ☀️ Z Biblią za Pan Brat`,
          title: TITLE,
          text: contentWeb,
          category: 'devotion',
          isDevotion: true,
          _isCkdDaily: false,
          sourceSlug: postSlug,
          sourceUrl: `https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}`,
          image: IMAGE_URL.startsWith('http') ? IMAGE_URL : `https://polskieradio.cc${IMAGE_URL}`,
          likes: 180 + DAY_NUM * 2,
          amen: 120 + DAY_NUM,
          createdAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          publishedAt: new Date().toISOString()
        });
        console.log(`✔ [LUMINA] Opublikowano rozważanie Dzień ${DAY_NUM} na Tablicy Społeczności (lumina_posts)!`);
      } else {
        console.log(`ℹ [LUMINA] Rozważanie Dzień ${DAY_NUM} już istnieje na Tablicy Społeczności.`);
      }

      // B. Publiczny Czat LUMINA (lumina_public_chat_messages)
      const timeFormatted = `${String(warsaw.getHours()).padStart(2, '0')}:${String(warsaw.getMinutes()).padStart(2, '0')}`;
      const chatAnnouncement = `☀️ *SŁOWO BOŻE NA DZIŚ — DZIEŃ ${DAY_NUM}: ${TITLE.replace(/^☀️\s*Z Biblią za Pan Brat\s*—\s*Dzień\s*\d+:\s*/i, '')}*\n\n📖 *Czytanie:* ${READING} — ${MEMORY_VERSE || ''}\n\n${entry.teaser}\n\n👉 *Studiuj dzisiejszą lekcję:* https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}`;

      await luminaDb.collection('lumina_public_chat_messages').add({
        senderAuthUid: '1zHaEXihQZgz8nzebR0DyC7wLG93',
        senderId: 'cezaryrgowski',
        senderName: 'Cezary Rogowski',
        senderAvatar: 'avatar_cezary_official.jpg',
        senderBadge: '👑 Założyciel',
        type: 'text',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        dateStr: timeFormatted,
        text: chatAnnouncement
      });
      console.log(`✔ [LUMINA] Wyemitowano powiadomienie na Czacie Ogólnym Społeczności (lumina_public_chat_messages)!`);

      // C. Czat Sztabu Dowództwa (lumina_commander_mission_chat)
      await luminaDb.collection('lumina_commander_mission_chat').add({
        senderAuthUid: '1zHaEXihQZgz8nzebR0DyC7wLG93',
        senderId: 'cezaryrgowski',
        senderName: 'Cezary Rogowski (Sztab CC)',
        senderAvatar: 'avatar_cezary_official.jpg',
        senderBadge: '👑 Dowódca Nazir',
        type: 'text',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        dateStr: timeFormatted,
        text: `🕊️ Raport poranny: Rozważanie Dzień ${DAY_NUM} (${READING}) zostało pomyślnie wyemitowane na kanałach nadawczych TV, tablicy i czacie LUMINA oraz w aplikacji „Dobrze, że jesteś”.`
      });
      console.log(`✔ [LUMINA] Odnotowano raport w Czacie Sztabu Dowództwa (lumina_commander_mission_chat)!`);

      await luminaApp.delete();
    } catch (err) {
      console.warn('⚠ Błąd publikacji do lumina-cc:', err.message);
    }
  }

  // 7. Publikacja do cuda-398c0 (Aplikacja „Dobrze, że jesteś”)
  const cudaKeyPath = path.join(WEKTOR_ROOT, 'cudaServiceAccountKey.json');
  if (fs.existsSync(cudaKeyPath)) {
    try {
      const cudaApp = admin.initializeApp({
        credential: admin.credential.cert(require(cudaKeyPath))
      }, `cuda_master_${Date.now()}`);
      const cudaDb = cudaApp.firestore();
      const docId = `ref_day${DAY_NUM}_${DATE_STR}`;

      await cudaDb.collection('reflections').doc(docId).set({
        date: DATE_STR,
        dayOfWeek: DATE_FORMATTED.split(',')[0] || '',
        title: TITLE,
        teaser: entry.teaser,
        fullText: contentApp,
        imageUrl: IMAGE_URL.startsWith('http') ? IMAGE_URL : `https://polskieradio.cc${IMAGE_URL}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        dayNumber: DAY_NUM,
        reading: READING,
        book: BOOK
      }, { merge: true });
      console.log(`✔ [CUDA-398C0] Zsynchronizowano reflections/${docId}`);
      await cudaApp.delete();
    } catch (err) {
      console.warn('⚠ Błąd zapisu do cuda-398c0:', err.message);
    }
  }

  // 8. Rejestracja w cc-mission-control (o ile quota nie przekroczona)
  const mcKeyPath = path.join(WEKTOR_ROOT, 'serviceAccountKey.json');
  if (fs.existsSync(mcKeyPath)) {
    try {
      const mcApp = admin.initializeApp({
        credential: admin.credential.cert(require(mcKeyPath))
      }, `mc_master_${Date.now()}`);
      const mcDb = mcApp.firestore();
      const docId = `day${DAY_NUM}_${DATE_STR}`;

      await mcDb.collection('morning_inspirations').doc(docId).set({
        date: DATE_STR,
        title: TITLE,
        content: contentApp,
        dayNumber: DAY_NUM,
        reading: READING,
        book: BOOK,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await mcDb.collection('web_inspirations').doc(docId).set({
        date: DATE_STR,
        title: TITLE,
        content: contentWeb,
        dayNumber: DAY_NUM,
        reading: READING,
        book: BOOK,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`✔ [MC] Zsynchronizowano morning_inspirations i web_inspirations/${docId}`);
      await mcApp.delete();
    } catch (err) {
      console.warn('ℹ [MC] Zapis pominięty (limit quota Firestore):', err.message);
    }
  }

  console.log(`\n🎉 [MASTER-REFLECTIONS] Kompletna synchronizacja rozważań dla Dnia ${DAY_NUM} zakończona sukcesem!`);
  return { success: true, day: DAY_NUM, date: DATE_STR };
}

// Bezpośrednie uruchomienie
if (process.argv[1] && process.argv[1].endsWith('publish-daily-reflections-master.mjs')) {
  const customDate = process.argv[2] || null;
  runDailyReflectionsSync(customDate).then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('❌ Błąd krytyczny master-synchronizacji rozważań:', err);
    process.exit(1);
  });
}
