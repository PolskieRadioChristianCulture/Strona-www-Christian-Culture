#!/usr/bin/env node
/**
 * KAMPANIA PREZENTOWA: „THE BEST OF CHRISTIAN CULTURE” (24.11–31.12.2026)
 * Kanały aktywne: Platforma X, Tablica LUMINA, WhatsApp (D1 Queue + FIFO max 2 grupy).
 *
 * Pancerne zasady:
 * - Okno aktywności: wyłącznie 2026-11-24 .. 2026-12-31 (Europe/Warsaw).
 * - Cisza nocna: 21:30–07:30 (Europe/Warsaw) blokuje tryb --scheduled.
 * - Zero automatyzacji zewnętrznych platform zakazanych przez L0.
 * - Zero aluzji niebiblijnych i zero fraz cyklu Dzień N w WhatsApp (ochrona anty-backlog).
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { publishEcosystemItemToTablica } from './publish-ecosystem-to-tablica.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT = path.resolve(__dirname, '..');
const WEKTOR_ROOT = path.resolve(ROOT, '..', 'Wektor1_VideoFactory');

export const CAMPAIGN_START = '2026-11-24';
export const CAMPAIGN_END = '2026-12-31';

export const GOOGLE_DRIVE_ALBUM_URL = 'https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc';
export const ZRZUTKA_URL = 'https://zrzutka.pl/rs4g4v';
export const PATRONITE_URL = 'https://patronite.pl/osobowoscplus';
export const PATRONITE_POST_URL = 'https://patronite.pl/post/107184/prezent-od-nas-darmowy-album-the-best-of-christian-culture-12-utworow-mp3';
export const RADIO_URL = 'https://polskieradio.cc';
export const COVER_REL_PATH = 'images/promo/the-best-of-christian-culture-2026.jpg';
export const STATE_PATH = path.join(ROOT, 'data', 'best_of_cc_sylwester_state.json');
export const X_HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
export const NAZIR_GROUP_JID = '120363409279454206@g.us';

export const EXCLUDED_WA_JIDS = new Set([
  '120363432900533490@g.us', // Asystentka CC
  '120363223599007134@g.us', // Pokoj Administratorow
  '120363422071808724@g.us', // Infolinia CC
  '120363403565056716@g.us', // Prywatna grupa 3-wersji Nazira
  '120363409279454206@g.us', // Grupa Nazira - Christian Culture (tylko --include-nazir)
  'FMnvysABYXq6kh3mqBNWtS@g.us'
]);

const X_MIN_INTERVAL_MS = 48 * 3600 * 1000;
const TABLICA_MIN_INTERVAL_MS = 96 * 3600 * 1000;
const WA_GROUP_DEDUP_DAYS = 14;
const WA_MAX_GROUPS_PER_RUN = 2;

export const SYLWESTER_WAVES = Object.freeze([
  {
    id: 'wave-1-premiera',
    startYmd: '2026-11-24',
    endYmd: '2026-11-30',
    title: '🎁 Niespodzianka od Christian Culture: darmowy album „The Best of Christian Culture” (12 utworów MP3)',
    summary: 'Nawet jeśli dziś nie możesz wesprzeć nas złotówką — dobrze, że jesteś. Pobierz 12 najchętniej słuchanych pieśni CC za darmo i podaj ten prezent bliskim, rodzinie, znajomym i w kościele.',
    xVariants: [
      '🎁 Niespodzianka od Christian Culture! Nawet bez złotówki — dobrze, że jesteś. Pobierz darmowy album (12 MP3) i podaj dalej bliskim, w kościele i w świat!\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}',
      '🎶 Darmowy prezent na zimowe wieczory: 12 ukochanych pieśni Christian Culture w MP3 i ZIP (bez opłat i logowania). Zabierz do auta i wyślij dalej komuś bliskiemu!\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}'
    ],
    waLead: 'Nawet jeśli dziś nie możesz wesprzeć nas choćby złotówką — i tak dobrze, że jesteś. Przyjmij bezinteresowny upominek muzyczny: 12 najchętniej słuchanych pieśni Christian Culture (w tym „Dobrze, że jesteś” oraz „Szczęśliwego Nowego Roku z Jezusem”) do pobrania w MP3 i ZIP.'
  },
  {
    id: 'wave-2-wojownik-tuwim',
    startYmd: '2026-12-01',
    endYmd: '2026-12-07',
    title: '🎶 Muzyczny prezent na grudzień: „Wojownik Chrystusa”, „Chrystusie (sł. Julian Tuwim)” i 10 innych pieśni za darmo',
    summary: 'Odbierz bezpłatną płytę „The Best of Christian Culture” (46 min muzyki z okładką) i przekaż dalej komuś, kto potrzebuje dziś pokoju i otuchy.',
    xVariants: [
      '🎶 Grudniowe pokrzepienie za darmo: w prezencie oddajemy cały album „The Best of Christian Culture” (m.in. „Wojownik Chrystusa” i „Chrystusie” sł. Tuwima).\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}',
      '✨ Podaj dalej dobrą muzykę! Pobierz bezpłatnie 12 pieśni Christian Culture na telefon lub do samochodu — bez logowania.\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE} #ChristianCulture'
    ],
    waLead: 'Rozpoczynamy grudzień od małej muzycznej niespodzianki. W darmowym albumie „The Best of Christian Culture” czekają m.in. „Wojownik Chrystusa”, „Chrystusie (sł. Julian Tuwim)” i „Nie wiedziałam nic o Tobie” — gotowe do odsłuchu w drodze lub w domu.'
  },
  {
    id: 'wave-3-duch-odwaga',
    startYmd: '2026-12-08',
    endYmd: '2026-12-14',
    title: '🕊️ Pieśni modlitwy i odwagi: „Polski Hymn Chrześcijański”, „Boża Armia” i „Deszcz” w darmowym albumie CC',
    summary: 'Pobierz całą płytę Christian Culture (12 utworów MP3) zupełnie bezinteresownie i wyślij znajomym oraz wspólnocie.',
    xVariants: [
      '🕊️ „Deszcz — Modlitwa o Wylanie Ducha Świętego”, „Boża Armia” i 10 innych utworów czekają w naszym darmowym albumie prezentowym. Podaj dalej!\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}',
      '🎵 Szukasz wartościowej muzyki chrześcijańskiej bez opłat? Odbierz paczkę 12 MP3 od Christian Culture i prześlij ją bliskim.\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}'
    ],
    waLead: 'Zostawiamy Wam dziś porcję pokoju i odwagi na nowy tydzień — w darmowej paczce muzycznej „The Best of Christian Culture” znajdziecie m.in. „Polski Hymn Chrześcijański”, „Bożą Armię” oraz modlitwę „Deszcz”.'
  },
  {
    id: 'wave-4-pokoj-arcydzielo',
    startYmd: '2026-12-15',
    endYmd: '2026-12-21',
    title: '💛 Dla serca w biegu: „Błogosławieństwo w Smutku i Radości”, „Popraw Koronę” i „Boże Arcydzieło” za darmo',
    summary: 'Chwila wytchnienia przy 12 utworach Christian Culture — bez reklam i bez opłat. Podaj link rodzinie, znajomym i w kościele.',
    xVariants: [
      '💛 „Błogosławieństwo w Smutku i Radości”, „Popraw Koronę” i „Boże Arcydzieło” — cały 12-utworowy album CC pobierzesz bezpłatnie i podasz w świat:\n🎧 {DRIVE}\n❤️ {PATRONITE} {ZRZUTKA}',
      '🎁 Kto z Twoich bliskich potrzebuje dziś otuchy? Podaruj mu nasz darmowy album Christian Culture (12 utworów MP3 + okładka).\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}'
    ],
    waLead: 'W środku grudniowego zabiegania warto zatrzymać się przy spokojnym słowie i melodii. W naszym bezpłatnym albumie czekają „Błogosławieństwo w Smutku i Radości”, „Popraw Koronę” i „Boże Arcydzieło”.'
  },
  {
    id: 'wave-5-milosc-boza',
    startYmd: '2026-12-22',
    endYmd: '2026-12-27',
    title: '✨ Zimowy prezent dla każdego: „Miłość Boża (Rzymian 8,38–39)” i cały album CC za darmo',
    summary: 'Niech nikt nie czuje się w tych dniach samotny — pobierz darmową płytę i podaj ją komuś, komu przyda się dobra nowina.',
    xVariants: [
      '✨ Ani smutek, ani samotność nie oddzielą nas od Bożej miłości (Rz 8,38–39). Przyjmij darmowy album Christian Culture (12 pieśni) i wyślij komuś bliskiemu!\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}',
      '🎶 Ciepły prezent muzyczny dla Ciebie i Twojego domu — 12 pieśni Christian Culture zupełnie za darmo. Podaj dalej w świat!\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}'
    ],
    waLead: 'Na spokojne, zimowe wieczory pamiętajmy o ludziach samotnych i szukających nadziei. Pieśń „Miłość Boża (Rzymian 8,38–39)” wraz z całym 12-utworowym albumem Christian Culture jest do pobrania bez żadnych opłat.'
  },
  {
    id: 'wave-6-sylwester-final',
    startYmd: '2026-12-28',
    endYmd: '2026-12-31',
    title: '🎊 Finał roku z Christian Culture: „Szczęśliwego Nowego Roku z Jezusem” i „Dobrze, że jesteś” (darmowy album)',
    summary: 'Dziękujemy za cały rok! Odbierz nasz darmowy 12-utworowy album i przekaż noworoczne błogosławieństwo bliskim, znajomym i w świat.',
    xVariants: [
      '🎊 Wchodzimy w Nowy Rok z wdzięcznością! Pobierz darmowy album „The Best of CC” z pieśniami „Szczęśliwego Nowego Roku z Jezusem” i „Dobrze, że jesteś”:\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}',
      '💛 Na koniec roku powtórzymy najważniejsze: dobrze, że jesteś! Odbierz nasz darmowy album (12 MP3) i wyślij życzenia bliskim.\n🎧 {DRIVE}\n💛 {ZRZUTKA} ❤️ {PATRONITE}'
    ],
    waLead: 'Zbliżamy się do końca roku z ogromną wdzięcznością Bogu i ludziom. Na finał roku zostawiamy Wam darmowy album z utworami „Szczęśliwego Nowego Roku z Jezusem” i „Dobrze, że jesteś” — odbierzcie i wyślijcie dalej w świat!'
  }
]);

export function getWarsawClock(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date).map((p) => [p.type, p.value])
  );
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
    iso: date.toISOString()
  };
}

export function isCampaignActiveDate(ymd) {
  return Boolean(typeof ymd === 'string' && ymd >= CAMPAIGN_START && ymd <= CAMPAIGN_END);
}

export function isQuietHoursWarsaw(date = new Date()) {
  const { totalMinutes } = getWarsawClock(date);
  return totalMinutes >= 21 * 60 + 30 || totalMinutes < 7 * 60 + 30;
}

export function selectWaveForDate(ymd) {
  if (!isCampaignActiveDate(ymd)) return null;
  return SYLWESTER_WAVES.find((w) => ymd >= w.startYmd && ymd <= w.endYmd) || SYLWESTER_WAVES[0];
}

export function weightedXLength(text) {
  const withTco = String(text || '').replace(/https?:\/\/\S+/g, 'X'.repeat(23));
  let len = 0;
  for (const ch of withTco) {
    const cp = ch.codePointAt(0);
    len += cp > 0xffff ? 2 : 1;
  }
  return len;
}

export function buildXPost(wave, { variantIndex = 0, youtubeUrl = '', spotifyUrl = '' } = {}) {
  const variants = Array.isArray(wave?.xVariants) && wave.xVariants.length ? wave.xVariants : ['🎁 {DRIVE}'];
  const tpl = variants[variantIndex % variants.length];
  let post = tpl
    .replace(/\{DRIVE\}/g, GOOGLE_DRIVE_ALBUM_URL)
    .replace(/\{ZRZUTKA\}/g, ZRZUTKA_URL)
    .replace(/\{PATRONITE\}/g, PATRONITE_URL)
    .replace(/\{RADIO\}/g, RADIO_URL)
    .trim();

  if (youtubeUrl && /^https?:\/\//i.test(youtubeUrl)) {
    const candidate = `${post}\n🎬 ${youtubeUrl.trim()}`;
    if (weightedXLength(candidate) <= 278) {
      post = candidate;
    }
  }
  if (spotifyUrl && /^https?:\/\//i.test(spotifyUrl)) {
    const candidate = `${post}\n🎧 ${spotifyUrl.trim()}`;
    if (weightedXLength(candidate) <= 278) {
      post = candidate;
    }
  }
  return post;
}

export function buildWaMessage(wave, { youtubeUrl = '', spotifyUrl = '' } = {}) {
  const lines = [
    '🎁 *Niespodzianka od Christian Culture — darmowy album dla Ciebie!*',
    '',
    wave.waLead,
    '',
    '🎧 *Pobierz cały album za darmo (12 MP3 lub ZIP z okładką, bez opłat i logowania):*',
    `👉 ${GOOGLE_DRIVE_ALBUM_URL}`,
    '',
    '🙏 *Podaj ten prezent dalej:* wyślij link rodzinie, znajomym, w kościele i każdemu, kto potrzebuje dziś pokoju i otuchy.',
    ''
  ];

  if (youtubeUrl && /^https?:\/\//i.test(youtubeUrl)) {
    lines.push(`🎬 Pełna płyta na YouTube: ${youtubeUrl.trim()}`);
  }
  if (spotifyUrl && /^https?:\/\//i.test(spotifyUrl)) {
    const spotifyLabel = /distrokid\.com\/hyperfollow/i.test(spotifyUrl)
      ? '🎧 Płyta na Spotify (Pre-Save / odsłuch)'
      : '🎧 Pełna płyta na Spotify';
    lines.push(`${spotifyLabel}: ${spotifyUrl.trim()}`);
  }

  lines.push(
    `💛 Dobrowolna cegiełka (Zrzutka.pl): ${ZRZUTKA_URL}`,
    `❤️ Stałe wsparcie (Patronite): ${PATRONITE_URL}`,
    `📻 Radio bez reklam 24/7: ${RADIO_URL}`,
    '',
    '— Wioletta i Cezary Rogowscy · Christian Culture'
  );

  return lines.join('\n');
}

export function loadCampaignState(statePath = STATE_PATH) {
  const base = {
    campaignId: 'best-of-cc-sylwester-2026',
    youtubeUrl: null,
    spotifyUrl: null,
    lastXPostAt: null,
    xCount: 0,
    xVariantIdx: 0,
    lastTablicaPostAt: null,
    tablicaCount: 0,
    waSentGroups: {},
    waNazirLastSentAt: null,
    history: []
  };
  try {
    if (fs.existsSync(statePath)) {
      const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      return {
        ...base,
        ...parsed,
        waSentGroups: { ...(parsed.waSentGroups || {}) },
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    }
  } catch {}
  return base;
}

export function saveCampaignState(state, statePath = STATE_PATH) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

export function loadEligibleWaGroups(wektorRoot = WEKTOR_ROOT) {
  const stateFile = path.join(wektorRoot, 'data', 'wa_groups_state.json');
  const dumpFile = path.join(wektorRoot, 'whatsapp_groups_dump.json');
  const readOnlyJids = new Set();

  if (fs.existsSync(dumpFile)) {
    try {
      const dump = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
      const list = Array.isArray(dump) ? dump : [];
      for (const item of list) {
        if (item?.readOnly && item?.jid) readOnlyJids.add(item.jid);
      }
    } catch {}
  }

  const byJid = new Map();
  if (fs.existsSync(stateFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const groups = Array.isArray(parsed) ? parsed : (parsed.groups || []);
      for (const g of groups) {
        const jid = g.groupId || g.id;
        if (!jid || EXCLUDED_WA_JIDS.has(jid) || readOnlyJids.has(jid)) continue;
        byJid.set(jid, {
          groupId: jid,
          name: g.name || jid,
          lastGroupTouchMs: g.lastSentIso ? Date.parse(g.lastSentIso) || 0 : 0,
          lastGroupTouchDate: g.lastSentDate || null
        });
      }
    } catch {}
  }

  if (byJid.size === 0 && fs.existsSync(dumpFile)) {
    try {
      const dump = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
      for (const item of Array.isArray(dump) ? dump : []) {
        const jid = item?.jid;
        if (!jid || item.readOnly || EXCLUDED_WA_JIDS.has(jid)) continue;
        byJid.set(jid, { groupId: jid, name: item.name || jid, lastGroupTouchMs: 0, lastGroupTouchDate: null });
      }
    } catch {}
  }

  return [...byJid.values()];
}

export function selectNextWaGroups(groups, state, { maxCount = WA_MAX_GROUPS_PER_RUN, nowMs = Date.now(), minDays = WA_GROUP_DEDUP_DAYS, todayYmd = null } = {}) {
  const cap = Math.min(WA_MAX_GROUPS_PER_RUN, Math.max(0, Number(maxCount) || 0));
  if (cap === 0) return [];
  const minGapMs = minDays * 24 * 3600 * 1000;
  const sentMap = state?.waSentGroups || {};

  const eligible = groups
    .filter((g) => g?.groupId && !EXCLUDED_WA_JIDS.has(g.groupId))
    .map((g) => {
      const rec = sentMap[g.groupId];
      const campaignSentMs = rec?.lastSentIso ? Date.parse(rec.lastSentIso) : 0;
      const validCampaignMs = Number.isFinite(campaignSentMs) ? campaignSentMs : 0;
      const touchedToday = Boolean(todayYmd && g.lastGroupTouchDate === todayYmd);
      return {
        ...g,
        campaignSentMs: validCampaignMs,
        touchedToday,
        eligible: !validCampaignMs || nowMs - validCampaignMs >= minGapMs
      };
    })
    .filter((g) => g.eligible)
    .sort((a, b) => Number(a.touchedToday) - Number(b.touchedToday) || a.campaignSentMs - b.campaignSentMs || a.lastGroupTouchMs - b.lastGroupTouchMs);

  return eligible.slice(0, cap);
}

function loadEnvLocal() {
  for (const envFile of [path.join(ROOT, '.env.local'), path.join(ROOT, '.env')]) {
    if (!fs.existsSync(envFile)) continue;
    try {
      for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const k = trimmed.slice(0, eq).trim();
          const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[k]) process.env[k] = v;
        }
      }
    } catch {}
  }
}

export async function publishXViaPlaywright(tweetText, imagePath, screenshotPath) {
  loadEnvLocal();
  const authToken = process.env.X_AUTH_TOKEN;
  if (!authToken) throw new Error('Brak X_AUTH_TOKEN w .env.local');

  const profileDir = path.join(ROOT, '.x_browser_profile');
  fs.mkdirSync(profileDir, { recursive: true });
  const ctx = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(() => chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }));

  await ctx.addCookies([
    { name: 'auth_token', value: authToken, domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
    { name: 'auth_token', value: authToken, domain: '.twitter.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' }
  ]);

  try {
    const page = await ctx.newPage();
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);
    if (page.url().includes('/login') || page.url().includes('/i/flow/login')) {
      throw new Error('Sesja X wygasła — wymagane odświeżenie X_AUTH_TOKEN');
    }

    let isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1000 }).catch(() => false);
    const dialogSel = '[role="dialog"] div[data-testid="tweetTextarea_0"], [role="dialog"] div[role="textbox"][contenteditable="true"], [role="dialog"] textarea';
    const inlineSel = 'main textarea, textarea[aria-label="What\'s happening?"], textarea[placeholder*="Co się dzieje"], div[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    let textarea = isDialog ? page.locator(dialogSel).first() : page.locator(inlineSel).first();

    if (!(await textarea.isVisible({ timeout: 6000 }).catch(() => false))) {
      const composeBtn = page.locator('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/post"]').first();
      if (await composeBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await composeBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
        isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1500 }).catch(() => false);
        textarea = isDialog ? page.locator(dialogSel).first() : page.locator(inlineSel).first();
      }
    }

    if (!(await textarea.isVisible({ timeout: 4000 }).catch(() => false))) {
      await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 2000 }).catch(() => false);
      textarea = isDialog ? page.locator(dialogSel).first() : page.locator(inlineSel).last();
    }

    await textarea.waitFor({ state: 'visible', timeout: 25000 });
    await textarea.click({ force: true }).catch(() => textarea.focus());
    await page.waitForTimeout(500);
    await page.keyboard.insertText(tweetText);
    await page.waitForTimeout(1500);

    if (imagePath && fs.existsSync(imagePath)) {
      isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1000 }).catch(() => false);
      const fileInput = isDialog
        ? page.locator('[role="dialog"] input[data-testid="fileInput"], [role="dialog"] input[type="file"]').first()
        : page.locator('input[data-testid="fileInput"], main input[type="file"], input[type="file"]').last();
      await fileInput.setInputFiles(imagePath);
      await page.waitForSelector('div[data-testid="attachments"], button[aria-label*="Remove"], button[aria-label*="Usuń"]', { timeout: 15000 }).catch(() => page.waitForTimeout(3000));
    }

    isDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    const scope = isDialog ? page.locator('[role="dialog"]') : page.locator('main');
    const postBtn = scope.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]')
      .or(scope.getByRole('button', { name: /^(Post|Opublikuj)$/i }))
      .last();
    await postBtn.waitFor({ state: 'visible', timeout: 10000 });
    for (let w = 0; w < 30; w++) {
      const dis = await postBtn.isDisabled().catch(() => true);
      const aria = await postBtn.getAttribute('aria-disabled').catch(() => 'false');
      if (!dis && aria !== 'true') break;
      await page.waitForTimeout(500);
    }
    await postBtn.click();
    await page.waitForTimeout(1500);

    if (await postBtn.isVisible().catch(() => false)) {
      const disAfter = await postBtn.isDisabled().catch(() => true);
      if (!disAfter) {
        await textarea.focus().catch(() => {});
        await page.keyboard.press('Control+Enter').catch(() => {});
      }
    }

    let confirmed = false;
    for (let i = 0; i < 16; i++) {
      const toast = await page.locator('[role="alert"], div[data-testid="toast"]').first().innerText({ timeout: 500 }).catch(() => '');
      if (/sent|wysłano|post was sent/i.test(toast)) { confirmed = true; break; }
      if (isDialog) {
        if (!(await page.locator('[role="dialog"]').isVisible().catch(() => true))) { confirmed = true; break; }
      } else {
        const val = await textarea.inputValue().catch(() => textarea.innerText().catch(() => 'NONEMPTY'));
        if (!String(val).trim()) { confirmed = true; break; }
      }
      await page.waitForTimeout(500);
    }

    if (screenshotPath) {
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: screenshotPath }).catch(() => {});
    }
    if (!confirmed) throw new Error('Brak potwierdzenia publikacji posta na platformie X');

    try {
      const data = fs.existsSync(X_HISTORY_PATH) ? JSON.parse(fs.readFileSync(X_HISTORY_PATH, 'utf8')) : { version: '1.0', published: [] };
      const arr = Array.isArray(data) ? data : (data.published || []);
      arr.unshift({
        id: `best-of-cc-${Date.now()}`,
        title: 'The Best of Christian Culture — darmowy album',
        url: `${RADIO_URL}/?show_video_banner=1`,
        image: COVER_REL_PATH,
        publishedAt: new Date().toISOString()
      });
      fs.writeFileSync(X_HISTORY_PATH, JSON.stringify({ version: '1.0', published: arr.slice(0, 500) }, null, 2), 'utf8');
    } catch {}

    return { ok: true, screenshotPath: screenshotPath || null };
  } finally {
    await Promise.race([ctx.close(), new Promise((r) => setTimeout(r, 4000))]).catch(() => {});
  }
}

export async function pushWhatsAppD1(targetGroupId, message) {
  const req = createRequire(import.meta.url);
  const mcClient = req(path.join(WEKTOR_ROOT, 'mc_d1_client.js'));
  const safeCommand = `wyślij celowane [${targetGroupId}]: ${message}`;
  const res = await mcClient.pushCommand(safeCommand, targetGroupId, 2, null);
  return { ok: true, targetGroupId, d1: res };
}

export async function runSylwesterCampaign(options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const dryRun = Boolean(options.dryRun);
  const scheduled = Boolean(options.scheduled);
  const runNow = Boolean(options.runNow);
  const xOnly = Boolean(options.xOnly);
  const includeNazir = Boolean(options.includeNazir);
  const statePath = options.statePath || STATE_PATH;

  const clock = getWarsawClock(now);
  if (!isCampaignActiveDate(clock.ymd)) {
    return { ok: true, status: 'campaign_ended', ymd: clock.ymd };
  }
  if (scheduled && isQuietHoursWarsaw(now)) {
    return { ok: true, status: 'quiet_hours', clock };
  }

  const state = loadCampaignState(statePath);
  const youtubeUrl = options.youtubeUrl || process.env.CC_BEST_OF_YT_URL || state.youtubeUrl || '';
  const spotifyUrl = options.spotifyUrl || process.env.CC_BEST_OF_SPOTIFY_URL || state.spotifyUrl || '';
  if (youtubeUrl) state.youtubeUrl = youtubeUrl;
  if (spotifyUrl) state.spotifyUrl = spotifyUrl;

  const wave = selectWaveForDate(clock.ymd);
  const coverFull = path.join(ROOT, COVER_REL_PATH);
  const xText = buildXPost(wave, { variantIndex: state.xVariantIdx || 0, youtubeUrl, spotifyUrl });
  const waText = buildWaMessage(wave, { youtubeUrl, spotifyUrl });

  const nowMs = now.getTime();
  const shouldRunX = xOnly || runNow || !state.lastXPostAt || nowMs - Date.parse(state.lastXPostAt) >= X_MIN_INTERVAL_MS;
  const shouldRunTablica = xOnly ? false : (runNow || !state.lastTablicaPostAt || nowMs - Date.parse(state.lastTablicaPostAt) >= TABLICA_MIN_INTERVAL_MS);

  const groups = loadEligibleWaGroups(WEKTOR_ROOT);
  const nextWaGroups = xOnly ? [] : selectNextWaGroups(groups, state, {
    maxCount: WA_MAX_GROUPS_PER_RUN,
    nowMs,
    minDays: WA_GROUP_DEDUP_DAYS,
    todayYmd: clock.ymd
  });

  if (dryRun || options.statusOnly) {
    return {
      ok: true,
      dryRun,
      statusOnly: Boolean(options.statusOnly),
      ymd: clock.ymd,
      waveId: wave.id,
      youtubeUrl,
      spotifyUrl,
      xPlanned: shouldRunX,
      xWeightedLength: weightedXLength(xText),
      xText,
      tablicaPlanned: shouldRunTablica,
      waTargets: nextWaGroups.map((g) => ({ groupId: g.groupId, name: g.name })),
      waNazirIncluded: includeNazir,
      waText
    };
  }

  const results = { waveId: wave.id, ymd: clock.ymd, x: null, tablica: null, whatsapp: [] };

  if (shouldRunX) {
    try {
      const shotPath = options.xScreenshotPath || null;
      results.x = await publishXViaPlaywright(xText, coverFull, shotPath);
      state.lastXPostAt = now.toISOString();
      state.xCount = (state.xCount || 0) + 1;
      state.xVariantIdx = (state.xVariantIdx || 0) + 1;
    } catch (e) {
      results.x = { ok: false, error: e.message };
    }
  } else {
    results.x = { ok: true, skipped: true, reason: 'interval_48h' };
  }

  if (shouldRunTablica) {
    try {
      const tRes = await publishEcosystemItemToTablica({
        type: 'music',
        title: wave.title,
        summary: wave.summary,
        url: `${RADIO_URL}/?show_video_banner=1#${wave.id}-${clock.ymd}`,
        date: clock.ymd,
        author: state.tablicaCount % 2 === 0 ? 'Cezary Rogowski' : 'Wioletta Rogowska'
      }, {
        imagePath: coverFull,
        force: true
      });
      results.tablica = tRes;
      if (tRes?.ok) {
        state.lastTablicaPostAt = now.toISOString();
        state.tablicaCount = (state.tablicaCount || 0) + 1;
      }
    } catch (e) {
      results.tablica = { ok: false, error: e.message };
    }
  } else {
    results.tablica = { ok: true, skipped: true, reason: 'interval_96h' };
  }

  const waQueueTargets = [];
  if (!xOnly && includeNazir) {
    waQueueTargets.push({ groupId: NAZIR_GROUP_JID, name: 'Grupa Nazira - Christian Culture', isNazir: true });
  }
  for (const g of nextWaGroups) waQueueTargets.push(g);

  for (const target of waQueueTargets) {
    try {
      const qRes = await pushWhatsAppD1(target.groupId, waText);
      results.whatsapp.push({ ...qRes, name: target.name });
      if (target.isNazir) {
        state.waNazirLastSentAt = now.toISOString();
      } else {
        state.waSentGroups[target.groupId] = { lastSentIso: now.toISOString(), waveId: wave.id, groupName: target.name };
      }
    } catch (e) {
      results.whatsapp.push({ ok: false, targetGroupId: target.groupId, name: target.name, error: e.message });
    }
  }

  state.history.unshift({ timestamp: now.toISOString(), ...results });
  state.history = state.history.slice(0, 60);
  saveCampaignState(state, statePath);

  return { ok: true, results };
}

function parseCliArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : '';
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const args = new Set(process.argv.slice(2));
  runSylwesterCampaign({
    dryRun: args.has('--dry-run'),
    statusOnly: args.has('--status'),
    runNow: args.has('--run-now'),
    xOnly: args.has('--x-only'),
    scheduled: args.has('--scheduled') || (!args.has('--dry-run') && !args.has('--status') && !args.has('--run-now') && !args.has('--x-only')),
    includeNazir: args.has('--include-nazir'),
    youtubeUrl: parseCliArg('--yt-url'),
    spotifyUrl: parseCliArg('--spotify-url'),
    xScreenshotPath: parseCliArg('--x-screenshot')
  }).then((res) => {
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error('❌ Błąd kampanii The Best of CC:', err.message);
    process.exit(1);
  });
}
