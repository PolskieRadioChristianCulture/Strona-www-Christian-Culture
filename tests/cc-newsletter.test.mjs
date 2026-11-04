// ============================================================================
// EkoCC / CC NEWSLETTER — Automatyczny Zestaw Testów Akceptacyjnych (T01–T24)
// Identyfikator: CCNL-009 | Uruchomienie: node --test tests/cc-newsletter.test.mjs
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Window } from 'happy-dom';
import worker from '../_worker.js';
import {
  NewsletterRepository,
  NewsletterService,
  handleNewsletterApiRequest,
  hmacSha256Hex,
  sha256Hex,
  validateCampaignCompliance,
} from '../services/cc-newsletter/newsletter-service.js';

const ROOT = process.cwd();

function createTestService(overrides = {}) {
  let currentNow = overrides.initialDate ? new Date(overrides.initialDate) : new Date('2026-10-30T10:00:00.000Z');
  const repo = new NewsletterRepository(null);
  const env = {
    NEWSLETTER_DELIVERY_ENABLED: 'false',
    NEWSLETTER_PUBLIC_BASE_URL: 'https://polskieradio.cc',
    NEWSLETTER_CONSENT_VERSION: '2026-10-30-v1',
    NEWSLETTER_HASH_SALT: 'test-salt-2026',
    NEWSLETTER_ADMIN_SECRET: 'test-admin-secret-2026',
    NEWSLETTER_WEBHOOK_SECRET: 'test-webhook-secret-2026',
    NEWSLETTER_DAILY_QUOTA_LIMIT: '100',
    ...overrides.env,
  };
  const service = new NewsletterService({
    repo,
    env,
    nowFn: () => currentNow,
  });
  return {
    repo,
    service,
    env,
    advanceTimeMs(ms) {
      currentNow = new Date(currentNow.getTime() + ms);
    },
    extractTokenFromLastEmail(paramName = 'token') {
      const last = repo.mem.outbox[repo.mem.outbox.length - 1];
      assert.ok(last, 'Expected an email in outbox');
      const match = last.text.match(new RegExp(`[?&]${paramName}=([A-Za-z0-9_-]+)`));
      assert.ok(match && match[1], `Expected ${paramName} in email body`);
      return match[1];
    },
  };
}

test('THE JOURNAL: dedicated topic survives double opt-in without implicit enrollment in other lists',async()=>{
  const {service,repo,extractTokenFromLastEmail}=createTestService();
  const response=await service.subscribe({email:'journal.test@example.com',topics:['the-journal'],consentAccepted:true,sourcePortal:'the-journal',sourcePath:'/the-journal'},{ip:'198.51.100.19',userAgent:'TestAgent'});
  assert.equal(response.status,200);
  const pending=await repo.findSubscriberByEmail('journal.test@example.com');
  assert.equal(pending.status,'pending_confirmation');
  assert.deepEqual(await repo.getSubscriberTopics(pending.id),['the-journal']);
  const confirmed=await service.confirmSubscription(extractTokenFromLastEmail(),{ip:'198.51.100.19',userAgent:'TestAgent'});
  assert.equal(confirmed.body.status,'active');
  assert.deepEqual(await repo.getSubscriberTopics(pending.id),['the-journal']);
});

test('THE JOURNAL: shared newsletter uses the response nonce, checks only its topic, and leaves consent unchecked',()=>{
  const win=new Window({url:'https://polskieradio.cc/the-journal'});
  const meta=win.document.createElement('meta');meta.name='cc-csp-nonce';meta.content='journal-test-nonce';win.document.head.append(meta);
  win.eval(fs.readFileSync(path.join(ROOT,'js/cc-newsletter.js'),'utf8'));
  const dialog=win.CCNewsletter.open();
  assert.equal(win.document.querySelector('#cc-newsletter-styles').nonce,'journal-test-nonce');
  assert.deepEqual([...dialog.querySelectorAll('input[name="cc_nl_topic"]:checked')].map(input=>input.value),['the-journal']);
  assert.equal(dialog.querySelector('#ccNlConsentCheckbox').checked,false);
});

