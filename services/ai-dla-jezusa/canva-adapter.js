/**
 * Canva MCP Adapter — P2a (Read-only + Manual Brief) & P3 (Confirmed Draft Mock)
 * - ZERO real OAuth / ZERO external paid calls by default (mode: 'mock')
 * - 2 strictly isolated test accounts ('test-user-1', 'test-user-2')
 * - Manual brief builder ("Otwórz w Canva") + P3 preview/confirmation/idempotency
 */

import {
  CANONICAL_MCP_CONNECTORS,
  assertSafeWriteExecution
} from './mcp-client-registry.js';

export const PILOT_DESIGN_TITLE = 'AI dla Jezusa — Karta Pilota 2026';

export const CANVA_TEST_ACCOUNTS = Object.freeze({
  'test-user-1': Object.freeze({
    id: 'test-user-1',
    label: 'Konto Testowe 1 (Ewangelizacja)',
    handle: '@cc_pilot_1'
  }),
  'test-user-2': Object.freeze({
    id: 'test-user-2',
    label: 'Konto Testowe 2 (Akademia)',
    handle: '@cc_pilot_2'
  })
});

const DEFAULT_DESIGNS_BY_USER = {
  'test-user-1': [
    {
      id: 'canva_mock_u1_pilot',
      title: PILOT_DESIGN_TITLE,
      format: 'Instagram Post 1080×1350',
      updatedAt: '2026-11-27T08:00:00Z',
      ownerUserId: 'test-user-1',
      readOnly: true,
      isDraft: false,
      canvaUrl: 'https://www.canva.com/create/instagram-posts/'
    },
    {
      id: 'canva_mock_u1_dzj',
      title: 'Dobrze, że jesteś — Rozważanie Poranne (Wersja A)',
      format: 'Instagram Story 1080×1920',
      updatedAt: '2026-11-26T18:15:00Z',
      ownerUserId: 'test-user-1',
      readOnly: true,
      isDraft: false,
      canvaUrl: 'https://www.canva.com/create/instagram-stories/'
    }
  ],
  'test-user-2': [
    {
      id: 'canva_mock_u2_pilot',
      title: `${PILOT_DESIGN_TITLE} (Konto 2)`,
      format: 'Prezentacja 16:9 (1920×1080)',
      updatedAt: '2026-11-27T07:30:00Z',
      ownerUserId: 'test-user-2',
      readOnly: true,
      isDraft: false,
      canvaUrl: 'https://www.canva.com/create/presentations/'
    },
    {
      id: 'canva_mock_u2_kurs',
      title: 'Kurs Codzienny — Karta Wersetu',
      format: 'Karta Kwadrat 1080×1080',
      updatedAt: '2026-11-25T14:20:00Z',
      ownerUserId: 'test-user-2',
      readOnly: true,
      isDraft: false,
      canvaUrl: 'https://www.canva.com/create/social-graphics/'
    }
  ]
};

const FORMAT_DEEP_LINKS = Object.freeze({
  'instagram-post': 'https://www.canva.com/create/instagram-posts/',
  'instagram-story': 'https://www.canva.com/create/instagram-stories/',
  'presentation': 'https://www.canva.com/create/presentations/',
  'youtube-thumb': 'https://www.canva.com/create/youtube-thumbnails/',
  'poster': 'https://www.canva.com/create/posters/'
});

// Izolowane magazyny per-user w pamięci workera (w tym klucze idempotencji).
const mockDraftsByUser = new Map();
const idempotencyCache = new Map();

export function resolveCanvaTestUser(rawUserId) {
  const candidate = String(rawUserId || 'test-user-1').trim();
  if (CANVA_TEST_ACCOUNTS[candidate]) {
    return candidate;
  }
  return null;
}

export function resetCanvaMockStateForTest() {
  mockDraftsByUser.clear();
  idempotencyCache.clear();
}

export function getCanvaStatus({ userId = 'test-user-1', env = {} } = {}) {
  const resolvedUser = resolveCanvaTestUser(userId);
  if (!resolvedUser) {
    return { ok: false, status: 400, error: 'invalid_test_account' };
  }
  const connector = CANONICAL_MCP_CONNECTORS.canva;
  const availableCapabilities = env.CANVA_LIVE_CAPABILITIES
    ? String(env.CANVA_LIVE_CAPABILITIES).split(',').map(s => s.trim()).filter(Boolean)
    : [...connector.defaultCapabilities];

  return {
    ok: true,
    status: 200,
    mode: 'mock',
    endpoint: connector.endpoint,
    activeUser: CANVA_TEST_ACCOUNTS[resolvedUser],
    accounts: Object.values(CANVA_TEST_ACCOUNTS),
    pilotTitle: PILOT_DESIGN_TITLE,
    capabilities: availableCapabilities,
    disabledCapabilities: connector.gatedCapabilities.filter(c => !availableCapabilities.includes(c)),
    writePolicy: {
      requiresPreview: true,
      requiresExplicitConfirmation: true,
      requiresIdempotencyKey: true,
      blockedSources: [...connector.blockedPromptSources]
    }
  };
}

export function listCanvaDesigns({ userId = 'test-user-1', query = '' } = {}) {
  const resolvedUser = resolveCanvaTestUser(userId);
  if (!resolvedUser) {
    return { ok: false, status: 400, error: 'invalid_test_account' };
  }

  const baseList = DEFAULT_DESIGNS_BY_USER[resolvedUser] || [];
  const userDrafts = mockDraftsByUser.get(resolvedUser) || [];
  const allForUser = [...userDrafts, ...baseList].map(item => ({ ...item }));

  const q = String(query || '').trim().toLowerCase();
  const filtered = q
    ? allForUser.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.format.toLowerCase().includes(q))
    : allForUser;

  return {
    ok: true,
    status: 200,
    mode: 'mock',
    userId: resolvedUser,
    designs: filtered
  };
}

