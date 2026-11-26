// =========================================================================
// AI DLA JEZUSA — PUBLICZNE REST API V1 HANDLER (ETAP 2)
// Standard: Sola Scriptura • ZERO COST • RFC 9457 Problem Details
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

import {
  getCanonicalDocuments,
  searchKnowledgeHub,
  getDocumentById,
  getTopicsCatalog
} from './knowledge-hub.js';
import { openApiSpec } from './openapi.js';
import { handleMcpRequest } from './mcp-server.js';
import { handleAiChatRequest } from './chat-service.js';
import { handleOwnerSessionRequest, handleOwnerActionRequest } from './owner-workspace.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With, X-User-AI-Key, X-User-AI-Provider',
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

  // Obsługa CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // 0. Remote MCP Server (Etap 3): /api/ai-dla-jezusa/v1/mcp
  if (path === '/api/ai-dla-jezusa/v1/mcp' || path.startsWith('/api/ai-dla-jezusa/v1/mcp/')) {
    return handleMcpRequest(request, env);
  }

  // 0b. Rozmowy konwersacyjne + RAG: /api/ai-dla-jezusa/v1/chat
  if (path === '/api/ai-dla-jezusa/v1/chat') {
    return handleAiChatRequest(request, env, deps);
  }

  // 0c. Przestrzeń Właściciela (nazirczarek@gmail.com — Firebase RS256 Auth):
  if (path === '/api/ai-dla-jezusa/v1/owner/session') {
    return handleOwnerSessionRequest(request, env, deps, CORS_HEADERS);
  }
  if (path === '/api/ai-dla-jezusa/v1/owner/action') {
    return handleOwnerActionRequest(request, env, deps, CORS_HEADERS);
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
