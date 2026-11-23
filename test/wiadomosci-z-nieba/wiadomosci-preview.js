// Wiadomość z Nieba — wersja premium (@007, L0 23.11.2026).
// Dane: simulation-data.json (pipeline Antigravity, wersety UBG-2025 zweryfikowane). Zero kosztów, zero zewnętrznych API.
const DATA_URL = '/test/wiadomosci-z-nieba/simulation-data.json';
const TEMPLATE_IMG = '/images/wiadomosc-z-nieba/szablon-1x1.jpg';
const SITE_URL = 'https://polskieradio.cc/test/wiadomosci-z-nieba/';

const $ = (id) => document.getElementById(id);
const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

let days = [];
let current = 0;

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}
function longDate(iso) {
  const dt = parseDate(iso);
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}
function todayWarsaw() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
}
function stripEmoji(s) {
  return String(s || '').replace(/^[\p{Extended_Pictographic}️‍\s]+/u, '').trim();
}
function themeShort(label) {
  return String(label || '').split('—')[0].trim();
}

function cardMarkup(day) {
  const card = document.createElement('div');
  card.className = 'wzn-card-text';
  const label = document.createElement('span');
  label.className = 'wzn-card-label';
  label.textContent = 'Masz nową wiadomość';
  const verse = document.createElement('p');
  verse.className = 'wzn-card-verse';
  verse.textContent = `„${day.verse.text}”`;
  const ref = document.createElement('span');
  ref.className = 'wzn-card-ref';
  ref.textContent = day.verse.referencePl;
  const small = document.createElement('small');
  small.textContent = 'Biblia UBG-2025';
  ref.append(small);
  card.append(label, verse, ref);
  return card;
}

// Dopasowanie wielkości wersetu do czarnego pola szablonu (długie wersety = mniejsza czcionka).
function fitCard(cardEl) {
  const box = cardEl.querySelector('.wzn-card-text');
  const verse = cardEl.querySelector('.wzn-card-verse');
  if (!box || !verse || !cardEl.clientWidth) return;
  let size = 4.6;
  verse.style.fontSize = `${size}cqw`;
  while (box.scrollHeight > box.clientHeight + 1 && size > 2.4) {
    size -= 0.2;
    verse.style.fontSize = `${size}cqw`;
  }
}

function renderCard(target, day) {
  target.replaceChildren(cardMarkup(day));
  target.setAttribute('role', 'img');
  target.setAttribute('aria-label', `Grafika Wiadomość z Nieba: „${day.verse.text}” — ${day.verse.referencePl}`);
  requestAnimationFrame(() => fitCard(target));
}

function renderTabs() {
  const track = $('dayTabs');
  track.replaceChildren();
  days.forEach((day, i) => {
    const dt = parseDate(day.runDate);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wzn-day';
    b.id = `tab-${day.runDate}`;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'messagePanel');
    b.setAttribute('aria-label', longDate(day.runDate));
    b.innerHTML = `${WEEKDAYS[dt.getUTCDay()]}<strong>${dt.getUTCDate()}</strong>${MONTHS[dt.getUTCMonth()].slice(0, 3)}`;
    b.addEventListener('click', () => select(i, true));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + days.length) % days.length;
        select(n, true);
        $(`tab-${days[n].runDate}`).focus();
      }
    });
    track.append(b);
  });
}

