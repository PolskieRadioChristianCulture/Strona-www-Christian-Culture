#!/usr/bin/env node
/**
 * WHATSAPP HOOKS RUNNER (ZACZEPKI MOTYWACYJNE DO POKOI WHATSAPP)
 * Automatyczna publikacja co 15 do 30 minut z przerwą na ciszę nocną (22:00-06:30).
 * Celowane wpisy do pokoi WhatsApp z pytaniem, wezwaniem do działania,
 * autopromocją ekosystemu oraz spontaniczną zachętą do akcji "Wspieram To".
 * Standard: ZERO-QA, ZERO COST, Pancerne Zasady EkoCC.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { HOOKS_BY_CATEGORY, mapGroupToCategory, formatHookMessage } from './hooks_catalog.mjs';
import { ensureVerseGraphicSync } from '../generate-verse-graphic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const STATE_FILE = path.join(ROOT, 'data/whatsapp_hooks_state.json');
const WEKTOR_DIR = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const SERVICE_KEY_PATH = path.join(WEKTOR_DIR, 'serviceAccountKey.json');

// createRequire do załadowania firebase-admin z Wektor1_VideoFactory
const wektorRequire = createRequire(path.join(WEKTOR_DIR, 'package.json'));
let admin = null;
try {
  admin = wektorRequire('firebase-admin');
} catch (e) {
  console.error('[FATAL] Nie można załadować firebase-admin z Wektor1:', e.message);
  process.exit(1);
}

/**
 * Sprawdzenie ciszy nocnej w strefie Europe/Warsaw (22:00 - 06:30)
 */
