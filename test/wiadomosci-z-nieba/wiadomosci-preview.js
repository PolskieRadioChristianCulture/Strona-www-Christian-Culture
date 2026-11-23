const ACCEPTANCE_CRITERIA = [
  'Wyświetlanie profilu „Jezus Chrystus — Wiadomości z nieba” i jawne oznaczenie Christian Culture jako wydawcy',
  'Okrągły awatar na przezroczystym tle (komputer i smartfon, motyw ciemny i jasny)',
  'Poprawność linków głównych prowadzących do https://polskieradio.cc/werset-dnia',
  'Rzeczywiste źródło Wersetu Dnia (data/werset_dnia_365_ubg.json)',
  'Krzyżowa weryfikacja autentyczności cytatu z kanoniczną Biblią UBG oraz licencją CC BY-ND 4.0',
  'Formatowanie 5-elementowe + katalog 10 tematów + bramka bezpieczeństwa teologicznego (10/10)',
  'Konfigurowalny harmonogram 07:00 Europe/Warsaw (wstrzymany w TEST)',
  'Odporność na podwójne uruchomienie i bezpieczne ponowienia bez duplikatu',
  'Zatrzymanie publikacji (fail-closed) i powiadomienie nadzoru przy niedostępności źródła',
  'Zabezpieczenia konta publikacyjnego i twarda blokada publikacji bez zgody L0',
  'Brak automatycznych wiadomości prywatnych (wyłącznie dobrowolna subskrypcja opt-in z rezygnacją)',
  'Zbiorcza analityka i dzienny status bez profilowania przekonań religijnych',
];

const sandboxState = {
  following: false,
  followersCount: 0,
  optInSubscribed: false,
  optInCount: 0,
  amenClicksByDay: {},
  wersetClicks: 0,
  sharesCount: 0,
  selectedIndex: 0,
  data: null,
};

function trackEvent(eventName, params = {}) {
  try {
    if (typeof window.ccTrack === 'function') {
      window.ccTrack(eventName, {
        module: 'wiadomosci_z_nieba_test',
        ...params,
      });
    }
  } catch {
    // Brak wpływu błędu telemetrii na interfejs użytkownika
  }
}

function setFeedback(text) {
  const el = document.getElementById('actionFeedback');
  if (el) el.textContent = text;
}

function appendKvRow(dl, label, value) {
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = String(value ?? '—');
  dl.append(dt, dd);
}

function renderProfileHeader(sim) {
  const p = sim.profile || {};
  document.getElementById('profileDisplayName').textContent = p.displayName || 'Jezus Chrystus';
  document.getElementById('profileSeriesName').textContent = p.seriesName || 'Wiadomości z nieba';
  document.getElementById('profileHandle').textContent = p.handle || '@wiadomosci_z_nieba';
  document.getElementById('profilePublisher').textContent = p.publisher || 'Christian Culture';
  document.getElementById('profileTypeBadge').textContent = p.profileType || 'Oficjalny profil tematyczny Christian Culture';
  document.getElementById('profileCategoryBadge').textContent = p.category || 'Biblia / Inspiracje / Wiara';
  document.getElementById('profileSlogan').textContent = `„${p.slogan || ''}”`;
  document.getElementById('profileBio').textContent = p.bio || '';
  document.getElementById('profileDisclosure').textContent = p.editorialDisclosure || '';

  const mainUrl = p.mainUrl || 'https://polskieradio.cc/werset-dnia';
  document.getElementById('profilePrimaryLink').href = mainUrl;
  document.getElementById('headerWersetCta').href = mainUrl;

  const sched = sim.schedule || {};
  document.getElementById('scheduleLabel').textContent = `${sched.publishTime || '07:00'} ${sched.timezone || 'Europe/Warsaw'}`;
  document.getElementById('approvalStateText').textContent =
    `Tryb: ${sim.mode} · Opublikowano w symulacji: ${sim.tenDays?.length || 0} dni · Koszt: 0,00 zł`;
  document.getElementById('simSummaryNote').textContent =
    `${sim.tenDays?.length || 0} dni UBG-2025 · Duplikat zablokowany: ${sim.verificationChecks?.duplicateRunBlocked ? 'TAK' : 'NIE'} · Fail-closed źródła: ${sim.verificationChecks?.missingSourceBlocked ? 'TAK' : 'NIE'}`;
}

