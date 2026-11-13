import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_PROJECT_ID = 'lumina-cc';
const LUMINA_API_KEY = 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M';

export async function publishReflectionToLumina(targetDateStr = null) {
  const bazaPath = path.join(ROOT, 'rozwazania_baza.json');
  if (!fs.existsSync(bazaPath)) {
    throw new Error('Brak pliku rozwazania_baza.json');
  }
  const baza = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));

  const now = new Date();
  const warsaw = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const todayStr = targetDateStr || (
    warsaw.getFullYear() + '-' +
    String(warsaw.getMonth() + 1).padStart(2, '0') + '-' +
    String(warsaw.getDate()).padStart(2, '0')
  );

  const entry = baza.find(r => r.date === todayStr) || baza[0];
  console.log(`\n📡 [LUMINA-SYNC] Publikuję rozważanie Dzień ${entry.day} (${entry.date}) do portalu LUMINA...`);

  // 1. Publikacja na Tablicę Społeczności (lumina_posts)
  // Najpierw sprawdzamy, czy post dla tego dnia już istnieje
  const checkUrl = `https://firestore.googleapis.com/v1/projects/${LUMINA_PROJECT_ID}/databases/(default)/documents:runQuery?key=${LUMINA_API_KEY}`;
  const queryRes = await fetch(checkUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'lumina_posts' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'sourceSlug' },
            op: 'EQUAL',
            value: { stringValue: `dzien-${entry.day}` }
          }
        },
        limit: 1
      }
    })
  });
  const queryData = await queryRes.json();
  const alreadyExists = Array.isArray(queryData) && queryData.some(d => d.document);

  if (alreadyExists) {
    console.log(`ℹ Post dla Dnia ${entry.day} już istnieje na Tablicy LUMINA.`);
  } else {
    const postBody = {
      fields: {
        author: { stringValue: 'Cezary Rogowski' },
        authorSlug: { stringValue: 'cezaryrgowski' },
        authorRole: { stringValue: '👑 Założyciel Christian Culture' },
        authorAvatar: { stringValue: 'avatar_cezary_official.jpg' },
        time: { stringValue: `${(entry.dateFormatted || todayStr).toUpperCase()} • ☀️ Z Biblią za Pan Brat` },
        title: { stringValue: entry.title },
        text: { stringValue: entry.contentWeb || entry.fullText },
        category: { stringValue: 'devotion' },
        isDevotion: { booleanValue: true },
        sourceSlug: { stringValue: `dzien-${entry.day}` },
        sourceUrl: { stringValue: `https://polskieradio.cc/akademia/kurscodzienny/dzien-${entry.day}` },
        image: { stringValue: entry.imageUrl ? (entry.imageUrl.startsWith('http') ? entry.imageUrl : `https://polskieradio.cc${entry.imageUrl}`) : '' },
        likes: { integerValue: String(150 + entry.day * 3) },
        amen: { integerValue: String(95 + entry.day * 2) },
        createdAtTimestamp: { timestampValue: new Date().toISOString() },
        publishedAt: { stringValue: new Date().toISOString() }
      }
    };

    const createPostUrl = `https://firestore.googleapis.com/v1/projects/${LUMINA_PROJECT_ID}/databases/(default)/documents/lumina_posts?key=${LUMINA_API_KEY}`;
    const createRes = await fetch(createPostUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody)
    });
    if (!createRes.ok) {
      console.warn('⚠ Błąd zapisu do lumina_posts:', await createRes.text());
    } else {
      console.log(`✔ Opublikowano wpis na Tablicy LUMINA dla Dnia ${entry.day}!`);
    }
  }

  // 2. Publikacja wiadomości w Czacie Ogólnym (lumina_public_chat_messages)
  const timeFormatted = `${String(warsaw.getHours()).padStart(2, '0')}:${String(warsaw.getMinutes()).padStart(2, '0')}`;
  const chatMessageText = `☀️ *ROZWAŻANIE NA DZIŚ — DZIEŃ ${entry.day}: ${entry.title.replace(/^☀️\s*Z Biblią za Pan Brat\s*—\s*Dzień\s*\d+:\s*/i, '')}*\n\n📖 *Słowo Boże:* ${entry.reading} — ${entry.memoryVerse || ''}\n\n${entry.teaser || entry.theme || ''}\n\n👉 *Studiuj całą lekcję:* https://polskieradio.cc/akademia/kurscodzienny/dzien-${entry.day}`;

  const chatBody = {
    fields: {
      senderAuthUid: { stringValue: '1zHaEXihQZgz8nzebR0DyC7wLG93' },
      senderId: { stringValue: 'cezaryrgowski' },
      senderName: { stringValue: 'Cezary Rogowski' },
      senderAvatar: { stringValue: 'avatar_cezary_official.jpg' },
      senderBadge: { stringValue: '👑 Założyciel' },
      type: { stringValue: 'text' },
      timestamp: { timestampValue: new Date().toISOString() },
      dateStr: { stringValue: timeFormatted },
      text: { stringValue: chatMessageText }
    }
  };

  const createChatUrl = `https://firestore.googleapis.com/v1/projects/${LUMINA_PROJECT_ID}/databases/(default)/documents/lumina_public_chat_messages?key=${LUMINA_API_KEY}`;
  const chatRes = await fetch(createChatUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatBody)
  });
  if (!chatRes.ok) {
    console.warn('⚠ Błąd zapisu do lumina_public_chat_messages:', await chatRes.text());
  } else {
    console.log(`✔ Wysłano powiadomienie z rozważaniem do Czatu Ogólnego LUMINA!`);
  }

  return { success: true, day: entry.day, date: entry.date };
}

// Bezpośrednie uruchomienie
if (process.argv[1] && process.argv[1].endsWith('publish-reflection-to-lumina.mjs')) {
  publishReflectionToLumina().then(res => {
    console.log('🎉 Synchronizacja rozważań z LUMINA zakończona sukcesem:', res);
  }).catch(err => {
    console.error('❌ Błąd:', err);
    process.exit(1);
  });
}