export function isNightQuietHours(date = new Date()) {
  const warsawTimeString = date.toLocaleTimeString('en-US', {
    timeZone: 'Europe/Warsaw',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  const [hStr, mStr] = warsawTimeString.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const totalMinutes = h * 60 + m;

  // 22:00 to 1320 minut; 06:30 to 390 minut
  // Cisza nocna obowiązuje od 22:00 do 06:30
  if (totalMinutes >= 22 * 60 || totalMinutes < 6 * 60 + 30) {
    return {
      active: true,
      time: warsawTimeString,
      reason: 'Cisza nocna (22:00 - 06:30 czasu warszawskiego)'
    };
  }
  return { active: false, time: warsawTimeString };
}

/**
 * Wczytanie lub utworzenie stanu operacyjnego
 */
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (_) {}
  }
  return {
    lastSentTime: null,
    nextScheduledTime: null,
    lastGroupIndex: -1,
    totalDispatched: 0,
    history: []
  };
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Główna funkcja wykonawcza
 */
export async function runWhatsappHooks(options = {}) {
  const isForce = options.force || process.argv.includes('--now') || process.argv.includes('--force');
  const dryRun = options.dryRun || process.argv.includes('--dry-run');

  console.log('🤖 [WHATSAPP HOOKS] Sprawdzanie harmonogramu i gotowości do wysyłki zaczepki...');

  // 1. Weryfikacja ciszy nocnej
  const quiet = isNightQuietHours();
  if (quiet.active && !isForce) {
    console.log(`🌙 [CISZA NOCNA] Aktywna cisza nocna: ${quiet.time}. Zaczepki są wstrzymane do godziny 06:30.`);
    return { status: 'quiet_hours', time: quiet.time };
  }

  // 2. Weryfikacja okna czasowego (15 - 30 minut)
  const state = loadState();
  const now = Date.now();

  if (!isForce && state.nextScheduledTime) {
    const scheduledTime = Date.parse(state.nextScheduledTime);
    if (now < scheduledTime) {
      const waitMinutes = Math.round((scheduledTime - now) / 60000);
      console.log(`⏳ [CZEKAMY] Kolejna zaczepka zaplanowana za ok. ${waitMinutes} min (${state.nextScheduledTime}).`);
      return { status: 'waiting', nextScheduledTime: state.nextScheduledTime, waitMinutes };
    }
  }

  // 3. Połączenie z Firestore (cc-mission-control)
  if (!fs.existsSync(SERVICE_KEY_PATH)) {
    console.error(`[FATAL] Brak klucza serviceAccountKey.json w ${SERVICE_KEY_PATH}`);
    process.exit(1);
  }

  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_KEY_PATH, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  // 4. Pobranie aktywnych połączonych grup WhatsApp
  console.log('📡 [WHATSAPP HOOKS] Pobieranie aktywnych pokoi WhatsApp z bazy Firestore...');
  const snap = await db.collection('WhatsAppGroups').get();
  const activeGroups = [];

  snap.forEach(doc => {
    const data = doc.data();
    if (data.status === 'joined' && data.groupId) {
      activeGroups.push({
        docId: doc.id,
        name: data.name || doc.id,
        groupId: data.groupId,
        category: data.category
      });
    }
  });

  if (activeGroups.length === 0) {
    console.warn('⚠️ [WHATSAPP HOOKS] Brak aktywnych grup o statusie "joined" w WhatsAppGroups.');
    return { status: 'no_groups' };
  }

  console.log(`✅ [WHATSAPP HOOKS] Znaleziono ${activeGroups.length} aktywnych pokoi WhatsApp.`);

  // 5. Wybór kolejnej grupy w rotacji FIFO (round-robin)
  const nextIndex = (state.lastGroupIndex + 1) % activeGroups.length;
  const targetGroup = activeGroups[nextIndex];

  // 6. Dopasowanie tematyki i zaczepki
  const category = mapGroupToCategory(targetGroup.name);
  const hookPool = HOOKS_BY_CATEGORY[category] || HOOKS_BY_CATEGORY.ogolne;
  // Losowy lub rotacyjny wybór z puli danej kategorii
  const hook = hookPool[Math.floor(Math.random() * hookPool.length)];
  const fullMessage = formatHookMessage(hook, targetGroup.name);

  console.log(`🎯 [CEL] Pokój: "${targetGroup.name}" (${targetGroup.groupId}) | Kategoria: [${category.toUpperCase()}]`);
  console.log(`💬 [ZACZEPKA ID]: ${hook.id}`);

  // 6.5. Wygenerowanie dedykowanej grafiki tematycznej dla wersetu biblijnego z zaczepki
  let verseMediaPath = null;
  if (hook.verse) {
    try {
      verseMediaPath = ensureVerseGraphicSync({
        verse: hook.verse,
        title: hook.question || '',
        theme: category
      }, ROOT);
    } catch (e) {
      console.warn('[WHATSAPP HOOKS] Ostrzeżenie generowania grafiki wersetu:', e.message);
    }
  }

  // 7. Enqueue do CommandQueue dla Joshua / whatsapp_agent
  if (dryRun) {
    console.log('\n[DRY RUN] Treść wiadomości, która zostałaby wysłana:');
    console.log(fullMessage);
    console.log('[DRY RUN] Dedykowana grafika wersetu:', verseMediaPath || 'BRAK');
    console.log('\n[DRY RUN] Zakończono bez modyfikacji bazy.');
    return { status: 'dry_run', targetGroup, hook, mediaPath: verseMediaPath };
  }

  const queuePayload = {
    command: `wyślij celowane [${targetGroup.groupId}]: ${fullMessage}`,
    sender: 'antigravity',
    status: 'pending',
    read: false,
    type: 'hook_zaczepka',
    targetGroupId: targetGroup.groupId,
    groupName: targetGroup.name,
    category: category,
    hookId: hook.id,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };
  if (verseMediaPath && fs.existsSync(verseMediaPath)) {
    queuePayload.mediaPath = verseMediaPath;
  }

  const queueRef = await db.collection('CommandQueue').add(queuePayload);

  console.log(`🚀 [SUCCESS] Rozkaz wysyłki zaczepki zakolejkowany w CommandQueue! (Doc ID: ${queueRef.id})`);

  // Aktualizacja lastHookSent w dokumencie grupy
  try {
    await db.collection('WhatsAppGroups').doc(targetGroup.docId).update({
      lastHookSent: admin.firestore.FieldValue.serverTimestamp(),
      lastHookId: hook.id
    });
  } catch (_) {}

  // 8. Wyznaczenie kolejnego okna czasowego (15 - 30 minut)
  const nextIntervalMinutes = 15 + Math.floor(Math.random() * 16); // 15 do 30 minut
  const nextScheduledDate = new Date(Date.now() + nextIntervalMinutes * 60 * 1000);

  state.lastSentTime = new Date().toISOString();
  state.nextScheduledTime = nextScheduledDate.toISOString();
  state.lastGroupIndex = nextIndex;
  state.totalDispatched = (state.totalDispatched || 0) + 1;
  state.history = [
    {
      timestamp: state.lastSentTime,
      groupName: targetGroup.name,
      groupId: targetGroup.groupId,
      category,
      hookId: hook.id,
      commandDocId: queueRef.id
    },
    ...(state.history || []).slice(0, 19)
  ];

  saveState(state);

  console.log(`⏰ [HARMONOGRAM] Następna zaczepka zaplanowana za ${nextIntervalMinutes} min: ${state.nextScheduledTime}`);
  return {
    status: 'dispatched',
    targetGroup: targetGroup.name,
    category,
    hookId: hook.id,
    commandDocId: queueRef.id,
    nextScheduledTime: state.nextScheduledTime
  };
}

// Uruchomienie bezpośrednie z wiersza poleceń
if (process.argv[1] && process.argv[1].endsWith('whatsapp-hooks-runner.mjs')) {
  runWhatsappHooks()
    .then(res => {
      console.log('🏁 Wynik egzekucji:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Błąd egzekucji runnera zaczepek:', err);
      process.exit(1);
    });
}
