// Wiadomość z Nieba → czat główny Lumi Mess (lumina_public_chat_messages).
// @007, polecenie L0 23.11.2026: 07:00 i 19:00, ten sam werset dnia, wiadomość kompletna z grafiką
// (karta 1:1 rysowana w oknie czatu na szablonie L0, z pobieraniem PNG i udostępnianiem).
// Tylko czat PUBLICZNY. Zero wiadomości prywatnych, zero kosztów. Idempotentne: 1 wpis na dzień i porę.
import path from 'node:path';
import { loadWznConfig } from './db.mjs';
import { fetchVerifiedDailyVerse, getWarsawDateParts } from './verse-source.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
export const CHAT_COLLECTION = 'lumina_public_chat_messages';
export const CHAT_SLOTS = Object.freeze({ morning: '07:00', evening: '19:00' });
export const CARD_TEMPLATE = '/images/wiadomosc-z-nieba/szablon-1x1.jpg';
const MAX_TEXT = 2000; // limit z firestore.rules dla czatu publicznego

export function chatMessageId(runDate, slot) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(runDate)) throw new Error(`Nieprawidłowa data: ${runDate}`);
  if (!CHAT_SLOTS[slot]) throw new Error(`Nieznana pora: ${slot}`);
  return `wzn_chat_${runDate}_${slot}`;
}

function clip(text, max = MAX_TEXT) {
  const s = String(text || '').trim();
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Buduje dokument wiadomości czatu. `postText` = treść wpisu dnia z Tablicy (ten sam tekst rano i wieczorem).
 */
export function buildChatMessage({ verse, postText, runDate, slot, config }) {
  if (!verse?.text || !verse?.referencePl) throw new Error('Brak zweryfikowanego wersetu.');
  if (!postText) throw new Error('Brak treści wiadomości dnia.');
  const p = config?.profile || {};
  const pageUrl = p.publicUrl || 'https://polskieradio.cc/wiadomosc-z-nieba/';
  const intro = slot === 'evening'
    ? '🌙 Wieczorna Wiadomość z Nieba — zatrzymaj się jeszcze raz przy dzisiejszym Słowie.'
    : '📩 Masz nową Wiadomość z Nieba na dziś.';
  const outro = `🖼️ Grafikę z wersetem pobierzesz i udostępnisz pod tą wiadomością.\n🔗 ${pageUrl}`;
  const body = clip(postText, MAX_TEXT - intro.length - outro.length - 4);
  return {
    senderAuthUid: 'wzn_editorial_channel',
    senderId: p.slug || 'wiadomosci_z_nieba',
    senderName: p.fullTitle || 'Jezus Chrystus — Wiadomości z nieba',
    senderAvatar: p.avatarPng || '/images/lumina/wiadomosci-z-nieba-avatar.png',
    senderBadge: '📩 Christian Culture',
    type: 'wzn_card',
    isEditorialChannel: true,
    text: `${intro}\n\n${body}\n\n${outro}`,
    dateStr: CHAT_SLOTS[slot],
    wzn: {
      verseText: verse.text,
      reference: verse.referencePl,
      translation: 'UBG-2025',
      runDate,
      slot,
      pageUrl,
      template: CARD_TEMPLATE,
    },
  };
}

/**
 * Publikuje wiadomość dnia w czacie głównym. Źródło prawdy: wpis dnia `lumina_posts/wzn_post_<data>`
 * (tekst) + zweryfikowany werset UBG-2025 dla tej samej daty (musi się zgadzać z wpisem).
 */
export async function broadcastDailyToPublicChat({
  slot,
  date = new Date(),
  rootDir = DEFAULT_REPO_ROOT,
  firestoreClient,
  config = null,
  verseFetcher = fetchVerifiedDailyVerse,
} = {}) {
  if (!firestoreClient) throw new Error('Brak klienta Firestore.');
  const cfg = config || loadWznConfig(rootDir);
  const runDate = getWarsawDateParts(date).dateStr;
  const id = chatMessageId(runDate, slot);

  if (cfg.killSwitch === true) return { ok: false, status: 'KILLED', runDate, id };
  if (cfg.mode !== 'PRODUCTION_LIVE' || !cfg.productionApprovedByOwner) {
    return { ok: false, status: 'NOT_LIVE', runDate, id, reason: 'Czat publikowany tylko w trybie PRODUCTION_LIVE z akceptacją L0.' };
  }

  const existing = await firestoreClient.getPublicChatMessage(id);
  if (existing?.exists) return { ok: true, status: 'SKIPPED_DUPLICATE', runDate, id };

  const post = await firestoreClient.getPost(`wzn_post_${runDate}`);
  if (!post?.exists || !post.data?.text) {
    return { ok: false, status: 'NO_DAILY_POST', runDate, id, reason: 'Brak opublikowanej wiadomości dnia na Tablicy.' };
  }

  const verseRes = verseFetcher({ date, rootDir, config: cfg });
  if (!verseRes?.ok) return { ok: false, status: 'BLOCKED_SOURCE', runDate, id, reason: verseRes?.reason };
  const verse = verseRes.verse;
  if (post.data.verseReference && post.data.verseReference !== verse.referencePl) {
    return { ok: false, status: 'VERSE_MISMATCH', runDate, id, reason: `${post.data.verseReference} ≠ ${verse.referencePl}` };
  }

  const doc = buildChatMessage({ verse, postText: post.data.text, runDate, slot, config: cfg });
  await firestoreClient.createPublicChatMessage(id, doc);
  const check = await firestoreClient.getPublicChatMessage(id);
  return { ok: Boolean(check?.exists), status: check?.exists ? 'PUBLISHED_CHAT' : 'NOT_VERIFIED', runDate, id, reference: verse.referencePl };
}
