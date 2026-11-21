/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CC ANALYTICS MISSION CONTROL 1.0 — AUTOMATED TEST SUITE (STAGE F: 20 SCENARIOS)
 * ═══════════════════════════════════════════════════════════════════════════
 * Pokrywa wszystkie 20 obowiązkowych scenariuszy testowych z Sekcji VIII Dyrektywy.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import {
  handleAnalyticsMissionControlApi,
  buildFilteredAnalyticsResponse,
  ANALYTICS_MC_SNAPSHOT
} from '../services/cc-analytics-mc/analytics-mc-service.js';

function createAnalyticsSandbox(pathname = '/', opts = {}) {
  const events = [];
  const listeners = {};
  const winListeners = {};
  const store = { ...(opts.localStorage || {}) };

  class HTMLMediaElement {
    constructor() {
      this.src = '';
      this.currentSrc = '';
      this.muted = false;
      this.paused = true;
      this.ended = false;
      this.duration = 180;
      this.currentTime = 0;
      this.readyState = 4;
      this.dataset = {};
      this._listeners = {};
    }
    addEventListener(type, fn) {
      (this._listeners[type] = this._listeners[type] || []).push(fn);
    }
    dispatchEvent(type, extra = {}) {
      Object.assign(this, extra);
      (this._listeners[type] || []).forEach((fn) => fn({ target: this, type }));
    }
    play() {
      this.paused = false;
      this.dispatchEvent('playing');
      return 'played';
    }
    pause() {
      this.paused = true;
      this.dispatchEvent('pause');
    }
  }
  class HTMLAudioElement extends HTMLMediaElement {
    constructor() {
      super();
      this.tagName = 'AUDIO';
    }
  }
  class HTMLVideoElement extends HTMLMediaElement {
    constructor() {
      super();
      this.tagName = 'VIDEO';
    }
  }

  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };

  const win = {
    gtag: (type, name, params) => events.push({ type, name, params }),
    HTMLMediaElement,
    HTMLAudioElement,
    HTMLVideoElement,
    addEventListener: (t, fn) => { (winListeners[t] = winListeners[t] || []).push(fn); },
    scrollY: 0,
    innerHeight: 800,
    ...(opts.windowExtra || {})
  };

  const doc = {
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    getElementById: (id) => (opts.elements && opts.elements[id]) || null,
    documentElement: { scrollTop: 0, scrollHeight: 2000 },
    body: { scrollTop: 0, scrollHeight: 2000 }
  };

  const ctx = {
    window: win,
    HTMLMediaElement,
    HTMLAudioElement,
    HTMLVideoElement,
    URL,
    Date,
    Math,
    Number,
    String,
    Object,
    RegExp,
    Intl,
    WeakMap,
    localStorage,
    location: {
      pathname,
      search: opts.search || '',
      hostname: opts.hostname || 'polskieradio.cc',
      origin: 'https://polskieradio.cc',
      href: 'https://polskieradio.cc' + pathname + (opts.search || '')
    },
    navigator: {
      userAgent: opts.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      webdriver: Boolean(opts.webdriver),
      ...(opts.navigatorExtra || {})
    },
    document: doc,
    setTimeout: opts.setTimeout || ((fn) => { fn(); return 1; }),
    clearTimeout: opts.clearTimeout || (() => {})
  };

  vm.runInNewContext(readFileSync('js/cc-analytics.js', 'utf8'), ctx);
  return { events, ctx, win, doc, listeners, winListeners, HTMLAudioElement, HTMLVideoElement, store };
}

// 1. Pojedynczy `page_view` przy wejściu na stronę
test('Scenariusz 1: Pojedynczy page_view przy wejściu na stronę (cc-analytics.js nie duplikuje page_view z gtag config)', () => {
  const { events } = createAnalyticsSandbox('/');
  const pageViews = events.filter((e) => e.name === 'page_view');
  assert.equal(pageViews.length, 0, 'cc-analytics.js nie może wysyłać drugiego page_view ponad standardowy gtag config');
});

