/**
 * EkoCC — Dyspozytor Zaczepek na WhatsApp (15–30m, Cisza Nocna, Rotacja Pokoi)
 * 
 * Odpowiedzialność:
 * - Pobiera katalog aktywnych grup WhatsApp z bazy Firestore (cc-mission-control).
 * - Sprawdza okno ciszy nocnej (21:45 - 07:30).
 * - Dobiera kolejny pokój w rotacji FIFO (min. 8h odstępu dla tego samego pokoju).
 * - Generuje spersonalizowaną zaczepkę (Gemini Rotator + Fallback).
 * - Wstawia polecenie do Firestore `CommandQueue` w formacie:
 *   "wyślij celowane [<groupId>]: <treść>"
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateZaczepka } from './zaczepki_generator.mjs';
import { ensureVerseGraphicSync } from '../generate-verse-graphic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const STATE_FILE = path.join(ROOT, 'data/whatsapp_zaczepki_state.json');
const LOG_FILE = path.join(ROOT, 'data/whatsapp_zaczepki_log.json');
const SERVICE_ACCOUNT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json';

// Konfiguracja ciszy nocnej
const QUIET_HOURS_START = 22; // 22:00
const QUIET_HOURS_END = 7;    // 07:00
const QUIET_MINUTES_START = 0;
const QUIET_MINUTES_END = 30; // 07:30 koniec ciszy

export function isQuietHours(date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();
  const totalMinutes = h * 60 + m;
  const startMinutes = QUIET_HOURS_START * 60 + QUIET_MINUTES_START; // 1320 (22:00)
  const endMinutes = QUIET_HOURS_END * 60 + QUIET_MINUTES_END;       // 450 (07:30)

  // Noc: po 22:00 LUB przed 07:30
  return totalMinutes >= startMinutes || totalMinutes < endMinutes;
}

export function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {}
  }
  return { lastDispatchTime: null, lastGroupIndex: -1, history: {} };
}

export function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

export function appendLog(entry) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  let logs = [];
  if (fs.existsSync(LOG_FILE)) {
    try { logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch (e) {}
  }
  logs.unshift(entry);
  if (logs.length > 200) logs = logs.slice(0, 200);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

/**
 * Pobiera listę aktywnych grup WhatsApp z Firestore
 */
async function fetchEligibleGroups(admin) {
  const db = admin.firestore();
  const snap = await db.collection('WhatsAppGroups').get();
  const groups = [];

  snap.forEach(doc => {
    const data = doc.data();
    // Pobierz tylko grupy z ID WhatsApp (@g.us), wykluczając ogólne kanały transmisyjne
    const gId = data.groupId || (doc.id.includes('@g.us') ? doc.id : null);
    const isChannel = data.status === 'channel' || data.category === 'Kanał' || doc.id.startsWith('chan_');
    const isNazirPriority = doc.id === 'Grupa Nazira' || data.name === 'Grupa Nazira';

    if (gId && !isChannel && !isNazirPriority) {
      groups.push({
        docId: doc.id,
        name: data.name || doc.id,
        groupId: gId,
        category: data.category || 'Ogólne'
      });
    }
  });

  return groups;
}

