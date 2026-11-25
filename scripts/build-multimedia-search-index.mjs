#!/usr/bin/env node
/**
 * Buduje lekki, bogaty indeks multimedialny dla testowej Wyszukiwarki CC v2
 * (test/wyszukiwarka/media-index.json) na bazie zweryfikowanych źródeł repo polskieradio.cc:
 * - data/youtube_published_history.json (publiczne wideo YT CC z videoId i miniaturą HD)
 * - data/biblijne-uwielbienie-playlist.json (pieśni uwielbieniowe z YouTube)
 * - biblia-audio/data/catalog.json (opublikowane odcinki MP3 do odsłuchu inline)
 * - data/cc-channels.json (37 kanałów i stref ekosystemu z okładkami)
 * - images/academy/daily/ + images/social/yt-community/ (grafiki lekcji i Wiadomości z Nieba)
 * - data/werset_dnia_365_ubg.json (wybrane kluczowe wersety UBG do natychmiastowej odpowiedzi)
 * - Kontekstowe karty autoreklamy ekosystemu („Polecane”, bez fałszywego LIVE)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'test', 'wyszukiwarka', 'media-index.json');

function readJson(relPath, fallback = null) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch {
    return fallback;
  }
}

function extractYtId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ensureLocalImage(imgPath, fallback = '/images/kultura/card-biblia.jpg') {
  if (!imgPath) return fallback;
  if (/^https?:\/\//i.test(imgPath)) return imgPath;
  const normalized = imgPath.startsWith('/') ? imgPath : `/${imgPath.replace(/^\.?\//, '')}`;
  const full = path.join(ROOT, normalized.replace(/^\//, '').split('?')[0]);
  return fs.existsSync(full) ? normalized : fallback;
}

// 1. Filmy YouTube CC (deduplikowane po videoId, tylko sprawne publiczne)
const ytRaw = readJson('data/youtube_published_history.json', { published: [] });
const ytList = Array.isArray(ytRaw) ? ytRaw : (ytRaw.published || []);
const seenYt = new Set();
const DEAD_YT_IDS = new Set(['Xn231zRa0b0', '9D_m-hC8ORg', 'T1tRwh5Bc7s', 'pTIKvwQZ7hc']);
const videos = [];

// Najświeższe najpierw (tylko potwierdzone publiczne lub dzisiejsze bez odroczonego harmonogramu)
for (let i = ytList.length - 1; i >= 0; i--) {
  const row = ytList[i];
  if (!row || !row.title || !row.videoUrl) continue;
  const st = String(row.studioStatus || '').toLowerCase();
  if (['missing', 'broken', 'draft'].includes(st)) continue;
  if (String(row.visibility || '').toLowerCase() === 'private') continue;
  if (row.scheduledDate && st !== 'public') continue;
  const isToday = String(row.publishedAt || '') >= '2026-11-25';
  if (st !== 'public' && !isToday) continue;
  const id = extractYtId(row.videoUrl);
  if (!id || seenYt.has(id) || DEAD_YT_IDS.has(id)) continue;
  seenYt.add(id);
  const isShorts = /shorts/i.test(row.videoUrl) || /#shorts/i.test(row.title);
  videos.push({
    id: `yt_${id}`,
    mediaType: 'video',
    videoId: id,
    isShorts,
    title: row.title,
    channel: row.channel || 'Christian Culture',
    description: `${row.channel || 'Christian Culture'} • ${isShorts ? 'YouTube Shorts' : 'Wideo 4K / HD'} — obejrzyj od razu w wyszukiwarce.`,
    url: row.videoUrl,
    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: row.publishedAt || '',
    tags: [
      'wideo', 'video', 'youtube', 'film',
      isShorts ? 'shorts' : '4k',
      ...(row.channel ? [row.channel] : [])
    ]
  });
  if (videos.length >= 160) break;
}

// Dodaj też utwory z Biblijnego Uwielbienia (jeśli nie ma ich jeszcze w videos)
const buRaw = readJson('data/biblijne-uwielbienie-playlist.json', { items: [] });
for (const item of (buRaw.items || []).slice(0, 40)) {
  const id = item.videoId || extractYtId(item.url);
  if (!id || seenYt.has(id)) continue;
  seenYt.add(id);
  videos.push({
    id: `bu_${id}`,
    mediaType: 'video',
    videoId: id,
    isShorts: false,
    title: item.title || 'Biblijne Uwielbienie — Christian Culture',
    channel: 'Biblijne Uwielbienie CC',
    description: 'Muzyka uwielbieniowa i Biblia Śpiewana Christian Culture — odtwórz od razu.',
    url: `https://youtu.be/${id}`,
    image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: item.publishedAt || '',
    tags: ['muzyka', 'uwielbienie', 'biblia śpiewana', 'piosenka', 'wideo', 'audio']
  });
}

// 2. Audio inline — Biblia Audio MP3 + Radio CC 24/7
const baRaw = readJson('biblia-audio/data/catalog.json', []);
const baItems = Array.isArray(baRaw) ? baRaw : (baRaw.episodes || baRaw.items || []);
const audios = [
  {
    id: 'radio_cc_main',
    mediaType: 'audio',
    isStream: true,
    title: 'Polskie Radio Christian Culture — Główny Strumień 24/7',
    subtitle: 'Radio internetowe bez reklam • Muzyka, Słowo Boże, audycje',
    description: 'Słuchaj głównego strumienia Polskie Radio Christian Culture bezpośrednio w wyszukiwarce.',
    audioUrl: 'https://stream.zeno.fm/vz96pvl3pnktv',
    url: '/player',
    image: '/images/search/polska-radio-1600.webp',
    tags: ['radio', 'na żywo', 'muzyka', 'audycja', 'strumień', 'słuchaj', 'player', 'polskie radio']
  },
  {
    id: 'radio_cc_biblia',
    mediaType: 'audio',
    isStream: true,
    title: 'Radio Biblia Audio 24/7 — Pismo Święte Non-Stop',
    subtitle: 'Słuchowisko biblijne UBG 24/7',
    description: 'Ciągła emisja Pisma Świętego w wersji audio — uruchom od razu jednym kliknięciem.',
    audioUrl: 'https://stream.zeno.fm/imo45hqnshyuv',
    url: '/biblia-audio/',
    image: '/images/kultura/card-biblia.jpg',
    tags: ['biblia audio', 'radio', 'pismo święte', 'słuchowisko', 'ubg', 'słuchaj']
  }
];

for (const ep of baItems) {
  if (!ep || ep.status !== 'published' || !ep.audioUrl) continue;
  const audioSrc = ep.audioUrl.startsWith('/') || ep.audioUrl.startsWith('http')
    ? ep.audioUrl
    : `/biblia-audio/${ep.audioUrl.replace(/^\.?\//, '')}`;
  audios.push({
    id: `ba_${ep.id}`,
    mediaType: 'audio',
    isStream: false,
    book: ep.book || 'Księga Rodzaju',
    chapter: ep.chapter || null,
    title: `${ep.book || 'Biblia Audio'} ${ep.chapter || ''} — ${ep.title || ep.description || 'Biblia Audio CC'}`.replace(/\s+/g, ' ').trim(),
    subtitle: `Biblia Audio CC (${ep.id}) • Słuchowisko UBG`,
    description: ep.description || 'Wielościeżkowe słuchowisko biblijne Christian Culture — posłuchaj od razu.',
    audioUrl: audioSrc,
    url: ep.textUrl || `/biblia-audio/#${ep.id}`,
    image: ensureLocalImage(ep.cover, '/images/kultura/card-biblia.jpg'),
    tags: ['biblia audio', 'słuchowisko', 'audio', 'mp3', 'ubg', ep.book || '', `rozdział ${ep.chapter || ''}`, ep.id].filter(Boolean)
  });
}

// 3. Grafiki i karty wizualne (Wiadomości z Nieba, grafiki lekcji Kursu Codziennego, kanały CC)
const graphics = [];

const ytCommDir = path.join(ROOT, 'images', 'social', 'yt-community');
if (fs.existsSync(ytCommDir)) {
  const files = fs.readdirSync(ytCommDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort().reverse();
  for (const f of files.slice(0, 12)) {
    const dateMatch = f.match(/(\d{4}-\d{2}-\d{2})/);
    const label = dateMatch ? `Wiadomość z Nieba — Karta graficzna (${dateMatch[1]})` : `Grafika Christian Culture — ${f}`;
    graphics.push({
      id: `gfx_wzn_${f}`,
      mediaType: 'image',
      title: label,
      description: 'Oficjalna grafika z wersetem biblijnym Christian Culture — kliknij, aby powiększyć lub pobrać.',
      image: `/images/social/yt-community/${f}`,
      url: '/wiadomosci-z-nieba/',
      tags: ['grafika', 'obraz', 'wiadomość z nieba', 'werset', 'karta', 'cytat', dateMatch ? dateMatch[1] : ''].filter(Boolean)
    });
  }
}

const dailyImgDir = path.join(ROOT, 'images', 'academy', 'daily');
if (fs.existsSync(dailyImgDir)) {
  const files = fs.readdirSync(dailyImgDir).filter(f => /^kc_day_\d+.*\.(jpg|jpeg|png|webp)$/i.test(f)).sort().reverse();
  for (const f of files.slice(0, 18)) {
    const dm = f.match(/kc_day_(\d+)/i);
    const dayNum = dm ? Number(dm[1]) : null;
    graphics.push({
      id: `gfx_kc_${f}`,
      mediaType: 'image',
      title: dayNum ? `Kurs Codzienny — Ilustracja Dzień ${dayNum}` : `Ilustracja Akademii Biblijnej`,
      description: dayNum ? `Dedykowana grafika biblijna do Lekcji ${dayNum} kursu „Z Biblią za Pan Brat”.` : 'Grafika Akademii Biblijnej Christian Culture.',
      image: `/images/academy/daily/${f}`,
      url: dayNum ? `/akademia/kurscodzienny/dzien-${dayNum}` : '/akademia',
      tags: ['grafika', 'obraz', 'ilustracja', 'kurs codzienny', 'akademia', 'lekcja', dayNum ? `dzień ${dayNum}` : '', dayNum ? `lekcja ${dayNum}` : ''].filter(Boolean)
    });
  }
}

// 4. Kanały i strefy z data/cc-channels.json (mają prawdziwe okładki!)
const channelsRaw = readJson('data/cc-channels.json', { channels: [] });
const channelsList = Array.isArray(channelsRaw) ? channelsRaw : (channelsRaw.channels || []);
const channels = [];
for (const ch of channelsList) {
  if (!ch || !ch.title || !ch.url) continue;
  const img = ensureLocalImage(ch.image, '/images/search/polska-radio-1600.webp');
  channels.push({
    id: `ch_${ch.number || ch.title}`,
    mediaType: ch.kind === 'tv' ? 'channel' : 'module',
    title: ch.title,
    description: `Oficjalny kanał / moduł ekosystemu Christian Culture (${ch.kind || 'portal'}).`,
    url: ch.url,
    image: img,
    kind: ch.kind || 'portal',
    tags: [ch.title, ...(ch.aliases || []), ch.kind || 'kanał', 'ekosystem', 'christian culture']
  });
}

// 5. Autoreklama Ekosystemu CC („Polecane” — dopasowana tematycznie, bez fałszywego LIVE)
const promos = [
  {
    id: 'promo_kurs_codzienny',
    badge: 'Polecane • Akademia Biblijna',
    title: 'Kurs Codzienny „Z Biblią za Pan Brat”',
    description: 'Codzienna 5-minutowa lekcja Słowa Bożego z komentarzem, quizem i modlitwą — za darmo, bez reklam.',
    cta: 'Otwórz dzisiejszą lekcję →',
    url: '/akademia#kurscodzienny',
    image: '/images/academy/daily/kc_day_56_przybytek_zaslona_swiatyni.jpg',
    keywords: ['kurs', 'lekcja', 'akademia', 'biblia', 'mojzesz', 'wyjscia', 'dzien', 'studium', 'nauka', 'wiara', 'modlitwa', 'bog']
  },
  {
    id: 'promo_biblia_audio',
    badge: 'Polecane • Słuchowisko V7',
    title: 'Biblia Audio Christian Culture (UBG)',
    description: 'Pełne rozdziały Pisma Świętego w jakości studyjnej 48 kHz — słuchaj w drodze, w domu i w radiu.',
    cta: 'Słuchaj Biblii Audio →',
    url: '/biblia-audio/',
    image: '/images/kultura/card-biblia.jpg',
    keywords: ['biblia', 'audio', 'sluchaj', 'rodzaju', 'psalm', 'ewangelia', 'juda', 'tamar', 'jozef', 'sluchowisko', 'mp3', 'podcast']
  },
  {
    id: 'promo_apokalipsa',
    badge: 'Polecane • Studium Proroctw',
    title: 'Apokalipsa: Księga Nadziei — wykłady i podcast',
    description: 'Werset po wersecie o przyszłości, pokoju i powrocie Chrystusa. Oglądaj wykłady i słuchaj odcinków Dzień po Dniu.',
    cta: 'Zobacz serię Apokalipsa →',
    url: '/apokalipsa',
    image: '/images/search/polska-radio-1600.webp',
    keywords: ['apokalipsa', 'objawienie', 'proroctwo', 'koniec', 'czasy', 'nadzieja', 'jezus', 'powrot', 'daniel', 'bestia', 'pieczec']
  },
  {
    id: 'promo_lumina',
    badge: 'Polecane • Społeczność',
    title: 'LUMINA — Chrześcijańska Społeczność bez hejtu',
    description: 'Tablica świadectw, bezpieczny komunikator LUMI Messenger, grupy modlitewne i wartościowe relacje.',
    cta: 'Wejdź do LUMINA →',
    url: '/lumina',
    image: '/images/kultura/card-lumina.jpg',
    keywords: ['lumina', 'czat', 'spolecznosc', 'ludzie', 'przyjaciele', 'profil', 'komunikator', 'messenger', 'swiadectwo', 'grupa']
  },
  {
    id: 'promo_mojabiblia',
    badge: 'Polecane • Interlinearna Biblia',
    title: 'MojaBiblia CC — 4 przekłady + kody Stronga',
    description: 'Czytaj UBG, BW, BT i BG z oryginalnym tekstem hebrajskim i greckim oraz natychmiastowym odsłuchem.',
    cta: 'Otwórz MojaBiblia →',
    url: '/mojabiblia',
    image: '/images/kultura/card-biblia.jpg',
    keywords: ['werset', 'strong', 'hebrajski', 'grecki', 'przeklad', 'ubg', 'czytaj', 'pismo', 'psalm', 'jan', 'mateusz', 'rdz']
  },
  {
    id: 'promo_windows_app',
    badge: 'Polecane • Aplikacja Desktop',
    title: 'Wyszukiwarka CC na Windows (2,3 MB)',
    description: 'Lekka aplikacja na Twój komputer z paskiem zakładek, skrótem Ctrl+Shift+Spacja i dostępem do całego ekosystemu.',
    cta: 'Pobierz na Windows →',
    url: '/aplikacje/wyszukiwarka-windows/',
    image: '/images/search/polska-radio-1600.webp',
    keywords: ['aplikacja', 'windows', 'pobierz', 'program', 'komputer', 'wyszukiwarka', 'instalator', 'narzedzia']
  },
  {
    id: 'promo_ccwomen',
    badge: 'Polecane • Strefa Kobiet',
    title: 'Christian Women (CC Women) — Wiara, Godność i Siła',
    description: 'Dedykowane rozważania, Biblia Audio i materiały dla kobiet budujących swoją codzienność na Słowie Bożym.',
    cta: 'Odwiedź CC Women →',
    url: '/ccwomen/',
    image: '/images/kultura/card-lumina.jpg',
    keywords: ['kobieta', 'kobiety', 'women', 'ccwomen', 'mama', 'rodzina', 'tamar', 'estera', 'rut', 'maria', 'relacje']
  },
  {
    id: 'promo_kartki',
    badge: 'Polecane • Nowość CC',
    title: 'Muzyczne E-Kartki Christian Culture',
    description: 'Wyślij bliskim darmową, elegancką kartkę muzyczną z życzeniami i błogosławieństwem na urodziny lub dobry dzień.',
    cta: 'Wyślij E-Kartkę →',
    url: '/kartki/',
    image: '/images/search/polska-radio-1600.webp',
    keywords: ['kartka', 'kartki', 'zyczenia', 'urodziny', 'prezent', 'bliscy', 'dobrze ze jestes', 'nowy rok']
  }
];

// 6. Brama Całego Ekosystemu (wszystkie główne filary CC w jednym centrum)
const gatewayPillars = [
  {
    group: 'Słowo Boże & Nauka',
    icon: '📖',
    items: [
      { title: 'MojaBiblia Interlinearna', desc: 'UBG, BW, BT, BG + kody Stronga', url: '/mojabiblia', badge: 'Biblia' },
      { title: 'Biblia Audio CC', desc: 'Słuchowiska studyjne MP3', url: '/biblia-audio/', badge: `${audios.length - 2} odc.` },
      { title: 'Akademia & Kurs Codzienny', desc: 'Codzienne lekcje „Z Biblią za Pan Brat”', url: '/akademia#kurscodzienny', badge: 'Codziennie' },
      { title: 'Wiadomości z Nieba', desc: 'Codzienny werset i grafika 1:1', url: '/wiadomosci-z-nieba/', badge: 'Dziś' },
      { title: 'Apokalipsa: Księga Nadziei', desc: 'Studium proroctw i podcast', url: '/apokalipsa', badge: 'Seria' }
    ]
  },
  {
    group: 'Radio, Muzyka & Telewizja',
    icon: '🎧',
    items: [
      { title: 'Odtwarzacz Radio CC 24/7', desc: 'Wszystkie stacje bez reklam', url: '/player', badge: 'Audio 24/7' },
      { title: 'Kino Chrześcijańskie VOD', desc: 'Filmy fabularne i dokumenty', url: '/vod', badge: 'Filmy' },
      { title: 'Kanały TV & Worship', desc: 'Pasma telewizyjne i uwielbienie', url: '/SpiritualSounds/tv/', badge: 'TV' },
      { title: 'topTEN Christian Culture', desc: 'Lista przebojów muzyki chrześcijańskiej', url: '/topten', badge: 'Muzyka' },
      { title: 'Muzyczne E-Kartki', desc: 'Darmowe kartki z muzyką i Słowem', url: '/kartki/', badge: 'Nowość' }
    ]
  },
  {
    group: 'Społeczność, Wiadomości & Pomoc',
    icon: '🌐',
    items: [
      { title: 'LUMINA Społeczność', desc: 'Tablica, profile i LUMI Messenger', url: '/lumina', badge: 'Społeczność' },
      { title: 'CCN News & Portale', desc: 'Nauka, Historia, Biologia, Prawo', url: '/news', badge: 'Publicystyka' },
      { title: 'Strefa CC Women', desc: 'Inspiracje i Biblia dla kobiet', url: '/ccwomen/', badge: 'Kobiety' },
      { title: 'CC Pomoc & Infolinia', desc: 'Wsparcie duchowe, lęk, kryzys', url: '/help', badge: 'Wsparcie' },
      { title: 'HOLOS 2027', desc: 'Planer duchowy i wyzwania', url: '/holos', badge: 'Planer' }
    ]
  },
  {
    group: 'Aplikacje & Misja',
    icon: '🚀',
    items: [
      { title: 'Wyszukiwarka CC (Windows)', desc: 'Lekka aplikacja 2,3 MB na PC', url: '/aplikacje/wyszukiwarka-windows/', badge: 'Windows' },
      { title: 'Centrum Aplikacji CC', desc: 'Android, Windows i narzędzia WWW', url: '/aplikacje', badge: 'Aplikacje' },
      { title: 'Mapa Ekosystemu CC', desc: 'Pełny przegląd projektów i nowości', url: '/mapa', badge: 'Mapa' },
      { title: 'Biblioteka & Książki', desc: 'E-booki i publikacje Cezarego Rogowskiego', url: '/biblioteka', badge: 'Książki' },
      { title: 'WspieramTO — Nowe Studio 4K', desc: 'Wspieraj darmowe media bez reklam', url: '/wspieramto', badge: 'Misja' }
    ]
  }
];

// 7. Szybki słownik kluczowych wersetów UBG (do natychmiastowej karty wersetu)
const wersetRaw = readJson('data/werset_dnia_365_ubg.json', []);
const wersetArr = Array.isArray(wersetRaw) ? wersetRaw : (wersetRaw.verses || wersetRaw.items || []);
const verses = [];
for (const v of wersetArr) {
  if (!v) continue;
  const ref = v.ref || v.reference || v.sigla || '';
  const text = v.text || v.verse || v.ubg || '';
  if (ref && text) {
    verses.push({ ref, text });
  }
}

const payload = {
  version: '2.0-test',
  generatedAt: new Date().toISOString(),
  stats: {
    videos: videos.length,
    audios: audios.length,
    graphics: graphics.length,
    channels: channels.length,
    verses: verses.length,
    promos: promos.length
  },
  videos,
  audios,
  graphics,
  channels,
  promos,
  gatewayPillars,
  verses
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload), 'utf8');
const PROD_OUT_FILE = path.join(ROOT, 'data', 'cc-search-media-index.json');
fs.writeFileSync(PROD_OUT_FILE, JSON.stringify(payload), 'utf8');
console.log(`✅ Zbudowano ${OUT_FILE} oraz ${PROD_OUT_FILE} (${(Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1)} KB)`);
console.log('📊 Statystyki:', payload.stats);
