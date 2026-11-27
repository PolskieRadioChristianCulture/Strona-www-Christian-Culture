/**
 * Client-side MCP Connector Registry & Safety Policy (P2a / P3)
 * - Fixed canonical endpoints (no SSRF / arbitrary URL overrides)
 * - Strict separation between read-only discovery and confirmed P3 writes
 * - Prompt-injection guard blocking auto-writes from search/document outputs
 */

export const CANONICAL_MCP_CONNECTORS = Object.freeze({
  canva: Object.freeze({
    id: 'canva',
    label: 'Canva MCP (Pilot)',
    endpoint: 'https://mcp.canva.com/mcp',
    defaultMode: 'mock',
    authModel: 'per_user_session',
    readOnlyTools: Object.freeze([
      'canva_list_designs',
      'canva_get_design',
      'canva_get_folders'
    ]),
    writeTools: Object.freeze([
      'canva_create_draft_design'
    ]),
    defaultCapabilities: Object.freeze([
      'designs:read',
      'brief:build',
      'draft:create'
    ]),
    gatedCapabilities: Object.freeze([
      'brand_kit',
      'autofill',
      'resize'
    ]),
    blockedPromptSources: Object.freeze([
      'search_result',
      'document_content'
    ])
  })
});

export function getMcpClientRegistry(options = {}) {
  const mode = options.mode === 'live' ? 'live' : 'mock';
  return Object.values(CANONICAL_MCP_CONNECTORS).map(connector => ({
    ...connector,
    activeMode: connector.id === 'canva' ? mode : connector.defaultMode
  }));
}

export function isConnectorToolAllowed(connectorId, toolName, availableCapabilities = []) {
  const connector = CANONICAL_MCP_CONNECTORS[connectorId];
  if (!connector || !toolName) {
    return { allowed: false, reason: 'unknown_connector_or_tool' };
  }
  if (connector.gatedCapabilities.includes(toolName) && !availableCapabilities.includes(toolName)) {
    return { allowed: false, reason: 'capability_disabled' };
  }
  if (connector.readOnlyTools.includes(toolName) || connector.writeTools.includes(toolName)) {
    return { allowed: true, reason: 'ok' };
  }
  return { allowed: false, reason: 'tool_not_allowlisted' };
}

export function assertSafeWriteExecution({
  connectorId = 'canva',
  source = 'manual_ui',
  action = 'draft:create',
  previewApproved = false,
  userConfirmed = false,
  idempotencyKey = '',
  availableCapabilities = []
} = {}) {
  const connector = CANONICAL_MCP_CONNECTORS[connectorId];
  if (!connector) {
    return { ok: false, status: 404, error: 'unknown_connector' };
  }

  const normalizedSource = String(source || 'manual_ui').trim().toLowerCase();
  if (connector.blockedPromptSources.includes(normalizedSource)) {
    return {
      ok: false,
      status: 403,
      error: 'untrusted_source_blocked',
      message: 'Zautomatyzowany zapis na podstawie wyników wyszukiwania lub treści dokumentu jest zablokowany.'
    };
  }

  const normalizedAction = String(action || 'draft:create').trim().toLowerCase();
  if (connector.gatedCapabilities.includes(normalizedAction) &&
      !availableCapabilities.includes(normalizedAction)) {
    return {
      ok: false,
      status: 403,
      error: 'capability_disabled',
      message: `Funkcja "${normalizedAction}" wymaga wyraźnego udostępnienia w aktywnym połączeniu.`
    };
  }

  if (previewApproved !== true || userConfirmed !== true) {
    return {
      ok: false,
      status: 409,
      error: 'confirmation_required',
      message: 'Wymagany jest podgląd i wyraźne potwierdzenie użytkownika przed utworzeniem szkicu.'
    };
  }

  if (!String(idempotencyKey || '').trim()) {
    return {
      ok: false,
      status: 400,
      error: 'idempotency_key_required',
      message: 'Brak klucza idempotencji dla operacji zapisu.'
    };
  }

  return { ok: true };
}