test('THE JOURNAL: shared edge opens on desktop, reuses one trigger, and nonce-protects edge and back-to-top styles',()=>{
  const win=new Window({url:'https://polskieradio.cc/the-journal',width:1280,height:900,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
  const meta=win.document.createElement('meta');meta.name='cc-csp-nonce';meta.content='journal-ui-nonce';win.document.head.append(meta);
  const marker=win.document.createElement('script');marker.dataset.ccEdgeProfile='journal';win.document.head.append(marker);
  const trigger=win.document.createElement('button');trigger.textContent='+';win.document.body.append(trigger);
  win.eval(fs.readFileSync(path.join(ROOT,'js/cc-mobile-edge.js'),'utf8'));
  const edge=win.CCMobileEdge.mount({legacy:trigger,placement:trigger,trigger,profile:'journal',allowDesktop:true,canUseFullMenu:()=>false});
  assert.equal(win.matchMedia('(max-width: 767px)').matches,false);
  trigger.click();assert.equal(edge.dialog.open,true);
  assert.equal(win.document.querySelectorAll('#cc-mobile-edge-dialog').length,1);
  assert.equal(win.document.getElementById('cc-mobile-edge-2col-style').nonce,'journal-ui-nonce');
  edge.close();assert.equal(edge.dialog.open,false);
  win.eval(fs.readFileSync(path.join(ROOT,'js/cc-back-to-top.js'),'utf8'));
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  assert(win.document.querySelector('#backToTopBtn'));
  assert([...win.document.head.querySelectorAll('style')].some(s=>s.nonce==='journal-ui-nonce'&&s.textContent.includes('#backToTopBtn')));
  win.happyDOM.abort();
});

test('T01: Checkbox zgody w formularzu jest domyślnie odznaczony (unchecked by default)', () => {
  const win = new Window({ url: 'https://polskieradio.cc/newsletter' });
  const container = win.document.createElement('div');
  win.document.body.appendChild(container);
  const scriptCode = fs.readFileSync(path.join(ROOT, 'js/cc-newsletter.js'), 'utf8');
  win.eval(scriptCode);

  win.CCNewsletter.mountInline(container, { sourcePortal: 'polskieradio-home' });
  const consentCheckbox = container.querySelector('#ccNlConsentCheckbox');
  assert.ok(consentCheckbox, 'Consent checkbox must exist');
  assert.equal(consentCheckbox.checked, false, 'Consent checkbox must be unchecked by default (RODO P0)');
});

test('T02: Próba wysłania formularza bez zaznaczonej zgody jest odrzucana (400 CONSENT_REQUIRED) i nie zapisuje rekordu w DB', async () => {
  const { service, repo } = createTestService();
  const res = await service.subscribe(
    {
      email: 'nowy@example.com',
      consentAccepted: false,
      topics: ['nowosci-ekocc'],
    },
    { ip: '198.51.100.10', userAgent: 'Mozilla/5.0' }
  );
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'CONSENT_REQUIRED');
  assert.equal(repo.mem.subscribers.size, 0, 'Database must have 0 subscribers when consent is not accepted');
  assert.equal(repo.mem.outbox.length, 0, 'No email may be queued when consent is missing');
});

test('T03: Zapis nowego adresu e-mail tworzy rekord pending_confirmation, loguje dowód zgody i zwraca neutralną odpowiedź', async () => {
  const { service, repo } = createTestService();
  const res = await service.subscribe(
    {
      email: 'Jan.Kowalski+ekocc@Example.com',
      firstName: 'Jan',
      locale: 'pl',
      sourcePortal: 'akademia',
      sourcePath: '/akademia',
      topics: ['biblia-akademia', 'nowosci-ekocc'],
      consentAccepted: true,
    },
    { ip: '198.51.100.11', userAgent: 'TestAgent/1.0' }
  );

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.neutral, true);

  const sub = await repo.findSubscriberByEmail('jan.kowalski+ekocc@example.com');
  assert.ok(sub, 'Normalized subscriber with +tag alias preserved must exist');
  assert.equal(sub.status, 'pending_confirmation');
  assert.equal(sub.source_portal, 'akademia');

  const events = await repo.getConsentEvents(sub.id);
  assert.equal(events.length, 1);
  assert.equal(events[0].event_type, 'subscribe_requested');
  assert.notEqual(events[0].ip_hash, '198.51.100.11', 'Raw IP must never be stored in consent events');
  assert.equal(events[0].ip_hash.length, 64, 'IP hash must be SHA-256 hex');
});