function renderArchive() {
  const grid = $('archiveGrid');
  grid.replaceChildren();
  days.forEach((day, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wzn-tile';
    b.dataset.index = String(i);
    const card = document.createElement('div');
    card.className = 'wzn-card';
    renderCard(card, day);
    card.setAttribute('aria-hidden', 'true');
    card.removeAttribute('role');
    const meta = document.createElement('span');
    meta.className = 'wzn-tile-meta';
    meta.innerHTML = `<strong></strong><br>`;
    meta.querySelector('strong').textContent = longDate(day.runDate);
    meta.append(document.createTextNode(themeShort(day.themeLabel)));
    b.setAttribute('aria-label', `${longDate(day.runDate)}: ${day.verse.referencePl}`);
    b.append(card, meta);
    b.addEventListener('click', () => {
      select(i, true);
      $('wiadomosc').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    li.append(b);
    grid.append(li);
  });
}

function renderOps(day) {
  const kv = $('verseMetaList');
  kv.replaceChildren();
  const rows = [
    ['Werset', day.verse.referencePl],
    ['Przekład', day.verse.translation],
    ['Licencja', day.verse.license],
    ['Zweryfikowany', day.verse.canonicalVerified ? 'tak' : 'NIE'],
    ['SHA-256', String(day.verse.sha256 || '').slice(0, 16) + '…'],
    ['ID wpisu', day.postId],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v || '—';
    kv.append(dt, dd);
  }
  const ul = $('theologyCheckList');
  ul.replaceChildren();
  for (const c of day.theology?.checks || []) {
    const li = document.createElement('li');
    li.textContent = c.label;
    if (!c.passed) li.className = 'fail';
    ul.append(li);
  }
}

function select(i, fromUser = false) {
  current = i;
  const day = days[i];
  document.querySelectorAll('.wzn-day').forEach((b, n) => {
    b.setAttribute('aria-selected', String(n === i));
    b.tabIndex = n === i ? 0 : -1;
  });
  document.querySelectorAll('.wzn-tile').forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
  $('messagePanel').setAttribute('aria-labelledby', `tab-${day.runDate}`);
  const isToday = day.runDate === todayWarsaw();
  $('wznTodayKicker').textContent = isToday ? `Wiadomość na dziś · ${longDate(day.runDate)}` : `Wiadomość z dnia ${longDate(day.runDate)}`;
  $('msgTheme').textContent = themeShort(day.themeLabel);
  $('msgHook').textContent = stripEmoji(day.sections.hook);
  $('msgVerse').textContent = `„${day.verse.text}”`;
  $('msgRef').textContent = `${day.verse.referencePl} · UBG-2025`;
  $('msgReflection').textContent = day.sections.reflection;
  $('actionFeedback').textContent = '';
  renderCard($('mainCard'), day);
  renderOps(day);
  if (fromUser) history.replaceState(null, '', `#dzien-${day.runDate}`);
  const active = $(`tab-${day.runDate}`);
  if (active && fromUser) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
}

// ── Grafika 1080×1080 (PNG) generowana w przeglądarce na szablonie L0 ──
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}
async function renderPng(day) {
  await document.fonts.ready;
  await Promise.all([
    document.fonts.load('italic 600 48px "Cormorant Garamond"'),
    document.fonts.load('600 28px "Cinzel"'),
  ]).catch(() => {});
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(await loadImage(TEMPLATE_IMG), 0, 0, S, S);
  const x = S * 0.45, w = S * 0.5, top = S * 0.23, bottom = S * 0.83;
  const verseText = `„${day.verse.text}”`;
  let size = 50, lines, lh;
  for (; size >= 26; size -= 2) {
    ctx.font = `italic 600 ${size}px "Cormorant Garamond", Georgia, serif`;
    lines = wrapLines(ctx, verseText, w);
    lh = size * 1.28;
    if (lines.length * lh + 160 <= bottom - top) break;
  }
  const blockH = 60 + lines.length * lh + 30 + 70;
  let y = top + Math.max(0, (bottom - top - blockH) / 2);
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ff3b3b';
  ctx.font = '600 22px "Cinzel", Georgia, serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('MASZ NOWĄ WIADOMOŚĆ', x, y);
  ctx.letterSpacing = '0px';
  const grad = ctx.createLinearGradient(x, 0, x + 100, 0);
  grad.addColorStop(0, '#ff3b3b'); grad.addColorStop(1, 'rgba(255,59,59,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + 40, 100, 4);
  y += 60;
  ctx.font = `italic 600 ${size}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 12;
  for (const l of lines) { ctx.fillText(l, x, y); y += lh; }
  ctx.shadowBlur = 0;
  y += 30;
  ctx.fillStyle = '#d9d9de';
  ctx.font = '600 28px "Cinzel", Georgia, serif';
  ctx.fillText(day.verse.referencePl, x, y);
  ctx.fillStyle = '#9a9aa3';
  ctx.font = '500 20px "Inter", system-ui, sans-serif';
  ctx.fillText('Biblia UBG-2025', x, y + 40);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function postText(day) {
  return day.bodyText || [day.sections.hook, day.sections.verseBlock, day.sections.reflection, day.sections.ctaBlock, day.sections.signature].join('\n\n');
}
function feedback(msg) { $('actionFeedback').textContent = msg; }

function bindActions() {
  $('downloadBtn').addEventListener('click', async () => {
    const day = days[current];
    feedback('Przygotowuję grafikę…');
    try {
      const blob = await renderPng(day);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `wiadomosc-z-nieba-${day.runDate}.png`;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      feedback('Grafika 1080×1080 pobrana.');
    } catch {
      feedback('Nie udało się przygotować grafiki. Spróbuj ponownie.');
    }
  });
  $('shareBtn').addEventListener('click', async () => {
    const day = days[current];
    const url = `${SITE_URL}#dzien-${day.runDate}`;
    const text = `„${day.verse.text}” — ${day.verse.referencePl}`;
    try {
      if (navigator.share) {
        const blob = await renderPng(day).catch(() => null);
        const file = blob ? new File([blob], `wiadomosc-z-nieba-${day.runDate}.png`, { type: 'image/png' }) : null;
        if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'Wiadomość z Nieba', text, url, files: [file] });
        else await navigator.share({ title: 'Wiadomość z Nieba', text, url });
        feedback('Dziękujemy za udostępnienie.');
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        feedback('Link skopiowany do schowka.');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') feedback('Nie udało się udostępnić. Skopiuj link z paska adresu.');
    }
  });
  // Zgoda opt-in: zapamiętana tylko na tym urządzeniu; w TEST nic nie jest wysyłane.
  const optBtn = $('optInNotifBtn');
  const KEY = 'wzn_optin_test';
  const setOpt = (on) => {
    optBtn.setAttribute('aria-pressed', String(on));
    optBtn.textContent = on ? 'Zgoda zapisana — wyłącz' : 'Chcę dostawać wiadomość codziennie';
  };
  try { setOpt(localStorage.getItem(KEY) === '1'); } catch { setOpt(false); }
  optBtn.addEventListener('click', () => {
    const on = optBtn.getAttribute('aria-pressed') !== 'true';
    setOpt(on);
    try { on ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch { /* tryb prywatny */ }
    $('optInNote').textContent = on
      ? 'Dziękujemy. Zgoda zapisana na tym urządzeniu. W wersji testowej powiadomienia nie są jeszcze wysyłane.'
      : 'Zgoda wycofana. Nie otrzymasz żadnych powiadomień — brak automatycznych wiadomości prywatnych.';
  });

  $('copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(postText(days[current]));
      feedback('Tekst posta skopiowany do schowka.');
    } catch {
      feedback('Schowek niedostępny w tej przeglądarce.');
    }
  });
}

async function init() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  const data = await res.json();
  days = [...(data.tenDays || [])].sort((a, b) => a.runDate.localeCompare(b.runDate));
  const p = data.profile || {};
  $('profileBio').textContent = p.bio || '';
  $('profileDisclosure').textContent = p.editorialDisclosure || '';
  renderTabs();
  renderArchive();
  bindActions();
  const hashDate = (location.hash.match(/dzien-(\d{4}-\d{2}-\d{2})/) || [])[1];
  const today = todayWarsaw();
  let idx = days.findIndex((d) => d.runDate === hashDate);
  if (idx < 0) idx = days.findIndex((d) => d.runDate === today);
  if (idx < 0) { const past = days.map((d, n) => [d, n]).filter(([d]) => d.runDate <= today); idx = past.length ? past.at(-1)[1] : 0; }
  select(idx);
  const refit = () => document.querySelectorAll('.wzn-card').forEach(fitCard);
  document.fonts?.ready.then(refit);
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(refit, 150); });
}

init().catch(() => {
  $('wznTodayTitle').textContent = 'Nie udało się wczytać wiadomości';
  $('msgReflection').textContent = 'Odśwież stronę albo odwiedź polskieradio.cc/werset-dnia.';
});