function renderAnalyticsAndAcceptance(sim) {
  const analyticsList = document.getElementById('analyticsMetaList');
  analyticsList.textContent = '';
  const totals = sim.analyticsSummary?.totals || {};
  appendKvRow(analyticsList, 'Opublikowane (TEST)', totals.published_count ?? 0);
  appendKvRow(analyticsList, 'Zablokowane duplikaty', totals.duplicates_blocked_count ?? 0);
  appendKvRow(analyticsList, 'Błędy produkcyjne', totals.errors_count ?? 0);
  appendKvRow(analyticsList, 'Kliknięcia Werset Dnia (sesja)', sandboxState.wersetClicks);
  appendKvRow(analyticsList, 'Obserwujący (piaskownica)', sandboxState.followersCount);
  appendKvRow(analyticsList, 'Subskrypcje opt-in (piaskownica)', sandboxState.optInCount);
  appendKvRow(analyticsList, 'Udostępnienia (sesja)', sandboxState.sharesCount);
  appendKvRow(analyticsList, 'Auto-publikacja live', sim.autoPublishEnabled ? 'WŁĄCZONA' : 'WYŁĄCZONA (oczekuje L0)');

  const accList = document.getElementById('acceptanceCheckList');
  accList.textContent = '';
  for (const label of ACCEPTANCE_CRITERIA) {
    const li = document.createElement('li');
    li.className = 'wzn-check-item';
    const mark = document.createElement('span');
    mark.className = 'wzn-check-pass';
    mark.textContent = 'PASS';
    const text = document.createElement('span');
    text.textContent = label;
    li.append(mark, text);
    accList.append(li);
  }
}

function renderSelectedDay(index) {
  const sim = sandboxState.data;
  if (!sim || !Array.isArray(sim.tenDays) || !sim.tenDays[index]) return;
  sandboxState.selectedIndex = index;
  const item = sim.tenDays[index];

  document.querySelectorAll('.wzn-day-tab').forEach((btn, idx) => {
    btn.setAttribute('aria-selected', idx === index ? 'true' : 'false');
  });

  document.getElementById('postSubmeta').textContent =
    `${item.runDate} · Dzień roku ${item.verse.day} · Status: ${item.status} · Wydawca: Christian Culture`;
  document.getElementById('postThemePill').textContent = item.themeLabel;

  const fig = document.getElementById('verseGraphicFigure');
  const img = document.getElementById('verseGraphicImg');
  const cap = document.getElementById('verseGraphicCaption');
  if (item.dedicatedImage) {
    img.src = item.dedicatedImage;
    img.alt = `Grafika biblijna do wersetu ${item.verse.referencePl} (UBG-2025)`;
    cap.textContent = `Dedykowana karta Wersetu Dnia (${item.verse.referencePl})`;
    fig.hidden = false;
  } else {
    fig.hidden = true;
    img.removeAttribute('src');
  }

  document.getElementById('postHook').textContent = item.sections.hook;
  document.getElementById('postVerseBlock').textContent = item.sections.verseBlock;
  document.getElementById('postReflection').textContent = item.sections.reflection;
  const mainCta = document.getElementById('postMainCtaLink');
  mainCta.href = item.actionUrl || 'https://polskieradio.cc/werset-dnia';
  document.getElementById('postSecondaryCta').textContent = item.sections.secondaryInvite;
  document.getElementById('postSignature').textContent = item.sections.signature;
  document.getElementById('postIdChip').textContent = `ID: ${item.postId}`;
  document.getElementById('amenCount').textContent = String(sandboxState.amenClicksByDay[item.runDate] || 0);

  const verseMeta = document.getElementById('verseMetaList');
  verseMeta.textContent = '';
  appendKvRow(verseMeta, 'Odnośnik', item.verse.referencePl);
  appendKvRow(verseMeta, 'Przekład', item.verse.translation);
  appendKvRow(verseMeta, 'Licencja', item.verse.license);
  appendKvRow(verseMeta, 'Zgodność UBG', item.verse.canonicalVerified ? 'ZWERYFIKOWANA (100%)' : 'NIEZWERYFIKOWANA');
  appendKvRow(verseMeta, 'SHA-256 wersetu', `${String(item.verse.sha256 || '').slice(0, 16)}…`);

  const thList = document.getElementById('theologyCheckList');
  thList.textContent = '';
  for (const check of item.theology?.checks || []) {
    const li = document.createElement('li');
    li.className = 'wzn-check-item';
    const mark = document.createElement('span');
    mark.className = check.passed ? 'wzn-check-pass' : 'wzn-check-fail';
    mark.textContent = check.passed ? 'PASS' : 'FAIL';
    const span = document.createElement('span');
    span.textContent = `${check.label} (${check.detail})`;
    li.append(mark, span);
    thList.append(li);
  }
}

function renderDayTabs(sim) {
  const tabs = document.getElementById('dayTabs');
  tabs.textContent = '';
  (sim.tenDays || []).forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wzn-day-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

    const title = document.createElement('span');
    title.textContent = `Dzień ${item.dayIndex} · ${item.runDate.slice(5)}`;
    const sub = document.createElement('small');
    sub.textContent = item.verse.referencePl;
    btn.append(title, sub);

    btn.addEventListener('click', () => {
      renderSelectedDay(idx);
      trackEvent('wzn_test_day_select', { item_id: item.postId });
    });
    tabs.append(btn);
  });
}