test('T04: Ponowne zgłoszenie istniejącego adresu active zwraca identyczny neutralny komunikat bez duplikatu w bazie', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();

  const first = await service.subscribe(
    { email: 'active.user@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.12', userAgent: 'UA' }
  );
  const confirmToken = extractTokenFromLastEmail('token');
  await service.confirmSubscription(confirmToken, { ip: '198.51.100.12', userAgent: 'UA' });

  const second = await service.subscribe(
    { email: 'active.user@example.com', consentAccepted: true, topics: ['muzyka-radio-tv'] },
    { ip: '198.51.100.13', userAgent: 'UA' }
  );

  assert.equal(second.status, 200);
  assert.equal(second.body.message, first.body.message, 'Public message must be identical (anti-enumeration)');
  assert.equal(repo.mem.subscribers.size, 1, 'Must not create duplicate subscriber rows');
  const updatedTopics = await repo.getSubscriberTopics([...repo.mem.subscribers.values()][0].id);
  assert.deepEqual(updatedTopics, ['muzyka-radio-tv']);
});

test('T05: Subskrybent ze statusem pending_confirmation NIE otrzymuje żadnej kampanii przed potwierdzeniem DOI', async () => {
  const { service, repo } = createTestService();
  await service.subscribe(
    { email: 'unconfirmed@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.20', userAgent: 'UA' }
  );

  const camp = await repo.saveCampaign({
    subject_pl: 'Tygodniowy przegląd EkoCC',
    html_body: '<h2>Nowości EkoCC</h2><p><a href="https://polskieradio.cc/news">Czytaj więcej</a></p>',
    text_body: 'Nowości EkoCC: https://polskieradio.cc/news',
    topics: ['nowosci-ekocc'],
  });
  await service.approveCampaign(camp.id, 'admin');
  const sendRes = await service.sendCampaign(camp.id);

  assert.equal(sendRes.status, 200);
  assert.equal(sendRes.body.sentCount, 0, 'Pending subscriber must receive 0 campaign emails');
});

test('T06 & T07: Ochrona przed skanerem linków na GET /confirm (brak aktywacji na GET) oraz aktywacja dopiero po POST /api/newsletter/confirm', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'scanner.safe@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.30', userAgent: 'UA' }
  );
  const rawToken = extractTokenFromLastEmail('token');

  // Symulacja automatycznego skanera antyfishingowego wykonującego GET
  const getCheck = await service.inspectToken(rawToken, 'confirm');
  assert.equal(getCheck.status, 200);
  assert.equal(getCheck.body.valid, true);

  const subAfterGet = await repo.findSubscriberByEmail('scanner.safe@example.com');
  assert.equal(subAfterGet.status, 'pending_confirmation', 'GET must NEVER activate the subscription');

  // Właściwe potwierdzenie przez człowieka metodą POST
  const postConfirm = await service.confirmSubscription(rawToken, { ip: '198.51.100.30', userAgent: 'UA' });
  assert.equal(postConfirm.status, 200);
  assert.equal(postConfirm.body.status, 'active');

  const subAfterPost = await repo.findSubscriberByEmail('scanner.safe@example.com');
  assert.equal(subAfterPost.status, 'active');
  assert.ok(subAfterPost.confirmed_at, 'confirmed_at timestamp must be set');
});

test('T08: Zużyty lub wygasły token potwierdzenia zwraca błąd 400 i nie zmienia stanu subskrybenta', async () => {
  const { service, extractTokenFromLastEmail, advanceTimeMs } = createTestService();
  await service.subscribe(
    { email: 'expired@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.40', userAgent: 'UA' }
  );
  const rawToken = extractTokenFromLastEmail('token');

  // Przesuń zegar o 49 godzin (powyżej TTL 48h)
  advanceTimeMs(49 * 3600 * 1000);

  const expiredRes = await service.confirmSubscription(rawToken, { ip: '198.51.100.40', userAgent: 'UA' });
  assert.equal(expiredRes.status, 400);
  assert.equal(expiredRes.body.error, 'TOKEN_EXPIRED');
});

test('T09: Zmiana kategorii tematycznych aktualizuje newsletter_preferences i dopisuje zdarzenie audytowe', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'prefs@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.50', userAgent: 'UA' }
  );
  const confirmToken = extractTokenFromLastEmail('token');
  const confirmed = await service.confirmSubscription(confirmToken, { ip: '198.51.100.50', userAgent: 'UA' });
  const manageToken = confirmed.body.manageToken;

  const updateRes = await service.updatePreferences(
    {
      token: manageToken,
      topics: ['biblia-akademia', 'ksiazki-literatura'],
      locale: 'en',
    },
    { ip: '198.51.100.50', userAgent: 'UA' }
  );

  assert.equal(updateRes.status, 200);
  assert.deepEqual(updateRes.body.topics, ['biblia-akademia', 'ksiazki-literatura']);

  const sub = await repo.findSubscriberByEmail('prefs@example.com');
  const events = await repo.getConsentEvents(sub.id);
  assert.ok(events.some((e) => e.event_type === 'preferences_updated'));
});

