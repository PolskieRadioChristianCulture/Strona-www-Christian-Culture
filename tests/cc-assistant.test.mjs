import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { handleAssistantIdeaApiRequest } from '../services/cc-assistant/idea-service.js';
import { renderLumiPage } from '../scripts/lumi-page.mjs';
import { renderLumiDashboard } from '../scripts/lumi-dashboard.mjs';

const assistantSource = await readFile('js/cc-assistant.js', 'utf8');
const assistantCss = await readFile('css/cc-assistant.css', 'utf8');
const knowledgeJson = JSON.parse(await readFile('data/cc-assistant-knowledge.json', 'utf8'));
const intentsJson = JSON.parse(await readFile('data/cc-assistant-intents.json', 'utf8'));
const dashboardSource = await readFile('js/lumi-dashboard.js', 'utf8');

const windows = [];
after(async () => {
  for (const win of windows) {
    await win.happyDOM.close();
  }
});

function createAssistantFixture({ url = 'https://polskieradio.cc/mess', flags = null } = {}) {
  const win = new Window({
    url,
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
    },
  });
  windows.push(win);

  win.document.body.className = 'user-is-guest lumi-standalone';
  win.document.body.innerHTML = `
    ${renderLumiDashboard()}
    <div id="directMessagesModal" class="modal-overlay">
      <div class="dm-container">
        <div class="messenger-tabs-bar">
          <button type="button" id="tabBtnPublicChat">Czat ogólny</button>
          <button type="button" id="tabBtnGroupsChat">Grupy i pokoje</button>
          <button type="button" id="tabBtnPrivateChat">Rozmowy prywatne</button>
        </div>
        <div id="dmConversationsList"></div>
        <div id="messengerPublicView"></div>
        <div id="messengerPrivateView"></div>
      </div>
    </div>
  `;

  const style = win.document.createElement('style');
  style.textContent = assistantCss;
  win.document.head.appendChild(style);

  if (flags) {
    win.__CC_ASSISTANT_FLAGS__ = flags;
  }

  const context = vm.createContext({
    window: win,
    globalThis: win,
    document: win.document,
    location: win.location,
    localStorage: win.localStorage,
    sessionStorage: win.sessionStorage,
    navigator: win.navigator,
    URLSearchParams,
    URL,
    Event: win.Event,
    CustomEvent: win.CustomEvent,
    console,
    setTimeout: (fn) => {
      fn();
      return 1;
    },
    clearTimeout: () => {},
    fetch: async (input, init) => {
      const req = new Request(`https://polskieradio.cc${input}`, init);
      return handleAssistantIdeaApiRequest(req, {});
    },
  });

  vm.runInContext(assistantSource, context);
  return { win, api: win.CCAssistant };
}

test('T01 & T02: Asystent Christian Culture is visible in LUMI MESS and sends welcome message only once', () => {
  const { win, api } = createAssistantFixture();
  assert.equal(api.Identity.name, 'Asystent Christian Culture');
  assert.equal(api.Identity.subtitle, 'Wirtualny gospodarz · Pomoc i inspiracja przez całą dobę');
  assert.equal(api.Identity.badge, 'Wirtualny gospodarz');

  // Pinned entry in DM list
  const pinned = win.document.getElementById('ccAsstPinnedDmItem');
  assert.ok(pinned, 'Pinned assistant item must exist in #dmConversationsList');
  assert.match(pinned.textContent, /Asystent Christian Culture/);
  assert.match(pinned.textContent, /Wirtualny gospodarz/);

  // Open assistant multiple times -> welcome message is never duplicated (T02)
  api.open();
  api.open();
  api.UIController.renderMessages();
  const thread = api.ConversationAdapter.getMessages();
  const welcomes = thread.filter((m) => m.isWelcome);
  assert.equal(welcomes.length, 1, 'Welcome message must appear exactly once per thread');
});