export async function dispatchNextZaczepka(options = { dryRun: false }) {
  const now = new Date();
  console.log(`[ZACZEPKI] Uruchomienie dyspozytora: ${now.toLocaleTimeString('pl-PL')}`);

  if (isQuietHours(now)) {
    const msg = `[ZACZEPKI] Cisza nocna (22:00 - 07:30). Brak wysyłki zaczepek.`;
    console.log(msg);
    return { status: 'quiet_hours', message: msg };
  }

  // Weryfikacja minimalnego interwału bezpieczeństwa (min. 12 minut od ostatniej wysyłki)
  const state = loadState();
  if (state.lastDispatchTime) {
    const elapsedMinutes = (Date.now() - new Date(state.lastDispatchTime).getTime()) / (1000 * 60);
    if (elapsedMinutes < 12 && !options.force) {
      const waitMsg = `[ZACZEPKI] Zbyt krótki odstęp od ostatniej zaczepki (${Math.round(elapsedMinutes)} min < 12 min). Odczekaj.`;
      console.log(waitMsg);
      return { status: 'rate_limited', message: waitMsg, elapsedMinutes };
    }
  }

  // Inicjalizacja Firebase Admin
  let adminModule;
  try {
    adminModule = await import('firebase-admin');
  } catch (e) {
    // Fallback: dynamiczny import z Wektor1 node_modules
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    adminModule = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');
  }

  const admin = adminModule.default || adminModule;
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const groups = await fetchEligibleGroups(admin);
  if (groups.length === 0) {
    console.warn('[ZACZEPKI] Brak dostępnych grup w bazie.');
    return { status: 'no_groups' };
  }

  // Selekcja grupy wg rotacji FIFO z zachowaniem min. 8h odstępu dla tej samej grupy
  let selectedGroup = null;
  const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;

  for (let offset = 1; offset <= groups.length; offset++) {
    const candidateIdx = (state.lastGroupIndex + offset) % groups.length;
    const candidate = groups[candidateIdx];
    const lastSentToCandidate = state.history[candidate.groupId] || 0;

    if (lastSentToCandidate < eightHoursAgo) {
      selectedGroup = candidate;
      state.lastGroupIndex = candidateIdx;
      break;
    }
  }

  // Jeśli wszystkie grupy były obsłużone w ciągu ostatnich 8h, weź tę najdawniej odwiedzoną
  if (!selectedGroup) {
    let oldestTime = Infinity;
    let oldestIdx = 0;
    for (let i = 0; i < groups.length; i++) {
      const t = state.history[groups[i].groupId] || 0;
      if (t < oldestTime) {
        oldestTime = t;
        oldestIdx = i;
      }
    }
    selectedGroup = groups[oldestIdx];
    state.lastGroupIndex = oldestIdx;
  }

  console.log(`[ZACZEPKI] Wybrano grupę: "${selectedGroup.name}" [ID: ${selectedGroup.groupId}]`);

  // Wygeneruj spersonalizowaną zaczepkę
  const zaczepka = await generateZaczepka(selectedGroup.name, now.getHours());
  console.log(`[ZACZEPKI] Wygenerowano treść (źródło: ${zaczepka.source}):\n---\n${zaczepka.text}\n---`);

  // Selekcja i kontrola częstotliwości grafiki (Anti-Overuse Cezary & Wioletta + Dedykowana Grafika Wersetu Dnia)
  let finalMediaPath = zaczepka.mediaPath || null;
  if (zaczepka.category === 'studium_i_slowo' || /werset[- ]dnia/i.test(zaczepka.text || '')) {
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    const generatedVerseImg = ensureVerseGraphicSync({ day: dayOfYear }, ROOT);
    if (generatedVerseImg && fs.existsSync(generatedVerseImg)) {
      finalMediaPath = generatedVerseImg;
      console.log(`[ZACZEPKI] 📖 Dołączam wygenerowaną tematyczną grafikę Wersetu Dnia (Dzień ${dayOfYear}): ${path.basename(generatedVerseImg)}`);
    }
  } else if (finalMediaPath && finalMediaPath.includes('cezary-wioletta-radiocc.jpg')) {
    const minIntervalHours = 72; // Minimum 72h (3 dni) odstępu między użyciami zdjęcia z żoną
    const lastPhotoTime = state.lastCezaryWiolettaPhotoTime || 0;
    const elapsedHours = (Date.now() - lastPhotoTime) / (1000 * 60 * 60);

    if (elapsedHours < minIntervalHours) {
      console.log(`[ZACZEPKI] 📸 Zdjęcie z żoną użyte ${Math.round(elapsedHours)}h temu (<${minIntervalHours}h). Zamieniam na alternatywną grafikę ekosystemu.`);
      finalMediaPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/biblia-audio/assets/hero-biblia-audio.jpg';
    } else {
      console.log(`[ZACZEPKI] 📸 Dołączam oficjalną grafikę Cezarego i Wioletty Rogowskich (Radio CC) dla ugruntowania wiarygodności.`);
      state.lastCezaryWiolettaPhotoTime = Date.now();
    }
  }

  const commandText = `wyślij celowane [${selectedGroup.groupId}]: ${zaczepka.text}`;

  if (options.dryRun) {
    console.log(`[ZACZEPKI] [DRY RUN] Pomijam zapis do CommandQueue. Załącznik graficzny: ${finalMediaPath}`);
    return {
      status: 'dry_run_success',
      group: selectedGroup,
      mediaPath: finalMediaPath,
      zaczepka
    };
  }

  // Zapisz rozkaz do CommandQueue w Firestore
  const db = admin.firestore();
  const queueRef = await db.collection('CommandQueue').add({
    command: commandText,
    mediaPath: finalMediaPath,
    status: 'pending',
    type: 'zaczepka',
    targetGroupId: selectedGroup.groupId,
    targetGroupName: selectedGroup.name,
    category: zaczepka.category,
    source: 'antigravity_zaczepki_engine',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`[ZACZEPKI] Dodano zadanie do CommandQueue (ID: ${queueRef.id}). WhatsApp agent przekaże wiadomość.`);

  // Zaktualizuj stan i historię
  state.lastDispatchTime = now.toISOString();
  state.history[selectedGroup.groupId] = Date.now();
  saveState(state);

  // Dodaj wpis do logu
  appendLog({
    timestamp: now.toISOString(),
    queueId: queueRef.id,
    group: selectedGroup.name,
    groupId: selectedGroup.groupId,
    source: zaczepka.source,
    preview: zaczepka.text.substring(0, 80) + '...'
  });

  return {
    status: 'dispatched',
    queueId: queueRef.id,
    group: selectedGroup,
    zaczepka
  };
}

// Obsługa wywołania z CLI
if (process.argv[1] && process.argv[1].endsWith('zaczepki_dispatcher.mjs')) {
  const isDryRun = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');
  const isLoop = process.argv.includes('--loop');

  if (isLoop) {
    console.log('[ZACZEPKI] Start pętli automatycznej (interwał 15-30 min z ciszą nocną)...');
    async function loopStep() {
      try {
        await dispatchNextZaczepka({ dryRun: isDryRun });
      } catch (err) {
        console.error('[ZACZEPKI] Błąd w pętli:', err);
      }
      // Losowy interwał między 15 a 25 minut (900s do 1500s)
      const nextDelayMinutes = Math.floor(Math.random() * 11) + 15;
      const nextDelayMs = nextDelayMinutes * 60 * 1000;
      console.log(`[ZACZEPKI] Następne uruchomienie za ${nextDelayMinutes} minut (${new Date(Date.now() + nextDelayMs).toLocaleTimeString('pl-PL')}).`);
      setTimeout(loopStep, nextDelayMs);
    }
    loopStep();
  } else {
    dispatchNextZaczepka({ dryRun: isDryRun, force: isForce })
      .then(async (res) => {
        console.log('[ZACZEPKI] Wynik operacji:', res.status);
      })
      .catch((err) => {
        console.error('[ZACZEPKI] Błąd krytyczny:', err);
        process.exitCode = 1;
      });
  }
}
