const state = {
  data: null,
  activeIndex: 0,
};

function el(id) {
  return document.getElementById(id);
}

function renderActiveCycle() {
  const { data, activeIndex } = state;
  if (!data || !data.cycles || !data.cycles[activeIndex]) return;
  const c = data.cycles[activeIndex];

  const tabs = el('cycleTabs').querySelectorAll('button');
  tabs.forEach((btn, idx) => {
    btn.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
  });

  el('postSeriesHeading').textContent = `${c.seriesLabel} (${c.jobId})`;
  el('postSchedulePill').textContent = `${c.weekdayName} · ${c.scheduledForWarsaw.slice(0, 16).replace('T', ' ')} (${c.graphicDimensions})`;

  const land = el('landscapeGraphic');
  land.src = c.graphicUrl;
  land.alt = c.altText;

  const sq = el('squareGraphic');
  sq.src = c.squareGraphicUrl;
  sq.alt = `${c.altText} — format 1:1`;

  const dlLand = el('downloadLandscapeBtn');
  dlLand.href = c.graphicUrl;
  dlLand.download = `${c.jobId}-1068x630.png`;

  const dlSq = el('downloadSquareBtn');
  dlSq.href = c.squareGraphicUrl;
  dlSq.download = `${c.jobId}-1080x1080.png`;

  el('sourcePatroniteId').textContent = c.sourcePatroniteJobId || '—';
  el('postStatus').textContent = `${c.status} (${c.qaOverall})`;
  el('postLengths').textContent = `Tytuł ${c.charCounts.title} zn. · Zajawka ${c.charCounts.teaser} zn. · Treść ${c.charCounts.body} zn.`;

  el('postTitle').textContent = c.title;
  el('postTeaser').textContent = c.teaser;

  const bodyBox = el('postBody');
  bodyBox.innerHTML = '';
  for (const para of String(c.body || '').split(/\n\n+/)) {
    const p = document.createElement('p');
    p.textContent = para;
    bodyBox.appendChild(p);
  }

  el('postQuestion').textContent = c.question;
  el('postCta').textContent = c.cta;
  el('postHashtags').textContent = (c.hashtags || []).join(' ');
  el('postAlt').textContent = c.altText;

  const qaList = el('qaList');
  qaList.innerHTML = '';
  for (const chk of c.qaChecks || []) {
    const li = document.createElement('li');
    li.className = 'pt-qa-item';
    const badge = document.createElement('span');
    badge.className = 'pt-qa-badge';
    badge.textContent = chk.status;
    const title = document.createElement('strong');
    title.textContent = chk.name;
    const msg = document.createElement('small');
    msg.textContent = chk.message;
    li.append(badge, title, msg);
    qaList.appendChild(li);
  }

  const sourcesList = el('sourcesList');
  sourcesList.innerHTML = '';
  for (const src of c.sources || []) {
    const li = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = `[${src.status}] ${src.sourceName}`;
    const meta = document.createElement('small');
    meta.textContent = `Dowód: ${src.sourceRef} · Data: ${src.verifiedDate}`;
    li.append(title, meta);
    sourcesList.appendChild(li);
  }
}

async function copyText(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    el('copyStatus').textContent = successMsg;
  } catch {
    el('copyStatus').textContent = 'Schowek zablokowany przez przeglądarkę — zaznacz tekst ręcznie.';
  }
  setTimeout(() => { el('copyStatus').textContent = ''; }, 3200);
}

async function init() {
  const res = await fetch('/test/zrzutka/simulation-data.json', { cache: 'no-store' });
  const data = await res.json();
  state.data = data;

  el('approvalStatusVal').textContent = data.productionApprovedByOwner
    ? 'ZATWIERDZONO L0 (HARMONOGRAM AKTYWNY)'
    : 'OCZEKUJE NA ZGODĘ L0 (BLOKADA LIVE)';
  el('adapterNoteVal').textContent = data.integrationStatus?.activeAdapter || 'ZrzutkaDraftPackagePublisher';
  el('killSwitchVal').textContent = data.killSwitch
    ? 'WYŁĄCZNIK AWARYJNY AKTYWNY'
    : 'PON 07:00→09:00 · ŚR 16:00→18:00 · PT 08:00→10:00';
  el('simSummaryVal').textContent = `${data.cyclesCount} / ${data.cyclesCount} cykli · QA 12/12 PASS`;
  if (data.integrationStatus?.note) {
    el('integrationNoteText').textContent = data.integrationStatus.note;
  }

  const tabsContainer = el('cycleTabs');
  tabsContainer.innerHTML = '';
  data.cycles.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pt-tab-btn';
    btn.role = 'tab';
    btn.textContent = `${idx + 1}. ${c.weekdayName} (${c.scheduledForWarsaw.slice(5, 10)}) — ${c.seriesLabel}`;
    btn.addEventListener('click', () => {
      state.activeIndex = idx;
      renderActiveCycle();
    });
    tabsContainer.appendChild(btn);
  });

  el('toggleViewportBtn').addEventListener('click', () => {
    const ws = el('previewWorkspace');
    const active = ws.classList.toggle('pt-mobile-sim');
    el('toggleViewportBtn').setAttribute('aria-pressed', active ? 'true' : 'false');
    el('toggleViewportBtn').textContent = active ? 'Widok desktop (1280px)' : 'Podgląd smartfona (390px)';
  });

  el('copyFullUpdateBtn').addEventListener('click', async () => {
    const c = state.data.cycles[state.activeIndex];
    const full = c.zrzutkaPlainText || `${c.title}\n\n${c.teaser}\n\n${c.body}\n\n${(c.hashtags || []).join(' ')}`;
    await copyText(full, 'Skopiowano pełną aktualizację na Zrzutka.pl (rs4g4v)!');
  });

  el('copyTitleBtn').addEventListener('click', async () => {
    const c = state.data.cycles[state.activeIndex];
    await copyText(c.title, 'Skopiowano tytuł aktualizacji!');
  });

  renderActiveCycle();
}

init().catch(err => {
  console.error('Błąd ładowania symulacji Zrzutka.pl:', err);
});