test('T10 & T11: Wypis jednym kliknięciem (POST /api/newsletter/unsubscribe) jest natychmiastowy i idempotentny', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'unsub@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.60', userAgent: 'UA' }
  );
  const confirmToken = extractTokenFromLastEmail('token');
  const confirmed = await service.confirmSubscription(confirmToken, { ip: '198.51.100.60', userAgent: 'UA' });
  const manageToken = confirmed.body.manageToken;

  // Pierwszy wypis
  const firstUnsub = await service.unsubscribe(manageToken, { ip: '198.51.100.60', userAgent: 'UA', oneClick: true });
  assert.equal(firstUnsub.status, 200);
  assert.equal(firstUnsub.body.status, 'unsubscribed');

  // Drugi wypis tym samym tokenem (idempotentność T11 — brak błędu 500)
  const secondUnsub = await service.unsubscribe(manageToken, { ip: '198.51.100.60', userAgent: 'UA', oneClick: true });
  assert.equal(secondUnsub.status, 200);
  assert.equal(secondUnsub.body.status, 'unsubscribed');

  const sub = await repo.findSubscriberByEmail('unsub@example.com');
  assert.equal(sub.status, 'unsubscribed');
});

test('T12: Ponowny zapis po wypisie wymaga pełnego nowego potwierdzenia Double Opt-In (nie aktywuje od razu)', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'resub@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.70', userAgent: 'UA' }
  );
  const confirmToken = extractTokenFromLastEmail('token');
  const confirmed = await service.confirmSubscription(confirmToken, { ip: '198.51.100.70', userAgent: 'UA' });
  await service.unsubscribe(confirmed.body.manageToken, { ip: '198.51.100.70', userAgent: 'UA' });

  // Ponowny zapis
  await service.subscribe(
    { email: 'resub@example.com', consentAccepted: true, topics: ['muzyka-radio-tv'] },
    { ip: '198.51.100.71', userAgent: 'UA' }
  );
  const sub = await repo.findSubscriberByEmail('resub@example.com');
  assert.equal(sub.status, 'pending_confirmation', 'Re-subscribing must set pending_confirmation, never active immediately');
});

test('T13 & T14: Webhooki hard_bounce i spam_complaint blokują adres w newsletter_suppressions', async () => {
  const { service, repo, env, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'bounce@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.80', userAgent: 'UA' }
  );
  await service.confirmSubscription(extractTokenFromLastEmail('token'), {});

  await service.subscribe(
    { email: 'complaint@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.81', userAgent: 'UA' }
  );
  await service.confirmSubscription(extractTokenFromLastEmail('token'), {});

  const bouncePayload = JSON.stringify({ event: 'hard_bounce', email: 'bounce@example.com', reason: '550 User unknown' });
  const bounceSig = await hmacSha256Hex(env.NEWSLETTER_WEBHOOK_SECRET, bouncePayload);
  const resBounce = await service.handleDeliveryWebhook(bouncePayload, bounceSig);
  assert.equal(resBounce.status, 200);
  assert.equal((await repo.findSubscriberByEmail('bounce@example.com')).status, 'bounced');
  assert.ok(await repo.getSuppression(await sha256Hex('bounce@example.com')));

  const complaintPayload = JSON.stringify({ event: 'spam_complaint', email: 'complaint@example.com', reason: 'FBL' });
  const complaintSig = await hmacSha256Hex(env.NEWSLETTER_WEBHOOK_SECRET, complaintPayload);
  const resComplaint = await service.handleDeliveryWebhook(complaintPayload, complaintSig);
  assert.equal(resComplaint.status, 200);
  assert.equal((await repo.findSubscriberByEmail('complaint@example.com')).status, 'complained');
  assert.ok(await repo.getSuppression(await sha256Hex('complaint@example.com')));
});

test('T15: Rate limiting blokuje nadmiarowe próby zapisu zwracając 429 RATE_LIMITED', async () => {
  const { service } = createTestService();
  for (let i = 0; i < 3; i++) {
    const okRes = await service.subscribe(
      { email: 'flood@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
      { ip: '198.51.100.90', userAgent: 'UA' }
    );
    assert.equal(okRes.status, 200);
  }
  const blocked = await service.subscribe(
    { email: 'flood@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.90', userAgent: 'UA' }
  );
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error, 'RATE_LIMITED');
});

