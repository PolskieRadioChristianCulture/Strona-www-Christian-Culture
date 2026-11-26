/**
 * CHRISTIAN CULTURE — ODKRYJ BIBLIĘ (/test/katolik -> /katolik)
 * Pełna aplikacja webowa (zero atrap, prawdziwe dane UBG-2025, Plan 365 dni, Biblia Audio, FAQ, studia).
 * Prywatność: wyłącznie neutralne zdarzenia techniczne GA4 (module_open, reading_plan_start,
 * reading_day_complete, audio_open, link_error) — zero wysyłania modlitw, pytań duchowych ani przekonań.
 */
import {
  PROGRESS_STORAGE_KEY,
  AUDIO_RESUME_KEY,
  THEME_STORAGE_KEY,
  escapeHtml,
  isSafeUrl,
  todayWarsawIso,
  isValidIsoDate,
  addDaysIso,
  createDefaultProgress,
  validateAndSanitizeProgress,
  computeProgressMetrics,
  parseKatolikRoute,
  filterBooks,
  filterFaq,
  normalizePolish,
} from './katolik-core.js';

const mainEl = document.getElementById('mainContent');
const breadcrumbsWrap = document.getElementById('breadcrumbsWrap');
const breadcrumbsList = document.getElementById('breadcrumbsList');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerScrim = document.getElementById('drawerScrim');
const menuOpenBtn = document.getElementById('menuOpenBtn');
const menuCloseBtn = document.getElementById('menuCloseBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const statusToast = document.getElementById('statusToast');

const readerDialog = document.getElementById('readerDialog');
const readerTitle = document.getElementById('readerTitle');
const readerSubtitle = document.getElementById('readerSubtitle');
const readerBody = document.getElementById('readerBody');
const readerCloseBtn = document.getElementById('readerCloseBtn');
const readerPrevBtn = document.getElementById('readerPrevBtn');
const readerNextBtn = document.getElementById('readerNextBtn');
const readerFullLink = document.getElementById('readerFullLink');

const resetDialog = document.getElementById('resetDialog');
const resetCloseBtn = document.getElementById('resetCloseBtn');
const resetCancelBtn = document.getElementById('resetCancelBtn');
const resetConfirmBtn = document.getElementById('resetConfirmBtn');

const state = {
  basePath: parseKatolikRoute(location.pathname).basePath,
  booksData: null,
  planData: null,
  studiesData: null,
  audioCatalog: null,
  audioError: null,
  wznData: null,
  wznError: null,
  dataError: null,
  storageAvailable: true,
  progress: createDefaultProgress(todayWarsawIso()),
  // Filtry i stan widoków
  bookFilter: { query: '', testament: 'ALL', genre: 'ALL', theme: 'ALL', timelineMode: 'scroll' },
  faqFilter: { query: '', category: 'ALL' },
  planSelectedDay: null,
  planMode: '365', // '365' | 'starter'
  audioFilter: 'published', // 'published' | 'all'
  aiLocalQuery: '',
  readerState: { bookId: 'JHN', chapter: 1, highlightStart: null, highlightEnd: null },
};

// ── Neutralne zdarzenia techniczne GA4 (zgodnie z sekcją 11 specyfikacji) ──
function trackNeutral(eventName, params = {}) {
  try {
    if (typeof window.ccTrack === 'function') {
      window.ccTrack(eventName, params);
    }
  } catch {
    // Brak wpływu na UX
  }
}

let toastTimer = null;
function showToast(msg) {
  if (!statusToast) return;
  statusToast.textContent = msg;
  statusToast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    statusToast.hidden = true;
  }, 3400);
}

// ── Bezpieczny odczyt / zapis localStorage ──
function loadProgress() {
  try {
    const testKey = '__cc_katolik_probe__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    state.storageAvailable = true;
    const rawStr = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!rawStr) {
      state.progress = createDefaultProgress(todayWarsawIso());
      return;
    }
    const parsed = JSON.parse(rawStr);
    const check = validateAndSanitizeProgress(parsed, todayWarsawIso());
    state.progress = check.ok ? check.progress : createDefaultProgress(todayWarsawIso());
  } catch {
    state.storageAvailable = false;
    state.progress = createDefaultProgress(todayWarsawIso());
  }
}

function saveProgress() {
  state.progress.updatedAt = new Date().toISOString();
  if (!state.storageAvailable) return false;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state.progress));
    return true;
  } catch {
    state.storageAvailable = false;
    return false;
  }
}

function loadAudioResume() {
  try {
    const raw = localStorage.getItem(AUDIO_RESUME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAudioResume(item) {
  try {
    localStorage.setItem(AUDIO_RESUME_KEY, JSON.stringify(item));
  } catch {
    // ignoruj brak storage
  }
}

// ── Motyw jasny / ciemny ──
function syncThemeUI() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (themeToggleIcon) themeToggleIcon.textContent = isLight ? '☾' : '☀';
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-label', isLight ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny');
  }
}

themeToggleBtn?.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
  syncThemeUI();
});
syncThemeUI();

// ── Drawer nawigacji ──
function openDrawer() {
  if (!mobileDrawer || !drawerScrim) return;
  mobileDrawer.hidden = false;
  drawerScrim.hidden = false;
  menuOpenBtn?.setAttribute('aria-expanded', 'true');
  menuCloseBtn?.focus();
}

function closeDrawer() {
  if (!mobileDrawer || !drawerScrim) return;
  mobileDrawer.hidden = true;
  drawerScrim.hidden = true;
  menuOpenBtn?.setAttribute('aria-expanded', 'false');
}

menuOpenBtn?.addEventListener('click', openDrawer);
menuCloseBtn?.addEventListener('click', closeDrawer);
drawerScrim?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileDrawer && !mobileDrawer.hidden) {
    closeDrawer();
    menuOpenBtn?.focus();
  }
});

// ── Budowanie URL pod aktywny prefiks (/test/katolik lub /katolik) ──
function routeHref(slug = '', param = '') {
  if (!slug) return `${state.basePath}/`;
  return param ? `${state.basePath}/${slug}/${encodeURIComponent(param)}` : `${state.basePath}/${slug}`;
}

function navigateTo(slug = '', param = '', { replace = false } = {}) {
  const url = routeHref(slug, param);
  try {
    if (replace) history.replaceState({ slug, param }, '', url);
    else history.pushState({ slug, param }, '', url);
  } catch {
    // fallback
  }
  closeDrawer();
  renderCurrentRoute();
  window.scrollTo({ top: 0, behavior: 'auto' });
  mainEl?.focus();
}

