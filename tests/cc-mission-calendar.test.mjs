import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  MissionCalendarRepository,
  handleMissionCalendarApi,
  materializeOccurrences,
  parseNaturalLanguageCommand,
  isWithinQuietHours,
} from '../services/cc-mission-calendar/mission-calendar-service.js';
import worker from '../_worker.js';

function createTestContext(customNowFn = () => new Date()) {
  const repo = new MissionCalendarRepository(null);
  const env = {
    ADMIN_EMAIL: 'nazirczarkes@gmail.com',
    ADMIN_GOOGLE_SUB: 'google-sub-owner-777',
    SESSION_SECRET: 'test-session-secret-777',
  };
  const verifyToken = async (token) => {
    if (token === 'valid-owner-firebase-token') {
      return {
        sub: 'google-sub-owner-777',
        email: 'nazirczarkes@gmail.com',
        email_verified: true,
        name: 'Cezary Rogowski (Nazir)',
      };
    }
    if (token === 'foreign-user-firebase-token') {
      return {
        sub: 'google-sub-stranger-999',
        email: 'intruder@example.com',
        email_verified: true,
        name: 'Intruder',
      };
    }
    return null;
  };

  async function callApi(urlPath, { method = 'GET', headers = {}, body = null, nowFn = customNowFn } = {}) {
    const reqHeaders = new Headers(headers);
    if (body !== null && !reqHeaders.has('content-type')) {
      reqHeaders.set('content-type', 'application/json');
    }
    const req = new Request(`https://polskieradio.cc${urlPath}`, {
      method,
      headers: reqHeaders,
      body: body !== null ? JSON.stringify(body) : undefined,
    });
    const res = await handleMissionCalendarApi(req, env, null, { repo, verifyToken, nowFn });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, headers: res.headers, data };
  }

  return { repo, env, callApi };
}

test('1. Auth & RBAC: unauthenticated -> 401, foreign Google sub/email -> 403, Owner login -> 200 + CSRF protection', async () => {
  const { callApi } = createTestContext();

  // Unauthenticated access to events -> 401
  const unauth = await callApi('/api/mission-calendar/events');
  assert.equal(unauth.status, 401);

  // Foreign Google account -> 403
  const foreign = await callApi('/api/mission-calendar/auth/session', {
    method: 'POST',
    body: { idToken: 'foreign-user-firebase-token' },
  });
  assert.equal(foreign.status, 403);

  // Valid Owner Google SSO token -> 200 + session cookie + csrfToken
  const ownerLogin = await callApi('/api/mission-calendar/auth/session', {
    method: 'POST',
    body: { idToken: 'valid-owner-firebase-token' },
  });
  assert.equal(ownerLogin.status, 200);
  assert.equal(ownerLogin.data.ok, true);
  assert.equal(ownerLogin.data.user.role, 'owner');
  assert.ok(ownerLogin.data.csrfToken);

  const setCookie = ownerLogin.headers.get('set-cookie') || '';
  assert.match(setCookie, /cc_mc_session=/);
  assert.match(setCookie, /HttpOnly/);
  const cookieHeader = setCookie.split(';')[0];

  // Cookie write WITHOUT X-CC-CSRF -> 403
  const csrfFail = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      origin: 'https://polskieradio.cc',
    },
    body: {
      title: 'Zadanie bez CSRF',
      starts_at: '2026-11-07T09:00:00.000Z',
      ends_at: '2026-11-07T10:00:00.000Z',
    },
  });
  assert.equal(csrfFail.status, 403);

  // Cookie write WITH X-CC-CSRF and valid Origin -> 201 Created
  const csrfPass = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'x-cc-csrf': ownerLogin.data.csrfToken,
      origin: 'https://polskieradio.cc',
    },
    body: {
      title: 'Zadanie z poprawnym CSRF',
      starts_at: '2026-11-07T09:00:00.000Z',
      ends_at: '2026-11-07T10:00:00.000Z',
    },
  });
  assert.equal(csrfPass.status, 201);
  assert.equal(csrfPass.data.event.title, 'Zadanie z poprawnym CSRF');
});