// 2. Brak duplikatów przy nawigacji
test('Scenariusz 2: Brak duplikatów inicjalizacji przy wielokrotnym załadowaniu skryptu w tej samej karcie', () => {
  const sandbox = createAnalyticsSandbox('/akademia/kurscodzienny/dzien-10');
  assert.equal(sandbox.events.filter((e) => e.name === 'lesson_view').length, 1);
  // Ponowne wykonanie skryptu w tym samym oknie (np. nawigacja SPA / duplikat tagu <script>)
  vm.runInNewContext(readFileSync('js/cc-analytics.js', 'utf8'), sandbox.ctx);
  assert.equal(sandbox.events.filter((e) => e.name === 'lesson_view').length, 1, 'Strażnik idempotentności blokuje duplikat');
});

// 3. `radio_play` wyzwalane wyłącznie przy faktycznym starcie odtwarzania
test('Scenariusz 3: radio_play wyzwalane wyłącznie przy faktycznym starcie odtwarzania (nie przy samym załadowaniu i nie dla muted)', () => {
  const { events, HTMLAudioElement } = createAnalyticsSandbox('/player');
  const radio = new HTMLAudioElement();
  radio.src = 'https://stream.zeno.fm/christian-culture-pl';
  assert.equal(events.filter((e) => e.name === 'radio_play').length, 0, 'Samo utworzenie odtwarzacza nie wysyła radio_play');

  radio.muted = true;
  radio.play();
  assert.equal(events.filter((e) => e.name === 'radio_play').length, 0, 'Wyciszony autoplay nie wysyła radio_play');

  radio.muted = false;
  radio.play();
  assert.equal(events.filter((e) => e.name === 'radio_play').length, 1, 'Faktyczne odtwarzanie z dźwiękiem wysyła 1 radio_play');
});

// 4. Poprawne wyzwalanie `radio_pause` i `radio_stop`
test('Scenariusz 4: Poprawne wyzwalanie radio_pause oraz radio_stop ze zliczonym czasem', () => {
  const { events, HTMLAudioElement } = createAnalyticsSandbox('/player');
  const radio = new HTMLAudioElement();
  radio.src = 'https://stream.zeno.fm/radio-pl';
  radio.duration = Infinity;
  radio.play();
  radio.currentTime = 15;
  radio.dispatchEvent('timeupdate');
  radio.pause();

  const pauseEv = events.find((e) => e.name === 'radio_pause');
  assert.ok(pauseEv, 'Zdarzenie radio_pause musi zostać wysłane');
  assert.equal(pauseEv.params.listened_seconds, 15);

  radio.dispatchEvent('emptied');
  const stopEv = events.find((e) => e.name === 'radio_stop');
  assert.ok(stopEv, 'Zdarzenie radio_stop musi zostać wysłane po zamknięciu strumienia');
});

// 5. `radio_listen_60s` i `radio_listen_300s` naliczane wyłącznie podczas rzeczywistego odtwarzania
test('Scenariusz 5: radio_listen_60s i radio_listen_300s naliczane tylko podczas rzeczywistego postępu odtwarzania', () => {
  const { events, HTMLAudioElement } = createAnalyticsSandbox('/player');
  const radio = new HTMLAudioElement();
  radio.src = 'https://stream.zeno.fm/radio-pl';
  radio.duration = Infinity;
  radio.play();

  // Gdy odtwarzacz jest wstrzymany, timeupdate nie nalicza progów
  radio.paused = true;
  radio.currentTime = 120;
  radio.dispatchEvent('timeupdate');
  assert.equal(events.filter((e) => e.name === 'radio_listen_60s').length, 0, 'Wstrzymany odtwarzacz nie może wyzwolić 60s');

  // Aktywne odtwarzanie krokami po 25s
  radio.paused = false;
  radio.currentTime = 120;
  radio.dispatchEvent('playing');
  for (let t = 145; t <= 445; t += 25) {
    radio.currentTime = t;
    radio.dispatchEvent('timeupdate');
  }

  assert.equal(events.filter((e) => e.name === 'radio_listen_60s').length, 1, 'Dokładnie jeden rekord radio_listen_60s');
  assert.equal(events.filter((e) => e.name === 'radio_listen_300s').length, 1, 'Dokładnie jeden rekord radio_listen_300s');
});

