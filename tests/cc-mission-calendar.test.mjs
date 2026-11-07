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

  // Quiet hours in Europe/Warsaw (22:00 - 06:00 local time)
  // 2026-11-06 21:30 UTC is 22:30 CET (Europe/Warsaw) -> quiet hours TRUE
  assert.equal(isWithinQuietHours(new Date('2026-11-06T21:30:00.000Z')), true);
  // 2026-11-06 04:30 UTC is 05:30 CET (Europe/Warsaw) -> quiet hours TRUE
  assert.equal(isWithinQuietHours(new Date('2026-11-06T04:30:00.000Z')), true);
  // 2026-11-06 05:30 UTC is 06:30 CET (Europe/Warsaw) -> quiet hours FALSE (after 06:00)
  assert.equal(isWithinQuietHours(new Date('2026-11-06T05:30:00.000Z')), false);
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
  assert.match(ccMcHtml, /src="\/js\/cc-back-to-top\.js(\?v=[^"]+)?"/, 'ccMC must include standard cc-back-to-top.js');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /#backToTopBtn\[data-cc-back-to-top\]/, 'style.css must style the canonical back-to-top button');
  assert.match(ccMcStyle, /\[data-theme="dark"\] #backToTopBtn\[data-cc-back-to-top\]/, 'style.css must support dark mode back-to-top');
  assert.match(ccMcStyle, /\[data-theme="light"\] #backToTopBtn\[data-cc-back-to-top\]/, 'style.css must support light mode back-to-top');
});

test('7. Biblical Week Standard (Kanon Wiary CC: Niedziela = 1. dzień, Sobota = 7. dzień czerwona, Piątek = przygotowanie pomarańczowy)', async () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcAppPath = path.join(rootDir, 'ccMC', 'app.js');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcApp = fs.readFileSync(ccMcAppPath, 'utf8');
  assert.match(ccMcApp, /base\.getDay\(\)/, 'Must calculate Sunday as first day of week');
  assert.match(ccMcApp, /mc-day-sabbath/, 'Must assign mc-day-sabbath class on Saturday');
  assert.match(ccMcApp, /mc-day-friday-prep/, 'Must assign mc-day-friday-prep class on Friday');
  assert.match(ccMcApp, /mc-day-sunday/, 'Must assign mc-day-sunday class on Sunday');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /\.mc-day-col\.mc-day-sabbath\s*\{[^}]*border:\s*2px solid #ef4444/, 'Saturday must have red border');
  assert.match(ccMcStyle, /\.mc-day-col\.mc-day-friday-prep\s*\{[^}]*border:\s*2px solid #FF7A00/, 'Friday must have orange border');
  assert.match(ccMcStyle, /\[data-theme="light"\] \.mc-day-col\.mc-day-sabbath/, 'Must support light theme Saturday');
  assert.match(ccMcStyle, /\[data-theme="light"\] \.mc-day-col\.mc-day-friday-prep/, 'Must support light theme Friday');
});

test('8. Default Today View with Current Hour (TERAZ) Timeline and Auto-scroll indicator', async () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcAppPath = path.join(rootDir, 'ccMC', 'app.js');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcApp = fs.readFileSync(ccMcAppPath, 'utf8');
  assert.match(ccMcApp, /view:\s*['"]today['"]/, 'Default view in state must be today');
  assert.match(ccMcApp, /renderTodayHtml/, 'Must define renderTodayHtml');
  assert.match(ccMcApp, /mcNowTimelineDivider/, 'Must define mcNowTimelineDivider in timeline');
  assert.match(ccMcApp, /is-current-now/, 'Must assign is-current-now class for active task');
  assert.match(ccMcApp, /formatWarsawTimeOnly/, 'Must format hours in Warsaw time');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /\.mc-now-divider/, 'style.css must style mc-now-divider');
  assert.match(ccMcStyle, /\.mc-today-tile\.is-current-now\s*\{[^}]*border:\s*2px solid #FF7A00/, 'Active task must have 2px orange border');
  assert.match(ccMcStyle, /\.mc-today-live-clock|\.mc-clock-digits/, 'style.css must style live clock');
});

test('9. Minimalist Biblical Clock & Click-to-TERAZ Tasks Integration', async () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcAppPath = path.join(rootDir, 'ccMC', 'app.js');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcApp = fs.readFileSync(ccMcAppPath, 'utf8');
  assert.match(ccMcApp, /calculateSunset/, 'Must export calculateSunset (NOAA)');
  assert.match(ccMcApp, /getBiblicalTimeState/, 'Must export getBiblicalTimeState');
  assert.match(ccMcApp, /renderBiblicalClockDialSvg/, 'Must export renderBiblicalClockDialSvg');
  assert.match(ccMcApp, /mc-clickable-clock/, 'Must support mc-clickable-clock class');
  assert.match(ccMcApp, /btnTopbarClock/, 'Must provide btnTopbarClock in topbar');
  assert.match(ccMcApp, /terazFilter/, 'Must support terazFilter');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /\.mc-dial-wrapper/, 'style.css must style mc-dial-wrapper');
  assert.match(ccMcStyle, /\.mc-topbar-clock-btn/, 'style.css must style mc-topbar-clock-btn');
  assert.match(ccMcStyle, /\.mc-teraz-filter-banner/, 'style.css must style mc-teraz-filter-banner');
  assert.match(ccMcStyle, /\.mc-biblical-badge/, 'style.css must style mc-biblical-badge');
});

