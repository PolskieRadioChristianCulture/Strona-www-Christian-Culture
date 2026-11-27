// =========================================================================
// AI DLA JEZUSA — REMOTE MCP SERVER (ETAP 3)
// Model Context Protocol 2024-11-05 • Streamable JSON-RPC 2.0 & SSE
// Sola Scriptura • Read-Only • ZERO COST
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

import {
  searchKnowledgeHub,
  getDocumentById,
  findScriptureWithBridge,
  getTopicsCatalog,
  getSourcePolicy,
  isDocumentPubliclyVisible
} from './knowledge-hub.js';
import { readLimitedText } from './cost-guard.js';

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_NAME = "ai-dla-jezusa-mcp";
const SERVER_VERSION = "1.0.0";
const MAX_MCP_BODY_BYTES = 16 * 1024;
const MAX_MCP_BATCH_SIZE = 10;
const MAX_MCP_RESPONSE_CHARS = 32_000;

function isAllowedMcpOrigin(originHeader = '', env = {}) {
  if (!originHeader) return true;
  let parsed;
  try {
    parsed = new URL(originHeader);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'polskieradio.cc' || host.endsWith('.polskieradio.cc') || host.endsWith('.polskieradio.pages.dev')) {
    return true;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return true;
  }
  const extra = String(env?.AI_MCP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return extra.includes(originHeader.toLowerCase()) || extra.includes(host);
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

const JSON_RPC_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  ...CORS_HEADERS
};

export const MCP_TOOLS = [
  {
    name: "cc_search",
    description: "Przeszukuje zweryfikowane materiały biblijne, artykuły CCN, lekcje Akademii i multimedia w ekosystemie Christian Culture.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Szukana fraza, werset, postać biblijna lub zagadnienie teologiczne (np. 'Apokalipsa', 'J 3:16', 'wiara i uczynki')"
        },
        language: {
          type: "string",
          description: "Kod języka (np. 'pl', 'en', 'de')",
          default: "pl"
        },
        content_type: {
          type: "string",
          description: "Opcjonalny filtr typu: scripture, course, article, audio, video, app"
        },
        limit: {
          type: "integer",
          description: "Maksymalna liczba wyników (1-20)",
          default: 5
        }
      },
      required: ["query"]
    }
  },
  {
    name: "cc_get_source",
    description: "Pobiera zatwierdzone źródło publiczne z bazy wiedzy Christian Culture na podstawie ID (z kontrolą widoczności i daty aktualizacji).",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unikalny identyfikator dokumentu (np. cc:course:akademia-kurscodzienny)"
        },
        max_chars: {
          type: "integer",
          description: "Maksymalna liczba znaków treści do zwrócenia (100-10000)",
          default: 4000
        }
      },
      required: ["id"]
    }
  },
  {
    name: "cc_get_document",
    description: "Pobiera pełny kanoniczny dokument z bazy wiedzy Christian Culture na podstawie jego unikalnego identyfikatora.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unikalny identyfikator dokumentu (np. cc:course:akademia-kurscodzienny)"
        },
        max_chars: {
          type: "integer",
          description: "Maksymalna liczba znaków treści do zwrócenia (do 10000)",
          default: 4000
        }
      },
      required: ["id"]
    }
  },
  {
    name: "cc_find_scripture",
    description: "Wyszukuje literalny, autoryzowany fragment Pisma Świętego w przekładzie Uwspółcześnionej Biblii Gdańskiej (UBG) z poszanowaniem zasad Sola Scriptura.",
    inputSchema: {
      type: "object",
      properties: {
        reference: {
          type: "string",
          description: "Dokładny werset lub zakres (np. 'J 3:16', 'Rz 8:28', 'Mt 5:3-10')"
        },
        translation: {
          type: "string",
          description: "Przekład biblijny (kanonicznie 'UBG')",
          default: "UBG"
        }
      },
      required: ["reference"]
    }
  },
  {
    name: "cc_topics",
    description: "Zwraca pełny katalog kategorii i tematów wiedzy w ekosystemie Christian Culture.",
    inputSchema: {
      type: "object",
      properties: {
        lang: {
          type: "string",
          description: "Kod języka (domyślnie 'pl')",
          default: "pl"
        }
      }
    }
  },
  {
    name: "cc_get_source_policy",
    description: "Zwraca oficjalną doktrynę i zasady redakcyjne Christian Culture (Sola Scriptura, zakaz fabrykowania cytatów, ochrona prawdy Bożej).",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

/**
 * Główny dispatcher protokołu MCP (JSON-RPC 2.0)
 */
export async function handleMcpRequest(request, env = {}, deps = {}) {
  if (String(env?.AI_MCP_ENABLED || '').toLowerCase() === 'false') {
    return new Response(JSON.stringify({
      ok: false,
      error: 'mcp_disabled',
      message: 'Serwer MCP jest chwilowo wyłączony. Klasyczna wyszukiwarka CC pozostaje dostępna pod /api/ai-dla-jezusa/v1/search.'
    }), { status: 503, headers: JSON_RPC_HEADERS });
  }

  const originHeader = request.headers.get('Origin') || '';
  if (originHeader && !isAllowedMcpOrigin(originHeader, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'origin_not_allowed' }), {
      status: 403,
      headers: JSON_RPC_HEADERS
    });
  }

  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  // GET: Inicjalizacja SSE (Server-Sent Events) lub metadata info
  if (request.method === 'GET') {
    const isSse = url.pathname.endsWith('/sse') || request.headers.get('Accept')?.includes('text/event-stream');
    if (isSse) {
      const sessionId = `mcp-session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const endpointUri = `/api/ai-dla-jezusa/v1/mcp?sessionId=${sessionId}`;
      
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUri}\n\n`));
          // Utrzymanie połączenia (Keep-Alive ping)
          controller.enqueue(encoder.encode(`: ping\n\n`));
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...CORS_HEADERS
        }
      });
    }

    // Proste zapytanie informacyjne GET
    return new Response(JSON.stringify({
      server: SERVER_NAME,
      version: SERVER_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      status: "ready",
      tools_count: MCP_TOOLS.length,
      mode: "READ_ONLY_ZERO_COST"
    }, null, 2), {
      status: 200,
      headers: JSON_RPC_HEADERS
    });
  }

  // POST: Przetwarzanie JSON-RPC 2.0 (z limitem rozmiaru 16 KB)
  if (request.method === 'POST') {
    const rawBody = await readLimitedText(request, MAX_MCP_BODY_BYTES);
    if (rawBody === null) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32600, message: `Żądanie przekracza limit ${MAX_MCP_BODY_BYTES} B.` }
      }), { status: 413, headers: JSON_RPC_HEADERS });
    }
    let body;
    try {
      body = JSON.parse(rawBody || '{}');
    } catch {
      return jsonRpcError(null, -32700, "Parse error: Niepoprawny format JSON.");
    }

    // Obsługa zapytań pojedynczych i wsadowych (batch)
    if (Array.isArray(body)) {
      if (body.length > MAX_MCP_BATCH_SIZE) {
        return jsonRpcError(null, -32600, `Przekroczono limit wsadu (${MAX_MCP_BATCH_SIZE} żądań).`);
      }
      const responses = await Promise.all(body.map(item => processSingleJsonRpc(item, env, deps)));
      return new Response(JSON.stringify(responses), { status: 200, headers: JSON_RPC_HEADERS });
    }

    const response = await processSingleJsonRpc(body, env, deps);
    // Powiadomienia (notifications) bez pola id nie zwracają treści
    if (response === null) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify(response, null, 2), { status: 200, headers: JSON_RPC_HEADERS });
  }

  return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
}

