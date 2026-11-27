/**
 * Canva Connect API — OAuth 2.0 + PKCE (S256) & Encrypted D1 Sessions
 * - Fixed canonical endpoints (no caller-supplied URLs)
 * - AES-256-GCM token encryption using SHA-256(CANVA_SESSION_SECRET)
 * - Graceful setup/mock fallback until CANVA_CLIENT_ID & CANVA_CLIENT_SECRET are configured
 * - Strict single-use OAuth state and allowlisted return_to redirects
 */

export const CANVA_AUTHORIZE_URL = 'https://www.canva.com/api/oauth/authorize';
export const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
export const CANVA_REVOKE_URL = 'https://api.canva.com/rest/v1/oauth/revoke';
export const CANVA_PROFILE_URL = 'https://api.canva.com/rest/v1/users/me/profile';
export const CANVA_DESIGNS_URL = 'https://api.canva.com/rest/v1/designs';

export const CANVA_SESSION_COOKIE = 'cc_canva_sid';
export const CANVA_REQUIRED_SCOPES = Object.freeze([
  'design:meta:read',
  'design:content:read',
  'design:content:write',
  'profile:read'
]);

const ALLOWED_RETURN_PATHS = new Set([
  '/ai/aplikacja',
  '/ai',
  '/ai/',
  '/test/ai',
  '/test/ai/'
]);

const FORMAT_DIMENSIONS = Object.freeze({
  'instagram-post': { width: 1080, height: 1350, label: 'Instagram Post 1080×1350' },
  'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story 1080×1920' },
  'presentation': { width: 1920, height: 1080, label: 'Prezentacja 16:9 (1920×1080)' },
  'youtube-thumb': { width: 1280, height: 720, label: 'Miniatura YouTube 1280×720' },
  'poster': { width: 1587, height: 2245, label: 'Plakat A4 (1587×2245)' }
});

const STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const REFRESH_MARGIN_MS = 60 * 1000;

const memoryStates = new Map();
const memorySessions = new Map();

export function resetCanvaOAuthMemoryForTest() {
  memoryStates.clear();
  memorySessions.clear();
}

export function inspectCanvaOAuthMemoryForTest() {
  return {
    states: Array.from(memoryStates.entries()),
    sessions: Array.from(memorySessions.entries())
  };
}

function nowMs(deps) {
  return typeof deps?.now === 'function' ? deps.now() : Date.now();
}

function toBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str) {
  const padded = String(str || '').replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice((String(str || '').length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function randomBase64Url(numBytes = 32) {
  const buf = new Uint8Array(numBytes);
  crypto.getRandomValues(buf);
  return toBase64Url(buf);
}

async function computeS256Challenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return toBase64Url(new Uint8Array(hash));
}

async function deriveAesKey(secret) {
  const raw = new TextEncoder().encode(String(secret || ''));
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return crypto.subtle.importKey(
    'raw',
    digest,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptTokenPayload(payloadObj, secret) {
  const key = await deriveAesKey(secret);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const plaintext = new TextEncoder().encode(JSON.stringify(payloadObj));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return `v1:${toBase64Url(iv)}:${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function decryptTokenPayload(blob, secret) {
  const parts = String(blob || '').split(':');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  try {
    const key = await deriveAesKey(secret);
    const iv = fromBase64Url(parts[1]);
    const cipher = fromBase64Url(parts[2]);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch {
    return null;
  }
}

export function isCanvaOAuthConfigured(env = {}) {
  return Boolean(
    String(env?.CANVA_CLIENT_ID || '').trim() &&
    String(env?.CANVA_CLIENT_SECRET || '').trim() &&
    String(env?.CANVA_SESSION_SECRET || '').trim()
  );
}

export function getCanvaOAuthSetupInfo(origin = 'https://polskieradio.cc') {
  const cleanOrigin = String(origin || 'https://polskieradio.cc').replace(/\/+$/, '');
  return {
    redirectUri: `${cleanOrigin}/api/ai-dla-jezusa/v1/canva/oauth/callback`,
    requiredScopes: [...CANVA_REQUIRED_SCOPES],
    requiredSecrets: ['CANVA_CLIENT_ID', 'CANVA_CLIENT_SECRET', 'CANVA_SESSION_SECRET']
  };
}

function normalizeReturnPath(rawPath) {
  const clean = String(rawPath || '/ai/aplikacja').trim();
  if (ALLOWED_RETURN_PATHS.has(clean)) return clean;
  return '/ai/aplikacja';
}

function parseCookies(request) {
  const header = request?.headers?.get?.('Cookie') || '';
  const map = new Map();
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        map.set(key, decodeURIComponent(val));
      } catch {
        map.set(key, val);
      }
    }
  }
  return map;
}

function buildSessionCookieHeader(sessionId, isSecure = true) {
  const attrs = [
    `${CANVA_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_COOKIE_MAX_AGE}`
  ];
  if (isSecure) attrs.splice(2, 0, 'Secure');
  return attrs.join('; ');
}

function buildClearCookieHeader(isSecure = true) {
  const attrs = [
    `${CANVA_SESSION_COOKIE}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0'
  ];
  if (isSecure) attrs.splice(2, 0, 'Secure');
  return attrs.join('; ');
}

function basicAuthHeader(env) {
  const creds = `${String(env.CANVA_CLIENT_ID).trim()}:${String(env.CANVA_CLIENT_SECRET).trim()}`;
  return `Basic ${btoa(creds)}`;
}

async function saveOAuthState(env, { state, codeVerifier, returnTo, expiresAt }) {
  if (env?.AI_COST_DB) {
    await env.AI_COST_DB.prepare(
      'INSERT INTO canva_oauth_states (state, code_verifier, return_to, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(state, codeVerifier, returnTo, expiresAt).run();
    return;
  }
  memoryStates.set(state, { state, code_verifier: codeVerifier, return_to: returnTo, expires_at: expiresAt });
}

async function consumeOAuthState(env, state, currentMs) {
  if (!state) return null;
  if (env?.AI_COST_DB) {
    const row = await env.AI_COST_DB.prepare(
      'SELECT state, code_verifier, return_to, expires_at FROM canva_oauth_states WHERE state = ?'
    ).bind(state).first();
    await env.AI_COST_DB.prepare('DELETE FROM canva_oauth_states WHERE state = ? OR expires_at <= ?')
      .bind(state, currentMs).run();
    if (!row || Number(row.expires_at) <= currentMs) return null;
    return row;
  }
  const row = memoryStates.get(state) || null;
  memoryStates.delete(state);
  for (const [k, v] of memoryStates.entries()) {
    if (!v || Number(v.expires_at) <= currentMs) memoryStates.delete(k);
  }
  if (!row || Number(row.expires_at) <= currentMs) return null;
  return row;
}

async function saveOAuthSession(env, row) {
  if (env?.AI_COST_DB) {
    await env.AI_COST_DB.prepare(
      `INSERT INTO canva_oauth_sessions
        (session_id, canva_user_id, display_name, scopes, tokens_enc, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET
        canva_user_id = excluded.canva_user_id,
        display_name = excluded.display_name,
        scopes = excluded.scopes,
        tokens_enc = excluded.tokens_enc,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at`
    ).bind(
      row.session_id,
      row.canva_user_id,
      row.display_name,
      row.scopes,
      row.tokens_enc,
      row.expires_at,
      row.updated_at
    ).run();
    return;
  }
  memorySessions.set(row.session_id, { ...row });
}

async function loadOAuthSession(env, sessionId) {
  if (!sessionId) return null;
  if (env?.AI_COST_DB) {
    return await env.AI_COST_DB.prepare(
      'SELECT session_id, canva_user_id, display_name, scopes, tokens_enc, expires_at, updated_at FROM canva_oauth_sessions WHERE session_id = ?'
    ).bind(sessionId).first();
  }
  return memorySessions.get(sessionId) || null;
}

async function deleteOAuthSession(env, sessionId) {
  if (!sessionId) return;
  if (env?.AI_COST_DB) {
    await env.AI_COST_DB.prepare('DELETE FROM canva_oauth_sessions WHERE session_id = ?').bind(sessionId).run();
    return;
  }
  memorySessions.delete(sessionId);
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

export async function handleCanvaOAuthStart(request, env = {}, deps = {}) {
  const url = new URL(request.url);
  if (!isCanvaOAuthConfigured(env)) {
    return Response.json(
      {
        ok: false,
        status: 503,
        error: 'canva_oauth_not_configured',
        message: 'Połączenie Canva OAuth wymaga skonfigurowania CANVA_CLIENT_ID oraz CANVA_CLIENT_SECRET.',
        setup: getCanvaOAuthSetupInfo(url.origin)
      },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  const returnTo = normalizeReturnPath(url.searchParams.get('return_to'));
  const state = randomBase64Url(24);
  const codeVerifier = randomBase64Url(32);
  const codeChallenge = await computeS256Challenge(codeVerifier);
  const expiresAt = nowMs(deps) + STATE_TTL_MS;

  await saveOAuthState(env, { state, codeVerifier, returnTo, expiresAt });

  const { redirectUri, requiredScopes } = getCanvaOAuthSetupInfo(url.origin);
  const authUrl = new URL(CANVA_AUTHORIZE_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', String(env.CANVA_CLIENT_ID).trim());
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', requiredScopes.join(' '));
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  if (url.searchParams.get('format') === 'json') {
    return Response.json(
      { ok: true, status: 200, authorizeUrl: authUrl.toString() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      ...NO_STORE_HEADERS
    }
  });
}

export async function handleCanvaOAuthCallback(request, env = {}, deps = {}) {
  const url = new URL(request.url);
  const isSecure = url.protocol === 'https:';
  if (!isCanvaOAuthConfigured(env)) {
    return Response.json(
      { ok: false, status: 503, error: 'canva_oauth_not_configured', setup: getCanvaOAuthSetupInfo(url.origin) },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  const currentMs = nowMs(deps);
  const rawState = String(url.searchParams.get('state') || '').trim();
  const stateRow = await consumeOAuthState(env, rawState, currentMs);
  const returnTo = normalizeReturnPath(stateRow?.return_to || '/ai/aplikacja');

  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    const flag = oauthError === 'access_denied' ? 'cancelled' : 'error';
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}${returnTo}?canva=${flag}`,
        ...NO_STORE_HEADERS
      }
    });
  }

  const code = String(url.searchParams.get('code') || '').trim();
  if (!stateRow || !code) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}${returnTo}?canva=error`,
        ...NO_STORE_HEADERS
      }
    });
  }

  const fetchImpl = deps.fetch || fetch;
  const { redirectUri } = getCanvaOAuthSetupInfo(url.origin);
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: stateRow.code_verifier,
    redirect_uri: redirectUri
  });

  let tokenData;
  try {
    const tokenRes = await fetchImpl(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(env),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody.toString()
    });
    if (!tokenRes.ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${url.origin}${returnTo}?canva=error`, ...NO_STORE_HEADERS }
      });
    }
    tokenData = await tokenRes.json();
  } catch {
    return new Response(null, {
      status: 302,
      headers: { Location: `${url.origin}${returnTo}?canva=error`, ...NO_STORE_HEADERS }
    });
  }

  if (!tokenData?.access_token) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${url.origin}${returnTo}?canva=error`, ...NO_STORE_HEADERS }
    });
  }

  let canvaUserId = 'canva_user';
  let displayName = 'Połączone konto Canva';
  try {
    const profRes = await fetchImpl(CANVA_PROFILE_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (profRes.ok) {
      const prof = await profRes.json();
      canvaUserId = String(prof?.profile?.user_id || prof?.user_id || prof?.team_user?.user_id || 'canva_user');
      displayName = String(prof?.profile?.display_name || prof?.display_name || 'Konto Canva');
    }
  } catch {}

  const expiresInSec = Number(tokenData.expires_in) > 0 ? Number(tokenData.expires_in) : 14400;
  const expiresAt = currentMs + expiresInSec * 1000;
  const sessionId = `cs_${randomBase64Url(24)}`;
  const tokensEnc = await encryptTokenPayload(
    {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || '',
      token_type: tokenData.token_type || 'Bearer',
      scope: tokenData.scope || CANVA_REQUIRED_SCOPES.join(' ')
    },
    env.CANVA_SESSION_SECRET
  );

  await saveOAuthSession(env, {
    session_id: sessionId,
    canva_user_id: canvaUserId,
    display_name: displayName,
    scopes: String(tokenData.scope || CANVA_REQUIRED_SCOPES.join(' ')),
    tokens_enc: tokensEnc,
    expires_at: expiresAt,
    updated_at: currentMs
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}${returnTo}?canva=connected`,
      'Set-Cookie': buildSessionCookieHeader(sessionId, isSecure),
      ...NO_STORE_HEADERS
    }
  });
}

export async function handleCanvaOAuthDisconnect(request, env = {}, deps = {}) {
  const url = new URL(request.url);
  const isSecure = url.protocol === 'https:';
  const cookies = parseCookies(request);
  const sessionId = cookies.get(CANVA_SESSION_COOKIE) || '';

  if (sessionId && isCanvaOAuthConfigured(env)) {
    const row = await loadOAuthSession(env, sessionId);
    if (row?.tokens_enc) {
      const tokens = await decryptTokenPayload(row.tokens_enc, env.CANVA_SESSION_SECRET);
      const tokenToRevoke = tokens?.refresh_token || tokens?.access_token;
      if (tokenToRevoke) {
        const fetchImpl = deps.fetch || fetch;
        try {
          await fetchImpl(CANVA_REVOKE_URL, {
            method: 'POST',
            headers: {
              Authorization: basicAuthHeader(env),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ token: tokenToRevoke }).toString()
          });
        } catch {}
      }
    }
    await deleteOAuthSession(env, sessionId);
  } else if (sessionId) {
    await deleteOAuthSession(env, sessionId);
  }

  return Response.json(
    { ok: true, status: 200, disconnected: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': buildClearCookieHeader(isSecure),
        ...NO_STORE_HEADERS
      }
    }
  );
}

export async function getActiveCanvaSession(request, env = {}, deps = {}) {
  if (!isCanvaOAuthConfigured(env)) return null;
  const cookies = parseCookies(request);
  const sessionId = cookies.get(CANVA_SESSION_COOKIE) || '';
  if (!sessionId) return null;

  const row = await loadOAuthSession(env, sessionId);
  if (!row) return null;

  const tokens = await decryptTokenPayload(row.tokens_enc, env.CANVA_SESSION_SECRET);
  if (!tokens?.access_token) {
    await deleteOAuthSession(env, sessionId);
    return { expired: true };
  }

  const currentMs = nowMs(deps);
  if (Number(row.expires_at) - REFRESH_MARGIN_MS > currentMs) {
    return {
      sessionId,
      canvaUserId: row.canva_user_id,
      displayName: row.display_name,
      scopes: String(row.scopes || '').split(/\s+/).filter(Boolean),
      accessToken: tokens.access_token,
      expiresAt: Number(row.expires_at)
    };
  }

  if (!tokens.refresh_token) {
    await deleteOAuthSession(env, sessionId);
    return { expired: true };
  }

  const fetchImpl = deps.fetch || fetch;
  try {
    const refreshRes = await fetchImpl(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(env),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token
      }).toString()
    });
    if (!refreshRes.ok) {
      await deleteOAuthSession(env, sessionId);
      return { expired: true };
    }
    const refreshed = await refreshRes.json();
    if (!refreshed?.access_token) {
      await deleteOAuthSession(env, sessionId);
      return { expired: true };
    }
    const newExpiresAt = currentMs + (Number(refreshed.expires_in) > 0 ? Number(refreshed.expires_in) : 14400) * 1000;
    const newEnc = await encryptTokenPayload(
      {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || tokens.refresh_token,
        token_type: refreshed.token_type || 'Bearer',
        scope: refreshed.scope || row.scopes
      },
      env.CANVA_SESSION_SECRET
    );
    await saveOAuthSession(env, {
      ...row,
      tokens_enc: newEnc,
      scopes: refreshed.scope || row.scopes,
      expires_at: newExpiresAt,
      updated_at: currentMs
    });
    return {
      sessionId,
      canvaUserId: row.canva_user_id,
      displayName: row.display_name,
      scopes: String(refreshed.scope || row.scopes || '').split(/\s+/).filter(Boolean),
      accessToken: refreshed.access_token,
      expiresAt: newExpiresAt
    };
  } catch {
    return { expired: true };
  }
}

export async function listLiveCanvaDesigns(session, query = '', deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const endpoint = new URL(CANVA_DESIGNS_URL);
  const q = String(query || '').trim();
  if (q) endpoint.searchParams.set('query', q);

  const res = await fetchImpl(endpoint.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  if (!res.ok) {
    return { ok: false, status: res.status === 401 ? 401 : 502, error: 'canva_api_error' };
  }
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  const designs = items.map((item) => ({
    id: String(item.id || ''),
    title: String(item.title || 'Projekt Canva'),
    format: item.page_count ? `Canva (${item.page_count} str.)` : 'Projekt Canva',
    updatedAt: item.updated_at ? new Date(Number(item.updated_at) * 1000).toISOString() : '',
    ownerUserId: session.canvaUserId,
    readOnly: true,
    isDraft: false,
    canvaUrl: String(item?.urls?.edit_url || item?.urls?.view_url || 'https://www.canva.com/')
  }));
  return { ok: true, status: 200, mode: 'oauth_live', userId: session.canvaUserId, designs };
}

export async function createLiveCanvaDraft(session, { title, formatKey = 'instagram-post', format = '' } = {}, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const dim = FORMAT_DIMENSIONS[String(formatKey || '').toLowerCase()] || FORMAT_DIMENSIONS['instagram-post'];
  const res = await fetchImpl(CANVA_DESIGNS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      design_type: { type: 'custom', width: dim.width, height: dim.height },
      title: String(title || 'AI dla Jezusa — Szkic').slice(0, 140)
    })
  });
  if (!res.ok) {
    return { ok: false, status: res.status === 401 ? 401 : 502, error: 'canva_create_failed' };
  }
  const data = await res.json();
  const design = data?.design || data;
  return {
    id: String(design?.id || ''),
    title: String(design?.title || title || 'Szkic Canva'),
    format: format || dim.label,
    updatedAt: new Date().toISOString(),
    ownerUserId: session.canvaUserId,
    readOnly: false,
    isDraft: true,
    mode: 'oauth_live',
    canvaUrl: String(design?.urls?.edit_url || design?.urls?.view_url || 'https://www.canva.com/')
  };
}
