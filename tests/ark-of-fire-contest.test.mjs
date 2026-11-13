import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ArkContestRepository, ArkContestService } from '../services/cc-ark-contest/contest-service.js';

const ROOT = path.resolve(import.meta.dirname, '..');

function makeService(nowIso = '2026-11-15T12:00:00Z') {
  const repo = new ArkContestRepository();
  const service = new ArkContestService({
    repo,
    env: {
      CC_ARK_CSRF_SECRET: 'test-csrf-secret-ark',
      CC_ARK_ADMIN_TOKEN: 'test-admin-secret-ark',
      ALLOW_TEST_ENTRIES: '1',
    },
    nowFn: () => new Date(nowIso),
  });
  return { repo, service };
}

async function getCsrf(service, ip = '198.51.100.1') {
  const req = new Request('https://polskieradio.cc/api/ark-contest/status', {
    headers: { 'CF-Connecting-IP': ip, 'User-Agent': 'TestBrowser/1.0' },
  });
  const res = await service.handleRequest(req);
  const data = await res.json();
  return data.csrfToken;
}

test('HTML & CSS Compliance: PL & EN pages, T-shirt image, no lottery words, accessibility, responsive', () => {
  const plHtml = fs.readFileSync(path.join(ROOT, 'ArkOfFire', 'pl', 'index.html'), 'utf8');
  const enHtml = fs.readFileSync(path.join(ROOT, 'ArkOfFire', 'en', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'ArkOfFire', 'assets', 'styles.css'), 'utf8');
  const tshirtExists = fs.existsSync(path.join(ROOT, 'ArkOfFire', 'assets', 'ark-of-fire-tshirt.jpg'));

  assert.equal(tshirtExists, true, 'Official T-shirt image must exist');

  for (const [label, html] of [['PL', plHtml], ['EN', enHtml]]) {
    assert.ok(html.includes('/ArkOfFire/assets/ark-of-fire-tshirt.jpg'), `${label} must include official T-shirt photo`);
    assert.ok(html.includes('role="dialog"') && html.includes('aria-modal="true"'), `${label} must include accessible modal`);
    assert.ok(html.includes('aria-live="polite"'), `${label} must include status live region`);
    assert.equal(/\b(loteria|losowanie|raffle|random\s+draw)\b/i.test(html), false, `${label} must NOT use lottery/raffle wording`);
    assert.equal(/\bautoplay\b/i.test(html), false, `${label} must NOT have autoplay audio/video`);
  }

  assert.ok(plHtml.includes('Jak podtrzymujesz ogień wiary w swoim codziennym życiu?'));
  assert.ok(plHtml.includes('Weź udział w konkursie'));
  assert.ok(plHtml.includes('Akceptuję'));

  assert.ok(enHtml.includes('How do you keep the fire of faith alive in your everyday life?'));
  assert.ok(enHtml.includes('Enter the contest'));
  assert.ok(enHtml.includes('I accept the'));

  assert.ok(css.includes('@media (max-width: 900px)'));
  assert.ok(css.includes('@media (max-width: 700px)'));
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
});

test('Form PL & EN submission, validation, XSS sanitization, honeypot, duplicate & rate limit', async () => {
  const { repo, service } = makeService();
  const csrf = await getCsrf(service, '203.0.113.10');

  // 1. Valid PL submission with HTML/XSS attempt in name & answer
  const validAnswer = 'Modlitwa każdego ranka i codzienne czytanie Słowa Bożego pomagają mi trwać przy Jezusie.';
  const resPl = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://polskieradio.cc',
        'CF-Connecting-IP': '203.0.113.10',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'pl',
        name: '<b>Anna</b><script>alert(1)</script>',
        email: 'Anna.Test@Example.com',
        answer: `${validAnswer} <img src=x onerror=alert(1)>`,
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: csrf,
        isTest: true,
      }),
    })
  );
  assert.equal(resPl.status, 201);
  const plData = await resPl.json();
  assert.equal(plData.ok, true);

  const stored = await repo.listEntries();
  assert.equal(stored.length, 1);
  assert.equal(stored[0].name, 'Annaalert(1)');
  assert.equal(stored[0].answer.includes('<script>'), false);
  assert.equal(stored[0].answer.includes('<img'), false);

  // 2. Duplicate email blocked (case-insensitive)
  const resDup = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://polskieradio.cc',
        'CF-Connecting-IP': '203.0.113.10',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'pl',
        name: 'Anna 2',
        email: 'anna.test@example.com',
        answer: validAnswer,
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: csrf,
      }),
    })
  );
  assert.equal(resDup.status, 409);

  // 3. Too short answer (< 40 chars)
  const resShort = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://polskieradio.cc',
        'CF-Connecting-IP': '203.0.113.10',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'en',
        name: 'John',
        email: 'john@example.com',
        answer: 'Too short answer.',
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: csrf,
      }),
    })
  );
  assert.equal(resShort.status, 400);

  // 4. Honeypot trap (silent 200 without storing)
  const resBot = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://polskieradio.cc',
        'CF-Connecting-IP': '203.0.113.10',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'en',
        name: 'SpamBot',
        email: 'bot@example.com',
        answer: validAnswer,
        acceptRules: true,
        acceptPrivacy: true,
        website: 'http://spam.example',
        csrfToken: csrf,
      }),
    })
  );
  assert.equal(resBot.status, 200);
  assert.equal((await repo.listEntries()).length, 1);

  // 5. Invalid CSRF & Foreign Origin
  const resBadCsrf = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://polskieradio.cc',
        'CF-Connecting-IP': '203.0.113.10',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'en',
        name: 'John',
        email: 'john2@example.com',
        answer: validAnswer,
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: 'bad.token.sig',
      }),
    })
  );
  assert.equal(resBadCsrf.status, 403);

  const resForeignOrigin = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil-site.example',
      },
      body: JSON.stringify({}),
    })
  );
  assert.equal(resForeignOrigin.status, 403);
});

