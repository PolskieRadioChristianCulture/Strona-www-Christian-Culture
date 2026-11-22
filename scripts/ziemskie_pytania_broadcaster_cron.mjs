#!/usr/bin/env node
/**
 * ZIEMSKIE PYTANIA — WIECZNE ODPOWIEDZI
 * Dedykowany Dyspozytor i Harmonogram Emisji w Mediach Społecznościowych
 *
 * Autor felietonów: Cezary Rogowski
 * Kanały: Platforma X (@CezaryRogowski / @ChristianCulture), Tablica LUMINA, WhatsApp (Grupa Nazira)
 * Standard: JOMA-D005 / @SMCC / Zero-QA Dowódcy
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEKTOR_ROOT = path.resolve(ROOT, '..', 'Wektor1_VideoFactory');
const STATE_FILE = path.join(ROOT, 'data', 'ziemskie_pytania_broadcast_state.json');

const SLOTS = [
  {
    id: 1,
    time: '08:30',
    title: 'Czy katolik powinien uznawać niedzielę handlową? Odpowiedź, której nie znajdziesz na sklepowych drzwiach',
    lead: 'Między przepisami o handlu, czwartym przykazaniem i prawdziwym odpoczynkiem w Chrystusie',
    url: 'https://polskieradio.cc/news/czy-katolik-powinien-uznawac-niedziele-handlowa',
    imageRel: 'images/news/art-czy-katolik-powinien-uznawac-niedziele-handlowa.jpg',
    fbImageRel: 'images/social/ccn-fb/fb-czy-katolik-powinien-uznawac-niedziele-handlowa.jpg',
    category: 'CCN Biblia & Społeczeństwo',
    tweetText: `🔴 CCN NEWS | polskieradio.cc/news
📰 RAPORT & PUBLICYSTYKA CCN
Czy katolik powinien uznawać niedzielę handlową? Odpowiedź, której nie znajdziesz na sklepowych drzwiach

👉 Czytaj w serwisie:
https://polskieradio.cc/news/czy-katolik-powinien-uznawac-niedziele-handlowa

#CCNNews #ChristianCulture #Prawda #NiedzielaHandlowa #Dekalog`,
    waText: `📖 *CZY KATOLIK POWINIEN UZNAWAĆ NIEDZIELĘ HANDLOWĄ?*
_Odpowiedź, której nie znajdziesz na sklepowych drzwiach_

W Polsce dyskusja o niedzielach handlowych rozgrzewa emocje. Jedni bronią prawa do zakupów, inni wolnego dnia dla pracowników. A co na to Słowo Boże?

Cezary Rogowski w nowym felietonie porządkuje trzy wymiary:
1. Prawo państwowe i gospodarcze
2. Tradycję kościelną
3. Dosłowny Boży Dekalog (Wj 20:8–11)

> _„Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Tak więc Syn Człowieczy jest Panem także szabatu.”_ (Mk 2:27–28 UBG)

Nie pozwól, by spór o sklep przesłonił Ci prawdziwy odpoczynek w Chrystusie.

🔗 *Przeczytaj całość na portalu:*
https://polskieradio.cc/news/czy-katolik-powinien-uznawac-niedziele-handlowa`
  },
  {
    id: 2,
    time: '11:30',
    title: 'Trybunał Konstytucyjny czy Najwyższy? Jest jeszcze sąd, przed którym stanie każdy człowiek',
    lead: 'Od sporów o polskie sądy do świątyni w niebie i Chrystusa — Sędziego oraz Orędownika',
    url: 'https://polskieradio.cc/prawo/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad',
    imageRel: 'images/news/art-trybunal-konstytucyjny-czy-najwyzszy.jpg',
    fbImageRel: 'images/social/ccn-fb/fb-trybunal-konstytucyjny-czy-najwyzszy.jpg',
    category: 'CCN Prawo & Wiara',
    tweetText: `🔴 CCN PRAWO | polskieradio.cc/prawo
⚖️ PRAWO, TRYBUNAŁY A SĄD BOŻY
Trybunał Konstytucyjny czy Najwyższy? Jest jeszcze sąd, przed którym stanie każdy człowiek.

Gdzie szukać Orędownika? Analiza Cezarego Rogowskiego:
👉 https://polskieradio.cc/prawo/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad

#CCNNews #CCNPrawo #Konstytucja #SadOstateczny #Biblia`,
    waText: `⚖️ *TRYBUNAŁ KONSTYTUCYJNY CZY NAJWYŻSZY?*
_Jest jeszcze sąd, przed którym stanie każdy człowiek_

W sporach o polskie sądownictwo łatwo zatracić perspektywę tego, co wieczne. Konstytucja rozróżnia kompetencje instytucji, ale Biblia przypomina o Trybunale Boga:

> _„Przystąpmy więc z ufnością do tronu łaski, abyśmy dostąpili miłosierdzia i znaleźli łaskę ku pomocy w stosownym czasie.”_ (Hbr 4:16 UBG)

Zamiast lęku przed wyrokiem — poznaj Jezusa Chrystusa, który jest jedynym i doskonałym Obrońcą.

🔗 *Czytaj felieton Cezarego Rogowskiego na CCN Prawo:*
https://polskieradio.cc/prawo/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad`
  },
  {
    id: 3,
    time: '14:30',
    title: 'Fundusz Sprawiedliwości, którego nie znasz. Kto zapłacił za Twój dług wobec Boga?',
    lead: 'Od pomocy pokrzywdzonym do daru usprawiedliwienia z łaski przez wiarę',
    url: 'https://polskieradio.cc/finanse/fundusz-sprawiedliwosci-ktorego-nie-znasz',
    imageRel: 'images/news/art-fundusz-sprawiedliwosci-ktorego-nie-znasz.jpg',
    fbImageRel: 'images/social/ccn-fb/fb-fundusz-sprawiedliwosci-ktorego-nie-znasz.jpg',
    category: 'CCN Finanse & Wiara',
    tweetText: `🔴 CCN FINANSE | polskieradio.cc/finanse
💰 DŁUG, SPRAWIEDLIWOŚĆ I ODKUPIENIE
Fundusz Sprawiedliwości, którego nie znasz. Kto zapłacił za Twój dług wobec Boga?

Felieton Cezarego Rogowskiego:
👉 https://polskieradio.cc/finanse/fundusz-sprawiedliwosci-ktorego-nie-znasz

#CCNNews #CCNFinanse #FunduszSprawiedliwosci #Laska #Odkupienie #Biblia`,
    waText: `💰 *FUNDUSZ SPRAWIEDLIWOŚCI, KTÓREGO NIE ZNASZ*
_Kto zapłacił za Twój dług wobec Boga?_

Gdy w mediach toczą się spory o państwowe fundusze, Biblia stawia fundamentalne pytanie: co z długiem, którego żaden człowiek nie jest w stanie spłacić o własnych siłach?

> _„Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił.”_ (Ef 2:8–9 UBG)

Odkupienie w Chrystusie nie kosztuje ani grosza z Twojego portfela, bo zostało opłacone krwią Zbawiciela.

🔗 *Przeczytaj felieton na CCN Finanse:*
https://polskieradio.cc/finanse/fundusz-sprawiedliwosci-ktorego-nie-znasz`
  },
  {
    id: 4,
    time: '17:30',
    title: 'Okno życia woła także do Ciebie. Czy przyjmiesz dar, którego nie możesz kupić?',
    lead: 'Od ratowania noworodka po osobiste zawierzenie Jezusowi Chrystusowi',
    url: 'https://polskieradio.cc/news/okno-zycia-wola-takze-do-ciebie',
    imageRel: 'images/news/art-okno-zycia-wola-takze-do-ciebie.jpg',
    fbImageRel: 'images/social/ccn-fb/fb-okno-zycia-wola-takze-do-ciebie.jpg',
    category: 'eM Rodzina & Wiara',
    tweetText: `🔴 CCN NEWS | eM RODZINA
👶 OBRONA ŻYCIA I NOWE NARODZENIE
Okno życia woła także do Ciebie. Za małym oknem kryje się ratunek dziecka — i duchowy obraz Boga, który przyjmuje każdego człowieka.

Poruszający felieton Cezarego Rogowskiego:
👉 https://polskieradio.cc/news/okno-zycia-wola-takze-do-ciebie

#CCNNews #OknoZycia #Rodzina #NoweNarodzenie #Ewangelia`,
    waText: `👶 *OKNO ŻYCIA WOŁA TAKŻE DO CIEBIE*
_Czy przyjmiesz dar, którego nie możesz kupić?_

Okno życia ratuje noworodki w dramatycznych okolicznościach. To symbol miłości, która nie osądza, lecz chroni to, co najcenniejsze.

W nowym felietonie Cezary Rogowski pokazuje, że Bóg ma dla każdego z nas Swoje „okno życia” — dar nowego narodzenia i przebaczenia:

> _„Jeśli wyznajemy nasze grzechy, On jest wierny i sprawiedliwy, aby nam przebaczyć grzechy i oczyścić nas z wszelkiej nieprawości.”_ (1 J 1:9 UBG)

Zatrzymaj się na chwilę w niedzielny wieczór i przeczytaj to poruszające rozważanie.

🔗 *Link do artykułu:*
https://polskieradio.cc/news/okno-zycia-wola-takze-do-ciebie`
  }
];

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch {
      // fallback
    }
  }
  return {
    date: '2026-11-22',
    slots: {}
  };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// 1. Emisja na Tablicę LUMINA
async function emitToTablica(slot) {
  const { publishEcosystemItemToTablica } = await import('./publish-ecosystem-to-tablica.mjs');
  const res = await publishEcosystemItemToTablica({
    title: slot.title,
    url: slot.url,
    summary: slot.lead,
    category: 'news',
    image: '/' + slot.imageRel
  }, { force: true, voiceSlug: 'cezaryrgowski' });
  return res;
}

// 2. Emisja na Platformę X
async function emitToX(slot) {
  const { chromium } = await import('playwright');
  const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
  const imageAbsPath = path.join(ROOT, slot.imageRel);

  // Odczyt tokenu z .env.local
  let authToken = process.env.X_AUTH_TOKEN;
  if (!authToken && fs.existsSync(path.join(ROOT, '.env.local'))) {
    const raw = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
    const m = raw.match(/X_AUTH_TOKEN\s*=\s*([^\r\n]+)/);
    if (m) authToken = m[1].trim().replace(/^["']|["']$/g, '');
  }

  if (!authToken) throw new Error('Brak X_AUTH_TOKEN');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(async () => {
    return await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
  });

  await context.addCookies([
    { name: 'auth_token', value: authToken, domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
    { name: 'auth_token', value: authToken, domain: '.twitter.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' }
  ]);

  try {
    const page = await context.newPage();
    console.log(`🌐 [X] Otwieram x.com/home dla Slotu ${slot.id}...`);
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const sideNavBtn = page.locator('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/post"], a[href="/compose/tweet"]').first();
    if (await sideNavBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await sideNavBtn.click();
      await page.waitForTimeout(1000);
    }

    const textarea = page.locator('[role="dialog"] div[data-testid="tweetTextarea_0"], div[data-testid="tweetTextarea_0"]').first();
    await textarea.waitFor({ state: 'visible', timeout: 8000 });
    await textarea.click();
    await page.waitForTimeout(300);
    await page.keyboard.insertText(slot.tweetText);
    await page.waitForTimeout(1000);

    if (fs.existsSync(imageAbsPath)) {
      const fileInput = page.locator('input[type="file"][data-testid="fileInput"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(imageAbsPath);
        await page.waitForTimeout(3000);
      }
    }

    const tweetButton = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
    await tweetButton.click();
    await page.waitForTimeout(4000);
    console.log(`🎉 [X] Slot ${slot.id} opublikowany pomyślnie!`);
    await context.close();
    return { ok: true };
  } catch (err) {
    await context.close();
    throw err;
  }
}

// 3. Emisja do CommandQueue (WhatsApp Grupa Nazira)
async function emitToWhatsApp(slot) {
  const req = createRequire(import.meta.url);
  const admin = req('firebase-admin');
  const saPath = path.join(WEKTOR_ROOT, 'serviceAccountKey.json');
  if (!fs.existsSync(saPath)) return { ok: false, reason: 'no_sa_key' };

  if (!admin.apps.some(a => a && a.name === 'wektor-mc')) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    }, 'wektor-mc');
  }

  const app = admin.app('wektor-mc');
  const db = app.firestore();
  const nazirTarget = "120363409279454206@g.us";

  const docRef = await db.collection("CommandQueue").add({
    command: `wyślij celowane [${nazirTarget}]: ${slot.waText}`,
    sender: "antigravity",
    slotId: slot.id,
    series: "ziemskie_pytania",
    status: "pending",
    read: false,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { ok: true, docId: docRef.id };
}

// Wykonanie pojedynczego slotu
export async function emitSlot(slotId) {
  const slot = SLOTS.find(s => s.id === Number(slotId));
  if (!slot) throw new Error(`Nieznany slot ${slotId}`);

  console.log(`\n========================================`);
  console.log(`🚀 EMISJA SLOTU ${slot.id} (${slot.time}): ${slot.title}`);
  console.log(`========================================`);

  const results = { slotId: slot.id, time: new Date().toISOString() };

  // 1. Tablica LUMINA
  try {
    const tabRes = await emitToTablica(slot);
    results.tablica = { ok: true, docId: tabRes.docId || 'done' };
    console.log(`✅ [Tablica LUMINA]: Sukces (${results.tablica.docId})`);
  } catch (e) {
    results.tablica = { ok: false, error: e.message };
    console.error(`❌ [Tablica LUMINA]:`, e.message);
  }

  // 2. X (Twitter)
  try {
    const xRes = await emitToX(slot);
    results.x = { ok: true };
    console.log(`✅ [X (Twitter)]: Sukces`);
  } catch (e) {
    results.x = { ok: false, error: e.message };
    console.error(`❌ [X (Twitter)]:`, e.message);
  }

  // 3. WhatsApp
  try {
    const waRes = await emitToWhatsApp(slot);
    results.whatsapp = { ok: true, docId: waRes.docId };
    console.log(`✅ [WhatsApp Grupa Nazira]: Sukces (Queue ID: ${waRes.docId})`);
  } catch (e) {
    results.whatsapp = { ok: false, error: e.message };
    console.error(`❌ [WhatsApp]:`, e.message);
  }

  const state = loadState();
  state.slots[slot.id] = {
    status: 'EMITTED',
    emittedAt: results.time,
    results
  };
  saveState(state);

  return results;
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const state = loadState();

  if (args.includes('--status')) {
    console.log('📊 STATUS HARMONOGRAMU EMISJI „ZIEMSKIE PYTANIA”:');
    for (const s of SLOTS) {
      const st = state.slots[s.id];
      console.log(`   Slot ${s.id} (${s.time}) — ${s.title.slice(0, 50)}... -> ${st ? st.status + ' (' + st.emittedAt + ')' : 'OCZEKUJE'}`);
    }
    process.exit(0);
  }

  const slotArgIdx = args.indexOf('--slot');
  if (slotArgIdx !== -1) {
    const slotId = parseInt(args[slotArgIdx + 1], 10);
    await emitSlot(slotId);
    process.exit(0);
  }

  // Automatyczny tryb sprawdzania bieżącej godziny
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMin = currentHour * 60 + currentMinute;

  console.log(`🕒 Bieżący czas: ${now.toLocaleTimeString('pl-PL')}`);
  for (const s of SLOTS) {
    const [h, m] = s.time.split(':').map(Number);
    const slotMin = h * 60 + m;

    if (currentTotalMin >= slotMin && (!state.slots[s.id] || state.slots[s.id].status !== 'EMITTED')) {
      console.log(`⚡ Czas na emisję Slotu ${s.id} (${s.time})!`);
      await emitSlot(s.id);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()) {
  main().catch(err => {
    console.error('BŁĄD DYSPOZYTORA:', err);
    process.exit(1);
  });
}