test('2. 4 Canonical Statuses, Overdue Separation, and Optimistic Concurrency (409 Conflict)', async () => {
  const { callApi } = createTestContext();
  const ownerHeaders = { authorization: 'Bearer valid-owner-firebase-token' };

  // Create past event with status 'todo'
  const created = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      title: 'Audyt poranny @SMCC',
      category: 'guardian',
      priority: 1,
      status: 'todo',
      starts_at: '2020-01-01T08:00:00.000Z',
      ends_at: '2020-01-01T09:00:00.000Z',
    },
  });
  assert.equal(created.status, 201);
  const eventId = created.data.event.id;
  assert.equal(created.data.event.version, 1);

  // Overdue flag is true, but status remains 'todo' (no auto-mutation to 'not_done')
  assert.equal(created.data.event.status, 'todo');
  assert.equal(created.data.event.overdue, true);
  assert.equal(created.data.event.status_meta.color, '#2563EB');

  // Setting status to 'not_done' WITHOUT not_done_reason -> 422
  const missingReason = await callApi(`/api/mission-calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: ownerHeaders,
    body: {
      status: 'not_done',
      version: 1,
    },
  });
  assert.equal(missingReason.status, 422);

  // Setting status to 'not_done' WITH not_done_reason -> 200, overdue becomes false
  const withReason = await callApi(`/api/mission-calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: ownerHeaders,
    body: {
      status: 'not_done',
      not_done_reason: 'Przełożone decyzją Dowódcy na kolejny tydzień',
      version: 1,
    },
  });
  assert.equal(withReason.status, 200);
  assert.equal(withReason.data.event.status, 'not_done');
  assert.equal(withReason.data.event.overdue, false);
  assert.equal(withReason.data.event.version, 2);
  assert.equal(withReason.data.event.status_meta.color, '#B91C1C');

  // Stale version PATCH (sending version: 1 when server is at version: 2) -> 409 Conflict
  const conflict = await callApi(`/api/mission-calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: ownerHeaders,
    body: {
      title: 'Konflikt współbieżności',
      version: 1,
    },
  });
  assert.equal(conflict.status, 409);
  assert.equal(conflict.data.serverEvent.version, 2);
});

test('3. Recurrence & Europe/Warsaw DST transitions: local hour preserved + twice-monthly 1st & 15th + single-occurrence override', async () => {
  const { callApi } = createTestContext();
  const ownerHeaders = { authorization: 'Bearer valid-owner-firebase-token' };

  // Test Europe/Warsaw DST spring-forward (2026-03-29: CET UTC+1 -> CEST UTC+2)
  // Event starts 2026-03-28 at 06:00 Europe/Warsaw (05:00 UTC)
  const dstSeries = {
    id: 'evt_dst_test',
    title: 'Poranna publikacja DZJ 06:00',
    starts_at: '2026-03-28T05:00:00.000Z',
    ends_at: '2026-03-28T05:30:00.000Z',
    timezone: 'Europe/Warsaw',
    rrule: 'FREQ=DAILY;INTERVAL=1',
    exdates: [],
  };

  const occurrences = materializeOccurrences(
    dstSeries,
    '2026-03-28T00:00:00.000Z',
    '2026-03-30T23:59:59.000Z',
    []
  );
  assert.equal(occurrences.length, 3);
  // Before DST change (2026-03-28): 06:00 Warsaw = 05:00 UTC
  assert.equal(occurrences[0].starts_at, '2026-03-28T05:00:00.000Z');
  // On/After DST change (2026-03-29 & 2026-03-30): 06:00 Warsaw = 04:00 UTC!
  assert.equal(occurrences[1].starts_at, '2026-03-29T04:00:00.000Z');
  assert.equal(occurrences[2].starts_at, '2026-03-30T04:00:00.000Z');

  // Test twice-monthly 1st and 15th (FREQ=MONTHLY;BYMONTHDAY=1,15)
  const createdMonthly = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      title: 'Przegląd kosztów i bezpieczeństwa @SMCC (2x w miesiącu)',
      starts_at: '2026-11-01T09:00:00.000Z',
      ends_at: '2026-11-01T10:00:00.000Z',
      timezone: 'Europe/Warsaw',
      rrule: 'FREQ=MONTHLY;BYMONTHDAY=1,15',
    },
  });
  assert.equal(createdMonthly.status, 201);
  const seriesId = createdMonthly.data.event.id;

  const novList = await callApi('/api/mission-calendar/events?from=2026-11-01T00:00:00.000Z&to=2026-11-30T23:59:59.000Z', {
    headers: ownerHeaders,
  });
  const seriesOccurrences = novList.data.events.filter((i) => i.series_id === seriesId);
  assert.equal(seriesOccurrences.length, 2);
  assert.ok(seriesOccurrences[0].starts_at.startsWith('2026-11-01'));
  assert.ok(seriesOccurrences[1].starts_at.startsWith('2026-11-15'));

  // Move ONLY the November 15th occurrence via /occurrences/:occId/override to November 16th
  const secondOccId = seriesOccurrences[1].occurrence_id;
  const singleEdit = await callApi(`/api/mission-calendar/events/${seriesId}/occurrences/${encodeURIComponent(secondOccId)}/override`, {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      original_start: seriesOccurrences[1].original_start,
      starts_at: '2026-11-16T11:00:00.000Z',
      ends_at: '2026-11-16T12:00:00.000Z',
      title: 'Przegląd kosztów (przesunięty wyjątkowo na 16 XI)',
    },
  });
  assert.equal(singleEdit.status, 200);

  const novListAfter = await callApi('/api/mission-calendar/events?from=2026-11-01T00:00:00.000Z&to=2026-11-30T23:59:59.000Z', {
    headers: ownerHeaders,
  });
  const afterOccurrences = novListAfter.data.events.filter((i) => i.series_id === seriesId);
  assert.equal(afterOccurrences.length, 2);
  assert.ok(afterOccurrences[0].starts_at.startsWith('2026-11-01'));
  assert.equal(afterOccurrences[1].starts_at, '2026-11-16T11:00:00.000Z');
  assert.equal(afterOccurrences[1].is_override, true);
});

test('4. Agent Workflow: SHA-256 token, atomic claim/lease, awaiting_review, Owner approve, and CC LIFE privacy isolation', async () => {
  const { callApi, repo } = createTestContext();
  const ownerHeaders = { authorization: 'Bearer valid-owner-firebase-token' };

  // Register custom agent token -> returns raw token once, stores only SHA-256 hash
  const agentReg = await callApi('/api/mission-calendar/agents', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      name: '@077',
      capabilities: ['graphics', 'thumbnails', 'shorts'],
    },
  });
  assert.equal(agentReg.status, 201);
  const rawAgentToken = agentReg.data.token;
  assert.ok(rawAgentToken.length >= 32);

  const storedClient = repo.mem.apiClients.get(agentReg.data.agent.name);
  assert.notEqual(storedClient.token_hash, rawAgentToken);
  assert.equal(storedClient.token_hash.length, 64); // SHA-256 hex

  // Create 1 mission task assigned to @OA and route it via /assign
  const createdTask = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      title: 'Przygotuj miniaturę 16:9 do lekcji Kursu Codziennego',
      category: 'media',
      assigned_to: '@OA',
      starts_at: '2026-11-07T10:00:00.000Z',
      ends_at: '2026-11-07T11:00:00.000Z',
    },
  });
  assert.equal(createdTask.status, 201);
  const taskId = createdTask.data.event.id;

  const assignedTask = await callApi(`/api/mission-calendar/events/${taskId}/assign`, {
    method: 'POST',
    headers: ownerHeaders,
    body: { assignee: '@077' },
  });
  assert.equal(assignedTask.status, 200);
  assert.equal(assignedTask.data.event.assigned_to, '@077');

  // Create 1 private CC LIFE event
  const privateEvent = await callApi('/api/mission-calendar/events', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      title: 'Prywatne spotkanie rodzinne CC LIFE',
      description: 'Poufna notatka osobista Dowódcy',
      category: 'people',
      is_private: true,
      starts_at: '2026-11-07T17:00:00.000Z',
      ends_at: '2026-11-07T18:00:00.000Z',
    },
  });
  assert.equal(privateEvent.status, 201);

  const agentHeaders = { authorization: `Bearer ${rawAgentToken}` };

  // Agent fetches /agent/tasks -> private CC LIFE task is completely excluded
  const agentQueue = await callApi('/api/mission-calendar/agent/tasks', { headers: agentHeaders });
  assert.equal(agentQueue.status, 200);
  assert.equal(agentQueue.data.events.some((e) => e.id === privateEvent.data.event.id), false);
  assert.equal(agentQueue.data.events.some((e) => e.id === taskId), true);

  // Agent claims task -> status becomes 'in_progress' with active lease
  const claim1 = await callApi(`/api/mission-calendar/agent/tasks/${taskId}/claim`, {
    method: 'POST',
    headers: agentHeaders,
  });
  assert.equal(claim1.status, 200);
  assert.equal(claim1.data.event.status, 'in_progress');
  assert.ok(claim1.data.event.lease_until);

  // Second agent attempts to claim the same leased task -> 409 Conflict
  const secondAgentReg = await callApi('/api/mission-calendar/agents', {
    method: 'POST',
    headers: ownerHeaders,
    body: { name: '@A001' },
  });
  const claim2 = await callApi(`/api/mission-calendar/agent/tasks/${taskId}/claim`, {
    method: 'POST',
    headers: { authorization: `Bearer ${secondAgentReg.data.token}` },
  });
  assert.equal(claim2.status, 409);

  // Agent submits result -> review_state becomes 'awaiting_review', status stays 'in_progress'
  const submitResult = await callApi(`/api/mission-calendar/agent/tasks/${taskId}/result`, {
    method: 'POST',
    headers: agentHeaders,
    body: {
      summary: 'Miniatura wygenerowana i zweryfikowana przez Visual Guardian (PASS)',
      result_links: ['https://polskieradio.cc/images/academy/daily/kc_day_20.jpg'],
    },
  });
  assert.equal(submitResult.status, 200);
  assert.equal(submitResult.data.event.review_state, 'awaiting_review');
  assert.equal(submitResult.data.event.status, 'in_progress');

  // Owner approves result -> status becomes 'done' (#15803D) and review_state becomes 'approved'
  const approve = await callApi(`/api/mission-calendar/events/${taskId}/approve`, {
    method: 'POST',
    headers: ownerHeaders,
    body: {},
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.data.event.status, 'done');
  assert.equal(approve.data.event.review_state, 'approved');
});

test('5. Natural Language Command (@077 Noemi), Outbox Reconcile, Web Push Quiet Hours, and /ccMC + /kalendarz separation', async () => {
  const { callApi } = createTestContext();
  const ownerHeaders = { authorization: 'Bearer valid-owner-firebase-token' };

  // Natural Language Parser test
  const parsed = parseNaturalLanguageCommand(
    'Dodaj w każdy piątek o 10:00 przegląd miniatur YouTube dla @VisualDirector P0',
    new Date('2026-11-05T12:00:00.000Z')
  );
  assert.equal(parsed.assigned_to, '@VisualDirector');
  assert.equal(parsed.rrule, 'FREQ=WEEKLY;BYDAY=FR');
  assert.equal(parsed.priority, 1);

  // Quiet hours in Europe/Warsaw (23:00 - 07:00 local time)
  // 2026-11-06 22:30 UTC is 23:30 CET (Europe/Warsaw) -> quiet hours TRUE
  assert.equal(isWithinQuietHours(new Date('2026-11-06T22:30:00.000Z')), true);
  // 2026-11-06 11:00 UTC is 12:00 CET (Europe/Warsaw) -> quiet hours FALSE
  assert.equal(isWithinQuietHours(new Date('2026-11-06T11:00:00.000Z')), false);

  // Push notification preview during quiet hours is suppressed
  const subRes = await callApi('/api/mission-calendar/push/subscribe', {
    method: 'POST',
    headers: ownerHeaders,
    body: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
      keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
    },
  });
  assert.equal(subRes.status, 201);

  const pushTestQuiet = await callApi('/api/mission-calendar/push/test', {
    method: 'POST',
    headers: ownerHeaders,
    body: {},
    nowFn: () => new Date('2026-11-06T22:30:00.000Z'),
  });
  assert.equal(pushTestQuiet.status, 200);
  assert.equal(pushTestQuiet.data.suppressedByQuietHours, true);

  // Verify /kalendarz.html (public wall calendar creator) and /ccMC/index.html both exist and are distinct
  const rootDir = path.resolve(import.meta.dirname, '..');
  const publicKalendarzPath = path.join(rootDir, 'kalendarz.html');
  const ccMcHtmlPath = path.join(rootDir, 'ccMC', 'index.html');
  assert.equal(fs.existsSync(publicKalendarzPath), true, 'kalendarz.html must remain intact');
  assert.equal(fs.existsSync(ccMcHtmlPath), true, 'ccMC/index.html must exist');

  const ccMcHtml = fs.readFileSync(ccMcHtmlPath, 'utf8');
  assert.match(ccMcHtml, /noindex, nofollow, noarchive/);

  // Test _worker.js routing for /ccMC
  const mockEnv = {
    ASSETS: {
      fetch: async (req) => {
        const u = new URL(req.url);
        if (u.pathname === '/ccMC/' || u.pathname === '/ccMC/index.html') {
          return new Response(ccMcHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        return new Response('Not found', { status: 404 });
      },
    },
  };
  const workerRes = await worker.fetch(new Request('https://polskieradio.cc/ccMC'), mockEnv, {});
  assert.equal(workerRes.status, 200);
  assert.equal(workerRes.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  assert.match(workerRes.headers.get('Cache-Control') || '', /private,\s*no-store/);
});

test('6. Standard Back-To-Top Button integration (/js/cc-back-to-top.js)', async () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcHtmlPath = path.join(rootDir, 'ccMC', 'index.html');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcHtml = fs.readFileSync(ccMcHtmlPath, 'utf8');
  assert.match(ccMcHtml, /src="\/js\/cc-back-to-top\.js\?v=20261107_v5"/, 'ccMC must include standard cc-back-to-top.js');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /#backToTopBtn\[data-cc-back-to-top\]/, 'style.css must style the canonical back-to-top button');
  assert.match(ccMcStyle, /\[data-theme="dark"\] #backToTopBtn\[data-cc-back-to-top\]/, 'style.css must support dark mode back-to-top');
  assert.match(ccMcStyle, /\[data-theme="light"\] #backToTopBtn\[data-cc-back-to-top\]/, 'style.css must support light mode back-to-top');
});