async function processSingleJsonRpc(msg, env = {}, deps = {}) {
  if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') {
    return {
      jsonrpc: "2.0",
      id: msg?.id || null,
      error: { code: -32600, message: "Invalid Request: Wymagane pole jsonrpc: '2.0'." }
    };
  }

  const { id, method, params } = msg;

  // 1. initialize
  if (method === 'initialize') {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION
        }
      }
    };
  }

  // 2. notifications/initialized & ping
  if (method === 'notifications/initialized') {
    return null; // Notification, no response
  }
  if (method === 'ping') {
    return { jsonrpc: "2.0", id, result: {} };
  }

  // 3. tools/list
  if (method === 'tools/list') {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS
      }
    };
  }

  // 4. tools/call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments && typeof params.arguments === 'object' ? params.arguments : {};

    try {
      const toolResult = await executeTool(toolName, args, env, deps);
      let textPayload = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2);
      if (textPayload.length > MAX_MCP_RESPONSE_CHARS) {
        textPayload = `${textPayload.slice(0, MAX_MCP_RESPONSE_CHARS)}... [TRUNCATED]`;
      }
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: textPayload
            }
          ]
        }
      };
    } catch (err) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: `Błąd wykonania narzędzia ${toolName}: ${err.message}`
        }
      };
    }
  }

  // Nieznana metoda
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: Metoda '${method}' nie jest obsługiwana.`
    }
  };
}

async function executeTool(name, args, env = {}, deps = {}) {
  switch (name) {
    case 'cc_search': {
      const q = String(args.query || '').slice(0, 256);
      const limit = Math.min(20, Math.max(1, parseInt(args.limit, 10) || 5));
      const lang = String(args.language || 'pl').slice(0, 8);
      const type = String(args.content_type || '').slice(0, 24);
      return searchKnowledgeHub(q, { limit, lang, type });
    }

    case 'cc_get_source':
    case 'cc_get_document': {
      const docId = String(args.id || '').trim().slice(0, 180);
      const doc = getDocumentById(docId);
      if (!doc || !isDocumentPubliclyVisible(doc)) {
        return {
          found: false,
          error: `Dokument lub źródło '${docId}' nie istnieje albo jest niedostępne publicznie.`
        };
      }
      const maxChars = Math.min(10000, Math.max(100, parseInt(args.max_chars, 10) || 4000));
      const trimmedText = doc.text.length > maxChars ? `${doc.text.slice(0, maxChars)}... [TRUNCATED]` : doc.text;
      const snippet = doc.text.length > 240 ? `${doc.text.slice(0, 237)}...` : doc.text;
      return {
        found: true,
        source: {
          id: doc.id,
          title: doc.title,
          canonical_url: doc.canonical_url,
          type: doc.type,
          snippet,
          text: trimmedText,
          updated_at: doc.updated_at,
          scripture_refs: doc.scripture_refs,
          biblia_audio_url: doc.biblia_audio_url
        },
        document: {
          ...doc,
          text: trimmedText
        }
      };
    }

    case 'cc_find_scripture': {
      const ref = String(args.reference || '').trim().slice(0, 120);
      const scripture = await findScriptureWithBridge(ref, args.translation || 'UBG', env, deps);
      if (!scripture) {
        return {
          found: false,
          message: `Nie odnaleziono dosłownego fragmentu dla '${ref}' w autoryzowanym rejestrze UBG. Sprawdź zapis lub skorzystaj z MojaBiblia CC.`
        };
      }
      return {
        found: true,
        scripture
      };
    }

    case 'cc_topics': {
      const lang = args.lang || 'pl';
      return { topics: getTopicsCatalog(lang) };
    }

    case 'cc_get_source_policy': {
      return getSourcePolicy();
    }

    default:
      throw new Error(`Nieznane narzędzie: '${name}'`);
  }
}

function jsonRpcError(id, code, message) {
  return new Response(JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message }
  }), {
    status: 400,
    headers: JSON_RPC_HEADERS
  });
}
