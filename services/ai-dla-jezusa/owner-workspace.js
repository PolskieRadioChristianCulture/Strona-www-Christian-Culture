import { readLimitedText } from './cost-guard.js';
// =========================================================================
// AI DLA JEZUSA — PRZESTRZEŃ WŁAŚCICIELA (nazirczarek@gmail.com)
// Weryfikacja: Firebase Auth RS256 ID Token • Serwerowa pula bezpłatnych kluczy
// ZERO sekretów po stronie przeglądarki • ZERO "Mission Control" w publicznym UI
// =========================================================================

import { getCanonicalDocuments } from './knowledge-hub.js';

export const OWNER_EMAILS = new Set([
  'nazirczarek@gmail.com',
  'nazirczarkes@gmail.com'
]);

export const OWNER_MODELS = [
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', note: 'Domyślny szybki (pula CC)' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', note: 'Wysoka stabilność (pula CC)' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', note: 'Rozbudowane analizy' },
  { id: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite Latest', note: 'Najnowszy lekki' }
];

export const PUBLIC_FREE_MODELS = [
  { id: 'auto', provider: 'auto', label: 'Auto (najlepszy dostępny)', shortLabel: 'Auto', note: 'Automatyczny dobór darmowego AI' },
  { id: 'gemini-3.5-flash-lite', provider: 'gemini', label: 'Gemini 3.5 Flash Lite', shortLabel: 'Gemini 3.5 Lite', note: 'Szybki darmowy · domyślny CC' },
  { id: 'gemini-3.1-flash-lite', provider: 'gemini', label: 'Gemini 3.1 Flash Lite', shortLabel: 'Gemini 3.1 Lite', note: 'Stabilny darmowy · wysoka jakość' },
  { id: 'gemini-3-flash-preview', provider: 'gemini', label: 'Gemini 3 Flash', shortLabel: 'Gemini 3 Flash', note: 'Głębsza analiza · darmowa pula CC' },
  { id: 'gemini-flash-lite-latest', provider: 'gemini', label: 'Gemini Flash Lite Latest', shortLabel: 'Gemini Latest', note: 'Najnowszy lekki · darmowa pula CC' },
  { id: 'cc-knowledge-hub', provider: 'cc-knowledge-hub', label: 'Baza Wiedzy CC (offline)', shortLabel: 'Baza Wiedzy CC', note: 'Natychmiastowy · 0 zł · cytaty UBG' }
];

export const ANTIGRAVITY_SKILLS = [
  {
    id: 'akademia',
    tag: '@Akademia',
    title: 'Akademia & Kurs Codzienny',
    desc: 'Publikacja i struktura lekcji Kursu Codziennego „Z Biblią za Pan Brat”, Clean URLs i zapowiedzi.',
    mode: 'Studium Biblijne',
    runtime: 'cloud',
    prompt: 'Jako agent @Akademia przygotuj konspekt i strukturę nowej lekcji Kursu Codziennego w oparciu o Pismo Święte (UBG).'
  },
  {
    id: 'mojabiblia',
    tag: '@MojaBiblia',
    title: 'MojaBiblia Interlinearna (UBG)',
    desc: 'Kody Stronga, porównanie przekładów (UBG/BW/BT/BG) i ścisła kontrola wierności tekstu.',
    mode: 'Studium Biblijne',
    runtime: 'cloud',
    prompt: 'Jako @MojaBiblia wykonaj studium kluczowych słów (Stronga + kontekst UBG) dla podanego fragmentu:'
  },
  {
    id: 'news',
    tag: '@news',
    title: 'CCN News & 20 Portali Tematycznych',
    desc: 'Redakcja artykułów (Nauka, Historia, Biologia, Prawo, Małżeństwo, Apologetyka) bez fikcyjnych autorów.',
    mode: 'Twórczość CC',
    runtime: 'cloud',
    prompt: 'Jako redaktor @news przygotuj merytoryczny szkic artykułu CCN News z biblijną perspektywą (UBG) i źródłami.'
  },
  {
    id: 'vod',
    tag: '@vod',
    title: 'Kino Chrześcijańskie VOD',
    desc: 'Repertuar filmów fabularnych, opisy ewangelizacyjne i dobór poleceń dla rodzin.',
    mode: 'Twórczość CC',
    runtime: 'cloud',
    prompt: 'Jako kurator @vod przygotuj opis promocyjny oraz pytania do dyskusji po seansie wybranego filmu z naszego VOD.'
  },
  {
    id: 'live',
    tag: '@live',
    title: 'Scena Transmisyjna LIVE / OBS',
    desc: 'Wsparcie ramówki radiowo-telewizyjnej, paski RDS i ochrona produkcyjnych kanałów nadawczych.',
    mode: 'CC Auto',
    runtime: 'cloud+pc',
    prompt: 'Jako realizator @live zaplanuj zapowiedzi antenowe i opisy transmisji LIVE dla naszych kanałów Christian Culture.'
  },
  {
    id: 'player',
    tag: '@Player',
    title: 'Odtwarzacz Audio Spotify-Style',
    desc: 'Playlisty, opisy audycji, odcinki Biblii Audio CC i metadane streamingu 24/7.',
    mode: 'CC Auto',
    runtime: 'cloud',
    prompt: 'Jako @Player zaproponuj tematyczną playlistę audycji i odcinków Biblii Audio na dzisiejszy wieczór.'
  },
  {
    id: 'lumina',
    tag: '@Lumina',
    title: 'Portal Społecznościowy LUMINA',
    desc: 'Posty wspierające, świadectwa, budowanie relacji oraz zasady bezpieczeństwa i etykiety społeczności.',
    mode: 'Twórczość CC',
    runtime: 'cloud',
    prompt: 'Jako @Lumina napisz ciepły, autentyczny post otwierający wartościową rozmowę na tablicy społeczności.'
  },
  {
    id: 'smcc',
    tag: '@SMCC',
    title: 'Strażnik Kodu i Jakości Zero-QA',
    desc: 'Kontrola 13 reguł kodu, ergonomii dotyku 44px, brak regresji i pełna weryfikacja wdrożeń.',
    mode: 'Deep Research',
    runtime: 'cloud+pc',
    prompt: 'Jako @SMCC przygotuj listę kontrolną Zero-QA (44px, UTF-8, brak regresji, wydajność) dla nowego modułu WWW.'
  },
  {
    id: 'skaner',
    tag: '@Skaner',
    title: 'Skaner Wizualny 360°',
    desc: 'Wykrywanie kolizji UI, responsywności smartfon/tablet/desktop i kontrastu elementów.',
    mode: 'Deep Research',
    runtime: 'cloud+pc',
    prompt: 'Jako @Skaner wskaż najważniejsze punkty kontroli responsywności (390px, 768px, 1440px) dla naszej strony.'
  },
  {
    id: 'progres',
    tag: '@ProgresMCC',
    title: 'Progres Misyjny & Introspekcja',
    desc: 'Eliminacja długu technologicznego, przegląd ryzyk i planowanie rozwoju misji.',
    mode: 'Deep Research',
    runtime: 'cloud',
    prompt: 'Jako @ProgresMCC oceń postępy techniczne i zasugeruj 3 konkretne kroki usprawnienia ekosystemu w tym tygodniu.'
  },
  {
    id: 'ccs',
    tag: '@CCS',
    title: 'CC Studio DAW · Słuchowiska',
    desc: 'Reżyseria słuchowisk Biblia Audio, podział na głosy lektorskie i przygotowanie skryptów TTS.',
    mode: 'Twórczość CC',
    runtime: 'cloud+pc',
    prompt: 'Jako reżyser @CCS podziel poniższy rozdział Pisma Świętego (UBG) na role głosowe i wskazówki intonacyjne:'
  },
  {
    id: 'dvr',
    tag: '@DVR',
    title: 'DaVinci Resolve 4K Automation',
    desc: 'Scenariusze montażu, znaczniki cięć, tytuły odcinków i eksport 4K dla Studia Dobrego Słowa.',
    mode: 'Twórczość CC',
    runtime: 'cloud+pc',
    prompt: 'Jako @DVR przygotuj strukturę znaczników (intro, rozdział, werset na ekranie, outro) dla montażu wideo 4K.'
  },
  {
    id: 'mcc',
    tag: '@MCC',
    title: 'Matrix CC · Automatyzacja Kanałów',
    desc: 'Planowanie dystrybucji treści wirtualnych profili i harmonogramu kanałów wideo.',
    mode: 'CC Auto',
    runtime: 'cloud+pc',
    prompt: 'Jako @MCC zaplanuj bezpieczny harmonogram publikacji wideo i opisów z unikalnymi tytułami na nasze kanały.'
  },
  {
    id: 'rut',
    tag: '@Rut',
    title: 'Asystentka Rut & Planer Dnia',
    desc: 'Koordynacja priorytetów dnia, notatek głosowych i codziennego rytmu pracy misyjnej.',
    mode: 'CC Auto',
    runtime: 'cloud',
    prompt: 'Jako @Rut uporządkuj mój dzisiejszy dzień w 3 priorytetach: modlitwa i Słowo, kluczowe zadanie, odpoczynek.'
  },
  {
    id: '777',
    tag: '@777',
    title: 'Orkiestracja 777 & Wspólna Pamięć JOMA',
    desc: 'Koordynacja ról agentowych, przekazywanie kontekstu (handoff) i strategia misji do 2030.',
    mode: 'Deep Research',
    runtime: 'cloud+pc',
    prompt: 'Jako koordynator @777 przygotuj podsumowanie z podziałem zadań dla agentów Redakcji, Technologii i Multimediów.'
  },
  {
    id: 'human-voice',
    tag: 'cc-human-voice',
    title: 'Posty WhatsApp, X i Facebook',
    desc: 'Serdeczne, nieszablonowe wpisy społecznościowe bez spamu, oparte o zweryfikowane fakty.',
    mode: 'Twórczość CC',
    runtime: 'cloud',
    prompt: 'Jako cc-human-voice napisz 3 warianty serdecznych, autentycznych postów (na WhatsApp, X i Facebook) z dzisiejszym przesłaniem.'
  },
  {
    id: 'shorts-director',
    tag: 'cc-shorts-director',
    title: 'Reżyser Shorts / Reels 9:16',
    desc: 'Mocny hak WOW w pierwszych 3 sekundach, dynamiczne napisy PL i wyraźne zakończenie.',
    mode: 'Twórczość CC',
    runtime: 'cloud',
    prompt: 'Jako cc-shorts-director napisz scenariusz dynamicznego filmu pionowego 9:16 (max 45 s) z hakiem na pierwsze 3 sekundy.'
  },
  {
    id: 'full-premium-www',
    tag: 'cc-full-premium-www',
    title: 'Standard Full Premium WWW',
    desc: 'Lista kontrolna jakości, typografii, animacji oraz dostępności dla każdej strony Christian Culture.',
    mode: 'Deep Research',
    runtime: 'cloud',
    prompt: 'Jako audytor cc-full-premium-www wskaż najważniejsze wymagania wizualne i techniczne przed wdrożeniem nowej podstrony.'
  }
];

export const OWNER_AUTOMATIONS = [
  {
    id: 'health_audit',
    title: 'Audyt puli kluczy AI i zasobów chmury',
    desc: 'Na żywo sprawdza liczbę serwerowych kluczy Google AI, klucz YouTube API, 707 dokumentów RAG oraz testuje połączenie z Gemini 3.5.',
    kind: 'server_action'
  },
  {
    id: 'today_reflection_pack',
    title: 'Paczka postów na WhatsApp, X i Facebook z dzisiejszego słowa',
    desc: 'Pobiera aktualne dzisiejsze rozważanie i generuje gotowe teksty bez wychodzenia z aplikacji.',
    kind: 'reflection_to_chat'
  },
  {
    id: 'youtube_search_preset',
    title: 'Przeszukaj na żywo wideo YouTube Christian Culture',
    desc: 'Korzysta z serwerowego klucza YT_API_KEY, znajduje materiały wideo i osadza odtwarzacz w czacie.',
    kind: 'youtube_preset',
    query: 'Christian Culture Biblia Audio'
  },
  {
    id: 'shorts_from_today',
    title: 'Scenariusz rolki Shorts 9:16 z wersetem dnia',
    desc: 'Tworzy gotowy 45-sekundowy scenariusz z hakiem w pierwszych 3 sekundach i cytatem UBG.',
    kind: 'chat_prompt',
    mode: 'Twórczość CC',
    prompt: 'Przygotuj dynamiczny scenariusz rolki Shorts 9:16 (do 45 sekund) na bazie dzisiejszego wersetu dnia (UBG), z mocnym otwarciem, przesłaniem i pytaniem do widzów.'
  },
  {
    id: 'smcc_checklist',
    title: 'Kontrola jakości @SMCC dla nowych wdrożeń',
    desc: 'Uruchamia szczegółową listę kontrolną Zero-QA, 44px i ochrony istniejących kanałów.',
    kind: 'chat_prompt',
    mode: 'Deep Research',
    prompt: 'Przedstaw pełną listę kontrolną @SMCC Zero-QA przed publikacją nowej podstrony Christian Culture.'
  },
  {
    id: 'weekly_mission_plan',
    title: 'Plan priorytetów misji na tydzień (@Rut + @777)',
    desc: 'Układa harmonogram publikacji, nagrań Biblii Audio, Shorts oraz artykułów CCN News.',
    kind: 'chat_prompt',
    mode: 'CC Auto',
    prompt: 'Jako @Rut wspierana przez @777 ułóż przejrzysty plan priorytetów Christian Culture od poniedziałku do soboty (Biblia Audio, Kurs Codzienny, VOD, CCN News).'
  }
];

export function parseGeminiKeyPool(env = {}) {
  const keys = [];
  const seen = new Set();
  const pushKeys = (raw) => {
    if (!raw || typeof raw !== 'string') return;
    for (const part of raw.split(/[\s,;]+/)) {
      const cleaned = part.trim().replace(/^["']|["']$/g, '');
      if (cleaned && cleaned.length >= 4 && !seen.has(cleaned)) {
        seen.add(cleaned);
        keys.push(cleaned);
      }
    }
  };
  pushKeys(env.GEMINI_API_KEYS);
  pushKeys(env.GEMINI_API_KEY);
  return keys;
}

export async function verifyOwnerFromRequest(request, deps = {}) {
  if (!request || typeof deps.verifyToken !== 'function') return null;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  try {
    const payload = await deps.verifyToken(token);
    if (!payload || !payload.email) return null;
    const email = String(payload.email).trim().toLowerCase();
    if (payload.email_verified !== true || !OWNER_EMAILS.has(email)) {
      return null;
    }
    return {
      isOwner: true,
      email,
      uid: String(payload.sub || payload.user_id || '')
    };
  } catch {
    return null;
  }
}

export function buildOwnerIntegrations(env = {}) {
  const poolSize = parseGeminiKeyPool(env).length;
  return [
    {
      id: 'int-gemini-pool',
      name: 'Pula Darmowych Kluczy Google AI',
      detail: poolSize
        ? `Aktywna w chmurze · ${poolSize} serwerowe klucze rotujące automatycznie (Gemini 3.5 / 3.1)`
        : 'Brak skonfigurowanej puli GEMINI_API_KEYS w sekretach Cloudflare',
      status: poolSize ? 'active' : 'missing',
      scope: 'cloud'
    },
    {
      id: 'int-youtube-api',
      name: 'YouTube Data API v3 + 14 kanałów CC',
      detail: env.YT_API_KEY
        ? 'Aktywny w chmurze · wyszukiwanie i osadzanie filmów CC prosto w czacie'
        : 'Tryb katalogu lokalnego (brak YT_API_KEY)',
      status: env.YT_API_KEY ? 'active' : 'missing',
      scope: 'cloud'
    },
    {
      id: 'int-cloudflare',
      name: 'Cloudflare Pages, Workers i 4 bazy D1',
      detail: 'Aktywny · serwer brzegowy, indeks 707 dokumentów i szybkie API Zero-Cost',
      status: 'active',
      scope: 'cloud'
    },
    {
      id: 'int-firebase-lumina',
      name: 'Firebase Auth & Portal LUMINA',
      detail: 'Aktywny · weryfikacja JWT RS256 dla konta właściciela i izolacja wątków',
      status: 'active',
      scope: 'cloud'
    },
    {
      id: 'int-github',
      name: 'GitHub (Strona WWW & LUMINA)',
      detail: 'Aktywny · podwójna synchronizacja repozytoriów Christian Culture',
      status: 'active',
      scope: 'cloud'
    },
    {
      id: 'int-mcp',
      name: 'Zdalny Serwer MCP Christian Culture',
      detail: 'Aktywny · JSON-RPC 2.0 (/api/ai-dla-jezusa/v1/mcp)',
      status: 'active',
      scope: 'cloud'
    },
    {
      id: 'int-cc-apis',
      name: 'Newsletter, Kalendarz Misji i topTEN',
      detail: 'Aktywne w Workerze · zintegrowane punkty danych ekosystemu',
      status: 'active',
      scope: 'cloud'
    },
    {
      id: 'int-gworkspace',
      name: 'Google Workspace (Drive & Gmail · Calendar/Docs/Sheets)',
      detail: 'Mostek Antigravity PC · Drive i Gmail połączone w środowisku lokalnym; narzędzia chmurowe w przeglądarce wymagają zgody OAuth',
      status: 'bridge',
      scope: 'desktop-bridge'
    },
    {
      id: 'int-creative',
      name: 'Canva & WordPress',
      detail: 'Mostek Antigravity PC · autoryzacja wtyczek po stronie pulpitu',
      status: 'bridge',
      scope: 'desktop-bridge'
    },
    {
      id: 'int-studio-pc',
      name: 'DaVinci Resolve 4K, CC Studio DAW, Matrix CC & JOMA',
      detail: 'Mostek Antigravity PC · skrypty montażowe, audio DAW i automatyzacja lokalna wymagają Twojego komputera',
      status: 'bridge',
      scope: 'desktop-bridge'
    }
  ];
}

const OWNER_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Vary': 'Authorization'
};

async function requireVerifiedOwner(request, env, deps, corsHeaders) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      error: Response.json(
        { ok: false, error: 'unauthorized', detail: 'Zaloguj się kontem Google, aby odblokować panel właściciela.' },
        { status: 401, headers: { ...OWNER_HEADERS, ...corsHeaders } }
      )
    };
  }
  const token = authHeader.slice(7).trim();
  const payload = typeof deps.verifyToken === 'function' ? await deps.verifyToken(token).catch(() => null) : null;
  if (!payload || !payload.email) {
    return {
      error: Response.json(
        { ok: false, error: 'invalid_token', detail: 'Sesja wygasła lub token jest nieprawidłowy. Zaloguj się ponownie.' },
        { status: 401, headers: { ...OWNER_HEADERS, ...corsHeaders } }
      )
    };
  }
  const email = String(payload.email).trim().toLowerCase();
  if (payload.email_verified !== true || !OWNER_EMAILS.has(email)) {
    return {
      error: Response.json(
        { ok: false, error: 'forbidden', detail: 'Ten panel jest zarezerwowany wyłącznie dla konta właściciela.' },
        { status: 403, headers: { ...OWNER_HEADERS, ...corsHeaders } }
      )
    };
  }
  return { owner: { isOwner: true, email, uid: String(payload.sub || payload.user_id || '') } };
}