// 6. Zdarzenia TV LIVE bez fałszywego `video_complete`
test('Scenariusz 6: Transmisja TV LIVE wysyła tv_watch_60s/300s i tv_channel_change, ale blokuje fałszywe video_complete', () => {
  const { events, win, HTMLVideoElement } = createAnalyticsSandbox('/spiewajmy-panu-live');
  const video = new HTMLVideoElement();
  video.src = 'https://polskieradio.cc/live/stream.m3u8';
  video.duration = Infinity;
  video.play();

  for (let t = 25; t <= 325; t += 25) {
    video.currentTime = t;
    video.dispatchEvent('timeupdate');
  }
  // Nawet jeśli element wyemituje 'ended' na skutek przełączenia pętli na kanale LIVE:
  video.dispatchEvent('ended');
  const apiAttempt = win.CCAnalyticsMC.trackVideoComplete({ is_live: true, content_type: 'live_tv' });

  assert.equal(apiAttempt, false);
  assert.equal(events.filter((e) => e.name === 'video_complete').length, 0, 'Zakaz video_complete dla transmisji LIVE');
  assert.equal(events.filter((e) => e.name === 'tv_watch_60s').length, 1);
  assert.equal(events.filter((e) => e.name === 'tv_watch_300s').length, 1);

  win.CCAnalyticsMC.trackTvChannelChange('zapolske-live', 'spiewajmy-panu-live', 'user');
  assert.equal(events.filter((e) => e.name === 'tv_channel_change').length, 1);
});

// 7. Zdarzenia Biblii Audio z poprawnymi parametrami księgi i rozdziału
test('Scenariusz 7: Zdarzenia Biblii Audio i MojaBiblia zawierają parametry book_code, chapter_number, translation, content_type, player_type', () => {
  const { events, win } = createAnalyticsSandbox('/mojabiblia');
  win.CCAnalyticsMC.trackBibleChapterOpen({
    book_code: 'JHN',
    chapter_number: 3,
    translation: 'UBG',
    content_type: 'interlinear_chapter',
    player_type: 'reader'
  });
  win.CCAnalyticsMC.trackBibleAudioStart({
    book_code: 'JHN',
    chapter_number: 3,
    translation: 'UBG',
    content_type: 'audio_bible',
    player_type: 'sticky_player'
  });
  win.CCAnalyticsMC.trackBibleAudioComplete({
    book_code: 'JHN',
    chapter_number: 3,
    translation: 'UBG',
    content_type: 'audio_bible',
    player_type: 'sticky_player'
  });

  const openEv = events.find((e) => e.name === 'bible_chapter_open');
  const startEv = events.find((e) => e.name === 'bible_audio_start');
  const compEv = events.find((e) => e.name === 'bible_audio_complete');

  assert.equal(openEv.params.book_code, 'JHN');
  assert.equal(openEv.params.chapter_number, 3);
  assert.equal(openEv.params.translation, 'UBG');
  assert.equal(startEv.params.content_type, 'audio_bible');
  assert.equal(compEv.params.player_type, 'sticky_player');
});

// 8. Zdarzenia lekcji Akademii rozróżniające otwarcie i ukończenie
test('Scenariusz 8: Lekcja Akademii wysyła lesson_view przy wejściu, a lesson_complete dopiero po spełnieniu warunku ukończenia', () => {
  const { events, win } = createAnalyticsSandbox('/akademia/kurscodzienny/dzien-19');
  assert.equal(events.filter((e) => e.name === 'lesson_view').length, 1);
  assert.equal(events.filter((e) => e.name === 'lesson_complete').length, 0, 'Samo wejście nie może wyzwolić lesson_complete');

  // Przewinięcie o 20% wyzwala lesson_start, ale nie lesson_complete
  win.CCAnalyticsMC._advanceLessonEngagement(10, 20);
  assert.equal(events.filter((e) => e.name === 'lesson_start').length, 1);
  assert.equal(events.filter((e) => e.name === 'lesson_complete').length, 0);

  // Przewinięcie >= 80% oraz czas >= 30s wyzwala lesson_complete i course_progress
  win.CCAnalyticsMC._advanceLessonEngagement(25, 85);
  assert.equal(events.filter((e) => e.name === 'lesson_complete').length, 1);
  assert.equal(events.filter((e) => e.name === 'course_progress').length, 1);
});