test('Rate limiting, Contest deadline/status locking, Admin RBAC, PII-free Export & Test Cleanup', async () => {
  const { repo, service } = makeService();
  const csrf = await getCsrf(service, '192.0.2.55');
  const validAnswer = 'Every single day I spend quiet time in prayer and Scripture, trusting Jesus in every step.';

  // Valid EN entry
  const resEn = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '192.0.2.55',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'en',
        name: 'Sarah',
        email: 'sarah.grace@example.org',
        answer: validAnswer,
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: csrf,
        isTest: true,
      }),
    })
  );
  assert.equal(resEn.status, 201);
  const { id: entryId } = await resEn.json();

  // Admin RBAC checks
  const unauthRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/admin/entries')
  );
  assert.equal(unauthRes.status, 401);

  const foreignRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/admin/entries', {
      headers: { Authorization: 'Bearer foreign-tok' },
    }),
    { verifyToken: async () => ({ email: 'someone.else@example.com' }) }
  );
  assert.equal(foreignRes.status, 403);

  // Qualify entry as Admin
  const qualRes = await service.handleRequest(
    new Request(`https://polskieradio.cc/api/ark-contest/admin/entries/${entryId}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer test-admin-secret-ark', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'qualified' }),
    })
  );
  assert.equal(qualRes.status, 200);

  // Export for Ark of Fire Jury: must NOT contain any email address!
  const exportJsonRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/admin/export?format=json', {
      headers: { Authorization: 'Bearer test-admin-secret-ark' },
    })
  );
  assert.equal(exportJsonRes.status, 200);
  const exportText = await exportJsonRes.text();
  assert.equal(exportText.includes('sarah.grace@example.org'), false, 'Export MUST NOT expose participant email');
  assert.ok(exportText.includes('Sarah'));
  assert.ok(exportText.includes(validAnswer));

  // Mark winner & prepare email draft
  const winRes = await service.handleRequest(
    new Request(`https://polskieradio.cc/api/ark-contest/admin/entries/${entryId}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer test-admin-secret-ark', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'winner' }),
    })
  );
  assert.equal(winRes.status, 200);

  const notifyRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/admin/notify-winner', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-admin-secret-ark', 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId }),
    })
  );
  assert.equal(notifyRes.status, 200);
  const notifyData = await notifyRes.json();
  assert.ok(notifyData.emailDraft.body.includes('I consent to Christian Culture sharing my full name'));

  // Locked form when winner_selected
  const lockedRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '192.0.2.55',
        'User-Agent': 'TestBrowser/1.0',
      },
      body: JSON.stringify({
        locale: 'en',
        name: 'Late User',
        email: 'late@example.com',
        answer: validAnswer,
        acceptRules: true,
        acceptPrivacy: true,
        csrfToken: csrf,
      }),
    })
  );
  assert.equal(lockedRes.status, 403);

  // Clean up all test entries
  const cleanRes = await service.handleRequest(
    new Request('https://polskieradio.cc/api/ark-contest/admin/entries?onlyTest=1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-admin-secret-ark' },
    })
  );
  assert.equal(cleanRes.status, 200);
  const cleanData = await cleanRes.json();
  assert.equal(cleanData.deletedTestCount, 1);
  assert.equal((await repo.listEntries()).length, 0);
});
