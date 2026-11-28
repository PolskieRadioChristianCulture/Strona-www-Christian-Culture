// =========================================================================
// AI DLA JEZUSA — PUBLICZNE REST API V1 HANDLER (ETAP 2)
// Standard: Sola Scriptura • ZERO COST • RFC 9457 Problem Details
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

import {
  getAllPlugins,
  getLegacyAppPlugins,
  getScholarPlugins,
  getScholarStats,
  CC_BIBLE_SCHOLAR_CATEGORIES,
  resolveScholarPackagePlan,
  EXTERNAL_AI_PROVIDERS
} from './plugin-registry.js';
import {
  getCanonicalDocuments,
  searchKnowledgeHub,
  getDocumentById,
  getTopicsCatalog
} from './knowledge-hub.js';
import { openApiSpec } from './openapi.js';
import { MCP_TOOLS, handleMcpRequest } from './mcp-server.js';
import {
  loadScholarAsset,
  ccBibleLexiconLookup,
  ccBibleTokenAnalysis,
  ccBibleCrossReferences,
  ccBibleConcordance,
  ccBibleCompareEditions,
  ccBibleStudyQuestions,
  ccBibleStudyTemplate,
  ccBibleMindMapSeed
} from './scholar-tools.js';
import { handleAiChatRequest, handleAiTranscribeRequest } from './chat-service.js';
import { handleOwnerSessionRequest, handleOwnerActionRequest } from './owner-workspace.js';
import { handleAiFeedbackPost, handleOwnerFeedbackGet } from './feedback-service.js';
import { readLimitedText } from './cost-guard.js';
import { getMcpClientRegistry } from './mcp-client-registry.js';
import {
  getCanvaStatus,
  listCanvaDesigns,
  buildCanvaManualBrief,
  createCanvaDraft
} from './canva-adapter.js';
import {
  handleCanvaOAuthStart,
  handleCanvaOAuthCallback,
  handleCanvaOAuthDisconnect
} from './canva-oauth.js';
import {
  createTtsSession,
  getTtsSessionStatus,
  deleteTtsSession,
  synthesizeTtsWithSession
} from './tts-byok-service.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With, X-User-AI-Key, X-User-AI-Provider, X-TTS-Session-Token, X-Canva-Test-User, X-CC-Active-Plugins',
  'Access-Control-Max-Age': '86400'
};

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=300, s-maxage=3600',
  'X-Content-Type-Options': 'nosniff',
  ...CORS_HEADERS
};