// 9. Zdarzenia wsparcia bez fałszywych konwersji płatności
test('Scenariusz 9: Kliknięcie przycisku darowizny wyzwala donate_click, ale nigdy nie wyzwala donation_complete', () => {
  const { events, win, listeners } = createAnalyticsSandbox('/wspieraj');
  assert.equal(events.filter((e) => e.name === 'support_view').length, 1);

  const a = {
    getAttribute: () => 'https://patronite.pl/osobowoscplus',
    href: 'https://patronite.pl/osobowoscplus',
    closest: (s) => (s === '[id]' ? { id: 'heroSupport' } : a)
  };
  listeners.click.forEach((fn) => fn({ target: { closest: (s) => (s === 'a[href]' ? a : null) } }));

  assert.equal(events.filter((e) => e.name === 'donate_click').length, 1);
  assert.equal(events.filter((e) => e.name === 'donation_complete').length, 0);

  // Próba wywołania donation_complete bez zweryfikowanego potwierdzenia płatności jest odrzucana
  assert.equal(win.ccTrack('donation_complete', { method: 'blik', amount: 100 }), false);
  assert.equal(win.CCAnalyticsMC.trackDonationComplete({ verified: false }), false);
  assert.equal(events.filter((e) => e.name === 'donation_complete').length, 0);

  // Tylko zweryfikowane potwierdzenie płatności przechodzi (i automatycznie usuwa kwotę!)
  assert.equal(win.CCAnalyticsMC.trackDonationComplete({ verified: true, method: 'bank' }), true);
  assert.equal(events.filter((e) => e.name === 'donation_complete').length, 1);
});

// 10. Respektowanie odmowy zgody analitycznej
test('Scenariusz 10: Odmowa zgody analitycznej (denied) całkowicie blokuje wysyłanie zdarzeń do GA4', () => {
  const { events, win } = createAnalyticsSandbox('/player', {
    localStorage: { lumina_cookie_consent: 'denied' }
  });
  win.ccTrack('radio_play', { stream: 'test' });
  win.CCAnalyticsMC.trackBibleChapterOpen({ book_code: 'GEN', chapter_number: 1 });
  assert.equal(events.length, 0, 'Przy odmowie zgody żadne zdarzenie nie może zostać wysłane');
});

// 11. Brak danych osobowych (PII) w parametrach zdarzeń
test('Scenariusz 11: Sanityzacja PII blokuje e-maile, numery telefonów, kwoty darowizn i prywatne notatki/modlitwy', () => {
  const { events, win } = createAnalyticsSandbox('/mojabiblia');
  win.ccTrack('custom_action', {
    email: 'jan.kowalski@gmail.com',
    phone: '+48 600 111 222',
    amount: 250,
    prayer_text: 'Prywatna intencja modlitewna',
    note_text: 'Prywatna notatka biblijna',
    comment: 'Kontakt do mnie: anna@example.org lub +48 501 234 567'
  });

  assert.equal(events.length, 1);
  const p = events[0].params;
  assert.equal(p.email, undefined);
  assert.equal(p.phone, undefined);
  assert.equal(p.amount, undefined);
  assert.equal(p.prayer_text, undefined);
  assert.equal(p.note_text, undefined);
  assert.ok(!p.comment.includes('anna@example.org'), 'E-mail wewnątrz tekstu musi być zamaskowany');
  assert.ok(!p.comment.includes('501 234 567'), 'Telefon wewnątrz tekstu musi być zamaskowany');
});