// Przechwytywanie kliknięć wewnętrznych linków [data-route]
document.addEventListener('click', (e) => {
  const link = e.target?.closest?.('a[data-route]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;
  e.preventDefault();
  const slug = link.getAttribute('data-route') || '';
  const param = link.getAttribute('data-param') || '';
  navigateTo(slug, param);
});

window.addEventListener('popstate', () => {
  renderCurrentRoute();
});

// ── Ładowanie danych statycznych (raz, z obsługą ponowienia) ──
async function loadCoreData() {
  state.dataError = null;
  const baseDataUrl = `${state.basePath}/data`;
  try {
    const [bRes, pRes, sRes] = await Promise.all([
      fetch(`${baseDataUrl}/books-66.json`, { cache: 'no-cache' }),
      fetch(`${baseDataUrl}/plan-365.json`, { cache: 'no-cache' }),
      fetch(`${baseDataUrl}/studies.json`, { cache: 'no-cache' }),
    ]);
    if (!bRes.ok || !pRes.ok || !sRes.ok) {
      throw new Error(`HTTP ${bRes.status}/${pRes.status}/${sRes.status}`);
    }
    const [booksData, planData, studiesData] = await Promise.all([bRes.json(), pRes.json(), sRes.json()]);
    state.booksData = booksData;
    state.planData = planData;
    state.studiesData = studiesData;
    return true;
  } catch (err) {
    state.dataError = 'Nie udało się wczytać lokalnych danych ksiąg i planu. Sprawdź połączenie i spróbuj ponownie.';
    trackNeutral('link_error', { target: 'katolik_core_data' });
    return false;
  }
}

async function ensureAudioCatalog() {
  if (state.audioCatalog) return state.audioCatalog;
  state.audioError = null;
  try {
    const res = await fetch('/biblia-audio/data/catalog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.audioCatalog = await res.json();
    return state.audioCatalog;
  } catch {
    state.audioError = 'Nie udało się pobrać katalogu Biblia Audio CC. Możesz otworzyć główny odtwarzacz pod adresem /biblia-audio/.';
    trackNeutral('link_error', { target: 'biblia_audio_catalog' });
    return null;
  }
}

async function ensureWiadomoscData() {
  if (state.wznData) return state.wznData;
  state.wznError = null;
  try {
    const res = await fetch('/wiadomosc-z-nieba/data.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.wznData = await res.json();
    return state.wznData;
  } catch {
    state.wznError = 'Nie udało się pobrać dzisiejszej Wiadomości z Nieba. Sprawdź połączenie lub przejdź do /werset-dnia.';
    trackNeutral('link_error', { target: 'wiadomosc_z_nieba_data' });
    return null;
  }
}

// ── Czytnik rozdziałów UBG-2025 (/data/bible/ubg-2025/{BOOK}-{CH}.json) ──
async function openChapterReader(bookId, chapterNum, highlightStart = null, highlightEnd = null) {
  const books = state.booksData?.books || [];
  const book = books.find((b) => b.id === bookId);
  const maxCh = book ? book.chapters : 1;
  const ch = Math.max(1, Math.min(Number(chapterNum) || 1, maxCh));

  state.readerState = { bookId, chapter: ch, highlightStart, highlightEnd };
  if (readerTitle) readerTitle.textContent = `${book ? book.name : bookId} — rozdział ${ch}`;
  if (readerSubtitle) readerSubtitle.textContent = 'Uwspółcześniona Biblia Gdańska (UBG-2025) · CC BY-ND 4.0';
  if (readerBody) readerBody.innerHTML = '<p style="color:var(--ink-soft);">Wczytywanie tekstu biblijnego UBG-2025…</p>';
  if (readerPrevBtn) readerPrevBtn.disabled = ch <= 1;
  if (readerNextBtn) readerNextBtn.disabled = ch >= maxCh;
  if (readerFullLink) readerFullLink.href = '/mojabiblia';

  if (readerDialog && !readerDialog.open) {
    readerDialog.showModal();
  }

  const fileUrl = `/data/bible/ubg-2025/${encodeURIComponent(bookId)}-${String(ch).padStart(3, '0')}.json`;
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const lines = (data.verses || []).map((v) => {
      const hi = highlightStart && v.number >= highlightStart && v.number <= (highlightEnd || highlightStart);
      return `<p class="verse-line${hi ? ' is-highlight' : ''}"><span class="verse-num">${v.number}</span>${escapeHtml(v.text)}</p>`;
    }).join('');
    if (readerBody) {
      readerBody.innerHTML = `${lines}<p style="margin-top:18px;font-size:12.5px;color:var(--ink-soft);border-top:1px solid var(--border);padding-top:12px;">${escapeHtml(data.copyright || 'Uwspółcześniona Biblia Gdańska (UBG-2025)')}</p>`;
      const firstHi = readerBody.querySelector('.is-highlight');
      if (firstHi) firstHi.scrollIntoView({ block: 'center', behavior: 'auto' });
      else readerBody.scrollTop = 0;
    }
  } catch {
    trackNeutral('link_error', { target: 'ubg_chapter_json' });
    if (readerBody) {
      readerBody.innerHTML = `
        <div class="notice-box notice-box--warn">
          <h3>Nie udało się załadować tego rozdziału</h3>
          <p>Brak połączenia z siecią albo plik rozdziału jest chwilowo niedostępny.</p>
          <div class="btn-row">
            <button type="button" class="btn btn--primary btn--sm" id="retryReaderBtn">Spróbuj ponownie</button>
            <a class="btn btn--secondary btn--sm" href="/mojabiblia">Otwórz w MojaBiblia</a>
          </div>
        </div>
      `;
      document.getElementById('retryReaderBtn')?.addEventListener('click', () => {
        openChapterReader(bookId, ch, highlightStart, highlightEnd);
      });
    }
  }
}

readerCloseBtn?.addEventListener('click', () => readerDialog?.close());
readerPrevBtn?.addEventListener('click', () => {
  openChapterReader(state.readerState.bookId, state.readerState.chapter - 1);
});
readerNextBtn?.addEventListener('click', () => {
  openChapterReader(state.readerState.bookId, state.readerState.chapter + 1);
});

// Delegacja przycisków otwierania czytnika rozdziału UBG
document.addEventListener('click', (e) => {
  const btn = e.target?.closest?.('[data-read-book]');
  if (!btn) return;
  const bookId = btn.getAttribute('data-read-book');
  const ch = Number(btn.getAttribute('data-read-chapter') || 1);
  const vs = btn.getAttribute('data-read-vs') ? Number(btn.getAttribute('data-read-vs')) : null;
  const ve = btn.getAttribute('data-read-ve') ? Number(btn.getAttribute('data-read-ve')) : vs;
  openChapterReader(bookId, ch, vs, ve);
});

// Reset dialog
resetCloseBtn?.addEventListener('click', () => resetDialog?.close());
resetCancelBtn?.addEventListener('click', () => resetDialog?.close());
resetConfirmBtn?.addEventListener('click', () => {
  state.progress = createDefaultProgress(todayWarsawIso());
  saveProgress();
  resetDialog?.close();
  showToast('Postęp planu został wyzerowany. Możesz zacząć na nowo w dowolnym momencie.');
  renderCurrentRoute();
});

// ── Aktualizacja aktywnych linków i Breadcrumbs ──
function updateNavigationChrome(moduleSlug, crumbs = []) {
  document.querySelectorAll('a[data-route]').forEach((a) => {
    const r = a.getAttribute('data-route') || '';
    const isActive = r === moduleSlug && !a.getAttribute('data-param');
    if (isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  if (!breadcrumbsWrap || !breadcrumbsList) return;
  if (!crumbs.length) {
    breadcrumbsWrap.hidden = true;
    breadcrumbsList.innerHTML = '';
    return;
  }
  breadcrumbsWrap.hidden = false;
  breadcrumbsList.innerHTML = crumbs.map((c, idx) => {
    const isLast = idx === crumbs.length - 1;
    const sep = idx > 0 ? '<li aria-hidden="true">/</li>' : '';
    if (isLast) {
      return `${sep}<li aria-current="page">${escapeHtml(c.label)}</li>`;
    }
    return `${sep}<li><a href="${escapeHtml(routeHref(c.slug || '', c.param || ''))}" data-route="${escapeHtml(c.slug || '')}"${c.param ? ` data-param="${escapeHtml(c.param)}"` : ''}>${escapeHtml(c.label)}</a></li>`;
  }).join('');
}

// ── Pomocnik renderujący zweryfikowany blok cytatu UBG-2025 ──
function renderScriptureQuote(refObj, headingTag = 'Tekst Pisma Świętego (UBG-2025)') {
  return `
    <div class="scripture-card">
      <div class="scripture-card__tag">${escapeHtml(headingTag)}</div>
      <blockquote>„${escapeHtml(refObj.text)}”</blockquote>
      <div class="scripture-card__meta">
        <span><strong>${escapeHtml(refObj.label)}</strong> &bull; ${escapeHtml(refObj.translation || 'UBG-2025')}</span>
        <button type="button" class="btn btn--ghost btn--sm" data-read-book="${escapeHtml(refObj.bookId)}" data-read-chapter="${refObj.chapter}" data-read-vs="${refObj.verseStart || ''}" data-read-ve="${refObj.verseEnd || ''}">Czytaj cały rozdział</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 1: STRONA STARTOWA (SEKCJA 4 SPECYFIKACJI)
// ═══════════════════════════════════════════════════════════════════════════
function renderHome() {
  document.title = 'Jesteś katolikiem? Odkryj Biblię i poznaj Jezusa | Christian Culture';
  updateNavigationChrome('', []);

  const metrics = computeProgressMetrics(state.progress, todayWarsawIso(), 365);
  const trustVerse = state.studiesData?.trustVerse;
  const faqPreview = (state.studiesData?.faq || []).slice(0, 4);
  const todayPlan = state.planData?.days?.[metrics.todayDay - 1];

  mainEl.innerHTML = `
    <section class="hero" aria-labelledby="homeH1">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Odkryj Biblię — dla katolików &bull; Christian Culture</p>
          <h1 id="homeH1">Jesteś katolikiem i chcesz lepiej poznać Jezusa?</h1>
          <p class="hero__lead">Chcesz czytać Biblię, ale nie wiesz, od czego zacząć? Odkryj Słowo Boże, poznaj Ewangelię i buduj osobistą relację z Jezusem Chrystusem. Bezpłatnie, we własnym tempie.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="${escapeHtml(routeHref('plan-365'))}" data-route="plan-365">Rozpocznij podróż z Biblią</a>
            <a class="btn btn--secondary" href="${escapeHtml(routeHref('biblia-audio'))}" data-route="biblia-audio">Posłuchaj Biblii</a>
          </div>
          <div class="hero-meta">
            <span>66 ksiąg · 1189 rozdziałów (UBG-2025)</span>
            <span>Bez konta, bez opłat i bez presji</span>
            <span>Szacunek dla człowieka · Wierność Słowu Bożemu</span>
          </div>
        </div>
        <div class="hero-media">
          <img src="/images/academy/hero_couple_cross.jpg" width="1280" height="800" fetchpriority="high" alt="Osoby odkrywające Pismo Święte w naturalnym świetle">
          <div class="hero-media__caption">
            <strong>„Otwórz Biblię i sprawdź samodzielnie.”</strong>
            <span>Dzieje Apostolskie 17:11 (UBG-2025)</span>
          </div>
          <div class="hero-media__accent" aria-hidden="true"></div>
        </div>
      </div>
    </section>

    <!-- Sekcja startowa: „Od czego chcesz zacząć?” -->
    <section class="section" aria-labelledby="startHeading">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Cztery proste wejścia</p>
          <h2 id="startHeading">Od czego chcesz zacząć?</h2>
          <p>Wybierz ścieżkę, która jest Ci dziś najbliższa. Każdy moduł działa od razu, bez logowania.</p>
        </div>
        <div class="grid-4">
          <a class="card card--interactive" href="${escapeHtml(routeHref('mapa-biblii'))}" data-route="mapa-biblii">
            <span class="card__kicker">01 · Mapa 66 ksiąg</span>
            <h3>Czytać Biblię</h3>
            <p>Przejrzysty przewodnik po wszystkich 66 księgach (39 ST + 27 NT), oś czasu i wbudowany czytnik UBG-2025.</p>
            <span class="card__foot">Otwórz Mapę Biblii →</span>
          </a>
          <a class="card card--interactive" href="${escapeHtml(routeHref('biblia-audio'))}" data-route="biblia-audio">
            <span class="card__kicker">02 · Słowo do słuchania</span>
            <h3>Słuchać Biblii</h3>
            <p>Oficjalna Biblia Audio Christian Culture — realne nagrania lektorskie rozdziałów z zapamiętywaniem miejsca.</p>
            <span class="card__foot">Przejdź do Biblii Audio →</span>
          </a>
          <a class="card card--interactive" href="${escapeHtml(routeHref('poznaj-jezusa'))}" data-route="poznaj-jezusa">
            <span class="card__kicker">03 · Serce Ewangelii</span>
            <h3>Poznać Jezusa</h3>
            <p>Kim jest Jezus na kartach Ewangelii? Jego życie, nauczanie, krzyż, zmartwychwstanie i zaproszenie dla Ciebie.</p>
            <span class="card__foot">Czytaj o Jezusie →</span>
          </a>
          <a class="card card--interactive" href="${escapeHtml(routeHref('pytania'))}" data-route="pytania">
            <span class="card__kicker">04 · Uczciwe odpowiedzi</span>
            <h3>Zadać pytanie</h3>
            <p>Zbawienie z łaski, modlitwa, Dekalog, Maria, tradycja, wieczność — sprawdź spokojnie w świetle Biblii.</p>
            <span class="card__foot">Zobacz pytania i odpowiedzi →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Sekcja zaufania: Dzieje Apostolskie 17:11 (UBG) -->
    <section class="section section--alt" aria-labelledby="trustHeading">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Postawa z Berei · Otwarta Biblia</p>
          <h2 id="trustHeading">Nie musisz wierzyć nam na słowo. Otwórz Biblię i sprawdź samodzielnie.</h2>
          <p>Oddzielamy dosłowny tekst Pisma Świętego (UBG-2025) od komentarza Christian Culture. Każdy cytat możesz od razu otworzyć w pełnym rozdziale.</p>
        </div>
        ${trustVerse ? renderScriptureQuote(trustVerse, 'Zweryfikowany cytat UBG-2025 · Dzieje Apostolskie 17:11') : ''}
      </div>
    </section>

    <!-- Sekcja planu: 365 dni ze Słowem Bożym + Dzisiejszy stan -->
    <section class="section" aria-labelledby="planHomeHeading">
      <div class="wrap grid-2" style="align-items:center;">
        <div>
          <p class="eyebrow">Plan czytania · 1189 rozdziałów</p>
          <h2 id="planHomeHeading" style="font-family:var(--font-serif);font-size:clamp(26px,3vw,38px);line-height:1.16;margin:0 0 12px;">365 dni ze Słowem Bożym. Zacznij dzisiaj, nie czekaj na pierwszy stycznia.</h2>
          <p style="color:var(--ink-muted);margin:0 0 20px;max-width:56ch;">Start dowolnego dnia, zapis postępu na Twoim urządzeniu bez zakładania konta oraz łagodna ścieżka startowa od Ewangelii Jana.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="${escapeHtml(routeHref('plan-365'))}" data-route="plan-365">Rozpocznij mój plan</a>
            <a class="btn btn--ghost" href="${escapeHtml(routeHref('wiadomosc-z-nieba'))}" data-route="wiadomosc-z-nieba">Dzisiejszy werset dnia</a>
          </div>
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="badge badge--crimson">Twój dzień ${metrics.todayDay} z 365</span>
            <span class="badge">${metrics.completedCount} / 365 (${metrics.percent}%)</span>
          </div>
          <h3 style="margin-top:4px;">${todayPlan ? escapeHtml(todayPlan.label) : 'Księga Rodzaju 1–3'}</h3>
          <p>Data startu: <strong>${escapeHtml(state.progress.startDate)}</strong> &bull; Zapis lokalny w przeglądarce (z eksportem JSON).</p>
          <div class="progress-track" aria-label="Postęp planu czytania: ${metrics.percent}%">
            <div class="progress-fill" style="width:${Math.min(100, metrics.percent)}%"></div>
          </div>
          <div class="btn-row" style="margin-top:6px;">
            ${todayPlan ? `<button type="button" class="btn btn--secondary btn--sm" data-read-book="${escapeHtml(todayPlan.passages[0].bookId)}" data-read-chapter="${todayPlan.passages[0].chapterFrom}">Czytaj dzisiejszy rozdział</button>` : ''}
            <a class="btn btn--ghost btn--sm" href="${escapeHtml(routeHref('plan-365'))}" data-route="plan-365">Otwórz kalendarz planu →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Sekcja pytań i studiów -->
    <section class="section section--alt" aria-labelledby="faqHomeHeading">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Najczęstsze pytania</p>
          <h2 id="faqHomeHeading">Masz pytania dotyczące wiary? Przyjrzyjmy się temu, co mówi Biblia.</h2>
          <p>Uczciwe, źródłowe opracowania z szacunkiem dla człowieka i jasnym rozróżnieniem między tekstem Biblii a komentarzem.</p>
        </div>
        <div class="grid-2" style="margin-bottom:22px;">
          ${faqPreview.map((item) => `
            <article class="card">
              <span class="card__kicker">${escapeHtml(item.category)}</span>
              <h3>${escapeHtml(item.question)}</h3>
              <p>${escapeHtml(item.answer)}</p>
              <a class="card__foot" href="${escapeHtml(routeHref(item.studySlug))}" data-route="${escapeHtml(item.studySlug)}">Przejdź do studium →</a>
            </article>
          `).join('')}
        </div>
        <div class="btn-row">
          <a class="btn btn--primary" href="${escapeHtml(routeHref('pytania'))}" data-route="pytania">Zobacz pytania i odpowiedzi</a>
          <a class="btn btn--secondary" href="${escapeHtml(routeHref('dekalog'))}" data-route="dekalog">Pełny Dekalog (Wj 20 i Pwt 5)</a>
          <a class="btn btn--ghost" href="${escapeHtml(routeHref('biblia-a-tradycja'))}" data-route="biblia-a-tradycja">Biblia a tradycja</a>
        </div>
      </div>
    </section>

    <!-- Szybki przegląd ekosystemu CC (Infolinia, AI status, Werset) -->
    <section class="section" aria-labelledby="ecoHomeHeading">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Wsparcie i narzędzia Christian Culture</p>
          <h2 id="ecoHomeHeading">Nie musisz szukać w samotności</h2>
        </div>
        <div class="grid-3">
          <a class="card card--interactive" href="${escapeHtml(routeHref('wiadomosc-z-nieba'))}" data-route="wiadomosc-z-nieba">
            <span class="card__kicker">Każdego ranka · Europe/Warsaw</span>
            <h3>Wiadomość z Nieba</h3>
            <p>Dzisiejszy zweryfikowany werset UBG-2025 z krótką refleksją biblijną.</p>
            <span class="card__foot">Zobacz dzisiejszy werset →</span>
          </a>
          <a class="card card--interactive" href="${escapeHtml(routeHref('nadzieja'))}" data-route="nadzieja">
            <span class="card__kicker">Ponadwyznaniowy wolontariat</span>
            <h3>Infolinia NADZIEJA</h3>
            <p>Potrzebujesz życzliwej rozmowy lub modlitwy? Zadzwoń: +48 730 958 583 (wolontariusze chrześcijańscy).</p>
            <span class="card__foot">Szczegóły i zasady →</span>
          </a>
          <a class="card card--interactive" href="${escapeHtml(routeHref('ai'))}" data-route="ai">
            <span class="card__kicker">Wyszukiwarka + status AI</span>
            <h3>AI dla Jezusa</h3>
            <p>Przeszukuj wszystkie 66 ksiąg i FAQ lokalnie + sprawdź jawny status gotowości czatu AI.</p>
            <span class="card__foot">Otwórz moduł →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Sekcja końcowa -->
    <section class="section section--alt" aria-labelledby="closingHeading">
      <div class="wrap" style="text-align:center;max-width:780px;">
        <p class="eyebrow" style="justify-content:center;">Pierwszy krok</p>
        <h2 id="closingHeading" style="font-family:var(--font-serif);font-size:clamp(26px,3.4vw,40px);line-height:1.15;margin:0 0 14px;">Jezus zaprasza Cię do osobistej relacji z Nim. Zrób pierwszy krok.</h2>
        <p style="color:var(--ink-muted);margin:0 auto 24px;max-width:56ch;">Bez pośpiechu, bez presji i bez obietnic „cudownych formuł”. Przeczytaj sam, co Ewangelia mówi o Bożej łasce.</p>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn--primary" href="${escapeHtml(routeHref('zbawienie'))}" data-route="zbawienie">Poznaj Ewangelię</a>
          <a class="btn btn--secondary" href="${escapeHtml(routeHref('o-projekcie'))}" data-route="o-projekcie">Kim jesteśmy (O projekcie)</a>
        </div>
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 2: MAPA BIBLII — 66 KSIĄG + SZCZEGÓŁY KSIĘGI
// ═══════════════════════════════════════════════════════════════════════════
function renderBibleMap(bookParam = null) {
  const books = state.booksData?.books || [];
  if (bookParam) {
    const book = books.find((b) => b.id === bookParam);
    if (book) {
      renderBookDetail(book, books);
      return;
    }
  }

  document.title = 'Mapa Biblii — 66 ksiąg (UBG-2025) | Odkryj Biblię';
  updateNavigationChrome('mapa-biblii', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Mapa 66 ksiąg', slug: 'mapa-biblii' },
  ]);

  const genres = Array.from(new Set(books.map((b) => b.genre)));
  const allThemes = Array.from(new Set(books.flatMap((b) => b.themes || []))).sort((a, b) => a.localeCompare(b, 'pl'));
  const filtered = filterBooks(books, state.bookFilter);

  const eras = [
    { name: 'Początki i patriarchowie', range: 'Księga Rodzaju', desc: 'Stworzenie, upadek, potop, przymierze z Abrahamem, Izaakiem, Jakubem i Józefem (datowanie wczesnych dziejów dyskutowane).' },
    { name: 'Wyjście i Synaj', range: 'Wyjścia – Powtórzonego Prawa', desc: 'Wyzwolenie z Egiptu, Pascha, Dekalog na Synaju i droga ku Ziemi Obiecanej.' },
    { name: 'Ziemia Obiecana i sędziowie', range: 'Jozuego – Rut', desc: 'Osiedlenie w Kanaanie, próby wiary w czasach sędziów i historia wierności Rut.' },
    { name: 'Królestwo zjednoczone', range: '1–2 Samuela, początek 1 Królewskiej', desc: 'Samuel, Saul, Dawid i Salomon — przymierze Dawidowe i budowa pierwszej świątyni.' },
    { name: 'Podzielone królestwo i prorocy', range: '1–2 Królewska, Izajasz – Malachiasz', desc: 'Izrael i Juda, wezwania proroków do sprawiedliwości, nawrócenia i nadziei Mesjasza.' },
    { name: 'Mądrość i uwielbienie', range: 'Hioba – Pieśń nad Pieśniami', desc: 'Modlitwy Psalmów, pytania o cierpienie (Hiob) i codzienna mądrość Boża.' },
    { name: 'Wygnanie i powrót', range: 'Kronik, Ezdrasz, Nehemiasz, Estera, Daniel', desc: 'Niewola babilońska, powrót do Jerozolimy, odbudowa i publiczne czytanie Pisma.' },
    { name: 'Jezus Chrystus — Ewangelie', range: 'Mateusza – Jana', desc: 'Wcielenie, służba, krzyż i zmartwychwstanie Jezusa — wypełnienie Starego Testamentu.' },
    { name: 'Kościół i listy apostolskie', range: 'Dzieje Apostolskie – List Judy', desc: 'Wylanie Ducha Świętego, narodziny wspólnoty i nauka Ewangelii łaski dla wszystkich narodów.' },
    { name: 'Nadzieja i nowe stworzenie', range: 'Apokalipsa św. Jana', desc: 'Zwycięstwo Baranka, powrót Chrystusa oraz nowe niebo i nowa ziemia bez łez i śmierci.' },
  ];

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="mapH1">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Kanon 66 ksiąg &bull; 39 ST + 27 NT &bull; 1189 rozdziałów</p>
          <h1 id="mapH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">Mapa Biblii</h1>
          <p>Wszystkie 66 ksiąg Pisma Świętego z autorskimi streszczeniami, kontekstem historycznym, zweryfikowanymi odsyłaczami UBG-2025 i wbudowanym czytnikiem każdego rozdziału.</p>
        </div>

        <div class="notice-box notice-box--draft">
          <p><strong>Status redakcyjny:</strong> opisy ksiąg są wersją roboczą (<code>draft</code>) przygotowaną do przeglądu merytorycznego. Wszystkie odsyłacze i teksty rozdziałów pochodzą bezpośrednio z weryfikowanego korpusu <strong>UBG-2025</strong>.</p>
        </div>

        <!-- Oś czasu od stworzenia do nowego stworzenia (przewijana + alternatywa listowa) -->
        <div style="margin:26px 0 32px;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
            <h2 style="font-family:var(--font-serif);font-size:24px;margin:0;">Oś czasu Biblii — od stworzenia do nowego stworzenia</h2>
            <button type="button" class="btn btn--ghost btn--sm" id="toggleTimelineBtn" aria-pressed="${state.bookFilter.timelineMode === 'list'}">
              ${state.bookFilter.timelineMode === 'list' ? 'Widok poziomej osi' : 'Widok listy (bez przewijania)'}
            </button>
          </div>
          <div class="${state.bookFilter.timelineMode === 'list' ? 'timeline-list' : 'timeline-track'}" aria-label="Oś czasu historii zbawienia">
            ${eras.map((e, i) => `
              <article class="timeline-card">
                <strong>Etap ${i + 1} · ${escapeHtml(e.range)}</strong>
                <h4>${escapeHtml(e.name)}</h4>
                <p style="margin:0;font-size:14px;color:var(--ink-muted);">${escapeHtml(e.desc)}</p>
              </article>
            `).join('')}
          </div>
        </div>

        <!-- Filtry i wyszukiwanie (bez polskich znaków) -->
        <div class="filter-bar" role="search" aria-label="Filtrowanie ksiąg Biblii">
          <div class="field">
            <label for="bookSearchInput">Szukaj księgi, skrótu lub tematu</label>
            <input class="input" id="bookSearchInput" type="search" value="${escapeHtml(state.bookFilter.query)}" placeholder="np. Jana, Ps, Rz, łaska, nadzieja…">
          </div>
          <div class="field">
            <label for="bookTestamentSel">Testament</label>
            <select class="select" id="bookTestamentSel">
              <option value="ALL"${state.bookFilter.testament === 'ALL' ? ' selected' : ''}>Cała Biblia (66)</option>
              <option value="OT"${state.bookFilter.testament === 'OT' ? ' selected' : ''}>Stary Testament (39)</option>
              <option value="NT"${state.bookFilter.testament === 'NT' ? ' selected' : ''}>Nowy Testament (27)</option>
            </select>
          </div>
          <div class="field">
            <label for="bookGenreSel">Gatunek</label>
            <select class="select" id="bookGenreSel">
              <option value="ALL">Wszystkie gatunki</option>
              ${genres.map((g) => `<option value="${escapeHtml(g)}"${state.bookFilter.genre === g ? ' selected' : ''}>${escapeHtml(g)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="bookThemeSel">Temat</label>
            <select class="select" id="bookThemeSel">
              <option value="ALL">Wszystkie tematy</option>
              ${allThemes.map((t) => `<option value="${escapeHtml(t)}"${state.bookFilter.theme === t ? ' selected' : ''}>${escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
          <p style="margin:0;color:var(--ink-muted);">Wyświetlono <strong>${filtered.length}</strong> z 66 ksiąg.</p>
          ${(state.bookFilter.query || state.bookFilter.testament !== 'ALL' || state.bookFilter.genre !== 'ALL' || state.bookFilter.theme !== 'ALL')
            ? '<button type="button" class="btn btn--ghost btn--sm" id="clearBookFiltersBtn">Wyczyść filtry</button>'
            : ''}
        </div>

        ${filtered.length === 0 ? `
          <div class="notice-box">
            <h3>Brak ksiąg spełniających wybrane kryteria</h3>
            <p>Spróbuj wpisać krótszą nazwę (np. „Jana”, „Psalmy”) albo wyczyść filtry.</p>
          </div>
        ` : `
          <div class="grid-3">
            ${filtered.map((b) => `
              <a class="card card--interactive" href="${escapeHtml(routeHref('mapa-biblii', b.id))}" data-route="mapa-biblii" data-param="${escapeHtml(b.id)}">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span class="card__kicker">${b.order}. ${b.testament === 'OT' ? 'Stary Testament' : 'Nowy Testament'}</span>
                  <span class="badge">${b.chapters} ${b.chapters === 1 ? 'rozdz.' : 'rozdz.'}</span>
                </div>
                <h3>${escapeHtml(b.name)}</h3>
                <p style="font-size:13.5px;color:var(--ink-soft);margin-top:-6px;">${escapeHtml(b.genre)}</p>
                <p>${escapeHtml(b.teaser)}</p>
                <span class="card__foot">Otwórz przewodnik księgi →</span>
              </a>
            `).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  document.getElementById('toggleTimelineBtn')?.addEventListener('click', () => {
    state.bookFilter.timelineMode = state.bookFilter.timelineMode === 'list' ? 'scroll' : 'list';
    renderBibleMap();
  });
  document.getElementById('bookSearchInput')?.addEventListener('input', (e) => {
    state.bookFilter.query = e.target.value;
    renderBibleMap();
    const inp = document.getElementById('bookSearchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  });
  document.getElementById('bookTestamentSel')?.addEventListener('change', (e) => {
    state.bookFilter.testament = e.target.value;
    renderBibleMap();
  });
  document.getElementById('bookGenreSel')?.addEventListener('change', (e) => {
    state.bookFilter.genre = e.target.value;
    renderBibleMap();
  });
  document.getElementById('bookThemeSel')?.addEventListener('change', (e) => {
    state.bookFilter.theme = e.target.value;
    renderBibleMap();
  });
  document.getElementById('clearBookFiltersBtn')?.addEventListener('click', () => {
    state.bookFilter = { query: '', testament: 'ALL', genre: 'ALL', theme: 'ALL', timelineMode: state.bookFilter.timelineMode };
    renderBibleMap();
  });
}

function renderBookDetail(book, allBooks) {
  document.title = `${book.name} (${book.chapters} rozdz.) — Mapa Biblii | Christian Culture`;
  updateNavigationChrome('mapa-biblii', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Mapa 66 ksiąg', slug: 'mapa-biblii' },
    { label: book.name, slug: 'mapa-biblii', param: book.id },
  ]);

  const idx = allBooks.findIndex((b) => b.id === book.id);
  const prevBook = idx > 0 ? allBooks[idx - 1] : null;
  const nextBook = idx < allBooks.length - 1 ? allBooks[idx + 1] : null;

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="bookH1">
      <div class="wrap">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
          <span class="badge badge--crimson">Księga ${book.order} z 66</span>
          <span class="badge">${book.testament === 'OT' ? 'Stary Testament' : 'Nowy Testament'}</span>
          <span class="badge">${escapeHtml(book.genre)}</span>
          <span class="badge badge--gold">${book.chapters} rozdziałów (UBG-2025)</span>
          <span class="badge">Status redakcyjny: ${escapeHtml(book.reviewStatus)}</span>
        </div>

        <h1 id="bookH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,48px);margin:0 0 12px;">${escapeHtml(book.name)}</h1>
        <p style="font-size:19px;color:var(--ink-muted);max-width:65ch;margin:0 0 22px;">${escapeHtml(book.teaser)}</p>

        <div class="btn-row" style="margin-bottom:28px;">
          <button type="button" class="btn btn--primary" data-read-book="${escapeHtml(book.id)}" data-read-chapter="1">Czytaj rozdział 1 (UBG-2025)</button>
          <a class="btn btn--secondary" href="${escapeHtml(routeHref('biblia-audio'))}" data-route="biblia-audio">Sprawdź w Biblii Audio</a>
          <a class="btn btn--ghost" href="/mojabiblia" target="_blank" rel="noopener noreferrer">Otwórz w MojaBiblia ↗</a>
        </div>

        <div class="grid-2" style="align-items:start;gap:24px;">
          <div class="prose">
            <h2>Streszczenie księgi (komentarz Christian Culture)</h2>
            <p>${escapeHtml(book.summary)}</p>

            <h2>Związek z Ewangelią Jezusa Chrystusa</h2>
            <p>${escapeHtml(book.gospelLink)}</p>

            <h2>Struktura księgi</h2>
            <ol>${(book.outline || []).map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ol>

            <h2>Zweryfikowane odsyłacze biblijne (UBG-2025)</h2>
            ${(book.references || []).map((r) => renderScriptureQuote(r, 'Dosłowny cytat UBG-2025')).join('')}

            <h2>Pytania do osobistej refleksji</h2>
            <ul>${(book.questions || []).map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
          </div>

          <aside style="display:grid;gap:16px;">
            <div class="card">
              <span class="card__kicker">Metryka i kontekst</span>
              <h3>Kontekst historyczny</h3>
              <p>${escapeHtml(book.historicalContext)}</p>
              <h3 style="margin-top:8px;">Autorstwo (tradycja a badania)</h3>
              <p>${escapeHtml(book.authorship)}</p>
              <h3 style="margin-top:8px;">Datowanie</h3>
              <p>${escapeHtml(book.dating)}</p>
              <div class="chip-row" style="margin-top:8px;">
                ${(book.themes || []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('')}
              </div>
            </div>

            <div class="card">
              <span class="card__kicker">Szybki skok do rozdziału (UBG-2025)</span>
              <p>Wybierz dowolny rozdział, aby przeczytać go od razu w czystym czytniku:</p>
              <div class="day-grid">
                ${Array.from({ length: book.chapters }, (_, i) => `
                  <button type="button" class="day-cell" data-read-book="${escapeHtml(book.id)}" data-read-chapter="${i + 1}" aria-label="Czytaj ${escapeHtml(book.name)} rozdział ${i + 1}">${i + 1}</button>
                `).join('')}
              </div>
            </div>

            <div class="card">
              <span class="card__kicker">Źródła i recenzja</span>
              <ul style="margin:0;padding-left:18px;font-size:14px;color:var(--ink-muted);">
                ${(book.sources || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
                <li>Aktualizacja: ${escapeHtml(book.updatedAt)} &bull; Status: ${escapeHtml(book.reviewStatus)}</li>
              </ul>
            </div>
          </aside>
        </div>

        <nav style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:36px;padding-top:24px;border-top:1px solid var(--border);" aria-label="Nawigacja między księgami">
          ${prevBook ? `<a class="btn btn--secondary" href="${escapeHtml(routeHref('mapa-biblii', prevBook.id))}" data-route="mapa-biblii" data-param="${escapeHtml(prevBook.id)}">← ${escapeHtml(prevBook.name)}</a>` : '<span></span>'}
          <a class="btn btn--ghost" href="${escapeHtml(routeHref('mapa-biblii'))}" data-route="mapa-biblii">Wszystkie 66 ksiąg</a>
          ${nextBook ? `<a class="btn btn--secondary" href="${escapeHtml(routeHref('mapa-biblii', nextBook.id))}" data-route="mapa-biblii" data-param="${escapeHtml(nextBook.id)}">${escapeHtml(nextBook.name)} →</a>` : '<span></span>'}
        </nav>
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 3: PLAN 365 DNI (1189 ROZDZIAŁÓW + ŚCIEŻKA STARTOWA EW. JANA)
// ═══════════════════════════════════════════════════════════════════════════
function renderPlan365() {
  document.title = 'Plan czytania Biblii w 365 dni | Odkryj Biblię — Christian Culture';
  updateNavigationChrome('plan-365', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Plan 365 dni', slug: 'plan-365' },
  ]);

  const todayIso = todayWarsawIso();
  const isStarter = state.planMode === 'starter';
  const totalDays = isStarter ? 21 : 365;
  const daysList = isStarter ? (state.planData?.starterPath?.days || []) : (state.planData?.days || []);
  const completedArr = isStarter ? (state.progress.starterCompletedDays || []) : (state.progress.completedDays || []);
  const completedSet = new Set(completedArr);

  const metrics = computeProgressMetrics(
    { startDate: state.progress.startDate, completedDays: completedArr },
    todayIso,
    totalDays
  );

  if (!state.planSelectedDay || state.planSelectedDay < 1 || state.planSelectedDay > totalDays) {
    state.planSelectedDay = metrics.todayDay;
  }
  const activeDayObj = daysList[state.planSelectedDay - 1] || daysList[0];
  const isSelectedDone = completedSet.has(state.planSelectedDay);
  const calendarDateForSelected = addDaysIso(state.progress.startDate, state.planSelectedDay - 1);

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="planH1">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Plan kanoniczny &bull; 66 ksiąg &bull; 1189 rozdziałów</p>
          <h1 id="planH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">365 dni ze Słowem Bożym</h1>
          <p>${escapeHtml(state.planData?.methodNote || '')} Bez konta, bez pośpiechu i bez zawstydzania za przerwy.</p>
        </div>

        ${!state.storageAvailable ? `
          <div class="notice-box notice-box--warn">
            <h3>Pamięć przeglądarki jest zablokowana</h3>
            <p>Możesz korzystać z planu w tej sesji, a przed zamknięciem strony zapisz swój postęp przyciskiem „Eksportuj JSON”.</p>
          </div>
        ` : ''}

        <!-- Przełącznik: Pełny Plan 365 dni vs. Ścieżka startowa Ew. Jana -->
        <div class="chip-row" style="margin-bottom:22px;" role="group" aria-label="Wybór widoku planu">
          <button type="button" class="chip" id="modePlan365Btn" aria-pressed="${!isStarter}">Pełny plan kanoniczny (365 dni · 1189 rozdz.)</button>
          <button type="button" class="chip" id="modeStarterBtn" aria-pressed="${isStarter}">Ścieżka startowa: 21 dni z Ewangelią Jana</button>
        </div>

        ${isStarter ? `
          <div class="notice-box notice-box--draft">
            <p><strong>Ścieżka startowa (wprowadzenie):</strong> ${escapeHtml(state.planData?.starterPath?.note || '')}</p>
          </div>
        ` : ''}

        <!-- Karta postępu + Dzisiejszy dzień -->
        <div class="grid-2" style="align-items:start;margin-bottom:26px;">
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <span class="badge badge--crimson">Dzień ${state.planSelectedDay} z ${totalDays}</span>
              <span class="badge">${escapeHtml(calendarDateForSelected)}</span>
              ${isSelectedDone ? '<span class="badge badge--ok">✓ Ukończono</span>' : ''}
            </div>
            <h2 style="font-family:var(--font-serif);font-size:26px;margin:6px 0;">${activeDayObj ? escapeHtml(activeDayObj.label) : ''}</h2>
            <p>Liczba rozdziałów tego dnia: <strong>${activeDayObj?.chapterCount || 0}</strong>. Kliknij dowolny rozdział, aby przeczytać tekst UBG-2025 od razu na stronie:</p>

            <div class="chip-row" style="margin:6px 0 12px;">
              ${(activeDayObj?.passages || []).flatMap((p) => {
                const btns = [];
                for (let c = p.chapterFrom; c <= p.chapterTo; c += 1) {
                  btns.push(`<button type="button" class="btn btn--secondary btn--sm" data-read-book="${escapeHtml(p.bookId)}" data-read-chapter="${c}">Czytaj: ${escapeHtml(p.bookName)} ${c}</button>`);
                }
                return btns;
              }).join('')}
            </div>

            <div class="btn-row">
              <button type="button" class="btn ${isSelectedDone ? 'btn--ghost' : 'btn--primary'}" id="toggleCompleteBtn">
                ${isSelectedDone ? 'Cofnij oznaczenie tego dnia' : 'Oznacz dzień jako przeczytany ✓'}
              </button>
              <button type="button" class="btn btn--ghost btn--sm" id="jumpTodayBtn">Dzisiaj (dzień ${metrics.todayDay})</button>
              ${state.planSelectedDay < totalDays ? `<button type="button" class="btn btn--ghost btn--sm" id="jumpNextBtn">Następny dzień →</button>` : ''}
            </div>
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>Twój postęp (${isStarter ? 'Ścieżka 21 dni' : 'Plan 365 dni'})</strong>
              <strong style="color:var(--crimson);">${metrics.percent}%</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, metrics.percent)}%"></div></div>
            <p>Ukończono <strong>${metrics.completedCount}</strong> z <strong>${totalDays}</strong> dni.</p>

            ${metrics.overdueDays.length > 0 ? `
              <div class="notice-box" style="margin:6px 0;">
                <p><strong>Przerwa w czytaniu to nic złego!</strong> Masz ${metrics.overdueDays.length} nieoznaczonych wcześniejszych dni. Możesz spokojnie kontynuować od dziś albo nadrobić najbliższy nieprzeczytany dzień.</p>
                <div class="btn-row">
                  <button type="button" class="btn btn--primary btn--sm" id="backToPlanBtn">Wróć do planu (dzień ${metrics.nextUnreadDay || metrics.todayDay})</button>
                  <button type="button" class="btn btn--ghost btn--sm" id="jumpFirstOverdueBtn">Pierwszy zaległy (dzień ${metrics.overdueDays[0]})</button>
                </div>
              </div>
            ` : `<p style="color:var(--ok);font-weight:600;">Jesteś na bieżąco z planem. Tak trzymaj — we własnym tempie!</p>`}

            <div class="field" style="margin-top:8px;">
              <label for="startDateInput">Data rozpoczęcia planu (możesz zacząć dowolnego dnia)</label>
              <div class="btn-row">
                <input class="input" style="max-width:210px;" type="date" id="startDateInput" value="${escapeHtml(state.progress.startDate)}">
                <button type="button" class="btn btn--secondary btn--sm" id="setStartTodayBtn">Ustaw od dzisiaj</button>
              </div>
            </div>

            <div class="btn-row" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
              <button type="button" class="btn btn--ghost btn--sm" id="exportJsonBtn">Eksportuj JSON</button>
              <label class="btn btn--ghost btn--sm" for="importJsonInput" style="cursor:pointer;">Importuj JSON</label>
              <input type="file" id="importJsonInput" accept="application/json,.json" class="sr-only">
              <button type="button" class="btn btn--ghost btn--sm" id="openResetBtn">Resetuj postęp</button>
            </div>
          </div>
        </div>

        <!-- Kalendarz wszystkich dni -->
        <div class="card">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;">
            <h3>Kalendarz dni (${totalDays})</h3>
            <span style="font-size:13px;color:var(--ink-soft);">Zielony = ukończony &bull; Ramka karmazynowa = dzisiaj &bull; Wypełniony = wybrany</span>
          </div>
          <div class="day-grid" role="list" aria-label="Kalendarz dni planu czytania">
            ${daysList.map((d) => {
              const cls = [
                'day-cell',
                completedSet.has(d.day) ? 'is-done' : '',
                d.day === metrics.todayDay ? 'is-today' : '',
                d.day === state.planSelectedDay ? 'is-selected' : '',
              ].filter(Boolean).join(' ');
              return `<button type="button" class="${cls}" data-pick-day="${d.day}" aria-label="Dzień ${d.day}: ${escapeHtml(d.label)}${completedSet.has(d.day) ? ' (ukończono)' : ''}">${d.day}</button>`;
            }).join('')}
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('modePlan365Btn')?.addEventListener('click', () => {
    state.planMode = '365';
    state.planSelectedDay = null;
    renderPlan365();
  });
  document.getElementById('modeStarterBtn')?.addEventListener('click', () => {
    state.planMode = 'starter';
    state.planSelectedDay = null;
    renderPlan365();
  });

  document.getElementById('toggleCompleteBtn')?.addEventListener('click', () => {
    const arrKey = isStarter ? 'starterCompletedDays' : 'completedDays';
    const set = new Set(state.progress[arrKey] || []);
    const wasDone = set.has(state.planSelectedDay);
    if (wasDone) {
      set.delete(state.planSelectedDay);
      showToast(`Cofnięto oznaczenie dnia ${state.planSelectedDay}.`);
    } else {
      set.add(state.planSelectedDay);
      showToast(`Oznaczono dzień ${state.planSelectedDay} jako przeczytany.`);
      trackNeutral('reading_day_complete', { plan_mode: state.planMode, day_number: state.planSelectedDay });
    }
    state.progress[arrKey] = Array.from(set).sort((a, b) => a - b);
    saveProgress();
    renderPlan365();
  });

  document.getElementById('jumpTodayBtn')?.addEventListener('click', () => {
    state.planSelectedDay = metrics.todayDay;
    renderPlan365();
  });
  document.getElementById('jumpNextBtn')?.addEventListener('click', () => {
    state.planSelectedDay = Math.min(totalDays, state.planSelectedDay + 1);
    renderPlan365();
  });
  document.getElementById('backToPlanBtn')?.addEventListener('click', () => {
    state.planSelectedDay = metrics.nextUnreadDay || metrics.todayDay;
    renderPlan365();
  });
  document.getElementById('jumpFirstOverdueBtn')?.addEventListener('click', () => {
    state.planSelectedDay = metrics.overdueDays[0];
    renderPlan365();
  });

  document.getElementById('startDateInput')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (isValidIsoDate(val)) {
      state.progress.startDate = val;
      saveProgress();
      state.planSelectedDay = null;
      trackNeutral('reading_plan_start', { mode: 'custom_date' });
      showToast(`Ustawiono datę rozpoczęcia planu na ${val}.`);
      renderPlan365();
    }
  });
  document.getElementById('setStartTodayBtn')?.addEventListener('click', () => {
    state.progress.startDate = todayWarsawIso();
    saveProgress();
    state.planSelectedDay = 1;
    trackNeutral('reading_plan_start', { mode: 'today' });
    showToast(`Plan rozpoczęty od dzisiaj (${state.progress.startDate}).`);
    renderPlan365();
  });

  document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odkryj-biblie-plan-${todayWarsawIso()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Pobrano kopię zapasową postępu (JSON).');
  });

  document.getElementById('importJsonInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const check = validateAndSanitizeProgress(parsed, todayWarsawIso());
      if (!check.ok) {
        showToast(`Błąd importu: ${check.error}`);
        return;
      }
      state.progress = check.progress;
      saveProgress();
      state.planSelectedDay = null;
      showToast(`Zaimportowano postęp: ${check.progress.completedDays.length} dni.`);
      renderPlan365();
    } catch {
      showToast('Nie udało się odczytać pliku JSON — sprawdź, czy plik nie jest uszkodzony.');
    }
  });

  document.getElementById('openResetBtn')?.addEventListener('click', () => {
    resetDialog?.showModal();
  });

  mainEl.querySelectorAll('[data-pick-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.planSelectedDay = Number(btn.getAttribute('data-pick-day'));
      renderPlan365();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 4: BIBLIA AUDIO CC (PRAWDZIWY KATALOG /biblia-audio/data/catalog.json)
// ═══════════════════════════════════════════════════════════════════════════
async function renderBibliaAudio() {
  document.title = 'Biblia Audio CC — Słuchaj Słowa Bożego | Odkryj Biblię';
  updateNavigationChrome('biblia-audio', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Biblia Audio', slug: 'biblia-audio' },
  ]);

  mainEl.innerHTML = `<section class="section"><div class="wrap"><p style="color:var(--ink-soft);">Wczytywanie oficjalnego katalogu Biblia Audio Christian Culture…</p></div></section>`;
  const catalog = await ensureAudioCatalog();
  const resume = loadAudioResume();

  if (!catalog) {
    mainEl.innerHTML = `
      <section class="section">
        <div class="wrap">
          <div class="notice-box notice-box--warn">
            <h1>Biblia Audio — chwilowy brak połączenia z katalogiem</h1>
            <p>${escapeHtml(state.audioError || 'Spróbuj ponownie za chwilę.')}</p>
            <div class="btn-row">
              <button type="button" class="btn btn--primary" id="retryAudioCatalogBtn">Spróbuj ponownie</button>
              <a class="btn btn--secondary" href="/biblia-audio/">Otwórz główny odtwarzacz /biblia-audio/</a>
            </div>
          </div>
        </div>
      </section>
    `;
    document.getElementById('retryAudioCatalogBtn')?.addEventListener('click', () => renderBibliaAudio());
    return;
  }

  const published = catalog.filter((item) => item.status === 'published' && item.audioUrl);
  const shown = state.audioFilter === 'published' ? published : catalog;

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="audioH1">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Oficjalne nagrania lektorskie &bull; UBG-2025 &bull; Bez automatycznego odtwarzania</p>
          <h1 id="audioH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">Biblia Audio Christian Culture</h1>
          <p>Słuchaj opublikowanych rozdziałów Pisma Świętego bezpośrednio z oficjalnego katalogu Christian Culture. Opublikowano już <strong>${published.length}</strong> rozdziałów Księgi Rodzaju (kolejne księgi i rozdziały są w produkcji).</p>
        </div>

        <div class="btn-row" style="margin-bottom:20px;">
          <a class="btn btn--secondary" href="/biblia-audio/">Pełny odtwarzacz /biblia-audio/</a>
          <a class="btn btn--ghost" href="/player">Radio Christian Culture 24/7</a>
          <button type="button" class="chip" id="audioOnlyPubBtn" aria-pressed="${state.audioFilter === 'published'}">Opublikowane do odsłuchu (${published.length})</button>
          <button type="button" class="chip" id="audioAllBtn" aria-pressed="${state.audioFilter === 'all'}">Cały katalog (${catalog.length})</button>
        </div>

        <div class="audio-box" id="activeAudioBox" style="margin-bottom:24px;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <span class="card__kicker">Odtwarzacz rozdziału (start wyłącznie po Twoim kliknięciu)</span>
              <h2 id="audioNowTitle" style="margin:4px 0 0;font-size:20px;">${resume ? escapeHtml(resume.title) : (published[0] ? `Księga Rodzaju — rozdział ${published[0].chapter}: ${escapeHtml(published[0].description)}` : 'Wybierz rozdział poniżej')}</h2>
            </div>
            ${resume && resume.time > 5 ? `<button type="button" class="btn btn--secondary btn--sm" id="resumeAudioBtn">Wznów od ${Math.floor(resume.time / 60)}:${String(Math.floor(resume.time % 60)).padStart(2, '0')}</button>` : ''}
          </div>
          <audio id="katolikAudioPlayer" controls preload="none" src="${escapeHtml(resume?.url || published[0]?.audioUrl || '')}"></audio>
        </div>

        <div class="grid-3">
          ${shown.map((ep) => {
            const isPub = ep.status === 'published' && ep.audioUrl;
            return `
              <article class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <span class="card__kicker">Księga Rodzaju ${ep.chapter}</span>
                  <span class="badge ${isPub ? 'badge--ok' : ''}">${isPub ? 'Dostępne MP3' : 'W produkcji'}</span>
                </div>
                <h3>${escapeHtml(ep.description || `Rozdział ${ep.chapter}`)}</h3>
                <div class="btn-row" style="margin-top:auto;">
                  ${isPub ? `<button type="button" class="btn btn--primary btn--sm" data-play-audio="${escapeHtml(ep.audioUrl)}" data-play-title="Księga Rodzaju — rozdział ${ep.chapter}: ${escapeHtml(ep.description || '')}">Słuchaj rozdziału</button>` : '<span style="font-size:13.5px;color:var(--ink-soft);">Nagranie w przygotowaniu</span>'}
                  <button type="button" class="btn btn--ghost btn--sm" data-read-book="GEN" data-read-chapter="${ep.chapter}">Tekst UBG</button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;

  const player = document.getElementById('katolikAudioPlayer');
  const titleEl = document.getElementById('audioNowTitle');

  player?.addEventListener('timeupdate', () => {
    if (player.currentTime > 3 && player.src) {
      saveAudioResume({
        url: player.getAttribute('src'),
        title: titleEl?.textContent || 'Biblia Audio CC',
        time: Math.floor(player.currentTime),
      });
    }
  });

  document.getElementById('resumeAudioBtn')?.addEventListener('click', () => {
    if (!player || !resume) return;
    player.currentTime = resume.time || 0;
    player.play().catch(() => {});
    trackNeutral('audio_open', { mode: 'resume' });
  });

  document.getElementById('audioOnlyPubBtn')?.addEventListener('click', () => {
    state.audioFilter = 'published';
    renderBibliaAudio();
  });
  document.getElementById('audioAllBtn')?.addEventListener('click', () => {
    state.audioFilter = 'all';
    renderBibliaAudio();
  });

  mainEl.querySelectorAll('[data-play-audio]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-play-audio');
      const title = btn.getAttribute('data-play-title');
      if (!player || !isSafeUrl(url)) return;
      player.setAttribute('src', url);
      if (titleEl) titleEl.textContent = title;
      player.play().catch(() => {});
      trackNeutral('audio_open', { mode: 'chapter_play' });
      document.getElementById('activeAudioBox')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 5: STUDIA TEMATYCZNE (10 MODUŁÓW APOLOGETYCZNYCH I DUCHOWYCH)
// ═══════════════════════════════════════════════════════════════════════════
function renderStudy(slug) {
  const study = (state.studiesData?.studies || []).find((s) => s.slug === slug);
  if (!study) {
    renderNotFound();
    return;
  }

  document.title = `${study.navLabel} — Odkryj Biblię | Christian Culture`;
  updateNavigationChrome(slug, [
    { label: 'Odkryj Biblię', slug: '' },
    { label: study.navLabel, slug },
  ]);

  const allStudies = state.studiesData?.studies || [];
  const related = (study.relatedSlugs || [])
    .map((rs) => allStudies.find((s) => s.slug === rs))
    .filter(Boolean);

  mainEl.innerHTML = `
    <article class="section" aria-labelledby="studyH1">
      <div class="wrap">
        <div class="prose">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            <span class="badge badge--crimson">${escapeHtml(study.category)}</span>
            <span class="badge">Status redakcyjny: ${escapeHtml(study.reviewStatus)}</span>
            <span class="badge">Przekład: UBG-2025</span>
          </div>

          <h1 id="studyH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);line-height:1.12;margin:0 0 14px;">${escapeHtml(study.title)}</h1>
          <p style="font-size:19px;color:var(--ink);margin-bottom:22px;">${escapeHtml(study.summary)}</p>

          <div class="notice-box notice-box--draft">
            <h3>Krótka odpowiedź (komentarz Christian Culture)</h3>
            <p>${escapeHtml(study.shortAnswer)}</p>
          </div>

          <h2>Co mówi samo Pismo Święte? (UBG-2025)</h2>
          ${(study.quotes || []).map((q) => renderScriptureQuote(q, 'Dosłowny tekst Pisma Świętego (UBG-2025)')).join('')}

          <h2>Komentarz i wyjaśnienie Christian Culture</h2>
          ${(study.commentary || []).map((sec) => `
            <h3>${escapeHtml(sec.heading)}</h3>
            <p>${escapeHtml(sec.body)}</p>
          `).join('')}

          ${study.optionalPrayer ? `
            <div class="notice-box notice-box--draft">
              <h3>Dobrowolna modlitwa</h3>
              <p style="font-size:13.5px;color:var(--ink-soft);">${escapeHtml(study.optionalPrayer.disclaimer)}</p>
              <blockquote style="margin:12px 0 0;font-family:var(--font-serif);font-size:18px;color:var(--ink);">„${escapeHtml(study.optionalPrayer.text)}”</blockquote>
            </div>
          ` : ''}

          ${study.catholicContext ? `
            <div class="notice-box notice-box--compare">
              <h3>${escapeHtml(study.catholicContext.heading)}</h3>
              <p><strong>Oficjalne nauczanie Kościoła katolickiego:</strong> ${escapeHtml(study.catholicContext.officialView)}</p>
              <p><strong>Stanowisko Christian Culture:</strong> ${escapeHtml(study.catholicContext.ccView)}</p>
              ${isSafeUrl(study.catholicContext.sourceUrl) ? `<p style="font-size:13.5px;">Źródło oficjalne: <a href="${escapeHtml(study.catholicContext.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(study.catholicContext.sourceLabel)} ↗</a></p>` : ''}
            </div>
          ` : ''}

          <div class="notice-box" id="dostepnosc">
            <h3>Pytanie do osobistej refleksji</h3>
            <p>${escapeHtml(study.reflectionQuestion)}</p>
          </div>

          ${slug === 'o-projekcie' ? `
            <div class="notice-box">
              <h3>Deklaracja dostępności (WCAG 2.2 AA)</h3>
              <p>Strona wspiera nawigację klawiaturą, czytniki ekranu, skalowanie do 200%, preferencję ograniczonego ruchu (<code>prefers-reduced-motion</code>), tryb jasny i ciemny oraz dotykowe pola minimum 44&times;44 px. Błędy dostępności można zgłaszać na adres <a href="mailto:radiochristianculture@gmail.com">radiochristianculture@gmail.com</a>.</p>
            </div>
          ` : ''}

          <h2>Źródła i status redakcyjny</h2>
          <ul>
            ${(study.sources || []).map((src) => `<li>${isSafeUrl(src.url) ? `<a href="${escapeHtml(src.url)}"${src.url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(src.label)}</a>` : escapeHtml(src.label)}</li>`).join('')}
            <li>Data opracowania: ${escapeHtml(study.updatedAt)} &bull; Status: <strong>${escapeHtml(study.reviewStatus)}</strong> (oczekuje na końcową akceptację redakcyjną)</li>
          </ul>
        </div>

        ${related.length ? `
          <div style="margin-top:36px;padding-top:28px;border-top:1px solid var(--border);">
            <h2 style="font-family:var(--font-serif);font-size:26px;margin:0 0 16px;">Powiązane studia biblijne</h2>
            <div class="grid-3">
              ${related.map((r) => `
                <a class="card card--interactive" href="${escapeHtml(routeHref(r.slug))}" data-route="${escapeHtml(r.slug)}">
                  <span class="card__kicker">${escapeHtml(r.category)}</span>
                  <h3>${escapeHtml(r.navLabel)}</h3>
                  <p>${escapeHtml(r.summary)}</p>
                  <span class="card__foot">Czytaj studium →</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </article>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 6: PYTANIA I ODPOWIEDZI (FAQ Z WYSZUKIWANIEM PEŁNOTEKSTOWYM)
// ═══════════════════════════════════════════════════════════════════════════
function renderFaq() {
  document.title = 'Pytania i odpowiedzi (FAQ) — Odkryj Biblię | Christian Culture';
  updateNavigationChrome('pytania', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Pytania i odpowiedzi', slug: 'pytania' },
  ]);

  const faqList = state.studiesData?.faq || [];
  const categories = Array.from(new Set(faqList.map((f) => f.category)));
  const filtered = filterFaq(faqList, state.faqFilter);

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="faqH1">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">13 pytań startowych &bull; Wyszukiwanie pełnotekstowe</p>
          <h1 id="faqH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">Pytania i odpowiedzi o wiarę i Biblię</h1>
          <p>Wpisz dowolne słowo kluczowe (np. „zbawienie”, „Maria”, „sabat”, „śmierć”, „66 ksiąg”). Każda odpowiedź odsyła do pełnych wersetów UBG-2025.</p>
        </div>

        <div class="filter-bar" style="grid-template-columns:1.5fr 1fr;" role="search" aria-label="Wyszukiwanie pytań FAQ">
          <div class="field">
            <label for="faqSearchInput">Szukaj w pytaniach i odpowiedziach</label>
            <input class="input" id="faqSearchInput" type="search" value="${escapeHtml(state.faqFilter.query)}" placeholder="np. uczynki, modlitwa, dekalog, czyściec…">
          </div>
          <div class="field">
            <label for="faqCategorySel">Kategoria</label>
            <select class="select" id="faqCategorySel">
              <option value="ALL">Wszystkie kategorie (${faqList.length})</option>
              ${categories.map((c) => `<option value="${escapeHtml(c)}"${state.faqFilter.category === c ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <p style="color:var(--ink-muted);margin:0 0 16px;">Znaleziono <strong>${filtered.length}</strong> z ${faqList.length} odpowiedzi.</p>

        ${filtered.length === 0 ? `
          <div class="notice-box">
            <h3>Brak pytań pasujących do wpisanej frazy</h3>
            <p>Spróbuj wpisać inne słowo lub wyczyść filtr kategorii.</p>
          </div>
        ` : `
          <div class="faq-list">
            ${filtered.map((item, idx) => `
              <details class="faq-item"${idx === 0 && filtered.length <= 3 ? ' open' : ''}>
                <summary>${escapeHtml(item.question)}</summary>
                <div class="faq-item__body">
                  <p style="margin-top:14px;">${escapeHtml(item.answer)}</p>
                  ${(item.refs || []).map((r) => renderScriptureQuote(r, 'Odsyłacz biblijny (UBG-2025)')).join('')}
                  <div class="btn-row" style="margin-top:12px;">
                    <a class="btn btn--secondary btn--sm" href="${escapeHtml(routeHref(item.studySlug))}" data-route="${escapeHtml(item.studySlug)}">Otwórz pełne studium →</a>
                  </div>
                </div>
              </details>
            `).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  document.getElementById('faqSearchInput')?.addEventListener('input', (e) => {
    state.faqFilter.query = e.target.value;
    renderFaq();
    const inp = document.getElementById('faqSearchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  });
  document.getElementById('faqCategorySel')?.addEventListener('change', (e) => {
    state.faqFilter.category = e.target.value;
    renderFaq();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 7: AI DLA JEZUSA (JAWNY STATUS GOTOWOŚCI + LOKALNA WYSZUKIWARKA)
// ═══════════════════════════════════════════════════════════════════════════
function renderAiModule() {
  document.title = 'AI dla Jezusa (status i wyszukiwanie lokalne) | Odkryj Biblię';
  updateNavigationChrome('ai', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'AI dla Jezusa', slug: 'ai' },
  ]);

  const q = normalizePolish(state.aiLocalQuery);
  let matchedBooks = [];
  let matchedFaq = [];
  if (q.length >= 2) {
    matchedBooks = filterBooks(state.booksData?.books || [], { query: state.aiLocalQuery }).slice(0, 6);
    matchedFaq = filterFaq(state.studiesData?.faq || [], { query: state.aiLocalQuery }).slice(0, 6);
  }

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="aiH1">
      <div class="wrap">
        <div class="prose">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            <span class="badge badge--warn">Status czatu AI: niedostępny (w przygotowaniu)</span>
            <span class="badge badge--ok">Lokalna wyszukiwarka 66 ksiąg i FAQ: działa</span>
          </div>
          <h1 id="aiH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">AI dla Jezusa — przejrzysty status integracji</h1>
          <p>Zgodnie z zasadą pełnej uczciwości nie uruchamiamy atrapy czatu. Interfejs <strong>/ai/</strong> w ekosystemie Christian Culture ma obecnie status <strong>makiety UI (BETA)</strong> bez podpiętego jeszcze bezpiecznego backendu odpowiedzi AI — dlatego na tej stronie czat na żywo pozostaje jawnie wyłączony do momentu zakończenia audytu bezpieczeństwa.</p>

          <div class="notice-box notice-box--compare">
            <h3>Obowiązujące zasady bezpieczeństwa i teologii AI w Christian Culture</h3>
            <ul style="margin:8px 0 0;padding-left:20px;color:var(--ink-muted);">
              <li>Narzędzie AI <strong>nigdy nie podszywa się pod Jezusa</strong> ani nie przypisuje swoich odpowiedzi Bogu.</li>
              <li>Każda odpowiedź ma wskazywać źródła (UBG-2025) i jasno oznaczać ograniczenia sztucznej inteligencji.</li>
              <li>Historia Twojej lektury planu ani żadne dane osobowe nie są wysyłane bez Twojej świadomej decyzji.</li>
              <li>W przeglądarce nigdy nie przechowujemy kluczy API (zero sekretów w kliencie).</li>
            </ul>
          </div>
        </div>

        <!-- Działająca już dziś lokalna wyszukiwarka tematów i ksiąg -->
        <div class="card" style="margin-top:24px;">
          <span class="card__kicker">Dostępne natychmiast · 100% lokalnie bez wysyłania zapytań</span>
          <h2>Przeszukaj 66 ksiąg Biblii i 13 odpowiedzi FAQ</h2>
          <div class="field">
            <label for="aiLocalInput">Wpisz pytanie lub słowo kluczowe (min. 2 znaki)</label>
            <input class="input" id="aiLocalInput" type="search" value="${escapeHtml(state.aiLocalQuery)}" placeholder="np. przebaczenie, cierpienie, Dekalog, Maria, Ewangelia Jana…">
          </div>
          ${q.length >= 2 ? `
            <div style="margin-top:12px;">
              ${(matchedFaq.length === 0 && matchedBooks.length === 0)
                ? '<p style="color:var(--ink-soft);">Brak dopasowań lokalnych. Sprawdź pełną <a href="/test/katolik/mapa-biblii" data-route="mapa-biblii">Mapę 66 ksiąg</a> lub napisz do wolontariuszy.</p>'
                : `
                  ${matchedFaq.length ? `
                    <h3 style="margin:10px 0;">Dopasowane odpowiedzi FAQ (${matchedFaq.length})</h3>
                    <div class="grid-2" style="margin-bottom:16px;">
                      ${matchedFaq.map((f) => `
                        <a class="card card--interactive" href="${escapeHtml(routeHref(f.studySlug))}" data-route="${escapeHtml(f.studySlug)}">
                          <strong>${escapeHtml(f.question)}</strong>
                          <p>${escapeHtml(f.answer)}</p>
                        </a>
                      `).join('')}
                    </div>
                  ` : ''}
                  ${matchedBooks.length ? `
                    <h3 style="margin:10px 0;">Dopasowane księgi Biblii (${matchedBooks.length})</h3>
                    <div class="grid-3">
                      ${matchedBooks.map((b) => `
                        <a class="card card--interactive" href="${escapeHtml(routeHref('mapa-biblii', b.id))}" data-route="mapa-biblii" data-param="${escapeHtml(b.id)}">
                          <strong>${escapeHtml(b.name)}</strong>
                          <p>${escapeHtml(b.teaser)}</p>
                        </a>
                      `).join('')}
                    </div>
                  ` : ''}
                `
              }
            </div>
          ` : ''}
          <div class="btn-row" style="margin-top:14px;">
            <a class="btn btn--secondary btn--sm" href="/ai/" target="_blank" rel="noopener noreferrer">Podgląd makiety UI /ai/ (BETA) ↗</a>
            <a class="btn btn--ghost btn--sm" href="${escapeHtml(routeHref('nadzieja'))}" data-route="nadzieja">Rozmowa z żywym człowiekiem (Infolinia NADZIEJA)</a>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('aiLocalInput')?.addEventListener('input', (e) => {
    state.aiLocalQuery = e.target.value;
    renderAiModule();
    const inp = document.getElementById('aiLocalInput');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 8: INFOLINIA NADZIEJA (PONADWYZNANIOWY WOLONTARIAT)
// ═══════════════════════════════════════════════════════════════════════════
function renderNadzieja() {
  document.title = 'Infolinia NADZIEJA — Ponadwyznaniowy wolontariat | Odkryj Biblię';
  updateNavigationChrome('nadzieja', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Infolinia NADZIEJA', slug: 'nadzieja' },
  ]);

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="nadziejaH1">
      <div class="wrap">
        <div class="prose">
          <span class="badge badge--ok" style="margin-bottom:14px;">Działa · Zweryfikowana usługa Christian Culture</span>
          <h1 id="nadziejaH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">Infolinia NADZIEJA Christian Culture</h1>
          <p style="font-size:19px;color:var(--ink);">Potrzebujesz życzliwej rozmowy, wysłuchania, duchowego wsparcia lub wspólnej modlitwy? Możesz zadzwonić z szacunkiem i bez oceniania.</p>

          <div class="card" style="margin:22px 0;">
            <span class="card__kicker">Numer telefonu infolinii</span>
            <p style="font-family:var(--font-serif);font-size:clamp(26px,4vw,36px);font-weight:700;color:var(--ink);margin:4px 0;">+48 730 958 583</p>
            <p>Ponad podziałami. Blisko człowieka. W duchu Chrystusa.</p>
            <div class="btn-row" style="margin-top:8px;">
              <a class="btn btn--primary" href="tel:+48730958583">Zadzwoń: +48 730 958 583</a>
              <a class="btn btn--secondary" href="/infolinia-nadzieja/">Oficjalna strona /infolinia-nadzieja/</a>
            </div>
          </div>

          <div class="notice-box notice-box--compare">
            <h3>Ważne i jawne zasady posługi</h3>
            <p><strong>Ponadwyznaniowy wolontariat:</strong> Infolinia NADZIEJA jest inicjatywą społeczną prowadzoną przez chrześcijańskich wolontariuszy. Nie reprezentuje żadnego konkretnego Kościoła ani związku wyznaniowego. Osoba po drugiej stronie słuchawki jest wolontariuszem — <strong>nie podszywamy się pod duchownego ani spowiednika</strong>.</p>
            <p><strong>Pomoc kryzysowa i medyczna:</strong> Infolinia nie zastępuje lekarza, psychologa ani służb ratunkowych. W sytuacji zagrożenia życia lub zdrowia zadzwoń natychmiast pod numer alarmowy <strong>112</strong>.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 9: WIADOMOŚĆ Z NIEBA (WERSET DNIA — DATA EUROPE/WARSAW)
// ═══════════════════════════════════════════════════════════════════════════
async function renderWiadomoscZNieba() {
  document.title = 'Wiadomość z Nieba — Dzisiejszy werset dnia | Odkryj Biblię';
  updateNavigationChrome('wiadomosc-z-nieba', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Wiadomość z Nieba', slug: 'wiadomosc-z-nieba' },
  ]);

  mainEl.innerHTML = `<section class="section"><div class="wrap"><p style="color:var(--ink-soft);">Wczytywanie dzisiejszego wersetu (strefa Europe/Warsaw)…</p></div></section>`;
  const data = await ensureWiadomoscData();
  const todayIso = todayWarsawIso();

  if (!data) {
    mainEl.innerHTML = `
      <section class="section">
        <div class="wrap">
          <div class="notice-box notice-box--warn">
            <h1>Wiadomość z Nieba — chwilowy brak połączenia</h1>
            <p>${escapeHtml(state.wznError || 'Spróbuj ponownie za chwilę.')}</p>
            <div class="btn-row">
              <button type="button" class="btn btn--primary" id="retryWznBtn">Spróbuj ponownie</button>
              <a class="btn btn--secondary" href="/werset-dnia">Przejdź do /werset-dnia</a>
            </div>
          </div>
        </div>
      </section>
    `;
    document.getElementById('retryWznBtn')?.addEventListener('click', () => renderWiadomoscZNieba());
    return;
  }

  const list = data.tenDays || [];
  const todayItem = list.find((d) => d.runDate === todayIso)
    || list.filter((d) => d.runDate <= todayIso).slice(-1)[0]
    || list[0];

  mainEl.innerHTML = `
    <section class="section" aria-labelledby="wznH1">
      <div class="wrap">
        <div class="prose">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            <span class="badge badge--crimson">Dzisiaj (Europe/Warsaw): ${escapeHtml(todayIso)}</span>
            <span class="badge badge--ok">Zweryfikowany UBG-2025</span>
          </div>
          <h1 id="wznH1" style="font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);margin:0 0 12px;">Wiadomość z Nieba — Werset Dnia</h1>
          <p>${escapeHtml(data.profile?.editorialDisclosure || 'Oficjalna redakcja Christian Culture — codzienny zweryfikowany werset UBG-2025.')}</p>

          ${todayItem ? `
            <div class="scripture-card">
              <div class="scripture-card__tag">Werset dnia · ${escapeHtml(todayItem.runDate)}</div>
              <blockquote>„${escapeHtml(todayItem.verse?.text || '')}”</blockquote>
              <div class="scripture-card__meta">
                <span><strong>${escapeHtml(todayItem.verse?.referencePl || todayItem.verse?.reference || '')}</strong> &bull; ${escapeHtml(todayItem.verse?.translation || 'UBG-2025')}</span>
              </div>
            </div>
            <div class="card">
              <span class="card__kicker">${escapeHtml(todayItem.themeLabel || 'Refleksja dnia')}</span>
              <h3>${escapeHtml(todayItem.sections?.hook || 'Chwila ze Słowem Bożym')}</h3>
              <p>${escapeHtml(todayItem.sections?.reflection || '')}</p>
            </div>
          ` : ''}

          <div class="btn-row" style="margin-top:22px;">
            <a class="btn btn--primary" href="/werset-dnia">Otwórz pełny moduł /werset-dnia</a>
            <a class="btn btn--secondary" href="/wiadomosc-z-nieba/">Archiwum /wiadomosc-z-nieba/</a>
            <a class="btn btn--ghost" href="${escapeHtml(routeHref('plan-365'))}" data-route="plan-365">Przejdź do Planu 365 dni</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDOK 404 DLA BŁĘDNYCH PODŚCIEŻEK W /test/katolik/*
// ═══════════════════════════════════════════════════════════════════════════
function renderNotFound(badSlug = '') {
  document.title = 'Nie znaleziono strony — Odkryj Biblię | Christian Culture';
  updateNavigationChrome('', [
    { label: 'Odkryj Biblię', slug: '' },
    { label: 'Nie znaleziono strony', slug: '' },
  ]);
  trackNeutral('link_error', { target: 'unknown_subroute' });
  mainEl.innerHTML = `
    <section class="section">
      <div class="wrap prose">
        <span class="badge badge--warn">Nieznany adres podstrony</span>
        <h1 style="font-family:var(--font-serif);margin:14px 0 10px;">Nie znaleźliśmy tej sekcji</h1>
        <p>Adres <code>${escapeHtml(badSlug || location.pathname)}</code> nie odpowiada żadnemu z modułów portalu „Odkryj Biblię”.</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="${escapeHtml(routeHref(''))}" data-route="">Wróć na stronę główną</a>
          <a class="btn btn--secondary" href="${escapeHtml(routeHref('mapa-biblii'))}" data-route="mapa-biblii">Mapa 66 ksiąg</a>
          <a class="btn btn--ghost" href="${escapeHtml(routeHref('plan-365'))}" data-route="plan-365">Plan 365 dni</a>
        </div>
      </div>
    </section>
  `;
}

// ── Główny router aplikacji ──
async function renderCurrentRoute() {
  const parsed = parseKatolikRoute(location.pathname);
  state.basePath = parsed.basePath;

  if (!state.booksData || !state.planData || !state.studiesData) {
    const ok = await loadCoreData();
    if (!ok) {
      mainEl.innerHTML = `
        <section class="section">
          <div class="wrap prose">
            <div class="notice-box notice-box--warn">
              <h1>Chwilowy problem z załadowaniem danych</h1>
              <p>${escapeHtml(state.dataError || 'Sprawdź połączenie z siecią.')}</p>
              <button type="button" class="btn btn--primary" id="retryCoreBtn">Spróbuj ponownie</button>
            </div>
          </div>
        </section>
      `;
      document.getElementById('retryCoreBtn')?.addEventListener('click', () => renderCurrentRoute());
      return;
    }
  }

  if (parsed.isUnknown) {
    renderNotFound(parsed.moduleSlug);
    return;
  }

  trackNeutral('module_open', { module: parsed.moduleSlug || 'home' });

  switch (parsed.moduleSlug) {
    case '':
      renderHome();
      break;
    case 'mapa-biblii':
      renderBibleMap(parsed.param);
      break;
    case 'plan-365':
      renderPlan365();
      break;
    case 'biblia-audio':
      await renderBibliaAudio();
      break;
    case 'pytania':
      renderFaq();
      break;
    case 'ai':
      renderAiModule();
      break;
    case 'nadzieja':
      renderNadzieja();
      break;
    case 'wiadomosc-z-nieba':
      await renderWiadomoscZNieba();
      break;
    default:
      renderStudy(parsed.moduleSlug);
      break;
  }
}

// ── Inicjalizacja ──
loadProgress();
renderCurrentRoute();