export function buildCanvaManualBrief(input = {}) {
  const title = String(input.title || '').trim().slice(0, 140) || PILOT_DESIGN_TITLE;
  const formatKey = String(input.formatKey || 'instagram-post').trim().toLowerCase();
  const formatLabel = String(input.format || '').trim().slice(0, 80) || 'Instagram Post 1080×1350';
  const copy = String(input.copy || '').trim().slice(0, 1800);
  const visualHints = String(input.visualHints || '').trim().slice(0, 600)
    || 'Ciemne tło premium, akcent Champagne Gold (#C4A35A) / pomarańczowy przycisk (#FF7A00), czytelna typografia, brak fikcyjnych cytatów.';

  if (!copy) {
    return { ok: false, status: 400, error: 'brief_copy_required' };
  }

  const openInCanvaUrl = FORMAT_DEEP_LINKS[formatKey] || 'https://www.canva.com/create/';
  const formattedBrief = [
    `TYTUŁ PROJEKTU: ${title}`,
    `FORMAT: ${formatLabel}`,
    `TREŚĆ NA GRAFIKĘ:\n${copy}`,
    `WSKAZÓWKI WIZUALNE:\n${visualHints}`
  ].join('\n\n');

  return {
    ok: true,
    status: 200,
    mode: 'manual_brief',
    brief: {
      title,
      format: formatLabel,
      formatKey,
      copy,
      visualHints,
      formattedBrief,
      openInCanvaUrl
    }
  };
}

export function createCanvaDraft(payload = {}, { userId = 'test-user-1', env = {} } = {}) {
  const resolvedUser = resolveCanvaTestUser(userId);
  if (!resolvedUser) {
    return { ok: false, status: 400, error: 'invalid_test_account' };
  }

  const title = String(payload.title || '').trim().slice(0, 140) || PILOT_DESIGN_TITLE;
  const format = String(payload.format || 'Instagram Post 1080×1350').trim().slice(0, 80);
  const copy = String(payload.copy || '').trim().slice(0, 1800);
  const visualHints = String(payload.visualHints || '').trim().slice(0, 600);
  const stage = String(payload.stage || '').trim().toLowerCase();
  const action = String(payload.action || 'draft:create').trim().toLowerCase();
  const source = String(payload.source || 'manual_ui').trim().toLowerCase();

  if (!copy) {
    return { ok: false, status: 400, error: 'draft_copy_required' };
  }

  const availableCapabilities = env.CANVA_LIVE_CAPABILITIES
    ? String(env.CANVA_LIVE_CAPABILITIES).split(',').map(s => s.trim()).filter(Boolean)
    : [...CANONICAL_MCP_CONNECTORS.canva.defaultCapabilities];

  // Blokuj złośliwe lub zablokowane wywołania nawet w fazie podglądu.
  if (CANONICAL_MCP_CONNECTORS.canva.blockedPromptSources.includes(source)) {
    return {
      ok: false,
      status: 403,
      error: 'untrusted_source_blocked',
      message: 'Zautomatyzowany zapis na podstawie wyników wyszukiwania lub treści dokumentu jest zablokowany.'
    };
  }
  if (CANONICAL_MCP_CONNECTORS.canva.gatedCapabilities.includes(action) &&
      !availableCapabilities.includes(action)) {
    return {
      ok: false,
      status: 403,
      error: 'capability_disabled',
      message: `Funkcja "${action}" nie jest aktywna w tym połączeniu.`
    };
  }

  // Etap 1 (Podgląd bez zapisu): nie zapisuje nic w stanie konta.
  if (stage === 'preview' || (payload.previewApproved !== true && payload.userConfirmed !== true)) {
    return {
      ok: true,
      status: 200,
      stage: 'preview',
      requiresConfirmation: true,
      mode: 'mock',
      preview: {
        title,
        format,
        copy,
        visualHints,
        targetUserId: resolvedUser,
        targetAccountLabel: CANVA_TEST_ACCOUNTS[resolvedUser].label
      }
    };
  }

  const idempotencyKey = String(payload.idempotencyKey || '').trim().slice(0, 120);
  const safety = assertSafeWriteExecution({
    connectorId: 'canva',
    source,
    action,
    previewApproved: payload.previewApproved === true,
    userConfirmed: payload.userConfirmed === true,
    idempotencyKey,
    availableCapabilities
  });
  if (!safety.ok) {
    return safety;
  }

  const cacheKey = `${resolvedUser}::${idempotencyKey}`;
  if (idempotencyCache.has(cacheKey)) {
    return {
      ok: true,
      status: 200,
      stage: 'created',
      deduplicated: true,
      mode: 'mock',
      draft: idempotencyCache.get(cacheKey)
    };
  }

  const draftId = `canva_draft_${resolvedUser}_${Date.now().toString(36)}`;
  const createdDraft = {
    id: draftId,
    title,
    format,
    copy,
    visualHints,
    updatedAt: new Date().toISOString(),
    ownerUserId: resolvedUser,
    readOnly: false,
    isDraft: true,
    mode: 'mock',
    canvaUrl: `https://www.canva.com/design/${draftId}/edit`
  };

  const existing = mockDraftsByUser.get(resolvedUser) || [];
  mockDraftsByUser.set(resolvedUser, [createdDraft, ...existing.slice(0, 19)]);
  idempotencyCache.set(cacheKey, createdDraft);

  return {
    ok: true,
    status: 201,
    stage: 'created',
    deduplicated: false,
    mode: 'mock',
    draft: createdDraft
  };
}