test('10. Fullscreen Modular Model: Start Module = Only Clock, Click-to-Fullscreen TERAZ with Active Hero Task & Bottom Dock Navigation', async () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcAppPath = path.join(rootDir, 'ccMC', 'app.js');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcApp = fs.readFileSync(ccMcAppPath, 'utf8');
  assert.match(ccMcApp, /module:\s*['"]clock['"]/, 'Default module on start must be clock (Moduł pierwszy na start - tylko zegar)');
  assert.match(ccMcApp, /function renderClockModule/, 'Must provide renderClockModule');
  assert.match(ccMcApp, /function renderTerazModule/, 'Must provide renderTerazModule');
  assert.match(ccMcApp, /function renderModuleDock/, 'Must provide renderModuleDock');
  assert.match(ccMcApp, /btnBackToClock/, 'Must provide return to clock button');
  assert.match(ccMcApp, /btnClockToggleMore/, 'Must provide delicate WIĘCEJ toggle below clock');
  assert.match(ccMcApp, /clockShowMore/, 'Must support clockShowMore state');
  assert.match(ccMcApp, /data-quick-done/, 'Must provide quick done action on hero card');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /\.mc-fullscreen-module/, 'style.css must style mc-fullscreen-module');
  assert.match(ccMcStyle, /\.mc-clock-fullscreen/, 'style.css must style mc-clock-fullscreen');
  assert.match(ccMcStyle, /\.mc-clock-more-btn/, 'style.css must style mc-clock-more-btn');
  assert.match(ccMcStyle, /#digital-time/, 'style.css must style #digital-time as largest digits');
  assert.match(ccMcStyle, /\.mc-teraz-fullscreen/, 'style.css must style mc-teraz-fullscreen');
  assert.match(ccMcStyle, /\.mc-teraz-hero-card/, 'style.css must style mc-teraz-hero-card');
  assert.match(ccMcStyle, /\.mc-module-dock/, 'style.css must style mc-module-dock');
  assert.match(ccMcStyle, /\.mc-dock-btn\.is-active/, 'style.css must style active dock button');
});

test('11. Intelligent Real-Time Engine (Autopilot Misji CC): dynamic lifecycle transitions, stats scope switcher, and /autopilot/reconcile endpoint', async () => {
  const customNow = new Date('2026-11-07T08:30:00.000Z');
  const { callApi } = createTestContext(() => customNow);
  const ownerHeaders = { authorization: 'Bearer valid-owner-firebase-token' };

  // 1. materializeOccurrences with real-time resolution:
  const dailySeries = {
    id: 'evt_realtime_test',
    title: 'Codzienna sesja nagraniowa @CCS',
    starts_at: '2026-11-06T08:00:00.000Z',
    ends_at: '2026-11-06T09:00:00.000Z',
    timezone: 'Europe/Warsaw',
    rrule: 'FREQ=DAILY;INTERVAL=1',
    exdates: [],
  };

  const occurrences = materializeOccurrences(
    dailySeries,
    '2026-11-06T00:00:00.000Z',
    '2026-11-08T23:59:59.000Z',
    [],
    customNow
  );
  assert.equal(occurrences.length, 3);
  // Nov 6 occurrence is elapsed -> done
  assert.equal(occurrences[0].status, 'done');
  // Nov 7 occurrence is happening right now (08:30 is between 08:00 and 09:00) -> in_progress
  assert.equal(occurrences[1].status, 'in_progress');
  assert.equal(occurrences[1].is_current_now, true);
  // Nov 8 occurrence is in future -> todo
  assert.equal(occurrences[2].status, 'todo');

  // 2. Call backend /autopilot/reconcile endpoint
  const reconcileRes = await callApi('/api/mission-calendar/autopilot/reconcile', {
    method: 'POST',
    headers: ownerHeaders,
    body: { scope: 'today' },
  });
  assert.equal(reconcileRes.status, 200);
  assert.equal(reconcileRes.data.ok, true);
  assert.equal(reconcileRes.data.engine, 'active');
  assert.ok(reconcileRes.data.summary);
  assert.equal(reconcileRes.data.summary.scope, 'today');

  // 3. UI checks in app.js and style.css
  const rootDir = path.resolve(import.meta.dirname, '..');
  const ccMcAppPath = path.join(rootDir, 'ccMC', 'app.js');
  const ccMcStylePath = path.join(rootDir, 'ccMC', 'style.css');

  const ccMcApp = fs.readFileSync(ccMcAppPath, 'utf8');
  assert.match(ccMcApp, /applyRealtimeEngine/, 'Must export applyRealtimeEngine');
  assert.match(ccMcApp, /mc-realtime-engine-pill/, 'Must render mc-realtime-engine-pill in UI');
  assert.match(ccMcApp, /data-stats-scope/, 'Must provide data-stats-scope switcher buttons');
  assert.match(ccMcApp, /statsScope:\s*['"]today['"]/, 'Default statsScope must be today');

  const ccMcStyle = fs.readFileSync(ccMcStylePath, 'utf8');
  assert.match(ccMcStyle, /\.mc-stats-toolbar/, 'style.css must style mc-stats-toolbar');
  assert.match(ccMcStyle, /\.mc-realtime-engine-pill/, 'style.css must style mc-realtime-engine-pill');
  assert.match(ccMcStyle, /\.mc-stats-scope-switcher/, 'style.css must style mc-stats-scope-switcher');
  assert.match(ccMcStyle, /\.mc-scope-btn\.is-active/, 'style.css must style active scope button');
});