export async function handleOwnerSessionRequest(request, env = {}, deps = {}, corsHeaders = {}) {
  if (request.method !== 'GET') {
    return Response.json(
      { ok: false, error: 'method_not_allowed' },
      { status: 405, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  const check = await requireVerifiedOwner(request, env, deps, corsHeaders);
  if (check.error) return check.error;

  const pool = parseGeminiKeyPool(env);
  return Response.json(
    {
      ok: true,
      isOwner: true,
      email: check.owner.email,
      apiPool: {
        geminiKeys: pool.length,
        youtubeApi: Boolean(env.YT_API_KEY),
        groq: Boolean(env.GROQ_API_KEY),
        openrouter: Boolean(env.OPENROUTER_API_KEY),
        workersAi: Boolean(env.AI && typeof env.AI.run === 'function')
      },
      models: OWNER_MODELS,
      skills: ANTIGRAVITY_SKILLS,
      integrations: buildOwnerIntegrations(env),
      automations: OWNER_AUTOMATIONS
    },
    { status: 200, headers: { ...OWNER_HEADERS, ...corsHeaders } }
  );
}

export async function handleOwnerActionRequest(request, env = {}, deps = {}, corsHeaders = {}) {
  if (request.method !== 'POST') {
    return Response.json(
      { ok: false, error: 'method_not_allowed' },
      { status: 405, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  const check = await requireVerifiedOwner(request, env, deps, corsHeaders);
  if (check.error) return check.error;

  let body = {};
  try {
    const text = await readLimitedText(request, 4096);
    if (text === null) return Response.json({ ok: false, error: 'payload_too_large' }, { status: 413, headers: { ...OWNER_HEADERS, ...corsHeaders } });
    body = JSON.parse(text);
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_json' },
      { status: 400, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  const action = String(body.action || '').trim();
  const fetchImpl = deps.fetch || fetch;
  const pool = parseGeminiKeyPool(env);

  if (action === 'health_audit') {
    return Response.json(
      {
        ok: true,
        action: 'health_audit',
        summary: {
          ownerEmail: check.owner.email,
          geminiPoolCount: pool.length,
          geminiPingStatus: null,
          youtubeApiConfigured: Boolean(env.YT_API_KEY),
          indexDocuments: getCanonicalDocuments().length,
          checkedAt: new Date().toISOString()
        }
      },
      { status: 200, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  if (action === 'youtube_search') {
    const query = String(body.query || 'Christian Culture').trim().slice(0, 120);
    if (!env.YT_API_KEY) {
      return Response.json(
        { ok: false, error: 'missing_yt_key', detail: 'Brak klucza YT_API_KEY po stronie serwera.' },
        { status: 400, headers: { ...OWNER_HEADERS, ...corsHeaders } }
      );
    }
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}`;
    const ytRes = await fetchImpl(ytUrl, { headers: { 'x-goog-api-key': env.YT_API_KEY }, redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!ytRes.ok) {
      return Response.json(
        { ok: false, error: 'youtube_api_error', detail: `YouTube API HTTP ${ytRes.status}` },
        { status: 502, headers: { ...OWNER_HEADERS, ...corsHeaders } }
      );
    }
    const ytData = await ytRes.json();
    const media = (ytData.items || [])
      .filter((it) => it?.id?.videoId && it?.snippet)
      .map((it) => ({
        id: `ytlive-${it.id.videoId}`,
        kind: 'video',
        youtubeId: it.id.videoId,
        title: it.snippet.title,
        subtitle: `${it.snippet.channelTitle || 'YouTube'} · Wyszukane na żywo`,
        thumbnail: it.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${it.id.videoId}/hqdefault.jpg`,
        url: `https://youtu.be/${it.id.videoId}`,
        badge: 'YOUTUBE API LIVE'
      }));
    return Response.json(
      { ok: true, action: 'youtube_search', query, media },
      { status: 200, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  if (action === 'today_reflection_pack') {
    let today = null;
    if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      try {
        const res = await env.ASSETS.fetch(new Request('https://polskieradio.cc/rozwazania_baza.json'));
        if (res && res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length) {
            const dStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
            today = list.find((r) => r?.date === dStr) || list[0];
          }
        }
      } catch {}
    }
    const title = today ? String(today.title || '').replace(/^☀️\s*/, '').trim() : 'Dzisiejsze słowo Christian Culture';
    const reading = today?.reading || 'Pismo Święte (UBG)';
    const verse = today?.memoryVerse || today?.teaser || '';
    const prompt = `Na podstawie dzisiejszego rozważania Christian Culture: „${title}” (${reading}) ${verse ? `— ${verse}` : ''}, przygotuj w duchu cc-human-voice 3 gotowe, ciepłe i autentyczne posty: 1) na WhatsApp, 2) na platformę X, 3) na Facebooka. Cytaty tylko z UBG.`;
    return Response.json(
      { ok: true, action: 'today_reflection_pack', title, reading, verse, prompt },
      { status: 200, headers: { ...OWNER_HEADERS, ...corsHeaders } }
    );
  }

  return Response.json(
    { ok: false, error: 'unknown_action', detail: 'Nieobsługiwana akcja właściciela.' },
    { status: 400, headers: { ...OWNER_HEADERS, ...corsHeaders } }
  );
}
