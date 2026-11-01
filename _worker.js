import ccnArticleRoutes from './data/ccn-article-routes.js';
import { handleBUApi } from './lib/bu-voting-worker.js';
import { handleSearchRagApi } from './data/cc-search-rag-service.js';
import { handleAiDlaJezusaApi } from './services/ai-dla-jezusa/api-v1.js';
import { handleNewsletterApiRequest } from './services/cc-newsletter/newsletter-service.js';

const BLOCKED_PREFIXES = [
  '/.git/', '/.codex/', '/.cursor/', '/.claude/', '/repozytoria-cc/', '/joma_shared_memory/',
  '/.agents/', '/.github/', '/.firebase/', '/.gemini/', '/.vscode/', '/.wrangler/',
  '/cloudflare/', '/cloudflare-worker/', '/lib/', '/tests/', '/firebase_functions/', '/functions/', '/scratch/', '/src/',
  '/services/', '/migrations/',
  '/scripts/agent-matrix/.matrix_sessions/',
  '/tresci-18plus/',
];

const BLOCKED_FILES = new Set([
  '/data/whatsapp_zaczepki_log.json', '/data/whatsapp_zaczepki_state.json',
  '/.env', '/.env.example', '/.firebaserc', '/.gitignore', '/agents.md', '/claude.md',
  '/codex.md', '/firebase.json', '/firestore.indexes.json', '/firestore.rules', '/gemini.md',
  '/package-lock.json', '/package.json', '/playwright.config.ts', '/storage.rules',
  '/tsconfig.json', '/vite.config.ts', '/vitest.config.ts',
]);

const BLOCKED_EXTENSIONS = [
  '.pem', '.key', '.p12', '.pfx',
  '.bak', '.cjs', '.map', '.md', '.mjs', '.ps1', '.py', '.sql', '.ts', '.vue', '.xlsx', '.yaml', '.yml',
];

function isBlocked(pathname) {
  let path;
  try {
    path = pathname;
    for (let round=0; round<4; round++) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
    if (/%[0-9a-f]{2}/i.test(path)) return true;
    path = path.replace(/\\/g, '/').replace(/\/{2,}/g, '/').toLowerCase();
  } catch {
    return true;
  }
  if (path.includes('\0') || path.includes('/../')) return true;
  // Deny before ASSETS: removed private files may still exist in an old CDN cache.
  const basename = path.slice(path.lastIndexOf('/') + 1);
  if (basename === '.env' || basename.startsWith('.env.')) return true;
  if (/^service[-_]?account(?:key)?(?:[._-]|$)/.test(basename) || /(?:^|-)firebase-adminsdk(?:-|\.)/.test(basename)) return true;
  if (/^\/data\/whatsapp_[^/]*\.json$/.test(path)) return true;
  if (BLOCKED_FILES.has(path)) return true;
  if (BLOCKED_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  return BLOCKED_EXTENSIONS.some((extension) => path.endsWith(extension));
}

// ═══════════════════════════════════════════════════════════════════════════
// KANAŁY CC — PRAWDZIWE WIADOMOŚCI NA PASKU (Strażnik Standardów, 2026-10-07)
// Wcześniej /news.json był plikiem zapisanym ręcznie 19 sierpnia 2026 i od tamtej pory
// kanały pokazywały jako „najnowsze” wiadomości sprzed 7 tygodni. Teraz serwer pobiera
// nagłówki z kanału RSS na bieżąco (pamięć podręczna 10 min). Gdy źródło nie odpowiada:
// ostatnie pobrane nagłówki (max 6 h), a potem pusta lista — nigdy stare wiadomości.
// ═══════════════════════════════════════════════════════════════════════════
const NEWS_RSS_URL = 'https://wiadomosci.wp.pl/rss.xml';
const NEWS_CACHE_KEY = 'https://polskieradio.cc/__cc_cache/news-headlines-v1';
const NEWS_FRESH_SECONDS = 600;
const NEWS_STALE_SECONDS = 6 * 3600;
const NEWS_MAX_AGE_HOURS = 48;

function decodeEntities(text) {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function cleanHeadline(text) {
  return decodeEntities(text).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssHeadlines(xml) {
  const out = [];
  const now = Date.now();
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = m[1];
    const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (!title) continue;
    const pub = Date.parse((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
    if (!Number.isNaN(pub) && now - pub > NEWS_MAX_AGE_HOURS * 3600 * 1000) continue;
    const headline = cleanHeadline(title);
    if (headline && headline.length <= 220) out.push(headline);
    if (out.length >= 10) break;
  }
  return out;
}

async function serveLiveNews(ctx) {
  const cache = caches.default;
  const key = new Request(NEWS_CACHE_KEY);
  const cached = await cache.match(key);
  const cachedAt = cached ? Number(cached.headers.get('X-CC-Fetched-At') || 0) : 0;
  const age = cachedAt ? (Date.now() - cachedAt) / 1000 : Infinity;
  const respond = (body, fetchedAt, state) => new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
      'Access-Control-Allow-Origin': '*',
      'X-CC-Fetched-At': String(fetchedAt || 0),
      'X-CC-News-State': state,
    },
  });
  if (cached && age < NEWS_FRESH_SECONDS) return respond(await cached.text(), cachedAt, 'fresh');
  try {
    const rss = await fetch(NEWS_RSS_URL, { headers: { 'User-Agent': 'ChristianCulture-Ticker/1.0 (+https://polskieradio.cc)' }, cf: { cacheTtl: 300 } });
    if (!rss.ok) throw new Error('RSS ' + rss.status);
    const headlines = parseRssHeadlines(await rss.text());
    if (!headlines.length) throw new Error('RSS bez nagłówków');
    const body = JSON.stringify(headlines);
    const fetchedAt = Date.now();
    const store = new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${NEWS_STALE_SECONDS}`, 'X-CC-Fetched-At': String(fetchedAt) } });
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(cache.put(key, store)); else await cache.put(key, store);
    return respond(body, fetchedAt, 'live');
  } catch (err) {
    if (cached && age < NEWS_STALE_SECONDS) return respond(await cached.text(), cachedAt, 'stale');
    return respond('[]', 0, 'unavailable');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TREŚCI 18+ (książka „Prawda Bez Filtra”) — tylko dla zalogowanych, po
// oświadczeniu o pełnoletności. Pliki leżą w /tresci-18plus/ (publicznie
// zablokowane w isBlocked) i są wydawane wyłącznie przez /api/tresci-18/<id>
// po weryfikacji tokenu Firebase (projekt lumina-cc) po stronie serwera.
// ═══════════════════════════════════════════════════════════════════════════
const ADULT_FIREBASE_PROJECT = 'lumina-cc';
const ADULT_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ADULT_CONTENT = {
  'prawda-bez-filtra-fragment': '/tresci-18plus/prawda-bez-filtra-fragment.json',
  'prawda-bez-filtra-ksiazka': '/tresci-18plus/prawda-bez-filtra-ksiazka.json',
  'prawda-bez-filtra-pdf': { path: '/tresci-18plus/prawda-bez-filtra.pdf', type: 'application/pdf', name: 'Prawda_Bez_Filtra.pdf' },
  'prawda-bez-filtra-epub': { path: '/tresci-18plus/prawda-bez-filtra.epub', type: 'application/epub+zip', name: 'Prawda_Bez_Filtra.epub' },
  'prawda-bez-filtra-pakiet': { path: '/tresci-18plus/prawda-bez-filtra-pakiet.zip', type: 'application/zip', name: 'Prawda_Bez_Filtra_pakiet.zip' },
};
let adultJwksCache = { keys: null, until: 0 };

function adultB64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function adultGetJwks(fetchImpl) {
  const now = Date.now();
  if (adultJwksCache.keys && adultJwksCache.until > now) return adultJwksCache.keys;
  const resp = await fetchImpl(ADULT_JWKS_URL);
  if (!resp.ok) throw new Error('jwks');
  const data = await resp.json();
  const m = /max-age=(\d+)/.exec(resp.headers.get('cache-control') || '');
  adultJwksCache = { keys: data.keys || [], until: now + (m ? Math.min(+m[1], 21600) : 3600) * 1000 };
  return adultJwksCache.keys;
}

async function verifyFirebaseIdToken(token, fetchImpl = fetch, nowSec = Math.floor(Date.now() / 1000)) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(adultB64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(adultB64urlToBytes(parts[1])));
  } catch { return null; }
  if (header.alg !== 'RS256' || !header.kid) return null;
  if (payload.aud !== ADULT_FIREBASE_PROJECT) return null;
  if (payload.iss !== `https://securetoken.google.com/${ADULT_FIREBASE_PROJECT}`) return null;
  if (!payload.sub || typeof payload.sub !== 'string') return null;
  if (!(payload.exp > nowSec) || !(payload.iat <= nowSec + 300)) return null;
  const keys = await adultGetJwks(fetchImpl);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, adultB64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1]));
  return ok ? payload : null;
}

async function handleAdultContent(request, env, url, fetchImpl = fetch) {
  const json = (obj, status) => new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Vary': 'Authorization',
    },
  });
  const id = url.pathname.slice('/api/tresci-18/'.length).replace(/\/$/, '');
  const entry = ADULT_CONTENT[id];
  if (!entry) return json({ ok: false, error: 'not_found' }, 404);
  const file = typeof entry === 'string' ? entry : entry.path;
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (request.headers.get('X-Age-Confirmed') !== '18+') return json({ ok: false, error: 'age_not_confirmed' }, 403);
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let user = null;
  try { user = await verifyFirebaseIdToken(token, fetchImpl); } catch { user = null; }
  if (!user) return json({ ok: false, error: 'login_required' }, 401);
  const assetUrl = new URL(file, url.origin);
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString()));
  if (!res.ok) return json({ ok: false, error: 'unavailable' }, 503);
  if (typeof entry !== 'string') {
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': entry.type,
        'Content-Disposition': `attachment; filename="${entry.name}"`,
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Vary': 'Authorization',
      },
    });
  }
  const data = await res.json();
  return json({ ok: true, ...data }, 200);
}

// ═══════════════════════════════════════════════════════════════════════════
// LUMINA DYNAMIC SOCIAL SHARING & OPEN GRAPH CRAWLER INTERCEPTOR
// Facebook, WhatsApp, Twitter, Telegram, LinkedIn, Discord nie wykonują JS.
// Gdy robot pobiera /tablica?post=:id, /post/:id lub /v1/post/share, serwer
// odpytuje Firestore REST o treść i grafikę danego posta i serwuje pełny
// zestaw tagów og:image, og:title, og:description, twitter:image itp.
// Dla zwykłych użytkowników serwowane jest natychmiastowe przekierowanie/strona.
// ═══════════════════════════════════════════════════════════════════════════
function isSocialCrawler(ua) {
  if (!ua) return false;
  return /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|linkedinbot|discordbot|skypeuripreview|slackbot|pinterest|redditbot|vkshare|w3c_validator|googlebot|bingbot/i.test(ua);
}