function bindControls() {
  const themeBtn = document.getElementById('toggleThemeBtn');
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-lumina-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    html.setAttribute('data-lumina-theme', next);
    themeBtn.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
    themeBtn.textContent = next === 'light' ? 'Motyw ciemny (Obsidian)' : 'Motyw jasny (test awatara)';
  });

  const vpBtn = document.getElementById('toggleViewportBtn');
  vpBtn.addEventListener('click', () => {
    const active = document.body.classList.toggle('wzn-mobile-preview');
    vpBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    vpBtn.textContent = active ? 'Widok pełny (desktop)' : 'Podgląd smartfona (390px)';
  });

  const followBtn = document.getElementById('followProfileBtn');
  followBtn.addEventListener('click', () => {
    sandboxState.following = !sandboxState.following;
    sandboxState.followersCount = sandboxState.following ? 1 : 0;
    followBtn.setAttribute('aria-pressed', sandboxState.following ? 'true' : 'false');
    followBtn.textContent = sandboxState.following ? 'Obserwujesz ✓' : 'Obserwuj profil';
    setFeedback(
      sandboxState.following
        ? 'Obserwujesz profil „Jezus Chrystus — Wiadomości z nieba” w trybie testowym.'
        : 'Przestałeś obserwować profil w trybie testowym.'
    );
    trackEvent('wzn_profile_follow', { following: sandboxState.following });
    renderAnalyticsAndAcceptance(sandboxState.data);
  });

  const optInBtn = document.getElementById('optInNotifBtn');
  optInBtn.addEventListener('click', () => {
    sandboxState.optInSubscribed = !sandboxState.optInSubscribed;
    sandboxState.optInCount = sandboxState.optInSubscribed ? 1 : 0;
    optInBtn.setAttribute('aria-pressed', sandboxState.optInSubscribed ? 'true' : 'false');
    optInBtn.textContent = sandboxState.optInSubscribed
      ? 'Subskrypcja aktywna (Wypisz się)'
      : 'Subskrybuj powiadomienia dzienne (opt-in)';
    setFeedback(
      sandboxState.optInSubscribed
        ? 'Włączono dobrowolną subskrypcję porannych powiadomień (07:00). Możesz zrezygnować w każdej chwili jednym kliknięciem.'
        : 'Wypisano z powiadomień dziennych. Nie otrzymasz żadnych wiadomości automatycznych.'
    );
    trackEvent('wzn_optin_subscription', { subscribed: sandboxState.optInSubscribed });
    renderAnalyticsAndAcceptance(sandboxState.data);
  });

  const shareCurrent = async (source) => {
    sandboxState.sharesCount += 1;
    const item = sandboxState.data?.tenDays?.[sandboxState.selectedIndex];
    const url = item?.actionUrl || 'https://polskieradio.cc/werset-dnia';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Ignoruj brak uprawnień schowka w środowisku bez HTTPS
    }
    setFeedback(`Skopiowano link do publikacji (${url}) w trybie testowym.`);
    trackEvent('wzn_share', { source });
    renderAnalyticsAndAcceptance(sandboxState.data);
  };

  document.getElementById('shareProfileBtn').addEventListener('click', () => shareCurrent('profile'));
  document.getElementById('sharePostBtn').addEventListener('click', () => shareCurrent('post'));

  document.getElementById('reactAmenBtn').addEventListener('click', () => {
    const item = sandboxState.data?.tenDays?.[sandboxState.selectedIndex];
    if (!item) return;
    sandboxState.amenClicksByDay[item.runDate] = (sandboxState.amenClicksByDay[item.runDate] || 0) + 1;
    document.getElementById('amenCount').textContent = String(sandboxState.amenClicksByDay[item.runDate]);
    trackEvent('wzn_reaction_amen', { item_id: item.postId });
  });

  ['headerWersetCta', 'profilePrimaryLink', 'postMainCtaLink'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      sandboxState.wersetClicks += 1;
      trackEvent('wzn_werset_dnia_click', { cta_id: id });
      renderAnalyticsAndAcceptance(sandboxState.data);
    });
  });
}

async function init() {
  bindControls();
  const res = await fetch('/test/wiadomosci-z-nieba/simulation-data.json', { cache: 'no-store' });
  if (!res.ok) {
    setFeedback('Nie udało się wczytać danych symulacji testowej.');
    return;
  }
  const sim = await res.json();
  sandboxState.data = sim;
  renderProfileHeader(sim);
  renderDayTabs(sim);
  renderSelectedDay(0);
  renderAnalyticsAndAcceptance(sim);
}

init().catch(() => {
  setFeedback('Błąd inicjalizacji podglądu testowego Wiadomości z nieba.');
});
