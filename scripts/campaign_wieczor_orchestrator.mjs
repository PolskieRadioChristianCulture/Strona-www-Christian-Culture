#!/usr/bin/env node
/**
 * Kampania Promocyjna: "Wieczór ze Słowem Bożym • Zaznaj spokoju serca"
 * Emisja DZIŚ o 20:00 | polskieradio.cc/wieczor
 *
 * Publikacja strategiczna co godzinę (12:00 - 20:00):
 * - LUMINA (Tablica społecznościowa) z grafiką 1:1
 * - X (Twitter)
 * - WhatsApp (Grupa Nazira + rotacja grup)
 * - Facebook
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { publishEcosystemItemToTablica } from './publish-ecosystem-to-tablica.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const LOG_PATH = path.join(ROOT, 'data', 'wieczor_campaign_log.json');
const WEKTOR_DIR = 'C:\\Users\\czark\\Christian_Culture_Projekty\\Wektor1_VideoFactory';
const SERVICE_ACCOUNT_PATH = path.join(WEKTOR_DIR, 'serviceAccountKey.json');
const FB_SESSION_PATH = path.join(WEKTOR_DIR, 'fb_session.json');
const X_PROFILE_DIR = path.join(ROOT, '.x_browser_profile');

const PROMO_IMG_1 = path.join(ROOT, 'images', 'promo_wieczor_1.jpg');
const PROMO_IMG_2 = path.join(ROOT, 'images', 'promo_wieczor_2.jpg');

// Strategiczne sloty godzinowe od 12:00 do 20:00
export const STRATEGIC_HOURLY_SLOTS = {
  12: {
    slotName: '12:00 — Południowe zatrzymanie',
    image: PROMO_IMG_1,
    title: 'Zatrzymaj się na chwilę... Dziś o 20:00 Wieczór ze Słowem Bożym',
    body: `Zatrzymaj się na chwilę w biegu poniedziałku... 🕊️

Często gonimy za sprawami, które wyczerpują nasze siły, a serce tęskni za prawdziwym pokojem. Dziś wieczorem zapraszamy Cię do wspólnego stołu z Pismem Świętym.

✨ DZIŚ O 20:00: „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”
Przygotuj ulubioną herbatę, usiądź w ciszy i pozwól, aby Boże Słowo oraz spokojna muzyka napełniły Twój dom.

👉 Dołącz do transmisji online: https://polskieradio.cc/wieczor
Zaproś bliskich i udostępnij to zaproszenie dalej. Bądźmy dziś razem!

#WieczórZeSłowemBożym #SłowoBoże #Modlitwa #SpokójSerca #ChristianCulture #Wiara`,
    xHook: `🕊️ Zatrzymaj się w biegu poniedziałku. Dziś o 20:00 zapraszamy na „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”.

Słowo, które przynosi ukojenie, modlitwa i Boży pokój w Twoim domu.

👉 Oglądaj i słuchaj: https://polskieradio.cc/wieczor`
  },
  13: {
    slotName: '13:00 — Czas wyciszenia i nadziei',
    image: PROMO_IMG_2,
    title: 'Pokój dla Twojego domu — Wieczór ze Słowem Bożym o 20:00',
    body: `„Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję.” (J 14,27) 📖

Świat daje obietnice, które szybko mijają. Bóg daje pokój, który ucisza każdą burzę w sercu.
Dziś o 20:00 spotykamy się na wyjątkowej transmisji na żywo. Rodzinnie, w cieple domowego ogniska, skupieni wokół Pisma Świętego.

🔔 Transmisja na żywo: https://polskieradio.cc/wieczor [DZIŚ 20:00]
Zapisz link i ustaw przypomnienie. Do zobaczenia o 20:00!

#PokójBoży #PismoŚwięte #Biblia #WieczórZeSłowemBożym #ChristianCulture`,
    xHook: `„Pokój zostawiam wam, pokój mój daję wam...” (J 14,27)

Dziś o 20:00 wspólny „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”. Dołącz z rodziną do transmisji na żywo:
👉 https://polskieradio.cc/wieczor`
  },
  14: {
    slotName: '14:00 — Odkryj siłę Bożego Słowa',
    image: PROMO_IMG_1,
    title: 'Głosy, które prowadzą do Boga — Dziś o 20:00 na żywo',
    body: `Potrzebujesz dziś duchowego wzmocnienia? ✨

Nie musisz nieść wszystkich trosk w samotności. Słowo Boże ma moc odnowić Twoje myśli i wnieść światło tam, gdzie pojawił się niepokój.

Zapraszamy dziś o 20:00 na pasmo modlitwy i rozważania Słowa Bożego w Christian Culture:
👉 https://polskieradio.cc/wieczor (Dostępne za darmo, na każdym urządzeniu)

#ChristianCulture #SłowoBoże #Modlitwa #PolskieRadioCC #Wiara`,
    xHook: `Potrzebujesz dziś duchowego wzmocnienia i wyciszenia?

Dziś o 20:00 Wieczór ze Słowem Bożym na żywo. Zatrzymaj się i wejdź w Boży pokój:
👉 https://polskieradio.cc/wieczor`
  },
  15: {
    slotName: '15:00 — Godzina Wytchnienia i Łaski',
    image: PROMO_IMG_2,
    title: 'Dziś o 20:00 — Zaznaj spokoju serca przy Słowie Bożym',
    body: `„Pójdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście, a Ja wam dam ukojenie.” (Mt 11,28) 🕊️

O 15:00 przypominamy o Bożym miłosierdziu i zapraszamy na dzisiejszy wieczór wyciszenia. O 20:00 rozpoczynamy transmisję ze specjalną oprawą, wersetami pokoju serca i kojącą muzyką.

👉 Dołącz: https://polskieradio.cc/wieczor
Zabierz ze sobą otwarte serce i intencję, którą powierzysz Bogu.

#Miłosierdzie #WieczórZeSłowemBożym #Ukojenie #Modlitwa #BógJestDobry`,
    xHook: `„Pójdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście...” (Mt 11,28)

Dziś o 20:00 wieczorne spotkanie przy Słowie Bożym. Zapraszamy do wspólnego stołu wiary:
👉 https://polskieradio.cc/wieczor`
  },
  16: {
    slotName: '16:00 — Powroty i domowe zacisze',
    image: PROMO_IMG_1,
    title: 'Po całym dniu... przygotuj serce na Wieczór ze Słowem Bożym',
    body: `Dzień powoli zmierza ku końcowi. Kiedy wrócisz do domu, odłóż na bok natłok informacji i hałas świata.

Zaproś Boga do swojego wieczoru.
Transmisja „Wieczór ze Słowem Bożym • Zaznaj spokoju serca” rusza punktualnie o 20:00!
👉 Kliknij i sprawdź transmisję: https://polskieradio.cc/wieczor

Bądźmy razem w modlitwie i dziękczynieniu.

#Wieczór #Dom #Rodzina #PismoŚwięte #ChristianCulture`,
    xHook: `Kiedy wrócisz do domu, odłóż na bok hałas świata. Zaproś Boży pokój do swojego wieczoru.

Dziś o 20:00 Wieczór ze Słowem Bożym na żywo:
👉 https://polskieradio.cc/wieczor`
  },
  17: {
    slotName: '17:00 — Spotkanie dla Ciebie i Twoich bliskich',
    image: PROMO_IMG_2,
    title: 'Już za 3 godziny: Wieczór ze Słowem Bożym o 20:00',
    body: `Odliczamy czas do godziny 20:00! ⏳

Będzie to wyjątkowy czas czytania Pisma Świętego, wspólnej modlitwy i nastrojowej muzyki chrześcijańskiej. Dla Ciebie, dla Twojego małżeństwa, dla Twoich dzieci i przyjaciół.

👉 Transmisja: https://polskieradio.cc/wieczor [DZIŚ 20:00]
Podaj to zaproszenie dalej – niech Boże Słowo dotrze do każdego zakątka!

#ChristianCulture #Ewangelizacja #SłowoBoże #ModlitwaNaŻywo`,
    xHook: `Odliczamy czas! Za 3 godziny (o 20:00) rozpoczynamy „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”.

Dołącz z bliskimi do transmisji online:
👉 https://polskieradio.cc/wieczor`
  },
  18: {
    slotName: '18:00 — Zbliża się 20:00: Pokój dla Twojego serca',
    image: PROMO_IMG_1,
    title: 'Ostatnie 2 godziny do transmisji na żywo o 20:00!',
    body: `„W pokoju się położę i zaraz zasnę, bo Ty sam, Panie, sprawiasz, że bezpiecznie mieszkam.” (Ps 4,9) 🕊️

Za 2 godziny rozpoczynamy wspólny Wieczór ze Słowem Bożym. Jeśli czujesz zmęczenie, stres czy niepewność – przyjdź na tę transmisję. Bóg czeka na Ciebie z darem pokoju.

👉 Kliknij: https://polskieradio.cc/wieczor [START 20:00]

#Ps4 #PokójSerca #WieczórZeSłowemBożym #ModlitwaWieczorna`,
    xHook: `„W pokoju się położę i zaraz zasnę, bo Ty sam, Panie, sprawiasz, że bezpiecznie mieszkam.” (Ps 4,9)

Za 2 godziny (20:00) Wieczór ze Słowem Bożym na żywo:
👉 https://polskieradio.cc/wieczor`
  },
  19: {
    slotName: '19:00 — Ostatnia godzina do startu',
    image: PROMO_IMG_2,
    title: '🚨 ZA GODZINĘ STARTUJEMY! Wieczór ze Słowem Bożym (20:00)',
    body: `Została już tylko jedna godzina! Punktualnie o 20:00 włączamy transmisję na żywo.

Przygotuj Pismo Święte, zapal świecę, zrób ciepłą herbatę i usiądź wygodnie. 
👉 Wejdź na stronę transmisji: https://polskieradio.cc/wieczor

Czekamy na Ciebie o 20:00! Do zobaczenia na żywo! 🕊️`,
    xHook: `🚨 ZA GODZINĘ STARTUJEMY! Punktualnie o 20:00 rozpoczynamy „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”.

Wejdź i przygotuj się do transmisji:
👉 https://polskieradio.cc/wieczor`
  },
  20: {
    slotName: '20:00 — ROZPOCZYNAMY TRANSMISJĘ NA ŻYWO!',
    image: PROMO_IMG_1,
    title: '🔴 JESTEŚMY NA ŻYWO! Wieczór ze Słowem Bożym • Zaznaj spokoju serca',
    body: `🔴 TRANSMISJA ROZPOCZĘŁA SIĘ WŁAŚNIE TERAZ!

Zapraszamy do wspólnego stołu z Bożym Słowem. Wycisz się, oddaj Bogu wszystkie sprawy dzisiejszego dnia i zaznaj głębokiego pokoju serca.

👉 OGLĄDAJ I SŁUCHAJ NA ŻYWO: https://polskieradio.cc/wieczor
Zostaw serduszko, napisz w komentarzu swoją intencję modlitewną! Bądźmy razem! 🕊️✨`,
    xHook: `🔴 JESTEŚMY NA ŻYWO! Rozpoczął się „Wieczór ze Słowem Bożym • Zaznaj spokoju serca”.

Dołącz teraz i zaznaj Bożego pokoju w swoim domu:
👉 https://polskieradio.cc/wieczor`
  }
};

function loadLog() {
  if (fs.existsSync(LOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    } catch {}
  }
  return { history: [] };
}

function saveLog(log) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
}

// 1. Publikacja na Tablicę LUMINA
async function publishToLumina(slot, dryRun) {
  console.log(`[LUMINA] Publikacja: ${slot.title}`);
  if (dryRun) {
    console.log(`[DRY-RUN][LUMINA] Tytuł: ${slot.title}`);
    return { status: 'dry_run' };
  }

  const res = await publishEcosystemItemToTablica(
    {
      title: slot.title,
      url: 'https://polskieradio.cc/wieczor',
      summary: slot.body,
      category: 'live',
      publishedAt: new Date().toISOString()
    },
    {
      dryRun: false,
      force: true,
      voiceSlug: 'cezaryrgowski',
      imagePath: slot.image,
      rootDir: ROOT
    }
  );

  if (!res.ok) {
    console.error(`[LUMINA] Błąd publikacji: ${res.reason}`);
    return { status: 'error', reason: res.reason };
  }
  console.log(`[LUMINA] ✅ Opublikowano z sukcesem! DocID: ${res.docId}`);
  return { status: 'published', docId: res.docId };
}

// 2. Publikacja na X (Twitter)
async function publishToX(slot, dryRun) {
  console.log(`[X] Publikacja tweeta: ${slot.slotName}`);
  if (dryRun) {
    console.log(`[DRY-RUN][X]\n${slot.xHook}`);
    return { status: 'dry_run' };
  }

  if (!fs.existsSync(X_PROFILE_DIR)) fs.mkdirSync(X_PROFILE_DIR, { recursive: true });
  const launchOptions = {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(X_PROFILE_DIR, launchOptions);
  } catch {
    delete launchOptions.channel;
    context = await chromium.launchPersistentContext(X_PROFILE_DIR, launchOptions);
  }

  try {
    const page = await context.newPage();
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);

    const editor = page.locator('[data-testid="tweetTextarea_0"]').first();
    await editor.waitFor({ timeout: 15000 });
    await editor.click();
    await page.waitForTimeout(600);
    await editor.fill(slot.xHook);
    await page.waitForTimeout(1000);

    // Załączenie grafiki jeśli dostępna
    if (fs.existsSync(slot.image)) {
      const fileInput = page.locator('input[data-testid="fileInput"]').first();
      if (await fileInput.count()) {
        await fileInput.setInputFiles(slot.image);
        await page.waitForTimeout(3000);
      }
    }

    const postBtn = page.locator('[data-testid="tweetButton"]').first();
    await postBtn.click();
    await page.waitForTimeout(5000);
    console.log('[X] ✅ Opublikowano pomyślnie na X!');
    return { status: 'published' };
  } catch (err) {
    console.error('[X] Błąd publikacji:', err.message);
    return { status: 'error', error: err.message };
  } finally {
    await context.close().catch(() => {});
  }
}

// 3. Publikacja na WhatsApp (Grupa Nazira + kolejka)
async function publishToWhatsApp(slot, dryRun) {
  console.log(`[WA] Przygotowanie wysyłki WhatsApp: ${slot.slotName}`);
  if (dryRun) {
    console.log(`[DRY-RUN][WA] Treść:\n${slot.body}`);
    return { status: 'dry_run' };
  }

  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.log('[WA] Brak serviceAccountKey.json — pomijam WhatsApp.');
    return { status: 'skipped' };
  }

  try {
    const admin = require(path.join(WEKTOR_DIR, 'node_modules', 'firebase-admin'));
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    let app;
    if (!admin.apps.length) {
      app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      app = admin.apps[0];
    }
    const db = app.firestore();
    const { loadDistributionGroups, queueWithD1Fallback } = require(path.join(WEKTOR_DIR, 'wa_queue_helpers.js'));
    const waState = { quotaExhausted: false };

    const targets = ['120363409279454206@g.us']; // Grupa Nazira (priorytet)
    const groups = await loadDistributionGroups({ db, state: waState });
    if (groups && groups.length > 0) {
      const sample = groups.slice(0, 2).map(g => g.id || g.jid || g);
      targets.push(...sample);
    }

    const uniqueTargets = [...new Set(targets.filter(Boolean))];
    for (const targetJid of uniqueTargets) {
      await queueWithD1Fallback({
        db,
        command: {
          type: 'SEND_TEXT',
          target: targetJid,
          message: slot.body,
          priority: targetJid === '120363409279454206@g.us' ? 'HIGH' : 'NORMAL',
          scheduledFor: new Date().toISOString()
        },
        state: waState
      });
    }
    console.log(`[WA] ✅ Zakolejkowano dla ${uniqueTargets.length} grup WhatsApp!`);
    return { status: 'queued', targets: uniqueTargets.length };
  } catch (err) {
    console.error('[WA] Błąd kolejkowania:', err.message);
    return { status: 'error', error: err.message };
  }
}

// Główna funkcja wykonawcza slotu
export async function executeSlot(hour, dryRun = false) {
  const slot = STRATEGIC_HOURLY_SLOTS[hour];
  if (!slot) {
    console.log(`Brak zdefiniowanego slotu dla godziny ${hour}`);
    return null;
  }

  console.log(`\n======================================================`);
  console.log(`🚀 URUCHAMIANIE SLOTU: ${slot.slotName}`);
  console.log(`======================================================`);

  const results = {
    hour,
    slotName: slot.slotName,
    executedAt: new Date().toISOString(),
    lumina: await publishToLumina(slot, dryRun),
    x: await publishToX(slot, dryRun),
    whatsapp: await publishToWhatsApp(slot, dryRun)
  };

  const log = loadLog();
  log.history.push(results);
  saveLog(log);

  console.log(`\n✅ Slot ${hour}:00 zrealizowany! Wyniki zapisano w ${LOG_PATH}`);
  return results;
}

// Uruchomienie z linii poleceń
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const nowArg = args.find(a => a.startsWith('--hour='));
  
  let targetHour = new Date().getHours();
  if (nowArg) {
    targetHour = parseInt(nowArg.split('=')[1], 10);
  }

  console.log(`Tryb: ${dryRun ? 'DRY-RUN' : 'PRODUKCJA'} | Godzina docelowa: ${targetHour}:00`);
  await executeSlot(targetHour, dryRun);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('Fatal error in campaign orchestrator:', err);
    process.exit(1);
  });
}