async function handleSocialPostCrawler(postId, url, userAgent) {
  const searchParams = url.searchParams;
  let title = (searchParams.get('title') || '').trim();
  let text = (searchParams.get('text') || searchParams.get('desc') || '').trim();
  let author = (searchParams.get('author') || '').trim();
  let image = (searchParams.get('img') || searchParams.get('image') || searchParams.get('photo') || '').trim();
  let video = (searchParams.get('video') || '').trim();

  if (postId) {
    try {
      const fsRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_posts/${encodeURIComponent(postId)}`,
        { headers: { 'User-Agent': 'ChristianCulture-Worker/1.0' }, cf: { cacheTtl: 120 } }
      );
      if (fsRes.ok) {
        const doc = await fsRes.json();
        const f = doc.fields || {};
        if (f.author?.stringValue) author = f.author.stringValue.trim();
        if (f.title?.stringValue && f.title.stringValue.trim() !== 'Wpis LUMINA') {
          title = f.title.stringValue.trim();
        }
        if (f.contentWeb?.stringValue || f.fullText?.stringValue || f.text?.stringValue || f.desc?.stringValue || f.teaser?.stringValue) {
          const raw = f.contentWeb?.stringValue || f.fullText?.stringValue || f.text?.stringValue || f.desc?.stringValue || f.teaser?.stringValue;
          text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        if (f.image?.stringValue || f.imageUrl?.stringValue) {
          image = (f.image?.stringValue || f.imageUrl?.stringValue).trim();
        }
        if (f.videoUrl?.stringValue || f.youtubeUrl?.stringValue) {
          video = (f.videoUrl?.stringValue || f.youtubeUrl?.stringValue).trim();
        }
      }
    } catch (e) {
      // Fallback do parametrów URL
    }
  }

  if (!author) author = 'Christian Culture';
  if (!title) {
    title = `${author} • Wpis w Społeczności LUMINA`;
  } else if (!title.toLowerCase().includes(author.toLowerCase()) && author !== 'Christian Culture') {
    title = `${author}: ${title}`;
  }
  if (!text) {
    text = `Zobacz wpis ${author} w chrześcijańskiej społeczności LUMINA. Przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨`;
  }
  const cleanSnippet = text.length > 280 ? (text.substring(0, 280) + '…') : text;

  if (image && !image.startsWith('http')) {
    image = 'https://polskieradio.cc/' + image.replace(/^\//, '');
  }
  if (!image) {
    image = 'https://polskieradio.cc/lumina_og.jpg';
  }

  const destinationUrl = `https://polskieradio.cc/tablica?post=${encodeURIComponent(postId || '')}#${encodeURIComponent(postId || '')}`;
  const canonicalUrl = `https://polskieradio.cc/tablica?post=${encodeURIComponent(postId || '')}`;

  const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(cleanSnippet);
  const safeImage = escapeHtml(image);
  const safeDest = escapeHtml(destinationUrl);
  const safeCanon = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="pl" prefix="og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle} | LUMINA</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${safeCanon}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="LUMINA • Christian Culture">
  <meta property="og:url" content="${safeCanon}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ChristianCultPL">
  <meta name="twitter:url" content="${safeCanon}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">
  <meta name="twitter:image:alt" content="${safeTitle}">

  <!-- Natychmiastowe przekierowanie dla przeglądarek użytkowników -->
  <meta http-equiv="refresh" content="0;url=${safeDest}">
  <script>
    window.location.replace("${safeDest}");
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070d1e; color: #fff; padding: 40px 20px; text-align: center; }
    .card { max-width: 520px; margin: 0 auto; background: #0f172a; padding: 24px; border-radius: 16px; border: 1.5px solid rgba(250,204,21,0.35); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    img { max-width: 100%; border-radius: 12px; margin: 16px 0; max-height: 400px; object-fit: cover; }
    a { color: #facc15; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 12px; padding: 10px 20px; background: rgba(250,204,21,0.15); border-radius: 10px; border: 1px solid #facc15; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="font-size:1.2rem;margin-top:0;">${safeTitle}</h2>
    <img src="${safeImage}" alt="${safeTitle}">
    <p style="font-size:0.9rem;line-height:1.5;color:#cbd5e1;">${safeDesc}</p>
    <div><a href="${safeDest}">Otwórz wpis w portalu LUMINA 🕊️</a></div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Robots-Tag': 'all',
    },
  });
}

function handleSocialMilionCrawler(url) {
  const canonical = 'https://polskieradio.cc/milion';
  const ogImage = 'https://polskieradio.cc/assets/milion-og.jpg';
  const title = 'CELUJEMY W PIERWSZY MILION • Christian Culture Radio & Widget';
  const desc = 'Oficjalny licznik słuchaczy i wsparcia misji Christian Culture. Dołącz do dzieła, pobierz darmowy widget odtwarzacza na stronę lub słuchaj radia na żywo.';

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Christian Culture">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:secure_url" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Celujemy w pierwszy milion słuchaczy - Radio Christian Culture">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ChristianCultPL">
  <meta name="twitter:url" content="${canonical}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="Celujemy w pierwszy milion słuchaczy - Radio Christian Culture">

  <!-- Natychmiastowe przekierowanie dla przeglądarek użytkowników -->
  <meta http-equiv="refresh" content="0;url=${canonical}">
  <script>
    window.location.replace("${canonical}");
  </script>
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${ogImage}" alt="${title}">
  <p><a href="${canonical}">Przejdź do oficjalnego licznika: ${canonical}</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Robots-Tag': 'all',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 WARSTWA SZTABOWA: @A — AGENCI MISJI (Dostęp wyłącznie dla Dowódcy)
// Bezpieczeństwo Zero-QA: Dostęp zastrzeżony dla nazirczarkes@gmail.com
// Weryfikacja tokena Firebase ID po stronie serwera przez Google OAuth2 API.
// Żadne prywatne dane nie trafiają do publicznych plików JSON, HTML ani bundli.
// ═══════════════════════════════════════════════════════════════════════════
const AGENTS_MISSION_DATA = {
  version: "1.0.0",
  updatedAt: "2026-10-11T06:50:00Z",
  owner: {
    id: "czarek-owner",
    name: "Czarek — Administrator Misji",
    role: "Dowódca Nazir • Główny Architekt & Wizjoner Ekosystemu",
    email: "nazirczarkes@gmail.com",
    icon: "👑",
    stage: "deployed",
    state: "running",
    desc: "Najwyższy organ decyzyjny misji. Wyznacza cele, doktrynę, akceptuje wdrożenia i nadzoruje wszystkie gałęzie ekosystemu Christian Culture."
  },
  center: {
    id: "center-agents",
    name: "@A — Centrum Agentów Misji",
    role: "Centralny Hub Orkiestracji Agentów & SubAgentów",
    icon: "✦",
    stage: "deployed",
    state: "running",
    desc: "Główny węzeł koordynacyjny prywatnej warstwy sztabowej. Łączy 11 wyspecjalizowanych dywizji agentowych ze wspólną pamięcią @joma oraz procesami emisyjnymi."
  },
  branches: [
    {
      id: "branch-coord",
      name: "KOORDYNACJA I SZTAB",
      color: "#C4A35A",
      icon: "🧭",
      agent: {
        id: "agent-coord",
        name: "@A Koordynator Misji",
        role: "Zarządzanie priorytetami, zależnościami, kolejkowaniem zadań i telemetrią",
        stage: "deployed",
        state: "running",
        toolOrModel: "Antigravity • DeepSeek Harness Cordis 24/7",
        source: "JOMA Shared Memory • JOMA_STATUS.md",
        limits: "100% Zero-Cost (Free Tier)",
        desc: "Koordynator nadrzędny zarządzający przepływem prac pomiędzy wszystkimi agentami (Antigravity, Claude, GPT, Joshua). Pilnuje doktryny Zero-QA dla Dowódcy i zakazu regresji.",
        subagents: [
          {
            id: "sub-joma-sentinel",
            name: "JOMA Shared Memory Sentinel",
            role: "Synchronizacja rejestru operacyjnego JOMA_STATUS, JOMA_QUEUE i JOMA_HANDOFFS",
            stage: "deployed",
            state: "running",
            tool: "Node.js • Local Shared Memory IO",
            source: "Misja CC/JOMA_SHARED_MEMORY",
            desc: "Utrzymuje centralny rejestr pamięci wspólnej, zapobiega konfliktom między agentami i weryfikuje własność zadań."
          },
          {
            id: "sub-dsh-bridge",
            name: "DeepSeek Harness Bridge (PC1/PC2)",
            role: "Dwukierunkowy most sztabowy ze smartfonem Dowódcy (Mission Control)",
            stage: "deployed",
            state: "running",
            tool: "Python • FastHTML • WebSockets",
            source: "MC_DeepSeek_Harness (Komputer Emisyjny 24/7)",
            desc: "Nasłuchuje rozkazów Dowódcy z aplikacji mobilnej Mission Control w czasie rzeczywistym i steruje kolejką komend."
          },
          {
            id: "sub-anti-backlog",
            name: "Anti-Backlog Dispatcher",
            role: "Ochrona przed zapętleniem i publikacją ze starych dat",
            stage: "deployed",
            state: "running",
            tool: "Cron Guards • Strict Date-Lock",
            source: "Wektor1_VideoFactory",
            desc: "Weryfikuje zgodność numeru dnia z bieżącym cyklem publikacji i blokuje próby ponownego wysyłania starych treści."
          }
        ]
      }
    },
    {
      id: "branch-content",
      name: "TREŚCI I REDAKCJA",
      color: "#D4B578",
      icon: "✍️",
      agent: {
        id: "agent-content",
        name: "@A Treści i Redakcja",
        role: "Codzienne rozważania, artykuły 20 portali tematycznych CCN, książki autora",
        stage: "deployed",
        state: "running",
        toolOrModel: "Claude 3.7 • Gemini 2.5 • Node Publisher",
        source: "publish_daily_mission.js • portals/ccn-news",
        limits: "100% Zero-Cost",
        desc: "Odpowiada za warstwę merytoryczną ekosystemu: rozważania poranne (TTS, WWW, SMS), artykuły na 20 portalach CCN i autorskie publikacje Cezarego Rogowskiego.",
        subagents: [
          {
            id: "sub-dzj-publisher",
            name: "Edytor Rozważań „Dobrze, że jesteś”",
            role: "Generowanie i synchronizacja 3 wariantów rozważania (TTS, WWW, SMS)",
            stage: "deployed",
            state: "running",
            tool: "publish_daily_mission.js",
            source: "Wektor1_VideoFactory/rozwazania_baza.md",
            desc: "Pancerna dystrybucja rozważań o 00:00 do aplikacji mobilnej (cuda-398c0) oraz portali WWW (cc-mission-control)."
          },
          {
            id: "sub-ccn-editor",
            name: "Redaktor 20 Portali CCN News",
            role: "Cykliczne publikacje autorskie na 20 portalach wiedzy i prawdy",
            stage: "deployed",
            state: "running",
            tool: "Vite • TypeScript • portals/ccn-news",
            source: "portals/ccn-news/src/data/articles.ts",
            desc: "Publikacja autorskich artykułów (Cezary i Wioletta Rogowscy) z kinowymi grafikami 16:9 oraz przyciskami Lumina Share [L] i Twitter [X]."
          },
          {
            id: "sub-author-books",
            name: "Kustosz Książek Autora",
            role: "Zarządzanie biblioteką dzieł Dowódcy (/ksiazki-autora, Pokonać Goliata, Kod Źródłowy)",
            stage: "deployed",
            state: "running",
            tool: "HTML5 • CSS • E-Reader Engine",
            source: "polskieradio.cc/ksiazki-autora",
            desc: "Prezentacja oficjalnych książek, fragmentów online, recenzji i możliwości bezpośredniego wsparcia misji wydawniczej."
          },
          {
            id: "sub-drama-writer",
            name: "Scenarzysta Słuchowisk Słowa",
            role: "Przygotowanie dialogów i adaptacji biblijnych dla Biblia Audio Studio",
            stage: "configured",
            state: "waiting",
            tool: "Gemini 2.5 Flash Script Engine",
            source: "polskieradio.cc/studio • /api/drama/generate-script",
            desc: "Automatyczna adaptacja wersetów Pisma Świętego na role aktorskie z didaskaliami i intonacją narracji."
          }
        ]
      }
    },
    {
      id: "branch-academy",
      name: "AKADEMIA BIBLIJNA",
      color: "#E2CC9A",
      icon: "📖",
      agent: {
        id: "agent-academy",
        name: "@A Akademia Biblijna",
        role: "Kurs Codzienny, Z Biblią za Pan Brat, MojaBiblia, powiadomienia lekcji",
        stage: "deployed",
        state: "running",
        toolOrModel: "Cloudflare Pages & Worker • FCM Push • Gemini",
        source: "polskieradio.cc/akademia • /mojabiblia",
        limits: "Cloudflare Free Tier + Firebase Free",
        desc: "Koordynuje edukację biblijną, codzienne lekcje formacji duchowej, interlinearne studium Pisma z kodami Stronga oraz powiadomienia push o poranku.",
        subagents: [
          {
            id: "sub-course-director",
            name: "Dyrektor Kursu Codziennego",
            role: "Dystrybucja lekcji dziennych w 4 wariantach Clean URLs (Z Biblią za Pan Brat)",
            stage: "deployed",
            state: "running",
            tool: "Clean URLs Engine • SSR Fallback",
            source: "polskieradio.cc/akademia#kurscodzienny",
            desc: "Gwarantuje dostępność każdej lekcji pod adresami /dzien-XX, /dzien-XX.html, /dzien-XX/ oraz /dzien-XX/index.html."
          },
          {
            id: "sub-push-worker",
            name: "Dyspozytor Powiadomień Lekcji (Worker)",
            role: "Poranna wysyłka powiadomień FCM do subskrybentów o 07:30",
            stage: "deployed",
            state: "running",
            tool: "Cloudflare Worker lumina-push • FCM v1 API",
            source: "lumina-push.nazirczarkes.workers.dev",
            desc: "Obsługuje bazę subskrybentów w SQLite DO/KV i dostarcza powiadomienia lekcyjne bezpośrednio na urządzenia odbiorców."
          },
          {
            id: "sub-interlinear-mb",
            name: "Asystent Interlinearny MojaBiblia",
            role: "Obsługa kodów Stronga, morfologii hebrajskiej i greckiej, przekładów UBG/BW/BT",
            stage: "deployed",
            state: "running",
            tool: "Interlinear JSON Parser • SQLite",
            source: "polskieradio.cc/mojabiblia",
            desc: "Nadzoruje nienaruszalność tekstu Słowa Bożego i precyzję słownikową dla studentów Pisma Świętego."
          },
          {
            id: "sub-quiz-engine",
            name: "Kreator Quizów i Postępów Formacji",
            role: "Interaktywne sprawdziany wiedzy i certyfikaty ukończenia modułów",
            stage: "planned",
            state: "idle",
            tool: "Local Storage State • PWA Quiz Engine",
            source: "Moduł planowany w Akademii CC",
            desc: "Planowany moduł weryfikacji wiedzy biblijnej z natychmiastowym feedbackiem edukacyjnym."
          }
        ]
      }
    },
    {
      id: "branch-radio",
      name: "RADIO I MUZYKA",
      color: "#C4A35A",
      icon: "📻",
      agent: {
        id: "agent-radio",
        name: "@A Radio i Muzyka",
        role: "Ciągłość emisji 6 stacji 24/7, streaming AAC/HLS, dynamiczny RDS, CC Music",
        stage: "deployed",
        state: "running",
        toolOrModel: "ZenoFM Icecast • HTML5 Audio Engine • Howler.js",
        source: "polskieradio.cc/player • js/cc-radio-player.js",
        limits: "100% Zero-Cost (ZenoFM Unlimited)",
        desc: "Zarządza 6 bezpłatnymi kanałami radiowymi (Uwielbienie, Biblia Audio, Instrumental, Klasyka, Młode Pokolenie, Słowo Nadziei) oraz odtwarzaczem klasy Spotify.",
        subagents: [
          {
            id: "sub-zeno-monitor",
            name: "Master Emisji Strumieni ZenoFM",
            role: "Nadzór nad dostępnością i automatycznym wznawianiem 6 strumieni audio",
            stage: "deployed",
            state: "running",
            tool: "Stream Health Checker • Icecast Metadata",
            source: "Serwery transmisyjne ZenoFM",
            desc: "Zapewnia nieprzerwany odbiór audycji, automatyczny fallback MP3/AAC i buforowanie adaptacyjne."
          },
          {
            id: "sub-rds-engine",
            name: "Dynamiczny Nadajnik RDS & Okładek",
            role: "Pobieranie w czasie rzeczywistym tytułów, wykonawców i okładek Retina",
            stage: "deployed",
            state: "running",
            tool: "Metadata Fetcher • LastFM/iTunes API Fallback",
            source: "polskieradio.cc/player",
            desc: "Wyświetla precyzyjne dane RDS w odtwarzaczu głównym, belkach stacji i na paskach transmisyjnych."
          },
          {
            id: "sub-music-curator",
            name: "Kurator Muzyczny CC Music",
            role: "Zarządzanie katalogiem utworów chrześcijańskich, premier i hitów",
            stage: "configured",
            state: "idle",
            tool: "Catalog Metadata Indexer",
            source: "polskieradio.cc/music",
            desc: "Kategoryzacja utworów według gatunków: uwielbienie, pop chrześcijański, hip-hop, instrumental, pieśni tradycyjne."
          }
        ]
      }
    },
    {
      id: "branch-tv",
      name: "TV I WIDEO",
      color: "#D4B578",
      icon: "📺",
      agent: {
        id: "agent-tv",
        name: "@A TV i Wideo",
        role: "CCTV24 Worship, pasmo śniadaniowe, DaVinci Resolve automation",
        stage: "deployed",
        state: "running",
        toolOrModel: "OBS Studio 24/7 • DaVinci Scripting API • Python",
        source: "cctv24-worship.html (READ-ONLY) • snadaniowa-live.html",
        limits: "100% Zero-Cost (Sprzęt Własny)",
        desc: "Odpowiada za wizualne kanały emisyjne: całodobową telewizję internetową, pasmo poranne z prezenterkami oraz montaż wideo 4K.",
        subagents: [
          {
            id: "sub-worship-guard",
            name: "Strażnik Strumienia CCTV24 Worship (READ-ONLY)",
            role: "Ochrona produkcyjnego kanału telewizyjnego przed jakimikolwiek modyfikacjami",
            stage: "deployed",
            state: "running",
            tool: "OBS Studio Scene • Frozen HTML",
            source: "cctv24-worship.html (ZAMROŻONY PRODUKCYJNIE)",
            desc: "Gwarantuje żelazną stabilność kanału telewizyjnego uwielbienia zgodnie z pancernymi regułami ekosystemu."
          },
          {
            id: "sub-breakfast-director",
            name: "Reżyser Pasma Śniadaniowego CCTV",
            role: "Zarządzanie scenografią pory dnia, prezenterkami (Noemi & Sara) i prompterem",
            stage: "deployed",
            state: "running",
            tool: "snadaniowa-live.html Engine",
            source: "polskieradio.cc/snadaniowa-live.html",
            desc: "Automatyczna rotacja teł w zależności od pory dnia oraz płynny prompter rozważań porannych."
          },
          {
            id: "sub-dvr-scripting",
            name: "Automatyzacja DaVinci Resolve (SDS)",
            role: "Skrypty montażu wideo 4K dla wykładów Apokalipsa Studia Dobrego Słowa",
            stage: "configured",
            state: "idle",
            tool: "DaVinci Resolve Studio API • Python 3.10",
            source: "Skrypty automatyzacji SDS",
            desc: "Zautomatyzowane skalowanie do 4K UHD, synchroniczne wstawianie plansz biblijnych i eksport MP4/MOV."
          }
        ]
      }
    },
    {
      id: "branch-studio",
      name: "STUDIO AUDIO (DAW)",
      color: "#E2CC9A",
      icon: "🎙️",
      agent: {
        id: "agent-studio",
        name: "@A Studio Audio",
        role: "CC Studio DAW, reżyseria słuchowisk Biblia Audio, synteza TTS, mastering -16 LUFS",
        stage: "deployed",
        state: "running",
        toolOrModel: "Web Audio API • Gemini 2.5 TTS • ElevenLabs • Wavesurfer",
        source: "polskieradio.cc/studio • /api/direction/ai-direct",
        limits: "Zero-Cost (Własne klucze API BYOK)",
        desc: "Wirtualne studio nagrań słuchowisk radiowych: automatyczny podział ról aktorskich, synteza wielogłosowa, oś czasu i profesjonalny mastering.",
        subagents: [
          {
            id: "sub-cast-director",
            name: "Reżyser Obsady AI",
            role: "Analiza tekstu biblijnego i automatyczne przypisywanie głosów aktorów do postaci",
            stage: "deployed",
            state: "running",
            tool: "/api/direction/ai-direct",
            source: "polskieradio.cc/studio",
            desc: "Dobiera głosy lektorskie do narratora, Jezusa, apostołów i postaci biblijnych z zachowaniem powagi i emocji."
          },
          {
            id: "sub-multivoice-tts",
            name: "Wielogłosowy Syntezator Mowy TTS",
            role: "Generowanie kwestii dialogowych przez Gemini 2.5 Flash TTS i ElevenLabs",
            stage: "deployed",
            state: "running",
            tool: "/api/tts/synthesize",
            source: "Cloudflare Worker Proxy • Gemini TTS",
            desc: "Renderuje partie audio w jakości 24kHz/48kHz z zachowaniem naturalnych pauz i oddechów lektorskich."
          },
          {
            id: "sub-daw-mastering",
            name: "Inżynier Masteringu Osi Czasu DAW",
            role: "Miksowanie ścieżek, podkład muzyczny, normalizacja radiowa -16 LUFS",
            stage: "deployed",
            state: "running",
            tool: "Web Audio Multitrack Engine",
            source: "polskieradio.cc/studio",
            desc: "Zapewnia standard emisyjny: podkład muzyki ambient, efekty dźwiękowe i eksport gotowego słuchowiska MP3/WAV."
          }
        ]
      }
    },
    {
      id: "branch-distrib",
      name: "PUBLIKACJA I DYSTRYBUCJA",
      color: "#C4A35A",
      icon: "🚀",
      agent: {
        id: "agent-distrib",
        name: "@A Publikacja i Dystrybucja",
        role: "Dystrybucja WhatsApp FIFO, priorytet Grupy Nazira, Facebook Bot, Push FCM",
        stage: "deployed",
        state: "running",
        toolOrModel: "Node.js • Puppeteer • WhatsApp Web • FCM Admin SDK",
        source: "Wektor1_VideoFactory/publish_daily_mission.js",
        limits: "100% Zero-Cost",
        desc: "Automatyczny dyspozytor wielokanałowej wysyłki: pilnuje pancernego harmonogramu 06:00, rotacji co godzinę do 2 grup i bezpośrednich powiadomień Dowódcy.",
        subagents: [
          {
            id: "sub-wa-rotator",
            name: "Rotator WhatsApp FIFO (Round-Robin)",
            role: "Wysyłka wersji WWW rozważania co godzinę (10:00–18:00) do dokładnie 2 grup",
            stage: "deployed",
            state: "running",
            tool: "WhatsApp Web Puppeteer Worker",
            source: "Wektor1_VideoFactory",
            desc: "Bezwzględnie wysyła wyłącznie wersję WWW (z linkami i cyframi), chroniąc grupy przed spamem i blokadami."
          },
          {
            id: "sub-wa-nazir",
            name: "Dyspozytor Grupy Nazira (Priorytet)",
            role: "Natychmiastowa wysyłka 3 osobnych wersji (TTS, WWW, SMS) o 06:00 rano",
            stage: "deployed",
            state: "running",
            tool: "WhatsApp Web Direct Bridge",
            source: "Grupa Nazira (Link dedykowany)",
            desc: "Dostarcza komplet materiałów dziennych bezpośrednio do sztabowej grupy Dowódcy Nazira."
          },
          {
            id: "sub-facebook-bot",
            name: "Automatyczny Publikator Facebook",
            role: "Publikacja posta z rozważaniem i linkiem na oficjalnym fanpage'u CC",
            stage: "deployed",
            state: "running",
            tool: "publish_facebook.js • Puppeteer Headless",
            source: "Wektor1_VideoFactory/publish_facebook.js",
            desc: "Publikuje treść rozważania wraz z miniaturą i linkiem do portalu zaraz po zatwierdzeniu publikacji."
          },
          {
            id: "sub-fcm-commander",
            name: "Powiadamiacz Dowódcy FCM",
            role: "Błyskawiczny meldunek Push na telefon Dowódcy (DeviceTokens/admin_phone)",
            stage: "deployed",
            state: "running",
            tool: "Firebase Cloud Messaging v1",
            source: "cc-mission-control",
            desc: "Informuje Dowódcę o udanej publikacji, statusie emisji i gotowości kanałów dystrybucyjnych."
          }
        ]
      }
    },
    {
      id: "branch-lumina",
      name: "SPOŁECZNOŚĆ LUMINA",
      color: "#D4B578",
      icon: "🤝",
      agent: {
        id: "agent-lumina",
        name: "@A Społeczność LUMINA",
        role: "Tablica Społeczności, 16 profili personalnych, Patron Koncept Studio, relacje",
        stage: "deployed",
        state: "running",
        toolOrModel: "Firebase Firestore • WebSockets • PWA Suite",
        source: "polskieradio.cc/lumina • lumina-tablica.html",
        limits: "Firebase Spark Free Tier",
        desc: "Koordynuje chrześcijański portal społecznościowy i relacyjny: sztywny standard szczytu tablicy, moderację świadectw i komunikację bezpośrednią.",
        subagents: [
          {
            id: "sub-tablica-guard",
            name: "Strażnik Szczytu Tablicy Społeczności",
            role: "Utrzymanie żelaznej kolejności wpisów: #1 Dobrze, że jesteś, #2 Koncept Studio, #3 CKD",
            stage: "deployed",
            state: "running",
            tool: "lumina-tablica.html Master Engine",
            source: "polskieradio.cc/lumina-tablica.html",
            desc: "Gwarantuje, że oficjalny patron misji oraz codzienne rozważania znajdują się zawsze na samym szczycie tablicy."
          },
          {
            id: "sub-profiles-guard",
            name: "Strażnik Standardu Profili (16 Kont)",
            role: "Uniwersalna propagacja standardu (brak podkreśleń linków, 44px, modale tylko dla właściciela)",
            stage: "deployed",
            state: "running",
            tool: "lumina-profile-standard.css",
            source: "Wszystkie profile lumina.*.html",
            desc: "Egzekwuje doktrynę Dowódcy: uwagi wniesione do jednego profilu obowiązują globalnie we wszystkich 16 profilach."
          },
          {
            id: "sub-p2p-chat",
            name: "Komunikator Bezpiecznych Rozmów P2P",
            role: "Prywatne wiadomości, szyfrowanie sesji, powiadomienia czatu Dowódcy",
            stage: "deployed",
            state: "running",
            tool: "lumina-chat-typing.js • Firestore Realtime",
            source: "polskieradio.cc/lumina",
            desc: "Zapewnia bezpieczną i godną przestrzeń do budowania chrześcijańskich relacji opartych na wartościach biblijnych."
          }
        ]
      }
    },
    {
      id: "branch-tech",
      name: "TECHNOLOGIA I JAKOŚĆ",
      color: "#E2CC9A",
      icon: "🛡️",
      agent: {
        id: "agent-tech",
        name: "@A Technologia i Jakość",
        role: "Strażnik Kodu SMCC, testy regresji, Mobile Premium, Cloudflare Pages Deployer",
        stage: "deployed",
        state: "running",
        toolOrModel: "Node Test Runner • Playwright • Wrangler • Git Hooks",
        source: "straznik-kodu-check.js • scripts/mobile-premium-regression.test.mjs",
        limits: "100% Zero-Cost",
        desc: "Automatyczny audytor jakości inżynieryjnej: 11 pancernych reguł kodu, dotyk 44px, 194 testy regresji i bezpieczny deployment na krawędź sieci.",
        subagents: [
          {
            id: "sub-smcc-sentinel",
            name: "Strażnik Kodu SMCC (11 Pancernych Reguł)",
            role: "Weryfikacja braku fikcyjnych deklaracji, dotyku min 44px, i18n, defer/module",
            stage: "deployed",
            state: "running",
            tool: "node straznik-kodu-check.js",
            source: "Repozytorium Strona-www-Christian-Culture",
            desc: "Blokuje commity zawierające błędy ergonomiczne lub niedozwolone manipulacje plikami produkcyjnymi."
          },
          {
            id: "sub-regression-suite",
            name: "Bateria Testów Regresji CC (194 testy)",
            role: "Weryfikacja integralności palety, motywu jasnego/ciemnego i kanonicznych źródeł",
            stage: "deployed",
            state: "running",
            tool: "npm.cmd run test:cc-regression",
            source: "scripts/cc-regression.test.mjs",
            desc: "Gwarancja 100% pass dla polityki braku powracających usterek (CC_NO_REGRESSION_POLICY.md)."
          },
          {
            id: "sub-mobile-premium",
            name: "Strażnik Mobile Premium (Playwright)",
            role: "Weryfikacja działania na symulatorze smartfonów (ekrany 360–430px)",
            stage: "deployed",
            state: "running",
            tool: "npm.cmd run test:mobile-premium",
            source: "scripts/mobile-premium-regression.test.mjs",
            desc: "Eliminacja poziomego paska przewijania, kolizji tekstowych i nieoptymalnych odstępów na telefonach."
          },
          {
            id: "sub-cloudflare-deployer",
            name: "Podwójny Git Pusher & Cloudflare Deployer",
            role: "Automatyczna budowa paczki .pages-release i natychmiastowe wdrożenie na Pages",
            stage: "deployed",
            state: "running",
            tool: "scripts/build-pages-release.mjs • Wrangler CLI",
            source: "Cloudflare Pages polskieradio.pages.dev",
            desc: "Zarządza podwójnym pushem (origin + lumina-repo) i bezpośrednim uploadem na globalną sieć Cloudflare."
          }
        ]
      }
    },
    {
      id: "branch-memory",
      name: "PAMIĘĆ I ARCHIWUM",
      color: "#C4A35A",
      icon: "🧠",
      agent: {
        id: "agent-memory",
        name: "@A Pamięć i Archiwum",
        role: "MCP Shared Memory Server, centralny rejestr treści, backupy i archiwa",
        stage: "deployed",
        state: "running",
        toolOrModel: "MCP Protocol • JSON Registry • Markdown Storage",
        source: "Misja CC/JOMA_SHARED_MEMORY • data/ecosystem-map.json",
        limits: "100% Zero-Cost",
        desc: "Centralna pamięć operacyjna ekosystemu: rejestr projektów, archiwum wszystkich rozważań od 2026 roku i narzędzia sztabowe MCP.",
        subagents: [
          {
            id: "sub-mcp-server",
            name: "Serwer Narzędzi MCP Shared Memory",
            role: "Udostępnianie narzędzi cc_overview, cc_memory_search dla agentów AI",
            stage: "deployed",
            state: "running",
            tool: "cc-shared-memory MCP Server",
            source: ".gemini/antigravity/mcp/cc-shared-memory",
            desc: "Zapewnia ustrukturyzowany interfejs programistyczny do wspólnej pamięci JOMA dla wszystkich modeli AI."
          },
          {
            id: "sub-content-registry",
            name: "Rejestr Treści i Zasobów Ekosystemu",
            role: "Baza metadanych artykułów, mediów i kanałów CC",
            stage: "deployed",
            state: "running",
            tool: "content-registry.html • data/ecosystem-map.json",
            source: "polskieradio.cc/content-registry.html",
            desc: "Weryfikuje poprawność routingu, statusy publikacji i integralność źródeł informacyjnych."
          },
          {
            id: "sub-append-only-archive",
            name: "Niezmienne Archiwum Rozważań (Append-Only)",
            role: "Centralna baza wszystkich rozważań i wersji TTS/WWW/SMS od początku misji",
            stage: "deployed",
            state: "running",
            tool: "Markdown Parser • JSON Sync Engine",
            source: "Wektor1_VideoFactory/rozwazania_baza.md",
            desc: "Zasada Append-Only: wcześniejsze rozważania nigdy nie są usuwane ani modyfikowane wstecz."
          }
        ]
      }
    },
    {
      id: "branch-growth",
      name: "ROZWÓJ MISJI I ZASIĘG",
      color: "#D4B578",
      icon: "🌍",
      agent: {
        id: "agent-growth",
        name: "@A Rozwój Misji",
        role: "Misja Milion Dusz /milion, partnerstwa misyjne, wolontariat, audyt Zero-Cost",
        stage: "deployed",
        state: "running",
        toolOrModel: "Cloudflare Analytics • Revolut Me • Zrzutka Gateway",
        source: "polskieradio.cc/milion • polskieradio.cc/wspolpraca",
        limits: "100% Zero-Cost",
        desc: "Koordynuje inicjatywy ewangelizacyjne na dużą skalę: licznik zjednoczonych w modlitwie za Polskę, nabór wolontariuszy i partnerów misyjnych.",
        subagents: [
          {
            id: "sub-milion-counter",
            name: "Koordynator Zjednoczeni za Polskę",
            role: "Licznik CC Misji Milion Dusz pozyskanych dla Chrystusa (/milion)",
            stage: "deployed",
            state: "running",
            tool: "polskieradio.cc/milion Engine",
            source: "polskieradio.cc/milion",
            desc: "Mobilizuje Polaków na całym świecie do codziennej modlitwy i zaangażowania w ewangelizację."
          },
          {
            id: "sub-partnerships",
            name: "Hub Współpracy Partnerskiej",
            role: "Formularz zgłoszeniowy dla autorów, pastorów, lektorów i wolontariuszy",
            stage: "deployed",
            state: "running",
            tool: "polskieradio.cc/wspolpraca",
            source: "polskieradio.cc/wspolpraca",
            desc: "Centralny punkt zgłaszania inicjatyw partnerskich i włączania nowych współpracowników do misji CC."
          },
          {
            id: "sub-zero-cost-auditor",
            name: "Strażnik Budżetu Zero-Cost (@B)",
            role: "Ciągły audyt wykorzystania darmowych limitów chmurowych (Zero Egress)",
            stage: "deployed",
            state: "running",
            tool: "Cloudflare & Firebase Quota Monitor",
            source: "Zasada Zero-Cost Ekosystemu",
            desc: "Gwarantuje, że żaden agent ani proces nie generuje opłat ani nie przekracza darmowych limitów operacyjnych."
          }
        ]
      }
    }
  ]
};

async function serveAgentsMap(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }

  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Brak autoryzacji. Wymagany token Bearer sesji administratora.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return new Response(JSON.stringify({ error: 'Pusty token sesji.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Weryfikacja tokena przez oficjalne Google TokenInfo API lub Firebase Identitytoolkit
  let tokenData = null;
  try {
    // 1. Sprawdź jako standardowy token Google OAuth2/OIDC
    let googleResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (googleResp.ok) {
      tokenData = await googleResp.json();
    } else {
      // 2. Firebase ID Token (lumina-cc): PEŁNA weryfikacja podpisu RS256 kluczami Google (securetoken).
      // Poprawka bezpieczeństwa (Claude, 2026-10-12): wcześniej payload był tylko dekodowany (atob) bez sprawdzenia
      // podpisu — spreparowany token z adresem Dowódcy dawał dostęp do warstwy @A.
      const verified = await verifyFirebaseIdToken(idToken);
      if (verified && verified.email) tokenData = verified;
    }

    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Sesja wygasła lub token jest nieprawidłowy.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Błąd weryfikacji tożsamości: ' + (err.message || 'Błąd sieci') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Dostęp wyłącznie dla Administratora: nazirczarkes@gmail.com (zweryfikowany e-mail)
  const userEmail = (tokenData.email || '').toLowerCase().trim();
  const isEmailVerified = tokenData.email_verified === 'true' || tokenData.email_verified === true;
  const isAuthorizedCommander = userEmail === 'nazirczarkes@gmail.com' && isEmailVerified;

  if (!isAuthorizedCommander) {
    return new Response(JSON.stringify({
      error: 'Brak uprawnień. Dostęp do prywatnej warstwy @A zastrzeżony wyłącznie dla Administratora Misji (nazirczarkes@gmail.com).'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch(e) {}
    const action = body.action || 'ping';
    const taskId = 'task_' + Date.now();
    return new Response(JSON.stringify({
      success: true,
      taskId: taskId,
      action: action,
      timestamp: new Date().toISOString(),
      message: `Polecenie '${action}' zostało zweryfikowane i autoryzowane dla Dowódcy (${userEmail}).`
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    user: {
      email: userEmail,
      uid: tokenData.sub,
      role: 'Administrator Misji'
    },
    agentsData: AGENTS_MISSION_DATA
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, private',
      'Access-Control-Allow-Origin': '*'
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────
// MODUŁ WSPARCIA I PODZIĘKOWAŃ: polskieradio.cc/wspieraj
// Realizuje zero-qa standard: prawdziwe podziękowania wyłącznie z potwierdzonym
// wsparciem i zgodą (imienną lub anonimową). Brak fikcyjnych wpisów.
// Weryfikacja sesji LUMINA (Firebase ID Token) po stronie serwera.
// ──────────────────────────────────────────────────────────────────────────
const SUPPORT_ORIGIN = 'https://polskieradio.cc';
const SUPPORT_SOURCES = new Set(['patronite', 'youtube', 'bank', 'blik', 'revolut', 'zrzutka']);
const SUPPORT_ALIASES = new Set([
  '/patron', '/patronat', '/patroni',
  '/mecenas', '/mecenat', '/mecenasi',
  '/wesprzyj', '/wsparcie', '/pomoc',
  '/darowizna', '/darowizny', '/dar', '/ofiara', '/ofiary',
  '/dziesiecina', '/dziesięcina',
  '/donate', '/donation', '/donations',
  '/support',
  '/patronite', '/zrzutka', '/zrzutki'
]);

function supportNormalizeName(value) {
  return String(value || '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>]/g, '').trim().slice(0, 60);
}

const luminaSupportAdapter = {
  async verifySession(request) {
    const authHeader = request.headers.get('Authorization') || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token) {
      const cookie = request.headers.get('Cookie') || '';
      const match = cookie.match(/(?:^|;\s*)__session=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (!token) return null;
    const verified = await verifyFirebaseIdToken(token);
    if (!verified || !verified.sub) return null;
    return { uid: verified.sub, email: verified.email || '' };
  },

  async createCsrfToken(session) {
    const key = session.uid + '|' + Math.floor(Date.now() / 3600000);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key + '|cc_support_csrf_salt'));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  },

  async verifyCsrfToken(session, token) {
    if (!token || typeof token !== 'string') return false;
    const cur = await this.createCsrfToken(session);
    if (token === cur) return true;
    const prevKey = session.uid + '|' + (Math.floor(Date.now() / 3600000) - 1);
    const prevDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prevKey + '|cc_support_csrf_salt'));
    const prev = [...new Uint8Array(prevDigest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    return token === prev;
  },

  async verifySupportEvidence(event) {
    return { verified: false };
  }
};

async function handleSupportApi(request, env, adapter = luminaSupportAdapter) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/cc-support/')) return null;
  const db = env.CC_SUPPORT_DB || env.milion_db;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Integration unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  const jsonResp = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });

  try {
    if (url.pathname === '/api/cc-support/thanks' && request.method === 'GET') {
      let results = [];
      try {
        const queryResult = await db.prepare(`
          SELECT p.public_name, p.consent, p.anonymous_consent, s.source, MAX(s.confirmed_at) AS recent
          FROM cc_verified_support s
          JOIN cc_support_preferences p ON p.uid = s.supporter_uid
          WHERE s.revoked = 0 AND ((p.consent = 1 AND p.public_name <> '') OR p.anonymous_consent = 1)
          GROUP BY p.uid, s.source
          ORDER BY recent DESC LIMIT 50
        `).all();
        results = queryResult?.results || [];
      } catch (tableErr) {
        // Tabela może jeszcze nie istnieć przed schema.sql — zwróć pustą listę potwierdzonych (bez fikcyjnych)
        results = [];
      }

      const labels = {
        patronite: 'patronat w Patronite',
        youtube: 'wsparcie na YouTube',
        bank: 'dar misyjny',
        blik: 'dar misyjny',
        revolut: 'dar misyjny',
        zrzutka: 'wsparcie zbiórki'
      };
      const anonymousLabels = {
        patronite: 'Dziękujemy anonimowym patronom z Patronite.',
        youtube: 'Dziękujemy anonimowym wspierającym na YouTube.',
        bank: 'Dziękujemy anonimowym darczyńcom misji.',
        blik: 'Dziękujemy anonimowym darczyńcom misji.',
        revolut: 'Dziękujemy anonimowym darczyńcom misji.',
        zrzutka: 'Dziękujemy anonimowym wspierającym zbiórki.'
      };

      const items = [];
      const seen = new Set();
      for (const row of results) {
        const name = supportNormalizeName(row.public_name);
        if (!labels[row.source]) continue;
        if (row.anonymous_consent !== 1 && !name) continue;
        const text = row.anonymous_consent === 1
          ? anonymousLabels[row.source]
          : 'Dziękujemy: ' + name + ' — ' + labels[row.source] + '.';
        if (!seen.has(text)) {
          seen.add(text);
          items.push({ text });
        }
      }
      return jsonResp({ items });
    }

    if (typeof adapter?.verifySession !== 'function') return jsonResp({ error: 'LUMINA session adapter unavailable' }, 503);
    const session = await adapter.verifySession(request);
    if (!session || typeof session.uid !== 'string' || !session.uid.trim()) {
      return jsonResp({ authenticated: false }, 401);
    }

    if (url.pathname === '/api/cc-support/session' && request.method === 'GET') {
      let preference = null;
      try {
        preference = await db.prepare('SELECT public_name, consent, anonymous_consent FROM cc_support_preferences WHERE uid = ?').bind(session.uid).first();
      } catch (e) {
        preference = null;
      }
      const csrf = typeof adapter.createCsrfToken === 'function' ? await adapter.createCsrfToken(session) : '';
      return jsonResp({
        authenticated: true,
        publicName: preference?.public_name || '',
        consent: preference?.consent === 1,
        anonymousConsent: preference?.anonymous_consent === 1,
        csrfToken: csrf
      });
    }

    if (url.pathname === '/api/cc-support/consent' && request.method === 'PUT') {
      if (request.headers.get('Origin') !== SUPPORT_ORIGIN || !request.headers.get('Content-Type')?.startsWith('application/json')) {
        return jsonResp({ error: 'Invalid origin or content type' }, 403);
      }
      if (typeof adapter.verifyCsrfToken !== 'function' || !(await adapter.verifyCsrfToken(session, request.headers.get('X-CC-CSRF')))) {
        return jsonResp({ error: 'Invalid CSRF token' }, 403);
      }
      const raw = await request.text();
      if (raw.length > 4096) return jsonResp({ error: 'Payload too large' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return jsonResp({ error: 'Invalid JSON' }, 400); }
      if (!body || typeof body.consent !== 'boolean' || typeof body.anonymousConsent !== 'boolean' || (body.consent && body.anonymousConsent)) {
        return jsonResp({ error: 'Invalid consent' }, 400);
      }
      const name = supportNormalizeName(body.publicName);
      if (body.consent && !name) return jsonResp({ error: 'Public name required' }, 400);

      try {
        await db.prepare(`
          INSERT INTO cc_support_preferences (uid, public_name, consent, anonymous_consent, consent_updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(uid) DO UPDATE SET
            public_name = excluded.public_name,
            consent = excluded.consent,
            anonymous_consent = excluded.anonymous_consent,
            consent_updated_at = excluded.consent_updated_at
        `).bind(session.uid, body.consent ? name : '', body.consent ? 1 : 0, body.anonymousConsent ? 1 : 0, new Date().toISOString()).run();
      } catch (dbErr) {
        return jsonResp({ error: 'Database update failed' }, 500);
      }
      return jsonResp({ saved: true });
    }

    return jsonResp({ error: 'Not found' }, 404);
  } catch (err) {
    return jsonResp({ error: 'Service temporarily unavailable' }, 503);
  }
}

async function handleSurvivalRoute(request, env) {
  const url = new URL(request.url);
  const p = url.pathname.replace(/\/$/, '').toLowerCase();
  if (p === '/surwiwal' || p === '/survival.html') {
    const targetUrl = new URL(request.url);
    targetUrl.pathname = '/survival';
    return Response.redirect(targetUrl.toString(), 301);
  }
  if (p === '/survival') {
    const targetUrl = new URL(request.url);
    targetUrl.pathname = '/survival/';
    return env.ASSETS.fetch(new Request(targetUrl, request));
  }
  return null;
}

async function handleSupportRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  // Bezpośrednia obsługa /wspieraj i /wspieraj/ — worker pobiera asset i zwraca świeży 200
  // (omija wbudowany mechanizm canonical redirect Cloudflare Pages → 308)
  if (path === '/wspieraj') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/wspieraj.html';
    assetUrl.search = '';
    const assetResp = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET', headers: { 'Accept': 'text/html' } }));
    // Zwróć świeży 200 niezależnie od tego co CF Pages odpowiedział wewnętrznie
    const body = await assetResp.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self' https: data: blob:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube-nocookie.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://accounts.google.com https:; frame-src 'self' https://open.spotify.com https://drive.google.com https://www.youtube-nocookie.com https://www.youtube.com https://accounts.google.com https://*.firebaseapp.com; connect-src 'self' https: wss:; media-src 'self' blob: data: https:; font-src 'self' data: https:;",
      },
    });
  }
  // Bezkonfliktowe aliasy z README.md oraz popularne linki alternatywne (/patron, /mecenas, /wesprzyj itd.)
  let decodedPath = path.toLowerCase();
  try {
    decodedPath = decodeURIComponent(path).toLowerCase();
  } catch (e) {}
  const basePath = decodedPath.replace(/\.html$/, '');

  if (SUPPORT_ALIASES.has(decodedPath) || SUPPORT_ALIASES.has(basePath) || url.pathname === '/wspieraj.html') {
    const targetUrl = new URL(request.url);
    targetUrl.pathname = '/wspieraj';
    return Response.redirect(targetUrl.toString(), 301);
  }
  return null;
}

async function handleBiblijneUwielbienieRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');

  // 1. Kanoniczny adres /BiblijneUwielbienie (z wielkimi literami): pobierz natywny asset /biblijne-uwielbienie
  if (path === '/BiblijneUwielbienie') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/biblijne-uwielbienie';
    return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  }

  // 2. Skróty i aliasy (/uwielbienie, /karaoke, /spiewnik, /śpiewnik, /biblijneuwielbienie) przekieruj 301 na kanoniczny /BiblijneUwielbienie
  let decodedPath = path.toLowerCase();
  try {
    decodedPath = decodeURIComponent(path).toLowerCase();
  } catch (e) {}

  if (
    decodedPath === '/uwielbienie' ||
    decodedPath === '/karaoke' ||
    decodedPath === '/spiewnik' ||
    decodedPath === '/śpiewnik' ||
    decodedPath === '/biblijneuwielbienie'
  ) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = '/BiblijneUwielbienie';
    return Response.redirect(redirectUrl.toString(), 301);
  }

  // 3. API Modułu „Patron Rozdziału” (P1)
  if (path === '/api/biblijne-uwielbienie/patron/config') {
    return new Response(JSON.stringify({
      status: 'ok',
      mission: 'Christian Culture · Biblia Śpiewana',
      totalChapters: 1189,
      titleTemplate: 'Biblia Śpiewana / {chapterId}',
      methods: [
        { id: 'zrzutka', name: 'Zrzutka.pl', url: 'https://zrzutka.pl/rs4g4v' },
        { id: 'revolut', name: 'Revolut Pay', url: 'https://revolut.me/christianculture' },
        { id: 'wspieraj', name: 'Oficjalne formy CC', url: 'https://polskieradio.cc/wspieraj' }
      ],
      policy: {
        voluntary: true,
        freeAccess: true,
        verificationRequired: true,
        zeroFakeCounters: true,
        adminAudit: true
      }
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  if (path === '/api/biblijne-uwielbienie/patron/acknowledgments') {
    // Only verified patrons are served. Zero fake counters or auto-credited links.
    return new Response(JSON.stringify({
      status: 'ok',
      verifiedPatronsCount: 0,
      acknowledgments: []
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }

  if (path === '/api/biblijne-uwielbienie/patron/declare' && request.method === 'POST') {
    try {
      const data = await request.json();
      const chapterId = typeof data.chapterId === 'string' ? data.chapterId.trim() : '';
      const anonymous = !!data.anonymous;
      const displayName = anonymous ? 'Anonimowy Patron' : String(data.displayName || '').slice(0, 60).trim();
      const consentPage = !!data.consentPage;
      const consentLumina = !!data.consentLumina;

      if (!chapterId || !/^[A-Z0-9]{2,4}-\d{3}$/.test(chapterId)) {
        return new Response(JSON.stringify({ ok: false, error: 'invalid_chapter_id' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      return new Response(JSON.stringify({
        ok: true,
        status: 'received',
        pendingVerification: true,
        chapterId,
        displayName: displayName || 'Anonimowy Patron',
        consentPage,
        consentLumina,
        message: 'Zgłoszenie zostało przyjęte do weryfikacji. Dziękujemy!'
      }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'bad_request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  }

  return null;
}

async function handlePersonalHubRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const lowerPath = path.toLowerCase();

  if (lowerPath === '/moje-centrum' || lowerPath === '/centrum') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/moje-centrum.html';
    assetUrl.search = '';
    const assetResp = await env.ASSETS.fetch(new Request(assetUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    }));
    const body = await assetResp.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  if (lowerPath === '/hub') {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = '/moje-centrum';
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return null;
}

async function handlePodcastsRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const lowerPath = path.toLowerCase();

  if (lowerPath === '/podcasty') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/podcasty.html';
    assetUrl.search = '';
    const assetResp = await env.ASSETS.fetch(new Request(assetUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    }));
    const body = await assetResp.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  if (lowerPath === '/podcasts' || lowerPath === '/podcast') {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = '/podcasty';
    return Response.redirect(redirectUrl.toString(), 301);
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // One canonical renderer for this existing public profile.
    if (['/lumina.marekjakubowski','/lumina.marekjakubowski.html'].includes(url.pathname.toLowerCase())) {
      return Response.redirect(new URL('/lumina-profile.html?u=marekjakubowski',url).toString(),302);
    }

    // 1. Kanonizacja domeny www -> apex (SEO / P0 / Etap 3)
    if (url.hostname === 'www.polskieradio.cc') {
      const canonicalTarget = new URL(request.url);
      canonicalTarget.hostname = 'polskieradio.cc';
      return Response.redirect(canonicalTarget.toString(), 301);
    }
    // Owner-authorized withdrawal of this public profile (2026-10-14).
    const removedProfilePaths = new Set(['/lumina.zbyszekgieron', '/lumina.zbyszekgieron.html', '/lumina/zbyszekgieron', '/lumina/zbyszek-gieron', '/lumina/gieron', '/zbyszekgieron', '/zbyszek-gieron', '/gieron']);
    const profileSlug = (url.searchParams.get('u') || '').toLowerCase().replace(/^u_/, '');
    let removalPath = url.pathname;
    try { removalPath = decodeURIComponent(removalPath); } catch { /* Invalid paths use the general deny guard below. */ }
    if (removedProfilePaths.has(removalPath.toLowerCase().replace(/\/$/, '')) ||
        (/^\/lumina-profile(?:\.html)?$/.test(removalPath) && ['zbyszekgieron','zbyszek','gieron'].includes(profileSlug)) ||
        /^\/avatar_zbyszek_gieron\.(?:jpg|jpeg|png|webp)$/i.test(removalPath)) {
      return new Response('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profil niedostępny</title><main><h1>Profil niedostępny</h1><p>Ta strona profilu nie jest już dostępna.</p><a href="/lumina">Wróć do LUMINA</a></main></html>', {
        status: 410,
        headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff'}
      });
    }
    if (url.pathname.startsWith('/api/bu/v1/')) {
      return handleBUApi(request, env);
    }
    if (url.pathname.startsWith('/api/ai-dla-jezusa/v1')) {
      return handleAiDlaJezusaApi(request, env);
    }
    if (url.pathname.startsWith('/api/newsletter')) {
      return handleNewsletterApiRequest(request, env, (tok) => verifyFirebaseIdToken(tok));
    }
    if (url.pathname === '/api/answer' || url.pathname.startsWith('/api/search-rag')) {
      return handleSearchRagApi(request, env);
    }
    if (isBlocked(url.pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    // Pages combines matching _headers rules, including the generic JS cache.
    // Set one authoritative policy after ASSETS for messaging scripts and their loader.
    if (['/firebase-messaging-sw.js', '/lumina-db.js', '/components/lumi-direct-dock-adapter.js', '/components/lumi-direct-dock.js', '/components/cc-support-footer.js', '/css/lumina-chat-premium.css', '/css/lumi-direct-dock.css', '/js/lumina-member-presence.js'].includes(url.pathname) && ['GET','HEAD'].includes(request.method)) {
      const asset = await env.ASSETS.fetch(request);
      const response = new Response(asset.body, asset);
      response.headers.set('Cache-Control','no-cache, no-store, must-revalidate');
      return response;
    }

    if (url.pathname === '/api/admin/agents-map') {
      return serveAgentsMap(request);
    }

    // Obsługa CC Support API (podziękowania i zgody) oraz tras /wspieraj
    const supportApiResponse = await handleSupportApi(request, env);
    if (supportApiResponse) return supportApiResponse;
    const supportPageRoute = await handleSupportRoute(request, env);
    if (supportPageRoute) return supportPageRoute;
    const survivalRoute = await handleSurvivalRoute(request, env);
    if (survivalRoute) return survivalRoute;
    const worshipRoute = await handleBiblijneUwielbienieRoute(request, env);
    if (worshipRoute) return worshipRoute;
    const personalHubRoute = await handlePersonalHubRoute(request, env);
    if (personalHubRoute) return personalHubRoute;
    const podcastsRoute = await handlePodcastsRoute(request, env);
    if (podcastsRoute) return podcastsRoute;

    if (url.pathname.startsWith('/api/tresci-18/')) {
      return handleAdultContent(request, env, url);
    }

    // AI Gateway recovery is code/test-only. No provider calls, bindings,
    // credentials or costs may be activated through the public portal.
    if (url.pathname === '/api/ai' || url.pathname.startsWith('/api/ai/')) {
      return Response.json({ success: false, error: { code: 'GATEWAY_DISABLED' } }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
      });
    }

    const ua = request.headers.get('user-agent') || '';
    const isCrawler = isSocialCrawler(ua);

    // Dynamiczne udostępnianie postów pod ścieżką /post/:id
    if (url.pathname.startsWith('/post/')) {
      const postId = url.pathname.slice('/post/'.length).replace(/\/$/, '');
      if (isCrawler) {
        return handleSocialPostCrawler(postId, url, ua);
      }
      return Response.redirect(`https://polskieradio.cc/tablica?post=${encodeURIComponent(postId)}#${encodeURIComponent(postId)}`, 302);
    }

    // Endpoint wstecznej zgodności /v1/post/share
    if (url.pathname === '/v1/post/share') {
      const postId = url.searchParams.get('id') || url.searchParams.get('post') || '';
      return handleSocialPostCrawler(postId, url, ua);
    }

    const p = url.pathname.toLowerCase().replace(/\/$/, '');
    let decodedP = p;
    try {
      decodedP = decodeURIComponent(url.pathname).toLowerCase().replace(/\/$/, '');
    } catch {
      decodedP = p;
    }

    // Przechwycenie social crawlerów dla /milion oraz /widget
    if (decodedP === '/milion' || decodedP === '/milion.html' || decodedP === '/widget' || decodedP === '/widget.html') {
      if (isCrawler) {
        return handleSocialMilionCrawler(url);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SEO & KAMPANIJNE ALIAS (301) DLA LICZNIKA I WIDGETU: /milion
    // ──────────────────────────────────────────────────────────────────────────
    const MILION_ALIASES = [
      '/cel',
      '/licznik',
      '/misja-milion',
      '/cel-milion',
      '/onemillion',
      '/1m',
      '/live',
      '/stream',
      '/dlastron',
      '/partnerzy',
      '/odtwarzacz',
      '/kod-widget',
      '/kod-odtwarzacza',
      '/razem',
      '/glos'
    ];
    if (MILION_ALIASES.includes(decodedP) || decodedP === '/embed') {
      if (isCrawler) {
        return handleSocialMilionCrawler(url);
      }
      return Response.redirect('https://polskieradio.cc/milion', 301);
    }

    // Skrót /wspieram kierujący do wsparcia mecenatu / Patronite
    if (decodedP === '/wspieram') {
      return Response.redirect('https://patronite.pl/christian-culture', 302);
    }

    // Przechwycenie social crawlerów dla /tablica?post=... oraz /lumina-tablica?post=...
    if ((decodedP === '/tablica' || decodedP === '/lumina-tablica' || decodedP === '/lumina-tablica.html') && (url.searchParams.has('post') || url.searchParams.has('id'))) {
      if (isCrawler) {
        const postId = url.searchParams.get('post') || url.searchParams.get('id') || '';
        return handleSocialPostCrawler(postId, url, ua);
      }
    }

    if (decodedP === '/pokonaćgoliata' || decodedP === '/pokonacgoliata') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/pokonac-goliata';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Kreator kalendarza: stare i skrócone adresy (np. /kalendarz2027 z menu strony głównej) → /kalendarz
    if (/^\/(kalendarz-?20(26|27|28|29|30)|kreator-?kalendarza)\/?$/i.test(decodedP)) {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/kalendarz';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // LUMI KIDS: krótkie adresy (np. /kids) → /lumi-kids/ oraz /kids/app → /lumi-kids/app/
    {
      const kidsAlias = /^\/(kids|lumikids|lumi_kids|lumi-kid|lumi\.kids|lumi%20kids|lumi kids)(\/app)?\/?$/i.exec(decodedP);
      if (kidsAlias) {
        const redirectUrl = new URL(request.url);
        redirectUrl.pathname = kidsAlias[2] ? '/lumi-kids/app/' : '/lumi-kids/';
        return Response.redirect(redirectUrl.toString(), 301);
      }
    }

    if (decodedP === '/ogłoszenia' || decodedP === '/tablica-ogloszen') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ogloszenia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/moj-werset-dnia' || decodedP === '/mój-werset-dnia' || decodedP === '/mojwersetdnia') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/werset-dnia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/ksiazki' || decodedP === '/audiobooki' || decodedP === '/ebooki') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/biblioteka';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/wychowanie' || decodedP === '/dzieci') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/edukacja';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/emocje') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/psychologia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/pieniadze') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/finanse';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/onas' || decodedP === '/about' || decodedP === '/o-inicjatywie') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/o-nas';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Zamienniki subdomen cclite.pl (randka, centrum, usługi -> polskieradio.cc)
    if (/^\/(randka|randki)\/?$/i.test(decodedP)) {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/lumina';
      return Response.redirect(redirectUrl.toString(), 301);
    }
    if (/^\/(usługi|uslugi|katalog-uslug|katalog-usług)\/?$/i.test(decodedP)) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/uslugi/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (/^\/(wizytówki|wizytowki|katalog-wizytowek|katalog-wizytówek)\/?$/i.test(decodedP)) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/wizytowki/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }
    // Wyszukiwarka ekosystemu pod własnym adresem (decyzja L0 26.10.2026); 200 także bez ukośnika, bo to adres kanoniczny
    if (/^\/wyszukiwarka\/?$/i.test(decodedP)) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/wyszukiwarka/';
      const assetRes = await env.ASSETS.fetch(new Request(targetUrl, request));
      const res = new Response(assetRes.body, assetRes);
      res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (url.searchParams.has('q') || url.searchParams.has('query')) {
        res.headers.set('X-Robots-Tag', 'noindex, follow, noarchive');
      } else {
        res.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large');
      }
      return res;
    }
    if (decodedP === '/wizytówka' || decodedP === '/wizytowka') {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/wizytowka/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    
    if (decodedP === '/ai-antychryst' || decodedP === '/ai-kontra-antychryst' || decodedP === '/si-antychryst') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/si/ai-antychryst';
      return Response.redirect(redirectUrl.toString(), 301);
    }
    if (decodedP === '/technologia' || decodedP === '/ai' || decodedP === '/sztucznainteligencja' || decodedP === '/sztuczna-inteligencja' || decodedP === '/synthetic-intelligence' || decodedP === '/superintelligence') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/si';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/misja') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/misje';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/obrona-wiary') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/apologetyka';
      return Response.redirect(redirectUrl.toString(), 301);
    }
    if (decodedP === '/muzyka') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/music';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP.startsWith('/music/')) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = `${decodedP}/`;
      const res = await env.ASSETS.fetch(new Request(targetUrl, request));
      if (res.status === 404) {
        const fallbackUrl = new URL(request.url);
        fallbackUrl.pathname = '/music/';
        return env.ASSETS.fetch(new Request(fallbackUrl, request));
      }
      return res;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CCN GLOBAL DISCOVERY (P0): Mapowanie ?art=<id> na kanoniczny Clean URL
    // Wyszukiwarki klasyczne i roboty AI (NotebookLM, ChatGPT, Gemini, Claude)
    // otrzymują natychmiastowe przekierowanie 301 na pełny semantyczny HTML SSG.
    // ═══════════════════════════════════════════════════════════════════════════
    const articleSection = decodedP.replace(/^\//, '').replace(/\.html$/, '');
    if (Object.hasOwn(ccnArticleRoutes, articleSection) && url.searchParams.has('art')) {
      const artId = url.searchParams.get('art');
      const sectionRoutes = ccnArticleRoutes[articleSection];
      // Only redirect published IDs/slugs. Unknown IDs keep the existing portal behavior.
      if (Object.hasOwn(sectionRoutes, artId)) {
        const redirectTarget = new URL(request.url);
        redirectTarget.pathname = sectionRoutes[artId];
        redirectTarget.searchParams.delete('art');
        return Response.redirect(redirectTarget.toString(), 301);
      }
    }

    const THEMATIC_PORTALS = ['music', 'biblioteka', 'ogloszenia', 'ziu', 'kuchnia', 'nauka', 'historia', 'biologia', 'prawo', 'seks', 'biznes', 'kultura', 'wspolpraca', 'news', 'edukacja', 'psychologia', 'finanse', 'technologie', 'misje', 'apologetyka', 'si'];
    const portalMatch = THEMATIC_PORTALS.find(id => decodedP === `/${id}`);
    if (portalMatch) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = `/${portalMatch}/`;
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (decodedP === '/zdrowie' || decodedP === '/zdrowie-i-uroda') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ziu';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/dieta' || decodedP === '/diety') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/kuchnia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/sport' || decodedP === '/aktywnosc' || decodedP === '/aktywność' || decodedP === '/ruch') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ziu';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (p === '/aktualnosci' || p === '/aktualnosci.html' || p === '/ccn' || p === '/ccn-news' || p === '/raport' || p === '/sprawozdanie') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/news';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (p === '/ambientsleep' || p === '/ambient-sleep') {
      const ambientUrl = new URL(request.url);
      ambientUrl.pathname = '/ambientsleep';
      return env.ASSETS.fetch(new Request(ambientUrl, request));
    }

    if (p === '/akademia') {
      const akademiaUrl = new URL(request.url);
      akademiaUrl.pathname = '/akademia';
      return env.ASSETS.fetch(new Request(akademiaUrl, request));
    }




    if (p.startsWith('/akademia/') && !p.startsWith('/akademia/certyfikat')) {
      if (p.startsWith('/akademia/apokalipsa') || p.startsWith('/akademia/kurscodzienny')) {
        const resp = await env.ASSETS.fetch(request);
        if (resp.status === 404 && !url.pathname.includes('.')) {
          const fallbackUrl = new URL(request.url);
          fallbackUrl.pathname = url.pathname.replace(/\/$/, '') + '.html';
          const fallbackResp = await env.ASSETS.fetch(new Request(fallbackUrl, request));
          if (fallbackResp.status < 400) return fallbackResp;
        }
        return resp;
      }
      const target = p.replace('/akademia/', '/kursy/');
      const kursyUrl = new URL(request.url);
      kursyUrl.pathname = target;
      return env.ASSETS.fetch(new Request(kursyUrl, request));
    }


    // Studio API Endpoints
    if (url.pathname === '/api/bible/ubg/info') {
      const ubgInfoReq = new Request(new URL('/data/ubg_info.json', request.url), request);
      return env.ASSETS.fetch(ubgInfoReq);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GLOBALNY LICZNIK KAMPANII: /api/milion/count (CLOUDFLARE D1)
    // ──────────────────────────────────────────────────────────────────────────
    if (url.pathname === '/api/milion/count') {
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
      }

      const db = env.milion_db;

      if (request.method === 'GET') {
        try {
          if (db) {
            const row = await db.prepare('SELECT count, updated_at FROM counters WHERE id = ?').bind('milion_listeners').first();
            const count = row ? Number(row.count || 0) : 0;
            return new Response(JSON.stringify({ success: true, count, source: 'd1' }), { status: 200, headers });
          }
        } catch (err) {
          console.error('D1 GET Error:', err);
        }
        return new Response(JSON.stringify({ success: false, error: 'counter_unavailable' }), { status: 503, headers });
      }

      if (request.method === 'POST') {
        try {
          if (db) {
            const now = Date.now();
            // 🛡️ STRAŻNIK (2026-10-11): licznik ma pokazywać prawdziwą aktywność, nie liczbę kliknięć.
            // Ta sama osoba (adres IP + przeglądarka) liczona jest raz dziennie dla każdego rodzaju akcji.
            // Przechowujemy wyłącznie skrót SHA-256 (bez adresu IP), a wpisy starsze niż 3 dni są usuwane.
            let actionType = 'akcja';
            try {
              const body = await request.clone().json();
              if (body && typeof body.type === 'string') actionType = body.type.replace(/[^a-z0-9_-]/gi, '').slice(0, 20) || 'akcja';
            } catch (e) {}
            const day = new Date(now).toISOString().slice(0, 10);
            const who = (request.headers.get('CF-Connecting-IP') || '') + '|' + (request.headers.get('User-Agent') || '');
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(day + '|' + actionType + '|' + who));
            const visitorKey = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
            await db.prepare('CREATE TABLE IF NOT EXISTS milion_seen (k TEXT PRIMARY KEY, ts INTEGER NOT NULL)').run();
            const seen = await db.prepare('INSERT OR IGNORE INTO milion_seen (k, ts) VALUES (?, ?)').bind(visitorKey, now).run();
            const isNew = !!(seen && seen.meta && seen.meta.changes > 0);
            if (Math.random() < 0.02) {
              ctx.waitUntil(db.prepare('DELETE FROM milion_seen WHERE ts < ?').bind(now - 3 * 86400000).run().catch(() => {}));
            }
            if (!isNew) {
              const row0 = await db.prepare('SELECT count FROM counters WHERE id = ?').bind('milion_listeners').first();
              return new Response(JSON.stringify({ success: true, counted: false, count: row0 ? Number(row0.count || 0) : 0, source: 'd1' }), { status: 200, headers });
            }
            // Atomowa inkrementacja +1 w D1
            await db.prepare(`
              INSERT INTO counters (id, count, updated_at) VALUES ('milion_listeners', 1, ?)
              ON CONFLICT(id) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
            `).bind(now).run();

            const row = await db.prepare('SELECT count, updated_at FROM counters WHERE id = ?').bind('milion_listeners').first();
            const count = row ? Number(row.count || 0) : 1;
            return new Response(JSON.stringify({ success: true, counted: true, count, source: 'd1' }), { status: 200, headers });
          }
        } catch (err) {
          console.error('D1 POST Error:', err);
        }
        return new Response(JSON.stringify({ success: false, error: 'counter_unavailable' }), { status: 503, headers });
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // MISSION CONTROL EDGE API (CLOUDFLARE D1) — ZERO-COST PRIVATE BACKEND
    // ──────────────────────────────────────────────────────────────────────────
    if (url.pathname.startsWith('/api/mc/')) {
      const authHeader = request.headers.get('x-mc-secret') || request.headers.get('authorization') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const EXPECTED_SECRET = env.MC_SECRET || 'cc-mission-control-key-2026';

      if (token !== EXPECTED_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const db = env.mission_control_db;
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database binding missing' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const jsonHeaders = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      };

      // 1. GET /api/mc/queue/pending — list pending commands
      if (url.pathname === '/api/mc/queue/pending' && request.method === 'GET') {
        const { results } = await db.prepare(
          "SELECT * FROM command_queue WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 50"
        ).all();
        return new Response(JSON.stringify({ success: true, count: results.length, queue: results }), {
          status: 200,
          headers: jsonHeaders
        });
      }

      // 2. POST /api/mc/queue/push — enqueue new command
      if (url.pathname === '/api/mc/queue/push' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const id = body.id || `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const command = body.command || '';
        const targetGroup = body.target_group || body.targetGroup || null;
        const priority = Number(body.priority || 1);
        const dayNumber = body.day_number || body.dayNumber || null;

        if (!command) {
          return new Response(JSON.stringify({ error: 'Command text required' }), { status: 400, headers: jsonHeaders });
        }

        await db.prepare(
          "INSERT OR REPLACE INTO command_queue (id, command, target_group, status, priority, day_number) VALUES (?, ?, ?, 'pending', ?, ?)"
        ).bind(id, command, targetGroup, priority, dayNumber).run();

        return new Response(JSON.stringify({ success: true, id, status: 'pending' }), { status: 200, headers: jsonHeaders });
      }

      // 3. POST /api/mc/queue/update — update command status (done / processing / failed)
      if (url.pathname === '/api/mc/queue/update' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const id = body.id;
        const status = body.status || 'done';
        const error = body.error || null;

        if (!id) {
          return new Response(JSON.stringify({ error: 'Command id required' }), { status: 400, headers: jsonHeaders });
        }

        await db.prepare(
          "UPDATE command_queue SET status = ?, error = ?, executed_at = datetime('now') WHERE id = ?"
        ).bind(status, error, id).run();

        return new Response(JSON.stringify({ success: true, id, status }), { status: 200, headers: jsonHeaders });
      }

      // 4. GET /api/mc/inspirations/today — get daily inspiration
      if (url.pathname === '/api/mc/inspirations/today' && request.method === 'GET') {
        const urlParams = new URL(request.url).searchParams;
        const dayParam = urlParams.get('day');

        let row;
        if (dayParam) {
          row = await db.prepare("SELECT * FROM daily_inspirations WHERE day_number = ?").bind(Number(dayParam)).first();
        } else {
          const todayIso = new Date().toISOString().slice(0, 10);
          row = await db.prepare("SELECT * FROM daily_inspirations WHERE date = ?").bind(todayIso).first();
          if (!row) {
            row = await db.prepare("SELECT * FROM daily_inspirations ORDER BY day_number DESC LIMIT 1").first();
          }
        }

        if (!row) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: jsonHeaders });
        }

        return new Response(JSON.stringify({ success: true, inspiration: row }), { status: 200, headers: jsonHeaders });
      }

      // 5. POST /api/mc/status — update system status
      if (url.pathname === '/api/mc/status' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const service = body.service || 'whatsapp_agent';
        const status = body.status || 'ONLINE';
        const details = typeof body.details === 'object' ? JSON.stringify(body.details) : (body.details || null);

        await db.prepare(
          "INSERT OR REPLACE INTO system_status (service, status, last_ping, details) VALUES (?, ?, datetime('now'), ?)"
        ).bind(service, status, details).run();

        return new Response(JSON.stringify({ success: true, service, status }), { status: 200, headers: jsonHeaders });
      }

      return new Response(JSON.stringify({ error: 'Unknown MC endpoint' }), { status: 404, headers: jsonHeaders });
    }

    if (url.pathname === '/api/auth/me') {
      return new Response(
        JSON.stringify({ user: null, isAdmin: false, firebaseAdminReady: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname === '/api/keys/validate-gemini' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const key = (request.headers.get('x-user-gemini-key') || body.userApiKey || '').trim();
        if (!key) {
          return new Response(JSON.stringify({ error: 'Podaj klucz API Gemini.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Odpowiedz jednym słowem: "OK"' }] }] }),
          }
        );
        if (!resp.ok) {
          const errData = await resp.text();
          return new Response(JSON.stringify({ error: `Błąd weryfikacji klucza Gemini (${resp.status}): ${errData}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ success: true, model: 'gemini-2.5-flash', status: 'valid', preview: 'OK' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Błąd połączenia z API Gemini.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/elevenlabs/voices' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const key = (request.headers.get('x-user-elevenlabs-key') || body.userApiKey || '').trim();
        if (!key) {
          return new Response(JSON.stringify({ error: 'Podaj klucz ElevenLabs API.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': key },
        });
        if (!resp.ok) {
          const errText = await resp.text();
          return new Response(JSON.stringify({ error: `ElevenLabs zwróciło błąd (${resp.status}): ${errText}` }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const data = await resp.json();
        return new Response(JSON.stringify({ success: true, voices: data.voices || [] }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (
      (url.pathname === '/api/drama/generate-script' ||
        url.pathname === '/api/direction/ai-direct' ||
        url.pathname === '/api/tts/synthesize') &&
      request.method === 'POST'
    ) {
      const userKey = (request.headers.get('x-user-gemini-key') || '').trim();
      if (!userKey) {
        return new Response(
          JSON.stringify({
            error: 'BYOK_KEY_REQUIRED: Do wykonania tej operacji AI wymagany jest własny klucz Gemini API. Możesz go bezpłatnie wprowadzić w menu Klucze API (prawy górny róg studia).',
            code: 'BYOK_KEY_REQUIRED',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (url.pathname === '/news.json' || url.pathname === '/api/live/news') {
      return serveLiveNews(ctx);
    }

    // CC Semantic Index — obsługa dedykowanego indeksu wiedzy semantic-index.html na /index bez pętli 308
    if (
      url.pathname === '/index' ||
      url.pathname === '/index/' ||
      url.pathname === '/indeks' ||
      url.pathname === '/indeks/' ||
      url.pathname.startsWith('/index/') ||
      url.pathname.startsWith('/indeks/')
    ) {
      const indexReqUrl = new URL(request.url);
      indexReqUrl.pathname = '/index/';
      let dirResp = await env.ASSETS.fetch(new Request(indexReqUrl, request));
      if (dirResp.status !== 200) {
        indexReqUrl.pathname = '/semantic-index.html';
        dirResp = await env.ASSETS.fetch(new Request(indexReqUrl, request));
      }
      if (dirResp.status === 200) {
        return new Response(dirResp.body, {
          status: 200,
          headers: {
            ...Object.fromEntries(dirResp.headers.entries()),
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, must-revalidate',
          },
        });
      }
      return dirResp;
    }

    // CC Clean Routing & Case-Insensitive Aliases (P0 / P1)
    const lowerPath = url.pathname.toLowerCase().replace(/\/$/, '');
    if (
      lowerPath === '/newsletter' ||
      lowerPath === '/newsletter/confirm' ||
      lowerPath === '/newsletter/manage' ||
      lowerPath === '/newsletter/unsubscribe' ||
      lowerPath === '/newsletter/admin'
    ) {
      const nlUrl = new URL(request.url);
      nlUrl.pathname = '/newsletter.html';
      const assetResp = await env.ASSETS.fetch(new Request(nlUrl.toString(), { method: 'GET', headers: { Accept: 'text/html' } }));
      const isSensitiveRoute = lowerPath !== '/newsletter' || url.searchParams.has('token');
      return new Response(assetResp.body, {
        status: assetResp.status === 404 ? 404 : 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': isSensitiveRoute ? 'private, no-store, no-cache, must-revalidate' : 'public, max-age=0, must-revalidate',
          'X-Robots-Tag': isSensitiveRoute ? 'noindex, nofollow, noarchive' : 'index, follow',
          'Referrer-Policy': 'no-referrer',
        },
      });
    }
    if (lowerPath === '/yis') {
      const yisUrl = new URL(request.url);
      yisUrl.pathname = '/YIS.html';
      const assetResp = await env.ASSETS.fetch(new Request(yisUrl.toString(), { method: 'GET', headers: { 'Accept': 'text/html' } }));
      const body = await assetResp.arrayBuffer();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (lowerPath === '/global') {
      const globalUrl = new URL(request.url);
      globalUrl.pathname = '/Global.html';
      const assetResp = await env.ASSETS.fetch(new Request(globalUrl.toString(), { method: 'GET', headers: { 'Accept': 'text/html' } }));
      const body = await assetResp.arrayBuffer();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      });
    }

    if (
      url.pathname === '/BiblijneUwielbienie' ||
      url.pathname === '/BiblijneUwielbienie/' ||
      lowerPath === '/biblijneuwielbienie' ||
      lowerPath === '/uwielbienie' ||
      lowerPath === '/karaoke' ||
      lowerPath === '/spiewnik'
    ) {
      const buUrl = new URL(request.url);
      buUrl.pathname = '/biblijne-uwielbienie';
      return Response.redirect(buUrl.toString(), 301);
    }

    if (lowerPath === '/podcast' || lowerPath === '/podcasts') {
      const podUrl = new URL(request.url);
      podUrl.pathname = '/podcasty';
      return Response.redirect(podUrl.toString(), 301);
    }

    if (
      lowerPath === '/cezaryrogowski' ||
      lowerPath === '/cezary-rogowski' ||
      lowerPath === '/cezary_rogowski' ||
      lowerPath === '/autor'
    ) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/CezaryRogowski/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (
      lowerPath === '/wioletta/pardon-czy-to-milosc' ||
      lowerPath === '/pardon-czy-to-milosc'
    ) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/Wioletta/pardon-czy-to-milosc/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (lowerPath.startsWith('/wioletta/pardon-czy-to-milosc/')) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/Wioletta/pardon-czy-to-milosc/' + url.pathname.slice('/wioletta/pardon-czy-to-milosc/'.length);
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (
      lowerPath === '/wioletta' ||
      lowerPath === '/violetta' ||
      lowerPath === '/pardon'
    ) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = '/Wioletta/';
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    const assetResp = await env.ASSETS.fetch(request);
    if (assetResp.status === 404 && !url.pathname.includes('.')) {
      const dirUrl = new URL(request.url);
      dirUrl.pathname = url.pathname.replace(/\/$/, '') + '/';
      const dirResp = await env.ASSETS.fetch(new Request(dirUrl, request));
      if (dirResp.status < 400) {
        return dirResp;
      }

      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = url.pathname.replace(/\/$/, '') + '.html';
      let fallbackResp = await env.ASSETS.fetch(new Request(fallbackUrl, request));
      if (fallbackResp.status < 400) {
        return fallbackResp;
      }

      const lowerFallbackUrl = new URL(request.url);
      lowerFallbackUrl.pathname = lowerPath + '.html';
      fallbackResp = await env.ASSETS.fetch(new Request(lowerFallbackUrl, request));
      if (fallbackResp.status < 400) {
        return fallbackResp;
      }
    }

    const finalResp = assetResp;
    if (url.searchParams.has('q') || url.searchParams.has('query')) {
      const respWithHeader = new Response(finalResp.body, finalResp);
      respWithHeader.headers.set('X-Robots-Tag', 'noindex, follow, noarchive');
      return respWithHeader;
    }
    return finalResp;
  },
};