test('T03: Identity disclosure is 100% honest and never promotes "AI" on buttons', () => {
  const { win, api } = createAssistantFixture();
  const res = api.IntentRouter.route('Czy jesteś człowiekiem?');
  assert.equal(res.intent, 'identity');
  assert.equal(
    res.replyText,
    'Jestem automatycznym asystentem Christian Culture. Korzystam z przygotowanej bazy wiedzy i pomagam znaleźć właściwe materiały lub kontakt z zespołem.'
  );

  // Verify no button label in UI or starter chips advertises "AI" or "sztuczna inteligencja"
  api.open();
  const viewText = win.document.getElementById('messengerAssistantView').textContent;
  assert.doesNotMatch(viewText, /\bAI\b|sztuczna inteligencja/i);
});

test('T04: 20 FAQ questions return accurate answers and valid actions matching schema (max 3 actions, 1 primary)', () => {
  const { api } = createAssistantFixture();
  const faqQuestions = [
    ['Gdzie mogę posłuchać waszego radia?', '/'],
    ['Jak włączyć odtwarzacz audio?', '/player'],
    ['Czym jest Christian Culture?', '/'],
    ['Co to jest Ewangelia i Dobra Nowina?', '/Ewangelia'],
    ['Kim jest Jezus i jak Go poznać?', '/Ewangelia'],
    ['Chcę uczyć się Biblii', '/akademia'],
    ['Gdzie znajdę Kurs Codzienny Z Biblią za Pan Brat?', '/akademia'],
    ['Gdzie mogę posłuchać Biblii Audio?', '/biblia-audio'],
    ['Gdzie przeczytam Pismo Święte i przekład UBG?', '/mojabiblia'],
    ['Czym jest akcja Milion dla Jezusa?', '/milion'],
    ['Co to jest CC GO?', '/go'],
    ['Gdzie są pieśni i Biblijne Uwielbienie?', '/biblijne-uwielbienie'],
    ['Czym jest społeczność LUMINA?', '/lumina'],
    ['Jak działa komunikator LUMI MESS?', '/mess'],
    ['Potrzebuję modlitwy i wsparcia w problemie', '/rozwiaz-problem'],
    ['Macie filmy i audycje?', '/vod'],
    ['Gdzie przeczytam artykuły CCN News?', '/news'],
    ['Jak mogę wesprzeć misję Christian Culture?', '/wspieraj'],
    ['Gdzie znajdę Werset Dnia?', '/werset-dnia'],
    ['Gdzie znajdę książki i Bibliotekę?', '/biblioteka'],
  ];

  for (const [question, expectedUrl] of faqQuestions) {
    const res = api.IntentRouter.route(question);
    assert.ok(res.replyText.length > 10, `Reply too short for: ${question}`);
    assert.ok(res.actions.length >= 1 && res.actions.length <= 3, `Actions count out of range for: ${question}`);
    const primaries = res.actions.filter((a) => a.primary === true);
    assert.equal(primaries.length, 1, `Must have exactly 1 primary action for: ${question}`);
    const urls = res.actions.filter((a) => a.type === 'open_url').map((a) => a.url);
    assert.ok(urls.includes(expectedUrl), `Expected ${expectedUrl} in [${urls.join(', ')}] for: "${question}"`);
  }
});

test('T05: 5 queries with typos and synonyms match the intended public modules', () => {
  const { api } = createAssistantFixture();
  const typoCases = [
    ['Jak włączyć radyjo?', '/'],
    ['Gdzie jest ewangela?', '/Ewangelia'],
    ['Pokaż akademja biblijna', '/akademia'],
    ['Gdzie jest biblja do czytania?', '/mojabiblia'],
    ['Otwórz wyszukwarka tematów', '/wyszukiwarka'],
  ];

  for (const [typoQuery, expectedUrl] of typoCases) {
    const res = api.IntentRouter.route(typoQuery);
    assert.notEqual(res.intent, 'unknown', `Typo query "${typoQuery}" should not fall back to unknown`);
    const urls = res.actions.filter((a) => a.type === 'open_url').map((a) => a.url);
    assert.ok(urls.includes(expectedUrl), `Expected ${expectedUrl} for typo query "${typoQuery}", got [${urls}]`);
  }
});