export async function handleAiDlaJezusaApi(request, env = {}, deps = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  const privateApi = [
    '/chat',
    '/transcribe',
    '/feedback',
    '/owner/session',
    '/owner/action',
    '/owner/feedback',
    '/mcp-clients',
    '/canva/status',
    '/canva/designs',
    '/canva/brief',
    '/canva/draft',
    '/canva/oauth/disconnect',
    '/tts/session',
    '/tts/synthesize'
  ].some(suffix => path === '/api/ai-dla-jezusa/v1' + suffix);
  if (privateApi && request.headers.has('Origin') &&
      request.headers.get('Origin') !== url.origin) {
    return Response.json({ ok: false, error: 'origin_not_allowed' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const apiHeaders = privateApi ? { ...CORS_HEADERS, 'Access-Control-Allow-Origin': url.origin } : CORS_HEADERS;

  // Obsługa CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: apiHeaders });
  }

  async function readSafeJson(maxBytes = 16384) {
    const raw = await readLimitedText(request, maxBytes);
    if (raw === null) {
      return { ok: false, status: 413, error: 'payload_too_large' };
    }
    if (!raw.trim()) {
      return { ok: true, data: {} };
    }
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch {
      return { ok: false, status: 400, error: 'invalid_json' };
    }
  }

  function privateJson(result) {
    const status = result?.status || 200;
    return Response.json(result, {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...apiHeaders
      }
    });
  }

  // 0. Remote MCP Server (Etap 3): /api/ai-dla-jezusa/v1/mcp
  if (path === '/api/ai-dla-jezusa/v1/mcp' || path.startsWith('/api/ai-dla-jezusa/v1/mcp/')) {
    return handleMcpRequest(request, env, deps);
  }

  // 0a. MCP Client Connectors Registry + Canva Pilot + TTS BYOK (P2/P3)
  if (path === '/api/ai-dla-jezusa/v1/mcp-clients' && request.method === 'GET') {
    return privateJson({ ok: true, status: 200, connectors: getMcpClientRegistry() });
  }

  // 0a2. CC Connect 2.0 + CC Bible Scholar Plugin Registry
  if (path === '/api/ai-dla-jezusa/v1/plugins' && request.method === 'GET') {
    return Response.json({
      ok: true,
      status: 200,
      plugins: getAllPlugins(),
      legacyPlugins: getLegacyAppPlugins(),
      scholarPlugins: getScholarPlugins(),
      categories: CC_BIBLE_SCHOLAR_CATEGORIES,
      scholarStats: getScholarStats(),
      mcpTools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
      packages: {
        'cc-bible-scholar': resolveScholarPackagePlan()
      },
      externalProviders: EXTERNAL_AI_PROVIDERS,
      mcpEndpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp'
    }, { status: 200, headers: JSON_HEADERS });
  }

  if (path === '/api/ai-dla-jezusa/v1/plugins/package-plan' && request.method === 'POST') {
    const parsed = await readSafeJson(16384);
    if (!parsed.ok) return privateJson(parsed);
    return jsonResponse(resolveScholarPackagePlan(parsed.data?.requestedIds));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/licenses' && request.method === 'GET') {
    const reg = await loadScholarAsset('data/bible-scholar/licenses-registry.json', env, deps).catch(() => null);
    return jsonResponse(reg || { ok: false, error: 'licenses_registry_unavailable' }, reg ? 200 : 500);
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/lexicon' && request.method === 'GET') {
    const strongId = url.searchParams.get('strong') || url.searchParams.get('strongId') || '';
    const query = url.searchParams.get('q') || url.searchParams.get('query') || '';
    const limit = url.searchParams.get('limit') || '10';
    return jsonResponse(await ccBibleLexiconLookup({ strongId, query, limit }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/tokens' && request.method === 'GET') {
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    const book = url.searchParams.get('book') || '';
    const chapter = url.searchParams.get('ch') || url.searchParams.get('chapter') || '0';
    const verse = url.searchParams.get('v') || url.searchParams.get('verse') || '0';
    return jsonResponse(await ccBibleTokenAnalysis({ reference, book, chapter, verse }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/xrefs' && request.method === 'GET') {
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    const book = url.searchParams.get('book') || '';
    const chapter = url.searchParams.get('ch') || url.searchParams.get('chapter') || '0';
    const verse = url.searchParams.get('v') || url.searchParams.get('verse') || '0';
    const limit = url.searchParams.get('limit') || '15';
    const cursor = url.searchParams.get('cursor') || '';
    return jsonResponse(await ccBibleCrossReferences({ reference, book, chapter, verse, limit, cursor }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/concordance' && request.method === 'GET') {
    const query = url.searchParams.get('q') || url.searchParams.get('query') || '';
    const book = url.searchParams.get('book') || '';
    const testament = url.searchParams.get('testament') || '';
    const limit = url.searchParams.get('limit') || '15';
    const cursor = url.searchParams.get('cursor') || '';
    return jsonResponse(await ccBibleConcordance({ query, book, testament, limit, cursor }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/compare' && request.method === 'GET') {
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    const rawEd = url.searchParams.get('editions') || 'UBG,ORIGINAL';
    const editions = rawEd.split(',').map((s) => s.trim()).filter(Boolean);
    return jsonResponse(await ccBibleCompareEditions({ reference, editions }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/study-questions' && request.method === 'GET') {
    const method = url.searchParams.get('method') || 'six-questions';
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    return jsonResponse(await ccBibleStudyQuestions({ method, reference }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/study-template' && request.method === 'GET') {
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    return jsonResponse(await ccBibleStudyTemplate({ reference }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/scholar/mind-map-seed' && request.method === 'GET') {
    const reference = url.searchParams.get('ref') || url.searchParams.get('reference') || '';
    return jsonResponse(await ccBibleMindMapSeed({ reference }, env, deps));
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/oauth/start' && request.method === 'GET') {
    return handleCanvaOAuthStart(request, env, deps);
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/oauth/callback' && request.method === 'GET') {
    return handleCanvaOAuthCallback(request, env, deps);
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/oauth/disconnect' && request.method === 'POST') {
    return handleCanvaOAuthDisconnect(request, env, deps);
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/status' && request.method === 'GET') {
    const userId = request.headers.get('X-Canva-Test-User') || url.searchParams.get('user') || 'test-user-1';
    const origin = url.origin;
    return privateJson(await getCanvaStatus({ userId, env, request, origin, deps }));
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/designs' && request.method === 'GET') {
    const userId = request.headers.get('X-Canva-Test-User') || url.searchParams.get('user') || 'test-user-1';
    const query = url.searchParams.get('q') || '';
    const forceMock = url.searchParams.get('mode') === 'mock';
    return privateJson(await listCanvaDesigns({ userId, query, env, request, forceMock, deps }));
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/brief' && request.method === 'POST') {
    const parsed = await readSafeJson(16384);
    if (!parsed.ok) return privateJson(parsed);
    return privateJson(buildCanvaManualBrief(parsed.data));
  }

  if (path === '/api/ai-dla-jezusa/v1/canva/draft' && request.method === 'POST') {
    const parsed = await readSafeJson(16384);
    if (!parsed.ok) return privateJson(parsed);
    const userId = request.headers.get('X-Canva-Test-User') || parsed.data?.userId || 'test-user-1';
    return privateJson(await createCanvaDraft(parsed.data, { userId, env, request, deps }));
  }

  if (path === '/api/ai-dla-jezusa/v1/tts/session') {
    const token = request.headers.get('X-TTS-Session-Token') || url.searchParams.get('token') || '';
    if (request.method === 'GET') {
      return privateJson(getTtsSessionStatus(token, deps));
    }
    if (request.method === 'POST') {
      const parsed = await readSafeJson(8192);
      if (!parsed.ok) return privateJson(parsed);
      return privateJson(createTtsSession(parsed.data, deps));
    }
    if (request.method === 'DELETE') {
      return privateJson(deleteTtsSession(token, deps));
    }
  }

  if (path === '/api/ai-dla-jezusa/v1/tts/synthesize' && request.method === 'POST') {
    const parsed = await readSafeJson(16384);
    if (!parsed.ok) return privateJson(parsed);
    const sessionToken = request.headers.get('X-TTS-Session-Token') || parsed.data?.sessionToken || '';
    return privateJson(await synthesizeTtsWithSession({
      ...parsed.data,
      sessionToken,
      env,
      deps
    }));
  }

  // 0. Remote MCP Server (Etap 3): /api/ai-dla-jezusa/v1/mcp
  if (path === '/api/ai-dla-jezusa/v1/mcp' || path.startsWith('/api/ai-dla-jezusa/v1/mcp/')) {
    return handleMcpRequest(request, env, deps);
  }

  // 0b. Rozmowy konwersacyjne + RAG + Transkrypcja mowy:
  if (path === '/api/ai-dla-jezusa/v1/chat') {
    return handleAiChatRequest(request, env, deps);
  }
  if (path === '/api/ai-dla-jezusa/v1/transcribe') {
    return handleAiTranscribeRequest(request, env, deps);
  }

  // 0c. Przestrzeń Właściciela (nazirczarek@gmail.com — Firebase RS256 Auth):
  if (path === '/api/ai-dla-jezusa/v1/owner/session') {
    return handleOwnerSessionRequest(request, env, deps, apiHeaders);
  }
  if (path === '/api/ai-dla-jezusa/v1/owner/action') {
    return handleOwnerActionRequest(request, env, deps, apiHeaders);
  }
  if (path === '/api/ai-dla-jezusa/v1/feedback') {
    return handleAiFeedbackPost(request, env, deps, apiHeaders);
  }
  if (path === '/api/ai-dla-jezusa/v1/owner/feedback') {
    return handleOwnerFeedbackGet(request, env, deps, apiHeaders);
  }

  // Tylko metoda GET w publicznym API odczytowym
  if (request.method !== 'GET') {
    return problemResponse(405, 'Metoda niedozwolona', 'Publiczne REST API v1 obsługuje wyłącznie zapytania GET.');
  }

  // 1. GET /api/ai-dla-jezusa/v1/health
  if (path === '/api/ai-dla-jezusa/v1/health') {
    const docs = getCanonicalDocuments();
    return jsonResponse({
      status: 'healthy',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      index_documents: docs.length,
      free_tier_status: 'ZERO_COST_COMPLIANT',
      governance: 'Sola Scriptura • Christian Culture'
    });
  }

  // 2. GET /api/ai-dla-jezusa/v1/openapi.json
  if (path === '/api/ai-dla-jezusa/v1/openapi.json') {
    return jsonResponse(openApiSpec, 200, {
      'Cache-Control': 'public, max-age=86400'
    });
  }

  // 3. GET /api/ai-dla-jezusa/v1/search
  if (path === '/api/ai-dla-jezusa/v1/search') {
    const q = (url.searchParams.get('q') || url.searchParams.get('query') || '').slice(0, 256);
    const lang = url.searchParams.get('lang') || 'pl';
    const type = url.searchParams.get('type') || '';
    const limit = url.searchParams.get('limit') || '10';
    const cursor = url.searchParams.get('cursor') || '';

    const results = searchKnowledgeHub(q, { lang, type, limit, cursor });
    return jsonResponse(results);
  }

  // 4. GET /api/ai-dla-jezusa/v1/documents/:id
  const docPrefix = '/api/ai-dla-jezusa/v1/documents/';
  if (path.startsWith(docPrefix)) {
    const docId = decodeURIComponent(path.slice(docPrefix.length)).trim();
    if (!docId) {
      return problemResponse(400, 'Brak identyfikatora', 'Nie podano identyfikatora dokumentu w ścieżce URL.');
    }
    const document = getDocumentById(docId);
    if (!document) {
      return problemResponse(404, 'Dokument nie znaleziony', `Dokument o identyfikatorze '${docId}' nie istnieje lub został wycofany.`);
    }
    return jsonResponse({ document });
  }

  // 5. GET /api/ai-dla-jezusa/v1/topics
  if (path === '/api/ai-dla-jezusa/v1/topics') {
    const lang = url.searchParams.get('lang') || 'pl';
    const topics = getTopicsCatalog(lang);
    return jsonResponse({ topics });
  }

  // Nieznany endpoint pod /api/ai-dla-jezusa/v1/
  return problemResponse(404, 'Nie znaleziono endpointu', `Ścieżka '${path}' nie istnieje w publicznym API AI DLA JEZUSA v1.`);
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function problemResponse(status, title, detail) {
  return new Response(
    JSON.stringify({
      type: `https://polskieradio.cc/problems/${status}`,
      title,
      status,
      detail,
      instance: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json; charset=utf-8',
        ...CORS_HEADERS
      }
    }
  );
}