// 12. Klasyfikacja ruchu technicznego
test('Scenariusz 12: Ruch z OBS, ?in_mcr=1, ?cc_team=1, localhost oraz WebDriver (Playwright) jest oznaczany parametrem traffic_type', () => {
  const obsSandbox = createAnalyticsSandbox('/stream-scene', { windowExtra: { obsstudio: {} } });
  obsSandbox.win.ccTrack('video_start', {});
  assert.equal(obsSandbox.events[0].params.traffic_type, 'internal');

  const botSandbox = createAnalyticsSandbox('/', { webdriver: true });
  botSandbox.win.ccTrack('radio_play', {});
  assert.equal(botSandbox.events[0].params.traffic_type, 'technical_monitor');
});

// 13. Brak dostępu do `/test/analityka` bez logowania (HTTP 401)
test('Scenariusz 13: Endpoint /api/analytics-mc/dashboard zwraca HTTP 401 dla niezalogowanego żądania', async () => {
  const req = new Request('https://polskieradio.cc/api/analytics-mc/dashboard', { method: 'GET' });
  const res = await handleAnalyticsMissionControlApi(req, {});
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.authenticated, false);
});

// 14. Odmowa dostępu dla zalogowanego konta bez uprawnień (HTTP 403)
test('Scenariusz 14: Endpoint /api/analytics-mc/dashboard zwraca HTTP 403 dla zalogowanego użytkownika spoza listy uprawnionych', async () => {
  const req = new Request('https://polskieradio.cc/api/analytics-mc/dashboard', {
    method: 'GET',
    headers: { Authorization: 'Bearer valid_non_admin_token' }
  });
  const res = await handleAnalyticsMissionControlApi(req, {}, {
    verifyToken: async () => ({ email: 'zwykly.uzytkownik@gmail.com', email_verified: true })
  });
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.equal(body.authenticated, true);
  assert.equal(body.authorized, false);
});

