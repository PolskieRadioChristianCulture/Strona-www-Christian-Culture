#!/usr/bin/env node
/**
 * Automatyczna całodniowa publikacja zasobów ekosystemu Christian Culture
 * na Tablicy Społeczności LUMINA (https://polskieradio.cc/tablica).
 *
 * Rotacja między trzema oficjalnymi głosami:
 *   1. Christian Culture (radiocc)
 *   2. Cezary Rogowski (cezaryrgowski)
 *   3. Wioletta Rogowska (wiolettarogowska)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_CC = path.resolve(__dirname, '..');
const WEKTOR_ROOT = path.resolve(ROOT_CC, '..', 'Wektor1_VideoFactory');
const DEFAULT_STATE_PATH = path.join(WEKTOR_ROOT, 'data', 'tablica_broadcaster_state.json');
const DEFAULT_DEDUP_HOURS = 12;

export const TABLICA_VOICES = Object.freeze([
  Object.freeze({
    slug: 'radiocc',
    author: 'Christian Culture',
    authorAvatar: 'avatar_christian_culture_hq_2026.jpg',
    authorRole: 'Oficjalny Portal Misji',
    profileUrl: 'https://polskieradio.cc/lumina-profile.html?u=radiocc'
  }),
  Object.freeze({
    slug: 'cezaryrgowski',
    author: 'Cezary Rogowski',
    authorAvatar: 'avatar_cezary_official.jpg',
    authorRole: 'Założyciel Christian Culture',
    profileUrl: 'https://polskieradio.cc/lumina.cezaryrgowski.html'
  }),
  Object.freeze({
    slug: 'wiolettarogowska',
    author: 'Wioletta Rogowska',
    authorAvatar: 'avatar_wioletta_official.jpg',
    authorRole: 'Współzałożycielka & Redakcja',
    profileUrl: 'https://polskieradio.cc/lumina.wiolettarogowska.html'
  })
]);

const VOICE_INTROS = Object.freeze({
  radiocc: Object.freeze({
    news: 'Zapraszamy do lektury najnowszego materiału w ekosystemie Christian Culture:',
    verse: 'Słowo Boże na tę chwilę w ciągu dnia:',
    book: 'Polecamy wartościową lekturę biblijną i duchową:',
    music: 'Włącz teraz i posłuchaj w Christian Culture:',
    course: 'Zapraszamy do codziennego studium Pisma Świętego:',
    vod: 'Polecamy materiał wideo na dziś:',
    profile: 'Poznaj ludzi i inicjatywy tworzące naszą społeczność:',
    module: 'Odkryj nasze zasoby na cały dzień:'
  }),
  cezaryrgowski: Object.freeze({
    news: 'Polecam Wam dziś ten ważny artykuł do spokojnego przeczytania:',
    verse: 'Słowo, przy którym warto się dziś zatrzymać choć na chwilę:',
    book: 'Zachęcam do sięgnięcia po tę książkę i rozważania:',
    music: 'Włączam u siebie i polecam również Wam na dzisiejszy czas:',
    course: 'Zapraszam do wspólnego odkrywania Pisma Świętego:',
    vod: 'Warto obejrzeć ten materiał i podać go dalej bliskim:',
    profile: 'Dzielę się z Wami kolejnym miejscem w naszym ekosystemie:',
    module: 'Korzystajcie śmiało z naszych narzędzi i materiałów:'
  }),
  wiolettarogowska: Object.freeze({
    news: 'Serdecznie polecam Wam dziś ten tekst — warto przeczytać do końca:',
    verse: 'Niech ten werset niesie Wam dziś pokój i światło:',
    book: 'Ciepło polecam Wam tę publikację na dobrą chwilę w ciągu dnia:',
    music: 'Posłuchajcie razem z nami — piękny czas z muzyką i Słowem:',
    course: 'Zapraszam do dzisiejszej lekcji i chwili refleksji z Biblią:',
    vod: 'Zachęcam do obejrzenia i podzielenia się z innymi:',
    profile: 'Zapraszamy Was serdecznie do naszej wspólnej przestrzeni:',
    module: 'Dzielę się z Wami kolejnym dobrym miejscem na portalu:'
  })
});

const CATEGORY_HASHTAGS = Object.freeze({
  news: '#ChristianCulture #CCNNews',
  verse: '#SłowoBoże #Biblia #ChristianCulture',
  book: '#KsiążkiCC #CzytamzCC #ChristianCulture',
  music: '#BibliaAudio #RadioCC #ChristianCulture',
  course: '#AkademiaBiblijna #ZBibliąZaPanBrat #ChristianCulture',
  vod: '#VOD #WartoObejrzeć #ChristianCulture',
  profile: '#LUMINA #SpołecznośćCC #ChristianCulture',
  module: '#ChristianCulture #LUMINA'
});

const NON_WEB_ROOT_PREFIXES = ['data/', 'scripts/', 'tests/', 'node_modules/', '.git/', 'tmp/'];

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getWarsawDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function normalizeItemUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) {
    trimmed = `https://polskieradio.cc${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    const cleanPath = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.origin}${cleanPath}${parsed.search}`.toLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, '').toLowerCase();
  }
}

export function normalizeCategory(rawTypeOrCategory) {
  const value = String(rawTypeOrCategory || '').trim().toLowerCase();
  if (!value || value === 'ckd') return 'module';
  if (value.includes('news') || value.includes('portal') || value === 'article') return 'news';
  if (value.includes('verse') || value.includes('werset') || value.includes('biblia_werset')) return 'verse';
  if (value.includes('book') || value.includes('książk') || value.includes('ksiazk')) return 'book';
  if (value.includes('music') || value.includes('podcast') || value.includes('song') || value.includes('audio') || value.includes('radio')) return 'music';
  if (value.includes('course') || value.includes('akademia') || value.includes('lesson')) return 'course';
  if (value.includes('vod') || value.includes('video') || value.includes('sds') || value.includes('tv')) return 'vod';
  if (value.includes('profile') || value.includes('lumina') || value.includes('społeczno')) return 'profile';
  return 'module';
}

export function isSdsItem(item = {}) {
  const haystack = [
    item.title,
    item.subtitle,
    item.summary,
    item.excerpt,
    item.category,
    item.type,
    item.url,
    item.host,
    item.author
  ]
    .filter(Boolean)
    .join(' ');
  return /\b(sds|studio dobrego s[łl]owa|apokalips[ay]?|mariusz\s+adamczyk|wincenty\s+sieja)\b/i.test(haystack);
}

export function isFutureDatedItem(item = {}, now = new Date()) {
  const today = getWarsawDateString(now);
  const rawDate = item.date || item.publishedDate || item.publishDate || item.scheduledDate;
  if (typeof rawDate === 'string') {
    const match = rawDate.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match && match[1] > today) {
      return { future: true, itemDate: match[1], today };
    }
  }
  return { future: false, itemDate: rawDate || null, today };
}

export function loadTablicaState(statePath = process.env.TABLICA_STATE_PATH || DEFAULT_STATE_PATH) {
  const base = {
    lastVoiceSlug: null,
    voiceCounts: { radiocc: 0, cezaryrgowski: 0, wiolettarogowska: 0 },
    recentUrls: {},
    lastPublishedAt: null,
    totalPublished: 0
  };
  try {
    if (!fs.existsSync(statePath)) return base;
    const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return {
      ...base,
      ...parsed,
      voiceCounts: { ...base.voiceCounts, ...(parsed.voiceCounts || {}) },
      recentUrls: { ...(parsed.recentUrls || {}) }
    };
  } catch {
    return base;
  }
}

export function saveTablicaState(state, statePath = process.env.TABLICA_STATE_PATH || DEFAULT_STATE_PATH) {
  const cutoffMs = Date.now() - 48 * 3600 * 1000;
  const prunedUrls = {};
  for (const [k, iso] of Object.entries(state.recentUrls || {})) {
    const ts = Date.parse(iso);
    if (Number.isFinite(ts) && ts >= cutoffMs) {
      prunedUrls[k] = iso;
    }
  }
  const cleanState = {
    lastVoiceSlug: state.lastVoiceSlug || null,
    voiceCounts: state.voiceCounts || { radiocc: 0, cezaryrgowski: 0, wiolettarogowska: 0 },
    recentUrls: prunedUrls,
    lastPublishedAt: state.lastPublishedAt || null,
    totalPublished: Number(state.totalPublished || 0)
  };
  ensureDirForFile(statePath);
  fs.writeFileSync(statePath, JSON.stringify(cleanState, null, 2), 'utf8');
  return cleanState;
}

export function selectTablicaVoice(item = {}, state = {}, requestedSlug = null) {
  if (requestedSlug) {
    const explicit = TABLICA_VOICES.find((v) => v.slug === requestedSlug.toLowerCase());
    if (explicit) return explicit;
  }

  const lastSlug = state.lastVoiceSlug || null;
  const counts = state.voiceCounts || {};
  const authorHint = String(item.author || item.authorName || '').toLowerCase();

  // Jeśli treść ma wyraźne autorstwo Cezarego lub Wioletty, wybierz ten głos (o ile nie mówił jako ostatni)
  if (!isSdsItem(item)) {
    if (authorHint.includes('wiolett') && lastSlug !== 'wiolettarogowska') {
      return TABLICA_VOICES[2];
    }
    if (authorHint.includes('cezary') && lastSlug !== 'cezaryrgowski') {
      return TABLICA_VOICES[1];
    }
  }

  // Sprawiedliwa rotacja round-robin z wyrównaniem liczników i bez dwóch wpisów z rzędu tym samym głosem
  const lastIdx = TABLICA_VOICES.findIndex((v) => v.slug === lastSlug);
  const rotatedOrder = [];
  for (let i = 1; i <= TABLICA_VOICES.length; i += 1) {
    rotatedOrder.push(TABLICA_VOICES[(Math.max(lastIdx, -1) + i) % TABLICA_VOICES.length]);
  }

  const nonConsecutive = rotatedOrder.filter((v) => v.slug !== lastSlug);
  const pool = nonConsecutive.length > 0 ? nonConsecutive : rotatedOrder;

  let chosen = pool[0];
  let bestCount = Number(counts[chosen.slug] || 0);
  for (const candidate of pool.slice(1)) {
    const count = Number(counts[candidate.slug] || 0);
    if (count < bestCount) {
      chosen = candidate;
      bestCount = count;
    }
  }
  return chosen;
}

export function resolveTablicaImageUrl(item = {}, imagePath = null, rootDir = ROOT_CC) {
  const candidates = [];

  if (imagePath && typeof imagePath === 'string') {
    const absImage = path.isAbsolute(imagePath) ? imagePath : path.resolve(rootDir, imagePath);
    const rel = path.relative(rootDir, absImage).replace(/\\/g, '/');
    if (rel && !rel.startsWith('..') && fs.existsSync(absImage)) {
      const stripped = rel.startsWith('.pages-release/') ? rel.slice('.pages-release/'.length) : rel;
      const lower = stripped.toLowerCase();
      if (!NON_WEB_ROOT_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
        return `https://polskieradio.cc/${stripped}`;
      }
    }
  }

  if (typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    candidates.push(item.imageUrl.trim());
  }
  if (typeof item.image === 'string' && item.image.trim()) {
    candidates.push(item.image.trim());
  }

  for (const raw of candidates) {
    if (/^https?:\/\//i.test(raw)) return raw;
    const cleanRel = raw.replace(/^\/+/, '').replace(/\\/g, '/');
    if (!cleanRel) continue;
    if (fs.existsSync(path.join(rootDir, cleanRel))) {
      return `https://polskieradio.cc/${cleanRel}`;
    }
    if (!cleanRel.includes('/') && fs.existsSync(path.join(rootDir, 'images', cleanRel))) {
      return `https://polskieradio.cc/images/${cleanRel}`;
    }
  }

  return null;
}

function cleanHumanSummary(text, maxLen = 320) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/gi, '')
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

export function formatTablicaPost(item = {}, voice = TABLICA_VOICES[0], imageUrl = null) {
  const category = normalizeCategory(item.type || item.category);
  const voiceIntros = VOICE_INTROS[voice.slug] || VOICE_INTROS.radiocc;
  const intro = voiceIntros[category] || voiceIntros.module;

  const title = String(item.title || 'Wartość na dziś w Christian Culture').trim();
  const sds = isSdsItem(item);
  const rawSummary = cleanHumanSummary(item.summary || item.lead || item.excerpt || item.subtitle || item.description || '');

  const rawUrl = String(item.url || 'https://polskieradio.cc').trim();
  const fullUrl = rawUrl.startsWith('/') ? `https://polskieradio.cc${rawUrl}` : rawUrl;
  const tags = CATEGORY_HASHTAGS[category] || CATEGORY_HASHTAGS.module;

  const lines = [intro, '', title];

  if (sds) {
    lines.push('Gospodarz: Mariusz Adamczyk · Produkcja: Studio Dobrego Słowa');
  } else if (rawSummary && rawSummary.toLowerCase() !== title.toLowerCase()) {
    lines.push(rawSummary);
  }

  lines.push('', fullUrl, '', tags);

  const sourceSlug =
    String(item.slug || '')
      .trim() ||
    fullUrl
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9/_-]+/gi, '-') ||
    category;

  const doc = {
    author: voice.author,
    authorSlug: voice.slug,
    authorAvatar: voice.authorAvatar,
    authorRole: voice.authorRole,
    title,
    text: lines.join('\n'),
    category,
    type: 'post',
    isDevotion: false,
    _isCkdDaily: false,
    sourceUrl: fullUrl,
    actionUrl: fullUrl,
    sourceSlug,
    publishedBy: voice.slug,
    likes: 1,
    amen: 1
  };

  if (imageUrl) {
    doc.image = imageUrl;
    doc.imageUrl = imageUrl;
  }

  return doc;
}

function resolveServiceAccountPath(rootDir = ROOT_CC) {
  const candidates = [
    process.env.LUMINA_SERVICE_ACCOUNT_PATH,
    path.join(rootDir, 'luminaServiceAccountKey.json'),
    path.join(WEKTOR_ROOT, 'luminaServiceAccountKey.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function getFirebaseAdmin() {
  const req = createRequire(import.meta.url);
  try {
    return req('firebase-admin');
  } catch {
    return req(path.join(WEKTOR_ROOT, 'node_modules', 'firebase-admin'));
  }
}

function initLuminaFirestore(rootDir = ROOT_CC) {
  const saPath = resolveServiceAccountPath(rootDir);
  if (!saPath) {
    throw new Error('Brak pliku luminaServiceAccountKey.json dla połączenia z Tablicą LUMINA.');
  }
  const admin = getFirebaseAdmin();
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  const appName = 'lumina-tablica-broadcaster';
  const existing = admin.apps.find((a) => a && a.name === appName);
  const app =
    existing ||
    admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'lumina-cc'
      },
      appName
    );
  return { admin, db: app.firestore() };
}

async function isRecentlyPublishedInFirestore(db, normalizedUrl, dedupHours) {
  if (!normalizedUrl || dedupHours <= 0) return false;
  const cutoffMs = Date.now() - dedupHours * 3600 * 1000;
  const snap = await db.collection('lumina_posts').orderBy('createdAtTimestamp', 'desc').limit(15).get();
  for (const docSnap of snap.docs) {
    const data = docSnap.data() || {};
    const existingNorm = normalizeItemUrl(data.sourceUrl || data.actionUrl || '');
    if (existingNorm && existingNorm === normalizedUrl) {
      const tsMillis =
        typeof data.createdAtTimestamp?.toMillis === 'function'
          ? data.createdAtTimestamp.toMillis()
          : Date.parse(data.publishedAt || '');
      if (!Number.isFinite(tsMillis) || tsMillis >= cutoffMs) {
        return true;
      }
    }
  }
  return false;
}

export async function publishEcosystemItemToTablica(item, options = {}) {
  const {
    imagePath = null,
    dryRun = false,
    force = false,
    voiceSlug = null,
    dedupHours = DEFAULT_DEDUP_HOURS,
    rootDir = ROOT_CC,
    statePath = process.env.TABLICA_STATE_PATH || DEFAULT_STATE_PATH
  } = options;

  if (!item || !item.title || !item.url) {
    return { ok: false, skipped: true, reason: 'missing_title_or_url' };
  }

  const dateGuard = isFutureDatedItem(item);
  if (dateGuard.future && !force) {
    return {
      ok: false,
      skipped: true,
      reason: 'future_date_locked',
      itemDate: dateGuard.itemDate,
      today: dateGuard.today
    };
  }

  const state = loadTablicaState(statePath);
  const normalizedUrl = normalizeItemUrl(item.url);
  if (!force && dedupHours > 0 && normalizedUrl && state.recentUrls[normalizedUrl]) {
    const prevMs = Date.parse(state.recentUrls[normalizedUrl]);
    if (Number.isFinite(prevMs) && Date.now() - prevMs < dedupHours * 3600 * 1000) {
      return { ok: false, skipped: true, reason: 'duplicate_local_window', url: item.url };
    }
  }

  const voice = selectTablicaVoice(item, state, voiceSlug);
  const imageUrl = resolveTablicaImageUrl(item, imagePath, rootDir);
  const payload = formatTablicaPost(item, voice, imageUrl);

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      voice: voice.slug,
      author: voice.author,
      imageUrl: imageUrl || null,
      payload
    };
  }

  const { admin, db } = initLuminaFirestore(rootDir);

  if (!force && normalizedUrl) {
    const alreadyInCloud = await isRecentlyPublishedInFirestore(db, normalizedUrl, dedupHours);
    if (alreadyInCloud) {
      return { ok: false, skipped: true, reason: 'duplicate_firestore_window', url: item.url };
    }
  }

  const nowIso = new Date().toISOString();
  const docRef = await db.collection('lumina_posts').add({
    ...payload,
    createdAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: nowIso
  });

  state.lastVoiceSlug = voice.slug;
  state.voiceCounts[voice.slug] = Number(state.voiceCounts[voice.slug] || 0) + 1;
  if (normalizedUrl) {
    state.recentUrls[normalizedUrl] = nowIso;
  }
  state.lastPublishedAt = nowIso;
  state.totalPublished = Number(state.totalPublished || 0) + 1;
  saveTablicaState(state, statePath);

  return {
    ok: true,
    docId: docRef.id,
    voice: voice.slug,
    author: voice.author,
    title: payload.title,
    sourceUrl: payload.sourceUrl,
    imageUrl: payload.image || null
  };
}

function loadLatestHistoryItems(limit = 3, rootDir = ROOT_CC) {
  const xHistoryPath = path.join(rootDir, 'data', 'x_published_history.json');
  const items = [];
  if (fs.existsSync(xHistoryPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(xHistoryPath, 'utf8'));
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.published)
          ? raw.published
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
      for (const entry of list) {
        if (entry && entry.title && entry.url) {
          items.push({
            ...entry,
            summary: entry.summary || entry.subtitle || ''
          });
        }
      }
    } catch {
      // ignoruj uszkodzony plik historii
    }
  }
  return items.slice(0, limit);
}

async function runCli() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(
      'Użycie: node scripts/publish-ecosystem-to-tablica.mjs [--dry-run] [--from-latest [N]] [--voice radiocc|cezaryrgowski|wiolettarogowska] [--force]'
    );
    return;
  }

  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const voiceIdx = args.indexOf('--voice');
  const voiceSlug = voiceIdx !== -1 ? args[voiceIdx + 1] : null;
  const fromLatest = args.includes('--from-latest') || args.includes('--latest');

  if (fromLatest) {
    const rawCount = args[args.indexOf('--from-latest') + 1] || args[args.indexOf('--latest') + 1];
    const count = rawCount && /^\d+$/.test(rawCount) ? Math.min(10, Math.max(1, Number(rawCount))) : 1;
    const candidates = loadLatestHistoryItems(15);
    const eligible = candidates.filter((c) => !isFutureDatedItem(c).future).slice(0, count);
    if (eligible.length === 0) {
      console.log('ℹ Brak kwalifikujących się pozycji z dzisiejszą datą do publikacji.');
      return;
    }
    for (const entry of eligible) {
      const res = await publishEcosystemItemToTablica(entry, {
        imagePath: entry.image || null,
        dryRun,
        force,
        voiceSlug
      });
      console.log(JSON.stringify(res));
    }
    return;
  }

  const state = loadTablicaState();
  console.log(JSON.stringify({ ok: true, state }, null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  runCli().catch((err) => {
    console.error('❌ Błąd publish-ecosystem-to-tablica:', err.message);
    process.exit(1);
  });
}