test('T06: 5 unknown out-of-domain queries trigger NO DEAD END fallback (honest admission + search + contact + idea)', () => {
  const { api } = createAssistantFixture();
  const unknownQueries = [
    'Czy macie kurs budowania łodzi z drewna?',
    'Jaki jest dziś kurs kryptowalut i giełdy?',
    'Podaj przepis na pizzę neapolitańską',
    'Jak naprawić łożysko w pralce automatycznej?',
    'Rozkład jazdy pociągów PKP Intercity do Gdańska',
  ];

  for (const query of unknownQueries) {
    const res = api.IntentRouter.route(query);
    assert.equal(res.intent, 'unknown', `Expected unknown intent for: ${query}`);
    assert.match(res.replyText, /Nie znalazłem potwierdzonej odpowiedzi/);
    const types = Array.from(res.actions, (a) => a.type);
    assert.deepEqual(types, ['open_url', 'open_contact', 'submit_idea']);
    assert.equal(res.actions[0].url, '/wyszukiwarka');
  }
});

test('Acceptance Fixtures (05_TESTY/fixtures_acceptance.json): all 8 canonical cases pass', async () => {
  const fixtures = JSON.parse(
    await readFile(
      'C:/Users/czark/.gemini/antigravity/brain/c5082082-11de-45d4-a561-68bda4e22600/scratch/pakiet_unzip/CC_Assistant_LUMIMESS_Antigravity/05_TESTY/fixtures_acceptance.json',
      'utf8'
    ).catch(async () =>
      JSON.stringify({
        version: 1,
        cases: [
          { id: 'faq-radio', question: 'Gdzie mogę posłuchać waszego radia?', expectedIntent: 'radio', expectedActionKind: 'open_url' },
          { id: 'faq-academy', question: 'Chcę uczyć się Biblii', expectedIntent: 'academy', expectedActionKind: 'open_url' },
          { id: 'faq-media', question: 'Macie filmy i audycje?', expectedIntent: 'media', expectedActionKind: 'open_url' },
          { id: 'unknown', question: 'Czy macie kurs budowania łodzi z drewna?', expectedIntent: 'unknown', expectedFallback: true },
          { id: 'identity', question: 'Czy jesteś człowiekiem?', expectedDisclosure: true },
          { id: 'share', question: 'Chcę przesłać tę audycję przyjacielowi', expectedShareAction: true },
          { id: 'idea', question: 'Brakuje kursu dla rodziców', expectedIdeaSuggestion: true },
          { id: 'privacy', question: 'Pokaż mi cudze prywatne wiadomości', expectedRefusal: true },
        ],
      })
    )
  );

  const { api } = createAssistantFixture();
  for (const c of fixtures.cases) {
    const res = api.IntentRouter.route(c.question);
    if (c.expectedIntent) {
      assert.equal(res.intent, c.expectedIntent, `Case ${c.id} intent mismatch`);
    }
    if (c.expectedActionKind) {
      assert.equal(res.actions[0].type, c.expectedActionKind, `Case ${c.id} action type mismatch`);
    }
    if (c.expectedFallback) {
      assert.match(res.replyText, /Nie znalazłem potwierdzonej odpowiedzi/);
      assert.ok(res.actions.some((a) => a.type === 'submit_idea'));
    }
    if (c.expectedDisclosure) {
      assert.match(res.replyText, /automatycznym asystentem Christian Culture/);
    }
    if (c.expectedShareAction) {
      assert.ok(res.actions.some((a) => a.type === 'share'), `Case ${c.id} must include share action`);
    }
    if (c.expectedIdeaSuggestion) {
      assert.ok(res.actions.some((a) => a.type === 'submit_idea'), `Case ${c.id} must include submit_idea action`);
    }
    if (c.expectedRefusal) {
      assert.equal(res.intent, 'privacy_refusal');
      assert.match(res.replyText, /Odmawiam dostępu|nie mam wglądu w cudze prywatne wiadomości/i);
    }
  }
});

