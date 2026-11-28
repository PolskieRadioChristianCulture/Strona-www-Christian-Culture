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
import {
  ccBibleGetVerse,
  ccBibleGetChapter,
  ccBibleGetContext,
  ccSbaDeepStudy,
  ccFindSermon,
  ccFindAudioBible,
  ccHymnalGetSong,
  ccHymnalSearch,
  ccHymnalByCategory,
  ccChurchSearch,
  ccChurchGetProfile,
  ccChurchGetService,
  ccChurchGetLiveState,
  ccChurchGetAnnouncements,
  ccChurchGetPublicAnnouncements,
  ccChurchGetEvents,
  ccChurchGetHymnMetadata,
  ccSabbathSchoolGetCurrent,
  ccSabbathSchoolGetSources
} from './cc-domain-tools.js';
import {
  ccBibleLexiconLookup,
  ccBibleTokenAnalysis,
  ccBibleCrossReferences,
  ccBibleConcordance,
  ccBibleCompareEditions,
  ccBibleStudyQuestions,
  ccBibleStudyTemplate,
  ccBibleMindMapSeed,
  ccBibleMorphologyParse,
  ccBibleEntityLookup,
  ccBibleGospelSynopsis
} from './scholar-tools.js';
import { isToolAllowedForSession } from './plugin-registry.js';

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
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With, X-CC-Active-Plugins',
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
  },
  {
    name: "cc_bible_get_verse",
    description: "Pobiera dosłowny werset z autoryzowanego przekładu Uwspółcześnionej Biblii Gdańskiej (UBG-2025) wraz z linkiem do Scrolluj Biblię i Głębokiego Studium.",
    inputSchema: {
      type: "object",
      properties: {
        book: { type: "string", description: "Nazwa lub kod księgi (np. 'PSA', 'Psalm', 'JHN', 'Jan')" },
        chapter: { type: "integer", description: "Numer rozdziału (np. 119)" },
        verse: { type: "integer", description: "Numer wersetu (np. 18)" },
        translation: { type: "string", description: "Przekład (domyślnie 'UBG')", default: "UBG" }
      },
      required: ["book", "chapter", "verse"]
    }
  },
  {
    name: "cc_bible_get_chapter",
    description: "Pobiera pełny rozdział Pisma Świętego UBG z nagłówkami i wersetami.",
    inputSchema: {
      type: "object",
      properties: {
        book: { type: "string", description: "Nazwa lub kod księgi (np. 'PSA', 'GEN')" },
        chapter: { type: "integer", description: "Numer rozdziału (np. 23)" },
        translation: { type: "string", description: "Przekład (domyślnie 'UBG')", default: "UBG" }
      },
      required: ["book", "chapter"]
    }
  },
  {
    name: "cc_bible_get_context",
    description: "Zwraca kontekst bliski (jednostka literacka/perykopa) oraz szeroki (rozdział, gatunek, intencja Autora) dla wersetu Pisma Świętego.",
    inputSchema: {
      type: "object",
      properties: {
        book: { type: "string", description: "Kod lub nazwa księgi (np. 'PSA')" },
        chapter: { type: "integer", description: "Numer rozdziału (np. 119)" },
        verse: { type: "integer", description: "Numer wersetu (np. 18)" },
        scope: { type: "string", description: "Zakres kontekstu (domyślnie 'literary_unit')", default: "literary_unit" }
      },
      required: ["book", "chapter", "verse"]
    }
  },
  {
    name: "cc_sba_deep_study",
    description: "Generuje ustrukturyzowany konspekt 8 etapów Głębokiego Studium Scrolluj Biblię (Brama modlitwy, Wielka Szóstka, analiza, kontekst, zastosowanie, tworzenie, świadectwo) wraz z linkiem do aplikacji.",
    inputSchema: {
      type: "object",
      properties: {
        book: { type: "string", description: "Kod lub nazwa księgi (np. 'PSA')" },
        chapter: { type: "integer", description: "Numer rozdziału (np. 119)" },
        verse: { type: "integer", description: "Numer wersetu (np. 18)" },
        translation: { type: "string", description: "Przekład (domyślnie 'UBG')", default: "UBG" }
      },
      required: ["book", "chapter", "verse"]
    }
  },
  {
    name: "cc_find_sermon",
    description: "Wyszukuje kazania, konspekty homiletyczne i wykłady biblijne w portalu Kazania z Pasją wg słów kluczowych lub kategorii.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Szukana fraza, postać lub werset (np. 'Dobry Pasterz', 'Psalm 23')" },
        category: { type: "string", description: "Opcjonalna kategoria (np. 'Wiara i modlitwa', 'Ewangelia i zbawienie')" },
        limit: { type: "integer", description: "Liczba wyników (1-20)", default: 5 }
      }
    }
  },
  {
    name: "cc_find_audio_bible",
    description: "Wyszukuje profesjonalne słuchowiska biblijne MP3 w portalu Biblia Audio CC.",
    inputSchema: {
      type: "object",
      properties: {
        book: { type: "string", description: "Nazwa księgi (np. 'genesis', 'rodzaju')" },
        chapter: { type: "integer", description: "Numer rozdziału (np. 1)" }
      }
    }
  },
  {
    name: "cc_bible_lexicon_lookup",
    description: "Wyszukuje wpisy słownika Stronga (G/H) oraz rozszerzone leksykony STEP w MojaBiblia z polską definicją, transliteracją i oznaczeniem autoGenerated.",
    inputSchema: {
      type: "object",
      properties: {
        strongId: { type: "string", description: "Kod Stronga, np. 'G3056' lub 'H7225'" },
        query: { type: "string", description: "Opcjonalna fraza lub lemma (np. 'logos', 'początek')" },
        limit: { type: "integer", default: 10 }
      }
    }
  },
  {
    name: "cc_bible_token_analysis",
    description: "Zwraca rozbiór słowo-po-słowie (oryginał grecki/hebrajski/aramejski z obsługą RTL, morfologia, kody Stronga, glosa PL) dla podanego wersetu.",
    inputSchema: {
      type: "object",
      properties: {
        reference: { type: "string", description: "Odniesienie biblijne (np. 'J 1:1', 'DAN 2:4', 'Rdz 1:1')" },
        book: { type: "string" },
        chapter: { type: "integer" },
        verse: { type: "integer" }
      }
    }
  },
  {
    name: "cc_bible_cross_references",
    description: "Pobiera stronicowane odsyłacze biblijne OpenBible (CC BY 4.0) posortowane malejąco wg liczby głosów.",
    inputSchema: {
      type: "object",
      properties: {
        reference: { type: "string", description: "Odniesienie z wersetem (np. 'J 3:16', 'Rz 8:28')" },
        book: { type: "string" },
        chapter: { type: "integer" },
        verse: { type: "integer" },
        limit: { type: "integer", default: 15 },
        cursor: { type: "string", default: "0" }
      }
    }
  },
  {
    name: "cc_bible_concordance",
    description: "Stronicowana konkordancja polska Uwspółcześnionej Biblii Gdańskiej (UBG, 31 212 wersetów) z dokładną liczbą wystąpień.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Szukane słowo lub fraza w UBG (min. 2 znaki)" },
        book: { type: "string", description: "Opcjonalny kod księgi (np. 'PSA', 'JHN')" },
        testament: { type: "string", enum: ["ot", "nt"], description: "Opcjonalny filtr Testamentu" },
        limit: { type: "integer", default: 15 },
        cursor: { type: "string", default: "0" }
      },
      required: ["query"]
    }
  },
  {
    name: "cc_bible_search",
    description: "Alias konkordancji UBG do wyszukiwania wersetów w całym Piśmie Świętym.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        book: { type: "string" },
        testament: { type: "string" },
        limit: { type: "integer", default: 15 },
        cursor: { type: "string", default: "0" }
      },
      required: ["query"]
    }
  },
  {
    name: "cc_bible_compare_editions",
    description: "Porównuje zweryfikowane wydanie UBG z tekstem oryginalnym (Greka/Hebrajski/Aramejski); niezweryfikowane przekłady blokowane są przez bramkę licencyjną.",
    inputSchema: {
      type: "object",
      properties: {
        reference: { type: "string", description: "Odniesienie (np. 'Ps 23:1')" },
        editions: { type: "array", items: { type: "string" }, default: ["UBG", "ORIGINAL"] }
      },
      required: ["reference"]
    }
  },
  {
    name: "cc_bible_study_questions",
    description: "Deterministyczny zestaw pytań studium biblijnego (six-questions, twelve-questions, hermeneutics, life-application) działający także offline.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["six-questions", "twelve-questions", "hermeneutics", "life-application"], default: "six-questions" },
        reference: { type: "string" }
      }
    }
  },
  {
    name: "cc_bible_study_template",
    description: "Generuje 8-etapowy szablon Głębokiego Studium zgodny z /sba/studium/ oraz link startowy.",
    inputSchema: {
      type: "object",
      properties: {
        reference: { type: "string", description: "Odniesienie biblijne (np. 'J 15:1-8')" },
        mode: { type: "string", default: "full" }
      }
    }
  },
  {
    name: "cc_bible_mind_map_seed",
    description: "Tworzy strukturę węzłów i powiązań (w tym odsyłacze CC BY OpenBible) jako punkt startowy mapy myśli w /sba/studium/.",
    inputSchema: {
      type: "object",
      properties: {
        reference: { type: "string", description: "Odniesienie centralne (np. 'Rz 8:28')" }
      },
      required: ["reference"]
    }
  },
  {
    name: "cc_hymnal_get_song",
    description: "Pobiera pieśń ze śpiewnika biblijnego „Śpiewajmy Panu” (1–700) wraz z tonacją, kategorią, zwrotkami (zgodnie z licencją) i linkiem do nagrania MP3.",
    inputSchema: {
      type: "object",
      properties: {
        number: { type: "integer", description: "Numer pieśni (1–700)" },
        query: { type: "string", description: "Tytuł lub fragment tekstu, jeśli brak numeru" }
      }
    }
  },
  {
    name: "cc_hymnal_search",
    description: "Przeszukuje śpiewnik biblijny „Śpiewajmy Panu” (700 pieśni) po tytule, kategorii, numerze lub nagraniach audio MP3.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        withAudioOnly: { type: "boolean", default: false },
        limit: { type: "integer", default: 12 }
      }
    }
  },
  {
    name: "cc_hymnal_by_category",
    description: "Zwraca 41 kategorii śpiewnika „Śpiewajmy Panu” lub listę pieśni z wybranej kategorii (np. Dzień sobotni 92–127).",
    inputSchema: {
      type: "object",
      properties: {
        categoryId: { type: "integer" },
        query: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_search",
    description: "Wyszukuje publiczne wizytówki zborów w module Mój kościół (działa bez modelu AI).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        city: { type: "string" },
        denomination: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_profile",
    description: "Zwraca publiczną wizytówkę zboru, status weryfikacji, zweryfikowane cele darów, ogłoszenia i wydarzenia.",
    inputSchema: {
      type: "object",
      properties: {
        churchId: { type: "string" },
        slug: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_service",
    description: "Zwraca opublikowany program nabożeństwa z punktami agendy, tekstami biblijnymi, pieśniami i rewizją LIVE.",
    inputSchema: {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        churchId: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_live_state",
    description: "Zwraca bieżący stan LIVE nabożeństwa: co trwa teraz, co będzie następne, rewizję i znacznik czasu.",
    inputSchema: {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        churchId: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_announcements",
    description: "Zwraca aktualne, niewygasłe publiczne ogłoszenia zboru.",
    inputSchema: {
      type: "object",
      properties: {
        churchId: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_public_announcements",
    description: "Alias publicznych, moderowanych i niewygasłych ogłoszeń zboru (rozszerzenie v2.0).",
    inputSchema: {
      type: "object",
      properties: {
        churchId: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_events",
    description: "Zwraca publiczny kalendarz wydarzeń zboru (bez publicznych list uczestników RSVP).",
    inputSchema: {
      type: "object",
      properties: {
        churchId: { type: "string" }
      }
    }
  },
  {
    name: "cc_church_get_hymn_metadata",
    description: "Zwraca licencjonowane metadane pieśni ze śpiewnika (pełny tekst wyłącznie dla utworów w domenie publicznej; dla pozostałych metadane i legalny link muzycy.adwent.pl).",
    inputSchema: {
      type: "object",
      properties: {
        number: { type: "integer" },
        query: { type: "string" },
        hymnalId: { type: "string", default: "spiewajmy-panu-kads" }
      }
    }
  },
  {
    name: "cc_sabbath_school_get_current",
    description: "Zwraca aktualną lekcję Szkoły Sobotniej (PL/EN, Etap A: metadane + oficjalne linki) z uwzględnieniem strefy czasowej. Działa bez wybranego zboru i bez modelu AI.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", enum: ["pl", "en"], default: "pl" },
        date: { type: "string", description: "Opcjonalna data ISO (YYYY-MM-DD)" },
        timeZone: { type: "string", default: "Europe/Warsaw" },
        mode: { type: "string", enum: ["discussion", "preparation"], default: "discussion" },
        lessonId: { type: "string" }
      }
    }
  },
  {
    name: "cc_sabbath_school_get_sources",
    description: "Zwraca oficjalne źródła, zakres praw (Etap A) i status dostępności adaptera Szkoły Sobotniej PL/EN.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", enum: ["pl", "en"], default: "pl" }
      }
    }
  },
  {
    name: "cc_bible_morphology_parse",
    description: "Dekoduje kody morfologiczne greki (SBLGNT/Robinson) i hebrajskiego/aramejskiego (OSHB/WLC) na polskie pojęcia gramatyczne (część mowy, przypadek, biniam, czas, tryb).",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Kod morfologiczny (np. 'V-IAI-3S', 'N-DSF', 'HVqp3ms')" },
        lang: { type: "string", description: "Opcjonalna wskazówka językowa: 'grc', 'heb', 'arc' lub 'auto'" }
      },
      required: ["code"]
    }
  },
  {
    name: "cc_bible_entity_lookup",
    description: "Przeszukuje bazę Theographic Bible Data pod kątem postaci i miejsc biblijnych z koordynatami GPS, rolami i powiązaniami rodzinnymi.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Szukana nazwa miejsca lub imię postaci biblijnej (np. 'Jerozolima', 'Dawid')" },
        type: { type: "string", enum: ["all", "places", "people"], description: "Typ encji: 'places', 'people' lub 'all'" },
        limit: { type: "number", description: "Maksymalna liczba wyników (domyślnie 10, max 50)" }
      },
      required: ["query"]
    }
  },
  {
    name: "cc_bible_gospel_synopsis",
    description: "Wyszukuje perykopy i paralelizmy w synopsie czterech Ewangelii (Mateusz, Marek, Łukasz, Jan).",
    inputSchema: {
      type: "object",
      properties: {
        pericopeId: { type: "string", description: "Identyfikator perykopy (np. 'synopsis-baptism-jesus')" },
        passage: { type: "string", description: "Fragment biblijny do dopasowania (np. 'Mt 3:13' lub 'J 6:1')" },
        query: { type: "string", description: "Fraza tekstowa do wyszukania w tytułach i opisach synopsy" }
      }
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

    const rawActiveHeader = request.headers.get('X-CC-Active-Plugins');
    const headerActivePlugins = rawActiveHeader !== null
      ? rawActiveHeader.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : null;
    const mcpDeps = { ...deps, activePluginIds: headerActivePlugins };

    // Obsługa zapytań pojedynczych i wsadowych (batch)
    if (Array.isArray(body)) {
      if (body.length > MAX_MCP_BATCH_SIZE) {
        return jsonRpcError(null, -32600, `Przekroczono limit wsadu (${MAX_MCP_BATCH_SIZE} żądań).`);
      }
      const responses = await Promise.all(body.map(item => processSingleJsonRpc(item, env, mcpDeps)));
      return new Response(JSON.stringify(responses), { status: 200, headers: JSON_RPC_HEADERS });
    }

    const response = await processSingleJsonRpc(body, env, mcpDeps);
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
  const reqActivePlugins = Array.isArray(params?.activePlugins)
    ? params.activePlugins.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean)
    : (deps.activePluginIds ?? null);

  if (method === 'tools/list') {
    const visibleTools = reqActivePlugins === null
      ? MCP_TOOLS.filter((t) => isToolAllowedForSession(t.name, null).allowed)
      : MCP_TOOLS.filter((t) => isToolAllowedForSession(t.name, reqActivePlugins).allowed);
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: visibleTools
      }
    };
  }

  // 4. tools/call
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments && typeof params.arguments === 'object' ? params.arguments : {};
    const gate = isToolAllowedForSession(toolName, reqActivePlugins, { datasetId: args?.datasetId });
    if (!gate.allowed) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32602,
          message: `Permission/License gate denied (${gate.code}): ${gate.reason}`
        }
      };
    }

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

    case 'cc_bible_get_verse': {
      return ccBibleGetVerse(args, env, deps);
    }

    case 'cc_bible_get_chapter': {
      return ccBibleGetChapter(args, env, deps);
    }

    case 'cc_bible_get_context': {
      return ccBibleGetContext(args, env, deps);
    }

    case 'cc_sba_deep_study': {
      return ccSbaDeepStudy(args, env, deps);
    }

    case 'cc_find_sermon': {
      return ccFindSermon(args, env, deps);
    }

    case 'cc_find_audio_bible': {
      return ccFindAudioBible(args, env, deps);
    }

    case 'cc_bible_lexicon_lookup': {
      return ccBibleLexiconLookup(args, env, deps);
    }

    case 'cc_bible_token_analysis': {
      return ccBibleTokenAnalysis(args, env, deps);
    }

    case 'cc_bible_cross_references': {
      return ccBibleCrossReferences(args, env, deps);
    }

    case 'cc_bible_concordance':
    case 'cc_bible_search': {
      return ccBibleConcordance(args, env, deps);
    }

    case 'cc_bible_compare_editions': {
      return ccBibleCompareEditions(args, env, deps);
    }

    case 'cc_bible_study_questions': {
      return ccBibleStudyQuestions(args, env, deps);
    }

    case 'cc_bible_study_template': {
      return ccBibleStudyTemplate(args, env, deps);
    }

    case 'cc_bible_mind_map_seed': {
      return ccBibleMindMapSeed(args, env, deps);
    }

    case 'cc_hymnal_get_song': {
      return ccHymnalGetSong(args, env, deps);
    }

    case 'cc_hymnal_search': {
      return ccHymnalSearch(args, env, deps);
    }

    case 'cc_hymnal_by_category': {
      return ccHymnalByCategory(args, env, deps);
    }

    case 'cc_church_search': {
      return ccChurchSearch(args, env, deps);
    }

    case 'cc_church_get_profile': {
      return ccChurchGetProfile(args, env, deps);
    }

    case 'cc_church_get_service': {
      return ccChurchGetService(args, env, deps);
    }

    case 'cc_church_get_live_state': {
      return ccChurchGetLiveState(args, env, deps);
    }

    case 'cc_church_get_announcements': {
      return ccChurchGetAnnouncements(args, env, deps);
    }

    case 'cc_church_get_public_announcements': {
      return ccChurchGetPublicAnnouncements(args, env, deps);
    }

    case 'cc_church_get_events': {
      return ccChurchGetEvents(args, env, deps);
    }

    case 'cc_church_get_hymn_metadata': {
      return ccChurchGetHymnMetadata(args, env, deps);
    }

    case 'cc_sabbath_school_get_current': {
      return ccSabbathSchoolGetCurrent(args, env, deps);
    }

    case 'cc_sabbath_school_get_sources': {
      return ccSabbathSchoolGetSources(args, env, deps);
    }

    case 'cc_bible_morphology_parse': {
      return ccBibleMorphologyParse(args, env, deps);
    }

    case 'cc_bible_entity_lookup': {
      return ccBibleEntityLookup(args, env, deps);
    }

    case 'cc_bible_gospel_synopsis': {
      return ccBibleGospelSynopsis(args, env, deps);
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