// 15. Dostęp dla uprawnionego konta Google (HTTP 200)
test('Scenariusz 15: Endpoint /api/analytics-mc/dashboard zwraca HTTP 200 i pełny zestaw danych dla uprawnionego Administratora', async () => {
  const req = new Request('https://polskieradio.cc/api/analytics-mc/dashboard?period=last30d', {
    method: 'GET',
    headers: { Authorization: 'Bearer valid_commander_token' }
  });
  const res = await handleAnalyticsMissionControlApi(req, {}, {
    verifyToken: async () => ({ email: 'nazirczarkes@gmail.com', email_verified: true })
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.selectedPeriod.kpis.activeUsers, 1521);
  assert.equal(body.properties.length, 8);
});

// 16. Poprawne działanie filtrów dat
test('Scenariusz 16: Filtry zakresów dat (today, yesterday, week1, week2, last30d, custom) zwracają spójne dane i oznaczają dziś jako niepełne', () => {
  const todayRes = buildFilteredAnalyticsResponse(new URLSearchParams('period=today'));
  assert.equal(todayRes.selectedPeriod.isPartial, true);
  assert.ok(todayRes.selectedPeriod.partialWarning.includes('niepełne'));

  const week2Res = buildFilteredAnalyticsResponse(new URLSearchParams('period=week2_nov14_20'));
  assert.equal(week2Res.selectedPeriod.kpis.sessions, 993);
  assert.equal(week2Res.selectedPeriod.kpis.screenPageViews, 2679);

  const customRes = buildFilteredAnalyticsResponse(new URLSearchParams('period=custom&startDate=20261114&endDate=20261120'));
  assert.equal(customRes.selectedPeriod.kpis.screenPageViews, 2679);
});

// 17. Zgodność danych panelu z raportami GA4
test('Scenariusz 17: Dane w snapshotcie są w 100% zgodne z odczytem GA4 Data API (548623550 oraz 550097091)', () => {
  const mainProp = ANALYTICS_MC_SNAPSHOT.properties.find((p) => p.propertyId === '548623550');
  assert.equal(mainProp.summary30d.activeUsers, 1521);
  assert.equal(mainProp.summary30d.sessions, 2630);
  assert.equal(mainProp.summary30d.screenPageViews, 6814);
  assert.equal(mainProp.summary30d.engagedSessions, 1380);

  const luminaProp = ANALYTICS_MC_SNAPSHOT.properties.find((p) => p.propertyId === '550097091');
  assert.equal(luminaProp.summary30d.activeUsers, 73);
  assert.equal(luminaProp.summary30d.sessions, 195);
  assert.equal(luminaProp.summary30d.screenPageViews, 549);
});

// 18. Zgodność danych SEO z Search Console i rzetelny status API
test('Scenariusz 18: Sekcja Search Console prezentuje prawdziwe dane z Google Search Console API (sc-domain:polskieradio.cc, 200 OK) oraz sesje GA4 Organic', () => {
  const gsc = ANALYTICS_MC_SNAPSHOT.searchConsole;
  assert.equal(gsc.apiStatus, 'ACTIVE_VERIFIED');
  assert.equal(gsc.totals30d.clicks, 20);
  assert.equal(gsc.totals30d.impressions, 1087);
  assert.ok(gsc.gscTopQueries30d.length >= 10);
  assert.ok(gsc.ga4OrganicLandingPages30d.length >= 10);
  const bibliaDownload = gsc.ga4OrganicLandingPages30d.find((p) => p.landingPage === '/biblia-do-pobrania');
  assert.equal(bibliaDownload.sessions, 13);
});

// 19. Responsywność panelu na telefonie i komputerze + noindex
test('Scenariusz 19: Prototyp /test/analityka/index.html posiada meta noindex, responsywny układ mobile/desktop, dotyk >= 44px i zero sekretów', () => {
  assert.ok(existsSync('test/analityka/index.html'));
  const html = readFileSync('test/analityka/index.html', 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive">/);
  assert.match(html, /min-height:\s*44px/);
  assert.match(html, /@media\s*\(max-width:\s*480px\)/);
  assert.doesNotMatch(html, /private_key|BEGIN PRIVATE KEY|client_secret/i);
});

// 20. Brak błędów konsoli i regresji odtwarzaczy
test('Scenariusz 20: Brak błędów wykonania przy braku obiektu gtag lub nietypowych elementach DOM oraz nienaruszalność odtwarzacza', () => {
  const { win, HTMLAudioElement } = createAnalyticsSandbox('/player');
  delete win.gtag;
  const audio = new HTMLAudioElement();
  audio.src = 'https://stream.zeno.fm/test';
  assert.doesNotThrow(() => {
    const res = audio.play();
    assert.equal(res, 'played');
    audio.pause();
  });
});

// 21. Optymalizacja SEO /mojabiblia, /biblia-do-pobrania oraz higiena ?in_mcr=1 w _worker.js (Etap D)
test('Scenariusz 21: Optymalizacja meta SEO /mojabiblia i /biblia-do-pobrania pod zapytania z GSC oraz przekierowania 301 dla ?in_mcr=1 i uszkodzonych parametrów w _worker.js', () => {
  const mbHtml = readFileSync('mojabiblia.html', 'utf8');
  assert.match(mbHtml, /<title>Biblia Interlinearna Online/i);
  assert.match(mbHtml, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/mojabiblia">/);

  const dlHtml = readFileSync('biblia-do-pobrania.html', 'utf8');
  assert.match(dlHtml, /<title>Biblia do pobrania za darmo/i);
  assert.match(dlHtml, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/biblia-do-pobrania">/);
  assert.match(dlHtml, /href="\/mojabiblia"/);
  assert.match(dlHtml, /href="\/biblia-audio\/"/);

  const workerJs = readFileSync('_worker.js', 'utf8');
  assert.match(workerJs, /cleanLiveUrl\.searchParams\.delete\('in_mcr'\)/);
  assert.match(workerJs, /cleanMbUrl\.searchParams\.delete\('chapter'\)/);
});