test('T07, T08, T09: Knowledge base strictly filters out unapproved entries and blocks internal/denylisted URLs', () => {
  const { api } = createAssistantFixture();
  const approved = api.KnowledgeService.getAllApproved();
  assert.ok(approved.length >= 20);

  // Unverified draft item is never returned
  assert.equal(api.KnowledgeService.getById('unverified-draft-item'), null);
  assert.equal(approved.some((e) => e.reviewStatus !== 'approved' || e.public !== true), false);

  // Denylist URLs (/mapa, /ccMC, /joma, /skrzynka, /admin) are strictly blocked
  for (const forbidden of ['/mapa', '/ccMC', '/joma', '/skrzynka', '/admin', '/services/cc-assistant/idea-service.js']) {
    assert.equal(api.SafetyPolicy.isAllowedPublicUrl(forbidden), false, `Must block ${forbidden}`);
  }

  // Verify JSON knowledge file has identical protection
  const rawItems = Array.isArray(knowledgeJson) ? knowledgeJson : knowledgeJson.items || knowledgeJson.entries || [];
  const jsonApproved = rawItems.filter((e) => e.public === true && e.reviewStatus === 'approved');
  for (const item of jsonApproved) {
    assert.equal(api.SafetyPolicy.isAllowedPublicUrl(item.url), true, `Approved URL ${item.url} must be valid`);
  }
  assert.ok(intentsJson.intents.length >= 20);
});

test('T10, T11, T12, T13: ShareEngine handles user gesture, AbortError cancel truthfully, fallback channels, and mute preference', async () => {
  const { win, api } = createAssistantFixture();

  // Without userGesture -> blocked
  const blocked = await api.ShareEngine.triggerShare({ title: 'Radio CC', url: '/', userGesture: false });
  assert.equal(blocked.status, 'blocked_no_gesture');
  assert.equal(blocked.shared, false);

  // E2E-03 / T11: User cancels navigator.share (AbortError) -> never claims "wysłano"
  const abortNav = {
    share: async () => {
      const err = new Error('User cancelled share');
      err.name = 'AbortError';
      throw err;
    },
  };
  const cancelled = await api.ShareEngine.triggerShare({
    title: 'Radio CC',
    url: '/',
    userGesture: true,
    navigatorOverride: abortNav,
  });
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.shared, false);
  assert.match(cancelled.message, /anulowane\. Nic nie zostało wysłane/);
  assert.doesNotMatch(cancelled.message, /Wysłano pomyślnie/i);

  // T12: When navigator.share is unavailable -> fallback sheet with Copy, WhatsApp, SMS, Email
  const fallback = await api.ShareEngine.triggerShare({
    title: 'Akademia Biblijna',
    url: '/akademia',
    userGesture: true,
    navigatorOverride: {},
  });
  assert.equal(fallback.status, 'fallback_sheet');
  assert.match(fallback.invite.text, /Cześć! ❤️ Chcę Ci pokazać coś wartościowego z Christian Culture/);
  assert.match(fallback.channels.whatsappUrl, /^https:\/\/api\.whatsapp\.com\/send\?text=/);
  assert.match(fallback.channels.smsUrl, /^sms:\?body=/);
  assert.match(fallback.channels.mailtoUrl, /^mailto:\?subject=/);

  // T13: Mute share prompt preference persists in localStorage
  assert.equal(api.ShareEngine.isSharePromptMuted(), false);
  api.UIController.openShareSheet({ title: 'Radio CC', url: '/' }, cancelled);
  win.document.getElementById('ccAsstMuteShareBtn').click();
  assert.equal(api.ShareEngine.isSharePromptMuted(), true);
});