test('T16: W tabeli newsletter_tokens przechowywany jest wyłącznie skrót SHA-256 (nigdy surowy token)', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();
  await service.subscribe(
    { email: 'hashcheck@example.com', consentAccepted: true, topics: ['nowosci-ekocc'] },
    { ip: '198.51.100.95', userAgent: 'UA' }
  );
  const rawToken = extractTokenFromLastEmail('token');
  assert.equal(repo.mem.tokens.has(rawToken), false, 'Raw token must never be stored as a key or value');
  for (const row of repo.mem.tokens.values()) {
    assert.notEqual(row.token_hash, rawToken);
    assert.match(row.token_hash, /^[a-f0-9]{64}$/, 'Stored token_hash must be a 64-char SHA-256 hex digest');
  }
});

test('T17: Endpointy administracyjne /api/newsletter/admin/* zwracają 401 bez autoryzacji RBAC', async () => {
  const req = new Request('https://polskieradio.cc/api/newsletter/admin/overview', { method: 'GET' });
  const res = await handleNewsletterApiRequest(req, { NEWSLETTER_ADMIN_SECRET: 'secret-123' });
  assert.equal(res.status, 401);
});

test('T18: Bramka zgodności (Compliance Gate) blokuje zatwierdzenie kampanii z niebezpiecznym linkiem lub bez stopki wypisu', async () => {
  const { service, repo } = createTestService();
  const unsafeCamp = await repo.saveCampaign({
    subject_pl: 'Niebezpieczna kampania',
    html_body: '<p>Kliknij <a href="http://niebezpieczna-domena.pl">tutaj</a><!-- NO_UNSUBSCRIBE --></p>',
    text_body: 'Tekst kampanii testowej',
  });
  const approveRes = await service.approveCampaign(unsafeCamp.id, 'admin');
  assert.equal(approveRes.status, 400);
  assert.equal(approveRes.body.error, 'COMPLIANCE_FAILED');
  assert.ok(approveRes.body.details.some((e) => e.includes('MISSING_UNSUBSCRIBE_LINK')));
  assert.ok(approveRes.body.details.some((e) => e.includes('INSECURE_HTTP_LINK')));
});

test('T19 & T20: Kampania trafia wyłącznie do aktywnych subskrybentów danej kategorii i jest w 100% idempotentna (brak duplikatów)', async () => {
  const { service, repo, extractTokenFromLastEmail } = createTestService();

  // Subskrybent 1: active, kategoria muzyka-radio-tv
  await service.subscribe(
    { email: 'music.fan@example.com', consentAccepted: true, topics: ['muzyka-radio-tv'] },
    { ip: '198.51.100.101', userAgent: 'UA' }
  );
  await service.confirmSubscription(extractTokenFromLastEmail('token'), {});

  // Subskrybent 2: active, kategoria biblia-akademia
  await service.subscribe(
    { email: 'bible.student@example.com', consentAccepted: true, topics: ['biblia-akademia'] },
    { ip: '198.51.100.102', userAgent: 'UA' }
  );
  await service.confirmSubscription(extractTokenFromLastEmail('token'), {});

  const camp = await repo.saveCampaign({
    subject_pl: 'Premiera muzyczna w Radio CC',
    html_body: '<h2>Nowy utwór</h2><p><a href="https://polskieradio.cc/player">Słuchaj w Playerze</a></p>',
    text_body: 'Nowy utwór: https://polskieradio.cc/player',
    topics: ['muzyka-radio-tv'],
  });
  await service.approveCampaign(camp.id, 'admin');

  const firstSend = await service.sendCampaign(camp.id);
  assert.equal(firstSend.status, 200);
  assert.equal(firstSend.body.sentCount, 1, 'Only the 1 subscriber subscribed to muzyka-radio-tv must receive the campaign');

  // Ponowne wywołanie wysyłki tej samej kampanii (idempotentność T19)
  const secondSend = await service.sendCampaign(camp.id);
  assert.equal(secondSend.status, 200);
  assert.equal(secondSend.body.idempotent, true);
  const deliveries = await repo.getDeliveriesForCampaign(camp.id);
  assert.equal(deliveries.length, 1, 'Duplicate send call must not create duplicate deliveries');
});

test('T21, T22 & T23: Integracja w panelu + (js/cc-mobile-edge.js), dostępność ARIA, responsywność 320px+ i i18n PL/EN/DE', () => {
  const edgeCode = fs.readFileSync(path.join(ROOT, 'js/cc-mobile-edge.js'), 'utf8');
  assert.ok(edgeCode.includes("['mail','LIVE LETTER • Newsletter CC','/newsletter']"), 'Edge panel must include Newsletter item');
  assert.ok(edgeCode.includes("mail: 'Newsletter — Stay in touch'"), 'Edge panel must include English translation');
  assert.ok(edgeCode.includes("mail: 'Newsletter — In Kontakt bleiben'"), 'Edge panel must include German translation');

  const win = new Window({ url: 'https://polskieradio.cc/wyszukiwarka', width: 320, height: 640 });
  win.document.body.innerHTML = '<button id="ccOmniEdgeBtn"></button>';
  win.matchMedia = () => ({ matches: true, addEventListener() {} });
  win.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    this.setAttribute('open', '');
  };
  win.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.removeAttribute('open');
  };

  win.eval(fs.readFileSync(path.join(ROOT, 'js/cc-newsletter.js'), 'utf8'));
  win.eval(edgeCode);

  const edgeDialog = win.document.getElementById('cc-mobile-edge-dialog');
  assert.ok(edgeDialog, 'Edge dialog must mount');
  const mailLink = edgeDialog.querySelector('a[data-edge-key="mail"]');
  assert.ok(mailLink, 'Mail link must exist inside the + edge panel');
  assert.equal(mailLink.getAttribute('href'), '/newsletter');
  assert.equal(mailLink.getAttribute('aria-label'), 'Newsletter — Bądźmy w kontakcie');

  // Kliknięcie pozycji Newsletter w panelu + otwiera modal CCNewsletter
  mailLink.click();
  const nlDialog = win.document.getElementById('cc-newsletter-dialog');
  assert.ok(nlDialog && nlDialog.hasAttribute('open'), 'Clicking Newsletter in + panel must open CCNewsletter dialog');
  assert.equal(nlDialog.querySelector('#ccNlConsentCheckbox').checked, false);
});

test('T24: Bezpiecznik NEWSLETTER_DELIVERY_ENABLED=false gwarantuje tryb dry_run_queued oraz poprawne nagłówki bezpieczeństwa na /newsletter/*', async () => {
  const { service } = createTestService();
  assert.equal(service.isDeliveryEnabled(), false, 'Delivery must be disabled by default (ZERO COST)');

  const fakeEnv = {
    ASSETS: {
      fetch: async () => new Response('<!doctype html><html><body>Newsletter</body></html>', { status: 200 }),
    },
  };

  const confirmPageRes = await worker.fetch(
    new Request('https://polskieradio.cc/newsletter/confirm?token=secret_token_123'),
    fakeEnv
  );
  assert.equal(confirmPageRes.status, 200);
  assert.match(confirmPageRes.headers.get('Cache-Control') || '', /no-store/);
  assert.match(confirmPageRes.headers.get('X-Robots-Tag') || '', /noindex/);
  assert.equal(confirmPageRes.headers.get('Referrer-Policy'), 'no-referrer');
});

test('T25: unavailable persistent statistics return 503, no fabricated zero and no PII', async()=>{
 const res=await worker.fetch(new Request('https://polskieradio.cc/api/newsletter/public-stats'),{});
 assert.equal(res.status,503);assert.match(res.headers.get('Cache-Control'),/no-store/);const data=await res.json();assert.equal(data.confirmed_active_subscribers,undefined);assert.equal(data.email,undefined);assert.equal(data.subscribers,undefined);assert.equal(data.tokens,undefined);
});
test('T26: public statistics expose only a validated confirmed aggregate with cache, and reject filters/methods',async()=>{
 const newsletter_db={prepare(sql){assert.match(sql,/COUNT\(DISTINCT email_normalized\)/);assert.match(sql,/confirmed_at IS NOT NULL/);return {first:async()=>({active_count:12})};}};
 const res=await worker.fetch(new Request('https://polskieradio.cc/api/newsletter/public-stats'),{newsletter_db});assert.equal(res.status,200);assert.match(res.headers.get('Cache-Control'),/max-age=300/);const data=await res.json();assert.equal(data.confirmed_active_subscribers,12);assert.deepEqual(Object.keys(data).sort(),['confirmed_active_subscribers','display','updated_at']);
 for(const [suffix,method,status] of [['?email=synthetic@example.invalid','GET',400],['','POST',405]]){const result=await worker.fetch(new Request('https://polskieradio.cc/api/newsletter/public-stats'+suffix,{method}),{newsletter_db});assert.equal(result.status,status);}
});