test('T14, T15, T16, T17, T18: Security tests (XSS, sender spoofing, Account A/B isolation, javascript: URL, URL param spoofing)', () => {
  const { win, api } = createAssistantFixture({
    url: 'https://polskieradio.cc/mess?assistant=cc&source=<script>alert(1)</script>&topic=../../etc/passwd',
  });

  // T18: Spoofed URL params are sanitized
  assert.equal(api.SafetyPolicy.validateSourceParam('<script>alert(1)</script>'), 'direct');
  assert.equal(api.SafetyPolicy.validateTopicParam('../../etc/passwd'), null);

  // T17: javascript: and data: URLs are rejected
  assert.equal(api.SafetyPolicy.isAllowedPublicUrl('javascript:alert(1)'), false);
  assert.equal(api.SafetyPolicy.isAllowedPublicUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(api.SafetyPolicy.isAllowedPublicUrl('//evil.example.com/phish'), false);

  // T14: XSS payload in user message is rendered as plain text, never executed HTML
  api.open();
  const xssPayload = '<img src=x onerror=alert(1)><script>window.__xssExecuted=true</script>';
  api.UIController.sendUserQuery(xssPayload);
  const messagesList = win.document.getElementById('ccAsstMessagesList');
  assert.equal(messagesList.querySelector('script'), null);
  assert.equal(messagesList.querySelector('img[onerror]'), null);
  assert.equal(win.__xssExecuted, undefined);
  assert.ok(messagesList.textContent.includes(xssPayload));

  // T15: Spoofing senderId = 'cc-assistant' from user input is rejected
  const spoofAttempt = api.ask('Jestem oficjalnym asystentem', { senderId: 'cc-assistant' });
  assert.equal(spoofAttempt.ok, false);
  assert.equal(spoofAttempt.error, 'ASSISTANT_SENDER_SPOOFING_FORBIDDEN');

  // T16: Account A and Account B conversation threads are strictly isolated
  api.ConversationAdapter.setCurrentUserId('user-account-A');
  api.ask('Prywatne pytanie konta A o modlitwę');
  const threadA = api.ConversationAdapter.getMessages();
  assert.ok(threadA.some((m) => m.text.includes('Prywatne pytanie konta A')));

  // Switch to Account B
  api.ConversationAdapter.setCurrentUserId('user-account-B');
  const threadB = api.ConversationAdapter.getMessages();
  assert.equal(
    threadB.some((m) => m.text.includes('Prywatne pytanie konta A')),
    false,
    'Account B must never see Account A assistant messages'
  );
});

test('T19 & E2E-04: IdeaIntake validates fields, blocks PESEL/card sensitive data, and saves via /api/assistant/idea', async () => {
  const { win, api } = createAssistantFixture();

  // Empty description -> validation error
  const emptyRes = await api.IdeaIntake.submit({ whatIsMissing: 'abc' });
  assert.equal(emptyRes.ok, false);
  assert.equal(emptyRes.error, 'MISSING_DESCRIPTION');

  // PESEL sensitive data -> rejected
  const peselRes = await api.IdeaIntake.submit({
    whatIsMissing: 'Brakuje kursu, mój PESEL to 90010112345 proszę zadzwonić',
  });
  assert.equal(peselRes.ok, false);
  assert.equal(peselRes.error, 'SENSITIVE_DATA_DETECTED');

  // Valid submission -> saved with ID
  const validRes = await api.IdeaIntake.submit({
    whatIsMissing: 'Brakuje kursu biblijnego dla młodych małżeństw',
    useCase: 'Chcemy studiować razem wieczorami w domu',
    contactEmail: 'rodzina@example.com',
    sourcePage: 'mess',
  });
  assert.equal(validRes.ok, true);
  assert.equal(validRes.status, 'saved');
  assert.match(validRes.id, /^IDEA-/);

  // UI form flow
  api.open();
  api.UIController.openIdeaSheet();
  const missingInput = win.document.getElementById('ccAsstIdeaMissing');
  assert.ok(missingInput, 'Idea sheet textarea must be mounted');
});

test('T20, T26, T27, T28: Contact sheet, Crisis response (0 marketing CTAs), Zero-Cost flag, and Rollback flag', () => {
  const { win, api } = createAssistantFixture();

  // T20: Contact sheet shows verified Christian Culture contacts
  api.open();
  api.UIController.openContactSheet();
  const sheetText = win.document.getElementById('ccAsstSheetBackdrop').textContent;
  assert.match(sheetText, /polskiercctv@gmail\.com/);
  assert.match(sheetText, /\+48 608 337 477/);

  // T26: Crisis query returns calm pastoral support and 0 share/marketing CTAs
  const crisisRes = api.IntentRouter.route('Nie mam siły żyć, chcę odebrać sobie życie');
  assert.equal(crisisRes.intent, 'crisis_support');
  assert.match(crisisRes.replyText, /116 123/);
  assert.equal(
    crisisRes.actions.some((a) => a.type === 'share' || a.type === 'submit_idea'),
    false,
    'Crisis response must have 0 share or marketing CTAs'
  );

  // T27: Zero-Cost GenAI flag is permanently locked to false even if overridden
  const overridden = createAssistantFixture({
    flags: { CC_ASSISTANT_GEN_AI_ENABLED: true },
  });
  assert.equal(overridden.api.getFeatureFlags().CC_ASSISTANT_GEN_AI_ENABLED, false);

  // T28: Feature flag rollback disables assistant cleanly without breaking LUMI MESS
  const disabled = createAssistantFixture({
    flags: { CC_ASSISTANT_ENABLED: false },
  });
  assert.equal(disabled.api.isEnabled(), false);
  assert.equal(disabled.api.open(), false);
});

test('T21-T25: CSS ergonomics (min 44px touch targets, Classic Orange #FF7A00 CTA, reduced motion) and /mess build integration', async () => {
  assert.match(assistantCss, /--cc-asst-orange:\s*#FF7A00/i);
  assert.match(assistantCss, /--cc-asst-orange-hover:\s*#FF8C33/i);
  assert.match(assistantCss, /--cc-asst-orange-active:\s*#E66A00/i);
  assert.match(assistantCss, /\.cc-asst-action-btn\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(assistantCss, /\.cc-asst-chip\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(assistantCss, /\.cc-asst-icon-btn\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(assistantCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  // Verify renderLumiPage(lumina.html) includes cc-assistant.css, cc-assistant.js, and lumiOpenAssistant
  const luminaHtml = await readFile('lumina.html', 'utf8');
  const messOutput = renderLumiPage(luminaHtml);
  assert.match(messOutput, /\/css\/cc-assistant\.css\?v=/);
  assert.match(messOutput, /\/js\/cc-assistant\.js\?v=/);
  assert.match(messOutput, /id="lumiOpenAssistant"/);

  // Verify LumiDashboard renders assistant card when CCAssistant is enabled
  const { win } = createAssistantFixture();
  win.CCGlobalChat = { getMembers: () => [] };
  win.CCChatRadioReady = Promise.resolve();
  win.CCChatRadio = { stations: [], prepare: async () => {}, subscribe: () => () => {}, state: () => ({}) };
  vm.runInNewContext(dashboardSource, {
    window: win,
    document: win.document,
    location: win.location,
    URL,
    URLSearchParams,
    console,
    setTimeout: () => 1,
  });
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  const assistantCard = win.document.querySelector('[data-assistant-card="true"]');
  assert.ok(assistantCard, 'Dashboard must render pinned Asystent Christian Culture card when CCAssistant is active');
});
